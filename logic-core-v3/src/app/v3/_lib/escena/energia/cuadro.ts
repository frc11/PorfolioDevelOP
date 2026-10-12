import * as THREE from 'three'

import { envejecer, golpeEn, residualEn, extremo, type Arco } from './arcos/arcos'
import { rellenarCinta } from './arcos/cinta'
import { puntoDelCamino, TRAMOS_DEL_CAMINO } from './arcos/camino'
import { programarArcos } from './arcos/programador'
import { ARCOS_EN_LA_ENTRADA, BRASAS } from './brasas'
import { TEMPERATURA, calentar, frentesDelLogo, leerLaEscena, type DeLaEscena } from './calor'
import { EFECTO, EFECTOS } from './dibujo/efectos'
import { DIBUJO } from './dibujo/comun'
import { subir, type Armado } from './dibujo/armado'
import { alfaDelDominio, armarElDominio, poblar, repartir } from './dominio'
import { pasoDeLasBrasas } from './paso'
import { rellenarRed } from './dibujo/red'
import { leerElGesto, pasoDeLaRed } from './reposo'
import { brilloPorDensidad, calentarBrasa } from './vecinas'
import { avanzar } from './interaccion/interaccion'
import { largo3 } from './largo'

/**
 * [PULIDO 17] O3 · UN CUADRO DE LA ENERGÍA (`docs/rediseno/PLASMA.md`). Lo que pasa afuera entra como temperatura (el scroll, las
 * ondas del logo, el golpe del pie) y como el latido del logo; el gesto del puntero pide pulsos y descargas; después las brasas, los
 * arcos (sus golpes calientan lo que tocan), sus luces y los efectos, y todo sube a la GPU. Sin reservas por cuadro. [PULIDO 19] Q0 · el
 * paso del enjambre (B) se fue con B.
 */
export const CUADRO = {
  /**
   * El punto del puntero: donde su rayo entra a una esfera de este radio alrededor del origen (el lugar del plasma; más afuera que el
   * logo); [PULIDO 19] Q1.b · lejos del logo, a la profundidad del foco (el plasma está en toda la vista).
   */
  entraALaNube: BRASAS.volumen.hueco + 1.2,
  /** El paso más largo de la física (s): un cuadro más largo se parte. */
  pasoMaximo: 1 / 60,
  /** Lo que un golpe de arco calienta: sus extremos y las brasas a su alrededor (u). */
  golpe: { extremos: 0.6, alrededor: 0.35, radio: 1.1 },
  /** Donde un arco toca el logo: el radio del destello (u) y su brillo (chico: un punto caliente, no una mancha). */
  toqueDelLogo: { radio: 0.16, brillo: 0.55 },
  /** El piso, debajo de un arco: su radio y cuánto crece con la luz (u). */
  piso: { radio: 0.7, crece: 0.45 },
  /** Cuánto dura una onda de pulso (s: hasta que su frente llega a `BRASAS.onda.llega`). */
  ondaS: BRASAS.onda.llega / BRASAS.onda.rapidez,
} as const

/** Lo que el cuadro recibe de la escena (un solo objeto, reescrito en cada cuadro: sin reservas). */
export interface Afuera extends DeLaEscena {
  /** El reloj de la página (ms). */
  ahora: number
  /** El piso (y del mundo). [PULIDO 18] P1.b · todo en el mundo: el plasma no sigue al logo. */
  piso: number
  camara: THREE.Camera
}

export function crearAfuera(): Afuera {
  return { dt: 0, ahora: 0, tiempo: 0, scroll: 0, alto: 1, anillos: [], naceEn: 3.6, ultimoPrincipal: Number.NEGATIVE_INFINITY, fin: 0, golpe: 1, piso: -4, camara: new THREE.PerspectiveCamera() }
}

const V = new THREE.Vector3()
const A = new Float32Array(3)
const B = new Float32Array(3)
const M = new Float32Array(3)

/** ¿Está el punto (NDC) sobre una caja de texto? */
function sobreUnTexto(a: Armado, x: number, y: number): boolean {
  const u = a.uniformes
  for (let k = 0; k < u.uCuantosTextos.value; k += 1) {
    const c = u.uTextos.value[k]
    if (x > c.x && x < c.z && y > c.y && y < c.w) return true
  }
  return false
}

/** Un efecto en el lugar `k`: dónde (en el mundo) y (tipo, radio, intensidad, 0). */
function efecto(a: Armado, k: number, x: number, y: number, z: number, tipo: number, radio: number, intensidad: number): number {
  if (k >= EFECTOS.cuantos) return k
  const l = a.efectos.lugar.array as Float32Array
  const e = a.efectos.efecto.array as Float32Array
  l[k * 3] = x
  l[k * 3 + 1] = y
  l[k * 3 + 2] = z
  e[k * 4] = tipo
  e[k * 4 + 1] = radio
  e[k * 4 + 2] = intensidad
  e[k * 4 + 3] = 0
  return k + 1
}

/** El rayo del puntero (en el mundo) y su punto a la altura de la nube (o del foco). El dedo que soltó en este cuadro todavía cuenta. */
function elPuntero(a: Armado, camara: THREE.Camera): void {
  const pt = a.puntero
  a.rayo.activo = pt.x < 2 && (pt.mouse ? !pt.fuera : pt.dedo || pt.pulso || pt.descarga)
  if (!a.rayo.activo) return
  V.set(pt.x, pt.y, 0.5).unproject(camara).sub(camara.position).normalize()
  const r = a.rayo.r
  r.ox = camara.position.x
  r.oy = camara.position.y
  r.oz = camara.position.z
  r.dx = V.x
  r.dy = V.y
  r.dz = V.z
  const cerca = -(r.ox * r.dx + r.oy * r.dy + r.oz * r.dz)
  const lejos2 = r.ox * r.ox + r.oy * r.oy + r.oz * r.oz - cerca * cerca
  const R2 = CUADRO.entraALaNube * CUADRO.entraALaNube
  const f = a.dominio.f
  const enEje = r.dx * f[0] + r.dy * f[1] + r.dz * f[2]
  const alFoco = enEje > 0.05 ? a.dominio.D / enEje : a.dominio.D
  const t = Math.max(2, lejos2 < R2 ? Math.min(alFoco, cerca - Math.sqrt(R2 - lejos2)) : alFoco)
  a.puntoDelPuntero[0] = r.ox + r.dx * t
  a.puntoDelPuntero[1] = r.oy + r.dy * t
  a.puntoDelPuntero[2] = r.oz + r.dz * t
}

/** [PULIDO 19] Q1.b · el dominio de la vista desde la cámara (su base y su campo; el foco, la distancia al logo) y, la primera vez, la siembra. */
function elDominio(a: Armado, f: Afuera): void {
  const d = a.dominio
  const cam = f.camara
  d.o[0] = cam.position.x
  d.o[1] = cam.position.y
  d.o[2] = cam.position.z
  for (let k = 0; k < d.ejes.length; k += 1) {
    const eje = d.ejes[k]
    V.set(eje[1], eje[2], eje[3]).applyQuaternion(cam.quaternion)
    eje[0][0] = V.x
    eje[0][1] = V.y
    eje[0][2] = V.z
  }
  const fov = cam instanceof THREE.PerspectiveCamera ? cam.fov : 35
  const aspecto = cam instanceof THREE.PerspectiveCamera ? cam.aspect : 1.6
  armarElDominio(d, fov, aspecto, cam.position.distanceTo(a.centro), f.piso)
  a.entrada.dominio = d
  // La siembra (el primer cuadro con cámara): todas en el dominio de la vista, ya encendidas (la página arranca con el plasma puesto).
  if (!a.poblado) {
    const b = a.brasas
    poblar(d, b, a.azar, true)
    for (let i = 0; i < b.n; i += 1) b.vida[i] = alfaDelDominio(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
    a.poblado = true
  }
}

/** Una onda nueva desde (x, y, z) del mundo (en el lugar de la más vieja). */
function ondaDesde(a: Armado, x: number, y: number, z: number, ahora: number): void {
  const k = a.ondas[3] <= a.ondas[7] ? 0 : 1
  a.ondas[k * 4] = x
  a.ondas[k * 4 + 1] = y
  a.ondas[k * 4 + 2] = z
  a.ondas[k * 4 + 3] = ahora
}

/** Una onda nueva desde el punto del puntero. */
function onda(a: Armado, ahora: number): void {
  ondaDesde(a, a.puntoDelPuntero[0], a.puntoDelPuntero[1], a.puntoDelPuntero[2], ahora)
}

/** El gesto: la carga del puntero; el pulso del clic y la descarga al soltar (nunca sobre un texto), con su onda. */
function elGesto(a: Armado, f: Afuera): void {
  const pt = a.puntero
  a.entrada.cargaDelPuntero = avanzar(pt, f.ahora, f.dt)
  const libre = a.rayo.activo && !sobreUnTexto(a, pt.x, pt.y)
  if (pt.pulso) {
    pt.pulso = false
    if (libre) {
      a.arcos.pedidos.pulso = true
      a.arcos.pedidos.donde.set(a.puntoDelPuntero)
      calentar(a.temperatura, TEMPERATURA.pulso)
      onda(a, f.ahora)
    }
  }
  if (pt.descarga) {
    pt.descarga = false
    if (libre) {
      a.arcos.pedidos.descarga = true
      a.arcos.pedidos.fuerza = pt.fuerza
      a.arcos.pedidos.donde.set(a.puntoDelPuntero)
      calentar(a.temperatura, TEMPERATURA.descarga * (0.5 + 0.5 * pt.fuerza))
      onda(a, f.ahora)
    }
  }
  for (let k = 0; k < 2; k += 1) {
    const edad = (f.ahora - a.ondas[k * 4 + 3]) / 1000
    a.entrada.pulsos[k * 4] = a.ondas[k * 4]
    a.entrada.pulsos[k * 4 + 1] = a.ondas[k * 4 + 1]
    a.entrada.pulsos[k * 4 + 2] = a.ondas[k * 4 + 2]
    a.entrada.pulsos[k * 4 + 3] = edad >= 0 && edad < CUADRO.ondaS ? edad : -1
  }
}

/**
 * [PULIDO 18] P1.e · lo que el movimiento nuevo lee del cuadro: el VIENTO del scroll (en contra de la cámara que pasa, tan fuerte como el
 * scroll y más caliente, con tope, asentándose), la ESTELA del puntero (lo que se mueve su punto en la nube, suavizado) y los CANALES
 * de los arcos que golpean (para el pinch).
 */
function vientoEstelaYCanales(a: Armado, f: Afuera): void {
  const W = BRASAS.viento
  const en = a.entrada
  const dt = Math.max(1e-3, f.dt)
  const asienta = 1 - Math.exp(-f.dt / W.asienta)
  const cam = f.camara.position
  const k = a.camaraAntes
  const corre = largo3(cam.x - k.x, cam.y - k.y, cam.z - k.z)
  const fuerza = Math.min(W.tope, W.escala * Math.abs(a.lectura.velocidad) * (1 + W.caliente * a.temperatura.valor))
  for (let e = 0; e < 3; e += 1) {
    const hacia = Number.isFinite(corre) && corre > 1e-5 ? -(cam.getComponent(e) - k.getComponent(e)) / corre : 0
    en.viento[e] += (hacia * fuerza - en.viento[e]) * asienta
  }
  k.copy(cam)
  const p = a.puntoDelPuntero
  const q = a.puntoAntes
  const sigue = 1 - Math.exp(-f.dt / 0.08)
  for (let e = 0; e < 3; e += 1) {
    const v = a.rayo.activo && Number.isFinite(q[e]) ? Math.max(-4, Math.min(4, (p[e] - q[e]) / dt)) : 0
    en.estela[e] += (v - en.estela[e]) * sigue
    q[e] = a.rayo.activo ? p[e] : Number.NaN
  }
  let n = 0
  for (const arco of a.arcos.arcos) {
    if (!arco.activo || n >= ARCOS_EN_LA_ENTRADA) continue
    extremo(arco, a.brasas, true, A)
    extremo(arco, a.brasas, false, B)
    const o = n * 7
    en.arcos.set(A, o)
    en.arcos.set(B, o + 3)
    en.arcos[o + 6] = golpeEn(arco, arco.edad) + 0.3 * residualEn(arco, arco.edad)
    n += 1
  }
  en.cuantosArcos = n
}

/** Un golpe de arco: calienta sus extremos (brasas) y las brasas cerca de su medio, y la escena. */
function alGolpe(a: Armado, arco: Arco): void {
  const b = a.brasas
  if (arco.a >= 0) calentarBrasa(b, arco.a, CUADRO.golpe.extremos)
  if (arco.b >= 0) calentarBrasa(b, arco.b, CUADRO.golpe.extremos)
  extremo(arco, b, true, A)
  extremo(arco, b, false, B)
  puntoDelCamino(arco.forma, A, B, TRAMOS_DEL_CAMINO >> 1, M)
  const r2 = CUADRO.golpe.radio * CUADRO.golpe.radio
  for (let i = 0; i < b.n; i += 1) {
    const dx = b.lugar[i * 3] - M[0]
    const dy = b.lugar[i * 3 + 1] - M[1]
    const dz = b.lugar[i * 3 + 2] - M[2]
    if (dx * dx + dy * dy + dz * dz < r2) calentarBrasa(b, i, CUADRO.golpe.alrededor)
  }
  calentar(a.temperatura, TEMPERATURA.arco)
}

/** Las luces de los arcos (el medio del canal) y los efectos (el piso, el logo, la carga). */
function lucesYEfectos(a: Armado, f: Afuera): number {
  const u = a.uniformes
  let luces = 0
  let n = 0
  for (const arco of a.arcos.arcos) {
    if (!arco.activo) continue
    extremo(arco, a.brasas, true, A)
    extremo(arco, a.brasas, false, B)
    puntoDelCamino(arco.forma, A, B, TRAMOS_DEL_CAMINO >> 1, M)
    const brillo = (golpeEn(arco, arco.edad) + 0.4 * residualEn(arco, arco.edad)) * arco.brillo
    if (luces < DIBUJO.luces) {
      u.uLuces.value[luces].set(M[0], M[1], M[2], brillo)
      luces += 1
    }
    const i = Math.min(1.4, brillo)
    n = efecto(a, n, M[0], f.piso, M[2], EFECTO.piso, CUADRO.piso.radio + CUADRO.piso.crece * i, i)
    // Donde un arco del logo lo toca (el del logo nace en su borde; una descarga al logo termina en él).
    if (arco.clase === 'logo' || (arco.clase === 'descarga' && arco.b < 0)) {
      const p = arco.clase === 'logo' ? arco.puntoA : arco.puntoB
      n = efecto(a, n, p[0], p[1], p[2], EFECTO.logo, CUADRO.toqueDelLogo.radio * arco.ancho, CUADRO.toqueDelLogo.brillo * Math.exp(-arco.edad / 0.1) * arco.brillo)
    }
  }
  u.uCuantasLuces.value = luces
  return n
}

/** Un cuadro (no con movimiento reducido): la escena, el puntero, el gesto, las brasas, los arcos y el dibujo. */
export function cuadro(a: Armado, f: Afuera): void {
  leerLaEscena(a.temperatura, a.lectura, f)
  if (a.lectura.golpeAhora) ondaDesde(a, a.centro.x, a.centro.y, a.centro.z, f.ahora)
  elDominio(a, f)
  elPuntero(a, f.camara)
  const en = a.entrada
  // [PULIDO 19] Q1.d · la red en reposo: el gesto se lee antes de que `elGesto` consuma el pulso y la descarga; el origen de la cascada
  // del corte es el puntero si está (si no, el centro).
  const pt = a.puntero
  const gesto = leerElGesto(a.gesto, f.scroll, pt.x, pt.y, a.rayo.activo, pt.dedo || pt.apretado || pt.pulso || pt.descarga, f.fin)
  pasoDeLaRed(a.red, a.brasas, a.dominio, en, f.dt, gesto, a.rayo.activo ? pt.x : 0, a.rayo.activo ? pt.y : 0, a.azar)
  elGesto(a, f)
  en.tiempo = f.tiempo
  en.temperatura = a.temperatura.valor
  en.rayo = a.rayo.activo ? a.rayo.r : null
  en.piso = f.piso
  en.logo[0] = a.centro.x
  en.logo[1] = a.centro.y
  en.logo[2] = a.centro.z
  frentesDelLogo(f.anillos, f.tiempo, f.naceEn, en.anillos)
  vientoEstelaYCanales(a, f)
  const pasos = Math.max(1, Math.ceil(f.dt / CUADRO.pasoMaximo))
  for (let k = 0; k < pasos; k += 1) pasoDeLasBrasas(a.brasas, f.dt / pasos, en, a.azar)
  // [PULIDO 19] Q1.d · con la red armándose o armada no hay reparto (una brasa enlazada que se muda arrastraría su rayo por la pantalla).
  if (a.red.fase === 'suelta') repartir(a.dominio, a.brasas, a.azar)
  brilloPorDensidad(a.brasas, f.dt)
  rellenarRed(a.red, a.brasas, a.dibujoDeLaRed)
  const entorno = a.entorno
  entorno.camara[0] = f.camara.position.x
  entorno.camara[1] = f.camara.position.y
  entorno.camara[2] = f.camara.position.z
  entorno.logo[0] = a.centro.x
  entorno.logo[1] = a.centro.y
  entorno.logo[2] = a.centro.z
  entorno.temperatura = a.temperatura.valor
  entorno.actividadDelLogo = a.lectura.actividadDelLogo
  envejecer(a.arcos, a.brasas, f.dt, a.azar)
  for (const arco of a.arcos.arcos) for (let k = 0; k < arco.nuevos; k += 1) alGolpe(a, arco)
  programarArcos(a.arcos, a.brasas, f.dt, entorno, a.azar)
  const efectos = lucesYEfectos(a, f)
  rellenarCinta(a.arcos, a.brasas, a.cinta)
  subir(a, efectos)
}

/** Con movimiento reducido: quietas (ya a la vista, en reposo), sin arcos ni pulsos ni efectos. */
export function cuadroQuieto(a: Armado, hecho: { listo: boolean }): void {
  if (hecho.listo) return
  a.brasas.energia.fill(BRASAS.energia.base)
  a.uniformes.uCuantasLuces.value = 0
  subir(a, 0)
  hecho.listo = true
}

/** Los arcos vivos (el banco). */
export const arcosVivos = (a: Armado): number => a.arcos.arcos.filter((x) => x.activo).length

