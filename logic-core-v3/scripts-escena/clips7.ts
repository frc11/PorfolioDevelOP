/**
 * SPRINT ESCENA 7 — los clips: lo que se mueve se juzga en video, a velocidad real. clips7.ts <qué> [variante]
 *
 * Cada `<qué>` escribe en su carpeta de `escena7/`. El cursor va como un punto rojo que sólo existe
 * en la captura (`PUNTO_DEL_CURSOR`).
 */
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { grabar, mover, topeMas, viajarElPuntero } from './banco-escena'
import { abrir7, carpeta7 } from './banco7'
import { FUERA, fin, ladoALado, puntoDelLogo, recorte, scrollSuave } from './clips6'

const [QUE, VARIANTE] = [process.argv[2] ?? '', process.argv[3] ?? '']

/** El logo en el hero, para los recortes al doble (x, y, ancho, alto). */
export const ZONA_DEL_LOGO: readonly [number, number, number, number] = [620, 200, 720, 520]

/** Los dos gestos del obstáculo: un scroll suave y uno fuerte, ida y vuelta, desde el hero. */
export const GESTOS_DEL_OBSTACULO = {
  suave: async (b: Banco, quienes: number): Promise<void> => {
    await esperar(800)
    await scrollSuave(b, 0, quienes * 0.5, 4500)
    await esperar(2500)
    await scrollSuave(b, quienes * 0.5, 0, 4500)
    await esperar(2500)
  },
  fuerte: async (b: Banco, quienes: number): Promise<void> => {
    await esperar(800)
    await scrollSuave(b, 0, quienes, 600)
    await esperar(2500)
    await scrollSuave(b, quienes, 0, 600)
    await esperar(3000)
  },
} as const

/** T7 · el obstáculo: el mismo gesto suave y el mismo fuerte, grabados en el producto de ahora. */
async function obstaculo(cual: string): Promise<void> {
  const dir = carpeta7('obstaculo')
  for (const gesto of ['suave', 'fuerte'] as const) {
    const b = await abrir7('producto')
    try {
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(2000)
      const destino = `${dir}/${gesto}-${cual}`
      const r = await grabar(b, destino, () => GESTOS_DEL_OBSTACULO[gesto](b, quienes), 1440)
      recorte(`${destino}.mp4`, `${destino}-logo-x2.mp4`, ...ZONA_DEL_LOGO)
      console.log(JSON.stringify({ clip: `obstaculo-${gesto}-${cual}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
}

/** Arma los lado a lado del obstáculo con los dos «antes» y los dos «después». */
function obstaculoLadoALado(): void {
  const dir = carpeta7('obstaculo')
  for (const gesto of ['suave', 'fuerte'] as const) {
    ladoALado(`${dir}/${gesto}-antes.mp4`, `${dir}/${gesto}-despues.mp4`, `${dir}/${gesto}-antes-y-despues.mp4`, [`antes (ESCENA 6) - scroll ${gesto}`, `despues - scroll ${gesto}`])
    ladoALado(`${dir}/${gesto}-antes-logo-x2.mp4`, `${dir}/${gesto}-despues-logo-x2.mp4`, `${dir}/${gesto}-antes-y-despues-logo-x2.mp4`, [`antes x2 - ${gesto}`, `despues x2 - ${gesto}`])
  }
}

/** Un recorrido del cursor por el piso: una pasada larga, un círculo y una pasada corta y rápida (el de ESCENA 6). */
async function recorrerElPiso(b: Banco, centro: readonly [number, number]): Promise<void> {
  const [cx, cy] = centro
  await viajarElPuntero(b, FUERA, [cx - 520, cy + 40], 700)
  await esperar(500)
  await viajarElPuntero(b, [cx - 520, cy + 40], [cx + 480, cy + 90], 3200)
  await esperar(1500)
  const pasos = 90
  for (let i = 0; i <= pasos; i += 1) {
    const a = (i / pasos) * Math.PI * 2
    await mover(b, cx + 480 * Math.cos(a) * 0.55, cy + 90 * 0.7 + Math.sin(a) * 70)
    await esperar(33)
  }
  await esperar(1200)
  await viajarElPuntero(b, [cx + 260, cy + 60], [cx - 320, cy + 20], 600)
  await esperar(2500)
  await viajarElPuntero(b, [cx - 320, cy + 20], FUERA, 500)
  await esperar(3500)
}

/** T5 · el piso vivo: 20 s sin tocar nada (el mar), el cursor en el hero y en el pie, y el pulso. */
async function piso(que: string, nombre: string, pedido = 'producto'): Promise<void> {
  const dir = carpeta7('piso-vivo')
  const b = await abrir7(pedido)
  try {
    await mover(b, FUERA[0], FUERA[1])
    if (que === 'mar') {
      const donde = nombre.includes('quienes') ? await topeMas('quienes-somos', 0.15)(b) : 0
      if (donde > 0) await scrollHasta(b, donde)
      await esperar(2500)
      const r = await grabar(b, `${dir}/${nombre}`, () => esperar(20000), 1440)
      console.log(JSON.stringify({ clip: nombre, ...r }))
    } else if (que === 'cursor') {
      await esperar(2500)
      const a = await grabar(b, `${dir}/cursor-hero`, () => recorrerElPiso(b, [900, 720]), 1440)
      await scrollHasta(b, await fin(b))
      await esperar(2500)
      const c = await grabar(b, `${dir}/cursor-pie`, () => recorrerElPiso(b, [720, 760]), 1440)
      console.log(JSON.stringify({ clip: 'piso-cursor', hero: a, pie: c }))
    } else {
      const logo = await puntoDelLogo(b, [800, 330, 1150, 600])
      await mover(b, FUERA[0], FUERA[1])
      await esperar(2500)
      const r = await grabar(b, `${dir}/${nombre}`, async () => {
        await esperar(1500)
        // Entrar y salir del logo: dos principales.
        await viajarElPuntero(b, FUERA, logo, 700)
        await esperar(5500)
        await viajarElPuntero(b, logo, FUERA, 700)
        await esperar(6500)
      }, 1440)
      console.log(JSON.stringify({ clip: nombre, logo, ...r }))
    }
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  if (QUE === 'piso') return piso(VARIANTE === 'mar-quienes' ? 'mar' : VARIANTE, VARIANTE === 'mar' ? 'mar-20s-hero' : VARIANTE === 'mar-quienes' ? 'mar-20s-quienes' : 'pulso')
  if (QUE === 'obstaculo') return VARIANTE === 'juntar' ? obstaculoLadoALado() : obstaculo(VARIANTE === 'antes' ? 'antes' : 'despues')
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('clips7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
