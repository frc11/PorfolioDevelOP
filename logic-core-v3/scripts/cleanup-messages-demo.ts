/**
 * CLEANUP — revierte seed-messages-demo.ts.
 *
 * Borra EXCLUSIVAMENTE los mensajes demo: los que contienen SEED_MARKER
 * (zero-width). Los mensajes reales no se tocan. Idempotente: si no hay nada
 * marcado, borra 0 y termina ok.
 *
 * Correr DESDE logic-core-v3/:
 *   npx ts-node --transpile-only scripts/cleanup-messages-demo.ts --confirm
 *
 * Self-contained (ver nota en seed-messages-demo.ts): sin imports relativos ni
 * __dirname para correr bajo ESM nativo de Node 24 y bajo ts-node CJS.
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'

loadEnv({ path: '.env.local' })

// ⚠ MUST MATCH el SEED_MARKER de seed-messages-demo.ts.
const SEED_MARKER = String.fromCharCode(0x200b, 0x200c, 0x200b)

const prisma = new PrismaClient({ log: ['error'] })

function preflight(): void {
  if (!process.argv.slice(2).includes('--confirm')) {
    console.error('ABORT: faltó --confirm. Este cleanup borra rows de la base de datos.')
    console.error('       Run: npx ts-node --transpile-only scripts/cleanup-messages-demo.ts --confirm')
    process.exit(1)
  }
  const url = process.env.DATABASE_URL ?? ''
  if (!url) {
    console.error('ABORT: DATABASE_URL no está seteada.')
    console.error('       Creá logic-core-v3/.env.local con tu DATABASE_URL de dev (o exportala) y reintentá.')
    process.exit(1)
  }
  const host = url.match(/@([^/]+)/)?.[1] ?? '(host desconocido)'
  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  CLEANUP — Mensajes demo (admin inbox)')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Host:  ${host}`)
  console.log('  Borra: solo mensajes con SEED_MARKER (los reales no se tocan).')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
}

async function main(): Promise<void> {
  preflight()

  const res = await prisma.message.deleteMany({ where: { content: { contains: SEED_MARKER } } })
  console.log(`✓ ${res.count} mensajes demo borrados.`)
  if (res.count === 0) {
    console.log('  (no había nada marcado — nada que revertir)')
  }
}

main()
  .catch((e) => {
    console.error('❌ Cleanup mensajes demo falló:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
