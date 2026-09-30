import type Lenis from 'lenis'

/**
 * [ESCENA 10] T1 · EL SCROLL SUAVE DE /v3, EN EL MODO DE NK (era la prueba `lenis=nk` de ESCENA 9, T4; el `sedoso` se
 * borró).
 *
 * El sitio construye Lenis con `OPCIONES_DE_LENIS` (`duration` 1,1 con una exponencial de salida): cada evento de la
 * rueda arranca una animación nueva de 1,1 s desde donde está el scroll hasta el objetivo. nk.studio
 * (`docs/rediseno/s0/SCROLL.md` §9.6) corre en modo `lerp` 0,1: cada cuadro se acerca un 10 % al objetivo, sin
 * duración. Son casi la misma exponencial (la salida del sitio decae a 6,3 por segundo; el lerp 0,1, a 6,0); cambia el
 * final: la del sitio se corta a los 1,1 s y la de nk se apaga sola.
 *
 * La construcción no cambia (la afirman `compuerta` y `s18`, y las opciones son del sitio: compartidas): se cambian
 * las de la instancia, que Lenis lee en cada evento de la rueda. Un `scrollTo` con su propia duración (el deslizamiento
 * del CTA) sigue con la suya.
 */
export const LENIS_DE_NK = { lerp: 0.1, duration: undefined, easing: undefined } as const

/** Pone el modo de nk en la instancia de /v3 (una vez, al construirla). */
export function ponerElModoDeNk(lenis: Lenis): void {
  Object.assign(lenis.options, LENIS_DE_NK)
}
