# B0b — Auditoría delta sobre main · Rediseño del Home develOP

- **Fecha:** 2026-08-14
- **Worktree:** `C:\rediseno-home` · branch `rediseno/home` (nacido de `main`, 0 behind / 1 ahead — el commit de docs `18272039`) · árbol limpio al arrancar
- **Base:** `main` = `1e5b7fbb` (2026-08-12, cierre del bloque carreras). La home clásica fue restaurada en main por `78b510ac` desde `63a4e364`.
- **Método:** solo lectura sobre código y git; `tsc --noEmit` como única ejecución; nada de DB; nada se arregló. Extracción de secciones grandes vía subagentes read-only (archivos y líneas citados).
- **Relación con B0:** `docs/rediseno/B0-AUDITORIA.md` auditó el árbol equivocado (`redesign/home-v2`). Este delta releva el home REAL de main, revalida por muestreo lo demás y agrega motion/material/minería. Lo que el B0 cubrió bien fuera del home no se repite acá.

---

## TANDA A — El home real de main

### A1 · Composición

`src/app/page.tsx` (46 líneas, Server Component shell): **11 piezas** — 9 secciones + Footer, envueltas en `ThemeProvider` → `HomeWrapper`.

Orden real de render y carga:

| # | Pieza | Import | Opciones de `dynamic()` |
|---|---|---|---|
| 1 | `Hero` | **estático** (ATF) | — |
| 2 | `About` | **estático** (ATF) | — |
| 3 | `Portfolio` | `dynamic()` | `loading: <div min-h-[50vh] animate-pulse bg-zinc-900/20>` |
| 4 | `InfiniteReviews` | `dynamic()` | `loading: min-h-[20vh] bg-zinc-900/20` |
| 5 | `OurServices` | `dynamic()` + `<SectionWrapper>` | `loading: min-h-[50vh] bg-[#030303]` |
| 6 | `PortalDemo` | `dynamic()` + `<SectionWrapper>` | `loading: min-h-[50vh] bg-[#030303]` |
| 7 | `TodoIncluido` | `dynamic()` | `loading: min-h-[50vh] bg-[#030303]` |
| 8 | `ModulosOpcionales` | `dynamic()` | `loading: min-h-[50vh] bg-[#030303]` |
| 9 | `PortalDemoCTA` | `dynamic()` | `loading: min-h-[50vh] bg-[#030303]` |
| 10 | `WhyDevelOP` | `dynamic(..., { ssr: true })` | — |
| 11 | `Footer` | `dynamic(..., { ssr: true })` | — |

**`HomeWrapper`** (`src/components/layout/HomeWrapper.tsx`, 22 líneas): client; `motion.main` que anima `backgroundColor`/`color` según `useTheme()` — `#fafafa`/`#18181b` (light) · `#000000`/`#ffffff` (dark), 0.8s easeInOut. Es el mecanismo de "transición cromática" que el home clásico ya tiene, con dos limitaciones: (a) los hex son propios, no tokens; (b) casi todas las secciones pintan fondo opaco encima, así que el wrapper solo asoma en los empalmes.

**`SectionWrapper`** (`src/components/layout/SectionWrapper.tsx`, 18 líneas): `div bg-[#030303]` + `motion.div` con reveal `opacity 0→1, y 40→0`, `whileInView`, `viewport {once: true, margin: '-15%'}`, 0.8s easeOut. Solo envuelve a OurServices y PortalDemo.

**Mecanismo de tema** (`src/hooks/useThemeObserver.tsx`): `ThemeProvider` guarda `light|dark` y lo espeja en `data-theme` del `<html>`. Las secciones lo empujan con `useThemeSection(isInView, tema)`: **solo dos lo hacen** — `About` fuerza `'light'` (About.tsx:402,461) y `WhyDevelOP` fuerza `'dark'` (WhyDevelOP.tsx:1578). El resto no participa. El hook `useThemeSectionOptional` (agregado por el rediseño para `SectionShell`) sobrevive en main sin romper nada.

### A2 · Sección por sección

| # | Sección | Archivo | Líneas | Fondo real (fuente) |
|---|---|---|---|---|
| 1 | Hero | `layout/Hero.tsx` | 826 | **CLARO** `bg-[#f1f2f4]` (Hero.tsx:521); columna derecha `md:bg-zinc-50` (:757); bottom-fade a negro (:819) |
| 2 | About | `sections/home/About.tsx` | 527 | **OSCURO** `bg-black` (About.tsx:411 mobile, :471 desktop) — pinta negro encima aunque fuerza tema `light` |
| 3 | Portfolio | `sections/home/Portfolio.tsx` | 734 | **OSCURO** `bg-black` (:726, repetido :158/:405/:610) |
| 4 | InfiniteReviews | `sections/home/InfiniteReviews.tsx` | 492 | **CLARO dinámico**: `#f5f5f5` inicial (:350); un rAF interpola `rgb(238→146)` según progreso de scroll (:293-298); scrims negros arriba/abajo (:406/:421) |
| 5 | OurServices | `sections/home/OurServices.tsx` | **9.898** | **OSCURO** `bg-[#020407]` (:9633) + wash radial por servicio activo (:8719-8729, alpha ~5%) |
| 6 | PortalDemo | `sections/portal-demo/` (6 archivos) | 293 + aux | **OSCURO** `bg-[#030303]` (:279) + gradiente `#020407→#031018→#020304` (:14-18); doble negro con su SectionWrapper |
| 7 | TodoIncluido | `sections/todo-incluido/` (3 archivos) | 336 + aux | **OSCURO** `bg-[#030303]` (:277) + gradiente propio (:50-52) |
| 8 | ModulosOpcionales | `sections/modulos-opcionales/` (3 archivos) | 505 + aux | **OSCURO** `bg-[#030303]` (:430) + gradiente propio (:200-202) |
| 9 | PortalDemoCTA | `sections/portal-demo-cta/PortalDemoCTA.tsx` | 395 | **OSCURO** `bg-[#030303]` (:241) + gradiente (:64-66); tarjeta `bg-[#03070c]/78` + `backdrop-blur-xl` (:249) |
| 10 | WhyDevelOP | `sections/home/WhyDevelOP.tsx` | 1.725 | **OSCURO** `bg-[#030303]` (:1604) + fondo cyan/azul multicapa (:1449-1561) |
| 11 | Footer | `sections/home/Footer.tsx` | 924 | **OSCURO** `#050505` inline (:115); 100% estilos inline, cero className |

**Ritmo cromático real de main: claro → negro × 2 → gris claro (marquee) → negro × 6.** Una sola sección clara en todo el tramo medio. Cada empalme se resuelve con scrims/gradientes manuales duplicados en cada componente (Hero:819, About:472, Portfolio:407-408, InfiniteReviews:406/421, WhyDevelOP:1537/1545). Contra el rediseño buscado (hero claro → oscuro → claro → wash → claro), la estructura de fondo actual está invertida: el home vive en negro.

Detalle por sección (qué renderiza · datos · dependencias):

1. **Hero** — client. Grid 2 columnas: izquierda copy (badge, H1 con `TypewriterText` ciclando 4 frases, párrafo, 2 `MagneticCta`, microcopy), derecha canvas R3F full-bleed con `HeroArtifact` (frozen) + `DotMatrixMesh` + sombra procedural + `EffectComposer` (ChromaticAberration/Noise/Vignette) + `Environment preset="studio"` (Hero.tsx:400 — **HDRI remoto de drei, NO el self-hosteado de `public/hdri/`**). Orquesta el intro con el Preloader (ver B2). Datos: constantes inline (`HERO_KEYWORDS` :19-24). Deps: `motion/react`, R3F/three/drei/postprocessing, `usePreloader`, `useLenis`. Sub-árbol de capas decorativas (grillas, glows) todas `aria-hidden`.
2. **About** — client. Scroll horizontal pinneado: contenedor `h-[400vh]` con sticky que traslada un track en X según `scrollYProgress`. DOS árboles duplicados (mobile/desktop) **ambos con `id="nosotros"`** → id duplicado en el DOM. Paneles: logotipo gigante "SOMOS develOP" con materialización SVG (`feTurbulence`+`feDisplacementMap`) + `KineticText`, manifiesto, fichas de equipo (Franco/Valentino, avatares tipográficos — no hay fotos). Datos: `teamMembers` inline (:24-41). Deps: `framer-motion` (no `motion/react`), `useThemeSection('light')`, `KineticText`. ⚠ Bug visible: el badge de ubicación en mobile renderiza mojibake literal `TucumÃ¡n... paÃ­s` (About.tsx:294 — la rama fallback de `LocationBadge` tiene el texto corrupto en el código).
3. **Portfolio** — client. Bloque 1 "NUESTROS TRABAJOS": 1 tarjeta grande del caso real (Concesionaria San Miguel) con tilt 3D. Bloque 2 "DEMOS POR RUBRO": carrusel de 5 demos (desktop 3 visibles + navegación circular, mobile paginado). Datos inline: `REAL_PROJECTS` (:26-41, 1 ítem), `DEMO_PROJECTS` (:43-99, 5 ítems). Deps: `framer-motion`, `next/image` (6 SVGs de showcase — **acá sí se usan los SVGs de `public/images/showcase/`**), lucide (flechas). Los `tags` de los 6 proyectos están escritos en data pero **ningún subcomponente los renderiza**.
4. **InfiniteReviews** — client. **El nombre miente: no hay reviews.** Es `ScrollingTextMarquee`: 4 capas de marquee tipográfico en perspectiva 3D (palabras RESULTADOS/PRECISIÓN/ESCALA/... + iconos de tecnologías como SVG inline), animado por un único rAF manual que escribe `transform`/`color` directo al DOM, gateado por IntersectionObserver y reduced-motion. Cero framer, cero Tailwind (estilos inline). `id="testimonials"`.
5. **OurServices** — client, el monolito (9.898 líneas). Scrollytelling vertical: 4 filas full-screen alternando lado, riel de progreso izquierdo, y por cada servicio un "demo en vivo" con 4 tabs internas con autoplay (16 simulaciones DOM: SEO, analytics, chat IA, CRM, stock...). Datos inline: `SERVICES` (:63-136, con precios), `ORDERED_SERVICE_IDS = [1,2,4,3]` (:138-147 — **el orden visual NO es el del array**: Web → IA → Software → Automatización), `SERVICE_IMPACT_ITEMS` (:7993-8014). Deps: `motion/react` intensivo (layoutId compartidos), 26 iconos lucide, `useLenis`, `useTransitionContext`; **sin three**. Wash de color por servicio activo vía IntersectionObserver por fila → `activeAccent` → radial de fondo (1.2s easeInOut). Anti-patrones documentados en §A3/C4: sims definidas dentro del render e invocadas como funciones planas, `setState` en rAF a 60fps, 64 `backdropFilter` inline, ~280 líneas de placeholder inalcanzable, bloque `display:none` de ~85 líneas.
6. **PortalDemo** — client. 3 escenas de "un lunes" (8:30/9:00/9:30) **apiladas verticalmente** con reveal por scroll — NO hay ciclo: `useEscenaCycle.ts` (85 líneas) tiene **cero importadores, es código muerto**. Mockups del panel reconstruidos en DOM (Health Score, Atención Hoy, Resultados). Datos: `STORY_MOMENTS` en `portal-demo/data.ts` (:15-64); las rutas `screenshotPath` (`/landing/portal-demo/*.webp`) nunca se consumen y `public/landing/` no existe. Deps: `motion/react`, lucide.
7. **TodoIncluido** — client. Header + 5 cards (grid 3+2) de herramientas del portal, reveal escalonado lento (la última tarda ~2,76s en aparecer). Datos: `INCLUDED_FEATURES` en `todo-incluido/data.ts` (:10-56). Deps: `motion/react`, lucide.
8. **ModulosOpcionales** — client. 4 módulos activos con precio + divisor + 4 coming-soon en grid `lg:grid-cols-5` (**queda una celda vacía**: había un 5º módulo, el `sortOrder` salta de 11 a 13). Datos: **`src/lib/data/premium-modules.ts`** (única fuente de precios de módulos) vía `getActiveModules()`/`getComingSoonModules()`; bullets de venta hardcodeados aparte en `ModuloActiveCard.tsx:53-74`. Motivo visual: 11 símbolos `+` flotantes.
9. **PortalDemoCTA** — client. Una tarjeta grande centrada (glass más pesado del home: `backdrop-blur-xl` + 2 botones con `backdropFilter` inline), eyebrow/H2/párrafo/2 CTAs/3 trust signals. Datos inline; `NEXT_PUBLIC_WHATSAPP_NUMBER` con fallback `mailto:`.
10. **WhyDevelOP** — client. 3 tabs con autoplay de 17s (`AUTO_ADVANCE_MS`, :140): "La Anti-Agencia" / "Ecosistema Rentable" / "La Ventaja IA", cada una con featured card + 4 secundarias, 26 sub-componentes de visuales animados (comparador 76 vs 15 días, contador +850 leads, dashboards fake). Datos: `TABBED_DIMENSIONS` inline (:210-334). Deps: `motion/react`, 23 iconos lucide, `useThemeSection('dark')`, spotlight de cursor con rAF. `pathLength` en la curva ROI (:1008-1018).
11. **Footer** — client, **100% estilos inline (cero className)**. Firma de marca: SVG del logo dibujado con `pathLength` 2.7s (:176-187, patrón vetado en lessons learned); contenido recién a los ~2,45s. Form de contacto propio que postea a `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL` (:81-88) **sin chequear `response.ok`** (un 500 del webhook igual muestra "¡Consulta enviada!") y con catch que abre WhatsApp sin confirmar. No usa `useThemeSection`. No es un `<footer>` semántico: es `<section>` sin id.

### A3 · Volcado del copy del home (literal)

Los textos van tal cual el código, con sus errores de tilde/encoding. Fuente por línea citada en los casos auditables.

**Chrome — DynamicDock (desktop)** (`layout/DynamicDock.tsx:34-41`): items `Inicio` · `Desarrollo Web` · `Chatbot` · `Desarrollo de Software` · `Automatizaciones` · `Contacto` · wordmark `develOP` · CTA `Acceder` (con flecha `→`).

**Chrome — Menú mobile** (`layout/Navbar.tsx`): items `Inicio` `Nosotros` `Portfolio` `Servicios` `Características` `Contacto` · desplegable servicios con **precio visible**: `Sitio Web`/`Presencia profesional`/`$800` · `Agente IA`/`Atención 24/7`/`$300` · `Software`/`Sistema a medida`/`$1.500` · `Automatización`/`Tareas automáticas`/`$200` (Navbar.tsx:34-39) · `Acceder` · pie `Tucumán, Argentina`. En landings los items pasan a `Inicio`/`Proceso`/`FAQ`/`Contacto`.

**Intro (lockup del preloader)** (`ui/IntroLockupText.tsx:24-25`): `develOP` / `Construimos lo que imaginas` (se ve en uppercase).

**01 · Hero** (`layout/Hero.tsx`)
- Badge (:671): `✦ AGENCIA DIGITAL — TUCUMÁN, ARGENTINA`
- H1 (:683): `Tu negocio abierto` + typewriter (:20-23): `las 24 horas` / `sin perder clientes` / `mientras dormís` / `en piloto automático`
- Párrafo (:719-721): `Hacemos que tu negocio venda, atienda y crezca solo. Sitios web, automatizaciones e inteligencia artificial para empresas de cualquier rubro.`
- CTAs (:732,:735): `Quiero una demo gratis` · `Ver nuestros trabajos` (uppercase visual)
- Microcopy (:746): `✦ Primera consulta sin costo — respondemos en menos de 24hs`

**02 · About** (`sections/home/About.tsx`)
- Logotipo: `SOMOS` / `develOP`
- Manifiesto: `No somos una agencia más.` / `Somos el equipo técnico que tu empresa necesitaba.` · `Combinamos desarrollo web, inteligencia artificial y automatizaciones para que tu negocio crezca sin depender de vos todo el tiempo.`
- Badge ubicación (desktop, :279-281): `Tucumán, Argentina - trabajamos con clientes de todo el país` · **mobile (:294, corrupto literal): `TucumÃ¡n, Argentina - trabajamos con clientes de todo el paÃ­s`**
- Equipo (:26-40): `Franco` / `Co-Founder & Lead Developer` / `Desarrollo web, IA y arquitectura de sistemas. Convierto ideas de negocio en productos digitales que funcionan solos.` · `Valentino` / `Full Stack & Automatizaciones` / `Backend, bases de datos y flujos de automatización. Hacemos que los sistemas trabajen solos.` (voz mezclada: 1ª singular vs plural)

**03 · Portfolio** (`sections/home/Portfolio.tsx`)
- Eyebrow: `develOP — PORTAFOLIO` · H2: `NUESTROS TRABAJOS` · chip `CLIENTES REALES`
- Caso real (:27-40): badge `CASO REAL ✓` · `2026` · `AUTOMOTIVE — TUCUMÁN` · `Concesionaria San Miguel` · `Sitio web corporativo con catálogo de vehículos 0km y usados, formulario de consultas inteligente y panel de administración de leads para el equipo de ventas.` · watermark `MIGUEL`
- Separador (:372-379): `— DEMOS Y CONCEPTOS —` / `Propuestas desarrolladas para mostrar capacidades en diferentes rubros`
- H2: `DEMOS POR RUBRO` · eyebrow `CAPACIDADES develOP` · chips `DEMO CONCEPTS`/`DEMO`
- Demos (:44-98): `SALUD`/`Clínica Médica`/`Turnos online + recordatorios WhatsApp + panel del staff.` · `FITNESS`/`Gimnasio`/`Membresías, clases y bot de consultas 24/7.` · `GASTRONOMÍA`/`Restaurante`/`Menú QR, reservas y reseñas automáticas en Google.` · `REAL ESTATE`/`Inmobiliaria`/`Portal de propiedades con CRM y seguimiento de leads.` · `PRODUCTO PROPIO`/`Portal SaaS develOP`/`Dashboard para clientes con métricas, proyectos y chat.` (badge `PROPIO`)
- Disclaimer (:386-387): `Los demos son propuestas conceptuales desarrolladas por el equipo develOP para ilustrar capacidades. No representan clientes reales.`

**04 · InfiniteReviews** — solo palabras del marquee (uppercase, :41-56): `RESULTADOS · PRECISIÓN · ESCALA · INGENIERÍA · CREATIVIDAD · INNOVACIÓN · ARQUITECTURA · PERFORMANCE`, intercaladas con iconos SVG de React/TypeScript/Next.js/Node.js/Tailwind/PostgreSQL. Sin testimonios, sin nombres.

**05 · OurServices** (`sections/home/OurServices.tsx` — copy visible; el detalle completo de las 16 simulaciones está en el output del extractor, líneas citadas)
- Header (:9734-9777): badge `EL ECOSISTEMA DEVELOP` · H2 `Cuatro soluciones.` / `Un solo objetivo.` · `Todo lo que tu negocio necesita para vender más, operar mejor y crecer sin contratar más gente.`
- Chips clicables con precio (:149-154, :9851): `Sitio Web $800` · `Agente IA $300` · `Software $1.500` · `Automatizaciones $200`
- **Servicio 1 — SITIOS & LANDINGS** (:64-81, cyan): H3 `Tu vitrina / abierta las / 24 horas.` · `Diseñamos la presencia digital que pone tu negocio en Google, captura consultas mientras dormís y convierte visitas en clientes reales.` · outcomes `Más autoridad en Google` / `Carga impecable en mobile` / `Captación 24/7` · métrica `+340% consultas promedio` · **`DESDE $800 USD` (:70) · `15 dias` (:71)** · sectores `Concesionarias·Clínicas·Gimnasios·Restaurantes` · CTA `Explorar sitios web`. Tabs demo: `SEO Local`/`Analytics`/`Leads`/`Google Maps` — sims con `Clínica odontológica en Tucumán`, `4.9 · 47 reseñas`, KPIs `1.842 visitas`, timeline de lead `Carlos Mendoza`, mapa de Tucumán `7/9 zonas top 3`.
- **Servicio 2 — INTELIGENCIA ARTIFICIAL** (:82-99, verde): H3 `Un comercial / que trabaja / sin pausas.` · `Un agente de IA responde consultas, califica leads y agenda reuniones por WhatsApp. A las 3AM, en feriados, siempre disponible.` · outcomes `Atención inmediata` / `Mejor calidad de lead` / `Agenda operando sola` · métrica `94% respuesta automática` · **`DESDE $300 USD` (:88) · `7 dias` (:89)** · CTA `Explorar IA aplicada`. Tabs: `Chat IA`/`Leads`/`Agenda`/`Métricas` — chat completo de la Hilux (`• AT Full: $47.500 USD / • MT SR: $43.200 USD`, :3098), scoring de 5 leads (94/61/22/82/48), claim **`8.000× más rápido que un humano`** (:4854).
- **Servicio 3 — AUTOMATIZACIÓN** (:100-117, ámbar — se renderiza CUARTO): H3 `Tu operación, / en piloto / automático.` · `Conectamos tus herramientas y automatizamos lo repetitivo. Reportes, seguimientos y notificaciones corriendo solos mientras vos te ocupás de lo importante.` · outcomes `Menos trabajo manual` / `Follow-up automático` / `Reportes al instante` · métrica `23hs por semana ahorradas` · **`DESDE $200 USD` (:106) · `5 dias` (:107)** · CTA `Explorar automatizaciones`. Tabs: `Flujo`/`Follow-up`/`Reportes`/`Sync Apps` — reporte con `Ventas del mes $47.200` (:5572), `Leads recuperados... 68%`.
- **Servicio 4 — SOFTWARE A MEDIDA** (:118-135, violeta — se renderiza TERCERO): H3 `Tu empresa / en una sola / pantalla.` · `El sistema exacto para cómo trabaja tu negocio. Sin planillas, sin depender de nadie. Stock, ventas, clientes y equipo — todo centralizado.` · outcomes `operación centralizada` (sic minúscula) / `Reportes directivos` / `Control total del dato` · métrica `0 licencias mensuales` · **`DESDE $1.500 USD` (:124) · `entrega por etapas` (:125)** · CTA `Explorar software a medida`. Tabs: `CRM`/`Dashboard`/`Stock`/`Equipo` — pipeline con 18 deals con montos, `REVENUE $47.200`, `Junio 2025 · En tiempo real` (:6831 — fecha que envejece).
- CTA final (`id="servicios-siguiente-paso"`, :9186-9432, **sin tildes sistemático, sic**): `Cierre de diagnostico` · `Converti esta lectura en una decision clara.` · `Si tu negocio necesita verse mejor, responder mas rapido, ahorrar horas o centralizar la operacion, el proximo paso es elegir el frente con mayor impacto y construirlo con foco comercial desde el dia uno.` · `4 areas`/`1 plan`/`0 relleno` · `Elegi por donde empezar` · filas `SITIO WEB`/`AGENTE IA`/`SOFTWARE`/`AUTOMATIZACIONES` con la métrica de cada uno + `Ver ->`.

**06 · PortalDemo** (`sections/portal-demo/`)
- Header (`PortalDemoHeader.tsx:17-40`): eyebrow `Así funciona tu negocio con develOP` · H2 `Un lunes a la mañana, / abrís tu panel develOP.` · `No es un dashboard más. Es un copiloto que te dice qué pasó, qué necesita atención y qué decisión tomar. En segundos.`
- Escena 8:30 (`data.ts:16-31`): badge `8:30 AM — Apenas llegás al trabajo` · `¿Cómo arrancó la semana mi negocio?` · `Tu Health Score. Un solo número del 0 al 100 que te dice si la semana viene bien, normal o necesita atención. Sin Excel. Sin contadores. Sin reuniones de 30 minutos para entender qué pasa.` · `Hoy 78 — semana normal. Cerrás el panel tranquilo y arrancás el día.` · Resultado: `Ahorrás 15 minutos cada mañana entendiendo el estado del negocio.`
- Escena 9:00 (`data.ts:32-47`): `9:00 AM — Ya tomaste el café` · `¿Qué necesita mi atención AHORA y qué puede esperar?` · `Tu Atención Hoy. develOP filtró los 14 mails, 8 mensajes y 3 alertas que te llegaron y te muestra solo lo crítico: "1 entrega del proyecto espera tu aprobación" y "2 reseñas de Google necesitan respuesta en 48h".` · `Aprobás la entrega con 1 click. Las reseñas las dejás para después de almuerzo.` · `Tu día deja de manejarte. Vos manejás tu día.`
- Escena 9:30 (`data.ts:48-63`): `9:30 AM — Antes de la primera reunión` · `¿Cuánto generamos esta semana? ¿Cómo venimos vs el mes pasado?` · `Resultados de la Semana. 47 leads nuevos (+12% vs semana pasada). 8 ventas cerradas. $340K facturados. Comparativa contra mes anterior. Y el resumen ejecutivo lo escribió la IA en 2 oraciones.` · `Lo copiás y se lo mandás a tu socio por WhatsApp. Conversación de negocio en 30 segundos.` · `Decisiones basadas en datos, no en sensaciones.`
- Mockups hardcodeados (`StoryMomentCard.tsx`): `develOP live` · `Health Score 78/100` (`Salud digital 82`/`Comercial 74`/`Operaciones 79` · `Semana normal. Sin alertas criticas.` sic) · `Tu Atención Hoy` (`14 mails · 8 mensajes · 3 alertas` · `Critico/Entrega del proyecto espera aprobacion` · `Responder/2 resenas de Google en 48h` sic · `Puede esperar/Resumen semanal listo para revisar`) · `Resultados de la Semana` (`Leads 47 +12%` · `Ventas 8 +3` · `Facturado $340K +18%` · `La IA detecto una mejora de conversion...` sic)
- CTA (:268-271): `Quiero saber más sobre el dashboard ->` → `/contact`

**07 · TodoIncluido** (`sections/todo-incluido/`)
- Header (:289-297): eyebrow `TODO ESTO VIENE INCLUIDO EN TU PLAN` · H2 `5 herramientas premium, sin extras.` · `Cuando contratás develOP, te llevás todo el portal. No es un upsell. No es "plan básico vs pro". Es lo que viene cuando trabajás con nosotros.`
- Features (`data.ts:10-56`): `Resultados en tiempo real` (`Tráfico, posicionamiento SEO, reseñas y velocidad del sitio. Todo conectado a las APIs reales de Google. No screenshots de Excel — datos vivos.` · `GA4 + Search Console + PageSpeed conectados`) · `Tu proyecto, transparente` (`Cada tarea, cada hito, cada entrega. Aprobás cosas con un click sin tener que pedir un Zoom. La trazabilidad que tu negocio merece.` · `Cero Excels compartidos. Cero "¿en qué andamos?"`) · `Comunicación con SLA real` (`Respondemos en menos de 4 horas en horario laboral...` · `Respuesta < 4h · Lun-Vie 9-19hs ART`) · `Bóveda Digital encriptada` (`...encryption AES-256. Nunca más vas a perder un acceso ni depender de "Juan que tenía la clave".` · `AES-256 + log de accesos auditable`) · `Resumen ejecutivo IA` (`Cada semana, una IA analiza tus datos y te escribe en 2 oraciones qué pasó...` · **`Powered by Claude — el mejor LLM del mundo en español`**)

**08 · ModulosOpcionales** (`sections/modulos-opcionales/` + `lib/data/premium-modules.ts`)
- Header (:442-450): eyebrow `Y CUANDO ESTÉS LISTO` · H2 `Sumás módulos según lo que necesite tu negocio.` · `No vendemos suites infladas. Empezás con lo esencial y escalás cuando los datos te digan que es momento. Cada módulo es opcional, mensual y cancelable.` · `DISPONIBLES AHORA` · **`PRÓXIMAMENTE Q3 2026`** (:487 — fecha comprometida)
- Activos con precio visible (`premium-modules.ts:31/45/59/74`): `Motor de Reseñas Automático` **$60 USD/mes** (`Generá reseñas positivas en Google y potenciá tu reputación sin seguimiento manual.` + 3 bullets) · `Email Marketing Pro` **$80** · `Agenda Inteligente 24/7` **$80** · `Tienda Online Conectada` **$150**
- Coming-soon sin precio visible (precios en catálogo :91/:105/:120/:134): `WhatsApp Autopilot` (150) · `Facturación AFIP Automática` (120) · `Cobranzas Automatizadas` (90) · `Reactivación de Clientes` (90)

**09 · PortalDemoCTA** (`sections/portal-demo-cta/PortalDemoCTA.tsx`)
- Eyebrow (:295): `VAMOS A CONOCERNOS` · H2 (:302-306): `Tu negocio puede operar / como uno premium hoy mismo.` · `Te mostramos el portal en una llamada de 30 minutos sin compromiso. Si lo querés, arrancamos esa misma semana.`
- CTAs: `Coordinemos una llamada por WhatsApp` (prefill :6-7: `¡Hola, develOP! Vi su landing y me interesa el portal develOP para mi negocio. ¿Podemos coordinar una llamada de 30 minutos?`) · `Quiero ver el portal solo` → `/login`
- Trust (:9): `Sin permanencia` · `Sin setup fee` · `Cancelás cuando quieras`

**10 · WhyDevelOP** (`sections/home/WhyDevelOP.tsx` — ⚠ `qué`/`cuándo` mal tildados en 10 líneas del data, sic en todas)
- Pill `Why develOP` · Tabs: `La Anti-Agencia` / `Ecosistema Rentable` / `La Ventaja IA`
- Tab 1: H2 `Software de élite. Sin la burocracia de las agencias.` · `Velocidad real, decisiones directas y un delivery qué evita la fricción comercial de una agencia tradicional.` · featured `LA ANTI-AGENCIA`/`Velocidad operativa`/`Ejecución sin fricción.`/`develOP opera como un equipo de ingeniería puro, eliminando burocracia para entregar software de élite en tiempo récord.` · visual comparador: `AGENCIAS TRADICIONALES`/`MESES DE BUROCRACIA`/**`76 DÍAS`** vs `DIRECTO AL OBJETIVO`/**`15 DÍAS`** + chips (`Procesos Rígidos`/`Alta Dependencia`/`Costos Ocultos` vs `Iteración Rápida`/`Sin intermediarios`/`Despliegue Continuo`) · cards: `Velocidad Absoluta` (`Sistemas operativos y webs listas en semanas, no en semestres.` · `Entrega real 100% live`) / `Cero Costos Ocultos` (`Precios cerrados desde el día 1...`) / `Soporte Directo` (`Hablas directamente con los ingenieros (nosotros). Cero intermediarios.`) / `Propiedad Total` (`El código, el diseño y los datos son 100% tuyos...`)
- Tab 2: H2 `Tu negocio no necesita una web, necesita un ecosistema.` · featured `ECOSISTEMA RENTABLE`/`ROI estructural`/`Arquitectura orientada a conversión.` · visual: satélites `WhatsApp AI`/`Ads & SEO`/`CRM Sync` + contador **`+850 LEADS GENERADOS`** · cards: `Retorno de Inversión` / `Operación 24/7` / `Escalabilidad Técnica` / `Control Total`
- Tab 3: H2 `Mientras tu competencia usa Excel, nosotros implementamos IA.` · featured `LA VENTAJA IA`/`Tecnología injusta`/`Procesamiento de datos en tiempo real.` · visual: inputs `Mensaje 3:14 AM`/`Dato Suelto`/`Lead Frío` → outputs `✓ Cita Agendada`/`✓ CRM Actualizado`/`✓ Lead Calificado` · cards: `Agentes Inteligentes` / `Reducción de Tareas` / `Decisiones con Data` (tickers `42%/58%/71%` · `18m/12m/7m` · `1.4x/1.9x/2.3x`) / `Vanguardia Tech`

**11 · Footer** (`sections/home/Footer.tsx`)
- H2: `¿No sabés por dónde` / `empezar?` · `Contanos tu negocio en 2 minutos. Te decimos exactamente qué necesitás y cuánto te costaría. Sin compromiso. Sin tecnicismos.` · callout `El primer paso es gratis.`
- Cards: `WhatsApp directo`/`Respondemos en menos de 2hs en horario comercial`/`Abrir chat →` (prefill :9-11: `Hola! Vi tu página y me gustaría saber qué necesita mi negocio para crecer. ¿Pueden ayudarme?`) · `Completar formulario`/`Contanos tu negocio y te preparamos una propuesta`/`Ver formulario →`
- Form: `Nombre`/`Tu nombre` · `WhatsApp`/`+54 381 000-0000` · `Rubro de tu negocio`/`Ej: Clínica, Restaurante, Gimnasio...` · `¿Qué necesitás?`/`Contanos brevemente qué querés lograr con tu negocio...` · `Volver` · `ENVIAR CONSULTA →`/`ENVIANDO...` · `Te respondemos en menos de 2hs · Sin compromiso` · éxito `✓ ¡Consulta enviada!`/`Te contactamos en menos de 2hs.` (sin rama de error visible)
- Trust row (:49-54): `Tucumán, Argentina` · `Respuesta Inmediata` · `Consulta gratuita` · `2+ años en el mercado`
- Redes (:56-61): `LinkedIn` linkedin.com/company/develop-agency · `Instagram` instagram.com/develop.agency · `Twitter/X` twitter.com/develop_agency · `Email` hola@develop.com.ar · Copyright: `2026` (hardcodeado) + logo + `Todos los derechos reservados.`

**Claims con cifra del home, para el chat de copy** (todos sin fuente): `respondemos en menos de 24hs` (Hero:746) vs `menos de 2hs` (Footer ×3) vs `Respuesta Inmediata` (Footer:52) vs `Respuesta < 4h` (todo-incluido) — **cuatro promesas de respuesta distintas en la misma página**. `+340%` / `94%` / `23hs` / `8.000×` / `76 vs 15 días` / `+850 leads` / `2+ años` / `47 reseñas` / `78/100`. Precios: $800/$300/$200/$1.500 (OurServices + Navbar mobile) + módulos $60-$150/mes.

### A4 · Inventario de glassmorphism en el home + chrome

Conteo exacto por archivo (clases Tailwind + `backdropFilter` inline):

| Archivo | `backdrop-blur` (clase) | `backdropFilter` (inline) | `bg-white/` | `bg-black/` | `border-white/` | Contexto |
|---|---|---|---|---|---|---|
| Hero.tsx | 0 | 0 | 0 | 1 | 0 | sombra elíptica mobile; el Hero NO usa glass |
| About.tsx | 3 | 0 | 2 | 1 | 7 | tarjetas de equipo + bordes de manifiesto |
| Portfolio.tsx | 0 | 0 | 6 | 6 | 6 | chips/overlays sin blur real |
| InfiniteReviews.tsx | 0 | 0 | 0 | 0 | 0 | estilos inline puros, cero glass |
| **OurServices.tsx** | 0 | **64** | 0 | 0 | 0 | todo inline: `blur(20px)` ×57 en las 16 sims; 412 `rgba(255,255,255,…)` |
| portal-demo/* | 0 | 1 | 12 | 0 | 16 | lámina ScreenshotCard glass + "glass plano" sin blur |
| todo-incluido/* | 0 | 2 | 0 | 0 | 1 | card-shell ×5 + chip de icono |
| modulos-opcionales/* | 0 | 2 (8 nodos en runtime) | 1 | 0 | 5 | shells de las 8 cards |
| PortalDemoCTA.tsx | 1 | 2 | 3 | 0 | 4 | tarjeta + 2 botones — 3 capas de blur apiladas |
| WhyDevelOP.tsx | 15 | 1 | 10 | 4 | 19 | 5 tarjetas glass por tab + visuales |
| Footer.tsx | 0 | 1 | 0 | 0 | 0 | form `blur(20px) saturate(180%)` inline + 90 rgba blancos |
| Navbar.tsx (mobile) | 3 | 0 | 2 | 1 | 5 | overlay + botón + sheet del menú |
| DynamicDock.tsx | 0 | 1 | 1 | 0 | 1 | `blur(48px) saturate(180%)` del dock + BrandLogo |
| MagneticCta.tsx (CTAs del Hero) | 1 | 0 | 0 | 0 | 0 | `backdrop-blur-3xl` del botón |
| Widget chat (`chat/ChatWindow.tsx`) | 1 | 1 | 0 | 0 | 0 | ventana del companion |
| Toaster (`app/layout.tsx:134`) | 1 | 0 | 0 | 0 | 0 | clase del toast |
| Shutter / Preloader | 0 | 0 | 0 | 0 | 0 | limpios |

**Total home+chrome: ~24 clases `backdrop-blur` + ~75 `backdropFilter` inline.** El grueso del glass del home NO está en clases (que es lo que contaba el B0) sino **inline dentro de OurServices (64)** — cualquier barrida por grep de clases lo subestima. Sumando landings, el lado público de main tiene 99 ocurrencias de `backdrop-blur` en clases (portal: 191; total src: 290).

### A5 · Sistema de estilos que sobrevivió

**El sistema `ds-*` del rediseño está COMPLETO en main, pero es una isla huérfana:**

- **`globals.css` (693 líneas)** conserva el `@theme static` íntegro del rediseño: base dark (`--color-ds-void #0D0B09`...), **tema crema completo** (`--color-ds-light-bg #F2EEE6`, `--color-ds-light-surface #EAE5DA`, `--color-ds-light-ink #1A1713`...), los 4 acentos de servicio (`ds-accent-web/ia/automation/software` :60-63), radios (superficies 0px / controles 9px), motion (`--animate-ds-reveal`, `--animate-ds-rise`), escala tipográfica en clamp (display-xl/lg, subhead, lead, body, eyebrow, data, control), layout (`--container-ds-page 1240px`, `--spacing-ds-section`, `--spacing-ds-nav`), capa semántica invertible (`ds-canvas/panel/fg/fg-muted/rule` + scopes `[data-ds-theme]`), `--shadow-ds-control` y `--font-ds-sans/mono`. Convive con el `:root` legacy (`--color-void #030303`, scopes `[data-theme]`) y las clases `admin-*`.
- **`src/components/design-system/`** — 13 archivos: `SectionShell, Eyebrow, ChapterLabel, DisplayHeading, Subhead, Lead, CtaButton, Surface, DataStat, MonoLabel, RuleDivider, accent.ts, index.ts`.
- **Quién los usa en main:** SOLO (a) `/styleguide` (page + 9 `_components`), y (b) las **secciones huérfanas del rediseño que sobrevivieron a la restauración**: `sections/nosotros/` (Nosotros.tsx + data.ts), `sections/servicios/` (Servicios.tsx + data.ts), `sections/cierre/` (Cierre.tsx + ContactoCta.tsx) — ninguna importada por página alguna. **El home actual no usa NINGÚN componente del design-system.**
- **Excepción importante:** `src/components/ui/Button.tsx` (compartido, 14 consumidores en portal + auth) ganó variantes `ds-primary`/`ds-secondary` y tamaños `ds`/`ds-compact` que leen `bg-ds-fg`, `text-ds-canvas` y `var(--shadow-ds-control)` — **los tokens `ds-*` de globals.css son carga viva del portal**, no se pueden borrar a ciegas.
- Otros sobrevivientes del rediseño huérfanos en main: `layout/HeroArtifactLayer.tsx` (nadie lo importa — el Hero clásico monta su canvas propio) y `layout/HeroCanvas.tsx` (solo lo montaría HeroArtifactLayer; es quien referencia el HDRI self-hosteado). `useThemeSectionOptional` en el hook de tema.
- **Token fantasma:** `--color-ds-control-edge` usado en `styleguide/_components/PaletteBlock.tsx:73-74` y `ProductPlate.tsx:18` — **no definido en globals.css** (existe `ds-control-stroke`, no `edge`). En main el daño queda confinado al styleguide (el `PanelPlate` del otro árbol no existe acá).
- **Fuentes** (`app/layout.tsx:2-13,74`): solo **Geist + Geist Mono** vía `next/font/google`, variables en el `<html>` (el comentario :65-71 documenta el bug de scope que obligó a eso).
- Conteo de adopción: `text-ds-*` 127 usos · `ds-fg` 91 · `ds-rule` 28 — **casi todos dentro de la isla** (design-system + styleguide + secciones huérfanas); fuera de ella solo `ui/Button.tsx`. La paleta de facto del sitio vivo sigue siendo zinc/cyan/white-alpha.

### A6 · Dock, Navbar y rutas

**Desktop = `DynamicDock`** (`layout/DynamicDock.tsx`, 628 líneas — existe en main, a diferencia del árbol del B0). Fixed bottom-8, `hidden md:block`, z-9990. `NAV_ITEMS` (:34-41):

| Label | Ruta | Icono | Color |
|---|---|---|---|
| `Inicio` | `/#inicio` | House | — |
| `Desarrollo Web` | `/web-development` | Network | `#06b6d4` |
| `Chatbot` | `/ai-implementations` | Bot | `#10b981` |
| `Desarrollo de Software` | `/software-development` | Code2 | `#8b5cf6` |
| `Automatizaciones` | `/process-automation` | Workflow | `#f59e0b` |
| `Contacto` | `/contact` | Mail | — |

`ROUTE_TO_LABEL` (:43-49) mapea las 5 rutas no-home. Glass `blur(48px) saturate(180%)` inline (:546), fondo animado por `getLightLevel()` (:56-62 — degenerado: devuelve `light` solo bajo 0.8vh y `dark` en las otras 3 ramas). Expande/colapsa por dirección de scroll + hover; pill activa con `layoutId`; CTA `Acceder` → `triggerTransition('/login')`. **Dos animaciones infinitas** (pulso del BrandLogo 2.8s, shine del CTA cada 5s). Aparece con `useChromeRevealed` (espera el fin del intro).

**Mobile = sheet del `Navbar`** (`layout/Navbar.tsx`, 415 líneas; monta `<DynamicDock/>` adentro y el menú mobile aparte). Botón fijo bottom-right (Grid2x2/X) que se esconde al scrollear hacia abajo. `MAIN_NAV_ITEMS` (:25-32): `Inicio /#inicio` · `Nosotros /#nosotros` · `Portfolio /#portfolio` · `Servicios /#servicios` (expandible) · `Características /#caracteristicas` · `Contacto /contact`. `SERVICE_ITEMS` (:34-39) **con precio visible en el menú**: `$800`/`$300`/`$1.500`/`$200`. En rutas de servicio, `getNavItems()` (:43-53) cambia a `Inicio #hero` / `Proceso #proceso` / `FAQ #faq` / `Contacto`. Sección activa por IntersectionObserver (`rootMargin -30%/-40%`) + `HASH_TO_LABEL` (:55-64). Scroll-lock por `body.style.overflow` al abrir. Navegación siempre por `triggerTransition()`.

**Estado de las anclas tras la restauración:**

| Ancla | Destino | Estado |
|---|---|---|
| `/#inicio` | Hero.tsx:522 | ✅ existe |
| `/#nosotros` | About.tsx:411 y :471 | ⚠ **id DUPLICADO** (árbol mobile + desktop); `getElementById` devuelve el que está `display:none` en desktop → aterrizaje impreciso |
| `/#portfolio` | Portfolio.tsx:726 | ✅ existe |
| `/#servicios` | OurServices.tsx:9632 | ✅ existe |
| `/#caracteristicas` | WhyDevelOP.tsx:1604 | ✅ existe |
| `/#portafolio`, `/#calculadora` | — | ✅ **no hay referencias rotas**: nadie apunta a esas anclas (grep limpio) |
| `/process-automation#calculadora` | CalculadoraAutomation.tsx:958 | ✅ existe (la usa el chatbot y el hero de automation) |
| `#servicio-1..4` (chips internos de OurServices) | OurServices.tsx:8510 | ⚠ trampa: `ORDERED_SERVICE_IDS=[1,2,4,3]` → `#servicio-3` es la CUARTA fila y `#servicio-4` la tercera |
| `/web-development#proceso` · `/software-development#proceso` | — | ❌ **ROTAS**: el item `Proceso` del nav en landings apunta a `#proceso`, que solo existe en ia (`PipelineIA.tsx:1109`) y automation (`ProcesoAutomation.tsx:832`); web y software no tienen ese id |

Además, **el aterrizaje de `/#portfolio`, `/#nosotros`, `/#servicios` en carga fría está roto por diseño** y el propio código lo documenta (`SmoothScroll.tsx:48-64`): (1) las secciones destino montan por `dynamic()` con placeholder sin caja cuando el hash se resuelve (el documento crece de ~16.200px a ~21.500px al montar), y (2) el `#nosotros` duplicado. Las dos causas medidas siguen vigentes en main.

**`VALID_PATHS` del chatbot** (`modules/chatbot/server/tools/navigateToPage.ts:25-34`): `/web-development` · `/ai-implementations` · `/process-automation` · `/software-development` · `/#nosotros` · `/#portfolio` · `/process-automation#calculadora` · `/#servicios`. **Coherente con la home restaurada** — todos los destinos existen (con la salvedad del `#nosotros` duplicado). Tool restringido al bot de develOP (`TOOLS_RESTRICTED_TO_AGENCY_BOT`).

**`home-routes.ts`** (`src/lib/home-routes.ts`): gate del intro del home — `shouldRunHomeIntro()` (solo hard-load/URL directa a `/`, patrón ENTRY_PATHNAME + consumed flag, espejo de `marketing-routes.ts`) y `markHomeIntroConsumed()` (se llama al TERMINAR la secuencia, Preloader.tsx:273). Coherente y en uso.

**Árbol de rutas de `src/app`** (86 `page.tsx` · 36 `route.ts`):

| Ruta | Tipo |
|---|---|
| `/` | home clásica (11 piezas) |
| `/web-development` · `/ai-implementations` · `/software-development` · `/process-automation` · `/contact` | marketing |
| `/styleguide` | styleguide del DS huérfano (público, sin link entrante) |
| `/login` · `/forgot-password` · `/reset-password` · `/cambiar-password` · `/accept-invite` · `/bienvenida` | auth / onboarding |
| `/embed/[slug]` | chatbot embebible |
| `/(protected)/admin/*` · `/(protected)/dashboard/*` · `/(protected)/setter/*` | portales (72 páginas) |
| `/api/*` — 36 endpoints | API (chatbot `[slug]` chat/config/health/smoke, cron, admin, dashboard, motor, qa, track...) |
| `robots.ts` · `sitemap.ts` · `error/global-error/not-found` | infra |

---

## TANDA B — Motion, performance y material

### B1 · Inventario de mecanismos de motion existentes

| Pieza | Archivo | Qué hace | Frozen | Sirve para… |
|---|---|---|---|---|
| Orquestador del intro | `ui/Preloader.tsx` (326) | Secuencia estricta del intro del home: velo negro→blanco (1.4s) → lockup escrito (1.5s) → trazo del logo 2D (0.85s) → relleno (0.45s) → crossfade al 3D (0.4s) → hold de lectura (1.5s) → borrado (1.5s) → compresión/flying (0.78s) → swapping (0.24s) → done. Ramas mobile/reduced-motion propias | no (pero orquesta piezas frozen) | **Intro inmersiva: ES la maquinaria actual** |
| Máquina de fases | `context/PreloaderContext.tsx` (172) | Enum de 7 fases + MotionValues compartidos (`introProgress`, `canvasReveal`, `logoStrokeProgress`, `logoFillProgress`, `dotsReveal`, `textReveal`) + readiness gate del logo + `isAutomationEnvironment()` | **frozen** ("no romper el flujo de fases") | intro inmersiva |
| Logo 3D | `3d/HeroArtifact.tsx` | El artefacto extruido del logo | **FROZEN — no tocar** | intro inmersiva |
| Mouse-follow del logo | `layout/Hero.tsx` (`DesktopPointerSync`, `MobileInputHandler`, `HeroLogo`) | Seguimiento del puntero en toda la pantalla, sombra procedural, `EffectComposer` (canvas opaco — permitido) | dentro de Hero (no frozen) | intro inmersiva |
| Footprint compartido 2D/3D | `lib/logo-footprint.ts` | La caja del logo calculada igual para el SVG 2D y el mesh 3D → crossfades sin salto | no | intro inmersiva |
| Trazo 2D del logo | `ui/LogoStrokeOverlay.tsx` (142) | Stroke-draw del path único del logo, calibrado al footprint 3D | no | intro inmersiva |
| Lockup del intro | `ui/IntroLockupText.tsx` (256) | "develOP + slogan" con escritura/borrado wipe; timings exportados (`WRITE_MS 1500`, `READ_HOLD_MS 1500`, `ERASE_MS 1500`, `TEXT_LEAD_MS 0`) | no | intro inmersiva |
| Intro de marketing (Route B) | `ui/MarketingIntro.tsx` + `ui/BrandedIntroCanvas.tsx` + `3d/BrandedLogoWhite.tsx` | Overlay branded para landings: trazo+relleno → crossfade 2D→3D → mouse-follow ~1s → toldo sube. `BrandedLogoWhite` reconstruye la geometría del logo SIN tocar el frozen | no | intro inmersiva (variante corta ya resuelta) |
| Shutter | `layout/Shutter.tsx` + `context/TransitionContext.tsx` | Velo de transición entre páginas (`triggerTransition()`) | **TransitionContext frozen** | transiciones de ruta |
| `MagneticCta` | `ui/buttons/MagneticCta.tsx` (207) | Botón magnético (spring x/y), borde cónico animado, ripple; `motion/react` | no | CTAs |
| `ChargeTraceButton` | `ui/buttons/ChargeTraceButton.tsx` (124) | Botón con trazo de carga (usado en landings) | no | CTAs |
| `TypewriterText` | `ui/TypewriterText.tsx` (84) | Cicla palabras escribiendo/borrando (H1 del Hero) | no | apariciones |
| `KineticText` | `ui/KineticText.tsx` (43) | Skew del texto según velocidad de scroll (`useVelocity`+`useSpring`) — usado en About | no | apariciones ligadas a scroll |
| `HyperText` | `ui/HyperText.tsx` (149) | Scramble de caracteres (landing web) | no | apariciones |
| Scroll horizontal pinneado | `sections/home/About.tsx` | Contenedor 400vh + sticky + track trasladado en X por `scrollYProgress`; panel de materialización SVG (`feTurbulence`+`feDisplacementMap`) | no | estructura de capítulos / apariciones |
| Marquee con interpolación de fondo | `sections/home/InfiniteReviews.tsx` | 4 capas tipográficas en perspectiva, rAF manual con boost por velocidad de scroll, y **el único mecanismo existente de fondo interpolado por progreso de scroll** (`rgb(238→146)` en :293-298) | no | **transición cromática ligada a scroll: es el precedente directo** |
| Wash por sección activa | `sections/home/OurServices.tsx:8719-8729` + riel :8818 | IntersectionObserver por fila → `activeAccent` → radial animado 1.2s + riel de progreso con `useSpring` | no | **wash de color por servicio: ya existe, sutil (alpha ~5%)** |
| Cambio de tema animado | `layout/HomeWrapper.tsx` + `hooks/useThemeObserver.tsx` | `motion.main` anima bg/color al cambiar el tema que empujan las secciones (`useThemeSection`) | no | transición cromática (mecanismo alternativo, por tema) |
| Tabs con autoplay | `WhyDevelOP.tsx` (17s) y las 16 sims de OurServices (`useServiceDemoCycle`) | Ciclos con progreso, pausa por viewport/reduced-motion | no | carruseles |
| Carrusel de tarjetas | `Portfolio.tsx` (demos, navegación circular) | Desktop 3 visibles, mobile paginado | no | carruseles |
| `AnimatedCounter` / `FadeIn` | `components/dashboard/` | **Solo portal** — no están en el sitio público | no | — |
| `StaggerWrapper` | — | **No existe** en el repo (la primitiva de stagger del portal es `StaggerReveal` en dashboard) | — | — |

### B2 · El scroll-lock del intro — mapa exacto

Cuatro piezas, un dueño:

1. **`layout/EarlyScrollLock.tsx`** (40): script inyectado al stream SSR en el `<head>` vía `useServerInsertedHTML` — pone `documentElement.style.overflow='hidden'` ANTES del primer paint, **solo si `location.pathname==='/'` y `navigator.webdriver!==true`** (:26-27). Su docblock prohíbe migrarlo a `next/script beforeInteractive`.
2. **`layout/Hero.tsx:483-495` — el DUEÑO del lock**: `html.style.overflow` + `body.style.overflow` a `'hidden'` + `lenis?.stop()` en TODA fase ≠ `'done'`; libera (`overflow=''` + `lenis.start()`) **solo cuando `phase === 'done'`**. Cleanup al desmontar (:498-503). Red de seguridad: a los **6s** fuerza `setPhase('done')` (:506-512).
3. **`ui/Preloader.tsx`** (el orquestador que decide cuándo llega `done`): constantes que gobiernan la duración — `LOGO_READY_TIMEOUT_MS = 2500` (:27, tope del readiness gate del SVG), `VEIL_FADE_SECONDS = 1.4`, `STEP_DELAY_SECONDS = 0.15`, `HOME_STROKE_SECONDS = 0.85`, `HOME_FILL_SECONDS = 0.45`, `HOME_CROSSFADE_SECONDS = 0.4`, `COMPRESS_SECONDS = 0.78`, más los del lockup (`IntroLockupText.tsx:19-22`: `WRITE_MS/READ_HOLD_MS/ERASE_MS = 1500` c/u). Suma awaited desktop peor caso: **2.5 + 1.4 + 0.15 + (0.85+0.45+0.4+1.5+1.5) + 0.78 + 0.24 ≈ 9.77s** — la cifra ~9.8s de la bitácora sale de acá. `markHomeIntroConsumed()` al final (:273) evita re-disparo en client-nav.
4. **`context/PreloaderContext.tsx`**: bajo automation salta directo a `done` (:124-128) — por eso visual-qa nunca ve el lock.

Aguas abajo del mismo `phase`: `layout/useChromeRevealed.ts` gatea dock + widget (`phase === 'done'` en home; evento `chrome:revealed` en marketing; inmediato en el resto).

### B3 · Lenis y comportamiento de scroll

`layout/SmoothScroll.tsx` (120): `duration: 1.5` · easing exponencial custom `1.001 - 2^(-10t)` · `orientation/gestureOrientation: 'vertical'` · `smoothWheel: true` · **`syncTouch: false`** · `wheelMultiplier/touchMultiplier: 1` · `overscroll: false`. Apagado en **portales** (`/admin`, `/dashboard` → scroll nativo, :30-34) y en **dispositivos touch** (`(hover: none), (pointer: coarse)`, :71-76). Global: `history.scrollRestoration = 'manual'` (:26); en `/` sin hash fuerza scroll a 0 (window + `lenis.scrollTo(0, {immediate})`). Instancia expuesta por `LenisContext`/`useLenis()` — la consumen el Hero (stop/start del lock) y OurServices (`scrollToService`). El comentario :48-64 documenta que el aterrizaje de hash en carga fría sigue roto por `dynamic()` + `#nosotros` duplicado (ver A6). Nota para transición cromática por scroll: el rAF propio de Lenis convive hoy con los rAF manuales de InfiniteReviews y de las sims de OurServices — ya hay 3+ loops simultáneos.

### B4 · Inventario de material visual disponible

`public/` — 26 archivos, ~36 MB. Cruce referencia↔disco sobre MAIN (difiere del B0 en dos puntos importantes: los mapas y 2 videos SÍ están en uso acá):

**Vivo y usado:**

| Asset | Peso | Usado por |
|---|---|---|
| `logodevelOP.svg` | 0,6 KB | Navbar, DynamicDock, Hero (SVGLoader del 3D), WhyDevelOP, Footer — el asset central de marca. Duplicado en la raíz del repo |
| `images/showcase/*.svg` (6) | 1-3 KB c/u | **Portfolio del home clásico (los 6)** + `case-default.svg` como fallback en `WebTemplatesImmersive.tsx:86`. Son placeholders genéricos, no capturas reales |
| `maps/argentina.svg` (134 KB) · `maps/tucuman-googlemaps.png` (58 KB) | | **OurServices** (SimAnalytics :1436, SimMaps :1982) — el SVG de 137 KB se renderiza con filtro pesado `invert+grayscale+drop-shadow`; 28 pins posicionados a mano sobre el PNG de Tucumán |
| `video/Male_business_owner…mp4` (7,3 MB) · `video/Woman_engrossed…mp4` (5,9 MB) | 13,2 MB | `ui/VideoCard.tsx` → `WebDevelopmentBento` (landing web, viva). También los referencia `WebDevelopmentSensory` (muerto) |
| `logodevelOP.png` | **1,2 MB** | `login/page.tsx` (×2) y `onboarding/OnboardingWizard.tsx` — peso desproporcionado. Duplicado en raíz |
| `widget.js` (7,7 KB) · `test-widget.html` (3,4 KB) | | loader embebible del chatbot |
| `src/app/favicon.ico` | | favicon por convención — OK |

**Referenciado pero NO existe en disco:**
- **`/og-image.png`** — `app/layout.tsx:32,38` y `app/contact/layout.tsx` → **previews sociales del sitio en 404** `[REQUIERE VERIFICACIÓN HUMANA solo si el hosting lo inyecta]`
- `/landing/portal-demo/{01-health-score,02-attention-stack,03-week-results}.webp` — declarados en `portal-demo/data.ts` (`screenshotPath`); el directorio `public/landing/` no existe. Hoy no rompen porque ningún componente los consume, pero son la evidencia de que **los screenshots reales del panel nunca se produjeron** (se suplantaron con mockups DOM)
- `concesionaria-desktop.png`, `restaurante-desktop.png`, `inmobiliaria-desktop.png`, `servicios-desktop.png` — los PNG "reales" que `ShowcaseSection.tsx:9-20` (componente muerto) esperaba: nunca existieron

**Existe pero nadie usa (≈20,6 MB muertos):**
- `video/Man_sips_coffee…mp4` (10,4 MB) · `video/Muestra-pagina-ejemplo.mp4` (5,3 MB) · `videos/ia-ingenieria-aplicada-demo.mp4` (2,5 MB) · `videos/software-development-hero-intro.mp4` (0,7 MB) — carpetas `video/` y `videos/` duplicadas
- `images/backgrounds/pipeline-section-bg.png` (1,1 MB) · `footer-portal-wall.svg` (19 KB)
- `hdri/studio_small_03_1k.hdr` (1,7 MB) — **solo lo referencia `HeroCanvas.tsx`, que en main está huérfano**. El Hero clásico vivo usa `<Environment preset="studio">` (Hero.tsx:400) → **baja el HDRI de la CDN de drei en runtime**, exactamente lo que el self-hosting había resuelto
- Restos de create-next-app: `next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`

**Conclusión de producción:** para el rediseño ("el trabajo real es el protagonista") hoy NO hay ni una captura real: ni de sitios de clientes (los 6 showcase son SVG genéricos), ni del panel (los 3 webp planificados no existen), ni fotos del equipo (avatares tipográficos). Todo el material protagonista está por producirse.

### B5 · Chatbot en la landing

**Montaje** (idéntico a lo que describió el B0 — verificado en main): `app/layout.tsx:137` monta `<ChatWidgetMount/>` único; gatea por `isChromeFreeRoute()` (nunca portales ni `/styleguide`), espera `useChromeRevealed()` (aparece junto al dock), **pre-calienta la config durante el intro** (`prefetchBotConfig('develop')` → cache compartida) y monta `LogicCompanion` por `dynamic ssr:false`. Estética del widget: la ventana (`chat/ChatWindow.tsx`) usa 1 `backdrop-blur` + 1 inline — glass moderado. Avatar 100% procedural (registry de 5: `neuro` default con esfera Fibonacci, `legacy_neuro`, `monograma`, `onda`, `geometrico`; pesados por `HeavyAvatarsLazy` chunk aparte; glow con patrón `CoreHalo` sin EffectComposer). Sin assets de imagen.

**El 500 de `/api/chatbot/develop/config` — la hipótesis del B0 SIGUE EN PIE sobre main:**
- El GET de `src/app/api/chatbot/[slug]/config/route.ts` (85 líneas) sigue **sin un solo try/catch de dominio**: el único `catch` del camino es el guard de parseo de URL en `isTrustedSameOrigin` (`same-origin.ts:53-55`). `handleConfigRequest`, `validateOrigin` e `isBotServable` propagan cualquier excepción de Prisma → 500 genérico de Next.
- **Los commits CARRERAS no tocaron este camino**: commit 4 (`1e5b7fbb`) modificó `chat/route.ts` + `handleChatRequest.ts` (freeze de lambda / Sentry del 500 del CHAT); commit 2 (`59e01cc9`) tocó demo-chat y test-prompt (admin). Último commit sobre `config/`: `c19e49e9` (FIX-ORIGIN), previo a la serie. El endpoint de config quedó fuera del endurecimiento.
- Perfil de fallo más probable: el ya documentado como patrón INFRA (Neon fría / pool en arranque de lambda) en la PRIMERA pegada — consistente con un 500 intermitente que "se cura" al recargar (cache HTTP de 60s). `[REQUIERE VERIFICACIÓN HUMANA]`: confirmar la firma real en logs de Netlify/Sentry antes de tocar nada (regla INFRA.3 del repo). Sin arreglar nada acá.

---

## TANDA C — Revalidación, minería y cierre

### C1 · Revalidación por muestreo del B0

| Hallazgo B0 | Veredicto en main | Evidencia (1 línea) |
|---|---|---|
| ~77 `backdrop-blur` en 4 landings + `/contact` | **VIGENTE** (≈74 comparable; el total público de main sube a 99) | 48 en los dirs de landings + ~26 en UI/canvas/sections compartidos; los ~25 restantes hasta 99 son del home clásico y su chrome, que el árbol del B0 no tenía. Portal: 191; total src: 290 |
| Cifras y testimonios fabricados en landings | **VIGENTE** — dónde viven exactamente | Testimonios con nombre: `software/SocialProofSoftware.tsx` (Roberto Álvarez/Dra. Valeria Sosa/Matías Herrera + `38+` :492, `4+ años`) e `ia/TestimoniosIA.tsx` (María Álvarez/Carlos Pereyra/Dra. Sofía Ramos — **apagado** por `SHOW_TESTIMONIOS_SECTION = false`, `ai-implementations/page.tsx:179`, pero shipped). Cifras: `+312 diagnósticos` `software/DiagnosticoSoftware.tsx:374` · `47 negocios locales` `web-development/ComparadorSection.tsx:589` · `Agenda limitada: N cupos` en los 4 CTAs (`CtaAutomation`, `CtaIA`, `SoftwareDevelopmentCta`, `WebDevelopmentCta`). **Delta: el home clásico agrega los suyos** (+340%/94%/23hs/8.000×/+850/76-vs-15 — ver A3) |
| Precios contradictorios sin fuente central | **VIGENTE y AGRAVADO** | Web: tiers `$490/$980/$1.690` (`PricingSection.tsx:25,36,49`) vs `Desde $800 USD` (`web-development/page.tsx:132`) · IA: `USD 300` (`CtaIA.tsx:399`, `ComparadorIA.tsx:668`) vs `$1.800` en metadata (`ai-implementations/layout.tsx:5`) · Automatización: `$199/$499` (`VaultAutomation.tsx:24,35`) + `$240/mes` (`CalculadoraAutomation.tsx:917,940`) · Software: `$1.500` (`RoiSoftware.tsx:432`) + escalera del wizard hasta $6.000. **Delta clave: el `$200` de automatización que el B0 dio por inexistente SÍ existe en main** — `Navbar.tsx:38` y `OurServices.tsx:106` — o sea la fusión tiene una superficie de precios más grande que la que mapeó el B0 |
| Route B cableada | **VIGENTE** | `lib/marketing-routes.ts` (5 rutas), `ui/MarketingIntro.tsx`, `ui/BrandedIntroCanvas.tsx`, rama en `ui/Preloader.tsx:302-303`, `isAutomationEnvironment` en `PreloaderContext.tsx:70-85` — todo presente y conectado |
| Token `--color-ds-control-edge` no definido | **VIGENTE (acotado)** | Usado en `styleguide/_components/PaletteBlock.tsx:73-74` y `ProductPlate.tsx:18`; sin definición en `globals.css` (existe `ds-control-stroke`). En main el daño queda confinado al styleguide — el `PanelPlate` que también lo usaba no existe en este árbol |
| `/og-image.png` inexistente | **VIGENTE** | Referenciado en `app/layout.tsx:32,38` y `app/contact/layout.tsx`; no está en `public/` (listado completo en B4) |
| Logo PNG de 1,2 MB | **VIGENTE** | `public/logodevelOP.png` = 1.218.900 bytes; usado por login (×2) y onboarding |
| `DotMatrix` atando login / forgot-password / accept-invite | **VIGENTE** | `login/page.tsx:11-12` y `forgot-password/page.tsx:9-10` (export nombrado), `accept-invite/InviteBackground.tsx` (default); `reset-password` y `cambiar-password` no lo usan; `DotMatrixMesh` además en `BrandedIntroCanvas` (Route B) y en el canvas del Hero clásico |

### C2 · Baseline técnico

**`tsc --noEmit`** (corrido con `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\`, solo): **exit 0 — CERO errores.** Ni los dos del baseline conocido (`@googleapis/webmasters` en `searchconsole.ts` — el paquete está instalado en este worktree) ni nuevos. Volcado completo: vacío.

**Versiones exactas** (`package.json`): next `^16.2.6` · react/react-dom `19.2.3` · tailwindcss `^4` (+`@tailwindcss/postcss ^4`) · motion `^12.36.0` · lenis `^1.3.17` · three `^0.182.0` (+`@types/three ^0.182.0`) · `@react-three/fiber ^9.5.0` · `@react-three/drei ^10.7.7` · `@react-three/postprocessing ^3.0.4` (+`postprocessing ^6.38.3`) · lucide-react `^0.562.0`. (Además: prisma/`@prisma/client` `^6.19.2`, next-auth `^5.0.0-beta.30`, typescript `^5`.) Idénticas a las del B0 — el árbol de dependencias no se movió.

### C3 · Mapa de impacto de la fusión IA + Automatización (sobre main)

**Rutas:** `src/app/ai-implementations/{page,layout}.tsx` · `src/app/process-automation/{page,layout}.tsx` — cada layout con metadata SEO propia (la de IA declara `Desde $1.800 USD`, `layout.tsx:5`).

**Componentes:** IA — 8 vivos (`HeroIA, DemoIA, GarantiaIA, PipelineIA, RubrosIA, ComparadorIA, FaqIA, CtaIA`) + `TestimoniosIA` importado pero apagado (`page.tsx:179`) + 3 huérfanos (`BentoIA, CalculadorIA, VaultIA` — sin importadores, verificado; `CalculadorIA` hardcodea otro número de WhatsApp). Automatización — 10 vivos + `DataPacketsCanvas` (único `dynamic ssr:false` de esa landing) + 2 huérfanos (`ComparativaAutomation, SocialProofAutomation` — sin importadores, verificado).

**Consumidores de ruta en main** (la lista que la fusión obliga a tocar):

| Consumidor | Qué tiene hoy |
|---|---|
| `layout/DynamicDock.tsx:34-41` | 2 items separados: `Chatbot` `/ai-implementations` `#10b981` · `Automatizaciones` `/process-automation` `#f59e0b` (+ `ROUTE_TO_LABEL` :43-49) |
| `layout/Navbar.tsx:34-39` (menú mobile) | `Agente IA · $300` y `Automatización · $200` como entradas separadas CON precio |
| `modules/chatbot/server/tools/navigateToPage.ts:25-34` | `'/ai-implementations'`, `'/process-automation'` y `'/process-automation#calculadora'` en el enum Zod + descripciones del tool (:53-61) |
| `app/sitemap.ts` | ambas rutas con priority 0.8 (robots.ts no las enumera — no es consumidor) |
| `app/contact/page.tsx:13-18` | `SERVICE_OPTIONS` con `automation` y `ai` separados; el schema del server action (`lib/actions/schemas.ts:61`) tiene `service` como string libre — **no** hay enum que rompa |
| `sections/home/OurServices.tsx` | `SERVICES` ids 2 y 3 (:82-117) con precios `$300`/`$200`, `ORDERED_SERVICE_IDS=[1,2,4,3]`, chips del header, filas del CTA final, anclas `#servicio-2`/`#servicio-3` |
| `lib/marketing-routes.ts:9-13` | ambas en `MARKETING_ROUTES` (gate del intro branded) |
| Acentos | verde `#10b981` + ámbar `#f59e0b` en: `SERVICES` de OurServices, `NAV_ITEMS` del dock, tokens `--color-ds-accent-ia/automation` (`globals.css:61-62`), `design-system/accent.ts` (huérfano), CLAUDE.md (congelados — la fusión pide descongelarlos por decisión) |
| Redirects | `next.config.ts` → `redirects()` (:111) hoy solo tiene los del portal — **los 301 de la ruta que muera se agregan ahí** |
| Contenido a reconciliar | pricing (setup `USD 300`/`$1.800` metadata vs suscripción `$199/$499/mes` vs `$200`/`$240` sueltos — 6 superficies), claims duplicados (`+12hs` hero vs `22hs` FAQ/metadata de automation), rubros espejados (Salud/Comercio/Restaurante/Inmobiliaria en ambas), FAQs paralelas (8+3 c/u), prefills de WhatsApp por servicio |

Solo el mapa; el cambio no se propone acá.

### C4 · Minería del branch experimental

Contexto clave que el B0 no pudo ver: **la restauración `78b510ac` no borró todo el rediseño** — tocó 33 archivos (stat completo verificado) y dejó **huérfana en el árbol de main** una parte del sistema nuevo. Hay dos vetas: lo que ya está en el working tree (se recupera importándolo) y lo que solo vive en la historia (`git show "78b510ac^:<ruta>"`).

**Ideas aprovechables (8):**

1. **El mecanismo de theming por sección (`SectionShell`)** — ya en el árbol: `src/components/design-system/SectionShell.tsx` (+ isla `design-system/` completa y `/styleguide` para verla). Es exactamente "transición cromática al cruzar un punto": escribe `data-ds-theme` local y avisa al provider global con `useInView(margin: '-45%')`. La paleta crema muere; el mecanismo es el que el nuevo ritmo necesita.
2. **La composición sin `dynamic()` del home** — `git show "78b510ac^:logic-core-v3/src/app/page.tsx"`. Secciones importadas estático + JS en islas: es el fix estructural del aterrizaje de anclas roto (A6) y el molde para las 8 secciones nuevas.
3. **El Hero de dos capas** — `git show "78b510ac^:logic-core-v3/src/components/layout/Hero.tsx"` + `src/components/layout/HeroArtifactLayer.tsx` y `HeroCanvas.tsx` (ya en el árbol, huérfanos). Base tipográfica server-rendered sin readiness gate + 3D diferido (desktop-only, idle post-paint, `frameloop='demand'` fuera de viewport, `CanvasErrorBoundary`, HDRI self-hosteado). Mata el lock de ~9,8s conservando el logo 3D — insumo directo de la intro inmersiva nueva.
4. **`PanelPlate` + la data verificada del panel** — `git show "78b510ac^:logic-core-v3/src/components/sections/portal-demo/PanelPlate.tsx"` y `git show "78b510ac^:logic-core-v3/src/components/sections/portal-demo/data.ts"`. La lámina wireframe del producto con la regla escrita "cada cosa que aparece acá tiene que ser algo que el panel realmente hace" (verificada contra health-score/attention/week-results del portal). Sirve a la sección "tu panel" y al protagonismo del trabajo real sin inventar cifras.
5. **El ciclo de escenas** — `git show "78b510ac^:logic-core-v3/src/components/sections/portal-demo/PortalDemo.tsx"` + `src/components/sections/portal-demo/useEscenaCycle.ts` (**ya en el árbol, muerto — 0 importadores**). Carrusel de escenas 5.2s con cancelación por viewport, sin ciclo bajo reduced-motion y corte por selección manual: patrón listo para cualquier carrusel del home nuevo.
6. **La Navbar plana** — `git show "78b510ac^:logic-core-v3/src/components/layout/Navbar.tsx"`. Barra superior opaca con desplegable de servicios, sección activa por IntersectionObserver de SOLO los ids destino + hash por `useSyncExternalStore`, y `PROCESO_ANCHOR_BY_ROUTE` (que además arregla los `#proceso` rotos de A6). Su docblock documenta con mediciones por qué murió el dock — el reemplazo ya está diseñado.
7. **El Preloader sin coreografía bloqueante** — `git show "78b510ac^:logic-core-v3/src/components/ui/Preloader.tsx"` (+ el diff de `useChromeRevealed.ts` en ese commit). La variante B2 que libera el scroll temprano: el contrapunto medido para calibrar cuánto intro tolera el home nuevo.
8. **El Portfolio de un solo árbol JSX** — `git show "78b510ac^:logic-core-v3/src/components/sections/home/Portfolio.tsx"`. Un árbol para desktop+mobile (el doble árbol clásico servía 465 KB de HTML), lámina de caso real con placeholders gateados a merge ("ninguna rama con estos placeholders a la vista se mergea") — estructura y disciplina de copy para la sección "trabajos".

**Descartables (con razón):**
- **Paleta crema** (`#F2EEE6`/`#EAE5DA`) y la **alternancia DURA claro/oscuro por sección**: el ritmo nuevo pide transición smooth y wash por servicio, no corte seco por capítulo. Los tokens como capa sirven; los valores y el patrón no.
- **Acento ámbar + `accent.ts` de 4 roles**: la fusión deja trío azul/verde/violeta; el rol `automation` muere con su token.
- **La estructura de 6 secciones** del rediseño viejo: la nueva es de 8 (con carrusel y "por qué develOP" propios).
- **`revert-home-abortado`** (3 reverts sin mergear): sin valor — deshacen lo que la restauración ya deshizo por otra vía.
- **Los hex propios de `HomeWrapper`** (`#fafafa`/`#000000`) como mecanismo de tema: duplican al de SectionShell; el home nuevo debe quedarse con UN sistema de inversión.

### C5 · Riesgos y sorpresas

1. **El ritmo cromático de main está invertido respecto del buscado**: claro → negro×2 → gris (marquee) → negro×6. No se ajustan washes: se invierte la base de 8 de las 11 piezas, y los empalmes son scrims manuales duplicados en 5 componentes.
2. **OurServices no es una sección, es una aplicación**: 9.898 líneas, 16 simulaciones con rAF + `setState` a 60fps, 64 `backdrop-filter` inline, sims definidas dentro del render e invocadas como funciones planas (hooks imposibles), 2 fuentes de verdad del "servicio activo", ~365 líneas muertas. No hay edición incremental razonable; su reemplazo (Servicios + data.ts) ya existe huérfano en el árbol.
3. **El aterrizaje de anclas en carga fría está roto por diseño** (`dynamic()` sin caja + `#nosotros` duplicado — documentado en `SmoothScroll.tsx:48-64`) y afecta al menú, al chatbot (`navigateToPage`) y a cualquier deep-link. Además: `#proceso` roto en 2 landings y `#servicio-3/4` cruzados por `ORDERED_SERVICE_IDS`.
4. **La deuda de claims no es solo de landings**: el home clásico tiene CUATRO promesas de respuesta distintas conviviendo (`24hs` Hero · `2hs` Footer ×3 · `Inmediata` · `<4h` SLA), cifras duras sin fuente (`+340%`, `8.000×`, `+850 leads`, `76 vs 15 días`), una fecha comprometida (`PRÓXIMAMENTE Q3 2026`) y fechas internas que envejecen (`Junio 2025`).
5. **La superficie de precios de la fusión es mayor que la mapeada por el B0**: el `$200` de automatización existe en main (Navbar mobile + OurServices), y el menú mobile muestra precios — 6 superficies de precio solo en home/chrome, más las de las landings.
6. **El sistema `ds-*` no se puede borrar a ciegas**: `ui/Button.tsx` (14 consumidores, portal incluido) usa `bg-ds-fg`/`var(--shadow-ds-control)`. La limpieza del rediseño viejo tiene una dependencia viva del producto.
7. **Bugs visibles hoy en producción del home** (inventario, no se tocaron): mojibake literal `TucumÃ¡n... paÃ­s` en About mobile (About.tsx:294); estrellas de rating vacías en OurServices (:1074, :2445); celda fantasma en el grid de módulos (5 columnas para 4 cards); tags de Portfolio escritos y nunca renderizados.
8. **Cero material real producido**: ni capturas de sitios de clientes (los 6 showcase son SVG genéricos), ni screenshots del panel (los 3 `.webp` planificados no existen y `public/landing/` no existe), ni fotos del equipo. El "protagonismo del trabajo real" es 100% producción pendiente.
9. **El form del Footer da éxito falso**: postea al webhook n8n sin chequear `response.ok` (un 4xx/5xx muestra "¡Consulta enviada!") y el catch abre WhatsApp sin confirmar — camino de contacto paralelo al server action de `/contact`, con claims propios. Y el Hero vivo baja el HDRI de la CDN de drei en runtime (`Environment preset="studio"`) mientras el HDRI self-hosteado quedó huérfano — regresión de la lección que motivó el self-hosting.
10. **Rutina (sin sorpresas)**: `tsc` limpio (0 errores), versiones idénticas al B0, Route B intacta, chatbot bien montado con prefetch, sitemap/robots sanos, VALID_PATHS del chatbot coherente con la home restaurada. `framer-motion` y `motion/react` conviven (About/Portfolio vs el resto) — molestia, no riesgo.

---

*Este reporte releva estado; no aprueba ni decide cambios.*
