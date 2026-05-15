import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const bot = await p.botConfig.findUnique({
    where: { slug: 'develop' },
    select: { botName: true, avatarStyle: true, llmProvider: true, llmModel: true, isActive: true }
  })
  console.log(JSON.stringify(bot, null, 2))
  await p.$disconnect()
}
main()
