#!/usr/bin/env node
// Atlas — SEMILLA (un solo uso, F5 de la auditoría 2026-10): escribe por única vez los archivos de datos que después
// mantienen las personas. Si un archivo ya existe, NO lo pisa (salvo --forzar, que no se usa sobre atlas.curado.json).
//   funcionalidades.json  ← _crudo/funcionalidades (lo que emitieron los lectores de F2)
//   zonas.json            ← la lista de congelados y la zona de Franco de esta corrida (cobertura.mjs, DEC-10)
//   entradas.json         ← _crudo/entradas.json (auth, rol y tenant de cada entrada, con su evidencia)
//   atlas.curado.json     ← madurez de F2, veredicto y alcance_propuesto por regla (alcance = «sin-decidir»)
// Uso (desde logic-core-v3): node scripts/auditoria/atlas/semilla.mjs

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { leerPartido } from '../crudo-partes.mjs'
import { HERRAMIENTAS } from './nodos.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const CRUDO = path.join(DIR, '_crudo')
const ATLAS = path.join(DIR, '06-ATLAS')
mkdirSync(ATLAS, { recursive: true })
const FORZAR = process.argv.includes('--forzar')
const escribir = (f, o) => {
  const p = path.join(ATLAS, f)
  if (existsSync(p) && !(FORZAR && f !== 'atlas.curado.json')) { console.log(`${f}: ya existe, no se pisa`); return }
  writeFileSync(p, JSON.stringify(o, null, 1) + '\n', 'utf8'); console.log(`${f}: escrito`)
}

const funcs = leerPartido(CRUDO, 'funcionalidades', null, 'items').items
escribir('funcionalidades.json', { schemaVersion: 1, nota: 'Nodos funcionalidad del Atlas. Semilla: lectores de F2 (auditoría 2026-10). Se mantiene a mano: el generador los lee, no los escribe.', funcionalidades: funcs.map((f) => ({ id: f.id, nombre: f.nombre, descripcion: f.descripcion ?? '', padre: f.herramienta, archivos: f.archivos ?? [], entradas: f.entradas ?? [] })) })

const A = 'logic-core-v3/'
escribir('zonas.json', {
  schemaVersion: 1,
  nota: 'Restricción de escritura de la auditoría 2026-10 (PROMPT, DEC-10). 11-CONGELADOS.md propone reemplazarla por niveles «protegido» y «libre»: cuando se decida, se actualiza acá.',
  congelados: ['src/components/3d/HeroArtifact.tsx', 'src/context/TransitionContext.tsx', 'src/context/PreloaderContext.tsx', 'prisma/schema.prisma', 'src/auth.ts', 'src/lib/prisma.ts', 'src/actions/dashboard-actions.ts',
    ...['utils', 'action-utils', 'use-is-client', 'auth-guards', 'audit-log', 'logger', 'alerts', 'tz-ar', 'dates-ar', 'design-tokens', 'use-reduced-motion', 'hover', 'motion-variants', 'chromeReveal'].map((x) => `src/lib/${x}.ts`), 'src/components/ui/'].map((x) => A + x),
  franco: ['src/lib/leados/', 'src/app/\\(protected\\)/setter/', 'src/app/\\(protected\\)/admin/leados/', 'src/app/\\(protected\\)/admin/leads/_actions/', 'src/app/\\(protected\\)/admin/fg2-lab/', 'src/auth\\.ts$', 'src/lib/auth-cookies\\.ts$', 'src/app/api/qa/login/route\\.ts$'].map((x) => `^${A}${x}`),
})

const ent = leerPartido(CRUDO, 'entradas', { items: [] }, 'items').items ?? []
escribir('entradas.json', { schemaVersion: 1, nota: 'Auth, rol, tenant, validación y rate limit de cada entrada, con su evidencia (lectores de F2, base 57c421bc). Se re-verifica al cambiar la entrada.', entradas: ent.map(({ ciclo, lote, ...e }) => ({ ...e, origen: `${ciclo}/${lote}` })) })

// ── curado: madurez de F2, veredicto y alcance propuesto por regla ──
const poda = readFileSync(path.join(DIR, '10-PODA.md'), 'utf8')
const enPoda = new Set([...poda.matchAll(/`([^`]+\.(?:tsx?|jsx?|mjs))`/g)].map((m) => m[1]))
const ALCANCE = {
  '1.0': ['auth-login', 'auth-recupero', 'auth-cambio', 'auth-invite', 'auth-impersonacion', 'cli-bienvenida', 'cli-shell', 'cli-inicio', 'cli-proyecto', 'cli-resultados', 'cli-servicios', 'cli-mensajes', 'cli-soporte', 'cli-plan', 'cli-cuenta', 'cli-reportes-email', 'cli-chatbot', 'adm-chatbots', 'vis-widget-cliente', 'vis-api-chatbot', 'vis-widget-develop', 'adm-shell', 'adm-dashboard', 'adm-clientes', 'adm-proyectos', 'adm-tickets', 'adm-mensajes', 'adm-alertas', 'adm-config', 'set-dia', 'set-nuevo', 'set-importar', 'set-lead', 'set-manual', 'vis-contacto', 'vis-optout'],
  despues: ['cli-referidos', 'cli-resenas', 'cli-email-mkt', 'cli-tienda', 'cli-agenda', 'adm-actividad', 'adm-health', 'vis-whatsapp', 'adm-equipo', 'adm-leads', 'adm-novedades', 'adm-referidos', 'adm-audit', 'adm-revision-demos'],
  descartado: ['adm-fg2lab'],
}
const RAZON = {
  '1.0': 'camino del cliente o de la operación diaria que el primer cliente real necesita (acceso, portal, chatbot, admin básico, contacto y baja de emails); el setter entra porque la operación comercial ya corre sobre él',
  despues: 'módulo premium, panel mono-bot o herramienta interna que el primer cliente no necesita para arrancar',
  descartado: 'experimento (FG-2 Lab)',
}
const alcanceDe = (h) => Object.entries(ALCANCE).find(([, hs]) => hs.includes(h))?.[0] ?? 'despues'
const curado = {}
for (const [h, [a]] of Object.entries(HERRAMIENTAS)) {
  const al = alcanceDe(h)
  curado[`${a}.${h}`] = { veredicto: 'decidir', alcance: 'sin-decidir', alcance_propuesto: al, notas: `Propuesta de la auditoría 2026-10: ${RAZON[al]}. La madurez de la herramienta se calcula desde sus funcionalidades.`, decisiones: [] }
}
for (const f of funcs) {
  const h = f.herramienta.split('.')[1]
  const archivos = f.archivos ?? []
  const borrar = archivos.length > 0 && archivos.every((x) => enPoda.has(x))
  const veredicto = borrar ? 'borrar' : f.madurez === 'L3' || f.madurez === 'L4' ? 'mantener' : f.madurez === 'L1' || f.madurez === 'L2' ? 'mejorar' : 'decidir'
  let al = alcanceDe(h)
  let nota = RAZON[al]
  if (borrar) { al = 'descartado'; nota = 'todos sus archivos tienen ficha en 10-PODA.md' }
  else if (f.madurez === 'L0' && al === '1.0') { al = 'despues'; nota = 'L0: no existe todavía como funcionalidad usable' }
  curado[f.id] = { madurez: f.madurez ?? 'L?', madurez_evidencia: f.madurez_evidencia ?? '', criterios_l3_faltantes: Object.entries(f.criterios_l3 ?? {}).filter(([, v]) => v && !['si', 'n/a'].includes(v.cumple)).map(([k, v]) => `${k} (${v.cumple})`), veredicto, alcance: 'sin-decidir', alcance_propuesto: al, notas: `Propuesta de la auditoría 2026-10 (${f.ciclo ?? 'F2'}): ${nota}.`, decisiones: [] }
}
escribir('atlas.curado.json', { schemaVersion: 1, nota: 'CURADO: ningún generador lo pisa. «alcance» lo deciden Valentino y Franco; la auditoría solo llenó «alcance_propuesto» con su razón en «notas».', nodos: curado })
const c = Object.values(curado).reduce((a, x) => { a[x.alcance_propuesto] = (a[x.alcance_propuesto] ?? 0) + 1; return a }, {})
console.log('alcance propuesto:', JSON.stringify(c), '· funcionalidades', funcs.length)
