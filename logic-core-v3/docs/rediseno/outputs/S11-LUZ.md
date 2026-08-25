# S11 — El sol se apaga, entra la luz · Escena 3D del home develOP

- **Fecha:** 2026-08-23 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S11-luz.md` · **Extiende:** `outputs/S10-FONDO.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint src/app/probe-escena` exit 0 · `next build --webpack` exit 0 · **236 comprobaciones estáticas, 236 en verde.**
- **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano por grabación.**

---

## 0 · Qué hizo este sprint

Borró el cuerpo del sol —tres archivos— y en su lugar dejó **la dirección**, que ahora proyecta la rendija sobre el papel, sobre las marcas y sobre el logo. No agregó un solo objeto a la escena.

Y encontró, midiendo, que **el problema del piso no era la falta de sombra: era la exposición.** El papel a luz plena da 249,4 sobre 255 y su propia sombra dura da 236,9 — doce puntos y medio es todo el rango que una sombra puede usar mientras el cielo esté abierto. La celosía no tapa solo al sol: **tapa el cielo**, y eso es lo que abre el rango a 29,6 puntos.

**La decisión de fondo, en una línea:** sobre papel blanco no se puede agregar luz, solo sacarla — y para sacar de verdad hay que sacarla de las dos fuentes que están afuera, no de una.

---

## 1 · Qué se borró, archivo por archivo

| se borró | líneas | qué se llevaba |
|---|---:|---|
| `_components/SunBody.tsx` | 95 | el sprite del disco |
| `_components/SunWashout.tsx` | 78 | el sprite aditivo que apagaba la trama |
| `_components/probeSun.ts` | 250 | `SUN_RADIUS`, los dos radios de sprite, `SUN_CORE`, el halo, el color, los dos generadores de máscara, el bloque entero del washout y los dos `renderOrder` |

**El arco no se tocó.** Azimut, elevación, nivel y kelvin son exactamente los de S9, y `nivel = sin(elevación)/sin(36°)` sigue valiendo. Es **el mismo dato con otro consumidor**: antes colocaba un sprite, ahora proyecta.

### 1.1 · Qué pasó con cada comprobación

Ninguna se dejó verde por vacío. Trece chequeos del disco desaparecieron; los que se reemplazaron cambiaron de objeto, no de exigencia.

| suite | qué había | qué quedó |
|---|---|---|
| `s7-sol` §1 (4) | el sprite y la key sobre el mismo eje | **misma garantía, otro consumidor**: `applyLightRig` escribe en el uniform de la celosía el MISMO vector unitario que le escribe a la key — 101 puntos del arco más el toggle de luz solidaria |
| `s7-sol` §4 (3) | dónde vive el cuerpo | **se mudó a `s11-proyeccion`** y pasó a medir que el rayo al sol cruce las dos capas. Con control positivo — ver §3.2, que es donde apareció el hallazgo |
| `s7-modelado` "Visibilidad del sol" (5) | cobertura del disco en cuadro | **borrados.** No se convirtieron en "el disco nunca está en cuadro": eso sería verdadero por vacío |
| `s10-escena` "contra qué se recorta" (3) | fondo detrás del disco y costo del washout | **borrados.** Los reemplazan el rango tonal del piso (§5) y el batido (§4) |
| `s10-escena` (1) | el halo mide más que el cuadro | **reemplazado**: las bandas del piso se alargan con la MISMA razón que la sombra del logo, ×3,6, porque las dos son 1/tan(elevación) |
| `s10-tramas` (1) | gruesa → fina → washout → sol | **actualizado**: gruesa → fina → partículas |
| `s10-fondo` (1) | `SUN_RADIUS < MOIRE_NEAR_RADIUS` | **reemplazado**: la luz llega de AFUERA — el rayo al sol sale cruzando las dos capas |
| `s7-export` (6) | la forma de los dos sprites | **borrados con las funciones que los generaban** |

**Y el chequeo de ausencia lleva control positivo.** `s11-sin-sol.invariant.ts` escanea los 18 componentes buscando `<sprite>` y afirma cero — pero **primero** corre el escáner contra un fixture que sí declara uno y verifica que lo encuentre. Sin eso, el chequeo pasaría con el escáner roto y seguiría pasando el día que alguien vuelva a meter un cuerpo de sol. Es el mismo criterio de `syntheticOccluder()` de S10.

---

## 2 · Analítica o mapa de sombras: las dos medidas, y la que decide

**El mapa de sombras tiene una regresión con número.**

| | hoy | con el piso adentro del mapa |
|---|---:|---:|
| ortho que hace falta | ±6,5 | **±34,0** (la losa entera, peor en p=0) |
| téxel de mundo (1024²) | 0,0127 | **0,0664** — 5,2× más grueso |
| disco PCF (radio 4) | 0,051 | 0,266 |
| **penumbra del logo** | **~1,5%** de su ancho | **~7,8%** |

S6 calibró ese 1,5%. Para conservarlo el mapa tendría que ser **5357²** — en la práctica 8192², 64× la memoria de hoy. Y **una segunda direccional con sombra no lo arregla**: three multiplica la sombra de cada luz sobre *su propio* aporte, así que partir la key en dos le daría al logo media sombra. Encima las dos capas tendrían que pasar a emisoras con `alphaTest` —binario, o sea que pierde el velo de 0,18 igual—, 7.680 triángulos más en la pasada de profundidad, y el PCF difuminaría el 39% del ancho de la propia barra.

**La vía analítica no suma un draw call, ni una pasada, ni una textura, ni una dependencia**, y lleva el moiré por construcción porque evalúa las dos capas: no hay resolución de mapa que lo limite. Lo que sí cuesta es ALU por fragmento (§7) y lo que sí tiene que poner de su bolsillo es el filtrado (§4.4).

**Se eligió la analítica. No por comodidad: (b) tiene una regresión medida y (a) no tiene ninguna.**

---

## 3 · Cómo se engancha, y el hallazgo que destapó un control positivo

### 3.1 · Tres eslabones frágiles, los tres verificados contra el paquete instalado

El gobo se inyecta en `lights_fragment_begin`, **adentro del bloque `#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )`**. Ese bloque existe solo para la luz que proyecta sombra, y en esta escena ésa es la key — o sea el sol. **La celosía modula exactamente la misma luz que tira la sombra del logo**, que es lo correcto: son la misma fuente.

> ⚠️ **El `#include` se resuelve DESPUÉS de `onBeforeCompile`.** En ese momento `shader.fragmentShader` todavía dice `#include <lights_fragment_begin>` y el ancla no existe adentro: buscarla ahí no encontraría nada y **el gobo quedaría en silencio**. Hay que parchear el chunk de `THREE.ShaderChunk` y reemplazar el include entero.

Que la key sea la direccional 0 tampoco se razona: `WebGLLights.setup` ordena el array con `shadowCastingAndTexturingLightsFirst` antes de armar los uniforms. Los tres hechos se comprueban contra three 0.182 en `s11-celosia.invariant.ts`, con un control positivo que verifica que el buscador del ancla sepa decir que NO está.

### 3.2 · ⚠️ LA CRECIENTE DE SOL ABIERTO

Es un elemento de la escena y merece nombre propio, porque no es un artefacto: es lo que la geometría hace y se ve.

> **Una parte de la losa —la opuesta al sol— NO recibe las bandas. Es una creciente de papel a sol abierto, y se cierra sola a medida que atardece.**

**La mecánica, entera.** Las dos capas de la envolvente son **cilindros abiertos arriba**: la fina termina en y = 34 y la gruesa en y = 40. Con el sol a 36° de elevación, la luz que llega a la mitad lejana de la losa **entra por encima de ese borde** y nunca cruza la trama. La sombra que el borde superior de la capa fina tira sobre el piso llega **52,7 unidades de mundo** desde la pared —(34 + 4,304)/tan(36°)— y **la losa mide 68 de diámetro**: lo que queda más allá de esos 52,7 es la creciente.

Y como el largo de esa sombra es 1/tan(elevación), **crece con el atardecer hasta tragarse la losa entera**:

| p | elevación | alcance de la sombra desde la pared | de la losa bajo las DOS capas |
|---:|---:|---:|---:|
| 0 → 0,50 | 36,0° | 52,7 | **82,1%** |
| 0,625 | 31,0° | 63,7 | 94,8% |
| 0,75 | 29,6° | 67,4 | 97,9% |
| 0,875 | 20,7° | 101,3 | **100,0%** |
| 1 | 11,5° | 188,3 | **100,0%** |

**Es la misma cuenta que alarga la sombra del logo (×3,6) y la que estira las celdas proyectadas (×3,6).** Las tres son 1/tan(elevación): la creciente cerrándose es otra cara del mismo reloj.

> ### Y hay que decir cómo apareció: **la encontró un control positivo que FALLÓ, no una revisión.**
>
> La primera versión del chequeo afirmaba *"desde CUALQUIER punto de la losa el rayo cruza las dos capas"*, y era la afirmación que a mí me parecía obvia. **Falló** —en el borde y durante toda la meseta— y el instrumento tenía razón: yo había escrito una propiedad que la geometría no tiene. Sin el control positivo que lo precede (con el sol en el cenit el rayo sale por arriba y no cruza nada) habría sido igual de fácil concluir que el instrumento estaba roto y aflojar el chequeo.
>
> Esto ya pasó en S10, cuando el control positivo de la oclusión destapó un falso negativo de 120 muestras. **Es la segunda vez que un control positivo encuentra algo que la revisión a ojo no iba a encontrar**, y es el argumento más fuerte a favor de la regla 14 del sprint.

La creciente está **adentro de todos los valores medios que este reporte publica** —no es una corrección pendiente— y el chequeo que quedó protege la **dirección**: el alcance no puede achicarse. Si alguien sube un tope de banda o toca el arco, esto lo ve.

---

## 4 · Lo que la celosía dibuja

### 4.1 · El paso proyectado

La celda de la trama fina cae sobre el papel midiendo **2,34 de mundo de ancho** —exactamente su propio paso sobre el cilindro— por un largo que crece con el arco:

| | tangencial | p=0 | p=0,75 | p=1 |
|---|---:|---:|---:|---:|
| celda fina | 2,34 | 3,22 | 4,12 | **11,51** |
| celda gruesa | 5,53 | 7,61 | 9,73 | 27,18 |
| **batido** | **15,3** | 21,0 | 26,9 | 75,1 |

**Las bandas se alargan ×3,6**, que es exactamente el mismo factor con el que S10 midió el crecimiento de la sombra del logo. No es coincidencia: las dos son 1/tan(elevación), así que **crecen juntas o no crece ninguna**. La celda pasa de 1,38:1 a 4,92:1 — de retícula a estría.

### 4.2 · El batido, en píxeles

Mismo método que S10 §3.3, sobre 1920×1080:

| pose | celda fina | batido | bandas a lo ancho del cuadro |
|---|---:|---:|---:|
| hero | 104 px | **587 px** | 3,3 |
| números | 127 px | 803 px | 2,4 |
| trabajos | 88 px | 515 px | 3,7 |
| cierre | 73 px | 418 px | 4,6 |

**Y en puntos sRGB**, que es lo que decide si sobrevive: el batido vale **10,8 puntos en hero**, 7,1 en números, 13,1 en trabajos y 6,5 en el cierre, sobre un piso cuyo carrier va de 20 a 49 puntos.

> **Una honestidad: sobre el piso el batido lo domina la separación de radios, no `MOIRE_MISMATCH`.** La relación de pasos proyectados es (44/50)·(102/38) = **2,362**, y con el desajuste en 0 sigue en 2,316 — lejos de 2 en los dos casos. La perilla igual sirve y lo mueve, pero el que manda es el paralaje de S10.

### 4.3 · El barrido

El patrón está **anclado al azimut del sol**, que barre 180°. Un punto fijo del centro de la losa ve pasar **50,9 celdas finas de fase** entre p=0 y p=1 — o sea **119 unidades de mundo de banda pasándole por encima**; 23,4 celdas a radio 25. El número predicho por los 180° de barrido es 51,0: **el barrido de las bandas ES el barrido del arco**, no una deriva.

Y con la escena quieta el batido igual se mueve: la deriva de la capa gruesa corre una celda cada 18,7 s, y el batido —que es la diferencia de fases— avanza **dos períodos por cada uno de ella**, unas 5,5 veces más rápido. Es el mismo truco que ya usa la pared, ahora también sobre el piso.

### 4.4 · El aliasing, y el filtro que la vía analítica pone de su bolsillo

La envolvente dibujada tiene mipmaps; **el gobo no tiene nada**. Barrido de los cinco recorridos, 23.714 rayos que tocan piso:

| | celdas/px | px por celda | barra (0,29) |
|---|---:|---:|---:|
| mediana | 0,0098 | **102** | 29 px |
| p99 | 0,1149 | 8,7 | 2,5 px |
| **peor rayo** | **0,8182** | **1,2** | **0,35 px** |

El peor caso está **por debajo de Nyquist**, y son 12 rayos de 23.714 — el 0,051%, la lonja rasante de piso contra el horizonte. `fwidth` sobre la fase ensancha el perfil de la barra hasta la huella y, pasada media celda, **lo reemplaza por su propia media**: gris parejo en vez de titileo, que es exactamente lo que hace un mipmap cuando la trama deja de resolverse.

El filtro tiene **control positivo**: con huella cero el perfil es binario (1 adentro, 0 afuera) y con huella de una celda vale exactamente la barra. Sin forzarlo, "el filtro promedia" sería una afirmación sobre algo que casi nunca ocurre.

De paso resuelve solo el corte de `atan`: en la costura la fase salta una vuelta entera, `fwidth` se dispara y ese píxel devuelve la media en vez de un destello.

---

## 5 · El piso: el techo, y lo que lo levanta

### 5.1 · ⚠️ La cifra que ordena todo el sprint

Medido con el instrumento de S10:

| | valor |
|---|---:|
| papel a luz plena | **249,4** |
| papel con la key ENTERA apagada (la sombra del logo) | **236,9** |
| **rango disponible para cualquier sombra proyectada** | **12,5 puntos** |
| `#D7D7D5` (una marca) sobre papel iluminado | 245,7 — **3,7 puntos** |

La key es el 46% de la irradiancia del piso y `NeutralToneMapping` comprime todo lo que pasa de 0,76 lineal. **El piso está sobreexpuesto: no puede sostener ninguna estructura de valor.** El aplastamiento de las marcas no es de la celosía — es del piso, y venía de antes.

Con eso, **la proyección sola no arreglaba nada**: hero 216 → 211, números 222 → 219.

### 5.2 · La celosía tapa el cielo, y eso es la otra mitad

No es un invento: es el resto de la misma física. El reparto sale de lo que cada luz **ya declara ser** en `probeLighting.ts`:

| luz | dónde está | qué le hace la celosía |
|---|---|---|
| **key** | el sol, afuera | **el patrón** — medio grado de fuente contra una celda de 3,5°: sombra dura |
| **relleno** | *"el rebote de la sala"* | nada: está adentro |
| **contraluz** | *"solidario a la cámara"* | nada: está adentro |
| **hemisférico** | *"el cielo del estudio"* | **una constante** — es la fuente más ancha que hay, su sombra a través de una trama fina es su propio promedio |

> ### ⚠️ Es una CONSTANTE, no una oclusión de cielo posición a posición
>
> Ω —la fracción de la irradiancia del hemisferio, pesada por coseno, que la celosía intercepta— sale de **integrar el hemisferio contra la geometría de `probeMoire.ts`**, una vez, al cargar el módulo, ajustada por mínimos cuadrados sobre todo el rango del slider. **No hay ningún 0,4x escrito a mano**: si mañana cambian los radios, las bandas o el desvanecido, Ω se mueve solo.
>
> `cielo(barra) = 1 − Ω · (1 − (1 − cobertura)²)`, con **Ω = 0,4366** → **cielo = 0,6743** en la barra de diseño.
>
> **La simplificación, declarada:** se evalúa en el CENTRO de la losa. Medido punto por punto, Ω va de 0,4366 en el centro a 0,5413 en el borde (radio 32) — **±24%**. Hacerlo por fragmento costaría una integral de hemisferio por píxel; lo que se acepta a cambio es esa variación, y se acepta porque es monótona y suave: no produce ningún borde, solo un degradé que la constante aplana.
>
> **Acuerdo con la integral numérica:** peor error **3,9/1000** en todo el rango del slider, **1,5/1000** en la barra de diseño. Comprobado en `s11-piso.invariant.ts`, con control positivo (en barra 0 las dos funciones dan exactamente 1, así que no se están comparando dos constantes).

Va sobre la **intensidad** del hemisférico y no sobre su color de cielo, y hay motivo: `probeLighting.ts` dice que la diferencia entre el cielo y el rebote del papel "es lo que dibuja la cove". Tocando solo el color, esa diferencia se invierte y la cove se leería al revés.

### 5.3 · El rango del papel, antes y después

| | a luz plena | en sombra | rango |
|---|---:|---:|---:|
| S10 (cielo abierto) | 249,4 | 236,9 | **12,5** |
| **S11** | **248,3** | **218,7** | **29,6** |

**El alto casi no se mueve (−1,1) y la sombra baja 18,2.** Es lo que hace una fotografía, y pasa porque la sombra cruza el codo del tone map mientras el alto se queda arriba.

**Dos consecuencias que no se buscaron:**

1. **La sombra propia del logo gana los mismos 18,2 puntos** — de 12,5 a 29,6 de profundidad, sin tocar el shadow map. Nunca fue un problema de celosía: era el mismo aplastamiento.
2. **Las 48 marcas se despiertan.** `#D7D7D5` está a **5,0 puntos** del papel en la luz y a **30,3 puntos** adentro de una banda — seis veces más separación. **No se agregó contraste: se destapó el que ya estaba.**

### 5.4 · Los seis valores medios del cuadro

| pose | S10 | **S11** | Δ | del cuadro es piso | del piso en sombra | del replanteo en cuadro, en banda |
|---|---:|---:|---:|---:|---:|---:|
| **hero** | 216 | **201** | **−15** | 60% | 67% | **80%** |
| quiénes somos | 172 | 166 | −6 | 0% | — | sin marcas en cuadro |
| **números** | 222 | **213** | **−9** | 73% | 53% | **67%** |
| trabajos | 208 | 185 | −23 | 51% | 66% | **82%** |
| demos | 136 | 129 | −7 | 0% | — | sin marcas en cuadro |
| cierre | 120 | 104 | −16 | 34% | 76% | **68%** |

**Con la proyección sola, hero y Números habrían bajado −5 y −3. El resto lo pone el cielo tapado.**

> **Control del instrumento:** con la celosía en 0, `sampleFrame` sigue devolviendo exactamente los seis de S10. Se comprueba en la misma suite, y sin eso la comparación de arriba no valdría nada.

### 5.4.1 · ⚠️ Los seis valores de la Parada 1 estaban mal, y por qué

**En la Parada 1 publiqué 203 / 170 / 214 / 190 / 130 / 104. Estaban subestimados.** Los definitivos son **201 / 166 / 213 / 185 / 129 / 104**.

**El error:** el prototipo con el que medí resolvía el cruce del rayo contra cada cilindro tomando **una sola raíz de la cuadrática**, la de salida. Eso es correcto para un punto que está ADENTRO del cilindro —desde ahí hay un solo cruce y es el de salida— y **es falso para uno que está afuera**: desde el ciclorama más allá de radio 38, el rayo al sol entra por un lado del cilindro y sale por el otro, o sea que **esa pared está tapada dos veces** y yo la estaba contando una.

El modelo final evalúa las dos raíces. Lo agregué al notar que sin la segunda el ciclorama del lado del sol quedaba iluminado parejo mientras el de enfrente llevaba bandas — una asimetría que la cove no tiene dónde esconder.

**Y la confirmación del diagnóstico está en QUÉ poses se movieron.** Si la causa es el ciclorama, las que más tienen que moverse son las que son 100% ciclorama y 0% piso. Es exactamente lo que pasó:

| pose | del cuadro es ciclorama | Parada 1 | final | Δ |
|---|---:|---:|---:|---:|
| **quiénes somos** | **100%** | 170 | 166 | **−4** |
| **trabajos** | 49% | 190 | 185 | **−5** |
| hero | 40% | 203 | 201 | −2 |
| números | 27% | 214 | 213 | −1 |
| demos | 100% | 130 | 129 | −1 |
| cierre | 66% | 104 | 104 | 0 |

Las dos que más se mueven son las de más ciclorama en cuadro. (Demos es 100% ciclorama y casi no se mueve porque su nivel de luz es 0,84 y su fondo ya está a 136: ahí el tone map no comprime y el aporte de la key es chico.) **El patrón del error coincide con la causa que lo explica**, que es la única forma de saber que la corrección no fue una coincidencia.

**El costo de ALU que estimé en la Parada 1 también estaba a la mitad por lo mismo:** ~100 operaciones por fragmento contra las ~200 reales, porque la segunda raíz duplica los cruces a evaluar. Está corregido en §7.2.

### 5.5 · Lo que se midió y se dejó afuera

- **Grano de papel** de −3% de albedo: **0,7 puntos** en la luz y **6,6** adentro de una banda. Se descarta: es ALU por dos puntos de textura, y es una línea si el humano lo pide después de mirar.
- **Más marcas de replanteo**: no bajan la media — cubren ~2% del piso. Y ya no hacen falta para lo que hacían falta: las 48 que hay se leen seis veces mejor adentro de una banda.
- **Las 48 marcas actuales se conservan enteras.** Ninguna se movió, ninguna cambió de tono.

---

## 6 · Los haces, y una premisa del sprint que la medición corrigió

> ⚠️ **El sprint escribió que sobre papel blanco un haz claro es invisible y que "en Hero, Números y Trabajos el cuadro es claro y un haz claro es invisible". El enunciado es demasiado general y conviene que quede corregido para que nadie lo cite como regla.**

Con el cielo tapado, el fondo aéreo real —el ciclorama con la envolvente encima— baja lo suficiente en **las seis** poses:

| pose | fondo aéreo | margen a 255 | alfa aditivo para 5% de Weber |
|---|---:|---:|---:|
| hero | 208 | 47 | 0,041 |
| quiénes somos | 199 | 56 | 0,039 |
| números | 192 | 63 | 0,038 |
| trabajos | 184 | 71 | 0,036 |
| demos | 136 | 119 | 0,027 |
| cierre | 93 | 162 | 0,018 |

**Lo que sí sigue siendo verdad, y es la frase que corresponde:** sobre el **PISO** —de 248 a 219— no hay margen para agregar luz, y el piso es el 51% al 73% del cuadro en las poses claras. La regla no es "sobre papel blanco", es "sobre el piso".

**Los haces no se construyeron igual, por tres razones que no son estéticas:**
1. Son geometría transparente nueva encima del 51%/57% que las dos capas de la envolvente ya mezclan, justo en las poses más caras.
2. Son aditivos, y S10 midió lo que cuesta lo aditivo acá: el washout llevó el contraste del sol de 109 a 64 puntos. Se comerían los 29,6 que este sprint compró.
3. La regla 6 del sprint prohíbe el efecto Star Wars, y un volumen visible saliendo de una celosía **es** eso.

La tabla queda escrita en `probeCelosia.ts` y comprobada en `s11-sin-sol.invariant.ts` **para que la decisión sea revocable con datos y no haya que volver a medir**.

---

## 7 · Contabilidad

### 7.1 · Draw calls, pasadas y peso

| | S10 | **S11** |
|---|---:|---:|
| draw calls (sin el logo) | 13 | **11** |
| pasadas de render | 1 + sombra | **igual** |
| texturas | 3 | **1** (se van la del sol y la del washout, ~20 KB) |
| triángulos | 13.126 | **13.122** (−4: los dos sprites) |
| dependencias | — | **ninguna nueva** |
| **grupo del canvas, minificado** | **903,2 KiB** | **903,2 KiB** |
| **sobre la red** | **246,2 KiB** | **246,2 KiB** |

**El peso no se movió de forma medible**, y no es que no se haya recompilado: los chunks nuevos contienen `celosiaGobo` y ya no contienen `createSunSpriteData`. Lo que entró —tres módulos de celosía, casi todo comentario— pesa lo que salió: dos componentes de sprite y sus dos generadores de máscara.

### 7.2 · Lo que sí cuesta: ALU por fragmento

El gobo corre sobre todo lo que recibe la key —la losa, el ciclorama, las 48 marcas y el logo, o sea el cuadro opaco entero—: **dos cuadráticas con `sqrt`, cuatro cruces (dos raíces por capa), cuatro `atan`, ocho barras filtradas con su `fwidth` y cuatro envolventes**. Del orden de **200 operaciones por fragmento**.

> ⚠️ **En la Parada 1 estimé ~100 y es la mitad de lo real.** La diferencia es la segunda raíz por capa, que en ese momento todavía no estaba en el diseño — la agregué al descubrir que sin ella el ciclorama del lado del sol quedaba parejo mientras el de enfrente llevaba bandas. Sobre 2.880×1.620 (1920×1080 CSS a dpr 1,5) son ~950 MFLOP por cuadro, ~57 GFLOP/s a 60 fps, no ~28.

**Qué se apaga primero si mobile no rinde**, en orden — todas constantes:

1. **Un solo cruce por capa** (la salida). Mitad del costo del gobo; se pierde la sombra doble sobre el ciclorama lejano, que es lo que menos se ve.
2. **Una sola capa.** Otra mitad: quedan las bandas, se va el batido.
3. **El filtro por derivada** → ancho de borde fijo. Titilaría el 0,051% de los rayos rasantes.
4. **El gobo entero.** **El factor de cielo se queda** —es una constante y no cuesta nada—, así que la exposición de la escena no pega un salto.
5. Después, la escalera de S10 intacta: la capa gruesa de la envolvente, `BOKEH_COUNT`, el slider de partículas, `SHADOW_RADIUS`.

**Nada de esto se midió en un teléfono ni en frame time.** Mismo aviso que S10.

---

## 8 · Lo que este sprint invalida de S10

| cifra de S10 | qué le pasa |
|---|---|
| **el valor medio del cuadro en las seis poses** (216/172/222/208/136/120) | **reemplazado** por 201/166/213/185/129/104. §5.4 |
| **el rango tonal del papel** (implícito: 249 a luz plena) | el papel a luz plena baja a 248,3 y su sombra a 218,7. §5.3 |
| **"el disco visible pasa de 13–36% a 28–71%"** y **"109 y 157 puntos de contraste"** | **sin objeto**: no hay disco. El diagnóstico que las mata es que el problema del sol nunca fue el contraste — S10 lo llevó de 41 a 157 puntos y el veredicto humano siguió siendo el mismo |
| **el costo del washout** (109 → 64 puntos) | **sin objeto.** Sobrevive como argumento: es la medición que sostiene la decisión de no poner haces aditivos |
| **la cadena de dibujo** (gruesa → fina → washout → sol → partículas) | **gruesa → fina → partículas** |
| **§7.4, la escalera de mobile** | sigue valiendo, con cuatro escalones nuevos antes. §7.2 |

Y una de S9 que este sprint vuelve a tocar sin cambiarla: **el barrido de 180° del azimut** ahora tiene un segundo significado medido — es cuánto rota la proyección sobre el piso, 51 celdas de fase sobre un punto fijo.

---

## 9 · Verificación

```
tsc --noEmit                          → exit 0
eslint src/app/probe-escena           → exit 0
next build --webpack                  → exit 0   (con NODE_OPTIONS=--max-old-space-size=8192)
17 suites de comprobaciones (tsx)     → 236/236 en verde
```

| suite | S10 | **S11** |
|---|---:|---|
| `s7-recorridos` | 44 | 44 |
| `s7-variantes` | 26 | 26 |
| `s7-sol` | 15 | **13** — la sección del cuerpo cambió de objeto, la del alcance se mudó |
| `s7-modelado` | 9 | **4** — se fueron los cinco de visibilidad del disco |
| `s7-export` | 11 | **5** — se fueron los seis de los sprites del sol |
| `s9-recorrido` · `s9-composicion` | 15 · 14 | 15 · 14 |
| `s10-fondo` · `s10-batido` · `s10-tramas` | 13 · 11 · 17 | 13 · 11 · 17 |
| `s10-escena` | 11 | **8** |
| `s10-particulas` | 11 | 11 |
| **`s11-celosia`** | — | **17** (nuevo) — la trama consumida y el enganche contra three |
| **`s11-proyeccion`** | — | **12** (nuevo) — alcance, paso, batido, barrido, estiramiento |
| **`s11-pantalla`** | — | **7** (nuevo) — el batido en píxeles y el aliasing con su filtro |
| **`s11-piso`** | — | **13** (nuevo) — el techo, el cielo y los seis valores medios |
| **`s11-sin-sol`** | — | **6** (nuevo) — el disco que se fue y los haces que no se pusieron |
| **total del módulo** | **197** | **236** |

### 9.1 · Los cuatro controles positivos

Ningún chequeo de ausencia quedó verde por vacío:

1. **El escáner de sprites** encuentra un cuerpo de sol puesto a mano antes de afirmar que no hay ninguno.
2. **El buscador del ancla** de three dice que NO está contra un fuente que no la tiene, antes de afirmar que está exactamente una vez.
3. **El instrumento de cruces** dice que NO cruza con el sol en el cenit, antes de afirmar que cruza las dos capas. **Éste es el que falló y destapó el alcance** — ver §3.2.
4. **El filtro de la barra** se fuerza a los dos extremos: binario con huella cero, exactamente la media con huella de una celda.

Y dos controles de instrumento más: el factor de cielo vale exactamente 1 con la barra en 0 (así que no se están comparando dos constantes), y `sampleFrame` sin celosía sigue devolviendo los seis valores de S10.

### 9.2 · El gate del intro — nada se movió

El factor de cielo cambia la exposición de la escena entera, así que se corrieron las seis suites del intro **antes y después**:

| suite | antes | después |
|---|---|---|
| `introFlight` | 92 / 0 | **92 / 0** |
| `introSampling` | 140 / **1** | **140 / 1** |
| `introShading` | 28 / 0 | **28 / 0** |
| `introSilhouette` | 60 / 0 | **60 / 0** |
| `introTimeline` | 99 / 0 | **99 / 0** |
| `scene-framing` | 23 / 0 | **23 / 0** |

**Idénticas**, incluido el único rojo, que es heredado y deliberado (está en el working tree desde antes de empezar, es parte de un trabajo sin commitear en `home-intro/` que la instrucción prohíbe tocar, y su propio comentario dice que se deja en rojo a propósito). `git status` sobre `home-intro/` sigue mostrando exactamente los tres archivos que ya estaban modificados.

**Y hay una razón estructural, no suerte:** `home-intro/` tiene su **propio** rig (`IntroSceneLights.tsx` + `introShading.ts`), que lee `KEY_INTENSITY`, `FILL_INTENSITY` y `HEMI_INTENSITY` directo de `probeLighting.ts` y **nunca llama a `applyLightRig`**. El factor de cielo se aplica dentro de `applyLightRig`, así que el intro no lo ve. Si en cambio se hubiera bajado `HEMI_INTENSITY`, `introShading.invariant.ts` habría fallado en el acto — ese chequeo compara `lit.hemiIntensity === HEMI_INTENSITY`.

### 9.3 · ⚠️ EL ESCALÓN DE EXPOSICIÓN — requisito del sprint de las partículas del preloader

Este sprint dejó la escena del probe y la del preloader con **ambientes distintos**, y hay que decirlo con el número porque **no es una nota suelta: es un requisito de entrada del próximo sprint que toque `home-intro/`.**

**El número.** `introShading.ts` hace `hemiIntensity: HEMI_INTENSITY * t` con `t = reveal`, así que **al terminar el intro el ambiente vale `HEMI_INTENSITY` exacto** — está comprobado en `introShading.invariant.ts`, que compara por identidad. La escena arranca en `HEMI_INTENSITY × 0,6743`.

> **El ambiente de la sala cae un 32,6% en el instante del traspaso, en un corte.**

Lo que ese salto hace, medido sobre las mismas superficies:

| | intro (cielo abierto) | escena (cielo tapado) | salto |
|---|---:|---:|---:|
| ambiente de la sala | `HEMI_INTENSITY` | ×0,6743 | **−32,6%** |
| papel del piso, iluminado | 249,4 | 248,3 | −1,1 |
| **papel del piso, en sombra** | **236,9** | **218,7** | **−18,2** |
| **valor medio del cuadro en la pose del hero** | **216** | **201** | **−15** |

**Por qué el intro no se movió ni un punto igual:** `home-intro/` tiene su propio rig (`IntroSceneLights.tsx` + `introShading.ts`), lee las tres intensidades directo de `probeLighting.ts` y **nunca llama a `applyLightRig`**, que es donde vive el factor de cielo. Por eso las seis suites dan idéntico. **No es que el problema no exista: es que todavía no se toca.**

**El requisito, escrito:** el sprint de las partículas del preloader **tiene que resolverlo o declararlo**. Resolverlo es hacer que el intro termine en el mismo ambiente en que la escena empieza —una constante compartida, no dos—; declararlo es medir que el corte no se ve y decir por qué. Lo que no puede es ignorarlo: el traspaso es el único frame del sitio donde las dos escenas se tocan, y hoy tienen 32,6% de ambiente de diferencia.

Queda anotado también en `DIRECCION-ESCENA.md` §7.11.

---

## 10 · Archivos

### Nuevos

| archivo | líneas | qué es |
|---|---:|---|
| `_components/probeCelosia.ts` | 183 | Los números y el argumento: qué luces tapa la celosía y cuáles no, la barra, Ω y el factor de cielo |
| `_components/celosiaGeometry.ts` | 280 | La geometría de la proyección — el gemelo en TypeScript del shader, y el instrumento con el que se mide |
| `_components/celosiaShader.ts` | 246 | El GLSL, el parche del chunk de three y los uniforms compartidos |
| `__tests__/s11-celosia.invariant.ts` | 221 | La trama consumida y el enganche contra three |
| `__tests__/s11-proyeccion.invariant.ts` | 247 | Alcance, paso, batido, barrido, estiramiento |
| `__tests__/s11-pantalla.invariant.ts` | 241 | El batido en píxeles y el aliasing con su filtro |
| `__tests__/s11-piso.invariant.ts` | 286 | El techo, el factor de cielo y los seis valores medios |
| `__tests__/s11-sin-sol.invariant.ts` | 118 | Lo que este sprint decidió no tener, con sus controles positivos |
| `docs/rediseno/outputs/S11-LUZ.md` | — | este reporte |

### Borrados

`_components/SunBody.tsx` · `_components/SunWashout.tsx` · `_components/probeSun.ts`

### Modificados

| archivo | qué cambió |
|---|---|
| `_components/lightRig.ts` | Se van los targets del cuerpo y del washout; entra el uniform de la celosía sobre el MISMO eje, y el factor de cielo sobre el hemisférico |
| `_components/OrbitRig.tsx` | Sin los dos refs de sprite; escribe la deriva UNA vez para la textura y para la sombra, y vuelca el desajuste a los uniforms cuando cambia |
| `_components/ProbeStage.tsx` | Sin `<SunBody>` ni `<SunWashout>`; crea los uniforms compartidos y se los pasa a los cuatro receptores |
| `_components/StudioFloor.tsx` | La losa y el ciclorama arman su material para poder recibir la celosía. **Las dos**, porque con el gobo solo en la losa las bandas terminarían en una circunferencia justo donde S4 puso la cove para que no hubiera línea |
| `_components/ProbeLogo.tsx` | Un material para todas las piezas del path, en vez de uno por malla, para poder pasarle la celosía |
| `_components/InstancedBars.tsx` | Prop opcional `celosia`: una marca iluminada pareja cruzando una banda se leería como una línea encendida |
| `_components/probeMoire.ts` | Solo notas: el `renderOrder` perdió dos eslabones y los topes de banda ahora también fijan el alcance. **Ningún número de la trama se tocó** |
| `_components/probeStore.ts` · `ProbeControls.tsx` | La perilla `celosiaBar`, 0…0,50, default 0,29 |
| `__tests__/shading.ts` | `shadeSurface` acepta gobo y cielo, los dos con default 1 — o sea que sigue siendo la de S10 |
| `__tests__/frameProbe.ts` | `sampleFrame` acepta la celosía y publica la fracción del piso en sombra |
| `__tests__/s7-sol` · `s7-modelado` · `s7-export` · `s10-fondo` · `s10-tramas` · `s10-escena` | Ver §1.1 |

### Intocados

**El home, `home-intro/` entero, los archivos frozen, la coreografía, el arco del sol, las tramas de la rendija, la base de datos y las dependencias.** Cero `any`, cero `setState` por frame, cero lens flare, cero bloom, cero color. Las 48 marcas de replanteo quedaron enteras.

### 10.1 · El límite de 300 líneas

Las cuatro suites de S11 nacieron partidas por tema —enganche · qué dibuja · cómo cae en pantalla · qué le hace al cuadro— y los tres módulos nuevos también: los números (`probeCelosia`), la geometría (`celosiaGeometry`) y el GLSL (`celosiaShader`), mismo seam que `probeMoire.ts` ↔ `moireTextures.ts`.

Cuatro archivos existentes cruzaron el límite durante el sprint y **se los devolvió abajo**: `probeMoire.ts` (298 → 300), `ProbeStage.tsx` (299 → 297), `frameProbe.ts` (253 → 294, sacándole `sunDirectionAt`, que es del arco y no del muestreo) y `s7-sol.invariant.ts` (258 → 233, mudando la sección del alcance a `s11-proyeccion`).

**Siguen arriba del límite siete, y hay que decir de quién es cada exceso:**

| archivo | líneas | |
|---|---:|---|
| `choreography.ts` | 462 | heredado |
| `choreographyEditor.ts` | 376 | heredado |
| `probeScene.ts` | 348 | heredado |
| `KeyframeEditor.tsx` | 310 | heredado |
| `probeStore.ts` | 378 | heredado (352) — **S11 le sumó 26**: la perilla y su porqué |
| `lightRig.ts` | 345 | heredado (319, ya cruzado por S10) — **S11 le sumó 26**: el uniform, el factor de cielo y sus notas. Partirlo sería cortar el frame al medio |
| `OrbitRig.tsx` | 647 | heredado (626) — **S11 le sumó 21**: la deriva compartida y el volcado del desajuste. Un solo `useFrame`; repartirlo entre archivos lo hace más difícil de razonar |

> ⚠️ **Los tres últimos crecieron con este sprint y los tres están arriba del límite. Quedan anotados como DEUDA, no arreglados acá** — partirlos de a uno, en el sprint que los agrandó, es la peor forma de hacerlo: `lightRig` y `OrbitRig` son las dos mitades del mismo frame y `probeStore` es el contrato entre el panel y el loop. **Van juntos a un sprint de limpieza**, con el número, en `DIRECCION-ESCENA.md` §7.13.

---

## 11 · Lo que queda

### Para calibrar mirando

1. **La barra de la celosía** (0,29). Es la primera perilla y la que más mueve el cuadro: contraste de las bandas, amplitud del batido y —a través del cielo— la exposición de la sala. 0,35 baja tres puntos más la media a costa de aflojar el batido; **0 apaga la celosía y devuelve el piso de S10**, que es el control.
2. **El desajuste** (2). Sobre la pared sigue mandando; sobre el piso mueve el batido de 17,5 a 9,3 de mundo, pero el que domina es el paralaje.
3. Todo lo que S10 dejó abierto y este sprint no tocó: `MOIRE_OPACITY`, `MOIRE_BASE_ALPHA`, el conteo de partículas, la deriva.
4. Todo lo que S9 dejó abierto: la elevación de entrada, la temperatura del cierre.

### Lo que este sprint dejó afuera, a propósito

- **El grano de papel.** Medido (0,7 / 6,6 puntos) y descartado por costo.
- **Los haces visibles.** Medidos y descartados por tres razones; la tabla queda para revocarlo.
- **El escalón de exposición contra el preloader** (−32,6% de ambiente): consecuencia del factor de cielo, vive en `home-intro/` y estaba prohibido tocarlo. **Pasa a ser requisito del sprint de las partículas del preloader** — §9.3.
- **Montar la escena en el home**, el scroll real, mobile y el encuadre por relación de aspecto.
- **La variación de Ω sobre la losa** (±24%): se aplana con una constante, declarado en §5.2. Hacerlo por fragmento es un sprint propio y probablemente no valga la pena.
