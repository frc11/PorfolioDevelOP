/**
 * [PULIDO 1] P6 · EL TITULAR DEL HERO Y EL LOGO QUE BAJA CON ÉL. El titular en volumen (sus dos registros) llega una vez por
 * carga en `LLEGADA_DEL_TITULAR_S`: su primera letra arranca cuando arranca la llegada y la última termina cuando termina
 * (`llegadaDeLaLetra`, en `escena/titulos3d/llegada.ts`). El logo del intro (`escena/intro/`) baja en ese mismo tramo y a
 * velocidad constante: los dos leen estas constantes (el hero y la escena las importan de acá, sin copias), y el logo sigue
 * lo que la escena MUESTRA del titular (`TITULAR_EN_VIVO`), así que si el titular cambia, el logo lo acompaña solo.
 */

/** Lo que tarda el titular en armarse (s): la llegada de sus dos registros, de la primera letra a la última. */
export const LLEGADA_DEL_TITULAR_S = 2.4

/** Los dos registros del titular en volumen (el `id` de cada título de la escena; el velo de la carga lleva la misma lista). */
export const IDS_DEL_TITULAR_DEL_HERO = ['hero-registro-1', 'hero-registro-2'] as const

/**
 * Lo que la escena muestra del titular en volumen, cada cuadro (lo escribe `TitulosDeVolumen`; lo lee el logo del intro, que
 * va antes en el cuadro): lo llegado (0 a 1, el menor de los dos registros), si los dos están armados y si su llegada sigue
 * su camino (a la vista y sin tapar: con la carga abierta, en el cuadro siguiente suma `dt / LLEGADA_DEL_TITULAR_S`).
 */
export const TITULAR_EN_VIVO = { llegada: 0, armado: false, enCamino: false }
