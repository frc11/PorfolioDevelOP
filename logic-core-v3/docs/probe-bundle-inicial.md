# PROBE — El bundle inicial del sitio público

**Fecha:** 2026-08-10 · **Rama:** `redesign/home` · **HEAD:** `f9a20b2` ("perf(home): destraba el pintado del h1 del hero")
**Tipo:** solo lectura. Cero ediciones en `src/`. Insumo de planificación, no sprint.

---

## Resumen ejecutivo

Tres hechos, en orden de importancia:

1. **El widget de chat arrastra 438,2 kB gz en 25 chunks a TODA ruta pública, mobile incluido.** La sospecha anotada en B2-S1 se confirma y se cuantifica. De esos, **230,7 kB gz son `three` + `@react-three/fiber`**, que el widget necesita únicamente porque `registry.ts` importa los dos avatares 3D de forma estática — y el bot `develop` está configurado con `avatarStyle: "image"`, un `<img>` con data-URI. **Ese código no puede ejecutarse nunca con la config actual.**

2. **Esto explica por qué sacar el 3D del hero liberaba tan poco.** Los 3 chunks de `three` son COMPARTIDOS entre el widget y el canvas del hero. El canvas del hero tiene solo **27,2 kB gz exclusivos**. Mientras el widget siga en el árbol, `three` viaja igual.

3. **Corrección al encuadre del brief: diferir el widget NO va a mover el LCP.** Medido: el widget no pide un solo byte antes del primer paint, y el 100 % de su ~1 s de long tasks cae DESPUÉS de pintar. El techo del LCP es otro — el detalle en la sección E. Diferir el widget es igualmente la mejor jugada del repo, pero paga en bytes y en TBT/INP, no en LCP.

| | inicial (pre-paint) | post-paint | total |
|---|---|---|---|
| `/` desktop 1440 | 18 scripts · 317,1 kB gz | 27 scripts · 465,4 kB gz | 45 · 784,2 kB |
| `/` mobile 390 | 18 scripts · 317,7 kB gz | 25 scripts · 439,2 kB gz | 43 · 756,9 kB |
| `/web-development` mobile | 20 scripts · 365,6 kB gz | 25 scripts · 439,3 kB gz | 45 · 807,0 kB |

---

## Harness

Sin esto los números no son comparables entre sprints.

| | |
|---|---|
| **Build** | `npm run build` (= `next build --webpack`), Next **16.2.9**, salida verde. `distDir` = `.next`. |
| **Servidor** | `npx next start -p 3010` — build de producción, no `next dev`. |
| **Driver** | **Playwright 1.61.1**, Chromium rev **1228**, headless, `--disable-gpu`. |
| **Red** | CDP `Network.emulateNetworkConditions`: 1,6 Mbps ↓ / 750 kbps ↑ / **150 ms RTT** (perfil "Slow 4G"). |
| **CPU** | CDP `Emulation.setCPUThrottlingRate` = **4×**. |
| **Viewports** | desktop **1440×900** dSF 1 · mobile **390×844** `isMobile`+`hasTouch`, UA Pixel 7. |
| **Espera** | evento `load` + **9000 ms** (para capturar los `dynamic()` post-hidratación). |
| **Corridas** | 3 por configuración. Los A/B: **4 ciclos** (mobile), **3 ciclos** (mobile orden invertido), **3 ciclos** (desktop), con los brazos **intercalados** dentro de cada ciclo. |
| **Métricas** | `PerformanceObserver` (`longtask`, `largest-contentful-paint`), Paint Timing, Resource Timing. |
| **Pesos gz** | `gzip` nivel 9 sobre los archivos de `.next/static/` en disco — determinista e independiente de la compresión del servidor. Los "kB enc" son `encodedBodySize` sobre el cable. |
| **Atribución de chunks** | `.next/react-loadable-manifest.json` — el mapa que el propio webpack escribe de `dynamic()` → lista de chunks. Es la fuente de verdad, no una inferencia. |

**NO se usó Lighthouse.** Está declarado a propósito: Lighthouse no da atribución de chunk a `dynamic()`, y en Next 16 con `--webpack` el build ya no imprime First Load JS. El censo se construyó con los manifiestos del build + Resource Timing.

**Estado del host durante la corrida:** la máquina tenía carga de fondo variable (un juego y un navegador abiertos; CPU a 2470 MHz de 4001 máx.). Con throttle 4× eso amplifica cualquier contención. Consecuencia: **los pesos y las cuentas de scripts son estables y reproducibles hasta el byte; los tiempos absolutos derivaron ~2× entre el arranque y el final de la sesión.** Por eso todo A/B se corrió intercalado y en los dos órdenes.

**Árbol de trabajo:** hay WIP sin commitear en `src/app/(protected)/setter/**` y `src/lib/leados/**` de otro frente. No toca ninguna ruta pública ni el layout raíz — no contamina este censo.

---

## A · Censo de los scripts iniciales

### A.1 — `/` (home), desktop 1440×900

Corrida más limpia de 3. FCP = LCP = **2764 ms** (elemento `H1`), `load` 3860 ms.

Los 18 iniciales arrancan todos en la ventana 220–233 ms (los emite el HTML del documento) y suman **317,1 kB gz / 1 002,9 kB sin comprimir** — que se corresponde con los 317,7 kB `encodedBodySize` medidos sobre el cable.

| # | chunk | gz kB | raw kB | qué contiene | clase |
|---|---|---|---|---|---|
| 1 | `webpack-9d4032ca.js` | 3,0 | 6,2 | runtime de webpack | framework |
| 2 | `4bd1b696-6eaa2ced.js` | 61,4 | 195,5 | `react-dom` | framework |
| 3 | `7149-d55bbd79.js` | **141,8** | 466,6 | `react-dom` + runtime de Next + **`@sentry/nextjs`** | framework + 3.º |
| 4 | `main-app-57967884.js` | 2,4 | 8,1 | entry del App Router | framework |
| 5 | `3813-9bad8fd2.js` | **42,5** | 128,5 | **`motion` (framer)** | 3.º |
| 6 | `5681-4842ffa1.js` | 2,6 | 5,6 | — | propio |
| 7 | `8409-70da2dd8.js` | 8,7 | 28,0 | — | propio |
| 8 | `6609-c1cd5c7d.js` | 9,2 | 33,1 | **`sonner`** (el `<Toaster>` del layout) | 3.º |
| 9 | `5772-cbfb315e.js` | 5,7 | 15,3 | runtime de Next | framework |
| 10 | `9752-0e2632d0.js` | 5,5 | 18,6 | **`lenis`** (`SmoothScroll`) | 3.º |
| 11 | `9179-17c016bd.js` | 4,2 | 9,8 | — | propio |
| 12 | `9823-cd2953bd.js` | 2,7 | 7,1 | — | propio |
| 13 | `app/layout-3a1c1acd.js` | 9,8 | 28,0 | layout raíz | propio |
| 14 | `app/error-fbffc4a6.js` | 1,4 | 2,8 | boundary de error | propio |
| 15 | `app/not-found-768883e3.js` | 3,6 | 8,7 | 404 | propio |
| 16 | `5810-fe3a76a8.js` | 2,4 | 6,0 | — | propio |
| 17 | `app/page-e66127c5.js` | 9,3 | 33,3 | las 6 secciones del home | propio |
| 18 | `app/global-error-96dfaf42.js` | 0,9 | 1,7 | boundary global | propio |

**Reparto:** framework **214,3 kB gz (67,6 %)** · terceros **57,2 kB gz (18,0 %)** · código propio **45,6 kB gz (14,4 %)**. *(`7149` cuenta como framework aunque lleve Sentry adentro — ver C.3.)*

El código del home propiamente dicho —las seis secciones de [page.tsx:41](../src/app/page.tsx#L41)— son **9,3 kB gz**. El rediseño ya hizo su trabajo: el home no es el problema.

### A.2 — La segunda ola (post-paint), `/` desktop

27 scripts, **465,4 kB gz**. Arrancan a los **4984 ms**, ~2,2 s después del primer paint. Ninguno viene del HTML: los pide la hidratación.

| tramo | chunks | gz kB | dueño (`react-loadable-manifest.json`) |
|---|---|---|---|
| `three` + `@react-three/fiber` | 4 | **230,7** | compartido: widget · HeroCanvas · DotMatrix · HeroBackground · BrandedIntroCanvas |
| exclusivo del widget de chat | 21 | **207,5** | `@/modules/chatbot` |
| exclusivo del canvas del hero | 2 | **27,2** | `@/components/layout/HeroCanvas` (`drei`) |

**Orden de llegada:** el widget pide primero (4984 ms) y el canvas del hero queda detrás en la cola (6185 ms). El widget le atrasa el artefacto al hero ~1,2 s.

### A.3 — `/web-development` (landing de servicio), mobile

FCP **6620 ms**, LCP **17016 ms** (elemento `P`), `load` 10505 ms.

Los 18 iniciales del home son idénticos, más:

| # | chunk | gz kB | raw kB | contenido |
|---|---|---|---|---|
| 16 | `2525-1984e7a1.js` | 2,6 | 5,9 | — |
| 17 | `8968-d495caaf.js` | 3,2 | 7,6 | — |
| 18 | `197-b3cbf214.js` | 4,2 | 10,2 | runtime de Next |
| 19 | `app/page-8eb3bdf8.js` | **50,2** | 203,9 | la landing entera, en un solo chunk |

**Inicial: 20 scripts / 365,6 kB gz.** Post-paint: 25 scripts / 439,3 kB gz — el mismo `three` compartido + el widget completo + `HeroBackground`.

La landing de servicio pesa **5,4× más de código propio que el home** (50,2 vs 9,3 kB gz) y no pasó por el rediseño. Fuera de scope de este probe, pero anotado.

### A.4 — Atribución de long tasks

**No se pudo atribuir cada long task a su script.** La Long Tasks API de Chromium devolvió `containerType: "window"` sin `containerSrc` en las 7/7 entradas — es su comportamiento normal para trabajo de hidratación, no un fallo del harness.

La atribución se hizo por **diferencia A/B** (que es evidencia más fuerte) y por ventana temporal. Sobre `/` mobile, brazo baseline:

| ventana | long tasks | lectura |
|---|---|---|
| antes del FCP | **~1 567 ms** | los 18 iniciales: parseo, compilación e hidratación |
| después del FCP | **~3 891 ms** | de los cuales **~1 000 ms son el widget** (ver B.4) |
| **total** | **~5 458 ms** (mediana) | |

El total del brief (1 078 ms) no se reproduce en este harness porque el throttle y el host son otros. Lo que sí es transferible: **el reparto**, y el hecho de que el pre-paint (~1,57 s) no se mueve un milisegundo al sacar el widget (medido: 1567 vs 1570 ms).

---

## B · El widget de chat

### B.1 — Dónde se monta

Punto de montaje único, en el layout raíz: [layout.tsx:134](../src/app/layout.tsx#L134), importado en [layout.tsx:49](../src/app/layout.tsx#L49).

Es `dynamic` con `ssr: false` — [ChatWidgetMount.tsx:12-15](../src/components/layout/ChatWidgetMount.tsx#L12):

```ts
const LogicCompanion = dynamic(
  () => import('@/modules/chatbot').then((m) => ({ default: m.LogicCompanion })),
  { ssr: false }
)
```

El gate de render está en [ChatWidgetMount.tsx:41](../src/components/layout/ChatWidgetMount.tsx#L41): `if (isChromeFree || !revealed) return null`.

**No hay diferencia entre desktop y mobile.** El gate no consulta viewport ni `prefers-reduced-motion`. Verificado en runtime: `[data-chatbot-avatar]` presente en 390×844 y en 1440×900, y con `reducedMotion: reduce` también.

Sí hay diferencia **por ruta**, y juega en contra del home:

- `useChromeRevealed()` devuelve `true` **inmediatamente** en toda ruta que no sea marketing — [useChromeRevealed.ts:45-46](../src/components/layout/useChromeRevealed.ts#L45). El home **no** está en `MARKETING_ROUTES` ([marketing-routes.ts:8-14](../src/lib/marketing-routes.ts#L8)).
- Es decir: **en `/` el widget monta en la primera pasada de hidratación** y dispara su `import()` ahí mismo. En las 5 landings de marketing espera al evento `chrome:revealed` (medido en `/web-development`: los chunks del widget arrancan a 16 138 ms, contra 4 984 ms en el home).

### B.2 — Qué arrastra

`ChatWidgetMount` importa el **barrel completo** `@/modules/chatbot`, no `LogicCompanion`. Ese barrel ([index.ts](../src/modules/chatbot/index.ts)) reexporta, además del widget:

- los editores de admin — [index.ts:72-74](../src/modules/chatbot/index.ts#L72) (`KnowledgeBaseEditor`, `BotConfigEditor`, `ActivityLog`, `OnboardingWizard`)
- las tablas de dashboard — [index.ts:81-82](../src/modules/chatbot/index.ts#L81)
- **server actions** — [index.ts:77](../src/modules/chatbot/index.ts#L77), [:85](../src/modules/chatbot/index.ts#L85), [:86](../src/modules/chatbot/index.ts#L86)

**La cadena a `three`, eslabón por eslabón:**

| paso | archivo:línea | qué hace |
|---|---|---|
| 1 | [LogicCompanion.tsx:6](../src/modules/chatbot/components/LogicCompanion.tsx#L6) | `import { AvatarRenderer } from './avatar'` |
| 2 | [AvatarRenderer.tsx:4](../src/modules/chatbot/components/avatar/AvatarRenderer.tsx#L4) | `import { getAvatar, getAvatarOrDefault } from './registry'` |
| 3 | [registry.ts:1](../src/modules/chatbot/components/avatar/registry.ts#L1) | `import { NeuroAvatar } from './NeuroAvatar'` — **estático** |
| 3′ | [registry.ts:2](../src/modules/chatbot/components/avatar/registry.ts#L2) | `import { LegacyNeuroAvatarAdapter }` — **estático** |
| 4 | [NeuroAvatar.tsx:3](../src/modules/chatbot/components/avatar/NeuroAvatar.tsx#L3) | `import { Canvas } from '@react-three/fiber'` |
| 4′ | [LegacyNeuroAvatar.tsx:4-5,9](../src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx#L4) | `@react-three/fiber` + `@react-three/drei` + `import * as THREE from 'three'` |

**El remate.** `AvatarRenderer` resuelve `style === 'image'` y devuelve un `<img>` en [AvatarRenderer.tsx:51-65](../src/modules/chatbot/components/avatar/AvatarRenderer.tsx#L51) — **antes** de tocar el registry (línea 87). Pero el `import` del paso 2 es estático: webpack mete el registry, y con él los dos avatares 3D, en el grafo del chunk pase lo que pase en runtime.

Y la config real del bot lo confirma. `GET /api/chatbot/develop/config` en el build de producción devuelve:

```json
{ "botName": "Lucia", "avatarStyle": "image",
  "avatarImageUrl": "data:image/webp;base64,UklGRsoaAABXRUJQ…" }
```

**Verificado en el DOM:** el launcher renderiza `<img alt="Avatar" src="data:image/webp;base64,…">`, y el único `<canvas>` de la página es el del hero (416×416, `inWidget: false`). En mobile, **cero canvas** y el widget igual presente.

> **230,7 kB gz de `three` + R3F se descargan, parsean y evalúan en cada carga pública para alimentar dos componentes que la config actual no puede montar.**

**Peso exacto de la cadena del widget** (gzip -9 sobre los archivos del build):

| grupo | chunks | gz kB | raw kB |
|---|---|---|---|
| `three` (`bd904a5c`, `b536a0f1`) + R3F (`b79b7286`) + `4857` | 4 | **230,7** | 861,0 |
| `react-markdown` + `remark-gfm` (`8426`, `3205`, `7953` parcial) | 3 | 61,3 | 207,1 |
| `zod` (`8654`, `1930`) | 2 | 42,0 | 155,7 |
| `ai` / `@ai-sdk` (`8811`, `287`, `9302`) | 3 | 24,4 | 76,5 |
| `date-fns` (`2659`) | 1 | 4,8 | 16,3 |
| resto del módulo chatbot | 12 | 75,0 | 237,8 |
| **TOTAL** | **25** | **438,2** | **1 554,4** |

### B.3 — Cuándo se necesita de verdad

El launcher es **un botón de 56×56 px en la esquina inferior derecha**. Medido a 1440×900: `top: 820, left: 1360` — técnicamente sobre el fold, pero es un `<img>` circular en una esquina.

Reparto del peso por lo que hace falta para cada cosa:

| para... | necesita | gz kB |
|---|---|---|
| **Pintar el launcher** | `LogicCompanion` + `AvatarRenderer` (rama `image`) + `ProactiveTooltip` + `useChatbot` + `motion` (ya en el inicial) | **~35 kB** estimado |
| **Abrir el chat** | `ChatWindow`, `react-markdown`+`remark-gfm`, `ai`/`@ai-sdk`, `zod`, `date-fns`, tool-cards | **~133 kB** |
| **Nada, con la config actual** | `three` + `@react-three/fiber` + los dos avatares 3D | **230,7 kB** |

El corte de 35 kB es **estimación** (no se puede aislar sin editar `src/`, y este probe es de solo lectura). Los otros dos son medidos.

### B.4 — Cuánto se ahorra difiriéndolo

Método: interceptar los chunks del widget y servirlos como JS vacío (`200`, body `''`). Emula exactamente "este chunk no se pide hasta que el usuario interactúa": ni descarga ni evaluación. Brazos intercalados, 4 ciclos, más 3 ciclos con el orden invertido para descartar sesgo de orden.

**`/` mobile 390×844** — el caso limpio: no hay canvas del hero en ninguno de los dos brazos.

| | A (baseline) | B (widget diferido) | Δ |
|---|---|---|---|
| scripts | 43 | **18** | **−25** |
| JS sobre el cable | 756,9 kB | **317,7 kB** | **−439,2 kB** |
| long tasks (mediana) | 5 458 ms | 4 420 ms | **−1 038 ms** |
| long tasks, orden invertido | 5 488 ms | 4 647 ms | **−841 ms** |
| long tasks **post-FCP** | 3 891 ms | 2 850 ms | **−1 041 ms** |
| long tasks **pre-FCP** | 1 567 ms | 1 570 ms | **±0** |
| FCP / LCP | 3 176 ms | 3 428 ms | *(ver nota)* |

> **−439,2 kB gz y −0,84 a −1,04 s de long tasks. El pre-paint no se mueve: el widget no participa del primer paint.**

Los 439,2 kB medidos sobre el cable coinciden con los 438,2 kB gz calculados estáticamente sobre el build — dos métodos independientes, mismo número.

*Nota sobre FCP/LCP:* el brazo B mide FCP peor, en los dos órdenes. **Es artefacto del harness, no del cambio:** el interceptor `page.route` de Playwright se aplica a `**/_next/static/chunks/**`, o sea también a los 18 iniciales, y les agrega un ida y vuelta a Node. No afecta a las long tasks (los chunks stubbeados no aportan trabajo en ningún caso). La lectura correcta es **FCP/LCP sin cambio**.

**`/` desktop 1440×900** — solo los 21 chunks exclusivos, dejando `three` para el hero:

| | A (baseline) | B | Δ |
|---|---|---|---|
| scripts | 45 | 22 | −23 |
| JS sobre el cable | 784,2 kB | 549,0 kB | −235,2 kB |
| long tasks (mediana) | 6 683 ms | 5 712 ms | −971 ms |

*Contaminado, declarado:* en el brazo B el canvas del hero tampoco cargó (`canvas: 0`) — el chunk vacío deja la promesa del `import()` del widget sin resolver y se lleva puesta la carga diferida del hero. Los 235,2 kB incluyen entonces 27,2 kB que son del hero. Descontándolos: **207,5 kB**, que es exactamente la cifra estática del set exclusivo. Los −971 ms de desktop **no son limpios** (falta el trabajo del canvas del hero); el número bueno para long tasks es el de mobile.

### B.5 — Dependencias que condicionan el diferido

Tres, ninguna insalvable, todas hay que tenerlas presentes:

1. **El teaser proactivo dispara solo, sin interacción.** [useTooltipTriggers.ts:22-24](../src/modules/chatbot/components/tooltip/useTooltipTriggers.ts#L22): `mountDelayMs = 3000`, `idleAfterMs = 25000`, `scrollPercentTrigger = 0.82`. Un diferido estricto "hasta el click en el launcher" **mata el teaser** — que es una función de producto, no un adorno. Un diferido a la **primera interacción cualquiera** (scroll / pointermove / idle callback tras `load`) lo preserva casi intacto: el propio teaser no aparece antes de los 3 s.

2. **La atribución first-touch se resuelve al montar el widget.** [LogicCompanion.tsx:46-52](../src/modules/chatbot/components/LogicCompanion.tsx#L46) calcula `parseAttribution(window.location.href, document.referrer)` en un `useMemo` con deps vacías, y [useChatbot.ts:36-58](../src/modules/chatbot/hooks/useChatbot.ts#L36) lo persiste una sola vez en `sessionStorage`. **Si el widget monta tarde y el visitante ya navegó** (el sitio público navega client-side con `triggerTransition()`), el first-touch queda capturado desde la URL equivocada. Es la única dependencia real de "antes del primer paint" que tiene el widget — y es de datos, no de pintado.

3. **El prefetch de config ya está desacoplado y no hay que tocarlo.** [ChatWidgetMount.tsx:37-39](../src/components/layout/ChatWidgetMount.tsx#L37) llama a `prefetchBotConfig` desde un `useEffect` propio, y `configCache.ts` vive en el bundle inicial, fuera del chunk pesado. O sea: **la config se puede seguir precalentando aunque el widget se difiera**, y el launcher aparecería igual de rápido al revelarse.

**Nada más.** No hay provider del chatbot del que cuelgue otro componente, no hay estado que deba existir antes del primer paint, y el transcripto no se restaura entre cargas (`hasConversation` se deriva de `messages` en memoria — [useChatbot.ts:529](../src/modules/chatbot/hooks/useChatbot.ts#L529)); en `sessionStorage` solo viven `sessionId` y el first-touch.

---

## C · El resto del peso

### C.1 — `motion` (framer)

**42,5 kB gz / 128,5 kB sin comprimir** en el bundle inicial de `/` — chunk `3813-9bad8fd2`. Es el segundo paquete de terceros más grande del inicial, después del bloque framework+Sentry.

Está ahí por **consumidores del layout raíz**, no por las secciones del home:

| archivo | uso | ¿reemplazable por CSS? |
|---|---|---|
| [HomeWrapper.tsx:12-14](../src/components/layout/HomeWrapper.tsx#L12) | `<motion.main animate={{ backgroundColor, color }}>` | sí — transición CSS sobre custom properties |
| [Shutter.tsx:10-13](../src/components/layout/Shutter.tsx#L10) | `initial/animate` de `opacity` | sí — trivial |
| [HeroArtifactLayer.tsx:159-163](../src/components/layout/HeroArtifactLayer.tsx#L159) | fade de `opacity` | sí — trivial |
| [Navbar.tsx:390-396](../src/components/layout/Navbar.tsx#L390), [:446](../src/components/layout/Navbar.tsx#L446), [:514](../src/components/layout/Navbar.tsx#L514) | `motion.header` + 2 `AnimatePresence` con `exit` | **no** — `exit` no tiene equivalente CSS directo |
| [PreloaderContext.tsx:96-103](../src/context/PreloaderContext.tsx#L96) | 7 × `useMotionValue` | **no** sin rehacer el contexto |
| [Footer.tsx](../src/components/sections/home/Footer.tsx) | 19 elementos `motion`, 16 con `initial={{…}}` | mayoría sí |

**Cuántos componentes del home lo consumen tras el rediseño: 6.** Y de las seis secciones nuevas, **solo dos son Client Components**: `PortalDemo` (que ni siquiera usa `motion` — solo `useReducedMotion`, ver [useEscenaCycle.ts:3](../src/components/sections/portal-demo/useEscenaCycle.ts#L3)) y `Footer`. `Portfolio`, `Nosotros`, `Servicios` y `Cierre` son Server Components sin una línea de JS propia.

**Sobre el dato previo "69 de 76 formas de `initial` eran opacity+transform+filter":** no se pudo verificar contra esa base. El censo actual del repo da **443 ocurrencias de `initial={{` en 124 archivos** — un universo distinto del que produjo aquel número (probablemente formas únicas deduplicadas, y probablemente antes de la demolición del monolito). Lo que sí se midió, acotado al árbol del home: **18 formas `initial={{`, de las cuales 16 están en `Footer.tsx`**, y las 16 son `opacity` + `y` + `filter: blur()` con `whileInView` — el patrón exacto que un `IntersectionObserver` + CSS reemplaza.

**Conclusión operativa:** `motion` no sale del inicial mientras `Navbar` y `PreloaderContext` lo usen. Migrar solo el `Footer` no baja un byte del bundle inicial (el chunk ya está ahí por el layout), aunque sí reduce trabajo de hidratación.

### C.2 — `three` / R3F fuera del widget y el hero

**No queda ninguna otra cadena que lo traiga al inicial.** Verificado: los tres chunks de `three` aparecen **exclusivamente** en la fase post-paint, nunca entre los 18 iniciales, en las dos rutas medidas.

Sus cinco dueños, todos vía `dynamic()` según `react-loadable-manifest.json`:

| dueño | ruta donde monta |
|---|---|
| `@/modules/chatbot` | **todas las públicas** ← el problema |
| `@/components/layout/HeroCanvas` | `/`, solo ≥1024 px y sin `prefers-reduced-motion` — [HeroArtifactLayer.tsx:109-122](../src/components/layout/HeroArtifactLayer.tsx#L109) |
| `@/components/ui/BrandedIntroCanvas` | las 5 landings de marketing, vía `MarketingIntro` |
| `@/components/canvas/HeroBackground` | `/web-development` |
| `@/components/canvas/DotMatrix` | `/login`, `/forgot-password`, `/accept-invite` |

El gate del hero está bien construido (idle callback + solo desktop + `prefers-reduced-motion`) y **funciona**: medido con `reducedMotion: reduce`, `canvas: 0`. Su problema no es el gate — es que comparte 230,7 kB con un vecino que no tiene gate ninguno.

### C.3 — Otros terceros del censo A

| paquete | gz kB | dónde | nota |
|---|---|---|---|
| **`@sentry/nextjs`** | co-bundleado en `7149` (141,8 kB con `react-dom` + Next) | layout raíz, vía `withSentryConfig` en [next.config.ts](../next.config.ts) | **No se pudo separar su peso**: webpack lo fusionó con el framework en un chunk único. Es el único ítem del censo sin cifra propia. |
| **`sonner`** | **9,2** | `<Toaster>` en [layout.tsx:122](../src/app/layout.tsx#L122), sin gate de ruta | El home no dispara toasts. |
| **`lenis`** | **5,5** | `SmoothScroll` en [layout.tsx:108](../src/app/layout.tsx#L108) | Scroll suave global. |
| `lucide-react` | — | no aparece en el inicial de `/` | tree-shaking funcionando |
| `recharts` (101,6 kB gz) | — | **no se carga en rutas públicas** | solo dashboard |

---

## D · Qué se puede diferir, ordenado por ahorro/riesgo

| # | candidato | libera del inicial | long tasks que evita | riesgo | qué verificar después |
|---|---|---|---|---|---|
| **1** | **Sacar los avatares 3D del `registry.ts` estático** (que se resuelvan por `dynamic()` como el resto) | **230,7 kB gz** en mobile y en `reduced-motion`; en desktop no libera bytes (el hero los pide igual) pero deja de adelantarlos a la hidratación | parte de los ~1 000 ms | **Muy bajo.** Con `avatarStyle: "image"` ese código no corre. | Que un bot con `avatarStyle: "neuro"` o `"legacy_neuro"` siga renderizando (el admin puede elegirlos: [avatarStyleSchema.ts](../src/modules/chatbot/components/avatar/avatarStyleSchema.ts)). Que `AvatarPicker` del admin siga mostrando las 5 opciones. |
| **2** | **Diferir el widget entero a la primera interacción** (scroll / pointermove / idle tras `load`) | **439,2 kB gz** mobile · **207,5 kB gz** desktop | **−841 a −1 038 ms** (medido) | **Bajo-medio.** Hay que subir `parseAttribution` a `ChatWidgetMount` (B.5.2) y elegir un disparador que no mate el teaser de 3 s (B.5.1). | Que el teaser siga apareciendo. Que el first-touch UTM se registre con la URL de entrada. Que el launcher no aparezca notoriamente más tarde (el prefetch de config ya está desacoplado). |
| **3** | **Importar `LogicCompanion` directo en vez del barrel** `@/modules/chatbot` | a confirmar (el barrel reexporta admin, dashboards y server actions — [index.ts:72-86](../src/modules/chatbot/index.ts#L72)) | — | **Muy bajo.** Cambio de una línea en [ChatWidgetMount.tsx:13](../src/components/layout/ChatWidgetMount.tsx#L13). | Re-correr este censo y comparar los 21 chunks exclusivos. Es la medición que falta. |
| **4** | **Gatear el `<Toaster>` de `sonner` a las rutas que lo usan** | **9,2 kB gz** | poco | **Bajo.** | Que los toasts sigan andando en portales y formularios. |
| **5** | **Diferir el `Footer`** (916 líneas, Client Component, íntegro bajo el fold) | 0 kB del chunk `motion` (sigue ahí por el layout); sí saca su parte del chunk de página | hidratación de 19 elementos `motion` | **Bajo.** | Reveal al hacer scroll; que el formulario del footer siga funcionando. |
| **6** | **Migrar el `Footer` de `motion` a `IntersectionObserver` + CSS** | 0 kB mientras `Navbar` y `PreloaderContext` usen `motion` | hidratación | **Medio.** 16 formas a portar. | Que los reveals se vean igual; `prefers-reduced-motion`. |
| **7** | **Sacar `motion` del inicial del todo** (requiere además `Navbar` + `PreloaderContext`) | **42,5 kB gz** | parte del pre-paint | **Alto.** `AnimatePresence` con `exit` en `Navbar` no tiene equivalente CSS directo; `PreloaderContext` expone 7 `MotionValue` a sus consumidores. | Menús mobile, dropdowns del navbar, toda la secuencia del preloader en las 5 landings. |

**El orden importa.** #1 y #3 son casi gratis y hay que hacerlos antes de medir #2 — cambian el tamaño del set que #2 difiere.

---

## E · Presupuesto proyectado

**Primero, la corrección al encuadre.** Medido en `/` mobile, sin nada stubbeado:

```
HTML responseEnd     263 ms
CSS bloqueante lista  1 509 ms   (55,8 kB enc, 3 hojas, todas 'blocking')
─── ~2,0 s sin nada bloqueando en red ──────────────
primer paint         3 512 ms
domInteractive       5 726 ms
```

Y: **`jsRenderBlocking: []`** — cero scripts bloquean el render. Los 18 iniciales son todos async/defer, y el paint llega antes de que el más grande (`7149`, 141,8 kB) termine de bajar.

Es decir: **entre que el CSS está listo y la página pinta hay ~2,0 s en los que la red no es el cuello.** Ese hueco es main thread — los ~1 567 ms de long tasks pre-paint de los 18 iniciales, más overhead. *(Este harness reproduce el síntoma del brief casi exactamente: CSS a 1 509 ms contra los 1 609 ms reportados, primer paint a 3 512 contra 3 508. La medición previa era buena.)*

**Consecuencia:** el techo del LCP es la **hidratación de los 18 chunks iniciales**, y ninguno de los candidatos de D lo toca salvo el #7 (`motion`, 42,5 kB de 317,1 = 13,4 % del inicial).

### Proyección

| métrica | hoy (medido, mobile) | con D#1+#2+#3+#4 | con todo D incl. #7 |
|---|---|---|---|
| JS inicial (pre-paint) | **317,7 kB gz** *(medido)* | **~308 kB gz** *(proyección)* | **~266 kB gz** *(proyección)* |
| JS total de la carga | **756,9 kB gz** *(medido)* | **~309 kB gz** *(medido en el brazo B: 317,7)* | ~266 kB gz *(proyección)* |
| long tasks totales | **5 458 ms** *(medido)* | **4 420 ms** *(medido en el brazo B)* | ~4,0 s *(proyección)* |
| primer paint | **3 512 ms** *(medido)* | **sin cambio** *(medido: ±0 en pre-FCP)* | ~3,2 s *(proyección)* |
| LCP | **= FCP, 3 176–3 512 ms** *(medido)* | **sin cambio** *(medido)* | ~3,2 s *(proyección)* |

**Qué está medido y qué es proyección, sin ambigüedad:**

- **Medido:** todo el brazo B del A/B (JS total 317,7 kB, long tasks 4 420 ms, pre-FCP invariante). Los pesos gz de cada chunk. Los sets de chunks por `dynamic()`. La ausencia de JS render-blocking.
- **Proyección:** las columnas de "JS inicial" (los candidatos #3, #4 y #7 no se pudieron stubbear sin romper la página) y toda la columna del #7. El ~35 kB del "launcher solo" de B.3.

**El objetivo LCP < 2,5 s no lo alcanza ninguna combinación de los candidatos de este probe.** Los ~1,5 s de hidratación pre-paint y los ~1,5 s de CSS+red se comen el presupuesto antes de que el JS diferible entre en juego. Mover el LCP pide otra palanca —el chunk `7149` de 141,8 kB, las 3 hojas de CSS bloqueantes de 55,8 kB, o reducir superficie de Client Component en el layout raíz— y eso es un probe distinto.

Lo que este probe sí entrega es **el ahorro más grande y más barato del repo: 439 kB gz y ~1 s de main thread, en TBT/INP y en datos móviles del visitante.**

---

## Lo que no se pudo medir, y por qué

1. **Atribución de long task → script.** La Long Tasks API de Chromium devolvió `containerType: "window"` sin `containerSrc` en el 100 % de las entradas. Se sustituyó por diferencia A/B, que es evidencia más fuerte, pero no da un desglose por chunk.
2. **El peso propio de `@sentry/nextjs`.** Webpack lo fusionó con `react-dom` y el runtime de Next en el chunk `7149` (141,8 kB gz). Separarlo exige un build con `ANALYZE=1`, que implicaría editar `next.config.ts` — fuera del mandato de solo lectura. `@next/bundle-analyzer` **ya está instalado** como devDependency pero **no está cableado** en `next.config.ts`; cablearlo es un cambio de dos líneas para un sprint futuro.
3. **El corte exacto "launcher solo" vs "chat abierto".** Los ~35 kB de B.3 son estimación: aislarlo exige partir el import, o sea editar `src/`.
4. **El ahorro real del candidato D#3** (importar `LogicCompanion` directo en vez del barrel). Mismo motivo.
5. **Tiempos absolutos estables.** El host tenía carga de fondo variable y CPU downclockeada; entre el arranque y el final de la sesión los tiempos derivaron ~2×. Los A/B se corrieron intercalados y en ambos órdenes para neutralizarlo, y los pesos y cuentas de chunks —que son deterministas— no se ven afectados. **Para comparar contra sprints futuros, repetir el harness declarado arriba con el host en reposo.**
6. **El LCP de 17 s de `/web-development`.** El elemento LCP es un `<p>` y el velo de `MarketingIntro` está de por medio. Es un hallazgo real pero de otro frente — anotado, no investigado.

---

*Probe de solo lectura. Ningún archivo de `src/` fue modificado.*
