/**
 * SPRINT ESCENA 9 — T4 · el orden de los bloques, en la imagen: t4-orden-imagen.ts [ancho alto]
 *
 * Con el producto (los bloques del piso vivo de adelante hacia atrás, `piso/ordenDeLosBloques.ts`), en los cinco
 * momentos, el MISMO cuadro con los bloques en el orden de la grilla (el de antes), en el orden nuevo, y en el orden nuevo
 * con la profundidad estricta (en un empate gana lo dibujado antes: lo de adelante, como antes ganaba lo último). Cuántos
 * píxeles cambian y dónde: la diferencia amplificada ×10. Va a `escena9/t4-fluidez/orden/imagen/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'
import { guardarMismoCuadro, type MismoCuadro } from './mismo-cuadro'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
export const VARIANTES = ['grilla', 'orden', 'estricta'] as const

async function principal(): Promise<void> {
  const dir = carpeta('t4-fluidez/orden/imagen')
  const b = await abrir('producto', ANCHO, ALTO)
  const salida: Record<string, Omit<MismoCuadro, 'pngs'>> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const m of MOMENTOS) {
      await capturarMomento(b, m, sello)
      const base = `${dir}/${m.nombre}-${String(ANCHO)}`
      const r = await guardarMismoCuadro(b, VARIANTES, "(k) => window.__pisoDelBanco.orden(k !== 'grilla', k === 'estricta')", base)
      // Vuelve al producto (el orden nuevo, la profundidad de three): el mismo cuadro deja puesta la primera.
      await medir(b.p, 'window.__pisoDelBanco.orden(true, false)')
      salida[m.nombre] = { ancho: r.ancho, alto: r.alto, logo: r.logo, distintos: r.distintos }
      for (const v of ['orden', 'estricta']) {
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${base}-grilla.png`, '-i', `${base}-${v}.png`, '-filter_complex', 'blend=all_mode=difference,lutrgb=r=val*10:g=val*10:b=val*10', `${base}-diferencia-${v}-x10.png`])
      }
      console.log(m.nombre, JSON.stringify(r.distintos))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/mismo-cuadro-${String(ANCHO)}.json`, JSON.stringify({ variantes: VARIANTES, salida }, null, 1))
}

if (process.argv[1]?.endsWith('t4-orden-imagen.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
