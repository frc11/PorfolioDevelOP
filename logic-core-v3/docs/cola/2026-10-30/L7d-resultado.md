# L7d · resultado (cierra el carril B)

## Por ítem
1. **Privacidad y Términos: hecho.** `/v3/privacidad` y `/v3/terminos` dan 200, sin escena: intro plana, índice lateral fijo desde 1024 (desplegable abajo) y pie plano; «Última actualización: 30 de octubre de 2026». Privacidad se armó con lo que el sitio recolecta (formularios de contacto y novedades, chat, cuenta, errores, almacenamiento del navegador; sin analítica pública: `/api/track` es sólo del panel con sesión). Comentario en código: los textos los tiene que revisar un abogado antes del lanzamiento. Visto a 1440.
2. **404: hecho.** `v3/not-found.tsx` + `v3/[...resto]/page.tsx`: `/v3/no-existe`, `/v3/a/b/c` y `/v3/blog/nada` dan **404** con la escena de día, «Esta página no existe, pero tu proyecto sí puede.» y el botón al inicio. El `not-found` raíz no se tocó. Se ajustó el ancho del texto para que no pise el logo (no se re-verificó a otros anchos).
3. **Enlaces: parcial.** Hecho: grupo «Páginas» (Nosotros, Portfolio, Blog y las tres de servicio) y línea legal con Privacidad/Términos en el pie de cada página y en el pie plano del home (visto en Nosotros); Nosotros ↔ Portfolio; nota → «Ver todas las notas». **No hecho:** el enlace al final de «Quiénes somos» y de «Portfolio» del home (L7d-2) y los enlaces legales/Páginas en el pie 3D del home ≥1025 (L7d-3). Los enlaces a los tres servicios apuntan a las rutas de la barra, que son del carril A.
4. **Metadata: hecho** (canonical + Open Graph en las 5 páginas y en cada nota; un `h1` por página). **Sitemap: no tocado** (el único es el del sitio en vivo; L7d-4).
5. **Revisión independiente: hecha** (un subagente Sonnet, sólo lectura). Corregido: hallazgo 1 (la guarda de las ondas no se había aplicado de verdad), 3 (el chat usa un proveedor de modelos: se nombra en Privacidad), 4 (se sacó «cuando formalicemos» del texto público), 5 y 6 (puntos del carrusel de ≥24 px, foco/puntero por separado, botón Pausar/Reanudar), 10 (sin cifra escrita a mano) y 11 (el mail sale de `contacto.ts`). **No corregido:** 2 (ver L7d-5), 7 (no hay tests nuevos: ver abajo), 8 (ver L7d-3), 9 (L7c-1), 12 (L7b-1); de 4, falta la AAIP y la salvedad de consumidores: es consejo legal, queda para el abogado.
6. **Logo del pie arriba al centro (escritorio/tableta): no hecho.** Cambia la composición del final 3D del home (`encuadreDelPie.ts`, reserva en `Cierre.tsx`, alturas y la cinemática); sin poder ver el 3D con la pestaña activa de forma fiable, se deja para un sprint propio. En las páginas, el logo ya queda al centro (pose E).
7. **Ondas del sonido sólo en el preloader: hecho** (guarda `fueraDelPreloader: false` en `LatidoDeLaEntrada`, que ahora sí se lee; la lógica del latido de L9b no se tocó). `s90` 27/0 y `s91` 17/0. **No verificado en navegador** (carga normal, recarga dura, navegación interna).
8. **Nanobots: no tocado**, como pedía el lote.

## Decisiones tomadas solo
- L7d-1: las páginas legales usan un papel opaco propio y no montan preset (la escena duerme detrás).
- L7d-2: los enlaces al final de las secciones del home no se hicieron: son secciones pinneadas en 3D con alturas atadas a la escena y muchos tests que fijan su marcado.
- L7d-3: en el pie 3D del home ≥1025 queda la línea legal de siempre sin enlaces. Probado: agregar un renglón desacomodó los bloques 3D (el pie los coloca midiendo el DOM). Se revirtió; `s44-pie` exige 4 `TextoDelPie`. Valentino decide dónde van Privacidad y Términos ahí.
- L7d-4: sin tocar `app/sitemap.ts`: publicaría rutas `/v3` que todavía no son públicas.
- L7d-5: los testimonios de Portfolio son las reseñas ficticias del home (el lote lo pide; D8 las reemplaza). Hay que rotularlas o reemplazarlas antes de producción.

## Verificación y avisos
- `tsc --noEmit` 0; ESLint limpio en lo tocado; `s6-cierre`, `s44-pie`, `s78-b10/b12a/b12b/b13/c2-71`, `s85-piezas`, `s21-llave`, `s3-navegacion/frontera/tokens`, `s42`, `s49`, `s17-marca`, `s90`, `s91`: 0 fallas.
- **Candado:** corrí un `tsc` sin tenerlo (lo tenía el carril A) y, al final, la puerta liviana con el candado ajeno retenido más de 35 min. Sin consecuencias visibles.
- **No verificado:** 1024/768/390 reales (la ventana de prueba no baja de ~500), capturas en `C:\nocturno\cola3-fotos\L7\` (la herramienta sólo escribe dentro del workspace), apertura del FAQ, home smoke, tests nuevos (ninguno de L7b–L7d agrega invariantes; se propone uno liviano: slugs de `NOTAS` únicos, anclas del índice legal y rutas de `PAGINAS_DEL_PIE`).
- **Integración con el carril A:** las fuentes 3D (`_fuentes/archivo-125-*-pagina.*`) y `presets.ts` (`TITULOS_CON_LETRAS`) los tocan los dos carriles: al juntar, volver a correr `scripts-retoque/fuentes-3d.py` con la unión de títulos. `IdDePagina` (`preset.ts`) también suma ids en los dos.

## Qué tiene que mirar Valentino
1. `/v3/no-existe` a 1440 y 390 (la 404) y `/v3/privacidad`, `/v3/terminos`.
2. El pie de cualquier página (grupo «Páginas» y línea legal) y decidir dónde van esos enlaces en el pie 3D del home.
3. Que las ondas del sonido sólo salgan en el preloader (carga normal, recarga dura, navegación).
