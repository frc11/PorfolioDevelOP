/**
 * P5.3 — Invariante del feed de novedades del panel. Corre SIN DB ni server:
 *
 *   npm run check:invariant:announcements
 *   (o: npx tsx src/lib/announcements/announcements.invariant.ts)
 *
 * Verifica, de forma ejecutable, las garantías del sprint:
 *   1. BROADCAST: una novedad ALL la ven todas las orgs.
 *   2. SEGMENTADO / ANTI-IDOR: una novedad ORG la ve SOLO su org; jamás otra.
 *   3. CADUCIDAD: una novedad vencida no se muestra (no se vuelve ruido).
 *   4. LEÍDO/NO LEÍDO: el conteo de no leídas responde al flag por item.
 *
 * Importa solo el módulo puro de visibilidad. Cero Neon, cero request context.
 */
import assert from 'node:assert/strict'
import {
  countUnread,
  isAnnouncementVisibleTo,
  selectVisibleAnnouncements,
  type AnnouncementVisibility,
} from './visibility.ts'

const now = new Date('2026-07-01T12:00:00Z')
const orgA = 'org_AAA'
const orgB = 'org_BBB'

const ann = (over: Partial<AnnouncementVisibility & { publishedAt: Date }> = {}) => ({
  audience: 'ALL' as AnnouncementVisibility['audience'],
  organizationId: null as string | null,
  expiresAt: null as Date | null,
  publishedAt: now,
  ...over,
})

// ── 1. BROADCAST: ALL visible para cualquier org ─────────────────────────────
{
  const broadcast = ann({ audience: 'ALL' })
  assert.equal(isAnnouncementVisibleTo(broadcast, { organizationId: orgA, now }), true, 'ALL visible para orgA')
  assert.equal(isAnnouncementVisibleTo(broadcast, { organizationId: orgB, now }), true, 'ALL visible para orgB')
}

// ── 2. SEGMENTADO / ANTI-IDOR: ORG solo para su org ──────────────────────────
{
  const forA = ann({ audience: 'ORG', organizationId: orgA })
  assert.equal(isAnnouncementVisibleTo(forA, { organizationId: orgA, now }), true, 'ORG de A visible para A')
  assert.equal(
    isAnnouncementVisibleTo(forA, { organizationId: orgB, now }),
    false,
    '🔴 ORG de A NO visible para B (anti-IDOR)',
  )
  // Una novedad ORG sin organizationId (dato inválido) no se filtra a nadie por error.
  const orphan = ann({ audience: 'ORG', organizationId: null })
  assert.equal(isAnnouncementVisibleTo(orphan, { organizationId: orgA, now }), false, 'ORG sin org destinataria → no visible')
}

// ── 3. CADUCIDAD: vencida no se muestra; futura y null sí ─────────────────────
{
  const expired = ann({ audience: 'ALL', expiresAt: new Date(now.getTime() - 1000) })
  const expiringNow = ann({ audience: 'ALL', expiresAt: now })
  const future = ann({ audience: 'ALL', expiresAt: new Date(now.getTime() + 1000) })
  const never = ann({ audience: 'ALL', expiresAt: null })

  assert.equal(isAnnouncementVisibleTo(expired, { organizationId: orgA, now }), false, 'vencida → no visible')
  assert.equal(isAnnouncementVisibleTo(expiringNow, { organizationId: orgA, now }), false, 'caduca exactamente ahora → no visible')
  assert.equal(isAnnouncementVisibleTo(future, { organizationId: orgA, now }), true, 'caducidad futura → visible')
  assert.equal(isAnnouncementVisibleTo(never, { organizationId: orgA, now }), true, 'sin caducidad → visible')

  // La caducidad gana sobre el alcance: una ORG-de-A vencida tampoco se ve en A.
  const expiredForA = ann({ audience: 'ORG', organizationId: orgA, expiresAt: new Date(now.getTime() - 1) })
  assert.equal(isAnnouncementVisibleTo(expiredForA, { organizationId: orgA, now }), false, 'ORG de A vencida → no visible ni para A')
}

// ── 4. selectVisibleAnnouncements: filtra + ordena, sin fugar ORG ajena ───────
{
  const list = [
    ann({ audience: 'ORG', organizationId: orgB, publishedAt: new Date('2026-06-30T10:00:00Z') }), // de B
    ann({ audience: 'ALL', publishedAt: new Date('2026-06-28T10:00:00Z') }),
    ann({ audience: 'ORG', organizationId: orgA, publishedAt: new Date('2026-06-29T10:00:00Z') }), // de A
    ann({ audience: 'ALL', expiresAt: new Date(now.getTime() - 1), publishedAt: new Date('2026-06-27T10:00:00Z') }), // vencida
  ]
  const visibleForA = selectVisibleAnnouncements(list, { organizationId: orgA, now })

  // A ve: ALL (28) + ORG-A (29). NO ve ORG-B ni la vencida.
  assert.equal(visibleForA.length, 2, 'A ve exactamente 2 (ALL vigente + su ORG)')
  assert.ok(!visibleForA.some((a) => a.organizationId === orgB), '🔴 la ORG de B nunca aparece en el feed de A')
  // Orden por publicación desc: ORG-A (29) antes que ALL (28).
  assert.deepEqual(
    visibleForA.map((a) => a.publishedAt.toISOString()),
    ['2026-06-29T10:00:00.000Z', '2026-06-28T10:00:00.000Z'],
    'ordenadas por publishedAt desc',
  )
  // Determinismo.
  assert.deepEqual(selectVisibleAnnouncements(list, { organizationId: orgA, now }), visibleForA, 'selectVisibleAnnouncements determinista')
}

// ── 5. LEÍDO / NO LEÍDO ───────────────────────────────────────────────────────
{
  assert.equal(countUnread([]), 0, 'sin items → 0 no leídas')
  assert.equal(
    countUnread([{ read: false }, { read: true }, { read: false }]),
    2,
    '2 sin leer de 3',
  )
  assert.equal(countUnread([{ read: true }, { read: true }]), 0, 'todo leído → badge en 0')
}

console.log(
  '✓ announcements invariants OK: broadcast ALL para todas, ORG solo su org (anti-IDOR), ' +
    'caducidad respetada, y conteo de no leídas correcto.',
)
