import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Admin1234!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@develop.com' },
    update: {},
    create: {
      email: 'admin@develop.com',
      name: 'Admin DevelOP',
      password,
      role: Role.SUPER_ADMIN,
    },
  })

  console.log(`✅ Seed completado: ${admin.email} (${admin.role})`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
