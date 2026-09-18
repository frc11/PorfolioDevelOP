# DESARME — censo de invariantes de composición

Criterio único, aplicado archivo por archivo y, donde un archivo mezcla, sección
por sección (`titulo(...)` del propio archivo): **la afirmación se rompe si
muevo un elemento en pantalla sin romper ningún contrato.** Si se rompe → es de
composición → entra a esta lista. Si no (mide bytes, tipos, seguridad, lógica
de negocio, existencia de un módulo, una regla de arquitectura, un token, un
límite de líneas, una tabla de verdad, accesibilidad-por-atributo) → es
contrato y no entra.

Alcance del censo: los 207 `*.invariant.ts`/`.tsx` del repo. Se descartaron sin
leer los 90 que viven fuera de `src/app/v3/**`, `src/components/layout/**` y
`src/app/probe-escena/**` (chatbot, leados, seguridad, cron, reportes, etc.):
son lógica de negocio/backend, no tienen "un elemento en pantalla" que mover.
Los 117 restantes se leyeron completos. Se excluyeron de este censo (no por no
calificar, sino porque el prompt los trata aparte): `s3-peso`, `s5-peso`,
`s8-peso` (presupuesto de peso → PASO 3) y `s4-fixtures/*` (fixtures del
detector de conflictos de `package.json`, no del sitio).

`ENTERO` = el archivo completo es composición → se borra entero (PASO 2).
`MIXTO` = mezcla → se poda solo la parte de composición, el archivo sigue vivo.

---

## `src/components/layout/home-intro/` (el preloader)

| archivo | script | afirma | veredicto |
|---|---|---|---|
| introFlight.invariant.ts | test:s8e-intro-vuelo | Alto de tinta del logo constante durante el vuelo e igual al destino de la escena; desplazamiento y rotación en el mismo tramo exacto | ENTERO |
| introSilhouette.invariant.ts | test:s8e-intro-silueta | Silueta pixel-idéntica antes/después de apagar el trazo, y dentro de subpíxel del outset del mesh 3D | ENTERO |
| introTimeline.invariant.ts | test:s8e-intro-timeline | Los siete límites de fase quedan en orden estricto en las once calibraciones | ENTERO |
| introSampling.invariant.ts | test:s8e-intro-muestreo | Todo canal de animación monótono en [0,1]; la letra sale completa antes del velo; el cruce de bajo contraste medido en continuo (no por cuadro) | ENTERO |
| introLanding.invariant.ts | test:s15e-intro-aterrizaje | El centro de aterrizaje del logo coincide con el centro proyectado por la cámara de la escena a <0,001px | ENTERO |
| introParticleSampling.invariant.ts | test:s15e-intro-muestreo | Las rampas de entrada/asiento/relevo por partícula solo avanzan; nunca se solapan las dos fases | ENTERO |
| introParticleScale.invariant.ts | test:s14e-intro-escala | INTRO_DUST_SCALE cae en la banda medida; la escala no mueve el instante de legibilidad | ENTERO |
| introParticleTiming.invariant.ts | test:s13e-intro-particula-ritmo | La ventana de partículas del intro termina antes de que la de la escena se vuelva legible, en todas las calibraciones | ENTERO |
| introParticleReading.invariant.ts | test:s14e-intro-lectura | El nuevo campo de partículas tiene menos motas pero más grandes y más tiempo visibles, sin subir demasiado la cobertura de tinta | ENTERO |
| introParticleField.invariant.ts | test:s13e-intro-campo | Cada mota de asiento cae en una posición real única con recorrido corto y legible | MIXTO — composición: aterrizaje/recorrido/curva de movimiento de las motas · contrato: ciclo de montaje del canvas y el guardia de `prefers-reduced-motion` |
| introParticleSettle.invariant.ts | test:s15e-intro-acomodo | Cada mota se asigna a la mota real más cercana (mismo shell/tamaño/color), con menos recorrido que la alternativa | MIXTO — composición: asignación/color/deriva de motas · contrato: que `SCENE_DUST_SHARE` salga del default de `probeStore.ts` y no de un literal |
| introRelay.invariant.ts | test:s15e-intro-relevo | La cobertura mesh+svg suma siempre 1 y la tinta entregada nunca cae a 0 | MIXTO — composición: la duración de la ventana "solo mesh" (~4-4,5s), atada al timing de hoy · contrato: la máquina de estados del relevo y que cobertura sume 1 |
| introParticles.invariant.ts | test:s13e-intro-particulas | El campo de polvo del intro es el de la escena escalado/diluido por la perilla declarada, en posiciones de pantalla que coinciden | MIXTO — composición: población/posición/tamaño/divergencia de semilla/recorte vs. la escena · contrato: que las constantes copiadas en el módulo sigan sincronizadas con `DepthParticles.tsx`/`BokehParticles.tsx` |

## `src/components/layout/carga-diferida/__tests__/`

| archivo | script | afirma | veredicto |
|---|---|---|---|
| s8-diferido.invariant.ts | test:s8-diferido | El layout raíz sigue montando las mismas 13 piezas, en el mismo orden, sin `ssr:false`; hashes de archivos frozen sin cambiar | CONTRATO — no entra |
| s9-sentry.invariant.ts | test:s9-sentry | Sentry carga eager con scrubbing de PII y DSN por env var; peso del chunk | CONTRATO — no entra |

## `src/app/v3/_lib/__tests__/` (raíz)

| archivo | script | afirma | veredicto |
|---|---|---|---|
| superficies.invariant.ts | test:s1-superficies | Los cuatro modos de superficie producen marcado correcto; el recorrido de superficies de las ocho secciones coincide con la tabla aprobada | ENTERO |
| s5-ritmo.invariant.ts | test:s5-ritmo | El ritmo (pantallas−pinneadas+secuencias=momentos) de las cuatro secciones del lane contra la tabla y la referencia | ENTERO |
| s7-ritmo.invariant.tsx | test:s7-ritmo | El ritmo del home completo de ocho secciones, con la constante de pin verificada contra la clase real | ENTERO |
| s16-tipografia.invariant.ts | test:s16-tipografia | Compensación óptica cap-height/x-height Chivo↔Instrument Sans; colisiones de separación en la escala a cuatro anchos | ENTERO |
| s3-cta.invariant.tsx | test:s3-cta | Rollover del CTA: rótulo accesible, geometría de rotate/translate/clip-path, ventana, tokens de tiempo, color, hueco del subrayado | MIXTO — composición: geometría rotate/translate/clip-path del rollover, crecimiento en px de la ventana, posición/ancho/dirección del hueco del subrayado · contrato: paridad rótulo/aria-hidden, duraciones compuestas desde tokens, "siempre tinta nunca acento", en qué regla CSS vive la transición |
| s3-cursor.invariant.ts | test:s3-cursor | Compuerta del cursor por ancho/preferencia, import perezoso, cursor nativo nunca oculto, medidas de núcleo/halo, color heredado | MIXTO — composición: tamaños en px del núcleo y halo del cursor · contrato: tabla de verdad de la compuerta, import perezoso, nunca ocultar el cursor nativo, color por token |
| s3-layout.invariant.ts | test:s3-layout | Padding lateral, columnas fluidas, canaletas que conmutan en 1025px, colapso de la grilla de 5 columnas, `Pie` reenvía clases | MIXTO — composición: padding/topes de ancho/columnas fluidas/canaletas/colapso de grilla · contrato: `Pie` reenvía `className` a la caja correcta (contrato de props) |
| s3-navegacion.invariant.ts | test:s3-navegacion | Umbral de aparición de la pastilla derivado de tokens, sticky puro, offsets del hover | MIXTO — composición: derivación del umbral en px, geometría del sticky, offsets/escala del hover · contrato: que los números no estén hardcodeados y nada dependa de JS de scroll |
| s3-papel-translucido.invariant.ts | test:s3-papel | Alfa de la superficie translúcida desde la escala; tinta pasa AA contra el peor fondo en los dos temas | MIXTO — composición: contraste de la tinta contra el fondo peor-caso según qué hay detrás · contrato: que la alfa venga de un token de escala con consumidor real |
| s3-tipografia.invariant.ts | test:s3-tipografia | Diez niveles tipográficos, clamp() por sus tres anclas, cap height real del binario, banda/titular/tinta vs. alto declarado | MIXTO — composición: anclas del clamp() por ancho, cap height real, banda de punta a punta/titular como fracción de ventana/tinta vs. alto declarado/referencia arriba de 1440 · contrato: existencia/consumo de niveles y tokens, censo de clases CSS |
| compuerta.invariant.ts | test:s1-compuerta | Umbral 1025px, SSR vacío del escenario, hook sin leer window, import dinámico, clases fuera de flujo, pinneado por CSS | MIXTO — composición: clases `fixed/inset-0/z-0` sin ancho/alto que sacan el escenario del flujo del documento · contrato: umbral/SSR/hook/import dinámico/pinneado-es-CSS |
| s10-acceso.invariant.ts | test:s10-acceso | Censo de accesibilidad del home: tabulación, encabezados, landmarks, reduced-motion, contraste de foco y de texto | MIXTO — composición: contraste del anillo de foco según la superficie donde cae, contraste de texto por sección/tinta contra la escena · contrato: tabulación, árbol de encabezados, landmarks, censo de marcadores, reduced-motion |
| s10-mobile.invariant.ts | test:s10-mobile | Geometría de mobile: pantallas por sección, cajas de alto fijo, colapso de Números, alto de Trabajos/Cierre, overflow de pastilla, escala a 375 | MIXTO — composición: todo lo geométrico de arriba · contrato: setup/supuestos y peso del bundle JS bajo 1025 |
| s7-integracion.invariant.tsx | test:s7-integracion | Las ocho secciones montan en orden y superficie; recorrido de escena; pin/sticky según tabla; sin secciones a mano | MIXTO — composición: qué paneles dejan ver la escena durante el scroll, mecanismo de pin/sticky vs. tabla · contrato: registro/orden de montaje, atributos de superficie, arquitectura de ruta, rutas de demo borradas |
| s8-montaje.invariant.ts | test:s8-montaje | Enchufes de montaje, marca importada una vez, orden chrome→intro→compuerta, ningún hermano de `<main>` suma alto | MIXTO — composición: el orden chrome→intro→compuerta en el JSX (nacimiento del sticky de la pastilla), ningún hermano de `<main>` aporta alto fuera de flujo (protege el cálculo de progreso por `scrollHeight`) · contrato: existencia de enchufes, unicidad de import, entregables, líneas |
| s9-instrumentos.invariant.ts | test:s9-instrumentos | Cuatro deudas de instrumentos: control positivo unificado, tipos cerrados hacia /probe-escena, rutas §7.13 en disco, scroll-padding-top | MIXTO — composición: desvío en px del aterrizaje de anclas de scroll contra el borde de la pastilla · contrato: unificación de controles positivos, acoplamiento de tipos, existencia de rutas/líneas heredadas |
| s17-marca.invariant.tsx | test:s17-marca | Los tres registros de marca existen y componen; prefijo usa alias de acento; Instrument Serif no se carga; cuántas veces se montan en el home | MIXTO — composición: sección "6" cuenta EN QUÉ SECCIONES Y CUÁNTAS VECES aparece cada pieza de marca en el home renderizado (logo en pie+Hero, isotipo solo en Hero <390) — se rompe si la marca se muda de sección o de breakpoint · contrato: existencia/composición de las tres piezas, alias de acento, cero color hardcodeado, Instrument Serif no cargada, cableado de la galería |

Resto de `_lib/__tests__/` raíz (bundle, fuentes, s10-banco, s10-lectura, s10-medida,
s10-raf, s11-frontera, s18-compuertas, s18-deslizamiento, s21-fotos, s21-llave,
s3-codigo, s3-foco, s3-frontera, s3-imagen, s3-tokens, s4-agregado, s4-cobertura,
s4-heredado, s4-paquete, s4-ventana, s5-codigo, s5-compacto, s5-contenido,
s5-tokens, s7-arboles, s7-cn, s7-compuerta, s7-contrato, s7-pedido, tokens):
**CONTRATO — no entran** (bytes, tipos, seguridad de import, accesibilidad por
atributo, arquitectura de módulos, existencia de fuentes/tokens, mecánica JS).

## `src/app/v3/_lib/escena/__tests__/`

| archivo | script | afirma | veredicto |
|---|---|---|---|
| s8-tinta.invariant.ts | test:s8-tinta | Contraste WCAG de la tinta contra la escena muestreada en seis poses/percentiles | ENTERO |
| s9-anclaje.invariant.ts | test:s9-anclaje | La tabla scroll-pantalla↔progreso: valores, mapeo monótono+biyectivo, breakpoints de llenado por sección | ENTERO |
| s9-visibilidad.invariant.ts | test:s9-visibilidad | Qué secciones son transparentes/opacas y cuántas pantallas del documento son opacas | ENTERO |
| s10-logo.invariant.ts | test:s10-logo | Cuánto del logo 3D entra en cuadro por breakpoint/pose, superposición con el titular | ENTERO |
| s10-vertical.invariant.ts | test:s10-vertical | Posición horizontal en px del logo a 390×844, fracción de entrada, superposición con la columna de texto | ENTERO |
| s13b-escena.invariant.ts | test:s13b-escena | Velocidad/ritmo de cámara tras sacar el keyframe de sostén; encuadre del logo del hero | ENTERO — único leaf de la suite `s13b`: borrar también el script agregado `test:s13b` |
| s16-anclaje.invariant.ts | test:s16-anclaje | Progreso de ancla declarado para "por-qué-develOP"; cero superposición titular/logo en el ancla | ENTERO |
| s16-encuadre.invariant.ts | test:s16-encuadre | Puntería del eje óptico del logo del hero, márgenes, el frameX elegido | ENTERO |
| s16-techo.invariant.ts | test:s16-techo | Velocidad del arco de cámara por pantalla de scroll contra un techo de velocidad | ENTERO |
| s18-azimut.invariant.ts | test:s18-azimut | Techo geométrico de despeje de piso del azimut de paralaje del mouse | ENTERO |
| s20-arco.invariant.ts | test:s20-arco | Forma del arco de luz sol/noche; sus paradas caen en nodos reales de ancla/visibilidad | ENTERO |
| s8-escena.invariant.ts | test:s8-escena | Completitud de la migración, imports rotos, mapeo sección→scroll, clases fuera de flujo de `EscenaDelHome` | MIXTO — composición: `CLASES_FUERA_DE_FLUJO` = `fixed inset-0 z-0 pointer-events-none` (anclaje de pantalla completa) · contrato: todo lo demás (migración, imports, acoplamiento de tipos, peso, aislamiento del motion) |
| s16-arnes.invariant.ts | test:s16-arnes | Constantes de cámara/piso/logo derivadas de una sola fuente, barrido de copias sueltas | MIXTO — composición: `ORBIT_TARGET_Y===0` y las fórmulas de posición de `FLOOR_Y`/`LOGO_BOX_WORLD` · contrato: el barrido de fuente-única |
| s22-emision.invariant.ts | test:s22-emision | Curva de emisión del logo vs. nivel de luz; emisión cero en los anclajes transparentes salvo Trabajos | MIXTO — composición: evaluación en anclas reales, `P_TRABAJOS` hardcodeado, la ventana "vuelta" · contrato: equivalencia/forma de la curva, cableado del shader |

Resto de `escena/__tests__/` (s8-tres, s17-revelado, s18-modulacion, s20-brillo):
**CONTRATO — no entran**.

## `src/app/v3/_lib/motion/__tests__/`

| archivo | script | afirma | veredicto |
|---|---|---|---|
| cronograma.invariant.ts | test:s2-cronograma | Duración de escalonado aplicada vs. declarada; ventanas de progreso por pieza; continuidad del segmento P7 | ENTERO |
| anclas.invariant.ts | test:s2-anclas | La fórmula de ancla de scroll reproduce los px medidos de inicio/fin en páginas reales | ENTERO |
| s19-lente.invariant.ts | test:s19-lente | El FOV del lente de escena espeja el de cámara; fórmula CSS de perspectiva; dónde cae un translateZ de −3000px | MIXTO — composición: FOV/perspectiva/profundidad/origen del lente · contrato: el cableado contra Trabajos |

Resto (curvas, epoca, motion-css, traduccion, tokens-de-uso, motion-bundle,
galeria, lineas, reducido): **CONTRATO — no entran**.

## `src/app/v3/_secciones/`

| archivo | script | afirma | veredicto |
|---|---|---|---|
| _invariantes/s19-sincronia.invariant.ts | test:s19-sincronia | La regla "se asienta dentro de la ventana visible" reproduce los px de aterrizaje medidos; qué `<Bloque>` la sigue | MIXTO — composición: matemática de ancla en px y cumplimiento por sección · contrato: orden/precedencia de ramas en el código fuente |
| _invariantes/s6-contrato.invariant.ts | test:s6-contrato | Rango de scroll del pin, simultaneidad entre canales, tabla de verdad del gate, tabla de superficies | MIXTO — composición: rango del pin, simultaneidad entre canales · contrato: tabla de gate, superficies, ritmo, escáner de contenido, derivación de patrones |
| _invariantes/s6-render.invariant.tsx | test:s6-render | Las 4 secciones renderizan en el orden/superficie de la tabla; gate <1025; texto idéntico en las dos ramas | MIXTO — composición: orden de render de las secciones · contrato: gate, paridad de texto, escáner de contenido, acento activo, `cn()` |
| hero/hero.invariant.tsx | test:s5-hero | Alto/pin/oclusión de la escena 3D; escaneo de contenido; gate; a11y; + ancho de grilla vs. logo, ajuste de línea, aterrizaje de scroll | MIXTO — composición: alto/oclusión de escena, ancho de grilla vs. superposición con el logo, aritmética de aterrizaje de scroll, los bloques COMPO-1/PAPEL-2/COMPO-2 (ajuste de línea/sangría/espaciado/alto de viewport) · contrato: contenido/marcadores/copy/gate/heading/CTA/higiene del lane |
| quienes-somos/quienes-somos.invariant.tsx | test:s5-quienes-somos | Layout/orden de lectura de 3 pantallas; escaneo de contenido; gate; a11y; aspecto/`sizes` de foto | MIXTO — composición: layout/orden de pantallas, aspecto/`sizes` de la foto · contrato: contenido/gate/a11y/higiene |
| numeros/numeros.invariant.tsx | test:s5-numeros | Layout/orden de 4 pantallas; grilla asimétrica sin superposición de 5 cifras; variedad de tamaño; gate; a11y | MIXTO — composición: pantallas/orden, asimetría/superposición/tamaños de grilla, colapso de columnas responsive · contrato: contenido/gate/a11y |
| trabajos/trabajos.invariant.tsx | test:s5-trabajos | Pin/alto/ritmo de scroll; pose 3D inicial y perspectiva del lente; tamaño de imagen; contenido/a11y/higiene | MIXTO — composición: alto/pin/ritmo, pose 3D/perspectiva, tamaño de imagen por columna, llegada-meseta-salida de cada plano | contrato: contenido/a11y/higiene/contraste |
| servicios/s6-servicios.invariant.tsx | test:s6-servicios | Gate; paridad de texto; tokens; motor de progreso único; sincronía entre canales; rango/estructura del pin | MIXTO — composición: sincronía entre canales, rango/estructura del pin, asiento/aterrizaje de cada servicio · contrato: gate/contenido/higiene/arquitectura |
| tu-panel/s6-tu-panel.invariant.tsx | test:s6-tu-panel | Gate; paridad texto/a11y; escáner de contenido; tokens; `cn()`; tamaños/aspecto de imagen; conteo de lista | MIXTO — composición: tamaños/aspecto de imagen, conteo de pantallas, asiento/aterrizaje de la lista · contrato: gate/contenido/higiene |
| por-que-develop/s7-por-que-develop.invariant.tsx | test:s6-por-que-develop | Gate; paridad de texto; escáner de contenido; tokens; foco; contraste; guardia de oclusión | MIXTO — composición: guardia de no-oclusión, alto/rango de scroll del bloque, conteo de pantallas/pin, valor de pose del keyframe · contrato: gate/contenido/foco/contraste |
| cierre/s8-cierre.invariant.tsx | test:s6-cierre | Gate; paridad de texto/vocabulario; escáner de contenido; foco/orden de tabulación; sin enlaces muertos | MIXTO — composición: timing de entrada por pieza, ajuste de alto/derivación, ancho/wrap del titular · contrato: gate/contenido/a11y/higiene/tema |

Resto de `_secciones/` (`_invariantes/s6-tokens`, `_invariantes/s6-contraste`,
`_invariantes/s6-lane`): **CONTRATO — no entran**.

## `src/app/v3/_intro/__tests__/` y `src/app/v3/_chrome/__tests__/`

| archivo | script | afirma | veredicto |
|---|---|---|---|
| s8-relevo.invariant.ts | test:s8-relevo | Un simulador de luz reproduce el brillo medido del logo; el escalón de luz ambiente en el corte intro→escena; sin superposición temporal en el relevo | ENTERO |
| s8-intro.invariant.ts | test:s8-intro | El preloader se importa/monta/cablea sin cambios; dos archivos frozen byte-idénticos; gate de pre-pintado; peso; tamaño del logo constante en pantalla durante la secuencia | MIXTO — composición: la constancia del tamaño del logo en pantalla y su coincidencia con la pose de destino · contrato: import estático, hashes frozen, gate, peso |
| s8-chrome.invariant.ts | test:s8-chrome | Anidamiento DOM/skip-link de la pastilla sticky; umbral de scroll derivado del alto del Hero; ancestros no recortan overflow | MIXTO — composición: anidamiento/skip-link, umbral de scroll desde la geometría del Hero, overflow de ancestros vs. sticky · contrato: enlaces del pie, fix de `cn()`, compuerta de cursor, límites de import, peso |

## `src/app/probe-escena/__tests__/`

| archivo | script | afirma | veredicto |
|---|---|---|---|
| s7-modelado.invariant.ts | test:s7e-modelado | Ángulo luz-observador (γ) a lo largo del track real de cámara/luz para que las ventanas de texto queden a contraluz | ENTERO |
| s9-composicion.invariant.ts | test:s9e-composicion | Nada ocluye el logo a lo largo del track real; corredor/profundidad de fondo libre; amplitud/velocidad/longitud de cámara vs. las otras 4 variantes | ENTERO |
| s10-batido.invariant.ts | test:s10e-batido | Ratio de moiré proyectado, longitud de onda del batido en px, margen de aliasing sobre el track real y todas las variantes | ENTERO |
| s11-proyeccion.invariant.ts | test:s11e-proyeccion | Cuánto alcanza en el piso la sombra de la celosía, tamaño de celda/batido proyectado, barrido total de la banda, sobre el arco de luz real | ENTERO |
| s12-barrido.invariant.ts | test:s12e-barrido | Barrido del radio del sol sobre las seis poses reales: brillo medio del hero, contraste de portadora/batido, ancho de borde en cuadro | ENTERO |
| s12-tension.invariant.ts | test:s12e-tension | Brillo medio de seis poses reales y contraste de portadora/batido contra las tablas S10/S11/S12 al crecer el radio angular del sol | ENTERO |
| s7-recorridos.invariant.ts | test:s7e-recorridos | Forma/rangos del arreglo de keyframes; bloquea las 23 poses calibradas byte a byte; los 7 arcos combau la trayectoria; cámara sobre el piso | MIXTO — composición: bloqueo de deriva de poses, curvatura de los arcos, cámara-vs-piso · contrato: orden/rango/seguridad de build del arreglo `at` |
| s7-sol.invariant.ts | test:s7e-sol | Dirección del gobo de celosía sincronizada con la luz clave; `LIGHT_ARC` es un día monótono en un barrido de 180°; alcance de sombra/radio de partícula | MIXTO — composición: forma del arco de un día, alcance del mapa de sombra, radio de partícula vs. fondo · contrato: sincronía clave/gobo y longitud unitaria |
| s7-variantes.invariant.ts | test:s7e-variantes | Ocupación/desborde del logo en cuadro y rangos de distancia entre variantes de cámara | MIXTO — composición: ocupación/desborde/distancia/cruces entre variantes · contrato: bookkeeping de notas huérfanas/nombre de export/flag derivado |
| s9-recorrido.invariant.ts | test:s9e-recorrido | Cardinalidad de keyframes, mapeo de límites de tramo, duplicación exacta del sostén; velocidad de arranque y margen de despeje del piso | MIXTO — composición: velocidad de arranque/cierre y margen de despeje del piso · contrato: cardinalidad/flags derivados/mapeo de tramos/duplicación del sostén |
| s10-escena.invariant.ts | test:s10e-escena | Caja de tinta del logo vs. medición independiente; cuánto oscurece el fondo/celosía el cuadro en seis poses reales; crecimiento de sombra/banda | MIXTO — composición: balance de negro entre poses, crecimiento de sombra/banda a lo largo del arco · contrato: caja de tinta vs. medición independiente |
| s10-fondo.invariant.ts | test:s10e-fondo | Los dos cilindros de fondo despejan la cámara más lejana y el ciclorama; nunca muestran un borde superior en cuadro | MIXTO — composición: despeje de cámara y bordes en cuadro · contrato: geometría cuadrada de la celda y aritmética del desajuste |
| s10-particulas.invariant.ts | test:s10e-particulas | El campo de bokeh se mantiene dentro de la órbita de cámara; su tamaño de punto nunca toca el límite de recorte | MIXTO — composición: despeje de órbita/tamaño de punto/conteo en cuadro/overdraw · contrato: consistencia de config del arreglo de shells, contraste de color cerca/lejos |
| s11-celosia.invariant.ts | test:s11e-celosia | Valores de capa/uniform de la celosía derivados de `probeMoire` (no duplicados); cableado de inyección de shader | MIXTO — composición: valor óptimo de ancho de barra, cobertura completa del piso · contrato: consistencia de trama y cableado de three.js |
| s11-pantalla.invariant.ts | test:s11e-pantalla | Huella en px/cuantiles de aliasing sobre todas las variantes de cámara; batido proyectado en px en poses nombradas | MIXTO — composición: huella/cuantiles/batido por pose · contrato: matemática de borde de la función de filtro de píxel |
| s11-piso.invariant.ts | test:s11e-piso | Cuánto puede oscurecer el papel una sombra proyectada; brillo medio de seis poses reales contra tablas S10/S11 | MIXTO — composición: techo de sombra, brillo medio de seis poses, marcas de piso en sombra · contrato: forma cerrada del factor de cielo vs. su integral |
| s11-sin-sol.invariant.ts | test:s11e-sin-sol | Escanea el código fuente en busca de los archivos de sprite de sol ausentes; tabla publicada de fondo/alfa | MIXTO — composición: comparación de oscuridad tinta-vs-papel en una vista iluminada · contrato: escaneo de ausencia de sprite y tabla de haces |
| s12-penumbra.invariant.ts | test:s12e-penumbra | Modelo matemático del ancho de penumbra (linealidad, oblicuidad, paridad GLSL/TS) | MIXTO — composición: variación de ancho de borde "en cuadro" sobre cuatro poses reales · contrato: modelo matemático/string de shader/rango del panel |

Resto (s7-export, s10-tramas): **CONTRATO — no entran**.

---

## `src/lib/` (hallazgo tardío: 2 de los 90 descartados por directorio SÍ eran de escena)

`test:s8e-encuadre` y `test:s13e-camara` apuntan a `src/lib/scene-framing.invariant.ts`
y `src/lib/scene-camera.invariant.ts` — fuera de las tres carpetas censadas por
directorio. Se leyeron ambos completos, con sus dos módulos de apoyo
(`scene-encuadre-deuda.ts`, `scene-framing-aproximacion.ts`, ambos inyectan
comprobaciones en `scene-framing.invariant.ts`).

| archivo | script | afirma | veredicto |
|---|---|---|---|
| scene-framing.invariant.ts (+ sus 2 módulos de apoyo) | test:s8e-encuadre | El destino del logo del preloader sale del keyframe activo; dónde proyecta en píxeles (940,417 a 1440×810, descentrado por la composición); el clamp de ancho en mobile; control negativo contra una aproximación lineal; aterrizaje medido en tres teléfonos | MIXTO — composición: destino desde el track activo, aterrizaje en px y descentrado por diseño, comportamiento del clamp de ancho, el control negativo (proyección real ≠ aproximación lineal), medición de aterrizaje en los tres teléfonos · contrato: consistencia caja-de-mesh-vs-path-aplanado, viewport degenerado → null, el censo de las 5 copias de la fórmula (arquitectura/DRY) |
| scene-camera.invariant.ts | test:s13e-camara | Que la cámara/proyección genéricas extraídas en S13 reproducen bit a bit lo que la función específica de encuadre del logo ya hacía | CONTRATO — no entra (verifica equivalencia entre dos rutas de código, no una posición de diseño) |

## Totales

- **Archivos ENTERO (se borran completos en PASO 2):** 33
- **Archivos MIXTO (se podan, quedan vivos):** 47 (46 + `scene-framing.invariant.ts`)
- **Riesgo de suite vacía:** `s13b-escena.invariant.ts` es el único leaf de la
  suite `s13b` (`test:s13b`) y es ENTERO → el agregado `test:s13b` se borra
  también de `package.json`. Ninguna otra suite queda en cero.
