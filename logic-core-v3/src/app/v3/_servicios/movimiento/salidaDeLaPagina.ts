/**
 * [SERVICIOS V1] CUÁNDO UN CLIC SE VA DE LA PÁGINA — puro (sin react ni next), para que el test lo pruebe en Node. Lo usa la raíz de la
 * página (`RaizDeLaPagina.tsx`) para pedir la salida de la variante ANTES de navegar (P-H29d, B12a-API §4).
 *
 * Se va el clic principal, sin teclas, sobre un enlace a otra página del mismo sitio que se abre en esta pestaña. NO se va:
 *   · un clic con otro botón o con una tecla (abre otra pestaña o ventana: la página se queda);
 *   · un enlace que ya atendió otro (`defaultPrevented`), uno que abre el contacto (`data-abre-contacto`: no navega), uno con `target`
 *     o `download`, uno de afuera;
 *   · un ancla de la misma página (el mismo camino y la misma búsqueda, con `#`): se corre, no se va.
 */

export interface ClicEnUnEnlace {
  /** `MouseEvent.button`: 0 es el principal (también el Enter del teclado sobre el enlace). */
  readonly boton: number
  /** Meta, Control, Mayúsculas o Alt apretadas. */
  readonly conTeclas: boolean
  /** `defaultPrevented`: otro ya lo atendió. */
  readonly atendido: boolean
  /** El `href` del enlace, resuelto (`HTMLAnchorElement.href`), o `null` sin href. */
  readonly href: string | null
  /** El `target` del enlace ('' sin él). */
  readonly target: string
  readonly descarga: boolean
  /** Adentro de un `[data-abre-contacto]`. */
  readonly abreElContacto: boolean
}

export interface DondeEsta {
  readonly origin: string
  readonly pathname: string
  readonly search: string
}

export function esUnaSalida(clic: ClicEnUnEnlace, aqui: DondeEsta): boolean {
  if (clic.boton !== 0 || clic.conTeclas || clic.atendido || clic.href === null || clic.descarga || clic.abreElContacto) return false
  if (clic.target !== '' && clic.target !== '_self') return false
  const destino = new URL(clic.href, aqui.origin)
  if (destino.origin !== aqui.origin) return false
  return !(destino.pathname === aqui.pathname && destino.search === aqui.search && destino.hash !== '')
}

/** Lo que el manejador usa de un enlace: un `HTMLAnchorElement` lo cumple tal cual (el test arma uno de mentira). */
export interface Enlace {
  readonly href: string
  readonly target: string
  hasAttribute(nombre: string): boolean
  closest(selector: string): unknown
  click(): void
}

/** Lo que el manejador usa de un clic (del evento de React, en la captura), con el enlace más cercano a lo que se apretó. */
export interface Clic {
  readonly button: number
  readonly metaKey: boolean
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly defaultPrevented: boolean
  readonly enlace: Enlace | null
  preventDefault(): void
}

/**
 * EL MANEJADOR DE LA SALIDA — el patrón del enlace interino del home (`prueba-de-pagina/EnlaceConLaSalida.tsx`), para todos los enlaces
 * de la página a la vez: frena el clic que se va, pide la salida y la espera (`pedir`: `pedirLaSalidaDeLaVariante`, que se resuelve
 * siempre), y recién entonces vuelve a apretar el MISMO enlace, que esta vez pasa (nunca `router.push`: navega el `<a href>`).
 */
export function manejadorDeLaSalida(pedir: () => Promise<void>, aqui: () => DondeEsta): (clic: Clic) => void {
  let dejarPasar: Enlace | null = null
  return (clic) => {
    const enlace = clic.enlace
    if (enlace === null) return
    if (dejarPasar === enlace) {
      dejarPasar = null
      return
    }
    const sale = esUnaSalida(
      {
        boton: clic.button,
        conTeclas: clic.metaKey || clic.ctrlKey || clic.shiftKey || clic.altKey,
        atendido: clic.defaultPrevented,
        href: enlace.href === '' ? null : enlace.href,
        target: enlace.target,
        descarga: enlace.hasAttribute('download'),
        abreElContacto: enlace.closest('[data-abre-contacto]') !== null,
      },
      aqui(),
    )
    if (!sale) return
    clic.preventDefault()
    void pedir().then(() => {
      dejarPasar = enlace
      enlace.click()
    })
  }
}
