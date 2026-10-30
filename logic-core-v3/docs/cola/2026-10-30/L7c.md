# L7c · The blog

Lane B, second lot. Model: **Sonnet 5.5, medium effort**. Budget: ~3 h.

## Where the notes live
As typed data files in the repo (for example `src/app/v3/blog/_notas/<slug>.ts`, or MDX if the project already supports it; do not add a dependency for it): title, slug, summary, date, reading time, cover, body. No database. (Decision taken by the planner; the panel may manage notes later.)

## The index (`/v3/blog`, day)
1. **A full-width carousel of featured notes:** the note occupies the whole width of the section: cover image, title, short summary; clicking enters the note. It auto-advances (pause on hover and on focus; respect `prefers-reduced-motion`) and has arrows to move it by hand, plus progress bars like the home's carousels. The 3 featured notes are notes 1–3 below.
2. **Below, every note**, laid out like the home's OLD «Tu panel» section (before B6), with cards placed irregularly rather than in a rigid grid: find that layout in git history and reuse its idea, not its code if it's gone.
3. No categories. CTA and the closing (FAQ about the blog is pointless: give it 6 general questions about develOP, the same as the home's).

## The note page (`/v3/blog/[slug]`)
Short day intro with the note's title as the 3D/`h1` title; body in a narrow reading column with the site's body type, good line-height, subheadings; the date and reading time; "Notas relacionadas" (2–3 cards); CTA; the closing. `generateStaticParams` and per-note metadata (title, description, Open Graph).

## The six notes
Write them in Spanish (rioplatense, "vos"), for non-technical small-business owners in Argentina, 700–1000 words each, useful and concrete, with subheadings. No invented statistics, surveys or client stories; no external links. When a price matters, use only develOP's `PRECIOS_DESDE` and describe what makes a project cost more or less. Each one ends with a short soft call to talk to develOP. Valentino will rewrite them later with his own voice.
1. «¿Necesito página web o me alcanza con Instagram?»
2. «Qué es un chatbot con IA y cuándo le conviene a una pyme»
3. «Cuánto cuesta una página web en Argentina y de qué depende»
4. «5 tareas que tu negocio puede automatizar hoy»
5. «Por qué tu página tarda en cargar y cuánto te cuesta»
6. «Software a medida vs. planillas: cuándo dar el salto»
**Covers:** no stock photos. Make typographic covers in the site's style (the title or a key word, black/paper/the service accent, simple shapes), generated as components or static images in `public/v3/blog/`.

## Verification
Per 00-L7-COMMON. Also: the carousel auto-advances, pauses on hover, arrows work, reduced motion stops it; each note page builds statically; related notes link correctly.
