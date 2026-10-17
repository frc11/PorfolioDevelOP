import type Lenis from 'lenis'

/**
 * [B1] LA INSTANCIA DE LENIS DEL SITIO, para quien tiene que mover la página con ella fuera de un viaje (el salto del Portfolio a
 * un paso). La anota `ScrollSuaveDeV3` al crearla y la borra al destruirla; abajo de 1025 no hay (`null`) y el que salta va sin
 * Lenis. Un objeto mutable y no un contexto: nadie la necesita en un render, se lee en el gesto.
 */
export const LENIS_DEL_SITIO: { instancia: Lenis | null } = { instancia: null }
