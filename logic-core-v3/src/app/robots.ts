import type { MetadataRoute } from 'next'

const BASE_URL = 'https://develop.com.ar'

// Verificado contra la estructura real de `src/app/`: el grupo `(protected)`
// contiene admin, dashboard y setter; el resto de lo bloqueado son las rutas
// de sesión, la API y los embebibles.
//
// `/styleguide` NO va acá: ya lleva `noindex` en su metadata y no está linkeada
// desde ningún lado. Dos mecanismos diciendo lo mismo solo agregan deriva.
const RUTAS_BLOQUEADAS = [
  // grupo (protected)
  '/admin',
  '/dashboard',
  '/setter',
  // superficie técnica
  '/api/',
  '/embed/',
  // sesión y alta de cuenta
  '/login',
  '/accept-invite',
  '/forgot-password',
  '/reset-password',
  '/cambiar-password',
  '/bienvenida',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: RUTAS_BLOQUEADAS,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
