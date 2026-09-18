/**
 * P2.B.2 — Invariante del gate de plan del reporte ejecutivo semanal. Corre SIN DB ni server:
 *
 *   npm run check:invariant:executive-report-plan
 *   (o: npx tsx src/lib/reports/executive-weekly/report-eligible-plan.invariant.ts)
 *
 * Verifica que reportEligiblePlan/businessOnlyReportSection coincidan EXACTAMENTE
 * con el gate real de build.ts (`plan.key !== 'PRO' && plan.key !== 'BUSINESS'` para
 * el reporte completo, `plan.key === 'BUSINESS'` para la sección de leads
 * destacados). La card de /dashboard/cuenta/perfil usa este helper porque
 * build.ts (motor del reporte, fuera de scope) no lo expone como función reusable.
 */
import assert from 'node:assert/strict'
import { reportEligiblePlan, businessOnlyReportSection } from './report-eligible-plan.ts'
import { cuerpoDeFuncion, fuenteDe, sinComentarios } from '../../invariant-call-site.ts'

// ── Gate del reporte completo (mismo criterio que build.ts) ───────────────────
assert.equal(reportEligiblePlan('STARTER'), false, 'STARTER no recibe el reporte')
assert.equal(reportEligiblePlan('PRO'), true, 'PRO recibe el reporte')
assert.equal(reportEligiblePlan('BUSINESS'), true, 'BUSINESS recibe el reporte')

// ── Gate de la sección "leads destacados" (exclusiva BUSINESS) ────────────────
assert.equal(businessOnlyReportSection('STARTER'), false, 'STARTER no ve leads destacados')
assert.equal(
  businessOnlyReportSection('PRO'),
  false,
  'PRO no ve leads destacados (recibe el resto del reporte, no esa sección)',
)
assert.equal(businessOnlyReportSection('BUSINESS'), true, 'BUSINESS ve leads destacados')

// ── P32 — Y ADEMÁS: contra el gate REAL, leído de build.ts ───────────────────
// Las seis aserciones de arriba comparan el helper contra tres literales escritos
// a mano. El encabezado promete que coincide «EXACTAMENTE con el gate real de
// build.ts», y build.ts nunca entra al proceso: el censo de P26 lo midió como
// «espejo a mano de un sujeto que nunca se lee». El propio comentario del helper
// lo admite — «si ese gate cambia alguna vez, actualizar también acá» — y eso es
// una nota, no una red. Si el motor pasa a mandarle el reporte a STARTER, o deja
// de mandárselo a PRO, la card de /dashboard/cuenta/perfil le sigue diciendo al
// cliente lo contrario de lo que va a recibir, y este chequeo sigue verde.
//
// Acá el sujeto se LEE. La expectativa deja de estar escrita a mano: sale del
// `if` del motor. Y el universo de planes sale del schema, no de una lista de
// tres — un plan nuevo entra al barrido solo.
//
// Los recortes NO fijan el nombre de la variable del plan (`.key`, no `plan.key`)
// ni atan el `if` a su `return` por distancia: las dos cosas se midieron contra un
// control y las dos daban ROJO ante una edición inocua (renombrar el local; meter
// un log en el medio). Un invariante que se cae ante eso entrena a ignorarlo.
const MOTOR = ['src', 'lib', 'reports', 'executive-weekly', 'build.ts'] as const
// `sinComentarios` importa acá: arriba del gate hay un comentario que dice «solo
// PRO y BUSINESS reciben el reporte». Un escaneo que lo lea encuentra los dos
// planes correctos aunque el código diga otra cosa — se firmaría a sí mismo.
const motor = sinComentarios(cuerpoDeFuncion(MOTOR, 'buildExecutiveWeeklyReport'))

const enumDelSchema = /enum PlanKey \{([^}]*)\}/.exec(fuenteDe('prisma', 'schema.prisma'))
assert.ok(enumDelSchema, 'no se encontró `enum PlanKey` en prisma/schema.prisma')
const TODOS_LOS_PLANES = enumDelSchema[1]
  .split('\n')
  // `split('//')` porque un miembro comentado —`BUSINESS // ver pricing doc`— si
  // no deja de matchear y el plan desaparece del censo en silencio.
  .map((l) => l.split('//')[0]!.trim())
  .filter((l) => /^[A-Z_]+$/.test(l))
assert.ok(
  TODOS_LOS_PLANES.length >= 3,
  `el enum PlanKey del schema devolvió ${TODOS_LOS_PLANES.length} planes: el barrido de abajo ` +
    'estaría recorriendo menos de lo que cree.',
)

// 1. El gate del reporte completo. En el motor está escrito como un rechazo
//    (`plan.key !== A && plan.key !== B` → `reason: 'PLAN'`), así que los planes
//    que NOMBRA son exactamente los elegibles. Se pide UNICIDAD en vez de
//    proximidad: si algún día hay dos condiciones de plan en esta función, el
//    recorte es ambiguo y tiene que fallar ruidoso en vez de elegir una.
const condicionesDePlan = [...motor.matchAll(/if\s*\(([^)]*\.key\s*!==[^)]*)\)/g)]
assert.equal(
  condicionesDePlan.length,
  1,
  `se esperaba UNA condición de plan en \`buildExecutiveWeeklyReport\` y hay ` +
    `${condicionesDePlan.length}. Con cero, el motor dejó de gatear por plan o lo escribe de ` +
    'otra forma (un helper, un `switch`, un `.includes()`) y este chequeo volvería a ser un ' +
    'espejo a mano. Con dos o más, el recorte es ambiguo. En cualquier caso, atalo a la forma ' +
    'nueva en el mismo commit.',
)
// Y que ese `if` siga siendo el rechazo por plan, no otra cosa.
assert.match(
  motor,
  /reason:\s*'PLAN'/,
  "el motor ya no devuelve `reason: 'PLAN'`: la condición que este chequeo está leyendo puede\n" +
    '  haber dejado de ser el gate del reporte.',
)
const elegiblesSegunElMotor = new Set(
  [...condicionesDePlan[0][1].matchAll(/\.key\s*!==\s*'([A-Z_]+)'/g)].map((m) => m[1]),
)
assert.ok(
  elegiblesSegunElMotor.size > 0,
  'el gate de plan del motor no nombra ningún plan: el recorte quedó vacío y compararía\n' +
    '  contra la nada.',
)

for (const plan of TODOS_LOS_PLANES) {
  assert.equal(
    reportEligiblePlan(plan as Parameters<typeof reportEligiblePlan>[0]),
    elegiblesSegunElMotor.has(plan),
    `\`reportEligiblePlan('${plan}')\` no coincide con el gate real de build.ts.\n` +
      `  El motor le manda el reporte a: ${[...elegiblesSegunElMotor].join(', ')}.\n` +
      '  La card de /dashboard/cuenta/perfil usa este helper para decirle al cliente si va a\n' +
      '  recibirlo: cuando divergen, le promete un entregable que no llega (o le esconde uno\n' +
      '  que sí). Actualizá el helper para que espeje el gate nuevo.',
  )
}

// 2. La sección de leads destacados, exclusiva de un plan.
const seccionDelMotor = /\.key\s*===\s*'([A-Z_]+)'\s*\?\s*await\s+getTopHotLeadsForWeek/.exec(motor)
assert.ok(
  seccionDelMotor,
  'no se encontró en el motor el ternario que gatea `getTopHotLeadsForWeek` por plan. Si la\n' +
    '  sección de leads destacados cambió de forma, atá el recorte nuevo acá.',
)
const planDeLaSeccion = seccionDelMotor[1]
for (const plan of TODOS_LOS_PLANES) {
  assert.equal(
    businessOnlyReportSection(plan as Parameters<typeof businessOnlyReportSection>[0]),
    plan === planDeLaSeccion,
    `\`businessOnlyReportSection('${plan}')\` no coincide con el motor, que reserva los leads\n` +
      `  destacados para ${planDeLaSeccion}.`,
  )
}

console.log(
  '✓ invariante OK: el gate de plan de la UI (perfil/page.tsx) coincide con el ' +
    'gate real de build.ts para PRO/BUSINESS y la sección BUSINESS-only.',
)
