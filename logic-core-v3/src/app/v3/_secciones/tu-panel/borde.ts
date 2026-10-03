'use client'

import { useSyncExternalStore } from 'react'

import { entornoDeLaEscena } from '../../_lib/escena/entorno'

/**
 * [RETOQUE PANEL] T1 · LOS BORDES DEL PANEL, FUNDIDOS CON LA SECCIÓN — sin esquinas ni recuadro: detrás de la demo, una
 * pieza del color del panel que se le extiende `--sangrado` por cada lado y se pierde en el papel. Dos maneras:
 *   · `a` · degradé: la extensión se apaga en línea recta (una máscara), un rectángulo de bordes blandos. LA ELEGIDA: el
 *     panel se pierde en el papel; el halo se leía como una sombra arrojada, con una línea donde termina el panel;
 *   · `b` · halo: una sombra del color del panel, que se apaga en curva y redondea las esquinas (con el borde del panel
 *     entero: el ensanche es igual al desenfoque).
 * La prueba `?pruebas=panelborde=a|b` elige una; sin ella, la elegida (`BORDE_ELEGIDO`). El título que va abajo de su demo
 * arranca donde termina el degradé (`--sangrado` más el aire de siempre). El sangrado no pasa del aire
 * lateral de la sección (una sombra no se cuenta): nada se sale del cuadro de costado. Ninguna de las dos toca la demo (no la tapa ni la recorta).
 */
export type BordeDelPanel = 'a' | 'b'

export const BORDE_ELEGIDO: BordeDelPanel = 'a'

export const CLASE_DEL_BORDE: Readonly<Record<BordeDelPanel, string>> = {
  a: '-inset-[var(--sangrado)] bg-[var(--fondo-del-panel)] [mask-image:linear-gradient(to_right,transparent,black_var(--sangrado),black_calc(100%-var(--sangrado)),transparent),linear-gradient(to_bottom,transparent,black_var(--sangrado),black_calc(100%-var(--sangrado)),transparent)] [mask-composite:intersect]',
  b: 'inset-0 shadow-[0_0_var(--sangrado)_var(--sangrado)_var(--fondo-del-panel)]',
}

const sinCambios = (): (() => void) => () => undefined

/** La del pedido (`?pruebas=panelborde=`) o la elegida; en el servidor y en el primer render, la elegida. */
export function useBordeDelPanel(): BordeDelPanel {
  return useSyncExternalStore(
    sinCambios,
    () => {
      const pedida = entornoDeLaEscena().pruebas.panelBorde
      return pedida === 'no' ? BORDE_ELEGIDO : pedida
    },
    () => BORDE_ELEGIDO,
  )
}
