/**
 * LAS DEMOS — el catálogo y el texto del tramo. **[PORTFOLIO · DEMOS]**
 *
 * ⚠️ **ES UNA COPIA, Y ESTÁ ATADA.** La lista que usa el sitio vivo es `TEMPLATES`,
 * una constante NO exportada de
 * `src/components/sections/web-development/WebTemplatesImmersive.tsx`, que monta
 * `/web-development`. Importarla obligaría a tocar ese archivo, y el sprint lo
 * prohíbe. Así que la biblioteca lleva la suya y `demos.invariant.tsx` lee el
 * fuente del sitio vivo y afirma que los nombres y las URLs son los mismos, en el
 * mismo orden: la copia no puede envejecer sola.
 *
 * ⚠️ **SON SEIS, NO OCHO.** El pedido dice «hoy son 8»; en el repo —`main`,
 * `redesign/home` y esta rama— hay seis. Las dos que faltan quedan PEDIDAS: entran
 * acá (y en el sitio vivo) con su URL y su portada, y la biblioteca las acomoda
 * sola, porque todo se deriva de la lista.
 *
 * El rubro es la primera mitad del `tagline` del sitio vivo, en castellano. La
 * portada es una captura real del template (`scripts-b4/demos-portadas.ts`),
 * vertical, porque en el estante es la cara de un libro.
 */

export interface Demo {
  readonly slug: string
  readonly nombre: string
  readonly rubro: string
  readonly url: string
  /** Captura real del template, 400 × 600 CSS a doble densidad. */
  readonly portada: string
}

/** Lo que mide cada portada, en píxeles de archivo. */
export const MEDIDA_DE_LA_PORTADA = { ancho: 800, alto: 1200 } as const

export const CATALOGO_DE_DEMOS: readonly Demo[] = [
  { slug: 'zero', nombre: 'Zero Protocol', rubro: 'Tecnología', url: 'https://template-zero.netlify.app/', portada: '/demos/zero.webp' },
  { slug: 'ethereal', nombre: 'The Ethereal Resort', rubro: 'Hotelería', url: 'https://template-ethernal.netlify.app/', portada: '/demos/ethereal.webp' },
  { slug: 'noir', nombre: 'Noir Dining in the Void', rubro: 'Gastronomía', url: 'https://template-noir.netlify.app/', portada: '/demos/noir.webp' },
  { slug: 'skyline', nombre: 'Skyline Estates', rubro: 'Inmobiliaria', url: 'https://template-skyline.netlify.app/', portada: '/demos/skyline.webp' },
  { slug: 'bold', nombre: 'NEXO Bold', rubro: 'Agencia creativa', url: 'https://template-bold.netlify.app/', portada: '/demos/bold.webp' },
  { slug: 'nebula', nombre: 'YAKU Nebula', rubro: 'Software', url: 'https://template-nebula.netlify.app/', portada: '/demos/nebula.webp' },
]

/**
 * EL TEXTO DEL TRAMO. Rioplatense, frases cortas, y dice lo concreto: qué es una
 * demo, que el cliente es ficticio y que se abre acá mismo.
 *
 * ⚠️ El párrafo es UNO para las dos ramas: `s10-acceso` exige que el texto
 * anunciado sea idéntico arriba y abajo de 1025. La frase que sólo vale arriba
 * —«se abre acá mismo»— y la que sólo vale abajo —«se abre en otra pestaña»— van
 * las dos en el marcado, y el ancho muestra la que corresponde.
 */
export const TEXTO_DE_DEMOS = {
  titulo: 'Demos para abrir acá mismo',
  parrafo: 'Son sitios de ejemplo hechos por develOP, con clientes ficticios. Muestran lo que se puede hacer y se adaptan a cualquier rubro.',
  enEscritorio: 'Elegí uno y usalo sin salir de esta página.',
  enMovil: 'Tocá uno y se abre en otra pestaña.',
  cartelDeLaPieza: (nombre: string): string => `Click para ver ${nombre}`,
  cartelDeLaVisita: 'Click para visitar demo',
  cerrar: 'Cerrar la demo',
} as const
