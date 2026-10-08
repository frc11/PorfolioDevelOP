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
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-2.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-2/mirar.txt`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import * as THREE from 'three'

import type { Curva } from '../motion/curvas'
import { AMANECER_EN_EL_VIAJE, completoDelViaje } from '../escena/amanecer/linea'
import { CHISPAS_DE_LA_LUZ, crearLasChispas } from '../escena/final/chispasDeLaLuz'
import { ENCUADRE_DEL_PIE, encuadreEntreLasCajas, type Caja, type EncuadreEnPantalla } from '../escena/final/encuadreDelPie'
import { ANCLAS_DEL_HUECO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { LUZ_DE_ABAJO, SECTOR_DE_LA_LUZ_GLSL, prendidoDeLaLuz, zonasDeLaLuz, type ZonaDeLaLuz } from '../escena/final/luzDeAbajo'
import { crearElPlanoDeLaLuz } from '../escena/final/planoDeLaLuz'
import { camaraDelFinal, distanciaParaElAncho } from '../escena/final/recorridoDelFinal'
import { TECLADO, pasoDelTeclado, tecladoQuieto, type EstadoDelTeclado, type LecturaDelTeclado } from '../escena/final/teclado'
import { ENTORNO, entornoPedido } from '../escena/entorno'
import { PISO_VIVO, SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { CAMERA_FOV, FLOOR_Y } from '../escena/probeScene'
import { VELO_EN_LA_ESCENA } from '../escena/veloDelTexto'
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

// `?velo=escena`: la prueba se pide por su nombre; con ella la escena monta el velo del logo y marca la raíz, y la hoja
// saca el del DOM; el sombreador lo aplica al FINAL (después del color de noche del logo, que si no lo pisaría) con la
// misma elipse que el del DOM (`ancho`/`alto` en mitades del texto: 1,9 y 2,8, la caja del pseudo-elemento).
const luzDelLogoP3 = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const veloTs = sinComentarios(leer('_lib/escena/veloDelTexto.ts'))
const veloEscena = (css: string, luz: string, sombreador: string): boolean =>
  entornoPedido('producto,velo=escena').pruebas.velo === 'escena' && ENTORNO.pruebas.velo === 'no' &&
  /e\.pruebas\.velo === 'escena' \? <VeloEnElLogo logoMaterialRef=\{props\.logoMaterialRef\} \/> : null/.test(luz) &&
  /\[data-v3\]\[data-velo='escena'\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p::before,\s*\[data-v3\]\[data-velo='escena'\] \[data-panel='trabajos'\] \[data-capa='demos'\] \[data-pieza='texto'\]::before \{\s*content: none;/.test(enLaBandaP3(css)) &&
  sombreador.includes(".replace(/\\}\\s*$/, '\\tgl_FragColor.rgb *= 1.0 - veloDelTexto();\\n}\\n')") &&
  VELO_EN_LA_ESCENA.ancho === 1.9 && VELO_EN_LA_ESCENA.alto === 2.8 && VELO_EN_LA_ESCENA.fuerza >= 0.7
afirmar(veloEscena(bandaP3, luzDelLogoP3, veloTs), '  `?velo=escena`: sin capa del DOM; el logo se oscurece en una elipse de pantalla detrás de cada texto (al final del sombreador, la misma elipse)')
controlPositivo('  el detector VE el velo de la escena puesto antes del color de noche (que lo pisaba)', [bandaP3, luzDelLogoP3, veloTs.replace(".replace(/\\}\\s*$/, '\\tgl_FragColor.rgb *= 1.0 - veloDelTexto();\\n}\\n')", ".replace('#include <dithering_fragment>', '#include <dithering_fragment>\\n\\tgl_FragColor.rgb *= 1.0 - veloDelTexto();')")] as const, ([c, l, s]: readonly [string, string, string]) => veloEscena(c, l, s))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La luz sale de ABAJO del piso, por las juntas: un sector que se separa, a alturas distintas, sin tapas blancas')

// El brillo de PULIDO 1 (las tapas a blanco) se rechazó: «no entendiste mi concepto». Ahora, después del encastre, un SECTOR
// de bloques se enciende desde abajo (`final/luzDeAbajo.ts`): sus bloques se separan un poco y quedan a alturas distintas;
// por las rendijas se ve un plano que brilla al pie de los bloques; los costados reciben la luz desde su base y los cantos
// la atrapan; las tapas NO se blanquean. Lo que P1 pedía y sigue (blanca, por bloque, orgánica, su ciclo y la sala más
// oscura) lo fija `s52-pulido-1` P1.
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
// rendija, a la altura del vecino) y se apaga hacia arriba. Nunca un `mix` del color hacia el blanco.
const tapaBien = (g: string): boolean => {
  const canto = /luz = ([0-9.]+) \* exp\( - min\( borde\.x, borde\.y \) \/ ([0-9.]+) \);/.exec(g)
  const costado = /if \( vTapa < 0\.5 \) \{\s*luz = ([0-9.]+) \* exp\( - max\( 0\.0, vAlto - vVecino \) \/ ([0-9.]+) \);/.exec(g)
  const sombra = /color \*= 1\.0 - ([0-9.]+) \* s;/.exec(g)
  if (canto === null || costado === null || sombra === null) return false
  const enElMedioDeLaTapa = Number(canto[1]) * Math.exp(-(LADO4 / 2) / Number(canto[2]))
  const unoMasArriba = Math.exp(-1 / Number(costado[2]))
  return enElMedioDeLaTapa < 0.01 && Number(canto[1]) < Number(costado[1]) && Number(costado[1]) >= 1 && unoMasArriba < 0.1 && Number(sombra[1]) > 0 && !/mix\( color, vec3\(/.test(g) && g.includes('return color + vec3( luz * s );')
}
afirmar(tapaBien(juntas4), 'las tapas no se blanquean: en la tapa sólo el canto que da a la rendija (en su medio, nada) y un poco más de sombra; los costados reciben la luz desde su base y se apagan hacia arriba', `canto ${String(L4.canto)} · costado ${String(L4.costado)} (cae en ${String(L4.caeEn)} u) · sombra de la tapa ${String(L4.sombraDeLaTapa)}`)
controlPositivo('el detector VE las tapas blancas de PULIDO 1', juntas4.replace('return color + vec3( luz * s );', 'return mix( color, vec3( 1.0 ), s );'), tapaBien)
controlPositivo('  y un canto que ocupa la tapa entera', juntas4.replace(/(luz = [0-9.]+ \* exp\( - min\( borde\.x, borde\.y \) \/ )[0-9.]+( \);)/, '$10.5$2'), tapaBien)
controlPositivo('  y un costado parejo (sin nacer en la base)', juntas4.replace(/(if \( vTapa < 0\.5 \) \{\s*luz = [0-9.]+ \* exp\( - max\( 0\.0, vAlto - vVecino \) \/ )[0-9.]+( \);)/, '$19.0$2'), tapaBien)

// Los bloques del sector SE SEPARAN un poco (en el vértice: se achican sobre su centro, cada uno distinto, entre 2 × 4,5 % ×
// 0,45 y 2 × 4,5 % del lado: las rendijas no son todas iguales) y quedan A ALTURAS DISTINTAS (en la simulación: un azar por
// bloque, de abajo y de arriba del resto). Fuera del sector, nada cambia: los bloques siguen pegados y tapan el plano.
const sim4 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const separaBien = (v: string, sim: string): boolean => {
  const achica = new RegExp(`transformed\\.xz \\*= 1\\.0 - ${f4(2 * L4.separa).replace('.', '\\.')} \\* sectorDeLaLuz\\( centro, 0\\.0 \\) \\* \\( ([0-9.]+) \\+ ([0-9.]+) \\* azarDeLaLuz\\( floor\\( centro / uLado \\) \\+ [0-9.]+ \\) \\);`).exec(v)
  const alturas = /return s \* mix\( (-?[0-9.]+), (-?[0-9.]+), azarDeLaLuz\( floor\( xz \/ uLado \) \+ [0-9.]+ \) \);/.exec(sim)
  if (achica === null || alturas === null) return false
  return L4.separa >= 0.02 && L4.separa <= 0.08 && Number(achica[1]) > 0.2 && Math.abs(Number(achica[1]) + Number(achica[2]) - 1) < 1e-9 && v.includes('vCentroDelBloque = centro;') &&
    Number(alturas[1]) < 0 && Number(alturas[2]) > 0 && Number(alturas[2]) - Number(alturas[1]) >= 0.3 && sim.includes('dibujo += alturaDeLaLuz( xz );')
}
afirmar(separaBien(sombreadoresDelPiso4.vertice, sim4), '  en el sector los bloques se separan un poco (cada rendija de su ancho) y quedan a alturas distintas (más abajo y más arriba que el resto)', `separa ${String(L4.separa)} del lado por costado · alturas ${String(L4.alturas[0])} a +${String(L4.alturas[1])} u`)
controlPositivo('  el detector VE el sector de bloques pegados', [sombreadoresDelPiso4.vertice.replace(/transformed\.xz \*= [^;]+;/, ''), sim4] as const, ([v, s]: readonly [string, string]) => separaBien(v, s))
controlPositivo('  y el sector todo a la misma altura', [sombreadoresDelPiso4.vertice, sim4.replace('dibujo += alturaDeLaLuz( xz );', '')] as const, ([v, s]: readonly [string, string]) => separaBien(v, s))

// El PLANO que brilla debajo: al pie de los bloques (apenas sobre el fondo del zócalo, más hondo que el valle más hondo: ninguna
// tapa baja hasta él), blanco, sólo en el sector y su resplandor (fuera, descartado: nada que tape); sin tono (el blanco
// llega blanco). Sin bloom en ningún archivo del final: el resplandor es falso y local.
const plano4 = crearElPlanoDeLaLuz(PISO_VIVO.radioDeReferencia - 1)
const materialDelPlano4 = plano4.material instanceof THREE.ShaderMaterial ? plano4.material : null
const finalDir4 = `${V3}/_lib/escena/final`
const delFinal4 = readdirSync(finalDir4).filter((a) => /\.tsx?$/.test(a)).map((a) => sinComentarios(readFileSync(`${finalDir4}/${a}`, 'utf8')))
const planoBien = (p: THREE.Mesh, m: THREE.ShaderMaterial | null, fuentesDelFinal: readonly string[]): boolean =>
  m !== null && Math.abs(p.position.y - (FLOOR_Y - PISO_VIVO.zocalo + 0.02)) < 1e-9 && m.fragmentShader.includes('if ( luz <= 0.002 ) discard;') &&
  m.fragmentShader.includes(`gl_FragColor = vec4( vec3( ${f4(L4.plano)} * luz ), 1.0 );`) && m.fragmentShader.includes(`sectorDeLaLuz( vXZ, ${f4(L4.resplandor)} )`) && !m.toneMapped &&
  fuentesDelFinal.every((s) => !/Bloom|EffectComposer|UnrealBloomPass/.test(s))
afirmar(planoBien(plano4, materialDelPlano4, delFinal4), '  por las rendijas se ve un plano blanco al pie de los bloques, sólo en el sector (con su resplandor alrededor); sin bloom en el final', `a ${String(PISO_VIVO.zocalo - 0.02)} u bajo el ras · resplandor ${String(L4.resplandor)} radios`)
controlPositivo('  el detector VE el bloom global', [plano4, materialDelPlano4, [...delFinal4, "import { Bloom } from '@react-three/postprocessing'"]] as const, ([p, m, fu]: readonly [THREE.Mesh, THREE.ShaderMaterial | null, readonly string[]]) => planoBien(p, m, fu))
const planoArriba4 = plano4.clone()
planoArriba4.position.y = FLOOR_Y + 0.02
controlPositivo('  y un plano a ras del piso (taparía las tapas en los valles)', [planoArriba4, materialDelPlano4, delFinal4] as const, ([p, m, fu]: readonly [THREE.Mesh, THREE.ShaderMaterial | null, readonly string[]]) => planoBien(p, m, fu))
plano4.geometry.dispose()
materialDelPlano4?.dispose()

// El sector NACE EN UN PUNTO Y SE PROPAGA por las juntas: su borde es la vida de la zona (con la vida crece desde el centro,
// bloque a bloque); mayormente CONTIGUO (un solo grupo de bloques) y ORGÁNICO (el borde no es un círculo). La forma, con la
// cuenta del sombreador (la misma fórmula, que se lee de él), sobre los bloques alrededor de una zona.
const fr4 = (x: number): number => x - Math.floor(x)
const azar4 = (x: number, y: number): number => {
  let [a, b, c] = [fr4(x * 0.1031), fr4(y * 0.1031), fr4(x * 0.1031)]
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33)
  ;[a, b, c] = [a + d, b + d, c + d]
  return fr4((a + b) * c)
}
const suave4 = (e0: number, e1: number, x: number): number => {
  const u = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return u * u * (3 - 2 * u)
}
const ruido4 = (x: number, y: number): number => {
  const [ix, iy] = [Math.floor(x), Math.floor(y)]
  const [ux, uy] = [fr4(x) * fr4(x) * (3 - 2 * fr4(x)), fr4(y) * fr4(y) * (3 - 2 * fr4(y))]
  const ab = azar4(ix, iy) + (azar4(ix + 1, iy) - azar4(ix, iy)) * ux
  const cd = azar4(ix, iy + 1) + (azar4(ix + 1, iy + 1) - azar4(ix, iy + 1)) * ux
  return ab + (cd - ab) * uy
}
interface FormaDelSector { readonly irregular: number; readonly ruido: number; readonly suave: number; readonly crece: boolean }
const formaDelSombreador = (g: string): FormaDelSector | null => {
  const d = /float d = lejos \+ ([0-9.]+) \* \( ruidoDeLaLuz\( b \* ([0-9.]+) \+ semilla \) - 0\.5 \);/.exec(g)
  const borde = /s = max\( s, 1\.0 - smoothstep\( z\.w - ([0-9.]+), z\.w \+ ancho, d \) \);/.exec(g)
  if (d === null) return null
  return { irregular: Number(d[1]), ruido: Number(d[2]), suave: borde === null ? 0.3 : Number(borde[1]), crece: borde !== null }
}
interface LecturaDelSector { readonly alcance: readonly number[]; readonly contiguo: number; readonly redondez: number }
const leerElSector = (forma: FormaDelSector): LecturaDelSector => {
  const [cx, cz, radio, semilla] = [10.4, 0.0, 4, 3.1]
  const prendido = (bx: number, bz: number, vida: number): number => {
    const lejos = Math.hypot(bx - cx, bz - cz) / radio
    const d = lejos + forma.irregular * (ruido4(bx * forma.ruido + semilla, bz * forma.ruido + semilla) - 0.5)
    // Sin el borde en la vida (`crece: false`), la vida sólo daría la intensidad de un sector de tamaño fijo.
    return forma.crece ? 1 - suave4(vida - forma.suave, vida, d) : vida * (1 - suave4(1 - forma.suave, 1, d))
  }
  const n = 14
  const celdas: [number, number][] = []
  for (let i = -n; i < n; i += 1) for (let j = -n; j < n; j += 1) celdas.push([cx + (i + 0.5) * LADO4, cz + (j + 0.5) * LADO4])
  const alcance = [0.05, 0.25, 0.5, 0.75, 1].map((v) => celdas.filter(([x, z]) => prendido(x, z, v) > 0.02).length)
  const llenos = new Set(celdas.flatMap(([x, z], k) => (prendido(x, z, 1) > 0.5 ? [k] : [])))
  // El grupo de bloques prendidos más grande (vecinos por los lados), sobre el total prendido.
  const vistos = new Set<number>()
  let mayor = 0
  for (const k of llenos) {
    if (vistos.has(k)) continue
    let tamano = 0
    const pila = [k]
    vistos.add(k)
    while (pila.length > 0) {
      const q = pila.pop() ?? 0
      tamano += 1
      const [i, j] = [Math.floor(q / (2 * n)), q % (2 * n)]
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const [a, b] = [i + di, j + dj]
        const v = a * 2 * n + b
        if (a >= 0 && a < 2 * n && b >= 0 && b < 2 * n && llenos.has(v) && !vistos.has(v)) {
          vistos.add(v)
          pila.push(v)
        }
      }
    }
    mayor = Math.max(mayor, tamano)
  }
  // La redondez: por 16 direcciones, hasta dónde llega el sector; el más lejos sobre el más cerca (un círculo: ~1).
  const porDireccion = Array.from({ length: 16 }, () => 0)
  for (const k of llenos) {
    const [x, z] = celdas[k]
    const a = Math.floor(((Math.atan2(z - cz, x - cx) + Math.PI) / (2 * Math.PI)) * 16) % 16
    porDireccion[a] = Math.max(porDireccion[a], Math.hypot(x - cx, z - cz))
  }
  return { alcance, contiguo: llenos.size === 0 ? 0 : mayor / llenos.size, redondez: Math.max(...porDireccion) / Math.max(0.001, Math.min(...porDireccion)) }
}
const formaReal4 = formaDelSombreador(SECTOR_DE_LA_LUZ_GLSL)
const sectorBien = (g: string): boolean => {
  const forma = formaDelSombreador(g)
  if (forma === null) return false
  const s = leerElSector(forma)
  const crece = s.alcance.every((c, i) => i === 0 || c > s.alcance[i - 1])
  return crece && s.alcance[0] <= 0.1 * s.alcance[s.alcance.length - 1] && s.alcance[s.alcance.length - 1] >= 40 && s.contiguo >= 0.9 && s.redondez >= 1.3
}
const lecturaReal4 = formaReal4 === null ? null : leerElSector(formaReal4)
afirmar(sectorBien(SECTOR_DE_LA_LUZ_GLSL), '  el sector nace en un punto y se propaga bloque a bloque con su vida; mayormente contiguo y de borde orgánico (no un círculo)', lecturaReal4 === null ? 'sin forma' : `bloques con luz por vida (0,05 a 1): ${lecturaReal4.alcance.join(' · ')} · contiguo ${(100 * lecturaReal4.contiguo).toFixed(0)} % · el más lejos / el más cerca ${lecturaReal4.redondez.toFixed(2)}`)
controlPositivo('  el detector VE un sector de tamaño fijo que sólo sube su intensidad (no nace en un punto)', SECTOR_DE_LA_LUZ_GLSL.replace(/s = max\( s, 1\.0 - smoothstep\( z\.w - [0-9.]+, z\.w \+ ancho, d \) \);/, 's = max( s, z.w );'), sectorBien)
controlPositivo('  y un círculo (sin el ruido)', SECTOR_DE_LA_LUZ_GLSL.replace(/float d = lejos \+ [0-9.]+ \*/, 'float d = lejos + 0.0 *'), sectorBien)

// RESPIRA (el radio late mientras vive y la luz de cada junta se corre despacio con el reloj) y la sala se oscurece GRADUAL
// (nunca de un cuadro al otro: a 60 cuadros por segundo, lo más que cambia en uno) y se recupera entre zona y zona.
type Zonas4 = typeof zonasDeLaLuz
const ALCANCE4 = { x: 16, y: 10, giro: 0 }
const respiraBien = (zonas: Zonas4, sector: string): boolean => {
  const buf: ZonaDeLaLuz[] = []
  let [chico, grande] = [Infinity, 0]
  let [salto, mas, menos] = [0, 0, 1]
  let antes = -1
  for (let t = 0; t < 180; t += 1 / 60) {
    const z = zonas(t, ALCANCE4, 6, buf)
    if ((z[0]?.vida ?? 0) > 0.99) {
      chico = Math.min(chico, z[0].radio)
      grande = Math.max(grande, z[0].radio)
    }
    const oscuro = L4.oscurece * prendidoDeLaLuz(z)
    if (antes >= 0) salto = Math.max(salto, Math.abs(oscuro - antes))
    antes = oscuro
    mas = Math.max(mas, oscuro)
    menos = Math.min(menos, oscuro)
  }
  return grande / chico > 1.1 && sector.includes('ruidoDeLaLuz( xz * ') && /\+ vec2\( t \* [0-9.]+, - t \* [0-9.]+ \)/.test(sector) && salto <= 0.01 && mas >= 0.3 && menos <= 0.02
}
afirmar(respiraBien(zonasDeLaLuz, SECTOR_DE_LA_LUZ_GLSL), '  respira (el radio late mientras vive y la luz de las juntas se corre) y la sala se oscurece gradual con el sector y se recupera')
controlPositivo('  el detector VE una zona que no respira (de radio fijo)', ((t: number, a: { x: number; y: number; giro: number }, m: number, s: ZonaDeLaLuz[]) => zonasDeLaLuz(t, a, m, s).map((z) => Object.assign(z, { radio: 4 }))) as Zonas4, (z: Zonas4) => respiraBien(z, SECTOR_DE_LA_LUZ_GLSL))
controlPositivo('  y un sector que se prende de golpe (la sala, de un cuadro al otro)', ((t: number, a: { x: number; y: number; giro: number }, m: number, s: ZonaDeLaLuz[]) => zonasDeLaLuz(t, a, m, s).map((z) => Object.assign(z, { vida: z.vida > 0.5 ? 1 : 0 }))) as Zonas4, (z: Zonas4) => respiraBien(z, SECTOR_DE_LA_LUZ_GLSL))

// Las CHISPAS de la referencia: atrás de `?chispas=si` (apagadas en el producto; quietas con movimiento reducido, no se
// crean), pocas, chicas, blancas y sumadas; nacen en el sector vivo y se apagan subiendo.
const chispas4 = crearLasChispas()
const materialDeLasChispas4 = chispas4.material instanceof THREE.ShaderMaterial ? chispas4.material : null
const finalDelPie4 = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
type Chispas4 = { readonly cuantas: number; readonly tamano: number }
const chispasBien = (c: Chispas4, m: THREE.ShaderMaterial | null, componente: string): boolean =>
  m !== null && c.cuantas <= 64 && c.tamano <= 4 && m.blending === THREE.AdditiveBlending && m.fragmentShader.includes('gl_FragColor = vec4( vec3( 1.0 ), ') &&
  ENTORNO.pruebas.chispas === 'no' && entornoPedido('producto,chispas=si').pruebas.chispas === 'si' && componente.includes("entornoDeLaEscena().pruebas.chispas === 'si' && !estatico ? crearLasChispas() : null")
afirmar(chispasBien(CHISPAS_DE_LA_LUZ, materialDeLasChispas4, finalDelPie4), '  las chispas, sólo con `?chispas=si` (y nunca quietas): pocas, chicas, blancas y sumadas', `${String(CHISPAS_DE_LA_LUZ.cuantas)} chispas de ${String(CHISPAS_DE_LA_LUZ.tamano)} px`)
controlPositivo('  el detector VE una nube de partículas', [{ ...CHISPAS_DE_LA_LUZ, cuantas: 600 }, materialDeLasChispas4, finalDelPie4] as const, ([c, m, k]: readonly [Chispas4, THREE.ShaderMaterial | null, string]) => chispasBien(c, m, k))
controlPositivo('  y las chispas en el producto', [CHISPAS_DE_LA_LUZ, materialDeLasChispas4, finalDelPie4.replace("entornoDeLaEscena().pruebas.chispas === 'si' && !estatico ? crearLasChispas() : null", 'crearLasChispas()')] as const, ([c, m, k]: readonly [Chispas4, THREE.ShaderMaterial | null, string]) => chispasBien(c, m, k))
chispas4.geometry.dispose()
materialDeLasChispas4?.dispose()

cerrar('s53-pulido-2')
