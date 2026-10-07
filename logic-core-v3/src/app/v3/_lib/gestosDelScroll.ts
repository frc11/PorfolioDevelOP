/**
 * [RETOQUE DEL ENCASTRE] 1D · LOS GESTOS DE SCROLL, RETENIDOS — la rueda, el dedo y las teclas que mueven la página, vistos
 * antes que nadie (en la captura de la ventana: Lenis escucha la rueda en la burbuja) y, si alguien lo pide, RETENIDOS:
 * no mueven la página (ni Lenis ni el navegador los ven). Lo pide el final del pie: un gesto hacia arriba mientras la
 * cinemática no está en su inicio la rebobina en vez de subir (`final/cuadroDelFinal.ts`).
 *
 * Cada retenedor ve TODOS los gestos (así se entera también de los que no retiene) y dice si lo retiene. Los escuchas
 * existen sólo mientras hay algún retenedor. Lo que no se puede retener: la barra de desplazamiento (arrastrarla mueve
 * la página igual) y las teclas mientras se escribe en un campo (el espacio es del texto).
 *
 * [NOCTURNO FINAL] A1 · cada evento dice si EMPIEZA un gesto (`nuevo`): una rueda después de un silencio
 * (`SEPARA_LOS_GESTOS_MS`, el trackpad y su inercia son un solo gesto), cada dedo que se apoya, cada tecla apretada (no
 * su repetición) y cualquier cambio de sentido. Con eso el final rebobina con UN gesto y retiene ese gesto entero.
 */
export type SentidoDelGesto = -1 | 1

export interface GestoDeScroll {
  readonly sentido: SentidoDelGesto
  readonly origen: 'rueda' | 'dedo' | 'tecla'
  /** [NOCTURNO FINAL] A1 · es el primer evento de un gesto. */
  readonly nuevo: boolean
  /** [NOCTURNO FINAL] A1 · cuánto movería (px: la rueda o el dedo; una tecla, 0): con eso se ve la cola de la inercia. */
  readonly magnitud: number
}

/** Ve un gesto y dice si lo retiene. */
export type Retenedor = (g: GestoDeScroll) => boolean

/** Un dedo que se movió menos que esto (px) no es un gesto: es un temblor. */
const TEMBLOR_PX = 2

/** [NOCTURNO FINAL] A1 · la rueda que vuelve después de este silencio (ms) empieza otro gesto. */
export const SEPARA_LOS_GESTOS_MS = 200

/** [NOCTURNO FINAL] A1 · ¿empieza un gesto? Otro origen, otro sentido, una tecla o un dedo nuevos, o la rueda tras un silencio. */
export function empiezaUnGesto(antes: { readonly origen: string; readonly sentido: number; readonly t: number } | null, origen: GestoDeScroll['origen'], sentido: SentidoDelGesto, t: number, apoyo: boolean): boolean {
  if (antes === null || apoyo || antes.origen !== origen || antes.sentido !== sentido) return true
  return origen === 'rueda' && t - antes.t > SEPARA_LOS_GESTOS_MS
}

/** El sentido de una rueda; `null` si no es un scroll vertical (un pellizco con ctrl, uno de costado, un temblor). */
export function sentidoDeLaRueda(dx: number, dy: number, ctrl: boolean): SentidoDelGesto | null {
  if (ctrl || Math.abs(dy) < 1 || Math.abs(dx) > Math.abs(dy)) return null
  return dy > 0 ? 1 : -1
}

const TECLAS: Readonly<Record<string, SentidoDelGesto>> = { ArrowUp: -1, PageUp: -1, Home: -1, ArrowDown: 1, PageDown: 1, End: 1 }

/** El sentido de una tecla que scrollea la página; `null` si no scrollea, con un modificador o escribiendo en un campo. */
export function sentidoDeLaTecla(tecla: string, shift: boolean, modificador: boolean, enUnCampo: boolean): SentidoDelGesto | null {
  if (modificador || enUnCampo) return null
  if (tecla === ' ') return shift ? -1 : 1
  return TECLAS[tecla] ?? null
}

/** El sentido de un dedo que bajó `dy` px (el dedo hacia abajo sube la página); `null` si es un temblor. */
export function sentidoDelDedo(dy: number): SentidoDelGesto | null {
  if (Math.abs(dy) < TEMBLOR_PX) return null
  return dy > 0 ? -1 : 1
}

const retenedores = new Set<Retenedor>()

/** El último evento visto (para saber si el siguiente empieza un gesto). */
let ultimo: { origen: GestoDeScroll['origen']; sentido: SentidoDelGesto; t: number } | null = null

/** Todos lo ven; se retiene si alguno lo pide. `apoyo`: una tecla apretada (no repetida) o el primer movimiento de un dedo. */
function decidir(sentido: SentidoDelGesto, origen: GestoDeScroll['origen'], t: number, apoyo: boolean, magnitud: number): boolean {
  const g: GestoDeScroll = { sentido, origen, nuevo: empiezaUnGesto(ultimo, origen, sentido, t, apoyo), magnitud }
  if (ultimo === null) ultimo = { origen, sentido, t }
  else {
    ultimo.origen = origen
    ultimo.sentido = sentido
    ultimo.t = t
  }
  let retiene = false
  for (const r of retenedores) if (r(g)) retiene = true
  return retiene
}

function retener(e: Event): void {
  if (e.cancelable) e.preventDefault()
  e.stopPropagation()
}

const enUnCampo = (t: EventTarget | null): boolean => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

let dedoY: number | null = null
/** [NOCTURNO FINAL] A1 · el dedo se apoyó y todavía no se movió: su primer movimiento empieza un gesto. */
let dedoNuevo = false

const alRodar = (e: WheelEvent): void => {
  const sentido = sentidoDeLaRueda(e.deltaX, e.deltaY, e.ctrlKey)
  if (sentido !== null && decidir(sentido, 'rueda', e.timeStamp, false, Math.abs(e.deltaY))) retener(e)
}
const alTocar = (e: TouchEvent): void => {
  dedoY = e.touches[0]?.clientY ?? null
  dedoNuevo = true
}
const alArrastrar = (e: TouchEvent): void => {
  const y = e.touches[0]?.clientY
  if (y === undefined || dedoY === null) return
  const sentido = sentidoDelDedo(y - dedoY)
  if (sentido === null) return
  const magnitud = Math.abs(y - dedoY)
  dedoY = y
  const apoyo = dedoNuevo
  dedoNuevo = false
  if (decidir(sentido, 'dedo', e.timeStamp, apoyo, magnitud)) retener(e)
}
const alApretar = (e: KeyboardEvent): void => {
  if (e.defaultPrevented) return
  const sentido = sentidoDeLaTecla(e.key, e.shiftKey, e.altKey || e.ctrlKey || e.metaKey, enUnCampo(e.target))
  if (sentido !== null && decidir(sentido, 'tecla', e.timeStamp, !e.repeat, 0)) retener(e)
}

/** Suma un retenedor (y los escuchas, si es el primero). Devuelve cómo sacarlo (y los escuchas, si era el último). */
export function retenerLosGestos(r: Retenedor): () => void {
  if (retenedores.size === 0) {
    window.addEventListener('wheel', alRodar, { capture: true, passive: false })
    window.addEventListener('touchstart', alTocar, { capture: true, passive: true })
    window.addEventListener('touchmove', alArrastrar, { capture: true, passive: false })
    window.addEventListener('keydown', alApretar, { capture: true })
  }
  retenedores.add(r)
  return () => {
    if (!retenedores.delete(r) || retenedores.size > 0) return
    window.removeEventListener('wheel', alRodar, { capture: true })
    window.removeEventListener('touchstart', alTocar, { capture: true })
    window.removeEventListener('touchmove', alArrastrar, { capture: true })
    window.removeEventListener('keydown', alApretar, { capture: true })
    dedoY = null
    dedoNuevo = false
    ultimo = null
  }
}
