# Motor WhatsApp

Motor multi-tenant de WhatsApp Business Platform, integrado vía BSP
(Business Solution Provider) 360dialog. Vive dentro de `logic-core-v3`,
como módulo nuevo que convive con `src/modules/chatbot/`, LeadOS y el
panel admin, sin acoplarse a ellos.

Este README documenta la frontera del módulo. La lógica de negocio se
agrega en sprints posteriores (ver `docs/motor-whatsapp/bitacora.md`).

## Regla de frontera (imports)

- `src/modules/motor/**` NO puede importar de otros módulos
  (`src/modules/chatbot/**` salvo la excepción de abajo, LeadOS, etc.)
  ni de `src/app/**`.
- Permitido: `src/lib/**`, `src/modules/motor/**`, paquetes de npm.
- Excepción única: `src/modules/motor/**` puede importar de
  `src/modules/chatbot/public-api` (barrel que se creará en B2).
- Enforced en `eslint.config.mjs` vía `no-restricted-imports`.

## Regla de aislamiento (datos)

- `src/modules/motor/**` NO puede importar `@/lib/prisma` directamente.
- Toda query a la base de datos debe pasar por `src/lib/isolation/`
  (se crea en B0-S2). Hasta que exista, este módulo no ejecuta queries.
- Objetivo: garantizar el filtrado multi-tenant por `organizationId` en
  un único punto de entrada, no disperso por el módulo.

## Estructura

```
src/modules/motor/
  adapters/   # integraciones externas (360dialog, webhooks BSP)
    whatsapp/inbound/   # B1-S1: auth del webhook, clasificación, persistencia
  domain/     # tipos y reglas de negocio puras
    bsuid.ts                # detección de formato BSUID/teléfono
    channel-credentials.ts  # token de URL + secret del webhook (hash)
    identity.ts             # resolución BSUID-first + user_id_update
    prisma-errors.ts        # clasificación de P2002 (idempotencia)
  services/   # orquestación, casos de uso
  types/      # tipos compartidos del módulo
```

## Estado

- B0-S1: esqueleto del módulo, frontera de imports y registro. Sin
  lógica de negocio.
- B1-S1: adaptador BSP de ENTRADA — webhook autenticado
  (`/api/motor/webhook/[channelToken]`), resolución de identidad
  BSUID-first, idempotencia por wamid, statuses y `user_id_update`.
  El envío es B1-S2.
