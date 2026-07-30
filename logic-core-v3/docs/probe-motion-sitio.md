# PROBE — Motion del sitio público

**Fecha:** 2026-07-30 · **Commit:** `1c00949` · **Rama:** `main` · **Modo:** solo lectura (cero ediciones en `src/`)

Insumo de planificación para el rediseño "instrumento de precisión, editorial". No es bitácora de producto.

---

## 0. Alcance, método y correcciones al brief

### Rutas auditadas (solo sitio público)

| Ruta | Entry | Secciones |
|---|---|---|
| `/` | [page.tsx](../src/app/page.tsx) | Hero, About, Portfolio, InfiniteReviews, OurServices, PortalDemo, TodoIncluido, ModulosOpcionales, PortalDemoCTA, WhyDevelOP, Footer |
| `/web-development` | [page.tsx](../src/app/web-development/page.tsx) | 14 secciones |
| `/ai-implementations` | [page.tsx](../src/app/ai-implementations/page.tsx) | 9 secciones (`ia/*`) |
| `/process-automation` | [page.tsx](../src/app/process-automation/page.tsx) | 10 secciones (`automation/*`) |
| `/software-development` | [page.tsx](../src/app/software-development/page.tsx) | 11 secciones (`software/*`) |
| `/contact` | [page.tsx](../src/app/contact/page.tsx) | formulario + info |

**Chrome compartido en las 6 rutas** (desde [layout.tsx](../src/app/layout.tsx)): `CustomCursor`, `NoiseOverlay`, `SmoothScroll` (Lenis), `Shutter`, `Navbar`, `Preloader`, `DynamicDock`.

No se entró a `/admin/*`, `/dashboard/*`, `/setter/*`, `/login`, `/embed/*` ni al motor de WhatsApp.

### Reglas del skill aplicadas

Fuente: `improve-animations/AUDIT.md` (8 categorías) + `review-animations/STANDARDS.md` (10 estándares no negociables). Se citan por nombre en cada veredicto. Códigos usados abajo:

| Código | Regla |
|---|---|
| **R1** | Propósito y frecuencia — "se ve lindo" en algo visto seguido no es propósito |
| **R2** | Easing: entrada/salida = `ease-out`; `ease-in` en UI es hallazgo; curvas nativas son débiles |
| **R3** | Duración: UI < 300ms; marketing puede ser más largo |
| **R4** | Física y origen: nunca `scale(0)`; press = `scale(0.97)` @ 100–160ms |
| **R5** | Interrumpibilidad: transitions/springs, no keyframes, en lo re-disparable |
| **R6** | Performance: solo `transform`/`opacity`; nunca `transition: all`; nunca var CSS en el padre para transformar hijos; shorthands `x`/`y`/`scale` de Framer no son HW-accelerated |
| **R7** | Accesibilidad: `prefers-reduced-motion` (más suave, no cero); hover detrás de `@media (hover: hover)` |
| **R8** | Cohesión y tokens: curvas/duraciones como tokens compartidos; stagger 30–80ms |

### Tres correcciones al brief (medidas, no estimadas)

1. **No son ~47 `whileInView`, son 118** en 30 archivos públicos. Con 167 `viewport={{ once: true }}` y solo 2 `once: false` (ambos legítimos, ver §B.0).
2. **Los loops perpetuos no son "un marquee y unos paneles": son 156 `repeat: Infinity`** repartidos en 36 archivos públicos. El peor no es el marquee — es [WhyDevelOP.tsx](../src/components/sections/home/WhyDevelOP.tsx) con **31**.
3. **`sections/home/PortalDemo.tsx` (61 KB, 8 `whileInView`, 5 loops perpetuos) es código muerto.** Nadie lo importa — `page.tsx:15` monta `sections/portal-demo/PortalDemo`. Los "paneles que se auto-tipean en bucle" del brief viven parcialmente en ese archivo que **no se sirve**. Se audita el que sí ship.

### El hallazgo estructural que ordena todo lo demás

El repo **ya tiene** el sistema de motion correcto — y el sitio público no lo usa:

- [src/lib/motion-variants.ts](../src/lib/motion-variants.ts) define `standardEase`, `fadeUp`, `staggerContainer`, `buttonPress` (`scale: 0.97` + spring 600/25 — cumple **R4** al pie de la letra). **Consumidores en el sitio público: 0.** Sus 14 consumidores son todos `admin/*`, `dashboard/*` y `modules/chatbot`.
- [src/components/ui/Button.tsx](../src/components/ui/Button.tsx) tiene `motion-reduce:transition-none`, estados `disabled:`, y aplica `buttonPress` gateado por reduced-motion/disabled/loading (línea 53). **Importaciones desde el sitio público: 0.**

B2/B3 no necesitan inventar un sistema de motion. Necesitan **extender `motion-variants.ts` y adoptar `Button.tsx` cruzando la pared portal→público**.

---

## A. Inventario de motion

### A.0 — Chrome compartido (impacta las 6 rutas)

| # | Qué anima | Archivo:línea | Tipo | Parámetros | Disparador | Costo |
|---|---|---|---|---|---|---|
| A0.1 | Pulso de indicador del navbar | [Navbar.tsx:75](../src/components/layout/Navbar.tsx#L75) | loop perpetuo | `duration: 2.8`, `repeat: Infinity`, `easeInOut` | mount | Corre en **las 6 rutas, siempre**. Sin `once`. **Sin reduced-motion** (0 ocurrencias en el archivo) |
| A0.2 | Barrido/shine del navbar | [Navbar.tsx:107](../src/components/layout/Navbar.tsx#L107) | loop perpetuo | `duration: 1.05`, `repeatDelay: 3.95`, `easeInOut` | mount | Ídem A0.1 |
| A0.3 | Press de items del navbar | [Navbar.tsx:96-98](../src/components/layout/Navbar.tsx#L96) | hover/estado | `whileHover {y:-1}`, `whileTap {scale:0.98}`, spring 360/28 | pointer | Compuesto, barato |
| A0.4 | Cursor custom | [CustomCursor.tsx:23](../src/components/ui/CustomCursor.tsx#L23) | hover/estado | spring `damping:25, stiffness:150` | pointermove + rAF scroll | Reemplaza el cursor nativo en las 6 rutas. **Sin reduced-motion** |
| A0.5 | Dock magnético | [DynamicDock.tsx:94-98](../src/components/layout/DynamicDock.tsx#L94) | hover/estado | spring 150/15; `getBoundingClientRect()` por movimiento | pointermove | **Tiene** `useReducedMotion` + `PILL_INSTANT` (líneas 344-400) ✅ |
| A0.6 | Pulso/shine del dock | [DynamicDock.tsx:68](../src/components/layout/DynamicDock.tsx#L68), [:189](../src/components/layout/DynamicDock.tsx#L189) | loop perpetuo | 2.8s y 1.05s + `repeatDelay 3.95` | mount | Gateado por reduced-motion ✅ |
| A0.7 | Shutter de transición de página | [Shutter.tsx:14](../src/components/layout/Shutter.tsx#L14) | transición de página | `duration: 0.3`, `easeInOut` | `triggerTransition()` | 300ms, en presupuesto |
| A0.8 | Scroll smoothing (Lenis) | [SmoothScroll.tsx:53](../src/components/layout/SmoothScroll.tsx#L53) | rAF propio | `duration: 1.5` | rAF permanente | rAF de por vida en las 6 rutas. Es el elemento de "feel" más transversal del sitio |

### A.1 — `/` Home

| # | Qué anima | Archivo:línea | Tipo | Parámetros | Disparador | Costo |
|---|---|---|---|---|---|---|
| A1.1 | Grilla de fondo del hero (deriva vertical) | [Hero.tsx:519-521](../src/components/layout/Hero.tsx#L519) | loop perpetuo | `translateY: [0,64]`, `duration: 10`, `repeat: Infinity`, `linear` | `phase === 'done'` | `translateY` compuesto, pero **infinito y sin gate de reduced-motion** — `prefersReducedMotion` existe en el archivo (línea 413) y no se consulta acá |
| A1.2 | Canvas 3D del hero (logo + sombra + puntero) | [Hero.tsx:340-392](../src/components/layout/Hero.tsx#L340) | loop perpetuo (rAF de R3F) | `dpr={[1,1.5]}`, sin `frameloop` → `"always"` | mount | **3 `useFrame` activos** (HeroLogo:279, HeroLogoShadow:325, DesktopPointerSync:162) + `EffectComposer` con 3 pases (ChromaticAberration, Noise, Vignette) **cada frame, también fuera de viewport** |
| A1.3 | Grilla de puntos 3D | [DotMatrix.tsx:113+](../src/components/canvas/DotMatrix.tsx#L113) | loop perpetuo | 84×60 = **5.040 instancias**; onda `sin/cos` + `sqrt` de distancia al mouse por instancia por frame | `useFrame` | **Sí tiene gate por visibilidad** (`isVisibleRef`, líneas 102-113) ✅. Aun así: 5.040 × (2 trig + sqrt + compose Matrix4 + lerp Color) por frame es el costo CPU dominante del hero |
| A1.4 | Typewriter del H1 | [TypewriterText.tsx:57-63](../src/components/ui/TypewriterText.tsx#L57) | loop perpetuo | `typingSpeed: 70`, `deletingSpeed: 40`, `pauseDuration: 2000`, 4 keywords | `setTimeout` en cadena | Re-render de React cada 40–70ms **indefinidamente**. Ciclo completo ≈ 24s y vuelve a empezar. **Sin reduced-motion.** Cursor `blink-cursor 1s steps(1) infinite` (línea 77) |
| A1.5 | Reveal del contenido del hero | [Hero.tsx:635-718](../src/components/layout/Hero.tsx#L635) | entrada | `duration: 0.7`, `ease: [0.25,0.46,0.45,0.94]`, delays 0 / 0.08 / 0.16 / 0.28 / 0.42 / 0.56 | `phase` | `opacity`+`y`, compuesto ✅. Cascada total 1.26s |
| A1.6 | Marquee de 4 filas | [InfiniteReviews.tsx:279-330](../src/components/sections/home/InfiniteReviews.tsx#L279) | loop perpetuo (rAF propio) | 4 capas, `baseSpeed` 22/30/39/52, `perspective: 1000px`, `rotateX` | rAF **nunca detenido** | Ver §C.2 — el peor costo del sitio |
| A1.7 | Paneles auto-secuenciados de servicios | [OurServices.tsx:171-325](../src/components/sections/home/OurServices.tsx#L171) | demo secuenciada | 4 paneles × 4 tabs; `duration` 4500–11000ms + `HOLD 2000` + `ADVANCE_DELAY 300` | IntersectionObserver `threshold: 0.3` | Ver §C.3 |
| A1.8 | Ambiente del portal-demo | [portal-demo/PortalDemo.tsx:54](../src/components/sections/portal-demo/PortalDemo.tsx#L54), [:197](../src/components/sections/portal-demo/PortalDemo.tsx#L197) | loop perpetuo | 9s y 13s (`repeatDelay: 3.5`), `easeInOut` | mount | 2 loops de gradiente |
| A1.9 | Arco narrativo del portal-demo | [StoryArcLunes.tsx:35](../src/components/sections/portal-demo/StoryArcLunes.tsx#L35), [:49-51](../src/components/sections/portal-demo/StoryArcLunes.tsx#L49) | loop + entrada | loop 7.5s; reveal `duration: 0.65`, `delay: index * 0.04` | mount + scroll | Stagger 40ms ✅ (**R8**) |
| A1.10 | Mockups del portal-demo (health/attention/week) | [StoryMomentCard.tsx:41-195](../src/components/sections/portal-demo/StoryMomentCard.tsx#L41) | entrada | `scaleX/scaleY` de 0, `rotate: -8`, `duration` 0.45–0.7, `ease: [0.22,1,0.36,1]`, stagger 40ms | scroll, `once: true` | Transform+opacity ✅ |
| A1.11 | Hover de cards del portal-demo | [StoryMomentCard.tsx:248-252](../src/components/sections/portal-demo/StoryMomentCard.tsx#L248) | hover/estado | `whileHover {y:-4, scale:1.01, borderColor, boxShadow}` | hover | **`scale` en hover de card** (prohibido por la dirección nueva) + `boxShadow` y `borderColor` son **paint** |
| A1.12 | Glass de cards del portal-demo | [StoryMomentCard.tsx:264-265](../src/components/sections/portal-demo/StoryMomentCard.tsx#L264) | estático | `backdropFilter: blur(20px) saturate(180%)` | — | Glassmorphism — exactamente lo que se elimina. `blur(20px)` está en el límite de **R6** |
| A1.13 | Pulso de boxShadow del badge | [StoryMomentCard.tsx:296-305](../src/components/sections/portal-demo/StoryMomentCard.tsx#L296) | entrada (3 keyframes) | `boxShadow: [12px, 24px, 12px]`, `duration: 1.4`, `easeInOut` | scroll, `once: true` | Anima **box-shadow** = paint |
| A1.14 | Blur-in de bloques de texto | [StoryMomentCard.tsx:11](../src/components/sections/portal-demo/StoryMomentCard.tsx#L11) | entrada | `filter: blur(6px)` → `blur(0px)`, stagger 80ms | scroll | 4 textos × 3 cards animando `filter` |
| A1.15 | **11 loops perpetuos con reduced-path patológico** | [WhyDevelOP.tsx:868,885,897,902,907,937,950,961,966,970,984](../src/components/sections/home/WhyDevelOP.tsx#L897) | loop perpetuo | `duration: shouldSimplify ? 0.01 : N`, `repeat: Infinity` | mount | Ver §B.1 — **el hallazgo más severo del relevamiento** |
| A1.16 | Resto de loops de WhyDevelOP | WhyDevelOP.tsx (31 `repeat: Infinity` totales) | loop perpetuo | 1.2s–10.5s | mount | 20 loops adicionales |
| A1.17 | Reveals del Footer | [Footer.tsx](../src/components/sections/home/Footer.tsx) | entrada | 12 `whileInView` | scroll, `once: true` | El archivo con más reveals del sitio |

### A.2 — Landings de servicio (patrón compartido)

Las 4 landings replican la misma arquitectura: hero con canvas 2D propio + secciones con `whileInView` + demos con rAF + FAQ con acordeón.

| # | Qué anima | Ubicación | Tipo | Parámetros | Costo |
|---|---|---|---|---|---|
| A2.1 | Heroes con canvas 2D | [HeroIA.tsx:323](../src/components/ia/HeroIA.tsx#L323), [HeroSoftware.tsx:277](../src/components/software/HeroSoftware.tsx#L277), [HeroAutomation.tsx:814](../src/components/automation/HeroAutomation.tsx#L814), [DataPacketsCanvas.tsx:121](../src/components/automation/DataPacketsCanvas.tsx#L121) | loop perpetuo (rAF) | `draw()` recursivo | 4 canvas 2D animados, uno por landing. Todos con `useReducedMotion` ✅ |
| A2.2 | Contadores animados | [CalculadorIA.tsx:43](../src/components/ia/CalculadorIA.tsx#L43), [HeroMetrics.tsx:48](../src/components/ui/HeroMetrics.tsx#L48), [ShowcaseSoftware.tsx:251](../src/components/software/ShowcaseSoftware.tsx#L251) | entrada (rAF) | rAF con `t < 1` autolimitado | Correcto: el rAF termina ✅ |
| A2.3 | Focus por centro de viewport | [ComparadorIA.tsx:752](../src/components/ia/ComparadorIA.tsx#L752), [DemoIA.tsx:318](../src/components/ia/DemoIA.tsx#L318), [PipelineIA.tsx:1090](../src/components/ia/PipelineIA.tsx#L1090), [RubrosIA.tsx:726](../src/components/ia/RubrosIA.tsx#L726) | hover/estado | rAF en scroll | Patrón mobile de "hover por scroll". rAF por evento, no permanente ✅ |
| A2.4 | Partículas | [BentoIA.tsx:227](../src/components/ia/BentoIA.tsx#L227), [GarantiaIA.tsx:698](../src/components/ia/GarantiaIA.tsx#L698) | loop perpetuo | rAF | `GarantiaIA` no autolimita |
| A2.5 | `ease-in` explícito | [WebDevelopmentByRubro.tsx:148](../src/components/sections/web-development/WebDevelopmentByRubro.tsx#L148) | estado | `duration: 0.24`, `ease: [0.4, 0, 1, 1]` | **`[0.4,0,1,1]` es ease-in puro** — trigger de escalada de **R2** |
| A2.6 | `easeIn` string | [CalculadoraAutomation.tsx:696](../src/components/automation/CalculadoraAutomation.tsx#L696) | estado | `duration: 0.12`, `ease: 'easeIn'` | Ídem **R2** |
| A2.7 | Curvas no monótonas | [ChargeTraceButton.tsx:52](../src/components/ui/buttons/ChargeTraceButton.tsx#L52) | estado | salida `[0.45, 0, 0.92, 0.5]` | y va 0→0.5 con control 0.92: arranca lento y no llega — sensación de frenada |
| A2.8 | Loops de CTA | [CtaIA.tsx](../src/components/ia/CtaIA.tsx), [CtaAutomation.tsx](../src/components/automation/CtaAutomation.tsx), [WebDevelopmentCta.tsx](../src/components/sections/web-development/WebDevelopmentCta.tsx), [SoftwareDevelopmentCta.tsx](../src/components/sections/software-development/SoftwareDevelopmentCta.tsx) | loop perpetuo | 3 `repeat: Infinity` cada uno | 12 loops solo en los 4 CTA finales |
| A2.9 | Animación de propiedades de layout | 32 ocurrencias — ej. [OurServices.tsx:6118](../src/components/sections/home/OurServices.tsx#L6118), [:6762](../src/components/sections/home/OurServices.tsx#L6762), [:7187](../src/components/sections/home/OurServices.tsx#L7187) | entrada/estado | `animate={{ width: '...%' }}` | **`width` dispara layout+paint+composite** — trigger de **R6** |
| A2.10 | `transition: all` / `transition-all` | **57 ocurrencias**; top: [WebDevelopmentTimeline.tsx](../src/components/sections/web-development/WebDevelopmentTimeline.tsx) (7), [WhyDevelOP.tsx](../src/components/sections/home/WhyDevelOP.tsx) (6), [TemplateWarehouse.tsx](../src/components/sections/TemplateWarehouse.tsx) (5) | estado | — | Trigger de escalada de **R6** |

### A.3 — `/contact`

| # | Qué anima | Archivo:línea | Tipo | Parámetros | Costo |
|---|---|---|---|---|---|
| A3.1 | Reveals de columnas | [contact/page.tsx:118](../src/app/contact/page.tsx#L118), [:258](../src/app/contact/page.tsx#L258), [:291](../src/app/contact/page.tsx#L291) | entrada | `duration` 0.4–0.6, `ease: [0.16,1,0.3,1]`, stagger 50ms | Curva fuerte correcta ✅, stagger en rango ✅ |
| A3.2 | Botón de submit | [contact/page.tsx:217-221](../src/app/contact/page.tsx#L217) | estado | `disabled:opacity-65` + label `'Enviando...'` | **Sin `whileTap`, sin `focus-visible`, sin spinner.** Es la acción de conversión de la ruta |

---

## B. Veredictos

### B.0 — Vetting: hallazgos descartados antes de reportar

Por **Hard Rule 5** del skill (no re-litigar decisiones deliberadas), estos *no* se reportan como hallazgos:

- **`once: false` en [SectionTransition.tsx:15](../src/components/layout/SectionTransition.tsx#L15)** — no es un reveal que re-dispara: alimenta `useThemeSection(isInView, 'dark')`. Un observer de tema necesita ser bidireccional. **Correcto por diseño.**
- **`transform-origin: center` en modales** — exento explícitamente por **R4**.
- **`scale: [0, 3]` del ripple en [MagneticCta.tsx:37](../src/components/ui/buttons/MagneticCta.tsx#L37)** — la letra de **R4** dice "nunca `scale(0)`", pero su *razón* es "nada aparece de la nada". Una onda que emana del punto de click **sí** nace de un punto: es el caso donde el modelo físico justifica el `scale(0)`. **No es hallazgo.**
- **`dpr={[1, 1.5]}`** en el canvas del hero — cumple la regla del `CLAUDE.md`.

### B.1 — ELIMINAR

| # | Animación | Fundamento | Regla |
|---|---|---|---|
| **E1** | **Los 11 loops perpetuos con `duration: shouldSimplify ? 0.01`** — [WhyDevelOP.tsx:868,885,897,902,907,937,950,961,966,970,984](../src/components/sections/home/WhyDevelOP.tsx#L897) | **Bug, no solo hallazgo de gusto.** `duration: 0.01` + `repeat: Infinity` no *desactiva* la animación: la hace **reiniciar cada 10ms (100 Hz)**. Y `shouldSimplify = shouldReduceMotion \|\| isMobile` ([:437](../src/components/sections/home/WhyDevelOP.tsx#L437)) → **todo mobile y todo usuario con reduced-motion recibe 11 loops a 100 Hz**. El camino de accesibilidad es más caro que la animación que reemplaza. | **R7** ("reduced motion = menos y más suave, no cero"), **R1** |
| **E2** | Los 20 loops perpetuos restantes de WhyDevelOP (31 en total) | Decorativos y perpetuos. 31 loops infinitos en una sección compiten entre sí por la misma atención; ninguno indica estado ni da feedback. | **R1** ("'se ve lindo' en algo visto seguido no es propósito") |
| **E3** | Marquee de 4 filas — [InfiniteReviews.tsx](../src/components/sections/home/InfiniteReviews.tsx) | Loop perpetuo decorativo de 100vh. Además de no tener función, su implementación viola 3 reglas a la vez (ver §C.2). Un loop perpetuo **no** puede justificarse en la dirección "una sola pieza viva por página" — y esa plaza ya está adjudicada a los paneles. | **R1**, **R6** |
| **E4** | Typewriter del H1 — [TypewriterText.tsx](../src/components/ui/TypewriterText.tsx) usado en [Hero.tsx:665](../src/components/layout/Hero.tsx#L665) | Anima **el texto que el usuario necesita leer ya**, y lo hace en loop indefinido: el H1 nunca se estabiliza. Es el caso de libro de "no animar lo que hay que leer". Sin reduced-motion. | **R1**, **R7** |
| **E5** | Grilla de fondo del hero en deriva — [Hero.tsx:519-521](../src/components/layout/Hero.tsx#L519) | Loop perpetuo de 10s, decorativo, y el único elemento del hero que **ignora** el `prefersReducedMotion` que el mismo archivo ya calcula (línea 413). | **R1**, **R7** |
| **E6** | Canvas 3D del hero completo — [Hero.tsx:340-392](../src/components/layout/Hero.tsx#L340) + [DotMatrix.tsx](../src/components/canvas/DotMatrix.tsx) | Ya decidido por Franco. La medición confirma la decisión: ver §C.1 para qué se pierde y qué se gana. | decisión de dirección |
| **E7** | `backdropFilter: blur(20px) saturate(180%)` en cards — [StoryMomentCard.tsx:264-265](../src/components/sections/portal-demo/StoryMomentCard.tsx#L264) | Glassmorphism: el material que la dirección nueva elimina ("superficies planas y quietas"). | dirección + **R6** |
| **E8** | `scale` en hover de cards — 69 de los 124 bloques `whileHover` del sitio público contienen `scale:`. Caso testigo: [StoryMomentCard.tsx:248-250](../src/components/sections/portal-demo/StoryMomentCard.tsx#L248) | Prohibido explícitamente por la dirección nueva. Además está ungateado para touch (**R7** pide `@media (hover: hover) and (pointer: fine)`). | dirección + **R7** |
| **E9** | 12 loops perpetuos de los 4 CTA finales — [CtaIA](../src/components/ia/CtaIA.tsx), [CtaAutomation](../src/components/automation/CtaAutomation.tsx), [WebDevelopmentCta](../src/components/sections/web-development/WebDevelopmentCta.tsx), [SoftwareDevelopmentCta](../src/components/sections/software-development/SoftwareDevelopmentCta.tsx) | 3 loops perpetuos cada uno alrededor del CTA final. Movimiento perpetuo junto a la acción principal **compite** con ella en lugar de dirigir hacia ella. | **R1** |
| **E10** | `animate-border-spin` en el CTA primario — [MagneticCta.tsx:121](../src/components/ui/buttons/MagneticCta.tsx#L121), def. en [globals.css:104-106](../src/app/globals.css#L104) | `rotate-border 3s linear infinite` sobre un `conic-gradient` en `border-box`: repinta el gradiente cada frame (no compositable) **de forma perpetua**, en el CTA principal del hero. | **R1**, **R6** |
| **E11** | Animación de `letterSpacing` en hover del CTA — [MagneticCta.tsx:164-168](../src/components/ui/buttons/MagneticCta.tsx#L164) | `letter-spacing` dispara **reflow de texto**: el botón cambia de ancho al pasar el mouse. Es a la vez el peor costo posible y un efecto visualmente inestable. | **R6** |
| **E12** | Archivo muerto completo — [sections/home/PortalDemo.tsx](../src/components/sections/home/PortalDemo.tsx) (61 KB, 8 `whileInView`, 5 loops perpetuos, 3 `animate={{ width }}`) | Sin importadores. No es una decisión de motion: es borrado de código muerto que evita auditarlo y migrarlo por error en B2/B3. | fuera de bundle |

### B.2 — AJUSTAR

| # | Animación | Parámetro concreto a cambiar | Regla |
|---|---|---|---|
| **A1** | **Paneles auto-secuenciados** — [OurServices.tsx:171-325](../src/components/sections/home/OurServices.tsx#L171) | Tres cambios, en orden: **(a)** `setProgress()`/`setAnimationProgress()` en cada frame ([:284](../src/components/sections/home/OurServices.tsx#L284), [:289](../src/components/sections/home/OurServices.tsx#L289)) → re-render de React a 60 fps; pasar a `MotionValue` (`useMotionValue` + `useTransform`) para que el driver no toque el árbol. **(b)** Duraciones: bajar el techo de `11000` ([:6497](../src/components/sections/home/OurServices.tsx#L6497)) a **≤6000ms**; `SERVICE_DEMO_HOLD_MS = 2000` ([:159](../src/components/sections/home/OurServices.tsx#L159)) → **1200ms**. **(c)** Agregar `useReducedMotion`: el archivo tiene **0** ocurrencias. Detalle completo en §C.3. | **R6**, **R3**, **R7** |
| **A2** | Reveals del hero — [Hero.tsx:635-718](../src/components/layout/Hero.tsx#L635) | Cambiar `HERO_REVEAL_EASE = [0.25,0.46,0.45,0.94]` ([:26](../src/components/layout/Hero.tsx#L26)) por la curva fuerte que el propio sitio ya usa 189 veces, `[0.16,1,0.3,1]`. Y comprimir la cascada: delay máximo `0.56` → **`0.24`** (stagger de 60ms entre 5 elementos, dentro de **R8**), duración `0.7` → **`0.5`**. | **R2**, **R8** |
| **A3** | `ease-in` explícito — [WebDevelopmentByRubro.tsx:148](../src/components/sections/web-development/WebDevelopmentByRubro.tsx#L148) | `ease: [0.4, 0, 1, 1]` → `[0.16, 1, 0.3, 1]`. Es ease-in puro: retrasa justo el instante que el usuario mira. | **R2** |
| **A4** | `easeIn` string — [CalculadoraAutomation.tsx:696](../src/components/automation/CalculadoraAutomation.tsx#L696) | `ease: 'easeIn'` → `'easeOut'`. | **R2** |
| **A5** | Curva de salida no monótona — [ChargeTraceButton.tsx:52](../src/components/ui/buttons/ChargeTraceButton.tsx#L52) | Salida `[0.45, 0, 0.92, 0.5]` → `[0.16, 1, 0.3, 1]`. Con y₂=0.5 y x₂=0.92 arranca lento y llega frenando. | **R2** |
| **A6** | Los 57 `transition: all` / `transition-all` | Enumerar propiedades. Los 3 focos: [WebDevelopmentTimeline.tsx](../src/components/sections/web-development/WebDevelopmentTimeline.tsx) (7), [WhyDevelOP.tsx](../src/components/sections/home/WhyDevelOP.tsx) (6), [TemplateWarehouse.tsx](../src/components/sections/TemplateWarehouse.tsx) (5). | **R6** (trigger de escalada) |
| **A7** | Las 32 animaciones de `width`/`height`/`top`/`left` — ej. [OurServices.tsx:6118](../src/components/sections/home/OurServices.tsx#L6118), [:6762](../src/components/sections/home/OurServices.tsx#L6762), [:7187](../src/components/sections/home/OurServices.tsx#L7187) | `animate={{ width: '${n}%' }}` → `scaleX` con `transformOrigin: 'left'`. El patrón correcto ya existe en el repo: [StoryMomentCard.tsx:84-91](../src/components/sections/portal-demo/StoryMomentCard.tsx#L84) usa `scaleX` + `origin-left` para exactamente la misma barra de progreso. | **R6** |
| **A8** | Pulso de `boxShadow` — [StoryMomentCard.tsx:296-305](../src/components/sections/portal-demo/StoryMomentCard.tsx#L296) | `boxShadow: [...]` de 3 keyframes anima **paint**. Reemplazar por `opacity` sobre un pseudo-elemento de glow, o eliminar (es decorativo y ya hay reveal en el mismo elemento). | **R6** |
| **A9** | Loops perpetuos del navbar — [Navbar.tsx:75](../src/components/layout/Navbar.tsx#L75), [:107](../src/components/layout/Navbar.tsx#L107) | Agregar `useReducedMotion` (el archivo tiene **0** ocurrencias) y gatear ambos loops. `DynamicDock` ya resuelve esto bien con `PILL_INSTANT` ([:344-345](../src/components/layout/DynamicDock.tsx#L344)) — copiar ese patrón. | **R7** |
| **A10** | Shorthands `x`/`y` en el CTA primario — [MagneticCta.tsx:131-132](../src/components/ui/buttons/MagneticCta.tsx#L131) | `x: springX, y: springY` → `transform` string. **R6** es explícito: los shorthands de Framer corren en el main thread vía rAF y pierden frames bajo carga — y este corre durante el intro del hero, el momento de mayor carga de la página. | **R6** |
| **A11** | `getBoundingClientRect()` por pointermove — [MagneticCta.tsx:72](../src/components/ui/buttons/MagneticCta.tsx#L72) | Layout sincrónico forzado en **cada** movimiento del mouse sobre el botón. Cachear el rect en `pointerenter` + invalidar en `resize`/`scroll`. Mismo patrón en [DynamicDock.tsx:98](../src/components/layout/DynamicDock.tsx#L98). | **R6** |
| **A12** | Hover del CTA sin easing — [MagneticCta.tsx:150](../src/components/ui/buttons/MagneticCta.tsx#L150) | `transition={{ duration: 0.3 }}` sin `ease` → default de Framer. **R2**: hover → `ease`; y las curvas nativas/default son demasiado débiles para motion deliberado. Además anima `boxShadow` + `background` (paint) — reducir a `opacity` de una capa. | **R2**, **R6** |
| **A13** | Blur-in de textos — [StoryMomentCard.tsx:11](../src/components/sections/portal-demo/StoryMomentCard.tsx#L11) | `filter: blur(6px)` → `blur(0)` en 4 textos × 3 cards. **R6** admite blur para *enmascarar crossfades*, no como entrada de texto. Quitar el `filter` y dejar `opacity` + `y`: es texto que hay que leer. | **R6**, **R1** |
| **A14** | rAF de partículas sin autolímite — [GarantiaIA.tsx:698-701](../src/components/ia/GarantiaIA.tsx#L698) | Agregar corte por visibilidad (`IntersectionObserver`) o por progreso, como ya hace [BentoIA.tsx:227](../src/components/ia/BentoIA.tsx#L227) con `if (elapsed < 0.8)`. | **R6** |
| **A15** | Shutter de transición — [Shutter.tsx:14](../src/components/layout/Shutter.tsx#L14) | `ease: 'easeInOut'` → `[0.16,1,0.3,1]`. Es un overlay que entra y sale, no algo que se desplaza en pantalla: **R2** pide `ease-out`. 300ms está bien. | **R2** |
| **A16** | Botón de submit de contacto — [contact/page.tsx:217-221](../src/app/contact/page.tsx#L217) | Agregar `whileTap={{ scale: 0.97 }}` + `focus-visible:ring` + spinner en `isPending`. Es la acción de conversión de la ruta y hoy solo baja la opacidad. Usar `buttonPress` de [motion-variants.ts:70-73](../src/lib/motion-variants.ts#L70). | **R4**, **R7** |
| **A17** | Tokens de motion inexistentes en CSS | [globals.css](../src/app/globals.css) (371 líneas) no define **ningún** `--ease-*` ni `--duration-*`, y tiene **0** bloques `prefers-reduced-motion`. Crear los tokens y un bloque global de reduced-motion. Ver §E.3. | **R7**, **R8** |
| **A18** | Fragmentación de curvas | 3 curvas legítimas cubren 253 usos (`[0.16,1,0.3,1]`×189, `[0.25,0.46,0.45,0.94]`×40, `[0.22,1,0.36,1]`×24) **+ ~12 curvas hechas a mano usadas 1 vez cada una**, varias de ellas ease-in o no monótonas (§A2.5–A2.7, más `[0.58,0.45,0.32,0.22]` y `[0.18,1,1,0.72]`). Consolidar en 2 tokens (`--ease-out`, `--ease-in-out`) exportados también desde `motion-variants.ts`. | **R8** |

### B.3 — CONSERVAR

| # | Animación | Por qué |
|---|---|---|
| **C1** | Arquitectura del ciclo de autoplay — [OurServices.tsx:171-325](../src/components/sections/home/OurServices.tsx#L171) | Es la mejor pieza de ingeniería de motion del sitio: `IntersectionObserver` con `threshold: 0.3`, pausa manual que **preserva el tiempo transcurrido** ([:221](../src/components/sections/home/OurServices.tsx#L221)), `cancelAnimationFrame` + `clearTimeout` en cleanup, y `resetCycle()` al click de tab. La *estructura* se conserva; los parámetros se ajustan (**A1**). |
| **C2** | Botón de pausa — [OurServices.tsx:340-350](../src/components/sections/home/OurServices.tsx#L340) | `whileTap={{ scale: 0.96 }}`, `duration: 0.18`, `ease: [0.22,1,0.36,1]`, `aria-label` dinámico Pausar/Reanudar. Cumple **R4** y da control real sobre el autoplay. |
| **C3** | Gate de reduced-motion del dock — [DynamicDock.tsx:344-400](../src/components/layout/DynamicDock.tsx#L344) | `PILL_SPRING` / `PILL_INSTANT` conmutados por `useReducedMotion()`. Es el patrón de referencia a replicar en Navbar, Hero, OurServices y StoryMomentCard. |
| **C4** | Press del navbar — [Navbar.tsx:96-98](../src/components/layout/Navbar.tsx#L96) | `whileTap={{ scale: 0.98 }}` + spring 360/28. Dentro del rango 0.95–0.98 de **R4**. Es el modelo de "relieve táctil" que la dirección nueva pide. |
| **C5** | Gate por visibilidad del DotMatrix — [DotMatrix.tsx:102-113](../src/components/canvas/DotMatrix.tsx#L102) | Aunque el componente se elimina con el 3D (**E6**), el patrón `isVisibleRef` + early-return en `useFrame` es correcto y hay que preservarlo donde queden canvas (landings). |
| **C6** | Stagger de 40ms | [StoryMomentCard.tsx:183](../src/components/sections/portal-demo/StoryMomentCard.tsx#L183), [StoryArcLunes.tsx:51](../src/components/sections/portal-demo/StoryArcLunes.tsx#L51), [contact/page.tsx:291](../src/app/contact/page.tsx#L291). `delay: index * 0.04` — centro del rango 30–80ms de **R8**. |
| **C7** | Contadores con rAF autolimitado — [CalculadorIA.tsx:43](../src/components/ia/CalculadorIA.tsx#L43), [HeroMetrics.tsx:48](../src/components/ui/HeroMetrics.tsx#L48), [ShowcaseSoftware.tsx:251](../src/components/software/ShowcaseSoftware.tsx#L251) | `if (t < 1) requestAnimationFrame(update)` — el loop termina solo. Contraste exacto con el marquee (**E3**), que nunca termina. |
| **C8** | `viewport={{ once: true }}` como default | 167 usos contra 2 `once: false` (ambos legítimos, §B.0). Los reveals no se re-disparan al hacer scroll hacia arriba: correcto. |
| **C9** | Ripple del CTA — [MagneticCta.tsx:34-39](../src/components/ui/buttons/MagneticCta.tsx#L34) | `scale: [0, 3]` con `opacity: [0.4, 0]`, `duration: 0.6`, `easeOut`. Es feedback de presión real, en el punto exacto del click. El `scale(0)` está justificado (§B.0). Conservar como base del "estado de presión visible" que pide la dirección — pero necesita `whileTap` que lo acompañe (§D). |
| **C10** | Reveals de `/contact` — [contact/page.tsx:118](../src/app/contact/page.tsx#L118), [:258](../src/app/contact/page.tsx#L258) | `duration: 0.6`, `ease: [0.16,1,0.3,1]`, stagger 50ms, `opacity`+`y`. La curva fuerte correcta, propiedades compuestas, stagger en rango. Es el patrón a generalizar. |

---

## C. Los tres focos

### C.1 — El hero: tres animaciones compitiendo

Hoy corren **en simultáneo**, sobre el mismo eje visual:

| Pieza | Costo medido | Gate de visibilidad | Reduced-motion |
|---|---|---|---|
| Canvas 3D (logo + sombra + puntero) | 3 `useFrame` + `EffectComposer` de 3 pases por frame | ❌ **ninguno** (`<Canvas>` sin `frameloop` → `"always"`) | Parcial (desactiva parallax, no el render) |
| Grilla de puntos 3D | **5.040 instancias** × (2 trig + sqrt + compose Matrix4 + lerp Color) por frame | ✅ `isVisibleRef` | ✅ no se monta |
| Typewriter del H1 | re-render de React cada 40–70ms, indefinido | ❌ ninguno | ❌ ninguno |
| Grilla de fondo en deriva | loop `translateY` de 10s | ❌ ninguno | ❌ **ignora** el flag que el archivo ya calcula |

**El costo que no está en el brief:** el `<Canvas>` de [Hero.tsx:360](../src/components/layout/Hero.tsx#L360) no declara `frameloop`, así que R3F usa `"always"`. Con el hero scrolleado fuera de pantalla, `HeroLogo`, `HeroLogoShadow` y `DesktopPointerSync` siguen ejecutando `useFrame`, y el `EffectComposer` sigue corriendo sus **3 pases de post-procesado** a 60 fps sobre un canvas full-bleed. El `DotMatrix` sí se auto-gatea — el resto del hero, no. Esto contradice la regla del propio `CLAUDE.md`: *"IntersectionObserver on all heavy animations — pause when out of viewport."*

**Qué se pierde eliminando el 3D (E6).** Es real y conviene nombrarlo: se pierde la coreografía intro→hero completa, que es la pieza más ambiciosa del sitio — el trazado 2D del logo que se dibuja, se rellena y hace crossfade al chrome 3D ([LogoStrokeOverlay](../src/components/ui/LogoStrokeOverlay.tsx)), el lockup de texto que se escribe y se borra ([IntroLockupText](../src/components/ui/IntroLockupText.tsx)), el vuelo del logo de centro a columna derecha, la sombra que lo sigue, y el reveal aleatorio de los 5.040 puntos. Son ~800 líneas de orquestación fina entre `PreloaderContext`, 5 `MotionValue` compartidos y un gate de readiness por `useLoader`. También se pierde el único momento del sitio con presupuesto de deleite legítimo por **R1** (primera visita, se ve una vez).

**Qué se gana.** Tres cosas medibles y una de dirección:
1. **Bundle:** salen `three`, `@react-three/fiber`, `@react-three/drei` y `@react-three/postprocessing` de la ruta crítica del home.
2. **CPU:** desaparecen 5.040 actualizaciones de instancia + 3 pases de post-procesado por frame, más los 3 `useFrame` que hoy no se pausan nunca.
3. **Se destraba el scroll-lock:** hoy el intro bloquea `html`/`body` overflow y `lenis.stop()` hasta `phase === 'done'`, con un timeout de seguridad de **6 segundos** ([Hero.tsx:477-488](../src/components/layout/Hero.tsx#L477)) y un `console.warn` si cuelga. Sin intro 3D no hay razón para retener el scroll del usuario.
4. **Dirección:** "una sola pieza viva por página" es incompatible con cuatro animaciones simultáneas en el above-the-fold.

**Qué sobreviviría en restraint.** Ninguna de las cuatro como está. La única que merece sobrevivir *transformada* es el reveal del contenido (**A2**): `opacity` + `y` con `[0.16,1,0.3,1]`, cascada comprimida a 240ms. El hero de la dirección nueva es tipografía quieta con una entrada de 500ms — el logo puede vivir como SVG estático, que además conserva la marca sin costo de runtime.

### C.2 — El marquee: el costo real

[InfiniteReviews.tsx](../src/components/sections/home/InfiniteReviews.tsx) (`ScrollingTextMarquee`, exportado también como `InfiniteReviews`). El brief pregunta si un loop perpetuo puede justificarse. **En esta implementación, no** — y el motivo no es de gusto, son cuatro defectos de implementación acumulados:

**1. El `IntersectionObserver` no detiene el loop.** Hay un observer ([:269](../src/components/sections/home/InfiniteReviews.tsx#L269)) y una variable `isVisible`, pero mirá dónde cae el `requestAnimationFrame`:

```
// línea 283:  if (isVisible) { ...todo el trabajo... }
// línea 326:  lastScrollY = window.scrollY;              ← FUERA del if
// línea 327:  frameId = window.requestAnimationFrame(paintFrame);  ← FUERA del if
```

El observer gatea **el trabajo**, no **el loop**. El rAF se re-agenda a 60 fps durante toda la vida de la página, y lee `window.scrollY` en cada frame incluso con la sección fuera de pantalla. El loop solo muere en el unmount ([:334](../src/components/sections/home/InfiniteReviews.tsx#L334)).

**2. Layout sincrónico forzado cada frame.** `section.getBoundingClientRect()` en [:284](../src/components/sections/home/InfiniteReviews.tsx#L284), y `segmentElement.offsetWidth` en [:304](../src/components/sections/home/InfiniteReviews.tsx#L304) — dentro de un `forEach` sobre las 4 capas. Son 5 lecturas de layout forzadas por frame, intercaladas con escrituras de estilo: layout thrashing de manual.

**3. Variables CSS en el padre que gobiernan a los hijos.** Líneas [296-298](../src/components/sections/home/InfiniteReviews.tsx#L296) escriben `--marquee-ambient-opacity`, `--marquee-grid-opacity` y `--marquee-vignette-opacity` sobre `section`, y esos valores se consumen en los hijos ([:361](../src/components/sections/home/InfiniteReviews.tsx#L361), [:373](../src/components/sections/home/InfiniteReviews.tsx#L373)). **R6** lo prohíbe por nombre: *"Don't drive child transforms via a CSS variable on the parent — it recalcs styles for all children."* Cada frame dispara un recálculo de estilo del subárbol completo.

**4. Repintado de texto gigante cada frame.** Líneas [320-321](../src/components/sections/home/InfiniteReviews.tsx#L320) escriben `color` y `webkitTextStroke` en cada capa, cada frame. `-webkit-text-stroke` es **paint puro**, aplicado a texto de hasta `22rem` sobre pistas de `124vw` con 3 copias por capa × 4 capas = **12 segmentos de texto enorme repintados a 60 fps** — y encima bajo `perspective: 1000px` + `rotateX` + `preserve-3d` ([:319](../src/components/sections/home/InfiniteReviews.tsx#L319), [:431-433](../src/components/sections/home/InfiniteReviews.tsx#L431)), que fuerza capas de rasterizado 3D de ese tamaño. `section.style.backgroundColor` ([:295](../src/components/sections/home/InfiniteReviews.tsx#L295)) es otro paint por frame.

**Reduced-motion: parcial y engañoso.** Se lee en [:267](../src/components/sections/home/InfiniteReviews.tsx#L267) y pone `speed = 0` ([:312](../src/components/sections/home/InfiniteReviews.tsx#L312)) y `targetBoost = 0` ([:288](../src/components/sections/home/InfiniteReviews.tsx#L288)). Pero: (a) el parallax **sigue** aplicándose porque depende de `progress`, que sigue interpolando — o sea el usuario con reduced-motion **sí** recibe cambios de posición, justo lo que **R7** pide eliminar; (b) el rAF, el `getBoundingClientRect` y los repintados siguen corriendo igual; (c) se lee una sola vez al montar, sin listener de `change`.

**Veredicto: ELIMINAR (E3).** Y si en el rediseño se quisiera una banda de capacidades técnicas, la forma correcta es CSS puro: `@keyframes` con `translate3d` sobre una pista duplicada, `animation-play-state: paused` conmutado por `IntersectionObserver`, color y stroke **estáticos**, sin perspectiva 3D, sin rAF, sin variables CSS en el padre. Eso es 0 JS por frame contra los ~5 layouts + 13 paints actuales. Pero ojo con la dirección: la plaza de "única pieza viva" ya está tomada por los paneles.

*Nota de higiene, fuera de motion:* el componente se llama `InfiniteReviews`, la sección tiene `id="testimonials"`, y el contenido son palabras técnicas e iconos de stack — no hay reseñas ni testimonios. Es un artefacto de un pivote anterior. También usa `height: 100vh` en lugar de `100svh`, lo que provoca corte en mobile con la barra de URL.

### C.3 — Los paneles auto-secuenciados: la pieza a convertir en la mejor del sitio

**Qué ship y qué no.** Los "paneles que se auto-tipean" son [OurServices.tsx](../src/components/sections/home/OurServices.tsx) (9.898 líneas, 354 KB) — cargado con `dynamic()` desde [page.tsx:14](../src/app/page.tsx#L14). El otro candidato del brief, `sections/home/PortalDemo.tsx`, es **código muerto** (**E12**). El portal-demo que sí ship es [sections/portal-demo/](../src/components/sections/portal-demo/) (776 líneas en 4 archivos) y **no tiene secuencia auto-tipeada**: son reveals por scroll + 3 loops de ambiente. Así que la pieza a convertir en la mejor del sitio es **OurServices**, y su estado es mucho mejor de lo que el brief supone.

**Lo que ya está bien** (conservar — **C1**, **C2**):

- `IntersectionObserver` con `threshold: 0.3` ([:710-717](../src/components/sections/home/OurServices.tsx#L710), [:4937-4944](../src/components/sections/home/OurServices.tsx#L4937)) — **sí pausa fuera de viewport**, respondiendo la pregunta del brief. Hay incluso un indicador visible del estado ([:2794](../src/components/sections/home/OurServices.tsx#L2794): *"Autoplay pausado fuera de viewport"*).
- Pausa manual que **preserva el tiempo transcurrido**: `startTimeRef.current += performance.now() - pausedAtRef.current` ([:221](../src/components/sections/home/OurServices.tsx#L221)). Reanuda donde estaba, no desde cero.
- Cleanup correcto: `cancelAnimationFrame` + `clearTimeout` ([:192-199](../src/components/sections/home/OurServices.tsx#L192), [:310-315](../src/components/sections/home/OurServices.tsx#L310)).
- **Los tabs son clickeables** ([:743](../src/components/sections/home/OurServices.tsx#L743) `handleTabClick` → `resetCycle()` + `setCycleSeed`). El usuario puede saltar a cualquier paso: no está obligado a esperar el loop.

**Lo que hay que cambiar** (**A1**), en orden de impacto:

**(a) El driver re-renderiza React a 60 fps.** `setProgress(nextProgress)` y `setAnimationProgress(...)` en [:284](../src/components/sections/home/OurServices.tsx#L284) y [:289](../src/components/sections/home/OurServices.tsx#L289) se llaman en cada frame del `tick`. En un componente de 9.898 líneas eso significa reconciliar un árbol enorme 60 veces por segundo, y `animationProgress` se propaga como prop a los sub-simuladores (`SimChat`, `SimLeadsIA`, `SimAgenda`, `SimMétricas` — [:5141-5146](../src/components/sections/home/OurServices.tsx#L5141)). Es el costo dominante de la pieza y es evitable: `useMotionValue` + `useTransform` mantienen el valor fuera del ciclo de render de React, que es exactamente para lo que existen. Es el mismo mecanismo que el Hero ya usa bien con sus `MotionValue` compartidos.

**(b) Los tiempos son demasiado largos para leerse.** Medido:

| Panel | Duraciones de tabs | Ciclo completo |
|---|---|---|
| Web ([:659-662](../src/components/sections/home/OurServices.tsx#L659)) | 5000 · 4500 · 5500 · 6500 | **30,7 s** |
| IA ([:3084-3087](../src/components/sections/home/OurServices.tsx#L3084)) | 8500 · 6200 · 8000 · 5200 | **36,9 s** |
| Automatización ([:5169-5172](../src/components/sections/home/OurServices.tsx#L5169)) | 6000 · 8000 · 7500 · 8000 | **38,7 s** |
| Software ([:6497-6500](../src/components/sections/home/OurServices.tsx#L6497)) | **11000** · 5000 · 7000 · 6500 | **38,8 s** |

(cada tab suma `HOLD 2000ms` + `ADVANCE_DELAY 300ms`)

Son **~2,4 minutos** para ver los 4 paneles completos, con un paso individual de **13 segundos** (CRM, 11000 + 2000). La pregunta del brief — *"¿se puede leer sin esperar el loop completo?"* — tiene respuesta mixta: **sí**, porque los tabs son clickeables; **pero** nada en la UI indica que se puede saltar, y 13 segundos de espera pasiva agotan la paciencia antes de que aparezca el impulso de hacer click. Propuesta: techo de **6000ms** por tab y `HOLD` a **1200ms** → ~30s por panel, con el paso más largo en 7,2s.

**(c) Cero reduced-motion en 9.898 líneas.** `grep -c "useReducedMotion\|prefers-reduced-motion"` sobre el archivo devuelve **0**. La pieza destinada a ser la única animación viva de la home es también la que ignora por completo la preferencia del sistema. El camino correcto no es apagarla (perdería su función explicativa, y **R7** dice "más suave, no cero"): es saltar a un estado final legible por tab y dejar que el usuario avance con los tabs, sin autoplay.

**(d) Higiene mientras se toca.** Los 8 `repeat: Infinity` del archivo compiten con la secuencia principal dentro del mismo panel; las 3 animaciones de `width` (**A7**) deberían ser `scaleX`; y 354 KB en un archivo contradice de frente el límite de 800 líneas del `CLAUDE.md` — separarlo por panel es prerrequisito práctico para que B2/B3 puedan trabajarlo.

---

## D. Feedback de interacción táctil

La dirección pide que los elementos interactivos se sientan como objetos físicos. El estado actual es **hover rico, presión pobre, teclado ausente**.

### D.1 — Qué estados existen hoy

| Estado | Cobertura en el sitio público | Detalle |
|---|---|---|
| `hover` | **124 bloques `whileHover`** | Abundante. 69 de ellos incluyen `scale:` |
| `active` / presión | **45 `whileTap`** + 42 clases `active:` de Tailwind | Menos de la mitad de los elementos con hover tienen feedback de presión |
| `focus-visible` | **4 ocurrencias en todo el sitio público** | 3 son primitivas de formulario ([Input](../src/components/ui/Input.tsx), [Select](../src/components/ui/Select.tsx), [Textarea](../src/components/ui/Textarea.tsx)) + 1 en [portal-demo/PortalDemo.tsx](../src/components/sections/portal-demo/PortalDemo.tsx) |
| `disabled` | Presente en formularios | [contact/page.tsx:217](../src/app/contact/page.tsx#L217) `disabled:opacity-65`; [Button.tsx:34](../src/components/ui/Button.tsx#L34) `disabled:opacity-50` |

Los buenos parámetros de presión existentes, todos dentro del rango 0.95–0.98 de **R4**:

- [Navbar.tsx:97](../src/components/layout/Navbar.tsx#L97) — `whileTap={{ scale: 0.98 }}`, spring 360/28
- [OurServices.tsx:349](../src/components/sections/home/OurServices.tsx#L349) — `whileTap={{ scale: 0.96 }}`, 180ms
- [motion-variants.ts:70-73](../src/lib/motion-variants.ts#L70) — `buttonPress`: `scale: 0.97`, spring 600/25 ← **el token correcto, sin consumidores públicos**

### D.2 — Dónde falta `focus-visible` o `active`

**`focus-visible`: falta en prácticamente todo.** 4 ocurrencias contra 124 elementos con hover. Los casos más graves, por ser las acciones principales:

| Elemento | Archivo:línea | Falta |
|---|---|---|
| **CTA primario del hero** (×2) | [MagneticCta.tsx:195-205](../src/components/ui/buttons/MagneticCta.tsx#L195) | `focus-visible` **y** `whileTap`. Un `motion.button` sin anillo de foco ni feedback de presión. Es el botón más importante del sitio |
| Submit de contacto | [contact/page.tsx:217](../src/app/contact/page.tsx#L217) | `focus-visible` y `whileTap` |
| Tabs de servicios | [OurServices.tsx:743](../src/components/sections/home/OurServices.tsx#L743) | `focus-visible` — son el control que permite saltarse el autoplay (§C.3) |
| Cards-link del portal-demo | [StoryMomentCard.tsx:243](../src/components/sections/portal-demo/StoryMomentCard.tsx#L243) | Solo `whileHover`; sin equivalente de foco |
| Acordeones de FAQ | [FaqIA](../src/components/ia/FaqIA.tsx), [FaqSoftware](../src/components/software/FaqSoftware.tsx), [FaqAutomation](../src/components/automation/FaqAutomation.tsx), [WebDevelopmentFaq](../src/components/sections/web-development/WebDevelopmentFaq.tsx) | `focus-visible` en los triggers |

Consecuencia concreta: **el sitio público no se puede navegar con teclado de forma visible.** Contra el "Quality baseline" del `CLAUDE.md` (*"Aria-labels on all icon-only elements. WCAG AA contrast minimum"*) y contra **R7**.

**`active`/presión: falta en ~79 elementos.** 124 `whileHover` − 45 `whileTap` ≈ 79 elementos que reaccionan al mouse pero no al click. Para la dirección de "relieve corto, estado de presión visible", esa proporción está invertida: el hover es lo que hay que **reducir** y la presión lo que hay que **agregar**.

### D.3 — `scale` en hover de cards (prohibido por la dirección nueva)

**69 de los 124 bloques `whileHover` contienen `scale:`.** Dónde vive, por familia:

| Ubicación | Nota |
|---|---|
| [StoryMomentCard.tsx:248-250](../src/components/sections/portal-demo/StoryMomentCard.tsx#L248) | `whileHover={{ y: -4, scale: 1.01, borderColor, boxShadow }}` — card del portal-demo, caso testigo |
| [TodoIncluidoFeatureCard.tsx](../src/components/sections/todo-incluido/TodoIncluidoFeatureCard.tsx), [ModuloActiveCard.tsx](../src/components/sections/modulos-opcionales/ModuloActiveCard.tsx), [ModuloComingSoonCard.tsx](../src/components/sections/modulos-opcionales/ModuloComingSoonCard.tsx) | Cards de home |
| [PortfolioWebCases.tsx](../src/components/sections/web-development/PortfolioWebCases.tsx), [WebDevelopmentBento.tsx](../src/components/sections/web-development/WebDevelopmentBento.tsx), [ShowcaseSection.tsx](../src/components/sections/web-development/ShowcaseSection.tsx) | Cards de landing web |
| [PainBentoSoftware.tsx](../src/components/software/PainBentoSoftware.tsx), [ShowcaseSoftware.tsx](../src/components/software/ShowcaseSoftware.tsx) | Cards de landing software |
| [BentoIA.tsx](../src/components/ia/BentoIA.tsx), [RubrosIA.tsx](../src/components/ia/RubrosIA.tsx) | Cards de landing IA |
| [BentoAutomation.tsx](../src/components/automation/BentoAutomation.tsx), [RubrosAutomation.tsx](../src/components/automation/RubrosAutomation.tsx) | Cards de landing automatización |
| 9 `hover:scale` de Tailwind | Adicionales a los `whileHover` de Framer |

Además: **ninguno** está detrás de `@media (hover: hover) and (pointer: fine)`. En touch, un tap dispara el estado de hover y lo deja pegado — el defecto que **R7** pide prevenir con ese gate.

### D.4 — Recomendación (única adición de movimiento del reporte)

**R3** del brief solo admite motion nuevo si cumple affordance o feedback. Esta cumple ambas y es sustractiva en el neto: **cambiar hover-scale por presión real.**

- **Quitar** `scale` de los 69 hovers de card; dejar solo el cambio de `borderColor`/superficie (y moverlo a `opacity` de una capa para no repintar).
- **Agregar** a todo elemento presionable: `whileTap={{ scale: 0.97 }}` con `transition: { duration: 0.16, ease: [0.16,1,0.3,1] }` — los valores exactos de **R4**. Ya existe como `buttonPress` en [motion-variants.ts:70](../src/lib/motion-variants.ts#L70); no hay que inventarlo, hay que importarlo.
- **Agregar** `focus-visible:ring` en las 5 familias de D.2, con el mismo tratamiento visual que el hover (un solo token de estado, no dos lenguajes).
- **Timing asimétrico** (**R5**): la presión entra en ~160ms y la vuelta snapea en ~100ms. Es lo que hace que un control se sienta apretable en lugar de animado.
- **Gatear** el hover residual detrás de `@media (hover: hover) and (pointer: fine)`.

---

## E. Presupuesto y accesibilidad

### E.1 — Peso de `motion` en el bundle

**Archivos del sitio público que importan `motion/react`: 104.** (Repo completo: 219 — o sea que el sitio público es ~47% de la superficie de motion.)

Versión instalada: `motion@^12.36.0`. En `node_modules` conviven `motion` (711 KB), `motion-dom` (4,3 MB) y `framer-motion` (5,5 MB) — este último **no está en `package.json`**, entra como dependencia transitiva. Vale revisar si se está empaquetando por duplicado.

Medición sobre el build existente (`.next`, BUILD_ID `sz5RWSDcTo8c-zSg3xZyH`, 29-jul 22:18 — 97 chunks, 8,1 MB):

| Chunk con firma de motion | Raw | Gzip |
|---|---|---|
| `5354-801e97920eea60fb.js` | 128 KB | **42 KB** |
| `2269-d44d456753467964.js` | 53 KB | **16 KB** |
| `7369-3177900c99990790.js` | 22 KB | **5 KB** |
| **Total** | **203 KB** | **63 KB** |

**No pude producir el First Load JS por ruta** — ver §F.

Para contexto: el presupuesto de "landing page" de las reglas de `web/performance.md` es **< 150 KB JS gzip**. Los 63 KB de motion consumen **~42% del presupuesto de una landing**, antes de React, Three.js o cualquier código de producto.

### E.2 — ¿Cuántas se pueden hacer con IntersectionObserver + CSS?

Esta es la pregunta central del apartado, y la respuesta es contundente. Distribución de las formas `initial` asociadas a `whileInView` en el sitio público (76 declaraciones muestreadas):

| Forma de `initial` | Cantidad | ¿CSS + IO? |
|---|---|---|
| `{ opacity, y }` | **37** | ✅ trivial |
| `{ opacity, y, filter: blur() }` | 8 | ✅ `filter` es animable en CSS |
| `{ opacity, y, scale }` | 5 | ✅ |
| `{ scaleX, opacity }` | 4 | ✅ |
| `{ opacity, scale }` | 4 | ✅ |
| `{ opacity }` | 3 | ✅ |
| `{ scaleX }` | 2 | ✅ |
| `{ opacity, x }` | 2 | ✅ |
| `{ scaleY }` | 1 | ✅ |
| `{ opacity, y, rotateX }` | 1 | ✅ |
| `{ opacity, scale, filter: blur() }` | 1 | ✅ |
| `{ opacity, rotate, scale }` | 1 | ✅ |
| `{ pathLength, opacity }` | 2 | ⚠️ necesita JS o el truco de `strokeDashoffset` |
| `{ width: '...%' }` | 2 | ❌ — y son hallazgo de performance de por sí (**A7**) |

**69 de 76 (91%) son pura combinación de `opacity` + `transform` + `filter`** → reproducibles con una clase CSS y un `IntersectionObserver` de ~15 líneas. Solo 2 (`pathLength`, dibujado de SVG) justifican JS; y las 2 de `width` no deberían existir en ninguna tecnología.

Sumado: **37 son literalmente el mismo `opacity: 0, y: N`**. Un solo par clase-CSS + observer compartido cubre la mitad del inventario de reveals del sitio.

**Qué se ahorraría sacando la librería del bundle inicial.** Con honestidad sobre los límites: **63 KB gzip** es el techo teórico, alcanzable solo si *ningún* componente de la ruta necesita `motion`. Eso hoy no es cierto — quedan usos legítimos: los springs del dock ([DynamicDock.tsx:344](../src/components/layout/DynamicDock.tsx#L344)), `AnimatePresence` en el navbar móvil, el driver de los paneles de servicios si se pasa a `MotionValue` (**A1**), y el `useTransform` sobre `scrollYProgress` de varias landings. El camino realista es:

1. Migrar los 69 reveals a CSS + un `IntersectionObserver` compartido. Elimina `motion` de la mayoría de los 104 archivos.
2. Concentrar el motion JS restante en pocos componentes y cargarlos con `dynamic()`, para que `motion` caiga en un chunk diferido y no en el First Load.
3. El ahorro en el bundle **inicial** de cada ruta se acerca entonces a los 63 KB, aunque la librería siga en el sitio para las piezas que la necesitan.

Beneficio adicional que no es peso: **R6** dice que CSS gana a rAF bajo carga porque corre fuera del main thread. Los reveals por scroll ocurren justo mientras el navegador está cargando, scripteando y pintando — exactamente cuando el rAF de Framer tartamudea. Migrarlos a CSS mejora el *feel* además del peso.

### E.3 — ¿Cuántas respetan `prefers-reduced-motion`?

**64 archivos** del sitio público consultan `useReducedMotion` o `prefers-reduced-motion`, sobre 104 que importan `motion` → **~62% de cobertura por archivo**. Las 4 landings de servicio están bien cubiertas casi por completo.

Pero la cobertura por archivo engaña, por dos motivos:

**1. No hay red de seguridad global.** [globals.css](../src/app/globals.css) (371 líneas) tiene **0** bloques `@media (prefers-reduced-motion: reduce)`, y define **0** tokens `--ease-*` / `--duration-*`. Los ~30 `@keyframes` del archivo (`shimmer`, `rotate-border`, `pulse`, `breathe`, `floatMetric`, `spin`, `ringPulse`, `cursorBlink`, …) corren sin excepción para todos los usuarios. Un solo bloque global sería la mejora de accesibilidad más barata del rediseño.

**2. Donde existe, a veces está mal implementado.** El caso de [WhyDevelOP.tsx](../src/components/sections/home/WhyDevelOP.tsx) (**E1**) es peor que no tenerlo: `duration: shouldSimplify ? 0.01` con `repeat: Infinity` convierte 11 animaciones en loops de 100 Hz para el usuario que pidió *menos* movimiento. Y como `shouldSimplify = shouldReduceMotion || isMobile`, alcanza a **todo mobile**.

**Archivos con motion y sin ninguna gestión de reduced-motion** (los que importan para el rediseño):

| Archivo | Qué anima sin gate | Impacto |
|---|---|---|
| [OurServices.tsx](../src/components/sections/home/OurServices.tsx) | La pieza destinada a ser la única animación viva de la home + 8 loops perpetuos | **Alto** |
| [Navbar.tsx](../src/components/layout/Navbar.tsx) | 2 loops perpetuos | **Alto** — presente en las 6 rutas |
| [CustomCursor.tsx](../src/components/ui/CustomCursor.tsx) | Cursor con spring que reemplaza el nativo | **Alto** — las 6 rutas |
| [TypewriterText.tsx](../src/components/ui/TypewriterText.tsx) | Tipeo perpetuo del H1 + cursor `blink` | **Alto** (se elimina por **E4**) |
| [MagneticCta.tsx](../src/components/ui/buttons/MagneticCta.tsx) | Magnético + borde perpetuo + `letterSpacing` | **Alto** — CTA principal |
| [StoryMomentCard.tsx](../src/components/sections/portal-demo/StoryMomentCard.tsx) | 8 reveals + blur-in + pulso de `boxShadow` | Medio |
| [StoryArcLunes.tsx](../src/components/sections/portal-demo/StoryArcLunes.tsx), [portal-demo/PortalDemo.tsx](../src/components/sections/portal-demo/PortalDemo.tsx) | 3 loops de ambiente + reveals | Medio |
| [Footer.tsx](../src/components/sections/home/Footer.tsx) | 12 reveals | Bajo |
| [Portfolio.tsx](../src/components/sections/home/Portfolio.tsx) | 4 reveals | Bajo |
| [About.tsx](../src/components/sections/home/About.tsx) | Reveals + keyframes de logo en `globals.css` | Bajo |
| [Hero.tsx](../src/components/layout/Hero.tsx) | *Parcial:* gatea el 3D y las overlays, **no** la grilla en deriva ([:519](../src/components/layout/Hero.tsx#L519)) | Medio |

---

## Tabla resumen

Ordenada por prioridad según impacto en la percepción de calidad. **Los 12 veredictos ELIMINAR los firma Franco** — son decisiones de diseño, no del agente.

| # | Animación | Ruta | Veredicto | Parámetro a cambiar | Prioridad |
|---|---|---|---|---|---|
| E1 | 11 loops con reduced-path `0.01` + `repeat: Infinity` — [WhyDevelOP.tsx](../src/components/sections/home/WhyDevelOP.tsx) | `/` | **ELIMINAR** | Es un bug: 100 Hz para reduced-motion **y todo mobile** | **Alta** |
| A1 | Paneles auto-secuenciados — [OurServices.tsx](../src/components/sections/home/OurServices.tsx) | `/` | **AJUSTAR** | `setState` 60fps → `MotionValue`; techo `11000`→`6000`; `HOLD` `2000`→`1200`; agregar reduced-motion | **Alta** |
| E3 | Marquee de 4 filas — [InfiniteReviews.tsx](../src/components/sections/home/InfiniteReviews.tsx) | `/` | **ELIMINAR** | rAF nunca detenido + 5 layouts y 13 paints por frame | **Alta** |
| E4 | Typewriter del H1 — [TypewriterText.tsx](../src/components/ui/TypewriterText.tsx) | `/` | **ELIMINAR** | Anima el texto que hay que leer, en loop indefinido | **Alta** |
| E6 | Canvas 3D del hero — [Hero.tsx](../src/components/layout/Hero.tsx) + [DotMatrix.tsx](../src/components/canvas/DotMatrix.tsx) | `/` | **ELIMINAR** | Ya decidido; sin gate de viewport, 5.040 instancias + 3 pases post | **Alta** |
| D.2 | Ausencia de `focus-visible` (4 en todo el sitio público) | todas | **AJUSTAR** | Agregar en CTA, submit, tabs, cards y FAQ | **Alta** |
| A16 | Submit de contacto — [contact/page.tsx:217](../src/app/contact/page.tsx#L217) | `/contact` | **AJUSTAR** | `whileTap` + `focus-visible` + spinner | **Alta** |
| E8/D.3 | `scale` en hover de 69 cards | todas | **ELIMINAR** | Prohibido por la dirección; además ungateado para touch | **Alta** |
| E10 | `animate-border-spin` del CTA — [MagneticCta.tsx:121](../src/components/ui/buttons/MagneticCta.tsx#L121) | todas | **ELIMINAR** | `conic-gradient` repintado a 60fps, perpetuo, en el CTA principal | **Alta** |
| E11 | `letterSpacing` en hover del CTA — [MagneticCta.tsx:164](../src/components/ui/buttons/MagneticCta.tsx#L164) | todas | **ELIMINAR** | Reflow de texto en hover | **Alta** |
| A17 | Sin tokens ni reduced-motion global — [globals.css](../src/app/globals.css) | todas | **AJUSTAR** | Crear `--ease-*`/`--duration-*` + 1 bloque `prefers-reduced-motion` | **Alta** |
| E5 | Grilla del hero en deriva — [Hero.tsx:519](../src/components/layout/Hero.tsx#L519) | `/` | **ELIMINAR** | Ignora el `prefersReducedMotion` que el archivo ya calcula | Media |
| E7 | Glass de cards — [StoryMomentCard.tsx:264](../src/components/sections/portal-demo/StoryMomentCard.tsx#L264) | `/` | **ELIMINAR** | `backdropFilter: blur(20px) saturate(180%)` | Media |
| A9 | 2 loops del navbar — [Navbar.tsx:75](../src/components/layout/Navbar.tsx#L75), [:107](../src/components/layout/Navbar.tsx#L107) | todas | **AJUSTAR** | Gatear con `useReducedMotion` (patrón de `PILL_INSTANT`) | Media |
| A2 | Reveals del hero — [Hero.tsx:635-718](../src/components/layout/Hero.tsx#L635) | `/` | **AJUSTAR** | `[0.25,0.46,0.45,0.94]`→`[0.16,1,0.3,1]`; delay máx `0.56`→`0.24`; `0.7`→`0.5` | Media |
| E2 | 20 loops perpetuos restantes de WhyDevelOP | `/` | **ELIMINAR** | Decorativos, compiten entre sí | Media |
| E9 | 12 loops de los 4 CTA finales | 4 landings | **ELIMINAR** | Movimiento perpetuo compitiendo con la acción principal | Media |
| A7 | 32 animaciones de `width`/`height`/`top`/`left` | todas | **AJUSTAR** | → `scaleX` + `transformOrigin` (patrón en [StoryMomentCard.tsx:84](../src/components/sections/portal-demo/StoryMomentCard.tsx#L84)) | Media |
| A6 | 57 `transition: all` / `transition-all` | todas | **AJUSTAR** | Enumerar propiedades | Media |
| A10 | Shorthands `x`/`y` del CTA — [MagneticCta.tsx:131](../src/components/ui/buttons/MagneticCta.tsx#L131) | todas | **AJUSTAR** | → `transform` string | Media |
| A11 | `getBoundingClientRect()` por pointermove — [MagneticCta.tsx:72](../src/components/ui/buttons/MagneticCta.tsx#L72) | todas | **AJUSTAR** | Cachear en `pointerenter` | Media |
| A13 | Blur-in de textos — [StoryMomentCard.tsx:11](../src/components/sections/portal-demo/StoryMomentCard.tsx#L11) | `/` | **AJUSTAR** | Quitar `filter: blur(6px)`, dejar `opacity`+`y` | Media |
| E12 | Archivo muerto — [sections/home/PortalDemo.tsx](../src/components/sections/home/PortalDemo.tsx) | — | **ELIMINAR** | 61 KB sin importadores | Media |
| A18 | ~12 curvas de un solo uso, varias ease-in | todas | **AJUSTAR** | Consolidar en 2 tokens | Media |
| A3 | `ease: [0.4,0,1,1]` — [WebDevelopmentByRubro.tsx:148](../src/components/sections/web-development/WebDevelopmentByRubro.tsx#L148) | `/web-development` | **AJUSTAR** | → `[0.16,1,0.3,1]` (es ease-in puro) | Baja |
| A4 | `ease: 'easeIn'` — [CalculadoraAutomation.tsx:696](../src/components/automation/CalculadoraAutomation.tsx#L696) | `/process-automation` | **AJUSTAR** | → `'easeOut'` | Baja |
| A5 | Curva no monótona — [ChargeTraceButton.tsx:52](../src/components/ui/buttons/ChargeTraceButton.tsx#L52) | `/web-development` | **AJUSTAR** | Salida → `[0.16,1,0.3,1]` | Baja |
| A8 | Pulso de `boxShadow` — [StoryMomentCard.tsx:296](../src/components/sections/portal-demo/StoryMomentCard.tsx#L296) | `/` | **AJUSTAR** | → `opacity` de pseudo-elemento, o eliminar | Baja |
| A12 | Hover del CTA sin easing — [MagneticCta.tsx:150](../src/components/ui/buttons/MagneticCta.tsx#L150) | todas | **AJUSTAR** | Agregar `ease`; `boxShadow`/`background` → `opacity` | Baja |
| A14 | rAF de partículas sin límite — [GarantiaIA.tsx:698](../src/components/ia/GarantiaIA.tsx#L698) | `/ai-implementations` | **AJUSTAR** | Agregar corte por visibilidad | Baja |
| A15 | Shutter — [Shutter.tsx:14](../src/components/layout/Shutter.tsx#L14) | todas | **AJUSTAR** | `easeInOut` → `[0.16,1,0.3,1]` | Baja |
| C1–C10 | Ver §B.3 (10 ítems) | varias | **CONSERVAR** | — | — |

**Recuento:** 12 ELIMINAR · 18 AJUSTAR · 10 CONSERVAR.

---

## Sugerencias del skill que se descartaron

El skill aporta el CÓMO; la dirección estética ya está cerrada. Estas recomendaciones suyas chocan con ella y **no** se llevan al rediseño:

| Sugerencia del skill | Por qué se descarta |
|---|---|
| **Materiales translúcidos / vidrio (`apple-design`, `backdrop-filter`, capas de profundidad)** | Frontal contra "superficies planas y quietas". El glassmorphism es justamente lo que se elimina (**E7**), y está codificado como patrón en el `CLAUDE.md` (`bg-white/[0.04] backdrop-blur-[20px] backdrop-saturate-[180%]`) — hay que despatronarlo, no propagarlo. |
| **`filter: blur(2px)` para enmascarar crossfades** (**R6**, §"Masking imperfect crossfades") | Técnicamente válido, pero introduce material difuso donde la dirección pide bordes definidos. En el único lugar donde el sitio ya lo hace ([StoryMomentCard.tsx:11](../src/components/sections/portal-demo/StoryMomentCard.tsx#L11)) el veredicto es **quitarlo** (**A13**), no extenderlo. Si un crossfade se ve doble, la respuesta acá es cortarlo o hacerlo instantáneo. |
| **Springs con `bounce: 0.1–0.3`** (**R5**) | "Instrumento de precisión" no rebota. Los springs se conservan solo donde son funcionalmente necesarios (gestos interrumpibles del dock, **C3**) y con `bounce` en 0. Para todo lo demás, curvas con duración fija. |
| **"Rare / high-emotion moments can add delight"** (**R1**, tabla de frecuencia) | El skill autoriza deleite en momentos de primera visita — que es exactamente lo que justificaba el intro 3D. El sesgo del proyecto es restraint y el 3D ya está decidido para eliminarse: no se usa esta puerta para reintroducir coreografía en el hero. |
| **Stagger para entradas de grupo** donde hoy no hay (**R8**, categoría 8 "missed opportunities") | El skill lo pediría en varias grillas de cards del sitio. Con 118 reveals ya en juego, agregar stagger va en la dirección opuesta a "menos motion, mejor ejecutado". Solo se conserva donde ya existe y está bien calibrado (**C6**). |
| **`@starting-style` / capas de motion adicionales para entradas sin JS** (**R5**) | Útil, pero es motion nuevo. Acá el objetivo de la migración a CSS (§E.2) es **reproducir** los reveals existentes más barato, no agregar entradas donde hoy no hay. |
| **Efectos 3D (`rotateX/Y` + `preserve-3d`)** (**R6**, §"Transforms & clip-path") | El skill los ofrece como herramienta de profundidad sin JS. El único lugar del sitio que los usa es el marquee, y son parte de por qué es caro (§C.2). Superficies planas: sin perspectiva. |

**Se descarta también, por precedencia del brief sobre el skill:** el flujo por defecto de `improve-animations` escribe planes en `plans/NNN-slug.md`. Acá el entregable es un reporte único en `docs/probe-motion-sitio.md` (regla 1 del cierre), así que se usó su método de auditoría (recon → categorías → vetting → tabla priorizada) sin su formato de salida ni la fase de planes.

---

## F. Lo que no se pudo verificar

| # | Qué | Por qué |
|---|---|---|
| **F1** | **First Load JS por ruta.** El apartado E.1 pedía "cuánto pesa en el bundle inicial de cada ruta". No hay número por ruta. | El build en `.next` **no contiene `app-build-manifest.json`** (solo `build-manifest.json`, cuya clave `pages` tiene únicamente `/_app`, del Pages Router). Sin ese archivo no hay mapeo ruta-App-Router → chunks. Concuerda con lo ya sabido de este repo: Next 16 con `--webpack` no imprime First Load JS. Lo que sí se midió: los 3 chunks con firma de `motion`, **63 KB gzip / 203 KB raw**. Para cerrarlo haría falta correr un build con analyzer — es mutación de estado, fuera de una auditoría read-only. |
| **F2** | **Feel real de cada animación.** Ningún veredicto de "se siente bien/mal" está verificado en runtime. | No se abrió browser: esto es un relevamiento de código, no una corrida visual. Todos los veredictos son deducibles del código (curvas, duraciones, propiedades animadas, gates) o de la dirección ya cerrada. Lo que **no** es deducible del código y queda pendiente de feel-check por **R5**/§Debugging del skill: (a) si el ciclo de 30s propuesto para OurServices (**A1b**) es efectivamente legible, (b) si la cascada de 240ms del hero (**A2**) se lee como una entrada o como un salto, (c) si el marquee sin `rotateX` sigue leyéndose como profundidad. Los tres necesitan verse en slow motion y en dispositivo real. |
| **F3** | **Costo en frames de cada pieza (FPS, long tasks, INP).** Los costos de §A y §C son análisis estático: cantidad de instancias, layouts forzados, paints por frame, propiedades no compuestas. | Sin runtime no hay perfilado. El caso donde más importaría medir en vez de deducir es **E1** (los loops a 100 Hz de WhyDevelOP): el mecanismo está confirmado leyendo el código, pero su impacto real en FPS de mobile no está cuantificado. |
| **F4** | **Si `framer-motion` (5,5 MB en `node_modules`, ausente de `package.json`) llega al bundle del cliente** en paralelo a `motion`. | Requiere análisis del grafo de dependencias del build. Se reporta como sospecha a confirmar, no como hecho. |
| **F5** | Peso exacto que se recupera al eliminar el 3D (§C.1). | Depende de F1. Se nombran los paquetes que salen de la ruta crítica (`three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`) sin cifra por ruta. |

---

## Verificación humana (Franco)

1. **Firmar los 12 ELIMINAR.** Son decisiones de diseño. Tres merecen atención particular:
   - **E1** es el único que no es cuestión de gusto: es un bug de accesibilidad y de performance en mobile. Se puede arreglar sin esperar el rediseño.
   - **E3** (marquee) y **E4** (typewriter) son las dos piezas más visibles que se van del home.
   - **E12** es borrado de código muerto: no cambia nada visible.
2. **Confirmar el techo de tiempos de A1b** (6000ms por tab, HOLD 1200ms). Es la decisión que define si los paneles se leen o se abandonan.
3. Lo que quede CONSERVAR/AJUSTAR entra como especificación en **B2 y B3**. Punto de partida sugerido: extender [motion-variants.ts](../src/lib/motion-variants.ts) y adoptar [Button.tsx](../src/components/ui/Button.tsx) en el sitio público — el sistema correcto ya existe, hoy vive solo del lado del portal.
