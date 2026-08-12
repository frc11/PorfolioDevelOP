import type { NextConfig } from "next";

const nextConfig = {
  // ── Directorio de build parametrizable (solo para suites de test) ──────────
  // Por qué aparte: `next build`/`next start`/`next dev` escriben todos en el
  // MISMO directorio de build. El recurso compartido es el directorio, NO el
  // puerto — cambiar de puerto no evita nada. Cuando la suite del setter
  // buildeaba en `.next/` con un `next dev` vivo sobre este checkout, pasaban
  // las dos cosas: la suite leía artefactos mezclados (estáticos servidos con
  // el Content-Type equivocado, 500s) y le reconstruía el directorio por debajo
  // al dev server, rompiéndole el trabajo al otro frente. Next mismo lo nombra:
  // toma un lock en `<distDir>/lock` porque dos procesos escribiendo el mismo
  // distDir "can mangle the state of the directory".
  //
  // Sin la variable seteada el valor es `.next` → el build por defecto, el dev
  // server y `start:qa` NO cambian de comportamiento. Solo `start:setter` la
  // setea (ver package.json).
  //
  // Si alguien lo vuelve a unificar (borra esta línea o hace que la suite
  // buildee en `.next`): vuelven los dos síntomas de arriba, y vuelven en
  // silencio — la suite no falla por "directorio compartido", falla con errores
  // de MIME type y 500s que parecen bugs de producto. La doc de Next exige
  // además que el directorio NO salga del proyecto (`../build` es inválido).
  distDir: process.env.E2E_DIST_DIR ?? '.next',
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@prisma/client',
    'require-in-the-middle',
    'import-in-the-middle',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async headers() {
    return [
      // ── Global security headers (SEC-MISC-01) ──────────────────────────────
      // Applied to every response. Does NOT include X-Frame-Options globally
      // because /embed/* routes must be embeddable — that header lives in the
      // admin/dashboard block below.
      {
        source: '/:path*',
        headers: [
          // HSTS: instruct browsers to always use HTTPS (Netlify enforces it
          // server-side, this declares it to the browser for preload eligibility).
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Prevent MIME-type sniffing attacks.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Avoid leaking internal URL paths in Referer headers to third parties.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features the app does not use.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // CSP in report-only mode while we audit violations.
          // Tighten to enforcement (Content-Security-Policy) after 1–2 weeks
          // of confirming no unexpected blocks in the browser console.
          // 'unsafe-inline' + 'unsafe-eval' are required by Next.js 16 without
          // nonce — remove them once nonce injection is in place.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https: wss:",
              "font-src 'self' data: https:",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // ── Clickjacking protection for authenticated routes ───────────────────
      // /embed/* is intentionally excluded — those routes must be iframeable.
      {
        source: '/(admin|dashboard)(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      // ── Widget JS ─────────────────────────────────────────────────────────
      {
        source: '/widget.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' },
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // ── Chatbot embed iframe ───────────────────────────────────────────────
      {
        // Allow any site to embed the chatbot in an iframe.
        // R18 will restrict to a whitelist of allowed origins.
        source: '/embed/:slug*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // P1.D — La vista legacy /dashboard/leads se unificó en "Mis contactos".
      // La ruta ya no existe; el redirect permanente preserva bookmarks viejos.
      {
        source: '/dashboard/leads',
        destination: '/dashboard/chatbot/leads',
        permanent: true,
      },
      // Módulos premium → catálogo unificado
      {
        source: '/dashboard/agenda',
        destination: '/dashboard/services?modulo=agenda-inteligente',
        permanent: true,
      },
      {
        source: '/dashboard/automations',
        destination: '/dashboard/services',
        permanent: true,
      },
      {
        source: '/dashboard/crm',
        destination: '/dashboard/services?modulo=mini-crm',
        permanent: true,
      },
      {
        source: '/dashboard/ecommerce',
        destination: '/dashboard/services?modulo=tienda-conectada',
        permanent: true,
      },
      {
        source: '/dashboard/email-automation',
        destination: '/dashboard/services?modulo=email-marketing-pro',
        permanent: true,
      },
      {
        source: '/dashboard/email-nurturing',
        destination: '/dashboard/services?modulo=email-marketing-pro',
        permanent: true,
      },
      {
        source: '/dashboard/resenias',
        destination: '/dashboard/services?modulo=motor-resenas',
        permanent: true,
      },
      {
        source: '/dashboard/social',
        destination: '/dashboard/services',
        permanent: true,
      },
      {
        source: '/dashboard/whatsapp',
        destination: '/dashboard/services?modulo=whatsapp-autopilot',
        permanent: true,
      },

      // Rutas obsoletas
      {
        source: '/dashboard/client-portal',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard/configuracion/pixel',
        destination: '/dashboard/services',
        permanent: true,
      },
      {
        source: '/dashboard/pixel',
        destination: '/dashboard/services',
        permanent: true,
      },
      {
        source: '/dashboard/seo-avanzado',
        destination: '/dashboard/seo',
        permanent: true,
      },
      {
        source: '/dashboard/notificaciones',
        destination: '/dashboard',
        permanent: true,
      },

      // Consolidación de cuenta
      {
        source: '/dashboard/profile',
        destination: '/dashboard/cuenta/perfil',
        permanent: true,
      },
      {
        source: '/dashboard/facturacion',
        destination: '/dashboard/cuenta/facturacion',
        permanent: true,
      },
      {
        source: '/dashboard/vault',
        destination: '/dashboard/cuenta/boveda',
        permanent: true,
      },

      // Consolidación de resultados
      {
        source: '/dashboard/analytics',
        destination: '/dashboard/resultados/trafico',
        permanent: true,
      },
      {
        source: '/dashboard/seo',
        destination: '/dashboard/resultados/seo',
        permanent: true,
      },
    ]
  },
};

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: "develop-agency",
  project: "logic-core-v3",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
