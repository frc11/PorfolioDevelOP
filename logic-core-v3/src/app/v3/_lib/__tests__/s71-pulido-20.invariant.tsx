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
 *   R2 · el cristal de esquirlas: dónde se ve (nunca en una caja del texto, en la barra, en el logo ni en el centro; sí en el borde), las
 *        esquirlas (en el anillo contra el domo, facetadas), que nunca tapa una partícula (va antes que todo lo transparente que no es fondo
 *        y no escribe profundidad), que refracta sólo el fondo (su render target, sin logo, títulos, partículas ni pie) con la cámara de ESTE
 *        cuadro (la de antes vibraba), que se desvanece donde mira fuera del fondo, las variantes (`fondo=moire|espejo|ambos`, también
 *        sueltas en la URL) y lo medido en el sitio (ningún cuadro de más de 20 ms con él, lo que cuesta, la cámara quieta en calma).
 *   R3 · la red en reposo con rayos congelados: cada enlace un arco quebrado con su rama (los parámetros del camino del plasma), su forma de
 *        su semilla y sin el reloj (congelada), la geometría estática en un búfer y lo que cambia en una textura (`rellenarRed` no toca un
 *        vértice), el corte que abre el arco desde el medio.
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
import { CRISTAL } from '../escena/cristal/cristal'
import { armarElMuro, celdasDelMuro, medidasDelMuro } from '../escena/cristal/muro'
import { CAPA_DEL_FONDO, NOMBRES_DEL_FONDO } from '../escena/cristal/fondo'
import { FRAGMENTOS_DEL_VIDRIO, VERTICES_DEL_VIDRIO, armarElVidrio, uniformesDelVidrio } from '../escena/cristal/vidrio'
import { CAMINO } from '../escena/energia/arcos/camino'
import { azarConSemilla, crearBrasas } from '../escena/energia/brasas'
import { ORDEN_DE_LA_ENERGIA } from '../escena/energia/dibujo/armado'
import { DIBUJO_DE_LA_RED, FRAGMENTOS_DE_LA_RED, VERTICES_DE_LA_RED, armarLaRed, rellenarRed } from '../escena/energia/dibujo/red'
import { FRAGMENTOS_DE_LOS_ARCOS } from '../escena/energia/dibujo/arcos'
import { REPOSO, crearRed } from '../escena/energia/reposo'
import { PEDIDOS_DEL_FONDO, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { ORDEN_DEL_ESPEJO } from '../escena/espejo/pantalla'
import { PASE } from '../escena/pase/pase'
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
        // [PULIDO 23] U3 · un texto sube su espesor al incrustarse su columna (se apoya sobre el piso): el despegue, entre las placas.
        if (c.piezas[i].columna !== c.piezas[j].columna || c.piezas[i].esTexto || c.piezas[j].esTexto) continue
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
// [PULIDO 21] S3 · el sentido cambió por pedido («a 28° y al 62 % todo queda chico»): desde arriba y cerca. [PULIDO 23] U4 · y otra vez:
// sin el zoom fuerte, la cámara sube moderado (a `escritorio.elevacion`) y lo acostado ocupa del cuadro lo mismo que de pie (entre las
// puntas de `escritorio.ocupa`), entero; las cámaras de PULIDO 20 (lejos) y de PULIDO 21 (desde arriba) son los controles.
const encuadreBien = (m: Encuadre): boolean => m.fuera === 0 && m.ocupa >= V.ocupa[0] - 0.04 && m.ocupa <= V.ocupa[1] + 0.04 && Math.abs(m.elevacion - V.elevacion) <= 3
afirmar(encuadreBien(ENCUADRE) && encuadreBien(ENCUADRE_1920), `  la cámara del final en escritorio, moderada (${ENCUADRE.elevacion.toFixed(0)}° sobre el blanco): el pie acostado y el logo enteros en el cuadro, en el ${(ENCUADRE.ocupa * 100).toFixed(0)} % a 1440 y el ${(ENCUADRE_1920.ocupa * 100).toFixed(0)} % a 1920 (lo de pie)`)
controlPositivo('  el detector VE la cámara lejos de PULIDO 20 (28°, al 62 %)', { ...ENCUADRE, elevacion: 28, ocupa: 0.62 }, encuadreBien)
controlPositivo('  y la de PULIDO 21 (desde arriba, 89°)', { ...ENCUADRE, elevacion: 89 }, encuadreBien)
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
// [PULIDO 25] W2 b · los textos, sin sombra (en PULIDO 23 U3 tenían una suave, que se veía como un rectángulo oscuro detrás de cada bloque).
const sombrasBien = (m: { readonly mitad: number; readonly alFinal: number }): boolean => m.mitad === PLACAS && m.alFinal === 0
afirmar(sombrasBien(SOMBRAS), `  las sombras de contacto: ${String(SOMBRAS.mitad)} a mitad de la caída (las ${String(PLACAS)} placas; los textos, ninguna: nunca una caja) y ninguna con todo incrustado`)
controlPositivo('  el detector VE las sombras de los textos (PULIDO 23)', { ...SOMBRAS, mitad: PLACAS + 1 }, sombrasBien)
controlPositivo('  y sombras que se quedan al terminar', { ...SOMBRAS, alFinal: 1 }, sombrasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R2 · El cristal: [PULIDO 23] U1 · un muro continuo (un vitral roto) sin máscaras, nunca de espaldas, nunca tapa una partícula, refracta sólo el fondo')

// [PULIDO 23] U1 · el sentido cambió por pedido: las esquirlas sueltas (con rendijas, de espaldas y desvanecidas por máscaras cerca de
// los textos y del logo) se borraron. Ahora un MURO: las celdas de Voronoi del cilindro desenrollado comparten sus bordes (cada borde que
// no es el piso ni el techo está en exactamente dos celdas), cubren el cilindro entero sin solaparse (la suma de las áreas es la del
// cilindro) y cada triángulo mira hacia adentro (la única cara que se dibuja: la cámara está adentro).
const CELDAS = celdasDelMuro()
const MURO = armarElMuro(CELDAS)
const { ancho: ANCHO_DEL_MURO, alto: ALTO_DEL_MURO } = medidasDelMuro()
interface DelMuro { readonly celdas: number; readonly sueltos: number; readonly area: number; readonly deEspaldas: number; readonly triangulos: number }
function medirElMuro(celdas: readonly { readonly poligono: readonly number[] }[], g: THREE.BufferGeometry): DelMuro {
  const clave = (u: number, v: number): string => `${String(Math.round((((u % ANCHO_DEL_MURO) + ANCHO_DEL_MURO) % ANCHO_DEL_MURO) * 1e3) % Math.round(ANCHO_DEL_MURO * 1e3))},${String(Math.round(v * 1e3))}`
  const bordes = new Map<string, number>()
  let area = 0
  for (const c of celdas) {
    const p = c.poligono
    const n = p.length / 2
    for (let k = 0; k < n; k += 1) {
      const [u0, v0, u1, v1] = [p[k * 2], p[k * 2 + 1], p[((k + 1) % n) * 2], p[((k + 1) % n) * 2 + 1]]
      area += (u0 * v1 - u1 * v0) / 2
      if ((v0 < 1e-6 && v1 < 1e-6) || (v0 > ALTO_DEL_MURO - 1e-6 && v1 > ALTO_DEL_MURO - 1e-6)) continue
      const [a, b] = [clave(u0, v0), clave(u1, v1)].sort()
      bordes.set(`${a}|${b}`, (bordes.get(`${a}|${b}`) ?? 0) + 1)
    }
  }
  const pos = g.getAttribute('position')
  const [A, B, C] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  let deEspaldas = 0
  for (let t = 0; t < pos.count; t += 3) {
    A.fromBufferAttribute(pos, t)
    B.fromBufferAttribute(pos, t + 1)
    C.fromBufferAttribute(pos, t + 2)
    const normal = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A))
    if (normal.x * A.x + normal.z * A.z >= 0) deEspaldas += 1
  }
  return { celdas: celdas.length, sueltos: [...bordes.values()].filter((x) => x !== 2).length, area: Math.abs(area), deEspaldas, triangulos: pos.count / 3 }
}
const DEL_MURO = medirElMuro(CELDAS, MURO)
const muroBien = (m: DelMuro): boolean => m.celdas === CRISTAL.muro.columnas * CRISTAL.muro.filas && m.sueltos === 0 && Math.abs(m.area / (ANCHO_DEL_MURO * ALTO_DEL_MURO) - 1) < 1e-3 && m.deEspaldas === 0 && m.triangulos > m.celdas * 3
afirmar(muroBien(DEL_MURO), `  un muro: ${String(DEL_MURO.celdas)} celdas de Voronoi que comparten todos sus bordes (ninguno suelto), cubren el cilindro entero (${String(CRISTAL.muro.radio)} u, ${String(CRISTAL.muro.alto)} de alto: el área, la suma) y miran hacia adentro (${String(DEL_MURO.triangulos)} triángulos, ninguno de espaldas)`)
controlPositivo('  el detector VE un muro con un hueco (una celda menos)', medirElMuro(CELDAS.slice(1), MURO), muroBien)
const DADO_VUELTA = MURO.clone()
const P0 = DADO_VUELTA.getAttribute('position')
for (let k = 0; k < 3; k += 1) [P0.array[3 + k], P0.array[6 + k]] = [P0.array[6 + k], P0.array[3 + k]]
controlPositivo('  y uno con un triángulo de espaldas', medirElMuro(CELDAS, DADO_VUELTA), muroBien)
DADO_VUELTA.dispose()

// Nunca tapa una partícula ni dobla un texto o el logo: va ANTES que todo lo transparente que no es fondo (las partículas en 0, la energía
// desde −10, el espejo en −14), no escribe profundidad (sí la lee: lo de adelante la tapa), sólo las caras de adelante; el sombreador
// refracta SÓLO el fondo (`uFondo`: ni la copia del cuadro ni la profundidad del pase, lo de PULIDO 19), se desvanece donde la refracción
// mira fuera del fondo; [PULIDO 23] U1 · SIN máscaras (ni cajas, ni logo, ni la elipse, ni la cercanía: lo tapa la profundidad), con la
// línea de quiebre por píxel y quieto (sin el reloj en el vértice); el fondo es una capa propia con lo de atrás nada más; y la cámara es la de ESTE cuadro (su matriz, al día antes de leerla: con la del cuadro anterior el cristal de PULIDO 19 vibraba).
const DEPTH = leer('_lib/escena/DepthParticles.tsx')
const BOKEH = leer('_lib/escena/BokehParticles.tsx')
const CRISTAL_TSX = ESCENA('cristal/CristalDeLaEscena.tsx')
const FONDO_TS = ESCENA('cristal/fondo.ts')
const MALLA = armarElVidrio(new THREE.BufferGeometry(), uniformesDelVidrio(), CELDAS.length)
interface DelVidrio {
  readonly orden: number
  readonly particulasSinOrden: boolean
  readonly material: THREE.Material
  readonly fragmentos: string
  readonly vertices: string
  readonly componente: string
  readonly fondo: readonly string[]
  readonly pase: string
}
const DEL_VIDRIO: DelVidrio = { orden: MALLA.renderOrder, particulasSinOrden: !/renderOrder/.test(DEPTH) && !/renderOrder/.test(BOKEH), material: MALLA.material as THREE.Material, fragmentos: FRAGMENTOS_DEL_VIDRIO, vertices: VERTICES_DEL_VIDRIO(CELDAS.length), componente: CRISTAL_TSX, fondo: NOMBRES_DEL_FONDO, pase: FONDO_TS }
const vidrioBien = (v: DelVidrio): boolean => v.orden < ORDEN_DEL_ESPEJO && v.orden < ORDEN_DE_LA_ENERGIA && v.orden < 0 && v.particulasSinOrden &&
  v.material.transparent && !v.material.depthWrite && v.material.depthTest && v.material.side === THREE.FrontSide &&
  v.fragmentos.includes('texture2D( uFondo,') && !v.fragmentos.includes('uColorDeLaEscena') && !v.fragmentos.includes('distanciaALoOpaco') && // [PULIDO 24] V1 · el sentido cambió por pedido: nunca se desvanece (los costados se veían vacíos): el fondo con margen y la lectura acotada;
  // y sin la línea de quiebre (el filo, sólo con ?vitral-filo=si): el vitral es la refracción de cada celda con su hondura.
  v.fragmentos.includes('enElCuadro( enElFondo(') && !v.fragmentos.includes('adentroDelFondo') && !v.fragmentos.includes('quiebre') && v.fragmentos.includes('uVidrio.y * vHondura') && v.pase.includes('CRISTAL.fondo.sobra') &&
  !/uCajas|uLogo|uZona|uCerca|adentroDeLasCajas/.test(v.fragmentos) && v.fragmentos.includes('fwidth( vInterior )') &&
  !v.vertices.includes('uTiempo') && !/random|Math\.random/.test(v.vertices) &&
  /cam\.updateMatrixWorld\(\)[\s\S]*dibujarElFondo\([\s\S]*uVista\.value\.copy\(fondo\.vista\)/.test(v.componente) && !/cajasDelTexto|rectanguloDelLogo|uCajas/.test(v.componente) &&
  !v.fondo.some((n) => /polvo|bokeh|logo|t[ií]tulo|pie|energ|plasma/i.test(n)) && v.pase.includes('camara.layers.set(CAPA_DEL_FONDO)') && v.pase.includes('o instanceof THREE.Light') && Number(CAPA_DEL_FONDO) !== Number(PASE.capa)
afirmar(vidrioBien(DEL_VIDRIO), `  nunca tapa una partícula (orden ${String(DEL_VIDRIO.orden)}: antes que el espejo, la energía y las partículas; sin escribir profundidad), refracta sólo el fondo (${NOMBRES_DEL_FONDO.join(', ')}), se desvanece donde mira afuera, sin máscaras (lo tapa sólo lo que está delante), con la línea de quiebre, la cámara de este cuadro y quieto`)
controlPositivo('  el detector VE el cristal después de las partículas', { ...DEL_VIDRIO, orden: 1 }, vidrioBien)
controlPositivo('  y uno que escribe profundidad', { ...DEL_VIDRIO, material: new THREE.MeshBasicMaterial({ transparent: true, depthWrite: true }) }, vidrioBien)
controlPositivo('  y uno que lee la copia del cuadro (PULIDO 19: doblaba los textos)', { ...DEL_VIDRIO, fragmentos: `${FRAGMENTOS_DEL_VIDRIO}\nuniform sampler2D uColorDeLaEscena;` }, vidrioBien)
controlPositivo('  y la cámara del cuadro anterior (PULIDO 19: vibraba)', { ...DEL_VIDRIO, componente: CRISTAL_TSX.replace('cam.updateMatrixWorld()', '') }, vidrioBien)
controlPositivo('  y un fondo con el logo adentro', { ...DEL_VIDRIO, fondo: [...NOMBRES_DEL_FONDO, 'logo'] }, vidrioBien)
controlPositivo('  y uno con la máscara del logo de vuelta', { ...DEL_VIDRIO, fragmentos: `${FRAGMENTOS_DEL_VIDRIO}\nuniform vec4 uLogo;` }, vidrioBien)
controlPositivo('  y uno que se desvanece en los costados (PULIDO 23)', { ...DEL_VIDRIO, fragmentos: `${FRAGMENTOS_DEL_VIDRIO}
float adentroDelFondo( vec2 m ) { return 1.0; }` }, vidrioBien)
controlPositivo('  y un fondo sin margen', { ...DEL_VIDRIO, pase: FONDO_TS.replace('CRISTAL.fondo.sobra', '1') }, vidrioBien)
controlPositivo('  y la línea de quiebre de vuelta', { ...DEL_VIDRIO, fragmentos: `${FRAGMENTOS_DEL_VIDRIO}
float quiebre = 0.0;` }, vidrioBien)
MALLA.geometry.dispose()
MURO.dispose()
;(MALLA.material as THREE.Material).dispose()

// Las variantes del fondo: `fondo=moire` (sin el cristal), `fondo=espejo` (sin la trama), `fondo=ambos` y nada (los dos); `cristal=no`
// apaga el cristal; también sueltas en la URL (sin el banco): la trama se esconde con `sin-moire`.
const MOIRE_SCREEN = ESCENA('MoireScreen.tsx')
type Pedido = typeof entornoPedido
const variantesBien = (f: Pedido, url: typeof pedidoDeLaUrl, moire: string): boolean => {
  const p = (q: string): { readonly c: string; readonly m: string } => ({ c: f(q).pruebas['sin-cristal'], m: f(q).pruebas['sin-moire'] })
  const [nada, moireSolo, espejoSolo, ambos, sinCristal] = [p('producto'), p('producto,fondo=moire'), p('producto,fondo=cristal'), p('producto,fondo=ambos'), p('producto,cristal=no')]
  return nada.c === 'no' && nada.m === 'no' && moireSolo.c === 'si' && moireSolo.m === 'no' && espejoSolo.c === 'no' && espejoSolo.m === 'si' && ambos.c === 'no' && ambos.m === 'no' && sinCristal.c === 'si' &&
    url('?fondo=cristal') === 'producto,fondo=cristal' && entornoPedido('producto,fondo=espejo').pruebas['sin-moire'] === 'si' && url('?cristal=no') === 'producto,cristal=no' && PEDIDOS_DEL_FONDO.length === 2 &&
    moire.includes("const conTrama = entornoDeLaEscena().pruebas['sin-moire'] !== 'si'") && (moire.match(/visible=\{conTrama\}/g) ?? []).length === 2
}
afirmar(variantesBien(entornoPedido, pedidoDeLaUrl, MOIRE_SCREEN), '  las variantes: fondo=moire (el moiré solo), fondo=cristal ([PULIDO 21] S4; espejo, su nombre de antes: el cristal solo: la trama y el zócalo no se dibujan), fondo=ambos y nada (los dos); cristal=no; también sueltas en la URL')
controlPositivo('  el detector VE una URL que no deja pasar el fondo (PULIDO 19: `?cristal=no` sólo andaba con el banco)', ((b: string) => {
  const v = new URLSearchParams(b).get('pruebas')
  return v === null ? null : `producto,${v}`
}) as typeof pedidoDeLaUrl, (u: typeof pedidoDeLaUrl) => variantesBien(entornoPedido, u, MOIRE_SCREEN))

// Lo medido en el sitio (el build de medición, sin vsync, la NVIDIA; `entregas/pulido-20/sitio-medido.json`): con el cristal ningún cuadro
// de más de 20 ms a 1440 y 390, en calma y en el recorrido; lo que cuesta (con menos sin, en calma) acotado; en calma la cámara quieta.
interface Tanda { readonly media: number; readonly maximo: number; readonly mayoresDe20: number; readonly camaraSalto: number }
type Medido = Readonly<Record<string, Readonly<Record<string, Tanda | string>>>>
const MEDIDO = (JSON.parse(readFileSync('docs/rediseno/entregas/pulido-20/sitio-medido.json', 'utf8')) as { readonly medido: Medido }).medido
const tanda = (m: Medido, w: string, k: string): Tanda | null => {
  const t = m[w]?.[k]
  return typeof t === 'object' && t !== null ? t : null
}
const costo = (m: Medido, w: string): number => ((tanda(m, w, 'calma-con-1')?.media ?? 99) + (tanda(m, w, 'calma-con-2')?.media ?? 99)) / 2 - ((tanda(m, w, 'calma-sin-1')?.media ?? 0) + (tanda(m, w, 'calma-sin-2')?.media ?? 0)) / 2
const COSTO_MAXIMO_MS = 0.5
const medidoBien = (m: Medido): boolean => ['1440', '390'].every((w) => ['calma-con-1', 'calma-con-2', 'recorrido-con-1', 'recorrido-con-2'].every((k) => {
  const t = tanda(m, w, k)
  return t !== null && t.mayoresDe20 === 0
}) && costo(m, w) <= COSTO_MAXIMO_MS && (tanda(m, w, 'calma-con-1')?.camaraSalto ?? 1) === 0)
afirmar(medidoBien(MEDIDO), `  en el sitio, con el cristal ningún cuadro de más de 20 ms a 1440 y 390 (calma y recorrido); cuesta ${costo(MEDIDO, '1440').toFixed(2)} ms por cuadro a 1440 y ${costo(MEDIDO, '390').toFixed(2)} a 390 (≤ ${String(COSTO_MAXIMO_MS)}); en calma la cámara no se mueve entre cuadros`)
controlPositivo('  el detector VE un cuadro de 25 ms en el recorrido', { ...MEDIDO, '1440': { ...MEDIDO['1440'], 'recorrido-con-1': { ...(tanda(MEDIDO, '1440', 'recorrido-con-1') as Tanda), mayoresDe20: 1, maximo: 25 } } }, medidoBien)

const MODULOS = ['cristal/cristal.ts', 'cristal/muro.ts', 'cristal/vidrio.ts', 'cristal/fondo.ts', 'cristal/CristalDeLaEscena.tsx'].map((m) => [m, ESCENA(m)] as const)
// [PULIDO 27] C3 · la amplitud ya no mira dónde está la página (siempre a la vista): la que queda, la del final, sin reservas.
afirmar(MODULOS.every(([, t]) => lineasDeCodigo(t) <= 300) && sinReservasEn(ESCENA('cristal/cristal.ts'), 'amplitudDelCristal'), '  los módulos del cristal, de menos de 300 líneas; la amplitud (con el final), sin reservas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('R3 · La red en reposo: rayos congelados (el arco del plasma, quebrado y con su rama), en un búfer estático; el corte abre desde el medio')

// Lo que cambia por cuadro viaja en la textura de los enlaces (los extremos con el alfa, el otro extremo con la semilla, el corte): la
// geometría (los tramos de cada enlace: el camino y la rama) se arma una vez y no se toca.
interface DeLaRed {
  readonly vertices: number
  readonly indices: number
  readonly tocados: number
  readonly filas: boolean
  readonly rango: number
}
function rellenarUnaRed(rellenar: typeof rellenarRed): DeLaRed {
  const azar = azarConSemilla(11)
  const b = crearBrasas(40, azar, FLOOR_Y)
  const r = crearRed(40)
  const dib = armarLaRed(r.maximo, {})
  const versiones = (): number => ['position', 'aDato'].map((n) => (dib.geometria.getAttribute(n) as THREE.BufferAttribute).version).reduce((x, y) => x + y, 0) + (dib.geometria.index?.version ?? 0)
  const antes = versiones()
  r.n = 3
  r.a.set([0, 2, 4])
  r.b.set([1, 3, 5])
  r.alfa.set([1, 0.5, 2])
  r.semilla.set([0.25, 0.5, 0.75])
  r.muere.set([0.1, 0.25, 0.5])
  r.fase = 'cortando'
  r.faseS = 0.2
  b.vida.fill(1)
  rellenar(r, b, dib)
  const W = r.maximo * 4
  const D = dib.datos
  const L = b.lugar
  const filas = [0, 1, 2].every((k) => D[k * 4] === Math.fround(L[r.a[k] * 3]) && D[W + k * 4 + 2] === Math.fround(L[r.b[k] * 3 + 2]) && D[k * 4 + 3] === Math.fround(r.alfa[k]) && D[W + k * 4 + 3] === Math.fround(r.semilla[k])) &&
    D[2 * W] === 1 && D[2 * W + 4] === 0 && D[2 * W + 8] === 0 && dib.enlaces.version > 0
  const resultado = { vertices: dib.geometria.getAttribute('position').count, indices: dib.geometria.index?.count ?? 0, tocados: versiones() - antes, filas, rango: dib.geometria.drawRange.count }
  dib.geometria.dispose()
  dib.enlaces.dispose()
  ;(dib.malla.material as THREE.Material).dispose()
  return resultado
}
const TRAMOS_DE_LA_RED = DIBUJO_DE_LA_RED.tramos + DIBUJO_DE_LA_RED.tramosDeRama
const MAXIMO_DE_LA_RED = crearRed(40).maximo
const LA_RED = rellenarUnaRed(rellenarRed)
const redBien = (m: DeLaRed): boolean => m.vertices === MAXIMO_DE_LA_RED * TRAMOS_DE_LA_RED * 4 && m.indices === MAXIMO_DE_LA_RED * TRAMOS_DE_LA_RED * 6 && m.tocados === 0 && m.filas && m.rango === 3 * TRAMOS_DE_LA_RED * 6
afirmar(redBien(LA_RED), `  un búfer estático (por enlace ${String(DIBUJO_DE_LA_RED.tramos)} tramos de camino y ${String(DIBUJO_DE_LA_RED.tramosDeRama)} de rama); por cuadro sólo la textura de los enlaces (los extremos, el alfa por la vida, la semilla, el corte desde que muere: ${String(REPOSO.destelloS)} s); ningún vértice tocado`)
controlPositivo('  el detector VE un relleno que reescribe los vértices (como la red de líneas de PULIDO 19)', rellenarUnaRed(((r, b, dib) => {
  rellenarRed(r, b, dib)
  dib.geometria.getAttribute('position').needsUpdate = true
}) as typeof rellenarRed), redBien)

// El arco: el canal quebrado con los parámetros del camino del plasma (el desvío, la aspereza por nivel, la profundidad; cuatro niveles),
// con su rama (su largo y su ángulo, los del plasma); su forma sale de la semilla del enlace y NO del reloj (congelado: sólo titila); el
// ancho en px del dispositivo, afinado en las puntas; el corte lo abre desde el medio, con el destello.
const cuerpoDe = (v: string, nombre: string): string => {
  const i = v.indexOf(nombre)
  const j = v.indexOf('\n}\n', i)
  return i < 0 || j < 0 ? '' : v.slice(i, j)
}
const uniformesDeLaRed = (armarLaRed(4, {}).malla.material as THREE.ShaderMaterial).uniforms
const arcoBien = (v: string, f: string, u: Record<string, THREE.IUniform>): boolean => {
  const camino = u.uCamino?.value as THREE.Vector4 | undefined
  const rama = u.uRama?.value as THREE.Vector4 | undefined
  const forma = cuerpoDe(v, 'vec2 desvioDe(') + cuerpoDe(v, 'vec3 puntoDe(')
  return forma.length > 0 && !forma.includes('uTiempo') && forma.includes('for ( int n = 0; n < 4; n ++ )') && forma.includes('amplitud *= uCamino.y;') && forma.includes('float lr = largo * mix( uRama.x, uRama.y,') &&
    camino !== undefined && camino.x === CAMINO.desvio && camino.y === CAMINO.aspereza && camino.z === CAMINO.profundidad && rama !== undefined && rama.x === CAMINO.ramas.largo[0] && rama.w === CAMINO.ramas.angulo[1] &&
    // [PULIDO 21] S1 · el mismo dibujo que los arcos (su canal y sus fragmentos), con el titileo, el destello y el corte en el vértice.
    v.includes('vec3 pA = puntoQueTiembla( a.xyz, b.xyz, b.w, rama, aDato.y );') && v.includes('canalDelArco( r.punto, r.antes, r.despues, r.forma, r.extra );') && f.endsWith(FRAGMENTOS_DE_LOS_ARCOS) &&
    v.includes('abs( vT - 0.5 ) * 2.0') && v.includes('float destello = max( a.w - 1.0, 0.0 );') &&
    // [CIERRE A] A4 · el titileo, con su ritmo (más lento: era 4 más 5 por la semilla).
    v.includes(`uTiempo * ( ${String(DIBUJO_DE_LA_RED.ritmos.titileo[0])} + b.w * ${DIBUJO_DE_LA_RED.ritmos.titileo[1].toFixed(1)} )`)
}
afirmar(arcoBien(VERTICES_DE_LA_RED, FRAGMENTOS_DE_LA_RED, uniformesDeLaRed), '  cada enlace, un arco del plasma: quebrado en cuatro niveles con su aspereza y su profundidad, con su rama; la forma, de la semilla y sin el reloj (congelada; sólo titila); afinado en las puntas; el corte lo abre desde el medio, con el destello')
controlPositivo('  el detector VE un arco que se mueve con el reloj (no congelado)', VERTICES_DE_LA_RED.replace('float x = t * exp2( float( n ) + 1.0 );', 'float x = t * exp2( float( n ) + 1.0 ) + uTiempo;'), (v: string) => arcoBien(v, FRAGMENTOS_DE_LA_RED, uniformesDeLaRed))
controlPositivo('  y una línea recta (sin el desvío)', VERTICES_DE_LA_RED.replace('vec3 p = A + eje * t + p1 * d.x + p2 * d.y * uCamino.z;', 'vec3 p = A + eje * t;').replace('amplitud *= uCamino.y;', ''), (v: string) => arcoBien(v, FRAGMENTOS_DE_LA_RED, uniformesDeLaRed))
// Lo medido en el sitio (la sección `red` del recibo): con la red armada ningún cuadro de más de 20 ms, de día y de noche a 1440 y a 390.
interface Cuadros { readonly mayoresDe20: number; readonly media: number }
const RED_MEDIDA = (JSON.parse(readFileSync('docs/rediseno/entregas/pulido-20/sitio-medido.json', 'utf8')) as { readonly red: { readonly medido: Readonly<Record<string, Readonly<Record<string, Cuadros>>>> } }).red.medido
const redMedidaBien = (m: typeof RED_MEDIDA): boolean => ['1440', '1440-noche', '390'].every((w) => ['con-1', 'con-2'].every((k) => m[w]?.[k]?.mayoresDe20 === 0))
afirmar(redMedidaBien(RED_MEDIDA), `  en el sitio, con la red de rayos armada ningún cuadro de más de 20 ms (1440 de día ${String(RED_MEDIDA['1440']?.['con-1']?.media)} ms, de noche ${String(RED_MEDIDA['1440-noche']?.['con-1']?.media)}, 390 ${String(RED_MEDIDA['390']?.['con-1']?.media)})`)
controlPositivo('  el detector VE un cuadro largo con la red', { ...RED_MEDIDA, '390': { ...RED_MEDIDA['390'], 'con-2': { mayoresDe20: 1, media: 2 } } }, redMedidaBien)
const RED_TS = ESCENA('energia/dibujo/red.ts')
afirmar(lineasDeCodigo(RED_TS) <= 300 && sinReservasEn(RED_TS, 'rellenarRed') && REPOSO.corteS === 0.3, `  el módulo de menos de 300 líneas; el relleno de cada cuadro sin reservas; el corte en cascada en ${String(REPOSO.corteS)} s, como antes`)

cerrar('s71-pulido-20')
