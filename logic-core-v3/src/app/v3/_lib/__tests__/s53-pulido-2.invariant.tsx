/**
 * PULIDO 2 — el invariante: npm run test:s53-pulido-2
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   1 · el encastre DETRÁS del pie abajo de 1024: sin escenario (la página termina en el pie), el logo en el hueco más grande
 *       entre los elementos del pie, el teclado que no lo dispara, y el pie en AA mientras corre.
 *   2 · los viajes del menú: la duración por la distancia con saturación, un solo reloj (con lo retenido devuelto), el
 *       reparto por lo que se ve cambiar, el amanecer que se completa en el viaje y el ≠ que llega con el titular.
 *   3 · el velo del texto de Trabajos sin rectángulo: una elipse detrás del texto (o, con `?velo=escena`, en el logo).
 *   4 · la luz que sale de abajo del piso, por las juntas: el sector que se separa y cambia de alto, los costados desde la
 *       base, el plano de abajo, sin tapas blancas ni bloom; nace en un punto, respira; la sala, gradual; `?chispas=si`.
 *   5 · el CTA del final desde «Seis razones» (`?cta=capas|relevo|giro|cruce|tipo`): cada una pura del scroll, sus gestos,
 *       la fuente del hero con el material de los títulos, el clic a Contacto, el teléfono, el movimiento reducido.
 *   6 · los pendientes de PULIDO 1: la sombra del logo que entra con fundido al salir del hueco; «CONTACTO» a 768 en AA.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-2.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-2/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import ARCHIVO_700 from '../../_fuentes/archivo-700-titulos.json'
import ARCHIVO_100 from '../../_fuentes/archivo-100-cta.json'
import CHIVO_400 from '../../_fuentes/chivo-400-titulos.json'
import CHIVO_100 from '../../_fuentes/chivo-100-cta.json'
import { TIPOGRAFIA_DEL_TITULAR } from '../../_secciones/hero/geometria'

import type { Curva } from '../motion/curvas'
import { AMANECER_EN_EL_VIAJE, completoDelViaje } from '../escena/amanecer/linea'
import { ESPESOR_DE_LAS_CAPAS } from '../escena/ctaDelFinal/armadoDelCta'
import { capasDelCta, letrasConDosPesos } from '../escena/ctaDelFinal/letras'
import {
  CAPAS_DEL_CTA,
  LISTA_DEL_CTA,
  TRANSFORMACION,
  cajaDe,
  ctaTocable,
  entradaEnLaLista,
  llegadaDelTexto,
  nuevaPose,
  parejas,
  plegadoDelValor,
  posesDe,
  progresoEnLaLista,
  zoomDelCruce,
  type CajaEnPantalla,
  type EscenaDeLaTransformacion,
  type LetraEnPantalla,
  type Pose,
  type PosesDeLaTransformacion,
} from '../escena/ctaDelFinal/variantes'
import { CHISPAS_DE_LA_LUZ, crearLasChispas } from '../escena/final/chispasDeLaLuz'
import { ENCUADRE_DEL_PIE, encuadreEntreLasCajas, type Caja, type EncuadreEnPantalla } from '../escena/final/encuadreDelPie'
import { ANCLAS_DEL_HUECO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { LUZ_DE_ABAJO } from '../escena/final/luzDeAbajo'
import { crearElPlanoDeLaLuz } from '../escena/final/planoDeLaLuz'
import { SOMBRA_EN_LA_CAIDA, camaraDelFinal, distanciaParaElAncho, sombraConFundido, sombraDeLaPose } from '../escena/final/recorridoDelFinal'
import { TECLADO, pasoDelTeclado, tecladoQuieto, type EstadoDelTeclado, type LecturaDelTeclado } from '../escena/final/teclado'
import { ENTORNO, VARIANTES_DEL_CTA, entornoPedido, type VarianteDelCta } from '../escena/entorno'
import { PISO_VIVO, SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { CAMERA_FOV, FLOOR_Y } from '../escena/probeScene'
import { curvaRepartida, type MuestrasDelViaje } from '../escena/repartoDelViaje'
import { TOPE_DEL_CUADRO_DEL_VIAJE_MS, empezarElViaje, relojDelCuadro, segundosDelViaje, sostenerElReloj, terminarElViaje } from '../escena/viaje'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El encastre detrás del pie abajo de 1024: sin escenario, el logo entre los elementos, el teclado y el AA')

// La página termina donde terminaba antes de P22 (857af5c7): después de las secciones no hay nada. Medido en el banco a
// 390 × 844: el scroll máximo es 21423 px, el mismo que se midió en el código de antes de P22 (PULIDO 1, `p22/alturas`:
// documento 22267 − 844); con el escenario era 22267. A 768 × 1024, 26881 (el pie termina en 27905).
const home = sinComentarios(leer('_secciones/Home.tsx'))
const fuentes = (dir: string): string[] => readdirSync(dir).flatMap((n) => {
  const ruta = join(dir, n)
  if (n === '__tests__' || n === '_invariantes' || n.endsWith('.invariant.tsx') || n.endsWith('.invariant.ts')) return []
  return statSync(ruta).isDirectory() ? fuentes(ruta) : /\.(tsx?|css)$/.test(n) ? [ruta] : []
})
const conEscenario = fuentes(V3).filter((r) => /escenario-del-encastre|data-encastre|desvanecerElPie/.test(readFileSync(r, 'utf8')))
const terminaEnElPie = (h: string, conEl: readonly string[]): boolean => /return \(\s*<>\s*\{REGISTRO\.map\(\(\{ id, Componente, seccion \}\) => \(\s*<Componente key=\{id\} seccion=\{seccion\} \/>\s*\)\)\}\s*<\/>\s*\)/.test(h) && conEl.length === 0
afirmar(terminaEnElPie(home, conEscenario), 'la página termina en el pie: el home son las secciones y nada más, y no queda ni el escenario de P22 ni su otra lectura en ningún archivo (scroll máximo a 390 = 21423, el de antes de 857af5c7)', conEscenario.join(' · ') || 'ninguno')
controlPositivo('el detector VE el escenario de P22 después de las secciones', home.replace(/\)\)\}\s*<\/>/, '))}<div data-pieza="escenario-del-encastre" /></>'), (h: string) => terminaEnElPie(h, []))

// EL ENCUADRE: con las cajas del pie al fondo (medidas en el banco, a 390 × 844, 375 × 667, 768 × 1024, 844 × 390 y 667 × 375:
// el texto, los enlaces, los campos, los íconos, la caja de vidrio y lo fijo), el logo va en el hueco más grande entre ellos
// (sin tocar ninguna caja); si no le da un tamaño legible, entre lo pesado (el titular, el vidrio, lo fijo: el texto chico
// queda encima); si tampoco, detrás del vidrio. Siempre dentro de su tope. La huella es la del logo acostado (6,9 × 4,78 u).
type Fixture = { readonly ocupadas: readonly (readonly [number, number, number, number])[]; readonly pesadas: readonly (readonly [number, number, number, number])[]; readonly vidrio: readonly [number, number, number, number] | null }
const CAJAS: Readonly<Record<string, Fixture>> = {
  '390x844': { ocupadas: [[32, 72, 326, 53], [32, 146, 189, 23], [229, 137, 109, 41], [32, 319, 64, 24], [207, 319, 132, 24], [32, 350, 87, 24], [207, 350, 91, 24], [32, 381, 84, 24], [207, 381, 140, 24], [44, 451, 145, 11], [44, 466, 145, 44], [201, 451, 145, 11], [201, 466, 145, 44], [44, 521, 197, 11], [44, 536, 197, 72], [253, 568, 93, 41], [32, 742, 32, 32], [84, 742, 32, 32], [136, 742, 32, 32], [188, 742, 32, 32], [32, 785, 326, 11], [32, 420, 326, 201], [171, 16, 48, 48], [327, 752, 32, 32], [312, 788, 62, 40]], pesadas: [[32, 72, 326, 53], [32, 420, 326, 201], [171, 16, 48, 48], [327, 752, 32, 32], [312, 788, 62, 40]], vidrio: [32, 420, 326, 201] },
  '375x667': { ocupadas: [[32, 72, 311, 52], [32, 145, 189, 23], [229, 136, 109, 41], [32, 230, 64, 24], [200, 230, 132, 24], [32, 261, 87, 24], [200, 261, 91, 24], [32, 292, 84, 24], [200, 292, 140, 24], [44, 362, 138, 11], [44, 377, 138, 44], [194, 362, 138, 11], [194, 377, 138, 44], [44, 432, 187, 11], [44, 447, 187, 72], [243, 479, 88, 41], [32, 565, 32, 32], [84, 565, 32, 32], [136, 565, 32, 32], [188, 565, 32, 32], [32, 608, 311, 11], [32, 331, 311, 201], [164, 16, 48, 48], [312, 575, 32, 32], [297, 611, 62, 40]], pesadas: [[32, 72, 311, 52], [32, 331, 311, 201], [164, 16, 48, 48], [312, 575, 32, 32], [297, 611, 62, 40]], vidrio: [32, 331, 311, 201] },
  '768x1024': { ocupadas: [[32, 72, 328, 142], [32, 238, 189, 23], [32, 276, 253, 41], [408, 99, 64, 24], [408, 134, 132, 24], [408, 169, 87, 24], [408, 204, 91, 24], [408, 239, 84, 24], [408, 274, 140, 24], [420, 352, 146, 11], [420, 367, 146, 44], [578, 352, 146, 11], [578, 367, 146, 44], [420, 423, 199, 11], [420, 438, 199, 72], [631, 469, 93, 41], [32, 906, 32, 32], [88, 906, 32, 32], [144, 906, 32, 32], [200, 906, 32, 32], [32, 965, 704, 11], [408, 313, 328, 209], [360, 16, 48, 48], [705, 932, 32, 32], [690, 968, 62, 40]], pesadas: [[32, 72, 328, 142], [408, 313, 328, 209], [360, 16, 48, 48], [705, 932, 32, 32], [690, 968, 62, 40]], vidrio: [408, 313, 328, 209] },
  '844x390': { ocupadas: [[32, -226, 366, 98], [32, -104, 189, 23], [32, -66, 253, 41], [446, -199, 64, 24], [446, -164, 132, 24], [446, -129, 87, 24], [446, -94, 91, 24], [446, -59, 84, 24], [446, -24, 140, 24], [458, 54, 165, 11], [458, 69, 165, 44], [635, 54, 165, 11], [635, 69, 165, 44], [458, 125, 224, 11], [458, 140, 224, 72], [694, 171, 106, 41], [32, 272, 32, 32], [88, 272, 32, 32], [144, 272, 32, 32], [200, 272, 32, 32], [32, 331, 780, 11], [446, 15, 366, 209], [398, 16, 48, 48], [781, 298, 32, 32], [766, 334, 62, 40]], pesadas: [[32, -226, 366, 98], [446, 15, 366, 209], [398, 16, 48, 48], [781, 298, 32, 32], [766, 334, 62, 40]], vidrio: [446, 15, 366, 209] },
  '667x375': { ocupadas: [[32, -164, 603, 32], [32, -111, 189, 23], [229, -120, 109, 41], [32, -44, 64, 24], [346, -44, 132, 24], [32, -13, 87, 24], [346, -13, 91, 24], [32, 18, 84, 24], [346, 18, 140, 24], [44, 88, 284, 11], [44, 103, 284, 44], [340, 88, 284, 11], [340, 103, 284, 44], [44, 158, 382, 11], [44, 173, 382, 72], [438, 205, 185, 41], [32, 273, 32, 32], [84, 273, 32, 32], [136, 273, 32, 32], [188, 273, 32, 32], [32, 316, 603, 11], [32, 57, 603, 201], [310, 16, 48, 48], [604, 283, 32, 32], [589, 319, 62, 40]], pesadas: [[32, -164, 603, 32], [32, 57, 603, 201], [310, 16, 48, 48], [604, 283, 32, 32], [589, 319, 62, 40]], vidrio: [32, 57, 603, 201] },
}
const HUELLA = { ancho: 6.9, fondo: 4.78 }
const caja = ([x, y, ancho, alto]: readonly [number, number, number, number]): Caja => ({ x, y, ancho, alto })
const vistaDe = (tam: string): { ancho: number; alto: number } => {
  const [ancho, alto] = tam.split('x').map(Number)
  return { ancho, alto }
}
/** El rectángulo de la huella en la pantalla. */
const huellaEnPantalla = (e: EncuadreEnPantalla): Caja => {
  const alto = e.ancho / (HUELLA.ancho / HUELLA.fondo)
  return { x: e.cx - e.ancho / 2, y: e.cy - alto / 2, ancho: e.ancho, alto }
}
const toca = (a: Caja, b: Caja): boolean => a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto
const ESPERADO: Readonly<Record<string, EncuadreEnPantalla['donde']>> = { '390x844': 'hueco', '375x667': 'texto', '768x1024': 'hueco', '844x390': 'hueco', '667x375': 'vidrio' }
type Encuadrar = typeof encuadreEntreLasCajas
const encuadreBien = (f: Encuadrar): boolean => Object.entries(CAJAS).every(([tam, c]) => {
  const vista = vistaDe(tam)
  const ocupadas = c.ocupadas.map(caja)
  const pesadas = c.pesadas.map(caja)
  const vidrio = c.vidrio === null ? null : caja(c.vidrio)
  const e = f(vista, ocupadas, pesadas, vidrio, HUELLA)
  const limita = Math.min(vista.ancho, vista.alto * (HUELLA.ancho / HUELLA.fondo))
  const h = huellaEnPantalla(e)
  const dentro = h.x >= 0 && h.y >= 0 && h.x + h.ancho <= vista.ancho && h.y + h.alto <= vista.alto
  if (e.donde !== ESPERADO[tam]) return false
  if (e.donde === 'vidrio') return vidrio !== null && Math.abs(e.cx - (vidrio.x + vidrio.ancho / 2)) < 1 && Math.abs(e.cy - (vidrio.y + vidrio.alto / 2)) < 1 && Math.abs(e.ancho - ENCUADRE_DEL_PIE.enElVidrio * limita) < 1
  const libreDe = e.donde === 'hueco' ? ocupadas : pesadas
  return dentro && !libreDe.some((o) => toca(h, o)) && e.ancho >= ENCUADRE_DEL_PIE.minimo * limita && e.ancho <= ENCUADRE_DEL_PIE.maximo * limita + 1
})
afirmar(encuadreBien(encuadreEntreLasCajas), 'el logo va en el hueco más grande entre los elementos del pie (sin tocar ninguno), si no entre lo pesado (detrás del texto chico), si no detrás del vidrio; siempre entero en la pantalla y dentro de su tope', Object.entries(ESPERADO).map(([t, d]) => `${t} ${d}`).join(' · '))
controlPositivo('el detector VE el encuadre de P22 (centrado, la mitad del ancho: detrás de los enlaces y del vidrio)', ((vista: { ancho: number; alto: number }) => ({ cx: vista.ancho / 2, cy: vista.alto / 2, ancho: vista.ancho / 2, donde: 'hueco' })) as Encuadrar, encuadreBien)
// Centrado en el eje cuando entra: a 390 el hueco de arriba (entre los contactos y «el recorrido») lo deja en el eje.
const a390 = encuadreEntreLasCajas(vistaDe('390x844'), CAJAS['390x844'].ocupadas.map(caja), CAJAS['390x844'].pesadas.map(caja), caja([32, 420, 326, 201]), HUELLA)
afirmar(Math.abs(a390.cx - 195) <= ENCUADRE_DEL_PIE.celda && a390.cy > 178 && a390.cy < 319, '  a 390 × 844, en el hueco entre los contactos y los enlaces, en el eje de la pantalla', `centro ${String(Math.round(a390.cx))}, ${String(Math.round(a390.cy))} · ancho ${String(Math.round(a390.ancho))} px`)

// LA CÁMARA: arriba (k = 1), el logo queda en el punto pedido de la pantalla y con el ancho pedido (la cámara se corre en su
// plano, sin girar; la distancia sale del ancho de la huella).
const camaraConCorrimiento = (corre: boolean): { ndc: THREE.Vector3; ancho: number } => {
  const c = new THREE.PerspectiveCamera(CAMERA_FOV, 390 / 844, 0.1, 500)
  c.position.set(0, 8, 30)
  c.lookAt(0, 2, 0)
  c.updateMatrixWorld()
  const blanco = new THREE.Vector3(0, FLOOR_Y + 0.3, 0)
  const distancia = distanciaParaElAncho(CAMERA_FOV, c.aspect, HUELLA.ancho, 0.42)
  camaraDelFinal(c, 1, blanco, 0, 0, null, distancia, corre ? { x: -0.3, y: 0.4 } : null)
  c.updateMatrixWorld()
  const ndc = blanco.clone().project(c)
  const a = blanco.clone().add(new THREE.Vector3(-HUELLA.ancho / 2, 0, 0)).project(c)
  const b = blanco.clone().add(new THREE.Vector3(HUELLA.ancho / 2, 0, 0)).project(c)
  return { ndc, ancho: Math.abs(b.x - a.x) / 2 }
}
const camaraBien = (r: { ndc: THREE.Vector3; ancho: number }): boolean => Math.abs(r.ndc.x + 0.3) < 0.02 && Math.abs(r.ndc.y - 0.4) < 0.02 && Math.abs(r.ancho - 0.42) < 0.02
const conCorrimiento = camaraConCorrimiento(true)
afirmar(camaraBien(conCorrimiento), '  la cámara de arriba pone el logo donde lo pide el encuadre y del ancho pedido', `ndc ${conCorrimiento.ndc.x.toFixed(3)}, ${conCorrimiento.ndc.y.toFixed(3)} · ancho ${conCorrimiento.ancho.toFixed(3)}`)
controlPositivo('  el detector VE la cámara sin el corrimiento (el logo al centro)', camaraConCorrimiento(false), camaraBien)

// EL TECLADO: con el foco en un campo el reloj queda donde está y lo que el teclado le hace a la página (la vista que se
// achica, el scroll que acomoda el campo, la vista que vuelve) no cambia el fondo que vale; lo cambia el visitante (un gesto
// desde que entró al campo, o un scroll con la vista quieta) o la vista que vuelve a decir lo mismo. Cuadros a 60 por segundo.
type Paso = typeof pasoDelTeclado
interface Cuadro { readonly t: number; readonly escribe: boolean; readonly medido: boolean; readonly vista: number; readonly scroll: number; readonly gesto: number }
const correrTeclado = (f: Paso, cuadros: readonly Cuadro[], alFondoAntes: boolean): LecturaDelTeclado[] => {
  const t: EstadoDelTeclado = tecladoQuieto()
  f(t, false, alFondoAntes, 844, 0, -1, Number.NEGATIVE_INFINITY)
  return cuadros.map((c) => f(t, c.escribe, c.medido, c.vista, c.scroll, c.t, c.gesto))
}
const tramo = (desde: number, hasta: number, c: Omit<Cuadro, 't'>): Cuadro[] => Array.from({ length: Math.round((hasta - desde) * 60) }, (_, i) => ({ ...c, t: desde + i / 60 }))
const tecladoBien = (f: Paso): boolean => {
  const SIN = Number.NEGATIVE_INFINITY
  // A · al fondo, el final corriendo: entra al campo, el teclado achica la vista y el navegador sube la página 150 px.
  const A = correrTeclado(f, [...tramo(0, 1, { escribe: true, medido: false, vista: 544, scroll: 21273, gesto: SIN }), ...tramo(1, 3, { escribe: false, medido: false, vista: 844, scroll: 21273, gesto: SIN })], true)
  const aBien = A.slice(0, 60).every((l) => l.congelado && l.alFondo) && A.slice(60).every((l) => !l.congelado && l.alFondo)
  // A2 · igual, pero el visitante arrastra la página mientras escribe: con la vista quieta, vale el fondo medido.
  const A2 = correrTeclado(f, [...tramo(0, 1, { escribe: true, medido: false, vista: 544, scroll: 21218, gesto: 0.5 }), ...tramo(1, 3, { escribe: false, medido: false, vista: 844, scroll: 21218, gesto: 0.5 })], true)
  const a2Bien = A2.slice(0, 60).every((l) => l.congelado && l.alFondo) && A2.slice(60, 60 + Math.floor(TECLADO.calmaS * 60) - 1).every((l) => l.alFondo) && A2.slice(-30).every((l) => !l.alFondo)
  // B · fuera del fondo (final en cero): el teclado y el navegador dejan la página al fondo; no arranca, ni al irse el teclado
  // (sigue al fondo); arranca con el primer gesto del visitante, o si la página se mueve con la vista quieta.
  const B = correrTeclado(f, [...tramo(0, 2, { escribe: true, medido: true, vista: 544, scroll: 21423, gesto: SIN }), ...tramo(2, 5, { escribe: false, medido: true, vista: 844, scroll: 21423, gesto: SIN }), ...tramo(5, 6, { escribe: false, medido: true, vista: 844, scroll: 21423, gesto: 5 })], false)
  const bBien = B.slice(0, 120).every((l) => l.congelado && !l.alFondo) && B.slice(120, 300).every((l) => !l.alFondo) && B.slice(-30).every((l) => l.alFondo)
  const B2 = correrTeclado(f, [...tramo(0, 1, { escribe: true, medido: true, vista: 544, scroll: 21423, gesto: SIN }), ...tramo(1, 3, { escribe: false, medido: true, vista: 844, scroll: 21423, gesto: SIN }), ...tramo(3, 4, { escribe: false, medido: true, vista: 844, scroll: 21380, gesto: SIN })], false)
  const b2Bien = B2.slice(60, 180).every((l) => !l.alFondo) && B2.slice(-30).every((l) => l.alFondo)
  return aBien && a2Bien && bBien && b2Bien
}
afirmar(tecladoBien(pasoDelTeclado), '  escribiendo, el final no arranca ni rebobina y el teclado (la vista que se achica, el scroll del navegador, la vista que vuelve) no lo dispara; lo mueve el visitante')
controlPositivo('  el detector VE un teclado que le cree al fondo medido (el viewport del teclado lo dispararía)', ((_t: EstadoDelTeclado, escribiendo: boolean, medido: boolean) => ({ congelado: escribiendo, alFondo: medido })) as Paso, tecladoBien)
controlPositivo('  y uno que congela pero, al salir del campo, le cree enseguida', ((t: EstadoDelTeclado, escribiendo: boolean, medido: boolean) => {
  if (escribiendo) {
    t.escribiendo = true
    return { congelado: true, alFondo: t.alFondo }
  }
  t.escribiendo = false
  t.alFondo = medido
  return { congelado: false, alFondo: medido }
}) as Paso, tecladoBien)

// El cableado: sólo abajo de 1024; escribiendo, el reloj no avanza y el gesto no se retiene (pero queda anotado); el fondo
// del gesto es el del último cuadro (el del teclado); los gestos se retienen con el pie a la vista; el encuadre se mide al
// montarse, al asomarse el pie y con cada cambio de tamaño, no con el teclado; el pie lleva su marca al fondo y mientras corre.
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const componente = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const tecladoTs = sinComentarios(leer('_lib/escena/final/teclado.ts'))
const cableadoBien = (c: string, f: string): boolean =>
  c.includes('const teclado = s.angosto ? pasoDelTeclado(s.teclado, escribiendoEnUnCampo(), alFondoMedido, window.visualViewport?.height ?? window.innerHeight, window.scrollY, ahora, s.gestos.ultimo) : sinTeclado(alFondoMedido)') &&
  c.includes('else if (!teclado.congelado) pasoDelReloj(s.reloj, { alFondo: teclado.alFondo,') && c.includes('if (!teclado.congelado) s.quietoS =') &&
  /s\.gestos\.ultimo = ahora\s*if \(s\.angosto && s\.teclado\.escribiendo\) return false\s*const alFondo = s\.angosto \? s\.alFondo :/.test(c) &&
  f.includes("const vigilado = document.getElementById('cierre')") && /new IntersectionObserver\(medir, \{ threshold: \[0, 0\.5, 1\] \}\)/.test(f) && f.includes('if (escribiendoEnUnCampo()) return') &&
  f.includes('if (angosto && m.current !== null) marcarElPie(m.current.alFondo || EN_VIVO.fin > 0 || EN_VIVO.giro !== 0 || EN_VIVO.aleja !== 0)') &&
  /checkbox\|radio\|button\|submit/.test(tecladoTs)
afirmar(cableadoBien(cuadro, componente), '  el cableado: sólo abajo de 1024; escribiendo, el reloj y el quieto quietos y el gesto suelto (anotado); retenidos con el pie a la vista; el encuadre medido al asomarse el pie y sin teclado; la marca del pie al fondo y mientras corre')
controlPositivo('  el detector VE un reloj que avanza escribiendo', [cuadro.replace('else if (!teclado.congelado) pasoDelReloj(', 'else pasoDelReloj('), componente] as const, ([c, f]: readonly [string, string]) => cableadoBien(c, f))

// EL AA DEL PIE MIENTRAS CORRE: la mezcla (`difference`) pinta gris sobre los grises de la cinemática (los enlaces llegaban
// a 1,1:1). Con la marca, sin mezcla: la tinta con un halo denso del papel; también las etiquetas del vidrio y la fila de
// abajo. Medido con el reloj clavado en diez momentos (núcleos de las letras, percentil 10): todos los textos del pie en
// 4,5:1 o más a 390, 375, 768, 844 y 667 de ancho, salvo «Enviar» (un botón opaco: la escena no lo toca; 3,4–4,9 igual
// con y sin final, por el borde de sus letras).
const banda = leer('_estilos/banda.css')
const haloDelPie = (css: string): boolean => {
  const m = /\[data-v3\] \[data-panel='cierre'\]\[data-final-del-pie\] \{\s*--halo-del-pie: ([^;]+);/.exec(css)
  if (m === null) return false
  const cortas = m[1].split(/,(?![^(]*\))/).filter((s) => /^\s*0 0 0\.1em var\(--color-fondo\)\s*$/.test(s)).length
  return cortas >= 3 &&
    /\[data-v3\] \[data-panel='cierre'\]\[data-final-del-pie\] \.max-escritorio\\:mix-blend-difference \{\s*mix-blend-mode: normal;\s*color: var\(--color-tinta\);\s*text-shadow: var\(--halo-del-pie\);/.test(css) &&
    /\[data-v3\] \[data-panel='cierre'\]\[data-final-del-pie\] \[data-material='vidrio'\] label,\s*\[data-v3\] \[data-panel='cierre'\]\[data-final-del-pie\] p\[data-pieza='texto'\] \{\s*text-shadow: var\(--halo-del-pie\);/.test(css) &&
    css.indexOf('[data-final-del-pie]') > css.indexOf('@media (width < 1024px) {') && css.indexOf('[data-final-del-pie]') < css.indexOf('/* ── HOVER DONDE HAY')
}
afirmar(haloDelPie(banda), '  al fondo y mientras corre (abajo de 1024), el pie sin mezcla: la tinta con un halo denso del papel; las etiquetas del vidrio y la fila de abajo con el halo')
controlPositivo('  el detector VE el pie con la mezcla también mientras corre', banda.replace('[data-final-del-pie] .max-escritorio\\:mix-blend-difference {\n    mix-blend-mode: normal;', '[data-final-del-pie] .max-escritorio\\:mix-blend-difference {'), haloDelPie)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los viajes del menú: más rápidos sin perder calidad (la distancia con saturación, un solo reloj, el reparto, el amanecer, el ≠)')

// LA MATRIZ (medida en la NVIDIA, del click a la llegada; `docs/rediseno/entregas/pulido-2/p2-matriz-de-viajes.txt`): antes,
// a 1440, de 2,9 s (vecinas) a 7,7 s («Inicio → Por qué develOP»); después, de 1,2 a 2,4 s, y desde el encastre avanzado lo
// mismo que desde el pie en reposo. La causa (leída en la historia): NOCTURNO FINAL A2 (fa0a9ca5) cambió la duración fija
// de 2,6 s por una velocidad con tope (4,5 pantallas por segundo, hasta 7 s), contada en px crudos (el túnel estirado de
// escritorio suma ~0,9 s a cada viaje que lo cruza), y un tope por cuadro sin devolución.
const efectoP2 = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
const planP2 = sinComentarios(leer('_lib/escena/planDelViaje.ts'))
const distanciaBien = (ef: string, pl: string): boolean =>
  ef.includes('const duracionMs = duracionDelViaje(pantallasDelViaje(destinoEnPx))') && /export function pantallasDelViaje\(y1: number\): number \{[\s\S]*?medidaSinElEstiramiento\(y0,[\s\S]*?medidaSinElEstiramiento\(y1,/.test(pl) &&
  !/fin|final/i.test(ef.slice(ef.indexOf('const duracionMs ='), ef.indexOf('const duracionMs =') + 80))
afirmar(distanciaBien(efectoP2, planP2), 'la duración sale de la distancia de la escena (sin el túnel estirado), la misma desde el pie en reposo que desde el encastre avanzado')
controlPositivo('el detector VE la distancia en px crudos (con el túnel estirado)', [efectoP2.replace('duracionDelViaje(pantallasDelViaje(destinoEnPx))', 'duracionDelViaje((destinoEnPx - window.scrollY) / window.innerHeight)'), planP2] as const, ([ef, pl]: readonly [string, string]) => distanciaBien(ef, pl))

// UN SOLO RELOJ: el scroll (Lenis o el motor sin Lenis) y la vuelta del final leen el mismo (`relojDelCuadro`): el de pared,
// con el tope de A2 por cuadro en un viaje (un tirón no salta), pero lo retenido se devuelve después: el viaje dura lo que
// pidió aunque haya cuadros largos. Se simula un viaje de 2 s a 60 cuadros con dos tirones de 120 ms.
type RelojP2 = (t: number) => number
const conTirones = (reloj: RelojP2): { final: number; pasoMax: number } => {
  let t = 1_000_000
  reloj(t)
  const inicio = reloj(t)
  let [antes, pasoMax] = [inicio, 0]
  for (let i = 1; i <= 140; i += 1) {
    t += i === 30 || i === 70 ? 120 : 1000 / 60
    const r = reloj(t)
    pasoMax = Math.max(pasoMax, r - antes)
    antes = r
  }
  return { final: antes - inicio, pasoMax }
}
const relojBien = (reloj: RelojP2, pared: number): boolean => {
  const r = conTirones(reloj)
  return Math.abs(r.final - pared) < 1 && r.pasoMax <= TOPE_DEL_CUADRO_DEL_VIAJE_MS + 1e-9
}
const PARED_P2 = 138 * (1000 / 60) + 2 * 120
const soltarP2 = sostenerElReloj()
const relojP2 = conTirones(relojDelCuadro)
afirmar(relojBien(relojDelCuadro, PARED_P2), '  el reloj del viaje: un tirón avanza a lo sumo el tope y lo retenido se devuelve; al final, el de pared', `${relojP2.final.toFixed(0)} ms de ${PARED_P2.toFixed(0)} · el paso más largo ${relojP2.pasoMax.toFixed(0)} ms`)
let paredA2 = -1
let [suaveA2] = [0]
const relojDeA2: RelojP2 = (t) => {
  if (paredA2 < 0) {
    paredA2 = t
    suaveA2 = t
    return t
  }
  suaveA2 += Math.min(t - paredA2, TOPE_DEL_CUADRO_DEL_VIAJE_MS)
  paredA2 = t
  return suaveA2
}
controlPositivo('  el detector VE el reloj de A2 (sin devolver: cada tirón alarga el viaje)', relojDeA2, (r: RelojP2) => relojBien(r, PARED_P2))
soltarP2()
// Lo que pasó sin cuadros antes del viaje (abajo de 1024, con la escena suspendida, nadie avanza el reloj) no es deuda del
// viaje: medido a 390, los viajes desde Tu panel duraban la mitad (de 0,7 a 1 s) hasta que el click alcanzó la pared.
const pausaBien = (): boolean => {
  const ahoraReal = performance.now
  let t = 2_000_000
  Object.defineProperty(performance, 'now', { value: () => t, configurable: true })
  try {
    relojDelCuadro(t)
    t += 5000
    empezarElViaje({ destino: 'hero', clase: 'dia-a-dia', luz: null, duracionMs: 2000 })
    for (let i = 0; i < 60; i += 1) {
      t += 1000 / 60
      relojDelCuadro(t)
    }
    const s = segundosDelViaje()
    terminarElViaje()
    return Math.abs(s - 1) < 0.02
  } finally {
    Object.defineProperty(performance, 'now', { value: ahoraReal, configurable: true })
  }
}
afirmar(pausaBien(), '  una pausa sin cuadros antes del click no es deuda: un segundo de viaje dura un segundo')

const cuadroP2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const lenisP2 = sinComentarios(leer('_componentes/ScrollSuaveDeV3.tsx'))
const sinLenisP2 = sinComentarios(leer('_componentes/viajeSinLenis.ts'))
const unRelojBien = (c: string): boolean =>
  c.includes('enElViajeS: enElViaje() }, dt)') && /function enElViaje\(\): number \{\s*const marca = document\.timeline\.currentTime\s*relojDelCuadro\(typeof marca === 'number' \? marca : performance\.now\(\)\)\s*return segundosDelViaje\(\)/.test(c) &&
  lenisP2.includes('lenis.raf(relojDelCuadro(tiempo))') && sinLenisP2.includes('const t = Math.min(1, (relojDelCuadro(tiempo) - inicio) / duracionMs)')
afirmar(unRelojBien(cuadroP2), '  y lo leen los tres: Lenis, el motor sin Lenis y la vuelta del final (la cámara del recorrido no se adelanta)')
controlPositivo('  el detector VE el final con el `delta` de su cuadro (su propio reloj)', cuadroP2.replace('enElViajeS: enElViaje() }, dt)', '}, dt)'), unRelojBien)

// EL REPARTO: la curva del viaje se aplica al COSTO (lo que recorre la escena más lo que gira la cámara de la coreografía), no
// a los px: donde la cámara gira, más tiempo; donde la sala apenas cambia, menos. Mismas puntas, monótona. Medido a 1440: el
// giro más grande por cuadro bajó de 16° a 9,6° (los viajes desde Tu panel); el costo, hasta 1,5 pantallas por cuadro en los
// tramos quietos de los viajes más largos.
const MUESTRAS_P2: MuestrasDelViaje = { pantallas: Array.from({ length: 10 }, () => 1), grados: [0, 0, 0, 60, 60, 0, 0, 0, 0, 0] }
const tiempoEnElGiro = (curva: Curva): number => {
  // La fracción del tiempo que pasa entre el 30 % y el 50 % de la distancia (donde gira).
  let [entra, sale] = [-1, -1]
  for (let i = 0; i <= 1000; i += 1) {
    const f = curva(i / 1000)
    if (entra < 0 && f >= 0.3) entra = i / 1000
    if (sale < 0 && f >= 0.5) sale = i / 1000
  }
  return sale - entra
}
const repartoBien = (f: typeof curvaRepartida): boolean => {
  const base: Curva = (t) => t
  const c = f(MUESTRAS_P2, base)
  let monotona = true
  for (let i = 1; i <= 100; i += 1) if (c(i / 100) < c((i - 1) / 100) - 1e-12) monotona = false
  return c(0) === 0 && c(1) === 1 && monotona && tiempoEnElGiro(c) > 0.2 + 0.1 && f({ pantallas: [1, 1], grados: [0, 0] }, base)(0.5) === 0.5
}
afirmar(repartoBien(curvaRepartida), '  el viaje se reparte por lo que se ve cambiar: donde la cámara gira, más tiempo (con la curva del viaje encima, las mismas puntas)', `en el giro: ${(tiempoEnElGiro(curvaRepartida(MUESTRAS_P2, (t) => t)) * 100).toFixed(0)} % del tiempo para el 20 % del camino`)
controlPositivo('  el detector VE la curva sin repartir (el giro en su 20 % del tiempo)', ((_m: MuestrasDelViaje, base: Curva) => base) as typeof curvaRepartida, repartoBien)
afirmar(efectoP2.includes('const curva = curvaDelViaje(destinoEnPx, CURVA_DEL_VIAJE)') && efectoP2.includes('easing: curva') && /viajarSinLenis\(\s*destinoEnPx,\s*duracionMs,\s*curva,/.test(efectoP2), '  y la usan los dos motores (Lenis y el sin Lenis)')

// EL AMANECER: en un viaje que cambia de luz y llega a él (de la noche de Portfolio a «Por qué develOP»), se completa ADENTRO
// del viaje, con su reloj (de cero al día entero, como el de día a día); antes quedaba quieto y saltaba al terminar (a 390, de
// 0 a 0,85 en un cuadro, medido). Medido después: 0 → 1 en el viaje, entero al llegar y sostenido.
const amanecerBien = (f: typeof completoDelViaje): boolean => {
  const dura = 2
  let monotona = true
  for (let i = 1; i <= 100; i += 1) if (f((i * dura) / 100, dura) < f(((i - 1) * dura) / 100, dura) - 1e-12) monotona = false
  return f(0, dura) === 0 && f(AMANECER_EN_EL_VIAJE.desdeS, dura) === 0 && f(dura, dura) === 1 && f(dura + 1, dura) === 1 && monotona && f(dura / 2 + AMANECER_EN_EL_VIAJE.desdeS / 2, dura) > 0.4
}
const amanecerTsx = sinComentarios(leer('_lib/escena/amanecer/Amanecer.tsx'))
afirmar(amanecerBien(completoDelViaje) && amanecerTsx.includes('const activo = (!cambiaDeLuz && (enLaLlegada ?? DIA_DEL_FINAL.activo)) || llegaAlAmanecer') && amanecerTsx.includes('m.avance = completoDelViaje(segundosDelViaje(), viaje.duracionMs / 1000)') && amanecerTsx.includes('m.entero = true'),
  '  el amanecer de un viaje que cambia de luz y llega a él se completa adentro del viaje (después del preludio, con la curva simétrica) y queda entero al llegar')
controlPositivo('  el detector VE el amanecer quieto durante el viaje (el salto al terminar)', ((s: number, d: number) => (s >= d ? 1 : 0)) as typeof completoDelViaje, amanecerBien)

// EL ≠ DE QUIÉNES SOMOS: llega con la misma función que el titular (su entrada, P1 con el rango de la máscara, pura del
// scroll): en un viaje se desarma como los demás y sus rayas crecen con la llegada. Antes no tenía llegada y se dibujaba con
// cualquier raya empezada: desde el menú aparecía en el viaje, ~0,5 s antes que el titular (medido por screencast).
const quienes = sinComentarios(leer('_secciones/quienes-somos/QuienesSomos.tsx'))
const signo3d = sinComentarios(leer('_secciones/quienes-somos/titular3d.tsx'))
const titulos3d = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const signoBien = (q: string, t3: string, tv: string): boolean =>
  /rango=\{GEOMETRIA\.rangoDeLaMascara\}[\s\S]{0,260}\{\(entradaDelSigno\) => \(\s*<Bloque patron="P1" rango="ventana-del-trazo">\s*\{\(progresoDelSigno\) => <SignoDeVolumen progreso=\{progresoDelSigno\} entrada=\{entradaDelSigno\} \/>\}/.test(q) &&
  t3.includes("id: 'agencia-signo', texto: '', fuente: 'chivo-400', gesto: 'letras', llegada: entrada,") &&
  tv.includes('if (a.sinLetras) a.uniforms.uTrazos.value.multiplyScalar(llegada * (1 - salida))') && tv.includes('a.malla.visible = a.sinLetras ? conRaya && llegada > 0 && salida < 1 : llegada > 0 && salida < 1')
afirmar(signoBien(quienes, signo3d, titulos3d), '  el ≠ llega con el titular (su misma función de llegada, pura del scroll) y en un viaje se desarma como los demás')
controlPositivo('  el detector VE el ≠ sin llegada (el de antes: aparecía en el viaje)', [quienes, signo3d.replace("gesto: 'letras', llegada: entrada,", "gesto: 'letras', llegada: null,"), titulos3d] as const, ([q, t3, tv]: readonly [string, string, string]) => signoBien(q, t3, tv))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El velo del texto de Trabajos sin rectángulo (abajo de 1024): una elipse que se desvanece; `?velo=escena`, en el logo')

// Antes (P12): el velo era el fondo del párrafo con una sombra de caja: «se nota el rectángulo» (bordes rectos arriba y a la
// izquierda, la captura del humano). Ahora, por defecto, un PSEUDO-ELEMENTO detrás del texto con un `radial-gradient`
// (`closest-side`): entero en el medio y desvanecido muy por fuera del bloque (la caja del pseudo-elemento es 1,9 veces el
// ancho del texto y 2,8 veces su alto), sin fondo ni sombra de caja en el texto. Con `?velo=escena`, sin capa del DOM: el
// sombreador del logo baja su luminancia en una elipse de pantalla del mismo tamaño detrás de cada texto.
const bandaP3 = leer('_estilos/banda.css')
const enLaBandaP3 = (css: string): string => css.slice(css.indexOf('@media (width < 1024px) {'), css.indexOf('/* ── HOVER DONDE HAY'))
const veloEliptico = (css: string): boolean => {
  const b = enLaBandaP3(css)
  const alcance = /--alcance-del-velo: -(\d+)% -(\d+)%;/.exec(b)
  const regla = /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p::before,\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \[data-pieza='texto'\]::before \{\s*content: '';\s*position: absolute;\s*inset: var\(--alcance-del-velo\);\s*z-index: -1;\s*pointer-events: none;\s*background: var\(--degrade-del-velo\);/.exec(b)
  const degrade = /--degrade-del-velo: radial-gradient\(closest-side, var\(--velo-sobre-la-escena\) (\d+)%, transparent\);/.exec(b)
  const sinCaja = !/background-color: var\(--velo-sobre-la-escena\)|box-shadow: var\(--sombra-del-velo\)|--sombra-del-velo/.test(css)
  const posicion = /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p,\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \[data-pieza='texto'\] \{\s*position: relative;\s*\}/.test(b)
  return alcance !== null && Number(alcance[1]) >= 80 && Number(alcance[2]) >= 40 && regla !== null && degrade !== null && Number(degrade[1]) <= 60 && sinCaja && posicion
}
afirmar(veloEliptico(bandaP3), 'el velo es una elipse detrás del texto (un pseudo-elemento con un degradé radial, `closest-side`) que se desvanece muy por fuera del bloque: sin fondo ni sombra de caja (ningún borde recto)')
const RECTANGULO_DE_P12 = bandaP3.replace(/\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p::before,[\s\S]*?\}\n/, "[data-v3] [data-panel='trabajos'] [data-pieza='cartel'] p { background-color: var(--velo-sobre-la-escena); box-shadow: var(--sombra-del-velo); }\n")
controlPositivo('el detector VE el velo de P12 (el fondo con su sombra de caja: el rectángulo)', RECTANGULO_DE_P12, veloEliptico)

// [PULIDO 3] A1 · cambió por pedido: el velo del DOM quedó aprobado y la otra lectura (`?velo=escena`, el logo oscurecido en
// una elipse) se BORRÓ: ni la prueba, ni su componente (`VeloEnElLogo.tsx`, `veloDelTexto.ts`), ni su regla de la hoja.
const luzDelLogoP3 = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const sinVeloEscena = (css: string, luz: string): boolean => !('velo' in ENTORNO.pruebas) && !luz.includes('VeloEnElLogo') && !enLaBandaP3(css).includes("data-velo='escena'") && !existsSync(`${V3}/_lib/escena/veloDelTexto.ts`)
afirmar(sinVeloEscena(bandaP3, luzDelLogoP3), '  `?velo=escena` ya no existe (ni la prueba, ni el velo en el logo, ni su regla): queda el velo del DOM')
controlPositivo('  el detector VE el velo en el logo de PULIDO 2', [bandaP3, `${luzDelLogoP3} <VeloEnElLogo logoMaterialRef={props.logoMaterialRef} />`] as const, ([c, l]: readonly [string, string]) => sinVeloEscena(c, l))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La luz sale de ABAJO del piso, por las juntas: los bloques se separan, a alturas distintas, sin tapas blancas')

// El brillo de PULIDO 1 (las tapas a blanco) se rechazó: «no entendiste mi concepto». Ahora, después del encastre, los bloques
// con energía se encienden desde abajo (`final/luzDeAbajo.ts`): se separan un poco y quedan a alturas distintas; por las
// rendijas se ve un plano que brilla al pie de los bloques; los costados reciben la luz desde su base y los cantos la atrapan;
// las tapas NO se blanquean. [PULIDO 3] A1 · cambió por pedido: de UN sector (zonas que nacen, viven y mueren) a TODA la
// escena (un campo continuo); lo nuevo lo fija `s54-pulido-3` A1. Acá sigue lo que se aprobó de la luz.
const L4 = LUZ_DE_ABAJO
const LADO4 = PISO_VIVO.lado
const f4 = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const sombreadoresDelPiso4 = (() => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)].join('\n'), vertexShader: '#include <common>\nvAlto = transformed.y;', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return { dibujo: sombreador.fragmentShader, vertice: sombreador.vertexShader, uniformes: sombreador.uniforms }
})()
const juntas4 = sombreadoresDelPiso4.dibujo.slice(sombreadoresDelPiso4.dibujo.indexOf('vec3 conLasJuntas('), sombreadoresDelPiso4.dibujo.indexOf('vec2 mascaraDelHueco('))

// Las TAPAS no se blanquean: en la tapa sólo brilla el canto que da a una rendija (cae en ~0,04 u: en el medio de la tapa,
// nada) y la tapa queda apenas más en sombra; la luz de los COSTADOS es la más fuerte y nace en su base (donde se abre la
// rendija, a la altura del vecino) y se apaga hacia arriba. Nunca un `mix` del color hacia el blanco. [PULIDO 3] A1 · la
// sombra de la tapa, con la energía hasta 1 (con las ondas pasa de 1); lo que se suma es la luz por la junta (`junta`).
const tapaBien = (g: string): boolean => {
  const canto = /luz = ([0-9.]+) \* exp\( - min\( borde\.x, borde\.y \) \/ ([0-9.]+) \);/.exec(g)
  const costado = /if \( vTapa < 0\.5 \) \{\s*luz = ([0-9.]+) \* exp\( - max\( 0\.0, vAlto - vVecino \) \/ ([0-9.]+) \);/.exec(g)
  const sombra = /color \*= 1\.0 - ([0-9.]+) \* min\( s, 1\.0 \);/.exec(g)
  if (canto === null || costado === null || sombra === null) return false
  const enElMedioDeLaTapa = Number(canto[1]) * Math.exp(-(LADO4 / 2) / Number(canto[2]))
  const unoMasArriba = Math.exp(-1 / Number(costado[2]))
  return enElMedioDeLaTapa < 0.01 && Number(canto[1]) < Number(costado[1]) && Number(costado[1]) >= 1 && unoMasArriba < 0.1 && Number(sombra[1]) > 0 && !/mix\( color, vec3\(/.test(g) &&
    g.includes('float junta = brilloDeLaJunta( vPiso.xz, uTiempo ) * s;') && g.includes('return color + vec3( luz * junta );')
}
afirmar(tapaBien(juntas4), 'las tapas no se blanquean: en la tapa sólo el canto que da a la rendija (en su medio, nada) y un poco más de sombra; los costados reciben la luz desde su base y se apagan hacia arriba', `canto ${String(L4.canto)} · costado ${String(L4.costado)} (cae en ${String(L4.caeEn)} u) · sombra de la tapa ${String(L4.sombraDeLaTapa)}`)
controlPositivo('el detector VE las tapas blancas de PULIDO 1', juntas4.replace('return color + vec3( luz * junta );', 'return mix( color, vec3( 1.0 ), s );'), tapaBien)
controlPositivo('  y un canto que ocupa la tapa entera', juntas4.replace(/(luz = [0-9.]+ \* exp\( - min\( borde\.x, borde\.y \) \/ )[0-9.]+( \);)/, '$10.5$2'), tapaBien)
controlPositivo('  y un costado parejo (sin nacer en la base)', juntas4.replace(/(if \( vTapa < 0\.5 \) \{\s*luz = [0-9.]+ \* exp\( - max\( 0\.0, vAlto - vVecino \) \/ )[0-9.]+( \);)/, '$19.0$2'), tapaBien)

// Los bloques con energía SE SEPARAN un poco (en el vértice: se achican sobre su centro, cada uno distinto: las rendijas no
// son todas iguales) y quedan A ALTURAS DISTINTAS (en la simulación: un azar por bloque, de abajo y de arriba del resto). Sin
// energía, nada cambia: los bloques siguen pegados y tapan el plano. [PULIDO 3] A1 · la energía del bloque la lee el vértice
// de la simulación (el canal libre de su textura), y con las ondas pasa de 1 (la separación, hasta 1,6).
const sim4 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const separaBien = (v: string, sim: string): boolean => {
  const achica = new RegExp(`transformed\\.xz \\*= 1\\.0 - ${f4(2 * L4.separa).replace('.', '\\.')} \\* min\\( vEnergiaDelBloque, 1\\.6 \\) \\* \\( ([0-9.]+) \\+ ([0-9.]+) \\* azarDeLaLuz\\( floor\\( centro / uLado \\) \\+ [0-9.]+ \\) \\);`).exec(v)
  const alturas = /float h = min\( e, 1\.4 \) \* mix\( (-?[0-9.]+), (-?[0-9.]+), azarDeLaLuz\( celda \+ [0-9.]+ \) \);/.exec(sim)
  if (achica === null || alturas === null) return false
  return L4.separa >= 0.02 && L4.separa <= 0.08 && Number(achica[1]) > 0.2 && Math.abs(Number(achica[1]) + Number(achica[2]) - 1) < 1e-9 && v.includes('vEnergiaDelBloque = texelFetch( uAlturas, celda, 0 ).a;') &&
    Number(alturas[1]) < 0 && Number(alturas[2]) > 0 && Number(alturas[2]) - Number(alturas[1]) >= 0.3 && sim.includes('dibujo += alturaDeLaLuz( xz, energiaAqui );')
}
afirmar(separaBien(sombreadoresDelPiso4.vertice, sim4), '  con energía los bloques se separan un poco (cada rendija de su ancho) y quedan a alturas distintas (más abajo y más arriba que el resto)', `separa ${String(L4.separa)} del lado por costado · alturas ${String(L4.alturas[0])} a +${String(L4.alturas[1])} u`)
controlPositivo('  el detector VE los bloques pegados', [sombreadoresDelPiso4.vertice.replace(/transformed\.xz \*= [^;]+;/, ''), sim4] as const, ([v, s]: readonly [string, string]) => separaBien(v, s))
controlPositivo('  y todos a la misma altura', [sombreadoresDelPiso4.vertice, sim4.replace('dibujo += alturaDeLaLuz( xz, energiaAqui );', '')] as const, ([v, s]: readonly [string, string]) => separaBien(v, s))

// El PLANO que brilla debajo: al pie de los bloques (apenas sobre el fondo del zócalo), blanco donde hay energía (donde no,
// descartado: nada que tape); sin tono (el blanco llega blanco). Sin bloom en ningún archivo del final: el resplandor es falso
// y local. [PULIDO 3] A1 · la energía la lee de la simulación (`energiaEnElPiso`); antes, del sector con su resplandor.
const plano4 = crearElPlanoDeLaLuz(PISO_VIVO.radioDeReferencia - 1)
const materialDelPlano4 = plano4.material instanceof THREE.ShaderMaterial ? plano4.material : null
const finalDir4 = `${V3}/_lib/escena/final`
const delFinal4 = readdirSync(finalDir4).filter((a) => /\.tsx?$/.test(a)).map((a) => sinComentarios(readFileSync(`${finalDir4}/${a}`, 'utf8')))
const planoBien = (p: THREE.Mesh, m: THREE.ShaderMaterial | null, fuentesDelFinal: readonly string[]): boolean =>
  m !== null && Math.abs(p.position.y - (FLOOR_Y - PISO_VIVO.zocalo + 0.02)) < 1e-9 && m.fragmentShader.includes('if ( luz <= 0.002 ) discard;') &&
  m.fragmentShader.includes(`gl_FragColor = vec4( vec3( ${f4(L4.plano)} * luz ), 1.0 );`) && m.fragmentShader.includes('float e = energiaEnElPiso( vXZ );') && !m.toneMapped &&
  fuentesDelFinal.every((s) => !/Bloom|EffectComposer|UnrealBloomPass/.test(s))
afirmar(planoBien(plano4, materialDelPlano4, delFinal4), '  por las rendijas se ve un plano blanco al pie de los bloques, donde hay energía; sin bloom en el final', `a ${String(PISO_VIVO.zocalo - 0.02)} u bajo el ras`)
controlPositivo('  el detector VE el bloom global', [plano4, materialDelPlano4, [...delFinal4, "import { Bloom } from '@react-three/postprocessing'"]] as const, ([p, m, fu]: readonly [THREE.Mesh, THREE.ShaderMaterial | null, readonly string[]]) => planoBien(p, m, fu))
const planoArriba4 = plano4.clone()
planoArriba4.position.y = FLOOR_Y + 0.02
controlPositivo('  y un plano a ras del piso (taparía las tapas en los valles)', [planoArriba4, materialDelPlano4, delFinal4] as const, ([p, m, fu]: readonly [THREE.Mesh, THREE.ShaderMaterial | null, readonly string[]]) => planoBien(p, m, fu))
plano4.geometry.dispose()
materialDelPlano4?.dispose()

// [PULIDO 3] A1 · cambió por pedido: «el sector nace en un punto y se propaga con su vida» y «respira (el radio late mientras
// vive)» se borraron (no hay más zonas: «nada de ciclos de nacer y morir, y nunca se apaga»). Lo nuevo (el campo, la
// cobertura, la expansión desde el hueco, las ondas, la sala gradual) lo fija `s54-pulido-3` A1.

// Las CHISPAS de la referencia: [PULIDO 3] A1 · ahora de `?energia=inestable` (se borró `?chispas=si`; apagadas en el producto;
// quietas con movimiento reducido, no se crean): chicas, blancas y sumadas, y sólo se prenden donde la energía está más alta
// (son más puntos que antes, 140, porque la mayoría no se prende: la cuenta que se ve la pone la energía).
const chispas4 = crearLasChispas()
const materialDeLasChispas4 = chispas4.material instanceof THREE.ShaderMaterial ? chispas4.material : null
const finalDelPie4 = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
type Chispas4 = { readonly cuantas: number; readonly tamano: number; readonly desde: number }
const chispasBien = (c: Chispas4, m: THREE.ShaderMaterial | null, componente: string): boolean =>
  m !== null && c.cuantas <= 160 && c.tamano <= 4 && c.desde >= 0.8 && m.blending === THREE.AdditiveBlending && m.fragmentShader.includes('gl_FragColor = vec4( vec3( 1.0 ), ') &&
  /vAlfa = smoothstep\( [0-9.]+, [0-9.]+, energiaEnElPiso\( xz \) \)/.test(m.vertexShader) &&
  ENTORNO.pruebas.energia === 'no' && entornoPedido('producto,energia=inestable').pruebas.energia === 'inestable' && componente.includes("const chispas = energia === 'inestable' && !estatico ? crearLasChispas() : null")
afirmar(chispasBien(CHISPAS_DE_LA_LUZ, materialDeLasChispas4, finalDelPie4), '  las chispas, sólo con `?energia=inestable` (y nunca quietas): chicas, blancas, sumadas y sólo donde la energía está más alta', `${String(CHISPAS_DE_LA_LUZ.cuantas)} puntos de ${String(CHISPAS_DE_LA_LUZ.tamano)} px, desde la energía ${String(CHISPAS_DE_LA_LUZ.desde)}`)
controlPositivo('  el detector VE una nube de partículas', [{ ...CHISPAS_DE_LA_LUZ, cuantas: 600 }, materialDeLasChispas4, finalDelPie4] as const, ([c, m, k]: readonly [Chispas4, THREE.ShaderMaterial | null, string]) => chispasBien(c, m, k))
controlPositivo('  y las chispas en el producto', [CHISPAS_DE_LA_LUZ, materialDeLasChispas4, finalDelPie4.replace("energia === 'inestable' && !estatico ? crearLasChispas() : null", 'crearLasChispas()')] as const, ([c, m, k]: readonly [Chispas4, THREE.ShaderMaterial | null, string]) => chispasBien(c, m, k))
chispas4.geometry.dispose()
materialDeLasChispas4?.dispose()

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El CTA del final desde «Seis razones» (`?cta=capas|relevo|giro|cruce|tipo`): cada una función pura del scroll')

// La escena de prueba: los dos renglones de la frase a los dos lados del logo (escenario a 1440 × 900) y el CTA abajo, al
// centro, en su cuerpo; los seis valores, tres a cada lado. Las cuentas son las de la escena (`ctaDelFinal/variantes.ts`).
const letrasDe5 = (texto: string, x0: number, y: number, cuerpo: number, renglon: number): LetraEnPantalla[] => [...texto].map((c, i) => ({ x: x0 + i * 0.55 * cuerpo, y, cuerpo, ancho: 0.5 * cuerpo, alto: 0.7 * cuerpo, renglon, letra: c }))
const ORIGEN5 = [...letrasDe5('Seisrazones', 150, 200, 64, 0), ...letrasDe5('paraelegirnos', 900, 200, 64, 1)]
const DESTINO5 = letrasDe5('HABLANOS', 520, 520, 96, 0)
const VALORES5: CajaEnPantalla[] = [0, 1, 2, 3, 4, 5].map((k) => ({ x: k < 3 ? 260 : 1180, y: 330 + (k % 3) * 160, ancho: 220, alto: 90 }))
const ESCENA5: EscenaDeLaTransformacion = { origen: ORIGEN5, destino: DESTINO5, parejas: parejas(ORIGEN5, DESTINO5), valores: VALORES5, pantalla: { ancho: 1440, alto: 900 }, armado: 0.27 * 900 }
const posesNuevas5 = (): PosesDeLaTransformacion => ({ origen: ORIGEN5.map(nuevaPose), destino: DESTINO5.map(nuevaPose), capas: Array.from({ length: CAPAS_DEL_CTA }, nuevaPose) })
type Poses5 = typeof posesDe
const foto5 = (f: Poses5, v: VarianteDelCta, p: number, s: PosesDeLaTransformacion = posesNuevas5()): string => {
  f(v, p, ESCENA5, s)
  return JSON.stringify([s.origen, s.destino, s.capas], (_, x: unknown) => (typeof x === 'number' ? Math.round(x * 1e4) / 1e4 : x))
}
const PASOS5 = Array.from({ length: 901 }, (_, i) => i / 900)

// PURA Y REVERSIBLE: el mismo progreso da las mismas poses, vengan de donde vengan (una barrida hacia adelante y otra hacia
// atrás con las MISMAS poses reusadas), y la misma llamada dos veces da lo mismo: nada guarda estado.
const puraBien = (f: Poses5): boolean => VARIANTES_DEL_CTA.every((v) => {
  const s = posesNuevas5()
  const ida = PASOS5.map((p) => foto5(f, v, p, s))
  const vuelta = [...PASOS5].reverse().map((p) => foto5(f, v, p, s)).reverse()
  return ida.every((x, i) => x === vuelta[i] && x === foto5(f, v, PASOS5[i]))
})
afirmar(puraBien(posesDe), 'las cinco son funciones puras del progreso (que es función del scroll): reversibles, iguales a cualquier velocidad y en cualquier dirección (F2)', VARIANTES_DEL_CTA.join(' · '))
let contador5 = 0
controlPositivo('el detector VE una variante con memoria (el siguiente cuadro depende del anterior)', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  contador5 += 1
  s.destino[0].x += contador5 % 2
}) as Poses5, puraBien)

// LOS EXTREMOS: en 0 la frase en su lugar (el título de volumen la deja ahí) y el CTA sin dibujar; en 1 el CTA en su lugar,
// derecho y de su cuerpo, y la frase sin dibujar. En `capas` la frase se va como hoy (sus títulos) y el CTA es la pila.
const enSuLugar5 = (q: Pose, l: LetraEnPantalla, conZ: boolean): boolean => Math.abs(q.x - l.x) < 0.5 && Math.abs(q.y - l.y) < 0.5 && (!conZ || Math.abs(q.z) < 0.5) && Math.abs(Math.sin(q.rx)) < 1e-6 && Math.abs(Math.cos(q.rx) - 1) < 1e-6 && Math.abs(Math.cos(q.ry) - 1) < 1e-6 && Math.abs(q.escala - l.cuerpo) < 1e-6 && q.aparece === 1 && q.fino === 0
const extremosBien = (f: Poses5): boolean => VARIANTES_DEL_CTA.every((v) => {
  const s0 = posesNuevas5()
  f(v, 0, ESCENA5, s0)
  const s1 = posesNuevas5()
  f(v, 1, ESCENA5, s1)
  const caja = cajaDe(DESTINO5)
  if (v === 'capas') return s0.capas.every((q) => q.aparece === 0) && s0.origen.every((q) => q.aparece === 0) && s1.capas.every((q) => Math.abs(q.x - caja.x) < 0.5 && Math.abs(q.y - caja.y) < 0.5 && Math.abs(q.z) < 0.5 && q.rx === 0 && Math.abs(q.ry) < 1e-9 && q.aparece === 1)
  return s0.origen.every((q, i) => enSuLugar5(q, ORIGEN5[i], true)) && s0.destino.every((q) => q.aparece === 0) && s1.destino.every((q, j) => enSuLugar5(q, DESTINO5[j], true)) && s1.origen.every((q) => q.aparece === 0)
})
afirmar(extremosBien(posesDe), '  en 0, la frase en su lugar y el CTA sin dibujar; en 1, el CTA en su lugar (derecho, de su cuerpo, en el peso de siempre) y la frase sin dibujar (en `capas`, la pila entera)')
controlPositivo('  el detector VE un CTA que termina corrido', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  for (const q of s.destino) q.y += p >= 1 ? 30 : 0
  for (const q of s.capas) q.y += p >= 1 ? 30 : 0
}) as Poses5, extremosBien)

// SIN SALTOS: de un px de scroll al siguiente (la ventana mide ~900 px), una pieza que se ve en los dos cuadros y está en la
// pantalla no se mueve más que esto (px). (En `cruce`, lo que se agranda alrededor de la «o» sale de la pantalla rápido:
// fuera de ella no cuenta.)
const SALTO5 = 40
const sinSaltos = (f: Poses5): boolean => VARIANTES_DEL_CTA.every((v) => {
  let antes: PosesDeLaTransformacion | null = null
  for (const p of PASOS5) {
    const s = posesNuevas5()
    f(v, p, ESCENA5, s)
    if (antes !== null) {
      const previo: PosesDeLaTransformacion = antes
      for (const k of ['origen', 'destino', 'capas'] as const) {
        const salto = s[k].some((q, i) => {
          const a = previo[k][i]
          const adentro = (r: Pose): boolean => r.x > 0 && r.x < 1440 && r.y > 0 && r.y < 900 && r.aparece > 0
          return adentro(q) && adentro(a) && Math.hypot(q.x - a.x, q.y - a.y) > SALTO5
        })
        if (salto) return false
      }
    }
    antes = s
  }
  return true
})
afirmar(sinSaltos(posesDe), '  sin saltos: de un px de scroll al siguiente ninguna pieza a la vista se mueve más de 40 px', `${String(SALTO5)} px`)
controlPositivo('  el detector VE un CTA que salta a su lugar en la mitad', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  if (p > 0.5) for (const [j, q] of s.destino.entries()) Object.assign(q, { x: DESTINO5[j].x, y: DESTINO5[j].y })
}) as Poses5, sinSaltos)

// EL TEXTO QUE ACOMPAÑA AL CTA llega cuando el CTA ya está en su lugar (en las cinco, antes de 0,9): nada le pasa por encima.
const textoBien = (f: Poses5): boolean => llegadaDelTexto(TRANSFORMACION.texto.desde) === 0 && llegadaDelTexto(1) === 1 && VARIANTES_DEL_CTA.every((v) => [TRANSFORMACION.texto.desde, 0.95].every((p) => {
  const s = posesNuevas5()
  f(v, p, ESCENA5, s)
  const caja = cajaDe(DESTINO5)
  return v === 'capas' ? s.capas.every((q) => Math.abs(q.y - caja.y) < 1) : s.destino.every((q, j) => Math.abs(q.x - DESTINO5[j].x) < 1 && Math.abs(q.y - DESTINO5[j].y) < 1 && q.aparece === 1)
}))
afirmar(textoBien(posesDe), '  el texto que acompaña al CTA («Este sitio empezó con una charla. El tuyo también.») llega recién con el CTA en su lugar', `desde ${String(TRANSFORMACION.texto.desde)}`)
controlPositivo('  el detector VE un CTA que todavía vuela cuando llega el texto', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p * 0.9, e, s)
}) as Poses5, textoBien)

// RELEVO: un cartel de aeropuerto en 3D: cada letra de la frase gira sobre X (en cascada de izquierda a derecha) y su cara de
// atrás es la del CTA (se ven una o la otra, nunca las dos, y el cambio es de canto); las que sobran se acuestan y se van.
const relevoBien = (f: Poses5): boolean => {
  const giraEn = ORIGEN5.map((_, i) => PASOS5.find((p) => {
    const s = posesNuevas5()
    f('relevo', p, ESCENA5, s)
    return Math.abs(s.origen[i].rx) > 1e-4
  }) ?? 2)
  const enOrden = ORIGEN5.map((l, i) => [l.x, giraEn[i]] as const).sort((a, b) => a[0] - b[0]).every(([, t], i, arr) => i === 0 || t >= arr[i - 1][1])
  const pareja = new Map(ESCENA5.parejas.map((i, j) => [i, j]))
  let unaUOtra = true
  let seAcuestan = true
  for (const p of PASOS5) {
    const s = posesNuevas5()
    f('relevo', p, ESCENA5, s)
    for (const [i, j] of pareja) {
      const [o, d] = [s.origen[i], s.destino[j]]
      if (o.aparece > 0 && d.aparece > 0) unaUOtra = false
      if (d.aparece > 0 && p < 0.6 && Math.abs(Math.cos(d.rx)) > 0.999 && Math.cos(d.rx) < 0) unaUOtra = false
    }
    if (p === 1) seAcuestan = ORIGEN5.every((_, i) => pareja.has(i) || (Math.abs(s.origen[i].rx + Math.PI / 2) < 1e-6 && s.origen[i].aparece === 0))
  }
  return enOrden && unaUOtra && seAcuestan && new Set(ESCENA5.parejas).size === DESTINO5.length && ESCENA5.parejas.every((i) => i >= 0)
}
afirmar(relevoBien(posesDe), '  relevo · cada letra gira sobre X en cascada de izquierda a derecha y en su cara de atrás está la del CTA (una o la otra, el cambio de canto); las que sobran se acuestan y se van')
controlPositivo('  el detector VE las dos caras a la vez (la del CTA aparece antes del canto)', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  for (const q of s.destino) if (p > 0.1) q.aparece = 1
}) as Poses5, relevoBien)

// GIRO: la frase se junta en un cartel de dos caras que gira sobre Y; en la mitad del giro todo está de canto (una línea:
// cada letra en el eje del cartel) y del otro lado está el CTA.
const giroBien = (f: Poses5): boolean => {
  const G = TRANSFORMACION.giro
  const medio = PASOS5.find((p) => p >= G.desde + G.gira / 2) ?? 1
  const s = posesNuevas5()
  f('giro', medio, ESCENA5, s)
  const eje = cajaDe(DESTINO5).x
  // La cara de atrás está corrida el espesor del cartel: de canto, las dos son la misma línea gruesa.
  const deCanto = [...s.origen, ...s.destino].every((q) => Math.abs(Math.cos(q.ry)) < 0.04 && Math.abs(q.x - eje) < 8 + G.espesor * DESTINO5[0].cuerpo)
  const s1 = posesNuevas5()
  f('giro', G.desde + G.gira, ESCENA5, s1)
  return deCanto && s1.destino.every((q) => q.aparece === 1 && Math.abs(Math.cos(q.ry) - 1) < 1e-6) && s1.origen.every((q) => q.aparece === 0)
}
afirmar(giroBien(posesDe), '  giro · la frase se junta en un cartel de dos caras que gira sobre Y: en la mitad del giro sólo se ve el canto (una línea) y del otro lado está el CTA')
controlPositivo('  el detector VE un cartel que se funde en vez de girar', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  for (const q of [...s.origen, ...s.destino]) q.ry = 0
}) as Poses5, giroBien)

// CRUCE: la frase se extruye hacia la cámara (su espesor crece, con un tope en la pantalla) y se agranda alrededor de la
// contraforma de la «o» hasta que la cubre entera; el CTA se ve recién cuando la contraforma lo contiene, y la frase se va
// cuando la cámara pasó del otro lado.
const cruceBien = (f: Poses5): boolean => {
  const X = TRANSFORMACION.cruce
  const o = ORIGEN5.findIndex((l) => l.letra === 'o')
  const radio = X.contraforma * ORIGEN5[o].ancho
  const caja = cajaDe(DESTINO5)
  let monotono = true
  let previo = 0
  let revelaBien = true
  let tope = true
  for (const p of PASOS5) {
    const s = posesNuevas5()
    f('cruce', p, ESCENA5, s)
    const zoom = s.origen[o].escala / ORIGEN5[o].cuerpo
    if (zoom < previo - 1e-9) monotono = false
    previo = zoom
    if (s.destino.some((q) => q.aparece > 0) && radio * zoom < 0.8 * Math.hypot(caja.ancho, caja.alto) / 2) revelaBien = false
    if (s.origen.some((q, i) => q.aparece > 0 && 0.14 * q.escala * q.profundidad > 0.14 * ORIGEN5[i].cuerpo * X.profundo * X.topeDelEspesor + 1e-6)) tope = false
  }
  const s15 = posesNuevas5()
  f('cruce', X.extruye, ESCENA5, s15)
  return monotono && revelaBien && tope && s15.origen.every((q) => q.profundidad >= X.profundo - 1e-6) && zoomDelCruce(1, radio, ESCENA5.pantalla) * radio >= X.cubre * Math.hypot(1440, 900)
}
afirmar(cruceBien(posesDe), '  cruce · la frase se extruye hacia la cámara y se agranda alrededor de la contraforma de la «o» hasta cubrir la pantalla; el CTA se ve recién cuando la contraforma lo contiene')
controlPositivo('  el detector VE el CTA a la vista antes de que la «o» lo contenga', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  for (const q of s.destino) q.aparece = Math.max(q.aparece, p > 0.2 ? 1 : 0)
}) as Poses5, cruceBien)

// TIPO: la fuente ES variable (Archivo y Chivo, `wght` de 100 a 900): los dos pesos de cada glifo tienen los mismos
// contornos (comandos iguales, verificado en sus JSON), así que la misma triangulación sirve para los dos y la escena
// deforma el peso vértice a vértice. Cada letra se afina hasta el 100 mientras viaja, se cambia por la del CTA en ese peso
// (el cambio, con las dos en el hilo) y la del CTA engorda hasta el suyo.
const comandos5 = (datos: { readonly glyphs: Readonly<Record<string, { readonly o?: string } | undefined>> }, c: string): string => (datos.glyphs[c]?.o ?? '').split(' ').filter((x) => /^[a-z]$/.test(x)).join('')
const mismosContornos = [...new Set('HABLANOS')].every((c) => comandos5(ARCHIVO_700, c) !== '' && comandos5(ARCHIVO_700, c) === comandos5(ARCHIVO_100, c)) && [...new Set('Seisrazonesparaelegirnos')].every((c) => comandos5(CHIVO_400, c) !== '' && comandos5(CHIVO_400, c) === comandos5(CHIVO_100, c))
const conDosPesos = letrasConDosPesos(new Font(ARCHIVO_700 as FontData), new Font(ARCHIVO_100 as FontData), 'HABLANOS', null)
const morfoBien = conDosPesos.letras.length === 8 && conDosPesos.letras.every((l) => l.geometria.morphAttributes.position?.[0]?.count === l.geometria.getAttribute('position').count)
const tipoBien = (f: Poses5): boolean => {
  let cambioFino = true
  for (const p of PASOS5) {
    const s = posesNuevas5()
    f('tipo', p, ESCENA5, s)
    ESCENA5.parejas.forEach((i, j) => {
      const [o, d] = [s.origen[i], s.destino[j]]
      if (o.aparece > 0.05 && o.aparece < 0.95 && (o.fino < 0.95 || d.fino < 0.95)) cambioFino = false
    })
  }
  return cambioFino && mismosContornos && morfoBien
}
afirmar(tipoBien(posesDe), '  tipo · la fuente es variable: los dos pesos con los mismos contornos (la escena deforma el peso vértice a vértice); cada letra se afina hasta el 100, se cambia por la del CTA en ese peso y engorda hasta el suyo', `${String(conDosPesos.letras.length)} letras con su peso 100 como objetivo`)
controlPositivo('  el detector VE el cambio de letra en el peso grueso (sin afinarse)', ((v: VarianteDelCta, p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(v, p, e, s)
  for (const q of [...s.origen, ...s.destino]) q.fino = 0
}) as Poses5, tipoBien)
for (const l of conDosPesos.letras) l.geometria.dispose()

// CAPAS: los seis valores se pliegan en el DOM (hasta quedar de canto, 90° sobre X) y de cada pliegue sale una capa del CTA
// (de canto, del ancho del valor) que vuela a la pila; apiladas, las seis capas SON la extrusión del CTA (sus espesores
// cubren el espesor entero, sin solaparse).
const capasDelCta5 = capasDelCta(new Font(ARCHIVO_700 as FontData), 'HABLANOS', null, CAPAS_DEL_CTA, ESPESOR_DE_LAS_CAPAS)
const tramos5 = capasDelCta5.letras.map((l) => {
  l.geometria.computeBoundingBox()
  const b = l.geometria.boundingBox ?? new THREE.Box3()
  return [b.min.z, b.max.z] as const
})
// (Con el bisel de cada capa, que asoma apenas por sus dos caras.)
const pilaBien = tramos5.length === CAPAS_DEL_CTA && tramos5.every(([a, b], k) => Math.abs(b + (k * ESPESOR_DE_LAS_CAPAS) / CAPAS_DEL_CTA) < 0.008 && Math.abs(a + ((k + 1) * ESPESOR_DE_LAS_CAPAS) / CAPAS_DEL_CTA) < 0.008)
for (const l of capasDelCta5.letras) l.geometria.dispose()
const capasBien = (f: Poses5, plegado: typeof plegadoDelValor): boolean => {
  let saleDelPliegue = true
  const vista = VALORES5.map(() => false)
  for (const p of PASOS5) {
    const s = posesNuevas5()
    f('capas', p, ESCENA5, s)
    s.capas.forEach((q, k) => {
      if (q.aparece > 0 && plegado(k, p) < 0.9) saleDelPliegue = false
      // El primer cuadro en que se ve: de canto y en el lugar de su valor.
      if (q.aparece > 0 && !vista[k] && (Math.abs(Math.cos(q.rx)) > 0.05 || Math.abs(q.x - VALORES5[k].x) > 1 || Math.abs(q.y - VALORES5[k].y) > 1)) saleDelPliegue = false
      if (q.aparece > 0) vista[k] = true
    })
  }
  return saleDelPliegue && plegado(0, 0) === 0 && plegado(5, 1) === 1 && pilaBien
}
afirmar(capasBien(posesDe, plegadoDelValor), '  capas · cada valor se pliega hasta quedar de canto y de su pliegue sale, de canto, una capa del CTA; apiladas, las seis capas son su extrusión (cubren el espesor sin solaparse)', `${String(CAPAS_DEL_CTA)} capas de ${String(ESPESOR_DE_LAS_CAPAS / CAPAS_DEL_CTA)} em`)
controlPositivo('  el detector VE capas que salen antes de que su valor se pliegue', [posesDe, (k: number, p: number) => plegadoDelValor(k, p) * 0.5] as const, ([f, g]: readonly [Poses5, typeof plegadoDelValor]) => capasBien(f, g))

// LA FUENTE Y EL MATERIAL: el CTA va en Archivo, la del registro 1 del hero (`font-display`, el mismo JSON de volumen que su
// titular), extruido con el material de los títulos de volumen (el satinado, el costado de día y el filo del dibujo de noche).
const armado5 = sinComentarios(leer('_lib/escena/ctaDelFinal/armadoDelCta.ts'))
const material5 = sinComentarios(leer('_lib/escena/ctaDelFinal/material.ts'))
const domDelCta5 = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const fuenteBien = (dom: string, armado: string, material: string): boolean =>
  /const FUENTE_DEL_CTA = 'font-display font-fuerte uppercase/.test(dom) && TIPOGRAFIA_DEL_TITULAR.startsWith('font-display ') && TIPOGRAFIA_DEL_TITULAR.includes('font-fuerte uppercase') &&
  armado.includes("import datosDeArchivo from '../../../_fuentes/archivo-700-titulos.json'") && /letrasDelRenglon\(FUENTES\.archivo, texto, posiciones\)/.test(armado) && [...'HABLANOS'].every((c) => comandos5(ARCHIVO_700, c) !== '') &&
  material.includes('roughness: SATINADO.roughness') && material.includes('costadoDeDiaGlsl(EMISION_EN_LA_NOCHE)') && material.includes('conLogoDeNoche(material, contorno') && material.includes('conElAmanecer(material)')
afirmar(fuenteBien(domDelCta5, armado5, material5), '  el CTA en la fuente del registro 1 del hero (Archivo, en mayúsculas), extruido con el material de los títulos (satinado, costado de día, filo de noche)')
controlPositivo('  el detector VE el CTA en la Chivo de la frase', [domDelCta5, armado5.replace('letrasDelRenglon(FUENTES.archivo, texto, posiciones)', 'letrasDelRenglon(FUENTES.chivo, texto, posiciones)'), material5] as const, ([d, a, m]: readonly [string, string, string]) => fuenteBien(d, a, m))

// EL CLIC, EL HOVER Y SIN BANDERA: el CTA abre Contacto (la transición de siempre, por la delegación del chrome) y se toca
// recién cuando llegó; el hover sólo con el mouse (con el dedo no hay hover). Sin `?cta=`, el CTA de hoy en las dos ramas,
// la escena no monta nada y la frase de volumen no se releva.
const porQue5 = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const perezoso5 = sinComentarios(leer('_lib/escena/PruebasDeLaEscena.tsx'))
const clicBien = (dom: string): boolean => dom.includes('data-abre-contacto="panel"') && dom.includes('href={destino}') && /ctaTocable\(p\) \? 'auto' : 'none'/.test(dom) && ctaTocable(0.96) === false && ctaTocable(0.97) && dom.includes("if (e.pointerType === 'mouse') CTA_EN_VIVO.hover = true")
afirmar(clicBien(domDelCta5), '  el clic abre Contacto con su transición de siempre (y se toca recién cuando llegó); hover sólo con el mouse (con el dedo, no)')
controlPositivo('  el detector VE un hover que también prende con el dedo', domDelCta5.replace("if (e.pointerType === 'mouse') CTA_EN_VIVO.hover = true", 'CTA_EN_VIVO.hover = true'), clicBien)
const deHoyBien = (f: string, m: string): boolean =>
  ENTORNO.pruebas.cta === 'no' && entornoPedido('producto,cta=a').pruebas.cta === 'no' && f.includes('{variante === null ? <CtaEnElEscenario pin={pin} /> : <CtaTransformado progreso={transformacion} claseDelTexto={TAMANO_DEL_CTA} alEnfocar={llevarAlCta} />}') &&
  f.includes('<CtaEnlace href={CTA.destino} rotulo={CTA.rotulo} />') && f.includes('<CtaEnlace href={CTA.destino} rotulo={CTA.rotulo} mezcla />') && f.includes('{variante !== null ? (') && !f.includes('abreElContacto={variante') &&
  m.includes('const conElCta = varianteDelCta() !== null') && /\{conElCta && \(\s*<Suspense fallback=\{null\}>\s*<EscenaDelCta /.test(m)
afirmar(deHoyBien(porQue5, perezoso5), '  sin `?cta=`, el CTA de hoy en las dos ramas (su botón va al pie, como antes) y la escena no monta nada; `?cta=a` (de PULIDO 1) ya no existe')
controlPositivo('  el detector VE la escena del CTA montada siempre', perezoso5.replace(/\{conElCta && \(\s*<Suspense fallback=\{null\}>\s*<EscenaDelCta /, '{(\n<Suspense fallback={null}>\n<EscenaDelCta '), (m: string) => deHoyBien(porQue5, m))

// EL TELÉFONO Y EL MOVIMIENTO REDUCIDO: en la lista el bloque del CTA mide dos pantallas con su contenido clavado; la copia
// de la frase aparece cuando el logo ya bajó y la transformación corre en lo que queda (medido a 390 × 844). Con movimiento
// reducido, el estado final directo (1, sin recorrido) y, en escritorio, en la última pantalla de la sección: con la cámara
// en la del CTA, el logo queda abajo y no lo pisa.
const ctaLista5 = sinComentarios(leer('_secciones/por-que-develop/CtaTransformado.tsx'))
const listaBien = (dom: string, f: string): boolean =>
  progresoEnLaLista(LISTA_DEL_CTA.desde) === 0 && progresoEnLaLista(1) === 1 && entradaEnLaLista(LISTA_DEL_CTA.desde) === 1 && entradaEnLaLista(0) === 0 &&
  dom.includes("offset: ['start start', 'end end']") && dom.includes('progreso.set(quieto ? 1 : progresoEnLaLista(r))') &&
  f.includes(['min-h-[calc(var(--alto-del-cta-en-lista)', '*2)]'].join('')) && f.includes('className="sticky top-0 flex') && f.includes(['escritorio:', 'absolute escritorio:', 'inset-x-0 escritorio:', 'bottom-0'].join('')) && f.includes('className={quieto ? CON_MOVIMIENTO_REDUCIDO')
afirmar(listaBien(domDelCta5, ctaLista5), '  en el teléfono, clavado: la frase aparece con el logo ya abajo y se transforma en lo que queda; con movimiento reducido, el estado final directo, sin el CTA encima del logo')
controlPositivo('  el detector VE el estado final animado con movimiento reducido', [domDelCta5.replace('progreso.set(quieto ? 1 : progresoEnLaLista(r))', 'progreso.set(progresoEnLaLista(r))'), ctaLista5] as const, ([d, f]: readonly [string, string]) => listaBien(d, f))

// LO DE PULIDO 1 (`?cta=a|b|c|d`, rechazado) no queda: ni sus archivos, ni la placa que salía del punto del clic, ni el
// escalón del piso, ni la trama del portal.
const sinP17 = (f: (r: string) => boolean): boolean => ['_lib/escena/ctaDelFinal/PiezaDelCta.tsx', '_lib/escena/ctaDelFinal/enElPiso.ts', '_lib/escena/ctaDelFinal/estado.ts', '_lib/escena/ctaDelFinal/portal.ts'].every((r) => !f(r)) &&
  [fuentes(V3).map((r) => readFileSync(r, 'utf8')).join('\n')].every((todo) => !/data-cta-desde-el-punto|viajeDesdeElPunto|conElEscalon|conElPortal|LetrasDelCta|data-cta-variante/.test(todo))
afirmar(sinP17((r) => existsSync(`${V3}/${r}`)), '  las variantes de PULIDO 1 (`a|b|c|d`) no dejan código: ni sus archivos, ni la placa desde el punto del clic, ni el escalón del piso, ni el portal de la trama')
controlPositivo('  el detector VE un archivo de PULIDO 1 que quedó', (r: string) => r.endsWith('estado.ts'), sinP17)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Pendientes de PULIDO 1: la sombra del logo entra con fundido al salir del hueco; «CONTACTO» a 768 en AA')

// LA SOMBRA: la pose pide la sombra entera en el aire y ninguna apoyada o en el hueco; la que se ve baja con la pose y SUBE
// con un fundido. Al rebobinar, el logo sale del hueco en cinco cuadros (medido: `fin` de 0,43 a 0,35 en 67 ms, 4 u de
// subida) y la sombra aparecía de un cuadro al otro.
const TAMANO6 = { alto: 4, espesor: 0.55 }
const finas6 = Array.from({ length: 1001 }, (_, k) => k / 1000)
const poseBien6 = (f: (fin: number) => number): boolean =>
  f(0) === 1 && f(0.3) === 1 && f(0.45) === 0 && f(0.734) === 0 && f(1) === 0 && finas6.every((x, k) => f(x) >= 0 && f(x) <= 1 && (k === 0 || f(x) <= f(finas6[k - 1]) + 1e-9))
afirmar(poseBien6((x) => sombraDeLaPose(x, TAMANO6)), '  la pose: entera en el aire, nada apoyado ni en el hueco, y se va de a poco en el último tramo de la caída (nunca vuelve sola)')
controlPositivo('  el detector VE una sombra que no se va al apoyarse', (x: number) => (x < 0.2 ? 1 : 0.4), poseBien6)
// El fundido, en el rebobinado a 60 cuadros por segundo: la pose pide la sombra entera de golpe.
const fundidoBien6 = (f: (a: number, o: number, dt: number) => number): boolean => {
  const vistas: number[] = []
  let v = 0
  for (let k = 0; k < 90; k += 1) {
    v = f(v, 1, 1 / 60)
    vistas.push(v)
  }
  return vistas[0] < 0.1 && vistas[4] < 0.3 && vistas.every((x, k) => k === 0 || x >= vistas[k - 1]) && (vistas.findIndex((x) => x >= 0.9) + 1) / 60 <= 1 && f(1, 0, 1 / 60) === 0 && SOMBRA_EN_LA_CAIDA.entraS >= 0.2
}
afirmar(fundidoBien6(sombraConFundido), '  la que se ve: entra con fundido (menos de un décimo en el primer cuadro, entera antes de un segundo) y se va con la pose')
controlPositivo('  el detector VE la sombra que aparece de un cuadro al otro', (_a: number, o: number) => o, fundidoBien6)
const finalDelPie6 = leer('_lib/escena/final/cuadroDelFinal.ts')
const luzDelLogo6 = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const componenteDelFinal6 = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const LINEA_DEL_FUNDIDO = 'SOMBRA_EN_EL_FINAL.fundido = s.sombra'
const cableadoBien6 = (c: string): boolean =>
  c.includes('s.sombra = s.estatico ? sombraDeLaPose(fin, tamano) : sombraConFundido(s.sombra, sombraDeLaPose(fin, tamano), dt)') && c.indexOf(LINEA_DEL_FUNDIDO) > 0 && c.indexOf(LINEA_DEL_FUNDIDO) < c.indexOf('if (!activo) {') &&
  luzDelLogo6.includes('* (1 - enElAire) * SOMBRA_EN_EL_FINAL.fundido') && componenteDelFinal6.includes('SOMBRA_EN_EL_FINAL.fundido = 1')
afirmar(cableadoBien6(finalDelPie6), '  el cableado: el final la lleva en cada cuadro (también después de soltarse, así el fundido termina), la sombra la multiplica y al irse el final queda entera; quieto, sin fundido')
controlPositivo('  el detector VE el fundido que se corta al soltar el final', `${finalDelPie6.replace(LINEA_DEL_FUNDIDO, '')}\n${LINEA_DEL_FUNDIDO}`, cableadoBien6)

// «CONTACTO» A 768: en el vidrio oscuro del formulario (forzado sobre la sala de día, el peor caso de PULIDO 1) el especular
// aclaraba el fondo del rótulo, arriba de la caja: 3,8:1 medido (PULIDO 1 lo anotó en 4,2). Más tenue SÓLO ahí: 4,98:1 (los
// rótulos de los campos, de 5,1 a 5,6). El del menú no cambia.
const vidrio6 = leer('_estilos/vidrio.css')
// El valor del formulario va en su bloque (el del menú no lo declara: toma el de siempre por el respaldo del `var`).
const contactoBien6 = (css: string): boolean => {
  const formulario = /\[data-v3\] \[data-material="vidrio"\] \{[^}]*--vidrio-reflejo-del-formulario: (\d+)%;[^}]*\}/.exec(css)
  const oscuro = /\[data-v3\] \[data-material="vidrio"\]\[data-seccion="invertida"\]::before \{\s*background-image: linear-gradient\(to bottom, color-mix\(in srgb, var\(--color-tinta\) var\(--vidrio-reflejo-del-formulario, var\(--vidrio-reflejo\)\), transparent\)/.test(css)
  return formulario !== null && Number(formulario[1]) <= 10 && oscuro && css.includes('--vidrio-reflejo: 28%;') && (css.match(/--vidrio-reflejo-del-formulario:/g) ?? []).length === 1
}
afirmar(contactoBien6(vidrio6), '  «CONTACTO» en AA a 768: el especular del vidrio oscuro del formulario, más tenue (sólo ahí; el del menú, el de siempre)')
controlPositivo('  el detector VE el especular de siempre en el formulario', vidrio6.replace('--vidrio-reflejo-del-formulario: 10%;', '--vidrio-reflejo-del-formulario: 28%;'), contactoBien6)

cerrar('s53-pulido-2')
