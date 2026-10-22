import { CAMBIO_DEL_PIE } from '../formularios/volteo'

/**
 * [B10] EL FAQ DESPUÉS DEL PIE — su reloj, sin three ni React: lo comparten el DOM del FAQ (`_componentes/faq/`), el gatillo (los gestos
 * de scroll) y el pie de volumen (la escena lo lee en `pasoDelHundimiento`, `salidas.ts`).
 *
 * El cambio es el del formulario del pie (`formularios/volteo.ts`, `CAMBIO_DEL_PIE`): lo que estaba se hunde por su hueco y el piso se
 * cierra (la primera mitad); a cubierto se cambian; el piso se abre y sube lo nuevo (la segunda). Entrando, lo que se hunde es el pie y lo
 * que sube, el FAQ; saliendo, al revés. Todo por reloj (no por `transitionend`: una etapa que no cambia nada colgaba la cadena).
 *
 *   fuera     el pie a la vista (el FAQ cerrado en su hueco)
 *   entrando  el pie se hunde y después sube el FAQ
 *   adentro   el FAQ a la vista (el pie hundido)
 *   saliendo  el FAQ se hunde y después vuelve el pie
 */
export type FaseDelFaq = 'fuera' | 'entrando' | 'adentro' | 'saliendo'

/** La raíz del FAQ en el DOM (lo que el encuadre del final y el gatillo reconocen como suyo). */
export const ATRIBUTO_DEL_FAQ = 'data-faq-del-pie'
export const SELECTOR_DEL_FAQ = `[${ATRIBUTO_DEL_FAQ}]`

/** La mitad del cambio (ms): lo que tarda un lado en hundirse (y el otro en subir). */
export const MITAD_DEL_CAMBIO_MS = (CAMBIO_DEL_PIE.s * 1000) / 2

export interface RelojDelFaq {
  fase: FaseDelFaq
  /** Desde cuándo corre la fase (ms de `performance.now`). */
  desde: number
}

export const relojDelFaqQuieto = (): RelojDelFaq => ({ fase: 'fuera', desde: Number.NEGATIVE_INFINITY })

/** El de esta página (uno solo: el FAQ de la ruta montada). */
export const FAQ_EN_VIVO: RelojDelFaq & {
  /** El gesto que sacó el FAQ: su cola (la inercia) se retiene hasta este momento (ms) y no le llega al final del pie. */
  guardaHasta: number
  /** Sólo para el control del banco (`__faqSinHundimiento`): el pie no se hunde (el FAQ sube encima). */
  sinHundirElPie: boolean
} = { ...relojDelFaqQuieto(), guardaHasta: Number.NEGATIVE_INFINITY, sinHundirElPie: false }

const entre = (x: number): number => Math.min(1, Math.max(0, x))

/** La fase en `ahora`: un cambio que terminó deja la de llegada (no escribe nada). */
export function faseEn(r: RelojDelFaq, ahora: number): FaseDelFaq {
  if (ahora - r.desde < 2 * MITAD_DEL_CAMBIO_MS) return r.fase
  return r.fase === 'entrando' ? 'adentro' : r.fase === 'saliendo' ? 'fuera' : r.fase
}

/** Asienta la fase en `ahora` (un cambio que terminó pasa a la de llegada). Devuelve si cambió. */
export function asentar(r: RelojDelFaq, ahora: number): boolean {
  const f = faseEn(r, ahora)
  if (f === r.fase) return false
  r.fase = f
  return true
}

/**
 * Entra: desde `fuera`, el cambio entero; desde `saliendo`, da la vuelta en el punto en que iba (el espejo del tiempo: lo que se hundía
 * vuelve a subir desde donde quedó, sin saltos). Devuelve si cambió algo.
 */
export function entrar(r: RelojDelFaq, ahora: number): boolean {
  const f = faseEn(r, ahora)
  if (f === 'entrando' || f === 'adentro') return false
  const e = f === 'saliendo' ? ahora - r.desde : 2 * MITAD_DEL_CAMBIO_MS
  r.fase = 'entrando'
  r.desde = ahora - (2 * MITAD_DEL_CAMBIO_MS - e)
  return true
}

/** Sale: desde `adentro`, el cambio entero; desde `entrando`, da la vuelta en el punto en que iba. Devuelve si cambió algo. */
export function salir(r: RelojDelFaq, ahora: number): boolean {
  const f = faseEn(r, ahora)
  if (f === 'saliendo' || f === 'fuera') return false
  const e = f === 'entrando' ? ahora - r.desde : 2 * MITAD_DEL_CAMBIO_MS
  r.fase = 'saliendo'
  r.desde = ahora - (2 * MITAD_DEL_CAMBIO_MS - e)
  return true
}

/**
 * Cuánto está arriba cada lado en `ahora` (0: hundido y el piso cerrado; 1: en su lugar). Entrando, el pie baja en la primera mitad y el
 * FAQ sube en la segunda; saliendo, al revés. Nunca los dos arriba a la vez.
 */
export function nivelesDelFaq(r: RelojDelFaq, ahora: number): { readonly pie: number; readonly faq: number } {
  const M = MITAD_DEL_CAMBIO_MS
  const e = ahora - r.desde
  switch (faseEn(r, ahora)) {
    case 'entrando':
      return { pie: 1 - entre(e / M), faq: entre((e - M) / M) }
    case 'saliendo':
      return { pie: entre((e - M) / M), faq: 1 - entre(e / M) }
    case 'adentro':
      return { pie: 0, faq: 1 }
    default:
      return { pie: 1, faq: 0 }
  }
}

/** Para el pie de volumen: cuánto se hunde por el FAQ en `ahora` (0 a 1; lo que la escena ya usa para hundirlo antes de un viaje). */
export function hundeDelFaq(ahora: number): number {
  return FAQ_EN_VIVO.sinHundirElPie ? 0 : 1 - nivelesDelFaq(FAQ_EN_VIVO, ahora).pie
}

/** Vuelve al pie, quieto (al desmontarse el FAQ o al cambiar de modo). */
export function soltarElFaq(): void {
  Object.assign(FAQ_EN_VIVO, relojDelFaqQuieto(), { guardaHasta: Number.NEGATIVE_INFINITY, sinHundirElPie: false })
  avisarAlFaq()
}

// Quién se entera de un cambio de fase (el DOM del FAQ: su cuadro y lo que React muestra). Sin `setState` por cuadro.
const oyentes = new Set<() => void>()
export function suscribirAlFaq(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
export function avisarAlFaq(): void {
  for (const f of oyentes) f()
}
/** La fase asentada (la que React muestra: el puntero, lo que se anuncia). */
export const faseDelFaq = (): FaseDelFaq => FAQ_EN_VIVO.fase

/** Cuánto dura la cola de un gesto que sacó al FAQ (ms): la que tiene la rueda entre dos gestos (`SEPARA_LOS_GESTOS_MS`). */
export const COLA_DEL_GESTO_MS = 200

/** Lo que el gatillo sabe de un gesto de scroll y del lugar. */
export interface GestoAnteElFaq {
  readonly sentido: -1 | 1
  readonly nuevo: boolean
  readonly origen: 'rueda' | 'dedo' | 'tecla'
  /** El pie entero a la vista al fondo (de volumen: acostado al final; plano: la página al fondo). */
  readonly puedeEntrar: boolean
  /** El foco está adentro del FAQ (las teclas son suyas: las flechas recorren las preguntas). */
  readonly focoAdentro: boolean
}

/**
 * Qué hace el FAQ con un gesto (`gestosDelScroll.ts`, el dueño primero):
 *   entra    lo toma y entra (un gesto NUEVO hacia abajo con el pie entero al fondo)
 *   sale     lo toma y sale (un gesto NUEVO hacia arriba con el FAQ adentro o entrando)
 *   toma     lo retiene sin hacer nada más (la cola del gesto que lo movió, o hacia abajo con el FAQ al frente)
 *   suelta   no lo retiene y nadie más lo ve (las teclas con el foco adentro: las flechas son de las preguntas)
 *   sigue    no es suyo: lo ven los demás (el final del pie, la página)
 */
export type DecisionDelFaq = 'entra' | 'sale' | 'toma' | 'suelta' | 'sigue'

export function decidirElGestoDelFaq(fase: FaseDelFaq, g: GestoAnteElFaq, enLaGuarda: boolean): DecisionDelFaq {
  if (g.focoAdentro && g.origen === 'tecla') return 'suelta'
  if (fase === 'fuera') {
    if (enLaGuarda && !g.nuevo) return 'toma'
    return g.sentido > 0 && g.nuevo && g.puedeEntrar ? 'entra' : 'sigue'
  }
  if (g.sentido > 0) return fase === 'saliendo' && g.nuevo ? 'entra' : 'toma'
  return (fase === 'adentro' || fase === 'entrando') && g.nuevo ? 'sale' : 'toma'
}
