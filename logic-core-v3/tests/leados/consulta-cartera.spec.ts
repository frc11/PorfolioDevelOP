import { test, expect } from '@playwright/test'
import { Prisma } from '@prisma/client'
import {
  prisma,
  agendaAgendadaJson,
  createLead,
  createSetter,
  newTracker,
  progresoJsonCon,
  rechazosJsonDeNVueltas,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
import { listOwnedLeads, type OwnedLeadWithDossier } from '../../src/lib/leados/ownership'
import { cuerpoDeFuncion } from '../../src/lib/invariant-call-site'

/**
 * P41 — LA CONSULTA DE LA CARTERA TRAE DEL DOSSIER LO QUE EL PANEL LEE, Y NADA MÁS.
 *
 * Hasta P41 `listOwnedLeads` traía el dossier ENTERO de cada lead en cada carga
 * del panel del setter: el brief (que con el documento de cuatro vueltas pasa a
 * pesar ~10 KB), el chequeo final y el progreso de construcción, que el panel no
 * lee. El recorte vive en `ownership.ts` (`DOSSIER_DEL_PANEL`). Esta prueba es lo
 * que lo hace seguro, en las dos direcciones:
 *
 *   · DE MÁS — si la consulta vuelve a traer un campo que nadie del panel lee,
 *     el censo de acá abajo se pone rojo;
 *   · DE MENOS — si alguien recorta un campo que el panel sí lee, se pone rojo el
 *     censo, y además no compila el consumidor (el tipo sale del mismo objeto).
 *
 * Y la que protege a futuro: un consumidor NUEVO que lea un campo recortado no
 * compila. Eso no lo prueba una aserción en tiempo de ejecución sino `tsc`: las
 * lecturas de `leerRecortados` llevan `@ts-expect-error`, y `TIPO_HONESTO` exige
 * que las claves del tipo sean exactamente las del censo. Si el tipo vuelve a
 * prometer un campo que la consulta no trae —el arreglo tentador para hacer
 * compilar un consumidor nuevo—, `tsc` falla acá.
 *
 * Límite, dicho: `tsc` no ve a un consumidor que declare el campo OPCIONAL en un
 * tipo estructural propio (`{ dossier: { briefJson?: unknown } | null }`) ni a
 * uno que lo lea por clave dinámica. Ese leería `undefined` sin avisar; ninguna
 * prueba de acá puede afirmar lo contrario sin volverse vacua.
 *
 * Datos namespaced (SMOKE-SETTER) y teardown por id exacto.
 */

/**
 * EL CENSO (P41): los campos del dossier que llegan a la cartera, cada uno con
 * quién lo lee en la cadena del panel (`setter/page.tsx`). Congelado a mano: un
 * campo nuevo en la consulta es un renglón acá, con su lector.
 *
 * Los cuatro blobs Json viajan ENTEROS, y no es solo porque Prisma no seleccione
 * claves adentro de una columna: sus lectores los validan enteros con zod
 * (`safeParse`), así que una clave que falte o sobre cambia si el blob vale o es
 * `null`.
 */
const CENSO = {
  stage: [
    ['src/lib/leados/home.ts', 'buildHomeLeads'], // grupo, próxima acción, turno (null = sin dossier)
    ['src/lib/leados/novedades.ts', 'derivarColaRevision'], // cuántas demos esperan a Franco
    ['src/lib/leados/progreso.ts', 'derivarProgresoSemana'], // descartados de la semana
  ],
  fichaJson: [['src/lib/leados/home.ts', 'buildHomeLeads']], // «Completá la ficha» / «Dejá tu veredicto»
  evaluacionJson: [
    ['src/lib/leados/home.ts', 'buildHomeLeads'], // score, motivo de descarte del archivo
    ['src/lib/leados/mis-numeros.ts', 'filasCriterioPropio'], // descarte vs avance
    ['src/lib/leados/progreso.ts', 'derivarProgresoSemana'], // fecha del descarte
  ],
  rechazos: [['src/lib/leados/home.ts', 'buildHomeLeads']], // «Franco pidió cambios» en la tarjeta
  agendaJson: [
    ['src/lib/leados/home.ts', 'buildHomeLeads'], // nota del cierre del archivo
    ['src/lib/leados/progreso.ts', 'derivarProgresoSemana'], // reuniones y perdidos de la semana
  ],
  finalUrl: [['src/lib/leados/home.ts', 'buildHomeLeads']], // aprobada sin link: grupo, turno, gate del envío
  enviadaAt: [
    ['src/lib/leados/home.ts', 'buildHomeLeads'], // demo enviada: grupo y próxima acción
    ['src/lib/leados/progreso.ts', 'derivarProgresoSemana'], // demos de la semana
  ],
  updatedAt: [['src/lib/leados/novedades.ts', 'derivarColaRevision']], // «hace cuánto» espera la más vieja
} as const satisfies Record<string, readonly (readonly [string, string])[]>

const CAMPOS_DEL_CENSO = Object.keys(CENSO).sort()

type DossierDeLaCartera = NonNullable<OwnedLeadWithDossier['dossier']>
type Iguales<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

/**
 * Las claves del TIPO de la cartera son exactamente las del censo. Si el tipo
 * promete un campo de más (o pierde uno), esta línea no compila. Es la que ataja
 * el arreglo tentador: ensanchar el tipo para que un consumidor nuevo compile,
 * con la consulta todavía recortada.
 */
const TIPO_HONESTO: Iguales<keyof DossierDeLaCartera, keyof typeof CENSO> = true

/**
 * Lo que haría un consumidor NUEVO del panel que necesite un campo recortado.
 * Cada lectura tiene que NO compilar: la directiva `@ts-expect-error` convierte
 * eso en una afirmación que `tsc` verifica —si el campo vuelve a estar en el
 * tipo, la directiva queda sin error que suprimir y `tsc` falla—. En tiempo de
 * ejecución devuelve lo que ese consumidor leería hoy: `undefined`.
 */
function leerRecortados(d: DossierDeLaCartera): Record<string, unknown> {
  return {
    // @ts-expect-error — P41: el brief no viaja en la cartera
    briefJson: d.briefJson,
    // @ts-expect-error — P41: el chequeo final no viaja en la cartera
    selfCheckJson: d.selfCheckJson,
    // @ts-expect-error — P41: el progreso de construcción no viaja en la cartera
    progresoJson: d.progresoJson,
    // @ts-expect-error — P41: el borrador no viaja en la cartera
    draftUrl: d.draftUrl,
    // @ts-expect-error — P41: la fecha de aprobación no viaja en la cartera
    aprobadaAt: d.aprobadaAt,
    // @ts-expect-error — P41: el escalamiento no viaja en la cartera
    escaladoAt: d.escaladoAt,
    // @ts-expect-error — P41: la nota del escalamiento no viaja en la cartera
    escaladoNota: d.escaladoNota,
    // @ts-expect-error — P41: el alta del dossier no viaja en la cartera
    createdAt: d.createdAt,
    // @ts-expect-error — P41: el id del dossier no viaja en la cartera
    id: d.id,
    // @ts-expect-error — P41: el leadId del dossier no viaja (la fila ya es el lead)
    leadId: d.leadId,
  }
}

const camposDe = (modelo: string, relaciones: boolean) =>
  Prisma.dmmf.datamodel.models
    .find((m) => m.name === modelo)!
    .fields.filter((f) => relaciones || f.kind !== 'object')
    .map((f) => f.name)

const tracker: SmokeTracker = newTracker()
let setterA: string
let setterB: string
let leadCompleto: string
let leadSinDossier: string
let leadDeB: string

test.beforeAll(async () => {
  setterA = (await createSetter(tracker, 'p41-cartera-a')).id
  setterB = (await createSetter(tracker, 'p41-cartera-b')).id

  // El lead con TODAS las columnas del dossier llenas: el recorte se mide sobre
  // una fila que tiene qué recortar, no sobre una que ya venía vacía.
  const completo = await createLead(tracker, {
    setterId: setterA,
    businessName: 'P41 dossier completo',
    stage: 'APROBADA',
    enviada: true,
    meta: { pinned: true, note: 'nota de A' },
  })
  leadCompleto = completo.id
  await prisma.osLeadDossier.update({
    where: { leadId: leadCompleto },
    data: {
      rechazos: rechazosJsonDeNVueltas(1),
      agendaJson: agendaAgendadaJson(),
      progresoJson: progresoJsonCon(['estructura']),
      escaladoAt: new Date(),
      escaladoNota: 'P41 — escalado para que la columna no esté vacía',
    },
  })

  // Un lead SIN dossier: la cartera lo tiene que seguir trayendo con `dossier: null`
  // (progreso.ts lo saltea por eso), no con un objeto vacío.
  const sinDossier = await prisma.osLead.create({
    data: { businessName: `SMOKE-SETTER P41 sin dossier ${Date.now()}`, assignedToId: setterA },
    select: { id: true },
  })
  tracker.leadIds.push(sinDossier.id)
  leadSinDossier = sinDossier.id

  leadDeB = (await createLead(tracker, { setterId: setterB, businessName: 'P41 de B', stage: 'BRIEF' })).id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('la cartera trae del dossier los campos del censo, con el valor de la fila, y ninguno más', async () => {
  const fila = await prisma.osLeadDossier.findUniqueOrThrow({ where: { leadId: leadCompleto } })
  const vacias = Object.entries(fila).filter(([, v]) => v === null).map(([k]) => k)
  expect(vacias, 'control: la fila sembrada tiene todas sus columnas llenas').toEqual([])

  const cartera = await listOwnedLeads(setterA)
  const lead = cartera.find((l) => l.id === leadCompleto)
  expect(lead, 'el lead propio está en la cartera').toBeTruthy()
  const dossier = lead!.dossier as Record<string, unknown> | null
  expect(dossier, 'el lead con dossier trae su dossier').not.toBeNull()

  const llegan = Object.keys(dossier!).sort()
  const sobran = llegan.filter((k) => !CAMPOS_DEL_CENSO.includes(k))
  const faltan = CAMPOS_DEL_CENSO.filter((k) => !llegan.includes(k))
  expect(
    llegan,
    `la consulta de la cartera trae del dossier otra cosa que el censo — sobran: ${sobran.join(', ') || '—'} · ` +
      `faltan: ${faltan.join(', ') || '—'}. Un campo nuevo va al censo de esta prueba con quién lo lee.`,
  ).toEqual(CAMPOS_DEL_CENSO)

  for (const campo of CAMPOS_DEL_CENSO) {
    expect(dossier![campo], `«${campo}» llega con el valor de la fila`).toEqual((fila as Record<string, unknown>)[campo])
  }

  // El resto de la fila no cambió de forma: las columnas del lead y las mismas tres relaciones.
  const esperadasDelLead = [...camposDe('OsLead', false), '_count', 'dossier', 'setterMetas'].sort()
  expect(Object.keys(lead!).sort(), 'del lead llegan sus columnas y dossier, _count y setterMetas').toEqual(esperadasDelLead)

  const sinDossier = cartera.find((l) => l.id === leadSinDossier)
  expect(sinDossier, 'el lead sin dossier está en la cartera').toBeTruthy()
  expect(sinDossier!.dossier, 'sin fila de dossier, `dossier` sigue siendo null').toBeNull()
})

test('la cartera de un setter no muestra los leads de otro', async () => {
  const deA = (await listOwnedLeads(setterA)).map((l) => l.id)
  const deB = (await listOwnedLeads(setterB)).map((l) => l.id)

  expect(deA, 'los leads de A no pueden incluir el de B').not.toContain(leadDeB)
  expect(deB, 'los leads de B no pueden incluir los de A').not.toContain(leadCompleto)
  expect(deB, 'los leads de B no pueden incluir los de A').not.toContain(leadSinDossier)
  expect([...deA].sort(), 'la cartera de A es exactamente la suya').toEqual([leadCompleto, leadSinDossier].sort())
  expect(deB, 'la cartera de B es exactamente la suya').toEqual([leadDeB])
})

test('un consumidor que lea un campo recortado no compila — y hoy leería undefined', async () => {
  // Los dientes de esta prueba están en `tsc` (TIPO_HONESTO y los `@ts-expect-error`
  // de `leerRecortados`). En ejecución se afirma el peligro que eso ataja.
  expect(TIPO_HONESTO).toBe(true)

  const recortadas = Object.keys(leerRecortados({} as DossierDeLaCartera)).sort()
  expect(
    [...CAMPOS_DEL_CENSO, ...recortadas].sort(),
    'cada columna del dossier está o en el censo o entre las recortadas: una columna nueva pide decidir de qué lado va',
  ).toEqual(camposDe('OsLeadDossier', false).sort())

  const fila = await prisma.osLeadDossier.findUniqueOrThrow({ where: { leadId: leadCompleto } })
  const lead = (await listOwnedLeads(setterA)).find((l) => l.id === leadCompleto)!
  const leido = leerRecortados(lead.dossier!)
  for (const campo of recortadas) {
    expect((fila as Record<string, unknown>)[campo], `control: «${campo}» existe en la fila`).not.toBeNull()
    expect(leido[campo], `«${campo}» no llega a la cartera: un consumidor que lo leyera leería undefined`).toBeUndefined()
  }
})

test('cada campo del censo tiene quién lo lea en la cadena del panel', () => {
  for (const [campo, lectores] of Object.entries(CENSO)) {
    for (const [archivo, funcion] of lectores) {
      const cuerpo = cuerpoDeFuncion(archivo.split('/'), funcion)
      expect(
        new RegExp(`dossier\\??\\.${campo}\\b`).test(cuerpo),
        `el censo dice que \`${funcion}\` (${archivo}) lee «${campo}» del dossier y su cuerpo ya no lo lee. ` +
          'Si el lector se movió, movelo en el censo; si nadie lo lee, sacalo de la consulta y del censo.',
      ).toBe(true)
    }
  }
})
