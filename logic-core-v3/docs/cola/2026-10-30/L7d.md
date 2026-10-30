# L7d · Legal pages, the 404, and wiring the pages together

Lane B, third lot (closes lane B, with the independent review of L7b–L7d). Model: **Sonnet 5.5, medium effort**. Budget: ~2 h.

## Items
1. **Privacidad (`/v3/privacidad`) and Términos (`/v3/terminos`):** no 3D at all. A short flat intro (title + one line), the legal text with a sticky side index (anchors) on desktop and a collapsible index on the phone, then the footer (no Seis razones/CTA/FAQ). Generic text with: develOP as trade name; Franco and Valentino as the people responsible; contact `contacto@develop.com.ar`; jurisdiction: Tucumán, Argentina; a visible «Última actualización: <date>». No CUIT, no registered trademark, no contracts mentioned (they don't exist yet). Privacy covers what the site really collects: find it in the code (the contact and Portfolio forms, the recommender's contact, the newsletter, the chat conversations, the login, cookies/storage the site really uses, analytics only if present) and how to ask for access or deletion by mail. Mention Argentina's personal data law (Ley 25.326) generically, without legal claims beyond that. Plain Spanish. Add a code comment saying the texts must be reviewed by a lawyer before launch.
2. **The 404:** a page for unknown `/v3/...` URLs with the day scene: «Esta página no existe, pero tu proyecto sí puede.» and a button back to the home. If showing it requires changing the root `app/not-found.tsx` (shared with the live site), do not change it: solve it inside `/v3` (a `not-found.tsx` in the `/v3` segment plus a catch-all route if needed) and log what you chose.
3. **Wiring:** the navbar does not change. Reach the pages from:
   - the footer (home and every page): a «Páginas» group with Nosotros, Portfolio, Blog, and the three services; and a small legal line with Privacidad and Términos;
   - the end of matching home sections, as a discreet link in the site's style: Quiénes somos → «Conocé más sobre nosotros», Portfolio → «Ver todos los trabajos»;
   - between pages where it makes sense (Nosotros ↔ Portfolio, a note → the blog).
   Every new link uses `<Link>` and the veil transition.
4. **A sitemap and metadata pass:** `/v3` pages in the sitemap if the project has one (don't create a public sitemap for the live site), canonical and Open Graph per page, one `h1` each.
5. **Review of lane B:** run the independent review over the diff of L7b + L7c + L7d together, fix the real findings, then close lane B.

6. **Footer logo, focus:** el logo del pie tiene que quedar arriba al centro también en escritorio y tableta, igual que el teléfono de L9a (ítem 7). Revisar que el bloque de logo y contenido no se corra al cambiar de ancho. (Pedido de Valentino, 2026-10-30.)
7. **Ondas del sonido, solo en el preloader:** hoy las ondas del sonido (`LatidoDeLaEntrada`, `_chrome/sonido`) se disparan aunque no haya preloader. Tienen que dispararse únicamente durante el preloader; en el resto del sitio, no. Verificar en carga normal, recarga dura y navegación interna. Componente compartido: cambiar lo mínimo y no tocar la lógica del latido de L9b. (Pedido de Valentino, 2026-10-30.)
8. **Fotos de los nanobots en la primera pantalla de servicio:** Valentino manda una captura de lo que pasa en el primer slide; se suma acá cuando llegue la foto, como ítem propio. Hasta entonces no tocar nada de nanobots en L7d.

## Verification
Per 00-L7-COMMON. Also: a random `/v3/no-existe` shows the 404 with status 404; every footer link opens its page; the legal index anchors work.
