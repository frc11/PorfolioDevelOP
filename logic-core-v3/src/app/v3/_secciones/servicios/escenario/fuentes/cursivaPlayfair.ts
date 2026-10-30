import { Playfair_Display } from 'next/font/google'

/** [L3] `?titulo-cursiva=3`: Playfair Display en cursiva, el segundo renglón del título. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = Playfair_Display({ subsets: ['latin'], style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
