/**
 * [ESCENA 10] T2 · EL SCROLL EN MOVIMIENTO — avisa cuando el scroll de la ventana se mueve y cuando lleva un rato
 * quieto. Lenis y la rueda mueven los dos el scroll de la ventana, así que un solo escucha los ve a los dos.
 *
 * Es de `_lib/` y no de una sección porque no mueve nada: lo usa quien tiene que dejar de trabajar mientras la página
 * corre (el video de Servicios, que en medio del scroll hacía perder ~80 cuadros por pasada). Las secciones no escuchan
 * el scroll por su cuenta (s6-servicios lo afirma: su contenido lo mueve UN motor de progreso).
 *
 * Un solo escucha para todos los que se suscriben, puesto con el primero y sacado con el último; el escucha sólo anota
 * la hora y avisa (sin reservar nada), y cada suscripción lleva a lo sumo un temporizador.
 */
const suscriptos: ((t: number) => void)[] = []

function alScroll(): void {
  const t = performance.now()
  for (let k = 0; k < suscriptos.length; k += 1) suscriptos[k](t)
}

/**
 * Llama a `alMoverse` en cada movimiento del scroll y a `alQuedarQuieto` cuando lleva `quietoMs` sin moverse. Arranca
 * como después de un movimiento (quien se suscribe suele hacerlo con la página andando). Devuelve cómo soltarse.
 */
export function seguirElScroll(quietoMs: number, alMoverse: () => void, alQuedarQuieto: () => void): () => void {
  let ultimo = 0
  let esperando: number | null = null
  // Si se movió mientras esperaba, espera lo que falta.
  const mirar = (): void => {
    const falta = ultimo + quietoMs - performance.now()
    esperando = falta > 0 ? window.setTimeout(mirar, falta) : null
    if (falta <= 0) alQuedarQuieto()
  }
  const seMovio = (t: number): void => {
    ultimo = t
    alMoverse()
    if (esperando === null) esperando = window.setTimeout(mirar, quietoMs)
  }
  if (suscriptos.length === 0) window.addEventListener('scroll', alScroll, { passive: true })
  suscriptos.push(seMovio)
  seMovio(performance.now())
  return () => {
    const i = suscriptos.indexOf(seMovio)
    if (i >= 0) suscriptos.splice(i, 1)
    if (esperando !== null) window.clearTimeout(esperando)
    if (suscriptos.length === 0) window.removeEventListener('scroll', alScroll)
  }
}
