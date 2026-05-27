/**
 * B14.2 — Seed de bot dummy en PROD para medir latencias reales.
 *
 * Crea una org/user/bot/KB mínimos con slug "bench-matsu" claramente
 * marcado como bench. Idempotente (upserts). Se borra al cierre del
 * sprint con _b14-2-cleanup-bench-prod.ts.
 *
 * Safety checks (sí, son varios — el costo de un seed en la DB equivocada
 * es alto):
 *   - Requiere flag --confirm explícito.
 *   - Aborta si DATABASE_URL host coincide con el dev branch (EXPECTED_DEV_HOST).
 *   - Aborta si DATABASE_URL contiene "localhost" o "127.0.0.1".
 *   - Aborta si DATABASE_URL no contiene "neon.tech" (no es Neon prod).
 *   - Loggea el host detectado en grande para revisión visual antes de tocar nada.
 *
 * Run:
 *   DATABASE_URL=<prod_neon_url> npx tsx scripts/_b14-2-seed-bench-prod.ts --confirm
 *
 * Throwaway — borrar después del sprint B14.2.
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { concesionariaTemplate } from '../src/modules/chatbot/components/admin/onboarding/kb-templates/concesionaria'

const prisma = new PrismaClient()

const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

const ORG_SLUG = 'bench-matsu'
const ORG_NAME = 'Bench Matsu (B14.2)'
const USER_EMAIL = 'bench-matsu@bench.local'
const USER_NAME = 'Bench Matsu Admin'
const BOT_SLUG = 'bench-matsu'
const BOT_NAME = 'Aki (bench)'

const SCAFFOLDING = {
  NOMBRE_CONCESIONARIA: 'Bench Matsu',
  MARCAS_OFICIALES: 'Toyota',
  CIUDAD: 'Tucumán',
  DIAS_ATENCION: 'lunes a sábado',
  HORA_INICIO: '9:00',
  HORA_FIN: '19:00',
  DIRECCION_COMPLETA: 'Av. Bench 1234, San Miguel de Tucumán',
  ANIO_MINIMO_USADOS: '2010',
}

function applyScaffolding(text: string): string {
  let out = text
  for (const [k, v] of Object.entries(SCAFFOLDING)) {
    out = out.replaceAll(`{{${k}}}`, v)
  }
  return out
}

function preflight(): void {
  const args = process.argv.slice(2)
  if (!args.includes('--confirm')) {
    console.error('ABORT: faltó --confirm. Este script toca la DB de PROD.')
    console.error('       Re-run: DATABASE_URL=<prod> npx tsx scripts/_b14-2-seed-bench-prod.ts --confirm')
    process.exit(1)
  }

  const url = process.env.DATABASE_URL ?? ''
  if (!url) {
    console.error('ABORT: DATABASE_URL no está seteada.')
    process.exit(1)
  }

  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'

  if (host === EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host es el DEV branch (${host}).`)
    console.error('       Este script es para PROD. Re-run con DATABASE_URL de prod.')
    process.exit(1)
  }

  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.error('ABORT: DATABASE_URL apunta a localhost. Este script es para PROD remota.')
    process.exit(1)
  }

  if (!host.includes('neon.tech')) {
    console.error(`ABORT: host "${host}" no parece Neon. Cancelando por seguridad.`)
    process.exit(1)
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  B14.2 — SEED BENCH BOT EN PROD')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Host detectado:   ${host}`)
  console.log(`  Org/Bot slug:     ${ORG_SLUG} / ${BOT_SLUG}`)
  console.log(`  Bot name:         ${BOT_NAME}`)
  console.log('  Cleanup:          npx tsx scripts/_b14-2-cleanup-bench-prod.ts --confirm')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
}

async function main(): Promise<void> {
  preflight()

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: { companyName: ORG_NAME, onboardingCompleted: true },
    create: { companyName: ORG_NAME, slug: ORG_SLUG, onboardingCompleted: true },
  })
  console.log(`✓ Organization "${org.companyName}" (id ${org.id})`)

  // 2. User admin
  const passwordHash = await bcrypt.hash('bench-' + Date.now(), 10)
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: { name: USER_NAME },
    create: {
      email: USER_EMAIL,
      name: USER_NAME,
      role: 'ORG_MEMBER',
      password: passwordHash,
      passwordResetRequired: true,
      emailVerified: new Date(),
    },
  })
  console.log(`✓ User "${user.email}" (id ${user.id})`)

  // 3. OrgMember
  await prisma.orgMember.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: { role: 'ADMIN' },
    create: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
  })
  console.log('✓ OrgMember vínculo ADMIN')

  // 4. BotConfig. allowedDomains queda vacío — usamos el bypass de
  // `develop.com.ar` en validateOrigin (always-allowed) desde el script
  // de medición. isActive=true para que validateOrigin no rechace.
  const bot = await prisma.botConfig.upsert({
    where: { organizationId: org.id },
    update: {
      slug: BOT_SLUG,
      botName: BOT_NAME,
      isActive: true,
      welcomeMessage: `Hola, soy ${BOT_NAME}. Bot de medición B14.2.`,
      tone: 'informal_rioplatense',
      industry: 'concesionaria',
      llmProvider: 'google',
      llmModel: 'gemini-2.5-flash',
      monthlyQuota: 1000,
      accentColor: '#e11d48',
      avatarStyle: 'neuro',
      position: 'bottom_right',
      borderRadius: 'medium',
      surfaceStyle: 'glass',
      quickReplies: concesionariaTemplate.quickReplies as unknown as object,
      proactivePrompts: { default: ['¿Estás buscando 0KM, usado o necesitás taller?'] },
      routeColorMap: {},
    },
    create: {
      organizationId: org.id,
      slug: BOT_SLUG,
      botName: BOT_NAME,
      isActive: true,
      welcomeMessage: `Hola, soy ${BOT_NAME}. Bot de medición B14.2.`,
      tone: 'informal_rioplatense',
      industry: 'concesionaria',
      llmProvider: 'google',
      llmModel: 'gemini-2.5-flash',
      monthlyQuota: 1000,
      accentColor: '#e11d48',
      avatarStyle: 'neuro',
      position: 'bottom_right',
      borderRadius: 'medium',
      surfaceStyle: 'glass',
      quickReplies: concesionariaTemplate.quickReplies as unknown as object,
      proactivePrompts: { default: ['¿Estás buscando 0KM, usado o necesitás taller?'] },
      routeColorMap: {},
    },
  })
  console.log(`✓ BotConfig "${bot.slug}" — ${bot.isActive ? 'ACTIVE' : 'INACTIVE'} (id ${bot.id})`)

  // 5. KnowledgeBase
  const kbData = {
    businessInfo: applyScaffolding(concesionariaTemplate.businessInfo),
    servicesOrProducts: applyScaffolding(concesionariaTemplate.servicesOrProducts),
    faq: applyScaffolding(concesionariaTemplate.faq),
    policies: applyScaffolding(concesionariaTemplate.policies),
    salesGuidance: applyScaffolding(concesionariaTemplate.salesGuidance),
    toneExamples: applyScaffolding(concesionariaTemplate.toneExamples),
    forbiddenStatements: applyScaffolding(concesionariaTemplate.forbiddenStatements),
  }
  const kb = await prisma.knowledgeBase.upsert({
    where: { botConfigId: bot.id },
    update: kbData,
    create: { botConfigId: bot.id, ...kbData },
  })
  console.log(`✓ KnowledgeBase (id ${kb.id})`)

  console.log('')
  console.log('─────────────────────────────────────────────')
  console.log('  ✅ Bench bot listo en PROD.')
  console.log(`  URL:  https://develop-portfolio.netlify.app/api/chatbot/${BOT_SLUG}/chat`)
  console.log(`  Slug: ${BOT_SLUG}`)
  console.log('  Origin recomendado para curlear: https://develop.com.ar')
  console.log('─────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed bench prod falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
