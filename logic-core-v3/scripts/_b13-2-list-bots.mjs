import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const bots = await prisma.botConfig.findMany({
  select: {
    id: true,
    botName: true,
    slug: true,
    isActive: true,
    welcomeMessage: true,
    quickReplies: true,
    organization: { select: { companyName: true } },
  },
  orderBy: { createdAt: 'asc' },
})
console.log(JSON.stringify(bots, null, 2))
await prisma.$disconnect()
