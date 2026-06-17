# B9 — Changelog del refresh visual de LeadOS

Qué cambió por superficie y por qué, con referencia al plan ([b9-plan-visual.md](./b9-plan-visual.md)).
Marcas: **SEGURO** = presentación en archivos de LeadOS · **SENSIBLE** = toca el kit compartido (revisar zonas externas).

Evidencia visual: las capturas antes/después se verifican en vivo sobre `dev:qa` (3002). La verificación final la hace Franco con el ojo.

---

## Tanda 0 — Foundations · **SENSIBLE** · commit `feat(b9/sensible): foundations…`

Toca `src/components/ui/*` (lo usan también dashboard/admin/marketing). Todo aditivo / backward-compatible.

- **`Callout.tsx` (NUEVO):** caja de mensaje semántica (`neutral/info/brand/success/warning/danger`) + barra de acento opcional. Reemplaza las ~30 cajitas inline `rounded-xl border-amber-400/20 bg-amber-500/[0.06]…` repetidas por LeadOS. Server-component-safe.
- **`Modal.tsx`:** nueva prop `surface='solid' | 'glass'` (default `solid` = sin cambio). El glass alinea los modales de LeadOS al lenguaje del resto. **Revisar fuera de LeadOS:** los modales de dashboard/admin con el default deberían verse idénticos.
- **`leados-ui.ts` (NUEVO):** `STAGE_TONE` — fuente única del tono por stage con la disciplina de color B9 (stage nunca cyan/amber; emerald=ok, rose=problema, resto azul/violeta/zinc).

---

## Superficie 1 — `/setter` home-hub · **SEGURO** · commit `feat(b9/seguro): setter home-hub…`

Diagnóstico (plan §2.1): la próxima-acción se susurraba (caption `text-xs` perdida); los grupos pesaban todos igual; el onboarding parecía un CTA (gradiente promo).

- **`home-sections.tsx`:**
  - **Próxima acción → pill accionable.** Pasó de caption (`text-xs` cyan/zinc) a una pill rellena (`bg-cyan-500/10 text-cyan-200` si accionable, `bg-white/[0.03] text-zinc-400` si espera) — ahora es el elemento más fuerte de la card. _Verificado: `bg-cyan-500/10 text-cyan-200`._
  - **Acento de accionabilidad.** Barra izquierda 4px: cyan si "hacé esto ahora", neutra si "esperando". Borde de la card cyan-tintado cuando es accionable.
  - **`STAGE_TONE` compartido** en vez del mapa local (saca cyan de EN_REVISION y amber de CONSTRUCCIÓN → disciplina de color).
  - **Rechazo → `Callout` danger con acento** + título "Franco pidió cambios" + icono. Antes era una cajita rosa enterrada; ahora salta.
  - **Lane prioritario** en "Para trabajar ahora": panel tintado `bg-cyan-400/[0.03] ring-cyan-400/15` que lo separa de las esperas. _Verificado en captura._
- **`onboarding-hint.tsx`:** `Card variant="highlighted"` (gradiente+sombra = promo) → `variant="default"` glass + barra de acento izquierda. Títulos de paso `text-cyan-300` → `text-zinc-200` (menos cyan decorativo). Ahora lee como guía, no como oferta. _Verificado desktop + mobile._
- **`page.tsx`:** las 4 colas y el marcador de resultado ("Demos aprobadas", + subtítulo "tu marcador") separados por un divisor sutil en `lg`.

Estados/responsive: mobile impecable (capturado 480px) — stats 2-col, onboarding con acento, todo apilado limpio. `tsc --noEmit` limpio.

---

## Superficie 2 — `/setter/leads/[id]` wizard · **SEGURO** · commit `feat(b9/seguro): setter wizard…`

Diagnóstico (plan §5): el control más usado (copy-block) no destacaba; labels del stepper se truncaban ("Const…"); cajitas de alerta inline inconsistentes; el panel de materiales en cyan parecía accionable.

- **`dossier-stepper.tsx`:** labels sin truncar (`min-w-max` + `whitespace-nowrap`) — "Construcción" entero, no "Const…". En mobile el stepper scrollea horizontal en vez de cortar. _Verificado: labels completos._
- **`copy-block.tsx`:** borde de zona-de-acción más fuerte (`border-cyan-400/30 bg-cyan-500/[0.05]`) — la zona que el setter copia 10+ veces por lead ahora salta. **Flash de copiado:** al copiar, el bloque pre destella emerald 300ms (confirma la acción en el bloque, no solo en el botón). _Verificado: `border-cyan-400/30`._
- **`lead-wizard.tsx`:** banner de rechazo inline → `Callout` danger con acento (consistente con la cartera).
- **`construccion-step.tsx`:** `UrgenciaBanner` y `GuiaRetrabajo` inline → `Callout` (warning / danger-acento). **Panel de materiales (NII-1) cyan → neutro:** era referencia disfrazada de accionable; ahora `border-white/10 bg-white/[0.04]`, énfasis por copy ("usalos, nada de placeholders"), no por color. Disciplina: cyan = acción.
- **`self-check-step.tsx`:** los checks **obligatorios** ahora tienen su propio contenedor (paralelo al de "Ojo de diseño"), con icono `ShieldCheck` — duros vs blandos claramente separados. Estados de cierre → `Callout` (success/neutral).

`tsc --noEmit` limpio. Rechazo/materiales/self-check reutilizan el `Callout` ya verificado en la cartera; estados por-stage (RECHAZADA/CONSTRUCCION) quedan para el barrido visual final + verificación de Franco.

---

## Superficies 3 y 4 — admin de Franco · **SEGURO** · commit `feat(b9/seguro): admin leados/leads…`

Diagnóstico (plan §4.2): la cola no rankeaba visualmente; el panel de reunión —el resultado del negocio— vestía ámbar (warning); el veredicto AVANZAR en cyan diluía lo accionable; el cross-link a LeadOS era texto chico fácil de perder.

- **`admin/leados/page.tsx` (cola):** las filas **rankean** — los Calientes ganan fondo+borde ámbar y barra de acento izquierda; "revisá esto primero" salta. Radios `[28px]/[22px]` → tokens (`rounded-3xl`/`rounded-2xl`). _Verificado: la fila caliente se distingue de las neutras._
- **`dossier-panels.tsx` (paneles de revisión):** radio del panel a token (`rounded-3xl`); veredicto **AVANZAR cyan → blue** (informativo, no acción); "sin self-check exigible" y "flags del setter" → `Callout` (danger / warning).
- **`decision-bar.tsx` (veredicto):** los modales Aprobar/Rechazar pasan a `surface="glass"` (alinea al lenguaje del resto). _Verificado: dialog `bg-zinc-900/80 backdrop-blur-2xl`._
- **`reunion-panel.tsx` (cierre B7):** **ámbar → emerald** + icono `CalendarCheck2` — la reunión es el resultado/objetivo, no una precaución. Radio a token. _Code+tsc; live pendiente (no encontré un lead LeadOS con reunión booked en la sesión QA)._
- **`admin/leads/[leadId]/page.tsx`:** cross-link a la revisión LeadOS de texto chico → **chip descubrible** (pill cyan con borde). _Verificado: chip `rounded-full` borde cyan-400/30._

`tsc --noEmit` limpio.

### ⚠ Hallazgos para Franco (no resueltos en B9)

1. **Centrado del modal de veredicto (PRE-EXISTENTE). ✅ RESUELTO** — ver _Tanda 7_ abajo. El `Modal` compartido no usaba portal: su backdrop `fixed inset-0` quedaba confinado al contenedor del layout en la pantalla de revisión, así que el modal aparecía en la columna derecha en vez de centrado sobre el viewport. **No lo introdujo B9** (solo se agregó la prop `surface`; el render estructural era el de antes). El primer intento (portal a `document.body` con `z-50`) se había revertido porque el app tiene capas `fixed` muy altas (preloader/marketing/navbar `z-[9999]`, dock/noise/shutter `9985–9995`, cursor custom `2_147_483_647`) y, sobre todo, el layout de admin es `fixed inset-0 z-[80]`: un modal portaleado a `z-50` quedaba **debajo** del propio contenido de admin y del `iframe` de la demo. El fix correcto (portal + token `zIndex.modal = 10000`, sobre el chrome y bajo el cursor) ya está aplicado y verificado.
2. **Reunión emerald — verificación visual pendiente.** El recolor es trivial y tsc-limpio, pero no pude abrirlo en vivo (sin lead LeadOS con reunión agendada a mano). Revisalo en un lead con reunión booked.

---

## Tanda 7 — Modal centrado (fix del hallazgo #1) · **SENSIBLE** · commit `fix(b9/sensible): modal portal…`

Toca el kit compartido (`src/components/ui/Modal.tsx` + token `zIndex` en `src/lib/design-tokens.ts`). Lo usan dashboard/admin/setter/design-system, así que es backward-compatible por diseño.

- **`Modal.tsx`:** ahora `createPortal(…, document.body)` con guard de mount (`useState(false)` + `useEffect` → `null` en SSR/primer render, sin mismatch). El backdrop ya no se mide contra el contenedor del layout sino contra el viewport. El `z-index` deja de ser la clase `z-50` y pasa al token vía `style={{ zIndex: zIndex.modal }}`.
- **`design-tokens.ts`:** `zIndex.modal 50 → 10000` (+ `toast 10010`, `tooltip 10020`), documentado: las capas full-viewport viven **sobre** el chrome `fixed` del app (preloader/marketing/navbar `9999`, dock/noise/shutter `9985–9995`, layout de admin `z-[80]`) y **bajo** el cursor custom (`2_147_483_647`). _Nota: en Tailwind v4 el `tailwind.config.ts` legacy no se carga (no hay `@config`), así que estos tokens no generan utilidades `z-*`; por eso el Modal consume el valor del token directo por `style`, no por clase._
- **`iframe` de la demo** (`admin/leados/[leadId]/page.tsx`): **no se tocó**. Con el backdrop a `z-10000` portaleado a `<body>`, cubre todo el layout de admin (`z-[80]`) y por lo tanto el iframe — el ordenamiento de stacking lo resuelve solo.

**Verificación (server prod-QA fresco, `next-prod-qa` 3001):**
- _Prueba determinística_ (medición por `eval`) sobre la **pantalla real del bug** (revisión LeadOS, modal **glass** "Aprobar demo", con el iframe detrás): backdrop `parentElement === document.body` ✅ · `zIndex` computado `10000` ✅ · backdrop cubre el viewport completo `(0,0 → vw×vh)` ✅ · dialog centrado X e Y ✅ · `elementFromPoint(centro)` cae **dentro del modal, NO en el iframe** (el centro del viewport está dentro del rect del iframe, antes el iframe ganaba) ✅ · superficie `oklab(… / 0.8)` (glass intacto) ✅.
- _Screenshots_: glass centrado en **desktop** (1280×800) y **mobile** (375×812) ✅.
- _Prueba determinística_ sobre un modal **solid** (design system `/admin/_design`): portal→body ✅ · `z 10000` ✅ · viewport completo ✅ · centrado X/Y ✅ · superficie `oklch(0.141 …)` **opaca** (solid intacto) ✅.
- _No verificado en vivo_: el `escalar-modal` del setter (solid) sólo renderiza en stage CONSTRUCCION y los leads-seed alcanzables estaban en contacto/revisión — es el **mismo** componente compartido con `surface="solid"` (ya probado geométricamente) en un layout **más simple** que el de admin (sin `z-[80]` + iframe, que es el caso difícil y pasó). `tsc --noEmit` y `npm run build` verdes.

---

## Cierre

**Build / tsc / migraciones:**
- `npm run build` → **verde** (todas las rutas LeadOS + dashboard compilan).
- `npx tsc --noEmit` → **limpio** en cada tanda.
- `npx prisma migrate status` → **"Database schema is up to date!"** — **cero cambios de schema** (esto es presentación).

**SEGURO vs SENSIBLE:** una sola tanda SENSIBLE (foundations, `src/components/ui/*`). El cambio de `Modal` es backward-compatible (default `solid` byte-idéntico al original) → sin regresión posible en dashboard/admin/marketing por el refactor. `Callout` y `leados-ui` son nuevos (aditivos). El resto, todo SEGURO (archivos de LeadOS).

**Verificado en vivo** (instancia de preview fresca, desktop 1600 + mobile 480):
- Cartera: pill de próxima acción (cyan), lane prioritario, onboarding sin gradiente promo (desktop + mobile).
- Wizard: stepper con labels completos, copy-block con borde de acción reforzado.
- Cola admin: fila caliente rankeada vs neutras.
- Modal de veredicto: superficie glass.
- Cross-link LeadOS: chip descubrible.

**Verificado por código + tsc + build** (live pendiente de Franco, por falta del estado exacto en la sesión QA): rechazo/materiales/self-check del wizard en stage RECHAZADA/CONSTRUCCION; reunión emerald.

**Lectura honesta:** el piso de las tres zonas subió y se sienten el mismo producto — la próxima acción del setter salta sola, la cola de Franco rankea de un vistazo, y las cajas de alerta dejaron de ser "siete bloques pegados" (un `Callout`, un `STAGE_TONE`, una escala de radios). La superficie que quedó **mejor**: la cartera del setter (cambio de jerarquía real, verificado en los dos breakpoints). La que quedó **menos cerrada**: la pantalla de revisión de Franco — el refresh estético entró (glass, ranking, tonos), pero destapó el bug pre-existente de centrado del modal, que es una tarea propia. Nada entró pretendiendo estar verificado a ciegas: lo que vio el ojo está marcado como tal, y lo que falta ver está flagueado arriba.
