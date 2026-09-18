/**
 * COMPROBACIONES DE S10 · las celdas de la envolvente de rendijas.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-fondo.invariant.ts
 *
 * La geometría cuadrada de la celda —horizontal y vertical coinciden en las dos
 * capas— y la aritmética del desajuste entre la trama fina y la gruesa.
 *
 * ⚠️ **Modo pulido sacó el despeje de cámara y los bordes de banda en cuadro**:
 * eran composición.
 *
 * Las otras dos suites de la envolvente: `s10-batido.invariant.ts` (qué produce
 * el desajuste y el aliasing) y `s10-tramas.invariant.ts` (las texturas y el
 * orden de dibujo).
 */
import {
  MOIRE_COARSE_CELLS,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_MISMATCH,
  MOIRE_MISMATCH_MAX,
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  fineCells,
  verticalPitch,
  verticalRepeat,
} from '@/app/v3/_lib/escena/probeMoire'
import { check, report, section } from './harness'

const FINE_CELLS = fineCells(MOIRE_MISMATCH)

// ── 2 · Las celdas y el desajuste ───────────────────────────────────────────

section('Las celdas: cuadradas en su superficie y cuadradas en ángulo')

{
  for (const [label, radius, cells, bottom, top] of [
    ['gruesa', MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS, MOIRE_FAR_BOTTOM, MOIRE_FAR_TOP],
    ['fina', MOIRE_NEAR_RADIUS, FINE_CELLS, MOIRE_NEAR_BOTTOM, MOIRE_NEAR_TOP],
  ] as const) {
    const horizontal = (2 * Math.PI * radius) / cells
    const vertical = verticalPitch(radius, cells)
    check(
      `${label}: la celda es cuadrada sobre la superficie`,
      Math.abs(horizontal - vertical) < 1e-9,
      `${horizontal.toFixed(3)} × ${vertical.toFixed(3)} de mundo · ${(360 / cells).toFixed(3)}° de ángulo · ${verticalRepeat(radius, cells, top - bottom).toFixed(2)} filas en la banda`
    )
  }

  /** La MISMA `verticalPitch`, con un conteo de celdas que no le corresponde al
   *  radio: si la celda siguiera saliendo cuadrada, la función no estaría
   *  mirando ninguno de sus dos argumentos. */
  const torcida = Math.abs(
    (2 * Math.PI * MOIRE_FAR_RADIUS) / MOIRE_COARSE_CELLS -
      verticalPitch(MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS + 7)
  )
  check(
    'control positivo — con siete celdas de más la celda YA NO es cuadrada',
    torcida > 1e-9,
    `${torcida.toFixed(4)} de mundo de diferencia contra una tolerancia de 1e-9`
  )

  check(
    'la trama fina es el doble de la gruesa MÁS el desajuste',
    FINE_CELLS === 2 * MOIRE_COARSE_CELLS + MOIRE_MISMATCH,
    `${FINE_CELLS} = 2 × ${MOIRE_COARSE_CELLS} + ${MOIRE_MISMATCH}`
  )
  check(
    'control positivo — la MISMA cuenta con otro desajuste da otro número de celdas',
    fineCells(MOIRE_MISMATCH + 3) === FINE_CELLS + 3 && fineCells(MOIRE_MISMATCH + 3) !== FINE_CELLS,
    `${fineCells(MOIRE_MISMATCH + 3)} contra ${FINE_CELLS} — \`fineCells\` lee su argumento, no devuelve una constante`
  )
  const ratio = FINE_CELLS / MOIRE_COARSE_CELLS
  check(
    'y el cociente de textura queda apenas corrido de 2',
    ratio > 2 && ratio < 2.3,
    `${ratio.toFixed(4)} — la lectura "cuatro cuadraditos en un cuadrado" se conserva`
  )
  check(
    'las dos cuentas son enteras: el mosaico cierra alrededor del cilindro',
    Number.isInteger(FINE_CELLS) && Number.isInteger(MOIRE_COARSE_CELLS),
    'si no cerraran habría una costura vertical en el punto de empalme'
  )
  check(
    'el slider llega hasta 0, que es donde el batido de TEXTURA desaparece',
    MOIRE_MISMATCH >= 0 && MOIRE_MISMATCH <= MOIRE_MISMATCH_MAX,
    `default ${MOIRE_MISMATCH}, rango 0..${MOIRE_MISMATCH_MAX}`
  )
}

report('s10 · dónde está la envolvente')
