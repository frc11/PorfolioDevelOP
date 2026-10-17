/**
 * [SERVICIOS S1b] EL VIDRIO DE LOS PANELES — el del Portfolio, con la misma fórmula.
 *
 * `ESTILO_DEL_VIDRIO` de `_secciones/trabajos/portfolio/Tira.tsx` es el vidrio del sistema (`CLAUDE.md`: tinta al 4 %,
 * desenfoque de 20 px, saturación del 180 %), en línea porque no son tokens. No se importa de ahí: vive en un archivo de
 * cliente, y un objeto exportado desde uno llega a un componente de servidor como referencia, no como valor. Acá se repite UNA
 * vez, con el mismo orden y los mismos números.
 *
 * Es translúcido a propósito: las secciones de las páginas no pintan fondos propios. Lo único opaco de la página es la tapa
 * interina (`PaginaDeServicio`), que se va cuando el home resuelva la escena por ruta (B12). Con la escena a la vista, el
 * desenfoque y la saturación son lo que se lee del vidrio.
 */

export const ESTILO_DEL_VIDRIO: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--color-tinta) 4%, transparent)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
}

/** El filete y el radio del panel. El filete es la tinta al 10 %, como el del lomo de una tira del Portfolio. */
export const CLASES_DEL_VIDRIO = 'rounded-medio border border-tinta/10'
