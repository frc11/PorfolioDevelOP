import { NOTA as AUTOMATIZAR } from './cinco-tareas-para-automatizar'
import { NOTA as CHATBOT } from './chatbot-con-ia-para-pymes'
import { NOTA as COSTO } from './cuanto-cuesta-una-pagina-web'
import { NOTA as INSTAGRAM } from './necesito-pagina-web-o-instagram'
import { NOTA as LENTA } from './pagina-que-tarda-en-cargar'
import { NOTA as PLANILLAS } from './software-a-medida-vs-planillas'
import type { Nota } from './tipos'

/** [L7c] Las seis notas iniciales, en el orden de Valentino: las tres primeras son las destacadas del carrusel. */
export const NOTAS: readonly Nota[] = [INSTAGRAM, CHATBOT, COSTO, AUTOMATIZAR, LENTA, PLANILLAS]

export const CANTIDAD_DE_DESTACADAS = 3
export const NOTAS_DESTACADAS: readonly Nota[] = NOTAS.slice(0, CANTIDAD_DE_DESTACADAS)

export const notaPorSlug = (slug: string): Nota | undefined => NOTAS.find((n) => n.slug === slug)

/** La ruta de una nota. */
export const rutaDeLaNota = (n: Nota): string => `/v3/blog/${n.slug}`

/** Las palabras que tiene una nota (para el tiempo de lectura). */
export function palabrasDeLaNota(n: Nota): number {
  const textos = [...n.introduccion, ...n.secciones.flatMap((s) => [s.subtitulo, ...s.parrafos]), n.cierre]
  return textos.join(' ').split(/\s+/).filter(Boolean).length
}

const PALABRAS_POR_MINUTO = 200

/** El tiempo de lectura, en minutos (al menos 1). */
export const minutosDeLectura = (n: Nota): number => Math.max(1, Math.round(palabrasDeLaNota(n) / PALABRAS_POR_MINUTO))

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const

/** «22 de octubre de 2026», sin depender de la zona horaria ni del locale del servidor. */
export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} de ${MESES[(m ?? 1) - 1]} de ${a}`
}

/** Las notas relacionadas: las demás, empezando por las más cercanas en el orden (hasta `cuantas`). */
export function notasRelacionadas(n: Nota, cuantas = 3): readonly Nota[] {
  const i = NOTAS.findIndex((x) => x.slug === n.slug)
  const resto = NOTAS.filter((x) => x.slug !== n.slug)
  return [...resto.slice(i), ...resto.slice(0, i)].slice(0, cuantas)
}
