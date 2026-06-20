'use server'

import {
  startImpersonationAction as startImpersonationActionBase,
  stopImpersonationAction as stopImpersonationActionBase,
} from '@/lib/actions/impersonation'

export async function startImpersonationAction(organizationId: string) {
  return startImpersonationActionBase(organizationId)
}

export async function stopImpersonationAction() {
  return stopImpersonationActionBase()
}
