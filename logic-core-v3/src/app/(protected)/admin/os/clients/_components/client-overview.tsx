import type { ServiceStatus, ServiceType, SubscriptionStatus } from '@prisma/client'
import Link from 'next/link'
import { Bot, CalendarDays, Code2, Globe, Users, Workflow } from 'lucide-react'
import { estimateLastLoginAt } from '@/lib/client-health'
import { ModuleToggle } from './module-toggle'

type OverviewUser = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
  sessions: Array<{
    expires: Date
  }>
}

type OverviewService = {
  id: string
  type: ServiceType
  status: ServiceStatus
  startDate: Date
}

type OverviewSubscription = {
  planName: string
  status: SubscriptionStatus
  price: number
  currency: string
  renewalDate: Date | null
  createdAt: Date
  updatedAt: Date
}

type ClientOverviewProps = {
  organization: {
    id: string
    companyName: string
    slug: string
    siteUrl: string | null
    whatsapp: string | null
    onboardingCompleted: boolean
    createdAt: Date
    users: OverviewUser[]
    services: OverviewService[]
    subscription: OverviewSubscription | null
  }
}

const MODULE_DEFINITIONS: Array<{
  key: ServiceType
  label: string
  description: string
  icon: typeof Globe
}> = [
  {
    key: 'WEB_DEV',
    label: 'Desarrollo web',
    description: 'Sitio, landings y mejoras estructurales del portal.',
    icon: Globe,
  },
  {
    key: 'AI',
    label: 'IA',
    description: 'Asistentes, automatizacion conversacional y flujos con LLM.',
    icon: Bot,
  },
  {
    key: 'AUTOMATION',
    label: 'Automatizacion',
    description: 'Integraciones, secuencias operativas y procesos internos.',
    icon: Workflow,
  },
  {
    key: 'SOFTWARE',
    label: 'Software a medida',
    description: 'Modulos custom, paneles internos y herramientas de negocio.',
    icon: Code2,
  },
]

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function getServiceStatusLabel(status: ServiceStatus | null) {
  if (status === 'ACTIVE') {
    return 'Activo'
  }

  if (status === 'PAUSED') {
    return 'Pausado'
  }

  if (status === 'CANCELLED') {
    return 'Cancelado'
  }

  return 'No configurado'
}

function getSubscriptionTone(status: SubscriptionStatus | null) {
  if (status === 'ACTIVE') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }

  if (status === 'PAST_DUE') {
    return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
  }

  if (status === 'CANCELED') {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
  }

  return 'border-white/10 bg-white/5 text-zinc-300'
}

export function ClientOverview({ organization }: ClientOverviewProps) {
  return (
    <section id="overview" className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Overview
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Datos de la organizacion
            </h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Slug</p>
            <p className="mt-2 text-sm font-medium text-white">{organization.slug}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Alta en portal
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {formatDate(organization.createdAt)}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Sitio</p>
            {organization.siteUrl ? (
              <Link
                href={organization.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm font-medium text-cyan-200 transition-colors hover:text-cyan-100"
              >
                {organization.siteUrl}
              </Link>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">Sin sitio configurado</p>
            )}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">WhatsApp</p>
            <p className="mt-2 text-sm font-medium text-white">
              {organization.whatsapp || 'Sin telefono'}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Onboarding
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={[
                'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                organization.onboardingCompleted
                  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                  : 'border-amber-400/20 bg-amber-400/10 text-amber-200',
              ].join(' ')}
            >
              {organization.onboardingCompleted ? 'Completo' : 'Pendiente'}
            </span>
            <p className="text-sm text-zinc-400">
              {organization.onboardingCompleted
                ? 'El cliente completo el circuito inicial del portal.'
                : 'Todavia quedan pasos iniciales por completar.'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Usuarios</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Personas vinculadas</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {organization.users.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-4 py-8 text-sm text-zinc-500">
              No hay usuarios vinculados a esta organizacion.
            </div>
          ) : (
            organization.users.map((user) => {
              const estimatedLastLogin = estimateLastLoginAt(user.sessions[0]?.expires)

              return (
                <div
                  key={user.id}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.name?.trim() || 'Sin nombre'}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Ultimo login
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {estimatedLastLogin ? formatDate(estimatedLastLogin) : 'Sin registro'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Alta de usuario
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Modulos premium
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Servicios activos</h2>
        </div>

        <div className="mt-5 grid gap-3">
          {MODULE_DEFINITIONS.map((moduleDefinition) => {
            const activeService =
              organization.services.find(
                (service) =>
                  service.type === moduleDefinition.key && service.status === 'ACTIVE'
              ) ?? null
            const latestService =
              activeService ??
              organization.services.find(
                (service) => service.type === moduleDefinition.key
              ) ??
              null
            const Icon = moduleDefinition.icon

            return (
              <div
                key={moduleDefinition.key}
                className="rounded-[26px] border border-white/10 bg-black/10 p-1.5"
              >
                <div className="flex items-center gap-3 px-3 pb-3 pt-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{moduleDefinition.label}</p>
                    <p className="text-xs text-zinc-500">
                      Gestionado desde Capa 1 del portal.
                    </p>
                  </div>
                </div>

                <ModuleToggle
                  organizationId={organization.id}
                  moduleKey={moduleDefinition.key}
                  label={moduleDefinition.label}
                  description={moduleDefinition.description}
                  enabled={activeService !== null}
                  statusLabel={getServiceStatusLabel(latestService?.status ?? null)}
                  startDateLabel={latestService ? formatDate(latestService.startDate) : null}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Suscripcion</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-white">
            {organization.subscription?.planName || 'Sin plan asignado'}
          </h2>
          <span
            className={[
              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
              getSubscriptionTone(organization.subscription?.status ?? null),
            ].join(' ')}
          >
            {organization.subscription?.status || 'NONE'}
          </span>
        </div>

        {organization.subscription ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Valor mensual
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(
                  organization.subscription.price,
                  organization.subscription.currency
                )}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Renovacion
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(organization.subscription.renewalDate)}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Creada
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(organization.subscription.createdAt)}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Ultima actualizacion
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(organization.subscription.updatedAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-black/10 px-4 py-8 text-sm text-zinc-500">
            Esta organizacion todavia no tiene suscripcion registrada.
          </div>
        )}
      </div>
    </section>
  )
}
