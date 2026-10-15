#!/usr/bin/env node
// Auditoría de renovación 2026-10 — escribe 04-DISENO.md (F3, PROMPT §F3, plan §7.3) y la VH de su hallazgo de runtime.
//
// Entradas: _crudo/censo-diseno.json (censo-diseno.mjs sobre la base), _crudo/f3-resultado.json (cuatro agentes de
// solo lectura: dirección de escena, tokens y motion de v3, destino y ruta, cruce de PLAN del sitio público).
// Los hallazgos de diseño (DIS) y la priorización son del padre, con lo que verificó en git (ver «Verificación»).
//
// Uso (desde logic-core-v3): node scripts/auditoria/diseno-md.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const DIR = path.resolve(process.cwd(), 'docs/auditoria-2026-10')
const C = path.join(DIR, '_crudo')
const censo = JSON.parse(readFileSync(path.join(C, 'censo-diseno.json'), 'utf8'))
const f3 = JSON.parse(readFileSync(path.join(C, 'f3-resultado.json'), 'utf8'))
const { escena, destino } = f3
const tm = f3['tokens-motion']
const REDISENO = 'rediseno/home @ `bead847c` (2026-10-15 16:36)'

const n = (x) => Number(x ?? 0).toLocaleString('es-AR')
const sum = (o) => Object.values(o ?? {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
const lit = (k) => (k.hex ?? 0) + (k.rgb ?? 0) + (k.hsl ?? 0) + (k.oklch ?? 0) + (k.arbitrario ?? 0)
const g = censo.global

// ── Priorización por pantalla: impacto para el cliente contra esfuerzo (volumen de estilo literal en su cierre) ──
const IMPACTO = { portal: 3, auth: 3, widget: 3, admin: 2, setter: 1 }
const filas = censo.items.map((p) => {
  const k = p.conteo
  const volumen = lit(k) + sum(k.paleta) + (k.tamano ?? 0) + (k.inline ?? 0)
  return { p, volumen }
})
const ord = [...filas].map((f) => f.volumen).sort((a, b) => a - b)
const t1 = ord[Math.floor(ord.length / 3)], t2 = ord[Math.floor((2 * ord.length) / 3)]
const esf = (v) => (v <= t1 ? 1 : v <= t2 ? 2 : 3)
for (const f of filas) { f.impacto = IMPACTO[f.p.area] ?? 1; f.esfuerzo = esf(f.volumen); f.puntaje = (f.impacto / f.esfuerzo).toFixed(2) }
filas.sort((a, b) => b.puntaje - a.puntaje || a.volumen - b.volumen)
const ruta = (r) => r.replace(/^src\/app\//, '').replace(/\/page\.tsx$/, '') || '/'
const tablaPantallas = filas.map((f, i) => `| ${i + 1} | \`${ruta(f.p.pagina)}\` | ${f.p.area} | ${f.p.archivos} | ${f.p.ui_congelados} | ${lit(f.p.conteo)} | ${sum(f.p.conteo.paleta)} | ${f.p.conteo.tamano ?? 0} | ${f.p.conteo.inline ?? 0} | ${f.impacto} | ${['', 'S', 'M', 'L'][f.esfuerzo]} | ${f.puntaje} |`).join('\n')
const porArea = Object.entries(censo.items.reduce((a, p) => { const x = (a[p.area] ??= { paginas: 0, lit: 0, paleta: 0, tamano: 0, inline: 0 }); x.paginas++; x.lit += lit(p.conteo); x.paleta += sum(p.conteo.paleta); x.tamano += p.conteo.tamano ?? 0; x.inline += p.conteo.inline ?? 0; return a }, {}))
  .map(([a, x]) => `| ${a} | ${x.paginas} | ${n(x.lit)} | ${n(x.paleta)} | ${n(x.tamano)} | ${n(x.inline)} |`).join('\n')

const lista = (xs) => xs.map((x) => `- **${x.elemento}.** ${x.detalle} (${x.cita}). *Por qué:* ${x.razon}`).join('\n')
const preguntas = escena.preguntas_abiertas.map((q, i) => `${i + 1}. **${q.pregunta}**\n   - Opciones: ${q.opciones}\n   - Trade-off: ${q.trade_off}\n   - Fuente: ${q.cita}`).join('\n')
const motionReus = tm.motion.filter((m) => !m.atado_a_scroll_o_escena)
const motionAtado = tm.motion.filter((m) => m.atado_a_scroll_o_escena)
const tokensTabla = tm.tokens.map((t) => `| ${t.grupo} | \`${t.nombre}\` | ${String(t.valor).replace(/\|/g, '\\|').slice(0, 60)} | ${t.rol.replace(/\|/g, '\\|').slice(0, 90)} | ${t.depende_de_escena ? 'sí' : 'no'} |`).join('\n')

// ── Hallazgos de diseño (DIS), formato §5.1 + Nodo(s) ──
const DIS = [
  ['DIS-001', 'El kit `ui/*` no tiene capa semántica: 12 de 469 referencias de color son tokens, y ninguna en lo que pinta el portal', 'MEDIA', 'deuda', 'VERIFICADO-POR-LECTURA',
    '`src/components/ui/Button.tsx:36` (primary fija bg-cyan-400 text-zinc-950) · `src/components/ui/Button.tsx:53-58` (las únicas variantes con tokens, ds-*, son del sitio público) · `src/components/ui/Modal.tsx:47` (zinc-950 como superficie) · `src/components/ui/Card.tsx:31` (glow cian rgba literal)',
    'Bloqueante para la renovación visual del portal: con el kit así, cambiar la piel exige un «puente de paleta» que redefine las variables de Tailwind (alcanza el 99,2 % del kit del portal, 389 de 392 referencias) pero no es semántico: zinc-950 es a la vez texto sobre acento y superficie, así que un tema claro limpio rompe el contraste sin editar el kit.',
    'Decisión para Valentino (`ui/*` está congelado; ver CNG-022 en `11-CONGELADOS.md`): o se acepta el puente de paleta como transición (ruta §3) o se migra el kit a roles (≈ 25 archivos, 377 referencias) con su gate.', 'L', 'congelado', 'lib.ui'],
  ['DIS-002', 'Los tres shells de portal imponen lienzo, velo, vidrio y radio con literales: ninguna variable que una capa de tema pueda mover', 'MEDIA', 'deuda', 'VERIFICADO-POR-LECTURA',
    '`src/app/(protected)/admin/_components/AdminLayoutClient.tsx:30` (bg-[#080a0c] y z-[80] literales) · `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:97` (panel rounded-[28px] con vidrio) · `src/components/dashboard/DashboardLayoutClient.tsx:51` (copia del lienzo del admin) · `src/app/(protected)/setter/_components/setter-shell.tsx:28` (el único que lee una variable, la legacy del sitio)',
    'Cualquier cambio de piel del portal empieza por los shells, que hoy repiten a mano el mismo lienzo, velo y vidrio en admin y dashboard; además el pie de los dos portales usa text-zinc-700 sobre #080a0c (≈ 1,9:1 por cálculo, no medido), debajo de AA.',
    'Reemplazar los literales de los tres shells por los roles de la capa del portal (ruta §3, paso 4), en un sprint propio con visual-qa por shell. El del setter es zona de Franco.', 'M', 'libre', 'h4.adm-shell, h2.cli-shell'],
  ['DIS-003', 'El lienzo del setter lee `--color-void`, que el ThemeProvider del home deja en `light` sin limpiarlo: llegar al setter desde el home sin recargar puede pintar el panel casi blanco con texto claro', 'MEDIA', 'bug', 'PROBABLE',
    '`src/app/(protected)/setter/_components/setter-shell.tsx:28` (bg-[var(--color-void)] text-zinc-100) · `src/hooks/useThemeObserver.tsx:15-21` (escribe data-theme en el html; no hay limpieza al desmontar) · `src/app/globals.css:308-309` ([data-theme=light] pone --color-void en #fafafa) · `src/app/page.tsx:23` (el ThemeProvider solo se monta en el home)',
    'Bloqueante para el uso diario del setter si se reproduce: el contenido queda con texto zinc-100 sobre #fafafa, casi ilegible, hasta recargar. El login redirige por server action (navegación blanda) y el Navbar entra a /login con triggerTransition, así que el html conserva el atributo del home. Es runtime: lo cierra la VH.',
    'Que el shell del setter use un rol propio del portal (o el literal del lienzo de los otros shells) en vez de --color-void, y que el ThemeProvider del home quite data-theme al desmontar.', 'S', 'ZONA-FRANCO', 'h5.set-dia'],
  ['DIS-004', 'Al mergear rediseno/home el portal cambia de Geist a Chivo sin que nadie lo haya decidido para el portal', 'MEDIA', 'ux', 'VERIFICADO-POR-LECTURA',
    '`rama:bead847c:src/app/globals.css:15-17` (--font-sans y --font-mono pasan a Chivo en el @theme global) · `src/app/layout.tsx:2-11` (main carga Geist en el layout raíz) · `src/app/globals.css:5` (main mapea --font-sans a Geist)',
    'El merge de la home cambia la tipografía de todas las pantallas internas (tablas densas, micro-textos de 9 a 11 px) como efecto lateral; la decisión del home («Chivo») no se tomó para el portal.',
    'Decidir antes del merge (pregunta 5 de §4): adoptar Chivo en el portal servida con next/font/local desde el layout raíz, o acotar el cambio de familia al home.', 'S', 'libre', 'lib.ui, rama.rediseno-home'],
  ['DIS-005', 'La regla única de foco visible de v3 está acotada al home: si se vuelve global sin un foco del tema oscuro, el portal queda sin foco visible', 'MEDIA', 'a11y', 'VERIFICADO-POR-LECTURA',
    '`rama:bead847c:src/app/theme-develop.css:296-305` (--color-foco es la tinta #111 por referencia) · `rama:bead847c:src/app/theme-develop.css:1485-1494` (la regla se acota a [data-v3] porque sobre el zinc-950 del portal da 1,06:1) · `rama:bead847c:src/app/v3/_estilos/foco.css:118-128` (el anillo de dos tonos que sí funciona sobre oscuro)',
    'El foco visible es criterio AA del portal (CLAUDE.md: quality baseline). El comentario del tema dice que el anillo «se invierte solo»; el propio foco.css mide que no (1,0:1 contra la sala de noche) y usa dos tonos: lo transferible es el anillo de dos tonos, no el comentario.',
    'Llevar al portal el mecanismo (una regla :focus-visible emitida antes que los componentes, con el anillo de dos tonos) con un color de foco que pase 3:1 sobre la base que se decida.', 'S', 'libre', 'lib.ui'],
  ['DIS-006', 'No hay ningún banco visual del kit: el playground del admin se borró y /styleguide no renderiza `ui/*` y es público sin auth', 'MEDIA', 'faltante', 'VERIFICADO-POR-LECTURA',
    '`src/app/styleguide/page.tsx:19-27` (noindex, sin auth ni links entrantes; no importa ui/*) · `tests/e2e/22-visual-regression.spec.ts:75` (la única prueba de tokens apunta a /admin/_design, borrada en c3b150ab)',
    'Cualquier re-tematizado del portal (puente de paleta, capa de roles o migración del kit) va a ciegas: no hay dónde ver el kit bajo cada tema ni medir contraste por token.',
    'Una página con auth que renderice ui/* y los wrappers bajo cada tema, con chequeo de contraste por token, antes del primer cambio de piel (ruta §3, paso 8).', 'M', 'libre', 'lib.ui'],
  ['DIS-007', 'El motion de v3 es casi todo coreografía de scroll: de sus módulos solo cinco sirven al portal, y el portal no tiene política de movimiento reducido', 'BAJA', 'a11y', 'VERIFICADO-POR-LECTURA',
    '`rama:bead847c:src/app/v3/_lib/usePrefiereMenosMovimiento.ts:32` (useSyncExternalStore con snapshot de servidor true) · `src/lib/use-reduced-motion.ts:6` (main arranca en false y corrige en un efecto)',
    'Llevar el motion del home tal cual mete recorridos atados al scroll en una herramienta; no llevar su política de movimiento reducido deja el defecto de A11Y-040 (las entradas animan igual para quien pidió menos movimiento).',
    'Adoptar en los layouts del portal el proveedor de movimiento de v3 (MotionConfig reducedMotion desde el hook con snapshot de servidor) y las curvas para micro-interacciones; dejar fuera la coreografía (ver §2).', 'S', 'libre', 'lib.ui'],
  ['DIS-008', 'Los colores por servicio tienen tres versiones: CLAUDE.md (correcta para main), AGENTS.md con la permutación equivocada que también viven en código, y v3 con tres acentos nuevos', 'BAJA', 'deuda', 'VERIFICADO-POR-LECTURA',
    '`raíz:CLAUDE.md:99-103` (cian, esmeralda, ámbar, violeta; coincide con globals.css y las landings) · `AGENTS.md:54-58` (IA violeta, Automatización esmeralda, Software ámbar) · `src/lib/design-tokens.ts:94-98` (la misma permutación) · `rama:bead847c:src/app/theme-develop.css:326-328` (v3: tres acentos oscuros)',
    'Quien siga AGENTS.md pinta los servicios cruzados, y la permutación ya está en el seed del bot (UX-031); la capa nueva del portal heredaría la confusión. Resuelve el punto 12 de §10 del plan: para main manda `raíz:CLAUDE.md:99-103`.',
    'Corregir AGENTS.md y design-tokens (o borrar sus colores, DEU-100), y decidir el set de acentos del portal (pregunta 3 de §4) antes de la capa de roles.', 'S', 'libre', 'lib.ui'],
  ['DIS-009', 'El Toaster es global y está fijado en oscuro con un fondo literal: cualquier tema del portal lo tiene que condicionar sin tocar el sitio público', 'BAJA', 'deuda', 'VERIFICADO-POR-LECTURA',
    '`src/app/layout.tsx:125-134` (Toaster con theme dark y background #090a0f en el layout raíz)',
    'Los toasts son la respuesta de casi toda action del portal; con un tema claro quedarían oscuros, y cambiarlos en el layout raíz cambia también el sitio público.',
    'Que el Toaster lea los roles de la capa del portal dentro de su scope (o montar uno por shell).', 'S', 'libre', 'lib.ui'],
]
const disMd = DIS.map(([id, t, sev, tipo, conf, ev, imp, prop, esf, zona, nodos]) => [
  `### [${id}] ${t}`, `- Dominio: D9  ·  Severidad: ${sev}  ·  Tipo: ${tipo}`, `- Confianza: ${conf}`, `- Evidencia: ${ev}`, `- Impacto: ${imp}`, `- Propuesta: ${prop}`,
  `- Esfuerzo: ${esf}  ·  Zona: ${zona}`, `- Nodo(s): ${nodos}`, ...(id === 'DIS-003' ? ['- REQUIERE-VERIFICACIÓN-HUMANA: VH-174'] : []), '',
].join('\n')).join('\n')

const md = `# 04 — Diseño: llevar el lenguaje del home v3 a las pantallas internas

> F3 del PROMPT. Fuente: ${REDISENO}, leída con \`git show\`; **esa rama se mueve y sus tokens pueden cambiar hasta el merge**. Destino: las 79 pantallas internas de \`origin/main\` @ \`57c421bc\` (admin, portal del cliente, setter, auth y el widget). Fuentes de este documento: el censo léxico (\`scripts/auditoria/censo-diseno.mjs\` → \`_crudo/censo-diseno.json\`, con control positivo) y cuatro agentes de solo lectura (run \`wf_e8d81676-d17\`, \`_crudo/f3-resultado.json\`): dirección de escena (§7 completo de \`DIRECCION-ESCENA.md\`), tokens y motion de v3, destino y ruta en main, y el cruce de los 57 PLAN del sitio público (en \`12-PLANEADO.md\`). Las decisiones cerradas del home (sin dark mode, CTA siempre tinta, papel y tinta) **no se asumen** para el portal: van como preguntas en §4.

## Resumen

- **El sistema v3 no existe en main.** \`theme-develop.css\`, \`/v3\` y Chivo viven solo en rediseno/home. Al mergear, sus tokens \`@theme\` llegan a toda ruta y la familia del sitio pasa a Chivo también en el portal ([DIS-004]).
- **El destino casi no usa tokens.** En el cierre de las 79 pantallas hay ${n(lit(g))} colores literales (hex ${n(g.hex)}, rgb ${n(g.rgb)} y ${n(g.arbitrario)} arbitrarios de Tailwind) contra **${n(g.token)} usos de \`var(--…)\`**, ${n(sum(g.paleta))} clases de paleta (zinc ${n(g.paleta.zinc)}, white ${n(g.paleta.white)}, cyan ${n(g.paleta.cyan)}), ${n(g.tamano)} tamaños de texto arbitrarios y ${n(g.inline)} estilos inline.
- **El kit congelado no es re-tematizable de forma limpia** ([DIS-001], CNG-022). Hay una ruta sin tocarlo (capa de roles, puente de paleta, wrappers, migración por pantalla, §3), pero el tema claro limpio y el CTA tinta por defecto exigen editar \`ui/*\`: eso es decisión para Valentino.
- **Lo que se lleva tal cual** es el mecanismo, no la piel: foco visible único (con el anillo de dos tonos, [DIS-005]), salto al contenido y landmarks, las tres tintas por superficie, una sola política de movimiento reducido ([DIS-007]), \`cn()\` que conoce los tokens, el piso de 10 px, los breakpoints como bandas y el contraste re-derivado de los tokens con alfa.
- **Lo que no se lleva**: la escena 3D, la luz y el recorrido atado al scroll, el cursor propio, el scroll suave y la coreografía (${motionAtado.length} de los ${tm.motion.length} patrones de motion revisados).
- **Colores por servicio** (§10 #12 del plan): para main es correcto \`raíz:CLAUDE.md:99-103\`; \`AGENTS.md:54-58\` está mal y su permutación vive en código; v3 trae tres acentos nuevos ([DIS-008]).
- **Un bug probable del setter** salió de leer los shells: su lienzo lee \`--color-void\`, que el home deja en \`light\` ([DIS-003], VH-174).
- **Prioridad**: primero las decisiones (§4) y el banco visual ([DIS-006]); después shells y la capa de roles; las pantallas del cliente (portal, auth, widget) van antes que admin y setter (§5).

## 1. Censo del destino

Conteo léxico sobre la base, por página interna y el cierre de archivos que importa (los compartidos se repiten entre páginas a propósito: miden cuánto pesa cada pantalla). Total de archivos únicos: ${n(censo.archivos_unicos?.length ?? censo.archivos_unicos)}.

| Área | Páginas | Colores literales | Clases de paleta | Tamaños arbitrarios | Estilos inline |
|---|---|---|---|---|---|
${porArea}

Archivos con más color literal: ${censo.top_archivos_con_color_literal.slice(0, 8).map((x) => `\`${x.archivo}\` (${x.literales})`).join(', ')}. Varios son plantillas de email, donde el literal es obligatorio.

## 2. Tabla de transferencia

### Se lleva tal cual
${lista(escena.se_lleva)}

### Se adapta
${lista(escena.se_adapta)}

### No se lleva
${lista(escena.no_se_lleva)}

### Motion
- **Reutilizables en el portal** (${motionReus.length}): ${motionReus.map((m) => `${m.patron} (\`${m.archivo}\`): ${m.equivalente_dashboard}`).join(' · ')}.
- **Atados al scroll o a la escena** (${motionAtado.length}, no se llevan): ${motionAtado.map((m) => m.patron).join(' · ')}.

### Tipografía, foco, acentos y fuentes (v3)
- **Tipografía.** ${tm.tipografia}
- **Foco.** ${tm.foco}
- **Acentos por servicio.** ${tm.acentos_servicio}
- **Fuentes.** ${tm.fuentes}

### Componentes de v3 reutilizables
${lista(tm.componentes_reutilizables)}

## 3. Ruta de implementación sin tocar \`src/components/ui/*\`

${destino.ui_tematizable}

${destino.ruta_sin_ui.map((p) => `- **${p.paso}**\n  - Archivos: ${p.archivos}\n  - Riesgo: ${p.riesgo}`).join('\n')}

### Lo que solo se logra editando \`ui/*\` (decisión para Valentino)
${lista(destino.requiere_editar_ui.map((x) => ({ ...x, razon: x.razon ?? '' })))}

### Shells de los portales
${destino.layouts_portales}

### \`src/components/design-system/\` y \`/styleguide\`
${destino.design_system_main}

## 4. Decisiones abiertas (preguntas con trade-off, no tomadas)

${preguntas}

## 5. Priorización por pantalla

Impacto para el cliente: portal, auth y widget 3; admin 2; setter 1 (herramienta interna y zona de Franco). Esfuerzo por volumen de estilo literal en el cierre de la pantalla (colores literales + clases de paleta + tamaños arbitrarios + inline), en tercios: S ≤ ${t1}, M ≤ ${t2}, L > ${t2}. Puntaje = impacto ÷ esfuerzo (S=1, M=2, L=3); a igual puntaje va primero la de menos volumen. La prioridad real depende de las decisiones de §4 y de tener el banco visual ([DIS-006]).

| # | Pantalla | Área | Archivos | Congelados que usa | Colores literales | Paleta | Tamaños arbitrarios | Inline | Impacto | Esfuerzo | Puntaje |
|---|---|---|---|---|---|---|---|---|---|---|---|
${tablaPantallas}

## 6. Colores por servicio (resuelve el punto 12 de §10 del plan)

- **Correcto para main:** ${destino.colores_servicio.correcto}
- **Equivocado:** ${destino.colores_servicio.doc_equivocado}
- **Citas:** ${destino.colores_servicio.citas}

## 7. Docs previos del sistema

${lista(destino.docs_previos)}

## 8. Hallazgos de diseño

${disMd}
## 9. Verificación y lo que queda abierto

- **Verificado por el padre en git:** el lienzo del setter con \`var(--color-void)\` y el ThemeProvider sin limpieza ([DIS-003]); el lienzo literal del admin; que el kit solo tiene \`var(--\` en tres archivos (Button, IntroLockupText, MagneticCta); el Toaster oscuro con fondo literal; el mapeo de \`--font-sans\` a Chivo en rediseno/home; y la discrepancia del foco (el comentario de \`theme-develop.css:296-305\` dice que se invierte solo, \`foco.css:118-128\` mide que no).
- **Corrección de los agentes:** el encabezado de \`theme-develop.css\` dice 89 tokens; el bloque \`@theme static\` tiene 111 declaraciones. Las duraciones de v3 son «narrativas» (300 a 700 ms): las de feedback de un dashboard son una decisión aparte.
- **Sin verificar (runtime):** el lienzo claro del setter (VH-174); los contrastes calculados y no medidos (pie de los portales ≈ 1,9:1, acentos de CLAUDE.md sobre papel); que el puente de paleta no se filtre al volver al sitio público.
`
writeFileSync(path.join(DIR, '04-DISENO.md'), md, 'utf8')

// VH del hallazgo de runtime (una sola vez)
const f08 = path.join(DIR, '08-VERIFICACION-HUMANA.md')
const t08 = readFileSync(f08, 'utf8')
if (!t08.includes('### [VH-174]')) {
  writeFileSync(f08, `${t08.replace(/\n*$/, '\n')}\n### [VH-174] ¿El lienzo del setter queda claro si se llega desde el home sin recargar?
- Verifica: [DIS-003] · Prioridad: media
- Entorno: el sitio desplegado (o local) con una cuenta SETTER de prueba, en desktop
- Precondiciones: cuenta SETTER que pueda entrar; ninguna sesión abierta
- Pasos: 1) Abrir el home (/) y esperar a que termine el intro 2) Entrar por «Acceder» del Navbar (no escribir la URL) 3) Iniciar sesión con la cuenta SETTER 4) Al llegar a /setter, mirar el fondo del panel y en DevTools el atributo data-theme del html 5) Recargar y comparar
- Resultado esperado: el fondo del panel es oscuro antes y después de recargar; el html no tiene data-theme="light"
- Señal de falla: antes de recargar el fondo es casi blanco (#fafafa) con texto claro, y el html tiene data-theme="light"
- ¿Escribe en la base o manda emails?: no (solo un login)
`)
}
console.log(`04-DISENO.md: ${DIS.length} DIS · ${censo.items.length} pantallas · tercios de esfuerzo ${t1}/${t2} · VH-174 ${t08.includes('### [VH-174]') ? 'ya estaba' : 'agregada'}`)
