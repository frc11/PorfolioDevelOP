#!/usr/bin/env node
// Auditoría de renovación 2026-10 — escribe 11-CONGELADOS.md (E5, DEC-38) desde lo medido y lo analizado.
//
// Entradas: _crudo/congelados-datos.json (congelados-datos.mjs: historia, importadores, cambios en rediseno/home),
// _crudo/congelados-resultado.json (los dos analistas de solo lectura del workflow de congelados), el registro de
// hallazgos (_crudo/hallazgos, para contar hoy qué hallazgos citan cada archivo) y la revisión CNG-c1 (los defectos
// nuevos que trajeron los analistas, ya escritos con ID). Las verificaciones del padre van en VERIF_PADRE.
// La política de niveles del final es del padre y sale de lo medido (no se aplica nada: es propuesta).
//
// Uso (desde logic-core-v3): node scripts/auditoria/congelados-md.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { leerPartido } from './crudo-partes.mjs'
import { nodoDeRuta } from './atlas/nodos.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const CRUDO = path.join(DIR, '_crudo')
const datos = JSON.parse(readFileSync(path.join(CRUDO, 'congelados-datos.json'), 'utf8'))
const res = JSON.parse(readFileSync(path.join(CRUDO, 'congelados-resultado.json'), 'utf8'))
const reg = leerPartido(CRUDO, 'hallazgos', null, 'hallazgos').hallazgos.filter((h) => h.estado === 'vigente')
const cng = JSON.parse(readFileSync(path.join(CRUDO, 'ciclos/CNG-c1-revision.json'), 'utf8'))

const VERIF_PADRE = {
  'src/context/TransitionContext.tsx': 'el padre confirmó en git las dos ediciones posteriores a la fila de la tabla (0c9d22a7 del 2026-05-27 y bd198842 del 2026-05-30).',
  'prisma/schema.prisma': 'corrección del padre: entre el commit de la cláusula (629fe016) y la base entraron 12 commits al schema (git log 629fe016..57c421bc), no 9.',
  'src/auth.ts': 'el padre confirmó en rediseno/home@bead847c que carga-diferida/contrato.ts:236-243 guarda el sha256 de auth.ts, schema.prisma y prisma.ts junto a los tres archivos del layout.',
  'src/components/ui/*': 'el padre confirmó 17 commits sobre src/components/ui desde el 2026-06-13 (git log --since).',
}

const ui = (r) => r.startsWith('src/components/ui/')
const citan = (ruta) => reg.filter((h) => (h.evidencia ?? []).some((e) => (ruta.endsWith('/*') ? ui(String(e.ruta)) : e.ruta === ruta)) || (!ruta.endsWith('/*') && (h.bloque_md ?? '').includes(ruta)))
const defectosDe = (ruta) => cng.hallazgos.filter((h) => h.id_asignado && h.evidencia.some((e) => (ruta.endsWith('/*') ? ui(e.ruta) : e.ruta === ruta))).map((h) => h.id_asignado)
const zonaDe = (ruta) => (ruta === 'src/auth.ts' || ruta === 'prisma/schema.prisma' ? 'congelado + ZONA-FRANCO (modelos OsLead* y enum ActivityChannel en el schema; auth.ts es de Franco)' : 'congelado')
const dom = (o) => Object.entries(o ?? {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || 'sin importadores TS (lo leen el cliente generado y dos invariantes)'

const filas = []
const fichas = []
let n = 0
const analisis = new Map(res.grupos.flatMap((g) => g.resultado.items.map((it) => [it.ruta, { ...it, grupo: g.id }])))
for (const d of datos.items) {
  const a = analisis.get(d.ruta)
  if (!a) { console.error('sin análisis para', d.ruta); process.exit(1) }
  n++
  const id = `CNG-${String(n).padStart(3, '0')}`
  const c = citan(d.ruta)
  const sev = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'].map((s) => c.filter((h) => h.severidad === s).length)
  const nuevos = defectosDe(d.ruta)
  const ids = c.map((h) => h.id)
  const rd = Array.isArray(d.rediseno_home) ? (d.rediseno_home.length ? `${d.rediseno_home.length} archivos cambiados` : 'sin cambios') : d.rediseno_home
  const nodo = nodoDeRuta(d.ruta.replace('/*', '/Button.tsx'))
  filas.push(`| ${id} | \`${d.ruta}\` | ${d.grupo.replace(' (inferido)', '')} | ${a.razon_vigente} | ${a.riesgo_soltar} | ${c.length} (${sev.join('/')}) | **${a.recomendacion}** | ${a.nivel_propuesto} |`)
  fichas.push([
    `### [${id}] ${d.ruta}`,
    `- Grupo: ${d.grupo}${d.archivos ? ` · ${d.archivos} archivos` : ''} · ${d.lineas} líneas · ${d.commits} commits (${d.ultimos_90_dias} en los últimos 90 días) · ${d.dependientes} importadores (${dom(d.por_dominio)}) · rediseno/home@bead847c: ${rd}`,
    `- Origen: ${a.origen}`,
    `- ¿La razón sigue vigente?: **${a.razon_vigente}** — ${a.razon_vigente_detalle}`,
    `- Qué bloquea mantenerlo congelado: ${a.bloquea}`,
    `- Riesgo de soltarlo: **${a.riesgo_soltar}** — ${a.riesgo_detalle}`,
    `- Recomendación: **${a.recomendacion}** — ${a.razon_recomendacion}`,
    `- Nivel propuesto: **${a.nivel_propuesto}**${a.gate_propuesto ? `. Gate: ${a.gate_propuesto}` : ''}`,
    `- Hallazgos del registro que lo citan hoy: ${c.length} (C/A/M/B ${sev.join('/')})${ids.length ? `: ${ids.slice(0, 16).map((x) => `[${x}]`).join(', ')}${ids.length > 16 ? ` y ${ids.length - 16} más` : ''}` : ''}${nuevos.length ? ` · defectos nuevos de este análisis: ${nuevos.map((x) => `[${x}]`).join(', ')}` : ''}`,
    ...(VERIF_PADRE[d.ruta] ? [`- Verificación del padre: ${VERIF_PADRE[d.ruta]}`] : []),
    `- Zona: ${zonaDe(d.ruta)}`,
    `- Nodo(s): ${nodo}`,
    '',
  ].join('\n'))
}

const cuenta = (k) => [...analisis.values()].filter((a) => a.recomendacion === k).length
const nivel = (k) => [...analisis.values()].filter((a) => a.nivel_propuesto === k).map((a) => `\`${a.ruta}\``).join(', ')
const frozenZona = reg.filter((h) => /FROZEN|congelado/i.test(h.zona ?? '')).length

const md = `# 11 — Congelados: de respetarlos a evaluarlos

> E5 de la ENMIENDA-01 y DEC-38. La lista de congelados sigue siendo **solo una restricción de escritura de esta corrida**: nada de esto se aplica, todo es propuesta para Valentino (y para Franco en su zona). Base: \`origin/main\` @ \`${datos.base}\`. Home v3: ${datos.rediseno}; esa rama se mueve y lo que dice de ella puede cambiar hasta el merge.
>
> Fuentes: los datos medidos por \`scripts/auditoria/congelados-datos.mjs\` (\`_crudo/congelados-datos.json\`: historia en git, importadores por dominio según depcruise, cambios en rediseno/home) y el análisis de dos agentes de solo lectura (run \`wf_45e9532e-51b\`, \`_crudo/congelados-resultado.json\`). El padre verificó en git las afirmaciones que sostienen las recomendaciones más fuertes (ver cada ficha). Los 11 defectos nuevos que encontraron los analistas están en el registro como [UX-058], [DEU-107], [SEC-109], [BUG-189], [DEU-108], [PERF-022], [DEU-109], [A11Y-040], [DEU-110], [BUG-190] y [DEU-111] (todos BAJA).

## Resumen

${datos.items.length} entradas: los 7 explícitos del PROMPT (\`dashboard-actions.ts\` incluido), \`src/components/ui/*\` como grupo y los 14 inferidos de DEC-10. Recomendaciones: descongelar ${cuenta('descongelar')} · reemplazar ${cuenta('reemplazar')} · después del merge de rediseno/home ${cuenta('después del merge de rediseno/home')} · mantener ${cuenta('mantener')} · borrar ${cuenta('borrar')}. Ninguno queda «congelado» en la política propuesta.

| ID | Archivo | Origen de la etiqueta | ¿Razón vigente? | Riesgo de soltarlo | Hallazgos que lo citan (C/A/M/B) | Recomendación | Nivel |
|---|---|---|---|---|---|---|---|
${filas.join('\n')}

## Lo que dice lo medido

1. **«Congelado» nunca fue una sola regla.** Solo \`HeroArtifact.tsx\` tiene una prohibición de edición con razón escrita (\`AGENTS.md:76\`). Las otras filas de la tabla de \`raíz:CLAUDE.md:163-170\` son reglas de **uso**: usar \`triggerTransition\`, no romper el flujo de fases, no hacer \`migrate reset\`. La cláusula del 2026-06-29 (\`629fe016\`, \`raíz:CLAUDE.md:133\`) las volvió prohibiciones de edición. \`auth.ts\`, \`prisma.ts\` y \`ui/*\` vienen de reglas para coordinar lanes paralelos en junio. \`dashboard-actions.ts\` no tiene origen registrado. Los 14 inferidos los congeló esta misma auditoría (DEC-10, un criterio de alcance).
2. **En la práctica ya funcionaba como «cambio deliberado».** Después de recibir la etiqueta se editaron TransitionContext (2 veces), PreloaderContext (2), \`auth.ts\` (2), el schema (12 commits después de la cláusula), \`ui/*\` (17 commits desde el 13-06) y 6 de los 14 inferidos, siempre con cambios aditivos o marcados. De hecho solo se respetaron los que nadie necesitaba tocar.
3. **El costo es concreto.** Hoy ${frozenZona} hallazgos del registro tienen zona congelada y su arreglo quedó como «decisión para Valentino». Entre ellos están los defectos de seguridad más claros de estos archivos: [SEC-006] y [SEC-092] (fuga de \`toErrorMessage\`), [SEC-030] (auditoría que se pierde en silencio), [SEC-054] y [BUG-136], la mayoría de esfuerzo S. El congelamiento además empujó arreglos a envoltorios que duplican lógica: \`route.ts\` para [SEC-005] y [SEC-007], y \`auth.config.ts\` para [SEC-010]. También generó copias y rodeos: la geometría copiada en \`BrandedLogoWhite.tsx\`, el rig de luz de \`HeroCanvas.tsx\`, \`EmptyStateMuted\` ([DEU-107]) y los ids impuestos por TransitionContext ([DEU-108]). Y hizo que la poda propusiera borrar el gemelo correcto de \`dashboard-actions\` (POD-078).
4. **No hay ningún mecanismo.** En main no hay CODEOWNERS, ni hook, ni test en CI que cubra \`auth.ts\`, los dos contextos, \`dashboard-actions\`, \`ui/*\` ni 12 de los 14 inferidos (solo \`dates-ar\` y, en forma indirecta, \`tz-ar\` tienen invariantes en \`check:invariants\`). El único congelamiento mecanizado está en rediseno/home (sha256 en \`carga-diferida/contrato.ts:236-243\`, fuera de \`check:invariants\`). Esa huella mezcla \`auth.ts\`, \`schema.prisma\` y \`prisma.ts\` con los archivos del layout ([DEU-109]).
5. **La cantidad de importadores no predice el riesgo.** \`hover.ts\` tiene 41 y falla a la vista. \`tz-ar.ts\` tiene 12 y falla en silencio (rangos de fechas y la clave de idempotencia del reporte semanal). Lo que separa a los archivos es si la falla es silenciosa o visible, y si hay un gate automático.
6. **La granularidad tiene que ser por archivo, no por directorio.** \`ui/*\` mezcla 22 primitivas del kit (con 344 dependientes, 53 en la zona de Franco) con 13 componentes del intro y del home clásico y con huérfanos (HeroTitle, ErrorState, HyperText). Además, las 22 primitivas usan 343 clases de color literales contra 12 usos de tokens, así que F3 no puede re-tematizar el kit de forma limpia sin tocarlo (\`04-DISENO.md\`).
7. **Dos premisas de la ENMIENDA se matizan.** El QA visual de /dashboard ya no falla por PreloaderContext (está resuelto desde el 2026-05-24, \`PreloaderContext.tsx:75-81\`). Y TransitionContext no muere con el home viejo: el layout de rediseno/home sigue montando Navbar, Dock y Shutter en las landings. Lo que sí muere con el merge es \`HeroArtifact.tsx\`, y el flujo de fases de PreloaderContext queda vestigial.

## Propuesta de política: protegido y libre, con gate por archivo

Reemplaza «congelado» por dos niveles y una salida. Cada archivo protegido nombra **qué propiedad protege** y **qué gate** la verifica.

- **Protegido** — falla silenciosa con alcance amplio, o autorización, auditoría, datos o navegación de todas las rutas. Se cambia en un sprint que lo declare, con su gate en verde y la revisión nombrada en su ficha. Hoy serían: ${nivel('protegido')}.
- **Libre** — la falla se ve o el alcance es chico. Alcanzan las reglas comunes: \`tsc --noEmit\`, \`check:invariants\` y la verificación de UI que \`raíz:CLAUDE.md:158\` ya exige cuando se tocan pantallas. Hoy serían: ${nivel('libre')}, más los componentes del intro y del home clásico dentro de \`ui/*\`.
- **Borrar** — ${nivel('borrar')} (con el merge de rediseno/home), y los huérfanos de \`ui/*\` (POD-045, POD-381, POD-382).

Reglas que salen de lo medido:

1. **Un gate que no corre en CI no es un gate.** Cada protegido lleva un invariante \`tsx\` sin base, registrado como \`check:invariant:*\`; el runner exige declararlo, porque \`INVARIANTES_ESPERADOS\` está en \`scripts/run-invariants.mjs:81\`. Para \`auth.ts\`, \`auth-guards.ts\`, \`action-utils.ts\`, \`audit-log.ts\` y TransitionContext, el primer paso del gate es **escribir ese test**, que hoy no existe. Las suites con base cuentan solo cuando exista la base de test ([DEU-017], [BUG-171]).
2. **Las reglas de uso se quedan como reglas de uso** en \`CLAUDE.md\`, separadas de la protección de edición: navegar con \`triggerTransition\` en el sitio público, no romper el flujo de fases, nunca \`migrate reset\`. La propuesta de \`CLAUDE.md\` va en \`13-CLAUDE-MD-PROPUESTO.md\` (F6).
3. **Segundo revisor:** Franco revisa como segundo cuando el archivo tiene importadores en ZONA-FRANCO o toca \`OsLead*\` en el schema. Hoy eso alcanza a \`auth.ts\`, \`schema.prisma\`, \`ui/*\` (53 importadores en D4), \`auth-guards\` (12), \`utils\` (17), \`action-utils\` (9) y \`dates-ar\`.
4. **Huella por propiedad.** La huella sha256 de rediseno/home tiene que quedar solo en los archivos cuyo comportamiento depende del layout del home. \`auth.ts\`, \`schema.prisma\` y \`prisma.ts\` salen de \`CONGELADOS_DEL_LAYOUT\` antes del merge ([DEU-109]); si no, cada arreglo de seguridad o migración pone en rojo un test de peso del home.
5. **Mecanismo, no prosa.** Un hook \`PreToolUse\` de Claude Code avisa o bloquea Edit/Write sobre un archivo protegido cuando el sprint no lo declaró, y un \`CODEOWNERS\` pone a Franco en su zona. El diseño concreto va en \`13-CLAUDE-MD-PROPUESTO.md\`.
6. **Revisión después del merge** de rediseno/home: \`utils.ts\` (la rama lo modifica y suma 59 importadores de /v3), \`hover.ts\` y \`use-reduced-motion.ts\` pasan a tener consumidores en el sitio público y se reclasifican. PreloaderContext se reduce a un provider mínimo y \`HeroArtifact.tsx\` se borra con su cadena.

## Fichas

${fichas.join('\n')}`
writeFileSync(path.join(DIR, '11-CONGELADOS.md'), md, 'utf8')
console.log(`11-CONGELADOS.md: ${datos.items.length} fichas (CNG-001..CNG-${String(n).padStart(3, '0')}) · zona congelada en el registro: ${frozenZona}`)
