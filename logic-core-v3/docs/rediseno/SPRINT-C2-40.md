# SPRINT C2 · 40 — el Portfolio (cola 2, 2026-10-23)

## Plan
Ajustes finos del Portfolio sin tocar su máquina de estados (`usePortfolio`, `useOrdenDeLaEscena`): la transición de la ficha, «Visitar sitio» en
el color de cada marca, el WhatsApp con efecto de botón, el form con `EstadoDeEnvio` y más grande, la bajada nueva; en el teléfono, las tarjetas
del mismo alto, las barras como Instagram y el título legible sobre el logo. Recortado por el presupuesto de la corrida (aviso del orquestador).

## Log
- **Ficha (ítem 5).** `transicion.ts` suma `muestraElPoster` (pura): el póster chico de la tira que se va entra YA en la salida (la tira todavía
  ancha) y recién después se comprime; el de la que se abre se apaga mientras se abre. `PosterDelLomo` es un `motion.div` con ese fundido
  (`TRANSICION.salidaS` al entrar, `aperturaS` al irse). La marca de agua (el nombre del negocio) entra con la secuencia de su tira hasta su 8 %
  (`enLaSecuencia(…, opacidad)`), no de la nada.
- **«Visitar sitio» (ítem 6).** Tres tokens en el tema (`--color-marca-*`, con su motivo en `padron-de-tokens` y su línea en `tokens.invariant`),
  el dato en `PROYECTOS[].colorDeMarca` y `estiloDeLaMarca` (Tira.tsx) que redefine la tinta de la caja del CTA (el CTA sigue siendo «tinta»).
  El Garage #FA9408 (su botón), Esquina #FFFFFF, Banú #BB9473 (su marrón #654324 aclarado en OKLCH hasta AA). Contraste: 8,55 / 19,8 / 6,98
  sobre #0E0E0E y 6,27 / 14,5 / 5,12 sobre #2B2B2B (lo más claro medido detrás del enlace en la captura `lote1/05`). Panel y tarjeta.
- **WhatsApp (ítem 7).** «O escribinos por WhatsApp» es `CtaEnlace` (el rollover de dos copias y el subrayado del sitio).
- **Form (ítems 9 y 10).** Un solo título «¿El próximo sos vos?» (la cabecera de la tira, `titulo-xl`, el tamaño del de antes), la bajada nueva con
  la letra de la bajada del Portfolio, los campos con `claseDelTexto` (prop nueva de `Campos.tsx`, por defecto `text-caption`: el modal igual) en
  `titulo-s` / `cuerpo` abajo de 1024, y el envío con `EstadoDeEnvio` (carga, encastre, «¡Recibido!» / «Algo falló», vuelve a los 3 s: vacío
  tras el éxito). El autocompletado: el global de `piezas.css` (inputs comunes de /v3).
- **Bajada (ítem 10).** El texto de `05-TEXTOS.md` en lugar del slogan.
- **Teléfono.** Tarjetas `h-full content-start` (llenan la celda del carrusel, que mide la más alta); `CarruselDeTarjetas` con `vistasLlenas`
  (opcional, sólo el Portfolio: Demos igual); el título y la bajada del flujo toman el halo y el velo de Trabajos (`banda.css` §4: el recurso de
  esta sección para el texto sobre el logo de noche, que había quedado atado al cartel archivado). La mezcla `difference` no llega (el flujo es su
  propio contexto de apilamiento y sobre el gris del logo da gris sobre gris: banda.css §4 y la lección D2).
- **Tests actualizados a la spec nueva:** s76 (b, b12c con dos controles positivos nuevos, escena, carrusel), trabajos.invariant (las regiones vivas
  y las dos capas de `EstadoDeEnvio`), portfolio-invariante (la O mayúscula), tokens.invariant y padron-de-tokens (los tres tokens).

## Qué NO se hizo (presupuesto)
- Teléfono: el título y el carrusel en UNA pantalla (hoy cada uno en la suya), el título que se levanta, y la REGLA DE ALTURAS del flujo (bajar
  `PANTALLAS_MINIMAS_DEL_FLUJO` y dejar `PANTALLAS_EXTRA_CON_EL_CARRUSEL` negativo para que la sección no quede con pantalla vacía al final).
- El banco de navegador en `scripts-carga/` (la secuencia de la ficha, el AA de los tres, alturas y barras a 390/768, el envío con `page.route`).
- Las entradas `bajada` y `laTuya.bajada` del `PEDIDO` siguen (el texto ya es el de Valentino; sacarlas mueve trabajos.invariant §PEDIDO).

## Qué mirar
- 1440 `/v3#portfolio-el-garage`: cambiar de proyecto (hover a un lomo, rueda): el contenido se desvanece hacia el póster gris y recién ahí la tira
  se comprime; la marca de agua del que entra aparece con fundido. «Visitar sitio» naranja / blanco / marrón claro.
- 1440 y 1024×768 «la tuya»: un título, la bajada, campos grandes, «O escribinos por WhatsApp» con el rollover; enviar (con `/api/` interceptado):
  carga → encastre → mensaje → vuelve el form. A 1024×768 mirar que el bloque entre en el panel (los campos crecieron).
- 390 y 768: las tres tarjetas del mismo alto; tras pasar una, su barra queda llena; «Portfolio» y su bajada con halo sobre el logo.
