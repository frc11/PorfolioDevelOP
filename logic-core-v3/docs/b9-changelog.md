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

1. **Centrado del modal de veredicto (PRE-EXISTENTE).** El `Modal` compartido no usa portal: su backdrop `fixed inset-0` queda confinado al contenedor del layout en la pantalla de revisión, así que el modal aparece en la columna derecha en vez de centrado sobre el viewport. **No lo introdujo B9** (solo agregué la prop `surface`; el render estructural es el de antes). **Probé el fix correcto (portal a `document.body`) y lo revertí:** este app tiene capas de z-index altas (preloader `z-80`, cursor custom `z-max`, overlay de transición) y el `iframe` de la demo queda por encima del modal portaleado a `z-50` — el fix necesita reordenar el z-index del Modal por encima de esas capas, con verificación de TODOS los modales del app (dashboard, etc.). Es una tarea propia, no un detalle de refresh. **Recomendación:** portal + `z` por encima de la pila de transición, como cambio SENSIBLE dedicado.
2. **Reunión emerald — verificación visual pendiente.** El recolor es trivial y tsc-limpio, pero no pude abrirlo en vivo (sin lead LeadOS con reunión agendada a mano). Revisalo en un lead con reunión booked.

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
