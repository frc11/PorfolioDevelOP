/**
 * PASADA FINAL · A2 — LA VENTANA DE LLEGADA DE PORTFOLIO, MEDIDA: npx tsx scripts-pasada/a2-ventana.ts [grabar]
 *
 * Barre el scroll alrededor de Trabajos leyendo `__titulosDelBanco` y anota dónde el título de Portfolio empieza a
 * llegar, dónde está entero (`termina`, en progreso de la coreografía) y dónde se va; imprime el número que
 * `_lib/titulos3d/registro.ts` guarda en `LLEGADA_DE_PORTFOLIO.termina` (si el mapeo scroll → progreso se movió, el de
 * acá es el que va ahí; la relación de cámara de ESCENA 10 la aplica la colocación). Con `grabar`, además graba la llegada con el MISMO gesto que `scripts-escena10/t3-clips.ts`
 * (parado 500 px antes, scroll suave de 4 s hasta el medio de la lectura), para compararla con el clip aprobado
 * (`~/.cache/b4-medicion/escena10/t3-titulos/clips/portfolio-llegada-negro.mp4`). Sale a
 * `~/.cache/b4-medicion/pasada-final/a2/`. Pide el servidor de desarrollo y `BANCO_GPU=alta`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { grabar, mover } from '../scripts-escena/banco-escena'
import { scrollSuave } from '../scripts-escena/clips6'
import { abrir } from '../scripts-escena10/banco'
import { esperar, scrollHasta } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [1440, 900]
const PUNTERO: readonly [number, number] = [720, 700]
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/a2'

interface Lectura { id: string; llegada: number; salida: number }
type B = Awaited<ReturnType<typeof abrir>>

async function portfolio(b: B): Promise<Lectura | null> {
  const t = await medir<Lectura[] | null>(b.p, `(window.__titulosDelBanco ? window.__titulosDelBanco.titulos() : null)`)
  return t?.find((x) => x.id === 'portfolio') ?? null
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    await mover(b, PUNTERO[0], PUNTERO[1])
    const tope = await medir<number>(b.p, `(() => { const s = document.querySelector('[data-panel="trabajos"]'); return s ? Math.round(s.getBoundingClientRect().top + scrollY) : -1 })()`)
    const filas: { y: number; llegada: number; salida: number; progreso: number }[] = []
    let desde = -1
    let entera = -1
    let seVa = -1
    for (let y = Math.max(0, tope - 400); y <= tope + 4200; y += 40) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(90)
      const t = await portfolio(b)
      const progreso = await medir<number>(b.p, `(window.__titulosDelBanco ? window.__titulosDelBanco.progreso() : -1)`)
      if (t === null) continue
      filas.push({ y, llegada: t.llegada, salida: t.salida, progreso })
      if (desde < 0 && t.llegada > 0) desde = y
      if (entera < 0 && t.llegada >= 0.999) entera = y
      if (seVa < 0 && t.salida > 0) seVa = y
      if (seVa > 0) break
    }
    // Afinar `entera` de a 5 px entre la ultima muestra incompleta y la primera entera (la grilla de 40 px vale 0,003 de progreso).
    let termina = Number.NaN
    for (let y = entera - 40; y <= entera; y += 5) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(90)
      const t = await portfolio(b)
      if (t !== null && t.llegada >= 0.999) {
        entera = y
        termina = await medir<number>(b.p, `(window.__titulosDelBanco ? window.__titulosDelBanco.progreso() : NaN)`)
        break
      }
    }
    const informe = { ancho: ANCHO, alto: ALTO, topeDeTrabajos: tope, scroll: { desde, entera, seVa }, termina: Number(termina.toFixed(4)), filas }
    writeFileSync(`${SALIDA}/ventana.json`, JSON.stringify(informe, null, 1))
    console.log(`Portfolio llega desde ${String(desde)} · entero en ${String(entera)} (progreso ${termina.toFixed(4)}) · se va en ${String(seVa)}`)
    console.log(`LLEGADA_DE_PORTFOLIO.termina = ${termina.toFixed(4)} (la relación de cámara con 0,4426 → 0,4718 la aplica la colocación)`)
    if (process.argv.includes('grabar') && entera > 0) {
      const p0 = entera
      const p1 = seVa > 0 ? seVa : entera + 960
      await scrollHasta(b, p0 - 500)
      await esperar(3000)
      const destino = `${SALIDA}/portfolio-llegada`
      await grabar(b, destino, async () => {
        await esperar(600)
        await scrollSuave(b, p0 - 500, Math.round((p0 + p1) / 2), 4000)
        await esperar(1800)
      }, ANCHO)
      console.log(`${destino}.mp4`)
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('a2-ventana.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
