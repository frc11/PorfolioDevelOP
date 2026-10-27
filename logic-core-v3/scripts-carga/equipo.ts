/**
 * [C2-30f] LAS FOTOS DEL EQUIPO, QUIETAS EN LA ESCENA Y LEGIBLES — `/v3` con el Chrome del sistema a la vista, el banco de la escena
 * (`__entornoDeLaEscena`, que prende `__acompanantesDelBanco`) y `/api/` bloqueado. Por ancho:
 *   · desde 1024 (el 3D): se llega a «El equipo» con la rueda y, en tres momentos de la cámara (ENTRANDO: la foto de Franco con su
 *     centro al 65 % del cuadro; EN EL MEDIO: el bloque de las dos personas centrado; SALIENDO: la foto de Valentino al 35 %), con el
 *     mouse quieto en el medio, se lee la orientación del plano de las personas en el mundo y la de la cámara viva (la escena las
 *     publica con el banco prendido) y se proyectan las esquinas de cada foto, cada etiqueta y cada descripción con la matriz que la
 *     escena escribe en el plano. Afirma:
 *       - ORIENTACIÓN PROPIA: entre el medio y la salida el plano gira mucho menos que la cámara (a lo sumo la mitad, con la cámara
 *         girando 5° o más) y en algún momento el plano y la cámara difieren 3° o más (un cartel los tiene iguales siempre);
 *       - ACOTADA: el ángulo plano-cámara nunca pasa del tope (+0,5°), tampoco con el mouse en los costados (en el medio);
 *       - LEGIBLE: cada foto, etiqueta y descripción se ve con su proporción a 0,85 o más de la real (ancho proyectado / alto
 *         proyectado contra el del DOM) y sus lados opuestos parejos a 0,85 o más;
 *     y saca una foto de cada momento;
 *   · en todos los anchos: la etiqueta del nombre adentro de la foto (Franco arriba a la izquierda, Valentino arriba a la derecha; el
 *     papel y la tinta), el nombre grande de afuera oculto (el `h4` del lector), el tamaño de letra de la descripción (antes, 15 px; el
 *     esperado por ancho) y, abajo de 1024, el toque: abajo de la foto sale sólo el rol.
 *   CONTROL=mira-camara: el plano vuelve a mirar a la cámara (el cartel de antes): tiene que fallar ORIENTACIÓN PROPIA.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/equipo.ts        (ANCHOS=1440x900,1024x768,768x1024,390x844 · CONTROL=mira-camara)
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CONTROL = process.env.CONTROL ?? ''
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/equipo')
const PISO_LEGIBLE = 0.85
const ANTES_PX = 15
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const sufijo = CONTROL === '' ? '' : `-${CONTROL}`

/** El tamaño esperado de la descripción (`geometria.ts`: 17 px abajo de 1024; `clamp(16px, 2px + 1,25vw, 20px)` desde 1024). */
const esperado = (w: number): number => (w < 1024 ? 17 : Math.min(20, Math.max(16, 2 + 0.0125 * w)))

interface Orientacion { readonly plano: number[]; readonly camara: number[]; readonly propia: number[]; readonly angulo: number; readonly libre: number; readonly tope: number; readonly miraLaCamara: boolean }
interface Pieza { readonly id: string; readonly legible: number; readonly proporcion: number }
interface Momento { readonly orientacion: Orientacion | null; readonly piezas: Pieza[]; readonly enElPlano: boolean; readonly visible: string; readonly ancho: number }

/** El ángulo entre dos cuaterniones [x, y, z, w], en grados. */
const angulo = (a: readonly number[], b: readonly number[]): number => {
  const d = Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]))
  return (2 * Math.acos(d) * 180) / Math.PI
}

/** El scroll del documento con el que una pieza (por su caja del LAYOUT, sin transformaciones) queda con su centro en `fraccion` del cuadro. */
const scrollPara = (p: Page, selector: string, fraccion: number): Promise<number> =>
  p.evaluate(
    ([sel, f]) => {
      const el = document.querySelector<HTMLElement>(`[data-panel="quienes-somos"] ${sel}`)
      if (el === null) return -1
      let y = 0
      for (let e: HTMLElement | null = el; e !== null; e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null) y += e.offsetTop
      return y + el.offsetHeight / 2 - f * window.innerHeight
    },
    [selector, fraccion] as const,
  )

/** Con la rueda hasta el scroll pedido (pasos de 120 px), y quieto 1,8 s para que la cámara asiente. */
async function ruedaHasta(p: Page, destino: number): Promise<void> {
  for (let k = 0; k < 200; k += 1) {
    const y = await p.evaluate(() => window.scrollY)
    const falta = destino - y
    if (Math.abs(falta) < 50) break
    await p.mouse.wheel(0, Math.sign(falta) * Math.min(120, Math.max(30, Math.abs(falta))))
    await dormir(70)
  }
  await dormir(1800)
}

/** La orientación que publica la escena y las piezas del plano de las personas proyectadas con su matriz. */
const medir = (p: Page): Promise<Momento> =>
  p.evaluate(() => {
    const visible = document.visibilityState
    const plano = document.querySelector<HTMLElement>('[data-panel="quienes-somos"] [data-plano="personas"]')
    const banco = (window as unknown as { __acompanantesDelBanco?: { orientaciones: () => Record<string, Orientacion> } }).__acompanantesDelBanco
    const orientacion = banco?.orientaciones().equipo ?? null
    if (plano === null) return { orientacion, piezas: [], enElPlano: false, visible, ancho: window.innerWidth }
    const css = plano.style.transform
    const enElPlano = css.startsWith('matrix3d(')
    // Sin la matriz un instante (en la misma tarea: no se pinta) para leer las cajas del layout relativas al plano.
    plano.style.transform = 'none'
    const base = plano.getBoundingClientRect()
    const elegidas = [...plano.querySelectorAll<HTMLElement>('[data-marco="dos-tomas"], [data-parte="etiqueta"], [data-parte="descripcion"]')]
    const cajas = elegidas.map((el, k) => {
      const r = el.getBoundingClientRect()
      const id = `${el.dataset.marco !== undefined ? 'foto' : (el.dataset.parte ?? '?')}-${String(k)}`
      return { id, x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }
    })
    plano.style.transform = css
    const m = enElPlano ? css.slice(9, -1).split(',').map(Number) : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    const proyectar = (u: number, v: number): [number, number] => {
      const w = m[3] * u + m[7] * v + m[15]
      return [base.left + (m[0] * u + m[4] * v + m[12]) / w, base.top + (m[1] * u + m[5] * v + m[13]) / w]
    }
    const piezas = cajas.map((c) => {
      const q = [proyectar(c.x, c.y), proyectar(c.x + c.w, c.y), proyectar(c.x + c.w, c.y + c.h), proyectar(c.x, c.y + c.h)]
      const d = (i: number, j: number): number => Math.hypot(q[i][0] - q[j][0], q[i][1] - q[j][1])
      const [arriba, abajo, izq, der] = [d(0, 1), d(3, 2), d(0, 3), d(1, 2)]
      const proporcion = (arriba + abajo) / (izq + der) / (c.w / Math.max(1, c.h))
      const legible = Math.min(proporcion, 1 / proporcion, Math.min(izq, der) / Math.max(izq, der), Math.min(arriba, abajo) / Math.max(arriba, abajo))
      return { id: c.id, legible, proporcion }
    })
    return { orientacion, piezas, enElPlano, visible, ancho: window.innerWidth }
  })

interface Etiquetas { readonly bien: boolean; readonly detalle: string; readonly tamano: number; readonly nombreAfuera: boolean }
/** Las etiquetas adentro de cada foto (por sus cajas del layout, sin la matriz del plano), la descripción y el nombre de afuera. */
const etiquetas = (p: Page): Promise<Etiquetas> =>
  p.evaluate(() => {
    const plano = document.querySelector<HTMLElement>('[data-panel="quienes-somos"] [data-plano="personas"]')
    if (plano === null) return { bien: false, detalle: 'sin el plano de las personas', tamano: 0, nombreAfuera: true }
    const css = plano.style.transform
    plano.style.transform = 'none'
    const filas = [...plano.querySelectorAll<HTMLElement>('[data-pieza-a="persona"]')]
    const partes = filas.map((fila, k) => {
      const foto = fila.querySelector<HTMLElement>('[data-marco="dos-tomas"]')?.getBoundingClientRect()
      const el = fila.querySelector<HTMLElement>('[data-parte="etiqueta"]')
      const et = el?.getBoundingClientRect()
      const estilo = el === null || el === undefined ? null : getComputedStyle(el)
      const lado = el?.dataset.lado ?? ''
      const texto = el?.textContent ?? ''
      const nombre = k === 0 ? 'Franco' : 'Valentino'
      const ladoBien = k === 0 ? lado === 'izquierda' : lado === 'derecha'
      const adentro = foto !== undefined && et !== undefined && et.top - foto.top >= 0 && et.top - foto.top < 40 && (k === 0 ? et.left - foto.left >= 0 && et.left - foto.left < 40 : foto.right - et.right >= 0 && foto.right - et.right < 40)
      const colores = estilo !== null && estilo.backgroundColor === 'rgb(247, 247, 245)' && estilo.color === 'rgb(17, 17, 17)' && estilo.mixBlendMode === 'normal'
      return { bien: texto === nombre && ladoBien && adentro && colores, detalle: `${nombre}: «${texto}» ${lado} ${adentro ? 'adentro, arriba' : 'FUERA DE LUGAR'} ${colores ? 'papel y tinta' : `colores ${estilo?.backgroundColor ?? '?'} / ${estilo?.color ?? '?'}`}` }
    })
    const desc = plano.querySelector<HTMLElement>('[data-parte="descripcion"]')
    const tamano = desc === null ? 0 : parseFloat(getComputedStyle(desc).fontSize)
    const h4 = [...plano.querySelectorAll<HTMLElement>('h4')]
    const nombreAfuera = h4.some((h) => h.getBoundingClientRect().width > 2)
    plano.style.transform = css
    return { bien: partes.length === 2 && partes.every((x) => x.bien), detalle: partes.map((x) => x.detalle).join(' · '), tamano, nombreAfuera }
  })

/**
 * Abajo de 1024: el toque en la foto de Franco, y lo que sube abajo (sólo el rol). Con el teclado (el mismo botón y el mismo estado):
 * con un mouse, `banda.css` le apaga el puntero al botón y el clic de Playwright daría «intercepta» (un falso positivo conocido).
 */
const toque = async (p: Page): Promise<{ readonly bien: boolean; readonly texto: string }> => {
  const boton = p.locator('[data-panel="quienes-somos"] [data-plano="personas"] [data-toque="marco"]').first()
  await boton.focus()
  await p.keyboard.press('Enter')
  await dormir(1200)
  return p.evaluate(() => {
    const marco = document.querySelector<HTMLElement>('[data-panel="quienes-somos"] [data-plano="personas"] [data-marco="dos-tomas"]')
    const revelado = marco?.querySelector<HTMLElement>('[data-parte="revelado"]')
    const textos = [...(revelado?.querySelectorAll<HTMLElement>('p') ?? [])].filter((x) => getComputedStyle(x).display !== 'none').map((x) => x.innerText.trim())
    const abierto = marco?.dataset.abierto === 'true' && Number(getComputedStyle(revelado ?? document.body).opacity) > 0.9
    return { bien: abierto && textos.length === 1 && textos[0] === 'ESTRATEGIA · COMERCIAL · PLANIFICACIÓN', texto: textos.join(' | ') }
  })
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const fallas: string[] = []
  for (const [ancho, alto] of ANCHOS) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/equipo-perfil-${String(Date.now())}`)
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
      await p.mouse.move(ancho / 2, alto / 2)
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      await dormir(6000)
      const problemas: string[] = []
      if (ancho >= 1024) {
        const momentos: Record<string, Momento> = {}
        const pasos: readonly (readonly [string, string, number])[] = [
          ['entrando', '[data-pieza-a="persona"] [data-marco="dos-tomas"]', 0.65],
          ['medio', '[data-plano="personas"]', 0.5],
          ['saliendo', '[data-pieza-a="persona"]:nth-child(2) [data-marco="dos-tomas"]', 0.35],
        ]
        for (const [nombre, selector, fraccion] of pasos) {
          const destino = await scrollPara(p, selector, fraccion)
          if (destino < 0) {
            problemas.push(`${nombre}: no encontré la pieza`)
            continue
          }
          await ruedaHasta(p, destino)
          await p.mouse.move(ancho / 2 + 1, alto / 2)
          await dormir(600)
          const m = await medir(p)
          momentos[nombre] = m
          await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${nombre}${sufijo}.png`) })
          if (m.visible !== 'visible' || !(m.ancho > 0)) problemas.push(`${nombre}: la pestaña no está a la vista (${m.visible}): la medida no vale`)
          const o = m.orientacion
          console.log(
            `      ${String(ancho)} · ${nombre}: ${o === null ? 'SIN orientación publicada' : `plano-cámara ${o.angulo.toFixed(1)}° (la propia, ${o.libre.toFixed(1)}°; tope ${String(o.tope)}°)`} · ${m.enElPlano ? 'en el plano' : 'SIN matriz'} · ${m.piezas.map((x) => `${x.id} ${x.legible.toFixed(3)}`).join(' ')}`,
          )
          if (o !== null && o.angulo > o.tope + 0.5) problemas.push(`${nombre}: el ángulo plano-cámara pasa el tope (${o.angulo.toFixed(1)}°)`)
          const torcida = m.piezas.filter((x) => x.legible < PISO_LEGIBLE)
          if (torcida.length > 0) problemas.push(`${nombre}: ilegible ${torcida.map((x) => `${x.id} ${x.legible.toFixed(3)}`).join(', ')}`)
          if (nombre === 'medio') {
            // Con el mouse en los costados (quieto hasta que la cámara asienta): el tope y lo legible siguen.
            for (const x of [0.04, 0.96]) {
              await p.mouse.move(ancho * x, alto / 2, { steps: 16 })
              await dormir(2600)
              const c = await medir(p)
              await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-medio-mouse-${x < 0.5 ? 'izquierda' : 'derecha'}${sufijo}.png`) })
              const ang = c.orientacion?.angulo ?? Number.NaN
              const peor = Math.min(...c.piezas.map((y) => y.legible))
              console.log(`      ${String(ancho)} · medio, el mouse a la ${x < 0.5 ? 'izquierda' : 'derecha'}: plano-cámara ${ang.toFixed(1)}° · lo más torcido ${peor.toFixed(3)}`)
              if (c.orientacion !== null && ang > c.orientacion.tope + 0.5) problemas.push(`medio con el mouse: el ángulo pasa el tope (${ang.toFixed(1)}°)`)
              if (peor < PISO_LEGIBLE) problemas.push(`medio con el mouse: ilegible (${peor.toFixed(3)})`)
            }
            await p.mouse.move(ancho / 2, alto / 2, { steps: 16 })
            await dormir(2600)
          }
        }
        // ORIENTACIÓN PROPIA: entre el medio y la salida el plano gira mucho menos que la cámara; y no coincide siempre con ella.
        const [me, sa, en] = [momentos.medio?.orientacion, momentos.saliendo?.orientacion, momentos.entrando?.orientacion]
        if (me === null || me === undefined || sa === null || sa === undefined || en === null || en === undefined) problemas.push('ORIENTACIÓN PROPIA: la escena no publicó la orientación en los tres momentos')
        else {
          const [giroCamara, giroPlano] = [angulo(me.camara, sa.camara), angulo(me.plano, sa.plano)]
          const distinta = Math.max(en.angulo, me.angulo, sa.angulo) >= 3
          const propia = giroCamara >= 5 && giroPlano <= giroCamara / 2 && distinta
          console.log(`${propia ? 'ok   ' : 'FALLA'} ${String(ancho)} · ORIENTACIÓN PROPIA: del medio a la salida la cámara gira ${giroCamara.toFixed(1)}° y el plano ${giroPlano.toFixed(1)}° · plano-cámara entrando ${en.angulo.toFixed(1)}°, en el medio ${me.angulo.toFixed(1)}°, saliendo ${sa.angulo.toFixed(1)}°`)
          if (!propia) problemas.push('ORIENTACIÓN PROPIA')
        }
      }
      // Todos los anchos: las etiquetas, el nombre de afuera y el tamaño de la descripción (y abajo de 1024 el toque).
      const destino = await scrollPara(p, '[data-plano="personas"]', 0.5)
      if (destino >= 0) await ruedaHasta(p, destino)
      const e = await etiquetas(p)
      const tamanoBien = Math.abs(e.tamano - esperado(ancho)) < 0.6 && e.tamano > ANTES_PX
      console.log(`${e.bien && !e.nombreAfuera && tamanoBien ? 'ok   ' : 'FALLA'} ${String(ancho)} · las etiquetas: ${e.detalle} · el nombre grande de afuera ${e.nombreAfuera ? 'A LA VISTA' : 'oculto (el h4 del lector)'} · la descripción ${String(ANTES_PX)} → ${e.tamano.toFixed(2)} px (esperado ${esperado(ancho).toFixed(2)})`)
      if (!e.bien) problemas.push('las etiquetas')
      if (e.nombreAfuera) problemas.push('el nombre grande de afuera')
      if (!tamanoBien) problemas.push(`la descripción de ${e.tamano.toFixed(2)} px`)
      if (ancho < 1024) {
        const t = await toque(p)
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-toque${sufijo}.png`) })
        console.log(`${t.bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · el toque: abajo de la foto «${t.texto}»`)
        if (!t.bien) problemas.push('el toque (sólo el rol abajo)')
      }
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-etiquetas${sufijo}.png`) })
      if (problemas.length > 0) fallas.push(`${String(ancho)}: ${problemas.join(' · ')}`)
    } finally {
      await ctx.close()
    }
  }
  for (const f of fallas) console.log(`  · ${f}`)
  console.log(`equipo: ${fallas.length === 0 ? 'todo en verde' : `${String(fallas.length)} anchos con fallas`}${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que fallar ORIENTACIÓN PROPIA)`} · fotos en ${SALIDA}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
