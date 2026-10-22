/**
 * s78 · B9 (2026-10-22) · EL CRISTAL QUE SE AGRIETA, sin navegador. Cada afirmación con su control positivo. Lo que se ve lo mira el
 * orquestador en el navegador; el costo por cuadro y verlas solas, `scripts-carga/grietas.ts`. Plan y log: `docs/rediseno/SPRINT-B9-NOCTURNO.md`.
 *
 *   1 · los TIEMPOS: se forman en 1,5 s, quedan oscuras 1 s y se encienden; al volver, se apagan y se cierran (también a medio camino);
 *       con movimiento reducido, de una;
 *   2 · las VARIANTES (`?grietas=1|2|3`): telaraña (3 a 5 impactos en estrella), fractura larga (pocas líneas que cruzan y se bifurcan) y
 *       por las juntas (por los bordes de las celdas, de celda en celda); compactas, menos;
 *   3 · la VENTANA: nacen donde la cámara mira el muro (la de la página y las del recorrido del home, a 1440 y a 390);
 *   4 · la REJILLA: lo que lee el sombreador da la misma distancia que medir contra todos los tramos; nada se queda afuera;
 *   5 · EN EL CUADRO: el acento en las páginas, neutro en el home; al cambiar de página se borran; el pedido de otra página no las toca;
 *   6 · el SOMBREADOR: el trozo de las grietas va en el vidrio, detrás de una uniforme; la geometría no cambia;
 *   7 · los ENGANCHES: el título de la página (cuando terminó de entrar) y el del CTA del home (B3), con su firma.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { buildTrack, sampleTrack } from '../escena/choreographySampler'
import type { MutableChoreoPose } from '../escena/choreographyTypes'
import { CRISTAL } from '../escena/cristal/cristal'
import { GRIETAS, GRIETAS_EN_VIVO, avanzarLasGrietas, dispararLasGrietas, faseDeLasGrietas, grietasAlVolverseElCta, grietasCerradas, varianteDeLasGrietas, type EstadoDeLasGrietas, type FaseDeLasGrietas, type VarianteDeLasGrietas } from '../escena/cristal/grietas'
import { GRIETAS_EN_EL_MAIN, GRIETAS_GLSL, uniformesDeLasGrietas } from '../escena/cristal/grietasDelVidrio'
import { crearLasGrietas, ventanaDeLaCamara } from '../escena/cristal/grietasEnVivo'
import { armarElMuro, celdasDelMuro } from '../escena/cristal/muro'
import { trazarLasGrietas } from '../escena/cristal/formas'
import { TEXELES_DE_LAS_CELDAS, TEXELES_DE_LOS_TRAMOS, alrededor, distanciaAlTramo, empaquetar, type RejillaDeLasGrietas, type Tramo, type Ventana } from '../escena/cristal/trazado'
import { FRAGMENTOS_DEL_VIDRIO, uniformesDelVidrio } from '../escena/cristal/vidrio'
import { COMPOSICION_INICIAL, POSE_DE_LA_INTRO } from '../escena/ruta/pistaDeLaIntro'
import { PRESET_DEL_HOME, apilarElPreset, type PresetDeLaEscena } from '../escena/ruta/preset'
import { CAMERA_FOV, ORBIT_TARGET_Y } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (rel: string): string => readFileSync(path.join(V3, rel), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
type P = readonly [number, number]

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los tiempos: se forman en ~1,5 s, quedan oscuras ~1 s, se encienden; al subir, en reversa; con movimiento reducido, de una')

type Avanzar = (e: EstadoDeLasGrietas, dt: number, reducido: boolean) => void
interface Recorrido {
  readonly formadas: number
  readonly oscurasDesde: number
  readonly encendidaDesde: number
  readonly encendidas: number
  readonly fases: readonly FaseDeLasGrietas[]
  readonly monotona: boolean
}
/** El reloj con pasos `dt` (o los de `pasos`), desde `e`, durante `s` segundos: cuándo terminó cada tramo y las fases en orden. */
function recorrer(avanzar: Avanzar, e: EstadoDeLasGrietas, s: number, pasos: () => number): Recorrido {
  let t = 0
  let formadas = Number.NaN
  let oscurasDesde = Number.NaN
  let encendidaDesde = Number.NaN
  let encendidas = Number.NaN
  const fases: FaseDeLasGrietas[] = [faseDeLasGrietas(e)]
  let monotona = true
  let antes = { f: e.formacion, l: e.luz }
  while (t < s) {
    const dt = pasos()
    avanzar(e, dt, false)
    t += dt
    const f = faseDeLasGrietas(e)
    if (f !== fases[fases.length - 1]) fases.push(f)
    const sube = e.sentido === 'avance'
    if (sube ? e.formacion < antes.f - 1e-12 || e.luz < antes.l - 1e-12 : e.formacion > antes.f + 1e-12 || e.luz > antes.l + 1e-12) monotona = false
    antes = { f: e.formacion, l: e.luz }
    if (Number.isNaN(formadas) && (sube ? e.formacion >= 1 : e.luz <= 0)) formadas = t
    if (Number.isNaN(oscurasDesde) && f === 'oscuras') oscurasDesde = t
    if (Number.isNaN(encendidaDesde) && (sube ? e.luz > 0 : e.formacion < 1)) encendidaDesde = t
    if (Number.isNaN(encendidas) && (sube ? e.luz >= 1 : e.formacion <= 0)) encendidas = t
  }
  return { formadas, oscurasDesde, encendidaDesde, encendidas, fases, monotona }
}
const PASO = 1 / 60
const cerca = (a: number, b: number, tol = PASO + 1e-9): boolean => Math.abs(a - b) <= tol
const ida = (e: EstadoDeLasGrietas): EstadoDeLasGrietas => ({ ...e, sentido: 'avance' })
const T = GRIETAS.tiempos

/** `cuadro`: el más largo de los pasos (cada tiempo se lee al final de un cuadro: a lo sumo uno tarde). */
const tiemposBien = (avanzar: Avanzar, pasos: () => number, cuadro = PASO): boolean => {
  const a = recorrer(avanzar, ida(grietasCerradas()), 5, pasos)
  // Desde el pedido (el sentido ya es `avance`): formándose desde el primer cuadro.
  const fasesIda: readonly FaseDeLasGrietas[] = ['formandose', 'oscuras', 'encendiendose', 'encendidas']
  const tol = cuadro + 1e-9
  return a.monotona && cerca(a.formadas, T.formarseS, tol) && cerca(a.encendidaDesde - a.formadas, T.oscurasS, tol) && cerca(a.encendidas, T.formarseS + T.oscurasS + T.encenderseS, tol) && JSON.stringify(a.fases) === JSON.stringify(fasesIda)
}
const ida60 = recorrer(avanzarLasGrietas, ida(grietasCerradas()), 5, () => PASO)
afirmar(tiemposBien(avanzarLasGrietas, () => PASO), `a 60 Hz: formadas a los ${ida60.formadas.toFixed(3)} s, oscuras hasta ${ida60.encendidaDesde.toFixed(3)} s (${(ida60.encendidaDesde - ida60.formadas).toFixed(3)} s), encendidas a los ${ida60.encendidas.toFixed(3)} s; fases formándose → oscuras → encendiéndose → encendidas, sin volver atrás`)
let semilla = 7
const azarDelPaso = (): number => {
  semilla = (semilla * 16807) % 2147483647
  return 0.008 + ((semilla - 1) / 2147483646) * 0.025
}
afirmar(tiemposBien(avanzarLasGrietas, azarDelPaso, 0.033), '  y con cuadros desparejos (8 a 33 ms): los mismos tiempos, a un cuadro')
controlPositivo('  el detector VE un reloj sin la espera oscura (se encienden apenas se forman)', ((e, dt, r) => {
  avanzarLasGrietas(e, dt, r)
  if (e.formacion >= 1) e.espera = 1
}) as Avanzar, (f: Avanzar) => tiemposBien(f, () => PASO))
controlPositivo('  y uno que se forma de golpe', ((e, dt, r) => {
  if (e.sentido === 'avance') e.formacion = 1
  avanzarLasGrietas(e, dt, r)
}) as Avanzar, (f: Avanzar) => tiemposBien(f, () => PASO))

const encendidasDel = (): EstadoDeLasGrietas => ({ formacion: 1, espera: 1, luz: 1, sentido: 'reversa' })
const reversaBien = (avanzar: Avanzar): boolean => {
  const r = recorrer(avanzar, encendidasDel(), 4, () => PASO)
  return r.monotona && cerca(r.formadas, T.apagarseS) && cerca(r.encendidas, T.apagarseS + T.cerrarseS, 2 * PASO) && JSON.stringify(r.fases) === JSON.stringify(['apagandose', 'cerrandose', 'cerradas'])
}
const rev = recorrer(avanzarLasGrietas, encendidasDel(), 4, () => PASO)
afirmar(reversaBien(avanzarLasGrietas), `la reversa, a la vista: la luz se apaga en ${rev.formadas.toFixed(3)} s y recién después se cierran, cerradas a los ${rev.encendidas.toFixed(3)} s (la formación al revés)`)
controlPositivo('  el detector VE una reversa que corta de golpe', ((e, dt, r) => {
  avanzarLasGrietas(e, dt, r)
  if (e.sentido === 'reversa') {
    e.formacion = 0
    e.luz = 0
  }
}) as Avanzar, reversaBien)

// A medio camino: subiendo a los 0,7 s de formarse, se cierran desde ahí (sin encenderse); bajando otra vez con la luz a medias, no
// vuelven a esperar oscuras.
const aMedio = ida(grietasCerradas())
for (let k = 0; k < 42; k += 1) avanzarLasGrietas(aMedio, PASO, false)
const formadaA = aMedio.formacion
aMedio.sentido = 'reversa'
const r1 = recorrer(avanzarLasGrietas, aMedio, 2, () => PASO)
const conLuzAMedias: EstadoDeLasGrietas = { formacion: 1, espera: 0, luz: 0.4, sentido: 'avance' }
avanzarLasGrietas(conLuzAMedias, PASO, false)
afirmar(cerca(r1.encendidas, formadaA * T.cerrarseS, 2 * PASO) && r1.fases[0] === 'cerrandose' && conLuzAMedias.luz > 0.4, `a medio camino: con ${(formadaA * 100).toFixed(0)} % formadas, al volver se cierran en ${r1.encendidas.toFixed(2)} s sin encenderse; y con la luz a medias, al bajar de nuevo no esperan otra vez`)
controlPositivo('  el detector VE una vuelta a medio camino que primero termina de formarse', { ...r1, fases: ['formandose', ...r1.fases] }, (r: Recorrido) => r.fases[0] === 'cerrandose')

const largo = ida(grietasCerradas())
avanzarLasGrietas(largo, 2, false)
afirmar(cerca(largo.formacion, T.pasoMaximoS / T.formarseS, 1e-9), `un cuadro largo (la escena dormida, la pestaña oculta) avanza a lo sumo ${String(T.pasoMaximoS)} s: no saltan`)
const reducidoBien = (avanzar: Avanzar): boolean => {
  const a = ida(grietasCerradas())
  avanzar(a, 0, true)
  const b = encendidasDel()
  avanzar(b, 0, true)
  return a.formacion === 1 && a.luz === 1 && b.formacion === 0 && b.luz === 0
}
afirmar(reducidoBien(avanzarLasGrietas), 'con movimiento reducido, de una: encendidas en el mismo cuadro del pedido, y cerradas en el de la vuelta')
controlPositivo('  el detector VE un reloj que anima también con movimiento reducido', ((e, dt) => avanzarLasGrietas(e, dt, false)) as Avanzar, reducidoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La ventana: nacen donde la cámara mira el muro (la página y el recorrido del home, a 1440 y a 390)')

const R = CRISTAL.muro.radio
const VUELTA = 2 * Math.PI * R
function camaraDe(pose: { readonly angleDeg: number; readonly height: number; readonly distance: number }, ancho: number, alto: number): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(CAMERA_FOV, ancho / alto, 0.1, 500)
  const a = (pose.angleDeg * Math.PI) / 180
  cam.position.set(Math.sin(a) * pose.distance, pose.height, Math.cos(a) * pose.distance)
  cam.lookAt(0, ORBIT_TARGET_Y, 0)
  cam.updateMatrixWorld()
  cam.updateProjectionMatrix()
  return cam
}
const PISTA = buildTrack(CHOREO_KEYFRAMES)
const poseDelHome = (p: number): MutableChoreoPose => {
  const pose: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
  sampleTrack(PISTA, p, pose)
  return pose
}
const ANCHOS = [[1440, 900], [390, 844]] as const
const VENTANAS: { readonly nombre: string; readonly v: Ventana; readonly compacta: boolean; readonly cam: THREE.PerspectiveCamera }[] = []
for (const [w, h] of ANCHOS) {
  for (const [nombre, pose] of [['la página (composición inicial)', COMPOSICION_INICIAL], ['la página (pose de la intro)', POSE_DE_LA_INTRO], ...[0.1, 0.5, 0.8, 0.95].map((p) => [`el home (${String(p)})`, poseDelHome(p)] as const)] as const) {
    const cam = camaraDe(pose, w, h)
    const v = ventanaDeLaCamara(cam)
    if (v !== null) VENTANAS.push({ nombre: `${nombre} a ${String(w)}`, v, compacta: w < 1024, cam })
  }
}
/** El u (absoluto) adonde mira la cámara: el rayo del centro, en el muro. */
const alCentro = (cam: THREE.PerspectiveCamera): number => {
  const d = new THREE.Vector3(0, 0, 0.5).unproject(cam).sub(cam.position).normalize()
  const o = cam.position
  const a = d.x * d.x + d.z * d.z
  const b = 2 * (o.x * d.x + o.z * d.z)
  const t = (-b + Math.sqrt(b * b - 4 * a * (o.x * o.x + o.z * o.z - R * R))) / (2 * a)
  return Math.atan2(o.x + d.x * t, o.z + d.z * t) * R
}
const ventanasBien = (lista: typeof VENTANAS): boolean =>
  lista.length === 12 && lista.every(({ v, cam, compacta }) => Math.abs(alrededor(alCentro(cam), v.centro)) < 1e-6 && v.desde[0] < 0 && v.hasta[0] > 0 && v.desde[1] >= 0 && v.hasta[1] <= CRISTAL.muro.alto && v.hasta[0] - v.desde[0] <= GRIETAS.ventanaMaxima * VUELTA + 1e-9 && (compacta ? v.hasta[0] - v.desde[0] < v.hasta[1] - v.desde[1] + 20 : true))
const lado = (v: Ventana): string => `${(v.hasta[0] - v.desde[0]).toFixed(0)} × ${(v.hasta[1] - v.desde[1]).toFixed(0)} u`
afirmar(ventanasBien(VENTANAS), `la ventana sale del rayo del centro (donde mira la cámara) y abarca lo que se ve del muro: ${VENTANAS.filter((x) => x.nombre.includes('composición')).map((x) => `${x.nombre}: ${lado(x.v)}`).join('; ')}`)
controlPositivo('  el detector VE una ventana corrida media vuelta (las grietas detrás de la cámara)', VENTANAS.map((x) => ({ ...x, v: { ...x.v, centro: x.v.centro + VUELTA / 2 } })), ventanasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las variantes: telaraña, fractura larga y por las juntas; compactas, menos')

const CELDAS = celdasDelMuro()
const VARIANTES = ['1', '2', '3'] as const
afirmar(varianteDeLasGrietas(null) === '1' && varianteDeLasGrietas('2') === '2' && varianteDeLasGrietas('3') === '3' && varianteDeLasGrietas('no') === 'no' && varianteDeLasGrietas('9') === '1', '`?grietas=1|2|3|no`: la telaraña por defecto; una que no existe, la por defecto')
controlPositivo('  el detector VE una bandera que no pasa', ((v: string | null) => (v === '2' ? '1' : varianteDeLasGrietas(v))) as typeof varianteDeLasGrietas, (f: typeof varianteDeLasGrietas) => f('2') === '2')

const igual = (p: P, q: P): boolean => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6
/** Dónde nacen: los comienzos a los que no llega ningún otro tramo antes ni al mismo tiempo (ni terminando ahí, ni pasando por ahí). */
function nacimientos(tramos: readonly Tramo[]): P[] {
  const puntos: P[] = []
  for (const t of tramos) {
    if (puntos.some((p) => igual(p, t.a))) continue
    const llegaAntes = tramos.some((o) => {
      if (o === t) return false
      if (igual(o.b, t.a)) return o.t1 <= t.t0 + 1e-9
      if (igual(o.a, t.a)) return o.t0 < t.t0 - 1e-9
      return distanciaAlTramo(t.a, o) < 1e-6
    })
    if (!llegaAntes) puntos.push(t.a)
  }
  return puntos
}
const tiemposSanos = (tr: readonly Tramo[]): boolean => tr.length > 0 && tr.every((t) => t.t0 >= 0 && t.t1 <= 1 + 1e-12 && t.t1 > t.t0) && Math.abs(Math.max(...tr.map((t) => t.t1)) - 1) < 1e-12
/** Lo de cada variante en cada ventana. */
const DE: { readonly variante: VarianteDeLasGrietas; readonly ventana: (typeof VENTANAS)[number]; readonly tramos: Tramo[]; readonly nacen: number }[] = []
for (const ventana of VENTANAS) {
  for (const variante of VARIANTES) {
    const tramos = trazarLasGrietas(variante, ventana.v, ventana.compacta, CELDAS)
    DE.push({ variante, ventana, tramos, nacen: nacimientos(tramos).length })
  }
}
const rango = (xs: readonly number[]): string => `${String(Math.min(...xs))} a ${String(Math.max(...xs))}`
const de = (v: VarianteDeLasGrietas, compacta: boolean): typeof DE => DE.filter((d) => d.variante === v && d.ventana.compacta === compacta)
const nacenBien = (lista: typeof DE): boolean =>
  lista.every((d) => {
    const [min, max] = d.variante === '1' ? (d.ventana.compacta ? GRIETAS.telarana.impactosCompacta : GRIETAS.telarana.impactos) : d.variante === '2' ? (d.ventana.compacta ? GRIETAS.fractura.lineasCompacta : GRIETAS.fractura.lineas) : [1, d.ventana.compacta ? GRIETAS.juntas.semillasCompacta[1] : GRIETAS.juntas.semillas[1]]
    return tiemposSanos(d.tramos) && d.nacen >= min && d.nacen <= max
  }) && lista.filter((d) => !d.ventana.compacta).every((d) => d.nacen >= 2)
afirmar(nacenBien(DE), `nacen en varios puntos (con los tiempos de 0 a 1): telaraña ${rango(de('1', false).map((d) => d.nacen))} impactos (compacta ${rango(de('1', true).map((d) => d.nacen))}), fractura ${rango(de('2', false).map((d) => d.nacen))} líneas (${rango(de('2', true).map((d) => d.nacen))}), juntas ${rango(de('3', false).map((d) => d.nacen))} semillas (${rango(de('3', true).map((d) => d.nacen))})`)
controlPositivo('  el detector VE grietas que nacen todas de un punto', DE.map((d) => ({ ...d, nacen: 1 })), nacenBien)

// La telaraña: de cada impacto salen rayos en estrella (5 o más, en todas las direcciones).
const estrella = (tr: readonly Tramo[]): boolean =>
  nacimientos(tr).every((p) => {
    const rumbos = tr.filter((t) => igual(t.a, p)).map((t) => Math.atan2(t.b[1] - t.a[1], t.b[0] - t.a[0])).sort((a, b) => a - b)
    const huecos = rumbos.map((r, i) => (i === 0 ? r + 2 * Math.PI - rumbos[rumbos.length - 1] : r - rumbos[i - 1]))
    return rumbos.length >= 5 && Math.max(...huecos) < Math.PI * 0.75
  })
afirmar(de('1', false).concat(de('1', true)).every((d) => estrella(d.tramos)), '1 · telaraña: de cada impacto, 5 o más rayos en estrella (ningún hueco de más de 135°), con ramas y anillos')
controlPositivo('  el detector VE una fractura (no sale en estrella)', de('2', false)[0]?.tramos ?? [], estrella)

// La fractura larga: cada línea cruza la ventana (de un borde al de enfrente) y se bifurca.
const cruza = (d: (typeof DE)[number]): boolean => {
  const { desde, hasta } = d.ventana.v
  const w = hasta[0] - desde[0]
  const h = hasta[1] - desde[1]
  const xs = d.tramos.flatMap((t) => [t.a[0], t.b[0]])
  const ys = d.tramos.flatMap((t) => [t.a[1], t.b[1]])
  const ancho = Math.max(...xs) - Math.min(...xs)
  const alto = Math.max(...ys) - Math.min(...ys)
  const bifurca = d.tramos.some((t) => d.tramos.filter((o) => igual(o.a, t.b)).length >= 2)
  return (ancho >= 0.85 * w || alto >= 0.85 * h) && bifurca && d.tramos.length < 260
}
afirmar(de('2', false).concat(de('2', true)).every(cruza), '2 · fractura larga: las líneas cruzan la ventana de borde a borde y se bifurcan (pocas: menos de 260 tramos)')
controlPositivo('  el detector VE una telaraña (no cruza)', de('1', false).map((d) => ({ ...d, tramos: d.tramos.filter((t) => Math.hypot(t.a[0], t.a[1] - 22) < 4) })), (l: typeof DE) => l.every(cruza))

// Por las juntas: cada tramo es un borde compartido por dos celdas del muro (en el mismo lugar).
const BORDES: readonly (readonly [P, P])[] = CELDAS.flatMap((c) => {
  const q = c.poligono
  const n = q.length / 2
  return Array.from({ length: n }, (_, k) => [[q[k * 2], q[k * 2 + 1]], [q[((k + 1) % n) * 2], q[((k + 1) % n) * 2 + 1]]] as const)
})
const enUnBorde = (t: Tramo, centro: number): boolean => {
  const m: P = [(t.a[0] + t.b[0]) / 2, (t.a[1] + t.b[1]) / 2]
  return BORDES.some(([a, b]) => distanciaAlTramo(m, { a: [alrededor(a[0], centro), a[1]], b: [alrededor(b[0], centro), b[1]], t0: 0, t1: 1, grosor: 1 }) < 1e-4)
}
const porLasJuntas = (lista: typeof DE): boolean => lista.every((d) => d.tramos.every((t) => enUnBorde(t, d.ventana.v.centro)))
afirmar(porLasJuntas(de('3', false).concat(de('3', true))), `3 · por las juntas: los ${rango(de('3', false).map((d) => d.tramos.length))} tramos van todos por bordes de celdas del cristal y se propagan de celda en celda`)
controlPositivo('  el detector VE una telaraña (no va por las juntas)', de('1', false).map((d) => ({ ...d, variante: '3' as const })), porLasJuntas)

const menos = (v: VarianteDeLasGrietas): boolean => {
  const conLasDos = VENTANAS.filter((x) => !x.compacta)
  return conLasDos.every((x) => trazarLasGrietas(v, x.v, true, CELDAS).length < trazarLasGrietas(v, x.v, false, CELDAS).length)
}
afirmar(VARIANTES.every(menos), 'en el teléfono, la versión compacta: en la misma ventana, menos tramos en las tres variantes (y menos impactos, líneas o semillas: arriba)')
controlPositivo('  el detector VE una compacta igual a la plena', '1' as VarianteDeLasGrietas, (v: VarianteDeLasGrietas) => VENTANAS.filter((x) => !x.compacta).every((x) => trazarLasGrietas(v, x.v, false, CELDAS).length < trazarLasGrietas(v, x.v, false, CELDAS).length))
afirmar(trazarLasGrietas('no', VENTANAS[0].v, false, CELDAS).length === 0 && JSON.stringify(trazarLasGrietas('2', VENTANAS[0].v, false, CELDAS)) === JSON.stringify(trazarLasGrietas('2', VENTANAS[0].v, false, CELDAS)), '`no`: ninguna; y la misma ventana da siempre las mismas (la semilla)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La rejilla: lo que lee el sombreador da la distancia de verdad; nada se queda afuera')

const RJ = GRIETAS.rejilla
/** Lo que hace `lasGrietas` del sombreador, en la CPU: la celda, su lista y el tramo más cercano hasta donde llegó el frente. */
function delSombreador(q: P, r: RejillaDeLasGrietas, celdas: Float32Array, tabla: Float32Array, formacion: number): number {
  const cx = (q[0] - r.esquina[0]) / r.ladoDeLaCelda[0]
  const cy = (q[1] - r.esquina[1]) / r.ladoDeLaCelda[1]
  if (cx < 0 || cy < 0 || cx >= r.nx || cy >= r.ny) return Number.POSITIVE_INFINITY
  // La celda `iy·nx + ix`, en el téxel (ci % porFila, ci / porFila): el mismo lugar del arreglo (ci · 4).
  const c = (Math.floor(cy) * r.nx + Math.floor(cx)) * 4
  const inicio = Math.round(celdas[c])
  const cuantos = Math.round(celdas[c + 1])
  let mejor = Number.POSITIVE_INFINITY
  for (let k = 0; k < Math.min(cuantos, RJ.lazo); k += 1) {
    const i = 2 * (inicio + k) * 4
    const t: Tramo = { a: [tabla[i], tabla[i + 1]], b: [tabla[i + 2], tabla[i + 3]], t0: tabla[i + 4], t1: tabla[i + 5], grosor: tabla[i + 6] }
    mejor = Math.min(mejor, hastaElFrente(q, t, formacion))
  }
  return mejor
}
/** La distancia al pedazo de un tramo que ya se formó (la punta, redonda); infinito si el frente no llegó. */
function hastaElFrente(q: P, t: Tramo, f: number): number {
  if (f <= t.t0) return Number.POSITIVE_INFINITY
  const s = Math.min(1, Math.max(0, (f - t.t0) / Math.max(1e-5, t.t1 - t.t0)))
  const bx = t.b[0] - t.a[0]
  const by = t.b[1] - t.a[1]
  const h = Math.min(s, Math.max(0, ((q[0] - t.a[0]) * bx + (q[1] - t.a[1]) * by) / Math.max(1e-8, bx * bx + by * by)))
  return Math.hypot(q[0] - t.a[0] - bx * h, q[1] - t.a[1] - by * h)
}
interface DeLaRejilla {
  readonly r: RejillaDeLasGrietas
  readonly celdas: Float32Array
  readonly tabla: Float32Array
  readonly tramos: readonly Tramo[]
}
const EMPAQUETADAS: DeLaRejilla[] = DE.map((d) => {
  const celdas = new Float32Array(TEXELES_DE_LAS_CELDAS)
  const tabla = new Float32Array(TEXELES_DE_LOS_TRAMOS)
  return { r: empaquetar(d.tramos, celdas, tabla), celdas, tabla, tramos: d.tramos }
})
const m = GRIETAS.dibujo.margen
/** En puntos a menos del margen de cada tramo (a los dos lados y en las puntas), con la formación entera y a medias. */
const rejillaBien = (lista: readonly DeLaRejilla[]): boolean =>
  lista.every(({ r, celdas, tabla, tramos }) => {
    if (r.sobran > 0 || r.maximoPorCelda > RJ.lazo) return false
    return tramos.every((t, i) => {
      if (i % 3 !== 0) return true
      const bx = t.b[0] - t.a[0]
      const by = t.b[1] - t.a[1]
      const l = Math.hypot(bx, by) || 1
      const n: P = [-by / l, bx / l]
      const puntos: P[] = [0, 0.45, 0.9].flatMap((k) => [-1, 1].flatMap((s) => [0.5, 0.02].map((a) => [t.a[0] + bx * a + n[0] * s * k * m, t.a[1] + by * a + n[1] * s * k * m] as const)))
      return [1, 0.5].every((f) =>
        puntos.every((q) => {
          const deVerdad = Math.min(...tramos.map((o) => hastaElFrente(q, o, f)))
          return deVerdad > 0.95 * m || Math.abs(delSombreador(q, r, celdas, tabla, f) - deVerdad) < 1e-4
        }),
      )
    })
  })
const maximo = Math.max(...EMPAQUETADAS.map((e) => e.r.maximoPorCelda))
const entradas = Math.max(...EMPAQUETADAS.map((e) => e.r.entradas))
afirmar(rejillaBien(EMPAQUETADAS), `en las ${String(EMPAQUETADAS.length)} combinaciones (3 variantes × 12 ventanas), lo que lee el sombreador es la distancia de verdad hasta el margen (${String(m)} u); a lo sumo ${String(maximo)} tramos por celda (el lazo, ${String(RJ.lazo)}) y ${String(entradas)} entradas (caben ${String(TEXELES_DE_LOS_TRAMOS / 8)})`)
controlPositivo('  el detector VE una celda vaciada (la lista en cero)', EMPAQUETADAS.map((e) => {
  const celdas = e.celdas.slice()
  for (let c = 0; c < celdas.length; c += 4) celdas[c + 1] = 0
  return { ...e, celdas }
}), rejillaBien)
controlPositivo('  y una tabla que no alcanza', EMPAQUETADAS.map((e) => {
  const tabla = new Float32Array(64)
  const celdas = new Float32Array(TEXELES_DE_LAS_CELDAS)
  return { ...e, r: empaquetar(e.tramos, celdas, tabla), celdas, tabla }
}), rejillaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · En el cuadro: el acento en las páginas, neutro en el home; se borran al cambiar de página')

const ACENTO_DE_WEB = new THREE.Color('#8FC0E8')
const leerAcento = (a: string | null): THREE.Color => (a === 'web' ? ACENTO_DE_WEB.clone() : new THREE.Color(1, 1, 1))
const BASE: PresetDeLaEscena = { id: 'base', tramos: { intro: '[data-x]', pie: null }, pista: null, noche: 'noche', acento: 'web', variante: null }
const CAM_PAGINA = camaraDe(COMPOSICION_INICIAL, 1440, 900)
interface DelCuadro {
  readonly colorPagina: string
  readonly colorHome: string
  readonly borradas: boolean
  readonly ajena: boolean
  readonly curva: readonly (readonly [number, number, number])[]
  readonly compactas: number
  readonly plenas: number
  readonly reducidas: readonly [number, number]
}
function enElCuadro(reducido: boolean): DelCuadro {
  const sacar = apilarElPreset(BASE)
  const u = uniformesDeLasGrietas()
  const g = crearLasGrietas(u, CELDAS, leerAcento, reducido)
  dispararLasGrietas('avance', 'base')
  const curva: [number, number, number][] = []
  for (let k = 0; k < 240; k += 1) {
    g.cuadro(CAM_PAGINA, PASO, false)
    curva.push([u.uGrietas.value.x, u.uGrietas.value.y, u.uGrietas.value.z])
  }
  const plenas = g.estado().tramos
  const colorPagina = u.uGrietasColor.value.getHexString()
  // Un pedido de otra página (el home) no toca las de esta.
  dispararLasGrietas('reversa', 'home')
  g.cuadro(CAM_PAGINA, PASO, false)
  const ajena = g.estado().fase === 'encendidas'
  // La página cambia (el home): se borran en el acto; en el home, el CTA las pide neutras.
  const sacarHome = apilarElPreset(PRESET_DEL_HOME)
  g.cuadro(CAM_PAGINA, PASO, false)
  const borradas = u.uGrietas.value.z === 0 && g.estado().fase === 'cerradas'
  grietasAlVolverseElCta('ida')
  g.cuadro(CAM_PAGINA, PASO, true)
  const colorHome = u.uGrietasColor.value.getHexString()
  const compactas = g.estado().tramos
  const reducidas: [number, number] = [u.uGrietas.value.x, u.uGrietas.value.y]
  sacarHome()
  sacar()
  g.soltar()
  return { colorPagina, colorHome, borradas, ajena, curva, compactas, plenas, reducidas }
}
const CUADRO = enElCuadro(false)
const acentoBien = (c: DelCuadro): boolean => c.colorPagina === ACENTO_DE_WEB.getHexString() && c.colorHome === 'ffffff' && c.borradas && c.ajena
afirmar(acentoBien(CUADRO), `la luz con el acento claro en la página (#${CUADRO.colorPagina}) y neutra en el home (#${CUADRO.colorHome}); un pedido de otra página no las toca; al cambiar de página se borran en el acto`)
controlPositivo('  el detector VE el acento en el home', { ...CUADRO, colorHome: CUADRO.colorPagina }, acentoBien)
controlPositivo('  y unas grietas que se quedan al cambiar de página', { ...CUADRO, borradas: false }, acentoBien)
const enCuadros = (c: DelCuadro, i: number): number => c.curva.findIndex((x) => x[i] >= 1) + 1
const curvaBien = (c: DelCuadro): boolean =>
  c.curva[0][2] === 1 && Math.abs(enCuadros(c, 0) - 90) <= 1 && c.curva.slice(0, 148).every((x) => x[1] === 0) && Math.abs(enCuadros(c, 1) - 192) <= 2 && c.curva.every((x, i) => i === 0 || (x[0] >= c.curva[i - 1][0] && x[1] >= c.curva[i - 1][1]))
afirmar(curvaBien(CUADRO), `en las uniformes, a 60 Hz: la formación llega a 1 en el cuadro ${String(enCuadros(CUADRO, 0))} (1,5 s), la luz se queda en 0 hasta el 148 (2,47 s: la espera oscura) y llega a 1 en el ${String(enCuadros(CUADRO, 1))} (3,2 s)`)
controlPositivo('  el detector VE la luz encendida durante la espera', { ...CUADRO, curva: CUADRO.curva.map((x, i) => (i === 120 ? ([x[0], 0.2, x[2]] as const) : x)) }, curvaBien)
afirmar(CUADRO.compactas < CUADRO.plenas && CUADRO.compactas > 0, `compactas abajo de 1024 (${String(CUADRO.compactas)} tramos contra ${String(CUADRO.plenas)} con la misma cámara)`)
const REDUCIDO = enElCuadro(true)
afirmar(REDUCIDO.curva[0][0] === 1 && REDUCIDO.curva[0][1] === 1 && REDUCIDO.reducidas[0] === 1, 'con movimiento reducido (si el cristal está), encendidas desde el primer cuadro')
controlPositivo('  el detector VE las de siempre (animadas)', CUADRO, (c: DelCuadro) => c.curva[0][0] === 1 && c.curva[0][1] === 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El sombreador: en el material del cristal, detrás de una uniforme; la geometría no cambia')

const sombreadorBien = (frag: string, uniformes: Record<string, unknown>): boolean => {
  const main = frag.slice(frag.indexOf('void main()'))
  return frag.includes(GRIETAS_GLSL) && main.includes(GRIETAS_EN_EL_MAIN) && main.indexOf(GRIETAS_EN_EL_MAIN) < main.indexOf('gl_FragColor') &&
    /if \( uGrietas\.z > 0\.5 \) \{\s*vec2 qGrietas = enLasGrietas\( vMundo \);\s*float porPxGrietas = max\( 1e-5, 0\.5 \* \( fwidth\( qGrietas\.x \) \+ fwidth\( qGrietas\.y \) \) \);/.test(main) &&
    GRIETAS_GLSL.includes('atan( p.x, p.z )') && GRIETAS_GLSL.includes(`k < ${String(RJ.lazo)}`) && GRIETAS_GLSL.includes(`i % ${String(RJ.ancho)}`) && GRIETAS_GLSL.includes(`ivec2( ci % ${String(RJ.porFila)}, ci / ${String(RJ.porFila)} )`) && GRIETAS_GLSL.includes('int ci = int( c.y ) * int( uGrietasRejilla.z + 0.5 ) + int( c.x );') && !frag.includes('quiebre') &&
    ['uGrietasCeldas', 'uGrietasTramos', 'uGrietasMarco', 'uGrietasRejilla', 'uGrietas', 'uGrietasColor'].every((k) => k in uniformes)
}
afirmar(sombreadorBien(FRAGMENTOS_DEL_VIDRIO, uniformesDelVidrio()), 'el trozo de las grietas va en el fragmento del vidrio (antes de escribir el color), detrás de `uGrietas.z` (sin grietas, una comparación), con la derivada adentro de esa rama pareja y el mismo muro que el trazado (el ángulo de `atan( x, z )`)')
controlPositivo('  el detector VE el vidrio sin las grietas en el main', FRAGMENTOS_DEL_VIDRIO.replace(GRIETAS_EN_EL_MAIN, ''), (f: string) => sombreadorBien(f, uniformesDelVidrio()))
const MURO = armarElMuro(CELDAS)
const atributos = Object.keys(MURO.attributes).sort().join(',')
afirmar(atributos === 'aBorde,aCelda,aHondura,aInterior,normal,position' && MURO.getAttribute('position').count === CELDAS.reduce((s, c) => s + (c.poligono.length / 2) * 3, 0), `sin partir la geometría: el muro tiene los mismos atributos (${atributos}) y un abanico por celda`)
MURO.dispose()

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Los enganches: el título de la página (cuando terminó de entrar) y el CTA del home (B3)')

const titulo3d = sinComentarios(leer('_componentes/titulos3d/TituloDePagina.tsx'))
const enganchado = (t: string): boolean =>
  /useEffect\(\(\) => \{\s*if \(!entrada \|\| \(activo && !listo\)\) return undefined\s*const reloj = window\.setTimeout\(\(\) => dispararLasGrietas\('avance', id\), LLEGADA_DEL_TITULAR_S \* 1000\)\s*return \(\) => window\.clearTimeout\(reloj\)\s*\}, \[activo, entrada, listo, id\]\)/.test(t) && !/dispararLasGrietas\('reversa'/.test(t)
afirmar(enganchado(titulo3d), 'en las páginas: con la entrada abierta y el título armado, al terminar su llegada (el reloj del titular), avance con el id de la página; sin reversa (se quedan)')
controlPositivo('  el detector VE un disparo sin esperar al título', titulo3d.replace('if (!entrada || (activo && !listo)) return undefined', 'if (!entrada) return undefined'), enganchado)
const firma: (sentido: 'ida' | 'vuelta') => void = grietasAlVolverseElCta
const antes = GRIETAS_EN_VIVO.vez
firma('ida')
const trasLaIda = { ...GRIETAS_EN_VIVO }
firma('vuelta')
const ctaBien = (a: typeof trasLaIda, b: typeof trasLaIda): boolean => a.vez === antes + 1 && a.sentido === 'avance' && a.donde === 'home' && b.vez === antes + 2 && b.sentido === 'reversa' && b.donde === 'home'
afirmar(ctaBien(trasLaIda, { ...GRIETAS_EN_VIVO }), 'en el home: `grietasAlVolverseElCta` tiene la firma del enganche de B3 (`ida` | `vuelta`): ida forma, vuelta cierra, neutras (el home)')
controlPositivo('  el detector VE una vuelta que no cierra', [trasLaIda, { ...GRIETAS_EN_VIVO, sentido: 'avance' as const }] as const, ([a, b]) => ctaBien(a, b))

const lineas = (t: string): number => sinComentarios(t).split('\n').filter((l) => l.trim() !== '').length
const MODULOS = ['grietas.ts', 'trazado.ts', 'formas.ts', 'grietasDelVidrio.ts', 'grietasEnVivo.ts', 'vidrio.ts', 'CristalDeLaEscena.tsx'].map((a) => [a, lineas(leer(`_lib/escena/cristal/${a}`))] as const)
afirmar(MODULOS.every(([, n]) => n <= 300), `los módulos del cristal, de menos de 300 líneas de código: ${MODULOS.map(([a, n]) => `${a} ${String(n)}`).join(', ')}`)
const sinTres = (t: string): boolean => !/from '(three|@react-three\/[a-z]+)'/.test(t) && !/from '\.\/(trazado|formas|grietasEnVivo|grietasDelVidrio|vidrio|muro)'/.test(t)
afirmar(sinTres(leer('_lib/escena/cristal/grietas.ts')), 'el disparador (`grietas.ts`) no importa three ni el lienzo: lo importa el título de una página, que viaja con la página')
controlPositivo('  el detector VE un import de three', `${leer('_lib/escena/cristal/grietas.ts')}\nimport * as THREE from 'three'`, sinTres)

cerrar('s78-b9.invariant')
