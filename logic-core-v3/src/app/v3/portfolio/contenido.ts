import type { PreguntaFrecuente } from '../_componentes/faq/preguntas'
import type { ProyectoDelPortfolio } from '../_secciones/trabajos/proyectos'

/**
 * [L7b] EL TEXTO DEL PORTFOLIO — genérico pero real. Los casos salen de `PROYECTOS` (`_secciones/trabajos/proyectos.ts`), los mismos
 * datos que la ficha del home; las demos, de `CATALOGO_DE_DEMOS`; los testimonios, de `RESENAS` (ficticias, D8 las reemplaza antes de producción).
 */
export const INTRO_DEL_PORTFOLIO = {
  bajada: 'Los sitios que ya hicimos, con lo que le pasaba a cada negocio y lo que hicimos para resolverlo.',
  etiqueta: 'De qué se trata',
  deQueSeTrata: 'Tres trabajos reales, explicados de principio a fin; después, las demos que armamos de ejemplo y lo que dicen quienes trabajaron con nosotros.',
} as const

export const CASOS = {
  titulo: 'Nuestros trabajos',
  bajada: 'Cada caso con su historia: el problema que tenía el negocio, qué hicimos y qué resolvimos.',
  visitar: 'Visitar sitio',
  visitarDe: (nombre: string): string => `Visitar sitio de ${nombre} (se abre en una pestaña nueva)`,
  altDelRecorrido: (alt: string): string => alt,
} as const

export const DEMOS = {
  titulo: 'Las demos',
  parrafos: [
    'Las demos son sitios de ejemplo que armamos nosotros para negocios ficticios. No son clientes: son una muestra de lo que somos capaces de hacer.',
    'Se adaptan a cualquier rubro. Si te gusta alguna, la hacemos tuya: cambiamos el contenido, los colores y las secciones para que sea de tu negocio.',
    'Para verlas, tocá una portada: se abre en una pestaña nueva y la podés recorrer como si fuera un sitio de verdad.',
  ],
  abreAparte: 'se abre en una pestaña nueva',
} as const

export const TESTIMONIOS = {
  titulo: 'Lo que dicen nuestros clientes',
  bajada: 'Opiniones de quienes ya trabajaron con nosotros.',
} as const

export const CTA_DEL_PORTFOLIO = {
  titulo: '¿Te gustaría ser el próximo?',
  texto: 'Contanos qué necesita tu negocio y armamos algo a su medida.',
  rotulo: 'Hablemos',
} as const

/** Un texto de un proyecto es real sólo si no es un marcador pendiente (`[TEXTO]`, `[TESTIMONIO] · pendiente`, `[NOMBRE]`). */
const esReal = (texto: string | null): texto is string => texto !== null && !texto.includes('[')

/**
 * Lo que de un proyecto se puede mostrar hoy: los campos pendientes pasan a `null` (la ficha no los muestra) y la reseña, que no existe
 * hasta que haya una real, también. Cuando llegue el dato real a `proyectos.ts`, aparece solo.
 */
export function proyectoMostrable(p: ProyectoDelPortfolio): ProyectoDelPortfolio {
  return {
    ...p,
    problemaResuelto: esReal(p.problemaResuelto) ? p.problemaResuelto : null,
    resultado: esReal(p.resultado) ? p.resultado : null,
    resena: p.resena !== null && esReal(p.resena.texto) && esReal(p.resena.autor) ? p.resena : null,
  }
}

export const PREGUNTAS_DEL_PORTFOLIO: readonly PreguntaFrecuente[] = [
  { pregunta: '¿Los trabajos que muestran son reales?', respuesta: 'Sí. Los tres casos son sitios que hicimos para negocios reales y podés visitarlos desde acá. Las demos, en cambio, son ejemplos que armamos para negocios ficticios.' },
  { pregunta: '¿Qué diferencia hay entre un trabajo y una demo?', respuesta: 'Un trabajo es un proyecto que hicimos para un cliente. Una demo es una muestra de lo que podemos hacer en un rubro, para que puedas ver cómo quedaría algo parecido para vos.' },
  { pregunta: '¿Pueden hacer algo parecido para mi rubro?', respuesta: 'Sí. Las demos se adaptan a cualquier rubro: partimos de lo que te gusta, y cambiamos contenido, colores y secciones para que sea de tu negocio.' },
  { pregunta: '¿Cómo sé si mi proyecto es para ustedes?', respuesta: 'Contanos qué necesitás. Si podemos ayudarte, te lo decimos y te hacemos una propuesta. Y si no te conviene, también te lo decimos de frente.' },
  { pregunta: '¿Qué resultados puedo esperar?', respuesta: 'No prometemos cifras que no podamos medir. Lo que sí te aseguramos es un trabajo cuidado, que se ve bien y funciona en el teléfono y en la computadora, y que resuelve el problema que nos planteaste.' },
  { pregunta: '¿Puedo ver cómo quedó un sitio antes de decidir?', respuesta: 'Sí. Cada caso tiene su botón para visitar el sitio real, y las demos se abren en una pestaña nueva para que las recorras tranquilo.' },
]
