# develOP — Logic Core v3

Chatbot multi-tenant + portal agencia para develOP, agencia de desarrollo web e IA en Tucumán, Argentina.

## Stack

- Next.js 16 (App Router) + TypeScript estricto
- Prisma + Neon PostgreSQL (sa-east-1)
- NextAuth v5
- Tailwind CSS 4 + Framer Motion
- Vertex AI (Gemini 2.5 Flash)
- Brevo (email transaccional)
- Netlify (deploy + cron jobs)

## Quick start

```bash
npm install
cp .env.example .env  # completar valores reales
npm run check-env
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Visitar http://localhost:3000

Credenciales seed:
- Admin: admin@develop.com / Admin1234!
- Cliente: cliente@sanmiguel.com / Cliente1234!

## Estructura de rutas

| Ruta | Para quién |
|---|---|
| `/admin/*` | Panel develOP (SUPER_ADMIN) |
| `/admin/chatbots` | Vista global de bots |
| `/admin/chatbots/[botId]` | Detail + tabs por bot |
| `/admin/clients` | Lista de clientes |
| `/dashboard/*` | Portal cliente (ORG_MEMBER) |
| `/dashboard/chatbot/*` | Sección chatbot del cliente |
| `/api/chatbot/[slug]/*` | API pública del chatbot |
| `/widget.js` | Script embebible (~5KB) |
| `/admin/_design` | Playground del design system |

## Documentación

- `STATUS.md` — Estado real del proyecto (fuente de verdad)
- `DEPLOY.md` — Guía de deploy en Netlify
- `docs/operations/` — 6 workflows operativos
- `docs/testing-strategy.md` — Cómo correr tests
- `docs/design-system.md` — Design tokens y componentes

## Testing

```bash
# Build
npm run build

# TypeScript
npx tsc --noEmit

# E2E (requiere entorno con .env completo)
npx playwright test

# Tests específicos
npx playwright test tests/e2e/14-e2e-critical-flow.spec.ts
```

## Deploy

Ver `DEPLOY.md` para variables de entorno y configuración en Netlify.

## Equipo

Franco + Socio. Tucumán, Argentina.
