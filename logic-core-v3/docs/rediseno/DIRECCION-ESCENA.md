# Dirección de la escena · home develOP

- **Qué es esto:** el documento de decisiones consolidadas del rediseño del home. Hasta hoy estaban repartidas en seis reportes de sprint (`docs/rediseno/outputs/`) y en una conversación larga con el dueño del proyecto. Acá quedan en un solo lugar.
- **Qué NO es:** un reporte de sprint. No cuenta qué se construyó ni cómo; cuenta **qué se decidió**. El cómo vive en los reportes y en los docs de módulo de cada archivo.
- **Estado:** escrito en S7 (2026-08-20), actualizado en S9 (2026-08-22) con la elección del recorrido, en S10 (2026-08-23) con el vaciado de la escena y el fondo de rendijas, en S13 (2026-08-26) con las partículas del preloader, el escalón de exposición resuelto y la cámara de `harness.ts`, y en S14 (2026-08-26) con el reparto de tamaños de ese campo, y en SITIO-S4 (2026-08-29) con las reglas 12, 13 y 14 de §3 —los checks contra `git`, qué puede afirmar un invariante, y que los agregados se derivan—, la §6.1 de verificación y los pendientes §7.16 y §7.17. Se actualiza cuando una decisión cambia — no cuando se implementa.

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

**No está construido. Se construye en un sprint posterior.** Acá queda registrado con precisión para que ese sprint no tenga que inventar nada.

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

**El requisito que lo sostiene es uno solo, y se mide:** en ningún instante pueden ser legibles dos poblaciones distintas. Medido con el umbral de contraste de WCAG que el repo ya usa para el cruce de tinta (1,10): la última del intro deja de ser legible en **4,166 s** y la primera de la escena a los **4,278 s** — **112,4 ms de margen** (eran 110,4 con el reparto de S13; S14 lo agrandó al ralear el campo). Y la escena se vuelve legible solo **28,3 ms** después de que el velo arranca, así que la salida **no podía derramarse** adentro de esa ventana: tenía que cerrar antes.

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

Todo lo construido vive en `/probe-escena`, una ruta interna con `noindex` y sin un solo link entrante. **El home no se tocó.**

| Decisión | Archivo |
|---|---|
| **El recorrido definitivo** y el arco de luz | `src/app/probe-escena/_components/choreography.ts` |
| Los comentarios de cada keyframe (se editan **ahí**, no en el array) | `choreographyNotes.ts` |
| El recorrido calibrado a mano, conservado como referencia | `variantCalibrada.ts` + `variantCalibradaNotes.ts` (+ `choreographyNotesFrontal.ts` y `choreographyNotesGiro.ts`) |
| Las tres propuestas de S7 | `choreographyVariants.ts`, `variantIntima.ts`, `variantArquitectonica.ts`, `variantDramatica.ts` |
| Los comentarios de las propuestas | `variantNotes.ts` |
| Dónde cae el logo en pantalla — lo que el preloader lee | `src/lib/scene-framing.ts` |
| El rig de tres puntos y cómo se apaga cada luz | `probeLighting.ts` |
| El sol — que es la luz principal, y **solo una dirección** | `LIGHT_ARC` (en `choreography.ts`) y `lightRig.ts`. ~~`probeSun.ts`, `SunBody.tsx`~~ **borrados en S11** |
| Niebla, shadow map y oclusión de contacto | `probeAtmosphere.ts` |
| **La envolvente de rendijas**: las dos capas, el desajuste y el batido | `probeMoire.ts` + `moireTextures.ts` (los generadores) + `MoireScreen.tsx` |
| ~~El washout del sol~~ | ~~`SunWashout.tsx`~~ — **borrado en S11 con el cuerpo** |
| **La celosía**: qué luces tapa, la barra y el factor de cielo | `probeCelosia.ts` |
| La geometría de la proyección — y el gemelo en TypeScript del shader | `celosiaGeometry.ts` |
| El GLSL del gobo y el parche del chunk de three | `celosiaShader.ts` |
| ~~El espacio: planos suspendidos, retícula aérea, pilares~~ | ~~`probeArchitecture.ts`~~ — **borrado en S10**, con `LogoFragments.tsx` |
| Las marcas de replanteo del piso | `floorMarks.ts` |
| La física: inercia, mouse, vira, deriva del aire | `choreographyPhysics.ts` |
| El editor de keyframes y el export | `choreographyEditor.ts`, `choreographyExport.ts` |
| El intro que hoy corre en el home | `src/components/layout/HomeIntro.tsx` |
| Las partículas: los dos campos, las conchas y el recorte de `gl_PointSize` | `probeParticles.ts`, `DepthParticles.tsx`, `BokehParticles.tsx` |
| **Las partículas del PRELOADER**: la especie, el campo proyectado y su ritmo | `home-intro/introParticles.ts`, `introParticleField.ts`, `introParticleTiming.ts`, `IntroParticleCanvas.tsx`, `introParticleSprites.ts` |
| El COLOR de una mota del preloader — la rampa y su cuantización para el teñido | `home-intro/introParticleTint.ts` |
| La cámara de la escena sin three, y la proyección de un punto cualquiera | `src/lib/scene-camera.ts` |
| El rig del intro — y el ambiente en el que TERMINA, que es el de la escena | `home-intro/introRig.ts` |
| Las comprobaciones estáticas | `src/app/probe-escena/__tests__/*.invariant.ts` |
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
| Un agregado suelto | `npm run test:s1` · `test:s2` · `test:s3` · `test:s4` |
| Un invariante suelto | `npm run test:<suite>-<nombre>` |

> ⚠️ **CORRECCIÓN — EL OOM DEL BUILD NO SE ARREGLA CON `--max-old-space-size`. HAY QUE ACOTAR LOS WORKERS.**
>
> Los prompts de sprint vienen pidiendo `NODE_OPTIONS=--max-old-space-size=8192` **desde hace seis sprints, y es el flag equivocado**. El problema no es el heap de un proceso: es la máquina. **13,9 GB de RAM y 16 CPUs**, y Next lanza `os.cpus().length - 1` = **15 workers** para "Collecting page data". Subirle el heap a cada uno de los quince empeora el reparto, no lo mejora.
>
> **La firma:** el compilado termina bien —`✓ Compiled successfully in 24.0min`— y recién ahí revienta, en `Collecting page data using 15 workers`, con `FATAL ERROR: Zone Allocation failed - process out of memory`. Que sea *después* del compilado es lo que despista: parece un problema del build y es un problema de reparto de memoria.
>
> **El comando que SÍ terminó**, con las siete rutas de `/v3` prerenderizadas:
>
> ```bash
> # bash
> NODE_OPTIONS=--max-old-space-size=8192 CIRCLE_NODE_TOTAL=3 npm run build
> ```
> ```powershell
> # PowerShell
> $env:NODE_OPTIONS = "--max-old-space-size=8192"; $env:CIRCLE_NODE_TOTAL = "3"; npm run build
> ```
>
> **Por qué `CIRCLE_NODE_TOTAL`, que no tiene nada que ver con CircleCI:** es la variable que Next lee para el defecto de `experimental.cpus` —`node_modules/next/dist/server/config-shared.js:202`, `Math.max(1, (Number(process.env.CIRCLE_NODE_TOTAL) || os.cpus().length) - 1)`—. Con `3` quedan **2 workers**. Es la única forma de acotarlos **sin tocar `next.config`**, que está fuera del scope de estos sprints.
>
> ⚠️ **Lo que NO está aislado:** la corrida buena llevaba las dos variables, así que no está medido si el heap de 8192 solo es inocuo o si además estorba. Lo que sí está medido es que **lo que cambió entre la corrida que revienta y la que termina fue la cantidad de workers**. Si alguien quiere el dato limpio, la prueba es una corrida con `CIRCLE_NODE_TOTAL=3` y sin `NODE_OPTIONS`.

---

## 7 · Lo que todavía no está decidido

Está acá para que nadie lo dé por resuelto.

1. ~~**Cuál de los cuatro recorridos es EL recorrido.**~~ **DECIDIDO en S9** — ver §2.2. Lo que queda abierto de esa decisión es una sola perilla, y es de composición: **la elevación de la pose de entrada quedó en 18,6°** contra los 31,0° del recorrido calibrado, y eso es lo que el preloader usa para rotar el logo al aterrizar. Subir la altura del hero de 6,40 a ~7,50 la lleva a 23,2° y cuesta 1,1 de caída en el tramo siguiente. **Se juzga por grabación.**
2. **Cómo se ata el recorrido al scroll real.** Hoy el progreso es un slider del probe. Falta el mapeo a las ocho pantallas del layout, con su comportamiento en mobile.
3. **La cola del cierre.** *"Después las letras se van, la cámara se mueve a otros ángulos y termina en el CTA final"* no tiene poses compuestas. El track termina en el cierre.
4. **Cómo entra y sale la escena** cuando se apaga después del cierre y vuelve para el diferencial: si es un fundido, un corte, o la propia luz que se va.
5. **Mobile.** No se midió un solo teléfono ni un solo frame time. Toda la contabilidad publicada es estática. Lo primero que se apaga si no rinde, en orden: la capa gruesa de la envolvente, `BOKEH_COUNT`, el slider de partículas, `SHADOW_RADIUS`, el washout.
6. **El encuadre por relación de aspecto.** El recorrido está compuesto en horizontal; en vertical el logo no entra igual y falta decidir si se reencuadra o se recompone.
7. **Qué contenido va en cada una de las ocho pantallas**, más allá de los nombres de los tramos.
8. **La temperatura del cierre**: 7700 K (frío, lo que está hoy) contra los 2000 K (ámbar) que tenía la calibración a mano. Es un número y está argumentado en los dos sentidos.
9. ~~**EL PISO.**~~ **RESUELTO en S11** — ver §2.7 y §4.1. El pendiente de S10 no era de fondo sino de **exposición**: el papel a luz plena da 249,4 y su propia sombra 236,9, o sea doce puntos y medio de rango. Lo abrió la celosía tapando el cielo además del sol, y con eso hero y Números bajaron a 201 y 213 con un rango de 29,6 puntos. **Lo que queda abierto de esto son DOS perillas**, las dos de calibrar mirando: `CELOSIA_BAR` (0,29), que sube el contraste de las bandas y la oscuridad de la sala a costa de aflojar el batido; y desde S12 el **radio angular del sol** (0,266°, rango 0 … 1,5°), que ablanda el borde a costa de devolver parte de esos 29,6 puntos. Medido: de 0 a 0,5° no se pierde nada; desde 0,75° empieza a caer la portadora del piso. En **0** las dos apagan lo suyo y devuelven el estado anterior, que es el control.
10. **Si el recorrido debería dar dos vueltas.** El argumento que lo descartaba murió con los planos (ver §2.2). Es decisión de recorrido, no de escena.
11. ~~**EL ESCALÓN DE EXPOSICIÓN.**~~ **RESUELTO en S13** — `home-intro/introRig.ts`. El intro termina en `HEMI_INTENSITY × celosiaSkyFactor(CELOSIA_BAR)`, o sea **en el mismo ambiente con el que la escena empieza**: una constante compartida, leída de la misma función, sin un solo literal. `introRig.invariant.ts` custodia la igualdad, y de paso verifica que el nivel del arco en p=0 siga valiendo 1 — que es lo único por lo que la key y el relleno no tenían escalón.
    ⚠️ **Y §7.11 sobreestimaba el escalón, con una confusión de superficie que conviene no repetir.** Los **−18,2 puntos en el papel en sombra** y los **−15 en el valor medio del cuadro** son sobre el piso y sobre el cuadro **de la escena**, y el intro no renderiza ninguna de las dos cosas: no tiene papel, y su plano de sombra es un `ShadowMaterial` —oscurece lo que hay detrás, no recibe luz—. La ÚNICA superficie iluminada del intro es el logo, y ahí la tinta `#0F0F0F` queda tan abajo que el toe del tone map la aplasta: **0,39 puntos sRGB de 255** en la cara frontal (1,68 → 1,28), 0,33 en el canto superior, 0,25 en el inferior. Medido en `introRig.invariant.ts`, con el mismo instrumento que reproduce los 249,4 / 236,9 / 248,3 / 218,7 de S11 como control positivo.
    **Se resolvió igual, y no por los 0,39 puntos: por la mudanza.** Traer el factor de cielo obliga a importar `probeCelosia.ts`, que arrastra cuatro módulos más —**10,6 KiB de código**— y corre una integral de hemisferio de 24.000 muestras al cargar el módulo: **1,54 ms**. Hacerlo en `introShading.ts` habría puesto todo eso en el bundle de la PRIMERA visita, que es exactamente la visita en la que el preloader corre. Sacando el rig a su propio módulo esa cadena cae en el chunk diferido de `three` y **`probeLighting.ts` sale del grafo de primera carga**: el grafo del intro pasó de 25 a **24 módulos**.
12. **Los haces de luz visibles.** Medidos y NO construidos: la tabla de fondos aéreos y el alfa aditivo por pose está en `probeCelosia.ts`, para que la decisión sea revocable con datos. Las tres razones para no ponerlos —overdraw sobre las poses más caras, que lo aditivo se come el contraste recién ganado, y que un volumen saliendo de una celosía ES el efecto Star Wars— están en `outputs/S11-LUZ.md` §6.
13. **DEUDA DE TAMAÑO — para un sprint de limpieza, los tres juntos.** La regla del repo es partir arriba de 300 líneas. Estos tres están arriba, **los tres crecieron con S11 y ninguno se partió ahí a propósito**: hacerlo de a uno, en el sprint que lo agrandó, es la peor forma de hacerlo.

    | archivo | líneas | antes de S11 | de quién es el exceso |
    |---|---:|---:|---|
    | `OrbitRig.tsx` | **651** | 626 | heredado; S11 sumó 21, **S12 sumó 4** (el volcado del radio angular) |
    | `probeStore.ts` | **406** | 352 | heredado; S11 sumó 26, **S12 sumó 28** (la perilla del radio angular y su porqué, más la corrección de la cifra sin instrumento) |
    | `lightRig.ts` | **357** | 319 (ya cruzado por S10) | heredado; S11 sumó 26, **S12 sumó 12** (el canal del radio angular) |

    **S12 los declara otra vez y no los parte, por el mismo motivo:** son el contrato panel ↔ loop y las dos mitades de un frame. Los tres módulos nuevos del sprint sí nacieron partidos y ninguno cruza el límite — `celosiaPenumbra.ts` (162), `celosiaBeat.ts` (246), `s12-penumbra` (275) y `s12-tension` (258).

    **Van juntos porque el seam es el mismo:** `lightRig` y `OrbitRig` son las dos mitades de un solo frame —partirlas por separado deja el cuadro cortado al medio en dos archivos que igual hay que leer juntos— y `probeStore` es el contrato entre el panel y ese loop. El resto de los archivos largos del módulo (`choreography.ts` 462, `choreographyEditor.ts` 376, `probeScene.ts` 348, `KeyframeEditor.tsx` 310) son heredados sin delta de S11 y pueden entrar al mismo sprint.

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

    **NO se re-midió y NO se arregló**: es `probe-escena/`, y estaba fuera del scope de S13. Lo que este pendiente fija es qué toca el sprint que lo tome — `LOGO_W`/`LOGO_H` de `harness.ts`, y después volver a correr las once suites de arriba para ver cuáles de sus cifras publicadas se mueven.

16. ⚠️ **PREDICCIÓN DEL MAPA — comprobación diferida, unificada en SITIO-S4. Se activa sola.**

    S2 dejó una predicción —al borrar `/v3/motion` y `/v3/motion/control-estatico`, el peso heredado de `/v3` vuelve solo ±3,4 KiB— y S3 iba camino a dejar la suya con tres rutas más. **Es un solo fenómeno:** cada ruta nueva agrega su entrada a estructuras que viajan en chunks **compartidos con el home**, así que una ruta no le cobra a su propia página sino a las que ya existían. Dos predicciones separadas sobre un solo fenómeno se verifican mal: la primera que se cierre deja a la otra sin línea de base. **Quedan como UNA**, en `s4-rutas-de-demo.ts`:

    | ruta | sprint |
    |---|---|
    | `/v3/motion` · `/v3/motion/control-estatico` | S2 |
    | `/v3/componentes` · `/v3/tipografia` · `/v3/tipografia/muestra` | S3 |

    `/v3/control-estatico` **no** está en la lista: es la ruta gemela que `bundle.invariant.ts` usa como control positivo, ya estaba en la línea de base de S1, y vive mientras viva ese instrumento.

    **El número.** S1 midió el heredado en **1381,3 KiB crudo · 23 archivos** (2026-08-28), sin ninguna de las cinco. Hoy, con las cinco: **1386,1 KiB · 24 archivos**. Al borrarlas todas tiene que **volver solo a 1381,3 ±2,0 KiB**, o sea recuperar **4,8 KiB**, sin tocar ninguna otra cosa. Si vuelve, el delta era el costo de existir de N rutas sea cual sea el mecanismo. Si no vuelve, el diagnóstico estaba mal y hay que buscar en un chunk compartido.

    ⚠️ **El costo por ruta NO es lineal ni constante, y las dos observaciones lo dicen:** 1,7 KiB/ruta (S2, dos rutas) contra 0,96 (S4, cinco acumuladas). Es empírica y sirve para el orden de magnitud. El mecanismo exacto **sigue sin identificarse** — S2 probó que no es la coreografía y que el manifiesto de rutas de Sentry explica sólo el 3,5 % de los bytes. Lo que cierra la pregunta no es una hipótesis: es el borrado.

    **Quién la cierra:** el sprint que reemplace al home, que es el que borra estas rutas. **No hay que construir nada.** `npm run test:s4-heredado` la declara `NO CORRE` con su motivo mientras las rutas existan, y **pasa a afirmarla sola** el día que dejen de existir en el build.

17. **DEUDA DE TAMAÑO EN LOS INSTRUMENTOS — cuatro arriba de 300 líneas, y ningún check los cubre.** Anotada en SITIO-S4 y **no arreglada**: partirlos no era el scope del sprint.

    | archivo | líneas | de quién |
    |---|---:|---|
    | `_lib/__tests__/tokens.invariant.ts` | **456** | S1 — bajó de 463 al extraer `poda.ts`, pero sigue arriba |
    | `_lib/motion/__tests__/motion-bundle.invariant.ts` | **341** | S2 |
    | `_lib/motion/__tests__/cronograma.invariant.ts` | **324** | S2 |
    | `_lib/__tests__/bundle.invariant.ts` | **323** | S1 |

    **Lo que agrava la deuda es la cobertura, no el tamaño:** el único check de las 300 líneas es el de `s3-codigo.invariant.ts`, y mira los archivos del sprint de S3 más los instrumentos `s3-*`; `s4-cobertura.invariant.ts` mira los de S4. **Los de S1 y S2 no los mira nadie**, así que pueden seguir creciendo sin que nada falle. El sprint que los parta tiene que además extender la cobertura, o la deuda vuelve.

18. ⚠️ **LA COREOGRAFÍA DE LAS SECCIONES VIAJA EN LA CARGA INICIAL TAMBIÉN ABAJO DE 1025, Y SE RESUELVE UNA SOLA VEZ.** Abierto en SITIO-S5 y **deliberadamente no arreglado ahí**.

    **La cifra**, producida por `s5-peso.invariant.ts` sobre un build real: lo propio de `/v3/secciones-a` son **38,1 KiB crudo · 12,8 KiB gzip** en 2 archivos, y **baja en todos los anchos**. El total de la ruta es 1429,1 KiB crudo · 436,8 KiB gzip, de los cuales 1386,1 KiB son heredados del layout raíz y no son de ningún lane.

    **Por qué la compuerta de S1/S2 no aplica.** Esas dos gatean una RUTA entera con `dynamic(..., { ssr: false })`, y por eso abajo del umbral el chunk ni se pide. Acá lo gateado es el COMPORTAMIENTO de un contenido que tiene que renderizarse en los dos lados del umbral: abajo de 1025 no se monta el motor, no se parte el texto y no se escribe una transformada —`s5-compacto.invariant.tsx` lo afirma con su control positivo— pero el código de las secciones y del sistema de motion baja igual, porque la sección es un solo árbol.

    **Por qué no se arregla por sección.** Partir cada sección en dos árboles —uno plano para abajo del umbral, otro con coreografía para arriba— obliga a escribir cada sección dos veces, y con dos lanes en paralelo son **dos implementaciones que divergen**. Es una decisión de la COMPOSICIÓN DEL HOME, se toma una vez y se aplica a las ocho.

    **Quién la cierra:** el sprint que componga el home. El instrumento ya existe y publica el número en cada corrida.

19. ⚠️ **`cn()` BORRA CLASES DEL SISTEMA v3 — `tailwind-merge` no conoce sus nombres.** Encontrado por SITIO-S5 y, **de forma independiente, por SITIO-S6**: dos hallazgos coincidentes de dos lanes aislados, sobre el mismo defecto y por caminos distintos.

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

    **El arreglo de raíz** es una línea en `src/lib/utils.ts`: agregar los `--text-*` y los `--font-weight-*` de /v3 a `extendTailwindMerge`. Está FUERA de los lanes de sección, por eso no lo tomó ninguno de los dos. Los dos dejaron **rodeos locales** —el color en un envoltorio que se hereda— y `s5-compacto.invariant.tsx` §5 lo vigila sobre el marcado renderizado (48 elementos con nivel declarado). **Los rodeos se sacan el día que se arregle la raíz**, y ese día el invariante sigue siendo válido: afirma el resultado, no el rodeo.

20. ⚠️ **`test:s2-bundle` QUEDA EN ROJO A PROPÓSITO, Y SE ARREGLA EN LA INTEGRACIÓN.** Abierto por SITIO-S5, que **frenó y reportó en vez de tocarlo**: es un instrumento del sistema de motion.

    **Qué falla:** el control positivo de `motion-bundle.invariant.ts` pide que las cinco huellas del sistema estén en los chunks que llevan `MARCA_MOTION`. Hoy `MARCA_MOTION` vive en `7416-….js` —el chunk perezoso del demo— y **cuatro de las cinco huellas se mudaron a `1379-….js`**, que es uno de los dos chunks propios de `/v3/secciones-a`.

    **Por qué se mudaron:** al haber un SEGUNDO consumidor del sistema de motion —las secciones lo importan de forma estática— webpack lo factorizó en un chunk compartido. Es el comportamiento correcto del empaquetador, no una regresión.

    **La propiedad que S2 protege sigue intacta**, y hay que decirlo: las tres afirmaciones de "ninguna huella en la carga inicial de `/v3`" pasan, `1379` **no** está en la carga inicial de `/v3`, y la marca tampoco aparece en su HTML. Lo que venció es la PREMISA del control —"el sistema vive en el chunk marcado"—, no la tesis.

    **El arreglo (opción A):** que el control busque las huellas en TODOS los chunks del build en vez de sólo en los marcados. Es una línea.

    **Quién lo cierra:** la integración de los dos lanes, junto con el mismo hallazgo que SITIO-S6 reportó por separado.

21. ⚠️ **UNA CORRIDA DE `ultracode` CON CUATRO SUBAGENTES SE PUEDE QUEDAR A MITAD POR LÍMITE DE GASTO.** Observado en SITIO-S5, y **le pasó al otro lane también**: en el primer despacho los cuatro subagentes murieron a la vez con *"You've hit your monthly spend limit"* después de ~750k tokens y ~12 minutos, con una sola sección terminada y otra a medio escribir.

    **Por qué importa y no es una anécdota de facturación:** el corte no avisa antes, deja el disco en un estado intermedio —carpetas a medio llenar, archivos de scratch sueltos— y **el reporte del workflow vuelve vacío**, así que el agente principal no sabe qué se entregó si no mira el disco.

    **La regla que queda:** después de un despacho en paralelo, **inventariar el disco antes de creerle al reporte**. Y para un lane largo, despachar en tandas o dejar el padrón de archivos declarado ANTES —que es lo que permitió retomar acá sin perder nada: `archivosDeclaradosQueFaltan()` dijo exactamente qué faltaba.
