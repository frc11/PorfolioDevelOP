/**
 * PULIDO 2 — el invariante: npm run test:s53-pulido-2
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   1 · el encastre DETRÁS del pie abajo de 1024: sin escenario (la página termina en el pie), el logo en el hueco más grande
 *       entre los elementos del pie, el teclado que no lo dispara, y el pie en AA mientras corre.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-2.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-2/mirar.txt`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import * as THREE from 'three'

import { ENCUADRE_DEL_PIE, encuadreEntreLasCajas, type Caja, type EncuadreEnPantalla } from '../escena/final/encuadreDelPie'
import { camaraDelFinal, distanciaParaElAncho } from '../escena/final/recorridoDelFinal'
import { TECLADO, pasoDelTeclado, tecladoQuieto, type EstadoDelTeclado, type LecturaDelTeclado } from '../escena/final/teclado'
import { CAMERA_FOV, FLOOR_Y } from '../escena/probeScene'
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

cerrar('s53-pulido-2')
