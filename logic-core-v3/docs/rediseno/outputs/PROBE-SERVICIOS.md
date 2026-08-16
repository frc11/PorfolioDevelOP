# PROBE-SERVICIOS — ¿Se puede conservar las 16 demos con otro marco?

**Fecha:** 2026-08-15 · **Branch:** `rediseno/home` · **Archivo auditado:** `src/components/sections/home/OurServices.tsx` (9.898 líneas)
**Método:** solo lectura de código. Ninguna afirmación de runtime fue ejecutada; las que no se sostienen leyendo código van marcadas `[REQUIERE VERIFICACIÓN HUMANA]`.

---

## 1 · Anatomía

Un solo archivo `'use client'`. Imports: `motion/react`, 24 íconos de Lucide, `useLenis`, `useTransitionContext` — todo a nivel módulo (:1-45).

| Bloque | Líneas | Peso aprox. | Marco / Contenido |
|---|---|---|---|
| Tipos + `SERVICES` (data de los 4 servicios) + helpers | 46–158 | 113 | Marco |
| `useServiceDemoCycle` (el motor rAF de progreso) | 159–326 | 168 | Marco |
| `ServiceDemoPauseButton` | 327–375 | 49 | Marco |
| `StageFrame` (chrome "ventana de browser" de cada demo) | 376–591 | 216 | Marco |
| `WebScene` — shell (tabs, placeholder, wiring del ciclo) | 592–754 + 2517–3072 | ~719 | Marco (shell de escena) |
| **SimSEO · SimAnalytics · SimLeads · SimMaps** | 755–2516 | **1.762** | **Contenido** |
| `AIScene` — shell + data (`AI_SIMULATIONS`) | 3073–3094 + 4930–5152 | ~245 | Marco (shell) |
| **SimChat · SimLeadsIA · SimAgenda · SimMétricas** | 3095–4929 | **1.835** | **Contenido** |
| `AutomationScene` — shell | 5153–5174 + 6257–6480 | ~246 | Marco (shell) |
| **SimFlujo · SimFollowUp · SimReporte · SimSync** | 5175–6256 | **1.082** | **Contenido** |
| `SoftwareScene` — shell | 6481–6502 + 7754–7976 | ~245 | Marco (shell) |
| **SimCRM · SimDashboard · SimStock · SimEquipo** | 6503–7753 | **1.251** | **Contenido** |
| `ServiceVisual` (switch de escena) + `ServiceImpactSnapshot` | 7977–8085 | 109 | Marco |
| `ServiceInfoCard` (título, copy, precio, CTA) | 8086–8373 | 288 | Marco |
| `ServiceDemoPanel` + `ServiceCard` | 8374–8535 | 162 | Marco |
| `FloatingParticles` + `OurServicesBackground` (wash de acento :8719-8729) | 8536–8817 | 282 | Marco |
| `ServicesProgressRail` (riel) + `ServiceRailSpacer` + `ServiceRow` | 8818–8967 | 150 | Marco |
| `ServicesFullWidthCta` | 8968–9443 | 476 | Marco |
| `OurServices` (orquestador: rail, observers, scroll) | 9444–9898 | 455 | Marco |

**Totales aproximados:** las **16 sims pesan ~5.930 líneas (60%)**; los 4 shells de escena ~1.455 (15%); el marco general ~2.510 (25%).

Cada escena renderiza **una sola sim a la vez** (ternario sobre `activeTab`, p. ej. :3034-3057) y rota entre sus 4 con `useServiceDemoCycle`.

---

## 2 · Acoplamiento del glass

Los 64 `backdropFilter` inline se reparten así:

- **Marco: 2.** `StageFrame:422` (la ventana de browser, sobre fondo `rgba(10,10,12,0.95)` — con 95% de opacidad detrás, el blur es prácticamente invisible: cosmético) y `renderPlaceholderScene:2547` (placeholder del shell de WebScene).
- **Dentro de las sims: 62.** Por sim: SimSEO 3 · SimAnalytics 3 · SimLeads 2 · SimMaps 8 · SimChat 10 · SimLeadsIA 2 · SimAgenda 9 · SimMétricas 3 · SimFlujo 2 · SimFollowUp 3 · SimReporte 3 · SimSync 3 · SimCRM 1 · SimDashboard 5 · SimStock 2 · SimEquipo 3.

**Carácter:** los 62 siguen una única receta repetida — tarjeta con `background: rgba(255,255,255,0.02–0.06)` (o tinte `${color}08–20`) + `blur(8–20px)` + borde hairline (ver :852-856, :3141-3145, :4722-4726). El backdrop detrás de esas tarjetas es el panel casi opaco del `StageFrame`, no contenido que necesite difuminarse. Excepciones menores con algo de rol compositivo: los pines y tooltips de SimMaps (:2078-2118, blur sobre la grilla del mapa) y las burbujas de SimChat. **Veredicto: sacar el `backdrop-filter` es una pasada mecánica de estilos** (reemplazar por fill sólido equivalente), no una reescritura.

**El costo real no es el blur — es el tema.** El archivo tiene **398 `rgba(255,255,255,…)` hardcodeados, 328 dentro del rango de las escenas/sims**: las 16 sims están *dibujadas* en idioma dark-UI (fondos oscuros, trazos blancos translúcidos, texto blanco). Con la identidad pasando de oscura a clara, "sacar el glass" es trivial; **repintar 16 sims para fondo claro es trabajo de diseño sim por sim**, salvo que se decida conservarlas como "ventanas de app oscuras" sobre página clara (ver pregunta final).

---

## 3 · Separabilidad

Mucho mejor de lo que la auditoría B0b hacía temer. Evidencia:

1. **Firma uniforme.** Las 16 tienen exactamente la misma firma: `function SimX({ isActive, progress, color }: SimProps)`. `SimProps` se redeclara idéntico en cada escena.
2. **Cero hooks internos.** El grep de `useState|useEffect|useRef|useMemo|useCallback` no da ningún hit dentro de los cuerpos de las 16 sims (los hooks viven en los shells: :665-742, :4930-4952, :6257-6279, :7754-7776). Son **funciones puras de render**: `progress` entra, JSX sale.
3. **Cero closures sobre estado del padre.** Ninguna sim referencia `service.*`, `activeTab`, los glyphs del shell (`IconBase`/`*Glyph`) ni las constantes de escena (`AI_COLOR`/`AUTO_COLOR`/`SW_COLOR` se usan solo en los shells de tabs). Solo usan sus 3 props + imports de módulo (`motion`, íconos Lucide). Tampoco hay `Math.random`, `window.*` ni `document.*` adentro.
4. **La invocación como función plana** (`SimSEO({...})` en vez de `<SimSEO/>`, :3034-3057, :5141-5146, :6468-6473, :7965-7970) hoy hace que cada sim se re-defina y re-ejecute inline en cada render del shell — pero como no tienen hooks, **convertirlas en componentes reales con archivo propio es seguro y directo**.

**Dependencias que el marco nuevo debe proveer:** un driver de `progress` 0→1 por duración (hoy `useServiceDemoCycle`, 168 líneas, portable tal cual — no referencia nada del marco) y el `color` de acento. La dependencia de layout es blanda: las sims llenan su contenedor con flex/`minHeight: 0` dentro del `StageFrame`; presumen un panel con proporción tipo browser, no medidas fijas.

**Estimación:**

| Esfuerzo de extracción | Sims | Nota |
|---|---|---|
| Poco (mover a archivo propio + import de motion/íconos) | **16 de 16** | La estructura lo permite en todas por 1–3 |
| Medio | 0 | — |
| Reescritura | 0 | — |

La extracción es mecánica. Lo que **no** es poco esfuerzo es lo transversal: des-glasear + re-tematizar (punto 2) y decidir el driver de activación (punto 4). Si además se quisiera que las sims respondan a props nuevas del rediseño (densidad, tema claro), eso ya es rediseño, no extracción.

---

## 4 · Riesgo bajo scroll horizontal

**Cómo se pausan hoy.** Dos capas independientes:
- Cada escena tiene su propio `IntersectionObserver` sobre su contenedor (`threshold: 0.3`, root = viewport: :709-723, :4936, :6263, :7760) → `isInView` → `useServiceDemoCycle` corta el rAF y no re-arranca (:259-265, :274-276).
- El marco tiene su propia capa: `ServiceRow` observa cada fila con `rootMargin: '-18% 0px -18% 0px'` (:8940-8950) para setear `activeServiceIndex`, y el riel deriva `activeRailIndex` de un progreso calculado con `window.scrollY` + `getBoundingClientRect` (:9461-9478, :9480-9509). Estas son las **dos fuentes de verdad** (`activeServiceIndex` vs `activeRailIndex`, :9451-9452), reconciliadas a mano en `scrollToService` (:9587-9588).

**¿Sobrevive el observer de las escenas?** En principio sí: la spec de IntersectionObserver computa la intersección sobre la geometría *ya transformada* y a través del clipping de ancestros con `overflow`, así que un panel desplazado fuera del viewport por `translateX` (u oculto por el clip del track) reporta `isIntersecting: false` y su ciclo se corta. **Pero es exactamente el tipo de afirmación que este repo ya aprendió a no fiar en estático** (lección EffectComposer): `[REQUIERE VERIFICACIÓN HUMANA]` con un prototipo del contenedor horizontal real, midiendo cuántas escenas tienen su rAF vivo.

**Riesgos concretos:**

1. **Paneles que asoman.** El estilo oddcommon suele mostrar el borde del panel vecino. Con `threshold: 0.3`, un vecino visible al ≥30% de su área corre su ciclo completo → 2+ escenas con rAF + `setState` doble por frame, cada una re-renderizando un subárbol de 300–700 líneas de JSX 60 veces por segundo.
2. **Animaciones infinitas sin compuerta.** Hay 8 `repeat: Infinity` de Framer que no dependen de `isActive` ni de `isInView`: dots "LIVE" (:553, :3731, :4681), ping de puntos (:1476), cursor de tipeo (:4122), flecha del CTA (:8365) y **FloatingParticles** (:8590, :8627 — multiplicado por la cantidad de partículas). El pause del ciclo NO las detiene; solo el desmontaje. En un layout horizontal con las 4 escenas montadas, eso es una base de decenas de animaciones vivas independientes del observer. `[REQUIERE VERIFICACIÓN HUMANA]` si Framer las sigue tickeando estando fuera de viewport.
3. **La capa del marco se rompe entera.** `ServiceRow` y el riel asumen apilado **vertical**: con las filas lado a lado, todas caen dentro de la banda vertical del `rootMargin` a la vez → varios `onActive(index)` compitiendo → `activeAccent` (el wash :8719-8729) flameando. `updateRailProgress` mide progreso con `scrollY` y `rect.top`: bajo un track horizontal todos los `top` colapsan y la matemática del riel degenera. Además, la lección ya documentada en CLAUDE.md aplica de lleno: **`getBoundingClientRect` con transforms activos devuelve coordenadas transformadas** — los `railMarkers` medidos durante la animación del track serían basura.
4. **Móvil de gama media, peor caso.** Si la pausa falla y corren las 4 escenas: 4 loops rAF con hasta 2 `setState` por frame cada uno, 4 re-renders React por frame, 10–24 capas con `backdrop-filter` activas por sim visible, más las animaciones infinitas. Es la receta de main thread saturado, frames caídos y throttling térmico. No puedo cuantificar fps leyendo código: `[REQUIERE VERIFICACIÓN HUMANA]` en dispositivo real.

**Qué habría que garantizar en el marco nuevo:**
- **Una sola fuente de verdad de activación**: el estado del scroll/panel horizontal del marco pasa `isActive` explícito a cada escena (prop), en vez de que cada escena se auto-observe. El observer puede quedar como backstop, no como driver.
- **Compuerta para las animaciones infinitas**: condicionarlas a `isActive` o desmontar las escenas no activas (el desmontaje resetea el estado de la sim — aceptable: el ciclo ya resetea al re-entrar).
- **Máximo 1 escena con rAF vivo** (el vecino que asoma se muestra congelado o como frame estático).
- **Medición de riel/markers rehecha para eje X**, nunca midiendo durante el transform (o usando progreso del scroll driver directamente, sin `getBoundingClientRect`).

---

## 5 · El reemplazo huérfano (`src/components/sections/servicios/`)

**Confirmado sin importadores** (grep de `sections/servicios` en `src/` fuera de la carpeta: cero hits). Dos archivos, 187 líneas totales:

- `data.ts` (68): interface `Frente` + los 4 frentes con `nombre`, `paraQuien` (1 línea), `entregable` (1 línea), `timeline`. Software a medida está en placeholder `[PARA QUIÉN — 1 línea]` con un **gate de merge documentado**: ninguna rama con placeholders a la vista se mergea a `main`.
- `Servicios.tsx` (119): sección S5 del home. **Server Component, cero JS propio** — el reveal es una animación CSS del design system. Cuatro `FrenteRow` (nombre + plazo con acento a la izquierda; para-quién/entregable a la derecha) entre `RuleDivider`s. Depende de `@/components/design-system` (existe: `ChapterLabel`, `DisplayHeading`, `MonoLabel`, `RuleDivider`, `SectionShell`, `Subhead`, `ServiceAccent`).

**Qué resuelve:** el problema de contenido, no el de demos. Trae un censo de copy ya auditado (timelines reales: 15/7/5 días; decisión D1 de sacar pricing del home; acento con área en el nombre del frente, sin glow ni gradiente), y una advertencia estructural valiosa para cualquier marco nuevo: **`id="servicios"` no se renombra** — lo consumen `Navbar`, la tool `navigate_to_page` del chatbot y `TransitionContext` (congelado, con el id hardcodeado).

**Qué muestra en lugar de las sims: nada.** Es una tabla tipográfica estática; la eliminación de las demos es una decisión de diseño deliberada de esa iteración, no un hueco por completar.

**¿Sirve su marco como base del scroll horizontal?** No. No tiene contenedor de scroll, ni track, ni estado, ni cliente — es la antítesis del marco buscado. Lo aprovechable es su **data model** (`Frente`), su copy auditado y sus notas de decisión; el marco horizontal habría que construirlo de cero igual.

---

## 6 · Tres opciones costeadas

| | **A — Restyling in situ** | **B — Marco nuevo, sims intactas** | **C — Reemplazo (4 demos nuevas)** |
|---|---|---|---|
| **Esfuerzo** | **Medio.** Sacar los 64 blur es mecánico (receta única, punto 2), pero el re-pintado a identidad clara toca ~330 tokens dark dentro de las sims, y todo se hace adentro de un archivo de 9.9k líneas sin partirlo. Aligerar texto = editar `ServiceInfoCard` + CTA. | **Medio-alto.** La extracción de las 16 es mecánica y de bajo riesgo (punto 3: firma uniforme, sin hooks, sin closures) y `useServiceDemoCycle` porta tal cual; lo caro es el marco horizontal nuevo con activación de fuente única (punto 4) **más** el mismo re-pintado de sims que A si van a identidad clara. | **Alto en diseño, medio en código.** Idear y construir 4 demos nuevas coherentes con la identidad clara (~4 × unos cientos de líneas si son más simples que las actuales) + el mismo marco horizontal que B. El costo real es creativo, no técnico. |
| **Riesgo técnico principal** | El monolito y la doble fuente de verdad quedan vivos; cada retoque futuro sigue costando caro. El scroll vertical actual funciona, así que el riesgo de regresión visual es bajo. | Performance móvil si la activación no garantiza 1 escena viva (rAF 60fps × N escenas + 8 loops infinitos sin compuerta + blur restante). Los observers del marco actual no sobreviven al eje X: hay que rehacer riel/activación, no portarla. | Que 4 demos nuevas "rindan" menos que 16: riesgo de producto, no de código. Técnicamente es la opción más liviana (menos JS, menos capas, sin deuda heredada). |
| **Qué se pierde** | La dirección de arte del rediseño: sin scroll horizontal, y el glass se va pero el layout y la densidad de texto quedan a medias dentro del marco viejo. | Tiempo de construcción doble (marco nuevo + adaptación de 16 sims). Nada del trabajo invertido en las sims. | Las 16 sims: el activo en el que el dueño más invirtió. La densidad demo-por-subservicio (4 por servicio) baja a 1 por servicio. |
| **Qué se gana** | El menor costo y el menor riesgo de regresión. Las 16 sims intactas. | Las 16 sims conservadas dentro del marco buscado; el monolito finalmente partido en ~20 archivos; base sana para tocar sims de a una. | Página más liviana y coherente con la identidad clara de punta a punta; mantenimiento mínimo; performance móvil sin hipoteca. |
| **¿Permite el ritmo cromático buscado?** | **Parcial.** El wash por servicio ya existe (:8719-8729) pero en scroll vertical; el ritmo horizontal estilo oddcommon no. | **Sí** — si el wash lo maneja el marco nuevo con fuente única de activación. | **Sí**, y es donde más limpio queda: cada demo nace diseñada para su wash. |

**El dato que más le conviene tener antes de decidir:** ¿las sims deben pasar a la identidad clara, o pueden quedar como **"ventanas de aplicación oscuras" sobre la página clara** (patrón device-frame)? Esa única decisión mueve la balanza entera: si pueden quedar oscuras, el re-pintado de ~330 tokens desaparece del costo de A y B, y B queda en "extracción mecánica + marco nuevo"; si deben ser claras, conservar las 16 implica re-diseñar 16 piezas una por una — y ahí la distancia de costo entre B y C se achica lo suficiente como para que C merezca cotizarse en serio. Complemento útil: un prototipo de 1 tarde del contenedor horizontal con 2 escenas reales, medido en un Android de gama media, para convertir el punto 4 de riesgo estimado en número.
