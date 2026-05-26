/**
 * Dev helper: setea password conocida para matsu-admin@dev.local
 * y desactiva passwordResetRequired para entrar directo al dashboard.
 *
 * Run:
 *   npx tsx scripts/set-matsu-password.ts
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'
const EMAIL = 'matsu-admin@dev.local'
const PASSWORD = 'matsu1234'

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'
  if (host !== EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host "${host}" no coincide con dev.`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  const user = await prisma.user.update({
    where: { email: EMAIL },
    data: { password: passwordHash, passwordResetRequired: false },
    select: { id: true, email: true, name: true, role: true },
  })

  console.log('\n✓ Password actualizada')
  console.log(`  email:    ${user.email}`)
  console.log(`  password: ${PASSWORD}`)
  console.log(`  role:     ${user.role}`)
  console.log('  reset:    OFF (entra directo)\n')
}

main()
  .catch((e) => {
    console.error('❌ Falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
