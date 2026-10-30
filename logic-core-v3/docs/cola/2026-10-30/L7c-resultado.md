# L7c · resultado

**Blog (`/v3/blog`) y seis notas (`/v3/blog/[slug]`): hechos, de día.**

## Por ítem
- **Carrusel de destacadas a todo el ancho: hecho.** Medido en el navegador: avanza solo (translateX −100 % → −200 % en 7,5 s), flechas, barras de progreso (la de ahora se llena con el tiempo). Se detiene con puntero o foco encima y con movimiento reducido no avanza solo (por código). **No verificado en navegador:** la pausa por hover/foco y las flechas (sólo por lectura de código).
- **Todas las notas en lugares irregulares: hecho** (12 columnas con anchos y corrimientos distintos desde 1024; 2 columnas en tablet; 1 en teléfono). Visto a 1440.
- **Página de nota: hecho.** Columna angosta, fecha y tiempo de lectura, introducción, subtítulos, cierre con CTA, 3 relacionadas, `generateStaticParams` (`dynamicParams = false`: un slug inexistente da 404, medido), metadata y Open Graph por nota.
- **Seis notas: hecho.** Entre 698 y 772 palabras, sin cifras, encuestas, clientes ni enlaces externos; ninguna cita precios.
- **Portadas tipográficas sin fotos: hecho** (`PortadaDeNota`).
- **Cierre:** Seis razones → CTA → pie → FAQ con las 6 preguntas generales del home.

## Decisiones tomadas solo
- L7c-1: el `h1` y el título 3D de todas las notas es «Blog» (las letras de seis títulos largos no entran en las fuentes 3D de página y irían a un cuarto del tamaño en una línea). El título de la nota es el `h2` de la columna. Valentino puede pedir fuentes para un título corto por nota.
- L7c-2: la nota de costos describe factores y no cita precios (no hay `PRECIOS_DESDE` como dato en el repo; sólo lo mencionan tests).
- L7c-3: el layout irregular es una reinterpretación de la galería vieja de «Tu panel» (`9fbf1f35`), no su código (no se rescató del historial).
- L7c-4: el reloj del carrusel corre con `requestAnimationFrame` escribiendo el relleno de la barra directo en el DOM (sin keyframes nuevas ni CSS nuevo).
- L7c-5: sobre el acento el texto de la portada va en el papel: el acento del tema es oscuro (la tinta sobre él no llegaba a AA; corregido tras verlo).

## Verificación
- `tsc --noEmit` 0; ESLint de `blog/` limpio; `s78-b12a` 162/0; `s3-tokens` 29/0; `s3-imagen` 21/0.
- Navegador (:3003, 1440): sin errores de consola, sin desborde, h1 «Blog». **No verificado:** 1024/768/390, reduced-motion en navegador, capturas en `C:\nocturno\cola3-fotos\L7\blog\`.

## Qué tiene que mirar Valentino
1. `/v3/blog`: el carrusel (pausa con el mouse, flechas) y la grilla irregular.
2. Una nota a 390.
3. Leer las seis notas: son borradores de la IA.
