/**
 * P38 · LAS DEMOSTRACIONES — el dato que tiraba cada prueba, sembrado a propósito.
 *
 * El censo por FORMA encuentra premisas que ninguno de los tres experimentos de
 * cartera (menos / orden / más) llega a tocar, porque la cartera de hoy no trae el
 * dato que las rompe. Para demostrar que la premisa existe —y que el arreglo la
 * saca— se siembra ese dato, se corre la prueba vieja y la nueva, y se borra.
 *
 * Cuatro escenarios, todos «más datos» que ocurren sin que nada se rompa:
 *
 *   avisos-caducos     dos leads de setter-qa con un aviso viejo cada uno: uno
 *                      aprobado esperando al negocio y uno aprobado sin el link de
 *                      Franco. Sus avisos caducan y el panel de Novedades dibuja
 *                      «Ahora: <proximaAccion>» — las mismas frases que 18-quinta
 *                      1b y 2a afirmaban ausentes sobre la página entera.
 *   postergado-sin-fecha  un postergado sin fecha de vuelta con un aviso viejo:
 *                      «Ahora: Postergado — se retoma cuando se reactive» (17-datos 1a).
 *   sobrante-palancas  un «Palancas Target» de una corrida matada de 03-cabina: el
 *                      mismo nombre base, otro stamp, más viejo.
 *   agenda-ambigua     dos organizaciones con agenda de Cal.com cargada: el gate de
 *                      la agenda cambia de aviso sin salir a la red (19 · B2).
 *
 * Todo lo sembrado se registra por id y `--limpiar` lo borra por id y verifica que
 * no quede nada. No toca una sola fila que no haya creado.
 *
 * Uso:
 *   npx tsx scripts/p38-demostraciones.mts --sembrar=avisos-caducos --registro=C:/tmp/p38-experimentos/demo-avisos.json
 *   npx tsx scripts/p38-demostraciones.mts --limpiar=C:/tmp/p38-experimentos/demo-avisos.json
 */
import fs from 'fs'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'
import { createLead, createNotice, getSetterQa, newTracker, prisma } from '../tests/helpers/setter-db.ts'

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

type Registro = { escenario: string; leadIds: string[]; avisoIds: string[]; orgIds: string[] }

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

async function sembrar(escenario: string, destino: string): Promise<Registro> {
  const registro: Registro = { escenario, leadIds: [], avisoIds: [], orgIds: [] }
  const tracker = newTracker()
  // El registro se escribe DESPUÉS DE CADA fila creada, no al final: si el proceso muere a
  // mitad de un escenario, lo creado hasta ahí sigue listado y `--limpiar` lo alcanza.
  const anotar = () => {
    registro.leadIds = [...tracker.leadIds]
    fs.writeFileSync(destino, JSON.stringify(registro, null, 2))
  }
  anotar()
  const qa = await getSetterQa()

  if (escenario === 'avisos-caducos') {
    // Aprobado con link, el negocio no contestó: «Le toca al negocio — la demo está aprobada…».
    const negocio = await createLead(tracker, {
      setterId: qa.id,
      exactName: 'P38 DEMO Espera Negocio',
      stage: 'APROBADA',
      status: 'PROSPECTO',
      finalUrl: 'https://p38-demo.example.com',
    })
    anotar()
    // Aprobado sin el link de Franco: «Le toca a Franco — todavía no cargó su link permanente».
    const sinLink = await createLead(tracker, {
      setterId: qa.id,
      exactName: 'P38 DEMO Sin Link',
      stage: 'APROBADA',
      status: 'RESPONDIO',
      sinFinalUrl: true,
    })
    anotar()
    for (const lead of [negocio, sinLink]) {
      const id = await createNotice({
        setterId: qa.id,
        leadId: lead.id,
        kind: 'DEMO_RECHAZADA',
        title: 'Franco pidió cambios',
        body: `${lead.businessName}: la demo volvió con correcciones. Reabrí la construcción y rehacé.`,
      })
      registro.avisoIds.push(id)
      anotar()
    }
  } else if (escenario === 'postergado-sin-fecha') {
    // Un postergado SIN fecha de reactivación con un aviso viejo: el panel dibuja
    // «Ahora: Postergado — se retoma cuando se reactive», la frase que 17-datos 1a
    // afirmaba ausente sobre la página entera.
    const postergado = await createLead(tracker, {
      setterId: qa.id,
      exactName: 'P38 DEMO Postergado Sin Fecha',
      stage: 'EVALUADA',
      status: 'POSTERGADO',
      reactivateAt: null,
    })
    anotar()
    const id = await createNotice({
      setterId: qa.id,
      leadId: postergado.id,
      kind: 'DEMO_RECHAZADA',
      title: 'Franco pidió cambios',
      body: `${postergado.businessName}: la demo volvió con correcciones. Reabrí la construcción y rehacé.`,
    })
    registro.avisoIds.push(id)
    anotar()
  } else if (escenario === 'sobrante-palancas') {
    const sobrante = await createLead(tracker, {
      setterId: qa.id,
      exactName: 'SMOKE-SETTER Palancas Target 1780000000000',
      stage: 'FICHA',
    })
    anotar()
    // Una corrida matada de antes: más viejo que cualquier lead que siembre el test.
    await prisma.osLead.update({
      where: { id: sobrante.id },
      data: { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    })
  } else if (escenario === 'agenda-ambigua') {
    const stamp = Date.now()
    for (const n of [1, 2]) {
      const org = await prisma.organization.create({
        data: {
          companyName: `P38 DEMO agenda ${n} (borrar)`,
          slug: `p38-demo-agenda-${n}-${stamp}`,
          calComUsername: `p38-demo-${n}`,
          calComEmbedUrl: `https://cal.com/p38-demo-${n}/reunion`,
        },
        select: { id: true },
      })
      registro.orgIds.push(org.id)
      anotar()
    }
  } else {
    throw new Error(`escenario desconocido: ${escenario}`)
  }

  anotar()
  return registro
}

async function limpiar(registro: Registro): Promise<void> {
  const [avisos, leads, orgs] = await prisma.$transaction([
    prisma.osSetterNotice.deleteMany({ where: { id: { in: registro.avisoIds } } }),
    prisma.osLead.deleteMany({ where: { id: { in: registro.leadIds } } }),
    prisma.organization.deleteMany({ where: { id: { in: registro.orgIds } } }),
  ])
  console.log(`borrados: ${leads.count} leads · ${avisos.count} avisos · ${orgs.count} organizaciones`)
  const quedan = await Promise.all([
    prisma.osLead.count({ where: { id: { in: registro.leadIds } } }),
    prisma.osSetterNotice.count({ where: { id: { in: registro.avisoIds } } }),
    prisma.organization.count({ where: { id: { in: registro.orgIds } } }),
  ])
  if (quedan.some((n) => n > 0)) throw new Error(`quedaron filas sembradas: ${quedan.join('/')}`)
  console.log('nada de lo sembrado quedó en la base')
}

async function main() {
  const escenario = arg('sembrar')
  const aLimpiar = arg('limpiar')
  if (escenario) {
    const destino = arg('registro')
    if (!destino) throw new Error('--sembrar exige --registro=<archivo.json>')
    if (fs.existsSync(destino)) throw new Error(`el registro ya existe (¿quedó sin limpiar?): ${destino}`)
    const registro = await sembrar(escenario, destino)
    console.log(
      `sembrado «${escenario}»: ${registro.leadIds.length} leads · ${registro.avisoIds.length} avisos · ` +
        `${registro.orgIds.length} organizaciones → ${destino}`,
    )
  } else if (aLimpiar) {
    const crudo: unknown = JSON.parse(fs.readFileSync(aLimpiar, 'utf8'))
    const r = crudo as Registro
    if (!Array.isArray(r.leadIds) || !Array.isArray(r.avisoIds) || !Array.isArray(r.orgIds)) {
      throw new Error(`registro ilegible: ${aLimpiar}`)
    }
    await limpiar(r)
    fs.renameSync(aLimpiar, `${aLimpiar}.limpiado`)
  } else {
    throw new Error('--sembrar=<escenario> --registro=<archivo> | --limpiar=<archivo>')
  }
  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
