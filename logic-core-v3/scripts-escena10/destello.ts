/**
 * SPRINT ESCENA 10 · CIERRE — EL DESTELLO DE UN CUADRO, con scroll real: destello.ts <rótulo> [ancho] [alto] [tramos]
 *
 * Con la NVIDIA (`BANCO_GPU=alta`, verificada en la página) y el vsync puesto, contra el servidor de desarrollo. La rueda
 * va por CDP (`Input.dispatchMouseEvent`, `mouseWheel` en el centro del cuadro: el puntero no corre la cámara), así que
 * pasa por Lenis como la de una persona. El instrumento (`destello-instrumento.ts`) anota cada cuadro dibujado.
 *
 * Tramos (`tramos`, separados por coma; todos por defecto):
 *   · `final-<velocidad>`: de Tu panel (su borde de abajo fuera del cuadro) a Por qué develOP (el borde 0,6 pantallas
 *     arriba), quieto 3,5 s, y de vuelta. Velocidades: `lenta` (una muesca de 100 px cada 220 ms), `media` (cada 70 ms)
 *     y `rapida` (cada 20 ms).
 *   · `noche-<velocidad>`: la frontera de la noche, de Quiénes somos (1,5 pantallas antes de Trabajos) a Trabajos
 *     (1 pantalla adentro), ida y vuelta.
 *   · `viajes`: ocho viajes del menú, de un origen a un destino (los de la luz que cambia y los de día a día).
 *   · `control`: con la noche sostenida por el amanecer, un cuadro con la noche dada vuelta (`__amanecerDelBanco.destello`,
 *     si existe): el detector tiene que verlo.
 *
 * Va a `escena10/destello/<rótulo>-<ancho>/`: un JSON por tramo (la lectura del detector, los acontecimientos y los
 * cuadros) y las miniaturas de las ventanas alrededor de cada acontecimiento (`<tramo>.rgb`, para el clip).
 */
import { writeFileSync } from 'node:fs'

import { medir, type Pagina } from '../scripts-b4/navegador'
import { abrirMotor } from '../scripts-calidad/motor/abrir'
import { clicEnElItem } from '../scripts-viajes/b-humo'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { AMANECER } from '../src/app/v3/_lib/escena/amanecer/linea'
import { carpeta } from './banco'
import { INSTRUMENTO, MINI, cuadrosDe, destellosEn, saltosEn, type Cuadro } from './destello-instrumento'

/** Lo que se considera un salto (media de |ΔL| en lo que se ve, entre dos cuadros seguidos): sin defecto, 0,010 a lo sumo. */
export const UMBRAL = 0.05
/**
 * Lo que se considera un destello (cuánto se sale del rango de sus vecinos): sin defecto, 0,014 a lo sumo en los tramos y
 * viajes del invariante (0,021 en otro viaje: la cámara en vuelo); el defecto más chico medido, 0,040.
 */
export const UMBRAL_DEL_PICO = 0.025
export const MUESCA = 100
export const VELOCIDADES = { lenta: 220, media: 70, rapida: 20 } as const

export const tope = (b: Banco, id: string, pantallas: number): Promise<number> =>
  medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return Math.round(r.top + scrollY + ${String(pantallas)} * innerHeight) })()`)

/** La rueda: `muescas` de `MUESCA` px (negativas suben), una cada `cadaMs`. */
export async function rueda(p: Pagina, ancho: number, alto: number, muescas: number, cadaMs: number): Promise<void> {
  for (let k = 0; k < Math.abs(muescas); k += 1) {
    const t0 = Date.now()
    await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.round(ancho / 2), y: Math.round(alto / 2), deltaX: 0, deltaY: Math.sign(muescas) * MUESCA, button: 'none', buttons: 0, modifiers: 0 }, p.sessionId)
    const resto = cadaMs - (Date.now() - t0)
    if (resto > 0) await esperar(resto)
  }
}

/** Graba lo que pase mientras corre `accion` y devuelve los cuadros. */
export async function grabarCuadros(b: Banco, accion: () => Promise<void>): Promise<{ cuadros: Cuadro[]; n: number }> {
  await medir(b.p, 'window.__destello.empezar()')
  await accion()
  const n = await medir<number>(b.p, 'window.__destello.parar()')
  const plano: number[] = []
  for (let i = 0; i < n; i += 300) plano.push(...(await medir<number[]>(b.p, `window.__destello.filas(${String(i)}, ${String(Math.min(n, i + 300))})`)))
  return { cuadros: cuadrosDe(plano), n }
}

/**
 * Llega a `desde` bajando desde arriba de Servicios: así la compuerta del amanecer está apagada (volviendo desde abajo
 * sigue prendida hasta que Servicios baja del borde de arriba) y el tramo pasa por donde se prende.
 */
async function llegarDesdeArriba(b: Banco, desde: number): Promise<void> {
  await scrollHasta(b, await tope(b, 'servicios', -0.5))
  await scrollHasta(b, desde)
}

/** Un tramo de ida y vuelta con la rueda (la compuerta del final, apagada al empezar). */
export async function idaYVuelta(b: Banco, desde: number, muescas: number, cadaMs: number): Promise<{ cuadros: Cuadro[]; n: number }> {
  await llegarDesdeArriba(b, desde)
  await esperar(1500)
  return grabarCuadros(b, async () => {
    await esperar(300)
    await rueda(b.p, b.ancho, b.alto, muescas, cadaMs)
    await esperar(3500)
    await rueda(b.p, b.ancho, b.alto, -muescas, cadaMs)
    await esperar(3000)
  })
}

/** Dónde arranca el tramo final y cuántas muescas lleva (el borde de Tu panel de abajo del cuadro a 0,6 pantallas arriba). */
export async function tramoFinal(b: Banco): Promise<{ desde: number; muescas: number }> {
  const desde = await tope(b, 'tu-panel', 0.3)
  const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY) })()`)
  return { desde, muescas: Math.ceil((pie - desde + 0.6 * b.alto) / MUESCA) }
}

/** Los acontecimientos: la compuerta, el cambio de la sala, la noche sostenida y cada salto o destello. */
export function acontecimientos(c: readonly Cuadro[], saltos: readonly number[] = []): { i: number; que: string }[] {
  const r: { i: number; que: string }[] = []
  for (let i = 1; i < c.length; i += 1) {
    if (c[i].activo !== c[i - 1].activo) r.push({ i, que: c[i].activo === 1 ? 'compuerta-prende' : 'compuerta-apaga' })
    const cambio = (x: Cuadro): boolean => x.activo === 1 && x.s >= AMANECER.cambio
    if (cambio(c[i]) !== cambio(c[i - 1])) r.push({ i, que: cambio(c[i]) ? 'cambio-a-dia' : 'cambio-a-noche' })
  }
  for (const i of saltos) r.push({ i, que: 'salto' })
  return r.sort((a, z) => a.i - z.i)
}

/** Las miniaturas de las ventanas alrededor de cada acontecimiento (±12 cuadros), juntas; con `todas`, todas. */
async function ventanas(b: Banco, n: number, eventos: readonly { i: number }[], destino: string, todas: boolean): Promise<{ desde: number; hasta: number }[]> {
  const rangos: { desde: number; hasta: number }[] = todas ? [{ desde: 0, hasta: n }] : []
  for (const e of todas ? [] : eventos) {
    const [d, h] = [Math.max(0, e.i - 12), Math.min(n, e.i + 13)]
    const ultimo = rangos[rangos.length - 1]
    if (ultimo !== undefined && d <= ultimo.hasta) ultimo.hasta = Math.max(ultimo.hasta, h)
    else rangos.push({ desde: d, hasta: h })
  }
  const partes: Buffer[] = []
  for (const r of rangos) partes.push(Buffer.from(await medir<string>(b.p, `window.__destello.minis(${String(r.desde)}, ${String(r.hasta)})`), 'base64'))
  writeFileSync(destino, Buffer.concat(partes))
  return rangos
}

async function guardar(b: Banco, dir: string, nombre: string, r: { cuadros: Cuadro[]; n: number }, extra: Record<string, unknown> = {}): Promise<void> {
  const lectura = saltosEn(r.cuadros, UMBRAL)
  const picos = destellosEn(r.cuadros, UMBRAL_DEL_PICO)
  const eventos = acontecimientos(r.cuadros, [...lectura.saltos.map((s) => s.i), ...picos.map((p) => p.i)])
  const rangos = await ventanas(b, r.n, eventos, `${dir}/${nombre}.rgb`, nombre.startsWith('viaje-'))
  const resumen = { ...lectura, saltos: lectura.saltos.slice(0, 40) }
  console.log(`${nombre}: ${String(r.n)} cuadros · medidos ${String(lectura.medidos)} · barrido ${String(lectura.barrido)} · tapados ${String(lectura.tapados)} · cortes ${String(lectura.cortes)} · mayor ${String(lectura.mayor)} · SALTOS ${String(lectura.saltos.length)} · DESTELLOS ${String(picos.length)}`)
  for (const s of lectura.saltos.slice(0, 6)) console.log(`   salto cuadro ${String(s.i)} Δ ${String(s.delta)} · antes ${JSON.stringify(s.antes)} · ahora ${JSON.stringify(s.ahora)}`)
  for (const p of picos.slice(0, 6)) console.log(`   destello cuadro ${String(p.i)} × ${String(p.cuadros)} · se sale ${String(p.fuera)} · L ${p.luminancias.join('/')}`)
  writeFileSync(`${dir}/${nombre}.json`, JSON.stringify({ umbral: UMBRAL, umbralDelPico: UMBRAL_DEL_PICO, mini: MINI, ...extra, lectura: resumen, destellos: picos, eventos, rangos, cuadros: r.cuadros }))
}

/** Donde el control positivo da vuelta la noche: el borde de Tu panel al 70 %, el amanecer prendido y sosteniendo la noche. */
export async function irAlControl(b: Banco): Promise<void> {
  const { desde } = await tramoFinal(b)
  await llegarDesdeArriba(b, desde)
  const pie = await medir<number>(b.p, `(() => document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect().bottom - 0.7 * innerHeight)()`)
  await rueda(b.p, b.ancho, b.alto, Math.round(pie / MUESCA), 220)
  await esperar(3000)
}

const VIAJES = ['hero>por-que-develop', 'trabajos>por-que-develop', 'por-que-develop>trabajos', 'por-que-develop>quienes-somos', 'tu-panel>quienes-somos', 'hero>trabajos', 'trabajos>quienes-somos', 'servicios>por-que-develop'] as const
export const ORIGEN: Record<string, [string, number] | null> = { hero: null, 'quienes-somos': ['quienes-somos', 0.15], trabajos: ['trabajos', 1], servicios: ['servicios', 0.3], 'tu-panel': ['tu-panel', 0.3], 'por-que-develop': ['por-que-develop', 0.7] }

async function principal(): Promise<void> {
  const [ROTULO, ANCHO, ALTO] = [process.argv[2] ?? 'antes', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]
  const TRAMOS = (process.argv[5] ?? 'final-lenta,final-media,final-rapida,noche-media,noche-rapida,viajes,control').split(',')
  const dir = carpeta(`destello/${ROTULO}-${String(ANCHO)}`)
  const b = await abrirMotor(ANCHO, ALTO, { conVsync: true })
  try {
    const placa = await medir<string>(b.p, `(() => { const gl = document.createElement('canvas').getContext('webgl2'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) })()`)
    console.log(`placa: ${placa}`)
    console.log(`instrumento: ${await medir<string>(b.p, INSTRUMENTO)}`)
    for (const tramo of TRAMOS) {
      const [que, vel] = tramo.split('-') as [string, keyof typeof VELOCIDADES | undefined]
      if (que === 'final' && vel !== undefined) {
        const { desde, muescas } = await tramoFinal(b)
        await guardar(b, dir, tramo, await idaYVuelta(b, desde, muescas, VELOCIDADES[vel]), { placa, desde, muescas })
      } else if (que === 'noche' && vel !== undefined) {
        const desde = await tope(b, 'trabajos', -1.5)
        await guardar(b, dir, tramo, await idaYVuelta(b, desde, Math.ceil((2.5 * ALTO) / MUESCA), VELOCIDADES[vel]), { placa, desde })
      } else if (que === 'viajes') {
        for (const caso of VIAJES) {
          const [o, d] = caso.split('>')
          const donde = ORIGEN[o]
          await scrollHasta(b, donde === null ? 0 : await tope(b, donde[0], donde[1]))
          await esperar(1500)
          const r = await grabarCuadros(b, async () => {
            await clicEnElItem(b, d)
            await esperar(5500)
          })
          await guardar(b, dir, `viaje-${o}-a-${d}`, r, { placa })
        }
      } else if (que === 'control') {
        const hay = await medir<boolean>(b.p, 'typeof window.__amanecerDelBanco?.destello === "function"')
        if (!hay) { console.log('control: este código no tiene `destello` (antes del arreglo)'); continue }
        await irAlControl(b)
        await guardar(b, dir, tramo, await grabarCuadros(b, async () => { await esperar(500); await medir(b.p, 'window.__amanecerDelBanco.destello()'); await esperar(600) }), { placa })
      }
    }
    console.log(`errores: ${JSON.stringify(await medir<string[]>(b.p, 'window.__errores ?? []'))}`)
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('destello.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
