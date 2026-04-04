'use client'

import { usePathname } from 'next/navigation'

function humanizeSegment(segment: string): string {
  if (!segment) {
    return 'Dashboard'
  }

  if (/^[a-z0-9]{10,}$/i.test(segment)) {
    return 'Detalle'
  }

  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getTopbarMeta(pathname: string) {
  const segments = pathname.replace(/^\/admin\/os\/?/, '').split('/').filter(Boolean)
  const section = segments[0] ?? ''

  const sectionLabelMap: Record<string, string> = {
    '': 'Dashboard',
    leads: 'Leads',
    projects: 'Proyectos',
    team: 'Equipo',
  }

  const sectionLabel = sectionLabelMap[section] ?? humanizeSegment(section)
  const currentLabel =
    segments.length > 1 ? humanizeSegment(segments[segments.length - 1] ?? '') : sectionLabel

  const breadcrumb =
    currentLabel === sectionLabel
      ? `Agency OS / ${sectionLabel}`
      : `Agency OS / ${sectionLabel} / ${currentLabel}`

  return {
    breadcrumb,
    title: currentLabel,
  }
}

function formatToday(): string {
  const formatted = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function AdminTopbar() {
  const pathname = usePathname()
  const meta = getTopbarMeta(pathname)

  return (
    <header className="flex h-16 items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 backdrop-blur-xl">
      <div className="min-w-0">
        <p className="truncate text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          {meta.breadcrumb}
        </p>
        <h1 className="mt-1 truncate text-lg font-semibold tracking-tight text-white">
          {meta.title}
        </h1>
      </div>

      <div className="hidden rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-300 sm:block">
        {formatToday()}
      </div>
    </header>
  )
}
