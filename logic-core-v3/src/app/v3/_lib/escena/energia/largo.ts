/**
 * [PULIDO 18] La longitud de un vector de tres. Sin `Math.hypot`: en V8 asigna un arreglo por llamada (TurboFan no la reduce) y en el
 * bucle de las vecinas era casi toda la basura del plasma (unos 400 KB por cuadro, con recolecciones de hasta 300 ms medidas en el
 * mini-banco con la máquina justa de memoria). Puro (Node).
 */
export function largo3(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z)
}
