/**
 * [SERVICIOS V1] P-H27 · LA PAUSA DEL VIDEO DE TRABAJOS, EN EL NAVEGADOR — la del home (`BotonPausa`), sólo para el teclado, como el panel
 * después de su F7. En `/v3/paginas-web`, con el Chrome del sistema a la vista y `/api/` bloqueado. Nunca envía nada.
 *
 *   ANCHOS=1440x900,390x844 npx tsx scripts-servicios/pausa.ts
 *   REDUCIDO=1 npx tsx scripts-servicios/pausa.ts                 con movimiento reducido: sin botón y sin <video>, el póster
 *   CONTROL=a-la-vista npx tsx scripts-servicios/pausa.ts         el control: una hoja que la deja a la vista y con puntero (tiene que FALLAR)
 *
 * Lo que tiene que dar, por ancho:
 * · la pausa es la del home: un `[data-pieza="boton-pausa"]` en el slot de trabajos, «Pausar el video de trabajos», sin apretar; ninguna
 *   pausa propia (`[data-pieza="pausa-del-video"]`);
 * · con el mouse no existe: con el video andando, su caja mide 0 × 0, en su centro el puntero encuentra otra cosa, y un clic ahí no la
 *   aprieta (el video sigue andando);
 * · con Tab aparece: el Tab desde el control anterior la enfoca con `:focus-visible`, mide 48 × 48 adentro del cuadro; Enter la aprieta
 *   (el video se pausa) y Enter la suelta (anda otra vez);
 * · el ícono, con foco, contra el peor píxel de su disco (sin el ícono), con el video andando: 3:1 o más (un gráfico);
 * · con movimiento reducido: ni botón ni `<video>`, el póster a la vista.
 */
import path from 'node:path'

import type { Page } from '@playwright/test'

import { DATOS, abrir, anchosDe, capturar, colorResuelto, dormir, peorContraste, pixeles } from './navegador'

const ANCHOS = anchosDe(process.env.ANCHOS, '1440x900,390x844')
const REDUCIDO = process.env.REDUCIDO === '1'
const CONTROL_A_LA_VISTA = process.env.CONTROL === 'a-la-vista'
const SALIDA = path.join(DATOS, 'pausa')
const BOTON = '[data-bloque="trabajos"] [data-pieza="boton-pausa"]'
const NOMBRE = 'Pausar el video de trabajos'

interface DelVideo {
  readonly anda: boolean
  readonly t: number
}

const delVideo = async (p: Page): Promise<DelVideo | null> =>
  p.evaluate(async () => {
    const v = document.querySelector<HTMLVideoElement>('[data-bloque="trabajos"] video')
    if (v === null) return null
    const t0 = v.currentTime
    await new Promise((r) => setTimeout(r, 600))
    return { anda: !v.paused && v.currentTime > t0, t: v.currentTime }
  })

async function main(): Promise<void> {
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const nombre = `pausa-${String(ancho)}${REDUCIDO ? '-reducido' : ''}${CONTROL_A_LA_VISTA ? '-control' : ''}`
    const { ctx, p, log } = await abrir(nombre, ancho, alto, '/v3/paginas-web', { reducido: REDUCIDO })
    const fallas: string[] = []
    const datos: Record<string, unknown> = {}
    try {
      await p.waitForSelector('[data-bloque="trabajos"]', { timeout: 120000 })
      await dormir(2500)
      if (CONTROL_A_LA_VISTA) await p.addStyleTag({ content: '[data-pieza="boton-pausa"] { scale: 1 !important; pointer-events: auto !important; }' })
      // El slot a la vista y el scroll quieto: el video pide su fuente al acercarse y anda con el scroll quieto.
      await p.evaluate(() => document.querySelector('[data-bloque="trabajos"]')?.scrollIntoView({ block: 'start', behavior: 'instant' }))
      await dormir(3000)
      const propia = await p.locator('[data-pieza="pausa-del-video"]').count()
      const delHome = await p.locator(BOTON).count()
      datos.propia = propia
      datos.delHome = delHome
      if (REDUCIDO) {
        const r = await p.evaluate(() => {
          const s = document.querySelector('[data-bloque="trabajos"]')
          const posters = [...(s?.querySelectorAll('img') ?? [])].filter((i) => i.getClientRects().length > 0 && getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0)
          return { videos: s?.querySelectorAll('video').length ?? -1, posters: posters.length, cargados: posters.filter((i) => i.complete && i.naturalWidth > 0).length }
        })
        datos.reducido = r
        if (delHome + propia !== 0) fallas.push('reducido-con-boton')
        if (r.videos !== 0) fallas.push('reducido-con-video')
        if (r.posters < 1 || r.cargados < 1) fallas.push('reducido-sin-poster')
        await capturar(p, path.join(SALIDA, `${nombre}.png`))
      } else {
        if (propia !== 0) fallas.push('pausa-propia')
        if (delHome !== 1) fallas.push('sin-la-del-home')
        const boton = p.locator(BOTON).first()
        const rotulo = delHome === 1 ? await boton.getAttribute('aria-label') : null
        const apretado = delHome === 1 ? await boton.getAttribute('aria-pressed') : null
        datos.rotulo = rotulo
        if (rotulo !== NOMBRE || apretado !== 'false') fallas.push('nombre-o-estado')
        const objetivo = delHome === 1 ? BOTON : '[data-pieza="pausa-del-video"]'
        // El botón en el medio del cuadro (abajo a la derecha del slot quedaba debajo del borde) y el scroll quieto: el video anda.
        await p.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center', behavior: 'instant' }), objetivo)
        await dormir(2500)
        // Con el mouse: la caja transformada, qué encuentra el puntero en su centro y un clic de verdad ahí.
        const antes = await delVideo(p)
        datos.videoAntes = antes
        if (antes?.anda !== true) fallas.push('el-video-no-anda')
        const caja = await p.evaluate((sel) => {
          const b = document.querySelector<HTMLElement>(sel)
          if (b === null) return null
          const r = b.getBoundingClientRect()
          // El centro de la caja SIN transformar (la escala se hace alrededor del centro): donde estaría el botón.
          const cx = r.left + r.width / 2
          const cy = r.top + r.height / 2
          const enElCentro = document.elementFromPoint(cx, cy)
          return { ancho: r.width, alto: r.height, cx, cy, adentro: cx > 0 && cx < innerWidth && cy > 0 && cy < innerHeight, lo: enElCentro === b || (enElCentro !== null && b.contains(enElCentro)) }
        }, objetivo)
        datos.conElMouse = caja
        if (caja === null) fallas.push('sin-boton')
        else if (!caja.adentro) fallas.push('medida-fuera-del-cuadro')
        else {
          await p.mouse.move(caja.cx, caja.cy)
          await dormir(400)
          const conElPuntero = await p.evaluate((sel) => {
            const b = document.querySelector<HTMLElement>(sel)
            const r = b?.getBoundingClientRect()
            return { ancho: r?.width ?? -1, hover: b?.matches(':hover') ?? false }
          }, objetivo)
          await capturar(p, path.join(SALIDA, `${nombre}-mouse.png`))
          await p.mouse.click(caja.cx, caja.cy)
          await dormir(800)
          const despues = await p.locator(objetivo).first().getAttribute('aria-pressed')
          const video = await delVideo(p)
          datos.conElMouse = { ...caja, conElPuntero, despuesDelClic: despues, video }
          if (caja.ancho > 0.5 || caja.alto > 0.5 || conElPuntero.ancho > 0.5) fallas.push('a-la-vista-con-el-mouse')
          if (caja.lo || conElPuntero.hover) fallas.push('el-puntero-la-toca')
          if (despues !== 'false' || video?.anda !== true) fallas.push('el-clic-la-aprieta')
          if (despues === 'true') await p.locator(objetivo).first().evaluate((b) => (b as HTMLButtonElement).click())
        }
        // Con Tab: desde el control anterior en el orden del documento.
        const previo = await p.evaluate((sel) => {
          const b = document.querySelector(sel)
          const enfocables = [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter((e) => !e.closest('[data-pieza="contacto"]') && !e.hasAttribute('disabled') && e.tabIndex >= 0)
          const i = b === null ? -1 : enfocables.indexOf(b as HTMLElement)
          const anterior = i > 0 ? enfocables[i - 1] : undefined
          if (anterior === undefined) return null
          anterior.setAttribute('data-banco-previo', '')
          return anterior.tagName
        }, objetivo)
        datos.previo = previo
        if (previo === null) fallas.push('sin-control-previo')
        else {
          await p.focus('[data-banco-previo]')
          await p.keyboard.press('Tab')
          await dormir(300)
          const conTab = await p.evaluate((sel) => {
            const b = document.querySelector<HTMLElement>(sel)
            const r = b?.getBoundingClientRect()
            return { enfocado: document.activeElement === b, visible: b?.matches(':focus-visible') ?? false, ancho: r?.width ?? 0, alto: r?.height ?? 0, adentro: r !== undefined && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, color: b === null ? '' : getComputedStyle(b).color }
          }, objetivo)
          datos.conTab = conTab
          if (!conTab.enfocado || !conTab.visible || Math.abs(conTab.ancho - 48) > 1 || Math.abs(conTab.alto - 48) > 1 || !conTab.adentro) fallas.push('con-tab')
          await capturar(p, path.join(SALIDA, `${nombre}-tab.png`))
          // El ícono contra el peor píxel de su disco, sin el ícono, con el video andando (cinco cuadros).
          if (conTab.enfocado) {
            const icono = await p.evaluate((sel) => {
              const s = document.querySelector(`${sel} svg`)
              const r = s?.getBoundingClientRect()
              return r === undefined ? null : { x: r.left, y: r.top, ancho: r.width, alto: r.height }
            }, objetivo)
            const tinta = await colorResuelto(p, conTab.color)
            let peor = Number.POSITIVE_INFINITY
            if (icono !== null) {
              await p.evaluate((sel) => document.querySelector<SVGElement>(`${sel} svg`)?.style.setProperty('visibility', 'hidden'), objetivo)
              for (let k = 0; k < 5; k++) {
                const png = await capturar(p, path.join(SALIDA, `${nombre}-disco-${String(k)}.png`), { x: Math.floor(icono.x), y: Math.floor(icono.y), width: Math.ceil(icono.ancho) + 1, height: Math.ceil(icono.alto) + 1 })
                const fondo = await pixeles(png)
                peor = Math.min(peor, peorContraste(fondo, tinta, [{ x: 0, y: 0, ancho: fondo.ancho, alto: fondo.alto }]).peor)
                await dormir(400)
              }
              await p.evaluate((sel) => document.querySelector<SVGElement>(`${sel} svg`)?.style.removeProperty('visibility'), objetivo)
              await p.focus(objetivo)
            }
            datos.icono = { tinta, peor }
            if (!(peor >= 3)) fallas.push('contraste-del-icono')
            // Enter la aprieta y el video se pausa; Enter la suelta y anda.
            await p.keyboard.press('Enter')
            await dormir(700)
            const pausado = { apretado: await p.locator(objetivo).first().getAttribute('aria-pressed'), video: await delVideo(p) }
            await p.keyboard.press('Enter')
            await dormir(1500)
            const suelto = { apretado: await p.locator(objetivo).first().getAttribute('aria-pressed'), video: await delVideo(p) }
            datos.conEnter = { pausado, suelto }
            if (pausado.apretado !== 'true' || pausado.video?.anda !== false) fallas.push('enter-no-pausa')
            if (suelto.apretado !== 'false' || suelto.video?.anda !== true) fallas.push('enter-no-suelta')
          }
        }
      }
      if (log.errores.length > 0) fallas.push('errores')
      if (log.api.length > 0) fallas.push('api')
    } catch (e) {
      fallas.push(`excepcion: ${String(e).slice(0, 200)}`)
    } finally {
      await ctx.close()
    }
    if (fallas.length > 0) malas += 1
    console.log(`${fallas.length === 0 ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)}${REDUCIDO ? ' reducido' : ''}${CONTROL_A_LA_VISTA ? ' (control)' : ''} · ${JSON.stringify(datos)}${fallas.length === 0 ? '' : ` · ${fallas.join(',')}`} · errores ${String(log.errores.length)} · api ${String(log.api.length)}`)
    for (const e of log.errores) console.log(`   error: ${e}`)
  }
  console.log(`pausa: ${String(ANCHOS.length - malas)} de ${String(ANCHOS.length)} anchos bien`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
