import { SEGURO_DEL_VELO_MS } from '../../_lib/carga'

/**
 * [B11] EL CHAT DEL SITIO — qué bot, con qué cara, dónde no va y cuándo entra. Sin React ni three: lo leen `ChatDelSitio.tsx` y s87.
 *
 * Es el widget del sitio vivo (`LogicCompanion`, el que monta `components/layout/ChatWidgetMount.tsx` fuera de /v3), tal cual: la
 * misma ventana, el mismo globo, la misma animación de aparición. /v3 le fija cosas sobre la config del bot (`overrides`): un avatar
 * sin 3D (decisión de Valentino: «sin 3D por ahora») y la esquina de abajo a la derecha, donde estaba (y la que [CIERRE A] A6 dejó libre
 * para él). [C2-21] Y los colores del home. El resto sale de la config, como en el sitio vivo.
 */

/** El bot del sitio: el mismo slug que el sitio vivo. */
export const SLUG_DEL_CHAT = 'develop'

/** [C2-21] El avatar liviano del registro del chat (SVG: sin three ni canvas): el geométrico. La onda, el monograma y `?chat=` se fueron. */
export const AVATARES_SIN_3D = ['geometrico'] as const
export type AvatarSin3d = (typeof AVATARES_SIN_3D)[number]
export const AVATAR_POR_DEFECTO: AvatarSin3d = 'geometrico'

/**
 * [C2-21] LOS COLORES DEL HOME SOBRE LOS DE LA CONFIG. Los de la captura (el panel turquesa, los chips con letra roja) no son de fábrica:
 * son de la config del bot `develop`, que el cliente cambia desde su panel (`chatSurfaceTint` el fondo del panel, `accentSecondary` los
 * chips, que se pintan con ese color en la letra, `accentColor` el botón, la burbuja propia y el envío). De fábrica (sin tinte) el panel
 * es un degradé oscuro. Acá van sólo para /v3: el panel en la tinta (`--color-tinta`), casi opaco, y lo demás en el papel
 * (`--color-fondo`): los chips con letra papel sobre la tinta. La tipografía, los botones y los textos de la ventana son de fábrica: no
 * se tocan. s87 afirma que los dos valores son los de los tokens del tema.
 */
export const COLORES_DEL_CHAT = { tinta: '#111111', papel: '#F7F7F5' } as const

/**
 * Lo que /v3 fija sobre la config del bot (para el botón Y la ventana). La prop `overrides` del widget declara `avatarStyle` y `position`;
 * los colores viajan en el mismo objeto y el widget los aplica igual (`{ ...config, ...overrides }`): un objeto con claves de más es
 * asignable a su tipo (no es un literal). Si el widget dejara de esparcir el objeto entero, los colores vuelven a los de la config.
 */
export interface AparienciaDelChat {
  readonly avatarStyle: AvatarSin3d
  readonly position: 'bottom_right'
  readonly chatSurfaceTint: string
  readonly intensityLevel: 'HIGH'
  readonly accentColor: string
  readonly accentSecondary: string
}

/** Siempre el mismo objeto: el widget memoriza su config sobre él. */
export const APARIENCIA_DEL_CHAT: AparienciaDelChat = {
  avatarStyle: AVATAR_POR_DEFECTO,
  position: 'bottom_right',
  chatSurfaceTint: COLORES_DEL_CHAT.tinta,
  intensityLevel: 'HIGH',
  accentColor: COLORES_DEL_CHAT.papel,
  accentSecondary: COLORES_DEL_CHAT.papel,
}

/**
 * [C2-21] LAS ZONAS CRUCIALES (ítem 24): ahí el chat cerrado (la burbuja y el globo de las preguntas) se desvanece, y vuelve al salir.
 * Abierto, se queda (no se cierra solo). Por ahora el Portfolio (la sección entera: el selector y Demos) y Servicios (con su recomendador).
 * Una zona «está» cuando cruza la línea del chat: la franja de 1 % de la ventana a la altura de la burbuja y su globo.
 */
export const ZONAS_SIN_CHAT = ['trabajos', 'servicios'] as const
export const LINEA_DEL_CHAT = '-85% 0px -14% 0px'

export const chatDesvanecido = (enZona: boolean, abierto: boolean): boolean => enZona && !abierto

/**
 * Los laboratorios de /v3 (instrumentos, no páginas): sin chat. `/v3/motion` tiene sus controles en la misma esquina. El home y las
 * páginas (la base, las de servicio y las que vengan) lo llevan sin anotarse.
 */
export const RUTAS_SIN_CHAT = ['/v3/componentes', '/v3/tipografia', '/v3/motion', '/v3/control-estatico', '/v3/titulos-de-pagina'] as const

export function rutaConChat(ruta: string | null): boolean {
  if (ruta === null || !(ruta === '/v3' || ruta.startsWith('/v3/'))) return false
  return !RUTAS_SIN_CHAT.some((r) => ruta === r || ruta.startsWith(`${r}/`))
}

/**
 * LAS PRUEBAS NO LLAMAN A LA API DEL CHAT. Bajo automatización (`navigator.webdriver`) o con la siembra que ponen todos los bancos
 * (`sessionStorage['home:intro']`, la de `_chrome/preloader/decision.ts`) el chat no se pide: ni su módulo ni `/api/chatbot/…/config`.
 * Un banco que lo quiere medir lo pide (`window.__chatDelBanco = true`) y simula la config (`scripts-carga/chrome-en-los-anchos.ts`).
 */
export interface PruebaEnLaVentana {
  readonly automatizado: boolean
  readonly siembra: boolean
  readonly pedidoPorElBanco: boolean
}

export const chatPermitido = (p: PruebaEnLaVentana): boolean => p.pedidoPorElBanco || (!p.automatizado && !p.siembra)

/**
 * CUÁNDO ENTRA: después de la escena, y nunca debajo de algo que tapa la página.
 *
 *   · **la entrada abierta** (`_lib/entrada.ts`): con el preloader del sitio (B12c) no aparece; entra cuando el preloader se fue;
 *   · **sin el velo de carga del home** (`VeloDeCarga`: la página arranca blanca y todo aparece junto): entra después, no encima;
 *   · **la escena preparada** (compilada y calentada: `marcarLaEscenaPreparada`) o caída (sin WebGL): el chunk del chat y su config no
 *     compiten con la primera compilación de la escena. Si la escena no avisa nunca, entra igual a `PLAZO_DEL_CHAT_MS` del arranque.
 *
 * Abierta, se pide en un momento ocioso del hilo (`requestIdleCallback`), y aparece con su animación cuando llega la config.
 */
export interface EsperaDelChat {
  readonly entradaAbierta: boolean
  readonly veloDeCarga: boolean
  readonly escenaLista: boolean
  readonly vencido: boolean
}

/** El doble del seguro del velo de carga: la escena tuvo todo el seguro del velo para prepararse, y otro tanto. */
export const PLAZO_DEL_CHAT_MS = 2 * SEGURO_DEL_VELO_MS

/** El tope de la espera ociosa (ms): con el hilo siempre ocupado, se pide igual. */
export const ESPERA_OCIOSA_MS = 2000

export const puedeEntrarElChat = (e: EsperaDelChat): boolean => e.entradaAbierta && !e.veloDeCarga && (e.escenaLista || e.vencido)

/** Se monta sólo con todo: permitido, en una ruta con chat, la compuerta abierta y la config del bot cargada (sin config, nada). */
export interface MontajeDelChat {
  readonly permitido: boolean
  readonly ruta: string | null
  readonly compuerta: boolean
  readonly config: 'esperando' | 'lista' | 'sin'
}

export const montarElChat = (m: MontajeDelChat): boolean => m.permitido && rutaConChat(m.ruta) && m.compuerta && m.config === 'lista'
