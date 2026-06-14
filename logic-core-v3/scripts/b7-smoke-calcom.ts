/**
 * B7 — Smoke test de la integración Cal.com v2: crear→cancelar REAL.
 *
 * Valida contra la cuenta real de Franco (la config cargada en la org,
 * setup B7.0) que el ciclo completo anda ANTES de tocar la UI:
 *   1. Pide slots reales de los próximos días (los imprime).
 *   2. Crea un booking de PRUEBA en el primer slot (escribe en el Google
 *      Calendar conectado y dispara el mail nativo de confirmación).
 *   3. Lo cancela inmediatamente (el evento desaparece del calendario).
 *
 * Si el setup B7.0 no está (org sin calComUsername/slug), lo reporta y sale
 * sin romper. Corre SOLO contra la branch Neon dev (host check abajo).
 *
 * Uso: npx tsx scripts/b7-smoke-calcom.ts
 *   - B7_SMOKE_EMAIL (opcional): email del attendee de prueba — usá uno tuyo,
 *     Cal.com le manda la confirmación real.
 */
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error(
    `ABORT: DATABASE_URL no apunta a la branch Neon dev (${DEV_BRANCH_HOST}-*). ` +
      'Este script solo corre contra dev.',
  )
  process.exit(1)
}

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { getCalConfigLeadOS, elegirTresSlots, rangoOferta } = await import(
    '../src/lib/leados/agenda'
  )
  const { getSlots, createBooking, cancelBooking, TIMEZONE_AGENDA } = await import(
    '../src/lib/integrations/cal-com-v2'
  )
  const { formatFechaHora } = await import('../src/lib/leados/flow')

  console.log('— B7 SMOKE · Cal.com v2 crear→cancelar —\n')

  const config = await getCalConfigLeadOS()
  if (!config.ok) {
    console.log(`⏸️  BLOQUEADO (sin romper): ${config.motivo}`)
    console.log('\nCuando el setup B7.0 esté hecho, volvé a correr este script.')
    process.exit(0)
  }
  console.log(`✅ Config: username=${config.username} · eventTypeSlug=${config.eventTypeSlug}`)

  // 1. Slots reales
  const rango = rangoOferta()
  console.log(`\n1) Pidiendo slots ${rango.start} → ${rango.end} (${TIMEZONE_AGENDA})...`)
  const slots = await getSlots({
    username: config.username,
    eventTypeSlug: config.eventTypeSlug,
    start: rango.start,
    end: rango.end,
  })
  const dias = Object.keys(slots).filter((dia) => slots[dia].length > 0).sort()
  if (dias.length === 0) {
    console.error('❌ Cal.com no devolvió NINGÚN slot libre en la ventana — revisá la disponibilidad del event type.')
    process.exit(1)
  }
  for (const dia of dias.slice(0, 5)) {
    console.log(`   ${dia}: ${slots[dia].length} slots (primero: ${slots[dia][0].start})`)
  }
  const oferta = elegirTresSlots(slots)
  console.log(`   Oferta de 3 (la que vería el setter):`)
  for (const slot of oferta) console.log(`     · ${formatFechaHora(slot)}  [${slot}]`)

  // 2. Booking de prueba en el primer slot
  const slotElegido = oferta[0]
  const attendeeEmail = process.env.B7_SMOKE_EMAIL?.trim() || 'francopizzi2003@gmail.com'
  console.log(`\n2) Creando booking de PRUEBA en ${slotElegido} (attendee: ${attendeeEmail})...`)
  const booking = await createBooking({
    username: config.username,
    eventTypeSlug: config.eventTypeSlug,
    startUtc: new Date(slotElegido).toISOString(),
    attendee: { name: 'SMOKE TEST B7 — se cancela solo', email: attendeeEmail },
    metadata: { leadId: 'b7-smoke-test', smoke: 'true' },
  })
  console.log(`   ✅ Booking creado: uid=${booking.uid} · status=${booking.status}`)
  console.log('   → Mirá tu Google Calendar: el evento tiene que estar AHÍ ahora.')

  // 3. Cancelación inmediata (reversibilidad)
  console.log('\n3) Cancelando el booking de prueba...')
  await cancelBooking(booking.uid, 'Smoke test B7 (LeadOS) — cancelación automática')
  console.log('   ✅ Cancelado.')

  console.log('\n— SMOKE OK — Confirmá a mano: el evento apareció y desapareció del')
  console.log('  Google Calendar, y llegaron los mails nativos de Cal.com (confirmación')
  console.log('  y cancelación) al attendee de prueba.')
}

main()
  .catch((error) => {
    console.error('\n❌ SMOKE FALLÓ:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/lib/prisma')
    await prisma.$disconnect()
  })
