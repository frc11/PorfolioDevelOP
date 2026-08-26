# S8E-RITMO — Cerrar el ritmo del preloader

- **Fecha:** 2026-08-24 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S8e-ritmo.md`
- **Qué cierra:** el trabajo sin commitear de S8e, que estaba aprobado **con tres condiciones que nunca se aplicaron**. Este sprint las aplica y nada más.

> **Este sprint mueve números y arregla un instrumento de medición. No cambia
> ningún mecanismo.** Los seis predicados del arreglo `PROPERTIES` de
> `introTimeline.invariant.ts` quedaron **byte por byte idénticos** a lo que el
> repo ya tenía commiteado.

---

## 0 · Las tres condiciones, en una línea cada una

| # | Condición | Estado |
|---|---|---|
| 1 | `placeS` sube de 0,78 a **2,4** | Aplicada. Total **7,35 s** |
| 2 | El check en rojo se arregla **midiendo por interpolación**, con control positivo | Aplicada. `introSampling` **166 en verde, 0 en rojo** |
| 3 | El `.md` del sprint | Este archivo + `sprints/S8e-ritmo.md` |

**Y tres hallazgos que solo aparecieron al medir bien**, ninguno de los cuales
rompe nada y los tres anotados:

| | |
|---|---|
| **§2.1** | **El sprint NO acorta respecto del original.** 7,35 s queda 0,08 s por encima del clásico; los 0,80 s se acortan contra S8d |
| **§4.5** | **El check que estuvo rojo tres sprints custodiaba una propiedad inalcanzable.** Con `colorS` 1,4 s ningún ancho de `INK_FLIP_FRAC` llega al tope |
| **§5** | **DERIVA DE S8D:** el cruce de contraste quedó **22% más largo** que el que S8d aprobó, y nadie lo sabía |

Más una cuarta cifra que se movió afuera de este sprint: **§3.2**, los 371 px y
los 23,5°/s de S8d son de antes de S9.

---

## 1 · La tabla completa de perillas

### 1.1 · Adoptadas del clásico

| perilla | valor | del clásico |
|---|---:|---|
| `strokeS` | **0,85 s** | `HOME_STROKE_SECONDS` |
| `fillS` | **0,45 s** | `HOME_FILL_SECONDS` |
| `colorS` | **1,40 s** | `VEIL_FADE_SECONDS` |

### 1.2 · Descartadas, con su razón

| perilla | valor | el clásico decía | por qué no |
|---|---:|---:|---|
| `holdS` | **0,95 s** | `READ_HOLD_MS` 1,50 s | Era tiempo **literalmente** muerto: `await wait(READ_HOLD_MS)` sin un solo canal animándose. Se preservó **la lectura, no el número** — ver §2.2 |
| `placeS` | **2,40 s** | `COMPRESS_SECONDS` 0,78 s | 🔴 **La condición 1 de este sprint.** Allá era un deslizamiento corto sobre una pantalla que ya tenía el contenido detrás; acá es un viaje con giro que **entrega la escena 3D**. Ver §3 |
| `letterOutS` | **0,60 s** (`MOTION_DURATION.elemento`) | `ERASE_MS` 1,50 s | Es el espejo de `WRITE_MS`, y esa entrada no entra en un trazo de 0,85 s. Copiar solo la salida rompería la simetría, y metería un número suelto donde la comprobación exige el token del sistema |
| `LINE_IN_DURATION_FRAC` → 0,60 s | fracción | `WRITE_MS` 1,50 s | Allá la escritura corría **en paralelo** al trazo, al relleno y al crossfade (1,7 s de ventana). Acá las letras viven **adentro** del trazo: el techo es `0,85 × (1 − LINE_SETTLE_MARGIN_FRAC) = 0,765 s`, la mitad |
| `SWAP_FRAC` 0,18 → 0,252 s | fracción | `HOME_CROSSFADE_SECONDS` 0,40 s | Allá el relevo era un paso suelto y podía durar lo que quisiera; acá tiene que **esconderse adentro** de la inversión de la tinta, que dura 0,306 s. 0,4 s no entra en 0,306 s |

### 1.3 · Sin equivalente en ninguna dirección

| acá | allá | por qué no hay par |
|---|---|---|
| `veilOutS` **0,70 s** | — | El clásico no disuelve el fondo al final: ya era blanco desde el primer paso, y lo único que quedaba era esperar 240 ms a que entrara el contenido |
| `INK_FLIP_FRAC` **0,2186** | — | Allá **no hay inversión de tinta**: el logo se dibujaba NEGRO sobre un fondo que ya estaba yendo a blanco |
| — | `STEP_DELAY_SECONDS` 0,15 s | Es el respiro entre dos pasos de una secuencia hecha de `await`s; acá la secuencia es un solo progreso continuo |
| — | `HOME_DOTS_REVEAL_SECONDS` 0,55 s | No hay `DotMatrix` en este preloader |
| — | `HOME_CANVAS_FADEIN_SECONDS` 0,40 s | El canvas no entra con un fundido propio: aparece detrás cuando el velo se va |
| — | `LOGO_READY_TIMEOUT_MS` 2500 ms | **El preloader nuevo nunca espera a la escena.** No hay `await`, no hay readiness gate (decisión de S8) |
| — | `TEXT_LEAD_MS` 0 ms | Se reproduce sin perilla: con 0,6 s de entrada sobre 0,85 s de trazo, la primera línea arranca en 0,105 s — o sea prácticamente junto con el trazo |

---

## 2 · La línea de tiempo resuelta, con `placeS` = 2,4

```
0,000 ──────────────────────────────── arranca el trazo (blanco sobre oscuro)
0,105  entra "develOP"                       (0,600 s)
0,165  entra el slogan                       (0,600 s)
0,765  las letras quedan quietas             (0,085 s antes del cierre)
0,850 ──────────────────────────────── cierra el trazo
1,300 ──────────────────────────────── relleno completo
      ░░ la espera — 0,950 s ░░
2,250 ──────────────────────────────── arranca la TRANSFORMACIÓN DE COLOR
2,797    la tinta empieza a invertir         (0,306 s · 21,9% central)
2,824    ▸ RELEVO 2D→3D                      (0,252 s · 18% central)
3,076    ◂
3,103    la tinta terminó de invertir
3,650 ──────────────────────────────── se va la letra
4,250 ──────────────────────────────── y recién ahí, se va el fondo
4,950 ──────────────────────────────── arranca el ACOMODAMIENTO
7,350 ──────────────────────────────── el logo está en su lugar
```

### 2.1 · El total nuevo, sin maquillar

| | total | contra 7,35 s |
|---|---:|---|
| **S8e cerrado (este sprint)** | **7,35 s** | — |
| clásico (`Preloader.tsx` de `main`, camino home desktop) | 7,27 s | **+0,08 s** |
| S8d | 8,15 s | **−0,80 s** |
| S8e con `placeS` 0,78 (rechazado) | 5,73 s | +1,62 s |

> ### 🔴 Este sprint NO acorta respecto del original.
>
> **7,35 s queda 0,08 s POR ENCIMA del clásico.** Lo único que acorta son los
> **0,80 s contra S8d**. Era un sprint de **ritmo**, no de recorte, y el número
> final lo dice: adoptar los tiempos del clásico no dio una secuencia más corta
> que la del clásico.

**Y el recorte contra el original lo compró `holdS`, no `placeS`.** El libro mayor,
perilla por perilla, contra los 7,27 s del clásico:

| | contra el clásico |
|---|---:|
| `strokeS` 0,85 ← 0,85 · `fillS` 0,45 ← 0,45 · `colorS` 1,40 ← 1,40 | 0,00 |
| **`holdS` 0,95 ← `READ_HOLD_MS` 1,50** — la ÚNICA perilla que compra reloj | **−0,55** |
| **`placeS` 2,40 ← `COMPRESS_SECONDS` 0,78** — el que lo gasta | **+1,62** |
| lo que el clásico gasta y acá no existe: `STEP_DELAY` 0,15 + `HOME_CROSSFADE` 0,40 + `ERASE_MS` 1,50 + la espera final 0,24 | −2,29 |
| lo que acá existe y allá no: `letterOutS` 0,60 + `veilOutS` 0,70 | +1,30 |
| | **+0,08** |

O sea: de las siete perillas, **una sola acorta** —la espera, y solo 0,55 s— y el
resto del balance es estructura, no calibración. Los 2,29 s que el clásico gasta
en pasos que acá no existen se los come casi enteros el acomodamiento nuevo.

**Contra S8d el libro mayor es otro**, y conviene tenerlo al lado para no
confundirlos: `placeS` −1,20 y `strokeS` −0,55, contra `colorS` +0,50, `holdS`
**+0,35** y `fillS` +0,10. Ahí la espera **suma** tiempo en vez de recortarlo, y
los 0,80 s los compran el acomodamiento y el trazo.

### 2.2 · La espera: se preservó la lectura, no el número

En el clásico el lockup queda terminado en pantalla **1,70 s** (la escritura
cerraba en 3,05 s, el borrado arrancaba en 4,75 s). Acá las letras asientan en
0,765 s y el color arranca en 2,250 s: **1,485 s de lockup terminado y quieto**,
casi lo mismo, con 0,55 s menos de reloj.

---

## 3 · 🔴 `placeS` es la única perilla del sprint que se decide MIRANDO

Las otras seis salen del clásico o de una propiedad. Ésta no tiene respuesta
correcta en un archivo, y está anotada como tal **en el código** (docblock de
`placeS` en `introTimeline.ts`) y acá.

**Los dos vecinos, para la grabación:**

- **Si el final queda atropellado → `placeS` 3,0.**
- **Si el final queda lento → `placeS` 1,8.**

Los dos siguen verdes: la comprobación que mide el peso del acomodamiento está
escrita como una banda que **rechaza los dos valores descartados y acepta los dos
vecinos** (§8.3).

### 3.1 · El pico de velocidad y de rotación

Con `MOTION_EASE.shift` la pendiente máxima es **2,735** (verificada dos veces:
analíticamente sobre la Bernstein y por diferencias finitas sobre
`cubicBezierEase`; 2,7346 en `t = 0,414`). El pico cae **en el medio del gesto, no
al arranque**.

| `placeS` | px/s | °/s | |
|---|---:|---:|---|
| 0,78 s — el clásico, **rechazado** | 1049 | 65,3 | 4,6× la calibración aprobada |
| 1,80 s — vecino "si queda lento" | 455 | 28,3 | 2,0× |
| **2,40 s — S8e** | **341** | **21,2** | **1,5×** |
| 3,00 s — vecino "si queda atropellado" | 273 | 17,0 | 1,2× |
| 3,60 s — S8d, la calibración aprobada mirando | 227 | 14,1 | 1,0× |

Sobre desktop 1440×810: recorrido **299,3 px**, rotación **18,6°** (yaw 0°, pitch
18,616°). En mobile 390×844 el recorrido es **0 px** y el acomodamiento es una
rotación en el lugar — no es un bug, es que el `fov` vertical no deja margen
lateral (documentado desde S8d).

### 3.2 · ⚠ Hallazgo: los 371 px y los 23,5°/s de S8d son de ANTES de S9

La instrucción esperaba "~423 px/s" con `placeS` 2,4, y ese número sale de los
**371 px** que S8d publica. Ese recorrido salía del destino viejo **(1086, 466)**;
**S9 cambió el recorrido y el destino definitivo es (1018, 428)**, que acorta el
viaje a 299,3 px y la rotación a 18,6°. Verificado con
`npx tsx src/lib/scene-framing.invariant.ts`.

Sobre la base vieja los mismos 2,4 s dan **422,7 px/s y 35,3°/s** contra 282 y
23,5 — o sea que **la expectativa de la instrucción se cumple exactamente**. Y el
**1,5× es el mismo en las dos bases**, porque es `3,6 / 2,4`. Lo único que se
movió es la escala absoluta, y es por S9, no por este sprint.

El docblock de `placeS` publica los números de HOY y deja anotada la base vieja.

---

## 4 · El cruce de contraste, medido en segundos

### 4.1 · Qué cambió, y qué no

**La propiedad no cambió. Cambió la unidad.**

El instrumento viejo contaba cuántas muestras de una grilla de 60 fps caían por
debajo del umbral. Contar enteros sobre una grilla fija tiene el problema que S8e
diagnosticó y dejó escrito: **la cuenta depende de la FASE de la grilla, no solo
del ancho de la ventana.** Barriendo `INK_FLIP_FRAC` daba `1, 2, 1, 2, 2, 2, 3, 2`
— no monótona en el ancho. El control que comparaba dos de esas cuentas comparaba
ruido de cuantización, y por eso quedó en rojo.

Ahora se mide la **longitud en segundos** del conjunto `{ t : contraste(t) < umbral }`.
La grilla dejó de ser la unidad de la respuesta y pasó a ser solo el *bracket*: el
instante exacto en que el contraste cruza el umbral sale de **interpolar
linealmente entre las dos muestras que lo encierran**.

**Los topes son los de S8d, traducidos:** 3 y 6 cuadros a 60 fps son **0,050 s** y
**0,100 s**. No se aflojó ninguno.

### 4.2 · Las once calibraciones, contra el umbral

| calibración | `< 1,10` (tope 0,050 s) | `< 1,25` (tope 0,100 s) |
|---|---:|---:|
| **default** | **0,0152 s** | **0,0376 s** |
| corto | 0,0043 s | 0,0108 s |
| largo | 0,0195 s | 0,0484 s |
| solo trazo corto | 0,0152 s | 0,0376 s |
| solo relleno largo | 0,0152 s | 0,0376 s |
| solo espera corta | 0,0152 s | 0,0376 s |
| solo color brevísimo | 0,0013 s | 0,0032 s |
| solo color larguísimo | 0,0282 s | 0,0699 s |
| solo letra lenta | 0,0152 s | 0,0376 s |
| solo fondo lento | 0,0152 s | 0,0376 s |
| solo acomodo larguísimo | 0,0152 s | 0,0376 s |

**Ninguna calibración viola la propiedad.** La peor (`solo color larguísimo`) usa
el 70% del tope. El default usa el 38%.

### 4.3 · Ninguna comprobación queda verde por vacío

El mínimo de contraste de la secuencia es **exactamente 1,00 en toda
calibración**, por el mismo teorema del valor intermedio que crea el problema. O
sea que **el conjunto nunca puede estar vacío**, y un `0` no sería un cruce
cortísimo: sería la grilla pasando por encima del cruce sin verlo. Por eso el
predicado es `medida > 0 && medida <= tope`, no solo `<= tope`.

Y la grilla se verifica en vez de suponerse: remedir con una grilla **5× más
fina** mueve el número **0,05 µs** en el default y **1,19 µs** en el cruce más
angosto de las once, contra una tolerancia de 17 µs (una milésima de cuadro).

### 4.4 · 🔴 El control positivo

**Una comprobación que no puede fallar no comprueba nada**, y un instrumento que
mide por interpolación puede pasar por construcción. Antes de afirmar que el
cruce real es corto, se lo hace rechazar uno estirado. Cuatro comprobaciones:

| control | resultado |
|---|---|
| La tinta usando la **ventana entera** alarga el cruce, y **por el mismo factor en las once** | **×1,863**, dispersión `1,7e-5` |
| Ese estirado **VIOLA el tope** donde el color es largo | `solo color larguísimo` → **0,130 s** contra el tope de 0,100 s |
| El punto de quiebre queda **acotado por los dos lados**, no estimado | `colorS` 1,8 s → 0,090 s **pasa** · 2,2 s → 0,110 s **falla** |
| El cruce **CRECE con el ancho de la ventana, sin excepción** | 21,9%→37,6 ms · 30%→45,1 · 40%→52,1 · 50%→57,4 · 70%→64,6 · 100%→70,1 |

La última es la que responde de frente al diagnóstico viejo: donde el conteo de
cuadros daba `1, 2, 1, 2, 2, 2, 3, 2`, la medida en segundos es **estrictamente
creciente**. Sigue al diseño, no a la fase de la grilla.

### 4.5 · 🔴 EL CHECK QUE ESTUVO ROJO TRES SPRINTS CUSTODIABA UNA PROPIEDAD INALCANZABLE

Éste es el hallazgo del sprint, y no es una nota al pie.

`detecta el cruce estirado` quedó en rojo en S8e y siguió rojo durante **S9, S10 y
S11**, que pasaron por encima sin tocar el archivo. Al medirlo bien se ve que
**nunca estuvo custodiando una propiedad en riesgo: custodiaba una que la
calibración real no puede alcanzar.**

**Sobre el `colorS` que este repo embarca (1,4 s), NINGÚN ancho de
`INK_FLIP_FRAC` alcanza para violar el tope de 6 cuadros.**

| ancho de la inversión, sobre `colorS` 1,4 s | cruce `< 1,25` |
|---|---:|
| 21,9% — lo que el repo embarca | 0,038 s |
| 100% — la ventana entera, el peor caso del mecanismo | **0,070 s** |
| 300% — más allá de la ventana, ya fuera del mecanismo | 0,075 s (satura) |
| | tope **0,100 s** |

El tope empieza a morder recién con **`colorS` ≈ 2,0 s**. Por eso el control
positivo de §4.4 se apoya en `solo color larguísimo` (`colorS` 2,6 s), que es una
calibración **que el repo ya embarca**, y no en una inventada para la ocasión: el
guard es real, pero en el default protege con un margen que ningún deslizamiento
de esa perilla puede consumir.

**El diagnóstico de S8e acertó la CAUSA y erró la CONCLUSIÓN.** La causa era la
que S8e escribió: el control comparaba dos conteos **enteros** de cuadros a 60 fps
y eso es ruido de cuantización. Lo que S8e no podía ver con ese instrumento es que
al desaparecer el ruido **la afirmación tampoco sobrevive**:

| | S8e afirmaba | medido en segundos |
|---|---|---|
| factor del estirado | `lentoFrames > weak * 2` | **×1,863**, idéntico en las once (dispersión 1,7e-5) |
| qué pasaría al ensanchar | "el logo queda invisible durante decenas de cuadros" | 0,070 s = 4,2 cuadros, **por debajo del tope** |

El ×1,863 no es una tolerancia que se aflojó para que pase: es el número que el
estirado tiene. Sale idéntico en las once calibraciones porque es un cociente de
velocidades y no depende de `colorS`, y **esa constancia es lo que se verifica
ahora** — más fuerte que un umbral elegido a ojo, y algo que el conteo de cuadros
enteros no podía expresar.

---

## 5 · 🔴 DERIVA DE S8D — el cruce quedó 22% más largo que el que S8d aprobó

**No es una nota al pie: es una cifra calibrada que se movió sin que nadie lo
supiera**, y solo aparece ahora porque el instrumento pasó a medir en segundos.

S8e re-ancló `INK_FLIP_FRAC` de 0,34 a 0,2186 y escribió que eso dejaba "el mismo
cruce que S8d calibró". **Preserva el ancho de la INVERSIÓN, no el del CRUCE**, y
con un instrumento que contaba cuadros enteros la diferencia era invisible:

| | ventana de la tinta | cruce `< 1,25` | cruce `< 1,10` |
|---|---:|---:|---:|
| **S8d — `colorS` 0,90 · frac 0,34** — lo aprobado | 0,306 s | **0,031 s** | 0,013 s |
| **S8e — `colorS` 1,40 · frac 0,2186** — lo que corre hoy | 0,306 s | **0,038 s** | 0,015 s |
| sin re-anclar — `colorS` 1,40 · frac 0,34 | 0,476 s | 0,048 s | 0,020 s |

**+22% sobre lo aprobado.** El re-anclaje hizo bien la mitad del trabajo: sin él el
cruce habría sido 0,048 s (+55%). Pero no podía cerrar la brecha entera, porque el
cruce **no depende del ancho de la inversión sino de la velocidad RELATIVA de las
dos luminancias**, y `colorS` pasó de 0,9 s a 1,4 s: el fondo ahora se mueve más
lento, así que la tinta lo cruza más despacio aunque invierta en la misma ventana.

**Reproducir el cruce de S8d exacto pediría `INK_FLIP_FRAC` = 0,1607.**

### 5.1 · Por qué NO se re-ancló de nuevo

No es conservadurismo: **rompe una propiedad.**

```
0,1607 × 1,4 s = 0,225 s de inversión
                 0,252 s de relevo 2D→3D  (SWAP_FRAC 0,18 × 1,4 s)
                 → el relevo NO entra adentro de la inversión
```

La propiedad `3b · el relevo, adentro de la inversión` se caería, y ésa **sí** es
una de las seis de `PROPERTIES`. Para bajar la fracción habría que bajar antes
`SWAP_FRAC`, y eso mueve la ventana donde la sustitución 2D→3D se esconde — un
sprint aparte con su propia verificación a ojo del relevo.

Además, el sprint lista `INK_FLIP_FRAC` 0,2186 entre lo que no se toca.

### 5.2 · Y por qué la deriva no es un problema hoy

**0,038 s es el 38% del tope de 0,100 s.** La deriva se comió 0,007 s de un margen
de 0,069 s. Queda anotada porque es una cifra que un humano calibró mirando la
pantalla y que hoy vale otra cosa — no porque haya nada que arreglar.

---

## 6 · Las cifras de S8d son históricas

**`docs/rediseno/outputs/S8d-SIMPLIFICACION.md` NO se editó**, por instrucción.
Sigue publicando lo que S8d midió, y queda como registro de S8d. Lo que este
reporte reemplaza:

| S8d publica | vale hoy |
|---|---|
| total **8,15 s** | **7,35 s** |
| el acomodamiento se lleva el **44%** | **33%** |
| `placeS` **3,60 s** | **2,40 s** |
| `strokeS` 1,40 · `fillS` 0,35 · `holdS` 0,60 · `colorS` 0,90 | 0,85 · 0,45 · 0,95 · 1,40 |
| `INK_FLIP_FRAC` **34%** | **21,86%** |
| pico **282 px/s** · **23,5°/s** sobre **371 px** | **341 px/s** · **21,2°/s** sobre **299,3 px** (y el recorrido cambió en S9, no acá — ver §3.2) |
| cruce: **1 cuadro** bajo 1,10 y **1** bajo 1,25 | **0,015 s** y **0,038 s**, contra topes de 0,050 s y 0,100 s |
| `introTimeline` 99 · `introSampling` 141 · total 443 | 99 · **166** · total **468** |

Lo de S8d que **sigue vigente sin cambios**: el mecanismo de las tres ventanas
concéntricas, el logo que no cambia de tamaño, la silueta y su clip, el
desplazamiento y la rotación como un solo número, y la luz y la sombra colgadas
del mismo `reveal`.

---

## 7 · Los 504 px de `S8-PRELOADER.md`

**Verificado contra `scene-framing` antes de escribir nada:**

```
npx tsx src/lib/scene-framing.invariant.ts   → 23 en verde, 0 en rojo
  ok  el centro cae en (1018, 428)
  ok  la tinta mide 451 × 313 px — un 14% más chica que con la calibrada
```

**No hizo falta corregir nada: S9 ya lo dejó anotado como histórico.** En
`S8-PRELOADER.md:87` el 504 está **tachado** (`~~504 × 351 px~~`) y el bloque de
`:92-101` dice explícitamente que es "una medición intermedia que el código nunca
produjo", y publica el número definitivo: **451 × 313 px con el centro X en
1018 px (70,7%)**. El archivo **no se tocó en este sprint**.

---

## 8 · Cómo quedaron escritas las comprobaciones que cambiaron

### 8.1 · `introSampling.invariant.ts` — el instrumento

`lowContrastFrames` (conteo de muestras a 60 fps) → `lowContrastSeconds`
(longitud del conjunto, por interpolación). Corre sobre **las once
calibraciones**, no solo sobre el default como antes.

### 8.2 · `introTimeline.invariant.ts` — el total

`la secuencia dura` pasó de 5,73 s a **7,35 s**. Las otras siete cifras publicadas
del default no se movieron: el `placeS` es lo último de la secuencia, así que no
corre ningún instante anterior.

### 8.3 · `introTimeline.invariant.ts` — el peso del acomodamiento

Era `> 0,4` en S8d ("se lleva el grueso") y S8e lo dio vuelta a `< 0,2` ("volvió a
ser el gesto corto del clásico"). Con 2,4 s la cifra es **33%**, que no es ninguno
de los dos, así que la comprobación quedó como una **banda `> 0,25 && < 0,4`**.

No es una banda decorativa: **rechaza los dos valores descartados** (14% con 0,78 s
y 44% con 3,6 s) y **acepta los dos vecinos que quedan para calibrar mirando**
(38% con 3,0 s y 27% con 1,8 s). O sea que mover la perilla adentro del rango
previsto no la pone roja, y salirse a cualquiera de los dos extremos sí.

Como en S8d y en S8e, **no es una propiedad**: corre solo sobre el default, fuera
del arreglo `PROPERTIES`.

---

## 9 · Verificación

### 9.1 · Las seis suites del intro

```
npx tsx src/components/layout/home-intro/introTimeline.invariant.ts    →  99 en verde, 0 en rojo
npx tsx src/components/layout/home-intro/introSampling.invariant.ts    → 166 en verde, 0 en rojo   ← estaba en 1 rojo
npx tsx src/components/layout/home-intro/introFlight.invariant.ts      →  92 en verde, 0 en rojo
npx tsx src/components/layout/home-intro/introSilhouette.invariant.ts  →  60 en verde, 0 en rojo
npx tsx src/components/layout/home-intro/introShading.invariant.ts     →  28 en verde, 0 en rojo
npx tsx src/lib/scene-framing.invariant.ts                             →  23 en verde, 0 en rojo
                                                                        ─────────────────────────
                                                                          468 comprobaciones
```

Las seis en verde, **incluida la que estaba roja**, y con el control positivo
declarado en §4.4. Las que corren contra calibraciones lo hacen contra **las
once**.

### 9.2 · Build y tipos

```
.\node_modules\.bin\tsc.cmd --noEmit                              → exit 0
.\node_modules\.bin\eslint.cmd <tocados + dependientes>           → exit 0, sin warnings
NODE_OPTIONS=--max-old-space-size=8192 npm run build              → exit 0
```

### 9.3 · Ningún mecanismo cambió

Los seis predicados de `PROPERTIES` en `introTimeline.invariant.ts` —`ORDER`,
`LETTER_BEFORE_VEIL`, `PLACE_IS_LAST`, `INK_INSIDE_COLOR`, `SWAP_INSIDE_INK`,
`LINES_SETTLE`— y el arreglo que los agrupa quedaron **byte por byte idénticos** a
lo commiteado (`diff` contra `HEAD` sobre el bloque entero: sin diferencias).
Tampoco se tocó ningún sampler de `introSampling.ts`, ni `introFlight.ts`, ni
`introShading.ts`, ni ningún componente.

### 9.4 · 🔴 Lo que estas 468 comprobaciones NO dicen

**No dicen que se vea bien.** El intro no corre bajo automatización
(`navigator.webdriver !== true` en el gate pre-paint), así que la transformación y
el acomodamiento **solo se juzgan a ojo, por grabación**. En este sprint no se
corrió el dev server, no se tomaron capturas, no se abrió el navegador y no se
despachó `visual-qa`. **`placeS` = 2,4 es una hipótesis medida, no una
verificación visual.**

---

## 10 · Archivos

**Modificados (3)** — los mismos tres que ya estaban en el working tree:

```
src/components/layout/home-intro/introTimeline.ts             placeS 0,78 → 2,4 · docblocks
src/components/layout/home-intro/introTimeline.invariant.ts   total 5,73 → 7,35 · el peso del acomodamiento
src/components/layout/home-intro/introSampling.invariant.ts   el instrumento en segundos + el control positivo
```

**Nuevos (2)**

```
docs/rediseno/sprints/S8e-ritmo.md      la instrucción
docs/rediseno/outputs/S8E-RITMO.md      este reporte
```

**Sin tocar:** `docs/rediseno/outputs/S8d-SIMPLIFICACION.md`,
`docs/rediseno/outputs/S8-PRELOADER.md`, todo `probe-escena/`, el home, los seis
frozen, `introSampling.ts`, `introFlight.ts`, `introShading.ts`,
`introSilhouette.ts`, `introChecks.ts` y todos los componentes del intro.

**Cero dependencias nuevas. Cero `any`. Nada de base de datos.**

---

## 11 · Anotado, no implementado

- **El total quedó 0,08 s por encima del clásico** (7,35 contra 7,27). Si el
  número importa, la perilla es `placeS`: 2,32 s lo empata exacto. Es una decisión que se
  toma mirando, no midiendo.
- **`INK_FLIP_FRAC` podría re-anclarse a 0,1607** para reproducir exacto el cruce
  de S8d — **pero rompería `SWAP_INSIDE_INK`** (§5.1). Si alguna vez se quiere, hay
  que bajar `SWAP_FRAC` primero, y eso es un sprint aparte con su propia
  verificación a ojo del relevo.
- **El tope de 6 cuadros no puede morderse con `colorS` 1,4 s** por más que se
  ensanche `INK_FLIP_FRAC` (§4.5). El guard sigue siendo real —muerde desde
  `colorS` ≈ 2,0 s, y las calibraciones llegan a 2,6— pero conviene saber que en
  el default protege con mucho margen.
- **`S8-PRELOADER.md` sigue describiendo el preloader de S8** (tres perillas
  `strokeS`/`presentS`/`revealS`, total 3,2 s, marca de 160 px). Es correcto como
  registro de S8, igual que el de S8d lo es de S8d. Ninguno se editó.
