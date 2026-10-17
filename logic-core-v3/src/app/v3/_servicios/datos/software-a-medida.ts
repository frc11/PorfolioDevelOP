/**
 * [SERVICIOS S1a] SOFTWARE A MEDIDA — los datos de SPEC §7.2, tal cual.
 *
 * Textos y números literales del SPEC: nada inventado. Lo que el SPEC deja en [a definir], o no da, va en `null`
 * (plan §8.6). Las marcas son las de `paginas-web.ts`: `// SPEC §7.x`, `// C2: provisorio` y `// P-H2`.
 */

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import type { Servicio } from '../tipos'

const NOMBRE = 'Software a medida'

const QUE_HACEMOS = {
  titulo: 'Tu problema, convertido en un sistema',
  texto: 'Nos contás cómo trabajás y qué te frena; lo convertimos en una herramienta que encaja exacto en tu negocio.',
}

/** Aparecen en dos lugares (el incluye y el FAQ; el CTA y el FAQ): una sola redacción para cada una. */
const SOPORTE_INCLUIDO = '1 o 2 meses de soporte gratis después de entregar'
const CHARLA = 'Una charla corta alcanza para saber si te podemos ayudar.'

export const SOFTWARE_A_MEDIDA: Servicio = {
  slug: 'software-a-medida',
  idEnElHome: 'software',
  nombre: NOMBRE,
  acento: {
    claro: '#AFA0E8', // P-H2: reemplazar por el token claro del tema cuando exista
  },
  seo: {
    title: `${NOMBRE} · ${LOGOTIPO}`, // C2: provisorio
    description: QUE_HACEMOS.texto, // C2: provisorio
  },
  problema: {
    titulo: 'El software enlatado es igual para todos',
    texto: 'Planillas, sistemas genéricos y procesos a mano que no se adaptan a cómo trabaja tu negocio.',
  },
  queHacemos: QUE_HACEMOS,
  incluye: [
    'Relevamiento del problema',
    'Diseño y desarrollo a medida',
    'Portal del cliente',
    SOPORTE_INCLUIDO,
  ],
  aparte: [],
  precio: {
    tipo: 'proyecto',
    desde: 1000,
    nota: 'Se cotiza según lo que necesites.',
  },
  extra: null,
  proceso: {
    pasos: ['Relevamiento', 'Prototipo', 'Desarrollo', 'Entrega', 'Soporte'],
    plazo: 'Depende de la complejidad',
  },
  prueba: {
    casos: [
      // SPEC §7.2: se presentan por rubro, con capturas de datos ficticios y sin aclarar el vínculo. Textos e imágenes, [a definir].
      { tipo: 'propio', nombre: 'Sistema de gestión', rubro: 'Pollería', texto: null, imagen: null },
      { tipo: 'propio', nombre: 'Sistema de boletas', rubro: null, texto: null, imagen: null },
    ],
    nota: '2 sistemas más en desarrollo',
    ctaPanel: null,
  },
  faq: [
    {
      pregunta: '¿Cómo sé si necesito un sistema propio?',
      // SPEC §7.2: el problema que resolvemos y el cierre del CTA
      respuesta: `Una señal son las planillas, los sistemas genéricos y los procesos a mano que no se adaptan a cómo trabaja tu negocio. ${CHARLA}`,
    },
    {
      pregunta: '¿Qué pasa si después necesito cambios?',
      respuesta: null, // SPEC §7.2 no dice cómo se tratan los cambios después de la entrega
    },
    {
      pregunta: '¿El sistema es mío?',
      respuesta: null, // SPEC §7.2: «respuesta [a definir]»
    },
    {
      pregunta: '¿Cuánto soporte incluye?',
      // SPEC §7.2: el soporte gratis después de entregar
      respuesta: `Incluye ${SOPORTE_INCLUIDO}.`,
    },
  ],
  cta: {
    titulo: 'Contanos tu problema',
    texto: CHARLA,
    boton: 'Quiero mi software a medida', // C2: provisorio
  },
  articulos: [
    { titulo: 'Señales de que tu negocio necesita un sistema propio y no más planillas', href: null },
  ],
}
