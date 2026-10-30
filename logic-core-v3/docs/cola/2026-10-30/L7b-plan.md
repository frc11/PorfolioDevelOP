# L7b · plan

Páginas `/v3/nosotros` y `/v3/portfolio` (día), armadas con las piezas del home sobre `pagina-base`.

**Archivos:** `v3/nosotros/{page,preset,CuerpoDeNosotros,contenido,faq}`, `v3/portfolio/{page,preset,CuerpoDelPortfolio,CasoDelPortfolio,DemosEnConjunto,TestimoniosPlanos,faq}`; `IdDePagina` suma `'nosotros' | 'portfolio'`; `TITULOS_CON_LETRAS` + fuentes 3D regeneradas.

**Items y criterio de hecho**
1. Nosotros: historia en 3–4 párrafos (sólo los hechos de Valentino) → equipo en dos bloques con foto alternada y el `MarcoDeDosTomas` del home (hover = segunda foto) → foto de la facultad (≥ tamaño nativo, sin borroso) → Cómo trabajamos (4 pasos) → Valores (5 textos exactos) → CTA + cierre con 6 preguntas. Hecho: carga a 1440/1024/768/390 sin errores, hover cambia foto.
2. Portfolio: un caso por banda, ficha completa (campos de `PROYECTOS`, video/póster, «Visitar sitio» con color de marca, reseña sólo si es real: hoy ninguna → no se muestra), demos en conjunto (explicación + 5 portadas que abren en pestaña nueva), testimonios planos (`RESENAS`), cierre con 6 preguntas. Hecho: los 3 casos muestran todos sus campos; cada demo enlaza.
3. Metadata `<title>`/description en español y un `h1` igual al título 3D.

**Implica:** s78-b12a exige letras en las fuentes; regenerar. Tests que fijan texto/listas de rutas pueden necesitar actualización.
**Fuera de scope:** navbar/pie (L7d), servicios (carril A), blog.
**Gate:** `npx tsc --noEmit` (lock), lint de los archivos tocados, `npm run test:s78-b12a`, navegador en :3003 a 1440/1024/768/390 con capturas en `C:\nocturno\cola3-fotos\L7\<pagina>\`.
**Premortem:** (1) títulos sin letras → h1 sin 3D / s78 rojo: regenerar antes de probar. (2) `CompuertaDelHome` instala coreografía y rompe la lectura de bloques propios: usar sólo `Gatillo`/`Bloque` del contrato. (3) desborde a 320: grillas con `min-w-0` y columnas apiladas bajo 768. (4) el hover del marco sólo existe con `(hover: hover)`: probar con puntero real.
