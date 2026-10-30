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

/** La transición del corrimiento: al abrirse, enseguida; al volver, después de que la elegida bajó. */
export function transicionDelCorrimiento(papel: PapelDeLaTapa): string {
  const demora = papel === 'reposo' || papel === 'bajando' ? MS.bajar : 0
  return `transform ${String(MS.correrse)}ms var(--ease-salida) ${String(demora)}ms`
}

/** La transición del alza: la elegida espera a que las vecinas se corran; la que baja, enseguida. */
export function transicionDelAlza(papel: PapelDeLaTapa): string {
  if (papel === 'elegida') return `transform ${String(MS.levantarse)}ms var(--ease-salida) ${String(MS.espera)}ms`
  return `transform ${String(MS.bajar)}ms var(--ease-salida) 0ms`
}
