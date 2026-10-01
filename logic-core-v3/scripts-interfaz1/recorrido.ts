/**
 * SPRINT INTERFAZ 1 · T1 — el recorrido entero con la rueda: recorrido.ts <rótulo> [consulta]
 *
 * /v3 a 1440 × 900 de arriba abajo con la rueda por CDP (pasa por Lenis): una muesca de 100 px cada 120 ms (~830 px/s,
 * la velocidad de leer pasando) y una pausa de 1,2 s cada 3 pantallas para que lo que entra termine de entrar. Graba
 * lo que se ve con el instante de cada cuadro y lo que vio el vigía (corrimientos del layout, divisor rehecho a la vista,
 * fuentes). Va a `interfaz1/t1-texto/recorrido-<rótulo>.mp4` y `.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, esperar, grabar, rueda, vigia } from './banco'

const ROTULO = process.argv[2] ?? 'antes'
const CONSULTA = process.argv[3] ?? ''
const [ANCHO, ALTO] = [1440, 900]

correr(async () => {
  const dir = carpeta('t1-texto')
  const b = await abrir(ANCHO, ALTO, { consulta: CONSULTA })
  try {
    const carga = await vigia(b)
    const fin = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    await medir(b.p, 'window.scrollTo(0, 0)')
    await esperar(1500)
    const muescasPorTramo = Math.round((3 * ALTO) / 100)
    const tramos = Math.ceil(fin / (muescasPorTramo * 100)) + 1
    const cuadros = await grabar(b, `${dir}/recorrido-${ROTULO}.cuadros`, async () => {
      await esperar(800)
      for (let k = 0; k < tramos; k += 1) {
        await rueda(b, muescasPorTramo, 120)
        await esperar(1200)
      }
      await esperar(1500)
    })
    const fin2 = await vigia(b)
    armarClip(`${dir}/recorrido-${ROTULO}.cuadros`, cuadros, `${dir}/recorrido-${ROTULO}.mp4`, `T1 recorrido · ${ROTULO}`)
    const cls = fin2.cambios.reduce((s, c) => s + c.valor, 0)
    const resumen = {
      rotulo: ROTULO,
      consulta: CONSULTA,
      placa: b.placa,
      cuadros: cuadros.length,
      segundos: Math.round((cuadros[cuadros.length - 1].t - cuadros[0].t) / 100) / 10,
      carga: { corrimientos: carga.cambios.length, cls: Math.round(carga.cambios.reduce((s, c) => s + c.valor, 0) * 10000) / 10000, fuentes: carga.fuentes, partidos: carga.partidos, rehechos: carga.rehechos, rehechosALaVista: carga.rehechosALaVista },
      recorrido: { corrimientos: fin2.cambios.length, cls: Math.round(cls * 10000) / 10000, rehechos: fin2.rehechos, rehechosALaVista: fin2.rehechosALaVista, partidos: fin2.partidos },
      cambios: fin2.cambios,
    }
    writeFileSync(`${dir}/recorrido-${ROTULO}.json`, JSON.stringify(resumen, null, 1))
    console.log(JSON.stringify({ ...resumen, cambios: resumen.cambios.length }))
  } finally {
    await b.cerrar()
  }
})
