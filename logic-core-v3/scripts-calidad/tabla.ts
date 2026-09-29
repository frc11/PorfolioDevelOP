/**
 * SPRINT CALIDAD 1 — la tabla de rendimiento: tabla.ts <etiqueta> [contra] [destino]
 *
 * Lee lo que dejó `motor.ts` en `calidad1/motor/<etiqueta>/<ancho>/` y arma una tabla en markdown. Con `contra`
 * (otra etiqueta, la base), cada cifra lleva al lado la de la base y la diferencia. Va a `destino` (por defecto,
 * `calidad1/motor/<etiqueta>/tabla.md`).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { DIRC } from './banco'
import { tramoEn, type Tramo } from './motor/analisis'

const [ETIQUETA, CONTRA, DESTINO] = [process.argv[2] ?? 'base', process.argv[3], process.argv[4]]
const ANCHOS = ['1440', '375']

type Resumen = { n: number; p50: number; p95: number; p99: number; max: number; media: number; mas16: number; mas33: number }
interface Gpu { total: Resumen; porTramo: Record<string, Resumen>; fps: Record<string, { fps: number; msPorCuadro: number }>; tramos: Tramo[]; segundos: number; cuadros: number }
interface Ritmo { refresco: number; total: Resumen & { perdidos: number }; porTramo: Record<string, { cuadros: number; perdidos: number; peorMs: number; p99: number }> }
interface Cpu { segundos: number; perfil: { especiales: Record<string, number>; porArchivo: [string, number][]; porFuncion: [string, number][]; pausasDelRecolector: { cuantas: number; peorMs: number; totalMs: number } }; commits: { commits: number; porComponente: [string, number][] }; cuadrosLargos: { t: number; ms: number; bloquea: number; y: number }[]; tramos: Tramo[] }
interface Pasadas { momentos: Record<string, { totalCuadroMs: number; rendersPorSegundo: number; pasadas: [string, number, number][] }> }
interface Memoria { momentos: Record<string, { bytesPorCuadro: number; recolectorMs: number; porFuncion: [string, number][] }> }

function leer<T>(etiqueta: string, ancho: string, parte: string): T | null {
  const a = `${DIRC}/motor/${etiqueta}/${ancho}/${parte}.json`
  return existsSync(a) ? (JSON.parse(readFileSync(a, 'utf8')) as T) : null
}

const f = (x: number | undefined, d = 2): string => (x === undefined || !Number.isFinite(x) ? '–' : x.toFixed(d).replace('.', ','))
/** La cifra de ahora y, si hay base, la de la base y la diferencia. */
const c = (ahora: number | undefined, antes: number | undefined, d = 2): string => (antes === undefined ? f(ahora, d) : `${f(ahora, d)} (${f(antes, d)}; ${ahora !== undefined && Number.isFinite(ahora - antes) ? `${ahora - antes >= 0 ? '+' : ''}${f(ahora - antes, d)}` : '–'})`)

function seccion(ancho: string): string[] {
  const L: string[] = [`## ${ancho} px`, '']
  const gpu = leer<Gpu>(ETIQUETA, ancho, 'gpu')
  const gpuB = CONTRA === undefined ? null : leer<Gpu>(CONTRA, ancho, 'gpu')
  if (gpu !== null) {
    L.push('### El costo de dibujar: GPU por cuadro (sin vsync)', '')
    L.push(`Recorrido entero a velocidad constante: ${f(gpu.segundos, 1)} s, ${String(gpu.total.n)} cuadros dibujados. ms de GPU por cuadro (la escena y las simulaciones de ese cuadro); «cps» son los cuadros por segundo del tramo (todos los rAF: con la escena suspendida detrás de un panel opaco suben solos).${CONTRA === undefined ? '' : ` Entre paréntesis: ${CONTRA}; diferencia.`}`, '')
    L.push('| tramo | cuadros | p50 | p95 | p99 | máx | >16,7 | >33 | cps |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|')
    for (const t of gpu.tramos) {
      const g = gpu.porTramo[t.nombre]
      if (g === undefined) continue
      const b = gpuB?.porTramo[t.nombre]
      L.push(`| ${t.nombre} | ${String(g.n)} | ${c(g.p50, b?.p50)} | ${c(g.p95, b?.p95)} | ${c(g.p99, b?.p99)} | ${c(g.max, b?.max, 1)} | ${c(g.mas16, b?.mas16, 0)} | ${c(g.mas33, b?.mas33, 0)} | ${c(gpu.fps[t.nombre]?.fps, gpuB?.fps[t.nombre]?.fps, 0)} |`)
    }
    const b = gpuB?.total
    L.push(`| **todo** | ${String(gpu.total.n)} | ${c(gpu.total.p50, b?.p50)} | ${c(gpu.total.p95, b?.p95)} | ${c(gpu.total.p99, b?.p99)} | ${c(gpu.total.max, b?.max, 1)} | ${c(gpu.total.mas16, b?.mas16, 0)} | ${c(gpu.total.mas33, b?.mas33, 0)} | ${c(gpu.cuadros / gpu.segundos, gpuB === null ? undefined : gpuB.cuadros / gpuB.segundos, 0)} |`, '')
  }
  const ritmo = leer<Ritmo>(ETIQUETA, ancho, 'ritmo')
  const ritmoB = CONTRA === undefined ? null : leer<Ritmo>(CONTRA, ancho, 'ritmo')
  if (ritmo !== null) {
    L.push(`### El ritmo: con vsync (${f(ritmo.refresco, 2)} ms, el monitor de la máquina)`, '')
    L.push('Cuadros que tardaron más de un refresco y medio: se perdió al menos un refresco (un tirón).', '')
    L.push('| tramo | cuadros | perdidos | p99 (ms) | peor (ms) |', '|---|---:|---:|---:|---:|')
    for (const [k, v] of Object.entries(ritmo.porTramo)) {
      const b = ritmoB?.porTramo[k]
      L.push(`| ${k} | ${String(v.cuadros)} | ${c(v.perdidos, b?.perdidos, 0)} | ${c(v.p99, b?.p99, 1)} | ${c(v.peorMs, b?.peorMs, 1)} |`)
    }
    L.push(`| **todo** | ${String(ritmo.total.n)} | ${c(ritmo.total.perdidos, ritmoB?.total.perdidos, 0)} | ${c(ritmo.total.p99, ritmoB?.total.p99, 1)} | ${c(ritmo.total.max, ritmoB?.total.max, 1)} |`, '')
  }
  const pasadas = leer<Pasadas>(ETIQUETA, ancho, 'pasadas')
  const pasadasB = CONTRA === undefined ? null : leer<Pasadas>(CONTRA, ancho, 'pasadas')
  if (pasadas !== null) {
    L.push('### GPU por pasada, en los momentos (ms por cuadro, sin vsync)', '')
    const nombres = [...new Set(Object.values(pasadas.momentos).flatMap((m) => m.pasadas.map(([k]) => k)))]
    const momentos = Object.keys(pasadas.momentos)
    L.push(`| pasada | ${momentos.join(' | ')} |`, `|---|${momentos.map(() => '---:').join('|')}|`)
    const valor = (p: Pasadas | null, m: string, k: string): number | undefined => p?.momentos[m]?.pasadas.find(([n]) => n === k)?.[1]
    const orden = nombres.sort((a, b) => Math.max(...momentos.map((m) => valor(pasadas, m, b) ?? 0)) - Math.max(...momentos.map((m) => valor(pasadas, m, a) ?? 0)))
    for (const k of orden) L.push(`| ${k} | ${momentos.map((m) => c(valor(pasadas, m, k), pasadasB === null ? undefined : valor(pasadasB, m, k), 2)).join(' | ')} |`)
    L.push(`| **el cuadro** (una consulta) | ${momentos.map((m) => c(pasadas.momentos[m].totalCuadroMs, pasadasB?.momentos[m]?.totalCuadroMs, 2)).join(' | ')} |`)
    L.push(`| renders por segundo | ${momentos.map((m) => c(pasadas.momentos[m].rendersPorSegundo, pasadasB?.momentos[m]?.rendersPorSegundo, 0)).join(' | ')} |`, '')
  }
  const cpu = leer<Cpu>(ETIQUETA, ancho, 'cpu')
  const cpuB = CONTRA === undefined ? null : leer<Cpu>(CONTRA, ancho, 'cpu')
  if (cpu !== null) {
    L.push('### El hilo principal en el recorrido (perfil de CPU, sin vsync)', '')
    const fn = (p: Cpu | null, k: string): number | undefined => p?.perfil.porFuncion.find(([n]) => n.startsWith(`${k} ·`))?.[1]
    const ar = (p: Cpu | null, k: string): number | undefined => p?.perfil.porArchivo.find(([n]) => n === k)?.[1]
    L.push(`- Recorrido de ${f(cpu.segundos, 1)} s. **Compilar shaders** (\`getProgramInfoLog\`: el enlace que se espera la primera vez que aparece una variante): ${c(fn(cpu, 'getProgramInfoLog'), fn(cpuB, 'getProgramInfoLog'), 0)} ms.`)
    L.push(`- **Recolector**: ${c(cpu.perfil.pausasDelRecolector.totalMs, cpuB?.perfil.pausasDelRecolector.totalMs, 0)} ms en ${c(cpu.perfil.pausasDelRecolector.cuantas, cpuB?.perfil.pausasDelRecolector.cuantas, 0)} pausas; la peor, ${c(cpu.perfil.pausasDelRecolector.peorMs, cpuB?.perfil.pausasDelRecolector.peorMs, 1)} ms.`)
    L.push(`- **Commits de React** durante el recorrido: ${c(cpu.commits.commits, cpuB?.commits.commits, 0)} (componentes vueltos a dibujar en total: ${c(cpu.commits.porComponente.reduce((a, [, v]) => a + v, 0), cpuB?.commits.porComponente.reduce((a, [, v]) => a + v, 0), 0)}).`)
    L.push(`- **Lenis**: ${c(ar(cpu, 'npm:lenis'), ar(cpuB, 'npm:lenis'), 0)} ms propios. **Motion** (framer-motion + motion-dom): ${c((ar(cpu, 'npm:framer-motion') ?? 0) + (ar(cpu, 'npm:motion-dom') ?? 0), cpuB === null ? undefined : (ar(cpuB, 'npm:framer-motion') ?? 0) + (ar(cpuB, 'npm:motion-dom') ?? 0), 0)} ms. **La atadura de la escena al scroll**: ${c(ar(cpu, 'app/v3/_lib/escena/ataduraAlScroll.ts'), ar(cpuB, 'app/v3/_lib/escena/ataduraAlScroll.ts'), 0)} ms. **three**: ${c(ar(cpu, 'npm:three'), ar(cpuB, 'npm:three'), 0)} ms. **r3f**: ${c(ar(cpu, 'npm:@react-three/fiber'), ar(cpuB, 'npm:@react-three/fiber'), 0)} ms.`)
    L.push(`- Llamadas nativas (WebGL, DOM): ${c(ar(cpu, '(nativo)'), ar(cpuB, '(nativo)'), 0)} ms — sin vsync y con la GPU al límite, el hilo espera a la GPU adentro de la llamada de WebGL que llena la cola (\`uniformMatrix4fv\`: ${c(fn(cpu, 'uniformMatrix4fv'), fn(cpuB, 'uniformMatrix4fv'), 0)} ms): es espera, no costo propio.`)
    L.push(`- **Cuadros largos** (Long Animation Frames, más de 50 ms): ${c(cpu.cuadrosLargos.length, cpuB?.cuadrosLargos.length, 0)}; el peor, ${c(Math.max(0, ...cpu.cuadrosLargos.map((l) => l.ms)), cpuB === null ? undefined : Math.max(0, ...cpuB.cuadrosLargos.map((l) => l.ms)), 0)} ms. Dónde caen: ${cpu.cuadrosLargos.filter((l) => l.ms >= 150).map((l) => `${String(l.ms)} ms en «${tramoEn(cpu.tramos, l.y)}»`).join(', ') || 'ninguno de 150 ms o más'}.`, '')
    L.push('Los archivos propios que más tiempo se llevan (ms propios en el recorrido):', '')
    L.push('| archivo | ms |', '|---|---:|')
    for (const [k, v] of cpu.perfil.porArchivo.filter(([k]) => k !== '(nativo)').slice(0, 14)) L.push(`| ${k} | ${c(v, ar(cpuB, k), 0)} |`)
    L.push('')
  }
  const memoria = leer<Memoria>(ETIQUETA, ancho, 'memoria')
  const memoriaB = CONTRA === undefined ? null : leer<Memoria>(CONTRA, ancho, 'memoria')
  if (memoria !== null) {
    L.push('### Memoria con la escena quieta (6 s, muestreo de V8)', '')
    L.push('| momento | bytes por cuadro | recolector (ms en 6 s) | lo que más reserva (bytes por cuadro) |', '|---|---:|---:|---|')
    for (const [k, v] of Object.entries(memoria.momentos)) L.push(`| ${k} | ${c(v.bytesPorCuadro, memoriaB?.momentos[k]?.bytesPorCuadro, 0)} | ${c(v.recolectorMs, memoriaB?.momentos[k]?.recolectorMs, 1)} | ${v.porFuncion.slice(0, 4).map(([n, b]) => `${n.replace(' · (nativo)', '')} ${String(b)}`).join('; ')} |`)
    L.push('')
  }
  return L
}

const L = [`# Rendimiento de la escena — ${ETIQUETA}${CONTRA === undefined ? '' : ` contra ${CONTRA}`}`, '', 'Máquina de medición: AMD Radeon integrada (ANGLE, Direct3D 11), monitor de 75 Hz. Servidor de desarrollo (React en modo desarrollo: sus costos son una cota de arriba). DPR 1.', '']
for (const a of ANCHOS) L.push(...seccion(a))
const destino = DESTINO ?? `${DIRC}/motor/${ETIQUETA}/tabla.md`
writeFileSync(destino, L.join('\n'))
console.log(destino)
