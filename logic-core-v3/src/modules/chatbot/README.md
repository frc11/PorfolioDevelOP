# Chatbot Module

Multi-tenant white-label chatbot module for the develOP ecosystem.
Lives inside the `logic-core-v3` repo but is designed for extraction
to its own repo / package in Phase 1.5.

## Module Boundary (CRITICAL)

This module follows strict boundary rules to enable future extraction:

1. **No imports from `src/` outside this module** — except `@/lib/prisma`
   and environment config. If you need something else, copy or receive
   via props.

2. **Public API only via `src/modules/chatbot/index.ts`** — no deep imports
   from outside.

3. **Database tables prefixed `chatbot_`** — via Prisma `@@map`.

4. **Migrations prefixed `chatbot_`** in their filename, e.g.
   `20260520000000_chatbot_init`.

5. **Environment variables prefixed `CHATBOT_`** in `.env`.

6. **Types live inside the module** — `Organization` from Logic Core is
   received as `{ id: string }` minimal interface, never imported as
   `import { Organization } from '@prisma/client'` inside the module.

## Tech Stack

- LLM: Google Gemini 2.5 Flash via @ai-sdk/google (provider-agnostic factory)
- Streaming: Vercel AI SDK (`streamText`, `useChat`)
- DB: Prisma (shared with Logic Core), tables prefixed `chatbot_`
- UI: Tailwind v4 + Framer Motion (`motion` package) + R3F
- Validation: Zod schemas in tool calling

## Architecture Overview

### Public endpoints
- `POST /api/chatbot/[botSlug]/chat` — streaming chat
- `GET /api/chatbot/[botSlug]/config` — bot config (cached HTTP 5min)
- `POST /api/chatbot/[botSlug]/lead` — internal, called via tool calling

### Admin pages (in Logic Core)
- `/admin/chatbot/knowledge` — KB editor per org
- `/admin/chatbot/config` — bot config editor per org

### Dashboard pages (in Logic Core)
- `/dashboard/leads` — captured leads view

## How to Extract This Module (Phase 1.5+)

When the time comes to move this to its own repo or monorepo workspace:

1. Move `src/modules/chatbot/` to the new location.
2. Move the Prisma models prefixed `chatbot_` to the new schema (or
   keep them in shared DB and connect via Prisma client).
3. Move the API routes `src/app/api/chatbot/*` to the new app.
4. Update import paths.
5. Add the `Organization` minimal interface explicitly (currently
   received as parameter).
6. Set up subdomain `chatbot.develop.com.ar` for the new app.

All references to `Organization` are already abstracted as minimal
interfaces, so this should be a "move folders + fix paths" operation,
not a rewrite.

## Database Schema

The module owns 6 tables, all prefixed `chatbot_` in the database:

| Table | Purpose |
|-------|---------|
| `chatbot_bot_config` | Per-org bot configuration (identity, theming, LLM, quota) |
| `chatbot_knowledge_base` | Markdown sections (business info, FAQ, policies, etc.) |
| `chatbot_conversation` | Anonymous session-based chat sessions |
| `chatbot_message` | Individual messages within conversations |
| `chatbot_lead` | Leads captured via tool calling |
| `chatbot_quota_usage` | Monthly usage tracking per bot |

The module also modifies `Organization` (Logic Core) to add a relation
to `BotConfig`. This is the only cross-module change in the database.

### Seeding

The module includes its own seed script independent from Logic Core:

```bash
npx tsx src/modules/chatbot/prisma/seed.ts
```

The seed is idempotent (uses upserts) and creates/updates the `develop`
bot with realistic data. Run it after every schema change.

## Module Status

- Sprint S0: Module skeleton created. No functionality yet.
- See `docs/chatbot-sprints.md` for detailed sprint plan.

## Deferred Decisions

The following architectural decisions were deliberately deferred from
the MVP to keep scope manageable. They are documented here so future
contributors don't reimplement or remove them by mistake.

### Multi-key support per organization (Scenario A)

**Status:** Deferred to Phase 1.5.

**What:** Each `BotConfig` would have its own (encrypted) `llmApiKey`
field, so develOP can distribute load across multiple Google AI Studio
API keys (one per client). This isolates abuse, simplifies per-client
billing visibility, and lets Google's per-key quotas act as a hard backstop.

**Why deferred:** MVP has only one client (develOP itself). The current
implementation reads `CHATBOT_GOOGLE_API_KEY` from env vars globally,
which is sufficient. Adding multi-key now would require:

- New encrypted field in `BotConfig`
- Refactor of `GoogleProvider` to accept per-instance keys
- Admin UI for key management
- Encryption key rotation strategy

That's 1-2 sprints of work for zero current benefit.

**When to revisit:** When the second real client is onboarded, OR when
any single client's traffic justifies dedicated quota.

**How to implement when needed:** Add `llmApiKey String?` to `BotConfig`
schema, store encrypted with the same approach as the credentials vault
in Logic Core. Update `getLLMProvider()` factory to accept the BotConfig
and use its key if present, fall back to env var otherwise.

## Testing the chat endpoint

Once the API key is configured in `.env.local`, you can test the
endpoint manually:

```bash
# Start dev server
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/chatbot/develop/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Hola, ¿qué servicios ofrecen?" }
    ],
    "sessionId": "manual-test-001",
    "currentPath": "/"
  }'
```

Expected: SSE stream with the assistant's response. After it
finishes, check directly with Prisma Studio (`npx prisma studio`)
or query the BD:

```sql
SELECT * FROM chatbot_conversation WHERE "sessionId" = 'manual-test-001';
```
