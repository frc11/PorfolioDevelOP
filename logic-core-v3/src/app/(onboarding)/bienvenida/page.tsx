import { resolveOrgId, isAdminPreview } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function BienvenidaPage() {
  const organizationId = await resolveOrgId()
  const preview = await isAdminPreview()
  
  if (!organizationId) redirect('/login')

  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { companyName: true, onboardingCompleted: true },
  })

  // Si ya lo completó y no es admin preview, sacarlo para evitar bugs de volver atrás
  if (!client || (client.onboardingCompleted && !preview)) {
    redirect('/dashboard')
  }

  return <OnboardingWizard companyName={client.companyName} />
}
