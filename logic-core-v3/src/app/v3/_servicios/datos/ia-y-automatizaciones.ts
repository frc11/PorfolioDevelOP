/**
 * [SERVICIOS S1a] IA Y AUTOMATIZACIONES — los datos de SPEC §7.3, tal cual.
 *
 * Por ahora se vende solo el chatbot web. El bot de WhatsApp está en desarrollo y no se ofrece: nada de esta página lo
 * ofrece como servicio activo.
 *
 * Textos y números literales del SPEC: nada inventado. Lo que el SPEC deja en [a definir], o no da, va en `null`
 * (plan §8.6). Las marcas son las de `paginas-web.ts`: `// SPEC §7.x`, `// C2: provisorio` y `// P-H2`.
 */

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import type { Servicio } from '../tipos'

const NOMBRE = 'IA y automatizaciones'

const QUE_HACEMOS = {
  titulo: 'Tu negocio atiende solo',
  texto:
    'Un asistente con IA que vive en tu web, conversa con cada visitante, capta a los interesados y te avisa quién está listo para comprar.',
}

export const IA_Y_AUTOMATIZACIONES: Servicio = {
  slug: 'ia-y-automatizaciones',
  idEnElHome: 'ia-automatizacion',
  nombre: NOMBRE,
  acento: {
    claro: '#7FCBA4', // P-H2: reemplazar por el token claro del tema cuando exista
  },
  seo: {
    title: `${NOMBRE} · ${LOGOTIPO}`, // C2: provisorio
    description: QUE_HACEMOS.texto, // C2: provisorio
  },
  problema: {
    titulo: 'Son las 3 a.m. Te escriben. Nadie contesta.',
    texto: 'Cada mensaje sin respuesta es un pedido que se va a otro lado.',
  },
  queHacemos: QUE_HACEMOS,
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
      'Accesos al panel',
      'Entrenamos al asistente con tu información',
      'Pruebas',
      'Atiende en tu web',
      'Mejora mensual',
    ],
    plazo: 'Unas 4 semanas',
  },
  prueba: {
    // SPEC §7.3: sin casos publicables todavía
    casos: [],
    nota: null,
    ctaPanel: { rotulo: 'Probá el panel', href: '/login' }, // D11: el SPEC deja el href [a definir]; mientras tanto va al login
  },
  faq: [
    {
      pregunta: '¿El bot reemplaza a mi equipo?',
      respuesta: null, // SPEC §7.3 dice que deriva a una persona, pero no da el sí o el no que la pregunta pide
    },
    {
      pregunta: '¿Puedo ver las conversaciones?',
      // SPEC §7.3: el panel propio para ver y configurar todo
      respuesta: 'Sí. Tenés un panel propio para ver y configurar todo.',
    },
    {
      pregunta: '¿Qué pasa si no sabe responder?',
      // SPEC §7.3: deriva y nunca inventa
      respuesta: 'Deriva. El asistente nunca inventa: si no sabe, deriva.',
    },
    {
      pregunta: '¿Qué cuenta como una conversación?',
      // SPEC §7.3: una charla completa, sin importar cuántos mensajes
      respuesta: 'Una charla completa, sin importar cuántos mensajes tenga.',
    },
    {
      pregunta: '¿Qué pasa si se agota la cuota del mes?',
      // SPEC §7.3: sigue en modo básico y derivando
      respuesta: 'El asistente sigue en modo básico y derivando.',
    },
    {
      pregunta: '¿Qué pasa con los datos de mis visitantes?',
      // SPEC §7.3: pide consentimiento antes de guardarlos
      respuesta: 'Se pide consentimiento antes de guardarlos.',
    },
  ],
  cta: {
    titulo: 'Que tu negocio atienda las 24 hs',
    texto: null, // SPEC §7.3 trae solo el título del CTA
    boton: 'Quiero mi asistente con IA', // C2: provisorio
  },
  articulos: [{ titulo: 'Cómo automatizar pedidos por WhatsApp sin perder el trato humano', href: null }],
}
