/**
 * A · DÓNDE ESTÁ EL LOGO A LO LARGO DEL TRAMO — el barrido fino de la silueta,
 * y la zona que deja libre en las coordenadas del texto.
 *
 *     npx tsx scripts-b11/a-logo.ts [--perfil=1440,1920,2560] [--paso=16] [--solo=hero,quienes-somos,numeros]
 *
 * ⚠️ **Por tajadas, y por qué.** Esta máquina corre con ~1 GB libre (el Chrome
 * del humano, dos dev servers) y el arnés mata los procesos de fondo cuando la
 * memoria baja: un barrido de 194 paradas a 2560 murió dos veces a mitad de
 * camino. Así que el barrido se parte en tajadas de secciones (`--solo`) que
 * entran en una corrida de primer plano, cada tajada escribe su JSON al cerrar
 * y **se fusiona** con el de la misma anchura que ya esté en el temporal:
 * `logo-<perfil>.json` es la unión de las tajadas, sección por sección.
 *
 * ── Qué mide ───────────────────────────────────────────────────────────────
 *
 * Por cada ancho, barre el scroll en pasos de 1/16 de pantalla sobre el rango
 * en que alguna de las seis secciones está en cuadro, y en cada parada saca
 * UNA captura: **S**, la sala desnuda (todo oculto menos la escena, el mismo
 * ocultamiento de `c-las-ocho`). De S salen tres máscaras:
 *
 *   · **el logo** — la componente conexa oscura más grande (`siluetaMasGrande`
 *     con los umbrales de B5/B8: tinta < 60, área ≥ 5.000). Es el obstáculo.
 *   · **las motas** — lo oscuro que NO es el logo: partículas de día, bordes de
 *     sombra. Es lo que hunde el peor píxel del hero.
 *   · **lo brillante** — gris > mediana + 40, el criterio de `particulas.ts`. Es
 *     el obstáculo de la noche de Trabajos: partículas que brillan bajo la tinta
 *     clara.
 *
 * ⚠️ **La silueta oscura sólo discrimina con la sala iluminada.** En el
 * atardecer y en la noche el piso baja de 60 y «la componente oscura más
 * grande» es el cuadro entero. Una silueta que ocupa más del 35 % del cuadro
 * se marca `valida: false`, no se vuelca al mapa del logo, y la parada cuenta en
 * el mapa de OSCURIDAD: ahí el problema del texto no es dónde está el logo, es
 * la luz — que es la mitad de D-B8.1 que este bloque no puede tocar.
 *
 * ⚠️ **Y las cuatro que deciden: los mapas de AA.** La silueta dice DÓNDE está el
 * logo; el gate del bloque es otro: *AA en el peor píxel del glifo*. Un píxel de
 * la sala es obstáculo para la tinta oscura (#111111) si su luminancia no le da
 * 4,5:1 —gris por debajo de ~124—, sea logo, sombra proyectada, partícula o
 * atardecer; y es obstáculo para la tinta clara si le da de más (gris por
 * encima de ~114). Por eso, además de la silueta, cada parada vuelca **la
 * máscara de los píxeles donde CADA tinta no llega a AA** (`aa-oscura`,
 * `aa-clara`) y su versión para texto grande a 3:1 (`aa3-*`), con la misma
 * `contraste()` de `scripts-b4/color.ts` que usa la máscara de glifo. Ésa es la
 * zona libre de verdad: donde la tinta de la sección pasa AA en TODO el tramo.
 *
 * ⚠️ **Y cada máscara de AA se PARTE en dos antes de volcarse** (`partirPorTamano`):
 * las componentes de más de 400 px —el logo, su sombra, el atardecer, la sala
 * iluminada bajo la tinta clara— son ESTRUCTURA, determinista y atada al scroll,
 * y van al mapa `aa-*`; las de 400 px o menos son MOTAS —las partículas que
 * flotan por toda la sala— y van a `aa-motas-*`. La distinción es la que decide
 * el bloque: de la estructura el texto se puede correr; de las motas no hay
 * posición que lo saque, y lo que se publica de ellas es su densidad, que es lo
 * que fija cuántos píxeles de glifo espera perder una captura cualquiera.
 *
 * Las máscaras se vuelcan al mapa de cada sección en cuanto salen (`mapa.ts`):
 * en coordenadas del documento para las cinco que scrollean, y del viewport
 * para el pin de Trabajos. Lo que se publica por sección es la retícula de
 * cobertura —doce columnas por media pantalla— sobre el viewport y sobre la
 * caja de contenido, y por pantalla de la sección cuánto queda libre desde
 * cada borde. Los mapas van como PNG al reporte: son la evidencia.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { progresoDePantalla } from '../src/app/v3/_lib/escena/recorrido'
import { AREA_MINIMA_DEL_LOGO, TINTA_MAXIMA } from '../scripts-b8/c-bloques'
import { leerImagen, siluetaMasGrande, type Imagen } from '../scripts-b8/glifo-alfa'
import { LECTOR_DE_PANELES, LECTOR_DEL_DOCUMENTO } from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import { AREA_MAXIMA, SALTO_SOBRE_EL_FONDO, mediaDeLaCaptura } from '../scripts-b8/particulas'
import { AA_TEXTO_GRANDE, AA_TEXTO_NORMAL, contraste, luminancia } from '../scripts-b4/color'
import { COLOR } from '../src/app/v3/_lib/__tests__/s10-acceso-color'
import { SECCIONES } from '../src/app/v3/_lib/secciones'
import { SUPERFICIES } from '../src/app/v3/_lib/superficies'

import { LAS_SEIS, PERFILES_DE_B11, TEMP, argumento, asegurarCarpetas, asentarElHome, conElHome, cuatro, dos, esDeLasSeis, jsonPendiente, mudarPendientes, pantallas, perfilDeB11, type IdDeLasSeis } from './b11-comun'
import { ESCALA, acumular, crearMapa, ocupacionPorColumna, partirPorTamano, reducir, renderizar, reticula, serializarMapa, type Cobertura, type MapaDeCobertura } from './mapa'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/** Arriba de esta fracción del cuadro, «la silueta más grande» es la sala a oscuras y no el logo. */
export const SILUETA_MAXIMA_VALIDA = 0.35

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

interface Posicion {
  readonly scrollY: number
  readonly pantalla: number
  readonly progreso: number
  readonly gris: number
  readonly luminancia: number
  readonly medianaGris: number
  readonly estado: 'logo' | 'vacio' | 'oscuro'
  readonly logo: { readonly area: number; readonly caja: readonly number[]; readonly fraccionDelCuadro: number; readonly fraccionDelAncho: number; readonly fraccionDelAlto: number; readonly valida: boolean }
  readonly motasPx: number
  readonly brillantesPx: number
  /** Las motas de AA por tinta: cuántas componentes chicas y qué fracción del cuadro ocupan. */
  readonly motasDeAA: Mascaras['motasDeAA']
}

interface Mascaras {
  readonly logo: Uint8Array
  readonly motas: Uint8Array
  readonly brillo: Uint8Array
  readonly aaOscura: Uint8Array
  readonly aa3Oscura: Uint8Array
  readonly aaClara: Uint8Array
  readonly aa3Clara: Uint8Array
  readonly aaMotasOscura: Uint8Array
  readonly aaMotasClara: Uint8Array
  readonly motasDeAA: { readonly oscura: { readonly cantidad: number; readonly fraccionDelArea: number }; readonly clara: { readonly cantidad: number; readonly fraccionDelArea: number } }
  readonly medianaGris: number
}

const canales = (hex: string): readonly [number, number, number] => [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)]
/** Las dos tintas del tema, leídas de la hoja y no escritas acá. */
const TINTA_OSCURA = canales(COLOR.tintaClara)
const TINTA_CLARA = canales(COLOR.tintaInvertida)
const LUM_OSCURA = luminancia(TINTA_OSCURA[0], TINTA_OSCURA[1], TINTA_OSCURA[2])
const LUM_CLARA = luminancia(TINTA_CLARA[0], TINTA_CLARA[1], TINTA_CLARA[2])

/** Qué tinta lleva una sección, leído de la tabla de superficies. */
function tintaDe(id: string): 'oscura' | 'clara' {
  const sec = SECCIONES.find((x) => x.id === id)
  if (sec === undefined) throw new Error(`la tabla del home no tiene a «${id}»`)
  return SUPERFICIES[sec.superficie].invertida ? 'clara' : 'oscura'
}

function medianaDeGris(img: Imagen): number {
  const bins = new Uint32Array(256)
  const total = img.ancho * img.alto
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    bins[Math.round(0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2])] += 1
  }
  let acumulado = 0
  for (let g = 0; g < 256; g += 1) {
    acumulado += bins[g]
    if (acumulado * 2 >= total) return g
  }
  return 255
}

function mascarasDe(S: Imagen, dentroDelLogo: Uint8Array, logoValido: boolean, tintas: ReadonlySet<'oscura' | 'clara'>): Mascaras {
  const total = S.ancho * S.alto
  const medianaGris = medianaDeGris(S)
  const umbralBrillo = medianaGris + SALTO_SOBRE_EL_FONDO
  const logo = new Uint8Array(total)
  const motas = new Uint8Array(total)
  const brillo = new Uint8Array(total)
  const aaOscura = new Uint8Array(total)
  const aa3Oscura = new Uint8Array(total)
  const aaClara = new Uint8Array(total)
  const aa3Clara = new Uint8Array(total)
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    const r = S.datos[k]
    const g = S.datos[k + 1]
    const b = S.datos[k + 2]
    const oscuro = Math.max(r, g, b) < TINTA_MAXIMA
    if (logoValido && dentroDelLogo[i] === 1) logo[i] = 1
    else if (logoValido && oscuro) motas[i] = 1
    if (0.2126 * r + 0.7152 * g + 0.0722 * b > umbralBrillo) brillo[i] = 1
    const lum = luminancia(r, g, b)
    const cOscura = contraste(LUM_OSCURA, lum)
    const cClara = contraste(LUM_CLARA, lum)
    if (cOscura < AA_TEXTO_NORMAL) aaOscura[i] = 1
    if (cOscura < AA_TEXTO_GRANDE) aa3Oscura[i] = 1
    if (cClara < AA_TEXTO_NORMAL) aaClara[i] = 1
    if (cClara < AA_TEXTO_GRANDE) aa3Clara[i] = 1
  }
  // Sólo se parte lo que alguna sección del barrido va a usar: partir una máscara
  // de 3,7 M de píxeles cuesta ~40 MB transitorios, y la máquina no los tiene.
  const vacia = (): ReturnType<typeof partirPorTamano> => ({ grandes: new Uint8Array(0), chicas: new Uint8Array(0), cantidadDeChicas: 0, areaDeChicas: 0 })
  const oscura = tintas.has('oscura') ? partirPorTamano(aaOscura, S.ancho, S.alto, AREA_MAXIMA) : vacia()
  const oscura3 = tintas.has('oscura') ? partirPorTamano(aa3Oscura, S.ancho, S.alto, AREA_MAXIMA) : vacia()
  const clara = tintas.has('clara') ? partirPorTamano(aaClara, S.ancho, S.alto, AREA_MAXIMA) : vacia()
  const clara3 = tintas.has('clara') ? partirPorTamano(aa3Clara, S.ancho, S.alto, AREA_MAXIMA) : vacia()
  return {
    logo,
    motas,
    brillo,
    aaOscura: oscura.grandes,
    aa3Oscura: oscura3.grandes,
    aaClara: clara.grandes,
    aa3Clara: clara3.grandes,
    aaMotasOscura: oscura.chicas,
    aaMotasClara: clara.chicas,
    motasDeAA: {
      oscura: { cantidad: oscura.cantidadDeChicas, fraccionDelArea: oscura.areaDeChicas / total },
      clara: { cantidad: clara.cantidadDeChicas, fraccionDelArea: clara.areaDeChicas / total },
    },
    medianaGris,
  }
}

interface MapasDeSeccion {
  readonly id: IdDeLasSeis
  readonly panel: PanelLeido
  /** `documento`: el mapa mide la sección entera. `viewport`: el pin, una pantalla. */
  readonly tipo: 'documento' | 'viewport'
  readonly desde: number
  readonly hasta: number
  readonly logo: MapaDeCobertura
  readonly motas: MapaDeCobertura
  readonly brillo: MapaDeCobertura
  readonly oscuridad: MapaDeCobertura
  readonly aaOscura: MapaDeCobertura
  readonly aa3Oscura: MapaDeCobertura
  readonly aaClara: MapaDeCobertura
  readonly aa3Clara: MapaDeCobertura
  readonly aaMotasOscura: MapaDeCobertura
  readonly aaMotasClara: MapaDeCobertura
  /** La fracción del cuadro que ocupan las motas de AA de SU tinta, parada por parada. */
  readonly motasDeSuTinta: number[]
  /** Cuántas paradas del barrido cayeron en cada estado de la silueta. */
  readonly estados: { logo: number; vacio: number; oscuro: number }
  /** La tinta que la sección lleva, de la tabla: decide cuál de los mapas de AA es el suyo. */
  readonly tinta: 'oscura' | 'clara'
  readonly contenido: { readonly x: number; readonly ancho: number }
}

const LECTOR_DEL_CONTENIDO = (id: string): string => `(() => {
  const panel = document.querySelector('[data-panel="${id}"]')
  const caja = panel === null ? null : panel.querySelector('[data-parte="contenido"]')
  if (caja === null) return null
  const r = caja.getBoundingClientRect()
  return { x: r.left, ancho: r.width }
})()`

function celdas(r: readonly Cobertura[][]): number[][] {
  return r.map((fila) => fila.map((c) => Math.round(c.algunaVez * 1000) / 1000))
}

/** Desde cada borde, cuántos píxeles de ancho quedan sin tapar en NINGUNA fila de la banda. */
function libreDesdeLosBordes(mapa: MapaDeCobertura, desdePx: number, hastaPx: number): { readonly izquierdaPx: number; readonly derechaPx: number } {
  const ocupacion = ocupacionPorColumna(mapa, desdePx, hastaPx)
  let izq = 0
  while (izq < ocupacion.length && (Number.isNaN(ocupacion[izq]) || ocupacion[izq] === 0)) izq += 1
  let der = 0
  while (der < ocupacion.length && (Number.isNaN(ocupacion[ocupacion.length - 1 - der]) || ocupacion[ocupacion.length - 1 - der] === 0)) der += 1
  return { izquierdaPx: izq * mapa.escala, derechaPx: der * mapa.escala }
}

async function medirUnPerfil(idDePerfil: string, paso: number, solo: readonly string[]): Promise<Record<string, unknown>> {
  const perfil = perfilDeB11(idDePerfil)
  return conElHome(perfil, async (s) => {
    const { pagina } = s
    await asentarElHome(s)
    const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
    const paneles = await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)
    const V = doc.ventana
    const maximo = doc.altoDelDocumento - V
    const pasoPx = V / paso
    const secciones: MapasDeSeccion[] = []
    for (const p of paneles) {
      if (!esDeLasSeis(p.id) || (solo.length > 0 && !solo.includes(p.id))) continue
      const pinneada = p.id === 'trabajos'
      const contenido = (await medir<{ x: number; ancho: number } | null>(pagina, LECTOR_DEL_CONTENIDO(p.id))) ?? { x: 0, ancho: doc.ancho }
      const crear = (): MapaDeCobertura => crearMapa(doc.ancho, pinneada ? V : p.alto)
      secciones.push({
        id: p.id,
        panel: p,
        tipo: pinneada ? 'viewport' : 'documento',
        desde: pinneada ? p.top : Math.max(0, p.top - V),
        hasta: Math.min(maximo, pinneada ? p.top + p.alto - V : p.top + p.alto),
        logo: crear(),
        motas: crear(),
        brillo: crear(),
        oscuridad: crear(),
        aaOscura: crear(),
        aa3Oscura: crear(),
        aaClara: crear(),
        aa3Clara: crear(),
        aaMotasOscura: crear(),
        aaMotasClara: crear(),
        motasDeSuTinta: [],
        estados: { logo: 0, vacio: 0, oscuro: 0 },
        tinta: tintaDe(p.id),
        contenido,
      })
    }
    const tintasDelBarrido = new Set(secciones.map((sec) => sec.tinta))
    const ys = new Set<number>()
    for (const sec of secciones) for (let y = sec.desde; y <= sec.hasta + 0.5; y += pasoPx) ys.add(Math.round(Math.min(y, sec.hasta)))
    const paradas = [...ys].sort((a, b) => a - b)
    console.log(`${perfil.id}: documento ${doc.altoDelDocumento} · ventana ${V} · ${paradas.length} paradas cada ${dos(pasoPx)} px · ${secciones.length} secciones`)

    const posiciones: Posicion[] = []
    const t0 = Date.now()
    for (const y of paradas) {
      const logrado = await scrollA(pagina, y)
      if (Math.abs(logrado - y) > 1) throw new Error(`se pidió y=${y} y el scroll quedó en ${logrado}`)
      await esperarElPrimerCuadro(pagina, 700)
      if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
      await esperarElPrimerCuadro(pagina, 300)
      const ruta = `${TEMP}/logo-${perfil.id}-${y}-S.png`
      await capturar(pagina, ruta)
      if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
      const S = leerImagen(ruta)
      const silueta = siluetaMasGrande(S, TINTA_MAXIMA, AREA_MINIMA_DEL_LOGO)
      const fraccionDelCuadro = silueta.area / (S.ancho * S.alto)
      /**
       * Tres estados, y los tres cuentan distinto: `logo` (hay silueta y es
       * el logo), `vacio` (no hay NADA oscuro: la escena suspendida deja el
       * papel, o el logo está fuera de cuadro — el cuadro está libre, y la
       * parada suma al mapa como vista sin obstáculo), `oscuro` (la silueta es
       * la sala entera: atardecer o noche, y la parada suma al mapa de
       * OSCURIDAD). Confundir `vacio` con `oscuro` publicaría como «a oscuras»
       * el único cuadro que no tiene obstáculo.
       */
      const estado: 'logo' | 'vacio' | 'oscuro' = silueta.area === 0 ? 'vacio' : fraccionDelCuadro < SILUETA_MAXIMA_VALIDA ? 'logo' : 'oscuro'
      const valida = estado === 'logo'
      const m = mascarasDe(S, silueta.dentro, valida, tintasDelBarrido)
      const media = mediaDeLaCaptura(S)
      const cuenta = (a: Uint8Array): number => a.reduce((n, v) => n + v, 0)
      const caja = silueta.caja
      const pos: Posicion = {
        scrollY: y,
        pantalla: pantallas(y, V),
        progreso: cuatro(progresoDePantalla(y / V)),
        gris: media.gris,
        luminancia: media.luminancia,
        medianaGris: m.medianaGris,
        estado,
        logo: {
          area: silueta.area,
          caja,
          fraccionDelCuadro: cuatro(fraccionDelCuadro),
          fraccionDelAncho: caja.length === 4 ? cuatro((caja[2] - caja[0] + 1) / S.ancho) : 0,
          fraccionDelAlto: caja.length === 4 ? cuatro((caja[3] - caja[1] + 1) / S.alto) : 0,
          valida,
        },
        motasPx: cuenta(m.motas),
        brillantesPx: cuenta(m.brillo),
        motasDeAA: { oscura: { cantidad: m.motasDeAA.oscura.cantidad, fraccionDelArea: cuatro(m.motasDeAA.oscura.fraccionDelArea * 100) / 100 }, clara: { cantidad: m.motasDeAA.clara.cantidad, fraccionDelArea: cuatro(m.motasDeAA.clara.fraccionDelArea * 100) / 100 } },
      }
      posiciones.push(pos)
      const logoRed = reducir(m.logo, S.ancho, S.alto)
      const motasRed = reducir(m.motas, S.ancho, S.alto)
      const brilloRed = reducir(m.brillo, S.ancho, S.alto)
      const nula = reducir(new Uint8Array(0), 0, 0)
      const red = (a: Uint8Array): ReturnType<typeof reducir> => (a.length === 0 ? nula : reducir(a, S.ancho, S.alto))
      const aaRed = { oscura: red(m.aaOscura), oscura3: red(m.aa3Oscura), clara: red(m.aaClara), clara3: red(m.aa3Clara), motasOscura: red(m.aaMotasOscura), motasClara: red(m.aaMotasClara) }
      const todo = reducir(new Uint8Array(S.ancho * S.alto).fill(1), S.ancho, S.alto)
      const nada = reducir(new Uint8Array(S.ancho * S.alto), S.ancho, S.alto)
      for (const sec of secciones) {
        if (y < sec.desde - 0.5 || y > sec.hasta + 0.5) continue
        const desplazamiento = sec.tipo === 'documento' ? y - sec.panel.top : 0
        const medioPaso = sec.tipo === 'documento' ? pasoPx / 2 : 0
        sec.estados[estado] += 1
        if (estado === 'oscuro') {
          acumular(sec.oscuridad, todo, desplazamiento, medioPaso)
        } else {
          // `vacio` vuelca máscaras vacías: la parada cuenta como VISTA sin obstáculo.
          acumular(sec.logo, logoRed, desplazamiento, medioPaso)
          acumular(sec.motas, motasRed, desplazamiento, medioPaso)
          // Y la oscuridad también cuenta la parada, VISTA y sin oscuridad: si no,
          // «alguna vez a oscuras» se mediría sólo sobre las paradas oscuras y daría 100 % siempre.
          acumular(sec.oscuridad, nada, desplazamiento, medioPaso)
        }
        acumular(sec.brillo, brilloRed, desplazamiento, medioPaso)
        // Sólo los mapas de SU tinta: los de la otra no se publican ni se cruzan.
        if (sec.tinta === 'oscura') {
          acumular(sec.aaOscura, aaRed.oscura, desplazamiento, medioPaso)
          acumular(sec.aa3Oscura, aaRed.oscura3, desplazamiento, medioPaso)
          acumular(sec.aaMotasOscura, aaRed.motasOscura, desplazamiento, medioPaso)
        } else {
          acumular(sec.aaClara, aaRed.clara, desplazamiento, medioPaso)
          acumular(sec.aa3Clara, aaRed.clara3, desplazamiento, medioPaso)
          acumular(sec.aaMotasClara, aaRed.motasClara, desplazamiento, medioPaso)
        }
        sec.motasDeSuTinta.push(sec.tinta === 'oscura' ? m.motasDeAA.oscura.fraccionDelArea : m.motasDeAA.clara.fraccionDelArea)
      }
      if (posiciones.length % 16 === 0) {
        console.log(`  y=${String(y).padStart(5)} (${pos.pantalla.toFixed(2)} pantallas, p=${pos.progreso.toFixed(3)}) sala gris ${media.gris} · ${estado === 'logo' ? `logo ${(fraccionDelCuadro * 100).toFixed(1)} % del cuadro, x ${caja[0]}–${caja[2]}` : estado === 'vacio' ? 'cuadro VACÍO (sin nada oscuro)' : 'sala OSCURA (la silueta es el cuadro entero)'} · motas de AA oscura ${m.motasDeAA.oscura.cantidad} (${(m.motasDeAA.oscura.fraccionDelArea * 100).toFixed(3)} % del cuadro) · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
      }
    }

    const resumen: Record<string, unknown> = {}
    for (const sec of secciones) {
      const alto = sec.logo.alto * ESCALA
      const pantallasDeLaSeccion = Math.max(1, Math.round(alto / V))
      const cajaViewport = { x: 0, y: 0, ancho: doc.ancho, alto }
      const cajaContenido = { x: sec.contenido.x, y: 0, ancho: sec.contenido.ancho, alto }
      const filas = pantallasDeLaSeccion * 2
      const mapaDeSuTinta = sec.tinta === 'oscura' ? sec.aaOscura : sec.aaClara
      const porPantalla = []
      for (let k = 0; k < pantallasDeLaSeccion; k += 1) {
        const banda = { x: 0, y: k * V, ancho: doc.ancho, alto: V }
        const bordesDelLogo = libreDesdeLosBordes(sec.logo, k * V, (k + 1) * V)
        const bordesDeAA = libreDesdeLosBordes(mapaDeSuTinta, k * V, (k + 1) * V)
        const celda = (m: MapaDeCobertura): Cobertura => reticula(m, banda, 1, 1)[0][0]
        porPantalla.push({
          pantalla: k + 1,
          logo: { libreIzquierdaPx: bordesDelLogo.izquierdaPx, libreDerechaPx: bordesDelLogo.derechaPx, algunaVez: cuatro(celda(sec.logo).algunaVez), delTiempo: cuatro(celda(sec.logo).delTiempo) },
          aaDeSuTinta: { tinta: sec.tinta, libreIzquierdaPx: bordesDeAA.izquierdaPx, libreDerechaPx: bordesDeAA.derechaPx, algunaVez: cuatro(celda(mapaDeSuTinta).algunaVez), delTiempo: cuatro(celda(mapaDeSuTinta).delTiempo) },
          brilloAlgunaVez: cuatro(celda(sec.brillo).algunaVez),
          oscuroAlgunaVez: cuatro(celda(sec.oscuridad).algunaVez),
        })
      }
      const nombre = (que: string): string => `mapa-${que}-${sec.id}-${perfil.id}.png`
      // Los mapas van EXACTOS al temporal (`.b11m`) y como PNG de trabajo; los que
      // van al reporte los renderiza `e-cruce.ts`, con las cajas de los bloques encima.
      const deSuTinta: readonly (readonly [string, MapaDeCobertura])[] =
        sec.tinta === 'oscura'
          ? [['aa-oscura', sec.aaOscura], ['aa3-oscura', sec.aa3Oscura], ['aa-motas-oscura', sec.aaMotasOscura]]
          : [['aa-clara', sec.aaClara], ['aa3-clara', sec.aa3Clara], ['aa-motas-clara', sec.aaMotasClara]]
      for (const [que, mapa] of [['logo', sec.logo] as const, ['motas', sec.motas] as const, ['brillo', sec.brillo] as const, ['oscuridad', sec.oscuridad] as const, ...deSuTinta]) {
        const ruta = `${TEMP}/${nombre(que)}`
        writeFileSync(ruta, renderizar(mapa))
        writeFileSync(ruta.replace(/\.png$/, '.b11m'), serializarMapa(mapa))
      }
      const motasMedia = sec.motasDeSuTinta.length === 0 ? Number.NaN : sec.motasDeSuTinta.reduce((a, b) => a + b, 0) / sec.motasDeSuTinta.length
      resumen[sec.id] = {
        tipo: sec.tipo,
        top: sec.panel.top,
        alto: sec.panel.alto,
        barrido: { desde: sec.desde, hasta: sec.hasta, paradas: sec.oscuridad.paradas, conLogo: sec.estados.logo, vacias: sec.estados.vacio, aOscuras: sec.estados.oscuro },
        contenido: sec.contenido,
        porPantalla,
        tinta: sec.tinta,
        /** Fracción media del cuadro bajo motas de AA de su tinta: lo que una captura cualquiera espera perder de glifo, sin importar dónde esté el texto. */
        motasDeAAMedia: cuatro(motasMedia * 100) / 100,
        motasDeAAMaxima: cuatro(Math.max(...sec.motasDeSuTinta) * 100) / 100,
        reticulaViewport: { columnas: 12, filas, logoAlgunaVez: celdas(reticula(sec.logo, cajaViewport, 12, filas)), aaDeSuTintaAlgunaVez: celdas(reticula(mapaDeSuTinta, cajaViewport, 12, filas)), brilloAlgunaVez: celdas(reticula(sec.brillo, cajaViewport, 12, filas)), motasAlgunaVez: celdas(reticula(sec.motas, cajaViewport, 12, filas)) },
        reticulaContenido: { columnas: 12, filas, logoAlgunaVez: celdas(reticula(sec.logo, cajaContenido, 12, filas)), aaDeSuTintaAlgunaVez: celdas(reticula(mapaDeSuTinta, cajaContenido, 12, filas)) },
        mapas: { logo: nombre('logo'), motas: nombre('motas'), brillo: nombre('brillo'), oscuridad: nombre('oscuridad'), aa: nombre(`aa-${sec.tinta}`), aa3: nombre(`aa3-${sec.tinta}`), aaMotas: nombre(`aa-motas-${sec.tinta}`) },
      }
      console.log(`  ${sec.id.padEnd(16)} ${sec.tipo.padEnd(9)} tinta ${sec.tinta} · ${sec.oscuridad.paradas} paradas: ${sec.estados.logo} con logo, ${sec.estados.vacio} vacías, ${sec.estados.oscuro} a oscuras · motas de AA: ${(motasMedia * 100).toFixed(3)} % del cuadro en promedio`)
      for (const p of porPantalla) console.log(`      [${p.pantalla}] logo: libre izq ${p.logo.libreIzquierdaPx} der ${p.logo.libreDerechaPx} px, alguna vez ${(p.logo.algunaVez * 100).toFixed(0)} % · AA(${sec.tinta}): libre izq ${p.aaDeSuTinta.libreIzquierdaPx} der ${p.aaDeSuTinta.libreDerechaPx} px, alguna vez ${(p.aaDeSuTinta.algunaVez * 100).toFixed(0)} %, del tiempo ${(p.aaDeSuTinta.delTiempo * 100).toFixed(0)} % · brillo ${(p.brilloAlgunaVez * 100).toFixed(0)} % · oscuro ${(p.oscuroAlgunaVez * 100).toFixed(0)} %`)
    }
    return { perfil: perfil.id, ancho: doc.ancho, ventana: V, documento: doc.altoDelDocumento, paso: pasoPx, escalaDelMapa: ESCALA, siluetaMaximaValida: SILUETA_MAXIMA_VALIDA, paneles, posiciones, secciones: resumen }
  }, 'b11-logo')
}

interface SalidaDePerfil {
  readonly posiciones: readonly Posicion[]
  readonly secciones: Readonly<Record<string, unknown>>
}

/** La unión con la tajada anterior de la misma anchura, si la hay: las secciones nuevas pisan a las viejas; las posiciones se unen por scroll. */
function fusionar(id: string, nueva: Record<string, unknown>): Record<string, unknown> {
  const ruta = `${TEMP}/logo-${id}.json`
  if (!existsSync(ruta)) return nueva
  const previa = JSON.parse(readFileSync(ruta, 'utf8')) as SalidaDePerfil
  const nuevas = nueva as unknown as SalidaDePerfil
  const porScroll = new Map<number, Posicion>()
  for (const p of previa.posiciones) porScroll.set(p.scrollY, p)
  for (const p of nuevas.posiciones) porScroll.set(p.scrollY, p)
  return { ...nueva, posiciones: [...porScroll.values()].sort((a, b) => a.scrollY - b.scrollY), secciones: { ...previa.secciones, ...nuevas.secciones } }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  const paso = Number(argumento('paso', '16'))
  const solo = argumento('solo', '').split(',').filter((x) => x.length > 0)
  for (const id of perfiles) {
    const salida = await medirUnPerfil(id, paso, solo)
    jsonPendiente(`logo-${id}`, fusionar(id, salida))
  }
  for (const r of mudarPendientes()) console.log(`escrito: ${r}`)
  console.log(`secciones: ${LAS_SEIS.join(' · ')}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
