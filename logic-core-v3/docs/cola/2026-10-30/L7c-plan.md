# L7c · plan

Blog: índice `/v3/blog` y notas `/v3/blog/[slug]` (día).

**Archivos:** `v3/blog/_notas/{tipos,indice,<6 notas>}.ts` (datos tipados, sin DB), `blog/{page,preset,CuerpoDelBlog,CarruselDeDestacadas,NotasEnDesorden,PortadaDeNota}`, `blog/[slug]/{page,CuerpoDeLaNota}`.

**Items / hecho cuando:**
1. Carrusel a todo el ancho con las 3 destacadas: avanza solo (6,5 s), se detiene con puntero/foco, flechas y barras de progreso; con movimiento reducido no avanza solo.
2. Todas las notas en lugares irregulares (12 col. con anchos y corrimientos).
3. Nota: columna de lectura angosta, fecha y tiempo de lectura, relacionadas (3), CTA, cierre; `generateStaticParams` + metadata por nota.
4. Seis notas en español rioplatense, 650–850 palabras, sin cifras ni historias inventadas, sin enlaces externos ni precios.
5. Portadas tipográficas sin fotos (componente).

**Decisiones previas:** el h1 y el título 3D de cada nota es «Blog» (las letras de seis títulos largos no entran en las fuentes 3D de página); el título de la nota va como `h2` de la columna. Sin PRECIOS_DESDE en el repo: la nota de costos describe factores, sin números.
**Gate:** tsc, eslint, `s78-b12a`, `s3-tokens`, navegador en :3003.
**Premortem:** arbitrarios de Tailwind que el padrón de tokens rechaza → inline style; `params` es Promise en Next 16; carrusel sin timers huérfanos (rAF cancelado).
