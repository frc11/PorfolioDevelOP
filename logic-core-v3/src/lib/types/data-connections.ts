/**
 * data-connections.ts
 *
 * Defines the DataConnections shape stored as JSON in Organization.dataConnections
 * (future schema field), the parser that normalises unknown JSON to a typed struct,
 * and the `getConnectionLevel` classifier consumed by computeHealthScore.
 *
 * The field is intentionally a JSON blob so we can evolve sources without a
 * schema migration on every iteration.
 */

// ─── Connection source descriptors ───────────────────────────────────────────

export type DataConnectionSource = {
  connected: boolean
  connectedAt?: string | null // ISO date string
}

export type DataConnections = {
  ga4: DataConnectionSource
  searchConsole: DataConnectionSource
  whatsapp: DataConnectionSource
  instagram: DataConnectionSource
  googleMyBusiness: DataConnectionSource
  stripe: DataConnectionSource
}

// ─── Level enum ──────────────────────────────────────────────────────────────

export type ConnectionLevel = 'ONBOARDING' | 'PARTIAL' | 'COMPLETE'

const TOTAL_SOURCES = 6

// ─── Default (zero-state) connections ────────────────────────────────────────

export const DEFAULT_CONNECTIONS: DataConnections = {
  ga4: { connected: false },
  searchConsole: { connected: false },
  whatsapp: { connected: false },
  instagram: { connected: false },
  googleMyBusiness: { connected: false },
  stripe: { connected: false },
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Safely coerces an unknown prisma JSON value into a typed DataConnections.
 * Unknown or malformed values fall back to the disconnected default.
 */
export function parseDataConnections(raw: unknown): DataConnections {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_CONNECTIONS }
  }

  const obj = raw as Record<string, unknown>

  function parseSource(val: unknown): DataConnectionSource {
    if (val === null || val === undefined || typeof val !== 'object' || Array.isArray(val)) {
      return { connected: false }
    }
    const src = val as Record<string, unknown>
    return {
      connected: src['connected'] === true,
      connectedAt: typeof src['connectedAt'] === 'string' ? src['connectedAt'] : null,
    }
  }

  return {
    ga4: parseSource(obj['ga4']),
    searchConsole: parseSource(obj['searchConsole']),
    whatsapp: parseSource(obj['whatsapp']),
    instagram: parseSource(obj['instagram']),
    googleMyBusiness: parseSource(obj['googleMyBusiness']),
    stripe: parseSource(obj['stripe']),
  }
}

// ─── Level classifier ────────────────────────────────────────────────────────

export type ConnectionLevelResult = {
  level: ConnectionLevel
  connectedCount: number
  totalCount: number
  percentage: number
}

export function getConnectionLevel(connections: DataConnections): ConnectionLevelResult {
  const connectedCount = Object.values(connections).filter((s) => s.connected).length
  const percentage = Math.round((connectedCount / TOTAL_SOURCES) * 100)

  let level: ConnectionLevel
  if (connectedCount === 0) {
    level = 'ONBOARDING'
  } else if (connectedCount < 4) {
    level = 'PARTIAL'
  } else {
    level = 'COMPLETE'
  }

  return { level, connectedCount, totalCount: TOTAL_SOURCES, percentage }
}
