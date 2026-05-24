/**
 * B3.2 — Seed shell de Matsu (concesionaria).
 *
 * Idempotente: usa upserts. Reusa concesionariaTemplate con valores
 * de scaffolding plausibles. Franco reemplaza los datos reales en B2.
 *
 * Run:
 *   npx tsx scripts/seed-matsu.ts
 *
 * Safety:
 *   - Solo crea / actualiza. NUNCA borra.
 *   - Verifica host de Neon antes de tocar nada (debe ser la rama dev).
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { concesionariaTemplate } from '../src/modules/chatbot/components/admin/onboarding/kb-templates/concesionaria'

const prisma = new PrismaClient()

const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

const ORG_SLUG = 'matsu'
const ORG_NAME = 'Matsu'
const USER_EMAIL = 'matsu-admin@dev.local'
const USER_NAME = 'Matsu Admin (scaffolding)'
const BOT_SLUG = 'matsu'
const BOT_NAME = 'Aki'

// Scaffolding values — Franco los reemplaza en B2 con datos reales de Matsu.
const SCAFFOLDING = {
  NOMBRE_CONCESIONARIA: 'Matsu',
  MARCAS_OFICIALES: 'Toyota',
  CIUDAD: 'Tucumán',
  DIAS_ATENCION: 'lunes a sábado',
  HORA_INICIO: '9:00',
  HORA_FIN: '19:00',
  DIRECCION_COMPLETA: 'Av. de scaffolding 1234, San Miguel de Tucumán',
  ANIO_MINIMO_USADOS: '2010',
}

function applyScaffolding(text: string): string {
  let out = text
  for (const [k, v] of Object.entries(SCAFFOLDING)) {
    out = out.replaceAll(`{{${k}}}`, v)
  }
  return out
}

function checkHost(): void {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'
  if (host !== EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host "${host}" no coincide con dev (${EXPECTED_DEV_HOST}).`)
    process.exit(1)
  }
  console.log(`✓ Host dev confirmado: ${host}`)
}

async function main(): Promise<void> {
  checkHost()
  console.log('\n🌱 Seeding Matsu shell (org + user + bot + KB scaffolding)\n')

  // 1. Organization (upsert by slug)
  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: {
      companyName: ORG_NAME,
      onboardingCompleted: true,
    },
    create: {
      companyName: ORG_NAME,
      slug: ORG_SLUG,
      onboardingCompleted: true,
    },
  })
  console.log(`✓ Organization "${org.companyName}" (id ${org.id})`)

  // 2. User admin (upsert by email)
  const passwordHash = await bcrypt.hash('matsu-scaffolding-' + Date.now(), 10)
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {
      name: USER_NAME,
    },
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

  // 3. OrgMember (compound unique on userId+organizationId)
  await prisma.orgMember.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: { role: 'ADMIN' },
    create: {
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN',
    },
  })
  console.log('✓ OrgMember vínculo ADMIN')

  // 4. BotConfig (organizationId es @unique → upsert por organizationId)
  const bot = await prisma.botConfig.upsert({
    where: { organizationId: org.id },
    update: {
      slug: BOT_SLUG,
      botName: BOT_NAME,
      isActive: true,
      welcomeMessage: `Hola, soy ${BOT_NAME} de Matsu. Contame qué buscás y vemos cómo ayudarte.`,
      tone: 'informal_rioplatense',
      industry: 'concesionaria',
      llmProvider: 'google',
      llmModel: 'gemini-2.5-flash',
      monthlyQuota: 1000,
      // Apariencia mínima — Franco la termina en B2
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
      welcomeMessage: `Hola, soy ${BOT_NAME} de Matsu. Contame qué buscás y vemos cómo ayudarte.`,
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

  // 5. KnowledgeBase — template con scaffolding aplicado
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

  // 6. Summary
  console.log('\n─────────────────────────────────────────────')
  console.log('  Matsu shell listo.')
  console.log(`  Org slug:  ${org.slug}`)
  console.log(`  Bot slug:  ${bot.slug}`)
  console.log(`  Bot name:  ${bot.botName}`)
  console.log(`  Tone:      ${bot.tone}`)
  console.log(`  Industry:  ${bot.industry}`)
  console.log('  Datos KB: SCAFFOLDING (Franco reemplaza en B2)')
  console.log('─────────────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed Matsu falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
