/**
 * admin-1a — Backfill del campo persistido OsLead.caliente
 * --------------------------------------------------------------------------
 * Hoy "caliente" es 100% derivado del score (≥4) que vive en el blob
 * `evaluacionJson` del dossier. admin-1a agrega `OsLead.caliente` (columna
 * persistida que Franco marcará a ojo en admin-1b). Para NO perder los calientes
 * vigentes, este script los backfillea UNA vez desde el score actual.
 *
 * Regla de oro: el resultado debe COINCIDIR con la regla score→caliente de
 * admin-0 (`score !== null && score >= SCORE_CALIENTE && stage !== 'DESCARTADA'`),
 * leyendo el schema real (`EvaluacionSchema`) en vez de re-implementar el parseo.
 * Hasta admin-1b esa regla vivía en `esCaliente()`; admin-1b la reapuntó al CAMPO,
 * así que este backfill —mapeo de UNA vez score→campo— lleva su propia copia del
 * umbral (`SCORE_CALIENTE`, fuente única) en vez de llamar la función ya reapuntada
 * (que ahora leería el propio campo: circular). La lectura del score replica
 * `parseEvaluacion` (mismo `safeParse` tolerante): blob inválido/ausente ⇒ no caliente.
 *
 *   objetivo = score !== null && score >= SCORE_CALIENTE && stage !== 'DESCARTADA'
 *
 * Idempotente: setea `caliente` al valor calculado para TODOS los leads (true a
 * los que la regla marca, false al resto), así re-correrlo converge al mismo
 * estado. Solo escribe cuando el valor cambia (evita writes y updatedAt churn).
 *
 * NO toca lecturas ni el score — esas siguen igual hasta admin-1b.
 *
 * Carga de env igual que prisma.config.ts: `.env.local` pisa `.env`.
 *
 * Uso:
 *   npx ts-node scripts/admin-1a-backfill-caliente.ts
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { EvaluacionSchema } from '../src/lib/leados/contracts.ts'
import { SCORE_CALIENTE } from '../src/lib/leados/revision.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const prisma = new PrismaClient()

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está seteada. Verificá logic-core-v3/.env.local.')
  }

  // Una sola lectura: todos los leads con su dossier (score vive en
  // dossier.evaluacionJson, stage en dossier.stage). Un lead sin dossier no
  // tiene score ⇒ no caliente.
  const leads = await prisma.osLead.findMany({
    select: {
      id: true,
      businessName: true,
      caliente: true,
      dossier: { select: { evaluacionJson: true, stage: true } },
    },
  })

  let marcados = 0
  let cambiados = 0

  for (const lead of leads) {
    // Espejo exacto de parseEvaluacion: safeParse tolerante ⇒ score o null.
    const parsed = EvaluacionSchema.safeParse(lead.dossier?.evaluacionJson ?? null)
    const score = parsed.success ? parsed.data.score : null
    const stage = lead.dossier?.stage ?? null
    // Copia propia de la regla score→caliente de admin-0 (esCaliente se reapuntó
    // al campo en admin-1b — ver cabecera).
    const objetivo = score !== null && score >= SCORE_CALIENTE && stage !== 'DESCARTADA'

    if (objetivo) marcados++

    if (lead.caliente !== objetivo) {
      await prisma.osLead.update({
        where: { id: lead.id },
        data: { caliente: objetivo },
      })
      cambiados++
      console.log(
        `  ${objetivo ? '🔥 caliente' : '   frío   '}  ${lead.businessName} (score=${score ?? '—'}, stage=${lead.dossier?.stage ?? '—'})`,
      )
    }
  }

  console.log('')
  console.log(`Leads totales:        ${leads.length}`)
  console.log(`caliente=true (regla): ${marcados}`)
  console.log(`Filas actualizadas:    ${cambiados} (idempotente: 0 si ya estaba backfilleado)`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect()
    console.error('Backfill falló:', error)
    process.exitCode = 1
  })
