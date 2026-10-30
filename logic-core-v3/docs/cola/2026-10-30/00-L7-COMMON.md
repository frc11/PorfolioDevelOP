# L7 · The site's pages · common rules

The home is closed (cola 3 merged into `rediseno/home`). L7 builds the BASE of every other page of the v3 site from `/v3/pagina-base`. "Base" means: real structure, real effects and real generic content (no brackets, no `[TEXTO]`, no lorem ipsum). Valentino will refine content later, page by page.

## Read first
1. `docs/cola/2026-10-28/00-COMMON.md`: every hard rule, the Windows safety rules and the lot workflow apply as written there, with the overrides below.
2. `docs/cola/2026-10-30/ESTRUCTURA-PAGINAS.md`: what each page contains, in Valentino's words (Spanish). **His words win** over the lot files if they ever disagree.
3. Your lot file (`L7a.md` … `L7d.md`).
4. `/v3/pagina-base` and its code, `docs/rediseno/B12a-API.md` (how a page mounts the intro, the scene preset, the closing and its FAQ), `.claude/skills/pagina-home-based/`.

## Overrides to 00-COMMON
- **Lanes:** lane A is `C:\nocturno\cola3` on branch `l7/a` (lot L7a, dev port 3002). Lane B is `C:\nocturno\cola3b` on branch `l7/b` (lots L7b → L7c → L7d, in that order, dev port 3003). Push only your own lane's branch. Never touch the other lane's folder.
- **The shared lock** between lanes: before any heavy step (tsc, big lint, test suites, dev server, Chrome, verificar, build) run `mkdir C:\nocturno\.turno-cola3` (if it fails, wait 30 s and retry), write who and when in a `dueno.txt` inside, and remove the folder when the heavy step ends.
- **State:** lane A writes `docs/cola/2026-10-30/ESTADO-a.md`, lane B writes `ESTADO-b.md`. Each lot writes `L7x-plan.md` (short, 15–30 lines) and `L7x-resultado.md`, plus the marker `L7x-TERMINADO`.
- **Independent review** only at the end of each lane: L7a, and L7d (which reviews L7b–L7d together).
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
