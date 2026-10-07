/**
 * [EL ENCASTRE] 1C · EL MOUSE SOBRE UN SÍMBOLO — los nanobots se desarman en un radio chico alrededor del cursor: se
 * apartan con física y, al salir, vuelven con resorte; el resto del símbolo sigue armado y cada uno conserva su color.
 * El desarme es del sombreador (`enjambre.ts`, `apartadoPorElPuntero`), con el cursor como uniforme: la CPU sólo lleva un
 * resorte por cuadro, sin three ni React:
 *
 *   · EL LUGAR del hueco: [RETOQUE DEL ENCASTRE] 2A · justo donde se ve el cursor (el de la sala ya trae su
 *     interpolación; antes el hueco seguía al puntero nativo con un resorte y quedaba lejos del cursor que se ve): los que
 *     quedan atrás vuelven.
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
  /** El resorte de la fuerza (rigidez 1/s², amortiguación 1/s): se pasa ~20 %. */
  abre: [90, 8.5],
} as const

/** El lugar y el resorte de la fuerza; lo que va al sombreador es `x`, `y`, `fuerza` y `velocidad`. */
export interface PunteroDelEnjambre {
  x: number
  y: number
  fuerza: number
  velocidad: number
}

export function punteroQuieto(): PunteroDelEnjambre {
  return { x: 0, y: 0, fuerza: 0, velocidad: 0 }
}

/** Adónde va: el cursor en el cuadro del lienzo y si está encima (con mouse, con movimiento). */
export interface ObjetivoDelPuntero {
  readonly x: number
  readonly y: number
  readonly dentro: boolean
}

const PASO = 1 / 240

/**
 * Un cuadro: el lugar, donde se ve el cursor (adentro; afuera se queda donde estaba, mientras el hueco se cierra); la
 * fuerza, con su resorte (Euler semi-implícito en pasos de 1/240 s: estable con cualquier cuadro). Escribe en `p`.
 */
export function pasoDelPuntero(p: PunteroDelEnjambre, o: ObjetivoDelPuntero, dt: number): void {
  if (o.dentro) {
    p.x = o.x
    p.y = o.y
  }
  const [ka, ca] = PUNTERO_DEL_ENJAMBRE.abre
  const meta = o.dentro ? 1 : 0
  let resto = Math.min(Math.max(dt, 0), 0.1)
  while (resto > 1e-9) {
    const h = Math.min(PASO, resto)
    resto -= h
    p.velocidad += (ka * (meta - p.fuerza) - ca * p.velocidad) * h
    p.fuerza += p.velocidad * h
  }
  // Cerrado del todo: cero exacto (el sombreador no aparta a nadie).
  if (!o.dentro && Math.abs(p.fuerza) < 1e-4 && Math.abs(p.velocidad) < 1e-4) {
    p.fuerza = 0
    p.velocidad = 0
  }
}
