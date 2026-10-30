# L7 · The site's pages · common rules

The home is closed (cola 3 merged into `rediseno/home`). L7 builds the BASE of every other page of the v3 site from `/v3/pagina-base`. "Base" means: real structure, real effects and real generic content (no brackets, no `[TEXTO]`, no lorem ipsum). Valentino will refine content later, page by page.

## Read first
1. `docs/cola/2026-10-28/00-COMMON.md`: every hard rule, the Windows safety rules and the lot workflow apply as written there, with the overrides below.
2. `docs/cola/2026-10-30/ESTRUCTURA-PAGINAS.md`: what each page contains, in Valentino's words (Spanish). **His words win** over the lot files if they ever disagree.
3. Your lot file (`L7a.md` … `L7f.md`).
4. `/v3/pagina-base` and its code, `docs/rediseno/B12a-API.md` (how a page mounts the intro, the scene preset, the closing and its FAQ), `.claude/skills/pagina-home-based/`.

## Overrides to 00-COMMON
- **Four lanes run tonight, in parallel.** Each one is a worktree of its own, on a branch of its own, with a dev port of its own. **Never touch another lane's folder, branch or port.** Push only your own branch.

| lane / session | worktree | branch | port | lots | model |
|---|---|---|---|---|---|
| ~~A~~ | `C:\nocturno\cola3` | `l7/a` | 3002 | L7a — **done** | Opus high |
| ~~B~~ | `C:\nocturno\cola3b` | `l7/b` | 3003 | L7b, L7c, L7d — **done, with gaps** | Sonnet medium |
| INT | `C:\nocturno\cola3` | `l7/a` | 3002 | L7-INT, then L7g | Opus high / Sonnet high |
| C | `C:\nocturno\cola3c` | `l7/lab` | 3004 | L7e | Opus high |
| D | `C:\nocturno\cola3d` | `l7/aud` | 3005 | L7f (after INT, off the integrated branch) | Sonnet high |

- **Write boundaries.** Lane C writes only under `src/app/v3/laboratorio/**`, `docs/ideas/**` and `public/v3/laboratorio/**`. Lane D writes only `docs/cola/2026-10-30/AUDITORIA-D.md` and `docs/cola/2026-10-30/auditoria/**`. Lanes A and B own the real pages: A owns the service pages and the home's Servicios section, B owns Nosotros, Portfolio, the blog, the legal pages, the 404 and the footer. If your lot sends you outside your own boundary, write the proposal down and don't make the change.
- **The shared lock**, now between four lanes: before any heavy step (tsc, a big lint, test suites, a dev server, Chrome, `verificar`, a build) run `mkdir C:\nocturno\.turno-cola3`. If it fails, wait 30 s and retry. Write who you are and the time into `dueno.txt` inside it, and remove the folder the moment the heavy step ends. **Hold it for as little as possible** — with four lanes waiting, a lock held through a long stretch of work blocks the whole night. Batch your heavy steps instead of taking the lock over and over.
- **A stale lock.** If `dueno.txt` says the lock was taken more than 45 minutes ago, the lane that took it probably died. Check whether its dev port answers; if it doesn't, delete the folder, take the lock yourself, and log that you stole it and from whom.
- **Memory.** The machine is dedicated to these four lanes tonight, with no other dev server and no other browser. Close Chrome when a verification burst ends instead of leaving it open — the WebGL leak accumulates all night and four lanes fill the nonpaged pool much faster than one. If Chrome gets slow or a launch fails for memory, close it and reopen it rather than pushing on. **Never kill a process by name**; only by the PID you started. Stop your dev server by PID before you finish.
- **State:** lane A writes `docs/cola/2026-10-30/ESTADO-a.md`, lane B `ESTADO-b.md`, lane C `ESTADO-c.md`, lane D `ESTADO-d.md`. Each lot writes `L7x-plan.md` (short, 15–30 lines) and `L7x-resultado.md`, plus the marker `L7x-TERMINADO`. **Commit often** — the night may be cut off at any point, and anything uncommitted is lost.
- **Independent review** only at the end of lanes A and B (L7a, and L7d which reviews L7b–L7d together). Lanes C and D don't need it.
- **Nobody is awake.** Do not ask questions: take the most reasonable reading, write the decision down in your result file, and carry on. The one exception is a decision that can't be undone and could sensibly go either way — do the work around it, write it up, and leave it for Valentino.
- **Assets:** Valentino's files are in `C:\nocturno\l7-assets\`. Copy what you use into `public/v3/<page>/`, optimized as webp. Never reference that folder from code.

## What every page shares
- The structure: an intro with the scene (about ONE screen, little animation, it moves on quickly) → a body on paper → the closing (Seis razones → CTA → footer → that page's own FAQ, 6 questions). Exceptions: the legal pages (no scene) and the 404.
- **Day scene** on every page except the three service pages (night, with their accent).
- One `h1` per page, the same text as the 3D title (P-H13). Real `<title>` and description metadata per page, in Spanish.
- Reuse the home's pieces and effects; never copy them: titles that paint in, bodies that rise from below, `Cta`/`CtaEnlace`, `EstadoDeEnvio`, `AvisoDeScroll`, `Reluciente`, the forms standard, `TituloDeVolumen` with the pages preset.
- The routes live under `/v3` for now: `/v3/nosotros`, `/v3/portfolio`, `/v3/blog`, `/v3/blog/[slug]`, `/v3/privacidad`, `/v3/terminos`, the three service pages (their existing slugs) and the 404.
- Phone/tablet (≤768) follow the home's phone rules (title effects not disabled; nothing overflows at 320).
- Copy for users: Spanish, rioplatense ("vos"), clear, for non-technical small-business owners, no agency jargon, no AI tells, no invented numbers, clients or awards. Facts about develOP come only from `ESTRUCTURA-PAGINAS.md`, `05-TEXTOS.md` of cola 2, `PROYECTOS`, `PRECIOS_DESDE` and the home's existing copy.
- The navigation model: the navbar does not change (except the service rename in L7a). The pages are reached from the footer, from links at the end of the matching home sections, and from each other (L7d wires this).

## Verification for every page
At 1440, 1024, 768 and 390: it loads with no console errors, the intro → body → closing order works going down and up, nothing overflows, the `h1` is right, the FAQ opens. One screenshot per page per width in `C:\nocturno\cola3-fotos\L7\<page>\`.
