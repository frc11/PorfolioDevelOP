/**
 * [AJUSTES FINALES] A4 · LA CARGA DE LA PÁGINA (provisorio hasta el preloader) — hasta acá al cargar se veían primero piezas
 * sueltas (la bajada y los CTA del hero sobre blanco, el chrome) y recién después la escena y el titular de volumen. Ahora:
 *
 *   1. La página arranca toda blanca (`VeloDeCarga.tsx`: un velo del color de fondo, en el HTML del servidor, encima de todo
 *      y sin recibir el puntero: no bloquea el scroll ni un cuadro).
 *   2. Cuando la escena dibujó su primer cuadro (`marcarElPrimerCuadro`, lo llama el motor de la escena), están las fuentes
 *      (`document.fonts.ready`) y el titular 3D del hero está armado (`marcarListo`, el registro de los títulos), todo
 *      aparece junto con un fundido de `fundidoMs`. Sin escena (se cayó) o sin títulos de volumen, no se los espera.
 *   3. Recién terminado el fundido se abre la carga (`abrirLaCarga`): el titular del hero cae con su llegada, y con él la
 *      bajada y los CTA, que van en su plano y aparecen con sus letras (`escena/titulos3d/acompanantes.ts`).
 *   4. Respaldo: si en `plazoMs` desde el arranque de la página no está todo, el fundido arranca igual (con el respaldo 2D
 *      del titular si el 3D no llegó: `titular2d.ts` comparte el plazo). Con movimiento reducido no hay fundido (la política
 *      del sitio corta toda animación a 1 ms): el velo queda opaco hasta que está todo y se va de golpe.
 *
 * Sin React ni three: dos bits y sus oyentes, para `useSyncExternalStore` y para el cuadro de la escena.
 */
export const CARGA = {
  /** Desde el arranque de la página (`performance.now()`): si no está todo, el fundido arranca igual. */
  plazoMs: 4000,
  /** El fundido del velo (la hoja lo tiene como `--velo-fundido`; el fin de su animación es lo que desmonta el velo). */
  fundidoMs: 800,
  /** El seguro: si el fin de la animación no llega, el velo se va igual, este margen después de lo que debía durar. */
  margenMs: 400,
} as const

let primerCuadro = false
let lista = false
const oyentes = new Set<() => void>()

function avisar(): void {
  for (const f of oyentes) f()
}

/** La escena dibujó su primer cuadro. Lo llama el motor de la escena, una vez. */
export function marcarElPrimerCuadro(): void {
  if (primerCuadro) return
  primerCuadro = true
  avisar()
}

export const hayPrimerCuadro = (): boolean => primerCuadro

/** El fundido terminó: lo que esperaba a la carga (la llegada del titular del hero) arranca. */
export function abrirLaCarga(): void {
  if (lista) return
  lista = true
  avisar()
}

export const cargaLista = (): boolean => lista

export function suscribirALaCarga(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
