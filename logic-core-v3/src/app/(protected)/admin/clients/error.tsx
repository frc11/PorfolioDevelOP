'use client'

import { AdminErrorBoundary } from '../_components/AdminErrorBoundary'

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <AdminErrorBoundary error={error} reset={reset} context="clientes" />
}
