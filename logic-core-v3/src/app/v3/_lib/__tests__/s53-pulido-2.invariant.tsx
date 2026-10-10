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


import type { Curva } from '../motion/curvas'
import { AMANECER_EN_EL_VIAJE, completoDelViaje } from '../escena/amanecer/linea'
import { ENCUADRE_DEL_PIE, encuadreEntreLasCajas, type Caja, type EncuadreEnPantalla } from '../escena/final/encuadreDelPie'
import { ANCLAS_DEL_HUECO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { LUZ_DE_ABAJO } from '../escena/final/luzDeAbajo'
import { crearElPlanoDeLaLuz } from '../escena/final/planoDeLaLuz'
import { SOMBRA_EN_LA_CAIDA, camaraDelFinal, distanciaParaElAncho, sombraConFundido, sombraDeLaPose } from '../escena/final/recorridoDelFinal'
import { TECLADO, pasoDelTeclado, tecladoQuieto, type EstadoDelTeclado, type LecturaDelTeclado } from '../escena/final/teclado'
import { ENTORNO, entornoPedido } from '../escena/entorno'
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
    g.includes('float junta = brilloDeLaJunta( vPiso.xz, uRelojDeLaLuz ) * s + corrientesDeLaLuz( vPiso.xz, uLado ) * ( 0.4 + min( s, 1.0 ) );') && g.includes('return color + vec3( luz * junta * uBrilloDeLaLuz );')
}
afirmar(tapaBien(juntas4), 'las tapas no se blanquean: en la tapa sólo el canto que da a la rendija (en su medio, nada) y un poco más de sombra; los costados reciben la luz desde su base y se apagan hacia arriba', `canto ${String(L4.canto)} · costado ${String(L4.costado)} (cae en ${String(L4.caeEn)} u) · sombra de la tapa ${String(L4.sombraDeLaTapa)}`)
controlPositivo('el detector VE las tapas blancas de PULIDO 1', juntas4.replace('return color + vec3( luz * junta * uBrilloDeLaLuz );', 'return mix( color, vec3( 1.0 ), s );'), tapaBien)
controlPositivo('  y un canto que ocupa la tapa entera', juntas4.replace(/(luz = [0-9.]+ \* exp\( - min\( borde\.x, borde\.y \) \/ )[0-9.]+( \);)/, '$10.5$2'), tapaBien)
controlPositivo('  y un costado parejo (sin nacer en la base)', juntas4.replace(/(if \( vTapa < 0\.5 \) \{\s*luz = [0-9.]+ \* exp\( - max\( 0\.0, vAlto - vVecino \) \/ )[0-9.]+( \);)/, '$19.0$2'), tapaBien)

// Los bloques con energía SE SEPARAN un poco (en el vértice: se achican sobre su centro, cada uno distinto: las rendijas no
// son todas iguales) y quedan A ALTURAS DISTINTAS (en la simulación: un azar por bloque, de abajo y de arriba del resto). Sin
// energía, nada cambia: los bloques siguen pegados y tapan el plano. [PULIDO 3] A1 · la energía del bloque la lee el vértice
// de la simulación (el canal libre de su textura), y con las ondas pasa de 1 (la separación, hasta 1,6). [PULIDO 6] E2 · las
// alturas, por lo que queda de la calma: los bloques pegados al hueco quedan al ras (la luz, no).
const sim4 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const separaBien = (v: string, sim: string): boolean => {
  const achica = new RegExp(`transformed\\.xz \\*= 1\\.0 - ${f4(2 * L4.separa).replace('.', '\\.')} \\* min\\( vEnergiaDelBloque, 1\\.6 \\) \\* \\( ([0-9.]+) \\+ ([0-9.]+) \\* azarDeLaLuz\\( floor\\( centro / uLado \\) \\+ [0-9.]+ \\) \\);`).exec(v)
  const alturas = /return min\( e, 1\.4 \) \* mix\( (-?[0-9.]+), (-?[0-9.]+), azarDeLaLuz\( celda \+ [0-9.]+ \) \) \* \( 1\.0 - calmaDelFinal\( xz \) \);/.exec(sim)
  if (achica === null || alturas === null) return false
  return L4.separa >= 0.02 && L4.separa <= 0.08 && Number(achica[1]) > 0.2 && Math.abs(Number(achica[1]) + Number(achica[2]) - 1) < 1e-9 && v.includes('vEnergiaDelBloque = texelFetch( uAlturas, celda, 0 ).a;') &&
    Number(alturas[1]) < 0 && Number(alturas[2]) > 0 && Number(alturas[2]) - Number(alturas[1]) >= 0.3 && sim.includes('dibujo += alturaDeLaLuz( xz, energiaAqui ) + pistonAqui;')
}
afirmar(separaBien(sombreadoresDelPiso4.vertice, sim4), '  con energía los bloques se separan un poco (cada rendija de su ancho) y quedan a alturas distintas (más abajo y más arriba que el resto)', `separa ${String(L4.separa)} del lado por costado · alturas ${String(L4.alturas[0])} a +${String(L4.alturas[1])} u`)
controlPositivo('  el detector VE los bloques pegados', [sombreadoresDelPiso4.vertice.replace(/transformed\.xz \*= [^;]+;/, ''), sim4] as const, ([v, s]: readonly [string, string]) => separaBien(v, s))
controlPositivo('  y todos a la misma altura', [sombreadoresDelPiso4.vertice, sim4.replace('dibujo += alturaDeLaLuz( xz, energiaAqui ) + pistonAqui;', '')] as const, ([v, s]: readonly [string, string]) => separaBien(v, s))

// El PLANO que brilla debajo: al pie de los bloques (apenas sobre el fondo del zócalo), blanco donde hay energía (donde no,
// descartado: nada que tape); sin tono (el blanco llega blanco). Sin bloom en ningún archivo del final: el resplandor es falso
// y local. [PULIDO 3] A1 · la energía la lee de la simulación (`energiaEnElPiso`); antes, del sector con su resplandor.
const plano4 = crearElPlanoDeLaLuz(PISO_VIVO.radioDeReferencia - 1)
const materialDelPlano4 = plano4.material instanceof THREE.ShaderMaterial ? plano4.material : null
const finalDir4 = `${V3}/_lib/escena/final`
const delFinal4 = readdirSync(finalDir4).filter((a) => /\.tsx?$/.test(a)).map((a) => sinComentarios(readFileSync(`${finalDir4}/${a}`, 'utf8')))
const planoBien = (p: THREE.Mesh, m: THREE.ShaderMaterial | null, fuentesDelFinal: readonly string[]): boolean =>
  m !== null && Math.abs(p.position.y - (FLOOR_Y - PISO_VIVO.zocalo + 0.02)) < 1e-9 && m.fragmentShader.includes('if ( luz <= 0.002 ) discard;') &&
  m.fragmentShader.includes(`gl_FragColor = vec4( vec3( ${f4(L4.plano)} * luz * uBrilloDeLaLuz ), 1.0 );`) && m.fragmentShader.includes('float e = energiaEnElPiso( vXZ );') && !m.toneMapped &&
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

// Las CHISPAS de la referencia: [PULIDO 3] A1 · fueron de `?energia=inestable`. [PULIDO 3B] B0 · cambió por pedido: «las
// chispas también se van»: ni su archivo, ni su creación, ni ningún `Points` en el final.
const finalDelPie4 = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const sinChispas = (componente: string): boolean => !existsSync(`${V3}/_lib/escena/final/chispasDeLaLuz.ts`) && !componente.includes('crearLasChispas') && delFinal4.every((f) => !/THREE\.Points|PointsMaterial/.test(f))
afirmar(sinChispas(finalDelPie4), '  las chispas se borraron (B0 de PULIDO 3B): ningún punto en el final')
controlPositivo('  el detector VE las chispas de vuelta', `${finalDelPie4}\nconst chispas = crearLasChispas()`, sinChispas)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El CTA del final desde «Seis razones»: ganó `cruce` (PULIDO 3B · B1) y las otras cuatro se borraron')

// [PULIDO 3B] B1 · cambió por pedido: `?cta=cruce` pasó a ser el producto (sin bandera) y `capas`, `relevo`, `giro` y `tipo`
// se BORRARON con su código y sus banderas. Las afirmaciones de PULIDO 2 sobre las cinco (funciones puras del scroll, sus
// gestos, la fuente del hero con el material de los títulos, el clic a Contacto, el teléfono, el movimiento reducido) se
// reemplazan por ésta, que fija que ya no existen; lo que el CTA del producto hace lo fija `s54-pulido-3` B1.
const ctaDir5 = `${V3}/_lib/escena/ctaDelFinal`
const delCta5 = readdirSync(ctaDir5).filter((a) => /\.tsx?$/.test(a)).map((a) => sinComentarios(readFileSync(`${ctaDir5}/${a}`, 'utf8'))).join('\n')
const delDom5 = ['_componentes/ctaDelFinal/CtaDelFinal.tsx', '_secciones/por-que-develop/PorQueDevelop.tsx', '_secciones/por-que-develop/CtaTransformado.tsx', '_lib/escena/entorno.ts'].map((r) => sinComentarios(leer(r))).join('\n')
const sinVariantes = (escena: string, dom: string): boolean =>
  !existsSync(`${ctaDir5}/variantes.ts`) && !existsSync(`${V3}/_fuentes/archivo-100-cta.json`) && !existsSync(`${V3}/_fuentes/chivo-100-cta.json`) &&
  !/\bcapas\b|\brelevo\b|plegadoDelValor|PliegueDelValor|letrasConDosPesos|capasDelCta|VARIANTES_DEL_CTA|VarianteDelCta|varianteDelCta|useVarianteDelCta|CtaEnElEscenario/.test(`${escena}\n${dom}`) &&
  !('cta' in ENTORNO.pruebas) && !('cta' in entornoPedido('producto,cta=giro').pruebas)
afirmar(sinVariantes(delCta5, delDom5), 'las variantes `capas|relevo|giro|tipo` y el CTA de antes no dejan código (ni archivos, ni fuentes finas, ni banderas): el CTA es el del producto')
controlPositivo('el detector VE la variante `relevo` de vuelta', [`${delCta5}\nfunction relevo() {}`, delDom5] as const, ([e, d]: readonly [string, string]) => sinVariantes(e, d))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Pendientes de PULIDO 1: la sombra del logo entra con fundido al salir del hueco; «CONTACTO» a 768 en AA')

// LA SOMBRA: la pose pide la sombra entera en el aire y ninguna apoyada o en el hueco; la que se ve baja con la pose y SUBE
// con un fundido. Al rebobinar, el logo sale del hueco en cinco cuadros (medido: `fin` de 0,43 a 0,35 en 67 ms, 4 u de
// subida) y la sombra aparecía de un cuadro al otro.
const TAMANO6 = { alto: 4, espesor: 0.55 }
const finas6 = Array.from({ length: 1001 }, (_, k) => k / 1000)
// [PULIDO 11] D · con la caída nueva la sombra va con el giro de la caída (la sombra de la escena sigue al logo): entera en el aire y
// parado en el piso (la tiene al pie), se va mientras cae al hueco y no vuelve (en el rebote tampoco). Los puntos de antes
// (entera a 0,3; nada a 0,45) eran los de la caída derecha: ahora, entera hasta que vuelca (`fin` 0,3) y nada desde el golpe (0,67).
const poseBien6 = (f: (fin: number) => number): boolean =>
  f(0) === 1 && f(0.05) === 1 && f(0.3) > 0.9 && f(0.68) === 0 && f(0.734) === 0 && f(1) === 0 && finas6.every((x, k) => f(x) >= 0 && f(x) <= 1 && (k === 0 || f(x) <= f(finas6[k - 1]) + 1e-9))
const enArco6 = (f: (fin: number) => number): boolean => f(0) === 1 && f(1) === 0 && finas6.every((x, k) => k === 0 || f(x) <= f(finas6[k - 1]) + 1e-9)
afirmar(poseBien6((x) => sombraDeLaPose(x, TAMANO6, 'lenta')) && enArco6((x) => sombraDeLaPose(x, TAMANO6, 'angulo')), '  la pose: entera en el aire y parado en el piso, nada en el hueco, y se va de a poco mientras cae (nunca vuelve sola, ni en el rebote); en arco, igual')
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
  c.includes('s.sombra = s.estatico ? sombraDeLaPose(fin, tamano, s.caida) : sombraConFundido(s.sombra, sombraDeLaPose(fin, tamano, s.caida), dt)') && c.indexOf(LINEA_DEL_FUNDIDO) > 0 && c.indexOf(LINEA_DEL_FUNDIDO) < c.indexOf('if (!activo) {') &&
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
