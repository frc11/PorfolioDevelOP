# SPRINT PANEL — la galería del panel, estilo nk/news

Lane PANEL · rama `lane/panel` · dev en 3010.

## Checklist

- [x] F0.1 — Medir nk/news a 1440 y 390 (grilla, parallax, hover, tipografía)
- [x] F0.2 — Leer la sección actual: archivos, invariantes, INVENTOS consumidos
- [x] F1 — Contenido: galería de 8 tarjetas en un archivo de datos, se van los textos y la lista, fuera `panelFechas` y `panelComparacion`
- [x] F2 — Grilla (ritmo 7n de nk) y parallax con una sola suscripción de scroll
- [x] F3 — Hover y `focus-visible`: la imagen escala 1,05 adentro del marco, el título se corre y entra la marca «qo»
- [x] F4 — Ampliar: elemento compartido, flechas, Esc, click afuera, cruz, foco atrapado y devuelto, fundido con movimiento reducido
- [x] F5 — «Y más…» con entrada expo-out de derecha a izquierda, una vez, y los puntos en fila
- [x] F6 — Móvil (<1025): una columna, sin hover, sin parallax, tocar amplía, «Y más…» quieto
- [x] F7 — lint, tsc, invariantes (s6-tu-panel, s7-arboles, s10-acceso, s21-llave), capturas, grabación, reporte

## Medición de nk/news (1440 × 900, Chrome por CDP, 2026-09-23)

Sonda: `scripts-panel/sonda.ts`. Crudos en `C:\Users\Valentino\.cache\b4-medicion\panel\r1-r3.json`.

| Qué | nk | Nuestro token |
|---|---|---|
| Contenedor de la grilla | 1016 px (212 de margen a cada lado) | ancho entero de la sección |
| Columnas | 3 iguales (258,66 px) | `grid-cols-3` desde `escritorio` |
| Canal horizontal | 120 px | `calc(var(--spacing-20) * 1.5)` = 120 |
| Canal vertical | 70 px | `calc(var(--spacing-20) * 0.875)` = 70 |
| Ritmo (`nth-child(7n+k)`) | 1 · span 3 / 2 · span 2 / 3 · span 1 / 4 · columna 3, `top: -5rem` / 5 · span 3 / 6 · span 1 / 7 · span 2 | igual; el desfase de la 4 es `var(--spacing-20)` = 80 |
| Marco | `aspect-ratio: 594/334` (16:9), `overflow: hidden` | 16:10, como pidió la instrucción |
| Imagen en el marco | 130 % del alto del marco (`js-s-ukiyo`) | 130 % |
| Parallax | la imagen baja respecto del marco al bajar la página; 0,1515 px/px (L, marco 571), 0,111 (M, 358), 0,054 (S, 145) = 1,30 × (sobrante ÷ (viewport + marco)); centrada cuando el marco está centrado; el marco NO se mueve | igual: 1,3 × recorrido justo, centrada en el medio, acotada al sobrante para no mostrar borde |
| Hover · imagen | `scale(1.05)` sobre la capa de adentro del marco, 0,4 s `ease-in-out` | `scale-105`, `--duracion-media` (400 ms), `ease-in-out` |
| Hover · título | `translateX(18px)`, 0,4 s `ease-in-out` | `var(--spacing-8)` (32): la marca «qo» mide 23 px de ancho y no entra en 18 |
| Hover · la «/» | absoluta en el origen del título, `opacity 0 → 1`, `scale(.6) translateX(-16px)` → `scale(1) translateX(-18px)`: entra 16 px desde la izquierda y termina donde empezaba el título | la marca «qo» en `--color-acento`, entra `var(--spacing-4)` (16) desde la izquierda, `scale-60 → scale-100` |
| Título | DM Sans 32 px / 109 % / −0,32 px (−0,01 em), 400; 18 px en las tarjetas 3 y 4 | `titulo-m` (32 a 1440), `leading-titulo` 1,09, `tracking-texto` −0,01 em; `titulo-s` en la 3 y la 4 |
| Fecha → etiqueta | 10 px, `line-height` 90 %, +0,4 px, mayúsculas, `opacity: .3`; 12 px debajo del marco, 10 px entre título y fecha | `Micro` (10 px) en mayúsculas con `--color-tinta-tenue` (la opacidad 0,3 no pasa AA); `--spacing-3` y `--spacing-2` |
| 390 | una columna de 326 px, canal vertical 70, título 32 px, parallax APAGADO (`transform: none`) | una columna, sin parallax, sin hover |

Nota: las fases 1 a 6 se commitearon juntas (`9fbf1f35`) porque comparten los mismos archivos de la sección.

## Decisiones

- PROPUESTA (planificador): tarjetas 1 y 8 separadas; la etiqueta va donde nk pone la fecha.
- El marco es 16:10 (instrucción) y no 16:9 (nk).
- El corrimiento del título es 32 px y no 18: la marca «qo» necesita el lugar que en nk ocupa una barra de 7 px.

- Las tarjetas grandes usan el ancho entero de la sección, como pidió la instrucción. A 1440 el marco L mide 1376 × 860 y casi llena la pantalla (en nk mide 1016 × 571). Para vetar: basta con acotar el ancho de la galería.
- El marcador `[CAPTURA DEL PANEL]` se ve en cada tarjeta pero va `aria-hidden`: repetido ocho veces le ensuciaba el nombre a cada botón.
- El censo de s10-acceso cambió (+8 paradas, −4 encabezados, −4 marcadores anunciados). El delta está aparte, en `DELTA_DEL_PANEL` al final de `s10-acceso-censo.ts`, para que el merge sea sumar.
- `s6-tokens` acepta `opacity-0` y `opacity-100` como estructurales (apagado/prendido), igual que `none` y `full` en otras familias.
- `s7-compuerta` necesita un build y este sprint no corre builds: queda sin correr.

## Pendiente para el usuario

- Las 8 capturas reales del panel (`TARJETAS[i].imagen` en `_secciones/tu-panel/contenido.ts`).
- Anotado sin hacer: los testimonios van en «Por qué develOP», en un sprint aparte, y tienen que ser de clientes reales.
