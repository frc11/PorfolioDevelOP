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

- [x] **Cabeza fija arriba** (`servicios/angosto.tsx`): el rodillo de cuatro estados y la torta
  en miniatura a su derecha, con su llenado, giro y acumulación —las mismas funciones:
  `fronterasDeEstado`, `rangoDePintura`, `cierreDeLaPintura`—. El progreso lo da un `Bloque`
  de pin (coreografía en todo ancho, como Trabajos) sobre una REGLA de «caja + un cuadro −
  la cabeza»: sobre la caja sola el pin terminaba antes de que el 03 llegara a la línea
  (frontera 1,01, medido a 390). Línea del cambio: 30 % de la ventana bajo la cabeza.
  Medido a 390: 00 → 01 → 02 → 03 en +0 / +0,3 / +0,6 / +1,2 pantallas; la cabeza suelta a +1,8.
- [x] **Abajo, scroll normal**: párrafo, medio y caso de cada servicio; el nombre completo
  queda en `sr-only` mientras la cabeza lo muestra.
- [x] **CTA al terminar cada servicio**, abajo a la izquierda, con su acento (lo hereda del
  `[data-servicio]` del bloque). Está también en la tira de escritorio, oculto, para que las
  dos ramas anuncien lo mismo.
- [x] **El sticky suelta con el último servicio** (la cabeza es hermana de los bloques).
- [x] **«IA y Automatizaciones»** en la cabeza hasta 1024 inclusive (`NOMBRE_CORTO`); el
  lector y el rótulo anunciado dicen el completo.
- [x] **Sin hueco antes del panel**: la tabla suma `altoAngosto: 'contenido'` y abajo de 1024
  el panel, el bloque del pin y cada servicio sueltan 800 / 800 / 100 svh. Medido a 768: del
  CTA de IA al titular de Tu Panel, ~120 px. Afirmado con dos controles.
- [x] **Sin coreografía** (papel, o menos movimiento) no hay cabeza: la lista queda con su
  encabezado y sus rótulos, sin una transformada (s7-arboles, s10-acceso, s6-render en verde).
- [x] **1024**: el completo pedía tres renglones (118 px en una caja de dos) y ningún nivel
  razonable lo mete en dos → también ahí «IA y Automatizaciones» (79 px). 1025 no cambia.
  **El CTA rotativo a 1024 es scroll normal**: al final del pin queda en 689–736 con Tu Panel
  en 768, y a 1,2 del pin ya salió con su sección (−386). No se queda pegado afuera.

## Fase 3 — Panel en móvil y tablet

- [x] **«Y más...» y el formulario.** Causa: la llegada se armaba con la coreografía del
  umbral (`useCoreografiaActiva`) y dejaba el remate en `espera` (`invisible`) hasta el
  disparo; si la página perdía la coreografía —un ancho que cruza 1024, la emulación de
  un aparato sobre una página cargada en escritorio— el estado nunca volvía a `quieto` y
  quedaba invisible para siempre. En un teléfono cargado en frío se veían, sin llegada.
  Arreglo: el remate lee `useMovimientoEnTodoAncho()` (nuevo en el contrato: la política
  de movimiento sin el umbral) y sin movimiento vuelve a `quieto`. Medido a 390 y 768:
  llega al pasar el disparo, se queda más abajo, vuelve (traslado 358 / 736 px) sólo al
  subir por encima del disparo, y llega otra vez. Afirmado con control.
- [x] **Palabras de fondo abajo de 1024**: quietas (sin `Bloque` ni profundidad), con el
  mismo alfa (`ALFA_DEL_FONDO`, 1,0595:1), una en el aire entre cada feature y la siguiente
  —siete palabras, siete huecos—: nunca debajo de una.
- [x] **Parallax interno** en todo ancho (la capa mide 130 % en todo ancho); la profundidad
  de las features sigue siendo sólo de escritorio. CPU ×4 bajando la galería: 13,29 / 13,31 ms
  de media (390 / 768), p95 13,9, máximo 19,5 / 20,7 ms, 0 cuadros de más de 33 ms.
- [x] **Ocho features en una columna** con sus anchos alternados (sin cambios).
- [x] **1024**: «Tu Panel» de 48 a 65 px (1,3 `display`) y el cuerpo a `titulo-s`; las
  imágenes ×1,07 (431 contra 404 px la más grande), el máximo que el modelo del caos deja
  pasar a 960 × 768 con las de la derecha corridas hacia adentro. Medido en el navegador:
  3 en pantalla como máximo y ningún título tapado. 1025 no cambia (404 px, 48,2 px).

## Fase 4 — Verificación y reporte

- [ ] lint + `tsc --noEmit` sin errores nuevos.
- [ ] Batería en verde.
- [ ] Invariantes nuevos con control.
- [ ] Capturas a 320/375/425/768/1024 de trabajos, servicios y panel.
- [ ] Grabación a 375 con toque.
