import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { Contacto } from '../_chrome/contacto/Contacto'
import { LOGOTIPO } from '../_componentes/marca/sistema'
import { PaginaDeServicio } from '../_servicios/PaginaDeServicio'
import { servicioDe } from '../_servicios/datos/servicios'
import { PUBLICADOS, hrefDe } from '../_servicios/rutas'
import { esServicioSlug, type Servicio } from '../_servicios/tipos'

/**
 * LAS PÁGINAS DE SERVICIO — una sola ruta dinámica con parámetros estáticos (SPEC §4, plan §6 opción A). **[SERVICIOS S1b]**
 *
 * ── Qué publica ───────────────────────────────────────────────────────────
 *
 * Solo los slugs de `PUBLICADOS` (`_servicios/rutas.ts`). `generateStaticParams` sale de esa lista y `dynamicParams = false`
 * hace que cualquier otro valor sea 404; `servicioPublicado` lo repite con `notFound()`, así que un servicio con datos pero
 * sin publicar (`software-a-medida` hasta el S2) da 404 igual que `xyz`. Los segmentos estáticos de `/v3` (`componentes`,
 * `tipografia`, `motion`, …) le ganan a este dinámico del mismo nivel: siguen resolviendo.
 *
 * ── Qué monta ─────────────────────────────────────────────────────────────
 *
 * El template, y como HERMANO —no adentro— el modal de contacto: la raíz del template es invertida (noche), y el modal conserva
 * así sus tokens de papel y su acento por defecto. Es la misma estructura que el home (`v3/page.tsx`). Sin `ChromeDelHome`
 * (D4): su barra arma enlaces relativos que en una subruta no llevan a ninguna parte (P-H3).
 *
 * ── La metadata (mínima; el resto del SEO es del S3) ──────────────────────
 *
 * `title` y `description` de los datos, `noindex` como todo /v3 (D12). El layout raíz fija `alternates.canonical` y
 * `openGraph.url` al home, y Next combina la metadata de forma SUPERFICIAL: un hijo que no los pise los hereda. Acá se pisan
 * los dos con la dirección de la propia página. `openGraph` se reemplaza entero, así que se rearma con lo del padre (las
 * imágenes) en vez de dejarlo a medias.
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
  const direccion = hrefDe(servicio.slug)
  const { openGraph } = await padre
  return {
    title: servicio.seo.title,
    description: servicio.seo.description,
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: direccion },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      siteName: LOGOTIPO,
      url: direccion,
      title: servicio.seo.title,
      description: servicio.seo.description,
      images: openGraph?.images ?? [],
    },
  }
}

export default async function PaginaDeUnServicio({ params }: PropiedadesDeLaPagina): Promise<React.JSX.Element> {
  const servicio = await servicioPublicado(params)
  return (
    <>
      <PaginaDeServicio servicio={servicio} />
      <Contacto />
    </>
  )
}
