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
