# SPRINT B4 · NOCTURNO 2026-10-22 · La sección Servicios del home

Tarea: `docs/cola/2026-10-22/50-B4-servicios-y-viaje.md` (sólo B4; B12b, el viaje, va en otra entrega). Worktree `C:\nocturno\2026-10-22\b4`, rama `nocturno/2026-10-22-b4`.

## Plan

1. **La máquina de gatillos, común** (`src/app/v3/_componentes/gatillos/`). La del Portfolio, sacada a una pieza compartida en lugar de una nueva:
   - `rueda.ts`: el gesto de la rueda (salió de `trabajos/portfolio/rueda.ts`, que lo re-exporta: el Portfolio sigue igual).
   - `salto.ts`: el salto con Lenis o sin Lenis (salió de `trabajos/portfolio/saltar.ts`, que lo re-exporta; s76 lee su texto donde vive ahora).
   - `maquina.ts`: la regla pura (el paso con histéresis, el destino de un gesto, la entrada que atrapa, y la decisión de la rueda y de las teclas entera). El destino y la entrada del Portfolio (`destinoDeLaRueda`, `tiraDeLaEntrada`) pasan a usarla, con los mismos resultados (s81 §1 lo afirma en toda la grilla).
   - `vuelo.ts`: el vuelo con dueño y con fin de A8, sin el Portfolio adentro (el del Portfolio sigue en su `medida.ts`: s76 lee su texto).
   - `useGatillos.ts`: el gancho. La rueda (en la captura, antes de Lenis), las teclas (una por apretada; Inicio y Fin quedan para la página) y, con `tactil`, el dedo. Un gesto es un paso; mientras vuela el salto o corre la transición, todo se traga (la ráfaga que sobra se descarta); la entrada atrapa (F2).
2. **La sección** (`_secciones/servicios/`): `Servicios.tsx` monta la nueva; la de antes queda en la carpeta sin montar (varios invariantes la leen por ruta).
   - `escenario/`: la pista anclada, el escenario pegado, la entrada («Nuestros servicios» con P2 y la ventana de la demo, el efecto de los módulos del Panel), los tres paneles con su distribución, el texto en la franja diagonal (`shape-outside`) y la coreografía (un valor, `posicion`, y todo colgando de él: `tiempos.ts`).
   - `movil/`: `?servicios-movil=deslizar` (el defecto: cada servicio una pantalla, con el gatillo del contrato) y los nanobots quietos de cada pantalla.
   - `recomendador/`: las preguntas (con la llave del contenido inventado) y el resultado (el CTA del servicio o el contacto con `data-precarga`).
3. **Los nanobots** (`_lib/nanobots/`): el motor de C4 reusado (el lazo de `montaje.ts`, el desarme bajo el mouse, el traspaso con su física), con formas de B4 (`enjambreDeServicios.ts`): la nube gris, el globo de meridianos, los engranajes encastrados y una red neuronal nueva (`redNeuronal.ts`). Un lienzo que cubre el escenario: el enjambre viaja de lugar a lugar.
4. **El truco de profundidad** (`_lib/nanobots/capa.ts`): el cuadro del cambio de capa calculado desde la geometría y la física (la caja segura del enjambre en cada avance); el panel de web arranca a tiempo para no alcanzarlo. Diagnóstico con banco: `window.__capaDeLosNanobots`.
5. **La REGLA DE ALTURAS** (`tramoDeServicios.ts`).
6. **Pruebas**: s81 (nueva) y s6-servicios (reemplazada por la spec). Bancos nuevos, sin correr: `scripts-carga/servicios-gatillos.ts` y `scripts-carga/servicios-capa.ts`, cada uno con su control.

## Log

- **473d1016 (1/3)** la máquina común y el Portfolio usándola. s76 701 de 0; s74, s75 y s78 sin fallas nuevas; s81 §1 afirma que el destino y la entrada del Portfolio dan lo mismo que antes en toda la grilla.
- **cd787804 (2/3)** el motor de B4, la red neuronal y la cuenta de la capa.
- **(3/3)** la sección, el recomendador, el teléfono, las pruebas y los bancos.
  - s81 (nueva): 41 afirmaciones, 13 controles, 0 fallas. Con un reloj de mentira corre la decisión REAL de la rueda en nueve casos (muesca, trackpad con inercia, ráfaga, dos muescas en la transición, subida, salida al recomendador, entrada con una ráfaga larga, vuelta desde el recomendador): un gesto es un paso y nunca dos; sus controles (la rueda de a píxeles, la máquina sin candado y la entrada sin trampa) dan rojo. El truco de profundidad con la cuenta del sombreador replicada en la CPU (3000 nanobots, tres horas): 0 sobre el título y 0 sobre el panel en el cuadro del cambio y el siguiente, a 1440×900 (avance 0,515) y a 1024×768 (con las medidas ESTIMADAS del layout; la medición de verdad es del banco).
  - s6-servicios: reemplazada por la spec (afirmaba el rodillo, la tira y la torta). 24 afirmaciones, 0 fallas: las dos ramas, el mismo texto y los mismos encabezados en las dos, ningún número leído como hecho, ningún precio «desde», cero valores fuera de los tokens, el acento por contexto, el recorrido del teclado.
  - Reemplazadas por la spec, con su control: s6-render (tres `data-servicio` con coreografía, uno por panel, en lugar de nueve), s10-acceso (paradas: los tres CTA, las nueve opciones y el botón del recomendador; un encabezado más; nueve marcadores más: doce del recomendador menos los tres del caso de referencia). s10 queda con las cinco fallas de la base. s21 en verde: las doce casillas del recomendador en `INVENTOS` (`serviciosPregunta*`). s7-pedido: el pedido de servicios pasó del caso de referencia a las preguntas del recomendador, y `CONTENIDO-PENDIENTE.md` se regeneró.
  - Sin `.next` en este worktree, s3-peso, s4-heredado, s5-peso, s7-compuerta, s8-tres y s8-peso no llegan a cerrar (piden el build); en la base fallaban igual.

## Qué mirar

Ver el reporte de la entrega (la lista de qué verificar en el navegador, con URL, ancho y acción). Lo principal:

1. `/v3#servicios` a 1440×900: la entrada, una muesca por servicio (web desde la izquierda, software desde la derecha, IA desde arriba), el truco de profundidad (los nanobots salen de atrás del título y el panel cierra por debajo), los renglones levantándose después, y la vuelta al subir.
2. `?diagonal=30`, `?diagonal=20` y `?diagonal=12`: elegir el ángulo.
3. A 390×844, `?servicios-movil=deslizar` contra `?servicios-movil=gatillo`.
4. Los bancos: `scripts-carga/servicios-gatillos.ts` y `scripts-carga/servicios-capa.ts`, con sus controles.

## La REGLA DE ALTURAS

- Desde 1024: el `<section>` lleva el piso de la tabla (800svh) y la sección nueva lo llena exacto (la pista se estira hasta lo que deja el recomendador). Alto viejo = alto nuevo = 8 pantallas (7200 px a 1440×900; 6144 a 1024×768). k = 1, sin tramo.
- Abajo de 1024 la sección mide su contenido. El alto nuevo, por la estructura: con `deslizar` (el defecto), la entrada (una pantalla) más una pantalla por servicio más el recomendador; con `gatillo`, la pista (cinco pantallas) más el recomendador. El alto viejo se fue con la sección de antes y no se puede leer acá: `ALTO_VIEJO_EN_PANTALLAS` (en `tramoDeServicios.ts`) queda en `null` (MEDIR) y, mientras tanto, no se anota tramo. Se mide en la integración de antes de B4: `document.querySelector('[data-panel="servicios"]').getBoundingClientRect().height / innerHeight` a 768×1024 y a 390×844; con esos dos números la sección se anota sola (k = alto nuevo / alto viejo, medido en cada `resize`).
