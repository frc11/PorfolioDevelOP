/**
 * P37 · EL CENSO DE SIEMBRA — solo lectura.
 *
 * Cuenta OsLead por CATEGORÍA × setter, con criterios OBJETIVOS escritos (un
 * patrón sobre `businessName`, nunca una lista de nombres). Es el instrumento de
 * «conteo antes y después»: se corre antes y después de cada corrida de suite y
 * de cada borrado, y opcionalmente escribe un snapshot JSON de ids para poder
 * diferenciar QUÉ filas agregó una corrida.
 *
 * Uso:
 *   npx tsx scripts/p37-censo-siembra.mts
 *   CENSO_OUT=docs/p37-cola-urgencia/censo-f0.json npx tsx scripts/p37-censo-siembra.mts
 */
import fs from 'fs'
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

import { CATEGORIAS, DEV_BRANCH_HOST, categoriaDe, type CategoriaId } from './dev/siembra-categorias.mts'

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { particionarCartera } = await import('@/lib/leados/flow')

  const leads = await prisma.osLead.findMany({
    select: { id: true, businessName: true, createdAt: true, assignedToId: true, assignedTo: { select: { email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const tabla = new Map<string, Map<CategoriaId, number>>()
  for (const l of leads) {
    const setter = l.assignedTo?.email ?? '(sin asignar)'
    const fila = tabla.get(setter) ?? new Map<CategoriaId, number>()
    const cat = categoriaDe(l.businessName)
    fila.set(cat, (fila.get(cat) ?? 0) + 1)
    tabla.set(setter, fila)
  }

  console.log('=== CENSO OsLead · total ' + leads.length + ' ===')
  console.log('criterios:')
  for (const c of CATEGORIAS) console.log('  ' + c.id.padEnd(20) + c.criterio)
  const cols = CATEGORIAS.map((c) => c.id)
  console.log('\n' + 'setter'.padEnd(46) + cols.map((c) => c.slice(0, 12).padStart(13)).join('') + '  total')
  const totales = new Map<CategoriaId, number>()
  for (const [setter, fila] of [...tabla.entries()].sort()) {
    let t = 0
    const celdas = cols.map((c) => {
      const v = fila.get(c) ?? 0
      t += v
      totales.set(c, (totales.get(c) ?? 0) + v)
      return String(v).padStart(13)
    })
    console.log(setter.slice(0, 45).padEnd(46) + celdas.join('') + String(t).padStart(7))
  }
  console.log('TOTAL'.padEnd(46) + cols.map((c) => String(totales.get(c) ?? 0).padStart(13)).join('') + String(leads.length).padStart(7))

  // La cartera de setter-qa: cuántos accionables y de qué categoría.
  const qa = await prisma.user.findUnique({ where: { email: 'setter-qa@develop.test' }, select: { id: true } })
  if (qa) {
    const home = buildHomeLeads(await listOwnedLeads(qa.id))
    const trabajar = particionarCartera(home).grupos.trabajar
    const porCat = new Map<CategoriaId, number>()
    for (const l of trabajar) porCat.set(categoriaDe(l.businessName), (porCat.get(categoriaDe(l.businessName)) ?? 0) + 1)
    console.log('\n=== setter-qa · cartera ' + home.length + ' · accionables ' + trabajar.length + ' ===')
    for (const c of cols) console.log('  accionables ' + c.padEnd(20) + (porCat.get(c) ?? 0))
  }

  if (process.env.CENSO_OUT) {
    fs.writeFileSync(
      process.env.CENSO_OUT,
      JSON.stringify(
        leads.map((l) => ({
          id: l.id,
          businessName: l.businessName,
          categoria: categoriaDe(l.businessName),
          setter: l.assignedTo?.email ?? null,
          createdAt: l.createdAt.toISOString(),
        })),
        null,
        1,
      ),
    )
    console.log('\nsnapshot → ' + process.env.CENSO_OUT)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
