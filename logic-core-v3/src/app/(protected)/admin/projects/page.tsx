import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { listProjects } from './_actions/project.actions'
import { ProjectsBoard } from './_components/projects-board'
import type { ProjectListItem } from './_components/project-list'

const getOrganizationsForDropdown = unstable_cache(
  async () =>
    prisma.organization.findMany({
      select: { id: true, companyName: true },
      where: { slug: { not: 'develop' } },
      orderBy: { companyName: 'asc' },
    }),
  ['admin-orgs'],
  { revalidate: 60, tags: ['admin-orgs', 'admin-clients'] }
)

export default async function AgencyOsProjectsPage() {
  const [result, organizations] = await Promise.all([
    listProjects(),
    getOrganizationsForDropdown(),
  ])

  const projects: ProjectListItem[] = result.success ? result.data : []

  return (
    <ProjectsBoard
      projects={projects}
      organizations={organizations}
      errorMessage={result.success ? null : result.error}
    />
  )
}
