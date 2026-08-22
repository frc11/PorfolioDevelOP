# S8d — Secuencia simplificada del preloader

> Continuación directa de S8, S8b y S8c. Los cuatro sprints viven en los mismos
> archivos y se commitean juntos.

---

## 1 · La secuencia, y el timeline nuevo

Siete beats en fila, sin golpes:

```
0,00 ──────────────────────────────── arranca el trazo (blanco sobre oscuro)
0,60  entra "develOP"
0,66  entra el slogan
1,26  las letras quedan quietas            (0,14 s antes del cierre)
1,40 ──────────────────────────────── cierra el trazo
1,75 ──────────────────────────────── relleno completo
     ░░ la espera ░░
2,35 ──────────────────────────────── arranca la TRANSFORMACIÓN DE COLOR
2,65    la tinta empieza a invertir       (34% central de la ventana)
2,72    ▸ RELEVO 2D→3D                    (18% central · 9 cuadros)
2,88    ◂
2,95    la tinta terminó de invertir
3,25 ──────────────────────────────── se va la letra
3,85 ──────────────────────────────── y recién ahí, se va el fondo
4,55 ──────────────────────────────── arranca el ACOMODAMIENTO
8,15 ──────────────────────────────── el logo está en su lugar
```

Las siete perillas:

| perilla      | valor  | qué es |
|--------------|-------:|--------|
| `strokeS`    | 1,40 s | el trazo dibuja el logo en blanco; sobre el final entran las letras |
| `fillS`      | 0,35 s | el contorno se completa y la tinta lo llena |
| `holdS`      | 0,60 s | la espera, con el lockup completo |
| `colorS`     | 0,90 s | **la transformación de color**, con el relevo 2D→3D adentro |
| `letterOutS` | 0,60 s | se va la letra |
| `veilOutS`   | 0,70 s | y después el fondo |
| `placeS`     | 3,60 s | **el acomodamiento** |
| **total**    | **8,15 s** | contra 5,03 s en S8c |

### Justificación de los cuatro defaults nuevos

**`holdS` bajó de 1,0 a 0,6.** En S8b y S8c era larga porque tenía que crear la
tensión que el chasquido descargaba. Sin chasquido no hay tensión que construir,
solo un estado terminado que se deja leer: 0,6 s es `MOTION_DURATION.elemento`,
el tiempo que el sistema considera suficiente para que algo se registre.

**`colorS = 0,9 s.** Por debajo de ~0,4 s el ojo reconstruye una transición de
color como un salto, que es exactamente lo que S8d vino a eliminar. 0,9 s la deja
leer sin que se estire.

**`veilOutS = 0,7 s.** Un poco más que la letra (0,6 s): lo que se disuelve acá
es toda la pantalla, no un elemento.

**`placeS = 3,6 s.** El humano reportó que a 3 s todavía se veía rápido, y la
causa no era solo la duración: **era la curva.** S8c usaba un expo-out que cubría
el 28% del camino en los primeros 90 ms, o sea ~690 px/s **desde el primer
frame**. Un arranque violento se lee como velocidad por más que el gesto dure.

Con `MOTION_EASE.shift` (ease-in-out) el gesto sale de quieto y llega a quieto.
Su pendiente máxima medida es 2,735, así que sobre los 371 px de desktop el pico
queda en **282 px/s** —y en el medio del gesto, no al principio—, con la rotación
a 23,5°/s. Menos de la mitad del arranque anterior, repartido sobre 3,6 s.

**Sobre los 8,15 s.** Es largo, y hay que decirlo: son 3,1 s más que S8c. El
acomodamiento solo se lleva el 44% de la secuencia. **Si molesta, la primera
perilla que yo tocaría es `placeS`**, y después `veilOutS`. Todo con los sliders,
sin tocar código. El preloader no bloquea el scroll ni un frame, así que la
duración es una decisión estética y no un costo de espera.

---

## 2 · El logo no cambia de tamaño

Es la regla que reordena el módulo entero. **El tamaño de la tinta se lee del
destino** —el primer keyframe de la coreografía, proyectado a píxeles por
`lib/scene-framing.ts`— y es constante durante toda la secuencia.

| ventana   | tinta | texto (título/slogan/gap) | destino | recorrido |
|-----------|-------|---------------------------|---------|-----------|
| 1440×810  | 523×364 | 80 / 27 / 31 px | (1086, 466) = 75%, 58% | 371 px |
| 1920×1080 | 698×486 | 107 / 36 / 41 px | (1448, 621) = 75%, 58% | 494 px |
| 390×844   | 335×233 | 51 / 17 / 20 px | (195, 422) = 50%, 50% | **0 px** |

**El texto se derivó del logo, no de la ventana.** Es la inversión de S8b/S8c: el
logo lo fija la escena, así que si el texto siguiera saliendo de los tokens de
tipografía las proporciones internas del lockup cambiarían con la resolución. Con
`INTRO_LOCKUP_TEXT` (0,22 / 0,075 / 0,085 del alto de la tinta) el lockup ocupa
el **68% del alto en los dos desktops y el 42% en mobile** — misma proporción
donde importa. Las clases del sistema se conservan y solo se pisa el `font-size`:
interlineado, peso y tracking son relativos al `em` y escalan solos.

⚠️ **En mobile el recorrido es CERO.** El `fov` de la cámara es vertical, así que
en una ventana angosta el encuadre no tiene margen lateral para correr el logo
(`travelX` da 0) y el destino cae en el centro exacto. **El acomodamiento ahí es
una rotación en el lugar, no un bug.** La comprobación estática lo contempla
explícitamente en vez de dividir por cero.

---

## 3 · (c) El cruce 2D→3D durante una transición

### El problema que había que resolver primero

"El fondo va de oscuro a claro **y** el logo de blanco a negro" tiene una
consecuencia geométrica: los dos arrancan en valores opuestos y terminan en los
opuestos cambiados, así que **por el teorema del valor intermedio son iguales en
algún instante**. En ese instante el logo tiene el color exacto del fondo y
desaparece. No se puede evitar con dos recorridos continuos de luminancia — lo
único elegible es **cuánto dura**.

### La solución: tres ventanas concéntricas

```
│───────────── colorS: el FONDO se transforma (0,90 s) ─────────────│
        │──── INK_FLIP_FRAC 34%: la TINTA invierte (0,31 s) ────│
              │─ SWAP_FRAC 18%: el RELEVO 2D→3D (0,16 s) ─│
```

El fondo se transforma despacio —eso es lo que se ve— y la tinta lo **cruza
rápido por el medio**. Medido sobre la secuencia entera, con la razón de
contraste de WCAG:

| |  |
|---|---|
| contraste al arrancar la transformación | **18,0 : 1** |
| contraste al terminarla | **17,6 : 1** |
| mínimo de toda la secuencia | **1,07 : 1**, a los 2,730 s |
| cuadros a 60 fps por debajo de 1,10 | **1** |
| cuadros por debajo de 1,25 | **1** |

Un solo cuadro. Y el control negativo mide qué pasaría si alguien ensanchara la
ventana de la tinta "para que se vea más suave": con la tinta usando la ventana
entera, los cuadros flojos se multiplican, y la comprobación se pone roja.

### Cómo se garantiza que la silueta coincida

Dos cosas, y ninguna es una calibración:

1. **Las dos capas pintan el MISMO string de color.** `sampleInkColor` devuelve
   un `#RRGGBB`; ese string va al `fill` del SVG **y** entra al canvas como
   `MotionValue`, donde `solveEmissiveForSrgb` lo convierte en la emisiva del
   material. No son dos interpolaciones que haya que mantener sincronizadas — es
   la misma. La comprobación verifica los 401 puntos del recorrido de la tinta
   **byte por byte**: el mesh renderiza exactamente el color que el SVG pinta, en
   todos.
2. **El relevo cae en el mínimo de contraste.** Durante un cruce con alfa la
   cobertura baja hasta el 75% en el peor punto (`1 − p(1−p)`); ese déficit solo
   se puede ver como diferencia entre el logo y el fondo, y ahí es la más chica
   de toda la secuencia. La comprobación exige que el mínimo caiga **adentro** de
   la ventana del relevo: mide 1,07:1 a los 2,730 s, y el relevo va de 2,719 a
   2,881 s.

La base geométrica sigue siendo la de S8b: cámara **ortográfica con `zoom: 1`**,
donde el frustum de r3f está en píxeles CSS y una unidad de mundo es un píxel. El
mesh se escala por `alto en px / alto de la tinta en unidades de viewBox`, así que
su silueta es la del path. Lo único que asoma es el bisel de 1 unidad por lado —
sub-píxel a estos tamaños.

**El fallback no cambió:** si el mesh no llegó, el relevo queda en 0 y **el SVG
hace la transformación entera**, de blanco a negro igual que el mesh habría hecho.
El acomodamiento ocurre igual. Lo único que se pierde es el volumen y la sombra.

---

## 3bis · El salto al rellenarse (ajuste posterior a la verificación en pantalla)

### La causa

No era de la secuencia sino **de SVG**: un `stroke` se pinta **centrado sobre el
borde** del path, así que la mitad de su ancho queda por FUERA de la región que
el `fill` cubre. Mientras el contorno estaba prendido la silueta era `path + 3,5`
unidades de viewBox; al apagarse pasaba a ser `path`. Medido:

| ventana | salto por lado | ancho total que se perdía |
|---|---:|---:|
| 1440×810 | **1,87 px** | 3,74 px |
| 1920×1080 | 2,50 px | 4,99 px |
| 390×844 | 1,20 px | 2,40 px |

### Por qué el arreglo es un clip y no otra cosa

La restricción que decide es la que marcaste: **la silueta del relleno tiene que
seguir coincidiendo con la del mesh 3D.** Y el mesh no se puede mover:
`IntroLogoCanvas` lo escala por `inkHeightPx / LOGO_INK_VIEWBOX.height`, o sea
mapea el **path** a `inkHeightPx`, que es exactamente lo que `scene-framing.ts`
proyecta como destino. Cambiar esa escala desalinearía el logo del preloader del
logo de la escena cuando la escena se monte en el home.

O sea: **el SVG tiene que pintar exactamente el path.** Eso descarta las demás:

| enfoque | silueta final | ¿calza con el mesh? |
|---|---|---|
| dejar el contorno prendido, del color del relleno | `path + 3,5` | **no** — habría que agrandar el mesh y romper el calce con la escena |
| `paint-order` | `path + 3,5` | no — cambia el orden de pintado, no la extensión |
| `stroke-alignment: inner` | `path` | sería ideal, pero **ningún navegador lo implementa** (quedó en el borrador de SVG 2) |
| achicar el ancho hasta que su mitad sea sub-píxel | `path + ε` | no — deja de ser un trazo visible |
| **clipear el contorno contra la propia silueta** | **`path`** | **sí, sin tocar nada más** |

El clip es el `stroke-alignment: inner` que el navegador no tiene, hecho a mano:
el trazo se declara al **doble** de ancho (7 → 14 unidades) y se recorta contra
el mismo `d` que rellena, así que sobrevive solo la mitad de adentro. **El grosor
aparente queda igual** que el que ya habías aprobado en pantalla (7 unidades =
3,74 px en 1440×810), la línea se corre 3,5 unidades hacia adentro, y el borde
exterior de lo dibujado **ES** el borde de la silueta final.

Efecto secundario bueno: el SVG dejó de pintar fuera de su caja, así que ya no
necesita `overflow: visible` — verificado en el HTML prerenderizado.

### El calce con el mesh: verificado y explícito

**No cambió, y ésa es la idea.** El SVG pinta el path con desfase **0**; el mesh
asoma `PROBE_EXTRUDE.bevelSize` = **1 unidad de viewBox** por lado, que es su
bisel — geometría real del objeto, no un error. En píxeles:

| ventana | tinta | asoma el mesh |
|---|---:|---:|
| 1440×810 | 364 px | **0,53 px** |
| 1920×1080 | 486 px | 0,71 px |
| 390×844 | 233 px | 0,34 px |

Sub-píxel en las tres, como estaba documentado desde S8b. **El arreglo no tocó
la escala del mesh** — la comprobación lo verifica leyendo el código del canvas.
Lo que eliminó son las 3,5 unidades del trazo, que sí se veían.

### La comprobación

`introSilhouette.invariant.ts`, 60 comprobaciones:

- **Los dos cuadros que pediste:** en `fillEnd ± 1/60 s`, primero verifica que
  esos cuadros efectivamente straddleen el apagado (si no, no estaría mirando el
  momento) y después que la silueta sea **idéntica**. En las once calibraciones.
- Y que no cambie en **ningún** otro instante: barrido completo.
- **Que el 0 no sea una mentira:** lee `IntroLogoStroke.tsx` y exige que exista
  el `<clipPath>`, que recorte con el **mismo** `d` que rellena (tres
  ocurrencias: relleno + contorno + recorte), que el contorno esté adentro del
  grupo recortado y que ya no haya `overflow: visible`.
- **El calce con el mesh**, sub-píxel en las tres ventanas, más la lectura del
  canvas para confirmar que la escala no se movió.
- **Controles negativos que miden el bug**, no que lo declaran: el modelo
  `centrado 7` reproduce el salto tal como se vio (1,87 px por lado) y
  `centrado 14` mide qué pasaría si alguien sacara el clip hoy (3,74 px). Los dos
  tienen que dar salto > 1 px, y el modelo vigente exactamente 0.

---

## 4 · (d) Desplazamiento y rotación, simultáneos

En S8c eran **dos curvas distintas sobre la misma ventana** —expo-out para la
posición, `arrive` para la rotación— y por eso se leía como dos movimientos
pegados: la posición salía disparada mientras la rotación todavía arrancaba.

Ahora hay **un solo número**. `samplePlace` alimenta el desplazamiento *y* la
revelación *y* la entrada en la luz. Que arranquen y terminen juntos no es una
calibración que se pueda desajustar: es que son el mismo valor.

La comprobación no verifica que dos curvas "coincidan" —eso sería frágil—: para
cada instante, cada calibración y cada ventana, exige que

```
pose.dxPx === Δx × samplePlace(t)      pose.dyPx === Δy × samplePlace(t)
pose.reveal === samplePlace(t)
```

Se compara componente por componente y no por distancia recorrida, precisamente
porque en mobile el desplazamiento es cero y dividir por él daría `NaN` — una
comprobación que pasa sin comprobar nada.

---

## 5 · La luz y la sombra, durante el acomodamiento

`sampleInkShading(reveal)` cuelga del mismo número, así que la transición de
"plano sin luz" a "iluminado por la escena" ocurre **exactamente durante el gesto
final**, ni antes ni después:

| | reveal 0 | reveal 1 |
|---|---|---|
| emisiva plana | entera | apagada |
| key / fill / hemisférico | 0 / 0 / 0 | 4,6 / 1,35 / 2,1 (los de la escena) |
| sombra | 0 | `INTRO_SHADOW.opacity` |

Con `reveal` en 0 **no hay una sola luz encendida**, que es lo que conserva el
arreglo del especular de S8c: iluminar de frente pone `dotNH = 1` sobre toda la
cara —el pico del lóbulo GGX— y con `INK_ROUGHNESS` en 0,34 la cara salía en
#D9D9D9. Sin luces no hay especular posible.

### ⚠️ La sombra es lo único que no pude verificar

**No es la sombra de la escena, y no puede serlo.** La escena tiene un piso de
papel bajo una cámara en perspectiva; el canvas del intro es un rig ortográfico
en espacio de píxeles, donde un piso horizontal quedaría de canto e invisible.
Montar la escena está fuera de este sprint.

Lo que hay es una **sombra proyectada sobre un plano detrás del logo, con la
dirección real de la principal de la escena** (azimut −42°, elevación 36°): cae
abajo y a la derecha, a ~0,9 y ~0,98 de `INTRO_SHADOW.distancePx` (90 px). Le da
peso al objeto y es coherente con la luz que lo ilumina.

Es un `ShadowMaterial` sobre un plano del tamaño del canvas, con `PCFShadowMap` y
`shadow.radius` — el mismo tipo de mapa que el probe, por la razón que
`ProbeStage.tsx` documenta. **`INTRO_SHADOW.opacity` en 0 la apaga entera**, y ésa
es la perilla si en pantalla molesta o si aparece un artefacto.

Digo explícitamente que **no la pude ver**: `CLAUDE.md` tiene una cicatriz sobre
canvas transparentes que se ven bien en estático y fallan en runtime (el cuadrado
oscuro del EffectComposer). Ese caso era de buffers internos del composer y éste
no usa composer, pero la regla de método es no dar por bueno lo que no se miró.

---

## 6 · (e) Qué se eliminó

Del código:

| eliminado | dónde vivía |
|---|---|
| `INTRO_SNAP_PEAK` y todo el cálculo del pico | `introTimeline.ts`, `introFlight.ts` |
| `INTRO_SETTLE_EASE` (el expo-out) | `introTimeline.ts`, `introSampling.ts` |
| `INTRO_LOCKUP_LOGO` y `introLockupInkSize()` | el lockup ya no se dimensiona desde la ventana |
| `sampleSnap`, `sampleShrink`, `sampleReveal` | `introSampling.ts` |
| `destinationScale` | `introFlight.ts` |
| `groupScale` y el canal de escala entero | `useIntroChannels.ts`, `IntroLockup.tsx` |
| perillas `snapHoldS` y `shrinkS` | `HomeIntroPhases` |
| campos `snapAtS`, `shrinkStartS`, `shrinkEndS`, `fadeOutStartS`, `fadeOutDurationS` | `IntroTimeline` |
| `meshShown` (0\|1) → `meshOpacity` (0→1) | el relevo dejó de ser un escalón |
| fases `'chasquido'` y `'achicamiento'` | `introPhaseName` |
| las marcas `GRUPO … /GRUPO` del lockup | ya no hay unidad que escalar |
| el botón "⏮ golpe" y las lecturas de pico/clamp/escala | `IntroDevController.tsx` |

De las comprobaciones: las secciones del chasquido, de la espera post-golpe, del
achicamiento en el lugar y de "el conjunto escala como unidad" — con sus
controles negativos. La comprobación de escala se **invirtió**: donde antes
exigía que hubiera exactamente un `scale:` en `IntroLockup.tsx`, ahora exige que
no haya **ninguno**.

Nuevo, en su lugar: `IntroSceneLights.tsx` (el rig, separado para que el canvas
no pase de 300 líneas) e `IntroShadowPlane.tsx`.

---

## 7 · Sobre el preview

`/probe-escena?intro` sigue funcionando igual, con **⌥I** para el controlador.

**No se pudo ocultar el logo de la escena mientras el preview corre.** No existe
ningún control para eso: `ProbeLogo` se monta dentro de `ProbeStage` sin flag ni
entrada en `probeStore`, así que esconderlo implicaría tocar la escena, que el
sprint prohíbe. Queda anotado, y el sprint ya lo daba por esperable: van a
convivir los dos logos hasta que la escena se monte en el home.

---

## 8 · (a) Verificación

```
tsc --noEmit                      exit 0
eslint (tocados + dependientes)   exit 0, 0 warnings
introTimeline.invariant            99 en verde, 0 en rojo
introSampling.invariant           141 en verde, 0 en rojo
introFlight.invariant              92 en verde, 0 en rojo
introShading.invariant             28 en verde, 0 en rojo
introSilhouette.invariant          60 en verde, 0 en rojo
scene-framing.invariant            23 en verde, 0 en rojo
                                 ─────────────────────────
                                  443 comprobaciones
npm run build                     exit 0
```

Todas corren contra **once calibraciones**: la de default, un intro corto, uno
largo, y el caso de mover una sola perilla — una por una.

Las cuatro propiedades que la instrucción pide por escrito:

| propiedad | dónde | cómo |
|---|---|---|
| **el tamaño del logo es constante** | flight | 601 puntos × 11 calibraciones × 3 ventanas: el alto de la tinta es el mismo número siempre, y es el del destino. Más el chequeo de fuente: **cero `scale:`** en `IntroLockup.tsx` |
| **la letra termina antes de que el fondo empiece** | timeline + sampling | `veilOutStartS === letterOutEndS` exacto; y muestreado: el velo está **entero** hasta ese instante, y de la letra no queda nada cuando arranca |
| **desplazamiento y rotación arrancan y terminan juntos** | flight | son el mismo número, verificado componente por componente |
| **ninguna calibración rompe el orden** | timeline | seis predicados × once calibraciones, más siete timelines rotos a mano como controles negativos |

**443 comprobaciones no dicen que se vea bien.** El intro no corre bajo
automatización (`navigator.webdriver`): la transformación y el acomodamiento solo
se juzgan a ojo.

---

## 9 · Ni un byte en producción

Grep sobre el build, **restringido a `.js` ejecutable** (los `.js.map` son source
maps del server, no código):

```
NEGATIVOS (0)                      POSITIVOS (control)
  IntroDevController      0          M532 700v-67        5 archivos
  intro · controlador     0          data-home-intro     2 archivos
  IntroPreview            0          Ingenier            3 archivos
  IntroSceneLights        0          NeutralToneMapping  1 archivo
  sale letra              0
  SIN DESTINO             0        HTML prerenderizado de "/":
  fallback SVG            0          data-home-intro-overlay  1
  acomodo                 0          el path del logo         2
  ▶ reproducir            0          "develOP"                3
  ⏺ relevo                0          el script pre-paint      1
```

`three` **no viaja en la carga inicial del home**: de los 23 chunks que la página
prerenderizada pide, ninguno contiene `WebGLRenderer`.

---

## 10 · (f) Archivos

**Nuevos (4)**

```
home-intro/IntroSceneLights.tsx   110   el rig de la escena entrando con el acomodamiento
home-intro/IntroShadowPlane.tsx    69   el plano que recibe la sombra
home-intro/introSilhouette.ts     139   cuánto pinta cada capa por fuera del path
home-intro/introSilhouette.invariant.ts 184
```

**Reescritos (10)**

```
home-intro/introTimeline.ts       296   siete perillas, tres ventanas concéntricas
home-intro/introSampling.ts       219   colores, relevo, las dos salidas, el acomodamiento
home-intro/introFlight.ts         139   sin escala; la tinta sale del destino
home-intro/introShading.ts        185   el color de las dos capas + el cruce de luz
home-intro/useIntroChannels.ts    171   sin canal de escala; un solo string de color
home-intro/IntroLockup.tsx        100   el texto derivado del logo
home-intro/IntroLogoCanvas.tsx    244   emisiva desde el color, cruce con alfa, sombra
home-intro/IntroDevController.tsx 257   siete sliders, lectura nueva
home-intro/introTimeline.invariant.ts   196
home-intro/introSampling.invariant.ts   259
home-intro/introFlight.invariant.ts     223
home-intro/introShading.invariant.ts    226
```

**Retocados (6):** `IntroLogoStroke.tsx` (119, el clip) · `IntroOverlay.tsx` (75) · `IntroLogo3D.tsx` (58) ·
`useIntroEngine.ts` (200) · `HomeIntro.tsx` (178) · `introChecks.ts` (85)

**Sin tocar:** `page.tsx`, `layout.tsx`, `globals.css`, `useChromeRevealed.ts`,
`introBoot.tsx`, `introHandoff.ts`, `IntroLogoStroke.tsx`, `useViewportSize.ts`,
`scene-framing.ts`, `LogoMark.tsx`, `IntroPreview.tsx`, `ProbeEscena.tsx`, el
resto de `/probe-escena`, Route B, `DotMatrix` y los seis frozen.

Ningún archivo pasa de 300 líneas. Cero dependencias nuevas, cero `any`, cero
`setState` por frame.

---

## 11 · Anotado, no implementado

- **La sombra no está verificada a ojo.** `INTRO_SHADOW.opacity = 0` la apaga.
- **El contraluz del rig revelado.** En la escena el rim es solidario a la cámara;
  acá la cámara no se mueve.
- **El logo de la escena no se puede ocultar durante el preview** sin tocar la
  escena. Ver §7.
- **§7.6, el encuadre por relación de aspecto.** `DEST_WIDTH_MARGIN = 0,86` sigue
  en `scene-framing.ts` y **la escena tiene que leerlo de ahí, no
  reimplementarlo.**
- **Deuda consciente:** el home depende de tres módulos de `/probe-escena`
  (`choreography.ts`, `probeScene.ts`, `probeLighting.ts`) y de `bezier.ts`.
  Cuando la escena se monte en el home hay que decidir si se mudan a `lib`.
- **La duplicación preexistente del path del logo** en `LogoStrokeOverlay.tsx`
  (Route B), `Footer.tsx` y `public/logodevelOP.svg`. No se migró.
