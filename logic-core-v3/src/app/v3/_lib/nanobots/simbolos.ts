import { sembrar } from '../escena/titulos3d/llegada'
import { robot } from './robot'
import { type Punto, type Trazo, circulo, curva, trazar } from './trazos'

/**
 * [PASADA FINAL] C4 · LOS SÍMBOLOS DEL ENJAMBRE — dónde va cada nanobot en cada estado del rodillo de Servicios, calculado
 * una vez (en la CPU, al montar) y mandado a la GPU: el morph es del sombreador. Cada símbolo da EXACTAMENTE `n` puntos
 * (x, y, z, w) en un espacio de −1 a 1; `w` es lo que el sombreador necesita para animarlo.
 *
 * [AJUSTES FINALES] A6 · MACIZOS Y PAREJOS: los símbolos de líneas se trazan por LONGITUD DE ARCO (`trazos.ts`): cada curva
 * recibe los nanobots que le tocan por su largo y los lleva a paso constante, así el trazo tiene el mismo grosor en todo
 * el símbolo (antes se muestreaban al azar en su parámetro y salían a manchones, con huecos). Y cada símbolo, de nuevo:
 *
 *   0 · nube      el enjambre suelto, flotando (el estado «Nuestros servicios»). w: 0. (Como antes: es una nube.)
 *   1 · globo     Desarrollo web: un globo de red limpio y simétrico, como el 🌐: cuatro meridianos (círculos máximos por
 *                 los polos, cada 45°), el ecuador y dos paralelos (±45°), y el aro de la silueta. w: 0 la red, que gira
 *                 sobre su eje, inclinado hacia quien mira; 1 el aro, que es la silueta y no gira — está donde la mirada
 *                 toca la esfera (`GLOBO.aro`), así coincide con la red en perspectiva.
 *   2 · engranajes  Software a medida: dos engranajes que encajan (12 y 8 dientes, sus círculos primitivos tangentes), cada
 *                 uno completo: el contorno dentado, la llanta, el cubo y los rayos. w: 0 el grande, 1 el chico (cada uno
 *                 gira sobre su centro, al revés y en razón).
 *   3 · robot     IA y automatización: el robot del chatbot, que habla (un globo de diálogo donde el texto se tipea, se
 *                 borra y vuelve a empezar), y el flujo de automatización que sale en diagonal hacia abajo a la derecha:
 *                 tres nodos en línea y una bifurcación, que se enciende tramo a tramo con un pulso. La forma, en
 *                 `robot.ts`; el tiempo, en `vida.ts`.
 *
 * Determinista (`sembrar`): los mismos puntos en cada carga y en el invariante.
 */
export const CUANTOS_SIMBOLOS = 4

/** Cuántos nanobots: en el panel de escritorio y en la cabeza angosta del teléfono (menos). Sin three: lo lee la sección. */
export const PUNTOS_DEL_ENJAMBRE = { ancho: 3000, angosto: 1200 } as const

/** El globo: su radio, su red, cuánto se inclina, y el aro de la silueta (la mirada está a `mirada` del centro: `cerca`, en el sombreador). */
export const GLOBO = (() => {
  const radio = 0.8
  const mirada = 3
  // El círculo donde la mirada es tangente a la esfera: más cerca que el ecuador y apenas más chico — en perspectiva, la silueta.
  const aro = { z: (radio * radio) / mirada, radio: radio * Math.sqrt(1 - (radio / mirada) ** 2) }
  return { radio, mirada, meridianos: 4, paralelos: [-45, 0, 45], lados: 72, inclinacion: 0.25, aro } as const
})()

/** Los engranajes: centros, dientes y radios (de pie y de punta), con sus círculos primitivos tangentes; la llanta, en razón del pie. */
export const ENGRANAJES = (() => {
  const a = { centro: [-0.3, 0.2] as const, dientes: 12, pie: 0.46, punta: 0.58, cubo: 0.16, rayos: 5 }
  const b = { dientes: 8, pie: 0.29, punta: 0.4, cubo: 0.1, rayos: 4 }
  const primitivo = (g: { readonly pie: number; readonly punta: number }): number => (g.pie + g.punta) / 2
  // El chico, sobre la diagonal de abajo a la derecha, a la suma de los primitivos (encajan).
  const direccion = [0.809 / Math.hypot(0.809, 0.588), -0.588 / Math.hypot(0.809, 0.588)] as const
  const d = primitivo(a) + primitivo(b)
  const centroB = [a.centro[0] + d * direccion[0], a.centro[1] + d * direccion[1]] as const
  // El contacto: un diente del grande frente a un hueco del chico.
  const contacto = Math.atan2(direccion[1], direccion[0])
  const faseA = contacto - (0.25 * 2 * Math.PI) / a.dientes
  const faseB = contacto + Math.PI - (0.75 * 2 * Math.PI) / b.dientes
  return { a: { ...a, fase: faseA, primitivo: primitivo(a) }, b: { ...b, centro: centroB, fase: faseB, primitivo: primitivo(b) }, razon: a.dientes / b.dientes, llanta: 0.8 }
})()

type Azar = () => number

function nube(n: number, azar: Azar): Punto[] {
  return Array.from({ length: n }, () => {
    // Una esfera blanda: más densa en el medio, con el borde que se deshace.
    const r = 0.82 * Math.cbrt(azar()) ** 1.4
    const t = azar() * 2 * Math.PI
    const c = azar() * 2 - 1
    const s = Math.sqrt(1 - c * c)
    return [r * s * Math.cos(t), r * c * 0.9, r * s * Math.sin(t), 0]
  })
}

function enLaEsfera(lat: number, lon: number, r: number): [number, number, number] {
  return [r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon)]
}

function globo(n: number, azar: Azar): Punto[] {
  const { radio: R, lados } = GLOBO
  const trazos: Trazo[] = []
  // Los meridianos: círculos máximos por los polos (la latitud da la vuelta entera: pasa por el otro lado).
  for (let m = 0; m < GLOBO.meridianos; m += 1) {
    const lon = (m / GLOBO.meridianos) * Math.PI
    trazos.push({ vertices: curva((a) => enLaEsfera(a, lon, R), lados), w: 0, cerrado: true })
  }
  for (const grados of GLOBO.paralelos) {
    const lat = (grados * Math.PI) / 180
    trazos.push({ vertices: curva((a) => enLaEsfera(lat, a, R), lados), w: 0, cerrado: true })
  }
  // El aro de la silueta: plano, frente a quien mira, sobre la esfera (donde la mirada la toca). No gira.
  trazos.push({ vertices: circulo(0, 0, GLOBO.aro.radio, lados, GLOBO.aro.z), w: 1, cerrado: true })
  return trazar(trazos, n, 0, azar)
}

/** El radio del contorno de un engranaje en el ángulo `t` (sin girar): punta en los dientes, pie en los huecos, flancos rectos. */
export function radioDelDiente(g: { readonly dientes: number; readonly pie: number; readonly punta: number; readonly fase: number }, t: number): number {
  const u = (((t - g.fase) * g.dientes) / (2 * Math.PI)) % 1
  const v = u < 0 ? u + 1 : u
  // Un diente ocupa la mitad del paso, con flancos de un décimo.
  const alto = v < 0.1 ? v / 0.1 : v < 0.4 ? 1 : v < 0.5 ? (0.5 - v) / 0.1 : 0
  return g.pie + (g.punta - g.pie) * alto
}

function engranajes(n: number, azar: Azar): Punto[] {
  const trazos: Trazo[] = []
  for (const [g, w] of [[ENGRANAJES.a, 0], [ENGRANAJES.b, 1]] as const) {
    const [cx, cy] = g.centro
    const llanta = g.pie * ENGRANAJES.llanta
    // El contorno dentado, en una polilínea fina (por ángulo, muchos lados: la longitud de arco reparte el resto).
    trazos.push({
      vertices: curva((t) => {
        const r = radioDelDiente(g, t)
        return [cx + r * Math.cos(t), cy + r * Math.sin(t)]
      }, g.dientes * 40),
      w,
      cerrado: true,
    })
    trazos.push({ vertices: circulo(cx, cy, llanta, 96), w, cerrado: true })
    trazos.push({ vertices: circulo(cx, cy, g.cubo, 48), w, cerrado: true })
    for (let k = 0; k < g.rayos; k += 1) {
      const a = g.fase + (k / g.rayos) * 2 * Math.PI
      trazos.push({ vertices: [[cx + g.cubo * Math.cos(a), cy + g.cubo * Math.sin(a)], [cx + llanta * Math.cos(a), cy + llanta * Math.sin(a)]], w })
    }
  }
  // El espesor en z, mínimo (la perspectiva lo vuelve un corrimiento en el plano; el trazo tiene que quedar macizo).
  return trazar(trazos, n, 0.03, azar)
}

/** Los cuatro símbolos, `n` puntos cada uno (en el orden del rodillo). */
export function simbolosDelEnjambre(n: number, semilla = 0xb07): readonly Float32Array[] {
  const azar = sembrar(semilla)
  return [nube, globo, engranajes, robot].map((f) => {
    const puntos = f(n, azar)
    const datos = new Float32Array(n * 4)
    puntos.forEach((p, i) => datos.set(p, i * 4))
    return datos
  })
}
