/**
 * [L7e] El padrón del laboratorio: cada prototipo con su ruta, la página para la que se pensó, qué mirar y de qué mecánica del home sale.
 * Lo leen el índice (`/v3/laboratorio`) y la leyenda de cada prototipo. El detalle de cada idea: `docs/ideas/MOMENTOS.md`.
 */

export interface Prototipo {
  readonly slug: string
  /** El código del momento en `MOMENTOS.md` (E1, N1…). */
  readonly codigo: string
  readonly titulo: string
  /** La página real a la que iría. */
  readonly pagina: string
  /** Qué mirar, en una línea. */
  readonly mirar: string
  /** De qué pieza o mecánica del home sale. */
  readonly sale: string
}

export const PROTOTIPOS: readonly Prototipo[] = [
  {
    slug: 'no-encaja',
    codigo: 'E1',
    titulo: 'El logo que no encaja',
    pagina: '404',
    mirar: 'El logo cae a su hueco, choca, rebota y queda torcido. Tocalo para que vuelva a intentar.',
    sale: 'EncajeDelLogo con el resultado de error (el de EstadoDeEnvio).',
  },
  {
    slug: 'dos-tomas',
    codigo: 'N1 + N4',
    titulo: 'Dos tomas, dos personas',
    pagina: 'Nosotros',
    mirar: 'En 1440, el hover de la foto como en el home. En 390, cada foto se abre sola al cruzar la mitad de la pantalla y se cierra al volver. Al final, la foto de la facultad se abre desde una rendija.',
    sale: 'MarcoDeDosTomas de Quiénes somos, importado; el disparo del gatillo; el clip-path desde el centro de la segunda toma.',
  },
  {
    slug: 'fichas-abiertas',
    codigo: 'P1',
    titulo: 'Cada caso, una ficha abierta',
    pagina: 'Portfolio',
    mirar: 'Cada trabajo es una franja de noche sobre el papel: el video clavado a la izquierda y la ficha que entra fila por fila. ¿La noche por caso suma o corta la página?',
    sale: 'La tira activa del acordeón del Portfolio: Ficha, PROYECTOS y el «Visitar sitio» con el color de la marca, importados.',
  },
  {
    slug: 'conversacion-en-vivo',
    codigo: 'I1',
    titulo: 'La conversación que pasa sola',
    pagina: 'Integraciones con IA',
    mirar: 'El chatbot del panel contesta solo al lado del párrafo que lo promete; abajo, lo que sabe de tu negocio. Corre sólo la que más se ve.',
    sale: 'Las demos del Panel (DemoEnSuLugar): «conversaciones» e «informacion», hoy sin usar en el home. El texto es el de Servicios, tal cual.',
  },
  {
    slug: 'lo-de-siempre-tachado',
    codigo: 'S1',
    titulo: 'Lo de siempre, tachado',
    pagina: 'Software a medida',
    mirar: 'Scrolleá despacio: cada forma de trabajar de hoy se tacha y se despinta, y recién después se escribe, subrayado, lo que la reemplaza. Subí: se destacha.',
    sale: 'El titular de Quiénes somos («algo distinto, no lo mismo de siempre»): el Trazo del home, tachado y subrayado, atado al scroll.',
  },
]

export const prototipo = (slug: string): Prototipo | undefined => PROTOTIPOS.find((p) => p.slug === slug)
