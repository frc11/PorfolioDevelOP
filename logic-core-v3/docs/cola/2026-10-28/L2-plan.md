# L2 · plan — Portfolio, Demos y el scroll simple en el teléfono

Base: `5c4fd2de` (L1 cerrado; ESTADO.md coincide con `git log`). Rama `cola3/2026-10-28`, dev en :3002. Desde el aviso de Valentino, cada paso pesado toma el candado `C:\nocturno\.turno-cola3` (otra sesión, L5, corre en `cola3b`).

## Lo que encontré en el código (antes de tocar)

- **El teléfono es otra rama** (`Trabajos.tsx`, `--modo-del-portfolio: carrusel` abajo de 1024): el flujo (`FlujoDelPortfolio`: pantalla «portfolio» + pantalla «la tuya») y después `despues-del-flujo`, una caja de `1 + 2931/900 = 4,26` pantallas con Demos **pegado** adentro (`DemosDelFlujo`, `sticky top-0 h-svh`). Esas 3,26 pantallas de Demos quieto son «tengo que scrollear bastante en demos».
- El flujo mide **como mínimo 3,31 pantallas** (`PANTALLAS_MINIMAS_DEL_FLUJO`, la regla de alturas de B1.2e) y sus dos pantallas se reparten ese alto con `grow` + `justify-center`: por eso el formulario queda lejos del carrusel (ítem 2) y el ancla `#portfolio-<slug>` cae con el carrusel corrido hacia abajo (la pantalla mide ~1,6 svh y el contenido va centrado).
- El panel (`Panel.tsx`) pone `min-height: 757svh` en línea (la tabla). La sección del teléfono no puede medir menos sin soltar ese piso.
- **El gatillo Servicios → Demos** es la salida de arriba de la máquina de gatillos (`_componentes/gatillos/useGatillos.ts`): desde el paso 0 (la entrada «Nuestros servicios»), un gesto hacia arriba vuela «antes» del tramo. Y desde arriba, el gesto que entra al tramo se atrapa en el paso 0 (F2). Abajo ya es libre (`salidaDeAbajoLibre`, C2-51).
- **El velo**: `banda.css` §4 (abajo de 1024) le pone el halo y el degradé radial a `encabezado-del-portfolio` y a `[data-capa='demos']`, pero en el teléfono Demos ya no es esa capa (`DemosDelFlujo`, `data-pantalla="demos"`): no le llega.
- **Demos de escritorio**: `--libro-ancho: max(164px, 30cqw)` (2:3). La columna arranca a la altura del título del Portfolio (`espejo.ts`), y título + bajada + abanico no entran en el alto.

## Ítems

### 1 · Portfolio en una pantalla (teléfono y tablet) — esfuerzo alto
- La pantalla «portfolio» pasa a ser **una pantalla exacta** como la de Demos: `h-svh` columna (con piso de contenido: `min-h-svh` si no entra), el título y la bajada arriba con el **mismo tratamiento que Demos** (alineados como Demos, el mismo tamaño de título que Demos), y el carrusel llenando lo que queda (`flex-1`, la vista con `grid-rows-1`), flechas y barras al pie.
- La tarjeta: **sin la reseña** abajo de 1024 (queda en el marcado con `hidden`, como las filas ocultas de la ficha). El medio (video) es lo que cede: llena el alto que sobra, en 16:10, medido por contenedor (`cqw`/`cqh`), sin deformar. Aire más apretado (padding y gaps).
- Ancla: el ancla del proyecto queda en el tope de la pantalla (ya está); al cargar, el destino se calcula en el momento del salto y se re-asienta si el documento cambia de alto mientras nadie tocó la página (hasta un gesto, máx. 4 s).
- Hecho cuando: a 390×844, 375×667, 425×824 y 768×1024, con el scroll en el tope de la pantalla, título, bajada, tarjeta entera, flechas y barras dentro del cuadro (`bottom ≤ innerHeight`, `top ≥ 0`); y al cargar `/v3#portfolio-banu-scents` lo mismo.
- Verificación: banco `scripts-carga/l2-telefono.ts` MODO=pantalla y MODO=ancla (fotos a cada ancho). Control: `CONTROL=con-resena` (la reseña visible) tiene que FALLAR a 375×667.

### 2 · El formulario «¿El próximo sos vos?» — esfuerzo medio
- La pantalla «la tuya» deja de ocupar una pantalla centrada: va pegada debajo del carrusel con un respiro corto (el ancla `#portfolio-la-tuya` se corre arriba el despeje de la barra, así el salto la deja visible).
- Sin desborde a 320–425: `min-w-0` en los hijos de la grilla y del formulario; los placeholders son los del contacto (ya cortos, L1); el rótulo «WhatsApp o email» queda; la fila de «Enviar» / «O escribinos por WhatsApp»: en una fila si entra, si no apilada a la izquierda (`flex-wrap`, sin `justify-between` que los separe raro).
- Hecho cuando: a 320, 360, 375, 390 y 425 ningún descendiente del bloque pasa el borde derecho del bloque (0 px), y el hueco entre el pie de las barras del carrusel y el tope del bloque ≤ 96 px.
- Verificación: banco MODO=formulario.

### 3 · Demos de escritorio más chico, entero — esfuerzo medio
- `demos/espejo.ts` además mide el alto libre debajo del tope del abanico (en el escenario pegado, sin transformadas) y escribe `--demos-alto-libre`; `demos.css` acota la placa: `--libro-ancho: max(piso, min(30cqw, alto libre / 1,5 − alza))`. Si el alto libre no alcanza ni para el piso, el tope del título sube (sólo lo necesario: Valentino lo permitió «solo si es necesario»). El abanico queda centrado en el espacio libre debajo de la bajada.
- La pantalla de carga de cada demo no se toca.
- Hecho cuando: a 1440×900, 1366×768, 1280×720 y 1024×768, con Demos llegado, la caja del abanico (cada placa) dentro del cuadro (`bottom ≤ innerHeight − 8`, `right ≤ innerWidth`), y la placa no menos de 164 px de ancho.
- Verificación: banco MODO=demos-escritorio (fotos). Control: `CONTROL=sin-tope` (sin la variable) tiene que FALLAR a 1280×720.

### 4 · El velo de Demos en el teléfono — esfuerzo bajo
- `banda.css` §4: los mismos halo y degradé para `[data-pantalla='demos']` (el bloque y su párrafo).
- Hecho cuando: a 425 el párrafo de Demos tiene el `::before` con el degradé y el bloque el `text-shadow` (computed style), igual que el del Portfolio. Foto a 425 y 390.

### 5 · Scroll simple de Portfolio a Servicios (teléfono y tablet) — esfuerzo alto
- `despues-del-flujo` mide **una pantalla** (Demos, sin `sticky`): entra y sale con el scroll como cualquier sección. El flujo sin alto mínimo. El panel suelta su piso de la tabla abajo de 1024 cuando el carrusel está decidido (el mismo mecanismo que usaba el túnel: el Portfolio escribe el `min-height` del panel; al soltarlo, lo devuelve).
- **REGLA DE ALTURAS**: el tramo del carrusel pasa a cubrir TODO lo que la sección mide después del pin (el flujo y Demos): la escena lo ve medir lo que veía (el medio de ese ancho + la cola, 2.931): `k = (flujo + Demos − pantalla) / (veía + 2931)`. Afuera de la sección, la escena ve lo de hoy bit a bit (s76 lo afirma con el flujo que sea).
- Servicios en el teléfono: **salida de arriba libre** (opción nueva `salidaDeArribaLibre` de la máquina, simétrica a la de abajo): desde la entrada, un gesto hacia arriba es de la página (rueda, teclas, dedo) y la entrada aterriza en el tope de su tramo; desde arriba, el gesto que llega NO se atrapa (la página entra a «Nuestros servicios» scrolleando; lo que queda de ese gesto se traga y el gesto siguiente da el primer servicio, que es de L3). Desde 1024, como hoy.
- Hecho cuando: a 390×844 y 768×1024, bajando con la rueda y con el dedo desde el carrusel del Portfolio hasta «Nuestros servicios», y subiendo de vuelta: ningún vuelo de gatillo al cruzar Demos ↔ Servicios (`__gatillosDelBanco` sin `data-en-vuelo` en esos cruces), ningún tramo de más de 1 pantalla donde nada se mueve (Demos visible a lo sumo ~2 pantallas de scroll), y nada trabado (cada gesto mueve el scroll en el sentido pedido).
- Verificación: banco MODO=recorrido (rueda y dedo, bajando y subiendo). Deriva de la escena: s76 (puro) + medición en el sitio del pie de Trabajos en la regla de la escena antes/después.

## Implicaciones
- Tests que codifican la spec vieja y cambian (se dice en el resultado): s76-portfolio-carrusel (§47 alto mínimo del flujo, §48 la cola de 4,26 pantallas, k), s84-demos-telefono (Demos pegado 4,26 pantallas), quizá s76 ficha compacta (reseña), trabajos.invariant (clase del alto), s84-demos (`--libro-ancho`), s3-registro-de-tokens (`--libro-ancho`), bancos `demos-telefono.ts` (caso `entrada`: pegado → scroll).
- Tests nuevos con control: la máquina con la salida de arriba libre (puro, en s78-c2-51 o uno nuevo s88-l2), el tramo nuevo del carrusel (s76), la tarjeta sin reseña, el velo de Demos (CSS), el acote del abanico (CSS + espejo).
- `useAnclaDeLaCarga`, `usePortfolio` (el piso del panel), `tramoDelSelector`, `medioDelCarrusel`.
- No se toca `secciones.ts` ni lo que va después (Servicios por dentro es L3).
- Opcional: nada. Fuera de scope: Servicios por dentro (L3), el formulario de contacto general (L1).

## La compuerta
1. `npx eslint <tocados>` limpio. 2. `tsc --noEmit` (con candado) sin errores nuevos. 3. Las suites tocadas + `verificar` contra la base (`verificar-base`), lista de fallas igual o menor, conteo de afirmaciones que no baja. 4. Cada test nuevo con su control (romper el código a propósito: tiene que fallar). 5. Banco `l2-telefono.ts` en dev :3002 con los criterios de arriba y sus controles; fotos en `C:\nocturno\cola3-fotos\L2\`. 6. Humo: matriz del Portfolio a 1440 (`scripts-carga/matriz.ts`, SOLO de rueda/ráfaga y desde Demos) y a 390 el recorrido.

## Premortem — «la semana que viene L2 falló: ¿por qué?»
- **La escena se corrió**: acortar la sección movió todo lo de después. → El tramo nuevo cubre todo lo que sigue al pin; s76 lo afirma con varios flujos y anchos; lo mido en el sitio (el progreso de la escena al tope de Servicios, antes/después).
- **Antes de hidratar la sección colapsa** (el piso del panel soltado por CSS) y el ancla o la primera pintura saltan. → El piso se suelta en JS sólo cuando el carrusel está decidido (no en CSS del servidor).
- **El dedo con inercia se pasa de la entrada de Servicios** al no atraparla. → Si la inercia mete el scroll más allá del paso 0, se asienta en el paso 0 (lo que ya hace la máquina al entrar con un gesto reciente); lo verifico con el dedo de CDP.
- **La tarjeta no entra a 375×667** ni sin reseña. → El medio cede (cqh) y el título se acota por alto; si aun así no entra, achicar el título en alturas chicas y decirlo.
- **El abanico de escritorio queda miniatura en 1280×720.** → Piso de 164 px; si no entra con el piso, sube el título (permitido) y lo digo.
- **Rompí un test viejo sin decirlo.** → Cada test cambiado va listado con el porqué en el resultado.
- **La otra sesión (L5) y yo pisamos memoria.** → Candado en cada paso pesado; un pesado a la vez.

## Log de la compuerta
- Rojo 1 (`verificar`): s52-nocturno-final, s52-pulido-1 y s53-pulido-2 leen las listas de selectores del velo en `banda.css` como texto y mi selector de Demos quedaba al final. Arreglo: el selector nuevo va al principio de cada lista (mismo CSS). Re-corrida: las tres verdes.
- Rojo 1 (banco `pantalla`): el video en 0 px (el hijo del `Gatillo` no era flex) y luego 16 px a 375×667. Arreglo: `claseDelContenido` y la ficha más junta en alturas < 740. Re-corrida: 4 de 4.
- Rojo 1 (banco `formulario`): desborde a 320–375 por la columna de `EstadoDeEnvio`. Arreglo: `grid-cols-1`. Re-corrida: 5 de 5.
