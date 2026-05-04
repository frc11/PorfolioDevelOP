import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async redirects() {
    return [
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

export default nextConfig;
