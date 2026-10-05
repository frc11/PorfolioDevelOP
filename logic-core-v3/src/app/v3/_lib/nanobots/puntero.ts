/**
 * [EL ENCASTRE] 1C · EL MOUSE SOBRE UN SÍMBOLO — los nanobots se desarman en un radio chico alrededor del cursor: se
 * apartan con física y, al salir, vuelven con resorte; el resto del símbolo sigue armado y cada uno conserva su color.
 * El desarme es del sombreador (`enjambre.ts`, `apartadoPorElPuntero`), con el cursor como uniforme: la CPU sólo lleva dos
 * resortes por cuadro, sin three ni React:
 *
 *   · EL LUGAR del hueco sigue al cursor con un poco de atraso (y se pasa apenas al frenar): los que quedan atrás vuelven.
 *   · LA FUERZA se abre al entrar y, al salir, vuelve a cero pasándose un poco (se cierran hacia adentro y se asientan:
 *     el resorte). Su velocidad también va al sombreador: cada nanobot la lee con su azar, así no se mueven todos juntos.
 *
 * Sólo con mouse o lápiz (el dedo no pasa por encima) y con movimiento: con movimiento reducido el símbolo queda quieto.
 */
export const PUNTERO_DEL_ENJAMBRE = {
  /** El radio del hueco, en el cuadro del lienzo (de −1 a 1), y cuánto se apartan los del centro (fracción del radio). */
  radio: 0.2,
  empuje: 1,
  /** Cuánto se corren de costado (fracción del radio) y cuánto tiemblan sueltos (fracción del radio, a `ritmo` rad/s). */
  costado: 0.35,
  tiembla: 0.06,
  ritmo: 9,
  /** Los resortes (rigidez 1/s², amortiguación 1/s): el del lugar casi crítico; el de la fuerza se pasa ~20 %. */
  sigue: [150, 18],
  abre: [90, 8.5],
} as const

/** El estado de los dos resortes; lo que va al sombreador es `x`, `y`, `fuerza` y `velocidad`. */
export interface PunteroDelEnjambre {
  x: number
  y: number
  vx: number
  vy: number
  fuerza: number
  velocidad: number
}

export function punteroQuieto(): PunteroDelEnjambre {
  return { x: 0, y: 0, vx: 0, vy: 0, fuerza: 0, velocidad: 0 }
}

/** Adónde va: el cursor en el cuadro del lienzo y si está encima (con mouse, con movimiento). */
export interface ObjetivoDelPuntero {
  readonly x: number
  readonly y: number
  readonly dentro: boolean
}

const PASO = 1 / 240

/**
 * Un cuadro de los dos resortes (Euler semi-implícito en pasos de 1/240 s: estable con cualquier cuadro). Con el hueco
 * cerrado y quieto, el lugar salta al cursor (al entrar no cruza el símbolo desde donde salió). Escribe en `p`.
 */
export function pasoDelPuntero(p: PunteroDelEnjambre, o: ObjetivoDelPuntero, dt: number): void {
  const cerrado = Math.abs(p.fuerza) < 1e-3 && Math.abs(p.velocidad) < 1e-3
  if (cerrado && o.dentro) {
    p.x = o.x
    p.y = o.y
    p.vx = 0
    p.vy = 0
  }
  const [ks, cs] = PUNTERO_DEL_ENJAMBRE.sigue
  const [ka, ca] = PUNTERO_DEL_ENJAMBRE.abre
  const meta = o.dentro ? 1 : 0
  let resto = Math.min(Math.max(dt, 0), 0.1)
  while (resto > 1e-9) {
    const h = Math.min(PASO, resto)
    resto -= h
    if (o.dentro) {
      p.vx += (ks * (o.x - p.x) - cs * p.vx) * h
      p.vy += (ks * (o.y - p.y) - cs * p.vy) * h
      p.x += p.vx * h
      p.y += p.vy * h
    }
    p.velocidad += (ka * (meta - p.fuerza) - ca * p.velocidad) * h
    p.fuerza += p.velocidad * h
  }
  // Cerrado del todo: cero exacto (el sombreador no aparta a nadie).
  if (!o.dentro && Math.abs(p.fuerza) < 1e-4 && Math.abs(p.velocidad) < 1e-4) {
    p.fuerza = 0
    p.velocidad = 0
  }
}
