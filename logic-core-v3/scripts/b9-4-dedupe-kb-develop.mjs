#!/usr/bin/env node
/**
 * B9.4 — Dedupe líneas duplicadas en la KB de develOP.
 *
 * Contexto: el subagente Explore detectó que en la KB de la org `develop`
 *   - `businessInfo` tiene la línea "Agencia tecnológica argentina..." repetida 6 veces
 *   - `toneExamples` tiene el separador `---` duplicado
 * Causa probable: parser/seed que apendeó en lugar de sobrescribir.
 *
 * Este script dedupea LÍNEAS dentro de los 7 campos de texto de la KB,
 * preservando la PRIMERA ocurrencia de cada línea y el orden relativo.
 *
 * REGLAS DE SEGURIDAD (no negociables):
 *   1. Filtra por slug `develop` → resuelve botConfigId → KB. JAMÁS toca otra org.
 *   2. Default es DRY-RUN: no escribe nada en DB, solo imprime diff y counts.
 *   3. Solo aplica con flag explícito `--apply`. Sin el flag, exit 0 sin tocar.
 *   4. El --apply corre dentro de una transacción Prisma con count antes/después.
 *
 * USO:
 *   node scripts/b9-4-dedupe-kb-develop.mjs           # dry-run (default)
 *   node scripts/b9-4-dedupe-kb-develop.mjs --apply   # ejecuta el UPDATE
 *
 * Requiere: estar en logic-core-v3/ con .env.local apuntando a Neon dev.
 *
 * Salida del dry-run:
 *   - botConfigId resuelto (para que confirmes que es el bot correcto)
 *   - Por cada campo con duplicados: líneas que se eliminan (con preview)
 *   - Diff resumido: chars antes vs después, líneas antes vs después
 *   - Texto completo "antes" y "después" de cada campo afectado (acotado a 800 chars)
 */

import { PrismaClient } from '@prisma/client'

const ORG_SLUG = 'develop'
const TARGET_FIELDS = [
  'businessInfo',
  'servicesOrProducts',
  'faq',
  'policies',
  'salesGuidance',
  'toneExamples',
  'forbiddenStatements',
]

const APPLY = process.argv.includes('--apply')

const prisma = new PrismaClient()

function dedupeLines(text) {
  if (!text) return { result: text ?? '', removed: [], beforeLines: 0, afterLines: 0 }

  const lines = text.split(/\r?\n/)
  const seen = new Set()
  const kept = []
  const removed = []

  for (const line of lines) {
    const norm = line.trim()
    // Líneas vacías se preservan TODAS (no son "duplicación" de contenido).
    if (norm === '') {
      kept.push(line)
      continue
    }
    if (seen.has(norm)) {
      removed.push(line)
      continue
    }
    seen.add(norm)
    kept.push(line)
  }

  return {
    result: kept.join('\n'),
    removed,
    beforeLines: lines.length,
    afterLines: kept.length,
  }
}

function trunc(s, n = 800) {
  if (!s) return ''
  if (s.length <= n) return s
  return s.slice(0, n) + `\n…[${s.length - n} chars más]`
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  B9.4 — Dedupe KB de develOP — modo: ${APPLY ? 'APPLY (ESCRIBE DB)' : 'DRY-RUN (no escribe)'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 1. Resolver org por slug. SCOPE STRICTO: solo `develop`.
  const org = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
    select: {
      id: true,
      slug: true,
      companyName: true,
      botConfig: {
        select: {
          id: true,
          slug: true,
          botName: true,
          knowledgeBase: {
            select: {
              id: true,
              businessInfo: true,
              servicesOrProducts: true,
              faq: true,
              policies: true,
              salesGuidance: true,
              toneExamples: true,
              forbiddenStatements: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  })

  if (!org) {
    console.error(`❌ No existe Organization con slug="${ORG_SLUG}". Abortando sin tocar nada.`)
    process.exit(1)
  }
  if (!org.botConfig) {
    console.error(`❌ La org "${org.slug}" no tiene botConfig. Abortando.`)
    process.exit(1)
  }
  if (!org.botConfig.knowledgeBase) {
    console.error(`❌ El bot "${org.botConfig.slug}" no tiene knowledgeBase. Abortando.`)
    process.exit(1)
  }

  const { id: organizationId, companyName } = org
  const { id: botConfigId, slug: botSlug, botName, knowledgeBase: kb } = org.botConfig

  console.log()
  console.log('🎯 Target confirmado:')
  console.log(`   organizationId : ${organizationId}`)
  console.log(`   companyName    : ${companyName}`)
  console.log(`   slug           : ${org.slug}`)
  console.log(`   botConfigId    : ${botConfigId}`)
  console.log(`   botSlug        : ${botSlug}`)
  console.log(`   botName        : ${botName}`)
  console.log(`   knowledgeBaseId: ${kb.id}`)
  console.log(`   kb updatedAt   : ${kb.updatedAt.toISOString()}`)
  console.log()

  // 2. Calcular dedupe por campo. Solo procesar campos con cambios reales.
  const changes = []
  for (const field of TARGET_FIELDS) {
    const before = kb[field] ?? ''
    const { result, removed, beforeLines, afterLines } = dedupeLines(before)
    if (removed.length === 0) continue
    changes.push({ field, before, after: result, removed, beforeLines, afterLines })
  }

  if (changes.length === 0) {
    console.log('✅ La KB de develOP no tiene líneas duplicadas. Nada que limpiar.')
    await prisma.$disconnect()
    return
  }

  console.log(`📋 Campos con duplicación: ${changes.length} de ${TARGET_FIELDS.length}`)
  console.log()

  for (const c of changes) {
    console.log('────────────────────────────────────────────────────────────────')
    console.log(`📝 Campo: ${c.field}`)
    console.log(`   Líneas antes : ${c.beforeLines}`)
    console.log(`   Líneas después: ${c.afterLines}`)
    console.log(`   Eliminadas    : ${c.removed.length}`)
    console.log(`   Chars antes   : ${c.before.length}`)
    console.log(`   Chars después : ${c.after.length}`)
    console.log()
    console.log('   ✂  Líneas que se eliminan (preservando la 1ª ocurrencia):')
    c.removed.forEach((line, i) => {
      const preview = line.length > 120 ? line.slice(0, 117) + '...' : line
      console.log(`     [${i + 1}] "${preview}"`)
    })
    console.log()
    console.log('   ── ANTES ──────────────────────────────────────────────────')
    console.log(trunc(c.before))
    console.log('   ── DESPUÉS ────────────────────────────────────────────────')
    console.log(trunc(c.after))
    console.log()
  }

  // 3. Si dry-run, terminar acá.
  if (!APPLY) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  DRY-RUN — no se escribió nada en la DB.')
    console.log('  Para aplicar: node scripts/b9-4-dedupe-kb-develop.mjs --apply')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    await prisma.$disconnect()
    return
  }

  // 4. APPLY — Update dentro de transacción, con guard final de scope.
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ⚠  APPLY MODE — se va a escribir en la DB.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const updateData = {}
  for (const c of changes) {
    updateData[c.field] = c.after
  }

  await prisma.$transaction(async (tx) => {
    // Double-check del scope: re-resolvemos el botConfigId desde la org slug
    // y validamos que coincide con el que ya teníamos. Defensa contra cualquier
    // cambio de estado raro entre el SELECT inicial y el UPDATE.
    const recheck = await tx.organization.findUnique({
      where: { slug: ORG_SLUG },
      select: { botConfig: { select: { id: true, knowledgeBase: { select: { id: true } } } } },
    })
    if (!recheck?.botConfig || recheck.botConfig.id !== botConfigId) {
      throw new Error(`Scope guard fallido: botConfigId cambió entre SELECT y UPDATE. Abortando.`)
    }
    if (recheck.botConfig.knowledgeBase?.id !== kb.id) {
      throw new Error(`Scope guard fallido: knowledgeBaseId cambió. Abortando.`)
    }

    await tx.knowledgeBase.update({
      where: { id: kb.id },
      data: updateData,
    })
  })

  // 5. Verificación post-update: releer y confirmar counts.
  const after = await prisma.knowledgeBase.findUnique({
    where: { id: kb.id },
    select: Object.fromEntries(TARGET_FIELDS.map((f) => [f, true])),
  })

  console.log()
  console.log('✅ UPDATE aplicado. Verificación post:')
  for (const c of changes) {
    const newLines = (after[c.field] ?? '').split(/\r?\n/).length
    const ok = newLines === c.afterLines
    console.log(`   ${c.field}: ${newLines} líneas (esperado ${c.afterLines}) ${ok ? '✓' : '✗'}`)
  }
  console.log()

  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('❌ Error:', err.message)
  await prisma.$disconnect()
  process.exit(1)
})
