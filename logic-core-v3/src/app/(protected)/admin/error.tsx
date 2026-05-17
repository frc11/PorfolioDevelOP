'use client'

import { AdminErrorBoundary } from './_components/AdminErrorBoundary'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <AdminErrorBoundary error={error} reset={reset} context="el admin" />
}
