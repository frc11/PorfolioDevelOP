/**
 * COMPROBACIONES DE S10 · la caja de tinta del logo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-escena.invariant.ts
 *
 * El instrumento de tinta, contra una medición independiente.
 *
 * ⚠️ **Modo pulido sacó el balance de negro entre poses y el crecimiento de la
 * sombra/banda a lo largo del arco**: eran composición.
 *
 * Las partículas —conteo, conchas y el recorte de `gl_PointSize`— están en
 * `s10-particulas.invariant.ts`.
 */
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'

import { check, report, section } from './harness'
import { INK_HEIGHT, INK_WIDTH, mask } from './frameProbe'

// ── 1 · El instrumento ──────────────────────────────────────────────────────

section('La tinta del logo, contra una medición independiente')

check(
  'el aplanado del path reproduce la caja de tinta que S8b midió por otro camino',
  Math.abs(mask.x - LOGO_INK_VIEWBOX.x) < 1e-3 &&
    Math.abs(mask.y - LOGO_INK_VIEWBOX.y) < 1e-3 &&
    Math.abs(mask.width - LOGO_INK_VIEWBOX.width) < 1e-3 &&
    Math.abs(mask.height - LOGO_INK_VIEWBOX.height) < 1e-3,
  `${mask.x.toFixed(3)} ${mask.y.toFixed(3)} ${mask.width.toFixed(3)} ${mask.height.toFixed(3)} contra ${LOGO_INK_VIEWBOX.x} ${LOGO_INK_VIEWBOX.y} ${LOGO_INK_VIEWBOX.width} ${LOGO_INK_VIEWBOX.height}`
)
check(
  'la marca llena menos de la mitad de su propia caja',
  mask.fill > 0.4 && mask.fill < 0.45,
  `${(mask.fill * 100).toFixed(2)}% — medir con la caja en vez de con la tinta daría 2,3 veces de más`
)
check(
  'y la caja en mundo es la del mesh extruido, menos el bisel',
  Math.abs(INK_WIDTH - 6.849) < 0.01 && Math.abs(INK_HEIGHT - 4.765) < 0.01,
  `${INK_WIDTH.toFixed(3)} × ${INK_HEIGHT.toFixed(3)} · con bisel el mesh mide 6,863 × 4,779`
)

/**
 * ⚠️ **LOS CONTROLES POSITIVOS DE ESTE ARCHIVO (SITIO-S10).** El invariante corría
 * ocho afirmaciones **sin una sola entrada equivocada**. Las dos de acá atacan la
 * pieza de la que cuelga todo lo demás: la comparación de la caja de tinta con
 * una tolerancia de 1e-3, que sale en verde igual si el comparador estuviera
 * devolviendo siempre `true`.
 */
type Caja = { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
const cajaIgual = (a: Caja, b: Caja): boolean =>
  Math.abs(a.x - b.x) < 1e-3 &&
  Math.abs(a.y - b.y) < 1e-3 &&
  Math.abs(a.width - b.width) < 1e-3 &&
  Math.abs(a.height - b.height) < 1e-3
check(
  'control positivo — el mismo comparador VE una caja corrida una milésima por encima de su tolerancia',
  !cajaIgual(LOGO_INK_VIEWBOX, { ...LOGO_INK_VIEWBOX, width: LOGO_INK_VIEWBOX.width + 0.002 }),
  'la tolerancia es 1e-3: 0,002 de ancho tiene que hacerlo fallar'
)
check(
  'control positivo — y el relleno de la marca NO da lo mismo medido contra su caja',
  !(mask.fill > 0.99),
  `${(mask.fill * 100).toFixed(2)}% — el 100% sería el síntoma de estar midiendo la caja y no la tinta`
)

report('s10 · la escena vaciada')
