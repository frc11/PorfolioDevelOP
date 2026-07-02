import type { PlanKey } from '@prisma/client'

// P2.B.2 — regla de elegibilidad del reporte ejecutivo semanal, para la UI de
// configuración del cliente (/dashboard/cuenta/perfil). DEBE coincidir
// exactamente con el gate real de build.ts (`plan.key !== 'PRO' &&
// plan.key !== 'BUSINESS'`). No se importa desde ahí: build.ts es el motor
// del reporte (fuera de scope de este sprint) y no expone ese chequeo como
// función reusable — si ese gate cambia alguna vez, actualizar también acá.
export function reportEligiblePlan(planKey: PlanKey): boolean {
  return planKey === 'PRO' || planKey === 'BUSINESS'
}

// La sección de "leads destacados" del reporte (getTopHotLeadsForWeek) es
// exclusiva de BUSINESS — Pro recibe el resto del reporte pero nunca esa
// sección, sin importar la cantidad configurada.
export function businessOnlyReportSection(planKey: PlanKey): boolean {
  return planKey === 'BUSINESS'
}
