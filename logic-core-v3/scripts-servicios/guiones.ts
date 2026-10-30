/**
 * [SERVICIOS M3] LOS GUIONES DEL VIDEO DE TRABAJOS — qué se graba de cada demo y cómo se monta (M0 §4.3 y §4.4).
 *
 * El enfoque es el de `scripts-portfolio/` (se leyó, no se importa ni se edita): Chrome del sistema por CDP, tiempo virtual, 2× a
 * 30 cuadros por segundo, solo GET, sin cookies ni burbujas. Lo propio de servicios:
 *   · las demos son tres de la sección Demos del home (D1: Ethereal, Noir y Skyline), con la url del catálogo del home;
 *   · cada demo graba UN tramo: la portada quieta y un scroll lento, unos 9 s de página que a 2× dan 4,5 s de video;
 *   · el montaje intercala las demos con los videos de los tres casos (`public/portfolio/`, solo lectura), con fundidos de 0,5 s, en
 *     dos versiones (horizontal y vertical) de 4 MB o menos.
 *
 * Los cuadros crudos van fuera del repo (`~/.cache/servicios/m3/`) y los borra `montar.ts`.
 */

import type { BrowserContextOptions } from '@playwright/test'
import { homedir } from 'node:os'
import path from 'node:path'

import { FUENTE_DE_DEMOS } from '../src/app/v3/_servicios/datos/fuenteDeDemos'

export type Dispositivo = 'escritorio' | 'movil'

/** Las tres demos (D1), por su slug en el catálogo del home. */
export const DEMOS_GRABADAS = ['ethereal', 'noir', 'skyline'] as const
export type DemoGrabada = (typeof DEMOS_GRABADAS)[number]

export function urlDeLaDemo(slug: DemoGrabada): string {
  const demo = FUENTE_DE_DEMOS.find((d) => d.slug === slug)
  if (demo === undefined) throw new Error(`la demo ${slug} no está en el catálogo del home`)
  return demo.url
}

export const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

export const CUADROS_POR_SEGUNDO = 30
/** A 2×: cada cuadro de salida son dos treintavos de segundo de página (D13). */
export const PAGINA_POR_CUADRO_MS = (2 * 1000) / CUADROS_POR_SEGUNDO
/** El fundido entre cortes (D12). */
export const FUNDIDO_S = 0.5

/** Escritorio a 1440 × 900; teléfono a 390 × 844 con escala 2 (cuadros de 780 × 1688): las pantallas del Portfolio. */
export const PANTALLAS: Readonly<Record<Dispositivo, { readonly ancho: number; readonly alto: number; readonly escala: number }>> = {
  escritorio: { ancho: 1440, alto: 900, escala: 1 },
  movil: { ancho: 390, alto: 844, escala: 2 },
}

const UA_DEL_TELEFONO =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

export function opcionesDe(dispositivo: Dispositivo): BrowserContextOptions {
  const p = PANTALLAS[dispositivo]
  const base: BrowserContextOptions = { viewport: { width: p.ancho, height: p.alto }, deviceScaleFactor: p.escala, locale: 'es-AR' }
  return dispositivo === 'movil' ? { ...base, isMobile: true, hasTouch: true, userAgent: UA_DEL_TELEFONO } : base
}

/** Lo que nunca va en un video: avisos de cookies y de consentimiento, y chats embebidos. Selectores genéricos. */
export const CSS_DE_LIMPIEZA = [
  '[id*="cookie" i]', '[class*="cookie" i]', '[id*="consent" i]', '[class*="consent" i]', '[aria-label*="cookie" i]',
  'iframe[title*="chat" i]', 'iframe[src*="chat" i]',
].join(', ') + ' { display: none !important; }'

/** Un movimiento: quedarse quieto `s` segundos, o ir al scroll `hasta` (px CSS) en `s` segundos de página. */
export type Movimiento = { readonly quieto: number } | { readonly hasta: number; readonly s: number }

/**
 * Un tramo por demo y por dispositivo, de 9 s de página (4,5 s de video): la portada quieta y un scroll lento de unas dos pantallas.
 * Lo midió la sonda (`sonda.ts`, informe en `C:\paginas-servicios-datos\m3\sonda\`): Ethereal mide 11.551 px y Noir 11.043 a 1440;
 * Skyline es UNA pantalla (900 a 1440, 844 a 390) y una SPA (un GET a otra ruta da 404), así que su clip es la portada quieta,
 * grabada desde la carga para que se vea su apertura (`grabar.ts`).
 */
export const GUIONES: Readonly<Record<DemoGrabada, Readonly<Record<Dispositivo, readonly Movimiento[]>>>> = {
  ethereal: {
    escritorio: [{ quieto: 1.6 }, { hasta: 1800, s: 6.4 }, { quieto: 1 }],
    movil: [{ quieto: 1.6 }, { hasta: 1700, s: 6.4 }, { quieto: 1 }],
  },
  noir: {
    escritorio: [{ quieto: 1.6 }, { hasta: 1800, s: 6.4 }, { quieto: 1 }],
    movil: [{ quieto: 1.6 }, { hasta: 1700, s: 6.4 }, { quieto: 1 }],
  },
  skyline: {
    escritorio: [{ quieto: 9 }],
    movil: [{ quieto: 9 }],
  },
}

export function segundosDelGuion(movimientos: readonly Movimiento[]): number {
  return movimientos.reduce((suma, m) => suma + ('quieto' in m ? m.quieto : m.s), 0)
}

const suave = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** El scroll (px CSS) del guion en el segundo `t` de página: los movimientos en orden, cada ida con su curva. */
export function scrollDelGuion(movimientos: readonly Movimiento[], t: number): number {
  let y = 0
  let desde = 0
  for (const m of movimientos) {
    const dura = 'quieto' in m ? m.quieto : m.s
    if ('hasta' in m) {
      if (t < desde + dura) return Math.round(y + (m.hasta - y) * suave((t - desde) / dura))
      y = m.hasta
    } else if (t < desde + dura) return y
    desde += dura
  }
  return y
}

export function scrollMaximo(movimientos: readonly Movimiento[]): number {
  return movimientos.reduce((max, m) => ('hasta' in m ? Math.max(max, m.hasta) : max), 0)
}

/** Los cuadros crudos: afuera del repo; `montar.ts` los borra al terminar. */
export const CARPETA_DE_CUADROS = path.join(homedir(), '.cache', 'servicios', 'm3')

// ── El montaje (M0 §4.4) ────────────────────────────────────────────────────

/** Cada corte dura lo mismo: 135 cuadros, 4,5 s (el clip entero de una demo). */
export const CUADROS_POR_CORTE = 135

/** Los tres casos, por su slug en PROYECTOS: sus videos del Portfolio se leen y nunca se escriben. */
export const CASOS_DEL_MONTAJE = ['el-garage', 'esquina-estudio', 'banu-scents'] as const
export type CasoDelMontaje = (typeof CASOS_DEL_MONTAJE)[number]

export type Corte =
  | { readonly tipo: 'caso'; readonly slug: CasoDelMontaje; readonly desdeElCuadro: Readonly<Record<Dispositivo, number>> }
  | { readonly tipo: 'demo'; readonly slug: DemoGrabada }

/**
 * Sitio y demo, uno a uno (D1). De cada caso, el tramo arranca después de su portada quieta (medio segundo de video en El Garage y
 * Banú, desde el principio en Esquina Estudio, que abre con su portada). Lo eligió CC sin la hoja de contactos de Valentino (la
 * corrida es desatendida): las hojas quedan en `C:\paginas-servicios-datos\m3\hojas\` para que elija otro tramo.
 */
export const CORTES: readonly Corte[] = [
  { tipo: 'caso', slug: 'el-garage', desdeElCuadro: { escritorio: 15, movil: 12 } },
  { tipo: 'demo', slug: 'ethereal' },
  { tipo: 'caso', slug: 'esquina-estudio', desdeElCuadro: { escritorio: 0, movil: 0 } },
  { tipo: 'demo', slug: 'noir' },
  { tipo: 'caso', slug: 'banu-scents', desdeElCuadro: { escritorio: 15, movil: 15 } },
  { tipo: 'demo', slug: 'skyline' },
]

export type Version = 'horizontal' | 'vertical'

/** Las dos versiones: la proporción de las fuentes (16:10) y la del teléfono a 2×; si no entran en el techo, la reducida. */
export const VERSIONES: Readonly<Record<Version, { readonly dispositivo: Dispositivo; readonly ancho: number; readonly alto: number; readonly reducida: { readonly ancho: number; readonly alto: number } }>> = {
  horizontal: { dispositivo: 'escritorio', ancho: 1280, alto: 800, reducida: { ancho: 1024, alto: 640 } },
  vertical: { dispositivo: 'movil', ancho: 720, alto: 1560, reducida: { ancho: 540, alto: 1170 } },
}

/** El techo de cada video: 4 MB (4.000.000 bytes), lo pide la corrida. Lo afirma `medios.invariant.ts` contra los archivos. */
export const TECHO_BYTES = 4_000_000

/** Dónde quedan los medios (servidos desde `/servicios/paginas-web/`) y el recibo. */
export const CARPETA_DE_LOS_MEDIOS = path.join('public', 'servicios', 'paginas-web')
export const RECIBO_DE_LOS_MEDIOS = path.join('docs', 'servicios', 'entregas', 'm3', 'medios.json')
/** Las hojas de contactos de los tramos de cada caso: fuera del repo, para que Valentino elija. */
export const CARPETA_DE_LAS_HOJAS = path.join('C:\\paginas-servicios-datos', 'm3', 'hojas')

// ── El recibo (lo escriben `montar.ts` y `velo.ts`; lo lee `medios.invariant.ts`) ──

export interface TramoMontado {
  readonly tipo: 'caso' | 'demo'
  readonly slug: string
  /** El mp4 del caso (`public/portfolio/…`, solo lectura) o la carpeta de cuadros de la demo. */
  readonly fuente: string
  readonly desdeElCuadro: number
  readonly cuadros: number
}

export interface VersionMontada {
  readonly video: string
  readonly poster: string
  readonly bytesDelVideo: number
  readonly sha256DelVideo: string
  readonly bytesDelPoster: number
  readonly sha256DelPoster: string
  readonly crf: number
  readonly ancho: number
  readonly alto: number
  readonly cuadros: number
  readonly segundos: number
  readonly codec: string | null
  readonly pixFmt: string | null
  readonly pistasDeAudio: number
  readonly faststart: boolean
  readonly tramos: readonly TramoMontado[]
}

/** El contraste del texto sobre el velo, medido en los cuadros del video (`velo.ts`). */
export interface MedicionDelVelo {
  readonly alfaBajoElTexto: number
  readonly tinta: string
  readonly fondo: string
  readonly cuadrosMedidos: number
  readonly peorContraste: number
}

export interface ReciboDelMontaje {
  readonly versiones: Readonly<Record<Version, VersionMontada>>
  readonly fuentes: readonly { readonly ruta: string; readonly bytes: number; readonly sha256: string }[]
  readonly demos: readonly { readonly slug: string; readonly url: string; readonly grabacion: string }[]
  readonly velo: Readonly<Record<Version, MedicionDelVelo>> | null
}
