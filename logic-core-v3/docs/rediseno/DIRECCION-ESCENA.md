# Dirección de la escena · home develOP

- **Qué es esto:** el documento de decisiones consolidadas del rediseño del home. Hasta hoy estaban repartidas en seis reportes de sprint (`docs/rediseno/outputs/`) y en una conversación larga con el dueño del proyecto. Acá quedan en un solo lugar.
- **Qué NO es:** un reporte de sprint. No cuenta qué se construyó ni cómo; cuenta **qué se decidió**. El cómo vive en los reportes y en los docs de módulo de cada archivo.
- **Estado:** escrito en S7 (2026-08-20), actualizado en S9 (2026-08-22) con la elección del recorrido y en S10 (2026-08-23) con el vaciado de la escena y el fondo de rendijas. Se actualiza cuando una decisión cambia — no cuando se implementa.

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

### 2.7 · El sol se ve porque el fondo es oscuro

S7 midió el problema del sol como contraste: el disco a 254 contra una pared a 213, o sea **41 puntos**. La envolvente lo resuelve por ser oscura: el fondo detrás del sol baja a **146 en Demos y 98 en el cierre**, o sea **109 y 157 puntos**. **El arco no se tocó** — azimut, elevación, nivel y kelvin siguen siendo los de S9, y la narrativa sigue siendo una tarde.

Y hay un segundo hallazgo, que nadie había medido: **los planos suspendidos tapaban entre el 46% y el 68% del disco** en toda su ventana. El 33,4% que S9 publicó era cobertura de encuadre, no visibilidad.

Encima del sol va un **washout aditivo** que apaga la trama en el anillo del núcleo, para que el sol se lea como el único lugar del cuadro sin patrón. **Arranca bajo a propósito:** no está pagando por contraste —eso ya lo resolvió el fondo— y todo lo que sume se lo come.

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
4. **Nada brilla por sí mismo.** Todo responde a las mismas luces, así que la sala entera se apaga con el cierre. La única excepción es el sol, que es una fuente y por eso tiene permiso — y aun así se apaga con el arco.
5. **Nada compite en peso visual con el logo.** El logo es el único negro puro del cuadro.
6. ~~**La cuña de adelante queda libre.**~~ **Sin objeto desde S10:** no queda ninguna masa suspendida que pudiera meterse entre la cámara y el logo. El instrumento que lo medía sigue en el repo (`__tests__/occlusion.ts`) con su lista de ocluyentes vacía y **un control positivo** que verifica que sabría detectar uno — sin eso el chequeo quedaría verde por vacío.
7. ~~**El fondo de una pose es el azimut opuesto al de su cámara.**~~ Era el corolario de la anterior, y con la envolvente el fondo es el mismo en toda la vuelta por construcción. Lo que sí cambia con el azimut es el paralaje entre las dos capas, que es el efecto.
8. **Sin tipografía en la escena 3D.** Sumar una fuente es sumar un activo y una dependencia. La escala graduada del piso da la unidad de medida sin escribir un número.
9. **Los patrones del fondo salen del vocabulario propio.** Retículas, tramas de rendijas y campos de puntos: lo que el sitio ya usa, leído en el repo. No se importan referencias de afuera. Ver §2.6.
10. **Nada de geometría sin significado.** Es la regla que S10 destiló al borrar cuatro familias de una vez: si una pieza solo "ocupa espacio con intención", se lee como descarte. Todo lo que quedó tiene una razón nombrable — el piso da escala y ancla, la envolvente es el fondo con vida, el sol es la fuente que se ve, las partículas son el aire.

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

### 4.1 · El balance de negro, y el pendiente que deja

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

> ⚠️ **Se aceptó la escena más clara, y hay un techo que ninguna perilla del fondo levanta.** En el hero y en Números el cuadro es **65% y 73% PISO**, así que la envolvente solo alcanza el 31% y el 17% de la pantalla. Se probó una envolvente el doble de pesada: arregla las tres poses bajas (quiénes somos a 143, demos a 103) y **casi no mueve las dos altas** (212 y 224), o sea que separa más los extremos.
>
> **El piso queda como sprint propio**, después de ver la rendija funcionando: es el último elemento en pie y calibrarlo a ciegas es apostar. Esta tabla es de dónde arranca.

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
| El sol — que es la luz principal | `probeSun.ts`, `SunBody.tsx`, y su posición en `LIGHT_ARC` |
| Niebla, shadow map y oclusión de contacto | `probeAtmosphere.ts` |
| **La envolvente de rendijas**: las dos capas, el desajuste y el batido | `probeMoire.ts` + `moireTextures.ts` (los generadores) + `MoireScreen.tsx` |
| El washout del sol | `probeSun.ts`, `SunWashout.tsx` |
| ~~El espacio: planos suspendidos, retícula aérea, pilares~~ | ~~`probeArchitecture.ts`~~ — **borrado en S10**, con `LogoFragments.tsx` |
| Las marcas de replanteo del piso | `floorMarks.ts` |
| La física: inercia, mouse, vira, deriva del aire | `choreographyPhysics.ts` |
| El editor de keyframes y el export | `choreographyEditor.ts`, `choreographyExport.ts` |
| El intro que hoy corre en el home | `src/components/layout/HomeIntro.tsx` |
| Las partículas: los dos campos, las conchas y el recorte de `gl_PointSize` | `probeParticles.ts`, `DepthParticles.tsx`, `BokehParticles.tsx` |
| Las comprobaciones estáticas | `src/app/probe-escena/__tests__/*.invariant.ts` |
| El instrumento de oclusión y cono libre — con su lista de ocluyentes **vacía** | `__tests__/occlusion.ts` |
| El instrumento de tinta, shading y muestreo de cuadro (S10) | `__tests__/logoInk.ts`, `shading.ts`, `frameProbe.ts` |

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

> ⚠️ **Exportar no es guardar.** El botón del editor copia al portapapeles. La calibración solo existe cuando ese texto se **pega** en el archivo. Ya costó una sesión entera de trabajo.

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
9. **EL PISO.** Es el pendiente que deja S10 y tiene sprint propio. Con la escena vaciada, en el hero y en Números el cuadro es 65% y 73% papel liso, y **ninguna perilla de la envolvente llega ahí** — está medido en §4.1. Se decidió mirarlo DESPUÉS de ver la rendija corriendo, porque es el último elemento en pie y calibrarlo a ciegas es apostar.
10. **Si el recorrido debería dar dos vueltas.** El argumento que lo descartaba murió con los planos (ver §2.2). Es decisión de recorrido, no de escena.
