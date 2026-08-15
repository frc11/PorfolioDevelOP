# B0b — Auditoría delta sobre main · Rediseño del Home develOP

## Cómo correr esta instrucción

- **Modelo:** Fable 5. **Esfuerzo:** `xhigh`. **Modo rápido: OFF.** Modo NO autónomo.
- Sesión limpia. Worktree **`C:\rediseno-home`**, branch **`rediseno/home`** (nacido de `main`). El checkout `C:\PorfolioDevelOP` y el worktree `logic-core-runtime` **no se tocan**.
- PowerShell: no encadenar con `&&`; rutas con paréntesis — p. ej. `(protected)` — entre comillas; `tsc` siempre solo.
- **UNA PARADA 🛑** antes del commit final.

## Por qué existe esta instrucción

Ya se corrió una auditoría (`docs/rediseno/B0-AUDITORIA.md`, en este worktree). **Corrió sobre el árbol equivocado**: el branch experimental `redesign/home`, no sobre `main`. Consecuencia: todo lo que describe del **home** es inválido, porque el commit `78b510ac` restauró la home clásica en main. El resto de sus hallazgos sigue vigente.

Tu trabajo es **la diferencia**: relevar el home real de main, revalidar por muestreo lo que el B0 dio por cierto fuera del home, y sumar dos áreas nuevas. **No repitas lo que el B0 ya cubrió bien.**

**Primer paso obligatorio:** leé `docs/rediseno/B0-AUDITORIA.md` entero antes de tocar nada. Es tu línea de base.

## Contexto del rediseño (para tu criterio de relevancia)

develOP rediseña su home. Decisiones ya cerradas:

- **Ritmo cromático:** hero CLARO → oscuro en "quiénes somos" + "trabajos" → vuelve a CLARO en el carrusel → tramo de servicios con wash de color por servicio → claro hasta el cierre. Transición smooth entre estados, no corte seco.
- **Home de 11 secciones a 8:** hero · quiénes somos · trabajos · carrusel · servicios · tu panel · por qué develOP · cierre.
- **Muere:** glassmorphism, `InfiniteReviews`, `WhyDevelOP` en su forma actual, y las cuatro secciones post-servicios (`PortalDemo`, `TodoIncluido`, `ModulosOpcionales`, `PortalDemoCTA`) se funden en una sola.
- **Fusión IA + Automatización** en un servicio: dock 5→4, una ruta, redirects 301.
- **Trío de acento:** azul (web), verde (IA+automatización), violeta (software). El ámbar muere.
- **Motion buscado:** intro inmersiva con el logo 3D, transición cromática al cruzar un punto, apariciones y carruseles.
- **El trabajo real es el protagonista** de la página: capturas de sitios de clientes y del panel.

Tu criterio en todo momento: "¿esto le sirve o le estorba a ese rediseño?".

## Reglas absolutas

1. **Solo lectura sobre el código.** El único archivo que creás es el reporte.
2. **Git solo lectura** + el commit/push final del reporte. **PROHIBIDO:** `reset`, `rebase`, `merge`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, borrar branches, y cualquier operación sobre `main`, sobre `redesign/home` o sobre otros worktrees.
3. **Nada de base de datos.** Ningún `prisma migrate` (y `migrate reset` está prohibido siempre).
4. No instalás dependencias ni corrés `npm install`.
5. **No arreglás nada de lo que encuentres**, aunque el fix parezca trivial.
6. No auto-confirmás estados visuales: lo que requiera ojo humano se marca `[REQUIERE VERIFICACIÓN HUMANA]`.
7. Archivos frozen (`HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, entre otros): se leen, jamás se editan.

## La tarea — 3 tandas

Escribís el reporte **incrementalmente** en `docs/rediseno/outputs/B0b-DELTA-MAIN.md`, cerrando tanda por tanda. Al terminar cada una: guardás y reportás en 2 líneas qué cerraste. Si la sesión muere por cuota, lo guardado se conserva.

---

### TANDA A — El home real de main (el corazón de esta auditoría)

**A1. Composición.** `src/app/page.tsx`: orden real de secciones, cuáles entran por `dynamic()` y con qué opciones. Rol actual de `HomeWrapper` y `SectionWrapper` (patrón de reveal, thresholds, variants).

**A2. Sección por sección.** Para cada una — Hero, About, Portfolio, InfiniteReviews, OurServices, PortalDemo, TodoIncluido, ModulosOpcionales, PortalDemoCTA, WhyDevelOP, Footer — reportá: archivo y tamaño en líneas · qué renderiza · de dónde salen sus datos (hardcodeados / archivo de datos / API) · dependencias notables · **fondo actual (claro u oscuro) y de dónde sale ese color**.

**A3. Volcado del copy del home.** Todos los textos visibles, ordenados por sección, literales. Insumo directo del chat de copy.

**A4. Inventario de glassmorphism en el home.** `backdrop-blur`, `bg-white/`, `bg-black/`, `border-white/` y equivalentes: archivo · cantidad · contexto. Solo el home y el chrome que lo rodea (Navbar, dock, Footer, widget); las landings ya las cubrió el B0.

**A5. Sistema de estilos que sobrevivió.** El B0 detectó que main conserva `src/components/design-system/`, `/styleguide` y tokens `ds-*` aunque la home volvió a la clásica. Verificá: qué tokens existen hoy en `globals.css`, qué componentes hay en `design-system/`, **cuáles de ellos usa realmente el home actual y cuáles quedaron huérfanos**. Fuentes cargadas en `layout.tsx`.

**A6. Dock, Navbar y rutas.** Items de `DynamicDock` (labels, colores, rutas, `ROUTE_TO_LABEL`), estado del menú mobile, y **estado de `VALID_PATHS` / `home-routes.ts` / `navigateToPage.ts`** — verificá si las anclas quedaron coherentes tras la restauración o si hay anclas rotas (`/#portafolio`, `/#calculadora`). Árbol de rutas de `src/app` en tabla.

---

### TANDA B — Motion, performance y material

**B1. Inventario de mecanismos de motion existentes.** Qué hay ya construido y reutilizable: el preloader y su intro, el logo 3D y su seguimiento del mouse, `MagneticCta`, `KineticText`, `TypewriterText`, primitivas compartidas (`AnimatedCounter`, `FadeIn`, `StaggerWrapper`), el scroll horizontal de About, el carrusel de palabras. Por cada uno: archivo · qué hace · **si es frozen** · si serviría para intro inmersiva / transición cromática / apariciones.

**B2. El scroll-lock del intro.** La bitácora documenta que en el home clásico el scroll se libera recién a los ~9,8 s (incluye `LOGO_READY_TIMEOUT_MS` de 2,5 s). Localizá el mecanismo exacto: qué archivos lo implementan (`EarlyScrollLock`, `Preloader`, `useChromeRevealed`, `TransitionContext`), qué constantes lo gobiernan y **dónde se libera el scroll**. Sin proponer cambios: solo el mapa.

**B3. Lenis y comportamiento de scroll.** Settings actuales en `SmoothScroll.tsx` (lerp, syncTouch, dónde está apagado). Relevante para transiciones cromáticas ligadas al scroll.

**B4. Inventario de material visual disponible.** Recorré `public/`: imágenes de proyectos y demos (cuáles existen de verdad y a qué resolución), variantes del logo, avatar del widget, favicon y OG. **Marcá explícitamente qué imágenes están referenciadas en el código pero no existen en disco, y cuáles existen pero nadie usa.** Este inventario define qué material hay que producir.

**B5. Chatbot en la landing.** Cómo está montado hoy (`ChatWidgetMount`), estética del widget y su avatar. Sobre el 500 de `/api/chatbot/develop/config`: el B0 hipotetizó que el camino GET no tiene `try/catch`. **Main tiene commits posteriores de la serie CARRERAS que tocaron manejo de errores del chatbot** — revisá si esa hipótesis sigue en pie sobre el código actual de main. Sin arreglar nada.

---

### TANDA C — Revalidación, minería y cierre

**C1. Revalidación por muestreo del B0.** No re-audites: verificá que estos hallazgos siguen siendo ciertos en main y marcá VIGENTE / CAMBIÓ / NO VERIFICABLE, con una línea de evidencia cada uno:
- ~77 instancias de `backdrop-blur` en las 4 landings + `/contact`
- Cifras y testimonios fabricados en landings (38+ proyectos, +312 diagnósticos, testimonios con nombre) — listá dónde viven exactamente, porque hay que demolerlos
- Precios contradictorios sin fuente central
- Route B cableada (`marketing-routes`, `MarketingIntro`, `BrandedIntroCanvas`, rama en `Preloader`, `isAutomationEnvironment`)
- Token `--color-ds-control-edge` no definido · `/og-image.png` inexistente · logo PNG de 1,2 MB
- `DotMatrix` atando login / forgot-password / accept-invite

**C2. Baseline técnico.** Corré `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\` (solo, sin encadenar) y volcá el resultado completo, separando errores conocidos de nuevos. Versiones exactas en `package.json` de: next, react, tailwind, motion, lenis, three, `@react-three/*`, lucide-react.

**C3. Mapa de impacto de la fusión IA + Automatización.** El B0 lo armó sobre el otro árbol: **rehacelo sobre main**. Rutas, componentes vivos y huérfanos, y todos los consumidores de ruta (Navbar, dock, `VALID_PATHS` del chatbot, sitemap, contact, accents). Solo el mapa; no propongas el cambio.

**C4. Minería del branch experimental.** `redesign/home` fue mergeado a main y luego `78b510ac` restauró la home clásica, así que **su código es legible desde la historia de main sin checkout**: usá `git show 78b510ac^:<ruta>` para ver la versión previa a la restauración, y `git show 78b510ac --stat` para la lista de archivos afectados.

**No se va a retomar ese rediseño** — se busca material aprovechable. Entregá **5 a 10 ideas**, no más, cada una con: qué es · archivo y comando exacto para recuperarla · por qué sirve al rediseño nuevo (ritmo cromático, motion, estructura de 8 secciones, protagonismo del trabajo real). Priorizá mecanismo y estructura por encima de estética. Cerrá con una lista corta de descartables y su razón.

**C5. Riesgos y sorpresas.** Máximo 10 puntos, solo hallazgos reales que la planificación deba conocer. Si un área es rutina, decilo.

---

## Cierre

1. Verificá con `git status` que el único cambio es el reporte.

🛑 **PARADA:** mostrá (a) resumen ejecutivo en 15 líneas y (b) `git status`. Esperá el OK.

2. Con el OK: `git add docs/rediseno/outputs/B0b-DELTA-MAIN.md` → `git commit -m "B0b: auditoria delta sobre main para rediseno del home"` → `git push -u origin rediseno/home`.
3. Último mensaje, textual: **"Este reporte releva estado; no aprueba ni decide cambios. Las decisiones quedan en la capa de planificación."**
