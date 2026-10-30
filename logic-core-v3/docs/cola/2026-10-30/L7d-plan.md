# L7d · plan

Privacidad y Términos (sin 3D), la 404 de /v3, enlaces entre páginas y en el pie, metadata, y dos pedidos de Valentino (ondas del sonido, logo del pie).

**Items / hecho cuando**
1. `PaginaLegal` (intro plana + índice lateral sticky ≥1024, desplegable abajo + pie plano) con los textos de `privacidad/` y `terminos/`; comentario de revisión legal. Hecho: ambas dan 200, los anclas del índice existen.
2. `not-found.tsx` de `/v3` + `[...resto]/page.tsx` (notFound). Hecho: `/v3/lo-que-sea` da 404 con la escena de día y el botón al inicio; el `not-found` raíz no se toca.
3. Enlaces: grupo «Páginas» y línea legal en el pie de las páginas y del pie plano del home; Nosotros ↔ Portfolio; nota → blog. Fuera: los links al final de las secciones Quiénes somos/Portfolio del home (secciones fijas en 3D con alturas atadas a la escena: se anota, no se hace).
4. canonical + Open Graph por página. Sitemap: no se toca (el único es el del sitio en vivo).
5. Revisión independiente (subagente).
6. Logo del pie arriba al centro (escritorio/tableta): evaluado, no hecho (toca el final 3D del home).
7. Ondas del sonido sólo en el preloader: guarda mínima en `LatidoDeLaEntrada` (`fueraDelPreloader: false`).
8. Nanobots: no se toca.

**Gate:** tsc, eslint, s6-cierre, s44-pie, s78-b13/b10/b12a/b12b/c2-71, s85-piezas, s21-llave, s3-*, s90/s91; navegador :3003.
**Premortem:** el pie 3D del home mide su DOM (un renglón más lo desacomoda: ocurrió, se revirtió en el home ≥1025); `s44` cuenta los `<TextoDelPie`; los tokens de espaciado inexistentes no fallan, sólo no aplican.
