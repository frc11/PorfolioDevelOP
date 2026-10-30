import { Fraunces } from 'next/font/google'

/** [L3] `?titulo-cursiva=2`: Fraunces en cursiva, el segundo renglón del título. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = Fraunces({ subsets: ['latin'], style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
