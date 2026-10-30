import type { Nota } from './tipos'

export const NOTA: Nota = {
  slug: 'que-es-un-chatbot-con-ia-y-cuando-le-conviene-a-una-pyme',
  titulo: 'Qué es un chatbot con IA y cuándo le conviene a una pyme',
  resumen: 'Un chatbot con inteligencia artificial puede atender consultas todo el día. Cómo funciona, qué puede y qué no puede hacer, y cuándo vale la pena.',
  fecha: '2026-10-20',
  portada: { palabra: 'Chatbot', tono: 'ia' },
  introduccion: [
    'Seguro viste esos chats que aparecen en las páginas y te saludan antes de que escribas nada. Hasta hace poco eran bastante torpes: respondían solo a palabras exactas y se perdían ante cualquier pregunta distinta. Con la inteligencia artificial eso cambió mucho.',
    'Pero que la tecnología exista no significa que a todos los negocios les convenga. Acá te explicamos qué es, qué puede hacer por una pyme y cómo darte cuenta de si es tu caso.',
  ],
  secciones: [
    {
      subtitulo: 'Qué es, en palabras simples',
      parrafos: [
        'Un chatbot con IA es un asistente que conversa con tus clientes por escrito, en tu página o en un canal como WhatsApp. A diferencia de los viejos chatbots de botones, entiende preguntas dichas de distintas formas y responde con lenguaje natural.',
        'Lo importante es de dónde saca lo que contesta. Un buen chatbot no inventa: se arma con la información de tu negocio, como tus servicios, tus horarios, cómo se hacen los pedidos o cuáles son las dudas más comunes, y responde sobre eso.',
      ],
    },
    {
      subtitulo: 'Qué puede hacer por tu negocio',
      parrafos: [
        'Lo más útil es atender las consultas repetidas: horarios, dirección, medios de pago, cómo se pide un turno, qué incluye un servicio. Son las preguntas que probablemente respondés todos los días, y un chatbot las contesta al instante, también de noche y los fines de semana.',
        'También puede ayudar a ordenar el primer contacto. En lugar de un «hola, quería información», podés tener a alguien que ya te cuenta qué necesita, de qué ciudad escribe y cómo prefiere que lo contacten, y que te lo deja listo para continuar.',
        'Y puede derivar a una persona cuando hace falta. Un chatbot bien armado sabe cuándo no puede resolver algo y te avisa para que sigas vos.',
      ],
    },
    {
      subtitulo: 'Lo que no hace',
      parrafos: [
        'Un chatbot no reemplaza a tu equipo ni la relación con tus clientes. No negocia casos especiales, no toma decisiones importantes por vos y no conviene que opine de temas delicados. Tampoco es mágico: si la información que le das es incompleta o está desactualizada, sus respuestas también lo van a estar.',
        'Por eso necesita cuidado al principio y revisión después. Hay que probarlo, ver qué contesta, ajustarlo y mantener al día lo que sabe.',
      ],
    },
    {
      subtitulo: 'Cuándo le conviene a una pyme',
      parrafos: [
        'Suele convenir cuando se cumplen varias de estas situaciones. Recibís muchas consultas parecidas. Tardás en responder y se te enfrían clientes. Tu equipo pierde buena parte del día contestando lo mismo. O tus clientes te escriben fuera de horario y nadie los atiende.',
        'En cambio, probablemente no sea el momento si recibís muy pocas consultas, si cada una es muy particular o si todavía no tenés clara tu información básica. En ese caso, primero conviene ordenar lo esencial: una página clara con las respuestas a las dudas comunes ya resuelve gran parte.',
      ],
    },
    {
      subtitulo: 'Cómo empezar sin complicarte',
      parrafos: [
        'Empezá anotando las diez preguntas que más te hacen. Si las respuestas son claras y no cambian a cada rato, tenés una buena base para un chatbot. Si no, es una señal de que hay que ordenar el negocio antes de automatizar.',
        'Después elegí dónde querés atender: en tu página, en WhatsApp o en ambos. Y pensá qué querés que pase cuando la conversación se pone compleja: a quién avisa, cómo y en qué momento.',
        'Un buen consejo es empezar con un alcance chico y sumar capacidades con el tiempo. Un chatbot que responde bien cinco cosas sirve más que uno que promete mil y falla en la mitad.',
      ],
    },
    {
      subtitulo: 'Qué cuidar para que no te juegue en contra',
      parrafos: [
        'Un chatbot habla en nombre de tu negocio, así que hay que cuidar lo que dice. Lo primero es que sea claro desde el inicio con quien escribe: que sepa que está hablando con un asistente y que puede pedir hablar con una persona cuando quiera.',
        'Lo segundo es revisar las conversaciones, sobre todo al principio. Leer qué preguntan realmente tus clientes es muy valioso: te muestra dudas que no habías pensado y te permite mejorar tanto el chatbot como tu página.',
        'Y lo tercero es decidir de antemano qué no va a contestar. Si hay temas que prefieras tratar en persona, como precios especiales o reclamos, lo mejor es que el asistente derive esas consultas en lugar de improvisar una respuesta.',
      ],
    },
  ],
  cierre: 'Si querés saber si un chatbot tiene sentido en tu negocio, contanos cómo atendés hoy a tus clientes y lo vemos juntos.',
}
