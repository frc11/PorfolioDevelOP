# SPRINT PULIDO 10 — la pasada completa: 1024, los forms, el loader, el pie nuevo, mobile y tablet

Rama `rediseno/home`. Invariante nuevo: `npm run test:s61-pulido-10` (`src/app/v3/_lib/__tests__/s61-pulido-10.invariant.tsx`).
Entregas (hojas de la matriz): `docs/rediseno/entregas/pulido-10/`.

Aprobados (no se tocan salvo lo pedido): el polvo de H1; el anillo de Contacto como concepto (lo reemplaza el loader de J3);
el volteo y el hundido como concepto (J4).

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

- HECHO: J1 · la banda portátil, el texto 3D en renglones, Quiénes somos desde 1024 y los solapes en cero a 1024, 1280 y
  1440 (f590e17a)
- HECHO: J8 · el pie nuevo (25/50/25, el recorrido en texto 3D con el subrayado del sitio, Demos, `?pie=columna2` y
  `?pie=menu-abajo`), visto en el banco a 1024, 1280, 1440 y 1920 en las tres disposiciones (b0a2c184). Pendiente del banco: la llegada a Demos con el destino corregido (el clic, el viaje, el activo de la barra
  y el foco ya se midieron; la llegada vieja se pasaba 108 px y asomaba la sección de abajo)
- HECHO: J10 · la histéresis del polvo: despertado, termina de subir y queda ~6 s en el aire antes de volver a evaluar si se posa
  (`quietoConHisteresis`; el modelo de `s60`, compartido en `modeloDelPolvo.ts`: con un toque, todas en el aire a los 7,0 s y
  la primera cae a los 15,6) (commit «pulido 10 · J10»). Pendiente del banco: los modos en el tiempo
- HECHO: J3 · la carga de develOP (el trazo; `?carga=giro`, el giro), en el botón del pie y en el panel de Contacto (en lugar
  del anillo), con la espera mínima (66f39394). Pendiente del banco: verla (sin memoria para abrirlo)
- J2 · primera ráfaga (1440, desde el hero, con la barra): ningún cuadro oscuro ajeno; faltan 390, desde la noche y la
  segunda apertura
- HECHO: J4 · a (el volteo en un movimiento, la entrante compilada antes de girar), b y d (la tarjeta en su lugar y la etiqueta
  pegada: el techo fijo de J8, y el hundido lleva el borde de arriba quieto; `s61` J4 D), c (el título en Archivo en
  minúsculas, compuesto como la frase del CTA), e (el foco no desaparece) y f (el panel con el hundido) (2b5b200e). No se hizo: armar la geometría de la tarjeta al montar (el programa se compila antes de girar, pero la geometría se
  arma cuando llega la respuesta). Pendiente del banco: medir los cuadros del volteo (ninguno de más de 20 ms) y ver las dos
  variantes en los dos formularios
- J9 · a (las leyendas de las fotos): escrito; falta verlo en el banco
- HECHO: J5 · el error en los dos formularios: la placa rechaza con un resorte amortiguado (la 3D del pie en profundidad; el
  panel, su bloque; la hoja del teléfono y el pie plano, en escala), Reintentar entra girando (en 3D, la tecla), el error sale
  de atrás del botón en su renglón, el foco en Reintentar, el pulso; con movimiento reducido, sin resorte ni giro (02e78e36). Pendiente del banco: verlo con `?envio=error` a 1440 y a 390
- EN CURSO: J2 · el cuadro negro al abrir Contacto

## Memoria

- Al empezar: 1,07 GB libres (el dev server en 1,3 GB y el Chrome del humano en ~2,7 GB; el del banco, cerrado). Con menos de
  3 GB no se abre el banco: se empieza por el diagnóstico en el código.
- El dev server crece con las horas (3,7 GB privados al empezar). Se reinició: sin él quedaban 2,27 GB; recién compilado /v3
  ocupa ~2,5 GB. El Chrome del humano, 1,7–2,7 GB. Una tanda de capturas (1024 y 1425) corrió con 3,0 GB.
- ⚠ Falta de memoria: la segunda tanda (1024, después de A y B) corrió con 1,97 GB, por debajo del umbral. No debió correr: se
  anota acá. Desde ahí, antes de cada tanda se mide; con menos de 3 GB se reinicia el dev server, y si igual no alcanza, se
  sigue con lo que no necesita el banco (J10, el componente de J3) y la verificación visual queda pendiente.
- ⚠ Otra tanda (J1 a 1024 y 1280 con el factor por ancho) arrancó con 2,67 GB: el bucle no esperó la medición. Desde ahí
  todas las tandas pasan por un portero (`portero.sh`, en el scratchpad) que no abre el banco con menos de 3 GB.
- ⚠ El primer portero falló: Windows da la memoria con coma decimal y su comparación dio error; dejó correr una tanda (la
  primera del instrumento de solapes, a 1024) con 1,98 GB. Se rehízo comparando MB enteros.
- J1 · Quiénes somos: después de tres corridas del banco de solapes bajó a 2,8 GB; se cerró, se reinicia el dev server (2,5 GB) y se sigue con J8 en el código hasta tener 3 GB.
- J8 · al cerrar J1 y J8: Windows corre su tarea de puntos de restauración (`SrTasks`, ~0,7 GB y disco) y con el dev server recién reiniciado quedan 0,8 GB. No se abre el banco: el viaje a Demos corregido queda sin medir y J8 sin commit; se sigue con J3 en el código.
- El portero pasa de 3072 MB a 3000 MB: «3 GB» como lo escribe la regla (y como lo redondea el administrador de tareas). Con 3007–3039 MB disponibles el de 3072 no abría nada.
- Cada cambio de código recompila y el dev server crece (de 2,6 a 3,7 GB): el banco se corre en tandas, con el dev server reiniciado justo antes y apagado mientras se escribe código (el código no necesita el banco).
- `tsc --noEmit` con el heap de siempre (2 GB) se quedó sin memoria después de que el dev server escribió mal sus tipos generados (`.next/dev/types`, colas de una versión vieja sin truncar): se borraron y se regeneraron, y una pasada entera con `--max-old-space-size=3072` (2,45 GB usados, 0 errores) rehízo el estado incremental; las siguientes vuelven a entrar en los 2 GB.
- Un tope de heap en el dev server (`--max-old-space-size`) lo hace reiniciarse solo en medio de la compilación (Next lo vigila: «approaching the used memory threshold»): la tanda del banco vio páginas a medio servir (un documento de 99.000 px). Se sacó el tope; esa tanda no cuenta.
- Después de las tandas, el pool no paginado del sistema quedó en 2,4 GB (lo normal es menos de medio): con cualquier dev server (webpack 3,2 GB; se probó Turbopack y quedó en 2,8) quedan 2,2–2,7 GB y el portero no abre. Se sigue con el código (J4, J5…) con el dev server apagado y el banco queda para cuando vuelva a haber 3 GB. Lo que no se pudo medir va a «Lo que no quedó bien».

## J1 · 1024 y «Portátil L»

### Diagnóstico (antes de tocar nada)

Capturas del reposo de cada sección a 1024×824 y 1425×824 (1440 menos la barra de scroll de Windows) y un barrido de Por qué
develOP a 1024. Se reproducen los cinco defectos a 1024; a 1425, sólo el de Quiénes somos (el logo de canto cruza el párrafo).
Hay dos causas comunes y un agravante.

1. **El texto 3D asume UN renglón.** `posicionesDelDom` (`titulos3d/colocacion.ts`) lee sólo la x de cada letra, «desde el
   comienzo del renglón», y `armarElTitulo` las pone todas sobre la misma línea de base. Cuando el DOM parte el texto, el 3D
   encima los renglones:
   - el hero: desde 1024 el registro 1 es un solo renglón en una caja de 2 de 3 columnas. A 1024 no entra, el DOM lo parte en
     «TU NEGOCIO» / «VENDIENDO», y el 3D los encima («VINEGOOO»);
   - el CTA: el DOM parte «Este sitio empezó con una charla.» en dos renglones. El 3D la dibuja en uno, y el segundo renglón del
     DOM empuja «El tuyo también.» hacia abajo.
   - A 1440 en el navegador del humano: el título del hero se arma una vez (`rearma: false`). Si se armó con la ventana más
     angosta (DevTools abierto, otro tamaño), queda encimado aunque después se agrande. Y la barra de scroll de Windows le saca
     ~15 px a la caja.
2. **El logo se mide por el ALTO; el texto se reparte por el ANCHO.**
   - El campo de visión de la cámara es vertical, así que el logo mide en píxeles una fracción fija del alto de la pantalla.
   - Todo lo que el DOM le reserva está en `svh`: el hueco de la frase y de los valores (`huecoDelLogo`), el lugar del CTA, los
     bordes seguros del hero.
   - Calibrado a 1440×900 y 1920×1080 (aspecto ~1,6–1,78). A 1024×824 (1,24) el logo mide los mismos píxeles que a 1440×824
     pero ocupa un 41 % más del ancho:
     - en el hero tapa «LAS 24 HS»;
     - en Quiénes somos cruza el párrafo;
     - en Seis razones el hueco (en `svh`) empuja las dos mitades de la frase a los bordes y su letra se achica (el tamaño sale de
       `50vw − hueco`). Las columnas de valores quedan angostas y el último ítem se sale por la derecha;
     - en el CTA, HABLANOS queda encima del logo.
3. **El umbral de escritorio es exactamente 1024** (`escritorio:` y `CONSULTA_ESCENARIO`). La composición de escritorio arranca
   en el aspecto más desfavorable, sin una banda intermedia.

El pie a 1024 (los botones del menú en dos renglones) es otro problema: es el ancho de su columna de enlaces. Se resuelve con el
pie nuevo de J8.

### El arreglo de raíz (plan)

- **A · El texto 3D sigue los renglones del DOM:** además de la x, la altura del renglón de cada letra. Ningún corte vuelve a
  encimar letras. El título del hero se rearma cuando cambia el tamaño.
- **B · La banda «portátil» (de 1024 a donde el aspecto llega a 1,6):**
  - la cámara de cada pose se aleja en la proporción `1,6 / aspecto` (con tope), así el logo ocupa del ancho lo mismo que a
    1440×900;
  - la altura de la cámara se escala igual: se lo sigue mirando desde el mismo ángulo;
  - lo que el DOM le reserva al logo pasa de `svh` a «unidades del logo», la misma cuenta en CSS:
    `max(q/tope svh, min(q svh, q/1,6 vw))`.

  Una sola regla para todas las secciones, sin parches por sección.
- **C · El invariante de solapes:** un banco mide en el reposo de cada sección las cajas de texto (DOM y 3D) y la silueta
  proyectada del logo (sus triángulos rasterizados en una grilla). `s61` exige el recibo del banco sin solapes, con un control
  que le pone un solape.

### Lo que quedó y cómo se verificó

- **A**, como en el plan: `letrasDelDom` da el renglón de cada letra y `armarElTitulo` las baja a su renglón (`bajadas`). Y
  donde el diseño es UN renglón, el DOM no se parte desde 1024: el registro 1 del hero con su letra topada por el ancho de su
  caja (`100cqw/8,4`) y la frase del CTA por el ancho útil (`/15,4`); el titular de Quiénes somos, por su columna (`/14`).
- **B cambió en el camino:** alejar la cámara llevaba la pared de la sala (radio 44) y la pose del pie (40) a quedar adelante
  de la cámara. En vez de alejarla, se abre el campo de visión vertical (`banda.ts`: `2·atan(f·tan(fov/2))`): lo mismo en el
  cuadro, sin mover la cámara. El factor es el mayor entre `1,6·alto/ancho` y `1440/ancho`, con tope 1,45 y sólo desde 1024:
  con sólo el aspecto, 1280 × 800 quedaba en 1 y el hero se encimaba igual. Lo leen la cámara viva (`OrbitRig`), la de la
  lectura de los títulos y del CTA (`camaraDeLaLectura`) y el encuadre (`cameraFraming`); el DOM, con `enUnidadesDelLogo` en
  los huecos del CTA. A 1024 × 824, ×1,41; a 1280 × 800, ×1,13; a 1440 × 900 y 1920 × 1080, ×1 (lo aprobado no cambia).
- **Quiénes somos** no se arreglaba con la banda: a 1440 (factor 1) el logo, en el reposo del viaje, medía 424 px de alto y
  el tramo del titular al cuerpo, 650 con el hueco parejo: no entraba entre los dos y les pasaba por encima (el final de «de
  siempre» y el ≠). Ahora, desde 1024, el ≠ va al margen (como en la tablet angosta: `banda.css`) y la fila del ≠ es la que
  crece, con el titular a 13 svh del tope y el cuerpo a 12 del pie. Los dos números salieron de un barrido en el banco a
  1440 × 900 (seis repartos probados en vivo, en el reposo del viaje): el titular a 45 px de la barra y 38 arriba del logo; el
  cuerpo, que se ve en su plano 83 px más abajo que su caja, 20 px debajo del logo y entero.
- **C · los recibos** (`docs/rediseno/entregas/pulido-10/solapes-{1024x824,1280x800,1440x900}.json`, NVIDIA): en el reposo
  del hero, Quiénes somos (el destino del viaje de la barra), Portfolio, Seis razones (su viaje), el CTA (su final) y el pie,
  **cero solapes** en los tres cuadros. El instrumento agrupa como el DOM: los renglones de un mismo título 3D (agencia-1,
  agencia-2) y los tramos de la frase del CTA son un bloque; HABLANOS, otro; cada placa con su título, la suya. Las cajas del
  CTA en volumen salen de la escena (`__ctaDelBanco().cajas()`); el ratón, en el centro (la cámara lo sigue). Los recibos se
  tomaron con el pie de J8 ya en el árbol (el momento «pie»).

## Hallazgos fuera de alcance (anotados, no implementados)

- J1 · **El lente de Portfolio no sigue la banda.** `_lib/motion/lente.ts` espeja el campo de visión de la cámara en la
  `perspective` CSS de P7 (el túnel de Trabajos: `100svh × 1,5857`). Con la banda, de 1024 a 1439 la cámara abre su campo
  (a 1024 × 824, ×1,41) y el túnel sigue con el foco de siempre: sus planos convergen como antes de B6-A (los de atrás, un
  ~20 % más grandes de lo que la sala pediría). Se probó atarlo (`el.style.perspective` por época, el foco ÷ el factor) y se
  volvió atrás: el túnel está calibrado contra la referencia y nadie lo pidió. Decide el humano.
- J1 · **El último renglón del cuerpo de Quiénes somos se corta a 1024 y a 1280** (en el reposo del viaje), a media altura
  de la letra, unos 50 px arriba del borde del cuadro. Pasaba igual antes de J1 (la captura de «antes» a 1024 lo muestra).
  Ningún ancestro tiene `overflow` (el contrato de `Seccion` lo prohíbe): el corte sale de otro lado (la mezcla o el plano
  del ≠). Queda para la matriz visual.

## Las aserciones viejas que cambiaron (se completa por punto)

| Punto | Dónde | Antes | Ahora | Por qué |
|---|---|---|---|---|
| J1 | `s56` · el tamaño de la frase del CTA | `TAMANO_DEL_CTA` con el mínimo entre el display XL y el lugar del CTA / 3,65 | lo mismo, más un tercer término: el ancho de la pantalla menos los márgenes, / 15,4 | La frase en volumen mide 14,93 em en un renglón: a 1024 era más ancha que la pantalla. Lo de antes sigue entero adentro |
| J8 | `s44` · los glifos del pie | la Chivo 600 del pie traía «Trabajos» | trae «Portfolio» y «Demos» (regenerada con `scripts-retoque/fuentes-3d.py chivo-600-pie.json`) | La aserción no cambió: cambió el contenido y faltaban la f y la D |
| J8 | `s45` A3 · cada destino del pie | el ancla de una sección | el ancla de una sección o un subdestino declarado adentro de una (`SUBDESTINOS`: Demos, en Trabajos) | Demos es un destino nuevo adentro de Trabajos, con su propio nudo; sigue sin poder ser `#contacto` ni un ancla suelta |
| J8 | `s52` B4 · las piezas que frenan el polvo | todas menos el texto suelto | todas menos el texto suelto y los enlaces de texto | Los enlaces del recorrido ya no son placas sino letras sueltas, como el texto: el polvo no las atraviesa por su caja |
| J8 | `s8-chrome` §4 · los destinos y rótulos del pie | las secciones de la tabla menos el Cierre y Números; el hero, «Inicio» | lo mismo, con Demos después de Trabajos y Trabajos como «Portfolio»; y una afirmación nueva: el ancla de cada subdestino está en el marcado | El menú del pie que pidió J8. Lo de antes sigue derivado de la tabla |
| J8 | `s8-chrome` §4 · los enlaces internos del pie van a un ancla que existe | contra las anclas de las 8 secciones | contra las 8 más las de los subdestinos que existen en el marcado | `#demos` existe (en el texto de las demos), y lo afirma la línea de arriba |
| J8 | `s8-cierre` §1 · las columnas dejan libre el hueco del logo | dos veces el ancho «medio cuadro menos el hueco» en la fuente | una clase para las dos columnas: en el pie plano, la de antes; con el de volumen, un cuarto (25/50/25), con la cuenta de que un cuarto deja libre más que el hueco en cinco cuadros desde 1024 | El 25/50/25 de J8 |
| J8 | `s8-cierre` §1 · la navegación del pie | Inicio, Quiénes somos, Trabajos, Servicios, Tu panel, Por qué develOP | Inicio, Quiénes somos, Portfolio, Demos, Servicios, Tu panel, Por qué develOP | El menú que pidió J8 |
| J8 | `s27` · los dos motores van al mismo píxel | `destinoDelViaje(seccion)` | `destinoDelViaje(seccion, elAncla === seccion ? null : elAncla)` | Un subdestino (Demos) viaja a su propio nudo; las secciones, al de siempre |
| J3 | `s60` H2 §1 · el botón del pie mientras viaja | la ruedita (`Loader2`, que gira) en el aire del botón | la carga chica encima del rótulo, que se queda invisible guardando el ancho | J3: el botón se vuelve la carga |
| J3 | `s60` H3 §1 · los estados del panel | `<AnilloDeCarga quieto={reducido} />` con el estado en el envoltorio | `<Carga tamano="grande" …/>` (el estado lo anuncia la carga) | J3: la carga de develOP reemplaza al anillo |
| J3 | `s60` H3 §2 · la carga del panel | el anillo 3D en el material de la escena, en su propio lienzo, sin compositor | ni el panel ni la carga traen un lienzo ni three (control: el panel con el anillo) | El anillo se fue con J3 |
| J4 | `s55` §6 · la fuente de la frase del CTA | sólo con las letras de la frase | con las de la frase y las del título de la tarjeta de gracias (y nada más) | J4 · c: el título en 3D se compone como la frase, con su fuente |
| J5 | `s60` H2 §1 · los rótulos del botón | dos (Enviar, Enviando…) | tres (y Reintentar), con `perspective-midrange` en su grilla (el giro) | J5: Enviar pasa a Reintentar girando |
| J5 | `s44` · ninguna pieza gira; la tecla se hunde sin girar | ningún giro en todo `armadas.ts` | ninguno salvo `girarLaTecla` (Reintentar entra desde canto, por tiempo, y termina de frente), con una afirmación nueva: gira por tiempo y no lee el mouse | J5 pidió el giro de Reintentar |
| J5 | `s52` C4 · el lugar del botón del pie | `self-start …` | `z-10 self-start …` | El error sale de atrás del botón |
| J9 | `s5-quienes-somos` · las clases `hover:` de la sección | 33 | 36 | La leyenda corta de la foto del equipo abajo de 1024 («El equipo detrás de develOP») lleva el mismo texto del revelado que las otras (3) |
| J10 | `s60` H1 · el modelo del polvo | adentro de `s60` | en `modeloDelPolvo.ts`, compartido con `s61`. El cableado de hoy le pasa además la quietud con la histéresis; el de antes, la de siempre | Las mismas afirmaciones y los mismos controles, ahora contra el código de hoy (con J10) |
