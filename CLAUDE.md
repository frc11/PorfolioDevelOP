# CLAUDE.md — develOP / Logic Core v3

Last updated: May 2026 | Stack: Next.js 16 · TypeScript strict · Tailwind 4 · Framer Motion · Three.js/R3F · Prisma · Neon PostgreSQL · NextAuth v5

---

> El método de trabajo de develOP (WF) vive en `WF/`. Comportamiento: `WF/cimiento.md`. Referencia: `WF/manual-resumido.md` (+ `WF/manual.md` completo). Apertura/cierre de chats: `WF/kit-continuidad.md`.

---

## Non-negotiable rules

Never run `prisma migrate reset` — stop and report to user instead.
Never use `any` in TypeScript. Zero exceptions.
Never modify `src/components/3d/HeroArtifact.tsx`. It is frozen.
Never use `router.push()` directly — always use `triggerTransition()` from TransitionContext.
Never self-confirm a sprint works because it compiles. User verifies.
Never touch files outside the current sprint scope.
Never hardcode secrets, API keys, or credentials in code.
Never expose internal error messages or stack traces to the client.
Never add a dependency without first checking if a native or already-installed alternative exists.

---

## Quality baseline (every component, no exceptions)

Components that fetch data must have loading, error, and empty states.
Forms must have client-side and server-side validation with visible feedback.
Destructive actions require confirmation dialogs.
No blank screens — skeleton loaders or spinners always.
Aria-labels on all icon-only elements. WCAG AA contrast minimum.

---

## Architecture before code (anti-vibecode policy)

Before writing implementation, always:
1. Read the relevant files in the sprint scope.
2. Identify what components, hooks, and server actions already exist.
3. Verify no logic duplication.
4. Propose file structure before creating files.

Signs of vibecode — prohibited:
- Component over 300 lines without separation of concerns.
- Business logic inside UI components.
- Direct fetch inside components when a Server Action exists or should exist.
- Prop drilling beyond 2 levels when a context is available.
- Inline CSS when a Tailwind class exists.

---

## Security (non-optional, every sprint)

Validate and sanitize all inputs with Zod in every Server Action.
Verify session and role in every Server Action and API Route — middleware alone is not enough.
Rate-limit all public endpoints and form submissions.
Use Prisma for all queries. No raw SQL without parameterized inputs.
Never log environment variable values.

---

## Performance

`will-change: transform` on all complex animated elements.
Always `next/image`. Use `priority` only above-the-fold.
`IntersectionObserver` on all heavy animations — pause when out of viewport.
Three.js: `dpr={[1, 1.5]}` max. Never `dpr={2}` in production.
Server Components by default. Client Components only when real interactivity is required.

---

## Stack conventions


```ts
// Framer Motion — section reveal
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}

// Spring — icons
{ type: 'spring', stiffness: 400, damping: 15 }

// Spring — dock/UI
{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }
```



Lucide React: always `strokeWidth={1.5}`. No exceptions.
AnimatePresence: always `mode="wait"` for state transitions.
Glassmorphism: `bg-white/[0.04] backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/[0.08]`

Service accent colors (do not change):
- Web Dev → Cyan `#06b6d4`
- AI → Violet `#8b5cf6`
- Automation → Green `#10b981`
- Software → Amber `#f59e0b`

---

## Auth and multi-tenancy

Roles: `SUPER_ADMIN` → `/admin/*` | `ORG_MEMBER` / `CLIENT` → `/dashboard/*`
Always filter Prisma queries by `organizationId`. Never return cross-tenant data.
Never expose internal DB IDs in URLs — use slugs or tokens.

---

## Sprint protocol

Before starting: read scope files, run `npm run build`, run `npx prisma migrate status`.
During: one objective per sprint. If something is out of scope, note it and report — do not implement.
After: report modified/created files and any out-of-scope findings. Do not self-verify.

Post-sprint verification (always):

```bash
npm run build
npx prisma migrate status
```


---

## Subagentes

Estándar permanente — no opcional. Los subagentes corren en su propia ventana de contexto (no inflan la del padre) y son read-only. Solo el agente padre escribe código.

- **Descubrimiento** (mapear schema/rutas/tools/estado antes de tocar código): usar el subagente built-in `Explore`. El padre espera su mapa antes de planificar.
- **Verificación de UI** (cualquier sprint que toque pantallas): despachar el subagente `visual-qa` contra las rutas tocadas, desktop + mobile. El padre ESPERA su reporte. Si reporta ❌ ROTO/BUG → no cerrar el sprint. Si reporta ❓ A CONFIRMAR → flag al humano, no asumir.
- **Batería de regresión** (cuando exista el subagente `regression-runner`): delegar la corrida — async, no bloquea contexto del padre. Hasta que exista, correr la batería directo.

---

## Frozen files

| File | Rule |
|------|------|
| `src/components/3d/HeroArtifact.tsx` | Never modify |
| `src/context/TransitionContext.tsx` | Always use `triggerTransition()` |
| `src/context/PreloaderContext.tsx` | Do not break the phase flow |
| `prisma/schema.prisma` | `migrate reset` is prohibited |

---

## Lessons learned

**Prisma migrate reset [Apr 2026]**
Ran `migrate reset` during development. Lost seed data, broke relations. 5 hours of recovery. Rule: stop and report on any migration conflict.

**Three.js scale 0→0.007 in useFrame [Apr 2026]**
Animating scale from 0 in the render loop causes visible lag on load. Fix: initialize at final scale, animate opacity on the wrapper only.

**getBoundingClientRect() with active CSS transforms [Apr 2026]**
Returns incorrect coordinates when transforms are applied. Fix: temporarily reset transform before measuring.

**Framer Motion pathLength on complex SVGs [Apr 2026]**
Too expensive on high-point paths. Fix: use `strokeDashoffset` with native `getTotalLength()`.

---

*Update this file when Claude makes a correctable mistake. Add the rule that prevents it. Prune entries that no longer apply.*
