import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId, isAdminPreview } from '@/lib/preview'
import {
  ProfileHeader,
  CompanyDataForm,
  ContactSection,
  PasswordForm,
  NotificationPrefsForm,
  PlanInfoSection,
  DangerZone,
} from '@/components/dashboard/ProfileForms'
import { FadeIn } from '@/components/dashboard/FadeIn'
import {
  Building2,
  Phone,
  Lock,
  Bell,
  CreditCard,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import type { NotificationPrefs } from '@/lib/actions/profile'

// ─── Styles ───────────────────────────────────────────────────────────────────

const GLASS: React.CSSProperties = {
  border: '1px solid rgba(6,182,212,0.14)',
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const GLASS_RED_SOFT: React.CSSProperties = {
  border: '1px solid rgba(239,68,68,0.1)',
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const GLASS_RED_STRONG: React.CSSProperties = {
  border: '1px solid rgba(239,68,68,0.2)',
  background: 'rgba(239,68,68,0.03)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  style = GLASS,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className="rounded-xl p-5" style={style}>
      <div
        className="mb-5 flex items-center gap-2 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {icon}
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Default notification prefs ───────────────────────────────────────────────

const DEFAULT_PREFS: NotificationPrefs = {
  projectUpdates: true,
  teamMessages: true,
  metricAlerts: true,
  developNews: false,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const preview = await isAdminPreview()

  if (!organizationId) redirect('/login')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      companyName: true,
      logoUrl: true,
      whatsapp: true,
      notificationPrefs: true,
      subscription: {
        select: {
          planName: true,
          price: true,
          currency: true,
          renewalDate: true,
          status: true,
        },
      },
    },
  })

  if (!org) redirect('/login')

  // ── Support impersonation mode (read-only for SUPER_ADMIN) ───────────────
  if (preview) {
    const member = await prisma.orgMember.findFirst({
      where: { organizationId },
      include: { user: { select: { name: true, email: true } } },
    })

    return (
      <div className="flex max-w-3xl flex-col gap-6">
        <FadeIn>
          <h1 className="text-xl font-semibold text-white">Mi perfil</h1>
          <p className="mt-1 text-sm text-zinc-400">Gestioná los datos de tu cuenta y empresa</p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div
            className="flex items-start gap-3 rounded-xl px-5 py-4"
            style={{
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'rgba(245,158,11,0.06)',
            }}
          >
            <Eye size={15} className="mt-0.5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">Sesión de soporte activa</p>
              <p className="mt-0.5 text-xs text-amber-400/70">
                Estás viendo el perfil del cliente en modo impersonado. La edición no está disponible durante la sesión de soporte.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <Section
            title="Datos de empresa y contacto"
            icon={<Building2 size={15} className="text-cyan-400" />}
          >
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                  Empresa
                </dt>
                <dd className="mt-1 text-sm text-zinc-200">{org.companyName}</dd>
              </div>
              {member?.user && (
                <>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                      Contacto
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-200">{member.user.name ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                      Email
                    </dt>
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

  // ── Normal client flow ────────────────────────────────────────────────────
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  if (!user) redirect('/login')

  // Parse notification prefs with defaults
  const rawPrefs = org.notificationPrefs as Partial<NotificationPrefs> | null
  const notifPrefs: NotificationPrefs = {
    projectUpdates: rawPrefs?.projectUpdates ?? DEFAULT_PREFS.projectUpdates,
    teamMessages: rawPrefs?.teamMessages ?? DEFAULT_PREFS.teamMessages,
    metricAlerts: rawPrefs?.metricAlerts ?? DEFAULT_PREFS.metricAlerts,
    developNews: rawPrefs?.developNews ?? DEFAULT_PREFS.developNews,
  }

  // Serialize plan data (no Date objects to client)
  const plan = org.subscription
    ? {
        planName: org.subscription.planName,
        price: org.subscription.price,
        currency: org.subscription.currency,
        renewalDate: org.subscription.renewalDate?.toISOString() ?? null,
        status: org.subscription.status as string,
      }
    : null

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {/* Header with avatar */}
      <FadeIn>
        <ProfileHeader
          companyName={org.companyName}
          email={user.email ?? ''}
          logoUrl={org.logoUrl}
          planName={org.subscription?.planName ?? null}
        />
      </FadeIn>

      {/* Datos de empresa */}
      <FadeIn delay={0.08}>
        <Section
          title="Datos de empresa"
          icon={<Building2 size={15} className="text-cyan-400" />}
        >
          <CompanyDataForm
            name={user.name ?? ''}
            email={user.email ?? ''}
            companyName={org.companyName}
            logoUrl={org.logoUrl}
          />
        </Section>
      </FadeIn>

      {/* Datos de contacto */}
      <FadeIn delay={0.12}>
        <Section
          title="Datos de contacto"
          icon={<Phone size={15} className="text-cyan-400" />}
        >
          <ContactSection
            email={user.email ?? ''}
            whatsapp={org.whatsapp ?? null}
          />
        </Section>
      </FadeIn>

      {/* Seguridad */}
      <FadeIn delay={0.16}>
        <Section
          title="Seguridad"
          icon={<Lock size={15} className="text-cyan-400" />}
          style={GLASS_RED_SOFT}
        >
          <PasswordForm />
        </Section>
      </FadeIn>

      {/* Preferencias de notificaciones */}
      <FadeIn delay={0.20}>
        <Section
          title="Preferencias de notificaciones"
          icon={<Bell size={15} className="text-cyan-400" />}
        >
          <NotificationPrefsForm initialPrefs={notifPrefs} />
        </Section>
      </FadeIn>

      {/* Información del plan */}
      <FadeIn delay={0.24}>
        <Section
          title="Información del plan"
          icon={<CreditCard size={15} className="text-cyan-400" />}
        >
          <PlanInfoSection plan={plan} />
        </Section>
      </FadeIn>

      {/* Zona de peligro */}
      <FadeIn delay={0.28}>
        <Section
          title="Zona de peligro"
          icon={<AlertTriangle size={15} className="text-red-400" />}
          style={GLASS_RED_STRONG}
        >
          <DangerZone />
        </Section>
      </FadeIn>
    </div>
  )
}
