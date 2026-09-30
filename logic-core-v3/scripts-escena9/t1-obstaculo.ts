/**
 * SPRINT ESCENA 9 — T1 · el obstáculo, afuera: t1-obstaculo.ts <etiqueta: antes|despues|lado> [gesto: fuerte|despertar]
 *
 * Dos gestos, grabados a velocidad real con el recorte al doble del logo:
 *   · `fuerte`: el scroll fuerte de siempre (del hero a Quiénes somos en 0,6 s, quieto, y de vuelta), el de A3.
 *   · `despertar`: 16 s quieto en el hero (el polvo se posa en el piso y sobre el logo), un scroll corto que lo
 *     despierta y 7 s quieto después: lo que estaba sobre el logo tiene que soltarse y no quedar nada en sus bordes.
 *
 * Mientras graba, cada 250 ms, LA CARA DEL LOGO: cuántas motas hay pegadas a la superficie de la malla real (a menos
 * de 0,06 u, afuera), cuántas cerca (de 0,06 a 0,18 u) y cuántas adentro, por modo de la física. La posición de cada
 * mota es la del shader (la del producto más el corrimiento del aire; la suelta, la de la simulación; la posada sobre
 * el logo, en su espacio), como en `scripts-calidad/saltos.ts`; la distancia es a la malla del logo (su contorno, de
 * sus paredes, y su espesor: la misma cuenta que `campoDelLogo.ts`). Con el polvo repartido parejo, la densidad en la
 * cara y la de cerca son iguales; si el polvo se amontona contra la cara, la de la cara es varias veces la de cerca.
 * Va a `escena9/t1-obstaculo/` con la etiqueta; `lado` arma los lado a lado.
 */
import { existsSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { FUERA, recorte, scrollSuave } from '../scripts-escena/clips6'
import { GESTOS_DEL_OBSTACULO, ZONA_DEL_LOGO } from '../scripts-escena/clips7'
import { NITIDEZ } from '../src/app/v3/_lib/escena/polvo/nitidez'
import { POLVO_PAREJO } from '../src/app/v3/_lib/escena/polvo/volumen'
import { abrir, carpeta, ladoALado } from './banco'

const ETIQUETA = process.argv[2] ?? 'antes'
const GESTO = process.argv[3] === 'despertar' ? 'despertar' : 'fuerte'

const K = { L: POLVO_PAREJO.lado, atras: POLVO_PAREJO.atras, cerca: NITIDEZ.cerca }

/** Las bandas de distancia a la cara del logo (u): pegada, cerca. */
export const BANDAS = { cara: 0.06, cerca: 0.18 } as const

/** El instrumento, en la página: `window.__caraDelLogo.contar()` y el muestreo cada 250 ms. */
export const CARA_DEL_LOGO = `(() => {
  const K = ${JSON.stringify(K)}
  const B = ${JSON.stringify(BANDAS)}
  const { gl, escena } = window.__gpuDelBanco.tres()
  const fisica = window.__fisicaDelBanco
  // La cámara del último dibujo de la escena (r3f no la cuelga del grafo).
  let camara = null
  const dibujar = gl.render.bind(gl)
  gl.render = (s, cam) => { if (s === escena) camara = cam; dibujar(s, cam) }
  const logo = escena.getObjectByName('logo')
  const M4 = logo.matrixWorld.constructor
  const V3 = logo.position.constructor
  // El contorno de la malla en el espacio del grupo del logo (como contornoDeLaMalla): las paredes de costado.
  logo.updateMatrixWorld(true)
  const inversa = new M4().copy(logo.matrixWorld).invert()
  const tramos = []
  const vistos = new Set()
  let [zMin, zMax] = [Infinity, -Infinity]
  const [a, b, c, n, tmp] = [new V3(), new V3(), new V3(), new V3(), new V3()]
  logo.traverse((o) => {
    if (!o.isMesh) return
    const pos = o.geometry.getAttribute('position')
    const idx = o.geometry.index
    const mat = new M4().copy(inversa).multiply(o.matrixWorld)
    const cuantos = idx === null ? pos.count : idx.count
    const I = (k) => (idx === null ? k : idx.getX(k))
    for (let t = 0; t + 2 < cuantos; t += 3) {
      a.fromBufferAttribute(pos, I(t)).applyMatrix4(mat)
      b.fromBufferAttribute(pos, I(t + 1)).applyMatrix4(mat)
      c.fromBufferAttribute(pos, I(t + 2)).applyMatrix4(mat)
      zMin = Math.min(zMin, a.z, b.z, c.z)
      zMax = Math.max(zMax, a.z, b.z, c.z)
      n.subVectors(b, a).cross(tmp.subVectors(c, a))
      const largo = n.length()
      if (largo < 1e-12 || Math.abs(n.z / largo) > 0.02) continue
      const pares = [[a, b], [b, c], [a, c]]
      const [p, q] = pares.reduce((x, y) => (Math.hypot(y[0].x - y[1].x, y[0].y - y[1].y) > Math.hypot(x[0].x - x[1].x, x[0].y - x[1].y) ? y : x))
      if (Math.hypot(p.x - q.x, p.y - q.y) < 1e-6) continue
      const k1 = Math.round(p.x * 1e4) + ',' + Math.round(p.y * 1e4)
      const k2 = Math.round(q.x * 1e4) + ',' + Math.round(q.y * 1e4)
      const k = k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1
      if (vistos.has(k)) continue
      vistos.add(k)
      tramos.push(p.x, p.y, q.x, q.y)
    }
  })
  const T = Float64Array.from(tramos)
  const N = T.length / 4
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (let k = 0; k < T.length; k += 2) { x0 = Math.min(x0, T[k]); x1 = Math.max(x1, T[k]); y0 = Math.min(y0, T[k + 1]); y1 = Math.max(y1, T[k + 1]) }
  const [zc, h] = [(zMin + zMax) / 2, (zMax - zMin) / 2]
  const LEJOS = B.cerca + 0.05
  const alTramo = (k, x, y) => {
    const [ax, ay, bx, by] = [T[k * 4], T[k * 4 + 1], T[k * 4 + 2], T[k * 4 + 3]]
    const [dx, dy] = [bx - ax, by - ay]
    const u = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    return Math.hypot(x - ax - u * dx, y - ay - u * dy)
  }
  // La distancia con signo al prisma (negativa adentro); null si está lejos (más que la banda de cerca).
  const distancia = (x, y, z) => {
    if (x < x0 - LEJOS || x > x1 + LEJOS || y < y0 - LEJOS || y > y1 + LEJOS || Math.abs(z - zc) > h + LEJOS) return null
    let d = Infinity
    let cruces = 0
    for (let k = 0; k < N; k += 1) {
      d = Math.min(d, alTramo(k, x, y))
      const [ax, ay, bx, by] = [T[k * 4], T[k * 4 + 1], T[k * 4 + 2], T[k * 4 + 3]]
      if (ay > y !== by > y && ax + ((y - ay) / (by - ay)) * (bx - ax) > x) cruces += 1
    }
    const d2 = cruces % 2 === 1 ? -d : d
    const dz = Math.abs(z - zc) - h
    return Math.hypot(Math.max(d2, 0), Math.max(dz, 0)) + Math.min(Math.max(d2, dz), 0)
  }
  const inv = new M4()
  const conchas = () => { const r = []; escena.traverse((o) => { if (o.isPoints && o.geometry.getAttribute('aIndice') !== undefined) r.push(o) }); return r }
  function contar() {
    const e = fisica.estado()
    if (e === null) return null
    const aire = fisica.aire()
    const d = aire.uDeriva.value
    const lg = aire.uLogo.value.elements
    inv.copy(aire.uLogo.value).invert()
    const il = inv.elements
    if (camara === null) return null
    const cm = camara.matrixWorld.elements
    const [cx, cy, cz] = [cm[12], cm[13], cm[14]]
    const [ax, ay, az] = [-cm[8], -cm[9], -cm[10]]
    // Por modo (0 a 5): adentro, en la cara, cerca.
    const cuenta = [0, 1, 2, 3, 4, 5].map(() => [0, 0, 0])
    for (const o of conchas()) {
      if (!o.visible) continue
      const m = o.matrixWorld.elements
      const pos = o.geometry.getAttribute('position').array
      const ind = o.geometry.getAttribute('aIndice').array
      const nn = Math.min(ind.length, o.geometry.drawRange.count)
      const rt = (x, y, z) => [m[0] * x + m[1] * y + m[2] * z, m[4] * x + m[5] * y + m[6] * z, m[8] * x + m[9] * y + m[10] * z]
      const [kx, ky, kz] = rt(cx - m[12], cy - m[13], cz - m[14])
      const [fx, fy, fz] = rt(ax, ay, az)
      const [dx, dy, dz] = rt(d.x, d.y, d.z)
      const hh = K.L / 2
      const cc = [kx + fx * (hh - K.atras), ky + fy * (hh - K.atras), kz + fz * (hh - K.atras)]
      for (let j = 0; j < nn; j += 1) {
        const i = ind[j]
        const t = [pos[j * 3] + dx, pos[j * 3 + 1] + dy, pos[j * 3 + 2] + dz]
        for (let q = 0; q < 3; q += 1) { const u = t[q] - cc[q] + hh; t[q] = cc[q] + (u - K.L * Math.floor(u / K.L)) - hh }
        let wx = m[0] * t[0] + m[4] * t[1] + m[8] * t[2] + m[12]
        let wy = m[1] * t[0] + m[5] * t[1] + m[9] * t[2] + m[13]
        let wz = m[2] * t[0] + m[6] * t[1] + m[10] * t[2] + m[14]
        const modo = Math.min(5, Math.max(0, Math.floor(e[i * 4 + 3] + 0.5)))
        if (modo === 0) { wx += e[i * 4]; wy += e[i * 4 + 1]; wz += e[i * 4 + 2] }
        else if (modo === 3) { const [px, py, pz] = [e[i * 4], e[i * 4 + 1], e[i * 4 + 2]]; wx = lg[0] * px + lg[4] * py + lg[8] * pz + lg[12]; wy = lg[1] * px + lg[5] * py + lg[9] * pz + lg[13]; wz = lg[2] * px + lg[6] * py + lg[10] * pz + lg[14] }
        else { wx = e[i * 4]; wy = e[i * 4 + 1]; wz = e[i * 4 + 2] }
        if (Math.hypot(wx - cx, wy - cy, wz - cz) < K.cerca) continue
        const qx = il[0] * wx + il[4] * wy + il[8] * wz + il[12]
        const qy = il[1] * wx + il[5] * wy + il[9] * wz + il[13]
        const qz = il[2] * wx + il[6] * wy + il[10] * wz + il[14]
        const dd = distancia(qx, qy, qz)
        if (dd === null) continue
        if (dd < 0) cuenta[modo][0] += 1
        else if (dd < B.cara) cuenta[modo][1] += 1
        else if (dd < B.cerca) cuenta[modo][2] += 1
      }
    }
    return cuenta
  }
  let serie = null
  let id = 0
  window.__caraDelLogo = {
    tramos: N,
    contar,
    empezar() { serie = []; const t0 = performance.now(); id = setInterval(() => { serie.push({ ms: Math.round(performance.now() - t0), scroll: Math.round(scrollY), modos: fisica.modos(), cara: contar() }) }, 250) },
    parar() { clearInterval(id); const s = serie; serie = null; return s },
  }
  return N
})()`

/** Una muestra: los modos de la física y, por modo, las motas adentro, en la cara y cerca. */
export interface Muestra {
  readonly ms: number
  readonly scroll: number
  readonly modos: number[]
  readonly cara: number[][] | null
}

/** Lo que resume una serie: el máximo y el final de lo pegado, y la densidad de la cara contra la de cerca. */
export function resumen(serie: readonly Muestra[]): Record<string, number> {
  const tot = (m: Muestra, banda: number): number => (m.cara ?? []).reduce((s, porModo) => s + porModo[banda], 0)
  const densidad = (m: Muestra): number => {
    // Con una mota de más en la de cerca (Laplace): sin motas cerca no divide por cero.
    return tot(m, 1) / BANDAS.cara / ((tot(m, 2) + 1) / (BANDAS.cerca - BANDAS.cara))
  }
  const ultima = serie[serie.length - 1]
  const sobreElLogo = serie.map((m) => m.modos[3] ?? 0)
  return {
    muestras: serie.length,
    enLaCaraMax: Math.max(...serie.map((m) => tot(m, 1))),
    enLaCaraFinal: ultima === undefined ? 0 : tot(ultima, 1),
    cercaFinal: ultima === undefined ? 0 : tot(ultima, 2),
    adentroMax: Math.max(...serie.map((m) => tot(m, 0))),
    densidadCaraSobreCercaMedia: serie.reduce((s, m) => s + densidad(m), 0) / Math.max(1, serie.length),
    densidadCaraSobreCercaFinal: ultima === undefined ? 0 : densidad(ultima),
    sobreElLogoMax: Math.max(...sobreElLogo),
    sobreElLogoFinal: sobreElLogo[sobreElLogo.length - 1] ?? 0,
  }
}

async function correr(): Promise<void> {
  const dir = carpeta('t1-obstaculo/clips')
  const b = await abrir('producto')
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(GESTO === 'despertar' ? 16000 : 2500)
    const tramos = await medir<number>(b.p, CARA_DEL_LOGO)
    await medir(b.p, 'window.__caraDelLogo.empezar()')
    const destino = `${dir}/${GESTO}-${ETIQUETA}`
    const gesto = GESTO === 'despertar'
      ? async (): Promise<void> => {
        await esperar(1500)
        await scrollSuave(b, 0, 250, 300)
        await esperar(7000)
      }
      : () => GESTOS_DEL_OBSTACULO.fuerte(b, quienes)
    const r = await grabar(b, destino, gesto, 1440)
    const serie = await medir<Muestra[]>(b.p, 'window.__caraDelLogo.parar()')
    recorte(`${destino}.mp4`, `${destino}-logo-x2.mp4`, ...ZONA_DEL_LOGO)
    writeFileSync(`${destino}-cara.json`, JSON.stringify({ gesto: GESTO, etiqueta: ETIQUETA, tramos, bandas: BANDAS, columnas: 'cara[modo] = [adentro, en la cara, cerca]; modos: aire, cayendo, piso, logo, deslizando, levantada', resumen: resumen(serie), serie }))
    console.log(JSON.stringify({ gesto: GESTO, etiqueta: ETIQUETA, clip: r, tramos, ...resumen(serie) }))
  } finally {
    await b.cerrar()
  }
}

/** Los lado a lado de cada gesto que tenga las dos corridas: el clip entero y el recorte del logo al doble. */
function lado(): void {
  const dir = carpeta('t1-obstaculo')
  for (const g of ['fuerte', 'despertar']) {
    for (const cola of ['', '-logo-x2']) {
      const [a, d] = [`${dir}/clips/${g}-antes${cola}.mp4`, `${dir}/clips/${g}-despues${cola}.mp4`]
      if (!existsSync(a) || !existsSync(d)) continue
      ladoALado(a, d, `${dir}/${g}${cola}-antes-y-despues.mp4`, [`${g}${cola.replace('-', ' ')} - antes (rodeo y contacto)`, 'despues (sin obstaculo)'], 720)
      console.log(`${g}${cola}`)
    }
  }
}

if (process.argv[1]?.endsWith('t1-obstaculo.ts')) {
  const paso = ETIQUETA === 'lado' ? async () => lado() : correr
  paso().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
