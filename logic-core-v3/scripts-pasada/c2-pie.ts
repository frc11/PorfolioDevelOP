/**
 * PASADA FINAL · C2 — LA LLEGADA DEL PIE POR COLUMNAS, EN VIVO: npx tsx scripts-pasada/c2-pie.ts [ancho alto]
 *
 * Con la página de producto y el pie de volumen (desde 1025), muestrea por cuadro lo mostrado de la coreografía, lo que
 * pide el scroll y cuánto llegó cada columna (lo más y lo menos de sus piezas), en cinco gestos:
 *   lento    del final de Por qué develOP al último píxel en 6 s (grabado: video y hoja de cuadros);
 *   salto    al último píxel de golpe (las columnas tienen que verse una después de la otra);
 *   frenado  quieto a mitad de un tramo (0,62 y 0,88: se asienta en su extremo más cercano, ninguna columna a medias);
 *   vaiven   cinco idas y vueltas rápidas de 600 px (nunca fuera de 0…1; al frenar, asentado);
 *   viaje    un enlace del recorrido del pie desde el final (se desarma rápido mientras viaja: «Contacto» no viaja, abre el
 *            formulario; al pie no se llega con un viaje).
 * Va a `~/.cache/b4-medicion/pasada-final/c2/`. Pide el servidor de desarrollo y `BANCO_GPU=alta`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { grabar, mover } from '../scripts-escena/banco-escena'
import { scrollSuave } from '../scripts-escena/clips6'
import { abrir } from '../scripts-escena10/banco'
import { captura, esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]
const SALIDA = `C:/Users/Valentino/.cache/b4-medicion/pasada-final/c2/${String(ANCHO)}`

/** Muestrea `ms` en la página, por cuadro: [t, mostrado, pedido, atrás (min, max), tapa (min, max), fundido (min, max), scrollY]. */
const muestrear = (ms: number, antes = ''): string => `new Promise((listo) => {
  const b = window.__pieDelBanco
  if (!b) { listo(null); return }
  const filas = []
  const t0 = performance.now()
  ${antes}
  const cuadro = () => {
    const c = b.coreografia()
    const ps = b.piezas()
    const grupo = (g) => { const xs = ps.filter((p) => p.llegada === g && p.visible).map((p) => p.llego); return xs.length === 0 ? [null, null] : [Math.min(...xs), Math.max(...xs)] }
    filas.push([Math.round(performance.now() - t0), c.mostrado, c.pedido, ...grupo('atras'), ...grupo('tapa'), ...grupo('fundido'), Math.round(scrollY)])
    if (performance.now() - t0 < ${String(ms)}) requestAnimationFrame(cuadro)
    else listo(filas)
  }
  requestAnimationFrame(cuadro)
})`

type Fila = [number, number, number | null, number | null, number | null, number | null, number | null, number | null, number | null, number]

/** Lo que importa de una serie: rango, si alguna columna quedó a medias al final, y cuándo empezó y terminó cada una. */
function resumen(filas: Fila[] | null): Record<string, unknown> {
  if (filas === null || filas.length === 0) return { sinDatos: true }
  const fuera = filas.filter((f) => f[1] < 0 || f[1] > 1).length
  const ultima = filas[filas.length - 1]
  const aMedias = (min: number | null, max: number | null): boolean => min !== null && max !== null && ((min > 0.001 && min < 0.999) || (max > 0.001 && max < 0.999))
  const cuando = (k: number, umbral: number): number | null => filas.find((f) => (f[k] ?? 0) >= umbral)?.[0] ?? null
  return {
    cuadros: filas.length,
    fueraDeRango: fuera,
    final: { mostrado: +ultima[1].toFixed(3), pedido: ultima[2] === null ? null : +ultima[2].toFixed(3) },
    aMediasAlFinal: { atras: aMedias(ultima[3], ultima[4]), tapa: aMedias(ultima[5], ultima[6]), fundido: aMedias(ultima[7], ultima[8]) },
    empieza: { atras: cuando(4, 0.001), tapa: cuando(6, 0.001), fundido: cuando(8, 0.001) },
    termina: { atras: cuando(3, 0.999), tapa: cuando(5, 0.999), fundido: cuando(7, 0.999) },
  }
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrir('producto', ANCHO, ALTO)
  const informe: Record<string, unknown> = { ancho: ANCHO, alto: ALTO }
  const series: Record<string, unknown> = {}
  try {
    // El puntero en un costado (que no hunda ninguna pieza).
    await mover(b, 8, Math.round(ALTO / 2))
    const fin = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    const pie = await medir<boolean>(b.p, '!!window.__pieDelBanco')
    informe.fin = fin
    informe.conPie = pie
    if (!pie) throw new Error('sin __pieDelBanco (¿pie de volumen montado?)')

    // lento (grabado)
    const desde = fin - Math.round(ALTO * 1.15)
    await medir(b.p, `scrollTo(0, ${String(desde)})`)
    await esperar(3500)
    const destino = `${SALIDA}/lento`
    let lento: Fila[] | null = null
    await grabar(b, destino, async () => {
      await esperar(400)
      const [filas] = await Promise.all([medir<Fila[] | null>(b.p, muestrear(8600)), scrollSuave(b, desde, fin, 6000)])
      lento = filas
    }, ANCHO)
    series.lento = lento
    informe.lento = resumen(lento)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '2.0', '-t', '6.0', '-i', `${destino}.mp4`, '-vf', `fps=2,scale=${String(Math.round(ANCHO / 3))}:-2,tile=4x3`, '-frames:v', '1', `${destino}-hoja.png`])

    // salto
    await medir(b.p, `scrollTo(0, ${String(fin - Math.round(ALTO * 1.6))})`)
    await esperar(4500)
    const salto = await medir<Fila[] | null>(b.p, muestrear(4000, `scrollTo(0, ${String(fin)})`))
    series.salto = salto
    informe.salto = resumen(salto)

    // frenado: quieto a mitad de un tramo (0,62, más cerca de su comienzo: se deshace; 0,88, más cerca de su final: se completa)
    for (const meta of [0.62, 0.88]) {
      // El progreso de la última pantalla va de `top bottom` a `bottom bottom` de la sección del pie: por geometría.
      const yMedio = await medir<number>(b.p, `(() => { const s = document.querySelector('footer').closest('section'); const r = s.getBoundingClientRect(); return Math.round(r.top + scrollY - innerHeight + ${String(meta)} * r.height) })()`)
      await medir(b.p, `scrollTo(0, ${String(fin - ALTO)})`)
      await esperar(4500)
      const frenado = await medir<Fila[] | null>(b.p, muestrear(4000, `window.scrollTo({ top: ${String(yMedio)}, behavior: 'smooth' })`))
      series[`frenado-${String(meta)}`] = frenado
      informe[`frenado-${String(meta)}`] = { yMedio, ...resumen(frenado) }
    }

    // vaivén
    await medir(b.p, `scrollTo(0, ${String(fin)})`)
    await esperar(3000)
    const vaiven = await medir<Fila[] | null>(b.p, muestrear(5200, `let k = 0; const ir = () => { scrollTo(0, k % 2 === 0 ? ${String(fin - 600)} : ${String(fin)}); k += 1; if (k < 10) setTimeout(ir, 140) }; ir()`))
    series.vaiven = vaiven
    informe.vaiven = resumen(vaiven)

    // viaje: un enlace del recorrido del pie, desde el final
    await medir(b.p, `scrollTo(0, ${String(fin)})`)
    await esperar(4500)
    const viaje = await medir<Fila[] | null>(b.p, muestrear(4000, `const a = document.querySelector('[data-pieza="destinos-del-pie"] a'); if (a) a.click()`))
    series.viaje = viaje
    informe.viaje = resumen(viaje)
    await medir(b.p, `scrollTo(0, ${String(fin)})`)
    await esperar(4500)
    await captura(b, `${SALIDA}/final.png`)
  } finally {
    writeFileSync(`${SALIDA}/informe.json`, JSON.stringify(informe, null, 1))
    writeFileSync(`${SALIDA}/series.json`, JSON.stringify(series))
    console.log(JSON.stringify(informe))
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('c2-pie.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
