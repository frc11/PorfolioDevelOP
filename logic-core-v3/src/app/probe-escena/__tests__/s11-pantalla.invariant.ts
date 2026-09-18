/**
 * COMPROBACIONES DE S11 · la matemática de borde del filtro de píxel del gobo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-pantalla.invariant.ts
 *
 * El gobo es analítico, se evalúa por fragmento y no hay ninguna cadena de
 * mipmaps que lo promedie cuando la trama deja de resolverse. El filtro es de
 * él: con huella cero el perfil tiene que ser BINARIO, y con huella de una
 * celda tiene que valer exactamente la barra — el promedio de la trama.
 *
 * ⚠️ **Modo pulido sacó la huella/cuantiles sobre los cinco recorridos y el
 * batido proyectado por pose**: eran composición.
 */
import { celosiaBarAt, celosiaBarFiltered } from '@/app/v3/_lib/escena/celosiaGeometry'
import { CELOSIA_BAR } from '@/app/v3/_lib/escena/probeCelosia'
import { check, report, section } from './harness'

section('El filtro del gobo: matemática de borde')

{
  /**
   * ⚠️ **CONTROL POSITIVO DEL FILTRO.** "El filtro promedia" es una afirmación
   * sobre algo que casi nunca ocurre, así que hay que forzarlo: con huella cero el
   * perfil tiene que ser BINARIO, y con huella de una celda tiene que valer
   * exactamente la barra — el promedio de la trama.
   */
  const hardIn = celosiaBarFiltered(0, CELOSIA_BAR, 0)
  const hardOut = celosiaBarFiltered(0.4, CELOSIA_BAR, 0)
  check(
    'control positivo — con huella cero el perfil es binario: adentro 1, afuera 0',
    Math.abs(hardIn - 1) < 1e-9 && Math.abs(hardOut) < 1e-9,
    `${hardIn.toFixed(3)} en el centro de la barra contra ${hardOut.toFixed(3)} en el hueco`
  )
  const blurredIn = celosiaBarFiltered(0, CELOSIA_BAR, 1)
  const blurredOut = celosiaBarFiltered(0.4, CELOSIA_BAR, 1)
  check(
    'control positivo — con huella de una celda el patrón se reemplaza por su propia media',
    Math.abs(blurredIn - CELOSIA_BAR) < 1e-9 && Math.abs(blurredOut - CELOSIA_BAR) < 1e-9,
    `${blurredIn.toFixed(3)} y ${blurredOut.toFixed(3)} contra una barra de ${CELOSIA_BAR} — gris parejo en vez de titileo`
  )
  check(
    'y el perfil duro y el filtrado son el mismo patrón donde se resuelve',
    Math.abs(celosiaBarAt(0.05, CELOSIA_BAR) - celosiaBarFiltered(0.05, CELOSIA_BAR, 1e-4)) < 1e-6,
    'el filtro no cambia el dibujo: solo lo apaga cuando deja de caber en un píxel'
  )
}

report('s11 · la proyección en pantalla')
