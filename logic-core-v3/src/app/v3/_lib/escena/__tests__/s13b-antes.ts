import { afirmar, controlPositivo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { makeTrack, type Track } from '@/app/probe-escena/__tests__/harness'
import { barridoVertical, conPose } from './s10-logo-lectura'
import type { CajaEnElCuadro } from './s13b-diferencial'
import { perfilDeSegmentos, picoPorPantalla, type PerfilDeSegmento } from './s13b-soporte'

/**
 * EL CONTRAFACTUAL DE B13 — la escena con las distancias de ANTES del sprint.
 *
 * B13 alejó dos poses (`quiénes somos` 11,5 → 14 y `demos` 9 → 14) y con eso el
 * logo dejó de recortarse, dejó de tapar el titular del diferencial y dejó de
 * ser el objeto más rápido del recorrido. **Cada una de esas tres cosas era el
 * caso «malo» de un control positivo**, así que sin un ANTES esos controles
 * pasarían por no encontrar nada: verdes, ciegos y sin decir nada.
 *
 * Acá vive ese ANTES, en un archivo propio para que los tres invariantes que lo
 * necesitan lo compartan y para que nadie lo confunda con una perilla de
 * composición. `CHOREO_KEYFRAMES` no se toca: se copia.
 */
export const DISTANCIAS_DE_ANTES_DE_B13: Readonly<Record<string, number>> = { 'quiénes somos': 11.5, demos: 9 }

export const PISTA_ANTES_DE_B13: Track = makeTrack(
  CHOREO_KEYFRAMES.map((k) =>
    DISTANCIAS_DE_ANTES_DE_B13[k.name] === undefined
      ? k
      : { ...k, pose: { ...k.pose, distance: DISTANCIAS_DE_ANTES_DE_B13[k.name] } },
  ),
)

/** La superposición mínima del titular, con la distancia VIEJA de `demos`. */
export function superposicionMinimaAntesDeB13(caja: CajaEnElCuadro, progreso: number): number {
  return barridoVertical(
    conPose('demos', { distance: DISTANCIAS_DE_ANTES_DE_B13.demos }, progreso, caja.ventana.aspecto),
    caja.x0,
    caja.x1,
    caja.alto,
    100,
  ).minima
}

/**
 * §1 DE `s13b-escena.invariant.ts` — lo que el alejamiento de dos poses le hizo
 * al ritmo. Vive acá porque necesita `PISTA_ANTES_DE_B13` y porque el invariante
 * está en su límite de 300 líneas.
 */
export function afirmarQueNadaSeAcelero(
  CON: readonly PerfilDeSegmento[],
  SIN: readonly PerfilDeSegmento[],
  picoCon: number,
  picoSin: number,
): void {
  /**
   * ⚠️ **B13 · EL ARRANQUE PASÓ A SER EL TRAMO MÁS RÁPIDO, Y NO PORQUE SE HAYA
   * ACELERADO.** V3-B afirmaba acá que no lo era. Alejar dos poses lo dejó
   * primero, y las dos mitades del porqué van juntas: **el hero BAJA** (viaja
   * menos hacia «quiénes somos») y **los otros se frenaron**. Ningún píxel se
   * mueve más rápido que antes de B13, y eso es lo que se afirma —con la pista de
   * antes al lado— en vez de un ranking.
   */
  const ANTES_DE_B13 = perfilDeSegmentos(PISTA_ANTES_DE_B13)
  const PICO_DE_ANTES = picoPorPantalla(ANTES_DE_B13)
  afirmar(
  SIN.every((s, i) => s.porPantalla <= ANTES_DE_B13[i].porPantalla + 1e-9),
  'B13 — NINGÚN tramo se aceleró: alejar la cámara sólo puede frenar el recorrido',
  SIN.map((s, i) => `${s.tramo} ${ANTES_DE_B13[i].porPantalla.toFixed(2)}→${s.porPantalla.toFixed(2)}`).join(' · '),
  )
  afirmar(
  Math.abs(SIN[0].porPantalla - picoSin) < 1e-9 && picoSin < PICO_DE_ANTES,
  '  el arranque queda como el tramo MÁS rápido, y el pico del recorrido BAJA',
  `pico ${PICO_DE_ANTES.toFixed(4)} ("${ANTES_DE_B13.find((s) => s.porPantalla === PICO_DE_ANTES)?.tramo}") → ${picoSin.toFixed(4)} ("${SIN.find((s) => s.porPantalla === picoSin)?.tramo}") · el segundo de hoy, ${[...SIN].sort((a, b) => b.porPantalla - a.porPantalla)[1].porPantalla.toFixed(4)}`,
  )
  controlPositivo(
  'el comparador no está ciego: con el sostén puesto, el arranque NO es el pico',
  CON,
  (perfil: typeof CON) => Math.abs(perfil[0].porPantalla - picoCon) < 1e-9,
  )

}
