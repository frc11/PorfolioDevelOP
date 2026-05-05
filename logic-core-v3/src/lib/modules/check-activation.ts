import { prisma } from '@/lib/prisma'

export async function isModuleActive(
  organizationId: string,
  moduleSlug: string,
): Promise<boolean> {
  const activation = await prisma.organizationModule.findFirst({
    where: {
      organizationId,
      module: { slug: moduleSlug },
      status: 'ACTIVE',
    },
  })
  return Boolean(activation)
}
