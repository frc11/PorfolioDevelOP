# L7b · resultado

**Nosotros (`/v3/nosotros`) y Portfolio (`/v3/portfolio`): hechos, de día, con las piezas del home.**

## Por ítem
- **Nosotros, historia y equipo: hecho.** 4 párrafos con sólo los hechos de Valentino; equipo en dos párrafos con foto alternada y el `MarcoDeDosTomas` del home (hover = segunda foto). Visto en el navegador a 1440 (hover de la foto de grupo mostrado por el puntero).
- **Nosotros, cómo trabajamos (4 pasos) y valores (5 textos exactos): hecho.**
- **Cierre de Nosotros (CTA + Seis razones + pie + FAQ de 6): hecho.**
- **Portfolio, casos: hecho.** Tres bandas alternadas con video, ficha entera (campos de `PROYECTOS`) y «Visitar sitio» en el color de la marca. Medido: El Garage 4 filas (fecha, qué hicimos, problema, resuelto); Esquina y Banú 3 (su «resuelto» es un marcador pendiente: no se muestra). Ninguna reseña de caso se muestra (todas son marcadores).
- **Portfolio, demos en conjunto: hecho** (explicación + 5 portadas que abren en pestaña nueva).
- **Portfolio, testimonios planos: hecho** (fila quieta con las reseñas del home, sus fotos y «Ver trabajo» al caso: cada caso lleva `id="portfolio-<slug>"`).
- **`h1` = título 3D, metadata en español, FAQ de 6: hecho.** Verificado: el título 3D «Nosotros» se ve en la escena de día.

## Decisiones tomadas solo
- L7b-1: `C:\nocturno\l7-assets\` no existe (ni `facultad.png`). La foto de la facultad queda sin poner; el marco de la historia usa la foto del equipo del home (con su hover). Según `ESTRUCTURA-PAGINAS.md` (manda Valentino) tampoco se rotula FACET en la foto. Valentino pasa la real.
- L7b-2: los títulos 3D «Nosotros», «Portfolio» y «Blog» obligaron a regenerar `_fuentes/archivo-125-*-pagina.*` con `scripts-retoque/fuentes-3d.py` (TTF de Archivo bajado de google/fonts, OFL, en `scripts-titular/_upstream/`, ignorado por git). El script tenía todavía las 5 instancias que L6-4b había borrado: se dejó con las 3 vigentes. **Aviso de integración:** el carril A (que renombra «Integraciones con IA») también regenera estos archivos: al juntar, volver a correr el script con la unión de títulos.
- L7b-3: `IdDePagina` suma `'nosotros' | 'portfolio' | 'blog'`.
- L7b-4: una pieza nueva compartida, `_componentes/pagina/SeccionDePapel.tsx`.
- L7b-5: las demos abren en pestaña nueva (como la rama táctil del home): la ventana con el Genie vive en la escena del home.
- L7b-6: el video del caso es el de escritorio en todos los anchos (con póster y pausa fuera de pantalla; con movimiento reducido, sólo el póster).
- L7b-7: los textos de caso pendientes (`[TEXTO]`, `[TESTIMONIO]`) se ocultan (`proyectoMostrable`) en vez de mostrarse; cuando `proyectos.ts` tenga el dato real, aparecen solos.
- L7b-8: los tokens `--spacing-16`/`-24` no existen en el tema (sólo 1–6, 8, 12, 20): se usaron 12 y 20.

## Verificación
- `tsc --noEmit`: 0 errores. ESLint de lo tocado: limpio. `s78-b12a` 162/0, `s3-imagen` 21/0, `s3-tokens` 29/0, `s3-layout`, `s3-tipografia`, `s3-papel` 0 fallas; `s3-frontera` 12/0 (10 fuera de ventana, parcial).
- Navegador (dev :3003): sin errores de consola, sin desborde horizontal a 1440 y a 500 (el mínimo de la ventana de prueba). **No verificado:** 1024, 768 y 390 reales, la apertura del FAQ, y las capturas por ancho en `C:\nocturno\cola3-fotos\L7\` (la herramienta de capturas sólo escribe dentro del workspace).
- No se corrió el home smoke ni la batería completa.

## Qué tiene que mirar Valentino
1. `/v3/nosotros` a 1440: la historia, las dos fotos del equipo (hover) y la foto de grupo; reemplazar por la foto de la facultad.
2. `/v3/portfolio` a 1440: los tres casos y las demos.
3. Ambas a 390.
