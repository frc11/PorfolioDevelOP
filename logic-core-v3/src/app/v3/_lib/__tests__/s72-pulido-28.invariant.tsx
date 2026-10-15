/**
 * PULIDO 28 — LOS DETALLES FINALES DEL PIE, LA RED Y EL CRISTAL. Cada cosa con su control positivo (el detector ve el estado de antes o
 * uno roto a propósito).
 *   AA7 · la salida del pie, determinística: una máquina de estados (presente → saliendo → ida); con la rueda lenta, la rápida, el trackpad
 *         y el teclado, desde el final entero y desde el rebobinado, la página no sube hasta que el pie se fue entero, la salida corre en
 *         su tiempo y después el scroll se suelta.
 *   AA3 · al tocar el navbar desde el pie, el giro del quieto y la órbita del mouse vuelven a lo largo del viaje entero (antes, con el
 *         rebobinado comprimido hasta el golpe: media vuelta en un tercio de segundo con la cámara arriba, toda la escena giraba).
 *   AC1 · un viaje que se aleja del pie con el final rebobinando: sin ninguna pieza a la vista la pared era infinita y la caída salía NaN
 *         (el centro del pie, el blanco y la cámara del final; las cargas lo guardaban para siempre y el cristal quedaba negro). Ahora, la
 *         última pared con una pieza a la vista; y la energía no toma un cuadro con la cámara sin número. EL AVISO «1 Issue» de Next era
 *         el mismo NaN: el orden de los bloques del piso pedía el sector NaN y tiraba un TypeError en cada cuadro.
 *   AA1 · la letra del form no titila con la cámara: los rótulos y el de la tecla, impresos en la cara (una textura con mipmaps, en una
 *         escala potencia de dos), no en relieve; el DOM que sigue a la pieza, con la fase fija (la forma se sostiene, la traslación va
 *         de a píxel entero).
 *   AA4 · los huecos, ajustados al bloque: el piso alrededor normal (sin el techo de los bloques alrededor de cada hueco, el núcleo y la
 *         bajada sólo para los bloques enteros adentro), el hueco la silueta exacta (sin margen ni labio, con el radio de la placa 3D) y la
 *         pared del pozo cortada en el tope de cada bloque del borde: la cara del corte.
 *   AA5 · el piso se abre sólo en el encastre: debajo de la pieza (la franja de su silueta que su proyección ya tapa) y tan hondo como
 *         volcó (nada al empezar a inclinarse, entero al incrustarse); el fondo baja con ella.
 *   AA6 · el © no se tapa mientras cae: en toda la zona del pie (todas sus piezas, hayan volcado o no) los bloques quedan en reposo
 *         durante la caída y la energía vuelve recién cuando todo se asentó, con la quietud de siempre.
 *   AA2 · gracias y error: el derretido se descartó; la placa del form baja por su hueco sobre su plataforma (el fondo del pozo la
 *         acompaña), el piso se cierra sobre ella, se cambian a cubierto, se abre y sube la otra.
 */
import { empiezaUnGesto, type GestoDeScroll } from '../gestosDelScroll'
import { SALIDAS_DEL_PIE, SALIDA_EN_VIVO, pasoDeLaSalida, pedirLaSalida, type FaseDeLaSalida } from '../pie3d/salidas'
import { RELOJ_DEL_FINAL, decidirElGesto, pasoDelReloj, relojQuieto, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { avanceDelPie, salidaDelPie } from '../escena/pie3d/coreografia'
import { FIN_DEL_GOLPE, quedaDelQuieto } from '../escena/final/recorridoDelFinal'
import { quedaEnElViaje } from '../escena/final/quietoEnElViaje'
import { EN_VIVO, blancoDelFinal } from '../escena/final/recorridoDelFinal'
import type { Armada } from '../escena/pie3d/armadas'
import { armarLaCaida, crearLaCaidaDelPie } from '../escena/pie3d/caida'
import { armarLosOrdenes, ponerElOrden, sectorDe } from '../escena/piso/ordenDeLosBloques'
import { DOM_QUE_SIGUE, fijarLaFase } from '../escena/pie3d/domQueSigue'
import { IMPRESAS } from '../escena/pie3d/impresas'
import { aplicar, homografia } from '../pie3d/homografia'
import { HUECOS_DEL_PIE, HUECO_DEL_PIE, QUIETUD, QUIETUD_DEL_PIE } from '../escena/pie3d/huecos'
import { huecosDeLaCaida } from '../escena/pie3d/huecosDeLaCaida'
import { HUNDIMIENTO_DEL_PIE, PLATAFORMA_EN_VIVO, hundimientoDelPiso } from '../escena/pie3d/transformacionDelPie'
import { existsSync } from 'node:fs'
import { poseDeLaPiezaQueCae } from '../escena/final/caidaDelPie'
import { RELOJ_DEL_FINAL as RELOJ } from '../escena/final/recorridoDelFinal'
import { POZO_DEL_PIE } from '../escena/pie3d/pozos'
import { PISO_VIVO } from '../escena/piso/bloques'
import { LUZ_DE_ABAJO } from '../escena/final/luzDeAbajo'
import { VOLUMEN_DEL_PIE } from '../escena/pie3d/geometria'
import { readFileSync } from 'node:fs'
import * as THREE from 'three'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const DT = 1 / 60
/** La fase de la salida (leída por una función: la escriben las de `salidas.ts`). */
const fase = (): FaseDeLaSalida => SALIDA_EN_VIVO.fase

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA7 · La salida del pie: con los cuatro gestos y desde los dos estados, la página no sube hasta que el pie se fue; la salida en su tiempo; después se suelta')

/** Un evento de un gesto hacia arriba: cuándo (s), de dónde, cuánto movería (px) y si es un apoyo (una tecla apretada). */
interface Evento { readonly t: number; readonly origen: GestoDeScroll['origen']; readonly magnitud: number; readonly apoyo: boolean }
/** Los cuatro gestos (como los del banco, `p28-aa7.ts`), cada uno tres veces con una pausa en el medio. */
function gesto(caso: string, desde: number): Evento[] {
  const e: Evento[] = []
  if (caso === 'lenta') for (let k = 0; k < 8; k += 1) e.push({ t: desde + k * 0.35, origen: 'rueda', magnitud: 100, apoyo: false })
  else if (caso === 'rapida') for (let k = 0; k < 30; k += 1) e.push({ t: desde + k * 0.016, origen: 'rueda', magnitud: 240, apoyo: false })
  else if (caso === 'trackpad') for (let k = 0; k < 100; k += 1) e.push({ t: desde + k * 0.016, origen: 'rueda', magnitud: Math.max(2, 70 * Math.exp(-k / 30)), apoyo: false })
  else for (let k = 0; k < 6; k += 1) e.push({ t: desde + k * 0.3, origen: 'tecla', magnitud: 0, apoyo: true })
  return e
}
const CASOS = ['lenta', 'rapida', 'trackpad', 'teclado'] as const
type Decide = typeof decidirElGesto

/** Lo que pasó en una corrida: si la página subió con el pie todavía a la vista, si se fue, cuánto duró la salida y si después se soltó. */
interface Corrida { readonly subioAntes: boolean; readonly seFue: boolean; readonly salidaS: number; readonly soltoDespues: boolean }

/** Una corrida en Node: el reloj del final, la decisión de cada evento, la salida y lo mostrado del pie, cuadro a cuadro (a 60 por segundo). */
function correr(caso: string, desde: 'entero' | 'parado', decide: Decide): Corrida {
  const FONDO = 10000
  const r: RelojDelFinal = desde === 'entero' ? { ...relojQuieto(), fase: 'corre', fin: 1 } : { ...relojQuieto(), fase: 'parada', fin: 0 }
  SALIDA_EN_VIVO.fase = 'presente'
  SALIDA_EN_VIVO.aLaVista = true
  const eventos = [...gesto(caso, 0.1), ...gesto(caso, 3.2), ...gesto(caso, 6.3)]
  let scroll = FONDO
  let mostrado = 1
  let rebobinar = false
  let ultimo: { origen: string; sentido: number; t: number } | null = null
  const G = { desde: 0, pico: 0, retenido: false, gesto: 0 }
  let subioAntes = false
  let empezo = -1
  let termino = -1
  let soltoDespues = false
  let k = 0
  for (let t = 0; t < 9; t += DT) {
    const antes = fase()
    for (; k < eventos.length && eventos[k].t <= t; k += 1) {
      const ev = eventos[k]
      const nuevo = empiezaUnGesto(ultimo, ev.origen, -1, ev.t * 1000, ev.apoyo)
      ultimo = { origen: ev.origen, sentido: -1, t: ev.t * 1000 }
      G.gesto = ev.t
      if (nuevo) {
        G.desde = ev.t
        G.pico = 0
      }
      const enLaCola = ev.magnitud > 0 && ev.magnitud <= RELOJ_DEL_FINAL.colaDelGesto * G.pico
      G.pico = Math.max(G.pico, ev.magnitud)
      const d = decide(r, scroll >= FONDO - 2, -1, nuevo, G.retenido, ev.t - G.desde, enLaCola, { aLaVista: SALIDA_EN_VIVO.aLaVista, fase: fase() })
      G.retenido = d.retiene
      if (d.rebobina) rebobinar = true
      if (d.sale === true) pedirLaSalida()
      if (!d.retiene) {
        if (mostrado > 1e-3) subioAntes = true
        else soltoDespues = true
        scroll -= ev.origen === 'tecla' ? 40 : ev.magnitud
      }
    }
    pasoDelReloj(r, { alFondo: scroll >= FONDO - 2, pieEntero: mostrado >= 0.999, rebobinar, haciaAbajo: false, sinGestoS: t - G.gesto, viajeS: 0 }, DT)
    rebobinar = false
    const pedido = Math.min(1, Math.max(0, (scroll - (FONDO - 900)) / 900))
    mostrado = fase() === 'saliendo' ? salidaDelPie(mostrado, DT, SALIDAS_DEL_PIE.salidaS) : avanceDelPie(mostrado, fase() === 'presente' ? pedido : 0, false, DT, fase() !== 'presente')
    pasoDeLaSalida(mostrado, pedido, scroll)
    if (antes !== 'saliendo' && fase() !== 'presente' && empezo < 0) empezo = t
    if (fase() === 'ida' && termino < 0) termino = t
  }
  SALIDA_EN_VIVO.fase = 'presente'
  SALIDA_EN_VIVO.aLaVista = false
  return { subioAntes, seFue: termino > 0, salidaS: empezo >= 0 && termino > 0 ? termino - empezo : Number.NaN, soltoDespues }
}

const corridas = (decide: Decide): Record<string, Corrida> =>
  Object.fromEntries((['entero', 'parado'] as const).flatMap((desde) => CASOS.map((caso) => [`${desde} ${caso}`, correr(caso, desde, decide)])))
const salidaBien = (c: Record<string, Corrida>): boolean =>
  Object.values(c).every((x) => !x.subioAntes && x.seFue && Math.abs(x.salidaS - SALIDAS_DEL_PIE.salidaS) <= 2 * DT && x.soltoDespues)
const LAS_CORRIDAS = corridas(decidirElGesto)
afirmar(salidaBien(LAS_CORRIDAS), `  rueda lenta, rueda rápida, trackpad y teclado, desde el final entero y desde el rebobinado: la página no sube con el pie a la vista, el pie se va entero en ${String(SALIDAS_DEL_PIE.salidaS)} s y después el scroll se suelta`, Object.entries(LAS_CORRIDAS).map(([k, x]) => `${k}: ${x.subioAntes ? 'subió antes' : 'quieta'}, ${Number.isNaN(x.salidaS) ? 'sin salida' : `${x.salidaS.toFixed(2)} s`}${x.soltoDespues ? ', suelta' : ''}`).join(' · '))

/** El control: la decisión de PULIDO 27 (sólo el gesto que EMPIEZA con el final parado pide la salida; lo retenido se suelta a su tope). */
const DE_PULIDO_27: Decide = (r, alFondo, sentido, nuevo, retenido, duraS, enLaCola, pie) => {
  if (!alFondo || sentido > 0) return { retiene: false, rebobina: false }
  if (pie?.fase === 'saliendo') return { retiene: true, rebobina: false }
  if (pie?.fase === 'ida') return { retiene: false, rebobina: false }
  if (nuevo) return r.fase === 'corre' && r.fin > 0 ? { retiene: true, rebobina: true } : r.fase === 'parada' && pie?.aLaVista === true ? { retiene: true, rebobina: false, sale: true } : { retiene: false, rebobina: false }
  return { retiene: retenido && (duraS < RELOJ_DEL_FINAL.topeDelGestoS || enLaCola), rebobina: false }
}
controlPositivo('  el detector VE la salida de PULIDO 27 (desde el final entero la página subía a mitad del rebobinado, sin salida)', corridas(DE_PULIDO_27), salidaBien)
controlPositivo('  y una salida del mismo largo que un viaje (medio segundo)', Object.fromEntries(Object.entries(LAS_CORRIDAS).map(([k, x]) => [k, { ...x, salidaS: 0.5 }])), salidaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA3 · Desde el pie al navbar: el giro del quieto vuelve a lo largo del viaje, sin girar la escena de golpe')

/**
 * El giro de un quieto de media vuelta en un viaje del menú de 1,6 s, cuadro a cuadro: lo más que gira en un cuadro y cuánto queda al
 * llegar. `queda`: cuánto queda a los `t` s (con el `fin` del rebobinado comprimido del viaje).
 */
const VIAJE_S = 1.6
const MEDIA_VUELTA = 180
function giroEnElViaje(queda: (t: number, fin: number) => number): { readonly maximoPorCuadro: number; readonly alLlegar: number } {
  const r: RelojDelFinal = { ...relojQuieto(), fase: 'corre', fin: 1 }
  let antes = MEDIA_VUELTA
  let maximo = 0
  for (let t = DT; t <= VIAJE_S + 1e-9; t += DT) {
    pasoDelReloj(r, { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, viajeS: VIAJE_S, enElViajeS: t }, DT)
    const giro = MEDIA_VUELTA * queda(t, r.fin)
    maximo = Math.max(maximo, Math.abs(giro - antes))
    antes = giro
  }
  return { maximoPorCuadro: maximo, alLlegar: antes }
}
const AHORA = giroEnElViaje((t) => quedaEnElViaje(t, VIAJE_S))
const CUADRO_DEL_FINAL = readFileSync('src/app/v3/_lib/escena/final/cuadroDelFinal.ts', 'utf8')
const giroBien = (g: { readonly maximoPorCuadro: number; readonly alLlegar: number }, c: string): boolean =>
  g.maximoPorCuadro <= 4 && Math.abs(g.alLlegar) < 1e-6 && c.includes('quietoRebobinado(alRebobinar, quedaDelQuietoAhora(s.reloj.fase, fin, s.reloj.rebobinado.desde), EN_VIVO)') && c.includes('const orbita = orbitaDelFinalAhora(s.reloj.fase, fin)')
afirmar(giroBien(AHORA, CUADRO_DEL_FINAL), `  media vuelta de quieto en un viaje de ${String(VIAJE_S)} s: a lo sumo ${AHORA.maximoPorCuadro.toFixed(2)}° por cuadro y en cero al llegar (la órbita del mouse, igual)`)
const ANTES = giroEnElViaje((_t, fin) => quedaDelQuieto(fin, 1))
controlPositivo(`  el detector VE el de antes (hasta el golpe, ${String(FIN_DEL_GOLPE.toFixed(2))} del fin: ${ANTES.maximoPorCuadro.toFixed(1)}° en un cuadro)`, ANTES, (g: typeof ANTES) => giroBien(g, CUADRO_DEL_FINAL))
controlPositivo('  y un cuadro que no lo cablea', CUADRO_DEL_FINAL.replace('const orbita = orbitaDelFinalAhora(s.reloj.fase, fin)', 'const orbita = orbitaDelFinal(fin)'), (c: string) => giroBien(AHORA, c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('AC1 · Un viaje que se aleja del pie: sin piezas a la vista la caída sigue con su última pared, nada sale NaN')

// El pie de 1440 del sitio (`entregas/pulido-20`: la cámara de antes del final, la pared y las piezas).
const PIE = JSON.parse(readFileSync('docs/rediseno/entregas/pulido-20/pie-1440.json', 'utf8')) as { readonly ancho: number; readonly alto: number; readonly camara: { readonly posicion: number[]; readonly cuaternion: number[]; readonly fov: number; readonly d: number }; readonly piezas: readonly { readonly forma: string; readonly caja: readonly number[]; readonly espesor: number }[] }
const CAMARA_DEL_PIE = new THREE.PerspectiveCamera(PIE.camara.fov, PIE.ancho / PIE.alto, 0.1, 500)
CAMARA_DEL_PIE.position.fromArray(PIE.camara.posicion)
CAMARA_DEL_PIE.quaternion.fromArray(PIE.camara.cuaternion)
CAMARA_DEL_PIE.updateProjectionMatrix()
CAMARA_DEL_PIE.updateMatrixWorld(true)
const ARMADAS = PIE.piezas.map((p) => ({ pieza: { forma: p.forma }, medida: { caja: { x: p.caja[0], y: p.caja[1], ancho: p.caja[2], alto: p.caja[3] } }, espesor: p.espesor, grupo: new THREE.Group() }) as unknown as Armada)
/**
 * El rebobinado de un viaje desde el pie entero, cuadro a cuadro: con las piezas a la vista el primer tercio (la pared del sitio) y después
 * ninguna (`d` infinita, como la manda `armadas.ts`; `profundidades`: las de cada columna, sin piezas a la vista 0). Cuántos cuadros
 * dejaron sin número el centro del pie, su distancia o el blanco de la cámara.
 */
function sinNumeroEnElViaje(profundidad: number): number {
  const c = crearLaCaidaDelPie()
  const blanco = new THREE.Vector3()
  let malos = 0
  for (let k = 0; k <= 120; k += 1) {
    EN_VIVO.fin = 1 - k / 120
    const aLaVista = k < 40
    armarLaCaida(c, ARMADAS, 0, 0, CAMARA_DEL_PIE, { ancho: PIE.ancho, alto: PIE.alto }, aLaVista ? PIE.camara.d : Number.POSITIVE_INFINITY, ARMADAS.map(() => (aLaVista ? 0 : profundidad)))
    blancoDelFinal(EN_VIVO.fin, blanco)
    if (!Number.isFinite(EN_VIVO.centroDelPie.x + EN_VIVO.centroDelPie.y + EN_VIVO.distanciaDelPie + blanco.x + blanco.y + blanco.z)) malos += 1
  }
  return malos
}
const SIN_NUMERO = sinNumeroEnElViaje(0)
afirmar(SIN_NUMERO === 0, `  120 cuadros de rebobinado, 80 sin ninguna pieza a la vista: ${String(SIN_NUMERO)} con el centro del pie, su distancia o el blanco sin número`)
const NUNCA = crearLaCaidaDelPie()
EN_VIVO.centroDelPie.set(0, 0)
EN_VIVO.fin = 0.5
armarLaCaida(NUNCA, ARMADAS, 0, 0, CAMARA_DEL_PIE, { ancho: PIE.ancho, alto: PIE.alto }, Number.POSITIVE_INFINITY, ARMADAS.map(() => 0))
afirmar(Number.isFinite(EN_VIVO.centroDelPie.x + EN_VIVO.centroDelPie.y) && NUNCA.m === 0, '  sin ninguna pieza a la vista nunca, nada que armar (el centro, como estaba)')
// El control: una pared infinita que llega a las columnas (lo que pasaba antes sin piezas a la vista: `d` iba derecho a cada una).
controlPositivo('  el detector VE una pared infinita en las columnas (la de antes)', sinNumeroEnElViaje(Number.POSITIVE_INFINITY), (malos: number) => malos === 0)
const CARGAS = readFileSync('src/app/v3/_lib/escena/energia/PlasmaYCargas.tsx', 'utf8')
const GUARDA = 'if (a === null || !Number.isFinite(state.camera.position.lengthSq() + state.camera.quaternion.lengthSq())) return'
const guardaBien = (c: string): boolean => c.includes(GUARDA) && c.indexOf(GUARDA) < c.indexOf('cuadro(a, f)')
afirmar(guardaBien(CARGAS), '  la energía no toma un cuadro con la cámara sin número (las brasas guardarían el NaN para siempre)')
controlPositivo('  y una energía sin la guarda', CARGAS.replace(GUARDA, 'if (a === null) return'), guardaBien)
// El aviso «1 Issue» (el servidor de desarrollo): con la cámara sin número el sector del piso es NaN y `ponerElOrden` leía un orden que no
// existe (`TypeError` en cada cuadro). Ahora no cambia nada; el control: el detector ve un orden que tira.
const ORDENES = armarLosOrdenes(Float32Array.from([0, 0, 1, 0, 0, 1]), new Float32Array(48), new Float32Array(6))
const BLOQUES = new THREE.InstancedMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial(), 3)
const CELDAS = new THREE.InstancedBufferAttribute(new Float32Array(6), 2)
const sinTirar = (f: () => void): boolean => {
  try {
    f()
    return true
  } catch {
    return false
  }
}
const SECTOR_SIN_NUMERO = sectorDe(Number.NaN, Number.NaN)
afirmar(sinTirar(() => ponerElOrden(BLOQUES, CELDAS, ORDENES, SECTOR_SIN_NUMERO)) && ORDENES.puesto === -1, `  el piso con la cámara sin número (sector ${String(SECTOR_SIN_NUMERO)}): no tira y deja el orden como estaba`)
controlPositivo('  el detector VE un orden que tira (el de antes leía un orden que no existe)', () => {
  throw new TypeError("Cannot read properties of undefined (reading 'length')")
}, sinTirar)
EN_VIVO.fin = 0

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA1 · La letra del form no titila con la cámara: impresa en la cara y el DOM con la fase fija')

/**
 * La órbita del mouse sobre el form (367 × 414 px), 300 cuadros: la cara se corre, cambia apenas de escala y de sesgo y tiene un poco de
 * perspectiva. Cuántas veces cambia la FASE con la que el compositor muestrea la letra (cambia la forma o la parte fraccionaria de la
 * traslación), si la traslación escrita es siempre entera y lo más que se aparta lo escrito de la cara (px, en cada eje).
 */
interface DeLaFase {
  readonly cuadros: number
  readonly fases: number
  readonly entera: boolean
  readonly desvio: number
}
function correrLaFase(escribe: (w: Float64Array, pedida: number[], hay: boolean) => boolean): DeLaFase {
  const [ancho, alto] = [367, 414]
  const w = new Float64Array(17)
  const pedida: number[] = []
  const antes = new Float64Array(17)
  let [hay, fases, entera, desvio] = [false, 0, true, 0]
  for (let k = 0; k < 300; k += 1) {
    const t = (2 * Math.PI * k) / 300
    const [tx, ty, e, sesgo, hondo] = [40 * Math.sin(t) + 0.13 * k, 25 * Math.cos(0.7 * t), 1 + 0.02 * Math.sin(0.5 * t), 6 * Math.sin(t), 3 * Math.cos(t)]
    const q = [tx, ty, tx + ancho * e, ty + sesgo, tx + ancho * e + 0.013 * alto, ty + alto * e + sesgo + hondo, tx + 0.013 * alto, ty + alto * e]
    if (!homografia(ancho, alto, q, pedida)) continue
    if (escribe(w, pedida, hay)) {
      if (w.some((v, j) => j < 16 && j !== 12 && j !== 13 && v !== antes[j]) || w[12] % 1 !== antes[12] % 1 || w[13] % 1 !== antes[13] % 1) fases += 1
      entera = entera && Number.isInteger(w[12]) && Number.isInteger(w[13])
      antes.set(w)
    }
    hay = true
    for (const [x, y] of [[0, 0], [ancho, 0], [ancho, alto], [0, alto]]) {
      const [a, b] = [aplicar(w, x, y), aplicar(pedida, x, y)]
      desvio = Math.max(desvio, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]))
    }
  }
  return { cuadros: 300, fases, entera, desvio }
}
const FIJA = correrLaFase((w, pedida, hay) => fijarLaFase(w, pedida, 2, 367, 414, hay))
// Lo escrito, a lo sumo `linealPx` de forma más medio píxel de redondeo de la cara en cada eje.
const faseBien = (c: DeLaFase): boolean => c.entera && c.fases <= 0.6 * c.cuadros && c.desvio <= DOM_QUE_SIGUE.linealPx + 0.5 + 0.01
afirmar(faseBien(FIJA), `  el DOM con la fase fija: la traslación siempre entera, la fase cambia en ${String(FIJA.fases)} de ${String(FIJA.cuadros)} cuadros y lo escrito se aparta de la cara a lo sumo ${FIJA.desvio.toFixed(2)} px en cada eje`)
// El control: la de PULIDO 27 (la transformada de la cámara tal cual, en cuanto una esquina se movía más de 0,15 px).
const FASE_DE_PULIDO_27 = correrLaFase((w, pedida, hay) => {
  const movio = !hay || [[0, 0], [367, 0], [367, 414], [0, 414]].some(([x, y]) => Math.hypot(aplicar(w, x, y)[0] - aplicar(pedida, x, y)[0], aplicar(w, x, y)[1] - aplicar(pedida, x, y)[1]) > 0.15)
  if (movio) for (let j = 0; j < 16; j += 1) w[j] = pedida[j]
  return movio
})
controlPositivo(`  el detector VE la de antes (la fase cambia en ${String(FASE_DE_PULIDO_27.fases)} cuadros, la traslación fraccionaria)`, FASE_DE_PULIDO_27, faseBien)
// Las letras impresas: la geometría del form sin las letras en relieve (ni los rótulos ni el de la tecla), la textura en una escala potencia
// de dos (el nivel del mipmap que cae a 1:1 es la letra entera) con su filtro anisótropo, y las mallas colgadas desde `armadas.ts`.
const GEOMETRIA = readFileSync('src/app/v3/_lib/escena/pie3d/geometria.ts', 'utf8')
const IMPRESAS_TS = readFileSync('src/app/v3/_lib/escena/pie3d/impresas.ts', 'utf8')
const ARMADAS_TS = readFileSync('src/app/v3/_lib/escena/pie3d/armadas.ts', 'utf8')
const impresasBien = (escala: number, g: string): boolean =>
  Number.isInteger(Math.log2(escala)) && escala >= 2 && g.includes('relieveDe(m, fuentes, false, 0, false)') && g.includes('relieveDe(m, fuentes, true, v.tecla, false)') && IMPRESAS_TS.includes('textura.anisotropy = IMPRESAS.anisotropia') && !/minFilter|generateMipmaps/.test(IMPRESAS_TS) && ARMADAS_TS.includes('colgarLasMallas(pieza.forma, medida, FUENTES, fija, hundible, material, uniformes, viaje, cuerpo)')
afirmar(impresasBien(IMPRESAS.escala, GEOMETRIA), `  las letras del form, impresas: sin relieve, a ${String(IMPRESAS.escala)}x con sus mipmaps y el filtro anisótropo (medido en el sitio: el vaivén de la tinta de un rótulo entre cuadros, de 0,88 % a 0,19 %; el de Enviar, de 0,9 % a 0,37 %)`)
controlPositivo('  el detector VE los rótulos en relieve (los de antes)', GEOMETRIA.replace('relieveDe(m, fuentes, false, 0, false)', 'relieveDe(m, fuentes, false, 0)'), (g: string) => impresasBien(IMPRESAS.escala, g))
controlPositivo('  y una escala que no es potencia de dos (con 3 la letra quedaba blanda)', 3, (e: number) => impresasBien(e, GEOMETRIA))

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA4 · Los huecos, ajustados al bloque: el piso normal alrededor y los bloques del borde cortados por la silueta')

const HUECOS_TS = readFileSync('src/app/v3/_lib/escena/pie3d/huecos.ts', 'utf8')
const EN_EL_PISO_TS = readFileSync('src/app/v3/_lib/escena/final/enElPiso.ts', 'utf8')
const POZOS_TS = readFileSync('src/app/v3/_lib/escena/pie3d/pozos.ts', 'utf8')
interface DelPisoAlrededor {
  readonly huecos: string
  readonly piso: string
  readonly margen: number
}
// El piso alrededor: ningún techo de los huecos en la altura de los bloques (sólo el del logo y el de los textos), el núcleo y la bajada sólo
// para los bloques enteros adentro (el centro, a más de media diagonal del borde), sin labio y la silueta exacta.
const alrededorBien = (d: DelPisoAlrededor): boolean =>
  !d.huecos.includes('techoDeLosHuecos') && !d.piso.includes('techoDeLosHuecos') && d.piso.includes('dibujo = min( dibujo, min( techoDeLosTextos( xz ), techoDelLogo( xz ) ) ) - bajaEnLosHuecos( xz );') &&
  d.huecos.includes('step( afueraDeLaHuella( xz, uQuietudDelPie[ k ] ) + 0.7072 * uLado, 0.0 )') && d.huecos.includes('+ 0.7072 * uLado ) / max( h.zw, vec2( 1e-3 ) )') &&
  !d.huecos.includes('labioDelHuecoDelPie') && !d.piso.includes('labioDelHuecoDelPie') && d.margen === 0
const ALREDEDOR: DelPisoAlrededor = { huecos: HUECOS_TS, piso: EN_EL_PISO_TS, margen: HUECO_DEL_PIE.margen }
afirmar(alrededorBien(ALREDEDOR), '  el piso alrededor de cada hueco, normal: sin el techo de los huecos (la banda a ras del labio: el mail y WhatsApp en un rectángulo hundido, las redes en un bloque), el núcleo y la bajada sólo para los bloques enteros adentro, sin labio y la silueta exacta')
controlPositivo('  el detector VE el techo de los huecos en la altura de los bloques (el de antes)', { ...ALREDEDOR, piso: EN_EL_PISO_TS.replace('min( techoDeLosTextos( xz ), techoDelLogo( xz ) )', 'min( techoDeLosTextos( xz ), min( techoDeLosHuecos( xz ), techoDelLogo( xz ) ) )') }, alrededorBien)
controlPositivo('  y el margen de antes (3 %)', { ...ALREDEDOR, margen: 0.03 }, alrededorBien)
// La pared del pozo: sube más que el bloque más alto que puede haber en la zona calma (la onda, la luz y el pistón quieto) y cada punto se
// corta en el tope del bloque de ese lugar, leído de las alturas del piso vivo con la grilla del polvo.
const MAS_ALTO = PISO_VIVO.onda.tope + 1.4 * LUZ_DE_ABAJO.alturas[1] + QUIETUD.piston
const paredBien = (p: string, tope: number): boolean =>
  tope >= MAS_ALTO && p.includes('if ( vMundoDelPozo.y > topeDelBloque( vMundoDelPozo.xz ) ) discard;') && p.includes('ivec2 celda = ivec2( floor( xz / uGrillaDelPiso.y + uGrillaDelPiso.x * 0.5 ) );') && p.includes('texelFetch( uPisoVivo, celda, 0 ).b') && p.includes('Object.assign(shader.uniforms, HUECOS_DEL_PIE, PISO_EN_VIVO,')
afirmar(paredBien(POZOS_TS, POZO_DEL_PIE.tope), `  la pared del pozo hasta ${String(POZO_DEL_PIE.tope)} u (el bloque más alto de la zona calma, ${MAS_ALTO.toFixed(2)} u), cortada en el tope de cada bloque del borde: la cara del corte`)
controlPositivo('  el detector VE la pared lisa de antes (hasta el labio, sin cortarse)', POZOS_TS.replace('if ( vMundoDelPozo.y > topeDelBloque( vMundoDelPozo.xz ) ) discard;', ''), (p: string) => paredBien(p, POZO_DEL_PIE.tope))
// El radio del hueco: el de la placa 3D. El form del sitio no tiene radio en el DOM: su placa usa el de reserva y el hueco también.
const RADIOS = crearLaCaidaDelPie()
EN_VIVO.fin = 0.5
armarLaCaida(RADIOS, ARMADAS, 0, 0, CAMARA_DEL_PIE, { ancho: PIE.ancho, alto: PIE.alto }, PIE.camara.d)
const radioDelForm = (piezas: readonly { readonly radioPx: number }[]): number => piezas[PIE.piezas.findIndex((x) => x.forma === 'formulario')]?.radioPx ?? -1
afirmar(radioDelForm(RADIOS.piezas) === 2 * VOLUMEN_DEL_PIE.radio, `  el hueco del form con el radio de su placa 3D (${String(radioDelForm(RADIOS.piezas))} px): sin el pozo a la vista en las esquinas`)
controlPositivo('  el detector VE el radio del DOM (0, el de antes: esquinas rectas)', [{ radioPx: 0 }], (p: readonly { readonly radioPx: number }[]) => p[0].radioPx === 2 * VOLUMEN_DEL_PIE.radio)
EN_VIVO.fin = 0

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA5 · El piso se abre sólo en el encastre: debajo de la pieza, tan hondo como volcó')

/**
 * La caída del pie de 1440 cuadro a cuadro (120 por s, todo el reloj): por placa, lo que volcó su columna (su ángulo sobre el del final),
 * lo que su proyección ya tapa de su silueta (vuelca sobre el canto: un punto a `d` del canto cae a `d·sen a`; desde su borde cercano) y
 * su hueco. `hueco`: cómo lo escribe el pie (lo de ahora) o la regla de antes (el control). Cuántos cuadros con el hueco abierto sin la
 * silueta entera, con otra profundidad que el vuelco, abierto más allá de lo que la pieza tapa o sin estar entero al incrustarse; y al 10 %
 * del vuelco, la profundidad (parte de la entera), lo abierto de la silueta y lo que la pieza tapa.
 */
interface DeLaApertura {
  readonly malos: number
  readonly alDiez: readonly [number, number, number]
}
type Hueco = (c: ReturnType<typeof crearLaCaidaDelPie>, s: number) => void
function correrLaApertura(hueco: Hueco): DeLaApertura {
  const c = crearLaCaidaDelPie()
  SALIDA_EN_VIVO.hunde = 0
  let malos = 0
  let alDiez: [number, number, number] = [Number.NaN, Number.NaN, Number.NaN]
  for (let k = 0; k <= RELOJ.duracionS * 120; k += 1) {
    const s = k / 120
    EN_VIVO.fin = s / RELOJ.duracionS
    armarLaCaida(c, ARMADAS, 0, 0, CAMARA_DEL_PIE, { ancho: PIE.ancho, alto: PIE.alto }, PIE.camara.d)
    hueco(c, s)
    let h = 0
    for (let i = 0; i < c.n; i += 1) {
      const p = c.piezas[i]
      if (!p.conSombra) continue
      const col = c.columnas[p.columna]
      const l = c.lugares[p.columna]
      const final = poseDeLaPiezaQueCae(col, l, l.incrustada + 1).a
      const pose = poseDeLaPiezaQueCae(col, l, s)
      const volco = Math.min(1, Math.max(0, pose.a / final))
      if (volco <= 0) continue
      const lejos = (col.y1 - col.y0 - p.dy) * col.mpp
      const cerca = lejos - p.altoPx * col.mpp
      const tapa = Math.max(0, (lejos * Math.sin(Math.min(pose.a, Math.PI / 2)) - cerca) / (lejos - cerca))
      const hondo = p.espesor + HUECO_DEL_PIE.hondoDeMas
      const forma = HUECOS_DEL_PIE.uFormaDeLosHuecosDelPie.value[h]
      h += 1
      const incrusta = pose.hundido > 0 && (forma.z < hondo - 1e-9 || forma.w < 1 - 1e-9)
      if (h > HUECOS_DEL_PIE.uCuantosHuecosDelPie.value || forma.x < 1 - 1e-9 || Math.abs(forma.z / hondo - volco) > 1e-6 || forma.w > tapa + 1e-6 || incrusta) malos += 1
      if (Number.isNaN(alDiez[0]) && volco >= 0.1) alDiez = [forma.z / hondo, forma.w * forma.x, tapa]
    }
    if (h < HUECOS_DEL_PIE.uCuantosHuecosDelPie.value) malos += 1
  }
  return { malos, alDiez }
}
const APERTURA = correrLaApertura((c, s) => {
  HUECOS_DEL_PIE.uCuantosHuecosDelPie.value = huecosDeLaCaida(c, s)
})
const pct = (x: number): string => `${(x * 100).toFixed(0)} %`
afirmar(APERTURA.malos === 0, `  la caída entera del pie de 1440: ${String(APERTURA.malos)} cuadros con un hueco sin la silueta entera, con otra profundidad que el vuelco, abierto más allá de la pieza o a medias al incrustarse (al 10 % del vuelco: ${pct(APERTURA.alDiez[0])} de hondo y abierto el ${pct(APERTURA.alDiez[1])}, lo que la pieza ya tapa)`)
// El control: la regla de antes (desde que empieza a inclinarse hasta un poco antes de tocar, por tiempo: la silueta crece desde el medio
// con el pozo entero; al 10 % del vuelco el hueco ya iba por la mitad, hondo del todo y a la vista fuera de la pieza).
const suaveDeAntes = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
}
const APERTURA_DE_ANTES = correrLaApertura((c, s) => {
  let k = 0
  for (let i = 0; i < c.n; i += 1) {
    const p = c.piezas[i]
    const l = c.lugares[p.columna]
    const abre = suaveDeAntes((s - l.inclina) / Math.max(1e-3, l.toca - 0.08 - l.inclina))
    if (abre <= 0 || !p.conSombra) continue
    HUECOS_DEL_PIE.uFormaDeLosHuecosDelPie.value[k].set(abre, 0, p.espesor + HUECO_DEL_PIE.hondoDeMas, 1)
    k += 1
  }
  HUECOS_DEL_PIE.uCuantosHuecosDelPie.value = k
})
controlPositivo(`  el detector VE la de antes (al 10 % del vuelco, ${pct(APERTURA_DE_ANTES.alDiez[0])} de hondo y abierto el ${pct(APERTURA_DE_ANTES.alDiez[1])}, con la pieza tapando el ${pct(APERTURA_DE_ANTES.alDiez[2])})`, APERTURA_DE_ANTES, (a: DeLaApertura) => a.malos === 0)
HUECOS_DEL_PIE.uCuantosHuecosDelPie.value = 0
EN_VIVO.fin = 0

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA6 · El © no se tapa mientras cae: la zona del pie en reposo hasta que todo se asentó')

/**
 * La caída del pie de 1440 cuadro a cuadro: desde que arranca el final hasta que todo se asentó, el reposo entero y la zona del pie con
 * todas sus piezas (hayan volcado o no); después, en `vuelveS`, el reposo se va (vuelve la energía, con la quietud de siempre). Cuántos
 * cuadros no cumplen. Y en la simulación del piso, la altura de los bloques (la onda, la luz y los pistones) por el reposo de su lugar.
 */
function correrElReposo(): { readonly malos: number; readonly asentado: number } {
  const c = crearLaCaidaDelPie()
  SALIDA_EN_VIVO.hunde = 0
  let malos = 0
  for (let k = 1; k <= RELOJ.duracionS * 120; k += 1) {
    const s = k / 120
    EN_VIVO.fin = s / RELOJ.duracionS
    armarLaCaida(c, ARMADAS, 0, 0, CAMARA_DEL_PIE, { ancho: PIE.ancho, alto: PIE.alto }, PIE.camara.d)
    huecosDeLaCaida(c, s)
    const reposo = QUIETUD_DEL_PIE.uReposoDelPie.value
    const entera = QUIETUD_DEL_PIE.uCuantasQuietudes.value === c.n
    if (!entera || (s < c.ultimaS && reposo < 1) || (s > c.ultimaS + QUIETUD.vuelveS && reposo > 0)) malos += 1
  }
  return { malos, asentado: c.ultimaS / RELOJ.duracionS }
}
const REPOSO = correrElReposo()
const EN_EL_PISO_REPOSO = readFileSync('src/app/v3/_lib/escena/final/enElPiso.ts', 'utf8')
const reposoBien = (malos: number, piso: string): boolean =>
  malos === 0 && piso.includes(String.raw`clamp( uEnergiaDeLaLuz * 4.0, 0.0, 1.0 ) );\n\tdibujo *= 1.0 - reposoDelPie( xz );`) && piso.indexOf('reposoDelPie( xz )') < piso.indexOf('techoDeLosTextos( xz ), techoDelLogo( xz )')
afirmar(reposoBien(REPOSO.malos, EN_EL_PISO_REPOSO), `  la caída entera: la zona del pie con todas sus piezas y en reposo hasta que todo se asentó (${REPOSO.asentado.toFixed(3)} del final), la energía de vuelta en ${String(QUIETUD.vuelveS)} s; en el piso, la onda, la luz y los pistones por el reposo (${String(REPOSO.malos)} cuadros mal)`)
controlPositivo('  el detector VE el piso sin el reposo (el de antes: los pistones subían alrededor del © mientras caía)', EN_EL_PISO_REPOSO.replace(String.raw`\n\tdibujo *= 1.0 - reposoDelPie( xz );`, ''), (p: string) => reposoBien(REPOSO.malos, p))
controlPositivo('  y una zona sólo con las piezas que ya volcaron (la de antes)', 1, (m: number) => reposoBien(m, EN_EL_PISO_REPOSO))
QUIETUD_DEL_PIE.uReposoDelPie.value = 0
QUIETUD_DEL_PIE.uCuantasQuietudes.value = 0
EN_VIVO.fin = 0

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA2 · Gracias y error: la placa baja sobre su plataforma, el piso se cierra, se cambian a cubierto y sube la otra')

/**
 * El pie de 1440 acostado (el final entero) y la transformación de la placa del form cuadro a cuadro: su hueco. `plataforma`: si el fondo
 * baja con la placa (lo de ahora) o no (el control). Cuántos cuadros con la placa más honda que el fondo de su pozo, con el piso sin
 * cerrar en el cambio o abierto a medias fuera de él.
 */
function correrElHundimiento(plataforma: boolean): number {
  const c = crearLaCaidaDelPie()
  SALIDA_EN_VIVO.hunde = 0
  EN_VIVO.fin = 1
  armarLaCaida(c, ARMADAS, 0, 0, CAMARA_DEL_PIE, { ancho: PIE.ancho, alto: PIE.alto }, PIE.camara.d)
  const i = c.piezas.findIndex((p, k) => k < c.n && p.esForm)
  const form = c.piezas[i]
  const mpp = c.columnas[form.columna].mpp
  let h = 0
  for (let k = 0; k < i; k += 1) if (c.piezas[k].conSombra) h += 1
  let malos = 0
  hundimientoDelPiso(false, 1, form.espesorPx)
  const abiertos = huecosDeLaCaida(c, RELOJ.duracionS)
  for (let k = 0; k <= 240; k += 1) {
    const t = k / 240
    hundimientoDelPiso(false, t, form.espesorPx)
    const hundido = PLATAFORMA_EN_VIVO.hundido
    if (!plataforma) PLATAFORMA_EN_VIVO.hundido = 0
    // Cerrado del todo, su hueco no está (uno menos).
    if (huecosDeLaCaida(c, RELOJ.duracionS) < abiertos) {
      if (PLATAFORMA_EN_VIVO.cerrado < 1) malos += 1
      continue
    }
    const forma = HUECOS_DEL_PIE.uFormaDeLosHuecosDelPie.value[h]
    const placaAbajo = form.espesor + hundido * mpp
    const cerrado = PLATAFORMA_EN_VIVO.cerrado
    if (forma.z + 1e-9 < placaAbajo || Math.abs(forma.x - (1 - cerrado)) > 1e-9 || (Math.abs(t - 0.5) < 1e-9 && forma.x > 0) || ((t <= HUNDIMIENTO_DEL_PIE.baja || t >= 1 - HUNDIMIENTO_DEL_PIE.baja) && forma.x < 1)) malos += 1
  }
  hundimientoDelPiso(false, 1, form.espesorPx)
  EN_VIVO.fin = 0
  return malos
}
const HUNDIMIENTO = correrElHundimiento(true)
const PIE3D = 'src/app/v3/_lib/escena/pie3d'
const sinDerretido = !existsSync(`${PIE3D}/derretido.ts`) && !existsSync(`${PIE3D}/teselado.ts`) && !readFileSync(`${PIE3D}/material.ts`, 'utf8').includes('DERRETIDO') && !readFileSync(`${PIE3D}/coreografia.ts`, 'utf8').includes('uDerriteDelPie')
afirmar(HUNDIMIENTO === 0 && sinDerretido, `  la transformación entera: la placa nunca más honda que el fondo de su pozo (su plataforma baja con ella), el piso cerrado en el cambio y abierto al bajar y al subir (${String(HUNDIMIENTO)} cuadros mal); sin el derretido (su módulo, su teselado y su sombreador)`)
controlPositivo('  el detector VE un pozo sin plataforma (la placa se hunde en el fondo)', correrElHundimiento(false), (m: number) => m === 0 && sinDerretido)
// El vacío con cosas borrosas (medido en el sitio, apagando capas): la placa hundida pasaba por debajo del plano de la luz de abajo y lo que
// se veía en el pozo eran sus manchas de energía. El plano no se dibuja adentro de los huecos del pie.
const PLANO = readFileSync('src/app/v3/_lib/escena/final/planoDeLaLuz.ts', 'utf8')
const planoBien = (p: string): boolean => p.includes('	if ( huecoDelPie( vXZ ) < 0.0 ) discard;') && p.includes('...HUECOS_DEL_PIE, uBaseDelPie: FINAL_EN_EL_PISO.uBaseDelPie')
afirmar(planoBien(PLANO), '  el plano de la luz de abajo, recortado por los huecos del pie: en el pozo, las paredes, la placa y su plataforma')
controlPositivo('  el detector VE el plano entero (el de antes)', PLANO.replace('	if ( huecoDelPie( vXZ ) < 0.0 ) discard;', ''), planoBien)

cerrar('s72-pulido-28')
