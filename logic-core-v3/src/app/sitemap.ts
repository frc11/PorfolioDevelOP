import type { MetadataRoute } from 'next'

// Solo las seis rutas PÚBLICAS del sitio. Nada de `(protected)` —admin,
// dashboard, setter—, ni las rutas de sesión (login, accept-invite,
// forgot/reset-password, cambiar-password, bienvenida), ni `/api`, `/embed`
// ni `/styleguide`, que es una página interna del rediseño.
// La base sale del mismo dominio que declara `metadataBase` en el layout raíz.
const BASE_URL = 'https://develop.com.ar'

const RUTAS_PUBLICAS = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/web-development', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/ai-implementations', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/process-automation', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/software-development', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
] as const satisfies ReadonlyArray<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}>

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return RUTAS_PUBLICAS.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
