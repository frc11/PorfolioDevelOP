import { Instrument_Serif } from 'next/font/google'

/** [C2-50] `?fuente-servicio=1` (por defecto): Instrument Serif en cursiva. Llega perezosa (`useFuentesDelServicio`). */
const fuente = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
