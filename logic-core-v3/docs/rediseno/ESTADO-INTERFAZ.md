# Estado de la interfaz — después de INTERFAZ 1 y INTERFAZ 2

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

- **El rollover del menú y de los links del pie → el sprint del navbar de v3** (decidido en el cierre; también en
  `PROXIMA-ETAPA.md`). `chrome/Navegacion.tsx` y `chrome/PiePiezas.tsx` son compartidos: una prop opcional
  `rotulo?: (texto) => ReactNode` en cada uno y el home pasa `DosCopias` (detalle en `interfaz1/t2-rollover-cursor/mirar.txt`).
- **El corrimiento de la carga (0,067) → la pasada técnica** (decidido; en `PROXIMA-ETAPA.md`): el cambio de la fuente
  de respaldo a la Chivo, en `layout.tsx` (compartido, no se tocó). Medirlo con un build de producción; si sigue,
  `display: 'optional'` o un respaldo con métricas ajustadas.
- Compartidos: el `:hover` pegado en táctil (`cta.css`, `pie.css`, `navegacion.css`), los abridores del contacto sin
  `aria-haspopup` (`Cta`), el input del newsletter que acepta texto con el envío deshabilitado (`Novedades`).
- Diseño: una pausa para el video de Servicios y para el carrusel del teléfono (WCAG 2.2.2); flechas en el carrusel.
- El CTA que rota de Servicios se desmonta fuera de su tramo (con Tab no se llega en escritorio).
- Los títulos de volumen (ESCENA 10 T3) siguen pendientes para la etapa de 3D: no entraron al canal del texto.

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
