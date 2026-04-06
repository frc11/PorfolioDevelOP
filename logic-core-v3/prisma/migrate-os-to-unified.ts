import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [projects, tasks, leads] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.osLead.count(),
  ])

  process.stdout.write(
    [
      'OsProject/OsTask ya fueron retirados del schema.',
      'La migracion de datos hacia Project/Task ya se considera finalizada.',
      `- Projects unificados: ${projects}`,
      `- Tasks unificadas: ${tasks}`,
      `- Leads OS conservados: ${leads}`,
    ].join('\n') + '\n'
  )
}

main()
  .catch((error) => {
    console.error('Error verificando el estado unificado:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
