/**
 * [B12a.3 · P-H29d] LA SEÑAL DE SALIDA — la pide la navegación ANTES de irse de la página (y antes del velo: `EnlaceDeRuta`, B12a.6) y
 * espera su promesa. La variante vuelve a la composición en `SALIDA_DE_LA_VARIANTE_MS` con la página todavía quieta, y recién después se
 * navega. Medido en el build (D7): si la salida arranca con la navegación, el montaje de la página nueva traba los cuadros (133 ms a 1440,
 * 547 a 390) y la luz salta en vez de bajar. Sin variante montada, o con la escena tapada por el papel, se resuelve en el acto; la
 * promesa se resuelve siempre (la navegación nunca queda colgada). Sin react ni three: lo importa la navegación.
 */
type Atender = () => Promise<void>

let atender: Atender | null = null

/** Pide que la variante de la página vuelva a la composición; se resuelve cuando llegó (o en el acto, si no hay nada que bajar). */
export function pedirLaSalidaDeLaVariante(): Promise<void> {
  return atender === null ? Promise.resolve() : atender()
}

/** La ranura atiende la señal mientras tiene una variante montada (una sola a la vez); devuelve cómo dejar de atenderla. */
export function atenderLaSalida(a: Atender): () => void {
  atender = a
  return () => {
    if (atender === a) atender = null
  }
}
