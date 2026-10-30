# L7f · La auditoría previa al bloque D (sin tocar código)

Lane D, the whole night. Model: **Sonnet 5.5, high effort**. Budget: the whole lane.

Tomorrow Valentino does the technical pass (block D) and wants to finish the site this weekend. Tonight you turn that pass from a discovery job into a list of things to execute. **You change no source code at all.** The deliverable is the report.

## The write boundary (hard rule)
You may create files ONLY under:
- `docs/cola/2026-10-30/AUDITORIA-D.md` (the report)
- `docs/cola/2026-10-30/auditoria/**` (raw measurements, logs, lists)

Nothing else. Not a lint fix, not a typo, not a dead file deleted — three other lanes are editing this repo tonight. Every finding is written down with its exact `path:line` and a proposed fix, and left undone.

## What to audit
1. **The production build.** Run it. List every error and warning with its file, and classify each one: baseline (it was already there, name when it appeared if git tells you), or new. The build being red is expected; the point is knowing exactly why.
2. **The D7 cleanup inventory.** Find and list, with exact paths and a one-line proposed action each: dead flags (declared and never read, or read and never set), `lente.ts`, the measurement scripts, `dev*.log`, the untracked images folder, `scripts-portfolio/fuentes/`, the `pulido-*` tags, the archived tunnel, `C:\develop-pesado.lock\`, unused components, duplicated logic, `.cache` leftovers, anything else you find that is clearly residue. Mark each one **safe to delete mechanically** or **needs a decision**, and say why.
3. **SEO and GEO.** For the home and every `/v3` page that exists right now: `<title>`, description, canonical, Open Graph, `h1` count, `noindex`, structured data. Flag the service pages specifically — the plan says they ship with `noindex` and an overridden canonical today. Say what each page needs, page by page.
4. **Accessibility.** Contrast of real text against real backgrounds (measure, with the ratio), visible focus on every interactive element, heading order, landmarks, form labels and errors, and a full keyboard path through the home from the preloader to the footer: what you can't reach, what traps you, what has no name.
5. **Performance, measured.** Cold-start jank, the three.js footprint, the nonpaged-pool growth over a scripted session (this is the known WebGL leak — measure how fast it grows, don't try to fix it), every video in the repo with its bytes and dimensions and whether it's oversized for where it's used, the weight of the first load, and the images that aren't webp or are served bigger than they render.
6. **The forms and the APIs.** What `/api/contacto` and `/api/newsletter` expect versus what every form on the site actually sends, including the newsletter's name field that may not be accepted. **Never send a real request to either endpoint.** Read the code.
7. **Anything else you find** that would hurt at launch. One section at the end, honestly ranked.

## How to write the report
`AUDITORIA-D.md`, in Spanish, ordered by what would hurt most at launch. For each finding: what it is, where (`path:line`), how bad and why, the proposed fix, how long it would take, and whether it can be done mechanically or needs Valentino or Franco to decide. Separate clearly:
- **Blockers for launch** — it ships broken without this.
- **Should fix before launch.**
- **Can wait.**
- **Measurements** — the raw numbers, so nobody has to re-measure.

Put the numbers in the report, not just verdicts. If you couldn't measure something, say so plainly instead of estimating. Keep `ESTADO-d.md` current, and commit the report as it grows so a dead night still leaves something.

## Verification
None of the usual gate: you changed no code. Just make sure the report is complete, every path in it is real, and every number in it was measured by you.
