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
