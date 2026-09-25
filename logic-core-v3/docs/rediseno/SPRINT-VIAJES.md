# SPRINT VIAJES — el navbar lleva a cada sección con el gesto del hero

Rama `rediseno/home` · dev 3000 · punto de retorno: tag `antes-de-viajes`.
Un solo gesto (el del CTA del hero: velo, pausa y viaje; `viajeSinLenis` abajo de 1024), una
sola duración, y destinos que salen de la coreografía de cada sección.

## Fase 0 — Leer y medir

- [x] **El gesto ya existía y ya duraba siempre lo mismo**: `DURACION_DEL_VIAJE_MS` (2.600 ms) se
  le pasa igual a Lenis (`duration`, que con `easing` anima por tiempo: `lenis.mjs:79`) y a
  `viajarSinLenis` (reloj de pared). No había nada que pasar de velocidad a duración: se afirma.
- [x] **Por qué hasta hoy viajaba un solo enlace**: la escena se suspende en la banda opaca
  (Servicios y Tu panel) y con el `<main>` apagado se vería el último cuadro congelado; y el
  revelado recorta la sala en los bordes de los paneles.
- [x] **El estado que corre por tiempo** (no es función del scroll): el barrido de la noche (760
  ms, disparado por un observador), el túnel (persigue el scroll a 500 px/s con dos resortes y un
  regulador), el rodillo de Servicios (1,4 s) y la cámara (persigue la pose con `SETTLE_TAU`). Lo
  demás de la coreografía DOM es función pura del scroll: los resortes de `Bloque` asientan en 10
  ms porque motion lee `duration` en milisegundos.
- [x] **El día del final** cambia de golpe en el medio del bloque opaco; con el scroll no se ve,
  en un viaje sí.
- [x] No hay capturas de los destinos en el disco: los nudos salen de las descripciones del pedido
  y de la coreografía, y se miraron en pantalla (`~/.cache/b4-medicion/viajes/`).
- [x] Banco propio: `scripts-viajes/` (Chrome por CDP, con candado), siempre con
  `prefers-reduced-motion: no-preference`: el Chrome de medición viene con movimiento reducido y
  con eso cada sección pinta su árbol quieto.

## Fase 1 — La escena durante el viaje

- [x] `_lib/escena/viaje.ts`: el viaje en curso (destino, clase de luz y luz de un día a día), que
  lo escribe el efecto y lo leen la escena, la noche, el túnel y el rodillo.
- [x] **La sala dibuja entera durante el viaje**: también en la banda opaca y sin la máscara del
  revelado (`ataduraAlScroll.ts`). La escena sigue en viaje hasta que el velo terminó de volver,
  así en un destino opaco no asoma la sala de abajo mientras el `<main>` es transparente.
- [x] **La luz de cada punta es la que se VE** (`planDelViaje.ts`): Trabajos es de noche; una
  sección opaca de papel es de día; una que deja ver la sala es de noche bajo `RIM_NIGHT_LEVEL`.
  - **De día a día** (Hero, Quiénes, Servicios, Por qué entre sí): la luz va de la de salida a la
    de llegada con el avance del viaje, sin pasar por la noche aunque se cruce Trabajos (ni
    barrido ni noche). Grabado: `grabaciones/viajes-1440.mp4`.
  - **De noche a día y de día a noche**: el barrido corre como siempre donde el recorrido lo
    cruza; y el día del final, que el scroll cambia escondido, se recorre con el reloj del barrido
    (la vuelta al hacerse de día, la ida al hacerse de noche), no de golpe. Durante el viaje la
    noche tampoco se repone de golpe detrás del bloque: se vería (era un corte de un cuadro en Por
    qué → Trabajos; ahora es la rampa de la ida).
- [x] **Al llegar, todo asentado en lo que dejaría el scroll**: la noche con la regla de las cuatro
  entradas (`CapaDeLaGota`), el túnel quieto en su reposo para ese punto —durante el viaje no
  reproduce su zoom— (`CapaDelTunel`), y el rodillo posado sin rotar (`disparo.ts`).

## Fase 2 — Los destinos

- [x] `_componentes/destinosDelViaje.ts`: cada destino es un nudo de la coreografía, calculado en
  el click con las anclas con nombre de `bloqueAnimado.ts` sobre el documento de ese instante.
  - **Quiénes somos**: la pose de reposo, el fin de la ventana más tardía de la primera pantalla
    (título, trazos, ≠ y cuerpo). A 1024 × 768 esa pose no entra en el cuadro (el título ya pasó
    debajo de la barra) y el destino es el último píxel con el título despejado.
  - **Trabajos**: «Portfolio» terminó de subir a su lugar, el más tarde entre el fin de su máscara
    y el pin del cartel; la huida arranca una pantalla después.
  - **Servicios**: un píxel antes de que el 00 pase al 01, que arranca con el primer píxel del pin.
  - **Por qué develOP**: el fin de `VENTANA_DE_LA_SUBIDA_DE_LA_FRASE`, que es el arranque del
    primer valor. Abajo de 1024 no hay pin y ese momento no existe (el primer valor arranca antes
    de que la frase termine de llegar); ahí la frase arriba, el tope de la sección.
  - Sin nudo, el ancla de antes.
- [x] Medido en los cuatro anchos: ver Validación.

## Fase 3 — El gesto en la barra y el menú

- [x] **Qué viaja**: el CTA del hero, los ítems de la barra y los del menú móvil, con UN escucha
  (`SELECTOR_DE_LOS_VIAJES`). «Contacto» no viaja: va a `#contacto`, que no es una sección, y lo
  abre el formulario. El CTA del hero comparte el destino de Trabajos con la barra.
- [x] **Duración constante**: afirmada con un reloj falso (900 px y 21.000 px tardan lo mismo) y
  medida en el navegador: del click a la llegada 2.917–2.970 ms en todos los destinos y anchos
  con barra, sea Hero → Quiénes o Hero → Por qué.
- [x] **Movimiento reducido**: salto directo al MISMO nudo, tapado por el fundido del velo
  (`--duracion-rapida`, que la regla global dejaba en 1 ms). Se monta en cualquier ancho.

## Validación

- [x] **Invariantes nuevos, con control positivo**: `s27-viajes` (51 afirmaciones): qué viaja;
  duración constante (reloj falso: 900 px y 21.000 px tardan lo mismo); cada destino es su nudo
  (sobre un DOM falso, con el redondeo de cada uno y ningún píxel escrito a mano); la luz de un
  día a día nunca baja al umbral de la noche aunque cruce todo el arco con la noche puesta; el día
  del final no corta ni repone durante un viaje; túnel, rodillo y escena asentados; el salto.
  `s18-deslizamiento` al día (99): el destino cambió de sujeto, del ancla al nudo.
- [x] **El estado después del viaje es el del scroll** — `scripts-viajes/d-estado.ts`, las 20
  combinaciones a 1440, contra la llegada por scroll al MISMO píxel: el DOM en cuadro, igual en
  las 20; la escena (por bloques, contra su propio ruido medido con la misma separación de
  tiempo), dentro del ruido en 15 de 16 donde se ve y en la otra 0,03 por encima (Por qué →
  Trabajos, 5,18 contra 5,15); en Servicios no se ve la sala. Control: 300 px antes da 3–41
  diferencias de DOM y 13,8–59 de escena. Fuera de cuadro, el parallax del fondo de Tu panel
  guarda el último valor que escribió y lo reescribe antes de volver a verse: no se compara.
- [x] **Cada destino en su nudo** — `scripts-viajes/e-nudos.ts` en 1440, 1024, 768 y 375 (reposo
  de Quiénes somos, «Portfolio» quieto y sin huir, el 00 que pasa al 01 un píxel después, la frase
  subida sin valores; abajo de 1024 el tope). El ancla nativa falla en los 16 (control). A 1440
  Quiénes somos y Por qué quedaban un píxel antes por redondear hacia abajo: ahora cada nudo
  redondea según lo que pide (hacia arriba «el primer píxel en que terminó», hacia abajo «el último
  antes»).
- [x] **Movimiento reducido**, 1440: los cuatro son un salto (dos posiciones de scroll) con el
  fundido del velo (~550 ms ida y vuelta) y llegan al nudo. Control: sin la preferencia, 186
  posiciones.
- [x] `s24-dia` y §19 en verde (`test:s19` y el §19 de Trabajos, las cuatro entradas).
- [ ] **Pendiente — el sistema cortó el dev server y la cadena por falta de memoria**: el salto a
  375, la noche de día a día en el navegador (`f-noche.ts`), las dos grabaciones (la de 1440 hay
  que repetirla: se hizo antes de sacar la reposición de golpe), la superposición del túnel
  (`ref-tabla --nuestra` + `ref-comparar`), volver a medir los nudos de Quiénes y Por qué a 1440
  con el redondeo nuevo, el control de las tres llegadas al Hero y `tsc`/lint después del redondeo.

## Hallazgos fuera del sprint

- `s5-trabajos`: el cartel copia las cinco propiedades de la pastilla y la pastilla cambió de
  radio en el sprint de Contacto (fase 2). No lo toqué.
- `s5-compacto` (las cadenas de las fotos del equipo), `s6-tokens` (`70svh` y `grid-rows` del CTA
  final) y las suites que piden un build (`s5-peso`, `s7-compuerta`, `s8-*`): anteriores.
