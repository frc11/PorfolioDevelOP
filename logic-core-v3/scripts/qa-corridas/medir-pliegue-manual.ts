/**
 * EL INSTRUMENTO — mide el primer pliegue de las CATORCE pantallas del manual.
 *
 * Por qué existe: el piloto P16 achicó la ficha un tercio y el primer campo
 * siguió sin entrar en el fold. La causa no era el contenido de esa pantalla,
 * era el cromo compartido de `PantallaManual` — que vale para las catorce. Sin
 * una medición de las catorce no se puede saber si achicar el cromo sirvió.
 *
 * Qué mide, por pantalla y por ancho (1440 y 390):
 *   · el pliegue real (NO es la altura del viewport: el shell del setter es
 *     `fixed inset-0` y el scroller es el `<main>` interno — el pliegue es su
 *     `clientHeight`);
 *   · a qué altura arranca el primer elemento accionable (el primer control
 *     interactivo VISIBLE fuera de la cabecera);
 *   · a qué altura arranca el bloque de trabajo (la zona "Registro");
 *   · cuánto ocupa cada pieza de cromo por encima: cabecera, instrucción,
 *     contexto, munición, y los rótulos en versalita;
 *   · el alto total del contenido;
 *   · si entra algo accionable en el pliegue.
 *
 * Todas las alturas son RELATIVAS AL ORIGEN DEL CONTENIDO del scroller, no al
 * viewport: `rect.top - mainRect.top + main.scrollTop`. Medir contra el
 * viewport daría números que dependen de dónde quedó el scroll.
 *
 * Uso:
 *   npx tsx scripts/qa-corridas/medir-pliegue-manual.ts            # imprime la tabla
 *   MEDIR_OUT=docs/baselines/pliegue-antes.json npx tsx ...        # + JSON
 *   MEDIR_SHOTS=docs/proof-screenshots/p17/antes npx tsx ...       # + capturas
 *   MEDIR_BASE_URL=http://127.0.0.1:3010 npx tsx ...               # otro puerto
 *
 * Requiere la app corriendo (build de producción con QA_ALLOW_LOCALHOST=1) y la
 * seed `scripts/v1-qa-wizard-states.ts` aplicada en la branch Neon dev.
 */
import path from 'path'
import fs from 'fs'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.MEDIR_BASE_URL ?? 'http://127.0.0.1:3010'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_JSON = process.env.MEDIR_OUT ?? null
const SHOTS_DIR = process.env.MEDIR_SHOTS ?? null

/** Las catorce, en orden canónico del manual. */
const CATORCE = [
  'm1',
  'm4',
  'm5',
  'm6',
  'mc1',
  'mc2',
  'm13',
  'm14',
  'm15',
  'm16',
  'mr',
  'espera',
  'revision',
  'archivo',
] as const
type PantallaId = (typeof CATORCE)[number]

const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const

type Medicion = {
  pantalla: PantallaId
  lead: string
  esActual: boolean
  ancho: string
  pliegue: number
  accionable: number | null
  accionableEtiqueta: string | null
  registro: number | null
  captura: number | null
  capturaEtiqueta: string | null
  /** Hay zona de trabajo: las pantallas de estado (espera/revision/archivo) no la tienen. */
  esDeTrabajo: boolean
  /**
   * El cromo QUE PONE EL LAYOUT-TIPO por encima del bloque de trabajo, con el
   * contenido de la pantalla descontado: padding del scroller + cabecera +
   * instrucción + los tres rótulos + los espacios entre bandas. Es el número
   * que este sprint mueve y el que fija el test de regresión.
   */
  cromoLayout: number | null
  alturas: Record<string, number>
  rotulos: number
  /** S1 — superficies (tarjetas) anidadas entre el scroller y el control de trabajo. */
  superficies: number
  /** Censo de lo que la pantalla ofrece — la prueba de que nada desapareció. */
  censo: Record<string, number>
  altoTotal: number
  entra: boolean
}

/**
 * La geometría, medida DENTRO de la página. Se pasa como FUNCIÓN (no como
 * string): así los escapes de las expresiones regulares no se degradan.
 */
function geometria() {
  const main = document.querySelector('main')
  if (!main) return null
  const mainRect = main.getBoundingClientRect()
  const origen = (el: Element) =>
    Math.round(el.getBoundingClientRect().top - mainRect.top + main.scrollTop)
  const alto = (el: Element) => Math.round(el.getBoundingClientRect().height)

  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false
    const cs = window.getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  const pieza = (sel: string) => {
    const el = main.querySelector(sel)
    return el && visible(el) ? { top: origen(el), alto: alto(el) } : null
  }

  const piezas: Record<string, { top: number; alto: number } | null> = {
    cabecera: pieza('header'),
    instruccion: pieza('[aria-label="Instrucción de esta pantalla"]'),
    contexto: pieza('[aria-label="Contexto del lead"]'),
    municion: pieza('[aria-label="Munición"]'),
    registro: pieza('[aria-label="Registro"]'),
    avance: pieza('[aria-label="Avance"]'),
    navConstruccion: pieza('nav[aria-label^="Fases de la construcción"]'),
    navAtras: pieza('nav[aria-label^="Pantallas completadas"]'),
    encabezado: pieza('[data-slot="encabezado"]'),
    ctxContenido: pieza('[aria-label="Contexto del lead"] [data-zona="contenido"]'),
    muniContenido: pieza('[aria-label="Munición"] [data-zona="contenido"]'),
  }

  // El primer control interactivo VISIBLE fuera de la cabecera. La cabecera se
  // excluye porque sus links son salida y contexto (volver a tu día, Instagram,
  // Maps), no el trabajo de la pantalla.
  const header = main.querySelector('header')
  const SEL =
    'button, input, textarea, select, [role="button"], [contenteditable="true"], a[href]'
  let accionable: { top: number; etiqueta: string } | null = null
  let elAccionable: Element | null = null
  for (const el of Array.from(main.querySelectorAll(SEL))) {
    if (header && header.contains(el)) continue
    if (!visible(el)) continue
    if (el instanceof HTMLElement && el.hidden) continue
    const t = origen(el)
    const etiqueta = (
      el.getAttribute('aria-label') ||
      (el.textContent || '').trim().slice(0, 42) ||
      el.tagName.toLowerCase()
    ).replace(/[\s ]+/g, ' ')
    if (!accionable || t < accionable.top) {
      accionable = { top: t, etiqueta }
      elAccionable = el
    }
  }

  // El primer control de CAPTURA: el primer control interactivo dentro de la
  // zona "Registro". Es el número que decide el sprint — "accionable" incluye
  // los «Copiar bloque» de la munición y los links externos del contexto, que
  // son útiles pero no son el trabajo. Escribir empieza acá.
  const zonaRegistro = main.querySelector('[aria-label="Registro"]')
  let captura: { top: number; etiqueta: string } | null = null
  let elCaptura: Element | null = null
  if (zonaRegistro) {
    for (const el of Array.from(zonaRegistro.querySelectorAll(SEL))) {
      if (!visible(el)) continue
      if (el instanceof HTMLElement && el.hidden) continue
      const t = origen(el)
      const etiqueta = (
        el.getAttribute('aria-label') ||
        (el.textContent || '').trim().slice(0, 42) ||
        el.tagName.toLowerCase()
      ).replace(/[\s ]+/g, ' ')
      if (!captura || t < captura.top) {
        captura = { top: t, etiqueta }
        elCaptura = el
      }
    }
  }

  // S1 — cuántas SUPERFICIES anidadas atraviesa el ojo hasta el control más
  // profundo. Una superficie es un elemento con marco Y fondo propios (la
  // tarjeta del sistema). El brief mide esto: "hoy hay hasta cuatro anidados:
  // página → tarjeta de sección → sub-tarjeta → campos".
  const esSuperficie = (el: Element) => {
    const cs = window.getComputedStyle(el)
    const tieneBorde =
      parseFloat(cs.borderTopWidth) > 0 &&
      cs.borderTopStyle !== 'none' &&
      cs.borderTopColor !== 'rgba(0, 0, 0, 0)'
    const bg = cs.backgroundColor
    const tieneFondo = bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
    return tieneBorde && tieneFondo && parseFloat(cs.borderTopLeftRadius) > 0
  }
  const profundidad = (el: Element | null) => {
    let d = 0
    for (let a: Element | null = el; a && a !== main; a = a.parentElement) {
      if (esSuperficie(a) && visible(a)) d += 1
    }
    return d
  }

  // El CENSO de lo que la pantalla ofrece. Existe para probar la regla 1 del
  // sprint —«no se saca contenido, se achica cromo»— con números y no con
  // promesas: si un bloque copiable, una salida externa o un control se
  // hubieran perdido al achicar, estos conteos bajan. Cuentan PRESENCIA (no
  // visibilidad): plegar no saca, y lo plegado tiene que seguir contando.
  const texto = (el: Element) => (el.textContent || '').replace(/[\s ]+/g, ' ').trim()
  const censo = {
    copiar: Array.from(main.querySelectorAll('button')).filter((b) =>
      /^Copi(ar bloque|ado)$/.test(texto(b)),
    ).length,
    linksExternos: main.querySelectorAll('a[target="_blank"]').length,
    linksInternos: main.querySelectorAll('a[href^="/setter"]').length,
    pendientes: Array.from(main.querySelectorAll('span')).filter(
      (e) => texto(e) === 'Link pendiente',
    ).length,
    controles: main.querySelectorAll(
      'button, input, textarea, select, [role="button"], [contenteditable="true"]',
    ).length,
    plegables: main.querySelectorAll('details').length,
  }

  // Rótulos en versalita: la marca tipográfica del layout-tipo (uppercase +
  // tracking ancho). Son el eje S7 — cuántos compiten entre sí por pantalla.
  let rotulos = 0
  for (const el of Array.from(main.querySelectorAll('p, span, h1, h2, h3, div'))) {
    if (!visible(el)) continue
    const cs = window.getComputedStyle(el)
    if (cs.textTransform !== 'uppercase') continue
    const ls = parseFloat(cs.letterSpacing)
    if (!Number.isFinite(ls) || ls < 1) continue
    if (!(el.textContent || '').trim()) continue
    rotulos += 1
  }

  return {
    pliegue: Math.round(main.clientHeight),
    altoTotal: Math.round(main.scrollHeight),
    piezas,
    accionable,
    captura,
    rotulos,
    censo,
    superficies: profundidad(elCaptura ?? elAccionable),
  }
}

async function medir(
  page: Page,
  pantalla: PantallaId,
  lead: { id: string; nombre: string },
  esActual: boolean,
  ancho: (typeof ANCHOS)[number],
): Promise<Medicion> {
  await page.setViewportSize({ width: ancho.width, height: ancho.height })
  await page.goto(`${BASE_URL}/setter/leads/${lead.id}/manual/${pantalla}`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('main', { timeout: 15_000 })
  // Deja asentar cualquier scroll-on-mount y el reflow del cambio de viewport.
  await page.waitForTimeout(450)
  await page.evaluate(() => {
    const m = document.querySelector('main')
    if (m) m.scrollTop = 0
  })

  const g = await page.evaluate(geometria)
  if (!g) throw new Error(`${pantalla}@${ancho.nombre}: no hay <main>`)

  const alturas: Record<string, number> = {}
  for (const [k, v] of Object.entries(g.piezas)) if (v) alturas[k] = v.alto

  const accionable = g.accionable?.top ?? null
  const captura = g.captura?.top ?? null
  const esDeTrabajo = g.piezas.registro !== null
  // El veredicto: en una pantalla de trabajo, que entre el primer control de
  // CAPTURA; en una de estado (sin Registro), que entre lo accionable que haya.
  const cromoLayout =
    g.piezas.registro === null
      ? null
      : g.piezas.registro.top -
        (g.piezas.encabezado?.alto ?? 0) -
        (g.piezas.ctxContenido?.alto ?? 0) -
        (g.piezas.muniContenido?.alto ?? 0)
  const referencia = esDeTrabajo ? captura : accionable
  const entra = referencia !== null && referencia < g.pliegue

  if (SHOTS_DIR) {
    const dir = path.resolve(SHOTS_DIR)
    fs.mkdirSync(dir, { recursive: true })
    await page.screenshot({ path: path.join(dir, `${pantalla}-${ancho.nombre}.png`) })
  }

  return {
    pantalla,
    lead: lead.nombre,
    esActual,
    ancho: ancho.nombre,
    pliegue: g.pliegue,
    accionable,
    accionableEtiqueta: g.accionable?.etiqueta ?? null,
    registro: g.piezas.registro?.top ?? null,
    captura,
    capturaEtiqueta: g.captura?.etiqueta ?? null,
    esDeTrabajo,
    cromoLayout,
    alturas,
    rotulos: g.rotulos,
    superficies: g.superficies,
    censo: g.censo,
    altoTotal: g.altoTotal,
    entra,
  }
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const { derivarPantalla } = await import('../../src/lib/leados/manual')
  const { parseFicha, parseProgreso, parseAgenda } = await import(
    '../../src/lib/leados/flow'
  )
  const { countFollowUps } = await import('../../src/lib/follow-up')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true },
  })
  if (!setter) throw new Error('falta el setter de QA (setter-qa@develop.test)')

  const leads = await prisma.osLead.findMany({
    where: { businessName: { startsWith: 'QA-W' } },
    select: {
      id: true,
      businessName: true,
      status: true,
      caliente: true,
      nextFollowUpAt: true,
      dossier: {
        select: {
          stage: true,
          draftUrl: true,
          finalUrl: true,
          enviadaAt: true,
          fichaJson: true,
          progresoJson: true,
          agendaJson: true,
        },
      },
      activities: { select: { result: true, createdAt: true } },
    },
    orderBy: { businessName: 'asc' },
  })

  const ahora = Date.now()
  const posiciones = leads.map((l) => {
    const actividades = l.activities.map((a) => ({
      result: a.result,
      createdAt: a.createdAt,
    }))
    return {
      id: l.id,
      nombre: l.businessName,
      posicion: derivarPantalla({
        stage: l.dossier?.stage ?? null,
        status: l.status,
        caliente: l.caliente,
        ficha: parseFicha(l.dossier?.fichaJson ?? null),
        draftUrl: l.dossier?.draftUrl ?? null,
        progreso: parseProgreso(l.dossier?.progresoJson ?? null),
        agenda: parseAgenda(l.dossier?.agendaJson ?? null),
        contactos: actividades.length,
        followUpCount: countFollowUps(
          actividades as Parameters<typeof countFollowUps>[0],
        ),
        followUpVencido: l.nextFollowUpAt
          ? l.nextFollowUpAt.getTime() <= ahora
          : false,
        finalUrl: l.dossier?.finalUrl ?? null,
        demoEnviada: Boolean(l.dossier?.enviadaAt),
      }),
    }
  })

  // El reparto: para cada pantalla, el lead donde ES el paso de ahora; si en
  // ninguno lo es, el primero que la tenga habilitada; si tampoco, completada.
  // Determinista (los leads vienen ordenados por nombre) → el antes y el
  // después miden EXACTAMENTE los mismos pares.
  const reparto: {
    pantalla: PantallaId
    lead: { id: string; nombre: string }
    esActual: boolean
  }[] = []
  const faltantes: PantallaId[] = []
  for (const pantalla of CATORCE) {
    const actual = posiciones.find((p) => p.posicion.actual === pantalla)
    const hab = posiciones.find((p) => p.posicion.habilitadas.includes(pantalla))
    const comp = posiciones.find((p) => p.posicion.completadas.includes(pantalla))
    const elegido = actual ?? hab ?? comp
    if (!elegido) {
      faltantes.push(pantalla)
      continue
    }
    reparto.push({
      pantalla,
      lead: { id: elegido.id, nombre: elegido.nombre },
      esActual: Boolean(actual),
    })
  }
  if (faltantes.length > 0) {
    console.error(
      `\nSIN LEAD para: ${faltantes.join(', ')} — la tabla saldría incompleta.`,
    )
    console.error(
      'Sembrá los estados que faltan antes de medir (scripts/v1-qa-wizard-states.ts).',
    )
    process.exitCode = 1
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const browser = await chromium.launch({
    args: ['--no-proxy-server', '--proxy-bypass-list=*'],
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  // `tsx`/esbuild compila con `keepNames`, que envuelve cada función en un
  // helper `__name` que NO existe en el navegador: sin este shim, cualquier
  // `page.evaluate(fn)` muere con «__name is not defined».
  await context.addInitScript(() => {
    ;(window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f
  })
  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: 8 * 60 * 60,
    token: {
      sub: setter.id,
      email: 'setter-qa@develop.test',
      name: 'setter-qa@develop.test',
      picture: null,
      role: 'SETTER',
      provider: 'qa-bypass',
      onboardingCompleted: false,
      passwordResetRequired: false,
    },
  })
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ])
  const page = await context.newPage()

  const filas: Medicion[] = []
  for (const ancho of ANCHOS) {
    for (const item of reparto) {
      filas.push(await medir(page, item.pantalla, item.lead, item.esActual, ancho))
    }
  }

  await browser.close()
  await prisma.$disconnect()

  for (const ancho of ANCHOS) {
    const grupo = filas.filter((f) => f.ancho === ancho.nombre)
    console.log(`\n=== ${ancho.nombre} px ${'='.repeat(90)}`)
    console.log(
      [
        'pantalla'.padEnd(9),
        'captura'.padStart(8),
        'accion'.padStart(7),
        'registro'.padStart(9),
        'pliegue'.padStart(8),
        'entra'.padStart(6),
        'cabec'.padStart(6),
        'instr'.padStart(6),
        'ctx'.padStart(5),
        'muni'.padStart(5),
        'rot'.padStart(4),
        'sup'.padStart(4),
        'cromo'.padStart(6),
        'total'.padStart(6),
        '  primer control de captura / accionable',
      ].join(' '),
    )
    for (const f of grupo) {
      console.log(
        [
          f.pantalla.padEnd(9),
          String(f.captura ?? '-').padStart(8),
          String(f.accionable ?? '-').padStart(7),
          String(f.registro ?? '-').padStart(9),
          String(f.pliegue).padStart(8),
          (f.entra ? 'si' : 'NO').padStart(6),
          String(f.alturas.cabecera ?? 0).padStart(6),
          String(f.alturas.instruccion ?? 0).padStart(6),
          String(f.alturas.contexto ?? 0).padStart(5),
          String(f.alturas.municion ?? 0).padStart(5),
          String(f.rotulos).padStart(4),
          String(f.superficies).padStart(4),
          String(f.cromoLayout ?? '-').padStart(6),
          String(f.altoTotal).padStart(6),
          `  ${f.capturaEtiqueta ?? f.accionableEtiqueta ?? '-'}`,
        ].join(' '),
      )
    }
    const entran = grupo.filter((f) => f.entra).length
    const trabajo = grupo.filter((f) => f.esDeTrabajo)
    const entranTrabajo = trabajo.filter((f) => f.entra).length
    console.log(`  -> entra algo accionable en el pliegue: ${entran}/${grupo.length}`)
    console.log(
      `  -> de las ${trabajo.length} pantallas de TRABAJO, empieza la captura dentro del pliegue en ${entranTrabajo}`,
    )
    const totales: Record<string, number> = {}
    for (const f of grupo) {
      for (const [k, v] of Object.entries(f.censo)) totales[k] = (totales[k] ?? 0) + v
    }
    console.log(
      `  -> censo de las 14: ${Object.entries(totales)
        .map(([k, v]) => `${k}=${v}`)
        .join(' · ')}`,
    )
    const cromos = trabajo.map((f) => f.cromoLayout ?? 0)
    console.log(
      `  -> cromo del layout-tipo encima del trabajo: min ${Math.min(...cromos)} · max ${Math.max(...cromos)}`,
    )
  }

  if (OUT_JSON) {
    const out = path.resolve(OUT_JSON)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, JSON.stringify({ base: BASE_URL, filas }, null, 2))
    console.log(`\nJSON -> ${out}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
