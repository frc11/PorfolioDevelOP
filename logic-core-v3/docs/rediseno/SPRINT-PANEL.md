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
- `_lib/secciones.ts` no se tocó: la fila de `tu-panel` sigue en `200svh` como mínimo y la galería la supera por contenido (a 1440 la sección pasó de 2 pantallas a unas 7,8). El ancla de la escena para el tramo `demos` (`anclaje.ts`) se va a correr: eso es escena y no se tocó.
- `s7-compuerta` necesita un build y este sprint no corre builds: queda sin correr.

## Pendiente para el usuario

- Grabación: `C:\Users\Valentino\.cache\b4-medicion\panel\grabacion\galeria-panel-1440.mp4`. Capturas: `n-1440-*.png` y `n-390-*.png` en la misma carpeta `panel`.
- Las 8 capturas reales del panel (`TARJETAS[i].imagen` en `_secciones/tu-panel/contenido.ts`).
- Anotado sin hacer: los testimonios van en «Por qué develOP», en un sprint aparte, y tienen que ser de clientes reales.

---

# Sprint 2 — «Tu Panel»: un caos ordenado de features

## Checklist

- [ ] F1 — Encabezado «Tu Panel» + descripción en el 30 % izquierdo; la primera feature llega en el 60 % derecho; sin el puntito azul
- [ ] F2 — El caos: tabla fija de posiciones, 4 clases de tamaño, parallax por feature, llegada con el patrón de la casa, barridos de convivencia
- [ ] F3 — «Y más…» + newsletter, reversibles al subir; el formulario sale del pie
- [ ] F4 — Fondo decorativo: palabras y fragmentos de interfaz con el contraste medido del «What's new» de nk
- [ ] F5 — Móvil: columna con anchos alternados, sin parallax, «Y más…» quieto, newsletter debajo
- [ ] F6 — lint, tsc, invariantes, barridos, envío real, capturas, grabación, reporte

## Hallazgos de la lectura

- **El puntito azul** es `MarcaDeSeccion` (un `PrefijoDeServicio`, `bg-acento`), que `CabeceraDeSeccion` monta en TODAS las secciones (`_contrato/Rotulo.tsx`). Es compartido: se saca sólo en Tu Panel, que deja de montar la cabecera.
- **⚠️ BLOQUEANTE · El backend del newsletter NO existe.** La instrucción dice que ya existe en el footer, y no es así:
  - en `/v3` el formulario del pie es la columna «Novedades» del Cierre (`cierre/ColumnasDelPie.tsx` → `FormularioDeNovedades`), montado DESHABILITADO a propósito: `cierre/contenido.ts` explica que «todavía no hay destino» y que habilitarlo daría un éxito falso;
  - el `Footer` del sitio vivo (`components/sections/home/Footer.tsx`) no tiene newsletter: es un formulario de CONTACTO (nombre, WhatsApp, rubro, mensaje) que va a un webhook de n8n o abre WhatsApp;
  - no hay ninguna ruta, acción ni integración de suscripción en `src/` (lo de Brevo son campañas y correos transaccionales del panel de clientes).
  Por la regla de no crear uno nuevo y no simular un éxito, el formulario se muda a Tu Panel TAL CUAL (el mismo componente, deshabilitado, con el motivo escrito). Los estados de cargando, éxito y error no se construyen: sin un destino no pueden ocurrir de verdad. Hace falta que el usuario decida el destino (lista de Brevo, n8n u otro).
