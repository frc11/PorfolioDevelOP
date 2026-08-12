# CLAUDE.md — develOP / Logic Core v3

Last updated: May 2026 | Stack: Next.js 16 · TypeScript strict · Tailwind 4 · Framer Motion · Three.js/R3F · Prisma · Neon PostgreSQL · NextAuth v5

---

## Non-negotiable rules

Never run `prisma migrate reset` — stop and report to user instead.
Never use `any` in TypeScript. Zero exceptions.
Never modify `src/components/3d/HeroArtifact.tsx`. It is frozen.
**Navegación:**
- **Sitio público** (landing + marketing): usar siempre `triggerTransition()`
  de `TransitionContext`. Nunca `router.push()` en el sitio público.
- **Portales** (admin `/admin/*` y cliente `/dashboard/*`): usar `<Link>`
  cuando sea posible; `router.refresh()` para revalidar tras mutaciones;
  `redirect()` en server actions. `router.push()` en client component solo
  cuando la navegación es imperativa post-submit y no hay alternativa; en ese
  caso, documentar con un comentario inline el motivo. `triggerTransition()`
  no aplica en portales (el Shutter no existe ahí).
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

Service accent colors (do not change) — verificado contra `globals.css` y las landings:
- Web Dev → Cyan `#06b6d4`
- AI → Green/emerald `#10b981`
- Automation → Amber `#f59e0b`
- Software → Violet `#8b5cf6`

---

## Auth and multi-tenancy

Roles: `SUPER_ADMIN` → `/admin/*` | `ORG_MEMBER` / `CLIENT` → `/dashboard/*`
Always filter Prisma queries by `organizationId`. Never return cross-tenant data.
Never expose internal DB IDs in URLs — use slugs or tokens.

---

## Workflow (WF + ECC)

Este repo opera bajo el **método WF de develOP** con el **harness ECC** (instalado global, perfil minimal).

**Método WF.** Planificación con ritual antes de tocar código (leer scope, mapear lo existente, proponer estructura). Ejecución por **sprints atómicos**: un objetivo por sprint, una sola pasada. Lo fuera de scope se anota y se reporta — no se implementa. Detalle operativo del sprint abajo en **Sprint protocol**.

**Harness ECC.** Comandos del ciclo de calidad disponibles como slash-commands:
- `/harness-audit` — scorecard del repo (configuración del harness).
- `/quality-gate` — pipeline de calidad sobre un archivo o scope.
- `/code-review` — revisión de cambios locales o de un PR.
- `/security-scan` — superficies de agentes, hooks, MCP, permisos y secrets.
- `/build-fix` — fix incremental de errores de build/tipos.
- `/test-coverage` — análisis de cobertura y generación de tests faltantes.

> Los comandos se **detectan al iniciar sesión**. Tras instalar o agregar comandos al harness, abrir una **sesión nueva** para que aparezcan.

**Antes de cerrar trabajo**, pasar por el ciclo de calidad según corresponda al cambio (build/tipos → `/build-fix`; lógica nueva → `/code-review` + `/test-coverage`; código sensible → `/security-scan`). Complementa —no reemplaza— la verificación post-sprint de abajo.

**Convenciones.** Respetar las convenciones ya documentadas del repo: las reglas no-negociables, quality baseline, anti-vibecode, security, performance y stack conventions de **este `CLAUDE.md`**, y las convenciones de app detalladas en **`logic-core-v3/AGENTS.md`** (imports, iconos, animaciones, paleta, modelos Prisma, env vars, workflow de BD, formato de reporte). Lo marcado como intocable (tabla **Frozen files** y reglas no-negociables) no se toca.

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

**Select compartido con chevron — special cases [Jun 2026]**
`ticket-chat.tsx:110` y `TicketStatusSelector.tsx:31` NO fueron migrados al `<Select>` compartido. Ambos usan un `<Loader2>` condicional dentro de su propio `<div className="relative">` que ocupa el mismo espacio donde `<Select>` pondría el `<ChevronDown>` permanente — dos íconos se superponen cuando `isPending`. Patrón diferente al select de formulario: son status selectors con feedback de pending. Mantener como `<select>` nativo; si se mejora, considerar prop `icon` o un componente `StatusSelect` separado.

**EffectComposer sobre canvas transparente — cuadrado oscuro [Jun 2026]**
EffectComposer/Bloom sobre un `<Canvas>` con `gl={{ alpha: true }}` pinta un cuadrado oscuro del tamaño del canvas. Dos fixes a nivel shader, ambos correctos contra el GLSL instalado (restore de alfa post-blend y bloom con alfa 0), NO lo resolvieron en runtime — el alfa muere en los buffers internos del composer (Windows/ANGLE), inalcanzable desde shaders. Regla: en canvas chicos transparentes (avatares, widgets) NO usar EffectComposer — glow fingido con sprites additive (`CoreHalo.tsx` es el patrón de referencia). El composer queda solo para canvas opacos de página (Hero). Regla 2: si un fix es correcto en estático pero falla en runtime, buscar un discriminador empírico (acá: el avatar legacy sin composer era transparente) antes de re-intentar en la misma capa.

---

*Update this file when Claude makes a correctable mistake. Add the rule that prevents it. Prune entries that no longer apply.*
