import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId, isAdminPreview } from '@/lib/preview'
import { ProfileForm, PasswordForm } from '@/components/dashboard/ProfileForms'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { Building2, Lock, Eye } from 'lucide-react'

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
  const organizationId = await resolveOrgId()
  const preview = await isAdminPreview()

  if (!organizationId) redirect('/login')

  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { companyName: true, logoUrl: true },
  })

  if (!client) redirect('/login')

  // In preview mode, show org data but use the primary member's info (read-only)
  if (preview) {
    const member = await prisma.orgMember.findFirst({
      where: { organizationId },
      include: { user: { select: { name: true, email: true } } },
    })

    return (
      <div className="flex flex-col gap-6">
        <FadeIn>
          <div>
            <h1 className="text-xl font-semibold text-white">Mi perfil</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Gestioná los datos de tu cuenta y empresa
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            className="flex items-start gap-3 rounded-xl px-5 py-4"
            style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)' }}
          >
            <Eye size={15} className="mt-0.5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">Modo preview</p>
              <p className="mt-0.5 text-xs text-amber-400/70">
                Estás viendo el perfil del cliente. La edición no está disponible en modo preview.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Section title="Datos de empresa y contacto" icon={Building2}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Empresa</dt>
                <dd className="mt-1 text-sm text-zinc-200">{client.companyName}</dd>
              </div>
              {member?.user && (
                <>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Contacto</dt>
                    <dd className="mt-1 text-sm text-zinc-200">{member.user.name ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Email</dt>
                    <dd className="mt-1 text-sm text-zinc-200">{member.user.email}</dd>
                  </div>
                </>
              )}
            </dl>
          </Section>
        </FadeIn>
      </div>
    )
  }

  // Normal client flow
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  if (!user) redirect('/login')

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
