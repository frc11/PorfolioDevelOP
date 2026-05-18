# Sprint Alpha.2 — Onboarding Wizard Profesionalizado

**Fecha:** 2026-05-17
**Build:** PASS
**Type check:** PASS (cero errores)

---

## Lo que se hizo

### Tarea 1 — Auto-save de progreso con localStorage
- **Hook `useOnboardingDraft`** — Persiste estado completo + step actual con debounce 1s, versión de draft, y expiración a 7 días
- **`DraftBanner`** — Banner con "Continuar" / "Descartar" que aparece al detectar borrador previo, con tiempo relativo en español (`date-fns/locale/es`)
- **Integración** — El wizard usa el hook en lugar de `useState` directo; `clearDraft()` se llama antes del redirect exitoso

### Tarea 2 — Pre-fills inteligentes
- **`slugify.ts`** en `src/lib/` — Utility reutilizable, misma lógica que el server action
- **Slug preview en Step1** — Debajo del input de empresa: `URL del bot: /api/chatbot/{slug-derivado}`
- **WhatsApp pre-fill** — Step4 llena automáticamente `549` (Argentina) si el campo está vacío
- **`suggestions.ts`** — Bot name y welcome message sugeridos por industria (10 industrias cubiertas)
- **Chips de sugerencia en Step2** — Botones clickeables para nombres y mensajes sugeridos

### Tarea 3 — Preview en vivo
- **`BotPreview`** — Sidebar sticky (380px, solo desktop) que muestra:
  - Simulación del chat widget con nombre, empresa, welcome message y quick replies
  - Colores en vivo según `accentColor`
  - Resumen de configuración actual (industria, tono, color, posición)
- **Layout responsivo** — Grid `1fr 380px` en desktop, single column en mobile

### Tarea 4 — Step 5 Review completo
- **Grid de ReviewSections** — 6 secciones organizadas: Empresa, Bot, Bienvenida, WhatsApp, KB, LLM
- **KB health indicators** — Dot verde/rojo por cada sección de KB según si tiene contenido suficiente
- **Spinner durante submit** — SVG animado reemplaza el texto del botón
- **Error display** — Panel rojo con título + detalle del error
- **Slug mostrado** — El slug derivado se muestra en la review
- **LLM defaults** — Se muestra el provider/modelo/quota default

## Archivos creados

| Archivo | Descripción |
|---|---|
| `src/lib/slugify.ts` | Utility reutilizable |
| `src/modules/.../onboarding/useOnboardingDraft.ts` | Hook de persistencia localStorage |
| `src/modules/.../onboarding/DraftBanner.tsx` | Banner de borrador pendiente |
| `src/modules/.../onboarding/suggestions.ts` | Sugerencias por industria |
| `src/modules/.../onboarding/BotPreview.tsx` | Preview en vivo del bot |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `OnboardingWizard.tsx` | Integración de draft hook, preview sidebar, DraftBanner |
| `Step1Company.tsx` | Slug preview debajo de orgName |
| `Step2BotIdentity.tsx` | Chips de sugerencia de nombre y welcome message |
| `Step4Appearance.tsx` | WhatsApp pre-fill, color picker mejorado |
| `Step5Review.tsx` | Review completo con 6 secciones, KB health, spinner, error handling |

## Definition of Done

- [x] Hook `useOnboardingDraft` implementado y funcional
- [x] DraftBanner aparece con borrador pendiente
- [x] Slug se auto-deriva de orgName
- [x] Sugerencias por industria funcionan (botName + welcomeMessage)
- [x] WhatsApp pre-llenado con 549
- [x] BotPreview muestra preview en vivo
- [x] Step 5 muestra TODOS los campos configurados
- [x] Build pasa
- [x] Type check pasa
- [ ] Cronometrar: completar wizard <8 min (pendiente test manual)
- [ ] Tests E2E del wizard (pospuestos a Alpha.19)
