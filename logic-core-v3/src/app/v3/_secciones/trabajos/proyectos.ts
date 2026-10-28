/**
 * [B1] LOS PROYECTOS DEL PORTFOLIO — el dato tipado del selector lateral (plan: `docs/rediseno/SPRINT-B1-PORTFOLIO.md` §5.2 y §11.1).
 *
 * Lo que dice cada ficha lo dictó Valentino y se escribe con sus palabras, sin adornar. Lo que falta NO se inventa:
 *
 *   · `resultado` — no hay nada medible en estos trabajos y no lo va a haber (`contenido.ts`, la métrica cerrada): `null`, y la
 *     ficha no lo muestra.
 *   · las tres reseñas y el `problemaResuelto` de Esquina y de Banú — Valentino los va a pedir. Van por la llave del contenido
 *     inventado (`_contrato/inventado.ts`): con la llave prendida un texto de RELLENO (para ver la ficha completa), con la llave
 *     apagada el marcador visible (`[TEXTO]`, `[TESTIMONIO] · pendiente`, `[NOMBRE]`); cada uno está en el `PEDIDO` de la sección
 *     (`contenido.ts`) con su dueño. Cuando llegue el dato real, se escribe derecho acá y su casilla sale de la lista.
 *
 * El servicio va en el dato aunque la ficha no lo muestre mientras los tres digan lo mismo (`seMuestraElServicio`): cuando haya
 * variedad, aparece solo.
 *
 * Los medios (el video del recorrido y su póster, por dispositivo) salen del slug: los graba y los codifica `scripts-portfolio/`
 * y viven en `public/portfolio/<slug>/`. Sus rutas llevan la extensión del archivo, con un dígito, así que no entran a la vista de
 * contenido que escanea `s5-contenido` (`textosDelProyecto`).
 *
 * [B1.2b] El `logo` es la marca de agua de la tira: el logo del cliente bajado de su sitio en vivo (sólo GET; SVG si hay, si no el
 * PNG más grande) en `public/portfolio/<slug>/logo.*`. `null` si no salió limpio: va el nombre como marca de agua tipográfica hasta
 * que Valentino pase el archivo. Banú: el del sitio trae el fondo pegado; Valentino pasó uno, y sus letras se recortaron y se
 * vectorizaron a un SVG de silueta (plan §12.2).
 *
 * El orden es el del recorrido y lo fija la spec: El Garage, Esquina Estudio, Banú Scents.
 */

import { INVENTOS, conLlave } from '../_contrato/inventado'

export type SlugDelProyecto = 'el-garage' | 'esquina-estudio' | 'banu-scents'

export interface ResenaDelProyecto {
  readonly texto: string
  readonly autor: string
}

/** Un medio por dispositivo: el video del recorrido y su póster (el primer cuadro). */
export interface MediosDelProyecto {
  readonly video: { readonly escritorio: string; readonly movil: string }
  readonly poster: { readonly escritorio: string; readonly movil: string }
}

export interface ProyectoDelPortfolio {
  readonly slug: SlugDelProyecto
  readonly nombre: string
  readonly url: string
  readonly rubro: string | null
  readonly fecha: string | null
  readonly servicio: string | null
  readonly queHicimos: string | null
  readonly problemaCliente: string | null
  readonly problemaResuelto: string | null
  /** Sólo si es real. `null` → el campo no se muestra. */
  readonly resultado: string | null
  readonly resena: ResenaDelProyecto | null
  readonly medios: MediosDelProyecto
  /** [C2 · 40] El color de su «Visitar sitio»: el token de su marca en el tema (AA sobre la noche, medido allá). */
  readonly colorDeMarca: string
  /** [B1.2b] La marca de agua: el logo del cliente (sin fondo), o `null` (va el nombre). */
  readonly logo: string | null
  /** Lo que se ve en el video, para quien no lo ve. */
  readonly alt: string
}

/** Las rutas de los medios de un proyecto: `public/portfolio/<slug>/{escritorio,movil}.{mp4,webp}`. */
export function mediosDe(slug: SlugDelProyecto): MediosDelProyecto {
  const base = `/portfolio/${slug}`
  return {
    video: { escritorio: `${base}/escritorio.mp4`, movil: `${base}/movil.mp4` },
    poster: { escritorio: `${base}/escritorio.webp`, movil: `${base}/movil.webp` },
  }
}

const DESARROLLO_WEB = 'Desarrollo web'

export const PROYECTOS: readonly ProyectoDelPortfolio[] = [
  {
    slug: 'el-garage',
    nombre: 'El Garage',
    url: 'https://elgarageautomoviles.com.ar',
    rubro: 'Concesionaria',
    fecha: 'Marzo 2026',
    servicio: DESARROLLO_WEB,
    queHicimos: 'Un catálogo de muchos filtros.',
    problemaCliente: 'No tenía catálogo: los autos se le perdían entre las publicaciones de Facebook.',
    problemaResuelto: 'Con la página tienen todo ordenado.',
    resultado: null,
    resena: { texto: conLlave(INVENTOS.trabajosResenaDeElGarage), autor: conLlave(INVENTOS.trabajosAutorDeElGarage) },
    medios: mediosDe('el-garage'),
    colorDeMarca: 'var(--color-marca-el-garage)',
    logo: '/portfolio/el-garage/logo.png',
    alt: 'Recorrido por la página de El Garage: la portada, los últimos ingresos y el catálogo con sus filtros.',
  },
  {
    slug: 'esquina-estudio',
    nombre: 'Esquina Estudio',
    url: 'https://esquinaestudio.com.ar',
    rubro: 'Equipo de branding',
    fecha: 'Junio 2026',
    servicio: DESARROLLO_WEB,
    queHicimos: 'Una página acorde a su estética y su marca.',
    problemaCliente: 'No tenían presencia digital.',
    problemaResuelto: conLlave(INVENTOS.trabajosResueltoDeEsquina),
    resultado: null,
    resena: { texto: conLlave(INVENTOS.trabajosResenaDeEsquina), autor: conLlave(INVENTOS.trabajosAutorDeEsquina) },
    medios: mediosDe('esquina-estudio'),
    colorDeMarca: 'var(--color-marca-esquina-estudio)',
    logo: '/portfolio/esquina-estudio/logo.png',
    alt: 'Recorrido por la página de Esquina Estudio: la portada, los proyectos y los servicios.',
  },
  {
    slug: 'banu-scents',
    nombre: 'Banú Scents',
    url: 'https://banuscents.com.ar',
    rubro: 'Perfumes árabes',
    fecha: 'Abril 2026',
    servicio: DESARROLLO_WEB,
    queHicimos: 'Una página simple pero bonita.',
    problemaCliente: 'No tenían presencia digital.',
    problemaResuelto: conLlave(INVENTOS.trabajosResueltoDeBanu),
    resultado: null,
    resena: { texto: conLlave(INVENTOS.trabajosResenaDeBanu), autor: conLlave(INVENTOS.trabajosAutorDeBanu) },
    medios: mediosDe('banu-scents'),
    colorDeMarca: 'var(--color-marca-banu-scents)',
    logo: '/portfolio/banu-scents/logo.svg',
    alt: 'Recorrido por la página de Banú Scents: la portada, la selección de casas y los perfumes.',
  },
]

/** El servicio se muestra sólo cuando no todos los proyectos dicen lo mismo (sin bandera: con variedad, aparece). */
export function seMuestraElServicio(proyectos: readonly ProyectoDelPortfolio[]): boolean {
  return new Set(proyectos.map((p) => p.servicio).filter((s) => s !== null)).size > 1
}

/** La vista de CONTENIDO de un proyecto: sus textos, sin los medios, el logo ni el color (rutas y tokens, no texto). */
export function textosDelProyecto(p: ProyectoDelPortfolio): Omit<ProyectoDelPortfolio, 'medios' | 'logo' | 'colorDeMarca'> {
  return {
    slug: p.slug, nombre: p.nombre, url: p.url, rubro: p.rubro, fecha: p.fecha, servicio: p.servicio, queHicimos: p.queHicimos,
    problemaCliente: p.problemaCliente, problemaResuelto: p.problemaResuelto, resultado: p.resultado, resena: p.resena, alt: p.alt,
  }
}
