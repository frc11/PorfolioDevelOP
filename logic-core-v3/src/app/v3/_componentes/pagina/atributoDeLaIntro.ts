/**
 * [B12a.3] EL ATRIBUTO DE LA INTRO DE UNA PÁGINA — su valor es el id de la página; es el bloque que mide la escena (`preset.tramos.intro`).
 * [B12a.4] Aparte de `IntroDeLaPagina.tsx` (que los reexporta: la API no cambia) para que el título de la página, un componente de cliente
 * que esa intro renderiza, lo lea sin importarla.
 */
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'
/** El selector de la intro: lo que va en `tramos.intro` del preset de una página. */
export const SELECTOR_DE_LA_INTRO = `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`
