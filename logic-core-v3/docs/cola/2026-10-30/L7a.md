# L7a · The three service pages

Lane A. Model: **Opus 5.5, high effort**. Budget: ~3 h.

## Context
The services chat already built a V1 of the «Desarrollo web» page on branch `paginas/servicios` (worktree `C:\paginas-servicios`, which you never touch: read the branch with git only). It has the night scene with the blue accent and its own scene variant, plus content blocks. That branch is older than the current home: its code may target APIs that changed (B12a, the base page, the closing, the FAQ, the trip from the home's «Leer más…»).

## Items
1. **Bring the V1 over.** Inspect `paginas/servicios` with `git log`, `git diff rediseno/home...paginas/servicios --stat` and `git show`. Bring its files into this branch with `git checkout paginas/servicios -- <path>` (only the services-owned paths: `src/app/v3/[servicio]/`, `src/app/v3/_servicios/`, `public/servicios/`, `docs/servicios/`, `scripts-servicios/`, and its line in `_variantes/registro.ts`). This creates files; it does not discard work. Never merge that branch. Then adapt the code to the current base page APIs. Anything you can't bring cleanly: rewrite it on top of the base, and log it.
2. **One page, three colors.** Desarrollo web keeps its working blue variant. Software a medida and Integraciones con IA are **the same page and the same variant with their own accent** (violet and green, the theme tokens; never hand-written hex). No new variants. Night scene on all three. The intro is about one screen and moves on quickly.
3. **The content, expanded.** Start from the V1 blocks (the problem, the solution, how we work, the "desde" price from `PRECIOS_DESDE`, cases, FAQ). Expand them with more substance for each service: what's included, typical examples for small businesses, how the process goes, what the client gets at the end, what happens after delivery. Base it on the home's service texts (cola 2 `05-TEXTOS.md`, section Servicios) and the V1. No invented clients, numbers or guarantees. Cases: today all three portfolio projects are web projects, so the software and IA pages don't show them as their own; give those pages an honest «Lo que podemos construir» block instead. Each page has its own 6-question FAQ in the closing.
4. **The rename:** the third service is called **«Integraciones con IA»** everywhere: its page, `h1`, title, metadata, the navbar dropdown, the recommender's link, the footer and any other place that shows the old «IA y automatizaciones». The home section keeps its long two-line title «Integraciones con / *inteligencia artificial*». **The URL slug does not change.**
5. **The trip and the links:** the home's «Leer más…», each service title and video, the navbar dropdown and the recommender's «Ver la página de…» land on the right page, with the trip from the home (night falls, the camera arrives) and the veil for every other navigation. The three pages no longer 404 (the cola 2 report found them missing in the build).

6. **New defaults on the home's Servicios section (Valentino's choice, 2026-10-29).** `?aro-color` default becomes `tercios` (was `ola`) and `?titulo-cursiva` default becomes `3` (was `1`). The other values stay available as flags. Update only the tests and registries that assert those defaults, log them, and take one screenshot of the home's Servicios section at 1440 with the new defaults. If `?titulo-servicio` or `?fuente-servicio` still do anything, remove them and log it.

6. **Aro y título elegidos por Valentino (2026-10-30):** en las tres páginas de servicio el aro de nanobots va en `?aro-color=tercios` (el aro dividido en tres arcos, uno por servicio) y la cursiva del título en `?titulo-cursiva=3`. Dejarlos como valor por defecto. Las banderas de L3 que no se usen se borran.
7. **Nanobots, primer slide:** si Valentino manda la captura del problema de los nanobots en el primer slide antes de que termine el lote, se atiende acá. Si no llegó, no se toca.

## Verification
Per 00-L7-COMMON, plus: `viaje.ts` green for the three services; the navbar dropdown opens each page; screenshots of the three intros side by side at 1440 (to compare the colors).
