import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, LogIn } from 'lucide-react'
import type { SubscriptionStatus } from '@prisma/client'
import {
  getClientById,
  getClientHealthScore,
  startImpersonationAction,
} from '../_actions/client.actions'
import { ClientDetailPanels } from '../_components/client-detail-panels'
import { ClientOverview } from '../_components/client-overview'
import { ClientProjects } from '../_components/client-projects'
import { ClientSupport } from '../_components/client-support'
import { HealthScoreDisplay } from '../_components/health-score-display'

type ClientDetailPageProps = {
  params: Promise<{
    clientId: string
  }>
}

function getSubscriptionBadge(status: SubscriptionStatus | null) {
  if (status === 'ACTIVE') {
    return {
      label: 'Activa',
      tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    }
  }

  if (status === 'PAST_DUE') {
    return {
      label: 'Vencida',
      tone: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
    }
  }

  if (status === 'CANCELED') {
    return {
      label: 'Cancelada',
      tone: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    }
  }

  return {
    label: 'Sin suscripcion',
    tone: 'border-white/10 bg-white/5 text-zinc-300',
  }
}

export default async function AgencyOsClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { clientId } = await params

  const [clientResult, healthResult] = await Promise.all([
    getClientById(clientId),
    getClientHealthScore(clientId),
  ])

  if (!clientResult.success) {
    if (clientResult.error === 'Cliente no encontrado.') {
      notFound()
    }

    return (
      <section className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
        {clientResult.error}
      </section>
    )
  }

  const client = clientResult.data
  const healthScore = healthResult.success
    ? healthResult.data
    : { score: 0, factors: [] }
  const subscriptionBadge = getSubscriptionBadge(client.subscription?.status ?? null)
  const activeServicesCount = client.services.filter(
    (service) => service.status === 'ACTIVE'
  ).length

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="min-w-0">
            <Link
              href="/admin/os/clients"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a clientes
            </Link>

            <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Cliente
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {client.companyName}
              </h1>
              <span
                className={[
                  'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                  subscriptionBadge.tone,
                ].join(' ')}
              >
                {subscriptionBadge.label}
              </span>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Vista consolidada del cliente entre portal, proyectos unificados,
              soporte y modulos premium de Agency OS.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-zinc-300">
                {client.users.length} usuario(s)
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-zinc-300">
                {client.projects.length} proyecto(s)
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-zinc-300">
                {activeServicesCount} modulo(s) activo(s)
              </div>
            </div>
          </div>

          <form
            action={startImpersonationAction.bind(null, client.id)}
            className="shrink-0"
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/15"
            >
              <LogIn className="h-4 w-4" />
              Impersonar
            </button>
          </form>
        </div>

        <div className="mt-6">
          <HealthScoreDisplay
            score={healthScore.score}
            factors={healthScore.factors}
          />
        </div>
      </div>

      <ClientDetailPanels
        overview={
          <ClientOverview
            organization={{
              id: client.id,
              companyName: client.companyName,
              slug: client.slug,
              siteUrl: client.siteUrl,
              whatsapp: client.whatsapp,
              onboardingCompleted: client.onboardingCompleted,
              createdAt: client.createdAt,
              users: client.users,
              services: client.services,
              subscription: client.subscription,
            }}
          />
        }
        projects={<ClientProjects projects={client.projects} />}
        support={
          <ClientSupport
            organizationId={client.id}
            tickets={client.tickets}
            messages={client.messages}
          />
        }
      />
    </section>
  )
}
