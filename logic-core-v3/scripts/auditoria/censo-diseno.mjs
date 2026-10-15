#!/usr/bin/env node
// Auditoría de renovación 2026-10 — F3.1: censo de diseño de las pantallas internas (PROMPT F3, plan §7.3).
//
// Por cada página interna de la ref (toda page.tsx salvo las 7 del sitio público) y su cierre de
// archivos propios —lo que importa en forma transitiva dentro de src/ según el grafo de
// dependency-cruiser de F1.7, más los layout, loading y error de su carpeta y de sus carpetas
// padre (sin el layout raíz, que es común a todo el sitio)— cuenta:
//   · colores literales: hex, rgb/rgba, hsl/hsla y oklch, y los valores arbitrarios de Tailwind
//     con color ([#…], [rgb…], [hsl…], [oklch…]); frente a los usos de tokens (var(--…));
//   · clases de paleta de Tailwind por familia (zinc, cyan, emerald…);
//   · tipografía: familias (font-* que no son peso, fontFamily) y tamaños arbitrarios (text-[10px]);
//   · radios (rounded-*), sombras (shadow-*, boxShadow), estilos inline (style={{…}}) y
//     backdrop-blur (el vidrio de CLAUDE.md).
// Es un conteo léxico: los comentarios también cuentan. Cada archivo entra una sola vez en el total
// global; por página se suma su cierre (los compartidos se repiten entre páginas a propósito: miden
// cuánto «pesa» cada pantalla). Control positivo: una muestra sintética con conteos conocidos.
//
// Solo lectura: lee la ref con git y el grafo local _crudo/depcruise.json (F1.7, que se generó sobre
// el árbol de trabajo = origin/main). Escribe _crudo/censo-diseno.json (partido si pasa 300 KB).
// Uso (desde logic-core-v3): node scripts/auditoria/censo-diseno.mjs [--ref origin/main]

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { escribirSegunPeso } from './crudo-partes.mjs'

const args = process.argv.slice(2)
const REF = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : 'origin/main'
const APP = process.cwd()
const CRUDO = path.join(APP, 'docs/auditoria-2026-10/_crudo')
const PREFIJO = execFileSync('git', ['rev-parse', '--show-prefix'], { encoding: 'utf8' }).trim() // logic-core-v3/
const PUBLICAS = new Set(['src/app/page.tsx', 'src/app/ai-implementations/page.tsx', 'src/app/process-automation/page.tsx', 'src/app/software-development/page.tsx', 'src/app/web-development/page.tsx', 'src/app/contact/page.tsx', 'src/app/styleguide/page.tsx'])

// ── Contadores ──────────────────────────────────────────────────────────────
const FAMILIAS = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black'
const PESOS = 'thin|extralight|light|normal|medium|semibold|bold|extrabold|black'
const RE = {
  hex: /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g,
  rgb: /\brgba?\(\s*[\d.]/g,
  hsl: /\bhsla?\(\s*[\d.]/g,
  oklch: /\boklch\(/g,
  token: /var\(--[\w-]+/g,
  arbitrario: /\b[a-z]+(?:-[a-z]+)*-\[(?:#|rgba?\(|hsla?\(|oklch\()[^\]]*\]/g,
  paleta: new RegExp(`\\b(?:bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|outline|divide|placeholder|caret|accent|decoration|shadow)-(${FAMILIAS})(?:-\\d{2,3})?(?:\\/(?:\\d{1,3}|\\[[\\d.]+\\]))?(?![\\w-])`, 'g'),
  fuente: new RegExp(`\\bfont-(?!(?:${PESOS})(?![\\w-]))(\\[[^\\]]+\\]|[a-z][a-z0-9-]*)`, 'g'),
  fontFamily: /\bfontFamily\s*:/g,
  tamano: /\btext-\[\d+(?:\.\d+)?(?:px|rem|em)\]/g,
  radio: /\brounded(?:-(?:[trbl]{1,2}|[se][se]?))?(?:-(?:none|sm|md|lg|xl|2xl|3xl|full|\[[^\]]+\]))?(?![\w-])/g,
  sombra: /\bshadow(?:-(?:sm|md|lg|xl|2xl|inner|none|\[[^\]]+\]))?(?![\w-])/g,
  boxShadow: /\bboxShadow\s*:/g,
  inline: /style=\{\{/g,
  vidrio: /\bbackdrop-blur(?:-[\w[\]]+)?/g,
}
function contar(texto) {
  const c = {}
  for (const [k, re] of Object.entries(RE)) {
    if (['paleta', 'fuente', 'radio', 'sombra'].includes(k)) {
      const m = {}
      for (const x of texto.matchAll(re)) { const v = k === 'paleta' ? x[1] : x[0]; m[v] = (m[v] ?? 0) + 1 }
      c[k] = m
    } else c[k] = (texto.match(re) ?? []).length
  }
  c.literales = c.hex + c.rgb + c.hsl + c.oklch
  return c
}
const sumar = (a, b) => {
  for (const [k, v] of Object.entries(b)) {
    if (typeof v === 'number') a[k] = (a[k] ?? 0) + v
    else { a[k] ??= {}; for (const [kk, vv] of Object.entries(v)) a[k][kk] = (a[k][kk] ?? 0) + vv }
  }
  return a
}

// ── Control positivo ────────────────────────────────────────────────────────
const muestra = `<div className="bg-[#080a0c] text-zinc-400 border-white/10 rounded-2xl shadow-lg font-mono font-semibold text-[10px] backdrop-blur-[20px]"
  style={{ color: '#fff', background: 'rgba(255,255,255,0.04)', boxShadow: '0 0 4px hsl(200 50% 50%)', fontFamily: 'Chivo' }}>
  <span className="text-cyan-400/80 bg-emerald-500/[0.08] rounded-[28px] shadow-none oklch(0.7 0.1 200) var(--color-tinta)">#main</span>
</div>`
const esperado = { hex: 2, rgb: 1, hsl: 1, oklch: 1, token: 1, arbitrario: 1, fontFamily: 1, tamano: 1, boxShadow: 1, inline: 1, vidrio: 1 }
const cm = contar(muestra)
const fallas = Object.entries(esperado).filter(([k, v]) => cm[k] !== v).map(([k, v]) => `${k}: ${cm[k]} ≠ ${v}`)
const famEsperadas = { zinc: 1, white: 1, cyan: 1, emerald: 1 }
for (const [k, v] of Object.entries(famEsperadas)) if (cm.paleta[k] !== v) fallas.push(`paleta.${k}: ${cm.paleta[k]} ≠ ${v}`)
if (cm.radio['rounded-2xl'] !== 1 || cm.radio['rounded-[28px]'] !== 1) fallas.push(`radios: ${JSON.stringify(cm.radio)}`)
if (cm.fuente['font-mono'] !== 1 || cm.fuente['font-semibold']) fallas.push(`fuentes: ${JSON.stringify(cm.fuente)}`)
if (fallas.length) { console.error(`control positivo FALLA: ${fallas.join('; ')}`); process.exit(1) }

// ── Páginas internas y su cierre ────────────────────────────────────────────
const arbol = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-tree', '-r', '--name-only', REF, '--', 'src'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(Boolean).map((p) => p.replace(PREFIJO, ''))
const enArbol = new Set(arbol)
const paginas = arbol.filter((p) => /^src\/app\/.*page\.tsx$/.test(p) && !PUBLICAS.has(p))
const DEP = path.join(CRUDO, 'depcruise.json')
if (!existsSync(DEP)) { console.error('falta _crudo/depcruise.json (F1.7, local): correr antes depcruise'); process.exit(1) }
const grafo = new Map(JSON.parse(readFileSync(DEP, 'utf8')).modules.map((m) => [m.source, (m.dependencies ?? []).filter((d) => !d.coreModule && /^src\//.test(d.resolved ?? '')).map((d) => d.resolved)]))
const contenido = new Map()
const leer = (p) => {
  if (!contenido.has(p)) contenido.set(p, enArbol.has(p) ? execFileSync('git', ['show', `${REF}:${PREFIJO}${p}`], { encoding: 'utf8', maxBuffer: 1 << 26 }) : '')
  return contenido.get(p)
}
const conteos = new Map()
const conteoDe = (p) => { if (!conteos.has(p)) conteos.set(p, contar(leer(p))); return conteos.get(p) }
function cierre(pagina) {
  const vistos = new Set()
  const pila = [pagina]
  // layout, loading y error de la carpeta y de las carpetas padre (sin el layout raíz)
  let dir = path.posix.dirname(pagina)
  while (dir.startsWith('src/app')) {
    for (const f of ['layout.tsx', 'loading.tsx', 'error.tsx']) { const p = `${dir}/${f}`; if (enArbol.has(p) && p !== 'src/app/layout.tsx') pila.push(p) }
    if (dir === 'src/app') break
    dir = path.posix.dirname(dir)
  }
  while (pila.length) {
    const p = pila.pop()
    if (vistos.has(p) || !enArbol.has(p)) continue
    vistos.add(p)
    for (const d of grafo.get(p) ?? []) pila.push(d)
  }
  return [...vistos]
}
const area = (p) => (/\(protected\)\/admin\//.test(p) ? 'admin' : /\(protected\)\/dashboard\//.test(p) ? 'portal' : /\(protected\)\/setter\//.test(p) ? 'setter' : /src\/app\/embed\//.test(p) ? 'widget' : 'auth')
const items = []
const global = {}
const globalArchivos = new Set()
for (const pag of paginas.sort()) {
  const archivos = cierre(pag)
  const total = {}
  for (const f of archivos) { sumar(total, conteoDe(f)); globalArchivos.add(f) }
  items.push({ pagina: pag, area: area(pag), archivos: archivos.length, ui_congelados: archivos.filter((f) => f.startsWith('src/components/ui/')).length, conteo: total })
}
for (const f of globalArchivos) sumar(global, conteoDe(f))
const porArchivo = [...globalArchivos].map((f) => ({ archivo: f, literales: conteoDe(f).literales + conteoDe(f).arbitrario, inline: conteoDe(f).inline })).sort((a, b) => b.literales - a.literales)
const porArea = {}
for (const it of items) { porArea[it.area] ??= { paginas: 0 }; porArea[it.area].paginas++ }
escribirSegunPeso(CRUDO, 'censo-diseno', {
  generado: { ref: REF, sha: execFileSync('git', ['rev-parse', REF], { encoding: 'utf8' }).trim() },
  nota: 'Conteo léxico (los comentarios cuentan). Por página: la suma de su cierre de archivos; global: cada archivo una vez.',
  paginas: items.length, archivos_unicos: globalArchivos.size, por_area: porArea,
  global, top_archivos_con_color_literal: porArchivo.slice(0, 40),
  items,
})
const fam = Object.entries(global.paleta ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${v}`).join(' · ')
console.log(`censo-diseno (${REF}): ${items.length} páginas internas (${Object.entries(porArea).map(([k, v]) => `${k} ${v.paginas}`).join(', ')}) · ${globalArchivos.size} archivos únicos`)
console.log(`  colores literales ${global.literales} (hex ${global.hex}, rgb ${global.rgb}, hsl ${global.hsl}, oklch ${global.oklch}) + arbitrarios de Tailwind ${global.arbitrario} · usos de tokens var(--) ${global.token}`)
console.log(`  paleta: ${fam} · tamaños de texto arbitrarios ${global.tamano} · estilos inline ${global.inline} · backdrop-blur ${global.vidrio}`)
console.log(`  control positivo OK · salida _crudo/censo-diseno.json`)
