import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const [session, clients, projects, unreadMessages, activeServices] = await Promise.all([
    auth(),
    prisma.organization.count(),
    prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.message.count({ where: { read: false, fromAdmin: false } }),
    prisma.service.count({ where: { status: 'ACTIVE' } }),
  ])

  return (
    <AdminDashboard
      userName={session?.user?.name ?? session?.user?.email}
      clients={clients}
      projects={projects}
      unreadMessages={unreadMessages}
      activeServices={activeServices}
    />
  )
}
