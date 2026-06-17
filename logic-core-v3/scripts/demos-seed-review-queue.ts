/**
 * DEMOS — Puebla la cola de revisión del admin (/admin/leados) con dossiers
 * cuyos `draftUrl` son las URLs reales de los templates inmersivos de
 * /web-development (TEMPLATES[] en WebTemplatesImmersive.tsx). Reemplaza los
 * placeholders example.com/example.org del seed QA (b5-qa-review-queue.ts).
 *
 * Qué deja armado (idempotente):
 *   1. 6 leads "DEMO Web · <Template>" asignados al setter QA (si existe), cada
 *      uno con un dossier caminado FICHA → EVALUADA → BRIEF → CONSTRUCCION →
 *      EN_REVISION por el camino LEGAL (transitionDossier), con ficha,
 *      evaluación (score 5 CALIENTE → abre el gate del brief sin tocar status),
 *      brief, self-check en verde y `draftUrl` = la URL real del template.
 *   2. Migración de placeholders: cualquier dossier EN_REVISION con un draftUrl
 *      example.* (las filas QA legacy de b5) pasa a una URL real → cero
 *      example.* en la cola.
 *
 * No destructivo: upsert por `businessName`; solo toca filas propias (los
 * "DEMO Web · *") y reescribe draftUrl de las que tienen placeholder. No borra
 * nada, no toca tablas de otros módulos (DB compartida con el lane Chatbots).
 *
 * Corre SOLO contra la branch Neon dev (host check abajo).
 * Uso: npx tsx scripts/demos-seed-review-queue.ts
 */
import { config as loadEnv } from 'dotenv'
// Import type-only: se borra al compilar, no instancia el client antes de dotenv.
import type { Prisma } from '@prisma/client'
import type { Brief, Evaluacion, Ficha } from '../src/lib/leados/contracts'

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

type DemoSeed = {
  businessName: string
  contactName: string
  industry: string
  zone: string
  instagramUrl: string
  draftUrl: string
  ficha: Ficha
  evaluacion: Evaluacion
  brief: Brief
}

// URLs verbatim de WebTemplatesImmersive.tsx (TEMPLATES[]). OJO: el host de
// "The Ethereal Resort" es 'ethernal' (no 'ethereal') — así está desplegado.
const DEMOS: DemoSeed[] = [
  {
    businessName: 'DEMO Web · Zero Protocol',
    contactName: 'Iván',
    industry: 'Software',
    zone: 'San Miguel de Tucumán',
    instagramUrl: 'https://instagram.com/zero.protocol.demo',
    draftUrl: 'https://template-zero.netlify.app/',
    ficha: {
      identidad: {
        notas: 'Estudio de software boutique, estética terminal/cyberpunk. Marca personal fuerte del fundador.',
        igManejadoPor: 'DUENO',
      },
      presenciaDigital: 'IG activo con reels de producto; sin web propia, todo va a un Linktree.',
      resenas: 'Testimonios de clientes B2B en LinkedIn, muy técnicos y positivos.',
      contenidoReal: 'Logo monocromo de alto contraste, capturas de dashboards reales.',
      senalesOperativas: 'Responden rápido por DM; agenda llena para implementaciones.',
    },
    evaluacion: {
      score: 5,
      veredicto: 'CALIENTE',
      razonamiento:
        'Marca con identidad clarísima y producto demostrable. Una landing de alto contraste cierra la brecha de no tener web — encaja perfecto con el template Zero.',
    },
    brief: {
      titulo: 'Landing Zero Protocol',
      concepto: 'One-page oscura, terminal de alto contraste, foco en el producto y la prueba técnica.',
      secciones: ['Hero', 'Producto', 'Casos', 'Contacto'],
      notasMarca: 'Verde fósforo sobre negro, tipografía mono.',
      cta: 'Agendar una demo técnica',
    },
  },
  {
    businessName: 'DEMO Web · The Ethereal Resort',
    contactName: 'Camila',
    industry: 'Hotelería',
    zone: 'Tafí del Valle',
    instagramUrl: 'https://instagram.com/ethereal.resort.demo',
    draftUrl: 'https://template-ethernal.netlify.app/',
    ficha: {
      identidad: {
        notas: 'Resort de montaña premium, propuesta de calma y desconexión.',
        igManejadoPor: 'CM',
      },
      presenciaDigital: 'IG cuidado con fotografía profesional; web actual lenta y desactualizada.',
      resenas: '4.8 en Google Maps, reseñas que destacan el silencio y la atención.',
      contenidoReal: 'Banco de fotos propias de habitaciones y paisaje, paleta cálida.',
      senalesOperativas: 'Reservas por WhatsApp; temporada alta con lista de espera.',
    },
    evaluacion: {
      score: 5,
      veredicto: 'CALIENTE',
      razonamiento:
        'Tiene assets visuales premium y demanda real; la web actual no le hace justicia. El template Ethereal levanta la percepción de marca al toque.',
    },
    brief: {
      titulo: 'Landing The Ethereal Resort',
      concepto: 'One-page calma y premium, foco en la experiencia y la fotografía.',
      secciones: ['Hero', 'Experiencia', 'Habitaciones', 'Reservas'],
      notasMarca: 'Tonos arena y dorado suave, mucho aire.',
      cta: 'Reservar por WhatsApp',
    },
  },
  {
    businessName: 'DEMO Web · Noir Dining',
    contactName: 'Lucio',
    industry: 'Gastronomía',
    zone: 'Yerba Buena',
    instagramUrl: 'https://instagram.com/noir.dining.demo',
    draftUrl: 'https://template-noir.netlify.app/',
    ficha: {
      identidad: {
        notas: 'Restaurante de autor, propuesta dark e inmersiva, menú degustación.',
        igManejadoPor: 'CM',
      },
      presenciaDigital: 'IG con fotografía de platos muy lograda; sin web, reservas por DM.',
      resenas: 'Reseñas que mencionan la ambientación y la cocina de autor.',
      contenidoReal: 'Fotos propias de platos sobre fondo negro, logo serif.',
      senalesOperativas: 'Cupos limitados por noche; reservan con anticipación.',
    },
    evaluacion: {
      score: 5,
      veredicto: 'CALIENTE',
      razonamiento:
        'Concepto fuerte y fotografía existente que encaja 1:1 con el template Noir. Una web propia profesionaliza la reserva.',
    },
    brief: {
      titulo: 'Landing Noir Dining',
      concepto: 'One-page dark inmersiva, foco en la experiencia gastronómica y la reserva.',
      secciones: ['Hero', 'Menú', 'Ambiente', 'Reservas'],
      notasMarca: 'Negro profundo, acentos cálidos, serif elegante.',
      cta: 'Reservar mesa',
    },
  },
  {
    businessName: 'DEMO Web · Skyline Estates',
    contactName: 'Paula',
    industry: 'Inmobiliaria',
    zone: 'San Miguel de Tucumán',
    instagramUrl: 'https://instagram.com/skyline.estates.demo',
    draftUrl: 'https://template-skyline.netlify.app/',
    ficha: {
      identidad: {
        notas: 'Inmobiliaria de propiedades premium, imagen limpia y moderna.',
        igManejadoPor: 'DUENO',
      },
      presenciaDigital: 'IG con tours de propiedades; usan un portal genérico para listar.',
      resenas: 'Buenas referencias de compradores, destacan la transparencia.',
      contenidoReal: 'Fotos y videos de propiedades, render de proyectos.',
      senalesOperativas: 'Consultas constantes por DM; cierran ventas de ticket alto.',
    },
    evaluacion: {
      score: 5,
      veredicto: 'CALIENTE',
      razonamiento:
        'Ticket alto y catálogo visual fuerte. Una landing limpia tipo Skyline les da catálogo propio y autoridad frente al portal genérico.',
    },
    brief: {
      titulo: 'Landing Skyline Estates',
      concepto: 'One-page clean y moderna, foco en el catálogo de propiedades y el contacto.',
      secciones: ['Hero', 'Propiedades', 'Nosotros', 'Contacto'],
      notasMarca: 'Azul frío y blanco, mucho espacio en blanco.',
      cta: 'Agendar una visita',
    },
  },
  {
    businessName: 'DEMO Web · NEXO Bold',
    contactName: 'Tomás',
    industry: 'Agencia creativa',
    zone: 'San Miguel de Tucumán',
    instagramUrl: 'https://instagram.com/nexo.bold.demo',
    draftUrl: 'https://template-bold.netlify.app/',
    ficha: {
      identidad: {
        notas: 'Agencia creativa, identidad brutalista y bold. Portfolio fuerte.',
        igManejadoPor: 'DUENO',
      },
      presenciaDigital: 'IG con piezas de campañas; web vieja que no representa el laburo actual.',
      resenas: 'Clientes recurrentes, recomendaciones boca a boca.',
      contenidoReal: 'Portfolio de campañas, tipografías display, mucho color.',
      senalesOperativas: 'Pipeline activo de proyectos; buscan diferenciarse visualmente.',
    },
    evaluacion: {
      score: 5,
      veredicto: 'CALIENTE',
      razonamiento:
        'Una agencia creativa necesita una web que grite diferenciación. El template Bold/brutalista es exactamente su tono — match inmediato.',
    },
    brief: {
      titulo: 'Landing NEXO Bold',
      concepto: 'One-page brutalista, foco en el portfolio y la personalidad de la agencia.',
      secciones: ['Hero', 'Trabajos', 'Servicios', 'Contacto'],
      notasMarca: 'Tipografía display gigante, color saturado, layout asimétrico.',
      cta: 'Trabajemos juntos',
    },
  },
  {
    businessName: 'DEMO Web · YAKU Nebula',
    contactName: 'Sofía',
    industry: 'SaaS',
    zone: 'San Miguel de Tucumán',
    instagramUrl: 'https://instagram.com/yaku.nebula.demo',
    draftUrl: 'https://template-nebula.netlify.app/',
    ficha: {
      identidad: {
        notas: 'Startup SaaS, producto B2B con foco en performance. Marca neón/espacial.',
        igManejadoPor: 'CM',
      },
      presenciaDigital: 'IG y LinkedIn activos; landing actual genérica sin foco de conversión.',
      resenas: 'Early adopters dejando feedback muy positivo sobre la velocidad.',
      contenidoReal: 'Capturas del producto, métricas reales, logo neón.',
      senalesOperativas: 'Trial gratuito con buena conversión; buscan escalar el funnel.',
    },
    evaluacion: {
      score: 5,
      veredicto: 'CALIENTE',
      razonamiento:
        'Producto con tracción y necesidad clara de una landing de conversión. El template Nebula (neón/performance) habla su idioma — alto fit.',
    },
    brief: {
      titulo: 'Landing YAKU Nebula',
      concepto: 'One-page neón y performante, foco en el valor del producto y el trial.',
      secciones: ['Hero', 'Features', 'Precios', 'Empezar'],
      notasMarca: 'Cian neón sobre fondo espacial, gradientes sutiles.',
      cta: 'Empezar el trial gratis',
    },
  },
]

const PLACEHOLDER_RE = /example\.(com|org|net)/i

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')
  const { transitionDossier } = await import('../src/lib/leados/dossier')
  const { BriefSchema, FichaSchema } = await import('../src/lib/leados/contracts')
  const { buildSelfCheck, HARD_CHECKS } = await import('../src/lib/leados/flow')

  // Self-check en verde (todos los hard-blocks ok) — lo escribe el seed
  // directo porque B4 (UI de construcción) no participa acá.
  const durosOk: Record<string, boolean> = {}
  for (const check of HARD_CHECKS) durosOk[check.id] = true
  const selfCheckOk = buildSelfCheck(durosOk, [])

  // Setter QA opcional: si existe lo usamos para que la cola muestre setter y
  // alimente la métrica descarte/avance; si no, los leads quedan sin asignar
  // (la cola igual los lista con "Sin setter").
  const setter =
    (await prisma.user.findUnique({
      where: { email: 'setter-qa@develop.test' },
      select: { id: true, role: true },
    })) ?? (await prisma.user.findFirst({ where: { role: 'SETTER' }, select: { id: true, role: true } }))
  const setterId = setter?.role === 'SETTER' ? setter.id : null
  if (!setterId) {
    console.log('ℹ️  Sin setter QA (SETTER) — los demos quedan sin asignar. Para la métrica, corré antes prisma/seed.ts.')
  }

  for (const demo of DEMOS) {
    let lead = await prisma.osLead.findFirst({
      where: { businessName: demo.businessName },
      select: { id: true, assignedToId: true },
    })
    if (!lead) {
      const created = await prisma.osLead.create({
        data: {
          businessName: demo.businessName,
          contactName: demo.contactName,
          industry: demo.industry,
          zone: demo.zone,
          instagramUrl: demo.instagramUrl,
          notes: 'Seed DEMO del lane Revisión Demos — draftUrl = template real de /web-development.',
          ...(setterId ? { assignedToId: setterId } : {}),
        },
        select: { id: true, assignedToId: true },
      })
      lead = created
      console.log(`✨ ${demo.businessName}: lead creado (${created.id})`)
    } else if (setterId && !lead.assignedToId) {
      await prisma.osLead.update({ where: { id: lead.id }, data: { assignedToId: setterId } })
      console.log(`🔁 ${demo.businessName}: asignado al setter QA`)
    }
    const leadId = lead.id

    let dossier = await prisma.osLeadDossier.findUnique({ where: { leadId } })
    if (!dossier) {
      dossier = await prisma.osLeadDossier.create({
        data: { leadId, fichaJson: FichaSchema.parse(demo.ficha) as Prisma.InputJsonValue },
      })
    }

    let stage = dossier.stage
    // El snapshot `dossier` sólo es confiable para el patch idempotente si la
    // fila YA estaba EN_REVISION al entrar; si la caminamos en esta pasada, los
    // bloques del walk ya dejaron todo escrito (no re-leemos = no doble write).
    const startedEnRevision = stage === 'EN_REVISION'
    if (stage === 'APROBADA' || stage === 'DESCARTADA') {
      console.log(`⏭️  ${demo.businessName}: stage terminal ${stage} — no se toca`)
      continue
    }

    // Camino LEGAL hasta EN_REVISION (mismo patrón que b5-qa-review-queue.ts).
    if (stage === 'RECHAZADA') {
      await transitionDossier(leadId, { to: 'CONSTRUCCION' })
      stage = 'CONSTRUCCION'
    }
    if (stage === 'FICHA') {
      if (!dossier.fichaJson) {
        await prisma.osLeadDossier.update({
          where: { leadId },
          data: { fichaJson: FichaSchema.parse(demo.ficha) as Prisma.InputJsonValue },
        })
      }
      await transitionDossier(leadId, { to: 'EVALUADA', evaluacion: demo.evaluacion })
      stage = 'EVALUADA'
    }
    if (stage === 'EVALUADA') {
      // score 5 (CALIENTE) abre el gate EVALUADA→BRIEF sin tocar el status.
      await transitionDossier(leadId, { to: 'BRIEF' })
      stage = 'BRIEF'
    }
    if (stage === 'BRIEF') {
      await prisma.osLeadDossier.update({
        where: { leadId },
        data: { briefJson: BriefSchema.parse(demo.brief) as Prisma.InputJsonValue },
      })
      await transitionDossier(leadId, { to: 'CONSTRUCCION' })
      stage = 'CONSTRUCCION'
    }
    if (stage === 'CONSTRUCCION') {
      await prisma.osLeadDossier.update({
        where: { leadId },
        data: {
          selfCheckJson: selfCheckOk as Prisma.InputJsonValue,
          draftUrl: demo.draftUrl,
        },
      })
      await transitionDossier(leadId, { to: 'EN_REVISION' })
      console.log(`✨ ${demo.businessName}: EN_REVISION + draftUrl real (${demo.draftUrl})`)
      stage = 'EN_REVISION'
    }
    if (startedEnRevision) {
      // Idempotencia: garantizar URL real + blobs en re-corridas (la fila ya
      // estaba EN_REVISION; `dossier` refleja su estado actual en la DB).
      const patch: Prisma.OsLeadDossierUpdateInput = {}
      if (!dossier.draftUrl || PLACEHOLDER_RE.test(dossier.draftUrl)) patch.draftUrl = demo.draftUrl
      if (!dossier.briefJson) patch.briefJson = BriefSchema.parse(demo.brief) as Prisma.InputJsonValue
      if (!dossier.selfCheckJson) patch.selfCheckJson = selfCheckOk as Prisma.InputJsonValue
      if (Object.keys(patch).length > 0) {
        await prisma.osLeadDossier.update({ where: { leadId }, data: patch })
        console.log(`🔗 ${demo.businessName}: draftUrl/blobs actualizados`)
      } else {
        console.log(`✅ ${demo.businessName}: ya EN_REVISION con URL real`)
      }
    }
  }

  // Migración de placeholders legacy: cualquier dossier EN_REVISION con
  // example.* (las filas QA de b5) pasa a una URL real → cero example.* en cola.
  const enRevisionRows = await prisma.osLeadDossier.findMany({
    where: { stage: 'EN_REVISION' },
    select: { leadId: true, draftUrl: true, lead: { select: { businessName: true } } },
  })
  let migrados = 0
  for (const row of enRevisionRows) {
    if (row.draftUrl && PLACEHOLDER_RE.test(row.draftUrl)) {
      const realUrl = DEMOS[migrados % DEMOS.length].draftUrl
      await prisma.osLeadDossier.update({ where: { leadId: row.leadId }, data: { draftUrl: realUrl } })
      console.log(`🩹 ${row.lead.businessName}: placeholder ${row.draftUrl} → ${realUrl}`)
      migrados += 1
    }
  }

  const enRevision = await prisma.osLeadDossier.count({ where: { stage: 'EN_REVISION' } })
  const conPlaceholder = enRevisionRows.filter((r) => r.draftUrl && PLACEHOLDER_RE.test(r.draftUrl)).length
  console.log(
    `\nCola de revisión: ${enRevision} dossier(s) EN_REVISION · ${migrados} placeholder(s) migrado(s) · ` +
      `${conPlaceholder - migrados} con example.* restante(s) (debe ser 0).`,
  )
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
