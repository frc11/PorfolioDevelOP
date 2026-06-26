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
import { Card, CardTitle } from '@/components/ui'
import Link from 'next/link'
import {
  Building2,
  Phone,
  Lock,
  Bell,
  CreditCard,
  AlertTriangle,
  Eye,
  ChevronRight,
} from 'lucide-react'
import type { NotificationPrefs } from '@/lib/actions/profile'

// ─── Section card ─────────────────────────────────────────────────────────────
// Receta admin: <Card variant="elevated" padding="lg"> + label CardTitle.
// El tinte rojo (Seguridad / Zona de peligro) entra por override de `className`
// (twMerge resuelve el conflicto y gana el override).

function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card variant="elevated" padding="lg" className={className}>
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </div>
      {children}
    </Card>
  )
}

// ─── Default notification prefs ───────────────────────────────────────────────

const DEFAULT_PREFS: NotificationPrefs = {
  projectUpdates: true,
  teamMessages: true,
  metricAlerts: true,
  developNews: false,
  emailNotificationsOnMessage: true,
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
      avatarImageUrl: true,
      avatarEmoji: true,
      avatarInitials: true,
      whatsapp: true,
      notificationPrefs: true,
      subscription: {
        select: {
          plan: { select: { name: true } },
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
      <div className="flex w-full flex-col gap-6">
        <FadeIn delay={0.08}>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4">
            <Eye size={15} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">Sesión de soporte activa</p>
              <p className="mt-0.5 text-xs text-amber-400/70">
                Estás viendo el perfil del cliente en modo impersonado. La edición no está disponible durante la sesión de soporte.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <SectionCard
            title="Datos de empresa y contacto"
            icon={<Building2 size={14} strokeWidth={1.5} className="text-cyan-400" />}
          >
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.015] px-3 py-2.5">
                <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Empresa</dt>
                <dd className="mt-1 text-sm text-zinc-200">{org.companyName}</dd>
              </div>
              {member?.user && (
                <>
                  <div className="rounded-xl border border-white/5 bg-white/[0.015] px-3 py-2.5">
                    <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Contacto</dt>
                    <dd className="mt-1 text-sm text-zinc-200">{member.user.name ?? '—'}</dd>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.015] px-3 py-2.5">
                    <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Email</dt>
                    <dd className="mt-1 text-sm text-zinc-200">{member.user.email}</dd>
                  </div>
                </>
              )}
            </dl>
          </SectionCard>
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

  const currentMember = await prisma.orgMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    select: { emailNotificationsOnMessage: true },
  })

  // Parse notification prefs with defaults
  const rawPrefs = org.notificationPrefs as Partial<NotificationPrefs> | null
  const notifPrefs: NotificationPrefs = {
    projectUpdates: rawPrefs?.projectUpdates ?? DEFAULT_PREFS.projectUpdates,
    teamMessages: rawPrefs?.teamMessages ?? DEFAULT_PREFS.teamMessages,
    metricAlerts: rawPrefs?.metricAlerts ?? DEFAULT_PREFS.metricAlerts,
    developNews: rawPrefs?.developNews ?? DEFAULT_PREFS.developNews,
    emailNotificationsOnMessage:
      currentMember?.emailNotificationsOnMessage ??
      DEFAULT_PREFS.emailNotificationsOnMessage,
  }

  // Serialize plan data (no Date objects to client)
  const plan = org.subscription
    ? {
        planName: org.subscription.plan?.name ?? 'Sin plan asignado',
        price: org.subscription.price,
        currency: org.subscription.currency,
        renewalDate: org.subscription.renewalDate?.toISOString() ?? null,
        status: org.subscription.status as string,
      }
    : null

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header banner — full-width */}
      <FadeIn>
        <ProfileHeader
          companyName={org.companyName}
          email={user.email ?? ''}
          avatarImageUrl={org.avatarImageUrl}
          avatarEmoji={org.avatarEmoji}
          avatarInitials={org.avatarInitials}
          planName={org.subscription?.plan?.name ?? null}
        />
      </FadeIn>

      {/* 2 columnas: las CELDAS comparten altura (grid items-stretch por defecto) →
          ambas columnas terminan en el MISMO borde inferior. Las CARDS adentro NO
          llevan h-full → mantienen su altura natural (Contacto no se estira); el
          sobrante cae como espacio al fondo de la columna más corta, no como hueco
          intermedio. Izquierda: empresa + seguridad. Derecha: contacto + prefs + plan. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-6">
          <FadeIn delay={0.08}>
            <SectionCard
              title="Datos de empresa"
              icon={<Building2 size={14} strokeWidth={1.5} className="text-cyan-400" />}
            >
              <CompanyDataForm
                name={user.name ?? ''}
                email={user.email ?? ''}
                companyName={org.companyName}
                avatarImageUrl={org.avatarImageUrl}
                avatarEmoji={org.avatarEmoji}
                avatarInitials={org.avatarInitials}
              />
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.16}>
            <SectionCard
              title="Seguridad"
              icon={<Lock size={14} strokeWidth={1.5} className="text-red-400/80" />}
              className="border-red-500/20"
            >
              <div className="flex flex-col gap-4">
                <PasswordForm />
                <div className="border-t border-white/5 pt-4">
                  <Link
                    href="/cambiar-password"
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-zinc-200"
                  >
                    <span>Cambiar mi contraseña desde el asistente</span>
                    <ChevronRight size={14} strokeWidth={1.5} className="text-zinc-600" />
                  </Link>
                </div>
              </div>
            </SectionCard>
          </FadeIn>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-6">
          <FadeIn delay={0.12}>
            <SectionCard
              title="Datos de contacto"
              icon={<Phone size={14} strokeWidth={1.5} className="text-cyan-400" />}
            >
              <ContactSection email={user.email ?? ''} whatsapp={org.whatsapp ?? null} />
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <SectionCard
              title="Preferencias de notificaciones"
              icon={<Bell size={14} strokeWidth={1.5} className="text-cyan-400" />}
            >
              <NotificationPrefsForm initialPrefs={notifPrefs} />
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.24}>
            <SectionCard
              title="Información del plan"
              icon={<CreditCard size={14} strokeWidth={1.5} className="text-cyan-400" />}
            >
              <PlanInfoSection plan={plan} />
            </SectionCard>
          </FadeIn>
        </div>
      </div>

      {/* Zona de peligro (rojo fuerte) — full-width al fondo, sobre las 2 columnas */}
      <FadeIn delay={0.28}>
        <SectionCard
          title="Zona de peligro"
          icon={<AlertTriangle size={14} strokeWidth={1.5} className="text-red-400" />}
          className="border-red-500/30 bg-red-500/[0.03]"
        >
          <DangerZone />
        </SectionCard>
      </FadeIn>
    </div>
  )
}
