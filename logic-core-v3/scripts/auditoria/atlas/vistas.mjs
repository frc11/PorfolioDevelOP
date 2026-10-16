#!/usr/bin/env node
// Atlas — genera las vistas .md de 06-ATLAS/ desde los datos: rutas.md, datos.md, dependencias.md, ramas.md y
// modulos/<herramienta>.md (ENMIENDA-01 E7, regla 3). Portable: solo Node nativo; lee atlas.json, atlas.curado.json,
// entradas.json y, si existen, hallazgos.json y backlog.json. No lee el código.
// Uso: node scripts/auditoria/atlas/vistas.mjs [--atlas <carpeta 06-ATLAS>]

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const ATLAS = path.resolve(args.includes('--atlas') ? args[args.indexOf('--atlas') + 1] : path.join(process.cwd(), 'docs/auditoria-2026-10/06-ATLAS'))
const leer = (f, d) => (existsSync(path.join(ATLAS, f)) ? JSON.parse(readFileSync(path.join(ATLAS, f), 'utf8')) : d)
const atlas = leer('atlas.json', null)
if (!atlas) { console.error('falta atlas.json: correr antes generar.mjs'); process.exit(1) }
const curado = leer('atlas.curado.json', { nodos: {} }).nodos
const entradas = leer('entradas.json', { entradas: [] }).entradas
const hallazgos = leer('hallazgos.json', { hallazgos: [] }).hallazgos
const tarjetas = leer('backlog.json', { tarjetas: [] }).tarjetas ?? []
const N = new Map(atlas.nodos.map((n) => [n.id, n]))
const cab = (titulo, extra = '') => `# ${titulo}\n\n> GENERADO por \`scripts/auditoria/atlas/vistas.mjs\` desde \`atlas.json\` (${atlas.generado.ref} @ \`${atlas.generado.sha.slice(0, 8)}\`, ${atlas.generado.fecha}). No se edita a mano: se regenera (ver \`regenerar.md\`).${extra}\n`
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const corto = (s, n = 140) => { const t = esc(s); return t.length > n ? `${t.slice(0, n - 1)}…` : t }
const mid = (id) => id.replace(/[^A-Za-z0-9]/g, '_')
const ORDEN_MAD = ['L0', 'L1', 'L2', 'L3', 'L4', 'L?']

// ── rutas.md ─────────────────────────────────────────────────────────────────
const entradaDe = (archivo, url) => entradas.filter((e) => e.archivo === archivo && (!url || !e.url || e.url === url || e.url.startsWith(url)))
const tenant = (e) => (!e ? 'sin dato' : e.org_de === 'no-aplica' ? 'N.A.' : /sesion|session|resolveOrgId|forOrg|organizationId/i.test(`${e.org_de} ${e.evidencia_org}`) ? 'sí' : e.org_de)
const filaRuta = (tipo, url, archivo, extra = '') => {
  const e = entradaDe(archivo, url)[0]
  return `| \`${url}\` | \`${archivo}\` | ${tipo}${extra} | ${e ? esc(e.auth) : 'sin dato'} | ${e ? corto(e.rol, 60) : 'sin dato'} | ${tenant(e)} | ${e ? corto(e.evidencia_org || e.evidencia_auth, 160) : '—'} |`
}
const rutas = [
  cab('Rutas', ' Auth, rol y tenant salen de `entradas.json` (verificados por lectura en la auditoría 2026-10); «sin dato» = la entrada no tiene registro y hay que verificarla.'),
  `Control: ${atlas.control.paginas} páginas, ${atlas.control.handlers} route handlers y ${atlas.control.archivos_con_acciones} archivos con server actions.`, '',
  '## Páginas', '', '| Ruta | Archivo | Tipo | Auth | Rol | Tenant | Evidencia |', '|---|---|---|---|---|---|---|',
  ...atlas.entradas.paginas.sort((a, b) => a.url.localeCompare(b.url)).map((p) => filaRuta('page', p.url, p.archivo)), '',
  '## Route handlers', '', '| Ruta | Archivo | Tipo | Auth | Rol | Tenant | Evidencia |', '|---|---|---|---|---|---|---|',
  ...atlas.entradas.handlers.sort((a, b) => a.url.localeCompare(b.url)).map((h) => filaRuta('route', h.url, h.archivo, ` ${h.metodos.join(', ')}`)), '',
  '## Server actions', '', '| Archivo | Funciones | Nodo | Auth | Rol | Tenant | Evidencia |', '|---|---|---|---|---|---|---|',
  ...atlas.entradas.acciones.sort((a, b) => a.archivo.localeCompare(b.archivo)).map((x) => { const e = entradaDe(x.archivo)[0]; return `| \`${x.archivo}\` | ${corto(x.funciones.join(', '), 120)} | ${x.nodo ?? '—'} | ${e ? esc(e.auth) : 'sin dato'} | ${e ? corto(e.rol, 60) : 'sin dato'} | ${tenant(e)} | ${e ? corto(e.evidencia_org || e.evidencia_auth, 140) : '—'} |` }),
  '',
]
writeFileSync(path.join(ATLAS, 'rutas.md'), rutas.join('\n'), 'utf8')

// ── datos.md: ERD Mermaid + quién lee y escribe cada modelo ─────────────────
const modelos = atlas.nodos.filter((n) => n.tipo === 'modelo')
const usos = atlas.aristas.filter((a) => a.tipo === 'usa-modelo')
const erd = ['```mermaid', 'erDiagram', ...atlas.aristas.filter((a) => a.tipo === 'depende' && a.de.startsWith('modelo.')).map((a) => `  ${a.a.slice(7)} ||--o{ ${a.de.slice(7)} : "${a.campo}"`), '```']
const datos = [
  cab('Datos'), `${modelos.length} modelos (control: 63). ERD por las relaciones de clave foránea (lado «uno» → lado «muchos»); los modelos sin relación no aparecen en el diagrama.`, '', ...erd, '',
  '## Quién lee y escribe cada modelo', '', '| Modelo | Campos | organizationId | Zona | Lo leen | Lo escriben |', '|---|---|---|---|---|---|',
  ...modelos.map((m) => { const u = usos.filter((x) => x.a === m.id); return `| ${m.nombre} | ${m.campos} | ${m.organizationId ? 'sí' : 'no'} | ${m.zona} | ${u.filter((x) => x.lee).map((x) => x.de).join(', ') || '—'} | ${u.filter((x) => x.escribe).map((x) => x.de).join(', ') || '—'} |` }), '',
]
writeFileSync(path.join(ATLAS, 'datos.md'), datos.join('\n'), 'utf8')

// ── dependencias.md: grafo por módulo (herramientas, libs e integraciones) ──
const imp = atlas.aristas.filter((a) => a.tipo === 'importa' && N.has(a.de) && N.has(a.a) && ['herramienta', 'lib', 'integracion'].includes(N.get(a.de).tipo) && ['herramienta', 'lib', 'integracion'].includes(N.get(a.a).tipo))
const fuertes = imp.filter((a) => a.peso >= 3)
const usados = new Set(fuertes.flatMap((a) => [a.de, a.a]))
const clase = (id) => (N.get(id).zona === 'franco' ? ':::franco' : N.get(id).zona === 'congelado' ? ':::congelado' : '')
const grafo = ['```mermaid', 'flowchart LR', '  classDef franco fill:#fde68a,stroke:#b45309,color:#111', '  classDef congelado fill:#bfdbfe,stroke:#1d4ed8,color:#111',
  ...[...usados].map((id) => `  ${mid(id)}["${id}"]${clase(id)}`), ...fuertes.map((a) => `  ${mid(a.de)} -->|${a.peso}| ${mid(a.a)}`), '```']
const dep = [
  cab('Dependencias', ' Grafo por módulo, no por archivo. Amarillo = ZONA-FRANCO; azul = congelado (restricción de la auditoría; ver `11-CONGELADOS.md`).'),
  `Se dibujan las ${fuertes.length} dependencias con 3 imports o más (de ${imp.length}); la tabla completa va abajo.`, '', ...grafo, '',
  '## Todas las dependencias entre módulos', '', '| De | A | Imports |', '|---|---|---|', ...imp.sort((a, b) => b.peso - a.peso).map((a) => `| ${a.de} | ${a.a} | ${a.peso} |`), '',
  '## Crons (aristas «dispara»)', '', '| Registro | Ruta | Nodo | Schedule |', '|---|---|---|---|', ...atlas.aristas.filter((a) => a.tipo === 'dispara').map((a) => `| ${a.de} | ${a.ruta ?? '—'} | ${a.a} | \`${a.schedule}\` |`), '',
]
writeFileSync(path.join(ATLAS, 'dependencias.md'), dep.join('\n'), 'utf8')

// ── ramas.md ─────────────────────────────────────────────────────────────────
const REC = { mergeada: 'archivar (ya está en la base)', viva: 'revisar con su dueño: mergear o seguir', dormida: 'revisar: mergear lo útil o archivar', abandonada: 'archivar salvo que su dueño la reclame' }
const ramas = atlas.nodos.filter((n) => n.tipo === 'rama').sort((a, b) => (b.ahead ?? 0) - (a.ahead ?? 0))
const rm = [
  cab('Ramas', ' Solo recomendación: nada se mergea ni se borra desde la auditoría.'), `${ramas.length} ramas.`, '',
  '| Rama | Adelante | Atrás | Último commit | Estado | Worktree | Nodos tocados | Recomendación |', '|---|---|---|---|---|---|---|---|',
  ...ramas.map((r) => `| ${r.nombre} | ${r.ahead} | ${r.behind} | ${r.ultimo_commit?.fecha ?? '—'} | ${r.estado} | ${r.worktree ? `\`${r.worktree}\`` : '—'} | ${r.nodos_tocados ?? 0} | ${REC[r.estado]} |`), '',
]
writeFileSync(path.join(ATLAS, 'ramas.md'), rm.join('\n'), 'utf8')

// ── modulos/<herramienta>.md ─────────────────────────────────────────────────
const dirMod = path.join(ATLAS, 'modulos')
rmSync(dirMod, { recursive: true, force: true }); mkdirSync(dirMod, { recursive: true })
const madurezDe = (h) => { const fs = atlas.nodos.filter((n) => n.padre === h.id && n.tipo === 'funcionalidad'); const c = {}; for (const f of fs) { const m = curado[f.id]?.madurez ?? 'L?'; c[m] = (c[m] ?? 0) + 1 } return { fs, c } }
const resumenMad = (c) => ORDEN_MAD.filter((m) => c[m]).map((m) => `${m} ${c[m]}`).join(' · ') || 'sin funcionalidades'
const hallDe = (id) => hallazgos.filter((h) => [].concat(h.nodo ?? []).some((x) => x === id || x.startsWith(`${id}.`)))
const tarjetasDe = (id) => tarjetas.filter((t) => (t.nodos ?? []).some((x) => x === id || x.startsWith(`${id}.`)) && !['hecha', 'descartada'].includes(t.estado))
const herrs = atlas.nodos.filter((n) => n.tipo === 'herramienta').sort((a, b) => a.id.localeCompare(b.id))
const indice = []
for (const h of herrs) {
  const { fs, c } = madurezDe(h)
  const cur = curado[h.id] ?? {}
  const sale = atlas.aristas.filter((a) => a.tipo === 'importa' && a.de === h.id).sort((a, b) => b.peso - a.peso)
  const entra = atlas.aristas.filter((a) => a.tipo === 'importa' && a.a === h.id).sort((a, b) => b.peso - a.peso)
  const hs = hallDe(h.id)
  const graves = hs.filter((x) => ['CRÍTICA', 'ALTA'].includes(x.severidad))
  const sev = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'].map((s) => hs.filter((x) => x.severidad === s).length).join('/')
  const tjs = tarjetasDe(h.id)
  const empezar = [
    tjs.length ? `la tarjeta del backlog: ${tjs.slice(0, 3).map((x) => `${x.id} (${x.bloque})`).join(', ')} en \`07-BACKLOG.md\`` : null,
    h.rutas.length ? `la entrada: \`${h.archivos.find((a) => /page\.tsx$/.test(a)) ?? h.archivos[0]}\` (${h.rutas.slice(0, 3).join(', ')})` : null,
    h.archivos.find((a) => /_actions\/|actions?\.ts$/.test(a)) ? `las acciones: \`${h.archivos.find((a) => /_actions\/|actions?\.ts$/.test(a))}\`` : null,
    sale[0] ? `lo que más usa: ${sale.slice(0, 3).map((a) => `${a.a} (${a.peso})`).join(', ')}` : null,
    graves.length ? `antes de tocar, leé ${graves.map((x) => x.id).join(', ')}` : null,
    h.zona === 'franco' ? 'es zona de Franco: coordiná con él (09-PARA-FRANCO.md)' : h.zona === 'congelado' ? 'tiene archivos congelados: ver 11-CONGELADOS.md' : null,
  ].filter(Boolean)
  const md = [
    `# ${h.nombre} (\`${h.id}\`)`, '', `> GENERADO por \`vistas.mjs\` (${atlas.generado.ref} @ \`${atlas.generado.sha.slice(0, 8)}\`). Lo curado (veredicto, alcance, notas) vive en \`atlas.curado.json\`.`, '',
    `- **Área:** ${h.area} · **Dueño:** ${h.dueno} · **Zona:** ${h.zona} · **Archivos:** ${h.archivos.length} (${h.loc} líneas) · **Último commit:** ${h.ultimo_commit ? `${h.ultimo_commit.sha} (${h.ultimo_commit.fecha})` : '—'}`,
    `- **Madurez (calculada desde sus funcionalidades):** ${resumenMad(c)}`,
    `- **Veredicto:** ${cur.veredicto ?? '—'} · **Alcance:** ${cur.alcance ?? 'sin-decidir'} (propuesto: ${cur.alcance_propuesto ?? '—'})`,
    `- **Rutas:** ${h.rutas.length ? h.rutas.map((r) => `\`${r}\``).join(', ') : '—'}`,
    `- **Modelos que usa:** ${h.modelos.length ? h.modelos.join(', ') : '—'}`,
    `- **Depende de:** ${sale.length ? sale.slice(0, 8).map((a) => `${a.a} (${a.peso})`).join(', ') : '—'}`,
    `- **Lo usan:** ${entra.length ? entra.slice(0, 8).map((a) => `${a.de} (${a.peso})`).join(', ') : '—'}`,
    `- **Ramas donde cambia:** ${h.ramas.length ? h.ramas.join(', ') : '—'}`,
    `- **Hallazgos vinculados (C/A/M/B):** ${sev}${hs.length ? ` — ${hs.slice(0, 20).map((x) => x.id).join(', ')}${hs.length > 20 ? ` y ${hs.length - 20} más` : ''}` : ''}`, '',
    '## Por dónde empezar si querés tocarlo', '', ...empezar.map((x) => `- ${x}`), '',
    ...(tjs.length ? ['## Tarjetas abiertas del backlog', '', '| Tarjeta | Bloque | Tamaño | Zona |', '|---|---|---|---|', ...tjs.map((x) => `| ${x.id} · ${corto(x.titulo, 100)} | ${x.bloque} | ${x.tamano} | ${corto(x.zona, 60)} |`), ''] : []),
    '## Funcionalidades', '', '| Id | Nombre | Madurez | Veredicto | Alcance propuesto | Criterios L3 que faltan |', '|---|---|---|---|---|---|',
    ...fs.map((f) => { const k = curado[f.id] ?? {}; return `| ${f.id.slice(h.id.length + 1)} | ${corto(f.nombre, 80)} | ${k.madurez ?? 'L?'} | ${k.veredicto ?? '—'} | ${k.alcance_propuesto ?? '—'} | ${corto((k.criterios_l3_faltantes ?? []).join('; '), 120) || '—'} |` }), '',
    '## Archivos', '', ...h.archivos.map((a) => `- \`${a}\``), '',
  ]
  writeFileSync(path.join(dirMod, `${h.id}.md`), md.join('\n'), 'utf8')
  indice.push(`| [${h.id}](modulos/${h.id}.md) | ${h.nombre} | ${h.dueno} | ${resumenMad(c)} | ${sev} | ${cur.alcance_propuesto ?? '—'} | ${tjs.length ? tjs.map((x) => x.id).join(', ') : '—'} |`)
}
writeFileSync(path.join(ATLAS, '_indice-modulos.md'), ['| Módulo | Nombre | Dueño | Madurez | Hallazgos C/A/M/B | Alcance propuesto | Tarjetas abiertas |', '|---|---|---|---|---|---|---|', ...indice, ''].join('\n'), 'utf8')
console.log(`vistas: rutas.md, datos.md, dependencias.md (${fuertes.length} aristas dibujadas), ramas.md (${ramas.length}), modulos/ (${herrs.length}), _indice-modulos.md`)
