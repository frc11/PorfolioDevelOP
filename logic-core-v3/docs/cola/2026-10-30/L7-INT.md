# L7-INT · Integrar el carril A con el carril B

One session, on `l7/a` after Valentino has merged `l7/b` into it by hand. Model: **Opus 5.5, high effort**. Budget: ~2 h.

Lane A and lane B each built and verified their pages against `rediseno/home`, never against each other. This lot makes the two halves one working site. **It fixes integration damage only — it does not add features and does not finish lane B's unfinished items** (that is L7g).

## What the two lanes said collides
Both reports name the same three places. Start there, and then look for what they didn't notice.
1. **The 3D title fonts.** Both lanes touched `_fuentes/archivo-125-*-pagina.*` and `TITULOS_CON_LETRAS`. After the merge, re-run `scripts-retoque/fuentes-3d.py` with the **union** of both lanes' titles, and check that every page's 3D title renders with every glyph it needs — the three services, Nosotros, Portfolio, the blog index, a note, the 404. A missing glyph is the failure mode to hunt for.
2. **`IdDePagina` in `preset.ts`.** Both lanes added ids. Make sure the union is coherent, nothing is duplicated, and nothing lost its preset.
3. **The base page's intro length.** Lane A shortened it in the shared base from 2,5 to 1,8 pantallas (logged in `ESTADO-a.md`). **Lane B built and verified every one of its pages against the old 2,5.** So after the merge, every lane-B page has an intro nobody has ever looked at. Go through Nosotros, Portfolio, the blog index, a note, Privacidad, Términos and the 404 at 1440 and check the intro still reads as one screen that moves on quickly, that the title isn't cramped or clipped, and that the handover to paper still works. Fix what broke. If 1,8 turns out wrong for a page, say so in the result instead of changing the base again.

## Then
4. **The gate on the merged tree:** `tsc --noEmit` with no new errors, lint clean on everything the merge touched, and the full suite. Both lanes reported `verificar` failing on the same baseline suites plus `s6`, `s76` and `s77`; lane A guessed those three belong to L9a but never checked. **Check it now:** run them on `rediseno/home` too, and say plainly whether they were already red before L7 or whether L7 broke them.
5. **Production build:** run it, and list its errors classified as baseline or new. Don't fix the baseline ones.
6. **A pass over every page at 1440**, going down and up: no console errors, the order intro → body → closing, the FAQ opens, the footer is there. This is a smoke test, not the width matrix — L7g does the widths.

## Rules
Never merge any branch yourself; Valentino does the merge before you start. If the merge left conflict markers anywhere, stop and report instead of guessing. Write `L7-INT-resultado.md` with what collided, what you fixed, and what you found that neither lane reported. Dev port 3002, and the lock is yours alone today unless Valentino says a lab lane is running.
