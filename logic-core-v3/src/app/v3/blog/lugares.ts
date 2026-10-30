import type { NivelDeTitular } from '../_componentes/tipografia/Titular'

/** [M2] Los lugares de las tarjetas de `NotasEnDesorden` (la tabla escrita a mano): `m2-blog` prueba su dispersión. Clases escritas enteras para el escáner. */
export interface Lugar {
  /** Columna y ancho desde 1024, y el corrimiento hacia abajo. */
  readonly escritorio: string
  /** Ancho y costado abajo de 1024. */
  readonly angosto: string
  /** La proporción del marco. */
  readonly forma: string
  readonly nivel: NivelDeTitular
  /** El ancho de la foto en el cuadro, desde 1024 (%), para `sizes`. */
  readonly vw: number
}

export const LUGARES: readonly Lugar[] = [
  { escritorio: 'escritorio:col-start-1 escritorio:col-span-6', angosto: 'w-[92%] self-start', forma: 'aspect-[4/3]', nivel: 'titulo-m', vw: 50 },
  { escritorio: 'escritorio:col-start-8 escritorio:col-span-5 escritorio:mt-[12svh]', angosto: 'w-[78%] self-end', forma: 'aspect-[4/5]', nivel: 'titulo-s', vw: 42 },
  { escritorio: 'escritorio:col-start-2 escritorio:col-span-4 escritorio:mt-[8svh]', angosto: 'w-[84%] self-start', forma: 'aspect-[1/1]', nivel: 'titulo-s', vw: 34 },
  { escritorio: 'escritorio:col-start-7 escritorio:col-span-6 escritorio:mt-[18svh]', angosto: 'w-[92%] self-end', forma: 'aspect-[3/2]', nivel: 'titulo-m', vw: 50 },
  { escritorio: 'escritorio:col-start-1 escritorio:col-span-5 escritorio:mt-[6svh]', angosto: 'w-[80%] self-start', forma: 'aspect-[4/5]', nivel: 'titulo-s', vw: 42 },
  { escritorio: 'escritorio:col-start-8 escritorio:col-span-4 escritorio:mt-[20svh]', angosto: 'w-[86%] self-end', forma: 'aspect-[1/1]', nivel: 'titulo-s', vw: 34 },
]
