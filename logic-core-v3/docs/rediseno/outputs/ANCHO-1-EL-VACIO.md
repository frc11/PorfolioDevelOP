# ANCHO-1 · EL VACÍO — por qué el reparto del hero se rompe en los anchos grandes

**Sprint de MEDICIÓN. No se construyó nada**: ni un token, ni una línea de
composición, ni una palanca aplicada. `choreography.ts`, `probeScene.ts`,
`theme-develop.css`, `hero/geometria.ts` y `Hero.tsx` quedan como estaban.

Worktree `C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre
`afff1e7f`. Puerto 3000, la receta canónica (`MEDICION-NAVEGADOR.md`).

**Instrumentos** (nuevos, `scripts-ancho1/`, leen y no escriben producto):

| archivo | qué hace |
|---|---|
| `scripts-ancho1/ancho1-comun.ts` | el banco: puerto, perfil de Chrome propio, los diez viewports en sus dos regímenes de alto |
| `scripts-ancho1/a-mancha.ts` | la medición en el píxel: la mancha, el borde de la tinta y el borde seguro |
| `scripts-ancho1/b-modelo.ts` | la cadena ejecutable + el control de equivalencia contra la cámara de producción |
| `scripts-ancho1/c-palancas.ts` | las palancas con su número y su costo |

**Salidas**: `outputs/ancho1/mancha.json`, `modelo.json`, `palancas.json`.
**Capturas**: `capturas/ancho1/`.

---

## 0. LA RESPUESTA, EN UNA PÁGINA

La hipótesis de la instrucción era *«la columna escala con la ventana y el logo
no, porque es un objeto a distancia fija de una cámara con fov fijo»*.

**Se confirma la mitad y se refuta la otra, y la mitad refutada es la que
importa.**

- ✅ **El logo es un objeto a distancia fija de una cámara de fov fijo.** Medido:
  `CAMERA_FOV = 35` (`probeScene.ts:208`), `distance: 19` en el keyframe `hero`
  (`choreography.ts:250`), y **nadie escribe `camera.fov`, `camera.aspect` ni
  `updateProjectionMatrix` en la escena de `/v3`**.
- 🔴 **Pero de ahí NO se sigue que el logo no escale con la ventana.** El `fov`
  es **vertical**, así que el tamaño en píxeles del logo sale de
  `altoViewportPx / (2 · tan(fov/2) · profundidad)`: **escala con el ALTO.** Y
  como los viewports reales crecen en los dos ejes a la vez, entre 1920×1080 y
  2560×1440 **el logo crece exactamente lo mismo que la ventana**: ×1,3333 los
  dos, y ocupa el **32,14 % → 32,15 %** del ancho. No cae un punto.
- 🔴 **Y la columna tampoco escala con la ventana.** La tinta del titular mide
  **550 px a 1920 y 550 px a 2560**: idéntica. La rampa `--text-fluido-display`
  topa **exactamente en 1920 px** de ventana (`theme-develop.css:719`,
  `clamp(37px, 1.8504rem + 1.9718vw, 67.4648px)` → el tope se alcanza en
  W = 1920,0). De ahí para arriba el titular está congelado.

**La causa real, con número.** El borde izquierdo del logo es **una fracción del
cuadro** y el borde derecho de la tinta es **un origen fijo más un ancho con
techo**. Las dos velocidades, medidas:

| tramo | el borde del logo | el borde de la tinta | razón |
|---|---|---|---|
| 1440×900 → 1920×1080 | **0,5697 px** por píxel de ventana | **0,1583 px** | **3,6×** |
| 1920×1080 → 2560×1440 | **0,4980 px** por píxel de ventana | 0,4500 px, y **ninguno es tinta nueva**: la tinta no crece, lo que se mueve es el arranque de la columna cuando `max-w-tope` la recentra | — |

Y **la resta que decide todo**: el hueco de 1920 menos el de 1440 vale **197,5
px** hoy, y en el barrido completo de escala, distancia y lente **se mueve entre
162,4 y 222,2 px**. Ninguna palanca de la escena la lleva a cero, porque todas
son perillas **uniformes** y el defecto no lo es (§3.6).

---

## 1. PASO 1 — CUÁNTO CUADRO OCUPA EL LOGO, POR ANCHO

### 1.1 Con qué se midió

La mancha es `siluetaMasGrande(S, tinta < 60, área ≥ 5.000)` sobre **S, la sala
desnuda** (todo oculto menos `[data-escena]`) — los umbrales de
`scripts-b8/c-bloques.ts`, que son los que `s10-logo` nombra y con los que B8 y
B11 publicaron. El búfer de WebGL no se lee desde la página: toda cifra sale de
`Page.captureScreenshot` de lo compuesto.

### ⚠ 1.2 Los DOS regímenes de alto, y por qué son dos

`s10-referencias.ts:51-68` es explícito: *«el alto no es una propiedad del
ancho»*, y declara los altos aparte, cada uno con su fuente. La instrucción da
seis **anchos** y ningún alto. Emparejarlos a ojo metería seis números
inventados en la tabla que contesta la pregunta. Así que van los dos:

- **Régimen de alto FIJO (900)** — los seis anchos con **un** alto declarado: el
  de referencia de escritorio de S0, *«con el que se compuso todo»*
  (`ALTOS_DECLARADOS`). Es la única forma honesta de barrer el ancho: con el
  alto clavado, la única variable es la que la instrucción pregunta.
- **Régimen de PARES DECLARADOS** — los viewports que este repo ya midió o ya
  publica. **1600 no entra**: no hay un solo archivo del repo que le declare un
  alto, y se dice en vez de inventarlo.

### 1.3 Régimen de alto FIJO — 900 px, los seis anchos

| ancho | aspecto | mancha (px) | **% del ancho del viewport** | % del cuadro (área) | x₀ … x₁ |
|---|---|---|---|---|---|
| 1024 | 1,138 | **no aplica** | **no aplica** | — | — |
| 1280 | 1,422 | 507 | **39,61 %** | 6,86 % | 567 … 1073 |
| 1440 | 1,600 | 510 | **35,42 %** | 6,18 % | 682 … 1191 |
| 1600 | 1,778 | 514 | **32,13 %** | 5,61 % | 797 … 1310 |
| 1920 | 2,133 | 524 | **27,29 %** | 4,82 % | 1025 … 1548 |
| 2560 | 2,844 | 551 | **21,52 %** | 3,91 % | 1477 … 2027 |

**1024 no es un cero: es un «no aplica».** `_lib/compuerta.ts:89`
(`ESCENARIO_MIN_ANCHO_PX = 1025`) no monta el canvas abajo del umbral y el
bundle ni se descarga. Verificado en la corrida, no supuesto:
`document.querySelectorAll('[data-escena]').length === 0` en los dos perfiles de
1024, y **la captura en reposo pesa exactamente lo mismo que la del texto solo**
(44.744 bytes las dos a 1024×768): ocultar la escena no cambió un píxel porque no
hay escena que ocultar. Con `escenas === 0` el instrumento ni saca la captura de
sala desnuda y publica `null`, en vez de escribir un 0 al lado de las demás filas.

**Con el alto clavado, el porcentaje cae de 39,61 % a 21,52 %: la hipótesis se
confirma con el número.** Y se confirma con el de al lado: **de 1280 a 2560 la
ventana creció ×2,00 y la mancha ×1,087.**

### 1.4 Régimen de PARES DECLARADOS — y acá la hipótesis se rompe

| viewport | aspecto | procedencia del alto | mancha (px) | **% del ancho** | x₀ … x₁ |
|---|---|---|---|---|---|
| 1024×768 | 1,333 | `scripts-b4/perfiles.ts` | **no aplica** | **no aplica** | — |
| 1280×800 | 1,600 | `introLanding.invariant.ts:48-52` | 454 | **35,47 %** | 606 … 1059 |
| 1440×900 | 1,600 | `scripts-b4/perfiles.ts` | 510 | **35,42 %** | 682 … 1191 |
| 1600×? | — | **sin alto declarado en el repo** | — | — | — |
| 1920×1080 | 1,778 | `scripts-b4/perfiles.ts` | 617 | **32,14 %** | 956 … 1572 |
| 2560×1440 | 1,778 | `scripts-b11/b11-comun.ts`, `PERFIL_2560` | 823 | **32,15 %** | 1275 … 2097 |

**Los dos pares de control lo dicen solos:**

| par | aspecto | ancho | alto | la mancha | la fracción |
|---|---|---|---|---|---|
| 1280×800 → 1440×900 | **igual** (1,600) | ×1,125 | ×1,125 | **×1,125** | 35,47 % → **35,42 %** |
| 1920×1080 → 2560×1440 | **igual** (1,778) | ×1,3333 | ×1,3333 | **×1,3333** | 32,14 % → **32,15 %** |

**La ley, medida y no supuesta: la fracción del cuadro que ocupa el logo es una
función de la RELACIÓN DE ASPECTO, y su tamaño en píxeles escala exacto con el
ALTO.** Con el aspecto quieto, el logo escala con la ventana igual que
cualquier otra cosa.

### 1.5 Veredicto del paso 1

> **La hipótesis se confirma en su conclusión y se refuta en su causa.**
>
> El porcentaje **sí** cae al crecer el ancho — pero **sólo cuando cae porque
> creció el ASPECTO**. De 1920×1080 a 2560×1440 la ventana crece 33 % y el
> porcentaje **no se mueve** (32,14 → 32,15). «El logo no escala con la
> ventana» es falso: escala con el alto, y los monitores crecen en los dos ejes.
>
> **Entonces el hueco de once veces no lo explica el logo solo.** La otra mitad
> —la que la hipótesis daba por sentada— es que **la columna tampoco escala**:
> la tinta mide 550 px a 1920 y 550 px a 2560. Ver §4.

---

## 2. PASO 2 — QUÉ GOBIERNA ESE TAMAÑO, LEÍDO DEL ÁRBOL

### 2.1 La cadena completa, eslabón por eslabón

| # | eslabón | archivo:línea | ¿depende del ancho? |
|---|---|---|---|
| 1 | La compuerta monta el escenario desde 1025 | `src/app/v3/_lib/compuerta.ts:89` (`ESCENARIO_MIN_ANCHO_PX`), `:92` (`CONSULTA_ESCENARIO`) | **sí, como interruptor** |
| 2 | El envoltorio del canvas ocupa el viewport entero | `_lib/compuerta.ts:124` (`fixed inset-0 z-0 pointer-events-none`), aplicado en `_lib/escena/EscenaDelHome.tsx:118` | — (fija la caja del canvas = viewport) |
| 3 | El `<Canvas>` y sus props de cámara | `_lib/escena/ProbeStage.tsx:170-182` | no |
| 4 | **El fov, VERTICAL y constante** | `_lib/escena/configuracionDelCanvas.ts:35-40` → `_lib/escena/probeScene.ts:208` — `CAMERA_FOV = 35` | **no** |
| 5 | **La escala del objeto** | `_lib/escena/ProbeLogo.tsx:162` — `<group scale={PROBE_SVG_SCALE}>`; `probeScene.ts:27` — `PROBE_SVG_SCALE = 0.007` | **no** |
| 6 | El modelo: SVG extruido, no GLB | `ProbeLogo.tsx:58` (`useLoader(SVGLoader, '/logodevelOP.svg')`), `:72-91` (`ExtrudeGeometry`) | no |
| 7 | La caja de la tinta, en viewBox | `src/components/ui/LogoMark.tsx:61-66` — `978,459 × 680,67` | no |
| 8 | **La pose del hero** | `_lib/escena/choreography.ts:248-250` — `{ angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 }` | **no** |
| 9 | La cámara por cuadro: posición + `lookAt` | `_lib/escena/OrbitRig.tsx:483-489` | no |
| 10 | **El encuadre lateral — el ÚNICO lugar donde entra el ancho** | `OrbitRig.tsx:496-506` → `state.size.width / max(1, state.size.height)` | **SÍ — y sólo como `aspect`** |
| 11 | El encuadre mueve el **TARGET**, no la cámara | `_lib/escena/cameraFraming.ts:46-75`; `:61` `halfHeight = tan(CAMERA_FOV/2)·eyeDistance`; `:62` `halfWidth = halfHeight · aspect`; `:67-74` `camera.lookAt(AIM_TARGET)` | sí, vía `aspect` |
| 12 | El recorrido del encuadre | `_lib/escena/encuadre.ts:79-81` — `abs(medioCuadro − caja/2) · FRAME_TRAVEL_SAFETY`; `probeScene.ts:231` — `0.88` | sí, vía `halfWidth` |

**El censo de `state.size` / `useThree(viewport)` / `camera.fov` /
`updateProjectionMatrix` en la escena de `/v3` devuelve UN solo lugar:
`OrbitRig.tsx:499`.** Y entra como `aspect`, o sea sólo al `travelX` del
encuadre. Nada de la escena lee el ancho para escalar.

### 2.2 La fórmula efectiva, y la consecuencia

```
pxPorUnidadDeMundo = altoViewportPx / (2 · tan(35°/2) · profundidad)   [scene-camera.ts:181]
anchoDeLaTintaPx   = 978,459 · 0,007 · pxPorUnidadDeMundo              [scene-framing.ts:111-113]
profundidad        ≈ hypot(distance = 19, height = 6,4) = 20,0489      [OrbitRig.tsx:502]
```

**El ancho de la ventana no aparece.** Aparece el ALTO. Y `aspect` entra sólo en
el **corrimiento lateral**, que es lo que mueve el borde izquierdo del logo hacia
la derecha a medida que la ventana se ensancha.

**⚠️ Y `frameX` ROTA la cámara, no la traslada** (el antecedente de V3-E,
confirmado acá): `cameraFraming.ts:67-74` mueve el **target** en la base de
pantalla y hace `lookAt`. Por eso la mancha medida crece un poco al ensanchar la
ventana con el alto clavado (507 → 551 px de 1280 a 2560): no es que el objeto
crezca, es que la cámara lo mira más de costado y la perspectiva lo estira. La
distancia no cambia; el tamaño angular tampoco.

### 2.3 El control de equivalencia — esto no es una lectura, es una corrida

`scripts-ancho1/b-modelo.ts` contiene una cámara **parametrizada por `fov`**, y
antes de publicar una sola cifra se comprueba que con `fovDeg = CAMERA_FOV`
devuelve **lo mismo que `sceneCameraAt` + `projectScenePoint` + `frameScenePose`,
hasta el último bit**:

```
la cámara parametrizada contra la de producción, 40 comparaciones:
peor diferencia 0.000e+0 → IDÉNTICAS
```

Y contra el píxel real (el borde izquierdo de la tinta proyectada contra el
borde izquierdo de la mancha medida en el navegador):

| viewport | modelo (izquierda) | navegador (x₀ de la mancha) | diferencia |
|---|---|---|---|
| 1280×800 | 606,8 | 606 | **0,8 px** |
| 1280×900 | 568,4 | 567 | 1,4 px |
| 1440×900 | 682,7 | 682 | **0,7 px** |
| 1600×900 | 796,8 | 797 | 0,2 px |
| 1920×900 | 1024,4 | 1025 | 0,6 px |
| 1920×1080 | 956,1 | 956 | **0,1 px** |
| 2560×900 | 1477,4 | 1477 | 0,4 px |
| 2560×1440 | 1274,9 | 1275 | **0,1 px** |

Sub-píxel en cinco de ocho. **La cadena leída del árbol y el píxel de la pantalla
son el mismo número**, así que todo lo que se calcula abajo sobre la cadena vale
sobre el sitio. (El *ancho* de la mancha sale ~3,5 % mayor que el de la caja de
tinta plana: la silueta es la del mesh **extruido con bisel** visto en escorzo, y
la caja proyectada es la de la tinta plana. La diferencia es constante y no
afecta el borde izquierdo, que es el que decide.)

### 2.4 Qué de esta cadena alimenta `scene-framing.ts` — o sea el ATERRIZAJE DEL PRELOADER

`scene-framing.ts` **no lo importa nadie de la escena viva**: es la cadena del
preloader. Pero lee de la misma raíz que la escena:

| lo que `scene-framing.ts` consume | de dónde |
|---|---|
| `SCENE_ENTRY_POSE` | `scene-framing.ts:144` = **`CHOREO_KEYFRAMES[0].pose`** — el keyframe `hero`, el mismo que la escena dibuja |
| `CAMERA_FOV`, `ORBIT_TARGET_Y`, `PROBE_SVG_SCALE`, `FRAME_TRAVEL_SAFETY` | `probeScene.ts`, vía `scene-camera.ts:74` y `:181` |
| `LOGO_INK_VIEWBOX` | `LogoMark.tsx:61-66` |

Y de él cuelgan **catorce** archivos, entre ellos todo el intro:
`introFlight.ts:2`, `introLanding.invariant.ts:4`, `introParticles.invariant.ts:11`,
`introParticleProbe.ts:34`, `introParticleLanding.ts:22`, `introParticleField.ts:25`,
`IntroLogoCanvas.tsx:14`, `scene-camera.invariant.ts:4`,
`s8-intro.invariant.ts:27`, `s13b-encuadre.ts:35`, `s16-encuadre.invariant.ts:64`,
`scene-framing.invariant.ts:37`, `scene-framing-aproximacion.ts:20`,
`scene-encuadre-deuda.ts:22`.

**Traducido: `CAMERA_FOV`, `PROBE_SVG_SCALE` y la `distance` del keyframe `hero`
alimentan el aterrizaje del preloader. El ancho de la columna y el arranque de la
columna NO.**

### 2.5 Archivos CONGELADOS de la cadena

Fuente de verdad: `CLAUDE.md`, tabla **Frozen files**, cuatro entradas.

| archivo | regla | ¿está en la cadena del logo de `/v3`? |
|---|---|---|
| `src/components/3d/HeroArtifact.tsx` | **Never modify** | **No.** Es el artefacto del hero legacy. Usa el mismo SVG y la misma escala literal `0.007` (`:121`) pero no participa de `/v3` (`ProbeLogo.tsx:12-24` explica por qué se hizo uno nuevo). ⚠ Si `PROBE_SVG_SCALE` cambiara, este literal **no lo sigue**, y el archivo no se puede tocar para sincronizarlo. |
| `src/context/TransitionContext.tsx` | siempre `triggerTransition()` | no |
| `src/context/PreloaderContext.tsx` | no romper el flujo de fases | no directamente; sí el intro que consume `scene-framing.ts` |
| `prisma/schema.prisma` | `migrate reset` prohibido | no |

**Ninguno de los archivos que gobiernan el tamaño del logo de `/v3` está en la
tabla de congelados.** Hay, sí, tres cuasi-congelados con la prohibición escrita
en el propio código y que conviene nombrar porque la instrucción pregunta por lo
intocable:

- `src/lib/scene-camera.ts` — *«SITIO-S12 tiene prohibido editar»*
  (`scene-camera-medida.ts:5-7`). Por eso sobrevive el `Math.max(0, …)` de
  `:127-129` mientras `encuadre.ts:80` ya usa `Math.abs`. **En la pose del hero
  los dos coinciden** —`halfWidth` es 7,19 y media caja del mesh 3,43, o sea el
  argumento es positivo en los cuatro aspectos— y la coincidencia está
  comprobada empíricamente: el modelo (que usa `max`) da el mismo borde que el
  navegador (que corre `abs`), con 0,1 px de diferencia a 1920 y 2560.
- `_lib/escena/EscenaDelHome.tsx:53-57` — *«No cambia un valor de la escena»*,
  custodiado por `s8-escena.invariant.ts`.
- `_lib/escena/configuracionDelCanvas.ts:9-14` y `ataduraAlScroll.ts:25` —
  verbatim por mudanza.

### ⚠ 2.6 UN HALLAZGO DE ESTE PASO: el `fov` está duplicado a mano y SIN GUARDIÁN

`src/app/probe-escena/__tests__/harness.ts:19-21`:

```ts
/** `CAMERA_FOV` de `probeScene.ts`. Se repite acá para no arrastrar three. */
export const FOV = 35
export const TAN_HALF_V = Math.tan(((FOV / 2) * Math.PI) / 180)
```

El repo ya sabe hacer esto bien: `_lib/motion/lente.ts:51` declara su espejo de
`CAMERA_FOV` **y `s19-lente.invariant.ts:35` lo afirma igual**, con su control
positivo al lado. **El de `harness.ts` no tiene ese guardián**: se buscó en todo
`src/` y no hay una sola afirmación que compare `harness.FOV` con `CAMERA_FOV`.

**Por qué importa para este sprint.** De `TAN_HALF_V` y `halfFovDeg` cuelgan
**16 archivos** —entre ellos `s10-logo.ts`, `s10-logo-encuadre.ts`, `cuadro.ts`,
`camaraDelCuadro.ts`, `s16-encuadre-soporte.ts`, `frameProbe.ts` y siete
invariantes del probe—. O sea: **si alguien mueve `CAMERA_FOV`, toda esa familia
de instrumentos sigue midiendo con la lente vieja y se queda en VERDE mientras la
escena cambió.** Es exactamente la clase de falla que este repo ya bautizó
«verde por arnés». Se reporta y **no se arregla acá**: no es scope de este
sprint.

---

## 3. PASO 3 — LAS PALANCAS, CON SU COSTO. NINGUNA SE APLICA

### 3.0 Cómo se calculó el costo sobre `test:s15e-intro-aterrizaje`

La instrucción lo pide con número, así que va primero, y va con su control.

**El §1 de ese invariante es una IDENTIDAD, no una medición.** Compara
`sampleLogoPose(planIntroFlight(w,h), T, 1)` contra `frameSceneEntry(w,h)`. Y
`planIntroFlight` **saca su destino de `frameSceneEntry`** (`introFlight.ts:80`):

```
centro(1) = origen + (destino − origen) · lugar(1)
```

Medido en la corrida: **`lugar(1) = 1`** exacto (origen x 720 → destino x
939,708 a 1440×810). Entonces la diferencia es `origen + (destino − origen)·1 −
destino ≡ 0` **para cualquier destino**.

> 🔴 **La respuesta al pedido de la instrucción: los 0,0000 px de
> `test:s15e-intro-aterrizaje` §1 siguen siendo 0,0000 px con cualquier valor de
> `fov`, de `distance` o de `PROBE_SVG_SCALE`, en los tres anchos.** No es que la
> palanca sea barata: es que **ese invariante no puede detectarla**. Las dos
> mitades de su resta leen la misma función.

Lo que **sí** se mueve es el **§2**, que compara la proyección en perspectiva de
la escena contra la caja ortográfica del preloader. Ahí la lente sí interviene.
El instrumento de este sprint reproduce el §2 con su propio control de
equivalencia (contra la corrida real de hoy):

| ventana | cuña, corrida real | cuña, este instrumento | peor esquina, real | peor esquina, acá |
|---|---|---|---|---|
| 1440×810 | 470 − 434 = 36 | **35,33** | 28,3 px | **28,3 px** |
| 1920×1080 | 626 − 579 = 47 | **47,11** | 37,7 px | **37,7 px** |
| 1280×800 | 460 − 426 = 34 | **34,37** | 24,5 px | **24,5 px** |

Coincide. Las dos comprobaciones del §2 que pueden ponerse en rojo son
`cuña > 1 px` y `|Δalto| < 1 px`. Hoy `|Δalto|` vale 0,145 / 0,193 / 0,213 px.

### 3.1 Palanca (a) — EL ANCHO MÁXIMO DE LA COLUMNA

| | |
|---|---|
| **archivo** | `src/app/v3/_secciones/hero/geometria.ts:41-48` (`columnasDeLaMedida: 3`, `columnasTotales: 5`, `claseDeLaMedida`) y `:80-82` (`columnasDeLaCajaDelTitular: 3`, `columnasDelTitular: 2`) |
| **¿alimenta el aterrizaje del preloader?** | **No.** |
| **instrumentos en rojo** | `test:s5-hero` §12b — afirma `caja == 478,4 px a 1440` contra `GEOMETRIA.anchoDeLaCajaDelTitularA1440Px` y `lineas == 1`; `hero.invariant.tsx:279-290`; `s3-banda-consecuencias.ts` |

🔴 **Y el hallazgo que la vuelve inútil: de 1440 para arriba esta palanca es
INERTE.** La línea 1 entra en UN renglón, así que su tinta mide `tamaño ×
avance` y **no depende de la caja**. La caja ya sobra:

| viewport | caja del titular | tinta pintada | **SOBRA** | `--text-fluido-display` |
|---|---|---|---|---|
| 1280×800 | 414,4 px | 302,0 px | 112,4 px | 54,845 px |
| 1440×900 | 478,4 px | 474,0 px | **4,4 px** | 58,000 px |
| 1920×1080 | 670,4 px | 550,0 px | **120,4 px** | 67,465 px |
| 2560×1440 | 696,0 px | 550,0 px | **146,0 px** | 67,465 px |

Ensanchar la columna agrega aire a la derecha del renglón y **no mueve un píxel
de tinta**. Achicarla parte el renglón: el bloque se vuelve más alto, más
angosto y **más lejos** del logo. En los dos sentidos, empeora o no hace nada.

### 3.2 Palanca (b) — EL ARRANQUE DE LA COLUMNA

| | |
|---|---|
| **archivos** | `theme-develop.css:957` (`--pad-lateral-compacto: 32px`), `:956` (`--columna-lateral: 140px`), `:959` (`--grilla-canal-amplio: 16px`), `:883` (`--container-tope: 1920px`), ensamblados en `_componentes/layout/Envoltorio.tsx:58,64` + `Grilla.tsx:52` + `Hero.tsx:166,179` |
| **¿alimenta el aterrizaje del preloader?** | **No.** |
| **instrumentos en rojo** | `test:s1-tokens` — `tokens.invariant.ts` afirma el bloque de tokens **literal**; `test:s3-layout`; y todo lo que deriva el 188 (`s10-logo-columna.ts:14-19`, `s10-logo-cajas.ts`) |

La aritmética del 188 y del 476, derivada y no escrita:

```
1440:  32 (pad) + 140 (columna lateral) + 16 (canal)                       = 188
2560:  32 (pad) + (2496 − 1920)/2 = 288 (`mx-auto` dentro de `max-w-tope`)
        + 140 + 16                                                        = 476
1024:  32 (pad) + 140 + 12 (canal COMPACTO: `escritorio:` no aplica)       = 184
```

Mueve la tinta **uno a uno**. El corrimiento que cada cuadro necesitaría para
quedar con el hueco de 1440:

| viewport | arranca en x | corrimiento necesario |
|---|---|---|
| 1280×800 | 188 | **+97 px** |
| 1440×900 | 188 | 0 |
| 1920×1080 | 188 | **+198 px** |
| 2560×1440 | 476 | **+229 px** |

🔴 **Un número fijo no sirve: el que cierra 1920 mete la tinta 178 px adentro del
logo a 1440.** Esta palanca **sólo cierra si el corrimiento depende del ancho** —
o sea si la columna deja de estar anclada al canal izquierdo del documento y pasa
a leer dónde está el logo. Es una palanca real, pero es un cambio de
**arquitectura de anclaje**, no un número. Y toca **las ocho secciones**, no el
hero: los tres tokens son del sistema.

### 3.3 Palanca (c) — LA ESCALA DEL OBJETO

| | |
|---|---|
| **archivo** | `_lib/escena/probeScene.ts:27` — `PROBE_SVG_SCALE = 0.007`, aplicado en `ProbeLogo.tsx:162` |
| **¿alimenta el aterrizaje del preloader?** | **SÍ.** `scene-framing.ts:111-113` lo multiplica, y `introLanding.invariant.ts:2` lo importa directo. También `introParticle*` y `IntroLogoCanvas.tsx`. |

El barrido (el hueco = borde izquierdo del logo − borde de la tinta; negativo =
el titular queda **encima** del logo):

| escala | ×hoy | 1280×800 | 1440×900 | 1920×1080 | 2560×1440 |
|---|---|---|---|---|---|
| 0,0049 | ×0,70 | 211 | 126 | 345 | 418 |
| 0,0060 | ×0,857 | 161 | 71 | 278 | 329 |
| **0,0070** | **hoy** | **117** | **21** | **218** | **249** |
| 0,0080 | ×1,143 | 72 | **−29** 🔴 | 158 | 169 |
| 0,0090 | ×1,286 | 28 | **−79** 🔴 | 98 | 89 |
| 0,0105 | ×1,50 | **−39** 🔴 | **−154** 🔴 | 8 | **−31** 🔴 |

🔴 **Costo sobre `test:s15e-intro-aterrizaje`:**
- **§1 — el 0,0000 px NO se mueve. Queda en 0,0000 px en los tres anchos.**
  (Ver §3.0: la resta es una identidad.)
- **§2 — se pone EN ROJO a partir de ~0,0098.** Medido: a `0.0105` el `|Δalto|`
  sube a **1,391 / 1,855 / 1,378 px** contra el `< 1 px` que la comprobación
  exige, en las tres ventanas. A `0.009` queda en 0,748 / 0,997 / 0,778: **verde
  por 3 milésimas de píxel en 1440×810.**

**Otros instrumentos:** `s10-logo` §3 (*«el logo entra ENTERO en el cuadro»*)
**aguanta todo el barrido** — a `0.0105` el peor margen sigue siendo +50,1 px en
1025×900. `test:s13e-camara` y `test:s8e-encuadre` no lo afirman contra un valor.
Y ⚠ `HeroArtifact.tsx:121` lleva el `0.007` **literal** y está **congelado**: no
se puede sincronizar.

**Veredicto:** para llevar el hueco de 1920 a los 20 px de 1440 haría falta
≈ 0,0104 — y ahí **a 1440 el titular queda 154 px adentro del logo**.

### 3.4 Palanca (d1) — LA DISTANCIA DE CÁMARA

| | |
|---|---|
| **archivo** | `_lib/escena/choreography.ts:250` — `distance: 19` del keyframe `hero` |
| **¿alimenta el aterrizaje del preloader?** | **SÍ, y es el caso más directo:** `scene-framing.ts:144` — `SCENE_ENTRY_POSE = CHOREO_KEYFRAMES[0].pose`. Mover esa distancia mueve el destino del vuelo. |

| distancia | 1280×800 | 1440×900 | 1920×1080 | 2560×1440 |
|---|---|---|---|---|
| 14 | 23 | **−85** 🔴 | 91 | 79 |
| 16 | 66 | **−37** 🔴 | 149 | 157 |
| **19** | **117** | **21** | **218** | **249** |
| 22 | 156 | 65 | 271 | 319 |
| 26 | 195 | 109 | 325 | 391 |
| 30 | 225 | 143 | 365 | 445 |

🔴 **Costo sobre `test:s15e-intro-aterrizaje`:**
- **§1 — 0,0000 px se queda en 0,0000 px.**
- **§2 — EN ROJO a partir de `distance ≲ 14,5`.** Medido a `14`: `|Δalto|` sube a
  **1,247 px (1920×1080)** y **1,092 px (1280×800)**, contra `< 1 px`. A `16`
  queda verde (0,455 / 0,607 / 0,565).

**Otros instrumentos:** ⚠ mover la distancia del keyframe `hero` **recalibra la
escena entera**, no sólo el hero — `s16-techo` (techo de velocidad en altos de
cuadro), `s10-logo` §7 (recorridos del encuadre), `s13b-escena`, `s18-*` y la
familia del probe. Y `choreography.ts:247` deja escrito que esa pose se juzga
**por grabación**, no por número.

**Veredicto:** para llevar 1920 a 20 px haría falta ≈ 11-12 — con 1440 ya
colisionando desde 17 para abajo.

### 3.5 Palanca (d2) — EL `fov`

| | |
|---|---|
| **archivo** | `_lib/escena/probeScene.ts:208` — `CAMERA_FOV = 35` |
| **quién lo consume** | `configuracionDelCanvas.ts:36` (la prop del `<Canvas>`), `cameraFraming.ts:61` (la escena viva), `scene-camera.ts:74` → `scene-framing.ts` (**el preloader**), `scene-camera-medida.ts:58`, `scene-encuadre-deuda.ts:60` |
| **¿alimenta el aterrizaje del preloader?** | **SÍ.** |

| fov | 1280×800 | 1440×900 | 1920×1080 | 2560×1440 |
|---|---|---|---|---|
| 26 | 4 | **−106** 🔴 | 66 | 47 |
| 30 | 62 | **−41** 🔴 | 145 | 151 |
| **35** | **117** | **21** | **218** | **249** |
| 40 | 158 | 67 | 273 | 322 |
| 46 | 195 | 109 | 323 | 389 |

🔴 **Costo sobre `test:s15e-intro-aterrizaje`:**
- **§1 — 0,0000 px se queda en 0,0000 px.**
- **§2 — VERDE en todo el barrido 26…46.** La cuña crece al cerrar la lente
  (46,56 px a fov 26) y el `|Δalto|` se queda entre 0,016 y 0,567 px. **Este
  invariante no frena esta palanca por ningún lado.**

**Los que SÍ se ponen en rojo:**
- **`test:s19-lente`** — `s19-lente.invariant.ts:35` afirma
  `FOV_DE_LA_ESCENA === CAMERA_FOV` (el espejo de `_lib/motion/lente.ts:51`).
  Rojo inmediato si se mueve uno sin el otro. **Es el único guardián sano de esta
  constante.**
- Y ⚠ **los que se quedan VERDE sin tener derecho**: los 16 archivos que cuelgan
  de `harness.FOV = 35` (§2.6). `s10-logo`, `s16-encuadre`, `cuadro.ts`,
  `frameProbe.ts` y siete invariantes del probe **seguirían midiendo a 35°**.
  Antes de tocar `CAMERA_FOV` hay que cerrar esa duplicación.

**Veredicto:** para llevar 1920 a 20 px haría falta ≈ 23° — con 1440 colisionando
más de 100 px.

### 3.6 🔴 LA CIFRA QUE MATA A (c) Y (d): la resta 1920 − 1440

«Cerrar el hueco a 1920 sin abrirlo a 1440» es, literalmente, **llevar esta resta
a cero**:

| palanca | hueco 1440 | hueco 1920 | hueco 2560 | **1920 − 1440** |
|---|---|---|---|---|
| **HOY** | 20,7 | 218,1 | 248,9 | **197,5 px** |
| fov 26 | −106,3 | 66,4 | 46,5 | 172,6 |
| fov 30 | −40,5 | 145,0 | 151,4 | 185,5 |
| fov 40 | 66,7 | 273,0 | 322,0 | 206,3 |
| fov 46 | 108,8 | 323,1 | 388,8 | 214,3 |
| distance 14 | −85,4 | 90,6 | 78,9 | 176,1 |
| distance 16 | −36,7 | 149,2 | 156,9 | 185,9 |
| distance 22 | 64,6 | 271,0 | 319,3 | 206,4 |
| distance 26 | 109,1 | 324,5 | 390,7 | 215,4 |
| distance 30 | 142,7 | 364,9 | 444,6 | 222,2 |
| escala 0,0049 | 126,1 | 344,8 | 417,8 | 218,7 |
| escala 0,0060 | 70,8 | 278,4 | 329,2 | 207,6 |
| escala 0,0080 | −29,4 | 158,0 | 168,6 | 187,4 |
| escala 0,0090 | −79,4 | 97,9 | 88,6 | 177,4 |
| escala 0,0105 | −154,4 | 8,0 | −31,4 | 162,4 |

> **La resta vale 197,5 px hoy y en TODO el barrido se mueve entre 162,4 y 222,2
> px.** Escala, distancia y lente son perillas **uniformes**: agrandan o achican
> el logo en los cuatro cuadros a la vez. El defecto **no es uniforme** —es que
> el logo y el texto crecen a velocidades distintas—, así que **ninguna de las
> tres lo cierra**, ni forzada.

### 3.7 Palanca (e) — LA RAMPA TIPOGRÁFICA. La que el barrido encontró y la instrucción no nombra

| | |
|---|---|
| **archivos** | `theme-develop.css:719` — `--text-fluido-display: clamp(37px, 1.8504rem + 1.9718vw, 67.4648px)`; `:742` — `--text-fluido-display-xl: clamp(67px, 3.3732rem + 3.4742vw, 120.6761px)` |
| **¿alimenta el aterrizaje del preloader?** | **No.** |
| **instrumentos en rojo** | `test:s1-tokens` — `tokens.invariant.ts:229` y `:233` afirman **la cadena literal del `clamp`**; es la puerta de control de cambios del tema, y ponerse en rojo ahí es su función, no una avería. `test:s5-hero` §12b — el 58 px se **deriva** de la caja de 478,4 y del avance del `.woff2`; `test:s3-tipografia`; `test:s16-tipografia` |

**Es la única palanca que puede igualar las dos velocidades del §0.** Los
números:

```
hoy:        pendiente 1,9718vw, techo 67,4648 px alcanzado EXACTAMENTE en W = 1920
            → el borde de la tinta corre ~0,161 px por píxel de ventana (0,1583 medido
              entre 1440 y 1920), y CERO arriba de 1920

para igualar al logo (0,498 px/px): pendiente 6,094vw — 3,09× la de hoy — y SIN techo
            → a 2560 el titular mediría 106,5 px en vez de 67,5
```

⚠ **El techo en 1920 no es casual: es `--container-tope`.** La banda fluida topa
donde topa el contenedor (`theme-develop.css:633-685`, §961-975, y la decisión de
V3-C). O sea que esta palanca **no es un retoque de un token: es reabrir la
decisión de dónde termina la banda fluida**, que ya se tomó una vez con su
medición al lado.

### 3.8 Resumen de palancas

| palanca | archivo | ¿alimenta el aterrizaje? | ¿cierra 1920 sin abrir 1440? | en rojo |
|---|---|---|---|---|
| (a) ancho de la columna | `hero/geometria.ts:41-48,80-82` | no | **no — es INERTE arriba de 1440** | `s5-hero` §12b |
| (b) arranque de la columna | `theme-develop.css:956,957,959,883` + `Envoltorio/Grilla/Hero` | no | **sólo si depende del ancho** (cambio de anclaje, no un número) | `s1-tokens`, `s3-layout` |
| (c) escala del objeto | `probeScene.ts:27` | **sí** | **no** (resta 162–219 px) | `s15e` §2 desde ~0,0098 · **`s15e` §1 queda en 0,0000** |
| (d1) distancia de cámara | `choreography.ts:250` | **sí** | **no** (resta 176–222 px) | `s15e` §2 desde ≲14,5 · **§1 queda en 0,0000** · recalibra la escena entera |
| (d2) `fov` | `probeScene.ts:208` | **sí** | **no** (resta 172–214 px) | `s19-lente` · **`s15e` §1 y §2 quedan VERDES** · ⚠ 16 instrumentos quedan verdes por `harness.FOV` |
| (e) rampa tipográfica | `theme-develop.css:719,742` | no | **sí, en principio** — es la única que iguala las velocidades | `s1-tokens` (por diseño), `s5-hero` §12b, `s3-tipografia`, `s16-tipografia` |

---

## 4. PASO 4 — EL OTRO EXTREMO: LA TABLA QUE LE FALTA AL SISTEMA

`s10-logo` mide **superposición**, no cercanía, y por eso ve verde: a 1440 hay 20
px de aire y la superposición es cero. Tiene razón. Lo que no existía es un
número para «cerca» — ni para «lejos», que es el defecto de este sprint.

**La vara.** «Borde seguro» es el término que B1 definió (`B1-DELTAS.md` §4,
citado en `hero/geometria.ts:50-79`): *la primera columna de píxeles en la que
más del 10 % de la banda vertical del texto deja la tinta `#111111` por debajo de
AA (4,5:1)*. No es «el primer píxel oscuro»: la sala tiene motas por toda la
pantalla y un punto de 3 px no vuelve ilegible un renglón. «Tinta hasta» es la
última columna con glifo adentro de la caja del titular, medida sobre la captura
del texto solo.

### 4.1 Régimen de alto FIJO (900)

| ancho | tinta hasta x | borde seguro x | **distancia** | ancho de la tinta |
|---|---|---|---|---|
| 1024 | 592 | **no aplica** (sin escena) | — | 408 |
| 1280 | 490 | 568 | **78 px** | 302 |
| 1440 | 662 | 682 | **20 px** | 474 |
| 1600 | 687 | 797 | **110 px** | 499 |
| 1920 | 738 | 1025 | **287 px** | 550 |
| 2560 | 1026 | 1477 | **451 px** | 550 |

### 4.2 Régimen de PARES DECLARADOS

| viewport | arranque de la columna | tinta hasta x | borde seguro x | **distancia** | ancho de la tinta |
|---|---|---|---|---|---|
| 1024×768 | 184 | 592 | **no aplica** | — | 408 |
| 1280×800 | 188 | 490 | 607 | **117 px** | 302 |
| 1440×900 | 188 | 662 | 682 | **20 px** | 474 |
| 1600×? | — | — | **sin alto declarado** | — | — |
| 1920×1080 | 188 | 738 | 956 | **218 px** | **550** |
| 2560×1440 | **476** | 1026 | 1275 | **249 px** | **550** |

**Los tres números de la instrucción se reproducen.** La instrucción daba
664 / 683 / 19 px a 1440 y 741 / 957 / 216 px a 1920; el instrumento da
**662 / 682 / 20** y **738 / 956 / 218**. Uno a dos píxeles: es la misma
medición, hecha de nuevo. Y **el «once veces» también**: 218 / 20 = **10,9×**,
con la ventana creciendo 33 %.

### 4.3 Lo que la tabla deja ver, y `s10-logo` no podía

1. **1440 es el caso más apretado de los seis, y no por casualidad.** Es el ancho
   para el que la composición se derivó: `geometria.ts:160` declara
   `anchoDeLaCajaDelTitularA1440Px: 478.4` y el tamaño 58 px sale de dividir esa
   caja por el avance de la cara. Los 20 px de aire son el residuo de esa cuenta.
   **Toda la composición del hero está calibrada a UN ancho.**
2. **Y 1440 es el techo de la rampa vieja.** `--fluido-techo: 1440px`
   (`theme-develop.css:977`) sigue declarado mientras la banda real llega a
   `--container-tope: 1920` (la decisión de V3-C). Entre 1440 y 1920 la
   tipografía crece; de 1920 para arriba, no.
3. **La no-monotonía entre 1280 y 1440 tiene causa y está escrita.** A 1280 el
   hueco es 117 px y a 1440 baja a 20: porque **abajo de 1425,5 px la línea 1 no
   entra en un renglón y parte en dos** (`geometria.ts:161-163`, el cruce
   declarado en `theme-develop.css`). Partida, la tinta mide 302 px en vez de 474.
   No es que a 1280 esté mejor compuesta: está partida.
4. **De 1920 para arriba lo único que se mueve es el recentrado.** La tinta mide
   550 px en los dos; el arranque salta de 188 a 476 porque `max-w-tope` +
   `mx-auto` centran la banda. Por eso el hueco crece sólo 31 px de 1920 a 2560
   —el recentrado le regala 288 px a la tinta— mientras el logo se corre 319.

**No se escribe un invariante nuevo**, como la instrucción pide. La tabla queda
acá, con su vara nombrada y reproducible (`npx tsx scripts-ancho1/a-mancha.ts`),
para que el sprint que decida el arreglo la use como línea de base.

---

## 5. CAPTURAS

En `docs/rediseno/capturas/ancho1/`, el hero **en reposo** (scroll 0, escena
asentada, puntero al centro, preloader apagado con la marca de sesión):

| archivo | viewport | procedencia del alto |
|---|---|---|
| `hero-reposo-1280x800.png` | 1280×800 | `introLanding.invariant.ts:48-52` |
| `hero-reposo-1600x900.png` | 1600×900 | ⚠ 1600 no tiene alto declarado: va con el de referencia de escritorio (900) |
| `hero-reposo-1920x1080.png` | 1920×1080 | `scripts-b4/perfiles.ts` |
| `hero-reposo-2560x1440.png` | 2560×1440 | `scripts-b11/b11-comun.ts` |

Y las dos de **la sala desnuda**, que son la evidencia de la máscara — el cuadro
del que sale la mancha, con todo lo demás oculto:

| archivo | qué muestra |
|---|---|
| `sala-desnuda-1440x900.png` | el caso apretado: la mancha arranca en x 682 |
| `sala-desnuda-1920x1080.png` | el caso del defecto: la mancha arranca en x 956 |

---

## 6. LO QUE SE ENCONTRÓ Y ESTÁ FUERA DE SCOPE

1. **🔴 `harness.ts:19-21` duplica `CAMERA_FOV` a mano y no tiene guardián.** 16
   instrumentos cuelgan de esa copia. Ver §2.6. El patrón correcto ya existe en
   el repo (`lente.ts:51` + `s19-lente.invariant.ts:35`). **No se arregló.**
2. **Secciones que desbordan su pantalla en algunos viewports.** El detector de
   B5 (`scripts-b5/pagina.ts:92-115`) exige que los ocho paneles midan múltiplos
   exactos del viewport, y eso **no se cumple** en tres de los diez perfiles
   medidos. Leído en la corrida, estable en seis reintentos (o sea: no es el dev
   server recompilando):

   | viewport | paneles fuera de grilla |
   |---|---|
   | 1280×800 | 1641 (+41), 896 (+96), 878 (+78) |
   | 1600×900 | 910 (+10) |
   | 1920×900 | 1903 (+103), 989 (+89) |

   Por eso `a-mancha.ts` **no usa** ese detector: usa el que contesta lo que aquél
   quería contestar (ocho paneles + `--container-tope` resuelto + fuentes
   cargadas) y **publica los desvíos en cada fila** en vez de tirar. Los desvíos
   son un defecto de otro dueño. **No se arreglaron.**
3. **El detector de B5 tira sobre una página sana abajo de 1025.** A 1024×900 las
   secciones crecen con su contenido (2.902, 2.763, 2.085 px) porque el layout es
   otro. Es una limitación del instrumento, no del sitio.
4. **`--fluido-techo: 1440px` sigue declarado mientras la banda llega a 1920.** No
   es un error —V3-C lo documentó— pero el nombre del token dice otra cosa que el
   comportamiento, y este sprint se tropezó con eso al buscar dónde topa la rampa.
5. **`DEST_WIDTH_MARGIN = 0.86` sólo vive del lado del preloader**
   (`scene-framing.ts:50-57`, que ya lo declara como deuda: *«la escena va a
   necesitar el mismo clamp y tiene que leerlo de acá»*). En los cuatro cuadros
   medidos el recorte vale ×1,000, o sea **hoy no muerde** — pero si alguna
   palanca de (c)/(d) agrandara el logo, el preloader se recortaría y la escena
   no, y las dos siluetas dejarían de coincidir.
6. **`HeroArtifact.tsx:121` lleva el `0.007` literal y está congelado.** Si
   `PROBE_SVG_SCALE` cambia, no lo sigue, y no se puede tocar para sincronizarlo.

---

## 7. VERIFICACIÓN

| comprobación | resultado |
|---|---|
| `npx tsc --noEmit` | **0 errores** (⚠ `npm run build` falla A PROPÓSITO en este árbol: la llave `CONTENIDO_INVENTADO` y el guardián de `prebuild`) |
| `npx prisma migrate status` | 86 migraciones · **Database schema is up to date!** |
| `test:s5-hero` | 124 afirmaciones, 0 fallas |
| `test:s1-tokens` | 52 afirmaciones, 0 fallas |
| `test:s10-logo` | 41 afirmaciones, 0 fallas (4 fuera de ventana, verde parcial declarado) |
| `test:s16-encuadre` | 21 afirmaciones, 0 fallas |
| `test:s16-techo` | 16 afirmaciones, 0 fallas |
| `test:s13e-camara` | 7 en verde, 0 en rojo |
| `test:s8e-encuadre` | 40 en verde, 0 en rojo |
| `test:s15e-intro-aterrizaje` | **18 en verde, 0 en rojo** — los 0,0000 px de §1 en las tres ventanas |
| `test:s15e-intro-relevo` | 77 en verde, 0 en rojo |
| `test:s3-tipografia` | 45 afirmaciones, 0 fallas |
| `test:s16-tipografia` | 38 afirmaciones, 0 fallas |
| `test:s19-lente` | 26 afirmaciones, 0 fallas — el guardián del espejo de `CAMERA_FOV` |

Todo lo de arriba es **la línea de base de HOY**, corrida antes y después de la
medición. No se tocó producto, así que no podía moverse — y se corre igual para
que el sprint que aplique una palanca tenga contra qué comparar.
