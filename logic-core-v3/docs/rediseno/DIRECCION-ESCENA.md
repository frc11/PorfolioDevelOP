# Dirección de la escena · home develOP

- **Qué es esto:** el documento de decisiones consolidadas del rediseño del home. Hasta hoy estaban repartidas en seis reportes de sprint (`docs/rediseno/outputs/`) y en una conversación larga con el dueño del proyecto. Acá quedan en un solo lugar.
- **Qué NO es:** un reporte de sprint. No cuenta qué se construyó ni cómo; cuenta **qué se decidió**. El cómo vive en los reportes y en los docs de módulo de cada archivo.
- **Estado:** escrito en S7 (2026-08-20), actualizado en S9 (2026-08-22) con la elección del recorrido, en S10 (2026-08-23) con el vaciado de la escena y el fondo de rendijas, en S13 (2026-08-26) con las partículas del preloader, el escalón de exposición resuelto y la cámara de `harness.ts`, y en S14 (2026-08-26) con el reparto de tamaños de ese campo, y en SITIO-S4 (2026-08-29) con las reglas 12, 13 y 14 de §3 —los checks contra `git`, qué puede afirmar un invariante, y que los agregados se derivan—, la §6.1 de verificación y los pendientes §7.16 y §7.17, en SITIO-S7 (2026-08-30) con la compuerta resuelta una vez arriba de las ocho (§7.22) y el arreglo de raíz de `cn()` (§7.19), y en SITIO-S8 (2026-08-31) con **la mudanza de la escena a `src/app/v3/_lib/escena/`** (§6), **su montaje en `/v3` detrás de la compuerta de 1025 con el progreso atado al scroll** (§7.2), el montaje del preloader (§1) y las cifras que ese montaje volvió a medir con la sala detrás (§1.4, §7.11, §7.16, §7.28), y en SITIO-S9 (2026-08-31) con **el mapeo POR ANCLAJE construido** (§7.2, que pasa de decidido-sin-construir a construido), **el cierre de la tinta del diferencial con su número** (§7.29: 6,07:1 en p=0,750), **la escena que deja de renderizar cuando ningún panel transparente está en cuadro** (§7.34), **la decisión medida de NO diferir el SDK de Sentry** (§7.30) y tres pendientes con su medición (§7.36 el acoplamiento de tipo), y en su parada con **la regla de las instrucciones que se contradicen** (§7.37), el cierre de §7.4 y de §7.35 y las dos correcciones a §7.30. y en SITIO-S10 (2026-08-31) con **el sitio de abajo de 1025 mirado por primera vez** (§7.38), **el inventario de accesibilidad sobre el home compuesto** (§7.39), **la composición del logo contra el texto con su contraste medido** (§7.40, que corrige el alcance del cierre de §7.29), **los 44 controles positivos que `s7e` y `s10e` no tenían** (§7.33, cerrado), **el chunk de Sentry identificado por contenido** (§7.30), **el orden de los dos `rAF` medido y contrario a lo que §7.34 declaraba**, y **el costo real de §7.36**, que la propia §7.36 publicaba incompleto; y en su parada con **el ACOTAMIENTO de §7.29** —cerrado contra el fondo, no contra el cuadro—, **el banco compartido probándose a sí mismo** (§7.41) y **las nueve cifras que no se reproducen, incluida una de la propia instrucción** (§7.42). y en SITIO-S11 (2026-09-01) con **los dieciocho defectos que S10 midió, arreglados** (§7.43: quince cerrados con el instrumento que los encontró confirmándolo, y tres abiertos por decisión —la superposición del logo re-medida, el `contentinfo` con sus tres paredes y Lenis con su atribución corregida—), **el codo de `travelX` sacado** (§7.40), **`CUADROS_DE_REANUDACION` bajado a 1** con la medición de S10 citada (§7.34), **el acoplamiento de tipo cerrado** con el costo real de tres tipos (§7.36), **el aterrizaje del logo del preloader mal en un teléfono en vertical, en el sitio VIVO** (§7.44), **dos correcciones de método** —un número pedido que el arreglo correcto contradice, y `git stash` devolviendo el árbol en CRLF— (§7.45), y **lo que el sprint rompió al arreglar**: la banda de `micro` en cero, dos afirmaciones de S7 que estaban verdes por subcadena, la tercera copia de la voz única, el detector de ventana de los checks de frontera y las cinco copias de `travelX`. y en SITIO-S12 (2026-09-01) con **los tres abiertos de §7.43 ejecutados** (§7.46: el modelo del documento parchado sin mover una cifra, el defecto 15 CERRADO —hay `banner` y el `navigation` salió del `main`—, y **las decisiones de §7.43 sobre los defectos 6 y 7 ANULADAS por la medición**: la del 7 porque su premisa es falsa —la columna del Hero empieza en 188 px y la del diferencial en 32, y lo que las separa es cuánto cuadro ocupa el logo— y la del 6 porque su orden era correcto pero no suficiente: una CUARTA pared que no vio nadie —el pie afuera suma 485 px a 1440 y 746 a 375 al documento fuera de la tabla y corre el progreso del anclaje de 0,750 a 0,7201/0,6906—. **Las dos salidas nuevas quedan anotadas y sin ejecutar**: para el 7, re-anclar el diferencial al progreso donde la cobertura del logo y el contraste pasan a la vez —y si esa ventana no existe, el diferencial pasa a `papel-opaco` y se pierde uno de los tres momentos de escena—; para el 6, derivar el progreso de la EXTENSIÓN DE LAS SECCIONES en vez de `scrollHeight`, con lo que un pie afuera deja de mover nada), **`travelX` con tres de cinco copias consumiendo la fuente y §7.44 medido en los tres teléfonos** (§7.47, más el codo real de `scene-camera.ts` en 0,542855 y no 0,567), y **tres correcciones de método** (§7.48: el CRLF es de toda escritura de `git` y no sólo de `stash`, una decisión tomada con un número vuelve a pasar por el instrumento antes de ejecutarse, y 17 de 18 lanes sin check de frontera propio). y en V3-E (2026-09-03) con **los seis rojos del merge de los cuatro lanes cerrados** (§7.49), **el encuadre del hero movido con la premisa del recorte REFUTADA** —lo que fallaba era que `frameX` rota la cámara y el eje óptico apuntaba 12,834° afuera del logo—, **el ancla del diferencial DESCUANTIZADA** (defecto 7 de §7.46, CERRADO, con el costo de +0,0121 en `tu-panel` y la pérdida inevitable del AAA de la mediana declarados), **la compensación de cap height CERRADA —no se compensa— con dos premisas de la instrucción refutadas**, **los tres PNG de las capturas declarados fuera del lane y sin commitear**, y **el censo de instrumentos derivado** después de romperse tres veces. Se actualiza cuando una decisión cambia — no cuando se implementa.

> **Regla de lectura.** Lo que está acá es decisión tomada. Lo que todavía no se decidió está en §7, marcado como pregunta abierta. Si algo no aparece en ninguna de las dos partes, no está decidido: se pregunta antes de construirlo.

---

## Índice

1. [El preloader](#1--el-preloader)
2. [La animación principal](#2--la-animación-principal)
3. [Las reglas de la escena](#3--las-reglas-de-la-escena)
4. [La paleta](#4--la-paleta)
5. [Decisiones registradas para sprints posteriores](#5--decisiones-registradas-para-sprints-posteriores)
6. [Dónde vive hoy cada decisión](#6--dónde-vive-hoy-cada-decisión)
7. [Lo que todavía no está decidido](#7--lo-que-todavía-no-está-decidido)

---

## 1 · El preloader

**Construido y montado en `/v3` desde SITIO-S8** (`_intro/IntroDelHome.tsx`, import ESTÁTICO desde `page.tsx`: el overlay tiene que viajar en el HTML del servidor porque quien decide si la secuencia corre es el `<script>` pre-paint del layout raíz, que no puede esperar a un chunk). Lo que sigue es la especificación con la que se construyó — se lee para verificar, no para inventar. Lo que el montaje volvió a medir está en §1.4 y §7.11.

### 1.1 · La secuencia acordada

1. **Pantalla oscura.**
2. El logo **se dibuja con un trazo**. Recupera el gesto del preloader clásico de `main` —las fases `drawing` → `filling` de `PreloaderContext`— pero **más corto y más limpio**.
3. **Antes de que el trazo se complete**, aparecen **"develOP"** arriba y **"Ingeniería para negocios reales"** abajo, con **efecto de aparición**. No de escritura. **No de máquina de escribir.**
4. **En el instante exacto en que el trazo cierra: corte seco de color.** Sin fundido. Fondo claro, logo negro, letras negras. El corte tiene que caer en el frame preciso del cierre del trazo — un cuadro antes o después se lee como error.
5. En ese mismo momento, **el logo y las letras se alejan levemente**. Es el gesto de "presentación de empresa".
6. Las letras **desaparecen con el mismo efecto con que aparecieron**.
7. La capa del preloader **se desvanece** y aparece la escena 3D detrás.
8. El **logo 3D** —el de extrusión gruesa— toma el lugar, va a su **pose inicial** de la coreografía, y de ahí **baja al hero**.

### 1.2 · Las reglas, y por qué

| Regla | Por qué |
|---|---|
| **Sin sonido** | Los navegadores bloquean el audio antes de la primera interacción. En la primera visita —que es la única en la que el preloader corre— no sonaría. Un efecto que no ocurre justo cuando importa no es un efecto. |
| **Sin bloqueo de scroll, en ningún momento** | Ya es la regla del intro actual (`HomeIntro.tsx`): `pointer-events-none`, no toca `overflow`, no llama `lenis.stop()`, no gatea el render. El contenido del hero existe detrás desde el primer paint. |
| **Solo en la primera visita de la sesión** | `sessionStorage`, igual que hoy. |
| **Honra `prefers-reduced-motion`** | Sin secuencia: se entra directo al home. |
| **Sin automatización** | El gate del intro actual ya incluye `navigator.webdriver !== true`, así que ninguna herramienta headless lo ve nunca. No es un descuido: es lo que impide que una corrida automatizada quede esperando la secuencia entera. |

### 1.3 · Dos precisiones que evitan volver a discutirlo

- **El texto del preloader NO es el del intro de marketing.** `IntroLockupText.tsx` escribe letra por letra (`WRITE_MS`, wipe de izquierda a derecha) y su slogan es *"Construimos lo que imaginas"*. El preloader del home usa **aparición** y el slogan **"Ingeniería para negocios reales"**. Son dos piezas distintas y la de marketing no se toca.
- **El preloader es un momento cerrado.** Tiene su propio logo (SVG 2D), sube con el resto de la secuencia y desaparece; **no le entrega nada a nadie**. El paso 8 no es una continuidad medida entre el logo 2D y el 3D: es la escena que aparece detrás y arranca su propia coreografía. Esta separación es la lección de S3b y no se revierte.

### 1.4 · Las partículas, y por qué NO hay relevo (S13 · S14)

> *"Las pelotitas van apareciendo en el preloader, como en el viejo. Cuando llega el momento de desaparecer la letra, desaparece la letra, las pelotitas hacen el efecto de bajar —literalmente se van hacia abajo— y luego desaparece lo blanco. Y ahí está toda la magia: las pelotitas ya se encontraban flotando en el entorno."*

**No hace falta ningún relevo, y ésa es la decisión.** Las del intro **bajan antes** de que se vaya el blanco: esa bajada es la tapadera. Las que quedan flotando son las de la escena, que ya estaban ahí. Es el mismo truco que S8d usó con el cruce de contraste — no se resuelve la continuidad, se esconde el corte.

**El requisito que lo sostiene es uno solo, y se mide:** en ningún instante pueden ser legibles dos poblaciones distintas. Medido con el umbral de contraste de WCAG que el repo ya usa para el cruce de tinta (1,10): la última del intro deja de ser legible en **4,166 s** y la primera de la escena a los **4,275 s** — **109,3 ms de margen** (eran 110,4 con el reparto de S13; S14 lo agrandó al ralear el campo hasta 112,4, y SITIO-S8 lo remidió con la ESCENA REAL detrás: −3,1 ms, porque la línea de base construía a mano la primera mota de la escena con un color crudo sobre un papel calculado y la de verdad cruza antes). Y la escena se vuelve legible solo **25,2 ms** después de que el velo arranca, así que la salida **no podía derramarse** adentro de esa ventana: tenía que cerrar antes.

**La especie se proyecta. El TAMAÑO, no (S14).** El campo del intro **es** el de la escena —mismo generador, mismos radios, mismo sesgo, mismos colores, mismo material— proyectado por la cámara de la pose inicial. Lo propio son la semilla, la escala y la densidad, y **las tres se comprueban**: con la misma semilla las motas caerían desde exactamente los lugares donde las de la escena vuelven a estar, y eso no se lee como dos poblaciones sino como una que se teletransportó.

**Y la mezcla del intro NO tiene que ser la de la escena.** S13 se puso esa restricción de más y S14 la soltó: **la misma especie no produce la misma lectura sobre los dos fondos.** En la escena el polvo tiene paralaje, se mueve con las conchas y cae sobre un piso con bandas — se lee como atmósfera. En el intro está quieto sobre papel blanco liso: se lee como ruido de sensor. El campo del intro corre su polvo a la escala grande —**×2,05 de tamaño y 0,30 de densidad**, contra la referencia de lectura del preloader clásico— y lo único que el relevo necesitaba, que al final de la caída no quede ninguna, lo garantiza `PARTICLES_BEFORE_VEIL`.

Detalle y números en `outputs/S13-PARTICULAS.md` y `outputs/S14-LECTURA.md`.

---

## 2 · La animación principal

### 2.1 · Qué es

Una **escena 3D persistente** con el logo en un espacio abstracto. La cámara lo orbita a lo largo de **ocho pantallas de scroll**.

No es un fondo. Es la pieza principal del home: el contenido de cada sección convive con ella, ocupando el lado del cuadro que el logo deja libre.

**Desde S10 la escena tiene cinco cosas y nada más: el piso con sus marcas, la envolvente de rendijas, el sol, las partículas y el logo.** S5 la había poblado con once planos suspendidos, una retícula aérea, tres pilares y tres arcos sueltos de la marca; los cuatro se borraron. El argumento es uno solo y vale para todos: **geometría sin significado** — rectángulos negros en ángulos arbitrarios que se leen como descarte y no como arquitectura. Medido: en p=0,200 y p=0,300 un plano ocupaba el **100% del cuadro** con el logo detrás.

**El elemento principal pasó a ser el fondo.** Ver §2.6.

### 2.2 · Las ocho pantallas y los seis tramos

El progreso va de 0 a 1 y cubre 8 pantallas, así que **cada pantalla vale 0,125 exacto** y los bordes de tramo caen en múltiplos de esa fracción.

| # | Tramo | Pantallas | Progreso | Órbita | Qué hace la cámara |
|---|---|---|---|---|---|
| 1 | Hero | 1 | 0,000 – 0,125 | 0° | Reposo. Es el punto de llegada del preloader |
| 2 | Quiénes somos (dos personas) | 2 | 0,125 – 0,375 | 0° → 130° | Baja hasta el nivel del papel y orbita el tramo más amplio. **Hasta S9 el entorno le cruzaba por delante al logo; con los planos borrados eso ya no pasa** — la oclusión es 0% en todo el recorrido |
| 3 | Números | 1 | 0,375 – 0,500 | 130° → 185° | Sube y se aleja. Órbita corta, desplazamiento vertical fuerte |
| 4 | Trabajos | 1 | 0,500 – 0,625 | 185° → 195° | Casi se detiene y mira al fondo profundo. Encuadre despejado |
| 5 | Demos | 1 | 0,625 – 0,750 | 195° → 310° | Vuelve al nivel del logo y se acerca. El momento más íntimo |
| 6 | Cierre | 2 | 0,750 – 1,000 | 310° → 360° | Retroceso largo. Se clava en 0,950 para el wordmark |

**El recorrido está decidido desde S9** y es **un mix de la arquitectónica y la dramática**: distancia y encuadre de la primera —el espacio es el protagonista y el logo no llena el cuadro salvo en Demos—, altura y contraste entre tramos de la segunda. **Seis poses, una por tramo, cero relleno.** Los cuatro recorridos candidatos se conservan como material de referencia y se siguen eligiendo desde el panel.

Una regla de amplitud que S9 propuso —"ningún tramo mueve la cámara menos de 90° de órbita"— **quedó anulada**: cinco tramos que se mueven × 90° son 450° sobre una vuelta de 360.

> ⚠️ **La alternativa de dos vueltas (720°) volvió a ser posible en S10, y no se tocó.** S9 la descartó con un número: pondría cuatro poses en azimuts donde el anillo de planos limitaba la cámara a 13–15 de distancia. **El anillo ya no existe**, y remedido azimut por azimut, sin planos **no hay ninguna geometría entre la cámara y el logo en ninguna dirección**: el techo pasó de ir de 11,8 a 40 según el ángulo a ser uniforme, y lo fijan la envolvente (38) y el slider (30).
>
> O sea que **el argumento con el que se descartó el 720° desapareció**. Sigue descartado por ahora porque es una decisión de RECORRIDO y no de escena, y S10 no toca la coreografía. Queda anotado acá para que quien lo retome no arranque del número viejo.

### 2.3 · Cómo se mueve la cámara

- **Scroll con inercia.** La cámara **persigue** la pose del progreso con amortiguación, no salta a ella: cuando el scroll se detiene, la cámara sigue asentándose un momento.
- **Offset de mouse.** El puntero modula azimut y altura. Es modulación, no pose: no entra en los keyframes, así que la pose que se copia del panel sigue siendo la del track.
- **Vira en reposo.** Un balanceo lento y continuo del logo (~1°), con dos períodos inconmensurables para que no se lea como un bucle. Es lo que impide que la escena parezca congelada cuando el scroll está quieto.
- **`prefers-reduced-motion`** apaga las tres.

### 2.4 · Dónde empieza y dónde termina

- **Empieza** en la pose del hero, y se queda ahí la pantalla entera. Desde S9 la pose inicial **ES** la del hero: el recorrido ya no baja a encuadrarlo, llega encuadrado. Es lo que hace que "la cámara no se mueve apenas entrás" sea literal, y lo que le da al preloader un destino que no se mueve.
- **Termina** en el cierre: el logo se aleja y la sala se apaga.
- **Después del cierre la escena SE APAGA.** No se tapa con un bloque y no queda una franja asomando. Entran las secciones de servicios y panel.
- **Vuelve para el diferencial.**

### 2.6 · El fondo de rendijas es el elemento principal (S10)

**Dos tramas de cuadrados, superpuestas y separadas en profundidad**, sobre dos cilindros coaxiales que rodean la escena: la cámara da la vuelta entera, así que una pantalla plana solo funcionaría para un ángulo.

- **La capa fina, fija, adelante** (radio 38): la retícula a la mitad del paso, con un punto en cada cruce.
- **La capa gruesa, atrás** (radio 44): la retícula del hero, **bajando sin fin**.

**Las tramas no se inventaron: salen del vocabulario del sitio.** `HeroBackground.tsx` dibuja una retícula de cuadrados de líneas de 1 px a 4rem (64 px) y **la traslada hacia abajo en bucle**; `WhyDevelOP.tsx` usa la misma a 16/20/24/32/40 px; `DotMatrix.tsx` es el campo de puntos. El par 64/32 con la misma línea de 1 px ya existía en el sitio, y la que se mueve —hacia abajo— es la del hero.

**La separación en profundidad es la decisión.** Produce **paralaje**: al orbitar, las dos capas se desalinean solas y el moiré cambia con el movimiento además del batido de la textura. Y tiene una consecuencia que corrige un enunciado previo:

> ⚠️ **"Dos tramas al doble exacto no producen moiré" vale para tramas COPLANARES** —que es lo que hizo S7, con las dos en el mismo material— y ahí es aritmética cerrada: el término |f_fina − 2·f_gruesa| se anula. **Separadas en profundidad se rompe:** la capa de atrás está más lejos de la cámara que del eje, así que sus celdas se proyectan más chicas. Medido sobre el recorrido, con un cociente de textura de 2,040 el **proyectado va de 2,085 a 2,170**; y con el desajuste en cero —textura 2:1 exacta— el proyectado sigue en 2,053 a 2,120 y el batido existe igual. La cancelación solo ocurriría con la cámara clavada en el eje, donde nunca está.

**El desajuste es una perilla del panel**, entero, y nombra lo que produce: cuántas bandas de batido hay en una vuelta. Default 2.

**Desde S11 estas dos capas no solo se ven: PROYECTAN.** El sol las atraviesa y dibuja su trama sobre el piso y sobre el logo — ver §2.7. Ahí la separación de radios vuelve a mandar: la relación de pasos proyectados sobre el papel es (44/50)·(102/38) = **2,362**, y con el desajuste en 0 sigue en 2,316, o sea que sobre el piso el batido lo produce el paralaje casi por completo.

### 2.7 · El sol NO se ve: se ve lo que proyecta (S11)

~~El sol se ve porque el fondo es oscuro.~~ S7 leyó el problema del sol como contraste (41 puntos) y S10 lo llevó a **109 y 157** oscureciendo el fondo. **No alcanzó**: el humano lo grabó y el veredicto fue que no se lee como un sol, se lee como una mancha clara difusa. El diagnóstico no era de visibilidad.

**Un sol no es un círculo en el cielo: es una dirección de la que viene la luz.** Y sobre papel blanco no se puede AGREGAR luz, solo sacarla — que es exactamente por qué el disco no se veía. Así que S11 borró el cuerpo entero (`SunBody.tsx`, `SunWashout.tsx` y `probeSun.ts`) y dejó la dirección, que ahora **proyecta la rendija** sobre el papel, sobre las 48 marcas y sobre el logo.

**El arco no se tocó**: azimut, elevación, nivel y kelvin siguen siendo los de S9 y la narrativa sigue siendo una tarde. Es el mismo dato con otro consumidor.

**Lo que se ve es la sombra**, y tiene tres propiedades medidas:

- **Lleva el moiré adentro**, porque atraviesa las dos capas: batido de **15,3 de mundo** sobre el piso y **de 2,4 a 4,6 bandas a lo ancho del cuadro**. ~~Con una amplitud de 10,8 puntos sRGB en el hero.~~ **Ese número era prosa** (regla 11 de §3): no lo produce ningún archivo del repo. Medido con el instrumento de S12 (`__tests__/celosiaBeat.ts`), la portadora del piso en el hero vale **28,6 puntos** y el batido **23,1** sobre un tramo de cinco períodos.
- **Barre con el arco.** El patrón está anclado al azimut del sol, así que los 180° de barrido son **51 celdas de fase pasando sobre un punto fijo del piso** — 119 unidades de mundo de banda. No es una deriva: es el mismo reloj que la sombra del logo.
- **Se alarga ×3,6**, de 3,22 a 11,51 de largo, que es exactamente el factor con el que crece la sombra del logo. Las dos son 1/tan(elevación): crecen juntas o no crece ninguna.

**Y la celosía tiene alcance.** Los cilindros están abiertos arriba, así que con el sol a 36° la luz entra por encima del borde y cae sobre la parte de la losa opuesta al sol: la sombra cubre el **82% de la losa durante la meseta y el 100% desde p=0,875**. La creciente de sol abierto se cierra a medida que atardece.

### 2.7.1 · El sol tiene tamaño: la penumbra (S12)

S11 dejó la forma bien y **el material mal**: las bandas se leían como piso embaldosado, no como luz. La causa es física — **el sol no tenía tamaño angular**, así que el único ancho de borde era el del filtro de huella de píxel, que es antialias y no óptica.

**Desde S12 el sol mide 0,266° de radio** —el sol real— **y es perilla del panel** (0 … 1,5°). De ahí sale una penumbra **por fragmento**, derivada de la distancia del punto sombreado al cruce contra cada capa: `ancho = 2·tan(α)·(t/paso)·oblicuidad`, en celdas de la trama. **No hay ningún desenfoque**: se ensancha el borde de la barra, y se combina con el filtro que ya existía tomando **el mayor de los dos**, nunca la suma.

**Lo que la penumbra sí hace, medido:** el borde de la banda fina pasa a medir **0,18–0,21 celdas** de mediana en cuadro, y **varía 6,3× entre el punto del piso pegado a la celosía y el más lejano** — ésa variación es lo que distingue una sombra de una textura. Lo paga barato: el hero sube de 201 a 203,5 (techo acordado: 210), **la portadora del piso no se mueve un punto** y el batido queda dentro de ±11%.

> ⚠️ **Tres cosas del diagnóstico que la medición corrigió, y quedan escritas para que nadie las repita:**
>
> 1. **`R/cos(elevación)`, no `1/tan`.** La distancia de un punto del piso al manto **baja** con el atardecer (47,0 → 38,8 en el centro de la losa): el rayo llega antes. Lo que crece ×3,6 es la CELDA proyectada. Resultado: **la penumbra NO se ensancha al atardecer** — como fracción de la banda **se achica un 32%** (0,230 → 0,157 celdas). **El cierre no se arregla solo** — ver §7.14.
> 2. **La diferencia entre las dos capas es del 16%, no "la mitad del efecto".** En mundo la gruesa es `44/38 = 1,16×` la fina; en fracción de celda se invierte y queda **2,1× más DURA** (0,101 contra 0,209). Lo que rompe la lectura de baldosa es el **6,3× de cerca contra lejos**, que es geométrico y **no depende de α**: la perilla elige la escala, no la variación.
> 3. **La creciente de sol abierto ya tenía el borde blando.** Mide **6,1 celdas finas (14,20 de mundo) con α = 0** y lo pone `MOIRE_FADE`, no la penumbra: con el sol real **no se mueve** —14,20, o sea 0,0% al paso del barrido— y ni con α = 1° pasa de **+2,5%**.

### 2.8 · Las partículas son el relleno

Dejaron de ser atmósfera. Con la escena vacía son **lo único que ocupa el aire entre el logo y el fondo**, y lo único que da paralaje en las poses donde el cuadro es piso. De 400 reservadas / 220 dibujadas a **3.000 / 2.400**, con las dos escalas conservadas (cercanas grandes y difusas, lejanas chicas y tenues). En la pose inicial hay **1.008 en cuadro** contra 94 antes.

Se mueven con **rotación diferencial**: cada campo se parte en conchas por radio y cada concha gira a su propio ritmo, la interior más rápido. Una matriz por concha, cero costo por partícula.

### 2.5 · La luz cuenta el recorrido

La iluminación no es una propiedad de la cámara: es del espacio. Vive en dos lugares y ninguno es el keyframe.

- **Un rig de tres puntos.** La principal y el relleno son **del espacio** (fijos al mundo, así que orbitar cambia la iluminación además del punto de vista). El contraluz es **del observador** (solidario a la cámara), porque el problema que resuelve —que el logo se despegue del fondo que le toque detrás— es un problema de vista.
- **Un arco ligado al progreso.** Meseta a luz plena hasta el final de Números —a una sección que alguien está leyendo no se le baja la luz—, un escalón chico en Trabajos y Demos, la caída real en el cierre, y la última pantalla en penumbra.
- **El sol barre 180°, y ese barrido lo fijó el recorrido.** Con la cámara orbitando 360° y leyendo contenido en seis azimuts, el ángulo entre la luz y el observador recorre media vuelta sí o sí: el contraluz cae en algún lado. Está puesto donde el recorrido lo pide —el fondo de Demos, con la cámara abajo mirando hacia arriba— y desde ahí la escena va cada vez más a contraluz hasta el final. **Eso es atardecer.** El sol entra en cuadro al empezar Demos y se pone dentro del encuadre.
- **El arco es una TARDE, no un día entero.** Se evaluó arrancar con el sol rasante y subirlo hasta Números, y no se puede: con `nivel = sin(elevación)/sin(36°)`, un sol bajo en el hero deja la sala en nivel 0,26–0,35, o sea que el home arrancaría más oscuro que su propio cierre.
- **El apagado no es plano.** El ambiente muere antes que las fuentes y el contraluz se resiste: la sala **gana contraste** al apagarse en vez de volverse gris.
- **El sol ES la luz principal**, no una representación de ella. El mismo dato dice dónde está la fuente que se ve, de dónde viene la luz y desde dónde cae la sombra. Los tres se mueven juntos o no se mueve ninguno.
- **Y los dos recorren un arco: el paso del día.** El nivel de luz no es una perilla que baja — es el seno de la elevación del sol. La sala no se apaga porque bajamos un número: se apaga porque atardece. La sombra del logo se alarga y gira con él, que es lo que más comunica que el espacio es real.

---

## 3 · Las reglas de la escena

Son las que hacen que la escena sea de develOP y no de cualquiera. No son preferencias: son el filtro con el que se acepta o se rechaza cualquier elemento nuevo.

1. **Blanco y negro.** Sin luces de color. Base clara `#F7F7F5`, tinta `#111111`.
2. **Nada de iconografía de tecnología.** Ni nodos de red, ni circuitos, ni burbujas de chat, ni ventanas de navegador, ni pantallas, ni engranajes, ni cerebros. Es el imaginario por defecto de "tecnología" y es exactamente lo que este proyecto evita.
3. **Nada orgánico.** Sin rocas, terreno, agua ni vegetación.
4. **Nada brilla por sí mismo.** Todo responde a las mismas luces, así que la sala entera se apaga con el cierre. ~~La única excepción es el sol.~~ **Desde S11 la regla no tiene excepciones**: el sol era la única y ya no hay ningún cuerpo que la pida.
5. **Nada compite en peso visual con el logo.** El logo es el único negro puro del cuadro.
6. ~~**La cuña de adelante queda libre.**~~ **Sin objeto desde S10:** no queda ninguna masa suspendida que pudiera meterse entre la cámara y el logo. El instrumento que lo medía sigue en el repo (`__tests__/occlusion.ts`) con su lista de ocluyentes vacía y **un control positivo** que verifica que sabría detectar uno — sin eso el chequeo quedaría verde por vacío.
7. ~~**El fondo de una pose es el azimut opuesto al de su cámara.**~~ Era el corolario de la anterior, y con la envolvente el fondo es el mismo en toda la vuelta por construcción. Lo que sí cambia con el azimut es el paralaje entre las dos capas, que es el efecto.
8. **Sin tipografía en la escena 3D.** Sumar una fuente es sumar un activo y una dependencia. La escala graduada del piso da la unidad de medida sin escribir un número.
9. **Los patrones del fondo salen del vocabulario propio.** Retículas, tramas de rendijas y campos de puntos: lo que el sitio ya usa, leído en el repo. No se importan referencias de afuera. Ver §2.6.
10. **Nada de geometría sin significado.** Es la regla que S10 destiló al borrar cuatro familias de una vez: si una pieza solo "ocupa espacio con intención", se lee como descarte. Todo lo que quedó tiene una razón nombrable — el piso da escala y ancla, la envolvente es el fondo con vida, el sol es la fuente que se ve, las partículas son el aire.
11. ⚠️ **UNA CIFRA QUE SE PUBLICA EN UN REPORTE Y NO TIENE INSTRUMENTO QUE LA PRODUZCA ES PROSA, NO MEDICIÓN.** Regla del proyecto desde S12, y no es de estilo: si más adelante hay que comparar contra ella, no se puede; si hay que defenderla, tampoco. **El caso que la obligó** son los cuatro números de amplitud de batido de S11 —10,8 / 7,1 / 13,1 / 6,5 puntos sRGB— que viven en la prosa de `outputs/S11-LUZ.md` §4.2 y en un string de `s11-celosia.invariant.ts`, y que **ningún archivo del repo produce**: su commit no agregó un solo script que los calcule. S12 los reemplazó por los de `__tests__/celosiaBeat.ts`, que sí tiene método declarado —tramo, ventana, muestreo— y control positivo. La regla se cumple escribiendo el instrumento **antes** de escribir el número, no después. **El inventario de lo que quedó sin instrumento está en `outputs/S12-PENUMBRA.md` §8.1** —el peso del canvas, los triángulos y draw calls, los MFLOP, la comparación con el mapa de sombras, el grano de papel y la tabla de los haces—: **auditado con `grep` sobre las veinte suites y NO re-medido**, que es trabajo del sprint que lo necesite. El caso más engañoso de esa lista es la tabla de los haces: **tiene chequeo pero no tiene productor** —los dos checks que la leen validan su forma contra sí misma— así que parece instrumentada y no lo está.
12. ⚠️ **UN CHECK QUE COMPARA CONTRA `git` MIDE EL MOMENTO DEL SPRINT, NO EL CÓDIGO.** Regla del proyecto desde S4 del sitio, y es una clase de defecto, no un caso. **El caso que la obligó:** cinco afirmaciones de `s3-frontera.invariant.ts` —"git status ve 0 de los 35 archivos del sprint", "0 rutas tocadas", "el único token nuevo es la corrección declarada — obtenido `[]`", "0 scripts nuevos", "0 instrumentos incluidos en la cuenta"— fallaron al correr los tres sprints juntos. **Ninguna estaba rota:** las cinco comparan el árbol de trabajo contra `HEAD`, y commiteado y mergeado el diff es **vacío por construcción**. Tenían fecha de vencimiento y nadie la había declarado. Cómo se cumple, en tres partes:
    - **Se separan las dos naturalezas, explícitamente.** *Invariantes permanentes* = propiedades del código, se leen del disco, corren siempre y entran en el agregado. *Checks de frontera* = propiedades del momento, comparan contra `git`, **corren antes del commit, en su propio script, y NO entran en el agregado**. Mezclados, los segundos arrastran a los primeros: al mergear, cinco afirmaciones de momento tiraron abajo el archivo entero, incluidas las siete que sí eran del código. En el repo hoy: `s3-codigo.invariant.ts` (permanente) contra `s3-frontera.invariant.ts` (frontera), y `npm run test:frontera` aparte de `npm run verificar`.
    - **Cada check de frontera declara su ventana en su propia salida.** Cuando detecta que su base ya está en `HEAD` no falla: usa `noCorre()` —`afirmar.ts`—, que **imprime que no corrió y por qué**, lo cuenta aparte del total y sale en cero. La ventana la decide `evaluarVentana()` (`s4-ventana.ts`) contra un testigo declarado: las rutas cuyo diff el check necesita.
    - ⚠️ **"No aplica" NO puede pasar en verde silencioso.** Un verde indistinguible entre "verifiqué" y "no había nada que verificar" es exactamente el modo de falla que este proyecto viene cazando desde S10, y apagar el check sería la forma más limpia de introducirlo. Por eso el detector de ventana tiene su propio invariante permanente —`s4-ventana.invariant.ts`— que afirma las dos direcciones: que dice DENTRO cuando hay base y FUERA cuando no. Un detector que dijera siempre "fuera" apagaría el check para siempre **y la salida se vería igual de bien**.

    **Con siete lanes por venir, cada uno va a dejar los suyos.** El lane que escriba un check contra `git` lo pone en su propio archivo desde el principio; el nombre `test:<lane>-frontera` tiene que estar declarado en `CHECKS_DE_FRONTERA` (`s4-suites.ts`) o la derivación de suites **falla** — no se lo excluye del agregado por adivinanza.

    ⚠️ **COROLARIO DESCUBIERTO EN SITIO-S9: EL DETECTOR DE VENTANA NO SABE DE QUIÉN ES EL DIFF.** `evaluarVentana()` abre la ventana cuando alguno de sus testigos aparece en `git status`, y eso es correcto mientras el único que pueda tocar esos archivos sea el sprint que los declaró. **Deja de serlo en cuanto un sprint posterior toca uno.** SITIO-S9 editó dos archivos del padrón de S3 —`s3-tokens.invariant.ts` y `_estilos/navegacion.css`, los dos con razón declarada— y con eso `test:s3-frontera` **se despertó**: 2 de sus 35 testigos sin commitear, ventana ABIERTA, y sus afirmaciones de momento evaluadas contra un árbol que no es su base. Falló por dos cosas que son ciertas y ajenas: que S9 tocó archivos que S3 declaraba prohibidos **para S3**, y que el token que S3 declaraba como su única alta ya está en `HEAD` hace cinco sprints.

    **No es un rojo que haya que arreglar en el momento, y por una razón que vale escribir: se apaga solo al commitear.** Un check de frontera mide el árbol de trabajo contra `HEAD`; con el trabajo adentro de `HEAD`, `git status` queda limpio, `vistos` queda vacío y el check vuelve a `noCorre`. **Lo que el rojo dice, leído bien, es «este árbol de trabajo no es mi momento» — que es exactamente lo que un check de frontera existe para decir.** Lo que le falta es poder decirlo con esas palabras en vez de con dos afirmaciones en rojo.

    **El arreglo exacto, para el sprint que lo tome, y no es una heurística:** los testigos de `s3-frontera` son ALTAS —lo dice su propio comentario—, así que **el discriminador es si existen en `HEAD`**. Si todos existen, el sprint ya se commiteó y la ventana está cerrada para siempre, tocara quien tocara el archivo hoy. Un `git cat-file -e HEAD:<ruta>` por testigo lo decide sin adivinar. Mientras tanto: **`npm run test:frontera` puede quedar rojo por trabajo legítimo de OTRO sprint, y se verifica volviendo a correrlo después del commit.**
13. ⚠️ **UN INVARIANTE AFIRMA LO QUE SU SPRINT CONTROLA. LO QUE HEREDA SE PUBLICA CON ATRIBUCIÓN Y SE VIGILA, PERO NO SE AFIRMA.** Regla del proyecto desde SITIO-S4, y es la **segunda vez** que el mismo error de diseño aparece — por eso deja de ser un caso y pasa a ser regla. **El caso:** `s3-peso.invariant.ts` afirmaba que la carga inicial de `/v3` no crecía más de 1 KiB gzip ni sumaba archivos contra la línea de base de S1. Falló al mergear —424,0 contra 422,0 KiB gzip, 25 archivos contra 24— y **la falla era legítima: el número había crecido**. Pero ese número no era de S3: de los 25 archivos, **24 son heredados del layout raíz** —el chrome viejo, compartido con el home, que esos sprints tienen prohibido tocar— y **1 es propio de `/v3`**, que no se movió. El invariante estaba puesto a fallar por algo que su sprint no produce ni puede arreglar, y **un check así no protege: entrena a ignorarlo.** Las tres partes:
    - **La afirmación es sobre lo propio**, con su umbral y su control positivo. **S1 ya lo hacía bien** y es el modelo a copiar: `bundle.invariant.ts` afirma `lo PROPIO de /v3 < 30 KiB` y deja el total como cifra impresa con su veredicto. `s3-peso` no copió esa forma, y ése fue todo el defecto.
    - **Lo heredado se publica con atribución**: cuánto es, de quién es y por qué este sprint no puede tocarlo. Una cifra sin dueño se lee como responsabilidad de quien la imprime.
    - **Y se vigila con una línea de base de regresión**, que no es un objetivo: existe para que lo heredado no engorde en silencio. ⚠️ **La línea de base no puede depender del estado de hoy.** La de `s4-heredado.invariant.ts` escala con las rutas de demo que existan en el build —`base + N × techo por ruta`—, así que borrar una la baja y agregar una la sube; no hay que tocarla nunca.
    En el repo: `s3-peso.invariant.ts` §1 (lo de S3) contra `s4-heredado.invariant.ts` (lo heredado, que es del sistema y de ningún sprint).

14. ⚠️ **UN AGREGADO DE INVARIANTES SE DERIVA, NO SE LISTA.** Regla desde SITIO-S4. **El hallazgo que la obligó es peor que un check en rojo:** `test:s3-peso` existía como script, tenía su archivo, y **no estaba en la cadena de `test:s3`**. Nunca corrió en ningún agregado y nadie lo notó — **un check en rojo se ve; un check que no está en ninguna cadena no se ve nunca.** Una lista escrita a mano no se queja de lo que le falta. La suite ahora sale de `package.json` (`s4-suites.ts`): un script `test:sN-loquesea` entra al agregado por existir. Los dos agujeros que quedan tienen su guardia en `s4-cobertura.invariant.ts`: un **archivo** de invariante sin ningún script que lo corra —invisible desde `package.json`, así que se busca en el disco— y un **agregado que vuelva a encadenar con `&&`**. Corolario, y es la mitad de la regla: **derivar destapó el problema que listar escondía.** El primer agregado derivado corrió `s3-peso` por primera vez, y ahí apareció la regla 13.

---

## 4 · La paleta

| | valor | qué es |
|---|---|---|
| papel | `#F7F7F5` | el piso y el ciclorama. Es `--color-ds-light-bg` del sistema |
| tinta | `#0F0F0F` | el logo. El único negro puro |
| niebla y fondo | `#EFEFEC` | un escalón por debajo del papel, para que el fondo lejano CIERRE en vez de abrirse |
| envolvente | `#3E3E40` | las dos capas de rendijas, a opacidad 0,45 con el hueco al 18% |
| marcas de piso | `#D7D7D5` / `#E6E6E3` / `#CFCFCC` | registro, marco exterior, cintas |
| partículas | `#5A5A57` → `#DCDCD9` · `#B9B9B4` | polvo cercano → lejano · bokeh |

~~masa oscura `#191917`~~ y ~~estructura aérea `#3A3A35`/`#2A2A26`~~ **se fueron con S10**, junto con los objetos que las llevaban.

### 4.1 · El balance de negro, y el pendiente que S11 cerró

Los planos eran la única masa oscura: el 30% al 49% del cuadro según la pose. Sin ellos **la tinta que queda es solo el logo, entre el 2,8% y el 23,2%**, y el valor medio del cuadro sube entre 45 y 113 puntos. La envolvente lo recupera en parte:

| pose | HOY (con planos) | vaciada | con la envolvente |
|---|---:|---:|---:|
| hero | 144 | 233 | **224** |
| quiénes somos | 125 | 207 | **179** |
| números | 189 | 235 | **230** |
| trabajos | 213 | 228 | **215** |
| demos | 52 | 165 | **138** |
| cierre | 74 | 132 | **120** |

*(Valor medio del cuadro sobre 255, medido con el shading real de three. Las partículas suman otros 7 a 8 puntos de bajada.)*

> ⚠️ **Se aceptó la escena más clara, y hay un techo que ninguna perilla del fondo levanta.** En el hero y en Números el cuadro es **60% y 73% PISO**, así que la envolvente apenas aparece. Se probó una envolvente el doble de pesada: arregla las tres poses bajas y **casi no mueve las dos altas**, o sea que separa más los extremos.

#### El techo era de EXPOSICIÓN, no de fondo (S11)

**El piso está sobreexpuesto y eso lo explica todo.** Medido: el papel a luz plena da **249,4/255** y su propia sombra dura —la del logo, que apaga la key entera— da **236,9**. **Doce puntos y medio es TODO el rango** que una sombra proyectada puede usar mientras el cielo esté abierto, porque la key es el 46% de la irradiancia del piso y `NeutralToneMapping` comprime todo lo que pasa de 0,76 lineal. El mismo aplastamiento se come las marcas: `#D7D7D5` sobre papel iluminado queda a **3,7 puntos** de él.

Por eso la proyección sola no alcanzaba: hero 216 → 211, Números 222 → 219.

**Lo que lo abre es que la celosía no tapa solo al sol: tapa el cielo.** El hemisférico de esta escena se llama, literalmente, *"el cielo del estudio y el rebote del papel"*, así que está afuera de la rendija igual que el sol. El relleno (*"el rebote de la sala"*) y el contraluz (*"solidario a la cámara"*) están adentro y no se tocan.

| | a luz plena | en sombra | rango |
|---|---:|---:|---:|
| S10 (cielo abierto) | 249,4 | 236,9 | **12,5 puntos** |
| **S11 (cielo tapado)** | **248,3** | **218,7** | **29,6 puntos** |

El alto casi no se mueve y la sombra baja 18: es lo que hace una fotografía. Y con eso los seis valores medios quedan:

| pose | S10 | **S11** | Δ | del piso en sombra |
|---|---:|---:|---:|---:|
| **hero** | 216 | **201** | −15 | 67% |
| quiénes somos | 172 | 166 | −6 | — |
| **números** | 222 | **213** | −9 | 53% |
| trabajos | 208 | 185 | −23 | 66% |
| demos | 136 | 129 | −7 | — |
| cierre | 120 | 104 | −16 | 76% |

> ⚠️ **El factor de cielo es una CONSTANTE, no una oclusión posición a posición.** Ω —la fracción de la irradiancia del hemisferio que la celosía intercepta— sale de integrar el hemisferio contra la geometría de `probeMoire.ts`, una vez, al cargar el módulo: **no hay ningún número escrito a mano**, y si cambian los radios o las bandas se mueve solo. La forma cerrada es `cielo = 1 − Ω·(1 − (1−cobertura)²)` con **Ω = 0,4366 → cielo = 0,6743**, y su acuerdo con la integral numérica es de **3,9/1000 en el peor punto del slider**. Se evalúa en el CENTRO de la losa; en el borde Ω sube a 0,5413 (**±24%**), y ésa es la simplificación que se acepta a cambio de no correr una integral de hemisferio por píxel.

**Dos consecuencias que no se buscaron.** La sombra propia del logo gana los mismos 18,2 puntos de profundidad sin tocar el shadow map — nunca fue un problema de celosía, era el mismo aplastamiento. Y **las 48 marcas se despiertan**: `#D7D7D5` está a 5,0 puntos del papel en la luz y a **30,3 adentro de una banda**, o sea seis veces más. El **67% al 82%** del replanteo en cuadro cae bajo una banda en las cuatro poses que lo muestran. No se agregó contraste: se destapó el que ya estaba.

Los acentos de servicio (cian, verde, ámbar, violeta) **no entran en la escena del home**. Su lugar está en las páginas internas — ver §5.2.

---

## 5 · Decisiones registradas para sprints posteriores

Ninguna de estas se construye todavía. Están acá para que cuando se construyan no haya que volver a decidirlas.

### 5.1 · Efecto "Star Wars" para la sección de trabajos

Espacio profundo con estrellas, y **los proyectos emergiendo desde el fondo hacia la cámara, uno por uno, cada uno con su nombre**.

**Reemplaza a una grilla de portfolio.** Es la decisión de fondo: una grilla muestra todo a la vez y ordena por posición; esto muestra de a uno y ordena por tiempo, que es lo que un recorrido con scroll ya está haciendo.

### 5.2 · El logo con el acento de cada servicio

En las páginas internas, el mismo objeto con distinta piel según dónde estás: **azul en web, verde en IA + automatización, violeta en software.**

**Por qué importa:** convierte el código de color en **estructura**, no en decoración. Hoy los acentos son un color por landing; así pasan a ser una propiedad del objeto que ya sostiene la marca.

Los valores son los que el `CLAUDE.md` ya congela: Web `#06b6d4` · IA `#10b981` · Automatización `#f59e0b` · Software `#8b5cf6`.

### 5.3 · Menú de posición variable

El menú cambia de lugar según la sección, **con una condición**: que el cambio **responda a la composición** —si el logo ocupa un lado, el menú va al otro— y **no sea arbitrario**.

Es una condición, no un detalle: un menú que se mueve sin regla es un menú que se perdió.

### 5.4 · Plan de lanzamiento

**Se lanza con el home solo.** Las páginas internas se desarrollan después, respetando el patrón pero **con movimientos y escenas propias**.

---

## 6 · Dónde vive hoy cada decisión

**Vive en dos lugares desde SITIO-S8, y la partición no es de archivos sino de naturaleza.** La ESCENA —lo que el home renderiza— vive en `src/app/v3/_lib/escena/`; el PANEL DE CALIBRACIÓN —lo que sólo sirve para calibrarla— se quedó en `src/app/probe-escena/_components/`, junto con sus invariantes en `src/app/probe-escena/__tests__/`. `/probe-escena` sigue siendo una ruta interna con `noindex` y sin un solo link entrante, y tiene fecha de baja. En las filas de abajo `escena/` = `src/app/v3/_lib/escena/` y `_components/` = `src/app/probe-escena/_components/`.

**El home vivo se tocó una sola vez y está declarado:** `src/app/layout.tsx` le pide el gate pre-paint al módulo real (`home-intro/introBoot`) y no al barril, que vivía en el grupo de chunks de la página del home y arrastraba 71,4 KiB gzip a toda ruta. `s8-diferido` afirma que la desviación es exactamente esa.

| Decisión | Archivo |
|---|---|
| **El recorrido definitivo** y el arco de luz | `escena/choreography.ts`. Lo sirve al home `escena/pistaDelHome.ts`, que construye la pista con `buildTrack` sobre `CHOREO_KEYFRAMES` **sin una segunda fuente del recorrido** — el editor no se mudó, así que los catorce miembros del panel tiran a propósito |
| Los comentarios de cada keyframe (se editan **ahí**, no en el array) | `choreographyNotes.ts` |
| El recorrido calibrado a mano, conservado como referencia | `variantCalibrada.ts` + `variantCalibradaNotes.ts` (+ `choreographyNotesFrontal.ts` y `choreographyNotesGiro.ts`) |
| Las tres propuestas de S7 | `choreographyVariants.ts`, `variantIntima.ts`, `variantArquitectonica.ts`, `variantDramatica.ts` |
| Los comentarios de las propuestas | `variantNotes.ts` |
| Dónde cae el logo en pantalla — lo que el preloader lee | `src/lib/scene-framing.ts` |
| El rig de tres puntos y cómo se apaga cada luz | `escena/probeLighting.ts` |
| El sol — que es la luz principal, y **solo una dirección** | `LIGHT_ARC` (en `escena/choreography.ts`) y `escena/lightRig.ts`. ~~`probeSun.ts`, `SunBody.tsx`~~ **borrados en S11** |
| Niebla, shadow map y oclusión de contacto | `escena/probeAtmosphere.ts` (+ `escena/ContactOcclusion.tsx`) |
| **La envolvente de rendijas**: las dos capas, el desajuste y el batido | `escena/probeMoire.ts` + `escena/moireTextures.ts` (los generadores) + `escena/MoireScreen.tsx` |
| ~~El washout del sol~~ | ~~`SunWashout.tsx`~~ — **borrado en S11 con el cuerpo** |
| **La celosía**: qué luces tapa, la barra y el factor de cielo | `escena/probeCelosia.ts` — de acá sale `celosiaSkyFactor`, que el rig del intro lee para terminar en el mismo ambiente con el que la escena empieza (§7.11) |
| La geometría de la proyección — y el gemelo en TypeScript del shader | `escena/celosiaGeometry.ts` (+ `escena/celosiaPenumbra.ts`, el ancho de borde por fragmento de S12) |
| El GLSL del gobo y el parche del chunk de three | `escena/celosiaShader.ts` |
| ~~El espacio: planos suspendidos, retícula aérea, pilares~~ | ~~`probeArchitecture.ts`~~ — **borrado en S10**, con `LogoFragments.tsx` |
| Las marcas de replanteo del piso | `escena/floorMarks.ts` (+ `escena/StudioFloor.tsx`, que las dibuja) |
| La física: inercia, mouse, vira, deriva del aire | `escena/choreographyPhysics.ts` |
| El editor de keyframes y el export | `choreographyEditor.ts`, `choreographyExport.ts` |
| El intro — el mismo componente en las dos casas | `src/components/layout/HomeIntro.tsx`, montado en el home vivo y, desde SITIO-S8, en `/v3` por `src/app/v3/_intro/IntroDelHome.tsx` (import ESTÁTICO: el overlay viaja en el HTML del servidor). El gate pre-paint del layout raíz pide `home-intro/introBoot`, no el barril — el porqué está en `carga-diferida/contrato.ts` |
| Las partículas: los dos campos, las conchas y el recorte de `gl_PointSize` | `escena/probeParticles.ts`, `escena/DepthParticles.tsx`, `escena/BokehParticles.tsx` (+ `escena/particleTextures.ts`) |
| **Las partículas del PRELOADER**: la especie, el campo proyectado y su ritmo | `home-intro/introParticles.ts`, `introParticleField.ts`, `introParticleTiming.ts`, `IntroParticleCanvas.tsx`, `introParticleSprites.ts` |
| El COLOR de una mota del preloader — la rampa y su cuantización para el teñido | `home-intro/introParticleTint.ts` |
| La cámara de la escena sin three, y la proyección de un punto cualquiera | `src/lib/scene-camera.ts` |
| El rig del intro — y el ambiente en el que TERMINA, que es el de la escena | `home-intro/introRig.ts` |
| Las comprobaciones estáticas — en dos lugares desde SITIO-S8 | `src/app/probe-escena/__tests__/*.invariant.ts` (S7 a S12: la escena calibrada) + `src/app/v3/_lib/escena/__tests__/` (`s8-escena`, `s8-tinta`, `s8-tres`: la escena MONTADA) + `src/app/v3/_intro/__tests__/` (`s8-intro`, `s8-relevo`: el intro con la sala detrás). Los instrumentos compartidos —`harness.ts`, `frameProbe.ts`, `shading.ts`— se quedaron del lado del probe y los de `/v3` los importan de ahí |
| El instrumento de oclusión y cono libre — con su lista de ocluyentes **vacía** | `__tests__/occlusion.ts` |
| El instrumento de tinta, shading y muestreo de cuadro (S10, ampliado en S11 con el gobo y el cielo) | `__tests__/logoInk.ts`, `shading.ts`, `frameProbe.ts` |

| Reporte | Qué decidió |
|---|---|
| `outputs/PROBE-ESCENA.md` | Que el logo aguanta la órbita. El objeto mate contra el cromado del hero |
| `outputs/S4-RIG.md` | Los keyframes, la física, el ciclorama, la extrusión gruesa |
| `outputs/S5-EDITOR.md` | El editor y el espacio arquitectónico |
| `outputs/S6-LUZ.md` | La luz, la atmósfera y la coreografía calibrada |
| `outputs/S7-ESCENA.md` | El sol, el moiré, la curvatura de los tramos y las variantes |
| `outputs/S8-PRELOADER.md` + `S8b/S8c/S8d` | El preloader, el trazo y el acomodamiento |
| `outputs/S9-COREOGRAFIA.md` | **El recorrido definitivo**, el borrado de los derivados y el reapuntado del sol |
| `outputs/S10-FONDO.md` | **El vaciado de la escena**, la envolvente de rendijas, el sol contra el fondo oscuro y las partículas como relleno |
| `outputs/S11-LUZ.md` | **El borrado del cuerpo del sol**, la celosía proyectada sobre el piso y el logo, y el techo de exposición del papel |
| `outputs/S13-PARTICULAS.md` | **Las partículas del preloader sin relevo**, el escalón de exposición resuelto y la cámara de `harness.ts` |
| `outputs/S14-LECTURA.md` | **El reparto de tamaños del campo del intro**: menos motas y más grandes, contra la escala de lectura del preloader clásico |

> ⚠️ **Exportar no es guardar.** El botón del editor copia al portapapeles. La calibración solo existe cuando ese texto se **pega** en el archivo. Ya costó una sesión entera de trabajo.

### 6.1 · Cómo se corre la verificación (SITIO-S4)

| qué | comando |
|---|---|
| **La compuerta de cierre** — `package.json`, `tsc --noEmit` y todos los agregados, en orden y **sin `&&`** | `npm run verificar` |
| **Los checks de frontera** — miden el momento del sprint. **Van ANTES del commit** y no entran en el gate (ver §3.12) | `npm run test:frontera` |
| Un agregado suelto | `npm run test:s1` · `test:s2` · `test:s3` · `test:s4` · `test:s5` · `test:s6` · `test:s7` · `test:s8`. **La lista de arriba es prosa: la suite real se DERIVA de `package.json` (`s4-suites.ts`)**, así que un `test:sN-loquesea` nuevo entra al agregado por existir y esta fila puede quedar corta sin que nada falle — se lee, no se afirma |
| Un invariante suelto | `npm run test:<suite>-<nombre>` |
| **Regenerar el pedido de contenido** tras cambiar un `PEDIDO` | `npm run test:s7-pedido -- --escribir` |

> Los pasos de `verificar` son **cinco** desde SITIO-S7, no cuatro: entre el `package.json` y `tsc` entra el paso **1b**, que busca marcadores de conflicto en **todo el repo**. El paso 1 miraba sólo el archivo que un merge había roto; con dos lanes mergeándose, un marcador sin resolver adentro de un `.md` o de un `.css` no rompe el build, no rompe los tipos y se commitea igual. **Excluye `s4-fixtures/`**, que guarda marcadores a propósito como control positivo, y hay una comprobación que exige que los siga guardando — una exclusión que sobrevive a su razón es un agujero que parece una decisión.

> ⚠️ **EL BUILD NECESITA LAS DOS VARIABLES. NINGUNA ALCANZA SOLA.**
>
> ```powershell
> $env:CIRCLE_NODE_TOTAL = "2"; $env:NODE_OPTIONS = "--max-old-space-size=6144"; npm run build
> ```
>
> **Y no correr NADA al lado**: el build tarda entre 6 y 9 minutos, y con otro proceso encima se cae por memoria.
>
> ### La corrección de la corrección (SITIO-S7, 2026-08-30)
>
> Este bloque decía que `--max-old-space-size` era **el flag equivocado** y que lo que arreglaba el OOM era acotar los workers. **Eso era media verdad, y la mitad que faltaba importa:** con `CIRCLE_NODE_TOTAL=3` y **sin** `NODE_OPTIONS`, el build **muere igual** — se queda en el límite de 2 GB que Node se pone por defecto. Está medido en este sprint.
>
> Las dos variables arreglan cosas distintas y por eso hacen falta las dos:
>
> | variable | qué arregla |
> |---|---|
> | `CIRCLE_NODE_TOTAL=2` | **que los workers no se pisen.** Es 1 en vez de 15, así que la RAM de la máquina alcanza. |
> | `NODE_OPTIONS=--max-old-space-size=6144` | **que cada worker no reviente por su cuenta.** El defecto de Node ronda los 2 GB y el grafo de este proyecto no entra. ⚠️ **SITIO-S8 lo bajó de 8192 a 6144 y de `CIRCLE_NODE_TOTAL=3` a `2`**: con tres procesos autorizados a 8 GB en una máquina de 16 la sesión se congelaba por paginación. Con 6144 el build cierra. |
>
> ⚠️ El párrafo anterior tenía razón en el diagnóstico —el problema es el reparto— y se equivocó al concluir que el heap sobraba. Lo que había pasado es lo que su propio cierre declaraba como no aislado: **la corrida buena llevaba las dos, y se le atribuyó el mérito a una sola.** La regla de método que queda: *cuando dos cambios entran juntos y uno funciona, no se sabe cuál fue; escribir "es éste" es una hipótesis, y hay que decirlo así hasta aislarlo.* Acá el aislamiento se hizo al revés —sacando una— y dio la respuesta.
>
> ### La tercera corrección: `0xC0000142` NO es OOM del heap (SITIO-S8, 2026-08-31)
>
> Este bloque venía afinando el reparto de memoria de los workers, y con razón. **SITIO-S8 se topó con un modo de falla distinto que se le parece y no lo es**, y conviene distinguirlos antes de volver a mover una variable.
>
> **La firma.** El compilado termina limpio —`✓ Compiled successfully in 2.1min`, 104 chunks escritos— y el build muere después, en `Collecting page data using 1 worker`, con:
>
> ```
> ⨯ Next.js build worker exited with code: 3221225794 and signal: null
> ```
>
> `3221225794` es `0xC0000142` = **`STATUS_DLL_INIT_FAILED`** de Windows. **No es `FATAL ERROR: … out of memory` de V8**, que es lo que tira un heap chico: es el sistema operativo que no pudo inicializar las DLL del proceso worker. Subir `--max-old-space-size` no lo arregla, y bajarlo tampoco: el worker no llega a correr.
>
> **La causa, medida en el momento de la falla:**
>
> | | |
> |---|---:|
> | RAM total | 13,9 GB |
> | **RAM libre** | **0,5 GB** |
> | memoria comprometida | **48,4 GB de 55,9** |
>
> Con medio giga libre el sistema no tiene con qué mapear las DLL de un proceso nuevo. **Es el mismo problema de fondo que este bloque ya documenta —el reparto de memoria de la máquina, no el heap de un proceso— con otra cara y otro mensaje.**
>
> ⚠️ **La causa probable que quedó sin cerrar, y hay que mirarla primero:** había **34 procesos `node.exe` colgados de dos días antes**, ninguno de la sesión que corría el build. Entre todos sumaban 21 MB de working set —o sea que estaban paginados— pero **cada uno conserva su reserva de espacio de direcciones y su parte de la memoria comprometida**, que es justamente el recurso que se agotó. No se los mató: no eran de esta sesión y podían ser de otra corriendo sobre el mismo checkout. Quien retome esto **empieza por ahí**: `Get-Process node | Where StartTime -lt (Get-Date).Date` y ver si son zombies.
>
> **Qué hacer cuando aparece, en orden.** (1) Mirar si es `0xC0000142` o un `FATAL ERROR` de V8 — **son dos problemas distintos y la variable que arregla uno no toca al otro**. (2) Si es `0xC0000142`: medir la RAM libre y los procesos colgados **antes** de tocar `NODE_OPTIONS`. (3) Reintentar: la corrida que cerró en SITIO-S8 fue el segundo intento con los mismos valores, sin cambiar nada más que el momento.
>
> **Lo que SITIO-S8 corrió, y cerró:**
>
> ```powershell
> $env:CIRCLE_NODE_TOTAL = "2"; $env:NODE_OPTIONS = "--max-old-space-size=6144"; npm run build
> ```
>
> Con `4096` murió en la misma etapa, y con `6144` murió el primer intento y terminó el segundo. **Eso es lo que dice que el heap no era la variable**: el mismo valor da los dos resultados.
>
> ### La cuarta: UN BUILD INTERRUMPIDO ROMPE `tsc`, NO EL BUILD (SITIO-S10, 2026-08-31)
>
> **La firma es la peor posible: `npm run build` cierra en verde y `npm run verificar` se pone en rojo en el PASO 2**, con un error que apunta a un archivo que nadie escribió:
>
> ```
> .next/dev/types/validator.ts(396,1): error TS1128: Declaration or statement expected.
> ```
>
> **La causa no es el build: es un build ANTERIOR que murió a mitad de una escritura.** `tsconfig.json` incluye `.next/dev/types/**/*.ts`, y ese archivo lo genera Next. Al morir el proceso, el contenido nuevo —más corto— quedó escrito ENCIMA del viejo sin truncarlo, así que el archivo tiene 1435 líneas donde el contenido válido termina en la 394 y después hay una cola de basura (`eck` suelto, el final de un `__Check` anterior). **Un build en verde no lo arregla**, porque `next build` escribe `.next/types/` y no toca `.next/dev/types/`.
>
> ⚠️ **Es la misma clase de defecto que `CLAUDE.md` ya documenta con Tailwind** —*«un error de build que apunta a un archivo verificablemente correcto es señal de contaminación del scan, no del archivo»*— en su variante de `tsc`: lo que está contaminado es la lista de `include`, no el código.
>
> **El arreglo, y por qué NO es borrar `.next`:** se borra **sólo `.next/dev/`**, que es generado, está en `.gitignore` y **ningún invariante lo lee** (verificado con `grep`: `DIST` apunta a `.next` y los que pesan leen `build-manifest.json` y los chunks). Borrar `.next` entero dejaría a las seis suites que leen el build sin base y las pondría en `noCorre`, que es cambiar un rojo por un verde parcial sin haber arreglado nada.
>
> **Y la causa de la interrupción, para el próximo:** el build tarda 6–9 minutos y el techo de tiempo del harness que lo corría estaba en 10. **No fue memoria** —`node` en 0 y la comprometida en 44,9 GB de 55,9 al momento de morir—, así que ninguna de las dos variables de este bloque tenía nada que ver. La segunda corrida, con los mismos valores, cerró en verde.

> ### El diagnóstico original, que sigue valiendo
>
> El problema no es sólo el heap de un proceso: es la máquina. **13,9 GB de RAM y 16 CPUs**, y Next lanza `os.cpus().length - 1` = **15 workers** para "Collecting page data". Quince procesos con 8 GB de techo cada uno no entran en 13,9 GB.
>
> **La firma:** el compilado termina bien —`✓ Compiled successfully in 24.0min`— y recién ahí revienta, en `Collecting page data using 15 workers`, con `FATAL ERROR: Zone Allocation failed - process out of memory`. Que sea *después* del compilado es lo que despista: parece un problema del build y es un problema de reparto de memoria.
>
> **El comando que SÍ termina** (SITIO-S7 lo corrió con las cinco rutas de `/v3` que quedan más el home):
>
> ```bash
> # bash
> NODE_OPTIONS=--max-old-space-size=6144 CIRCLE_NODE_TOTAL=2 npm run build
> ```
> ```powershell
> # PowerShell
> $env:CIRCLE_NODE_TOTAL = "2"; $env:NODE_OPTIONS = "--max-old-space-size=6144"; npm run build
> ```
>
> **Por qué `CIRCLE_NODE_TOTAL`, que no tiene nada que ver con CircleCI:** es la variable que Next lee para el defecto de `experimental.cpus` —`node_modules/next/dist/server/config-shared.js:202`, `Math.max(1, (Number(process.env.CIRCLE_NODE_TOTAL) || os.cpus().length) - 1)`—. Con `3` quedan **2 workers**; con `2`, **uno solo**, que es lo que SITIO-S8 corrió. Es la única forma de acotarlos **sin tocar `next.config`**, que está fuera del scope de estos sprints.
>
> ✅ **Lo que estaba sin aislar, aislado (SITIO-S7).** Este bloque cerraba pidiendo exactamente la prueba que faltaba —*"una corrida con `CIRCLE_NODE_TOTAL=3` y sin `NODE_OPTIONS`"*— y esa corrida se hizo: **muere**. O sea que el heap no es inocuo ni estorba: **es necesario**. La tabla de arriba es el resultado. ⚠️ Lo que SITIO-S8 agregó es que **el tamaño del heap no es el único modo de falla** — ver la tercera corrección, arriba.

---

## 7 · Lo que todavía no está decidido

Está acá para que nadie lo dé por resuelto.

1. ~~**Cuál de los cuatro recorridos es EL recorrido.**~~ **DECIDIDO en S9** — ver §2.2. Lo que queda abierto de esa decisión es una sola perilla, y es de composición: **la elevación de la pose de entrada quedó en 18,6°** contra los 31,0° del recorrido calibrado, y eso es lo que el preloader usa para rotar el logo al aterrizar. Subir la altura del hero de 6,40 a ~7,50 la lleva a 23,2° y cuesta 1,1 de caída en el tramo siguiente. **Se juzga por grabación.**
2. ✅ **CÓMO SE ATA EL RECORRIDO AL SCROLL REAL — CONSTRUIDO en SITIO-S9. Va por ANCLAJE.**

    Estuvo abierto desde S9 y *decidido en forma y sin construir* desde SITIO-S8. Ya está construido, y la decisión que faltaba —**cómo se ancla exactamente**— está escrita con su razón en `_lib/escena/anclaje.ts`, que es el contrato, y derivada en `anclajeDerivacion.ts`. Lo implementa `_lib/escena/recorrido.ts`.

    **Lo único escrito a mano es qué tramo corre sobre qué secciones** (`TRAMOS_ANCLADOS`). Todo lo demás —los altos, los bordes, los nudos, las ventanas— se deriva de `secciones.ts` y de `choreography.ts`, con seis guardianes que **tiran** si el reparto deja de cerrar: un tramo declarado que no existe, un reparto que no cubre las secciones en orden, una sección con scroll propio y sin tramo, un tramo de ancho cero, un recorrido que no llega a 1.

    | tramo | corre sobre | pantallas de scroll | progreso |
    |---|---|---|---|
    | `hero` | Hero | 0 → 1 | 0,000 → 0,125 |
    | `quiénes somos` | Quiénes somos | 1 → 3 | 0,125 → 0,375 |
    | `números` | Números | 3 → 4 | 0,375 → 0,500 |
    | `trabajos` | Trabajos | 4 → 7 | 0,500 → 0,625 |
    | `demos` | **Servicios + Tu panel** | 7 → 12 | 0,625 → 0,750 |
    | `cierre` | **Por qué develOP** | 12 → 13 | 0,750 → 1,000 |

    **La cuenta cierra sola y no hay que escribirla:** el documento mide 14 pantallas, el recorrido de scroll es 13, y las siete primeras secciones suman exactamente 13. La octava —el Cierre— mide una pantalla y es la última, así que **llena el cuadro exactamente en el final del scroll y no tiene recorrido propio**; un tramo sobre ella sería de ancho cero y el guardián 3 lo rechaza. Si mañana el Cierre deja de medir `100svh`, la derivación le da su propio tramo sola.

    ⚠️ **LA LECTURA QUE SE ELIGIÓ, porque había dos y cambian el resultado.** *(i)* la pose que nombra a la sección se alcanza cuando la sección EMPIEZA a llenar el cuadro, o *(ii)* el tramo que la nombra OCUPA la sección y la pose la cierra. **Se eligió (ii)**, y hay cuatro cosas que la fuerzan: §2.2 declara los tramos en pantallas de su sección; con (i) el Hero llevaría 0,375 de progreso en una pantalla y la cámara haría los 130° completos ahí, o sea **6,5× lo que el keyframe `hero · sostén` fue escrito para impedir**; con (i) el tramo escondido arrancaría adentro de Trabajos y serían tres paneles opacos y no dos; y con (i) el tramo `demos` no sería el de Servicios y Tu panel. **Lo que (ii) cuesta, declarado:** tres de las seis secciones ancladas —Quiénes somos, Números, Trabajos— entran sobre la pose de la anterior y llegan a la suya al entregar el cuadro. Las tres que ARRIBAN sobre su pose son Hero (0,000), Por qué develOP (0,750) y Cierre (1,000), que son las que la medición de tinta necesita.

    **Cómo se interpola entre dos anclas: recta por tramos sobre el scroll.** Es exactamente reversible en forma cerrada —error máximo medido **1,78e-15** ida y vuelta, exacto en los siete nudos—, no le pone una segunda curva encima a la que cada keyframe ya trae, y el escalón de ritmo en un nudo lo absorbe la amortiguación que §2.3 ya tiene (`SETTLE_TAU` 0,20 a 0,28 s). El progreso sigue siendo **estrictamente monótono**: la escena no retrocede nunca.

    **La coordenada compartida está en el contrato y no en ninguno de los dos consumidores.** `pantallaDeScroll` traduce el scroll de la página a pantallas del recorrido, y la usan el mapeo y la visibilidad: si cada uno tradujera por su cuenta, la escena podría encenderse en un momento y la cámara estar en otro sin que ningún invariante lo viera. Es **proporcional** al recorrido real —`PANTALLAS_DE_SCROLL × scrollY / (alto − ventana)`— y no absoluta, para que el final del scroll caiga SIEMPRE en el último nudo aunque el documento no mida lo que la tabla declara.

    ── **LAS TRES DESALINEACIONES, antes y después** (`npm run test:s9-anclaje`)

    | | con el provisional | con el anclaje |
    |---|---|---|
    | **escala** | UN ritmo para las trece pantallas: 0,0769 de progreso por pantalla, ×0,615 del compuesto (el recíproco del ×1,625 de estiramiento de scroll) | **seis ritmos**, uno por segmento: ×1,000 · ×1,000 · ×1,000 · ×0,333 · ×0,200 · ×2,000. **Tres corren al ritmo compuesto EXACTO** |
    | **nombres** | 1 tramo sin sección (`demos`) y 3 secciones sin tramo. **Seis de las ocho** caían en un tramo que no llevaba su nombre | **0 tramos sin sección y 1 sección sin tramo** (el Cierre, por geometría). El desajuste baja de 6 a **3 de 8**, y las tres están declaradas en `TRAMOS_ANCLADOS` |
    | **forma** | un progreso monótono no tiene la forma de §2.4 | la forma la da la **visibilidad**, no el mapeo: la escena deja de renderizar cuando ningún panel transparente está en cuadro. El progreso sigue monótono y **avanza sin que nadie lo vea** — ver §7.34 |

    Los cuatro casos concretos que §7.2 medía se movieron así: **Números** pasa de 0,231 (adentro del tramo de Quiénes somos) a **0,375**, que es el borde de su propio tramo; **tu-panel** pasa de 0,769 a 0,700 y sale del tramo de cierre; **por-que-develop** pasa de 0,923 a **0,750**; el **Cierre** se queda en 1,000, que es donde tiene que estar.

    ⚠️ **Lo que queda de esta decisión, y no es del mapeo:** `por-que-develop` ENTRA sobre la pose `demos` y su ventana recorre el tramo `cierre`, así que la sección llamada Cierre no ve nada del tramo que lleva su nombre — es opaca, con lo cual no cambia un píxel, pero la composición del final del recorrido se gasta en el diferencial. Es lo mismo que §7.29 publica como cola.

3. **La cola del cierre.** *"Después las letras se van, la cámara se mueve a otros ángulos y termina en el CTA final"* no tiene poses compuestas. El track termina en el cierre.
4. ✅ **Cómo entra y sale la escena — CERRADO en SITIO-S9, y con MENOS trabajo del que este ítem imaginaba.**

    Preguntaba si el apagado y la vuelta eran un fundido, un corte o la propia luz. **La respuesta medida es que para suspender no hace falta ningún efecto:** el panel opaco ya tapa la sala, verificado sobre el marcado renderizado de las ocho secciones (§7.34). Lo que faltaba no era un efecto visual — era dejar de renderizar, y eso no cambia un píxel de lo que se ve.

    ⚠️ **Y la COLA DEL DIFERENCIAL tampoco abre este ítem, aunque lo parezca.** La ventana en la que `por-que-develop` se ve termina en p=1,000, donde el peor píxel da 2,34:1. **No es del mapeo y no es de la composición: es de la geometría.** Es la anteúltima sección y la última mide una pantalla, así que su borde inferior sale del cuadro exactamente en el final del scroll — **con cualquier mapeo monótono que complete el recorrido su ventana termina en p=1**. `s8-tinta` §5 lo afirma como tal. Y cuando la tinta cruza AA —pantalla 12,513 de 13— el diferencial ya ocupa sólo el **48,7% del cuadro**: el resto es el Cierre, que es opaco.

    **Un criterio que ningún mapeo puede cumplir no distingue un mapeo de otro.** Por eso la cola se publica con su dueño y no se afirma, y **no hace falta un sprint para componer nada.** La decisión se tomó en la parada de SITIO-S9.
5. **Mobile.** ⚠️ **Sigue sin medirse un solo teléfono ni un solo frame time** —toda la contabilidad publicada es estática— pero **SITIO-S10 miró por primera vez el sitio que vive abajo de 1025**, y encontró tres defectos de composición: ver **§7.38**. Lo primero que se apaga si la ESCENA no rinde, en orden: la capa gruesa de la envolvente, `BOKEH_COUNT`, el slider de partículas, `SHADOW_RADIUS`, el washout — y conviene recordar que abajo de 1025 nada de eso se monta, así que lo que hay que mirar ahí no es la escena sino el DOM.
6. **El encuadre por relación de aspecto.** El recorrido está compuesto en horizontal; en vertical el logo no entra igual y falta decidir si se reencuadra o se recompone. ⚠️ **SITIO-S10 le puso el número que faltaba, y es peor que «no entra igual»:** `travelX` tiene un **codo en cero** en aspecto **1,213 (harness) / 1,162 (rig)**, así que a **1025×900 el `frameX: 1` de la pose `demos` no corre el logo ni un píxel** — la perilla de composición lateral de la pose más íntima del recorrido está **inerte** en el cuadro más alto. Ver §7.40.
7. **Qué contenido va en cada una de las ocho pantallas**, más allá de los nombres de los tramos.
8. **La temperatura del cierre**: 7700 K (frío, lo que está hoy) contra los 2000 K (ámbar) que tenía la calibración a mano. Es un número y está argumentado en los dos sentidos.
9. ~~**EL PISO.**~~ **RESUELTO en S11** — ver §2.7 y §4.1. El pendiente de S10 no era de fondo sino de **exposición**: el papel a luz plena da 249,4 y su propia sombra 236,9, o sea doce puntos y medio de rango. Lo abrió la celosía tapando el cielo además del sol, y con eso hero y Números bajaron a 201 y 213 con un rango de 29,6 puntos. **Lo que queda abierto de esto son DOS perillas**, las dos de calibrar mirando: `CELOSIA_BAR` (0,29), que sube el contraste de las bandas y la oscuridad de la sala a costa de aflojar el batido; y desde S12 el **radio angular del sol** (0,266°, rango 0 … 1,5°), que ablanda el borde a costa de devolver parte de esos 29,6 puntos. Medido: de 0 a 0,5° no se pierde nada; desde 0,75° empieza a caer la portadora del piso. En **0** las dos apagan lo suyo y devuelven el estado anterior, que es el control.
10. **Si el recorrido debería dar dos vueltas.** El argumento que lo descartaba murió con los planos (ver §2.2). Es decisión de recorrido, no de escena.
11. ~~**EL ESCALÓN DE EXPOSICIÓN.**~~ **RESUELTO en S13** — `home-intro/introRig.ts`. El intro termina en `HEMI_INTENSITY × celosiaSkyFactor(CELOSIA_BAR)`, o sea **en el mismo ambiente con el que la escena empieza**: una constante compartida, leída de la misma función, sin un solo literal. `introRig.invariant.ts` custodia la igualdad, y de paso verifica que el nivel del arco en p=0 siga valiendo 1 — que es lo único por lo que la key y el relleno no tenían escalón.
    ⚠️ **Y §7.11 sobreestimaba el escalón, con una confusión de superficie que conviene no repetir.** Los **−18,2 puntos en el papel en sombra** y los **−15 en el valor medio del cuadro** son sobre el piso y sobre el cuadro **de la escena**, y el intro no renderiza ninguna de las dos cosas: no tiene papel, y su plano de sombra es un `ShadowMaterial` —oscurece lo que hay detrás, no recibe luz—. La única superficie iluminada del intro es el logo, y ahí la tinta `#0F0F0F` queda tan abajo que el toe del tone map la aplasta: **0,39 puntos sRGB de 255** en la cara frontal (1,68 → 1,28), 0,33 en el canto superior, 0,25 en el inferior.

    ⚠️ **Y esa corrección valía mientras detrás del velo no hubiera nada. SITIO-S8 puso la sala, y el sujeto volvió a cambiar (tercera vez).** Con la escena montada la superficie ya no es la tinta sola sino el CUADRO, y ahí el escalón vale **8,83 puntos** —media 218,30 con cielo abierto contra 209,47 con la celosía—: **×22,6 los 0,39**, y aun así menor que los −15 que §7.11 declaraba, o sea que la corrección apuntaba bien pero no tanto. Medido en `s8-relevo.invariant.ts` §3, con el mismo instrumento que reproduce los 249,4 / 236,9 / 248,3 / 218,7 del papel de S11 como control positivo, y con un control que verifica que el medidor no inventa escalón donde no lo hay (mismo cielo en las dos ramas da cero). **La igualdad de ambiente que S13 construyó sigue intacta:** el escalón AL CORTE es cero por construcción —el intro termina en el mismo `celosiaSkyFactor(CELOSIA_BAR) = 0,6743` que la escena—; los 8,83 son lo que ese escalón valdría si la igualdad se rompiera. Medido en `introRig.invariant.ts`, con el mismo instrumento que reproduce los 249,4 / 236,9 / 248,3 / 218,7 de S11 como control positivo.
    **Se resolvió igual, y no por los 0,39 puntos: por la mudanza.** Traer el factor de cielo obliga a importar `probeCelosia.ts`, que arrastra cuatro módulos más —**10,6 KiB de código**— y corre una integral de hemisferio de 24.000 muestras al cargar el módulo: **1,54 ms**. Hacerlo en `introShading.ts` habría puesto todo eso en el bundle de la PRIMERA visita, que es exactamente la visita en la que el preloader corre. Sacando el rig a su propio módulo esa cadena cae en el chunk diferido de `three` y **`probeLighting.ts` sale del grafo de primera carga**: el grafo del intro pasó de 25 a **24 módulos**.

    ⚠️ **LA DIFERENCIA ANOTADA ENTRE LOS DOS LOGOS NO ES LA QUE EXISTE (SITIO-S8).** `IntroSceneLights.tsx` deja escrito que al intro le falta el CONTRALUZ, «la diferencia conocida entre el logo que aterriza y el que la escena va a mostrar». En la pose de entrada esa diferencia vale **0,0000 exacto**: el rim está a 148° del azimut de cámara —o sea detrás— y `max(0, n·rim)` lo apaga sobre la cara frontal. La niebla tampoco aporta (0,0001: el logo está justo en su borde, a 20,05 de la cámara). **La que existe es LA CELOSÍA —−0,6126 puntos sRGB sobre la cara frontal—**, porque en la escena el logo recibe el patrón de las rendijas (deja pasar el 38,9 % del sol sobre la tinta) y en el intro no. Y aun así no llega a UN byte: en pantalla ni siquiera puede cambiar de valor entero, y pesada por el 5,95 % de tinta en cuadro mueve la media 0,036 puntos. Medido en `s8-relevo.invariant.ts` §4, encendiendo un parámetro por vez.
12. **Los haces de luz visibles.** Medidos y NO construidos: la tabla de fondos aéreos y el alfa aditivo por pose está en `probeCelosia.ts`, para que la decisión sea revocable con datos. Las tres razones para no ponerlos —overdraw sobre las poses más caras, que lo aditivo se come el contraste recién ganado, y que un volumen saliendo de una celosía ES el efecto Star Wars— están en `outputs/S11-LUZ.md` §6.
13. **DEUDA DE TAMAÑO — para un sprint de limpieza, los tres juntos.** La regla del repo es partir arriba de 300 líneas. **Los tres viven en `src/app/v3/_lib/escena/` desde SITIO-S8**, y eso sube la apuesta sin cambiarles una línea: la deuda dejó de estar en una ruta interna con fecha de baja y pasó a estar en lo que el home renderiza. Estos tres están arriba, **los tres crecieron con S11 y ninguno se partió ahí a propósito**: hacerlo de a uno, en el sprint que lo agrandó, es la peor forma de hacerlo.

    | archivo | líneas | antes de S11 | de quién es el exceso |
    |---|---:|---:|---|
    | `src/app/v3/_lib/escena/OrbitRig.tsx` | **651** | 626 | heredado; S11 sumó 21, **S12 sumó 4** (el volcado del radio angular) |
    | `src/app/v3/_lib/escena/probeStore.ts` | **406** | 352 | heredado; S11 sumó 26, **S12 sumó 28** (la perilla del radio angular y su porqué, más la corrección de la cifra sin instrumento) |
    | `src/app/v3/_lib/escena/lightRig.ts` | **357** | 319 (ya cruzado por S10) | heredado; S11 sumó 26, **S12 sumó 12** (el canal del radio angular) |

    **S12 los declara otra vez y no los parte, por el mismo motivo:** son el contrato panel ↔ loop y las dos mitades de un frame. Los tres módulos nuevos del sprint sí nacieron partidos y ninguno cruza el límite — `src/app/v3/_lib/escena/celosiaPenumbra.ts` (163), `src/app/probe-escena/__tests__/celosiaBeat.ts` (188), `src/app/probe-escena/__tests__/s12-penumbra.invariant.ts` (297) y `src/app/probe-escena/__tests__/s12-tension.invariant.ts` (266), remedidos en SITIO-S8 sobre el disco de hoy. **La conclusión aguanta y el margen no:** `s12-penumbra.invariant.ts` está a tres líneas del corte, y el archivo de penumbra se fue con la escena mientras las tres suites se quedaron del lado del probe.

    ⚠️ **SITIO-S9 ESCRIBIÓ LAS RUTAS ENTERAS, Y ÉSA ERA LA DEUDA.** Este bloque nombraba sus archivos por el nombre pelado —`OrbitRig.tsx`, `probeStore.ts`— y con prefijos cortos —`escena/…`, `_components/…`— que después de la mudanza de SITIO-S8 **no resuelven contra nada del disco**. Un pendiente que apunta a una ruta inexistente no se puede verificar, y es exactamente así como éste se venció la primera vez: la mudanza cambió la carpeta y el documento se quedó donde estaba, sin que nada se quejara. Ahora cada ruta es repo-relativa y `src/app/v3/_lib/__tests__/s9-instrumentos.invariant.ts` §3 **afirma que todas existen en el disco**, con un control positivo que exige que una ruta inventada haga fallar al detector. Los doce largos que este bloque nombra se remidieron con `contarLineas` de `s8-largos.ts` sobre el disco de hoy: **ninguno se movió** — los seis heredados dan exactamente los de `LARGOS_HEREDADOS` y los seis restantes, los que el propio texto declara.

    ⚠️ **Y el que faltaba en la lista: `src/app/v3/_lib/escena/probeMoire.ts` (300).** Está declarado en `LARGOS_HEREDADOS` y **no estaba nombrado acá**, así que la tabla de base y el texto que la explica decían cosas distintas. Mide exactamente 300, y el límite se compara con `>`: **no lo pasa**. Su entrada en la línea de base no vigila un exceso, vigila el BORDE — sólo se pone en rojo el día que alguien le agregue una línea. Entra al sprint de limpieza por vecindad, no por deuda.

    ✅ **SITIO-S10 PARTIÓ TRES QUE NO ESTABAN EN ESTA TABLA, y son los que tenían CERO margen:** `_lib/escena/__tests__/s8-escena.invariant.ts` (299 → 276 + `s8-escena-soporte.ts`, 115), `_lib/__tests__/s8-montaje.invariant.ts` (300 → 263 + `s8-montaje-soporte.ts`, 101) y `probe-escena/__tests__/s7-recorridos.invariant.ts` (293 → 269 + `s7-recorridos-soporte.ts`, 132, que cruzó las 300 al escribirle sus controles). La costura es de naturaleza y no de conveniencia —el barrido del disco por un lado, las afirmaciones con sus controles por el otro— y **cada función quedó recibiendo su entrada por parámetro**, que es lo que permite correrla contra una rota. **Partir no perdió una afirmación:** `test:s8` pasó de 390 a 393. ⚠️ **Y queda uno en el borde:** `carga-diferida/__tests__/s8-peso.invariant.ts` está en **299 exactas**, y para que D2 entrara hubo que colapsar un control positivo multilínea a una línea. El próximo que le agregue algo lo parte.

    **Van juntos porque el seam es el mismo:** `lightRig` y `OrbitRig` son las dos mitades de un solo frame —partirlas por separado deja el cuadro cortado al medio en dos archivos que igual hay que leer juntos— y `probeStore` es el contrato entre el panel y ese loop. El resto de los archivos largos ya **no está en un solo módulo**: SITIO-S8 los repartió. Del lado de la escena, `src/app/v3/_lib/escena/choreography.ts` (462) y `src/app/v3/_lib/escena/probeScene.ts` (348); del lado del panel, `src/app/probe-escena/_components/choreographyEditor.ts` (376) y `src/app/probe-escena/_components/KeyframeEditor.tsx` (310). Los cuatro son heredados sin delta de S11 y pueden entrar al mismo sprint, **pero el sprint que los tome cruza dos módulos con ciclos de vida distintos**: el panel tiene fecha de baja y partir ahí es trabajo que se tira. El orden barato es escena primero.

14. ⚠️ **EL CIERRE SIGUE LEYÉNDOSE COMO SENDA PEATONAL — pendiente abierto, con el número (S12).**

    El sprint de la penumbra suponía que el atardecer lo iba a arreglar solo. **No lo arregla, y está medido:** la celda proyectada se estira ×3,6 con `1/tan(elevación)` (de 3,22 a 11,51 de largo, S11 §4.1) mientras la penumbra **como fracción de la banda se achica un 32%** (0,230 → 0,157 celdas), porque la distancia del piso al manto es `R/cos(elevación)` y **baja** con el sol. En unidades de mundo el borde parece ensancharse ×2,4, pero es la banda la que creció debajo. **Lo que se ve es la fracción: la senda peatonal sobrevive a S12.**

    Lo que S12 sí le da al cierre: la mediana del borde en cuadro queda en 0,18 celdas, igual que en el hero, así que **no empeora** — simplemente no mejora por sí solo.

    **Las cuatro palancas, ordenadas de la MÁS BARATA a la más cara**, para que el sprint que lo tome no tenga que rehacer el análisis. Ninguna se tocó acá, y ninguna es un blur:

    | # | palanca | costo | qué cuesta de verdad |
    |---:|---|---|---|
    | **1** | **Subir el radio angular solo en el tramo final**, atándolo al arco | **una línea** en `OrbitRig` | El valor ya viaja por frame del store al uniform: solo hay que hacerlo función del progreso, y toca **únicamente el gobo**. Lo que cuesta no es código: **rompe la premisa física** —el sol no cambia de tamaño a la tarde— y hay que aceptarlo como licencia declarada |
    | **2** | **Bajar `CELOSIA_BAR` hacia el final** | **una línea, más re-medición** | Misma mecánica, pero la barra alimenta además `celosiaSkyFactor`, o sea la intensidad del hemisférico: moverla con el arco mueve **la exposición de la sala**. Hay que volver a medir el valor medio del cierre, que ya vale 104 |
    | **3** | **Que en el cierre proyecte solo la capa gruesa** | **un canal de uniform y un término de shader** | Hoy el gobo es el producto fijo de dos `celosiaLayer`; hace falta un peso por capa que viaje por frame. Y **se pierde el batido**, que es la interferencia entre las dos: hay que re-medir portadora y batido. A cambio da otra lectura — su celda mide 27,18 de largo, o sea una sola banda ancha en vez de trama |
    | **4** | **Acortar la celda proyectada**, que es el ×3,6 | **un sprint de coreografía** | Es la elevación del arco. Mueve **todo** a la vez —la sombra del logo, el alcance de la creciente, los seis valores medios— y es decisión de recorrido, no de escena. §7.8 discute la temperatura del mismo tramo |

    La decisión es del humano por grabación. Lo que este pendiente fija es que **no se resuelve esperando al arco**.

15. ⚠️ **LA CÁMARA DE `harness.ts` NO ES LA DEL RIG — toda cifra de cuadro de S9 en adelante la arrastra (S13).**

    `__tests__/harness.ts:25` declara la caja del logo como **7,168 × 7,168** —el cuadrado de `LOGO_BOX_WORLD`— y con ella calcula el recorrido del encuadre en `cameraAt`. El rig real le pasa a `aimWithFraming` la caja del **mesh medida en runtime** (`OrbitRig.tsx:506`, `stats.current.logoW/logoH`), que es la que `lib/scene-camera.ts` deriva: **6,863 × 4,779**. Con `frameX ≠ 0` las dos cámaras apuntan a lugares distintos.

    **Cuánto, medido pose por pose sobre 1920×1080** (proyección del origen con cada cámara):

    | pose | frameX | harness | rig | Δ |
    |---|---:|---|---|---:|
    | hero | 0,68 | (1350, 569) | (1358, 570) | **7,9 px** · 0,41% |
    | quiénes somos | −0,80 | (643, 522) | (628, 520) | 15,3 px · 0,80% |
    | números | −0,45 | (699, 559) | (694, 560) | 5,1 px · 0,26% |
    | trabajos | −0,85 | (467, 570) | (457, 572) | 9,8 px · 0,51% |
    | **demos** | **1,00** | (1228, 528) | (1252, 526) | **24,6 px** · **1,28%** |
    | cierre | 0,00 | (960, 540) | (960, 540) | **0,0 px** |

    **Donde el encuadre está centrado las dos coinciden exactamente**, y el error crece con `|frameX|`: el peor caso es Demos, con 1,28% del ancho del cuadro.

    **Qué cifras lo arrastran.** `__tests__/frameProbe.ts:197` —el muestreador de cuadro— llama a `cameraAt`, así que **todo lo que salió de `sampleFrame` viaja con esa cámara**: los seis valores medios de S10 y S11 (216 → 201, 222 → 213, …), los porcentajes de piso en sombra, la cobertura de la losa, el batido de la celosía de S12 (`celosiaBeat.ts`) y el conteo de partículas en cuadro de S10. Las suites afectadas son las que importan `cameraAt` o `angularOffset`: `s9-composicion`, `s10-fondo`, `s10-batido`, `s10-particulas`, `s11-pantalla`, `s11-piso`, `s7-modelado`, más `frameProbe`, `celosiaBeat`, `celosiaFloor` y `occlusion` por dependencia.

    **El caso concreto que lo destapó:** S10 publica **1.008 partículas en cuadro en la pose inicial** (924 de polvo + 84 de bokeh). S13 reprodujo ese número exacto con la cámara de `harness.ts`, y con la del rig el mismo campo da **996** (913 + 83): **−1,2%**.

    **NO se re-midió y NO se arregló.** El motivo de S13 —*«es `probe-escena/` y está fuera de scope»*— **se venció con la mudanza de SITIO-S8**: el rig real es hoy `src/app/v3/_lib/escena/OrbitRig.tsx:506` y renderiza el home, mientras `harness.ts` y las once suites se quedaron en `src/app/probe-escena/__tests__/`. O sea que la discrepancia ya no es interna a una ruta de laboratorio: es entre la cámara que el home usa y la que produjo las cifras que este documento publica. Lo que el pendiente fija sigue igual — tocar `LOGO_W`/`LOGO_H` de `harness.ts:25` y volver a correr las once suites de arriba para ver cuáles de sus cifras se mueven — con una prioridad nueva, porque ahora una de las dos cámaras es la de producción.

16. ⚠️ **PREDICCIÓN DEL MAPA — comprobación diferida, unificada en SITIO-S4. Se activa sola.**

    S2 dejó una predicción —al borrar `/v3/motion` y `/v3/motion/control-estatico`, el peso heredado de `/v3` vuelve solo ±3,4 KiB— y S3 iba camino a dejar la suya con tres rutas más. **Es un solo fenómeno:** cada ruta nueva agrega su entrada a estructuras que viajan en chunks **compartidos con el home**, así que una ruta no le cobra a su propia página sino a las que ya existían. Dos predicciones separadas sobre un solo fenómeno se verifican mal: la primera que se cierre deja a la otra sin línea de base. **Quedan como UNA**, en `s4-rutas-de-demo.ts`:

    | ruta | sprint |
    |---|---|
    | `/v3/motion` · `/v3/motion/control-estatico` | S2 |
    | `/v3/componentes` · `/v3/tipografia` · `/v3/tipografia/muestra` | S3 |

    `/v3/control-estatico` **no** está en la lista: es la ruta gemela que `bundle.invariant.ts` usa como control positivo, ya estaba en la línea de base de S1, y vive mientras viva ese instrumento.

    **El número, y su base VENCIDA (SITIO-S8).** S1 midió el heredado en **1381,3 KiB crudo · 23 archivos** (2026-08-28), sin ninguna de las cinco, y con las cinco puestas llegó a 1386,1 · 24. **SITIO-S8 le sacó al layout raíz el barril del preloader** —el gate pre-paint le pedía el módulo al barril, que vive en el grupo de chunks de la página del home— **y el heredado cayó a 1111,5 KiB CON las cinco rutas adentro: 270 KiB por debajo de una base medida sin ninguna.** No se re-basea `HEREDADO_SIN_DEMOS_KIB`: esa constante dice «el heredado SIN rutas de demo» y hoy no se puede medir sin borrarlas — sigue siendo la corrida de dos builds de `s4-rutas-de-demo.ts`. Se declara vencida con su fecha y su motivo, y el control positivo se reemplazó por uno que sí puede fallar (un techo de 1 KiB). **La predicción del mapa no se refuta con esto:** la base venía cargando un defecto que este sprint borró, y eso es información, no ruido. Si vuelve, el delta era el costo de existir de N rutas sea cual sea el mecanismo. Si no vuelve, el diagnóstico estaba mal y hay que buscar en un chunk compartido.

    ⚠️ **El costo por ruta NO es lineal ni constante, y las dos observaciones lo dicen:** 1,7 KiB/ruta (S2, dos rutas) contra 0,96 (S4, cinco acumuladas). Es empírica y sirve para el orden de magnitud. El mecanismo exacto **sigue sin identificarse** — S2 probó que no es la coreografía y que el manifiesto de rutas de Sentry explica sólo el 3,5 % de los bytes. Lo que cierra la pregunta no es una hipótesis: es el borrado.

    **Quién la cierra:** el sprint que reemplace al home, que es el que borra estas rutas. **No hay que construir nada.** `npm run test:s4-heredado` la declara `NO CORRE` con su motivo mientras las rutas existan, y **pasa a afirmarla sola** el día que dejen de existir en el build.

    ⚠️ **SITIO-S7 borró DOS de las siete y el heredado NO bajó. Es una medición SIN CAUSA ATRIBUIBLE, no una refutación.**

    |  | heredado | archivos |
    |---|---:|---:|
    | antes (7 rutas, S7) | 1386,2 KiB | 24 |
    | después del borrado (5 rutas, S7) | 1387,0 KiB | 25 |
    | **delta del borrado** | **+0,8 KiB** | **+1** |
    | **hoy, las mismas 5 rutas, SITIO-S8** | **1111,5 KiB** (359,9 gzip) | — |

    **La última fila NO es la respuesta a la pregunta de esta tabla.** No la produjo borrar rutas: la produjo sacarle al layout raíz el barril del preloader, que arrastraba el grupo de chunks de la página del home a toda ruta. Con eso el total de `/v3` bajó de 440,7 a **377,5 KiB gzip**. La pregunta de arriba —¿borrar una ruta devuelve peso heredado?— sigue abierta y con la misma medición sin causa atribuible.
    | **delta** | **+0,8 KiB** | **+1** |

    **Lo que SÍ quedó descartado, porque se midió:** que el delta venga de que `/v3` cambió de contenido. El heredado es del conjunto COMPARTIDO y no de esta ruta —eso no cambia—, pero desde SITIO-S8 ya no es idéntico entre rutas: `/v3` mide **1111,5 KiB** contra **1083,5** de las otras seis, y la diferencia entera es el chunk del overlay del intro (**28,0 KiB crudo · 8,7 KiB gzip**), que cuenta como heredado porque el home vivo monta el mismo componente y comparte el archivo. O sea: **montar el intro en `/v3` cuesta 8,7 KiB gzip, compartidos con el home.** Lo afirman `s7-compuerta` y `s2-bundle`; la cuenta está en `s8-intro.invariant.ts` §6.

    **Lo que NO se puede descartar:** el mismo commit **borró dos rutas y compuso el home**, y componer cambia el grafo de módulos, que es de donde webpack saca su partición. Dos causas entraron juntas. Cuando eso pasa no se sabe cuál fue — es la misma trampa de §6.1, que le atribuyó a una variable el mérito de una corrida que llevaba dos.

    **EL EXPERIMENTO LIMPIO, pendiente, y es una corrida de dos builds:** dos builds que difieran **sólo** en la existencia de las rutas. Está escrito con sus pasos en `s4-rutas-de-demo.ts`, arriba de `EXPERIMENTO_LIMPIO_PENDIENTE`. No hay que construir nada y no se commitea: restaurar los dos `page.tsx`, apuntarles los imports al contrato unificado —cinco líneas—, `npm run build && npm run test:s4-heredado`, y comparar. **Esa diferencia sí tiene una sola causa.**

    Ni ese experimento cierra la predicción del mapa —quedan cinco rutas—. Cierra la pregunta más chica: *¿borrar una ruta devuelve peso heredado?*, que es la que hoy quedó abierta.

17. **DEUDA DE TAMAÑO EN LOS INSTRUMENTOS — cuatro arriba de 300 líneas, y ningún check los cubre.** Anotada en SITIO-S4 y **no arreglada**: partirlos no era el scope del sprint.

    | archivo | líneas | de quién |
    |---|---:|---|
    | `_lib/__tests__/tokens.invariant.ts` | **456** | S1 — bajó de 463 al extraer `poda.ts`, pero sigue arriba |
    | `_lib/motion/__tests__/motion-bundle.invariant.ts` | **453** | S2 — eran 341; SITIO-S7 le sumó 112 al reescribir el control positivo que afirmaba el reparto de chunks (§7.20) |
    | `_lib/motion/__tests__/cronograma.invariant.ts` | **324** | S2 |
    | `_lib/__tests__/bundle.invariant.ts` | **375** | S1 — eran 323 |

    (Los otros dos siguen exactos: `tokens.invariant.ts` 456 y `cronograma.invariant.ts` 324. **Estos conteos se remidieron en SITIO-S8 sobre el disco**, y que dos de cuatro se hubieran movido sin que nada fallara es el punto del párrafo de abajo: a estos archivos no los mira ningún check.)

    ⚠️ **SON CINCO, NO CUATRO — y el quinto lo destapó SITIO-S10 creciéndolo.** `_lib/__tests__/s9-instrumentos.invariant.ts` **ya estaba en 333** cuando este ítem se escribió, y **nadie lo anotó**: el que lo mira es el mismo defecto que el ítem describe, o sea nadie. SITIO-S10 le sumó **28 líneas de docblock** —el registro de por qué el censo de controles pasó de 36 a 80— y lo dejó en **361**. Se declara con su delta en vez de esconderlo: la deuda creció, la creció este sprint, y partirlo habría sido una cuarta partición sin scope al final de un sprint largo. Remedidos hoy sobre el disco: **456 · 453 · 375 · 361 · 324**.

    | archivo | líneas | de quién |
    |---|---:|---|
    | `_lib/__tests__/s9-instrumentos.invariant.ts` | **361** | S9 — eran 333, y **SITIO-S10 le sumó 28** |

    **Lo que agrava la deuda es la cobertura, no el tamaño:** el único check de las 300 líneas es el de `s3-codigo.invariant.ts`, y mira los archivos del sprint de S3 más los instrumentos `s3-*`; `s4-cobertura.invariant.ts` mira los de S4. **Los de S1 y S2 no los mira nadie**, así que pueden seguir creciendo sin que nada falle. El sprint que los parta tiene que además extender la cobertura, o la deuda vuelve.

18. ~~**LA COREOGRAFÍA DE LAS SECCIONES VIAJA EN LA CARGA INICIAL TAMBIÉN ABAJO DE 1025.**~~ **RESUELTO en SITIO-S7 — ver §7.22.** Abierto en SITIO-S5 y **deliberadamente no arreglado ahí**.

    **La cifra**, producida por `s5-peso.invariant.ts` sobre un build real: lo propio de `/v3/secciones-a` son **38,1 KiB crudo · 12,8 KiB gzip** en 2 archivos, y **baja en todos los anchos**. El total de la ruta es 1429,1 KiB crudo · 436,8 KiB gzip, de los cuales 1386,1 KiB son heredados del layout raíz y no son de ningún lane.

    **Por qué la compuerta de S1/S2 no aplica.** Esas dos gatean una RUTA entera con `dynamic(..., { ssr: false })`, y por eso abajo del umbral el chunk ni se pide. Acá lo gateado es el COMPORTAMIENTO de un contenido que tiene que renderizarse en los dos lados del umbral: abajo de 1025 no se monta el motor, no se parte el texto y no se escribe una transformada —`s5-compacto.invariant.tsx` lo afirma con su control positivo— pero el código de las secciones y del sistema de motion baja igual, porque la sección es un solo árbol.

    **Por qué no se arregla por sección.** Partir cada sección en dos árboles —uno plano para abajo del umbral, otro con coreografía para arriba— obliga a escribir cada sección dos veces, y con dos lanes en paralelo son **dos implementaciones que divergen**. Es una decisión de la COMPOSICIÓN DEL HOME, se toma una vez y se aplica a las ocho.

    **Quién la cerró:** SITIO-S7, con una compuerta resuelta UNA vez arriba de las ocho y las primitivas de coreografía enchufadas por contexto desde un módulo perezoso. El contenido sigue escrito una sola vez —lo que cambia son las primitivas, no el árbol— así que el modo de falla que los dos lanes temían no se abrió. Las cifras y los instrumentos están en §7.22.

19. ~~**`cn()` BORRA CLASES DEL SISTEMA v3.**~~ **RESUELTO en SITIO-S7.** Encontrado por SITIO-S5 y, **de forma independiente, por SITIO-S6**: dos hallazgos coincidentes de dos lanes aislados, sobre el mismo defecto y por caminos distintos.

    **Las dos formas, las dos medidas en runtime con el `cn` de este repo:**

    | entrada | salida | qué desaparece |
    |---|---|---|
    | `cn('text-fluido-micro', 'text-tinta-media')` | `text-tinta-media` | el **tamaño** |
    | `cn('text-micro', 'text-tinta')` | `text-tinta` | el **tamaño** |
    | `cn('font-titulo', 'font-fuerte')` | `font-fuerte` | la **familia** |
    | `cn('font-cuerpo', 'font-medio')` | `font-medio` | la **familia** |

    `tailwind-merge` no puede distinguir un `text-<tamaño>` de un `text-<color>` —los dos utilities se escriben igual— ni un `font-<familia>` de un `font-<peso>` cuyo nombre no esté en su lista (`medio`, `semi`, `fuerte` no lo están). Sin una lista que se lo diga, los mete en el mismo grupo y **descarta el primero, en silencio**.

    ⚠️ **`src/lib/utils.ts` ya advierte por escrito de este mismísimo defecto**, y trae la lista `DS_FONT_SIZE_CLASSES` para los tokens del sistema VIEJO, con el caso medido: *"`text-ds-canvas` desaparecía del CTA primario (texto del mismo color que su fondo, ilegible)"*. La lista **nunca se extendió a los tokens de /v3**.

    **No era teórico:** los cinco rótulos de la sección Números salían sin una sola clase de tamaño —a tamaño heredado en vez de a los 10 px de `micro`— justo en la sección cuyo punto entero es la asimetría de escala.

    **EL ARREGLO, aplicado en SITIO-S7.** `src/lib/utils.ts` extiende ahora `extendTailwindMerge` con dos listas y no una: los catorce `--text-*` de /v3 al grupo `font-size` —el mismo arreglo que el sistema viejo ya tenía— y los tres pesos que `tailwind-merge` no reconoce (`font-medio`, `font-semi`, `font-fuerte`) al grupo `font-weight`, que es de donde nunca tendrían que haber salido. `font-normal` **no** entra: ése sí lo reconoce.

    **Había una TERCERA forma, que ninguno de los dos lanes podía ver desde su lado:** no necesita que nadie pase una clase por `className`. Los componentes de texto emiten familia y peso juntos, así que **cualquier `<Caption peso="medio">` perdía su familia por su cuenta**. La arregla la misma lista de pesos.

    **Cómo se verificó que el sitio vivo no cambia** (`test:s7-cn`): el corpus se DERIVA del código —**5.775 cadenas de clase distintas de 1.395 archivos**, todo `className` y todo argumento literal de `cn(`— y se corren las DOS configuraciones, la de antes y la de ahora. **Cero cambian.** El control positivo es el corpus de `/v3`, donde **8 cadenas** sí cambian: son las que recuperan su tamaño. El comentario del archivo decía "6/6 casos de control"; seis casos elegidos a mano no verifican una propiedad como ésa.

    **Los rodeos se sacaron**, que era la otra mitad: un arreglo de raíz que deja los parches es código muerto que esconde el arreglo. Los invariantes que los vigilaban siguen valiendo sin tocarlos, porque afirmaban el resultado y no el rodeo.

20. ~~**`test:s2-bundle` QUEDA EN ROJO A PROPÓSITO.**~~ **ARREGLADO en SITIO-S7.** Abierto por SITIO-S5, que **frenó y reportó en vez de tocarlo**: es un instrumento del sistema de motion.

    **Qué falla:** el control positivo de `motion-bundle.invariant.ts` pide que las cinco huellas del sistema estén en los chunks que llevan `MARCA_MOTION`. Hoy `MARCA_MOTION` vive en `7416-….js` —el chunk perezoso del demo— y **cuatro de las cinco huellas se mudaron a `1379-….js`**, que es uno de los dos chunks propios de `/v3/secciones-a`.

    **Por qué se mudaron:** al haber un SEGUNDO consumidor del sistema de motion —las secciones lo importan de forma estática— webpack lo factorizó en un chunk compartido. Es el comportamiento correcto del empaquetador, no una regresión.

    **La propiedad que S2 protege sigue intacta**, y hay que decirlo: las tres afirmaciones de "ninguna huella en la carga inicial de `/v3`" pasan, `1379` **no** está en la carga inicial de `/v3`, y la marca tampoco aparece en su HTML. Lo que venció es la PREMISA del control —"el sistema vive en el chunk marcado"—, no la tesis.

    **El arreglo aplicado, que es más que la opción A.** La opción A —buscar en todos los chunks— arregla el síntoma. Lo que SITIO-S7 escribió además es **por qué ese control era frágil por diseño**, porque eso es lo que impide que vuelva:

    > El control afirmaba una propiedad del **reparto de chunks** —"las huellas están en el chunk marcado"— y el reparto cambia con la cantidad de consumidores. Cambió de resultado **tres veces en tres builds**, sin que se rompiera nada. **Una afirmación sobre la salida del build no puede depender de en qué archivo cayó cada módulo**, salvo que el archivo sea justamente lo que se afirma. La unión de los chunks es invariante bajo repartición; un chunk concreto no.

    Así que se afirma lo que el control quería decir y decía mal —que el buscador encuentra las cinco huellas **en el build**— con su control positivo (una huella que no existe no aparece). Y se publica el reparto de este build sin afirmarlo, para que un cambio se note sin poner nada en rojo.

21. ⚠️ **UNA CORRIDA DE `ultracode` CON CUATRO SUBAGENTES SE PUEDE QUEDAR A MITAD POR LÍMITE DE GASTO.** Observado en SITIO-S5, y **le pasó al otro lane también**: en el primer despacho los cuatro subagentes murieron a la vez con *"You've hit your monthly spend limit"* después de ~750k tokens y ~12 minutos, con una sola sección terminada y otra a medio escribir.

    **Por qué importa y no es una anécdota de facturación:** el corte no avisa antes, deja el disco en un estado intermedio —carpetas a medio llenar, archivos de scratch sueltos— y **el reporte del workflow vuelve vacío**, así que el agente principal no sabe qué se entregó si no mira el disco.

    **La regla que queda:** después de un despacho en paralelo, **inventariar el disco antes de creerle al reporte**. Y para un lane largo, despachar en tandas o dejar el padrón de archivos declarado ANTES —que es lo que permitió retomar acá sin perder nada: `archivosDeclaradosQueFaltan()` dijo exactamente qué faltaba.

22. ✅ **LA COMPUERTA DEL HOME — resuelta una vez, arriba (SITIO-S7).** Es el cierre de §7.18, y va acá con su forma porque la decisión de arquitectura vale más que el número.

    **El problema.** Cada sección era UN árbol que importaba el sistema de motion de forma estática y decidía en tiempo de ejecución. Abajo de 1025 no se montaba el motor, no se partía el texto y no se escribía una transformada — **pero el código bajaba igual**, en todos los anchos.

    **Por qué no se podía arreglar por sección.** Partir cada sección en dos árboles obliga a escribir el contenido dos veces, y dos árboles escritos a mano se desvían. El modo de falla es que **la persona de mobile lea un contenido distinto del de escritorio**, que es peor que cualquier cantidad de KiB. Los dos lanes lo dijeron con esas palabras y por eso ninguno partió.

    **La forma que resuelve las dos cosas a la vez:** el contenido se escribe UNA vez y lo que cambia son **las primitivas que lo envuelven**. `_contrato/coreografia.tsx` declara `Bloque`, `CanalDePieza`, `CanalDeTitular` y `TextoPorLineas` y las implementa quietas —DOM plano, sin un import de valor del sistema—; `_contrato/coreografia-animada.tsx` las implementa con el sistema puesto y **es el único módulo del home que lo importa**. La compuerta (`_secciones/CompuertaDelHome.tsx`) pide ese módulo con `dynamic(() => import(...), { ssr: false })` —el mecanismo de S1, sin inventar otro— y lo instala por contexto.

    **Tres detalles que no son detalles:**

    - **El módulo perezoso INSTALA, no envuelve.** La forma evidente —`{arriba ? <ConCoreografía>{hijos}</ConCoreografía> : hijos}`— renderiza el fallback de `dynamic` (`null`) hasta que llega el chunk, o sea **la página en blanco**. Con el escenario de S1 no se nota porque es ornamento; con las ocho secciones sí. Acá el árbol cuelga de un proveedor estático y el módulo perezoso sólo le avisa cuáles son las primitivas.
    - **Dos átomos tuvieron que mudarse fuera de `_lib/motion/`**: `acotar01` (a `_lib/acotar.ts`) y `palabrasDe`/`textoNormalizado` (a `_lib/palabras.ts`). Los usa el árbol quieto y estaban por vecindad en módulos que llevan huellas del sistema: importarlos habría arrastrado el sistema entero a la carga inicial. **Que hayan hecho falta dos dice algo del corte:** el sistema de motion tiene átomos de texto y de número que no son de motion.
    - **La compuerta se afirma dos veces, y las dos hacen falta.** `test:s7-compuerta` la mide sobre el BUILD —marca del árbol animado ausente de la carga inicial de `/v3`, marca del árbol quieto presente en el mismo conjunto como control, y las cinco huellas del sistema ausentes— y `test:s7-contrato` la mira sobre el FUENTE, que es donde se puede decir **cuál** import sobra. El del build prueba el resultado y no dice de dónde viene; el del fuente dice de dónde viene y no prueba el resultado.

23. ✅ **EL CHROME DEL HOME — compuesto en SITIO-S8, en un componente propio.** Vive en `_chrome/ChromeDelHome.tsx` y `page.tsx` lo monta PRIMERO por geometría y no por orden de lectura: el envoltorio de la pastilla es `sticky` con alto CERO y la pastilla vive `absolute` a `100svh − 72px` adentro, así que su posición de nacimiento la define dónde está en el documento. **Devuelve un fragmento y no un `<div>`, y eso no es estilo:** un `sticky` se pega dentro de su contenedor de bloque y su rango es `alto del contenedor − alto propio`; con un `<div>` de por medio el contenedor mediría cero —el envoltorio declara `block-size: 0`— y la pastilla no se pegaría nunca. Con el fragmento el contenedor es el `<main>` del layout de `/v3`. `s8-chrome.invariant.ts` lo afirma sobre el marcado renderizado.

    `/v3/page.tsx` monta la pastilla de navegación (primero, por la razón geométrica que su docblock explica) y las ocho secciones. El pie está adentro de la sección Cierre, que es donde lo puso el sprint que la construyó. **El cursor propio de S3 está montado y APAGADO**, que es la única forma de dejar la decisión al humano sin dejarle trabajo: `ChromeDelHome` incluye `CursorCompuerta` detrás de `CURSOR_PROPIO_EN_EL_HOME` (`_chrome/contrato.ts:85`), hoy en `false`. Si el home nuevo corre con cursor propio sigue siendo una decisión de composición que nadie tomó — lo que cambió es el costo de tomarla: una constante, no un sprint.

24. ⚠️ **DOS COSAS DE LAS SECCIONES QUE SE ANOTARON Y NO SE HICIERON (SITIO-S7).** La instrucción prohibía cambiar el comportamiento de una sección; las dos son cambios de contenido y quedan para la etapa que sigue.

    - ✅ **El pie enlaza las OCHO menos el Cierre — cerrado en SITIO-S8, y derivado.** `SECCIONES_QUE_EL_PIE_ENLAZA` es hoy `IDS_DE_SECCION` y `DESTINOS_DE_LA_RUTA` filtra el propio Cierre —un enlace a la sección en la que ya estás no lleva a ningún lado en el sentido que importa—, así que son **siete destinos derivados de la tabla** y no una lista escrita a mano. **Lo que el arreglo destapó, y es la parte que vale:** el CTA tomaba su destino de `DESTINOS_DE_LA_RUTA[0]` y eso funcionaba **por accidente** mientras la lista arrancaba en Servicios; al derivar el orden, `[0]` pasó a ser `#hero` y el botón quedó diciendo «Ver los servicios» y llevando a otro lado. Se resolvió ESCRIBIENDO el destino —`#servicios`, el mismo de siempre—, que es lo que manda §7.27: el rótulo y el destino son una sola decisión de composición. A dónde empuja el cierre sigue siendo decisión del humano. `ANCLAS_QUE_EXISTEN` —contra la que el instrumento verifica que ningún `href` lleve a la nada— sí se derivó de las ocho, porque eso es un hecho y no una decisión. Ampliar el recorrido del pie es contenido.
    - ✅ **El rodeo de `peso="medio"` — restaurado en SITIO-S8, y NO estaba en Servicios.** Vivía en `_secciones/cierre/ColumnasDelPie.tsx`: con el defecto de `cn()` la pieza perdía la familia Y el peso a la vez, así que se la había dejado sin `peso` y sobrevivía el `font-normal` del componente. Con el arreglo de raíz puesto (§7.19) `font-medio` cae en el grupo `font-weight` y `font-codigo` en el de familia: conviven, y la `<Caption>` del marcador vuelve a pesar 500 (`--font-weight-medio`). **Un arreglo de raíz que deja los parches es código muerto que esconde el arreglo.** La otra regla de ese archivo —ningún `text-<color>` por `className`— se queda, y ya no como rodeo: el color se hereda de la superficie. ⚠️ **Lo que queda asimétrico y no se tocó:** `Cierre.tsx` tiene la misma forma sin `peso` en la línea de cierre del pie, así que hoy el marcador de contacto pesa 500 y la línea de cierre 400.

25. ⚠️ **UN INSTRUMENTO QUE SE MIDE A SÍ MISMO — cuarta y quinta aparición, y la regla general.**

    El proyecto ya lo había cazado dos veces (S3 al sacar los instrumentos del padrón de archivos escaneados; SITIO-S6 al partir sus invariantes en módulos de apoyo). **En SITIO-S7 apareció tres veces más, en tres formas distintas**, y las tres las encontró un instrumento y no una lectura:

    - un docblock que explicaba por qué un átomo se mudaba **escribía la huella del sistema de motion** que el escáner busca;
    - el detector de "no quedan restos de los dos contratos" encontraba los restos **en la documentación que explica por qué ya no están**, y en los mensajes de afirmación que nombran lo que comprueban;
    - el corpus de `cn()` extraído del código levantaba **los dos ejemplos del defecto escritos en el docblock del propio arreglo**, y los reportaba como regresiones del sitio vivo.

    **La regla, general y escrita para no volver a descubrirla:** *un escáner que lee código fuente lee también los comentarios y las cadenas, y un comentario que ejemplifica lo que el escáner busca es indistinguible de lo que busca.* Se sacan comentarios y contenido de cadenas antes de escanear, siempre. Y su corolario, que es lo que hace honesta una exclusión: **todo escáner declara qué NO mira y por qué, con nombre y motivo —nunca por una heurística de sufijo— y hay una comprobación que exige que lo excluido SIGA teniendo lo que el detector busca.** Una exclusión que sobrevive a su razón es un agujero que parece una decisión. El paso 1b de `verificar` es el ejemplo cableado.

26. ⚠️ **REPARTIR ARCHIVOS NO REPARTE UN SPRINT: EL TIPO DE UN DATO COMPARTIDO VIAJA IGUAL.**

    SITIO-S5 cambió `pinneada` de `boolean` a la unión `'siempre' | 'desde-escritorio'`. SITIO-S6 no podía saberlo —`_lib/secciones.ts` era del otro lane y su regla era consumirlo sin tocarlo— y escribió contra el tipo viejo. **`tsc` lo agarró recién al mergear**, que es el momento más caro para enterarse.

    El reparto por archivos protege contra el conflicto de TEXTO y no protege contra el cambio de CONTRATO. Un archivo que un lane escribe y otro consume es una frontera, y una frontera tiene una forma: el tipo. **Con siete lanes esto vuelve a pasar**, así que la regla es la que sigue:

    > **Un archivo que un lane escribe y otro lee es una frontera, y su TIPO es parte del reparto.** Cambiar la forma de un dato compartido no es "tocar mi archivo": es cambiarle el contrato a alguien que no está en la conversación. Lo que hay que repartir antes de despachar no son las carpetas — son **los tipos de lo compartido**, congelados o versionados, y todo cambio de forma se anuncia.

    El sprint dejó además el caso hermano, que es el mismo defecto con otra cara: los **dos contratos** que los lanes escribieron sin verse. Ocho divergencias, todas resolubles, ninguna detectable antes del merge — porque nada las ponía en el mismo archivo.

27. ⚠️ **CARDINALIDADES ESCRITAS A MANO — barrido de SITIO-S7, con lo que quedó.**

    La instrucción pedía revisar si había más después de arreglar la de `test:s5-integracion` (`RUTAS_DE_DEMO.length === 6`, que se rompió cuando un sprint agregó la séptima). Las que quedan **no son del mismo tipo y por eso no se tocaron**: son afirmaciones sobre una cantidad que el sprint DECIDIÓ, no sobre una lista que crece sola —`ITEMS_POR_SERVICIO = 11`, `PANTALLAS_DE_LA_SECCION = 2`, `PIEZAS_POR_PATRON`, las 14 capas promovidas de Servicios—. Un número que describe una decisión de composición **tiene** que estar escrito: es la decisión. Lo que no puede estarlo es un número que cuenta una lista que otro sprint puede alargar.

    **El criterio, para el próximo barrido:** ¿alguien puede hacer crecer lo que este número cuenta sin tocar esta línea? Si sí, se deriva. Si no, se escribe y se explica.

28. ✅ **EL ALTO DEL CIERRE — medido, y deliberadamente NO cambiado (SITIO-S7).**

    Está acá para que **nadie lo reabra sin el dato**, porque la intuición ya se probó y dio al revés.

    SITIO-S6 pidió revisarlo con la premisa *"pasa de una pantalla con el titular en `titulo-xl` más el pie entero"*. Se midió, y **la respuesta depende del ancho**:

    | viewport | alto derivado | pantallas | por qué |
    |---|---:|---:|---|
    | 1440 × 900 | **741 px** | **0,82** | las tres columnas del pie EN FILA |
    | 375 × 667 | **1029 px** | **1,54** | las columnas APILADAS, titular de tres líneas |

    ⚠️ **Las dos cifras se movieron en SITIO-S8, y no es que la sección cambió de alto: EL MODELO ESTABA MAL.** Publicaba 609 y 913 midiendo **una sola columna del pie** —la de novedades— usada para las tres. Con tres enlaces en la columna del recorrido subestimaba 4 px y nadie lo notaba; al ampliar el pie a las ocho secciones (§7.24) esa columna pasó a ser la más alta y la subestimación llegó a **132 px**. El instrumento ahora mide la más alta de las tres, que es la que gobierna la fila. **Las dos conclusiones sobreviven** —741 < 900 entra a escritorio, 1029 > 667 se pasa a 375 donde el `min-height` deja crecer la sección—, y por eso el valor no se toca; **lo que se achicó es el aire: de 291 px a 159.**

    Las produce `_secciones/cierre/s8-cierre.invariant.tsx` sumando cajas de línea y tokens. **No está medido en un navegador**, y eso está declarado ahí. **Desde SITIO-S8 suma la MÁS ALTA de las tres columnas del pie y no una tomada por las tres**, que es el cambio de modelo que movió los dos números; y si el pie vuelve a crecer —una cuarta columna, más pedidos de contacto— hay un instrumento que se pone rojo el día que `100svh` deje de contenerlo.

    **La premisa valía sólo a 375.** A escritorio —que es el ancho donde este proyecto define el ritmo, y donde la referencia midió los suyos— la sección entra en `100svh` con aire. El `alto` de la tabla es un `min-height`: a 375 el contenido lo pasa, la sección crece y no se recorta nada.

    **Por qué se queda en `100svh`, con las tres salidas recorridas:** subirlo a `200svh` mete **1,18 pantallas vacías** en el tramo final del recorrido, que es el defecto que el pinneo existe para no tener; dejarlo no recorta nada en ningún ancho; y declarar dos altos por ancho no existe en la tabla —el `alto` es uno—.

    **Lo único que queda abierto de esto:** el ritmo de mobile subestimaría este tramo. No se arregla acá: el ritmo de 390 es otro número y SCROLL.md lo publica por separado con razón (§7 de SCROLL.md). Los dos números viven en la fila de `cierre` en `_lib/secciones.ts`.

29. ⚠️ **LA TINTA DEL DIFERENCIAL — CERRADO CONTRA EL FONDO en SITIO-S9 (6,07:1 en p=0,750), y ACOTADO en SITIO-S10: el cierre NO cubre el cuadro entero.**

    **Se lee entero o se lee mal.** Lo que SITIO-S9 cerró es el contraste del texto **contra el fondo de la sala**, que es lo que su instrumento medía. Lo que SITIO-S10 midió es la región que ese instrumento **descartaba a propósito** —los píxeles del logo— y ahí el número es **1,11:1 en el MEJOR píxel**. Las dos cosas son ciertas, miden superficies distintas, y el alcance del cierre está escrito abajo, en este mismo ítem, para que nadie lea «cerrado» sin ver hasta dónde.

    **El anclaje de §7.2 lo resolvió sin tocar la escena, que es exactamente lo que la parada de SITIO-S8 predijo.** El diferencial llena el cuadro sobre la pose `demos` —p=0,750, que es el borde del cruce de AA por un margen de 0,128 de progreso— y ahí la tinta da **6,07:1 (mínimo) · 6,46:1 (p05) · 7,58:1 (mediana)**, contra los 3,10 / 3,10 / 4,22 que daba en p=0,923. **La mediana pasa AAA**, que el provisional no alcanzaba ni en AA. El Hero pasa AA y AAA en su ventana entera —**9,73:1 en los cuatro bordes**, y ahora eso significa algo más fuerte: con el anclaje su pantalla es exactamente el tramo `hero`, que es un sostén, así que el cuadro no cambia en toda la ventana. Lo produce `npm run test:s8-tinta` §4 y §5, y el `noCorre` que S8 había dejado se convirtió en afirmación.

    ── 🔴 **EL ACOTAMIENTO: ESTE CIERRE NO CUBRE LA REGIÓN DONDE EL TEXTO CAE SOBRE EL LOGO (SITIO-S10).**

    **La exclusión de `sinLogo` dejaba afuera exactamente la región mala, y no era conservadora.** Los 6,07:1 salen de `cuadro.ts`, que **descarta a propósito los píxeles del logo**: la pregunta que se contestó fue *«¿cuánto contrasta el texto contra el FONDO?»*. La que faltaba —*«¿y donde el texto cae ENCIMA del logo?»*— no la contestaba nadie, y el logo es **tinta casi negra** (`INK_COLOR`). Un descarte que se hace para aislar una superficie es correcto; lo que no se puede es leer su resultado como si valiera para el cuadro entero.

    **En una línea, para que no se vuelva a mezclar: 6,07:1 vale para el FONDO; sobre el LOGO son 1,11:1 en el mejor píxel.**

    **Medido en SITIO-S10 (`_lib/escena/__tests__/s10-logo.invariant.ts`), con el mismo shading y dos controles de equivalencia:**

    | | peor | p05 | mediana | **mejor píxel** | contra el fondo |
    |---|---:|---:|---:|---:|---:|
    | Hero, p=0,000 | **1,11:1** | 1,11 | 1,11 | **1,11** | 9,73:1 |
    | Por qué develOP, p=0,750 | **1,11:1** | 1,11 | 1,11 | **1,11** | 6,07:1 |

    **No pasa AA, no pasa AAA, y no llega ni a 3:1 — ni en el mejor píxel.** Las dos poblaciones son **disjuntas**: el mejor píxel del logo (1,11) es peor que el peor del fondo (6,07). O sea que **la exclusión de `sinLogo` no era conservadora**: dejaba afuera exactamente la región mala.

    Lo que esto NO dice es cuánta superficie de texto cae ahí — eso es composición y está en §7.40, con su número. Lo que sí dice es que **§7.29 no se puede leer como «la tinta del diferencial está resuelta»**: está resuelta contra el fondo, que es donde se midió, y ese alcance ahora está escrito.

    ⚠️ **LA COLA, publicada y NO afirmada — y eso también quedó cerrado en la parada.** La ventana en la que la sección SE VE termina en p=1,000, donde el peor píxel da 2,34:1. `s8-tinta` §5 lo afirma como propiedad de la GEOMETRÍA y no del mapeo —el borde inferior del diferencial está en la pantalla 13 de 13, así que **cualquier** mapeo monótono termina ahí— y publica la cola con su número: cuando cruza AA, en la pantalla 12,513, el diferencial ya ocupa sólo el 48,7% del cuadro y el resto es Cierre opaco. **Un criterio que ningún mapeo puede cumplir no distingue un mapeo de otro**, así que ésta es la forma correcta y no abre §7.4 ni pide un sprint. La reserva (b) queda sin usar.

    ⚠️ **Y CERRARLO PUSO A `s8-tinta` EN ROJO, QUE ES EL SPRINT FUNCIONANDO.** SITIO-S8 había dejado, al lado de su `noCorre`, un guardián escrito para que la falla no se leyera como un roce: `difLlena < AA` — *«la medición del diferencial está por debajo del umbral, no cerca»*. Con el anclaje puesto esa afirmación **dejó de ser cierta**, y el invariante se puso en rojo por eso. **Un invariante que se pone en rojo porque el problema que custodiaba se resolvió no es una regresión: es la señal de que el trabajo llegó.** El frente que construyó el mapeo lo vio y **no lo tocó** —su permiso en ese archivo eran dos líneas—; la re-medición la hizo el agente principal en la integración. Las dos cosas están bien, y conviene que la próxima vez se reconozca de una: **un rojo cuya causa es la desaparición del defecto se lee distinto de un rojo cuya causa es un defecto nuevo, y el que lo encuentra no siempre es el que lo puede arreglar.**

    ── **El registro de SITIO-S8, que sigue valiendo como fuente**

29b. 🔴 **LA TINTA NO PASA AA EN EL DIFERENCIAL SOBRE LA ESCENA REAL — medido en SITIO-S8, y la salida ya estaba decidida.**

    Los contrastes de los paneles transparentes se habían medido contra el **marcador de posición**, que es plano y pinta dos tokens: 13,62:1 en el peor caso. `s6-contraste` ya advertía por escrito que la sala real no hereda ese número. **No lo hereda:**

    | sección | ventana de progreso | peor píxel | p05 | mediana | AA (4,5:1) |
    |---|---|---:|---:|---:|---|
    | **Hero** | p=[0,000 – 0,077] | **9,73:1** | 10,60 | 13,64 | ✅ pasa AA y AAA |
    | **Por qué develOP** | p=[0,846 – 1,000] | **3,10:1** | 3,10 | 4,22 | ❌ **NO pasa** |

    Lo produce `npm run test:s8-tinta`, con un muestreador de cuadro por píxel validado contra `sampleFrame` de S10/S11 —las seis poses coinciden hasta menos de 1e-9— y con `razonDeContraste` del arnés.

    **La cifra que decide, y es del RECORRIDO y no del mapeo:** el contraste del peor píxel cae monótono de **9,73:1 en p=0 a 2,34:1 en p=1**, y **cruza AA en p=0,8782** (AAA en p=0,6490). Verificado en las dos direcciones: 4,72:1 en p=0,87 y 4,04:1 en p=0,89. O sea que **cualquier mapeo que deje el diferencial abajo de p=0,878 lo resuelve sin tocar la escena.**

    **DECIDIDO EN LA PARADA DE SITIO-S8 — se resuelve por el MAPEO, opción (a):**

    | # | salida | veredicto |
    |---:|---|---|
    | **a** | **mover la sección en el recorrido** | ✅ **ELEGIDA.** Es *downstream* de §7.2, que este sprint declaró provisional y mal en tres formas: arreglarlo en la escena sería tapar el síntoma de otra cosa. No toca la escena ni las superficies. |
    | **b** | **componer la salida y la vuelta de la escena** (§7.4) | **la reserva.** Si después del mapeo sigue fallando, ésta es la salida: §2.4 ya la pide, y si al volver la escena arranca en una pose clara el problema desaparece por construcción. |
    | c | pasar `por-que-develop` a `papel-opaco` | ❌ descartada: mata uno de los **tres momentos de escena**, y el recorrido de superficies fue deliberado (SITIO-S5 §0.2). |
    | d | aclarar el cierre del arco de luz | ❌ descartada acá: es §7.14, con sus cuatro palancas ya analizadas, y es otra cosa. |
    | · | un velo o una superficie intermedia detrás del texto | ❌ **nunca.** |

    ⚠️ **Las cifras son un TECHO, no un piso, y eso vale igual para las de S9.** No modelan las partículas (bajan el valor medio 7 a 8 puntos), ni la sombra proyectada del logo, ni el especular; los tres empujan hacia abajo. Y arrastran la cámara de `harness.ts` (§7.15): hasta 1,28% del ancho del cuadro. **El número real es peor que 3,10:1 — y peor que los 6,07:1 de S9.** Lo que la holgura de S9 compra es margen contra esa ventana, no exactitud.

30. ✅ **EL SDK DE NAVEGADOR DE SENTRY — CERRADO en SITIO-S9: NO SE DIFIERE. La cifra de este ítem estaba INFLADA al doble y la corrección va abajo.**

    Medido en SITIO-S8 (`npm run test:s8-peso` §3) sobre `rootMainFiles` + `polyfillFiles` de `build-manifest.json`, o sea **lo que Next pide en toda ruta sin que ningún componente lo elija**:

    | | archivos | crudo | gzip |
    |---|---:|---:|---:|
    | **el piso del framework** | 5 | 787,8 KiB | **248,3 KiB** |
    | de los cuales `7149-*.js`, con el SDK de navegador de Sentry | 1 | 466,8 KiB | **142,1 KiB** |

    Entra por `src/instrumentation-client.ts`. **No es de `/v3` ni del layout raíz**, así que ningún sprint de este track lo puede tocar, y por eso se publica con dueño en vez de afirmarse.

    **La cifra que abre el pendiente: sin ese chunk, la carga inicial de `/v3` mediría 235,3 KiB gzip — ABAJO de los 300 del techo original.** Medida directo sobre el build; restar dos cifras ya redondeadas daría 235,4, y la buena es la medida.

    ⚠️ **Y por eso el techo se re-fijó, con la forma de la regla 13** (`components/layout/carga-diferida/presupuesto.ts`). «300 KiB gzip de la carga inicial entera» **no lo puede cumplir nadie**: el piso ya se come 248,3 y deja 51,7 para el chrome, los límites de error y la ruta. **Un presupuesto que nadie puede cumplir es un presupuesto que nadie mira.** Ahora se **afirma lo propio** —lo que la ruta pide POR ENCIMA del piso: el chrome del layout más lo de `/v3`, hoy **129,2 KiB gzip**, con 170,8 de aire— y se **publica el piso** con su dueño y su número. El 300 no se eligió de nuevo: se conservó, sobre lo que de verdad depende del código de este repo.

    ── 🔴 **LA CIFRA DE ARRIBA ESTÁ INFLADA, Y LA DECISIÓN QUE HABILITÓ SE TOMÓ SOBRE ELLA.**

    **«Sin ese chunk la carga inicial de `/v3` mediría 235,3 KiB gzip» supone que el chunk se puede sacar, y no se puede.** La frase que lo produce —*«entra por `src/instrumentation-client.ts`»*— es cierta y no es completa: el chunk tiene **263 módulos de webpack** y **19 chunks de la carga inicial de `/v3` le piden módulos**, no uno. `instrumentation-client.ts` es la puerta más grande —arrastra 125,4 KiB gzip— pero soltarla no borra el chunk: lo achica.

    **La causa del error es una resta de archivos donde hacía falta un grafo.** §7.30 restó el archivo entero de la carga inicial; el techo real sale de partir el chunk en módulos y quedarse con los que NADIE MÁS pide (`carga-diferida/__tests__/grafo-de-chunks.ts`):

    | | módulos | gzip |
    |---|---:|---:|
    | siguen *eager* aunque `instrumentation-client.ts` suelte el SDK | 142 | 61,3 KiB |
    | **el techo REAL de la salida (a)** | **121** | **77,9 KiB** — el 54,8% del chunk |
    | lo que §7.30 le atribuía | 263 | 142,1 KiB |

    **Con eso `/v3` quedaría en 299,6 KiB gzip, no en 235,3.** O sea que la deferencia nunca iba a bajar el total abajo de los 300 originales: **iba a quedar justo arriba.** La decisión de la parada de SITIO-S8 —*«esto vale un sprint aparte»*— se tomó sobre un lever del doble de tamaño que el real. Queda corregido acá para que nadie lo vuelva a proponer con el número viejo.

    ── 🔴 **Y AUNQUE VALIERA 142: DIFERIR DEJA MUDO AL LÍMITE DE «LA APP NO PUDO CARGAR».**

    Ésta es la razón que decide, y no es de peso. `src/app/error.tsx` y `src/app/global-error.tsx` llaman `Sentry.captureException` y viajan en la carga inicial de **las 11 rutas prerenderizadas** — medido, no supuesto. Sin `init` corrido:

    > `Scope.captureException` **devuelve un id de evento y descarta el evento** (`@sentry/core/build/esm/scope.js:471-474`), y en producción `DEBUG_BUILD` es `false`, así que **no avisa por consola ni por ningún otro lado**.

    **Un evento descartado que devuelve un id y no avisa es peor que no tener Sentry, porque parece que funciona.** El código que reporta recibe un identificador válido, lo puede mostrar al usuario y lo puede loguear; el evento no existe en ningún lado. Y `global-error.tsx` existe exactamente para el caso en que la app no pudo cargar — o sea que la ventana en la que diferir lo deja mudo **es su única ventana**.

    Por eso **el SDK arranca en línea y así se queda**. Lo que una deferencia dejaría descubierto está enumerado y no estimado: **cinco integraciones instalan algo en el `init`** —`globalHandlers` (`window.onerror` y `onunhandledrejection`), `browserApiErrors`, `breadcrumbs` (el contexto de cada error), `browserSession` y `browserTracing`— y las otras ocho corren en el momento del evento y no pierden nada por llegar tarde. **Cuánto DURA esa ventana en milisegundos no se midió**: pide un navegador con la pestaña visible, y una medición de tiempo con la pestaña ocluida es cero por construcción.

    ⚠️ **El orden correcto, si alguien vuelve a tomarlo:** primero sacarle el `captureException` estático a los dos límites de error —o darles un camino de reporte que no dependa del `init`—, y **recién ahí** diferir. Sin eso no es un ahorro con riesgo: es un ahorro de 77,9 KiB con los dos límites de error del sitio público mudos.

    ── **LAS OTRAS DOS PALANCAS, con lo que dio cada una**

    **(b) `browserTracingIntegration` fuera del bundle — 52,0 KiB crudo · 17,6 KiB gzip, el 12,4% del chunk. NO APLICADA, y es decisión de producto.** No cuesta captura de errores, pero cuesta **todo el monitoreo de performance** —pageload, navegación, web vitals— y hoy `tracesSampleRate` es 0,1 en producción. No se alcanza desde el `init`: el de `@sentry/nextjs` evalúa `getDefaultIntegrations(options)` mientras arma las opciones (`client/index.js:56`), así que la integración se construye pase lo que pase con `integrations`; el único interruptor es el global de build `__SENTRY_TRACING__`, y lo prende `withSentryConfig(…, { webpack: { treeshake: { removeTracing: true } } })`.

    **(c) `removeDebugLogging` — APLICADA en la parada de SITIO-S9, y devolvió CERO.** Es la palanca que §7.30 no anotaba y la única que no cuesta un gramo de cobertura. Se aplicó en `next.config.ts` y **funciona**: las **8 guardas `__SENTRY_DEBUG__` sin resolver que el chunk conservaba pasaron a 0**, afirmado sobre el build. **Y el peso no se movió: −0,1 KiB crudo y +0,0 KiB gzip.**

    > ⚠️ **Eso no es una contradicción y hay que dejarlo escrito, porque es la clase de cosa que se vuelve a proponer.** La bandera resuelve el GLOBAL, no el cuerpo de los `logger.*`, que el minificador ya trataba como muerto. **La palanca es real y el lever valía cero.** Se deja puesta —no cuesta nada y saca guardas muertas— y se publica el número para que nadie la vuelva a listar como una salida de peso.

    ⚠️ **UN HALLAZGO DE OBSERVABILIDAD QUE NO ES DE PESO: `replaysOnErrorSampleRate: 1.0` ESTABA MUERTO — BORRADO EN LA PARADA.** Con `@sentry/nextjs` 10.62.0 el default son **13 integraciones y `replayIntegration` no está entre ellas**; nadie la agrega, y `replayIntegration` y `rrweb` aparecen en **cero chunks** del build. O sea: **costaba 0 bytes y capturaba 0 replays**, mientras el comentario del archivo afirmaba que se preservaban los session replays on error. **Las dos opciones se borraron, y no por peso: por honestidad — un flag que dice preservar algo que no existe es peor que no estar**, porque le hace creer al próximo que hay replays cuando no hay ninguno. Borrarlas no cambió un byte ni una captura. El día que se quieran replays de verdad hay que agregar `replayIntegration()` —que SÍ pesa— y ahí volver a poner las tasas; `s9-sentry` §4 lo custodia.

    ── ✅ **LA FRAGILIDAD DEL CHUNK POR NOMBRE — ARREGLADA EN SITIO-S10.**

    `presupuesto.ts:62` fijaba `CHUNK_DE_SENTRY = '7149'` —el prefijo del chunk, escrito a mano— y `s8-peso.invariant.ts:262` lo usaba para publicar «sin Sentry `/v3` mediría X». **Si webpack renumeraba el chunk, el filtro no sacaba nada, la cifra publicada pasaba a ser el total entero y no había rojo.**

    Se identifica **por contenido**, con `chunkConHuella()` y la huella `browserTracingIntegration` que `s9-sentry` ya usaba —importada de `puertas-de-sentry.ts`, sin dejar una segunda copia del literal—. Y el arreglo hace más que cambiar el filtro: `descontarElSdk()` devuelve **`null`** cuando no hay portador o el portador no está en el conjunto, `sinSentryGzip` pasó a `number | null`, y `publicarElTecho` imprime **«NO SE PUDO DESCONTAR»** en vez de publicar el total con otro nombre. `test:s8-peso` pasó de 43 a 45 afirmaciones.

    ⚠️ **La cifra no se movió: 235,3 KiB gzip antes y después. Esa igualdad ES el resultado** — en el build de hoy el filtro por nombre y el filtro por huella seleccionan el mismo archivo. **Lo que cambió no es el número sino su modo de fallar**, y ésa es exactamente la clase de arreglo que no se puede justificar con un delta.

31. ⚠️ **UN INSTRUMENTO QUE COMPARA CONTRA UNA LÍNEA DE BASE TIENE QUE DECIR QUÉ CAMBIÓ ENTRE LAS DOS MEDICIONES, NO SÓLO CUÁNTO.**

    Regla del proyecto desde SITIO-S8, y el caso que la obligó **estuvo a punto de publicarse como conclusión en un reporte.**

    `s7-compuerta` medía el heredado de `/v3` contra la línea de base de S7 y escribía el veredicto solo: *«el padrón pasó de 7 a 5 rutas de demo; si el heredado BAJA, la predicción del mapa (§7.16) va en la dirección correcta»*. Era razonable **mientras borrar rutas fuera lo único que podía mover ese número.**

    Dejó de serlo en el mismo sprint. SITIO-S8 le cambió **un especificador de import** al layout raíz y el heredado se desplomó **−274,7 KiB crudo sin que se borrara una sola ruta**. Con el texto viejo, el instrumento habría escrito *«BAJÓ: borrar rutas devuelve peso heredado»* y le habría dado a la predicción del mapa **un respaldo que no le corresponde**.

    Es la trampa de §6.1 —*dos cambios entran juntos y se le atribuye el mérito a uno*— con la diferencia que hace útil la regla: **acá sí se sabe cuál fue.** `test:s8-peso` lo aisló ruta por ruta, sobre el payload de flight, nombrando qué referencia de cliente pide cada chunk. La atribución no salió de razonar: salió de medir.

    **Una comparación sin inventario de cambios no es una medición: es una coincidencia con formato.**

    ⚠️ **Y deja vencida la base de §7.16.** `HEREDADO_SIN_DEMOS_KIB = 1381,3` se midió el 2026-08-28 **con cero rutas de demo**, y hoy el heredado es **1111,5 con las cinco puestas** — 270 KiB por debajo de una base medida sin ninguna. La predicción *«al borrarlas todas vuelve a 1381,3»* es falsa en su forma actual. **No se re-baseó**: esa constante dice «sin rutas de demo» y medirla pide un build sin ellas. Queda declarada vencida, con su fecha y su motivo, en `s4-heredado.invariant.ts` y en el texto de la propia predicción.

32. ⚠️ **TRES AFIRMACIONES DE LA INSTRUCCIÓN DE SITIO-S8 QUE RESULTARON FALSAS.** Van acá porque la instrucción de un sprint es una fuente como cualquier otra, y una fuente que se equivoca se corrige con su medición al lado (regla 11).

    - **«S7 no montó el chrome».** Media verdad, y trabajar sobre ella llevaba a reconstruir cosas que existen. S7 **sí** montaba la pastilla de navegación —estaba en `/v3/page.tsx`— y el pie **sí** estaba montado, adentro de la sección Cierre. Lo único que no estaba montado era el **cursor propio**, que es lo que §7.23 decía con esas palabras. Lo que SITIO-S8 hizo con el chrome fue **verificar** la pastilla contra el Hero real, **completar** el recorrido del pie y **montar** el cursor apagado.
    - **«`peso="medio"` sigue esquivado en Servicios» (§7.24).** No estaba en Servicios: `servicios/ContenidoDeServicio.tsx` **no tiene un solo `peso=`** —lo que había ahí era un rodeo del mismo defecto de `cn()` pero sobre el COLOR, que SITIO-S7 ya sacó—. El único rodeo con su motivo escrito al lado estaba en **`cierre/ColumnasDelPie.tsx`**, o sea en el pie. Se restauró ahí, y **no se tocó Servicios**: restaurar algo allá para que la frase quedara cierta habría sido inventar composición.
    - **«el escalón de exposición vale 0,39 puntos» (§7.11).** Vale 0,39 **sobre la tinta del intro sola**, que era la única superficie iluminada cuando detrás no había nada. **Con la sala montada detrás, el escalón del cuadro vale 8,83 puntos** (media 218,30 → 209,47): ×22,6. La corrección que §7.11 se había hecho a sí misma apuntaba bien —8,83 sigue siendo menor que los −15 que decía antes— pero el número que quedó escrito subestima 22 veces.

33. ⚠️ **LOS 34 INVARIANTES DE LA ESCENA ENTRARON AL GATE, Y ENTRAR DESTAPÓ TRES COSAS DEL ARNÉS.**

    Existían desde S7 y **ningún script los corría**: 890 afirmaciones que `npm run verificar` no miraba. Es la regla 14 en su forma más pura —*un check que no está en ninguna cadena no se ve nunca*— y encima eran la única prueba de que la mudanza de SITIO-S8 fue fiel. Se cablearon los 34, repartidos en ocho suites propias (`s7e` … `s14e`, con sufijo de letra porque el track del SITIO ya ocupa `s1` … `s8`).

    **Los tres hallazgos que el cableado destapó, y ninguno era un invariante roto:**

    1. **Este repo tiene DOS arneses y el lector del agregado conocía uno solo.** El track del SITIO cierra con `cerrar()` y escribe `nombre: N afirmaciones, M fallas`; el de la ESCENA cierra con `report()` y escribe **`nombre: N en verde, M en rojo`**. `leerResumen()` devolvía `null`, `resumio` quedaba en `false` y **`fallo()` daba los 34 por FALLADOS con 0 afirmaciones contadas**, con exit code 0 y sin un solo rojo real. *Un lector que no entiende un dialecto no reporta «no entiendo»: reporta «falló».* Se le enseñó el segundo dialecto, en vez de reescribir 34 instrumentos: lo que estaba mal era el lector.
    2. **`report()` no tenía la guarda de «cero comprobaciones».** `cerrar()` la tiene desde S4 —un invariante sin afirmaciones sale verde y es indistinguible de uno que verificó algo—. Mientras estos archivos se corrían a mano no importaba; metidos en el gate, **un lane que puede pasar por vacío es un gate que miente**. Se agregó a los dos arneses compartidos y a las dos copias en línea de `src/lib/scene-*.invariant.ts`.
    3. **El contador de controles positivos se contó a sí mismo.** Al enseñarle el marcador de la escena —`ok  control positivo —`, sin corchetes— la primera versión buscaba la frase suelta y contaba DOS donde había uno: lo destapó el fixture `pasa.invariant.ts`, cuya descripción dice *«y trae un control positivo, para que el contador tenga qué contar»*. Es §7.25 en su forma más chica: **un escáner que lee texto lee también el texto que lo describe.** Se ancló a la forma de la línea.

    ✅ **RESUELTO en SITIO-S9, y el barrido corrigió el número que lo describía.** El lane marcaba sus controles de formas distintas y el contador veía **14**. Lo primero que la medición destapó es que **el «18» nunca fue la cuenta de controles: era la cuenta de LÍNEAS con la frase**. Los cuatro que el contador se perdía eran tres títulos de `section()` —`introSampling:344`, `s9-composicion:31`, `introRig:236`— y un DETALLE de check (`s11-celosia:116`), que el patrón anclado a la forma de la línea descarta a propósito.

    Se unificó el marcador **en el prefijo de la ETIQUETA**, que es la misma unidad que `controlPositivo()` del lane del SITIO —una llamada, una afirmación— y es lo que hace comparable el número: 11 de los 34 archivos, 20 ediciones una por una, **sin mover una sola línea de ningún archivo**. El contador ahora ve **36**, y no es que aparecieran controles: **cambió la unidad**, de 18 sitios declarados a 36 comprobaciones de control (un título de `section()` encabeza un grupo de tres o cuatro checks, y contarlo como uno era subcontar).

    **`contarControles` NO se tocó**, y ésa es la parte que importa: el barrido movió los controles a la forma que el contador ya sabía leer, así que sus dos patrones siguen en uso y el **anclaje a la forma de la línea** —la protección de §7.25— queda intacto. `s9-instrumentos` §1 deja dos controles positivos que lo custodian, uno de ellos usando la línea real de `s11-celosia:116`, que se dejó sin marcar a propósito para que siga siendo el espécimen.

    ⚠️ **Y el número comparable destapó el agujero que el subconteo escondía:** `s7e` y `s10e` corrían **10 invariantes y 152 afirmaciones sin un solo control positivo**. No era un problema de marcador: no existían.

    ✅ **ESCRITOS EN SITIO-S10 — 44 controles, y el censo se movió por primera vez porque APARECIERON controles y no porque cambiara la unidad.**

    | | antes | después |
    |---|---|---|
    | `s7e` | 5 invariantes · 92 afirmaciones · **0 controles** | 5 · **114 afirmaciones · 22 controles** |
    | `s10e` | 5 invariantes · 60 afirmaciones · **0 controles** | 5 · **82 afirmaciones · 22 controles** |
    | el censo de `s9-instrumentos` §1 | 36 etiquetas en 17 de los 34 archivos | **80 en 27** |

    **Lo que costó de verdad no fue escribir los controles: fue que varios predicados no se podían probar.** Un predicado escrito adentro de un bucle en línea, que mira una constante importada, **no se puede correr contra una entrada rota** — y un control que corre otra copia del código no prueba nada (§7.25). Hubo que sacar trece predicados a funciones con su entrada por parámetro (`noModela`, `atsCrecientes`, `fueraDeRango`, `seMovieron`, `crossings`, `occupancy`, `decreceHaciaAfuera`, `sube`, `bloqueDelArchivo`, `huerfanos`, `baja`, `barreEnUnSentido`, `sobreElHorizonte`). **Ésa es la mitad del trabajo, y la regla que deja:** *un invariante que no se puede controlar positivamente no es un invariante caro de controlar — es un invariante mal escrito, y el costo de arreglarlo se paga una sola vez.*

    **Cuatro de las cifras que estos diez publicaban eran cotas que el CERO también cumple**, y ahora tienen contrapeso: «las capas nunca cubren más que el cuadro» (`s10-batido`: 0/0 sin fondo contra 31/24% con él), las 924 partículas en cuadro de `s10-particulas`, el «byte por byte» de `s7-export` —que podía estar comparando dos cadenas vacías— y el γ de contraluz de `s7-modelado`, que con la luz sobre el eje de la cámara cae a 0° y deja de cumplirse.

    ⚠️ **Y el censo lo movió un frente que NO podía tocarlo.** `s9-instrumentos.invariant.ts` no estaba en los editables del frente de la deuda, así que se puso en rojo con dos afirmaciones y **el frente frenó en vez de tocarlo**; la re-medición la hizo el agente principal en la integración. Es exactamente la forma de §7.29, y conviene que quede escrita dos veces: **actualizar un censo que el sprint existía para mover no es aflojar una afirmación** — un umbral se afloja cuando la propiedad dejó de cumplirse y se baja la vara; acá la propiedad es una cuenta y la cuenta subió. `contarControles` **no se tocó**: los 44 nuevos usan el marcador de etiqueta que ya sabía leer.

    Quedan los **siete controles que el lane EJERCE sin declarar con la frase**, listados con archivo y línea en el reporte de SITIO-S9: marcarlos es una decisión de contenido, no de marcador.

34. ✅ **LA ESCENA SE APAGA Y VUELVE — construido en SITIO-S9, y resultó más barato de lo que §2.4 imaginaba.**

    §2.4 pide que la escena *"se apague y vuelva"* y §7.2 lo leía como un efecto que había que componer. **La premisa se midió antes de construir nada, y da vuelta el trabajo:** si en las secciones opacas el panel ya tapa la sala, lo que falta no es un efecto visual — es **dejar de renderizar**.

    **La premisa se sostiene, y no se verificó sobre el fuente sino sobre el marcado que sale.** `s9-visibilidad.invariant.ts` §1 renderiza el `Panel` REAL de las ocho secciones con `renderToStaticMarkup`: las ocho emiten el relleno que su superficie declara, **ninguna lo punciona** —sin margen, radio, alfa ni modo de mezcla—, la pila no deja un hueco entre secciones, y el relleno vive en la `<section>` que lleva el recorrido y **no en el hijo `sticky`**, que era el riesgo real (Trabajos y Servicios miden 300svh con un hijo clavado de 100svh: si el relleno viviera ahí, 200svh de cada una dejarían ver la escena). **No hay ningún momento en que la sala asome detrás de un panel opaco, así que no hay efecto que componer.**

    ⚠️ **Y de paso corrige una cifra de la instrucción del sprint, con su medición al lado (regla 11):** *"en cinco de las ocho secciones el panel es opaco"* — son **SEIS de las ocho** (Quiénes somos, Números, Trabajos, Servicios, Tu panel y Cierre), y dos transparentes. El cinco es la cuenta correcta sobre otro denominador: las **siete que llevan recorrido de scroll**, o sea sin el Cierre. El **85,7%** del documento es panel opaco.

    **Cómo se construyó: `_lib/escena/visibilidad.ts`, sin desmontar nada.** El lazo de r3f pasa a `frameloop="never"` cuando ninguna ventana transparente está en cuadro: no dibuja un cuadro y no corre un `useFrame`, pero **el contexto de WebGL, las texturas, el shadow map y el árbol siguen vivos**. Volver cuesta un cuadro, no un montaje.

    ⚠️ **Volver sin salto no sale gratis, y por eso hay TRES fases y no un booleano.** Mientras el lazo está suspendido el enchufe sigue escribiendo `rig.progress` —es un listener de scroll, no un `useFrame`— así que al volver el objetivo está al día y **la pose amortiguada está vieja**; y el `delta` del primer cuadro no la salva, porque `setFrameloop` de r3f reinicia el reloj. Con `SETTLE_TAU` entre 0,20 y 0,28 s, volver sin hacer nada sería **un latigazo de ~1 s** visto por la rendija del panel que entra. La fase `reanudando` corre el lazo **con la física apagada**, que es el camino que `OrbitRig` ya tiene escrito: con `physics` en `false` la pose se escribe con `live[canal] = target[canal]`, o sea la pose exacta del progreso. **No agrega una línea al rig.**

    | | |
    |---|---|
    | banda suspendida | **75,0%** del recorrido (76,9% si el margen fuera cero) |
    | cuadros que no se dibujan en una pasada | **2.700 de 3.600** — supuesto declarado: 60 Hz y 60 s para las 13 pantallas |
    | **página QUIETA en una sección opaca** | **3.600 cuadros por minuto → CERO**, y no tiene tope: crece con el tiempo que la pestaña quede ahí |
    | lo que cuesta el mecanismo | 2 cuadros sin inercia por reanudación = **0,07%** de lo que ahorra |

    **Dos constantes con su cuenta y no con su gusto.** `MARGEN_DE_REANUDACION = 0,125` pantallas: la ventana derivada no tiene holgura —el diferencial está en cuadro exactamente mientras el scroll va de 11 a 13— y sin margen el lazo arrancaría en el instante en que el borde del panel toca el del cuadro, con el primer cuadro pintado un `rAF` después; lo que se vería en esa rendija **no es negro sino la pose vieja**, porque con el lazo en `never` el canvas conserva lo último que pintó. El margen tiene que durar los dos cuadros de la reanudación: 0,0625 pantallas por cuadro = **3,75 pantallas por segundo a 60 Hz**, o 112 px por cuadro en una ventana de 900. Cubre la rueda y el teclado; **no cubre una barra de scroll arrastrada, y ningún margen finito la cubre** — ahí se ve a lo sumo UN cuadro de pose vieja. Cuesta 1,9 puntos de banda. Y `CUADROS_DE_REANUDACION = 2` y no 1, aunque por la matemática alcanzara uno: el pulso que despacha «pintado» vive en un `rAF` del documento y el lazo de r3f en el suyo, y **nada ordena uno respecto del otro**; con un solo cuadro, si el pulso corriera primero, la física se encendería antes del cuadro exacto y el latigazo vuelve entero, como falla intermitente. ⚠️ Ese orden se **dedujo leyendo el código, no se midió**: si alguien lo mide y r3f siempre corre primero, la constante baja a 1 y la reanudación cuesta la mitad.

    ── ✅ **MEDIDO EN SITIO-S10, Y EL RESULTADO CONTRADICE A ESTE PÁRRAFO.**

    «Nada ordena uno respecto del otro» **no se sostiene contra `@react-three/fiber` 9.6.1**: el orden de registro **está determinado, y r3f va PRIMERO**. Lo produce `_lib/__tests__/s10-raf.invariant.ts` (28 afirmaciones · 14 controles positivos), afirmando la cadena eslabón por eslabón sobre el código instalado, con un control por eslabón:

    1. el `<Canvas>` corre `run()` desde un `useIsomorphicLayoutEffect` **sin arreglo de dependencias**, o sea que reconfigura en cada render y lo hace en la fase de **layout**;
    2. `configure()` compara `state.frameloop` con el pedido y llama `setFrameloop`, **síncrono**;
    3. ⚠️ **`setFrameloop` NO pide un cuadro** — sólo reinicia el reloj y escribe el estado. Éste es el eslabón que da vuelta la intuición;
    4. quien lo pide es `rootStore.subscribe(state => invalidate(state))`, o sea **cualquier escritura del estado**;
    5. `invalidate` ya no se sale por su guarda de `'never'` —el `set` ya escribió `'always'`— y hace `requestAnimationFrame(loop)` ← **REGISTRO 1**;
    6. recién después corre el `useEffect` **pasivo** de `EscenaDelHome` que arma el pulso ← **REGISTRO 2**;
    7. y una vez corriendo, `loop()` se re-registra **como su primera sentencia**, antes de correr un solo efecto.

    React vacía los efectos de layout antes que los pasivos, y `rAF` despacha en orden de registro. **Por la cadena leída, `CUADROS_DE_REANUDACION = 1` alcanzaría**, y eso vale 16,7 ms de los 33.

    ⚠️ **SITIO-S10 NO CAMBIÓ LA CONSTANTE, y no por prudencia: era un valor de la escena y ese sprint tenía prohibido moverlos.** Lo que cambió fue el docblock de `visibilidad.ts`, que pasó a declarar lo que se sabe y a citar el instrumento en vez de afirmar que no se sabe nada.

    ✅ **CERRADO EN SITIO-S11: `CUADROS_DE_REANUDACION` BAJÓ A 1.** La decisión era del humano y la instrucción del sprint la tomó, citando esta misma medición. Son **16,7 ms de los 33** que costaba una reanudación. El `MARGEN_DE_REANUDACION` NO se bajó con ella —queda holgado, 7,5 pantallas por segundo cubiertas en vez de 3,75— y está escrito por qué. Los dos huecos de arriba siguen abiertos y **ninguno cambia la conclusión**: en el mismo cuadro manda el orden de registro, y en el siguiente `loop` ya se re-registró primero.

    **Los dos huecos que quedan, declarados con `noCorre`:** que el planificador efectivamente lo *despache* en ese orden pide una traza con la pestaña al frente, y en qué cuadro exacto React vacía los pasivos no se deriva del fuente. **Ninguna de las dos ramas cambia la conclusión** — en el mismo cuadro manda el orden de registro; en el siguiente, `loop` ya se re-registró primero.

    ⚠️ **Lo que este ítem NO cierra:** que el navegador efectivamente deje de dibujar, y que volver no tenga salto. El invariante afirma la CADENA —qué fase pide qué lazo y qué física—, no su efecto. **Falta la verificación visual, y tiene que hacerse con la pestaña AL FRENTE**: con la pestaña ocluida toda medición de scroll da cero por construcción, y eso invalida cualquier corrida automatizada que no lo garantice.

35. ✅ **`scroll-padding-top` — ARREGLADO en la parada de SITIO-S9: 72 px, sin tocar el sitio vivo.**

    `src/app/globals.css:488` declara `scroll-padding-top: var(--spacing-ds-nav)` sobre el `<html>`, en `@layer base`, y `--spacing-ds-nav` vale `4rem` = **64 px**. Alcanza a `/v3` porque el layout raíz importa `globals.css`, y **gobierna de verdad** porque Lenis no corre en `/v3` (`SmoothScroll.tsx` se sale con `pathname.startsWith('/v3')`): el scroll es nativo, así que el navegador lo respeta.

    **Con dos varas, y las dos importan porque miden cosas distintas:**

    | vara | valor correcto | desvío de hoy |
    |---|---:|---|
    | despejar la pastilla de navegación de `/v3` | 72 px (24 de reposo + 48 de alto) | **8 px cortos** — el borde de la sección queda abajo de la pastilla |
    | que el bloque toque el borde del cuadro | 0 px — `/v3` no tiene barra fija que despejar | **64 px de sobra** — la sección aterriza corrida hacia abajo, y a un panel pinneado (`sticky top-0 h-svh`) se le va el pie fuera de cuadro |

    Afecta a las **siete** anclas del pie (`DESTINOS_DE_LA_RUTA`). **La parada eligió la vara de la pastilla: un ancla que aterriza debajo de la pastilla no sirve.**

    **El arreglo NO toca `globals.css`, y eso no era gratis.** `scroll-padding` va sobre el CONTENEDOR DE SCROLL —el `<html>`— y el `<html>` no lleva `[data-v3]`: la marca vive en el envoltorio de `v3/layout.tsx`. La salida es **`html:has([data-v3])`**, declarado en `_estilos/navegacion.css`, que es donde vive la geometría de la pastilla. La regla **sólo matchea cuando hay un `[data-v3]` en el documento**, así que sigue sin poder alcanzar al sitio vivo — que es la propiedad que el repo custodia — y el sitio viejo conserva sus 64 px.

    **El valor no es un 72 escrito:** es `calc(var(--spacing-6) + var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto))`, o sea la MISMA cuenta que `_lib/navegacion.ts` deriva para el borde inferior de la pastilla en reposo (`BORDE_INFERIOR_EN_REPOSO_PX`). `s9-instrumentos` §4 lo comprueba **resolviendo el `calc()` contra los tokens reales del tema**, no comparando texto: si mañana alguien mueve `--spacing-3`, el número se mueve en los dos lados o el invariante falla.

    ⚠️ **Y hubo que enseñarle algo al detector, que es la parte que vale.** `s3-tokens` §5 comprobaba «ninguna hoja de /v3 alcanza al sitio vivo» con un `startsWith('[data-v3]')`. Eso era un **PROXY de la propiedad, no la propiedad**: `html:has([data-v3])` la cumple y no cumplía el proxy. Se le enseñó **esa forma exacta y nada más** —anclada a la cadena completa y no a un `includes`, que dejaría pasar `html, button` con sólo nombrar la marca en otro lado (§7.25)— con **tres controles positivos**: el `html` pelado no pasa, un `:has()` de otra cosa no pasa, y un selector que sólo nombra la marca en otra parte tampoco. Es la misma lección que SITIO-S8 aprendió con el lector de los dos arneses: *un lector que no entiende un dialecto no reporta «no entiendo», reporta «falló»* — acá, reportaba «alcanza al sitio vivo» algo que no lo alcanza.

    ⚠️ **Lo que queda:** el aterrizaje REAL de las siete anclas en un navegador sigue declarado `noCorre`. Los 72 px son geométricos, derivados de tokens; confirmarlos pide la pestaña al frente.

36. ✅ **EL ACOPLAMIENTO DE TIPO HACIA `/probe-escena` — medido en SITIO-S9, declarado con su plan, y RESUELTO EN SITIO-S11 con el costo real.**

    Quedan **tres `import type { ChoreoEditor }`** hacia `@/app/probe-escena/_components/choreographyEditor`, desde `pistaDelHome.ts`, `OrbitRig.tsx` y `ProbeStage.tsx`. **Cuestan 0 bytes**, y eso ya no es memoria: está verificado sobre el fuente por cuatro caminos —las tres líneas son `import type`, `ChoreoEditor` está declarado `export type`, ninguno usa el nombre en posición de valor, y `tsconfig.json` declara `isolatedModules`—.

    ⚠️ **Lo que sí cambia el diagnóstico:** el día que `/probe-escena` se borre, `tsc --noEmit` corta con `TS2307` **pero `npm run build` SIGUE EN VERDE y el bundle no cambia un byte**, porque `next.config.ts` declara `typescript.ignoreBuildErrors: true`. **El acoplamiento no tiene guardia en el build.**

    **No se resolvió en SITIO-S9 a propósito, y es §7.26 con todas las letras:** resolverlo obliga a tocar `s8-escena.invariant.ts` §3 —que otro frente estaba reescribiendo en la misma pasada— y `ProbeStage.tsx`, que está en exactamente 300 líneas. **El plan exacto, para que el próximo no lo rehaga:** crear `_lib/escena/choreographyEditorTypes.ts` (módulo nuevo, y NO `choreographyTypes.ts`, que mide 240 y con los dos tipos pasaría de 300), mover ahí `ChoreoEditor` y `EditableKeyframe` —el único tipo del que depende y que todavía vive del lado del panel—, que `choreographyEditor.ts` los re-exporte para que ningún consumidor de `/probe-escena` cambie, y apuntar los tres imports al módulo nuevo, una línea cada uno y sin sumar ninguna.

    🔴 **EL COSTO QUE ESTE ÍTEM PUBLICABA ESTÁ INCOMPLETO, Y LO DESTAPÓ SITIO-S10 AL IR A APLICARLO.** Decía *«1 archivo nuevo, 4 líneas cambiadas, 1 afirmación reescrita»*, nombrando sólo `s8-escena.invariant.ts` §3. **Falta un archivo entero, y no es opcional:** `_lib/__tests__/s9-instrumentos.invariant.ts` **§2 es el instrumento que MIDE este acoplamiento**, y el arreglo le borra la premisa a cuatro de sus afirmaciones:

    | dónde | qué afirma | por qué se rompe |
    |---|---|---|
    | `s9-instrumentos:157-158` × 3 archivos | `IMPORT_DE_TIPO` — el especificador exacto `'@/app/probe-escena/_components/choreographyEditor'` | cambiar el especificador es justamente el arreglo |
    | `s9-instrumentos:177` | `/^export type ChoreoEditor = \{$/` sobre `choreographyEditor.ts` | con la re-exportación el editor deja de DECLARAR el tipo |

    **Y hay una quinta consecuencia que ningún costo nombraba:** las tres afirmaciones de «no importa un VALOR del panel» pasarían a ser verdaderas **por vacío** —el archivo ya no importaría nada del panel—, que es el modo de falla que este repo lleva diez sprints cazando. Reescribirlas bien significa cambiar el SUJETO de la sección: de *«el acoplamiento existe y es de tipo»* a *«el acoplamiento no existe, el tipo vive del lado de la escena y el panel lo re-exporta»*, con sus controles positivos nuevos.

    **El costo REAL, medido:** 1 archivo nuevo, 4 líneas de import, y **DOS instrumentos reescritos** —`s8-escena` §3 y `s9-instrumentos` §2, unas cinco afirmaciones con sus controles—.

    ✅ **SITIO-S11 LO RESOLVIÓ, y el costo real resultó mayor todavía: los tipos a mudar eran TRES y no dos.** `KeyframeOrigin` vivía del lado del panel y `EditableKeyframe` lo nombra, así que dejarlo allá habría **movido** el acoplamiento en vez de cerrarlo. Los tres viven ahora en `_lib/escena/choreographyEditorTypes.ts`, el panel los re-exporta —y **siete** consumidores suyos siguen tirando de esa re-exportación, derivados del disco y no de una lista— y los tres imports de producción apuntan al módulo nuevo. Los dos instrumentos se reescribieron: `s8-escena` §3 y `s9-instrumentos` §2, que pasó de 11 afirmaciones con 1 control a 19 con 4. **Las tres que quedaban verdaderas por vacío se reemplazaron** por una que el detector PUEDE fallar —«no nombra el panel en NINGÚN import, tampoco con `import type`»— con sus dos controles demostrándolo fallar. Ver §7.43.

    **SITIO-S10 lo había DECLARADO en vez de resolverlo**, que era una de las dos salidas que su instrucción admitía. El frente de la deuda lo vio, midió el costo verdadero y **frenó antes de escribir una línea**, porque `s9-instrumentos.invariant.ts` no estaba en sus editables. Queda registrado en `_lib/__tests__/s10-padron.ts` (`NO_ENTREGADOS`), que lo imprime con su razón en cada corrida — **un entregable que se saca de la lista sin dejar rastro convierte un freno en un olvido.**

37. 🔴 **UNA INSTRUCCIÓN QUE SE CONTRADICE PRODUCE TRABAJO CORRECTO SÓLO SI ALGUIEN LA LEE ENTERA.**

    Regla del proyecto desde SITIO-S9, y es **el hallazgo más importante de ese sprint** — más que el mapeo, porque el mapeo salió bien gracias a ella.

    ── **EL CASO: la frase que, tomada literal, rompía la escena**

    La instrucción de SITIO-S9 decía, sobre el frente del anclaje:

    > *«Cada sección llena el cuadro en el progreso de su ancla.»*

    Los seis keyframes llevan el nombre de la sección para la que se compusieron, y esa frase admite **dos lecturas que dan resultados distintos**:

    | | lectura | qué implica |
    |---|---|---|
    | **(i)** | **LLEGADA** — la pose que nombra a la sección se alcanza cuando la sección EMPIEZA a llenar el cuadro | es la lectura LITERAL de la frase, y vale para las seis |
    | **(ii)** | **TRAMO** — el tramo que nombra a la sección OCUPA la sección, y la pose lo cierra | la frase vale literal sólo para tres de las seis |

    **Con (i) el Hero llevaría 0,375 de progreso en UNA pantalla.** La cámara saldría de la pose del hero a un tercio de la primera pantalla y haría **los 130° de órbita completos** mientras el panel se va — en la única ventana, junto con el diferencial, donde la sala se ve. Y el docblock del keyframe `hero · sostén` dice, con esas palabras, que existe para que *«la cámara no esté orbitando ~20° durante la pantalla del hero»*: con (i) orbitaría **130°, o sea 6,5× lo que ese keyframe fue escrito para impedir**. Habría anulado un valor de la escena sin tocarlo, que es justamente lo que la regla 4 del sprint prohibía.

    ── **LO QUE DECIDIÓ: dos frases de la MISMA instrucción**

    No se eligió (ii) por criterio propio contra la instrucción. Se eligió porque **la instrucción se contradice, y sus otras dos frases sólo son verdaderas con (ii)**:

    1. *«entre Trabajos y Por qué develOP avanza sin que nadie la vea, detrás de **dos paneles opacos**»* — con (ii) son exactamente dos, Servicios y Tu panel. **Con (i) son tres**, porque el tramo escondido arrancaría adentro de Trabajos.
    2. Las dos filas *(avanza oculto)* de su propia tabla son **Servicios y Tu panel** — que con (ii) son literalmente el tramo `demos`, y con (i) no.

    Y hay dos fuentes más que apuntan al mismo lado: §2.2 declara los tramos en pantallas de su sección (*«Quiénes somos · 2 pantallas · 0° → 130°»*), y §2.4 dice que la cámara *«se queda ahí la pantalla entera»*.

    **Se eligió (ii), y lo que cuesta se declaró en vez de esconderse:** la frase literal vale para **tres** de las seis —Hero (0,000), Por qué develOP (0,750) y Cierre (1,000), las que ARRIBAN sobre su pose— y para las otras tres la pose es la de **salida**. Las tres que arriban son, además, las que la medición de tinta necesitaba.

    ── **LA REGLA, y por qué no es «leé con cuidado»**

    > **Una instrucción es una fuente como cualquier otra (§7.32), y una fuente puede contradecirse a sí misma. Cuando una frase tomada literal choca con otra frase de la misma fuente, no se elige la que suena más específica: se buscan TODAS las frases que discriminan entre las lecturas, se elige la que las satisface, y se DECLARA qué parte de la instrucción quedó sin cumplirse literalmente y por qué.**

    Lo que hace operativa la regla es la última parte. Un ejecutor que elige en silencio produce trabajo que nadie puede auditar: el que lea después ve una instrucción y un resultado que no coinciden, y no puede saber si fue criterio o descuido. **La elección se escribe con las frases que la forzaron** — acá, en `_lib/escena/anclaje.ts`, antes de despachar un solo frente.

    ── **LAS OTRAS DOS AFIRMACIONES DE LA INSTRUCCIÓN DE SITIO-S9 QUE LA MEDICIÓN CORRIGIÓ**

    - **«en cinco de las ocho secciones el panel es opaco»** — son **SEIS** (Quiénes somos, Números, Trabajos, Servicios, Tu panel y Cierre) y dos transparentes. El cinco es la cuenta correcta sobre otro denominador: las **siete que llevan recorrido de scroll**, o sea sin el Cierre. Las dos cuentas quedan afirmadas en `s9-visibilidad` §1.2 para que la de la instrucción no se lea como un desacuerdo sino como otro conjunto.
    - **«sin ese chunk `/v3` mediría 235,3»** (heredada de §7.30) — el techo real de la deferencia es **77,9 KiB gzip y no 142,1**, así que `/v3` quedaría en **299,6**. La corrección entera, con su causa, está en §7.30.

38. ✅ **MOBILE — EL SEGUNDO SITIO, MIRADO POR PRIMERA VEZ (SITIO-S10) — SUS SEIS DEFECTOS, ARREGLADOS EN SITIO-S11 SALVO EL PESO. Ver §7.43.**

    Abajo de 1025 no hay escena ni coreografía, y eso está decidido y es correcto. **Lo que nadie había mirado es que abajo de 1025 hay un sitio entero**, y que todo lo construido se juzgó a 1440. Se midió a **375, 390 y 768**, con los tres altos que este repo declara (667 · 844 · 900), sobre el marcado renderizado y con los tokens resueltos por ancho. **Todo es cálculo estático:** el instrumento es `_lib/__tests__/s10-mobile.invariant.ts` y su modelo de alto declara sus supuestos.

    ── 🔴 **1 · SERVICIOS MUESTRA UNO DE TRES SERVICIOS, Y EN LOS DOS LADOS DEL UMBRAL, POR CAUSAS DISTINTAS.**

    Es el hallazgo más grande del sprint, y lo encontraron **dos frentes independientes desde lados opuestos**:

    | | qué pasa | por qué |
    |---|---|---|
    | **abajo de 1025** | los servicios 2 y 3 **no se ven** | `_contrato/Seccion.tsx` le da a `pinneada: 'siempre'` un hijo `sticky top-0 `**`h-svh`** —alto FIJO— y adentro `ServiciosApilados` apila tres bloques `min-h-svh`. Tres pantallas de contenido dentro de una caja de una, clavada 200svh. Tinta sola adentro de la caja: **963 px @375×667 (1,44×) · 942 @390×844 (1,12×) · 1583 @768×900 (1,76×)** |
    | **arriba de 1025** | los servicios 2 y 3 **no están en el árbol de accesibilidad** | `ServiciosEnSecuencia` monta **uno por vez** (`PanelDeSecuencia` renderiza `SERVICIOS[indice]`). El árbol pasa de 26 a 24 encabezados y de 43 a 33 marcadores. Quien navegue por encabezados sin scrollear no llega a los otros dos |

    **La causa de abajo es la doble contención que dejó la unificación de contratos de SITIO-S7**: la rama pinneada del lane A se sumó a la contención propia que traía el lane B, y nadie las restó. Y el propio `servicios/geometria.ts` tiene escrito en su docblock *«el alto de un bloque es `min-h-svh`, no `h-svh`»* — la convención de la sección y la del envoltorio se contradicen, y gana la del envoltorio.

    ── 🔴 **2 · TRABAJOS DEJA DOS PANTALLAS DE BANDA OSCURA VACÍA ENTRE 768 Y 1024.**

    `tablet:grid-cols-3` **ya aplica en 768**, así que los tres proyectos entran en fila y el flujo mide **1 pantalla contra las 3 declaradas**. El `escritorio:min-h-0` que apaga la pantalla-por-proyecto arranca en **1025**, y la fila arranca en **768**: entre esos dos anchos nadie sostiene el alto. A 375 y 390 sí se llenan (3 = 3), o sea que la decisión de SITIO-S5 se cumple **sólo donde la grilla colapsa**.

    ── 🔴 **3 · LA PASTILLA DE NAVEGACIÓN NO ENTRA EN UN TELÉFONO.**

    Mide **600 px** (piso, con los avances reales del `.woff2`; los rótulos van `font-semi`, que es más ancho). Es `absolute; left:50%; translateX(-50%)`, **sin `flex-wrap`, sin tope de ancho y sin una sola media query** —los dos hechos afirmados sobre el CSS—. A 375 se sale **112 px por lado**; a 390, **105**. Entra recién desde ~600 px. Enlaces: Quiénes somos 131 · Trabajos 87 · Servicios 90 · Por qué develOP 139 · Contacto 88.

    ── ⚠️ **Dos cifras heredadas que NO se reproducen** (regla 11: se corrigen con su medición al lado)

    - **«~810 px»** —los tres proyectos apilados de Trabajos, en los docblocks de `_lib/secciones.ts` y `Trabajos.tsx`— da **624 px** a 375 con el instrumento nuevo. Y ya no gobierna nada: desde que cada proyecto lleva `min-h-svh`, la pila mide **tres pantallas** y no su alto intrínseco. **Describe un marcado que ya no existe.**
    - **«1029 px @375»** (§7.28, `s8-cierre` §14) da **1018**. Sale de leer los tokens **FIJOS** donde el marcado emite las clases **FLUIDAS**, y de suponer tres líneas de titular donde el corte real da **dos**. **La conclusión de §7.28 no cambia** —1018 > 667 igual— y por eso el alto del Cierre sigue sin tocarse.
    - **Confirmado y extendido:** la columna del recorrido sigue siendo la más alta del pie en los cinco anchos, y **las tres columnas se apilan abajo de 768, no abajo de 1025**.

    ── **DECISIONES, que no son defectos**

    - **Números colapsa a una columna a 375 y 390**: sus **21** clases de posición viven en `tablet:` y **ninguna** sobrevive. Lo que queda es la asimetría de TAMAÑO, que el docblock ya declara, y se reproduce: **36 · 24 · 18 · 16 px**.
    - **El Cierre y Tu panel crecen** a 375 (1018 px y 800 px de tinta en su primera pantalla, contra 667). El `alto` es un `min-height`: crecen, no recortan. Lo que cuesta es que **el ritmo de mobile los subestima**, que es lo que §7.28 ya dejaba anotado.
    - **El umbral de la pastilla se acorta con el alto** (667→571 · 844→748 · 900→804) y es correcto: la aritmética es relativa a `100svh` y no lleva un número copiado.

    ── ⚠️ **DOS TAMAÑOS QUE SE CAEN DEL SISTEMA A 375**

    - `--text-fluido-micro` cae a **8 px**, un **20% por debajo del propio piso fijo del sistema** (`--text-micro` = 10 px). Lo consumen los rótulos de las cifras, las etiquetas de sección y la nota legal del pie.
    - `--text-fluido-titulo-s` resuelve a **16 px**, exactamente `--text-base` y 1 px arriba de `--text-cuerpo`: **la cifra más chica de Números deja de leerse como cifra.**

    ── **EL PRESUPUESTO, repartido archivo por archivo**

    377,4 KiB gzip · 24 archivos. **Piso del framework 248,2** en 5 archivos, de los cuales 142,1 son el SDK de Sentry (§7.30, no se difiere). **Sobre el piso: 129,2 KiB en 19 archivos**, y ahí está la respuesta a *«¿qué de esto no debería estar abajo de 1025?»*:

    | | archivos | gzip | de quién |
    |---|---:|---:|---|
    | también los pide `/` | 16 | **111,7 KiB** | el layout raíz — no son de `/v3` |
    | propios de `/v3` | 3 | **17,5 KiB** | de este track |

    **La escena y el instalador de coreografía NO viajan** en la carga inicial: cero chunks con `three`, con r3f o con `InstaladorDeCoreografia`, afirmado. **Y el candidato obvio no sirve:** los 42,7 KiB del sistema de motion los pide `/` también, así que diferirlos abajo de 1025 **desde este track no baja un byte de esta ruta**. Lo único propio que aparece es **Lenis: 1 chunk, 5,5 KiB gzip, en todos los anchos, y `SmoothScroll` se sale de `/v3` por `pathname.startsWith('/v3')`** — o sea que viaja y no se usa nunca. ~~Dueño: el layout raíz.~~

    🔴 **LA ATRIBUCIÓN ERA FALSA, Y LA CORRIGIÓ SITIO-S11 SOBRE EL FUENTE (regla 11).** El dueño **NO es el layout raíz**: es **`src/context/TransitionContext.tsx`, que es un archivo FROZEN**, y lo es vía `useLenis` —lo importa de `components/layout/SmoothScroll`, y `TransitionProvider` se monta en ese layout—. La consecuencia es la que da vuelta el plan: **sacar `<SmoothScroll>` del layout raíz no bajaría un byte**, porque el módulo sigue en el grafo por el archivo congelado, y con él `lenis` y `lenis/dist/lenis.css`, que se importan de forma estática ahí. Medido sobre el build: el chunk lo referencian **18 de las 19 rutas prerenderizadas**.

    **La única palanca real** es hacer dinámico el `import Lenis from 'lenis'` **adentro de `SmoothScroll.tsx`**, y eso es dos cosas a la vez: un archivo del SITIO VIVO, y un **cambio de comportamiento** —Lenis y su hoja pasarían a inicializarse después de un pedido de chunk extra, en todas las rutas con clientes reales—. SITIO-S11 lo dejó sin hacer por eso, y lo escribe acá y no sólo en su ledger: **una palanca mal atribuida se vuelve a proponer**, y ésta ya se propuso una vez apuntando al lugar equivocado.

    ⚠️ **`LCP` y `Lighthouse` son HUECOS y se declaran con `noCorre`, no se estiman.** Los dos piden un navegador con la pestaña al frente.

39. ⚠️ **ACCESIBILIDAD — LA VENTAJA, VERIFICADA SOBRE EL HOME COMPUESTO (SITIO-S10) — CINCO DE SUS OCHO DEFECTOS CERRADOS EN SITIO-S11; QUEDAN DOS, ABIERTOS POR DECISIÓN. Ver §7.43.**

    Cada componente había verificado lo suyo; **nadie había recorrido las ocho secciones juntas**. Lo produce `_lib/__tests__/s10-acceso.invariant.ts` (62 afirmaciones · 10 controles positivos) sobre el marcado del documento entero, con los envoltorios del layout derivados del fuente.

    ── **LO QUE GANAMOS, verificado y no citado**

    **`<main>` existe**, y lo pone `src/app/v3/layout.tsx` — la referencia no lo tiene en cinco de sus seis URLs. Anillo de foco en **las 15** paradas, ≥3:1 en todas. **Cero `tabindex` positivos, cero saltos de nivel, un solo `h1`**, las 15 paradas con nombre accesible, ningún CTA ni titular anunciado dos veces, y `prefers-reduced-motion` apaga el sistema entero: 0 transformadas, 0 `will-change`, 0 piezas del divisor, texto completo.

    ── **LOS DEFECTOS, por gravedad**

    | # | gravedad | qué | dueño |
    |---|---|---|---|
    | 1 | **alta** | **un texto a 2,80:1** — `text-tinta-tenue` (`#5A5A5A`) sobre `#0E0E0E` en el `<p>` de ayuda del formulario de novedades. No llega a AA ni a 3:1, **y es el único texto que explica por qué el envío está deshabilitado**. Es el único fallo de AA de todo el home | `chrome/Novedades.tsx` dentro del Cierre |
    | 2 | **alta** | **el sitio NO tiene landmark `contentinfo`**: el `<footer data-pieza="pie">` vive adentro de `<section id="cierre">`, y un `<footer>` dentro de contenido seccionante no mapea a `contentinfo`. El pie no se alcanza navegando por regiones | la sección Cierre |
    | 3 | media | **el orden de foco no es el visual** (WCAG 2.4.3): las paradas **1 a 5 de 15** son la pastilla, que nace a `100svh − 72px`, o sea al **89,2% / 91,5% / 92,0%** de la primera pantalla según el alto. Quien tabula la encuentra primero y la ve abajo de todo el Hero | el chrome |
    | 4 | media | **no hay enlace «saltar al contenido»**: cinco paradas de navegación antes de la primera del contenido, en las dos ramas | el chrome |
    | 5 | media | **2 landmarks donde podría haber 10**: ninguna de las **ocho** `<section>` apunta con `aria-labelledby` a su titular, así que ninguna aporta `region` | las ocho secciones |
    | 6 | media | **la trampa del tema**: `[data-seccion="invertida"]` redefine `--color-tinta` pero **no** `--color-tinta-media` ni `--color-tinta-tenue`. Hoy las 15 `text-tinta-media` caen todas en secciones claras; el día que una pase a invertida da **2,51:1** y nada se queja. **Es la causa del defecto 1** | `theme-develop.css` |
    | 7 | baja | el `navigation` está **anidado en el `main`**, así que un «saltar al contenido principal» no saltearía la navegación; y no hay `banner` | el chrome |
    | 8 | baja | Servicios es la única de las ocho **sin un encabezado que la nombre**: sus tres servicios entran como `h2` hermanos de los titulares de las otras siete | Servicios |

    ── **DECISIÓN, no defecto: los 43 marcadores se leen en voz alta**

    **43 verificados** (la cifra era correcta), 12 tipos, ninguno fuera del vocabulario cerrado, ninguno en un subárbol oculto. Por sección: quiénes somos 3 · números 5 · trabajos 6 · **servicios 15** · tu panel 4 · por qué develOP 5 · cierre 5. Cómo suena, transcrito:

    > **Números**, cinco seguidos sin nada entre medio: *«Lo que se puede contar · CIFRA Proyectos entregados · CIFRA Clientes activos · CIFRA Años en el mercado · CIFRA Tiempo de respuesta · CIFRA Procesos automatizados»*
    >
    > **Trabajos**, tres tarjetas idénticas: *«CAPTURA · Esquina · Lo que cambió MÉTRICA · CAPTURA · El Garage · Lo que cambió MÉTRICA · CAPTURA · Matsu Automotores · Lo que cambió MÉTRICA»*
    >
    > **Cierre**, la línea legal entera: *«develOP · FECHA · NOMBRE · ENLACE»*

    El mejor caso es el marcador adentro de la frase —*«…entre CIFRA negocios que ya operan con lo que construimos»*—; el peor son los **cuatro que se anuncian como una palabra suelta sin contexto**: `[FOTO DEL EQUIPO]`, `[CAPTURA]`, `[VIDEO]`, `[PÓSTER]`. **NO SE ARREGLA:** la regla del sprint es que el contenido inventado parezca inventado, y `marcadores.ts` declara la forma como deliberada.

40. ⚠️ **LA COMPOSICIÓN DEL LOGO CONTRA EL TEXTO — medida, con una premisa corregida (SITIO-S10) — EL CODO DE `travelX` Y EL RECORTE NO DECLARADO, ARREGLADOS EN SITIO-S11; LA SUPERPOSICIÓN, RE-MEDIDA Y ABIERTA. Ver §7.43.**

    Lo produce `_lib/escena/__tests__/s10-logo.invariant.ts`, con un muestreador de **máscara de logo con posiciones** —que `cuadro.ts` no tenía— validado por **dos controles de equivalencia**: las celdas con tinta igualan a `muestrearCuadro(...).enLogo` exacto, y la suma de sus valores reproduce `media × total − Σ sinLogo`. El segundo valida **el sombreado del logo**, que ningún instrumento anterior podía comprobar porque `s8-tinta` descarta justamente esos píxeles. Hereda la ventana de `cuadro.ts`: cámara de `harness.ts` (§7.15), sin partículas, sin sombra proyectada, sin especular — **techo, no piso**.

    ── ⚠️ **LA PREGUNTA NO APLICA EN CUATRO DE LOS CINCO ANCHOS, y eso es un resultado**

    La escena sólo existe desde 1025, así que a 375, 390, 768 y 1024 **no hay canvas y el logo no compite con nada**: cuatro `noCorre` con su motivo, en vez de cuatro números inventados. Lo que sí varía y nadie había mirado es **la relación de aspecto**: a 1025 va de 1,139 a 1,537 según el alto, contra el 1,600 de 1440×900 con el que se compuso todo.

    ── 🔴 **EL CONTRASTE DONDE SE SUPERPONEN: 1,11:1.** Ver §7.29, donde queda la corrección al cierre de la tinta.

    ── **FRACCIÓN DENTRO DEL CUADRO Y SUPERPOSICIÓN**

    | sección | cuadro | dentro | del cuadro | superposición con la caja de texto (mín – máx) |
    |---|---|---:|---:|---|
    | hero | 1440×900 | **100,0%** | 6,5% | **0%** – 13% |
    | hero | 1025×900 | **100,0%** | 8,7% | **0%** – 32% |
    | por qué develOP | 1440×900 | 99,4% | 25,5% | **6%** – 44% |
    | por qué develOP | 1025×900 | **99,0%** | **35,9%** | **16%** – **72%** |

    ⚠️ **LA PREMISA DE LA INSTRUCCIÓN NO SE REPRODUCE (regla 11).** *«En el Hero el logo queda cortado por el borde del cuadro»* — **no lo está**: entra al 100% en los cuatro aspectos y en toda su ventana. Lo que sí pasa a cuadros más altos es que **se corre hacia la izquierda, sobre la columna de texto** (su borde va de +0,04 a −0,16), porque `travelX` encoge con el aspecto. Queda un `afirmar` en verde como guardián: si un sprint decide recortar el Hero a propósito, esa afirmación se pone en rojo y ahí hay que escribir la decisión.

    **En el diferencial la superposición MÍNIMA sobre todas las posiciones verticales es 6–16%, o sea mayor que cero:** no hay altura de pantalla que deje el titular limpio, porque la banda del logo cruza la columna entera. **En el Hero el mínimo SÍ es 0**, así que ahí es un problema de posición vertical y no de banda — dos defectos distintos que se veían como uno.

    ── ⚠️ **QUE `demos` LLENE EL CUADRO ES DECISIÓN; QUE SE SALGA POR ARRIBA, NO ESTÁ DECLARADO**

    `choreography.ts:287` lo dice con esas palabras: *«Es la única pose donde el logo llena el cuadro —81% del alto en tinta— y es la excepción que la arquitectónica se reserva»*. **Llenar y salirse no son lo mismo:** a p=0,750 la caja llega a y=+1,05 con el borde en +1,00, y `choreography.ts` **no menciona un recorte en ninguna línea**. Es poca área (≈1%) y es una decisión que nadie escribió.

    ── 🔴 **EL CODO DEL ENCUADRE — §7.6 deja de ser una pregunta sin número**

    `travelX = max(0, medioAncho − LOGO_W/2) × 0,88` tiene un **codo en cero** en aspecto **1,213 (harness) / 1,162 (rig)**. O sea que **a 1025×900 (aspecto 1,139) el `frameX: 1` de la pose `demos` no corre el logo ni un píxel, en las dos cámaras.** **La composición lateral de la pose más íntima del recorrido está INERTE en el cuadro más alto**, y la perilla que la gobierna no tiene recorrido. El Hero no tiene el problema: su codo está en 0,567.

    ── **LAS PALANCAS, con su número. Ninguna aplicada.**

    | palanca | qué mueve | qué rompe |
    |---|---|---|
    | `frameX` del Hero 0,68 → 0,8 / 0,9 / 1 | el borde izquierdo del logo **−0,106 / −0,083 / −0,035**; la columna de texto termina en **+0,297**, así que **ni en el tope de 1 libera la columna** | el destino del preloader (`scene-framing.ts` proyecta ESE keyframe) y la perilla abierta de §7.1 |
    | `frameX` de `demos` | **sin recorrido**: ya está en 1 y el codo lo deja inerte a aspecto ≤1,21 | — |
    | distancia de `demos` 9 → 11 / 13 / 15 | la cobertura del cuadro cae **35,9% → 24,4 / 17,6 / 13,2%**, y sigue dentro al 100% | «el momento más íntimo» de §2.2, y `altura ≤ −0,214 × distancia`, que pone el sol en cuadro |
    | la medida del titular del Hero 3/5 → 2/5 | la columna pasa de **477 a 312 px** y su borde derecho de +0,297 a **−0,024**: limpia el logo a 1440 | el titular pasa de **2 a 4 líneas** |
    | dónde cae la sección en el progreso | a p=0,875 el logo ocupa **5,3%** contra 35,9% en p=0,750 | el cruce de AA del fondo en p=0,878 (§7.29) y **el anclaje entero de SITIO-S9. La más cara.** |
    | `FRAME_TRAVEL_SAFETY` 0,88 → 1 | +13,6% de recorrido **donde hay encuadre** | **cero** donde el codo ya lo dejó inerte: no toca el caso encontrado |

41. ⚠️ **EL BANCO COMPARTIDO SE PROBÓ A SÍ MISMO, Y LO ROMPIERON SUS CONSUMIDORES — no su autor (SITIO-S10).**

    Es la primera vez que el método de este repo —**escribir lo compartido ARRIBA, antes de despachar**— se somete a una prueba que puede fallar, y conviene escribir el resultado porque no era el esperado.

    La Fase 0 de SITIO-S10 escribió un banco de medición compartido (once archivos, 94 afirmaciones, 17 controles positivos) y **lo verificó en verde antes de despachar un solo frente**. Aun así **tenía tres defectos**, y **los tres los encontraron los frentes que lo consumían, ninguno el que lo escribió**:

    | # | qué estaba mal | quién lo vio | antes → después |
    |---|---|---|---|
    | 1 | `landmarks()` filtraba por «tiene rol», no por «tiene rol DE LANDMARK» | el frente de accesibilidad | publicaba **6 landmarks donde hay 2** — contaba los cuatro `<figure role="img">` |
    | 2 | `marcadoConMovimientoReducido()` forzaba el árbol ANIMADO con la preferencia puesta | el frente de accesibilidad | **52 transformadas** de un estado que producción NUNCA sirve → 0, y el estado imposible queda aparte, rotulado como control |
    | 3 | `cajasDeTexto` sólo miraba `data-nivel`, y `TextoPorLineas` no lo emite | el frente del logo | **no veía el titular del Hero**, o sea la caja más grande de la sección más importante, y devolvía una lista que se leía completa |

    ── **POR QUÉ ESTO ES EL ARGUMENTO A FAVOR DEL BANCO Y NO EN SU CONTRA**

    La lectura fácil es «el banco estaba mal, entonces escribirlo antes no sirvió». **Es al revés, y por tres razones que se pueden nombrar:**

    1. **Los tres defectos existían igual.** Sin banco, cada frente habría escrito su propio lector de landmarks, su propio helper de movimiento reducido y su propio extractor de cajas — y **cada uno habría tenido su propia versión del error, sin forma de compararlas**. Un defecto compartido se encuentra una vez; cuatro defectos paralelos no se encuentran nunca, porque no hay contra qué contrastarlos.
    2. **Los encontró quien lo USABA, que es el único que podía.** El defecto 3 sólo se ve desde la pregunta *«¿dónde cae el titular del Hero?»*, que es del frente del logo; el 2 sólo se ve desde *«¿qué sirve producción con la preferencia puesta?»*, que es del de accesibilidad. **El autor del banco no tenía la pregunta**, y ninguna relectura se la iba a dar. Es la misma forma que §7.19 registró con `cn()`: dos lanes aislados encontraron el mismo defecto por caminos distintos, y ninguno era el dueño del archivo.
    3. **Los tres se arreglaron en la integración, con control positivo, y los tres frentes siguieron en verde.** Un defecto de instrumento encontrado durante el sprint cuesta una edición; encontrado después cuesta re-medir todo lo que publicó.

    > **LA REGLA:** *un instrumento compartido no se valida releyéndolo — se valida entregándoselo a alguien que tenga una pregunta que el autor no tenía.* El banco no se escribe antes para que salga bien; se escribe antes **para que sus errores sean uno solo y aparezcan mientras todavía se pueden arreglar.**

    Corolario operativo, para el próximo sprint con frentes en paralelo: **el reporte de cada frente tiene que poder decir «el banco está mal», y el agente principal tiene que arreglarlo en la integración en vez de defenderlo.** Los tres arreglos quedaron marcados en su lugar del código, con el número de antes y el de ahora, y con un control positivo cada uno (`s10-lectura.invariant.ts` y `s10-banco.invariant.ts` §1).

42. ⚠️ **LAS CIFRAS HEREDADAS QUE NO SE REPRODUCEN — la lista completa de SITIO-S10, incluida la de su propia instrucción.**

    Regla 11 del proyecto: una cifra publicada se corrige **con su medición al lado**, nunca borrándola. Y §7.32 ya había dejado escrito que **la instrucción de un sprint es una fuente como cualquier otra, y una fuente que se equivoca se corrige igual**. Éstas son las nueve de este sprint, con quién las publicaba y qué da hoy.

    | # | lo que decía | dónde | lo que da | quién lo midió |
    |---|---|---|---|---|
    | 1 | *«en el Hero el logo queda cortado por el borde del cuadro»* | **la instrucción de SITIO-S10** | **NO lo está: entra al 100%** en los cuatro aspectos y en toda su ventana | `s10-logo.invariant` |
    | 2 | *«nada ordena un `rAF` respecto del otro»* | §7.34 | el orden **SÍ está determinado y r3f va primero**, sobre r3f 9.6.1 | `s10-raf.invariant` |
    | 3 | *«1 archivo nuevo, 4 líneas cambiadas, 1 afirmación reescrita»* | §7.36 | 1 archivo, 4 líneas y **DOS instrumentos** reescritos | el frente de la deuda, al ir a aplicarlo |
    | 4 | *«los tres proyectos apilados miden ~810 px»* | docblocks de `secciones.ts` y `Trabajos.tsx` | **624 px** a 375 — y **ya no gobierna nada**: con `min-h-svh` la pila mide tres pantallas | `s10-mobile.invariant` |
    | 5 | *«1029 px @375»* | §7.28 y `s8-cierre` §14 | **1018 px** — leía tokens FIJOS donde el marcado emite los FLUIDOS, y suponía 3 líneas donde el corte real da 2. **La conclusión de §7.28 sobrevive** | `s10-mobile-pie.ts` |
    | 6 | *«cuatro instrumentos arriba de 300 líneas»* | §7.17 | **cinco** — faltaba `s9-instrumentos.invariant.ts`, que ya estaba en 333 | la integración |
    | 7 | *«6 landmarks de 17 candidatos»* | el banco de la Fase 0 | **2** | el frente de accesibilidad |
    | 8 | *«siete `<section>` sin nombre accesible»* | el banco de la Fase 0 | **ocho** | el frente de accesibilidad |
    | 9 | *«`choreographyNotes.ts` no existe en el repo»* | el reporte del frente del logo | **sí existe**, en `probe-escena/_components/`. Es §7.13 otra vez: §6 lo nombra **sin ruta**, y después de la mudanza de SITIO-S8 un nombre pelado no resuelve contra nada | la integración |

    ── ⚠️ **LA #1 ES DE LA INSTRUCCIÓN, Y ES LA QUE MÁS IMPORTA DEL MÉTODO**

    La instrucción de SITIO-S10 pedía medir *«qué fracción del logo queda dentro del cuadro»* partiendo de que **en el Hero está cortado**. **No lo está**: la fracción dentro es **100,0%** a 1440×900 y a 1025×900, en toda la ventana de progreso del Hero. Lo que sí pasa —y es un problema real, sólo que otro— es que **a cuadros más altos el logo se corre hacia la IZQUIERDA, sobre la columna de texto**: su borde va de +0,04 a −0,16 porque `travelX` encoge con el aspecto.

    **La instrucción vio bien el síntoma y le puso la causa equivocada**, que es exactamente lo que §7.32 describe. Si el frente hubiera aceptado la premisa habría medido un recorte que no existe y no habría encontrado el codo de `travelX` (§7.40), que es el hallazgo de verdad de esa sección. Quedó un `afirmar` **en verde** como guardián: el día que alguien decida recortar el Hero a propósito, esa afirmación se pone en rojo y ahí hay que escribir la decisión.

    El recorte que **sí** existe es el de `demos`, por arriba, ≈1% del área — y **`choreography.ts` no lo menciona en ninguna línea**, así que es una decisión que nadie escribió (§7.40).

43. ✅ **LOS DIECIOCHO DEFECTOS DE SITIO-S10, ARREGLADOS EN SITIO-S11 — QUINCE CERRADOS, TRES ABIERTOS POR DECISIÓN.**

    S10 midió y no tocó nada. S11 arregló, y la regla que gobernó el sprint entero fue una: **un arreglo no está hecho hasta que el instrumento que encontró el defecto lo confirme.** No se escribió ni una comprobación nueva para los arreglos — se reusaron `test:s10-mobile`, `test:s10-acceso` y `test:s10-logo`, que ya traían sus controles positivos, y **lo que se movió fue su CENSO**: donde afirmaban la forma del defecto, ahora afirman la del arreglo, con el control intacto o más fuerte.

    ── **LA TABLA, DEFECTO POR DEFECTO, CON SU INSTRUMENTO**

    | # | defecto | antes | después | instrumento |
    |---|---|---|---|---|
    | 1 | Servicios muestra 1 de 3 **abajo de 1025** | flujo `1 1 1 1` contra 3 declaradas · 1 caja de alto fijo · tinta 963/942/1583 px en una caja de 667/844/900 | flujo **`3 3 3 3`** · **cero** cajas de alto fijo abajo del umbral · tinta 1060/1014/1594 px en las 3 pantallas declaradas (0,53× · 0,40× · 0,59×) | `test:s10-mobile` §2 §3 |
    | 2 | Servicios muestra 1 de 3 **arriba de 1025** (el árbol) | 24 encabezados y 33 marcadores en la rama animada | **27 y 43**, y el árbol animado es **idéntico** al quieto, elemento por elemento | `test:s10-acceso` §4 §7 |
    | 3 | Trabajos deja dos pantallas de banda oscura vacía entre 768 y 1024 | flujo `3 3 1 1` | **`3 3 3 3`** | `test:s10-mobile` §2 |
    | 4 | la pastilla no entra en un teléfono | 600 px de fila · se sale **112 px por lado a 375** y 105 a 390 | pinta **311 / 326 px** · desborde **0** · sin una sola media query | `test:s10-mobile` §8 |
    | 5 | el `<p>` de ayuda de novedades a 2,80:1 | **2,80:1** — el único fallo de AA del home | **6,44:1** AA · inventario de fallas **vacío** | `test:s10-acceso` §10 |
    | 6 | no hay landmark `contentinfo` | 0 | **🔴 ABIERTO** — tres paredes medidas, abajo | `test:s10-acceso` §5 |
    | 7 | superposición del logo con el titular del diferencial | mínimo **6–16%**, contraste 1,11:1 | **re-medido: 6–16%**, sigue > 0 en los cuatro cuadros · **🔴 ABIERTO por decisión** | `test:s10-logo` §4 §5 |
    | 8 | el orden de foco no es el visual | la 1ª parada del contenido es la **6ª**, sin escape | la **1ª parada es el salto**; la 1ª del contenido es la 7ª, **a una pulsación** | `test:s10-acceso` §2 §3 |
    | 9 | no hay enlace «saltar al contenido» | no existe | parada **1** del documento en las dos ramas, visible al enfocarlo (17,60:1) | `test:s10-acceso` §2 |
    | 10 | 2 landmarks donde podría haber 10 | **2** | **10** — `main`, `navigation` y las ocho `region` | `test:s10-acceso` §5 |
    | 11 | la invertida no redefine `--color-tinta-media` ni `-tenue` | no las redefine · media daría 2,51:1 | las redefine · **7,21:1** y **6,44:1** sobre `#0E0E0E` | `test:s10-acceso` §10 |
    | 12 | `--text-fluido-micro` cae a 8 px | **8 px** a 375, un 20% abajo del piso fijo del sistema | **10 px** — ningún nivel cae bajo la vara | `test:s10-mobile` §9 |
    | 13 | `--text-fluido-titulo-s` resuelve a 16 px = `--text-base` | **16 px** | **17 px** — las cinco cifras a `36 · 24 · 18 · 17` | `test:s10-mobile` §4 §9 |
    | 14 | `travelX` tiene un codo en cero | recorrido **0,0000** a 1025×900, en las dos cámaras | **0,1936** (arnés) y **0,0595** (rig) · la perilla mueve en los cuatro aspectos | `test:s10-logo` §7 |
    | 15 | `navigation` anidado en `main`, y no hay `banner` | 1 `navigation` adentro del `main` | **🔴 ABIERTO** — misma pared que el 6 | `test:s10-acceso` §5 |
    | 16 | Servicios es la única sin un encabezado que la nombre | 26 encabezados, ninguno suyo | `h2` propio + los tres servicios en `h3`, sin mover un tamaño | `test:s10-acceso` §4 |
    | 17 | Lenis viaja a `/v3` y nunca se usa | 5,5 KiB gzip en 18 de las 19 rutas | **NO SE HIZO** — el dueño no es sólo el layout raíz, abajo | `test:s10-mobile` §10 |
    | 18 | el recorte por arriba de `demos` no está declarado | `choreography.ts` no lo menciona en ninguna línea | declarado en el docblock de la pose, con su medición | `test:s10-logo` §6 |

    **El peso, después de todo: 377,6 KiB gzip en 24 archivos**, contra los 377,4 que midió S10 — **+0,2 KiB**. Propios de `/v3`: 3 archivos, 17,7 KiB (eran 17,5). Los quince arreglos entraron por 200 bytes gzip.

    ── 🔴 **LO QUE QUEDÓ ABIERTO, Y POR QUÉ. LAS TRES SON DECISIÓN DEL HUMANO.**

    **7 · La superposición del logo con el titular — RE-MEDIDA DESPUÉS de arreglar `travelX`, como la instrucción mandaba.** El arreglo bajó la superposición justo donde el codo la había dejado sin perilla, y **no la cerró**: a 1025×900 va de 16–72% a **14–71%** y la cobertura del cuadro de 35,9% a 35,7%; a 1440×900 no se movió, porque está arriba del codo. **El mínimo sigue siendo mayor que cero en los cuatro cuadros: 6%–16%.** No hay alto de pantalla que deje el titular limpio, y ahí el contraste es **1,11:1** —peor, p05, mediana y mejor píxel, los cuatro—. La regla ya está fijada: el texto no puede quedar encima del logo.

    ✅ **LA SALIDA ESTÁ DECIDIDA, Y NO ES NINGUNA DE LAS CINCO PALANCAS. VA AL SPRINT SIGUIENTE.**

    Las palancas de composición de escena no alcanzan, y el número lo dice: la mejor de todas —`FRAME_TRAVEL_SAFETY` 0,88 → 1— corre el logo **2,90% de cuadro** en el mejor de los cuatro casos, contra una superposición mínima de **6%–16%**. Mover la escena para resolver esto es pedirle a la perilla equivocada cuatro veces lo que puede dar una.

    **La salida es de LAYOUT: la columna de texto del diferencial se acota a la IZQUIERDA, fuera de la silueta del logo.** Y no es una invención: **es lo que el Hero ya hace**, y es exactamente por eso que el Hero tiene superposición mínima **0%** y el diferencial no. Los dos números que la sostienen: el logo cubre **35,7%** del cuadro en el peor caso (1025×900, p=0,750), o sea que **queda un 64% libre**. No hay que achicar el logo ni correr la sección: hay que dejar de poner el texto abajo de la mancha.

    La referencia de composición es el Hero, y el instrumento que lo mide ya existe (`s10-logo` §4 publica banda del logo y caja de texto para las dos secciones, en los cuatro cuadros). **Ni la escena ni las poses se tocan.**

    **6 y 15 · El `contentinfo` y el `banner` — tres paredes, y la tercera es del instrumento.**

    1. **El `<footer>` no está adentro de la sección Cierre: ES la sección.** `Pie` envuelve el rótulo, el `h2`, el CTA, las columnas y la línea legal. «Sacarlo afuera» no mueve una pieza: mueve la sección entera.
    2. **El alto lo declara `_lib/secciones.ts` (`cierre: 100svh`)**, que es entrada del anclaje de SITIO-S9 y este sprint tenía prohibido tocar. Con esa restricción, partir el pie deja un hueco oscuro de **≈532 px a 1440** y **≈218 px a 375** entre el CTA y el pie; moverlo entero deja la `<section>` vacía ocupando 900 px.
    3. **Y aunque se hiciera, este instrumento no lo vería.** `s10-banco.ts` compone el documento como *«todo adentro del `<main>`»* —deriva del fuente sólo las aperturas de `<div>` y `<main>`—, así que **nada emitido fuera del `<main>` existe para el modelo**: mover la pastilla o el pie **bajaría** las cifras (paradas 16 → 11, landmarks 10 → 9) por ceguera del modelo y no por regresión. El patch que lo desbloquea está escrito: que `envoltorioDelLayout` derive también las aperturas de `<header>` y `<footer>` con el mismo `aperturaDeJsx`, y que `marcadoDelDocumento` componga `raíz + cabecera + Navegacion + main + home + /main + Pie + /raíz`. Son ~6 líneas y dos imports, más los dos gemelos del control que `s10-banco.invariant.ts` ya tiene para el `<main>`.

    ⚠️ **Y hay una contradicción de definición que hay que resolver ANTES de decidir el tamaño del arreglo.** La instrucción de S11 dice que el `<footer>` no mapea *«por estar adentro de contenido seccionante»*, o sea que bastaría sacarlo de la `<section>`. **El modelo de S10 es más estricto:** `s10-lectura.ts` mete `main` en `SECCIONANTES`, así que un `<footer>` hermano de las ocho —pero dentro del `<main>`— tampoco contaría. Las dos lecturas existen: HTML-AAM lista `main`; el texto del HTML define «scoped to body» por *sectioning content/roots*, donde `main` no está. Con el modelo vigente, el pie tiene que salir del `<main>`.

    ✅ **EL ORDEN ESTÁ DECIDIDO, Y ES ÉSTE: PRIMERO EL MODELO, DESPUÉS EL PIE.**

    La pared (3) es la que manda. **Un instrumento que modela el documento como «todo adentro del `<main>`» no puede ver el arreglo**, y mover el pie o la pastilla antes de arreglarlo *bajaría* las cifras —paradas 16 → 11, landmarks 10 → 9— por ceguera del modelo y no por regresión. El patch de ~6 líneas de arriba **va primero**, con sus dos controles gemelos en `s10-banco.invariant.ts`. Recién con el modelo viendo lo que se emite fuera del `<main>` se toca el marcado.

    ✅ **Y LA SEPARACIÓN DEL CIERRE ESTÁ DECIDIDA, contra la pared (1).** `Pie` envuelve hoy cinco cosas: rótulo, `h2`, CTA, columnas y línea legal. **El corte va entre la tercera y la cuarta:** el CONTENIDO DE CIERRE —rótulo, `h2` y CTA— se queda en la `<section id="cierre">`, que es donde pertenece porque es la octava sección del recorrido; y **las columnas y la línea legal salen al `<footer>`**, que es lo que un pie de sitio es y lo único que tiene que mapear a `contentinfo`.

    ⚠️ **PENDIENTE DE RECÁLCULO, y es la condición de entrada del sprint que lo tome:** el alto. `secciones.ts` le da al cierre `alto: '100svh'` y esa entrada alimenta el anclaje de SITIO-S9, así que **no se toca sin volver a medir el anclaje**. Con el corte de arriba la `<section>` se queda con rótulo + `h2` + CTA, y hay que volver a correr el modelo de `s10-mobile` §7 y el de `s8-cierre` §14 para saber cuánto mide esa tinta sola en los cinco anchos y si los 100svh siguen siendo el piso correcto o pasan a sobrar. **Las cifras de hueco que S11 publicó (≈532 px a 1440, ≈218 a 375) valen para el corte que S11 evaluó, no para éste.**

    **17 · Lenis — NO SE HIZO, y la atribución de §7.38 está incompleta.** §7.38 publica *«Dueño: el layout raíz»*. **No alcanza con el layout raíz, y está verificado sobre el fuente:** `src/context/TransitionContext.tsx` —que es **frozen**— importa `useLenis` de `components/layout/SmoothScroll`, y `TransitionProvider` se monta en ese layout. O sea que **sacar `<SmoothScroll>` del layout no bajaría un byte**: el módulo sigue en el grafo por el archivo congelado, y con él `lenis` y `lenis/dist/lenis.css`, que se importan de forma estática ahí. El chunk lo referencian **18 de las 19 rutas prerenderizadas**, `/v3` incluida.

    La única palanca es hacer dinámico el `import Lenis from 'lenis'` **dentro de `SmoothScroll.tsx`**, y eso es dos cosas que este sprint no podía hacer: un archivo del sitio vivo que no estaba autorizado, y **un cambio de comportamiento** —Lenis y su hoja pasarían a inicializarse después de un pedido de chunk extra, en todas las rutas con clientes reales—. La instrucción admitía exactamente esta salida: *«si no se puede sin tocar comportamiento, no lo hagas y reportalo»*.

    ── ⚠️ **LO QUE EL SPRINT ROMPIÓ AL ARREGLAR, Y QUEDA ESCRITO**

    - **`--text-fluido-micro` DEJÓ DE SER FLUIDO, y es forzado.** Su piso no puede bajar de `--text-micro` (10 px) sin reabrir el defecto 12, y su techo está anclado en ese mismo 10 px por medición. De las tres —piso ≥ el fijo del sistema, techo anclado, banda no nula— **sólo se pueden tener dos**. El `clamp()` se escribió **sin `vw`**: un `+ 0vw` habría dejado en verde a `s3-tipografia` §2 sobre una expresión que no interpola, así que esa comprobación pasó a medir **la pendiente** y no la presencia de la unidad. Disparador: el día que el techo de `micro` suba, la banda vuelve sola con el método que el tema publica.
    - **Dos afirmaciones de S7 estaban VERDES POR SUBCADENA.** `s7-ritmo` §2 y `s7-integracion` §4 verificaban el alto del hijo pegado con `html.includes('h-svh')`, y `min-h-svh` contiene esa subcadena: el cambio del contrato las habría dejado en verde diciendo algo falso. Las dos leen ahora la clase **del elemento con `data-pinneado`** y comparan por token exacto, con un control que rechaza la subcadena.
    - **La voz única de Servicios tenía TRES copias**, y la instrucción nombraba dos. La tercera vivía en `_secciones/_invariantes/s6-render.invariant.tsx`. Las tres afirman ahora lo mismo y más fuerte: los tres servicios en el árbol **y exactamente una capa pintada** — que es lo que la regla del acento siempre quiso decir, porque lo que no puede haber son dos acentos en el mismo cuadro, no dos nodos en el documento.
    - **`s6-render` §3 perdió su premisa.** Afirmaba la CONTENCIÓN («todo lo que se anuncia con coreografía se anuncia también sin ella») porque la igualdad literal era falsa **por el defecto 2**. Cerrado el defecto, las dos ramas dicen lo mismo y la comprobación pasó a ser una **igualdad**, estrictamente más fuerte.
    - **`encabezados().texto` cuenta dos veces el titular en la rama animada**, en los tres que salen de `CanalDeTitular`: el `h2` trae adentro la copia accesible del divisor Y sus piezas visibles. No es un defecto del producto —las piezas van `aria-hidden` y el texto anunciado es correcto— pero **cualquier comparación de árboles tiene que usar `textoAnunciado` y no el crudo**. Quedó escrito en `s10-acceso` §4, que es donde apareció.
    - **`s10-acceso` §5 no verificaba que un `aria-labelledby` aterrizara.** `rolDeLandmark` da por bueno el atributo sin mirar si el id existe, así que una sección con la referencia rota seguiría contando como `region` y se quedaría sin nombre en el árbol real: un verde por vacío esperando. Con ocho referencias recién escritas, S11 lo cerró — se afirma que ninguna cuelga, en las dos ramas, con su control positivo.
    - **EL DETECTOR DE VENTANA DE LOS CHECKS DE FRONTERA ESTABA ROTO, y lo destapó este sprint.** `s3-frontera` cruzaba sus testigos contra `rutasTocadas()`, que no distingue quién los tocó: los 35 archivos de S3 están commiteados hace ocho sprints, pero **cuatro de ellos los modificó S11** (`_estilos/navegacion.css`, `_estilos/foco.css`, `chrome/Navegacion.tsx`, `tipografia/Titular.tsx`), así que el detector declaraba DENTRO DE VENTANA un sprint que no era el suyo y ponía en rojo **cuatro afirmaciones que medían un diff ajeno**. La premisa correcta ya estaba escrita en su propio docblock —*«son altas»*— y no se usaba. Ahora los testigos se buscan entre las ALTAS (`rutasDadasDeAlta()`), que es un estado que **sólo produce quien crea el archivo**: los sprints que vienen después lo modifican, nunca lo dan de alta. Es la regla 12 aplicada a su propio detector, y el control que faltaba —el que habría visto el defecto— ejercita **el filtro** con los tres estados que `git status` emite, en vez de alimentarlo con una lista ya filtrada.
      ⚠️ **Consecuencia a nombrar:** con el check bien fechado, **ningún instrumento vigila hoy los dos toques declarados en `/probe-escena`**. Antes los reportaba —en rojo, y por la razón equivocada—. Quedan declarados acá y en el reporte del sprint; el lugar donde vivirían es un check de frontera propio de S11, que no existe.
    - **`s9-instrumentos.invariant.ts` se partió en tres.** Ya medía 361 líneas antes del sprint —una violación heredada de la regla de las 300 que ningún instrumento cubre para `_lib/__tests__/`— y la reescritura de §2 lo llevó a 470. Se cortó por tema: `s9-acoplamiento.ts` (§2) y `s9-scrollPadding.ts` (§4), y el invariante quedó en 226.
    - **`travelX` está escrito CUATRO veces en el repo, y sólo se arregló donde manda.** El rig (`_lib/escena/cameraFraming.ts`, vía el módulo nuevo `encuadre.ts`) es el que corre en producción y es el que se arregló: `max(0, h − m/2)` → `abs(h − m/2)`, que es la continuación de la misma geometría —los bordes coinciden en `d = ±(h − m/2)` de los dos lados— y da el MISMO número donde el argumento ya era positivo. `probe-escena/__tests__/harness.ts` conserva la fórmula vieja, y por eso existe `_lib/escena/__tests__/camaraDelCuadro.ts`, que compone la cámara del arnés con el recorrido corregido y **prueba la equivalencia arriba del codo**; el arreglo verdadero es que `harness.ts` importe `recorridoDeEncuadre` de `encuadre.ts` —que es three-free justamente para eso— y que ese archivo desaparezca.
    - **La cuarta copia es `src/lib/scene-camera.ts`, y NO se tocó a propósito.** Es la cámara sin `three` que lee el preloader (`scene-framing.ts`) y su consumidor es `home-intro/`, que este sprint tiene prohibido tocar. El codo está inerte en toda la banda donde las dos cámaras tienen que coincidir —la escena sólo existe desde 1025, o sea aspecto ≥ 1,139, y el codo del Hero está en 0,567— **pero muerde en un teléfono en vertical** (375×812 da 0,462), así que arreglarlo movería el punto de aterrizaje del logo del preloader del home VIVO en portrait. Decisión del humano.
    - **Dos toques declarados en zonas cerradas, los dos mínimos y los dos con su razón.** `probe-escena/_components/choreographyEditor.ts` re-exporta los tres tipos mudados: es el plan exacto que §7.36 dejó escrito y sin él el acoplamiento se mueve en vez de cerrarse. Y `probe-escena/_components/choreographyNotes.ts` recibió la declaración del defecto 18: §6 de este documento dice que **los comentarios de cada keyframe se editan ahí y no en el array**, y `test:s7e-export-sprites` lo hace cumplir comparando byte por byte lo que el exportador emite contra lo que el archivo tiene. Escribirla en `choreography.ts` a mano dejaba ese round-trip en rojo con 1.135 bytes de diferencia.

    ── ⚠️ **UNA CONTRADICCIÓN ENTRE DOS INSTRUMENTOS, SIN RESOLVER**

    `s8-largos.ts` documenta la vigilancia de los seis heredados como *«≤ el largo declarado»*, y `s9-instrumentos` §3 la implementa con **igualdad estricta** (`hoy !== base`). Las dos fallan igual cuando un archivo engorda, así que el defecto nunca se vio; pero no son la misma regla, y con la de la prosa un archivo que ADELGACE pasaría mientras que con la del código se pone en rojo. Queda anotado: es una línea, y decidir cuál de las dos vale es una decisión, no un arreglo.

44. 🔴 **EL ATERRIZAJE DEL LOGO DEL PRELOADER ESTÁ MAL HOY, EN PRODUCCIÓN, EN UN TELÉFONO EN VERTICAL — la cuarta copia de `travelX` (SITIO-S11).**

    Es un hallazgo del sprint que **no es de `/v3`**: toca el HOME VIVO, sale con nombre propio y con su número porque quedar como una nota de «lo que frenó» lo esconde.

    ── **EL HECHO**

    `travelX` está escrito **cuatro veces** en el repo, con la misma fórmula copiada:

    | copia | quién la usa | estado |
    |---|---|---|
    | `_lib/escena/cameraFraming.ts` (vía `_lib/escena/encuadre.ts`) | el rig de `/v3` | ✅ **arreglada en S11** |
    | `_lib/escena/__tests__/camaraDelCuadro.ts` | el muestreo de `s10-logo` | ✅ compuesta con la corregida, con su control de equivalencia |
    | `probe-escena/__tests__/harness.ts` | el arnés compartido | ⚠️ conserva la vieja — fuera del alcance del sprint |
    | **`src/lib/scene-camera.ts`** | **el PRELOADER DEL HOME VIVO**, vía `scene-framing.ts` | 🔴 **conserva la vieja, y ahí sí muerde** |

    ── **POR QUÉ LA CUARTA NO ES COMO LAS OTRAS DOS**

    En las otras tres el codo es inerte en toda la banda que importa: la escena de `/v3` sólo existe desde 1025, o sea aspecto ≥ **1,139**, y el codo de la pose del Hero está en ~~**0,567**~~ — muy por debajo. Ahí `max(0, ·)` y `abs(·)` devuelven el mismo número por construcción, y `s10-logo` §7 lo afirma en 6 de los 8 cuadros medidos.

    🔴 **EL 0,567 ES DE OTRA CÁMARA, Y LO CORRIGIÓ SITIO-S12 (regla 11).** Ese número sale de la caja del ARNÉS (`LOGO_W` = 7,168). **`scene-camera.ts` no usa esa caja**: usa `SCENE_LOGO_MESH_WORLD.width` = 6,863213, y **su codo cae en 0,542855** — afirmado en `test:s8e-encuadre` §7. La corrección no es cosmética, y cambia qué se puede medir: **375×667 da aspecto 0,562219, que está ARRIBA de 0,542855**, así que en ese par —uno de los dos que el «orden para el sprint que lo tome» de abajo manda medir— **el arreglo es un no-op exacto**. Quien midiera 375×667 y 390×844 vería «uno cambia y el otro no» y lo leería como una inconsistencia del arreglo, cuando es la geometría. Los tres pares que sí caen debajo del codo real están en §7.47.

    **Pero `scene-camera.ts` no tiene compuerta de 1025: el preloader corre en TODO ancho, y el home vivo se abre en teléfonos.** Un 375×812 da aspecto **0,462**, y un 390×844 da **0,462** también: los dos **por debajo del codo de 0,567**. Ahí `travelX` vale **0** y el `frameX: 0,68` de `SCENE_ENTRY_POSE` —la pose que `scene-framing.ts` proyecta para saber dónde aterriza el logo 2D del preloader— **no corre el logo ni un píxel**. O sea: **en un teléfono en vertical el logo del preloader aterriza centrado cuando la pose pide que caiga corrido, y eso está pasando hoy en producción.**

    ── **POR QUÉ NO SE ARREGLÓ, Y QUÉ HABRÍA QUE MIRAR PRIMERO**

    `src/lib/scene-camera.ts` alimenta a `home-intro/`, que este sprint tiene **prohibido tocar**, y su consumidor es el sitio vivo con clientes reales. Y el arreglo no es cosmético: cambiar `max(0, ·)` por `abs(·)` **mueve el punto de aterrizaje del logo del preloader en portrait**, que es justamente el instante que el intro existe para clavar (§1.1: *«el corte tiene que caer en el frame preciso»*). Es un cambio que se juzga por grabación, en un teléfono, y no por un invariante.

    **El orden para el sprint que lo tome:** (1) medir dónde aterriza hoy y dónde aterrizaría con la corrección, en los dos teléfonos que este repo declara (375×667 y 390×844) — `scene-framing.invariant.ts` ya proyecta el keyframe y tiene una quinta copia de la fórmula en su §228, que hay que mover con las otras; (2) recién ahí decidir. **La deuda de fondo es la copia:** cinco escrituras de la misma fórmula es lo que hizo que arreglarla en una dejara las otras cuatro mintiendo. `_lib/escena/encuadre.ts` es three-free justamente para que las cinco puedan importarlo.

45. ⚠️ **DOS CORRECCIONES DE MÉTODO QUE SITIO-S11 PAGÓ, Y LAS DOS VAN A VOLVER.**

    ── **1 · PEDIR UN NÚMERO Y QUE EL ARREGLO CORRECTO DÉ OTRO**

    La instrucción de SITIO-S11 pedía, en su parada, que los encabezados volvieran **a 26**. El arreglo correcto da **27**, y no es una desviación: **26 era el árbol SIN el encabezado que el defecto 16 manda agregar**. Ver 26 al final del sprint habría significado que el 16 no se arregló.

    Los dos defectos son del mismo frente y estaban en la misma instrucción, así que el número se escribió antes de componer sus dos efectos. **Es la misma clase que §7.32 y §7.37 ya describen** —una fuente que se equivoca se corrige con su medición al lado— y deja una regla operativa: **una afirmación no se escribe contra el literal que pidió la instrucción, se escribe contra la propiedad.** Por eso `s10-acceso` §4 no compara dos números: compara los dos árboles **elemento por elemento**, y esa versión no se puede satisfacer con el número equivocado.

    ── **2 · `git stash` DEVUELVE EL ÁRBOL EN CRLF Y ROMPE LOS INSTRUMENTOS**

    En la integración se usó `git stash push -u` + `git stash apply` para medir una línea de base de `eslint` contra `HEAD`. **`core.autocrlf` está en `true`**, así que el `apply` reescribió los **72 archivos** del árbol en CRLF.

    Para `git` no cambió nada —normaliza a LF al hashear, y el diff quedó idéntico— pero **puso en rojo dos agregados sin que una línea de código cambiara**. La firma es la peor posible: `s7-export.invariant.ts` busca el bloque de keyframes con `source.indexOf('/**\n * El recorrido.')`, deja de encontrarlo y reporta *«12357 bytes emitidos contra **0** en el archivo»* — un cero que se lee como «el exportador no emitió nada» cuando lo que pasó es que el archivo dejó de matchear.

    **La regla, y es de la familia de las dos que `CLAUDE.md` ya tiene** —Tailwind envenenado por un `distDir`, `tsc` roto por un build interrumpido—: *un instrumento que se pone en rojo sin que el código haya cambiado está midiendo el ENTORNO, no el archivo.* Y la operativa: **no se usa `git stash` en este repo para consultar `HEAD`.** Para eso está `git show HEAD:<ruta>`, que no toca el árbol de trabajo. Si igual hubo un `stash apply`, se vuelve a LF con un barrido sobre lo que devuelve `git status`.

    🔴 **EL ALCANCE ERA CORTO, Y SITIO-S12 LO PAGÓ CON OTRO COMANDO.** La regla nombraba a `git stash`, y el culpable nunca fue `stash`: es **el filtro de `core.autocrlf`, que corre en toda escritura de `git` sobre el árbol de trabajo**. S12 revirtió UN archivo con `git checkout -- <ruta>` —una operación que no es `stash`, que no consulta nada y que parece inocua— y `Cierre.tsx` volvió con sus **154 líneas en CRLF**.

    **La regla, ampliada:** *cualquier comando de `git` que ESCRIBA en el árbol —`checkout`, `restore`, `switch`, `stash apply`, `merge`, `revert`, `reset --hard`— aplica el filtro y devuelve CRLF. Los que sólo LEEN —`git show`, `git diff`, `git log`— no tocan un byte.* Operativa: para consultar `HEAD`, `git show HEAD:<ruta>`; para revertir, `git show HEAD:<ruta> > <ruta>`; y si hubo una escritura de `git`, **se vuelve a LF ANTES de correr un instrumento**, porque la firma del defecto es un rojo sin diff.

46. 🔴 **LOS TRES ABIERTOS DE §7.43, EJECUTADOS EN SITIO-S12 — UNO CERRADO Y DOS DECISIONES ANULADAS POR LA MEDICIÓN.**

    S11 dejó tres decisiones tomadas y sin construir. S12 fue a construirlas, y **dos de las tres quedaron ANULADAS** — no por alcance ni por tiempo, y no «abiertas»: **anuladas, porque la medición refuta la premisa sobre la que se tomaron**. Las dos van abajo con la premisa citada, el número que la refuta, y la salida NUEVA que ese número señala. Las salidas nuevas están **anotadas y no ejecutadas**: son de otro sprint.

    ── ✅ **LA FASE 0: EL MODELO DEL DOCUMENTO, PARCHADO — y las cifras NO se movieron**

    El patch que §7.43 dejó escrito está aplicado. `s10-banco.ts` ya no compone el documento como *«todo adentro del `<main>`»*: **deriva el ESQUELETO ENTERO del layout** —etiquetas literales con sus atributos, componentes desde un registro declarado, y `{children}` como ranura— en `_lib/__tests__/s10-esqueleto.ts` y `s10-jsx.ts`.

    | | modelo VIEJO | modelo NUEVO |
    |---|---:|---:|
    | bytes del documento (rama quieta) | 62 351 | **62 351** |
    | bytes del documento (rama animada) | 70 154 | **70 154** |
    | landmarks · paradas · encabezados | 10 · 16 · 27 | **10 · 16 · 27** |

    **Los dos documentos son idénticos byte a byte sobre el árbol de aquel momento**, así que el patch no traía sesgo escondido: lo que el modelo viejo componía a mano, el nuevo lo deriva y da lo mismo. **El control positivo que lo habilita como árbitro** —el que §7.43 exigía— está en `s10-banco` §2: el MISMO documento con el pie AFUERA del `<main>` cuenta **más** landmarks que con el pie adentro (11 → 12 hoy), y el que aparece es exactamente el `contentinfo`. Con tres controles más: el derivador no inventa un `<header>` ni un `<footer>` que el layout no tenga, y el modelo **TIRA** —no saltea en silencio— si el layout monta un componente que no está declarado.

    ── ✅ **DEFECTO 15 — CERRADO: hay `banner` y el `navigation` salió del `main`**

    | | antes | después | instrumento |
    |---|---|---|---|
    | landmarks | **10** | **11** | `test:s10-acceso` §5 |
    | clases de landmark | `main · navigation · region` | **`banner · main · navigation · region`** | idem |
    | `<nav>` anidados en `<main>` | 1 | **0** | idem, y `test:s8-chrome` §1 |

    **Cómo, sin mover un píxel.** La forma obvia —envolver la pastilla en un `<header>`— **rompe el mecanismo en silencio**: `position: sticky` se pega dentro de su contenedor de bloque, y un `<header>` alrededor de un envoltorio de `block-size: 0` mide cero, así que el rango de pegado sería **cero** y la pastilla se iría con el scroll. Es el mismo defecto que `ChromeDelHome` documenta para un `<div>` intermedio, con otra cara. La salida es que **el envoltorio `sticky` SEA el `<header>`** (`Navegacion` recibió una prop `como`, con default `div` para la galería): no hay caja nueva, el contenedor de bloque pasa de `<main>` a `[data-v3]` —cuyo alto en flujo ES el del `<main>`, afirmado— y el rol se gana gratis.

    ⚠️ **Y obligó a mudar el `<main>` del layout a la página, que es una consecuencia que sólo se ve pensando en el apilado.** `<main class="relative z-10">` crea un contexto de apilado. Con la pastilla (`--z-cabecera` = 100) afuera y el overlay del intro (z 9999) adentro, el overlay quedaba **aplastado al 10 del `<main>`** y la pastilla se habría pintado ENCIMA del preloader, en la primera visita de la sesión y sin que ningún instrumento lo viera. Con el `<main>` alrededor de las ocho y no alrededor de todo, los dos vuelven a compartir contexto.

    **La propiedad que §7.39 celebra no cambió** —el documento TIENE un `<main>`, que la referencia no tiene en cinco de sus seis URLs— **cambió quién lo pone**, y `s10-banco` §2 lo afirma ahora sobre el documento compuesto y exigiendo que sea **exactamente uno**, con su control. Es la regla 15: la afirmación vieja estaba escrita contra el fuente del layout y se habría puesto en rojo por el arreglo que la instrucción mandaba hacer.

    ── 🔴 **DEFECTO 6 — DECISIÓN ANULADA: EL ORDEN ERA CORRECTO Y NO ERA SUFICIENTE**

    > **La premisa, citada:** *«EL ORDEN ESTÁ DECIDIDO, Y ES ÉSTE: PRIMERO EL MODELO, DESPUÉS EL PIE. La pared (3) es la que manda.»* (§7.43)

    **El orden era correcto, y sobre las tres paredes que S11 midió era suficiente.** La pared (3) —que el instrumento no podía ver el arreglo— **está levantada**: el patch de la Fase 0 está aplicado y el modelo cuenta más landmarks con el pie afuera que adentro. Lo que anula la decisión no es un error de S11: **es una cuarta pared que no vio nadie**, ni S11 al decidir ni la instrucción de S12 al mandarlo ejecutar.

    > **El progreso de la escena NO sale de la tabla de `secciones.ts`: sale de `document.documentElement.scrollHeight`** (`EscenaDelHome.tsx:148`). El anclaje de SITIO-S9 se DERIVA de la tabla. Las dos coinciden **mientras todo lo que suma alto de documento sea una de las ocho secciones.**

    Sacar el pie de la `<section id="cierre">` rompe esa coincidencia, y el `alto` es un `min-height`: la sección **no se achica** al perder contenido —se queda en su pantalla— y el pie se suma entero.

    | | hoy | sección partida | pie partido | agrega |
    |---|---:|---:|---:|---:|
    | @375 | 1046 px | 412 | **746** | +112 |
    | @390 | 1047 px | 413 | **746** | +112 |
    | @768 | 726 px | 354 | **484** | +112 |
    | @1440 | 741 px | 368 | **485** | +112 |

    Los +112 px son exactamente `2 × --spacing-20`: **el corte duplica el relleno vertical**, porque afuera de `Pie` la sección deja de heredar el `padding-block` de `_estilos/pie.css` y tiene que declararlo. Y lo que mueve el anclaje es el pie entero:

    | | documento | con el pie afuera | el progreso que hoy vale **0,750** pasa a |
    |---|---:|---:|---:|
    | 1440×900 | 12 600 px | 13 085 px | **0,7201** |
    | 375×667 | 9 338 px | 10 084 px | **0,6906** |

    **0,750 es donde el diferencial llena el cuadro, y es el progreso exacto en el que §7.29 mide su tinta (6,07:1) y §7.40 su superposición.** Mover el pie corre el mapeo entero **sin tocar una línea del anclaje**, que la regla 4 del sprint prohíbe. Lo produce `test:s10-mobile` §7.

    ✅ **EL GUARDIÁN DE LA CUARTA PARED — `test:s8-montaje` §4b.** Escrito DESPUÉS de pisar la trampa, y va con nombre porque ése es su trabajo: **es el control que la habría visto antes**. Afirma que **todos los hermanos del `<main>` están FUERA DEL FLUJO, y lo dice la HOJA, no el marcado** —hoy son el salto (`position: absolute`) y la pastilla (`block-size: 0`)—, con dos controles positivos: ve una pieza que sí está en el flujo, y ve una que la hoja no menciona. El día que alguien meta algo en el flujo afuera del `<main>`, se pone en rojo **antes** de que el anclaje se mueva en silencio.

    ── ✅ **LA SALIDA NUEVA DEL DEFECTO 6 — ANOTADA, NO EJECUTADA: el desbloqueo no es el pie, es DE DÓNDE SALE EL PROGRESO**

    **El defecto real no es que el pie esté adentro de la sección: es que el progreso se derive de `scrollHeight`.** `EscenaDelHome.tsx:148` mide `document.documentElement.scrollHeight`, o sea **un documento que incluye cosas que no son secciones**. Que hoy no haya ninguna es una coincidencia, no una garantía — y la coincidencia se rompe con el primer elemento en flujo que se agregue afuera de las ocho, sea el pie o cualquier otra cosa.

    **Si el progreso se derivara de la EXTENSIÓN DE LAS SECCIONES** —lo que ya declara `_lib/secciones.ts` y de donde el anclaje de SITIO-S9 saca sus nudos— **un pie afuera del `<main>` no movería nada, y el defecto 6 se destraba solo.** Las dos fuentes dejarían de poder divergir, que es la propiedad que §4b custodia hoy por afuera.

    Los números con los que hay que evaluarla, ya medidos: el pie afuera suma **485 px a 1440×900 y 746 px a 375×667**, y eso corre el progreso del diferencial de **0,750 → 0,7201** y de **0,750 → 0,6906**. Con el progreso derivado de las secciones, esos tres pares se vuelven **0,750 → 0,750** y la tabla entera de §7.29 y §7.40 sigue valiendo sin volver a medirse. **Es un cambio en la escena —`EscenaDelHome.tsx`— y por eso no es de este sprint.**

    ── 🔴 **DEFECTO 7 — DECISIÓN ANULADA: LA PREMISA ES FALSA, MEDIDA**

    > **La premisa, citada:** *«La salida es de LAYOUT: la columna de texto del diferencial se acota a la IZQUIERDA, fuera de la silueta del logo. Y no es una invención: **es lo que el Hero ya hace**, y es exactamente por eso que el Hero tiene superposición mínima 0% y el diferencial no.»* (§7.43)

    🔴 **ES FALSA, y el número que la refuta es una resta: la columna del Hero empieza en 188 px y la del diferencial en 32.** El Hero **empieza más a la DERECHA**, no más a la izquierda, porque lleva la columna lateral de 140 px del rótulo; y las dos TERMINAN casi en el mismo lugar —el `h1` del Hero en **+0,27** a 1440 y el `h2` del diferencial en **+0,31**—. Si alguna de las dos está «acotada a la izquierda» es la del diferencial, o sea la que se iba a acotar.

    **Lo que separa a las dos secciones no es la columna: es cuánto cuadro ocupa el logo.** En el Hero ocupa el **8,7%** y vive a la derecha, así que hay altura de pantalla donde el titular queda limpio; en `demos` ocupa el **35,7%** y su banda cruza el cuadro de lado a lado, así que no la hay. Está afirmado en `test:s10-logo` §9, con el instrumento que la propia instrucción nombraba como confirmación.

    **Y la salida decidida tampoco llega a cero.**

    **2 · La salida no llega a cero, y en dos de los cuatro cuadros EMPEORA.** Acotar la columna la hace más angosta; más angosta la hace más ALTA —`lineasDeTexto` recuenta con los avances reales del `.woff2`— y una caja más alta se queda sin altura de pantalla donde escapar (`barridoVertical`: `recorrido = max(0, 2 − alto)`).

    | forma de la columna | 1025×667 | 1025×844 | 1025×900 | 1440×900 | **peor** |
    |---|---:|---:|---:|---:|---:|
    | **HOY** — `columnas={3}` `col-span-2` | 7% | 16% | 14% | 4% | **16%** |
    | `columnas={7}` `col-span-4` (la mejor) | 6% | 11% | 6% | 0% | **11%** |
    | `columnas={5}` `col-span-2` | 12% | 22% | 17% | 0% | **22%** |
    | `columnas={3}` `col-span-1` | 10% | 28% | 26% | 0% | **28%** |

    **Y el barrido es exhaustivo, no una muestra:** 81 bandas `(izquierda, ancho)` y **la mejor deja 11,2% en su peor cuadro**. La causa es geométrica y se publica al lado: a p=0,750 el logo deja **64 px libres a la izquierda y 197 a la derecha** en el cuadro de 1025×900, y con 165 px el titular de 107 caracteres corta en **19 líneas** —916 px de alto contra un cuadro de 900—. No hay banda horizontal legible que quede fuera de la silueta.

    Lo produce `_lib/escena/__tests__/s10-logo-columna.ts` (`test:s10-logo` §9), con su control positivo —el barrido SÍ sabe encontrar un cero cuando la banda entra entera en el hueco libre— y con la afirmación en verde como **guardián**: el día que alguien cierre el defecto 7, `MEJOR.peor > 0` se pone en rojo y ahí hay que escribir con qué palanca se cerró.

    ── ✅ **LA SALIDA NUEVA DEL DEFECTO 7 — ANOTADA, NO EJECUTADA: el problema no es la columna, es la POSE**

    **`demos` se eligió para otra cosa.** `choreography.ts:287` lo dice con sus palabras: *«es la única pose donde el logo llena el cuadro —81% del alto en tinta— y es la excepción que la arquitectónica se reserva»*, **«el momento más íntimo»** de §2.2. Se compuso para una sección que mostraba DEMOS —capturas, pantallas, cosas que se ven— **no para una con un titular de 107 caracteres en `titulo-xl`**. Anclar el diferencial ahí fue una decisión de RECORRIDO (SITIO-S9), y es la que hay que revisar: acotar la columna es pelear contra la pose en vez de cambiarla.

    **QUÉ MEDIR, y es una sola tabla:** para cada progreso del recorrido, **cuánto cuadro cubre el logo Y cuánto da el contraste de la tinta contra el fondo**, juntos. Buscar la ventana donde las dos cosas pasan a la vez, y anclar el diferencial ahí en vez de a `demos`. Los dos extremos ya están medidos y dejan lugar a que la ventana exista:

    - el contraste **cruza AA en p=0,878** (§7.29), o sea que mejora al avanzar;
    - el logo **se achica al alejarse**: a p=0,875 cubre **5,3%** del cuadro contra el **35,7%** de p=0,750 (§7.40, `test:s10-logo` §8).

    O sea: hacia adelante el contraste sube y la mancha baja. **Puede existir una ventana entre medio**, y nadie la buscó porque nadie había medido las dos curvas juntas.

    **LAS DOS OPCIONES, con su condición explícita:**

    | | si la ventana EXISTE | si la ventana NO existe |
    |---|---|---|
    | **qué se hace** | se re-ancla el diferencial a ese progreso: es una entrada de `_lib/escena/anclaje.ts`, no una reescritura | **el diferencial pasa a `papel-opaco`** |
    | **qué cuesta** | volver a derivar el mapeo de SITIO-S9 y re-medir §7.29 y §7.40 en el progreso nuevo | **se pierde uno de los TRES momentos de escena**: el sitio pasa de tres ventanas transparentes a dos, y §2.2 hay que reescribirla |
    | **qué se gana** | la superposición cae a 0 sin tocar la columna, el contenido ni la tipografía | el defecto 7 desaparece por construcción: sin escena detrás no hay logo con el que competir |

    **La condición es la medición, no el gusto:** la opción 2 sólo se toma **si la tabla de progreso contra (cobertura, contraste) no devuelve ninguna ventana**. Y de las palancas viejas de §7.40 ninguna sirve para esto: las tres que podrían llegar a cero —bajar el nivel tipográfico del `h2`, acortar el `TITULAR`, o mover la sección— son contenido o anclaje, y la tercera es exactamente esta salida, sólo que ahora con el criterio para elegir el destino en vez de a ojo.

    ⚠️ **Y una consecuencia de método que hay que anotar antes de tomarla:** si el defecto 7 se cerrara, `s10-logo` §5 —*«EL CONTRASTE DONDE SE SUPERPONEN»*— **seguiría publicando 1,11:1 en verde**, porque `contrasteSobreElLogo` toma todos los píxeles de logo del cuadro y **no interseca con la caja de texto**. No sería un verde por vacío: sería un verde midiendo otra cosa, con un título que dice «donde se superponen» y sin un «donde». Quien cierre el 7 tiene que atar §5 a §4 en la misma pasada.

47. ✅ **`travelX` — TRES DE LAS CINCO COPIAS CONSUMEN LA FUENTE, Y §7.44 ESTÁ MEDIDO (SITIO-S12).**

    ── **LA UNIFICACIÓN, y las dos que quedan con su razón**

    | copia | estado |
    |---|---|
    | `_lib/escena/encuadre.ts` | **ES la fuente**: `recorridoDeEncuadre` |
    | `_lib/escena/__tests__/camaraDelCuadro.ts` | la consume desde S11; su `recorridoConCodo` es el **testigo declarado**, no una copia viva |
    | `lib/scene-framing.invariant.ts` §6 | ✅ **unificada en S12** — era la quinta, con `35` y `0.88` escritos a mano. **Cambio numérico: CERO** (a 1440×810 el argumento es positivo: halfW 11,238 contra m/2 3,432) |
    | `probe-escena/__tests__/harness.ts` | 🔴 **DEUDA** — vive en `/probe-escena`, que la regla 5 del sprint prohíbe tocar, **y unificarla pone en rojo el control positivo de `s10-logo` §7**, que existe justamente porque hay dos fórmulas |
    | `lib/scene-camera.ts` | 🔴 **DEUDA** — es el PRELOADER DEL SITIO VIVO |

    **La comprobación de que las cinco coinciden existe y NO cierra, que es lo correcto**: `test:s8e-encuadre` §8 lee las cinco fuentes, exige que las tres unificadas consuman `recorridoDeEncuadre` y que las dos restantes **conserven** su copia, con su razón por copia. El día que aparezca una sexta se pone en rojo sola; el día que se arregle una hay que sacarla de la lista. Con su control positivo: la firma reconoce `max(0, · − ·/2)` y rechaza `abs(· − ·/2)`.

    ── ⚠️ **UNA CIFRA DE §7.44 QUE NO SE REPRODUCE (regla 11), Y ES OPERATIVA**

    §7.44 dice *«el codo de la pose del Hero está en 0,567»* y manda medir en **375×667 y 390×844**. **0,567 es el codo con la caja del ARNÉS (7,168).** `scene-camera.ts` no usa esa caja: usa `SCENE_LOGO_MESH_WORLD.width` = 6,863213, y **su codo cae en 0,542855**. La diferencia decide qué se puede medir: **375×667 da aspecto 0,562, que está ARRIBA del codo real**, así que ahí el arreglo es un **no-op exacto** y quien midiera ese par concluiría que la corrección no hace nada.

    ── **EL ATERRIZAJE, MEDIDO Y NO ARREGLADO**

    Los tres teléfonos en vertical, los tres debajo del codo real:

    | ventana | aspecto | HOY (centro de la tinta) | con `abs` | Δx |
    |---|---:|---|---|---:|
    | 375×812 | 0,461823 | **187,500 · 406,000** | 207,187 · 406,101 | **+19,69 px** (5,25% del ancho) |
    | 390×844 | 0,462085 | **195,000 · 422,000** | 215,396 · 422,105 | **+20,40 px** (5,23%) |
    | 393×852 | 0,461268 | **196,500 · 426,000** | 217,298 · 426,108 | **+20,80 px** (5,29%) |

    **Hoy el logo aterriza EXACTAMENTE en el centro geométrico de la pantalla en los tres**, afirmado: con `travelX` en 0 el `aim` colapsa sobre el target, la cámara no rota y el `frameX: 0,68` de la pose de entrada no corre el logo ni un píxel. **El tamaño NO cambiaría** —el clamp de §7.6 binda en los tres y `inkWidthPx` queda en `0,86 × ancho`, independiente de la profundidad— así que lo único que se mueve es el punto.

    El contrafactual se compone con `lib/scene-camera-medida.ts`, que consume la fuente única **sin tocar `scene-camera.ts`**, y trae los tres controles que lo hacen honesto: coincide bit a bit con la cámara de producción cuando `frameX: 0`, coincide bit a bit ARRIBA del codo, y **NO coincide debajo** —si coincidiera, toda la tabla sería una resta de un número contra sí mismo—.

    **Qué rutas cambiarían el día que se arregle:** `/` (el home vivo, con clientes) y `/v3`. La cadena es `HomeIntro` → `useIntroEngine` → `planIntroFlight` → `frameSceneEntry` → `sceneCameraAt`; y en paralelo `IntroParticleCanvas` → `buildIntroParticles` → `sceneCameraAt`, o sea que el arreglo **mueve el logo y las motas juntos**, que es lo correcto. Ningún otro consumidor toca esos módulos.

    ── 🔴 **UNA AFIRMACIÓN QUE ESTABA EN VERDE CERTIFICANDO EL DEFECTO — reescrita**

    `scene-framing.invariant.ts` afirmaba *«el clamp achica, NO mueve: el centro es el de la composición»* con `Math.abs(phone.centerXPx - 195) < 1.5`. **195 es exactamente 390/2**, o sea el centro geométrico de la pantalla: el número que sale **sólo porque `travelX` vale 0**. No medía el clamp — clavaba el defecto, y el día que alguien arreglara `scene-camera.ts` se habría puesto en rojo como si fuera una regresión. Reescrita **contra la propiedad** (regla 15, §7.45.1): el centro ES la proyección del origen, sin pasar por el clamp; y el clamp SÍ mueve el TAMAÑO, que es lo único que le toca (457 px crudos contra 335 publicados).

48. ⚠️ **TRES CORRECCIONES DE MÉTODO DE SITIO-S12.**

    ── **1 · EL CRLF NO ES DE `git stash`: ES DE CUALQUIER ESCRITURA DE `git` EN EL ÁRBOL**

    §7.45.2 dejó la regla como *«no se usa `git stash` en este repo para consultar `HEAD`»*. **La regla estaba bien y el alcance corto.** SITIO-S12 revirtió UN archivo con `git checkout -- <ruta>` —una operación que no es `stash`, que no consulta nada y que parece inocua— y el archivo volvió con **154 líneas en CRLF**. Es el mismo filtro de `core.autocrlf`, por otra puerta.

    **La regla, ampliada:** *cualquier comando de `git` que ESCRIBA en el árbol de trabajo (`checkout`, `restore`, `stash apply`, `merge`, `revert`) aplica el filtro y devuelve CRLF.* Los que sólo LEEN (`git show`, `git diff`, `git log`) no tocan un byte. Si hubo escritura, se vuelve a LF antes de correr un instrumento.

    ── **2 · UN INSTRUMENTO SE VALIDA DÁNDOSELO A ALGUIEN CON OTRA PREGUNTA — otra vez, y ahora con el frente de medición adentro del mismo sprint**

    §7.41 dejó la regla escrita para el banco compartido. Acá volvió a pasar con la DECISIÓN, no con el instrumento: §7.43 eligió una salida de layout para el defecto 7 y §7.44 publicó un codo. **Las dos se cayeron al medirlas con el instrumento que ellas mismas nombraban como confirmación** —la superposición no baja a cero, y el codo de `scene-camera.ts` es 0,542855 y no 0,567—. La versión operativa: **una decisión que se toma con un número tiene que volver a pasar por el instrumento antes de ejecutarse**, aunque el número lo haya publicado el sprint anterior.

    ── **3 · LOS CHECKS DE FRONTERA SON UNO DE DIECINUEVE, Y ESO ES EL HUECO**

    §7.43 dejó anotado que con el detector bien fechado *«ningún instrumento vigila hoy los dos toques declarados en `/probe-escena`»*. SITIO-S12 escribió el que faltaba —`test:s11-frontera`, declarado en `CHECKS_DE_FRONTERA`— y al hacerlo midió el hueco entero: **de los 18 lanes con suite permanente, 17 no tienen check de frontera propio.**

    El check de S11 **nace fuera de su ventana** —S11 está commiteado, así que su §1 sale con `noCorre()`— y eso no lo vuelve inútil: su §2 no mira `git` sino el DISCO, y afirma que **los dos toques siguen siendo lo declarado** (el panel RE-EXPORTA los tres tipos y no los declara; la declaración del recorte de `demos` sigue en el archivo del que el exportador la regenera), con sus dos controles positivos. Lo que no se puede recuperar es la mitad que mide el momento. **La salida no es escribir los diecisiete: es que cada sprint nuevo nazca con el suyo**, y este archivo es el molde.

    ── **Y la contradicción `≤` contra `=` de §7.43, dirimida con la medición**

    Los seis heredados miden **exactamente** su línea de base (Δ=0 en los seis), así que las dos reglas coinciden hoy y cambiar de una a otra no afloja nada verificable. Lo que decide es el día que se separen: §7.13 declara que `OrbitRig`, `probeStore` y `lightRig` van juntos a un sprint de limpieza, y **con la igualdad ese sprint pone la comprobación en rojo por el trabajo que ella existía para provocar**, con el mensaje «ninguno se movió», que como diagnóstico sería falso. **Gana `≤`**, y la segunda escritura no se corrigió: **se borró**. `s9-instrumentos` §3 consume ahora `heredadosQueCrecieron()` de `s8-largos.ts` — dos escrituras de la misma regla vuelven a divergir; una sola no puede. Lo único que la igualdad detectaba y `≤` no —que la base quedó vieja porque un archivo adelgazó— **se publica con su Δ**, que es la otra mitad de la regla 13.

    ── **Y el residuo de §7.36 que la propia §7.36 no vio**

    El acoplamiento de tipo está CERRADO y no hay un solo import de producción hacia `/probe-escena` desde `src/app/v3/`. Quedaban dos cosas por nombrar. La primera: **`usosDeValor` era el único detector de `s9-acoplamiento.ts` sin control positivo en ningún lugar del repo**, así que sus tres afirmaciones pasaban por AUSENCIA —un detector roto que devolviera siempre `[]` las habría dejado verdes—. Tiene dos controles desde S12. La segunda, sin arreglar y con dueño: **`lib/scene-framing.invariant.ts` importa un VALOR de `probe-escena/_components/choreographyVariants`**, y es el único import de valor hacia `_components/` que queda fuera del panel. §7.36 nunca lo alcanzó, y alimenta la cadena del preloader del home VIVO: el día que `/probe-escena` se borre, `tsc --noEmit` corta y `npm run build` NO, por `ignoreBuildErrors: true`.

49. ✅ **V3-E — LOS SEIS ROJOS DEL MERGE, EL ENCUADRE DEL HERO Y EL ANCLA DESCUANTIZADA (2026-09-02/03).**

    El merge de los cuatro lanes de V3 dejó `npm run verificar` en **23 pasos con 5 en falla**. V3-E los cerró y ejecutó los tres frentes que ningún lane podía tocar. Cierre: **24 pasos, 0 fallas** (el paso nuevo es el agregado `s16`), build en verde y `test:frontera` sin fallas.

    ── **Los seis rojos, y las DOS premisas que la medición refutó**

    Cuatro eran mecánicos: la nota huérfana de `choreographyNotes.ts`, el censo desincronizado de `CHOREO_ARRAY_DOC`, las tres cardinalidades de `s9-instrumentos` y las tres capturas sin registrar en el padrón de S5. Los otros dos **eran el mismo defecto, y no el que la instrucción decía**:

    · **`s7e-export-sprites` y `s7-pedido` son los dos la trampa de CRLF.** `bloqueDelArchivo` buscaba su ancla con `\n` en un `choreography.ts` que en disco está en **CRLF**, así que las dos `indexOf` fallaban y la comparación "byte por byte" medía **11.703 bytes contra 0**: había dejado de mirar el archivo. Y `s7-pedido` comparaba el documento generado (LF, porque ECMAScript normaliza los terminadores de un template literal) contra el archivo en disco (CRLF, porque `core.autocrlf` lo reescribe **cada vez que git lo toca**, y un merge lo toca).

    · **La premisa de que `CONTENIDO-PENDIENTE.md` «se desincronizó del generador» es FALSA, y está medida.** Normalizados, los dos textos son idénticos: **238 renglones contra 238, cero líneas distintas, 19.136 caracteres iguales**; lo único que difería eran **237 `\r`**. Se regeneró igual con su instrumento y `git diff` no devolvió un solo hunk. **Regenerar habría sido el arreglo equivocado**: pone el check en verde hasta el próximo merge y lo rompe de nuevo — un arreglo que se deshace solo. Lo que se arregló es la COMPARACIÓN, con el patrón de `s10-logo` §6 y **un control positivo que exige encontrar el bloque con los DOS finales de línea** (el viejo daba verde con la función rota, porque un fuente sin el bloque no lo tiene ni con LF ni con CRLF).

    · **Las tres capturas de `trabajos/` NO se commitean (decisión del dueño, en la parada).** Son los PNG originales de 1920×1080 —**3,83 MiB inertes**— y nadie los consume: `contenido.ts` nombra las `.webp` de `public/capturas/` (**284 KiB** servidos, la única imagen que llega al navegador). V3-E los había registrado en el padrón de S5 y el dueño lo revirtió: el padrón los declara **fuera del lane** con la razón escrita (`FUERA_DEL_LANE`, en `s5-archivos.ts`), `s5-originales.ts` afirma que ningún archivo del lane los nombra —la razón tiene que seguir valiendo— y el estado en disco se PUBLICA, no se afirma. Quedan en disco sin usarse hasta que el dueño los borre.

    ── **El censo de `s9-instrumentos`, DERIVADO — la cardinalidad que se rompió tres veces**

    Tenía tres números escritos (34 archivos, 80 etiquetas, 27 con marcador) y el merge los movió a 38/93/31. Su propio docblock declaraba el patrón: *«el frente que mueve el censo no lo toca y lo re-mide el agente de integración»*. **Eso funciona una vez; a la tercera es un instrumento que pide mantenimiento manual cada vez que alguien hace su trabajo.** Vive ahora en `s9-censoDelLane.ts` y no afirma números sino propiedades: el lane cierra contra las suites `sNe` por dos derivaciones independientes de `package.json`; **cada etiqueta marcada del fuente se renderiza como la imprime el arnés y se le pasa a `contarControles`**, así que la cuenta estática y la de la corrida —que SITIO-S9 comparó A MANO, 36 y 36— se comparan en cada corrida; y la deuda de archivos sin control positivo se declara **por nombre, no por cantidad**, con la forma de `heredadosQueCrecieron()`: sólo falla cuando crece. En la misma corrida en que `scene-framing.invariant.ts` escribió sus controles, la lista lo publicó como sobrante — que es exactamente para lo que se declara por nombre.

    ── **CORRECCIÓN DE LA INSTRUCCIÓN · el encuadre del hero: «el logo queda cortado» NO se reproduce — lo que fallaba era la rotación de cámara**

    La instrucción de V3-E escribió *«en el Hero el logo entra por la derecha y queda cortado»*. **Eso no se reproduce, y va como corrección de la instrucción: el logo entraba al 100,00% en las 21 muestras** (7 cuadros × 3 progresos) y sin una celda de tinta tocando el borde — lo mismo que ya decían `s13b-escena` §2 y `s10-logo` §3. La queja del dueño —*«no se ve toda la escena con el logo»*— era cierta por la OTRA mitad.

    **Lo que sí fallaba era literalmente la otra mitad de la frase.** `frameX` no corre el logo dentro de un cuadro fijo: **rota la cámara**. Con `0,68` el eje óptico apuntaba **12,834° AFUERA de la caja del logo** sobre un medio campo de 29,272° —o sea a piso vacío— y la sala visible del lado del logo era **16,438°**. Se movió a **`frameX: 0,5`**, el mayor valor que cumple los dos criterios medidos (el eje cae dentro de la caja: 0,0953 → −0,0087; y el margen derecho deja de ser el más chico de los cuatro). El cruce de ambos cae entre 0,51 y 0,52, a **menos de media celda** de la grilla de muestreo. Sala del lado del logo **+20,2%**; aire derecho a 1920 de **253 a 369 px**. **El cambio resolvió esa mitad de la queja; cómo queda la composición del Hero la juzga el dueño por grabación.**

    **El precio, medido:** el destino del preloader se movió **78,7 / 104,9 / 139,9 px** en 1440 / 1920 / 2560, y la tinta pasó de 451×313 a **445×310 px**. El relevo **sigue aterrizando al bit** —0,0000 px en los tres cuadros, `introLanding.invariant.ts`— porque `scene-framing.ts` proyecta el keyframe vivo y no una constante. El contraste de la tinta del Hero pasa de 9,73:1 a **9,62:1**, y 8,71:1 en el peor punto de su ventana: AA y AAA.

    ── **El ancla del diferencial, DESCUANTIZADA — §7.46 defecto 7, CERRADO**

    V3-B midió que la ventana existe (p ∈ [0,8232 · 0,8782]) y que el reparto sólo podía producir **0,7500 y 0,9167**, los dos afuera. V3-E le agregó al reparto un campo `ancla`: una sección puede declarar **dónde ADENTRO de su tramo** llena el cuadro, en vez de heredar siempre el borde. El valor es **0,8525**, elegido con cuatro cifras: margen al borde de abajo +0,0293, margen al cruce de AA −0,0257, contraste 4,98:1 (10,7% de aire sobre AA), y **vuelve exacto del mapeo** (`progresoDePantalla(12) === 0.8525` con igualdad estricta; de 111 candidatos sólo 66 lo hacen y 0,85 **no** era uno). Se puso arriba del **peldaño de 0,8509** que el borde de abajo tiene cuando el titular crece un 7%, para que una recomposición tipográfica no devuelva el defecto.

    **La superposición del titular cae a 0% en los cuatro cuadros y en las dos rejillas**, con control positivo: en el ancla heredada (0,7500) el mismo instrumento da 7,1%–15,1%. El progreso sigue **monótono y exactamente reversible**: 13.026 muestras de pantalla (paso 0,001 más los siete nudos con su entorno ±1e-6 y ±1e-9) y 100.001 de progreso, error máximo **1,78e-15** y **1,11e-16**.

    ✅ **ACEPTADO (decisión del dueño, en la parada) — `tu-panel` se corre +0,0121, y la instrucción pedía que las otras siete no se movieran.** No es una elección: con **siete nudos** —uno por tramo, que es lo que hay— pedir que la pantalla 10 caiga en 0,700 y que exista un nudo en 0,750 obliga a que ese nudo esté en la pantalla 12, o sea el ancla cuantizada. Evitarlo pide **un nudo por sección** (ocho), y eso **rompe `RITMO_POR_SEGMENTO` en `recorrido.ts`**, que asume `nudos.length − 1 === CHOREO_TRAMOS.length` — son ~5 líneas y quedaron fuera del alcance del sprint. Mitigación medida: **`tu-panel` es `papel-opaco` y su ancla no se ve**, y el tramo `demos` sigue corriendo escondido (su pose se alcanza en la pantalla 11,3051, adentro de `tu-panel`).

    ✅ **ACEPTADO — se pierde el AAA de la mediana del contraste, y NO es una concesión:** la mediana cruza AAA (7:1) en **p=0,8227** y el titular no queda limpio en los cuatro cuadros hasta **p=0,8232**. Son **incompatibles por 0,0005 de progreso**, así que **CUALQUIER ancla que cierre el defecto 7 pierde el AAA**. **AA se cumple con 4,98:1.** La afirmación de AAA era verdad sólo porque el ancla estaba cuantizada sobre la pose que tapaba el titular; se reemplazó por dos con dientes —AA con margen, y el cruce de AAA quedó ATRÁS del ancla, así que devolverla antes de p=0,8227 pone esto en rojo diciendo «volvió el defecto 7».

    ── **✅ LA CAP HEIGHT DE CHIVO — CERRADA: NO SE COMPENSA. Y una CORRECCIÓN DE LA INSTRUCCIÓN**

    **Decisión del dueño del proyecto, en la parada de V3-E: el tema queda exactamente como está.** No es un pendiente ni una verificación abierta: es una decisión tomada sobre números medidos por `s16-tipografia.invariant.ts` (33 afirmaciones, 8 controles positivos), que quedan en el repo. Las dos compensaciones posibles son **cap ×1,049563** (720/686) y **x ×0,998043** (510/511); la de x mueve **0 de 14** valores al redondear y la de cap mueve **12 de 14**. Las cuatro razones:

    **(a) El salto contra la vara con la que las anclas se aceptaron.** `LAYOUT.md` §2.3 publica un criterio de **1 px** y un error real de **0,0006 px**; el desplazamiento máximo de la compensación de cap es **2,7755 px = 2,78× el criterio** (4.626× el error), y supera la separación más chica entre dos niveles vecinos (0,9998 px). En 375: `titulo-l` +1,1895 px, `titulo-xl` +1,7843 px. En 1440: +2,1808 y +2,7755 px.

    **(b) Compensar la cap NO reduce la divergencia óptica: la aumenta — y ésta es la razón que la mata.** Cambia un déficit de cap del **4,72%** por un **exceso de x-height del 5,16%**. El peor desvío empeora.

    **(c) CORRECCIÓN DE LA INSTRUCCIÓN — la premisa «los niveles de display van en Title Case y ahí manda la cap» era FALSA sobre este home.** Medido sobre el marcado del servidor con `uppercase` aplicada: `titulo-l` tiene **3,8%** de mayúsculas y `titulo-xl` **5,5%** — los dos niveles MENOS cargados después de `cuerpo`. Donde la mayúscula manda de verdad es **`micro`, con 100%**, y está clavado en 10 px por dos restricciones independientes. El criterio de la instrucción apuntaba al nivel que el sistema no puede mover, y no a los que nombraba.

    **(d) La cap height de la familia de origen NO está en el repo.** *«Los valores de 375 y 1440 se transfirieron midiendo Instrument Sans»* es cierto a medias: `REPORTE-S0.md` §(b) publica la cuenta `504/510 = 0,9882`, o sea que la x-height de la familia de ORIGEN es **504**, no 510 — Instrument Sans es la **portadora**, no el origen. El repo conoce la cap height de exactamente dos familias, 686 y 720. Por lo tanto *«compensar es más fiel a la referencia»* **no se puede verificar con ningún número de este repo**.

    **Y la objeción geométrica de la instrucción NO ataba:** ningún par de niveles colisiona ni se da vuelta con ninguna de las tres compensaciones, en ninguno de los cuatro anchos. Las dos de cap **abren** la escala. Lo que cerró no fue la escala: fueron (a) y (b).

    **El único argumento a favor que sobrevive queda anotado con su número, como lo que es:** en **píxeles** la medición ordena al revés — en `titulo-xl` @1440 el peor desvío pasa de 1,9040 px a **1,4743 px (−22,6%)**. En por ciento empeora, en px mejora. **Es un empate que ningún número de este repo rompe**: lo rompe la verificación óptica sobre `/v3/tipografia`, y la juzga el dueño del proyecto. No reabre la decisión.

    ── **Lo que la Fase 1 abrió en lanes que nadie tocaba, y cómo se cerró SIN aflojar**

    Mover `frameX` rota la cámara, y cuatro comprobaciones de otros lanes estaban ancladas a literales que esa cámara producía. **Ninguna se cerró subiendo una tolerancia:**

    · **`s13e-intro-particulas` — con nombre propio, porque es el mejor de los cuatro.** Comparaba tres cuantiles del polvo del intro contra los de la escena pidiendo la perilla ±0,1. **No era una identidad: era un estimador**, y frágil — las dos poblaciones no son la misma muestra (otra semilla, otra fracción, otro corte de profundidad), así que en la cola baja la razón vale **1,943** y no 2,05, de forma **estable en todos los anchos**. Cruzó el umbral por **0,007**. Pasó a la **identidad exacta mota por mota**: se construye el MISMO campo con el tamaño de polvo de la escena y se emparejan las motas **por su posición en pantalla** — **386 de 386, con la razón igual a la perilla al bit (desvío 4,4×10⁻¹⁶)**, sin tolerancia y sin número escrito.
    · **`s14e-intro-lectura`** exigía los cinco literales que S13 publicó, medidos con la pose vieja y **no reproducibles sin volver a moverla**. Ahora afirma la propiedad —que la columna "antes" la produce **el mismo constructor** que la de "después", diferenciándose sólo en las dos perillas, comprobado mota por mota— y publica los cinco números con su pose y su fecha.
    · **`s12e-tension`** se partió en dos: las **cinco poses que V3-E no tocó** siguen contra el entero de S11 **con la misma tolerancia**, y el hero declara su **+1,3** (201 → 202,3). Es más fuerte que la tolerancia única: ahora dice cuál puede moverse y cuáles no.
    · ✅ **`s12e-barrido` — el techo de 210 NO se toca (decisión del dueño, en la parada).** El hero llega ahora a **210,8 en α = 1,5°**, el tope del slider (era 209,0): la curva entera subió ~1,3 con la rotación de cámara. No se tocó el techo ni se aflojó nada. Lo que se AFIRMA es que **el valor embarcado (α = 0,266°) queda en 204,3 con 5,7 de margen**. El cruce **queda PUBLICADO, no afirmado**: **α = 1,222°, derivado por bisección, 4,6× lo embarcado**. Si algún día se quiere subir el sol por encima de ahí, hay que decidir de nuevo el techo o revisar el encuadre del hero.

    ── **Los NUEVE cerrados fuera de zona por la integración, y cómo**

    Los subagentes escribían sólo en su zona; lo que su cambio rompía afuera lo reportaban con el arreglo escrito, y la Fase 2 lo cerró. Siete del encuadre (A) y dos del ancla (C). **Ninguno bajó un umbral:**

    1. `scene-framing.invariant.ts` §3 — *«el centro cae en (1018, 428)»* → **(940, 417)**: es la medición publicada de la pose, y la pose cambió por decisión.
    2. §3 — *«la tinta mide 451 × 313 px»* → **445 × 310 px**, «un 15% más chica que con la calibrada».
    3. §3 — *«el logo NO cae centrado: > 0,7 del ancho»* era el literal de una pose (70,7% con 0,68; 65,3% con 0,5). Pasó a **propiedad derivada del contrafactual**: con `frameX: 0` la misma función pone el destino en el centro geométrico (720 ± 0,5) y con la pose viva lo pone a la derecha de ése — con control positivo de que el corrimiento no es cero (219,7 px).
    4. §6 — los dos umbrales en px (`> 15` y `> 20`) sobre la aproximación lineal ya no discriminaban (12,5 px). Pasaron a afirmar **el mecanismo**: la aproximación no tiene término en Y por construcción y la proyección real sólo cae en el medio si la elevación es cero — control positivo: con `height: 0` la proyección real da **405,0000 al bit**. El archivo cruzó las 300 líneas (297 → 350) y la sección se partió a `scene-framing-aproximacion.ts`, con la forma de `scene-encuadre-deuda.ts`.
    5. `choreography.ts` — el docblock de CABECERA decía «451 × 313 px»; se corrigió **reescribiendo dentro del mismo largo**, porque `LARGOS_HEREDADOS` lo clava en 471 con vigilancia `≤`.
    6. `introHandoff.ts` — «aterriza en (1018,4 · 427,8) con una tinta de 451×313» → **(939,7 · 417,5), 445×310**.
    7. `s13b-escena.invariant.ts` §2 — el detalle «V3-B no tocó `frameX`» dejó de ser cierto; la afirmación sigue en verde porque protege otra cosa —que el intro proyecte el keyframe VIVO— y el detalle lo dice ahora.
    8. `s10-logo-encuadre.ts` — `DEFECTO_7_ABIERTO` era prosa fija que imprimía «SIGUE ABIERTO» junto a una tabla que ya publicaba ceros. Pasó a ser **función de la misma bandera que la tabla calcula** (`parrafoDelDefecto7(tabla)`), así que las dos no pueden volver a desacordar; el título del §8 de `s10-logo` dejó de decir «lo que el arreglo NO cerró».
    9. `s10-logo-columna.ts` §9 — tenía una **promesa vencida** —«el día que alguien cierre el defecto 7 esto se pone en rojo»— que no se va a cumplir porque mide a progreso fijo sobre la pose `demos`. Se reescribió contra lo que hoy protege, dentro de las 300 líneas exactas del archivo.

    Y el censo derivado de `s9-censoDelLane.ts` hizo lo suyo en la misma corrida: cuando `scene-framing.invariant.ts` escribió sus dos controles positivos (ítems 3 y 4), la lista de deuda **lo publicó como sobrante** y se lo sacó por nombre — quedan cinco archivos del lane sin un solo control positivo.
