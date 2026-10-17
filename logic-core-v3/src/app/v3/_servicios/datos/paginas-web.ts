/**
 * [SERVICIOS S1a] PÁGINAS WEB — los datos de SPEC §7.1, tal cual.
 *
 * Textos y números literales del SPEC: nada inventado. Lo que el SPEC deja en [a definir] va en `null` (plan §8.6).
 * Las marcas de este archivo:
 *   · `// SPEC §7.x` — de qué parte del SPEC sale una respuesta del FAQ. Regla D9: se escribe solo si CADA afirmación
 *     sale del SPEC; si alguna parte no sale, es `null`.
 *   · `// C2: provisorio` — copy que el SPEC no da (D10); lo reemplaza la pasada de textos del final.
 *   · `// P-H2` — el único hex: el acento claro, hasta que el tema lo emita como token.
 * La marca se importa de `LOGOTIPO`: no se escribe suelta en los datos.
 */

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { usd } from '../formato'
import type { Servicio } from '../tipos'

const NOMBRE = 'Páginas web'

const QUE_HACEMOS = {
  titulo: 'Construimos tu presencia, bloque por bloque',
  texto: 'Diseñamos y desarrollamos la web de tu negocio para que te encuentren, te entiendan y te escriban.',
}

/** Lo que cuestan los cambios del mantenimiento: lo usan el extra y la respuesta del FAQ, así no se desfasan. */
const CAMBIO_MEDIANO_DESDE = 50
const CAMBIO_GRANDE_DESDE = 100

export const PAGINAS_WEB: Servicio = {
  slug: 'paginas-web',
  idEnElHome: 'web',
  nombre: NOMBRE,
  acento: {
    claro: '#8FC0E8', // P-H2: reemplazar por el token claro del tema cuando exista
  },
  seo: {
    title: `${NOMBRE} · ${LOGOTIPO}`, // C2: provisorio
    description: QUE_HACEMOS.texto, // C2: provisorio
  },
  problema: {
    titulo: '¿Te buscan y no te encuentran?',
    texto: 'Si tu negocio no tiene web, o tiene una vieja que no vende, perdés clientes que ya te estaban buscando.',
  },
  queHacemos: QUE_HACEMOS,
  incluye: [
    'Diseño a medida de tu marca',
    'Adaptada a celular y tablet',
    'Formulario de contacto conectado',
    'Portal del cliente (métricas, tickets y acceso a más servicios)',
  ],
  aparte: ['Chatbot con IA', 'Extras'],
  precio: {
    tipo: 'calibres',
    calibres: [
      {
        nombre: 'Simple',
        desde: 200,
        descripcion: 'Una sola página, tipo landing, sin nada extravagante',
        incluye: [],
        autogestionable: null, // SPEC §7.1: «Si la Simple tiene panel: [a definir]»
      },
      {
        nombre: 'Mediana',
        desde: 600,
        descripcion: 'Varias páginas, buscador o catálogo sin compras',
        incluye: [],
        autogestionable: true,
      },
      {
        nombre: 'Premium',
        desde: 1000,
        descripcion: 'E-commerce. El precio crece con el alcance',
        incluye: [],
        autogestionable: true,
      },
    ],
  },
  extra: {
    titulo: 'Mantenimiento',
    items: [
      { nombre: 'Ediciones chicas', detalle: 'Textos, precios, fotos, horarios', precio: 'Desde el panel' },
      {
        nombre: 'Cambios medianos',
        detalle: 'Sumar sección o formulario, cambiar colores o tipografía',
        precio: `Desde ${usd(CAMBIO_MEDIANO_DESDE)}`,
      },
      {
        nombre: 'Cambios grandes',
        detalle: 'Página nueva, integración, módulo',
        precio: `Desde ${usd(CAMBIO_GRANDE_DESDE)}`,
      },
      { nombre: 'Arreglos', detalle: 'De algo roto', precio: 'Siempre incluidos' },
      { nombre: 'Plan mensual', detalle: 'Solo web', precio: null }, // SPEC §7.1: «Plan mensual solo web: USD [a definir]»
    ],
    nota: 'Todo extra se presupuesta antes.',
  },
  proceso: {
    pasos: ['Charla', 'Propuesta', 'Diseño', 'Desarrollo', 'Entrega'],
    plazo: 'De 2–3 semanas a 2–3 meses según el calibre',
  },
  prueba: {
    casos: [
      {
        tipo: 'proyecto',
        slug: 'el-garage',
        texto: 'Ordenó su catálogo, que antes vivía en publicaciones de Facebook que quedaban viejas.',
      },
      { tipo: 'proyecto', slug: 'esquina-estudio', texto: 'Pasó a tener presencia online.' },
      { tipo: 'proyecto', slug: 'banu-scents', texto: 'Catálogo y presencia online.' },
    ],
    nota: null,
    ctaPanel: null,
  },
  faq: [
    {
      pregunta: '¿Cuánto tarda una web?',
      // SPEC §7.1: el proceso y el plazo de referencia, que es una referencia y nunca una promesa
      respuesta:
        'Como referencia, de 2–3 semanas a 2–3 meses según el calibre. El proceso va de la charla a la propuesta, el diseño, el desarrollo y la entrega.',
    },
    {
      pregunta: '¿Puedo editarla yo después?',
      // SPEC §7.1: Mediana y Premium son autogestionables; las ediciones chicas se hacen desde el panel. Nada de la Simple.
      respuesta:
        'Las webs Mediana y Premium son autogestionables: las ediciones chicas (textos, precios, fotos, horarios) se hacen desde el panel.',
    },
    {
      pregunta: '¿Qué pasa después de la entrega?',
      // SPEC §7.1: el mantenimiento. Quedan afuera el plan mensual y las ediciones desde el panel, que dependen de un [a definir]
      respuesta: `Los arreglos de algo roto siempre están incluidos. Los cambios medianos (sumar sección o formulario, cambiar colores o tipografía) salen desde ${usd(CAMBIO_MEDIANO_DESDE)} y los grandes (página nueva, integración, módulo), desde ${usd(CAMBIO_GRANDE_DESDE)}. Todo extra se presupuesta antes.`,
    },
    {
      pregunta: '¿Qué incluye el portal del cliente?',
      // SPEC §7.1: lo que incluye la web
      respuesta: 'El portal del cliente incluye métricas, tickets y acceso a más servicios.',
    },
    {
      pregunta: '¿El chatbot viene incluido?',
      // SPEC §7.1: el SPEC trae la respuesta («No, va aparte») y lo lista en «Aparte»
      respuesta: 'No, el chatbot con IA va aparte.',
    },
  ],
  cta: {
    titulo: '¿Arrancamos con tu web?',
    texto: 'Contanos de tu negocio y te respondemos con una propuesta.',
    boton: 'Quiero mi página web', // C2: provisorio
  },
  articulos: [
    { titulo: 'Cuánto cuesta una página web', href: null },
    { titulo: 'Tienda Nube o web propia', href: null },
  ],
}
