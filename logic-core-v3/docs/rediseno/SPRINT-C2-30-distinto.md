# SPRINT C2-30s · El ≠ de Quiénes somos, grande y centrado en el espacio libre

Cola 2 (2026-10-23), tarea 30, punto 1 (ítem 3 de la revisión: «el símbolo de distinto, más grande y centrado, mismo efecto, mismo
tipo (3d) […] sobra muchísimo espacio ahí»). Captura `lote1/02`. Las fotos del equipo (punto 2) son de 30f: no se tocaron.

## Plan

- **La lectura** (sin preguntar): «centrado» es centrado en el espacio libre de la primera pantalla de Quiénes somos, donde el ≠ ya
  estaba (PULIDO 10 lo había pegado al margen porque, centrado en su columna, caía sobre el arco del logo). El espacio libre es la
  fila que crece (del pie del titular a la cabeza del cuerpo), del margen de la página (la columna lateral está vacía) al logo
  menos su aire. Se descartó ponerlo a la derecha del logo: el pedido dice «centrado», no «del otro lado».
- **Desde 1024** el Bloque de afuera del ≠ ES ese espacio: llena su fila, se corre la columna lateral hasta el margen, mide de
  ancho hasta la reserva del logo (centro del cuadro menos `enUnidadesDelLogo(21,3 + 3)`, la misma unidad que usan los huecos
  del logo en Por qué develOP) y es contenedor de tamaño (no le suma alto a la fila: la pantalla mide lo mismo). Adentro, el ≠
  va centrado (flex) con el lado `min(0,8·ancho/0,84, 0,8·alto/0,68, alto)`: su tinta llena el 80 % del lado que manda.
- **El mismo objeto, más grande:** el lugar del título de volumen toma un cuerpo de lado/3,75, así que el SVG (tres renglones en
  em), la extrusión y el bisel (en em) escalan juntos; la raya pasa a 0,1184 cuerpos (4,5 px sobre 38: la proporción de 1440).
  El 3D lo sigue midiendo del DOM al armarse (`trazos3d.ts`), sin cambios en la escena.
- **Abajo de 1024** el ≠ existe sólo en 2D (los títulos de volumen son desde 1024) y no se cambia: ver el log.
- Pruebas: `s78-c2-30s` (sin navegador) y el banco `scripts-carga/distinto.ts`.

## Log

- `signo.ts` (nuevo): las constantes (relleno 0,8 decidido; medio ancho del logo 21,3 svh medido en la captura `lote1/02`:
  387 px de 910; aire 3 svh, el de los huecos del logo), la cuenta pura (`espacioLibreDelSigno`, `ladoDelSigno`, `cajaDelSigno`,
  `tintaDelSigno`, `reservaDelLogoPx`) y el CSS que la escribe (`ESTILO_DEL_SIGNO`, `CLASES_DEL_SIGNO`).
- `QuienesSomos.tsx`: el Bloque del ≠ con las clases del espacio libre y su estilo; deja la medida del titular (23ch, que
  acotaba el espacio a 1920). `titular3d.tsx`: el lugar con `data-pieza="signo-distinto"` y sus clases. `geometria.ts`: el
  reparto del ≠ sin el centrado vertical (lo hace el Bloque). `trazo.css`: la raya lee `--signo-grosor` con la de siempre de
  respaldo.
- La cuenta, en el modelo de las filas (la del banco es la verdad): 1024 × 768, libre 324 × 342, ≠ 309 (2,9 veces el de antes);
  1280 × 800, 414 × 371, ≠ 371 (2,7); 1440 × 900, 469 × 444, ≠ 444 (3,1); 1920 × 1080, 666 × 579, ≠ 579 (4,1). La tinta queda a
  32–90 px de la reserva del logo (que ya trae su aire) y a 66 px o más del titular y del cuerpo.
- `s61` A3 fijaba el ≠ «al margen» (el reparto con el centrado vertical): actualizado a la spec nueva, con un control más (el ≠ sin
  el espacio libre). `s5-archivos`: `signo.ts` entra al padrón de apoyo.
- **Abajo de 1024 no se cambió.** A 768 la composición es una columna sobre el logo y lo único libre al costado del logo es la
  franja del margen, que el ≠ ya ocupa (32–195 px; `banda.css` midió que centrado, desde x 303, cruzaba el logo). No tengo medido
  dónde cae el logo a ese ancho en el reposo: el banco lo mide y deja el ancho libre real para decidir.
- REGLA DE ALTURAS: no cambia ningún alto. Desde 1024 el Bloque del ≠ no aporta alto (contención de tamaño) y antes tampoco
  mandaba (su fila ya medía lo que sobra); abajo de 1024 no hay clases nuevas.

## Qué mirar

- `BASE=http://localhost:3000 npx tsx scripts-carga/distinto.ts` (1440 × 900, 1024 × 768, 768 × 1024) y sus controles
  `CONTROL=chico` (falla el tamaño desde 1024) y `CONTROL=encima` (falla «no tapa»). El banco imprime el medio ancho del logo
  medido en svh de la banda: si no da ~21,3, esa es la constante a calibrar (`MEDIO_ANCHO_DEL_LOGO_SVH`).
- A ojo: `/v3`, scrolleá hasta Quiénes somos; a 1440 y 1024 el ≠ en volumen, grande, centrado entre el titular, el cuerpo, el
  margen izquierdo y el logo; se dibuja como antes (barras con el subrayado, la diagonal con el tachado).
