# PROBE — Censo del monolito y del home que muere

**Fecha:** 2026-07-29 · **Rama al cierre:** `main` @ `1c00949`
**Naturaleza:** diagnóstico read-only. No se tocó ni una línea de `src/`. No se propone rediseño, refactor ni mejoras.
**Método:** lectura completa de los archivos en scope + grep repo-wide, repartida en 15 pasadas read-only (7 franjas de `OurServices.tsx`, 4 de censo de secciones, 4 de dependencias). Los hallazgos marcados **[verificado en esta sesión]** los confirmé leyendo el código directamente, además del reporte de la pasada.

> ### ⚠ El árbol cambió de rama durante el censo
>
> Al arrancar, el repo estaba en `fix/home-sanidad` @ `fe099b9`, con `About.tsx`, `layout.tsx` y `MarketingIntro.tsx` marcados como modificados. **Al terminar, el repo estaba en `main` @ `1c00949` y el árbol limpio** — otra sesión trabajando sobre el mismo checkout hizo el switch a mitad del censo (queda un `stash@{0}: On fix/home-sanidad: epitaxy: pre-switch`, que contiene únicamente un doc no rastreado, `docs/probe-01-censo-cosecha.md`).
>
> **Qué significa para este reporte:** el contenido en disco de esos tres archivos era el de `main`, no el de `fe099b9` — por eso figuraban como "modificados" respecto de un HEAD que ya tenía los arreglos. **Es decir: todo este censo describe `main`.** Verifiqué después del switch que **todas** las referencias línea-por-línea que usa el reporte siguen siendo exactas en `main` (`About.tsx`: `useThemeSection` en 402 y 461, `KineticText` en 5/380/386, `id="nosotros"` en 411 y 471, `id="about"` en 523, `export const About` en 522; `layout.tsx`: `CustomCursor` en 4/72, `NoiseOverlay` en 5/73, `Preloader` en 43/86; `OurServices.tsx`: 9.898 líneas, `id="servicios"` en 9632).
>
> **El delta entre `main` y `fix/home-sanidad`** es chico y está acotado a dos archivos: `About.tsx` (1 línea) y `layout.tsx` (6 líneas). El de `About.tsx` es relevante para §C.6 y está anotado ahí.

---

## Índice

- [A. Anatomía de `OurServices.tsx`](#a-anatomía-de-ourservicestsx)
- [B. Rescate de contenido](#b-rescate-de-contenido) ← **el brief**
- [C. Censo del resto de lo que muere](#c-censo-del-resto-de-lo-que-muere)
- [D. Dependencias compartidas y trampas de demolición](#d-dependencias-compartidas-y-trampas-de-demolición)
- [E. Orden de demolición seguro](#e-orden-de-demolición-seguro)
- [Lo que no se pudo determinar](#lo-que-no-se-pudo-determinar)

---

# A. Anatomía de `OurServices.tsx`

## A.0 Ficha rápida

| | |
|---|---|
| Ruta | `src/components/sections/home/OurServices.tsx` |
| Tamaño | **9.898 líneas** / 355 KB |
| Export | **`export default function OurServices()`** (línea 9444). Un solo export, sin nombrados. |
| Quién lo importa | **Un único consumidor:** `src/app/page.tsx:14` (`dynamic(() => import('@/components/sections/home/OurServices'))`), renderizado en `page.tsx:32` dentro de `<SectionWrapper>`. Cero importadores fuera del home. |
| Componentes internos | **31**, todos privados al módulo. Ninguno exportado. |
| Imports externos | `react`, `motion/react`, `lucide-react`, `@/components/layout/SmoothScroll` (`useLenis`, línea 43), `@/context/TransitionContext` (`useTransitionContext`, línea 44). |
| Ancla pública | `id="servicios"` (línea 9632) |
| Anclas internas | `servicio-{id}` (generadas por `getServiceAnchorId`, línea 156) e `id="servicios-siguiente-paso"` (línea 9002) — sin consumidores externos |

La estructura macro es simple, y es lo que hace que 9.898 líneas sean manejables: **~7.400 de esas líneas (75 % del archivo) son las cuatro demos animadas** (`WebScene`, `AIScene`, `AutomationScene`, `SoftwareScene`), cada una con sus 4 sub-escenas. El contenido de negocio real vive en **~90 líneas** (el array `SERVICES`, líneas 63-136, y `SERVICE_IMPACT_ITEMS`, líneas 7993-8014). El resto es chrome, fondo y el bloque de cierre.

## A.1 Mapa de bloques por rango de línea

### Cabecera y datos (1-590)

| Líneas | Tipo | Qué es |
|---|---|---|
| 1-44 | imports | React/hooks, `motion/react`, iconos lucide, `useLenis`, `useTransitionContext` |
| 46-61 | tipo | `type Service` — 14 campos: `id, tag, title, description, price, timeline, metric, sectors[], outcomes[], cta, href, accent, glow, icon` |
| **63-136** | **datos** | **`SERVICES`: los 4 servicios completos.** El bloque más valioso del archivo → §B.1 |
| 138-147 | datos | `ORDERED_SERVICE_IDS = [1, 2, 4, 3]` — reordena para display: Web, IA, **Software, Automatización** (distinto del orden de definición). Tira `Error` si falta un id. |
| 149-154 | datos | `SERVICE_SHORT_LABELS`: `Sitio Web` / `Agente IA` / `Automatizaciones` / `Software` |
| 156-160 | helpers | `getServiceAnchorId`, `getServiceAccent`, `SERVICE_DEMO_HOLD_MS = 2000`, `SERVICE_DEMO_ADVANCE_DELAY_MS = 300` |
| 162-325 | hook | `useServiceDemoCycle` — motor del carrusel de las demos. rAF gateado por `isInView`, con cleanup completo |
| 327-374 | componente | `ServiceDemoPauseButton` — píldora Play/Pause, "Pausar" / "Reanudar" |
| 376-590 | panel | `StageFrame` — marco de ventana de navegador falsa (traffic lights, URL simulada `{tag}.develop.com.ar`, badge de `service.metric`, indicador "EN VIVO" parpadeante) que envuelve cada demo |

### Panel Web (592-3071) — `WebScene`

| Líneas | Tipo | Qué es |
|---|---|---|
| 592-611 | tipos | `WebSimulation`, `SimProps`, `PlaceholderConfig` |
| 613-656 | helpers | 5 glifos SVG 12×12 (`IconBase`, `SearchGlyph`, `AnalyticsGlyph`, `LeadsGlyph`, `MapsGlyph`) |
| 658-663 | datos | `webSimulations`: 4 tabs — SEO Local (5000 ms), Analytics (4500), Leads (5500), Google Maps (6500) |
| **670-707** | **datos muertos** | `placeholderConfigs` — 4 configs de respaldo. **Inalcanzable en runtime** (ver §A.5) |
| 709-723 | helper | IntersectionObserver `threshold 0.3` → `isInView`. Gate de viewport de todo el panel |
| 755-1138 | panel | **SimSEO** — búsqueda de Google tipeándose; resultado #1 "Tu Empresa \| develOP" con estrellas, 4 competidores debajo |
| 1139-1493 | panel | **SimAnalytics** — 3 KPIs con tendencia, gráfico de línea SVG de 12 puntos, mapa de Argentina con 8 ciudades apareciendo |
| 1494-1824 | panel | **SimLeads** — formulario de contacto tipeándose, envío, checklist de 5 pasos operativos |
| 1825-2516 | panel | **SimMaps** — mapa de Tucumán, 9 zonas rankeadas, 28 pines de competidores, pin "#1 · TU EMPRESA", panel lateral vs. competencia. **Incluye bloque muerto `display:none` en 2426-2510** (§A.5) |
| **2517-2798** | **muerto** | `renderPlaceholderScene` — escena de respaldo "Próximo sprint". **Inalcanzable** (§A.5) |
| 2800-2898 | chrome | Header: "develOP web" / "Lo que tu sitio hace por vos, en vivo" / "Cada función trabajando mientras dormís" + botón pausa + badge ACTIVO·PAUSADO |
| 2900-3010 | chrome | Barra de 4 tabs con barra de progreso |
| 3012-3071 | chrome | `AnimatePresence mode="wait"` que monta la sub-escena activa |

### Panel IA (3073-5152) — `AIScene`

| Líneas | Tipo | Qué es |
|---|---|---|
| 3073 | datos | `AI_COLOR = '#10b981'` |
| 3083-3088 | datos | `AI_SIMULATIONS`: Chat IA (8500 ms), Leads (6200), Agenda (8000), Métricas (5200) |
| 3095-3642 | panel | **SimChat** — conversación de WhatsApp cliente↔bot sobre una Toyota Hilux, tipeada letra por letra |
| 3644-3986 | panel | **SimLeadsIA** — calificación automática de 5 leads con score 0-100 → CALIENTE/TIBIO/FRÍO |
| 3988-4623 | panel | **SimAgenda** — agendamiento de test drive por chat + mini-calendario semanal |
| 4625-4928 | panel | **SimMétricas** — dashboard con contadores animados + comparativa IA vs humano |
| 4930-4976 | helper | Estado + IntersectionObserver (`threshold 0.3`) + ciclo |
| 4979-5150 | chrome | Header "AGENTE IA · EN VIVO", tabs, `AnimatePresence` |

### Panel Automatización (5153-6479) — `AutomationScene`

| Líneas | Tipo | Qué es |
|---|---|---|
| 5153-5174 | datos | `AUTO_COLOR = '#f59e0b'`; 4 sub-escenas: Flujo (6000 ms), Follow-up (8000), Reportes (7500), Sync Apps (8000) |
| 5175-5281 | panel | **SimFlujo** — diagrama SVG de 5 nodos (Formulario → n8n → WhatsApp/CRM/Email) con pulsos viajando por las curvas |
| 5283-5566 | panel | **SimFollowUp** — timeline vertical de 9 eventos que narra la recuperación de un lead; cierra con el stat "68 %" |
| 5568-5951 | panel | **SimReporte** — reloj "Lun 08:00" → recolección → generación → preview del reporte semanal → envío |
| 5953-6255 | panel | **SimSync** — formulario web ficticio → 7 pasos de sync con check → stat "2.3s" |
| 6257-6477 | chrome | Estado, IntersectionObserver, header "AUTOMATIZACIONES · EN VIVO", tabs, `AnimatePresence` |

### Panel Software (6481-7975) — `SoftwareScene`

| Líneas | Tipo | Qué es |
|---|---|---|
| 6481-6502 | datos | `SW_COLOR = '#8b5cf6'`; 4 tabs: CRM (11000 ms), Dashboard (5000), Stock (7000), Equipo (6500). La prop `service` se anula con `void service;` (línea 6482) |
| 6503-6778 | panel | **SimCRM** — kanban de 4 columnas con 18 deals que vuelan entre columnas vía `layoutId` |
| 6780-6989 | panel | **SimDashboard** — KPIs Revenue/Clientes/Retención + gráfico de barras Ene-Jun |
| 6991-7356 | panel | **SimStock** — tabla de 4 productos, alerta de stock crítico, secuencia de reposición automática |
| 7358-7752 | panel | **SimEquipo** — 4 miembros con avatares, lista de tareas, donut de productividad |
| 7754-7975 | chrome | Estado, IntersectionObserver, header "SOFTWARE · EN VIVO", tabs, `AnimatePresence` |

### Tarjetas, fondo y riel (7977-9180)

| Líneas | Tipo | Qué es |
|---|---|---|
| 7977-7991 | componente | `ServiceVisual` — switch por `service.id` que elige la escena |
| **7993-8014** | **datos** | **`SERVICE_IMPACT_ITEMS`** — 3 pares label/value por servicio → §B.1 |
| 8016-8084 | componente | `ServiceImpactSnapshot` — panel "Impacto estimado" |
| 8086-8372 | componente | `ServiceInfoCard` — **la tarjeta de oferta**: tag, título, descripción, checklist de outcomes, impacto, bloque DESDE + precio + timeline, chips de rubros, CTA |
| 8374-8478 | componente | `ServiceDemoPanel` — marco 3D con perspective + halos que aloja el `ServiceVisual` |
| 8480-8535 | componente | `ServiceCard` — combina info + demo en 2 columnas alternadas, con motion ligado a `useScroll` |
| 8536-8635 | panel | `PARTICLES` (12 configs) + `FloatingParticles` (12 blancas + 3 del color activo) |
| 8637-8816 | panel | `OurServicesBackground` — gradiente, ruido SVG, 4 zonas de color, halo de transición, líneas de flujo |
| 8818-8912 | componente | `ServicesProgressRail` (riel lateral, solo `lg+`) + `ServiceRailSpacer` |
| 8914-8966 | componente | `ServiceRow` — IntersectionObserver propio que determina el "servicio activo" |
| 8968-9442 | ui | `ServicesFullWidthCta` — CTA final de ancho completo con 4 esquinas de color, **contiene el bloque "Cierre de diagnóstico"** |

### Cierre y componente raíz (9180-9897)

| Líneas | Tipo | Qué es |
|---|---|---|
| **9180-9266** | **contenido** | **Bloque "Cierre de diagnóstico"** → §B.3 |
| 9268-9436 | ui | Columna "Elegí por donde empezar" + 4 botones por servicio (`ORDERED_SERVICES.map`), `onClick → onNavigate(service.href)` |
| 9444-9459 | raíz | `OurServices`: 4 `useRef`, 4 `useState`, `useTransitionContext`, `useLenis`, `useMotionValue` + `useSpring` |
| 9461-9627 | raíz | Medición del riel: `updateRailProgress`, `measureRailMarkers`, `setServiceRowRef`, `updateActiveRailIndex`, listeners globales, `scrollToService`, `ResizeObserver` |
| 9629-9686 | ui | `<section id="servicios">` + fondo + 4 capas decorativas |
| 9687-9856 | ui | Header inmersivo: badge "EL ECOSISTEMA DEVELOP", H2 "Cuatro soluciones. / Un solo objetivo.", subfrase, chips por servicio con precio |
| 9868-9890 | ui | Track: `ServicesProgressRail` + `map` de `ServiceRow` |
| 9892 | ui | `<ServicesFullWidthCta onNavigate={triggerTransition} />` |

## A.2 Componentes internos

**31 componentes, 0 exportados.** Ninguno es reutilizable desde fuera sin extraerlo primero.

| Componente | Líneas | Lo usa |
|---|---|---|
| `ServiceDemoPauseButton` | 327-374 | Las 4 escenas (`WebScene:2880`, `AIScene:5011`, `AutomationScene`, `SoftwareScene`) |
| `StageFrame` | 376-590 | `ServiceVisual` |
| `IconBase` / `SearchGlyph` / `AnalyticsGlyph` / `LeadsGlyph` / `MapsGlyph` | 613-656 | `webSimulations` (659-662) |
| `WebScene` | 592-3071 | `ServiceVisual:7981` |
| `SimSEO` / `SimAnalytics` / `SimLeads` / `SimMaps` | 755-2516 | `WebScene:3034/3040/3046/3052` |
| `renderPlaceholderScene` | 2517-2798 | `WebScene:3058` — **rama inalcanzable** |
| `AIScene` | 3090-5152 | `ServiceVisual:7983` |
| `SimChat` / `SimLeadsIA` / `SimAgenda` / `SimMétricas` | 3095-4928 | `AIScene:5141/5143/5145/5146` |
| `AutomationScene` | 5153-6479 | `ServiceVisual:7985` |
| `SimFlujo` / `SimFollowUp` / `SimReporte` / `SimSync` | 5175-6255 | `AutomationScene:6468/6470/6472/6473` |
| `SoftwareScene` | 6481-7975 | `ServiceVisual` (default) |
| `SimCRM` / `SimDashboard` / `SimStock` / `SimEquipo` | 6503-7752 | `SoftwareScene:7965/7967/7969/7970` |
| `ServiceVisual` | 7977-7991 | `ServiceDemoPanel:8473` |
| `ServiceImpactSnapshot` | 8016-8084 | `ServiceInfoCard:8269` |
| `ServiceInfoCard` | 8086-8372 | `ServiceCard:8523` |
| `ServiceDemoPanel` | 8374-8478 | `ServiceCard:8530` |
| `ServiceCard` | 8480-8535 | `ServiceRow:8963` |
| `FloatingParticles` | 8551-8635 | `OurServicesBackground:8813` |
| `OurServicesBackground` | 8637-8816 | `OurServices:9635` |
| `ServicesProgressRail` | 8818-8908 | `OurServices:9869` |
| `ServiceRailSpacer` | 8910-8912 | `ServiceRow:8962` |
| `ServiceRow` | 8914-8966 | `OurServices:9880` |
| `ServicesFullWidthCta` | 8968-9442 | `OurServices:9892` |

**Patrón consistente en todo el archivo:** las 16 sub-escenas se invocan **como llamadas de función** (`SimSEO({...})`), no como JSX (`<SimSEO/>`). Se registra tal cual aparece.

## A.3 Exports y quién importa

| Export | Tipo | Importadores |
|---|---|---|
| `default` (`OurServices`) | componente | **`src/app/page.tsx:14`** (dynamic import) → usado en `page.tsx:32`. **Único importador en todo el repo.** |

No hay exports nombrados. Ningún tipo, constante ni componente del archivo se consume desde fuera. **El archivo se puede borrar sin romper ninguna importación fuera de `page.tsx`** — los acoplamientos reales son por *string* (el `id="servicios"`), no por import. Ver §D.4.

## A.4 Estado, efectos y animación "en vivo"

### Motores de animación

| Mecanismo | Dónde | Cleanup | ¿Se pausa fuera del viewport? |
|---|---|---|---|
| `requestAnimationFrame` (loop del carrusel) | `useServiceDemoCycle:247-315` | **Sí** (`cancelAnimationFrame` + `clearTimeout` + flag) | **Sí** — `if (!isInView \|\| itemCount <= 0)` corta el loop antes de arrancarlo (línea 259) |
| `IntersectionObserver` ×4 (`threshold 0.3`) | `WebScene:709`, `AIScene:4936`, `AutomationScene:6263`, `SoftwareScene:7760` | **Sí** (`observer.disconnect()`) | Es el propio gate |
| `IntersectionObserver` (servicio activo) | `ServiceRow:8936` — `threshold [0.28, 0.45, 0.62]`, `rootMargin '-18% 0px -18% 0px'` | **Sí** | Es el propio gate |
| `ResizeObserver` + listener `resize` | `OurServices:9603-9627` | **Sí** (`disconnect` + `removeEventListener` + `clearTimeout(350ms)`) | No aplica |
| Listeners `scroll` (passive) + `resize` en `window` | `OurServices:9547-9564` | **Sí** | **No.** Quedan activos mientras el componente esté montado, aunque la sección esté fuera de pantalla |
| `useSpring` (`stiffness 150, damping 34, mass 0.28`) | `OurServices:9456` | Interno de Framer | **No** — corre su loop interno mientras el spring se asienta |
| `setInterval` (ciclo de esquinas del CTA, 1000 ms) | `ServicesFullWidthCta:8988` | **Sí** | Gateado por **hover**, no por viewport: sin hover el interval ni se crea |

### Loops de Framer Motion con `repeat: Infinity`

**Gateados por `isActive` (= `isInView`), se detienen fuera de pantalla:**
`StageFrame` "EN VIVO" (551, indirectamente vía el padre) · `SimSEO` cursor (873) · `SimAnalytics` LIVE (1222) y anillo del gráfico (1397) · `SimLeads` cursor (1608) · `SimMaps` 3 anillos del pin (2153) · `SimChat` punto "En línea" (3179), cursores (3231, 3317), typing dots (3279) · `SimFlujo` punto (5209), pulsos (5247), anillos (5264) · `SimFollowUp` stat (5556) · `SimSync` stat (6245) · `SimDashboard` LIVE (6835) · `SimStock` ALERTA (7057) · `SimEquipo` URGENTE (7613)

**NO gateados — corren mientras el nodo esté montado, en pantalla o no:**

| Línea | Qué | Por qué no se pausa |
|---|---|---|
| 1473 | `SimAnalytics` — ripple detrás de cada punto de ciudad del mapa de Argentina | `repeat: Infinity` sin condicionar por `isActive`, a diferencia del resto del mismo archivo |
| 3729 | `SimLeadsIA` — badge "PROCESANDO" pulsante | El componente **descarta** `isActive` con `void isActive;` (línea 3645) |
| 4120 | `SimAgenda` — cursor parpadeante | `void isActive;` (línea 3989) |
| 4679 | `SimMétricas` — badge "LIVE" pulsante | `void isActive;` (línea 4626) |
| 8365 | `ServiceInfoCard` — flecha del CTA que rebota (`x: [0,4,0]`) | Sin `useInView` en ninguna parte de la tarjeta |
| 8575, 8613 | `FloatingParticles` — 12 partículas base + 3 de acento | Sin gate de viewport |

Tres de los cuatro `void isActive;` están en `AIScene`. Es un patrón, no un descuido aislado.

## A.5 Código muerto dentro del monolito

Tres hallazgos, los tres verificados por lectura estática:

1. **`renderPlaceholderScene` (2517-2798, ~280 líneas) y `placeholderConfigs` (670-707) son inalcanzables.** `webSimulations` es un array de longitud fija 4 (`useState` sin setter) y el ternario de render cubre explícitamente los índices 0-3 antes de caer al `else`. La rama nunca se ejecuta con los datos actuales.
2. **Bloque `display:none` en `SimMaps` (2426-2510, ~85 líneas).** Copia del panel lateral "TU EMPRESA / VS COMPETENCIA" que nunca se pinta. Contiene copy y valores **distintos** al bloque visible — p. ej. Rating de la competencia `3.1` (línea 2490) contra `3.4` en el bloque vivo (línea 2376).
3. **Label ignorado en `SimDashboard`:** el tercer KPI se pinta con el string literal `'RETEN.'` (línea 6895) en lugar de `kpis[2].label` (`'RETENCION'`, definido en 6786 y nunca leído).

---

# B. Rescate de contenido

> Esta sección es el brief. Todo lo que sigue está transcripto **verbatim** del código, sin corregir tildes, mayúsculas ni erratas. La ubicación va entre corchetes.

## B.1 Los 4 servicios

Fuente: `OurServices.tsx:63-136` (array `SERVICES`) + `7993-8014` (`SERVICE_IMPACT_ITEMS`) + `149-154` (`SERVICE_SHORT_LABELS`).

**Orden de presentación en pantalla** (`ORDERED_SERVICE_IDS = [1, 2, 4, 3]`, línea 138): Sitios → IA → **Software** → **Automatización**. No coincide con el orden de definición del array.

---

### 1 · SITIOS & LANDINGS  ·  *Web Dev*

| Campo | Valor verbatim | Línea |
|---|---|---|
| `tag` | `SITIOS & LANDINGS` | 66 |
| `title` | `Tu vitrina` / `abierta las` / `24 horas.` *(3 líneas, separadas por `\n`)* | 67 |
| `description` | `Diseñamos la presencia digital que pone tu negocio en Google, captura consultas mientras dormís y convierte visitas en clientes reales.` | 68-69 |
| `price` | `$800 USD` | 70 |
| `timeline` | `15 dias` *(sin tilde en el original)* | 71 |
| `metric` | `+340% consultas promedio` | 72 |
| `sectors` (para quién) | `Concesionarias` · `Clínicas` · `Gimnasios` · `Restaurantes` | 73 |
| `outcomes` (entregables) | `Más autoridad en Google` · `Carga impecable en mobile` · `Captación 24/7` | 74 |
| `cta` | `Explorar sitios web` | 75 |
| `href` | `/web-development` | 76 |
| `accent` | `#06b6d4` (cyan) | 77 |
| `icon` | `Globe` (lucide) | 80 |
| label corto | `Sitio Web` | 150 |
| **Impacto estimado** | `Base: SEO local` · `Captura: Form + WhatsApp` · `Carga: Mobile first` | 7995-7997 |

**Su panel en vivo** (`WebScene`) tiene 4 pestañas: **SEO Local**, **Analytics**, **Leads**, **Google Maps**.
Copy del header del panel: `develOP web` / `Lo que tu sitio hace por vos, en vivo` / `Cada función trabajando mientras dormís` [2835, 2845, 2854].
Frases con voz propia dentro del panel: `Captura automática · 24/7` [1540] · `Posicionamiento de tu negocio por zona, por encima de la competencia local.` [2420].
El caso ficticio que narra es una **`Clínica odontológica en Tucumán`** [756].

---

### 2 · INTELIGENCIA ARTIFICIAL  ·  *AI*

| Campo | Valor verbatim | Línea |
|---|---|---|
| `tag` | `INTELIGENCIA ARTIFICIAL` | 84 |
| `title` | `Un comercial` / `que trabaja` / `sin pausas.` | 85 |
| `description` | `Un agente de IA responde consultas, califica leads y agenda reuniones por WhatsApp. A las 3AM, en feriados, siempre disponible.` | 86-87 |
| `price` | `$300 USD` | 88 |
| `timeline` | `7 dias` | 89 |
| `metric` | `94% respuesta automática` | 90 |
| `sectors` | `Concesionarias` · `Clínicas` · `Comercios` · `Inmobiliarias` | 91 |
| `outcomes` | `Atención inmediata` · `Mejor calidad de lead` · `Agenda operando sola` | 92 |
| `cta` | `Explorar IA aplicada` | 93 |
| `href` | `/ai-implementations` | 94 |
| `accent` | `#10b981` (verde) | 95 |
| `icon` | `Bot` | 98 |
| label corto | `Agente IA` | 151 |
| **Impacto estimado** | `Canal: WhatsApp` · `Filtro: Leads calificados` · `Agenda: Turnos listos` | 8000-8002 |

**Su panel en vivo** (`AIScene`): **Chat IA**, **Leads**, **Agenda**, **Métricas**.
Header: `AGENTE IA · EN VIVO` / `Tu sistema comercial trabajando ahora mismo` [5005, 5008].
Voz propia: `Agente develOP` [3168] · `En línea · Responde al instante` [3184] · `CALIFICACIÓN AUTOMÁTICA` / `IA analizando intención de compra` [3723, 3726] · `AGENDA AUTOMÁTICA` / `Sin intervención humana` [4059, 4061].
El caso ficticio es una **concesionaria** vendiendo una Toyota Hilux 4x4.

---

### 3 · AUTOMATIZACIÓN  ·  *Automation*

| Campo | Valor verbatim | Línea |
|---|---|---|
| `tag` | `AUTOMATIZACIÓN` | 102 |
| `title` | `Tu operación,` / `en piloto` / `automático.` | 103 |
| `description` | `Conectamos tus herramientas y automatizamos lo repetitivo. Reportes, seguimientos y notificaciones corriendo solos mientras vos te ocupás de lo importante.` | 104-105 |
| `price` | `$200 USD` | 106 |
| `timeline` | `5 dias` | 107 |
| `metric` | `23hs por semana ahorradas` | 108 |
| `sectors` | `Distribuidoras` · `Comercios` · `Clínicas` · `Inmobiliarias` | 109 |
| `outcomes` | `Menos trabajo manual` · `Follow-up automático` · `Reportes al instante` | 110 |
| `cta` | `Explorar automatizaciones` | 111 |
| `href` | `/process-automation` | 112 |
| `accent` | `#f59e0b` (ámbar) | 113 |
| `icon` | `Zap` | 116 |
| label corto | `Automatizaciones` | 152 |
| **Impacto estimado** | `Flujo: Apps conectadas` · `Alertas: Seguimiento activo` · `Reportes: Envio programado` *(sin tilde en "Envio")* | 8005-8007 |

**Su panel en vivo** (`AutomationScene`): **Flujo**, **Follow-up**, **Reportes**, **Sync Apps**.
Header: `AUTOMATIZACIONES · EN VIVO` / `Tus procesos corriendo solos ahora mismo` [6332, 6335].
Voz propia: `SEGUIMIENTO automático` / `Ningún lead se pierde` [5391, 5393] · `Leads recuperados con follow-up automático` [5552] · `REPORTE automático` / `Cada lunes · 8:00 AM` [5618, 5620] · `SYNC automático` / `Formulario → 3 apps en 2 segundos` [6033, 6035].
Cadena técnica que muestra: `Formulario → n8n → Apps` [5205], nodos `Formulario / Web`, `n8n / Orquesta`, `WhatsApp / Notif.`, `CRM / Registro`, `Email / Trigger` [5181-5185].

---

### 4 · SOFTWARE A MEDIDA  ·  *Software*

| Campo | Valor verbatim | Línea |
|---|---|---|
| `tag` | `SOFTWARE A MEDIDA` | 120 |
| `title` | `Tu empresa` / `en una sola` / `pantalla.` | 121 |
| `description` | `El sistema exacto para cómo trabaja tu negocio. Sin planillas, sin depender de nadie. Stock, ventas, clientes y equipo — todo centralizado.` | 122-123 |
| `price` | `$1.500 USD` | 124 |
| `timeline` | `entrega por etapas` *(único servicio sin plazo en días)* | 125 |
| `metric` | `0 licencias mensuales` | 126 |
| `sectors` | `Constructoras` · `Mayoristas` · `Clínicas` · `Concesionarias` | 127 |
| `outcomes` | `operación centralizada` *(minúscula inicial en el original)* · `Reportes directivos` · `Control total del dato` | 128 |
| `cta` | `Explorar software a medida` | 129 |
| `href` | `/software-development` | 130 |
| `accent` | `#8b5cf6` (violeta) | 131 |
| `icon` | `Code2` | 134 |
| label corto | `Software` | 153 |
| **Impacto estimado** | `Modulos: Ventas + stock` *(sin tilde)* · `Datos: Reportes propios` · `Costo: Sin licencias` | 8010-8012 |

**Su panel en vivo** (`SoftwareScene`): **CRM**, **Dashboard**, **Stock**, **Equipo**.
Header: `SOFTWARE · EN VIVO` / `Tu empresa bajo control total` [7829, 7832].
Voz propia: `CRM · PIPELINE` / `Estado actual de ventas` [6614, 6616] · `DASHBOARD EJECUTIVO` [6829] · `GESTIÓN DE STOCK` / `Reposición automática activa` [7034, 7036] · `CONTROL DE EQUIPO` / `Vista del director · Hoy` [7449, 7451] · `Stock crítico resuelto` / `Sin intervención humana` [7283, 7284].

---

### ⚠ Los colores de acento no coinciden con `CLAUDE.md` **[verificado en esta sesión]**

`CLAUDE.md` documenta bajo el rótulo *"Service accent colors (do not change)"*:

| Servicio | `CLAUDE.md` | `SERVICES` en el código | ¿Coincide? |
|---|---|---|---|
| Web Dev | Cyan `#06b6d4` | `#06b6d4` (línea 77) | ✅ |
| AI | Violet `#8b5cf6` | **`#10b981`** (línea 95) | ❌ |
| Automation | Green `#10b981` | **`#f59e0b`** (línea 113) | ❌ |
| Software | Amber `#f59e0b` | **`#8b5cf6`** (línea 131) | ❌ |

No son colores random: son **los mismos cuatro hex, permutados**. IA se quedó con el verde de Automation, Automation con el ámbar de Software, y Software con el violeta de IA. La permutación se repite consistentemente en las constantes internas de cada panel (`AI_COLOR = '#10b981'` línea 3073, `AUTO_COLOR = '#f59e0b'`, `SW_COLOR = '#8b5cf6'` línea 6494) y en los fallbacks de `getServiceAccent` usados por `OurServicesBackground` (~8642) y `ServicesFullWidthCta` (~8972). Es decir: **el código es internamente coherente consigo mismo y discrepa de la documentación**, no al revés. Decidir cuál de las dos es la verdad es una llamada de Franco, no una conclusión de este PROBE.

---

## B.2 Rubros y verticales

Los rubros solo aparecen en el campo `sectors` de cada servicio. No hay una sección de verticales aparte.

| Rubro | Aparece en |
|---|---|
| **Clínicas** | los 4 servicios |
| **Concesionarias** | Sitios, IA, Software |
| **Comercios** | IA, Automatización |
| **Inmobiliarias** | IA, Automatización |
| **Gimnasios** | Sitios |
| **Restaurantes** | Sitios |
| **Distribuidoras** | Automatización |
| **Constructoras** | Software |
| **Mayoristas** | Software |

Los rubros ficticios que aparecen *dentro* de las demos (`Clínica odontológica en Tucumán`, la concesionaria de la Hilux, el taller del `SimStock`, los 18 nombres de empresa del kanban del CRM) son escenografía de demo, no oferta comercial. Se listan en §B.6.

## B.3 Bloque "Cierre de diagnóstico" (completo)

Vive dentro de `ServicesFullWidthCta`, líneas **9180-9436**. Es el último bloque del monolito antes del componente raíz.

**Eyebrow** [9186] · uppercase, blanco 42 % de opacidad:
> `Cierre de diagnostico` *(sin tilde en el original)*

**Titular H3** [9199] · `clamp(2.1rem, …, 5.35rem)`, weight 900:
> `Converti esta lectura en una decision clara.` *(sin tildes en "Convertí" ni "decisión")*

**Párrafo** [9210]:
> `Si tu negocio necesita verse mejor, responder mas rapido, ahorrar horas o centralizar la operacion, el proximo paso es elegir el frente con mayor impacto y construirlo con foco comercial desde el dia uno.` *(sin tildes en todo el párrafo)*

**Grid de 3 stats** [9213-9266] — cada uno es `{label, value}` en una `motion.div` con hover (`y: -2` + glow):

| Valor | Bajada | Línea |
|---|---|---|
| `4 areas` | `Presencia, IA, procesos y sistema` | 9223 |
| `1 plan` | `Prioridad segun retorno real` | 9224 |
| `0 relleno` | `Solo piezas que mueven ventas` | 9225 |

**Columna derecha** [9278]:
> `Elegi por donde empezar` *(sin tilde)*

**Lista de botones** [9280-9436] — `ORDERED_SERVICES.map`, o sea en orden Web → IA → Software → Automatización. Cada botón muestra el icono del servicio, su `SERVICE_SHORT_LABELS`, su `service.metric` y un badge `Ver →` que invierte color al hover; las `variants` animan `x/y/background/boxShadow` con el `accent` del servicio. `onClick` llama `onNavigate(service.href)`, que en el call-site (línea 9892) es `triggerTransition`.

**Nota de encoding:** todo este bloque está escrito **sin tildes**, mientras que el resto del archivo (`SERVICES`, los paneles) sí las usa. Es sistemático dentro del bloque, no una errata suelta.

## B.4 Header de la sección (para el mismo brief)

Líneas 9687-9856, arriba de todo:

- Badge [9734]: `EL ECOSISTEMA DEVELOP`
- H2 en dos líneas [9753, 9756]: `Cuatro soluciones.` / `Un solo objetivo.`
- Subfrase [9773]: `Todo lo que tu negocio necesita para vender más, operar mejor y crecer sin contratar más gente.`
- Chips por servicio: label corto + `service.price` sin el sufijo ` USD` [9851]
- Separador [9858-9866] con el color de acento activo

## B.5 Claims cuantitativos — **para validar uno por uno**

Mismo criterio que se aplicó al "+47". Todo lo que sigue es una cifra que **se pinta en pantalla** y que un lector puede tomar como promesa. No juzgo si son verdaderas; las señalo para que se decidan.

### Grupo 1 — Promesas de la oferta (las más expuestas)

| Claim | Dónde | Contexto |
|---|---|---|
| `+340% consultas promedio` | `OurServices:72` | métrica del servicio Sitios; se pinta como badge en la barra del `StageFrame` (línea 521) **y** en el botón del cierre de diagnóstico |
| `94% respuesta automática` | `OurServices:90` | métrica del servicio IA |
| `23hs por semana ahorradas` | `OurServices:108` | métrica del servicio Automatización |
| `0 licencias mensuales` | `OurServices:126` | métrica del servicio Software |
| `$800 USD` / `$300 USD` / `$200 USD` / `$1.500 USD` | `OurServices:70, 88, 106, 124` | precios "DESDE" de los 4 servicios; también en los chips del header |
| `15 dias` / `7 dias` / `5 dias` / `entrega por etapas` | `OurServices:71, 89, 107, 125` | plazos de entrega |

### Grupo 2 — Claims dentro de las demos que se leen como afirmación de producto

| Claim | Dónde | Nota |
|---|---|---|
| `8.000× más rápido que un humano` | `OurServices:4854` | conclusión del bloque comparativo de `SimMétricas` |
| `1.8s` (IA) vs `4hs` (humano) | `OurServices:4787, 4826` | las dos cifras de las que sale el `8.000×` |
| `68%` — `Leads recuperados con follow-up automático` | `OurServices:5560, 5552` | stat destacado al final de `SimFollowUp` |
| `Captura automática · 24/7` | `OurServices:1540` | header de `SimLeads`; se lee como disponibilidad del producto |
| `+18% de conversión proyectada` | `OurServices:5888` | "Recomendación IA" dentro del reporte de ejemplo — embebido en datos ficticios, pero es una cifra de conversión |
| `Conversión 94%` | `OurServices:5360` | evento "Deal cerrado" del timeline de `SimFollowUp` |

### Grupo 3 — Cierre de diagnóstico

| Claim | Dónde |
|---|---|
| `4 areas` — `Presencia, IA, procesos y sistema` | `OurServices:9223` |
| `1 plan` — `Prioridad segun retorno real` | `OurServices:9224` |
| `0 relleno` — `Solo piezas que mueven ventas` | `OurServices:9225` |
| `Cuatro soluciones.` | `OurServices:9753` |

### Grupo 4 — Fuera del monolito

| Claim | Dónde | Nota |
|---|---|---|
| `76` DÍAS (agencias) vs `15` DÍAS (develOP) | `WhyDevelOP.tsx:448, 456` | contadores animados bajo "AGENCIAS TRADICIONALES / MESES DE BUROCRACIA" y "DIRECTO AL OBJETIVO". **Sin fuente citada en el repo.** El `15` coincide con el `timeline` del servicio Sitios |
| `+850` `LEADS GENERADOS` | `WhyDevelOP.tsx:828, 912` | contador animado del visual del tab "Ecosistema Rentable". Sin fuente |
| `Respondemos en menos de 4 horas en horario laboral` / `Respuesta < 4h · Lun-Vie 9-19hs ART` | `todo-incluido/data.ts:33, 35` | **es un SLA**, el claim con más consecuencia operativa de todo el censo |
| `$60` / `$80` / `$80` / `$150` USD/mes | `lib/data/premium-modules.ts:31, 45, 59, 74` | precios de los 4 módulos activos, renderizados en la card |
| `PRÓXIMAMENTE Q3 2026` | `ModulosOpcionales.tsx:487` | fecha comprometida públicamente |
| `una llamada de 30 minutos` | `PortalDemoCTA.tsx:7, 313` | en el copy visible **y** en el texto prellenado de WhatsApp |
| `Sin permanencia` · `Sin setup fee` · `Cancelás cuando quieras` | `PortalDemoCTA.tsx:9` | trust signals — son compromisos contractuales |
| `CASO REAL ✓` / `CLIENTES REALES` (plural) | `Portfolio.tsx:34, 435` | **hoy hay un solo proyecto real** en `REAL_PROJECTS` (Concesionaria San Miguel, `year: "2026"`) |
| `9 módulos disponibles` | `home/PortalDemo.tsx:1379` | archivo huérfano — el catálogo real tiene 8 (4 activos + 4 próximos) |

### Grupo 5 — Relleno de demo (**no** reusar como claim)

Todo lo que sigue es escenografía: números elegidos para que la animación se vea bien. Se listan para que nadie los levante por error al reescribir.

- **`SimSEO`/`SimAnalytics`:** `4.9 · 47 reseñas` [1078] · `1842` visitas [1140] · `247` sesiones [1141] · `3.2` conv. [1142] · trends `+12% / +8% / +0.4%` [1257-1259]
- **`SimLeads`:** `+54 381 555-1234` [1497] · `Recordatorio en 24hs` [1511]
- **`SimMaps`:** `7/9 zonas top 3` · `+41% llamadas` · `5.0 rating` [2272-2274] · `47 reseñas activas` [2341] · `47 vs 8` reseñas, `5.0 vs 3.4` rating, `7/9 vs 2/9` top 3 [2375-2377] · 28 pines de competidores rank #2-#5, rating 3.0-3.9 [1833-1876]
- **`SimChat`:** `$47.500 USD` / `$43.200 USD` (Hilux) [3098] · tiempos de respuesta `1.8s / 2.1s / 1.5s / 1.7s`
- **`SimLeadsIA`:** scores `94 / 61 / 22 / 82 / 48` · resumen `2 calientes, 2 tibios, 1 frío` [3948-3950]
- **`SimAgenda`:** `Turnos hoy: 5` · `Confirmados: 4` [4432, 4435]
- **`SimMétricas`:** `147` consultas · `139` respondidas · `97%` satisfacción [4628-4630]
- **`SimReporte`:** `$47.200` ventas · `23` nuevos clientes · `147` consultas · `34%` tasa de cierre [5572-5575] · `WhatsApp · 62%` [5837] · `3 destinatarios` · `Semana del 14 al 20 de Abril`
- **`SimSync`:** `2.3s` para 3 apps [6243]
- **`SimCRM`:** 18 deals entre `$1.500` y `$9.200`; probabilidad base por etapa `[33, 58, 78, 100]`
- **`SimDashboard`:** `$47.200` revenue · `23` clientes · `89%` retención · `↑ 18% vs mes anterior` [6864] · `94%` meta [6984]
- **`SimStock`:** stock `45/3/28/12` sobre mínimos `10/15/8/10` · `Orden #1847` · `Entrega: 48hs`
- **`SimEquipo`:** donut `45/25/18/12 %` · productividad `78%`
- **`placeholderConfigs`** [670-707] — **inalcanzable**, ni siquiera se pinta: `#3`, `1.8k`, `6.4%`, `2.4k`, `29%`, `4.1x`, `47`, `18`, `94%`, `9.2k`, `132`, `+21%`

## B.6 Escenografía narrativa de las demos

No son claims, pero son **decisiones de guion** que valen si se reescriben las secciones nuevas: cada panel cuenta una historia completa de un rubro concreto.

- **Web** → clínica odontológica en Tucumán que aparece #1 en Google, recibe un lead (`Carlos Mendoza`, consulta de precios) y lo derivan por WhatsApp en 5 pasos: `Lead capturado` → `WhatsApp enviado` → `IA clasificó intención` → `Equipo notificado` → `Seguimiento programado` [1507-1511].
- **IA** → concesionaria. Conversación completa de WhatsApp por una Hilux 4x4 que termina en test drive agendado para el jueves 11:00. Después: 5 leads calificados automáticamente, agenda sincronizada (`Recordatorio enviado`, `Calendario sincronizado`, `Cliente confirmado`, `Sin intervención humana` [4019-4022]) y dashboard de atención.
- **Automatización** → 9 eventos que narran la recuperación de un lead llamado María: `Consulta recibida` → `24hs sin respuesta` → `Follow-up automático enviado` → `Cliente responde` → `IA detecta intención` → `Lead reactivado` → `Vendedor notificado` → `Registro actualizado en CRM` → `Deal cerrado` [5286-5358]. Después: reporte semanal automático de los lunes 8:00 y sync de un formulario a 3 apps en 7 pasos.
- **Software** → pipeline con 18 empresas ficticias (`Clínica Norte`, `Café Central`, `Farmacia Centro`, `Panadería Sol`, `Gym Evolución`, `Taller RG`, `Óptica Visión`, `Hotel Jardín`, `Auto San Miguel`, `Distribuidora Sur`, `Spa Aurora`, `Constructora Lima`, `Rest. El Patio`, `Inmobiliaria Vega`, `Tienda Local`, `Logística Andina`, …) + dashboard ejecutivo + reposición de stock de un taller + control de un equipo de 4 (`Martin G.` ventas, `Laura S.` operaciones, `Carlos P.` técnico, `Sofía R.` marketing).

---

# C. Censo del resto de lo que muere

## C.1 `sections/todo-incluido/` — **BORRABLE limpio**

| Archivo | Líneas | Export | Lo importa |
|---|---|---|---|
| `TodoIncluido.tsx` | 336 | `TodoIncluido` | `page.tsx:16` (dynamic) → `:38` |
| `TodoIncluidoFeatureCard.tsx` | 184 | `TodoIncluidoFeatureCard` | solo `TodoIncluido.tsx:4` |
| `data.ts` | 56 | `type IncludedFeature`, `INCLUDED_FEATURES` | solo los dos archivos de arriba |

Internos: `PremiumToolsBackground` (44-270), `FeatureIcon` (44-61 de la card). Sin dependencias hacia `lib/`, `ui/`, `hooks/`. **Nadie de fuera de la carpeta importa nada.**

**Copy rescatable:**
- Eyebrow [289]: `TODO ESTO VIENE INCLUIDO EN TU PLAN`
- H2 [292-293]: `5 herramientas premium,` + `sin extras.`
- Bajada [296]: `Cuando contratás develOP, te llevás todo el portal. No es un upsell. No es "plan básico vs pro". Es lo que viene cuando trabajás con nosotros.`

Las 5 features (`data.ts`):

| Título | Descripción | Highlight |
|---|---|---|
| `Resultados en tiempo real` | `Tráfico, posicionamiento SEO, reseñas y velocidad del sitio. Todo conectado a las APIs reales de Google. No screenshots de Excel — datos vivos.` | `GA4 + Search Console + PageSpeed conectados` |
| `Tu proyecto, transparente` | `Cada tarea, cada hito, cada entrega. Aprobás cosas con un click sin tener que pedir un Zoom. La trazabilidad que tu negocio merece.` | `Cero Excels compartidos. Cero "¿en qué andamos?"` |
| `Comunicación con SLA real` | `Respondemos en menos de 4 horas en horario laboral. Tu equipo develOP siempre a un mensaje de distancia, sin ticket queue infinita ni bots que te ignoran.` | `Respuesta < 4h · Lun-Vie 9-19hs ART` |
| `Bóveda Digital encriptada` | `Tus credenciales (dominio, hosting, redes, APIs) guardadas con encryption AES-256. Nunca más vas a perder un acceso ni depender de "Juan que tenía la clave".` | `AES-256 + log de accesos auditable` |
| `Resumen ejecutivo IA` | `Cada semana, una IA analiza tus datos y te escribe en 2 oraciones qué pasó, qué mejoró y qué necesita atención. Para que no tengas que ser analista de datos.` | `Powered by Claude — el mejor LLM del mundo en español` |

## C.2 `sections/modulos-opcionales/` — **BORRABLE, pero su fuente de datos NO**

| Archivo | Líneas | Export | Lo importa |
|---|---|---|---|
| `ModulosOpcionales.tsx` | 505 | `ModulosOpcionales` | `page.tsx:17` → `:39` |
| `ModuloActiveCard.tsx` | 256 | `ModuloActiveCard` | solo `ModulosOpcionales.tsx:5` |
| `ModuloComingSoonCard.tsx` | 178 | `ModuloComingSoonCard` | solo `ModulosOpcionales.tsx:6` |

**Fuente de datos: `src/lib/data/premium-modules.ts`** (155 líneas). Exporta `PremiumModuleSeed`, `PREMIUM_MODULES_CATALOG` (8 módulos), `getActiveModules()`, `getComingSoonModules()`, `getModuleBySlug()`.

> ### 🔴 TRAMPA CRÍTICA
> `premium-modules.ts` **no es dato de marketing del home**. Se autodeclara *"SOURCE OF TRUTH del catálogo"* (líneas 17-19) y lo importa **`prisma/seeds/sync-premium-modules.ts:4`** (por ruta relativa, fuera de `src/`), que lo usa para **crear, actualizar y BORRAR filas de la tabla `PremiumModule`** de la base — incluyendo un `deleteMany` de módulos que ya no estén en el array, bloqueado solo si tienen `OrganizationModule` con status `ACTIVE`. **Vaciarlo o borrarlo junto con la sección del home rompe el pipeline de seeding de la DB de todo el portal.**
>
> Además hay **dos archivos con nombre casi idéntico**: `src/lib/data/premium-modules.ts` (catálogo estático, el que usa el home) y `src/lib/premium-modules.ts` (consultas Prisma, el que usa el portal vía `lib/recommendations/`). Están sincronizados **solo** por el script de seed. Confundirlos al editar rompe la sincronía **sin dar error de compilación**.

**Copy rescatable:**
- Eyebrow [442]: `Y CUANDO ESTÉS LISTO`
- H2 [445-446]: `Sumás módulos según lo que` + `necesite tu negocio.`
- Bajada [449]: `No vendemos suites infladas. Empezás con lo esencial y escalás cuando los datos te digan que es momento. Cada módulo es opcional, mensual y cancelable.`
- Labels de sección [462, 487]: `DISPONIBLES AHORA` · `PRÓXIMAMENTE Q3 2026`
- Tiers [48-50]: `OPERACIÓN` · `CRECIMIENTO` · `VERTICAL`

**Módulos activos (con precio visible):**

| Módulo | Descripción corta | Precio | Bullets (hardcodeados en `ModuloActiveCard`) |
|---|---|---|---|
| `Motor de Reseñas Automático` | `Generá reseñas positivas en Google y potenciá tu reputación sin seguimiento manual.` | $60/mes | Respuestas IA a reseñas nuevas en 1 click · Alertas de reseñas en tiempo real · Campañas automáticas para pedir reseñas |
| `Email Marketing Pro` | `Campañas, secuencias y newsletters profesionales conectadas a tu base de clientes.` | $80/mes | Templates drag-and-drop incluidos · Segmentación automática de tu base · Reportes de aperturas y clicks |
| `Agenda Inteligente 24/7` | `Tus clientes reservan turnos en cualquier momento sin idas y vueltas por WhatsApp.` | $80/mes | Reservas 24/7 sin intermediarios · Recordatorios automáticos por email y SMS · Sincronización con Google Calendar |
| `Tienda Online Conectada` | `Tu tienda online y tu panel hablando entre sí. Stock, ventas, abandonos: todo en un lugar.` | $150/mes | Stock y ventas de Tiendanube en tiempo real · Alertas de productos sin stock · Recuperación automática de carritos abandonados |

**Módulos "próximamente"** (la card **no** renderiza precio, aunque el catálogo lo tiene):

| Módulo | Descripción corta | Precio en catálogo (no visible) |
|---|---|---|
| `WhatsApp Autopilot` | `Tu negocio responde consultas, califica leads y agenda turnos por WhatsApp. Solo.` | $150 |
| `Facturación AFIP Automática` | `Generá facturas A, B y C desde tu panel. Sin Excel, sin contadores intermedios.` | $120 |
| `Cobranzas Automatizadas` | `Persigue cobros pendientes con secuencias de WhatsApp y email automáticas.` | $90 |
| `Reactivación de Clientes` | `Detecta clientes que dejaron de comprar y los recupera con campañas inteligentes.` | $90 |

**Incoherencias detectadas en el catálogo** (preexistentes, no causadas por la demolición):
- El comentario de `premium-modules.ts:82` dice `5 módulos en construcción` pero hay **4**; el `sortOrder` salta de 11 a 13 (falta el 12) y el grid de `ModulosOpcionales.tsx:489` sigue reservando `lg:grid-cols-5`. Indicios de un 5º módulo removido sin limpiar.
- El campo `longDescription` existe en los 8 módulos pero **ningún componente lo lee nunca**. El portal usa su propio diccionario hardcodeado `PRESET_MODULE_DETAILS` en `components/dashboard/PremiumModuleCard.tsx:59-76`. Editar el `longDescription` real no cambia nada de lo que ve el usuario.
- Bug ya documentado en `docs/baselines/2026-07-auditoria-seguridad.md:1619`: el catálogo escribe el slug `email-marketing-pro` pero `dashboard/modules/email-marketing/layout.tsx:20` consulta `email-marketing` — mismatch que hace que `isModuleActive` devuelva `false` siempre.
- `ModuloComingSoonCard.tsx:160` escribe `PR&Oacute;XIMAMENTE` como entidad HTML en el fuente. No se verificó en navegador si se decodifica o se muestra literal.

## C.3 `home/InfiniteReviews.tsx` + `ScrollingTextMarquee` — **BORRABLE limpio**

**493 líneas.** `ScrollingTextMarquee` **no es un archivo aparte**: es el nombre real del componente definido en la línea 249 de `InfiniteReviews.tsx`; `export const InfiniteReviews = ScrollingTextMarquee` (línea 490) es un alias, y también hay un `export default` (492). `page.tsx:19` usa el nombrado.

Internos: `TechnologyIcon` (139-180), `MarqueeSegment` (196-229).

**Es un `<section id="testimonials">` de 100vh con 4 capas de texto en marquee horizontal infinito** con profundidad 3D simulada, parallax de scroll y boost por velocidad. El loop es un `requestAnimationFrame` propio con medición por `offsetWidth` y wrap manual — sin `@keyframes` ni GSAP. Gateado por `IntersectionObserver` (`threshold: 0`, línea 273).

> ### ⚠ El nombre miente
> **No contiene ninguna review, testimonio, nombre de cliente ni cargo.** El contenido es una lista fija de palabras de capacidad intercaladas con iconos de stack. Cualquier plan que asuma que aquí hay testimonios reales parte de una premisa falsa.

**Contenido completo** [41-55]: `RESULTADOS` · `PRECISIÓN` · `ESCALA` · `INGENIERÍA` · `CREATIVIDAD` · `INNOVACIÓN` · `ARQUITECTURA` · `PERFORMANCE`, intercaladas con iconos de `React`, `TypeScript`, `Next.js`, `Node.js`, `Tailwind CSS`, `PostgreSQL`. `aria-label` de la sección [342]: `Capacidades técnicas de develOP`.

Cero imports hacia `lib/`, `ui/`, `hooks/`. El `setProperty` de la línea 295 opera sobre su propio `sectionRef`, **no** sobre `document.documentElement` — no hay efecto global que sobreviva al borrado. El `id="testimonials"` no está referenciado por ningún nav ni anchor en todo `src/`.

## C.4 `sections/portal-demo-cta/PortalDemoCTA.tsx` — **BORRABLE limpio**

**395 líneas.** Export único `PortalDemoCTA` (234), sin default. Lo importa solo `page.tsx:18` → `:40`.
Internos: `FinalCtaBackground` (58-232), `WhatsAppButton` (361-394).

**Copy completo:**
- Eyebrow [295]: `VAMOS A CONOCERNOS`
- H2 [302, 305]: `Tu negocio puede operar` + `como uno premium hoy mismo.` *(el segundo con gradiente cyan→sky→blue)*
- Bajada [313-314]: `Te mostramos el portal en una llamada de 30 minutos sin compromiso. Si lo querés, arrancamos esa misma semana.`
- CTA 1 [391]: `Coordinemos una llamada por WhatsApp`
- CTA 2 [340]: `Quiero ver el portal solo` → `/login`
- Trust signals [9]: `Sin permanencia` · `Sin setup fee` · `Cancelás cuando quieras`
- Texto prellenado de WhatsApp [7]: `¡Hola, develOP! Vi su landing y me interesa el portal develOP para mi negocio. ¿Podemos coordinar una llamada de 30 minutos?`

**Detalle de patrón:** el número sale de `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER`; si falta, cae a `mailto:hola@develop.com.ar` (línea 238). Los demás CTAs del sitio (`WebDevelopmentCta`, `SoftwareDevelopmentCta`, `CtaIA`, `CtaAutomation`, `VaultAutomation`) caen a un número hardcodeado `5493816223508`. Es una divergencia de patrón, no una dependencia rota.

## C.5 `home/WhyDevelOP.tsx` — **BORRABLE en imports, TRAMPA en el tema**

**1.726 líneas** — el segundo más grande. Export único `WhyDevelOP`. Lo importa `page.tsx:12` (dynamic, `ssr: true`) → `:41`. **26 componentes internos**, todos privados (`BrandLogoMark`, `useIsMobileViewport`, `useHydratedReducedMotion`, `useCardSpotlight`, `AgencyComparisonVisual`, y ~20 funciones `*Visual`).

Estructura: `<section id="caracteristicas">` con **3 tabs que auto-avanzan cada 17 s** (`AUTO_ADVANCE_MS = 17_000`, línea 140). Cada tab = una `FeaturedCard` grande con visual propio + 4 `SecondaryCard`. Todo el contenido vive en el array `TABBED_DIMENSIONS` (líneas 210-334).

**Llama `useThemeSection(isInView, 'dark')` en la línea 1578 — ver §D.4, es la trampa más grave del censo.**

**Copy completo (`TABBED_DIMENSIONS`):**

**Tab 1 — `La Anti-Agencia`** *(signal: `Velocidad operativa`)*
- Resumen [213]: `Velocidad real, decisiones directas y un delivery qué evita la fricción comercial de una agencia tradicional.`
- Título [218]: `Software de élite. Sin la burocracia de las agencias.`
- Support [219]: `Ejecución sin fricción.`
- Texto [220]: `develOP opera como un equipo de ingeniería puro, eliminando burocracia para entregar software de élite en tiempo récord.`
- Cards: `Velocidad Absoluta` — `Sistemas operativos y webs listas en semanas, no en semestres.` · `Cero Costos Ocultos` — `Precios cerrados desde el día 1. Sin sorpresas, sin licencias mensuales abusivas.` · `Soporte Directo` — `Hablas directamente con los ingenieros (nosotros). Cero intermediarios.` · `Propiedad Total` — `El código, el diseño y los datos son 100% tuyos. No te atamos a nuestras plataformas.`

**Tab 2 — `Ecosistema Rentable`** *(signal: `ROI estructural`)*
- Resumen [254]: `No entregamos una web aislada: diseñamos una infraestructura qué captura, automatiza y convierte como un sistema.`
- Título [259]: `Tu negocio no necesita una web, necesita un ecosistema.`
- Support [260]: `Arquitectura orientada a conversión.`
- Texto [261]: `Conectamos adquisición, operación y conversión para qué cada pieza trabaje en cadena. Menos silos, más retorno visible sobre la inversión.`
- Cards: `Retorno de Inversión` — `Cada módulo está diseñado para recuperar inversión con procesos qué generan ventas.` · `Operación 24/7` — `El sistema captura leads, responde y ejecuta incluso cuándo tu equipo está offline.` · `Escalabilidad Técnica` — `La arquitectura crece por capas sin rehacer lo qué ya funciona ni frenar la operación.` · `Control Total` — `Visibilidad en tiempo real sobre funnels, performance y puntos críticos desde un mismo tablero.`

**Tab 3 — `La Ventaja IA`** *(signal: `Tecnología injusta`)*
- Resumen [295]: `Llevamos IA a procesos comerciales y operativos concretos para ejecutar más rápido y decidir con datos vivos.`
- Título [300]: `Mientras tu competencia usa Excel, nosotros implementamos IA.`
- Support [301]: `Procesamiento de datos en tiempo real.`
- Texto [302]: `Diseñamos capas de IA qué responden, ordenan, califican y optimizan sin sumar caos. Más throughput, menos tareas repetitivas y una ventaja qué se siente desde la operación.`
- Cards: `Agentes Inteligentes` — `Bots y asistentes entrenados para responder, clasificar y ejecutar con contexto.` · `Reducción de Tareas` — `Quitamos carga repetitiva del equipo para liberar tiempo estratégico y comercial.` · `Decisiones con Data` — `Métricas vivas y señales automáticas para decidir con contexto, no con intuición.` · `Vanguardia Tech` — `Integramos stacks y modelos de frontera antes de qué se vuelvan estándar del mercado.`

**Microcopy del visual comparativo:** `AGENCIAS TRADICIONALES` / `MESES DE BUROCRACIA` [494, 497] con los pasos `Ida y Vuelta`, `Reuniones`, `Cambios`, `Aprobación` y las pills `Procesos Rígidos`, `Alta Dependencia`, `Costos Ocultos` — contra `DIRECTO AL OBJETIVO` [572] con `Prototipo`, `Deploy`, `Go Live` y `Iteración Rápida`, `Sin intermediarios`, `Despliegue Continuo`.

> **Nota de redacción:** el archivo usa sistemáticamente **`qué` y `cuándo` con tilde en función de conjunción** (`un delivery qué evita`, `incluso cuándo tu equipo está offline`, `lo qué ya funciona`, `antes de qué se vuelvan estándar`). Aparece en las 3 pestañas. Se transcribe tal cual; corregirlo es decisión de Franco.

## C.6 `home/About.tsx` — **BORRABLE en imports, TRAMPA en el tema y en el ancla**

**528 líneas.** Export único `const About` (522). **Es el único componente del home con import estático** (`page.tsx:8`, no `dynamic`) → renderizado en `page.tsx:26`, arriba del fold junto al Hero.
Internos: `AvatarPlaceholder`, `TeamMemberMobile`, `TeamMemberDesktop`, `HighlightGlyph`, `DigitalHighlight`, `AnimatedLocationBadge`, `LocationBadge`, `AboutLogoFilter`, `AboutLogoMark`, `AboutMobile` (392-448), `AboutDesktop` (450-520).

Estructura: `<section id="about">` que monta **simultáneamente** `AboutMobile` (`md:hidden`) y `AboutDesktop` (`hidden md:block`) — ambos en el DOM, alternados solo por CSS. Cada uno es un scrollytelling horizontal de 400vh con 4 paneles: el logo materializándose (`feTurbulence` + `feDisplacementMap`), el copy de posicionamiento, y 2 tarjetas de equipo.

**Llama `useThemeSection(isInView, 'light')` dos veces (líneas 402 y 461) — ver §D.4.**

**Copy completo:**
- Logo [381, 384]: `SOMOS` + `develOP` *(envueltos en `KineticText`)*
- Headline [422-426 mobile / 496-500 desktop]: `No somos una agencia más.` / `Somos el` / **`equipo técnico que tu empresa necesitaba.`** *(el último resaltado con `DigitalHighlight`)*
- Bajada [430 / 504]: `Combinamos desarrollo web, inteligencia artificial y automatizaciones para que tu negocio crezca sin depender de vos todo el tiempo.`
- Badge de ubicación [245, 280]: `Tucumán, Argentina - trabajamos con clientes de todo el país`

**Equipo (`teamMembers`, líneas 24-41):**

| Rol | Descripción |
|---|---|
| `Co-Founder & Lead Developer` | `Desarrollo web, IA y arquitectura de sistemas. Convierto ideas de negocio en productos digitales que funcionan solos.` |
| `Full Stack & Automatizaciones` | `Backend, bases de datos y flujos de automatización. Hacemos que los sistemas trabajen solos.` |

> ### Bug de encoding — **ya arreglado en `fix/home-sanidad`, todavía vivo en `main`** [verificado en esta sesión]
>
> La tercera rama de `LocationBadge` (línea 294, la que se usa cuando se llama sin props) tiene el texto **mojibake**: `TucumÃ¡n, Argentina - trabajamos con clientes de todo el paÃ­s`. Y `AboutMobile` llama `<LocationBadge />` **sin props** (línea 433) — o sea que **es esa rama corrupta la que se renderiza en mobile**. `AboutDesktop` (línea 507) pasa `active={...}` y obtiene el texto correcto.
>
> El commit **`fe099b9`** (`fix(home): sanidad de copy, lang, meta y carga del hero 3D`, en `fix/home-sanidad`) corrige exactamente esa línea → `Tucumán, Argentina — trabajamos con clientes de todo el país` (con guion largo, además). Es el **único** cambio de ese commit sobre `About.tsx`. Sigue presente en `main` porque esa rama no está mergeada.
>
> No verificado en navegador — la conclusión de que es la rama mobile la que se rompe es lectura estática de qué props recibe cada llamada.

**Sin cifras de negocio.** No hay años de experiencia, cantidad de proyectos ni porcentajes en todo el archivo.

## C.7 `home/Portfolio.tsx` — **⚠ NO es un borrado limpio**

**735 líneas.** Export `Portfolio` (725). **Dos importadores:**
- `src/app/page.tsx:13` (dynamic) → `:27` — el home
- **`src/app/web-development/page.tsx:19` (import estático) → `:245`** — **la landing de producto, que sobrevive**

Verificado que las otras 3 landings (`process-automation`, `software-development`, `ai-implementations`) **no** lo usan. `Portfolio.tsx` es autocontenido (no toca `useTheme`/`ThemeProvider`/`HomeWrapper`), así que funciona standalone en esa landing. **Un borrado ingenuo rompe el build de `/web-development`.**

Internos: `BgPattern`, `RealProjectCard`, `DemoCard`, `SectionSeparator`, `Disclaimer`, `PortfolioDesktop`, `MobileCard`, `PortfolioMobile`. Renderiza `id="portfolio"` (línea 726) — ancla del Navbar.

**Contenido:**

*Proyecto real* (`REAL_PROJECTS`, líneas 26-41 — **hoy hay uno solo**):
> **`Concesionaria San Miguel`** · `AUTOMOTIVE — TUCUMÁN` · `year: "2026"` · badge `CASO REAL ✓`
> `Sitio web corporativo con catálogo de vehículos 0km y usados, formulario de consultas inteligente y panel de administración de leads para el equipo de ventas.`

*Demos por rubro* (`DEMO_PROJECTS`, líneas 43-99):

| Demo | Rubro | Descripción |
|---|---|---|
| `Clínica Médica` | `SALUD` | `Turnos online + recordatorios WhatsApp + panel del staff.` |
| `Gimnasio` | `FITNESS` | `Membresías, clases y bot de consultas 24/7.` |
| `Restaurante` | `GASTRONOMÍA` | `Menú QR, reservas y reseñas automáticas en Google.` |
| `Inmobiliaria` | `REAL ESTATE` | `Portal de propiedades con CRM y seguimiento de leads.` |
| `Portal SaaS develOP` | `PRODUCTO PROPIO` | `Dashboard para clientes con métricas, proyectos y chat.` |

*Chrome:* `develOP — PORTAFOLIO` / `NUESTROS` `TRABAJOS` / badge `CLIENTES REALES` [420-435] · `CAPACIDADES develOP` / `DEMOS` `POR RUBRO` / badge `DEMO CONCEPTS` [460-476] · `— DEMOS Y CONCEPTOS —` / `Propuestas desarrolladas para mostrar capacidades en diferentes rubros` [373, 378]
*Disclaimer* [386]: `Los demos son propuestas conceptuales desarrolladas por el equipo develOP para ilustrar capacidades. No representan clientes reales.`

## C.8 `home/PortalDemo.tsx` — **HUÉRFANO CONFIRMADO** ✅ **[verificado en esta sesión]**

**1.657 líneas.** Export `PortalDemo` (948). **`importedBy: []`.**

Verificación: grep de `home/PortalDemo`, `sections/home/PortalDemo`, imports relativos a `./PortalDemo` y del identificador `PortalDemo` en todo `src/` → la única coincidencia de esta ruta es su propia declaración. `page.tsx:15` importa `@/components/sections/portal-demo/PortalDemo`, que es **un archivo distinto en otra carpeta**. Los dos son completamente independientes entre sí: datos, iconos y componentes propios, cero imports cruzados.

**Ya está desconectado del home hoy, antes de tocar nada.** No hay trampa que gestionar: es basura muerta preexistente. Solo aparece mencionado en docs (`bitacora-roadmap.md`, auditorías).

Internos: `BrowserMockup`, `MockScreenContent`, `SkeletonRow(s)`, `ScreenAnalytics`, `ScreenAI`, `ScreenProject`, `ScreenMessages`, `ScreenVault`, `ScreenAutomation`.

**Contenido rescatable** (vale la pena mirarlo antes de tirarlo — tiene copy que no está en ningún otro lado):
- Headline [1078-1081]: `Tu negocio,` / `bajo control total.` · badge [1059]: `Incluido en todos los proyectos`
- Bajada [1099-1102]: `Cada cliente de develOP tiene su propio panel de control. Métricas, proyectos, mensajes y automatizaciones.` + `Todo en un solo lugar, desde el celular.`
- 6 features del portal: `Métricas en tiempo real` · `Resumen ejecutivo con IA` · `Estado de tu proyecto` · `Comunicación directa` · `Bóveda digital` · `Automatizaciones activas` (con sus descripciones, líneas 40-81)
- Sección de módulos [1359-1370]: `MÓDULOS ADICIONALES` / `Desbloqueás lo que necesitás,` `cuando lo necesitás.` · [1508] `ACTIVABLE DESDE TU PANEL`
- CTA final [1567-1585]: `DEMO EN VIVO` / `¿Querés ver cómo quedaría para tu negocio?` / `Acceso inmediato · Sin registrarte · Sin costo` / `Ver demo en vivo →`

**Incoherencias internas** (razones para no reciclar el copy tal cual): dice `9 módulos disponibles` [1379] y `+5 módulos más disponibles — Agenda Inteligente, Social Media Hub, E-commerce y más` [1522], pero `E-commerce` ya está entre los 4 que muestra arriba. Sus 4 `PREMIUM_MODULES` (`$150` WhatsApp Autopilot, `$120` SEO Avanzado, `$80` Mini-CRM, `$300` E-commerce) **no coinciden** con el catálogo real de `lib/data/premium-modules.ts`. Su CTA apunta a `/login`, el del PortalDemo vivo apunta a `/contact`.

## C.9 `sections/portal-demo/` — **NO MUERE: se re-estiliza**

| Archivo | Líneas | Export | Lo importa |
|---|---|---|---|
| `PortalDemo.tsx` | 293 | `PortalDemo` (277) | `page.tsx:15` (dynamic) → `:35`, dentro de `<SectionWrapper>` |
| `PortalDemoHeader.tsx` | 45 | `PortalDemoHeader` (7) | `PortalDemo.tsx:4` → `:284` |
| `StoryArcLunes.tsx` | 60 | `StoryArcLunes` (9) | `PortalDemo.tsx:5` → `:287` |
| `StoryMomentCard.tsx` | 382 | `StoryMomentCard` (362) | `StoryArcLunes.tsx:5` → `:53` |
| `data.ts` | 67 | `type StoryMoment`, `STORY_MOMENTS`, `STORY_ICONS` | `StoryArcLunes.tsx:4`, `StoryMomentCard.tsx:5` |

**Estructura:** `PortalDemo` = `DashboardStoryBackground` (SVGs/gradientes, sin copy) + `PortalDemoHeader` + `StoryArcLunes` + `PortalDashboardCta`. `StoryArcLunes` mapea `STORY_MOMENTS` → un `StoryMomentCard` por momento, en columna con gaps grandes. `StoryMomentCard` es un grid de 2 columnas que alterna lado según índice par/impar: `TextColumn` (del prop) + `ScreenshotCard` → `DashboardMockup`, que según `moment.id` elige entre `HealthScoreMockup`, `AttentionMockup` o `WeekResultsMockup`.

Su `<section>` **no tiene `id`** (línea 279) — no es target de ningún ancla. Sin imports hacia `lib/`, `ui/`, `hooks/`. Sus únicas dependencias son npm + los imports relativos entre sí.

**Fuente de datos `data.ts` — transcripción completa:**

**Momento 1 · `health-score`** — badge `Apenas llegás al trabajo`
- Pregunta: `¿Cómo arrancó la semana mi negocio?`
- Panel muestra: `Tu Health Score. Un solo número del 0 al 100 que te dice si la semana viene bien, normal o necesita atención. Sin Excel. Sin contadores. Sin reuniones de 30 minutos para entender qué pasa.`
- Decisión: `Hoy 78 — semana normal. Cerrás el panel tranquilo y arrancás el día.`
- Resultado: `Ahorrás 15 minutos cada mañana entendiendo el estado del negocio.`

**Momento 2 · `attention-stack`** — badge `Ya tomaste el café`
- Pregunta: `¿Qué necesita mi atención AHORA y qué puede esperar?`
- Panel muestra: `Tu Atención Hoy. develOP filtró los 14 mails, 8 mensajes y 3 alertas que te llegaron y te muestra solo lo crítico: "1 entrega del proyecto espera tu aprobación" y "2 reseñas de Google necesitan respuesta en 48h".`
- Decisión: `Aprobás la entrega con 1 click. Las reseñas las dejás para después de almuerzo.`
- Resultado: `Tu día deja de manejarte. Vos manejás tu día.`

**Momento 3 · `week-results`** — badge `Antes de la primera reunión`
- Pregunta: `¿Cuánto generamos esta semana? ¿Cómo venimos vs el mes pasado?`
- Panel muestra: `Resultados de la Semana. 47 leads nuevos (+12% vs semana pasada). 8 ventas cerradas. $340K facturados. Comparativa contra mes anterior. Y el resumen ejecutivo lo escribió la IA en 2 oraciones.`
- Decisión: `Lo copiás y se lo mandás a tu socio por WhatsApp. Conversación de negocio en 30 segundos.`
- Resultado: `Decisiones basadas en datos, no en sensaciones.`

**Header** [17-40]: `Así funciona tu negocio con develOP` / `Un lunes a la mañana,` `abrís tu panel develOP.` / `No es un dashboard más. Es un copiloto que te dice qué pasó, qué necesita atención y qué decisión tomar. En segundos.`
**CTA** [268]: `Quiero saber más sobre el dashboard` → `/contact`

**Dos cosas a saber antes de re-estilizarlo:**
1. **Los mockups no leen `data.ts`.** `HealthScoreMockup`, `AttentionMockup` y `WeekResultsMockup` tienen sus propios números hardcodeados (`78/100`, `82/74/79`, `['14 mails','8 mensajes','3 alertas']`, `['Leads','47','+12%']`, `['Ventas','8','+3']`, `['Facturado','$340K','+18%']`). **Coinciden con `data.ts` por copia manual, no por acoplamiento.** Cambiar `data.ts` no cambia los mockups.
2. **El selector de mockup es por string sin tipo.** `StoryMomentCard.tsx:227-229` compara `moment.id === 'health-score' | 'attention-stack' | 'week-results'`, pero `StoryMoment.id` es solo `string` (`data.ts:2`). Renombrar un id deja ese momento **sin mockup, sin error de compilación**.
3. **Campos muertos:** `data.ts` declara y puebla `screenshotPath` y `screenshotAlt` (líneas 9-10, 27-28, 43-44, 59-60) y exporta `STORY_ICONS` (66) — **ningún consumidor los lee**.

---

# D. Dependencias compartidas y trampas de demolición

## D.1 Componentes UI compartidos

| Componente | Dónde vive | Quién lo importa | Veredicto |
|---|---|---|---|
| `TypewriterText` | `ui/TypewriterText.tsx:14` | `layout/Hero.tsx:14` (HOME, sobrevive) · `sections/AIBentoGrid.tsx:5` — **pero `AIBentoGrid` es huérfano** | **NO TOCAR** — lo usa el Hero |
| `KineticText` | `ui/KineticText.tsx:5` | **solo `About.tsx:6`** (usos en 380, 386) | **QUEDA HUÉRFANO** al borrar `About.tsx` |
| `MagneticCta` | `ui/buttons/MagneticCta.tsx:51` | `layout/Hero.tsx:15` (2 usos) · `web-development/page.tsx.bak` (archivo `.bak`, no compila) | **NO TOCAR** — lo usa el Hero. El `page.tsx` real de web-development usa `ChargeTraceButton`, no este |
| `IntroLockupText` | `ui/IntroLockupText.tsx:183` | `layout/Hero.tsx:13` (HOME) · `ui/MarketingIntro.tsx:12` (LANDINGS) · `ui/Preloader.tsx:11-16` **solo importa constantes de timing**, no renderiza el componente | **NO TOCAR** — compartido home + landings |
| `LogoStrokeOverlay` | `ui/LogoStrokeOverlay.tsx:58` | `layout/Hero.tsx:12` (HOME) · `ui/MarketingIntro.tsx:11` (LANDINGS) | **NO TOCAR** — compartido |
| `HeroArtifact` | `3d/HeroArtifact.tsx:14` | **solo `layout/Hero.tsx:10`** | **🔒 FROZEN** por `CLAUDE.md`. Las demás menciones son comentarios que dicen explícitamente que no lo tocan |
| `DotMatrix` / `DotMatrixMesh` | `canvas/DotMatrix.tsx:54, 209` | `DotMatrix` (con Canvas): `login/page.tsx:11`, `forgot-password/page.tsx:9`, `accept-invite/InviteBackground.tsx:6` · `DotMatrixMesh` (mesh cruda): `ui/BrandedIntroCanvas.tsx:16` (LANDINGS), `layout/Hero.tsx:11` (HOME) | **NO TOCAR** — el de más consumidores del censo |
| `NoiseOverlay` | `ui/NoiseOverlay.tsx:3` | **solo `app/layout.tsx:5`** → `:73` | **🔒 LAYOUT GLOBAL** — afecta toda la app |
| `CustomCursor` | `ui/CustomCursor.tsx:13` | **solo `app/layout.tsx:4`** → `:72` | **🔒 LAYOUT GLOBAL** |
| `Preloader` | `ui/Preloader.tsx:60` | **solo `app/layout.tsx:43`** → `:86` | **🔒 LAYOUT GLOBAL.** Nota: el archivo *frozen* de `CLAUDE.md` es `context/PreloaderContext.tsx`, no este componente |
| `MarketingIntro` | `ui/MarketingIntro.tsx:65` | **solo `ui/Preloader.tsx:10`** → `:302-303`, bajo `shouldRunMarketingIntro(pathname)` | **EXCLUSIVO DE LANDINGS.** Por diseño **nunca corre en home** (`marketing-routes.ts:6`: *"jamás home/auth/portal"*) |
| `BrandedIntroCanvas` | `ui/BrandedIntroCanvas.tsx:100` | **solo `ui/MarketingIntro.tsx:10`** → `:321-327` (solo desktop) | **EXCLUSIVO DE LANDINGS**, totalmente desacoplado del home |

**Conclusión de D.1:** de los 12 componentes listados, **el único que queda huérfano al demoler el home es `KineticText`**. Todos los demás los sostiene `Hero.tsx` (que sobrevive), el layout global, o las landings de producto.

**Huérfanos preexistentes encontrados de paso** (nadie los importa, hoy, independientemente de este sprint):
`sections/AIBentoGrid.tsx` · `sections/ROICalculator.tsx` **[verificado en esta sesión]** · `sections/AIPipelineSection.tsx` (sin árbol de import confirmado) · `layout/SectionTransition.tsx` · `lib/design-patterns.ts` · `lib/cn.ts` (duplicado exacto de `lib/utils.ts`; los 76 consumidores reales importan de `utils`) · los tres `page.tsx.bak` de `web-development`, `process-automation` y `software-development`.

## D.2 `lib/`, `hooks/`, `context/` y fuentes de datos

| Módulo | ¿Lo toca lo que muere? | Veredicto |
|---|---|---|
| `context/TransitionContext.tsx` | Sí — `OurServices.tsx:44` | **🔒 FROZEN + SIGUE EN USO.** 10 importadores: `layout.tsx`, `Shutter`, `DynamicDock`, `Navbar`, 3 archivos de portales, `Step5Review` del chatbot |
| `layout/SmoothScroll.tsx` (`useLenis`) | Sí — `OurServices.tsx:43` | **SIGUE EN USO.** Envuelve toda la app desde `layout.tsx:41`; además `MarketingIntro`, `Hero`, y el propio `TransitionContext` dependen de él |
| `hooks/useThemeObserver.tsx` | Sí — `WhyDevelOP.tsx:40`, `About.tsx:5` | **SIGUE EN USO** como módulo (`ThemeProvider` en `page.tsx:2`, `useTheme` en `HomeWrapper.tsx:4`) **pero su función se rompe** → §D.4 |
| `ui/KineticText.tsx` | Sí — `About.tsx:6` | **QUEDA HUÉRFANO** |
| `lib/data/premium-modules.ts` | Sí — los 3 de `modulos-opcionales/` | **SIGUE EN USO — CRÍTICO.** Alimenta `prisma/seeds/sync-premium-modules.ts` + 3 archivos del portal |
| `todo-incluido/data.ts` | Sí — solo dentro de su carpeta | **BORRABLE** con la carpeta |
| `lib/home-routes.ts` | **No** | SIGUE EN USO — `ui/Preloader.tsx` |
| `lib/marketing-routes.ts` | **No** | SIGUE EN USO — `MarketingIntro`, `useChromeRevealed`, `Preloader` |
| `lib/design-tokens.ts` | **No** | SIGUE EN USO — exclusivo de portales (4 archivos) |
| `lib/motion-variants.ts` | **No** | SIGUE EN USO — 14 importadores, todos portales |
| `lib/chromeReveal.ts` | **No** | SIGUE EN USO — `LogicCompanion`, `DynamicDock` |
| `lib/hover.ts` | **No** | SIGUE EN USO — 41 importadores, casi todos portales |
| `lib/logo-footprint.ts` | **No** | SIGUE EN USO — `BrandedIntroCanvas`, `IntroLockupText`, `LogoStrokeOverlay` |
| `lib/use-reduced-motion.ts` | **No** | SIGUE EN USO — 25 importadores |
| `lib/utils.ts` (`cn`) | **No** | 🔒 76 importadores repo-wide |
| `lib/design-patterns.ts`, `lib/cn.ts` | **No** | **HUÉRFANOS YA** — preexistentes, ajenos a este sprint |
| `context/PreloaderContext.tsx` | **No** (0 matches) | **🔒 FROZEN**, 8 importadores |
| `src/hooks/` | — | El único archivo de la carpeta es `useThemeObserver.tsx` |

**Nada de `lib/` queda huérfano por esta demolición.** El único huérfano nuevo en todo el árbol de dependencias es `ui/KineticText.tsx`.

## D.3 CSS global — `src/app/globals.css` (371 líneas)

De los ~19 `@keyframes` y ~15 clases/tokens custom:

**BORRABLE — solo lo usa lo que muere (2 pares):**

| Regla | Líneas | Único usuario |
|---|---|---|
| `.about-logo-materialize` + `.is-active` + `@keyframes aboutLogoMaterialize` | 122-130, 142-162 | `About.tsx:349-372` |
| `.about-logo-shadow` + `.is-active` + `@keyframes aboutLogoShadowMaterialize` | 132-140, 164-179 | `About.tsx:360-365` |

> ⚠ El acoplamiento es **por template string en `className`**, no por import. Borrar `About.tsx` deja este CSS muerto **sin ningún error de compilación**.

**DESCONECTAR DEL HOME — lo usa algo que sobrevive:**
`--animate-shine` + `@keyframes shine` (dashboard: `LeakMeter`, `UpsellCard`, `UsageMeter`) · `--animate-pulse-slow` (`LeakMeter`) · `@keyframes shimmer` (`ui/LoadingState.tsx`, importado por 36 archivos de portal) · `@property --angle` + `@keyframes rotate-border` + `.animate-border-spin` (`MagneticCta`, usado por el Hero) · `@keyframes spin` y `@keyframes pulse` (nombres que colisionan con los defaults de Tailwind; `animate-spin`/`animate-pulse` se usan en 60+/38+ archivos) · `@keyframes ringPulse`, `amberShift`, `moveHand`, `ringPulseAmber` (landings `/process-automation` y `/ai-implementations`) · `@keyframes cursorBlink` (`WebDevelopmentSeo`, landing `/web-development`) · `.chat-messages-area` + scrollbar (widget de chat)

**HUÉRFANOS YA — sin usuarios hoy, antes de tocar nada:**
tokens `--width-hero-left` / `--width-hero-right` (solo en un `.bak`) · `--color-metric-bg` · `.animate-shimmer` (la clase; el keyframe sí se usa, pero vía sintaxis arbitraria) · `.animate-admin-alert` + `@keyframes adminAlert` · **los 6 selectores `admin-*`** (`.admin-surface`, `.admin-table`, `.admin-input`, `.admin-label`, `.admin-btn-primary`, `.admin-btn-secondary`, líneas 182-283 — un design-system de panel admin que nunca se conectó; los componentes reales de `/admin` usan Tailwind utilitario) · `@keyframes floatMetric` · `errorPulse` · `chevronAmber` · `rotateSlow` · `floatLabel` · `breathe`

**Duplicación sistemática detectada:** varios keyframes de las landings de automation/IA/web están **declarados dos veces** — una en `globals.css` y otra dentro de un `<style>` plano en el propio componente (`HeroAutomation.tsx` redeclara `pulse`, `moveHand`, `amberShift`, `chevronAmber`, `ringPulseAmber`; `PipelineIA.tsx` redeclara `ringPulse`; `WebDevelopmentSeo.tsx` redeclara `cursorBlink`). No se pudo determinar por lectura estática cuál gana la cascada. **Excepción:** `FlujoAutomation.tsx:776` usa `ringPulseAmber` **sin** declarar copia local — es el único que plausiblemente depende de la definición global.

**Otro CSS del repo:** `modules/chatbot/components/avatar/LegacyNeuroAvatarAdapter.module.css` — CSS Module del avatar del chatbot, ajeno al home.

## D.4 Trampas explícitas

### 🔴 TRAMPA 1 — El sistema de tema del home muere con `About` y `WhyDevelOP` **[verificado en esta sesión]**

`ThemeProvider` está montado **solo** en `page.tsx:23` y corre `document.documentElement.setAttribute('data-theme', theme)` (`useThemeObserver.tsx:18-21`), que alimenta las variables `[data-theme='light']` / `[data-theme='dark']` de `globals.css:27-38`, que fijan `body { background-color: var(--color-void); color: var(--color-obsidian) }` (`globals.css:40-42`, transición 0.6 s). `HomeWrapper.tsx:7-14` además anima su propio `bgColor`/`textColor` leyendo el mismo `theme`.

Grep de `useThemeSection` en todo `src/` devuelve exactamente **tres consumidores**:

| Archivo | Llamada | Estado |
|---|---|---|
| `About.tsx:402` y `:461` | `useThemeSection(isInView, 'light')` | **muere** |
| `WhyDevelOP.tsx:1578` | `useThemeSection(isInView, 'dark')` | **muere** |
| `layout/SectionTransition.tsx:20` | `useThemeSection(isInView, 'dark')` | **ya huérfano** — nadie importa ese archivo |

**Al borrar `About` y `WhyDevelOP`, `theme` queda congelado en `'light'` (el default del `useState`) para siempre mientras se esté en `/`.** Ni el `data-theme` del `<html>` ni el bg/color de `HomeWrapper` vuelven a cambiar con el scroll. No crashea — es una regresión silenciosa del único mecanismo de inversión de tema del sitio.

*El grado de impacto visual no está verificado en navegador:* la mayoría de las secciones del home usan `bg-black`/`bg-[#030303]` inline, que taparían el `body`. Cuánto se nota es una pregunta abierta.

### 🔴 TRAMPA 2 — El Navbar y el chatbot linkean a anclas que mueren **[verificado en esta sesión]**

| Ancla | Definida en | ¿Sobrevive? | Quién la referencia |
|---|---|---|---|
| `#inicio` | `layout/Hero.tsx:493` | ✅ **sí** | `Navbar.tsx:26, 56` · `DynamicDock` |
| `#nosotros` | `About.tsx:411` **y** `:471` | ❌ muere | `Navbar.tsx:27, 57` · `TransitionContext` · **chatbot `navigateToPage.ts:20, 48`** |
| `#portfolio` | `Portfolio.tsx:726` | ❌ muere | `Navbar.tsx:28, 58` (`HASH_TO_LABEL`, usado por `getActiveTab`) |
| `#servicios` | `OurServices.tsx:9632` | ❌ muere | `Navbar.tsx:29, 59` · **`TransitionContext:28, 41` (caso especial)** · **chatbot `navigateToPage.ts:23, 51`** |
| `#caracteristicas` | `WhyDevelOP.tsx:1604` | ❌ muere | `Navbar.tsx:30, 60` · **`TransitionContext:28, 41` (caso especial)** |

Consecuencias concretas:
- **`MAIN_NAV_ITEMS` (`Navbar.tsx:25-32`) queda con 1 de 5 anclas vivas.** El menú mobile llama `triggerTransition(item.href)`; sin el id, `document.getElementById` devuelve `null`, la función no hace nada y el menú se cierra solo, sin scroll. **No crashea, pero el link queda muerto.**
- **`DynamicDock` (nav desktop) NO tiene este problema:** su `NAV_ITEMS` (`:34-41`) solo usa `/#inicio` + rutas de página + `/contact`. La trampa es exclusiva del menú mobile.
- **`TransitionContext.executeScroll` (líneas 24-46) tiene un `if (targetId === 'servicios' || targetId === 'caracteristicas')` hardcodeado** que aplica un offset de centrado especial. Esos dos strings son exactamente los ids que mueren. El archivo está en la tabla **Frozen files** de `CLAUDE.md`. Tras el borrado, ese caso especial queda como código muerto acoplado a ids inexistentes.
- **El chatbot puede invocar `navigate_to_page` hacia `/#nosotros` y `/#servicios`** y renderizar una `NavigateToPageCard` que lleva a la nada.

**Dos anclas del chatbot ya están rotas hoy, antes de tocar nada:**
- `/#portafolio` (`navigateToPage.ts:21`) — con **`a`**. El id real es `portfolio`, con **`o`**. Nunca coincidió.
- `/#calculadora` (`navigateToPage.ts:22`), descrita como *"calculadora ROI en home"* — el único `id="calculadora"` está en `components/automation/CalculadoraAutomation.tsx:955`, que **no se renderiza en el home**. Además `ROICalculator.tsx` no lo importa nadie.

El chatbot **no** conoce `/#caracteristicas`, así que esa sección no es alcanzable por el bot ni hoy.

### 🔴 TRAMPA 3 — `Portfolio.tsx` no es del home solo

`src/app/web-development/page.tsx:19` lo importa **estáticamente** y lo renderiza en `:245`. Borrarlo rompe el **build** de esa landing (no un warning: un import inexistente). Ver §C.7.

### 🟠 TRAMPA 4 — `lib/data/premium-modules.ts` alimenta el seed de la DB

Ver §C.2. Borrar la sección `modulos-opcionales/` está bien; tocar su fuente de datos, no.

### 🟠 TRAMPA 5 — Tipos re-exportados que rompen el build en tipos

- `type PremiumModuleSeed` (de `lib/data/premium-modules.ts`) → `ModuloActiveCard.tsx:16`, `ModuloComingSoonCard.tsx:16`
- `type IncludedFeature` (de `todo-incluido/data.ts`) → `TodoIncluidoFeatureCard.tsx:12`
- `type StoryMoment` (de `portal-demo/data.ts`) → `StoryMomentCard.tsx:5` *(sobrevive)*

Ninguno cruza la frontera de su carpeta salvo `PremiumModuleSeed`. **Ningún archivo que muere exporta un tipo consumido desde fuera.**

### 🟡 TRAMPA 6 — Acoplamientos por string que no rompen el build

Cosas que degradan en silencio, sin error de compilación:
- Las 2 clases `.about-logo-*` de `globals.css` (§D.3)
- `CARD_EFFECTS` en `TodoIncluidoFeatureCard.tsx:16-42` (por `feature.id`) y `CARD_EFFECTS`/`MODULE_BULLETS`/`TIER_LABELS` en `ModuloActiveCard.tsx:47-101` (por `module.tier`/`module.slug`) — todos `Record<string,...> ?? default`. Renombrar un id/slug degrada al efecto por defecto sin warning.
- `data-scroll-hover-target` / `.scroll-hover-reveal` / `--scroll-hover-*`: seteados en `ModuloActiveCard.tsx` (115, 136-139, 144, 157, 171) **y** en `portal-demo/StoryMomentCard.tsx`, pero **no se encontró ningún selector CSS ni listener JS que los lea** en todo el repo. Infraestructura vestigial compartida entre una sección que muere y una que sobrevive.
- El selector de mockup por `moment.id` en `portal-demo/StoryMomentCard.tsx:227-229` (§C.9).

### ✅ Verificado que NO son trampas

- **`SectionWrapper` / `HomeWrapper`:** `SectionWrapper` solo envuelve `children` en un `motion.div` con reveal genérico; `HomeWrapper` en un `motion.main` con bg/color animados. **Ninguno cuenta, indexa ni registra hijos.** No requieren ajuste por la cantidad de secciones que queden.
- **`Preloader` / `PreloaderContext`:** el flujo de fases lo gobierna `Hero.tsx` (sobrevive) vía `heroCanvasRect` y `markLogoReady`. **Ninguna fase depende de que existan las secciones que mueren.**
- **Punto de montaje del chat widget:** `ChatWidgetMount.tsx:26-42` + `useChromeRevealed.ts:18-42` se gatean por `isPortalRoute(pathname)` y por `phase === 'done'` del Preloader (gobernado por el Hero). **No leen ids ni contenido de las secciones que mueren.** El único acoplamiento real del chat con el home es la herramienta `navigate_to_page` (Trampa 2).
- **`Footer.tsx`:** sin ids compartidos, sin `useThemeSection`, sin efectos globales. Usa sus propias env vars.
- **`InfiniteReviews`, `PortalDemoCTA`, `todo-incluido/*`, `modulos-opcionales/*`:** sin ids de ancla, sin efectos globales, sin exports consumidos afuera. **Borrado limpio.**
- **`OurServices`:** sus anclas internas (`servicio-{id}`, `servicios-siguiente-paso`) se generan y se buscan **dentro del propio archivo**. Sus listeners de `window` tienen cleanup correcto. El único acoplamiento externo es `id="servicios"`.

---

# E. Orden de demolición seguro

Análisis de dependencias, no decisión de diseño. Cada paso deja el build verde y el sitio navegable. **Los pasos 0 y 1 no borran nada** — son el precio de que los siguientes sean seguros.

### Paso 0 — Desacoplar `Portfolio.tsx` de la landing que sobrevive
**Qué hay que hacer antes de borrar nada:** decidir el destino de `Portfolio.tsx` respecto de `/web-development`. O se mueve el archivo fuera de `sections/home/` y se actualiza el import de `web-development/page.tsx:19`, o esa landing recibe su propia versión.
**Por qué primero:** mientras ese import estático exista, `home/Portfolio.tsx` **no es borrable** — rompe un build de producción, no solo el home.

### Paso 1 — Reemplazar el motor de tema
**Qué hay que haber reemplazado antes:** el disparo de `useThemeSection` que hoy hacen `About.tsx` (`'light'` ×2) y `WhyDevelOP.tsx` (`'dark'`). Las opciones son mover esas llamadas a componentes que sobrevivan, reactivar `layout/SectionTransition.tsx` (hoy huérfano), o decidir explícitamente que el home nuevo no invierte tema y quitar `ThemeProvider` de `page.tsx:23`.
**Por qué antes de tocar esos dos archivos:** es el único acoplamiento que degrada en silencio, sin error de build y sin link roto visible.

### Paso 2 — Borrar los huérfanos preexistentes *(cero riesgo, cero prerrequisitos)*
`sections/home/PortalDemo.tsx` · `sections/AIBentoGrid.tsx` · `sections/ROICalculator.tsx` · `lib/design-patterns.ts` · `lib/cn.ts` · los tres `page.tsx.bak`.
**Nadie los importa.** Se pueden hacer en cualquier momento, incluso antes que todo lo demás. *(Rescatar antes el copy de `home/PortalDemo.tsx` — §C.8.)*

### Paso 3 — Borrar las hojas sin acoplamiento externo
En este orden o en cualquiera entre sí, **cada una editando `page.tsx` en el mismo commit** (quitar el `import dynamic` + el JSX + el skeleton `loading` inline):

1. `sections/portal-demo-cta/PortalDemoCTA.tsx` → quitar `page.tsx:18, 40`
2. `sections/home/InfiniteReviews.tsx` → quitar `page.tsx:19, 28`
3. `sections/todo-incluido/` (3 archivos) → quitar `page.tsx:16, 38`
4. `sections/modulos-opcionales/` (3 archivos) → quitar `page.tsx:17, 39`
   **⚠ Sin tocar `src/lib/data/premium-modules.ts`** — alimenta el seed de la DB del portal (§C.2).

Ninguna tiene ancla de nav ni efecto global. Después de este paso el home ya perdió 4 secciones y sigue navegable.

### Paso 4 — Borrar `OurServices.tsx`
**Prerrequisito:** decidir el destino del ancla `#servicios` — o el bloque nuevo la reclama, o hay que sacar la entrada de `MAIN_NAV_ITEMS` (`Navbar.tsx:29` + `HASH_TO_LABEL:59`) y de `VALID_PATHS` del chatbot (`navigateToPage.ts:23, 51`), y limpiar el caso especial de `TransitionContext:28, 41`.
**Después:** quitar `page.tsx:14, 31-33` (incluido el `<SectionWrapper>` que lo envuelve).
Es el borrado más grande en líneas (9.898) y de los más simples en acoplamiento: **un solo importador, un solo ancla**.

### Paso 5 — Borrar `WhyDevelOP.tsx`
**Prerrequisitos:** Paso 1 hecho (era el disparador de `'dark'`) + decidir el destino del ancla `#caracteristicas` (`Navbar.tsx:30, 60` + caso especial de `TransitionContext`).
**Después:** quitar `page.tsx:12, 41`.

### Paso 6 — Borrar `Portfolio.tsx`
**Prerrequisitos:** Paso 0 hecho + decidir el destino del ancla `#portfolio` (`Navbar.tsx:28, 58`).
**Después:** quitar `page.tsx:13, 27`.

### Paso 7 — Borrar `About.tsx` *(el último de todos)*
**Prerrequisitos:** Paso 1 hecho (era el disparador de `'light'` ×2) + decidir el destino del ancla `#nosotros` (`Navbar.tsx:27, 57` + `TransitionContext` + **chatbot `navigateToPage.ts:20, 48`** — el único de los tres consumidores que hay que tocar en el módulo del bot).
**Después:** quitar `page.tsx:8, 26`.
**Va último** porque es el único con import estático arriba del fold, junto al Hero — es el componente que más se nota si algo sale mal. Al borrarlo, **`ui/KineticText.tsx` queda huérfano** y se puede borrar en el mismo commit.

### Paso 8 — Limpieza de CSS muerto
Solo después del Paso 7, borrar de `globals.css`: `.about-logo-materialize` + `.is-active` (122-130), `.about-logo-shadow` + `.is-active` (132-140), `@keyframes aboutLogoMaterialize` (142-162), `@keyframes aboutLogoShadowMaterialize` (164-179).
**Ningún error de build va a avisar si esto se olvida** — el acoplamiento es por string.
*Los huérfanos preexistentes de `globals.css` (§D.3: los 6 `admin-*`, `floatMetric`, `errorPulse`, `chevronAmber`, `rotateSlow`, `floatLabel`, `breathe`, `.animate-admin-alert`, `--color-metric-bg`, `--width-hero-*`) son un barrido aparte, sin relación con este orden.*

### Fuera del orden — `sections/portal-demo/`
**No se borra: se re-estiliza.** Sus 5 archivos y su `data.ts` sobreviven intactos. Solo dos cosas a saber antes de tocarlo: los mockups no leen `data.ts` (copian los números a mano) y el selector de mockup compara `moment.id` por string sin tipo (§C.9).

### Resumen del ancla-por-ancla

| Ancla | Paso que la mata | Hay que tocar |
|---|---|---|
| `#servicios` | 4 | `Navbar` · `TransitionContext` (frozen) · chatbot |
| `#caracteristicas` | 5 | `Navbar` · `TransitionContext` (frozen) |
| `#portfolio` | 6 | `Navbar` |
| `#nosotros` | 7 | `Navbar` · `TransitionContext` (frozen) · chatbot |
| `#inicio` | — | sobrevive (`Hero.tsx`) |

---

# Lo que no se pudo determinar

**Del método (limitación estructural):** todo este censo es **lectura estática**. No se corrió el build, ni `tsc`, ni el sitio en navegador. Nada de lo que sigue está verificado en runtime.

**Sobre el contenido:**
1. **Si los claims cuantitativos son reales.** Ninguno de los datos de §B.5 tiene fuente citada en el repo. Por diseño no lo juzgo — están clasificados para que Franco los valide uno por uno.
2. Si el 5º módulo `COMING_SOON` que menciona el comentario de `premium-modules.ts:82` existió y fue removido, o si el comentario nunca se actualizó. Requiere `git log`.
3. ~~Si el mojibake de `About.tsx:294` es preexistente~~ — **resuelto**: es de `main`, y `fe099b9` (en `fix/home-sanidad`, sin mergear) ya lo corrige. Ver §C.6.
4. Si el uso sistemático de `qué`/`cuándo` con tilde en `WhyDevelOP.tsx` es intencional o el residuo de un script de acentuación.
5. Si `InfiniteReviews` alguna vez tuvo reviews reales (el nombre lo sugiere, pero no hay evidencia en el repo).
6. Si los `screenshotPath` de `portal-demo/data.ts` existen físicamente en `public/` — ningún componente los consume hoy, así que no se chequeó.

**Sobre el comportamiento:**
7. **Si los loops no gateados de §A.4 impactan medible­mente el rendimiento.** Que corran fuera del viewport es un hecho leído del código; cuánto cuesta, no se midió.
8. **Cuánto se nota visualmente que el tema quede congelado en `'light'`** (Trampa 1). El mecanismo está confirmado en código; el impacto percibido depende de cuánta UI hereda `--color-void`/`--color-obsidian` contra cuánta tiene su color inline. La mayoría de las secciones usan `bg-black`/`bg-[#030303]`, que taparían el `body`.
9. **Cuál definición de CSS gana la cascada** cuando un keyframe está declarado en `globals.css` y otra vez en un `<style>` plano del componente (`spin`, `pulse`, `ringPulse`, `amberShift`, `moveHand`, `cursorBlink`). Ni si el `@keyframes spin` custom (fuera de `@layer`, técnicamente con más prioridad) sobrescribe el default de Tailwind o es un duplicado inerte.
10. Si el DOM duplicado de `id="nosotros"` (`AboutMobile:411` **y** `AboutDesktop:471`, ambos siempre montados) hace que `getElementById` resuelva siempre al de mobile. Es lectura estática de la estructura JSX.
11. Si `PR&Oacute;XIMAMENTE` (`ModuloComingSoonCard.tsx:160`) se decodifica a `Ó` o se muestra literal.
12. Si los `.page.tsx.bak` están formalmente excluidos del build. Se infiere por convención del App Router (Next exige `page.tsx` exacto); no se leyó `next.config` para confirmarlo.
13. Si `data-scroll-hover-target` / `.scroll-hover-reveal` / `--scroll-hover-*` son leídos por algo **fuera de `src/`**. Solo se confirmó ausencia de consumidor dentro de `src/`.
14. **Si algún test E2E de Playwright hace aserciones sobre el copy o el DOM de estas secciones.** Una búsqueda por rutas de import no encontró nada, pero un test puede depender del texto renderizado sin importar el archivo.
15. No se encontró `middleware.ts` en el repo, así que la clasificación de `/login`, `/forgot-password` y `/accept-invite` como rutas públicas se basa en su ubicación fuera de `(protected)/`, no en un guard verificado.

**Sobre el estado del árbol:**
16. **Otra sesión cambió la rama del checkout (`fix/home-sanidad` → `main`) mientras corría el censo.** Reverifiqué al cierre que todas las referencias línea-por-línea del reporte son exactas en `main` (ver el aviso del encabezado), pero **no puedo determinar en qué momento exacto de la corrida ocurrió el switch** ni, por lo tanto, si alguna de las 15 pasadas leyó una versión intermedia de algún archivo. La reverificación cubre los archivos que estaban en juego (`About.tsx`, `layout.tsx`, `MarketingIntro.tsx`, `OurServices.tsx`); el resto del scope no difiere entre las dos ramas.
17. **Este reporte describe `main`, no `fix/home-sanidad`.** El delta entre ambas es de 2 archivos y 7 líneas (`About.tsx` ×1, `layout.tsx` ×6). El de `About.tsx` está anotado en §C.6; **el de `layout.tsx` (6 líneas) no se analizó** — no afecta ninguna conclusión de este censo, pero si se planifica sobre `fix/home-sanidad` conviene mirarlo.
18. Si esa otra sesión sigue trabajando sobre el mismo checkout, **las líneas citadas pueden correrse en cualquier momento**. Conviene revalidar los números antes de ejecutar el §E.

---

*Documento de planificación. No se registra en bitácora. No se commitea con este PROBE.*
