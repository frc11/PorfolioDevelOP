import { Playfair_Display } from 'next/font/google'

/** [C2-50] `?fuente-servicio=4`: Playfair Display en cursiva. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = Playfair_Display({ subsets: ['latin'], style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
