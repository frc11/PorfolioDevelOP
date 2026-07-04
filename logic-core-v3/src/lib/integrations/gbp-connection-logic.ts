/**
 * P3-A.1 — Núcleo puro del eslabón de conexión Google Business Profile.
 *
 * Cero imports de `@/lib/prisma`, `next/*` o `fetch`: este módulo es el ÚNICO que
 * importa el invariant (`gbp-connection.invariant.ts`, corre con `npx tsx`), igual que
 * `recommendations.invariant.ts` importa `rules.ts` y jamás la capa con DB. Si algún
 * símbolo con prisma/next se filtra acá, tsx revienta en el import.
 *
 * Responsabilidades:
 *   - Tipos/uniones del dominio (estado de conexión, resolución de cardinalidad).
 *   - Funciones puras: resolveConnection, composeLocationResourceName,
 *     deriveConnectionStatus, findLocationInList, extractId, *Patch mappers.
 *   - Engine sobre `deps` inyectadas (runConnectGbp / runListLocations /
 *     runSetActiveLocation): orquestan I/O + persistencia sin conocerlas (las capas
 *     reales se arman en gbp-connection.ts).
 *
 * Puente v1→v4 (crítico): el cliente v4 existente interpola `gbpLocationId` como path
 * COMPLETO — `google-business-profile.ts:154,:297` hacen `/v4/${gbpLocationId}/reviews`,
 * que solo resuelve si el valor es `accounts/{acc}/locations/{loc}`. Por eso
 * composeLocationResourceName arma ese formato y NUNCA se persiste el `locations/{id}`
 * pelado que devuelve la Business Information v1.
 */

// ─── Modelo de descubrimiento (normalizado desde las respuestas v1) ───────────

export interface DiscoveredAccount {
  /** Resource name v1 de Account Management: "accounts/{id}". */
  name: string
}

export interface DiscoveredLocation {
  /** Account padre (carried through): "accounts/{id}". */
  accountName: string
  /** Resource name v1 de Business Information: "locations/{id}" (SIN prefijo de account). */
  locationName: string
  title: string | null
  address: string | null
}

/** Location expuesta al selector de P3-A.2 (client-facing). */
export interface AvailableLocation {
  /** Id pelado del location (para el `value` del selector). */
  locationId: string
  /** Resource name v4 compuesto: "accounts/{acc}/locations/{loc}" (lo que se persiste). */
  resourceName: string
  title: string | null
  address: string | null
}

export interface RatingSnapshot {
  rating: number
  count: number
}

// ─── Estado + resolución ──────────────────────────────────────────────────────

export type ConnectionStatus = 'NOT_CONNECTED' | 'CONNECTED_NO_LOCATION' | 'OPERATIONAL'
export type NoLocationReason = 'none' | 'multiple'

export type Resolution =
  | { status: 'OPERATIONAL'; accountId: string; locationResourceName: string }
  | { status: 'CONNECTED_NO_LOCATION'; reason: NoLocationReason; accountId: string | null }

// ─── Seam de persistencia (store espiable; impl real = prisma.organization.update) ─

export interface GbpConnectionPatch {
  gbpAccountId: string | null
  gbpLocationId: string | null
}

export interface GbpRatingPatch {
  googleRating: number | null
  googleReviewsCount: number
  googleRatingUpdatedAt: Date
}

export interface GbpConnectionStore {
  updateConnection(orgId: string, patch: GbpConnectionPatch): Promise<void>
  updateRating(orgId: string, patch: GbpRatingPatch): Promise<void>
}

// ─── Deps inyectables (los defaults reales se arman en gbp-connection.ts) ──────

export interface ConnectGbpDeps {
  now: () => Date
  getAccessToken: (orgId: string) => Promise<string | null>
  listAccounts: (accessToken: string) => Promise<DiscoveredAccount[]>
  listLocations: (accessToken: string, accountName: string) => Promise<DiscoveredLocation[]>
  fetchRating: (orgId: string) => Promise<RatingSnapshot | null>
  store: GbpConnectionStore
}

// ─── Funciones puras ───────────────────────────────────────────────────────────

/**
 * Extrae el id pelado de un resource name Google:
 *   "accounts/123" → "123", "locations/456" → "456",
 *   "accounts/1/locations/2" → "2". Sin "/", devuelve el valor tal cual.
 */
export function extractId(resourceName: string): string {
  const trimmed = resourceName.trim()
  const idx = trimmed.lastIndexOf('/')
  return idx === -1 ? trimmed : trimmed.slice(idx + 1)
}

/**
 * Compone el resource name v4 COMPLETO que consume el cliente existente:
 * "accounts/{acc}/locations/{loc}". Idempotente: si `locationName` ya viene
 * compuesto ("accounts/…/locations/…") se devuelve igual.
 */
export function composeLocationResourceName(accountName: string, locationName: string): string {
  const loc = locationName.trim()
  if (loc.startsWith('accounts/') && loc.includes('/locations/')) return loc
  return `accounts/${extractId(accountName)}/locations/${extractId(locationName)}`
}

/**
 * Resuelve la cardinalidad (Paso 2). `locations` viene aplanado sobre todas las accounts.
 *   1  → OPERATIONAL (persiste account + location compuesto).
 *   >1 → CONNECTED_NO_LOCATION('multiple') — la elección espera al selector de P3-A.2.
 *   0  → CONNECTED_NO_LOCATION('none').
 * El account se persiste solo cuando es inequívoco (una sola account visible, o todas las
 * locations comparten una); si es ambiguo (multi-account) → null.
 */
export function resolveConnection(
  accounts: DiscoveredAccount[],
  locations: DiscoveredLocation[],
): Resolution {
  if (locations.length === 1) {
    const loc = locations[0]
    return {
      status: 'OPERATIONAL',
      accountId: loc.accountName,
      locationResourceName: composeLocationResourceName(loc.accountName, loc.locationName),
    }
  }

  const distinctAccounts = new Set(
    locations.length > 0 ? locations.map((l) => l.accountName) : accounts.map((a) => a.name),
  )
  const unambiguousAccount = distinctAccounts.size === 1 ? [...distinctAccounts][0] : null

  return {
    status: 'CONNECTED_NO_LOCATION',
    reason: locations.length === 0 ? 'none' : 'multiple',
    accountId: unambiguousAccount,
  }
}

/** Mapea una Resolution al patch de conexión. Reemplaza: SIEMPRE escribe ambos campos. */
export function resolutionToConnectionPatch(res: Resolution): GbpConnectionPatch {
  if (res.status === 'OPERATIONAL') {
    return { gbpAccountId: res.accountId, gbpLocationId: res.locationResourceName }
  }
  return { gbpAccountId: res.accountId, gbpLocationId: null }
}

/**
 * Estado legible desde los campos ya persistidos, para que la vista (P3-A.2) lo consuma
 * sin volver a llamar a Google. El matiz none/multiple no se persiste (sin migración): se
 * recalcula on-demand en el listado o se emite en el redirect del callback al conectar.
 */
export function deriveConnectionStatus(o: {
  gbpConnectedAt: Date | null
  gbpLocationId: string | null
}): ConnectionStatus {
  if (!o.gbpConnectedAt) return 'NOT_CONNECTED'
  return o.gbpLocationId ? 'OPERATIONAL' : 'CONNECTED_NO_LOCATION'
}

/** Busca un location por id pelado dentro de la lista descubierta (membership anti-IDOR). */
export function findLocationInList(
  locations: DiscoveredLocation[],
  locationId: string,
): DiscoveredLocation | null {
  const target = extractId(locationId)
  return locations.find((l) => extractId(l.locationName) === target) ?? null
}

/** Mapea el snapshot al patch de rating. `rating` null si count 0 → honesto para health-score. */
export function snapshotToRatingPatch(snap: RatingSnapshot, now: Date): GbpRatingPatch {
  return {
    googleReviewsCount: snap.count,
    googleRating: snap.count > 0 ? snap.rating : null,
    googleRatingUpdatedAt: now,
  }
}

// ─── Engine (orquestación pura sobre deps) ─────────────────────────────────────

async function discoverLocations(
  accessToken: string,
  deps: ConnectGbpDeps,
): Promise<{ accounts: DiscoveredAccount[]; locations: DiscoveredLocation[] }> {
  const accounts = await deps.listAccounts(accessToken)
  const locations: DiscoveredLocation[] = []
  for (const account of accounts) {
    const locs = await deps.listLocations(accessToken, account.name)
    locations.push(...locs)
  }
  return { accounts, locations }
}

/** Fill de rating one-shot best-effort (Paso 5): NUNCA rompe la conexión. */
async function fillRatingBestEffort(orgId: string, deps: ConnectGbpDeps): Promise<void> {
  try {
    const snap = await deps.fetchRating(orgId)
    if (snap) await deps.store.updateRating(orgId, snapshotToRatingPatch(snap, deps.now()))
  } catch (err) {
    console.error('[GBP] rating fill (best-effort) failed:', err)
  }
}

/**
 * Paso 1-2-5: descubre account+location, persiste según cardinalidad (reemplaza) y, si
 * queda OPERATIONAL, llena rating/count one-shot best-effort. El `orgId` se pasa verbatim
 * a cada `store.*` — nunca deriva de otra cosa (garantía anti-IDOR estructural).
 */
export async function runConnectGbp(orgId: string, deps: ConnectGbpDeps): Promise<ConnectionStatus> {
  const accessToken = await deps.getAccessToken(orgId)
  if (!accessToken) return 'NOT_CONNECTED'

  const { accounts, locations } = await discoverLocations(accessToken, deps)
  const res = resolveConnection(accounts, locations)

  await deps.store.updateConnection(orgId, resolutionToConnectionPatch(res))

  if (res.status === 'OPERATIONAL') await fillRatingBestEffort(orgId, deps)
  return res.status
}

/** Paso 4: locations disponibles de la cuenta conectada (para el selector de P3-A.2). */
export async function runListLocations(
  orgId: string,
  deps: ConnectGbpDeps,
): Promise<AvailableLocation[]> {
  const accessToken = await deps.getAccessToken(orgId)
  if (!accessToken) return []

  const { locations } = await discoverLocations(accessToken, deps)
  return locations.map((l) => ({
    locationId: extractId(l.locationName),
    resourceName: composeLocationResourceName(l.accountName, l.locationName),
    title: l.title,
    address: l.address,
  }))
}

/**
 * Paso 4: fija la location elegida como activa. Valida que pertenezca a la cuenta
 * conectada de ESTA org re-descubriendo con SUS PROPIOS tokens (getAccessToken(orgId)):
 * ninguna location cross-org es alcanzable. Persiste el resource name v4 compuesto + su
 * account, y llena rating one-shot best-effort.
 */
export async function runSetActiveLocation(
  orgId: string,
  locationId: string,
  deps: ConnectGbpDeps,
): Promise<{ ok: true; status: ConnectionStatus } | { ok: false; error: string }> {
  const accessToken = await deps.getAccessToken(orgId)
  if (!accessToken) return { ok: false, error: 'GBP no conectado.' }

  const { locations } = await discoverLocations(accessToken, deps)
  const hit = findLocationInList(locations, locationId)
  if (!hit) return { ok: false, error: 'La ubicación no pertenece a la cuenta conectada.' }

  await deps.store.updateConnection(orgId, {
    gbpAccountId: hit.accountName,
    gbpLocationId: composeLocationResourceName(hit.accountName, hit.locationName),
  })
  await fillRatingBestEffort(orgId, deps)
  return { ok: true, status: 'OPERATIONAL' }
}
