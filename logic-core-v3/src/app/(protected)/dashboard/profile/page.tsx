import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileForm, PasswordForm } from '@/components/dashboard/ProfileForms'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { Building2, Lock } from 'lucide-react'

const CARD_STYLE = {
  border: '1px solid rgba(6,182,212,0.2)',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl p-5" style={CARD_STYLE}>
      <div
        className="mb-4 flex items-center gap-2 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Icon size={15} className="text-cyan-400" />
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default async function ProfilePage() {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  const userId = session?.user?.id
  if (!organizationId || !userId) redirect('/login')

  const [user, client] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true, logoUrl: true },
    }),
  ])

  if (!user || !client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">Mi perfil</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestioná los datos de tu cuenta y empresa
          </p>
        </div>
      </FadeIn>

      {/* Company + contact data */}
      <FadeIn delay={0.1}>
        <Section title="Datos de empresa y contacto" icon={Building2}>
          <ProfileForm
            name={user.name ?? ''}
            email={user.email ?? ''}
            companyName={client.companyName}
            logoUrl={client.logoUrl}
          />
        </Section>
      </FadeIn>

      {/* Password */}
      <FadeIn delay={0.2}>
        <Section title="Seguridad" icon={Lock}>
          <PasswordForm />
        </Section>
      </FadeIn>
    </div>
  )
}
