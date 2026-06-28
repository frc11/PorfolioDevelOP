# Auditoría — "Design system" del admin (read-only)

> **Lane:** `lane/admin-design-system` (worktree `C:\lane-admin-design-system`, off `main` 4f770eb).
> **Tipo:** Fase 1 = auditoría read-only. NO se borró código de la feature.
> **Decisión de borrar (Fase 3) es de Valentino**, con esta auditoría en mano.

---

## 1. Qué es "Design system"

Una **galería viva de componentes y tokens** (playground de UI), interna del admin.

- **Ruta:** `/admin/_design`. La carpeta en disco es `src/app/(protected)/admin/%5Fdesign/` — el
  `%5F` es un `_` URL-encoded: truco de Next App Router para que un segmento que empieza con `_`
  (normalmente carpeta privada/no-ruteable) SÍ sea ruteable. Por eso el glob muestra `%5Fdesign`.
- **Page:** `admin/%5Fdesign/page.tsx` — **gated a `SUPER_ADMIN`** (`redirect('/login')` si no lo es).
  Renderiza el título "Design System" + `<DesignPlaygroundClient />`.
- **Componentes de la feature** (13 archivos, todos dentro de `admin/%5Fdesign/`):
  - `_components/DesignPlaygroundClient.tsx` (orquestador: tabs/secciones)
  - `_components/Example.tsx` (helper `Example` + `SectionWrapper`)
  - `_components/sections/*` (11): Tokens, Typography, Buttons, Cards, Forms, Stats, Modals,
    Badges, EmptyStates, Patterns, (Stats). Cada uno muestra ejemplos de un primitivo.
- **De qué cuelga (dependencias, todas one-way):** sólo `react`, `lucide-react`,
  `@/components/ui` (Badge, Button, Modal, Card, Field, Input, Select, Toggle, StatCard,
  EmptyState, Section, Eyebrow/Heading/Muted) y `@/lib/design-tokens` (colors/radii/spacing).
  Es un CONSUMIDOR de primitivos compartidos; nada del repo depende de él al revés.

---

## 2. ¿Está invocado/importado fuera de su propia pantalla?

**NO** — ningún módulo importa el código de la feature. Las ÚNICAS referencias externas son del
**shell del admin** (nav/breadcrumb), y NO importan sus componentes, sólo referencian la ruta/label:

| # | Archivo:línea | Qué es | Tipo |
|---|---|---|---|
| 1 | `admin/_components/admin-sidebar.tsx:95` | `{ href: '/admin/_design', label: 'Design system', icon: Palette }` | **Item del nav** (sidebar, sección "Configuración") |
| 2 | `admin/_components/admin-topbar.tsx:37` | `_design: 'Design system'` en `sectionLabelMap` | Label del breadcrumb/título (resolver, NO link) |

Referencias internas (dentro de la propia feature, no cuentan como consumidores externos):
`page.tsx:3,25` (importa/renderiza DesignPlaygroundClient) · `DesignPlaygroundClient.tsx`
(importa las 11 secciones) · cada `section/*` importa `../Example`.

Sin imports dinámicos/lazy, sin referencias en config de rutas, sin uso de sus componentes desde
otro lado. (Las menciones a "design system" en `ui/Callout.tsx:9`, `chatbot/.../field-styles.ts:3`
y dentro de `TokensSection.tsx` son COMENTARIOS conceptuales, no imports.)

---

## 3. ⚠️ FRANCO / setter / ventas

**CERO acople detectado.** Grep dentro de `admin/%5Fdesign/` de
`setter | OsLead | OsDemo | Franco | /ventas | demo-form | sales` → **No matches.**
La feature no importa nada de la zona de Franco, y nada de esa zona importa la feature
(ver §2: sus únicos consumidores son el sidebar y el topbar del admin). `@/lib/design-tokens`
es infra de diseño compartida (colors/radii/spacing), NO un objeto de Franco.

→ **No hay señal de acople con el setter/ventas/Franco.** Aun así, la verificación es sobre el
código visible en este worktree (off main); NO puedo ver el lane de Franco sin mergear ni su
drift en Neon. Para un BORRADO de código (Fase 3), recomendable un OK de Franco igualmente,
pero por el código acá no hay dependencia.

---

## 4. VEREDICTO

**Self-contained.** El Design system es un playground interno SUPER_ADMIN-only, consumidor
one-way de primitivos compartidos, sin consumidores externos de su código y sin acople con
Franco/setter. Sus únicas ataduras al resto del repo son las **2 referencias del shell admin**
(nav + breadcrumb-label).

- **Recomendación (decisión final de Valentino):** la **Fase 2** (sacar el item del nav) es
  segura y reversible. Un eventual **borrado del código** (Fase 3) luce de bajo riesgo según
  esta auditoría (nadie lo importa), PERO **se frena y se espera OK explícito de Valentino**;
  y si se quiere blindar, confirmar con Franco antes de borrar.
- **Nota:** al sacar el item del nav, la ruta `/admin/_design` **sigue accesible por URL directa**
  (page.tsx no se toca; sigue gated a SUPER_ADMIN). Eso es esperado en Fase 2; borrar la ruta es
  Fase 3.
