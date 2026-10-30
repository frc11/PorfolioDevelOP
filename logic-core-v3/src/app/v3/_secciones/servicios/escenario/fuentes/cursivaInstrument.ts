import { Instrument_Serif } from 'next/font/google'

/** [L3] `?titulo-cursiva=1`: Instrument Serif en cursiva, el segundo renglón del título. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
