/**
 * Actualiza SOLO `BotConfig.proactivePrompts` del bot develOP público
 * (slug 'develop') al set actual de `DEVELOP_PROACTIVE_PROMPTS`.
 *
 * Idempotente y acotado: no toca ningún otro campo del bot ni ningún otro bot.
 * Seguro de correr varias veces (deja el campo en el mismo valor).
 *
 * Como front (pickPromptForPath) y server (validación del opener) leen este
 * mismo campo, al actualizarlo quedan consistentes en un solo paso.
 *
 * Correr con:
 *   npx tsx src/modules/chatbot/prisma/update-proactive-prompts.ts
 */
import { PrismaClient, Prisma } from '@prisma/client'
import { DEVELOP_PROACTIVE_PROMPTS } from './developProactivePrompts'

const prisma = new PrismaClient()

const BOT_SLUG = 'develop'

async function main() {
  const updated = await prisma.botConfig.update({
    where: { slug: BOT_SLUG },
    data: {
      proactivePrompts: DEVELOP_PROACTIVE_PROMPTS as Prisma.InputJsonValue,
    },
    select: { id: true, slug: true },
  })

  const sections = Object.keys(DEVELOP_PROACTIVE_PROMPTS)
  const total = Object.values(DEVELOP_PROACTIVE_PROMPTS).reduce(
    (n, list) => n + list.length,
    0
  )

  console.log(
    `✓ proactivePrompts actualizados en BotConfig "${updated.slug}" (${updated.id})`
  )
  console.log(`  ${sections.length} secciones · ${total} preguntas`)
  console.log(`  secciones: ${sections.join(', ')}`)
}

main()
  .catch((err: unknown) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.error(
        `✗ No existe un BotConfig con slug "${BOT_SLUG}". ¿Corriste el seed primero?`
      )
    } else {
      console.error('✗ Error actualizando proactivePrompts:', err)
    }
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
