# S12 — La penumbra · Escena 3D del home develOP

- **Fecha:** 2026-08-26 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S12-penumbra.md` · **Extiende:** `outputs/S11-LUZ.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint src/app/probe-escena` exit 0 · `next build --webpack` exit 0 · **279 comprobaciones estáticas, 279 en verde** (236 heredadas + 43 nuevas) · el gate del intro, 468 en verde y **cero en rojo**.
- **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano por grabación.**

---

## 0 · Qué hizo este sprint

**Le dio tamaño angular al sol.** Un parámetro nuevo —el radio angular, 0,266°, el del sol real— del que sale una penumbra **por fragmento**, derivada de la distancia entre el punto sombreado y el punto donde el rayo cruza cada capa de la celosía. No se tocó nada más: ni el arco, ni el factor de cielo, ni `CELOSIA_BAR`, ni las tramas, ni la coreografía.

**No hay ningún desenfoque.** No se filtra el piso ni se difumina el resultado: se ensancha el borde de la barra con el ancho que la geometría dicta, y se combina con el filtro de huella de píxel que ya existía **tomando el mayor de los dos, nunca la suma**.

**Y encontró, midiendo, que tres cosas del diagnóstico eran falsas.** Están en §3, escritas como corrección y comprobadas como chequeo. Una de ellas —que el atardecer iba a ablandar solo la senda peatonal del cierre— deja un **pendiente abierto** que este sprint no resuelve y no debía resolver.

---

## 1 · El modelo

### 1.1 · De dónde sale el ancho

Sea `P` el punto sombreado, `s` la dirección al sol (unitaria), `Q = P + s·t` el cruce contra el manto de una capa y `n` su normal horizontal en `Q`. Si el sol se corre un ángulo `dθ`, el cruce **se mueve sobre el manto**:

```
dQ = t · [ δ − s · (n·δ) / (n·s) ]        con δ ⊥ s, |δ| = dθ
```

El segundo término es el que persigue al cruce cuando el rayo entra rasante. Las dos fases de la trama —`u` horizontal y `v` vertical— usan el **mismo** paso sobre el manto (`pitch = 2πR/celdas`), así que basta proyectar `dQ` sobre la tangente horizontal y sobre `ŷ`. Llamando `c = n·s`, y simplificando con `c² + (s·t̂)² = |s_xz|²`:

```
ancho_u = 2·tan(α) · (t / pitch) · |s_xz| / |c|
ancho_v = 2·tan(α) · (t / pitch) · √(s_y² + c²) / |c|
```

Los dos **en celdas de la trama**, que es la unidad en la que trabaja la barra — y por eso el número **es** directamente qué fracción de la celda mide la penumbra. El `1/|c|` es la oblicuidad: un rayo que roza el manto ensancha su propia penumbra.

**`t` es el único término que hace que el ancho sea por fragmento y distinto capa por capa.** No hay ninguna constante global.

### 1.2 · Cómo se combina con el filtro que ya existía

`w = max(fwidth(fase), penumbra)`. **No lo reemplaza y no se suma.** Cerca de la cámara manda la penumbra física; en la lonja rasante contra el horizonte —el 0,051% de los rayos que S11 midió—, donde la celda no llega a un píxel, manda el filtro. Sumarlos lavaría el piso lejano dos veces.

`celosiaBarFiltered` hace las dos cosas sin una línea nueva de perfil, y no es economía: **las dos piden lo mismo**. Una rampa del ancho que se le pase y, pasada media celda, el reemplazo del patrón por su propia media. Para el antialias eso es lo que hace un mipmap; para la penumbra es **literalmente cierto** — una penumbra más ancha que la celda ES el promedio de la trama.

**Declarado:** el perfil es una rampa lineal (convolución con una caja), no la curva en S del disco. Se cambió el **ancho**, no la forma, para que con α = 0 el filtro de S11 quede idéntico. Lo que la física fija acá es el ancho, que es de lo que se trata el sprint.

### 1.3 · El control que ordena todo

**Con α = 0 el gobo es el de S11, línea por línea.** Comprobado punto por punto sobre 2.828 puntos de la losa contra la barra dura de S11: **peor diferencia 0,0e+0**. Y con su control positivo delante —**962 de esos 2.828 puntos cambian más de 1% con el sol de tamaño real**—, porque "con la perilla en cero da lo mismo que antes" es exactamente lo que contesta un modelo desconectado.

---

## 2 · La tabla de la tensión

Barrido completo del slider, con el control en 0. **Todo esto lo produce `s12-barrido.invariant.ts`**: la tabla es reproducible corriendo la suite (§6).

### 2.1 · Los seis valores medios (control S11: 201/166/213/185/129/104)

| α | hero | quiénes somos | números | trabajos | demos | cierre |
|---:|---:|---:|---:|---:|---:|---:|
| **0 (control)** | **201,4** | **166,3** | **213,3** | **185,3** | **128,6** | **103,6** |
| 0,133° | 202,4 | 166,6 | 213,9 | 186,4 | 128,6 | 103,7 |
| **0,266° ←** | **203,5** | **166,9** | **214,5** | **187,5** | **128,6** | **103,9** |
| 0,5° | 205,4 | 167,3 | 215,6 | 189,4 | 128,6 | 104,3 |
| 0,75° | 206,9 | 167,6 | 216,4 | 191,3 | 128,6 | 104,6 |
| 1° | 208,2 | 167,9 | 217,2 | 193,1 | 128,6 | 105,2 |
| 1,5° (tope) | 209,9 | 168,4 | 218,1 | 196,0 | 128,6 | 106,1 |

**El hero no llega a 210 ni en el tope del slider** (209,9), y en el valor elegido queda en 203,5. **Ninguna pose vuelve a la escena SIN celosía de S10 en ningún punto del rango**: la que más se mueve en todo el barrido es Trabajos, +10,6, y aun así queda 12 puntos por debajo de sus 208 de S10. Eso hace que sea **seguro calibrar mirando**: el slider no puede deshacer S11 ni en su extremo.

**Demos no se mueve un punto en ningún α.** Es 100% ciclorama con nivel 0,84: ahí el tone map no comprime y el aporte de la key es chico. Es el mismo motivo por el que casi no se movió con el factor de cielo (S11 §5.4.1).

### 2.2 · La portadora y el batido del piso, en puntos sRGB

| α | hero | números | trabajos | cierre |
|---:|---|---|---|---|
| **0 (control)** | **23,1 / 28,6** | **14,0 / 20,0** | **33,9 / 45,0** | **19,1 / 24,0** |
| 0,133° | 23,6 / 28,6 · +2% / 0% | 13,7 / 20,0 · −2% / 0% | 34,5 / 45,0 · +2% / 0% | 19,1 / 24,0 · 0% / 0% |
| **0,266° ←** | **24,2 / 28,6 · +5% / 0%** | **12,4 / 20,0 · −11% / 0%** | **33,4 / 45,0 · −1% / 0%** | **19,1 / 24,0 · 0% / 0%** |
| 0,5° | 24,8 / 28,6 · +7% / 0% | 9,5 / 20,0 · −32% / 0% | 29,1 / 45,0 · −14% / 0% | 17,7 / 23,8 · −7% / −1% |
| 0,75° | 19,4 / 28,6 · −16% / 0% | 6,7 / 18,1 · −52% / −10% | 23,3 / 40,0 · −31% / −11% | 15,8 / 23,7 · −17% / −2% |
| 1° | 13,4 / 21,1 · −42% / −26% | 5,5 / 13,3 · −61% / −33% | 19,2 / 33,1 · −43% / −27% | 15,3 / 22,7 · −20% / −6% |
| 1,5° (tope) | 6,5 / 11,6 · −72% / −60% | 3,3 / 7,4 · −76% / −63% | 10,0 / 23,0 · −71% / −49% | 14,6 / 20,5 · −24% / −15% |

*(batido / portadora, y su cambio contra el control)*

> ### ⚠️ Los cuatro números de batido de S11 no son reproducibles, y eso cambió una regla del proyecto
>
> S11 publicó **10,8 / 7,1 / 13,1 / 6,5 puntos sRGB** en §4.2 y **ningún archivo del repo los produce**. Viven en la prosa del reporte y en un string de `s11-celosia.invariant.ts:198`; su commit no agregó un solo script que los calcule — verificado con `git log --diff-filter=AD` sobre `__tests__/`. **No son comparables contra nada**, así que la tabla de arriba se compara contra su propia columna de α = 0.
>
> Lo que sí reproduce este instrumento es la **portadora** que S11 declaró de palabra —*"un piso cuyo carrier va de 20 a 49 puntos"*—: mide **20,0 … 45,0**. O sea que la escena es la misma; lo que faltaba era el método de extracción del batido.
>
> **Regla del proyecto desde S12, escrita en `DIRECCION-ESCENA.md` §3.11:** *una cifra que se publica en un reporte y no tiene instrumento que la produzca es **prosa**, no medición.* Si más adelante hay que compararla, no se puede; si hay que defenderla, tampoco. Se cumple escribiendo el instrumento **antes** que el número.

**El método, declarado, porque el número depende de él.** Recorrido del piso a lo largo de la tangente al azimut del sol —la dirección en la que corre el batido— desde el punto de piso más cercano al centro del cuadro, **cinco períodos de batido**, 24 muestras por celda fina proyectada. La **portadora** es `max − min` del perfil crudo. El **batido** es `max − min` de la media móvil de **una celda gruesa proyectada** — el período de portadora más largo, o sea la ventana más corta que borra las dos tramas.

⚠️ **Y el batido depende del tramo barrido.** En el hero: 12,3 con 3 períodos, 23,1 con 5, **28,6 con 7 — la portadora entera**, porque cuanto más largo el barrido más cerca se pasa de un nodo perfectamente en fase. Está comprobado en la suite, no prometido en prosa. **Por eso lo que decide es el cambio contra el control al mismo tramo, no el absoluto.** La portadora no depende del tramo, y por eso es la lectura limpia.

### 2.3 · El techo práctico del parámetro, como número

**La portadora del piso —el contraste de banda, o sea los 29,6 puntos que S11 compró, vistos donde caen— no se mueve un punto hasta α = 0,5°** (0,0% / 0,0% / 0,0% / −1,2%). Desde 0,75° empieza a caer (−10% en números, −11% en trabajos) y en 1° se desploma (−26% / −33% / −27% / −6%).

**De 0 a 0,5° ablandar el borde sale gratis. Desde 0,75° el sprint sí estaría deshaciendo al anterior.**

---

## 3 · ⚠️ Tres cosas que el diagnóstico daba por ciertas y no lo son

No son notas al pie: son **correcciones**, medidas, y las tres están escritas como chequeo en `s12-tension.invariant.ts` y en el encabezado de `celosiaPenumbra.ts`.

### 3.1 · `R/cos(elevación)`, no `1/tan`. La penumbra NO se ensancha al atardecer

El sprint decía: *"la distancia del rayo crece con `1/tan(elevación)`, igual que el largo de la celda, así que al atardecer la penumbra se ensancha sola"*. **La distancia de un punto del piso al manto es `R/cos(elevación)`**: al bajar el sol el rayo llega **antes**, no después.

| p | t (centro de la losa) | penumbra v | celda v proyectada | penumbra en mundo |
|---:|---:|---:|---:|---:|
| 0 | **47,0** | **0,230 celdas** | 3,22 | 0,74 |
| 0,625 | 44,3 | 0,205 | 3,89 | 0,80 |
| 0,75 | 43,7 | 0,199 | 4,12 | 0,82 |
| 0,875 | 40,6 | 0,172 | 6,19 | 1,07 |
| 1 | **38,8** | **0,157 celdas** | **11,51** | **1,81** |

Lo que sí crece ×3,6 es la **celda proyectada** — eso es de S11 y es correcto. Por eso en unidades de mundo la penumbra radial parece ensancharse ×2,4, pero **es la banda la que creció debajo**. Como fracción de la banda **se achica un 32%**.

**Lo que se ve es la fracción. El cierre no se arregla solo** → §5.1.

### 3.2 · La diferencia entre las dos capas es del 16%, y en relativo se invierte

El sprint decía que la sombra de la gruesa tenía que quedar *"visiblemente más blanda"* que la de la fina y que **esa diferencia era la mitad del efecto**. Medido, con α = 0,266°, desde el centro de la losa:

| capa | radio | t | penumbra en mundo (sobre el manto) | penumbra en celdas |
|---|---:|---:|---:|---:|
| fina | 38 | 47,0 | 0,436 | **0,186** |
| gruesa | 44 | 54,4 | **0,505** | **0,091** |

En mundo la razón es exactamente `44/38 = 1,158` — o sea **16%**. Pero como fracción de su propia celda **va al revés**: la gruesa queda **2,0× más DURA** relativa a su banda, porque su celda es 2,4× más grande.

**Lo que rompe la lectura de baldosa es otra cosa: el 6,3× entre el punto del piso pegado a la celosía (t = 7,4) y el más lejano (t = 47,0)** — y ése es **geométrico** (la razón de distancias) y **no depende de α**: da 6,33× para 0,133°, 0,266°, 0,5° y 1°. **α elige la escala; la variación ya estaba.**

Dentro de **un cuadro** —que es donde el ojo la juzga— la variación es menor porque la cámara ve un pedazo: **×2,3 en hero, ×1,9 en números y trabajos, ×3,7 en el cierre**, con la mediana en 0,180 / 0,203 / 0,210 / 0,181 celdas. **Plana a lo largo del arco: el cierre no queda peor que el hero.**

**Corolario, y descarta la alternativa que el sprint imaginaba:** *"que la penumbra la ponga solo la capa gruesa"* sería **peor**, porque la gruesa es la que tiene la penumbra relativamente más dura. Dejaría la trama que más se ve exactamente igual de filosa que hoy.

### 3.3 · La creciente de sol abierto ya tenía el borde blando

El sprint decía *"con penumbra su borde se ablanda solo — reportá cuánto"*. La respuesta es: **casi nada, porque ya estaba blando.** Su transición 95→5% mide **14,20 de mundo = 6,1 celdas finas con α = 0**, y la pone el desvanecido de banda (`MOIRE_FADE = 0,22`), no la penumbra:

| α | ancho del borde | cambio |
|---:|---:|---:|
| 0 | 14,20 | — |
| 0,266° | 14,20 | **0,0%** |
| 1° | 14,55 | **+2,5%** |

> ⚠️ **Y esta comprobación estuvo verde por vacío una vez.** El instrumento recibía el parámetro de penumbra y lo tiraba, así que devolvía el mismo número para cualquier α y la afirmación pasaba **por construcción**. Es el hallazgo de método del sprint y tiene sección propia: **§6.2**.

---

## 4 · La elección, y por qué

**α = 0,266° — el radio angular del sol real. Perilla del panel, 0 … 1,5°.**

1. **Es el valor físico** y el punto de partida que pedía el sprint.
2. **No deshace S11.** Hero 201,4 → 203,5, contra un techo de 210. Ninguna pose se mueve más de 2,5 puntos. **La portadora del piso queda intacta: 0% en las cuatro poses.**
3. **El batido sobrevive**: +5% / −11% / −1% / 0%.
4. **Entrega el borde variable**, que es lo que se vino a arreglar: 0,18–0,21 celdas de mediana en cuadro, con ×1,9 a ×3,7 de variación adentro del cuadro y ×6,3 a lo largo de la losa.

**El tope del slider está en 1,5° a propósito:** ahí la mediana del borde pasa **una celda entera** (1,01 / 1,15 / 1,18 / 1,02) y el moiré del piso se lava —portadora −60%—. Está para poder **ver** ese extremo, no para usarlo.

**Lo que no decide la medición, y se dice:** si 0,21 celdas de borde alcanzan para que deje de leerse como baldosa es juicio del humano por grabación. Lo que la tabla garantiza es el margen: **de 0 a 0,5° no se pierde nada medible.**

---

## 5 · Lo que queda abierto

### 5.1 · ⚠️ El cierre sigue leyéndose como senda peatonal — PENDIENTE, con el número

Queda anotado en `DIRECCION-ESCENA.md` §7.14 y **no se arregló acá**, porque no es lo que este sprint venía a hacer.

**El número:** la celda proyectada se estira ×3,6 (de 3,22 a 11,51 de largo) mientras la penumbra **como fracción de la banda se achica 32%** (0,230 → 0,157 celdas). **La lectura de senda peatonal sobrevive a este sprint.** Lo que sí queda dicho es que **no empeora**: la mediana del borde en cuadro del cierre (0,181 celdas) es la misma que la del hero (0,180).

**Las cuatro palancas, ordenadas de la MÁS BARATA a la más cara**, para que el sprint que lo tome no tenga que rehacer el análisis. Ninguna es un blur y ninguna se tocó acá:

| # | palanca | costo | qué cuesta de verdad |
|---:|---|---|---|
| **1** | **Subir el radio angular solo en el tramo final**, atándolo al arco | **una línea** en `OrbitRig` | El valor ya viaja por frame del store al uniform: solo hay que hacerlo función del progreso. Toca **únicamente el gobo**, así que no mueve la exposición de la sala. **Lo que cuesta no es código: rompe la premisa física** —el sol no cambia de tamaño a la tarde— y hay que aceptarlo como licencia declarada |
| **2** | **Bajar `CELOSIA_BAR` hacia el final** | **una línea, más re-medición** | Misma mecánica que la anterior, pero la barra alimenta además `celosiaSkyFactor`, o sea **la intensidad del hemisférico**: mover la barra con el arco mueve la exposición de la sala en el tramo. Hay que volver a medir el valor medio del cierre, que ya vale 104 |
| **3** | **Que en el cierre proyecte solo la capa gruesa** | **un canal de uniform y un término de shader** | Hoy el gobo es el producto fijo de dos `celosiaLayer`; hace falta un peso por capa que viaje por frame. Y **se pierde el batido**, que es interferencia entre las dos, así que hay que re-medir portadora y batido. A cambio da otra lectura: su celda mide 27,18 de largo, o sea una sola banda ancha en vez de trama |
| **4** | **Acortar la celda proyectada**, que es el ×3,6 | **un sprint de coreografía** | Es la elevación del arco. Mueve **todo** a la vez —la sombra del logo, el alcance de la creciente, los seis valores medios— y es decisión de recorrido, no de escena. §7.8 discute la temperatura del mismo tramo |

### 5.2 · Lo demás

- **Las dos perillas de la celosía**, las dos de calibrar mirando: `CELOSIA_BAR` (0,29) y el radio angular (0,266°). En 0 las dos devuelven el estado anterior, que es el control.
- **Todo lo que S11 dejó abierto y este sprint no tocó**: el escalón de exposición contra el preloader (−32,6%), los haces descartados con su tabla, el grano de papel, la variación de Ω sobre la losa.
- **Mobile.** Sin medir, igual que en S10 y S11.

---

## 6 · Verificación

```
tsc --noEmit                          → exit 0
eslint src/app/probe-escena           → exit 0
next build --webpack                  → exit 0   (con NODE_OPTIONS=--max-old-space-size=8192)
20 suites de comprobaciones (tsx)     → 279/279 en verde
gate del intro, 6 suites              → 468/468 en verde
```

| suite | S11 | **S12** |
|---|---:|---|
| `s7-*` · `s9-*` · `s10-*` · `s11-*` | 236 | **236 — ninguna tocada, ninguna aflojada** |
| **`s12-penumbra`** | — | **20** (nueva) — el modelo, el filtro, el GLSL y la variación |
| **`s12-tension`** | — | **14** (nueva) — los seis medios, la portadora, el batido y las tres correcciones |
| **`s12-barrido`** | — | **9** (nueva) — la tabla de §2 entera, reproducible |
| **total del módulo** | **236** | **279** |

### 6.1 · Los controles positivos

Ningún chequeo quedó verde por vacío:

1. **El gobo con α = 0.** Antes de afirmar que reproduce S11 exacto en 2.828 puntos, se verifica que **962 de esos puntos cambien** con el sol de tamaño real. Sin eso, la identidad pasaría con el modelo desconectado.
2. **La oblicuidad.** Antes de afirmar que un cruce rasante ensancha su penumbra (×5,000 con `n·s = 0,2`), se verifica que uno **de frente no la toque** (×1,000). Sin el par, "la oblicuidad ensancha" pasaría con cualquier factor.
3. **El perfil del borde.** La muestra se toma **fuera del filo** (fase 0,2 contra un filo en 0,145): en el filo exacto la rampa vale 0,5 con cualquier ancho —es su punto fijo— y el chequeo sería verdadero por construcción.
4. **Los seis valores medios.** Con α = 0 el instrumento devuelve los seis de S11; y por separado se verifica que **se mueva** con el sol real.
5. **La creciente.** Antes de afirmar que la penumbra no le mueve el borde, se verifica que **la meseta sí responda** a α (0,243 → 0,238 → 0,332). **Éste es el que encontró algo** — §6.2.
6. **El batido.** Su dependencia del tramo barrido se **comprueba** (12,3 → 23,1 → 28,6 con 3 / 5 / 7 períodos), no se promete en el comentario.

### 6.2 · ⚠️ EL CHEQUEO QUE PASABA VERDE POR VACÍO, Y CÓMO SE DESTAPÓ

Merece sección propia porque no es un aviso: es el hallazgo de método del sprint.

**Qué pasaba.** La primera versión de `crescentEdge` —el instrumento que mide el ancho del borde de la creciente de sol abierto— **recibía el parámetro de penumbra, se lo pasaba a `celosiaCrossings` y después lo tiraba**: calculaba la marca de la barra con un umbral duro sobre la fase e ignoraba el ancho que el cruce traía. O sea que **devolvía exactamente el mismo número para cualquier α**.

**Y el chequeo que lo consumía decía "la penumbra le agrega menos del 1%".** Con un instrumento que no ve el parámetro, esa afirmación es verdadera **por construcción**: pasaba verde, iba a seguir pasando verde para siempre, y habría publicado como medición una conclusión que el código no podía haber medido.

**Cómo se destapó, y no fue leyendo el código.** Fue porque **contradijo una medición previa del mismo sprint**: en la Parada 1 el mismo borde con α = 1° había dado **+2,4%**, y la suite devolvía **+0,0%**. Dos números del mismo sprint sobre la misma cantidad, incompatibles. El chequeo verde era el sospechoso, no el número viejo.

**Lo que quedó.** El instrumento pasó a usar `celosiaTransmittance` con el `spread` de verdad, y el chequeo lleva ahora **un control positivo delante**: antes de afirmar que el borde no se mueve, verifica que **la meseta de la zona con bandas SÍ responda** a α — 0,243 → 0,238 → 0,332. Con eso el par de afirmaciones es honesto: una cosa responde y la otra no, y esa asimetría es el hallazgo.

> **Y hay una nota que el control positivo dejó de regalo:** la respuesta **no es monótona**. Con una penumbra chica el borde blando corta un poco MÁS luz de la que abre (0,243 → 0,238), y recién con la penumbra ancha domina el lavado (→ 0,332). Nadie lo habría anotado sin forzar el instrumento a los dos extremos.

### 6.2.1 · La serie: cuatro sprints, tres hallazgos que ningún ojo iba a encontrar

| sprint | qué encontró un control positivo | qué habría pasado sin él |
|---|---|---|
| **S10** | **Un falso negativo de muestreo** en la oclusión: 120 muestras que el instrumento no estaba mirando | "No hay nada entre la cámara y el logo" habría sido cierto por ceguera, no por geometría |
| **S11** | **La creciente de sol abierto.** El control afirmaba "desde CUALQUIER punto de la losa el rayo cruza las dos capas" y **falló** — la geometría no tiene esa propiedad | Se habría aflojado el chequeo culpando al instrumento, y la creciente habría aparecido en la grabación sin explicación |
| **S12** | **Este**: un instrumento que tiraba el parámetro y un chequeo verde por vacío | Se habría publicado como medición una conclusión que el código no podía medir |

**Cuatro sprints, tres hallazgos, y ninguno era encontrable a ojo.** Los tres son de la misma familia: **una afirmación de ausencia o de invarianza que un instrumento roto contesta que sí.** La regla operativa que se destila, y que ya vale como práctica del módulo:

> **Antes de afirmar que algo NO cambia, hay que ver al instrumento cambiar.** Y si dos mediciones del mismo sprint sobre la misma cantidad no coinciden, **el sospechoso es el chequeo verde**, no el número que molesta.

### 6.3 · El gate del intro — nada se movió

| suite | S11 | **S12** |
|---|---|---|
| `introFlight` | 92 / 0 | **92 / 0** |
| `introSampling` | 140 / **1** | **166 / 0** |
| `introShading` | 28 / 0 | **28 / 0** |
| `introSilhouette` | 60 / 0 | **60 / 0** |
| `introTimeline` | 99 / 0 | **99 / 0** |
| `scene-framing` | 23 / 0 | **23 / 0** |

`git status` sobre `home-intro/` está **vacío**: no se tocó un byte. **El único rojo que S11 reportó ya no existe**, y no lo arregló este sprint: era parte del trabajo sin commitear en `home-intro/` que S11 tenía prohibido tocar, y **entró con el commit de S8e** (`90a94569`). Por eso `introSampling` pasó de 140/1 a 166/0.

Y sigue habiendo una razón estructural: `home-intro/` tiene su propio rig y **nunca llama a `applyLightRig`**, que es donde vive el uniform de la celosía. La penumbra no lo alcanza.

---

## 7 · Contabilidad

### 7.1 · Lo que cuesta: ALU por fragmento

Por cruce se agregan: el coseno de incidencia (4 ops), la escala con `t` y el paso (5), la raíz de la familia vertical (4), dos multiplicaciones (2) y dos `max` en la barra (2) → **17 ops × 4 cruces = 68**, más un `length(uCelosiaSun.xz)` que el compilador saca de factor común (4).

| | S11 | **S12** |
|---|---:|---:|
| ops por fragmento | ~200 | **~272 (+36%)** |
| a 2.880×1.620 (1920×1080 CSS a dpr 1,5) | ~950 MFLOP/cuadro | **~1,27 GFLOP/cuadro** |
| a 60 fps | ~57 GFLOP/s | **~76 GFLOP/s** |
| draw calls · pasadas · texturas · triángulos · dependencias | — | **sin cambio** |

**Es un conteo estático del GLSL, no un perfil.** Igual que en S10 y S11: no se midió un teléfono ni un frame time.

**Sin una sola rama nueva.** La máscara `valid` sigue siendo multiplicativa, así que `fwidth` no queda dentro de un condicional — adentro de una rama que no todos los píxeles del quad toman, su resultado no está definido. Comprobado en la suite.

**El peso del bundle no se volvió a medir, y el número de S11 queda RETIRADO en vez de repetido**: el build no publica el desglose por grupo de chunks en esta configuración, y **una cifra sin instrumento es prosa** (regla 11 de la dirección). Está en la lista de §8.1 junto con las otras que la auditoría encontró en la misma situación. Lo que sí se puede afirmar: **este sprint no agrega dependencias, ni draw calls, ni pasadas, ni texturas, ni triángulos.** Solo ALU y cuatro líneas de GLSL.

### 7.2 · Qué se apaga primero si mobile no rinde

La escalera de S11 §7.2 sigue entera, con **un escalón nuevo antes del primero**:

0. **La penumbra.** Son cuatro líneas: un `#define` que las compile fuera devuelve **exactamente** el gobo de S11. Baja el gobo de ~272 a ~200 ops.
1. Un solo cruce por capa · 2. Una sola capa · 3. Filtro por derivada fijo · 4. El gobo entero (el factor de cielo se queda) · 5. La escalera de S10.

---

## 8 · Lo que este sprint invalida de S11

| cifra de S11 | qué le pasa |
|---|---|
| **la amplitud del batido: 10,8 / 7,1 / 13,1 / 6,5 puntos sRGB** (§4.2) | **RETIRADA — era prosa, no medición.** Ningún archivo del repo la produce. La reemplazan **23,1 / 14,0 / 33,9 / 19,1** con α = 0 y **24,2 / 12,4 / 33,4 / 19,1** con el sol real, sobre portadoras de 28,6 / 20,0 / 45,0 / 24,0, con método declarado en `celosiaBeat.ts`. §2.2 |
| **los seis valores medios** (201/166/213/185/129/104) | **se mueven a 203,5 / 166,9 / 214,5 / 187,5 / 128,6 / 103,9** con el sol real. Siguen siendo el control del sprint: con α = 0 el instrumento los reproduce. §2.1 |
| **"medio grado de fuente contra una celda de 3,5°: sombra dura"** (`probeCelosia.ts`) | **el enunciado era correcto y estaba sin consecuencias**: el medio grado no estaba en el modelo. Ahora sí, y el borde mide 0,18–0,21 celdas |
| **el costo del gobo, ~200 ops/fragmento** | **~272 (+36%).** §7.1 |
| **el peso del grupo del canvas** (903,2 KiB minificado / 246,2 KiB sobre la red) | **RETIRADA por la regla 11**, igual que las cuatro del batido: ningún archivo del repo la produce. **No se re-midió acá** — es trabajo de quien la necesite. Ver §8.1 |
| **`introSampling` 140/1** (§9.2) | **166/0.** El rojo heredado se fue con el commit de S8e, no con este sprint. §6.3 |

Y una del **sprint de S12 mismo**, que la medición corrigió antes de construir: la penumbra **no** se ensancha al atardecer, la diferencia entre capas **no** es la mitad del efecto, y la creciente **no** se ablanda con esto. §3.

### 8.1 · Las otras cifras publicadas que tampoco tienen instrumento

**Auditoría, no medición.** Se hizo con un `grep` de cada cifra sobre las veinte suites del módulo, buscando qué archivo la produce. **Ninguna se volvió a medir en este sprint** — eso es trabajo del sprint que las necesite, y la regla 11 dice cómo: primero el instrumento, después el número.

| cifra publicada | dónde | estado |
|---|---|---|
| peso del canvas: **903,2 KiB** minificado, **246,2 KiB** sobre la red, texturas **~20 KB** | S11 §7.1 | **sin instrumento** |
| **13.126 → 13.122 triángulos** y **13 → 11 draw calls** | S11 §7.1 | **sin instrumento** |
| **~950 MFLOP/cuadro** y **~57 GFLOP/s** | S11 §7.2 | **sin instrumento.** Se derivan de las "~200 ops por fragmento", que es un conteo estático del GLSL: verificable leyéndolo, pero ningún chequeo lo cuenta. Lo mismo vale para las **~272 ops / ~1,27 GFLOP** de este sprint (§7.1), y queda dicho acá para no repetir el error |
| la comparación con el mapa de sombras: ortho **±6,5 → ±34,0**, téxel **0,0127 → 0,0664**, disco PCF **0,051 → 0,266**, penumbra del logo **1,5% → 7,8%**, el mapa que haría falta (**5357²**), los **7.680 triángulos** de la pasada de profundidad y el **39%** que el PCF difuminaría | S11 §2 | **sin instrumento.** Es el argumento con el que se eligió la vía analítica: la decisión se sostiene, la aritmética que la respalda no es reproducible |
| el grano de papel: **0,7 puntos** en la luz y **6,6** adentro de una banda | S11 §5.5 | **sin instrumento.** Sostiene un descarte, así que el costo de no tenerlo es bajo — pero si alguien lo revive, hay que medirlo de nuevo |
| la tabla de los haces: fondos aéreos **208/199/192/184/136/93** y sus alfas **0,041…0,018** | S11 §6 y `probeCelosia.ts` | ⚠️ **caso aparte, y el más engañoso.** La tabla es un **array literal**, y los dos chequeos de `s11-sin-sol` que la leen **validan su forma contra sí misma** —que tenga seis filas, que sea monótona, que el margen pase de 40— sin recalcular un solo valor desde la escena. **Tiene chequeo pero no tiene productor**: parece instrumentada y no lo está |

**Lo que NO entra en esta lista, y por qué.** Las cifras del disco del sol de S10 —13–36% → 28–71% de cobertura, 109 y 157 puntos de contraste, el washout de 109 → 64— **sí tuvieron instrumento**: eran las comprobaciones de `s7-modelado` y `s10-escena` que S11 borró **junto con el objeto que medían** (§1.1 de aquel reporte). Es un caso distinto y legítimo: la medición existió y murió con su sujeto. No hay nada que retirar.

**Y una a medias:** el escalón de exposición del preloader, **−32,6%** (S11 §9.3), no tiene chequeo propio, pero es una división de una línea sobre `CELOSIA_SKY_SHARE`, que **sí** está instrumentado y comprobado contra su integral en `s11-piso`. Es prosa derivada de una medición, no prosa a secas.

---

## 9 · Archivos

### Nuevos

| archivo | líneas | qué es |
|---|---:|---|
| `_components/celosiaPenumbra.ts` | 163 | El modelo: la derivación, las dos constantes de la perilla y las tres correcciones |
| `__tests__/celosiaBeat.ts` | 188 | El instrumento del batido, con su método declarado y su dependencia del tramo dicha |
| `__tests__/celosiaFloor.ts` | 157 | El ancho de borde en mundo sobre el piso, y cómo varía dentro de un cuadro |
| `__tests__/s12-penumbra.invariant.ts` | 297 | El modelo, el filtro, el GLSL y la variación |
| `__tests__/s12-tension.invariant.ts` | 266 | Los seis medios, la portadora, el batido y las tres correcciones |
| `__tests__/s12-barrido.invariant.ts` | 204 | La tabla de §2 entera, reproducible |
| `docs/rediseno/outputs/S12-PENUMBRA.md` | — | este reporte |

### Modificados

| archivo | qué cambió |
|---|---|
| `_components/celosiaGeometry.ts` | El cruce lleva su penumbra; la transmitancia usa la barra filtrada. **280 → 299 líneas** |
| `_components/celosiaShader.ts` | Cuatro líneas de GLSL, `uCelosiaKnobs` de `vec3` a `vec4` con `w = 2·tan(α)`, y `celosiaBar` recibe el ancho |
| `_components/lightRig.ts` | Un canal más, del mismo tipo que la barra: es una propiedad de la misma fuente que la key |
| `_components/OrbitRig.tsx` | Vuelca el radio angular al rig, ya como `2·tan(α)` — la trigonometría se hace una vez por frame y no cuatro por fragmento |
| `_components/probeStore.ts` | La perilla `celosiaSunRadiusDeg`, 0…1,5°, default 0,266. **Y se corrigió el "10,8 puntos" que S11 había escrito ahí como medición** |
| `__tests__/frameProbe.ts` | `SceneVariant.celosia.spread`, con default 0 |
| `docs/rediseno/DIRECCION-ESCENA.md` | §2.7.1 nueva (la penumbra y las tres correcciones), §3 regla 11 (la regla del instrumento), §7.9 (la segunda perilla), §7.13 (la deuda actualizada), **§7.14 nueva (el cierre pendiente)** |

### Intocados

**El home, `home-intro/` entero, los archivos frozen, la coreografía, el arco del sol, `CELOSIA_SKY_SHARE` y el factor de cielo, `CELOSIA_BAR`, las tramas de la rendija, la base de datos y las dependencias.** Cero `any`, cero `setState` por frame, cero lens flare, cero bloom, cero color, **cero blur**.

### 9.1 · El límite de 300 líneas

**Los seis archivos nuevos nacieron partidos y ninguno lo cruza.** `celosiaBeat.ts` sí lo cruzó durante el sprint (319) al sumarle el muestreo del cuadro, y **se lo partió en el acto**: el batido quedó en `celosiaBeat.ts` (188) y el ancho de borde sobre el piso se mudó a `celosiaFloor.ts` (157). Son dos preguntas distintas — cuánto modula la trama contra cuánto mide su borde.

**Los tres archivos de la deuda de §7.13 crecieron, y se declaran, no se arreglan** (es lo que la instrucción manda):

| archivo | antes de S12 | **ahora** | qué le sumó S12 |
|---|---:|---:|---|
| `probeStore.ts` | 378 | **406** | +28: la perilla y su porqué, más la corrección de la cifra sin instrumento |
| `lightRig.ts` | 345 | **357** | +12: el canal del radio angular |
| `OrbitRig.tsx` | 647 | **651** | +4: el volcado al rig |

Mismo motivo que en S11 y por eso van juntos a un sprint de limpieza: `lightRig` y `OrbitRig` son las dos mitades de un solo frame, y `probeStore` es el contrato entre el panel y ese loop.
