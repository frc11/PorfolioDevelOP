# L7e · resultado (lane C, el laboratorio)

Rama `l7/lab` · worktree `C:\nocturno\cola3c` · dev :3004. Sin push (el lote no lo pide; la rama queda local para Valentino).

## Por paso
1. **`docs/ideas/VOZ-DEL-SITIO.md` — hecho.** El inventario del home con nombres del código y `archivo:línea`; los tiempos y curvas leídos
   de las constantes (y los altos de las secciones, medidos a 1440 × 900); las reglas que se infieren; lo que nunca hace; lo que falta y
   dónde se repite; y §11, lo que aprendí usando las piezas fuera del home.
2. **`docs/ideas/MOMENTOS.md` — hecho.** 2–4 momentos por página (tres de servicio, Nosotros, Portfolio, Blog, la nota, legales, 404 y
   dos transversales), con qué ve, por qué es de esa página, de qué mecánica sale, costo y riesgo; ranking al final.
3. **Prototipos — hecho, 12 + índice** en `/v3/laboratorio` (`src/app/v3/laboratorio/`):
   `no-encaja` (E1), `dos-tomas` (N1+N4), `fichas-abiertas` (P1), `lo-de-siempre-tachado` (S1), `conversacion-en-vivo` (I1),
   `historia-que-se-pinta` (N2), `como-trabajamos` (N3), `pantalla-que-se-dibuja` (W1), `carrusel-del-blog` (B1), `notas-irregulares`
   (B2), `nota` (L1+L2), `indice-legal` (G1). Cada uno importa las piezas del home (nunca las copia), tiene su leyenda en pantalla y un
   commit propio.
4. **`docs/ideas/COMO-MIRAR.md` — hecho.** En castellano, ~20 min, los que creo primero; el índice sigue ese orden.

## Verificación
- `tsc --noEmit` (con `NODE_OPTIONS=--max-old-space-size=4096`): **0 errores** en todo el repo, antes y después de los arreglos.
- `eslint src/app/v3/laboratorio`: **limpio**.
- En el navegador (dev :3004, Chrome por DevTools, `?preloader=no`): **las 13 rutas cargan a 1440 y a 390 sin errores de consola, sin
  desborde horizontal** (`scrollWidth` = ancho, y ningún elemento de `main` pasa el borde recorriendo la página entera) y con **un `h1`**,
  salvo `conversacion-en-vivo` (3: los traen las demos del Panel, ver P-L7e-2). El índice enlaza a las 12.
- A 390 se emuló el ancho (la ventana de Chrome no baja de 500) sin `isMobile`.
- Comprobado andando, no sólo en estático: el encastre en `no-encaja` (llega al contacto); la toma que se abre al cruzar y se cierra al
  volver en `dos-tomas` a 390 (`aria-pressed` false → true → false); las filas de la ficha y el video que corre en `fichas-abiertas`; la
  demo que corre sólo si es la más visible en `conversacion-en-vivo`; los trazos que avanzan con el scroll en `lo-de-siempre-tachado` a
  1440 y 390; el pintado (71/138 palabras a mitad de página) en `historia-que-se-pinta`; el tachado del final y el hilo en `nota`; el
  ítem activo al fondo en `indice-legal`; el recorte que se abre en `pantalla-que-se-dibuja`.
- Capturas: `C:\nocturno\cola3-fotos\L7\laboratorio\` (26: el índice y los 12, a 1440 y 390).
- **No verificado:** el sonido (apagado por defecto; no se prendió), el hover real con el mouse (la toma de 1440 se vio por el código, no
  pasando el mouse), el teléfono de verdad (táctil), 768 y 1024 (el lote pide 1440 y 390), y movimiento reducido.

## Arreglos que salieron de la verificación (commit `6afc9dd2`)
La leyenda de vidrio no se leía sobre una foto (ahora es papel opaco y arranca plegada en el teléfono); en `fichas-abiertas` el video
quedaba solo en una franja negra (ahora las dos columnas se clavan juntas); la demo de IA era muy baja en el teléfono (4:5, como en el
home); el subrayado de lo nuevo en `lo-de-siempre-tachado` lo cortaba la máscara; las dos últimas secciones legales nunca quedaban
activas (al fondo, la última); la línea del proceso iba atrasada (se mide sobre sí misma); los trazos del alambre salían cortados
(`non-scaling-stroke`, ver VOZ §11); el cruce perdía los saltos de scroll (ahora escucha siempre).

## Decisiones tomadas solo
- **L7e-1.** Escribí los archivos de estado de esta lane (`ESTADO-c.md`, `L7e-plan.md`, este resultado y `L7e-TERMINADO`) en
  `docs/cola/2026-10-30/`, fuera de las tres carpetas del límite, porque el lote y las reglas comunes los piden por nombre. Son archivos
  nuevos que nadie más escribe: no chocan en el merge.
- **L7e-2.** VOZ y MOMENTOS en castellano (los lee Franco y los chats que siguen), aunque el lote está en inglés.
- **L7e-3.** Los prototipos van sobre **papel, sin escena** (sin preset: la escena pinta un cuadro y duerme). La escena no se puede tocar
  desde el laboratorio y prototipar encima de ella sin poder cambiarla habría mostrado algo que no se puede construir así.
- **L7e-4.** En `fichas-abiertas` cada caso es una sección **invertida** (noche) sobre el día: es una decisión de diseño que se le
  pregunta a Valentino, no un descuido (el Portfolio es «de día» en ESTRUCTURA).
- **L7e-5.** Los textos de prototipo salen sólo de ESTRUCTURA-PAGINAS (la historia, el legal), de `05-TEXTOS` y del home. Las bajadas de
  las notas del blog, el texto de la nota y los pasos del proceso son míos, sin cifras ni hechos nuevos; están marcados como de
  prototipo en su archivo.
- **L7e-6.** La foto de la facultad (`C:\nocturno\l7-assets\facultad.png`, 500 × 298) se copió como `public/v3/laboratorio/facultad.webp`
  (ffmpeg, 31 KB). Es chica: a todo el ancho se ve blanda.
- **L7e-7.** A las dos tomas no les cambié nada: en el teléfono el prototipo aprieta el botón del marco (el mismo de un toque) para
  abrirlo con el scroll. Si gusta, el cambio limpio es una prop en el home (P-L7e-3).

## Supuestos y descartes
- Las rutas del laboratorio heredan la barra, el menú, el contacto y el preloader del layout: no se apagaron (se ven como en una página).
- No hice prototipos que necesitan la escena (I2, E2) ni el chrome (T1, T2): el límite no los permite; quedan en MOMENTOS.
- No usé `next/image` en dos `<img>` (la foto de la facultad y el póster adentro del alambre): son prototipos con archivos locales chicos.

## Propuestas fuera del límite (no hechas: son del home)
- **P-L7e-1 · Un CTA de ruta.** `CtaEnlace` con `ruta` (o un `CtaDeRuta`) que use `EnlaceDeRuta` por dentro: hoy un CTA a otra página
  de /v3 se arma a mano.
- **P-L7e-2 · Las demos del Panel sin `h1`.** Sus títulos internos como `h2`/`p` (o `role="presentation"`), para que una página con demos
  tenga un solo `h1`. Afecta también al home.
- **P-L7e-3 · `MarcoDeDosTomas` controlable.** Una prop `abierto` opcional (controlada) para abrirlo por scroll en el teléfono sin
  apretar su botón.
- **P-L7e-4 · `Trazo` con `tramo`.** Que el subrayado o el tachado puedan usar el progreso entero (hoy se reparten mitad y mitad).
- **P-L7e-5 · El pintado de bloque.** Subir `usePintadoDelBloque` (o su cálculo) a `_componentes/pintado/` si Nosotros o la nota lo usan.
- **P-L7e-6 · El velo con el nombre del destino** y **el pie que recuerda dónde estuviste** (MOMENTOS T1, T2).

## Qué tiene que mirar Valentino
1. `/v3/laboratorio?preloader=no` a 1440: el recorrido de `docs/ideas/COMO-MIRAR.md`, en orden (~20 min).
2. `/v3/laboratorio/dos-tomas` a 390: scrolleá despacio por las fotos; se abren solas y se cierran al volver.
3. `/v3/laboratorio/fichas-abiertas` a 1440: ¿la noche por caso?
4. `/v3/laboratorio/no-encaja`: tocá el logo; con el sonido prendido.
Sin banderas: ningún prototipo lee la URL (salvo el `?preloader=no` del sitio).
