# L3 · resultado (Servicios, ítem 50)

Commits: 0372a9e7 (el código, los tests y los bancos) y el de los documentos. Plan: `L3-plan.md`. Banco nuevo: `scripts-carga/l3-servicios.ts` (`MODO=medidas|doble|fotos|cajas`). Fotos: `C:\nocturno\cola3-fotos\L3\` (`antes\`, `medidas\`, `banderas\`, `c2\`, `doble\` con los cuadros en JSON).

## Por ítem

1. **«Nuestros servicios»: hecho.**
   - Escritorio: el título en un renglón y más grande (112,5 px a 1440 contra 99 en dos renglones; 87 px a 1024 contra 71); la bajada en un renglón y más chica (25 px contra 32). El aro llena su caja (nuevo: la elipse toma la proporción de la caja, `uProporcion`); la caja es 1,12 veces el ancho del título, achatada 3:1, sube hasta la mitad del título (el arco de arriba pasa por detrás de las letras: medido) y centra la bajada. Caja 922×307 a 1440, 716×239 a 1024.
   - «Que no toquen el cartel»: el aviso «Scrolleá para explorarlo» quedó igual y debajo del aro; el banco cuenta los píxeles del color del aro sobre el texto y los chevrones del aviso en 6 capturas: 0 a 1440, 1024, 768, 390 y 375. Control (`CONTROL=aviso-en-el-aro`, el aviso corrido 40 px): 2624 píxeles, rojo.
   - Colores: `?aro-color=mezcla|tercios|ola`, por defecto `ola`. La causa de que «casi no se notara»: el color salía del ángulo de la SEMILLA de cada nanobot y no de dónde está; como cada uno gira a su velocidad, al minuto quedaban mezclados punto por punto (recién cargado se veía el degradé, como en la captura del teléfono). Ahora sale del ángulo actual (s81 con control) y los acentos del aro son más vivos (cian, violeta y esmeralda de la marca un paso más oscuros; los símbolos siguen con los oscuros del tema). Fotos: `banderas\1440-aro-{mezcla,tercios,ola}-{a,b}.png` (a y b, 1,5 s después).
   - Teléfono/tablet: título en dos renglones, 62,7 px a 390 (antes 24) y 92 px a 768; bajada en dos renglones, 21,7 px a 390 (antes 18,2) y 36 px a 768; el aro vertical (339×484 a 390, 498×711 a 768), centrado en todo el bloque con el aviso adentro y sin tocarlo. El aviso «Deslizá para pasar de servicio» existe una sola vez en el escenario (antes 4).
2. **Títulos de los servicios: hecho.** «Desarrollo / *web*», «Software / *a medida*», «Integraciones con / *inteligencia artificial*». Renglón 1 en la display condensada (la de `?titulo-servicio=1`); renglón 2 en cursiva con `?titulo-cursiva=1|2|3` (Instrument Serif, Fraunces, Playfair; `next/font/google`, perezosas; por defecto 1). Se fueron `?titulo-servicio`, `?fuente-servicio`, Cormorant y DM Serif. Un subrayado por renglón (rápido y desacelera; el segundo un escalón después; los dos llegan con la transición); la línea separadora de antes se fue. Alineación por la diagonal: web a la izquierda con el renglón 2 corrido 10,2 px (1440) / 7,2 px (1024); software a la derecha con el renglón 1 terminando 12,1 / 8,5 px más afuera; IA centrado (0,0 px). En el teléfono los dos a la izquierda (la tangente es 0 abajo de 1024). Fotos: `banderas\1440-{web,software,ia-automatizacion}-cursiva{1,2,3}.png`.
3. **Cuerpo: hecho.** La letra de los cuerpos (Chivo, derecha), con el mismo tope, la misma franja de techo a pie y la misma diagonal. Tamaño: 24,8 px a 1440 (Instrument cursiva medía 29,4) y 18,5 px a 1024 (21,9): Chivo es más ancha y de ojo más grande, y el bloque entra igual de techo a pie; a la vista el tamaño es el mismo (ver L3-1). Teléfono: los párrafos 1 y 2, 20,8–21,7 px a 390 (antes 14, cortado) y 27–30,6 px a 768.
4. **Ir a la página del servicio: hecho.** El título (enlace dentro del `h3`), el video (enlace que no se anuncia ni entra al Tab) y «Leer más…» al final del cuerpo, en su propio renglón dentro del flujo con la diagonal (subrayado simple en el acento). Los tres con el viaje de B12b. El CTA «Quiero mi…» se fue del panel y de las pantallas quietas. Medido por panel: 3 enlaces, 2 en el Tab, 0 CTA viejo, «Leer más…» en el último renglón (1440, 1024, 768, 390).
5. **Pasar rápido sin teletransportarse: hecho.**
   - La máquina común suma `candadoMs` (opcional); Servicios usa 0: el gesto siguiente cuenta apenas termina el vuelo del salto (420 ms), y sigue siendo un servicio por gesto (el gesto que ya dio su paso se traga hasta que la rueda se aquieta). Demos y el Portfolio sin cambios.
   - La posición retoma desde donde está (`retomarHacia`): salta sólo si la VISTA salta más de uno (barra, ancla); lo que falta se recorre en una transición como mucho. Paneles, renglones, subrayados, capa y enjambre cuelgan de la posición: siguen de donde están, y los nanobots cambian de forma y de color sin saltar.
   - Bug que trajo el candado corto y quedó arreglado: en el teléfono, el MISMO dedo que llevaba a IA seguía de largo al recomendador al terminar el vuelo (la salida libre de C2-51). Ahora, como la rueda, el dedo que ya dio su paso no sale libre. Medido: `doble 390 desde 1` pasó de «paso 4» a «paso 3».
   - Diagonal por defecto: 7°.
   - Banco `MODO=doble` (dos gestos a 600 ms, cuadro a cuadro, desde la entrada y desde web): 6 de 6 a 1440, 1024 y 390; por cuadro de 60 Hz, Δ de la posición del enjambre ≤ 0,0304 (umbral 0,05) y centroide ≤ 73,6 px (umbral 200; la transición sola, sin apuro, ya da ~57 px por el resorte de la nube). Control `CONTROL=con-salto`: Δ 0,46–0,56 y centroide 190–322 px, rojo.

## Compuerta
- **tsc --noEmit:** 0 errores (base 0).
- **ESLint en lo tocado:** 0 errores; quedan 2 avisos viejos (`os` sin usar en `servicios-c2.ts` y `servicios-gatillos.ts`).
- **Suites** (base → ahora): s81-servicios 55 → 72, s6-servicios 24 → 25, s78-b12b 35 → 35, s78-c2-51 55 → 55, s6-lane 50 → 50, s3-tokens 29 → 29, s84-demos 65 (lee `useGatillos`); todas en 0 fallas. Controles nuevos en s81: el candado de antes (transición entera), la máquina sin vuelo, el criterio de salto de antes (dos), una posición con escalón, los dos subrayados juntos, el color por el ángulo de la semilla, los modos del aro reordenados, la órbita siempre 2:1. `verificar` completo no corrió (no lo pide la compuerta de la cola; las suites que leen lo tocado, sí).
- **Bancos en el sitio (dev :3002, Chrome del sistema, pestaña visible, placa NVIDIA):**
  - `l3-servicios MODO=medidas` 1440, 1024, 768, 390: 76 de 76 (control del aviso: rojo).
  - `servicios-gatillos` 1440, 1024, 390: 22 de 22 (casos nuevos: «doble muesca a 600 ms» 0→1→2, «dos muescas a 250 ms» 0→1; «teclado seis seguidas» pasa a 1→2→3). Control `con-candado`: rojo (2 casos).
  - `servicios-capa` 1440, 1024: 4 de 4, 0 px sobre el título y el panel en el cuadro del cambio (el cambio cae en g 0,486 y 0,495).
  - `servicios-c2` 1440, 1024, 768, 390: 27 de 27.
  - `l3-servicios MODO=doble`: 6 de 6; control rojo.
- **Humo del home:** a 1440, `matriz.ts SOLO=rueda-desde-arriba,rueda-desde-demos` 24 de 24 y `MODO=rafaga` 16 de 16; a 390 y 768, `l2-telefono.ts MODO=recorrido` (rueda y dedo, del Portfolio a «Nuestros servicios» y de vuelta) 4 de 4. `servicios-gatillos` a 390 repetido después del arreglo del dedo: 2 de 2.
- **Revisión independiente (Sonnet), 6 puntos:**
  - Arreglados: (1) un control de s6-lane apuntaba al archivo renombrado y quedaba ciego (ahora exige ver sólo el módulo ajeno en `cursivaFraunces.ts`); (3) «inteligencia artificial» partía en dos renglones con un solo subrayado: en escritorio va en un renglón y el ajuste achica el título (52 px a 1440); (4) las pantallas quietas ponían software a la izquierda: usan la alineación de cada servicio; (5) un comentario de la entrada decía lo contrario del código; (6) el banco medía la mitad del corrimiento (ahora el real, ±1,5 px: 10,2 y 12,1 px a 1440, exactos) y nada ataba el orden de los modos del aro al sombreador (test nuevo con control).
  - Dejado a propósito: (2) los colores del aro son más vivos que los acentos del tema (L3-11): es lo que pidió «que se note»; si no le gustan, vuelven a los del tema cambiando una constante. (6, centroide) el umbral de 200 px deja pasar un caso del control por centroide, pero el criterio es conjunto y el de posición lo pone rojo (0,46–0,56 contra 0,05).
  - El renombre fuera de la sección: ver L3-5 (queda para que lo confirme Valentino).
- **Arreglo del dedo con su control:** antes del arreglo, `doble 390 desde 1` daba «paso 4» (rojo); después, «paso 3». s78-c2-51 fija las dos condiciones con `dioPaso`.

## Decisiones tomadas solo
- L3-1: «La letra de los cuerpos, de ese tamaño»: mantuve el mismo tope y el mismo ajuste de techo a pie (el bloque, la franja y la diagonal quedan iguales). El número en px baja (29,4 → 24,8 a 1440) porque Chivo es más ancha; con el número de antes no entra en la franja. A la vista, el cuerpo ocupa lo mismo.
- L3-2: El aro de escritorio deja de ser 2:1: con el título en un renglón, una elipse 2:1 que pase por detrás del título o queda más angosta que el título o deja la bajada colgando. Lo hice 3:1, 1,12 veces el título, con la bajada en su centro.
- L3-3: «Que no toquen el cartel de scroll»: lo leí como las dos cosas: el aviso no se cambia y el aro no lo toca (se mide en píxeles).
- L3-4: En el teléfono el aro vertical encierra título, bajada y aviso (el aviso adentro, sin tocarlo); afuera no entraba sin sacar el aro de la pantalla en 768.
- L3-5: El renombre de IA es del título de la sección. La barra («IA y automatizaciones») y el link del recomendador («Ver la página de IA y automatizaciones») nombran la PÁGINA, que conserva su nombre: no los cambié. `acento.ts` tampoco (es el nombre que casa los datos del Portfolio y no se ve en el home).
- L3-6: La cursiva va en minúscula («web», «a medida»), como la referencia; el primer renglón en mayúsculas como antes.
- L3-7: El video lleva a la página pero no entra al Tab (repite al título); en el Tab quedan el título y «Leer más…».
- L3-8: `candadoMs = 0` en Servicios: sólo el vuelo del salto (420 ms) traga. Lo que falta de la transición se recorre en una transición como mucho (más rápido cuanto más falta).
- L3-9: El dedo que ya dio su paso no sale libre por arriba ni por abajo (marca propia `dioPaso`, sin tocar el caso de L2 del dedo que entra desde arriba).
- L3-11: Los colores del aro son propios (cian, violeta y esmeralda de la marca, un paso más oscuros), no los oscuros del tema: en un punto de 2 px los oscuros se confunden.
- L3-10: Tests cambiados por la spec nueva (cada uno dice `[L3]`): s78-c2-51 (la línea del dedo con `dioPaso`), s81 §2 (dos muescas a 1 s = dos pasos; el candado de antes pasa a ser control), §5 (banderas, diagonal 7), §7 (tres enlaces por servicio, sin CTA, el orden termina en «Leer más…»), s81-servicios-capa (espejo del sombreador con la proporción; escenarios MEDIDOS en el sitio en vez de estimados), s6-servicios (textos, acento por `text-acento`, recorrido del Tab), s78-b12b (los dos enlaces del archivo piden el viaje), s6-lane (las excepciones de `next/font` a los archivos nuevos), bancos `servicios-gatillos` y `servicios-c2`.

## Supuestos y descartes
- La pausa de ~370 ms en el primer paso desde la entrada (sólo el primero, a 1440 y 1024) es del dev: los enlaces nuevos a `/v3/pagina-base` entran a la vista y Next precarga la ruta. No verificado en build; el banco la cuenta como cuadros lentos, no como salto.
- 320 px de ancho: el aro roza el aviso (el aviso es más ancho que el aro). Fuera de los anchos del lote; queda anotado.
- La cursiva de IA va en un renglón en escritorio (el título de IA queda en 52 px a 1440); en el teléfono puede partirse.
- Los tamaños de los títulos de servicio siguen siendo distintos entre sí (cada uno lo más grande que entra en su columna, como antes).
- No toqué el recomendador (es de L4): sigue igual, con su link «Ver la página de…» (`EnlaceDelServicio`, intacto).

## Qué tiene que mirar Valentino
1. `/v3#servicios` a 1440 (y su pantalla de 1920): «Nuestros servicios» en un renglón, el aro que pasa detrás del título y no toca «Scrolleá para explorarlo». Probar `?aro-color=mezcla`, `?aro-color=tercios` y sin bandera (ola).
2. Mismo lugar, scrolleando por los tres servicios: los títulos en dos renglones subrayados y alineados por la diagonal; «Leer más…» al final del cuerpo; probar `?titulo-cursiva=2` y `?titulo-cursiva=3`. Clic en el título, el video o «Leer más…» lleva a la página.
3. Pasar rápido: dos ruedas seguidas (sin esperar) desde «Nuestros servicios»: llega a Software sin cortes; los nanobots cambian de forma y de color desde donde están.
4. Teléfono (390 o real): la entrada con el aro vertical y los textos grandes; cada servicio con su cuerpo más corto y grande, sin el aviso del gesto.

Banderas: `?aro-color=mezcla|tercios|ola` (defecto `ola`), `?titulo-cursiva=1|2|3` (defecto 1), `?diagonal=` (defecto 7). Defectos sólo del banco: `__defectosDeLosGatillos='con-candado'` y `'con-salto'`.
