# S7 — Sol, moiré, curvatura y variantes de recorrido · Escena 3D del home develOP

- **Fecha:** 2026-08-20 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S7-escena.md` · **Extiende:** `docs/rediseno/outputs/S6-LUZ.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint src/app/probe-escena` exit 0 · `next build --webpack` exit 0 · **97 comprobaciones estáticas en verde, y esta vez quedan en el repo.** **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano en pantalla.**

---

## 0 · La corrección que cambió el sprint a mitad de camino

En la Parada 1 reporté que el sol iba a estar en cuadro el **2,4% del recorrido** y expliqué por qué: una key de 3/4 delantera está, por definición, detrás del observador, y la cámara mira el logo de frente durante más de medio recorrido. El diagnóstico era correcto.

**La respuesta del dueño del proyecto fue que la restricción estaba mal puesta, no el sol:**

> El sol y la luz principal son la misma cosa. Un cuerpo suelto más una key aparte son dos soles conceptuales. Los dos recorren un ARCO ligado al progreso — el paso del día. Esto le da causa física al arco de luz que ya existe: la escena no se apaga porque bajamos un número, se apaga porque atardece.

Eso reescribió la Parte 1 entera y es la mejor decisión del sprint. Lo que yo estaba optimizando —dónde poner un cuerpo para que se vea— era un problema chico adentro de uno grande que no había visto: **la escena tenía una curva de luz sin causa.** El nivel bajaba porque una tabla decía que bajara.

Lo que quedó:

> ### El nivel de luz ES el seno de la elevación del sol
>
> `level = sin(elevación) / sin(36°)`. No es una coincidencia bonita: es la definición de cuánta irradiancia deposita una fuente lejana sobre una superficie horizontal. Los cuatro niveles que S6 había elegido a ojo —1 · 1 · 0,84 · 0,60 · 0,34— **salen exactamente de cuatro elevaciones**, y 36° es la que S6 ya había calibrado para la key. El arco arranca en la luz de S6 y desciende desde ahí. **No se perdió nada de lo calibrado y se ganó una razón.**

**Corolario de método.** Cuando un cálculo dice que algo se ve poco, hay dos preguntas: "¿cómo lo hago más visible?" y "¿por qué está donde está?". Yo contesté la primera y presenté la segunda como un hecho de la geometría. Era un hecho de la geometría **dada una restricción que nadie había puesto a prueba.**

---

## 1 · Qué se construyó

Cinco cosas, todas adentro de `/probe-escena`, ninguna toca el home.

1. **`docs/rediseno/DIRECCION-ESCENA.md`** — el documento de decisiones consolidadas: el preloader completo, la animación principal, las reglas de la escena, la paleta, las cuatro decisiones registradas para sprints posteriores y ocho preguntas abiertas.
2. **El sol, que es la luz principal.** Una sola tabla dice dónde está la fuente que se ve, de dónde viene la luz y desde dónde cae la sombra. Las tres recorren un arco ligado al progreso.
3. **El moiré**: una pantalla de rendijas alrededor de la escena, con dos tramas propias de develOP en las dos ranuras de textura del mismo material. Un draw call.
4. **Siete arcos de curvatura** en el recorrido base, todos `derived`, ninguno en Demos, sin tocar una sola pose ni un solo `at` compuesto por el humano.
5. **Tres variantes completas** —íntima, arquitectónica, dramática— con selector en vivo en el panel, el editor operando sobre la activa y sesiones independientes.

No se tocó el home, ni un archivo frozen, ni la base de datos, ni se sumó una dependencia. Cero `any`. Cero `setState` por frame.

---

## 2 · El sol

### 2.1 · Una tabla, no dos

`LIGHT_ARC` pasó de tres campos a cinco: `level`, `kelvin`, **`azimuthDeg`** y **`elevationDeg`**. `applyLightRig` resuelve **una** dirección por frame y con ella coloca las dos cosas:

```
SUN_DIRECTION  →  la directionalLight a KEY_DISTANCE (22)   ← proyecta la sombra
               →  el sprite a SUN_RADIUS (34)               ← es lo que se ve
```

Que las distancias difieran no es una inconsistencia: **una direccional no tiene posición en el sentido físico, solo dirección.** El 22 es dónde se para la cámara de sombra, y se la deja cerca para que su rango de profundidad quede apretado. El 34 es dónde se dibuja el cuerpo.

**Está verificado, no argumentado:** el test corre `applyLightRig` en 101 puntos del recorrido y compara las dos direcciones normalizadas. Desvío máximo **1,2 × 10⁻⁶ grados** — ruido de coma flotante. Y con el toggle "la luz sigue a la cámara" encendido los dos se mueven juntos, porque si la luz se movió, la fuente se movió.

### 2.2 · El arco, y las tres restricciones que lo fijan

| | valor |
|---|---|
| azimut | −42° → −32° → **+6°** → +38° → +50° |
| elevación | 36° → 36° → 29,6° → 20,7° → **11,5°** |
| barrido total | **92°** — menos de un cuarto de vuelta |

**1 · Acotado, no una vuelta.** La principal tiene que modelar el logo en todo el recorrido. La métrica es **γ**: el ángulo 3D entre la dirección a la luz y la dirección al observador, medido desde el objeto — el número que usa un fotógrafo (γ→0 luz plana desde atrás de la cámara · 45–70 tres cuartos · ≈90 lateral · >130 contraluz).

**2 · La visibilidad y el modelado son geométricamente opuestos, y hay que decirlo.**

> **Un sol entra en cuadro exactamente cuando está detrás del objeto desde donde se lo mira**, o sea cuando γ ≈ 180. Y γ ≈ 180 es el peor lugar posible para modelar. No hay arco que resuelva las dos cosas EN EL MISMO INSTANTE.

Lo que sí se puede es elegir **dónde se gasta el contraluz**. El arco lo gasta en el fondo del giro de Demos, que es donde la cámara está abajo mirando hacia arriba — y que es donde la key fija de S6 **ya lo gastaba** (γ = 137° en p ≈ 0,70). O sea: la visibilidad no le sacó modelado a ningún momento que lo tuviera.

**3 · El descenso coincide con el arco de luz porque ES el arco de luz.** Ver §0.

### 2.3 · Los números, contra la key fija de S6

| | key fija (S6) | el arco (S7) |
|---|---:|---:|
| sol en cuadro, todo el recorrido | 2,7% | **4,2%** |
| sol en cuadro, dentro de Demos + movimiento final | 6,9% | **11,2%** |
| ventana | p = [0,685 → 0,710] | **p = [0,684 → 0,726]** · 0,33 pantallas |
| **γ mínimo de TODO el recorrido** | **4°** (luz plana) | **29°** |
| γ en las seis ventanas de contenido | 35–69° | **30–51°** |

**El arco casi duplica la visibilidad dentro de Demos y, de paso, arregla un defecto que S6 no había medido: en `final · se levanta` la key fija quedaba a 4° del eje de la cámara, o sea luz completamente plana.** Ese punto ahora está en 53°.

**Por qué no más.** El giro de Demos corre a 2500°/unidad de progreso. Con medio cuadro horizontal de 29,3° y un halo de 20,5°, la ventana angular es de ~100°, y a esa velocidad relativa da **0,041 de progreso**. Para duplicarla el sol tendría que barrer 139° adentro de una sola pantalla: eso es un reflector, no un sol. **11,2% es el techo de esta geometría**, y lo que lo fija es la velocidad del giro, no la forma del arco.

### 2.4 · Blanco sobre blanco: por qué el sol es grande

Este set es papel claro y hay un techo duro: el píxel más brillante posible es 255 y el papel a luz plena ya está en 248. Medido replicando el shading real de three (irradiancia de las cuatro luces → BRDF de Lambert → `NeutralToneMapping` → sRGB → niebla):

| | valor |
|---|---:|
| el sol (blanco, `toneMapped: false`, con niebla) | **254/255** |
| la pared del ciclorama **detrás** del sol | **213/255** |
| la misma pared del lado que el sol SÍ ilumina | 244/255 |
| el piso de papel a luz plena | 248/255 |

Los 41 puntos de contraste salen de un hecho estructural y no de una perilla: **la pared contra la que se ve el sol es, por construcción, la única que el sol no ilumina.** Su normal apunta en contra, así que N·L < 0 y solo recibe hemisférico. El sol siempre se recorta contra su propia sombra.

Cuarenta y un puntos alcanzan para un disco, no para un destello. Por eso la forma la da el **tamaño** y el **degradé**, no el brillo:

- **núcleo 9,4° de diámetro = 27% del alto del cuadro** — un sol reconocible que no le disputa el cuadro al logo;
- **halo 41° = 117%** — nunca entra entero, siempre lo corta el borde. Verificado sobre los 2.000 puntos del recorrido.

### 2.5 · La sombra se mueve, y eso costó un número

Con el sol bajando a 11,5°, la sombra del borde superior del logo pasa de 10,9 a **38,8 unidades** de largo.

> **`SHADOW_FAR` subió de 46 a 64, y no es holgura: es obligatorio.**
>
> Si el rango se queda corto, el shader de three descarta el test (`shadowCoord.z <= 1.0`) y devuelve "iluminado": **la sombra se corta en seco** a mitad del piso. Un tajo recto sin nada que lo justifique. La punta más lejana queda a 60,9 de profundidad; con FAR en 46 se cortaba.

La ortográfica **no** hay que tocarla: la sombra cae sobre la silueta del objeto en el espacio de la luz, así que su huella sigue cabiendo en la esfera envolvente de 5,08 por rasante que sea. Lo que crece es la profundidad, no el ancho. El precio es precisión: el slab pasa de 34 a 52 de rango, así que el mismo `SHADOW_BIAS` normalizado equivale a 0,016 de mundo en vez de 0,010 — despreciable sobre un logo de 7 unidades.

**El costo de recalcular el mapa ya estaba pagado por la vira**, como dijo el pedido: en coreografía `autoUpdate` ya era `true`. Lo que S7 agrega es que también lo sea en modo **editor**, donde antes el mapa se congelaba.

### 2.6 · El relleno no acompaña al sol, y hay un costo medido

El arco lleva la principal de −42° a +50° y el relleno se queda en 58°: al final quedan a **8° una de otra**. En ese tramo el rig de tres puntos degrada de hecho a dos más el hemisférico. Medido: la fracción del contorno del logo con luz directa cae de 64% a 43% en el cierre.

**Se dejó así, con tres razones.** El relleno es del ESPACIO (decisión de S6: es el rebote de la sala, no un satélite del sol). La cara que la cámara ve **nunca queda peor iluminada que con la key fija** — se midió pose por pose y da igual o mejor en todas. Y donde ocurre la convergencia el nivel ya está en 0,34 y el borde lo dibuja el contraluz, que es solidario a la cámara.

Se probó la alternativa —el relleno siguiendo al sol a offset fijo— y **da peor**: la cara vista pierde luz en el cierre (1,20 contra 1,44) y el canto queda igual. Si igual se quiere separar las dos luces, la perilla es `FILL_AZIMUTH_DEG`.

---

## 3 · El moiré

### 3.1 · Dos tramas, una superficie, un draw call

Un cilindro abierto de radio 38, visto desde adentro, banda de y = −4 a 34. **192 triángulos y UNA superficie transparente.**

Las dos capas van en las dos ranuras de textura del mismo material, y eso es posible porque **en three 0.182 cada ranura tiene su propia matriz de UV** (`mapTransform` / `alphaMapTransform`, con sus varyings `vMapUv` y `vAlphaMapUv`). Sin eso harían falta dos mallas transparentes superpuestas: el doble de overdraw y un problema de orden entre ellas.

- **`map` = el campo de puntos.** El patrón propio de develOP —la retícula de `DotMatrix`, que está hoy en el intro y en las pantallas de auth—. Fijo.
- **`alphaMap` = las rendijas.** Deriva alrededor del cilindro: una escritura a `offset.x` por frame en el único `useFrame` de la escena.

180 rendijas contra 196 columnas de puntos dan **16 bandas de batido en la vuelta**, ~3,5 en cuadro. Las rendijas se mueven a ~5 px/s y **las bandas a ~74**: quince veces más rápido que cualquiera de sus capas. Ése es todo el truco.

### 3.2 · El aliasing, medido y no estimado

Barrido de los **cuatro** recorridos, rayos hasta el borde del cuadro, incluyendo los que pegan de refilón —que es donde el período proyectado se derrumba:

| | píxeles por período de rendija (1920×1080) |
|---|---:|
| mediana del recorrido | 42–50 px |
| **peor caso de los cuatro recorridos** | **29,4 px** (39° de incidencia) |
| Nyquist | 2 px |

**Quince veces de margen.** Encima van mipmaps y anisotropía como seguro para ventanas chicas y DPR alto. Y —lo que más importa— **la parte de la señal que podría aliasear es la trama fina, que es justo la que el mipmap promedia a gris; la que se ve es el batido, once veces más grueso y de baja frecuencia por construcción.**

### 3.3 · Por qué oscuro y por qué poco

Si la pantalla fuera del color del papel, su valor coincidiría con el del ciclorama de atrás y la trama no se vería: dos superficies del mismo material a la misma luz dan el mismo número. Peor: se vería en la mitad de la sala que está a contraluz y desaparecería en la otra, porque el contraste dependería de la luz y no del material.

Con tono oscuro y opacidad 0,32 la trama modula **~15% sobre el fondo en los dos lados**. Es un velo, no una reja.

**`MeshLambertMaterial` y no `Standard`, y es la única excepción de la escena.** Es la superficie que más área de pantalla cubre con mezcla encendida —**42% a 46% del cuadro en promedio, 100% en el pico**— así que su shader se paga sobre casi medio cuadro y encima con blending. Lo que la regla protege se conserva entero: Lambert responde a las mismas tres luces, al mismo hemisférico y a la misma niebla, así que **se apaga con el arco igual**. Lo único que no calcula es el lóbulo especular, que una pantalla mate no tiene.

### 3.4 · Lo que se dejó afuera, dicho en voz alta

El sprint nombra cuatro patrones propios. Entró uno además de las rendijas:

- **Las líneas de circuito NO entran.** Son iconografía de tecnología, y eso está prohibido por la regla 5 del propio sprint. **Que el sprint las nombre no las habilita**, y conviene que quede escrito porque va a volver a aparecer.
- **Las retículas curvas ya están en la escena**: el ciclorama es una y la retícula aérea es otra.
- **Las tramas diagonales** quedan como perilla (`MOIRE_SLAT_SLANT`, hoy 0). Con 1 la rendija se corre un período entero de abajo hacia arriba y el batido pasa a barrer en diagonal. Se deja en cero porque una capa más de dirección, sobre una escena que ya tiene retícula, cotas y planos inclinados, es exactamente lo que satura.

---

## 4 · Los siete arcos de curvatura

**Ninguna pose compuesta por el humano se tocó, y ningún `at` existente se movió.** Está verificado contra una tabla de las 23 poses de S6 congelada dentro del test: nombre, `at` y los cinco canales.

| # | intermedio | tramo | `at` | ease | desvío de la recta |
|---|---|---|---|---|---:|
| 1 | `hero · arco de bajada` | 1 · hero | 0,068 | linear | **2,77** |
| 2 | `quiénes somos · arco de entrada` | 2 | 0,223 | shift | 1,39 |
| 3 | `números · arco de caída` | 3 | 0,414 | shift | 1,08 |
| 4 | `números · deriva en arco` | 4 | 0,531 | linear | 1,24 |
| 5 | `portfolio · arco de aproximación` | 4 | 0,589 | shift | **3,03** |
| 6 | `final · arco de subida` | 6 | 0,809 | shift | 2,01 |
| 7 | `cierre · arco de retirada` | 6 | 0,868 | linear | 2,46 |

*Desvío = distancia máxima entre el camino nuevo y la recta que unía las dos poses, en unidades de mundo. Antes era **cero** en seis de los siete: el camino ERA la recta.*

**Demos: cero.** El giro ya tiene cuatro waypoints y velocidad pareja; el sprint lo excluye y se verificó que su curva de velocidad quedó **idéntica**, punto por punto.

### 4.1 · Tres resultados que no eran el objetivo

1. **La vuelta de 360° sobrevive exacta** en los cuatro recorridos: la tabla desenvuelta sigue terminando en 360.
2. **El tirón más grande de todo el track BAJÓ**, de 75,6 a 49,7 alturas de cuadro por unidad de progreso. El `arrive` del cierre arranca a 1,84× la velocidad de cuerda, así que en `final · gira` la velocidad saltaba de 3,4 a 74,2 de un frame al otro; el arco reparte ese arranque entre dos segmentos. **No se tocó ni el `arrive` ni ninguna pose.**
3. **El segmento más lento del recorrido dejó de serlo.** `números → números · sostén` corría a 4,5 alturas de cuadro por unidad de progreso contra las 12–31 del resto: una pantalla entera de deriva plana. Con el arco su pico pasa a 34.

### 4.2 · Por qué cuatro llevan `shift` y tres `linear`

En este modelo el `ease` pertenece al keyframe de LLEGADA, y `shift` tiene derivada cero en los dos extremos: **la cámara se detiene en cada keyframe con `shift`.** Eso hace que un intermedio adentro de un tramo `shift` sea, necesariamente, un beat.

No es un problema: es lo que el sprint pide. *"Su cámara curva, acelera y **se demora** dentro de cada tramo."* Los cuatro `shift` son arcos **con demora en el apex**; los tres `linear` viven adentro de una gesticulación que no quiere frenarse en el medio (la bajada del hero, la deriva de Números, la retirada al cierre). En los tres casos el `at` está elegido para que las dos mitades corran a velocidad pareja.

---

## 5 · Las tres variantes

**La base calibrada se guarda intacta y es la que se carga por default.** Las tres variantes son propuestas con tesis propia, no ajustes de ella, y **todas sus poses van `derived: true`** — que es el uso literal de esa marca: "esto lo inventó Claude, no lo compuso el humano mirando".

| | poses | distancias | alto del logo en cuadro | desborda | cruces por y=0 |
|---|---:|---|---|---:|---:|
| **base** | 30 | 7 – 16 | 65% – 142% | 21/30 | 4 |
| **íntima** | 24 | **6,4 – 11,5** | **86% – 168%** | 21/24 | 6 |
| **arquitectónica** | 28 | **11,5 – 29** | **37% – 98%** | **0/28** | 4 |
| **dramática** | 28 | 7 – 19,5 | 56% – 142% | 8/28 | **11** |

- **Íntima** — el objeto llena el cuadro y el espacio se intuye entre sus bordes. Las dos personas se resuelven con ÁNGULO y no con encuadre, porque de cerca girar 48° cambia el objeto entero. Números es el único respiro: la única pose donde el logo entra completo.
- **Arquitectónica** — el logo pequeño en un lugar grande. Es la variante que responde a "¿para qué se construyó todo eso si nunca se ve?". La cámara sube, el giro se abre y el cierre se va a 29 con el 39% del alto ocupado.
- **Dramática** — la altura como recurso narrativo: once cruces por el nivel del objeto en ocho pantallas. El hero mira desde ABAJO (altura −3,2) y el cierre es un contrapicado. **Es la única compuesta con el arco del sol a la vista**: baja al piso justo cuando el sol cruza el frente.

### 5.1 · Una restricción de la escena que las variantes destaparon

> **Un plano suspendido no puede quedar entre la cámara y el logo. Los once viven entre radio 11,8 y 22. La base nunca pasa de 16, así que el problema no existía.**

La arquitectónica llega a 29 y ahí sí. La regla que la mantiene sana:

- las poses lejanas viven en **la cuña libre** (±40° del eje frontal, donde no hay ningún plano);
- las que se salen de la cuña se quedan **por debajo de 11,8**, o sea por dentro del anillo entero.

**Ese 11,8 fija el giro de la variante entera**: Demos gira a 11,5 y no a 14 por esta razón y no por gusto. Lo encontró el verificador —la primera versión cruzaba dos planos— y está medido con distancia de segmento a **caja orientada**, no a esfera envolvente: los planos son losas de 0,09 de espesor y su esfera tiene diez veces el volumen de la losa, así que el test grueso daba falsos positivos. Hoy el más cerca pasa a **3,09 de mundo**.

### 5.2 · El panel, y el error que el diseño impide

Cada variante tiene **su propia sesión de edición**: cambiar de recorrido no descarta nada. Es una decisión de seguridad además de comodidad — si cambiar borrara la sesión, cambiar sería una acción destructiva y necesitaría confirmación, o sea un click más entre el humano y la comparación que el panel existe para permitir.

> **Y el exportador recibe la VARIANTE, no solo los keyframes.** Con el nombre de constante fijo, exportar la íntima habría emitido `CHOREO_KEYFRAMES` y pegar ese bloque habría **pisado la única coreografía calibrada a mano que existe**. Ahora cada variante emite su constante y el panel dice en qué archivo va.

---

## 6 · Dos correcciones de método

### 6.1 · La niebla de three es `smoothstep`, no lineal — y se mezcla en sRGB

`fog_fragment.glsl.js` hace `smoothstep(fogNear, fogFar, depth)`, y el `#include <fog_fragment>` va **después** de `<tonemapping_fragment>` y `<colorspace_fragment>`, así que la mezcla ocurre sobre el valor de salida ya convertido. S6 la contó lineal y en espacio lineal:

| distancia | S6 dijo | es |
|---:|---:|---:|
| 23 | 2,3% | **0,2%** |
| 33 | 10,0% | **2,8%** |
| 46 | 20,0% | **10,4%** |
| 84 | 49,2% | **48,8%** |

**Cerca casi no vela; lejos vela casi lo mismo.** El miedo de S6 —que la niebla se comiera la masa oscura que S5 compuso— era **cuatro veces mayor de lo real**: los planos del fondo del hero pasan de 5/255 a 10/255, no a 77/255 como daba la cuenta vieja. **Cambia decisiones futuras sobre el balance de negro: hay más margen del que estaba escrito.**

### 6.2 · La unidad "alturas de cuadro por unidad de progreso" no es comparable uno a uno con la de S6

La definición de S7 es explícita: **la velocidad de la cámara en el mundo dividida por la altura de cuadro a la distancia de órbita de ese instante, promediada sobre el segmento.** Reproduce el número de S6 **exacto** donde la definición no es ambigua (`final · se levanta`: 51,4 contra 51,4) porque ahí la distancia es constante.

**Pero difiere hasta un 25% en los segmentos donde la distancia cambia**, porque S6 usó una sola altura de cuadro por segmento y S7 integra la instantánea. Ninguna combinación de "altura de cuadro representativa" reproduce todos los anclajes de S6 a la vez. Mis números son internamente consistentes y todos los "antes/después" de este reporte están medidos con la misma definición — **no hay que compararlos contra los de S6 fila por fila.**

---

## 7 · Contabilidad

### 7.1 · Draw calls y triángulos

| | S6 | S7 |
|---|---:|---:|
| draw calls (sin el logo) | 12 | **14** |
| triángulos (sin el logo) | 8.454 | **8.648** |

Los dos que suman: el **sprite del sol** (1 draw call, 2 triángulos) y la **pantalla de rendijas** (1 draw call, 192 triángulos).

### 7.2 · Fill — es acá donde está el costo

- **Una superficie transparente nueva**, que cubre **42% a 46% del cuadro en promedio** y hasta el 100% en el pico. Es `MeshLambertMaterial`, o sea tres direccionales + hemisférico + niebla por fragmento, con blending. **Es el gasto real de este sprint y el primer candidato a apagar si mobile no rinde.**
- **El sprite del sol** suma overdraw solo en la ventana en que está en cuadro (4,2% del recorrido).
- **Texturas nuevas**: sol 128² · rendijas 128² con mipmaps · puntos 64² con mipmaps ≈ **170 KB de memoria de GPU**, calculadas una vez al montar.
- **La pasada de shadow map** no cambia de tamaño (1024², téxel 0,0127) pero pasa a recalcularse también en modo editor.
- **Escrituras por frame nuevas**: tres (el `offset` de una textura, la posición del sprite y su opacidad).

### 7.3 · Peso — medido, mismo método que S4, S5 y S6

`next build --webpack` con `E2E_DIST_DIR=.next-probe`, el grupo de chunks leído del `react-loadable-manifest.json` del propio build, cada archivo comprimido a nivel 9.

| chunk | qué es | minificado | sobre la red |
|---|---|---:|---:|
| `bd904a5c` | three (geometrías) | 363,5 KiB | 97,4 KiB |
| `b536a0f1` | three (WebGLRenderer) | 341,2 KiB | 82,9 KiB |
| `b79b7286` | `@react-three/fiber` | 143,0 KiB | 45,2 KiB |
| `7545` | `three-stdlib` / SVGLoader | 21,6 KiB | 7,7 KiB |
| `4857` | resto del grupo del canvas | 13,2 KiB | 5,2 KiB |
| **`5367`** | **el probe, lado canvas: escena, rig, luz, sol y moiré** | **18,2 KiB** | **6,6 KiB** |
| **subtotal — grupo del canvas** | | **900,7 KiB** | **245,0 KiB** |
| *baseline S6, mismos seis archivos* | | *898,0 KiB* | *244,0 KiB* |

### **+2,7 KiB minificados. +0,3%.**

> **Los cinco chunks compartidos salen byte por byte idénticos a los de S4, S5 y S6.** `THREE.Sprite`, `SpriteMaterial`, `CylinderGeometry`, `MeshLambertMaterial` y `DataTexture` **cuestan cero bytes** — ya estaban en el bundle, igual que `Fog`, `Lathe`, `Torus` e `InstancedMesh` en los sprints anteriores. Los +2,7 KiB están todos en el chunk propio: el sol, el moiré, sus dos generadores de trama y el arco.

| | minificado | sobre la red |
|---|---:|---:|
| `app/probe-escena/page` — panel, editor, notas, **las tres variantes** y export | 81,6 KiB | 25,3 KiB |
| *baseline S6* | *52,6 KiB* | *18,6 KiB* |
| **total de la ruta, de punta a punta** | **982,3 KiB** | **270,2 KiB** |

El chunk de la ruta sube 29 KiB y **casi todo es texto**: los tres recorridos completos con sus docs, sus separadores de tramo y sus notas. Es el precio de que las variantes se puedan exportar con su razonamiento intacto, se paga una vez y **no viaja al home**: `/probe-escena` es una ruta interna con `noindex` y sin un solo link entrante.

### 7.4 · Qué apagar primero si mobile no rinde, en orden

1. **La pantalla de rendijas** (`MoireScreen` en `ProbeStage.tsx`). Es lo único que suma una superficie transparente sobre medio cuadro. Sacarla es una línea; bajarle `MOIRE_OPACITY` es medio paso.
2. **`VIRA_UPDATES_SHADOW = false`.** Sigue siendo el más caro que se apaga con un booleano, pero **ya no recupera la pasada entera**: el sol se mueve, así que el mapa se recalcula igual mientras el recorrido avanza.
3. **`SHADOW_RADIUS` 4 → 1.** Vuelve la lectura de sombra a una muestra.
4. **`BOKEH_COUNT` / `BOKEH_SIZE`.** Los 30 sprites grandes siguen siendo el otro overdraw de la escena.
5. **`SUN_SPRITE_RADIUS`.** Solo cuesta en la ventana en que está en cuadro.

**Nada de esto vale para mobile todavía: sigue sin medirse un solo teléfono y sigue sin medirse frame time — necesita navegador.**

---

## 8 · Verificación

```
tsc --noEmit                        → exit 0
eslint src/app/probe-escena         → exit 0
next build --webpack                → exit 0
5 suites de comprobaciones (tsx)    → 97/97 en verde
```

**Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido del sprint.**

> **Las comprobaciones QUEDAN EN EL REPO, y es una corrección a S6.** S6 corrió 37 chequeos estáticos y no los dejó: sus números no se pueden volver a verificar. Los de S7 se corren cuando se quiera:
>
> ```
> npx tsx src/app/probe-escena/__tests__/s7-recorridos.invariant.ts   42 checks
> npx tsx src/app/probe-escena/__tests__/s7-variantes.invariant.ts    21
> npx tsx src/app/probe-escena/__tests__/s7-sol.invariant.ts          15
> npx tsx src/app/probe-escena/__tests__/s7-modelado.invariant.ts      5
> npx tsx src/app/probe-escena/__tests__/s7-moire.invariant.ts        14
> ```

Cubren: que el cuerpo del sol y la key compartan eje (en 101 puntos), la relación `nivel = sin(elevación)`, que la sombra más larga entre en el shadow map, que el sol no se meta abajo del papel ni detrás de la pantalla, γ en las seis ventanas de contenido, la visibilidad contra la key fija, que el halo nunca entre entero, el aliasing del moiré en los cuatro recorridos, la forma de las tres tramas generadas, las 23 poses de S6 congeladas, los siete desvíos de la recta, que Demos quede intacto, los cuatro recorridos contra los rangos de los sliders, el piso con el offset de mouse al máximo, los planos contra caja orientada, las tesis de las tres variantes, las notas huérfanas, y **el round-trip byte a byte del exportador**.

### Cinco afirmaciones mías las tumbó el verificador

No al revés, y conviene listarlas:

1. **La `dramática` metía la cámara 4,6 cm abajo del papel** en `demos · giro ½` con el mouse al máximo. Se corrigió la distancia.
2. **La `arquitectónica` cruzaba dos planos suspendidos.** Ahí salió la restricción del §5.1, que ahora está documentada como propiedad de la escena y no de la variante.
3. **El primer test de planos usaba esfera envolvente y daba falsos positivos.** Hubo que hacerlo contra caja orientada.
4. **Mi doc de la íntima decía "19 de 24 poses desbordan" y son 21**, y decía que la base desbordaba en 9 de 30 cuando son 21 de 30. Los tres docs de variante se corrigieron contra el dato.
5. **El round-trip del export se rompió dos veces** durante el sprint: una por texto que yo había escrito en `choreography.ts` en vez de en la tabla de notas. Es exactamente la trampa que el propio módulo documenta.

### Y un hallazgo heredado que NO se tocó

> Con el offset de mouse en su máximo, la pose `números · baja la altura` deja la cámara **un milímetro de mundo por debajo del papel** (holgura −0,001). Es una pose calibrada por el humano y este sprint no toca poses, así que queda medido y reportado. S6 midió la holgura sobre otra pose —la de Demos, a distancia 7— y por eso no lo vio. Se arregla con un número: subir esa altura a −3,89.

---

## 9 · El límite de 300 líneas

Se partieron cinco archivos, y ninguna partición fue por contar líneas: todas tienen un seam real.

| se partió | en | por qué ese corte |
|---|---|---|
| `choreographyNotes.ts` (514) | `+Frontal` (234) `+Giro` (149), quedó en 180 | la mitad frontal del recorrido contra la mitad que gira |
| los tres `variant*.ts` (319–370) | `+variantNotes.ts` (280) | mismo seam que `choreography.ts` ↔ `choreographyNotes.ts`: datos y comentarios |
| las dos suites de test | cinco suites (122–303) | una por tema |

**Siguen arriba del límite ocho archivos**, y hay que decirlo:

| archivo | líneas | |
|---|---:|---|
| `choreography.ts` | 778 | datos + su razonamiento. Partirlo es partir el recorrido al medio |
| `OrbitRig.tsx` | 583 | un solo `useFrame`. Repartir el cuadro entre archivos lo hace más difícil de razonar |
| `probeScene.ts` | 413 | heredado de S5 |
| `choreographyEditor.ts` | 375 | +59 por las sesiones de variante |
| `s7-sol.invariant.ts` | 355 | ⚠️ |
| `probeStore.ts` | 331 | heredado de S5 |
| `KeyframeEditor.tsx` | 310 | +10 |
| `s7-recorridos.invariant.ts` | 303 | ⚠️ |

Los cuatro primeros heredan el argumento que S6 dejó escrito y el sprint aceptó. **Los dos marcados con ⚠️ son míos y no tienen excusa buena**: son 55 y 3 líneas de más sobre un archivo de test, y se parten en un rato si se quiere.

---

## 10 · Lo que queda

### Para calibrar mirando

1. **Cuál de los cuatro recorridos es EL recorrido.** Es la decisión del sprint que sigue: la base, la íntima, la arquitectónica o la dramática — o una quinta que salga de mirarlas.
2. **El tamaño del sol** (`SUN_SPRITE_RADIUS` 16 y `SUN_CORE` 0,22). El núcleo ocupa el 27% del alto del cuadro; si compite con el logo, bajarlo.
3. **`MOIRE_OPACITY`** (0,32) y **`MOIRE_COLOR`**. La primera perilla si la escena se siente cargada.
4. **`MOIRE_SLAT_SLANT`** (0). Subirlo a 1 pone el batido en diagonal.
5. **La temperatura del cierre**: 7700 K contra los 2000 K de la calibración a mano. Sigue siendo un número, y ahora tiene más sentido preguntarlo: **hay un sol poniéndose en cuadro.**
6. **El cierre de la íntima**, que deja el logo en el 98% del alto: no hay lugar para el wordmark ni el slogan. Es coherente con la tesis y es exactamente donde hay que decidir si la tesis aguanta el contenido real.
7. **`FILL_AZIMUTH_DEG`**, si la convergencia key–fill del final se nota.
8. **`DoubleSide` del ciclorama** → `FrontSide`, pendiente heredado de S4 que sigue sin poder verificarse sin navegador.

### Pendiente con el fix ya escrito, para que nadie lo re-diagnostique

> **`números · baja la altura` mete la cámara 1 mm de mundo por debajo del papel.**
>
> - **Qué pasa.** Su pose es altura −3,90 a distancia 9. El offset de mouse mueve la altura ±`MOUSE_HEIGHT_FACTOR × distancia` = ±0,405 con el multiplicador del panel en su default. Eso deja la cámara en **−4,305** contra un `FLOOR_Y` de **−4,304**: holgura **−0,001**. Con el puntero en el extremo inferior de la ventana, en ese keyframe, la cámara queda abajo de la hoja — donde no hay escena.
> - **Desde cuándo.** Viene de S6, no de S7. S6 midió la holgura sobre otra pose —la de Demos, a distancia 7, donde da +0,044— y concluyó que el margen del recorrido era de ~0,08. La pose de Números tiene más distancia, así que el mouse la mueve más, y es la que manda.
> - **Por qué no lo arreglé.** Es una pose calibrada por el humano y este sprint no toca poses. Queda medido.
> - **EL FIX, para aplicar sin volver a pensarlo.** En `choreography.ts`, keyframe `números · baja la altura`: **`height: -3.9` → `height: -3.89`.** Un centésimo. Deja la holgura en +0,009 y no cambia nada perceptible — es 1 cm sobre una caída de 6,5 unidades. Después correr `npx tsx src/app/probe-escena/__tests__/s7-recorridos.invariant.ts`: la comprobación de la base pasa de "la holgura contra el papel es la que dejó S6" a poder exigir `> 0` como las tres variantes, y **hay que cambiar el check a `lowest > 0` y sacar la rama especial de la base**, o el test seguirá tolerando una holgura negativa que ya no existe.
> - **La alternativa, si se prefiere no tocar la pose:** bajar `FLOOR_Y` un centésimo (`probeScene.ts`) o `MOUSE_HEIGHT_FACTOR` de 0,045 a 0,044 (`choreographyPhysics.ts`). Las dos tienen efectos en más lugares que la primera; la pose es el cambio más chico y más local.

### Lo que este sprint dejó afuera, a propósito

- **El preloader, el efecto Star Wars, el logo por servicio y el menú.** El sprint los excluye: solo se documentan, y quedaron en `DIRECCION-ESCENA.md`.
- **La cola del cierre** y **la conexión al scroll real**: siguen siendo lo que eran.
- **`npm run test:s7`**: los cinco scripts corren con `npx tsx` pero no se agregó un atajo a `package.json`, que está fuera del scope del sprint.

---

## 11 · Archivos

### Nuevos

```
src/app/probe-escena/_components/
  probeSun.ts                 El cuerpo del sol: dónde, cuánto y la forma del disco
  SunBody.tsx                 El sprite. No decide su posición: la escribe el rig
  probeMoire.ts               La pantalla de rendijas y sus dos generadores de trama
  MoireScreen.tsx             El cilindro con las dos tramas en un solo material
  choreographyVariants.ts     El registro de los cuatro recorridos
  variantIntima.ts            Recorrido íntimo
  variantArquitectonica.ts    Recorrido arquitectónico
  variantDramatica.ts         Recorrido dramático
  variantNotes.ts             Los comentarios de las tres variantes, como dato
  VariantPicker.tsx           El selector, con la marca de "sin exportar"
  choreographyNotesFrontal.ts La primera mitad de los comentarios del array
  choreographyNotesGiro.ts    La segunda
src/app/probe-escena/__tests__/
  harness.ts                  La geometría del recorrido, sin three y sin DOM
  s7-recorridos.invariant.ts  Estructura, poses congeladas, los siete arcos, composición
  s7-variantes.invariant.ts   Que las tesis de las tres sigan siendo ciertas
  s7-sol.invariant.ts         Que el sol y la key sean el mismo objeto; arco y sombra
  s7-modelado.invariant.ts    γ en las ventanas de contenido, y la visibilidad
  s7-moire.invariant.ts       Aliasing en los cuatro recorridos, tramas y round-trip
docs/rediseno/
  DIRECCION-ESCENA.md         El documento de decisiones consolidadas
  outputs/S7-ESCENA.md
```

### Modificados

```
src/app/probe-escena/_components/
  choreography.ts          + los siete arcos; `LIGHT_ARC` con la posición del sol
  choreographyTypes.ts     + `azimuthDeg`/`elevationDeg` en `LightStop`; los tipos de variante
  choreographyNotes.ts     − la tabla de notas (se partió); + el doc del array actualizado
  choreographySampler.ts   `sampleLightArc` devuelve además dónde está el sol
  choreographyEditor.ts    Una sesión por variante; `setVariant`, `isDirty`
  choreographyExport.ts    Recibe la VARIANTE: su constante, su doc y sus notas
  lightRig.ts              Un solo eje para la key y el cuerpo; la opacidad del sol
  probeLighting.ts         La posición de la key salió a `LIGHT_ARC`; la nota del fill
  probeAtmosphere.ts       `SHADOW_FAR` 46 → 64; la corrección de la niebla `smoothstep`
  OrbitRig.tsx             + el sol, la deriva del moiré, el shadow map con el sol móvil
  ProbeStage.tsx           + `SunBody` y `MoireScreen`
  ProbeControls.tsx        + el selector de recorrido
  ChoreographyControls.tsx La lectura del keyframe sale del editor, no del módulo
  KeyframeEditor.tsx       Selección derivada, para que cambiar de variante no rompa
  KeyframeExportPanel.tsx  Dice la constante y el archivo de la variante activa
```

### Intocados

El home entero. Los frozen: `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. De `logo-footprint.ts` solo se lee `LOGO_BOX_WORLD`, como siempre.

**El probe sigue importando exactamente tres cosas de afuera de su carpeta** —`MOTION_EASE`, `useReducedMotion` y `LOGO_BOX_WORLD`— y nada del repo lo importa a él, salvo la línea de `publicRoute.ts` que ya venía de antes.
