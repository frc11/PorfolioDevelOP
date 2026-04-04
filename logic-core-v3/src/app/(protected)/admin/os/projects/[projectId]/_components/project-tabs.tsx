'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type ProjectTabsProps = {
  projectId: string
}

const TAB_ITEMS = [
  {
    label: 'Overview',
    href: (projectId: string) => `/admin/os/projects/${projectId}`,
    key: 'overview',
  },
  {
    label: 'Tareas',
    href: (projectId: string) => `/admin/os/projects/${projectId}/tasks`,
    key: 'tasks',
  },
  {
    label: 'Horas',
    href: (projectId: string) => `/admin/os/projects/${projectId}/hours`,
    key: 'hours',
  },
  {
    label: 'Pagos',
    href: (projectId: string) => `/admin/os/projects/${projectId}/payments`,
    key: 'payments',
  },
] as const

function getActiveKey(pathname: string, projectId: string): string {
  const basePath = `/admin/os/projects/${projectId}`

  if (pathname === basePath) {
    return 'overview'
  }

  if (pathname.startsWith(`${basePath}/tasks`)) {
    return 'tasks'
  }

  if (pathname.startsWith(`${basePath}/hours`)) {
    return 'hours'
  }

  if (pathname.startsWith(`${basePath}/payments`)) {
    return 'payments'
  }

  return 'overview'
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname()
  const activeKey = getActiveKey(pathname, projectId)

  return (
    <nav className="overflow-x-auto border-b border-white/10">
      <div className="flex min-w-max gap-2 px-1">
        {TAB_ITEMS.map((tab) => {
          const isActive = activeKey === tab.key

          return (
            <Link
              key={tab.key}
              href={tab.href(projectId)}
              className={[
                'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-cyan-400 text-cyan-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
