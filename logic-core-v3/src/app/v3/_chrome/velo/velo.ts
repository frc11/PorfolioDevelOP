/**
 * [B12a.6] EL VELO DE LA NAVEGACIÓN, PURO — el plan (`docs/rediseno/SPRINT-B12a.md` §5) y el CONTRATO: toda navegación entre páginas de
 * `/v3` pasa por el velo. Es la banda diagonal de la gota (`_secciones/trabajos/gota.ts`: entra por abajo a la derecha y sale por arriba a
 * la izquierda, con sus plumas y su curva) con una diferencia que la navegación necesita: la gota nunca tapa el cuadro entero, el velo SÍ,
 * en el cuadro del cambio, para que la página que sale y la que entra no se vean juntas. Cubre con el frente de la banda, la página cambia
 * debajo y destapa con su cola, en la misma dirección.
 *
 * [B12a.8] P-H32 · LA BANDA SE MUEVE CON `transform` (sólo el compositor): hasta B12a.7 era una máscara (`mask-image`) que cambiaba en cada
 * cuadro y se volvía a rasterizar a pantalla entera (el primer tramo al cubrir, 44–62 ms en el build). Ahora es un elemento con su degradé
 * QUIETO (la pluma del frente, el cuerpo entero y la pluma de la cola), girado sobre la diagonal y corrido con una animación del
 * compositor: el hilo principal puede estar ocupado (la página nueva montándose) y la banda sigue pareja.
 *
 * [B12a.8] EL COLOR CONTRASTA CON LO QUE TAPA (antes, la noche del destino: sobre papel, un velo de papel no se veía): sobre papel, la
 * tinta; sobre la escena de noche, el papel; sobre la sala de día, la tinta.
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
 * Lo que tarda (ms) y cuándo destapa. [B12a.8] Una pasada continua: cubrir y destapar más cortos, y el destape apenas la página nueva tiene
 * su primer cuadro estable: montada, con su scroll en su lugar y `cuadrosPintados` cuadros pintados (de cualquier duración: la banda va en el
 * compositor y lo que la página arme después no la traba); `esperaMaximaMs` queda sólo de techo de emergencia. Antes (B12a.7) esperaba 20
 * cuadros parejos y todos los títulos en camino: hasta 3,5 s tapado, y el home tironea más de 1 s al montarse (medido en el build).
 */
export const VELO = { cubrirMs: 460, destaparMs: 560, cuadrosPintados: 2, esperaMaximaMs: 3500 } as const

/**
 * ¿Ya se puede destapar? La página nueva montada (y [T0] su escena lista: la variante de la página dibujada, `escenaDeLaRutaLista`) y sus
 * cuadros pintados (con el scroll en su lugar), o la espera cumplida (el techo).
 */
export function puedeDestapar(cuadrosPintados: number, montada: boolean, esperandoMs: number): boolean {
  return (montada && cuadrosPintados >= VELO.cuadrosPintados) || esperandoMs >= VELO.esperaMaximaMs
}

/** La pluma del frente y de la cola, en % del recorrido (el largo del degradé sobre la diagonal): la de la gota. */
export const PLUMA_DEL_VELO = 16

/** La curva: la del barrido de la gota (1 − (1 − t)²), en CSS para el compositor. */
export const CURVA_DEL_VELO = (t: number): number => 1 - (1 - t) * (1 - t)
export const CURVA_DEL_VELO_CSS = 'cubic-bezier(0.5, 1, 0.89, 1)'

const acotar01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * La geometría de la banda para un cuadro de `ancho` × `alto` (px): el recorrido `L` (lo que mide el cuadro sobre la dirección del barrido,
 * de la esquina de abajo a la derecha a la de arriba a la izquierda: 2·a·h / diagonal), la pluma `P`, el largo de la banda (`largo`, a lo
 * largo del frente: la diagonal, con un margen) y su espesor (`espesor`: pluma, cuerpo y pluma), y el giro del frente (rad).
 */
export interface GeometriaDeLaBanda {
  readonly recorrido: number
  readonly pluma: number
  readonly largo: number
  readonly espesor: number
  readonly giro: number
}

export function geometriaDeLaBanda(ancho: number, alto: number): GeometriaDeLaBanda {
  const diagonal = Math.hypot(ancho, alto)
  const recorrido = diagonal > 0 ? (2 * ancho * alto) / diagonal : 0
  const pluma = (PLUMA_DEL_VELO / 100) * recorrido
  // El cuerpo, unos píxeles más largo que el recorrido: cubierto entero sin depender del redondeo.
  return { recorrido, pluma, largo: diagonal + 8, espesor: recorrido + 2 * pluma + 4, giro: Math.atan2(-alto, ancho) }
}

/**
 * Dónde va el frente (px sobre el barrido, desde la esquina de abajo a la derecha) en cada fase y avance `t` (0 → 1, ya con la curva):
 * cubriendo, de 0 (la banda entera afuera) a `L + P` (cubierto entero); destapando, de ahí a `2L + 2P` (la cola pasó la otra esquina).
 */
export function frenteDelVelo(fase: FaseDelVelo, t: number, g: GeometriaDeLaBanda): number {
  const cubierto = g.recorrido + g.pluma
  if (fase === 'quieto') return 0
  if (fase === 'cubierto') return cubierto
  return fase === 'cubriendo' ? acotar01(t) * cubierto : cubierto + acotar01(t) * cubierto
}

/** La transformada de la banda (centrada en el cuadro, girada sobre la diagonal) con el frente en `frente`. */
export function transformadaDelVelo(frente: number, g: GeometriaDeLaBanda): string {
  // El frente es el borde de arriba de la banda (en su eje); el centro del cuadro está a L/2 de la esquina de abajo a la derecha.
  const y = g.espesor / 2 - frente + g.recorrido / 2
  return `translate(-50%, -50%) rotate(${g.giro.toFixed(5)}rad) translateY(${y.toFixed(2)}px)`
}

/** El degradé quieto de la banda (de su frente a su cola): la pluma, el cuerpo y la pluma, del color del velo. */
export function degradeDelVelo(color: string, g: GeometriaDeLaBanda): string {
  const p = (100 * g.pluma) / g.espesor
  return `linear-gradient(to bottom, transparent 0%, ${color} ${p.toFixed(3)}%, ${color} ${(100 - p).toFixed(3)}%, transparent 100%)`
}

/** Lo que tapa del cuadro (0 a 1) en su fase y su avance: el criterio del cambio (100 % cubierto) y el del banco. */
export function coberturaDelVelo(fase: FaseDelVelo, t: number): number {
  if (fase === 'quieto') return 0
  if (fase === 'cubierto') return 1
  const centro = acotar01(t) * (100 + PLUMA_DEL_VELO) - PLUMA_DEL_VELO / 2
  const tapado = acotar01(centro / 100)
  return fase === 'cubriendo' ? tapado : 1 - tapado
}

/** El tono de lo que el velo va a tapar: `claro` (papel, la sala de día) o `oscuro` (la escena de noche, una sección invertida). */
export type TonoDeLoTapado = 'claro' | 'oscuro'

/** El color del velo: contrasta con lo que tapa (sobre lo claro, la tinta; sobre lo oscuro, el papel). */
export const colorDelVelo = (tapa: TonoDeLoTapado): 'tinta' | 'papel' => (tapa === 'claro' ? 'tinta' : 'papel')
