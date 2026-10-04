/**
 * PASADA FINAL · 0 — LA CÁMARA DE ENTONCES, MEDIDA: npx tsx scripts-pasada/p0-camara.ts
 *
 * En ESCENA 10 (y hasta el nocturno) la cámara iba más atrás que hoy en el tramo de Portfolio: el mapeo scroll → progreso
 * es proporcional a los altos DECLARADOS de las secciones, y Tu panel declaraba 200svh midiendo más; RETOQUE PANEL T3
 * corrigió la tabla y la cámara de ese tramo se adelantó ~0,03. `scripts-escena10/t3-lectura.ts` dejó, a 1440×900, el
 * progreso de la cámara en cada scroll de entonces (`escena10/t3-titulos/lectura-1440.json`, `pasos`). Este banco mide el
 * de hoy en los MISMOS scrolls y escribe los pares (hoy, entonces) que `escena/camaraDeEntonces.ts` usa con las pruebas de
 * Portfolio (`?pruebas=portfolio=…`). Si la tabla de secciones vuelve a cambiar, se corre otra vez y se copia la salida.
 * Pide el servidor de desarrollo y `BANCO_GPU=alta`.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar } from '../scripts-viajes/banco'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/p0'
const ENTONCES = 'C:/Users/Valentino/.cache/b4-medicion/escena10/t3-titulos/lectura-1440.json'
/** El tramo que se mide: de Quiénes somos al medio de Trabajos (donde la cámara de entonces todavía iba atrás). */
const DESDE = 4173
const HASTA = 7473

interface Paso { readonly y: number; readonly progreso: number }

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const entonces = (JSON.parse(readFileSync(ENTONCES, 'utf8')) as { pasos: Paso[] }).pasos.filter((p) => p.y >= DESDE && p.y <= HASTA)
  const b = await abrirBanco(1440, 900, { perfil: 'pasada', antesDeCargar: `window.__entornoDeLaEscena = 'producto'` })
  const pares: [number, number, number][] = []
  try {
    for (const p of entonces) {
      await medir(b.p, `scrollTo(0, ${String(p.y)})`)
      await esperar(140)
      const hoy = await medir<number>(b.p, `(window.__titulosDelBanco ? window.__titulosDelBanco.progreso() : NaN)`)
      pares.push([p.y, Number(hoy.toFixed(5)), Number(p.progreso.toFixed(5))])
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${SALIDA}/pares.json`, JSON.stringify(pares))
  const monotono = pares.every((p, i) => i === 0 || (p[1] > pares[i - 1][1] && p[2] > pares[i - 1][2]))
  console.log(`${String(pares.length)} pares · monótono: ${String(monotono)}`)
  console.log(`[${pares.map((p) => `[${String(p[1])}, ${String(p[2])}]`).join(', ')}]`)
}

if (process.argv[1]?.endsWith('p0-camara.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
