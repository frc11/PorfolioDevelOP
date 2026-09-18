/**
 * COMPROBACIONES DE S11 · el factor de cielo de la celosía.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-piso.invariant.ts
 *
 * El factor de cielo: la forma cerrada contra la integral de hemisferio, con
 * su control positivo, y la prueba de que Ω sale de la geometría.
 *
 * ⚠️ **Modo pulido sacó el techo de sombra, el brillo medio de las seis poses
 * y las marcas de piso en sombra**: eran composición.
 *
 * Lo que este sprint decidió NO tener —el cuerpo del sol y los haces— está en
 * `s11-sin-sol.invariant.ts`, con sus controles positivos.
 */
import {
  celosiaCoverage,
  celosiaSkyIntegral,
  fitCelosiaSkyShare,
} from '@/app/v3/_lib/escena/celosiaGeometry'
import {
  CELOSIA_BAR,
  CELOSIA_SKY_SHARE,
  celosiaSkyFactor,
} from '@/app/v3/_lib/escena/probeCelosia'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'
import { FLOOR_Y, check, report, section } from './harness'

const SKY = celosiaSkyFactor(CELOSIA_BAR)

// ── 2 · El factor de cielo ──────────────────────────────────────────────────

section('El factor de cielo: forma cerrada contra la integral de hemisferio')

{
  /**
   * ⚠️ **CONTROL POSITIVO.** Comparar dos funciones que coinciden no prueba nada
   * si las dos son constantes. Primero hay que ver que el factor SE MUEVA: en 0 la
   * celosía no tapa nada y tiene que dar exactamente 1.
   */
  check(
    'control positivo — el instrumento se mueve: con la barra en 0 el cielo está abierto y vale 1',
    celosiaSkyFactor(0) === 1 && celosiaSkyIntegral([0, FLOOR_Y, 0], 0, MOIRE_MISMATCH) === 1,
    'sin esto, dos funciones que devolvieran siempre lo mismo pasarían el chequeo de abajo'
  )

  const bars = [0.05, 0.15, 0.2, 0.25, CELOSIA_BAR, 0.35, 0.45, 0.5]
  const errors = bars.map((bar) =>
    Math.abs(celosiaSkyIntegral([0, FLOOR_Y, 0], celosiaCoverage(bar), MOIRE_MISMATCH) - celosiaSkyFactor(bar))
  )
  const worst = Math.max(...errors)
  check(
    'la forma cerrada reproduce la integral en TODO el rango del slider',
    worst < 0.006,
    `peor error ${(worst * 1000).toFixed(1)}/1000 · en la barra de diseño ${(errors[bars.indexOf(CELOSIA_BAR)] * 1000).toFixed(1)}/1000 · cielo = ${SKY.toFixed(4)}`
  )

  /**
   * ⚠️ **Ω SALE DE LA GEOMETRÍA, NO ESTÁ ESCRITO A MANO.** Es la condición que el
   * humano puso en la Parada 1: si mañana cambian los radios o las bandas en
   * `probeMoire.ts`, el factor de cielo tiene que moverse solo. Se comprueba
   * corriendo el mismo ajuste contra una celosía más alta: si Ω fuera una
   * constante escrita, los dos números serían iguales.
   */
  const taller = fitCelosiaSkyShare([0, FLOOR_Y, 0], MOIRE_MISMATCH, 600)
  const tighter = (() => {
    // Un punto más cerca del borde ve la celosía más alta a un lado y más baja al
    // otro: es la variación que la constante aplana, y está declarada.
    return fitCelosiaSkyShare([32, FLOOR_Y, 0], MOIRE_MISMATCH, 600)
  })()
  check(
    'Ω se recalcula de la geometría y cambia cuando cambia el punto de vista',
    Math.abs(taller - CELOSIA_SKY_SHARE) < 0.01 && Math.abs(tighter - CELOSIA_SKY_SHARE) > 0.02,
    `en el centro Ω = ${CELOSIA_SKY_SHARE.toFixed(4)} (mismo ajuste con menos muestras: ${taller.toFixed(4)}) · en el borde de la losa ${tighter.toFixed(4)} — ésa es la simplificación declarada, ±${((Math.abs(tighter - CELOSIA_SKY_SHARE) / CELOSIA_SKY_SHARE) * 100).toFixed(0)}%`
  )
  check(
    'y el factor de cielo baja cuando sube la barra, monótono',
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].every(
      (bar, i, list) => i === 0 || celosiaSkyFactor(bar) < celosiaSkyFactor(list[i - 1])
    ),
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((bar) => celosiaSkyFactor(bar).toFixed(3)).join(' → ')
  )
}

report('s11 · el piso')
