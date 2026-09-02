/**
 * V-1 — Seed QA del setter: un lead owned por setter-qa en CADA estado que el
 * wizard del lead distingue (LeadOS). Sembrarlos owned por el setter cierra el
 * hueco del bloque 3: varios estados (FICHA, BRIEF, sub-estados de gate) solo se
 * podían ver en leads de franco, no del setter — así Franco (y la QA) abren cada
 * uno y ven el wizard en su estado real.
 *
 * Corre SOLO contra la branch Neon dev (host check abajo). Idempotente: cada lead
 * se busca por businessName (prefijo "QA-W") y se reconcilia (assignedToId/status/
 * caliente/reactivateAt); el dossier se upsertea por leadId con TODOS sus campos
 * en el estado deseado → re-correrlo CONVERGE, no duplica ni deja a medias.
 *
 * NO toca producción ni los leads de franco: solo AGREGA/reconcilia los "QA-W".
 * En un SEED crear el dossier en su stage DIRECTO es lo normal y aceptable — la
 * línea roja "no setees stage con Prisma directo" aplica a `transitionDossier`
 * en la app, no al seed.
 *
 * Estados cubiertos (14), uno por lead:
 *   FICHA incompleta · FICHA completa · EVALUADA gate-cerrado · EVALUADA
 *   gate-abierto · BRIEF · CONSTRUCCION (draft + self-check 6/6) · EN_REVISION ·
 *   APROBADA gate-abierto · APROBADA gate-cerrado · RECHAZADA · DESCARTADA ·
 *   POSTERGADO vencido · POSTERGADO futuro.
 *
 * Cómo flipear los OTROS dos sub-estados de CONSTRUCCION (ver el gate de envío
 * a revisión sin draft / con self-check vacío) está documentado abajo en
 * FLIP_CONSTRUCCION y se imprime al final de la corrida.
 *
 * Uso: npx tsx scripts/v1-qa-wizard-states.ts
 */
import { config as loadEnv } from 'dotenv'
// Import type-only: se borra al compilar, no instancia el client antes de dotenv.
import type { Prisma } from '@prisma/client'

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

const DIA_MS = 24 * 60 * 60 * 1000
const ahora = () => new Date()
const haceDias = (dias: number) => new Date(Date.now() - dias * DIA_MS)
const enDias = (dias: number) => new Date(Date.now() + dias * DIA_MS)
const isoHaceDias = (dias: number) => haceDias(dias).toISOString()

/**
 * Pista de cómo ver los otros dos estados del gate de envío a revisión partiendo
 * del lead CONSTRUCCION sembrado (que sale con el botón HABILITADO: draft + 6/6).
 * Se imprime al final para que Franco no tenga que abrir este archivo.
 */
const FLIP_CONSTRUCCION = [
  'CONSTRUCCION — para ver los OTROS dos estados del gate (sobre "QA-W Construccion", leadId abajo):',
  '  · "sin draft"  → en Prisma Studio (o psql) poné draftUrl = NULL en su OsLeadDossier;',
  '                   el wizard pide publicar el draft antes de ofrecer el self-check.',
  '  · "self-check vacío" → poné selfCheckJson = NULL (o cualquier itemsDuros[].ok = false);',
  '                   el botón "Enviar a revisión" queda deshabilitado (gate selfCheckAprobado).',
  '  Re-corré este seed para devolverlo al estado habilitado (draft + 6/6).',
]

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')
  // El namespace `Prisma` (valor) trae DbNull — necesario para limpiar campos
  // Json? a SQL NULL (Prisma rechaza el `null` literal en Json en runtime).
  const { Prisma: PrismaNs } = await import('@prisma/client')
  const { FichaSchema, EvaluacionSchema, BriefSchema, SelfCheckSchema, RechazosSchema } =
    await import('../src/lib/leados/contracts')
  const { HARD_CHECKS } = await import('../src/lib/leados/flow-content')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, role: true },
  })
  if (!setter || setter.role !== 'SETTER') {
    console.error(
      "ABORT: setter-qa@develop.test no existe (o no es SETTER). Corré 'npx tsx prisma/seed.ts' " +
        "o 'npx tsx scripts/b1-verify-setter-ownership.ts' antes.",
    )
    process.exit(1)
  }

  // ── Builders de los blobs Json (validados con los contratos del dossier) ───
  const json = <T,>(value: T) => value as unknown as Prisma.InputJsonValue

  /** Ficha SIN señal mínima: solo identidad → fichaFaltantes no vacío. */
  const fichaIncompleta = () =>
    json(
      FichaSchema.parse({
        identidad: { notas: 'Atiende la dueña, todavía sin mirar bien la presencia.', igManejadoPor: 'NO_SABE' },
      }),
    )

  /** Ficha con señal suficiente: identidad + presencia + reseñas/contenido. */
  const fichaCompleta = (negocio: string) =>
    json(
      FichaSchema.parse({
        identidad: { notas: `${negocio}: atiende el dueño, una persona más en el local.`, igManejadoPor: 'DUENO' },
        presenciaDigital: 'IG activo (2–3 posts/semana), sin web, Maps con ficha a medias.',
        resenas: '"Muy buena atención" — "A veces no contestan los mensajes y se pierde la venta".',
        contenidoReal: 'Logo simple, fotos propias decentes del producto en el feed.',
      }),
    )

  const evalAvanzar = (score: number, fechaIso: string) =>
    json(
      EvaluacionSchema.parse({
        score,
        veredicto: 'AVANZAR',
        razonamiento: 'Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.',
        fecha: fechaIso,
      }),
    )

  const evalDescarte = (fechaIso: string) =>
    json(
      EvaluacionSchema.parse({
        score: 2,
        veredicto: 'DESCARTAR',
        razonamiento: 'Cuenta apagada, sin reseñas ni movimiento — no hay materia prima para una demo creíble.',
        motivoDescarte: 'IG abandonado hace meses y el local figura cerrado en Maps.',
        fecha: fechaIso,
      }),
    )

  const briefMinimo = (negocio: string) =>
    json(
      BriefSchema.parse({
        titulo: `Demo ${negocio}`,
        concepto: 'One-page cálida, foco en pedir/consultar por WhatsApp.',
        secciones: ['Hero', 'Qué ofrecen', 'Reseñas', 'Cómo contactar', 'Ubicación'],
        cta: 'Escribinos por WhatsApp',
        notasMarca: 'Colores de la marca del negocio. Fotos reales del feed.',
      }),
    )

  /** Self-check 6/6: todos los hard-checks vigentes en verde → selfCheckAprobado true. */
  const selfCheck6de6 = () =>
    json(
      SelfCheckSchema.parse({
        itemsDuros: HARD_CHECKS.map((check) => ({ nombre: check.nombre, ok: true })),
        softFlags: [],
      }),
    )

  const rechazoAdmin = () =>
    json(
      RechazosSchema.parse([
        {
          fecha: isoHaceDias(1),
          motivo: 'La prueba social no es real',
          detalle: 'El bloque de reseñas usa testimonios genéricos en vez de los de la ficha.',
          donde: 'Sección "Reseñas"',
          arreglo: 'Reemplazá los textos por las reseñas reales del negocio (están en la ficha) y re-publicá el draft.',
        },
      ]),
    )

  // ── Catálogo declarativo: un lead por estado del wizard ────────────────────
  type EstadoSeed = {
    clave: string
    businessName: string
    contactName: string
    industry: string
    zone: string
    notes: string
    // Patch del lead (se reconcilia en cada corrida; los no-seteados → default).
    status: Prisma.OsLeadCreateInput['status']
    caliente: boolean
    reactivateAt: Date | null
    // Estado del dossier (se upsertea entero por leadId).
    dossier: Omit<Prisma.OsLeadDossierUncheckedUpdateInput, 'leadId'>
  }

  const fechaEval = isoHaceDias(2)

  const ESTADOS: EstadoSeed[] = [
    {
      clave: 'FICHA · incompleta',
      businessName: 'QA-W Ficha Incompleta',
      contactName: 'Lucía',
      industry: 'Bazar',
      zone: 'Yerba Buena',
      notes: 'QA-W — FICHA sin señal mínima: el Evaluador no puede juzgar a ciegas.',
      status: 'PROSPECTO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'FICHA', fichaJson: fichaIncompleta(), evaluacionJson: null, briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'FICHA · completa',
      businessName: 'QA-W Ficha Completa',
      contactName: 'Marcos',
      industry: 'Cafetería',
      zone: 'San Miguel de Tucumán',
      notes: 'QA-W — FICHA con señal suficiente: form de evaluación activo (elegí score 1–2 para ver el descarte).',
      status: 'PROSPECTO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'FICHA', fichaJson: fichaCompleta('Cafetería'), evaluacionJson: null, briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'EVALUADA · gate CERRADO',
      businessName: 'QA-W Evaluada Gate Cerrado',
      contactName: 'Rosa',
      industry: 'Panadería',
      zone: 'Tafí Viejo',
      notes: 'QA-W — EVALUADA, gate del brief cerrado (PROSPECTO sin respuesta, no caliente): esperando respuesta.',
      status: 'PROSPECTO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'EVALUADA', fichaJson: fichaCompleta('Panadería'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'EVALUADA · gate ABIERTO',
      businessName: 'QA-W Evaluada Gate Abierto',
      contactName: 'Diego',
      industry: 'Veterinaria',
      zone: 'Yerba Buena',
      notes: 'QA-W — EVALUADA, gate del brief abierto (RESPONDIO): el form del brief.',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'EVALUADA', fichaJson: fichaCompleta('Veterinaria'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'BRIEF',
      businessName: 'QA-W Brief',
      contactName: 'Maxi',
      industry: 'Barbería',
      zone: 'Las Talitas',
      notes: 'QA-W — BRIEF: intro de arranque de construcción.',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'BRIEF', fichaJson: fichaCompleta('Barbería'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: briefMinimo('Barbería El Faro'), selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'CONSTRUCCION · draft + self-check 6/6',
      businessName: 'QA-W Construccion',
      contactName: 'Sofía',
      industry: 'Pilates',
      zone: 'Yerba Buena',
      notes: 'QA-W — CONSTRUCCION con draft + self-check 6/6 (botón "Enviar a revisión" HABILITADO). Flip a sin-draft / self-check vacío: ver el log final.',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'CONSTRUCCION', fichaJson: fichaCompleta('Pilates'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: briefMinimo('Studio Pilates'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-w-construccion-draft.example.com', finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'EN_REVISION',
      businessName: 'QA-W En Revision',
      contactName: 'Pablo',
      industry: 'Gimnasio',
      zone: 'San Miguel de Tucumán',
      notes: 'QA-W — EN_REVISION: esperando revisión de Franco.',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'EN_REVISION', fichaJson: fichaCompleta('Gimnasio'), evaluacionJson: evalAvanzar(4, fechaEval), briefJson: briefMinimo('Gimnasio Atlas'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-w-en-revision-draft.example.com', finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'APROBADA · gate ABIERTO',
      businessName: 'QA-W Aprobada Gate Abierto',
      contactName: 'Mariana',
      industry: 'Estética',
      zone: 'Yerba Buena',
      notes: 'QA-W — APROBADA con finalUrl + RESPONDIO: el wizard ofrece el envío del link (Paso 9).',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'APROBADA', fichaJson: fichaCompleta('Estética'), evaluacionJson: evalAvanzar(4, fechaEval), briefJson: briefMinimo('Estética Aura'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-w-aprobada-abierto-draft.example.com', finalUrl: 'https://qa-w-aprobada-abierto.example.com', aprobadaAt: haceDias(1), enviadaAt: null, rechazos: null },
    },
    {
      clave: 'APROBADA · demo ENVIADA (m16, agendar)',
      businessName: 'QA-W Demo Enviada',
      contactName: 'Ariel',
      industry: 'Odontología',
      zone: 'San Miguel de Tucumán',
      notes: 'QA-W — APROBADA con la demo YA enviada y sin reunión agendada: el manual aterriza en M16 (agendar). Es el único estado que alcanza esa pantalla; sin él la medición de las catorce sale con trece.',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'APROBADA', fichaJson: fichaCompleta('Odontología'), evaluacionJson: evalAvanzar(4, fechaEval), briefJson: briefMinimo('Consultorio Sonrisa'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-w-demo-enviada-draft.example.com', finalUrl: 'https://qa-w-demo-enviada.example.com', aprobadaAt: haceDias(2), enviadaAt: haceDias(1), rechazos: null },
    },
    {
      clave: 'APROBADA · gate CERRADO',
      businessName: 'QA-W Aprobada Gate Cerrado',
      contactName: 'Hernán',
      industry: 'Ferretería',
      zone: 'Tafí Viejo',
      notes: 'QA-W — APROBADA sin finalUrl y PROSPECTO: "el link se libera cuando el negocio responda".',
      status: 'PROSPECTO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'APROBADA', fichaJson: fichaCompleta('Ferretería'), evaluacionJson: evalAvanzar(4, fechaEval), briefJson: briefMinimo('Ferretería El Tornillo'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-w-aprobada-cerrado-draft.example.com', finalUrl: null, aprobadaAt: haceDias(1), enviadaAt: null, rechazos: null },
    },
    {
      clave: 'RECHAZADA',
      businessName: 'QA-W Rechazada',
      contactName: 'Valentina',
      industry: 'Florería',
      zone: 'Yerba Buena',
      notes: 'QA-W — RECHAZADA con detalle del rechazo: callout del admin + reabrir construcción.',
      status: 'RESPONDIO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'RECHAZADA', fichaJson: fichaCompleta('Florería'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: briefMinimo('Florería Las Dalias'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-w-rechazada-draft.example.com', finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: rechazoAdmin() },
    },
    {
      clave: 'DESCARTADA',
      businessName: 'QA-W Descartada',
      contactName: 'Rubén',
      industry: 'Kiosco',
      zone: 'San Miguel de Tucumán',
      notes: 'QA-W — DESCARTADA tras evaluación (score 2, DESCARTAR + motivo): estado terminal del filtro.',
      status: 'PROSPECTO',
      caliente: false,
      reactivateAt: null,
      dossier: { stage: 'DESCARTADA', fichaJson: fichaCompleta('Kiosco'), evaluacionJson: evalDescarte(fechaEval), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'POSTERGADO · vencido',
      businessName: 'QA-W Postergado Vencido',
      contactName: 'Carla',
      industry: 'Heladería',
      zone: 'Las Talitas',
      notes: 'QA-W — POSTERGADO con reactivateAt vencido (D6): el foco lo vuelve a tratar como trabajo de ahora.',
      status: 'POSTERGADO',
      caliente: false,
      reactivateAt: haceDias(3),
      dossier: { stage: 'EVALUADA', fichaJson: fichaCompleta('Heladería'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
    {
      clave: 'POSTERGADO · futuro',
      businessName: 'QA-W Postergado Futuro',
      contactName: 'Tomás',
      industry: 'Librería',
      zone: 'Yerba Buena',
      notes: 'QA-W — POSTERGADO con reactivateAt futuro: sigue pausado en seguimiento hasta reactivarse.',
      status: 'POSTERGADO',
      caliente: false,
      reactivateAt: enDias(7),
      dossier: { stage: 'EVALUADA', fichaJson: fichaCompleta('Librería'), evaluacionJson: evalAvanzar(3, fechaEval), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, rechazos: null },
    },
  ]

  type Resultado = { clave: string; businessName: string; leadId: string; stage: string; status: string; accion: 'creado' | 'reconciliado' | 'ok' }
  const resultados: Resultado[] = []

  // `reactivateAt` se siembra como fecha RELATIVA (vencido = hace 3 d, futuro =
  // en 7 d), así que el timestamp exacto cambia entre corridas. Para que la
  // re-corrida sea 0-cambios se compara por LADO (pasado/futuro/none), no por ms:
  // un vencido sigue en el pasado y un futuro sigue en el futuro → no se reescribe.
  const nowMs = Date.now()
  const ladoReactivate = (d: Date | null): 'none' | 'pasado' | 'futuro' =>
    d == null ? 'none' : d.getTime() <= nowMs ? 'pasado' : 'futuro'

  for (const e of ESTADOS) {
    // 1. Lead: find-or-create por businessName, reconciliando el patch deseado.
    const existente = await prisma.osLead.findFirst({
      where: { businessName: e.businessName },
      select: { id: true, assignedToId: true, status: true, caliente: true, reactivateAt: true, notes: true },
    })

    let leadId: string
    let accion: Resultado['accion']
    const patch: Prisma.OsLeadUncheckedUpdateInput = {
      assignedToId: setter.id,
      status: e.status,
      caliente: e.caliente,
      reactivateAt: e.reactivateAt,
      notes: e.notes,
    }

    if (existente) {
      leadId = existente.id
      const desincronizado =
        existente.assignedToId !== setter.id ||
        existente.status !== e.status ||
        existente.caliente !== e.caliente ||
        ladoReactivate(existente.reactivateAt) !== ladoReactivate(e.reactivateAt) ||
        existente.notes !== e.notes
      if (desincronizado) {
        await prisma.osLead.update({ where: { id: leadId }, data: patch })
        accion = 'reconciliado'
      } else {
        accion = 'ok'
      }
    } else {
      const creado = await prisma.osLead.create({
        data: {
          businessName: e.businessName,
          contactName: e.contactName,
          industry: e.industry,
          zone: e.zone,
          ...patch,
        } as Prisma.OsLeadUncheckedCreateInput,
        select: { id: true },
      })
      leadId = creado.id
      accion = 'creado'
    }

    // 2. Dossier: upsert por leadId con TODOS los campos del estado deseado
    //    (stage directo: es seed, no la app). Converge en cada corrida. Los
    //    campos Json? en `null` se mapean a Prisma.DbNull (SQL NULL): Prisma no
    //    acepta el `null` literal en columnas Json.
    const JSON_FIELDS = ['fichaJson', 'evaluacionJson', 'briefJson', 'selfCheckJson', 'rechazos'] as const
    const dossierData: Record<string, unknown> = { ...e.dossier }
    for (const f of JSON_FIELDS) {
      if (dossierData[f] === null) dossierData[f] = PrismaNs.DbNull
    }
    await prisma.osLeadDossier.upsert({
      where: { leadId },
      update: dossierData as Prisma.OsLeadDossierUncheckedUpdateInput,
      create: { leadId, ...dossierData } as Prisma.OsLeadDossierUncheckedCreateInput,
    })

    const stage = String(dossierData.stage)
    resultados.push({ clave: e.clave, businessName: e.businessName, leadId, stage, status: String(e.status), accion })
  }

  // ── Verificación: releer de la DB y confirmar cobertura (no asumir) ─────────
  const enDb = await prisma.osLead.findMany({
    where: { assignedToId: setter.id, businessName: { startsWith: 'QA-W ' } },
    select: { id: true, businessName: true, status: true, reactivateAt: true, caliente: true, dossier: { select: { stage: true, finalUrl: true } } },
    orderBy: { businessName: 'asc' },
  })

  console.log(`\n${'═'.repeat(96)}`)
  console.log(`Seed V-1 — leads QA-W owned por setter-qa (${enDb.length}):\n`)
  console.log(`${'ESTADO'.padEnd(34)}${'BUSINESS NAME'.padEnd(30)}LEAD ID`)
  console.log('─'.repeat(96))
  for (const r of resultados) {
    console.log(`${r.clave.padEnd(34)}${r.businessName.padEnd(30)}${r.leadId}   [${r.accion}]`)
  }

  // Aserción de cobertura: cada estado esperado tiene su lead en la DB.
  const verificaciones: Array<{ etiqueta: string; ok: boolean }> = [
    { etiqueta: 'FICHA × 2 (incompleta + completa)', ok: enDb.filter((l) => l.dossier?.stage === 'FICHA').length >= 2 },
    { etiqueta: 'EVALUADA cerrado (PROSPECTO)', ok: enDb.some((l) => l.dossier?.stage === 'EVALUADA' && l.status === 'PROSPECTO') },
    { etiqueta: 'EVALUADA abierto (RESPONDIO)', ok: enDb.some((l) => l.dossier?.stage === 'EVALUADA' && l.status === 'RESPONDIO') },
    { etiqueta: 'BRIEF', ok: enDb.some((l) => l.dossier?.stage === 'BRIEF') },
    { etiqueta: 'CONSTRUCCION', ok: enDb.some((l) => l.dossier?.stage === 'CONSTRUCCION') },
    { etiqueta: 'EN_REVISION', ok: enDb.some((l) => l.dossier?.stage === 'EN_REVISION') },
    { etiqueta: 'APROBADA abierto (finalUrl + RESPONDIO)', ok: enDb.some((l) => l.dossier?.stage === 'APROBADA' && l.dossier?.finalUrl != null && l.status === 'RESPONDIO') },
    { etiqueta: 'APROBADA cerrado (sin finalUrl)', ok: enDb.some((l) => l.dossier?.stage === 'APROBADA' && l.dossier?.finalUrl == null) },
    { etiqueta: 'RECHAZADA', ok: enDb.some((l) => l.dossier?.stage === 'RECHAZADA') },
    { etiqueta: 'DESCARTADA', ok: enDb.some((l) => l.dossier?.stage === 'DESCARTADA') },
    { etiqueta: 'POSTERGADO vencido', ok: enDb.some((l) => l.status === 'POSTERGADO' && l.reactivateAt != null && l.reactivateAt < ahora()) },
    { etiqueta: 'POSTERGADO futuro', ok: enDb.some((l) => l.status === 'POSTERGADO' && l.reactivateAt != null && l.reactivateAt > ahora()) },
  ]
  console.log(`\n${'─'.repeat(96)}\nCobertura de estados:`)
  let faltan = 0
  for (const v of verificaciones) {
    if (!v.ok) faltan += 1
    console.log(`  ${v.ok ? '✅' : '❌'} ${v.etiqueta}`)
  }

  console.log(`\n${'─'.repeat(96)}`)
  for (const linea of FLIP_CONSTRUCCION) console.log(linea)

  await prisma.$disconnect()

  if (faltan > 0) {
    console.error(`\nABORT: faltan ${faltan} estado(s) — revisá el catálogo ESTADOS.`)
    process.exit(1)
  }
  console.log('\n✅ Cobertura completa: cada estado del wizard tiene su lead owned por setter-qa.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
