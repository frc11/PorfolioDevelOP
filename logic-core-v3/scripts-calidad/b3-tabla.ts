/** [CALIDAD 1] B3 · la tabla del entregable: cuánto se aparta el aire del polvo del tiempo continuo, por frecuencia. */
import { FISICA, pasoDelAire } from '../src/app/v3/_lib/escena/polvo/simulacion'

type Paso = (d: number, v: number, viento: number, dt: number) => { readonly d: number; readonly v: number }
type Serie = readonly (readonly [number, number])[]
const viento = (t: number): number => (t < 0.6 ? 3 : 3 * Math.exp(-(t - 0.6) / 1.4))
function serie(paso: Paso, hz: number): Serie {
  const dt = 1 / hz
  let [d, v] = [0, 0]
  const s: [number, number][] = []
  for (let t = 0; t < 4; t += dt) {
    const r = paso(d, v, viento(t), dt)
    ;[d, v] = [r.d, r.v]
    s.push([t + dt, d])
  }
  return s
}
/** El valor de una serie en el instante `t`, interpolado entre sus dos muestras. */
function en(s: Serie, t: number): number {
  const i = s.findIndex(([x]) => x >= t)
  if (i <= 0) return s[Math.max(i, 0)][1]
  const [[x0, y0], [x1, y1]] = [s[i - 1], s[i]]
  return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0)
}
const continuo = serie(pasoDelAire, 20000)
const pico = Math.max(...continuo.map(([, d]) => Math.abs(d)))
const euler: Paso = (d, v, w, dt) => {
  const v1 = v + ((w - v) / FISICA.aire.arrastre - FISICA.aire.rigidez * d - FISICA.aire.amortigua * v) * dt
  return { d: d + v1 * dt, v: v1 }
}
/** Cada muestra contra la referencia en EL MISMO instante, en % del pico. */
const contra = (s: Serie, ref: Serie): number => (Math.max(...s.filter(([t]) => t < 3.9).map(([t, d]) => Math.abs(d - en(ref, t)))) / pico) * 100
console.log('Hz    Euler explicito (antes)   Euler exponencial (B3)   (contra el tiempo continuo, % del pico)')
for (const hz of [30, 60, 75, 120, 144]) console.log(`${String(hz).padEnd(5)} ${contra(serie(euler, hz), continuo).toFixed(2).padStart(6)} %                  ${contra(serie(pasoDelAire, hz), continuo).toFixed(2).padStart(6)} %`)
console.log(`60 contra 144 Hz: antes ${contra(serie(euler, 60), serie(euler, 144)).toFixed(2)} %, ahora ${contra(serie(pasoDelAire, 60), serie(pasoDelAire, 144)).toFixed(2)} % del pico`)
