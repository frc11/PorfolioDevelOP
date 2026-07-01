import { test, expect } from '@playwright/test'
import type { Prisma } from '@prisma/client'
import {
  prisma,
  createSetter,
  newTracker,
  teardown,
  disconnect,
  SMOKE_TAG,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (NO se toca: se TESTEA). Módulos puros + ownership;
// ninguno arrastra next/headers (las actions con 'use server' NO se importan:
// se replica su núcleo, mismo patrón que 06-claim-atomico).
import { ownedLeadCreateData, ownedListWhere, FUENTE_SETTER } from '../../src/lib/leados/isolation'
import { getOwnedLead } from '../../src/lib/leados/ownership'
import {
  construirAltasLote,
  dedupEnLote,
  mapearFilas,
  normalizarNombre,
  parseCsv,
  type FilaValida,
} from '../../src/lib/leados/prospecto-import'
import { NuevoProspectoSchema } from '../../src/app/(protected)/setter/_actions/prospecto.schemas'

/**
 * NEGATIVO FINO (Sprint 5.3) — ALTA A.1 + IMPORTACIÓN A.2 contra la DB real, lo
 * que el invariante puro NO alcanza:
 *
 *   A.1: el alta escribe un lead REALMENTE aislado — asignado al setter de la
 *        sesión, frío, fuente Setter — y NO cae en la cartera de otro (lectura +
 *        escritura verificadas contra Neon).
 *   A.2: el pipeline de importación con `$transaction` + el DEDUP GLOBAL
 *        cross-setter (`nombresEnSistema`): un negocio que YA existe bajo OTRO
 *        setter se marca `en-sistema` y NO se duplica. Esa query solo tiene
 *        sentido con la DB real y dos setters — el gap exacto del sprint.
 *
 * Se replica el núcleo de `cargarProspecto`/`importarProspectos` (sin
 * requireSetter/revalidate, por-request). Datos namespaced + teardown por id.
 */

const tracker: SmokeTracker = newTracker()
let setterA: string
let setterB: string

test.beforeAll(async () => {
  const a = await createSetter(tracker, 'alta-a')
  const b = await createSetter(tracker, 'alta-b')
  setterA = a.id
  setterB = b.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Crea un lead con un nombre EXACTO conocido (para cotejar dedup), lo trackea. */
async function seedNamed(name: string, ownerId: string): Promise<string> {
  const lead = await prisma.osLead.create({
    data: { businessName: name, source: 'leados-alta-import-spec', assignedToId: ownerId },
    select: { id: true },
  })
  tracker.leadIds.push(lead.id)
  return lead.id
}

test('A.1 · el alta escribe un lead aislado: dueño = sesión, frío, fuente Setter', async () => {
  // Input HOSTIL: intenta inyectar dueño ajeno y caliente. El schema descarta las
  // claves extra; `ownedLeadCreateData` fuerza la sesión (anti-IDOR de escritura).
  const hostil = {
    businessName: `${SMOKE_TAG} AltaHostil ${Date.now()}`,
    assignedToId: setterB,
    caliente: true,
  } as unknown

  const parsed = NuevoProspectoSchema.parse(hostil)
  const created = await prisma.osLead.create({
    data: ownedLeadCreateData(parsed, setterA),
    select: { id: true },
  })
  tracker.leadIds.push(created.id)

  const row = await prisma.osLead.findUnique({
    where: { id: created.id },
    select: { assignedToId: true, caliente: true, source: true },
  })
  expect(row?.assignedToId, 'asignado al setter de la sesión (A), NO al inyectado (B)').toBe(setterA)
  expect(row?.caliente, 'entra frío — el caliente lo marca Franco, no el setter').toBe(false)
  expect(row?.source, 'queda marcada la segunda fuente').toBe(FUENTE_SETTER)

  // La frontera de LECTURA lo confirma: A lo ve, B no.
  expect(await getOwnedLead(created.id, setterA), 'A alcanza su propio lead').not.toBeNull()
  expect(await getOwnedLead(created.id, setterB), 'B nunca alcanza el lead de A').toBeNull()
})

test('A.2 · importación: dedup GLOBAL cross-setter (en-sistema) + $transaction', async () => {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
  // Un negocio que YA existe bajo OTRO setter (B) — debe salir `en-sistema`.
  const crossName = `${SMOKE_TAG} CrossDeB ${stamp}`
  const crossLeadId = await seedNamed(crossName, setterB)
  // Un negocio que A ya tiene en su cartera — debe salir `en-cartera`.
  const enCarteraName = `${SMOKE_TAG} YaEnCarteraA ${stamp}`
  await seedNamed(enCarteraName, setterA)
  // Dos negocios nuevos (uno repetido en el archivo para probar `en-archivo`).
  const nuevo1 = `${SMOKE_TAG} NuevoUno ${stamp}`
  const nuevo2 = `${SMOKE_TAG} NuevoDos ${stamp}`

  const csv = [
    'nombre,email',
    `${crossName},cross@x.com`, // en-sistema (existe bajo B)
    `${enCarteraName},cartera@x.com`, // en-cartera (existe bajo A)
    `${nuevo1},uno@x.com`, // insertable
    `${nuevo2},dos@x.com`, // insertable
    `${nuevo1},repe@x.com`, // en-archivo (repetido en la lista)
    `,sin-nombre@x.com`, // inválida: sin nombre (no rompe la tanda)
  ].join('\n')

  // ── Núcleo de importarProspectos (sin requireSetter/revalidate) ──
  const mapeo = mapearFilas(parseCsv(csv))
  expect(mapeo.ok, 'el encabezado tiene la columna nombre').toBe(true)
  if (!mapeo.ok) return

  const validas: FilaValida[] = []
  let invalidas = 0
  for (const f of mapeo.filas) {
    const parsed = NuevoProspectoSchema.safeParse(f.data)
    if (parsed.success) {
      validas.push({ fila: f.fila, data: parsed.data, norm: normalizarNombre(parsed.data.businessName) })
    } else {
      invalidas += 1
    }
  }
  expect(invalidas, 'la fila sin nombre rebota sin romper la tanda').toBe(1)

  const { unicas, duplicadas } = dedupEnLote(validas)

  // Dedup contra la cartera de A y contra TODO el sistema (mismas queries que el action).
  const propios = await prisma.osLead.findMany({ where: ownedListWhere(setterA), select: { businessName: true } })
  const enCartera = new Set(propios.map((l) => normalizarNombre(l.businessName)))
  const enSistema = await nombresEnSistema()

  const insertables: FilaValida[] = []
  for (const u of unicas) {
    if (enCartera.has(u.norm)) {
      duplicadas.push({ fila: u.fila, nombre: u.data.businessName, motivo: 'en-cartera' })
    } else if (enSistema.has(u.norm)) {
      duplicadas.push({ fila: u.fila, nombre: u.data.businessName, motivo: 'en-sistema' })
    } else {
      insertables.push(u)
    }
  }

  // ── Las tres ramas del dedup, con la GLOBAL cross-setter como estrella ──
  const motivoDe = (nombre: string) =>
    duplicadas.find((d) => normalizarNombre(d.nombre) === normalizarNombre(nombre))?.motivo
  expect(motivoDe(crossName), 'el negocio de OTRO setter (B) se detecta en-sistema — sin duplicar a nivel equipo').toBe(
    'en-sistema',
  )
  expect(motivoDe(enCarteraName), 'el negocio propio ya en cartera se detecta en-cartera').toBe('en-cartera')
  expect(motivoDe(nuevo1), 'el repetido en la lista se detecta en-archivo').toBe('en-archivo')

  // Solo los dos nombres nuevos quedan insertables.
  expect(insertables.map((u) => u.data.businessName).sort(), 'solo los negocios nuevos').toEqual([nuevo1, nuevo2].sort())

  // ── Alta atómica ($transaction): todos o ninguno ──
  const altas = construirAltasLote(
    insertables.map((u) => u.data),
    setterA,
  )
  const creados = await prisma.$transaction(
    altas.map((data: Prisma.OsLeadUncheckedCreateInput) => prisma.osLead.create({ data, select: { id: true } })),
  )
  for (const c of creados) tracker.leadIds.push(c.id)
  expect(creados.length, 'el $transaction creó ambos nuevos, atómico').toBe(2)

  // Cada creado quedó de A, frío, fuente Setter.
  const filasCreadas = await prisma.osLead.findMany({
    where: { id: { in: creados.map((c) => c.id) } },
    select: { assignedToId: true, caliente: true, source: true },
  })
  for (const row of filasCreadas) {
    expect(row.assignedToId).toBe(setterA)
    expect(row.caliente).toBe(false)
    expect(row.source).toBe(FUENTE_SETTER)
  }

  // Aislamiento preservado: el lead de B sigue de B; A NO recibió copia del cross.
  const crossRow = await prisma.osLead.findUnique({ where: { id: crossLeadId }, select: { assignedToId: true } })
  expect(crossRow?.assignedToId, 'el negocio cross sigue de B (intacto)').toBe(setterB)
  const copiaEnA = await prisma.osLead.count({
    where: { assignedToId: setterA, businessName: crossName },
  })
  expect(copiaEnA, 'A no obtuvo ninguna copia del negocio ya existente en el sistema').toBe(0)
})

/**
 * Réplica EXACTA de la query privada `nombresEnSistema` del action de importación:
 * el conjunto de nombres normalizados que existen EN TODO el sistema (un bit de
 * existencia por nombre, sin distinción de dueño). Es la excepción angosta y
 * deliberada al aislamiento de lectura — verificada acá contra la DB real.
 */
async function nombresEnSistema(): Promise<Set<string>> {
  const todos = await prisma.osLead.findMany({ select: { businessName: true } })
  return new Set(todos.map((l) => normalizarNombre(l.businessName)))
}
