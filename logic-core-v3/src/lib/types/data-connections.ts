export type DataSourceKey =
  | 'ga4'
  | 'searchConsole'
  | 'googleBusinessProfile'
  | 'whatsappBusiness'
  | 'afip'
  | 'pixel'

export type DataConnectionStatus = {
  connected: boolean
  lastSync: string | null
}

export type DataConnections = Record<DataSourceKey, DataConnectionStatus>

export const DEFAULT_DATA_CONNECTIONS: DataConnections = {
  ga4: { connected: false, lastSync: null },
  searchConsole: { connected: false, lastSync: null },
  googleBusinessProfile: { connected: false, lastSync: null },
  whatsappBusiness: { connected: false, lastSync: null },
  afip: { connected: false, lastSync: null },
  pixel: { connected: false, lastSync: null },
}

export const DATA_SOURCE_LABELS: Record<DataSourceKey, string> = {
  ga4: 'Google Analytics',
  searchConsole: 'Search Console',
  googleBusinessProfile: 'Google Business Profile',
  whatsappBusiness: 'WhatsApp Business',
  afip: 'AFIP',
  pixel: 'Pixel de conversiones',
}

export type ConnectionLevel = 'ONBOARDING' | 'PARTIAL' | 'COMPLETE'

export function getConnectionLevel(connections: DataConnections): {
  level: ConnectionLevel
  connectedCount: number
  totalCount: number
  percentage: number
} {
  const total = Object.keys(connections).length
  const connected = Object.values(connections).filter((connection) => connection.connected).length
  const percentage = (connected / total) * 100

  let level: ConnectionLevel
  if (percentage < 30) level = 'ONBOARDING'
  else if (percentage < 70) level = 'PARTIAL'
  else level = 'COMPLETE'

  return { level, connectedCount: connected, totalCount: total, percentage }
}

export function parseDataConnections(raw: unknown): DataConnections {
  if (!raw || typeof raw !== 'object') return DEFAULT_DATA_CONNECTIONS
  const parsed = raw as Partial<DataConnections>

  return {
    ga4: parsed.ga4 ?? DEFAULT_DATA_CONNECTIONS.ga4,
    searchConsole: parsed.searchConsole ?? DEFAULT_DATA_CONNECTIONS.searchConsole,
    googleBusinessProfile:
      parsed.googleBusinessProfile ?? DEFAULT_DATA_CONNECTIONS.googleBusinessProfile,
    whatsappBusiness: parsed.whatsappBusiness ?? DEFAULT_DATA_CONNECTIONS.whatsappBusiness,
    afip: parsed.afip ?? DEFAULT_DATA_CONNECTIONS.afip,
    pixel: parsed.pixel ?? DEFAULT_DATA_CONNECTIONS.pixel,
  }
}
