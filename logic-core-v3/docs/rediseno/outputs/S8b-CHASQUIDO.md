# S8b-CHASQUIDO — Reporte de cierre

- **Fecha:** 2026-08-20 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S8b-chasquido.md` · se apila sobre S8 (`outputs/S8-PRELOADER.md`), que quedó sin commitear.
- **Verificación:** `tsc --noEmit` exit 0 · `eslint` exit 0 · **206 comprobaciones estáticas en verde** · `next build` exit 0 con la evidencia de que el controlador no viaja. **No autoconfirma que funciona porque compila**, y este componente **no se puede verificar por automatización**: el gate pre-paint incluye `navigator.webdriver !== true`.

---

## Qué cambió respecto de S8

Tres correcciones y una idea nueva que cambió la arquitectura del final.

| | S8 | S8b |
|---|---|---|
| El logo | SVG plano, y punto | **Es el logo 3D de la escena** desde el principio, de frente y con luz plana |
| El corte | relleno + color juntos | El relleno es una fase propia; **un segundo de espera**; y después el chasquido |
| El chasquido | corte de color | Corte de color **+ salto de escala + relevo 2D→3D**, en el mismo frame |
| El texto | opacidad **y 20 px** | **Solo opacidad.** Sin dirección, "como una nube" |
| El final | la capa se desvanece | El fondo se va y **el logo sigue volando** hasta la pose de la escena |
| El lockup | 160 px de caja | **Proporcional a la ventana** (~288 px de caja en desktop) |
| Calibración | recargar y borrar `sessionStorage` | **Un controlador** que reproduce, pausa y scrubea |
| Total | 3,2 s | **4,55 s** — pero con **3,20 s** de pantalla opaca, contra 3,83 s en S8 |

---

## El timeline

```
t=0,000  el trazo empieza                                    (linear, 1,400s)
t=0,600  "develOP"  — solo opacidad                          (0,600s, arrive)  → 1,200
t=0,660  slogan     — solo opacidad                          (0,600s, arrive)  → 1,260
         ── 0,140 s de quietud ──
t=1,400  el trazo CIERRA y arranca el relleno                (0,350s, arrive)
t=1,750  relleno completo  ═══ LA ESPERA ═══                 (1,000s, nada se mueve)
t=2,750  ═══ CHASQUIDO ═══  color + pico de escala + relevo 2D→3D, un frame
         y arranca el asentamiento                            (1,800s, expo-out)
t=3,200  se van fondo (0,630s) y texto (0,600s)   ← el logo va por el 82,6% del camino
t=3,830  el fondo ya no está                      ← el logo va por el 98,8%
t=4,550  el logo aterriza sobre la escena. FIN
```

**Cuatro perillas** en `introTimeline.ts` — `strokeS` 1,40 · `fillS` 0,35 · `holdS` 1,00 · `settleS` 1,80 — y todo lo de adentro derivado en **fracciones de su fase**. Consecuencia medida y verificada: **las perillas no pueden romper el orden.** El texto asienta al 90% del trazo y el velo arranca al 25% del asentamiento den lo que den los segundos. Lo único que puede romperlo es tocar una fracción, que vive en el código y no en el controlador.

**La secuencia dura más y tapa menos.** El velo se va *adentro* de la última fase, así que el visitante mira la página durante los últimos 1,35 s con el logo acomodándose encima.

---

## ⚠ La curva del asentamiento es expo-out. NO se corrige a `arrive`.

Tercera curva del vocabulario, aprobada con los números delante. Medido sobre 1,8 s:

| Curva | En el 20% del tiempo cubre | Llega al 90% |
|---|---|---|
| `arrive` `[.25,.46,.45,.94]` | 36,9% | 1,22 s |
| `shift` `[.4,0,.2,1]` | 13,4% | 1,14 s |
| **`INTRO_SETTLE_EASE` `[.16,1,.3,1]`** | **75,2%** | **0,59 s** |

Las dos curvas de S2 son curvas de **llegada** y arrancan despacio: no hacen lo que un aterrizaje hace. Esta cubre **el 28% del camino en los primeros 90 ms** y después se demora más de un segundo asentándose — que es exactamente el paso 9, "se acomoda en su lugar". Es una de las dos que el B1 de S2 relevó y descartó **para reveals**, y esto no es un reveal.

La comprobación estática la fija: si alguien la cambia a `arrive`, la sección 3 de `introSampling.invariant.ts` se pone en rojo con el mensaje "la curva es la aprobada y no se volvió a `arrive`".

*(La otra desviación, heredada de S8: el trazo va `linear`. La razón, con los números, está en el reporte de S8 y en el docblock de `introSampling.ts`.)*

---

## El chasquido: cinco cosas, un frame, por construcción

`progress` va de 0 a 1 lineal y **es la única animación viva de toda la secuencia**. Todo lo demás es una función pura de ese número. En el frame del chasquido cambian cinco cosas, y las cinco cuelgan del **mismo escalón sobre el mismo valor**:

1. El fondo `#0E0E0E` → `#F7F7F5`
2. La tinta `#F7F7F5` → `#111111`, en el logo **y** en las letras (una sola declaración de `color`, heredada por `currentColor`)
3. El contorno del trazo se apaga *(ya se había apagado al terminar el relleno; en el chasquido lo que queda es relleno puro)*
4. **La escala salta al pico**
5. **El SVG se apaga y el mesh se enciende**

No hay dos relojes, no hay `setTimeout`, no hay "±1 cuadro". Si el navegador pierde un frame, las cinco saltan juntas.

**El latcheo del relevo vive adentro del propio `useTransform`**, no en un suscriptor: los suscriptores de un MotionValue corren **después** de los valores derivados, así que un latch ahí llegaría un cuadro tarde — justo en el único cuadro que no se puede errar.

---

## Cómo se resolvió el 2D → 3D

### Cámara ortográfica en espacio de píxeles CSS

`<Canvas orthographic>` con `zoom: 1`: r3f pone el frustum en `[-w/2, w/2] × [-h/2, h/2]` **en píxeles CSS** (verificado contra `events-*.cjs.dev.js:514`), o sea **una unidad de mundo es un píxel**. Escalando el mesh por `alto en px / alto de la tinta en unidades de viewBox`, su silueta es la del path SVG **píxel por píxel**, sin calibración de por medio.

Dos razones para ortográfica y no perspectiva: **coincidencia exacta** con el SVG que reemplaza (con perspectiva habría que calzar fov, distancia y escala, y el canto crecería por parallax justo donde no tiene que verse), y **de frente y sin perspectiva los cantos son invisibles**, así que la pieza se lee plana sin trucos.

### El `viewBox` es la caja de la tinta

**La tinta no llena el cuadrado de 1024 y no está centrada en él.** Aplanando el path (cúbicas, cuadráticas y arcos elípticos por la parametrización de centro de la spec, 400 muestras por segmento) da:

```
x = 19,869 · y = 204,730 · ancho = 978,459 · alto = 680,670
centro (509,1 · 545,1) → 33,1 unidades POR DEBAJO del centro del cuadrado
```

Sobre un logo de 548 px eso son **18 px de desfase vertical**: la diferencia entre un relevo invisible y uno que se ve saltar. Con el `viewBox` recortado a la tinta, el path llena el elemento, el elemento **es** la caja de la tinta, y el mesh se escala a esa misma caja.

**Contraverificación:** sumándole el bisel de `PROBE_EXTRUDE` (1 unidad por lado) y escalando por 0,007 da **6,863 × 4,779** de mundo, contra los **6,86 × 4,78** que `PROBE-ESCENA.md` publica de la medición del mesh en runtime. Dos caminos independientes al mismo número, y la comprobación estática lo verifica.

### El canvas es de todo el viewport

El pico del chasquido es ~2,6× el lockup. Un canvas del tamaño de la caja, ampliado por CSS, **se vería borroso**. Acá el CSS no toca el canvas: el tamaño y la posición del logo los maneja la cámara, así que está nítido en cada frame — y además puede volar fuera de la caja del lockup.

### La luz plana y la revelación

Una direccional **en el eje de la cámara** (la cara se ilumina pareja, los cantos son perpendiculares a la vista y no reciben nada → se lee plano) que se apaga mientras se enciende la key lateral del rig de la escena (`KEY_AZIMUTH_DEG` −42°, `KEY_ELEVATION_DEG` 36°, leídos de `probeLighting.ts`), más un ambiente bajo. Material de la escena: `INK_COLOR` `#0F0F0F`, `INK_ROUGHNESS` 0,34, `metalness 0`.

Y el mesh **rota hasta presentar la cara que la escena va a mirar**: elevación 31,0°, derivada de la misma pose (`atan(altura / distancia)`). La rotación del objeto es la inversa del movimiento de la cámara. Cuando la escena tome el relevo, su logo ya está en esa pose.

### Sin eventos

`<Canvas style={{ pointerEvents: 'none' }}>`. r3f le pone `'auto'` a su propio div (`react-three-fiber.cjs.dev.js:151`) y por eso un `pointer-events: none` de un ancestro **no alcanza** — la lección ya documentada en `CLAUDE.md`. Pero el `...style` del usuario se aplica **después** (`:154-160`), así que esto sí gana. Con el div sordo, r3f no puede escribir `state.pointer` y no hay mouse-follow posible.

### La red de seguridad

**El preloader no espera al 3D en ningún caso.** Cero `await`, cero readiness gate, cero timeout. La capa se pide con `import()` al arrancar el intro y tiene los ~2,75 s de trazo + relleno + espera para llegar. En el frame del chasquido se pregunta **una vez**:

- **Llegó** → el SVG se apaga y el mesh se enciende, en el mismo frame.
- **No llegó** → todo sigue en SVG: el mismo chasquido, el mismo vuelo (un `transform` sobre un vector no pierde nitidez) y el mismo desvanecimiento. Lo único que se pierde es la revelación de volumen.

La respuesta se **latchea**: si el chunk termina de bajar a mitad de vuelo, no aparece de golpe. Verificado en el build: **`three` no viaja en la carga inicial del home**.

---

## El destino, leído de la coreografía

`src/lib/scene-framing.ts` — módulo nuevo, en `lib` y no en el preloader **a propósito**: es la matemática de encuadre de la escena, y el preloader es solo su primer consumidor.

Lee `CHOREO_KEYFRAMES[0].pose` y reimplementa la cámara del rig sin `three` (posición por azimut/altura/distancia, `lookAt` con el target corrido por `frameX`/`frameY`, y **proyección real**, no la aproximación lineal de S8, que erraba 5 px en X, 14 px en el alto y **61 px en Y**).

Con la pose base (`angleDeg 0 · height 9 · distance 15 · frameX 0,9`):

| Viewport | Lockup (tinta) | Destino (tinta) | Escala | Pico (×1,35) |
|---|---|---|---|---|
| 1440×810 | 274×190 px | **524×365 px @ (1086, 466)** | ×1,90 | ×2,57 |
| 1920×1080 | 365×254 px | 699×487 px @ (1448, 621) | ×1,90 | ×2,57 |
| 390×844 | 231×161 px | 525×366 → **clamp a 335×234** | ×1,45 | ×1,96 |

**El lockup es proporcional a la ventana** (`INTRO_LOCKUP_LOGO`: 23,5% del alto, con tope del 60% del ancho y piso de 96 px). Es lo que mantiene la escala del vuelo clavada en ×1,90 en cualquier desktop en vez de variar con la resolución.

**El logo termina más grande de lo que empezó.** El achicamiento del paso 6 es real y es el que se ve (−26% del pico al destino); el crecimiento neto respecto del lockup no se percibe como tal porque el pico se lo come.

### ⚠ `DEST_WIDTH_MARGIN = 0,86` — respuesta parcial a §7.6

En 390×844 la pose de entrada proyecta una tinta de **525 px de ancho sobre una pantalla de 390**: el logo desborda. No es un bug de este sprint — es el §7.6 que `PROBE-ESCENA.md` §235 ya tenía documentado como "un bug esperando", y **la escena lo va a sufrir igual**.

El clamp limita el ancho aparente de la tinta al 86% del ancho de la ventana. El valor es **el mismo `LOGO_WIDTH_MARGIN` que la calibración A de `logo-footprint.ts` ya usa**: no se inventa un número nuevo para el mismo problema.

> **La escena va a necesitar el mismo clamp y tiene que leerlo de `scene-framing.ts`, no reimplementarlo.** Del lado de la escena se aplica subiendo la distancia de cámara; del lado del preloader, achicando el destino. El resultado en pantalla es el mismo y el número tiene que ser uno solo. Cuando §7.6 se decida de verdad, se toca ahí y los dos lo heredan juntos.

---

## ⚠ Deuda consciente: el home depende de dos módulos del instrumento

`src/lib/scene-framing.ts` importa `choreography.ts` y `probeScene.ts`, e `introSampling.ts` importa `bezier.ts` — los tres de `src/app/probe-escena/_components/`, que es la ruta interna de diseño.

Leerlos está permitido y es lo correcto (el destino se lee del recorrido, no se hardcodea; y duplicar el evaluador de curvas sería peor). Pero **el home pasa a depender del instrumento de diseño**, y eso hay que decidirlo cuando la escena se monte: si esos módulos se mudan a `lib` o si el instrumento pasa a ser una dependencia legítima del sitio. Está escrito acá y en el docblock de los dos archivos **para que el sprint de la escena lo resuelva en vez de descubrirlo**.

**Lo que cuesta hoy, medido sobre el build:** la coreografía viaja en la carga inicial del home en un chunk de **7.203 bytes sin comprimir / 2.512 bytes gzip**. Es el precio de leer el destino en vez de hardcodearlo — la alternativa cuesta 0 bytes y dos lugares que editar, que es exactamente lo que la instrucción prohibió.

---

## El controlador — y la evidencia de que no viaja

`IntroDevController.tsx`, montado detrás de:

```ts
process.env.NODE_ENV === 'production'
  ? null
  : dynamic(() => import('./home-intro/IntroDevController')...)
```

En el build de producción el ternario se pliega a `null` y webpack descarta el chunk. **Verificado con `next build` + grep sobre `.next/static/`:**

```
"IntroDevController"   → 0 archivos
"intro · controlador"  → 0 archivos
"asentamiento"         → 0 archivos
"SIN DESTINO"          → 0 archivos
"reproducir"           → 1 archivo  (el botón del panel de /probe-escena, sin relación)
```

Con control positivo, para probar que el grep funciona: `"M532 700v-67"` (el path del logo) → 3 archivos · `"data-home-intro"` → 2 · `"Ingenier"` → 1.

**Qué tiene el panel** (⌥I para mostrarlo/ocultarlo; arranca colapsado a una pestañita abajo a la izquierda):

| Control | Qué hace |
|---|---|
| **▶ reproducir** | Reinicia el intro desde 0, sin recargar y **sin tocar `sessionStorage`** |
| **⏸ / ▶** | Pausa y sigue |
| **⏮ chasquido** | Pausa y salta al frame exacto del corte — el que es imposible de juzgar a velocidad real |
| **Slider de progreso** | Scrub 0→1 sobre `controls.time`; arrastrarlo pausa solo |
| **4 sliders de fase** | `trazo`, `relleno`, `espera`, `asentamiento`, en vivo |
| **Lectura en vivo** | fase · t / total · progreso · trazo · relleno · chasquido sí/no · asentamiento · velo · texto · **mesh: listo / cargando / fallback SVG** · lockup en px · **destino en px y su centro** · escala, pico y clamp |

Las lecturas se escriben con `textContent` directo desde una suscripción al MotionValue: **cero `setState` por frame**. Los sliders sí hacen `setState`, una vez por gesto.

> **`replay()` repone `data-home-intro` en el `<html>`.** `globals.css` esconde el overlay cuando la marca no está y `markIntroPlayed` la saca al terminar; reponerla es lo que permite repetir la secuencia sin tocar el almacenamiento.

---

## Arquitectura

```
src/lib/scene-framing.ts               dónde cae el logo de la escena en la pantalla
src/lib/scene-framing.invariant.ts     y su comprobación

src/components/layout/HomeIntro.tsx    el ciclo de vida y nada más
└─ home-intro/
   ├─ introBoot.tsx           el gate pre-paint (sin cambios desde S8)
   ├─ introHandoff.ts         el contrato con la escena (sin cambios desde S8)
   ├─ introTimeline.ts        las 4 perillas, las fracciones, las constantes  ← se calibra acá
   ├─ introSampling.ts        cómo se lee ese ritmo en un instante
   ├─ introFlight.ts          el vuelo: lockup → pico → destino
   ├─ useIntroChannels.ts     el cableado progreso → 16 MotionValues
   ├─ useViewportSize.ts      el tamaño de la ventana como store externo
   ├─ IntroOverlay.tsx        cómo se apilan fondo, lockup y mesh
   ├─ IntroLockup.tsx         develOP · marca · slogan, y el slot que se mide
   ├─ IntroLogoStroke.tsx     el trazo y el relleno (SVG)
   ├─ IntroLogo3D.tsx         el envoltorio que difiere el canvas
   ├─ IntroLogoCanvas.tsx     el mesh, la cámara ortográfica y la luz
   ├─ IntroDevController.tsx  el panel · SOLO DESARROLLO
   ├─ introTimeline.invariant.ts   el orden de la secuencia
   └─ introSampling.invariant.ts   los canales y la curva
```

`HomeIntro.tsx` **re-exporta** `HomeIntroBoot`, `HOME_INTRO_ATTR`, `HOME_INTRO_FINISHED_EVENT`, `HOME_INTRO_PHASES` y `HOME_INTRO_TIMELINE`: `layout.tsx`, `page.tsx`, `useChromeRevealed.ts` y `globals.css` **no se tocaron** ni en S8 ni en S8b.

**Ningún archivo pasa de 300 líneas.** El más largo es `HomeIntro.tsx` con 280.

**Dos nodos para el slot, no uno:** el contenedor ocupa lugar en el layout y **nunca recibe un transform** — es el que se mide con `getBoundingClientRect()`. El de adentro es el que vuela. Es la disciplina de `Parallax` y `HeroLogoSlot`, y acá además esquiva la trampa que `CLAUDE.md` documenta con transforms activos, porque el nodo medido no tiene ninguno **ni a mitad de vuelo**.

---

## Las comprobaciones estáticas: 206 en verde

```
npx tsx src/components/layout/home-intro/introTimeline.invariant.ts   → 122
npx tsx src/components/layout/home-intro/introSampling.invariant.ts   →  61
npx tsx src/lib/scene-framing.invariant.ts                            →  23
```

Cubren las cuatro propiedades que la instrucción pidió, contra **siete calibraciones** (el default, un intro corto, uno largo y los cuatro casos de mover una sola perilla):

1. **El texto asienta antes del chasquido** — y de hecho antes de que cierre el trazo, con el texto a plena opacidad en el golpe.
2. **La espera existe y es quietud de verdad** — 61 muestras adentro de la espera, todas idénticas hasta 1e-9.
3. **El velo arranca antes de que el logo aterrice** — con el logo por el 82,6% del camino, todavía en movimiento visible.
4. **El chasquido es un escalón** — y **nada más salta en ese cuadro**: trazo, relleno, velo y texto son continuos a través de él; la escala salta, y salta al pico exacto.

Más 400 muestras por calibración (rangos, monotonía por canal, bordes exactos, nombres de fase en orden), la curva del asentamiento, la caja de la tinta contra la medición del probe, el clamp en nueve ventanas, y el `null` con ventana degenerada.

**Tres controles negativos**, porque una comprobación que no puede fallar no comprueba nada: una espera en 0, un velo que arranca sobre el final y un slogan que entra en el chasquido. Los tres se construyen a mano justamente porque **las perillas no alcanzan a romper el orden** — y eso también quedó verificado.

---

## Qué verificar a ojo, en orden

**Antes de nada: la pestaña visible y al frente.** Ocluida o minimizada el navegador no corre `requestAnimationFrame` ni reporta el tamaño de la ventana, y el intro no avanza ni tiene destino.

Con `npm run dev`, en `/`, el panel abre con **⌥I** (o el botón `intro ⌥I` abajo a la izquierda).

1. **Pantalla oscura sin flash.** Ni un cuadro del hero antes del negro. El logo arranca **invisible**.
2. **El trazo.** Una pasada de lápiz continua, hairline (~2 px), luz sobre oscuro.
3. **Las letras.** "develOP" **arriba**, el slogan **abajo**. Aparecen **sin moverse** — solo opacidad. Y quedan quietas antes de que la línea cierre.
4. **El relleno.** La tinta llena el contorno en 0,35 s.
5. **La espera.** Un segundo en que **nada se mueve**. Si algo tiembla ahí, avisá.
6. **🔴 EL CHASQUIDO — pará el panel ahí (⏮ chasquido) y mirá el cuadro.** En el mismo frame: el fondo pasa a claro, el logo pasa a negro, las letras pasan a negro, el logo **salta de golpe** a ~2,6× y el objeto pasa a ser el mesh. **Sin fundido de ninguna.** Si se percibe cualquiera de las cinco fuera de tiempo, avisá.
7. **El relevo.** En el cuadro del chasquido la lectura del panel tiene que decir `mesh listo`. Si dice `fallback SVG`, el chunk no llegó — recargá con la caché caliente y volvé a probar; con `fallback SVG` la secuencia es correcta pero **sin volumen**.
8. **El achicamiento.** Sale rápido del pico y se demora al final. Con el scrub: al 5% del asentamiento ya recorrió el 28%.
9. **La revelación.** Al acomodarse, el logo tiene que **mostrar volumen** — canto y bisel separándose de la cara — y quedar inclinado ~31°, como si lo miraran desde arriba.
10. **El fondo y el texto** se van juntos mientras el logo **todavía se mueve**, y aparece el hero detrás.
11. **El aterrizaje.** El logo termina quieto arriba a la derecha (75% del ancho, 58% del alto en desktop). Hoy detrás está el hero actual, así que **va a quedar fuera de lugar** — es lo esperado: ese punto es donde la escena va a tener su logo.
12. **El scroll — la prueba que más importa.** Rueda desde el primer cuadro del negro. Si se traba un instante, el sprint está roto.
13. **Segunda visita.** F5 sin borrar `sessionStorage` → home directo, sin ni un cuadro de overlay. **Y el panel sigue estando**, para reproducir.
14. **Movimiento reducido** → home directo, sin secuencia.
15. **Mobile** (emulador, ventana visible): el lockup más chico, el destino con el clamp, y el pico saliéndose por los costados un instante — eso último es intencional.

---

## Pendientes y hallazgos fuera de scope

- **El logo aterriza sobre un hero que todavía no es la escena.** Es lo esperado y no se puede arreglar acá: el destino es correcto, lo que falta es la escena debajo. El contrato de `introHandoff.ts` (S8) ya cubre el relevo — la escena se queda quieta en la pose 0 mientras la capa la tapa y suelta en `clear`.
- **El texto y el logo se superponen entre el chasquido y el desvanecimiento** (0,45 s). El logo a 2,6× cubre el centro de la pantalla mientras las letras siguen visibles. Está anotado para juzgarlo con el panel; **si molesta, el número a mover es `VEIL_OUT_START_FRAC`** en `introTimeline.ts` — bajarlo a 0 hace que el texto empiece a irse con el golpe.
- **La rotación de revelación con azimut ≠ 0 no está verificada.** Con la pose base el azimut es 0 exacto, así que hoy no depende de eso. El signo (`rotationY = −yaw`) sale del argumento de movimiento relativo y está documentado en `scene-framing.ts`; si un recorrido futuro entra con azimut, es un cambio de un carácter.
- **`INTRO_CUT_AT` quedó sin consumidores** tras pasar a muestreo por progreso: el escalón lo decide `sampleSnap` contra `snapAtS`. Se conserva exportada porque documenta la regla; se puede borrar sin tocar nada más.
- **El path del logo sigue duplicado en cuatro lugares**, todos preexistentes: `ui/LogoMark.tsx` (que ahora exporta `LOGO_PATH_D` y `LOGO_INK_VIEWBOX`), `ui/LogoStrokeOverlay.tsx` (**Route B — no se migra**), `sections/home/Footer.tsx`, y `public/logodevelOP.svg`.
- **El mouse-follow del logo 3D del hero sigue vivo** — causa raíz de S3b, camino de fix en `CLAUDE.md`. No se tocó: es del sprint de la escena. El canvas del preloader **ya está inmunizado** (`pointerEvents: 'none'` sobre el div de r3f).
- **`frameloop` del canvas del preloader es el default (`always`)** durante los 4,55 s del intro. Es un mesh con dos luces sobre una página que no está haciendo otra cosa; si en mobile se nota, es la primera perilla a mirar.

---

## Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit                                   → exit 0
.\node_modules\.bin\eslint.cmd <tocados + dependientes>                → exit 0, sin warnings
npx tsx .../introTimeline.invariant.ts                                 → 122 en verde, 0 en rojo
npx tsx .../introSampling.invariant.ts                                 →  61 en verde, 0 en rojo
npx tsx src/lib/scene-framing.invariant.ts                             →  23 en verde, 0 en rojo
npm run build                                                          → exit 0
grep -r "IntroDevController" .next/static/                             → 0 archivos
```

**Archivos nuevos:** `src/lib/{scene-framing.ts, scene-framing.invariant.ts}` · `home-intro/{introSampling.ts, introFlight.ts, useIntroChannels.ts, useViewportSize.ts, IntroOverlay.tsx, IntroLogo3D.tsx, IntroLogoCanvas.tsx, IntroDevController.tsx, introSampling.invariant.ts}` · este reporte.

**Archivos reescritos:** `HomeIntro.tsx` · `home-intro/{introTimeline.ts, IntroLockup.tsx, IntroLogoStroke.tsx, introTimeline.invariant.ts}`.

**Archivos ampliados:** `src/components/ui/LogoMark.tsx` (exporta `LOGO_INK_VIEWBOX`).

**Sin tocar:** `page.tsx`, `layout.tsx`, `globals.css`, `useChromeRevealed.ts`, `introBoot.tsx`, `introHandoff.ts`, Route B entera, `DotMatrix`, `/probe-escena`, los seis frozen. **Ningún archivo borrado, cero dependencias nuevas, cero `any`, cero `setState` por frame.**

**Compila, tipa, lintea, pasa 206 comprobaciones estáticas y el build de producción confirma que el controlador no viaja. La verificación visual la hace el humano en localhost.**
