/**
 * P3-A.1 — Invariante del eslabón de conexión GBP. Corre SIN DB, sin red y sin cuenta
 * de Google real:
 *
 *   npm run check:invariant:gbp-connection
 *   (o: npx tsx src/lib/integrations/gbp-connection.invariant.ts)
 *
 * Verifica, ejecutable, las garantías del sprint:
 *   1. CARDINALIDAD: 1 → OPERATIONAL (persiste account + location v4 compuesto);
 *      >1 → CONNECTED_NO_LOCATION('multiple') sin location; 0 → ...('none').
 *   2. AISLAMIENTO (anti-IDOR): la persistencia escribe SOLO en la org pasada; un connect
 *      de orgA jamás escribe en orgB; setActiveLocation con location ajena no escribe nada.
 *   3. BEST-EFFORT: si el fill de rating explota, la conexión queda OPERATIONAL igual.
 *   4. REEMPLAZO: reconectar reemplaza account/location, no acumula (incl. downgrade a null).
 *   5. PUENTE v1→v4: composeLocationResourceName arma "accounts/{a}/locations/{l}".
 *   6. ESTADO: deriveConnectionStatus mapea honesto desde los campos persistidos.
 *
 * Importa SOLO el núcleo puro (gbp-connection-logic). Cero prisma, cero next, cero fetch.
 */
import assert from 'node:assert/strict'
import {
  composeLocationResourceName,
  deriveConnectionStatus,
  extractId,
  findLocationInList,
  resolveConnection,
  runConnectGbp,
  runListLocations,
  runSetActiveLocation,
  type ConnectGbpDeps,
  type DiscoveredAccount,
  type DiscoveredLocation,
  type GbpConnectionPatch,
  type GbpRatingPatch,
  type RatingSnapshot,
} from './gbp-connection-logic.ts'

const FIXED_NOW = new Date('2026-07-04T12:00:00.000Z')

type SpyRecord = { connection?: GbpConnectionPatch; rating?: GbpRatingPatch }

type DepsConfig = {
  accountNames?: string[]
  locationsByAccount?: Record<string, DiscoveredLocation[]>
  rating?: RatingSnapshot | null
  ratingThrows?: boolean
  token?: string | null
}

/** Un location fixture: locationName en formato v1 pelado ("locations/{id}"). */
function loc(accountName: string, locationId: string): DiscoveredLocation {
  return { accountName, locationName: `locations/${locationId}`, title: `t-${locationId}`, address: null }
}

/** Arma deps fake + un store espía que graba cada write por orgId. */
function makeDeps(config: DepsConfig): { deps: ConnectGbpDeps; writes: Map<string, SpyRecord> } {
  const writes = new Map<string, SpyRecord>()
  const record = (orgId: string): SpyRecord => {
    const existing = writes.get(orgId)
    if (existing) return existing
    const fresh: SpyRecord = {}
    writes.set(orgId, fresh)
    return fresh
  }

  const accounts: DiscoveredAccount[] = (config.accountNames ?? []).map((name) => ({ name }))

  const deps: ConnectGbpDeps = {
    now: () => FIXED_NOW,
    getAccessToken: async () => (config.token === undefined ? 'fake-token' : config.token),
    listAccounts: async () => accounts,
    listLocations: async (_token, accountName) => config.locationsByAccount?.[accountName] ?? [],
    fetchRating: async () => {
      if (config.ratingThrows) throw new Error('rating boom')
      return config.rating ?? null
    },
    store: {
      updateConnection: async (orgId, patch) => {
        record(orgId).connection = patch
      },
      updateRating: async (orgId, patch) => {
        record(orgId).rating = patch
      },
    },
  }
  return { deps, writes }
}

async function main(): Promise<void> {
  // ── 1. Cardinalidad = 1 → OPERATIONAL (persiste compuesto + rating) ─────────
  {
    const { deps, writes } = makeDeps({
      accountNames: ['accounts/A'],
      locationsByAccount: { 'accounts/A': [loc('accounts/A', 'L1')] },
      rating: { rating: 4.5, count: 12 },
    })
    const status = await runConnectGbp('orgX', deps)
    assert.equal(status, 'OPERATIONAL', '1 location → OPERATIONAL')
    assert.deepEqual(
      writes.get('orgX')?.connection,
      { gbpAccountId: 'accounts/A', gbpLocationId: 'accounts/A/locations/L1' },
      '1 location → persiste account + location v4 compuesto',
    )
    assert.deepEqual(
      writes.get('orgX')?.rating,
      { googleReviewsCount: 12, googleRating: 4.5, googleRatingUpdatedAt: FIXED_NOW },
      '1 location → llena rating/count/updatedAt',
    )
  }

  // ── 2. Cardinalidad > 1 → CONNECTED_NO_LOCATION('multiple'), sin location ────
  {
    // 2a. varias locations bajo UNA account → account inequívoca, location null.
    const one = makeDeps({
      accountNames: ['accounts/A'],
      locationsByAccount: { 'accounts/A': [loc('accounts/A', 'L1'), loc('accounts/A', 'L2')] },
      rating: { rating: 5, count: 99 },
    })
    assert.equal(await runConnectGbp('orgM', one.deps), 'CONNECTED_NO_LOCATION', '>1 → CONNECTED_NO_LOCATION')
    assert.deepEqual(
      one.writes.get('orgM')?.connection,
      { gbpAccountId: 'accounts/A', gbpLocationId: null },
      '>1 bajo 1 account → account persistida, location null',
    )
    assert.equal(one.writes.get('orgM')?.rating, undefined, '>1 → NO llena rating')

    // 2b. locations en accounts distintas → account ambigua → null.
    const multi = makeDeps({
      accountNames: ['accounts/A', 'accounts/B'],
      locationsByAccount: {
        'accounts/A': [loc('accounts/A', 'L1')],
        'accounts/B': [loc('accounts/B', 'L2')],
      },
    })
    await runConnectGbp('orgM2', multi.deps)
    assert.deepEqual(
      multi.writes.get('orgM2')?.connection,
      { gbpAccountId: null, gbpLocationId: null },
      '>1 en accounts distintas → account null (ambigua), location null',
    )
  }

  // ── 3. Cardinalidad = 0 → CONNECTED_NO_LOCATION('none') ─────────────────────
  {
    const { deps, writes } = makeDeps({
      accountNames: ['accounts/A'],
      locationsByAccount: { 'accounts/A': [] },
    })
    assert.equal(await runConnectGbp('orgZ', deps), 'CONNECTED_NO_LOCATION', '0 locations → CONNECTED_NO_LOCATION')
    assert.deepEqual(
      writes.get('orgZ')?.connection,
      { gbpAccountId: 'accounts/A', gbpLocationId: null },
      '0 locations con 1 account → account persistida, location null',
    )
    assert.equal(writes.get('orgZ')?.rating, undefined, '0 locations → NO llena rating')
  }

  // ── 4. Aislamiento (anti-IDOR): escribe SOLO la org pasada ──────────────────
  {
    const a = makeDeps({
      accountNames: ['accounts/A'],
      locationsByAccount: { 'accounts/A': [loc('accounts/A', 'LA')] },
      rating: { rating: 4, count: 3 },
    })
    await runConnectGbp('orgA', a.deps)
    const b = makeDeps({
      accountNames: ['accounts/B'],
      locationsByAccount: { 'accounts/B': [loc('accounts/B', 'LB')] },
      rating: { rating: 4, count: 3 },
    })
    await runConnectGbp('orgB', b.deps)

    assert.deepEqual([...a.writes.keys()], ['orgA'], 'connect de orgA escribe SOLO orgA')
    assert.deepEqual([...b.writes.keys()], ['orgB'], 'connect de orgB escribe SOLO orgB')
    assert.equal(
      a.writes.get('orgA')?.connection?.gbpLocationId,
      'accounts/A/locations/LA',
      'orgA persiste su propia location',
    )
    assert.equal(
      b.writes.get('orgB')?.connection?.gbpLocationId,
      'accounts/B/locations/LB',
      'orgB persiste su propia location (sin contaminación cruzada)',
    )
  }

  // ── 5. Best-effort: si el fill de rating explota, queda OPERATIONAL igual ────
  {
    const { deps, writes } = makeDeps({
      accountNames: ['accounts/A'],
      locationsByAccount: { 'accounts/A': [loc('accounts/A', 'L1')] },
      ratingThrows: true,
    })
    assert.equal(await runConnectGbp('orgBE', deps), 'OPERATIONAL', 'rating que explota NO rompe la conexión')
    assert.ok(writes.get('orgBE')?.connection, 'la conexión se persistió igual')
    assert.equal(writes.get('orgBE')?.rating, undefined, 'rating no se escribió (best-effort falló)')
  }

  // ── 6. Reconexión reemplaza (no acumula) — store compartido entre corridas ──
  {
    const writes = new Map<string, SpyRecord>()
    const sharedStore = {
      updateConnection: async (orgId: string, patch: GbpConnectionPatch) => {
        const rec = writes.get(orgId) ?? {}
        rec.connection = patch
        writes.set(orgId, rec)
      },
      updateRating: async (orgId: string, patch: GbpRatingPatch) => {
        const rec = writes.get(orgId) ?? {}
        rec.rating = patch
        writes.set(orgId, rec)
      },
    }
    const depsFor = (locations: DiscoveredLocation[]): ConnectGbpDeps => ({
      now: () => FIXED_NOW,
      getAccessToken: async () => 'fake-token',
      listAccounts: async () => [{ name: 'accounts/A' }],
      listLocations: async () => locations,
      fetchRating: async () => ({ rating: 5, count: 1 }),
      store: sharedStore,
    })

    await runConnectGbp('orgR', depsFor([loc('accounts/A', 'L1')]))
    await runConnectGbp('orgR', depsFor([loc('accounts/A', 'L2')]))
    assert.equal(
      writes.get('orgR')?.connection?.gbpLocationId,
      'accounts/A/locations/L2',
      'reconectar reemplaza la location (L2), no acumula L1',
    )

    await runConnectGbp('orgR', depsFor([loc('accounts/A', 'L1'), loc('accounts/A', 'L2')]))
    assert.equal(
      writes.get('orgR')?.connection?.gbpLocationId,
      null,
      'reconectar y encontrar >1 baja a location null (downgrade honesto)',
    )
  }

  // ── 7. Puras: resolveConnection / compose / derive / extractId ──────────────
  {
    assert.equal(composeLocationResourceName('accounts/9', 'locations/8'), 'accounts/9/locations/8', 'compone v4')
    assert.equal(
      composeLocationResourceName('accounts/9', 'accounts/9/locations/8'),
      'accounts/9/locations/8',
      'idempotente sobre input ya compuesto',
    )
    assert.equal(extractId('accounts/1/locations/2'), '2', 'extractId → último segmento')
    assert.equal(extractId('7'), '7', 'extractId sobre id pelado → igual')

    assert.equal(deriveConnectionStatus({ gbpConnectedAt: null, gbpLocationId: null }), 'NOT_CONNECTED', 'sin connectedAt → NOT_CONNECTED')
    assert.equal(
      deriveConnectionStatus({ gbpConnectedAt: FIXED_NOW, gbpLocationId: null }),
      'CONNECTED_NO_LOCATION',
      'connectado sin location',
    )
    assert.equal(
      deriveConnectionStatus({ gbpConnectedAt: FIXED_NOW, gbpLocationId: 'accounts/A/locations/L' }),
      'OPERATIONAL',
      'connectado con location → OPERATIONAL',
    )

    assert.deepEqual(
      resolveConnection([{ name: 'accounts/A' }], []),
      { status: 'CONNECTED_NO_LOCATION', reason: 'none', accountId: 'accounts/A' },
      'resolve 0 → none con account inequívoca',
    )
    assert.equal(
      resolveConnection([{ name: 'accounts/A' }], [loc('accounts/A', 'L1')]).status,
      'OPERATIONAL',
      'resolve 1 → OPERATIONAL',
    )
  }

  // ── 8. setActiveLocation: membership server-side (anti-IDOR) ────────────────
  {
    const base = () =>
      makeDeps({
        accountNames: ['accounts/A'],
        locationsByAccount: { 'accounts/A': [loc('accounts/A', 'L1'), loc('accounts/A', 'L2')] },
        rating: { rating: 4.2, count: 7 },
      })

    const okCase = base()
    assert.deepEqual(
      await runSetActiveLocation('orgS', 'L2', okCase.deps),
      { ok: true, status: 'OPERATIONAL' },
      'location válida → ok + OPERATIONAL',
    )
    assert.equal(
      okCase.writes.get('orgS')?.connection?.gbpLocationId,
      'accounts/A/locations/L2',
      'setActiveLocation persiste el compuesto elegido',
    )

    const badCase = base()
    assert.equal((await runSetActiveLocation('orgS', 'L-AJENA', badCase.deps)).ok, false, 'location ajena → rechazada')
    assert.equal(badCase.writes.get('orgS'), undefined, 'location ajena → NO escribe nada (anti-IDOR)')

    assert.equal(findLocationInList([loc('accounts/A', 'L1')], 'L9'), null, 'findLocationInList: id ausente → null')
  }

  // ── 8b. listLocations expone el catálogo para el selector de P3-A.2 ─────────
  {
    const { deps } = makeDeps({
      accountNames: ['accounts/A'],
      locationsByAccount: { 'accounts/A': [loc('accounts/A', 'L1'), loc('accounts/A', 'L2')] },
    })
    const list = await runListLocations('orgL', deps)
    assert.deepEqual(
      list.map((l) => l.resourceName),
      ['accounts/A/locations/L1', 'accounts/A/locations/L2'],
      'expone resource names v4 compuestos',
    )
    assert.deepEqual(list.map((l) => l.locationId), ['L1', 'L2'], 'expone ids pelados para el value del selector')
  }

  // ── 9. Determinismo: mismos fixtures + now → mismos patches ─────────────────
  {
    const run = async (): Promise<SpyRecord | undefined> => {
      const { deps, writes } = makeDeps({
        accountNames: ['accounts/A'],
        locationsByAccount: { 'accounts/A': [loc('accounts/A', 'L1')] },
        rating: { rating: 4.5, count: 12 },
      })
      await runConnectGbp('orgD', deps)
      return writes.get('orgD')
    }
    assert.deepEqual(await run(), await run(), 'runConnectGbp es determinista con fixtures + now fijos')
  }

  console.log(
    '✓ gbp-connection invariants OK: cardinalidad (1/>1/0), aislamiento anti-IDOR ' +
      '(escribe solo la org pasada), best-effort de rating, reemplazo en reconexión, ' +
      'puente v1→v4 y estados honestos.',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
