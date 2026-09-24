# SPRINT MÓVIL 2 — arreglos de trabajos, y servicios y panel en todos los anchos

Rama `rediseno/home` · dev 3000 · punto de retorno: tag `movil-trabajos` (311c5cf6).
Mapa de anchos: móvil ≤425 · tablet 426–1023 · portátil 1024 · escritorio ≥1025.
Escritorio ≥1025 no cambia; la prueba es la superposición del túnel a 1440 dentro de 1 px.

## Fase 1 — Trabajos: cuatro arreglos

- [x] **1. La vuelta no regresa del todo.** Causa (una línea): *el techo del regulador
  sólo garantizaba el túnel en 0 en el tope del pin, y en el medio lo dejaba bajar a
  0,82 de la velocidad de la página; con un dedo la página siempre corre más que el
  regulador (500 px/s), así que al llegar al arranque del túnel El Garage seguía hasta
  en 0,46 —medido a 390—.* No era el resorte (se asienta en < 0,9 s en las cinco formas
  de subir medidas) ni la histéresis (la del cartel sólo espera al túnel).
  Arreglo: abajo de 1024 el techo suma un punto que toca al scroll en el arranque del
  túnel (`trabajos/ritmo.ts`, `BANDA_DEL_EFECTO_ANGOSTA`); nunca pasa por debajo del
  scroll, así que bajando no ata a nadie. Escritorio conserva su banda.
  Medido a 390 con el dedo (hasta 7.200 px/s de página): 0 cuadros con una capa > 0
  con la página arriba del arranque del túnel (antes, 0,455).
  Afirmado en §28: angosto en el arranque a 600–20.000 px/s (con y sin un cuadro de
  atraso), escritorio en el tope del pin, y asentado en 4 s con las dos bandas; control
  positivo: el techo de escritorio falla el chequeo angosto.
- [x] **2. Cada proyecto dura más abajo de 1024.** Un solo parámetro por ancho,
  `ESTIRAMIENTO_DEL_TUNEL = { escritorio: 1, tablet: 1.5, movil: 2 }`: la tabla no se
  toca, el túnel se recorre ×k más despacio, la sección crece exactamente (k − 1) túneles
  (tablet +82,2 svh, teléfono +164,4 svh) y un reloj pasa el scroll al píxel de la tabla
  (`pxDeLaTabla`). El cartel, la espera, la salida y los demos no cambian de largo.
  Abajo de 1024 el pin pasa de la sección al bloque (la sección es la caja alta).
  Medido: a 390 la sección mide 7.777 px (921,4 svh) y el pin es el bloque.
  Afirmado: cada relevo dura ×1,5 / ×2 de scroll; el reloj cierra, crece y es la
  identidad con k = 1; el alto sale del mismo número (con control).
- [x] **3. El carrusel.** Arriba las cuatro primeras, abajo las otras cuatro, sin
  repetidas; tablet, un renglón de ocho. UNA fila (`EstadoDeLaFila`): posición y
  velocidad compartidas, cada renglón con su signo; un solo `requestAnimationFrame`.
  Física igual (34 px/s, 0,85 s, tope 2.400). Medido a 390: lanzar el de abajo a la
  izquierda da 353 / −353 px/s en los dos, y a los 3 s vuelven a 41 / −41. Afirmado en
  §27, con control (el carrusel de antes, un estado por renglón).
- [x] **4. Portátil 1024: el CTA se desbordaba.** La frase, «Hablemos» y el aire de
  arriba y abajo se escriben en `cqw` de la ventana (`trabajos/ventana.ts`): una recta
  del ancho de la ventana que vale lo de siempre a 1440 y cae con pendiente 1,2 (despejada
  de 1024), con `min()` contra la medida de siempre. Medido (contenido / ventana):
  1024 513 → 397 / 397; 1280 542 → 496 / 496; 1440 560 / 558 sin cambios (104 px).

## Fase 2 — Servicios en móvil y tablet

- [ ] Sticky arriba: rótulo, número, nombre, subrayado + rodillo + torta en miniatura.
- [ ] Abajo: la columna derecha en scroll normal; el rodillo cambia al cruzar una línea.
- [ ] CTA al terminar cada servicio, abajo a la izquierda, con su acento.
- [ ] El sticky suelta al terminar el último servicio.
- [ ] «IA y Automatizaciones» en móvil y tablet; el nombre completo al lector y a escritorio.
- [ ] Sin el hueco gigante antes del panel (afirmado).
- [ ] 1024: el título entra en su columna; el CTA de IA verificado contra Tu Panel.

## Fase 3 — Panel en móvil y tablet

- [ ] «Y más...» y el formulario visibles, con llegada y regresión (afirmado en los dos).
- [ ] Palabras de fondo quietas, 1,0595:1, fuera de las features.
- [ ] Parallax interno de las imágenes, medido con CPU ×4.
- [ ] Ocho features en una columna con sus anchos alternados.
- [ ] 1024: «Tu Panel» y su cuerpo más grandes; imágenes más grandes, ≤3 en pantalla.

## Fase 4 — Verificación y reporte

- [ ] lint + `tsc --noEmit` sin errores nuevos.
- [ ] Batería en verde.
- [ ] Invariantes nuevos con control.
- [ ] Capturas a 320/375/425/768/1024 de trabajos, servicios y panel.
- [ ] Grabación a 375 con toque.
