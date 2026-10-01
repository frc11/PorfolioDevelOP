/**
 * [INTERFAZ 2] T1 · LO QUE LA INTERFAZ LE PIDE A LA ESCENA — sin three y sin React.
 *
 * Es el camino al revés de `LOGO_BAJO_EL_PUNTERO` (la escena le avisa al cursor del DOM): acá el DOM escribe y la
 * escena lee en su cuadro, con la forma de `NOCHE_DISPARADA` y `viaje.ts`, un estado chico de módulo. Lo escribe la
 * interfaz (`_chrome/escena/RespuestaDeLaEscena.tsx` y el menú); lo atienden `Entorno.tsx` (el pulso), el piso vivo
 * (la onda) y el rig (`respuesta.ts`).
 *
 * Cada pedido lleva un contador y su instante en el reloj de la página (`performance.now()`, ms). La escena atiende
 * un pedido NUEVO y RECIENTE: suspendida detrás de Servicios y Tu panel no corre su cuadro, y un pedido de ahí no se
 * cobra pantallas después, al volver.
 */

/** Cuánto vale un pedido sin atender (ms): un cuadro largo, y nada más. */
export const VIGENCIA_DEL_PEDIDO_MS = 250

/** El pulso principal del logo (E4): lo pide un CTA. */
export const PULSO_PEDIDO = { n: 0, cuando: Number.NEGATIVE_INFINITY }

/** La onda del piso vivo hacia un punto de la pantalla (`x`, `y` en coordenadas normalizadas: −1…1, `y` hacia arriba). */
export const ONDA_PEDIDA = { n: 0, cuando: Number.NEGATIVE_INFINITY, x: 0, y: 0 }

/** El menú del teléfono, abierto: la sala se oscurece apenas (`respuesta.ts`) y se desenfoca (el lienzo). */
export const MENU_DE_LA_INTERFAZ = { abierto: false }

export function pedirElPulso(ahora: number): void {
  PULSO_PEDIDO.n += 1
  PULSO_PEDIDO.cuando = ahora
}

export function pedirLaOnda(x: number, y: number, ahora: number): void {
  ONDA_PEDIDA.n += 1
  ONDA_PEDIDA.cuando = ahora
  ONDA_PEDIDA.x = x
  ONDA_PEDIDA.y = y
}

/** ¿Un pedido hecho en `cuando` sigue valiendo en `ahora`? */
export function vigente(cuando: number, ahora: number): boolean {
  return ahora - cuando >= 0 && ahora - cuando < VIGENCIA_DEL_PEDIDO_MS
}
