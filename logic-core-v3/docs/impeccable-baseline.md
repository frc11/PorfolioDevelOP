# Impeccable — baseline del detector (pre-rediseño)

| | |
|---|---|
| Herramienta | `impeccable` v3.5.0 (`npx impeccable detect`) |
| Fecha | 2026-07-31 |
| Rama / commit | `redesign/home` @ `c216079` |
| Raíz de corrida | `logic-core-v3/` |
| Naturaleza | Detector determinista, local, sin modelo ni API key. Cero tokens. |
| Salida cruda | [`impeccable-baseline.json`](impeccable-baseline.json) |

> **Estatuto en develOP.** Impeccable aporta vocabulario y detección de anti-patrones — nunca dirección estética. La dirección visual del sitio ya está cerrada ("instrumento de precisión, editorial"). Donde una recomendación del detector contradiga esa dirección, gana develOP y queda anotada como descartada (ver *Hallazgos descartados*).

---

## Los números del baseline

### Total `src/`

**115 hallazgos.** Los 115 son severidad `warning`. Cero `error`.

| # | Anti-patrón | Categoría |
|---:|---|---|
| 56 | `gray-on-color` — texto gris sobre fondo de color | quality |
| 37 | `gradient-text` — texto con gradiente | **slop** |
| 6 | `ai-color-palette` — paleta violeta/cyan de IA | **slop** |
| 5 | `side-tab` — borde de acento lateral grueso | **slop** |
| 5 | `overused-font` — tipografía sobreexpuesta | **slop** |
| 3 | `bounce-easing` — easing bounce/elástico | **slop** |
| 2 | `layout-transition` — animación de propiedad de layout | quality |
| 1 | `broken-image` — `<img>` sin `src` real | quality |

51 de los 115 son categoría `slop` (44%).

### Los dos números diferenciados

| Scope | Hallazgos |
|---|---:|
| **Sitio público** (`src/app` + `sections` + `ia` + `automation` + `software`) | **65** |
| ↳ de esos, dentro de `src/app/(protected)` y `src/app/api` (portal, **no** es sitio público) | 19 |
| ↳ **superficie pública real** | **46** |
| **Sistema de diseño** (`src/components/design-system/`) | **0** |
| Resto (`modules/`, `lib/`, `dashboard/`, `admin/`, `ui/`, `layout/`…) | 50 |

> **Nota de scope.** El scope pedido incluía `src/app/` completo, que contiene el portal (`(protected)`) y las API routes. Se reportan los dos números para que el del rediseño no quede contaminado por pantallas de portal. También: `src/components/web-development/` no existe — la landing de web dev vive en `src/components/sections/web-development/`, ya cubierta por `sections`.

**El número contra el que se mide cada bloque del rediseño es 46** (superficie pública real). El 115 queda como número de repo completo; el 0 del design-system es el techo que hay que sostener.

### Composición de los 46 (superficie pública real)

| # | Anti-patrón |
|---:|---|
| 34 | `gradient-text` |
| 4 | `ai-color-palette` |
| 3 | `gray-on-color` |
| 2 | `layout-transition` |
| 2 | `bounce-easing` |
| 1 | `side-tab` |

**El 74% del slop público es una sola cosa: `bg-clip-text` + gradiente en titulares y métricas.** Está repartido finito por todas las landings, no concentrado en un archivo.

---

## Dónde se concentra (superficie pública)

| Archivo | # |
|---|---:|
| `src/components/sections/web-development/WebDevelopmentBento.tsx` | 4 |
| `src/components/sections/home/Portfolio.tsx` | 4 |
| `src/components/software/RoiSoftware.tsx` | 2 |
| `src/components/software/ArchitectureSoftware.tsx` | 2 |
| `src/components/software/FaqSoftware.tsx` | 2 |
| `src/components/sections/web-development/WebDevelopmentTimeline.tsx` | 2 |
| 30 archivos más | 1 c/u |

Cola larguísima: la mayoría de los archivos tiene exactamente un hallazgo. Es slop **distribuido**, no un componente podrido. Se limpia bloque por bloque, no con un pase masivo.

Concentración fuera del sitio público (contexto, no objetivo del rediseño):

| Archivo | # |
|---|---:|
| `src/components/ui/Badge.tsx` | 6 |
| `src/lib/client-notifications/templates.ts` | 4 |
| `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx` | 3 |

---

## Hallazgos puntuales que vale la pena nombrar

| Hallazgo | Ubicación | Lectura |
|---|---|---|
| `layout-transition` | `sections/home/OurServices.tsx:7639` · `ia/VaultIA.tsx:226` | Animar `width` / `padding`. Contradice la regla de performance del repo (solo transform/opacity). **Real, arreglar.** |
| `bounce-easing` | `web-development/WebDevelopmentBento.tsx:171` · `ComparadorSection.tsx:44` | `bounce-chevron … infinite`. Motion perpetuo — exactamente una anti-referencia de la dirección nueva. **Real, arreglar.** |
| `side-tab` | `sections/portal-demo/StoryMomentCard.tsx:346` | `borderLeft: 3px solid`. **Real.** |
| `ai-color-palette` | `WebDevelopmentBento.tsx:573`, `software/{Architecture,Faq,Roi}*.tsx` | Gradientes `from-violet-*` / `from-indigo-*`. El índigo es el acento legítimo de Software, pero **en gradiente** — la dirección prohíbe gradientes de acento. **Real.** |
| `broken-image` | `modules/chatbot/…/ClientAvatar.tsx:15` | Fuera del sitio público. Anotado, no es de este rediseño. |

---

## Hallazgos descartados (Impeccable pierde contra la dirección de develOP)

1. **`overused-font` × 5 — todos son `font-family:Arial` en plantillas de email HTML** (`lib/client-notifications/templates.ts`, `modules/chatbot/server/notifications/sendLeadNotification.ts`, `modules/chatbot/server/admin/detectBotIssues.ts`, `src/auth.ts`). Arial es fallback deliberado en clientes de correo. El detector no distingue email de web. **Descartado — falso positivo de contexto.**

2. **`side-tab` × 4 — `border-left: Npx solid` también en plantillas de email** (`templates.ts:139,167`, `notify-message.ts:109`, `sendLeadNotification.ts:75`). Mismo motivo. **Descartado.**

3. **La regla `overused-font` lista Geist entre las tipografías "sobreexpuestas".** La dirección de develOP fija Geist + Geist Mono, y Geist Mono es elemento de identidad. **Descartado por dirección: gana develOP.** Si en el futuro el detector marca Geist en el sitio público, se ignora — no se abre discusión de tipografía.

4. **`gray-on-color` × 56 (3 en superficie pública).** La regla es de contraste, no de estética, y en general es correcta — pero el grueso cae en portal/chatbot, fuera del scope del rediseño. **No descartado; diferido**, se atiende cuando toque el portal.

---

## Cómo se re-corre

```bash
npx impeccable detect src/ --json > docs/impeccable-baseline.json
```

Scope del rediseño (el número que importa):

```bash
npx impeccable detect src/app src/components/sections src/components/ia src/components/automation src/components/software
```

Sistema de diseño (tiene que seguir en 0):

```bash
npx impeccable detect src/components/design-system
```

> El detector sale con **exit code 2** cuando encuentra hallazgos. No es un fallo de la herramienta.

---

## Regla de uso vigente

**Permitido ya:** `detect` (cuantas veces se quiera), el hook automático durante los sprints, `/impeccable audit` y `/impeccable critique` (solo lectura).

**Prohibido hasta que B2 esté terminado y revisado:** `/impeccable polish`, `bolder`, `quieter`, `distill`, `animate`, Live Mode, y cualquier corrida masiva sobre el sitio entero. Un pase estético sin dirección humana es exactamente lo que produjo el estado actual del sitio.

---

## Listado completo

Generado desde `impeccable-baseline.json`, agrupado por archivo. Rutas relativas a `logic-core-v3/`.

### `src/app/(protected)/admin/_components/admin-topbar.tsx`

- L89 — `[gray-on-color]` text-zinc-500 on bg-red-500

### `src/app/(protected)/admin/announcements/_components/announcement-list.tsx`

- L96 — `[gray-on-color]` text-zinc-500 on bg-rose-500

### `src/app/(protected)/admin/audit-log/_components/audit-period-filter.tsx`

- L210 — `[gray-on-color]` text-zinc-200 on bg-cyan-400

### `src/app/(protected)/admin/chatbots/BotsListClient.tsx`

- L211 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/app/(protected)/admin/clients/[clientId]/_components/InternalNotesCard.tsx`

- L107 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/app/(protected)/admin/clients/[clientId]/edit/EditClientForm.tsx`

- L242 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx`

- L354 — `[gray-on-color]` text-zinc-950 on bg-cyan-400
- L623 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/app/(protected)/admin/leads/_components/lead-pipeline.shared.ts`

- L59 — `[ai-color-palette]` from-violet-400 gradient

### `src/app/(protected)/admin/leads/_components/location-typeahead.tsx`

- L216 — `[gray-on-color]` text-zinc-200 on bg-cyan-400

### `src/app/(protected)/admin/projects/_components/projects-period-dropdown.tsx`

- L225 — `[gray-on-color]` text-zinc-200 on bg-cyan-400

### `src/app/(protected)/dashboard/cuenta/boveda/page.tsx`

- L215 — `[gray-on-color]` text-zinc-300 on bg-cyan-500

### `src/app/(protected)/dashboard/cuenta/facturacion/page.tsx`

- L234 — `[gray-on-color]` text-zinc-400 on bg-cyan-500

### `src/app/(protected)/setter/_components/copy-block.tsx`

- L66 — `[gray-on-color]` text-zinc-300 on bg-emerald-500

### `src/app/(protected)/setter/_components/lead-card-actions.tsx`

- L247 — `[gray-on-color]` text-zinc-300 on bg-cyan-500
- L247 — `[gray-on-color]` text-zinc-500 on bg-cyan-500

### `src/app/(protected)/setter/layout.tsx`

- L81 — `[gray-on-color]` text-zinc-500 on bg-red-500

### `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx`

- L174 — `[gray-on-color]` text-zinc-950 on bg-cyan-400
- L175 — `[gray-on-color]` text-zinc-950 on bg-amber-400

### `src/app/bienvenida/_components/Step1Empresa.tsx`

- L105 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/app/bienvenida/_components/Step2Conexiones.tsx`

- L84 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/app/bienvenida/_components/Step3Tour.tsx`

- L59 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/app/web-development/page.tsx`

- L166 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/auth.ts`

- L109 — `[overused-font]` font-family:Arial

### `src/components/automation/BentoAutomation.tsx`

- L514 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/automation/CalculadoraAutomation.tsx`

- L321 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/automation/CtaAutomation.tsx`

- L323 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/automation/FaqAutomation.tsx`

- L308 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/automation/IntegracionesAutomation.tsx`

- L564 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/automation/ProcesoAutomation.tsx`

- L366 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/automation/RubrosAutomation.tsx`

- L609 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/dashboard/DashboardLayoutClient.tsx`

- L51 — `[gray-on-color]` text-zinc-100 on bg-cyan-500
- L154 — `[gray-on-color]` text-zinc-500 on bg-red-500

### `src/components/dashboard/LeakMeter.tsx`

- L89 — `[bounce-easing]` animate-bounce (Tailwind)

### `src/components/dashboard/MessageThread.tsx`

- L177 — `[gray-on-color]` text-zinc-400 on bg-cyan-500

### `src/components/dashboard/results/analysis/AnalysisTeaser.tsx`

- L14 — `[gray-on-color]` text-zinc-300 on bg-violet-500

### `src/components/dashboard/UpsellCard.tsx`

- L84 — `[ai-color-palette]` from-violet-500 gradient

### `src/components/ia/CtaIA.tsx`

- L320 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/ia/FaqIA.tsx`

- L317 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/ia/VaultIA.tsx`

- L226 — `[layout-transition]` transition: padding

### `src/components/layout/Hero.tsx`

- L336 — `[gradient-text]` bg-clip-text + bg-gradient
- L353 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/AIBentoGrid.tsx`

- L105 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/AILargeCta.tsx`

- L25 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/AIPipelineSection.tsx`

- L29 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/home/About.tsx`

- L383 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/home/OurServices.tsx`

- L7639 — `[layout-transition]` transition: width

### `src/components/sections/home/Portfolio.tsx`

- L428 — `[gradient-text]` bg-clip-text + bg-gradient
- L468 — `[gradient-text]` bg-clip-text + bg-gradient
- L629 — `[gradient-text]` bg-clip-text + bg-gradient
- L664 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/home/WhyDevelOP.tsx`

- L1654 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/portal-demo/StoryMomentCard.tsx`

- L346 — `[side-tab]` borderLeft: `3px solid

### `src/components/sections/portal-demo-cta/PortalDemoCTA.tsx`

- L304 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/ProcessAutomationCta.tsx`

- L23 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/software-development/SoftwareDevelopmentCta.tsx`

- L320 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/web-development/ComparadorSection.tsx`

- L44 — `[bounce-easing]` animation: bounce-chevron

### `src/components/sections/web-development/WebDevelopmentBento.tsx`

- L171 — `[bounce-easing]` animation: bounce-chevron-bento_1.5s_infinite_ease-in-out]">
- L406 — `[gradient-text]` bg-clip-text + bg-gradient
- L573 — `[gradient-text]` bg-clip-text + bg-gradient
- L573 — `[ai-color-palette]` from-violet-200 gradient

### `src/components/sections/web-development/WebDevelopmentByRubro.tsx`

- L679 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/web-development/WebDevelopmentCta.tsx`

- L320 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/web-development/WebDevelopmentFaq.tsx`

- L316 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/web-development/WebDevelopmentSeo.tsx`

- L661 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/sections/web-development/WebDevelopmentTimeline.tsx`

- L814 — `[gradient-text]` bg-clip-text + bg-gradient
- L918 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/software/ArchitectureSoftware.tsx`

- L660 — `[ai-color-palette]` from-indigo-100 gradient
- L660 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/software/FaqSoftware.tsx`

- L280 — `[ai-color-palette]` from-indigo-300 gradient
- L280 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/software/PipelineSoftware.tsx`

- L443 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/software/RoiSoftware.tsx`

- L371 — `[ai-color-palette]` from-indigo-300 gradient
- L371 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/ui/Badge.tsx`

- L20 — `[gray-on-color]` text-zinc-950 on bg-cyan-500
- L25 — `[gray-on-color]` text-zinc-950 on bg-emerald-500
- L30 — `[gray-on-color]` text-zinc-950 on bg-amber-500
- L35 — `[gray-on-color]` text-zinc-50 on bg-rose-500
- L40 — `[gray-on-color]` text-zinc-50 on bg-violet-500
- L50 — `[gray-on-color]` text-zinc-50 on bg-blue-500

### `src/components/ui/Button.tsx`

- L41 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/components/ui/PageHeader.tsx`

- L67 — `[gradient-text]` bg-clip-text + bg-gradient

### `src/components/ui/Tabs.tsx`

- L80 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/lib/client-notifications/templates.ts`

- L139 — `[side-tab]` border-left:4px solid ${theme.accent}
- L150 — `[overused-font]` font-family:Arial
- L167 — `[side-tab]` border-left:4px solid ${theme.accent}
- L218 — `[overused-font]` font-family:Arial

### `src/lib/design-patterns.ts`

- L28 — `[gray-on-color]` text-zinc-950 on bg-cyan-400
- L37 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/lib/email/notify-message.ts`

- L109 — `[side-tab]` border-left: 3px solid #06b6d4

### `src/modules/chatbot/components/admin/activation/ActivationModal.tsx`

- L138 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/BotConfigEditor.tsx`

- L224 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/client-avatar/ClientAvatar.tsx`

- L15 — `[broken-image]` <img>

### `src/modules/chatbot/components/admin/config/BotConfigDiffModal.tsx`

- L150 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/config/tabs/BehaviorTab.tsx`

- L97 — `[gray-on-color]` text-zinc-500 on bg-red-500
- L194 — `[gray-on-color]` text-zinc-500 on bg-red-500
- L272 — `[gray-on-color]` text-zinc-500 on bg-red-500

### `src/modules/chatbot/components/admin/kb/SaveConfirmModal.tsx`

- L89 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/kb/TestPromptSandbox.tsx`

- L186 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/KnowledgeBaseEditor.tsx`

- L188 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/onboarding/ExpandableTextField.tsx`

- L79 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/admin/onboarding/Step1Company.tsx`

- L197 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/modules/chatbot/components/admin/onboarding/Step2BotIdentity.tsx`

- L103 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/modules/chatbot/components/admin/onboarding/Step3KnowledgeBase.tsx`

- L97 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/modules/chatbot/components/admin/onboarding/Step4Appearance.tsx`

- L123 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/modules/chatbot/components/admin/onboarding/Step5Review.tsx`

- L189 — `[gray-on-color]` text-zinc-950 on bg-cyan-400
- L329 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/dashboard/BotPersonalization.tsx`

- L443 — `[gray-on-color]` text-zinc-500 on bg-red-500

### `src/modules/chatbot/components/dashboard/ChatbotUpsellLanding.tsx`

- L52 — `[gray-on-color]` text-zinc-950 on bg-cyan-400

### `src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx`

- L180 — `[gray-on-color]` text-zinc-950 on bg-cyan-500

### `src/modules/chatbot/components/dashboard/LeadScoringTeaser.tsx`

- L17 — `[gray-on-color]` text-zinc-300 on bg-violet-500

### `src/modules/chatbot/components/dashboards/ConversationsTable.tsx`

- L231 — `[gray-on-color]` text-zinc-200 on bg-cyan-500

### `src/modules/chatbot/server/admin/detectBotIssues.ts`

- L305 — `[overused-font]` font-family:Arial

### `src/modules/chatbot/server/notifications/sendLeadNotification.ts`

- L57 — `[overused-font]` font-family:Arial
- L75 — `[side-tab]` border-left:4px solid #06b6d4


