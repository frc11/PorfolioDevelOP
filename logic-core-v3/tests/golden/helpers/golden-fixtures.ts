import { type BrowserContext, expect } from '@playwright/test'
import { PrismaClient, type Role } from '@prisma/client'
import { encode } from 'next-auth/jwt'
import { SignJWT } from 'jose'

/**
 * GS.1 — Fixtures + auth de la Golden Suite de aislamiento.
 *
 * NO toca lógica de producción. Dos responsabilidades:
 *   1. Sembrar/limpiar tenants aislados (org + usuario ORG_MEMBER + botConfig +
 *      lead + conversación + ticket) marcados con un TAG único, borrables en
 *      bloque. El seed pasa por Prisma directo (SETUP) — la ASERCIÓN de
 *      aislamiento siempre pasa por la CAPA DE LA APP (HTTP/UI o la query
 *      org-scopeada del producto), nunca por Prisma con permisos de admin.
 *   2. Mintear cookies de sesión (persona real o tenant sembrado) e
 *      impersonation, con el MISMO secreto/cookie que el server prod-QA lee.
 *
 * Cookie de sesión: minteada client-side (no POST /api/qa/login) por la misma
 * razón que `tests/helpers/setter-auth.ts`: contra `next start` (NODE_ENV=
 * production) el server nombra la cookie `__Secure-authjs.session-token`
 * SIEMPRE; acá minteamos ese mismo JWT (AUTH_SECRET + salt = nombre de cookie).
 * Chromium trata http://127.0.0.1 como contexto seguro → acepta cookies Secure.
 *
 * Cookie de impersonation: se firma con el MISMO SignJWT/HS256 y la misma
 * cadena de secreto que `src/lib/impersonation.ts` (`getSecret`), para que el
 * `getImpersonationSession` del server la verifique (o la rechace si se
 * manipula). El nombre de cookie (`impersonation-token`) matchea
 * `src/lib/impersonation-constants.ts`.
 */

export const prisma = new PrismaClient()

// El server nombra la cookie de sesión por NODE_ENV (auth-cookies.ts):
//   prod (`next start`)  → `__Secure-authjs.session-token`
//   dev  (`next dev`)    → `authjs.session-token`
// Minteamos AMBOS nombres con el mismo JWT: el server lee solo el que le
// corresponde por modo, así la MISMA suite corre contra prod-QA (canónico) y
// contra un `next dev` (útil para el protocolo anti-falso-verde, que necesita
// que el cambio de guard en el fuente se refleje sin re-buildear). Chromium
// trata http://127.0.0.1 como contexto seguro → envía cookies Secure sobre http.
const SESSION_COOKIE_PROD = '__Secure-authjs.session-token'
const SESSION_COOKIE_DEV = 'authjs.session-token'
const IMPERSONATION_COOKIE = 'impersonation-token'
const SESSION_MAX_AGE = 8 * 60 * 60

// TAG único de la suite: todo lo sembrado lo lleva, el teardown borra por él.
export const TAG = 'GS1-ISO'

function requireSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET ausente — el config de playwright carga .env.local; revisá la var')
  }
  return secret
}

// Misma cadena de fallback que src/lib/impersonation.ts:getSecret(), para firmar
// una cookie que el server verifique con idéntico secreto.
function impersonationSecret(): Uint8Array {
  const secret =
    process.env.IMPERSONATION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    'develOP-dev-impersonation-secret'
  return new TextEncoder().encode(secret)
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth — minteo de cookies
// ─────────────────────────────────────────────────────────────────────────────

/** Mintea la cookie de sesión NextAuth para un usuario (persona o tenant sembrado). */
export async function mintSession(
  context: BrowserContext,
  baseURL: string,
  opts: { userId: string; email: string; role: Role | string },
): Promise<void> {
  const secret = requireSecret()
  const hostname = new URL(baseURL).hostname
  const token = {
    sub: opts.userId,
    email: opts.email,
    name: opts.email,
    picture: null,
    role: opts.role,
    // el JWT callback re-deriva role/org desde la DB en cada request (auth.ts
    // :207, !user) — alcanza con un `sub` válido; el resto es defensivo.
    provider: 'qa-bypass',
    onboardingCompleted: opts.role === 'SUPER_ADMIN',
    passwordResetRequired: false,
  }
  // El JWT se salt-ea con el NOMBRE de la cookie → hay que encodear una vez por
  // nombre. El server prod/dev lee solo el que le corresponde.
  for (const name of [SESSION_COOKIE_PROD, SESSION_COOKIE_DEV]) {
    const value = await encode({ secret, salt: name, maxAge: SESSION_MAX_AGE, token })
    await context.addCookies([
      { name, value, domain: hostname, path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
    ])
  }
}

/**
 * Mintea la cookie de impersonation firmada con el secreto del server.
 * `tamper: true` corrompe la firma (último char) → el server debe RECHAZARLA
 * (getImpersonationSession null) y no otorgar scope de la org impersonada.
 */
export async function mintImpersonation(
  context: BrowserContext,
  baseURL: string,
  opts: { adminId: string; orgId: string; expiresAtMs?: number; tamper?: boolean },
): Promise<void> {
  const expiresAt = opts.expiresAtMs ?? Date.now() + 30 * 60 * 1000
  let token = await new SignJWT({ adminId: opts.adminId, orgId: opts.orgId, expiresAt })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(impersonationSecret())

  if (opts.tamper) {
    // Corromper la firma (el 3er segmento del JWT) sin tocar el header/payload
    // → jwtVerify tira → getImpersonationSession devuelve null.
    const last = token[token.length - 1]
    token = token.slice(0, -1) + (last === 'A' ? 'B' : 'A')
  }

  const hostname = new URL(baseURL).hostname
  await context.addCookies([
    { name: IMPERSONATION_COOKIE, value: token, domain: hostname, path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])
}

export async function clearImpersonation(context: BrowserContext, baseURL: string): Promise<void> {
  const hostname = new URL(baseURL).hostname
  // Sobrescribir con una cookie vencida elimina el token del jar.
  await context.addCookies([
    { name: IMPERSONATION_COOKIE, value: '', domain: hostname, path: '/', httpOnly: true, secure: true, sameSite: 'Lax', expires: 1 },
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// Personas reales (seedeadas): resolver su userId/org desde la DB
// ─────────────────────────────────────────────────────────────────────────────

export interface Persona {
  userId: string
  email: string
  role: Role
  organizationId: string | null
}

export async function resolvePersona(email: string): Promise<Persona> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, orgMemberships: { select: { organizationId: true }, take: 1 } },
  })
  expect(user, `persona ${email} seedeada en la DB (correr prisma/seed.ts si falta)`).toBeTruthy()
  return {
    userId: user!.id,
    email: user!.email,
    role: user!.role,
    organizationId: user!.orgMemberships[0]?.organizationId ?? null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tenants sembrados (aislados, borrables por TAG)
// ─────────────────────────────────────────────────────────────────────────────

export interface SeededTenant {
  label: string
  organizationId: string
  userId: string
  userEmail: string
  botConfigId: string
  botSlug: string
  leadId: string
  leadTag: string
  conversationId: string
  ticketId: string
  ticketTitle: string
}

/**
 * Crea un tenant completo y aislado: Organization + User(ORG_MEMBER) + BotConfig
 * + ChatbotLead + Conversation(+ChatMessage) + Ticket(+TicketMessage). Todo con
 * strings que contienen el TAG para el teardown en bloque.
 */
export async function createTenant(label: string): Promise<SeededTenant> {
  const slug = `${TAG}-${label}`.toLowerCase()
  const leadTag = `${TAG}-LEAD-${label}`
  const ticketTitle = `${TAG}-TICKET-${label}`
  const email = `${TAG}-${label}@golden.test`.toLowerCase()

  const org = await prisma.organization.create({
    data: { companyName: `${TAG} Org ${label}`, slug, onboardingCompleted: true },
    select: { id: true },
  })

  const user = await prisma.user.create({
    data: { email, name: `${TAG} User ${label}`, role: 'ORG_MEMBER' },
    select: { id: true },
  })

  await prisma.orgMember.create({
    data: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
  })

  const bot = await prisma.botConfig.create({
    data: {
      organizationId: org.id,
      slug,
      botName: `${TAG} Bot ${label}`,
      welcomeMessage: `Hola, soy el bot de ${label}.`,
    },
    select: { id: true },
  })

  const conversation = await prisma.conversation.create({
    data: { botConfigId: bot.id, sessionId: `${slug}-session` },
    select: { id: true },
  })

  await prisma.chatMessage.create({
    data: { conversationId: conversation.id, role: 'USER', content: `${leadTag} mensaje privado de ${label}` },
  })

  const lead = await prisma.chatbotLead.create({
    data: {
      botConfigId: bot.id,
      conversationId: conversation.id,
      name: leadTag,
      email: `${leadTag}@golden.test`.toLowerCase(),
      message: `Interés privado de ${label}`,
      // Clasificación no-DQ: los listados del dashboard/export excluyen `dq`
      // (excludeDqWhere → NOT classification='dq'). Un lead sin clasificación
      // también quedaría afuera, así que se fija una visible para que el
      // aislamiento se pruebe sobre un lead que SÍ aparece en la vista.
      classification: 'warm',
      score: 60,
    },
    select: { id: true },
  })

  const ticket = await prisma.ticket.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      title: ticketTitle,
      messages: { create: { content: `${ticketTitle} cuerpo`, userId: user.id, isAdmin: false } },
    },
    select: { id: true },
  })

  return {
    label,
    organizationId: org.id,
    userId: user.id,
    userEmail: email,
    botConfigId: bot.id,
    botSlug: slug,
    leadId: lead.id,
    leadTag,
    conversationId: conversation.id,
    ticketId: ticket.id,
    ticketTitle,
  }
}

/**
 * Borra TODO lo que lleve el TAG (idempotente — sirve de pre-clean y de
 * teardown). Orden FK-safe: primero las filas que referencian a las orgs/bots
 * por relación no-cascade explícita, luego las orgs (cascada al resto) y los
 * usuarios sembrados. También limpia PageViews taggeados (el test de `track`
 * los crea bajo una org de persona real, fuera del cascade de las orgs propias).
 */
export async function teardownTag(): Promise<void> {
  // PageViews del test de track (url taggeada) — pueden colgar de una org de
  // persona real, así que se borran por su cuenta.
  await prisma.pageView.deleteMany({ where: { url: { contains: TAG } } }).catch(() => undefined)

  // Borrar las orgs sembradas cascadea botConfig → conversations → chatMessages,
  // chatbotLeads, tickets → ticketMessages, orgMembers, pageViews propias.
  await prisma.organization.deleteMany({ where: { slug: { contains: TAG.toLowerCase() } } }).catch(() => undefined)

  // Los usuarios sembrados no cuelgan de la org (relación vía OrgMember, ya
  // cascadeada) → borrarlos aparte por su email taggeado.
  await prisma.user.deleteMany({ where: { email: { contains: TAG.toLowerCase() } } }).catch(() => undefined)
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}
