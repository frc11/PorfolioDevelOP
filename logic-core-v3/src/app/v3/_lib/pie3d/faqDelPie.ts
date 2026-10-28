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

// ═══════════════════════════════════════════════════════════════════════════
// [C2-71] EL FAQ EN 3D (desde 1025, con el pie de volumen): sus bloques son placas de la escena, como la del formulario del pie.

/**
 * Los bloques del FAQ de volumen: el de las preguntas (izquierda), el de la respuesta (derecha), el de WhatsApp (con la primera respuesta)
 * y el botón que avisa que hay un FAQ (abajo, después de que el pie se acostó). Su DOM se anota acá (`useBloqueDelFaq`) y la escena
 * (`escena/pie3d/faqDeVolumen.ts`) le arma su placa, la pone en el piso y le escribe la transformada que lo deja sobre su cara.
 */
export type IdDelBloqueDelFaq = 'preguntas' | 'respuesta' | 'whatsapp' | 'boton'

export interface BloqueDelFaq {
  readonly id: IdDelBloqueDelFaq
  readonly elemento: HTMLElement
  /** Cuánto está arriba (0: hundido y el piso cerrado; 1: en su lugar). Lo escribe el cuadro del FAQ; el del botón, la escena. */
  nivel: number
}

export const BLOQUES_DEL_FAQ = new Map<IdDelBloqueDelFaq, BloqueDelFaq>()
let versionDeLosBloques = 0
/** Cambia cada vez que un bloque se anota o se va (la escena rearma lo que cambió). */
export const versionDelFaqDeVolumen = (): number => versionDeLosBloques

export function anotarElBloqueDelFaq(id: IdDelBloqueDelFaq, elemento: HTMLElement): () => void {
  BLOQUES_DEL_FAQ.set(id, { id, elemento, nivel: 0 })
  versionDeLosBloques += 1
  return () => {
    if (BLOQUES_DEL_FAQ.get(id)?.elemento === elemento) BLOQUES_DEL_FAQ.delete(id)
    versionDeLosBloques += 1
  }
}

/**
 * Cómo sube un bloque del FAQ con su nivel `v` (0 a 1): el mismo efecto que el cambio del formulario del pie, al revés. Primero se ABRE
 * el piso (la silueta del bloque, desde su centro: `abre`) con el bloque esperando abajo; recién abierto, SUBE sobre su plataforma hasta
 * su lugar (`sube`); y al final, con el bloque quieto, aparece su texto (`texto`: el DOM). Bajando, al revés: el texto se va, baja y el
 * piso se cierra. Pura.
 */
export const SUBIDA_DEL_BLOQUE = { abreHasta: 0.35, subeDesde: 0.3, textoDesde: 0.92 } as const

const suaveDelBloque = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

export function subidaDelBloque(v: number): { readonly abre: number; readonly sube: number; readonly texto: number } {
  const S = SUBIDA_DEL_BLOQUE
  return { abre: suaveDelBloque(v / S.abreHasta), sube: suaveDelBloque((v - S.subeDesde) / (1 - S.subeDesde)), texto: entre((v - S.textoDesde) / (1 - S.textoDesde)) }
}

/**
 * EL BOTÓN DEL FAQ («Scrolleá una vez más…»): sale después de que el pie se acostó entero (`esperaS` más tarde), con la apertura del piso;
 * tocarlo es el gesto que trae el FAQ; con el FAQ se hunde con el pie y no vuelve en esta carga (`usado`: en memoria, no en el
 * almacenamiento; se vuelve a armar al montar el FAQ: recargar o entrar de nuevo al home). Sube en la mitad del cambio del pie y, si el
 * pie se va (la página sube), baja en `bajaS`.
 */
export const BOTON_DEL_FAQ = { esperaS: 0.8, subeS: MITAD_DEL_CAMBIO_MS / 1000, bajaS: 0.5 } as const

export const BOTON_EN_VIVO = {
  /** Ya se fue al FAQ en esta carga: no vuelve. */
  usado: false,
  /** Lo que subió (0 a 1, sin el pie: el nivel a la vista es el menor de los dos). */
  nivel: 0,
  /** Desde cuándo el pie está acostado entero (ms; sin acostar, +∞). */
  acostadoDesde: Number.POSITIVE_INFINITY,
}

/** Al montar el FAQ (una carga o una entrada nueva al home): el botón vuelve a estar disponible. */
export function rearmarElBotonDelFaq(): void {
  BOTON_EN_VIVO.usado = false
  BOTON_EN_VIVO.nivel = 0
  BOTON_EN_VIVO.acostadoDesde = Number.POSITIVE_INFINITY
}

/**
 * Un cuadro del botón (`ahora` en ms, `dt` en s): con el FAQ fuera de su lugar ya está usado; pide subir con el pie acostado entero desde
 * hace `esperaS` (y presente: sin la salida del pie) y sin usar. Devuelve el nivel a la vista (el menor entre lo subido y el pie: entrando
 * al FAQ se hunde con el pie, con su curva).
 */
export function pasoDelBoton(b: typeof BOTON_EN_VIVO, e: { readonly ahora: number; readonly dt: number; readonly acostado: boolean; readonly presente: boolean; readonly fase: FaseDelFaq; readonly pie: number; readonly quieto: boolean }): number {
  if (e.fase !== 'fuera') b.usado = true
  if (!e.acostado) b.acostadoDesde = Number.POSITIVE_INFINITY
  else if (b.acostadoDesde === Number.POSITIVE_INFINITY) b.acostadoDesde = e.ahora
  const pide = !b.usado && e.acostado && e.presente && e.ahora - b.acostadoDesde >= BOTON_DEL_FAQ.esperaS * 1000
  const paso = e.quieto ? 1 : e.dt / (pide ? BOTON_DEL_FAQ.subeS : BOTON_DEL_FAQ.bajaS)
  b.nivel = pide ? Math.min(1, b.nivel + paso) : Math.max(0, b.nivel - paso)
  return Math.min(b.nivel, e.pie)
}

/**
 * Tocar el botón (o cualquier pedido que no sea un gesto) es el gesto que trae el FAQ: entra con la misma condición (`puedeEntrar`: el pie
 * entero) y desde `fuera`. Devuelve si entró.
 */
export function entrarSinGesto(puedeEntrar: boolean, ahora: number): boolean {
  if (!puedeEntrar || faseEn(FAQ_EN_VIVO, ahora) !== 'fuera' || !entrar(FAQ_EN_VIVO, ahora)) return false
  avisarAlFaq()
  return true
}
