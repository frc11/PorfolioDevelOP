/**
 * SEED — Mensajes demo para el inbox admin (/admin/messages).
 *
 * Genera conversaciones/mensajes variados usando las organizations EXISTENTES
 * (no crea orgs, no toca schema, no migra). Puebla el inbox para probar el
 * layout de altura fija + scroll (incluye un hilo largo).
 *
 * IDEMPOTENTE: antes de sembrar borra los mensajes demo previos (los marcados
 * con SEED_MARKER) y recrea — re-correrlo deja el mismo estado, sin duplicar.
 * REVERSIBLE: cleanup-messages-demo.ts borra exactamente lo sembrado.
 *
 * Correr DESDE logic-core-v3/ (igual que los demás npm scripts):
 *   npx ts-node --transpile-only scripts/seed-messages-demo.ts --confirm
 *
 * Script self-contained a propósito (igual que el par _b14-2-*): bajo Node 24 los
 * .ts corren como ESM nativo, donde imports relativos entre scripts y __dirname
 * no resuelven. Sin imports relativos ni __dirname → corre en ESM y en CJS.
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// .env.local está gitignored (no existe en un worktree nuevo). Path relativo al
// CWD: por eso hay que correr el script parado en logic-core-v3/.
loadEnv({ path: '.env.local' })

// ZWSP (U+200B) · ZWNJ (U+200C) · ZWSP (U+200B). Ancho cero → invisible en la UI.
// Construido con fromCharCode (un literal invisible sería irrevisable).
// ⚠ MUST MATCH el de cleanup-messages-demo.ts, o el cleanup no encuentra la data.
const SEED_MARKER = String.fromCharCode(0x200b, 0x200c, 0x200b)

const prisma = new PrismaClient({ log: ['error'] })

// Cuántas orgs existentes poblar como máximo (las primeras por antigüedad).
const MAX_ORGS = 6

function preflight(): void {
  if (!process.argv.slice(2).includes('--confirm')) {
    console.error('ABORT: faltó --confirm. Este seed escribe en la base de datos.')
    console.error('       Run: npx ts-node --transpile-only scripts/seed-messages-demo.ts --confirm')
    process.exit(1)
  }
  const url = process.env.DATABASE_URL ?? ''
  if (!url) {
    console.error('ABORT: DATABASE_URL no está seteada.')
    console.error('       Este worktree no tiene .env.local (las env están gitignored).')
    console.error('       Creá logic-core-v3/.env.local con tu DATABASE_URL de dev (o exportala) y reintentá.')
    process.exit(1)
  }
  // Host (nunca la URL completa — no logueamos credenciales) para revisión visual.
  const host = url.match(/@([^/]+)/)?.[1] ?? '(host desconocido)'
  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  SEED — Mensajes demo (admin inbox)')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Host:      ${host}`)
  console.log('  Marcador:  zero-width invisible (reversible vía cleanup)')
  console.log('  Alcance:   SOLO orgs existentes. No crea/borra orgs ni schema.')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
}

type Turn = { fromAdmin: boolean; text: string; minutesAgo: number; read?: boolean }

// Hilo largo (org 0) — para probar el scroll interno del thread sin empujar el
// layout. ~30 turnos, el más viejo arriba (minutesAgo decrece hacia el final).
function longThread(): Turn[] {
  const lines: Array<[admin: boolean, text: string]> = [
    [false, 'Hola equipo, necesito una mano con el panel de analítica.'],
    [true, '¡Hola! Contanos qué estás viendo y lo revisamos juntos.'],
    [false, 'No me carga el reporte de septiembre, queda girando.'],
    [true, 'Gracias por el aviso. ¿Desde qué navegador entrás?'],
    [false, 'Chrome en la notebook, recién actualizado.'],
    [true, 'Perfecto. ¿Te aparece algún cartel de error o solo el spinner?'],
    [false, 'Solo el spinner, nunca termina de cargar.'],
    [true, 'Ok, lo estoy reproduciendo de nuestro lado. Dame unos minutos.'],
    [false, 'Dale, gracias. Lo necesito para una reunión mañana 10am.'],
    [true, 'Anotado. Vamos a priorizarlo para que llegues tranquilo.'],
    [false, '¿Hay algo que pueda probar mientras tanto?'],
    [true, 'Probá cerrar sesión y volver a entrar, a veces destraba el cache.'],
    [false, 'Listo, cerré y entré de nuevo. Sigue igual.'],
    [true, 'Gracias por probar. Entonces es de nuestro lado, lo confirmamos.'],
    [false, 'Ok. ¿Tienen idea de qué puede ser?'],
    [true, 'El conector de datos de septiembre se quedó a medias en la sync.'],
    [false, 'Ah, entiendo. ¿Se arregla regenerando el reporte?'],
    [true, 'Exacto, lo estamos regenerando ahora mismo.'],
    [false, 'Genial. ¿Cuánto suele tardar?'],
    [true, 'Unos 15 minutos. Te aviso por acá apenas esté.'],
    [false, 'Perfecto, quedo atento.'],
    [true, 'Listo, ya terminó de regenerarse. ¿Podés refrescar?'],
    [false, 'Refresqué y ahora sí carga. ¡Genial!'],
    [true, '¡Buenísimo! ¿Los números te cierran con lo que esperabas?'],
    [false, 'Sí, septiembre cerró mejor que agosto. Todo bien.'],
    [true, 'Nos alegra. Dejamos una alerta para que no se repita en la sync.'],
    [false, 'Mil gracias por la rapidez, me salvaron la reunión.'],
    [true, 'Para eso estamos. Cualquier cosa, escribinos por acá.'],
    [false, 'Una última: ¿puedo exportar el reporte a PDF?'],
    [true, 'Sí, con el botón "Exportar" arriba a la derecha del panel.'],
    [false, 'Lo encontré. Perfecto, gracias de nuevo.'],
    [true, '¡Un placer! Que salga todo bien mañana.'],
  ]
  const n = lines.length
  return lines.map(([admin, text], idx) => ({
    fromAdmin: admin,
    text,
    minutesAgo: (n - idx) * 75, // el más viejo arriba; el último ~75min atrás
    read: true,
  }))
}

// Hilos cortos/medios para las demás orgs. Algunos cierran con mensajes del
// cliente sin leer (read:false) para encender los badges de no-leído del inbox.
function shortThread(variant: number): Turn[] {
  const variants: Turn[][] = [
    [
      { fromAdmin: false, text: 'Buenas, ¿pueden activarme el módulo de reseñas?', minutesAgo: 60 * 26, read: true },
      { fromAdmin: true, text: '¡Hola! Sí, lo dejamos activo. Ya lo deberías ver en tu panel.', minutesAgo: 60 * 25, read: true },
      { fromAdmin: false, text: 'Confirmado, lo veo. ¡Gracias!', minutesAgo: 60 * 24, read: true },
    ],
    [
      { fromAdmin: false, text: 'Hola, ¿el plan incluye campañas de email?', minutesAgo: 60 * 5, read: true },
      { fromAdmin: true, text: 'Hola, sí: el plan actual incluye hasta 2 campañas por mes.', minutesAgo: 60 * 4, read: true },
      { fromAdmin: false, text: '¿Y si quiero sumar una tercera?', minutesAgo: 30, read: false },
      { fromAdmin: false, text: 'Quedo a la espera, ¡gracias!', minutesAgo: 24, read: false },
    ],
    [
      { fromAdmin: true, text: 'Hola, dejamos lista la integración con WhatsApp. ¡Probala cuando quieras!', minutesAgo: 60 * 9, read: true },
    ],
    [
      { fromAdmin: false, text: 'Hola, necesito cambiar el correo de facturación. ¿Cómo hago?', minutesAgo: 12, read: false },
    ],
    [
      { fromAdmin: false, text: '¡Quedó genial el nuevo sitio! Mil gracias al equipo.', minutesAgo: 60 * 48, read: true },
      { fromAdmin: true, text: '¡Gracias a vos por la confianza! Cualquier ajuste, acá estamos.', minutesAgo: 60 * 47, read: true },
    ],
  ]
  return variants[variant % variants.length]
}

function buildThread(orgIndex: number): Turn[] {
  if (orgIndex === 0) return longThread()
  return shortThread(orgIndex - 1)
}

async function main(): Promise<void> {
  preflight()

  const orgs = await prisma.organization.findMany({
    select: { id: true, companyName: true },
    orderBy: { createdAt: 'asc' },
    take: MAX_ORGS,
  })

  if (orgs.length === 0) {
    console.error('ABORT: no hay organizations en la base.')
    console.error('       El seed usa orgs EXISTENTES (no las crea). Sembrá orgs primero.')
    process.exit(1)
  }

  // Idempotencia: borrar lo sembrado antes y recrear.
  const purged = await prisma.message.deleteMany({ where: { content: { contains: SEED_MARKER } } })
  console.log(`↺ Limpieza previa: ${purged.count} mensajes demo borrados (idempotencia).`)

  const now = Date.now()
  const rows = orgs.flatMap((org, i) =>
    buildThread(i).map((t) => ({
      organizationId: org.id,
      content: t.text + SEED_MARKER,
      fromAdmin: t.fromAdmin,
      read: t.read ?? true,
      createdAt: new Date(now - t.minutesAgo * 60_000),
    })),
  )

  const created = await prisma.message.createMany({ data: rows })

  console.log(`✓ ${created.count} mensajes demo creados en ${orgs.length} conversaciones.`)
  console.log(`  Orgs pobladas: ${orgs.map((o) => o.companyName).join(', ')}`)
  console.log('')
  console.log('  Revertir todo:')
  console.log('    npx ts-node --transpile-only scripts/cleanup-messages-demo.ts --confirm')
}

main()
  .catch((e) => {
    console.error('❌ Seed mensajes demo falló:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
