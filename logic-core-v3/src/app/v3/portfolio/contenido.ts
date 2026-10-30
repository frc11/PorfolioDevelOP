import type { PreguntaFrecuente } from '../_componentes/faq/preguntas'
import type { ProyectoDelPortfolio, SlugDelProyecto } from '../_secciones/trabajos/proyectos'

/**
 * [L7b] EL TEXTO DEL PORTFOLIO — genérico pero real. Los casos salen de `PROYECTOS` (`_secciones/trabajos/proyectos.ts`), los mismos
 * datos que la ficha del home; las demos, de `CATALOGO_DE_DEMOS`; los testimonios, de `RESENAS` (ficticias, D8 las reemplaza antes de producción).
 */
export const INTRO_DEL_PORTFOLIO = {
  bajada: 'Los sitios que ya hicimos, con lo que le pasaba a cada negocio y lo que hicimos para resolverlo.',
  etiqueta: 'De qué se trata',
  deQueSeTrata: 'Trabajos reales, explicados de principio a fin; después, las demos que armamos de ejemplo y lo que dicen quienes trabajaron con nosotros.',
} as const

export const CASOS = {
  titulo: 'Nuestros trabajos',
  bajada: 'Cada caso con su historia: qué le pasaba al negocio y qué hicimos.',
  visitar: 'Visitar sitio',
  visitarDe: (nombre: string): string => `Visitar sitio de ${nombre} (se abre en una pestaña nueva)`,
  altDelRecorrido: (alt: string): string => alt,
} as const

/**
 * [M1] EL TEXTO DE CADA CASO — un título propio y un texto largo, escrito (no la ficha del home en ítems). Sale SÓLO de `PROYECTOS` (rubro,
 * qué hicimos, el problema, lo resuelto, lo que se ve en el recorrido) y del copy del home («se pensó desde cero para resolver un problema
 * real del cliente, con nuestro estándar de calidad»): sin cifras, sin clientes ni hechos nuevos. Valentino lo reescribe después.
 */
export const RELATOS: Readonly<Record<SlugDelProyecto, { readonly titulo: string; readonly parrafos: readonly string[] }>> = {
  'el-garage': {
    titulo: 'Un catálogo para que ningún auto se pierda',
    parrafos: [
      'El Garage es una concesionaria, y antes de la página no tenía un catálogo. Cada auto que entraba se publicaba en Facebook y, con el correr de las semanas, se perdía entre las publicaciones. Quien buscaba un auto puntual tenía que bajar entre publicaciones; para la concesionaria, cada ingreso nuevo tapaba al anterior.',
      'Lo que hicimos fue un catálogo de muchos filtros. Cada auto tiene su lugar y se busca con los filtros, en vez de bajar por un muro de publicaciones. En la portada aparecen los últimos ingresos, así lo nuevo se ve apenas llega, y todo lo demás queda a mano en el catálogo, tanto en el teléfono como en la computadora.',
      'Como todo lo que hacemos, se pensó desde cero para este negocio y para el problema que tenía, con nuestro estándar de calidad. Hoy, con la página, tienen todo ordenado: los autos dejaron de depender de una publicación que se hunde y pasaron a tener un lugar propio.',
    ],
  },
  'esquina-estudio': {
    titulo: 'Una página a la altura de su propia marca',
    parrafos: [
      'Esquina Estudio es un equipo de branding: su trabajo es darles identidad a otras marcas. Por eso su propia presencia tenía que estar a la altura, y no la tenían: el estudio no contaba con una presencia digital donde mostrar quiénes son y lo que hacen.',
      'Hicimos una página acorde a su estética y su marca. En la portada se presenta el estudio; después vienen sus proyectos, que es lo primero que alguien quiere ver antes de contratar a un equipo de branding, y sus servicios, para que quede claro qué pueden hacer por cada cliente.',
      'En un estudio que vive de la imagen, la página también es una muestra de su trabajo, así que cada detalle importa. Se pensó desde cero para resolver un problema real del cliente, con nuestro estándar de calidad, para que quien llegue a Esquina Estudio encuentre en un solo lugar quiénes son, qué hicieron y qué ofrecen.',
    ],
  },
  'banu-scents': {
    titulo: 'Simple, bonita y con el perfume adelante',
    parrafos: [
      'Banú Scents vende perfumes árabes. Igual que le pasaba a Esquina Estudio, no tenía presencia digital: no había un lugar propio donde mostrar lo que ofrece y donde alguien que los conoce pudiera volver a encontrarlos.',
      'Hicimos una página simple pero bonita. Simple, porque quien entra quiere ver perfumes y no perderse en menús; bonita, porque un perfume también se elige por cómo se presenta. La portada abre con la marca, sigue con la selección de casas y termina en los perfumes, en ese orden, sin vueltas. Cada perfume se muestra como lo que es: algo que se elige con los ojos antes de probarlo.',
      'Se pensó desde cero para este negocio, con nuestro estándar de calidad, y se ve tan bien en el teléfono como en la computadora. Hoy Banú Scents tiene su propio lugar en internet para mostrar sus perfumes, con su estética y en un lugar que es suyo, no prestado.',
    ],
  },
}

/**
 * [M1] EL COLOR DE CADA MARCA SOBRE EL PAPEL — los tokens de marca (`--color-marca-*`) están medidos sobre la noche, y los casos ahora van
 * de día: sobre el papel (#F7F7F5) el blanco de Esquina no se ve y el naranja de El Garage da 2,10:1. Las mismas marcas, pasadas a AA
 * sobre el papel: el naranja de El Garage oscurecido en su tono (5,38:1), el marrón original de Banú (#654324, el de su póster: 8,22:1) y,
 * para Esquina, cuya marca es blanco sobre negro, la tinta (17,6:1).
 */
export const MARCA_SOBRE_EL_PAPEL: Readonly<Record<SlugDelProyecto, string | null>> = {
  'el-garage': '#9A5400',
  // `null`: la tinta de la página, sin pisar la variable (pisarla con ella misma la dejaba inválida y el relleno del rollover, transparente).
  'esquina-estudio': null,
  'banu-scents': '#654324',
}

/**
 * [M1] Las demos: un solo texto corrido (Valentino: «no quiero eso [los tres pasos], quiero un texto nomás hablando de qué son»). Lo que
 * dicen el catálogo y la bajada del home: sitios de ejemplo para negocios ficticios, una muestra, adaptables a cualquier rubro, la hacemos tuya.
 */
export const DEMOS = {
  titulo: 'Las demos',
  texto:
    'Las demos son sitios de ejemplo que armamos nosotros para negocios que no existen: un hotel, un restaurante, una inmobiliaria, una agencia y una perfumería. No son clientes; son una muestra de lo que somos capaces de hacer. Cada una está pensada para un rubro, pero se adaptan a cualquiera: si te gusta alguna, la tomamos de base y la hacemos tuya, con tu contenido, tus colores y las secciones que tu negocio necesita. Tocá una portada para abrirla y recorrela como si fuera un sitio de verdad.',
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
  { pregunta: '¿Los trabajos que muestran son reales?', respuesta: 'Sí. Los casos son sitios que hicimos para negocios reales y podés visitarlos desde acá. Las demos, en cambio, son ejemplos que armamos para negocios ficticios.' },
  { pregunta: '¿Qué diferencia hay entre un trabajo y una demo?', respuesta: 'Un trabajo es un proyecto que hicimos para un cliente. Una demo es una muestra de lo que podemos hacer en un rubro, para que puedas ver cómo quedaría algo parecido para vos.' },
  { pregunta: '¿Pueden hacer algo parecido para mi rubro?', respuesta: 'Sí. Las demos se adaptan a cualquier rubro: partimos de lo que te gusta, y cambiamos contenido, colores y secciones para que sea de tu negocio.' },
  { pregunta: '¿Cómo sé si mi proyecto es para ustedes?', respuesta: 'Contanos qué necesitás. Si podemos ayudarte, te lo decimos y te hacemos una propuesta. Y si no te conviene, también te lo decimos de frente.' },
  { pregunta: '¿Qué resultados puedo esperar?', respuesta: 'No prometemos cifras que no podamos medir. Lo que sí te aseguramos es un trabajo cuidado, que se ve bien y funciona en el teléfono y en la computadora, y que resuelve el problema que nos planteaste.' },
  { pregunta: '¿Puedo ver cómo quedó un sitio antes de decidir?', respuesta: 'Sí. Cada caso tiene su botón para visitar el sitio real, y las demos se abren en una pestaña nueva para que las recorras tranquilo.' },
]
