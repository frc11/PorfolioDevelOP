export type IncludedFeature = {
  id: string
  iconName: string
  title: string
  description: string
  highlight: string
  accentColor: string
}

export const INCLUDED_FEATURES: IncludedFeature[] = [
  {
    id: 'resultados',
    iconName: 'BarChart3',
    title: 'Resultados en tiempo real',
    description:
      'Tráfico, posicionamiento SEO, reseñas y velocidad del sitio. Todo conectado a las APIs reales de Google. No screenshots de Excel — datos vivos.',
    highlight: 'GA4 + Search Console + PageSpeed conectados',
    accentColor: '#06b6d4',
  },
  {
    id: 'mi-proyecto',
    iconName: 'GitBranch',
    title: 'Tu proyecto, transparente',
    description:
      'Cada tarea, cada hito, cada entrega. Aprobás cosas con un click sin tener que pedir un Zoom. La trazabilidad que tu negocio merece.',
    highlight: 'Cero Excels compartidos. Cero "¿en qué andamos?"',
    accentColor: '#8b5cf6',
  },
  {
    id: 'mensajes',
    iconName: 'MessageSquare',
    title: 'Comunicación con SLA real',
    description:
      'Respondemos en menos de 4 horas en horario laboral. Tu equipo develOP siempre a un mensaje de distancia, sin ticket queue infinita ni bots que te ignoran.',
    highlight: 'Respuesta < 4h · Lun-Vie 9-19hs ART',
    accentColor: '#10b981',
  },
  {
    id: 'boveda',
    iconName: 'ShieldCheck',
    title: 'Bóveda Digital encriptada',
    description:
      'Tus credenciales (dominio, hosting, redes, APIs) guardadas con encryption AES-256. Nunca más vas a perder un acceso ni depender de "Juan que tenía la clave".',
    highlight: 'AES-256 + log de accesos auditable',
    accentColor: '#f59e0b',
  },
  {
    id: 'ai-brief',
    iconName: 'Sparkles',
    title: 'Resumen ejecutivo IA',
    description:
      'Cada semana, una IA analiza tus datos y te escribe en 2 oraciones qué pasó, qué mejoró y qué necesita atención. Para que no tengas que ser analista de datos.',
    highlight: 'Powered by Claude — el mejor LLM del mundo en español',
    accentColor: '#ec4899',
  },
]
