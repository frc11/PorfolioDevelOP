import type { PreguntaFrecuente } from '../../_componentes/faq/preguntas'

/**
 * [B10] LAS PREGUNTAS FRECUENTES DEL HOME — sobre develOP en general. Provisorias: las redactó CC en B10 (genéricas, sin cifras ni
 * promesas que no estén en el sitio) y Valentino las cambia después. Lo que dicen sale de lo que el home ya cuenta: los tres servicios, el
 * contacto que empieza con una charla, el precio «desde» de cada servicio y el panel del cliente.
 */
// TODO(B10): Valentino revisa y cambia estas seis.
export const PREGUNTAS_DEL_HOME: readonly PreguntaFrecuente[] = [
  {
    pregunta: '¿Qué hace develOP?',
    respuesta: 'Diseñamos y construimos páginas web, software a medida y soluciones con inteligencia artificial y automatización para negocios. Somos un equipo chico de Tucumán: hablás con quienes hacen el trabajo.',
  },
  {
    pregunta: '¿Cómo empezamos a trabajar juntos?',
    respuesta: 'Con una charla. Nos contás qué necesitás, te hacemos las preguntas que hagan falta y te mandamos una propuesta con el alcance, los tiempos y el precio. Arrancamos cuando estás de acuerdo con eso.',
  },
  {
    pregunta: '¿Cuánto cuesta un proyecto?',
    respuesta: 'Depende de lo que haya que construir. Cada servicio tiene su precio de referencia en su página, y la propuesta te dice el número exacto antes de empezar: sin sorpresas a mitad de camino.',
  },
  {
    pregunta: '¿Cuánto tarda?',
    respuesta: 'Depende del alcance. Los tiempos quedan escritos en la propuesta, por etapas, y mientras construimos vas viendo el avance.',
  },
  {
    pregunta: '¿Qué pasa después de la entrega?',
    respuesta: 'Seguimos cerca. Tenés tu panel para ver el estado de lo que hicimos, escribirnos y pedir cambios, y lo que se suma después se conversa igual que al principio.',
  },
  {
    pregunta: '¿Necesito tener todo definido para escribirles?',
    respuesta: 'No. Con que tengas el problema o la idea alcanza: ordenar lo que hace falta es parte del trabajo.',
  },
]
