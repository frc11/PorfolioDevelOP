import type { ProactivePromptsMap } from '../shared/types'

/**
 * Preguntas proactivas POR SECCIÓN del bot develOP público (slug 'develop').
 *
 * FUENTE ÚNICA DE VERDAD. Se persiste en `BotConfig.proactivePrompts` y la leen:
 *   - el FRONT (`pickPromptForPath`) para MOSTRAR una al azar según `currentPath`, y
 *   - el SERVER (`collectProactivePrompts` en `handleChatRequest`) para VALIDAR el
 *     `proactiveOpener` por match EXACTO antes de inyectarlo al system prompt.
 *
 * Ambos lados leen el MISMO campo, así que la consistencia front↔server es
 * estructural: cualquier pregunta que el teaser pueda mostrar es, por
 * construcción, miembro del set validado server-side → el match exacto siempre da.
 * Si agregás/editás una pregunta acá, queda automáticamente validada.
 * NO hardcodear preguntas en el front: rompería esa garantía de seguridad
 * (el opener forjado se descartaría y se perdería el contexto).
 *
 * Las keys son rutas que deben coincidir EXACTO con `usePathname()` (sin trailing
 * slash). `default` es el fallback para rutas no listadas.
 */
export const DEVELOP_PROACTIVE_PROMPTS: ProactivePromptsMap = {
  '/': [
    '¿Cuál es el principal desafío de tu negocio hoy?',
    '¿Qué te gustaría resolver o automatizar este año?',
    'Contame qué buscás y vemos por dónde arrancar.',
  ],
  '/web-development': [
    '¿Tenés idea de cómo una página web podría traerte más clientes?',
    'Si alguien te busca en Google ahora mismo, ¿te encuentra?',
    '¿Tu web actual trabaja para vos o solo está ahí?',
  ],
  '/ai-implementations': [
    '¿Qué tarea repetitiva le come horas a tu equipo cada semana?',
    '¿Te imaginás un asistente con IA respondiendo por vos 24/7?',
    '¿Querés ver si la IA aplica a tu operación concreta?',
  ],
  '/software-development': [
    '¿Usás varias herramientas sueltas que no se hablan entre sí?',
    '¿Hay un proceso clave que depende de que alguien esté disponible?',
    '¿Y si tuvieras un sistema a medida para tu forma de trabajar?',
  ],
  '/process-automation': [
    '¿Qué tarea se repite en tu empresa más de 10 veces por semana?',
    '¿Cuántas horas ganarías si eso se hiciera solo?',
    'Un flujo bien armado trabaja aunque nadie esté mirando.',
  ],
  '/contact': [
    '¿Tenés en mente qué necesitás? Charlemos antes del formulario.',
    '¿Alguna duda antes de escribirnos?',
    'Si querés, adelantamos la conversación por acá.',
  ],
  default: [
    '¿Cuál es el principal desafío de tu negocio hoy?',
    '¿Qué estarías mejorando si tuvieras más tiempo?',
    'Contame sobre tu operación, sin apuro.',
  ],
}
