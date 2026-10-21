/**
 * [SERVICIOS V1] P-H26 · LA SONDA DEL FOCO AL CERRAR EL CONTACTO, en `/v3/paginas-web` — la nuestra del R1 (`diag-foco.cjs`, con los pasos de
 * `docs/servicios/SPRINT-R1.md` §5.1), con los tres CTA de la página: el del precio, el del llamado y el del cierre. Por cierre: el CTA a la
 * vista, 2 s, foco + Enter, esperar la hoja, 1,6 s, Esc, esperar que se vaya, 1,5 s y mirar `document.activeElement`. Una carga de la página
 * por CTA (el home midió que a 390 la página se cae después de ~21 aperturas seguidas). El Chrome del sistema a la vista y `/api/`
 * bloqueado: nunca envía el formulario ni llama a nada.
 *
 *   ANCHOS=1440x900,1024x768,390x844 VUELTAS=12 npx tsx scripts-servicios/foco-del-contacto.ts
 *   BUSQUEDA=?devolucion=un-cuadro …   el control positivo: la devolución de antes (un cuadro después de la salida); tiene que fallar
 *
 * El criterio: 0 cierres con el foco en BODY (ni en ningún otro lado que no sea el botón) en 3 CTA × 3 anchos × 12 = 108.
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { DATOS, abrir, anchosDe, dormir } from './navegador'

const ANCHOS = anchosDe(process.env.ANCHOS, '1440x900,1024x768,390x844')
const VUELTAS = Number(process.env.VUELTAS ?? '12')
const BUSQUEDA = process.env.BUSQUEDA ?? ''
const SALIDA = path.join(DATOS, 'foco')
const DIALOGO = '[data-pieza="contacto"] [role="dialog"]'
const CTAS = ['llamado-del-precio', 'llamado', 'cierre'] as const

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let total = 0
  let bienTotal = 0
  const enBody: string[] = []
  for (const [ancho, alto] of ANCHOS) {
    // Un Chrome por ancho; la página, cargada de nuevo para cada CTA (la caída del home a ~21 aperturas es de una misma carga).
    const { ctx, p, log } = await abrir(`foco-${String(ancho)}`, ancho, alto, `/v3/paginas-web${BUSQUEDA}`)
    for (const cta of CTAS) {
      const fuera: { readonly vuelta: number; readonly activo: string }[] = []
      let bien = 0
      const api = log.api.length
      const errores = log.errores.length
      try {
        if (cta !== CTAS[0]) await p.goto(`${new URL(p.url()).origin}/v3/paginas-web${BUSQUEDA}`, { waitUntil: 'load', timeout: 300000 })
        await p.waitForSelector(`[data-bloque="${cta}"] [data-abre-contacto="panel"] button`, { timeout: 120000 })
        await dormir(2500)
        const boton = p.locator(`[data-bloque="${cta}"] [data-abre-contacto="panel"] button`).first()
        for (let v = 1; v <= VUELTAS; v++) {
          await boton.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
          await dormir(2000)
          await boton.focus()
          await p.keyboard.press('Enter')
          const abrio = await p.waitForSelector(DIALOGO, { state: 'attached', timeout: 10000 }).then(
            () => true,
            () => false,
          )
          if (!abrio) {
            fuera.push({ vuelta: v, activo: 'NO ABRIÓ' })
            continue
          }
          await dormir(1600)
          await p.keyboard.press('Escape')
          await p.waitForSelector(DIALOGO, { state: 'detached', timeout: 10000 })
          await dormir(1500)
          const r = await boton.evaluate((e) => {
            const a = document.activeElement
            const pieza = a?.closest('[data-bloque]')?.getAttribute('data-bloque') ?? a?.closest('[data-pieza]')?.getAttribute('data-pieza') ?? '?'
            return { enElBoton: a === e, activo: a === document.body ? 'BODY' : `${a?.tagName ?? 'null'}@${pieza}` }
          })
          if (r.enElBoton) bien += 1
          else fuera.push({ vuelta: v, activo: r.activo })
        }
      } catch (e) {
        fuera.push({ vuelta: -1, activo: `excepcion: ${String(e).slice(0, 160)}` })
      }
      total += VUELTAS
      bienTotal += bien
      for (const f of fuera) if (f.activo === 'BODY') enBody.push(`${String(ancho)} ${cta} vuelta ${String(f.vuelta)}`)
      const fila = { ancho, cta, busqueda: BUSQUEDA, vueltas: VUELTAS, bien, fuera, api: log.api.length - api, errores: log.errores.slice(errores) }
      appendFileSync(path.join(SALIDA, 'foco.jsonl'), `${JSON.stringify(fila)}\n`)
      console.log(`${String(ancho)}${BUSQUEDA} · ${cta}: ${String(bien)} de ${String(VUELTAS)} con el foco en el botón${fuera.length > 0 ? ` · fuera: ${JSON.stringify(fuera)}` : ''} · api ${String(log.api.length - api)} · errores ${String(log.errores.length - errores)}`)
    }
    await ctx.close()
  }
  console.log(`foco${BUSQUEDA}: ${String(bienTotal)} de ${String(total)} cierres con el foco en el botón; en BODY: ${String(enBody.length)}${enBody.length > 0 ? ` (${enBody.join('; ')})` : ''}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
