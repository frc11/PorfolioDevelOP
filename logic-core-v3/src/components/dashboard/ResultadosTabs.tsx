'use client'

import { BarChart3, Star, TrendingUp } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Tabs, type TabItem } from '@/components/ui'

const TABS: TabItem[] = [
  { href: '/dashboard/resultados/trafico', label: 'Trafico', icon: BarChart3 },
  { href: '/dashboard/resultados/seo', label: 'SEO', icon: TrendingUp },
  { href: '/dashboard/resultados/reputacion', label: 'Reputación', icon: Star },
]

export function ResultadosTabs() {
  const pathname = usePathname()
  const activeHref =
    pathname === '/dashboard/resultados' ? '/dashboard/resultados/trafico' : pathname

  return <Tabs items={TABS} activeHref={activeHref} layoutId="resultados-tabs" />
}
