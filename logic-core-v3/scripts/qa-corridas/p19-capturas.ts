/**
 * P19 — Las capturas de la verificación, operando la aplicación.
 *
 *   MEDIR_BASE_URL=http://127.0.0.1:3030 npx tsx scripts/qa-corridas/p19-capturas.ts
 *
 * Siembra los estados exactos que el sprint arregla, abre cada uno con una
 * sesión real de setter (mismo minteo de JWT que `medir-pliegue-manual.ts`),
 * captura, y BORRA lo que sembró. No mide: muestra.
 *
 * Los estados sembrados son los mismos que fija `tests/setter/24-…`; acá viven
 * el tiempo de la corrida y se limpian en el `finally`.
 */
import { chromium } from '@playwright/test'
import { encode } from 'next-auth/jwt'
import { mkdirSync } from 'node:fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const BASE_URL = process.env.MEDIR_BASE_URL ?? 'http://127.0.0.1:3030'
const SHOTS = process.env.P19_SHOTS ?? 'docs/proof-screenshots/p19'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const DIA = 24 * 60 * 60 * 1000

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true },
  })
  if (!setter) throw new Error('falta el setter de QA (setter-qa@develop.test)')

  const ficha = {
    identidad: { negocio: 'P19', instagram: '@p19', seguidores: '3k', ubicacion: 'Centro' },
    senalesOperativas: 'pedidos por DM',
  }
  const evaluacion = {
    score: 3,
    veredicto: 'AVANZAR',
    fecha: new Date().toISOString(),
    razones: 'tiene con qué',
  }
  const brief = {
    secciones: 'hero, servicios, contacto',
    promesa: 'turnos sin fricción',
    cta: 'WhatsApp',
  }
  const rechazo = {
    fecha: new Date().toISOString(),
    motivo: 'El hero no dice a qué se dedica el negocio',
    donde: 'Sección hero',
    detalle: 'Se lee un titular genérico',
    arreglo: 'Poné el rubro y la zona en el titular',
  }

  const creados: string[] = []
  const nuevo = async (
    nombre: string,
    data: Record<string, unknown>,
    dossier: Record<string, unknown>,
  ) => {
    const lead = await prisma.osLead.create({
      data: {
        businessName: nombre,
        industry: 'gastronomia',
        zone: 'Centro',
        instagramUrl: 'https://instagram.com/p19',
        phone: '5493815550000',
        assignedToId: setter.id,
        ...data,
        dossier: { create: dossier },
      } as never,
      select: { id: true },
    })
    creados.push(lead.id)
    return lead.id
  }

  try {
    // ① y ② — el MISMO estado, con la fecha de reactivación de los dos lados.
    const pausado = await nuevo(
      'P19-CAP Pausado Futuro',
      { status: 'POSTERGADO', reactivateAt: new Date(Date.now() + 7 * DIA) },
      { stage: 'BRIEF', fichaJson: ficha, evaluacionJson: evaluacion, briefJson: brief },
    )
    const vencido = await nuevo(
      'P19-CAP Pausado Vencido',
      { status: 'POSTERGADO', reactivateAt: new Date(Date.now() - 3 * DIA) },
      { stage: 'BRIEF', fichaJson: ficha, evaluacionJson: evaluacion, briefJson: brief },
    )
    // ④ y ⑤ — el re-loop tal cual llega: checklist COMPLETO de la vuelta anterior.
    const rechazado = await nuevo(
      'P19-CAP Rechazado',
      { status: 'RESPONDIO' },
      {
        stage: 'RECHAZADA',
        fichaJson: ficha,
        evaluacionJson: evaluacion,
        briefJson: brief,
        draftUrl: 'https://p19-cap-draft.netlify.app',
        rechazos: [rechazo],
        progresoJson: {
          completadas: [
            'estructura',
            'personalizacion',
            'assets',
            'cta',
            'calidad',
            'mobile',
          ],
        },
      },
    )

    mkdirSync(SHOTS, { recursive: true })
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
    const browser = await chromium.launch({
      args: ['--no-proxy-server', '--proxy-bypass-list=*'],
    })
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
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

    const capturar = async (nombre: string, url: string) => {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(700)
      const titulo = await page
        .locator('main h1, main h2')
        .filter({ visible: true })
        .first()
        .textContent()
        .catch(() => null)
      const barra = await page
        .locator('[data-slot="barra-accion"] button, [data-slot="barra-accion"] a')
        .filter({ visible: true })
        .first()
        .textContent()
        .catch(() => null)
      await page.screenshot({ path: `${SHOTS}/${nombre}.png` })
      console.log(
        `${nombre.padEnd(30)} ${page.url().replace(BASE_URL, '').padEnd(52)} ` +
          `título="${(titulo ?? '—').trim()}"  barra="${(barra ?? '—').trim()}"`,
      )
    }

    console.log(`\nCAPTURAS P19 — ${BASE_URL} · 1440×900\n`)
    // `m3` es un id RETIRADO del mapa: la guardia redirige cualquier id
    // desconocido a la pantalla que la derivación considera actual. Es la forma
    // de PREGUNTARLE a la derivación dónde está el lead — pedir `m1` no sirve,
    // porque en cualquier stage posterior a FICHA está completada, o sea
    // accesible, y la página la renderiza sin redirigir a ningún lado.
    await capturar('1-pausado-futuro', `/setter/leads/${pausado}/manual/m3`)
    await capturar('2-pausado-vencido', `/setter/leads/${vencido}/manual/m3`)
    await capturar('3-foco-no-prometido', '/setter/nuevo')
    await capturar('4-correcciones-mr', `/setter/leads/${rechazado}/manual/mr`)

    // ⑤ — el aterrizaje del re-loop, apretando el botón real de la barra.
    await page.getByRole('button', { name: 'Reabrir construcción' }).first().click()
    await page.waitForURL(/\/manual\/(mc1|m14|m13|mc2)$/, { timeout: 15_000 })
    await page.waitForTimeout(900)
    await capturar('5-reabrir-aterriza', new URL(page.url()).pathname)

    await browser.close()
  } finally {
    if (creados.length > 0) {
      await prisma.osLead.deleteMany({ where: { id: { in: creados } } })
      console.log(`\nlimpieza: ${creados.length} leads de captura borrados`)
    }
    await prisma.$disconnect()
  }
}

void main()
