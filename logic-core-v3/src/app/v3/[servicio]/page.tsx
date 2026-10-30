import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { PaginaDeServicio } from '../_servicios/PaginaDeServicio'
import { servicioDe } from '../_servicios/datos/servicios'
import { PUBLICADOS } from '../_servicios/rutas'
import { metadataDe } from '../_servicios/seo'
import { esServicioSlug, type Servicio } from '../_servicios/tipos'

/**
 * LAS PÁGINAS DE SERVICIO — una sola ruta dinámica con parámetros estáticos. **[SERVICIOS S1b · L7a]**
 *
 * Publica sólo los slugs de `PUBLICADOS` (`_servicios/rutas.ts`): `generateStaticParams` sale de esa lista y `dynamicParams = false` hace
 * que cualquier otro valor sea 404 (`servicioPublicado` lo repite con `notFound()`). Los segmentos estáticos de `/v3` le ganan a este
 * dinámico del mismo nivel. [L7a] Los slugs no cambian (`paginas-web`, `software-a-medida`, `ia-y-automatizaciones`): los enlaces siguen.
 *
 * Monta la página del servicio (`PaginaDeServicio`: la intro, el cuerpo y el cierre de la base). [L7a] La navbar y el contacto los monta el
 * layout de `/v3` (`ChromeDelHome`): la ruta ya no los pone.
 *
 * La metadata la arma `metadataDe` (`_servicios/seo.ts`): `title` y `description` de los datos, `noindex` como todo /v3 y la dirección de
 * la propia página en `alternates.canonical` y `openGraph.url`. `openGraph` se reemplaza entero, así que se le pasan las imágenes del padre.
 */
export const dynamicParams = false

interface PropiedadesDeLaPagina {
  readonly params: Promise<{ readonly servicio: string }>
}

export function generateStaticParams(): { servicio: string }[] {
  return PUBLICADOS.map((servicio) => ({ servicio }))
}

/** El servicio de la URL, o 404. Un slug que no es de ningún servicio y uno que existe pero no está publicado dan lo mismo. */
async function servicioPublicado(params: PropiedadesDeLaPagina['params']): Promise<Servicio> {
  const { servicio } = await params
  if (!esServicioSlug(servicio) || !PUBLICADOS.includes(servicio)) notFound()
  return servicioDe(servicio)
}

export async function generateMetadata(
  { params }: PropiedadesDeLaPagina,
  padre: ResolvingMetadata,
): Promise<Metadata> {
  const servicio = await servicioPublicado(params)
  const { openGraph, twitter } = await padre
  return metadataDe(servicio, openGraph?.images ?? [], twitter?.images ?? [])
}

export default async function PaginaDeUnServicio({ params }: PropiedadesDeLaPagina): Promise<React.JSX.Element> {
  const servicio = await servicioPublicado(params)
  return <PaginaDeServicio servicio={servicio} />
}
