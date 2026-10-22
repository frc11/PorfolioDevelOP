import type { PreguntaFrecuente } from '../_componentes/faq/preguntas'

/**
 * [B10] LAS PREGUNTAS FRECUENTES DE LA PÁGINA BASE — como si fuera la de Páginas web (la maqueta que se traspasa a servicios: cada página
 * pone las suyas acá, en su carpeta). Provisorias: las redactó CC en B10 (genéricas, sin cifras) y Valentino las cambia después.
 */
// TODO(B10): Valentino revisa y cambia estas seis; cada página de servicio trae las suyas.
export const PREGUNTAS_DE_LA_BASE: readonly PreguntaFrecuente[] = [
  {
    pregunta: '¿Qué incluye una página web?',
    respuesta: 'El diseño, el desarrollo y los textos ordenados para que se entienda qué hacés, con una página que se ve bien en el teléfono y en la computadora. Lo que entra exactamente queda escrito en la propuesta.',
  },
  {
    pregunta: '¿Se va a ver bien en el celular?',
    respuesta: 'Sí. Cada sección se piensa para el teléfono, la tablet y la computadora: no es la versión de escritorio apretada.',
  },
  {
    pregunta: '¿Voy a poder cambiar los textos y las fotos?',
    respuesta: 'Si lo necesitás, sí: lo definimos al principio y la armamos para que puedas editar lo que cambia seguido sin depender de nosotros.',
  },
  {
    pregunta: '¿Cuánto tarda una página web?',
    respuesta: 'Depende de cuántas secciones tenga y de cuándo estén los contenidos. Los tiempos van en la propuesta, por etapas, y vas viendo el avance mientras se construye.',
  },
  {
    pregunta: '¿Me ayudan con el dominio y la publicación?',
    respuesta: 'Sí. Te acompañamos a elegir el dominio y dejamos la página publicada y funcionando antes de darla por terminada.',
  },
  {
    pregunta: '¿Qué pasa si después quiero sumar algo?',
    respuesta: 'Se suma. La página se arma para poder crecer: una sección nueva, otra página o una integración se conversan y se presupuestan como el resto.',
  },
]
