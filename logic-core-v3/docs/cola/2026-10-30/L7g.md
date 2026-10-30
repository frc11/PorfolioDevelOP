# L7g · Lo que quedó sin hacer y sin verificar

One session, on the integrated branch after L7-INT closes. Model: **Sonnet 5.5, high effort**. Budget: ~3 h.

Lane B closed with items unfinished and with **no verification at all below ~500 px**, because its test window couldn't go narrower. That is the biggest hole in L7: nobody has seen the new pages on a phone. This lot closes the list and does the verification properly.

## The unfinished items from L7d
1. **The footer logo, at every width.** Not done at all. On the phone L9a put the logo on top, centred, with the content below; Valentino wants the same at 1440, 1024 and 768. Check that nothing shifts between widths.
2. **The discreet links at the end of the home's sections.** Not done. Quiénes somos → «Conocé más sobre nosotros» (to `/v3/nosotros`), Portfolio → «Ver todos los trabajos» (to `/v3/portfolio`), in the site's style, with `<Link>` and the veil. Right now the new pages are reachable only from the footer, which is why this matters more than it looks.
3. **The legal links in the home's 3D footer at ≥1025.** Lane B tried adding a row, it pushed the 3D blocks out of place, and it reverted. Don't retry the same way: find a place for «Privacidad» and «Términos» that doesn't change the 3D layout's geometry — inside an existing block, or as a small line in a block that already exists. If every option costs geometry, leave it out and write down what you tried and why none of them worked. The links already exist in the flat footer, so this is a completeness fix, not a blocker.
4. **The sitemap.** Lane B decided not to touch it. Do the `/v3` part now: the pages in the project's own sitemap if it has one, and **never** create or touch a public sitemap for the live site. If touching it at all risks the live site, write down what should happen at launch and leave the file alone.

## The faculty photo
5. `C:\nocturno\l7-assets\facultad.png` now exists (500×298, low resolution). Lane B substituted the home's team photo because the folder was missing. Put the real one in, at a size where it doesn't look blurry, with the caption «FACET · Universidad Nacional de Tucumán», and copy it into `public/v3/nosotros/` as webp.

## The verification nobody could do
6. **1024, 768 and 390, for real**, on every page L7 built: the three services, Nosotros, Portfolio, the blog index, a note, Privacidad, Términos, the 404. For each: it loads with no console errors, the order intro → body → closing works going down AND up, nothing overflows at 320, the `h1` is right, and the FAQ opens. Use whatever browser tooling actually resizes to 390 — Chrome DevTools over the MCP server, or Playwright with a device viewport. If your tool cannot reach 390, **say so instead of reporting the width as passed**: a width reported from a 500 px window is a false green.
7. **One screenshot per page per width** into `C:\nocturno\cola3-fotos\L7\<pagina>\`. Lane B couldn't write outside its workspace; if you can't either, write them inside the worktree under `docs/cola/2026-10-30/fotos/` and say where they are.
8. **The sound waves, in the browser.** Lane B wrote the guard and the review found its first attempt hadn't actually applied, so verify the real behaviour: the waves fire only while the preloader is on screen, and not on a normal load, a hard reload or an internal navigation.
9. **The nanobots on the first service slide.** If `C:\nocturno\l7-assets\nanobots-slide1.*` exists by the time you reach this, fix what it shows. If not, leave it and log it as still pending.

## Rules
Fix what you find while verifying only if it's small and clearly inside L7's work. Anything bigger: write it down in `L7g-resultado.md` with the path and what you'd do, and leave it. Dev port 3002. Take the lock for heavy steps; it may be shared with a lab lane today.
