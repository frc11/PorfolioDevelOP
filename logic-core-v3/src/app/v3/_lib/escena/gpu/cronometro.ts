import type * as THREE from 'three'

/**
 * [ESCENA 6] EL CRONÓMETRO DE LA GPU — para el banco: cuánto tarda en la GPU una pasada (la simulación
 * del piso, la del polvo, la pasada extra de 6f). Con `EXT_disjoint_timer_query_webgl2` mide el tiempo
 * de GPU de verdad; sin la extensión, el tiempo de CPU entre dos `finish` (una cota de arriba).
 * Sin pedidos no hace nada más que correr la pasada.
 */
export interface Medida {
  readonly ms: number
  readonly como: string
}

export interface Cronometro {
  /** El banco pide medir las próximas `pasos` pasadas; la promesa trae el promedio. */
  readonly pedir: (pasos: number) => Promise<Medida>
  /** Corre la pasada, medida si hay un pedido abierto. */
  readonly correr: (gl: THREE.WebGLRenderer, pasada: () => void) => void
}

interface Extension {
  readonly TIME_ELAPSED_EXT: number
}

export function crearCronometro(): Cronometro {
  let pedidos = 0
  let consultas: WebGLQuery[] = []
  let cpu: number[] = []
  let listo: ((m: Medida) => void) | null = null

  const cerrar = (ctx: WebGL2RenderingContext): void => {
    const avisar = listo
    listo = null
    if (avisar === null) return
    if (consultas.length === 0) {
      avisar({ ms: cpu.reduce((a, b) => a + b, 0) / Math.max(1, cpu.length), como: 'cpu con finish (cota de arriba)' })
      return
    }
    const estas = consultas
    const leer = (): void => {
      if (!estas.every((q) => ctx.getQueryParameter(q, ctx.QUERY_RESULT_AVAILABLE) === true)) {
        requestAnimationFrame(leer)
        return
      }
      const ns = estas.map((q) => Number(ctx.getQueryParameter(q, ctx.QUERY_RESULT)))
      for (const q of estas) ctx.deleteQuery(q)
      avisar({ ms: ns.reduce((a, b) => a + b, 0) / ns.length / 1e6, como: 'consulta de tiempo de la GPU' })
    }
    requestAnimationFrame(leer)
  }

  return {
    pedir: (pasos) =>
      new Promise((resolver) => {
        pedidos = pasos
        consultas = []
        cpu = []
        listo = resolver
      }),
    correr: (gl, pasada) => {
      if (pedidos <= 0 || listo === null) {
        pasada()
        return
      }
      const ctx = gl.getContext() as WebGL2RenderingContext
      const ext = ctx.getExtension('EXT_disjoint_timer_query_webgl2') as Extension | null
      if (ext !== null) {
        const q = ctx.createQuery()
        ctx.beginQuery(ext.TIME_ELAPSED_EXT, q)
        pasada()
        ctx.endQuery(ext.TIME_ELAPSED_EXT)
        consultas.push(q)
      } else {
        ctx.finish()
        const t0 = performance.now()
        pasada()
        ctx.finish()
        cpu.push(performance.now() - t0)
      }
      pedidos -= 1
      if (pedidos === 0) cerrar(ctx)
    },
  }
}
