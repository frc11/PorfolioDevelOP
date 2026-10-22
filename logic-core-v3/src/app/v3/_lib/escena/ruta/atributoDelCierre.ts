/**
 * [B13] LOS ATRIBUTOS DEL CIERRE DE UNA PÁGINA — sólo cadenas (lo importan el DOM, la escena y el CTA sin arrastrar nada). El cierre es la
 * pieza común del home que monta cualquier página al final (`_componentes/pagina/cierre/CierreDeLaPagina.tsx`): Seis razones → el CTA → la
 * resolución → el pie. Su valor es el id de la página; es el bloque que el preset declara en `tramos.pie` (`SELECTOR_DEL_CIERRE`).
 */
export const ATRIBUTO_DEL_CIERRE_DE_PAGINA = 'data-cierre-de-pagina'
/** El selector del cierre: lo que va en `tramos.pie` del preset de una página. */
export const SELECTOR_DEL_CIERRE = `[${ATRIBUTO_DEL_CIERRE_DE_PAGINA}]`

/** De noche (el preset de la página): el texto va en los claros y el CTA en volumen, en papel. */
export const ATRIBUTO_DEL_CIERRE_DE_NOCHE = 'data-cierre-de-noche'
export const SELECTOR_DEL_CIERRE_DE_NOCHE = `[${ATRIBUTO_DEL_CIERRE_DE_NOCHE}]`

/** Las tres partes del cierre (`data-parte`), en orden: la escena mide la primera; las otras dos dan sus tramos en el DOM. */
export const PARTES_DEL_CIERRE = { seisRazones: 'seis-razones-del-cierre', resolucion: 'resolucion-del-cierre', pie: 'pie-del-cierre' } as const
