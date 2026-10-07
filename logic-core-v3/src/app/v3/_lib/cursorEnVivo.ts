/**
 * [RETOQUE DEL ENCASTRE] 2A · DÓNDE SE VE EL CURSOR DE LA SALA — el centro de su halo (el círculo que se ve, ya
 * interpolado), en px del cuadro. Lo escribe `_chrome/cursor/CursorDeLaSala.tsx` en cada cuadro de su bucle; lo leen los
 * nanobots: el desarme sigue al cursor que se ve, no al puntero nativo. `activo`: el cursor está montado y el puntero, en
 * la ventana (sin él —táctil, movimiento reducido, abajo de 1024—, el desarme sigue al puntero). Un estado chico de
 * módulo, sin dependencias: los nanobots no cargan el cursor.
 */
export const CURSOR_EN_VIVO = { activo: false, x: 0, y: 0 }
