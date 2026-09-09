/**
 * H · LA ZONA LIBRE EN COLUMNAS DE LA COMPOSICIÓN — por sección, por pantalla y
 * por ancho. Nada de acá abre el navegador.
 *
 *     npx tsx scripts-b11/h-columnas.ts [--perfil=1440,1920,2560] [--umbral=4.5|3]
 *
 * Cruza dos cosas que ya están medidas: los bordes de columna de cada grilla
 * (`g-grillas.ts` → `outputs/b11/grillas.json`) y los mapas exactos de
 * cobertura de `a-logo.ts` (`.b11-capturas/*.b11m`). Para cada sección toma la
 * grilla en la que su texto se posiciona —la composición de doce de Quiénes
 * somos y Números, la de cinco del hero y de la foto, la de tres del
 * diferencial y del pie— y publica, por columna y por pantalla de la sección,
 * qué fracción de esa celda estuvo bajo AA para la tinta de la sección ALGUNA
 * vez a lo largo del tramo, sólo por la estructura (logo, sombra, luz; las motas
 * van aparte). Es la tabla de la que sale el plan: una columna con 0 % en toda
 * la pantalla es una columna donde el texto vive.
 *
 * ⚠️ El pin de Trabajos se cruza en coordenadas del viewport, como su mapa.
 */

import { existsSync, readFileSync } from 'node:fs'

import { LAS_SEIS, PERFILES_DE_B11, RAIZ_DE_SALIDAS, TEMP, argumento } from './b11-comun'
import { coberturaDeCaja, deserializarMapa, pct, type MapaDeCobertura } from './mapa'

interface Grilla {
  readonly pieza: string
  readonly nombre: string | null
  readonly pantalla: string | null
  readonly x: number
  readonly ancho: number
  readonly topDoc: number
  readonly columnas: number
  readonly bordes: readonly { readonly desde: number; readonly hasta: number }[]
}

interface Grillas {
  readonly perfiles: Readonly<Record<string, { readonly ventana: { readonly ancho: number; readonly alto: number }; readonly secciones: Readonly<Record<string, { readonly grillas: readonly Grilla[] }>> }>>
}

interface Logo {
  readonly ventana: number
  readonly secciones: Readonly<Record<string, { readonly tinta: string; readonly tipo: string; readonly top: number; readonly alto: number }>>
}

/** Qué grilla es la que posiciona el texto de cada sección, por nombre o por columnas. */
const GRILLA_DE: Readonly<Record<string, (g: Grilla) => boolean>> = {
  hero: (g) => g.pieza === 'grilla' && g.nombre === '5',
  'quienes-somos': (g) => g.pieza === 'composicion' || (g.pieza === 'grilla' && g.nombre === '5'),
  numeros: (g) => g.pieza === 'composicion',
  trabajos: (g) => g.pieza === 'grilla' && g.nombre === '3',
  'por-que-develop': (g) => g.pieza === 'grilla' && g.nombre === '3',
  cierre: (g) => g.pieza === 'grilla' && g.nombre === '3',
}

function leerMapa(que: string, seccion: string, perfil: string): MapaDeCobertura | null {
  const ruta = `${TEMP}/mapa-${que}-${seccion}-${perfil}.b11m`
  return existsSync(ruta) ? deserializarMapa(readFileSync(ruta)) : null
}

function principal(): void {
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  const umbral = argumento('umbral', '4.5')
  const grillas = JSON.parse(readFileSync(`${RAIZ_DE_SALIDAS}/grillas.json`, 'utf8')) as Grillas
  for (const perfil of perfiles) {
    const g = grillas.perfiles[perfil]
    const rutaLogo = `${RAIZ_DE_SALIDAS}/logo-${perfil}.json`
    if (g === undefined || !existsSync(rutaLogo)) {
      console.log(`\n═══ ${perfil}: faltan grillas o logo-${perfil}.json`)
      continue
    }
    const logo = JSON.parse(readFileSync(rutaLogo, 'utf8')) as Logo
    const V = logo.ventana
    console.log(`\n═══════════ ${perfil} — ventana ${g.ventana.ancho}×${V} · umbral ${umbral}:1 · % de la celda bajo AA (estructura) alguna vez en el tramo; entre paréntesis, % bajo el logo`)
    for (const id of LAS_SEIS) {
      const sec = logo.secciones[id]
      const grillasDeLaSeccion = (g.secciones[id]?.grillas ?? []).filter(GRILLA_DE[id])
      if (sec === undefined || grillasDeLaSeccion.length === 0) {
        console.log(`── ${id}: sin grilla o sin mapa`)
        continue
      }
      const que = `${umbral === '3' ? 'aa3' : 'aa'}-${sec.tinta}`
      const mapaAA = leerMapa(que, id, perfil)
      const mapaLogo = leerMapa('logo', id, perfil)
      if (mapaAA === null || mapaLogo === null) {
        console.log(`── ${id}: sin mapa ${que}`)
        continue
      }
      const pantallas = sec.tipo === 'viewport' ? 1 : Math.max(1, Math.round(sec.alto / V))
      // Una grilla por nombre+pantalla: la de Números se repite cuatro veces con las mismas columnas.
      const vistas = new Map<string, Grilla>()
      for (const gr of grillasDeLaSeccion) vistas.set(`${gr.nombre}|${gr.columnas}|${Math.round(gr.x)}`, gr)
      for (const gr of vistas.values()) {
        console.log(`── ${id} · tinta ${sec.tinta} · grilla «${gr.nombre}» de ${gr.columnas} columnas, x ${Math.round(gr.x)}–${Math.round(gr.x + gr.ancho)}`)
        const cabecera = gr.bordes.map((_, i) => `c${String(i + 1).padStart(2)}`).join('     ')
        console.log(`      pantalla      ${cabecera}`)
        for (let k = 0; k < pantallas; k += 1) {
          const celdas = gr.bordes.map((b) => {
            const caja = { x: b.desde, y: k * V, ancho: b.hasta - b.desde, alto: V }
            return { aa: coberturaDeCaja(mapaAA, caja), logo: coberturaDeCaja(mapaLogo, caja) }
          })
          console.log(`      ${String(k + 1).padStart(8)}      ${celdas.map((c) => `${pct(c.aa.algunaVez)}(${pct(c.logo.algunaVez).trim().padStart(3)})`).join(' ')}`)
        }
        // Y las medias pantallas, para ver dónde dentro de la pantalla cae el obstáculo.
        for (let k = 0; k < pantallas * 2; k += 1) {
          const celdas = gr.bordes.map((b) => coberturaDeCaja(mapaAA, { x: b.desde, y: (k * V) / 2, ancho: b.hasta - b.desde, alto: V / 2 }))
          console.log(`      ½p ${String(k + 1).padStart(6)}     ${celdas.map((c) => `${pct(c.algunaVez)}     `).join(' ')}`)
        }
      }
    }
  }
}

principal()
