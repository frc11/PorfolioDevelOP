export const MESSAGE_CONTEXTS: Record<string, string> = {
  activacion:
    'Hola! Quería consultarles sobre el estado de la activación de mis conexiones (Analytics, Search Console, etc.). ¿Cuándo estarían listas?',
  
  modulo: 
    'Hola! Me interesa activar el módulo {moduleName}. ¿Pueden darme más info y los próximos pasos?',
  
  facturacion:
    'Hola! Tengo una consulta sobre mi facturación / plan actual. ¿Pueden ayudarme?',
  
  bug:
    'Hola! Encontré algo que no funciona en el panel. Les paso los detalles:\n\n[describir el problema acá]',
  
  mejora:
    'Hola! Tengo una idea/sugerencia para el panel:\n\n[contar la idea acá]',

  proyecto:
    'Hola! Quería consultarles sobre el estado de mi proyecto. ¿Pueden actualizarme?',

  // MS-3 — pre-fill cuando el cliente llega desde el CTA dorado del dashboard
  // de planes. El lead ya quedó registrado en `requestUpsellAction` ANTES del
  // redirect; este mensaje es para que el cliente no escriba de cero si decide
  // mandar el mensaje también.
  'plan-upgrade-pro':
    'Hola! Quería subir mi asistente al plan Pro. ¿Cuándo lo coordinamos y cuáles serían los próximos pasos?',

  'plan-upgrade-business':
    'Hola! Quería subir mi asistente al plan Business. ¿Cuándo lo coordinamos y cuáles serían los próximos pasos?',

  'plan-upgrade-starter':
    'Hola! Quería ajustar mi plan al Starter. ¿Lo vemos juntos?',

  // Downgrade / cambio lateral (CTA gris "Hablar con mi equipo" de PlansShowcase).
  // NO dispara `requestUpsellAction` — no es upsell, solo pre-fill de mensaje.
  'plan-change-pro':
    'Hola! Quería revisar el cambio de mi plan al Pro. ¿Lo vemos juntos?',

  'plan-change-business':
    'Hola! Quería revisar el cambio de mi plan al Business. ¿Lo vemos juntos?',

  'plan-change-starter':
    'Hola! Quería revisar el cambio de mi plan al Starter. ¿Lo vemos juntos?',

  default:
    '',
}

export function getMessageForContext(context: string | null, params?: Record<string, string>): string {
  if (!context) return ''
  let template = MESSAGE_CONTEXTS[context] ?? ''
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      template = template.replace(`{${key}}`, value)
    }
  }
  return template
}
