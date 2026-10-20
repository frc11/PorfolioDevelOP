/**
 * [B12a.6] EL VELO DE LA NAVEGACIÓN, PURO — el plan (`docs/rediseno/SPRINT-B12a.md` §5) y el CONTRATO: toda navegación entre páginas de
 * `/v3` pasa por el velo, el mismo del día y la noche. Es la banda diagonal de la gota (`_secciones/trabajos/gota.ts`: entra por abajo a
 * la derecha y sale por arriba a la izquierda, con sus plumas y su curva) con una diferencia que la navegación necesita: la gota nunca tapa
 * el cuadro entero (en la sala se sigue viendo la escena), el velo SÍ, en el cuadro del cambio, para que la página que sale y la que
 * entra no se vean juntas. Cubre con el frente de la banda, la página cambia debajo y destapa con su cola, en la misma dirección.
 *
 * Lleva el anochecer o el amanecer: su color es el de la noche del destino (a una página, de noche, la tinta; al home, el papel).
 */

/** Las fases, de a una; `quieto` es sin velo. */
export type FaseDelVelo = 'quieto' | 'cubriendo' | 'cubierto' | 'destapando'
export type EventoDelVelo = 'cubrir' | 'cubrio' | 'corte' | 'llego' | 'destapo'

/**
 * Las transiciones: sin un evento que corresponda, la fase se queda (un `cubrir` en medio de otro no lo reinicia). [B12a.7] El `corte`
 * cubre de una desde cualquier fase: la flecha del navegador cambia la ruta sin esperar a nadie.
 */
export function siguienteFaseDelVelo(fase: FaseDelVelo, evento: EventoDelVelo): FaseDelVelo {
  if (evento === 'corte') return 'cubierto'
  if (evento === 'cubrir') return fase === 'quieto' || fase === 'destapando' ? 'cubriendo' : fase
  if (evento === 'cubrio') return fase === 'cubriendo' ? 'cubierto' : fase
  if (evento === 'llego') return fase === 'cubierto' ? 'destapando' : fase
  return fase === 'destapando' ? 'quieto' : fase
}

/**
 * Lo que tarda (ms): cubrir y destapar; y cuándo destapa: con la página nueva debajo, recién cuando los cuadros vuelven a ser parejos
 * (`cuadrosParejos` seguidos de menos de `cuadroParejoMs`: el montaje se paga tapado y el destape no tironea), a lo sumo `esperaMaximaMs`.
 * Con movimiento reducido, un corte. [B12a.7] Medido en el build (D7): el home recién montado sigue armando cosas hasta ~2,4 s después del
 * cambio (la frase del CTA, el pie, los títulos del ocio), con ratos quietos entre medio; con 10 cuadros parejos destapaba en uno de esos
 * ratos y la tarea siguiente caía en el destape (75–80 ms). Ahora, 20 seguidos y todos los títulos en camino, a lo sumo 3,5 s.
 */
export const VELO = { cubrirMs: 520, destaparMs: 620, cuadrosParejos: 20, cuadroParejoMs: 34, esperaMaximaMs: 3500 } as const

/** ¿Ya se puede destapar? Los cuadros parejos seguidos y ningún título en camino (los dos trababan el destape), o la espera cumplida. */
export function puedeDestapar(cuadrosParejosSeguidos: number, titulosEnCamino: number, esperandoMs: number): boolean {
  return (cuadrosParejosSeguidos >= VELO.cuadrosParejos && titulosEnCamino === 0) || esperandoMs >= VELO.esperaMaximaMs
}

/** La pluma del frente y de la cola, en % de la diagonal: la de la gota. */
export const PLUMA_DEL_VELO = 16

/** La curva: la del barrido de la gota (1 − (1 − t)²). */
export const CURVA_DEL_VELO = (t: number): number => 1 - (1 - t) * (1 - t)

const acotar01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
const TAPA = 'rgb(0 0 0 / 1)'
const DEJA_PASAR = 'rgb(0 0 0 / 0)'
const borde = (v: number): string => `${v.toFixed(2)}%`

/**
 * La máscara del velo (`mask-image`, en alfa) en su fase y su avance `t` (0 → 1, ya con la curva). Cubriendo, el frente va de la esquina
 * de abajo a la derecha (0 %) hasta pasar la de arriba a la izquierda (100 % más la pluma): detrás del frente, tapado. Destapando, la cola
 * hace el mismo camino: detrás de la cola, destapado. Cubierto, todo tapado; quieto, nada.
 */
export function maskDelVelo(fase: FaseDelVelo, t: number): string {
  if (fase === 'quieto') return `linear-gradient(to top left, ${DEJA_PASAR} 0%, ${DEJA_PASAR} 100%)`
  if (fase === 'cubierto') return `linear-gradient(to top left, ${TAPA} 0%, ${TAPA} 100%)`
  const paso = acotar01(t) * (100 + PLUMA_DEL_VELO)
  return fase === 'cubriendo'
    ? `linear-gradient(to top left, ${TAPA} 0%, ${TAPA} ${borde(paso - PLUMA_DEL_VELO)}, ${DEJA_PASAR} ${borde(paso)})`
    : `linear-gradient(to top left, ${DEJA_PASAR} 0%, ${DEJA_PASAR} ${borde(paso - PLUMA_DEL_VELO)}, ${TAPA} ${borde(paso)})`
}

/** Lo que tapa del cuadro (0 a 1) la máscara en su fase y su avance: el criterio del cambio (100 % cubierto) y el del banco. */
export function coberturaDelVelo(fase: FaseDelVelo, t: number): number {
  if (fase === 'quieto') return 0
  if (fase === 'cubierto') return 1
  const centro = acotar01(t) * (100 + PLUMA_DEL_VELO) - PLUMA_DEL_VELO / 2
  const tapado = acotar01(centro / 100)
  return fase === 'cubriendo' ? tapado : 1 - tapado
}
