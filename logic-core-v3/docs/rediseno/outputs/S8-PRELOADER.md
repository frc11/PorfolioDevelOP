# S8-PRELOADER — Reporte de cierre

- **Fecha:** 2026-08-20 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S8-preloader.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint` exit 0 · comprobación estática 93/93 en verde. **No autoconfirma que funciona porque compila** — y este componente además **no se puede verificar por automatización**: el gate pre-paint incluye `navigator.webdriver !== true`, así que ninguna herramienta headless lo ve nunca. La única verificación posible es a ojo, en un navegador real.

---

## Qué se construyó

El preloader definitivo del home, según `DIRECCION-ESCENA.md` §1. Reemplaza al intro de S3 (negro → logo → nombre → slogan → inversión → se levanta), que fue un paso intermedio.

**Duración total: 3,2 s** — 0,8 s menos que el intro de S3 (4,0 s), por debajo de la recomendación de ≤4 s.

```
t=0,000  el trazo empieza a dibujar el logo        (linear, 1,200s)
t=0,420  "develOP" aparece                          (0,600s, arrive)  → asienta 1,020
t=0,480  el slogan aparece                          (0,600s, arrive)  → asienta 1,080
         ── 0,120 s de quietud absoluta (7 cuadros a 60 fps) ──
t=1,200  ═══ CORTE SECO ═══  + arranca el aleje     (shift, 2,000s, scale 1 → 0,94)
t=1,800  las letras se van                          (0,600s, arrive espejado) → 2,400
t=2,400  la capa se desvanece                       (0,800s, arrive)
t=3,200  fin
```

**La pantalla oscura no se cobra tiempo aparte.** El velo ya está pintado desde el primer paint (marca pre-paint + SSR), así que la red y la hidratación *son* el hold oscuro. Reservarle segundos sería pagar dos veces algo que ya pasó.

---

## El corte cae en el frame exacto, por construcción

Es la parte que la instrucción protegía: *"un cuadro antes o después se lee como error, no como decisión"*.

El riesgo real no es la precisión de una curva: es la **deriva entre dos relojes**. Dos tweens paralelos, o peor un `setTimeout` en una pestaña con jank, se separan. Acá no hay dos relojes.

`strokeProgress` es el **único driver** de la pieza, y `cut` es una **función escalón** sobre él:

```ts
const cut = useTransform(strokeProgress, (p) => (p >= INTRO_CUT_AT ? 1 : 0))
```

Los cuatro cambios del corte se derivan de ahí y de nada más:

| Qué cambia | De dónde sale |
|---|---|
| Fondo de la capa `#0E0E0E` → `#F7F7F5` | `style.backgroundColor` ← `cut` |
| Tinta `#F7F7F5` → `#111111`, en el logo **y** en las letras | `style.color` ← `cut`; el SVG usa `currentColor` en `stroke` y en `fill` |
| El contorno desaparece | `strokeOpacity` ← `1 − cut` |
| El relleno aparece | `fillOpacity` ← `cut` |

`motion` los escribe a los cuatro en el **mismo render step del mismo frame** que el `strokeDashoffset` final, porque los cuatro son hijos del mismo MotionValue. **No hay un "±1 cuadro": hay cero.** Si el navegador pierde un frame, el trazo salta a 1 y el corte salta con él.

De paso: el relleno del logo dejó de ser una fase. En el clásico eran tres tiempos encadenados (trazo 0,85 s → relleno 0,45 s → crossfade 0,4 s); acá el relleno **es** el corte. Es lo que "más corto y más limpio" significa.

---

## ⚠ El trazo va `linear`. NO se corrige a `arrive`.

Es la única desviación del vocabulario de S2 en todo el sprint, fue aprobada con los números delante, y queda escrita acá para que un sprint futuro no la "arregle".

Medido sobre las curvas reales, con una duración de 1,2 s a 60 fps:

| Curva | El último 10% del tiempo dibuja… | Los últimos 3 cuadros (50 ms) dibujan… |
|---|---|---|
| `arrive` `[.25,.46,.45,.94]` | **1,6%** del contorno | 0,54% |
| `shift` `[.4,0,.2,1]` | **0,6%** | 0,09% |
| `linear` | 10,0% | 4,17% |

**Las dos curvas de S2 son curvas de LLEGADA: por diseño frenan a velocidad casi nula.** Con `arrive`, la línea se ve cerrada unos 50 ms **antes** de que el corte dispare, y el corte se lee tarde — exactamente lo que la instrucción prohíbe. Con `linear` el lápiz sigue moviéndose cuando el corte cae.

No es una curva nueva: **`linear` ya es el tercer miembro del vocabulario de este repo** (`ChoreoEase` en `choreographyTypes.ts`, S6: *"no es una curva nueva: es no aplicar ninguna"*), y `tokens.ts` documenta el mismo principio para lo ligado a progreso — *"su forma la da el mapeo entrada→salida del propio rango, no un easing de tiempo"*. Un trazo no es una llegada: es el recorrido de un parámetro de camino.

El resto del intro es token puro: `arrive` en las entradas y en el fundido, `shift` en el aleje, `MOTION_DURATION.elemento` exacto en las líneas, `REVEAL_STAGGER_S` exacto en el desfase, `REVEAL_DISTANCE_PX` exacto en la distancia.

---

## La entrega a la escena: se construyó el contrato, no el vuelo

**El vuelo del logo no se puede garantizar, y la razón está medida.** La instrucción pedía frenar y reportar con los números si ese era el caso.

### El destino no es un número: son cuatro números distintos

Pose inicial de cada uno de los **cuatro recorridos candidatos**, proyectada a pantalla (FOV 35°, `FRAME_TRAVEL_SAFETY` 0,88, caja del logo 6,86 × 4,78, ventana 1440×810):

| Recorrido | pose inicial | Tamaño en pantalla | Centro X |
|---|---|---|---|
| base (calibrado a mano) | h 9 · d 15 · frameX 0,90 | ~~504 × 351 px~~ **523 × 364 px** | ~~1091 px~~ **1086 px** (75,4%) |
| íntima | h 6,6 · d 11,5 · frameX 0,50 | ~~665 × 463 px~~ **669 × 466 px** | ~~891 px~~ **890 px** (61,8%) |
| arquitectónica | h 9 · d 29 · frameX 0,35 | ~~290 × 202 px~~ **292 × 203 px** | 897 px (62,3%) |
| dramática | h 9 · d 12 · frameX 0,20 | ~~587 × 409 px~~ **588 × 409 px** | 795 px (55,2%) |

> ⚠️ **Corrección de S9 (2026-08-22).** Los cuatro tamaños tachados son de una
> medición intermedia de este sprint que **el código nunca produjo**:
> `scene-framing.invariant.ts` publicaba 523 × 364 para la base desde este mismo
> commit. Los números en negrita son los que el repo devuelve, verificados con
> `npx tsx src/lib/scene-framing.invariant.ts`. Si algún sprint arranca de un
> 504, viene de acá.
>
> **Y el destino ya no es "cuatro números distintos": S9 eligió el recorrido.**
> La pose de entrada definitiva (h 6,4 · d 19 · frameX 0,68) da **451 × 313 px
> con el centro X en 1018 px (70,7%)**. Ver `outputs/S9-COREOGRAFIA.md`.

**2,3× de dispersión en tamaño y 296 px en posición — el 20,6% del ancho del viewport.** Y cuál de los cuatro es EL recorrido *"es del dueño del proyecto y no está hecha"* (§7.1). Se suman tres decisiones abiertas más que mueven el mismo blanco: cómo se ata el recorrido al scroll real (§7.2), el encuadre por relación de aspecto (§7.6, con el desborde lateral ya documentado en ventana angosta) y mobile sin medir (§7.5).

Un vuelo medido necesita coordenadas. Hoy hay cuatro juegos y la elección está abierta.

La fuente de verdad ya lo había resuelto y el sprint lo confirmó: **el preloader es un momento cerrado, no le entrega el logo a nadie** (§1.3). Los pasos 7–8 leídos literalmente dicen lo mismo: la capa *se desvanece*, la escena *aparece detrás*, el logo 3D *arranca su coreografía*.

### Qué SÍ quedó construido

`home-intro/introHandoff.ts` — un observable de módulo, sin provider nuevo y sin tocar ningún contexto frozen:

```
'idle'  →  'covering'  →  'revealing'  →  'clear'
```

- `getIntroStage()` — lectura directa, pensada para vivir adentro de un `useFrame`: cero re-render, cero `setState` por frame.
- `isSceneHeld(stage)` — el booleano: `true` en `covering` y `revealing`.
- `useIntroStage()` — el mismo estado para un consumidor de DOM que sí necesita re-renderizar (`useSyncExternalStore`, con snapshot de server).
- `introEnteredClean()` — si el visitante NO scrolleó durante el intro. Se muestrea **una vez**, en el frame exacto en que la capa empieza a desvanecerse, que es el único momento en que la pregunta significa algo. **Cero listeners de scroll**: el scroll está libre a propósito y no se lo instrumenta.

**`idle` no es lo mismo que `clear`.** Cuando el intro no corre (visita repetida, movimiento reducido, automatización, otra ruta), el estado se queda en `idle` — "no hay intro", no "el intro terminó". Los dos dejan la escena suelta, pero la escena puede distinguirlos si le sirve.

---

## Los tres casos límite

| Caso | Qué pasa |
|---|---|
| **El visitante scrollea durante el intro** | El scroll nunca se bloquea, así que puede pasar. `introEnteredClean()` devuelve `false` y la escena se ata al scroll donde esté, sin forzar entrada desde la pose inicial. Es la regla acordada aplicada tal cual: *si el destino no está donde corresponde, no hay vuelo*. El umbral es 2% de la altura de ventana ≈ 0,0025 de progreso. Con la pestaña oculta `innerHeight` da 0 y el umbral colapsa a `scrollY <= 0`: el lado seguro |
| **La escena 3D todavía no cargó** | **El preloader nunca la espera.** No hay `await`, no hay readiness gate, no hay `LOGO_READY_TIMEOUT_MS` como en el clásico. Corre su timeline y se va; la escena aparece cuando puede, detrás |
| **`prefers-reduced-motion`** | El script pre-paint no marca el `<html>`, el overlay no se ve ni un frame y el contrato queda en `idle`. Se entra directo al home (§1.2) |

---

## ⚠ El riesgo que hay que mirar a ojo, con su fix ya escrito

Durante los **0,8 s del fundido** conviven en pantalla la **marca 2D del preloader** (centrada, 160 px, disolviéndose y alejándose) y el **logo 3D de la escena** (a la derecha, entre 202 y 463 px según el recorrido, apareciendo). Son tan distintos en tamaño y lugar que no deberían leerse como "casi alineados" —que es lo que sí parecería un bug—, pero **esto solo se juzga en pantalla**.

**Si molesta, el fix es hacer que la marca se vaya un poco antes que el velo. El número es `0,65`.** Mecánicamente:

1. En `introTimeline.ts`, agregar al objeto que devuelve `buildTimeline` un cuarto track, al lado de los otros tres:

   ```ts
   markTimes: [0, at(revealDelayS), at(revealDelayS + phases.revealS * 0.65)],
   ```

2. En `IntroLockup.tsx`, envolver `<IntroLogoStroke>` en un `motion.div` con `animate={{ opacity: [1, 1, 0] }}`, `times: MARK_TIMES` y `ease: ['linear', MOTION_EASE.arrive]` — el mismo patrón que ya usa `IntroLine`.

Con `revealS = 0,8 s`, la marca termina de irse a los 0,52 s y el velo sigue 0,28 s más: cuando la escena está más de la mitad visible, la marca ya no está. **La comprobación estática lo cubre sola** — verifica que todo track de `times` sea estrictamente creciente y esté en [0, 1], así que un `markTimes` mal armado sale en rojo sin escribir un assert nuevo.

No se dejó la perilla puesta a propósito: cualquier default distinto de "la marca se va con el velo" cambia lo que hoy está aprobado (un track de opacidad propio se multiplica con el del velo, así que ningún valor la deja neutra).

---

## Arquitectura

```
src/components/layout/HomeIntro.tsx              el overlay, el driver y el ciclo de vida
└─ home-intro/
   ├─ introBoot.tsx          el script pre-paint, `introWasArmed`, `markIntroPlayed`
   ├─ introHandoff.ts        el contrato: la marca del <html>, el evento, el estado de la escena
   ├─ introTimeline.ts       las tres perillas, las fracciones, el timeline resuelto, los colores
   ├─ IntroLockup.tsx        "develOP" arriba · la marca al medio · el slogan abajo, y el aleje
   ├─ IntroLogoStroke.tsx    el trazo y el corte
   └─ introTimeline.invariant.ts   la comprobación estática del ritmo
```

`HomeIntro.tsx` **re-exporta** `HomeIntroBoot`, `HOME_INTRO_ATTR`, `HOME_INTRO_FINISHED_EVENT`, `HOME_INTRO_PHASES` y `HOME_INTRO_TIMELINE`, así que `layout.tsx`, `page.tsx`, `useChromeRevealed.ts` y `globals.css` **no se tocaron**: la superficie de import es idéntica a la de S3.

**Ningún archivo pasa de 300 líneas** (el más largo es la comprobación estática, 205).

### Las tres perillas

`HOME_INTRO_PHASES` en `introTimeline.ts`, y solo ahí:

| Fase | Default | Qué pasa |
|---|---|---|
| `strokeS` | **1,2 s** | Pantalla oscura. El trazo dibuja y entran las letras |
| `presentS` | **1,2 s** | Después del corte: el conjunto se aleja, las letras se van |
| `revealS` | **0,8 s** | La capa se desvanece y aparece la escena |

Mover una reacomoda **todo** lo de adentro proporcionalmente: la coreografía interna se declara en fracciones de su fase, nunca en segundos, y esas fracciones se derivan de los tokens de S2 sobre unas fases de REFERENCIA que no se editan. Así, en su default, el intro usa exactamente la física del sistema y esa relación la sostiene el compilador.

### La comprobación estática

```
npx tsx src/components/layout/home-intro/introTimeline.invariant.ts
```

**93 comprobaciones, 0 en rojo.** Existe porque las tres perillas las va a calibrar el dueño del proyecto mirando la pantalla, sin leer el razonamiento detrás de las fracciones — y lo que se rompe al mover un número no se ve compilando. Corre contra **seis calibraciones**: el default, una más corta, una más larga y los tres casos de mover UNA sola perilla.

Protege la propiedad que hace o rompe el corte: **en el frame del corte, lo único que se mueve es el corte.** Más el orden completo de la secuencia y que los `times` normalizados que consume `motion` sean estrictamente crecientes en [0, 1].

Lleva un **control negativo**: construye a propósito una calibración rota (un trazo de 0,15 s) y verifica que la propiedad **sí** se viole. Una comprobación que no puede fallar no comprueba nada.

---

## Las condiciones no negociables

| Condición | Cómo se cumple |
|---|---|
| **Nunca bloquea el scroll, ni un frame** | Capa `pointer-events-none fixed inset-0`. No toca `overflow`, no llama `lenis.stop()`, no gatea el render. Cero líneas de código de lock en todo el camino nuevo |
| **El contenido del hero existe y es visible para buscadores desde el primer paint** | `HeroSection` es server-rendered y vive detrás; la capa es un hermano, no un gate. Y es `aria-hidden`: para un lector de pantalla la página está disponible al instante |
| **Solo la primera visita de la sesión** | `sessionStorage` + el gate pre-paint, que esconde el overlay por CSS desde el primer paint cuando la marca no está |
| **Honra `prefers-reduced-motion`** | Se salta entero. Doble guard: el script pre-paint y el componente |
| **Sin sonido** | No hay una sola línea de audio |
| **Sin dependencias nuevas** | Cero |
| **Cero `any`, cero `setState` por frame** | `setState` solo en la decisión inicial y al terminar. El resto son MotionValues |
| **Route B intacta** | `Preloader.tsx`, `MarketingIntro.tsx` y `LogoStrokeOverlay.tsx` no se tocaron |
| **`DotMatrix` y `/probe-escena` intactos** | Ni un archivo tocado |
| **Frozen intactos** | `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx` (solo consumo), `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts` |
| **Ningún archivo borrado** | Ninguno. Y ninguno quedó huérfano: `LogoMark` lo sigue usando `HeroLogoSlot` |

---

## Qué verificar en el navegador, paso por paso

**Antes de nada:** la pestaña tiene que estar **visible y al frente**. Con la pestaña ocluida o minimizada el navegador saltea los rendering steps —no corre `requestAnimationFrame`— y el intro simplemente no avanza. Es la trampa ya documentada en `CLAUDE.md` y acá aplica entera.

**Para volver a ver el intro:** DevTools → Application → Session Storage → borrar `home:intro`, y recargar con **F5** (no un click de navegación: un client-nav no lo dispara nunca, a propósito).

1. **Pantalla oscura, sin flash.** Al cargar `/` en frío no se tiene que ver ni un cuadro del hero antes del negro. Y el logo **no** tiene que aparecer dibujado y después borrarse: arranca invisible.
2. **El trazo.** Una sola pasada de lápiz continua, hairline (~2 px), luz sobre oscuro. Sin saltos: si se ve el lápiz "teletransportarse", el path se rompió.
3. **Las letras.** "develOP" **arriba** de la marca, "Ingeniería para negocios reales" **abajo**. Aparecen —opacidad y un desplazamiento corto—, **no** se escriben letra por letra. Entran con el trazo a mitad de camino, y **quedan quietas** un instante antes de que la línea cierre.
4. **🔴 EL CORTE — es lo que hay que mirar con más atención.** En el mismo cuadro tienen que cambiar las cuatro cosas: el fondo pasa a claro, el contorno del logo pasa a relleno negro, "develOP" pasa a negro y el slogan pasa a negro. **Sin fundido de ninguna de las cuatro.** Y el corte tiene que caer **cuando la línea cierra**, no antes ni después. Si se percibe que la línea "llega y espera", avisar: es el síntoma de que el trazo dejó de ser `linear`.
5. **El aleje.** Desde el corte, el conjunto retrocede un 6% de forma lenta y continua, sin frenar, hasta que la capa se va.
6. **Las letras se van** con el mismo gesto con que entraron, en espejo, mientras el conjunto sigue alejándose. Se van **antes** de que arranque el fundido, no con él.
7. **El fundido y la marca.** La capa se desvanece en 0,8 s y aparece el hero. Mirar acá el punto del ⚠ de arriba: hoy detrás hay el logo 2D del hero y su canvas; cuando la escena esté montada, va a haber dos logos en pantalla durante ese segundo.
8. **El scroll — la prueba que más importa.** Scrollear con la rueda **desde el primer cuadro del negro**, sin esperar. La página tiene que moverse. Si se traba aunque sea un instante, el sprint está roto.
9. **Nada de chrome sobre el velo.** El dock y el teaser del chat tienen que aparecer **después** del fundido, nunca encima de la capa.
10. **Segunda visita.** Recargar sin borrar `sessionStorage`: el home tiene que aparecer directo, **sin ni un cuadro de overlay**.
11. **Movimiento reducido.** Windows → Configuración → Accesibilidad → Efectos visuales → apagar animaciones. Borrar `home:intro`, recargar: el home entra directo, sin secuencia.
12. **Mobile.** Con el emulador de DevTools **y la ventana visible**: la marca a 112 px, el wordmark en su tamaño chico, y el trazo todavía legible.

---

## Qué queda listo para conectar la escena

Cuando el sprint que monte la escena la ponga en el home, lo que tiene que hacer son cuatro cosas y ninguna toca este preloader:

1. **Leer el estado por frame.** Adentro de su `useFrame`: `isSceneHeld(getIntroStage())`. Sin hooks, sin re-render, sin `setState`.
2. **Mientras está retenida** (`covering` y `revealing`): quedarse **quieta en la pose 0 y con la vira apagada**. Es lo que hace que el blanco esté inmóvil justo cuando se vuelve visible, que era la única condición que el handoff necesitaba y que sí se puede garantizar.
3. **En `clear`: soltar** — vira encendida y coreografía atada al scroll.
4. **Decidir CÓMO suelta con `introEnteredClean()`**: `true` → puede jugar su entrada desde la pose inicial; `false` → el visitante scrolleó, se ata al scroll donde esté y no fuerza nada.

**Hoy degrada solo.** Sin escena montada nadie consume el contrato y el home queda exactamente como está: la capa se desvanece y aparece el hero con su logo 2D y su canvas actual detrás. No se tocó `HeroSection`, ni `HeroLogoSlot`, ni `HeroArtifactLayer`.

---

## Pendientes y hallazgos fuera de scope

- **El path del logo está duplicado en cuatro lugares**, todos preexistentes y ninguno tocado por este sprint: `ui/LogoMark.tsx` (que ahora lo **exporta** como `LOGO_PATH_D`, así el preloader no creó una copia nueva), `ui/LogoStrokeOverlay.tsx` (**Route B — no se migra**, por instrucción explícita), `sections/home/Footer.tsx`, y el asset canónico `public/logodevelOP.svg`. Si la marca cambia, son cuatro lugares.
- **`HOME_INTRO_PHASES` y `HOME_INTRO_TIMELINE` no tienen consumidores fuera del intro.** Se re-exportan desde `HomeIntro.tsx` por continuidad con S3; si nunca aparece un consumidor, se pueden dejar de re-exportar sin tocar nada más.
- **El mouse-follow del logo 3D del hero sigue vivo** — causa raíz identificada en S3b (r3f v9 escribe `state.pointer` por su cuenta sobre la caja del canvas) y el camino de fix ya documentado en `CLAUDE.md`. No se tocó: es del sprint de la escena.
- **El intro sigue sin ser verificable por automatización**, y es deliberado. Cualquier batería que en el futuro quiera ver la secuencia va a necesitar apagar el gate de `webdriver` a mano, y ahí pierde la protección que ese gate da.
- **La comprobación estática no verifica nada visual.** Verifica aritmética, que es lo que una calibración rompe. Que el corte se **vea** seco lo dice el ojo, no el archivo.

---

## Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit                              → exit 0
.\node_modules\.bin\eslint.cmd <archivos tocados + dependientes>  → exit 0, sin warnings
npx tsx src/components/layout/home-intro/introTimeline.invariant.ts → 93 en verde, 0 en rojo
```

**Archivos nuevos:** `src/components/layout/home-intro/{introBoot.tsx, introHandoff.ts, introTimeline.ts, introTimeline.invariant.ts, IntroLockup.tsx, IntroLogoStroke.tsx}`, este reporte.

**Archivos modificados:** `src/components/layout/HomeIntro.tsx`, `src/components/ui/LogoMark.tsx`.

**Sin tocar:** `page.tsx`, `layout.tsx`, `globals.css`, `useChromeRevealed.ts`, Route B entera, `DotMatrix`, `/probe-escena`, los seis frozen. **Ningún archivo borrado, ninguno huérfano, cero dependencias nuevas.**

**Compila, pasa tsc, pasa lint y pasa su comprobación estática. La verificación visual la hace el humano en localhost.**
