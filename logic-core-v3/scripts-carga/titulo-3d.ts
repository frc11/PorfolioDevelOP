/**
 * [B12a.8] T4 · EL TÍTULO DE LA PÁGINA EN 3D, COMO LOS DEL HOME — `/v3/pagina-base?composicion=1|2|3` con el Chrome del sistema a la vista,
 * el banco de la escena (`__titulosDelBanco`) y `/api/` bloqueado. Por composición y ancho:
 *   · desde 1024 (la regla de los títulos del home: `CONSULTA_ESCENARIO`), el 3D montado: las dos partes armadas, colocadas y llegadas;
 *     abajo de 1024, el `h1` del DOM a la vista y ningún título en volumen (como en el home a ese ancho);
 *   · el `h1` oculto a la vista mientras el 3D está (sus partes en opacidad 0) y en el árbol accesible (ni `aria-hidden` ni `display: none`);
 *   · la perspectiva con el mouse: el mouse a la izquierda y a la derecha del cuadro (quieto hasta que la cámara asienta), la caja del
 *     título en el cuadro se corre (fijo en el mundo, la cámara lo muestra desde otro lado); el control (`CONTROL=pegado-al-h1`, el título
 *     pegado a la pantalla de B12a.6) no se corre;
 *   · la entrada: desde que se arma, su llegada sube hasta 1 (el gesto del titular del hero);
 *   · la salida: al pasar el tramo del título, su llegada baja a 0 y la caja BAJA mientras se va (cae; nunca sube), y vuelve al subir.
 *
 *   BASE=http://localhost:3004 npx tsx scripts-carga/titulo-3d.ts        (ANCHOS=…, COMPOSICIONES=…, CONTROL=pegado-al-h1)
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3004'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1280x800,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const COMPOSICIONES = (process.env.COMPOSICIONES ?? '1,2,3').split(',')
const CONTROL = process.env.CONTROL ?? ''
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/titulo-3d')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface DelBanco {
  readonly id: string
  readonly llegada: number
  readonly mostrado: { readonly llegada: number }
  readonly visible: boolean
  readonly colocado: boolean
  readonly enElCuadro: { readonly izquierda: number; readonly derecha: number; readonly arriba: number; readonly abajo: number }
}

const titulos = (p: Page): Promise<DelBanco[]> =>
  p.evaluate(() => ((window as unknown as { __titulosDelBanco?: { titulos: () => DelBanco[] } }).__titulosDelBanco?.titulos() ?? []).filter((t) => t.id.startsWith('pagina-')))

const delH1 = (p: Page): Promise<{ readonly opacidades: number[]; readonly accesible: boolean; readonly texto: string }> =>
  p.evaluate(() => {
    const h1 = document.querySelector<HTMLElement>('[data-intro-de-pagina] h1')
    const partes = [...document.querySelectorAll<HTMLElement>('[data-intro-de-pagina] h1 [data-parte^="titulo-"]')]
    let accesible = h1 !== null
    for (let el: HTMLElement | null = h1; el !== null; el = el.parentElement) if (el.getAttribute('aria-hidden') === 'true' || getComputedStyle(el).display === 'none') accesible = false
    return { opacidades: partes.map((x) => Number(getComputedStyle(x).opacity)), accesible, texto: h1?.textContent ?? '' }
  })

/** Con el mouse en un extremo: la caja del título contra el cuadro, la píldora y la bajada (que en el home va en el plano de su título). */
const enElExtremo = (p: Page, ts: readonly DelBanco[]): Promise<{ readonly titulo: { readonly izq: number; readonly der: number; readonly arr: number; readonly aba: number }; readonly pildora: number; readonly bajada: { readonly arr: number; readonly izq: number; readonly der: number; readonly enElPlano: boolean } | null; readonly ancho: number }> =>
  p.evaluate((caja) => {
    const pil = document.querySelector('[data-pieza="barra"] > [data-parte="pastilla"]')?.getBoundingClientRect()
    const elBaj = document.querySelector<HTMLElement>('[data-intro-de-pagina] [data-parte="bajada"]')
    const baj = elBaj?.getBoundingClientRect()
    return { titulo: caja, pildora: pil === undefined || pil.width === 0 ? 0 : pil.bottom, bajada: baj === undefined || baj.width === 0 || elBaj === null || elBaj === undefined ? null : { arr: baj.top, izq: baj.left, der: baj.right, enElPlano: elBaj.style.transform.startsWith('matrix3d(') }, ancho: window.innerWidth }
  }, { izq: Math.min(...ts.map((x) => x.enElCuadro.izquierda)), der: Math.max(...ts.map((x) => x.enElCuadro.derecha)), arr: Math.min(...ts.map((x) => x.enElCuadro.arriba)), aba: Math.max(...ts.map((x) => x.enElCuadro.abajo)) })

/**
 * Lo que falla en un extremo: fuera del cuadro (8 px de margen), sobre la píldora, o la bajada fuera del plano del título (como en el hero:
 * coplanares, la distancia es la del DOM). La caja del título inclinado contra la de la bajada se informa: es la que encierra el cuadrilátero
 * proyectado y baja por el lado lejano aunque las letras no se toquen (visto en las capturas).
 */
const problemasDelExtremo = (e: Awaited<ReturnType<typeof enElExtremo>>): string[] => {
  const r: string[] = []
  if (e.titulo.izq < 8 || e.titulo.der > e.ancho - 8) r.push(`fuera del cuadro (${e.titulo.izq.toFixed(0)}..${e.titulo.der.toFixed(0)} de ${String(e.ancho)})`)
  if (e.titulo.arr < e.pildora + 4) r.push(`sobre la píldora (arriba ${e.titulo.arr.toFixed(0)}, la píldora hasta ${e.pildora.toFixed(0)})`)
  if (e.bajada !== null && !e.bajada.enElPlano) r.push(`la bajada fuera del plano del título (la caja del título hasta ${e.titulo.aba.toFixed(0)}, la bajada desde ${e.bajada.arr.toFixed(0)})`)
  return r
}

/** El centro de la caja del título (las dos partes) en el cuadro. */
const centro = (ts: readonly DelBanco[]): { readonly x: number; readonly y: number; readonly ancho: number } => {
  const izq = Math.min(...ts.map((t) => t.enElCuadro.izquierda))
  const der = Math.max(...ts.map((t) => t.enElCuadro.derecha))
  const arr = Math.min(...ts.map((t) => t.enElCuadro.arriba))
  const aba = Math.max(...ts.map((t) => t.enElCuadro.abajo))
  return { x: (izq + der) / 2, y: (arr + aba) / 2, ancho: der - izq }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const fallas: string[] = []
  for (const [ancho, alto] of ANCHOS) {
    const movil = ancho < 1024
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/titulo-3d-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; window.__defectosDeLaIntro = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      for (const c of COMPOSICIONES) {
        await p.mouse.move(ancho / 2, alto / 2)
        await p.goto(`${BASE}/v3/pagina-base?composicion=${c}`, { waitUntil: 'load', timeout: 300000 })
        // La entrada: la llegada de cada parte desde que se arma, cada 100 ms durante 5 s.
        const llegadas: number[] = []
        for (let k = 0; k < 50; k += 1) {
          const ts = await titulos(p)
          llegadas.push(ts.length === 0 ? -1 : Math.min(...ts.map((t) => t.mostrado.llegada)))
          await dormir(100)
        }
        await dormir(1500)
        const ts = await titulos(p)
        const h1 = await delH1(p)
        const montado = ts.length === 2 && ts.every((t) => t.visible && t.colocado && t.mostrado.llegada > 0.99)
        if (movil) {
          const bien = ts.every((t) => !t.visible) && h1.opacidades.every((o) => o === 1) && h1.accesible
          console.log(`${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ?composicion=${c} · abajo de 1024 (como el home): el \`h1\` del DOM a la vista (${h1.opacidades.join(', ')}), ${String(ts.filter((t) => t.visible).length)} títulos en volumen a la vista`)
          if (!bien) fallas.push(`${String(ancho)} c${c}`)
          await p.screenshot({ path: path.join(SALIDA, `c${c}-${String(ancho)}${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
          continue
        }
        const armadoEn = llegadas.findIndex((l) => l >= 0)
        const tramo = armadoEn < 0 ? [] : llegadas.slice(armadoEn)
        const sube = tramo.length > 2 && (tramo[0] ?? 1) < 0.5 && tramo.every((l, k) => k === 0 || l >= (tramo[k - 1] ?? 0) - 1e-3)
        const oculto = h1.opacidades.every((o) => o === 0) && h1.accesible
        // La perspectiva: el mouse a un costado y al otro, quieto hasta que la cámara asienta.
        await p.mouse.move(ancho * 0.08, alto / 2, { steps: 12 })
        await dormir(1800)
        const izq = centro(await titulos(p))
        await p.mouse.move(ancho * 0.92, alto / 2, { steps: 24 })
        await dormir(1800)
        const tsDer = await titulos(p)
        const der = centro(tsDer)
        const problemas = problemasDelExtremo(await enElExtremo(p, tsDer)).map((x) => `el mouse a la derecha: ${x}`)
        await p.screenshot({ path: path.join(SALIDA, `c${c}-${String(ancho)}-mouse-derecha${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
        await p.mouse.move(ancho * 0.08, alto / 2, { steps: 24 })
        await dormir(1800)
        problemas.push(...problemasDelExtremo(await enElExtremo(p, await titulos(p))).map((x) => `el mouse a la izquierda: ${x}`))
        await p.screenshot({ path: path.join(SALIDA, `c${c}-${String(ancho)}-mouse-izquierda${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
        await p.mouse.move(ancho / 2, alto / 2, { steps: 12 })
        await dormir(1800)
        const corrida = Math.hypot(der.x - izq.x, der.y - izq.y)
        const perspectiva = corrida > 4 || Math.abs(der.ancho - izq.ancho) > 2
        // La salida: la rueda hasta pasar el tramo del título; la llegada y la caja cada 60 ms.
        const pasos: { llegada: number; abajo: number }[] = []
        for (let k = 0; k < 40; k += 1) {
          await p.mouse.wheel(0, 70)
          await dormir(60)
          const t = await titulos(p)
          if (t.length > 0) pasos.push({ llegada: Math.min(...t.map((x) => x.mostrado.llegada)), abajo: Math.max(...t.map((x) => x.enElCuadro.abajo)) })
        }
        await dormir(1500)
        const fuera = await titulos(p)
        const seFue = fuera.length > 0 && fuera.every((t) => t.mostrado.llegada < 0.01)
        // Mientras se va (la llegada entre 0,9 y 0,1) la caja baja con respecto al scroll (cae): se informa la variación del borde de abajo.
        const yendo = pasos.filter((x) => x.llegada < 0.9 && x.llegada > 0.1)
        const cae = yendo.length < 2 || (yendo[yendo.length - 1]?.abajo ?? 0) - (yendo[0]?.abajo ?? 0) > -40
        for (let k = 0; k < 40; k += 1) {
          await p.mouse.wheel(0, -70)
          await dormir(40)
        }
        await dormir(2500)
        const vuelve = (await titulos(p)).every((t) => t.mostrado.llegada > 0.99)
        const bien = montado && sube && oculto && perspectiva && problemas.length === 0 && seFue && cae && vuelve
        if (problemas.length > 0) console.log(`      ${String(ancho)} · ?composicion=${c} · ${problemas.join(' · ')}`)
        if (!bien) fallas.push(`${String(ancho)} c${c}`)
        console.log(
          `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ?composicion=${c} · «${h1.texto}» · el 3D ${montado ? 'montado' : 'NO montado'} · la entrada ${sube ? 'sube a 1' : `NO (${tramo.slice(0, 6).map((l) => l.toFixed(2)).join(' ')})`} · el h1 ${oculto ? 'oculto y accesible' : `a la vista (${h1.opacidades.join(', ')})`}` +
            ` · el mouse de un lado al otro: la caja se corre ${corrida.toFixed(1)} px y su ancho cambia ${(der.ancho - izq.ancho).toFixed(1)} px · la salida ${seFue ? 'a 0' : 'NO'}${cae ? '' : ' (SUBE)'} · la vuelta ${vuelve ? 'a 1' : 'NO'}`,
        )
      }
    } finally {
      await ctx.close()
    }
  }
  console.log(`titulo-3d: ${fallas.length === 0 ? 'todo en verde' : `${String(fallas.length)} fallas (${fallas.join(', ')})`}${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
