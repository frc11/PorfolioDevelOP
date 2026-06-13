/**
 * B2 — Verificación del modelo de producción del dossier (LeadOS).
 *
 * Corre SOLO contra la branch Neon dev (host check abajo). Qué hace:
 *   1. Upsertea el setter QA (idéntico a B1) y crea 3 leads temporales suyos.
 *   2. Unicidad 1:1: `ensureOwnedDossier` es idempotente y el unique de DB
 *      rechaza un segundo create crudo (P2002).
 *   3. Ownership: lead ajeno → getOwnedDossier/ensureOwnedDossier dan null.
 *   4. Máquina de stage: transición ilegal falla, contrato inválido falla,
 *      camino feliz completo pasa (FICHA→…→APROBADA con loop de rechazo).
 *   5. Gate EVALUADA→BRIEF: bloquea sin RESPONDIO y score < 4; deja pasar
 *      con score 4 (lead frío) y con LeadStatus.RESPONDIO (score bajo).
 *   6. Cascade: borrar el lead borra su dossier.
 *   7. Cleanup en finally — no deja residuo.
 *
 * Uso: npx tsx scripts/b2-verify-dossier.ts
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
  const [{ prisma }, dossierLib, { Prisma }, bcrypt] = await Promise.all([
    import('../src/lib/prisma'),
    import('../src/lib/leados/dossier'),
    import('@prisma/client'),
    import('bcryptjs').then((m) => m.default),
  ])
  const { getOwnedDossier, ensureOwnedDossier, transitionDossier, DossierTransitionError } =
    dossierLib

  const results: Array<{ name: string; pass: boolean; detail?: string }> = []
  const check = (name: string, pass: boolean, detail?: string) => {
    results.push({ name, pass, detail })
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
  }
  const expectError = async (fn: () => Promise<unknown>): Promise<unknown> => {
    try {
      await fn()
      return null
    } catch (error) {
      return error
    }
  }

  const setterPassword = await bcrypt.hash('Setter1234!', 12)
  const setter = await prisma.user.upsert({
    where: { email: 'setter-qa@develop.test' },
    update: {
      name: 'QA Setter',
      password: setterPassword,
      role: 'SETTER',
      emailVerified: new Date(),
      passwordResetRequired: true,
    },
    create: {
      name: 'QA Setter',
      email: 'setter-qa@develop.test',
      password: setterPassword,
      role: 'SETTER',
      emailVerified: new Date(),
      passwordResetRequired: true,
    },
  })
  console.log(`Setter QA listo: ${setter.email} (${setter.id})`)

  const tempLeadIds: string[] = []
  try {
    const [leadFrio, leadCaliente, leadRespondio] = await Promise.all([
      prisma.osLead.create({
        data: {
          businessName: 'B2-QA dossier frío (temporal, se borra solo)',
          source: 'b2-qa-script',
          status: 'PROSPECTO',
          assignedToId: setter.id,
        },
      }),
      prisma.osLead.create({
        data: {
          businessName: 'B2-QA dossier caliente (temporal, se borra solo)',
          source: 'b2-qa-script',
          status: 'PROSPECTO',
          assignedToId: setter.id,
        },
      }),
      prisma.osLead.create({
        data: {
          businessName: 'B2-QA dossier respondió (temporal, se borra solo)',
          source: 'b2-qa-script',
          status: 'RESPONDIO',
          assignedToId: setter.id,
        },
      }),
    ])
    tempLeadIds.push(leadFrio.id, leadCaliente.id, leadRespondio.id)

    // ── 1:1 + idempotencia ───────────────────────────────────────────────
    const dossier1 = await ensureOwnedDossier(leadFrio.id, setter.id)
    check('ensureOwnedDossier crea el dossier en FICHA', dossier1?.stage === 'FICHA')

    const dossier1bis = await ensureOwnedDossier(leadFrio.id, setter.id)
    check(
      'Segundo ensureOwnedDossier devuelve el MISMO dossier (idempotente)',
      dossier1 !== null && dossier1bis?.id === dossier1.id,
    )

    const dupError = await expectError(() =>
      prisma.osLeadDossier.create({ data: { leadId: leadFrio.id } }),
    )
    check(
      'Create crudo duplicado → P2002 (unique leadId a nivel DB)',
      dupError instanceof Prisma.PrismaClientKnownRequestError && dupError.code === 'P2002',
    )

    // ── Ownership ────────────────────────────────────────────────────────
    const otroUser = await prisma.user.findFirst({
      where: { id: { not: setter.id } },
      select: { id: true },
    })
    if (otroUser) {
      const crossGet = await getOwnedDossier(leadFrio.id, otroUser.id)
      const crossEnsure = await ensureOwnedDossier(leadFrio.id, otroUser.id)
      check(
        'Acceso cross-user → null (get y ensure, anti cross-setter)',
        crossGet === null && crossEnsure === null,
      )
    } else {
      check('Acceso cross-user → null', false, 'SKIP: no hay otro user en la DB')
    }

    // ── Transiciones ilegales y contrato ─────────────────────────────────
    const ilegal = await expectError(() =>
      transitionDossier(leadFrio.id, { to: 'BRIEF' }),
    )
    check('Transición ilegal FICHA→BRIEF falla', ilegal instanceof DossierTransitionError)

    const contratoInvalido = await expectError(() =>
      transitionDossier(leadFrio.id, {
        to: 'EVALUADA',
        evaluacion: {
          score: 7 as never,
          veredicto: 'AVANZAR',
          razonamiento: 'score fuera de rango',
        },
      }),
    )
    check('FICHA→EVALUADA con score 7 falla (contrato zod)', contratoInvalido !== null)

    // ── Camino frío: score bajo, sin respuesta → descarte ────────────────
    const evaluado = await transitionDossier(leadFrio.id, {
      to: 'EVALUADA',
      evaluacion: { score: 2, veredicto: 'DESCARTAR', razonamiento: 'negocio sin señal' },
    })
    check(
      'FICHA→EVALUADA legal pasa y guarda evaluacionJson',
      evaluado.stage === 'EVALUADA' && evaluado.evaluacionJson !== null,
    )

    const gateBloqueado = await expectError(() =>
      transitionDossier(leadFrio.id, { to: 'BRIEF' }),
    )
    check(
      'Gate EVALUADA→BRIEF bloquea (PROSPECTO + score 2)',
      gateBloqueado instanceof DossierTransitionError,
    )

    const descarteSinMotivo = await expectError(() =>
      transitionDossier(leadFrio.id, { to: 'DESCARTADA', motivoDescarte: '   ' }),
    )
    check(
      'EVALUADA→DESCARTADA sin motivo falla',
      descarteSinMotivo instanceof DossierTransitionError,
    )

    const descartado = await transitionDossier(leadFrio.id, {
      to: 'DESCARTADA',
      motivoDescarte: 'Score 2: sin presencia digital rescatable',
    })
    const motivoGuardado =
      typeof descartado.evaluacionJson === 'object' &&
      descartado.evaluacionJson !== null &&
      !Array.isArray(descartado.evaluacionJson) &&
      typeof descartado.evaluacionJson.motivoDescarte === 'string'
    check(
      'EVALUADA→DESCARTADA con motivo pasa y lo guarda en evaluacionJson',
      descartado.stage === 'DESCARTADA' && motivoGuardado,
    )

    const desdeTerminal = await expectError(() =>
      transitionDossier(leadFrio.id, { to: 'BRIEF' }),
    )
    check('DESCARTADA es terminal (→BRIEF falla)', desdeTerminal instanceof DossierTransitionError)

    // ── Camino caliente: score 4 sin RESPONDIO → demo preventiva completa ─
    await ensureOwnedDossier(leadCaliente.id, setter.id)
    await transitionDossier(leadCaliente.id, {
      to: 'EVALUADA',
      evaluacion: { score: 4, veredicto: 'CALIENTE', razonamiento: 'reseñas + IG activo' },
    })
    const briefCaliente = await transitionDossier(leadCaliente.id, { to: 'BRIEF' })
    check(
      'Gate deja pasar con score 4 aunque el lead esté PROSPECTO',
      briefCaliente.stage === 'BRIEF',
    )

    await transitionDossier(leadCaliente.id, { to: 'CONSTRUCCION' })
    await transitionDossier(leadCaliente.id, { to: 'EN_REVISION' })

    const rechazoSinMotivo = await expectError(() =>
      transitionDossier(leadCaliente.id, { to: 'RECHAZADA', motivo: '' }),
    )
    check(
      'EN_REVISION→RECHAZADA sin motivo falla',
      rechazoSinMotivo instanceof DossierTransitionError,
    )

    const rechazado = await transitionDossier(leadCaliente.id, {
      to: 'RECHAZADA',
      motivo: 'Hero flojo',
      detalle: 'El above-the-fold no comunica el rubro',
    })
    const historial = Array.isArray(rechazado.rechazos) ? rechazado.rechazos : []
    check(
      'RECHAZADA appendea {fecha, motivo, detalle} al historial',
      rechazado.stage === 'RECHAZADA' && historial.length === 1,
      `rechazos=${JSON.stringify(rechazado.rechazos)}`,
    )

    await transitionDossier(leadCaliente.id, { to: 'CONSTRUCCION' })
    await transitionDossier(leadCaliente.id, { to: 'EN_REVISION' })
    const aprobado = await transitionDossier(leadCaliente.id, { to: 'APROBADA' })
    check(
      'Loop de rechazo: RECHAZADA→CONSTRUCCION→EN_REVISION→APROBADA pasa',
      aprobado.stage === 'APROBADA' && Array.isArray(aprobado.rechazos),
    )

    // ── Camino RESPONDIO: score bajo pero el lead respondió ──────────────
    await ensureOwnedDossier(leadRespondio.id, setter.id)
    await transitionDossier(leadRespondio.id, {
      to: 'EVALUADA',
      evaluacion: { score: 2, veredicto: 'AVANZAR', razonamiento: 'respondió con interés' },
    })
    const briefRespondio = await transitionDossier(leadRespondio.id, { to: 'BRIEF' })
    check(
      'Gate deja pasar con LeadStatus.RESPONDIO aunque el score sea 2',
      briefRespondio.stage === 'BRIEF',
    )

    // ── Cascade ──────────────────────────────────────────────────────────
    await prisma.osLead.delete({ where: { id: leadRespondio.id } })
    tempLeadIds.splice(tempLeadIds.indexOf(leadRespondio.id), 1)
    const huerfano = await prisma.osLeadDossier.findUnique({
      where: { leadId: leadRespondio.id },
    })
    check('Borrar el lead borra su dossier (onDelete: Cascade)', huerfano === null)
  } finally {
    if (tempLeadIds.length > 0) {
      await prisma.osLead.deleteMany({ where: { id: { in: tempLeadIds } } })
      console.log(`${tempLeadIds.length} leads temporales borrados (dossiers via cascade).`)
    }
    await prisma.$disconnect()
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks OK`)
  if (failed.length > 0) process.exit(1)
}

main().catch((error) => {
  console.error('Error en verificación B2:', error)
  process.exit(1)
})
