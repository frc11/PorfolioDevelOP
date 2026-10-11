/** [PULIDO 14] L3 · las variantes de los destellos de energía (`?destellos=`): qué es cada una, en `destellos.ts`. */
export const VARIANTES_DE_DESTELLOS = ['chispas', 'agujero', 'infinito', 'estallido', 'galaxia', 'lente'] as const
export type VarianteDeDestellos = (typeof VARIANTES_DE_DESTELLOS)[number]
