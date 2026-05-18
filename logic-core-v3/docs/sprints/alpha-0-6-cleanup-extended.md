# Sprint Alpha.0.6 — Limpieza legacy + audit env vars

## Cambios

### Archivos eliminados
- `src/components/admin/SidebarNav.tsx` (duplicado, sin referencias)

### Env vars
- `.env.example` actualizado: SÍ
- `docs/env-vars.md` creado/actualizado: SÍ
- `scripts/check-env.js` creado: SÍ
- `.gitignore` actualizado: SÍ

### Console.logs
- 3 eliminados (debug en results-insights.ts y dashboard page.tsx). Los logs estructurales de la API del chatbot se mantuvieron por ser de producción.

### Migración motion
- 0 imports framer-motion → motion/react migrados (todos los imports de framer-motion que quedaron pertenecen a componentes del portfolio, los cuales según las reglas deben mantenerse como legacy).

## Archivos potencialmente huérfanos detectados
- `src/components/ui/EmptyState.tsx` (admin usa `src/app/(protected)/admin/_components/empty-state.tsx`)

## Próximo sprint
Alpha.0.7 — Baseline performance + observability
