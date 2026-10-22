# SPRINT B6 · NOCTURNO 2026-10-22 — La sección del Panel

Tarea: `docs/cola/2026-10-22/21-B6-panel.md`. Rama `nocturno/2026-10-22-b6`. Sin navegador: lo que depende del píxel lo mide el
orquestador con `scripts-carga/panel-b6.ts` (abajo, «Qué mirar»).

## Plan

1. **El título** «El panel donde controlás / TODO» en la letra de las palabras fundidas del fondo de antes: la cara de display
   (Archivo, que es de MAYÚSCULAS: 68 puntos de código, sin minúsculas), así que va en mayúsculas. Grande, centrado y de lado a lado
   (el ancho útil sobre 10,1, con tope de 15svh). Se pinta de gris claro a tinta palabra por palabra con el scroll: el avance sale del
   CENTRO del título en la pantalla (arranca con el centro en el borde de abajo y termina con el centro en el 50 %). «TODO» en
   cursiva y subrayado a la par de su pintado. Una sola suscripción de scroll, sólo cerca del cuadro, que escribe una variable por
   palabra (`--pintado`); el color y el subrayado los resuelve la hoja.
2. **Un respiro** antes de los módulos: el único tramo que crece. La sección llena los 700svh de la tabla en todo escritorio.
3. **Tres módulos alternados** (derecha, izquierda, derecha): las maquetas del panel (`_panel-vivo/`, datos de ejemplo y el sello
   «Ejemplo»), un poco más chicas (52 % del ancho útil, 60 en el escritorio angosto, tope de alto 64svh). Del lado opuesto, el grupo:
   la palabra fundida (pálida, al 1,0595:1 de las palabras del fondo de antes) con el título y la descripción en tinta debajo, los tres
   centrados en su columna (el mismo eje). `?grupo=final|union`.
4. **El candado de la rueda**: con la rueda encima de un módulo, scrollea la página y aparece «Hacé clic para scrollear acá» sobre
   el módulo atenuado; el clic habilita el scroll de adentro; salir lo bloquea. En el teléfono, el dedo y un toque.
5. **El CTA a pantalla completa**: «Tu panel crece con vos.» pintado como el título; la bajada; «Probar el panel» (no hace nada
   todavía), la «o» y el newsletter que ya envía.
6. **Teléfono**: apilado; la palabra fundida mucho más discreta, `?palabra-movil=union|debajo`.
7. **Los títulos que vienen desde abajo** (el de los módulos): `_secciones/_contrato/TituloQueSube.tsx`, importable por B4.
8. **REGLA DE ALTURAS**: desde 1024 la sección mide la tabla (k = 1, sin tramo). Abajo de 1024 mide su contenido: `tramo.ts` la anota
   a la escena con `anotarTramo` (k = lo medido sobre el modelo del alto de antes).

## Log

- Base (antes de tocar): s10-acceso 5 fallas, s27 2, s39 2, s41 1, s5-compacto 1 (todas de antes); s3-peso y s5-peso piden un build.
- La sección vieja (el caos de ocho features, el fondo, «Y más…») se borró: `Fondo.tsx`, `Galeria.tsx`, `Remate.tsx`, `entrada.ts`,
  `tokens.ts`. `Tarjeta.tsx` sigue siendo el marco del módulo (las mismas clases del marco que fijan s47/s48), ahora con el candado.
- Nuevos: `TituloQueSePinta.tsx` + `pintado.ts`, `Fila.tsx`, `CtaDelPanel.tsx`, `candado.ts`, `banderas.ts`, `tramo.ts`;
  `_contrato/TituloQueSube.tsx`. Reescritos: `TuPanel.tsx`, `contenido.ts`, `geometria.ts`, `s6-tu-panel.invariant.tsx`.
- `_panel-vivo/`: `rueda.ts` (el contexto del candado; bloqueado, nunca `data-lenis-prevent`), `MarcoDelPanel.tsx` (bloqueado, el
  contenido sin scroll), `DemoDelPanel.tsx` (abajo de 1024 el dedo entra sólo con el candado abierto).
- `_lib/diagnostico/publicar.ts`: el `remate-dormido` del diagnóstico de la carga (`?diag=carga`) mira ahora el gatillo del CTA.
- Invariantes que fijaban la sección vieja, a la spec nueva con su control: s10-acceso (el censo: +1 parada, −5 encabezados), s37
  (el canal entra por `TituloQueSube`), s41 B4 y s42 B4 (el CTA entra con el gatillo común, en la misma línea), s45 (tres módulos),
  s46 T1 (la escala de la maqueta), s47 B1 (ningún módulo a lo ancho), s48 A7/A8 (una pantalla entre módulos; el dedo con el candado),
  s52 C2 (cada módulo a todo el ancho abajo de 1024), s75 H4 (el salto lo posa la máquina del contrato), s77 §3 (el gatillo común; las
  huellas de Tu panel, retomadas).

### Ronda del navegador (el banco en la integración, 2026-10-22)

`panel-b6.ts` a 1440 × 900 y 1024 × 768: ok el alto (7,000 pantallas), el pintado (termina al 49,5 y 49,2 %), el AA (peor
6,43:1), el CTA y la salida del candado. Lo que falló, y qué estaba mal:

- **b · el eje (49,6 % y 76,3 %): el banco.** Medía el rango del texto entero, y con la coreografía el título y la descripción
  llevan su texto completo en un `sr-only` de 1 px con `white-space: nowrap`, que desborda a la derecha. Ahora mide la tinta
  visible (la unión de los rectángulos de los textos, sin lo visualmente oculto).
- **b · `?grupo=final` (−327 y −263 px) y `?grupo=union` (123 contra 287): el banco.** Medía el marco, que lleva la llegada de P2
  (sube desde el 60 % de su alto: 0,6 × 545 = 327 y 0,6 × 438 = 263) y todavía no había llegado. Con la caja de layout del módulo
  (el `Bloque`, que nunca se transforma), final da el pie al del módulo y union cae en la mitad del aire (123 + 327 = 450, la mitad
  de 100svh a 900).
- **c · el cartel no se veía: el banco, con un retoque del producto.** El ratón al 60 % del módulo y tres muescas: la página sacaba
  el módulo de abajo del ratón (un `pointerleave`) y la salida cortaba el cartel. El banco deja ahora el ratón encima (cerca del
  tope de lo visible, una muesca). El producto: la salida ya no corta el cartel bloqueado; se va con su tiempo y su fundido.
- **c · CONTROL, la página se movía 298 px con el candado abierto: el producto (y el banco).** Abierto, la rueda pasaba a la página
  en el borde del contenido (la semántica vieja de `rueda.ts`: «en el borde, la rueda es de la página»). Ahora, abierto, el marco
  lleva `data-lenis-prevent` (Lenis no toma la rueda) y frena (`preventDefault`) la que el contenido no absorbe
  (`laRuedaEsDeAdentro`: en su borde, sin recorrido o fuera de él); el dedo, `overscroll-behavior: contain`. El banco además hacía
  el clic con la caja vieja (después de scrollear): ahora relee la caja antes de cada paso y prueba también el borde.
- El modelo del alto viejo, calibrado contra lo medido (reaplicado de `cb25e1ea` de la integración).

## Qué mirar (Valentino)

1. `http://localhost:3000/v3` a 1440 × 900: scrolleá hasta Tu panel. El título se pinta palabra por palabra y termina con su centro en
   la mitad de la pantalla; «TODO» en cursiva se subraya mientras se pinta.
2. Los tres módulos: derecha, izquierda, derecha; del otro lado, la palabra fundida pálida con el título y la descripción.
   Compará `?grupo=final` (defecto) y `?grupo=union`.
3. Con la rueda encima de un módulo: la página sigue y aparece «Hacé clic para scrollear acá». Clic: scrollea adentro. Sacá el ratón:
   vuelve a bloquearse.
4. El CTA: una pantalla; «Probar el panel» no hace nada (todavía); la «o»; el newsletter.
5. A 390 y a 768: todo apilado. Compará `?palabra-movil=union` (defecto) y `?palabra-movil=debajo`. Arrastrá sobre un módulo (la
   página sigue, «Tocá para scrollear acá»), tocalo (scrollea adentro), tocá afuera.
