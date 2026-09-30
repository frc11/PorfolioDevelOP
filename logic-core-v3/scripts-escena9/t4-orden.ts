/**
 * SPRINT ESCENA 9 — T4 · el orden de lo opaco: t4-orden.ts [ancho alto dpr]
 *
 * Lo opaco se dibuja en el orden en que three lo encuentra (por material, no por distancia), y el piso vivo, una malla
 * instanciada, dibuja sus bloques de atrás (−z) hacia adelante: cada costado se pinta entero y después lo tapa el bloque
 * de adelante. Si lo de adelante se dibuja primero, la profundidad ya escrita descarta lo tapado ANTES de pintarlo.
 * En la MISMA carga y en el mismo lugar, el tiempo de GPU por objeto (`__gpuDelBanco.medir`) con tres órdenes:
 *   hoy        como está.
 *   adelante   el logo, las primeras filas de la formación y el piso vivo antes que el resto de lo opaco.
 *   bloques    lo anterior y además los bloques del piso vivo de adelante hacia atrás desde la cámara de ese momento.
 * La imagen no cambia (todo es opaco y con profundidad); se compara igual, en el mismo cuadro. Va a
 * `escena9/t4-fluidez/orden/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirMotor } from '../scripts-calidad/motor/abrir'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { mismoCuadro } from './mismo-cuadro'

const [ANCHO, ALTO, DPR] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 1.5)]
const PLACA = process.env.BANCO_GPU === 'alta' ? 'nvidia' : 'amd'

/** Pone el orden pedido (en la página). `hoy` devuelve todo a como estaba. */
const ORDENAR = `(() => {
  const escena = window.__gpuDelBanco.tres().escena
  const logo = escena.getObjectByName('logo')
  const filas = escena.getObjectByName('formación · primeras filas')
  const piso = escena.getObjectByName('piso vivo')
  const antes = new Map()
  const guardar = (o) => { if (o && !antes.has(o)) antes.set(o, o.renderOrder) }
  const mallasDelLogo = []
  if (logo) logo.traverse((o) => { if (o.isMesh) mallasDelLogo.push(o) })
  for (const o of [...mallasDelLogo, filas, piso]) guardar(o)
  // El orden de los bloques: el de hoy (guardado) y uno de adelante hacia atrás desde la cámara del momento.
  const matrices = piso.instanceMatrix.array.slice()
  const celdas = piso.geometry.attributes.aCelda.array.slice()
  const n = piso.count
  const ponerBloques = (orden) => {
    const m = piso.instanceMatrix.array, c = piso.geometry.attributes.aCelda.array
    for (let k = 0; k < n; k += 1) { const o = orden[k]; for (let q = 0; q < 16; q += 1) m[k * 16 + q] = matrices[o * 16 + q]; c[k * 2] = celdas[o * 2]; c[k * 2 + 1] = celdas[o * 2 + 1] }
    piso.instanceMatrix.needsUpdate = true
    piso.geometry.attributes.aCelda.needsUpdate = true
  }
  const identidad = Array.from({ length: n }, (_, k) => k)
  window.__ordenDelBanco = (k, camara) => {
    for (const [o, r] of antes) o.renderOrder = r
    ponerBloques(identidad)
    if (k === 'hoy') return
    for (const o of mallasDelLogo) o.renderOrder = -3
    if (filas) filas.renderOrder = -2
    piso.renderOrder = -1
    if (k !== 'bloques') return
    const p = camara.position
    const d = (o) => { const x = matrices[o * 16 + 12] - p.x, z = matrices[o * 16 + 14] - p.z; return x * x + z * z }
    ponerBloques(identidad.slice().sort((a, b) => d(a) - d(b)))
  }
  return n
})()`

const ORDENES = ['hoy', 'adelante', 'bloques'] as const

interface Perfil {
  readonly totalMs: number
  readonly pasadas: Record<string, { ms: number; veces: number }>
}

async function principal(): Promise<void> {
  const dir = carpeta('t4-fluidez/orden')
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR })
  const salida: Record<string, Record<string, unknown>> = {}
  try {
    const d = await medir<{ topes: Record<string, number>; altos: Record<string, number>; vh: number }>(
      b.p,
      `(() => { const topes = {}, altos = {}; for (const p of document.querySelectorAll('[data-panel]')) { const r = p.getBoundingClientRect(); topes[p.getAttribute('data-panel')] = Math.round(r.top + scrollY); altos[p.getAttribute('data-panel')] = Math.round(r.height) } return { topes, altos, vh: innerHeight } })()`,
    )
    const momentos = [
      { nombre: 'hero', y: 0 },
      { nombre: 'quiénes somos', y: d.topes['quienes-somos'] + Math.round(0.15 * d.vh) },
      { nombre: 'demos de noche', y: d.topes.trabajos + Math.round(0.85 * d.altos.trabajos) },
      { nombre: 'por qué develOP', y: d.topes['por-que-develop'] + Math.round(0.7 * d.vh) },
    ]
    const bloques = await medir<number>(b.p, ORDENAR)
    console.log('bloques del piso vivo', bloques)
    for (const m of momentos) {
      const y0 = await medir<number>(b.p, 'scrollY')
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(${String(y0)}, ${String(m.y)}, 1800)`)
      await esperar(2500)
      const fila: Record<string, unknown> = {}
      // La cámara del momento (la de la escena: r3f la pasa a gl.render).
      await medir(b.p, `(() => { const { gl, escena } = window.__gpuDelBanco.tres(); const r = gl.render; gl.render = function (s, c) { if (s === escena) window.__camaraDelBanco = c; return r.apply(this, arguments) }; return new Promise((listo) => requestAnimationFrame(() => { gl.render = r; listo(true) })) })()`)
      for (const k of ORDENES) {
        await medir(b.p, `window.__ordenDelBanco('${k}', window.__camaraDelBanco)`)
        await esperar(600)
        const perfil = await medir<Perfil>(b.p, 'window.__gpuDelBanco.medir(150)')
        const top = Object.entries(perfil.pasadas).sort((a, c) => c[1].ms - a[1].ms).slice(0, 6).map(([n, v]) => [n, Math.round(v.ms * 1000) / 1000])
        fila[k] = { totalMs: Math.round(perfil.totalMs * 100) / 100, top }
      }
      // La imagen: el mismo cuadro con los tres órdenes (tiene que dar cero).
      const igual = await medir<{ distintos: { enTodo: number; maxima: number }[] }>(b.p, mismoCuadro(ORDENES, '(k) => window.__ordenDelBanco(k, window.__camaraDelBanco)'))
      fila.distintos = igual.distintos
      await medir(b.p, "window.__ordenDelBanco('hoy', window.__camaraDelBanco)")
      salida[m.nombre] = fila
      console.log(m.nombre, JSON.stringify(Object.fromEntries(ORDENES.map((k) => [k, (fila[k] as { totalMs: number }).totalMs]))), JSON.stringify(igual.distintos))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/orden-${PLACA}-${String(ANCHO)}@${String(DPR)}x.json`, JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('t4-orden.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
