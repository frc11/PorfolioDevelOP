/**
 * SPRINT CALIDAD 1 — B4 · LOS SALTOS DEL POLVO: saltos.ts <ancho> <alto> <modelo: antes|despues> <etiqueta>
 *
 * Cuenta, cuadro a cuadro, las motas EN PANTALLA que aparecen o desaparecen de golpe (su visibilidad cambia más de
 * 0,3 en un cuadro) o que saltan de lugar (más de 1,5 u en el mundo de un cuadro al otro, visibles en los dos). La
 * cuenta del shader del polvo (`volumen.ts` y `FISICA_EN_LA_MOTA_GLSL`) replicada en JS e inyectada en la página:
 * corre después de cada render de la escena, con la cámara de ese render y el estado real de la física.
 *
 * `antes`: la visibilidad del shader de antes de B4 (la del aire en el modo 0, la de la mota suelta en los otros).
 * `despues`: la de B4 (la cámara y la sala donde se dibuja la mota; el corte del volumen del aire, sus caras y el
 * piso, mezclado por el peso de la mota suelta que la simulación guarda en el modo; en el aire, el de las caras con
 * el peso topado por el propio corte).
 *
 * Los CORTES no cuentan: el cuadro en que la escena se suspende o se reanuda (detrás de una sección opaca: más de
 * 100 ms desde el anterior, la cámara que salta más de 3 u o gira más de 10°, o el reloj de las conchas que salta)
 * cambia la imagen entera y no se ve (está tapada). Se cuentan aparte.
 *
 * Tramos: reposo (12 s quieto en el hero: el polvo se posa), despertar (un scroll corto con el polvo posado, y 8 s:
 * lo levantado vuelve al aire), recorrido humano (la página entera a 1.500 px/s, un scroll fuerte sostenido) y
 * recorrido (de nuevo arriba, la página entera a 7.500 px/s: la prueba de esfuerzo). Cada salto se atribuye al factor
 * de la visibilidad que más cambió en ese cuadro (la lente, el alcance, la sala, las caras de la caja o el piso; si su
 * lugar en la caja se repitió en ese cuadro, a las caras), y los que caen con la cámara RÁPIDA (0,5 u o más en el
 * cuadro: el tramo final de Por qué develOP la mueve 1,5 u por cuadro con un scroll fuerte) se cuentan aparte: ahí
 * cualquier fundido del espacio dura dos o tres cuadros.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { NITIDEZ } from '../src/app/v3/_lib/escena/polvo/nitidez'
import { POLVO_PAREJO } from '../src/app/v3/_lib/escena/polvo/volumen'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const MODELO = process.argv[4] === 'despues' ? 'despues' : 'antes'
const ETIQUETA = process.argv[5] ?? MODELO

const K = { L: POLVO_PAREJO.lado, atras: POLVO_PAREJO.atras, fundido: POLVO_PAREJO.fundido, alcance: POLVO_PAREJO.alcance, radio: POLVO_PAREJO.radio, piso: POLVO_PAREJO.piso, cerca: NITIDEZ.cerca }

/** El instrumento, en la página. */
export const INSTRUMENTO = `(() => {
  const K = ${JSON.stringify(K)}
  const { gl, escena } = window.__gpuDelBanco.tres()
  const fisica = window.__fisicaDelBanco
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
  const N = 14000
  const antes = { fx: new Float32Array(N), fy: new Float32Array(N), fz: new Float32Array(N), vis: new Float32Array(N), x: new Float32Array(N), y: new Float32Array(N), z: new Float32Array(N), en: new Uint8Array(N), modo: new Uint8Array(N), hay: new Uint8Array(N), f: new Float32Array(N * 5) }
  const FACTORES = ['lente', 'alcance', 'sala', 'caras', 'piso']
  const ahoraF = new Float32Array(5)
  let medida = null
  let modelo = 'antes'
  let previo = null
  const vacio = (tramo) => ({ tramo, cuadros: 0, cortes: 0, visiblesSuma: 0, saltosVis: 0, saltosPos: 0, peorCuadroVis: 0, peorCuadroPos: 0, divergentes: 0, peorD: 0, porPaso: {}, porFactor: {}, conCamaraRapida: 0, porFactorRapida: {}, ejemplosVis: [], ejemplosPos: [], picos: [] })
  const conchas = () => { const r = []; escena.traverse((o) => { if (o.isPoints && o.geometry.getAttribute('aIndice') !== undefined) r.push(o) }); return r }
  const anotar = (lista, dato) => { if (lista.length < 8 || (lista.length < 24 && Math.random() < 0.03)) lista.push(dato) }
  function medirCuadro(camara) {
    const e = fisica.estado()
    if (e === null) return
    const aire = fisica.aire()
    const d = aire.uDeriva.value
    const lg = aire.uLogo.value.elements
    const cm = camara.matrixWorld.elements
    const [cx, cy, cz] = [cm[12], cm[13], cm[14]]
    const [ax, ay, az] = [-cm[8], -cm[9], -cm[10]]
    const vp = camara.projectionMatrix.clone().multiply(camara.matrixWorldInverse).elements
    const lista = conchas()
    const giros = lista.map((o) => Math.atan2(o.matrixWorld.elements[8], o.matrixWorld.elements[0]))
    const ahora = performance.now()
    const corte = previo !== null && (ahora - previo.t > 100 || Math.hypot(cx - previo.c[0], cy - previo.c[1], cz - previo.c[2]) > 3 || Math.acos(Math.min(1, ax * previo.a[0] + ay * previo.a[1] + az * previo.a[2])) > 0.17 || giros.some((g, k) => Math.abs(Math.atan2(Math.sin(g - previo.g[k]), Math.cos(g - previo.g[k]))) > 0.05))
    const movida = previo === null ? 0 : Math.hypot(cx - previo.c[0], cy - previo.c[1], cz - previo.c[2])
    previo = { t: ahora, c: [cx, cy, cz], a: [ax, ay, az], g: giros }
    let [saltosVis, saltosPos, visibles, divergentes] = [0, 0, 0, 0]
    const rapida = movida >= 0.5
    for (const o of lista) {
      if (!o.visible) continue
      const m = o.matrixWorld.elements
      const pos = o.geometry.getAttribute('position').array
      const ind = o.geometry.getAttribute('aIndice').array
      const n = Math.min(ind.length, o.geometry.drawRange.count)
      // La cámara, el adelante y la deriva en el espacio de la concha (transpuesta del giro).
      const rt = (x, y, z) => [m[0] * x + m[1] * y + m[2] * z, m[4] * x + m[5] * y + m[6] * z, m[8] * x + m[9] * y + m[10] * z]
      const [kx, ky, kz] = rt(cx - m[12], cy - m[13], cz - m[14])
      const [fx, fy, fz] = rt(ax, ay, az)
      const [dx, dy, dz] = rt(d.x, d.y, d.z)
      const h = K.L / 2
      const c = [kx + fx * (h - K.atras), ky + fy * (h - K.atras), kz + fz * (h - K.atras)]
      const camaraYSala = (x, y, z) => { const l = Math.hypot(x - cx, y - cy, z - cz); return ss(0.8, K.cerca, l) * (1 - ss(K.alcance - 4, K.alcance, l)) * (1 - ss(K.radio - 1.5, K.radio, Math.hypot(x, z))) }
      const factoresEn = (x, y, z, g) => { const l = Math.hypot(x - cx, y - cy, z - cz); ahoraF[0] = ss(0.8, K.cerca, l); ahoraF[1] = 1 - ss(K.alcance - 4, K.alcance, l); ahoraF[2] = 1 - ss(K.radio - 1.5, K.radio, Math.hypot(x, z)); ahoraF[3] = g[0]; ahoraF[4] = g[1] }
      for (let j = 0; j < n; j += 1) {
        const i = ind[j]
        const t = [pos[j * 3] + dx, pos[j * 3 + 1] + dy, pos[j * 3 + 2] + dz]
        let borde = 0
        for (let a = 0; a < 3; a += 1) {
          const u = t[a] - c[a] + h
          t[a] = c[a] + (u - K.L * Math.floor(u / K.L)) - h
          borde = Math.max(borde, Math.abs(t[a] - c[a]) / h)
        }
        let wx = m[0] * t[0] + m[4] * t[1] + m[8] * t[2] + m[12]
        let wy = m[1] * t[0] + m[5] * t[1] + m[9] * t[2] + m[13]
        let wz = m[2] * t[0] + m[6] * t[1] + m[10] * t[2] + m[14]
        const repetida = antes.hay[i] && Math.hypot(wx - antes.fx[i], wy - antes.fy[i], wz - antes.fz[i]) > 10
        antes.fx[i] = wx; antes.fy[i] = wy; antes.fz[i] = wz
        const [caras, piso] = [1 - ss(1 - K.fundido, 1, borde), ss(K.piso, K.piso + 0.3, wy)]
        const visAire = caras * piso * camaraYSala(wx, wy, wz)
        const w = e[i * 4 + 3]
        const modo = Math.floor(w + 0.5)
        if (modo === 0) {
          wx += e[i * 4]; wy += e[i * 4 + 1]; wz += e[i * 4 + 2]
          const largo = Math.hypot(e[i * 4], e[i * 4 + 1], e[i * 4 + 2])
          if (largo > 50) divergentes += 1
          if (largo > medida.peorD) medida.peorD = largo
        }
        else if (modo === 3) { const [px, py, pz] = [e[i * 4], e[i * 4 + 1], e[i * 4 + 2]]; wx = lg[0] * px + lg[4] * py + lg[8] * pz + lg[12]; wy = lg[1] * px + lg[5] * py + lg[9] * pz + lg[13]; wz = lg[2] * px + lg[6] * py + lg[10] * pz + lg[14] }
        else { wx = e[i * 4]; wy = e[i * 4 + 1]; wz = e[i * 4 + 2] }
        const visSuelta = camaraYSala(wx, wy, wz)
        let vis
        if (modelo === 'antes') {
          vis = modo > 0 ? visSuelta : visAire
          if (modo > 0) factoresEn(wx, wy, wz, [1, 1])
          else factoresEn(wx - (modo === 0 ? e[i * 4] : 0), wy - (modo === 0 ? e[i * 4 + 1] : 0), wz - (modo === 0 ? e[i * 4 + 2] : 0), [caras, piso])
        } else {
          const peso = ss(0, 1, Math.min(1, Math.max(0, (w - modo) / 0.4)))
          const pesoCaras = modo === 0 ? Math.min(peso, caras) : peso
          const [gc, gp] = [caras + (1 - caras) * pesoCaras, piso + (1 - piso) * peso]
          vis = visSuelta * gc * gp
          factoresEn(wx, wy, wz, [gc, gp])
        }
        const cw = vp[3] * wx + vp[7] * wy + vp[11] * wz + vp[15]
        const nx = (vp[0] * wx + vp[4] * wy + vp[8] * wz + vp[12]) / cw
        const ny = (vp[1] * wx + vp[5] * wy + vp[9] * wz + vp[13]) / cw
        const en = cw > 0 && Math.abs(nx) <= 1 && Math.abs(ny) <= 1 ? 1 : 0
        if (en && vis > 0.05) visibles += 1
        if (antes.hay[i] && !corte) {
          const pantalla = en || antes.en[i]
          const dv = Math.abs(vis - antes.vis[i])
          const paso = antes.modo[i] + '>' + modo
          if (pantalla && dv > 0.3) {
            let [cual, mas] = [0, -1]
            for (let q = 0; q < 5; q += 1) { const cambio = Math.abs(ahoraF[q] - antes.f[i * 5 + q]); if (cambio > mas) { mas = cambio; cual = q } }
            // Si su lugar en la caja se repitió en este cuadro, es de las caras (aunque cambie todo lo demás).
            const factor = repetida && modo === 0 ? 'caras' : FACTORES[cual]
            if (rapida) {
              medida.conCamaraRapida += 1
              medida.porFactorRapida[factor] = (medida.porFactorRapida[factor] || 0) + 1
            } else {
            saltosVis += 1
            medida.porPaso[paso] = (medida.porPaso[paso] || 0) + 1
            medida.porFactor[factor] = (medida.porFactor[factor] || 0) + 1
            anotar(medida.ejemplosVis, { i, scroll: Math.round(scrollY), paso, factor, de: +antes.vis[i].toFixed(2), a: +vis.toFixed(2), y: +wy.toFixed(2), lejos: +Math.hypot(wx - cx, wy - cy, wz - cz).toFixed(1), borde: +borde.toFixed(2), aire: +visAire.toFixed(2), suelta: +visSuelta.toFixed(2) })
            }
          }
          const salto = Math.hypot(wx - antes.x[i], wy - antes.y[i], wz - antes.z[i])
          if (pantalla && salto > 1.5 && vis > 0.05 && antes.vis[i] > 0.05) {
            saltosPos += 1
            anotar(medida.ejemplosPos, { i, scroll: Math.round(scrollY), paso, salto: +salto.toFixed(2), de: [antes.x[i], antes.y[i], antes.z[i]].map((v) => +v.toFixed(1)), a: [wx, wy, wz].map((v) => +v.toFixed(1)), vis: [+antes.vis[i].toFixed(2), +vis.toFixed(2)], borde: +borde.toFixed(2), d: modo === 0 ? +Math.hypot(e[i * 4], e[i * 4 + 1], e[i * 4 + 2]).toFixed(2) : -1 })
          }
        }
        for (let q = 0; q < 5; q += 1) antes.f[i * 5 + q] = ahoraF[q]
        antes.vis[i] = vis; antes.x[i] = wx; antes.y[i] = wy; antes.z[i] = wz; antes.en[i] = en; antes.modo[i] = modo; antes.hay[i] = 1
      }
    }
    medida.cuadros += 1
    if (corte) medida.cortes += 1
    if ((saltosVis > 20 || saltosPos > 20) && medida.picos.length < 30) medida.picos.push({ scroll: Math.round(scrollY), camara: +movida.toFixed(2), saltosVis, saltosPos, visibles })
    medida.visiblesSuma += visibles
    medida.divergentes = Math.max(medida.divergentes, divergentes)
    medida.saltosVis += saltosVis
    medida.saltosPos += saltosPos
    medida.peorCuadroVis = Math.max(medida.peorCuadroVis, saltosVis)
    medida.peorCuadroPos = Math.max(medida.peorCuadroPos, saltosPos)
  }
  const render = gl.render.bind(gl)
  gl.render = (s, camara) => { render(s, camara); if (medida !== null && s === escena) medirCuadro(camara) }
  window.__saltosDelPolvo = {
    empezar: (m, tramo) => { modelo = m; medida = vacio(tramo); previo = null; antes.hay.fill(0) },
    parar: () => { const r = medida; medida = null; return r === null ? null : { ...r, visiblesMedia: Math.round(r.visiblesSuma / Math.max(1, r.cuadros)) } },
  }
  return 1
})()`

export interface Tramo {
  readonly tramo: string
  readonly cuadros: number
  readonly cortes: number
  readonly visiblesMedia: number
  readonly saltosVis: number
  readonly saltosPos: number
  readonly peorCuadroVis: number
  readonly peorCuadroPos: number
  readonly divergentes: number
  readonly peorD: number
  readonly porPaso: Record<string, number>
  readonly porFactor: Record<string, number>
  readonly conCamaraRapida: number
  readonly porFactorRapida: Record<string, number>
  readonly ejemplosVis: readonly unknown[]
  readonly ejemplosPos: readonly unknown[]
  readonly picos: readonly unknown[]
}

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  const tramos: Tramo[] = []
  try {
    await medir(b.p, INSTRUMENTO)
    const tramo = async (nombre: string, accion: () => Promise<void>): Promise<void> => {
      await medir(b.p, `window.__saltosDelPolvo.empezar('${MODELO}', '${nombre}')`)
      await accion()
      const r = await medir<Tramo>(b.p, 'window.__saltosDelPolvo.parar()')
      tramos.push(r)
      console.log(`${nombre}: ${String(r.cuadros)} cuadros (${String(r.cortes)} cortes), ${String(r.visiblesMedia)} visibles, saltos de visibilidad ${String(r.saltosVis)} (peor cuadro ${String(r.peorCuadroVis)}), de lugar ${String(r.saltosPos)} (peor ${String(r.peorCuadroPos)}), divergentes ${String(r.divergentes)} (peor |D| ${r.peorD.toExponential(2)}) · ${JSON.stringify(r.porPaso)} · ${JSON.stringify(r.porFactor)} · con la cámara rápida ${String(r.conCamaraRapida)} ${JSON.stringify(r.porFactorRapida)}`)
    }
    await tramo('reposo', () => esperar(12000))
    await tramo('despertar', async () => {
      await medir(b.p, `(async () => { for (let a = 0; a <= 240; a += 40) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, 30)) } return 1 })()`)
      await esperar(8000)
    })
    await tramo('recorrido-humano', async () => {
      await medir(b.p, `(async () => { const fin = document.documentElement.scrollHeight - innerHeight; for (let a = scrollY; a < fin; a += 60) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, 40)) } window.scrollTo(0, fin); return 1 })()`)
      await esperar(2500)
    })
    await medir(b.p, `(async () => { for (let a = scrollY; a > 240; a -= 400) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, 16)) } window.scrollTo(0, 240); return 1 })()`)
    await esperar(3000)
    await tramo('recorrido', async () => {
      await medir(b.p, `(async () => { const fin = document.documentElement.scrollHeight - innerHeight; for (let a = scrollY; a < fin; a += 120) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, 16)) } window.scrollTo(0, fin); return 1 })()`)
      await esperar(3000)
    })
  } finally {
    await b.cerrar()
  }
  const dir = carpeta('b4-bordes')
  writeFileSync(`${dir}/saltos-${ETIQUETA}-${String(ANCHO)}.json`, JSON.stringify({ ancho: ANCHO, modelo: MODELO, tramos }, null, 1))
}

if (process.argv[1]?.endsWith('saltos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
