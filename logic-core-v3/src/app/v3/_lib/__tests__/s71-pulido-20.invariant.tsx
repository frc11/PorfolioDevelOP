/**
 * PULIDO 20 — EL PIE QUE SE TRABA, EL CRISTAL EN EL BORDE, LA RED DE RAYOS (`docs/rediseno/SPRINT-PULIDO-20.md`). Cada cosa con su
 * control positivo (el detector ve el estado de antes o uno roto a propósito).
 *   R1 · el final del pie llega a su fin en un tiempo acotado (el fondo es el del layout: un DOM transformado no lo mueve); con el pie de
 *        1440 y de 1920 del sitio (`entregas/pulido-20/pie-*.json`) y la caída de verdad (`armarLaCaida` + `aplicarLaCaida`): cada columna
 *        es un cuerpo invisible que baja parado con el logo hasta tener la base en el piso y vuelca entero, tocando en el golpe; sus piezas,
 *        sólidas (su escala y sus ángulos rectos se conservan en cada cuadro), van pegadas a ella (sus distancias no cambian), sin saltos, y
 *        ninguna se interpenetra con otra ni con el logo en ningún cuadro; el DOM sólo con la columna quieta; el piso se calma bajo el pie
 *        (la simulación recibe la calma); las sombras, sólo de las placas y se van al incrustarse; la cámara del final en escritorio, de
 *        costado y lejos (el humano: «que se vea gran parte de la escena»): todo el pie acostado y el logo adentro del cuadro, sin llenarlo.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { CAIDA_AL_HUECO, caidaIntegrada, poseDeLaCaida } from '../escena/final/caidaAlHueco'
import { CAIDA_DEL_PIE, crearLugar, distanciaParaElPie, domDeLaPieza, domSigueALaPieza, lugaresEnElPiso, poseDeLaPiezaQueCae, type BaseDelPie, type PiezaDePie } from '../escena/final/caidaDelPie'
import { ELEVACION_DEL_FINAL, EN_VIVO, FINAL_DEL_PIE, LOGO_DE_SIEMPRE, RELOJ_DEL_FINAL, blancoDelFinal, camaraDelFinal, pasoDelReloj, relojQuieto } from '../escena/final/recorridoDelFinal'
import type { Armada } from '../escena/pie3d/armadas'
import { aplicarLaCaida, armarLaCaida, crearLaCaidaDelPie, sombrasDeLaCaida, type CaidaDelPie } from '../escena/pie3d/caida'
import { colocarLaPieza } from '../escena/pie3d/colocacion'
import { FLOOR_Y } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { lineasDeCodigo, sinReservasEn } from './s69-ayudas'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const ESCENA = (m: string): string => leer(`_lib/escena/${m}`)
const G = CAIDA_AL_HUECO.golpeS
const DUR = RELOJ_DEL_FINAL.duracionS

// ═══════════════════════════════════════════════════════════════════════════
titulo('R1 · El final del pie llega a su fin: el fondo del layout (un DOM transformado no lo mueve) y el reloj que corre hasta el final')

// La causa (reproducida en el sitio): el fondo salía del desborde (`scrollHeight`), que crece con el DOM transformado de las piezas
// que siguen a la cámara; ahora sale del layout (`offsetHeight`).
const CUADRO_DEL_FINAL = ESCENA('final/cuadroDelFinal.ts')
const fondoBien = (f: string): boolean => f.includes('s.fondo = Math.max(0, document.documentElement.offsetHeight - window.innerHeight)') && !/scrollHeight\s*-\s*window\.innerHeight/.test(f)
afirmar(fondoBien(CUADRO_DEL_FINAL), '  el fondo del final es el del layout (`offsetHeight`), no el desborde que agranda un DOM transformado (`scrollHeight`)')
controlPositivo('  el detector VE el fondo de antes', CUADRO_DEL_FINAL.replace('document.documentElement.offsetHeight - window.innerHeight', 'document.documentElement.scrollHeight - window.innerHeight'), fondoBien)

// El reloj al fondo con el pie entero: cuánto tarda en llegar a `fin` = 1 (s), con el «al fondo» que da el modelo de la página.
function hastaElFinal(alFondo: (fin: number) => boolean): number {
  const r = relojQuieto()
  for (let k = 0; k < 60 * 30; k += 1) {
    pasoDelReloj(r, { alFondo: alFondo(r.fin), pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 99, viajeS: 0 }, 1 / 60)
    if (r.fin >= 0.999) return (k + 1) / 60
  }
  return Number.POSITIVE_INFINITY
}
const ACOTADO_S = DUR + 1
// Con el fondo del layout la página está al fondo en todo el final; el de antes dejaba de estarlo con la cámara subida un 13 % (el DOM
// de las redes pasaba el fin del documento): el equilibrio del sitio, `fin` ≈ 0,347 para siempre.
const LLEGA = hastaElFinal(() => true)
const relojBien = (s: number): boolean => s <= ACOTADO_S
afirmar(relojBien(LLEGA), `  al fondo con el pie entero, el final llega a su fin a los ${LLEGA.toFixed(2)} s (dura ${DUR.toFixed(1)}; tope ${ACOTADO_S.toFixed(1)})`)
controlPositivo('  el detector VE el final trabado del sitio (al fondo sólo hasta `fin` 0,347)', hastaElFinal((fin) => fin < 0.347), relojBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R1 · La caída con el pie de 1440 y 1920 del sitio: las columnas bajan con el logo y vuelcan enteras, las piezas pegadas, sin cruces')

interface DatosDelPie {
  readonly ancho: number
  readonly alto: number
  readonly camara: { readonly posicion: number[]; readonly cuaternion: number[]; readonly fov: number; readonly d: number }
  readonly piezas: readonly { readonly id: string; readonly forma: string; readonly caja: readonly number[]; readonly espesor: number }[]
}
const datosDe = (ancho: string): DatosDelPie => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-20/pie-${ancho}.json`, 'utf8')) as DatosDelPie
const DATOS = datosDe('1440')
const DATOS_1920 = datosDe('1920')
/** La cámara de antes del final del sitio (sin el mouse), el cuadro y la profundidad de la pared. */
function escenaDe(datos: DatosDelPie): { readonly camara: THREE.PerspectiveCamera; readonly cuadro: { readonly ancho: number; readonly alto: number }; readonly d: number } {
  const camara = new THREE.PerspectiveCamera(datos.camara.fov, datos.ancho / datos.alto, 0.1, 500)
  camara.position.fromArray(datos.camara.posicion)
  camara.quaternion.fromArray(datos.camara.cuaternion)
  camara.updateProjectionMatrix()
  camara.updateMatrixWorld(true)
  return { camara, cuadro: { ancho: datos.ancho, alto: datos.alto }, d: datos.camara.d }
}
const { camara: CAMARA, cuadro: CUADRO, d: D } = escenaDe(DATOS)

/** Las piezas como las arma el pie (sólo lo que la caída lee: la forma, la caja, el espesor y su grupo). */
function armadasDe(datos: DatosDelPie): Armada[] {
  return datos.piezas.map((p) => ({ pieza: { forma: p.forma }, medida: { caja: { x: p.caja[0], y: p.caja[1], ancho: p.caja[2], alto: p.caja[3] } }, espesor: p.espesor, grupo: new THREE.Group() }) as unknown as Armada)
}

/** Una caja orientada en el mundo: el centro, sus tres ejes (unitarios) y sus medias extensiones. */
interface Caja3 {
  readonly c: THREE.Vector3
  readonly e: readonly THREE.Vector3[]
  readonly h: readonly number[]
}
/** La caja de una pieza colocada: su geometría en px va de (0, −alto, −espesor) a (ancho, 0, 0). */
function cajaDeLaPieza(a: Armada): Caja3 {
  const { ancho, alto } = a.medida.caja
  const m = a.grupo.matrixWorld
  const x = new THREE.Vector3()
  const y = new THREE.Vector3()
  const z = new THREE.Vector3()
  m.extractBasis(x, y, z)
  const [lx, ly, lz] = [x.length(), y.length(), z.length()]
  return { c: new THREE.Vector3(ancho / 2, -alto / 2, -a.espesor / 2).applyMatrix4(m), e: [x.normalize(), y.normalize(), z.normalize()], h: [(ancho / 2) * lx, (alto / 2) * ly, (a.espesor / 2) * lz] }
}
/** La caja del logo (su placa: el ancho, el alto y el espesor) en su pose de la caída a los `s` del reloj. */
const LOGO = { alto: LOGO_DE_SIEMPRE.alto, espesor: LOGO_DE_SIEMPRE.espesor, ancho: EN_VIVO.huellaDelLogo.x }
function cajaDelLogo(s: number): Caja3 {
  const pose = { centro: new THREE.Vector3(), rotacionX: 0 }
  poseDeLaCaida(LOGO, s, pose)
  const r = new THREE.Matrix4().makeRotationX(pose.rotacionX)
  const [x, y, z] = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0).applyMatrix4(r), new THREE.Vector3(0, 0, 1).applyMatrix4(r)]
  return { c: pose.centro.clone(), e: [x, y, z], h: [LOGO.ancho / 2, LOGO.alto / 2, LOGO.espesor / 2] }
}
/** ¿Se cruzan dos cajas orientadas (más de `margen` u)? Los 15 ejes separadores. */
function seCruzan(a: Caja3, b: Caja3, margen: number): boolean {
  const ejes: THREE.Vector3[] = [...a.e, ...b.e]
  for (const u of a.e) for (const v of b.e) {
    const x = new THREE.Vector3().crossVectors(u, v)
    if (x.lengthSq() > 1e-10) ejes.push(x.normalize())
  }
  const t = new THREE.Vector3().subVectors(b.c, a.c)
  for (const L of ejes) {
    const ra = a.h[0] * Math.abs(a.e[0].dot(L)) + a.h[1] * Math.abs(a.e[1].dot(L)) + a.h[2] * Math.abs(a.e[2].dot(L))
    const rb = b.h[0] * Math.abs(b.e[0].dot(L)) + b.h[1] * Math.abs(b.e[1].dot(L)) + b.h[2] * Math.abs(b.e[2].dot(L))
    if (Math.abs(t.dot(L)) > ra + rb - margen) return false
  }
  return true
}

interface DeLaCaida {
  /** Lo más que se apartó una pieza de un sólido (su escala de la pared y sus ángulos rectos), relativo. */
  readonly deformacion: number
  /** Lo más que cambió la distancia entre dos piezas de la misma columna (u: van pegadas) y lo más que se movió un centro entre cuadros (u, a 120 cps). */
  readonly despegue: number
  readonly salto: number
  /** Cuántos pares (pieza con pieza, pieza con logo) se cruzaron en algún cuadro, y el primero. */
  readonly cruces: number
  readonly conElLogo: number
  readonly primero: string
  /** Cuántas columnas no tocan en el golpe, no estaban paradas con la base en el piso antes de inclinarse, no quedan incrustadas y quietas al terminar. */
  readonly fueraDelGolpe: number
  readonly sinBase: number
  readonly sinIncrustar: number
  readonly piezas: number
  readonly columnas: number
}
/** La caída entera, cuadro a cuadro (120 por s) con la pared del sitio; `mover` toca los lugares después de armarlos (los controles). */
function correrLaCaida(datos: DatosDelPie, mover?: (c: CaidaDelPie) => void): DeLaCaida {
  const { camara: CAMARA, cuadro: CUADRO, d: D } = escenaDe(datos)
  const armadas = armadasDe(datos)
  const c = crearLaCaidaDelPie()
  let deformacion = 0
  const pares = new Set<string>()
  let conElLogo = 0
  let primero = ''
  let mpp = 0
  let despegue = 0
  let salto = 0
  const antes: THREE.Vector3[] = []
  const distancias = new Map<string, number>()
  for (let k = 0; k <= Math.ceil(DUR * 120); k += 1) {
    const s = k / 120
    EN_VIVO.fin = s / DUR
    armarLaCaida(c, armadas, 0, 0, CAMARA, CUADRO, D)
    mover?.(c)
    const cajas: Caja3[] = []
    for (let i = 0; i < armadas.length; i += 1) {
      const a = armadas[i]
      mpp = colocarLaPieza(a.grupo, CAMARA, a.medida.caja.x, a.medida.caja.y, CUADRO.ancho, CUADRO.alto, D)
      aplicarLaCaida(c, i, a, s)
      a.grupo.updateMatrixWorld(true)
      const x = new THREE.Vector3()
      const y = new THREE.Vector3()
      const z = new THREE.Vector3()
      a.grupo.matrixWorld.extractBasis(x, y, z)
      deformacion = Math.max(deformacion, ...[x, y, z].map((v) => Math.abs(v.length() - mpp) / mpp), Math.abs(x.dot(y)) / (mpp * mpp), Math.abs(y.dot(z)) / (mpp * mpp), Math.abs(x.dot(z)) / (mpp * mpp), ...[a.grupo.scale.x, a.grupo.scale.y, a.grupo.scale.z].map((e) => Math.abs(e - mpp) / mpp))
      cajas.push(cajaDeLaPieza(a))
    }
    // Sin saltos (el centro de cada pieza entre cuadros) y pegadas a su columna (la distancia entre dos de la misma, como en la pared).
    for (let i = 0; i < cajas.length; i += 1) {
      if (antes[i] !== undefined) salto = Math.max(salto, antes[i].distanceTo(cajas[i].c))
      antes[i] = cajas[i].c.clone()
      for (let j = i + 1; j < cajas.length; j += 1) {
        if (c.piezas[i].columna !== c.piezas[j].columna) continue
        const clave = `${String(i)}-${String(j)}`
        const dij = cajas[i].c.distanceTo(cajas[j].c)
        const d0 = distancias.get(clave)
        if (d0 === undefined) distancias.set(clave, dij)
        else despegue = Math.max(despegue, Math.abs(dij - d0))
      }
    }
    const logo = cajaDelLogo(s)
    for (let i = 0; i < cajas.length; i += 1) {
      if (seCruzan(cajas[i], logo, 1e-3) && !pares.has(`${String(i)}-logo`)) {
        pares.add(`${String(i)}-logo`)
        conElLogo += 1
        primero ||= `${datos.piezas[i].id} con el logo a los ${s.toFixed(2)} s`
      }
      for (let j = i + 1; j < cajas.length; j += 1) {
        if (!seCruzan(cajas[i], cajas[j], 1e-3) || pares.has(`${String(i)}-${String(j)}`)) continue
        pares.add(`${String(i)}-${String(j)}`)
        primero ||= `${datos.piezas[i].id} con ${datos.piezas[j].id} a los ${s.toFixed(2)} s`
      }
    }
  }
  // El reloj de cada columna: toca en el golpe, parada con la base en el piso antes de inclinarse, incrustada y quieta al terminar.
  let fueraDelGolpe = 0
  let sinBase = 0
  let sinIncrustar = 0
  for (let i = 0; i < c.m; i += 1) {
    const p = c.columnas[i]
    const l = c.lugares[i]
    if (Math.abs(l.toca - G) > 1e-9 || poseDeLaPiezaQueCae(p, l, G - 0.01).toco || !poseDeLaPiezaQueCae(p, l, G + 0.01).toco) fueraDelGolpe += 1
    const parada = poseDeLaPiezaQueCae(p, l, Math.max(l.bajaS, l.inclina - 1e-3))
    if (l.inclina < l.bajaS - 1e-9 || parada.a !== 0 || parada.bajada !== 1 || Math.abs(parada.y - FLOOR_Y) > 1e-9) sinBase += 1
    const fin = poseDeLaPiezaQueCae(p, l, DUR)
    if (!fin.quieta || fin.hundido !== 1 || Math.abs(fin.a - Math.PI / 2) > 1e-9 || domDeLaPieza(l, DUR) !== 1) sinIncrustar += 1
  }
  return { deformacion, despegue, salto, cruces: pares.size - conElLogo, conElLogo, primero, fueraDelGolpe, sinBase, sinIncrustar, piezas: c.n, columnas: c.m }
}
const CAIDA = correrLaCaida(DATOS)
const SALTO_MAXIMO = 1.5
const caidaBien = (m: DeLaCaida): boolean => m.piezas > 0 && m.columnas === 2 && m.deformacion < 1e-6 && m.despegue < 1e-6 && m.salto <= SALTO_MAXIMO && m.cruces === 0 && m.conElLogo === 0 && m.fueraDelGolpe === 0 && m.sinBase === 0 && m.sinIncrustar === 0
const CAIDA_1920 = correrLaCaida(DATOS_1920)
afirmar(caidaBien(CAIDA_1920) && CAIDA_1920.piezas === DATOS_1920.piezas.length, `  las ${String(CAIDA_1920.piezas)} piezas del pie de 1920 en sus ${String(CAIDA_1920.columnas)} columnas: lo mismo (se apartan ${CAIDA_1920.deformacion.toExponential(1)}, se despegan ${CAIDA_1920.despegue.toExponential(1)} u, el salto mayor ${CAIDA_1920.salto.toFixed(2)} u; ningún cruce)`, CAIDA_1920.primero)
afirmar(caidaBien(CAIDA) && CAIDA.piezas === DATOS.piezas.length, `  las ${String(CAIDA.piezas)} piezas del pie de 1440 en sus ${String(CAIDA.columnas)} columnas, en ${String(Math.ceil(DUR * 120) + 1)} cuadros: cada columna baja parada con el logo, con la base en el piso antes de inclinarse, toca en el golpe (${String(G)} s) y queda incrustada y quieta, con su DOM, al terminar; sus piezas sólidas (se apartan ${CAIDA.deformacion.toExponential(1)} de su escala y sus ángulos rectos), pegadas a ella (se despegan ${CAIDA.despegue.toExponential(1)} u), sin saltos (lo más ${CAIDA.salto.toFixed(2)} u entre cuadros a 120 cps; tope ${String(SALTO_MAXIMO)}); ninguna se cruza con otra ni con el logo`, CAIDA.primero)
controlPositivo('  el detector VE una pieza que se estira', { ...CAIDA, deformacion: 0.05 }, caidaBien)
controlPositivo('  y una pieza que se despega de su columna (corrida 50 px en la caída)', correrLaCaida(DATOS, (c) => {
  c.piezas[3].dx += 50
}), caidaBien)
controlPositivo('  y un salto (la bajada en dos tramos con el primero sin aplicar: el defecto que este detector encontró)', { ...CAIDA, salto: 14 }, caidaBien)
controlPositivo('  y dos piezas en el mismo lugar (la cruz de verdad)', correrLaCaida(DATOS, (c) => {
  c.piezas[4].dx = c.piezas[3].dx
  c.piezas[4].dy = c.piezas[3].dy
}), caidaBien)
controlPositivo('  y una columna que cae sobre el logo (la izquierda corrida al centro)', correrLaCaida(DATOS, (c) => {
  c.columnas[0].o.x += 6
}), caidaBien)
controlPositivo('  y una pieza que toca después del golpe', { ...CAIDA, fueraDelGolpe: 1 }, caidaBien)

// Las altas arrancan antes: el orden de la física por el alto (la más alta, la primera), y una pieza más alta que el logo también entra.
function ordenPorAlto(piezas: readonly PiezaDePie[]): { readonly roto: number; readonly ultima: number; readonly toca: number } {
  const base: BaseDelPie = { derechaX: 1, derechaZ: 0, atrasX: 0, atrasZ: -1, logoX: 0, logoZ: 0, logoAncho: LOGO.ancho, logoFondo: LOGO.alto }
  const lugares = piezas.map(() => crearLugar())
  const ultima = lugaresEnElPiso(piezas, piezas.length, piezas.map((p) => caidaIntegrada(p)), base, lugares)
  let roto = 0
  let toca = 0
  for (let i = 0; i < piezas.length; i += 1) {
    if (Math.abs(lugares[i].toca - G) > 1e-9 || lugares[i].inclina < lugares[i].bajaS - 1e-9) toca += 1
    for (let j = 0; j < piezas.length; j += 1) if (piezas[i].alto > piezas[j].alto + 1e-6 && lugares[i].cae > lugares[j].cae + 1e-9) roto += 1
  }
  return { roto, ultima, toca }
}
const PIEZAS_ALTAS: PiezaDePie[] = [
  { ancho: 4, alto: 0.4, espesor: 0.3, x: -6, y: FLOOR_Y + 1, z: 10 },
  { ancho: 4, alto: 2.2, espesor: 0.1, x: -6, y: FLOOR_Y + 3, z: 10 },
  { ancho: 5, alto: LOGO.alto * 1.6, espesor: 0.5, x: 7, y: FLOOR_Y + 1, z: 10 },
]
const ORDEN = ordenPorAlto(PIEZAS_ALTAS)
const ordenBien = (o: { readonly roto: number; readonly ultima: number; readonly toca: number }): boolean => o.roto === 0 && o.toca === 0 && o.ultima + CAIDA_DEL_PIE.despuesS <= DUR + 1e-9
afirmar(ordenBien(ORDEN), `  cada una cae lo que le pide su alto (las altas arrancan antes) y, con una placa 1,6 veces más alta que el logo, todas tocan en el golpe paradas antes y el DOM de la última aparece a los ${ORDEN.ultima.toFixed(2)} s (el final dura ${DUR.toFixed(1)})`)
controlPositivo('  el detector VE una alta que arranca después que una chica', { ...ORDEN, roto: 1 }, ordenBien)
controlPositivo('  y un final que termina antes que el DOM de la última', { ...ORDEN, ultima: DUR }, ordenBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R1 · El DOM sólo con la pieza quieta, el piso calmo bajo el pie, las sombras sólo de las placas; el cableado')

// La cámara del final en escritorio: de costado (`camara.escritorio.elevacion`) y a la distancia en que el pie acostado y el logo ocupan
// `escritorio.ocupa` del cuadro: todas sus esquinas adentro, sin llenarlo (lo demás es piso y domo). La de PULIDO 19 (desde arriba, cerca,
// con el pie entero al 86 % del cuadro) es el control.
interface Encuadre {
  readonly elevacion: number
  readonly ocupa: number
  readonly fuera: number
}
function encuadreAlFinal(datos: DatosDelPie, cerca: boolean): Encuadre {
  const { camara, cuadro, d } = escenaDe(datos)
  const armadas = armadasDe(datos)
  const c = crearLaCaidaDelPie()
  EN_VIVO.fin = 1
  armarLaCaida(c, armadas, 0, 0, camara, cuadro, d)
  for (let i = 0; i < armadas.length; i += 1) {
    colocarLaPieza(armadas[i].grupo, camara, armadas[i].medida.caja.x, armadas[i].medida.caja.y, cuadro.ancho, cuadro.alto, d)
    aplicarLaCaida(c, i, armadas[i], DUR)
    armadas[i].grupo.updateMatrixWorld(true)
  }
  const viva = camara.clone()
  ELEVACION_DEL_FINAL.grados = cerca ? FINAL_DEL_PIE.camara.elevacion : FINAL_DEL_PIE.camara.escritorio.elevacion
  const distancia = cerca ? distanciaParaElPie(camara.fov, camara.aspect, c.huella[0], c.huella[1]) : EN_VIVO.distanciaDelPie
  camaraDelFinal(viva, 1, blancoDelFinal(1, new THREE.Vector3()), 0, 0, null, distancia)
  ELEVACION_DEL_FINAL.grados = FINAL_DEL_PIE.camara.elevacion
  let ocupa = 0
  let fuera = 0
  const v = new THREE.Vector3()
  const esquinas: THREE.Vector3[] = []
  for (const a of armadas) {
    const { ancho, alto } = a.medida.caja
    for (const [x, y] of [[0, 0], [ancho, 0], [0, -alto], [ancho, -alto]] as const) esquinas.push(new THREE.Vector3(x, y, 0).applyMatrix4(a.grupo.matrixWorld))
  }
  const logo = cajaDelLogo(DUR)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) esquinas.push(logo.c.clone().addScaledVector(logo.e[0], sx * logo.h[0]).addScaledVector(logo.e[2], sz * logo.h[2]))
  for (const e of esquinas) {
    v.copy(e).project(viva)
    ocupa = Math.max(ocupa, Math.abs(v.x), Math.abs(v.y))
    if (Math.abs(v.x) > 0.98 || Math.abs(v.y) > 0.98 || v.z > 1) fuera += 1
  }
  const rel = viva.position.clone().sub(blancoDelFinal(1, new THREE.Vector3()))
  return { elevacion: THREE.MathUtils.radToDeg(Math.atan2(rel.y, Math.hypot(rel.x, rel.z))), ocupa, fuera }
}
const ENCUADRE = encuadreAlFinal(DATOS, false)
const ENCUADRE_1920 = encuadreAlFinal(DATOS_1920, false)
const V = FINAL_DEL_PIE.camara.escritorio
const encuadreBien = (m: Encuadre): boolean => m.fuera === 0 && m.ocupa <= V.ocupa + 0.08 && m.elevacion <= V.elevacion + 3
afirmar(encuadreBien(ENCUADRE) && encuadreBien(ENCUADRE_1920), `  la cámara del final en escritorio, de costado (${ENCUADRE.elevacion.toFixed(0)}° sobre el blanco) y lejos: el pie acostado y el logo enteros en el cuadro, en el ${(ENCUADRE.ocupa * 100).toFixed(0)} % a 1440 y el ${(ENCUADRE_1920.ocupa * 100).toFixed(0)} % a 1920 (lo demás, piso y domo)`)
controlPositivo('  el detector VE la cámara de PULIDO 19 (desde arriba y cerca)', encuadreAlFinal(DATOS, true), encuadreBien)
controlPositivo('  y una esquina afuera', { ...ENCUADRE, fuera: 1 }, encuadreBien)
const ELEVACION_EN_EL_CUADRO = CUADRO_DEL_FINAL.includes('ELEVACION_DEL_FINAL.grados = !s.angosto && EN_VIVO.distanciaDelPie > 0 ? FINAL_DEL_PIE.camara.escritorio.elevacion : FINAL_DEL_PIE.camara.elevacion') && CUADRO_DEL_FINAL.indexOf('ELEVACION_DEL_FINAL.grados =') < CUADRO_DEL_FINAL.indexOf('const sube = alturaDeLaCaida(')
afirmar(ELEVACION_EN_EL_CUADRO, '  el final pone la elevación de escritorio (con el pie) antes de mover la cámara; abajo de 1024, la de siempre (desde arriba)')

// El DOM de cada pieza: entero en la pared, apagado (y sin seguirla) en camino, entero con la pieza incrustada.
function domEnCamino(dom: typeof domDeLaPieza, sigue: typeof domSigueALaPieza): number {
  const c = crearLaCaidaDelPie()
  EN_VIVO.fin = 0.5
  armarLaCaida(c, armadasDe(DATOS), 0, 0, CAMARA, CUADRO, D)
  let mal = 0
  for (let i = 0; i < c.m; i += 1) {
    const l = c.lugares[i]
    if (dom(l, 0) !== 1 || !sigue(l, 0) || dom(l, DUR) !== 1 || !sigue(l, DUR)) mal += 1
    for (let s = CAIDA_DEL_PIE.domFueraS + 0.01; s < l.incrustada; s += 0.05) if (dom(l, s) !== 0 || sigue(l, s)) mal += 1
  }
  return mal
}
const DOM_MAL = domEnCamino(domDeLaPieza, domSigueALaPieza)
afirmar(DOM_MAL === 0, '  el DOM de cada pieza: entero en la pared, apagado y quieto en camino (su homografía de canto no agranda el documento), entero con la pieza incrustada')
controlPositivo('  el detector VE un DOM que sigue a la pieza en camino', domEnCamino(domDeLaPieza, () => true), (m: number) => m === 0)

const ARMADAS_TS = ESCENA('pie3d/armadas.ts')
const CAIDA_TS = ESCENA('pie3d/caida.ts')
const CAIDA_DEL_PIE_TS = ESCENA('final/caidaDelPie.ts')
const PISO_VIVO = ESCENA('piso/PisoVivo.tsx')
const SOMBRA_TS = ESCENA('final/sombraDeLaPieza.ts')
interface Cableado {
  readonly armadas: string
  readonly caida: string
  readonly caidaDelPie: string
  readonly piso: string
  readonly sombra: string
}
const CABLEADO: Cableado = { armadas: ARMADAS_TS, caida: CAIDA_TS, caidaDelPie: CAIDA_DEL_PIE_TS, piso: PISO_VIVO, sombra: SOMBRA_TS }
const cableadoBien = (f: Cableado): boolean =>
  f.armadas.includes("if (a.pieza.forma !== 'texto' && (!enElFinal || domSigueEnLaCaida(s.caida, k, segundos))) seguirLaPieza(") && f.armadas.includes('llegar(a, s, enElFinal ? domDeLaCaida(s.caida, k, segundos) : 1)') && f.armadas.includes('const tocable = e >= 0.999 && final >= 0.999') &&
  ['uCalmaDelPie: FINAL_EN_EL_PISO.uCalmaDelPie', 'uBaseDelPie: FINAL_EN_EL_PISO.uBaseDelPie', 'uCalmaDelPieFuerza: FINAL_EN_EL_PISO.uCalmaDelPieFuerza'].every((u) => f.piso.slice(f.piso.indexOf('const sim = crearPingPong(')).split('...LUZ_DE_ABAJO_EN_VIVO')[0].includes(u)) &&
  f.sombra.includes('* pose.bajada * (1 - pose.hundido)') && f.caida.includes('if (!p.conSombra) continue') && f.caida.includes("p.conSombra = a.pieza.forma === 'placa' || a.pieza.forma === 'formulario'") && !f.caida.includes('pedirLaOnda') &&
  lineasDeCodigo(f.caidaDelPie) <= 300 && lineasDeCodigo(f.caida) <= 300 &&
  ['poseDeLaPiezaQueCae', 'lugaresEnElPiso', 'domDeLaPieza', 'domSigueALaPieza'].every((n) => sinReservasEn(f.caidaDelPie, n)) && ['armarLaCaida', 'aplicarLaCaida', 'domDeLaCaida', 'domSigueEnLaCaida', 'sombrasDeLaCaida'].every((n) => sinReservasEn(f.caida, n))
afirmar(cableadoBien(CABLEADO), '  el cableado: el DOM sigue a la pieza y recibe clics sólo quieta; la simulación del piso recibe la calma bajo el pie (PULIDO 19 la escribía y no llegaba); sombras sólo de las placas, que se van al incrustarse; sin pulsos sueltos; módulos de menos de 300 líneas y lo de cada cuadro sin reservas')
controlPositivo('  el detector VE el DOM que sigue siempre', { ...CABLEADO, armadas: ARMADAS_TS.replace("(!enElFinal || domSigueEnLaCaida(s.caida, k, segundos))", 'true') }, cableadoBien)
controlPositivo('  y la simulación sin la calma del pie (PULIDO 19)', { ...CABLEADO, piso: PISO_VIVO.replace('    uCalmaDelPie: FINAL_EN_EL_PISO.uCalmaDelPie,\n', '') }, cableadoBien)
controlPositivo('  y sombras que no se van al incrustarse', { ...CABLEADO, sombra: SOMBRA_TS.replace(' * (1 - pose.hundido)', '') }, cableadoBien)

// Las sombras en el tiempo: a mitad de la caída hay (las de las placas), al terminar ninguna (incrustadas).
function sombrasEnElTiempo(): { readonly mitad: number; readonly alFinal: number } {
  const c = crearLaCaidaDelPie()
  EN_VIVO.fin = (G - 0.4) / DUR
  armarLaCaida(c, armadasDe(DATOS), 0, 0, CAMARA, CUADRO, D)
  return { mitad: sombrasDeLaCaida(c, G - 0.4), alFinal: sombrasDeLaCaida(c, DUR) }
}
const SOMBRAS = sombrasEnElTiempo()
const PLACAS = DATOS.piezas.filter((p) => p.forma === 'placa' || p.forma === 'formulario').length
const sombrasBien = (m: { readonly mitad: number; readonly alFinal: number }): boolean => m.mitad === PLACAS && m.alFinal === 0
afirmar(sombrasBien(SOMBRAS), `  las sombras de contacto: ${String(SOMBRAS.mitad)} a mitad de la caída (las ${String(PLACAS)} placas; las letras no son una placa) y ninguna con todo incrustado`)
controlPositivo('  el detector VE sombras que se quedan al terminar', { ...SOMBRAS, alFinal: 1 }, sombrasBien)

cerrar('s71-pulido-20')
