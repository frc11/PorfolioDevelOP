/**
 * SPRINT ESCENA 7 — los clips: lo que se mueve se juzga en video, a velocidad real. clips7.ts <qué> [variante]
 *
 * Cada `<qué>` escribe en su carpeta de `escena7/`. El cursor va como un punto rojo que sólo existe
 * en la captura (`PUNTO_DEL_CURSOR`).
 */
import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { grabar, mover, topeMas, viajarElPuntero } from './banco-escena'
import { abrir7, carpeta7 } from './banco7'
import { FUERA, fin, ladoALado, puntoDelLogo, recorte, scrollSuave } from './clips6'
import { scrollDe } from './foto7'

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

/** T9 · la noche cae y el haz se enciende (falla y prende); después, ida y vuelta sobre la frontera (sin volver a fallar). */
async function haz(): Promise<void> {
  const dir = carpeta7('haz')
  const b = await abrir7('producto')
  try {
    // La noche cae (la gota) a ~1,4 pantallas antes de Trabajos: se arranca de día, antes.
    const dia = await topeMas('trabajos', -2.2)(b)
    const noche = await topeMas('trabajos', -0.9)(b)
    await scrollHasta(b, dia)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const r = await grabar(b, `${dir}/cae-la-noche`, async () => {
      await esperar(800)
      await scrollSuave(b, dia, noche, 3500)
      await esperar(6500)
      await scrollSuave(b, noche, dia, 2000)
      await esperar(1500)
      await scrollSuave(b, dia, noche, 2000)
      await esperar(3500)
    }, 1440)
    console.log(JSON.stringify({ clip: 'haz', ...r }))
  } finally {
    await b.cerrar()
  }
}

/**
 * T11 · el amanecer (con bandera): de Tu panel a Por qué develOP. `mirar`: baja despacio hasta que el borde
 * de Tu panel deja ver la sala y se queda quieto mirando el amanecer entero; `rapido`: baja de un tirón (el
 * amanecer se acelera y termina antes de que llegue el título).
 */
async function amanecer(que: string): Promise<void> {
  const dir = carpeta7('amanecer')
  const b = await abrir7('producto,amanecer')
  try {
    const desde = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 1.12) })()`)
    const puerta = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 0.8) })()`)
    const hasta = await topeMas('por-que-develop', 0.25)(b)
    await scrollHasta(b, desde)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(2500)
    const nombre = que === 'rapido' ? 'amanecer-scroll-rapido' : 'amanecer-mirando'
    const r = await grabar(b, `${dir}/${nombre}`, async () => {
      await esperar(800)
      if (que === 'rapido') {
        await scrollSuave(b, desde, hasta, 1400)
        await esperar(4000)
        return
      }
      await scrollSuave(b, desde, puerta, 2200)
      await esperar(9500)
      await scrollSuave(b, puerta, hasta, 2500)
      await esperar(2000)
    }, 1440)
    const estado = await medir<unknown>(b.p, 'window.__amanecerDelBanco ? window.__amanecerDelBanco.estado() : null')
    console.log(JSON.stringify({ clip: nombre, desde, puerta, hasta, estado, ...r }))
  } finally {
    await b.cerrar()
  }
}

/**
 * T4 · el polvo que se posa: una vuelta corta para que la cámara recién frene al empezar el clip; quieto
 * 14 s (empieza a posarse a los ~4 s y está en el piso a los ~10 s) y el despertar (el remolino, a velocidad real).
 */
async function sePosa(): Promise<void> {
  const dir = carpeta7('se-posa')
  const b = await abrir7('producto')
  try {
    await mover(b, FUERA[0], FUERA[1])
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    await esperar(2500)
    await scrollSuave(b, 0, quienes * 0.3, 900)
    await scrollSuave(b, quienes * 0.3, 0, 900)
    const r = await grabar(b, `${dir}/se-posa-y-despierta`, async () => {
      await esperar(14000)
      await scrollSuave(b, 0, quienes * 0.5, 700)
      await esperar(5000)
    }, 1440)
    console.log(JSON.stringify({ clip: 'se-posa', ...r }))
  } finally {
    await b.cerrar()
  }
}

/**
 * T5 · el techo del ojo: 45 s quieto en Números de noche (la cámara al ras del piso), donde una cresta con
 * el anillo del pulso encima subía un bloque por encima de la cámara. Se mide la luz de la franja de arriba
 * del horizonte cuadro por cuadro: un bloque delante la hunde.
 */
async function ojo(): Promise<void> {
  const dir = carpeta7('piso-vivo')
  const b = await abrir7('producto')
  try {
    await mover(b, FUERA[0], FUERA[1])
    await scrollHasta(b, 3900)
    await esperar(3000)
    const r = await grabar(b, `${dir}/ojo-numeros-45s`, () => esperar(45000), 1440)
    console.log(JSON.stringify({ clip: 'ojo', ...r }))
  } finally {
    await b.cerrar()
  }
}

/** T3 · la noche quieta en Trabajos y mirando el cielo (Números), y la esquina de arriba al doble. */
async function cielo(): Promise<void> {
  const dir = carpeta7('cielo')
  for (const [nombre, donde] of [['trabajos', 'trabajos+0'], ['numeros', '3900']] as const) {
    const b = await abrir7('producto')
    try {
      await mover(b, FUERA[0], FUERA[1])
      await scrollHasta(b, await scrollDe(b, donde))
      await esperar(3000)
      const destino = `${dir}/noche-quieta-${nombre}`
      const r = await grabar(b, destino, () => esperar(12000), 1440)
      recorte(`${destino}.mp4`, `${destino}-esquina-x2.mp4`, 0, 0, 720, 300)
      console.log(JSON.stringify({ clip: `cielo-${nombre}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
}

/** T8 · la niebla: quieta en Quiénes somos, un scroll rápido (se abre) y el freno (se posa enseguida), ida y vuelta. */
async function niebla(): Promise<void> {
  const dir = carpeta7('niebla')
  const b = await abrir7('producto')
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    const lejos = await topeMas('quienes-somos', 0.9)(b)
    await scrollHasta(b, quienes)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const r = await grabar(b, `${dir}/se-abre-con-el-scroll`, async () => {
      await esperar(2500)
      await scrollSuave(b, quienes, lejos, 500)
      await esperar(3500)
      await scrollSuave(b, lejos, quienes, 500)
      await esperar(3500)
    }, 1440)
    console.log(JSON.stringify({ clip: 'niebla', ...r }))
  } finally {
    await b.cerrar()
  }
}

/** T6 · el aire con inercia: el mismo scroll y freno, con y sin (el polvo sigue derivando ~2 s). */
async function inercia(): Promise<void> {
  const dir = carpeta7('inercia')
  for (const [nombre, pedido] of [['con', 'producto'], ['sin', 'producto,inercia=no']] as const) {
    const b = await abrir7(pedido)
    try {
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(2500)
      const r = await grabar(b, `${dir}/${nombre}`, async () => {
        await esperar(1000)
        await scrollSuave(b, 0, quienes * 0.4, 900)
        await esperar(4500)
        await scrollSuave(b, quienes * 0.4, 0, 900)
        await esperar(4500)
      }, 1440)
      console.log(JSON.stringify({ clip: `inercia-${nombre}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
  ladoALado(`${dir}/sin.mp4`, `${dir}/con.mp4`, `${dir}/sin-y-con.mp4`, ['sin inercia', 'con inercia (producto)'])
}

/**
 * T12 · de noche, quieto sobre el charco del haz: las sombritas de las motas y el rebote en el logo. Graba
 * apenas frena la cámara (a los 4 s de quietud el polvo empieza a posarse y se van las motas del haz); el
 * recorte es el charco, debajo del logo.
 */
async function motas(): Promise<void> {
  const dir = carpeta7('motas')
  const b = await abrir7('producto')
  try {
    await mover(b, FUERA[0], FUERA[1])
    await scrollHasta(b, await topeMas('trabajos', 0)(b))
    await esperar(300)
    const destino = `${dir}/noche-charco`
    const r = await grabar(b, destino, () => esperar(12000), 1440)
    recorte(`${destino}.mp4`, `${destino}-x2.mp4`, 230, 440, 720, 440)
    console.log(JSON.stringify({ clip: 'motas', ...r }))
  } finally {
    await b.cerrar()
  }
}

/** T13 · las pruebas nuevas, cada una en su momento (con su bandera). */
async function pruebas(que: string): Promise<void> {
  const dir = carpeta7('pruebas')
  const pedido = que === 'todas' ? 'producto,fibras,fugaz,enfoque,grano' : `producto,${que}`
  const b = await abrir7(pedido)
  try {
    await mover(b, FUERA[0], FUERA[1])
    if (que === 'fugaz') {
      // La noche mirando el cielo (los números): una a mano enseguida, y después las que salen solas.
      await scrollHasta(b, 3900)
      await esperar(3000)
      const r = await grabar(b, `${dir}/fugaz-noche`, async () => {
        await esperar(700)
        await medir(b.p, 'window.__fugazDelBanco.ya()')
        await esperar(14000)
      }, 1440)
      console.log(JSON.stringify({ clip: 'fugaz', cuantas: await medir<number>(b.p, 'window.__fugazDelBanco.cuantas()'), ...r }))
    } else if (que === 'enfoque') {
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      await esperar(2000)
      const r = await grabar(b, `${dir}/enfoque-al-frenar`, async () => {
        await esperar(800)
        await scrollSuave(b, 0, quienes * 0.45, 1400)
        await esperar(2500)
        await scrollSuave(b, quienes * 0.45, quienes, 1400)
        await esperar(2500)
      }, 1440)
      console.log(JSON.stringify({ clip: 'enfoque', ...r }))
    } else {
      // Fibras y grano: quieto en el hero y en Quiénes somos.
      await esperar(2000)
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      const r = await grabar(b, `${dir}/${que}`, async () => {
        await esperar(6000)
        await scrollSuave(b, 0, quienes, 1600)
        await esperar(6000)
      }, 1440)
      console.log(JSON.stringify({ clip: que, ...r }))
    }
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  if (QUE === 'pruebas') return pruebas(VARIANTE)
  if (QUE === 'se-posa') return sePosa()
  if (QUE === 'ojo') return ojo()
  if (QUE === 'cielo') return cielo()
  if (QUE === 'niebla') return niebla()
  if (QUE === 'inercia') return inercia()
  if (QUE === 'motas') return motas()
  if (QUE === 'amanecer') return amanecer(VARIANTE)
  if (QUE === 'haz') return haz()
  if (QUE === 'piso') return piso(VARIANTE === 'mar-quienes' ? 'mar' : VARIANTE, VARIANTE === 'mar' ? 'mar-20s-hero' : VARIANTE === 'mar-quienes' ? 'mar-20s-quienes' : 'pulso')
  if (QUE === 'obstaculo') return VARIANTE === 'juntar' ? obstaculoLadoALado() : obstaculo(VARIANTE === 'antes' ? 'antes' : 'despues')
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('clips7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
