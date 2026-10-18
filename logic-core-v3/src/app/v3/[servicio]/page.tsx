import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { Contacto } from '../_chrome/contacto/Contacto'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'
import { PaginaDeServicio } from '../_servicios/PaginaDeServicio'
import { servicioDe } from '../_servicios/datos/servicios'
import { PUBLICADOS } from '../_servicios/rutas'
import { metadataDe } from '../_servicios/seo'
import { esServicioSlug, type Servicio } from '../_servicios/tipos'

/**
 * LAS PÁGINAS DE SERVICIO — una sola ruta dinámica con parámetros estáticos (SPEC §4, plan §6 opción A). **[SERVICIOS S1b]**
 *
 * ── Qué publica ───────────────────────────────────────────────────────────
 *
 * Solo los slugs de `PUBLICADOS` (`_servicios/rutas.ts`). `generateStaticParams` sale de esa lista y `dynamicParams = false`
 * hace que cualquier otro valor sea 404; `servicioPublicado` lo repite con `notFound()`, así que un servicio con datos pero
 * fuera de la lista (hasta el S2b lo era `software-a-medida`) da 404 igual que `xyz`. Desde el S2b están los tres. Los segmentos
 * estáticos de `/v3` (`componentes`, `tipografia`, `motion`, …) le ganan a este dinámico del mismo nivel: siguen resolviendo.
 *
 * ── Qué monta ─────────────────────────────────────────────────────────────
 *
 * El template, dentro de la compuerta de la coreografía del home (`CompuertaDelHome`, la misma de `v3/page.tsx`: instala los
 * patrones de revelado arriba de 1024 y deja el contenido quieto por debajo o con movimiento reducido), y como HERMANO —no
 * adentro— el modal de contacto: la raíz del template es invertida (noche), y el modal conserva así sus tokens de papel y su
 * acento por defecto. Sin `ChromeDelHome` (D4): su barra arma enlaces relativos que en una subruta no llevan a ninguna parte
 * (P-H3).
 *
 * ── La metadata ───────────────────────────────────────────────────────────
 *
 * La arma `metadataDe` (`_servicios/seo.ts`): `title` y `description` de los datos, `noindex` como todo /v3 (D12) y la dirección
 * de la propia página en `alternates.canonical` y `openGraph.url`, que el layout raíz fija al home (Next combina de forma
 * SUPERFICIAL: un hijo que no los pise los hereda). `openGraph` se reemplaza entero, así que acá se le pasan las imágenes del
 * padre. El JSON-LD va en el template (`JsonLd`).
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
  return (
    <>
      <CompuertaDelHome>
        <PaginaDeServicio servicio={servicio} />
      </CompuertaDelHome>
      <Contacto />
    </>
  )
}
