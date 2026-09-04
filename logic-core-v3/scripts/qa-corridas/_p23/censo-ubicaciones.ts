/**
 * P23 — EL CENSO DE REFERENCIAS DE UBICACIÓN.
 *
 * Por qué existe: una copy que dice DÓNDE está un control («el botón está acá
 * arriba») queda atada a una posición que el próximo sprint mueve. P18 movió la
 * acción principal a una barra `sticky bottom-0` y la frase que la ubicaba
 * siguió apuntando hacia arriba. Ninguna prueba lo vio, porque ninguna compara
 * la FRASE con la POSICIÓN REAL del referente.
 *
 * Qué mide, por pantalla: cada frase VISIBLE que dice una ubicación, su altura
 * en el contenido, y —cuando la frase nombra un control entre comillas
 * angulares— la altura y el `position` computado de ESE control. El veredicto
 * sale de comparar, no de leer el código.
 *
 * Uso:
 *   CENSO_BASE_URL=http://127.0.0.1:3023 npx tsx scripts/qa-corridas/_p23/censo-ubicaciones.ts
 *   CENSO_OUT=docs/baselines/p23-ubicaciones-antes.json npx tsx ...
 */
import fs from 'fs'
import path from 'path'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.CENSO_BASE_URL ?? 'http://127.0.0.1:3023'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_JSON = process.env.CENSO_OUT ?? null

/** El reparto pantalla→lead lo fija el baseline del pliegue: mismo reparto, misma corrida. */
const PLIEGUE_JSON = process.env.CENSO_PLIEGUE ?? 'docs/baselines/p23-pliegue-antes.json'

type Hallazgo = {
  ruta: string
  frase: string
  fraseTop: number
  /** El control que la frase nombra entre «», si lo nombra. */
  referente: string | null
  referenteTop: number | null
  referentePosition: string | null
  referenteEncontrado: boolean
  pliegue: number
}

/**
 * Se evalúa DENTRO de la página, y va como STRING a propósito: `tsx` compila con
 * `keepNames`, que envuelve cada función en `__name(...)`; al serializar una
 * función TS para `page.evaluate` ese wrapper viaja y la página revienta con
 * «__name is not defined». Como string no hay compilación de por medio.
 */
const CENSAR_JS = String.raw`(() => {
  const main = document.querySelector('main')
  if (!main) return []
  const mainRect = main.getBoundingClientRect()
  const origen = (el) => Math.round(el.getBoundingClientRect().top - mainRect.top + main.scrollTop)

  // Las palabras que atan una copy a una posición del layout.
  const UBICACION = /(ac[aá] arriba|ac[aá] abajo|m[aá]s arriba|m[aá]s abajo|de arriba|de abajo|ah[ií] abajo|ah[ií] arriba|est[aá] arriba|est[aá] abajo|al costado|en el rail|arriba a la|abajo a la)/i

  const visible = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false
    const cs = window.getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  // Hojas de texto: sólo el elemento que TIENE el texto como hijo directo, para
  // no reportar la misma frase una vez por cada ancestro.
  const out = []
  const todos = Array.from(main.querySelectorAll('*'))
  for (const el of todos) {
    const propio = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent || '')
      .join('')
    if (!UBICACION.test(propio)) continue
    if (!visible(el)) continue
    const frase = (el.textContent || '').trim().replace(/\s+/g, ' ')

    // ¿La frase nombra un control entre comillas angulares?
    const m = frase.match(/«([^»]+)»/)
    const referente = m ? m[1] : null
    let referenteTop = null
    let referentePosition = null
    let referenteEncontrado = false
    if (referente) {
      const candidatos = Array.from(
        main.querySelectorAll('button, a, [role="button"], summary, label'),
      ).filter((c) => visible(c) && (c.textContent || '').includes(referente))
      const ref = candidatos[0]
      if (ref) {
        referenteEncontrado = true
        referenteTop = origen(ref)
        // El position que MANDA: el del ancestro posicionado más cercano.
        let position = 'static'
        for (let a = ref; a && a !== main; a = a.parentElement) {
          const p = window.getComputedStyle(a).position
          if (p === 'sticky' || p === 'fixed') { position = p; break }
        }
        referentePosition = position
      }
    }
    out.push({
      frase,
      fraseTop: origen(el),
      referente,
      referenteTop,
      referentePosition,
      referenteEncontrado,
      pliegue: main.clientHeight,
    })
  }
  return out
})()`

async function main() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!setter) throw new Error('falta el setter de QA (setter-qa@develop.test)')

  const pliegue = JSON.parse(fs.readFileSync(path.resolve(PLIEGUE_JSON), 'utf8')) as {
    filas: { pantalla: string; lead: string; ancho: string }[]
  }
  const leads = await prisma.osLead.findMany({
    where: { businessName: { startsWith: 'QA-W' } },
    select: { id: true, businessName: true },
  })
  const idDe = new Map(leads.map((l) => [l.businessName, l.id]))

  // Una ruta por pantalla (el reparto de 1440), + el panel.
  const rutas: string[] = ['/setter']
  const vistas = new Set<string>()
  for (const fila of pliegue.filas) {
    if (fila.ancho !== '1440') continue
    if (vistas.has(fila.pantalla)) continue
    vistas.add(fila.pantalla)
    const id = idDe.get(fila.lead)
    if (!id) continue
    rutas.push(`/setter/leads/${id}/manual/${fila.pantalla}`)
  }

  const token = await encode({
    token: { sub: setter.id, email: setter.email, name: setter.name, role: setter.role },
    secret,
    salt: SESSION_COOKIE,
  })

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: new URL(BASE_URL).hostname,
      path: '/',
      httpOnly: true,
      // El prefijo `__Secure-` EXIGE `secure` — sin él Chrome rechaza la cookie
      // entera («Invalid cookie fields») y la corrida mide deslogueada.
      secure: true,
      sameSite: 'Lax',
    },
  ])
  const page: Page = await context.newPage()

  const hallazgos: Hallazgo[] = []
  for (const ruta of rutas) {
    process.stdout.write(`· ${ruta} ... `)
    // `domcontentloaded` + espera del scroller: `networkidle` no baja nunca en
    // estas páginas (RSC + streaming mantienen la conexión abierta).
    await page.goto(`${BASE_URL}${ruta}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('main', { timeout: 15_000 })
    await page.waitForTimeout(1200)
    // Los `<details>` plegados esconden copy: se abren todos para censar TODO
    // lo que la pantalla puede llegar a decir, no sólo lo desplegado por defecto.
    await page.evaluate(
      String.raw`document.querySelectorAll('details').forEach((d) => { d.open = true })`,
    )
    await page.waitForTimeout(150)
    const filas = (await page.evaluate(CENSAR_JS)) as Omit<Hallazgo, 'ruta'>[]
    for (const f of filas) hallazgos.push({ ruta, ...f })
    process.stdout.write(`${filas.length}\n`)
  }
  await browser.close()

  const veredictoDe = (h: Hallazgo) =>
    !h.referente
      ? 'sin referente nombrado'
      : !h.referenteEncontrado
        ? '?? el referente NO está en esta pantalla'
        : h.referentePosition === 'sticky' || h.referentePosition === 'fixed'
          ? `XX referente ${h.referentePosition} — no tiene lugar fijo en el contenido`
          : h.referenteTop! < h.fraseTop
            ? 'ok  referente por encima'
            : 'XX referente por DEBAJO de la frase'

  console.log('')
  console.log('=== CENSO DE REFERENCIAS DE UBICACIÓN (1440) ===')
  for (const h of hallazgos) {
    const pantalla = h.ruta.split('/').pop()
    console.log(
      `${String(pantalla).padEnd(9)} frase@${String(h.fraseTop).padStart(5)}  ref=${String(
        h.referente ?? '-',
      )
        .slice(0, 24)
        .padEnd(24)} ref@${String(h.referenteTop ?? '-').padStart(5)}  ${veredictoDe(h)}`,
    )
    console.log(`          "${h.frase.slice(0, 140)}"`)
  }
  const malas = hallazgos.filter((h) => veredictoDe(h).startsWith('XX'))
  console.log(`\ntotal: ${hallazgos.length} frases de ubicación · ${malas.length} apuntan mal`)

  if (OUT_JSON) {
    fs.mkdirSync(path.dirname(path.resolve(OUT_JSON)), { recursive: true })
    fs.writeFileSync(
      path.resolve(OUT_JSON),
      JSON.stringify({ base: BASE_URL, hallazgos }, null, 2),
    )
    console.log(`\nJSON -> ${path.resolve(OUT_JSON)}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
