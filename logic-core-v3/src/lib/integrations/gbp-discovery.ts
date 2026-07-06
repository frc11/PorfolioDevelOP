/**
 * P3-A.1 — I/O de descubrimiento GBP: `fetch` crudo a las REST v1 de Google
 * (Account Management + Business Information), con el Bearer del cliente OAuth existente.
 * Mismo patrón que `google-business-profile.ts` (fetch crudo, parseo tipado con guards).
 *
 * Decisión (CLAUDE.md: no agregar deps con alternativa instalada): NO se instala
 * `@googleapis/mybusinessaccountmanagement` — el cliente GBP entero ya es fetch crudo,
 * y los SDK oficiales de GBP no están en el árbol de dependencias.
 */
import type { DiscoveredAccount, DiscoveredLocation } from './gbp-connection-logic'

const ACCOUNTS_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
const LOCATIONS_HOST = 'https://mybusinessbusinessinformation.googleapis.com/v1'
// readMask es OBLIGATORIO en Business Information o Google responde 400.
const LOCATIONS_READ_MASK = 'name,title,storefrontAddress'
const MAX_PAGES = 20 // tope duro anti-paginación runaway

type FetchLike = typeof fetch

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function parseAddress(storefrontAddress: unknown): string | null {
  if (!isRecord(storefrontAddress)) return null
  const lines = Array.isArray(storefrontAddress.addressLines)
    ? storefrontAddress.addressLines.filter((l): l is string => typeof l === 'string')
    : []
  const locality = asString(storefrontAddress.locality)
  const parts = [...lines, ...(locality ? [locality] : [])]
  return parts.length > 0 ? parts.join(', ') : null
}

/** Lista las accounts accesibles con el token (Account Management v1), paginado. */
export async function listGbpAccounts(
  accessToken: string,
  fetchImpl: FetchLike = fetch,
): Promise<DiscoveredAccount[]> {
  const accounts: DiscoveredAccount[] = []
  let pageToken: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(ACCOUNTS_URL)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetchImpl(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      console.error('[GBP discovery] accounts API error:', res.status)
      break
    }

    const data: unknown = await res.json()
    if (!isRecord(data)) break

    if (Array.isArray(data.accounts)) {
      for (const raw of data.accounts) {
        const name = isRecord(raw) ? asString(raw.name) : null
        if (name) accounts.push({ name })
      }
    }

    pageToken = asString(data.nextPageToken) ?? undefined
    if (!pageToken) break
  }

  return accounts
}

/** Lista las locations de una account (Business Information v1), paginado. */
export async function listGbpLocations(
  accessToken: string,
  accountName: string,
  fetchImpl: FetchLike = fetch,
): Promise<DiscoveredLocation[]> {
  const locations: DiscoveredLocation[] = []
  let pageToken: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(`${LOCATIONS_HOST}/${accountName}/locations`)
    url.searchParams.set('readMask', LOCATIONS_READ_MASK)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetchImpl(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      console.error('[GBP discovery] locations API error:', res.status)
      break
    }

    const data: unknown = await res.json()
    if (!isRecord(data)) break

    if (Array.isArray(data.locations)) {
      for (const raw of data.locations) {
        if (!isRecord(raw)) continue
        const name = asString(raw.name)
        if (!name) continue
        locations.push({
          accountName,
          locationName: name,
          title: asString(raw.title),
          address: parseAddress(raw.storefrontAddress),
        })
      }
    }

    pageToken = asString(data.nextPageToken) ?? undefined
    if (!pageToken) break
  }

  return locations
}
