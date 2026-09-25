/**
 * [ESCENA 4] EL LOGO CON PESO — puro: resortes que SUMAN un movimiento secundario a la pose y vuelven
 * a cero. Nunca cambian la pose de reposo ni la coreografía: con el cursor afuera y el scroll quieto,
 * todo vale exactamente 0.
 *
 * - **Hacia el cursor.** Se inclina unos pocos grados hacia donde está el puntero, con un resorte
 *   subamortiguado: llega, se pasa un poco y vuelve.
 * - **Al frenar un scroll fuerte.** Mientras el scroll corre, el logo se queda un poco atrás (baja y
 *   cabecea); cuando frena de golpe, el resorte lo pasa del cero y lo asienta. Un scroll suave casi
 *   no lo mueve: el objetivo es proporcional a la velocidad y tiene tope.
 */

export const PESO = {
  /** La inclinación máxima hacia el cursor, en radianes: 4° de costado, 3° de arriba abajo. */
  hacia: { costado: 0.07, arriba: 0.052 },
  /** El resorte de la inclinación: frecuencia y amortiguamiento (menos de 1 = se pasa). */
  resorteDelCursor: { hz: 1.5, zeta: 0.45 },
  /** El scroll: cuánto baja y cabecea por unidad de velocidad de progreso (1/s), y los topes. */
  scroll: { bajaPorVelocidad: 2.2, topeDeBajada: 0.24, cabeceoPorVelocidad: 0.5, topeDeCabeceo: 0.05 },
  resorteDelScroll: { hz: 1.9, zeta: 0.3 },
  /** La velocidad del progreso se suaviza un poco para que un salto de un cuadro no patee. */
  suavizadoDeLaVelocidadS: 0.06,
} as const

export interface Resorte {
  readonly x: number
  readonly v: number
}

export const QUIETO: Resorte = { x: 0, v: 0 }

/**
 * Un paso del resorte-amortiguador hacia `objetivo` (Euler semi-implícito, estable con los `dt` de un
 * cuadro). `hz` es la frecuencia natural y `zeta` el amortiguamiento.
 */
export function pasoDelResorte(r: Resorte, objetivo: number, dt: number, hz: number, zeta: number): Resorte {
  if (dt <= 0) return r
  const w = 2 * Math.PI * hz
  const a = -w * w * (r.x - objetivo) - 2 * zeta * w * r.v
  const v = r.v + a * dt
  return { x: r.x + v * dt, v }
}

export interface EstadoDelPeso {
  readonly costado: Resorte
  readonly arriba: Resorte
  readonly bajada: Resorte
  readonly cabeceo: Resorte
  /** La velocidad del progreso, suavizada, y el progreso del cuadro anterior. */
  readonly velocidad: number
  readonly progreso: number
}

export function pesoInicial(progreso: number): EstadoDelPeso {
  return { costado: QUIETO, arriba: QUIETO, bajada: QUIETO, cabeceo: QUIETO, velocidad: 0, progreso }
}

export interface EntradaDelPeso {
  readonly dt: number
  readonly progreso: number
  /** El puntero en NDC, o `null` si está afuera de la ventana o nunca entró. */
  readonly cursor: { readonly x: number; readonly y: number } | null
  /** Táctil, movimiento reducido, túnel o viaje del navbar: todo vuelve a cero. */
  readonly apagado: boolean
}

const acotar = (v: number, tope: number): number => Math.max(-tope, Math.min(tope, v))

export function avanzarElPeso(e: EstadoDelPeso, entrada: EntradaDelPeso): EstadoDelPeso {
  const dt = Math.min(entrada.dt, 0.05)
  const cruda = dt > 0 ? (entrada.progreso - e.progreso) / dt : 0
  const k = dt > 0 ? 1 - Math.exp(-dt / PESO.suavizadoDeLaVelocidadS) : 0
  const velocidad = entrada.apagado ? 0 : e.velocidad + (cruda - e.velocidad) * k
  const c = entrada.apagado || entrada.cursor === null ? { x: 0, y: 0 } : entrada.cursor
  const rc = PESO.resorteDelCursor
  const rs = PESO.resorteDelScroll
  const s = PESO.scroll
  return {
    costado: pasoDelResorte(e.costado, acotar(c.x, 1) * PESO.hacia.costado, dt, rc.hz, rc.zeta),
    arriba: pasoDelResorte(e.arriba, acotar(c.y, 1) * PESO.hacia.arriba, dt, rc.hz, rc.zeta),
    bajada: pasoDelResorte(e.bajada, -acotar(velocidad * s.bajaPorVelocidad, s.topeDeBajada), dt, rs.hz, rs.zeta),
    cabeceo: pasoDelResorte(e.cabeceo, acotar(velocidad * s.cabeceoPorVelocidad, s.topeDeCabeceo), dt, rs.hz, rs.zeta),
    velocidad,
    progreso: entrada.progreso,
  }
}
