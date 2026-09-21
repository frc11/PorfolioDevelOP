/**
 * M — EL TITULAR DEL HERO SOBRE EL LOGO: la captura y su cifra.
 *
 *     npx tsx scripts-blend/m-titular.ts [--anchos=425,320]
 *
 * El pedido avisa de un riesgo que no es el del cuerpo: **el titular del hero es
 * tipografía de display pesada**, y un trazo de 50 px se comporta distinto a uno
 * de 16 bajo `difference`. Un glifo grueso tiene mucho más interior que borde, así
 * que la parte que el blend resuelve bien —el núcleo— pesa más; y al mismo tiempo
 * cubre más superficie de escena, así que atraviesa más valores de fondo.
 *
 * Este script no opina: saca la captura que el dueño va a mirar y publica, sobre
 * los mismos píxeles, lo que el instrumento del repo mide. La parada no se elige
 * a ojo — se barre la primera pantalla y gana la que tiene más logo debajo del
 * titular, que es el peor caso y el que hay que mirar.
 */

import { medir } from '../scripts-b4/navegador'
import { ocultarPorSelector, cajaYTinta } from '../scripts-b5/pagina'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

import { argumento, guardarJson } from './blend-comun'
import {
  ESCENA,
  asegurarCarpetas,
  blendPintado,
  entregar,
  esperar,
  foto,
  mascara,
  scrollA,
  zonaMuerta,
} from './f-comun'

const TITULAR = '[data-panel="hero"] h1'
const PASOS = 6

interface Donde {
  readonly top: number
  readonly alto: number
  readonly ventana: number
}

const DONDE = [
  '(() => {',
  `  const t = document.querySelector(${JSON.stringify(TITULAR)})`,
  '  if (t === null) return { top: 0, alto: 0, ventana: 0 }',
  '  const r = t.getBoundingClientRect()',
  '  return { top: Math.round(r.top + window.scrollY), alto: Math.round(r.height), ventana: window.innerHeight }',
  '})()',
].join('\n')

async function principal(): Promise<void> {
  asegurarCarpetas()
  const pedidos = argumento('anchos', '425,320').split(',')
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => pedidos.includes(String(v.ancho)))
  const salida: Record<string, unknown>[] = []

  await conChrome('blend-titular', async (chrome) => {
    for (const v of ventanas) {
      const fila = await enLaVentana(
        chrome,
        v,
        async (s) => {
          const donde = await medir<Donde>(s.pagina, DONDE)
          const texto = await cajaYTinta(s.pagina, TITULAR)
          if (texto.cajas.length === 0) throw new Error('el titular del hero no devolvió caja de texto')

          // ── el barrido: la parada con más logo debajo del titular ─────────
          const paradas: { y: number; oscuro: number }[] = []
          for (let i = 0; i <= PASOS; i += 1) {
            const y = Math.round((donde.ventana * i) / PASOS / 2)
            await scrollA(s.pagina, y)
            await esperar(700)
            const caja = await medir<{ dentro: boolean }>(
              s.pagina,
              [
                '(() => {',
                `  const t = document.querySelector(${JSON.stringify(TITULAR)})`,
                '  if (t === null) return { dentro: false }',
                '  const r = t.getBoundingClientRect()',
                '  return { dentro: r.top > 40 && r.bottom < window.innerHeight - 40 }',
                '})()',
              ].join('\n'),
            )
            if (!caja.dentro) continue
            if (!(await ocultarPorSelector(s.pagina, TITULAR, true))) throw new Error('no se pudo apagar el titular')
            const A = await foto(s.pagina, `m-${v.ancho}-barrido`)
            await ocultarPorSelector(s.pagina, TITULAR, false)
            await esperar(240)
            // Cuánto del área del titular tiene fondo oscuro: el logo.
            let oscuro = 0
            const c = texto.caja
            for (let yy = Math.max(0, Math.floor(c.y)); yy < Math.min(A.alto, Math.ceil(c.y + c.alto)); yy += 2) {
              for (let xx = Math.max(0, Math.floor(c.x)); xx < Math.min(A.ancho, Math.ceil(c.x + c.ancho)); xx += 2) {
                const k = (yy * A.ancho + xx) * 4
                if ((A.datos[k] + A.datos[k + 1] + A.datos[k + 2]) / 3 < 120) oscuro += 1
              }
            }
            paradas.push({ y, oscuro })
            console.log(`      y=${String(y).padStart(4)}  ${oscuro} muestras oscuras bajo la caja del titular`)
          }
          if (paradas.length === 0) throw new Error('ninguna parada dejó el titular entero en cuadro')
          const mejor = paradas.reduce((a, b) => (b.oscuro > a.oscuro ? b : a))

          // ── la pose elegida: captura y cifra ──────────────────────────────
          await scrollA(s.pagina, mejor.y)
          await esperar(1100)
          const cajas = await cajaYTinta(s.pagina, TITULAR)

          if (!(await ocultarPorSelector(s.pagina, ESCENA, true))) throw new Error('no se pudo apagar la escena')
          const T = await foto(s.pagina, `m-${v.ancho}-t`)
          await ocultarPorSelector(s.pagina, ESCENA, false)
          await esperar(320)
          const m = mascara(T, cajas.cajas)

          if (!(await ocultarPorSelector(s.pagina, TITULAR, true))) throw new Error('no se pudo apagar el titular')
          const A = await foto(s.pagina, `m-${v.ancho}-a`)
          await ocultarPorSelector(s.pagina, TITULAR, false)
          await esperar(320)

          const compuesto = `m-${v.ancho}-compuesto`
          const B = await foto(s.pagina, compuesto)
          entregar(compuesto, `hero-titular-${v.ancho}`)

          const tinta: readonly [number, number, number] = [cajas.tinta[0], cajas.tinta[1], cajas.tinta[2]]
          const pintado = blendPintado(m, A, B, tinta)
          const zm = zonaMuerta(m, A)

          console.log(`    parada ${mejor.y} · ${m.indices.length} px de glifo · tinta ${tinta.join(',')}`)
          console.log(`    pintado: ${pintado.bajoAA}/${pintado.pixeles} bajo AA (${pintado.bajoAAPct} %) · peor ${pintado.peor} · mediana ${pintado.mediana}`)
          console.log(`    fondo mediano ${zm.fondoMediano} · zona muerta AA ${zm.pctAA} % · núcleo ${zm.pctNucleo} %`)
          console.log(`    captura: docs/rediseno/outputs/blend/hero-titular-${v.ancho}.png`)

          return { ancho: v.ancho, parada: mejor.y, paradas, pixelesDeGlifo: m.indices.length, tinta, pintado, zonaMuerta: zm }
        },
        { asentamientoMs: 4500 },
      )
      console.log(`\n  === ${v.ancho}`)
      salida.push(fila)
    }
    return null
  })
  console.log(`\n  ${guardarJson('m-titular', { anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
