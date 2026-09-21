/**
 * BANCO DE TRATAMIENTOS — V3 (blend), V4 (backdrop) y V5 (burbuja de papel).
 *
 *     lo usan `g-cadena.ts` y `h-variantes.ts`
 *
 * ── Qué agrega sobre el banco de BLEND-1 ──────────────────────────────────
 *
 * Nada de lo que BLEND-1 ya hizo. `blend-comun.ts` sigue siendo el que abre el
 * Chrome, verifica el home y guarda los JSON; `scripts-b8/glifo-alfa.ts` sigue
 * siendo el que mide contraste bajo el glifo; `scripts-b5/pagina.ts` sigue
 * siendo el que apaga una capa y lee la caja del texto. Acá viven las TRES
 * cosas que ese banco no tenía:
 *
 *   1. **El sujeto es UNO y es la bajada.** BLEND-1 medía los ocho paneles con
 *      el lector de bloques de B8 (`data-b8-bloque`); este sprint mide un solo
 *      párrafo, así que no hace falta marcar nada: el selector alcanza. Y el
 *      titular NO se mide — a 768 y 375 no cruza el logo (VIDRIO §2: 17,60:1,
 *      el contraste del papel limpio, en ocho de nueve paradas).
 *   2. **Los tratamientos como capa inyectada.** V4 y V5 no son una propiedad
 *      del texto sino un elemento nuevo DETRAS de el, y hay un solo lugar donde
 *      puede ir (ver `PONER_LAS_CAPAS`).
 *   3. **La marca sobre el papel.** La pregunta «¿se ve el borde?» no es una
 *      cuenta de contraste: es un diferencial de dos capturas con el texto
 *      apagado, y se mide en niveles sRGB.
 *
 * ── ⚠️ EL DETECTOR DE APILADO NO SE COPIA: SE LEE DEL ARCHIVO ─────────────
 *
 * `a-cadena.ts` tiene el detector de contextos de apilamiento —treinta ramas,
 * CSS Positioned Layout §9 mas CSS Compositing §5.1— en un `const` privado del
 * modulo. Copiarlo aca seria tener dos listas que envejecen por separado, y
 * exportarlo alla seria modificar un archivo del arbol, que este sprint no
 * puede. Asi que se **lee del fuente en tiempo de corrida** y se desescapa la
 * unica secuencia que el literal lleva. Si el bloque no esta donde se lo busca,
 * tira: no hay forma de que la copia se desincronice porque no hay copia.
 */

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'

import { capturar } from '../scripts-b4/captura'
import { AA_TEXTO_NORMAL, contraste, luminancia } from '../scripts-b4/color'
import { medir, type Pagina } from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import type { CajaDeTexto } from '../scripts-b5/glifo'
import { ocultarPorSelector } from '../scripts-b5/pagina'
import { leerImagen, mascaraDeGlifo, type Imagen, type Mascara } from '../scripts-b8/glifo-alfa'

import { RAIZ_DE_SALIDAS, TEMP } from './blend-comun'

// ─────────────────────────────────────────────────────────────────────────────
// EL SUJETO, LAS PARADAS Y LAS CONSTANTES DEL SPRINT
// ─────────────────────────────────────────────────────────────────────────────

/** La bajada: el parrafo de «develOP es una agencia…». Es el unico texto que cruza el logo a estos anchos. */
export const BAJADA = '[data-panel="quienes-somos"] [data-composicion="agencia"] p'

/** El envoltorio de la escena (`fixed inset-0 z-0`), y la raiz que contiene a la escena Y al texto. */
export const ESCENA = '[data-escena]'
export const RAIZ_V3 = '[data-v3]'

/** Los dos anchos que el pedido nombra, los dos abajo del umbral de 1025. */
export const PERFILES: readonly Perfil[] = [perfilPorId('768'), perfilPorId('375')]

/** La parada de CRUCE por ancho. La da el pedido y la midio VIDRIO barriendo la primera pantalla. */
export const CRUCE: Readonly<Record<string, number>> = { '768': 1262, '375': 848 }

/** Lo que la escena tarda en pintar y asentarse. Es el numero de B5/B6/B8. */
export const ASENTAMIENTO_MS = 4500

/** Dos cuadros de gracia despues de tocar el DOM, antes de fotografiar. */
export const GRACIA_MS = 420

/**
 * LA ZONA MUERTA, EN LA BANDA QUE EL PEDIDO PIDE.
 *
 * `blend-comun.ts` declara 102–153 —el nucleo, «fondo entre el 40 % y el 60 %
 * del rango»— y en su propio docblock dice que ESA definicion subestima el
 * problema: calculado sobre la misma formula, el blend con fuente blanca queda
 * **bajo 4,5:1 con el fondo en sRGB [73, 182]**. O sea que los 73–182 que pide
 * el pedido no son otra banda: son exactamente la banda de fracaso AA, y por eso
 * este banco las publica LAS DOS — la del pedido como cifra y la estrecha como
 * piso comparable con BLEND-1.
 */
export const ZONA_MUERTA_AA = { desde: 73, hasta: 182 } as const
export const ZONA_MUERTA_NUCLEO = { desde: 102, hasta: 153 } as const

/**
 * Cuantos niveles sRGB de diferencia cuentan como «se ve la marca».
 *
 * No es un gusto: sobre un campo plano y con un borde definido, el umbral de
 * deteccion humana esta alrededor de 1–2 niveles de 255 (la banda de Mach hace
 * visible un escalon que en un degradado no se veria). Se toma 2 y se publica el
 * maximo medido al lado, para que el numero mande sobre el veredicto.
 */
export const TOLERANCIA_DE_MARCA = 2

// ─────────────────────────────────────────────────────────────────────────────
// EL DETECTOR DE APILADO, LEIDO DEL FUENTE DE `a-cadena.ts`
// ─────────────────────────────────────────────────────────────────────────────

const ARCHIVO_DEL_DETECTOR = 'scripts-blend/a-cadena.ts'
const ABRE_EL_DETECTOR = 'const FUENTE_DEL_DETECTOR = '

/** El detector de `a-cadena.ts`, tal como esta escrito alla. Ver el docblock del archivo. */
export function fuenteDelDetector(): string {
  const src = readFileSync(ARCHIVO_DEL_DETECTOR, 'utf8')
  const i = src.indexOf(ABRE_EL_DETECTOR)
  if (i < 0) throw new Error(`no esta FUENTE_DEL_DETECTOR en ${ARCHIVO_DEL_DETECTOR}: el banco de BLEND-1 cambio`)
  const acento = String.fromCharCode(96)
  const desde = src.indexOf(acento, i) + 1
  const hasta = src.indexOf(acento, desde)
  if (desde <= 0 || hasta < 0) throw new Error('el literal del detector no cierra')
  const crudo = src.slice(desde, hasta)
  if (!crudo.includes('const apila =') || !crudo.includes('const describir =')) {
    throw new Error('el bloque leido no es el detector: no trae `apila` ni `describir`')
  }
  // La unica secuencia escapada del literal es la barra doble de la rama de `contain`.
  return crudo.split('\\\\').join('\\')
}

// ─────────────────────────────────────────────────────────────────────────────
// EL DESTRABE — las cinco reglas que BLEND-1 midio, verificadas contra su fuente
// ─────────────────────────────────────────────────────────────────────────────

const ARCHIVO_DEL_DESTRABE = 'scripts-blend/b-contraste.ts'

/**
 * ⚠️ **ESTO NO ES UNA PROPUESTA DE PRODUCTO: ES LA ENTRADA DEL INSTRUMENTO.**
 *
 * Con la cadena cortada, `mix-blend-mode: difference` no mezcla contra la escena
 * y el numero que se mediria seria el de blanco sobre blanco — la falla, no el
 * blend. BLEND-1 §1.4 dejo escritas las cinco reglas que destraban la cadena
 * abajo de 1025 y el costo real de aplicarlas (mudar el piso de papel a `body`,
 * tocar la capa de apilamiento del sitio entero). Aca se reusan **tal cual**,
 * para poder fotografiar el blend de verdad, y se verifica linea por linea que
 * siguen escritas alla: si BLEND-1 cambia su destrabe, este banco tira antes de
 * medir en vez de medir otra cosa con el mismo nombre.
 */
export const LINEAS_DEL_DESTRABE: readonly string[] = [
  'body { background-color: var(--color-fondo) !important }',
  '[data-v3] { background-color: transparent !important; isolation: isolate !important }',
  '[data-escena] { z-index: -1 !important }',
  'main { z-index: auto !important }',
  '[data-panel] { z-index: auto !important }',
]

export function verificarElDestrabe(): void {
  const src = readFileSync(ARCHIVO_DEL_DESTRABE, 'utf8')
  const faltan = LINEAS_DEL_DESTRABE.filter((l) => !src.includes(l))
  if (faltan.length > 0) {
    throw new Error(`el destrabe de BLEND-1 cambio; faltan en ${ARCHIVO_DEL_DESTRABE}: ${faltan.join(' | ')}`)
  }
}

const ID_DEL_DESTRABE = 'blend2-destrabe'

export function DESTRABAR(poner: boolean): string {
  const comprobacion = [
    '(() => {',
    "  const e = document.querySelector('[data-escena]')",
    "  const r = document.querySelector('[data-v3]')",
    "  const m = document.querySelector('main')",
    "  if (e === null || r === null || m === null) return { tomo: false, porque: 'falta un nodo' }",
    '  const ce = getComputedStyle(e), cr = getComputedStyle(r), cm = getComputedStyle(m)',
    `  const bien = ${poner}`,
    "    ? ce.zIndex === '-1' && cr.isolation === 'isolate' && cm.zIndex === 'auto'",
    "    : ce.zIndex === '0' && cr.isolation === 'auto' && cm.zIndex === '10'",
    "  return { tomo: bien, porque: 'escena z=' + ce.zIndex + ' | raiz iso=' + cr.isolation + ' | main z=' + cm.zIndex }",
    '})()',
  ].join('\n')
  return regla(ID_DEL_DESTRABE, poner ? LINEAS_DEL_DESTRABE.join('\n') : null, comprobacion)
}

// ─────────────────────────────────────────────────────────────────────────────
// V3 — EL BLEND SOBRE LA BAJADA
// ─────────────────────────────────────────────────────────────────────────────

const ID_DEL_BLEND = 'blend2-difference'

/** `mix-blend-mode: difference` con tinta blanca, sobre el parrafo y nada mas. */
export function PONER_EL_BLEND(poner: boolean): string {
  const css = [
    `${BAJADA} {`,
    '  mix-blend-mode: difference !important;',
    '  color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;',
    '}',
  ].join('\n')
  const comprobacion = [
    '(() => {',
    `  const p = document.querySelector(${JSON.stringify(BAJADA)})`,
    "  if (p === null) return { tomo: false, porque: 'no esta la bajada' }",
    '  const cs = getComputedStyle(p)',
    `  const esperado = ${poner} ? 'difference' : 'normal'`,
    "  return { tomo: cs.mixBlendMode === esperado, porque: 'blend=' + cs.mixBlendMode + ' color=' + cs.color }",
    '})()',
  ].join('\n')
  return regla(ID_DEL_BLEND, poner ? css : null, comprobacion)
}

// ─────────────────────────────────────────────────────────────────────────────
// V4 y V5 — LA CAPA DETRAS DEL TEXTO
// ─────────────────────────────────────────────────────────────────────────────

export interface Rect {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

const ID_DE_LAS_CAPAS = 'blend2-capas'

/**
 * ⚠️ **HAY UN SOLO LUGAR DONDE LA CAPA PUEDE IR, Y SALE DE LEER EL ARBOL VIVO.**
 *
 * Medido con la sonda de estructura, a 768 y con la escena montada:
 *
 *     div[data-v3]              relative | z auto | bg rgb(247,247,245)  <- el piso de papel
 *       div[data-escena]        fixed    | z 0                           <- el canvas
 *       main                    relative | z 10
 *         section[data-panel]   relative | z 10                          <- CORTA el blend
 *           … p (la bajada)
 *
 * `[data-v3]` es `relative` con `z-index: auto`, o sea que **no abre contexto de
 * apilamiento**: sus descendientes posicionados —la escena en 0 y `main` en 10—
 * apilan en el contexto de la RAIZ, y su propio fondo de papel se pinta antes
 * que los dos. Por eso una capa colgada de `[data-v3]` con `position: fixed` y
 * `z-index: 5` cae exactamente en el hueco: **arriba del canvas y abajo del
 * texto**, sin tocar un solo nodo del producto.
 *
 * Un `z-index: -1` adentro de `main` habria servido igual, pero abre una trampa
 * que este banco no puede permitirse: una capa de z negativo se pinta debajo del
 * fondo de su propio elemento, y para `backdrop-filter` eso cambia que es el
 * backdrop. Con la capa colgada de la raiz, el backdrop es lo que se ve: papel y
 * escena.
 */
export function PONER_LAS_CAPAS(rects: readonly Rect[], estiloPropio: string): string {
  return [
    '(async () => {',
    `  const viejo = document.getElementById(${JSON.stringify(ID_DE_LAS_CAPAS)})`,
    '  if (viejo !== null) viejo.remove()',
    `  const raiz = document.querySelector(${JSON.stringify(RAIZ_V3)})`,
    "  if (raiz === null) return { tomo: false, porque: 'no esta la raiz [data-v3]', capas: 0 }",
    '  const envoltorio = document.createElement("div")',
    `  envoltorio.id = ${JSON.stringify(ID_DE_LAS_CAPAS)}`,
    `  for (const r of ${JSON.stringify(rects)}) {`,
    '    const capa = document.createElement("div")',
    '    capa.setAttribute("data-blend2-capa", "")',
    '    capa.style.cssText = "position:fixed;pointer-events:none;z-index:5;left:" + r.x + "px;top:" + r.y + "px;width:" + r.ancho + "px;height:" + r.alto + "px;" + ' +
      JSON.stringify(estiloPropio),
    '    envoltorio.appendChild(capa)',
    '  }',
    '  raiz.appendChild(envoltorio)',
    '  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))',
    '  const puestas = [...document.querySelectorAll("[data-blend2-capa]")]',
    '  const primera = puestas.length === 0 ? null : getComputedStyle(puestas[0])',
    '  return {',
    `    tomo: puestas.length === ${rects.length},`,
    '    capas: puestas.length,',
    '    porque: primera === null ? "ninguna capa" : "z=" + primera.zIndex + " backdrop=" + primera.backdropFilter + " bg=" + primera.backgroundImage.slice(0, 70),',
    '  }',
    '})()',
  ].join('\n')
}

export const SACAR_LAS_CAPAS = [
  '(async () => {',
  `  const viejo = document.getElementById(${JSON.stringify(ID_DE_LAS_CAPAS)})`,
  '  if (viejo !== null) viejo.remove()',
  '  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))',
  '  return { tomo: document.querySelectorAll("[data-blend2-capa]").length === 0, capas: 0, porque: "sacadas" }',
  '})()',
].join('\n')

export interface Puesto {
  readonly tomo: boolean
  readonly porque: string
  readonly capas?: number
}

/** El envoltorio comun de «poner o sacar una hoja de estilo con id, y devolver lo que el navegador computo». */
function regla(id: string, css: string | null, comprobacion: string): string {
  const poner =
    css === null
      ? ''
      : `  const estilo = document.createElement("style"); estilo.id = ${JSON.stringify(id)}; estilo.textContent = ${JSON.stringify(css)}; document.head.appendChild(estilo)`
  return [
    '(async () => {',
    `  const viejo = document.getElementById(${JSON.stringify(id)})`,
    '  if (viejo !== null) viejo.remove()',
    poner,
    '  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))',
    `  return ${comprobacion}`,
    '})()',
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// LAS CAJAS DEL TEXTO — el bloque, y renglon por renglon
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La caja del parrafo y una caja POR RENGLON.
 *
 * Los renglones no se derivan del alto de linea: salen de `Range.getClientRects()`
 * sobre los nodos de texto, que es lo que el navegador uso para romper el
 * parrafo. Derivarlos de la metrica daria una caja de mas o de menos el dia que
 * el ancho cambie una palabra de renglon.
 */
export const LECTOR_DE_CAJAS = [
  '(() => {',
  `  const p = document.querySelector(${JSON.stringify(BAJADA)})`,
  '  if (p === null) return { hay: false, bloque: null, renglones: [], ventana: { ancho: 0, alto: 0 } }',
  '  const r = p.getBoundingClientRect()',
  '  const renglones = []',
  '  const paseo = document.createTreeWalker(p, NodeFilter.SHOW_TEXT)',
  '  let nodo = paseo.nextNode()',
  '  while (nodo !== null) {',
  '    const rango = document.createRange()',
  '    rango.selectNodeContents(nodo)',
  '    for (const caja of rango.getClientRects()) {',
  '      if (caja.width > 1 && caja.height > 1) renglones.push({ x: caja.x, y: caja.y, ancho: caja.width, alto: caja.height })',
  '    }',
  '    nodo = paseo.nextNode()',
  '  }',
  '  return {',
  '    hay: true,',
  '    bloque: { x: r.x, y: r.y, ancho: r.width, alto: r.height },',
  '    renglones,',
  '    ventana: { ancho: window.innerWidth, alto: window.innerHeight },',
  '  }',
  '})()',
].join('\n')

export interface CajasDelTexto {
  readonly hay: boolean
  readonly bloque: Rect | null
  readonly renglones: readonly Rect[]
  readonly ventana: { readonly ancho: number; readonly alto: number }
}

/** Infla una caja por un factor en cada eje, alrededor de su centro. */
export function inflar(r: Rect, kx: number, ky: number): Rect {
  const cx = r.x + r.ancho / 2
  const cy = r.y + r.alto / 2
  const ancho = r.ancho * kx
  const alto = r.alto * ky
  return { x: cx - ancho / 2, y: cy - alto / 2, ancho, alto }
}

/** Redondea una caja a pixeles enteros, hacia afuera. */
export function aPixeles(r: Rect): Rect {
  const x = Math.floor(r.x)
  const y = Math.floor(r.y)
  return { x, y, ancho: Math.ceil(r.x + r.ancho) - x, alto: Math.ceil(r.y + r.alto) - y }
}

/** La caja que contiene a todas: para medir la marca de un tratamiento de varias capas. */
export function unir(rects: readonly Rect[]): Rect {
  const x = Math.min(...rects.map((r) => r.x))
  const y = Math.min(...rects.map((r) => r.y))
  const x1 = Math.max(...rects.map((r) => r.x + r.ancho))
  const y1 = Math.max(...rects.map((r) => r.y + r.alto))
  return { x, y, ancho: x1 - x, alto: y1 - y }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAS CUENTAS SOBRE LOS PIXELES
// ─────────────────────────────────────────────────────────────────────────────

export interface Lectura {
  readonly pixeles: number
  readonly peor: number
  readonly p1: number
  readonly mediana: number
  readonly bajoAA: number
  readonly bajoAAPct: number
}

const dos = (n: number): number => Math.round(n * 100) / 100

function resumir(razones: readonly number[]): Lectura {
  const o = [...razones].sort((a, b) => a - b)
  const en = (q: number): number => (o.length === 0 ? Number.NaN : o[Math.min(o.length - 1, Math.floor(q * o.length))])
  const bajo = o.filter((r) => r < AA_TEXTO_NORMAL).length
  return {
    pixeles: o.length,
    peor: o.length === 0 ? Number.NaN : dos(o[0]),
    p1: dos(en(0.01)),
    mediana: dos(en(0.5)),
    bajoAA: bajo,
    bajoAAPct: o.length === 0 ? Number.NaN : dos((100 * bajo) / o.length),
  }
}

const gris = (d: Uint8Array, k: number): number => (d[k] + d[k + 1] + d[k + 2]) / 3

/** La mascara de glifo: sale de T, la captura con la escena apagada (texto sobre papel plano). */
export function mascara(T: Imagen, cajas: readonly CajaDeTexto[]): Mascara {
  const m = mascaraDeGlifo(T, cajas)
  if (m.indices.length === 0) throw new Error('la mascara de glifo salio vacia')
  return m
}

/** Contraste con una tinta FIJA sobre el fondo de A, pixel por pixel. Es V0, V4 y V5. */
export function conTintaFija(m: Mascara, A: Imagen, tinta: readonly [number, number, number]): Lectura {
  const lt = luminancia(tinta[0], tinta[1], tinta[2])
  const razones: number[] = []
  for (let i = 0; i < m.indices.length; i += 1) {
    const k = m.indices[i] * 4
    razones.push(contraste(lt, luminancia(A.datos[k], A.datos[k + 1], A.datos[k + 2])))
  }
  return resumir(razones)
}

/**
 * EL BLEND, DERIVADO: `difference` con fuente blanca da `255 - fondo`, canal por
 * canal y en sRGB con gamma (no en luminancia lineal — el blend no linealiza).
 *
 * ⚠️ Es un TECHO, no una estimacion. BLEND-1 §2.4 comparo esta derivacion contra
 * lo que el navegador pinto de verdad con la cadena destrabada y midio que lo
 * pintado es **7,9–10,1 pp peor** de forma consistente, por el antialias: en el
 * borde del glifo la cobertura es parcial, el resultado es una mezcla y cae mas
 * cerca del fondo. Por eso este banco publica tambien la columna PINTADA.
 */
export function blendDerivado(m: Mascara, A: Imagen): Lectura {
  const razones: number[] = []
  for (let i = 0; i < m.indices.length; i += 1) {
    const k = m.indices[i] * 4
    const r = A.datos[k]
    const g = A.datos[k + 1]
    const b = A.datos[k + 2]
    razones.push(contraste(luminancia(255 - r, 255 - g, 255 - b), luminancia(r, g, b)))
  }
  return resumir(razones)
}

export interface LecturaPintada extends Lectura {
  /** Que fraccion de los pixeles que DISCRIMINAN coincide con `255 - fondo`. El discriminador de BLEND-1 §1.3. */
  readonly coincidencia: number
  readonly discriminantes: number
}

/**
 * EL BLEND, PINTADO: la tinta es lo que la captura B tiene, y el fondo lo que
 * tiene A. Trae ademas el discriminador de BLEND-1 §1.3 —¿el navegador pinto
 * `255 - fondo` o pinto blanco?— contado **solo donde las dos hipotesis predicen
 * distinto** (fondo >= 55 en sRGB), porque sobre el logo casi negro `255 - fondo`
 * y el blanco de la cadena cortada son el mismo numero.
 */
/**
 * La tinta del blend NO siempre es blanca: el banco inyecta `#ffffff` pero el
 * arbol aplicado usa el token del papel (`--color-fondo`, 247/247/245), y
 * `difference` da `|fondo - fuente|`. Con la fuente equivocada la prediccion se
 * corre 8 niveles y la coincidencia miente.
 */
export function blendPintado(
  m: Mascara,
  A: Imagen,
  B: Imagen,
  fuente: readonly [number, number, number] = [255, 255, 255],
): LecturaPintada {
  const razones: number[] = []
  let discriminantes = 0
  let aciertos = 0
  for (let i = 0; i < m.indices.length; i += 1) {
    const k = m.indices[i] * 4
    const fr = A.datos[k]
    const fg = A.datos[k + 1]
    const fb = A.datos[k + 2]
    const br = B.datos[k]
    const bg = B.datos[k + 1]
    const bb = B.datos[k + 2]
    razones.push(contraste(luminancia(br, bg, bb), luminancia(fr, fg, fb)))
    if (gris(A.datos, k) >= 55) {
      discriminantes += 1
      const d = Math.max(
        Math.abs(br - Math.abs(fr - fuente[0])),
        Math.abs(bg - Math.abs(fg - fuente[1])),
        Math.abs(bb - Math.abs(fb - fuente[2])),
      )
      if (d <= 8) aciertos += 1
    }
  }
  const l = resumir(razones)
  return {
    ...l,
    discriminantes,
    coincidencia: discriminantes === 0 ? Number.NaN : dos((100 * aciertos) / discriminantes),
  }
}

export interface ZonaMuerta {
  readonly pctAA: number
  readonly pctNucleo: number
  readonly fondoMediano: number
}

/** Que fraccion del area bajo los glifos tiene un FONDO en la banda donde el blend desaparece. */
export function zonaMuerta(m: Mascara, A: Imagen): ZonaMuerta {
  let aa = 0
  let nucleo = 0
  const grises: number[] = []
  for (let i = 0; i < m.indices.length; i += 1) {
    const k = m.indices[i] * 4
    const g = gris(A.datos, k)
    grises.push(g)
    if (g >= ZONA_MUERTA_AA.desde && g <= ZONA_MUERTA_AA.hasta) aa += 1
    if (g >= ZONA_MUERTA_NUCLEO.desde && g <= ZONA_MUERTA_NUCLEO.hasta) nucleo += 1
  }
  grises.sort((a, b) => a - b)
  return {
    pctAA: dos((100 * aa) / m.indices.length),
    pctNucleo: dos((100 * nucleo) / m.indices.length),
    fondoMediano: dos(grises[Math.floor(grises.length / 2)]),
  }
}

export interface Marca {
  /** El maximo |delta| en niveles sRGB adentro del rect, con el texto apagado en las dos capturas. */
  readonly maximo: number
  readonly media: number
  /** Que fraccion del rect se movio mas que la tolerancia. */
  readonly pctMovido: number
  /** El |delta| maximo en la banda de 3 px que cruza el borde del rect: el «se ve el canto». */
  readonly enElBorde: number
  readonly deja: boolean
  /**
   * EL CENTINELA. El |delta| maximo AFUERA del rect.
   *
   * El tratamiento esta confinado al rect, asi que todo lo que se mueva afuera es
   * otra cosa que cambio entre las dos capturas, y si eso pasa el numero de
   * adentro tampoco vale. Existe porque paso: a 375 la marca de V5a dio 224 en
   * las filas 607-666 —el alto exacto de la pastilla de navegacion— con el papel
   * en 247 de un lado y 23 del otro. No era la nube: era la pastilla apareciendo
   * entre la captura de control y la del tratamiento.
   */
  readonly derivaAfuera: number
}

/**
 * LA MARCA QUE UN TRATAMIENTO DEJA SOBRE EL PAPEL.
 *
 * Dos capturas con el TEXTO APAGADO —una sin tratamiento y otra con— y la
 * diferencia por pixel adentro del rect del tratamiento, mas una banda de 3 px
 * que cruza su borde. El texto se apaga en las dos porque la pregunta no es si
 * el texto se lee: es si el rectangulo se ve.
 */
export function marcaEnElRect(base: Imagen, tratada: Imagen, r: Rect): Marca {
  if (base.ancho !== tratada.ancho || base.alto !== tratada.alto) throw new Error('las dos capturas no miden lo mismo')
  const x0 = Math.max(0, Math.floor(r.x))
  const y0 = Math.max(0, Math.floor(r.y))
  const x1 = Math.min(base.ancho, Math.ceil(r.x + r.ancho))
  const y1 = Math.min(base.alto, Math.ceil(r.y + r.alto))
  const delta = (k: number): number =>
    Math.max(
      Math.abs(base.datos[k] - tratada.datos[k]),
      Math.abs(base.datos[k + 1] - tratada.datos[k + 1]),
      Math.abs(base.datos[k + 2] - tratada.datos[k + 2]),
    )
  let maximo = 0
  let suma = 0
  let n = 0
  let movidos = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const d = delta((y * base.ancho + x) * 4)
      maximo = Math.max(maximo, d)
      suma += d
      n += 1
      if (d > TOLERANCIA_DE_MARCA) movidos += 1
    }
  }
  const banda = 3
  let enElBorde = 0
  for (let y = Math.max(0, y0 - banda); y < Math.min(base.alto, y1 + banda); y += 1) {
    for (let x = Math.max(0, x0 - banda); x < Math.min(base.ancho, x1 + banda); x += 1) {
      const adentro = x >= x0 + banda && x < x1 - banda && y >= y0 + banda && y < y1 - banda
      if (adentro) continue
      enElBorde = Math.max(enElBorde, delta((y * base.ancho + x) * 4))
    }
  }
  let derivaAfuera = 0
  for (let y = 0; y < base.alto; y += 1) {
    for (let x = 0; x < base.ancho; x += 1) {
      if (x >= x0 && x < x1 && y >= y0 && y < y1) continue
      derivaAfuera = Math.max(derivaAfuera, delta((y * base.ancho + x) * 4))
    }
  }
  return {
    maximo,
    media: n === 0 ? Number.NaN : dos(suma / n),
    pctMovido: n === 0 ? Number.NaN : dos((100 * movidos) / n),
    enElBorde,
    deja: maximo > TOLERANCIA_DE_MARCA,
    derivaAfuera,
  }
}

/** Que tan plano es el fondo adentro de un rect: para decidir si una parada es de verdad LIMPIO. */
export function planicie(A: Imagen, r: Rect): { readonly medio: number; readonly minimo: number; readonly pctOscuro: number } {
  const x0 = Math.max(0, Math.floor(r.x))
  const y0 = Math.max(0, Math.floor(r.y))
  const x1 = Math.min(A.ancho, Math.ceil(r.x + r.ancho))
  const y1 = Math.min(A.alto, Math.ceil(r.y + r.alto))
  let suma = 0
  let n = 0
  let minimo = 255
  let oscuros = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const g = gris(A.datos, (y * A.ancho + x) * 4)
      suma += g
      n += 1
      minimo = Math.min(minimo, g)
      if (g < 230) oscuros += 1
    }
  }
  return {
    medio: n === 0 ? Number.NaN : dos(suma / n),
    minimo: dos(minimo),
    pctOscuro: n === 0 ? Number.NaN : dos((100 * oscuros) / n),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURA — todo a TEMP, y al final se copia lo que se entrega
// ─────────────────────────────────────────────────────────────────────────────

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
}

export function rutaTemporal(nombre: string): string {
  return `${TEMP}/${nombre}.png`
}

/**
 * ⚠️ **LAS INTERMEDIAS VAN AFUERA DEL ARBOL, Y LAS QUE SE ENTREGAN SE COPIAN AL
 * FINAL.** Una captura escrita adentro del repo mientras el dev server mira hace
 * recompilar en medio de la medicion (leccion de `blend-comun.ts`), y una carpeta
 * intrusa envenena la auto-deteccion de fuentes de Tailwind 4. Asi que todo se
 * escribe en TEMP y recien cuando no queda nada por medir se copia lo entregable.
 */
export function entregar(nombreTemporal: string, nombreFinal: string): void {
  copyFileSync(rutaTemporal(nombreTemporal), `${RAIZ_DE_SALIDAS}/${nombreFinal}.png`)
}

export function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Scroll real, con dos cuadros de gracia. La receta prohibe verificarlo por geometria. */
export async function scrollA(p: Pagina, y: number): Promise<number> {
  return medir<number>(
    p,
    `(async () => { window.scrollTo(0, ${y}); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return window.scrollY })()`,
  )
}

/** Una captura del viewport entero, sin `clip`. VIDRIO midio que `clip` apaga estados y recorta mal. */
export async function foto(p: Pagina, nombre: string): Promise<Imagen> {
  await esperar(GRACIA_MS)
  await capturar(p, rutaTemporal(nombre))
  return leerImagen(rutaTemporal(nombre))
}

/** La captura A: el FONDO que hay bajo el texto, con el texto apagado. */
export async function fotoDelFondo(p: Pagina, nombre: string): Promise<Imagen> {
  if (!(await ocultarPorSelector(p, BAJADA, true))) throw new Error('no se pudo apagar la bajada')
  const img = await foto(p, nombre)
  await ocultarPorSelector(p, BAJADA, false)
  await esperar(GRACIA_MS)
  return img
}

/**
 * ⚠️ **EL INDICADOR DE DEV DE NEXT ENTRA EN LAS CAPTURAS, Y MINTIO 224 NIVELES.**
 *
 * `next dev` cuelga un `<nextjs-portal>` de `body` y pinta su badge en la esquina
 * inferior izquierda. No es la pagina, pero SI esta en la captura, y cambia de
 * ancho por su cuenta entre una foto y la siguiente. La marca de V5a a 375 dio
 * `max 224` por eso: la nube de esa variante mide 300x931 en un viewport de
 * 375x667, o sea que su rect llega a la esquina, y el badge quedo adentro. Las
 * dos pruebas de que era el badge: el delta vivia en las filas 607-666 con el
 * papel en 247 de un lado y 23 del otro, y su ancho se movio de x=[25..102] a
 * x=[25..50] entre las dos capturas — un texto que cambio, no un borde.
 *
 * Se apaga una vez por sesion. En produccion el selector no matchea y la funcion
 * no hace nada, que es lo correcto.
 */
export const OVERLAY_DE_DEV = 'nextjs-portal'

export async function apagarElOverlayDeDev(p: Pagina): Promise<boolean> {
  return ocultarPorSelector(p, OVERLAY_DE_DEV, true)
}

/** La captura T: el texto sobre papel plano, con la escena apagada. De aca sale la mascara y solo la mascara. */
export async function fotoDeLaMascara(p: Pagina, nombre: string): Promise<Imagen> {
  if (!(await ocultarPorSelector(p, ESCENA, true))) throw new Error('no se pudo apagar la escena')
  const img = await foto(p, nombre)
  await ocultarPorSelector(p, ESCENA, false)
  await esperar(GRACIA_MS)
  return img
}
