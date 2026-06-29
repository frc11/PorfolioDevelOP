# develOP — Revisión Demos: registro de cambios (cierre de etapa)

Cierre del módulo **Revisión Demos** del panel admin (Logic Core v3). Sección `/admin/leados` filtrada por `OsLeadDossier` en stage `EN_REVISION`, con `draftUrl` como fuente del iframe de preview. Trabajado en paralelo (lane dedicado) durante la 2ª tanda de Operaciones. Repo: github.com/frc11/PorfolioDevelOP · app: `logic-core-v3/`. Fecha de cierre: 17 de junio de 2026\.

**Nota sobre hashes.** Los commits del lane (`lane/demos`) están con su hash real (de la auditoría de cierre). El merge a main y el fix post-merge de `decision-bar` quedan descritos por mensaje — completarlos con `git log --oneline` si se necesita el hash exacto.

---

## 1\. Qué es la sección

La cola de revisión de demos: el setter sube una demo (un sitio publicado en una URL real), y el admin la **aprueba** o **rechaza** desde acá. Opera sobre `OsLeadDossier` filtrado por `stage = EN_REVISION`, usando `draftUrl` como `src` del iframe de preview. **Aclaración de modelo importante:** `OsDemo` NO es el modelo de esta sección — el correcto es `OsLeadDossier` con stage `EN_REVISION`. La cola prioriza calientes primero, después por antigüedad.

Vistas: la **cola** (lista de dossiers en revisión) y el **detalle** de una demo (preview en iframe \+ paneles de veredicto, evaluación, brief de diseño, ficha de observación, self-check del setter).

---

## 2\. Lo realizado (lane `lane/demos`)

Ejecutado en un git worktree aislado, 4 sprints secuenciados en un solo super-prompt (Opus ultracode).

| SHA | Sprint | Qué resolvió |
| :---- | :---- | :---- |
| `ec561ff` | — | `chore`: plan \+ log del lane (`_lane-demos-log.md`): scope, prohibidos, discovery (URLs reales, mecanismo de seed, patrón de forms, gap de `decision-bar`), 4 sprints con criterios. |
| `58458f8` | S1 | **Seed de la cola con URLs reales.** `scripts/demos-seed-review-queue.ts` (\~400 líneas): 6 leads `DEMO Web · *` con URLs Netlify reales, camino legal FICHA→EN\_REVISION vía `transitionDossier`, migración de filas legacy `example.*`. Idempotente, con guard de branch dev. |
| `45bf684` | S2 (1er intento) | **SUPERSEDED.** Diagnóstico incorrecto del bug de Aprobar/Rechazar: arregló el cierre/reset del modal en el camino de éxito y `router.push`→`router.refresh()`, pero el bug visual real (modal pegado a la derecha, no centrado) persistía. Las mejoras se conservaron en el re-fix. |
| `9265791` | S3 (inicial) | **Ficha de observación → acordeón hover one-at-a-time.** `ficha-accordion.tsx`: debounce 110ms, lock anti-cascada, grid-rows 0fr↔1fr, reduced-motion, a11y. Integración en `dossier-panels.tsx`. |
| `c2a6c66` | S4 | **Layout del detalle aprovecha el alto (preview sticky).** `[leadId]/page.tsx`: `xl:self-start` \+ `xl:sticky xl:top-0` \+ `h-[calc(100vh-12.5rem)]` en la preview; iframe `xl:h-full`; empty state con `xl:flex-1`. Eliminó el hueco muerto. |
| `284f897` | S3 (hardening) | **Hardening del acordeón \+ seed (post review adversaria).** Acordeón: tracking por `key` (no índice) \+ fallback al primero → siempre exactamente una abierta; side-effects fuera del updater de `setState` (pureza React); `aria-controls`\+`id`\+`aria-hidden`. Seed: guard `startedEnRevision` elimina UPDATE redundante. |
| `be48efa` | S2 (fix correcto) | **FIX DEFINITIVO de Aprobar/Rechazar.** Reescribió `decision-bar.tsx`: overlay portaleado a `document.body` con `createPortal` \+ `useIsClient`; `<form onSubmit>`; `<Button loading>` / `<Input>` compartidos; serverError en banner. |
| `9291b4c` | — | `chore`: cierre del lane — auditoría \+ notas de merge anexadas al log. |

**6 archivos de código, \+926 / −129.** Aislamiento limpio: todo dentro de `admin/leados/[leadId]/**` \+ el seed. Cero archivos compartidos tocados, cero schema.

---

## 3\. La causa raíz del bug del modal (lección de arquitectura)

El modal de Aprobar/Rechazar aparecía pegado a la derecha en vez de centrado. El primer diagnóstico (cierre/reset) era incorrecto. La **causa real era estructural**: `decision-bar` usaba el `<Modal>` compartido, que renderiza `position:fixed` inline sin portal; el `<main>` del admin tiene `backdrop-blur-md` → ese `backdrop-filter` crea un **containing block** que atrapa `position:fixed` de todos sus descendientes → el modal se ancla al `<main>`, no al viewport. La corrección replicó la estructura de `lead-form.tsx` (portal a `document.body`).

**Esta es la misma trampa que afecta a todo modal del admin.** El lane la resolvió localmente (portal a body), pero marcó que la raíz vive en el archivo compartido `AdminLayoutClient.tsx`. → Se resolvió de forma **centralizada** después, en el bloque de main (ver registro Transversal Operaciones, fix del `backdrop-filter`).

---

## 4\. Fix post-merge: `decision-bar.tsx` reconciliado

Tras el merge del lane \+ un merge adicional de código de Franco (de otra parte) que también tocó este archivo, el build rompió con error de sintaxis JSX (`Expected '</', got 'jsx text'` en `decision-bar.tsx:269`) — JSX desbalanceado por merge mal resuelto. Se reconcilió conservando la estructura del lane de demos (overlays portaleados a body, un `<Overlay>` por acción con su `<form onSubmit>`). **Lección:** un merge con código de un tercero puede romper la sintaxis aunque cada parte compile por separado — buscar marcadores de conflicto antes de editar a ciegas.

---

## 5\. Pendiente operativo (no bloquea)

**Correr el seed contra la DB.** El worktree no tenía `.env.local` / `DATABASE_URL` / `tsx`. El script está escrito, idempotente, con guard de branch dev. Comando:

cd logic-core-v3

npx tsx scripts/demos-seed-review-queue.ts

Hasta correrlo, la cola muestra las URLs que haya en DB (las legacy `example.*` o lo que esté). No afecta el código mergeado.

---

## 6\. Verificado a ojo (humano, en :3000)

- **Flujo Aprobar/Rechazar end-to-end:** demo EN\_REVISION → Aprobar/Rechazar → modal centrado con backdrop sobre todo el viewport (ya no pegado a la derecha) → submit con URL válida → cambia el estado real (ya no EN\_REVISION). UX nueva: ya NO hay auto-salto a la próxima demo; se avanza con "Siguiente en la cola".  
- **Ficha de observación:** acordeón hover one-at-a-time, sin flicker, sin cascada, reduced-motion instantáneo, abre también por click/teclado.  
- **Preview sticky:** el iframe llena el alto disponible sin hueco; sticky al scrollear los paneles.  
- **Hover de los bloques de datos** (lote transversal): aplicado a los paneles del detalle (La demo, Tu veredicto, Evaluación, Brief, Self-check); **excluido el título**. La cola tiene hover ligeramente agrandado.

---

## 7\. Deuda / pendiente

- **Seed sin correr** (operativo, ver §5).  
- **Componentes oversize a monitorear** (preexistentes, no agravar): `[leadId]/page.tsx`, `lead-form.tsx`, `demo-form.tsx`.  
- El fix centralizado del `backdrop-filter` (que esta sección motivó) ya se aplicó en el bloque de main — ver registro Transversal Operaciones.

---

## 8\. Lecciones

- **`OsDemo` ≠ Revisión Demos.** El modelo correcto es `OsLeadDossier` en stage `EN_REVISION`, `draftUrl` como iframe source. Confundirlos manda a tocar el modelo equivocado.  
- **El trap del `backdrop-filter`.** Un `backdrop-filter` en un ancestro convierte a ese ancestro en containing block de los `position:fixed` descendientes → se anclan ahí, no al viewport. Fix local: portal a body. Fix de raíz: sacar el filter del ancestro (se hizo centralizado después).  
- **Review adversaria después de cada batch** cazó bugs reales del acordeón (cero secciones abiertas al cambiar items, timers duplicados en StrictMode, escritura de refs en render).  
- **Merge de código de tercero puede romper JSX** sin que sea un bug de nadie — reconciliar conservando la estructura correcta, buscar marcadores de conflicto primero.
