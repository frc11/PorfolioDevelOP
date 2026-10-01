/**
 * [Cierre de INTERFAZ 2] ¿Está el cursor de la sala? Lo escribe `CursorDeLaSala` al montarse y al irse; lo lee la
 * biblioteca de las demos: con el cursor, el cartel «Click para ver …» va pegado al cursor (uno solo) y la pastilla
 * fija del estante no se muestra con el mouse; sin él (táctil, movimiento reducido, abajo de 1024) y con el teclado,
 * queda la pastilla fija de siempre. Un estado chico de módulo, sin dependencias: la biblioteca no carga el cursor.
 */
export const PRESENCIA_DEL_CURSOR = { montado: false }
