import { instalarElSonido } from '../../_lib/sonido/bus'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { leerVolumenes } from '../../_lib/sonido/preferencia'

/**
 * [3D Y SONIDO] T2 · UN SOLO MOTOR para el control del parlante y la página de prueba (`/v3?sonidos=1`), si están los
 * dos: se carga con el primero que lo pide (un `import()`: howler y el archivo viajan recién acá) y se suelta cuando lo
 * suelta el último. Mientras existe está instalado en el bus: el sitio suena.
 */
let promesa: Promise<MotorDelSonido> | null = null
let usuarios = 0
let motorActual: MotorDelSonido | null = null

/**
 * [PASADA FINAL] A4 · LO REAL, para que lo mostrado coincida: sin motor, cargando (howler y el archivo en camino), con el
 * contexto suspendido (todavía sin una acción de verdad), o listo. Lo leen el parlante (`data-estado`) y la página de prueba.
 */
export type EstadoDelMotor = 'sin-motor' | 'cargando' | 'suspendido' | 'listo'
const oyentes = new Set<() => void>()

export function estadoDelMotor(): EstadoDelMotor {
  if (promesa === null) return 'sin-motor'
  if (motorActual === null) return 'cargando'
  return motorActual.estado()
}

export function suscribirAlMotor(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

/** Lo llama el motor con cada cambio real (el archivo que carga, el contexto que se suspende o corre). */
export function avisarDelMotor(): void {
  for (const f of oyentes) f()
}

export function pedirElMotor(): Promise<MotorDelSonido> {
  usuarios += 1
  if (promesa === null) {
    const esta: Promise<MotorDelSonido> = import('../../_lib/sonido/motor').then(({ crearElMotor }) => {
      const motor = crearElMotor(leerVolumenes(), avisarDelMotor)
      // Si lo soltaron mientras llegaba, no se instala (y el que lo soltó lo apaga).
      if (promesa === esta) {
        instalarElSonido(motor)
        motorActual = motor
      }
      avisarDelMotor()
      return motor
    })
    promesa = esta
    avisarDelMotor()
  }
  return promesa
}

export function soltarElMotor(): void {
  usuarios = Math.max(0, usuarios - 1)
  if (usuarios > 0 || promesa === null) return
  const soltada = promesa
  promesa = null
  motorActual = null
  instalarElSonido(null)
  avisarDelMotor()
  void soltada.then((m) => m.soltar())
}
