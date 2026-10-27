/**
 * [C2-30s] EL ≠ DE QUIÉNES SOMOS, GRANDE Y CENTRADO EN EL ESPACIO LIBRE — `/v3` con el Chrome del sistema a la vista, el banco de la
 * escena (los títulos en volumen, `__titulosDelBanco`; la silueta del logo, `__siluetaDelBanco`) y `/api/` bloqueado, el mouse quieto en
 * el medio. Llega a la primera pantalla de Quiénes somos CON LA RUEDA (hasta que su tope queda en el borde de arriba) y mide en pantalla:
 *   · desde 1024, la caja proyectada del ≠ en volumen (`agencia-signo`), la del titular en volumen, la tinta del cuerpo (en su plano) y la
 *     caja del logo (su silueta). El espacio libre MEDIDO: del margen de la página (la caja del contenido de `Envoltorio`) a la izquierda
 *     del logo menos su aire (el de los huecos del logo: 3 svh en unidades del logo), del pie del titular a la cabeza del cuerpo;
 *       - el tamaño: la tinta del ≠ al menos 2,5 veces la de antes (tres renglones del titular) y del tamaño de su lugar del DOM;
 *       - centrado: su centro a ± 5 % del centro del espacio libre medido, en cada eje (se informa también contra el del DOM);
 *       - no tapa: su caja no se cruza con la del titular, la del cuerpo ni la del logo;
 *   · abajo de 1024 (768) el ≠ es el del DOM (sin volumen) y NO cambió: se mide que no tape el texto ni el logo y se informa el espacio
 *     libre que deja el logo (para calibrar), sin juzgar el tamaño ni el centrado.
 * Se informa también el medio ancho del logo medido en `svh` de la banda (la constante es `MEDIO_ANCHO_DEL_LOGO_SVH`, 21,3) y su centro.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/distinto.ts                       (ANCHOS=1440x900,1024x768,768x1024)
 *   CONTROL=chico  … el ≠ con el tamaño de antes: desde 1024 tiene que FALLAR el tamaño.
 *   CONTROL=encima … el ≠ sobre el titular: tiene que FALLAR «no tapa» (desde 1024 en la fila del titular; a 768, corrido encima).
 * Fotos en `~/.cache/b4-medicion/distinto/`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { BANDA } from '../src/app/v3/_lib/escena/banda'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('distinto')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** El aire del logo y su medio ancho supuesto (`signo.ts`), en `svh` de la banda. */
const AIRE_SVH = 3
const MEDIO_ANCHO_SUPUESTO_SVH = 21.3
/** La tinta del ≠ en fracciones de su caja (las barras de 8 a 92): para el tamaño de antes. */
const TINTA_ANCHO = 0.84
const SIGNO = '[data-panel="quienes-somos"] [data-composicion="agencia"] [data-pieza="signo-distinto"]'
const LIBRE = '[data-composicion="agencia"] > :has([data-pieza="signo-distinto"])'

/** Los controles: CSS antes de que el título se arme (el volumen mide su lugar del DOM al armarse). */
const CSS_DEL_CONTROL: Readonly<Record<string, string>> = {
  chico: `@media (width >= 1024px) { ${LIBRE} { --signo-lado: calc(3 * var(--titular-interlineado) * var(--titular-tamano-escritorio)) !important; } }`,
  encima: `@media (width >= 1024px) { ${LIBRE} { grid-row-start: 2 !important; } }`,
}

interface Caja {
  readonly izq: number
  readonly der: number
  readonly arr: number
  readonly aba: number
}

interface Medido {
  readonly ancho: number
  readonly alto: number
  readonly visible: string
  readonly tope: number
  readonly signo: Caja | null
  readonly signoEnVolumen: boolean
  readonly llegada: number
  readonly ladoDelLugar: number
  readonly cuerpoDelTitular: number
  readonly titular: Caja | null
  readonly cuerpo: Caja | null
  readonly logo: Caja | null
  readonly celdasDelLogoEnElSigno: number
  readonly contenido: Caja | null
  readonly libreDelDom: Caja | null
}

const medir = (p: Page): Promise<Medido> =>
  p.evaluate(
    ({ signoSel }) => {
      type C = { izq: number; der: number; arr: number; aba: number }
      const deRect = (r: DOMRect): C => ({ izq: r.left, der: r.right, arr: r.top, aba: r.bottom })
      const unir = (cs: C[]): C | null =>
        cs.length === 0 ? null : { izq: Math.min(...cs.map((c) => c.izq)), der: Math.max(...cs.map((c) => c.der)), arr: Math.min(...cs.map((c) => c.arr)), aba: Math.max(...cs.map((c) => c.aba)) }
      const tinta = (el: Element | null): C | null => {
        if (el === null) return null
        const r = document.createRange()
        r.selectNodeContents(el)
        return unir([...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0).map(deRect))
      }
      const w = window as unknown as {
        __titulosDelBanco?: { titulos: () => { id: string; visible: boolean; mostrado: { llegada: number }; enElCuadro: { izquierda: number; derecha: number; arriba: number; abajo: number } }[] }
        __siluetaDelBanco?: (celda?: number) => { celda: number; cols: number; ocupadas: number[] } | null
      }
      const lugar = document.querySelector<HTMLElement>(signoSel)
      const agencia = lugar?.closest('[data-composicion="agencia"]') ?? null
      const libre = agencia === null ? null : [...agencia.children].find((c) => c.contains(lugar)) ?? null
      const ts = w.__titulosDelBanco?.titulos() ?? []
      const enCaja = (t: (typeof ts)[number]): C => ({ izq: t.enElCuadro.izquierda, der: t.enElCuadro.derecha, arr: t.enElCuadro.arriba, aba: t.enElCuadro.abajo })
      const signo3d = ts.find((t) => t.id === 'agencia-signo' && t.visible)
      const titular3d = ts.filter((t) => /^agencia-[12]-/.test(t.id) && t.visible)
      // El ≠ del DOM: la unión de sus trazos (sin el medio grosor); el titular del DOM: el reparto que se ve.
      const lineas = lugar === null ? [] : [...lugar.querySelectorAll('line')].map((l) => deRect(l.getBoundingClientRect()))
      const reparto = agencia === null ? null : [...agencia.querySelectorAll<HTMLElement>('[data-esquiva-del-logo]')].find((e) => e.checkVisibility()) ?? null
      const signo = signo3d !== undefined ? enCaja(signo3d) : unir(lineas)
      const s = w.__siluetaDelBanco?.(4) ?? null
      let logo: C | null = null
      let celdas = 0
      if (s !== null) {
        for (const i of s.ocupadas) {
          const [x, y] = [(i % s.cols) * s.celda, Math.floor(i / s.cols) * s.celda]
          logo = logo === null ? { izq: x, der: x + s.celda, arr: y, aba: y + s.celda } : { izq: Math.min(logo.izq, x), der: Math.max(logo.der, x + s.celda), arr: Math.min(logo.arr, y), aba: Math.max(logo.aba, y + s.celda) }
          if (signo !== null && x + s.celda / 2 >= signo.izq && x + s.celda / 2 <= signo.der && y + s.celda / 2 >= signo.arr && y + s.celda / 2 <= signo.aba) celdas += 1
        }
      }
      const contenido = document.querySelector('[data-panel="quienes-somos"] [data-pieza="envoltorio"] > [data-parte="contenido"]')
      const pantalla = document.querySelector('[data-panel="quienes-somos"] [data-pantalla="agencia"]')
      return {
        ancho: innerWidth,
        alto: innerHeight,
        visible: document.visibilityState,
        tope: pantalla === null ? Number.NaN : pantalla.getBoundingClientRect().top,
        signo,
        signoEnVolumen: signo3d !== undefined,
        llegada: signo3d?.mostrado.llegada ?? -1,
        ladoDelLugar: lugar?.offsetWidth ?? 0,
        cuerpoDelTitular: reparto === null ? 0 : parseFloat(getComputedStyle(reparto).fontSize),
        titular: titular3d.length > 0 ? unir(titular3d.map(enCaja)) : tinta(reparto),
        cuerpo: tinta(agencia?.querySelector('[data-halo-del-cuerpo] p') ?? null),
        logo,
        celdasDelLogoEnElSigno: celdas,
        contenido: contenido === null ? null : deRect(contenido.getBoundingClientRect()),
        libreDelDom: libre === null ? null : deRect(libre.getBoundingClientRect()),
      }
    },
    { signoSel: SIGNO },
  )

/** La rueda hasta que el tope de la primera pantalla de Quiénes somos queda en el borde de arriba (± 24 px), y que asiente. */
async function alaAgenciaConLaRueda(p: Page, alto: number): Promise<number> {
  const tope = (): Promise<number> => p.evaluate(() => document.querySelector('[data-panel="quienes-somos"] [data-pantalla="agencia"]')?.getBoundingClientRect().top ?? Number.NaN)
  for (let k = 0; k < 240; k += 1) {
    const t = await tope()
    if (!(t > 60)) break
    await p.mouse.wheel(0, t > alto ? 240 : 80)
    await dormir(140)
  }
  await dormir(1800)
  for (let k = 0; k < 24; k += 1) {
    const t = await tope()
    if (Math.abs(t) <= 24) break
    await p.mouse.wheel(0, t > 0 ? Math.min(60, t) : Math.max(-60, t))
    await dormir(500)
  }
  await dormir(3000)
  return tope()
}

const cruza = (a: Caja | null, b: Caja | null): boolean => a !== null && b !== null && a.izq < b.der && b.izq < a.der && a.arr < b.aba && b.arr < a.aba
const f = (v: number): string => v.toFixed(0)
const caja = (c: Caja | null): string => (c === null ? '—' : `${f(c.izq)}..${f(c.der)} × ${f(c.arr)}..${f(c.aba)}`)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: string[] = []
  const fallas: string[] = []
  for (const [ancho, alto] of ANCHOS) {
    const escritorio = ancho >= 1024
    const perfil = perfilDelBanco('distinto')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      const css = CSS_DEL_CONTROL[CONTROL] ?? ''
      await ctx.addInitScript(
        `(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ` +
          `const css = ${JSON.stringify(css)}; if (css !== '') document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }) })()`,
      )
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.mouse.move(ancho / 2, alto / 2)
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      await dormir(7000)
      const tope = await alaAgenciaConLaRueda(p, alto)
      // A 768 el control corre el ≠ del DOM encima del titular (relativo: no mueve el layout).
      if (CONTROL === 'encima' && !escritorio) {
        await p.evaluate((sel) => {
          const el = document.querySelector<HTMLElement>(sel)
          const tit = [...document.querySelectorAll<HTMLElement>('[data-composicion="agencia"] [data-esquiva-del-logo]')].find((e) => e.checkVisibility())
          if (el === null || tit === undefined) return
          const [a, b] = [el.getBoundingClientRect(), tit.getBoundingClientRect()]
          el.style.position = 'relative'
          el.style.top = `${String(b.top + b.height / 2 - (a.top + a.height / 2))}px`
        }, SIGNO)
        await dormir(300)
      }
      const m = await medir(p)
      await p.screenshot({ path: path.join(SALIDA, `agencia-${String(ancho)}x${String(alto)}${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
      // El espacio libre medido: del margen a la izquierda del logo menos su aire, del pie del titular a la cabeza del cuerpo.
      const unidadDelLogo = Math.max(alto / BANDA.tope, Math.min(alto, ancho / BANDA.aspecto)) / 100
      const libre: Caja | null =
        m.contenido === null || m.logo === null || m.titular === null || m.cuerpo === null ? null : { izq: m.contenido.izq, der: m.logo.izq - AIRE_SVH * unidadDelLogo, arr: m.titular.aba, aba: m.cuerpo.arr }
      // Lo que la constante tendría que valer para que la reserva del DOM caiga en el borde del logo a este ancho.
      const medioDelLogo = m.logo === null ? Number.NaN : (ancho / 2 - m.logo.izq) / unidadDelLogo
      const centroDelLogo = m.logo === null ? Number.NaN : (m.logo.izq + m.logo.der) / 2 / ancho
      const tapa = [cruza(m.signo, m.titular) ? 'el titular' : '', cruza(m.signo, m.cuerpo) ? 'el cuerpo' : '', cruza(m.signo, m.logo) ? 'el logo' : ''].filter((x) => x !== '')
      const noTapa = m.signo !== null && tapa.length === 0
      const cabecera = `${String(ancho)}x${String(alto)} · visible ${m.visible} · tope de la pantalla ${f(tope)} px · el ≠ ${m.signoEnVolumen ? `en volumen (llegada ${m.llegada.toFixed(2)})` : 'del DOM'} ${caja(m.signo)} · titular ${caja(m.titular)} · cuerpo ${caja(m.cuerpo)} · logo ${caja(m.logo)} (centro ${(centroDelLogo * 100).toFixed(1)} % del ancho; medio ancho medido ${medioDelLogo.toFixed(1)} svh de la banda, supuesto ${String(MEDIO_ANCHO_SUPUESTO_SVH)})`
      lineas.push(cabecera)
      console.log(`·     ${cabecera}`)
      let bien = noTapa && m.visible === 'visible' && m.ancho > 0
      let detalle = `no tapa: ${noTapa ? 'ok' : `CRUZA ${tapa.join(', ') || '(sin ≠)'}`} (celdas del logo adentro de su caja: ${String(m.celdasDelLogoEnElSigno)})`
      if (escritorio) {
        const tintaDeAntes = TINTA_ANCHO * 3.75 * m.cuerpoDelTitular
        const anchoDelSigno = m.signo === null ? 0 : m.signo.der - m.signo.izq
        const veces = tintaDeAntes > 0 ? anchoDelSigno / tintaDeAntes : 0
        const delLugar = m.ladoDelLugar > 0 ? anchoDelSigno / (TINTA_ANCHO * m.ladoDelLugar) : 0
        const grande = m.signoEnVolumen && m.llegada > 0.95 && veces >= 2.5 && delLugar >= 0.9 && delLugar <= 1.25
        const centro = (c: Caja): readonly [number, number] => [(c.izq + c.der) / 2, (c.arr + c.aba) / 2]
        const desvio = (l: Caja | null): readonly [number, number] => {
          if (l === null || m.signo === null) return [Number.NaN, Number.NaN]
          const [a, b] = [centro(m.signo), centro(l)]
          return [Math.abs(a[0] - b[0]) / (l.der - l.izq), Math.abs(a[1] - b[1]) / (l.aba - l.arr)]
        }
        const [dx, dy] = desvio(libre)
        const [dxDom, dyDom] = desvio(m.libreDelDom)
        const centrado = dx <= 0.05 && dy <= 0.05
        bien = bien && grande && centrado
        detalle =
          `tamaño: la tinta ${f(anchoDelSigno)} px, ${veces.toFixed(2)} veces la de antes (${f(tintaDeAntes)}), ${delLugar.toFixed(2)} de su lugar ${grande ? 'ok' : 'FALLA (>= 2,5 y 0,9..1,25)'}` +
          ` · centrado en el libre medido ${caja(libre)}: ${(dx * 100).toFixed(1)} % / ${(dy * 100).toFixed(1)} % ${centrado ? 'ok' : 'FALLA (± 5 %)'} (contra el del DOM ${caja(m.libreDelDom)}: ${(dxDom * 100).toFixed(1)} % / ${(dyDom * 100).toFixed(1)} %)` +
          ` · ${detalle}`
      } else {
        detalle = `abajo de 1024 el ≠ no cambió (sin volumen): ${detalle} · el libre que deja el logo a la izquierda: ${libre === null ? '—' : `${f(libre.der - libre.izq)} px de ancho`}`
      }
      const linea = `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)}x${String(alto)} · ${detalle}`
      console.log(linea)
      lineas.push(linea)
      if (!bien) fallas.push(`${String(ancho)}x${String(alto)}`)
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.join('\n'))
  const ESPERADO: Readonly<Record<string, string>> = { chico: 'el tamaño desde 1024', encima: '«no tapa» en los tres anchos' }
  console.log(`distinto: ${fallas.length === 0 ? 'todo en verde' : `${String(fallas.length)} fallas (${fallas.join(', ')})`}${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR ${ESPERADO[CONTROL] ?? ''})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
