import { cache } from 'react'
import { unsafeGlobalQuery } from '@/lib/isolation'
import { excludeDqWhere } from '@/modules/chatbot/server/scoring'

const THIRTY_DAYS_AGO = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

/**
 * @global SUPER_ADMIN-only — agrega métricas de TODOS los bots de TODAS las orgs.
 *
 * B9.2 flageó este query como "global sin filtro" (intencional, pero frágil).
 * B11.2 renombró de `getBotsOverviewStats` → `getGlobalBotsOverviewStats` para
 * que el nombre del callsite haga explícito el riesgo: no debe usarse desde
 * loaders/actions de cliente. El único caller actual es
 * `/admin/chatbots/page.tsx`, que vive bajo el layout `(protected)/admin/`
 * que exige SUPER_ADMIN.
 *
 * ⚠️ Si vas a llamarla desde un loader/action nuevo: confirmá que el caller
 * está bajo `/admin/**` o que vos mismo verificás `requireSuperAdmin()` antes.
 * Para vista por-org usá las queries con filtro `organizationId` en
 * `multiTenantQueries.ts`.
 */
export const getGlobalBotsOverviewStats = cache(async () => {
  // PLATFORM-AGG: overview cross-org de TODOS los bots (admin develOP). Global
  // por diseño — el nombre y este escape lo hacen explícito y greppable.
  const [totalBots, activeBots, totalConversationsLast30d, totalLeadsLast30d] = await unsafeGlobalQuery(
    'PLATFORM-AGG: overview de todos los bots/orgs para el admin develOP',
    (c) =>
      Promise.all([
        c.botConfig.count(),
        c.botConfig.count({ where: { isActive: true } }),
        c.conversation.count({
          where: { startedAt: { gte: THIRTY_DAYS_AGO() } },
        }),
        // B5.3 — métricas de conversión excluyen DQ (empleo/proveedor/spam/postventa<0).
        c.chatbotLead.count({
          where: {
            capturedAt: { gte: THIRTY_DAYS_AGO() },
            ...excludeDqWhere(),
          },
        }),
      ]),
  )

  return {
    totalBots,
    activeBots,
    inactiveBots: totalBots - activeBots,
    conversationsLast30d: totalConversationsLast30d,
    leadsLast30d: totalLeadsLast30d,
  }
})
