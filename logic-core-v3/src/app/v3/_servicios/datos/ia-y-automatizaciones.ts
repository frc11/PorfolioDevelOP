/**
 * [SERVICIOS S1a · L7a] INTEGRACIONES CON IA — los datos de SPEC §7.3, expandidos en L7a. El slug sigue siendo `ia-y-automatizaciones`
 * (L7a: la URL no cambia, para no romper los links); el nombre es «Integraciones con IA» en todos lados.
 *
 * Por ahora se vende solo el chatbot web. El bot de WhatsApp está en desarrollo y no se ofrece: nada de esta página lo ofrece como servicio
 * activo. Los hechos son los del SPEC (los planes, el proceso, lo que hace el asistente) y los del home (`05-TEXTOS.md` de la cola 2 y los
 * ítems de la sección Servicios): nada inventado. [L7a] Sin casos publicados: «Lo que podemos construir» (`posibles`). Sin `null`.
 */

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import type { Servicio } from '../tipos'

const NOMBRE = 'Integraciones con IA'

const QUE_HACEMOS = {
  titulo: 'Tu negocio atiende solo',
  texto:
    'Un asistente con IA que vive en tu web, conversa con cada visitante, capta a los interesados y te avisa quién está listo para comprar.',
}

export const IA_Y_AUTOMATIZACIONES: Servicio = {
  slug: 'ia-y-automatizaciones',
  idEnElHome: 'ia-automatizacion',
  nombre: NOMBRE,
  seo: {
    title: `${NOMBRE} · ${LOGOTIPO}`, // C2: provisorio (L7a)
    description: // C2: provisorio (L7a)
      'Un asistente con IA en tu web que atiende a cualquier hora, capta a los interesados y te avisa quién está listo para comprar. Y lo repetitivo, automatizado.',
  },
  problema: {
    titulo: 'Son las 3 a.m. Te escriben. Nadie contesta.',
    texto: 'Cada mensaje sin respuesta es un pedido que se va a otro lado.',
  },
  queHacemos: QUE_HACEMOS,
  // 05-TEXTOS (Servicios · el tercer servicio), sin el párrafo de WhatsApp: el SPEC no lo ofrece todavía.
  detalle: [
    'Tus clientes escriben a cualquier hora y no siempre podés contestar. Un chatbot con IA atiende por vos: responde lo de siempre, toma pedidos y te pasa los datos de cada persona interesada.',
    'Lo entrenamos con la información de tu negocio, así que habla como vos y no inventa.',
    'También automatizamos lo repetitivo: mensajes, recordatorios, cargas de datos y avisos entre sistemas. Lo que hoy hacés a mano pasa solo.',
  ],
  ejemplos: [
    { nombre: 'Si te escriben fuera de horario', texto: 'El asistente contesta a la noche y el fin de semana, y a la mañana tenés los datos de quién preguntó qué.' },
    { nombre: 'Si respondés siempre lo mismo', texto: 'Precios, horarios, envíos, cómo pedir: lo de siempre lo contesta el asistente, con tu información.' },
    { nombre: 'Si se te pierden interesados', texto: 'Cada persona que deja su nombre y su teléfono queda guardada y marcada según qué tan cerca está de comprar.' },
    { nombre: 'Si hay tareas que se repiten', texto: 'Avisos, recordatorios y cargas que hoy hacés a mano pasan solos.' },
  ],
  // Los ítems de la sección Servicios del home: lo que se arma, no casos (y sin WhatsApp: el SPEC todavía no lo ofrece).
  posibles: [
    { nombre: 'Un asistente en tu web', texto: 'Conversa de verdad con cada visitante, contesta lo de siempre y deriva a una persona cuando hace falta.' },
    { nombre: 'Turnos y recordatorios', texto: 'El asistente toma el turno y el recordatorio sale solo, sin que tengas que escribir uno por uno.' },
    { nombre: 'Consultas ordenadas', texto: 'Cada consulta clasificada por tema, para que sepas qué te preguntan más.' },
    { nombre: 'Un resumen diario', texto: 'Lo que pasó en el día, en un resumen para tu equipo.' },
    { nombre: 'Conexión con lo que ya usás', texto: 'Los datos de cada interesado, directo a tus planillas o a tu sistema de clientes.' },
    { nombre: 'Comprobantes que se cargan solos', texto: 'Lo que hoy se pasa a mano de un lado a otro, automatizado.' },
  ],
  incluye: [
    'Conversa de verdad (no es un menú de botones)',
    'Atiende 24/7',
    'Capta nombre y teléfono',
    'Marca cada lead como caliente, tibio o frío',
    'Deriva a una persona cuando hay intención de compra',
    'Nunca inventa: si no sabe, deriva',
    'Panel propio para ver y configurar todo',
  ],
  aparte: [],
  precio: {
    tipo: 'planes',
    planes: [
      {
        nombre: 'Starter',
        mensual: 49,
        conversaciones: 500,
        soporte: 'Estándar',
        cambiosWeb: 'Solo ediciones chicas',
        funcionalidades: null, // SPEC §7.3: «Qué funcionalidades trae cada plan: [a definir]»
      },
      {
        nombre: 'Pro',
        mensual: 90,
        conversaciones: 3000,
        soporte: 'Estándar',
        cambiosWeb: '+ 1 mediano por mes',
        funcionalidades: null, // SPEC §7.3: [a definir]
      },
      {
        nombre: 'Business',
        mensual: 150,
        conversaciones: 5000,
        soporte: 'Prioritario 24 h',
        cambiosWeb: '+ 1 mediano y 1 grande por mes',
        funcionalidades: null, // SPEC §7.3: [a definir]
      },
    ],
    implementacionDesde: null, // SPEC §7.3: «Implementación: pago único, desde USD [a definir]»
    nota: 'Implementación: pago único.',
  },
  extra: null,
  proceso: {
    pasos: [
      { nombre: 'Accesos al panel', texto: 'Te damos tu panel propio, donde vas a ver y configurar todo.' },
      { nombre: 'Entrenamos al asistente con tu información', texto: 'Lo que ofrecés, tus precios, tus horarios y cómo se compra: de ahí sale cómo contesta.' },
      { nombre: 'Pruebas', texto: 'Lo probamos con preguntas reales antes de que hable con tus clientes, y ajustamos lo que haga falta.' },
      { nombre: 'Atiende en tu web', texto: 'Queda en tu página, atendiendo a cualquier hora y pasándote a los interesados.' },
      { nombre: 'Mejora mensual', texto: 'Cada mes miramos lo que realmente pasó en las conversaciones y lo ajustamos.' },
    ],
    plazo: 'Unas 4 semanas',
  },
  entrega: [
    'El asistente atendiendo en tu web, a cualquier hora',
    'Tu panel propio, con cada conversación y cada interesado',
    'Los interesados marcados como calientes, tibios o fríos',
    'El aviso cuando alguien está listo para comprar',
  ],
  despues: [
    'El asistente no queda quieto: cada mes miramos lo que realmente pasó en las conversaciones y lo mejoramos.',
    'Se paga la implementación una vez y un abono mensual según el plan. Si un mes se agota la cuota de conversaciones, el asistente sigue en modo básico y derivando.',
  ],
  prueba: {
    // SPEC §7.3: sin casos publicables todavía
    casos: [],
    nota: null,
    ctaPanel: { rotulo: 'Probá el panel', href: '/login' }, // D11: el SPEC deja el href [a definir]; mientras tanto va al login
    video: null, // M3: el video de trabajos es solo de Desarrollo web; el slot 6 no se monta
  },
  faq: [
    {
      pregunta: '¿El bot reemplaza a mi equipo?',
      // M0 §8 (dictado): el SPEC §7.3 decía que deriva a una persona, pero no daba el sí o el no que la pregunta pide
      respuesta:
        'No. Atiende las consultas repetidas y las que llegan fuera de horario, y cuando alguien está listo para comprar le pasa la charla a una persona de tu equipo. El asistente atiende; vos cerrás las ventas.',
    },
    {
      pregunta: '¿Puedo ver las conversaciones?',
      // SPEC §7.3: el panel propio para ver y configurar todo
      respuesta: 'Sí. Tenés un panel propio para ver cada conversación y configurar todo.',
    },
    {
      pregunta: '¿Qué pasa si no sabe responder?',
      // SPEC §7.3: deriva y nunca inventa
      respuesta: 'Deriva a una persona. El asistente nunca inventa: si no sabe, deriva.',
    },
    {
      pregunta: '¿Qué cuenta como una conversación?',
      // SPEC §7.3: una charla completa, sin importar cuántos mensajes
      respuesta: 'Una charla completa, sin importar cuántos mensajes tenga.',
    },
    {
      pregunta: '¿Qué pasa si se agota la cuota del mes?',
      // SPEC §7.3: sigue en modo básico y derivando
      respuesta: 'El asistente sigue atendiendo en modo básico y derivando a una persona.',
    },
    {
      pregunta: '¿Qué pasa con los datos de mis visitantes?',
      // SPEC §7.3: pide consentimiento antes de guardarlos
      respuesta: 'Se pide consentimiento antes de guardarlos.',
    },
  ],
  cta: {
    titulo: 'Que tu negocio atienda las 24 hs',
    // M0 §8 (dictado): el SPEC §7.3 traía solo el título del CTA
    texto: 'Contanos tu rubro y cuántas consultas te llegan por mes, y te recomendamos el plan que te conviene.',
    boton: 'Quiero mi integración con IA', // C2: 05-TEXTOS, el CTA del servicio en el home
  },
  articulos: [{ titulo: 'Cómo automatizar pedidos por WhatsApp sin perder el trato humano', href: null }],
}
