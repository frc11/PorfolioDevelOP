# Audit de inconsistencias visuales

**Fecha:** 2026-05-18

## Padding values encontrados

Distribucion en cards/containers de `src/app/(protected)/admin` con `rounded-2xl` o `rounded-3xl`:

| Padding | Frecuencia |
|---|---:|
| `p-4` | 34 |
| `p-2` | 29 |
| `p-3` | 9 |
| `p-1` | 6 |
| `p-6` | 3 |
| `p-12` | 3 |
| `p-5` | 2 |
| `p-10` | 2 |
| `p-14` | 2 |
| `p-11` | 1 |
| `p-8` | 1 |

## Border radius encontrados

Distribucion en `src/app/(protected)/admin` y `src/modules/chatbot/components/admin`:

| Radius | Frecuencia |
|---|---:|
| `rounded-2xl` | 188 |
| `rounded-full` | 103 |
| `rounded-xl` | 58 |
| `rounded-3xl` | 16 |
| `rounded-lg` | 15 |
| `rounded-r` | 1 |

## Componentes duplicados

- StatCard en 4 implementaciones previas:
  - `src/app/(protected)/admin/_components/stat-card.tsx`
  - `src/components/admin/AdminSettingsConsole.tsx`
  - `src/app/(protected)/dashboard/modules/tienda-conectada/page.tsx`
  - `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx`
- Stat-like compartido existente: `src/components/ui/Stat.tsx`
- Section en 4 ubicaciones/nombres similares:
  - `src/components/layout/SectionTransition.tsx`
  - `src/components/layout/SectionWrapper.tsx`
  - `src/components/ui/Section.tsx`
  - `src/modules/chatbot/server/prompts/sections.ts`
- EmptyState en 2 ubicaciones:
  - `src/components/ui/EmptyState.tsx`
  - `src/app/(protected)/admin/_components/empty-state.tsx`
- Card-like containers detectados en al menos 20 archivos con patrones `rounded + border + bg-white/bg-zinc`:
  - `src/components/automation/CalculadoraAutomation.tsx`
  - `src/components/automation/BentoAutomation.tsx`
  - `src/components/automation/CtaAutomation.tsx`
  - `src/components/admin/AdminDashboard.tsx`
  - `src/components/admin/admin-ui.tsx`
  - `src/components/automation/IntegracionesAutomation.tsx`
  - `src/components/automation/ProcesoAutomation.tsx`
  - `src/components/ui/LoadingState.tsx`
  - `src/components/admin/ClientForm.tsx`
  - `src/components/admin/AdminSettingsConsole.tsx`
  - `src/app/bienvenida/_components/Step3Tour.tsx`
  - `src/components/automation/VaultAutomation.tsx`
  - `src/components/admin/LeadsCRM.tsx`
  - `src/app/bienvenida/_components/Step2Conexiones.tsx`
  - `src/app/bienvenida/_components/Step1Empresa.tsx`
  - `src/components/ui/ErrorState.tsx`
  - `src/components/admin/TicketsFilters.tsx`
  - `src/components/ui/EmptyState.tsx`
  - `src/components/admin/ClientModulesPanel.tsx`
  - `src/components/admin/SendForApprovalButton.tsx`

## Spacing values

Distribucion de `space-y-*` en `src/app/(protected)/admin`:

| Spacing | Frecuencia |
|---|---:|
| `space-y-6` | 27 |
| `space-y-3` | 22 |
| `space-y-4` | 20 |
| `space-y-5` | 18 |
| `space-y-1` | 10 |
| `space-y-2` | 7 |
| `space-y-8` | 2 |

## Decision: valores canonicos para design system

- Padding default cards: `p-5` (20px)
- Padding default sections: `p-6` (24px)
- Border radius default: `rounded-2xl` (16px)
- Border radius hero: `rounded-3xl` (24px)
- Space between sections: `space-y-6` (24px)
- Space between items: `space-y-3` (12px)
- Colores borde: `border-white/10` (default), `border-white/20` (emphasis)
- Backgrounds: `bg-white/[0.02]` (default), `bg-white/[0.04]` (hover/emphasis)
