import * as THREE from 'three'

/**
 * [B12a.3] P-H29c · EL COLOR DE LA ENERGÍA, PRESTADO A LA RANURA — `uLuzNoche` (las brasas, los arcos y la red) es por instancia y privado
 * de `PlasmaYCargas`; con esto la ranura de variantes lo puede teñir. `pedido`: la ranura lo está usando (sólo entonces `PlasmaYCargas` lo
 * copia, así el banco, que ajusta el uniforme directo, no se pisa); al soltarlo, vuelve al blanco de la paleta.
 */
export const ENERGIA_DE_LA_RUTA = { color: new THREE.Color(1, 1, 1), pedido: false }
