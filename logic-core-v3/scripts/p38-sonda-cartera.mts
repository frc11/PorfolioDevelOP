/**
 * P38 · SONDA DE LA CARTERA — solo lectura.
 *
 * Fotografía lo que las superficies agregadas de `/setter` le muestran a
 * `setter-qa` (la persona compartida por las suites) y simula, con las funciones
 * del producto, cómo quedaría la cola bajo los reordenamientos candidatos del
 * experimento «otro orden». No escribe nada.
 *
 * Uso: npx tsx scripts/p38-sonda-cartera.mts
 */
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST, categoriaDe } from './dev/siembra-categorias.mts'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const { particionarCartera } = await import('@/lib/leados/flow')
  const { seleccionarFoco } = await import('@/lib/leados/foco')
  const { armarCola } = await import('@/lib/leados/cola')
  type HL = ReturnType<typeof buildHomeLeads>[number]

  const qa = await prisma.user.findUniqueOrThrow({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, role: true },
  })
  const owned = await listOwnedLeads(qa.id)
  const home = buildHomeLeads(owned)
  const particion = particionarCartera(home)

  const colaDe = (leads: HL[]) => {
    const p = particionarCartera(leads)
    const sel = seleccionarFoco(p.grupos.trabajar, null)
    return armarCola(sel.foco, sel.resto)
  }
  const fila = (l: HL) =>
    `${l.businessName.padEnd(44)} ${String(l.stage).padEnd(12)} ${String(l.status).padEnd(12)} pin=${l.pinned ? 1 : 0} · ${l.proximaAccion}`

  console.log(`=== setter-qa (${qa.role}) · cartera ${home.length} ===`)
  for (const [g, ls] of Object.entries(particion.grupos)) console.log(`  grupo ${g.padEnd(12)} ${ls.length}`)
  console.log(`  fijados no accionables ${particion.fijados.length} · pausados ${particion.pausados.length}`)

  const cola = colaDe(home)
  console.log(`\n--- COLA HOY (total ${cola.total}, ocultos ${cola.ocultos}) ---`)
  cola.items.forEach((it, i) => console.log(`  ${i + 1}. ${fila(it.lead)}`))

  // Avisos dirigidos a setter-qa (el panel de Novedades lee por destinatario).
  const avisos = await prisma.osSetterNotice.findMany({
    where: { setterId: qa.id },
    select: { kind: true, read: true, leadId: true, createdAt: true, title: true },
    orderBy: { createdAt: 'desc' },
  })
  const sinLeer = avisos.filter((a) => !a.read)
  console.log(`\n--- AVISOS de setter-qa: ${avisos.length} (sin leer ${sinLeer.length}) ---`)
  const ownedIds = new Set(home.map((l) => l.id))
  for (const a of sinLeer.slice(0, 12)) {
    const lead = home.find((l) => l.id === a.leadId)
    console.log(
      `  ${a.kind.padEnd(26)} ${a.createdAt.toISOString()} lead=${a.leadId ? (ownedIds.has(a.leadId) ? lead?.businessName : '(no es suyo)') : '-'}`,
    )
  }

  // Los avisos CON lead: en qué puesto de la lectura caen (el panel lee los 50 más
  // nuevos) y si su lead está en la cola (ahí se deduplican). Separa «lo cortó el
  // tope» de «lo sacó el dedup».
  const idsCola = new Set(cola.items.map((i) => i.lead.id))
  avisos.forEach((a, puesto) => {
    if (!a.leadId || a.read) return
    const lead = home.find((l) => l.id === a.leadId)
    console.log(
      `  aviso con lead · puesto ${puesto + 1} de ${avisos.length} · ${a.kind} · ${lead?.businessName ?? '(no es suyo)'} · ` +
        `${puesto >= 50 ? 'FUERA del tope de 50' : 'dentro del tope'} · ${a.leadId && idsCola.has(a.leadId) ? 'lead EN la cola (dedup)' : 'lead fuera de la cola'}`,
    )
  })

  // Lo que el panel de Novedades DIBUJA: la misma llamada que el page, con el
  // dedup contra la cola y los estados para la vigencia.
  const { getNovedadesSetter } = await import('@/lib/leados/novedades')
  const { idsEnCola } = await import('@/lib/leados/cola')
  const vista = await getNovedadesSetter(qa.id, owned, { excludeLeadIds: idsEnCola(cola), estados: home })
  console.log(
    `\n--- NOVEDADES DIBUJADAS: ${vista.filas.length} filas · ocultos ${vista.ocultos} · sin leer ${vista.totalSinLeer} · revisión ${vista.revision ? vista.revision.total : 0} ---`,
  )
  for (const f of vista.filas) {
    const lead = home.find((l) => l.id === f.leadId)
    console.log(
      `  ${f.kind.padEnd(26)} ×${f.cantidad} ${f.vigente ? 'vigente ' : 'CADUCO  '} lead=${lead?.businessName ?? '-'}${f.enSuLugar ? ` · Ahora: ${f.enSuLugar}` : ''}`,
    )
  }

  // Contactos comerciales de setter-qa en los últimos 7 días («Tu semana»).
  const desde = new Date(Date.now() - 7 * 86_400_000)
  const contactos = await prisma.osLeadActivity.count({
    where: { performedById: qa.id, createdAt: { gte: desde }, channel: { not: 'SISTEMA' } },
  })
  console.log(`\ncontactos de setter-qa en 7 días: ${contactos}`)

  // Metas de setter-qa (pin/snooze/nota) sobre leads que ya no son suyos.
  const metas = await prisma.osLeadSetterMeta.findMany({
    where: { setterId: qa.id },
    select: { leadId: true, pinned: true, snoozedUntil: true, note: true },
  })
  console.log(
    `metas de setter-qa: ${metas.length} · pinned ${metas.filter((m) => m.pinned).length} · sobre leads ajenos ${metas.filter((m) => !ownedIds.has(m.leadId)).length}`,
  )

  // ── Simulación «otro orden» ────────────────────────────────────────────────
  // (a) espejo de createdAt entre las semillas: invierte la antigüedad dentro de
  //     cada tier sin sacar a nadie del rango de fechas existente.
  const ts = home.map((l) => l.createdAt.getTime())
  const min = Math.min(...ts)
  const max = Math.max(...ts)
  const espejo = home.map((l) => ({ ...l, createdAt: new Date(min + (max - l.createdAt.getTime())) }))
  const colaEspejo = colaDe(espejo)
  console.log(`\n--- COLA con createdAt ESPEJADO (rango ${new Date(min).toISOString()} … ${new Date(max).toISOString()}) ---`)
  colaEspejo.items.forEach((it, i) => console.log(`  ${i + 1}. ${fila(it.lead)}`))

  // (b) sin pines: los dos fijados vuelven a su lugar por urgencia.
  const sinPines = home.map((l) => ({ ...l, pinned: false }))
  const colaSinPines = colaDe(sinPines)
  console.log(`\n--- COLA SIN PINES ---`)
  colaSinPines.items.forEach((it, i) => console.log(`  ${i + 1}. ${fila(it.lead)}`))

  const idsHoy = new Set(cola.items.map((i) => i.lead.id))
  const comun = (c: typeof cola) => c.items.filter((i) => idsHoy.has(i.lead.id)).length
  console.log(`\ncomunes con la cola de hoy: espejo ${comun(colaEspejo)}/5 · sin pines ${comun(colaSinPines)}/5`)

  const porCat = new Map<string, number>()
  for (const l of home) porCat.set(categoriaDe(l.businessName), (porCat.get(categoriaDe(l.businessName)) ?? 0) + 1)
  console.log('cartera por categoría: ' + JSON.stringify(Object.fromEntries(porCat)))

  const roles = await prisma.user.groupBy({ by: ['role'], _count: { _all: true } })
  console.log('usuarios por rol: ' + JSON.stringify(roles.map((r) => [r.role, r._count._all])))

  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
