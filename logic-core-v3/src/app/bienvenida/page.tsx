import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { redirect } from 'next/navigation'
import { BienvenidaWizard } from './_components/BienvenidaWizard'

export const dynamic = 'force-dynamic'

export default async function BienvenidaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      companyName: true,
      onboardingCompleted: true,
      whatsapp: true,
    },
  })

  if (!org) redirect('/login')

  // Si ya completó onboarding, llevarlo al dashboard
  if (org.onboardingCompleted && org.companyName?.trim()) {
    redirect('/dashboard')
  }

  return (
    <BienvenidaWizard
      organizationId={org.id}
      initialData={{
        companyName: org.companyName ?? '',
        contactEmail: session.user.email ?? '', // Fallback to user email since contactEmail is missing in org
        whatsapp: org.whatsapp ?? '',
      }}
    />
  )
}
