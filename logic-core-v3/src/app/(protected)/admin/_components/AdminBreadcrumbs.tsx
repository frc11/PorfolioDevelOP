'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminBreadcrumbsProps {
  items?: BreadcrumbItem[]
}

export function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  const pathname = usePathname()
  const breadcrumbs = items ?? buildFromPath(pathname)

  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
      <Link
        href="/admin"
        className="flex items-center gap-1 transition-colors hover:text-zinc-300"
      >
        <Home className="h-3 w-3" strokeWidth={1.5} />
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-zinc-700" strokeWidth={1.5} />
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-zinc-300"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-400">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function buildFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'admin') return []

  const items: BreadcrumbItem[] = []
  let acc = '/admin'

  for (let index = 1; index < segments.length; index++) {
    acc += `/${segments[index]}`
    items.push({
      label: humanize(segments[index]),
      href: index === segments.length - 1 ? undefined : acc,
    })
  }

  return items
}

function humanize(slug: string): string {
  return slug.replace(/[-_]/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
}
