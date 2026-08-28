# S14-LECTURA — Que se lean como pelotitas

- **Fecha:** 2026-08-26 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S14-lectura.md`
- **Qué cierra:** el **reparto de tamaños** del campo de partículas del intro. El mecanismo de S13 no se toca: aparecen con el color, bajan con la letra, y para cuando la escena aparece no queda ninguna.

> **El sprint entero es un número, y es éste:**
> con el reparto de S13, **574 motas tenían la tinta y no el tamaño** — pasaban el
> contraste de sobra y no llegaban a la escala de lectura del preloader clásico.
> Hoy son **cero**, y las que se leen pasaron de **203 a 306** con **57% menos motas**.

---

## 0 · Los cuatro números del sprint

| | |
|---|---:|
| motas que superan el umbral de visibilidad, **antes → después** | **203 → 306** |
| motas en cuadro, antes → después | 1.033 → **442** |
| la mediana del polvo, en píxeles | 3,16 → **6,52** |
| **el margen** contra las de la escena | 110,4 → **112,4 ms** |

Y dos correcciones que salen del sprint: **el tamaño de la mota no mueve el instante en que deja de ser legible** (§4) y **el argumento de `linear` contra `shift` no se refuerza: se vuelve innecesario** (§5).

---

## 1 · El diagnóstico, en una frase

**La misma especie no produce la misma lectura sobre los dos fondos.**

S13 hizo que el campo del intro copiara la mezcla de la escena —957 de polvo contra 76 de bokeh— y fue una decisión razonable: garantizaba que las dos poblaciones fueran de la misma especie. Pero en la escena ese polvo tiene paralaje, se mueve con las conchas que giran y cae sobre un piso con bandas y una pared con moiré: se lee como atmósfera. En el intro está **quieto**, sobre papel blanco liso, sin nada más en el cuadro. Ahí se lee como ruido de sensor.

**La restricción que S13 se puso de más se soltó.** El relevo nunca pidió que las poblaciones se correspondieran; pidió que **no se vieran las dos juntas**, y de eso se ocupa `PARTICLES_BEFORE_VEIL` con su control negativo. Lo que sí se conserva —y se mide— es **el color, el material y la forma**.

---

## 2 · Las dos perillas, y de dónde salen

```ts
INTRO_DUST_SCALE = 2.05     // el tamaño de mundo del polvo, ×2,05 el de la escena
INTRO_DUST_SHARE = 0.30     // qué fracción del campo se dibuja (era 0,80)
```

**El bokeh no se tocó.** Ni conteo, ni tamaño, ni color, ni opacidad: la escala grande del campo ya estaba donde tenía que estar. Lo que no se leía era el polvo.

### 2.1 · La referencia de lectura es el preloader clásico, y se MIDE

El sprint nombra una sola referencia —el campo de puntos del preloader clásico— y aclara que es **referencia de lectura, no de implementación**. Por eso vive en un banco (`introReadingProbe.ts`) y no en el módulo, y sus números **se leen del código fuente** de `DotMatrix.tsx` y `Hero.tsx`, con el patrón con el que `introParticles.invariant.ts` ya custodia lo copiado de `DepthParticles.tsx`:

| | |
|---|---:|
| esfera del punto, radio de mundo | 0,025 |
| cámara del clásico | a 15, fov 35° |
| paso de la grilla **en el instante en que aparece** (`DOT_SPACING_SPARSE`) | 0,95 |
| **el punto proyectado en 1440×810** | **4,28 px** |
| su paso en píxeles · puntos en cuadro · papel que tapa | 81,4 px · ~205 · 0,22% |

⚠ **El paso es el `SPARSE`, no el `FINAL`.** Durante el preloader `introProgress` vale 0, así que la grilla del clásico está en 0,95 y no en 0,6. Con el `FINAL` el paso sería 51,4 px y el campo del intro parecería igual de denso; con el que de verdad se ve, **el intro sigue siendo 1,6× más denso que su referencia**.

### 2.2 · Por qué 2,05 y por qué 0,30

- **2,05** — con esa escala el **p10** del polvo llega a **4,26 px**, o sea que nueve de cada diez motas están en la escala de lectura del clásico o por encima. Con el reparto de S13 la que llegaba era **una de cada cinco**, y la mediana —3,16 px— caía justo en el régimen de "dos o tres píxeles" que el humano describió como grano.
- **0,30** — el campo pasa de 957 motas de polvo en cuadro a **366**, o sea un paso medio de **51,4 px** contra los 33,6 de S13. El número **no copia** la grilla del clásico (el sprint es explícito en que la distribución sigue siendo la del campo, no un patrón regular), pero queda del lado denso de ella.

**`INTRO_DUST_SCALE` es una perilla que se decide MIRANDO**, misma clase que `INTRO_FALL_WORLD` y que `placeS`. La comprobación no fija su valor: es una banda con dos cotas derivadas —la mediana llega al punto del clásico, y el recorte de la regla de las dos escalas se queda bajo el 2%— que **acepta los dos vecinos y rechaza los dos extremos**:

| | mediana | recorte | |
|---|---:|---:|---|
| **1,0** — el reparto de S13 | 3,19 px | 0,27% | rechazado — no llega a la escala del clásico |
| **1,35** — vecino "si se leen demasiado grandes" | 4,30 px | 0,27% | aceptado |
| **2,05** — el default | 6,52 px | 0,81% | aceptado |
| **2,4** — vecino "si todavía se leen chicas" | 7,59 px | 1,36% | aceptado |
| 3,0 | 9,40 px | 4,34% | rechazado — la escala grande se come el campo |

🔴 **El control negativo de abajo es el estado del que este sprint viene.** No es un valor inventado para que falle: es el que estaba embarcado y el que el humano juzgó como grano.

---

## 3 · El reparto nuevo, en las tres ventanas

**Polvo, diámetro en píxeles CSS.** El bokeh va aparte porque no cambió.

| 1440×810 | S13 | S14 |
|---|---:|---:|
| polvo en cuadro | 957 | **366** |
| bokeh en cuadro | 76 | 76 |
| **total** | **1.033** | **442**  (−57%) |
| polvo p10 / mediana / p90 | 2,09 / **3,16** / 4,97 | 4,26 / **6,52** / 10,08 |
| bokeh mediana | 24,40 | **24,40** |
| paso medio del campo | 33,6 px | **51,4 px** |
| papel que tapa el polvo | 0,87% | **1,33%** |
| `drawImage` por cuadro | 1.033 | **442** |

| 1920×1080 | S13 | S14 |
|---|---:|---:|
| total | 1.033 | **442** |
| polvo p10 / mediana / p90 | 2,78 / **4,21** / 6,62 | 5,68 / **8,69** / 13,44 |
| bokeh mediana | 32,54 | **32,54** |
| paso medio | 44,8 px | **68,5 px** |

| 390×844 | S13 | S14 |
|---|---:|---:|
| polvo + bokeh | 315 + 39 = **354** | 121 + 39 = **160**  (−55%) |
| polvo p10 / mediana / p90 | 2,04 / **2,96** / 5,09 | 4,17 / **5,95** / 9,88 |
| bokeh mediana | 22,93 | **22,93** |
| paso medio | 30,5 px | **45,4 px** |

> **Mobile no queda ralo, y el número lo dice.** Con 160 motas el paso medio es **45,4 px** — más denso que el de desktop (51,4) y **poco más de la mitad** del de la grilla del clásico (84,8 px en esta ventana). El campo del intro en un teléfono sigue siendo el más apretado de los tres.

### 3.1 · Que la escala sea un FACTOR y no otra distribución

Los tres cuantiles se multiplican por el mismo número, así que la forma del reparto —la que produce la profundidad del campo— queda intacta:

> p10 **×2,04** · mediana **×2,06** · p90 **×2,03**, contra el ×2,05 de la perilla.

Y contra el campo de la escena, la comprobación que reemplazó a la igualdad de S13 es **más fuerte** que ella: exige que la diferencia sea **exactamente la perilla y nada más** (×2,007 / ×2,040 / ×2,095). El bokeh sigue comparándose sin escala de por medio: 24,40 contra 24,28 px.

**Y ralear no corre el campo hacia afuera.** El recorte se aplica **por concha** —el campo está ordenado por radio y recortar el final se llevaría solo las lejanas—, así que la rampa de color queda idéntica de punta a punta: escalón mínimo / mediano / máximo **0 · 4 · 23** antes y después, sobre 24.

---

## 4 · 🔴 El umbral de visibilidad, y el número que dice si el sprint hizo algo

**Declarado, con dos mitades y ninguna de ellas sola alcanza:**

> Una mota es **visible** si (1) **llega al diámetro del punto del clásico** en esa ventana — la escala de lectura que el sprint manda tomar de ahí — **y** (2) **su contraste contra el papel llega a 3:1**, el mínimo de **WCAG 2.1 SC 1.4.11 (Non-text Contrast)** para un objeto gráfico. Se cuenta en el instante de **densidad completa**.

**Por qué 3:1 y no el 1,10 del cruce de tinta.** Son dos preguntas distintas. 1,10 responde *"¿todavía se distingue algo del fondo?"* y por eso gobierna el cruce contra la escena, donde lo conservador es exigir de más. Acá la pregunta es *"¿esto se lee como un objeto?"*, y con 1,10 **las 76 motas de bokeh contarían como visibles** con 1,13:1 — que son justamente las que el humano describió como *"están, pero apenas se distinguen del fondo"*. Entre 1,13 y 3 no hay una sola mota de ninguno de los dos campos, así que el corte no es sensible a dónde se ponga adentro de esa banda.

**Las dos mitades discriminan, y se comprueba:**

- la del **contraste** rechaza al bokeh entero: 28,8 px de diámetro con 1,131:1;
- la del **tamaño** rechaza, en el campo de S13, **574 motas** que pasan 3:1 y no llegan a los 4,28 px.

| motas que superan el umbral | S13 | S14 | |
|---|---:|---:|---|
| 1440×810 | 203 de 1.033 | **306 de 442** | **+51%** con 57% menos motas |
| 1920×1080 | 203 de 1.033 | **306 de 442** | +51% |
| 390×844 | 75 de 354 | **107 de 160** | +43% con 55% menos motas |

🔴 **Y el número que explica el sprint entero:** las motas con tinta y sin tamaño pasan de **574 a 0**. El tamaño dejó de ser el cuello de botella; lo que queda afuera hoy queda afuera por contraste, que es la perspectiva atmosférica haciendo su trabajo.

### 4.1 · El contraste de la mota mediana contra el papel

| en densidad completa | S13 | S14 |
|---|---|---|
| 1440×810 | 3,41:1 sobre 3,16 px | **5,64:1 sobre 6,52 px** |
| 1920×1080 | 3,41:1 sobre 4,21 px | **5,64:1 sobre 8,69 px** |
| 390×844 | 6,13:1 sobre 2,96 px | **5,72:1 sobre 5,95 px** |

⚠ En mobile **baja**, y no es un error: la mota mediana es **otra mota** —el campo se raleó y el que ocupa la mediana ahora tiene otro radio, o sea otro color—. El contraste de una mota no depende de su tamaño, depende de su distancia al origen.

---

## 5 · El margen: recalculado, y por qué se movió

| | S13 | S14 |
|---|---:|---:|
| la ÚLTIMA del intro deja de ser legible | 4,1679 s | **4,1659 s** |
| la PRIMERA de la escena se vuelve legible | 4,2785 s | 4,2785 s |
| **margen** | **110,4 ms** | **112,4 ms** |

**No se lo comió: creció 2,0 ms.** Y la razón no es la que el sprint anticipaba.

### 5.1 · 🔴 El tamaño NO mueve el instante en que deja de ser legible

El sprint pide recalcular el margen *"porque una mota más grande es legible más tiempo"*. **Medido, eso no es cierto para esta forma y esta salida**, y se comprueba en tres pasos:

| | última legible |
|---|---:|
| escala 1,0 con el reparto de S13 | 4,1679 s |
| **escala 2,05 con el reparto de S13** | **4,1679 s** — el mismo número, 0 s de diferencia |
| escala 1,0 con el reparto de S14 (0,30) | **4,1659 s** — 2,0 ms antes |
| escala 2,05 con el reparto de S14 | 4,1659 s — hereda exactamente ése |

**Por qué.** El criterio del repo es la razón de contraste de WCAG, que es ciega al tamaño; y aunque no lo fuera, **la alfa de la caída multiplica a la mota entera por igual** y el sprite del polvo es opaco adentro del 75% de su radio. Cuando el pico de la mota cruza el umbral, lo cruza **toda la mota a la vez**, mida 2 px o 15.

**Lo que sí mueve el instante es la población.** Menos motas es menos chance de que alguna combine el color más oscuro con la fase más tardía — y eso solo puede correr el instante hacia adelante, o sea **agrandar el margen**. El margen de este mecanismo no puede achicarse por agrandar las motas.

**Y el sentido en que "más grande" sí es "más visible", medido:** la tinta que el campo pone por encima del umbral pasa de **0,36% a 1,26% del cuadro**. Hay más de ella en cada instante; lo que no cambia es cuándo deja de haberla.

> ⚠ **Cifra que se movió de arriba:** la primera del intro se vuelve legible a **2,278 s** (28 ms después de que arranca el color) contra los 2,282 s / 32 ms de S13. Mismo motivo: otra población, otra mota más oscura y temprana.

---

## 6 · La caída: `INTRO_FALL_WORLD` no se tocó, y su número sí se movió

| 1440×810 · 1920×1080 · 390×844 | S13 | S14 |
|---|---:|---:|
| recorrido en diámetros de la propia mota | 33,79 | **16,52** (16,63 en mobile) |
| **paso por cuadro a 60 fps** | **1,90** | **0,93** |

**Es exactamente el recorrido de S13 dividido por la escala**, y así se comprueba —contra el campo de S13 medido en la misma corrida, no contra un literal—. `INTRO_FALL_WORLD` sigue en 1,9: lo que bajó el paso fue la mota, que creció.

### 6.1 · ⚠ El argumento de `linear` contra `shift` NO se refuerza

El sprint anticipa que sí. Medido, no:

| paso por cuadro, en diámetros | con `linear` | con `shift` |
|---|---:|---:|
| motas de S13 | 1,90 | **5,20** — fuera de la banda |
| motas de S14 | 0,93 | **2,54** — **adentro** |

La pendiente máxima de `shift` —**2,7346×**— hasta hoy era prosa: ningún instrumento la producía. Ahora se mide sobre el evaluador que el repo embarca, y con ella el paso que `shift` habría dado. `linear` **sigue siendo lo correcto** porque sigue siendo el mínimo posible para una distancia dada —eso es aritmética y no depende de la escala— pero **el modo de falla del que protegía ya no ocurre a esta escala**: el argumento no se refuerza, se vuelve innecesario.

⚠ Por lo mismo, el **control negativo** de la banda de `INTRO_FALL_WORLD` se movió de 6 a **12**: con las motas de hoy una caída de 6 da 2,76 por cuadro y **entra** en la banda. No es que la banda se aflojó — es que el mismo desplazamiento estrobea la mitad.

### 6.2 · El paralaje, y por qué se comprueba por deciles

| |dy| en 1440×810 | S13 | S14 |
|---|---|---|
| mínima / mediana / máxima | 47 / 107 / **377** px | 47 / 109 / **248** px |
| razón entre extremos | ×8,11 | **×5,26** |
| razón entre deciles (p90/p10) | ×2,21 | **×2,11** |

**Los extremos de una muestra dependen del tamaño de la muestra**, y S14 la ralea al 30%: se encogen sin que la ley del paralaje cambie un ápice. El cociente entre deciles es prácticamente el mismo, y es él el que pasó a comprobarse. El extremo se sigue publicando porque es el número que se ve; lo que ya no se comprueba es él. En mobile el extremo baja a ×3,71 y el decil a ×1,99.

---

## 7 · El recorte de las dos escalas, corrido con la mota

`dustDepthFloor` pasó a usar `INTRO_DUST_SIZE` en vez de `PARTICLE_SIZE`:

```
depthMin = INTRO_DUST_SIZE × (ojo + BOKEH_R_MAX) / BOKEH_SIZE
```

| | S13 | S14 |
|---|---:|---:|
| profundidad del borde | 3,974 | **8,146** |
| **diámetro del corte** | **17,33 px** | **17,33 px** |
| polvo que queda afuera | 0,21% | **0,81%** (3 de 369) |
| mota de polvo más grande en cuadro | 12,77 px | **14,87 px** |

**El diámetro no se mueve, y no es casualidad:** el tamaño está arriba y abajo de la misma cuenta y se cancela. Lo que se mueve es a qué profundidad cae el borde, y con ella cuántas motas quedan afuera. La escena, en esta pose, lo sigue cumpliendo sola: su mota más grande mide 10,98 px.

El control positivo del recorte también cambió de forma: en vez de un umbral sobre el conteo, se cuenta contra **el mismo campo con un tamaño de mundo ínfimo**, donde el borde se va a cero. La diferencia son exactamente las motas que el recorte se lleva.

---

## 8 · Verificación

### 8.1 · Las catorce suites

```
introFlight             92 ← 92
introParticleField      24 ← 22   (+2: la pendiente de `shift`, medida)
introParticleReading    30   nueva
introParticles          18 ← 21   (el color, 4, salió a su propia suite; +1 neto)
introParticleScale      13   nueva
introParticleTiming     25 ← 25   mismos chequeos, cifras nuevas
introParticleTint        4   nueva  (salió de introParticles)
introRig                23 ← 23
introSampling          166 ← 166  salida IDÉNTICA, verificada con diff
introShading            14 ← 14
introSilhouette         60 ← 60
introTimeline          112 ← 112  salida IDÉNTICA, verificada con diff
scene-camera             7 ← 7
scene-framing           23 ← 23
                     ─────
                      611 comprobaciones, 0 en rojo   (565 antes)
```

### 8.2 · 🔴 El diff, como método — dos veces, y la primera es la que importa

Este sprint movió **cuatro bloques de código compartido entre módulos**: la rampa de color a `introParticleTint.ts`, la legibilidad a `introLegibilityProbe.ts`, la medición de "la última legible" de una suite a ese banco, y la parametrización del constructor del campo. Cualquiera de esas es exactamente el tipo de movimiento en el que un error se cuela sin que nadie lo note.

**El procedimiento, tal cual se corrió:**

1. Se guardó la salida completa de **las once suites** ANTES de tocar nada.
2. Se hicieron **todos los movimientos de código**, con las perillas todavía en los valores de S13 (`INTRO_DUST_SCALE` = 1, `INTRO_DUST_SHARE` = 0,8).
3. `diff -r antes/ neutral/` → **sin una sola línea de diferencia**, en las once.
4. Recién entonces se movieron las dos perillas a 2,05 y 0,30.

Ése paso 3 es el que convierte "el refactor no cambió nada" de una promesa en una medición: las 565 comprobaciones publicaron **las mismas cifras**, no el mismo verde.

Y después del cambio de perillas, **las ocho suites que no son de partículas siguen dando diff vacío** — `introFlight`, `introRig`, `introSampling`, `introShading`, `introSilhouette`, `introTimeline`, `scene-camera`, `scene-framing`. Las **once calibraciones del cruce de tinta** (166 cifras) y **los siete predicados en las once calibraciones** (112 comprobaciones) están adentro de esas ocho: idénticas, línea por línea.

### 8.3 · Tipos, lint y build

```
.\node_modules\.bin\tsc.cmd --noEmit                              → exit 0
.\node_modules\.bin\eslint.cmd <los 14 archivos tocados>           → exit 0, sin warnings
NODE_OPTIONS=--max-old-space-size=8192 npm run build              → exit 0
```

El lint tiene su control positivo: un archivo de prueba con un `any` **sí** lo reporta (`@typescript-eslint/no-explicit-any`), así que el exit 0 de los catorce archivos no es un lint que no corrió.

**No se corrió `prisma migrate status`:** el sprint prohíbe la base de datos y no se tocó una línea que la toque.

### 8.4 · El contrato del bundle, sobre el build

| negativo — no viaja a producción | | positivo — sí viaja | |
|---|---:|---|---:|
| `introReadingProbe` | 0 | `data-intro-particles` | 2 |
| `introLegibilityProbe` | 0 | `data-home-intro` | 2 |
| `introParticleProbe` | 0 | `2.05` en el chunk de las partículas | sí |
| `introParticleReading` / `introParticleScale` | 0 | `1.9` en el mismo chunk | sí |
| `IntroDevController` · `IntroPreview` · `fallback SVG` | 0 | | |

⚠ **Contado sobre JS ejecutable, sin `.js.map`.** Los tres bancos y el controlador **sí** aparecen en los source maps del server — que no se ejecutan y no llegan al navegador. El grep tiene su propio control: buscar en los `.map` los encuentra.

Y **`three` sigue sin viajar en la carga inicial del home**: de los **23 chunks** que la página prerenderizada pide, **ninguno** contiene `WebGLRenderer` — el mismo número y el mismo resultado que S13 y S8d.

### 8.5 · 🔴 Lo que estas 611 comprobaciones NO dicen

**No dicen que se vea bien.** El intro no corre bajo automatización (`navigator.webdriver !== true` en el gate pre-paint), así que el reparto nuevo **solo se juzga a ojo, por grabación**. En este sprint no se corrió el dev server, no se tomaron capturas, no se abrió el navegador y no se despachó `visual-qa`.

**`INTRO_DUST_SCALE` = 2,05 y `INTRO_DUST_SHARE` = 0,30 son una hipótesis medida, no una verificación visual.**

---

## 9 · Cifras de S13 que este sprint invalida

| cifra de S13 | vale hoy |
|---|---|
| última legible **4,1677 s** · margen **110,4 ms** | **4,1659 s** · **112,4 ms** |
| primera legible del intro **2,282 s** (32 ms) | **2,278 s** (28 ms) |
| **957 / 76 / 1.033** motas en cuadro | **366 / 76 / 442** |
| polvo p10/mediana/p90 **2,09 / 3,16 / 4,97 px** | **4,26 / 6,52 / 10,08 px** |
| en mobile, **354** motas | **160** |
| recorrido **33,79 diámetros** · paso **1,90 por cuadro** | **16,52** · **0,93** |
| paralaje ×8 entre extremos (47 → 377 px) | **×5,26** (47 → 248 px) · el decil, ×2,11 |
| `depthMin` **3,974** · recorte **0,21%** · polvo hasta **12,77 px** | **8,146** · **0,81%** · **14,87 px** |
| divergencia de la semilla, mediana **13,6 px** | **13,5 px** (tercera semilla, 13,5) |
| "con `shift` serían **5,2 diámetros por cuadro**" | **2,54** — y ya no sale de la banda |
| **565 comprobaciones** en once suites | **611** en catorce |

**Lo que S13 publicó y sigue valiendo tal cual:** la línea de tiempo entera, `INTRO_FALL_WORLD` = 1,9, `PARTICLES_BEFORE_VEIL` y los seis predicados anteriores, el escalón de exposición de §7.11, la cámara de `harness.ts` como pendiente abierto, la rampa de color (144 de 201 puntos exactos, peor teñido 3,0 de 255), y el 92% del recorrido al dejar de ser legible.

---

## 10 · Archivos

**Nuevos (6 de código, más este reporte)**

```
home-intro/introParticleTint.ts               el COLOR de una mota — salió de introParticles.ts
home-intro/introParticleTint.invariant.ts     4 · la rampa contra shadeUnlit (salió de introParticles)
home-intro/introLegibilityProbe.ts            el banco de la LEGIBILIDAD — salió de introParticleProbe.ts
home-intro/introReadingProbe.ts               el banco de la LECTURA: el clásico y el umbral
home-intro/introParticleReading.invariant.ts  30 · el reparto nuevo y cuántas se leen
home-intro/introParticleScale.invariant.ts    13 · la banda de la perilla y qué mueve el margen
```

**Modificados (9)**

```
home-intro/introParticles.ts                  +INTRO_DUST_SCALE/SIZE · SHARE 0,8 → 0,30 · el color salió
home-intro/introParticleField.ts              el constructor toma tamaño y reparto, para barrer
home-intro/introParticleSprites.ts            lee la rampa de introParticleTint.ts
home-intro/introParticleTiming.ts             docblock: `linear` contra `shift`, con los números nuevos
home-intro/introParticleProbe.ts              la legibilidad salió a su propio banco
home-intro/introParticles.invariant.ts        la especie: lo que se soltó y lo que se conserva
home-intro/introParticleField.invariant.ts    paralaje por deciles · la pendiente de `shift`, medida
home-intro/introParticleTiming.invariant.ts   consume el instrumento compartido — mismos chequeos
docs/rediseno/DIRECCION-ESCENA.md             §1.4 · el margen nuevo y la mezcla soltada · índices
```

**Sin tocar:** todo `probe-escena/` (**el campo de la ESCENA no se toca**), el home, los seis frozen, `introTimeline.ts`, `introSampling.ts`, `introFlight.ts`, `introSilhouette.ts`, `introRig.ts`, `IntroParticleCanvas.tsx`, `IntroOverlay.tsx`, y los reportes de S8/S8d/S8e/S9/S10/S11/S12/S13.

**Cero dependencias nuevas. Cero `any`. Cero `setState` por frame. Nada de base de datos. Blanco y negro.**

**Ningún archivo nuevo pasa de 300 líneas.** Los dos que quedan arriba son los heredados de siempre: `introSampling.invariant.ts` (449) e `introTimeline.ts` (419), los dos sin tocar. `introParticles.invariant.ts` llegó a 321 con los cambios y **se partió**: el color salió a su propia suite y quedó en 245.

---

## 11 · Anotado, no implementado

- **Las dos perillas se juzgan por grabación.** Vecinos de `INTRO_DUST_SCALE`: **1,35** si se leen demasiado grandes (ahí lo que llega al punto del clásico es la mediana, no el p10) · **2,4** si todavía se leen chicas. `INTRO_DUST_SHARE` no tiene banda propia: si el campo se lee ralo, sube; si se lee sucio, baja.
- **El bokeh quedó sin tocar y sigue apenas visible** (1,13:1 de contraste, 76 motas). Si el humano lo quiere ver o lo quiere sacar, es una perilla distinta y un sprint distinto: `BOKEH_COUNT` y `BOKEH_OPACITY` viven en la escena y tocarlos la tocaría a ella.
- **El `shift` de la caída dejó de estar prohibido por la banda.** No se cambió nada: `linear` sigue siendo lo correcto por el argumento del mínimo. Pero si alguna vez se quiere un carácter distinto en la salida, hoy el número ya no lo impide.
- **`introParticleTint.ts` no tenía suite propia hasta hoy.** La tiene desde que el módulo existe, con las cuatro comprobaciones que estaban en `introParticles.invariant.ts` y sus mismas cifras.
- **La cámara de `harness.ts`** sigue pendiente — `DIRECCION-ESCENA.md` §7.15. Es `probe-escena/`, fuera de scope.
- **El intro sigue sin ser verificable por automatización**, y es deliberado.
