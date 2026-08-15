# B0 — Auditoría de estado real · Rediseño del Home develOP

- **Fecha:** 2026-08-14
- **Worktree auditado:** `C:\redesign-home` · branch `redesign/home-v2` · HEAD `0f6fee58` · working tree limpio
- **Alcance de esta corrida (modificado por el usuario):** pasos 1–12 y 14. El Paso 13 queda **diferido a corrida aparte**. Parada 1 informativa (no bloquea); Parada 2 (pre-commit) vigente.
- **Ruta del reporte fijada por el usuario:** `docs/rediseno/outputs/B0-AUDITORIA.md`.
- **Método:** solo lectura sobre código y git. Nada se ejecutó contra base de datos; no se instaló nada; no se arregló nada.

> ⚠️ **Hallazgo de premisa (afecta a todo el reporte).** La instrucción decía que `redesign/home-v2` fue "recién creado desde main". No es así: su tip `0f6fee58` es el tip de `redesign/home`, y está **41 commits detrás de `main`** (behind 41 / ahead 0 — `git rev-list --left-right --count main...redesign/home-v2`). Entre esos 41 commits está `78b510ac` — *"feat(home): restaura la home clasica pre-rediseno desde 63a4e364"* — más el bloque carreras/P2002, el bloque privacidad (P1–P3), los fixes VOZ/MUDEZ del chatbot y P11 de LeadOS. **Consecuencia:** el árbol que audita este reporte contiene el home REDISEÑADO (sistema nuevo B1–B4, base crema/pastel), mientras que `main` hoy tiene la home clásica restaurada. Este reporte describe lo que hay en `redesign/home-v2`; donde el desfase con `main` importa, se señala.

---

## Paso 1 — Inventario git y branch de diseño

Comandos: `git branch -a --format=...`, `git log --oneline -5 <branch>`, `git rev-list --left-right --count main...<branch>` (desde `C:\redesign-home`; sin `fetch` — refs remotas al último fetch existente). `main` local == `origin/main` == `1e5b7fbb` (2026-08-12).

Worktrees registrados (`git worktree list`): `C:/PorfolioDevelOP` [redesign/home] · `C:/PorfolioDevelOP/audit-clean` [chore/auditoria-clean] · `C:/PorfolioDevelOP/logic-core-runtime` [main] · `C:/redesign-home` [redesign/home-v2]. Ninguno se tocó salvo el propio.

| Branch | Último commit | Fecha | Mensaje | behind/ahead vs main |
|---|---|---|---|---|
| `redesign/home-v2` (este worktree) | 0f6fee58 | 2026-08-10 | docs(perf): D11 — framer-motion en el home | 41 / 0 |
| `redesign/home` | 0f6fee58 | 2026-08-10 | (mismo tip que v2) | 41 / 0 — mergeada a main vía `dc2be42a` |
| `redisign/home` (typo) | d8f970a3 | 2026-08-03 | fix(home): revela la capa 3D del hero | 75 / 0 — ancestro de HEAD (verificado `merge-base`) |
| `revert-home-abortado` | 1c887922 | 2026-08-12 | Revert "feat(home): hero tipografico del sistema nuevo" | 43 / **3 sin mergear** (3 reverts del rediseño) |
| `home-clasico-referencia` | 63a4e364 | 2026-07-31 | fix(chatbot): watchdog por contenido | 92 / 0 — fuente de la restauración clásica en main (`78b510ac`) |
| `b0-isolation-motor-chatbot` | c311d103 | 2026-07-16 | docs: cierre de bloque PA | 159 / 8 |
| `chore/auditoria-clean` (local) | afa3094f | 2026-07-18 | docs: auditoria CLEAN 2026-07 | 159 / 1 — diverge de su remota |
| `runtime/mejoras` | 776e9b43 | 2026-07-11 | CRON-2 scheduled function | 170 / 0 |
| `origin/chore/auditoria-clean` | 0b5d4618 | 2026-08-12 | docs(auditoria): baseline auditoria-clean | 156 / 1 |
| `origin/b1-s1-bsp-inbound` | 0216bf89 | 2026-07-09 | fix(isolation): re-parenting CrmSyncAttempt | 179 / 1 |
| `origin/b1-s2-bsp-outbound` | b7170146 | 2026-07-15 | chore: ignora caché Playwright | 174 / 0 |
| `origin/b2-s1-bot-sync-surface` | fdf5e1d4 | 2026-07-17 | feat(chatbot): superficie sync | 161 / 1 |
| `origin/chore/auditoria-maestra` | 5ff538db | 2026-07-10 | docs: auditoria maestra 2026-07 | 183 / 1 |
| `origin/chore/auditoria-seguridad` | 707bfe27 | 2026-07-29 | docs: auditoria de seguridad | 156 / 2 |
| `origin/chore/dead-code-sweep` | 249bddb7 | 2026-06-11 | Merge main | 833 / 0 |
| `origin/chore/gs-aislamiento` | 403280b7 | 2026-07-11 | test(isolation): golden suite | 183 / 2 |
| `origin/chore/security-quick-wins` | 1f630ea7 | 2026-07-22 | chore: seed sandbox 360dialog | 156 / 3 |
| `origin/chore/wf-home` | e42c6bce | 2026-06-08 | wip(wf-home): estructura WF | 852 / 1 |
| `origin/claude/festive-ptolemy-d98e1c` | 62544284 | 2026-07-06 | Merge main | 183 / 0 |
| `origin/claude/priceless-nobel-ed8d02` | dd8a8240 | 2026-08-12 | fix(setter): minReactivacion lazy | 272 / 1 |
| `origin/claude/sad-burnell-2f5e2d` | 8b6686a8 | 2026-08-12 | test(setter): assert del opener | 271 / 1 |
| `origin/experimento/estetica-goal` | 7990f312 | 2026-06-02 | docs(bitacora): cierre FIX.1-6 | 852 / **15 sin mergear** |
| `origin/fix/fonts-geist-scope` | 5effc62b | 2026-07-30 | fix(fonts): variables Geist | 100 / 0 |
| `origin/fix/home-sanidad` | a0d7875f | 2026-07-29 | fix(home): three fuera del bundle inicial | 109 / 0 |
| `origin/fix/motion-sanidad-mobile` | c54e608d | 2026-07-30 | fix(motion): reduced-motion 100Hz | 110 / 0 |
| `origin/leados/b8a-hardening` | fc2a09a1 | 2026-06-13 | fix(b8a/seguro) | 817 / 0 |
| `origin/leados/b8a-ii` | 88ac6db3 | 2026-06-13 | feat(b8a-ii/seguro) | 816 / 0 |
| `origin/leados/b8a-iii` | 63a5c782 | 2026-06-13 | docs(b8a-iii): auditoria | 815 / 3 |
| `origin/leados/p11-turno` | 513f38b4 | 2026-08-12 | feat(leados): P11 | 40 / 0 |
| `origin/main-backup-pre-b8a` | 11b2d853 | 2026-06-11 | Merge main | 823 / 0 |
| `origin/recon-origin-main` | a6746085 | 2026-06-05 | feat(db): drop planName | 843 / 0 |

**Candidato a "branch de diseño previo" — con evidencia:**

- El trabajo de diseño vive en el par **`redisign/home`** (typo) → **`redesign/home`**: `git log --all --grep` ubica `0e4c9b05` *"feat(home): hero tipografico del sistema nuevo"* y `9a18efb0` *"refactor(home): purga del intro, el 3D y la navegacion vieja"* en `redisign/home`, y los commits crema/pastel (`df62c74c` *"fix(design-system): calibración del piso móvil, acentos, CTA e índice"*, `90510f55` *"seccion de servicios, los cuatro frentes"*, `66c74a39` *"seccion de caso real"*, `f24afa52` *"fusion de por que develOP y somos"*, `f9a20b26`) en `redesign/home`.
- **Ambos son ancestros de `redesign/home-v2`** (verificado con `merge-base --is-ancestor`): el "branch de diseño previo" **ya está adentro del árbol auditado**. La "inmersión" del Paso 13 se solapa en gran parte con lo que este reporte describe directamente en los pasos 2–12.
- Lo único del lane de diseño que NO está en HEAD: los 3 reverts de `revert-home-abortado` (deshacen el rediseño; tampoco están en main) y la restauración clásica `78b510ac` (está solo en main).
- `origin/experimento/estetica-goal` (junio) NO es el branch de diseño del home: sus 15 commits propios son polish de motion del portal (StaggerReveal, FadeIn en dashboard/admin) + fixes de chatbot/cron, con reporte final `docs(EXP-EST)`.

**Paso 13: diferido a corrida aparte** (decisión del usuario; ver sección Paso 13).

---

## Paso 2 — Composición real del home

`src/app/page.tsx` (55 líneas, Server Component): el home post-**B4-S3** son **seis secciones + footer**, alternancia estricta de tema, índice de capítulos correlativo:

| # | Sección | Tema | `id` | Archivo | Naturaleza |
|---|---|---|---|---|---|
| 01 | Hero | oscuro | `inicio` | `src/components/layout/Hero.tsx` | Server Component; base tipográfica + capa 3D diferida |
| 02 | Portfolio ("el caso real") | crema | `portfolio` | `src/components/sections/home/Portfolio.tsx` | Server Component, cero JS |
| 03 | PortalDemo ("el panel del lunes") | oscuro | `portal-demo` | `src/components/sections/portal-demo/PortalDemo.tsx` | Client; único motion vivo del home |
| 04 | Nosotros (Por qué develOP + Somos) | crema | `caracteristicas` + `nosotros` (bloque interno) | `src/components/sections/nosotros/Nosotros.tsx` | Server Component, cero JS |
| 05 | Servicios ("los cuatro frentes") | oscuro | `servicios` | `src/components/sections/servicios/Servicios.tsx` | Server Component, cero JS |
| 06 | Cierre | crema | (sin id) | `src/components/sections/cierre/Cierre.tsx` | Server Component; único JS = `ContactoCta` |
| — | Footer | oscuro fijo `#050505` | — | `src/components/sections/home/Footer.tsx` | **Legacy**: client, Framer, glassmorphism, estilos inline |

Hallazgos estructurales:

- **Ya NO hay `dynamic()` en `page.tsx`** — documentado en el docblock: las secciones pesadas que lo justificaban (el monolito `OurServices` de 9.898 líneas, dos scrollytelling de 400vh, el marquee) se borraron en B4-S3. El JS de la página vive en tres islas: `SectionShell` (observa viewport e invierte tema), el ciclo de escenas de PortalDemo, y el CTA del cierre.
- **Ya NO existe `SectionWrapper`** (la instrucción original preguntaba por él). El reveal es `animate-ds-reveal` — animación CSS del sistema, sin JS ni Framer, precisamente para que el SSR no emita `opacity:0`. El titular del hero usa `animate-ds-rise` (sin tramo de opacidad) por candidatura LCP (medido: dentro del fade pintaba a FCP+1.020 ms).
- **`HomeWrapper`** (`src/components/layout/HomeWrapper.tsx`, 23 líneas): client; `motion.main` que anima `backgroundColor`/`color` según `useTheme()` (`#fafafa`/`#18181b` claro · `#000000`/`#ffffff` oscuro, 0.8s easeInOut). Ojo: estos hex son del sistema VIEJO (`ThemeProvider` de `useThemeObserver.tsx`), no los tokens crema del DS — conviven dos mecanismos de inversión (ver Paso 5).
- **`SectionShell`** (`src/components/design-system/SectionShell.tsx`): dueño del theming del sitio rediseñado. Escribe `data-ds-theme` en su `<section>` (alcance local, sin provider) y además avisa al `ThemeProvider` global con `useInView(margin: '-45% 0px -45% 0px', once:false)` vía `useThemeSectionOptional`.
- **Hero**: dos capas desacopladas. Base tipográfica server-rendered (hero terminado, sin readiness gate, sin bloqueo de scroll) + `HeroArtifactLayer.tsx`: monta `HeroCanvas` por `dynamic(ssr:false)` solo en desktop (`min-width:1024px`), sin `prefers-reduced-motion`, en idle post-paint; `IntersectionObserver` pasa `frameloop` a `'demand'` fuera de viewport; `CanvasErrorBoundary` contiene fallos del canvas (documentado: un HDRI que no baja tumbaba el home entero); red de seguridad de reveal a 6s.
- **Portfolio**: lámina de case study (Concesionaria San Miguel) + 3 demos conceptuales. Un solo árbol JSX (el viejo servía desktop+mobile completos en el HTML → documento de 465 KB). **Copy central en PLACEHOLDERS** con gate de merge explícito (ver Paso 3/Riesgos).
- **PortalDemo**: 3 escenas de un lunes (8:30/9:00/9:30) con riel clickeable; datos en `portal-demo/data.ts` verificados contra el código real del portal (health-score.ts, attention.ts, week-results.ts, executive-brief.ts). Ciclo en `useEscenaCycle.ts` (5.2s; se cancela fuera de viewport; sin ciclo bajo reduced-motion; selección manual corta el loop). Las 3 escenas siempre en el DOM (evita error de hidratación #418). `PanelPlate.tsx` dibuja la lámina del producto.
- **Nosotros**: fusión de `WhyDevelOP.tsx` (1.726 líneas) + `About.tsx` (528 líneas) en sección estática; datos en `nosotros/data.ts`. `id="caracteristicas"` en la sección (TransitionContext congelado lo hardcodea en sus líneas 28/41), `id="nosotros"` en el bloque del equipo.
- **Servicios**: 4 filas desde `servicios/data.ts`; única sección con los 4 acentos (por eso oscura: 3 de 4 acentos no llegan a 3:1 sobre crema). **Sin pricing por decisión D1** (módulos y precios salen del home hacia futura página de producto); sin links a landings (el camino es el desplegable del Navbar).
- **Footer**: pieza NO migrada al sistema — client component con Framer (`pathLength` sobre el logo SVG complejo, 2.7s), glassmorphism (`backdrop-filter: blur(20px) saturate(180%)`), estilos inline, fondo fijo `#050505`, formulario de contacto que postea a `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL` con fallback a WhatsApp, claims propios ("Respondemos en menos de 2hs", "2+ años en el mercado").
- Chrome global (layout.tsx): `PreloaderProvider` → `SmoothScroll` → `TransitionProvider` → `Shutter`/`Navbar` dentro de `PublicOnlyComponents` + `Preloader` + `Toaster` (dark) + `ChatWidgetMount`. `CustomCursor` y `NoiseOverlay` fueron desmontados y sus archivos borrados (B2-S2/B2-S4).

---

## Paso 3 — Volcado del copy actual

Fidelidad literal: los textos van tal cual están en el código (con sus inconsistencias de tildes). Los `[PLACEHOLDER — …]` son literales del código, no de este reporte. Home relevado a mano; las 4 landings y `/contact` por subagentes de extracción literal (archivos y líneas citados).

### 3.1 HOME (`/`)

**Chrome — Navbar** (`src/components/layout/Navbar.tsx`): wordmark `develOP` · items: `Inicio` `Nosotros` `Portfolio` `Servicios` `Características` `Contacto` · desplegable servicios: `Sitio web`/`Presencia profesional` · `Agente de IA`/`Atención 24/7` · `Software`/`Sistema a medida` · `Automatización`/`Tareas automáticas` · `Ver todos los servicios` · controles: `Acceder` · CTA `Escribinos` · mobile: `Menú`/`Cerrar` · `Acceder al portal` · en landings los items pasan a `Inicio`/`Proceso`/`FAQ`/`Contacto`.

**01 · Hero** (`src/components/layout/Hero.tsx`)
- ChapterLabel: `01` · eyebrow: `Ingeniería de software — Tucumán, AR`
- H1: `Software de élite, sin la burocracia de agencia.`
- Lead: `Web, agentes de IA y sistemas a medida para negocios que quieren operar en serio. Desde Tucumán, para todo el país.`
- CTA: `Escribinos por WhatsApp` · microcopy: `Te respondemos hoy. Coordinamos una llamada de 30 minutos, directo con un ingeniero.`

**02 · Portfolio — "Caso real"** (`sections/home/Portfolio.tsx`, data inline `CASO`/`RESULTADOS`/`DEMOS`)
- `02` + MonoLabel `Caso real` · H2: `Esto ya funciona.`
- Cliente: `Concesionaria San Miguel` · rubro: `Concesionaria — Tucumán`
- Contexto: `[CONTEXTO — 1 línea: qué perdían antes de develOP]` · Qué construimos: `[ENTREGABLE — 2 a 3 líneas: el sistema concreto que se entregó. No "un sitio web": qué hace, quién lo usa adentro de la concesionaria y qué reemplazó.]` · href: `[URL DEL CASO]`
- `Resultados`: `[+00%]`/`Consultas canalizadas` · `[00 días]`/`Tiempo a producción` · `[000]`/`Vehículos publicados` · CTA `Ver el sitio` · microcopy: `Ninguna cifra de esta sección está estimada. Las casillas quedan con el placeholder a la vista hasta que Franco cierre los números del caso.`
- `Demos conceptuales`: `Sistemas que armamos para mostrar cómo se aplica a cada rubro. No son clientes: son demostraciones.` · 3 celdas `Demo conceptual — [RUBRO 1/2/3]` / `[QUÉ RESUELVE — 1 línea]`

**03 · PortalDemo — "el panel del lunes"** (`sections/portal-demo/PortalDemo.tsx` + `data.ts` + `PanelPlate.tsx`)
- `03` + `Un lunes cualquiera` · H2: `Un lunes a la mañana, abrís tu panel.` · Lead: `Mientras arrancás el café, el sistema ya trabajó.`
- Escena 8:30 / `Recién prendés la computadora.` — `¿Cómo viene la semana?` — Qué ves: `El Health Score. Un número del 0 al 100 armado con tres partes: salud digital, comercial y operativa.` — Qué hacés: `Lo mirás dos segundos y sabés si tenés que meterte o no.`
- Escena 9:00 / `Ya te hiciste el café.` — `¿Qué necesita mi atención hoy?` — `Tu Atención Hoy: lo pendiente, ordenado por urgencia. Una entrega esperando que la apruebes, una reseña sin responder, una factura por vencer.` — `Aprobás la entrega. El resto lo dejás para después del almuerzo.`
- Escena 9:30 / `Falta poco para la primera reunión.` — `¿Cómo nos fue esta semana?` — `Los resultados de la semana contra la anterior: leads nuevos, mensajes respondidos, tareas terminadas. Abajo, el resumen que escribió la IA.` — `Lo leés y entrás a la reunión sabiendo de qué hablar.`
- PanelPlate: `Panel del cliente · {hora}` · `Health Score` `[00]/100` · dimensiones `Salud Digital`/`Salud Comercial`/`Salud Operativa` (valor `[00]`) · `Tu atención hoy`: `Crítico`/`[ENTREGA QUE ESPERA APROBACIÓN]` · `Alta`/`[RESEÑA SIN RESPONDER]` · `Puede esperar`/`[FACTURA POR VENCER]` · `Resultados de la semana` / `vs semana anterior` · métricas `Leads`/`Respondidos`/`Completadas` (`[00]` `[+00%]`) · `Resumen de la IA` (barras wireframe)
- CTA: `Escribinos por WhatsApp` · microcopy: `El panel viene con lo que entregamos. No se paga aparte.`

**04 · Nosotros** (`sections/nosotros/Nosotros.tsx` + `data.ts`)
- `04` + `Por qué develOP` · Contrastes (`Una agencia` vs `develOP`):
  1. `Hablás con un ejecutivo de cuentas que le pasa el mensaje al que programa.` → `Hablás con el ingeniero que lo construye.`
  2. `Presupuesto, brief y semanas de ida y vuelta antes de la primera línea de código.` → `[PLAZO — a definir con dato real]`
  3. `[CONTRASTE 3 — LADO AGENCIA]` → `[CONTRASTE 3 — LADO DEVELOP]`
- H2 (bloque `#nosotros`): `Ingenieros, no intermediarios.`
- Fichas: `Franco` / `Estrategia · Comercial · Planificación` / `[ROL EN UN PROYECTO — 1 línea]` · `Valentino` / `Ejecución técnica` / `[ROL EN UN PROYECTO — 1 línea]`
- Ubicación: `Tucumán, Argentina — trabajamos con clientes de todo el país.`

**05 · Servicios — "los cuatro frentes"** (`sections/servicios/Servicios.tsx` + `data.ts`)
- `05` + `Servicios` · H2: `Cuatro frentes. Un sistema.`
- `Desarrollo web` / `Para negocios que hoy pierden consultas porque su web no vende.` / `Sitio a medida, rápido, con la conversión medida.` / `15 días`
- `Agentes de IA` / `Para quienes responden las mismas preguntas todo el día.` / `Un agente entrenado con tu información, atendiendo en tu canal.` / `7 días`
- `Automatización de procesos` / `Para operaciones que viven pegadas con planillas y copiar-pegar.` / `Los procesos conectados, corriendo solos.` / `5 días`
- `Software a medida` / `[PARA QUIÉN — 1 línea]` / `[ENTREGABLE — 1 línea]` / `[00 días]`
- Sin precios (decisión D1) y sin links a landings.

**06 · Cierre** (`sections/cierre/Cierre.tsx` + `ContactoCta.tsx`)
- `06` + `Contacto` · H2: `Empecemos por una llamada.`
- Lead: `Hablás directo con el ingeniero que lo va a construir, sin un ejecutivo de cuentas en el medio.`
- p: `[TIEMPO DE RESPUESTA Y DURACIÓN DE LA LLAMADA — a definir con dato real]`
- CTAs: `Escribinos por WhatsApp` · `Otras formas de contacto` (→ `/contact`)

**Footer (legacy, fuera del sistema)** (`sections/home/Footer.tsx`)
- H2: `¿No sabés por dónde` / `empezar?`
- p: `Contanos tu negocio en 2 minutos. Te decimos exactamente qué necesitás y cuánto te costaría. Sin compromiso. Sin tecnicismos.` · callout: `El primer paso es gratis.`
- Card WhatsApp: `WhatsApp directo` / `Respondemos en menos de 2hs en horario comercial` / `Abrir chat →` · Card form: `Completar formulario` / `Contanos tu negocio y te preparamos una propuesta` / `Ver formulario →`
- Form: labels `Nombre`/`WhatsApp`/`Rubro de tu negocio`/`¿Qué necesitás?` · placeholders `Tu nombre` / `+54 381 000-0000` / `Ej: Clínica, Restaurante, Gimnasio...` / `Contanos brevemente qué querés lograr con tu negocio...` · botones `Volver` / `ENVIAR CONSULTA →` (`ENVIANDO...`) · microcopy `Te respondemos en menos de 2hs · Sin compromiso` · éxito: `¡Consulta enviada!` / `Te contactamos en menos de 2hs.`
- Trust row: `Tucumán, Argentina` · `Respuesta Inmediata` · `Consulta gratuita` · `2+ años en el mercado`
- Redes: `LinkedIn` `Instagram` `Twitter/X` `Email` (linkedin.com/company/develop-agency · instagram.com/develop.agency · twitter.com/develop_agency · hola@develop.com.ar) · `2026 … Todos los derechos reservados.`

### 3.2 `/contact` (`src/app/contact/page.tsx` — todo inline, sin dynamic())

- Eyebrow: `develOP - contacto directo` · H1: `Hablemos hoy.`
- p (desktop): `Esta página es solo para contacto. Sin scroll, sin distracciones, directo a la acción. Elegí el canal que te quede cómodo y te respondemos rápido.` · p (mobile): `WhatsApp, llamada o email. Elegí tu canal y arrancamos.`
- Form: `Nombre *`/`Tu nombre` · `Email *`/`tu@email.com` · `Teléfono`/`+54...` · `Empresa`/`Nombre empresa` · `Servicio` → opciones `Selecciona un servicio` / `Automatización de procesos` / `Software a medida` / `Desarrollo web` / `Implementaciones IA` / `Otro` · `Mensaje *`/`Contanos brevemente qué necesitás...` · botón `Enviar consulta` (`Enviando...`)
- Éxito: `Mensaje enviado` / `Te respondemos pronto. Si querés acelerar, también podés contactarnos por WhatsApp o llamada.`
- Errores (server action `lib/actions/contact.ts` + Zod `schemas.ts`): `Demasiados intentos. Por favor, esperá unos minutos antes de reenviar.` · `No se pudo enviar el formulario. Intentá de nuevo.` · `Nombre inválido.` · `El email no es válido.` · `El mensaje debe tener al menos 10 caracteres.` · `Código inválido.`
- Trust: `Tiempo de respuesta`/`Menos de 2 horas` · `Diagnóstico inicial`/`Sin costo` · `Base operativa`/`Tucumán, Argentina`
- Canales: `Canales` / `Elegí cómo hablar` / `Online ahora` · `WhatsApp`/`Respuesta rápida en horario comercial`/`Escribir ahora` · `Llamar`/`Coordinamos una llamada de descubrimiento`/`Llamar ahora` · `Email`/`Dejanos contexto y te devolvemos plan de acción`/`Enviar email` · `Datos directos`: `hola@develop.com.ar` / `+5493816223508`
- Prefill WhatsApp: `Hola develOP, quiero hablar sobre mi proyecto.` · Submit: Server Action `submitContactForm` → Prisma `contactSubmission.create` + `sendAgencyAlert` + webhook n8n.
- Metadata (layout): `Contacto | develOP — Agencia Digital Tucumán` · `…Respondemos en menos de 24 horas.` (⚠ distinto del claim en página: `Menos de 2 horas`).

### 3.3 `/web-development` (page.tsx client; único dynamic(): `HeroBackground` ssr:false)

Orden real: Hero (inline en page.tsx) → WebDevelopmentByRubro → WebDevelopmentBento → ComparadorSection → WebTemplatesImmersive → StatementSection → WebDevelopmentSeo → WebDevelopmentTimeline → WebDevelopmentFaq → AiSection → PricingSection → WebDevelopmentCta. Muertos en carpeta (no renderizados): ShowcaseSection, WebDevelopmentObjections, WebDevelopmentSensory, PortfolioWebCases, TemplateWarehouse.

- **Hero** (page.tsx:85-224): eyebrow `TU SUCURSAL MAS RENTABLE` · chips `Next.js` `TypeScript` `Lighthouse 100` `Desde $800 USD` `4-6 semanas` · H1 `Tu negocio, abierto` / `Las 24 horas.` · p `Transformamos tu Instagram y WhatsApp en un ecosistema que atrae clientes, cotiza y vende solo. Sin que tengas que estar presente.` · CTA `CONSTRUIR MI SUCURSAL` · métricas (`HeroMetrics.tsx`): `24/7 Hs atendiendo clientes` · `2 s segundos de carga máximo` · `#1 en Google local`
- **ByRubro**: `[ Tu web, tu industria ]` · H2 `Una web que trabaja para tu negocio específico.` · p `Cambiamos el envoltorio genérico por una narrativa pensada para el problema real de tu rubro y para la decisión que querés provocar.` · tabs `Concesionaria/Salud/Fitness/Gastronomía/Inmobiliaria`; por rubro: headline+problema+solución+resultado+3 mock-items (p.ej. Concesionaria: `Tu concesionaria sigue vendiendo incluso cuando el salón está cerrado.` / problema `Clientes comparan modelos y precios fuera de horario y se van con quien sí muestra un catálogo ordenado.` / solución `Diseñamos una vitrina digital con filtros, fichas claras y consulta directa lista para pasar al equipo comercial.` / resultado `Más contactos calientes sin depender del horario del showroom.`; Salud `Tu clínica consigue pacientes mientras vos seguís atendiendo.`; Fitness `Tu gimnasio convierte interés en inscripción sin repetir siempre lo mismo.`; Gastronomía `Tu restaurante se reserva mejor cuando la experiencia ya abre el apetito antes de llegar.`; Inmobiliaria `Tu inmobiliaria destaca propiedades con una lectura mucho más seria que un feed suelto.` — data completa en `WebDevelopmentByRubro.tsx:23-119`)
- **Bento**: `[ Por qué la web cambia todo ]` · `No es una página web. Es tu vendedor más eficiente.` · cards: `Confianza en tres segundos.` (+pills `UX que retiene`/`Carga ultra rápida`/`Conversión mobile`) · `El cliente que espera, se va.` (gauge `Lighthouse` 100) · `SEO local` / `Primero en Google en tu ciudad.` + stat `3x más consultas desde búsqueda local` · `Conversión B2B` / `Tu web vende mientras dormís.` · cue `Mirá cómo lo hacemos` / `Una web que no convierte es decoración cara.`
- **Comparador**: `[ EL ANTES Y EL DESPUES ]` · `Dos negocios iguales. Uno gana clientes 24/7.` / `¿En cual estas vos?` · `EL NEGOCIO DE INSTAGRAM` (5 ítems: `Respondes precios 100 veces por día` · `Si no contestas, el cliente se va` · `Dependes del algoritmo de Instagram` · `A las 2AM, el cliente no puede comprarte` · `Google no sabe que existis`) vs `LA SUCURSAL DIGITAL` (`Tu web cotiza sola mientras dormis` · `Google te trae clientes listos para comprar` · `Tu catálogo actualizado sin llamarte` · `Pedidos a las 3AM sin que estes presente` · `Primero en Google en tu ciudad`) · señales `+8h semanales en respuestas manuales`/`Visibilidad local casi nula` vs `Primera respuesta en menos de 15s`/`Flujo de leads activo 24/7` · pie: `47 negocios locales ya eligieron El Control -> ¿Y vos?`
- **TemplatesImmersive** (`TEMPLATES`, 6): `Zero Protocol` (Tech/terminal, template-zero.netlify.app) · `The Ethereal Resort` (Hospitality, template-ethernal) · `Noir Dining in the Void` (Gastronomía, template-noir) · `Skyline Estates` (Real estate, template-skyline) · `NEXO Bold` (Agency brutalist, template-bold) · `YAKU Nebula` (SaaS neon, template-nebula) · CTA por card `Ver template`
- **Statement**: `El diseño no es cómo se ve. / Es cómo funciona. / Y cómo convierte.` · `DEVELOP · TUCUMÁN`
- **Seo**: `[ Posicionamiento local ]` · `Si no estas en Google,` + rotativas `no existis.` / `perdes plata.` / `perdes el tiempo.` / `vas atrás.` · checks: `Google te encuentra primero con estructura optimizada.` · `Tu negocio aparece en mapa, ficha y búsqueda local.` · `La velocidad acompaña el ranking y la conversión.` · simulador con queries `Corralón en Yerba Buena` / `Estética en Barrio Norte Tucumán` / `Clínica odontológica en Salta` / `Distribuidora de alimentos Tucumán` / `Restaurante en San Miguel Tucumán`
- **Timeline**: `[ De cero a lanzamiento ]` · `Cuatro semanas. Tu negocio, transformado.` · Semana 01 `Estrategia y diseño` → `Diseño aprobado antes de construir` · Semana 02 `Construcción` → `Web funcional en entorno de prueba` · Semana 03 `Posicionamiento Google` → `Search listo para salir a producción` · Semana 04 `Lanzamiento y ventas en producción.` (checks `Entrega completa y acceso total a tu web` / `Base de posicionamiento lista para Google` / `Soporte y acompañamiento durante el lanzamiento`) · CTA `Iniciar transformacion`
- **Faq** (8 Q&A en `WebDevelopmentFaq.tsx:12-53` + 3 objeciones :55-68): incluye `¿Por qué no usar Wix, WordPress o TiendaNube?`, `¿Cuánto cuesta una página web profesional?` → `Nuestros proyectos arrancan desde 800 USD…`, `¿En cuánto tiempo está lista mi web?` → `En 4 semanas…`, `¿Posicionan en Google (SEO)?`, `¿Puedo ver ejemplos…?`, `¿Trabajan con negocios de otras provincias…?`, `¿Qué pasa después de la entrega? ¿Me dejan solo?` · objeciones `¿Y si no me gusta cómo queda?` / `¿Qué pasa si quiero cambiar algo después?` / `¿Qué incluye exactamente?` · cierre `¿Tenés otra pregunta?` / `Abri el chatbot y pregunta lo que quieras.`
- **AiSection**: `[ QUERES MAS? ]` · `Sumale IA a tu web cuando vos quieras.` · cards `Responde al instante` / `Cotiza y agenda solo` / `Se posiciona solo` · CTA `Ver todas las implementaciones de IA ->`
- **Pricing** (`TIERS` inline, `PricingSection.tsx:21-57`): `Invertis una vez. Tu web factura todos los días.` · **Base $490 USD** `Para arrancar rápido` (`1 pagina principal`, `SEO local inicial`, `Boton WhatsApp + formulario`, `Carga rápida mobile`) · **Completa $980 USD** `La opción más elegida` (`Hasta 6 páginas`, `SEO local + estructura avanzada`, `Integraciones (WhatsApp, pagos)`, `Panel editable + analitica`) · **Escala $1.690 USD** (`Todo lo de Completa`, `Automatizaciones de ventas`, `Embudo y seguimiento de leads`, `Soporte prioritario 30 días`) · CTA `Activar plan` · pie `Sin letra chica. Ajustamos alcance y etapas según tu negocio.`
- **Cta**: badge `Agenda limitada: 2 cupos de implementación esta semana` · eyebrow `SI HOY NO TE ENCUENTRAN, MAÑANA LE COMPRAN A OTRO` · H2 `Cada día sin tu web optimizada es plata que queda afuera.` · chips `Diagnóstico inicial sin costo` / `Inversión desde 800 USD` / `Respuesta promedio menor a 2 horas` · CTA `Quiero mi diagnóstico ahora` · form (`Tu nombre`/`Tu WhatsApp`/`Mi rubro...` + `Gastronomia/Comercio/Servicios/Salud/Inmobiliaria/Otro`/textarea/`Enviar y reservar diagnóstico`)

### 3.4 `/ai-implementations` (page.tsx client; sin dynamic())

Orden real: HeroIA → DemoIA → GarantiaIA → PipelineIA → placeholder inline `DEMO EN RECONSTRUCCIÓN` (reemplaza al viejo LiveChatIA; TODO S16) → RubrosIA → ComparadorIA → (TestimoniosIA importado pero **apagado** por `SHOW_TESTIMONIOS_SECTION = false`) → FaqIA → CtaIA. Huérfanos no importados: `BentoIA.tsx`, `CalculadorIA.tsx`, `VaultIA.tsx`.

- **HeroIA**: eyebrow `TU EMPRESA, EN PILOTO AUTOMATICO` · H1 `Tu empresa trabaja mientras dormis.` · p `Sistemas de IA que responden consultas, cotizan y cierran ventas por WhatsApp. Sin empleados extra. Sin horarios. Sin que tengas que estar presente.` · CTA `Proba la IA ahora ->` · stats flotantes: `+42% LEADS CALIFICADOS` · `24/7 SIN DESCANSO` · `99.9% UPTIME` · `5x ESCALA SIMULTANEA` · `< 3s TIEMPO DE RESPUESTA` · `-80% CONSULTAS MANUALES`
- **DemoIA**: `IA PARA NEGOCIOS REALES` · `Como funciona la IA y por que conviene implementarla.` · stats `3 pasos`/`7-14 días`/`Hasta x3` · 6 cards PASO 01-03 (ENTRADA/LOGICA/ACCION) + BENEFICIO 01-03 (VENTAS/OPERACION/CONTROL) con bullets (data en `DemoIA.tsx`) · nota `Empezamos con un piloto enfocado en consultas de alto impacto…`
- **GarantiaIA**: `INTELIGENCIA CONTROLADA` · `Cero alucinaciones. Control total.` · p `Nuestros agentes no inventan respuestas…tus manuales, tus precios y tus politicas. Nada mas.` · features: `Solo responde lo que vos definís` / `Deriva automática a humanos` / `Todo queda registrado` / `Control total en tus manos` · pills `Tus reglas`/`Tus precios`/`Sin inventar`/`Deriva a humanos`
- **PipelineIA**: `[ DATA FLOW EN TIEMPO REAL ]` · `Así fluye la inteligencia.` · nodos `WhatsApp/Web Chat/Gateway/IA Core/Sheets/CRM/Slack` · 6 pasos explicativos + 3 escenarios de chat simulados (médico/inmobiliaria/ecommerce, textos completos en `PipelineIA.tsx`) · métricas `< 280ms latencia` / `99.9% disponibilidad` / `24/7`
- **RubrosIA** (4 tabs con chat mock `Asistente IA · DevelOP` / `● En linea ahora`): Restaurante `Tu restaurante llena mesas solo.` · Salud `Tu consultorio sin caos.` · Comercio `Tu local vende aunque cierre.` (chat con `Precio: $45.000`) · Inmobiliaria `Tu inmobiliaria trabaja de noche.` (chat `hasta $120k`) — cada uno con 3 automatizaciones + métrica (`↑ 40% ocupación`, `−60% ausencias`, `−80% consultas sin respuesta`, `×3 leads calificados`, etc.)
- **ComparadorIA**: `[ LA COMPARACIÓN QUE NADIE HACE ]` · `Empleado vs IA. Los números hablan.` · 8 filas (Disponibilidad `Lun–Vie · 9 a 18hs` vs `24/7/365` · **Costo mensual `$180.000 – $350.000` vs `Desde $25.000`** · Respuesta `2 – 24 horas` vs `< 3 segundos` · etc.) · ROI: `Ahorro mensual estimado $155.000` · `86% más económico` · pill `IMPLEMENTACION EN 7-14 DIAS` · contexto: `Modelo tradicional USD 450-700 / mes` vs `Implementación IA develOP Desde USD 300 inicial` · banner `En muchos negocios, 1 mes de atención manual ya cuesta más que implementar IA.`
- **TestimoniosIA (APAGADO, contenido fabricado marcado `Real testimonials content pending`)**: `María Álvarez`/Restaurante El Fogón · `Carlos Pereyra`/Distribuidora Pereyra · `Dra. Sofía Ramos`/Centro Médico Ramos
- **FaqIA** (8 Q&A + 3 objeciones, `FaqIA.tsx`): incluye `¿Qué diferencia hay entre un chatbot básico y un agente IA?`, `¿Cuánto cuesta implementar IA en mi empresa?`, `¿En cuánto tiempo puede quedar funcionando?` (`2 a 4 semanas`), `¿Qué pasa si la IA no sabe responder?`, `¿Cómo evitan respuestas inventadas…?`
- **CtaIA**: badge `Agenda limitada: 2 cupos de implementación IA esta semana` · `SI NO AUTOMATIZAS HOY, MAÑANA PERDES CONSULTAS` · H2 `Tu empresa con IA operativa en 30 días.` · chips `Diagnóstico inicial sin costo` / **`Implementación desde USD 300`** / `Respuesta promedio menor a 2 horas` · CTA `Quiero mi diagnóstico IA ahora` · form idéntico al de web-dev con submit `Enviar y reservar diagnóstico IA`
- Metadata (layout.tsx): description `…Desde $1.800 USD.` ⚠ inconsistente con `USD 300` en página.

### 3.5 `/process-automation` (page.tsx client; dynamic(): `DataPacketsCanvas` ssr:false)

Orden real: HeroAutomation → IntegracionesAutomation → FlujoAutomation → BentoAutomation → RubrosAutomation → CalculadoraAutomation → ProcesoAutomation → VaultAutomation (pricing) → FaqAutomation → CtaAutomation. Huérfanos: `ComparativaAutomation.tsx` (n8n vs Make vs Zapier con precios `$9–$29`/`$20–$69` USD/mes), `SocialProofAutomation.tsx` (testimonios).

- **Hero**: badge `PROCESOS QUE CORREN SOLOS 24/7` · H1 `Eliminá el trabajo robótico para siempre.` · p `Cada semana sin automatizar le cuesta a tu empresa +12 horas de trabajo manual en tareas repetitivas que no facturan. Conectamos WhatsApp, MercadoPago, AFIP y Excel…` · CTAs `Encender mi empresa →` / `Ver cómo funciona` · stats `0% trabajo manual/Garantizado` · `24/7/Operando solo` · `<10%/del costo de un sueldo` · hint `Mové el mouse para ver la magia`
- **Integraciones**: `[ Tus herramientas, conectadas ]` · `Todo lo que ya usás. Ahora conectado.` · 12 pills (n8n, WhatsApp, Mercado Pago, Gmail, Google Sheets, Notion, Slack, Tiendanube, Stripe, HubSpot, Calendar, AFIP) · badge `400+ automatizaciones posibles`
- **Flujo**: `[ LA ANATOMÍA DE UN WORKFLOW ]` · `Un lead entra. Tres cosas pasan a la vez.` · nodos SVG `Pago Recibido/Validar Pago/Emitir Factura/Orquestador/Notificar Cliente/Aviso Logística/Libro Ventas` + log en vivo · métricas `100% Efectividad en los datos` / `0ms Error en transcripción` / `24/7 Vigilancia constante`
- **Bento** (6 workflows antes/después en `BentoAutomation.tsx:174-358`): Ventas (`El lead se enfría en WhatsApp` → `Respuesta en segundos, 24/7`; pain `3 de cada 10 leads se pierden por demora`) · Facturación (`Cargar facturas a mano en AFIP` → `Cobro recibido, factura enviada`) · Stock (`Prometer stock que no tenés` → `Sincronización total e inteligente`) · Reportes (`Perder el domingo armando Excels` → `Tu negocio, en un solo vistazo`) · Atención (`Tu equipo atrapado en dudas básicas` → `Tu gente, solo donde genera valor`; `90% de consultas resueltas por el sistema`) · Cobranzas (`Cobros vencidos sin seguimiento` → `Recordatorios automáticos y cobro ágil`)
- **Rubros** (4 tabs, cada uno con flujo n8n de 6 nodos con `Claude Sonnet 4.6` como AI NODE): Comercio `Tu comercio vende sin que estés.` · Gastronomía `Tu restaurante llena mesas solo.` · Salud `Tu consultorio sin caos.` · Servicios `Tus servicios se venden mientras dormís.` — con métricas (`-80% consultas manuales`, `+40% ocupación`, `-60% ausencias`, `x3 leads calificados`…)
- **Calculadora** (ROI, `id=calculadora`): `Automatizar no es ahorrar centavos. Es recuperar margen todos los meses.` · sliders (tareas/día 5-200 def 25 · min/tarea 2-45 def 12 · costo hora $5-$100 def $20) · fórmula fija 82% de reducción, 22 días hábiles, `costoAutomation = $240 USD/mes` · pie `Base: 22 días hábiles, 82% de reducción manual y automatización desde $240 USD/mes.` · CTA `Calcular mi ROI real`
- **Proceso** (4 fases): `Del caos al orden en 15 días.` · F01 `Relevamiento de procesos` (1-2 días) · F02 `Arquitectura de flujos` (3-5 días) · F03 `Activación y testing` (2-3 días) · F04 `Capacitación y soporte` (1 día + 30 días acompañados) · banner `Tiempo total según complejidad: 1 a 2 semanas`
- **Vault (pricing)**: `Elegí cuánto querés delegar. El sistema hace el resto.` · **Básico $199 USD/mes** (`1 automatización activa`, `WhatsApp + 1 herramienta`, `Setup, pruebas y lanzamiento`, `Monitoreo y soporte por WhatsApp`) · **Crecimiento $499 USD/mes** `Opción más elegida` (`3+ integraciones conectadas`, `Claude AI conversacional`, `Reportes automáticos`, `Soporte prioritario y ajustes`) · **Escala "A medida"** (`Flujos y reglas avanzadas`, `Integración con ERP/CRM`, `SLA y monitoreo dedicado`, `Account manager técnico`) · pie `Sin contrato largo…`
- **Faq** (8 Q&A + 3 objeciones): incluye `¿Cuánto ahorro…?` → `…22 horas semanales por empleado… ahorra entre $800 y $2.000 USD mensuales…` ⚠ Hero dice `+12 horas`, FAQ/metadata dicen `22 horas` · `¿Qué herramientas usan…?` (n8n open source) · `¿Cuánto tiempo lleva implementar…?` (`1-2 semanas` simple, `4-8 semanas` complejo)
- **Cta**: badge `Agenda limitada: 3 cupos de implementación por mes` · `SIN TECNICISMOS · SOLO RESULTADOS CONCRETOS` · H2 `Tu empresa, en piloto automático esta semana.` · chips `Diagnóstico inicial sin costo` / `Propuesta en 48hs` / `Mapeo gratuito de procesos` · CTA `Quiero mi mapeo ahora` · microcopy `Trabajamos con empresas de Tucumán, Salta, Catamarca y todo el NOA.` · form propio (nombre/WhatsApp/empresa → abre WhatsApp)

### 3.6 `/software-development` (sin dynamic())

Orden real: HeroSoftware → DashboardMockupSoftware → ArchitectureSoftware → StatementSoftware → PainBentoSoftware → RoiSoftware → DiagnosticoSoftware → PipelineSoftware → SocialProofSoftware → FaqSoftware → SoftwareDevelopmentCta. Excluidos por comentario en page.tsx: `ProcesoSoftware.tsx`, `VaultSoftware.tsx`.

- **Hero**: eyebrow `TU EMPRESA, ORDENADA Y EN CONTROL` · H1 `Terminá con el caos de los 5 Excels.` · p `Centralizamos toda la operación de tu empresa en una sola pantalla. Stock, ventas, clientes y finanzas, en tiempo real. Sin depender de Excel. Sin depender de nadie.` · CTAs `Diagnosticar mi empresa →` / `Ver cómo funciona` · stats `-80% errores operativos` / `1 sola pantalla` / `24/7 crece con vos`
- **DashboardMockup**: `[ TU EMPRESA EN TIEMPO REAL ]` · `Todos los datos, una sola pantalla.` · 5 rubros rotativos (Concesionaria/Salud/Gastronomia/Comercio/Inmobiliaria) con widgets y feed de actividad completos (data `rubroSnapshots` en `DashboardMockupSoftware.tsx:71-402`) · pie `MOCKUP REPRESENTATIVO - PANEL REAL ADAPTADO POR RUBRO`
- **Architecture**: `[ CONSTRUIDO PARA NO FALLAR ]` · `Tu sistema trabaja. Aunque vos no estés.` · `Cada área conectada. Cada dato trazado. Sin intervención manual.` · pilares `99.9% Uptime garantizado` / `0 Pérdida de datos` (`Backups automáticos cada hora…`) / `<2s Tiempo de respuesta`
- **Statement** (scrollytelling): `Tu empresa no necesita más Excel. / Necesita un sistema que trabaje por vos. / Eso construimos. Nada más. Nada menos.` · ejemplos `Restaurante que llena mesas sin contestar el teléfono. Clínica que confirma turnos sola. Ferretería con stock sin Excel.` · cue `SCROLLEA para empezar`
- **PainBento** (6 pares caos→orden con "clientes" citados: Distribuidora Andina, Ferretería del Norte, Clínica Vélez, Importadora NOA, Grupo TAFÍ, Agro del Norte): `Conocemos tu empresa porque vivimos en ella.` · `Excel eterno`→`Dashboard en tiempo real` · `WhatsApp como CRM`→`CRM integrado` · `Procesos en papel`→`Flujos digitales` · `Error humano`→`Fuente única de verdad` · `Reportes manuales`→`Reportes automáticos` · `Sistemas desconectados`→`Ecosistema integrado` · CTA `¿Te identificás? Diagnosticá tu empresa →`
- **Roi**: `Invertir en software no es gasto. Es recuperar caja todos los meses.` · `Inversion base $1.500 USD` / `Proyectos desde $1.500 USD · entrega por etapas.` · sliders personas/costo mensual · timeline `Mes 1 Sistema operativo` → `Inversión recuperada` → `Mes 12 Ganancia neta`
- **Diagnostico** (wizard 3 pasos + 6 resultados, `DiagnosticoSoftware.tsx:83-241`): `¿Qué sistema necesita tu empresa?` · `3 preguntas. 30 segundos…` · social proof `+312 diagnósticos realizados este mes` · resultados con precios: `Sistema de Gestión Integral` **desde $2.800 USD** (6-10 semanas) · `CRM de Ventas Inteligente` **desde $1.800 USD** (4-6 semanas) · `Motor de Automatización` **desde $1.500 USD** (3-5 semanas) · `Sistema de Stock e Inventario` **desde $2.000 USD** (4-7 semanas) · `Portal de Clientes Self-Service` **desde $2.200 USD** (5-8 semanas) · `ERP Personalizado` **desde $6.000 USD** (12-20 semanas) · ⚠ los CTAs fijos del propio wizard dicen siempre `Proyectos desde $1.500 USD · Entrega por etapas` sin importar el resultado
- **Pipeline** (4 stages): `Un proceso técnico pensado para avanzar sin ruido.` · STAGE 01 `Análisis` · 02 `Desarrollo` · 03 `Testing` · 04 `Deploy` (con outputs literales por stage)
- **SocialProof** (⚠ testimonios no verificables): `Lo que dicen los que ya "lo tienen funcionando."` · `Roberto Álvarez`/Distribuidora Álvarez e Hijos (`−80% errores de stock`) · `Dra. Valeria Sosa`/Centro Médico Integral Sosa (`−70% llamadas de turno`) · `Matías Herrera`/Herrera Mayorista (`0 pedidos por teléfono`) · stats `5.0 SATISFACCIÓN PROMEDIO` / `38+ PROYECTOS ENTREGADOS` / `4+ AÑOS EN EL MERCADO NOA` / `99.9% UPTIME PROMEDIO`
- **Faq** (8 Q&A + 3 objeciones): `¿Cuánto cuesta un sistema a medida…?` → `…CRM básico arranca desde $1.500 USD… ERP completo… desde $4.000 USD…` · `¿Cuánto tiempo demora…?` (`6 y 16 semanas`) · `¿Cómo garantizan que el sistema no va a fallar…?` → `…uptime promedio… 99,7%. En 3 años de desarrollo, ningún cliente perdió datos…` ⚠ (99.9% en Architecture vs 99,7% acá; `4+ años NOA` vs `3 años` vs `2+ años` del Footer)
- **Cta**: badge `Agenda limitada: 2 cupos de implementación software esta semana` · `SI NO SISTEMATIZAS HOY, MAÑANA TU OPERACION SIGUE FRENADA` · H2 `Tu empresa con software propio operando en 30 días.` · chips `Diagnóstico inicial sin costo` / `Proyectos desde USD 1.500` / `Propuesta técnica en 48 horas` · CTA `Quiero mi diagnóstico software ahora` · form (select: `CRM a medida`/`ERP interno`/`Integraciones entre sistemas`/`Portal para clientes`/`BI y reportes`/`Otro`)

**Nota de tono (transversal):** el copy nuevo del home (secciones 01–06) es sobrio, sin cifras inventadas y con placeholders explícitos gateados a merge; el copy de las 4 landings y el Footer es el idioma anterior: urgencia (`Agenda limitada: 2 cupos…`), métricas sin fuente (`+42% LEADS CALIFICADOS`, `99.9% UPTIME`, `47 negocios locales`, `+312 diagnósticos este mes`, `38+ proyectos`, `22 hs semanales`), testimonios con nombre y apellido no verificables, y claims de respuesta (`menos de 2hs` / `menos de 2 horas` / `menos de 24 horas`) que no coinciden entre sí.

---

## Paso 4 — Inventario de glassmorphism y superficies

Método: `git grep -o` por patrón (conteo de ocurrencias) + `Grep --count` por archivo para `backdrop-blur`. "Portal/módulos" = `src/app/(protected)` + `src/components/dashboard` + `src/modules`; "público+compartido" = el resto.

| Patrón | Total src/ | Portal/módulos | Público+compartido |
|---|---|---|---|
| `backdrop-blur` | 268 (264 en clases, 150 archivos) | 191 | 77 |
| `bg-white/` | 895 | 688 | 207 |
| `bg-black/` | 256 | 211 | 45 |
| `border-white/` | 1.129 | 866 | 263 |

**Lectura clave: el home nuevo tiene CERO glass real.** Las únicas menciones de `backdrop-blur` en el sistema de diseño son comentarios que documentan la prohibición (`design-system/Surface.tsx:24`, `portal-demo/PanelPlate.tsx:13`). El glass vivo del sitio público está en las 4 landings, en el Footer legacy del home y en componentes UI compartidos.

Detalle del lado público+compartido (`backdrop-blur`, instancias por archivo — clasificación):

| Archivo | # | Clasificación |
|---|---|---|
| `canvas/Interactive3DNetwork.tsx` | 6 | overlay/hud de canvas |
| `sections/AIPipelineSection.tsx` | 5 | glass de tarjeta (sección IA legacy) |
| `sections/web-development/WebDevelopmentSeo.tsx` | 5 | glass de tarjeta |
| `sections/web-development/WebDevelopmentTimeline.tsx` | 4 | glass de tarjeta |
| `sections/web-development/WebDevelopmentBento.tsx` | 4 | glass de tarjeta |
| `automation/IntegracionesAutomation.tsx` | 4 | glass de tarjeta |
| `software/ArchitectureSoftware.tsx` | 4 | glass de tarjeta |
| `ui/Card.tsx` | 3 | **compartido** (glass de tarjeta genérica) |
| `sections/web-development/WebDevelopmentByRubro.tsx` | 3 | glass de tarjeta |
| `sections/ProcessAutomationMetrics.tsx` | 3 | glass de tarjeta |
| `web-development/page.tsx` · `ia/FaqIA.tsx` · `automation/FaqAutomation.tsx` · `software/VaultSoftware.tsx` · `software/PipelineSoftware.tsx` · `software/FaqSoftware.tsx` · `sections/ROICalculator.tsx` · `ui/Modal.tsx` | 2 c/u | glass de tarjeta/modal |
| `automation/ProcesoAutomation.tsx` · `automation/CtaAutomation.tsx` · `ia/CtaIA.tsx` · `ui/Select.tsx` · `ui/HeroMetrics.tsx` · `lib/design-patterns.ts` · `software/StatementSoftware.tsx` · `sections/software-development/SoftwareDevelopmentCta.tsx` · `sections/web-development/{WebDevelopmentCta,ComparadorSection,WebDevelopmentFaq}.tsx` · `app/layout.tsx` (Toaster) · `sections/web-development/WebDevelopmentSensory.tsx` (muerto) | 1 c/u | uso puntual |

Además, **fuera del conteo de clases**:
- `sections/home/Footer.tsx` usa glass por estilo inline (`backdropFilter: 'blur(20px) saturate(180%)'` en el form, línea ~586) — el único glass que queda montado en el home hoy.
- `globals.css` define `.admin-surface` (blur 20px + borde blanco/0.08) y toda la familia `admin-*`: el idioma glass del portal admin vive como clases CSS, no solo utilities.

**Dimensión del reemplazo:** para el rediseño del sitio público (home ya limpio + 4 landings + /contact + Footer + UI compartida pública), el trabajo real son ~77 instancias de `backdrop-blur` + ~200 `bg-white/` + ~263 `border-white/` concentradas en ~35 archivos de landings/ui. El grueso del glass del repo (191/688/866) es del portal y NO forma parte del rediseño del sitio público.

---

## Paso 5 — Sistema de estilos vigente

**Conviven DOS sistemas completos**, y el archivo lo declara (`globals.css:24-27`: "los tokens viejos se conservan hasta el bloque final del rediseño; el sistema nuevo no los pisa").

**1. Sistema de diseño del rediseño (B1, prefijo `ds`)** — `src/app/globals.css`:

- `@theme static` (~35 tokens; `static` porque Tailwind 4.3 tree-shakea variables no usadas por utilities y `SectionShell` las lee por `var()` crudo):
  - Base dark: `--color-ds-void #0D0B09`, `--color-ds-surface #151210`, `--color-ds-ink #EDE9E1`, `--color-ds-ink-muted #A39C8F`, `--color-ds-border rgba(237,233,225,.10)`.
  - **Tema crema**: `--color-ds-light-bg #F2EEE6`, `--color-ds-light-surface #EAE5DA`, `--color-ds-light-ink #1A1713`, `--color-ds-light-ink-muted #6E675C`, `--color-ds-light-border rgba(26,23,19,.12)`.
  - Acentos de servicio (Gate 1 cerrado en B2-S4, permutación A, congelada en CLAUDE.md): web `#06b6d4` · ia `#10b981` · automation `#f59e0b` · software `#8b5cf6`. Los neón (`#00ff88`, `#00e1ff`) descartados.
  - Radios: superficies **0px**, controles 9px. Relieve solo en lo interactivo (`--shadow-ds-control`, invertido por tema).
  - Motion: `--animate-ds-reveal` (0.9s, opacity+16px) y `--animate-ds-rise` (solo transform, para LCP).
  - Escala tipográfica en `clamp()`: display-xl/lg, subhead, lead, body, eyebrow, data — con pisos móviles recalibrados como escala (invariantes medidas 320–1920px). ⚠ Todo token `--text-ds-*` nuevo debe sumarse a `DS_FONT_SIZE_CLASSES` en `src/lib/utils.ts` (tailwind-merge descarta tamaño o color sin avisar).
  - Layout: `--spacing-ds-section clamp(6rem,14vh,11rem)`, `--spacing-ds-gutter`, `--container-ds-page 1240px`, `--container-ds-prose 65ch`, `--container-ds-lead 42ch`, `--spacing-ds-nav 4rem` (acoplado a `scroll-padding-top` del html).
  - Capa semántica invertible: `--color-ds-canvas/panel/fg/fg-muted/rule` + scopes `[data-ds-theme='dark'|'light']`.
- Componentes: `src/components/design-system/` — `SectionShell, Eyebrow, ChapterLabel, DisplayHeading, Subhead, Lead, CtaButton, Surface, DataStat, MonoLabel, RuleDivider, accent.ts` — expuestos en `/styleguide`.
- Reduced-motion global (final de globals.css): universal a 1 iteración de 1ms (no 0.01ms, que convierte loops en 100Hz). Pendiente declarado ahí: Lenis es JS y no se neutraliza desde CSS.

**2. Sistema viejo (pre-rediseño)** — sigue vivo y es mayoritario fuera del home:

- `:root` legacy: `--color-void #030303`, `--color-obsidian #f4f4f5`, `--color-accent #06b6d4`; scopes `[data-theme='light'|'dark']` sobre el `<html>` escritos por `ThemeProvider` (`src/hooks/useThemeObserver.tsx`); el `body` transiciona background/color con esos tokens. `HomeWrapper` anima además sus propios hex (`#fafafa`/`#000000`).
- Clases `admin-*` en `@layer components` (globals.css:469-571): glass del portal admin (`backdrop-filter: blur(20px)`, `bg rgba(255,255,255,.04)`, radios 1rem, gradiente cyan→emerald en el botón primario).
- Zoo de keyframes legacy (shimmer, rotate-border, floatMetric, ringPulse, amberShift, breathe, etc.) + estilos del chatbot (`.chat-messages-area`).

**Fuentes** (`src/app/layout.tsx`): solo **Geist + Geist Mono** vía `next/font/google`, variables `--font-geist-sans/mono` en el `<html>` (el scope importa: comentario documenta el bug que rompía la cadena de `var()` si iban al body — cf. branch `fix/fonts-geist-scope`). El DS las re-expone como `--font-ds-sans/mono`.

**Paleta de facto** (`git grep -o | count` sobre `src/`): `zinc-` **2.800** · `cyan-` **1.367** · `border-white/` **1.129** · `bg-white/` **895** · `amber-` **761** · `emerald-` **600** · `backdrop-blur` **268** · `bg-black/` **256** · `violet-` **177**. Contra eso, los tokens nuevos: `ds-fg` 151 · `ds-rule` 58 · `ds-canvas` 24 · `ds-accent-` 17 · `animate-ds-reveal` 13. **Lectura:** el sistema `ds` cubre el home y el styleguide; el resto del sitio (landings de servicio, portal admin/cliente, chatbot) sigue enteramente en el idioma viejo dark/glass. No hay design tokens reales fuera de `ds-*`: es Tailwind utilitario inline.

---

## Paso 6 — Portfolio e InfiniteReviews: contenido real

**Portfolio (el actual, sección 02 del home):** muestra UN caso real — `Concesionaria San Miguel` — con contexto, entregable, URL y las 3 cifras de resultado **en placeholder literal** (`[CONTEXTO…]`, `[ENTREGABLE…]`, `[URL DEL CASO]`, `[+00%]`, `[00 días]`, `[000]`), más 3 `Demos conceptuales` también en placeholder (`[RUBRO 1/2/3]`). Datos hardcodeados inline en `src/components/sections/home/Portfolio.tsx` (constantes `CASO`, `RESULTADOS`, `DEMOS`). **No usa ninguna imagen**: la lámina es tipográfica. El docblock declara el gate: "ninguna rama con estos placeholders a la vista se mergea a main".

**InfiniteReviews: NO existe en este árbol.** Grep de `InfiniteReviews|OurServices|TodoIncluido|ModulosOpcionales|PortalDemoCTA|WhyDevelOP` en `src/` devuelve solo menciones en comentarios (`lib/whatsapp.ts`, `hooks/useThemeObserver.tsx`, `globals.css`, docblocks de las secciones nuevas y `styleguide/_components/ServiceRow.tsx`). Los componentes del home clásico (el carrusel de 6 proyectos, las reseñas infinitas, OurServices de 9.898 líneas, TodoIncluido, ModulosOpcionales, PortalDemoCTA, WhyDevelOP, About) fueron **borrados** en los sprints B2–B4 de este lane. Siguen existiendo en `main` (home clásica restaurada por `78b510ac`), fuera de este árbol.

**Assets de proyectos que existen de verdad en `public/`** (cruce con Paso 14):
- `images/showcase/`: `case-comercio.svg`, `case-default.svg`, `case-gastronomia.svg`, `case-inmobiliaria.svg`, `case-servicios.svg`, `hero-concesionaria.svg` — SVGs genéricos de 1-3 KB (placeholders, no capturas reales). Hoy los consume `ShowcaseSection.tsx` (componente **muerto**, no renderizado) y `WebTemplatesImmersive.tsx:86` usa `case-default.svg` como fallback de preview.
- `ShowcaseSection.tsx:9-20` referencia en comentarios los PNG reales que "deberían" existir (`concesionaria-desktop.png`, `restaurante-desktop.png`, `inmobiliaria-desktop.png`, `servicios-desktop.png`): **ninguno existe en `public/`**.
- Los "proyectos" con URL real que quedan vivos son los 6 templates externos de `WebTemplatesImmersive` (template-zero/ethernal/noir/skyline/bold/nebula, todos `*.netlify.app`).

---

## Paso 7 — Servicios y precios

**Estructura de datos: NO hay array central de servicios.** Cada landing es autónoma: todos sus datos (tiers, FAQs, rubros, métricas) viven como `const` inline en cada componente. Lo más cercano a fuentes compartidas: `servicios/data.ts` (FRENTES del home, sin precios), `Navbar.tsx` (`SERVICE_ITEMS`), `design-system/accent.ts` (roles de acento), `lib/whatsapp.ts` (número + prefills). `OurServices.tsx` (el monolito con precios "DESDE") ya no existe en este árbol.

**Dónde viven los precios HOY** (verificado por grep + extracción por página):

| Servicio | Precio visible | Archivo |
|---|---|---|
| Web | tiers **$490 / $980 / $1.690 USD** | `sections/web-development/PricingSection.tsx:21-57` |
| Web | `Desde $800 USD` (hero chip) · `desde 800 USD` (FAQ) · `Inversión desde 800 USD` (CTA) | `web-development/page.tsx:132` · `WebDevelopmentFaq.tsx:21` · `WebDevelopmentCta.tsx:399` |
| IA | `Desde USD 300 inicial` · `Implementación desde USD 300` | `ia/ComparadorIA.tsx:668` · `ia/CtaIA.tsx:399` |
| IA | `Desde $1.800 USD` (solo metadata SEO) | `app/ai-implementations/layout.tsx:5` |
| Automatización | tiers **$199 / $499 USD/mes / "A medida"** | `automation/VaultAutomation.tsx:20-55` |
| Automatización | `$240 USD/mes` (base de la calculadora ROI) · `$800 y $2.000 USD mensuales` (claim FAQ) | `CalculadoraAutomation.tsx:917,940` · `FaqAutomation.tsx:19` |
| Software | `$1.500 USD` base (ROI, CTAs, FAQ) · escalera por resultado **$1.500 / $1.800 / $2.000 / $2.200 / $2.800 / $6.000 USD** · `$4.000 USD` (ERP en FAQ) | `software/RoiSoftware.tsx:6,431-432` · `DiagnosticoSoftware.tsx:126-241,658,731` · `FaqSoftware.tsx:15` · `SoftwareDevelopmentCta.tsx:399` |

Contra los precios que esperaba la instrucción ($800/$300/$1.500/$200): $800 web, $300 IA y $1.500 software existen; **"$200" de automatización no existe** — hoy es una suscripción $199/$499 USD/mes. Inconsistencias internas: web anuncia `desde 800` pero su tier mínimo es $490; IA dice USD 300 en página y $1.800 en su metadata; software fija `desde $1.500` en CTAs aunque el propio wizard cotiza hasta $6.000; formatos mezclados (`$1.500 USD` vs `USD 1.500`).

**Mapa de impacto de la fusión IA+Automatización** (solo mapa; sin propuesta):

- **Rutas**: `src/app/ai-implementations/{page,layout}.tsx` · `src/app/process-automation/{page,layout}.tsx` (metadata SEO propia en cada layout, con keywords y precios propios).
- **Componentes IA** (`src/components/ia/`): 8 vivos (HeroIA, DemoIA, GarantiaIA, PipelineIA, RubrosIA, ComparadorIA, FaqIA, CtaIA) + TestimoniosIA (importado, apagado por flag) + 3 huérfanos (BentoIA, CalculadorIA, VaultIA). ⚠ `CalculadorIA.tsx` hardcodea OTRO número de WhatsApp (`5493815674738`) — anotado en `lib/whatsapp.ts`.
- **Componentes Automatización** (`src/components/automation/`): 11 vivos (DataPacketsCanvas, HeroAutomation, IntegracionesAutomation, FlujoAutomation, BentoAutomation, RubrosAutomation, CalculadoraAutomation, ProcesoAutomation, VaultAutomation, FaqAutomation, CtaAutomation) + 2 huérfanos (ComparativaAutomation, SocialProofAutomation).
- **Datos a reconciliar**: pricing (setup USD 300 vs suscripción $199/$499/mes), claims duplicados con números distintos (`+12 hs` vs `22 hs`), rubros solapados (ambas landings tienen Salud/Comercio-Restaurante/Inmobiliaria-Servicios con copy casi espejado), FAQs paralelas.
- **Consumidores de las rutas**: `Navbar.tsx` (`SERVICE_ITEMS`, `SERVICE_ROUTE_SET`, `PROCESO_ANCHOR_BY_ROUTE`, `HASH_TO_LABEL`) · `lib/marketing-routes.ts` (`MARKETING_ROUTES` — Route B) · tool del chatbot `modules/chatbot/server/tools/navigateToPage.ts:15` (`VALID_PATHS`, enum Zod) · `app/sitemap.ts` y `app/robots.ts` · `contact/page.tsx` (`SERVICE_OPTIONS` con `automation` y `ai` como opciones separadas — y el schema Zod del server action que valide ese campo) · home `servicios/data.ts` (filas `ia` y `automation` de FRENTES) · `design-system/accent.ts` + tokens `--color-ds-accent-ia`/`--color-ds-accent-automation` (dos acentos congelados en CLAUDE.md para servicios que serían uno) · prefills de WhatsApp por servicio · redirects/canonicals si una URL muere.

---

## Paso 8 — Estado real de Route B

Los cinco artefactos EXISTEN y están cableados:

| Pieza | Estado | Qué hace (2 líneas) |
|---|---|---|
| `src/lib/marketing-routes.ts` | ✅ existe | Allow-list de 5 rutas (`/web-development`, `/ai-implementations`, `/software-development`, `/process-automation`, `/contact`) + gate de disparo: el intro branded corre SOLO en hard-load/URL directa (captura `ENTRY_PATHNAME` a nivel módulo, `introConsumed` evita re-disparo). Además expone `markMarketingIntroDone()` → evento `chrome:revealed` que libera dock/widget. |
| `MarketingIntro` (`src/components/ui/MarketingIntro.tsx`) | ✅ existe | Overlay del intro branded: velo `#0a0a0a` z-9999 sin scroll-lock; secuencia LOCAL readiness → settle → trazo+relleno del logo → crossfade 2D→3D → ~1s de mouse-follow → toldo sube. Reduced-motion: versión corta sin trazo; automation: salta. Red de seguridad de scroll a 6s (mismo patrón que el Hero). |
| `BrandedIntroCanvas` (`src/components/ui/BrandedIntroCanvas.tsx`) | ✅ existe | Canvas r3f del intro (chunk propio, `dynamic ssr:false` desde MarketingIntro): logo 3D centrado + campo de puntos full-screen ESTÁTICO (`DotMatrixMesh` con `progress` fijo). |
| Rama marketing en `src/components/ui/Preloader.tsx` | ✅ existe | `Preloader.tsx:39-40`: `if (shouldRunMarketingIntro(pathname)) return <MarketingIntro />` — la bifurcación se conservó intacta tras B2 (documentado en su docblock línea 22). |
| `isAutomationEnvironment` en `src/context/PreloaderContext.tsx` | ✅ existe (líneas 70-85) | Detecta automatización (`navigator.webdriver === true` o query `?e2e=1`); el provider salta `phase` directo a `"done"` para que Playwright/visual-qa no queden clavados en el velo. `IntroLockupText.tsx` (texto del lockup) también existe como pieza acompañante. |

---

## Paso 9 — Chatbot en la landing

**Cómo está embebido.** El widget está montado en TODO el sitio público desde el layout raíz: `app/layout.tsx` monta `<ChatWidgetMount />` (`src/components/layout/ChatWidgetMount.tsx`), punto único que (a) gatea por `isChromeFreeRoute()` — nunca en `/admin`, `/dashboard` ni `/styleguide`; (b) espera el reveal del chrome (`useChromeRevealed`); (c) pre-calienta la config del bot durante el intro (`prefetchBotConfig('develop')` → cache compartida `configCache`); (d) monta `LogicCompanion` (launcher + ventana, `dynamic ssr:false`, slug fijo `develop`). Vías adicionales para terceros: `/embed/[slug]` (página para iframe, `force-dynamic`; 404 solo si el bot no existe — pausado muestra tarjeta degradada de WhatsApp) + `public/widget.js` (loader script) + `public/test-widget.html`.

**Endpoint de config.** No existe `api/chatbot/develop/config` literal: es `src/app/api/chatbot/[slug]/config/route.ts` con slug `develop`. Camino GET: (1) si NO viene header `Origin` y `isSameOriginBypassApplicable()` (= `NODE_ENV==='production'` sin `QA_ALLOW_LOCALHOST`) y `isTrustedSameOrigin(request)` (Sec-Fetch-Site / fallback Referer≡Host) → `isBotServable(slug)` (Prisma vía `unsafeGlobalQuery`) → `handleConfigRequest`; (2) si no → `validateOrigin({origin, botSlug})` (Prisma) → `handleConfigRequest`. `handleConfigRequest` → `getPublicConfig(slug)` (Prisma vía `unsafeGlobalQuery`) → 404 si null, 200 con `Cache-Control: public, max-age=60, stale-while-revalidate=300`. Existe test invariante del camino same-origin (`test:fixorigin`).

**Hipótesis del 500 conocido (solo lectura, sin ejecutar):** en TODO el camino GET no hay un solo `try/catch`. Las tres funciones que tocan la base (`validateOrigin`, `isBotServable`, `getPublicConfig`) propagan cualquier excepción de Prisma al handler, y Next la convierte en 500 genérico. El perfil de fallo más probable es el ya documentado en este repo como patrón INFRA (Neon serverless fría / pool agotado en el arranque de la lambda): la PRIMERA pegada del día a `/config` — que además dispara `prefetchBotConfig` en cada carga pública — pega contra una conexión fría y explota antes de llegar a la lógica de negocio. Consistente con que el 500 sea intermitente y se "cure" al recargar (la segunda pegada encuentra la conexión viva o el cache HTTP de 60s). Hipótesis secundaria (menor): un rechazo del camino same-origin NO da 500 sino 403 — así que el 500 no es de la capa FIX-ORIGIN sino de la capa DB. `[REQUIERE VERIFICACIÓN HUMANA]`: confirmar contra los logs de Netlify/Sentry la firma real (la regla del repo — memoria INFRA.3 — ya pide esa firma antes de tocar `lib/prisma.ts`).

**Avatar y assets visuales del widget.** Todo procedural, sin assets de imagen en `public/`: registry central `modules/chatbot/components/avatar/registry.ts` con 5 avatares seleccionables — `neuro` (default; Orbe Neural: esfera de partículas Fibonacci + núcleo, 3D pesado), `legacy_neuro` (Rostro Neural 3D), `monograma` (iniciales SVG), `onda` (anillos SVG), `geometrico` (blob SVG). Los dos pesados cargan por `HeavyAvatarsLazy` (chunk aparte `ssr:false`, carga diferida — commit `39b9d90f`). El glow del núcleo usa el patrón `CoreHalo` (sprites aditivos, sin EffectComposer — lección registrada en CLAUDE.md sobre canvas transparentes). Escape hatch para avatar por imagen/emoji en `AvatarRenderer`.

---

## Paso 10 — Dock, Navbar y rutas

**`DynamicDock` NO existe más.** Grep de `DynamicDock|SectionWrapper|ROUTE_TO_LABEL` en `src/`: cero definiciones; solo menciones en comentarios (`Navbar.tsx`, `Hero.tsx`, `page.tsx`, `chromeReveal.ts`, `useChromeRevealed.ts`, `LogicCompanion.tsx`). `ROUTE_TO_LABEL` tampoco existe; su sucesor es `HASH_TO_LABEL` en `Navbar.tsx:130`.

**`Navbar.tsx` (B2-S2)** reemplaza al par Navbar+DynamicDock: barra superior fija, plana y **opaca** (`bg-ds-canvas`, `data-ds-theme="dark"` fijo — chrome no invierte tema), z-9991, persistente (no se esconde por dirección de scroll). El docblock registra por qué murió el dock: glassmorphism prohibido por la dirección, píldoras/radios fuera, los 7 iconos Lucide fuera (única flecha del CtaButton como icono del sistema), dos animaciones infinitas fuera, `getLightLevel()` fuera, dos listeners de scroll sin coordinar fuera, y dos bugs de posición medidos (launcher del chat tapaba el botón del menú a 390px; el microcopy del hero caía 66px bajo el dock a 1440×760).

- Items desktop (`MAIN_NAV_ITEMS`): Inicio `/#inicio` · Nosotros `/#nosotros` · Portfolio `/#portfolio` · Servicios `/#servicios` (con desplegable) · Características `/#caracteristicas` · Contacto `/contact`. Controles: "Acceder" → `/login`, CtaButton "Escribinos" → WhatsApp (`getWhatsappHref()`).
- Desplegable de servicios (`SERVICE_ITEMS`, acento = cuadrado de 6px, único color de la barra): Sitio web/`/web-development`/web · Agente de IA/`/ai-implementations`/ia · Software/`/software-development`/software · Automatización/`/process-automation`/automation. En páginas de servicio los items cambian a Inicio/Proceso/FAQ/Contacto con anclas por ruta (`PROCESO_ANCHOR_BY_ROUTE`: web→`web-development-timeline`, software→`pipeline`).
- **Menú mobile: NO está desactualizado** — renderiza los mismos `MAIN_NAV_ITEMS` + `SERVICE_ITEMS` + CTA + "Acceder al portal". Modal con scroll-lock, disparador de texto ("Menú"/"Cerrar") arriba a la derecha (extremo opuesto al launcher del chat). Sección activa por `IntersectionObserver` (solo los ids destino, `rootMargin -30%/-40%`) + hash por `useSyncExternalStore`.
- Navegación: todo por `triggerTransition()` (regla del repo); reveal del chrome por `useChromeRevealed`/`chromeReveal.ts`.

**Árbol real de rutas de `src/app`** (86 `page.tsx`; 38 `route.ts` de API):

| Ruta | Tipo |
|---|---|
| `/` | home |
| `/web-development` · `/ai-implementations` · `/software-development` · `/process-automation` · `/contact` | marketing |
| `/styleguide` | styleguide del DS (interno) |
| `/login` · `/forgot-password` · `/reset-password` · `/cambiar-password` · `/accept-invite` · `/bienvenida` | auth / onboarding |
| `/embed/[slug]` | chatbot embebible (público, otro) |
| `/(protected)/admin/*` — 34 páginas (chatbots, clients, leados+setter, leads, projects, tickets, messages, announcements, referrals, settings, team, audit-log, alerts, fg2-lab) | portal admin |
| `/(protected)/dashboard/*` — 32 páginas (chatbot, cuenta, modules, resultados, plan, project, services, soporte, referidos, messages) | portal cliente |
| `/(protected)/setter/*` — 6 páginas | portal setter |
| `/api/*` — 38 endpoints (admin, auth, chatbot `[slug]` chat/config/health/smoke, cron ×8, dashboard, email, motor webhook, qa, reports, track, version, test-sentry, dev) | API |

---

## Paso 11 — Harness, skills y registros del método

**`.claude/` en el repo:** sí, mínimo — `.claude/agents/visual-qa.md` (subagente de verificación visual) y `.claude/launch.json`. **No** hay `.claude/skills/` ni `.claude/commands/` versionados.

**`CLAUDE.md`** (raíz del repo) — resumen en 10 líneas: (1) reglas no-negociables: nunca `prisma migrate reset`, nunca `any`, `HeroArtifact.tsx` congelado, navegación pública solo por `triggerTransition()`; (2) quality baseline por componente (loading/error/empty, validación doble, confirmaciones, aria); (3) política anti-vibecode (leer scope antes de codear, <300 líneas, sin lógica en UI); (4) seguridad por sprint (Zod en server actions, sesión+rol, rate-limit, tenant scoping); (5) performance (next/image, IntersectionObserver, dpr≤1.5); (6) convenciones de stack (easings, springs, lucide strokeWidth 1.5, receta glassmorphism — hoy contradicha por la dirección del rediseño); (7) acentos de servicio congelados (cian/verde/ámbar/violeta); (8) workflow WF + harness ECC con 6 slash-commands; (9) protocolo de sprint (build + migrate status antes/después, no auto-verificar); (10) subagentes obligatorios (Explore, visual-qa, regression-runner futuro) + tabla de frozen files + lessons learned (incluye pathLength y EffectComposer). También existen `logic-core-v3/AGENTS.md` (convenciones de app), `PRODUCT.md`, `DESIGN.md` (raíz — spec de dirección visual del rediseño: paleta crema/dark, tipografía Geist, "instrumento de precisión, editorial") y `STATUS.md`.

**Skills pedidas (`emil-design-eng`, `3d-scroll-website`):** NO existen — ni en el repo ni en `~/.claude/skills` (el directorio `C:\Users\Valentino\.claude\skills` no existe en esta máquina), ni aparecen como invocables en esta sesión.

**Subagentes:** `visual-qa` definido en repo (ruta exacta `.claude/agents/visual-qa.md`); `Explore` disponible como built-in del harness; `regression-runner` NO existe (CLAUDE.md lo menciona como futuro).

**Harness ECC:** CLAUDE.md lo declara "instalado global, perfil minimal" con `/harness-audit`, `/quality-gate`, `/code-review`, `/security-scan`, `/build-fix`, `/test-coverage`. En esta máquina **no hay rastro**: no existen `~/.claude/skills` ni `~/.claude/commands`, y esos comandos no están disponibles en esta sesión. `[REQUIERE VERIFICACIÓN HUMANA]` — podrían vivir como plugins o en otro perfil/máquina; tal como está, el ciclo de calidad documentado no es ejecutable acá.

**Bitácoras y registros (rutas exactas, todas bajo `logic-core-v3/`):** `docs/bitacora-rediseno.md` (la del rediseño — apéndice por sprint desde B1; su nota de arranque registra que el doc de sprint B1 nunca estuvo versionado), `docs/bitacora-beta.md`, `docs/bitacora-beta-2.md`, `docs/bitacora-beta-3.md`, `docs/bitacora-roadmap.md`, `docs/motor-whatsapp/bitacora.md`. `journal.txt` NO existe. `docs/sprints/` tiene 21 documentos (del rediseño solo `sprint-b0-bis-cierre.md` y `sprint-b05-sanidad-sitio.md`); `docs/metodo/` (4 docs de LeadOS); `docs/auditorias/`, `docs/audits/`, `docs/baselines/`, `docs/experimentos/`, etc. (18 subcarpetas). ⚠ Los documentos operativos del rediseño actual (p.ej. `docs/rediseno/sprints/B0-auditoria-rediseno-home.md`) viven **untracked en el checkout principal** y por eso NO están en este worktree: `docs/rediseno/` acá solo contiene este reporte.

---

## Paso 12 — Baseline técnico

**(a) Versiones exactas** (`package.json`): next `^16.2.6` · react/react-dom `19.2.3` · tailwindcss `^4` (+`@tailwindcss/postcss ^4`, `@tailwindcss/typography ^0.5.19`) · motion `^12.36.0` · lenis `^1.3.17` · three `^0.182.0` (+`@types/three ^0.182.0`) · `@react-three/fiber ^9.5.0` · `@react-three/drei ^10.7.7` · `@react-three/postprocessing ^3.0.4` (+`postprocessing ^6.38.3`) · lucide-react `^0.562.0` · prisma y `@prisma/client` `^6.19.2` · next-auth `^5.0.0-beta.30` · typescript `^5`. Scripts relevantes: `dev`/`build` con `--webpack`; suites `.invariant.ts` vía ts-node/tsx; Playwright con configs por lane (setter/leados/integration/galeria).

**(b) `tsc --noEmit`:** corrido como `node_modules\.bin\tsc.cmd --noEmit -p C:\redesign-home\logic-core-v3` (equivalente a correrlo desde `logic-core-v3\`; el harness resetea el cwd, así que se pasó el project por `-p`). **Resultado: exit 0, CERO errores.** Los dos errores del baseline conocido (TS2307 `@googleapis/webmasters` en `src/lib/searchconsole.ts` y el error en `searchconsole.ts:119`) **no aparecen en esta corrida**: `@googleapis/webmasters@^4.0.0` está en `dependencies` y el `node_modules` de este worktree lo tiene instalado (el baseline documentado "va y viene según node_modules"). No hay errores NUEVOS.

**(c) Lenis** (`src/components/layout/SmoothScroll.tsx`): `duration: 1.5`, easing exponencial custom, `orientation/gestureOrientation: 'vertical'`, `smoothWheel: true`, **`syncTouch: false`**, `wheelMultiplier: 1`, `touchMultiplier: 1`, `overscroll: false`. Comportamiento: **no se instancia en portales** (`/admin`, `/dashboard` → scroll nativo) **ni en dispositivos touch** (`(hover: none), (pointer: coarse)` → física nativa para evitar bounce). Además: `history.scrollRestoration = 'manual'` global; en `/` sin hash fuerza scroll a 0 (window + `lenis.scrollTo(0, immediate)`); comentario documenta que el aterrizaje de `/#portfolio`/`/#nosotros`/`/#servicios` en carga fría tenía dos causas medidas (secciones `dynamic()` sin caja — ya no aplica en este árbol — y `#nosotros` duplicado en `About.tsx` — tampoco, About murió). Instancia expuesta por `LenisContext`/`useLenis()`.

**(d) `DotMatrix`** (`src/components/canvas/DotMatrix.tsx`; export default en línea 224 + export nombrado + `DotMatrixMesh`):
- **Export default**: solo `src/app/accept-invite/InviteBackground.tsx` (dynamic import del default).
- Export **nombrado** `DotMatrix`: `src/app/login/page.tsx:11-12` y `src/app/forgot-password/page.tsx:9-10` (dynamic con `.then(m => m.DotMatrix)`).
- `DotMatrixMesh`: `src/components/ui/BrandedIntroCanvas.tsx` (campo de puntos estático del intro marketing).
- `reset-password` y `cambiar-password` NO lo usan. `HeroCanvas.tsx` documenta que la grilla se desconectó del home en B2-S2. **Restricción de back-compat**: las tres pantallas de auth (login, forgot-password, accept-invite) dependen del mismo canvas.

---

## Paso 13 — Inmersión en el branch de diseño

**Diferido a corrida aparte** (decisión del usuario en esta corrida). Insumo ya establecido en el Paso 1: el lane de diseño (`redisign/home` → `redesign/home`) es ancestro del árbol auditado; lo único fuera de HEAD son los 3 reverts de `revert-home-abortado` y la restauración clásica de main.

---

## Paso 14 — Assets

Inventario completo de `public/` (26 archivos; no hay carpetas de frames). "Sin referencia" = cero hits en `src/` (grep por nombre).

| Asset | Ruta | Peso | Uso actual |
|---|---|---|---|
| Logo SVG | `logodevelOP.svg` | 0,6 KB | Navbar (wordmark), Footer (BrandLogo). También duplicado en la RAÍZ del repo (`C:\redesign-home\logodevelOP.svg`) |
| Logo PNG | `logodevelOP.png` | **1,2 MB** | `login/page.tsx` (×2), `onboarding/OnboardingWizard.tsx`. Peso desproporcionado para su uso. Duplicado en raíz del repo |
| HDRI estudio | `hdri/studio_small_03_1k.hdr` | 1,6 MB | `HeroCanvas.tsx` (`HDRI_STUDIO_PATH`) — iluminación del artefacto 3D del hero |
| Showcase SVGs (6) | `images/showcase/case-{comercio,default,gastronomia,inmobiliaria,servicios}.svg`, `hero-concesionaria.svg` | 1-3 KB c/u | `case-default.svg`: fallback vivo en `WebTemplatesImmersive.tsx:86`; el resto solo en `ShowcaseSection.tsx` (componente muerto) |
| Fondo pipeline | `images/backgrounds/pipeline-section-bg.png` | 1,1 MB | Sin referencia en src |
| Mapas | `maps/argentina.svg` (134 KB) · `maps/tucuman-googlemaps.png` (58 KB) | | Sin referencia en src |
| Videos `video/` | `Male_business_owner_opens_laptop…mp4` (7,1 MB) · `Woman_engrossed_in_screen…mp4` (5,8 MB) · `Man_sips_coffee…mp4` (10,1 MB) · `Muestra-pagina-ejemplo.mp4` (5,2 MB) | 28 MB | Los dos primeros usados (`WebDevelopmentSensory.tsx` — componente muerto — y `ui/VideoCard.tsx` → Bento web); `Man_sips_coffee` y `Muestra-pagina-ejemplo`: sin referencia |
| Videos `videos/` | `ia-ingenieria-aplicada-demo.mp4` (2,5 MB) · `software-development-hero-intro.mp4` (0,7 MB) | 3,2 MB | Sin referencia en src (carpeta duplicada `video/` vs `videos/`) |
| Footer wall | `footer-portal-wall.svg` | 19 KB | Sin referencia en src |
| Widget chatbot | `widget.js` (7,7 KB) · `test-widget.html` (3,4 KB) | | Loader embebible del chatbot + página de prueba |
| Scaffolding Next | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | <2 KB | Restos del create-next-app |

**Favicon/OG:**
- Favicon: `src/app/favicon.ico` (convención App Router). OK.
- ⚠ **`/og-image.png` NO existe en `public/`**, pero lo referencian `app/layout.tsx:32,38` y `app/contact/layout.tsx:14,20` (OpenGraph/Twitter). Las previews sociales del sitio apuntan a un 404. `[REQUIERE VERIFICACIÓN HUMANA]` solo si existiera inyectado por el hosting; en el repo no está.

---

## Riesgos y sorpresas para la planificación

1. **La branch de trabajo no nace de main.** `redesign/home-v2` está 41 commits detrás y le falta justamente `78b510ac` (main restauró la home clásica) + carreras/privacidad/VOZ-MUDEZ del chatbot. Todo lo que se construya acá va a chocar con esa restauración al mergear: la estrategia de reconciliación es una decisión previa a cualquier sprint.
2. **El "rediseño" ya está a medio construir en este árbol.** El home actual del worktree ES el sistema nuevo (B1–B4: tokens `ds-*`, crema `#F2EEE6`, 6 secciones, styleguide, DESIGN.md, bitacora-rediseno.md). El plan no parte de la home clásica: parte de un rediseño previo con sus propias reglas escritas — rescatar o descartar es una decisión, no un descubrimiento.
3. **Deuda de contenido con gate de merge.** Portfolio/Nosotros/Servicios/Cierre llevan placeholders literales (`[+00%]`, `[PLAZO…]`, `[URL DEL CASO]`…) y la regla escrita de que ninguna rama con eso a la vista se mergea. Sin los datos reales de Franco, el rediseño no tiene cierre posible.
4. **El Footer del home es legacy entero**: glass inline, Framer `pathLength` sobre el SVG del logo (patrón vetado en lessons learned), fondo `#050505` fijo, claims propios (`menos de 2hs`, `2+ años`) y un form que postea a un webhook n8n distinto del server action de `/contact`. Quedó fuera de B1–B4 y rompe la identidad nueva en la última pantalla.
5. **Contenido fabricado vivo en las landings**: testimonios con nombre y apellido (SocialProofSoftware, TestimoniosIA apagado pero shipped), `38+ proyectos`, `4+ años`, `+312 diagnósticos este mes`, `47 negocios locales`, `Agenda limitada: 2/3 cupos`, uptime `99.9%` vs `99,7%`, `+12 hs` vs `22 hs`. El home nuevo declara exactamente lo contrario ("ninguna cifra inventada"). Incoherencia de marca directa para el rediseño.
6. **Precios sin fuente única y contradictorios**: web `desde 800` vs tiers desde $490; IA `USD 300` en página vs `$1.800` en su metadata SEO; software `desde $1.500` fijo en CTAs vs escalera hasta $6.000; automatización es suscripción ($199/$499/mes) mientras el resto es setup. La fusión IA+Automatización obliga a reconciliar modelo de pricing, no solo copy.
7. **Token fantasma en el DS**: `border-t-ds-control-edge` (PanelPlate, styleguide ProductPlate) no tiene `--color-ds-control-edge` definido en `globals.css` → Tailwind no emite la clase y el canto del relieve no se dibuja. Mismo modo de falla silencioso que el DS ya documenta para twMerge.
8. **Metadata/assets rotos o pesados**: `/og-image.png` referenciado (home y contact) no existe en `public/` → preview social 404; `logodevelOP.png` de 1,2 MB en login/onboarding; ~17 MB de videos/mapas/fondos sin referencia en `src/`.
9. **Dos sistemas de tema conviven a propósito** (`ds-*` + `data-theme` legacy con `HomeWrapper` animando hex propios `#fafafa/#000000` que no son los del DS). Está documentado como transitorio ("hasta el bloque final del rediseño") — el plan debe presupuestar esa limpieza, que hoy no tiene sprint.
10. **El método declarado no es ejecutable acá**: los slash-commands ECC no están instalados en esta máquina, las skills `emil-design-eng`/`3d-scroll-website` no existen, `regression-runner` no existe, y los docs de sprint del rediseño viven untracked fuera del repo versionado. Rutina esperable en el resto: `tsc` limpio (0 errores), Route B completa y cableada, chatbot embebido con arquitectura clara — eso no trae sorpresas.
