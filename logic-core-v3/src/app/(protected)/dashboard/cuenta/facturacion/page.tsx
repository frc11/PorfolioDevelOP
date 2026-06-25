import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Landmark,
  Wallet,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { CurrentPlanCard } from '@/components/dashboard/CurrentPlanCard'
import { getCurrentPlan } from '@/lib/billing/get-current-plan'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { adminHoverCls } from '@/lib/hover'
import type { InvoiceStatus } from '@prisma/client'

export const metadata = { title: 'Facturación | develOP Dashboard' }

// ─── Invoice status config ────────────────────────────────────────────────────

type InvoiceStatusCfg = {
  label: string
  pill: string
  iconName: 'check' | 'clock' | 'x'
}

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, InvoiceStatusCfg> = {
  PAID: {
    label: 'Pagado',
    pill: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    iconName: 'check',
  },
  PENDING: {
    label: 'Pendiente',
    pill: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    iconName: 'clock',
  },
  OVERDUE: {
    label: 'Vencido',
    pill: 'text-red-400 bg-red-500/10 border-red-500/20',
    iconName: 'x',
  },
}

function InvoiceStatusIcon({ name }: { name: InvoiceStatusCfg['iconName'] }) {
  if (name === 'check') return <CheckCircle2 size={11} strokeWidth={1.5} />
  if (name === 'clock') return <Clock size={11} strokeWidth={1.5} />
  return <XCircle size={11} strokeWidth={1.5} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BillingPage() {
  const [organizationId, session] = await Promise.all([resolveOrgId(), auth()])
  if (!organizationId) redirect('/login')

  const [org, subscription, invoices, currentPlan] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true },
    }),
    prisma.subscription.findUnique({ where: { organizationId } }),
    prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { dueDate: 'desc' },
    }),
    getCurrentPlan(organizationId),
  ])

  if (!org) redirect('/login')

  // ── Renewal date & countdown ──────────────────────────────────────────────
  const now = new Date()
  const renewalDate = subscription?.renewalDate ?? null

  const daysUntilRenewal =
    renewalDate !== null
      ? Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

  const nextBillingFormatted = renewalDate
    ? renewalDate.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  // ── Alert type ────────────────────────────────────────────────────────────
  const alertType: 'danger' | 'warning' | null =
    daysUntilRenewal === null
      ? null
      : daysUntilRenewal < 0
      ? 'danger'
      : daysUntilRenewal <= 7
      ? 'warning'
      : null

  const billingEmail = session?.user?.email ?? ''

  return (
    <div className="flex w-full flex-col gap-6 pb-20">

      {/* ── Renewal alert banner ──────────────────────────────────────────── */}
      {alertType && (
        <FadeIn delay={0.03}>
          {alertType === 'danger' ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/[0.08] px-5 py-4 backdrop-blur-xl">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-sm font-semibold text-red-300">
                Tu suscripción está vencida.{' '}
                <Link
                  href="/dashboard/messages?context=facturacion"
                  className="font-semibold underline underline-offset-2 transition-colors hover:text-red-200"
                >
                  Contactanos para regularizar.
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-5 py-4 backdrop-blur-xl">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-sm font-semibold text-amber-300">
                Tu suscripción vence en{' '}
                <span className="font-semibold">
                  {daysUntilRenewal === 0 ? 'hoy' : `${daysUntilRenewal} días`}
                </span>
                . Coordiná el pago para no interrumpir el servicio.
              </p>
            </div>
          )}
        </FadeIn>
      )}

      {/* ── Main grid: plan card + invoice history ────────────────────────── */}
      <FadeIn delay={0.06}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Plan card */}
          <CurrentPlanCard plan={currentPlan} />

          {/* Invoice history */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] lg:col-span-2">
            <div className="border-b border-white/5 px-6 py-5">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Historial de pagos
              </h3>
            </div>

            {invoices.length === 0 ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <FileText size={24} className="text-zinc-700" />
                </div>
                <p className="max-w-xs text-sm font-medium leading-relaxed text-zinc-500">
                  Tus facturas aparecerán acá automáticamente cada mes.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Período
                      </th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Monto
                      </th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Comprobante
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.map((invoice) => {
                      const cfg = INVOICE_STATUS_CONFIG[invoice.status]
                      const periodLabel = new Date(invoice.dueDate).toLocaleDateString('es-AR', {
                        month: 'long',
                        year: 'numeric',
                      })

                      return (
                        <tr
                          key={invoice.id}
                          className="group/row transition-colors duration-150 hover:bg-white/[0.04]"
                        >
                          {/* Period */}
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold capitalize text-zinc-300">
                              {periodLabel}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 font-mono">
                            <span className="font-bold text-zinc-200">
                              ${invoice.amount.toFixed(2)}
                            </span>
                            <span className="ml-1 text-[10px] text-zinc-600">
                              {invoice.currency}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${cfg.pill}`}
                            >
                              <InvoiceStatusIcon name={cfg.iconName} />
                              {cfg.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-right">
                            {invoice.status === 'PAID' && invoice.pdfUrl ? (
                              /* Download button */
                              <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <Download size={13} />
                                PDF
                              </a>
                            ) : invoice.status === 'PAID' && !invoice.pdfUrl ? (
                              /* Disabled — generating */
                              <div className="group/tip relative inline-flex justify-end">
                                <button
                                  disabled
                                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-zinc-600 opacity-50"
                                >
                                  <Download size={13} />
                                  PDF
                                </button>
                                {/* Tooltip */}
                                <div className="pointer-events-none absolute -top-9 right-0 z-20 translate-y-1 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-[10px] font-medium text-zinc-400 opacity-0 shadow-xl transition-all duration-200 group-hover/tip:translate-y-0 group-hover/tip:opacity-100">
                                  Generando...
                                  <div className="absolute -bottom-[5px] right-4 h-2 w-2 rotate-45 border-b border-r border-white/10 bg-zinc-900" />
                                </div>
                              </div>
                            ) : invoice.paymentLink ? (
                              /* Pay now */
                              <a
                                href={invoice.paymentLink}
                                className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                              >
                                Pagar ahora
                              </a>
                            ) : (
                              <span className="text-xs text-zinc-700">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── Billing info section ──────────────────────────────────────────── */}
      <FadeIn delay={0.1}>
        <Card variant="elevated" padding="lg">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Información de facturación
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Billing email */}
            <div className={cn('rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3.5', adminHoverCls)}>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Email de facturación
              </p>
              <p className="mt-1.5 truncate text-sm font-semibold text-zinc-200">
                {billingEmail || '—'}
              </p>
            </div>

            {/* Next billing date */}
            <div className={cn('rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3.5', adminHoverCls)}>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Próxima fecha de cobro
              </p>
              <p className="mt-1.5 text-sm font-semibold capitalize text-zinc-200">
                {nextBillingFormatted ?? '—'}
              </p>
            </div>

            {/* Payment methods */}
            <div className="rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3.5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Métodos de pago
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5">
                  <Landmark size={13} strokeWidth={1.5} className="text-blue-400" />
                  <span className="text-[10px] font-medium text-zinc-400">Transferencia</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5">
                  <Wallet size={13} strokeWidth={1.5} className="text-sky-400" />
                  <span className="text-[10px] font-medium text-zinc-400">MercadoPago</span>
                </div>
              </div>
            </div>

            {/* Update billing data */}
            <div className="flex items-center">
              <Link
                href="/dashboard/messages?context=facturacion"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-white/15 hover:bg-white/10 hover:text-zinc-200"
              >
                Actualizar datos
              </Link>
            </div>
          </div>
        </Card>
      </FadeIn>

    </div>
  )
}
