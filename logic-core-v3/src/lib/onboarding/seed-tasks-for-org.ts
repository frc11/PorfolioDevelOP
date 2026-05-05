import { prisma } from '@/lib/prisma'
import { ONBOARDING_TASKS_CATALOG } from '@/lib/data/onboarding-tasks'

export async function seedOnboardingTasksForOrg(organizationId: string) {
  await prisma.onboardingTask.createMany({
    data: ONBOARDING_TASKS_CATALOG.map((task) => ({
      organizationId,
      category: task.category,
      title: task.title,
      description: task.description,
      sortOrder: task.sortOrder,
      status: 'PENDING' as const,
    })),
    skipDuplicates: true,
  })
}
