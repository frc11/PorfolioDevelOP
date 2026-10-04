/**
 * PASADA FINAL · D — EL RECORRIDO DEL DEV SENIOR: npx tsx scripts-pasada/d-recorrido.ts [ancho alto]
 *
 * Recorre /v3 entera de a media pantalla (con esperas) y anota, en cada paso, si algo se sale a lo ancho (el documento
 * más ancho que la ventana, y qué elementos cruzan el borde derecho, con su sección); al final, los errores y avisos
 * de la consola, los controles sin nombre accesible y las imágenes sin `alt`. Deja una captura por paso y una hoja
 * por ancho en `~/.cache/b4-medicion/pasada-final/d/<ancho>/`. Pide el servidor y `BANCO_GPU=alta`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { captura, esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]
const SALIDA = `C:/Users/Valentino/.cache/b4-medicion/pasada-final/d/${String(ANCHO)}`

const DESBORDE = `(() => {
  const ancho = document.documentElement.clientWidth
  const doc = document.documentElement.scrollWidth
  const fuera = []
  if (doc > ancho) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.right <= ancho + 0.5) continue
      const st = getComputedStyle(el)
      if (st.position === 'fixed') continue
      const s = el.closest('[data-panel]')
      fuera.push({ que: el.tagName.toLowerCase() + (el.getAttribute('data-pieza') ? '[' + el.getAttribute('data-pieza') + ']' : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 3).join('.') : ''), derecha: Math.round(r.right), seccion: s ? s.getAttribute('data-panel') : null })
      if (fuera.length > 12) break
    }
  }
  return { ancho, doc, fuera }
})()`

const SIN_NOMBRE = `(() => {
  const nombre = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.textContent || '').trim()
  const controles = [...document.querySelectorAll('button, a[href], [role="button"], input:not([type="hidden"]), select, textarea')].filter((el) => {
    if (el.closest('[aria-hidden="true"]') || el.closest('[inert]')) return false
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return !(el.labels && el.labels.length > 0) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')
    return nombre(el) === '' && !el.querySelector('img[alt]:not([alt=""]), svg[aria-label], [aria-label]')
  }).slice(0, 20).map((el) => el.outerHTML.slice(0, 140))
  const imagenes = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).slice(0, 10).map((i) => i.outerHTML.slice(0, 120))
  return { controles, imagenes }
})()`

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrir('producto', ANCHO, ALTO)
  const consola: string[] = []
  b.p.conexion.al('Runtime.consoleAPICalled', (params) => {
    const tipo = String(params.type)
    if (tipo !== 'error' && tipo !== 'warning' && tipo !== 'warn') return
    const args = (params.args as { value?: unknown; description?: string }[]).map((a) => String(a.value ?? a.description ?? '')).join(' ')
    consola.push(`${tipo}: ${args.slice(0, 220)}`)
  })
  b.p.conexion.al('Runtime.exceptionThrown', (params) => {
    const d = params.exceptionDetails as { text?: string; exception?: { description?: string } }
    consola.push(`excepción: ${(d.exception?.description ?? d.text ?? '').slice(0, 260)}`)
  })
  await b.p.conexion.enviar('Runtime.enable', {}, b.p.sessionId)
  const informe: Record<string, unknown> = { ancho: ANCHO, alto: ALTO }
  const pasos: Record<string, unknown>[] = []
  try {
    await mover(b, 8, Math.round(ALTO / 2))
    const total = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    let k = 0
    for (let y = 0; y <= total; y += Math.round(ALTO / 2)) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(900)
      const d = await medir<{ ancho: number; doc: number; fuera: unknown[] }>(b.p, DESBORDE)
      const seccion = await medir<string | null>(b.p, `(() => { const el = document.elementFromPoint(${String(Math.round(ANCHO / 2))}, ${String(Math.round(ALTO / 2))}); const s = el && el.closest('[data-panel]'); return s ? s.getAttribute('data-panel') : null })()`)
      pasos.push({ y, seccion, ...d })
      await captura(b, `${SALIDA}/p${String(k).padStart(3, '0')}.png`)
      k += 1
    }
    informe.desbordes = pasos.filter((p) => (p as { doc: number; ancho: number }).doc > (p as { ancho: number }).ancho)
    informe.accesibilidad = await medir(b.p, SIN_NOMBRE)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', `${SALIDA}/p%03d.png`, '-vf', `scale=${String(Math.round(ANCHO / 4))}:-2,tile=8x8`, `${SALIDA}/hoja-%02d.png`])
  } finally {
    informe.consola = [...new Set(consola)].slice(0, 40)
    informe.pasos = pasos.map((p) => ({ y: p.y, seccion: p.seccion, doc: p.doc }))
    writeFileSync(`${SALIDA}/informe.json`, JSON.stringify(informe, null, 1))
    console.log(JSON.stringify({ ancho: ANCHO, pasos: pasos.length, desbordes: (informe.desbordes as unknown[] | undefined)?.length ?? null, consola: (informe.consola as unknown[]).length }))
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('d-recorrido.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
