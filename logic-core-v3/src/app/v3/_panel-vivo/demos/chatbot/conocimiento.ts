/**
 * [NOCTURNO] B · LO QUE SABE EL CHATBOT DEL NEGOCIO DE EJEMPLO — los siete campos de la base de conocimiento
 * (`KnowledgeBase` en `prisma/schema.prisma`, los de `ClientKnowledgeView`), escritos para «Tu negocio». Sin un solo
 * precio (la base real los suele tener: en Tu panel no se inventan, ni de ejemplo), sin direcciones ni teléfonos.
 */
export interface BaseDeEjemplo {
  readonly businessInfo: string
  readonly servicesOrProducts: string
  readonly faq: string
  readonly policies: string
  readonly salesGuidance: string
  readonly toneExamples: string
  readonly forbiddenStatements: string
}

export const BASE_DE_EJEMPLO: BaseDeEjemplo = {
  businessInfo: 'Tu negocio es una tienda de barrio con local a la calle y venta online.\nAtendemos de lunes a sábado; el chatbot responde a toda hora.\nHacemos envíos en el día dentro de la zona.',
  servicesOrProducts: '• Los productos de la tienda, con el stock al día.\n• Pedidos especiales para eventos y empresas, a medida.\n• Envío a domicilio o retiro en el local.\n(Los precios los confirma siempre una persona del equipo.)',
  faq: '¿Hacen envíos? — Sí, en el día dentro de la zona.\n¿Qué medios de pago aceptan? — Transferencia, tarjeta y efectivo en el local.\n¿Tienen local? — Sí, con atención de lunes a sábado.\n¿Se puede cambiar un pedido? — Sí: lo coordina una persona del equipo.',
  policies: 'Los cambios se hacen con el ticket de compra.\nLos pedidos especiales se confirman por escrito antes de prepararlos.\nSi un envío se demora, avisamos por WhatsApp.',
  salesGuidance: 'Si alguien quiere comprar, pide un presupuesto o quiere hablar con una persona: pedile el nombre y un contacto, y pasale el lead al equipo.\nSi pregunta algo que no está en esta base, no inventes: ofrecé que lo contacte una persona.',
  toneExamples: '«¡Hola! ¿En qué te puedo ayudar?»\n«Te paso las opciones y elegís tranquilo.»\nTuteo, frases cortas, sin tecnicismos.',
  forbiddenStatements: 'No dar precios: los confirma el equipo.\nNo prometer plazos que no estén en esta base.\nNo hablar de otros negocios.',
}
