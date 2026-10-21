/**
 * [B12a.3] EL ATRIBUTO DE LA INTRO DE UNA PÁGINA — su valor es el id de la página; es el bloque que mide la escena (`preset.tramos.intro`).
 * [B12a.4] Aparte de `IntroDeLaPagina.tsx` (que los reexporta: la API no cambia) para que el título de la página, un componente de cliente
 * que esa intro renderiza, lo lea sin importarla.
 */
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'
/** El selector de la intro: lo que va en `tramos.intro` del preset de una página. */
export const SELECTOR_DE_LA_INTRO = `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`

/** [B12a.8] Los dos tramos de la intro (`data-parte`): el del título (el `h1` y la bajada fijos arriba) y el de «de qué se trata». */
export const TRAMOS_DE_LA_INTRO = { titulo: 'tramo-del-titulo', deQueSeTrata: 'de-que-se-trata' } as const
/** El tramo del título: el título lo lee para caer antes de que se suelte. */
export const SELECTOR_DEL_TRAMO_DEL_TITULO = `[data-parte="${TRAMOS_DE_LA_INTRO.titulo}"]`
