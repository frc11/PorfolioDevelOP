/**
 * [PASADA FINAL] A1 · LA PRECARGA DEL MÓDULO DE LOS TÍTULOS — el mismo `import()` que `PruebasDeLaEscena` hace perezoso
 * (el mismo módulo: webpack lo sirve en el mismo trozo, pedido una sola vez), disparado apenas se sabe que hay escenario
 * (desde 1024, con los títulos prendidos), desde el chrome del layout: así la geometría de la Chivo y sus fuentes ya están
 * en la caché cuando el lienzo monta y el titular del hero se arma en los primeros cuadros, no cuando el `lazy` llega a
 * pedirlo. Sin React: una función.
 */
export const precargarLosTitulos = (): Promise<unknown> => import('./TitulosDeVolumen')
