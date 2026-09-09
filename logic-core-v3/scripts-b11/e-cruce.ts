/**
 * E · EL CRUCE — cada bloque de texto contra el mapa de cobertura del logo, a
 * lo largo del tramo entero. Nada de acá abre el navegador.
 *
 *     npx tsx scripts-b11/e-cruce.ts --etiqueta=antes [--perfil=1440,1920,2560]
 *
 * Lee los mapas exactos de `a-logo.ts` (`.b11-capturas/mapa-*.b11m`) y las
 * cajas aterrizadas de `b-bloques.ts` (`outputs/b11/bloques-<etiqueta>-<perfil>.json`)
 * y contesta, por bloque, la pregunta de la instrucción: **¿qué fracción de
 * este texto queda debajo del logo en ALGÚN momento en que está en cuadro?**
 * (`algunaVez`), y cuánto tiempo de su ventana lo pasa tapado (`delTiempo`).
 * Es geometría del documento —la caja del bloque contra la unión de siluetas—
 * y complementa al píxel de `b-bloques`: el píxel dice si HOY se lee; el cruce
 * dice si va a leerse en cualquier punto del recorrido, que es lo que decide
 * dónde mover el bloque.
 *
 * Además de la caja publica los dos mapas secundarios: las motas de día (lo que
 * hunde el peor píxel del hero) y lo brillante (las partículas de la noche de
 * Trabajos), con la misma cuenta.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { RAIZ_DE_SALIDAS, TEMP, argumento, capturaPendiente, jsonPendiente, mudarPendientes, PERFILES_DE_B11 } from './b11-comun'
import { coberturaDeCaja, deserializarMapa, renderizar, type Cobertura, type MapaDeCobertura } from './mapa'
import type { CajaAterrizada } from './b-bloques'

interface SeccionDeBloques {
  readonly id: string
  readonly superficieAlMedir: string
  readonly top: number
  readonly alto: number
  readonly cajasAterrizadas: readonly CajaAterrizada[]
  readonly peorPorBloque: readonly { readonly clave: string; readonly peorContraste: number; readonly pasaAA: boolean; readonly bajoAA: number; readonly pixelesDeGlifo: number; readonly sobreElLogo: number }[]
}

interface Cruce {
  readonly clave: string
  readonly texto: string
  readonly grande: boolean
  readonly caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number; readonly espacio: string }
  /** El mapa de AA de la tinta de la sección, al umbral del bloque (4,5 o 3 si es grande): la cuenta que decide. */
  readonly aa: Cobertura
  /** Las motas de AA de la tinta: la fracción de la caja que alguna parada vio bajo una partícula. No se arregla moviendo el texto. */
  readonly aaMotas: Cobertura
  readonly logo: Cobertura
  readonly motas: Cobertura
  readonly brillo: Cobertura
  readonly oscuridad: Cobertura
  readonly peorContraste: number | null
  readonly pasaAA: boolean | null
}

function leerMapa(que: string, seccion: string, perfil: string): MapaDeCobertura | null {
  const ruta = `${TEMP}/mapa-${que}-${seccion}-${perfil}.b11m`
  return existsSync(ruta) ? deserializarMapa(readFileSync(ruta)) : null
}

const f = (c: Cobertura): string => (Number.isNaN(c.algunaVez) ? '   —  ' : `${(c.algunaVez * 100).toFixed(0).padStart(3)} %`)
const t = (c: Cobertura): string => (Number.isNaN(c.delTiempo) ? '  —  ' : `${(c.delTiempo * 100).toFixed(0).padStart(3)} %`)

function cruzarUnPerfil(etiqueta: string, perfil: string): Record<string, unknown> {
  const ruta = `${RAIZ_DE_SALIDAS}/bloques-${etiqueta}-${perfil}.json`
  const json = JSON.parse(readFileSync(ruta, 'utf8')) as { readonly secciones: readonly SeccionDeBloques[] }
  const salida: Record<string, unknown> = {}
  console.log(`\n═══ ${perfil} «${etiqueta}» — ${ruta}`)
  for (const sec of json.secciones) {
    const tinta = sec.superficieAlMedir.startsWith('oscuro') ? 'clara' : 'oscura'
    const mapas = { logo: leerMapa('logo', sec.id, perfil), motas: leerMapa('motas', sec.id, perfil), brillo: leerMapa('brillo', sec.id, perfil), oscuridad: leerMapa('oscuridad', sec.id, perfil), aa: leerMapa(`aa-${tinta}`, sec.id, perfil), aa3: leerMapa(`aa3-${tinta}`, sec.id, perfil), aaMotas: leerMapa(`aa-motas-${tinta}`, sec.id, perfil) }
    if (mapas.logo === null || mapas.aa === null || mapas.aa3 === null) {
      console.log(`── ${sec.id}: sin mapa de ${perfil} (corré a-logo primero)`)
      continue
    }
    const sinDato: Cobertura = { algunaVez: Number.NaN, delTiempo: Number.NaN, pixeles: 0 }
    const cruces: Cruce[] = sec.cajasAterrizadas.map((c) => {
      // La caja aterrizada está en coordenadas del documento; el mapa de una sección
      // que scrollea arranca en su `top`. El pin (viewport) arranca en cero.
      const caja = { x: c.x, y: c.espacio === 'documento' ? c.y - sec.top : c.y, ancho: c.ancho, alto: c.alto }
      const peor = sec.peorPorBloque.find((b) => b.clave === c.clave)
      const mapaDeAA = (c.grande ? mapas.aa3 : mapas.aa) as MapaDeCobertura
      return {
        clave: c.clave,
        texto: c.texto,
        grande: c.grande,
        caja: { ...caja, espacio: c.espacio },
        aa: coberturaDeCaja(mapaDeAA, caja),
        aaMotas: mapas.aaMotas === null ? sinDato : coberturaDeCaja(mapas.aaMotas, caja),
        logo: coberturaDeCaja(mapas.logo as MapaDeCobertura, caja),
        motas: mapas.motas === null ? sinDato : coberturaDeCaja(mapas.motas, caja),
        brillo: mapas.brillo === null ? sinDato : coberturaDeCaja(mapas.brillo, caja),
        oscuridad: mapas.oscuridad === null ? sinDato : coberturaDeCaja(mapas.oscuridad, caja),
        peorContraste: peor?.peorContraste ?? null,
        pasaAA: peor?.pasaAA ?? null,
      }
    })
    console.log(`── ${sec.id} · tinta ${tinta} · ${cruces.length} bloques · mapa ${mapas.logo.paradas} paradas con logo${mapas.oscuridad === null ? '' : `, ${mapas.oscuridad.paradas} a oscuras`}`)
    console.log('    bloque                                        x      y   ancho   ESTRUCTURA bajo AA alguna vez · del tiempo   motas AA   logo   brillo   oscuro   peor px  AA')
    for (const c of cruces.slice().sort((a, b) => (Number.isNaN(b.aa.algunaVez) ? -1 : b.aa.algunaVez) - (Number.isNaN(a.aa.algunaVez) ? -1 : a.aa.algunaVez))) {
      console.log(`    «${c.texto.slice(0, 40).padEnd(40)}» ${String(Math.round(c.caja.x)).padStart(5)} ${String(Math.round(c.caja.y)).padStart(6)} ${String(Math.round(c.caja.ancho)).padStart(6)}   ${f(c.aa)} · ${t(c.aa)}${c.grande ? ' (3:1)' : '      '}         ${f(c.aaMotas)}   ${f(c.logo)}  ${f(c.brillo)}  ${f(c.oscuridad)}   ${c.peorContraste === null ? '  —  ' : c.peorContraste.toFixed(2).padStart(5)}  ${c.pasaAA === null ? '?' : c.pasaAA ? '✓' : '✗'}`)
    }
    // Los mapas del reporte: el de AA de su tinta y el del logo, con las cajas aterrizadas encima.
    const cajas = cruces.map((c) => c.caja)
    for (const [que, mapa] of [[`aa-${tinta}`, mapas.aa], ['logo', mapas.logo]] as const) {
      const nombre = `cruce-${etiqueta}-${que}-${sec.id}-${perfil}.png`
      const ruta = `${TEMP}/${nombre}`
      writeFileSync(ruta, renderizar(mapa as MapaDeCobertura, cajas))
      capturaPendiente(ruta, nombre)
    }
    const tapados = cruces.filter((c) => c.aa.algunaVez > 0)
    const bajoElLogo = cruces.filter((c) => c.logo.algunaVez > 0)
    console.log(`    ⇒ ${tapados.length} de ${cruces.length} bloques cruzan una zona bajo AA en algún punto del tramo (${bajoElLogo.length} pasan por debajo del logo) · ${cruces.filter((c) => c.pasaAA === false).length} fallan AA en el píxel`)
    salida[sec.id] = { tinta, top: sec.top, alto: sec.alto, paradasConLogo: mapas.logo.paradas, paradasAOscuras: mapas.oscuridad?.paradas ?? 0, cruces }
  }
  return salida
}

function principal(): void {
  const etiqueta = argumento('etiqueta', 'antes')
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  const todo: Record<string, unknown> = {}
  for (const p of perfiles) todo[p] = cruzarUnPerfil(etiqueta, p)
  jsonPendiente(`cruce-${etiqueta}`, { etiqueta, perfiles: todo })
  for (const r of mudarPendientes()) console.log(`escrito: ${r}`)
}

principal()
