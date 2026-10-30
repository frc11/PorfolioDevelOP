import { Playfair_Display } from 'next/font/google'

/** [L3 · L7a] `?titulo-cursiva=3` (por defecto): Playfair Display en cursiva, el segundo renglón del título. Llega perezosa (`useFuentesDelServicio`). */
const fuente = Playfair_Display({ subsets: ['latin'], style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
