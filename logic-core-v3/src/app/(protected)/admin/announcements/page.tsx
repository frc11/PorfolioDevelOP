import { prisma } from '@/lib/prisma'
import { AnnouncementPublisher } from './_components/announcement-publisher'
import { AnnouncementList, type AdminAnnouncementRow } from './_components/announcement-list'

export const dynamic = 'force-dynamic'

// Tope de la lista admin: novedades curadas, de baja frecuencia. Si crecen, paginar.
const ADMIN_ANNOUNCEMENTS_LIMIT = 100

export default async function AdminAnnouncementsPage() {
  const [announcements, organizations] = await Promise.all([
    prisma.panelAnnouncement.findMany({
      orderBy: { publishedAt: 'desc' },
      take: ADMIN_ANNOUNCEMENTS_LIMIT,
      select: {
        id: true,
        title: true,
        body: true,
        audience: true,
        publishedAt: true,
        expiresAt: true,
        organization: { select: { companyName: true } },
        _count: { select: { reads: true } },
      },
    }),
    prisma.organization.findMany({
      where: { deletedAt: null },
      orderBy: { companyName: 'asc' },
      select: { id: true, companyName: true },
    }),
  ])

  const rows: AdminAnnouncementRow[] = announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    audience: announcement.audience,
    organizationName: announcement.organization?.companyName ?? null,
    publishedAt: announcement.publishedAt.toISOString(),
    expiresAt: announcement.expiresAt?.toISOString() ?? null,
    readCount: announcement._count.reads,
  }))

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-xs tracking-tight text-zinc-500">develOP / Novedades</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Novedades del panel</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Cada feature que entregás se anuncia acá. Los clientes la ven en su panel con un badge; el
          badge se apaga cuando la leen. Las novedades con fecha caducan solas.
        </p>
      </div>

      <AnnouncementPublisher organizations={organizations} />

      <div className="space-y-3">
        <h3 className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Publicadas
        </h3>
        <AnnouncementList announcements={rows} />
      </div>
    </section>
  )
}
