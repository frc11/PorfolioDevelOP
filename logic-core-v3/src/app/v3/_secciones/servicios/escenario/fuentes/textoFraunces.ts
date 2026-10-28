import { Fraunces } from 'next/font/google'

/** [C2-50] `?fuente-servicio=2`: Fraunces en cursiva. Llega perezosa, sólo con la bandera (`useFuentesDelServicio`). */
const fuente = Fraunces({ subsets: ['latin'], style: 'italic', display: 'swap', preload: false })
export const CLASE = fuente.className
