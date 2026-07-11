import { test, expect, type Page } from '@playwright/test'
import {
  prisma,
  TAG,
  createTenant,
  resolvePersona,
  mintSession,
  mintImpersonation,
  clearImpersonation,
  teardownTag,
  disconnect,
  type SeededTenant,
  type Persona,
} from './helpers/golden-fixtures'

/**
 * GS.1 · Aislamiento multi-tenant por HTTP/UI — la red permanente.
 *
 * Ataques cross-tenant desde una sesión real (cookie minteada) contra la CAPA
 * DE LA APP: API routes, server component pages e impersonation. Cada aserción
 * mide 404/403/redirect/[] — NUNCA datos del vecino.
 *
 * Dos tenants sembrados y aislados (ONE, TWO) + la persona SUPER_ADMIN real
 * (admin@develop.com) para impersonation. El seed es Prisma directo (SETUP); el
 * ataque pasa siempre por la app.
 *
 * Las API routes se golpean con `fetch` DESDE el documento (page.evaluate), no
 * con `page.request`: el APIRequestContext de Playwright no envía cookies
 * `Secure` sobre http, pero Chromium sí las manda a http://127.0.0.1 (contexto
 * seguro). Por eso primero se navega al origen (`ensureOrigin`) y luego se
 * fetchea — así la sesión viaja igual que en un browser real.
 */

const BASE = process.env.GOLDEN_BASE_URL ?? `http://127.0.0.1:${process.env.GOLDEN_PORT ?? 3007}`

let one: SeededTenant
let two: SeededTenant
let admin: Persona

test.beforeAll(async () => {
  await teardownTag()
  one = await createTenant('one')
  two = await createTenant('two')
  admin = await resolvePersona('admin@develop.com')
})

test.afterAll(async () => {
  await teardownTag()
  await disconnect()
})

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies()
})

// Deja la página en el origen de la app para que un `fetch` relativo mande las
// cookies de sesión (Secure sobre localhost). `/api/version` es público y liviano.
async function ensureOrigin(page: Page): Promise<void> {
  await page.goto('/api/version', { waitUntil: 'domcontentloaded' })
}

async function apiGet(page: Page, path: string): Promise<{ status: number; body: string }> {
  return page.evaluate(async (p) => {
    const r = await fetch(p, { headers: { accept: '*/*' } })
    return { status: r.status, body: await r.text() }
  }, path)
}

async function apiPostJson(
  page: Page,
  path: string,
  body: unknown,
): Promise<{ status: number; body: string }> {
  return page.evaluate(
    async (args) => {
      const r = await fetch(args.p, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(args.b),
      })
      return { status: r.status, body: await r.text() }
    },
    { p: path, b: body },
  )
}

/**
 * Pide la page del ticket con `redirect: 'manual'` y devuelve el resultado
 * OBSERVABLE a nivel HTTP, sin seguir redirects ni renderizar páginas pesadas:
 *   - `redirected: true`  → el server respondió un 3xx duro (redirect del
 *     middleware, p.ej. admin sin impersonation → /admin). El ticket NO se sirvió.
 *   - `redirected: false` → 200. Ojo: la page es `force-dynamic` y flushea el 200
 *     antes de `redirect()` (streaming), así que un ticket ajeno/inexistente TAMBIÉN
 *     da 200 — el aislamiento se afirma por CONTENIDO: `body` no contiene el título.
 *     Un ticket propio SÍ trae su título en el HTML SSR.
 * Determinístico (lee el body completo) y sin carreras con el redirect client-side.
 */
async function fetchTicket(
  page: Page,
  ticketId: string,
): Promise<{ redirected: boolean; status: number; body: string }> {
  return page.evaluate(async (id) => {
    const r = await fetch(`/dashboard/soporte/${id}`, {
      redirect: 'manual',
      headers: { accept: 'text/html' },
    })
    const redirected = r.type === 'opaqueredirect' || (r.status >= 300 && r.status < 400)
    return { redirected, status: r.status, body: redirected ? '' : await r.text() }
  }, ticketId)
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA CRUZADA
// ─────────────────────────────────────────────────────────────────────────────

test('@isolation read · /api/reports/monthly con organizationId ajeno → 403', async ({ page, baseURL }) => {
  await mintSession(page.context(), baseURL ?? BASE, { userId: one.userId, email: one.userEmail, role: 'ORG_MEMBER' })
  await ensureOrigin(page)

  const cross = await apiGet(page, `/api/reports/monthly?organizationId=${two.organizationId}`)
  expect(cross.status, 'org ajena en el parámetro → 403 (nunca el PDF de otra org)').toBe(403)

  // Control: la MISMA ruta con la org propia NO da 403 — el 403 es específico
  // del cruce, no una negación general (si no, el test pasaría por la razón
  // equivocada y el sabotaje no lo movería).
  const own = await apiGet(page, `/api/reports/monthly?organizationId=${one.organizationId}`)
  expect(own.status, 'la org propia pasa el guard de scope (no 403)').not.toBe(403)
  expect(own.status, 'la org propia tampoco cae en 401').not.toBe(401)
})

test('@isolation read · /api/dashboard/chatbot/leads/export nunca incluye leads de otra org', async ({ page, baseURL }) => {
  // Sin sesión → 401 (no hay export anónimo).
  await ensureOrigin(page)
  const anon = await apiGet(page, '/api/dashboard/chatbot/leads/export')
  expect(anon.status, 'export exige sesión').toBe(401)

  await mintSession(page.context(), baseURL ?? BASE, { userId: one.userId, email: one.userEmail, role: 'ORG_MEMBER' })
  await ensureOrigin(page)
  const res = await apiGet(page, '/api/dashboard/chatbot/leads/export')
  expect(res.status, 'la org con bot exporta su CSV').toBe(200)
  expect(res.body, 'el CSV incluye el lead propio').toContain(one.leadTag)
  expect(res.body, 'el CSV JAMÁS incluye el lead del vecino').not.toContain(two.leadTag)
})

test('@isolation read · ticket page: abrir un ticket de otra org NO renderiza sus datos', async ({ page, baseURL }) => {
  await mintSession(page.context(), baseURL ?? BASE, { userId: one.userId, email: one.userEmail, role: 'ORG_MEMBER' })
  await ensureOrigin(page)

  // Positivo: la org abre SU ticket → 200 con su título en el HTML SSR.
  const own = await fetchTicket(page, one.ticketId)
  expect(own.status, 'la org accede a SU ticket').toBe(200)
  expect(own.body, 'y ve su título').toContain(one.ticketTitle)

  // Cruzado: el ticket de TWO NO se abre — el título ajeno JAMÁS se renderiza
  // (la page redirige a la lista antes de renderizar el ticket).
  const cross = await fetchTicket(page, two.ticketId)
  expect(cross.body, 'el ticket ajeno NUNCA se renderiza').not.toContain(two.ticketTitle)
})

// ─────────────────────────────────────────────────────────────────────────────
// ENUMERACIÓN — un id ajeno es indistinguible de uno inexistente
// ─────────────────────────────────────────────────────────────────────────────

test('@isolation enum · ticket ajeno y ticket inexistente dan EXACTAMENTE el mismo resultado', async ({ page, baseURL }) => {
  await mintSession(page.context(), baseURL ?? BASE, { userId: one.userId, email: one.userEmail, role: 'ORG_MEMBER' })
  await ensureOrigin(page)

  const alien = await fetchTicket(page, two.ticketId) // existe, de otra org
  const ghost = await fetchTicket(page, 'clghostghostghostghost0000') // no existe

  // Misma respuesta observable: mismo status y mismo comportamiento de redirect.
  // El caller NO puede distinguir "existe pero es ajeno" de "no existe": ambos
  // recorren el mismo camino (findUnique con org → null → redirect a la lista).
  expect(alien.status, 'mismo status para ajeno e inexistente').toBe(ghost.status)
  expect(alien.redirected, 'mismo comportamiento de redirect').toBe(ghost.redirected)
  expect(alien.body, 'el ajeno no filtra su contenido').not.toContain(two.ticketTitle)
})

// ─────────────────────────────────────────────────────────────────────────────
// MUTACIÓN CRUZADA
// ─────────────────────────────────────────────────────────────────────────────

test('@isolation write · /api/track ignora el organizationId del body (atribuye a la org de la sesión)', async ({ page, baseURL }) => {
  await mintSession(page.context(), baseURL ?? BASE, { userId: one.userId, email: one.userEmail, role: 'ORG_MEMBER' })
  await ensureOrigin(page)

  const probeUrl = `/golden/${TAG}/track-probe`
  const res = await apiPostJson(page, '/api/track', { url: probeUrl, duration: 5, organizationId: two.organizationId })
  expect(res.status, 'el track se acepta').toBe(200)

  // La atribución quedó en la org de la SESIÓN (ONE), nunca en la del body (TWO).
  const underOne = await prisma.pageView.findFirst({ where: { url: probeUrl, organizationId: one.organizationId } })
  const underTwo = await prisma.pageView.findFirst({ where: { url: probeUrl, organizationId: two.organizationId } })
  expect(underOne, 'la vista se atribuye a la org de la sesión').toBeTruthy()
  expect(underTwo, 'un ORG_MEMBER NO puede escribir métricas en otra org').toBeNull()
})

// ─────────────────────────────────────────────────────────────────────────────
// IMPERSONATION — el scope de la sesión impersonada es la org impersonada, y solo esa
// ─────────────────────────────────────────────────────────────────────────────

test('@isolation impersonation · scopeada a la org impersonada; forjar la cookie no da scope; al salir vuelve', async ({ page, baseURL }) => {
  const url = baseURL ?? BASE

  // (a) SUPER_ADMIN impersonando ONE: ve el ticket de ONE, pero NO el de TWO.
  await mintSession(page.context(), url, { userId: admin.userId, email: admin.email, role: 'SUPER_ADMIN' })
  await mintImpersonation(page.context(), url, { adminId: admin.userId, orgId: one.organizationId })
  await ensureOrigin(page)

  const seesOwn = await fetchTicket(page, one.ticketId)
  expect(seesOwn.status, 'impersonando ONE accede al ticket de ONE').toBe(200)
  expect(seesOwn.body, 'impersonando ONE ve el ticket de ONE').toContain(one.ticketTitle)

  const seesThird = await fetchTicket(page, two.ticketId)
  expect(seesThird.body, 'impersonando ONE NO alcanza a una tercera org (TWO)').not.toContain(two.ticketTitle)

  // (b) Cookie de impersonation FORJADA (firma corrupta) → sin scope:
  //     getImpersonationSession la rechaza → resolveOrgId null → la page del
  //     ticket NO renderiza el ticket de ONE.
  await page.context().clearCookies()
  await mintSession(page.context(), url, { userId: admin.userId, email: admin.email, role: 'SUPER_ADMIN' })
  await mintImpersonation(page.context(), url, { adminId: admin.userId, orgId: one.organizationId, tamper: true })
  await ensureOrigin(page)
  const forged = await fetchTicket(page, one.ticketId)
  expect(forged.body, 'una cookie forjada NO otorga scope de la org').not.toContain(one.ticketTitle)

  // (c) Al SALIR (cookie limpia) el scope vuelve: el admin sin impersonation no
  //     entra al dashboard del cliente — el middleware lo saca con un redirect
  //     duro (307). El ticket de ONE nunca se sirve.
  await clearImpersonation(page.context(), url)
  await ensureOrigin(page)
  const left = await fetchTicket(page, one.ticketId)
  expect(left.redirected, 'sin impersonation el admin es redirigido fuera del ticket').toBe(true)
})
