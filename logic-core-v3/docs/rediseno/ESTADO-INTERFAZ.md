# Estado de la interfaz — después de INTERFAZ 1, INTERFAZ 2, NAVBAR V3 y 3D Y SONIDO

> Qué hay en la capa de interfaz de /v3 (el texto en movimiento, el rollover, el cursor, los estados), las variantes en
> la URL, los invariantes y lo que quedó abierto. La escena tiene su propio estado (`ESTADO-ESCENA.md`). Las entregas de
> INTERFAZ 1 están en `~/.cache/b4-medicion/interfaz1/<ticket>/` (con un `mirar.txt` por carpeta). Rama `rediseno/home`,
> un commit por ticket. Todo banco con la NVIDIA (`BANCO_GPU=alta`, leída en la página).
>
> **Cierre de INTERFAZ 1 (decisiones de Valentino):** la inercia MARCADA (tope 5°) es el producto; el cursor de la
> sala es el producto; las variantes de la URL se borraron (sin inercia queda sólo con movimiento reducido, donde no se
> instala la coreografía). El rollover del menú y del pie va al sprint del navbar; el corrimiento de la fuente, a la pasada
> técnica. El margen del túnel subió a 6 px y los casos del foco que el pase de Tab capturó mal se midieron con el control
> quieto y en pantalla (§3): de ahí salieron tres arreglos más en el carrusel del teléfono.
>
> **INTERFAZ 2 (la escena y la interfaz, una sola cosa):** cuatro tickets con bandera (T1 `379338c6`, T2 `ebde7524`,
> T3 `08049b68`, T4 `c353ed22`). **Cierre de INTERFAZ 2 (decisiones de Valentino):** T1, T2 y T3 al producto (Tu panel
> con la barra sola, sin número); el cartel de las demos, uno solo y pegado al cursor (el círculo «Abrir» se borró); el
> indicador de recorrido, un infinito (las dos variantes de T4 y su navegación se borraron); de día, sólo la sombra
> real del logo. Las cuatro banderas se borraron (§5). Las entregas, en `~/.cache/b4-medicion/interfaz2/<ticket>/` y
> `interfaz2/cierre/<decisión>/`, cada una con su `mirar.txt`. **Cierre final:** la vida de Servicios, no (se borró el
> recorrido del pedido de ejemplo: Servicios queda como antes de INTERFAZ 2); Tu panel queda con la barra sola, y la
> idea de simular el producto con los componentes reales del panel va a `PROXIMA-ETAPA.md`; lo demás, aprobado tal cual.
>
> **NAVBAR V3 (el menú propio del home, liquid glass y destinos):** cuatro tickets, un commit cada uno: T1 `d514e28e`
> (ítems y destinos), T2 `ce198959` (la barra de escritorio propia, con el rollover), T3 `133aea71` (el menú del
> teléfono de vidrio líquido con el Genie; partido en dos archivos en `b6d364c5`), T4 `72b85aa2` (el contacto en el teléfono, entero en una pantalla). /v3 dejó
> de importar la pastilla compartida, que queda para la galería (§6). Las entregas, en
> `~/.cache/b4-medicion/navbar/<ticket>/mirar.txt`.
>
> **Retoque del navbar (ronda final):** cinco puntos, un commit cada uno: 1 `7113fdbf` (el menú nace con su vidrio y
> el clic sin tirón), 2 `f160807d` (el cierre sin esquinas: la forma se funde en el botón), 3 `f5d2fe1b` (Portfolio y
> Por qué develOP viajan como todos y el título llega después), 4 `77168e15` (el hover de la barra, tranquilo, en dos
> variantes), 5 `a27251e0` (el carrusel con movimiento reducido y `s3-tokens` en verde). Las entregas, en
> `~/.cache/b4-medicion/navbar/retoque/<punto>/mirar.txt`.
>
> **Cierre del navbar:** el hover de la barra es la variante `b`, el resaltado que se desliza (`b92b1f09`: la `a` y la
> bandera se borraron); lo demás del retoque, aprobado. Y se recuperó el hover de las fotos del equipo (`c5cfa28b`,
> §6). Clips en `~/.cache/b4-medicion/navbar/cierre/fotos/`.
>
> **3D Y SONIDO:** tres tickets, un commit cada uno: T0 `7f8aaa08` (el hover de las fotos arranca desde un punto), T1 `92d345e8`
> (los títulos 3D de ESCENA 10 al producto, con la llegada aislada del navbar: `ESTADO-ESCENA.md`), T2 `708aa941` (el sonido,
> con bandera y apagado en el producto: §7). Las entregas, en `~/.cache/b4-medicion/3d-sonido/` (`LEEME.txt`).
>
> **RETOQUE 3D:** los bugs de «Y más…» (B4) y «para elegirnos» (B5), los bloques en CSS 3D, el cierre del túnel, el pie
> con el contacto de verdad (todo apunta a contacto; sin WhatsApp), Contacto y Login en la esquina de la barra, el
> infinito más grande y el sonido en el producto con candidatos para elegir (§8). Las entregas, en
> `~/.cache/b4-medicion/retoque-3d/`. Invariante: `npm run test:s41-retoque-3d`.
>
> **Insumo que no existe:** la instrucción mandaba leer `OBSERVACION.md`; no está en el disco. La medición de nk de la que
> sale «la sensación de caro viene de completitud, no de espectáculo» es `docs/rediseno/sprints/SITIO-S2-motion.md`.

## 1 · Qué hay

| Pieza | Qué hace | Dónde |
|---|---|---|
| **T1 · el canal del texto** | Un sistema único: `titulo` y `parrafo` por línea, `etiqueta` por palabra, todos con máscara, con UNA curva (`principal`) y una escala de duraciones (1 · 0,8 · 0,6 de P1). El elemento tipográfico es el mismo en la rama quieta y en la animada (sin saltos de layout); el texto entero en un `sr-only`, las piezas `aria-hidden`; con menos movimiento y abajo de 1024, quieto | `_lib/motion/texto.ts`, `_secciones/_contrato/canales.tsx` (`CanalDeTexto`), `motion/_componentes/TextoQueEntra.tsx`, `PalabrasDeTexto.tsx`, `LineasDeTexto.tsx` (raíz `span`) |
| T1 · dónde | Quiénes somos (el equipo, los nombres, la bajada, las descripciones), Trabajos (la bajada), Tu panel (la descripción), Cierre (el titular y las etiquetas de las columnas). **Excepciones declaradas:** el hero (LCP), Servicios (el párrafo que se pinta y el rodillo, gestos aprobados), el párrafo de las demos (cambia con el ancho) | las secciones |
| **T1 · el texto con inercia** | Con el scroll rápido los títulos se inclinan (`skewY`) y vuelven con un resorte exacto (ζ ≈ 0,55). Lenis publica su velocidad una vez por cuadro en px/s; un bucle, un resorte, un `MotionValue` para todos; cero `setState` y cero reservas por cuadro. Nada hasta 600 px/s, **5° de tope** (la marcada, elegida en el cierre) a 4.500 px/s; un salto de más de 400 px en un cuadro no cuenta. Con movimiento reducido, ninguna | `_lib/velocidadDelScroll.ts`, `_lib/motion/inercia.ts`, `_componentes/ScrollSuaveDeV3.tsx`, `ConInercia` / `Inclinado` |
| **T2 · el rollover de dos copias** | El gesto medido del CTA (6° / 10°, el barrido de clip-path, 1,3 s) en `em`, para links y botones del home: el mail y WhatsApp del Cierre, los nombres de los proyectos. Hover sólo con puntero fino; el foco siempre; la copia B `aria-hidden` | `_componentes/rollover/DosCopias.tsx`, `_estilos/rollover.css` |
| **T2 · el cursor de la sala** | Punto + halo con la persecución medida en nk, en segundos; el tono del fondo opaco de abajo o de la noche de la escena; estados `texto`, `enlace`, `boton`, `demo` (el cartel de las demos: §5), `logo` (lo publica la escena: `LOGO_BAJO_EL_PUNTERO`), `oculto`. Desde 1024, puntero fino, sin movimiento reducido. El nativo nunca se oculta. Reemplaza en el home al de S3 (que sigue en la galería). Elegido en el cierre: la variante nk se borró | `_chrome/cursor/`, `_estilos/cursor-sala.css`, `_lib/escena/entorno/hoverDelLogo.ts` |
| **T3 · el foco de dos tonos** | El contorno con la tinta del elemento + un borde de papel (C40): se ve sobre claro, sobre oscuro (Trabajos) y adentro de `difference` (abajo de 1025). Los recortes de la cinta, del carrusel y del túnel dejan 6 px (el anillo entero); el renglón del carrusel lleva esa holgura en la caja (relleno y margen negativo: aporte cero) porque su pista compuesta no respetaba el margen; la portada enfocada sube un piso para que la vecina no le tape el anillo | `_estilos/foco.css`, `_estilos/demos.css`, `trabajos/CapaDelTunel.tsx` |
| Cierre · el carrusel con el teclado | La portada enfocada queda a la vista también la primera de cada fila (antes la vuelta de la pista mostraba la COPIA y la enfocada quedaba afuera del cuadro: `objetivoDelFoco`); y la capa de demos termina de llegar al entrar con el teclado (lo mostrado se asentaba detrás del salto, escala 0,76: `llevarALaLlegada`, que sólo mueve la página) | `trabajos/demos/fisicaDelCarrusel.ts`, `Carrusel.tsx`, `CapaDeDemos.tsx`, `llevarALaLlegada.ts` |
| T3 · los estados | Apretado (opacidad 0,6, sin transición) en todo lo que se toca; el revelado de las fotos con el teclado; el «Hablanos» del final que lleva la página adonde llega si toma el foco antes; el contacto con un aviso de error, `aria-invalid` en los intereses y borde de error punteado; la demo que dice que carga; los CTA de Servicios en escritorio con menos movimiento; hover en las redes del pie | `foco.css`, `quienes-somos/marco.tsx`, `por-que-develop/PorQueDevelop.tsx`, `_chrome/contacto/`, `trabajos/demos/VentanaDeDemo.tsx`, `servicios/CtaDelServicio.tsx`, `cierre/PiezasDeContacto.tsx` |

## 2 · Sin variantes

Las tres variantes de la URL (`?interfaz=…`, `_lib/interfaz.ts`) se borraron en el cierre: quedan la inercia marcada y el
cursor de la sala. Ganchos del banco (sólo con `__entornoDeLaEscena`): `__inerciaDelBanco.estado()` (la velocidad en px/s
y los grados).

## 3 · Los invariantes y los bancos

`npm run test:s37-interfaz1` (una sección por ticket con sus controles positivos y la del cierre; 116 afirmaciones). Ajustados por este
sprint, con su porqué en el fuente: `quienes-somos` (7 piezas y 6 divisores), `s6-tu-panel` (+1 transformada: la
inclinación), `s8-cierre` y `s5-trabajos` (el texto anunciado y el nombre accesible sin lo que cuelga de `aria-hidden`),
`s8-chrome` (la compuerta del cursor nuevo), `angosto-invariante` (el CTA por servicio con `enEscritorio`); en el cierre,
`s5-trabajos` (el margen del túnel, derivado del tema: desplazamiento + DOS grosores) y `demos-invariante` (el empujón del
teclado sólo mueve la página: la llegada sigue sin reloj propio). En el cierre 2: `s5-archivos` (`llevarALaLlegada.ts` en el
padrón) y `rollover.css` (la regla del puntero fino nombra también el foco: la paridad hover/foco de `s3-foco`).

Los bancos (`scripts-interfaz1/`, contra el servidor de desarrollo): `recorrido` (el recorrido con la rueda y el vigía:
corrimientos del layout, el divisor rehecho a la vista, las fuentes), `frenada` (la ráfaga y la frenada sobre un título,
a tiempo real y lento, con la inclinación de cada cuadro), `raton` (el mouse sobre los controles, el estado del cursor),
`foco` + `foco-hoja.py` (Tab real, una captura entera por paso y el contraste del anillo en píxeles, por franjas y en la
escala de la pantalla), `estados` (apretado con el botón sostenido, el revelado, el CTA del final, el contacto, la demo,
Servicios con menos movimiento), `foco-casos` (los casos que el pase capturó mal: Tab desde arriba hasta el control y
captura con la caja quieta, con tamaño y entera en pantalla; la hoja mide también el anillo de dos tonos ENTERO: el
contorno contra su borde, de los dos lados), `chequeo` y `sonda`.

**El foco, al cierre** (`interfaz1/t3-completitud/`): a 1440, 0 anillos bajo 3:1 (mediana 16,4); a 390, mediana 17,1 y dos
rótulos del túnel que el instrumento da en ~2,6 a escala 0,55 (sus píxeles muestran el contorno claro entre dos franjas
oscuras en los cuatro lados: `casos-de-cerca.png`). Los casos: el primer libro a 1440, 13,5:1; las primeras portadas del
carrusel a 390, 18:1 en los cuatro lados con el anillo por dentro (cierre 2: `foco-casos-inset/carrusel-inset-de-cerca.png`).

**Cierre 2 · el anillo por dentro en el carrusel** (decidido): el carrusel sigue a sangre y su portada enfocada lleva el
anillo hacia adentro, sobre la caja de la imagen sin el aire de la derecha: papel, tinta, papel (2 px cada uno) en un
`::after`. El contorno de afuera queda transparente sólo ahí (en colores forzados lo pinta el sistema). Medido con Tab
desde arriba a 390, la primera portada de cada fila: los cuatro lados, 18:1; a izquierda y derecha el contorno cae medio
píxel corrido (la pista para en −0,5 px) y se ve suavizado. `_estilos/foco.css`.

## 4 · Lo que quedó abierto

- **El rollover del menú: hecho en NAVBAR V3 y sacado en su retoque 4** (la barra lleva un hover tranquilo, §6).
  **El de los links del pie sigue pendiente**: `chrome/PiePiezas.tsx` es compartido; una prop opcional `rotulo?: (texto) =>
  ReactNode` y el home pasa `DosCopias` (detalle en `interfaz1/t2-rollover-cursor/mirar.txt`).
- **El corrimiento de la carga (0,067) → la pasada técnica** (decidido; en `PROXIMA-ETAPA.md`): el cambio de la fuente
  de respaldo a la Chivo, en `layout.tsx` (compartido, no se tocó). Medirlo con un build de producción; si sigue,
  `display: 'optional'` o un respaldo con métricas ajustadas.
- Compartidos: el `:hover` pegado en táctil (`cta.css`, `pie.css`, `navegacion.css`), los abridores del contacto sin
  `aria-haspopup` (`Cta`), el input del newsletter que acepta texto con el envío deshabilitado (`Novedades`).
- Diseño: una pausa para el video de Servicios y para el carrusel del teléfono (WCAG 2.2.2); flechas en el carrusel.
- El CTA que rota de Servicios se desmonta fuera de su tramo (con Tab no se llega en escritorio).
- ~~Los títulos de volumen (ESCENA 10 T3) siguen pendientes para la etapa de 3D~~ → [3D Y SONIDO] T1: en el producto
  (Portfolio y la frase); no entraron al canal del texto (la pieza del DOM sigue llegando por su canal, invisible).

## 5 · INTERFAZ 2 · en el producto (cierre)

Sin banderas: `responde`, `anticipa`, `vida` y `recorrido` se borraron de `Pruebas` (`_lib/escena/entorno.ts` vuelve a
`{ titulos }`), junto con `usePrueba` (`_lib/pruebasDeLaInterfaz.ts`) y los dos indicadores de T4.

| Pieza | Qué hace | Dónde |
|---|---|---|
| T1 · la escena responde | Un CTA con el puntero encima (o el foco) pide el PULSO PRINCIPAL de E4 a la misma máquina (`pedido`: sin scroll, con lugar, no a menos de 1,6 s de otro). Un valor de Por qué develOP hace ondear el piso vivo desde el logo hacia el piso que se ve debajo del valor (Servicios no tiene tarjetas y tapa la escena). El menú del teléfono abierto: la luz de la sala baja un 22 % y el lienzo se desenfoca (`--blur-panel`); el velo desenfoca poco la página | `_chrome/escena/RespuestaDeLaEscena.tsx`, `salaDetrasDelMenu.ts`, `_lib/escena/interfaz/{pedidos,respuesta}.ts`, `entorno/maquinaDelPulso.ts`, `piso/ondaDirigida.ts` |
| T2 · la vista previa del destino | El puntero o el foco sobre un ítem de la barra: la luz se corre hacia la del destino adentro de su clase (de día no cruza a la noche, de noche no la deja) y la cámara gira 7°; vuelve sola al segundo. Con el clic el viaje sale de la anticipación y la descuenta con su avance (sin salto) | `_chrome/escena/AnticipacionDelMenu.tsx`, `_lib/escena/interfaz/anticipacion.ts`, `OrbitRig.tsx` |
| T3 · la vida propia | Las portadas del estante ondean al pasar (filtro SVG sobre la imagen). **Tu panel:** una tarjeta oscura con el panel andando con datos de ejemplo: los pedidos que entran (con `@starting-style`, sin transformadas en el marcado) y la barra de actividad SOLA (ningún número: decisión del cierre); botón de pausa (se mueve más de 5 s). **Servicios:** sin vida propia (cierre final: el recorrido del pedido de ejemplo se borró, `ProcesoEnVivo` y sus textos; la sección es la de antes de INTERFAZ 2) | `trabajos/demos/{ondaDeLaPortada.ts,OndaDeLasPortadas.tsx}`, `_componentes/vida/` |
| Cierre · el cartel de las demos | Uno solo: la pastilla del estante, pegada al cursor de la sala (sobre una demo el punto y el halo se van). Nace en el punto del cursor y se abre de costado hasta su ancho; al cambiar de demo es UNA caja que se estira o se achica continua con dos capas de texto que se funden; al salir se achica hacia el cursor. Sigue al mouse con la persecución de INTERFAZ 1 y se apoya ARRIBA de la cara levantada (el aire de `scroll-margin`): no tapa la demo. Un libro todavía apagado (el vacío del túnel lo tapa con una máscara, que no corta el puntero) no lo abre. Sin el cursor de la sala (táctil, movimiento reducido) y con el teclado, la pastilla fija de siempre (`PRESENCIA_DEL_CURSOR`) | `_chrome/cursor/{CursorDeLaSala.tsx,estado.ts,presencia.ts}`, `_estilos/cursor-sala.css`, `trabajos/demos/Biblioteca.tsx` |
| Cierre · el infinito del recorrido | Una lemniscata (no el logo) que se dibuja de 0 a 100 % de la página sobre su pista tenue, con la inercia del scroll (directa con movimiento reducido); debajo el porcentaje, chico y tabular. Sin botones ni clics; mudo para el lector (`aria-hidden`: un progressbar que cambia con cada scroll pitaría en NVDA). Trazo fino, puntas redondas, con un halo de papel. El tono, el de lo que hay debajo (como el cursor; una foto o un video cuentan como oscuros), releído con el scroll y quieto. Escritorio abajo a la derecha; teléfono más chico, lejos del botón del menú | `_chrome/recorrido/{recorrido.ts,InfinitoDelRecorrido.tsx}` |
| Cierre · la noche que se ve | El cursor y el infinito leen la noche que la sala MUESTRA (la del arco o la de la gota, la mayor: `nocheQueSeVe`). Con la de la gota sola, llegando a Trabajos de un salto quedaban oscuros sobre la noche | `_chrome/cursor/estado.ts` |

Lo que se mide y lo que hay que mirar, en `interfaz2/cierre/` (`cartel/`, `infinito/`, `sombra/`, `vida/`, `costo/`). El
costo con todo encendido, contra b26c8c45 (la NVIDIA, 1440, el recorrido entero): el ritmo a 75 Hz igual (p50 13,3 ms;
p95 13,4–13,7 contra 13,4–13,5; 0–1 cuadros perdidos contra 0–4, sueltos), el tiempo de GPU igual (p50 0,94 contra
0,93–1,00 ms); los cuadros por segundo sin tope bajan un 10–15 % (trabajo de CPU por cuadro, con margen de sobra).

Invariante: `npm run test:s38-interfaz2` (65 afirmaciones: las del producto de T1–T3 y una sección por decisión del
cierre, con sus controles positivos). Bancos: `scripts-interfaz2/` (`t1-sonda`, `t1-clips`, `t2-anticipa`, `t3-portadas`,
`t3-vida` —con `cierre`, Tu panel tal como quedó; sin Servicios—, `cierre-cartel`, `cierre-infinito`, `cierre-sombra` + `cierre-sombra-hoja.py`,
`cierre-pasos`); los de T1–T3 piden su bandera, que ya no existe: los dos lados muestran el producto. Ajustados en el
cierre: `s36-escena10` (`Pruebas` vuelve a ser `titulos`; la mancha de día en cero), `s6-tu-panel` y `s10-acceso` (un focalizable
más: la pausa del panel) y `SELECTOR_DE_LOS_VIAJES` (sin los puntos del indicador, como antes de INTERFAZ 2).

## 6 · NAVBAR V3 · el menú propio del home

| Pieza | Qué hace | Dónde |
|---|---|---|
| T1 · los ítems | Quiénes somos · Portfolio · Servicios · Panel · Por qué develOP · Contacto, una sola lista para la barra y el menú. «Portfolio» sigue yendo a `#trabajos`; «Panel» (nuevo) a `#tu-panel`; «Contacto» abre el formulario, como antes | `_chrome/enlaces.ts` |
| T1 · los destinos | Quiénes somos un poco antes: la primera pantalla centrada en el cuadro libre bajo la barra, sin adelantarse al título ni pasarse del reposo de antes (1440: 917 en lugar de 1035). Panel: la cabecera de Tu panel entera a la vista, sin asomar Servicios. Servicios y Contacto, como antes | `_componentes/destinosDelViaje.ts` |
| Retoque 3 · la llegada del título | Portfolio y Por qué develOP viajan como todos (un viaje, la duración de siempre); al llegar, antes de que se vaya el velo, el título repite su llegada aislado (900 ms, `CURVAS.principal`), a la par del progreso del scroll. La «llegada a la vista» de T1 se borró | `_componentes/llegadaDelTitulo.ts`, `_secciones/_contrato/canales.tsx` (`llegadaDe`), `useDeslizamientoDelCta.ts` |
| T2 · la barra | La misma pastilla visual y la misma geometría (`--barra-*` = `--nav-*`), propia del home. Sin el rollover de dos copias: el hover es un resaltado suave, UNO, que sigue al puntero y al foco y descansa en el activo (es el indicador; al cierre quedó esta variante, la `b`, y la línea desde el centro y la bandera se borraron). El modo: la barra desde `medio` si entra; abajo, el menú del teléfono (antes quedaba una franja de 628 a 860 sin barra ni menú) | `_chrome/barra/BarraDelHome.tsx`, `_estilos/barra.css` |
| T3 · el menú del teléfono | Se abre con el Genie de las demos desde el botón y se cierra de vuelta a él (la misma geometría, duración y reloj, que ahora comparten); con movimiento reducido, el fundido de las demos. Casi toda la pantalla, 16 px de margen en los cuatro lados. Montado y escondido desde el modo menú: abrir no monta nada, y cada tira lleva sólo las piezas medidas de su rendija (el texto). [Retoques 1 y 2] Durante el Genie se ve el vidrio de verdad recortado por la silueta de sus filas, con las esquinas del radio del panel al del botón: adentro, la forma es el círculo del botón. El clic arranca el Genie a mano; lo de React va en una transición; el vidrio y las tiras se precalientan al montar | `_chrome/menu/{MenuMovil,MenuDeVidrio,PanelDelMenu,GenieDelMenu}.tsx` (el botón; el panel, sus fases y el Genie; el adentro y la geometría medida; las tiras), `silueta.ts`, `_secciones/trabajos/demos/genie.ts` (`correrPorTiempo`) |
| T3 · el vidrio | Desenfoque 12 px y saturación 1,8 del fondo, especular arriba, filo de luz; en Chromium, la refracción del canto (un filtro SVG en el `backdrop-filter`: Safari no lo pinta y, con él, pierde el desenfoque; se detecta por motor, `navigator.userAgentData`). El tono de la zona, leído al abrir: sobre zona clara vidrio oscuro, sobre oscura vidrio claro. El texto en AA contra cualquier fondo (tinte 56 %; medido 6,5 y 6,7:1; 6,33 y 6,68 en el retoque). Durante el Genie, el mismo vidrio con un filo que sigue a la silueta; sin copia plana ni relevo, y sin sombra de afuera (el recorte la cortaba) | `_estilos/vidrio.css`, `_chrome/menu/{lente.ts,LenteDelVidrio.tsx}` |
| T3 · el diálogo | El foco atrapado (la trampa sólo abierto), el botón de cerrar ADENTRO en el lugar del botón del menú, Esc y tocar afuera cierran, el foco vuelve al botón. Ítems en `titulo-m`, renglones de 48 px como mínimo. El tono del botón con la noche que se ve (`nocheQueSeVe`) | `MenuMovil.tsx`, `useTonoDebajo.ts` |
| T4 · el contacto | La hoja del teléfono entra entera en una pantalla a 390 × 844 y a 375 × 667 (y a 390 × 664, las barras de Safari de un iPhone 14/15) con el botón de enviar a la vista, sin sacar campos. La de escritorio no cambia | `_chrome/contacto/{FormularioDeContacto,CamposDelContacto}.tsx` |
| Cierre · el hover de las fotos del equipo | Recuperado (`ee87777b` lo había cambiado por un fundido), como el de nk: la foto descontracturada crece desde un punto de 2 px en el centro ([3D Y SONIDO] T0; antes, un rectángulo de ~17 %, y con la curva de apertura que arranca rápido) hasta llenar la tarjeta (una máscara, `clip-path`, 400 ms), después suben abajo a la izquierda el nombre y el rol, escalonados; al salir, al revés. Son transiciones: entrar y salir rápido se revierte desde donde va. El foco hace lo mismo; con movimiento reducido, un fundido. En el teléfono, sin hover: el toque abre y cierra (el botón del marco que ya estaba). Las fotos salen en AVIF (WebP de respaldo) al tamaño del `sizes` | `_secciones/quienes-somos/{marco,equipo}.tsx`, `next.config.ts` (`images.formats`) |

**El costo del menú** (390 × 844, NVIDIA): con la CPU normal, un cuadro largo en la primera apertura (40–173 ms) y
después 13,3 ms; con la CPU ×4, abrir y cerrar con p95 27–67 ms y un cuadro largo en el clic (107–295 ms); el vidrio
quieto, 13,3 ms. SPRINT CONTACTO había descartado el Genie en este menú por p95 93 ms. **Después del retoque 1**: del
clic al primer cuadro del Genie, 6–12 ms; con la CPU normal ningún cuadro de más de 14 ms (seis aperturas y seis
cierres, dos corridas; una corrida anterior tuvo uno de 80 ms en la primera apertura que no se repitió); con la CPU ×4,
tres cuadros de 27 ms en la primera apertura y ninguno largo (`navbar/retoque/1-transparencia/costo.json`).

**Safari.** Playwright 1.61 con WebKit 26.5 (instalado en el sprint): el panel no lleva la lente, declara el
`-webkit-backdrop-filter` y el diálogo anda igual. Lo que no se puede ver ahí es el vidrio: el WebKit de Playwright en
Windows no pinta `backdrop-filter`. Se mira en el iPhone. Después del retoque la forma del Genie es una pieza (antes se
veían franjas entre las tiras); el texto, al pasar por el cuello, se ve cortado entre tiras (en Chrome no).

**El destello** (`npm run test:escena-destello`, con scroll real): 22 afirmaciones y 0 fallas al cierre. Se ajustó la
definición con su control: un destello de luz mueve la mitad de las celdas a la vista o más; el logo de canto en un
viaje rápido que cruza Trabajos saca el 24–31 % y daba un falso pico (ya pasaba antes del sprint, en una de dos
corridas).

Invariante: `npm run test:s39-navbar` (61 afirmaciones: una sección por ticket y por retoque, con sus controles
positivos). Bancos: `scripts-navbar/` (`t1-viajes`, `t1-sonda-destello`, `t2-barra`, `t3-menu`, `t3-webkit`,
`t4-contacto`; los del retoque, `r3-llegada`, `r5-pendientes`, `r12-menu`; el del cierre, `c1-fotos`). Ajustados:
`s10-acceso` (una parada más, «Panel»), `s18-deslizamiento` (ocho llamadas a `terminar` después del retoque 3), `s26-menu` (los seis ítems, la
barra propia, el menú nuevo), `s27-viajes` (la barra propia, una duración, el nuevo reposo de Quiénes somos), `s38`
(el selector de la anticipación; `s26`, `s27` y `s38` leen el menú en sus tres archivos), `s3-archivos` y el registro (`barra.css`, `vidrio.css`), el instrumento del destello y
los bancos que tocaban la barra (`scripts-viajes`, `scripts-interfaz1/2`, `scripts-b11`).

## 7 · 3D Y SONIDO · el sonido (con bandera, apagado en el producto)

Hasta que Valentino lo escuche, el producto no suena ni descarga nada de sonido. El sitio con sonido:
`/v3?pruebas=sonido=si` (aparece el parlante); la página de prueba: `/v3?sonidos=1` (un botón y un volumen por sonido,
que se guardan en el navegador y usa el sitio). Las fuentes y las licencias: `docs/rediseno/SONIDO.md` (once sonidos
generados con síntesis propia, CC0; howler.js 2.2.4, MIT).

| Pieza | Qué hace | Dónde |
|---|---|---|
| El parlante | Junto al infinito (en escritorio a su izquierda; en el teléfono encima), en su lenguaje (trazo fino, puntas redondas, el borde tenue del tono contrario) y con su tono (copia el `data-seccion` que el infinito leyó). Apagado por defecto; la elección se recuerda (`localStorage` con try/catch). Si quedó prendido de otra visita, el motor llega con la primera acción en la página | `_chrome/sonido/ControlDelSonido.tsx`, `_lib/sonido/preferencia.ts` |
| El motor | howler con UN sprite (Opus 124 KB; AAC 151 KB para Safari), descargado recién al prender (un `import()`). Un sonido pedido antes de que el archivo cargue se descarta. Cada uno con su volumen y su separación mínima; los largos no se pisan; `callar` los funde. El ambiente: los dos bucles a la vez, repartidos por la noche que se ve; sin él con movimiento reducido o con la pestaña oculta | `_lib/sonido/{motor,catalogo,sprite}.ts`, `_chrome/sonido/motorCompartido.ts` |
| El bus | `sonar` y `callar`, lo único que importan las piezas que suenan: sin motor no hacen nada | `_lib/sonido/bus.ts` |
| Dónde suena | La barra (`tic`), cualquier enlace o botón (`clic`, un oyente delegado), el Genie del menú y de las demos (`abre`, `cierra`), las fotos del equipo (`foto`: el mouse, el foco, el toque), el principal del pulso (`pulso`), el guion del haz (`encendido`), el túnel (`tunel`), el amanecer que arranca de a poco (`amanecer`) y el ambiente (`dia`, `noche`). En la escena, sólo en un cambio (nada por cuadro) | `BarraDelHome.tsx`, `MenuDeVidrio.tsx`, `VentanaDeDemo.tsx`, `marco.tsx`, `entorno/Entorno.tsx`, `amanecer/Amanecer.tsx` |
| La página de prueba | Un panel sobre el sitio: «Cargar los sonidos» (la acción que habilita el audio), «Sonar» y un volumen por sonido, el bucle de cada ambiente, el general, «Volver a los de fábrica» y los valores escritos para pasarlos | `_chrome/sonido/PruebaDeSonidos.tsx` |

Invariante: `npm run test:s40-3d-sonido` (la sección de T2). Banco: `scripts-3d-sonido/t2-sonido.ts` (sin oírlo: qué se
descarga y cuándo, y qué sonido pide cada gesto) y el generador, `t2-sonidos.ts`.

## 8 · RETOQUE 3D

| Ticket | Qué cambió | Dónde |
|---|---|---|
| B4 `64eb943a` | «Y más…» y el newsletter aparecen y se van en su lugar (una corrida corta, tres de los puntos, con fundido); antes salían del borde del cuadro y lo cruzaban | `tu-panel/Remate.tsx`, `tu-panel/entrada.ts` |
| 3D `780861b5` | Las fotos del equipo (los dos retratos y «Nosotros») llegan desde atrás en un marco con espesor (CSS 3D: cuatro cantos, perspectiva desde el centro de la página) y quedan fijas; al revés para arriba; el hover no cambió | `quienes-somos/fotoEnVolumen.tsx`, `equipo.tsx` |
| 3E `12cbc203` | Las demos se levantan desde atrás sobre su base (`rotateX`, con el sobrepaso de siempre) y se acuestan para atrás | `trabajos/demos/entrada.ts`, `_estilos/demos.css` |
| 3G `77866608` | Cada valor de Por qué develOP llega desde un lugar distinto de la sala (CSS 3D; antes P5) | `por-que-develop/valorEnVolumen.tsx` |
| 3H `e77c63fa` | El cierre del túnel: sin «Hablemos» ni «(un clic y arrancamos)»; abajo y centrado «Clickeá acá para empezar», gris #8E8E8D (3,06:1 sobre el papel de la ventana: la mezcla de sus tokens al 45 %), lleva al pie | `trabajos/piezas.tsx`, `trabajos/ventana.ts` |
| 3I `520657d9` | El pie en volumen (CSS 3D: dos paredes y un piso que miran al logo; llegan desde atrás). El contacto es un formulario (nombre, mail, mensaje) que **no envía todavía** y lo dice (el envío y su validación de servidor: próxima etapa). WhatsApp se fue del pie y la hoja de contacto (que enviaba por WhatsApp) ya no se monta. **Todo apunta a contacto**: el viaje resuelve un ancla que no es sección (`#contacto`) a su sección y enfoca el formulario; los `[data-abre-contacto]` viajan ahí | `cierre/{FormularioDelPie,planoDelPie}.tsx`, `_componentes/useDeslizamientoDelCta.ts`, `_chrome/contacto/{apertura.ts,Contacto.tsx}` |
| N1 `5c1fba6a` | Contacto sale de la pastilla y va arriba a la derecha con «Login» (`/login`, el del sitio), en su propia pastilla de vidrio, siempre arriba; si no entra, el menú del teléfono. En el teléfono, los dos al pie del menú de vidrio | `_chrome/enlaces.ts`, `barra/BarraDelHome.tsx`, `_estilos/barra.css`, `menu/PanelDelMenu.tsx` |
| N2 `8e9bee41` | El infinito del recorrido, ×1,3 (83 px en escritorio, 62 en el teléfono); el parlante se corre con él | `recorrido/InfinitoDelRecorrido.tsx`, `sonido/ControlDelSonido.tsx` |
| Sonido `12b583b3` | **Al producto**: el parlante siempre, apagado por defecto (la bandera `sonido=si` se borró). Volúmenes finales; sin túnel ni amanecer ni los ambientes de día y de noche; el hover de los CTA suena el tic de la barra. Candidatos para elegir en `/v3?sonidos=1` (lo elegido se guarda y suena en el sitio; de fábrica, el `a`): el clic de la barra (4), el de los CTA (4) y UN ambiente (3 bucles de 24 s, cada uno en su archivo, diferido) | `_lib/sonido/`, `_chrome/sonido/`, `scripts-retoque/sonidos.ts`, `docs/rediseno/SONIDO.md` |

Ajustados por el sprint (con su porqué en el fuente): `s8-cierre`, `s8-chrome`, `s25-contacto`, `s26-menu`, `s27-viajes`,
`s18-deslizamiento`, `s10-acceso` (+3 paradas: el formulario y Login; el landmark del formulario), `s39-navbar`, `s38`,
`s36`, `s40`, `s34` (la vuelta de la levantada).

