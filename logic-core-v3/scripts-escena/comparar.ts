/**
 * SPRINT ESCENA 3 — variantes de la escena en los mismos cinco momentos.
 * comparar.ts <ancho> <alto> <capturas|fps> [variantes separadas por espacio] [cpu]
 *
 * Una variante es un pedido para `_lib/escena/entorno.ts`, que se pisa ANTES de cargar la página
 * (`window.__entornoDeLaEscena`): `base` es la escena de `escena-base-limpia`, `producto` son las
 * banderas del producto, y cualquier otra es una lista (`E1,haz=sutil`, `E7,cursor=B,estela`).
 * Con el contador de llamadas de dibujo del banco, llega a cada momento POR SCROLL, a pasos, así la
 * noche de Trabajos cae como cae; espera a que asiente, verifica que la página está donde se pidió
 * (`banco-escena.ts`) y recién ahí captura o mide.
 *
 *   · `capturas` — una captura por momento y por variante, en `escena3/hojas/`.
 *   · `fps` — cuadros por segundo, llamadas de dibujo y triángulos por momento, con la CPU
 *     estrangulada `cpu` veces (4 para el perfil móvil).
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco } from '../scripts-viajes/banco'
import { CONTADOR, DIR3, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, fps, selloDeCarga } from './banco-escena'

const [ANCHO, ALTO, MODO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), process.argv[4] ?? 'capturas']
const VARIANTES = (process.argv[5] ?? 'base producto').split(' ').filter(Boolean)
const CPU = Number(process.argv[6] ?? 1)
const DIR = `${DIR3}/hojas`

/** El nombre de archivo de una variante: sin comas ni signos. */
export const rotuloDe = (variante: string): string => variante.replace(/[,=]/g, '_')

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const filas: unknown[] = []
  for (const variante of VARIANTES) {
    const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${variante}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}` })
    try {
      if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: CPU }, b.p.sessionId)
      const sello = await selloDeCarga(b)
      for (const momento of MOMENTOS) {
        const c = await capturarMomento(b, momento, sello)
        if (MODO === 'capturas') {
          writeFileSync(`${DIR}/${momento.nombre}-${String(ANCHO)}-${rotuloDe(variante)}.png`, c.png)
          console.log(JSON.stringify({ variante, momento: momento.nombre, y: c.y, asentoMs: c.ms, intentos: c.intentos, media: Math.round(c.media * 100) / 100, reintentos: c.reintentos }))
          continue
        }
        const cuadros = await fps(b)
        const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
        const fila = { ancho: ANCHO, cpu: CPU, variante, momento: momento.nombre, fps: cuadros, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos) }
        filas.push(fila)
        console.log(JSON.stringify(fila))
      }
    } finally {
      await b.cerrar()
    }
  }
  if (MODO === 'fps') writeFileSync(`${DIR}/fps-${String(ANCHO)}-cpu${String(CPU)}.json`, JSON.stringify(filas, null, 2))
}

if (process.argv[1]?.endsWith('comparar.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
