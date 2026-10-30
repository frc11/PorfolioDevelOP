/**
 * [SERVICIOS S3] EL SEO DE CADA PÁGINA — la metadata y el JSON-LD (SPEC §8, plan §7).
 *
 * Funciones puras de los datos: sin react, sin next en runtime (de `next` entra solo el TIPO `Metadata`) y sin DOM, así que se
 * prueban con `npx tsx` (`seo.invariant.ts`). La marca sale de `LOGOTIPO`: «develOP» no se escribe suelta acá (D10).
 *
 * ── La metadata ───────────────────────────────────────────────────────────
 * `title` y `description` de los datos, `noindex` como todo /v3 (D12) y la dirección de la PROPIA página. Next combina la metadata
 * de forma superficial: el layout raíz fija `alternates.canonical` y `openGraph.url` al home, y un hijo que no los pise los hereda.
 * `openGraph` se reemplaza entero, así que se rearma completo y con las imágenes del padre (las recibe, no las escribe).
 *
 * ── El JSON-LD ────────────────────────────────────────────────────────────
 * Dos documentos: `Service` (con el proveedor y el «desde» como `priceSpecification` mínima, mensual en IA) y `BreadcrumbList` (Inicio ›
 * Servicio). [L7a] El `FAQPage` lo publica el FAQ del cierre común (`FaqDelPie`), con las 6 de la página. Las URLs son absolutas y se
 * arman con `rutas.ts`. El «desde» sale de `precioDesde`, la misma fuente que le da los números a la sección Servicios del home.
 */

import type { Metadata } from 'next'

import { LOGOTIPO } from '../_componentes/marca/sistema'
import { precioDesde } from './precios'
import { HREF_DEL_HOME, hrefDe, urlAbsolutaDe } from './rutas'
import type { Servicio } from './tipos'

/** JSON puro: lo único que puede viajar en un `<script type="application/ld+json">`. */
export type ValorJson = string | number | boolean | null | readonly ValorJson[] | { readonly [clave: string]: ValorJson }
export type DocumentoJsonLd = { readonly [clave: string]: ValorJson }

const CONTEXTO = 'https://schema.org'
const NOMBRE_DEL_INICIO = 'Inicio' // C2: provisorio (SPEC §8: «Breadcrumb Home › Servicio»)

type ImagenesDeOpenGraph = NonNullable<Metadata['openGraph']>['images']
type ImagenesDeTwitter = NonNullable<Metadata['twitter']>['images']

export function metadataDe(
  servicio: Servicio,
  imagenesDelPadre: ImagenesDeOpenGraph = [],
  imagenesDeTwitterDelPadre: ImagenesDeTwitter = [],
): Metadata {
  const direccion = hrefDe(servicio.slug)
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
      images: imagenesDelPadre,
    },
    // `twitter` también se reemplaza entero: sin esto hereda el título y la descripción del home.
    twitter: {
      card: 'summary_large_image',
      title: servicio.seo.title,
      description: servicio.seo.description,
      images: imagenesDeTwitterDelPadre,
    },
  }
}

/** El «desde» como `priceSpecification` mínima en USD: `minPrice`, y el mes cuando el precio es mensual. */
function especificacionDelPrecio(servicio: Servicio): DocumentoJsonLd {
  const { usd, periodo } = precioDesde(servicio.slug)
  return periodo === 'mensual'
    ? { '@type': 'UnitPriceSpecification', minPrice: usd, priceCurrency: 'USD', unitCode: 'MON' }
    : { '@type': 'PriceSpecification', minPrice: usd, priceCurrency: 'USD' }
}

function documentoDelServicio(servicio: Servicio): DocumentoJsonLd {
  return {
    '@context': CONTEXTO,
    '@type': 'Service',
    name: servicio.nombre,
    description: servicio.seo.description,
    url: urlAbsolutaDe(hrefDe(servicio.slug)),
    provider: { '@type': 'Organization', name: LOGOTIPO, url: urlAbsolutaDe(HREF_DEL_HOME) },
    offers: { '@type': 'Offer', priceSpecification: especificacionDelPrecio(servicio) },
  }
}

function documentoDeLasMigas(servicio: Servicio): DocumentoJsonLd {
  return {
    '@context': CONTEXTO,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: NOMBRE_DEL_INICIO, item: urlAbsolutaDe(HREF_DEL_HOME) },
      { '@type': 'ListItem', position: 2, name: servicio.nombre, item: urlAbsolutaDe(hrefDe(servicio.slug)) },
    ],
  }
}

/** Los documentos de la página, en este orden: el servicio y las migas. [L7a] El `FAQPage` lo publica el FAQ del cierre común: acá no se repite. */
export function jsonLdDe(servicio: Servicio): readonly DocumentoJsonLd[] {
  return [documentoDelServicio(servicio), documentoDeLasMigas(servicio)]
}

/**
 * Lo que no puede ir suelto en un `<script>`: `<`, `>`, `&` y los dos separadores de línea de Unicode. Los separadores se arman por
 * su código y no se escriben, para que ningún editor ni herramienta los convierta en un salto de línea de verdad en el fuente.
 */
const A_ESCAPAR = new RegExp(`[<>&${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, 'g')

/**
 * El JSON de un `<script type="application/ld+json">`, a salvo: cada carácter de `A_ESCAPAR` va como escape Unicode de cuatro
 * dígitos, que JSON lee igual. Sin esto, un `</script>` adentro de un texto cierra la etiqueta y lo que sigue es HTML.
 */
export function serializarJsonLd(valor: ValorJson): string {
  return JSON.stringify(valor).replace(A_ESCAPAR, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
}
