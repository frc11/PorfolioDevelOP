# SPRINT C2-71 · cola 2 del 2026-10-23 — el pie y el FAQ de escritorio (desde 1025)

Rama `nocturno/2026-10-23-71e`. Tarea: `docs/cola/2026-10-23/71-pie-faq.md`, puntos 1 a 5 (el 6, el acordeón del teléfono y la tablet, es
de 71t). Revisión: ítems 22 y 25 de `08-REVISION-VERBATIM.md`, capturas `lote2/11`, `12`, `13` y `19`. Sin navegador: lo que se ve lo mide
el orquestador (abajo, «Qué mirar»).

## Plan

### Lo que dice el código (antes de tocar)

- El pie de volumen se acuesta en el piso al final (`caida.ts`): cada pieza en su columna; las placas (mail, WhatsApp, redes, el
  formulario) incrustadas en su hueco (`huecosDeLaCaida.ts`, la silueta exacta con su pozo: `pozos.ts`); los textos (el logotipo, el
  titular, el rótulo «Contacto», el recorrido, la línea legal) apoyados SOBRE el piso, sin hueco.
- Para el FAQ (B10) el pie se hundía con el hundimiento de un viaje: cada pieza bajaba su espesor y `hundeDeMas`, con el fondo de su pozo
  QUIETO. Por eso:
  - **la «piel» de los inputs (`lote2/11`)**: el formulario bajaba más que el fondo de su pozo y el fondo (papel, con las juntas de la
    grilla) lo atravesaba: lo más hondo de su cara (los pozos de los campos) quedaba tapado por el fondo, en bandas claras;
  - **la izquierda «no se guarda»**: los textos no tienen hueco: bajaban atravesando el piso.
- Los bloques del FAQ eran DOM de vidrio sobre la escena (2D, `lote2/12`).
- **El bug del pie (`lote2/19`)**: lo que se ve (los rótulos NOMBRE, MAIL, MENSAJE y Enviar sueltos, el mail y WhatsApp sin su pastilla, el
  logo parado: el final sin correr) es el pie de volumen **montado pero sin armar** (`listo` en falso): el DOM de respaldo de escritorio
  tiene los campos transparentes y espera al 3D, y el final espera al pie entero. El pie sólo queda sin armar si `contextoPerdido()` le
  dice que el contexto está perdido o si su compilación no termina. Lo perdido era UNO para toda la página
  (`escena/contextoDelLienzo.ts`), y r3f, al soltar un lienzo (la escena se rehace al cruzar los 1025 px por el `key` de
  `EscenarioCompuerta`, o al volver a montarse), le fuerza la pérdida del contexto medio segundo después (`forceContextLoss`, r3f 9.6
  `unmountComponentAtNode`): ese lienzo descartado avisaba «perdido», nadie lo reponía y el lienzo NUEVO quedaba «perdido» para siempre.
  Todo lo que lo lee se queda sin armar (el pie y los títulos de volumen). Y un `compilando` que nunca se soltaba (la compilación que tira)
  lo dejaba igual.

### Lo que se arma

1. **El pie se guarda por columnas** (`salidas.ts`, `HUNDIMIENTO_EN_COLUMNAS` y `columnaDelHundimiento`; `huecosDeLaCaida.ts`): con el FAQ,
   cada columna tiene su BASE: un hueco del tamaño de la huella de TODAS sus piezas (los textos también) que se abre desde su centro con el
   fondo al ras (la plataforma), la plataforma baja con la columna entera tal como es (`hondoDeLaColumna`: lo que asoma su pieza más alta,
   y aire), y el piso se cierra encima. Los huecos de las placas que ya quedaron adentro de la silueta abierta no se escriben (sus paredes
   quedarían paradas sobre la plataforma). Nada atraviesa el fondo: sin «piel». El viaje (los enlaces del recorrido) sigue con lo suyo.
2. **El FAQ de volumen** (`escena/pie3d/faqDeVolumen.ts`, montado por `PieDeVolumen.tsx`): cada bloque es una placa como la del
   formulario (`armarElBloque`: su espesor, su canto con bisel, su negro satinado, acostada y mate como las piezas del pie), incrustada en
   el piso: la de la RESPUESTA donde estaba el formulario y de su tamaño (sube por el mismo lugar del piso; crece hacia abajo si una
   respuesta no entra); la de las PREGUNTAS donde estaba la columna izquierda, del ancho del formulario y más alta (×1,3); la de WhatsApp
   abajo de la respuesta. Cada una sube con su nivel (`subidaDelBloque`): se abre su hueco con la placa abajo, sube sobre su plataforma y
   recién quieta aparece su texto (el DOM, llevado sobre su cara como lo interactivo del pie). El gatillo, las preguntas y cómo suben y
   bajan (los relojes de B10), como estaban: el cuadro del FAQ les pasa su nivel a la escena en vez de hundirlas en el DOM.
3. **El botón del FAQ** (`BotonDelFaq.tsx`): una pastilla de la escena, como «Escribinos por WhatsApp», abajo del logo, que sale con la
   apertura del piso `esperaS` después de que el pie se acostó entero; adentro, `AvisoDeScroll` tocable («Scrolleá una vez más para ver las
   preguntas frecuentes») y `Reluciente`. Tocarlo es el gesto (`pedirElFaqSinGesto`: la misma condición que el gatillo); con el FAQ se
   hunde con el pie y no vuelve en esa carga (`BOTON_EN_VIVO.usado`, en memoria; se rearma al montar el FAQ).
4. **La pasada técnica**: lo de arriba ya es la pasada (la plataforma bajo cada columna y bajo cada bloque: nada atraviesa ni el fondo ni
   el piso; el DOM de los bloques se enciende recién con su placa quieta; el material, el del pie acostado). Lo que se ve lo mide el banco.
5. **El bug del pie**: lo perdido es de CADA lienzo y cuenta sólo el vivo (el último vigilado); lo que le pase a uno descartado no se oye.
   Y la compilación del pie que tira o falla suelta `compilando` y vuelve a pedir el armado.

### Riesgos

- Sin navegador: el lugar de las placas (en la base del pie acostado, desde las huellas de las columnas) y el del botón (abajo del logo,
  `aire` del borde de su huella) los mide el orquestador; a 1024 × 768 el botón puede quedar cerca de la columna izquierda.
- El diagnóstico del bug sale de leer el código (sin navegador no se reprodujo): el banco lo reproduce con `CONTROL=contexto-global`
  (cruzando los 1024 px). Si ese control NO falla, el bug de `lote2/19` es otro y hay que mirarlo con el banco.

## Log

- `_lib/pie3d/salidas.ts`: `delViaje`/`delFaq` (las dos partes del hundimiento), `HUNDIMIENTO_EN_COLUMNAS`, `columnaDelHundimiento` (sin
  reservas por cuadro), `hundePorColumnas`.
- `_lib/escena/pie3d/huecosDeLaCaida.ts`: la huella final de cada pieza primero (`huellaFinal`), la de cada columna y la del formulario
  (`c.faq`, para el FAQ de volumen), los huecos de las columnas con su plataforma, `hondoDeLaColumna`, `hundirConSuColumna` y
  `COLUMNAS_EN_VIVO` (el banco). Sin el FAQ, los huecos de siempre (los mismos números).
- `_lib/escena/pie3d/caida.ts`: `faq` en la caída (las huellas) y la pieza que baja con su columna (`hundirConSuColumna`). Sigue en 300
  líneas de código (s70) y sin reservas por cuadro (s70, s71).
- `_lib/escena/pie3d/geometria.ts`: `armarElBloque`.
- `_lib/escena/pie3d/faqDeVolumen.ts` (nuevo): las placas del FAQ, sus huecos y su quietud después de los del pie, el DOM sobre su cara
  (la fase fija de `domQueSigue.ts`), el botón (`pasoDelBoton`) y lo del banco.
- `_lib/escena/pie3d/PieDeVolumen.tsx`: monta el FAQ de volumen (después del pie en cada cuadro), la compilación que no se cuelga y el banco
  (`__pieDelBanco.faq()`, `.columnas()`, `.boton()`).
- `_lib/pie3d/faqDelPie.ts`: los bloques anotados (`BLOQUES_DEL_FAQ`), `subidaDelBloque`, el botón (`BOTON_DEL_FAQ`, `BOTON_EN_VIVO`,
  `pasoDelBoton`, `rearmarElBotonDelFaq`) y `entrarSinGesto`.
- `_lib/escena/contextoDelLienzo.ts`: lo perdido por lienzo (el arreglo del bug).
- `_componentes/faq/`: `BloqueDelFaq.tsx` (vidrio o placa), `BotonDelFaq.tsx`, `useMedidasDelForm.ts` (nuevos); `FaqEnEscenario.tsx`
  (los bloques en sus dos formas, el nivel a la escena, el botón fuera de la raíz, la raíz recortada en volumen); `useGatilloDelFaq.ts`
  (`puedeEntrarElFaq`, `pedirElFaqSinGesto`). `FaqEnLista.tsx` (71t) y `preguntas.ts`, sin tocar.
- `docs/rediseno/B12a-API.md` §8: una nota (en una página no cambia nada).

### El gate (sin navegador)

- `npx eslint` de los 15 archivos tocados (con el banco): limpio. `tsc --noEmit` (4 GB): 0 errores.
- `s78-c2-71` (nueva, `npm run test:s78-c2-71`): 37 afirmaciones (20 controles positivos), 0 fallas.
- Sin fallas: s10-acceso, s41, s44, s47, s48, s49, s51, s52, s62, s66, s70, s71, s72, s74, s75, s78-b10, s78-b13, s78-t0, s85. Con una
  falla cada una, ajenas a esta tarea (leen el foco de los campos en el CSS y el titular del Portfolio, que no se tocaron): s50 («el foco de
  un campo lo dibuja su caja») y s61 («J7 · el titular de Portfolio»).

### Las alturas (REGLA DE ALTURAS)

- No cambia ningún alto (1440 × 900, 1024 × 768, 768 × 1024, 390 × 844): el FAQ sigue `absolute` en la pantalla del pie (ahora recortado:
  su DOM, llevado sobre las placas, no suma desborde) y el botón va en otra caja igual (`absolute`, `h-svh`, recortada). `k` = 1, nada
  anotado.

## Qué mirar (el orquestador, en el navegador)

Banco: `BASE=http://localhost:3000 ANCHOS=1440,390 RUTAS=/v3,/v3/pagina-base npx tsx scripts-carga/faq-del-pie.ts` (y a 1024:
`ANCHOS=1024 RUTAS=/v3`). Fotos en `~/.cache/b4-medicion/faq-del-pie/` (`1440-v3-a-mitad.png`, `1440-v3-respuesta-larga.png`). Controles,
cada uno tiene que dar FALLA en lo suyo:

- `CONTROL=sin-hundimiento` → la entrada y la secuencia por columnas (desde 1024);
- `CONTROL=boton-siempre RUTAS=/v3 ANCHOS=1440` → «botón una vez»;
- `CONTROL=boton-temprano RUTAS=/v3 ANCHOS=1440` → «botón después de todo»;
- `CONTROL=boton-sin-gesto RUTAS=/v3 ANCHOS=1440` → la entrada del home (el botón es el gesto);
- `CONTROL=contexto-global RUTAS=/v3 ANCHOS=1440` → «vuelta al pie» tras cruzar los 1024 px (si no falla, el bug es otro: avisar).

A ojo, `http://localhost:3000/v3` a 1440 × 900 (y 1024 × 768):

1. Bajá hasta el final y esperá el encastre: con el pie acostado, ~1 s después, abajo del logo se abre el piso y sube una pastilla negra
   con «Scrolleá una vez más para ver las preguntas frecuentes» y dos chevrones (titilan; un reflejo la barre cada tanto). Que no pise el
   logo ni las columnas.
2. Tocala: a cada lado se abre el piso debajo de la columna (el hueco desde el centro, con el fondo liso al ras), la columna entera baja
   tal como es (el formulario con sus campos oscuros, sin bandas claras; los textos de la izquierda también), el piso se cierra encima, y
   después se abre otra vez y suben dos placas negras con canto: a la izquierda «Preguntas frecuentes» y las seis preguntas (más alta que
   ancha), a la derecha «Tocá una pregunta…» (del tamaño del formulario). La pastilla se hunde con el pie. La página no se mueve.
3. Tocá la pregunta de respuesta más larga: la placa de la derecha baja, se cierra, se abre y sube con la respuesta entera adentro; abajo
   sube la pastilla de WhatsApp.
4. Rueda hacia arriba: las placas bajan, el piso se cierra, se abre bajo cada columna y el pie sube a su lugar (el encastre no se
   rebobina). La pastilla del FAQ NO vuelve a salir (recargá: vuelve).
5. El bug: con el pie a la vista, achicá la ventana por debajo de 1024 y volvé a agrandarla; bajá al pie: el formulario tiene que estar
   (la placa negra con sus campos), no los rótulos sueltos de `lote2/19`.
6. Mirá de cerca, en 2 y 4: ninguna pieza atraviesa el piso, el fondo ni el logo; los bordes de los huecos limpios.
7. `http://localhost:3000/v3/pagina-base` a 1440: el FAQ como en B10 (vidrio), sin botón.

## Lo que quedó afuera

- El viaje desde el pie acostado (los enlaces del recorrido) sigue con su hundimiento de siempre (los textos sin base): no es del FAQ.
- En una página (el pie plano) no hay botón del FAQ: la tarea es del pie de volumen del home y la página base no se toca en esta corrida.
- Sin verlo, no se ajustó la estética fina (el canto, la luz de las placas, el lugar exacto del botón a 1024): queda para mirar con el banco.
