import { DM_Serif_Display } from 'next/font/google'

/** [C2-50] `?titulo-servicio=2`: la serif display grande. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = DM_Serif_Display({ subsets: ['latin'], weight: '400', display: 'swap', preload: false })
export const CLASE = fuente.className
