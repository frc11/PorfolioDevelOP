# L2 · resultado

Commits: 88756153 (Servicios sin gatillo en el cruce con Demos), 1c6d9f58 (Portfolio, formulario y Demos en el teléfono), 5d050269 (Demos de escritorio). Plan: `L2-plan.md`. Banco nuevo: `scripts-carga/l2-telefono.ts`. Fotos: `C:\nocturno\cola3-fotos\L2\` (`l2-telefono\` y `demos-41e\`).

## Por ítem

1. **Portfolio en una pantalla (teléfono y tablet): hecho.** Banco `MODO=pantalla`: título, bajada, tarjeta entera (cada fila de la ficha adentro), flechas y barras dentro del cuadro a 390×844, 375×667, 425×824 y 768×1024 (4 de 4; fotos `pantalla-*-producto.png`). El video mide 188 px a 390×844 y 108 px a 375×667. Control `CONTROL=con-resena` (la reseña a la vista): rojo a 375×667 (el video queda en 19 px). Ancla `#portfolio-banu-scents`: 3 de 3 (390×844, 375×667, 768×1024; Banú activa y todo en el cuadro; `ancla-*.png`).
2. **El formulario «¿El próximo sos vos?»: hecho.** Banco `MODO=formulario`: 0 desbordes a 320, 360, 375, 390 y 425; hueco con el carrusel de 40 px (antes, media pantalla); «Enviar» y «O escribinos por WhatsApp» en una fila a 425 y apilados a la izquierda abajo de eso. Control `CONTROL=desborde`: rojo. La causa era la columna de `EstadoDeEnvio` (de contenido): el texto largo ensanchaba el formulario.
3. **Demos de escritorio más chico y entero: hecho.** `demos-escritorio.ts MODO=entera`: abanico entero (8 px de margen abajo) y debajo de la bajada en 1440×900 (placa 177 px), 1366×768, 1280×720 y 1024×768 (164 px, el piso), y también en 1920×913 (la captura de Valentino; 207 px). Control `CONTROL=sin-alto`: rojo en 1920×913 (placa 242 px, se sale); en 1280×720 no falla, porque la subida de la columna sola ya alcanza. Espejo con el Portfolio: exacto en 1440×900 (Δ 0) y en 1920×913; roto a propósito en 1366×768, 1280×720 y 1024×768 (el título de Demos sube, 38 px a 1024×768). `MODO=espejo` con la spec nueva: 2 de 2; su control `sin-espejo`, rojo. La pantalla de carga no se tocó.
4. **Velo de Demos en el teléfono: hecho.** El halo y el degradé del Portfolio en el bloque de Demos. Por estilo computado, iguales a los del Portfolio a 425 y 390 (`MODO=velo`, `velo-*.png`). Test s84-demos-telefono con control.
5. **Scroll simple de Portfolio a Servicios: hecho (CDP; no visto en un teléfono real).**
   - **Demos:** pasa a ser una pantalla sin `sticky`. Antes eran 3,3 pantallas quietas.
   - **Servicios:** en el teléfono ya no tiene gatillo de entrada ni de salida hacia Demos. Los gatillos entre servicios siguen (L3).
   - **Banco `MODO=recorrido`**, bajando del Portfolio a «Nuestros servicios» y volviendo, con rueda y con dedo, a 390×844 y 768×1024: 4 de 4. Hubo 0 vuelos de gatillo, 0 gestos trabados y 0,00 pantallas con Demos llenando el cuadro.
   - **Control `CONTROL=con-gatillo`:** rojo. Con la rueda hay 10 vuelos y con el dedo se traba.
   - **Alturas (`MODO=alturas`):** la sección mide exactamente el flujo más una pantalla, y Servicios empieza en su pie, a 320, 375, 390, 768 y 1000 de ancho.
   - **Deriva de la escena:** s76 §48 da un desvío de 0 afuera de la sección, con flujos de 1.200 a 9.000 px de la regla y cinco altos de ventana.
   - **`/v3#servicios` a 390:** Servicios queda en 72 px durante toda la carga.
   - **Base:** antes del lote, ese salto se corría unos 2.300 px, porque la sección se achicaba al decidir el carrusel. Con la sección corta se corría 6.300 px; está arreglado.

## Compuerta
- **ESLint:** 0 errores en lo tocado. Quedan 2 avisos viejos de `os` sin usar en `demos-escritorio.ts` y `demos-telefono.ts`.
- **tsc --noEmit:** 0 errores.
- **`npm run verificar` contra la base:**
  - **Base:** el mismo comando antes de tocar, con 8 grupos con falla y 14 suites: s1, s2, s3, s4, s5, s7, s8 y s17. Todas son de build o peso, o ya estaban.
  - **Con L2:** al principio salieron 3 suites más (s52-nocturno-final, s52-pulido-1, s53-pulido-2). La causa era la posición de mi selector en las listas del velo, que esas suites leen como texto. Moví el selector al principio de cada lista, sin tocar los tests, y las tres volvieron a verde.
  - **Resultado:** la misma lista de fallas que la base.
- **Afirmaciones:** el conteo sube (s76 751→764, s78 688→696, s84 96→103).
- **Corridas sueltas:** `verificar` corrió antes de los arreglos de la revisión. Las suites que esos arreglos tocan las volví a correr sueltas, todas verdes: s52 ×2, s53, s76, s78-c2-51 y s84-demos-telefono.
- **Control rompiendo el código:** con Servicios con `salidaDeArribaLibre: false`, s78-c2-51 da rojo. Lo restauré.
- **Humo del home:**
  - **A 1440:** matriz del Portfolio (`matriz.ts`, `SOLO=rueda-desde-arriba,rueda-desde-demos`), 24 de 24.
  - **A 390:** el recorrido de arriba, con rueda y dedo.
  - **Sin verificar:** la ráfaga (`MODO=rafaga`) no corrió, ni a 1440 ni a 390.
- **visual-qa:** no lo despaché. Las fotos y las medidas en el sitio las saqué yo, con Chrome contra el dev en :3002.
- **Revisión independiente (Sonnet), 8 puntos:**
  - **Arreglados:**
    - (1) El dedo decidía la dirección por evento: un temblor en la entrada lanzaba el vuelo de salida. Ahora la cuenta desde que tocó, como la de abajo.
    - (6) El salto a `#servicios` se corría. Ahora se compensa.
    - (8) Había una clase deletreada en un comentario.
    - (2) El comentario prometía que la página «se detiene» en la entrada; ahora dice lo que pasa de verdad.
  - **Anotados, sin arreglar:**
    - (2) Con un gesto rápido real, el navegador puede no dejar frenar el scroll en la entrada de Servicios. En ese caso los servicios pasan por el scroll, sin vuelo.
    - (3) El abanico no está centrado en el espacio libre: va debajo de la bajada y sobra aire abajo a 1440×900 (106 px).
    - (4) En alturas menores de 740, la bajada del Portfolio queda un paso más chica que la de Demos.
    - (5) No probé teléfonos más bajos que 667.
    - (7) El arrastre del dedo no tiene test puro: lo cubre el banco.

## Decisiones tomadas solo
- L2-1: El Portfolio en el teléfono toma la forma de Demos (título y bajada a la izquierda, carrusel que llena la pantalla), pero el título conserva su tamaño propio (no el de Demos, más grande): a 375×667 la tarjeta necesita ese alto.
- L2-2: La reseña queda en el marcado, oculta (`hidden`), como las filas que no se muestran; en escritorio no cambia.
- L2-3: Lo que cede en la tarjeta es el video (contenedor de tamaño, 16:10 sin deformar). En alturas < 740 (`banda.css` §4a) la ficha y la bajada van más juntas.
- L2-4: El piso de la tabla del panel (757svh) lo suelta el cliente con el carrusel ya decidido, como hacía el túnel archivado, no el CSS del servidor. Así la sección no se achica antes de hidratar.
- L2-5: El tramo anotado a la escena llega al final de la sección: la escena ve lo de siempre después de Trabajos (bit a bit) y recorre su medio y su cola más rápido adentro (k ≈ 0,2 a 390×844).
- L2-6: Servicios en el teléfono: la entrada desde Demos es scroll libre; el gesto que trae la página no da el primer servicio (eso lo da el gesto siguiente, gatillo de L3); desde la entrada, subir es scroll libre.
- L2-7: `Gatillo` del contrato suma `claseDelContenido` (opcional; sin la prop, el marcado de siempre).
- L2-8: Demos de escritorio: la placa baja del 30 al 27 % de la columna, con tope por el alto; el piso (164 px) se mantiene; la columna sube sólo si ni el piso entra (el espejo se rompe sólo ahí).
- L2-9: El ancla de la carga se vuelve a poner si el documento cambia de alto, hasta un gesto o 4 s.
- L2-10: Tests cambiados por la spec nueva (cada uno dice `[L2]`):
  - s76-portfolio-carrusel §46–48: la reseña oculta, el flujo sin mínimo y el tramo con la cola;
  - s76-portfolio-b12c: `EstadoDeEnvio` con `grid-cols-1`;
  - s84-demos-telefono §5 y §7: Demos ya no está pegado y mide una pantalla;
  - s84-demos §5: `--libro-ancho`;
  - el registro de tokens;
  - los bancos `demos-telefono.ts` (caso `entrada`) y `demos-escritorio.ts` (criterio `espejo`).

## Supuestos y descartes
- «El mismo velo» lo leí como el halo y el degradé de `banda.css` §4 (lo único que el Portfolio tiene y Demos no).
- Descarté sacar el `Gatillo` del carrusel del Portfolio para que estirara: le agregué la clase del contenido.
- Descarté tocar `secciones.ts` (`altoAngosto`): la regla de alturas se compensa con el tramo.
- No toqué Servicios por dentro (L3).

## Qué tiene que mirar Valentino
1. `/v3` a 390 y a 375×667 (teléfono real si puede): el Portfolio entra entero en una pantalla, sin el testimonio; abajo, el formulario cerca y sin salirse.
2. Mismo ancho, scrolleando con el dedo de Portfolio a Servicios y de vuelta: Demos pasa como una sección más, sin tramo quieto; entrar a «Nuestros servicios» y volver a Demos sin gatillo. Mirar también la escena de fondo en ese tramo: ahora recorre su parte más rápido.
3. `/v3` a 1440×900 y 1280×720 (o su pantalla): Demos más chico y entero; a 1280×720 el título de Demos queda más arriba que el de Portfolio (a propósito).
4. Demos en el teléfono: el título y la bajada con el mismo halo/velo que Portfolio.

Banderas: ninguna nueva. Defectos sólo del banco: `__defectosDeLosGatillos='con-gatillo-arriba'`, `__defectosDeDemos='sin-alto'`.
