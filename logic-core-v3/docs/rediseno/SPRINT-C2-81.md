# SPRINT C2-81 · COLA 2 (2026-10-23) · El preloader continuo, la flecha nueva y el movimiento del teléfono

Tarea: `docs/cola/2026-10-23/81-preloader-y-movimiento.md` (ítem 18 de la revisión, más el giroscopio del lote del teléfono). Worktree
`C:\nocturno\2026-10-23\81`, rama `nocturno/2026-10-23-81`. `PreloaderContext.tsx` (frozen) no se tocó: el preloader del sitio es
`_chrome/preloader/` (B12c) y no lo usa.

## Plan

1. **El preloader continuo.** La causa del «aparece a medio aparecer, se traba y sigue»: un rAF escribía las opacidades cuadro a cuadro
   (`CapaDelPreloader`) y, en el fundido de la bienvenida, la escena se preparaba (`Precompilar`: compilar y calentar los programas; el
   calentado arma los ejecutables de Direct3D y frena el hilo y el de la GPU). Arreglo en dos partes:
   - todo lo que se ve del preloader, en animaciones nativas (Web Animations API), sólo `opacity` y `transform`, alineadas con un reloj
     maestro; el rAF sólo decide (la etapa, el freno, la salida);
   - la preparación espera a que la bienvenida terminó de aparecer (la hace con el texto quieto) y el calentado va en partes (una por cuadro).
2. **La flecha nueva:** a trazos (rayas), sale de la derecha de «Recomendamos activar el sonido.», sube por encima del texto, tres bucles
   grandes encadenados y la punta en el borde del botón del sonido. La misma lógica de carga (frena en su último 20 %, pulsa desde los 6 s),
   ahora en el compositor: cada raya aparece con una animación de opacidad; la punta recorre el camino con una de `transform`; el último
   20 % se frena desde el hilo principal sólo si falta la carga.
3. **El movimiento del teléfono:** su botón arriba a la derecha (táctil, abajo de 1024, con el sensor), la frase «… el sonido y el
   movimiento.» con dos flechas, tocarla prende los dos, el permiso de iOS en el toque, inclinar mueve la cámara (el caño del mouse, con
   un filtro suave) y el moiré (la entrada de la 31m), apagado por defecto (también con movimiento reducido), dura la sesión.
4. Pruebas sin navegador (`s78-c2-81` nueva, `s78-preloader` §3 rehecha, `s62` F2 y `s78-c2-31m` a la spec nueva) y bancos
   (`preloader.ts` ampliado, `movimiento.ts` nuevo), cada criterio con su `CONTROL=`.

## Log

**La causa, en el código.** `Precompilar` compilaba 8 cuadros después de que el material del logo existe y calentaba en un solo dibujo
(medido en CALIDAD 1: ~1,1 s en frío). Con el preloader eso cae en los primeros 900 ms: el fundido de la bienvenida. El texto lo pintaba
el rAF de la capa con `style.opacity`: cualquier tarea larga lo congelaba a medio camino. Y el paso de la línea acotaba el `dt` a 100 ms, así
que además el tiempo del preloader se estiraba.

**En el compositor.** `animaciones.ts` (puro) arma los cuadros clave de la bienvenida, el blanco, la frase, la salida, cada raya, la punta
(dos tramos: hasta el freno y el frenable) y el pulso. Las curvas del sitio son de potencia 2: `1 − (1 − t)²` y `t²` son `cubic-bezier`
exactos con los controles de `x` en 1/3 y 2/3, y la simétrica va en dos mitades: `s78-c2-81` compara las animaciones con `vistaDeLaLinea`
en 342 cuadros (peor desvío 1,5·10⁻⁶). `reloj.ts`: una animación maestra sin objetivo cuyo `currentTime` es el tiempo de la línea; todo se
alinea con su `startTime`, y con la pestaña oculta se pausa todo junto (quien vuelve ve la secuencia entera, como antes). La línea ya no
acota el `dt` (sigue al reloj, que es lo que ve el compositor) y la flecha se integra de a un cuadro (un cuadro largo no la pasa del freno).
`libre`: desde que la carga estuvo lista, el último tramo corre solo en el compositor.

**La flecha.** `trazado.ts` rehecho: sale del costado del renglón (escritorio: la derecha del último, donde termina «sonido.»; teléfono con
movimiento: las dos puntas del primero), sube por encima del bloque, tres bucles sobre el camino base (del lado que se aleja de la frase, o
del otro si ahí no entran en la ventana) y el tramo recto final apuntando al centro del botón. Radio de los bucles: 7,5 % del lado corto
(16 a 72 px), como mucho un 7,5avo del camino. Medido en el modelo: 1440 → 67,5 px, 2254 px de camino, 96 rayas de 14,4 px; 1024 → 57,6 px,
88 rayas; 768 → 46,3 px, 61 rayas por flecha; 390 → 29,3 px, 57 rayas por flecha; siempre 3 cruces (un bucle, un cruce). Las rayas son
elementos con su `transform` fijo (rectas de 9 a 15 px, huecos de 6 a 9, 2,5 px de grosor). La punta: el mismo chevrón; su vértice es el
origen (una marca de tamaño 0 que el banco mide en la pantalla).

**La preparación repartida.** `entrada.ts`: `permitirLaPreparacion` (la capa, cuando la línea pasa los 900 ms: la bienvenida en 1) y
`laPreparacionPuede` (sin preloader, siempre; con él, con el permiso o a los 4 s del arranque si la capa nunca llega). `Precompilar` la
espera antes de compilar y calienta en 6 partes, una por cuadro (`gpu/partes.ts`, puro: `s78-c2-81` lo prueba con una escena de three).

**El movimiento.** `movimiento.ts` (nuevo): dónde va (`llevaMovimiento`: táctil, abajo de 1024, con la API), lo de la sesión
(`sessionStorage`), activar/desactivar desde el gesto y retomar al cargar (Android en el acto; iOS con el primer toque). `giroscopio.ts`:
del prototipo al producto: suscripción al estado (el botón y la frase), sin la negativa con movimiento reducido, un filtro de primer
orden de 90 ms, «sin sensor» si en 1,5 s no llegó ninguna lectura con datos, y la entrada del moiré (`fijarLaEntradaDelMoire` con cada
lectura y `null` al callar). El botón (`_chrome/movimiento/`): el disco de la cabecera, arriba a la derecha, `escritorio:hidden`, lucide
`Smartphone` con trazo 1,5 que se inclina −18° prendido (resorte de íconos 400/15; con movimiento reducido, sin animar), `aria-label`
«Activar movimiento» / «Desactivar movimiento», `data-control-fijo` (la órbita no lo sigue), se retira con la cabecera al fondo
(`barra.css`). El prototipo del parlante (`?giroscopio=si`) se fue.

**Pruebas.** `s78-c2-81` nueva (38 afirmaciones, 20 controles). `s78-preloader` §3 rehecha para la flecha nueva (54/0; controles: la punta en
el centro, 20 px antes, un solo bucle, la que sale de abajo de la frase y la de puntos). `s62` F2 y `s78-c2-31m` (la entrada «sin conectar»)
a la spec nueva con sus controles. Verdes: s78-c2-81, s78-preloader, s78-preloader-entrada, s62, s78-c2-31m, s39-navbar, s3-tokens,
s87-chat, s34, s40, s42, s44, s46, s47, s48, s59, s64, s73, s76-portfolio, s78-t0; `s61` J7 falla igual que antes (lee
`EncabezadoDelPortfolio.tsx`, que no se tocó). tsc 0, eslint limpio en lo tocado.

## Decisiones tomadas sin preguntar

- El movimiento arranca apagado para todos (se recomienda prenderlo, como el sonido; en iOS no se puede prender sin un toque), y con
  movimiento reducido también; prendido a mano dura la sesión (`sessionStorage`, «dura la sesión»).
- Va donde va el chrome del teléfono: táctil y abajo de 1024. Una tablet apaisada de 1024 o más lleva el chrome y la frase de escritorio.
- Con movimiento reducido prendido a mano, el moiré sigue a la inclinación (la entrada de afuera de la 31m) y la cámara no: con movimiento
  reducido la escena no tiene física y tampoco sigue al mouse («como el mouse»).
- En el teléfono con movimiento, las dos flechas salen de las dos puntas del primer renglón (la del sonido por la izquierda, la del
  movimiento por la derecha); en escritorio, de la derecha del último («sale desde la derecha del texto»).
- Texto nuevo (no estaba en 05-TEXTOS): la confirmación de la frase con los dos prendidos, «Sonido y movimiento activados»; y el anuncio
  del botón para los lectores, «Movimiento activado» / «Movimiento desactivado». Sin cartel visible (el sonido lo tiene; acá el ícono se
  inclina).
- Negado o sin sensor, el botón queda apagado y `aria-disabled` (no hace nada más; no se vuelve a pedir).

## Qué mirar

- Bancos (el orquestador): `BASE=http://localhost:3000 npx tsx scripts-carga/preloader.ts`, sus controles `CONTROL=en-recargas`,
  `en-el-hilo`, `punta-corta`, `sin-movimiento`, `sin-bloqueo` (y `LENTO=6 CONTROL=sin-freno`), y contra la base con `ANTES=1` (el «antes»
  de las tareas largas y del hilo principal). `BASE=http://localhost:3000 npx tsx scripts-carga/movimiento.ts`, con `CONTROL=sin-camara`,
  `sin-moire`, `sin-permiso`, `prendido-por-defecto`.
- A ojo: `http://localhost:3000/v3?preloader=si` a 1440, 1024, 768 (táctil) y 390 (táctil).

## Intento 2 (lo que midió el orquestador en 7fa2f564)

1. **El scroll se soltaba a los 1600–1668 ms a 1440 y 1024 (piso 2000): demasiado TEMPRANO, no tarde.** Esa cifra era la vuelta del banco a
   la rueda (con el trace, ~1,5 s de detener la grabación y medir), no el momento del suelto: el scroll se soltó en el acto porque el logo
   no retuvo. `CaidaDelLogo` decide al montarse «sin velo, sin caída» (`!cargaLista() && sin el velo de carga`): con el preloader, si la
   escena se monta después de que el velo se fue (una carga lenta: el velo se va a su plazo; el trace la hace más lenta), la carga está
   pedida pero cerrada hasta que entra la página y eso se leía como «sin velo» → el logo quieto, sin retención. Arreglo: «sin velo»
   también exige que la carga no esté pedida (`cargaPedida`, `carga.ts`). El banco ahora lee el suelto del registro por cuadro (el
   `bloqueado` del preloader) y dice si el logo estaba cayendo al irse el blanco.
2. **La bienvenida «arrancó 258–299 ms tarde» en el teléfono.** Ese dato no era parte del criterio (es informativo): la falla tenía que
   venir de la salida de la bienvenida o de los cuadros perdidos (la línea citada cortaba esos números). Lo probable: el calentado en partes
   seguía en la salida (2,0–2,6 s) y la frenaba. Ahora la preparación va sólo en los ratos quietos (`ratoQuieto`, `linea.ts`: la bienvenida
   aparecida, hasta 200 ms antes de que se vaya, y desde la flecha), la capa los abre y cierra cada cuadro y `Precompilar` pregunta antes
   de compilar y antes de cada parte. Además el reloj y las animaciones se crean en un efecto de layout (arrancan con el primer pintado de la
   capa, no en el cuadro siguiente detrás de lo que el hilo tenga en cola).
3. y 4. **«Prendido y recargado» y «apagado, el moiré vuelve al mouse» (768).** El banco miraba el botón a los 3 s del `load`, antes de que
   la página hidratara en el dev; y el apagado tocaba el botón sin saber si había vuelto prendido (si no, lo PRENDÍA y el moiré quedaba de
   afuera: la 4 era consecuencia de la 3). En el código, apagar llama `fijarLaEntradaDelMoire(null)` (lo prueba `s78-c2-81` en el tiempo).
   El banco ahora espera al botón y al estado (hasta 15 s), dice lo guardado en la sesión antes y después, y mide el apagado sólo desde
   prendido.
5. **«iOS negado: la cámara se movió 0,532».** Es el banco: el umbral de 0,02 no separaba la deriva propia de la cámara (0,14–0,31 en
   1,5 s; la ventana negada era de 2,3 s). El código nunca escuchó: el estado quedó `negado` y el moiré sin entrada de afuera (las dos lo
   confirman). Para demostrarlo, la esquina publica con el banco `__movimientoDelBanco` (lo que la cámara recibe del sensor): negado,
   `activa` falso y 0; y la cámara se compara contra su deriva en una ventana igual y seguida (inclinada < 2 × quieta + 0,1). Con
   `CONTROL=sin-permiso` la cámara recibe la inclinación y falla.

Pruebas: `s78-c2-81` 43/0 (los ratos quietos con dos controles, la pausa de la capa, la caída del logo con la carga pedida), s78-preloader,
s78-preloader-entrada, s52 (las dos), s75-carga, s41, s47, s48, s84, s62, s78-c2-31m, s39, s3-tokens, s87, s34 verdes; tsc 0; eslint limpio.
