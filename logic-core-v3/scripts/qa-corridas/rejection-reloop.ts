/**
 * Corrida QA manual — re-loop de rechazo del setter (Bloque E.2, tensión
 * progreso-preservado vs claridad). Es un GUION DE NAVEGACIÓN + CAPTURAS
 * reales, NO una suite de test (no hace `expect`): simula al setter no-técnico
 * mandando una demo a revisión, siendo rechazado por Franco, y retrabajando.
 *
 * Corre contra prod-QA ya levantado (`npm run start:qa`, :3001). Mintea la
 * sesión igual que `tests/helpers/setter-auth.ts` (JWT client-side con
 * AUTH_SECRET), sin pasar por /api/qa/login. Mueve el lead REAL "QA-W
 * Construccion" (seed V-1, scripts/v1-qa-wizard-states.ts) por el camino
 * envío → rechazo → retrabajo → reenvío.
 *
 * Al final, re-correr `npx tsx scripts/v1-qa-wizard-states.ts` reconcilia el
 * fixture a su estado canónico (stage/selfCheck/draftUrl/rechazos) — el seed
 * NO toca `progresoJson`, así que el checklist queda en 6/6 (residuo inocuo:
 * es un auto-reporte, no un gate).
 *
 * Uso: npx tsx scripts/qa-corridas/rejection-reloop.ts
 */
import path from 'path'
import fs from 'fs'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = 'http://127.0.0.1:3001'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const SESSION_MAX_AGE = 8 * 60 * 60
// corrida-1 quedó ocupada por otra sesión corriendo el recorrido feliz en
// paralelo (docs/proof-screenshots/corrida-1) — esta corrida (rechazo/re-loop)
// vive en su propia carpeta para no mezclar screenshots de dos corridas.
const OUT_DIR = path.join(__dirname, '../../docs/proof-screenshots/corrida-2')

fs.mkdirSync(OUT_DIR, { recursive: true })

let shotIndex = 0
async function shot(page: Page, name: string): Promise<void> {
  shotIndex += 1
  const file = path.join(OUT_DIR, `${String(shotIndex).padStart(2, '0')}-${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`    screenshot -> ${path.basename(file)}`)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function main() {
  const res = await fetch(BASE_URL).catch(() => null)
  if (!res) {
    throw new Error(`No hay server en ${BASE_URL} — corré "npm run start:qa" primero.`)
  }

  const { prisma } = await import('../../src/lib/prisma')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, role: true },
  })
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@develop.com' },
    select: { id: true, role: true },
  })
  if (!setter || !admin) {
    throw new Error('Personas QA no seedeadas — correr "npx tsx prisma/seed.ts" antes.')
  }

  const lead = await prisma.osLead.findFirst({
    where: { businessName: 'QA-W Construccion' },
    select: { id: true, businessName: true },
  })
  if (!lead) {
    throw new Error('"QA-W Construccion" no existe — correr "npx tsx scripts/v1-qa-wizard-states.ts" antes.')
  }
  const leadId = lead.id
  console.log(`Lead bajo prueba: ${lead.businessName} (${leadId})`)

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET ausente en .env.local')

  const browser = await chromium.launch({
    args: ['--no-proxy-server', '--proxy-bypass-list=*'],
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  async function loginAs(userId: string, email: string, role: string): Promise<void> {
    const token = await encode({
      secret: secret as string,
      salt: SESSION_COOKIE,
      maxAge: SESSION_MAX_AGE,
      token: {
        sub: userId,
        email,
        name: email,
        picture: null,
        role,
        provider: 'qa-bypass',
        onboardingCompleted: role === 'SUPER_ADMIN',
        passwordResetRequired: false,
      },
    })
    await context.clearCookies()
    await context.addCookies([
      {
        name: SESSION_COOKIE,
        value: token,
        domain: '127.0.0.1',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      },
    ])
  }

  try {
    // ── 1. Setter entra, ve el lead como quedó del seed (draft + self-check
    //      6/6, checklist en 0/6) ────────────────────────────────────────────
    console.log('\n[1] Setter — home antes de tocar nada')
    await loginAs(setter.id, 'setter-qa@develop.test', 'SETTER')
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
    await shot(page, 'home-antes')

    console.log('[2] Setter — abre el lead (Construcción)')
    await page.goto(`${BASE_URL}/setter/leads/${leadId}`, { waitUntil: 'networkidle' })
    await shot(page, 'lead-construccion-inicial')

    // ── 2. Tilda las 6 fases del checklist, una por vez ────────────────────
    console.log('[3] Setter — tilda el checklist fase por fase')
    const fases = [
      'Estructura',
      'Personalización con datos del negocio',
      'Assets reales',
      'CTA de WhatsApp',
      'Calidad y motion',
      'Mobile',
    ]
    for (const [i, titulo] of fases.entries()) {
      const fila = page.getByRole('button', { name: new RegExp(`Marcar.*${escapeRegex(titulo)}`, 'i') })
      await fila.click()
      await page.waitForTimeout(500)
      if (i === 0) await shot(page, `checklist-fase-1-tildada`)
    }
    await shot(page, 'checklist-completo-6-6')

    // ── 3. Self-check ya viene 6/6 del seed → confirma envío habilitado ────
    console.log('[4] Setter — self-check ya en verde, envía a revisión')
    await page.getByRole('heading', { name: 'Self-check' }).first().scrollIntoViewIfNeeded()
    await shot(page, 'selfcheck-listo-envio-habilitado')
    await page.getByRole('button', { name: 'Enviar a revisión' }).click()
    await page.waitForTimeout(1500)
    await shot(page, 'enviado-a-revision')

    // ── 4. Franco entra, ve la cola, rechaza con nota concreta ─────────────
    console.log('[5] Franco (admin) — dossier en revisión')
    await loginAs(admin.id, 'admin@develop.com', 'SUPER_ADMIN')
    await page.goto(`${BASE_URL}/admin/leados`, { waitUntil: 'networkidle' })
    await shot(page, 'admin-cola-revision')

    await page.goto(`${BASE_URL}/admin/leados/${leadId}`, { waitUntil: 'networkidle' })
    await shot(page, 'admin-dossier-antes-veredicto')

    console.log('[6] Franco — abre el modal de rechazo y lo completa')
    await page.getByRole('button', { name: 'Rechazar' }).click()
    await shot(page, 'admin-modal-rechazo-vacio')

    await page.getByLabel('Qué está mal (corto)').fill('La prueba social no es real')
    await page.getByLabel('Dónde (sección / elemento)').fill('Sección "Reseñas"')
    await page
      .getByLabel('Arreglo concreto (qué hacer)')
      .fill(
        'Reemplazá los textos genéricos por las reseñas reales del negocio (están en la ficha, Paso 1) y volvé a publicar el draft en Netlify.',
      )
    await shot(page, 'admin-modal-rechazo-lleno')

    await page.getByRole('button', { name: 'Confirmar rechazo' }).click()
    await page.waitForTimeout(1500)
    await shot(page, 'admin-post-rechazo')

    // ── 5. Setter vuelve: home + detalle del lead rechazado ────────────────
    console.log('[7] Setter — vuelve, mira el home')
    await loginAs(setter.id, 'setter-qa@develop.test', 'SETTER')
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
    await shot(page, 'home-post-rechazo')

    console.log('[8] Setter — abre el lead, ve el aviso de Franco')
    await page.goto(`${BASE_URL}/setter/leads/${leadId}`, { waitUntil: 'networkidle' })
    await shot(page, 'lead-post-rechazo-banner-arriba')

    console.log('[9] Setter — mira la Construcción (sin checklist, botón reabrir)')
    await page.getByRole('heading', { name: 'Paso 4 — Construcción de la demo' }).scrollIntoViewIfNeeded()
    await shot(page, 'construccion-rechazada-card')

    console.log('[10] Setter — reabre construcción')
    await page.getByRole('button', { name: 'Reabrir construcción' }).click()
    await page.waitForTimeout(1200)
    await shot(page, 'construccion-reabierta')

    console.log('[11] Setter — mira el checklist post-reabrir (¿preservado?)')
    await page.getByRole('heading', { name: 'Paso 4 — Construcción de la demo' }).scrollIntoViewIfNeeded()
    await shot(page, 'checklist-post-reabrir')

    // B6.2: el re-loop RECHAZADA→CONSTRUCCION RESETEA el self-check (es un GATE):
    // vuelve VACÍO (los 6 obligatorios en rojo) para forzar la re-verificación
    // antes de reenviar. El checklist de fases (paso anterior) SÍ se preserva.
    console.log('[12] Setter — mira el self-check post-reabrir (ahora viene VACÍO — reset del re-loop)')
    await page.getByRole('heading', { name: 'Self-check' }).first().scrollIntoViewIfNeeded()
    await shot(page, 'selfcheck-post-reabrir-vacio')

    // ── 6. Corrige lo puntual que pidió Franco ─────────────────────────────
    console.log('[13] Setter — re-publica el draft (Paso 5)')
    await page.getByRole('button', { name: 'Cambiar el link del draft' }).click()
    await page.getByPlaceholder('https://algo-unico.netlify.app').fill('https://qa-w-construccion-draft-v2.example.com')
    await page.getByRole('switch', { name: 'Confirmo que abrí el link y carga' }).click()
    await shot(page, 'draft-editando')
    await page.getByRole('button', { name: 'Guardar draft' }).click()
    await page.waitForTimeout(1200)
    await shot(page, 'draft-actualizado')

    // El self-check viene VACÍO tras el re-loop: el setter lo re-verifica punto
    // por punto (el botón "Enviar a revisión" sigue disabled hasta los 6 en verde).
    console.log('[14] Setter — re-verifica el self-check completo (viene vacío tras el re-loop)')
    await page.getByRole('heading', { name: 'Self-check' }).first().scrollIntoViewIfNeeded()
    const hardChecks = [
      'La demo carga',
      'Se ve bien en tu celular',
      'No hay lorem ipsum ni textos de relleno',
      'Los links y el botón de WhatsApp funcionan',
      'Usa los datos y assets reales del negocio',
      'La demo dice lo que el brief pedía',
    ]
    for (const nombre of hardChecks) {
      await page.getByRole('switch', { name: nombre }).click()
      await page.waitForTimeout(150)
    }
    await shot(page, 'selfcheck-re-verificado-6-6')

    console.log('[15] Setter — reenvía a revisión')
    await page.getByRole('button', { name: 'Enviar a revisión' }).click()
    await page.waitForTimeout(1500)
    await shot(page, 'reenviado-a-revision')
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }

  console.log(`\nListo — ${shotIndex} screenshots en ${OUT_DIR}`)
  console.log(
    'Cleanup sugerido: npx tsx scripts/v1-qa-wizard-states.ts (reconcilia "QA-W Construccion" — stage/selfCheck/draftUrl/rechazos vuelven al canónico del seed; progresoJson NO lo toca el seed, queda 6/6).',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
