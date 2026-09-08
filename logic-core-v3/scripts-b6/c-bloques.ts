/**
 * LA EVALUACIÓN DE UNA POSICIÓN — de las cuatro capturas a las cifras de cada
 * bloque, y de las cifras al veredicto de la sección.
 *
 * Sale de `c-las-seis.ts` por las 300 líneas, y el corte es por tema: allá está
 * la coreografía del navegador (scroll, apagar, capturar); acá, lo que se hace
 * con las imágenes ya en disco. Nada de acá abre el navegador.
 *
 * ── Los tres veredictos, y qué los decide ─────────────────────────────────
 *
 *   · **abre tal cual** — todos los bloques pasan AA en su PEOR píxel.
 *   · **abre con el texto acotado** — lo único que falla es texto que pasaría a
 *     tinta plena (texto secundario a `opacity-casi`, o un `rgba()`): la sección
 *     puede abrirse si ese texto va pleno. La cifra «a tinta plena» se calcula
 *     ACÁ, con la misma máscara y el mismo fondo, para que la decisión tenga
 *     su número y no una suposición.
 *   · **no abre** — falla un bloque a tinta plena. Ningún velo razonable lo
 *     salva sin esconder la escena, y eso es una decisión humana.
 *
 * El peor píxel manda, como pide la instrucción. El p1 y la cuenta bajo AA se
 * publican al lado para que se vea cuánto de ese peor es un píxel solo.
 */

import type { Bloque, CajaDeBloque } from './lectores'
import {
  contrasteBajoElGlifoConOpacidad,
  estadisticaDeLuminancia,
  fraccionSobreLaSilueta,
  siluetaMasGrande,
  unionDeMascaras,
  type EstadisticaDeLuminancia,
  type Imagen,
  type Region,
} from './glifo-alfa'

/** Los umbrales de silueta de B5 (`e-discriminador.ts`). No se tocan: la cifra tiene que ser comparable. */
export const TINTA_MAXIMA = 60
export const AREA_MINIMA_DEL_LOGO = 5000

export interface LecturaDeBloque {
  readonly clave: string
  readonly etiqueta: string
  readonly pieza: string | null
  readonly nivel: string | null
  readonly texto: string
  readonly tamanoPx: number
  readonly peso: number
  readonly grande: boolean
  readonly tinta: readonly [number, number, number]
  /** `opacity` efectivo × alfa del `color`. 1 = tinta plena. */
  readonly opacidad: number
  readonly scrollY: number
  readonly pixelesDeGlifo: number
  readonly peorContraste: number
  readonly p1Contraste: number
  readonly medianaContraste: number
  readonly bajoAA: number
  readonly umbralAA: number
  /** Fracción de los glifos que caen sobre la silueta del logo, en la captura sin panel. */
  readonly sobreElLogo: number
  /** Con la tinta PLENA sobre el mismo fondo. Igual a `peorContraste` si ya era plena. */
  readonly peorAPlena: number
  readonly pasaAA: boolean
  readonly pasariaAPlena: boolean
}

export interface LecturaDeLaEscena {
  readonly region: Region
  /** S — la sala desnuda, con el panel oculto. */
  readonly sinPanel: EstadisticaDeLuminancia
  /** V — el panel solo (hijos ocultos) sobre la sala: el velo, o el relleno. */
  readonly soloElPanel: EstadisticaDeLuminancia
  /** A — el panel con su contenido y la tinta apagada. */
  readonly conPanelSinTinta: EstadisticaDeLuminancia
  /** var(V) / var(S): la fracción de la varianza de LUMINANCIA de la escena que atraviesa la SUPERFICIE del panel. */
  readonly varianzaQuePasa: number
  /** var(A) / var(S): lo mismo con el contenido puesto (tarjetas, campos): se publica, no decide. */
  readonly varianzaConContenido: number
  /** desvío de gris (V) / desvío de gris (S): lo mismo en el espacio de la pantalla, donde un velo de alfa α deja (1−α). */
  readonly desvioDeGrisQuePasa: number
  /** Con velo en gradiente: la columna densa y la franja desnuda, cada una con lo que pasa. */
  readonly zonas: ZonasDelVelo | null
  readonly logo: { readonly area: number; readonly caja: readonly number[] }
}

export interface ZonaDelVelo {
  readonly region: Region
  readonly sinPanel: EstadisticaDeLuminancia
  readonly soloElPanel: EstadisticaDeLuminancia
  readonly pasaLuminancia: number
  readonly pasaGris: number
}

export interface ZonasDelVelo {
  /** Dónde termina la columna densa y cuánto mide la rampa, en px del viewport. */
  readonly borde: number
  readonly rampa: number
  /** La franja desnuda que queda a la derecha de la rampa, en px y como fracción del ancho. */
  readonly franjaPx: number
  readonly franja: number
  readonly densa: ZonaDelVelo
  readonly rala: ZonaDelVelo | null
}

/** La geometría del velo, tal como la pinta el navegador: de dónde a dónde va cada alfa. */
export interface GeometriaDelVelo {
  readonly borde: number
  readonly rampa: number
}

export interface LecturaDePosicion {
  readonly scrollY: number
  readonly pantalla: number
  readonly bloques: readonly LecturaDeBloque[]
  readonly escena: LecturaDeLaEscena
  readonly capturas: { readonly C: string; readonly A: string; readonly T: string; readonly S: string; readonly V: string }
}

export function claveDeBloque(b: Bloque): string {
  return `${b.etiqueta}|${b.pieza ?? ''}|${b.nivel ?? ''}|${b.texto}`
}

function interseccion(a: CajaDeBloque, ventana: { readonly ancho: number; readonly alto: number }): Region {
  return {
    x0: Math.max(0, Math.floor(a.x)),
    y0: Math.max(0, Math.floor(a.y)),
    x1: Math.min(ventana.ancho, Math.ceil(a.x + a.ancho)),
    y1: Math.min(ventana.alto, Math.ceil(a.y + a.alto)),
  }
}

/** Evalúa TODOS los bloques en cuadro de una posición contra sus cuatro capturas. */
/** Lo que pasa por una zona del velo: la sala desnuda contra el panel solo, en esa región. */
function zona(S: Imagen, V: Imagen, region: Region, excluir: Uint8Array): ZonaDelVelo {
  const sinPanel = estadisticaDeLuminancia(S, region, excluir)
  const soloElPanel = estadisticaDeLuminancia(V, region, excluir)
  const razon = (a: number, b: number): number => (b > 1e-9 ? a / b : Number.NaN)
  return { region, sinPanel, soloElPanel, pasaLuminancia: razon(soloElPanel.varianza, sinPanel.varianza), pasaGris: razon(soloElPanel.grisDesvio, sinPanel.grisDesvio) }
}

export function evaluarLaPosicion(
  capturas: { readonly C: Imagen; readonly A: Imagen; readonly T: Imagen; readonly S: Imagen; readonly V: Imagen },
  bloques: readonly Bloque[],
  rectDelPanel: CajaDeBloque,
  scrollY: number,
  rutas: LecturaDePosicion['capturas'],
  velo: GeometriaDelVelo | null = null,
): LecturaDePosicion {
  const { A, T, S, V } = capturas
  const logo = siluetaMasGrande(S, TINTA_MAXIMA, AREA_MINIMA_DEL_LOGO)
  const lecturas: LecturaDeBloque[] = []
  const mascaras = []
  for (const b of bloques) {
    const opacidad = b.opacidad * b.alfaDeColor
    if (!b.enCuadro || opacidad < 0.02) continue
    const l = contrasteBajoElGlifoConOpacidad(T, A, b.cajas, b.tinta, opacidad, b.grande)
    if (l.pixelesDeGlifo === 0) continue
    mascaras.push(l.mascara)
    const plena = opacidad >= 1 ? l : contrasteBajoElGlifoConOpacidad(T, A, b.cajas, b.tinta, 1, b.grande)
    lecturas.push({
      clave: claveDeBloque(b),
      etiqueta: b.etiqueta,
      pieza: b.pieza,
      nivel: b.nivel,
      texto: b.texto,
      tamanoPx: b.tamanoPx,
      peso: b.peso,
      grande: b.grande,
      tinta: b.tinta,
      opacidad: Math.round(opacidad * 1000) / 1000,
      scrollY,
      pixelesDeGlifo: l.pixelesDeGlifo,
      peorContraste: l.peorContraste,
      p1Contraste: l.p1Contraste,
      medianaContraste: l.medianaContraste,
      bajoAA: l.bajoAA,
      umbralAA: l.umbralAA,
      sobreElLogo: Math.round(fraccionSobreLaSilueta(l.mascara, logo.dentro) * 10000) / 10000,
      peorAPlena: plena.peorContraste,
      pasaAA: l.peorContraste >= l.umbralAA,
      pasariaAPlena: plena.peorContraste >= l.umbralAA,
    })
  }
  const ventana = { ancho: A.ancho, alto: A.alto }
  let region = interseccion(rectDelPanel, ventana)
  if (region.x1 <= region.x0 || region.y1 <= region.y0) region = { x0: 0, y0: 0, x1: A.ancho, y1: A.alto }
  const excluir = unionDeMascaras(A.ancho * A.alto, mascaras)
  const sinPanel = estadisticaDeLuminancia(S, region, excluir)
  const soloElPanel = estadisticaDeLuminancia(V, region, excluir)
  const conPanelSinTinta = estadisticaDeLuminancia(A, region, excluir)
  // Debajo de 1e-9 la varianza es cero numérico (un fondo plano da ~1e-27): no se divide por ruido.
  const razon = (a: number, b: number): number => (b > 1e-9 ? a / b : Number.NaN)
  let zonas: ZonasDelVelo | null = null
  if (velo !== null) {
    const bordeDeLaFranja = velo.borde + velo.rampa
    const densa = zona(S, V, { ...region, x1: Math.min(region.x1, Math.floor(velo.borde)) }, excluir)
    const rala = bordeDeLaFranja < region.x1 ? zona(S, V, { ...region, x0: Math.max(region.x0, Math.ceil(bordeDeLaFranja)) }, excluir) : null
    zonas = { borde: velo.borde, rampa: velo.rampa, franjaPx: Math.max(0, region.x1 - bordeDeLaFranja), franja: Math.max(0, region.x1 - bordeDeLaFranja) / A.ancho, densa, rala }
  }
  return {
    scrollY,
    pantalla: Math.round((scrollY / A.alto) * 100) / 100,
    bloques: lecturas,
    escena: {
      region,
      sinPanel,
      soloElPanel,
      conPanelSinTinta,
      varianzaQuePasa: razon(soloElPanel.varianza, sinPanel.varianza),
      varianzaConContenido: razon(conPanelSinTinta.varianza, sinPanel.varianza),
      desvioDeGrisQuePasa: razon(soloElPanel.grisDesvio, sinPanel.grisDesvio),
      zonas,
      logo: { area: logo.area, caja: logo.caja },
    },
    capturas: rutas,
  }
}

/** Por cada bloque, su PEOR lectura entre todas las posiciones de la sección. */
export function peorPorBloque(posiciones: readonly LecturaDePosicion[]): LecturaDeBloque[] {
  const peor = new Map<string, LecturaDeBloque>()
  for (const p of posiciones) {
    for (const b of p.bloques) {
      const previo = peor.get(b.clave)
      if (previo === undefined || b.peorContraste < previo.peorContraste) peor.set(b.clave, b)
    }
  }
  return [...peor.values()]
}

export type Veredicto = 'abre tal cual' | 'abre con el texto acotado' | 'no abre' | 'sin texto en cuadro'

export function veredictoDeLaSeccion(bloques: readonly LecturaDeBloque[]): Veredicto {
  if (bloques.length === 0) return 'sin texto en cuadro'
  const fallan = bloques.filter((b) => !b.pasaAA)
  if (fallan.length === 0) return 'abre tal cual'
  if (fallan.every((b) => b.pasariaAPlena)) return 'abre con el texto acotado'
  return 'no abre'
}

const f2 = (n: number): string => (Number.isNaN(n) ? '  —  ' : n.toFixed(2).padStart(6))
const pct = (n: number): string => (Number.isNaN(n) ? '  —' : `${(n * 100).toFixed(1).padStart(5)}%`)

export function imprimirBloques(bloques: readonly LecturaDeBloque[]): void {
  console.log('    bloque                                     px   opac  glifos    peor     p1  median  bajoAA  s/logo  plena  AA')
  for (const b of bloques.slice().sort((a, c) => a.peorContraste - c.peorContraste)) {
    const nombre = `${b.etiqueta}${b.pieza === null ? '' : `·${b.pieza}`}${b.nivel === null ? '' : `·${b.nivel}`} «${b.texto.slice(0, 22)}»`
    console.log(
      `    ${nombre.padEnd(42).slice(0, 42)} ${String(Math.round(b.tamanoPx)).padStart(3)}  ${b.opacidad.toFixed(2)}  ${String(b.pixelesDeGlifo).padStart(6)}  ${f2(b.peorContraste)} ${f2(b.p1Contraste)} ${f2(b.medianaContraste)}  ${String(b.bajoAA).padStart(6)}  ${pct(b.sobreElLogo)} ${f2(b.peorAPlena)}  ${b.pasaAA ? '✓' : '✗'}${b.grande ? ' (grande, 3:1)' : ''}`,
    )
  }
}

export function imprimirEscena(p: LecturaDePosicion): void {
  const e = p.escena
  console.log(
    `    y=${p.scrollY} (pantalla ${p.pantalla})  sala sin panel: media ${e.sinPanel.media.toFixed(4)} · var ${e.sinPanel.varianza.toExponential(3)} · p01 ${e.sinPanel.p01.toFixed(3)} · p99 ${e.sinPanel.p99.toFixed(3)}` +
      `  |  panel solo: media ${e.soloElPanel.media.toFixed(4)} · var ${e.soloElPanel.varianza.toExponential(3)}  →  pasa ${pct(e.varianzaQuePasa)} de la varianza de luminancia (con contenido ${pct(e.varianzaConContenido)}) · ${pct(e.desvioDeGrisQuePasa)} del desvío de gris (${e.sinPanel.grisDesvio.toFixed(1)} → ${e.soloElPanel.grisDesvio.toFixed(1)})` +
      `  |  logo: ${e.logo.area} px${e.logo.caja.length === 4 ? ` en [${e.logo.caja.join(', ')}]` : ' (no hay)'}`,
  )
  if (e.zonas !== null) {
    const z = e.zonas
    console.log(
      `      velo: columna densa hasta x=${z.borde} · rampa ${z.rampa} px · franja desnuda ${z.franjaPx} px (${pct(z.franja)} del ancho)` +
        ` · pasa en la densa ${pct(z.densa.pasaLuminancia)} lum · ${pct(z.densa.pasaGris)} gris (media ${z.densa.sinPanel.media.toFixed(3)} → ${z.densa.soloElPanel.media.toFixed(3)})` +
        (z.rala === null ? ' · sin franja' : ` · en la franja ${pct(z.rala.pasaLuminancia)} lum · ${pct(z.rala.pasaGris)} gris (media ${z.rala.sinPanel.media.toFixed(3)} → ${z.rala.soloElPanel.media.toFixed(3)})`),
    )
  }
}
