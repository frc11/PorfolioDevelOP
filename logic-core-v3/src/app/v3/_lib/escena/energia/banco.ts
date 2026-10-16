import * as THREE from 'three'

import { CLASES_DE_ARCOS, extremo, type ClaseDeArco } from './arcos/arcos'
import { TRAMOS_DEL_CAMINO, puntoDelCamino } from './arcos/camino'
import { cuantosEnlaces } from './vecinas'
import { ponerTemperatura } from './calor'
import type { Armado, Vista } from './dibujo/armado'
import { explotar } from './poblacion'

/**
 * [PULIDO 17] O3 · LA ENERGÍA PARA EL BANCO (sólo con banco: `hayBanco()`). Qué hay (para medir y capturar), un arco ya, la
 * temperatura puesta (la escena caliente) y dónde hay un grupo de brasas en la pantalla (para dejar el puntero quieto sobre él).
 */
export interface EnergiaDelBanco {
  estado: () => {
    brasas: number
    enlaces: number
    arcos: number
    contados: Record<ClaseDeArco, number>
    maximoALaVez: number
    temperatura: number
    energiaMedia: number
    cursor: boolean
    carga: number
    velocidad: number
    /** [PULIDO 19] Q1.d · la red en reposo: su fase, cuántos enlaces, cuántas veces se formó y se cortó. */
    // [CIERRE A-bis] A4 · y cuánto está encendida (el alfa medio de sus enlaces: 0 a 1) y desde cuándo está en su fase (s).
    red: { fase: string; enlaces: number; formadas: number; cortes: number; encendida: number; faseS: number }
    /** [PULIDO 27] Z1 · cuántas se ven (brillo y vida, en el cuadro y no sobre un texto) y cuántas viven (vida de más de la mitad). */
    visibles: number
    vivas: number
    /** [PULIDO 27] Z1 · las del cuadro (sin mirar el brillo), la densidad media (el brillo por amontonamiento) y el foco del dominio (u). */
    enCuadro: number
    densidadMedia: number
    foco: number
    /** [PULIDO 27] Z1 · la población (`poblacion.ts`): el objetivo, la vida sumada en el cuadro, las activas y las cuentas. */
    poblacion: { objetivo: number; presentes: number; activas: number; nacidas: number; muertas: number; mudanzas: number; corrige: number }
  }
  /** [PULIDO 27] Z1 · otro objetivo de la población (para comparar sin volver a armar). */
  objetivo: (valor: number) => void
  /** [PULIDO 27] Z1 · una muerte (su explosión) o un nacimiento a mano en un punto de la pantalla (px de CSS, a la distancia del foco): para verlos de cerca. */
  efectoEn: (x: number, y: number, que: 'explosion' | 'nacimiento') => boolean
  forzar: (que: ClaseDeArco) => boolean
  /** [PULIDO 19] Q1.d · la red en reposo apagada (para medir sin ella) o no. */
  red: (activa: boolean) => void
  calor: (valor: number) => void
  grupo: () => [number, number] | null
  /** Ajusta en vivo una uniforme de un grupo (`brasas`, `arcos`, `comun`, `reflejo`): sus números en orden. */
  ajustar: (grupo: string, nombre: string, valores: readonly number[]) => boolean
  /** Lee las uniformes ajustables de un grupo. */
  ajustes: (grupo: string) => Record<string, number[]>
  /** Los arcos vivos en la pantalla (px de CSS): sus dos extremos y su medio, y su clase. */
  arcosEnPantalla: () => { clase: string; a: [number, number]; b: [number, number]; medio: [number, number] }[]
}

type Grupos = Readonly<Record<string, Readonly<Record<string, THREE.IUniform>> | undefined>>

/** Los números de una uniforme (un número, o un vector de three). */
function numeros(v: unknown): number[] | null {
  if (typeof v === 'number') return [v]
  if (v instanceof THREE.Vector4) return [v.x, v.y, v.z, v.w]
  if (v instanceof THREE.Vector3) return [v.x, v.y, v.z]
  if (v instanceof THREE.Vector2) return [v.x, v.y]
  return null
}

/** El centro (px de CSS) de la celda de 90 px con más brasas a la vista, lejos de los bordes y no sobre un texto. */
function grupoEnPantalla(a: Armado, vista: Vista, v: THREE.Vector3): [number, number] | null {
  const cam = vista.camara
  if (cam === null) return null
  const celdas = new Map<number, number>()
  let mejor: [number, number, number] | null = null
  const L = a.brasas.lugar
  for (let i = 0; i < a.brasas.n; i += 1) {
    if (!a.entorno.seVe(L[i * 3], L[i * 3 + 1], L[i * 3 + 2])) continue
    v.set(L[i * 3], L[i * 3 + 1], L[i * 3 + 2]).project(cam)
    const x = ((v.x + 1) / 2) * vista.ancho
    const y = ((1 - v.y) / 2) * vista.alto
    const cx = Math.floor(x / 90)
    const cy = Math.floor(y / 90)
    const px = cx * 90 + 45
    const py = cy * 90 + 45
    if (Math.abs((px / vista.ancho) * 2 - 1) > 0.8 || Math.abs(1 - (py / vista.alto) * 2) > 0.75) continue
    const cuantas = (celdas.get(cx * 1000 + cy) ?? 0) + 1
    celdas.set(cx * 1000 + cy, cuantas)
    if (mejor === null || cuantas > mejor[2]) mejor = [px, py, cuantas]
  }
  return mejor === null ? null : [mejor[0], mejor[1]]
}

/** [PULIDO 27] Z1 · las brasas que se ven: con brillo y vida, adentro del cuadro y no sobre un texto. */
function contarLasVisibles(a: Armado, umbral = 0.15): number {
  const L = a.brasas.lugar
  let n = 0
  for (let i = 0; i < a.brasas.n; i += 1) if (a.brasas.brillo[i] > umbral && a.entorno.seVe(L[i * 3], L[i * 3 + 1], L[i * 3 + 2])) n += 1
  return n
}

export function energiaDelBanco(a: Armado, vista: { readonly current: Vista }): EnergiaDelBanco {
  return {
    estado: () => ({
      brasas: a.brasas.n,
      enlaces: cuantosEnlaces(a.brasas),
      arcos: a.arcos.arcos.filter((x) => x.activo).length,
      contados: { ...a.arcos.contados },
      maximoALaVez: a.arcos.maximoALaVez,
      temperatura: a.temperatura.valor,
      energiaMedia: a.brasas.energia.reduce((s, x) => s + x, 0) / Math.max(1, a.brasas.n),
      cursor: a.rayo.activo,
      carga: a.puntero.carga,
      velocidad: a.lectura.velocidad,
      red: { fase: a.red.fase, enlaces: a.red.n, formadas: a.red.formadas, cortes: a.red.cortes, encendida: a.red.alfa.subarray(0, a.red.n).reduce((s, x) => s + Math.min(1, x), 0) / Math.max(1, a.red.n), faseS: a.red.faseS },
      visibles: contarLasVisibles(a),
      vivas: a.brasas.vida.reduce((s, x) => s + (x > 0.5 ? 1 : 0), 0),
      enCuadro: contarLasVisibles(a, -1),
      densidadMedia: a.brasas.densidad.reduce((s, x) => s + x, 0) / Math.max(1, a.brasas.n),
      foco: a.dominio.D,
      poblacion: { objetivo: a.poblacion.objetivo, presentes: a.poblacion.presentes, activas: a.poblacion.activas, nacidas: a.poblacion.nacidas, muertas: a.poblacion.muertas, mudanzas: a.poblacion.mudanzas, corrige: a.poblacion.corrige },
    }),
    objetivo: (valor) => {
      a.poblacion.objetivo = valor
    },
    efectoEn: (x, y, que) => {
      const cam = vista.current.camara
      if (cam === null) return false
      a.v.set((x / vista.current.ancho) * 2 - 1, 1 - (y / vista.current.alto) * 2, 0.5).unproject(cam).sub(cam.position).normalize()
      const p = Float32Array.from([cam.position.x + a.v.x * a.dominio.D, cam.position.y + a.v.y * a.dominio.D, cam.position.z + a.v.z * a.dominio.D])
      if (que === 'explosion') return explotar(a.poblacion, p, 0, 1, a.entrada.tiempo)
      const b = a.brasas
      const i = b.oculta.indexOf(1)
      if (i < 0) return false
      b.lugar.set(p, i * 3)
      b.velocidad.fill(0, i * 3, i * 3 + 3)
      b.oculta[i] = 0
      b.nace[i] = a.entrada.tiempo
      return true
    },
    red: (activa) => {
      a.red.apagada = !activa
    },
    forzar: (que) => {
      if (!(CLASES_DE_ARCOS as readonly string[]).includes(que)) return false
      if (que === 'pulso' || que === 'descarga') {
        a.arcos.pedidos.donde.set(a.rayo.activo ? a.puntoDelPuntero : [0, 0, 6])
        a.arcos.pedidos.fuerza = 1
      }
      a.arcos.forzado = que
      return true
    },
    calor: (valor) => ponerTemperatura(a.temperatura, valor),
    grupo: () => grupoEnPantalla(a, vista.current, a.v),
    ajustar: (grupo, nombre, valores) => {
      const g = (a.ajustables as Grupos)[grupo]
      const u = g === undefined ? undefined : g[nombre]
      if (u === undefined) return false
      const v: unknown = u.value
      if (typeof v === 'number') u.value = valores[0]
      else if (v instanceof THREE.Vector4) v.set(valores[0], valores[1], valores[2], valores[3])
      else if (v instanceof THREE.Vector3) v.set(valores[0], valores[1], valores[2])
      else return false
      return true
    },
    arcosEnPantalla: () => {
      const cam = vista.current.camara
      if (cam === null) return []
      const A = new Float32Array(3)
      const B = new Float32Array(3)
      const M = new Float32Array(3)
      const enPx = (p: Float32Array): [number, number] => {
        a.v.set(p[0], p[1], p[2]).project(cam)
        return [Math.round(((a.v.x + 1) / 2) * vista.current.ancho), Math.round(((1 - a.v.y) / 2) * vista.current.alto)]
      }
      return a.arcos.arcos.filter((x) => x.activo).map((x) => {
        extremo(x, a.brasas, true, A)
        extremo(x, a.brasas, false, B)
        puntoDelCamino(x.forma, A, B, TRAMOS_DEL_CAMINO >> 1, M)
        return { clase: x.clase, a: enPx(A), b: enPx(B), medio: enPx(M) }
      })
    },
    ajustes: (grupo) => {
      const salida: Record<string, number[]> = {}
      for (const [k, u] of Object.entries((a.ajustables as Grupos)[grupo] ?? {})) {
        const n = numeros(u.value)
        if (n !== null) salida[k] = n
      }
      return salida
    },
  }
}
