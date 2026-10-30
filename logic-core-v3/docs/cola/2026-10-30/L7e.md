# L7e · El laboratorio: ideas y efectos para las páginas nuevas

Lane C, the whole night (it has no second lot). Model: **Opus 5.5, high effort**. Budget: the whole lane.

This is the lot where you think instead of executing a list. Valentino's words: *«que trate de desarrollar algo, ideas, efectos, que Claude Code básicamente en toda la noche se me ponga a crear todo, pensando él, ideando él, sacando la idea del home ya terminado»*. He will wake up, walk through what you built, and pick. **What he picks gets wired into the real pages in a later lot — not by you.**

## The write boundary (hard rule, no exceptions)
You may create and edit files ONLY under these paths:
- `src/app/v3/laboratorio/**`
- `docs/ideas/**`
- `public/v3/laboratorio/**`

Everything else in the repo is **read-only for this lane**, including the home, the base page, the shared pieces, the tokens, the tests and `package.json`. You read them as much as you want; you never change them. Three other lanes are working on the same files tonight, and this rule is what keeps your branch merging cleanly. If an idea needs a change outside those paths, **write the change down in your doc as a proposal** and do not make it.

Also: nothing outside `laboratorio/` may import from `laboratorio/`. The dependency goes one way.

## Step 1 · Read the finished home and write down its voice
Go through the home as it stands after cola 3 (code and running in the browser): the intro, Quiénes somos, Portfolio, Demos, Servicios, the recommender, the Panel, Seis razones, the reviews ring, the CTA, the footer, the FAQ, the preloader, the trip to a service page and the veil.

Write `docs/ideas/VOZ-DEL-SITIO.md`: the inventory of what the home actually does — the effects and their names in the code, the real timings and easings (measure them, don't guess), how a title paints in, how a body rises, how the scene hands over to paper, how the camera moves, what the sound does, what the day and night scenes mean, which pieces are already shared and reusable. Then the part that matters: **the rules you can infer** — what makes this site feel like itself, and what it never does. End with what the home is still missing and where it repeats itself.

This doc is the foundation of everything below, and it is useful on its own: it's what the next chats and Franco will read.

## Step 2 · Propose the signature moments of each new page
For each page L7a–L7d are building tonight — the three services, Nosotros, Portfolio, Blog, a note, the legal pages, the 404 — propose **2–3 signature moments**: the one thing that would make that page memorable instead of the home's structure with other text.

Write them in `docs/ideas/MOMENTOS.md`, one section per page, and for each idea: what the visitor sees, why it belongs to THIS page, which of the home's mechanics it's derived from, roughly what it would cost to build, and what could go wrong. **Derive, don't invent from nowhere**: an idea that doesn't trace back to something the home already does is probably off-brand. Say so when one is a deliberate departure.

Rank them yourself at the end: what you would build first and why.

## Step 3 · Build the best ones as real prototypes
Build the strongest **8 to 12** ideas as standalone routes under `/v3/laboratorio/<slug>`, plus an index at `/v3/laboratorio` that lists every prototype with one line about what to look at. Each prototype:
- runs at 1440 and at 390, with no console errors;
- is self-contained, and reuses the home's pieces by **importing** them (never by copying code);
- has a short caption on screen saying what it is and what to watch;
- may be rough inside — this is a lab, not production — but it must not crash and must not depend on anything you were forbidden to change.
No new dependencies. No new fonts beyond what the site already loads.

Prefer the ideas Valentino can only judge by seeing them move. For the ones that are only worth describing, leave them in the doc.

## Step 4 · The morning walkthrough
Write `docs/ideas/COMO-MIRAR.md` in **Spanish**, for Valentino: the list of routes in the order he should open them, one or two lines each saying what to look at and what decision it's asking him for, and roughly how long the whole pass takes. Aim for a 20-minute walk. Put the ones you believe in first.

Take one screenshot of each prototype at 1440 and 390 into `C:\nocturno\cola3-fotos\L7\laboratorio\`.

## How to spend the night
Steps 1 and 2 before you build anything; they are what makes step 3 worth something. Then build, and keep building until the lane is cut off. **Commit after every prototype** so nothing is lost if the night ends badly, and keep `ESTADO-c.md` current with what is done and what you were in the middle of. Breadth beats polish here: ten real prototypes Valentino can judge are worth more than three finished ones.

If you run out of ideas worth building, don't pad the count — go deeper on `VOZ-DEL-SITIO.md` instead and say in `COMO-MIRAR.md` that you stopped on purpose.

## Verification
No gate for the prototypes beyond: `tsc --noEmit` with no new errors, lint clean on what you wrote, every route loads at 1440 and 390 with no console errors, and the index links to all of them. No test suites, no build. You do not need the independent review.
