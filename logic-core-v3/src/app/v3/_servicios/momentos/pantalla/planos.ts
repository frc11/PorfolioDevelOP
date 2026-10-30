/**
 * [M3] LA PANTALLA QUE SE DIBUJA — los datos y la cuenta, puros (sin react) para los tests.
 *
 * El riesgo del prototipo 8 era que el alambre se leyera como un esquema de plantilla. Por eso no hay un alambre genérico: cada trabajo
 * tiene SU plano, calcado de su póster real (`public/portfolio/<slug>/escritorio.webp`, llevado a 1440 × 900), en el orden en que se lee
 * esa página. Lo que se dibuja es la página que después se abre adentro, no «una web».
 */

import { CURVAS } from '../../../_lib/motion/curvas'
import type { SlugDelProyecto } from '../../../_secciones/trabajos/proyectos'
import { tramo } from '../avance'

/** El lienzo del plano: el de los pósters de escritorio (16:10). */
export const LIENZO = { ancho: 1440, alto: 900 } as const

export type Traza =
  | { readonly t: 'linea'; readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }
  | { readonly t: 'rect'; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly r?: number }
  | { readonly t: 'circulo'; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly t: 'camino'; readonly d: string }

/** Un rótulo de la parte que se dibuja (`x`, `y` en el lienzo); aparece cuando su traza (`despues`, el índice) terminó. */
export interface RotuloDelPlano {
  readonly texto: string
  readonly x: number
  readonly y: number
  readonly despues: number
}

export interface Plano {
  readonly trazas: readonly Traza[]
  readonly rotulos: readonly RotuloDelPlano[]
}

const linea = (x1: number, y1: number, x2: number, y2: number): Traza => ({ t: 'linea', x1, y1, x2, y2 })
const rect = (x: number, y: number, w: number, h: number, r = 0): Traza => ({ t: 'rect', x, y, w, h, r })

/** Los planos, calcados de cada póster. Las líneas sueltas son renglones de texto; los rectángulos, botones, fotos y piezas. */
export const PLANOS: Readonly<Record<SlugDelProyecto, Plano>> = {
  'el-garage': {
    trazas: [
      linea(36, 42, 217, 42), // la marca
      linea(82, 66, 138, 66),
      linea(597, 50, 651, 50), // el menú
      linea(749, 50, 840, 50),
      rect(1250, 29, 156, 40, 20), // contacto
      linea(0, 97, 1440, 97), // el borde de la cabecera
      rect(105, 262, 110, 29, 14.5), // «est.»
      linea(105, 374, 608, 374), // el titular, dos renglones
      linea(105, 497, 777, 497),
      linea(105, 612, 403, 612), // la bajada
      rect(105, 668, 257, 53, 26.5), // «explorar colección»
      rect(692, 292, 703, 394, 6), // la foto del auto
    ],
    rotulos: [
      { texto: 'marca', x: 36, y: 128, despues: 1 },
      { texto: 'menú', x: 597, y: 128, despues: 3 },
      { texto: 'titular', x: 105, y: 545, despues: 8 },
      { texto: 'botón', x: 380, y: 700, despues: 10 },
      { texto: 'foto', x: 1312, y: 720, despues: 11 },
    ],
  },
  'esquina-estudio': {
    trazas: [
      { t: 'camino', d: 'M64 72 C 88 50, 104 78, 126 58 S 168 62, 208 44' }, // la firma de la marca
      { t: 'camino', d: 'M100 84 C 128 70, 158 88, 198 72' },
      linea(479, 61, 577, 61), // el menú
      linea(621, 61, 706, 61),
      linea(750, 61, 811, 61),
      linea(855, 61, 961, 61),
      linea(1150, 61, 1275, 61), // contactanos
      linea(1313, 61, 1370, 61),
      linea(472, 408, 966, 408), // el titular, al centro
      linea(472, 456, 966, 456),
      linea(64, 806, 130, 806), // el pie
      linea(206, 806, 307, 806),
      linea(356, 828, 551, 828),
      linea(1110, 816, 1207, 816),
      { t: 'camino', d: 'M1262 826 C 1290 800, 1320 832, 1370 798' },
    ],
    rotulos: [
      { texto: 'marca', x: 64, y: 128, despues: 1 },
      { texto: 'menú', x: 479, y: 104, despues: 5 },
      { texto: 'titular', x: 472, y: 500, despues: 9 },
      { texto: 'pie', x: 64, y: 770, despues: 14 },
    ],
  },
  'banu-scents': {
    trazas: [
      linea(0, 36, 1440, 36), // la franja del aviso
      linea(545, 18, 725, 18),
      linea(779, 18, 894, 18),
      linea(686, 97, 752, 97), // la marca, al centro
      { t: 'circulo', cx: 1235, cy: 100, r: 9 }, // buscar, la bolsa y el menú
      rect(1270, 91, 16, 18, 3),
      linea(1312, 100, 1365, 100),
      linea(1377, 94, 1391, 94),
      linea(1377, 106, 1391, 106),
      rect(498, 128, 377, 262, 8), // el frasco: la tapa, el cuerpo y la etiqueta
      rect(498, 390, 384, 390, 12),
      rect(607, 517, 160, 163, 4),
      linea(96, 236, 140, 690), // el sahumerio
      linea(156, 226, 176, 690),
      rect(591, 748, 258, 42, 2), // «ver catálogo»
    ],
    rotulos: [
      { texto: 'aviso', x: 545, y: 66, despues: 2 },
      { texto: 'marca', x: 686, y: 140, despues: 3 },
      { texto: 'producto', x: 905, y: 420, despues: 11 },
      { texto: 'botón', x: 870, y: 775, despues: 14 },
    ],
  },
}

/** Las medidas de los pósters (para `Imagen`, con movimiento reducido), leídas de los archivos. */
export const MEDIDAS_DE_LOS_POSTERS: Readonly<Record<SlugDelProyecto, { readonly escritorio: readonly [number, number]; readonly movil: readonly [number, number] }>> = {
  'el-garage': { escritorio: [1280, 800], movil: [390, 844] },
  'esquina-estudio': { escritorio: [1440, 900], movil: [690, 1494] },
  'banu-scents': { escritorio: [1440, 900], movil: [780, 1688] },
}

/** Los tramos de la secuencia, sobre el avance del recorrido (0 → 1). Encadenados: cada uno empieza donde el anterior se asentó. */
export const TRAMOS = {
  dibujo: [0.03, 0.36],
  apertura: [0.38, 0.52],
  angostado: [0.58, 0.9],
  cruce: [0.7, 0.8],
} as const

export interface FasesDeLaPantalla {
  /** Cuánto del plano está dibujado (0 → 1). */
  readonly dibujado: number
  /** Cuánto de la pantalla real se abrió desde el centro. */
  readonly abierto: number
  /** De la pantalla de escritorio al teléfono. */
  readonly angostado: number
  /** Del video de escritorio al del celular. */
  readonly cruce: number
  /** Qué texto acompaña: 0 el plano, 1 la pantalla real, 2 el celular. */
  readonly fase: 0 | 1 | 2
}

export function fasesDe(avance: number): FasesDeLaPantalla {
  const dibujado = tramo(avance, ...TRAMOS.dibujo)
  const abierto = CURVAS.principal(tramo(avance, ...TRAMOS.apertura))
  const angostado = CURVAS.simetrica(tramo(avance, ...TRAMOS.angostado))
  const cruce = tramo(avance, ...TRAMOS.cruce)
  const fase = avance >= TRAMOS.angostado[0] ? 2 : avance >= TRAMOS.apertura[0] ? 1 : 0
  return { dibujado, abierto, angostado, cruce, fase }
}

/** Cuánto de su tramo lleva la traza `i` de `n` cuando el plano va por `dibujado`: una después de la otra, en el orden de lectura. */
export function avanceDeLaTraza(dibujado: number, i: number, n: number): number {
  return Math.min(1, Math.max(0, dibujado * n - i))
}

/** Lo que tarda la repetición entera (de 0 al final) al cambiar de trabajo. */
export const REPETICION_MS = 2600

/**
 * [M3] Al cambiar de trabajo la secuencia se RE-CORRE sin tocar el scroll: lo que se muestra va de 0 hasta el avance del scroll en un
 * tiempo proporcional a lo que hay que recorrer. Nunca pasa al scroll: termina exactamente en él.
 */
export function avanceMostrado(avanceDelScroll: number, msDesdeElCambio: number | null): number {
  if (msDesdeElCambio === null) return avanceDelScroll
  const duracion = Math.max(500, REPETICION_MS * avanceDelScroll)
  return avanceDelScroll * CURVAS['simetrica-suave'](Math.min(1, Math.max(0, msDesdeElCambio / duracion)))
}

/** La repetición terminó. */
export function repeticionTerminada(avanceDelScroll: number, msDesdeElCambio: number): boolean {
  return msDesdeElCambio >= Math.max(500, REPETICION_MS * avanceDelScroll)
}

/** Las medidas del marco: de escritorio (16:10, lo que entra en la caja) a teléfono (9:19,5, el alto de la caja). */
export function medidasDelMarco(anchoDeLaCaja: number, altoDeLaCaja: number, angostado: number): { readonly ancho: number; readonly alto: number; readonly radio: number } {
  const anchoEscritorio = Math.min(anchoDeLaCaja, altoDeLaCaja * (LIENZO.ancho / LIENZO.alto))
  const altoEscritorio = anchoEscritorio / (LIENZO.ancho / LIENZO.alto)
  const altoTelefono = altoDeLaCaja
  const anchoTelefono = Math.min(anchoDeLaCaja, altoTelefono * (9 / 19.5))
  return {
    ancho: anchoEscritorio + (anchoTelefono - anchoEscritorio) * angostado,
    alto: altoEscritorio + (altoTelefono - altoEscritorio) * angostado,
    radio: 6 + 22 * angostado,
  }
}
