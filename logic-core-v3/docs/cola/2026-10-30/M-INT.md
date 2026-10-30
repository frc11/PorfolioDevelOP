# M-INT · Integrar los cuatro: L7g + M1 + M2 + M3

One session, worktree `C:\nocturno\cola3`, branch `l7/a`, dev port 3002. Model: **Opus 5.5, high effort**.

Four pieces of work were built in parallel against the same commit (`3d89b628`) and none of them has ever seen the others:
- **`l7/a`** already carries L7-INT and **L7g** (the footer's legal links, the home's discreet links, the faculty photo, the sound-wave guard, the 404 spacing, the width matrix).
- **`m/1`** — Nosotros, Portfolio, and the longer day intro.
- **`m/2`** — the blog, the note, the 404.
- **`m/3`** — the three service pages.

Valentino merges each branch by hand, one at a time, in the order below. **You never merge, reset, rebase, stash or force anything.** For each merge: resolve the conflicts, tell him the files are staged, and wait for him to commit before the next one. After the three merges, do the integration work.

## El mapa de colisiones que ya conocemos
Both sides of several of these are deliberate work, so a conflict here is almost never "pick one" — it's "make both true".

1. **Nosotros, la foto de la facultad — hecha dos veces.** L7g created `nosotros/FotoDeLaFacultad.tsx` plus the webp in `public/v3/nosotros/`; M1 built its own version that opens from a slit with the scroll and caps at 500 px. **M1's behaviour is the one Valentino approved** (prototype 2). Keep M1's presentation; keep whichever file layout is cleaner; don't end up with two components doing the same thing or two copies of the image.
2. **Nosotros, el resto.** L7g touched `nosotros/HistoriaYEquipo.tsx`, `nosotros/contenido.ts` and `_secciones/quienes-somos/equipo.tsx`; M1 rewrote the story, the team and «Cómo trabajamos». M1's version is the newer design; make sure nothing L7g fixed there is lost.
3. **La 404 — hecha dos veces.** L7g fixed its spacing in `not-found.tsx` (the text sat −9 px from the logo at 1440 and −59 px at 1920; it set both to 43 px). M2 rebuilt the whole 404 with the form's error animation and sound, and made it wait for the preloader. **Keep M2's animation and M2's gating, and keep L7g's spacing fix** — check the 43 px still holds at 1440 and 1920 after the merge.
4. **`CierreDeLaPagina.tsx` / `overflow-x-clip`.** L7g clipped the shared closing to fix the «HABLANOS» overflow at 320 and 390; M1 added the same clip to the `<main>` of Nosotros and Portfolio. Make sure the result clips once in the right place and nothing else got clipped by accident (a clip can swallow a sticky element — check M3's sticky job menu and the legal index).
5. **La intro larga contra el blog.** M1 made the day intro 3,4 screens and says Nosotros, Portfolio **and the blog index** get it; M2 rebuilt the blog index on the old 1,8 base. After the merge, the blog index and the notes must have exactly one intro, the long one, and a note without its own block keeps the short one (M1's rule).
6. **`_estilos/banda.css`.** L7g modified it; M3 found that **below 1024 it paints every stroke in the site the colour of the paper** and worked around it inside its own component. Fix the rule itself now, narrowly, and remove M3's local workaround if the fix makes it redundant. M3's proposal is in `M3-resultado.md`.
7. **`package.json`.** Three new test scripts were deliberately left out to avoid conflicting: `s92-m1` (M1), `test:m2-blog` (M2) and whatever M3 proposes. Add all of them now and wire them into `verificar`.
8. **Los anchos.** M1 settled item 0: the real pages are **not** centred — the narrow column Valentino saw was the laboratory's own `mx-auto max-w-*` wrappers. Nothing to change. Say so in the result so it stops coming back.

## Daños a buscar que nadie reportó
The last integration found three real problems neither lane had seen, all of them where one lane's text or markup contradicted another's. Look there again: the footer and the navbar naming the pages, the `h1` of every page, landmarks and the «saltar al contenido» path, and any copy that names a page or a service by an old name.

## Los desbordes pendientes
M1 measured, on its own branch, that **the blog index overflows by 32 px at 390 and the note by 3 px**. That's M2's territory and M2's own bench reported 36/36 at 390, so the two branches disagree. Measure it yourself after the merge and fix it with the same clip M1 used, or find the real cause.

## El gate, sobre lo fusionado
- `tsc --noEmit` with no new errors; lint clean on everything the merge touched.
- `npm run verificar` complete. **Build first** — several groups (s1, s2, s3, s5 and parts of s4, s7, s8) only pass with a production build present, which is why M3 saw them red. Compare claim by claim against `rediseno/home` built, and say plainly which failures are baseline and which are new.
- **The production build.** No lane ran it on the merged tree. M2 found it needs more memory than the default: `--max-old-space-size=6144`. Run it, and report its errors classified as baseline or new. L7-INT reported one new regression, `s7-compuerta` (+2,8 KiB on `/v3`'s initial load); check whether it got worse.
- A pass over **every page** at 1440 and 390, down and up: no console errors, intro → body → closing in both directions, the `h1`, the FAQ, the footer. Use `scripts-carga/l7-int-humo.ts` and the lanes' own benches rather than writing new ones.

## Cerrá con
`M-INT-resultado.md`: what collided, what you fixed, what you found that nobody reported, the gate's numbers, and — separately — **the list of what is still pending for Valentino**, including the footer logo (L7g item 1, with its plan in `L7g-resultado.md`), the nanobots screenshot, the `noindex`/`robots.ts` question for launch, and anything each lane left as a proposal.

The lock is yours alone today. Stop your dev server by PID at the end.
