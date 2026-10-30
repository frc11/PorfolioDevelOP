/**
 * [L7e] Las seis notas iniciales del blog (los títulos, de `ESTRUCTURA-PAGINAS.md`, tal cual) con una bajada de prototipo: genérica, sin
 * cifras ni promesas que develOP no haya dicho. Las tres primeras son las destacadas del carrusel. Las lee el carrusel (B1), las notas
 * irregulares (B2) y la nota (L1).
 */
export interface NotaDelBlog {
  readonly id: string
  readonly titulo: string
  readonly bajada: string
}

export const NOTAS: readonly NotaDelBlog[] = [
  {
    id: 'pagina-o-instagram',
    titulo: '¿Necesito página web o me alcanza con Instagram?',
    bajada: 'Qué te da cada una, qué no, y cómo saber cuál le sirve hoy a tu negocio.',
  },
  {
    id: 'chatbot-con-ia',
    titulo: 'Qué es un chatbot con IA y cuándo le conviene a una pyme',
    bajada: 'Cómo funciona, qué puede contestar por vos y en qué casos no hace falta.',
  },
  {
    id: 'cuanto-cuesta-una-pagina',
    titulo: 'Cuánto cuesta una página web en Argentina y de qué depende',
    bajada: 'Las cosas que mueven el precio, explicadas sin vueltas.',
  },
  {
    id: 'tareas-para-automatizar',
    titulo: '5 tareas que tu negocio puede automatizar hoy',
    bajada: 'Mensajes, recordatorios y cargas que se pueden hacer solos.',
  },
  {
    id: 'pagina-lenta',
    titulo: 'Por qué tu página tarda en cargar y cuánto te cuesta',
    bajada: 'Qué la hace lenta y por qué la gente se va antes de verla.',
  },
  {
    id: 'software-o-planillas',
    titulo: 'Software a medida vs. planillas: cuándo dar el salto',
    bajada: 'Las señales de que la planilla ya no te alcanza.',
  },
]

export const DESTACADAS = NOTAS.slice(0, 3)
