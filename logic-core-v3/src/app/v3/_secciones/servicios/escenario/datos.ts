import type { PresetDeLaEscena } from '../../../_lib/escena/ruta/preset'
import { PRESET as PRESET_DE_LA_BASE } from '../../../pagina-base/preset'
import type { IdDeServicio } from '../../_contrato/acento'

/**
 * [B4] LOS DATOS DE LA SECCIÓN SERVICIOS DEL HOME (craneada el 2026-10-21; `docs/rediseno/SPRINT-B4-NOCTURNO.md`). El nombre de
 * cada servicio, su párrafo y el rótulo de su CTA son los de siempre (`../contenido.ts`): no se reescriben acá.
 */

/** [C2-50] El subtítulo de «Nuestros servicios» (05-TEXTOS: «calidad» ya lo dice el Portfolio). */
export const SUBTITULO = 'Los tipos de trabajos que hacemos en develOP.'

/** [C2-50] Los dos renglones del título que se pinta (en mayúsculas por la hoja; el texto es «Nuestros servicios»). */
export const RENGLONES_DEL_TITULO = [{ palabras: ['Nuestros'] }, { palabras: ['servicios'] }] as const

/** [C2-50] Los avisos de scroll (05-TEXTOS): en escritorio, debajo de la entrada; en el teléfono y la tablet, con el gatillo. */
export const AVISO_DE_LA_ENTRADA = 'Scrolleá para explorarlo'
export const AVISO_DEL_TELEFONO = 'Deslizá para pasar de servicio'

/**
 * [L3] EL TÍTULO DE CADA SERVICIO, EN DOS RENGLONES (ítem 50, como «Coffee that / arrives like a letter»): el primero derecho, en la
 * display del Panel; el segundo en cursiva, para el contraste. IA se renombra en esta sección («me suena mucho mejor»).
 */
export const TITULO_DEL_SERVICIO: Readonly<Record<IdDeServicio, { readonly derecho: string; readonly cursiva: string }>> = {
  web: { derecho: 'Desarrollo', cursiva: 'web' },
  software: { derecho: 'Software', cursiva: 'a medida' },
  'ia-automatizacion': { derecho: 'Integraciones con', cursiva: 'inteligencia artificial' },
}

/** [L3] El título entero, en una línea (el nombre que se lee en otros lugares del home). */
export const nombreDelTitulo = (id: IdDeServicio): string => `${TITULO_DEL_SERVICIO[id].derecho} ${TITULO_DEL_SERVICIO[id].cursiva}`

/** [L3] El enlace discreto al final del cuerpo: lleva a la página del servicio (como el título y el video). */
export const LEER_MAS = 'Leer más…'

/** [L3] En el teléfono y la tablet el cuerpo es más corto y más grande: los dos primeros párrafos de cada servicio. */
export const PARRAFOS_DEL_TELEFONO = 2

/**
 * [C2-50] EL TEXTO DEL MEDIO DE CADA SERVICIO (05-TEXTOS, tal cual): cuatro párrafos. Lo usan las dos ramas (el escenario y las
 * pantallas quietas), así anuncian lo mismo. El párrafo corto de siempre (`../contenido.ts`) queda para la sección de antes.
 */
export const TEXTO_DEL_MEDIO: Readonly<Record<IdDeServicio, readonly string[]>> = {
  web: [
    'Tu página es lo primero que ve un cliente antes de escribirte. Por eso no arrancamos de una plantilla: arrancamos de tu negocio, de lo que vendés y de cómo te buscan.',
    'Pensamos cada pantalla para que se entienda sola, cargue rápido y se vea bien en el celular, que es donde te van a encontrar.',
    'Y cuando está lista no te la tiramos por la cabeza: la manejás vos desde tu panel. Cambiás precios, fotos y textos sin depender de nadie.',
    'Landing, sitio institucional, catálogo o tienda online: lo que tu negocio necesite, hecho a medida.',
  ],
  software: [
    'Si hoy tu negocio funciona con planillas, cuadernos y mensajes sueltos, hay horas que se te van en cosas que una herramienta haría sola.',
    'Primero nos sentamos a entender cómo trabajás: qué se carga, quién lo usa y dónde se traba. Después presupuestamos, no antes.',
    'Armamos sistemas de gestión, turnos, stock, presupuestos y paneles internos: herramientas que se adaptan a tu operación, y no al revés.',
    'Lo usás desde la compu o el celular, con tus datos guardados y seguros, y crece cuando crece tu negocio.',
  ],
  'ia-automatizacion': [
    'Tus clientes escriben a cualquier hora y no siempre podés contestar. Un chatbot con IA atiende por vos: responde lo de siempre, toma pedidos y te pasa los datos de cada persona interesada.',
    'Lo entrenamos con la información de tu negocio, así que habla como vos y no inventa.',
    'También automatizamos lo repetitivo: mensajes, recordatorios, cargas de datos y avisos entre sistemas. Lo que hoy hacés a mano pasa solo.',
    'Se paga la implementación una vez y un abono mensual, y desde tu panel ves cada conversación.',
  ],
}

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

/** [C2-50] El corte de la diagonal: el alto del panel por la tangente (`100cqh`: el panel es el contenedor de tamaño). */
export const CORTE_DE_LA_DIAGONAL = 'calc(100cqh * var(--tangente-de-la-diagonal, 0.1228))'

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
  /** [C2-50] Lo que ocupa cada columna, en fracciones (en IA, simétricas: el título queda al centro de la pantalla). */
  readonly fracciones: readonly number[]
}

export const DISTRIBUCION: Readonly<Record<IdDeServicio, Distribucion>> = {
  web: { entrada: 'izquierda', orden: ['video', 'texto', 'marca'], diagonal: 'izquierda', fracciones: [12, 10, 9] },
  software: { entrada: 'derecha', orden: ['marca', 'texto', 'video'], diagonal: 'derecha', fracciones: [9, 10, 12] },
  'ia-automatizacion': { entrada: 'arriba', orden: ['video', 'marca', 'texto'], diagonal: null, fracciones: [10, 9, 10] },
}

/** Los estados de la máquina: la entrada («Nuestros servicios») y los tres servicios. */
export const ESTADOS_DE_SERVICIOS = 4
