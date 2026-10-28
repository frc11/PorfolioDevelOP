# SPRINT C2 · 60b — Tu panel, el cuerpo (cola 2, 2026-10-23)

La tarea 60 partida en dos: esta es el CUERPO del Panel (título, módulos, espacios, teléfono y tablet). El CTA del Panel es la 60c, en paralelo
(no se tocaron `CtaDelPanel.tsx`, `NewsletterDelPanel.tsx` ni los objetos `CTA` / `NEWSLETTER` de `contenido.ts`).
Fuente: `docs/cola/2026-10-23/60-panel.md`, `05-TEXTOS.md` §El Panel, `08-REVISION-VERBATIM.md` ítem 15, ítem 21 y la lista de móvil.

## Plan

Escritorio
1. «Lo que nos distingue» detrás de «El panel donde controlás TODO»: pálida (el alfa de las palabras fundidas, 1,0595:1), en la letra de
   display, centrada en la caja del título, de lado a lado en un renglón (`TuPanel.tsx`, `geometria.ts`).
2. Los espacios: el respiro ya no crece hasta la tabla; título → módulo 16svh, entre módulos 18svh, último módulo → CTA 6svh.
   REGLA DE ALTURAS: el `<section>` se monta sin el piso de la tabla (`alto: 'auto'` en la entrada que recibe `Seccion`; `secciones.ts`
   intacto) y la sección se anota a la escena con `anotarTramo` EN TODO ANCHO (`tramo.ts`).
3. Los textos de `05-TEXTOS.md` (los dos títulos y los dos comienzos de descripción).
4. `?grupo=` queda en `final` y `union` se borra: con un solo valor la bandera se fue entera (`banderas.ts` borrado).

Teléfono y tablet
- El título más grande en tres renglones («El panel donde» / «controlás» / «TODO»): un salto que sólo existe abajo de 1024
  (`cortesEnElTelefono` en el renglón; `TituloQueSePinta` lo dibuja), con su divisor (5,74) y su tope (10svh), nunca menos que antes.
- `?palabra-movil=debajo` es el producto (bandera borrada): cada palabra fundida del ancho de la sección (su ancho en em, medido contra el
  binario, por 1,015: la caja al 98,5 %, la tinta del 94 al 98 %) y más notoria (alfa 0,06: 1,13:1). Subida un cuarto de su alto, para quedar sobre el título.
- Los títulos de los módulos en Archivo (la cara de display del sitio) a 600, en minúsculas y en el tamaño `titulo-l` fluido (24 px a 390):
  distintos del cuerpo (Chivo 15) y del título general (Archivo 700 en mayúsculas).
- «Lo que nos distingue» abajo de 1024 en dos renglones, de lado a lado.

## Log

- Lectura: el respiro de escritorio crecía (`grow`) hasta los 700svh de la tabla, así que achicar `entreFilas` sólo agrandaba el respiro
  («probablemente esa parte no se achicó bien»). El piso del `<section>` lo pone `Panel` desde la tabla; sin tocar ni la tabla ni `Panel`, la
  sección le pasa a `Seccion` su entrada con `alto: 'auto'` y la escena sigue leyendo los 700svh de la tabla.
- La `k`: medida en cada carga, `alto medido / alto de antes`. Desde 1024 el de antes son las 7 pantallas de la tabla (el banco de B6 midió
  7,00); abajo de 1024, el modelo calibrado de la sección de antes de B6 (`altoViejoAngosto`, sin cambios). Nada que calibrar a mano.
- Modelo de escritorio (CTA de una pantalla): 1440 × 900 6300 → 3568 px (3,96 pantallas, k ≈ 0,566); 1024 × 768 5376 → 2930 px (3,81,
  k ≈ 0,545). Espacios en px, antes → después: 1440 × 900 título → módulo 554 → 144, entre módulos 900 → 162, último → CTA 900 → 54 (más el
  aire de adentro del CTA, de la 60c); 1024 × 768 588 → 123, 768 → 138, 768 → 46. Abajo de 1024 los espacios no cambian (16 y 14svh).
- Pruebas: `s6-tu-panel` 165 / 0 (antes 133). Lo nuevo en `_lib/__tests__/s6-tu-panel-c2.ts` (un módulo del instrumento, para que la
  sección siga con UN invariante: `s6-lane`), con sus controles. Actualizadas por diseño, con control: `s6-tu-panel` §1 (los títulos), §5 (el
  tamaño angosto), §7 y §8 (las banderas y el alto de la tabla se fueron), §11 (el tramo en todo ancho); `s48` A7 (entre módulos: de 10 a
  25svh, controles con 100 y con 4). Sin fallas nuevas en s37 s38 s39 s41 s42 s43 s45 s46 s47 s48 s49 s51 s52 s6-servicios s7-pedido s10-acceso
  s21-fotos s27 s74 s75 s76 s78; s6-render (1), s6-tokens (3), s6-lane (2) y s7-contrato (1) con las fallas de base (reseñas y servicios).
- Banco: `panel-b6.ts` sin `?grupo=union`, el alto (f) contra el contenido, el botón del CTA por su lugar (es de la 60c), y `MODO=espacios`
  (cuatro anchos) con `CONTROL=espacios-de-antes`. Sin correr (lo corre el orquestador).

## Qué mirar

- `MODO=espacios BASE=http://localhost:3000 npx tsx scripts-carga/panel-b6.ts` (verde) y con `CONTROL=espacios-de-antes` (los espacios en
  FALLA en los cuatro anchos). `BASE=http://localhost:3000 npx tsx scripts-carga/panel-b6.ts` (verde: eje, final, candado, cartel, AA).
- 1440 y 1024 `/v3#tu-panel`: «LO QUE NOS DISTINGUE» apenas visible detrás del título; menos aire hasta el primer módulo, entre módulos y antes
  del CTA. La escena después del Panel (Por qué develOP) llega como antes.
- 768 y 390: el título en tres renglones y grande; cada palabra fundida de lado a lado y un poco más notoria, detrás del título del módulo;
  los títulos de los módulos en Archivo, distintos del texto.

## Ronda 2 (después de la medición del orquestador en la integración)

- Las 5 fallas de ancho eran del BANCO: `tinta` restaba `Math.min(…lefts, 0)`, o sea 0, y daba el BORDE DERECHO de la palabra en la
  ventana, no su ancho. El margen fijo de 32 px de la sección pesaba más cuanto más angosta la pantalla (101,6 % a 1024, 107,8 % a 390); en
  las fotos la tinta estaba adentro (≈ 93–96 %).
- El banco mide ahora las dos cosas, contra el ancho de lo que contiene la palabra: la CAJA (la unión de los rectángulos, que no tiene que
  pasar el 100 %) y la TINTA (el renglón más ancho en un lienzo con la fuente, el tamaño y el interletrado computados; del 94 al 100 %).
  Controles: `CONTROL=palabras-chicas` (el tamaño de antes) y `CONTROL=palabras-desbordadas` (más grandes que la sección).
- El margen de las palabras pálidas bajó de 3 % a 1,5 % (`MARGEN_DE_LA_PALABRA` 1,015; los divisores del título 7,79 y 4): la caja al
  98,5 % y la tinta, sin el aire lateral de la primera y la última letra, del ~95 al ~97 %. `s6-tu-panel` pide la caja del 97 al 100 %.
