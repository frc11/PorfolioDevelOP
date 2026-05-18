import type { Industry } from '../../../server/admin/createClientWithBot'

export const BOT_NAME_SUGGESTIONS: Partial<Record<Industry, string[]>> & { generico: string[] } = {
  legal: ['Asistente Legal', 'Lex', 'Justi'],
  contable: ['Asistente Contable', 'Conta', 'Números'],
  medico_odontologico: ['Asistente Médico', 'Saluda', 'Sonrisa'],
  gimnasio: ['Asistente Fitness', 'Coach', 'Activa'],
  restaurant: ['Asistente Reservas', 'Sabor', 'Mesa'],
  inmobiliaria: ['Asistente Inmobiliario', 'Hogar', 'Llave'],
  concesionaria: ['Asistente Comercial', 'Marcus', 'Drive'],
  distribuidora: ['Asistente Mayorista', 'Stock', 'Pronto'],
  constructora: ['Asistente Obras', 'Construye', 'Proyecto'],
  generico: ['Asistente Virtual', 'Helper', 'Guía'],
}

export const WELCOME_SUGGESTIONS: Partial<Record<Industry, string[]>> = {
  legal: [
    '¡Hola! Soy el asistente del estudio. Te puedo ayudar con consultas legales, agendar reuniones o derivarte con un abogado. ¿Qué necesitás?',
    'Bienvenido al estudio. ¿En qué te puedo ayudar hoy? Puedo coordinar consultas o resolver tus dudas iniciales.',
  ],
  contable: [
    '¡Hola! Soy el asistente del estudio contable. Puedo ayudarte con consultas sobre impuestos, monotributo, facturación o agendar una reunión con el contador.',
  ],
  medico_odontologico: [
    '¡Hola! Soy el asistente de la clínica. Te ayudo a agendar turnos, responder consultas sobre tratamientos o coordinar con el profesional. ¿En qué te ayudo?',
  ],
  gimnasio: [
    '¡Hola! Soy el asistente del gimnasio. Puedo darte info sobre planes, horarios de clases o coordinar una clase de prueba. ¿Qué necesitás?',
  ],
  restaurant: [
    '¡Hola! Soy el asistente del restaurante. Te puedo mostrar nuestro menú, ayudarte a reservar una mesa o contarte sobre nuestras promos. ¿Qué querés saber?',
  ],
  inmobiliaria: [
    '¡Hola! Soy el asistente de la inmobiliaria. Te puedo mostrar propiedades disponibles, coordinar visitas o resolver tus dudas. ¿Buscás alquilar o comprar?',
  ],
  concesionaria: [
    '¡Hola! Soy el asistente de la concesionaria. Te puedo mostrar vehículos disponibles, coordinar un test drive o pasar info sobre financiación. ¿Qué buscás?',
  ],
  distribuidora: [
    '¡Hola! Soy el asistente de la distribuidora. Puedo ayudarte con lista de precios, disponibilidad de productos o coordinar un pedido. ¿Qué necesitás?',
  ],
  constructora: [
    '¡Hola! Soy el asistente de la constructora. Puedo darte info sobre emprendimientos, estado de obra o agendar una visita. ¿Cómo te ayudo?',
  ],
}

export function getBotNameSuggestions(industry: Industry): string[] {
  return BOT_NAME_SUGGESTIONS[industry] ?? BOT_NAME_SUGGESTIONS.generico
}

export function getWelcomeSuggestions(industry: Industry): string[] {
  return WELCOME_SUGGESTIONS[industry] ?? []
}
