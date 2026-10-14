#!/usr/bin/env node
// Auditoría de renovación 2026-10 — arma los argumentos de un ciclo de F2 para un dominio.
//
// Junta, por lote de _crudo/lotes.json: sus archivos, los hallazgos previos que citan
// esos archivos (_crudo/previas.json), los ítems de lo planeado que le tocan
// (_crudo/planeado-extraido/, partido en piezas < 300 KB, con su PLAN-NNN de 12-PLANEADO.md), las alertas del
// dominio que dejaron los extractores (_crudo/alertas-planeado.json, en `contexto`) y el
// registro de cambios de Valentino que corresponde (DEC-35, solo D2/D3/D5). Escribe un
// JSON que el constructor del workflow embebe en el script. Solo lectura sobre el repo.
//
// Reparto de lo planeado: cada ítem va a UN solo lote del dominio. Candidatos: los lotes
// con archivos de su herramienta (h1…h6) más los lotes del dominio que son mayoría de
// libs; los ítems de plataforma/transversal/otro se rutean a D6, D7, D8 o D9 por palabras
// clave (el primero que coincide); los ZONA-FRANCO, a D4. Gana el lote con más referencias
// del ítem que coinciden con sus archivos; sin coincidencias, el de menor carga. Por lote se pasan hasta TOPE ítems
// (primero los que citan archivos del lote, después pendiente/bloque/promesa/idea,
// decisión y hecho declarado); los que quedan afuera se listan en `planeado_omitidos` y
// van primero en el ciclo siguiente. Lo del sitio público queda para F3.
//
// Modo cazadores (ciclos 2 y 3, DEC-26): con --cazadores --lente "<texto>" los lotes del
// dominio se funden en tramos de <= 16k LOC y cada tramo lleva, en vez de previas, los
// títulos ya registrados del dominio (vigentes y descartados), lo planeado que sigue sin
// cruce y las alertas sin resolver. Las alertas llevan id [Dx-An] para seguirlas entre ciclos.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/f2-args.mjs <D1..D9> <ciclo> <salida.json> [--lotes D2-L1,D2-L3] [--tope 80]
//   node scripts/auditoria/f2-args.mjs <D1..D9> <ciclo> <salida.json> --cazadores --lente "<texto>"

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { nodoDeRuta } from './atlas/nodos.mjs'
import { leerPartido } from './crudo-partes.mjs'

const [, , DOM, CICLO, SALIDA] = process.argv
const args = process.argv.slice(2)
const soloLotes = args.includes('--lotes') ? args[args.indexOf('--lotes') + 1].split(',') : null
const TOPE = args.includes('--tope') ? Number(args[args.indexOf('--tope') + 1]) : 80
const CAZA = args.includes('--cazadores')
const LENTE = args.includes('--lente') ? args[args.indexOf('--lente') + 1] : ''
const appRoot = process.cwd()
const CRUDO = path.resolve(appRoot, 'docs/auditoria-2026-10/_crudo')
const MD_PLAN = path.resolve(appRoot, 'docs/auditoria-2026-10/12-PLANEADO.md')
const INS = 'C:\\auditoria-2026-10\\logic-core-v3\\docs\\_insumos\\drive'
const leer = (f, d) => (existsSync(path.join(CRUDO, f)) ? JSON.parse(readFileSync(path.join(CRUDO, f), 'utf8').replace(/^\uFEFF/, '')) : d)
const lotesDeTodos = leer('lotes.json', { lotes: [] }).lotes
const todosLotes = lotesDeTodos.filter((l) => l.dominio === DOM)
const lotes = todosLotes.filter((l) => !soloLotes || soloLotes.includes(l.id))
const previas = leer('previas.json', { items: [] }).items
const planeado = leerPartido(CRUDO, 'planeado-extraido', { items: [] }).items
const alertas = (leer('alertas-planeado.json', { dominios: {} }).dominios[DOM] ?? []).map((a, i) => `[${DOM}-A${i + 1}] ${a}`)
const cruces = leer('planeado-cruces.json', {})
// patrones defectuosos que dejaron los dominios anteriores (DEC-20): cada lector los busca en su lote
const patronesPrevios = (() => {
  const vistos = new Set()
  return leer('patrones.json', { items: [] }).items
    .filter((p) => !String(p.ciclo).startsWith(`${DOM}-`))
    .filter((p) => { const k = String(p.patron).toLowerCase().slice(0, 80); if (vistos.has(k)) return false; vistos.add(k); return true })
    .slice(0, 30)
    .map((p) => `[${p.ciclo}] ${p.patron} (visto en: ${String(p.donde_aparecio).slice(0, 160)})`)
})()
// D6: las sentencias DML que drift.mjs no reconoce y hay que leer a mano (DEC-08)
const dml = DOM === 'D6' ? (leer('drift.json', { sentencias_no_reconocidas: [] }).sentencias_no_reconocidas ?? []).map((s) => s.donde) : []
const textoDml = dml.length ? `\nDRIFT (scripts/auditoria/drift.mjs sobre origin/main): 0 diferencias entre schema.prisma y las 86 migraciones (63 tablas, 62 enums, 136 indices, 80 FKs). Estas ${dml.length} sentencias DML no se pueden reproducir por script: leelas a mano y reporta si alguna pierde, mezcla o corrompe datos entre tenants:\n- ${dml.join('\n- ')}` : ''
const textoPatrones = patronesPrevios.length ? `\nPATRONES DEFECTUOSOS QUE YA APARECIERON EN OTROS DOMINIOS (buscalos en tu lote; cada aparicion es un hallazgo con su propia evidencia, o se suma al hallazgo del mismo patron si es la misma causa raiz):\n- ${patronesPrevios.join('\n- ')}` : ''

// clave «fuente:línea[#sub]» → PLAN-NNN
const idPlan = new Map()
if (existsSync(MD_PLAN)) for (const m of readFileSync(MD_PLAN, 'utf8').matchAll(/^#### \[(PLAN-\d+)\] .*?\n- Fuente: `([^`]+)`/gm)) idPlan.set(m[2], m[1])
const claveDe = (p) => `${p.fuente}:${p.linea}${p.sub ? `#${p.sub}` : ''}`

const FOCO = {
  D1: 'Auth de cliente y de admin. Magic link (provider Resend que envia por Brevo), Google y Credentials (bcrypt); sesion JWT y su invalidacion (User.sessionVersion), expiracion, cookies (auth-cookies), roles y su ruteo en src/proxy.ts y en los layouts; rutas protegidas sin guard; impersonacion (cookies, expiracion, que puede hacer); recupero y cambio obligatorio de contrasena (tokens, expiracion, reutilizacion, enumeracion de usuarios); invitaciones (accept-invite, posible flujo huerfano); api/qa/login (que no quede expuesto en prod: revisar sus guards de entorno); rate limit de login (headers que se pueden falsear); que pasa con los roles CLIENT y SETTER fuera de su portal. Leer tambien las libs compartidas que todos importan (src/lib/actions/schemas.ts, src/lib/audit-log.ts) aunque sean de D3. Las advisories criticas de npm audit sobre next (bypass de proxy/middleware) y Auth.js (getToken, normalizador de email): evaluar si el codigo depende del comportamiento afectado (la version la evalua D8).',
  D2: 'Portal del cliente multi-tenant: aislamiento por tenant en CADA lectura y escritura (la org sale de resolveOrgId/sesion, nunca de params/body/searchParams), IDOR por ids cuid en URLs, onboarding (bienvenida), y los nueve criterios L3 por funcionalidad. Hipotesis de Valentino a medir: el portal esta muy desarrollado y le faltan sobre todo modulos.',
  D3: 'Panel de admin: cada seccion (operacion/dashboard, clientes, proyectos, leads, equipo, mensajes, tickets, novedades, referidos, alertas, configuracion, audit log): que hace, que falta, permisos (todo exige SUPER_ADMIN en server actions y handlers, no solo en el layout), acciones destructivas con confirmacion, y criterios L3. Hipotesis de Valentino a medir: el admin esta muy desarrollado y le faltan sobre todo modulos.',
  D4: 'Setter y LeadOS (ZONA-FRANCO, solo lectura): flujo completo, maquina de estados del lead y del dossier, integracion con admin/leads y con los crons (os-follow-up), consistencia de datos y aislamiento entre setters. Todo hallazgo lleva Zona ZONA-FRANCO y va a 09-PARA-FRANCO.',
  D5: 'Chatbot centralizado e IA: proveedores (factory con google implementado y anthropic/openai como stubs; Anthropic directo en lib/ai), streaming contra el limite de functions de Netlify (maxDuration 30 en la ruta de chat), aislamiento del conocimiento por tenant (forOrg/unsafeGlobalQuery), prompt injection y tools, rate limiting y cuota, costo por conversacion (constantes de pricing), persistencia de turnos, fallbacks ante error del proveedor, version de modelo; la credencial de Vertex VENCIDA (como se entera el sistema, que ve el visitante, que ve el cliente). El bot de WhatsApp (src/modules/motor, /api/motor/webhook) es el producto que se vende a negocios: auditarlo como tal (BotZ es otro repo, fuera).',
  D6: 'Datos: modelos, relaciones y cascadas peligrosas (onDelete Cascade sobre datos de clientes), indices faltantes para las consultas reales, N+1, soft-deletes, migraciones (el drift schema-migraciones lo mide scripts/auditoria/drift.mjs: 0 diferencias en F0; leer las 14 sentencias DML a mano), cold start de Neon, frontera de aislamiento (src/lib/isolation: registry, scoped-model, unsafeGlobalQuery y sus razones), y los seeds/scripts que escriben en la base (guard de entorno, destino prod, credenciales literales, borrados sin scoping).',
  D7: 'Integraciones: Brevo y restos de Resend, Sentry (captura y flush en catch de handlers/serverless), Search Console/GA4, Google Business Profile y Tiendanube (OAuth: state, tokens guardados, refresh), cal.com, Telegram, n8n (incluido el webhook del footer que manda desde el navegador), crons (tres registradores: netlify.toml, vercel.json, GitHub Actions; dos rutas cron sin disparador; CRON_SECRET), webhooks. Armar la tabla de credenciales externas de la ENMIENDA E10: donde se lee cada una, que se cae si vence, si el sistema se entera, como se renueva; Vertex vencida es el control positivo.',
  D8: 'Plataforma: Next 16 (convenciones actuales, APIs deprecadas, proxy), React 19, Tailwind 4, NextAuth v5 beta, Prisma 6 (7 ya salio), dependencias viejas o abandonadas (ver npm outdated/audit en _crudo), maxDuration efectivo en Netlify (plan y tipo de function), bundle (fronteras use client, imports pesados en rutas internas), configuraciones (next.config headers/CSP, tsconfig, eslint, netlify.toml), CI.',
  D9: 'Transversal: componentes ui compartidos (FROZEN) y su uso en pantallas internas (a11y, estados), utilidades compartidas, contextos que envuelven todas las rutas, scripts que escriben en la base (guards, destino, credenciales), any, router.push, framer-motion directo, logs con PII, duplicacion.',
}
const INSUMOS = {
  D2: `${INS}\\Olme\\Cliente - Registro de cambios\\ (el archivo de la seccion que toca tu lote) y ${INS}\\Olme\\registro-cambios-2026-07-13-panel-PD1-PA-CO5.md`,
  D3: `${INS}\\Olme\\Admin - Registro de cambios\\ (incluida Operaciones\\; el archivo de la seccion que toca tu lote)`,
  D5: `${INS}\\Olme\\Chatbot_ registro de cambios.md, ${INS}\\Olme\\Admin - Registro de cambios\\Operaciones\\Chatbot_ registro de cambios.md y ${INS}\\Olme\\Cliente - Registro de cambios\\Chatbot_ registro de cambios.md`,
}
// Ruteo de lo que no es de una herramienta (infra, transversal, otro): el primero que coincide
const RUTEO = [
  ['D6', /prisma|migraci|schema|seed|isolation|forOrg|unsafeGlobal|neon|[ií]ndice|drift|backfill|cascade|columna|tabla/i],
  ['D7', /cron|brevo|resend|sentry|search ?console|ga4|google business|gbp|tiendanube|cal\.com|telegram|n8n|webhook|oauth|email|newsletter/i],
  ['D8', /next|react|tailwind|build|\bci\b|netlify|vercel|eslint|tsconfig|dependenc|npm|package\.json|heap|turbopack|webpack|playwright|vitest|invariant|test/i],
]
const dominioLib = (p) => {
  if (p.herramienta === 'sitio-publico') return null
  const txt = `${p.titulo} ${p.descripcion} ${(p.refs ?? []).join(' ')}`
  for (const [d, re] of RUTEO) if (re.test(txt)) return d
  return p.herramienta === 'infra' ? 'D8' : 'D9'
}
const HERR = (n) => n.split('.').slice(0, 2).join('.')
// Dueño de cada herramienta: el dominio con más archivos de ella en los lotes; si no tiene
// archivos en ningún lote, el dominio de su área. Un ítem de herramienta se cruza solo en su dueño.
const AREA_DOM = { h1: 'D1', h2: 'D2', h3: 'D5', h4: 'D3', h5: 'D4', h6: 'D7' }
const porHerr = new Map()
for (const l of lotesDeTodos) for (const f of l.archivos) {
  const h = HERR(nodoDeRuta(f))
  if (!/^h\d\./.test(h)) continue
  const m = porHerr.get(h) ?? new Map()
  m.set(l.dominio, (m.get(l.dominio) ?? 0) + 1)
  porHerr.set(h, m)
}
const duenoDe = (id) => {
  const h = [...porHerr.keys()].find((k) => k.endsWith(`.${id}`))
  if (!h) return null
  return [...porHerr.get(h).entries()].sort((a, b) => b[1] - a[1])[0][0]
}
const base = (r) => path.basename(String(r).replace(/:\d+(-\d+)?$/, '').replace(/^tambien en /, '')).toLowerCase()
const ORDEN_TIPO = { pendiente: 0, bloque: 1, promesa: 2, idea: 3, decision: 4, 'hecho-declarado': 5 }

// datos por lote (todos los del dominio, para que el reparto no dependa de --lotes)
const info = todosLotes.map((l) => {
  const archivos = l.archivos.map((f) => f.replace(/^logic-core-v3\//, ''))
  const herr = new Map()
  for (const f of l.archivos) { const h = HERR(nodoDeRuta(f)); herr.set(h, (herr.get(h) ?? 0) + 1) }
  const libs = [...herr.entries()].filter(([h]) => !/^h\d\./.test(h)).reduce((a, [, n]) => a + n, 0)
  return { l, archivos, set: new Set(archivos), bases: new Set(archivos.map((f) => path.basename(f).toLowerCase())), herr, deLibs: libs / l.archivos.length >= 0.5 }
})
const asignados = new Map(info.map((x) => [x.l.id, []]))
for (const p of planeado) {
  if (cruces[claveDe(p)]?.estado) continue // ya cruzado en un ciclo anterior
  const esHerr = !['infra', 'transversal', 'otro', 'sitio-publico'].includes(p.herramienta)
  let candidatos
  if (DOM === 'D4') candidatos = p.zona_franco ? info : []
  else if (p.zona_franco) candidatos = []
  // la herramienta vive en sus pantallas y en las libs del dominio que la implementan (lotes de mayoría lib.*)
  else if (esHerr) {
    const dueno = duenoDe(p.herramienta)
    if (dueno !== DOM) candidatos = []
    else { const conHerr = info.filter((x) => [...x.herr.keys()].some((h) => h.endsWith(`.${p.herramienta}`))); candidatos = [...new Set([...conHerr, ...info.filter((x) => x.deLibs)])] }
  }
  else candidatos = dominioLib(p) === DOM ? info : []
  if (!candidatos.length) continue
  const puntaje = (x) => (p.refs ?? []).filter((r) => x.bases.has(base(r))).length
  const deHerr = (x) => [...x.herr.entries()].filter(([h]) => h.endsWith(`.${p.herramienta}`)).reduce((a, [, n]) => a + n, 0)
  const carga = (x) => asignados.get(x.l.id).length
  // con referencias que coinciden gana el que más cita; sin coincidencias se reparte por carga
  const max = Math.max(...candidatos.map(puntaje))
  const elegido = max > 0
    ? candidatos.filter((x) => puntaje(x) === max).sort((a, b) => deHerr(b) - deHerr(a))[0]
    : candidatos.slice().sort((a, b) => carga(a) - carga(b) || deHerr(b) - deHerr(a))[0]
  asignados.get(elegido.l.id).push({ p, cita: puntaje(elegido) > 0 })
}

const NOMBRE = { D1: 'Auth cliente + admin', D2: 'Portal del cliente', D3: 'Admin', D4: 'Setter (ZONA-FRANCO)', D5: 'Chatbot e IA', D6: 'Datos', D7: 'Integraciones', D8: 'Plataforma', D9: 'Transversal' }[DOM]
const forma = ({ p }) => ({ id: idPlan.get(claveDe(p)) ?? null, clave: claveDe(p), tipo: p.tipo, titulo: p.titulo, descripcion: p.descripcion, estado_declarado: p.estado_declarado, refs: (p.refs ?? []).slice(0, 6), zona_franco: !!p.zona_franco })

if (CAZA) {
  // tramos de <= 16k LOC en orden de lote
  const tramos = []
  for (const x of info) {
    let t = tramos[tramos.length - 1]
    if (!t || t.loc + x.l.loc > 16000) { t = { id: `${DOM}-T${tramos.length + 1}`, archivos: [], loc: 0, lotes: [], plan: [] }; tramos.push(t) }
    t.archivos.push(...x.archivos); t.loc += x.l.loc; t.lotes.push(x.l.id); t.plan.push(...asignados.get(x.l.id))
  }
  // títulos de TODOS los dominios: un cazador no repite lo que otro dominio ya registró (o lo que se fusionó en él)
  const reg = leer('hallazgos.json', { hallazgos: [] }).hallazgos.filter((h) => h.estado !== 'descartado').sort((x, y) => Number(y.dominio === DOM) - Number(x.dominio === DOM))
  const desc = leer('descartados.json', { items: [] }).items.filter((d) => String(d.ciclo).startsWith(`${DOM}-`))
  const titulos = [...reg.map((h) => `${h.id}${h.dominio === DOM ? '' : ` (${h.dominio})`} ${String(h.titulo).slice(0, 150)}`), ...desc.map((d) => `(descartado) ${d.titulo} — ${d.motivo_padre}`)]
  const resueltas = new Set(leer('alertas-estado.json', { items: [] }).items.filter((a) => ['confirmada', 'descartada', 'parcial'].includes(a.resultado)).map((a) => (String(a.alerta).match(/\[(D\d-A\d+)\]/) ?? [])[1]).filter(Boolean))
  const pendientes = alertas.filter((a) => !resueltas.has((a.match(/\[(D\d-A\d+)\]/) ?? [])[1]))
  const salida = {
    dominio: DOM, nombre: NOMBRE, ciclo: CICLO, lente: LENTE, foco: FOCO[DOM], contexto: '',
    lotes: tramos.map((t) => ({ id: t.id, loc: t.loc, lotes_origen: t.lotes, archivos: t.archivos, titulos_existentes: titulos, planeado: t.plan.slice(0, TOPE).map(forma), planeado_omitidos: t.plan.slice(TOPE).map(({ p }) => idPlan.get(claveDe(p)) ?? claveDe(p)), alertas_pendientes: pendientes })),
  }
  writeFileSync(SALIDA, JSON.stringify(salida, null, 1), 'utf8')
  for (const l of salida.lotes) console.log(`${l.id} (${l.lotes_origen.join(', ')}): ${l.archivos.length} archivos · ${l.loc} LOC · ${titulos.length} títulos · ${l.planeado.length} PLAN sin cruce${l.planeado_omitidos.length ? ` (+${l.planeado_omitidos.length})` : ''} · ${pendientes.length} alertas pendientes`)
  process.exit(0)
}

const salida = {
  dominio: DOM,
  nombre: NOMBRE,
  ciclo: CICLO,
  lente: LENTE,
  foco: FOCO[DOM],
  contexto: `${alertas.length ? `ALERTAS DE LOS DOCS PARA ESTE DOMINIO (afirmaciones o contradicciones de documentos, NO evidencia: confirmar o descartar cada una contra el codigo y reportarlo en alertas_verificadas, empezando el campo 'alerta' con su id entre corchetes; si se confirma, tambien va como hallazgo):\n- ${alertas.join('\n- ')}` : ''}${textoDml}${textoPatrones}`,
  lotes: info.filter((x) => lotes.includes(x.l)).map((x) => {
    const prev = previas.filter((p) => (p.archivos_citados ?? []).some((c) => x.set.has(c.replace(/:\d+(-\d+)?$/, '').replace(/^logic-core-v3\//, ''))))
    const plan = asignados.get(x.l.id).sort((a, b) => Number(b.cita) - Number(a.cita) || (ORDEN_TIPO[a.p.tipo] ?? 9) - (ORDEN_TIPO[b.p.tipo] ?? 9))
    return {
      id: x.l.id,
      loc: x.l.loc,
      archivos: x.archivos,
      previas: prev.slice(0, 40),
      previas_omitidas: Math.max(0, prev.length - 40),
      planeado: plan.slice(0, TOPE).map(forma),
      planeado_omitidos: plan.slice(TOPE).map(({ p }) => idPlan.get(claveDe(p)) ?? claveDe(p)),
      insumos: INSUMOS[DOM] ?? null,
    }
  }),
}
writeFileSync(SALIDA, JSON.stringify(salida, null, 1), 'utf8')
for (const l of salida.lotes) console.log(`${l.id}: ${l.archivos.length} archivos · ${l.previas.length} previas${l.previas_omitidas ? ` (+${l.previas_omitidas} omitidas)` : ''} · ${l.planeado.length} planeado${l.planeado_omitidos.length ? ` (+${l.planeado_omitidos.length} omitidos → ciclo siguiente)` : ''}`)
console.log(`alertas en contexto: ${alertas.length}`)
