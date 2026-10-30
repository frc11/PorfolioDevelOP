# La voz del sitio: qué hace el home de /v3 y por qué se siente develOP

L7e · lane C · 2026-10-30. Inventario del home **tal como quedó después de la cola 3** (rama `rediseno/home`, `142788ca`), leído en el código y
recorrido en el navegador (dev :3004, 1440 × 900). Las rutas son desde `src/app/v3/`; `esc/` es `_lib/escena/`.

**Cómo leer los números.** Casi todo lo de abajo es una constante leída del código, con su `archivo:línea`: es lo que el sitio *pide*. Lo
que está marcado **(medido)** salió del navegador. Lo que no dice ninguna de las dos cosas no está. Para Franco: si sólo vas a leer una
parte, leé §9 (las reglas) y §10 (lo que falta).

---

## 1. El esqueleto: un lienzo fijo y paneles que pasan por encima

- `layout.tsx` monta en **toda** ruta de /v3: el piso de papel, Lenis (`CompuertaDelScrollSuave`), la escena (`EscenarioCompuerta`), la
  barra, el menú, el contacto, el cursor y el sonido (`ChromeDelHome`), el velo (`VeloDeNavegacion`) y el preloader (`PreloaderDelSitio`).
  La página pone su `<main className="relative z-10">` y nada más.
- La escena es un `<Canvas>` `fixed inset-0 z-0` (`_lib/compuerta.ts:177`). Nunca se desmonta entre rutas: **viaja** con el sitio.
- El home son 8 secciones (`_lib/secciones.ts:388-440`). **(medido a 1440 × 900)** el documento mide 35 878 px, unas 40 pantallas:

| # | Sección | Superficie | Alto (código) | Alto medido |
|---|---|---|---|---|
| 01 | hero | papel transparente | 100 svh | 900 |
| 02 | quienes-somos | papel transparente | 300 svh | 2733 |
| 03 | numeros | papel transparente (vacía, sólo ancla) | 200 svh | 1800 |
| 04 | trabajos (Portfolio + Demos) | oscuro transparente | 717 svh, solape 0,4 | 9231 |
| 05 | servicios (+ recomendador) | papel opaco | 800 svh | 7200 |
| 06 | tu-panel | papel opaco | 700 svh | 3574 |
| 07 | por-que-develop (+ reseñas + CTA) | papel transparente | 700 svh + 4 de reseñas | 9900 |
| 08 | cierre (pie + FAQ) | papel transparente | 100 svh | 900 |

- La escena **duerme** debajo del papel opaco (`esc/visibilidad.ts:279-300`: `corriendo` / `suspendida` / `reanudando`, con un margen de
  0,125 pantallas, `:151`). En las costuras transparente ↔ opaco, una máscara en el envoltorio (`esc/revelado.ts:74`) funde la escena.
- **Una ruta sin preset** (lo comprobé con `/v3/laboratorio`): la escena pinta un cuadro en la pose del hero, de día, y se suspende
  (`esc/ruta/preset.ts:80`). Con `PRESET_DEL_HOME` se queda despierta en esa pose (con el mouse y la deriva).

## 2. La escena: la sala, el logo y la luz

**Las piezas** (`esc/ProbeStage.tsx:176-333`): el logo `OP` en volumen en el centro, el piso de bloques con energía en las juntas, el domo
de vidrio facetado con el cielo detrás, las marcas de agua del logo repetidas en el muro (las «paredes con el logo» de las capturas), la
sombra del logo en el piso, el polvo, y de noche las estrellas, la estrella fugaz, el plasma y la red.

**Día y noche no son dos modos: es un nivel de luz** (`esc/lightArc.ts`).
- Por debajo de 0,34 (`probeLighting.ts:225`) empieza la noche: las motas se vuelven blancas, el logo emite (`logoEmision.ts:93`) y se
  pinta negro con un filo casi blanco (`logoDeNoche.ts`). 0,04 es la noche cerrada (`lightArc.ts:181`).
- El arco del home: día hasta 0,4375 del recorrido, atardecer a 0,5, noche sostenida durante Trabajos, la vuelta a 0,625 y el amanecer a
  0,7375 (`lightArc.ts:263-299`).
- **Quien dispara la noche es la gota**, no el scroll: al entrar a Trabajos un barrido en diagonal de **760 ms**, curva `1-(1-t)²`, banda
  de 30 px con 16 px de pluma (`_secciones/trabajos/gota.ts:44-62`), invierte el color entre el 25 y el 75 % del barrido y empuja la luz a
  la noche (`esc/nocheDisparada.ts:73-81`). Con movimiento reducido, el corte es instantáneo.
- **Qué significa cada una** (inferido de dónde se usa): **el día es develOP hablando de sí** (hero, Quiénes somos, Seis razones, el
  cierre); **la noche es el trabajo** (Portfolio, Demos) **y los servicios** (cada página de servicio es de noche con su acento como luz).
  La noche es donde se muestra lo que se hizo; el día, donde se conversa.

**La cámara** (`esc/choreography.ts:224-425`): un recorrido de 8 poses que orbita al logo y vuelve al frente.

| Avance | Dónde | Pose {ángulo, altura, distancia, frameX} |
|---|---|---|
| 0 | hero | {0°, 6,4, 19, 0,5}: el logo corrido a la derecha |
| 0,375 | quiénes somos | {130°, −3,6, 14, −0,8}: de costado y desde abajo |
| 0,625 | trabajos | {195°, 4,5, 20, −0,85}: por detrás |
| 0,75 → 0,886 | la frase de Seis razones | {360°, 1,6, 20, 0}: otra vez de frente |
| 0,9284 → 0,9789 | el CTA | {360°, 4,5, 31, 0, frameY −1}: se aleja |
| 0,9842 → 1 | el pie | {360°, 5, 34} |

- La inercia: τ de 0,2–0,28 s por eje (`choreographyPhysics.ts:40-46`). El mouse: hasta **22°** de azimut (8° de piso desde la noche),
  altura `pointer.y × 0,045 × distancia`, suavizado τ 0,45 s (`OrbitRig.tsx:69-183`). Una deriva lenta: 1,15° cada 13 s de guiñada y 0,7°
  cada 9,5 s de cabeceo (`choreographyPhysics.ts:199-204`). Sin física con movimiento reducido.
- En las páginas: la intro hace la **pose 2, girar** (de {0°, 6,4, 19, frameX 0} a {38°, 5,2, 15}, sobre 2,5 pantallas;
  `esc/ruta/pistaDeLaIntro.ts:31-52`) y el cierre repite las poses finales del home (`PISTA_DEL_CIERRE`).

## 3. Los títulos: cuatro maneras de llegar, ninguna sube desde abajo de la nada

1. **En volumen (3D)**, desde 1024 con la escena (`_componentes/titulos3d/`, `TituloDeVolumen`): letras de la escena, fijas en el mundo,
   que se ven en perspectiva con el mouse. Llegan con el gesto del titular del hero, **2,4 s** (`_lib/titulos3d/titular.ts:10`); se van
   con una **caída** de 0,6 s después de 0,2 s, curva `[0.25, 0.46, 0.45, 0.94]` (`presets.ts:39`). Al frenar el scroll, se asientan
   (`ASIENTO = {quietoMs 180, s 0,35}`, `repeticiones.ts:13`). Hero, «El equipo», «Nosotros», la frase de Seis razones, el título de cada
   página. **El `h1` del DOM siempre existe y dice lo mismo.**
2. **Por renglones con máscara**, atado al scroll (patrón **P1**, `_lib/motion/patrones-tipografia.ts:29-40`): cada renglón sube de
   `yPercent 120` a 0 detrás de su máscara, curva `principal` (power1.out), duración 1, escalón 0,2 (en «segundos de referencia» repartidos
   en el scroll). Le suma una **inercia de sesgo**: con el scroll rápido el título se inclina hasta 5° y vuelve con un resorte 140/13
   (`_lib/motion/inercia.ts:27-38`). Lo arma `TituloQueSube` (`_secciones/_contrato/TituloQueSube.tsx`).
3. **Que se pinta** (`_componentes/pintado/pintado.ts`): las palabras están al 18 % de tinta (`PRESENCIA_SIN_PINTAR`) y se pintan **una
   después de la otra** hasta que el centro del título llega a media pantalla (`FIN_DEL_PINTADO 0,5`). La palabra destacada va en itálica
   con un subrayado que crece con el pintado. Dos versiones: atada al scroll (`tu-panel/TituloQueSePinta.tsx`) y por tiempo, **650 ms**,
   que se despinta si volvés por debajo de la mitad (`servicios/escenario/TituloQueSePintaAlLlegar.tsx:25`). Funciona en todo ancho.
4. **Que se levanta** (abajo de 1024, en el flujo; `trabajos/portfolio/levantarse.tsx:12`): el titular se para desde acostado, de 70° y
   110 % abajo a parado, con 600 px de perspectiva y el pie como bisagra, en **0,6 s** con `[0.25, 0.46, 0.45, 0.94]`. Por tiempo, no por
   scroll. Es el efecto de los títulos del teléfono.

Y dos trazos que dibujan sentido, no decoración (`canales.tsx:355-404`): el **subrayado** y el **tachado** de «Queremos hacer *algo
distinto*, no ~~lo mismo de siempre~~», y el **signo ≠** que se dibuja con el scroll.

## 4. Los cuerpos: suben poco, con máscara, y nunca rebotan

- **El cuerpo canónico**: `CanalDeTexto tipo="parrafo"` dentro de un `Bloque` P1: cada renglón sube de `yPercent 100` a 0 detrás de su
  máscara, power1.out, 0,8 / escalón 0,12 (`_lib/motion/texto.ts:30-33`). Desde 1024.
- **El bloque**: P2, `yPercent 60 → 0`, sin inercia (`patrones-tipografia.ts:55-63`).
- **El gatillo** (`_contrato/Gatillo.tsx`): **32 px** y opacidad 0 → 1 en **700 ms** con `--ease-salida: cubic-bezier(0.64, 0.1, 0, 1)`
  (`theme-develop.css:1106`). Se dispara cuando el bloque cruza la línea del **6 %** desde abajo (`disparo.ts:52`) y **vuelve en espejo al
  subir**. La primera observación es el estado de carga, sin animación. Si el scroll queda quieto 180 ms, lo visible se dispara solo
  (`reposo.ts:14`). Funciona en todo ancho.
- **La regla de la máscara:** el texto no aparece «flotando con fade»; sale de abajo de su propio renglón, como si estuviera impreso
  debajo del papel. El fade solo es del gatillo, y siempre acompañado de un desplazamiento corto.

Las dos curvas del sitio: `--ease-principal: cubic-bezier(0.77, 0, 0.175, 1)` (simétrica, fuerte en el medio) y `--ease-salida:
cubic-bezier(0.64, 0.1, 0, 1)` (arranque decidido, frenada larga). Duraciones: 300 / 400 / 500 / 700 ms (`theme-develop.css:1287-1290`).
La frenada larga es la firma del sitio: todo llega rápido y se acomoda despacio.

## 5. Las secciones del home, una por una

- **Hero.** «Tu negocio / vendiendo / LAS 24 HS» en dos registros (Archivo condensada en mayúsculas + Chivo itálica liviana), los dos en
  volumen; la bajada viaja en el plano del título. Dos CTA de línea («Mirá los trabajos», «Hablemos»). El logo a la derecha, de día.
- **Quiénes somos.** Tres pantallas: el titular con el subrayado y el tachado + el ≠; «El equipo» con cada foto llegando en curva
  (`LlegadaEnCurva`, x 140, y 280, escala 0,6, giro 12°, `bloqueAnimado.ts:214`); «Nosotros» con la foto del grupo. **La foto de dos
  tomas** (`quienes-somos/marco.tsx:223`, `MarcoDeDosTomas`): sobre la toma seria, la suelta se abre desde el centro con un `clip-path`
  de `inset(50% − 1px)` a `inset(0)`, curva `cubic-bezier(0.3, 0.4, 0, 1)`, 400 ms; la imagen se acerca a 1,06 en 500 ms; el rol sube
  desde abajo con un degradé (500 ms tras 250 ms; sale en 300 tras 150). Con hover, foco o toque (`aria-pressed`). Suena `foto`.
- **Portfolio** (de noche). Un acordeón de tiras: la activa abre su video, la marca de agua del cliente y la **ficha** (`Ficha.tsx`:
  fecha, qué hicimos, el problema, lo que resolvimos, lo que dice el cliente) que entra fila por fila (`SECUENCIA = {entraS 0,5,
  fichaTrasS 0,4, escalonS 0,08}`); las inactivas son lomos verticales con el nombre. La última tira es «¿El próximo sos vos?», con un
  «?» que se arma con el trazo del logo y cae rebotando 3 veces (`portfolio/signo.ts:13`). Abajo de 1024, un carrusel.
- **Demos** (de noche). Cinco plantillas como libros en abanico (`Biblioteca`) que se abren en una ventana con efecto **genie** de 60
  tiras en 560 ms (`demos/genie.ts:43-45`). El cursor se vuelve una píldora con texto sobre ellas.
- **Servicios** (papel opaco). Un escenario clavado de 4 estados que avanza **un estado por gesto** (`useGatillos`, `salto.ts`: 420 ms
  + 110 por paso, tope 900): la intro pintada, y un panel por servicio que entra en **diagonal** (7° por defecto) con su video a la
  izquierda, el nombre en dos registros («DESARROLLO / *web*»), el texto en escalera diagonal (`TextoEnDiagonal`) y un dibujo de alambre
  (el globo). Nanobots alrededor. Transición entre servicios: 2200 ms (`escenario/tiempos.ts`). Después, **el recomendador**: tres
  preguntas, un «procesando» de ~2,5 s con frases que se reemplazan, y dos tarjetas con el análisis armado con las frases del usuario.
- **El viaje** (de un CTA de servicio a su página): el papel sube 760 ms con un `clip-path`, los nanobots se apagan en 320, anochece de
  160 a 1160 ms y la cámara baja en 1500 a la composición de la página; recién ahí se navega (`esc/ruta/viajeDelServicio.ts:19-35`).
- **Tu panel** (papel opaco). El título que se pinta («El panel donde controlás **TODO**»), una palabra gigante y pálida detrás de cada
  fila (CLIENTES, RESULTADOS, CHATBOT) y una **demo viva** del panel en cada tarjeta (`_panel-vivo/`: datos que llegan solos cada 2,2–3,2 s),
  con un candado de scroll («Hacé clic para scrollear acá»). El CTA «Tu panel crece con vos.» con «Probar ahora» que respira (un apretón
  cada 3 s) y la newsletter.
- **Seis razones** (de día, clavado). La frase «Seis razones | para elegirnos» se abre alrededor del logo en volumen; los valores entran
  de a pares, tres por lado, con su ícono; se **disuelven** (suben 3 svh, 9 px de desenfoque, escalón 0,18) y aparece **el aro de las
  reseñas**: placas en la escena que giran, se frenan con el mouse y se arrastran con inercia. El título de las reseñas **se da vuelta y
  se vuelve el CTA**: «Este sitio empezó con una charla. **El tuyo también.**» → HABLANOS (con el reflejo `Reluciente` adentro de las
  letras).
- **Cierre.** «Lo que sigue lo armamos con vos», el mail, WhatsApp, el formulario. Desde 1025 el pie es de volumen: el logo cae y se
  **encastra** en su hueco, las columnas son placas que se hunden; el FAQ sale después del pie con «Scrolleá una vez más…».

## 6. El chrome: lo que está en todas partes

- **La barra** (píldora de vidrio): nace abajo en el hero y sube arriba al scrollear; en las páginas nace arriba. Resalta la sección
  actual. Vidrio = blanco 4 %, blur 20, saturación 180 %, borde blanco 8 %.
- **El cursor de la sala** (desde 1024, puntero fino, con movimiento): un núcleo de 4 px y un halo de 36 px que lo sigue más lento (t63
  de 336 y 517 ms, `_lib/cursor.ts:150-156`); crece ×1,5 en un enlace, ×2 en un botón, ×2,2 sobre el logo, y es una píldora con texto
  sobre una demo. El cursor nativo nunca se esconde.
- **El sonido**, apagado por defecto (`develop-v3-sonido` en localStorage): `tic` (0,1) al pasar por un CTA, `pestillo` (0,15) al tocar la
  barra o un CTA, `clic` (0,22) en los demás enlaces, `abre`/`cierra` en el menú, las demos y el velo, `foto` en las fotos, `exito`/`error`
  en los formularios, y un ambiente generativo («Bruma»). **Todo `Cta` nuevo suena solo**: la delegación es global
  (`_chrome/sonido/ControlDelSonido.tsx:111-128`).
- **El velo** (`_chrome/velo/velo.ts`): una banda en diagonal (entra abajo a la derecha, sale arriba a la izquierda), del color que
  contrasta con lo que tapa; tapa en 360 ms y destapa en 440 (la corta, la de por defecto), curva `cubic-bezier(0.5, 1, 0.89, 1)`.
- **El preloader**: una vez por día, ~5,7 s (bienvenida, blanco, frase, ola, latido cada 2,8 s, salida), termina con una flecha al botón del
  sonido.
- **El CTA de línea** (`_componentes/chrome/Cta.tsx`, `_estilos/cta.css`): el rótulo **se reemplaza por su copia**, que entra girada 10°
  desde abajo a la izquierda mientras la vieja sale girada 6° hacia arriba a la derecha, en 1300 ms con `ease-salida`; el subrayado son
  dos capas que corren con 100 ms de desfase. **La vuelta es instantánea** (la transición vive sólo en el hover). Mismo gesto en el
  rollover de cualquier texto (`DosCopias`).
- **Lenis**: `lerp 0.1` (`_componentes/lenisDeNk.ts:17`), sólo desde 1024 sin movimiento reducido.

## 7. Las piezas que una página nueva puede importar hoy

| Pieza | Dónde | Sola fuera del home |
|---|---|---|
| Intro + título 3D + cierre (Seis razones → CTA → pie → FAQ) | `_componentes/pagina/` | sí (con su preset) |
| `CompuertaDelHome` (enciende la coreografía) | `_secciones/CompuertaDelHome.tsx` | sí |
| `Bloque`, canales, `Gatillo`, `TituloQueSube`, `Trazo`, `SignoDistinto`, `LlegadaEnCurva` | `_secciones/_contrato/` | sí (bajo la compuerta) |
| `TituloQueSePinta`, `usePintadoAlLlegar` | `_secciones/tu-panel/`, `_secciones/servicios/escenario/` | sí (viven en una sección: conviene subirlos a `_componentes/pintado/`) |
| `TitularQueSeLevanta`, `usePresencia` | `_secciones/trabajos/portfolio/levantarse.tsx` | sí |
| `MarcoDeDosTomas` (la foto de dos tomas) | `_secciones/quienes-somos/marco.tsx` | sí |
| `Ficha`, `PROYECTOS`, `mediosDe` | `_secciones/trabajos/` | sí |
| `CarruselDeTarjetas`, `Historias` | `_componentes/carrusel/`, `_componentes/historias/` | sí |
| `DemoEnSuLugar` (8 demos del panel; el home usa 3) | `_panel-vivo/DemoDelPanel.tsx` | sí |
| La lógica del recomendador (`recomendar`, `analisis`, `avanzar`) | `_secciones/servicios/recomendador/` | sí, pura |
| `EstadoDeEnvio`, `EncajeDelLogo`, `Carga` | `_componentes/formularios/`, `_componentes/carga/` | sí |
| `Cta`, `CtaEnlace`, `DosCopias`, `Reluciente`, `AvisoDeScroll` | `_componentes/` | sí |
| `Titular`, `Cuerpo`, `Caption`, `Micro`, `EtiquetaDeSeccion` | `_componentes/tipografia/` | sí |
| `VALORES`, `RESENAS` (ficticias), `MAIL`, `WHATSAPP` | `_secciones/por-que-develop/`, `_secciones/cierre/` | sí |

**Lo que una página NO puede hacer sin tocar el home:** meter algo 3D propio en el lienzo (la única entrada es la ranura de variantes,
registrada a mano en `_variantes/registro.ts`), usar un título 3D nuevo (las fuentes de página están recortadas a 6 títulos:
`titulos3d/presets.ts:51`), declarar un id de página nuevo (`IdDePagina` es cerrado).

## 8. Lo que el sitio hace con el teléfono

- No es el escritorio apretado: abajo de 1024 la escena va en calidad compacta y detrás del texto; los títulos se levantan en vez de ser
  3D; el Portfolio y las Demos son carruseles (`CarruselDeTarjetas`, con la tarjeta siguiente asomada al 94 % y 55 %); Seis razones es una
  lista; el FAQ, un acordeón.
- Los efectos de los títulos **no se apagan** en el teléfono; sólo `prefers-reduced-motion` los simplifica.
- Hover no existe: lo que en el escritorio es hover (las fotos de dos tomas) tiene su versión con el toque.

## 9. Las reglas que se infieren

Lo que hace que esto se sienta develOP, en orden:

1. **El scroll es el reloj.** Casi nada pasa por tiempo: la luz, la cámara, los títulos, los cuerpos y el pintado siguen al scroll. Lo
   que corre por tiempo (el gatillo, el pintado al llegar, el genie) se dispara al cruzar una línea **y vuelve en espejo al subir**. Nada
   pasa «una vez y ya»: el sitio se puede rebobinar.
2. **Llega rápido, se acomoda despacio.** La curva de salida (`0.64, 0.1, 0, 1`) y los τ de la cámara. Ningún rebote elástico salvo dos
   excepciones con sentido: el «?» que cae y el «Probar ahora» que respira (los dos son *llamados*).
3. **El texto sale de su renglón.** Máscara por renglón, desplazamiento corto, sin fundidos largos. El texto está «impreso» y se destapa.
4. **Las cosas aparecen en su lugar.** Los títulos 3D llegan donde van a quedarse y se van cayendo (nunca hacia arriba). Las fotos
   llegan en curva a su marco. El logo se encastra en su hueco.
5. **Dos registros tipográficos por título.** Archivo condensada en mayúsculas pesadas + Chivo itálica liviana («TU NEGOCIO VENDIENDO /
   *las 24 hs*», «DESARROLLO / *web*», «Seis razones / *para elegirnos*»). Es la firma visual más repetida.
6. **El logo es el centro de todo.** Las cosas se ordenan a su alrededor (la frase de Seis razones se abre a sus costados; los valores,
   tres y tres; el aro gira alrededor). Sus marcas de agua forran el muro. El «?» y el encastre están dibujados con su trazo.
7. **Papel para leer, escena para mirar.** Cuando hay que leer de verdad (Servicios, el Panel), el papel es opaco y la escena duerme.
8. **La luz es el acento; la superficie, no.** De noche el acento es plasma, haz y filo; sobre papel, los oscuros. Nunca un fondo de color.
9. **El trazo dice algo.** El subrayado afirma, el tachado niega, el ≠ distingue. No hay líneas decorativas.
10. **Lo real primero.** Videos reales de los trabajos, las fotos de los dos, la demo viva del panel con datos que se mueven. Lo que falta
    va entre corchetes (`[TESTIMONIO]`), no se rellena.
11. **El sonido confirma, no adorna**: un tic al pasar, un pestillo al confirmar, apagado por defecto.
12. **Un gesto, un paso.** En los escenarios clavados (Servicios, Portfolio) un gesto de la rueda avanza exactamente un estado. El scroll y
    el mouse no se pelean.

**Lo que nunca hace:**
- No usa grillas de tarjetas iguales, íconos en círculos de color, gradientes de fondo ni sombras de «card de plantilla» sobre papel.
- No hace parallax de capas ni elementos que entran en diagonal sin motivo (la diagonal de Servicios es un corte, no una entrada).
- No hace parpadear nada (el `AvisoDeScroll` titila en opacidad, nunca en color).
- No mueve la cámara a ángulos raros: vuelve siempre al frente.
- No pone texto sobre la escena con un velo detrás: lo lee por su sombra pegada.
- No muestra cifras, premios ni clientes inventados.
- No tapa el cursor nativo, no secuestra el scroll sin avisar (el candado del panel pide un clic) y no suena sin permiso.

## 10. Lo que le falta al home y dónde se repite

**Le falta:**
- **Una voz de develOP en primera persona larga.** Todo es de a frases; no hay un lugar donde se lea una historia entera. Nosotros puede
  ser ese lugar.
- **El proceso.** El home dice qué hacen, no cómo; «Primero nos sentamos a entender… Después presupuestamos» está enterrado en el texto
  de Software.
- **Algo que se haga con las manos sobre papel** fuera del recomendador y del panel: casi todo es mirar.
- **Precios.** El FAQ promete «su precio de referencia en su página» y `PRECIOS_DESDE` no existe en esta rama.
- **Lo pendiente que ya se sabe:** Números desmontada con `[CIFRA]`; los tres videos de servicio son de El Garage; «Probar ahora» no hace
  nada; las 10 reseñas del aro son ficticias; los testimonios del Portfolio son `[TESTIMONIO]`; 5 de las 8 demos del panel no se usan en
  ningún lado; todos los CTA de servicio van a `/v3/pagina-base`.

**Se repite:**
- **El pintado palabra por palabra** está en el título del Panel, su CTA, la intro de Servicios y el recomendador (dos veces). Es el
  efecto más usado sobre papel y ya empieza a ser «el» efecto: en una página nueva conviene usarlo para UNA cosa.
- **Los títulos 3D** cargan el hero, Quiénes somos (tres veces) y Seis razones. En las páginas, uno solo (la intro) alcanza.
- **La entrada P2 + `CanalDeUnaPieza`** está en todas partes y es casi invisible: es el «fade up» del sitio.
- **El contacto** tiene seis puertas (Hablemos, Hablanos, el pie, «La tuya», el recomendador, WhatsApp del FAQ). Una página nueva no
  necesita otra: tiene el cierre.
- **La noche** se dispara dos veces en el recorrido (la gota y el final).

## 11. Para quien construya las páginas (resumen en una línea por regla)

- Una página nueva **deriva** su momento de una mecánica de §3–§6, con otro contenido. Lo que no se puede rastrear al home, probablemente
  no sea develOP.
- Un efecto por página, y que diga algo de esa página.
- En el teléfono, el mismo efecto con el toque en lugar del hover, y el levantarse en lugar del 3D.
- Todo vuelve al subir.
