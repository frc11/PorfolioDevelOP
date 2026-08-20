# S6 — Iluminación, atmósfera y coreografía calibrada · Escena 3D del home develOP

- **Fecha:** 2026-08-20 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S6-luz.md` · **Extiende:** `docs/rediseno/outputs/S5-EDITOR.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint src/app/probe-escena` exit 0 · `next build --webpack` exit 0 · 37 comprobaciones estáticas en verde. **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano en pantalla.**

---

## 0 · La trampa que casi se lleva el sprint puesto

**Hay que empezar por acá, porque es una lección de método y no un detalle.**

El sprint se escribió describiendo cuatro defectos concretos de la coreografía: un salto de altura en Números, dos keyframes del giro con el mismo ángulo, un retroceso de 6° en el final y un cierre sin presencia. Al abrir `choreography.ts` **ninguno de los cuatro existía**: el archivo tenía los 17 keyframes de S5 y los valores citados (`at: 0.464`, `354.09`, `distancia 16`) no aparecían en ningún lado del repo — se buscó en el worktree entero, en los otros tres worktrees y en el stash.

La explicación: el humano calibró los 24 keyframes con el editor de S5, grabó el video con esa versión, apretó **exportar**… y nunca pegó el bloque en el archivo. Al recargar, la sesión murió. El video existía; el dato no.

> ### ⚠️ Exportar no es guardar
>
> El botón de exportar copia al portapapeles. **Eso es todo lo que hace.** La calibración solo existe cuando ese texto se pega en `choreography.ts`; hasta entonces vive en un portapapeles que la siguiente copia pisa y en un módulo que muere al recargar.
>
> El rodeo del portapapeles es deliberado —lo que se queda tiene que ser un acto explícito del humano, y por eso el probe no escribe en disco— pero eso significa que **el paso que guarda es el pegado, no el click**.

S6 lo dejó escrito en tres lugares y con la anécdota adentro, para que no vuelva a pasar:

- El doc de módulo de **`choreographyEditor.ts`**, con un bloque propio.
- El panel del editor, arriba del botón: *"Exportar no es guardar."*
- El texto que acompaña al bloque exportado: *"Pegá esto ahora… copiarlo no guarda nada."*

**Corolario de flujo:** un sprint que dice "leé `choreography.ts` en su estado actual" no alcanza. Lo que hay que verificar es que el archivo y el video sean la misma cosa, y eso se comprueba mirando un valor concreto del video contra el archivo antes de empezar.

---

## 1 · Qué se construyó

Cuatro cosas, todas adentro de `/probe-escena`, ninguna toca el home.

1. **Un sistema de iluminación propio de la escena**: rig de tres puntos, con la principal y el relleno fijos al mundo y el contraluz solidario a la cámara. `keyIntensity` y `keyKelvin` **se eliminaron de la pose de los keyframes**.
2. **El arco de luz**: una curva ligada al progreso, en `choreography.ts` junto al resto de lo que se calibra, que sube y baja el rig entero con una pendiente distinta para cada luz.
3. **Atmósfera**: niebla lineal, un shadow map cuatro veces más barato con una penumbra que ahora se elige, y una oclusión de contacto debajo del logo. Más el rediseño de los dos campos de partículas y la rugosidad de la tinta.
4. **La coreografía calibrada, convertida y arreglada**: los 24 keyframes del editor pasados al tipo nuevo y los cuatro defectos del sprint resueltos sobre ellos.

No se tocó el home, ni un archivo frozen, ni la base de datos, ni se sumó una dependencia. Cero `any`. Cero `setState` por frame.

---

## 2 · La luz

### 2.1 · La decisión que ordena todo

> **Key y fill son del ESPACIO. El rim es del OBSERVADOR.**

La principal y el relleno van **fijos al mundo**, que es la decisión de diseño original del probe y hay que conservarla: con luces fijas, orbitar cambia la iluminación además del punto de vista, y por eso los seis tramos pueden verse distintos entre sí. Si toda la luz viajara con la cámara, todos los ángulos se verían igual de bien y el probe daría un falso positivo.

El contraluz va **solidario a la cámara**, y no es una excepción caprichosa: las dos luces fijas resuelven un problema del ESPACIO (cómo está iluminada la sala) y el rim resuelve uno de la VISTA (que el logo se despegue del fondo que le toque detrás). Un problema de vista se resuelve con una luz de vista.

| luz | dónde | intensidad | sombra |
|---|---|---:|---|
| **key** | azimut −42°, elevación 36°, fija al mundo | 4,60 | sí, la única |
| **fill** | azimut +58°, elevación 14°, fija al mundo | 1,35 | no |
| **rim** | **cámara + 148°**, altura = 1,4 + 0,85 × altura de cámara | 3,20 | no |
| hemisférico | — | 2,10 | — |

La relación key:fill es de **3,4 a 1**. Más parejo aplana; más abierto deja la cara en sombra sin información, que es exactamente lo que el humano vio ("se ve plana").

### 2.2 · Por qué el rim funciona en toda la órbita

Un contraluz solo hace de contraluz cuando está más o menos detrás del objeto **desde donde se mira**. Fijo en un azimut cubre una ventana de ±60° del recorrido y en el resto es una luz frontal más; dos rims opuestos fijos tapan más pero dejan huecos a 90° de los dos, que es justo donde cae el medio giro de Demos. Solidario a la cámara no tiene huecos por construcción.

**Azimut: 148°, no 180°.** A 180° exactos la luz pega en la cara trasera del logo, que desde la cámara no se ve: un plano extruido no tiene nada que rimear si la luz está justo detrás. Corrida 32° empieza a rasar el canto de un lado, que es donde el filo se dibuja. El corrimiento va hacia el lado opuesto al de la principal, así que key y rim se leen como dos fuentes distintas.

**Altura: sigue a la cámara, no la espeja.** Ésta es la parte que se puede hacer mal — desde arriba se ve el canto de arriba y desde abajo el de abajo, así que un contraluz alto con la cámara abajo estaría iluminando exactamente lo que no se ve.

| momento | cámara.y | rim.y |
|---|---:|---:|
| entrada | +9,00 | +9,05 |
| hero | 0,00 | +1,40 |
| portfolio | +6,00 | +6,50 |
| demos · giro ¾ | −3,90 | −1,92 |
| cierre | +1,50 | +2,68 |

Se barrió el track en 500 puntos: el rim queda **siempre detrás, siempre del lado que se está mirando, y nunca por debajo del papel** (margen mínimo 2,39 sobre `FLOOR_Y` = −4,30). Es el mismo lugar donde un fotógrafo pone el backlight.

### 2.3 · Lo que el rim NO resuelve

**Con la cámara de frente al logo** (azimut ~0 o ~180: hero, quiénes somos, números y cierre) el canto está de perfil y proyecta un ancho casi nulo. Ahí no hay superficie donde dibujar un filo, por bien puesta que esté la luz. Lo que separa al logo del fondo en esos momentos es la niebla, que sube el valor de los planos lejanos mientras el logo conserva su negro entero.

> **De frente separa la niebla. De perfil separa el rim.**

La palanca que haría leer el filo también de frente es geométrica y no de luz: el bisel de la extrusión hoy es 1/1 sobre un viewBox de 1024, o sea **0,007 de mundo — invisible**. Un chaflán de ~12 unidades daría una faceta de 0,084 que agarra el rim en cualquier ángulo. **No se tocó**: cambia la silueta de la marca y eso se aprueba mirando, no calculando.

### 2.4 · El arco

Vive en `choreography.ts`. Cinco puntos, **todos en bordes de pantalla** (0, 4/8, 6/8, 7/8, 8/8), que es la misma retícula del resto del recorrido:

| at | nivel | kelvin | por qué |
|---|---:|---:|---|
| 0 → 0,5 | 1,00 | 6500 | meseta. Hero, quiénes somos y números a luz plena: bajarle la luz a una sección que alguien está leyendo es cobrarle el efecto al lector |
| 0,75 | 0,84 | 6850 | escalón chico. **Al giro no se le baja la luz** |
| 0,875 | 0,60 | 7300 | el movimiento final ya en penumbra |
| 1 | **0,34** | 7700 | el cierre, con `arrive` — muere rápido y sostiene |

**Qué reemplaza.** Los valores calibrados no eran una curva: el primer keyframe arrancaba en **intensidad 0** (el recorrido empezaba literalmente a oscuras), el hero saltaba a 9 —el tope del slider—, números volvía a 9, portfolio caía a 4, y el cierre terminaba en 2,0 a **2000 K**. Veinticuatro valores sueltos, con seis de ellos interpolados por el propio editor al duplicar.

**El apagado no es plano, y ahí está la mitad del efecto.** En el cierre: **ambiente 0,209 · key 0,340 · rim 0,591.** El ambiente muere antes que las fuentes (las sombras se cierran) y el contraluz se resiste (el logo se lee por su filo en una sala en penumbra). Si todo bajara parejo, apagar la sala sería bajarle el brillo a una foto.

> **La decisión más opinable del sprint, dicha en voz alta.** El recorrido calibrado terminaba en **2000 K** —ámbar profundo, una sala que se apaga como se apaga el tungsteno—. El arco va para el otro lado, a 7700 K, y la razón está en el repo: **este set es papel neutro**, y S4 ya había rechazado un default cálido (5600 K) justo porque "el papel renderizaba rosado y el default del instrumento tenía un sesgo de color que no era una decisión". A 2000 K se tiñe el papel entero, y con él el ciclorama, los planos y la niebla. **Para el cierre ámbar: cambiar ese 7700 por ~2200.** Un número.

### 2.5 · El slider de intensidad pasó a ser el maestro

En modo manual el loop lee `keyIntensity` como una **fracción** de la luz plena y con esa fracción mueve las tres luces, el hemisférico y la niebla — las mismas proporciones que usa el arco. Un slider que moviera solo la principal daría un modo manual iluminado distinto que el recorrido, y las mediciones dejarían de ser comparables entre modos.

---

## 3 · Atmósfera, sombra y materiales

### 3.1 · La niebla

`Fog` lineal, `near 20 / far 150`, color un escalón por debajo del papel (`#EFEFEC`). Lineal y no exponencial porque hace falta un `near` explícito: hay algo que **no** se puede velar.

Los tres números salen del recorrido calibrado, no de un rango genérico:

- **La distancia de ojo más grande de todo el recorrido es 17,5**, y el cierre está a 16,1. Con `near` en 20 el margen es de 2,5 y aguanta el offset de mouse. **El logo nunca se vela, en ningún frame** — es la condición para que sea el punto de mayor contraste de la escena.
- **El anillo de planos cae entre 23 y 33 de la cámara**: entre 2% y 9% de niebla. Un velo, no un lavado.
- **El ciclorama cae entre 45 y 87**: entre 19% y 52%. Ahí trabaja de verdad.

> ⚠️ **La perilla delicada, y en qué dirección tira.** La mezcla ocurre en lineal contra un color casi blanco, así que un 9% de niebla sobre un `#191917` multiplica su luminancia por diez: los planos del fondo del hero pasan de un sRGB de 0,10 a uno de ~0,30. **Eso es el efecto —lo lejano se aclara y se aleja— pero se come parte de la masa oscura que S5 compuso.** Las dos salidas son un número cada una: subir `FOG_NEAR` o bajar `PLANE_DARK_COLOR`.

No puede formarse un halo, por construcción: el ciclorama también está enniebla y está siempre más lejos que lo que tiene delante, así que su valor es siempre el más cercano al de la niebla y todo lo demás queda por debajo.

El color de la niebla **y el fondo de la escena se apagan con el arco**. Sin eso, la escena se oscurecería con un fondo blanco papel intacto detrás, que es la contradicción que arruina un cierre.

### 3.2 · La sombra, y un error de S4/S5 que costaba resolución

> **`SHADOW_ORTHO` bajó de 13 a 6,5, y no es un recorte: es el arreglo.**

La ortográfica del shadow map **no tiene que cubrir el largo de la sombra**. La cámara de sombra mira *en la dirección de la luz*, así que la sombra de un objeto cae exactamente sobre la silueta de ese objeto en el espacio de la luz: alargar el recuadro "para que entre la sombra" es cubrir superficie donde no puede haber ninguna. Lo único que tiene que entrar es el objeto — radio de su esfera envolvente **5,08**— más margen.

Ese error costaba resolución, y mucho: el recuadro de ±13 tenía cuatro veces el área necesaria.

**Con ±6,5 y 1024², el téxel mide 0,0127 de mundo: exactamente el mismo que con ±13 y 2048².** Misma nitidez, **la cuarta parte de la memoria y la cuarta parte del costo de cada pasada**.

### 3.3 · Una trampa de three 0.182

`<Canvas shadows>` con el booleano hace que r3f ponga `PCFSoftShadowMap`. Suena a la opción buena y **no lo es en esta versión**: el shader solo implementa `SHADOWMAP_TYPE_PCF`, `_VSM` y `_BASIC`, y `PCFSoftShadowMap` no está en la tabla `shadowMapTypeDefines` de `WebGLProgram.js`, así que cae al `|| 'SHADOWMAP_TYPE_BASIC'` del final.

**Una sola muestra, sin filtrar.** La sombra de esta escena venía siendo un borde duro y aliasado desde el probe original, y no había perilla que la ablandara porque el shader que corría no leía ninguna.

`PCFShadowMap` sí está en la tabla, y su implementación en 0.182 es un **disco de Vogel de 5 muestras rotado por píxel** con PCF por hardware en cada una, **escalado por `shadow.radius`**. Con radio 4 sobre un téxel de 0,0127 la penumbra queda en ~0,10 de mundo: un 1,5% del ancho del logo.

> ⚠️ **El costo se mueve de lado, no baja.** La PASADA de sombra cuesta la cuarta parte; la LECTURA pasa de 1 a 5 muestras por fragmento que recibe sombra. Son dos presupuestos distintos —el pre-pase de profundidad contra el sombreado de los receptores— y los receptores acá son el piso y el logo.

### 3.4 · La oclusión de contacto

Un plano horizontal con una máscara de alfa generada a mano: **un draw call, dos triángulos, una textura de 96² que se calcula una vez.** La alternativa de biblioteca (`<ContactShadows>` de drei) renderiza la escena desde abajo a una textura en cada cuadro — una pasada de render completa más, por un efecto que acá es una mancha fija debajo de un objeto fijo.

Núcleo denso en el tercio central y caída con exponente: una oclusión es fuerte y corta, no un degradé. Va **por encima de las marcas de piso** para oscurecerlas también.

**Su opacidad NO sigue al arco, y es correcto:** alfa constante sobre un fondo que se oscurece conserva la proporción, así que la oclusión se apaga sola al ritmo del piso sobre el que está. Un canal más en el loop para reproducir lo que la mezcla hace gratis sería costo sin efecto.

### 3.5 · "El logo tiene que apoyar en el piso"

**Se resolvió ópticamente y no geométricamente, y el motivo es un número.**

El papel está 0,72 debajo del borde inferior del logo, y ese hueco está tomado por abajo:

- El keyframe más bajo del recorrido deja la cámara en **−3,90** (el piso del slider), contra un papel en **−4,304**.
- El offset de mouse mueve la altura ±`0,045 × distancia`, que a la distancia de esas poses son ±0,32.

La holgura real es de **~0,08**. Subir el piso para que el logo apoye mete la cámara abajo de la hoja en Demos, donde no hay escena. Bajar el logo tampoco sirve: la órbita y el encuadre están centrados en el origen, así que correrlo descentraría el pivote y el objeto se bambolearía en cuadro al girar.

Así que el apoyo lo da la oclusión de contacto. **Si se quiere el contacto geométrico, es un sprint con tres números atados** —el piso, el mínimo del slider de altura y los cuatro keyframes de Demos— y no un cambio suelto.

### 3.6 · Los materiales

**La rugosidad de la tinta bajó de 0,52 a 0,34**, y es lo que le da forma al objeto. Un negro de albedo casi nulo no se describe con luz difusa: por más intensidad que se le ponga, `0,0046 × lo que sea` sigue siendo negro. Lo único que dibuja el volumen de una pieza negra es el **reflejo especular**, que no depende del albedo (con `metalness` 0, three usa el 4% de un dieléctrico) y cuya fuerza la maneja este número.

Es el número a mover si al mirarlo se ve cromado (subirlo) o todavía plano (bajarlo).

---

## 4 · Las partículas

**Menos, más grandes, con vida propia.**

| | S5 | S6 |
|---|---:|---:|
| polvo — reservadas | 4.000 | **400** |
| polvo — dibujadas por default | 900 | **220** |
| polvo — tamaño | 0,055 | **0,19** |
| bokeh — cantidad | 70 | **30** |
| bokeh — tamaño | 1,0 | **1,5** |
| bokeh — opacidad | 0,14 | **0,20** |

El motivo es de lectura, no de costo: a 0,055 una partícula a media distancia ocupaba **2,5 píxeles**. Cuatro mil cosas de dos píxeles no se leen como polvo suspendido, se leen como ruido de compresión — y encima titilan al mover la cámara, porque a ese tamaño el muestreo manda. A 0,19 la misma partícula ocupa **8,5 píxeles** a media distancia y 17 de cerca.

El degradé por distancia se abrió en los dos extremos (`#5A5A57` → `#DCDCD9`): con menos partículas, cada una tiene que llevar más información de profundidad.

**La deriva.** Los dos campos giran despacio sobre el eje vertical, en sentidos opuestos y con períodos inconmensurables (0,9 y −1,6 °/s), más un bamboleo vertical de período propio. Hay tres formas de mover partículas y ésta es la única que cuesta **cero por partícula**: una matriz por campo, sin volver a subir el buffer a la GPU en cada cuadro y sin GLSL a mano que este sprint no puede verificar. Lo que hace que no se lea como "el fondo gira" es que son dos campos decorrelacionados — el mismo truco de la vira, aplicado al aire.

**El giro es solo sobre Y, y eso no es estético:** los dos campos son media esfera recortada por el papel, y girando sobre el vertical cada partícula conserva su altura exacta. El bamboleo sí la cambia, y por eso su amplitud está muy por debajo del margen que el recorte dejó.

Corre siempre que no haya `prefers-reduced-motion`, **incluso con la física apagada**: apagar la física es para juzgar el track crudo de la cámara, y el aire no interfiere con eso.

---

## 5 · La coreografía calibrada

### 5.1 · La conversión

Los 24 keyframes del editor entraron con `keyIntensity` y `keyKelvin` adentro de cada pose y con `...LIT` en varias. La pose quedó en **cinco canales** — ángulo, altura, distancia y los dos de encuadre — y nada más.

De los 24 quedan **23**: se eliminó uno (ver 5.4).

### 5.2 · Arreglo 1 · El salto de Números

El keyframe derivado bajaba a **−3,90** (el piso del rango) y el siguiente subía a **1,00** en 0,024 de progreso.

Medido en **alturas de cuadro** —cuánto se mueve y cuánto cambia de tamaño el objeto EN PANTALLA, que es la única unidad en la que una bajada y un alejamiento se comparan— los tres beats de esa pantalla corrían a:

```
antes:  17,9  /  47,4  /  19,3     dispersión 105%
ahora:  24,7  /  24,7  /  25,8     dispersión  4,5%
```

El del medio iba a **más del doble** que sus dos vecinos. Eso es el tirón, y se lee como un rebote.

**Se eligió separar los `at`** (0,464 → 0,445 y 0,488 → 0,491) y no sacar el intermedio derivado: la bajada a −3,90 es intención calibrada —el humano arrastró ese slider hasta el piso— y sacarla tiraría el gesto entero. **La pantalla dura exactamente lo mismo y ninguna pose se tocó.**

Dos cambios más en el mismo lugar:

- **`ease: 'linear'` → `'shift'`** en el derivado. `linear` es para los waypoints que viven ADENTRO de una gesticulación, y éste no lo es: la descripción dice SECUENCIAL, o sea que ahí termina el "baja la altura" y recién entonces arranca el "se aleja". Un final de gesto pide una curva de llegada.
- **`números · se aleja` → `números · sube y se aleja`.** El nombre mentía: de −3,90 a 1,00 son 4,90 de altura contra 2,00 de distancia, y medido en pantalla la subida pesa **más del triple** que el alejamiento. Un keyframe que dice una cosa y hace otra es la clase de dato que después nadie se anima a tocar.

### 5.3 · Arreglo 2 · El giro de Demos

`giro ¼` y `giro ½` tenían **el mismo ángulo** (135°), así que entre los dos la cámara no rotaba: solo se desplomaba 7,8 de altura.

```
antes:  5294  /  0  /  2250  /  2571   grados por unidad de progreso
ahora:  2500  /  2500  /  2500  /  2571     dispersión 2,8%
```

Arrancaba al doble de velocidad, frenaba en seco y volvía a arrancar. Eso es el frenar-caer-arrancar.

**Ninguna pose compuesta se tocó.** Lo arreglan dos cambios:

- **`giro ½` pasa de 135° a 180°.** El 135 repetido no era una composición: es lo que queda cuando se compone un waypoint moviendo altura, distancia y encuadre sin tocar el slider de ángulo. **180 es el punto medio exacto de sus dos vecinos** (135 y 225), así que la vuelta pasa por su mitad en la mitad del tramo.
- **Los `at` de `giro ¼` y `giro ½` se corren** a 0,679 y 0,697. El primer tramo tenía 0,017 de progreso para 90°: el doble de rápido que cualquier otro.

El comentario del archivo prometía "proporcional al ángulo (74° / 31° / 83,5° / 74° sobre 262,5°)". Esos números eran de una captura anterior y hacía rato que no describían el dato. **La vuelta ahora va 45 → 135 → 180 → 225 → 315**, y el tramo 6 la completa hasta 360.

### 5.4 · Arreglo 3 · El retroceso del final

El ángulo iba **315 → 360 → 354,09 → 0**. Ese retroceso de casi 6° no está en la intención descrita y se lee como una vacilación, seguida de otro cambio tan chico que no se percibe.

**Se eliminó `final · baja`** (el del 354,09). Quedan tres beats limpios: **se levanta, gira hasta 360, se aleja al cierre.**

El "baja" de la descripción original no se perdió: la altura cae de 4,50 a 1,50 dentro del último beat, junto con el alejamiento, y ahí se lee como una sola cosa en vez de como dos.

Los dos keyframes del cierre pasaron a llevar **360 escrito y no 0**. Es la misma posición de cámara y no cambia un píxel —`short` da delta cero en los dos casos, verificado— pero este archivo guarda el ángulo **acumulado** y escribir 0 después de un 360 contradice su propia convención.

**La vuelta entera sobrevive**: la tabla desenvuelta termina en 360 exacto.

### 5.5 · Arreglo 4 · El cierre

| | antes | ahora |
|---|---|---|
| `at` de la llegada | 0,938 | **0,890** |
| sostén | 0,50 de pantalla | **0,88 de pantalla** |
| `frameX` | −0,02 | **0** |
| altura · distancia | 1,50 · 16,0 | *sin cambios* |
| luz | 2,0 de 9 a **2000 K** | nivel 0,34 neutro-frío, rim al 0,59 |

**La distancia y la altura no se tocaron, y es una decisión.** El sprint pedía "más presencia del logo" leyendo un cierre que se veía chico y apenas visible. Medido: con FOV 35 y distancia de ojo 16,07, **el logo ya ocupaba el 70,7% del alto del cuadro**, dejando 14,6% de aire arriba y abajo — sobre una ventana de 1080 son 158 px de cada lado, que alcanzan de sobra para el wordmark y una línea de slogan. Lo que lo hacía invisible era la luz: 2,0 de intensidad a 2000 K, ámbar profundo, sobre un objeto casi negro. **Agrandarlo más se comería el aire donde va el texto.**

Lo que sí faltaba era **sostener**: la llegada al cierre pasó de 0,938 a 0,890, así que el recorrido termina con casi una pantalla entera quieto. Se paga con velocidad —el alejamiento pasa de 12,6 a 27,7 alturas de cuadro por unidad de progreso— y es un intercambio real, pero 12,6 lo dejaba como el segmento más lento del recorrido justo antes del final, y con `arrive` el alejamiento resuelve en el primer tercio igual.

El encuadre va a **cero exacto**: una pantalla de cierre con el logo centrado y dos textos simétricos no puede tener un descentrado de 0,02 que nadie eligió.

### 5.6 · Tres cosas que se encontraron midiendo y NO se tocaron

Van acá porque son datos útiles y porque el sprint no los marcó.

1. **Los dos movimientos más violentos del recorrido.** La caída de `demos · giro ½` corre a **106 alturas de cuadro por unidad de progreso** (7,8 de altura en 0,018) y el `final · se levanta` a **51** (8,4 en 0,037). El resto del track corre entre 12 y 31. Los dos son intención calibrada; si el recorrido se siente brusco, empiezan ahí.
2. **`frameY` no hace nada por debajo de una distancia de 11,4.** El recorrido disponible es `max(0, medio alto visible − media altura del logo)`, y por debajo de esa distancia da cero. El recorrido calibrado usa distancias de 7 a 16, o sea que el canal solo vive en cuatro de sus diez poses — probablemente por eso el humano lo dejó en cero en todas. El único 0,10 que quedó (en `giro ½`, a distancia 8) es **provadamente inerte**.
3. **Dos de los siete sostenes ya no sostienen.** `quiénes somos · persona 2 · sostén` y `números · sostén` salieron del botón duplicar y después se les movió la pose, así que el nombre miente. Están marcados en su comentario; renombrarlos son dos strings y se dejó como está para no romper la referencia del video ya grabado.

---

## 6 · El editor, que tenía que seguir funcionando

Sacar la luz de la pose lo tocaba entero (regla 10 del sprint). Lo que cambió:

- **El exportador ya no decide `...LIT`.** La pose son cinco canales y se emiten los cinco.
- **Los sliders se bloquean por modo.** En coreografía los siete son telemetría; en **editor** los cinco de pose vuelven a ser entrada y **los dos de luz quedan de lectura y siguen vivos**: muestran lo que el arco dicta en el `at` del keyframe seleccionado, así que la pose se compone bajo la luz que ese momento va a tener de verdad.
- **En modo editor el loop publica solo la luz**, nunca la pose. Publicar la pose le pisaría el dato al keyframe que se está componiendo, y el ángulo envuelto se comería la vuelta entera del cierre.
- **Los avisos de "exportar no es guardar"** (ver §0).

> **La comprobación más fuerte del sprint:** exportar sin haber tocado nada devuelve **el archivo byte por byte** (18.524 bytes). Las tres normalizaciones que S5 dejó anotadas quedaron cerradas al reescribir el bloque desde el propio exportador.
>
> Y una regla nueva que el renombre puso a la vista: **el `name` es la clave de `choreographyNotes.ts`.** Renombrar un keyframe sin mover su nota tira el comentario en el próximo export sin que nadie se entere. Hay una comprobación que lo detecta.

---

## 7 · Contabilidad

### 7.1 · Draw calls y triángulos

**13 draw calls** (12 + el logo), contra 12 en S5. El único que suma es la oclusión de contacto.

| familia | triángulos | draw calls |
|---|---:|---:|
| marcas 48 · planos 11 · retícula 17 · pilares 3 (instanciados) | 948 | 4 |
| losa del piso + ciclorama | 4.864 | 2 |
| fragmentos del logo | 2.640 | 3 |
| **oclusión de contacto** | **2** | **1** |
| polvo + bokeh (puntos) | — | 2 |
| **total sin el logo** | **8.454** | **12** |

**+2 triángulos sobre S5.** Los vértices de partículas bajan 10× (4.000 → 400).

### 7.2 · Sombra y fill

- **1 pasada de shadow map por frame mientras la vira corre**, igual que S5, pero el mapa pasó de 2048² a 1024²: **la cuarta parte de memoria y de fill por pasada, con el mismo téxel.**
- La lectura de sombra pasó de 1 a 5 muestras por fragmento receptor (ver §3.3).
- **Overdraw de sprites, en el default: 72,7 → 75,4 (+3,7%).** En el máximo del slider: 82,1 → 81,9. Cada partícula se ve mucho más y el fill queda igual.
- **Una luz más** en el loop del shader (3 direccionales + hemisférico, contra 2 + hemisférico) y la mezcla de niebla en cada fragmento.

### 7.3 · Peso — medido, mismo método que S4 y S5

`next build --webpack` con `E2E_DIST_DIR=.next-probe`, el grupo de chunks leído del `react-loadable-manifest.json` del propio build, cada archivo comprimido a nivel 9.

| chunk | qué es | minificado | sobre la red |
|---|---|---:|---:|
| `bd904a5c` | three (geometrías) | 363,5 KiB | 97,4 KiB |
| `b536a0f1` | three (WebGLRenderer) | 341,2 KiB | 82,9 KiB |
| `b79b7286` | `@react-three/fiber` | 143,0 KiB | 45,2 KiB |
| `7545` | `three-stdlib` / SVGLoader | 21,6 KiB | 7,7 KiB |
| `4857` | resto del grupo del canvas | 13,2 KiB | 5,2 KiB |
| **`3677`** | **el probe, lado canvas: escena + rig + luz** | **15,5 KiB** | **5,7 KiB** |
| `logodevelOP.svg` | el único activo | 0,6 KiB | 0,4 KiB |
| **subtotal — grupo del canvas** | | **898,6 KiB** | **244,4 KiB** |
| *baseline S5, mismo grupo* | | *895,8 KiB* | *242,4 KiB* |

### **+2,8 KiB minificados. +0,3%.**

Y el detalle que importa más que el total:

> **Los cinco chunks compartidos salen byte por byte idénticos a los de S4 y S5.** `THREE.Fog`, `PlaneGeometry` y `MeshBasicMaterial` **cuestan cero bytes** — ya estaban en el bundle, igual que pasó con `Lathe`, `Torus` e `InstancedMesh` en los sprints anteriores. Los +2,8 KiB están todos en el chunk propio: las tres luces, el arco, la niebla, el contacto y la deriva.

| | minificado | sobre la red |
|---|---:|---:|
| `app/probe-escena/page` — panel, editor, notas y export | 52,6 KiB | 18,6 KiB |
| **total de la ruta, de punta a punta** | **951,2 KiB** | **263,0 KiB** |

El chunk de la ruta subió de 39,0 (S5) a 52,6 KiB, y **casi todo es texto de comentarios**: los de los 23 keyframes viven en `choreographyNotes.ts` como literales. Es el precio de que el export devuelva el archivo con su razonamiento intacto, se paga una vez y **no viaja al home**: `/probe-escena` es una ruta interna con `noindex` y sin un solo link entrante. Lo que el home eventualmente va a cargar es el grupo del canvas.

### 7.4 · Qué apagar primero si mobile no rinde, en orden

1. **`VIRA_UPDATES_SHADOW = false`** (`choreographyPhysics.ts`). Recupera la pasada de sombra entera. Sigue siendo el más caro que se apaga con un booleano, aunque ahora cueste la cuarta parte. El balanceo es de ~1°, así que el desfase es chico.
2. **`SHADOW_RADIUS` 4 → 1.** Vuelve la lectura a prácticamente una muestra. Es lo que se paga por la penumbra elegible.
3. **`BOKEH_COUNT` / `BOKEH_SIZE`.** Los 30 sprites grandes son el 90% del overdraw de la escena.
4. **`SHADOW_MAP_SIZE` 1024 → 512**, con la ortográfica en 6,5: téxel 0,025, y siguen quedando ~270 téxeles sobre el logo.
5. **La niebla** es lo más barato de todo (una mezcla por fragmento). No tocarla primero.

**Nada de esto vale para mobile todavía: sigue sin medirse un solo teléfono, y sigue sin medirse frame time — necesita navegador.**

---

## 8 · Verificación

```
tsc --noEmit                       → exit 0
eslint src/app/probe-escena        → exit 0
next build --webpack               → exit 0
verificación estática (tsx)        → 37/37 en verde
```

**Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido del sprint.**

Las 37 comprobaciones corren sobre los mismos módulos que usa la escena y cubren: el round-trip byte a byte del exportador, que ninguna nota quedara huérfana tras el renombre, que ninguna pose lleve luz, que la vuelta de 360° sobreviva a los cambios de ángulo, los cuatro arreglos con sus números de antes y de después, la forma del arco y el reparto del apagado, el rim barrido en 500 puntos del track, la ortográfica contra la esfera envolvente del logo, el téxel contra el de S5, que el logo nunca entre en la niebla, la composición del cierre y la forma de la máscara de contacto.

> **Tres afirmaciones mías las tumbó el propio verificador y hubo que corregirlas**, no al revés: un separador de comentario mal rellenado que rompía el round-trip, una dispersión del giro que yo había escrito como 1,2% y era 2,3%, y un reparto de `at` que yo daba por parejo y estaba a un 18%. **Los comentarios del archivo dicen ahora lo que los datos dicen**, y eso se puede volver a comprobar corriendo el script.

---

## 9 · Lo que queda

### Para calibrar mirando

1. **La temperatura del cierre**: 7700 K (frío) contra los 2000 K (ámbar) que tenía la calibración. Un número, y está argumentado en los dos sentidos en `LIGHT_ARC`.
2. **`FOG_NEAR`**, que es el que decide cuánto se lava la masa oscura de S5 (§3.1).
3. **`SHADOW_RADIUS`**: la rotación por píxel del disco de Vogel es ruido azul, y a radio grande se puede leer como grano en la penumbra.
4. **`INK_ROUGHNESS`** (0,34): subirlo si se ve cromado, bajarlo si sigue plano.
5. **Las intensidades del rig** y el reparto del apagado: `KEY_INTENSITY`, `FILL_INTENSITY`, `RIM_INTENSITY`, `HEMI_INTENSITY`, `HEMI_DIM_GAMMA`, `RIM_DIM_SHARE`.
6. **La caída de `giro ½` (106 alturas de cuadro/progreso)** y el `final · se levanta` (51), si el recorrido se siente brusco.
7. **El bisel de la extrusión**, si se decide que el filo tiene que leer también de frente (§2.3).
8. **`DoubleSide` del ciclorama** → `FrontSide`, pendiente heredado de S4 que sigue sin poder verificarse sin navegador.

### El límite de 300 líneas

Los **nueve archivos nuevos están todos por debajo** (72 a 229). De los que estaban arriba, S6 bajó dos y subió otros:

| archivo | S5 | S6 | |
|---|---:|---:|---|
| `probeScene.ts` | 507 | **413** | ↓ salieron luz, niebla y partículas |
| `choreographySampler.ts` | 268 | **246** | ↓ salió el evaluador de bezier |
| `choreographyEditor.ts` | 298 | 316 | ↑ el aviso de §0 |
| `probeStore.ts` | 310 | 331 | ↑ docs |
| `choreographyNotes.ts` | 187 | **388** | ↑ los comentarios de 23 keyframes |
| `choreography.ts` | 508 | **572** | ↑ 23 keyframes con su razonamiento |
| `OrbitRig.tsx` | 476 | **543** | ↑ el rig de luz y la deriva |

Los dos últimos son la tensión real del sprint y conviene nombrarla: **`choreography.ts` y `choreographyNotes.ts` son un archivo de datos y su tabla de comentarios, y el sprint pidió explícitamente documentar cada cambio en el comentario de su keyframe.** Su largo es proporcional a cuántos keyframes hay y a cuánto se explica cada decisión; partirlos por cantidad de líneas sería partir el recorrido al medio, que es lo que ningún lector quiere. `OrbitRig.tsx` es un solo `useFrame`: se le sacaron el encuadre y la aplicación del rig de luz, y ahí se paró — repartir el cuadro entre archivos lo hace más difícil de razonar que lo que la regla protege.

---

## 10 · Archivos

### Nuevos

```
src/app/probe-escena/_components/
  choreographyTypes.ts    Tipos, canales, curvas y el tipo del arco
  choreographyPhysics.ts  Inercia, mouse, vira, deriva del aire, reproducción
  probeLighting.ts        El rig de tres puntos y cómo se apaga cada uno
  probeAtmosphere.ts      Niebla, shadow map y oclusión de contacto
  probeParticles.ts       Los dos campos + los tres generadores de sprite
  lightRig.ts             Aplicar el rig por frame, sin React adentro
  ContactOcclusion.tsx    El plano de la oclusión
  bezier.ts               El evaluador de curvas
  cameraFraming.ts        La geometría del encuadre
docs/rediseno/outputs/S6-LUZ.md
```

### Modificados

```
src/app/probe-escena/_components/
  choreography.ts         Los 23 keyframes calibrados y arreglados + `LIGHT_ARC`
  choreographyNotes.ts    Los comentarios de los 23, reescritos contra el dato real
  choreographySampler.ts  + `sampleLightArc`; − el evaluador de bezier
  choreographyEditor.ts   + el aviso de "exportar no es guardar"
  choreographyExport.ts   − la lógica de `...LIT`
  probeScene.ts           − luz, − partículas; + `INK_ROUGHNESS`, + la nota de `FLOOR_Y`
  probeStore.ts           `keyIntensity` como maestro del rig; defaults de partículas
  OrbitRig.tsx            + el arco, el rig de luz, la niebla y la deriva
  ProbeStage.tsx          + las tres luces, la niebla, el contacto y los grupos que derivan
  ProbeControls.tsx       Bloqueo de sliders por modo
  ProbeEscena.tsx         El fondo sale de `FOG_COLOR`
  ProbeLogo.tsx           `INK_ROUGHNESS`
  KeyframeEditor.tsx      Copy: cinco de pose + dos de luz de lectura, y el aviso
  KeyframeExportPanel.tsx Copy: "pegá esto ahora"
  DepthParticles.tsx      Imports (el campo se mudó)
  BokehParticles.tsx      Imports
```

### Intocados

El home entero. Los frozen: `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. De `logo-footprint.ts` solo se lee `LOGO_BOX_WORLD`, como siempre.

**El probe sigue importando exactamente tres cosas de afuera de su carpeta** —`MOTION_EASE`, `useReducedMotion` y `LOGO_BOX_WORLD`— y nada del repo lo importa a él, salvo la línea de `publicRoute.ts` que ya venía de antes.
