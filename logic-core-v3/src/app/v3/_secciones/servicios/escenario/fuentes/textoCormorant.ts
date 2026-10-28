import { Cormorant_Garamond } from 'next/font/google'

/** [C2-50] `?fuente-servicio=3`: Cormorant Garamond en cursiva. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = Cormorant_Garamond({ subsets: ['latin'], weight: '500', style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
