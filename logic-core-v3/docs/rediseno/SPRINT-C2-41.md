# SPRINT C2 · 41 — Demos (cola 2, 2026-10-23)

La tarea 41 en dos subagentes: **41e** (escritorio, desde 1024: puntos 1 a 6) y **41t** (teléfono y tablet). Esto es lo de 41e.

## Plan (41e)

1. **La primera pantalla, limpia.** La franja clara de abajo (`lote1/13`) está DETRÁS de las placas (la tapan): no es Servicios ni el DOM
   de la sección (la capa de Demos va con `z-index` negativo en el escenario pegado, y detrás sólo queda el lienzo). Es la escena: al
   salir el panel del Portfolio la cámara volvía a la pose del scroll, y abajo del cuadro asomaba el piso claro. En el Portfolio
   (`lote1/12`, la pose del Portfolio) no está. Arreglo: con Demos a la vista la cámara se QUEDA en la pose del Portfolio (el logo en su
   hueco, de frente); el oscurecido (que es del panel) se va. «Que deje scrollear recién cuando aparece todo» ya lo hace la parada de B5
   (la rueda y las teclas se tragan mientras la llegada corre): no se toca, la verifica `demos-parada`.
2. **El tamaño y las alturas espejo.** La columna de Demos pasa a ser la del Portfolio dada vuelta (mismo ancho de contenido, centrada,
   contenedor del título), con el título de la medida del de Portfolio y la bajada con su letra y su medida; arranca a la altura del
   título del Portfolio, que se mide en el escenario sin transformadas (`demos/espejo.ts`). Placas: entre las de antes del agrandamiento
   (160 px) y las de B5 (242 a 1440, 167 a 1024).
3. **El abanico fijo debajo del título**: acompañante del título 3D «Demos», como su bajada (la escena lo lleva a su plano).
4. **El hover**: el área que detecta es el hueco (el ancla, quieto); lo que se transforma (cara, placa, cantos) va sin puntero.
5. **La carga**: preconexión a las cinco demos con Demos a la vista, el documento con la intención (ya estaba) y el iframe desde el
   clic (durante el Genie). La portada de la ventana (y del Genie) de las demos con pantalla de carga = el primer cuadro de esa pantalla,
   capturado contra su URL (`scripts-carga/demos-portadas-de-carga.ts`). Nexo queda como está.
6. **La bajada** de `05-TEXTOS.md`, tal cual, una sola para los dos anchos.

## Log

- **Lectura.** La parada (B5) ya traga la rueda mientras la llegada corre; la llegada de Demos (1,8 s mínimo) cubre el título 3D
  (1,4 s). El título 3D de Demos se coloca con la cámara de ahora (`colocacion: 'pantalla'`), así que quedarse en la pose del Portfolio
  no lo corre. `mostrado` se satura en 1 pasada la cola: la vista de Demos se cierra además con un `IntersectionObserver` (la sección en
  la mitad de arriba del cuadro), si no la cámara quedaba en la pose del Portfolio el resto de la página.
- **Escena** (`portfolioEnLaEscena.ts`, `poseDelPortfolio.ts`, `OscurecidoDelPortfolio.tsx`, `llegadaDeLaEscena.ts`): `demos` y
  `pesoDelOscurecido`; el peso de la pose persigue `adentro || demos` (`objetivoDeLaPose`), el del oscurecido sólo `adentro`. La capa lo
  avisa (`demos/enLaEscena.ts`: `anunciarDemos`, `useSeccionDeDemosEnElCuadro`), sólo con el escenario pegado de escritorio.
- **Espejo** (`demos/espejo.ts`, `CapaDeDemos`, `TextoDeDemos`): columna con `escritorio:` (centrada, `pl-4`: 656 px a 1440 y 448 a
  1024, la del Portfolio; contenedor del título; tope `--demos-tope-del-titulo` que mide el espejo con un `ResizeObserver`, 22svh hasta
  medir), el título con la parte de escritorio de `CLASE_DEL_TITULAR` (importada), la bajada con `titulo-s`, la medida del Portfolio
  (50ch, en la bajada y no en el bloque: el título grande no entraba en la ventana que recorta) y `gap-6` (la `mt-6` del Portfolio).
  La primera versión iba con una media query en `demos.css`: s3-tokens no la deja (los breakpoints van por las variantes).
- **Placas** (`demos.css`): `--libro-ancho: max(164 px, 30 %)` → 197 px a 1440, 164 a 1024; el abanico llena la columna. El aire de
  arriba del estante baja a alza + 12 px (el cartel del puntero va pegado al cursor).
- **Hover** (`demos.css`, `Biblioteca`): `pointer-events: none` en la cara. Con la placa recibiendo el puntero, su perspectiva asomaba
  ~6 px debajo del hueco en el borde cercano: con el mouse ahí, la placa se levantaba (24 px), dejaba de estar bajo el puntero, bajaba
  y volvía a tocarlo.
- **Carga**: `precarga.ts` (`preconectarLasDemos`, una vez), `VentanaDeDemo` (iframe desde el clic), portadas nuevas en
  `public/demos/{ethereal,noir,skyline,niche}-ventana.webp` (1152 × 654, webp 72). Noir arranca en negro y dibuja «NOIR»: su portada va
  2 s después de su primer cuadro útil (elegido a ojo con las hojas de cuadros).
- **Defectos para el banco** (`demos/defectos.ts`, `window.__defectosDeDemos`): `franja`, `area-movil`, `sin-espejo`, `sin-precarga`.

### El número de antes (contra la URL de cada demo, perfil nuevo, 1152 × 654, tres vueltas, mediana; ms desde la navegación)

| demo | primer cuadro útil | FCP | `load` (cuando el iframe se mostraba) |
|---|---|---|---|
| Ethereal | 1557 | 1308 | 1074 |
| Noir | 1673 | 1652 | 1527 |
| Skyline | 1862 | 1852 | 1706 |
| Nexo (bold) | 1818 | 1820 | 1820 |
| Niche | 2327 | 1400 | 2725 |

En el sitio, antes: el iframe se montaba con la ventana abierta (560 ms del Genie después del clic) y se mostraba en su `load`: la
portada congelada (la demo ya cargada) se veía ~1,6 a 3,3 s y después arrancaba la pantalla de carga de la demo (2 a 3 s más). Ahora el
iframe arranca con el clic, las cinco ya están preconectadas, y lo que se ve mientras carga ES la pantalla de carga.

### Pruebas sin navegador

s84 (63 afirmaciones, 0 fallas; §5 y §7 al día, §9 a §13 nuevas, con sus controles). Reemplazadas por la spec, con su control:
s76-portfolio-escena (el oscurecido lee `pesoDelOscurecido`), s42 y s50 (el titular de Demos con la medida de escritorio del de
Portfolio), s45 (la bajada en el plano con su medida), s3-registro (`--libro-ancho`, `--demos-tope-del-titulo`), s5-archivos (tres
archivos nuevos). Sin fallas nuevas en s3-tokens, s5-codigo, s5-trabajos, s10-acceso, s37, s38, s39, s40, s41, s47, s49, s52, s63, s64,
s76, s77, s78, s79, s87, s18-deslizamiento. De antes (no tocadas): s50 «el foco de un campo» (`foco.css`), s5-compacto
(`quienes-somos`), s3-peso (pide un build).

## Qué mirar (el orquestador)

Bancos (`scripts-carga/demos-escritorio.ts`, contra el dev, `ANCHOS=1440,1024`):
- `MODO=primera` (y `CONTROL=franja` en rojo): la foto de la primera pantalla y la luz de la banda de abajo.
- `MODO=espejo` (y `CONTROL=sin-espejo` en rojo): |Δy| ≤ 2 px entre títulos y entre bajadas; el abanico entero en el cuadro.
- `MODO=hover` (y `CONTROL=area-movil` en rojo): 0 cambios del hover en 3 s con el mouse quieto, en cada placa.
- `MODO=carga` (y `CONTROL=sin-precarga` en rojo): el iframe desde el clic, la portada de la ventana y los tiempos.
- `demos-parada.ts` y `matriz.ts` (MODO=a9 incluido) siguen en verde.

A ojo, `http://localhost:3000/v3#trabajos`, 1440 × 900 y 1024 × 768, desde «la tuya» una muesca: Demos llega (la cámara de siempre)
sin franja clara abajo; «Demos» y su bajada a la altura de «Portfolio» y la suya, centrados en la
columna derecha; el abanico debajo, más chico, y al mover el mouse se queda debajo del título (no flota delante). El mouse quieto en el
borde de abajo de una placa: no vibra. Abrir una demo: la ventana muestra su pantalla de carga (Ethereal, Noir, Skyline, Niche) y la
demo sigue desde ahí; Nexo, su portada.

## Alturas

No cambia ningún alto: la capa de Demos vive en el escenario pegado (absoluta), la columna y el abanico se acomodan adentro de la
pantalla, y la pista de la parada no se toca. Sin `anotarTramo`; la k de cada ancho queda como estaba.

## Verificación 1 (orquestador: franja ✗, portada de la anterior ✗) — lo que cambió

- **La franja** no era la cámara: era la rampa del revelado de la salida (`_lib/escena/revelado.ts`), un octavo de pantalla de papel
  (112 px a 900) arriba de la costura Trabajos → Servicios apenas ésta tocaba el cuadro; la parada de Demos la deja justo en el pie (la
  foto: rampa lineal de ~105 px que termina en blanco). Ahora la rampa de la salida mide lo que la costura ya subió desde el pie (0 con
  Demos quieta, la de siempre desde un octavo arriba). `CONTROL=franja` pide la de antes (`window.__defectosDelRevelado`). La cámara
  en la pose del Portfolio y el peso del oscurecido se revirtieron (archivos de la escena como en la base: el motivo era falso).
- **La portada de la anterior** no era la ventana: el clic abría la demo de antes. Las anclas se pisan (cada una tapa la franja de la
  siguiente salvo un paso), y la levantada por el hover (más arriba que las otras) recibía el clic en casi toda la franja de la de al
  lado; el banco viene con el puntero desde la de antes. Ahora el puntero lo recibe el ÁREA de cada pieza (su franja a la vista, un
  paso en `cqw` del estante; la última, entera): las áreas no se pisan. `CONTROL=area-solapada` vuelve al ancla entera. El banco anota
  qué demo abrió el clic y lee la portada de ESA ventana; también el arreglo de `__name` del orquestador (línea del `addInitScript`).
