/**
 * INVARIANTE — el SEO de las páginas de servicio: metadata y JSON-LD. **[SERVICIOS S3]**
 *
 * Corre a mano (P-H7): `npx tsx src/app/v3/_servicios/__tests__/seo.invariant.ts`.
 *
 * Sin navegador y sin renderizar: `seo.ts` son funciones puras de los datos. Cada comprobación lleva su control positivo (el mismo
 * detector, contra una entrada armada para fallar). Que el JSON-LD llegue al HTML lo afirma `pagina.invariant.tsx`.
 *
 * [L7a] REEMPLAZADA POR LA SPEC (no aflojada): el FAQ pasó al cierre común (`CierreDeLaPagina` → `FaqDelPie`), que publica su `FAQPage`
 * con las 6 preguntas de la página; `jsonLdDe` ya no lo repite (§2: un solo `FAQPage` por página).
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Metadata } from 'next'

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { SERVICIOS } from '../datos/servicios'
import { precioDesde } from '../precios'
import { HREF_DEL_HOME, ORIGEN_DEL_SITIO, hrefDe, urlAbsolutaDe } from '../rutas'
import { jsonLdDe, metadataDe, serializarJsonLd, type DocumentoJsonLd, type ValorJson } from '../seo'
import type { Servicio } from '../tipos'
import { sinComentarios } from './pagina-detectores'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const PRIMERO = SERVICIOS.at(0)
if (PRIMERO === undefined) throw new Error('SERVICIOS está vacío')
const documentoDe = (servicio: Servicio, tipo: string): DocumentoJsonLd | undefined => jsonLdDe(servicio).find((d) => d['@type'] === tipo)
const objeto = (valor: ValorJson | undefined): { readonly [clave: string]: ValorJson } | null =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor) ? (valor as { readonly [clave: string]: ValorJson }) : null
const lista = (valor: ValorJson | undefined): readonly ValorJson[] => (Array.isArray(valor) ? valor : [])

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El JSON-LD se parsea y tiene los tipos esperados')

const parseaIgual = (documento: DocumentoJsonLd): boolean => {
  try {
    return JSON.stringify(JSON.parse(serializarJsonLd(documento))) === JSON.stringify(documento)
  } catch {
    return false
  }
}
for (const servicio of SERVICIOS) {
  const docs = jsonLdDe(servicio)
  afirmarIgual(docs.map((d) => d['@type']), ['Service', 'BreadcrumbList'], `${servicio.slug}: Service y BreadcrumbList, en ese orden`)
  afirmar(docs.every((d) => d['@context'] === 'https://schema.org' && parseaIgual(d)), '  todos con su @context, y serializados y vueltos a leer dan lo mismo')
}
const parseaYTipo = (texto: string): boolean => {
  try {
    return typeof JSON.parse(texto)['@type'] === 'string'
  } catch {
    return false
  }
}
controlPositivo('un JSON roto se detecta', '{"@type":"Service"', parseaYTipo)
controlPositivo('un JSON sin @type se detecta', '{"name":"x"}', parseaYTipo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · [L7a] Un solo FAQPage por página: lo publica el cierre común, no seo.ts')

const conFaqPage = (docs: readonly DocumentoJsonLd[]): boolean => docs.some((d) => d['@type'] === 'FAQPage')
afirmar(SERVICIOS.every((s) => !conFaqPage(jsonLdDe(s))), 'ningún servicio repite el FAQPage en su JSON-LD (lo pone FaqDelPie, con las mismas preguntas que se leen)')
controlPositivo('un JSON-LD con su propio FAQPage se detecta', [...jsonLdDe(PRIMERO), { '@context': 'https://schema.org', '@type': 'FAQPage' }], (d: readonly DocumentoJsonLd[]) => !conFaqPage(d))
const seisConRespuesta = (s: Servicio): boolean => s.faq.length === 6 && s.faq.every((f) => f.pregunta.trim() !== '' && f.respuesta.trim() !== '')
afirmar(SERVICIOS.every(seisConRespuesta), '  y cada servicio trae sus 6 preguntas con respuesta (las del FAQ del cierre)')
controlPositivo('  uno con cinco se detecta', { ...PRIMERO, faq: PRIMERO.faq.slice(0, 5) }, seisConRespuesta)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El escape: un texto no puede cerrar el script')

const PELIGRO = '</script><img src=x onerror=alert(1)> & \u2028 \u2029'
const seguro = serializarJsonLd({ texto: PELIGRO })
afirmar(!/[<>&\u2028\u2029]/.test(seguro), 'ni `<`, ni `>`, ni `&`, ni los separadores de línea de Unicode quedan sin escapar')
afirmarIgual(JSON.parse(seguro), { texto: PELIGRO }, '  y al leerlo vuelve el texto idéntico')
afirmar(seguro.includes('\\u003c/script\\u003e'), '  `</script>` sale como \\u003c/script\\u003e')
controlPositivo('el JSON sin escapar sí cierra el script', JSON.stringify({ texto: PELIGRO }), (j: string) => !j.includes('</script>'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · «develOP» no se escribe suelto en seo.ts (D10)')

const CODIGO_DE_SEO = sinComentarios(readFileSync(path.join(AQUI, '../seo.ts'), 'utf8'))
const conLaMarcaSuelta = (codigo: string): boolean => /develop/i.test(codigo)
afirmar(!conLaMarcaSuelta(CODIGO_DE_SEO), 'el código de seo.ts no tiene la palabra de la marca: sale de LOGOTIPO')
controlPositivo('un texto con la palabra suelta se detecta', "const proveedor = 'develOP'", (c: string) => !conLaMarcaSuelta(c))
afirmar(jsonLdDe(PRIMERO).some((d) => objeto(d.provider)?.name === LOGOTIPO), 'y el proveedor del Service es la marca importada')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Las URLs son absolutas y salen de rutas.ts')

for (const servicio of SERVICIOS) {
  const migas = lista(documentoDe(servicio, 'BreadcrumbList')?.itemListElement).map((m) => objeto(m))
  afirmarIgual(migas.map((m) => [m?.position, m?.item]), [[1, urlAbsolutaDe(HREF_DEL_HOME)], [2, urlAbsolutaDe(hrefDe(servicio.slug))]], `${servicio.slug}: migas Inicio › servicio, con las URLs armadas desde rutas.ts`)
  const del = documentoDe(servicio, 'Service')
  afirmarIgual([del?.url, objeto(del?.provider)?.url], [urlAbsolutaDe(hrefDe(servicio.slug)), urlAbsolutaDe(HREF_DEL_HOME)], '  y el Service apunta a su página y su proveedor al home')
}
const absoluta = (url: string): boolean => url.startsWith(`${ORIGEN_DEL_SITIO}/`)
afirmar(SERVICIOS.every((s) => lista(documentoDe(s, 'BreadcrumbList')?.itemListElement).every((m) => absoluta(String(objeto(m)?.item)))), 'toda URL de las migas empieza con el origen del sitio')
controlPositivo('una URL relativa se detecta', '/v3/paginas-web', absoluta)
const LAYOUT = readFileSync(path.join(AQUI, '../../../layout.tsx'), 'utf8')
const origenDelLayout = (fuente: string): string | null => /metadataBase:\s*new URL\(["']([^"']+)["']\)/.exec(fuente)?.[1] ?? null
afirmarIgual(origenDelLayout(LAYOUT), ORIGEN_DEL_SITIO, 'ORIGEN_DEL_SITIO es el metadataBase del layout raíz: las migas absolutas y el canonical resuelven contra el mismo origen')
controlPositivo('otro origen se detecta', LAYOUT.replace('https://develop.com.ar', 'https://otro.example'), (f: string) => origenDelLayout(f) === ORIGEN_DEL_SITIO)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El «desde» es el de precioDesde, en USD, y mensual en IA')

const especificacion = (servicio: Servicio): { readonly [clave: string]: ValorJson } | null => objeto(objeto(documentoDe(servicio, 'Service')?.offers)?.priceSpecification)
for (const servicio of SERVICIOS) {
  const { usd, periodo } = precioDesde(servicio.slug)
  const esperado = periodo === 'mensual'
    ? { '@type': 'UnitPriceSpecification', minPrice: usd, priceCurrency: 'USD', unitCode: 'MON' }
    : { '@type': 'PriceSpecification', minPrice: usd, priceCurrency: 'USD' }
  afirmarIgual(especificacion(servicio), esperado, `${servicio.slug}: ${periodo === 'mensual' ? 'mensual (UnitPriceSpecification, MON)' : 'único (PriceSpecification)'}, minPrice ${usd} USD`)
}
const delSpec = (spec: { readonly [clave: string]: ValorJson } | null, servicio: Servicio): boolean => spec?.minPrice === precioDesde(servicio.slug).usd
controlPositivo('un minPrice escrito a mano y distinto se detecta', { minPrice: 1 }, (spec: { readonly [clave: string]: ValorJson }) => delSpec(spec, PRIMERO))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La metadata: título y descripción de los datos, noindex y la dirección propia')

for (const servicio of SERVICIOS) {
  const meta = metadataDe(servicio)
  const robots = typeof meta.robots === 'object' && meta.robots !== null && !(meta.robots instanceof URL) ? meta.robots : null
  afirmar(meta.title === servicio.seo.title && meta.description === servicio.seo.description, `${servicio.slug}: title y description salen de los datos`)
  afirmar(robots !== null && 'index' in robots && robots.index === false && 'follow' in robots && robots.follow === false, '  robots: noindex y nofollow, como todo /v3')
  afirmar(meta.alternates?.canonical === hrefDe(servicio.slug) && meta.openGraph?.url === hrefDe(servicio.slug), '  canonical y openGraph.url son los de SU página, no los del home')
  afirmar(meta.openGraph?.siteName === LOGOTIPO && meta.openGraph?.title === servicio.seo.title, '  y el openGraph se rearma completo (siteName, title, description)')
}
for (const servicio of SERVICIOS) {
  const meta = metadataDe(servicio)
  afirmar(meta.twitter?.title === servicio.seo.title && meta.twitter?.description === servicio.seo.description, `${servicio.slug}: twitter lleva el title y la description de SUS datos (sin esto hereda los del home)`)
}
const tarjetaDe = (meta: Metadata): string | undefined => {
  const twitter = meta.twitter
  return twitter !== null && twitter !== undefined && 'card' in twitter ? twitter.card : undefined
}
afirmarIgual(tarjetaDe(metadataDe(PRIMERO)), 'summary_large_image', 'twitter: la tarjeta grande, como la del layout raíz')
afirmarIgual(metadataDe(PRIMERO, ['/imagen.png'], ['/tarjeta.png']).twitter?.images, ['/tarjeta.png'], 'las imágenes de twitter del padre pasan tal cual (se reemplaza entero)')
controlPositivo('una metadata sin twitter propio (hereda el del home) se detecta', { ...metadataDe(PRIMERO), twitter: undefined } as Metadata, (m: Metadata) => m.twitter?.title === PRIMERO.seo.title)
afirmarIgual(metadataDe(PRIMERO, ['/imagen.png']).openGraph?.images, ['/imagen.png'], 'las imágenes del padre pasan tal cual al openGraph (se reemplaza entero)')
controlPositivo('un canonical al home se detecta', { ...metadataDe(PRIMERO), alternates: { canonical: urlAbsolutaDe(HREF_DEL_HOME) } }, (m) => m.alternates?.canonical === hrefDe(PRIMERO.slug))

cerrar('servicios-seo')
