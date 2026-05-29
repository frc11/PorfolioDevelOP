import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // --- 1) Lucia (slug: develop): quitar el quick reply 💰 ---
  const lucia = await prisma.botConfig.findFirst({ where: { slug: 'develop' } })
  if (lucia) {
    const filteredReplies = Array.isArray(lucia.quickReplies)
      ? lucia.quickReplies.filter((r) => {
          if (!r || typeof r !== 'object') return true
          const emoji = (r).emoji
          const label = (r).label
          return emoji !== '💰' && label !== '¿Cuánto cuesta?'
        })
      : lucia.quickReplies
    await prisma.botConfig.update({
      where: { id: lucia.id },
      data: { quickReplies: filteredReplies },
    })
    console.log(`Lucia (${lucia.id}): quick replies reducidos a ${filteredReplies.length}`)
  } else {
    console.log('Lucia no encontrada')
  }

  // --- 2) Bot "CHATBOT" (slug: chatbot, Empresa Demo): renombrar + welcome decente ---
  const demoBot = await prisma.botConfig.findFirst({ where: { slug: 'chatbot' } })
  if (demoBot) {
    await prisma.botConfig.update({
      where: { id: demoBot.id },
      data: {
        botName: 'Asistente Demo',
        welcomeMessage:
          'Hola, soy el asistente de Empresa Demo. Contame qué necesitás y vemos cómo te puedo ayudar.',
      },
    })
    console.log(`Bot demo (${demoBot.id}): renombrado de "${demoBot.botName}" a "Asistente Demo"`)
  } else {
    console.log('Bot demo (slug=chatbot) no encontrado')
  }

  // --- 3) Verificación ---
  const after = await prisma.botConfig.findMany({
    where: { slug: { in: ['develop', 'chatbot'] } },
    select: {
      id: true,
      slug: true,
      botName: true,
      welcomeMessage: true,
      quickReplies: true,
    },
  })
  console.log('\n=== Estado posterior ===')
  console.log(JSON.stringify(after, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
