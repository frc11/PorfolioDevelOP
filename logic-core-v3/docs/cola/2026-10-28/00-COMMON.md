# Cola 3 · common rules for every lot (L1–L6)

You are a Claude Code session building ONE lot of fixes on the develOP v3 home. This session never saw the planning chat: everything you need is in this folder. Valentino is reachable but you do not ask him technical questions: decide, and write the decision in your result file. Stop only for a one-way decision (see "Stop and ask").

## Where you work
- Git root `C:\rediseno-home` is NOT where you work. Work ONLY in the worktree `C:\nocturno\cola3` (app in `C:\nocturno\cola3\logic-core-v3`), branch `cola3/2026-10-28`. All lots run one after another on this same branch (one lane).
- Never `main`, never merge, never rebase, never `reset`, never `push --force`, never a PR, never `git add .` (always add by name), never `stash`, never `checkout`/`switch`/`restore` that discards work. `lente.ts` never goes into a commit.
- Screenshots of Valentino's review: `C:\nocturno\cola3-capturas\lote1\NN.png` and `lote2\NN.png` (index in `REVISION-3.md`). Open the ones your lot cites.
- Your evidence screenshots go to `C:\nocturno\cola3-fotos\L<n>\` (outside the repo).

## Read first, in this order
1. `docs/cola/2026-10-28/ESTADO.md` — what previous lots did. Check it against `git log --oneline -15` and `git status`; if they disagree, write it down and trust git.
2. `docs/cola/2026-10-28/REVISION-3.md` — Valentino's own words (Spanish, verbatim). **His words win over the lot file** if they ever disagree.
3. Your lot file `docs/cola/2026-10-28/L<n>.md`.
4. `.claude/skills/pagina-home-based/` (SKILL.md, GUSTO.md, METODO.md) and `docs/rediseno/B12a-API.md`.
5. The existing code you will touch. Read before creating; never duplicate logic; import shared pieces (`EstadoDeEnvio`, `AvisoDeScroll`, `Reluciente`, the autofill fix, `CtaEnlace`, the title effects).

## Hard rules
- Frozen, untouched: `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `schema.prisma`, `auth.ts`, `lib/prisma.ts`, `src/components/ui/*`.
- Zero `any`. Never `router.push` (navigation with `<Link>`). Never `prisma migrate reset`. No secrets in code.
- `src/modules/**`, `src/lib/**` and `src/app/api/**` are shared with the live site: do not change what they render or return. The chatbot is styled only through its `overrides` prop.
- Tests never hit a real `/api/` route (`page.route` interception). Only exception: L6's login test, with the test account read from `.env.local` (`E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`). Never print, log, commit or screenshot those values.
- Never weaken an existing test. If this lot changed the spec a test encodes, update the test and say so in the result file.
- User-facing text is Spanish (rioplatense, "vos"), short, no agency jargon. Text Valentino wrote goes in exactly as he wrote it, with spelling fixed.
- Tablet (768–1023) behaves like the phone unless the lot says otherwise. The desktop navbar starts at 769 px (L1 changes this; later lots assume it).
- Title entrance effects are NOT disabled on mobile; only `prefers-reduced-motion` simplifies them.

## Windows safety (measured incidents)
- Kill processes only by the PID of a process you started. Never by name (`taskkill /IM`, `Stop-Process -Name`, `pkill`).
- A rule that blocks something in Bash also blocks it in PowerShell.
- One command per tool call. No `cmd1 | cmd2 && cmd3` chains in unattended mode.
- Never start a server in the foreground. Dev server: background, port **3002** (3000 is Valentino's, 3001 is the services worktree), check it answers, stop it by its PID when the lot ends.
- Long output (tests, benches, builds): write it to a file, read only the head, the tail and the error lines.
- Heavy work one at a time: `tsc` (with `NODE_OPTIONS=--max-old-space-size=4096`), big ESLint runs, test suites, the dev server and Chrome never in parallel.
- Disk: before any bench or build, ≥ 5 GB free on C:. Every bench deletes its own Chrome profile / temp folder when it ends (`%USERPROFILE%\.cache\b4-medicion` once reached 100 GB). Delete only folders your own bench created.
- No new npm dependency, no third-party skill/MCP/script. If you think you need one, write it in the result file and find another way.
- Never read `~/.claude`, `AppData` or folders outside `C:\nocturno\cola3`, `C:\nocturno\cola3-capturas`, `C:\nocturno\cola3-fotos` and `C:\rediseno-home\logic-core-v3\node_modules`.

## The lot workflow
1. **Plan file** `docs/cola/2026-10-28/L<n>-plan.md`, before building:
   - per item: what is done and when it counts as done; effort; how it is verified (command, test or screenshot at which width);
   - implications (what the request implies even if unsaid: tests, docs, flags, heights/`TRAMO_ESTIRADO`, other sections affected), what is optional, what is out of scope;
   - the gate: the exact commands and one observable acceptance criterion per item;
   - a premortem paragraph ("next week this lot failed: why?") and fix the plan with what it finds.
   - Name the cases the tests must cover one by one; when a rule has branches (widths, states), one test per value.
2. **Build**, committing by name in small commits.
3. **Gate:** lint clean on touched files; `tsc --noEmit` with 0 new errors; the lot's tests, each with a control that turns it red when the fix is removed (break the code on purpose: the new test must fail); the test count does not drop against the base; then **in the browser** (dev :3002, Playwright/Chrome) the visual criteria at the widths the lot lists, with screenshots; then the home smoke (wheel and burst into Portfolio, to Demos and back, at 1440 and 390).
4. **Independent review:** one Sonnet subagent that did not build the lot. It reads only `git diff` of this lot, the lot file and `REVISION-3.md`, and reviews through four lenses (security, UX, UI, code and tests). Every finding must come with a proof (a command or a case). Fix the real findings; dismiss the rest with the reason.
5. **Close:** `git push origin cola3/2026-10-28` (plain push). Write `docs/cola/2026-10-28/L<n>-resultado.md` in Spanish:
   - per item: hecho / no hecho / parcial, with evidence paths (test names, screenshot files, measured numbers). Anything that did not run is "no verificado";
   - decisions taken alone, numbered `L<n>-1`, `L<n>-2`…;
   - "Supuestos y descartes:", one line each;
   - "Qué tiene que mirar Valentino": at most 4 items (URL, width, action, what he should see) and the flags with their default.
   Update `ESTADO.md` (append, short), create the empty marker `docs/cola/2026-10-28/L<n>-TERMINADO`, commit both by name and push.
6. Final message in the terminal: at most 8 lines, Spanish, line 1 = outcome.

## Gate red twice
If the gate is red, fix and rerun once with the red line written in your plan. A second red on the same item: mark it "no hecho" with the reason and move on to the next item. Never loop.

## Stop and ask (one-way decisions only)
Deleting real data, touching the database, changing what the live site renders, touching a frozen file, changing auth configuration, sending anything to a real person. Stop, write the options in the result file (including "don't do it" and the smallest version, your recommendation, how each is undone) and tell Valentino in one line.

## Budget
Each lot states its budget. If you are close to it, stop building new items, run the gate on what is built, and close properly (step 5).
