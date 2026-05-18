'use client'

import { AdminErrorBoundary } from '../../_components/AdminErrorBoundary'

export default function ClientDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AdminErrorBoundary error={error} reset={reset} context="el cliente" />
  )
}
