/**
 * [B1] LOS GUIONES DE LOS VIDEOS DEL PORTFOLIO — qué se recorre de cada sitio, en tiempo de PÁGINA.
 *
 * Los videos van a 2×: cada segundo de video son dos de página (`PAGINA_POR_CUADRO`, a 30 cuadros por segundo de salida). Un guion
 * suma ~20–24 s de página → 10–12 s de video. Cada tramo es una visita a una ruta del sitio (sólo GET: ningún clic, ningún
 * formulario); entre tramos el video funde (`FUNDIDO_S`). Los recorridos se decidieron mirando cada sitio en los dos dispositivos
 * (la sonda de B1.1a): lo que muestra el trabajo que dice la ficha.
 *
 *   · El Garage — «un catálogo de muchos filtros»: la portada hasta los últimos ingresos y el catálogo con sus filtros.
 *   · Esquina Estudio — «una página acorde a su estética y su marca»: la portada (una pantalla), los proyectos y los servicios.
 *   · Banú Scents — «una página simple pero bonita»: la portada de arriba a abajo, con pausas en cada bloque.
 */

import { homedir } from 'node:os'
import path from 'node:path'

export type Dispositivo = 'escritorio' | 'movil'
export type SlugGrabado = 'el-garage' | 'esquina-estudio' | 'banu-scents'

/** Un movimiento: quedarse quieto `s` segundos, o ir al scroll `hasta` (px CSS) en `s` segundos de página. */
export type Movimiento = { readonly quieto: number } | { readonly hasta: number; readonly s: number }

export interface Tramo {
  readonly ruta: string
  readonly movimientos: readonly Movimiento[]
}

export const CUADROS_POR_SEGUNDO = 30
/** A 2×: cada cuadro de salida son dos treintavos de segundo de página. */
export const PAGINA_POR_CUADRO_MS = (2 * 1000) / CUADROS_POR_SEGUNDO
export const FUNDIDO_S = 0.3

/** Escritorio a 1440 × 900 (16:10, el formato de la tira); teléfono a 390 × 844 con escala 2 (cuadros de 780 × 1688). */
export const PANTALLAS: Readonly<Record<Dispositivo, { readonly ancho: number; readonly alto: number; readonly escala: number }>> = {
  escritorio: { ancho: 1440, alto: 900, escala: 1 },
  movil: { ancho: 390, alto: 844, escala: 2 },
}

/** El techo de cada video (~1–2 MB, la spec). Lo afirma s76 contra los archivos. */
export const TECHO_BYTES = 2_000_000

/** El recibo de la codificación: bytes, CRF, resolución y duración de cada medio (lo escribe `codificar.ts`, lo lee s76). */
export const RECIBO_DE_LOS_MEDIOS = path.join('docs', 'rediseno', 'entregas', 'b1-portfolio', 'medios.json')

export interface MedioCodificado {
  readonly video: string
  readonly poster: string
  readonly bytesDelVideo: number
  readonly bytesDelPoster: number
  readonly crf: number
  readonly ancho: number
  readonly alto: number
  readonly segundos: number
  readonly cuadros: number
}

/** Los cuadros crudos: afuera del repo, en la caché del banco (tope de 5 GB); `codificar.ts` los borra. */
export const CARPETA_DE_CUADROS = path.join(homedir(), '.cache', 'b4-medicion', 'b1-portfolio')

export const SITIOS: Readonly<Record<SlugGrabado, string>> = {
  'el-garage': 'https://elgarageautomoviles.com.ar',
  'esquina-estudio': 'https://esquinaestudio.com.ar',
  'banu-scents': 'https://banuscents.com.ar',
}

export const GUIONES: Readonly<Record<SlugGrabado, Readonly<Record<Dispositivo, readonly Tramo[]>>>> = {
  'el-garage': {
    escritorio: [
      { ruta: '/', movimientos: [{ quieto: 2 }, { hasta: 2850, s: 8 }, { quieto: 1 }] },
      { ruta: '/catalogo', movimientos: [{ quieto: 1.6 }, { hasta: 1300, s: 6.5 }, { quieto: 1.2 }] },
    ],
    movil: [
      { ruta: '/', movimientos: [{ quieto: 1.8 }, { hasta: 2450, s: 8 }, { quieto: 1 }] },
      { ruta: '/catalogo', movimientos: [{ quieto: 1.6 }, { hasta: 2000, s: 6.5 }, { quieto: 1.2 }] },
    ],
  },
  'esquina-estudio': {
    escritorio: [
      { ruta: '/', movimientos: [{ quieto: 3 }] },
      { ruta: '/work', movimientos: [{ quieto: 1.4 }, { hasta: 822, s: 5 }, { quieto: 1 }] },
      { ruta: '/services', movimientos: [{ quieto: 1.2 }, { hasta: 2600, s: 8 }, { quieto: 1 }] },
    ],
    // Más corto que la grilla entera: con ella (2.087 px en 7 s) no entraba en el techo ni a 690 × 1494 con CRF 30 (2,06 MB).
    movil: [
      { ruta: '/', movimientos: [{ quieto: 2.8 }] },
      { ruta: '/work', movimientos: [{ quieto: 1.4 }, { hasta: 1500, s: 7 }, { quieto: 1.2 }] },
      { ruta: '/services', movimientos: [{ quieto: 1 }, { hasta: 1900, s: 6 }, { quieto: 1 }] },
    ],
  },
  'banu-scents': {
    escritorio: [
      {
        ruta: '/',
        movimientos: [
          { quieto: 2.6 }, { hasta: 1550, s: 5 }, { quieto: 1.6 }, { hasta: 2800, s: 4.5 }, { quieto: 1 },
          { hasta: 3700, s: 3.5 }, { quieto: 2 },
        ],
      },
    ],
    movil: [
      {
        ruta: '/',
        movimientos: [
          { quieto: 2 }, { hasta: 1450, s: 4.5 }, { quieto: 1 }, { hasta: 3500, s: 6 }, { quieto: 0.8 },
          { hasta: 5000, s: 5 }, { quieto: 1.2 },
        ],
      },
    ],
  },
}

/** Los segundos de página de un tramo. */
export function segundosDelTramo(tramo: Tramo): number {
  return tramo.movimientos.reduce((suma, m) => suma + ('quieto' in m ? m.quieto : m.s), 0)
}

const suave = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** El scroll (px CSS) de un tramo en el segundo `t` de página: los movimientos en orden, cada ida con su curva. */
export function scrollDelTramo(tramo: Tramo, t: number): number {
  let y = 0
  let desde = 0
  for (const m of tramo.movimientos) {
    const dura = 'quieto' in m ? m.quieto : m.s
    if ('hasta' in m) {
      if (t < desde + dura) return Math.round(y + (m.hasta - y) * suave((t - desde) / dura))
      y = m.hasta
    } else if (t < desde + dura) return y
    desde += dura
  }
  return y
}

/** Lo más lejos que llega un tramo: hasta ahí se despierta lo diferido antes de grabar. */
export function scrollMaximo(tramo: Tramo): number {
  return tramo.movimientos.reduce((max, m) => ('hasta' in m ? Math.max(max, m.hasta) : max), 0)
}
