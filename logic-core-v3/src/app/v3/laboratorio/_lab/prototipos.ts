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

const TODOS: readonly Prototipo[] = [
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
  {
    slug: 'historia-que-se-pinta',
    codigo: 'N2',
    titulo: 'La historia que se pinta',
    pagina: 'Nosotros',
    mirar: 'La historia de develOP entera, palabra por palabra: lo leído queda en tinta, lo que viene en gris. ¿Se lee bien a este ritmo o cansa?',
    sale: 'El título del Panel que se pinta (el cálculo de _componentes/pintado, importado), estirado a un texto largo.',
  },
  {
    slug: 'carrusel-del-blog',
    codigo: 'B1',
    titulo: 'El carrusel de las destacadas',
    pagina: 'Blog',
    mirar: 'Cambia solo cada 10 s, con las líneas de abajo (llenas las ya vistas); mantené apretado para pausar; flechas y dedo. El titular se levanta al entrar. Las tapas son tipográficas porque las notas no tienen foto.',
    sale: 'CarruselDeTarjetas (el del Portfolio y Demos en el teléfono) y TitularQueSeLevanta, importados.',
  },
  {
    slug: 'notas-irregulares',
    codigo: 'B2',
    titulo: 'Las notas en lugares irregulares',
    pagina: 'Blog',
    mirar: 'Seis tarjetas en un patrón corrido (no una grilla) que caen en su lugar con un giro chico que se endereza. Pasá el mouse por «Leer la nota». ¿Se lee irregular o desordenado?',
    sale: 'El gatillo del home (32 px, 700 ms, la curva de salida, en espejo al subir) más un giro; DosCopias, el rollover del sitio.',
  },
  {
    slug: 'nota',
    codigo: 'L1 + L2',
    titulo: 'La nota con su hilo',
    pagina: 'Nota del blog',
    mirar: 'Arriba de todo, un hilo fino se dibuja mientras leés. Los subtítulos se levantan, la frase destacada se pinta y, al llegar al final, el tiempo de lectura se tacha y queda «Leída».',
    sale: 'La raya del Trazo, TitularQueSeLevanta, el pintado del Panel y el tachado de Quiénes somos: cuatro piezas del home puestas a leer.',
  },
  {
    slug: 'indice-legal',
    codigo: 'G1',
    titulo: 'El índice con el subrayado que viaja',
    pagina: 'Privacidad y Términos',
    mirar: 'En 1440, scrolleá el texto: el subrayado del índice no salta de un ítem al otro, viaja. Es la página donde menos hay que lucirse: ¿alcanza con esto?',
    sale: 'El subrayado del CTA (grosor y curva de salida) y la sección activa de la barra del home.',
  },
  {
    slug: 'como-trabajamos',
    codigo: 'N3',
    titulo: 'Cómo trabajamos, con un trazo',
    pagina: 'Nosotros (y Software)',
    mirar: 'Una línea se dibuja hacia abajo con el scroll y une los pasos; cada paso se subraya y pasa a tinta cuando la línea lo alcanza. Los pasos salen de frases que el home ya dice.',
    sale: 'El Trazo del titular de Quiénes somos (subrayado) y su raya, de pie; los pasos, de los textos de Servicios, Seis razones y el Panel.',
  },
  {
    slug: 'pantalla-que-se-dibuja',
    codigo: 'W1',
    titulo: 'La pantalla que se dibuja',
    pagina: 'Desarrollo web',
    mirar: 'Al lado del texto de Web, el alambre de una página se dibuja trazo por trazo con el scroll y, al terminar, la pantalla de un trabajo real se abre adentro desde el centro. ¿Se ve develOP o se ve wireframe de plantilla?',
    sale: 'El globo de alambre de Servicios (el trazo fino, el celeste), el clip-path desde el centro de la segunda toma y el póster de El Garage.',
  },
]

/** El orden del índice: el de `docs/ideas/COMO-MIRAR.md`, los que más creo primero. */
const ORDEN = [
  'no-encaja',
  'dos-tomas',
  'fichas-abiertas',
  'lo-de-siempre-tachado',
  'conversacion-en-vivo',
  'historia-que-se-pinta',
  'como-trabajamos',
  'pantalla-que-se-dibuja',
  'carrusel-del-blog',
  'notas-irregulares',
  'nota',
  'indice-legal',
] as const

export const PROTOTIPOS: readonly Prototipo[] = [
  ...ORDEN.flatMap((slug) => TODOS.filter((p) => p.slug === slug)),
  ...TODOS.filter((p) => !(ORDEN as readonly string[]).includes(p.slug)),
]

export const prototipo = (slug: string): Prototipo | undefined => PROTOTIPOS.find((p) => p.slug === slug)
