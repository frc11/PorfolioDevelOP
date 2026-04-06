'use client'

import Link from 'next/link'
import { Building2, CalendarDays, CheckCircle2, CircleDollarSign, FolderKanban } from 'lucide-react'
import type { ProjectStatus, ServiceType } from '@prisma/client'

export type ProjectCardData = {
  id: string
  leadId: string | null
  businessName: string
  contactName: string
  contactPhone: string | null
  contactEmail: string | null
  organizationId: string | null
  name: string
  description: string | null
  serviceType: ServiceType | null
  status: ProjectStatus
  agreedAmount: string | null
  monthlyRate: string | null
  maintenanceStartDate: string | null
  startDate: string | null
  estimatedEndDate: string | null
  deliveredAt: string | null
  _count: {
    tasks: number
    timeEntries?: number
  }
  completedTasks: number
  totalTrackedHours: number
  milestoneSummary: {
    total: number
    paid: number
  }
  maintenancePaymentsCount: number
  lead: {
    id: string
    businessName: string
    status: string
    serviceType?: ServiceType | null
  } | null
  isInternal?: boolean
}

type ProjectCardProps = {
  project: ProjectCardData
}

function statusTone(status: ProjectStatus): string {
  switch (status) {
    case 'PLANNING':
      return 'border-zinc-400/20 bg-zinc-400/10 text-zinc-200'
    case 'IN_PROGRESS':
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200'
    case 'REVIEW':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    case 'COMPLETED':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function statusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'PLANNING':
      return 'Planning'
    case 'IN_PROGRESS':
      return 'En progreso'
    case 'REVIEW':
      return 'Revision'
    case 'COMPLETED':
      return 'Completado'
  }
}

function serviceTone(serviceType: ServiceType): string {
  switch (serviceType) {
    case 'WEB_DEV':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
  }
}

function serviceLabel(serviceType: ServiceType): string {
  switch (serviceType) {
    case 'WEB_DEV':
      return 'Web'
    case 'AI':
      return 'AI'
    case 'AUTOMATION':
      return 'Automation'
    case 'SOFTWARE':
      return 'Software'
  }
}

function formatCurrency(value: string | null): string {
  if (!value) {
    return 'Sin definir'
  }

  const amount = Number(value)

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project._count.tasks
  const completedTasks = project.completedTasks
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const hasClientLinked = project.organizationId !== null

  return (
    <Link
      href={`/admin/os/projects/${project.id}`}
      className="group block rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all hover:border-cyan-400/20 hover:bg-white/[0.07]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">{project.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-sm text-zinc-400">{project.businessName}</p>
            {hasClientLinked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                <Building2 className="h-3.5 w-3.5" />
                Cliente portal
              </span>
            ) : (
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                Interno
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
              statusTone(project.status),
            ].join(' ')}
          >
            {statusLabel(project.status)}
          </span>
          {project.serviceType ? (
            <span
              className={[
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                serviceTone(project.serviceType),
              ].join(' ')}
            >
              {serviceLabel(project.serviceType)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Monto acordado</p>
          <p className="mt-2 text-sm font-medium text-zinc-100">{formatCurrency(project.agreedAmount)}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Inicio</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            <span>{formatDate(project.startDate)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Pagos</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
            <CircleDollarSign className="h-4 w-4 text-zinc-500" />
            <span>
              {project.milestoneSummary.paid}/{project.milestoneSummary.total} hitos pagados
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-200">
            <FolderKanban className="h-4 w-4 text-zinc-500" />
            <span>
              {completedTasks}/{totalTasks} tareas completadas
            </span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-zinc-500" />
            <span>{progressPercentage}%</span>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-[width]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <span>{project.totalTrackedHours.toFixed(1)} h registradas</span>
          {project.maintenancePaymentsCount > 0 ? (
            <span>{project.maintenancePaymentsCount} pagos de mantenimiento</span>
          ) : (
            <span>Sin pagos de mantenimiento</span>
          )}
        </div>
      </div>
    </Link>
  )
}
