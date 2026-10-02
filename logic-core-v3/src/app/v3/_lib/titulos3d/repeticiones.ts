/**
 * [RONDA 2] F2 · CUÁNTAS LLEGADAS REPETIDAS CORREN AHORA — la llegada aislada después de un viaje del menú
 * (`_componentes/llegadaDelTitulo.ts`) corre por tiempo; mientras corre, la escena no asienta a los títulos (el asiento
 * con el scroll quieto cortaría esa llegada a la mitad). Sin `three` ni React: lo leen las dos puntas.
 */
export const REPETICIONES = { activas: 0 }

/**
 * [RONDA 2] F2 · EL ASIENTO — con el scroll quieto `quietoMs`, lo que quedó a mitad se completa o se deshace (al extremo
 * más cercano) en `s` (de punta a punta); al volver el scroll, lo que se muestra alcanza al progreso en `alcanceS`. Lo
 * usan los títulos de la escena y los valores de CSS 3D.
 */
export const ASIENTO = { quietoMs: 180, s: 0.35, alcanceS: 0.12 } as const
