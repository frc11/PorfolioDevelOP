/**
 * [PULIDO 2] 1 · EL FINAL Y EL TECLADO, abajo de 1024. Desde que el final corre detrás del pie, el formulario está encima
 * de la cinemática; con el foco en uno de sus campos (el teclado abierto en el teléfono) el final no arranca ni rebobina,
 * y lo que el teclado le hace a la página no lo dispara: el viewport se achica (el fondo de la página cambia) y el
 * navegador mueve el scroll para mostrar el campo. Mientras se escribe, el reloj queda donde está; al salir del campo, la
 * página sigue «al fondo» o «no al fondo» como estaba al entrar hasta que, con la vista ya quieta, el visitante mueva la
 * página (un gesto desde que entró al campo, o un scroll después de que la vista se aquietó) o la vista diga lo mismo.
 */
export const TECLADO = {
  /** Cuánto tiene que estar quieta la vista (s) para volver a creerle al fondo medido: el teclado tarda en irse. */
  calmaS: 0.6,
} as const

export interface EstadoDelTeclado {
  escribiendo: boolean
  /** Lo último que se supo del fondo sin el teclado de por medio. */
  alFondo: boolean
  /** Cuándo se entró al campo y cuándo se salió (s); `soltoS` en `-Infinity`: no hay nada retenido. */
  entroS: number
  soltoS: number
  /** El scroll del primer cuadro con la vista quieta después de salir (`NaN`: todavía no se aquietó). */
  scrollCalmo: number
  /** El alto de la vista y cuándo cambió por última vez (s). */
  vista: number
  vistaS: number
}

export const tecladoQuieto = (): EstadoDelTeclado => ({ escribiendo: false, alFondo: false, entroS: Number.NEGATIVE_INFINITY, soltoS: Number.NEGATIVE_INFINITY, scrollCalmo: Number.NaN, vista: 0, vistaS: Number.NEGATIVE_INFINITY })

export interface LecturaDelTeclado {
  /** El reloj del final queda donde está (escribiendo). */
  readonly congelado: boolean
  /** El fondo que vale para el final este cuadro. */
  readonly alFondo: boolean
}

/** Un cuadro: si se escribe (el foco en un campo), el fondo medido, el alto de la vista, el scroll, ahora y el último gesto (s). */
export function pasoDelTeclado(t: EstadoDelTeclado, escribiendo: boolean, alFondoMedido: boolean, vista: number, scroll: number, ahora: number, gestoS: number): LecturaDelTeclado {
  if (Math.abs(vista - t.vista) > 1) {
    t.vista = vista
    t.vistaS = ahora
  }
  // Escribiendo: el fondo es el del último cuadro sin teclado (el de este cuadro ya puede estar movido por el foco).
  if (escribiendo) {
    if (!t.escribiendo) t.entroS = ahora
    t.escribiendo = true
    t.soltoS = Number.NEGATIVE_INFINITY
    return { congelado: true, alFondo: t.alFondo }
  }
  if (t.escribiendo) {
    t.escribiendo = false
    t.soltoS = ahora
    t.scrollCalmo = Number.NaN
  }
  if (Number.isFinite(t.soltoS)) {
    if (ahora - t.vistaS < TECLADO.calmaS) {
      t.scrollCalmo = Number.NaN
      return { congelado: false, alFondo: t.alFondo }
    }
    if (Number.isNaN(t.scrollCalmo)) t.scrollCalmo = scroll
    const loMovio = gestoS > t.entroS || Math.abs(scroll - t.scrollCalmo) > 2
    if (!loMovio && alFondoMedido !== t.alFondo) return { congelado: false, alFondo: t.alFondo }
    t.soltoS = Number.NEGATIVE_INFINITY
  }
  t.alFondo = alFondoMedido
  return { congelado: false, alFondo: alFondoMedido }
}

/** Sin teclado (escritorio): el fondo medido, sin congelar. */
export const sinTeclado = (alFondo: boolean): LecturaDelTeclado => ({ congelado: false, alFondo })

/** El foco está en un campo que abre el teclado (un texto, un área, un selector o algo editable). */
export function escribiendoEnUnCampo(): boolean {
  const a = document.activeElement
  if (!(a instanceof HTMLElement)) return false
  if (a.isContentEditable || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT') return true
  return a instanceof HTMLInputElement && !/^(checkbox|radio|button|submit|reset|range|color|file|image|hidden)$/.test(a.type)
}
