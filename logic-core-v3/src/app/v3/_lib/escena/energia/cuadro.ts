import * as THREE from 'three'

import { lucesDeLosArcos } from './arcos/arcos'
import { rellenarTramos } from './arcos/bufer'
import { programarArcos } from './arcos/programador'
import { pasoDelGas } from './fisica/integracion'
import { TEMPERATURA, calentar, pasoDeLaTemperatura } from './fisica/temperatura'
import { avanzar } from './interaccion/interaccion'
import { trazarLineas } from './interaccion/lineasDeCampo'
import { EFECTO, EFECTOS } from './render/arcosYEfectos'
import { subir, type Armado } from './render/armado'
import { DIBUJO } from './render/comun'
import { ESPECIES } from './especies'

/**
 * [PULIDO 16] N2 · UN CUADRO DEL PLASMA (`docs/rediseno/PLASMA.md`). Lo que pasa afuera entra como temperatura (la velocidad del
 * scroll, los anillos y el pulso principal del logo, el golpe del final, el clic y la descarga del puntero) y como el latido y la
 * actividad del logo; el gesto del puntero (`interaccion.ts`) pide pulsos y descargas; después la física, los arcos, las líneas de
 * campo (`?plasma-campo=si`), las luces y los efectos, y todo sube a la GPU. Sin reservas por cuadro.
 */
export const CUADRO = {
  /** El latido del logo después de su pulso principal (s) y cuánto antes y después del golpe del final está más activo (del recorrido del final). */
  latidoS: 0.55,
  cercaDelGolpe: 0.12,
  /** El anillo del pulso del clic: su radio (u) y cuánto dura (s); el suavizado de la velocidad del scroll (s). */
  anillo: { radio: 2.8, duraS: 0.45 },
  suavizaScrollS: 0.12,
  /** Hasta dónde se ve el piso iluminado y cuánto crece con la luz (u). */
  piso: { radio: 1.1, crece: 0.9 },
  /** El punto del puntero: donde su rayo entra a una esfera de este radio alrededor del centro (más afuera que el hueco del logo). */
  entraALaNube: ESPECIES.volumen.hueco + 1.2,
  /** El eco de una recombinación: su radio (u). */
  eco: 0.7,
} as const

/** Lo que el cuadro recibe de la escena (un solo objeto, reescrito en cada cuadro: sin reservas). */
export interface Afuera {
  dt: number
  /** El reloj de la página (ms) y el de la escena (s, el de los anillos del pulso). */
  ahora: number
  tiempo: number
  scroll: number
  alto: number
  anillos: readonly THREE.Vector4[]
  naceEn: number
  ultimoPrincipal: number
  /** El final del pie: cuánto avanzó (0 a 1) y dónde cae el golpe. */
  fin: number
  golpe: number
  /** El piso, relativo al centro del logo (y). */
  piso: number
  campo: boolean
  camara: THREE.Camera
}

export function crearAfuera(): Afuera {
  return { dt: 0, ahora: 0, tiempo: 0, scroll: 0, alto: 1, anillos: [], naceEn: 3.6, ultimoPrincipal: Number.NEGATIVE_INFINITY, fin: 0, golpe: 1, piso: -4, campo: false, camara: new THREE.PerspectiveCamera() }
}

/** La memoria de un cuadro al otro. */
export interface Memoria {
  scroll: number
  velocidad: number
  principal: number
  /** Cuándo nacieron los anillos que ya calentaron (en doble precisión: compararlos con los de la escena tiene que dar igual). */
  readonly anillos: Float64Array
  fin: number
  /** Los anillos del pulso del clic: (x, y, z, desde cuándo, ms) × 2. */
  readonly pulsos: Float32Array
  /** El halo del puntero que se carga: sigue a la carga y al soltar se funde (no desaparece de golpe). */
  halo: number
  /** Con movimiento reducido, si ya quedaron quietas a la vista. */
  quietas: boolean
}

export function crearMemoria(): Memoria {
  return { scroll: Number.NaN, velocidad: 0, principal: Number.NEGATIVE_INFINITY, anillos: new Float64Array(4).fill(Number.NaN), fin: 0, pulsos: new Float32Array(8).fill(Number.NEGATIVE_INFINITY), halo: 0, quietas: false }
}

const V = new THREE.Vector3()

/** ¿Está el punto (NDC) sobre una caja de texto? */
function sobreUnTexto(a: Armado, x: number, y: number): boolean {
  const u = a.uniformes
  for (let k = 0; k < u.uCuantosTextos.value; k += 1) {
    const c = u.uTextos.value[k]
    if (x > c.x && x < c.z && y > c.y && y < c.w) return true
  }
  return false
}

/** Un efecto en el lugar `k`: dónde (relativo al centro) y (tipo, radio, intensidad, fase). */
function efecto(a: Armado, k: number, x: number, y: number, z: number, tipo: number, radio: number, intensidad: number, fase: number): number {
  if (k >= EFECTOS.cuantos) return k
  const l = a.efectos.lugar.array as Float32Array
  const e = a.efectos.efecto.array as Float32Array
  l[k * 3] = x
  l[k * 3 + 1] = y
  l[k * 3 + 2] = z
  e[k * 4] = tipo
  e[k * 4 + 1] = radio
  e[k * 4 + 2] = intensidad
  e[k * 4 + 3] = fase
  return k + 1
}

/** Un cuadro (no con movimiento reducido): la temperatura, el gesto, la física, los arcos y el dibujo. Devuelve los arcos que nacieron. */
export function cuadro(a: Armado, m: Memoria, f: Afuera): number {
  const T = a.temperatura
  const e = a.entrada
  const pt = a.puntero
  // El scroll: pantallas por segundo, suavizado.
  const v = Number.isFinite(m.scroll) && f.dt > 0 ? Math.abs(f.scroll - m.scroll) / f.dt / Math.max(1, f.alto) : 0
  m.scroll = f.scroll
  m.velocidad += (v - m.velocidad) * (1 - Math.exp(-f.dt / CUADRO.suavizaScrollS))
  // Las ondas del logo: un anillo nuevo (uno que no estaba, en cualquier lugar) calienta por su amplitud; el principal, más, y el
  // logo late.
  for (let k = 0; k < 4; k += 1) {
    const anillo = f.anillos[k]
    if (anillo === undefined) continue
    e.anillos[k * 4] = anillo.x
    e.anillos[k * 4 + 1] = anillo.y
    e.anillos[k * 4 + 2] = anillo.z
    e.anillos[k * 4 + 3] = anillo.w
    if (anillo.w > 0 && anillo.x !== m.anillos[0] && anillo.x !== m.anillos[1] && anillo.x !== m.anillos[2] && anillo.x !== m.anillos[3]) calentar(T, TEMPERATURA.anillo * anillo.w)
  }
  for (let k = 0; k < 4; k += 1) m.anillos[k] = f.anillos[k] === undefined || f.anillos[k].w <= 0 ? Number.NaN : f.anillos[k].x
  e.naceEn = f.naceEn
  if (f.ultimoPrincipal > m.principal) {
    if (Number.isFinite(m.principal)) calentar(T, TEMPERATURA.principal)
    m.principal = f.ultimoPrincipal
  }
  e.latido = Number.isFinite(m.principal) && f.tiempo >= m.principal ? Math.exp(-(f.tiempo - m.principal) / CUADRO.latidoS) : 0
  // El final: cerca del golpe el logo está más activo; en el golpe, una descarga del logo.
  const cerca = f.fin > 0 ? Math.max(0, 1 - Math.abs(f.fin - f.golpe) / CUADRO.cercaDelGolpe) : 0
  if (m.fin < f.golpe && f.fin >= f.golpe) {
    calentar(T, TEMPERATURA.descarga)
    a.arcos.forzado = 'logo'
    a.arcos.proximoDelLogo = Math.min(a.arcos.proximoDelLogo, 0.18)
  }
  m.fin = f.fin
  a.entorno.actividadDelLogo = Math.max(e.latido, cerca)
  // El puntero: su rayo (relativo al centro) y su punto a la altura de la nube (el más cercano al centro del logo).
  // El dedo que soltó su gesto en este cuadro (un toque, o soltar lo cargado) todavía cuenta: su último punto.
  a.rayo.activo = pt.x < 2 && (pt.mouse ? !pt.fuera : pt.dedo || pt.pulso || pt.descarga)
  if (a.rayo.activo) {
    V.set(pt.x, pt.y, 0.5).unproject(f.camara).sub(f.camara.position).normalize()
    const r = a.rayo.r
    r.ox = f.camara.position.x - a.centro.x
    r.oy = f.camara.position.y - a.centro.y
    r.oz = f.camara.position.z - a.centro.z
    r.dx = V.x
    r.dy = V.y
    r.dz = V.z
    // Donde el rayo entra a la nube; si pasa por afuera, su punto más cercano al centro.
    const cerca = -(r.ox * r.dx + r.oy * r.dy + r.oz * r.dz)
    const lejos2 = r.ox * r.ox + r.oy * r.oy + r.oz * r.oz - cerca * cerca
    const R2 = CUADRO.entraALaNube * CUADRO.entraALaNube
    const t = Math.max(2, lejos2 < R2 ? cerca - Math.sqrt(R2 - lejos2) : cerca)
    a.puntoDelPuntero[0] = r.ox + r.dx * t
    a.puntoDelPuntero[1] = r.oy + r.dy * t
    a.puntoDelPuntero[2] = r.oz + r.dz * t
  }
  e.rayo = a.rayo.activo ? a.rayo.r : null
  // El gesto: la carga del puntero; el pulso del clic y la descarga al soltar (nunca sobre un texto).
  e.cargaDelPuntero = avanzar(pt, f.ahora, f.dt)
  const libre = a.rayo.activo && !sobreUnTexto(a, pt.x, pt.y)
  if (pt.pulso) {
    pt.pulso = false
    if (libre) {
      a.arcos.pedidos.pulso = true
      a.arcos.pedidos.donde.set(a.puntoDelPuntero)
      calentar(T, TEMPERATURA.pulso)
      const k = m.pulsos[3] <= m.pulsos[7] ? 0 : 1
      m.pulsos[k * 4] = a.puntoDelPuntero[0]
      m.pulsos[k * 4 + 1] = a.puntoDelPuntero[1]
      m.pulsos[k * 4 + 2] = a.puntoDelPuntero[2]
      m.pulsos[k * 4 + 3] = f.ahora
    }
  }
  if (pt.descarga) {
    pt.descarga = false
    if (libre) {
      a.arcos.pedidos.descarga = true
      a.arcos.pedidos.fuerza = pt.fuerza
      a.arcos.pedidos.donde.set(a.puntoDelPuntero)
      calentar(T, TEMPERATURA.descarga * (0.5 + 0.5 * pt.fuerza))
    }
  }
  // La temperatura, la física y los arcos.
  pasoDeLaTemperatura(T, f.dt, m.velocidad)
  e.temperatura = T.valor
  e.tiempo = f.tiempo
  a.entorno.temperatura = T.valor
  pasoDelGas(a.g, f.dt, e, a.azar)
  programarArcos(a.arcos, a.g, f.dt, a.entorno, a.azar)
  const nacidos = a.arcos.nacidos
  if (nacidos > 0) calentar(T, TEMPERATURA.arco * nacidos)
  // Las líneas de campo (`?plasma-campo=si`), con el botón apretado.
  a.lineas.visible = f.campo ? pt.campo : 0
  if (a.lineas.visible > 0.01) trazarLineas(a.lineas, a.entorno.campo, e.rayo, a.puntoDelPuntero)
  // Las luces de los arcos (iluminan las partículas cercanas) y los efectos.
  const u = a.uniformes
  const luces = lucesDeLosArcos(a.arcos, a.p, a.luces, DIBUJO.luces)
  for (let k = 0; k < luces; k += 1) u.uLuces.value[k].set(a.luces[k * 4], a.luces[k * 4 + 1], a.luces[k * 4 + 2], a.luces[k * 4 + 3])
  u.uCuantasLuces.value = luces
  let n = 0
  for (let k = 0; k < luces; k += 1) {
    const i = Math.min(1.4, a.luces[k * 4 + 3])
    n = efecto(a, n, a.luces[k * 4], f.piso, a.luces[k * 4 + 2], EFECTO.piso, CUADRO.piso.radio + CUADRO.piso.crece * i, i, 0)
  }
  for (const arco of a.arcos.arcos) {
    if (!arco.activo || arco.a >= 0 || (arco.clase !== 'logo' && arco.clase !== 'descarga')) continue
    // Donde toca el logo (el del logo nace en su borde; la descarga sin grupo termina en él).
    const punto = arco.clase === 'logo' ? arco.puntoA : arco.puntoB
    const g = Math.exp(-arco.edad / 0.12) * arco.brillo
    if (arco.clase === 'logo' || arco.b < 0) n = efecto(a, n, punto[0], punto[1], punto[2], EFECTO.logo, 0.42 * arco.ancho, g, 0)
  }
  // Los ecos de las recombinaciones (el destello chico, también de día).
  const ecos = a.p.ecos
  for (let k = 0; k < ecos.length / 4; k += 1) {
    const t = ecos[k * 4 + 3] / ESPECIES.eco.s
    if (t < 1) n = efecto(a, n, ecos[k * 4], ecos[k * 4 + 1], ecos[k * 4 + 2], EFECTO.anillo, CUADRO.eco, 0.8, t)
  }
  for (let k = 0; k < 2; k += 1) {
    const t = (f.ahora - m.pulsos[k * 4 + 3]) / (CUADRO.anillo.duraS * 1000)
    if (t >= 0 && t < 1) n = efecto(a, n, m.pulsos[k * 4], m.pulsos[k * 4 + 1], m.pulsos[k * 4 + 2], EFECTO.anillo, CUADRO.anillo.radio, 1, t)
  }
  m.halo = Math.max(pt.carga, m.halo - f.dt / 0.25)
  if (m.halo > 0.01 && a.rayo.activo) n = efecto(a, n, a.puntoDelPuntero[0], a.puntoDelPuntero[1], a.puntoDelPuntero[2], EFECTO.halo, 0.45 + 1.1 * m.halo, m.halo, 0)
  subir(a, rellenarTramos(a.arcos, a.g, f.campo ? a.lineas : null, a.bufer), n)
  return nacidos
}

/** Con movimiento reducido: quietas (ya a la vista), sin arcos ni pulsos ni efectos. Sube una vez. */
export function cuadroQuieto(a: Armado, m: Memoria): void {
  if (m.quietas) return
  for (let i = 0; i < a.p.n; i += 1) a.p.alfa[i] = a.p.meta[i]
  a.uniformes.uCuantasLuces.value = 0
  subir(a, 0, 0)
  m.quietas = true
}
