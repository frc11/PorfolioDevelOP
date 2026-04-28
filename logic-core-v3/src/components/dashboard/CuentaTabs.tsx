'use client'

import { CreditCard, ShieldCheck, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Tabs, type TabItem } from '@/components/ui'

const TABS: TabItem[] = [
  { href: '/dashboard/cuenta/perfil', label: 'Perfil', icon: User },
  { href: '/dashboard/cuenta/facturacion', label: 'Facturacion', icon: CreditCard },
  { href: '/dashboard/cuenta/boveda', label: 'Boveda', icon: ShieldCheck },
]

export function CuentaTabs() {
  const pathname = usePathname()
  const activeHref = pathname === '/dashboard/cuenta' ? '/dashboard/cuenta/perfil' : pathname

  return <Tabs items={TABS} activeHref={activeHref} layoutId="cuenta-tabs" />
}
