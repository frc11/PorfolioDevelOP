/**
 * SPRINT CALIDAD 1 — B4 · los clips de los bordes del polvo: b4-clips.ts <etiqueta: antes|despues|lado> [ancho alto]
 *
 * - posarse: quieto en el hero, desde que el puntero sale del cuadro. A los 4 a 5,5 s el polvo empieza a posarse; antes
 *   de B4, las motas del volumen que caían debajo del piso aparecían de golpe sobre él.
 * - despertar: con el polvo ya posado, un scroll corto (240 px) y quieto. A los 1,4 a 2,2 s lo levantado vuelve al
 *   aire; antes, las que tenían su lugar debajo del piso desaparecían de golpe.
 *
 * Con el recorte al doble del piso delante del logo. Va a `calidad1/b4-bordes/clips/` con la etiqueta; `lado` arma los
 * lado a lado.
 */
import { existsSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { grabar, mover } from '../scripts-escena/banco-escena'
import { FUERA, recorte } from '../scripts-escena/clips6'
import { abrir, carpeta, ladoALado } from './banco'

const ETIQUETA = process.argv[2] ?? 'antes'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

/** El piso delante del logo, en píxeles del cuadro (x, y, ancho, alto): donde se posa el polvo que se ve. */
const PISO: Record<number, readonly [number, number, number, number]> = { 1440: [360, 560, 720, 300], 375: [0, 480, 374, 300] }

async function grabarLosClips(): Promise<void> {
  const dir = carpeta('b4-bordes/clips')
  const b = await abrir('producto', ANCHO, ALTO)
  const zona = PISO[ANCHO] ?? PISO[1440]
  const ancho = Math.min(ANCHO, 1440) & ~1
  try {
    await mover(b, ANCHO < 600 ? ANCHO - 10 : FUERA[0], ALTO - 20)
    await esperar(1000)
    const posarse = `${dir}/posarse-${String(ANCHO)}-${ETIQUETA}`
    console.log('posarse', JSON.stringify(await grabar(b, posarse, () => esperar(11000), ancho)))
    recorte(`${posarse}.mp4`, `${posarse}-piso-x2.mp4`, ...zona)
    const despertar = `${dir}/despertar-${String(ANCHO)}-${ETIQUETA}`
    console.log(
      'despertar',
      JSON.stringify(
        await grabar(
          b,
          despertar,
          async () => {
            await esperar(500)
            await medir(b.p, `(async () => { for (let a = 0; a <= 240; a += 40) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, 30)) } return 1 })()`)
            await esperar(7000)
          },
          ancho,
        ),
      ),
    )
    recorte(`${despertar}.mp4`, `${despertar}-piso-x2.mp4`, ...zona)
  } finally {
    await b.cerrar()
  }
}

/** Los lado a lado de lo que tenga las dos corridas: el clip entero y el recorte del piso al doble. */
function lado(): void {
  const dir = carpeta('b4-bordes')
  for (const clip of ['posarse', 'despertar']) {
    for (const ancho of ['1440', '375']) {
      for (const cola of ['', '-piso-x2']) {
        const [a, d] = [`${dir}/clips/${clip}-${ancho}-antes${cola}.mp4`, `${dir}/clips/${clip}-${ancho}-despues${cola}.mp4`]
        if (!existsSync(a) || !existsSync(d)) continue
        ladoALado(a, d, `${dir}/${clip}-${ancho}${cola}-antes-y-despues.mp4`, [`${clip} ${ancho}${cola.replace('-', ' ')} - antes`, 'despues (B4)'], 720)
        console.log(`${clip}-${ancho}${cola}`)
      }
    }
  }
}

if (process.argv[1]?.endsWith('b4-clips.ts')) {
  const correr = ETIQUETA === 'lado' ? async () => lado() : grabarLosClips
  correr().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
