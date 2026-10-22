import { SEGURO_DEL_VELO_MS } from '../../_lib/carga'

/**
 * [B11] EL CHAT DEL SITIO — qué bot, con qué cara, dónde no va y cuándo entra. Sin React ni three: lo leen `ChatDelSitio.tsx` y s87.
 *
 * Es el widget del sitio vivo (`LogicCompanion`, el que monta `components/layout/ChatWidgetMount.tsx` fuera de /v3), tal cual: la
 * misma ventana, el mismo globo, la misma animación de aparición. /v3 le fija dos cosas sobre la config del bot (`overrides`): un avatar
 * sin 3D (decisión de Valentino: «sin 3D por ahora») y la esquina de abajo a la derecha, donde estaba (y la que [CIERRE A] A6 dejó libre
 * para él). El resto sale de la config, como en el sitio vivo.
 */

/** El bot del sitio: el mismo slug que el sitio vivo. */
export const SLUG_DEL_CHAT = 'develop'

/** Los avatares livianos del registro del chat (SVG: sin three ni canvas). `?chat=` elige entre los tres para mirarlos. */
export const AVATARES_SIN_3D = ['onda', 'monograma', 'geometrico'] as const
export type AvatarSin3d = (typeof AVATARES_SIN_3D)[number]

/** Sin bandera, la onda: el pariente plano del orbe 3D de siempre (un punto con anillos), hasta que Valentino elija. */
export const AVATAR_POR_DEFECTO: AvatarSin3d = 'onda'

/** La bandera de la URL que elige el avatar (`?chat=onda|monograma|geometrico`); cualquier otra cosa, el de por defecto. */
export const BANDERA_DEL_CHAT = 'chat'

export function avatarDeLaBandera(valor: string | null): AvatarSin3d {
  return AVATARES_SIN_3D.find((a) => a === valor) ?? AVATAR_POR_DEFECTO
}

/** Lo que /v3 fija sobre la config del bot (para el botón Y la ventana): el avatar sin 3D y la esquina de abajo a la derecha. */
export interface AparienciaDelChat {
  readonly avatarStyle: AvatarSin3d
  readonly position: 'bottom_right'
}

const APARIENCIAS = new Map<AvatarSin3d, AparienciaDelChat>(AVATARES_SIN_3D.map((a) => [a, { avatarStyle: a, position: 'bottom_right' }]))

/** Una por avatar, siempre el mismo objeto: el widget memoriza su config sobre él. */
export function aparienciaDelChat(avatar: AvatarSin3d): AparienciaDelChat {
  return APARIENCIAS.get(avatar) ?? { avatarStyle: avatar, position: 'bottom_right' }
}

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
