import type * as THREE from 'three'

import { CLASES_DE_ARCOS, type ClaseDeArco } from './arcos/arcos'
import { ESPECIE, cargaDe, censo, recombinar } from './especies'
import { enlacesVivos } from './fisica/reacciones'
import { ponerTemperatura } from './fisica/temperatura'
import type { Armado, Vista } from './render/armado'

/**
 * [PULIDO 16] N2 · EL PLASMA PARA EL BANCO (sólo con banco: `hayBanco()`). Qué hay (para medir y capturar), un arco ya (o una
 * recombinación ya, para capturar su destello), la temperatura puesta (la escena caliente) y dónde hay un grupo de cargas en la
 * pantalla (para dejar el puntero quieto sobre él).
 */
export interface EnergiaDelBanco {
  estado: () => {
    especies: { atomos: number; iones: number; electrones: number }
    enlaces: { moleculas: number; ligados: number }
    arcos: number
    contados: Record<ClaseDeArco, number>
    maximoALaVez: number
    temperatura: number
    ionizaciones: number
    recombinaciones: number
    cursor: boolean
    carga: number
    /** Lo que calienta: la velocidad del scroll (pantallas por segundo) y lo acumulado sin saturar. */
    velocidad: number
    crudo: number
  }
  forzar: (que: ClaseDeArco | 'recombina') => boolean
  calor: (valor: number) => void
  grupo: () => [number, number] | null
}

const V = { x: 0, y: 0, z: 0 }

/** El punto de la pantalla (px de CSS) de `i`, si se ve y no cae sobre un texto. */
function enPantalla(a: Armado, vista: Vista, i: number, v: THREE.Vector3): [number, number] | null {
  const cam = vista.camara
  if (cam === null || !a.entorno.seVe(a.p.lugar[i * 3], a.p.lugar[i * 3 + 1], a.p.lugar[i * 3 + 2])) return null
  v.set(a.p.lugar[i * 3] + a.centro.x, a.p.lugar[i * 3 + 1] + a.centro.y, a.p.lugar[i * 3 + 2] + a.centro.z).project(cam)
  return [((v.x + 1) / 2) * vista.ancho, ((1 - v.y) / 2) * vista.alto]
}

/** Recombina ya el par ion–electrón más cercano que se vea (su destello). */
function recombinarYa(a: Armado, vista: Vista): boolean {
  const p = a.p
  let mejor: [number, number, number] | null = null
  for (let i = 0; i < p.nAtomos; i += 1) {
    if (p.especie[i] !== ESPECIE.ion || enPantalla(a, vista, i, a.v) === null) continue
    for (let j = p.nAtomos; j < p.n; j += 1) {
      if (cargaDe(p, j) >= 0) continue
      V.x = p.lugar[j * 3] - p.lugar[i * 3]
      V.y = p.lugar[j * 3 + 1] - p.lugar[i * 3 + 1]
      V.z = p.lugar[j * 3 + 2] - p.lugar[i * 3 + 2]
      const d = Math.hypot(V.x, V.y, V.z)
      if (mejor === null || d < mejor[2]) mejor = [i, j, d]
    }
  }
  if (mejor === null) return false
  const [i, j] = mejor
  if (a.g.pareja[i] >= 0) a.g.pareja[a.g.pareja[i]] = -1
  if (a.g.pareja[j] >= 0) a.g.pareja[a.g.pareja[j]] = -1
  a.g.pareja[i] = -1
  a.g.pareja[j] = -1
  return recombinar(p, i, j)
}

/**
 * El centro (px de CSS) de la celda de 90 px con más cargas a la vista, lejos de los bordes y no sobre un texto (ahí el puntero no
 * recibe arcos).
 */
function grupoEnPantalla(a: Armado, vista: Vista): [number, number] | null {
  const celdas = new Map<number, number>()
  let mejor: [number, number, number] | null = null
  for (let i = 0; i < a.p.n; i += 1) {
    if (cargaDe(a.p, i) === 0) continue
    const s = enPantalla(a, vista, i, a.v)
    if (s === null) continue
    const [cx, cy] = [Math.floor(s[0] / 90), Math.floor(s[1] / 90)]
    const [px, py] = [cx * 90 + 45, cy * 90 + 45]
    if (Math.abs((px / vista.ancho) * 2 - 1) > 0.8 || Math.abs(1 - (py / vista.alto) * 2) > 0.75) continue
    const cuantas = (celdas.get(cx * 1000 + cy) ?? 0) + 1
    celdas.set(cx * 1000 + cy, cuantas)
    if (mejor === null || cuantas > mejor[2]) mejor = [px, py, cuantas]
  }
  return mejor === null ? null : [mejor[0], mejor[1]]
}

export function energiaDelBanco(a: Armado, vista: { readonly current: Vista }, memoria: { readonly current: { readonly velocidad: number } }): EnergiaDelBanco {
  return {
    estado: () => ({
      especies: censo(a.p),
      enlaces: enlacesVivos(a.g),
      arcos: a.arcos.arcos.filter((x) => x.activo).length,
      contados: { ...a.arcos.contados },
      maximoALaVez: a.arcos.maximoALaVez,
      temperatura: a.temperatura.valor,
      ionizaciones: a.p.cuenta.ionizaciones,
      recombinaciones: a.p.cuenta.recombinaciones,
      cursor: a.rayo.activo,
      carga: a.puntero.carga,
      velocidad: memoria.current.velocidad,
      crudo: a.temperatura.crudo,
    }),
    forzar: (que) => {
      if (que === 'recombina') return recombinarYa(a, vista.current)
      if (!(CLASES_DE_ARCOS as readonly string[]).includes(que)) return false
      a.arcos.forzado = que
      return true
    },
    calor: (valor) => ponerTemperatura(a.temperatura, valor),
    grupo: () => grupoEnPantalla(a, vista.current),
  }
}
