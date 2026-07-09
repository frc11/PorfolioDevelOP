import { cache } from 'react'
import { auth } from '@/auth'
import { unsafeGlobalQuery } from '@/lib/isolation'

export const getClientChatbotSession = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null

  // AUTH-RESOLUTION: resuelve la org del usuario autenticado vía OrgMember. Es
  // la RAÍZ de sesión del dashboard cliente (User/OrgMember no están cubiertos
  // por el helper: el tenant se descubre acá, no se asume).
  const member = await unsafeGlobalQuery(
    'AUTH-RESOLUTION: user→org via OrgMember (raíz de sesión del dashboard cliente)',
    (c) =>
      c.orgMember.findFirst({
        where: { userId: session.user.id },
        include: {
          organization: {
            include: {
              botConfig: true,
            },
          },
        },
      }),
  )

  if (!member?.organization?.botConfig) return null

  return {
    user: session.user,
    organization: member.organization,
    bot: member.organization.botConfig,
  }
})
