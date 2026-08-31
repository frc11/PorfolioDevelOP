/**
 * LA MARCA DEL ÁRBOL QUIETO — el control positivo del mismo instrumento.
 *
 * ── Por qué hace falta, y por qué NO es una ruta gemela ───────────────────
 *
 * S1 y S2 controlaron su compuerta con una RUTA gemela que hace el import
 * estático (`/v3/control-estatico`, `/v3/motion/control-estatico`). Acá eso no
 * se puede: este sprint **borra** dos rutas de demostración y agregar una
 * tercera contradiría la medición que ese borrado hace posible.
 *
 * El control se consigue igual, y sobre el mismo predicado: el árbol QUIETO
 * lleva su propia marca y **tiene que aparecer** en la carga inicial de `/v3`.
 * Un buscador que no encuentra la marca animada porque está roto tampoco
 * encontraría ésta. Es la misma asimetría que da la ruta gemela —una marca que
 * está y una que no— sin pagar una ruta.
 */
export const MARCA_HOME_QUIETO = 'v3-home-quieto-2026-08-30'
