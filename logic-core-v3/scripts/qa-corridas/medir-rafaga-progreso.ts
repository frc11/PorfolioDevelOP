/**
 * P25 — EL INSTRUMENTO DE LA RÁFAGA. Mide, sobre la app corriendo, cuántas de N
 * marcas seguidas sobreviven según el RITMO al que se hacen.
 *
 * Por qué existe: el diagnóstico de la carrera («empieza a perderse por debajo
 * de ~1 segundo entre clics») venía de otro árbol. Un número heredado no prueba
 * nada sobre el tronco — este script lo vuelve a medir acá, y deja el antes y el
 * después comparables renglón por renglón.
 *
 * Qué mide, por cada intervalo entre clics:
 *   · cuántas de las tres marcas quedaron GUARDADAS (releídas de `progresoJson`,
 *     no de la pantalla — el estado optimista pinta las tres igual);
 *   · lo mismo para el chequeo final con su ráfaga de diez (el control: es el
 *     que ya funciona, y su número es el ritmo alcanzable);
 *   · lo mismo para la ficha y el brief (los otros dos blobs con autoguardado,
 *     que el censo dice que tampoco tienen la carrera).
 *
 * Cada medición usa un lead PROPIO y recién creado: reusar uno arrastra el
 * resultado de la medición anterior y el número siguiente sale contaminado.
 * Todo lo creado se borra al final por id exacto.
 *
 * Uso (con la app corriendo en el puerto que se le pase):
 *   RAFAGA_BASE_URL=http://127.0.0.1:3003 \
 *   RAFAGA_OUT=docs/baselines/p25-rafaga-antes.json \
 *   npx tsx scripts/qa-corridas/medir-rafaga-progreso.ts
 */
import path from 'path'
import fs from 'fs'
import { chromium, type Browser, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
// Los MISMOS fixtures de la suite: un lead sembrado a mano acá derivaría del de
// la suite en silencio y el número mediría otro objeto.
import type { DossierStage } from '@prisma/client'
import { createLead, newTracker, teardown, disconnect } from '../../tests/helpers/setter-db'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.RAFAGA_BASE_URL ?? 'http://127.0.0.1:3003'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_JSON = process.env.RAFAGA_OUT ?? null
const TAG = 'P25-RAFAGA'

/** Los ritmos a medir, en ms entre un clic y el siguiente. */
const INTERVALOS = [0, 150, 300, 600, 900, 1200, 1500]

/** Cuánto se espera, tras la ráfaga, a que el guardado se asiente. */
const ASENTADO_MS = 4000

/**
 * Cuántas veces se repite cada ritmo, quedándose con el PEOR resultado.
 *
 * Por qué no una sola pasada: la ventana no es un umbral limpio, es el RTT del
 * `router.refresh()` contra Neon, y varía corrida a corrida. Medido: el mismo
 * intervalo de 1200ms dio 3 de 3 en una pasada y 1 de 3 en la siguiente. Con una
 * sola muestra, el renglón que sale es el de la suerte de ese momento — y el
 * «después» quedaría comparándose contra un número que no se sostiene. El peor
 * de N es la afirmación que sí se sostiene: «a este ritmo SE PUEDE perder».
 */
const REPETICIONES = 2

const TILDES = 'main section[aria-label="Registro"] button[aria-pressed]'

type Medicion = {
  intervaloMs: number
  clics: number
  guardadas: number
  perdidas: number
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const { parseProgreso, parseSelfCheck, HARD_CHECKS } = await import('../../src/lib/leados/flow')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true },
  })
  if (!setter) throw new Error('falta el setter de QA (setter-qa@develop.test)')

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')

  const tracker = newTracker()
  let browser: Browser | null = null
  try {

    /** Un lead nuevo en CONSTRUCCION, propio de esta medición. */
    async function nuevoLead(
      etiqueta: string,
      draftUrl?: string,
      stage: DossierStage = 'CONSTRUCCION',
    ): Promise<string> {
      const lead = await createLead(tracker, {
        setterId: setter!.id,
        businessName: `${TAG} ${etiqueta}`,
        stage,
        ...(draftUrl ? { draftUrl } : {}),
      })
      return lead.id
    }

    browser = await chromium.launch({
      args: ['--no-proxy-server', '--proxy-bypass-list=*'],
    })
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
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
    const page: Page = await context.newPage()

    /**
     * La ráfaga, disparada DENTRO de la página. `evaluate` recibe el cuerpo como
     * STRING a propósito: bajo `tsx` el transpilador reescribe las funciones que
     * se serializan al browser (les inyecta `__name`) y el evaluate revienta.
     */
    async function rafagaEn(selector: string, golpes: number[], intervaloMs: number) {
      await page.evaluate(
        `(async () => {
          const botones = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
          for (const i of ${JSON.stringify(golpes)}) {
            if (botones[i]) botones[i].click();
            if (${intervaloMs} > 0) await new Promise(r => setTimeout(r, ${intervaloMs}));
          }
        })()`,
      )
    }

    const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    async function completadasDe(leadId: string): Promise<string[]> {
      const dossier = await prisma.osLeadDossier.findUnique({
        where: { leadId },
        select: { progresoJson: true },
      })
      return [...parseProgreso(dossier?.progresoJson ?? null).completadas]
    }

    // ── 1. El progreso: ráfaga de tres a cada ritmo ────────────────────────────
    const progreso: Medicion[] = []
    for (const intervaloMs of INTERVALOS) {
      const pasadas: number[] = []
      for (let rep = 0; rep < REPETICIONES; rep += 1) {
        // Un lead NUEVO por pasada: reusar arrastra el resultado de la anterior.
        const leadId = await nuevoLead(`progreso-${intervaloMs}-${rep}`)
        await page.goto(`${BASE_URL}/setter/leads/${leadId}/manual/mc1`, {
          waitUntil: 'domcontentloaded',
        })
        await page.waitForSelector(TILDES, { state: 'visible', timeout: 20_000 })
        // Sin esto la ráfaga puede salir antes de la hidratación y no dispara nada:
        // la medición daría 0 de 3 por una razón que no es la que se está midiendo.
        await page.waitForFunction(
          `document.querySelectorAll(${JSON.stringify(TILDES)}).length === 3 &&
           !document.querySelector(${JSON.stringify(TILDES)}).disabled`,
          undefined,
          { timeout: 20_000 },
        )

        await rafagaEn(TILDES, [0, 1, 2], intervaloMs)
        await esperar(ASENTADO_MS)
        pasadas.push((await completadasDe(leadId)).length)
      }
      const guardadas = Math.min(...pasadas)
      progreso.push({ intervaloMs, clics: 3, guardadas, perdidas: 3 - guardadas })
      console.log(
        `progreso  · intervalo ${String(intervaloMs).padStart(4)}ms → ${guardadas} de 3 guardadas` +
          ` (pasadas: ${pasadas.join(', ')})`,
      )
    }

    // ── 2. El chequeo final: la ráfaga de diez (el control que YA funciona) ─────
    const chequeo: Medicion[] = []
    for (const intervaloMs of [0, 300]) {
      const leadId = await nuevoLead(`chequeo-${intervaloMs}`, 'https://p25-medicion.netlify.app')
      await page.goto(`${BASE_URL}/setter/leads/${leadId}/manual/m14`, {
        waitUntil: 'domcontentloaded',
      })
      const nombres = HARD_CHECKS.map((check) => check.nombre)
      const selPrimero = `main button[role="switch"][aria-label=${JSON.stringify(nombres[0])}]`
      await page.waitForSelector(selPrimero, { state: 'visible', timeout: 20_000 })
      await page.waitForFunction(
        `!document.querySelector(${JSON.stringify(selPrimero)}).disabled`,
        undefined,
        { timeout: 20_000 },
      )

      await page.evaluate(
        `(async () => {
          for (const label of ${JSON.stringify(nombres)}) {
            const sel = 'main button[role="switch"][aria-label="' + label.replace(/"/g, '\\\\"') + '"]';
            const t = document.querySelector(sel);
            if (t) t.click();
            if (${intervaloMs} > 0) await new Promise(r => setTimeout(r, ${intervaloMs}));
          }
        })()`,
      )
      await esperar(ASENTADO_MS)

      const dossier = await prisma.osLeadDossier.findUnique({
        where: { leadId },
        select: { selfCheckJson: true },
      })
      const guardado = parseSelfCheck(dossier?.selfCheckJson ?? null)
      const guardadas = guardado?.itemsDuros.filter((item) => item.ok).length ?? 0
      chequeo.push({
        intervaloMs,
        clics: nombres.length,
        guardadas,
        perdidas: nombres.length - guardadas,
      })
      console.log(
        `chequeo   · intervalo ${String(intervaloMs).padStart(4)}ms → ${guardadas} de ${nombres.length} guardadas`,
      )
    }

    // ── 3. Ficha y brief: los otros dos blobs con autoguardado ─────────────────
    // Se escriben CAMPOS distintos en ráfaga y se relee el blob: si tuvieran la
    // carrera, el último campo escrito borraría a los anteriores.
    const escritos: Medicion[] = []
    // El STAGE importa: en CONSTRUCCION la ficha ya está cerrada (se re-sirve como
    // contexto, no como formulario) y no hay un solo campo editable en la pantalla
    // — la primera corrida se colgó esperándolos. Cada form se mide en el stage en
    // el que ES un formulario.
    for (const [paso, campos, stage] of [
      ['m1', 3, 'FICHA'],
      // EVALUADA, no BRIEF: en BRIEF la pantalla ya sirve el resumen + el
      // sanity-check, no el formulario (`m6-brief.tsx`: el form es la CAPTURA, y
      // la captura vive en EVALUADA con el gate abierto).
      ['m6', 3, 'EVALUADA'],
    ] as const) {
      const leadId = await nuevoLead(`escrito-${paso}`, undefined, stage)
      await page.goto(`${BASE_URL}/setter/leads/${leadId}/manual/${paso}`, {
        waitUntil: 'domcontentloaded',
      })
      // `input[type="text"]` NO alcanza: el `Input` compartido no estampa el
      // atributo (text es el default implícito) y el selector no matchea nada —
      // la primera corrida murió por eso, no por el objeto medido.
      const CAMPOS = 'main textarea, main input:not([type="checkbox"]):not([type="radio"])'
      await page.waitForSelector(CAMPOS, { state: 'visible', timeout: 20_000 })
      // Tres campos distintos, uno detrás de otro sin pausa.
      const tocados: number = await page.evaluate(
        `(async () => {
          const campos = Array.from(document.querySelectorAll(${JSON.stringify(CAMPOS)}))
            .filter(el => !el.disabled && !el.readOnly && el.offsetParent !== null)
            .slice(0, ${campos});
          let n = 0;
          for (const campo of campos) {
            const setter = Object.getOwnPropertyDescriptor(
              campo.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
              'value',
            ).set;
            setter.call(campo, 'p25-' + n);
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            n += 1;
          }
          return n;
        })()`,
      )
      await esperar(ASENTADO_MS + 2000)

      const dossier = await prisma.osLeadDossier.findUnique({
        where: { leadId },
        select: { fichaJson: true, briefJson: true },
      })
      const blob = paso === 'm1' ? dossier?.fichaJson : dossier?.briefJson
      const texto = JSON.stringify(blob ?? {})
      const sobrevivieron = Array.from({ length: tocados }, (_, i) => `p25-${i}`).filter((marca) =>
        texto.includes(marca),
      ).length
      escritos.push({
        intervaloMs: 0,
        clics: tocados,
        guardadas: sobrevivieron,
        perdidas: tocados - sobrevivieron,
      })
      console.log(
        `${paso === 'm1' ? 'ficha    ' : 'brief    '} · intervalo    0ms → ${sobrevivieron} de ${tocados} campos guardados`,
      )
    }

    const reporte = {
      medidoEn: new Date().toISOString(),
      baseUrl: BASE_URL,
      asentadoMs: ASENTADO_MS,
      progreso,
      chequeo,
      escritos,
    }

    if (OUT_JSON) {
      const destino = path.resolve(OUT_JSON)
      fs.mkdirSync(path.dirname(destino), { recursive: true })
      fs.writeFileSync(destino, JSON.stringify(reporte, null, 2))
      console.log(`\nJSON → ${destino}`)
    }

    // La ventana, en un número: el intervalo más chico al que NO se pierde nada.
    const limpio = progreso.find((m) => m.perdidas === 0)
    console.log(
      `\nVENTANA: ${
        limpio ? `a partir de ${limpio.intervaloMs}ms entre clics no se pierde ninguna` : 'se pierde a TODOS los ritmos medidos'
      }`,
    )

  } finally {
    // El navegador también: un error a mitad de la medición no deja un Chromium colgado.
    await browser?.close()
    // P39 — la limpieza va en el bloque que SIEMPRE corre. Afuera, cualquier error a
    // mitad de la medición (un servidor caído, un selector que no aparece) la
    // salteaba y los leads propios quedaban en la cartera de setter-qa: 38 hasta P37.
    // Limpieza por id EXACTO (el teardown del helper) — nada de borrar por prefijo.
    const cuantos = tracker.leadIds.length
    await teardown(tracker)
    console.log(`limpieza: ${cuantos} leads borrados por id exacto`)
    await disconnect()
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
