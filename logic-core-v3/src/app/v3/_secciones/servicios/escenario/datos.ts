import type { PresetDeLaEscena } from '../../../_lib/escena/ruta/preset'
import { PRESET as PRESET_DE_LA_BASE } from '../../../pagina-base/preset'
import type { IdDeServicio } from '../../_contrato/acento'

/**
 * [B4] LOS DATOS DE LA SECCIÓN SERVICIOS DEL HOME (craneada el 2026-10-21; `docs/rediseno/SPRINT-B4-NOCTURNO.md`). El nombre de
 * cada servicio, su párrafo y el rótulo de su CTA son los de siempre (`../contenido.ts`): no se reescriben acá.
 */

export const SUBTITULO = 'Los trabajos de calidad que ofrecemos en develOP.'

/**
 * EL VIDEO DE CADA SERVICIO — UNA constante por servicio: cambiarlo es cambiar su línea y nada más.
 *
 * ⚠️ PROVISORIO: el montaje de servicios (sitios y demos) vive en `paginas/servicios` (`public/servicios/`) y no está en esta rama.
 * Hasta el merge, los tres usan el mismo video del Portfolio. Después: web, el montaje; software, el mismo hasta que exista el
 * software propio grabado; IA, el mismo hasta que exista la pieza animada sobre las ventajas de la IA.
 */
export const VIDEO_DE_WEB = { fuente: '/portfolio/el-garage/escritorio.mp4', poster: '/portfolio/el-garage/escritorio.webp' } as const
export const VIDEO_DE_SOFTWARE = { fuente: '/portfolio/el-garage/escritorio.mp4', poster: '/portfolio/el-garage/escritorio.webp' } as const
export const VIDEO_DE_IA = { fuente: '/portfolio/el-garage/escritorio.mp4', poster: '/portfolio/el-garage/escritorio.webp' } as const

export const VIDEO_DEL_SERVICIO: Readonly<Record<IdDeServicio, { readonly fuente: string; readonly poster: string }>> = {
  web: VIDEO_DE_WEB,
  software: VIDEO_DE_SOFTWARE,
  'ia-automatizacion': VIDEO_DE_IA,
}

/** Lo que muestra el video (su nombre accesible), mientras sea el provisorio. */
export const DESCRIPCION_DEL_VIDEO_PROVISORIO = 'Recorrido de un sitio hecho por develOP (video provisorio)'

/**
 * EL DESTINO DEL CTA DE CADA SERVICIO — el enganche del viaje (B12b). Las páginas de servicio no existen en esta rama: los tres van a
 * la maqueta base de B12a (`/v3/pagina-base`), con `EnlaceDeRuta` (el velo, la salida de la variante). Cuando existan, cada uno va a
 * su ruta (`PAGINAS_DE_SERVICIO`, `_chrome/paginas.ts`) y B12b cambia el velo por el viaje desde acá.
 */
export const DESTINO_DEL_SERVICIO: Readonly<Record<IdDeServicio, string>> = {
  web: '/v3/pagina-base',
  software: '/v3/pagina-base',
  'ia-automatizacion': '/v3/pagina-base',
}

/**
 * [B12b] EL PRESET DE LA PÁGINA DE DESTINO DE CADA SERVICIO — el viaje lo apila en el home antes de navegar: la escena va a la composición
 * de ESA página (su noche, su acento y su variante, montada tapada). Tiene que ser el mismo que declara la página. Hoy los tres son el de
 * la maqueta base; cuando existan las páginas de servicio, cada uno es el preset de la suya (exportado de un módulo sin JSX: P-S).
 */
export const PRESET_DEL_DESTINO: Readonly<Record<IdDeServicio, PresetDeLaEscena>> = {
  web: PRESET_DE_LA_BASE,
  software: PRESET_DE_LA_BASE,
  'ia-automatizacion': PRESET_DE_LA_BASE,
}

/** Por dónde entra cada servicio (y por dónde sale al subir). */
export type Entrada = 'izquierda' | 'derecha' | 'arriba'

/**
 * LA DISTRIBUCIÓN DE CADA SERVICIO en escritorio, de izquierda a derecha:
 *   web        el video · el texto en diagonal · el título, los nanobots (el globo) y el CTA
 *   software   el espejo: el título, los nanobots (los engranajes) y el CTA · el texto en diagonal invertida · el video
 *   IA         el video · el título, los nanobots (la red) y el CTA · el texto, con los renglones a plomo
 */
export interface Distribucion {
  readonly entrada: Entrada
  readonly orden: readonly ('video' | 'texto' | 'marca')[]
  readonly diagonal: 'izquierda' | 'derecha' | null
}

export const DISTRIBUCION: Readonly<Record<IdDeServicio, Distribucion>> = {
  web: { entrada: 'izquierda', orden: ['video', 'texto', 'marca'], diagonal: 'izquierda' },
  software: { entrada: 'derecha', orden: ['marca', 'texto', 'video'], diagonal: 'derecha' },
  'ia-automatizacion': { entrada: 'arriba', orden: ['video', 'marca', 'texto'], diagonal: null },
}

/** Los estados de la máquina: la entrada («Nuestros servicios») y los tres servicios. */
export const ESTADOS_DE_SERVICIOS = 4
