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

export function pedirElMotor(): Promise<MotorDelSonido> {
  usuarios += 1
  if (promesa === null) {
    const esta: Promise<MotorDelSonido> = import('../../_lib/sonido/motor').then(({ crearElMotor }) => {
      const motor = crearElMotor(leerVolumenes())
      // Si lo soltaron mientras llegaba, no se instala (y el que lo soltó lo apaga).
      if (promesa === esta) instalarElSonido(motor)
      return motor
    })
    promesa = esta
  }
  return promesa
}

export function soltarElMotor(): void {
  usuarios = Math.max(0, usuarios - 1)
  if (usuarios > 0 || promesa === null) return
  const soltada = promesa
  promesa = null
  instalarElSonido(null)
  void soltada.then((m) => m.soltar())
}
