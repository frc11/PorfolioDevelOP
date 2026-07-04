/**
 * P3-A.1 — Wiring de la conexión GBP: arma los `deps` reales (prisma store + discovery +
 * token del cliente OAuth) y expone las entradas que consumen el callback y los servicios
 * server. ÚNICO archivo nuevo que importa prisma — mantiene el núcleo (`gbp-connection-logic`)
 * libre de DB para que el invariant corra con tsx.
 */
import { prisma } from '@/lib/prisma'
import { fetchGoogleRatingSnapshot, getGbpAccessToken } from './google-business-profile'
import { listGbpAccounts, listGbpLocations } from './gbp-discovery'
import {
  runConnectGbp,
  runListLocations,
  runSetActiveLocation,
  type AvailableLocation,
  type ConnectGbpDeps,
  type ConnectionStatus,
  type GbpConnectionStore,
} from './gbp-connection-logic'

const prismaStore: GbpConnectionStore = {
  async updateConnection(orgId, patch) {
    await prisma.organization.update({ where: { id: orgId }, data: patch })
  },
  async updateRating(orgId, patch) {
    await prisma.organization.update({ where: { id: orgId }, data: patch })
  },
}

const realDeps: ConnectGbpDeps = {
  now: () => new Date(),
  getAccessToken: getGbpAccessToken,
  listAccounts: (token) => listGbpAccounts(token),
  listLocations: (token, account) => listGbpLocations(token, account),
  fetchRating: fetchGoogleRatingSnapshot,
  store: prismaStore,
}

/** Callback: descubre + persiste account/location + rating one-shot. Devuelve el estado honesto. */
export function connectGbpForOrg(orgId: string): Promise<ConnectionStatus> {
  return runConnectGbp(orgId, realDeps)
}

/** Servicio P3-A.2: locations disponibles de la cuenta conectada de la org. */
export function listLocationsForOrg(orgId: string): Promise<AvailableLocation[]> {
  return runListLocations(orgId, realDeps)
}

/** Servicio P3-A.2: fija la location activa (valida pertenencia contra los tokens de la org). */
export function setActiveLocationForOrg(
  orgId: string,
  locationId: string,
): Promise<{ ok: true; status: ConnectionStatus } | { ok: false; error: string }> {
  return runSetActiveLocation(orgId, locationId, realDeps)
}
