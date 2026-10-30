/**
 * [M1] EL ESTANTE DE LAS DEMOS, EN NÚMEROS (puro) — las cinco tapas apoyadas, una encima de la otra y apenas torcidas (el prototipo 17 de
 * `l7/lab`). Lo que cambia contra el prototipo es que una tapa NUNCA atraviesa a otra:
 *
 *   · el orden de apilado no cambia nunca (cada tapa está encima de la anterior, como libros apoyados): la elegida no salta adelante;
 *   · al elegir una, PRIMERO se corren: la elegida y las de su izquierda a la izquierda, las de su derecha a la derecha, lo justo para que la
 *     de adelante la deje libre; RECIÉN después la elegida se levanta y se endereza (`MS.espera`);
 *   · al soltarla, primero baja y después las vecinas vuelven.
 *
 * Todo en fracciones del ancho de la tapa (`--ancho-de-la-tapa`), así vale igual en 390 que en 1440.
 */

/** El giro y la caída de cada tapa en reposo (fijos: el desorden es siempre el mismo). */
export const POSE_DE_LAS_TAPAS = [
  { giro: -5, baja: 3 },
  { giro: 3, baja: 0 },
  { giro: -2, baja: 5 },
  { giro: 4, baja: 1 },
  { giro: -3, baja: 4 },
] as const

/** El alto de una tapa en anchos (la portada es 2:3). */
export const ALTO_EN_ANCHOS = 1.5

/** Cuánto pisa una tapa a la siguiente, en anchos (el margen negativo de cada lado, sumado). */
export const PISADA = 0.2

/** Cuánto se levanta la elegida, en anchos. */
export const ALZA = 0.12

/**
 * Cuánto se abren las vecinas, en anchos (la separación total entre la elegida y la de su derecha). Tiene que cubrir la pisada más lo que
 * asoman de costado las dos esquinas de arriba con el giro más grande (alto × sen 5°, de cada lado) y un poco de aire.
 */
export const APERTURA = PISADA + 2 * ALTO_EN_ANCHOS * Math.sin((5 * Math.PI) / 180) + 0.08

/** Los tiempos: cuánto tardan en correrse las vecinas (y la elegida espera eso para levantarse) y cuánto tarda en levantarse o bajar. */
export const MS = { correrse: 240, espera: 240, levantarse: 260, bajar: 180 } as const

export type PapelDeLaTapa = 'reposo' | 'izquierda' | 'derecha' | 'elegida' | 'bajando'

/**
 * El papel de la tapa `i` con la elegida `activa` (o ninguna) y la última que estuvo elegida (`ultima`, para que baje antes de que las
 * otras vuelvan).
 */
export function papelDeLaTapa(i: number, activa: number | null, ultima: number | null): PapelDeLaTapa {
  if (activa === null) return i === ultima ? 'bajando' : 'reposo'
  if (i === activa) return 'elegida'
  return i < activa ? 'izquierda' : 'derecha'
}

/** El corrimiento de costado de la tapa, en anchos: la elegida y las de su izquierda a la izquierda, las de su derecha a la derecha. */
export function corrimiento(papel: PapelDeLaTapa): number {
  if (papel === 'izquierda' || papel === 'elegida') return -APERTURA / 2
  if (papel === 'derecha') return APERTURA / 2
  return 0
}

/**
 * El estado del estante: la elegida, la última que lo estuvo (baja antes de que las otras vuelvan), cuándo se soltó la última y cuánto
 * espera el corrimiento de esta elección (`demora`): si otra tapa todavía está bajando, las vecinas esperan a que llegue abajo antes de
 * moverse, así ninguna se le cruza por delante mientras sigue levantada.
 */
export interface EstadoDelEstante {
  readonly activa: number | null
  readonly ultima: number | null
  readonly demora: number
  readonly soltadaEn: number
}

export const ESTANTE_EN_REPOSO: EstadoDelEstante = { activa: null, ultima: null, demora: 0, soltadaEn: Number.NEGATIVE_INFINITY }

/** Elegir la tapa `i` (el mouse entra o el foco llega) en el instante `ahora` (ms). */
export function elegirLaTapa(e: EstadoDelEstante, i: number, ahora: number): EstadoDelEstante {
  if (e.activa === i) return e
  // Lo que le falta bajar a la anterior: entera si estaba levantada recién; lo que le quede si se soltó hace menos de lo que tarda en bajar.
  const bajando = e.ultima === null || e.ultima === i ? 0 : e.activa !== null ? MS.bajar : Math.max(0, MS.bajar - (ahora - e.soltadaEn))
  return { activa: i, ultima: i, demora: bajando, soltadaEn: e.soltadaEn }
}

/** Soltar la tapa `i` (el mouse sale o el foco se va) en el instante `ahora`; si ya no era la elegida, nada. */
export function soltarLaTapa(e: EstadoDelEstante, i: number, ahora: number): EstadoDelEstante {
  return e.activa === i ? { activa: null, ultima: e.ultima, demora: 0, soltadaEn: ahora } : e
}

/** Cuándo arranca el corrimiento de una tapa (ms): al volver, después de que la elegida bajó; al abrirse, después de que la anterior bajó. */
export function demoraDelCorrimiento(papel: PapelDeLaTapa, e: EstadoDelEstante): number {
  return papel === 'reposo' || papel === 'bajando' ? MS.bajar : e.demora
}

/** Cuándo arranca el alza (ms): la elegida, cuando las vecinas ya se corrieron; la que baja, enseguida. */
export function demoraDelAlza(papel: PapelDeLaTapa, e: EstadoDelEstante): number {
  return papel === 'elegida' ? e.demora + MS.espera : 0
}

/** La transición del corrimiento (el `transition` de la tapa). */
export function transicionDelCorrimiento(papel: PapelDeLaTapa, e: EstadoDelEstante): string {
  return `transform ${String(MS.correrse)}ms var(--ease-salida) ${String(demoraDelCorrimiento(papel, e))}ms`
}

/** La transición del alza (el `transition` de su cara). */
export function transicionDelAlza(papel: PapelDeLaTapa, e: EstadoDelEstante): string {
  return `transform ${String(papel === 'elegida' ? MS.levantarse : MS.bajar)}ms var(--ease-salida) ${String(demoraDelAlza(papel, e))}ms`
}
