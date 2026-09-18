/**
 * P41 · EL PESO DE LA CONSULTA DE LA CARTERA — branch Neon dev, y nada más.
 *
 * Complementa `scripts/p40-peso-brief.mts` (el instrumento que dejó P40; P41 lo
 * corrió tal cual antes y después) con lo que aquel no desglosa: DE QUÉ está
 * hecho el peso, columna por columna, y cuánto cambia el recorte medido en la
 * misma corrida.
 *
 * ⚠️ Después de P41, `p40-peso-brief.mts` lee `briefJson` del resultado de
 * `listOwnedLeads`, que ya no lo trae: su «briefs de la home» da 0 por
 * construcción (cierto, porque el brief no viaja, pero no porque pese cero) y su
 * bloque de transferencia corre sobre 0 filas. Para comparar la carga con y sin
 * brief, la vara es `--medir` / `--proyectar` de acá, que miden contra la
 * consulta de partida.
 *
 * Dos modos:
 *
 *   --medir (solo lectura)
 *     Sobre la cartera de `setter-qa`:
 *       · bytes por carga de `listOwnedLeads` (JSON, la misma vara que P40) y
 *         desglose por columna del lead, del dossier, `_count` y metas;
 *       · tiempo de `listOwnedLeads` contra la consulta de PARTIDA, intercaladas
 *         (A, B, A, B…) para que la red de un momento no favorezca a ninguna.
 *     La consulta de partida es `CONSULTA_PARTIDA`, abajo: la de `ownership.ts`
 *     antes de P41, con `dossier: true`. Es una copia, y por eso se verifica: con
 *     `--verificar-copia` (en el código de partida) sale idéntica, byte por byte,
 *     a la función real.
 *
 *   --proyectar (escribe y borra por id)
 *     La pregunta de P40 —¿cuánto pesa la carga cuando los briefs traen el
 *     documento?— medida en la base y no en una cuenta: siembra un setter
 *     temporal con una COPIA de la cartera de `setter-qa` (mismos blobs), donde
 *     cada brief se reemplaza por uno con el documento de la vuelta 4 a 1.200
 *     palabras + lectura + decisiones (la opción que P40 eligió). Mide las dos
 *     consultas sobre esa copia y la borra por id en `finally`. Cada alta se
 *     anota en el registro de siembra de P39 al crearse: si el proceso muere
 *     antes del `finally`, la próxima corrida de una suite la borra por id.
 *
 * Uso:
 *   npx tsx scripts/p41-peso-consulta.mts --medir [--vueltas=21] [--salida=<json>] [--verificar-copia]
 *   npx tsx scripts/p41-peso-consulta.mts --proyectar [--vueltas=21] [--salida=<json>]
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import type { Prisma, PrismaClient } from '@prisma/client'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'
import {
  CUERPO_DOCUMENTO,
  DOCUMENTO_CON_HUECOS_ANTES,
  DOCUMENTO_COMPLETO,
  ENCABEZADO_EXACTO,
  VALORES_ENCABEZADO,
  VUELTA_DECISIONES,
  VUELTA_LECTURA,
} from '../tests/helpers/documento-construccion-fixtures.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null
const flag = (nombre: string) => process.argv.includes(`--${nombre}`)

const QA_EMAIL = 'setter-qa@develop.test'
const bytes = (v: unknown) => (v === undefined ? 0 : Buffer.byteLength(JSON.stringify(v), 'utf8'))
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`
const mediana = (xs: number[]) => {
  const o = [...xs].sort((a, b) => a - b)
  return o[Math.floor(o.length / 2)]!
}

/**
 * La consulta de `listOwnedLeads` ANTES de P41 (`ownership.ts`, HEAD 4f8c00a2 +
 * WIP de P29–P40), con el `where` y el `include` escritos igual. Solo existe para
 * medir contra ella; `--verificar-copia` prueba que es la misma.
 */
function consultaPartida(prisma: PrismaClient, userId: string) {
  return prisma.osLead.findMany({
    where: { assignedToId: userId },
    include: {
      dossier: true,
      _count: { select: { activities: { where: { channel: { not: 'SISTEMA' } } } } },
      setterMetas: { where: { setterId: userId } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

type Fila = Record<string, unknown> & { dossier: Record<string, unknown> | null }

function desglose(filas: Fila[]) {
  const lead: Record<string, number> = {}
  const dossier: Record<string, number> = {}
  for (const f of filas) {
    for (const [k, v] of Object.entries(f)) {
      if (k === 'dossier') continue
      lead[k] = (lead[k] ?? 0) + bytes(v)
    }
    for (const [k, v] of Object.entries(f.dossier ?? {})) dossier[k] = (dossier[k] ?? 0) + bytes(v)
  }
  const orden = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]))
  return { total: bytes(filas), lead: orden(lead), dossier: orden(dossier) }
}

async function tiempos(
  vueltas: number,
  a: () => Promise<unknown>,
  b: () => Promise<unknown>,
): Promise<{ a: number; b: number; aTodas: number[]; bTodas: number[] }> {
  await a()
  await b() // calentar la conexión: la primera paga el handshake
  const ta: number[] = []
  const tb: number[] = []
  for (let i = 0; i < vueltas; i++) {
    let t0 = performance.now()
    await a()
    ta.push(performance.now() - t0)
    t0 = performance.now()
    await b()
    tb.push(performance.now() - t0)
  }
  const r = (xs: number[]) => xs.map((x) => Math.round(x))
  return { a: Math.round(mediana(ta)), b: Math.round(mediana(tb)), aTodas: r(ta), bTodas: r(tb) }
}

/** Un documento de vuelta 4 con N palabras de cuerpo, con la caza de huecos adelante (la forma de P40). */
function documentoDe(palabras: number): string {
  const trozos = CUERPO_DOCUMENTO.split(/\s+/).filter(Boolean)
  const cuerpo: string[] = []
  while (cuerpo.length < palabras) cuerpo.push(...trozos)
  const huecos = DOCUMENTO_CON_HUECOS_ANTES.slice(0, DOCUMENTO_CON_HUECOS_ANTES.indexOf(DOCUMENTO_COMPLETO))
  return `${huecos.repeat(6)}${ENCABEZADO_EXACTO}\n\n${cuerpo.slice(0, palabras).join(' ')}`
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const vueltas = Number(arg('vueltas') ?? 21)
  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { BriefSchema } = await import('@/lib/leados/contracts')
  const { vueltasParaGuardar } = await import('@/lib/leados/brief-vueltas')
  const qa = await prisma.user.findUniqueOrThrow({ where: { email: QA_EMAIL }, select: { id: true } })
  const salida: Record<string, unknown> = { medidoEn: new Date().toISOString(), vueltas }

  if (flag('verificar-copia')) {
    const real = await listOwnedLeads(qa.id)
    const copia = await consultaPartida(prisma, qa.id)
    const iguales = JSON.stringify(real) === JSON.stringify(copia)
    console.log(`copia de la consulta de partida contra listOwnedLeads del árbol: ${iguales ? 'IDÉNTICAS' : 'DISTINTAS'} (${bytes(real)} B · ${bytes(copia)} B)`)
    salida.copiaIdentica = iguales
  }

  if (flag('medir')) {
    const actual = (await listOwnedLeads(qa.id)) as unknown as Fila[]
    const partida = (await consultaPartida(prisma, qa.id)) as unknown as Fila[]
    const dActual = desglose(actual)
    const dPartida = desglose(partida)
    const t = await tiempos(vueltas, () => consultaPartida(prisma, qa.id), () => listOwnedLeads(qa.id))
    const conBrief = partida.filter((f) => f.dossier?.briefJson != null).length
    salida.medir = { leads: actual.length, conBrief, partida: dPartida, actual: dActual, msMediana: { partida: t.a, actual: t.b }, ms: { partida: t.aTodas, actual: t.bTodas } }
    console.log(`setter-qa: ${actual.length} leads · ${conBrief} con brief`)
    console.log(`bytes por carga · partida ${kb(dPartida.total)} · listOwnedLeads del árbol ${kb(dActual.total)} · diferencia ${kb(dPartida.total - dActual.total)}`)
    console.log(`tiempo (mediana de ${vueltas}, intercaladas) · partida ${t.a} ms · árbol ${t.b} ms`)
    console.log('dossier, bytes por columna (partida → árbol):')
    for (const [k, v] of Object.entries(dPartida.dossier)) console.log(`  ${k.padEnd(15)} ${String(v).padStart(7)} → ${String(dActual.dossier[k] ?? 0).padStart(7)}`)
    console.log('lead, bytes por columna (partida → árbol):')
    for (const [k, v] of Object.entries(dPartida.lead)) console.log(`  ${k.padEnd(15)} ${String(v).padStart(7)} → ${String(dActual.lead[k] ?? 0).padStart(7)}`)
  }

  if (flag('proyectar')) {
    const documento = documentoDe(1200)
    const vueltasBrief = vueltasParaGuardar({
      lecturaRespuesta: VUELTA_LECTURA,
      lecturaCorreccion: '',
      decisionesRespuesta: VUELTA_DECISIONES,
      decisionesCorreccion: '',
      especificacionRespuesta: '',
      especificacionCorreccion: '',
      documento,
      documentoCorreccion: '',
    })
    const briefLleno = BriefSchema.parse({
      titulo: 'Barbería El Faro — demo',
      concepto: VALORES_ENCABEZADO.ANGULO,
      secciones: [...VALORES_ENCABEZADO.SECCIONES],
      cta: VALORES_ENCABEZADO.CTA,
      tono: VALORES_ENCABEZADO.TONO,
      paleta: VALORES_ENCABEZADO.PALETA,
      tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
      documento,
      vueltas: vueltasBrief,
    })
    const bytesBrief = bytes(briefLleno)
    console.log(`brief proyectado: documento de 1.200 palabras + lectura + decisiones = ${kb(bytesBrief)} por brief`)

    const origen = (await consultaPartida(prisma, qa.id)) as unknown as Fila[]
    // El registro de siembra de P39: cada `push` escribe el id en un archivo de
    // este proceso ANTES de seguir. Si el proceso muere antes del `finally`, el
    // `globalSetup` de la próxima suite borra por id lo que quedó anotado.
    const registro = await import('../tests/helpers/siembra-registro.ts')
    registro.activarRegistro(url)
    const creados = { usuarios: registro.listaAnotada('usuario'), leads: registro.listaAnotada('lead') }
    try {
      const setter = await prisma.user.create({
        data: { email: `smoke-setter-p41-proyeccion-${Date.now()}@develop.test`, name: 'SMOKE-SETTER p41-proyeccion', role: 'SETTER' },
        select: { id: true },
      })
      creados.usuarios.push(setter.id)
      let briefs = 0
      for (const f of origen) {
        const d = f.dossier
        const conBrief = d?.briefJson != null
        if (conBrief) briefs += 1
        const json = (v: unknown) => (v === null || v === undefined ? undefined : (v as Prisma.InputJsonValue))
        const lead = await prisma.osLead.create({
          data: {
            businessName: `SMOKE-SETTER p41-proyeccion ${Date.now()} ${String(f.businessName)}`,
            industry: f.industry as string | null,
            zone: f.zone as string | null,
            status: f.status as Prisma.OsLeadCreateInput['status'],
            caliente: f.caliente as boolean,
            nextFollowUpAt: f.nextFollowUpAt as Date | null,
            reactivateAt: f.reactivateAt as Date | null,
            assignedToId: setter.id,
            ...(d
              ? {
                  dossier: {
                    create: {
                      stage: d.stage as Prisma.OsLeadDossierCreateWithoutLeadInput['stage'],
                      fichaJson: json(d.fichaJson),
                      evaluacionJson: json(d.evaluacionJson),
                      briefJson: conBrief ? (briefLleno as Prisma.InputJsonValue) : undefined,
                      selfCheckJson: json(d.selfCheckJson),
                      progresoJson: json(d.progresoJson),
                      draftUrl: d.draftUrl as string | null,
                      rechazos: json(d.rechazos),
                      finalUrl: d.finalUrl as string | null,
                      aprobadaAt: d.aprobadaAt as Date | null,
                      enviadaAt: d.enviadaAt as Date | null,
                      agendaJson: json(d.agendaJson),
                      escaladoAt: d.escaladoAt as Date | null,
                      escaladoNota: d.escaladoNota as string | null,
                    },
                  },
                }
              : {}),
          },
          select: { id: true },
        })
        creados.leads.push(lead.id)
      }
      const partida = (await consultaPartida(prisma, setter.id)) as unknown as Fila[]
      const actual = (await listOwnedLeads(setter.id)) as unknown as Fila[]
      const t = await tiempos(vueltas, () => consultaPartida(prisma, setter.id), () => listOwnedLeads(setter.id))
      salida.proyectar = {
        leads: partida.length,
        briefs,
        bytesPorBrief: bytesBrief,
        partida: desglose(partida),
        actual: desglose(actual),
        msMediana: { partida: t.a, actual: t.b },
        ms: { partida: t.aTodas, actual: t.bTodas },
      }
      console.log(`copia de la cartera: ${partida.length} leads · ${briefs} con el brief lleno`)
      console.log(`bytes por carga · partida ${kb(bytes(partida))} · listOwnedLeads del árbol ${kb(bytes(actual))}`)
      console.log(`tiempo (mediana de ${vueltas}, intercaladas) · partida ${t.a} ms · árbol ${t.b} ms`)
    } finally {
      const leads = creados.leads.length
        ? (await prisma.osLead.deleteMany({ where: { id: { in: [...creados.leads] } } })).count
        : 0
      registro.anotarBajas('lead', creados.leads)
      const usuarios = creados.usuarios.length
        ? (await prisma.user.deleteMany({ where: { id: { in: [...creados.usuarios] } } })).count
        : 0
      registro.anotarBajas('usuario', creados.usuarios)
      console.log(`limpieza por id: ${leads} leads (con su dossier, en cascada) · ${usuarios} usuario`)
    }
  }

  await prisma.$disconnect()
  const destino = arg('salida')
  if (destino) {
    fs.mkdirSync(path.dirname(destino), { recursive: true })
    fs.writeFileSync(destino, JSON.stringify(salida, null, 2))
    console.log(`→ ${destino}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
