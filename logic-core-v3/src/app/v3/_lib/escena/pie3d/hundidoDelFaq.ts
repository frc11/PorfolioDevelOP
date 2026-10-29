import { HUNDIDOS, cuantoSeHunde } from '../../pie3d/registro'
import { HUNDIDA_DEL_PIE } from './armadas'
import type { UniformesDelPie } from './coreografia'

/** Lo que el hundido toca de un bloque del FAQ de volumen (`faqDeVolumen.ts`). */
interface BloqueQueSeHunde {
  readonly elemento: HTMLElement
  hundido: number
  readonly uniformes: Pick<UniformesDelPie, 'uEncimaDelPie'>
}

/**
 * [L5] El hover del WhatsApp del FAQ: el hundido y la cara que se aclara de las placas del pie (`armadas.ts`, `encimaDelPie.ts`).
 * [INT] Sale de `faqDeVolumen.ts` para que ese archivo vuelva a entrar en las 300 líneas de código (s8-montaje).
 */
export function hundirComoElPie(b: BloqueQueSeHunde, quieto: boolean, dt: number): void {
  const h = HUNDIDOS.get(b.elemento)
  const pedido = cuantoSeHunde(h, HUNDIDA_DEL_PIE.encima / HUNDIDA_DEL_PIE.apretada) * HUNDIDA_DEL_PIE.apretada
  const k = Math.exp(-dt / HUNDIDA_DEL_PIE.tau)
  b.hundido = quieto ? pedido : pedido + (b.hundido - pedido) * k
  const encima = h !== undefined && (h.encima || h.foco || h.apretada) ? 1 : 0
  b.uniformes.uEncimaDelPie.value = quieto ? encima : encima + (b.uniformes.uEncimaDelPie.value - encima) * k
}
