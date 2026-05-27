'use client'

import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary'

interface AdminErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  // Slug del segmento admin. Va al logger como metadata para correlacionar
  // (NO se muestra al cliente). Ej: 'admin.clients', 'admin.tickets'.
  context?: string
}

// B12.1 — Wrapper sobre SectionErrorBoundary para no romper los 10 imports
// existentes de admin/**/error.tsx. La implementación real (logger + UI
// digna sin error.message crudo + TODO Sentry) vive en el base compartido.
export function AdminErrorBoundary({ error, reset, context }: AdminErrorBoundaryProps) {
  return (
    <SectionErrorBoundary
      error={error}
      reset={reset}
      section={context ? `admin.${context}` : 'admin'}
      tone="cyan"
    />
  )
}
