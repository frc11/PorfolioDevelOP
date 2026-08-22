# S9 — La coreografía definitiva · Escena 3D del home develOP

- **Fecha:** 2026-08-22 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S9-coreografia.md` · **Extiende:** `outputs/S7-ESCENA.md` y `outputs/S8-PRELOADER.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint` exit 0 sobre todo el scope · `next build --webpack` exit 0 · **481 comprobaciones estáticas en verde y 1 en rojo, que es heredada y deliberada** (ver §8).
- **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano por grabación.**

---

## 0 · Qué decidió este sprint

Había cuatro recorridos: la coreografía calibrada a mano y las tres propuestas de S7. El dueño del proyecto miró las cuatro y eligió **un mix de la arquitectónica y la dramática**, con el reparto por eje escrito en el sprint:

- **distancia y encuadre de la arquitectónica** — el espacio es el protagonista, el logo no llena el cuadro salvo en Demos;
- **altura y contraste entre tramos de la dramática** — picados y contrapicados francos;
- **target y composición, compuestos para este recorrido.**

Y con esa elección **se borraron los nueve keyframes derivados**. Quedaron **seis poses, una por tramo, más dos sostenes. Cero relleno.**

El recorrido calibrado **no se perdió**: se mudó entero a `variantCalibrada.ts` y se sigue eligiendo desde el panel. Son 21 poses compuestas a mano en una sesión entera de trabajo humano, y este módulo ya perdió una calibración completa por confiar en el portapapeles.

> **Por qué se mudó en vez de sobrescribirse, y la razón no es sentimental.** Al conservarlo, `s7-recorridos.invariant.ts` sigue verificando **las 23 poses de S6 una por una, `at` incluido**. Eso es una **prueba mecánica de que la calibración a mano sobrevivió al cambio de recorrido** — no una promesa en un reporte. Vale más que los dos archivos que cuesta.

---

## 1 · El recorrido

| `at` | keyframe | `ease` | `turn` | ángulo | altura | distancia | `frameX` |
|---|---|---|---|---:|---:|---:|---:|
| 0,000 | `hero` | — | — | **0** | **6,40** | **19,0** | **0,68** |
| 0,125 | `hero · sostén` | `shift` | — | 0 | 6,40 | 19,0 | 0,68 |
| 0,375 | `quiénes somos` | `shift` | `literal` | **130** | **−3,60** | **11,5** | **−0,80** |
| 0,500 | `números` | `shift` | `literal` | **185** | **9,00** | **18,5** | **−0,45** |
| 0,625 | `trabajos` | `shift` | `literal` | **195** | **4,50** | **20,0** | **−0,85** |
| 0,750 | `demos` | `shift` | `literal` | **310** | **−2,60** | **9,0** | **1,00** |
| 0,950 | `cierre` | `arrive` | `literal` | **360** | **−1,40** | **27,0** | **0,00** |
| 1,000 | `cierre · sostén` | `arrive` | `literal` | 360 | −1,40 | 27,0 | 0,00 |

`frameY` queda en cero en las seis, igual que en todo el recorrido anterior: el canal solo tiene recorrido por encima de una distancia de 11,4 y la composición se resuelve con `frameX` y con la altura de cámara.

### 1.1 · De dónde salió cada valor

| | ángulo | altura | distancia | target |
|---|---|---|---|---|
| **hero** | tabla del sprint | **compuesta** — la tabla pide que el tramo siguiente BAJE, así que el hero está arriba; 6,40 deja los 10,0 de caída sin gastar el techo del rango, que Números necesita entero | **arquitectónica** — su hero está en 20 y da el mismo 57% de caja | **arquitectónica** (0,62), corrido a 0,68 |
| **quiénes somos** | tabla | **dramática**, con el piso recalculado (§4) | **arquitectónica** — 11,5 es *su* número fuera de la cuña, y acá lo impone la geometría de S5 | **dramática/base** |
| **números** | **compuesto** — 185 en vez de 200 (§1.3) | **dramática** — el techo del rango; da el mayor salto de altura entre poses vecinas de las cinco coreografías | **arquitectónica** | **compuesto** |
| **trabajos** | **compuesto** — "casi se detiene" son 10°, no 50 | **compuesto** — nivelar para mirar al fondo | **arquitectónica** | **compuesto** — deja el corredor libre |
| **demos** | tabla | **dramática + el sol** (§5.3) | **compuesto/base** — la única excepción donde el logo llena | **base** |
| **cierre** | tabla | **dramática** — su cierre exacto | **arquitectónica** — el suyo es 29; 27 deja margen de slider | **base/S6** |

### 1.2 · Órbita por tramo

| tramo | azimut | Δ | barrido 3D | intención |
|---|---|---:|---:|---|
| hero | 0 → 0 | 0° | 0,0° | reposo |
| quiénes somos | 0 → 130 | **130°** | **132,6°** | el tramo más amplio |
| números | 130 → 185 | 55° | **68,8°** | órbita corta, vertical fuerte |
| trabajos | 185 → 195 | 10° | 16,3° | casi se detiene |
| demos | 195 → 310 | **115°** | **117,2°** | la zambullida |
| cierre | 310 → 360 | 50° | 50,9° | el retroceso |

Ángulo desenvuelto final: **360 exacto.**

### 1.3 · Los dos ángulos que se movieron de la tabla, y por qué

**Números va a 185 y no a 200, y Trabajos a 195 y no a 250.** No es preferencia: es la única ventana que la escena de S5 deja.

El anillo de once planos suspendidos vive entre radio 11,8 y 22, y **fuera de la cuña frontal de ±40° una cámara más lejos que el plano más cercano siempre tiene un plano entre ella y el logo**. Medida la distancia limpia máxima azimut por azimut, hay exactamente dos sectores donde la cámara puede irse lejos:

- **la cuña frontal (335°–40°)**, donde llega a 30 — ahí viven el hero y el cierre;
- **el sector 180°–210°**, donde el plano grande de azimut 187° a radio 20,5 abre un hueco — ahí viven Números y Trabajos. En 185 el tope limpio es 20,5; en 200 baja a 17,8 y en 210 a 16,0.

Y hay un segundo motivo, que es el que le sirve al sprint siguiente: **el fondo de una pose es su azimut opuesto**. Con la cámara en 185–195 el fondo cae dentro de la cuña libre, o sea que el cuadro se abre hacia el vacío. En 250 el fondo sería el plano oscuro de azimut 60°.

### 1.4 · La regla de los 90°, anulada

El sprint pedía que ningún tramo moviera la cámara menos de 90° de órbita. **Es aritméticamente imposible**: cinco tramos que se mueven × 90° son 450° sobre una vuelta de 360. El dueño del proyecto la retiró en la Parada 1 y **no se verifica en ningún lado ni se publica como propiedad.**

**La alternativa de dos vueltas (720°) se descartó con el número.** Con 720 las poses caerían en azimut 210, 330, 65 y 240 — cuatro sectores donde el anillo de planos le pone techo a la cámara en **13 a 15 de distancia**. O sea que respetar la regla costaría exactamente lo que el mix hereda de la arquitectónica: la distancia.

> **Si algún día se quieren las dos vueltas, la salida es abrirle un hueco al anillo, no acortar la cámara.**

---

## 2 · Los nueve derivados, y la trampa que el sprint avisó

Verificado uno por uno: **ninguno de los nueve derivados del recorrido calibrado sostenía una pose.** Los siete sostenes de ese recorrido están todos con `derived: false`.

| `at` | keyframe | qué era |
|---|---|---|
| 0,068 | `hero · arco de bajada` | arco S7 |
| 0,223 | `quiénes somos · arco de entrada` | arco S7 |
| 0,335 | `persona 2 · cruce (apex)` | sub-movimiento S4 |
| 0,414 | `números · arco de caída` | arco S7 |
| 0,445 | `números · baja la altura` | sub-movimiento S4 (el de −3,90) |
| 0,531 | `números · deriva en arco` | arco S7 |
| 0,589 | `portfolio · arco de aproximación` | arco S7 |
| 0,809 | `final · arco de subida` | arco S7 |
| 0,868 | `cierre · arco de retirada` | arco S7 |

**Pero la trampa existe, y está en las variantes.** La arquitectónica y la dramática —las dos que se mezclaron— llevan **seis sostenes cada una marcados `derived: true`**. Aplicar "borrá todo lo derivado" a la mezcla se los habría llevado.

**Se conservó uno solo, y como keyframe real: `hero · sostén`.** Sin él el primer segmento arrancaría a interpolar hacia los 130° de Quiénes somos y la cámara ya estaría orbitando ~20° durante la pantalla del hero. Los otros no sobreviven porque sus tramos ya no sostienen: el recorrido definitivo es continuo a propósito.

**El cierre ganó un sostén nuevo**, por decisión del dueño del proyecto en la Parada 1: llegada en 0,950 y clavado hasta 1,000. Ahí van "develOP" y el slogan, y el texto sobre una cámara que todavía deriva se lee peor.

**El recorrido definitivo no tiene un solo keyframe `derived`.**

---

## 3 · Velocidad: lo que mejoró, y el riesgo que hay que escribir

En alturas de cuadro por unidad de progreso, con el instrumento del harness (velocidad instantánea, diferencia centrada).

| tramo | calibrada (30 kf) | calibrada SIN los 9 derivados (21 kf) | **definitiva (8 kf)** |
|---|---:|---:|---:|
| hero | 23,7 | 16,5 | **0,0** |
| quiénes somos | 40,5 | 36,8 | 41,6 |
| números | 117,5 | 117,5 | **48,8** |
| trabajos | 83,9 | 77,1 | **10,5** |
| demos | 193,9 | 193,9 | **75,3** |
| cierre | 140,3 | 140,2 | **31,7** |
| **pico global** | **193,8** | **193,8** | **75,3** |
| **mayor tirón entre segmentos** | 70,4 | **73,2** | **31,2** |

**Borrar los nueve derivados sube el tirón de 70,4 a 73,2 (+4%)** — la deriva que S7 había repartido se vuelve a juntar en `final · gira`. Sobre el recorrido definitivo el tirón cae a **31,2**, sin meter un solo intermedio: lo consiguen los `at` en bordes de pantalla y los tramos largos. Ningún tramo quedó con tirón, así que no hizo falta mover ningún `at` ni ningún `ease`.

### 3.1 · ⚠️ El riesgo de percepción, y cuál es la palanca

**La amplitud real SUBE:**

| | calibrada | íntima | arquitectónica | dramática | **definitiva** |
|---|---:|---:|---:|---:|---:|
| mayor salto de altura entre poses vecinas | 7,8 | 5,6 | 5,8 | 11,4 | **12,6** |
| rango de distancias | 9,0 | 5,1 | 17,5 | 12,5 | **18,0** |

y el camino total que recorre la cámara es **el mismo**: 119,3 unidades de mundo contra 119,1 de la calibrada. O sea que **el pico no bajó recortando recorrido**, bajó repartiéndolo: la pantalla más cargada se lleva el 28% del camino contra el 32% de la calibrada.

**Pero lo que se percibe es velocidad instantánea, no amplitud.** Si en la grabación el recorrido se siente más lento que la base:

> **La salida NO es volver a meter tirones. Es reducir pantallas de scroll.** Ésa es la palanca, y hoy son ocho.

Está escrito en el doc de `choreography.ts` y verificado en `s9-composicion.invariant.ts`, para que no haya que redescubrirlo.

---

## 4 · El piso: por qué el −3,89 del sprint no se copió

El sprint traía escrito "la altura mínima del tramo pasa a −3,89". **Ese número es el margen a distancia 9 y en este recorrido no vale.**

El offset de mouse baja la cámara `MOUSE_HEIGHT_FACTOR × distancia`, así que la altura mínima segura **depende de la distancia**:

```
altura mínima = FLOOR_Y + 0,045 × distancia = −4,304 + 0,045 × distancia
```

| distancia | piso efectivo |
|---:|---:|
| 9,0 (la pose baja de la calibrada) | **−3,899** ← de acá salía el −3,89 |
| 11,5 (la pose baja de la definitiva) | **−3,787** |

Copiar el −3,89 a distancia 11,5 habría metido la cámara **10 cm de mundo por debajo del papel**. La pose quedó en **−3,60**, con **0,187 de holgura**.

Y se verificó con inercia, que es lo que el sprint pedía: la altura y la distancia se persiguen con τ distintos (0,24 y 0,26), así que un frame puede combinar una altura ya baja con una distancia todavía alta. Se simuló el sistema amortiguado a diez velocidades de scroll, en los dos sentidos, con el mouse clavado abajo del todo:

| | holgura mínima |
|---|---:|
| por keyframe, sin inercia | 0,1865 |
| simulada con inercia | **0,1881** |
| simulada con el slider de inercia al doble | 0,1984 |

*(La persecución es `1 − e^(−dt/τ)`, una combinación convexa: nunca sobrepasa el objetivo. Lo único que puede empeorar el margen es el desfasaje entre los dos canales, y es lo que la simulación mide.)*

**El hallazgo heredado de la calibrada —−0,001 de holgura en `números · baja la altura`— sigue ahí y sigue reportado**, ahora sobre material de referencia.

---

## 5 · El sol se reapuntó

### 5.1 · Por qué había que tocarlo

Medido: **el recorrido nuevo con el arco viejo pone el contraluz donde no va.**

| ventana | arco de S7 sobre el recorrido nuevo |
|---|---|
| quiénes somos | **γ 156–157°** ← contraluz total en una pantalla que se lee |
| números | γ 109–110° |
| trabajos | **γ 130–133°** ← contraluz |
| demos | γ 71–77° ← **no hay contraluz donde el sprint lo pide** |
| sol en cuadro | ventana p=[0,233 → 0,667], o sea durante Quiénes somos y Números |

### 5.2 · Qué se cambió: solo el azimut, más un stop

**Nivel, kelvin y elevación quedaron exactamente como los dejó S7**, así que `level = sin(elevación)/sin(36°)` sigue valiendo carácter por carácter y el descenso sigue coincidiendo con el arco de luz.

| stop | S7 | **S9** |
|---|---:|---:|
| 0,000 | −42° | **−42°** |
| 0,125 | *(no existía)* | **−42°** ← stop nuevo |
| 0,500 | −32° | **115°** |
| 0,750 | +6° | **132°** |
| 0,875 | +38° | **136°** |
| 1,000 | +50° | **138°** |
| **barrido total** | 92° | **180°** |

**El stop nuevo en 0,125 no es cosmético:** sin él el barrido arranca en p=0 y, para cuando la cámara todavía está clavada en el hero, el sol ya se corrió 50° y queda detrás de la cámara. γ se caía a **17°** — luz plana en la primera pantalla del sitio. Con el stop, el sol se queda quieto mientras el hero se queda quieto.

### 5.3 · Los números

| | valor |
|---|---|
| **γ mínimo de todo el recorrido** | **35,5°** (S7 medía 29° sobre su propio recorrido; la key fija de S6 tenía 4°) |
| entrada · hero | 41° |
| quiénes somos | 83–90° (lateral: lee volumen) |
| números | 60–66° |
| trabajos | 64–66° |
| **demos** | **155–166° — el contraluz que el sprint pide** |
| cierre | 137–140° — contraluz |
| **sol en cuadro** | **33,4% del halo · 32,0% del núcleo**, ventana **p=[0,666 → 1,000]** |
| halo entero en cuadro | **0,0%** — nunca entra completo |

**El sol entra en cuadro al empezar Demos y se pone dentro del encuadre.** Y hay una precisión de composición que sale de medirlo y no de estimarlo:

| p | separación sol↔logo | semiancho del logo | qué se ve |
|---:|---:|---:|---|
| 0,750 | 13,0° | ±20,1° | **el sol está DETRÁS del logo: es un eclipse, con la corona alrededor** |
| 0,875 | 26,0° | ±7,9° | ya se separó, bajando por el costado |
| 1,000 | 23,8° | ±7,2° | puesto en el borde del cuadro, a opacidad 0,34 |

> ⚠️ **Corrección de un número que reporté mal en la Parada 1.** Dije que en el cierre "el núcleo sale del encuadre y solo asoma el halo". Es falso: lo calculé con la diferencia de azimut medida desde el origen y **la cámara está a 27 del origen mientras el sol está a 34**, así que el paralaje importa. El núcleo del sol SÍ queda dentro del cuadro en el cierre, a 23,8° del eje óptico. No le pisa el lugar al wordmark —el logo mide ±7,2° y está centrado— pero es un disco en cuadro, no un resplandor de borde.
>
> **El disco en el cierre queda APROBADO tal cual.** Y quedan anotadas las dos perillas por si al grabarlo pesa demasiado, las mismas que S7 ya había dejado como calibrables:
>
> | perilla | hoy | qué hace |
> |---|---:|---|
> | `SUN_CORE` (`probeSun.ts`) | 0,22 | fracción del sprite que es disco duro. Bajarla achica el núcleo sin tocar el halo |
> | `SUN_SPRITE_RADIUS` (`probeSun.ts`) | 16 | tamaño del sprite entero. Bajarlo achica las dos cosas a la vez |
>
> Ninguna de las dos toca el arco: el sol sigue estando donde está, solo cambia cuánto ocupa.

### 5.4 · Por qué 180° de barrido, cuando S7 lo había acotado a 92°

El límite de S7 tenía una razón concreta: **en su recorrido la cámara vivía en azimut 0 durante más de medio track**, y un sol que barriera de más dejaba tramos con la cara vista a oscuras. Ese recorrido ya no corre.

Con la cámara barriendo 360° y leyendo contenido en seis azimuts repartidos por toda la vuelta, **el ángulo relativo entre el sol y el observador recorre 180° sí o sí**: el contraluz cae en algún lado. Se lo puso donde el sprint lo pide y el precio es que a partir de ahí la escena va cada vez más a contraluz hasta el final. **Eso es exactamente atardecer.**

180° no es una vuelta: es un día, de un horizonte al otro. El check de `s7-sol.invariant.ts` pasó de `sweep <= 115` a `sweep <= 180` con esa justificación escrita al lado.

**El control negativo también cambió de forma, y hay que decirlo.** S7 verificaba que el arco ganara en el γ MÍNIMO contra una key fija. Sobre el recorrido definitivo eso ya no es cierto —una key fija en −42°/36° da un mínimo de 40,8° contra los 35,5° del arco— y forzar la comparación vieja sería mentir con un número. Lo que el arco compra acá es otra cosa: **una key fija dejaría dos de las cinco ventanas de texto fuera de rango** (Quiénes somos a 160° es contraluz puro; Trabajos a 108°) y una tercera rozando el límite (Números, 104°). Eso es lo que se verifica ahora.

### 5.5 · Lo que se frenó: la columna "Sol" describía un día entero

La tabla del sprint pedía el sol **bajo y rasante en el hero**, subiendo hasta Números y poniéndose al cierre. **Este arco es una tarde, con descenso monótono.**

La diferencia no es de gusto. Con `level = sin(elevación)/sin(36°)`, un sol rasante en el hero da **nivel 0,26–0,35**: el home arrancaría más oscuro que su propio cierre (0,34). Se frenó, se reportó con el número en la Parada 1, y el dueño del proyecto lo confirmó.

---

## 6 · El acoplamiento con el preloader

El destino del preloader **no está escrito a mano: sale de proyectar el primer keyframe**. Cambiar el hero lo cambió.

| ventana | definitiva | calibrada | factor |
|---|---|---|---|
| desktop 1440×810 | **451 × 313 px** · centro X 1018 px (70,7%) | 523 × 364 px · 1086 px (75,4%) | **×0,861** |
| desktop 1920×1080 | 601 × 418 px | 698 × 486 px | ×0,861 |
| laptop 1280×800 | 442 × 307 px | 511 × 356 px | ×0,864 |
| **mobile 390×844** | **335 × 233 px** (clamp ×0,734) | 335 × 233 px (clamp ×0,640) | **×1,000** |
| mobile 430×932 | 370 × 257 px (clamp ×0,732) | 370 × 257 px | ×1,000 |

**En mobile no cambia nada**: el clamp de ancho (`DEST_WIDTH_MARGIN` = 0,86) ya recortaba antes y sigue recortando; lo único que cambia es cuánto. No se tocó el preloader, no se inventó ningún clamp nuevo, y `DEST_WIDTH_MARGIN` sigue siendo la única fuente.

**En desktop el logo queda un 14% más chico. Se frenó y se reportó con el número; el dueño del proyecto aprobó los 451 px**: el aire de sala en la primera pantalla es la tesis del mix.

### 6.1 · El 504 es un número histórico y está corregido

El sprint pedía comparar contra "los 504 px actuales". **El repo nunca produjo 504.** `S8-PRELOADER.md` e `introHandoff.ts` publicaban 504 × 351 mientras `scene-framing.invariant.ts` verificaba 523 × 364 — **los tres salieron del mismo commit**, así que los dos documentos quedaron con una medición intermedia.

Corregido en los dos lugares, con la nota de por qué, para que el próximo sprint no arranque del número viejo.

### 6.2 · La perilla de reserva, NO aplicada

La elevación de la pose de entrada pasó de **31,0° a 18,6°**, y eso es lo que el preloader usa para rotar su mesh al aterrizar (`SCENE_ENTRY_VIEW`, que se calcula, no se escribe). El gesto de revelar volumen va a ser menos pronunciado.

> **Subir la altura del hero de 6,40 a ~7,50 lleva la elevación a 23,2° y cuesta 1,1 de caída en el tramo siguiente.** Queda anotada en el keyframe y en `DIRECCION-ESCENA.md` §7.1. **No se aplicó: se juzga por grabación.**

---

## 7 · Lo que Trabajos le deja al efecto Star Wars

**El encuadre quedó preparado y medido. No se construyó nada del efecto.**

Verificado sobre **todo el tramo** (p 0,500 a 0,625), no solo en la pose:

| | valor |
|---|---|
| cono libre alrededor del eje óptico, hacia el fondo | **±29,3° horizontal × ±17,5° vertical — el cuadro entero** |
| profundidad libre sobre el eje | **34 unidades de mundo** (el límite es la pantalla de rendijas en 38, no un plano) |
| oclusión del logo | **0% en todo el tramo** |
| el logo en el cuadro | 55% de la caja · 37% de la tinta, pegado al borde izquierdo (`frameX` −0,85) |

**Ningún plano suspendido entra en ese corredor.** Es el único tramo junto con Números que tiene el cuadro completamente despejado hacia atrás:

| tramo | cono libre en su pose | profundidad |
|---|---:|---:|
| hero | ±10° | 34 |
| quiénes somos | ±0° | 34 |
| números | **±29°** | 34 |
| **trabajos** | **±29°** | **34** |
| demos | ±0° | 34 |
| cierre | ±0° | 20 ← el plano grande de 187°, que es la masa oscura del fondo |

**Y queda el instrumento, no solo el número.** `__tests__/occlusion.ts` exporta `backCone()` y `logoOcclusionAt()`: el sprint del Star Wars puede volver a medir el corredor contra el recorrido que haya en ese momento en vez de copiar un 34 de este reporte.

### 7.1 · Lo que el sprint del Star Wars todavía tiene que decidir

1. **A qué velocidad emergen los proyectos.** El tramo dura 0,125 de progreso (una pantalla) y la cámara se mueve 10° de azimut adentro: es prácticamente un plano fijo, pero *no* es fijo.
2. **Si el corredor alcanza para "uno por uno".** ±29° × ±17,5° con 34 de profundidad es el volumen; cuántos proyectos entran ahí sin pisarse es una decisión de composición que no se puede medir sin el contenido.
3. **Qué pasa con el logo.** Está pegado al borde izquierdo y ocupa el 37% del alto en tinta. Los proyectos vienen por el resto del cuadro; si el efecto necesita el centro, el `frameX` de `trabajos` es la perilla.
4. **La luz.** En Trabajos γ es 64–66°, o sea tres cuartos: los proyectos van a llegar modelados, no en silueta. Si el efecto quiere siluetas contra el fondo, eso es contraluz y en este recorrido el contraluz vive en Demos.

---

## 8 · Verificación

**481 comprobaciones estáticas en verde, 1 en rojo.**

| suite | resultado |
|---|---|
| `s7-recorridos` | 48 en verde — **incluye "las 23 poses de S6 están intactas"**, ahora contra `variantCalibrada.ts` |
| `s7-variantes` | 26 en verde |
| `s7-sol` | 15 en verde |
| `s7-modelado` | 9 en verde — remedido contra el recorrido definitivo |
| `s7-moire` | 14 en verde — **incluye el round-trip byte por byte del exportador** |
| `s9-recorrido` | **15 en verde** (nuevo) |
| `s9-composicion` | **12 en verde** (nuevo) |
| `scene-framing` | 23 en verde |
| `introTimeline` | 99 en verde |
| `introSampling` | 140 en verde, **1 en rojo** |
| `introFlight` | 92 en verde |
| `introSilhouette` | 60 en verde |
| `introShading` | 28 en verde |

**Ninguna propiedad del arreglo `PROPERTIES` cambió**, que era la condición del sprint. Las seis siguen verdes en las once calibraciones.

### 8.1 · El rojo es heredado y deliberado

`introSampling` → *"detecta el cruce estirado"*. **No es de este sprint y no se tocó.** Está en el working tree desde antes de empezar —parte de un trabajo "S8e" sin commitear— y su propio comentario dice que se deja en rojo a propósito: el control cuenta cuadros enteros a 60 fps y su umbral es ruido de fase, no diseño. Se verificó corriendo la batería **antes** de tocar nada.

### 8.2 · Las cifras publicadas que cambiaron, y era esperable

| dónde | antes | ahora |
|---|---|---|
| `scene-framing.invariant.ts` · centro | (1086, 466) | **(1018, 428)** |
| `scene-framing.invariant.ts` · tinta | 524 × 365 px | **451 × 313 px** |
| `scene-framing.invariant.ts` · recorrido activo | `base` | **`definitiva`** |
| `s7-sol.invariant.ts` · barrido | ≤ 115° | **≤ 180°** |
| `s7-modelado` · ventanas protegidas | seis, todas en [24°, 105°] | **cinco en [24°, 105°] + dos de contraluz** |

Y un control negativo que hubo que rehacer: **`scene-framing` §6 medía el error de la aproximación lineal solo en X.** Con la pose de entrada nueva —`frameX` 0,68 en vez de 0,90 y elevación 18,6° en vez de 31,0°— ese error cae de 5 px a **0,9 px** y deja de discriminar. La componente vertical sigue en 22,8 px, así que el control se mide ahora sobre el desplazamiento total: **es el mismo control, medido donde todavía tiene señal.**

---

## 9 · Archivos

### Nuevos

| archivo | líneas | qué es |
|---|---:|---|
| `_components/variantCalibrada.ts` | 91 | Las 30 poses del recorrido calibrado, conservadas |
| `_components/variantCalibradaNotes.ts` | 157 | Su doc y sus separadores; une `NOTES_FRONTAL` + `NOTES_GIRO` |
| `__tests__/s9-recorrido.invariant.ts` | 262 | Forma, tramos, sostenes y piso |
| `__tests__/s9-composicion.invariant.ts` | 234 | Planos, corredor, amplitud y velocidad |
| `__tests__/occlusion.ts` | 115 | `logoOcclusionAt()` y `backCone()` — el instrumento que hereda el Star Wars |
| `docs/rediseno/outputs/S9-COREOGRAFIA.md` | — | este reporte |

### Modificados

| archivo | qué cambió |
|---|---|
| `_components/choreography.ts` | **El recorrido definitivo y el arco reapuntado.** 778 → 462 líneas |
| `_components/choreographyNotes.ts` | Reescrito para los 8 keyframes; el recorrido viejo se llevó los suyos |
| `_components/choreographyNotesFrontal.ts` · `Giro.ts` | Solo el doc: ahora alimentan `variantCalibradaNotes.ts`. **Ni una línea de texto de keyframe se tocó** |
| `_components/choreographyTypes.ts` | `ChoreoVariantId`: cinco recorridos |
| `_components/choreographyVariants.ts` | Registro de cinco · `DEFAULT_VARIANT_ID` = `definitiva` |
| `_components/choreographyEditor.ts` | El fallback de sesión usa `DEFAULT_VARIANT_ID` en vez de `'base'` |
| `_components/choreographyExport.ts` · `ChoreographyControls.tsx` | Solo doc |
| `_components/VariantPicker.tsx` | Grilla de 3 en vez de fila: cinco nombres no entran en una fila. Y el aviso de que la luz NO cambia con el botón |
| `_components/probeLighting.ts` | Solo doc: la tabla de `rim.y` citaba poses que ya no existen |
| `__tests__/s7-recorridos.invariant.ts` | Reapuntado a `variantCalibrada.ts`; el definitivo se salta el chequeo de planos, que ahora cambió de signo |
| `__tests__/s7-modelado.invariant.ts` | Remedido contra el recorrido definitivo |
| `__tests__/s7-sol.invariant.ts` · `s7-variantes` · `s7-moire` | Umbral del barrido, ids nuevos, round-trip |
| `lib/scene-framing.ts` · `.invariant.ts` | Doc + cifras publicadas + el control negativo |
| `home-intro/introHandoff.ts` | El destino ya no es "cuatro números distintos" + la corrección del 504 |
| `docs/rediseno/DIRECCION-ESCENA.md` | §2.2 la tabla de tramos con el recorrido decidido · §2.4 · §2.5 el sol · §6 los archivos · §7.1 cerrada |
| `docs/rediseno/outputs/S8-PRELOADER.md` | Corrección del 504 |

### Intocados

**El home, los archivos frozen, la base de datos y las dependencias.** Cero `any`, cero `setState` por frame. No se montó la escena en el home y no se construyó el efecto Star Wars.

### 9.1 · El límite de 300 líneas

Se partieron dos archivos, y la partición no fue por contar líneas:

| se partió | en | por qué ese corte |
|---|---|---|
| `choreography.ts` (778) | + `variantCalibrada.ts` (91) + `variantCalibradaNotes.ts` (157), quedó en **462** | el recorrido que corre contra el que se conserva |
| las comprobaciones de S9 (567) | `s9-recorrido` (262) + `s9-composicion` (234) + `occlusion.ts` (115) | el dato del recorrido contra cómo se compone en la escena, y la geometría reutilizable aparte |

**Sigue arriba del límite `choreography.ts`, con 462**, y hereda el argumento que S6 y S7 ya aceptaron: es dato más su razonamiento, y partirlo es partir el recorrido al medio. Bajó 316 líneas.

---

## 10 · Lo que queda

### Para calibrar mirando (la lista corta)

1. **La elevación de entrada: 18,6° contra 31,0°.** La perilla está escrita en el keyframe del hero y no se aplicó (§6.2).
2. **Si el recorrido se siente lento**, la palanca son las pantallas de scroll, no los tirones (§3.1).
3. **El sol en el cierre.** Está en cuadro a 23,8° del eje, con el núcleo adentro. **Aprobado así**; si al grabarlo el disco pesa demasiado, las perillas son `SUN_CORE` (0,22) y `SUN_SPRITE_RADIUS` (16), y ninguna de las dos mueve el arco — ver §5.3.
4. **El cierre a contraluz** (γ 137°) contra los 52° de la calibrada. Es otra imagen y es deliberada.
5. **Las tres pasadas del entorno por delante del logo**, que tapan el logo entero por menos de una tercera parte de pantalla cada una. Es lo que el sprint pidió; si se lee como un error y no como un gesto, la perilla es la distancia de `quiénes somos`.
6. **La temperatura del cierre**: 7700 K contra los 2200 que darían un atardecer ámbar. Sigue siendo un número, y ahora hay un sol poniéndose en cuadro que lo hace más pertinente que nunca.

### Lo que este sprint dejó afuera, a propósito

- **El efecto Star Wars.** Solo el encuadre (§7).
- **Montar la escena en el home.** Es el sprint siguiente.
- **Mobile**, el mapeo del scroll real y el encuadre por relación de aspecto: siguen abiertos en `DIRECCION-ESCENA.md` §7.2, §7.5 y §7.6.
- **El arco de luz por variante.** `LIGHT_ARC` es una sola tabla y está compuesta para el recorrido definitivo. Elegir otra variante en el panel la reproduce con esa luz: sirve para comparar movimiento, no iluminación. Está avisado en el panel y en el registro.
