/** [SERVICIOS S1b/S2] Los rótulos que comparten los slots de precio. Una sola vez, para que los tres digan lo mismo. */

/** SPEC §5: el precio es siempre «desde». */
export const ROTULO_DEL_PRECIO = 'Desde'

/** SPEC §7.1: lo dicen los calibres que traen panel para editar. [M2b] Lo comparten las historias (debajo de 768) y las diagonales. */
export const ROTULO_AUTOGESTIONABLE = 'Autogestionable'

/** [M2b] Las historias del precio, para el lector: el nombre del grupo y los dos controles del teclado (el anterior y el siguiente). */
export const ETIQUETA_DE_LAS_HISTORIAS = 'Las opciones de precio'
export const ROTULOS_DE_LAS_HISTORIAS = { anterior: 'Opción anterior', siguiente: 'Opción siguiente' } as const
