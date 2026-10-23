# SPRINT C2 · 41t — Demos en el teléfono y la tablet (cola 2, 2026-10-23)

La parte de abajo de 1024 de la tarea 41 (`docs/cola/2026-10-23/41-demos.md`, «Teléfono y tablet»; capturas `lote3/08` y `09`). El
escritorio lo hace 41e en paralelo.

## Plan
1. **Demos ya no aparece desde atrás.** Hoy abajo de 1024 Demos vive en la capa pegada del escenario (`CapaDeDemos`, detrás del flujo):
   abajo de 768 la capa entera crece desde escala 0 con el vacío (sale chiquita de atrás del logo), y en tablet llega con el gesto de los
   libros. Con el carrusel, Demos va EN EL FLUJO: en lo que sigue al flujo del Portfolio (`despues-del-flujo`) va una pantalla pegada
   (`DemosDelFlujo`, `sticky top-0 h-svh`) que entra deslizándose con el scroll, pegada al pie de «la tuya», como cualquier sección, se
   queda la cola y se va con la sección. La capa del escenario no se monta con el carrusel.
2. **El título se levanta desde abajo**, el mismo efecto que «Portfolio» en el flujo (C2-40): el disparo por línea (`useDisparoPorLinea`),
   la presencia por tiempo (`PRESENCIA_DEL_ENCABEZADO`) y el titular que sube de acostado a parado. La pieza sale de
   `EncabezadoDelPortfolio` a `portfolio/levantarse.tsx` y la usan los dos (no se copia). En el teléfono no se desactiva; con movimiento
   reducido está puesta.
3. **El muestrario, mejor:** el `CarruselDeTarjetas` común gana un modo `asoma` (opcional; el Portfolio no lo usa y queda igual): una
   tarjeta grande (la portada vertical de la demo, la versión de teléfono del sitio), la siguiente asomada a la derecha (más chica y
   apagada), el dedo que las arrastra (la tarjeta sigue al dedo y se asienta con el resorte de la UI), un toque a la que asoma la trae, y
   las barras como las historias (`vistasLlenas`). La tarjeta llena el alto que queda en la pantalla de Demos (la vista es `flex-1`) sin
   pasarse del 84 % del ancho. Las flechas quedan (alternativa de un toque al arrastre, WCAG 2.5.7).
4. **REGLA DE ALTURAS: sin cambio.** Demos entra en la caja que ya seguía al flujo (`PANTALLAS_DESPUES_DEL_FLUJO`, 425,67svh) y su pantalla
   pegada no le suma alto. Se probó acortar la cola (Demos pegado una pantalla y la cola anotada con `anotarTramo`), pero el piso del panel
   de Trabajos es un `min-height` en línea de `Panel.tsx` (757svh, de la tabla, sin `altoAngosto`): la sección no puede medir menos sin
   tocar `secciones.ts` o `Panel`. Se dejó como estaba.

## Log
- `_componentes/carrusel/`: `asoma.ts` (puro: el lugar relativo de cada tarjeta dando la vuelta sin cruzar el cuadro, el asiento en el
  equivalente más cercano, el arrastre, el ancho de la tarjeta, la pose de la vecina), `useAsoma.ts` (la posición en un valor de Motion, el
  ancho medido con un `ResizeObserver` de la vista, el asiento con el resorte 380/38/0,9, el dedo) y `Ranuras.tsx` (la `Ranura` de siempre,
  `LineaDeAhora` y `TRANSICION_DEL_CARRUSEL`, que salieron de `CarruselDeTarjetas.tsx` para no pasar las 300 líneas, y la `RanuraQueAsoma`).
  `CarruselDeTarjetas`: props `asoma` y `claseDeLaVista`; con `asoma`, el dedo arrastra aunque la tarjeta sea un enlace, el mouse se captura
  recién al arrastrar (un clic abre la demo), un toque a la derecha de la tarjeta trae la siguiente, y al soltar sin cambio se asienta.
- `CarruselDeDemos`: la tarjeta es la superficie de las del Portfolio con la portada vertical (recortada a la izquierda: la captura trae la
  barra de scroll en el borde derecho), el nombre, el rubro y ↗; la vista a sangre hasta los bordes del cuadro (la que asoma llega al borde).
- `DemosDelFlujo` (nuevo) y `Trabajos.tsx`: con el carrusel, Demos en `despues-del-flujo` en las dos ramas; la capa del escenario y
  `DemosQuietos` no se montan con el carrusel. `TextoDeDemos`: prop `levantarse` (el titular envuelto en `TitularQueSeLevanta`).
- `EncabezadoDelPortfolio`: la presencia y el estilo del titular salen de `levantarse.tsx` (mismo comportamiento).
- Tests: s84-demos-telefono nueva (34 afirmaciones, 16 controles). Actualizadas por el cambio de estructura, con control: s76-carrusel (la
  vista suma `claseDeLaVista`), s76-portfolio-escena B1.2b 16 (la presencia por tiempo vive en `levantarse.tsx`; control nuevo) y s48 (el
  título de Portfolio con `usePresencia`). s5-archivos: `DemosDelFlujo.tsx` y `levantarse.tsx` en el padrón.
- Gate: eslint limpio, tsc 0; s84 (2 invariantes) 0 fallas, s76 (3) 0 fallas, trabajos.invariant 222/0, s37, s39, s40, s41, s42, s45, s47,
  s48, s49 sin fallas; s10 sin fallas. s50 1 falla de base (`foco.css`, no tocado); s5 y s7: fallas de base (quienes-somos, servicios) y
  `s5-peso`/`s7-compuerta` sin `.next`.

## Qué NO se hizo
- `CapaDeDemos` conserva su rama de abajo de 1024 (la escala rígida, los renglones del carrusel): con el carrusel ya no se monta, así que
  es código muerto abajo de 1024. No se borró para no pisar a 41e (escritorio, mismo archivo; s49, s50 y demos-invariante la fijan): limpiarla
  después de integrar los dos.
- Acortar el pin de Demos (dura la cola: ~3,26 pantallas pegado): pide bajar el piso del panel (`secciones.ts` / `Panel`), prohibido acá.

## Qué mirar
- 390×844 y 768×1024, `/v3`: bajando desde «la tuya», Demos sube pegado a su pie como una sección (no crece desde el logo), «Demos» se
  levanta desde abajo de su ventana y la bajada entra; la pantalla queda pegada y después se va con la sección.
- El muestrario: una tarjeta grande con la portada vertical y la siguiente asomada a la derecha (más chica y apagada); arrastrarla con el
  dedo la mueve con el dedo y al soltar pasa o vuelve; un toque a la que asoma la trae; las barras de las vistas quedan llenas; tocar la
  tarjeta abre la demo en otra pestaña.
- Banco: `BASE=http://localhost:3000 npx tsx scripts-carga/demos-telefono.ts` y sus controles (`desde-atras`, `sin-levantarse`,
  `sin-asomar`, `sin-dedo`, `barras-vacias`). `scripts-carga/carrusel.ts` (el del Portfolio) tiene que seguir en verde.
