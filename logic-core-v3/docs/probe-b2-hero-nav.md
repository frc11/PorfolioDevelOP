# PROBE — Hero, intro y navegación para B2

**Fecha:** 2026-07-31 · **Rama:** `redesign/home` @ `e06e3c4697427cce1cc7b4a6a28447d0fafc0c1a`
**Naturaleza:** diagnóstico read-only. No se tocó ni una línea de `src/`. No se propone rediseño, refactor ni mejoras.
**Método:** 4 pasadas de exploración read-only en paralelo (dos de mapeo de consumidores, una de reconstrucción de la coreografía del intro, una de anclas/chatbot/nav) + una build de producción (`npm run build`) para el presupuesto de bundle de la sección E. Complementa, no reemplaza, `docs/probe-monolito-censo.md` (censo previo del monolito `OurServices` y de la trampa de anclas del Navbar/chatbot).

> **Nota sobre el censo previo:** varias líneas citadas en `docs/probe-monolito-censo.md` (TRAMPA 2) quedaron desactualizadas por edición de archivos en el ínterin — `Hero.tsx` (`id="inicio"` pasó de línea 493 a 175) y `WhyDevelOP.tsx` (`id="caracteristicas"` pasó de línea 1604 a 1629). El contenido y la grafía de esas anclas no cambió, solo su ubicación. Este reporte usa las líneas actuales, verificadas hoy.

---

## Índice

- [A. Mapa de consumidores de las piezas condenadas](#a-mapa-de-consumidores-de-las-piezas-condenadas)
- [B. La coreografía del intro](#b-la-coreografía-del-intro)
- [C. Anclas de navegación y acoplamiento con el chatbot](#c-anclas-de-navegación-y-acoplamiento-con-el-chatbot)
- [D. Nav y dock](#d-nav-y-dock)
- [E. Presupuesto](#e-presupuesto)
- [Tabla resumen final](#tabla-resumen-final)
- [Lo que se rompe si se elimina sin reemplazo](#lo-que-se-rompe-si-se-elimina-sin-reemplazo)
- [Lo que no se pudo verificar](#lo-que-no-se-pudo-verificar)

---

# A. Mapa de consumidores de las piezas condenadas

Convención: **PÚBLICO** = home, landings (`/web-development`, `/ai-implementations`, `/process-automation`, `/software-development`), `/contact`. **PRODUCTO** = `/admin/*`, `/dashboard/*`, `/setter/*`, `/embed/*`, `/login`, `/accept-invite`, `/forgot-password`, chatbot admin.

## A.1 `Preloader`

- **Definición:** `src/components/ui/Preloader.tsx:60`.
- **Consumidores:** único importador real — `src/app/layout.tsx:46` (import), `:98` (`<Preloader />`), dentro de `<PublicOnlyComponents>` (`layout.tsx:97-99`).
- **Anomalía clave:** `Preloader.tsx` no es solo el velo del home — internamente decide si renderiza el velo del home o `<MarketingIntro />` según la ruta (`Preloader.tsx:302-304`, gate `shouldRunMarketingIntro(pathname)` de `src/lib/marketing-routes.ts:54`). Es el único punto de montaje de **ambas** coreografías.
- **Veredicto: COMPARTIDA.** Como UI visible en el home es exclusivo del home, pero como módulo es el orquestador compartido con las 5 rutas de marketing (`/web-development`, `/ai-implementations`, `/software-development`, `/process-automation`, `/contact`). Borrar `Preloader.tsx` entero mata también el intro de esas 5 rutas.

## A.2 `MarketingIntro`

- **Definición:** `src/components/ui/MarketingIntro.tsx:83` (named), `:409` (default).
- **Consumidor:** único — `Preloader.tsx:10` (import), `:303` (`return <MarketingIntro />`).
- **Rutas donde corre (confirmado por `src/lib/marketing-routes.ts:8-14`):** `/web-development`, `/ai-implementations`, `/software-development`, `/process-automation`, `/contact`. **Nunca corre en home.**
- **Veredicto: COMPARTIDA entre 5 rutas públicas de marketing — pero AJENA al home.** Es la pieza más fácil de clasificar mal: está en la lista de "piezas condenadas" del brief de B2, pero no tiene ningún consumidor en el home. Eliminarla porque "sale con el hero 3D del home" mataría el intro de 5 rutas que no son el home.

## A.3 `BrandedIntroCanvas`

- **Definición:** `src/components/ui/BrandedIntroCanvas.tsx:100` (named), `:200` (default).
- **Consumidor:** único — `MarketingIntro.tsx:19-22` (`dynamic(() => import(...).then(m => m.BrandedIntroCanvas), {ssr:false})`), usado en JSX en `MarketingIntro.tsx:376-382` (solo desktop, `isClient && isSplitLayout`).
- **Anomalía:** NO importa `HeroArtifact` (el comentario en `BrandedIntroCanvas.tsx:73` es solo prosa). Usa su propio mesh duplicado `BrandedLogoWhite` (`src/components/3d/BrandedLogoWhite.tsx`), construido a propósito para no tocar el archivo frozen (`BrandedLogoWhite.tsx:8,22`: "NO toca `HeroArtifact` (frozen). Reconstruye su MISMA geometría"). Sí comparte `DotMatrixMesh` (`BrandedIntroCanvas.tsx:16,132-135`) — ver A.8.
- **Veredicto: mismo caso que A.2 — pieza de marketing, no del home.** Cero acoplamiento de import con `HeroCanvas`/`HeroArtifact`. Eliminar el 3D del home no la toca en absoluto a nivel de código; solo son primas visuales.

## A.4 `EarlyScrollLock`

- **Definición:** `src/components/layout/EarlyScrollLock.tsx:29`.
- **Consumidor:** único — `layout.tsx:52` (import), `:80` (`<EarlyScrollLock />`, dentro de `<head>`), **fuera** de `PublicOnlyComponents` → el componente React se monta en TODAS las rutas.
- **Pero el efecto real está gateado en runtime:** el script inyectado (`EarlyScrollLock.tsx:27`) es literalmente `if(location.pathname==='/'&&navigator.webdriver!==true){document.documentElement.style.overflow='hidden'}`. Solo actúa en `/`.
- **Veredicto: SOLO HOME** en efecto (el montaje es global pero inocuo fuera de `/`). Acoplado 1:1 al Hero — el comentario `EarlyScrollLock.tsx:24` dice explícitamente "El Hero lo libera en phase 'done'". No se puede eliminar en aislamiento sin coordinarlo con el cambio en `Hero.tsx`.

## A.5 `HeroCanvas`

- **Definición:** `src/components/layout/HeroCanvas.tsx:318`.
- **Consumidor:** único — `Hero.tsx:16` (`dynamic(() => import('@/components/layout/HeroCanvas'), {ssr:false})`), usado dos veces: desktop `Hero.tsx:270-280`, mobile `Hero.tsx:423-433`. `Hero` a su vez solo lo importa `src/app/page.tsx:7` (home).
- **Veredicto: SOLO HOME.** Cero consumidores fuera de `page.tsx → Hero.tsx`.

## A.6 `HeroArtifact` (🔒 FROZEN — no se toca, solo se lee)

- **Definición:** `src/components/3d/HeroArtifact.tsx:14`.
- **Consumidor real:** único — `HeroCanvas.tsx:10` (import), `:263` (`<HeroArtifact phase="done" />`, dentro de `HeroLogo`, `HeroCanvas.tsx:235-267`).
- Todas las demás menciones del string "HeroArtifact" en el repo son comentarios, no imports (`BrandedLogoWhite.tsx:8,22`; `BrandedIntroCanvas.tsx:73`; `logo-footprint.ts:1,4`; `HeroCanvas.tsx:100,123,135`).
- **Veredicto: SOLO HOME**, vía una única cadena de import. Al estar frozen, sacar el 3D del home no requiere tocar `HeroArtifact.tsx` — alcanza con que `HeroCanvas.tsx:10,263` deje de importarlo. El archivo queda simplemente sin consumidores, no hace falta borrarlo.

## A.7 `DotMatrix` / `DotMatrixMesh`

- **Definición:** `src/components/canvas/DotMatrix.tsx` — `DotMatrixMesh` (named, `:54`), `DotMatrix` (wrapper con su propio `<Canvas>`, `:209`, default `:224`).
- **Consumidores de `DotMatrixMesh`:**
  - `HeroCanvas.tsx:11,365` — **PÚBLICO, home.**
  - `BrandedIntroCanvas.tsx:16,132-135` — **PÚBLICO**, 5 rutas de marketing.
- **Consumidores de `DotMatrix` (wrapper):**
  - `src/app/login/page.tsx:11-14,479` — **PRODUCTO.**
  - `src/app/forgot-password/page.tsx:9-12,239` — **PRODUCTO.**
  - `src/app/accept-invite/InviteBackground.tsx:6,13` (consumido a su vez por `src/app/accept-invite/page.tsx:2,16`) — **PRODUCTO.**
- **Veredicto: COMPARTIDA — el hallazgo más riesgoso de toda la lista A.** Es el mismo archivo el que sostiene el campo de puntos animado del home/marketing **y** el fondo decorativo estático de 3 pantallas de producto/auth. El propio archivo lo documenta (`DotMatrix.tsx:9-10,20-21,49`: "back-compat: /login·/forgot-password·/accept-invite"). **Borrar o vaciar este archivo rompe `/login`, `/forgot-password` y `/accept-invite`.** Solo se puede tocar el call-site en `HeroCanvas.tsx`, nunca el archivo entero.

## A.8 `CustomCursor`

- **Definición:** `src/components/ui/CustomCursor.tsx:13`.
- **Consumidor:** único — `layout.tsx:4,84`, **fuera** de `PublicOnlyComponents` → montado en TODAS las rutas, producto incluido.
- **Veredicto: COMPARTIDA (global).** No tiene relación de código con el hero 3D ni con el intro — vive en `components/ui` mezclada con las demás piezas condenadas, pero es independiente. Fuera de alcance del trabajo de B2, salvo que se toque `layout.tsx`.

## A.9 `NoiseOverlay`

- **Definición:** `src/components/ui/NoiseOverlay.tsx:3`.
- **Consumidor:** único — `layout.tsx:5,85`, mismo patrón que `CustomCursor` — global, todas las rutas.
- **Veredicto: COMPARTIDA (global).** Mismo caso que A.8.

## A.10 `TypewriterText`

- **Definición:** `src/components/ui/TypewriterText.tsx:14`.
- **Consumidores:**
  - `Hero.tsx:8,348` — **PÚBLICO, home.**
  - `src/components/sections/AIBentoGrid.tsx:5,61` — este archivo **no tiene ningún importador en todo `src/`** (huérfano en sí mismo, no alcanzable desde ninguna ruta).
- **Veredicto: SOLO HOME** (el único consumidor vivo es Hero.tsx). El segundo "consumidor" es código muerto que igual dejaría de compilar si se borra `TypewriterText` sin tocarlo — anotado para quien haga la limpieza.

## A.11 `IntroLockupText`

- **Definición:** `src/components/ui/IntroLockupText.tsx:183` (named), `:256` (default). También exporta las constantes de timing `TEXT_LEAD_MS` (`:19`), `WRITE_MS` (`:20`), `READ_HOLD_MS` (`:21`), `ERASE_MS` (`:22`).
- **Consumidores:**
  - `Hero.tsx:7,305,460` — **PÚBLICO, home.**
  - `MarketingIntro.tsx:12,400` (componente) — **PÚBLICO**, 5 rutas de marketing.
  - `Preloader.tsx:11-16` (solo las 4 constantes de timing, no el componente) — usadas en `Preloader.tsx:157-159,160,193,197-200,213-215,217,237,239-242`.
- **Veredicto: COMPARTIDA.** Contradice la asunción de "solo hero" — se usa en Hero.tsx y en `MarketingIntro.tsx`.

## A.12 `LogoStrokeOverlay`

- **Definición:** `src/components/ui/LogoStrokeOverlay.tsx:58` (named), `:142` (default).
- **Consumidores:**
  - `Hero.tsx:6,289,442` — **PÚBLICO, home.**
  - `MarketingIntro.tsx:11,388` — **PÚBLICO**, 5 rutas de marketing.
- **Veredicto: COMPARTIDA.** Mismo patrón que A.11. Nota: `IntroLockupText.tsx:46` documenta un acoplamiento implícito de tunables de footprint entre ambos ("Mismos tunables de footprint que LogoStrokeOverlay — mantener en sync") — cambiar uno sin el otro puede desincronizar el trazo visual donde ambos intros corren.

## A.13 `KineticText`

- **Definición:** `src/components/ui/KineticText.tsx:5`.
- **Consumidor:** único — `src/components/sections/home/About.tsx:6,380-386`, dentro de `AboutLogoMark` (`About.tsx:348`), renderizado desde `AboutMobile` (`:416`) y `AboutDesktop` (`:489`). `About.tsx` solo lo importa `src/app/page.tsx:8` (home).
- **Veredicto: SOLO HOME.** Confirma el censo previo — cero consumidores fuera de `About.tsx`.

## A.14 `MagneticCta`

- **Definición:** `src/components/ui/buttons/MagneticCta.tsx:51`.
- **Consumidor:** único — `Hero.tsx:9,385-390` (dos CTAs) — **PÚBLICO, home.**
- **Veredicto: SOLO HOME.**
- **Falso amigo a anotar:** las 4 landings tienen cada una su propia implementación local **duplicada** `MagneticButton` (NO importan el `MagneticCta` compartido): `CtaAutomation.tsx:7,441-445`, `CtaIA.tsx:7,438-443`, `SoftwareDevelopmentCta.tsx:7,438-443`, `WebDevelopmentCta.tsx:7,438-442`. Tocar `MagneticCta` no afecta esas 4 páginas, y viceversa.

## A.15 `SectionTransition`

- **Definición:** `src/components/layout/SectionTransition.tsx:12`.
- **Consumidores: NINGUNO.** Grep en todo `src/` solo devuelve la propia definición y dos comentarios: `useThemeObserver.tsx:58` (lo lista como llamador histórico) y `SectionShell.tsx:40`, que ya lo documenta en el propio código: *"`SectionTransition.tsx`, el tercero, es código muerto (cero consumidores)."*
- **Veredicto: HUÉRFANA.** Borrable sin riesgo, ya lo dice el propio repo.

## A.16 `useThemeSection`

- **Definición:** `src/hooks/useThemeObserver.tsx:38`.
- **Consumidores (llamadas reales, no imports muertos):**
  - `About.tsx:5,402,461` — **PÚBLICO, home.**
  - `WhyDevelOP.tsx:40,1603` — **PÚBLICO, home** (`WhyDevelOP` solo se importa dinámicamente desde `page.tsx:12`).
  - `SectionTransition.tsx:1,20` — llamada inalcanzable, porque `SectionTransition` en sí no tiene consumidores (A.15).
- **Dependencia crítica:** internamente llama a `useTheme()` (`useThemeObserver.tsx:39`), que **tira excepción** si no hay `ThemeProvider` arriba (`useThemeObserver.tsx:32-34`). `ThemeProvider` solo se monta en `src/app/page.tsx:2,23` (home). Es decir, este hook **solo puede llamarse con seguridad dentro del árbol del home**.
- **Veredicto: SOLO HOME.**

## A.17 `TransitionContext` (🔒 FROZEN — no se toca, solo se lee)

- **Definición:** `src/context/TransitionContext.tsx` — `TransitionProvider` (`:14`), `useTransitionContext` (`:169`).
- **Montaje del Provider:** `layout.tsx:48` (import), `:87,95` (`<TransitionProvider>` envuelve `{children}`) — es decir, **toda la app**, producto incluido, porque es el layout raíz.
- **Consumidores reales de `useTransitionContext()` verificados hoy (8, no 10 como afirmaba el censo previo):**

| # | Archivo | Línea import | Línea(s) de uso | Clasificación |
|---|---|---|---|---|
| 1 | `src/components/layout/Shutter.tsx` | `:4` | `:7` | PÚBLICO (gateado fuera de portales) |
| 2 | `src/components/layout/Navbar.tsx` | `:10` | `:90`, `:116` | PÚBLICO |
| 3 | `src/components/layout/DynamicDock.tsx` | `:19` | `:135`, `:221` | PÚBLICO (hijo de Navbar) |
| 4 | `src/components/sections/home/OurServices.tsx` | `:44` | `:9453` | **PÚBLICO, home — hallazgo nuevo, el censo previo no lo tenía** |
| 5 | `src/app/(protected)/setter/_components/setter-nav.tsx` | `:7` | `:36` | PRODUCTO (setter) |
| 6 | `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx` | `:11` | `:60` | PRODUCTO (chatbot admin) |
| 7 | `src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx` | `:6` | `:40` | PRODUCTO (admin) |

(La numeración de la tabla llega a 7 filas porque `DynamicDock` cuenta como consumidor 3 y `Navbar` como 2 — son 7 componentes/archivos distintos con 8 líneas de uso en total, contando las dos de `Navbar` y las dos de `DynamicDock`.)

- **Corrección al censo previo:** decía "10 importadores... 3 archivos de portales". Hoy son **2** archivos de portal (`setter-nav.tsx`, `EditClientForm.tsx`), no 3 — y **le faltaba `OurServices.tsx`**, un consumidor del propio home. Neto: 4 (chrome público) + 1 (chatbot admin) + 2 (portales) + 1 (contenido del home) = 8.
- **Veredicto: COMPARTIDA — fuertemente.** Toca contenido del home, chrome público global y tres superficies de producto distintas (setter, admin, chatbot admin). Al estar frozen, no se propone ningún cambio; se deja constancia de que no es una pieza aislable del home.
- **Anomalía adicional:** `PublicOnlyComponents`/`publicRoute.ts:10` gatea `Shutter`/`Navbar`/`Preloader` fuera de `['/admin','/dashboard','/embed','/setter']` — pero **`/login` no está en esa lista**, así que hoy `/login` sigue renderizando el chrome público (Navbar, Shutter, Preloader) y por lo tanto sigue dependiendo indirectamente de `TransitionContext`, aunque debería pensarse como ruta de producto.

---

# B. La coreografía del intro: qué es exactamente y qué la ata

## B.1 Inventario de archivos de la coreografía

| Archivo | Rol |
|---|---|
| `src/app/layout.tsx` | Monta `PreloaderProvider`, `EarlyScrollLock`, `Preloader` |
| `src/context/PreloaderContext.tsx` | Máquina de estados global (`phase`) + MotionValues compartidos + promesa de "logo listo" |
| `src/components/layout/EarlyScrollLock.tsx` | Script pre-hydration que lockea `<html>` antes del primer paint, solo en `/` |
| `src/components/ui/Preloader.tsx` | **Orquestador** — la función `run()` que dispara todas las fases |
| `src/components/layout/Hero.tsx` | Dueño del lock/unlock **real** de scroll (`overflow` + `lenis.stop/start`), del timeout de seguridad de 6s, y quien monta `HeroCanvas` |
| `src/components/layout/HeroCanvas.tsx` | El `<Canvas>` 3D del home; contiene `LogoReadySignal`, el único emisor de `markLogoReady` en el camino del home |
| `src/components/ui/LogoStrokeOverlay.tsx` | Trazo 2D SVG del logo, compartido con `MarketingIntro` |
| `src/components/ui/IntroLockupText.tsx` | Texto "develOP" + slogan, compartido, también exporta las constantes de timing |
| `src/components/ui/MarketingIntro.tsx` | Orquestador **independiente** para las 5 rutas de marketing |
| `src/components/ui/BrandedIntroCanvas.tsx` | El `<Canvas>` 3D propio de marketing — reimplementación separada del patrón de `HeroCanvas.tsx` |
| `src/lib/home-routes.ts` | Gate: el intro del home solo corre en hard-load de `/` |
| `src/lib/marketing-routes.ts` | Gate: el intro de marketing solo corre en hard-load de una de las 5 rutas |

## B.2 Secuencia completa — home, desktop, sin `prefers-reduced-motion`

Máquina de estados (`PreloaderContext.tsx:6-13`): `"drawing" | "filling" | "text" | "waiting" | "flying" | "swapping" | "done"`. Solo `Preloader.tsx` la escribe (`setPhase`); `Hero.tsx` solo la lee (y puede forzarla a `"done"` vía su timeout de seguridad).

```
t=0ms          [EarlyScrollLock.tsx:27]     Script SSR: html.style.overflow='hidden' (pathname==='/', pre-hydration)
t=0ms          [Preloader.tsx:118]          setPhase('drawing') → Hero.tsx:121-133 confirma el lock (overflow hidden + lenis.stop())
t=0→2500ms     [Preloader.tsx:119]          await Promise.race([waitForLogoReady(), wait(2500)])   ← gate de 3D, ver B.3
t=2500ms       [Preloader.tsx:124]          setPhase('filling')
t=2500→3900ms  [Preloader.tsx:126-133]      await animate(veil.opacity, 0, {duration:1.4s})          — VEIL_FADE_SECONDS (Preloader.tsx:24)
t=3900→4050ms  [Preloader.tsx:138]          await wait(150ms)                                        — STEP_DELAY_SECONDS (Preloader.tsx:25)
t=4050ms       [Preloader.tsx:140]          setPhase('text')
t=4050ms       [Preloader.tsx:156-159]      void animate(textReveal, 1, {duration:1.5s})   — WRITE_MS, no bloqueante
t=4050ms       [Preloader.tsx:160]          await wait(TEXT_LEAD_MS=0ms)                             — no-op
t=4050ms       [Preloader.tsx:166-169]      void animate(canvasReveal, 1, {duration:0.4s}) — HOME_CANVAS_FADEIN_SECONDS, no bloqueante
t=4050ms       [Preloader.tsx:170-173]      void animate(dotsReveal, 1, {duration:0.55s})  — HOME_DOTS_REVEAL_SECONDS, no bloqueante
t=4050→4900ms  [Preloader.tsx:174-177]      await animate(logoStrokeProgress, 1, {duration:0.85s})  — HOME_STROKE_SECONDS
t=4900→5350ms  [Preloader.tsx:179-182]      await animate(logoFillProgress, 1, {duration:0.45s})    — HOME_FILL_SECONDS
t=5350→5750ms  [Preloader.tsx:186-189]      await animate(logoLayerOpacity, 0, {duration:0.4s})     — HOME_CROSSFADE_SECONDS (solo desktop)
t=5750→7250ms  [Preloader.tsx:193]          await wait(1500ms)                                       — READ_HOLD_MS
t=7250→8750ms  [Preloader.tsx:197-200]      await animate(textReveal, 0, {duration:1.5s})            — ERASE_MS
t=8750ms       [Preloader.tsx:253]          setPhase('waiting')
t=8750ms       [Preloader.tsx:259]          setPhase('flying')
t=8750→9530ms  [Preloader.tsx:260-263]      await animate(introProgress, 1, {duration:0.78s})        — COMPRESS_SECONDS (solo desktop)
t=9530ms       [Preloader.tsx:269]          setPhase('swapping')
t=9530→9770ms  [Preloader.tsx:270]          await wait(240ms)
t=9770ms       [Preloader.tsx:273-274]      markHomeIntroConsumed(); finish() → setPhase('done')
t=9770ms       [Hero.tsx:124-127]           efecto phase==='done' → overflow limpio + lenis.start()  ← SCROLL LIBERADO
--- en paralelo, independiente de la cadena anterior ---
Hero mount+6000ms [Hero.tsx:158-169]        red de seguridad: si phase !== 'done', fuerza setPhase('done') igual
```

**Sitios exactos de lock/unlock de scroll:**
- `EarlyScrollLock.tsx:27` — primer lock, pre-hidratación, gateado a `pathname==='/'`.
- `Hero.tsx:121-133` — lock real y continuo, re-corre en cada cambio de `phase`: bloquea en todas las fases salvo `'done'`.
- `Hero.tsx:150-155` — limpieza al desmontar `Hero` a mitad del intro.
- `Hero.tsx:158-169` — red de seguridad: `setTimeout(6000ms)` que fuerza `phase='done'` si el intro no terminó solo.

## B.3 El gate de readiness del 3D (~2500ms)

- **Constante:** `LOGO_READY_TIMEOUT_MS = 2500` — `Preloader.tsx:27`.
- **Sitio del await:** `Preloader.tsx:119` — `await Promise.race([waitForLogoReady(), wait(LOGO_READY_TIMEOUT_MS)])`.
- **Qué espera:** que `HeroCanvas.tsx`'s `LogoReadySignal` (`HeroCanvas.tsx:138-154`, montado en `:360`, dentro del `<Suspense>` del `<Canvas>`) llame a `onReady`, que es `markLogoReady` pasado como prop desde `Hero.tsx:278,431`. `markLogoReady`/`waitForLogoReady` son un resolver de promesa clásico, definido en `PreloaderContext.tsx:104-122` (un flag `logoReadyRef` + cola de resolvers).
- `LogoReadySignal` hace `useLoader(SVGLoader, '/logodevelOP.svg')` (que suspende hasta que el SVG cargue) y luego encadena dos `requestAnimationFrame` antes de llamar a `onReady()`.
- **Qué pasa si nunca llega:** no cuelga. `Promise.race` garantiza que la secuencia avanza a los 2500ms sin importar si `markLogoReady()` se llamó o no, porque `wait()` es un `setTimeout` puro que siempre resuelve.

## B.4 La pregunta clave — ¿qué pasa si se elimina el canvas 3D del home?

**Veredicto, con evidencia de código: degrada con gracia (no cuelga), pero NO se acorta sola. Se convierte en un impuesto fijo garantizado de 2500ms en vez de un tope variable.**

1. `markLogoReady` solo lo llama `LogoReadySignal`, montado exclusivamente dentro de `<HeroCanvas>` (`HeroCanvas.tsx:360`). No hay ningún otro emisor en todo el camino del home (grep repo-wide confirmado).
2. Si se borra `HeroCanvas`/`<Canvas>`, `markLogoReady()` nunca se llama, `logoReadyRef` queda en `false` para siempre, y `waitForLogoReady()` nunca resuelve por sí sola.
3. Pero el orquestador nunca espera esa promesa sola — siempre la carrera contra el timer duro (`Preloader.tsx:119`). Como `wait()` usa `setTimeout`, siempre gana la carrera a los 2500ms. **No hay cuelgue.**
4. Efecto neto de borrar el canvas sin tocar `Preloader.tsx`: **cada carga del home paga los 2500ms completos del gate, con certeza del 100%.** Hoy es un tope (a veces mucho más rápido si el SVG carga rápido); sin el canvas, se vuelve un costo fijo garantizado. **Es una regresión, no una mejora**, salvo que también se edite `Preloader.tsx`/`Hero.tsx` para saltar o acortar ese paso.
5. El resto de la coreografía (pasos 3 a 9 de B.2 — fade del velo, texto, trazo/relleno del logo, hold de lectura, borrado de texto, compresión) corre sobre `MotionValue`s y `setTimeout`s puros de `Preloader.tsx`, **sin ningún chequeo condicionado a si el 3D existe**. `logoStrokeProgress`/`logoFillProgress` (SVG 2D, `LogoStrokeOverlay.tsx`) y `textReveal` (`IntroLockupText.tsx`) seguirían animando sus duraciones completas igual, aunque no haya nada 3D detrás.
6. **Conclusión:** el 3D es opcional para el render, pero NO para la orquestación. No existe ninguna rama tipo "si no hay canvas 3D, saltar directo a X" en `Preloader.tsx`, `Hero.tsx` ni `PreloaderContext.tsx`.

**La cita exacta que decide todo esto** (`Preloader.tsx:119`):
```ts
await Promise.race([waitForLogoReady(), wait(LOGO_READY_TIMEOUT_MS)]);
```

## B.5 ¿`MarketingIntro` comparte código con la coreografía del home?

**Mayormente independiente, implementación duplicada, con una capa chica compartida de UI/utilidades.**

**Comparte:**
- `LogoStrokeOverlay.tsx` — `Hero.tsx:6` y `MarketingIntro.tsx:11`.
- `IntroLockupText.tsx` — `Hero.tsx:7` y `MarketingIntro.tsx:12` (marketing solo importa `WRITE_MS`/`TEXT_LEAD_MS`, no borra texto así que no usa `ERASE_MS`).
- `isAutomationEnvironment()` de `PreloaderContext.tsx:70-85` — importado por `MarketingIntro.tsx:9`. Es lo **único** que `MarketingIntro` toma de `PreloaderContext` — no usa `usePreloader()`, ni `phase`, ni los MotionValues compartidos.
- `useLenis()` de `SmoothScroll.tsx` — ambos.

**NO comparte (reimplementación independiente):**
- **Gate de readiness:** `MarketingIntro.tsx:142-170` reimplementa byte a byte el patrón de `PreloaderContext.tsx:104-122`, sin importarlo. Constante propia `MARKETING_READY_TIMEOUT_MS = 2500` (`MarketingIntro.tsx:38`).
- **Canvas 3D:** `BrandedIntroCanvas.tsx` — su propio `<Canvas>`, su propio `LogoReadySignal` (`BrandedIntroCanvas.tsx:54-70`). El comentario en `BrandedIntroCanvas.tsx:51-53` dice explícitamente: *"Readiness LOCAL... NO usa los helpers del contexto (aislado del flujo del home)"*.
- **Lock de scroll:** `MarketingIntro.tsx:122-131` define su propio `lockScroll`/`unlockScroll`, tocando `document.documentElement`/`document.body` + `lenisRef.current`. No comparte función con `Hero.tsx:121-133`.
- **Máquina de estados:** `MarketingIntro` no tiene enum `phase` — es un `async run()` lineal con booleans locales (`done`, `mouseFollowEnabled`).
- **Red de seguridad:** propio `MARKETING_SCROLL_SAFETY_MS = 6000` (`MarketingIntro.tsx:46,348`), un `useEffect`/`setTimeout` separado — el comentario (`MarketingIntro.tsx:39-45`) documenta que es "MISMO mecanismo y MISMO umbral que el Hero" pero es código duplicado, no una función compartida.

**Implicación directa:** eliminar el 3D del home tiene **cero efecto de código sobre `MarketingIntro`** — no comparten canvas, promesa de readiness, máquina de estados, ni lock de scroll. Las 5 rutas de marketing seguirían con su intro completo intacto.

## B.6 Tabla de timing completa (para construir el presupuesto de E)

### Home (`Preloader.tsx`)

| Valor | Constante | Archivo:línea | Fase |
|---|---|---|---|
| 2500ms | `LOGO_READY_TIMEOUT_MS` | `Preloader.tsx:27`, await `:119` | `drawing` — gate de 3D |
| 1400ms (300ms reducido) | `VEIL_FADE_SECONDS` | `Preloader.tsx:24`, `:130` | `filling` |
| 150ms | `STEP_DELAY_SECONDS` | `Preloader.tsx:25`, `:138` | filling→text |
| 1500ms | `WRITE_MS` | `IntroLockupText.tsx:20`, `Preloader.tsx:157-159` | text (no bloqueante) |
| 400ms | `HOME_CANVAS_FADEIN_SECONDS` | `Preloader.tsx:34`, `:166-169` | text (no bloqueante, desktop) |
| 550ms | `HOME_DOTS_REVEAL_SECONDS` | `Preloader.tsx:33`, `:170-173` | text (no bloqueante, desktop) |
| 850ms | `HOME_STROKE_SECONDS` | `Preloader.tsx:30`, `:174-177` | text (bloqueante) |
| 450ms | `HOME_FILL_SECONDS` | `Preloader.tsx:31`, `:179-182` | text (bloqueante) |
| 400ms | `HOME_CROSSFADE_SECONDS` | `Preloader.tsx:32`, `:186-189` | text (bloqueante, solo desktop) |
| 1500ms | `READ_HOLD_MS` | `IntroLockupText.tsx:21`, `Preloader.tsx:193` | text (bloqueante) |
| 1500ms | `ERASE_MS` | `IntroLockupText.tsx:22`, `Preloader.tsx:197-200` | text (bloqueante) |
| 780ms (300ms reducido) | `COMPRESS_SECONDS` | `Preloader.tsx:26`, `:260-263` | flying (bloqueante, desktop) |
| 240ms (120ms reducido) | inline | `Preloader.tsx:270` | swapping (bloqueante) |
| 6000ms | inline | `Hero.tsx:164` | red de seguridad independiente |

**Suma de la cadena bloqueante desktop, sin el gate:** 1400+150+850+450+400+1500+1500+780+240 = **7270ms**. Sumando el peor caso del gate (2500ms) → **≈9770ms**, en línea con el ~10,4s medido (diferencia de ~0,6s no verificada, probablemente RAF/paint/carga de assets no capturados en las constantes).

### Marketing (`MarketingIntro.tsx`)

| Valor | Constante | Archivo:línea |
|---|---|---|
| 2500ms | `MARKETING_READY_TIMEOUT_MS` | `MarketingIntro.tsx:38,233` |
| 420ms | `MARKETING_SETTLE_MS` | `MarketingIntro.tsx:27,252` |
| 1500ms | `WRITE_MS` (compartida) | `MarketingIntro.tsx:200-203` |
| 550ms | `MARKETING_DOTS_REVEAL_SECONDS` | `MarketingIntro.tsx:28,269-272` |
| 850ms | `MARKETING_STROKE_SECONDS` | `MarketingIntro.tsx:29,206-209` |
| 450ms | `MARKETING_FILL_SECONDS` | `MarketingIntro.tsx:30,211-214` |
| 400ms | `MARKETING_CROSSFADE_SECONDS` | `MarketingIntro.tsx:31,288-291` |
| 1000ms | `MARKETING_INTERACT_MS` | `MarketingIntro.tsx:32,298` |
| 800ms | `MARKETING_LIFT_SECONDS` | `MarketingIntro.tsx:36,221-224` |
| 6000ms | `MARKETING_SCROLL_SAFETY_MS` | `MarketingIntro.tsx:46,348` |

**Suma bloqueante desktop, sin el gate:** 420+850+450+400+1000+800 = **3920ms**. Con el gate (0–2500ms según velocidad real de carga) → **≈3,9s–6,4s**, consistente con el ~5-6s medido.

---

# C. Anclas de navegación y acoplamiento con el chatbot

## C.1 Tabla de anclas del home

| id | Definido en | Referenciado por |
|---|---|---|
| `inicio` | `Hero.tsx:175` | `Navbar.tsx:26` (`MAIN_NAV_ITEMS`), `:56` (`HASH_TO_LABEL`), `:172` (fallback de IntersectionObserver) · `DynamicDock.tsx:35` |
| `nosotros` | `About.tsx:411` (variante mobile) y `:471` (variante desktop) — dos elementos del DOM comparten el id simultáneamente | `Navbar.tsx:27,57` · chatbot `navigateToPage.ts:20,48` |
| `portfolio` | `Portfolio.tsx:726` | `Navbar.tsx:28` (`MAIN_NAV_ITEMS`, grafía correcta "portfolio"), `:58` (`HASH_TO_LABEL`) |
| `servicios` | `OurServices.tsx:9632` (más un id-señuelo `servicios-siguiente-paso` en `:9002`, un CTA interno sin consumidores de nav) | `Navbar.tsx:29,59` · `TransitionContext.tsx:28,41` (caso especial de centrado) · chatbot `navigateToPage.ts:23,51` |
| `caracteristicas` | `WhyDevelOP.tsx:1629` | `Navbar.tsx:30,60` · `TransitionContext.tsx:28,41` (caso especial de centrado). **El chatbot no lo conoce** — no hay `/#caracteristicas` en su `VALID_PATHS` |
| `testimonials` | `InfiniteReviews.tsx:368` | **Ninguno** — sin referencia en Navbar/Dock/footer/chatbot |
| `about` | `About.tsx:523` (envuelve ambas variantes de `nosotros`) | **Ninguno** |
| `calculadora` | `CalculadoraAutomation.tsx:955` | Solo el chatbot (`navigateToPage.ts:22,50`) — el componente se monta únicamente en `/process-automation` (`src/app/process-automation/page.tsx:107`), nunca en el home |

## C.2 Las dos anclas ya rotas (re-confirmadas hoy)

- **`/#portafolio`** — `navigateToPage.ts:21`. Grafía con **"a"**. El id real es `id="portfolio"` (`Portfolio.tsx:726`, con **"o"**). Nunca coincidió, y sigue sin coincidir hoy.
- **`/#calculadora`** — `navigateToPage.ts:22`, descripta en `navigateToPage.ts:50` como *"calculadora ROI en home"*. El único `id="calculadora"` del repo está en `CalculadoraAutomation.tsx:955`, montado exclusivamente en `/process-automation`. Confirmado que `src/app/page.tsx` (home) no importa `CalculadoraAutomation` en ninguna parte de su composición.

No se corrige ninguna de las dos — solo se documenta.

## C.3 La herramienta `navigateToPage` del chatbot, completa

Definida en `src/modules/chatbot/server/tools/navigateToPage.ts`, `VALID_PATHS` (`:15-24`):

| Destino | Línea | Estado hoy |
|---|---|---|
| `/web-development` | `:16` | ✅ existe |
| `/ai-implementations` | `:17` | ✅ existe |
| `/process-automation` | `:18` | ✅ existe |
| `/software-development` | `:19` | ✅ existe |
| `/#nosotros` | `:20` | ⚠️ existe hoy, pero es una de las anclas que muere en el rediseño |
| `/#portafolio` | `:21` | ❌ roto (grafía) |
| `/#calculadora` | `:22` | ❌ roto (ancla en la página equivocada) |
| `/#servicios` | `:23` | ⚠️ existe hoy, también en riesgo por el rediseño |

Registrada como `navigate_to_page` en `getTools.ts:16` → `buildNavigateToPageTool()`. Es una tool **client-side, sin `execute`** (`navigateToPage.ts:57`) — se renderiza vía `renderToolCall.tsx:66-77` → `NavigateToPageCard.tsx`, y el click en "Llevame ahí" (`NavigateToPageCard.tsx:35-45`) dispara `onNavigate(path)`.

**Hallazgo nuevo, no estaba en el censo previo — el mecanismo de navegación del propio widget del sitio salta `TransitionContext`:** `LogicCompanion.tsx:162` (`onNavigate: chatbot.navigateTo`) resuelve en `useChatbot.ts:485-488`:
```ts
const navigateTo = useCallback((path: string) => {
    if (typeof window === 'undefined') return
    window.location.href = path
}, [])
```
Es una **recarga completa de página** (`window.location.href`), no `router.push` y mucho menos `triggerTransition()` — contradice directamente la regla de `CLAUDE.md` raíz ("Sitio público: usar siempre `triggerTransition()`. Nunca `router.push()`"). Consecuencia práctica: incluso para las dos anclas que hoy sí resuelven (`#nosotros`, `#servicios`), el chatbot nunca ejecuta el centrado especial de `TransitionContext.tsx:28,41` — depende del scroll-to-hash nativo del navegador tras el reload completo.

*(Nota aparte, fuera del alcance de home/nav: `ChatbotEmbed.tsx:114-117` tiene su propio `handleNavigate` vía `postMessage` para el widget embebible de terceros — `src/app/embed/[slug]/page.tsx` — una superficie de producto distinta, no del chrome del sitio propio.)*

## C.4 `TransitionContext.tsx` — anclas hardcodeadas (frozen)

Archivo completo leído (176 líneas). Strings de id hardcodeados:
- `:28` — `if (targetId === 'servicios' || targetId === 'caracteristicas')` dentro de `executeScroll`.
- `:41` — mismo par, `const shouldCenter = targetId === 'servicios' || targetId === 'caracteristicas';` (rama de fallback cuando Lenis no está listo).
- `:75,78-79,93` — menciones de `"/#portfolio"`/`"#portfolio"`/`"/#servicios"` **en comentarios**, no en lógica.

**Qué pasa si se saca un id del home (trazado del código, no especulación):** `executeScroll(targetId)` (`:24-47`) es un no-op doblemente guardado:
```
const element = document.getElementById(targetId);
if (element && lenis) { ... }
else if (element) { ... }
```
Ambas ramas exigen `element` truthy. Si `getElementById` devuelve `null`, **ninguna rama corre** — no hay `else`, no hay throw, no hay redirect, no hay warning en consola. La función retorna sin hacer nada.

- **Caso mismo-path** (`triggerTransition`, `:84-88`): `triggerScrollTo` igual corre toda su coreografía — `isAnimating=true`, `lenis.stop()`, espera 300ms, llama al `executeScroll` ahora no-op, espera otros 300ms, `isAnimating=false`, `lenis.start()`. Efecto visible: **no hay scroll**, pero ~600ms de overhead de animación/lock corren igual.
- **Caso cross-page** (`:90-104`, ej. el chatbot linkeando `/#nosotros` desde `/contact`): `router.push(target)` navega igual con el hash muerto en la URL, después tres intentos más de `executeScroll` a los 10/150/300ms, `isAnimating` se limpia a los 400ms. Efecto: la URL muestra el hash muerto, el navegador aterriza en el tope de la página, sin scroll ni redirect de fallback.

Es decir: **sin fallback y sin throw** — degrada a un link silenciosamente muerto (la URL cambia/queda con el hash, pero no hay scroll), envuelto en el overhead de animación de todos modos.

---

# D. Nav y dock

## D.1 Componentes

- `src/components/layout/Navbar.tsx` — default export `Navbar` + `getNavItems`. **No existe un archivo `MobileNav`/hamburguesa separado** — el menú mobile (botón hamburguesa, sheet, `isMobileMenuOpen`) vive entero dentro de `Navbar.tsx:122,213-410`. Confirmado por grep — cero matches de `MobileNav|hamburger|MobileMenu` en el resto de `src/`.
- `src/components/layout/DynamicDock.tsx` — default export `DynamicDock`, el dock desktop. Se renderiza *desde dentro* de `Navbar.tsx:211` (`<DynamicDock />`) — `Navbar` es la raíz de composición de ambos.

**Montaje:** una sola vez, `layout.tsx:93`, dentro de `<PublicOnlyComponents>`. Como el layout raíz envuelve toda ruta que no sea portal, **la misma instancia de `Navbar`/`DynamicDock` se usa en home, en las 4 landings y en `/contact`** — no hay componentes de nav por ruta. El comportamiento por ruta viene solo de `getNavItems(pathname)` (`Navbar.tsx:43-53`), no de instancias distintas.

**Hallazgo nuevo, fuera del alcance del censo previo — anclas rotas en las 4 landings, independientes del rediseño del home:**
Para cualquier ruta en `SERVICE_ROUTE_SET` (`/web-development`, `/ai-implementations`, `/software-development`, `/process-automation`), `getNavItems` (`Navbar.tsx:44-51`) genera:
```
{ href: `${pathname}#hero`, label: "Inicio" },
{ href: `${pathname}#proceso`, label: "Proceso" },
{ href: `${pathname}#faq`, label: "FAQ" },
```
Verificado contra los ids reales de esas 4 páginas:
- `id="hero"` — **no existe en ningún lugar de `src/`.** Roto en las 4 páginas.
- `id="proceso"` — existe solo en `ProcesoAutomation.tsx:832`, montado solo en `/process-automation`. Roto en las otras 3.
- `id="faq"` — **no existe en ningún lugar de `src/`** (los componentes de FAQ solo tienen ids decorativos de SVG, no un id de sección). Roto en las 4.

Es decir: el menú mobile por-servicio está roto para `Inicio`/`FAQ` en las 4 páginas, y para `Proceso` en 3 de 4. `DynamicDock` no genera estos hashes (su `NAV_ITEMS`, `:34-41`, es una lista fija) — la trampa es exclusiva del menú mobile, mismo patrón que el censo previo encontró para las anclas del home.

## D.2 Estado que maneja

**`Navbar.tsx`:**
- `activeTab` (`:121`) — derivado de `getActiveTab(pathname, hash)` (`:66-69`) al montar/cambiar de ruta, y actualizado en vivo por un `IntersectionObserver` (`:151-189`) que observa **todo** `section[id], div[id]` del documento (no acotado a los targets conocidos del nav).
- `isMobileMenuOpen`, `isServicesExpanded`, `isDockVisible` (`:122-124`) — estado de UI local; `isDockVisible` usa `useScroll`/`useMotionValueEvent` de Framer Motion (`:126-149`), **no Lenis**.
- Consume `useTransitionContext()` en `:116` y `:90` (`AccederButton`) — solo destructura `triggerTransition`, nunca lee `isAnimating`.
- **No** llama a `useThemeSection`/`useTheme` en ningún lado (grep confirmado, cero matches).

**`DynamicDock.tsx`:**
- `activeTab`, `hoveredTab`, `scrollDirection`, `scrollPosition`, `viewportHeight`, `hoverExpanded` (`:381-386`) — todos derivados de listeners nativos `window.addEventListener("scroll"/"resize", ...)` (`:419-457`), independientes de Lenis **y** del tracking de scroll de `Navbar`. Son dos listeners de scroll sin coordinar entre sí.
- `lightLevel` (`:390`, vía `getLightLevel(scrollPosition, viewportHeight)`, `:56-62`) — heurística de luz/oscuridad **reimplementada localmente** por umbrales de posición de scroll, arquitectónicamente separada del sistema `ThemeContext`/`useThemeSection`. No es incidental: `ThemeProvider` solo existe en `page.tsx:23` (dentro del árbol del home), mientras que `Navbar`/`DynamicDock` se montan en el layout raíz, **por encima y afuera** de ese provider — `DynamicDock` no podría llamar `useTheme()` aunque quisiera, tiraría excepción.
- Visibilidad (`dockVisible`, `:376`) viene de `useChromeRevealed()` (que lee `PreloaderContext`) — un tercer contexto distinto, ni `TransitionContext` ni `ThemeContext`.
- Consume `useTransitionContext()` en `:135` (`DockCta`) y `:221` (`DockItem`) — igual, solo `triggerTransition`.
- **No** usa `useThemeSection` (grep confirmado).

## D.3 Resumen de consumo de hooks

| Hook | `Navbar.tsx` | `DynamicDock.tsx` |
|---|---|---|
| `useTransitionContext` | `:116` (componente), `:90` (`AccederButton`) | `:135` (`DockCta`), `:221` (`DockItem`) |
| `useThemeSection`/`useTheme` | no usado | no usado |
| `useChromeRevealed` (→ `PreloaderContext`) | no usado | `:376` |
| Lenis (`useLenis`) | no usado | no usado |
| Scroll listeners | Framer `useScroll`/`useMotionValueEvent` | `window.addEventListener` nativo |

---

# E. Presupuesto

## E.1 Peso de JS que desaparecería del bundle inicial del home

Metodología: `npm run build` (Next 16, `--webpack`) sobre esta rama (@`e06e3c4`). **Next 16 con `--webpack` ya no imprime la tabla "First Load JS" por ruta** (limitación conocida del proyecto, ver `docs/probe-monolito-censo.md`/memoria de auditorías previas), así que se reconstruyó el grafo de chunks a mano desde `.next/react-loadable-manifest.json` para los tres puntos de import dinámico relevantes: `Hero.tsx → HeroCanvas`, `MarketingIntro.tsx → BrandedIntroCanvas`, y `login/forgot-password/accept-invite → DotMatrix`.

**Hallazgo central: la mayor parte del peso de Three.js/R3F/Drei NO se libera al sacar el 3D del home, porque `BrandedIntroCanvas` (que sigue vivo en 5 rutas de marketing) y `DotMatrix` (que sigue vivo en 3 rutas de producto) consumen los mismos chunks compartidos.**

Chunks que carga el import dinámico de `HeroCanvas` desde `Hero.tsx`:

| Chunk | Raw | Gzip | ¿También lo usa `BrandedIntroCanvas`? | ¿También lo usa `DotMatrix`? |
|---|---|---|---|---|
| `bd904a5c-4478dc95da06428f.js` | 372.244 B | 99.438 B | Sí | Sí |
| `b536a0f1-fe5cb2bffc18b145.js` | 349.423 B | 84.683 B | Sí | Sí |
| `b79b7286-411bd9c9795b3e9c.js` | 146.468 B | 46.294 B | Sí | Sí |
| `f6211eb1.950b619bf5511f01.js` | 88.203 B | 66.803 B | Sí | No |
| `a3cd4a83.b78043e7e8650c0d.js` | 82.636 B | 19.321 B | Sí | No |
| `8471.07b6710618483e5c.js` | 80.177 B | 28.603 B | Sí | No |
| `4857-4efc2e1f80377e6b.js` | 13.501 B | 5.407 B | Sí | Sí |
| `4198.229c43b7b072ac9a.js` (único de `HeroCanvas`) | 9.557 B | 3.749 B | **No** | No |
| **Total del set de `HeroCanvas`** | **1.142.209 B (~1,09 MB)** | **354.298 B (~346 KB)** | | |

**Lectura correcta de esta tabla — dos cifras distintas, no confundirlas:**
- **Lo que baja el fetch propio del home** al sacar `HeroCanvas`: los **~346 KB gzip** completos, porque hoy el home es quien dispara la descarga de todo ese set vía su propio `dynamic(..., {ssr:false})`. Esto sí pega directo en el presupuesto de "JS inicial" de la ruta `/`.
- **Lo que realmente desaparece de la aplicación** (deja de compilarse/servirse en cualquier ruta): solo el chunk **`4198` (9.557 B raw / 3.749 B gzip)**, el único que no comparte nadie más. Los otros 7 chunks (~342,5 KB gzip) siguen siendo necesarios porque `BrandedIntroCanvas` (5 landings) y/o `DotMatrix` (`/login`, `/forgot-password`, `/accept-invite`) los siguen importando.

De las piezas **SOLO HOME** de la sección A (`EarlyScrollLock`, `HeroCanvas`, `HeroArtifact`, `TypewriterText`, `KineticText`, `MagneticCta`, `useThemeSection`), la única con peso de bundle medible es el conjunto `HeroCanvas`/`HeroArtifact` de arriba — el resto son componentes 2D pequeños (ver tamaños de fuente en la tabla siguiente, unos pocos KB sin comprimir cada uno, sin dependencias pesadas propias).

| Archivo SOLO HOME | Tamaño fuente (sin comprimir) |
|---|---|
| `HeroCanvas.tsx` | 17.076 B |
| `HeroArtifact.tsx` (frozen) | 5.666 B |
| `Preloader.tsx` (COMPARTIDA con marketing, no cuenta acá) | 14.492 B |
| `TypewriterText.tsx` | 2.632 B |
| `KineticText.tsx` | 1.300 B |
| `MagneticCta.tsx` | 7.005 B |
| `SectionTransition.tsx` (huérfana) | 752 B |
| `EarlyScrollLock.tsx` | 2.008 B |

**Conclusión de E.1:** el número honesto para "cuánto se libera del bundle inicial del home" es **~346 KB gzip** (el fetch que el home deja de disparar), no ~354 KB de bundle "eliminado de la app" — de esos, solo ~3,7 KB gzip realmente deja de existir en el disco de build. El resto de tres.js/r3f/drei sigue viviendo en el bundle de las 5 landings y las 3 rutas de auth.

## E.2 Atribución del tiempo hasta liberación de scroll (~10,4s medidos)

Usando la tabla de B.6 (home, desktop, camino no-reducido):

| Fase | Duración | % del total (9.770ms nominal) |
|---|---|---|
| Gate de readiness del 3D (`drawing`) | 2500ms (peor caso) | 25,6 % |
| Fade del velo (`filling`) | 1400ms + 150ms | 15,9 % |
| Trazo + relleno + crossfade del logo (`text`, bloqueante) | 850+450+400 = 1700ms | 17,4 % |
| Hold de lectura (`text`) | 1500ms | 15,4 % |
| Borrado de texto (`text`) | 1500ms | 15,4 % |
| Compresión/vuelo del logo (`flying`) | 780ms | 8,0 % |
| Swap final (`swapping`) | 240ms | 2,5 % |
| **Total nominal** | **9.770ms** | **100 %** |

El **gate de 3D es la fase individual más cara (25,6 %)**, pero **no es la única atribuible al 3D**: el crossfade de 400ms (`HOME_CROSSFADE_SECONDS`) también es un paso pensado específicamente para la transición 2D→3D y desaparecería con el 3D. Sumando ambos: **2900ms de 9.770ms (≈29,7 %) del tiempo hasta scroll son directamente atribuibles al 3D del home** — el resto (≈70 %) es coreografía de texto/velo que no depende del 3D y seguiría corriendo igual aunque se saque el canvas (ver B.4).

Nota de honestidad: el ~10,4s medido en el sprint anterior no fue reproducido con profiling en este PROBE — la comparación es entre la suma de constantes leídas en código (9.770ms) y la cifra medida. La diferencia de ~0,6s se atribuye tentativamente a RAF/paint/carga de assets no capturados por las constantes, pero **no está verificada**.

## E.3 Qué queda del presupuesto D9

Baseline dado para esta rama: **JS inicial ~1,53 MB**. Objetivos D9: LCP mobile < 2,5s · JS inicial < 300 KB · Lighthouse mobile ≥ 80.

No se pudo reproducir el número de "JS inicial ~1,53 MB" con esta build porque, como se documentó arriba, `next build --webpack` en Next 16 no imprime la tabla de "First Load JS" por ruta — se tomó el baseline como dato dado, no verificado de forma independiente en este PROBE.

Con el único dato duro que sí se pudo medir (E.1): sacar `HeroCanvas`/`HeroArtifact` del home baja el fetch propio de la ruta `/` en **~346 KB gzip**. Aplicado sobre el baseline de ~1,53 MB (asumiendo que esa cifra es gzip o una métrica comparable — no verificado):

- **1,53 MB − 0,346 MB ≈ 1,18 MB.** Sigue **muy por encima** de los 300 KB objetivo. Sacar el hero 3D es la eliminación individual más grande de la lista A, pero **no alcanza ni de cerca** para cumplir el objetivo de JS inicial por sí sola — falta más de 4× ese presupuesto.
- Las demás piezas SOLO HOME (`TypewriterText`, `KineticText`, `MagneticCta`, `SectionTransition`, `EarlyScrollLock`, `useThemeSection`) no tienen dependencias pesadas propias — son componentes 2D de pocos KB cada uno sin librerías externas — así que su aporte al presupuesto de 300 KB es marginal comparado con el 3D.
- El monolito `OurServices.tsx` (9.898 líneas / 355 KB de fuente, censado en `docs/probe-monolito-censo.md`) está fuera del scope de piezas listadas en este PROBE, pero es la otra pieza de peso comparable al hero 3D en el home — cualquier plan de presupuesto D9 necesita contarlo también.
- No se pudo estimar el impacto en LCP mobile ni en el score de Lighthouse sin correr Lighthouse contra un build servido — **no verificado en este PROBE** (ver sección final).

---

# Tabla resumen final

| Pieza | Veredicto | Consumidores fuera de home | KB que libera (gzip, medido) | Riesgo de sacarla |
|---|---|---|---|---|
| `Preloader` | COMPARTIDA | Orquesta también el intro de 5 rutas de marketing | — (orquestador, no pesa por sí solo) | Alto si se borra entero — mata el intro de marketing también |
| `MarketingIntro` | COMPARTIDA (ajena al home) | 5 rutas de marketing, **nunca el home** | — | Bajo para B2 (no toca home), alto si se borra por error asumiendo que es "del hero" |
| `BrandedIntroCanvas` | COMPARTIDA (ajena al home) | 5 rutas de marketing | — | Cero acoplamiento de import con el hero del home |
| `EarlyScrollLock` | SOLO HOME (en efecto) | ninguno (montaje global inocuo) | despreciable (2 KB fuente) | Bajo, pero debe coordinarse con `Hero.tsx` |
| `HeroCanvas` | SOLO HOME | ninguno | **~346 KB** (fetch propio del home; solo ~3,7 KB de eso deja de existir en la app) | Medio — es la eliminación de mayor impacto de bundle, pero exige editar `Preloader.tsx` para no regresar el timing (B.4) |
| `HeroArtifact` (frozen) | SOLO HOME | ninguno | incluido en el set de `HeroCanvas` | Bajo — frozen, solo queda sin importar |
| `DotMatrix`/`DotMatrixMesh` | **COMPARTIDA — crítico** | `/login`, `/forgot-password`, `/accept-invite` | 0 si se toca bien (solo el call-site en `HeroCanvas`) | **Alto si se borra el archivo entero** — rompe 3 rutas de producto |
| `CustomCursor` | COMPARTIDA (global) | todas las rutas | — | Fuera de alcance de B2 |
| `NoiseOverlay` | COMPARTIDA (global) | todas las rutas | — | Fuera de alcance de B2 |
| `TypewriterText` | SOLO HOME | ninguno vivo (1 consumidor muerto: `AIBentoGrid.tsx`) | despreciable (2,6 KB fuente) | Bajo |
| `IntroLockupText` | COMPARTIDA | `MarketingIntro` (5 rutas) | — | Alto si se borra — rompe el texto de marketing |
| `LogoStrokeOverlay` | COMPARTIDA | `MarketingIntro` (5 rutas) | — | Alto si se borra — rompe el trazo de marketing |
| `KineticText` | SOLO HOME | ninguno | despreciable (1,3 KB fuente) | Bajo |
| `MagneticCta` | SOLO HOME | ninguno (4 landings tienen duplicados locales, no importan esta) | despreciable (7 KB fuente) | Bajo |
| `SectionTransition` | HUÉRFANA | ninguno — código muerto autodocumentado | despreciable (0,7 KB fuente) | Ninguno, ya está muerto |
| `useThemeSection` | SOLO HOME | ninguno vivo | — (hook, sin peso de bundle propio) | Bajo, pero requiere `ThemeProvider` (solo existe en home) |
| `TransitionContext` (frozen) | **COMPARTIDA — fuertemente** | chrome público global + `OurServices` (home) + setter + admin + chatbot admin | — (frozen, no se toca) | No aplica — no se puede modificar |
| `Navbar`/`DynamicDock` | COMPARTIDA (global) | home + 4 landings + `/contact`, misma instancia | — | Ya tiene anclas rotas hoy en las 4 landings (`#hero`/`#faq`/`#proceso` en 3 de 4), independiente del rediseño |

---

# Lo que se rompe si se elimina sin reemplazo

- **Borrar `Preloader.tsx` entero** (en vez de solo su rama home) mata el intro de las 5 rutas de marketing (`/web-development`, `/ai-implementations`, `/software-development`, `/process-automation`, `/contact`), porque es el único punto de montaje de `MarketingIntro` (A.1, A.2).
- **Borrar o vaciar `DotMatrix.tsx`** rompe el fondo decorativo de `/login`, `/forgot-password` y `/accept-invite` — tres pantallas de producto/auth (A.7).
- **Borrar `IntroLockupText.tsx` o `LogoStrokeOverlay.tsx`** rompe el intro visual de las 5 rutas de marketing, no solo el del home (A.11, A.12).
- **Sacar el canvas 3D del home sin editar `Preloader.tsx`** no acorta la coreografía — la deja pagando siempre el tope de 2500ms del gate de readiness, más el crossfade de 400ms que queda animando contra nada (B.4). Es una regresión de timing si no se acompaña de una edición explícita del orquestador.
- **Cualquier ancla que se saque del home** (`#nosotros`, `#servicios`, `#caracteristicas`, `#portfolio`) queda como link muerto en `Navbar.tsx` (`MAIN_NAV_ITEMS`/`HASH_TO_LABEL`, líneas 26-30/56-60) y, para `#nosotros`/`#servicios`, en la tool `navigate_to_page` del chatbot (`navigateToPage.ts:20,23,48,51`) — sin crash, pero el link no hace nada (C.4). `#servicios`/`#caracteristicas` además son el caso especial hardcodeado de `TransitionContext.tsx:28,41` (frozen) — su lógica de centrado queda huérfana, no rota, porque el guard `if (element && ...)` la neutraliza silenciosamente.
- **`OurServices.tsx` es consumidor de `TransitionContext`** (`OurServices.tsx:9453`, hallazgo nuevo no cubierto por el censo previo) — si el bloque nuevo de B2 reemplaza `OurServices.tsx` sin trasladar esa llamada a `triggerTransition`, se pierde el único punto donde el contenido del home (no el chrome) dispara una transición de nav.
- **El menú mobile de las 4 landings ya tiene 3 links muertos hoy** (`#hero`, `#faq` en las 4; `#proceso` en 3 de 4) — independiente del rediseño del home, no se "rompe" con B2 pero tampoco se arregla solo; si B2 toca `Navbar.tsx`/`getNavItems`, es la oportunidad de anotarlo.
- **Si se retira `PreloaderProvider` o se cambia la firma de `usePreloader`/`useChromeRevealed`** sin ajustar `ChatWidgetMount.tsx` y `DynamicDock.tsx`, ambos truenan en cualquier ruta (incluidas las de producto), porque llaman al hook incondicionalmente antes de su propio gate de ruta (A — nota cruzada en el reporte de consumidores del primer agente).

---

# Lo que no se pudo verificar

1. **El ~10,4s medido en el sprint anterior no fue reproducido con profiling real** en este PROBE — solo se comparó contra la suma de constantes de timing leídas en código (9.770ms nominal). La diferencia de ~0,6s queda sin explicación verificada.
2. **El baseline "JS inicial ~1,53 MB"** no se pudo reproducir de forma independiente: `next build --webpack` en Next 16 ya no imprime la tabla de "First Load JS" por ruta (limitación conocida, ver notas de auditorías previas en memoria del proyecto). Se tomó el número dado por el brief como dato de entrada, no verificado en esta sesión.
3. **No se corrió Lighthouse ni ninguna medición de LCP/CWV** contra un build servido — el impacto de las eliminaciones en LCP mobile y en el score de Lighthouse no está medido, solo se infiere cualitativamente por el peso de JS retirado.
4. **No se pudo atribuir con precisión byte a byte qué librería vive en cada chunk compartido** (p. ej. si `a3cd4a83`/`f6211eb1`/`8471` son específicamente `@react-three/drei` o partes de `@react-three/postprocessing`) — el build está minificado sin sourcemaps inspeccionados; se buscaron strings distintivos (`ChromaticAberration`, `EffectComposer`, `Lightformer`) en los chunks únicos de cada canvas y no aparecieron literalmente (esperable en código minificado). La atribución de E.1 se hizo a nivel de "chunk completo compartido o no", no de librería individual.
5. **`id="testimonials"` (`InfiniteReviews.tsx:368`) y `id="about"` (`About.tsx:523`)** no tienen ningún consumidor de nav/dock/chatbot/footer — no se pudo determinar si es intencional (anclas reservadas para uso futuro) o un descuido, no hay comentario ni documentación en el repo que lo explique.
6. **La cifra exacta de cuánto tarda `waitForLogoReady()` en resolver hoy en producción** (vs. el tope de 2500ms) depende de velocidad de red/GPU del cliente real y no se puede determinar por lectura estática de código — el rango 0–2500ms usado en E.2/E.3 es el rango teórico completo, no una medición.
