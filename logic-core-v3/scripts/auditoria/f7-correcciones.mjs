#!/usr/bin/env node
// Auditoría de renovación 2026-10 — F7: aplica las correcciones que dejó la re-lectura de cierre (run wf_1bc3c339-ad5,
// _crudo/f7-resultado.json: C = contradicciones, K = configuración sin verificar según DEC-54, B = backlog). El padre
// verificó cada una antes de aplicarla. Cada operación aborta si no encuentra el texto que cambia, así que un segundo
// uso falla en vez de duplicar. Un solo uso (C24). Después: hallazgos-md, planeado-md, franco-md, atlas/backlog, generar,
// validar --emitir, vistas y validar-atlas (ver el log C24).
// Uso (desde logic-core-v3): node scripts/auditoria/f7-correcciones.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { escribirPartido, escribirSegunPeso, leerPartido } from './crudo-partes.mjs'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const CRUDO = path.join(DIR, '_crudo')
const hechos = []
const leer = (f) => readFileSync(path.join(DIR, f), 'utf8')
const escribir = (f, t) => writeFileSync(path.join(DIR, f), t, 'utf8')
function rep(f, a, b, cod) {
  const t = leer(f)
  if (!t.includes(a)) { console.error(`[${cod}] no está en ${f}: «${a.slice(0, 90)}»`); process.exit(1) }
  escribir(f, t.split(a).join(b)); hechos.push(`${cod} ${f}`)
}
const F7 = (cod) => ` [F7 ${cod}]`

// ══ 1. 07-BACKLOG.md: la fuente del backlog (DEC-57); backlog.json se regenera desde acá ══
let bk = leer('07-BACKLOG.md').replace(/\r\n/g, '\n')
const iCtrl = bk.indexOf('\n## Hallazgos sin tarjeta')
let cuerpo = bk.slice(0, iCtrl)
const resto = bk.slice(iCtrl)
const bloque = (id) => { const i = cuerpo.indexOf(`### [${id}] `); if (i < 0) { console.error('no está', id); process.exit(1) } const j = cuerpo.indexOf('\n### [B-', i + 5); return [i, j < 0 ? cuerpo.length : j] }
const rango = (txt, label) => {
  const m = new RegExp(`(^|\\n- |· )${label.replace(/[()]/g, '\\$&')}: `).exec(txt)
  if (!m) return null
  const s = m.index + m[0].length
  const fin = /( · [A-ZÁÉÍÓÚ][^:\n·]{2,40}: |\n)/g; fin.lastIndex = s
  const e = fin.exec(txt)
  return [s, e ? e.index : txt.length]
}
function campo(id, label, fn, cod) {
  const [i, j] = bloque(id)
  const b = cuerpo.slice(i, j)
  const r = rango(b, label)
  if (!r) { console.error(`[${cod}] ${id} sin «${label}»`); process.exit(1) }
  const nuevo = fn(b.slice(r[0], r[1]))
  cuerpo = cuerpo.slice(0, i) + b.slice(0, r[0]) + nuevo + b.slice(r[1]) + cuerpo.slice(j)
  hechos.push(`${cod} ${id}.${label}`)
}
const fijar = (id, label, v, cod) => campo(id, label, () => v, cod)
const sumarId = (id, label, extra, cod) => campo(id, label, (v) => `${v.replace(/\s*$/, '')}, ${extra}${F7(cod)}`, cod)
const sumar = (id, label, extra, cod) => campo(id, label, (v) => `${v.replace(/\s*$/, '')}${/[.;]$/.test(v.trim()) ? '' : '.'} ${extra}${F7(cod)}`, cod)

// B3: la mitad de BUG-023 que B-192 mandaba a una tarjeta que no existe pasa a ser suya (antes de las referencias)
campo('B-192', 'Archivos que NO se tocan', (v) => { const a = '; los botones Aplicar/Descartar y el link del email (BUG-023, «Avisos del chatbot al cliente…»)'; if (!v.includes(a)) { console.error('[B3] B-192'); process.exit(1) } return v.replace(a, '') }, 'B3')

// C4/B25: referencias a títulos del borrador que el crítico renombró o partió → su ID
const refsB01 = /(['«"])Runtime del chat: contabilidad del watchdog[^'»"\n]*(['»"])/
{ const [i, j] = bloque('B-01'); const b = cuerpo.slice(i, j); if (!refsB01.test(b)) { console.error('[C4] B-01 sin la cita'); process.exit(1) } cuerpo = cuerpo.slice(0, i) + b.replace(refsB01, '[B-121]') + cuerpo.slice(j); hechos.push('C4 B-01 → [B-121]') }
const REFS = [
  ['Runtime del chat: contabilidad del watchdog', '[B-120] y [B-121]'],
  ['Inteligencia del chatbot: guard propio', '[B-124]'],
  ['Widget: accesibilidad, saludo en vos', '[B-149] y [B-150]'],
  ['Fechas argentinas: fundir tz-ar en dates-ar y usarlas en admin', '[B-110]'],
  ['Inicio y Resultados: números que no inventan', '[B-116]'],
  ['Altas y perfiles:', '[B-126]'],
  ['CI que corre de verdad: base de test aislada, build, lint de fronteras', '[B-88]'],
  ['IDEA-002: aviso al 80', '[B-193]'],
  ['Editor y detalle del bot (admin): ids estables, higiene', '[B-148]'],
  ['IDEA-001: el dueño contesta', '[B-192]'],
  ['Sitio público (home clásica)', '[B-190]'],
  ['Leads y proyectos del admin', '[B-129] y [B-130]'],
  ['Páginas de auth: AuthShell compartido y sin embeber', '[B-156]'],
  ['Hooks de acción y autosave', '[B-139]'],
  ['LeadOS: entradas validadas (topes, CSV, link del opener, decisor) y', '[B-137]'],
  ['Acceso a L3', '[B-25] y [B-26]'],
]
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
for (const [pre, ids] of REFS) {
  const re = new RegExp(`(['«"])${esc(pre)}[^'»"\\n]*(['»"])`, 'g')
  const n = (cuerpo.match(re) ?? []).length
  if (!n) { console.error(`[C4] sin citas de «${pre}»`); process.exit(1) }
  cuerpo = cuerpo.replace(re, ids); hechos.push(`C4 «${pre}» → ${ids} (${n})`)
}

// referencias abreviadas «Título…»: si el comienzo identifica una sola tarjeta, su ID
const normT = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const titulosVigentes = [...cuerpo.matchAll(/^### \[(B-\d+)\] (.+)$/gm)].map((m) => [m[1], normT(m[2])])
const ABREV = { 'LeadOS: herramientas externas…': '[B-32]', 'Ficha del cliente…': '[B-55]', 'Alta y activación de bots…': '[B-59]' }
let abreviadas = 0
cuerpo = cuerpo.split(/\n(?=### \[B-)/).map((b) => (!b.startsWith('### [B-') ? b : b.replace(/[«'"]([^«»'"\n]{3,90})…[»'"]/g, (m, x) => {
  const fijo = ABREV[`${x}…`]
  const cand = titulosVigentes.filter(([, n]) => n.startsWith(normT(x)))
  if (!fijo && cand.length !== 1) { console.error(`[C4] «${x}…» → ${cand.length} tarjetas`); process.exit(1) }
  abreviadas++
  return fijo ?? `[${cand[0][0]}]`
}))).join('\n')
hechos.push(`C4 ${abreviadas} referencias abreviadas → ID`)

// tarjetas
sumar('B-01', 'Riesgo', 'Renovar en producción activa SEC-057: hoy la credencial vencida lo enmascara (03-MEJORAS.md, SEC-057). La key nueva se carga en Netlify producción recién con [B-07] desplegado, o en el mismo ciclo con un techo temporal de conversaciones nuevas por IP; para desarrollar [B-07] alcanza la key local o la de un deploy preview', 'B1')
sumar('B-01', 'Archivos a tocar', 'Sumar a la tabla la fila de Google AI (`CHATBOT_GOOGLE_API_KEY`) con la constancia de que la clave publicada está revocada (SEC-001); la limpieza de los docs queda en [B-92]', 'B24')
fijar('B-02', 'Zona', 'libre (los secrets los carga Franco: coordinar)', 'B5')
fijar('B-07', 'Criterio de aceptación', 'Con el preset nuevo de conversaciones nuevas por IP y por hora = N (fijado en presets.ts y anotado en el PR): en el escenario de VH-065, el pedido N+1 con un sessionId nuevo responde 429 y conversationsCount no pasa de N; en el de VH-105, tras 10 cortes con -m 1 el contador del mes sube 10 y el tope de 40 cuenta los intentos (las dos VH describen hoy el defecto: su resultado esperado se invierte); una conversación en curso sigue respondiendo cuando otra llena el cupo; streamText recibe maxOutputTokens; un turno vacío deja tokens y costo en QuotaUsage; los 403 de origen no escriben un ChatbotEvent por pedido.' + F7('B4'), 'B4')
campo('B-08', 'Hallazgos que cierra', (v) => v.replace('[SEC-009]', '[SEC-009] (parte libre)'), 'C14')
sumarId('B-27', 'Hallazgos que cierra', '[SEC-009] (parte `auth.ts`)', 'C14')
sumar('B-09', 'Riesgo', 'Depende de [B-04] para subir next-auth antes de editar el callback jwt y no probar dos veces', 'B19')
sumarId('B-10', 'Hallazgos que cierra', '[SEC-063]', 'B23')
campo('B-124', 'Hallazgos que cierra', (v) => v.replace(/,?\s*\[SEC-063\]/, '').replace(/^\s*,\s*/, ''), 'B23')
sumar('B-124', 'Criterio de aceptación', 'SEC-063 lo cierra [B-10]; acá solo se verifica', 'B23')
sumar('B-12', 'Archivos a tocar', 'Los lectores de cada credencial: un helper `readCredential()` en `src/lib/crypto` que descifra si el valor está cifrado y si no lo devuelve igual, usado en `google-business-profile.ts:56-90` (y la escritura del refresh, que cifra), `tiendanube.ts:55-58`, `cal-com.ts:27-29` y `telegram.ts:41-48`; sin eso, después del backfill esos módulos mandan el texto cifrado como token', 'B0')
campo('B-12', 'Criterio de aceptación', (v) => { const a = "la Bóveda no muestra 'AES-256' ni registros de acceso inventados."; if (!v.includes(a)) { console.error('[B18] B-12'); process.exit(1) } return v.replace(a, "la Bóveda muestra 'AES-256' solo si VH-031 da 0 credenciales en claro, y no muestra 'Registro de integridad y accesos' ni 'Monitoreo activo' hasta SEC-085 (FAL-009 es decisión de Valentino: ocultar o implementar)." + F7('B18')) }, 'B18')
sumar('B-14', 'Archivos a tocar', 'El disparador de os-follow-up se activa después de [B-81] (BUG-163: el digest sin tope fallaría todos los días) y con Franco; hasta entonces la función queda sin schedule', 'B10')
campo('B-15', 'Criterio de aceptación', (v) => { const a = 'dos clientes distintos ven números de leads distintos que coinciden con sus ChatbotLead no descalificados'; if (!v.includes(a)) { console.error('[B20]'); process.exit(1) } return v.replace(a, 'el número de leads de cada org coincide con el count de sus ChatbotLead no descalificados del período y no cambia al enviar un formulario en /contact') + F7('B20') }, 'B20')
for (const id of ['B-22', 'B-24']) { fijar(id, 'Modelo sugerido', 'Sonnet 5.5', 'B11'); fijar(id, 'Esfuerzo', 'high', 'B11') }
for (const id of ['B-53', 'B-78']) { fijar(id, 'Modelo sugerido', 'Opus 5.5', 'B11'); fijar(id, 'Esfuerzo', 'xhigh', 'B11') }
campo('B-46', 'Criterio de aceptación', (v) => { if (!v.includes('a lo sumo N mails por hora')) { console.error('[B21]'); process.exit(1) } return v.replace('a lo sumo N mails por hora', 'a lo sumo el tope de mails por hora fijado en `client-notifications/decide.ts` (anotado en el PR)') + F7('B21') }, 'B21')
sumarId('B-71', 'Hallazgos que cierra', '[POD-072] (se conecta, no se borra)', 'B9')
campo('B-168', 'Archivos a tocar', (v) => { if (!v.includes(', milestone.actions.ts#unmarkMilestonePaid')) { console.error('[B9] B-168'); process.exit(1) } return v.replace(', milestone.actions.ts#unmarkMilestonePaid', '') + ` (\`unmarkMilestonePaid\` no se borra: [B-71] lo conecta como Deshacer)${F7('B9')}` }, 'B9')
campo('B-168', 'Hallazgos que cierra', (v) => v.replace(/,?\s*\[POD-072\]/, '').replace(/^\s*,\s*/, ''), 'B9')
const FROZEN_SETTER = 'requiere decisión FROZEN + revisión de Franco (consumidores en el setter, `11-CONGELADOS.md`)'
for (const id of ['B-76', 'B-101', 'B-158']) fijar(id, 'Zona', FROZEN_SETTER, 'B7')
sumar('B-76', 'Criterio de aceptación', 'escalar-modal, evaluacion-form y salida-manual del setter siguen operables con teclado', 'B7')
fijar('B-89', 'Zona', 'requiere decisión FROZEN + ZONA-FRANCO (CNG-004 y CNG-005; firma de Franco por `auth.ts`, `OsLead*`, `ui/*`, `auth-guards`, `utils`, `action-utils` y `dates-ar`)', 'B6')
fijar('B-89', 'Nivel de proceso', 'S', 'B26'); fijar('B-89', 'Modelo sugerido', 'Sonnet 5.5', 'B26'); fijar('B-89', 'Esfuerzo', 'medium', 'B26')
fijar('B-96', 'Prerrequisitos', '[B-25], [B-26], [B-27], [B-08]', 'B2')
campo('B-98', 'Criterio de aceptación', (v) => { const a = '/admin y /dashboard en enforce sin violaciones legítimas tras una semana de reportes; \'unsafe-eval\' fuera de los portales.'; if (!v.includes(a)) { console.error('[B22]'); process.exit(1) } return v.replace(a, "/admin y /dashboard en enforce; el PR lista los reportes de CSP de 7 días en Report-Only previos al enforce, cada uno con su resolución; la CSP de /admin y /dashboard no contiene 'unsafe-eval'." + F7('B22')) }, 'B22')
fijar('B-137', 'Prerrequisitos', '[B-84], [B-85], [B-79]', 'B13')
for (const id of ['B-151', 'B-152']) fijar(id, 'Prerrequisitos', '[B-53]', 'B8')
fijar('B-155', 'Zona', 'libre (el `loading.tsx` de `admin/fg2-lab` es ZONA-FRANCO: con aviso a Franco)', 'B17')
fijar('B-156', 'Prerrequisitos', '[B-77], [B-151]', 'B14')
fijar('B-161', 'Zona', 'requiere decisión FROZEN (aviso a Franco: `setter-nav.tsx:43` usa triggerTransition)', 'B16')
sumar('B-161', 'Criterio de aceptación', 'La navegación del setter (destinos y drawer de setter-nav) no tiene regresiones en desktop ni en mobile', 'B16')
sumar('B-190', 'Archivos a tocar', '`sections/home/Footer.tsx`: el número de WhatsApp sale de `getWhatsappHref` de `lib/whatsapp.ts` (BUG-144); esta tarjeta lo migra', 'B12')
sumar('B-192', 'Archivos a tocar', 'La mitad de BUG-023 que [B-64] deja acá: isla cliente en `DiscoveriesSection.tsx` con APPLY/DISMISS para todas las categorías (llama a actOnInsight) y el link del email de `sendInsightsNotification.ts:47` a /dashboard/resultados/analisis', 'B3')
fijar('B-192', 'Prerrequisitos', '[B-64]', 'B3')
fijar('B-204', 'Prerrequisitos', '[B-21], [B-32], [B-55]', 'B15')

// cabecera, tabla de resumen (zonas recalculadas) y tabla de worktrees
cuerpo = cuerpo.replace('**Ahora** = toda CRÍTICA y ALTA, y lo que bloquea L3 en el camino del cliente', '**Ahora** = toda CRÍTICA y ALTA, lo que bloquea L3 en el camino del cliente y sus prerrequisitos directos'); hechos.push('B19 definición de Ahora')
const tarjetas = cuerpo.split(/\n(?=## |### \[B-)/)
let bq = null
const porBloque = {}
for (const s of tarjetas) {
  const h = s.match(/^## (Ahora|Próximo|Después)\s*$/m); if (h && s.startsWith('## ')) { bq = h[1]; continue }
  const m = s.match(/^### \[(B-\d+)\]/); if (!m || !bq) continue
  const z = (s.match(/\n- Zona: ([^\n]+)/) ?? [])[1] ?? ''
  const t = (s.match(/Tamaño: ([SML])/) ?? [])[1]
  ;(porBloque[bq] ??= []).push({ z, t })
}
const P = { S: 1, M: 3, L: 8 }
for (const b of ['Ahora', 'Próximo', 'Después']) {
  const xs = porBloque[b]; const c = xs.reduce((a, x) => { a[x.t] = (a[x.t] ?? 0) + 1; return a }, {})
  const fila = `| ${b} | ${xs.length} | ${c.S ?? 0} / ${c.M ?? 0} / ${c.L ?? 0} | ${xs.reduce((s, x) => s + P[x.t], 0)} | ${xs.filter((x) => /FRANCO/i.test(x.z)).length} | ${xs.filter((x) => /FROZEN/i.test(x.z)).length} |`
  cuerpo = cuerpo.replace(new RegExp(`^\\| ${b} \\| .*$`, 'm'), fila)
}
cuerpo = cuerpo.replace('| ZONA-FRANCO | FROZEN |', '| Con ZONA-FRANCO o coordinación con Franco | Con decisión FROZEN |')
rep2('| ahora/credenciales | B-02, B-03, B-05 |', '| ahora/credenciales | B-01, B-02, B-03, B-05 |', 'C19')
function rep2(a, b, cod) { if (!cuerpo.includes(a)) { console.error(`[${cod}] 07: «${a}»`); process.exit(1) } cuerpo = cuerpo.replace(a, b); hechos.push(`${cod} 07`) }
rep2('### Por worktree\n\n', '### Por worktree\n\nSolo los worktrees con dos o más tarjetas; las demás van en su propio worktree.\n\n', 'C19')
escribir('07-BACKLOG.md', cuerpo + resto + `\n## Correcciones de F7\n\nLa re-lectura de cierre (run \`wf_1bc3c339-ad5\`) encontró referencias a títulos del borrador que no existían, prerrequisitos y zonas que faltaban, criterios sin un N fijado y combinaciones de modelo que no seguían E12. Se corrigieron a mano en este archivo con \`scripts/auditoria/f7-correcciones.mjs\` (cada cambio en una tarjeta lleva «[F7 …]» con el código del problema, en \`_crudo/f7-resultado.json\`). Desde C24 la fuente es este archivo: \`backlog-md.mjs\` no se vuelve a correr.\n`)

// ══ 2. RESUMEN.md ══
rep('RESUMEN.md', '| SEC-006, SEC-023, SEC-007 | `auth.ts`: FROZEN + ZONA-FRANCO |', '| SEC-006, SEC-023, SEC-007 | SEC-006: `auth.ts`, FROZEN + ZONA-FRANCO (B-09); SEC-023 y SEC-007: libre (B-10, B-08) |', 'C0')
rep('RESUMEN.md', 'libre (el cifrado toca el schema: decisión FROZEN)', 'libre (B-12: el cifrado no cambia columnas)', 'C1')
rep('RESUMEN.md', 'De 143 docs a 10 vivos (VISION, ARQUITECTURA, ROADMAP, DECISIONES, OPERACIONES…), con 37 contradicciones listadas para decidir', 'De las 143 entradas de la lista de docs: 10 documentos vivos nuevos (VISION, ARQUITECTURA, ROADMAP, DECISIONES, OPERACIONES…), 15 que se mantienen y 128 a borrar o consolidar, con 37 contradicciones listadas para decidir', 'C15')
rep('RESUMEN.md', 'Los nueve dominios cerraron con `[DOMINIO-ABIERTO]` por el tope de ciclos (DEC-50), ninguno por falta de cobertura.', 'Los nueve dominios cerraron con `[DOMINIO-ABIERTO]` por el tope de ciclos (D1 y D6 con los de DEC-26 y E4; los otros siete con DEC-50), ninguno por falta de cobertura.', 'C16')

// ══ 3. Otros entregables escritos a mano ══
rep('01-INVENTARIO.md', 'Lista cerrada de §6 del plan: 6 áreas y 51 herramientas.', 'Lista cerrada de §6 del plan: 6 áreas y 51 herramientas; el Atlas suma la 52.ª, `h6.vis-sitio` (el chrome del sitio público, superficial), que se dio de alta en F5 y se curó en F7.', 'C3')
rep('01-INVENTARIO.md', 'el backup fallido avisa por GitHub |', 'el backup fallido queda solo en la pestaña Actions: según el comentario de `raíz:.github/workflows/db-backup.yml:18`, GitHub le avisaría a Franco por email, sin verificar (140 corridas fallidas pasaron sin registro; VH-160) |', 'K4')
rep('_reportes/F5.md', 'de 51 herramientas, 1.0 = 36, después = 14, descartado = 1 (FG-2 Lab).', 'de 51 herramientas, 1.0 = 36, después = 14, descartado = 1 (FG-2 Lab); en F7 se curó la 52.ª, `h6.vis-sitio`, con alcance propuesto «después» (36 / 15 / 1).', 'C3')
rep('14-DOCS-CONSOLIDADOS/README.md', '(36 para 1.0, 14 para después, 1 descartada)', '(36 para 1.0, 15 para después, 1 descartada, sobre 52 herramientas con h6.vis-sitio)', 'C3')
rep('14-DOCS-CONSOLIDADOS/README.md', '   - El workflow nunca corrió por falta de secrets (BUG-171)', '   - El workflow corre todos los días pero nunca terminó bien: 140 corridas fallidas por falta del secret (gh run list, 2026-10-15; BUG-171)', 'K7')
rep('06-ATLAS/arquitectura.md', '- **Respaldo.** El workflow de backup diario nunca corrió por falta de secrets (BUG-171).', '- **Respaldo.** El workflow de backup diario corre todos los días pero nunca terminó bien: 140 corridas fallidas por falta del secret de la URL y 0 secrets de Actions en el repo (`gh`, 2026-10-15; BUG-171).', 'K7')
rep('06-ATLAS/arquitectura.md', '- **Crons.** Netlify dispara 3 scheduled functions', '- **Crons.** Netlify tiene declaradas 3 scheduled functions (`netlify.toml:25-32`; que corran en producción se confirma con VH-136)', 'K2')
rep('06-ATLAS/arquitectura.md', '- **Observabilidad.** Sentry recibe los errores de render y del chat.', '- **Observabilidad.** Sentry está cableado para los errores de render y del chat, pero solo recibe si `NEXT_PUBLIC_SENTRY_DSN` estaba en el build (FAL-030); según `docs/bitacora-roadmap.md:17135` seguía inactivo en producción en 2026-08, y se confirma con VH-135.', 'K0')
for (const [a, b] of [
  ['| generate-insights | `0 9 * * *` | netlify.toml:25-26 | Insights del chatbot | sí |', '| generate-insights | `0 9 * * *` | netlify.toml:25-26 | Insights del chatbot | declarado; en producción sin verificar (VH-136) |'],
  ['| send-weekly-reports | `0 12 * * MON` | netlify.toml:28-29 | Reporte semanal | sí |', '| send-weekly-reports | `0 12 * * MON` | netlify.toml:28-29 | Reporte semanal | declarado; en producción sin verificar (VH-136) |'],
  ['| cleanup-old-events | `0 6 * * *` | netlify.toml:31-32 | Purga `chatbot_events` a 30 días | sí |', '| cleanup-old-events | `0 6 * * *` | netlify.toml:31-32 | Purga `chatbot_events` a 30 días | declarado; en producción sin verificar (VH-136) |'],
]) rep('14-DOCS-CONSOLIDADOS/OPERACIONES.md', a, b, 'K2')
rep('14-DOCS-CONSOLIDADOS/OPERACIONES.md', 'La passphrase vive solo en el secret y en el password manager de Franco (docs/operations/neon-backups.md:54-56).', 'Según docs/operations/neon-backups.md:54-56 (2026-05-26), la passphrase iba a vivir como secret de GitHub y en el password manager de Franco; el 2026-10-15 el repo no tenía ningún secret de Actions (BUG-171), así que hoy no está en GitHub.', 'K3')
rep('14-DOCS-CONSOLIDADOS/OPERACIONES.md', '- **Estado:** el workflow nunca corrió por falta de secrets (BUG-171);', '- **Estado:** el workflow corre todos los días pero nunca terminó bien: 140 corridas fallidas por falta del secret (gh run list, 2026-10-15; BUG-171);', 'K7')
rep('14-DOCS-CONSOLIDADOS/OPERACIONES.md', '**A verificar:** qué dominio sirve hoy `widget.js`;', '**A verificar (VH-175):** qué dominio sirve hoy `widget.js`;', 'K12')
rep('14-DOCS-CONSOLIDADOS/ARQUITECTURA.md', '- **Respaldo.** El backup diario nunca corrió por falta de secrets (BUG-171)', '- **Respaldo.** El backup diario corre todos los días pero nunca terminó bien: 140 corridas fallidas por falta del secret (gh run list, 2026-10-15; BUG-171)', 'K7')
rep('14-DOCS-CONSOLIDADOS/ROADMAP.md', '| Cargar los secrets del backup y validar el primer run (B14.3) | parcial |', '| Cargar los secrets del backup y validar el primer run (B14.3) | no empezado (gh, 2026-10-15: 140 corridas fallidas y 0 secrets; BUG-171) |', 'K6')
rep('14-DOCS-CONSOLIDADOS/ROADMAP.md', '| `NEXT_PUBLIC_SENTRY_DSN` en Netlify | no empezado |', '| `NEXT_PUBLIC_SENTRY_DSN` en Netlify | sin verificar (según la bitácora, inactivo en 2026-08; VH-135) |', 'K13')
rep('05-IDEAS.md', '\n## Ranking', '\n> **Nota de F7 (DEC-54).** Los límites y precios de terceros que se usan para estimar costos (los 10 s de las funciones de Netlify, las 125.000 invocaciones por mes, los 300 emails por día de Brevo, las cuotas de Google, los ~5 min de cómputo de Neon, los precios por token) son los de los planes gratuitos o públicos, según el PROMPT y las páginas de los proveedores; **no se verificaron contra las cuentas reales**. El plan de cada cuenta se confirma con VH-134 y el techo real de Netlify con VH-159.\n\n## Ranking', 'K8/K9/K19')
rep('07-BACKLOG.md', 'bajo el techo de 10 s.', 'bajo el techo de 10 s (según el PROMPT; sin verificar, VH-159).', 'K8')
rep('11-CONGELADOS.md', 'pausa-dia corre con TZ=UTC, que es el caso de Netlify.', 'pausa-dia corre con TZ=UTC, que es lo esperable en Netlify si no se configura TZ (sin verificar: VH-150).', 'K18')
rep('11-CONGELADOS.md', '[SEC-006] y [SEC-092] (fuga de `toErrorMessage`)', '[SEC-006] (la sesión que revive), [SEC-092] (fuga de `toErrorMessage`)', 'C10')
rep('13-CLAUDE-MD-PROPUESTO.md', 'No se cumple en tres casos: SEC-006 y SEC-092 (fuga de toErrorMessage, 11-CONGELADOS.md:40)', 'No se cumple en tres casos: SEC-092 y SEC-062 (fuga de toErrorMessage y mensajes crudos del admin)', 'C10')
for (const [a, b] of [
  ['| `src/context/PreloaderContext.tsx` | el flujo de fases del preloader | QA visual del sitio público |', '| `src/context/PreloaderContext.tsx` | el flujo de fases del preloader | `test:s8-diferido` + peso de /login + e2e 01-landing + `check:types` (CNG-003) |'],
  ['| `src/lib/prisma.ts` | el cliente único de la base | `check:types` |', '| `src/lib/prisma.ts` | el cliente único de la base | `check:types` + `check:invariants` + `test:p2002` y `test:integration` contra la base de test (CNG-006) |'],
  ['| `src/lib/utils.ts` | `cn()` y los helpers de todo el repo | `check:types` + QA visual |', '| `src/lib/utils.ts` | `cn()` y los helpers de todo el repo | `check:invariant:cn` (test:s7-cn) + `check:types` (CNG-008) |'],
  ['| `src/components/ui/*` (las 22 primitivas del kit) | el kit de los portales | `check:types` + QA visual |', '| `src/components/ui/*` (las 22 primitivas del kit) | el kit de los portales | `check:types`, lint y `check:invariants` + visual-qa por dominio y regresión visual (CNG-022) |'],
]) rep('13-CLAUDE-MD-PROPUESTO.md', a, b, 'C5')
rep('13-CLAUDE-MD-PROPUESTO.md', 'Los datos que mantienen las personas se editan a mano y ningún generador los pisa: `funcionalidades.json`, `zonas.json`, `entradas.json` y `atlas.curado.json`. Los generados no se editan: `atlas.json`, `historial.jsonl`, `hallazgos.json` y las vistas `.md`.', 'Los datos que mantienen las personas se editan a mano y ningún generador los pisa: `funcionalidades.json`, `zonas.json`, `entradas.json`, `atlas.curado.json`, `alias.json` y `07-BACKLOG.md` (el estado de cada tarjeta). Los generados no se editan: `atlas.json`, `historial.jsonl`, `hallazgos.json`, `backlog.json` y las vistas `.md`.', 'C8')
rep('13-CLAUDE-MD-PROPUESTO.md', '    node scripts/auditoria/atlas/generar.mjs --ref worktree --sin-ramas --sin-historial\n    node scripts/auditoria/atlas/vistas.mjs', '    node scripts/auditoria/atlas/generar.mjs --ref worktree --sin-ramas --sin-historial\n    node scripts/auditoria/atlas/backlog.mjs\n    node scripts/auditoria/atlas/vistas.mjs', 'C8')
rep('13-CLAUDE-MD-PROPUESTO.md', '6. Si tocó `src/` o `prisma/`: el Atlas está al día, con la skill `atlas-actualizar`. El hook Stop lo exige.', '6. Si tocó `src/` o `prisma/`: el Atlas está al día, con la skill `atlas-actualizar`, y la tarjeta de `07-BACKLOG.md` pasó a su nuevo Estado. El hook Stop lo exige.', 'C8')
rep('13-CLAUDE-MD-PROPUESTO.md', 'Atlas al día con la skill atlas-actualizar: atlas.curado.json refleja el cambio y `validar-atlas.mjs` sale 0;', 'Atlas al día con la skill atlas-actualizar: atlas.curado.json refleja el cambio, la tarjeta de 07-BACKLOG.md pasó a su nuevo Estado y `validar-atlas.mjs` sale 0;', 'C8')
rep('_reportes/D1.md', 'SEC-023 (ALTA): 22 páginas de `/admin` leen sin `auth()` propio', 'SEC-023 (ALTA): 15 páginas de `/admin` consultan Prisma sin `auth()` propio', 'C13')
rep('_reportes/D4.md', 'Todo el dominio es de Franco: cada hallazgo está también en `09-PARA-FRANCO.md` y las propuestas son decisión suya.', 'Todo el dominio es de Franco salvo SEC-003 (zona libre): los demás hallazgos están también en `09-PARA-FRANCO.md` y las propuestas son decisión suya.', 'C20')
rep('_reportes/D5.md', 'un anónimo agota en ≈ 17 min el cupo mensual de cualquier bot', 'un anónimo agota en ≈ 8 min (Starter, con los dos orígenes de develOP) el cupo mensual de cualquier bot', 'C12')
rep('_reportes/D6.md', '33 propios de D6 hoy (C 0 · A 2 · M 17 · B 14; SEC-036 subió a ALTA en D2-c1)', '33 propios de D6 (C 0 · A 2 · M 18 · B 13; SEC-036 subió a ALTA en D2-c1 y DEU-016 a MEDIA en D8)', 'C17')
rep('_reportes/F4.md', 'depende de habilitar la API en Google Cloud (VH en F6).', 'depende de habilitar la API en Google Cloud (VH-176).', 'K17')

// ══ 4. 08-VERIFICACION-HUMANA.md (acumulativo: se corrige en el lugar) ══
rep('08-VERIFICACION-HUMANA.md', '### [VH-087] Metricas del resumen del chatbot\n- Verifica: [BUG-085] · Prioridad: alta', '### [VH-087] Metricas del resumen del chatbot\n- Verifica: [BUG-085] · Prioridad: media', 'C11')
rep('08-VERIFICACION-HUMANA.md', '- Pasos: 1) Ver si existe el secret `DATABASE_URL_TEST` (el valor no se puede leer). 2) Confirmar con quien lo cargó a qué base apunta (host de Neon y branch).', '- Pasos: 1) Ver si existe el secret `DATABASE_URL_TEST` (el valor no se puede leer). **Resuelto el 2026-10-15:** el repo no tenía ningún secret de Actions (`gh api`, ver BUG-171); esta VH aplica cuando se cargue (DEU-017). 2) Confirmar con quien lo cargó a qué base apunta (host de Neon y branch).', 'K16')
rep('08-VERIFICACION-HUMANA.md', '- Pasos: 1) Netlify → Site → Functions → filtrar Scheduled 2) Buscar regenerate-briefs y send-executive-reports 3) Leer Organization.cachedExecutiveBriefAt y el último ExecutiveBriefSnapshot de un cliente activo 4) Revisar logs de un lunes a las 10:00 y 12:00 UTC', '- Pasos: 1) Netlify → Site → Functions → filtrar Scheduled 2) Buscar regenerate-briefs, send-executive-reports y os-follow-up (y cualquier cron externo que llame a /api/cron/os-follow-up) 3) Leer Organization.cachedExecutiveBriefAt y el último ExecutiveBriefSnapshot de un cliente activo 4) Revisar logs de un lunes a las 10:00 y 12:00 UTC, y los diarios de las 12:00 UTC de os-follow-up', 'K11')
rep('08-VERIFICACION-HUMANA.md', '### [VH-055] Crons del brief y del email ejecutivo en Netlify\n- Verifica: [BUG-047]', '### [VH-055] Crons del brief, del email ejecutivo y de os-follow-up en Netlify\n- Verifica: [BUG-047]', 'K11')
const vh = leer('08-VERIFICACION-HUMANA.md').replace(/\s*$/, '')
escribir('08-VERIFICACION-HUMANA.md', `${vh}

### [VH-175] ¿Qué dominio sirve producción y el widget?
- Verifica: el dominio de producción que dan por hecho VH-138, VH-141 y VH-165, y la instalación del widget de \`14-DOCS-CONSOLIDADOS/OPERACIONES.md\` (DEC-54) · Prioridad: media
- Entorno: panel de Netlify del sitio y una terminal
- Precondiciones: acceso de lectura al panel de Netlify
- Pasos: 1) Netlify → Domain management: anotar el dominio primario y si develop.com.ar apunta al sitio (DNS) 2) \`curl -sI https://develop.com.ar/widget.js\` y \`curl -sI https://develop-portfolio.netlify.app/widget.js\` 3) Comparar con el snippet de instalación (\`docs/operations/06-instalar-widget.md:29\`)
- Resultado esperado: develop.com.ar es el dominio primario y sirve \`widget.js\` con 200; el snippet apunta a él
- Señal de falla: develop.com.ar no responde o no es el primario; el snippet apunta a un dominio que no sirve el widget. Si pasa, actualizar VH-138, VH-141 y VH-165 con el dominio real
- ¿Escribe en la base o manda emails?: no

### [VH-176] ¿Está habilitada la Business Profile Performance API?
- Verifica: [IDEA-003] · Prioridad: baja
- Entorno: Google Cloud Console del proyecto de la app OAuth de Google Business
- Precondiciones: acceso al proyecto de Google Cloud
- Pasos: 1) Google Cloud → APIs & Services → Enabled APIs del proyecto de la app OAuth de GBP 2) Buscar «Business Profile Performance API»
- Resultado esperado: habilitada (o se sabe qué hace falta para habilitarla)
- Señal de falla: no está y requiere aprobación de Google: IDEA-003 no se puede construir hasta tenerla
- ¿Escribe en la base o manda emails?: no

### [VH-177] ¿A qué branch de Neon apunta DATABASE_URL en producción?
- Verifica: PLAN-1170 (aislamiento dev/prod con Neon branching) · Prioridad: media
- Entorno: panel de Netlify del sitio (Environment variables, contexto Production) y consola de Neon
- Precondiciones: acceso de lectura a los dos paneles
- Pasos: 1) Netlify → Site configuration → Environment variables → \`DATABASE_URL\` en Production: anotar host y branch (sin copiar el valor) 2) En Neon, confirmar que ese endpoint es el de la branch main 3) Repetir para Deploy previews
- Resultado esperado: producción apunta a la branch main y los previews a otra branch o a ninguna base de producción
- Señal de falla: producción apunta a la branch dev, o los previews escriben en la base de producción
- ¿Escribe en la base o manda emails?: no
`)
hechos.push('K12/K17/K1 VH-175 a VH-177')

// ══ 5. Datos: registro, funcionalidades, curado, cruces de lo planeado ══
const reg = leerPartido(CRUDO, 'hallazgos', null, 'hallazgos')
const H = (id) => { const h = reg.hallazgos.find((x) => x.id === id); if (!h) { console.error('no está', id); process.exit(1) } return h }
const nota = (h, cod, antes) => { h.origen = { ...(h.origen ?? {}), cambios: [...(h.origen?.cambios ?? []), { ciclo: 'F7', antes, nota_padre: `Corrección de la re-lectura de cierre (${cod}).` }] } }
{ const h = H('BUG-171'); nota(h, 'K5', { impacto: h.impacto }); h.impacto = `${h.impacto} Verificado en GitHub en solo lectura el 2026-10-15: \`gh run list --repo frc11/PorfolioDevelOP --workflow db-backup.yml\` dio 140 corridas fallidas, 1 cancelada y 0 exitosas, y \`gh api repos/frc11/PorfolioDevelOP/actions/secrets\` dio total_count 0 (log C15 de 00-PLAN-Y-LOG.md).` }
{ const h = H('SEC-107'); nota(h, 'K15', { impacto: h.impacto }); h.impacto = `${h.impacto} Visibilidad: público según \`gh repo view\` antes de cada push hasta el 2026-10-15 (DEC-48); sigue público por decisión de Valentino (DEC-52, DEC-54).` }
{ const h = H('SEC-002'); const a = 'El repo sigue público ([SEC-107])'; if (!h.bloque_md.includes(a)) { console.error('[K15] SEC-002'); process.exit(1) } nota(h, 'K15', { bloque_md: '(citaba a SEC-107 como fuente de la visibilidad)' }); h.bloque_md = h.bloque_md.replace(a, 'El repo sigue público (decisión de Valentino, DEC-52 y DEC-54; ver [SEC-107])') }
{ const h = H('TEC-003'); const a = 'claude-haiku-4-5-20251001 sigue activo pero es la generación anterior (USD 1/5 por millón contra 0,10/0,50 de Haiku 5.5)'; if (!h.impacto.includes(a)) { console.error('[K14] TEC-003'); process.exit(1) } nota(h, 'K14', { impacto: h.impacto }); h.impacto = h.impacto.replace(a, 'claude-haiku-4-5-20251001 es de una generación anterior; su vigencia y su precio frente a modelos más nuevos no se verificaron (sin WebSearch en esta corrida; se confirma en la consola de Anthropic)') }
escribirSegunPeso(CRUDO, 'hallazgos', reg, 'hallazgos')
hechos.push('K5/K15/K14 registro')

const fun = leerPartido(CRUDO, 'funcionalidades', { items: [] })
const fb = fun.items.find((f) => f.id === 'h4.adm-shell.backup-diario-de-la-base')
if (!fb || fb.madurez !== 'L?') { console.error('[K6] backup'); process.exit(1) }
const EV_BACKUP = 'Código completo (db-backup.yml:39-41 -> :102-124 -> :180-218), pero nunca terminó bien: gh run list (2026-10-15) dio 140 corridas fallidas por el secret faltante y 0 secrets en el repo (BUG-171).'
fb.madurez = 'L1'; fb.madurez_evidencia = EV_BACKUP
escribirPartido(CRUDO, 'funcionalidades', fun)
const ATLAS = path.join(DIR, '06-ATLAS')
const cur = JSON.parse(readFileSync(path.join(ATLAS, 'atlas.curado.json'), 'utf8'))
cur.nodos['h4.adm-shell.backup-diario-de-la-base'].madurez = 'L1'
cur.nodos['h4.adm-shell.backup-diario-de-la-base'].madurez_evidencia = EV_BACKUP
if (cur.nodos['h6.vis-sitio']) { console.error('[C3] h6.vis-sitio ya está'); process.exit(1) }
cur.nodos['h6.vis-sitio'] = { veredicto: 'decidir', alcance: 'sin-decidir', alcance_propuesto: 'despues', notas: 'Propuesta de la auditoría 2026-10 (F7): el chrome del sitio público (menú mobile, scroll y transición), de alcance superficial; sus dos funcionalidades ya estaban como «después». La madurez de la herramienta se calcula desde sus funcionalidades.', decisiones: [] }
writeFileSync(path.join(ATLAS, 'atlas.curado.json'), JSON.stringify(cur, null, 1) + '\n', 'utf8')
hechos.push('K6 backup L1 · C3 h6.vis-sitio curado')

const cr = leerPartido(CRUDO, 'planeado-cruces', { items: [] })
const CR = (k) => { const x = cr.items.find((i) => i.clave === k); if (!x) { console.error('[12] no está', k); process.exit(1) } return x }
Object.assign(CR('_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:26').valor, { estado: 'no empezado', evidencia: 'manual.ts:135-137 mapea cta/calidad/mobile a mc2, pero mc2 dibuja un tilde por fase (tres); el tilde único (tildeUnico) y mc2-refinar.tsx existen solo en el WIP 506e0059 de origin/p25/rafaga-tildes (git log --all). Corregido en F7 (C7).' })
Object.assign(CR('STATUS.md:223').valor, { estado: 'parcial', evidencia: 'logic-core-v3/.env.example:21-24 documenta la intención (local → branch dev, prod → branch main) y seed-guard.ts:18-30 reconoce la branch dev; a qué branch apunta DATABASE_URL en Netlify no se ve en el código (VH-177). Corregido en F7 (K1).' })
Object.assign(CR('docs/bitacora-roadmap.md:11989').valor, { estado: 'parcial', evidencia: 'En el repo: prisma/migrations/20260702223350_add_executive_report_config/migration.sql:2-6; schema.prisma:396-397 y :493-497. La aplicación en la Neon no se ve leyendo el código (VH-004). Corregido en F7 (K10).' })
Object.assign(CR('docs/bitacora-roadmap.md:9446').valor, { estado: 'parcial', evidencia: '.github/workflows/db-backup.yml:36-41 y job restore-test; scripts/db-backup-local.sh, scripts/db-restore-local.sh y docs/operations/neon-backups.md presentes. Nunca terminó bien: gh run list (2026-10-15) dio 140 corridas fallidas y 0 secrets (BUG-171). Corregido en F7 (K6).' })
escribirPartido(CRUDO, 'planeado-cruces', cr)
hechos.push('C7/K1/K10/K6 cruces de lo planeado')

console.log(hechos.length, 'correcciones aplicadas')
for (const h of hechos) console.log(' ', h)
