'use server'

import { auth } from '@/auth'
import { onboardClientCore } from '@/lib/onboarding/core'

interface BulkImportRow {
  organizationName: string
  userEmail: string
  userName: string
  industry: string
  city: string
  whatsappNumber: string
  website?: string
  userPhone?: string
}

interface BulkImportResult {
  row: number
  email: string
  status: 'success' | 'error'
  error?: string
}

export async function bulkImportClientsAction(
  rows: BulkImportRow[],
): Promise<{ ok: boolean; results: BulkImportResult[] }> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false, results: [] }
  }

  const results: BulkImportResult[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      await onboardClientCore({
        organizationName: row.organizationName,
        userEmail: row.userEmail,
        userName: row.userName,
        industry: row.industry,
        city: row.city,
        whatsappNumber: row.whatsappNumber || null,
        website: row.website || null,
        userPhone: row.userPhone || null,
        adminUserId: session.user.id,
        adminUserEmail: session.user.email,
        adminUserName: session.user.name,
      })
      results.push({ row: i + 2, email: row.userEmail, status: 'success' })
    } catch (error) {
      results.push({
        row: i + 2,
        email: row.userEmail,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  return { ok: true, results }
}
