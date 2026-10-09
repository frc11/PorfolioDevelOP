/**
 * PULIDO 5 — el invariante: npm run test:s56-pulido-5
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   D1 · el CTA: el giro de `2411371a` (en lugar del cruce), el CTA anclado en el mundo con el enlace del DOM en su plano (A1),
 *        la tipografía de título (Archivo ancho, 600 y 900, con kerning y más grande), cada glifo con su agujero, y `contorno`
 *        de producto (emparejado por posición y área, remuestreo equidistante con el arranque alineado, turbulencia en campana
 *        que llega a cero, rígida al formarse, topología fija con tapas por stencil y la malla exacta al final).
 *   D2 · la luz del encastre, marcada y sólida (`?anillo=tubo|disco|filo|tubo+filo`; el círculo difuso se borró), el logo como lo
 *        que más se ve (sin niebla, con menos reflejo y sin polvo encima) y un solo golpe (el de la sala). [PULIDO 6] E2 · la luz
 *        del encastre se borró (gana el filo, por afuera del logo: lo fija `s57`); queda lo del logo y el golpe.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-5.md`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { ENTORNO, entornoPedido } from '../escena/entorno'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { lugarDelMarco, nuevoLugarDelMarco, ponerElMarco, MARCO_DEL_CTA } from '../escena/ctaDelFinal/armadoDelCta'
import { CONTORNO, armarElContorno, asignar, mejorGiro, pistasDeLaMetamorfosis, remuestrear, type CuadroDeLaMetamorfosis } from '../escena/ctaDelFinal/contorno'
import { FUENTES_DEL_CTA, TRACKING_DEL_CTA, avancesDe, type FuenteConKerning } from '../escena/ctaDelFinal/fuentesDelCta'
import type { ValorMedido } from '../escena/ctaDelFinal/medidaDeLosValores'
import { letrasDeLaFrase } from '../escena/ctaDelFinal/piezasDeLaMetamorfosis'
import { ANCLAJE_DEL_CTA, LECTURA_DEL_CTA, correrElPlano, homografiaDelCta, nuevosPlanosDelCta } from '../escena/ctaDelFinal/planosDelCta'
import {
  METAMORFOSIS,
  TRANSFORMACION,
  armadoSobreElCta,
  estadoDeLaMetamorfosis,
  nuevaPose,
  posesDe,
  type EscenaDeLaTransformacion,
  type LetraEnPantalla,
  type PosesDeLaTransformacion,
} from '../escena/ctaDelFinal/transformacion'
import { aplicar, homografia } from '../pie3d/homografia'
import { LOGO_DEL_FINAL, reflejoDelLogo } from '../escena/final/logoDelFinal'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { SONIDOS } from '../sonido/catalogo'
import { CTA, FRASE } from '../../_secciones/por-que-develop/contenido'
import CHIVO_400_VALORES from '../../_fuentes/chivo-400-valores.json'
import ARCHIVO_NORMAL_CTA from '../../_fuentes/archivo-normal-cta.json'
import ARCHIVO_NORMAL_CTA_FUERTE from '../../_fuentes/archivo-normal-cta-fuerte.json'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const leerDeLaRaiz = (ruta: string): string => readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('D1 · El CTA: el giro, anclado en el mundo, con tipografía de título y `contorno` de producto')

// 1 · EL GIRO, COMO EN `2411371a` (`?cta=giro`): «Seis razones / para elegirnos» se junta en un cartel del ancho del CTA y gira
// sobre Y; en el medio del giro sólo se ve el canto (lo visible, de lado); del otro lado está «HABLANOS», que se asienta en su
// lugar cuando termina la frase (`baja` termina en 1). Sus medidas son las de `2411371a` salvo `baja` (dura 0,34: termina en 1).
const renglon = (texto: string, x0: number, y: number, cuerpo: number, r: number): LetraEnPantalla[] => [...texto].filter((c) => c.trim() !== '').map((c, i) => ({ x: x0 + i * 0.55 * cuerpo, y, cuerpo, ancho: 0.5 * cuerpo, alto: 0.7 * cuerpo, renglon: r, letra: c }))
const ORIGEN = [...renglon(FRASE.izquierda, 130, 200, 60, 0), ...renglon(FRASE.derecha, 1000, 180, 60, 1)]
const HABLANOS = renglon(CTA.rotulo.toUpperCase(), 500, 560, 100, 0)
const ESCENA: EscenaDeLaTransformacion = { origen: ORIGEN, destino: HABLANOS, pantalla: { ancho: 1440, alto: 900 }, armado: armadoSobreElCta(ORIGEN, HABLANOS) }
const poses = (): PosesDeLaTransformacion => ({ origen: ORIGEN.map(nuevaPose), destino: HABLANOS.map(nuevaPose) })
type Giro = typeof posesDe
const DE_2411371A = { junta: 0.28, desde: 0.28, gira: 0.4, espesor: 0.35, renglon: 1.12 }
const visto = (q: { aparece: number; ry: number }): number => q.aparece * Math.abs(Math.cos(q.ry))
const giroBien = (f: Giro): boolean => {
  const s = poses()
  f(0, ESCENA, s)
  const enCero = s.origen.every((q, i) => q.aparece === 1 && Math.abs(q.x - ORIGEN[i].x) < 1e-6 && q.ry === 0) && s.destino.every((q) => q.aparece === 0)
  // En el medio del giro (90°): lo que se ve de cada cara es su canto.
  const G = TRANSFORMACION.giro
  f(G.desde + G.gira / 2, ESCENA, s)
  const deCanto = [...s.origen, ...s.destino].every((q) => visto(q) < 0.02) && s.origen.some((q) => Math.abs(q.ry - Math.PI / 2) < 0.02)
  f(1, ESCENA, s)
  const enUno = s.origen.every((q) => q.aparece === 0) && s.destino.every((q, k) => q.aparece === 1 && Math.abs(q.x - HABLANOS[k].x) < 1e-6 && Math.abs(q.y - HABLANOS[k].y) < 1e-6 && Math.abs(q.escala - HABLANOS[k].cuerpo) < 1e-6 && Math.abs(q.z) < 1e-6 && Math.abs(Math.cos(q.ry) - 1) < 1e-9)
  const medidas = (Object.keys(DE_2411371A) as (keyof typeof DE_2411371A)[]).every((k) => TRANSFORMACION.giro[k] === DE_2411371A[k]) && G.baja[0] === 0.66 && Math.abs(G.baja[0] + G.baja[1] - 1) < 1e-12
  return enCero && deCanto && enUno && medidas
}
afirmar(giroBien(posesDe), '1 · el giro de PULIDO 2 (`2411371a`), recuperado: el cartel de «Seis razones» gira sobre Y, en el medio sólo el canto, del otro lado «HABLANOS», que se asienta en 1')
controlPositivo('1 · el detector VE el cruce (sin girar: crece y aparece de frente)', ((p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(p, e, s)
  for (const q of [...s.origen, ...s.destino]) q.ry = 0
}) as Giro, giroBien)
const transformacion = sinComentarios(leer('_lib/escena/ctaDelFinal/transformacion.ts'))
afirmar(!/cruce|zoomDelCruce|contraforma/.test(transformacion) && !/cruce/.test(sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))), '  el cruce se borró (su código y sus medidas)')

// NADA DELANTE DEL LOGO: lo que viene hacia la cámara (z > 0: al girar, la mitad del cartel) nunca baja del borde de abajo del
// CTA, y debajo del CTA está el logo (en la pose C arranca abajo del lugar del CTA, `s52-nocturno-final` D3). Con el cartel
// armado sobre el CTA (`armadoSobreElCta`); centrado en él (como en la lista de `2411371a`), su renglón de abajo lo pisaba.
const abajoDelCta = Math.max(...HABLANOS.map((l) => l.y + l.alto / 2))
const nadaDelanteBien = (armado: number): boolean => {
  const s = poses()
  for (let p = 0; p <= 1.0001; p += 0.002) {
    posesDe(p, { ...ESCENA, armado }, s)
    const todas = [...s.origen.map((q, i) => ({ q, l: ORIGEN[i] })), ...s.destino.map((q, k) => ({ q, l: HABLANOS[k] }))]
    if (todas.some(({ q, l }) => q.aparece > 0 && q.z > 1e-6 && q.y + (l.alto * q.escala) / l.cuerpo / 2 > abajoDelCta + 0.5)) return false
  }
  return true
}
afirmar(nadaDelanteBien(ESCENA.armado), '  nada del giro viene hacia la cámara por debajo del CTA (el cartel se arma sobre él): nada pasa delante del logo', `el cartel, armado a ${ESCENA.armado.toFixed(0)} px (el CTA termina a ${abajoDelCta.toFixed(0)})`)
controlPositivo('  el detector VE el cartel centrado en el CTA', HABLANOS[0].y, nadaDelanteBien)

// 2 · ANCLADO EN EL MUNDO: el marco del giro y el lienzo de la metamorfosis terminan (desde `ANCLAJE_DEL_CTA.hasta`) en el plano
// del CTA, que sale de la cámara del nudo `cta` (la pose C, sin el mouse): el mismo lugar del mundo con cualquier cámara viva
// (el scroll, el paralaje). Antes terminaban en el de la cámara viva (pegados a la pantalla).
const escena = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))
const planos = sinComentarios(leer('_lib/escena/ctaDelFinal/planosDelCta.ts'))
const camara = (x: number, y: number, z: number): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
  c.position.set(x, y, z)
  c.lookAt(0, 1.2, 0)
  c.updateMatrixWorld(true)
  return c
}
const C = camara(0, 4.5, 31)
type Fin = (p: ReturnType<typeof nuevosPlanosDelCta>) => ReturnType<typeof nuevoLugarDelMarco>
const ancladoBien = (fin: Fin, e: string, pl: string): boolean => {
  const marcos = [camara(0, 4.5, 30.5), camara(4, 5.5, 30)].map((viva) => {
    const p = nuevosPlanosDelCta()
    lugarDelMarco(C, 900, MARCO_DEL_CTA.cerca, p.cta)
    lugarDelMarco(viva, 900, MARCO_DEL_CTA.cerca, p.pantalla)
    const g = new THREE.Group()
    ponerElMarco(g, p.pantalla, fin(p), 1)
    return g.position.clone()
  })
  const nudo = CHOREO_KEYFRAMES.find((k) => k.name === LECTURA_DEL_CTA)
  return marcos[0].distanceTo(marcos[1]) < 1e-9 && nudo !== undefined && nudo.pose.height === 4.5 && ANCLAJE_DEL_CTA.hasta < 1 &&
    e.includes('ponerElMarco(a.lienzo, s.planos.pantalla, s.planos.cta, anclado)') && e.includes("ponerElMarco(a.marco, CTA_EN_VIVO.donde === 'lista' ? s.planos.pantalla : s.planos.frase, s.planos.cta, anclado)") &&
    pl.includes('lugarDelMarco(camaraDeLaLectura(LECTURA_DEL_CTA, aspecto, logo.logoW, logo.logoH, DEL_CTA), alto, MARCO_DEL_CTA.cerca, p.cta)') && !/CAMARA_SIN_EL_MOUSE, viva/.test(e)
}
afirmar(ancladoBien((p) => p.cta, escena, planos), '2 · la frase y «HABLANOS» terminan anclados en el mundo (el plano de la cámara del nudo `cta`): con otra cámara viva, el mismo lugar')
controlPositivo('2 · el detector VE el CTA pegado a la pantalla (el plano de la cámara viva)', (p: ReturnType<typeof nuevosPlanosDelCta>) => p.pantalla, (f: Fin) => ancladoBien(f, escena, planos))

// A1 · EL ENLACE EN SU PLANO: el DOM que se toca va, con una homografía, al cuadrilátero donde la cámara viva ve la caja de
// «HABLANOS» en el plano del CTA. Con la cámara de la lectura y la caja del DOM igual a la del 3D, en su lugar (la identidad);
// con la cámara corrida, cada esquina del enlace cae donde se ve la del CTA.
const enlaceBien = (h: typeof homografiaDelCta): boolean => {
  const cta = lugarDelMarco(C, 900, MARCO_DEL_CTA.cerca, nuevoLugarDelMarco())
  const caja = { x: 500, y: 520, ancho: 440, alto: 100 }
  const quieta = h(cta, caja, caja, C, { ancho: 1440, alto: 900 })
  const corrida = camara(4, 5.5, 30)
  const css = h(cta, caja, caja, corrida, { ancho: 1440, alto: 900 })
  const m = (/matrix3d\(([^)]+)\)/.exec(css)?.[1] ?? '').split(',').map(Number)
  const plano = new THREE.Object3D()
  plano.position.copy(cta.posicion)
  plano.quaternion.copy(cta.giro)
  plano.scale.setScalar(cta.escala)
  plano.updateMatrixWorld(true)
  const esquina = new THREE.Vector3(caja.x + caja.ancho, -(caja.y + caja.alto), 0).applyMatrix4(plano.matrixWorld).project(corrida)
  const [x, y] = m.length === 16 ? aplicar(m, caja.ancho, caja.alto) : [NaN, NaN]
  const identidad = (/matrix3d\(([^)]+)\)/.exec(quieta)?.[1] ?? '').split(',').map(Number)
  const esIdentidad = identidad.length === 16 && Math.abs(aplicar(identidad, caja.ancho, caja.alto)[0] - caja.ancho) < 0.6 && Math.abs(aplicar(identidad, 0, 0)[1]) < 0.6
  return esIdentidad && Math.abs(x + caja.x - ((esquina.x + 1) / 2) * 1440) < 0.6 && Math.abs(y + caja.y - ((1 - esquina.y) / 2) * 900) < 0.6 && escena.includes('llevarElEnlace(s, homografiaDelCta(s.planos.cta,')
}
afirmar(enlaceBien(homografiaDelCta), '  A1 · el enlace del DOM va en el plano del CTA: con la cámara de la lectura, en su lugar; con la cámara corrida, sobre «HABLANOS»')
controlPositivo('  A1 · el detector VE un enlace que se queda en la caja del DOM', ((cta, caja, dom) => (homografia(dom.ancho, dom.alto, [0, 0, dom.ancho, 0, dom.ancho, dom.alto, 0, dom.alto], []) ? 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)' : '')) as typeof homografiaDelCta, enlaceBien)

// Y SE VA CON SU SECCIÓN: anclado en el mundo, al soltarse su escenario el plano del CTA sube con él (como los títulos de volumen
// que se quedan) y, cuando el escenario se fue más de una pantalla o la cámara del final sube, no se dibuja: desde el cenit, una
// pieza vertical que quedó en la sala se veía de canto, atravesando el pie (lo vio el banco de D2).
const seVaBien = (correr: typeof correrElPlano, e: string): boolean => {
  const lugar = lugarDelMarco(C, 900, MARCO_DEL_CTA.cerca, nuevoLugarDelMarco())
  const antes = lugar.posicion.clone()
  correr(lugar, -300)
  const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(lugar.giro)
  const movido = lugar.posicion.clone().sub(antes)
  return Math.abs(movido.dot(arriba) - 300 * lugar.escala) < 1e-9 && movido.clone().sub(arriba.multiplyScalar(300 * lugar.escala)).length() < 1e-9 &&
    e.includes('if (caja !== null) correrElPlano(s.planos.cta, corrimiento(caja.pin, window.scrollY))') && e.includes("(CTA_EN_VIVO.donde === 'lista' || p > 0) && !seFue(a, tam.height)") &&
    e.includes('return EN_VIVO_DEL_FINAL.camara > 0 || (caja !== null && corrimiento(caja.pin, window.scrollY) < -alto)')
}
afirmar(seVaBien(correrElPlano, escena), '  y se va con su sección: el plano sube con su escenario y, ido (o con la cámara del final subiendo), no se dibuja')
controlPositivo('  el detector VE un CTA que se queda en la sala', (() => undefined) as typeof correrElPlano, (f: typeof correrElPlano) => seVaBien(f, escena))

// 3 · LA TIPOGRAFÍA DE TÍTULO: Archivo más ancha (`?ancho=normal|expandido`: wdth 100 y 120; el sitio pincha 62), la frase en
// 600 y el destacado y «HABLANOS» en 900, con el KERNING de la fuente (los pares del GPOS) y el interletrado apretado; más grande
// (la frase, de un quinto del lugar del CTA a 1/3,65, con el tope del display; el CTA en proporción).
type Datos = FontData & { readonly kerning?: Readonly<Record<string, number>>; readonly original_font_information?: { readonly fontSubfamily?: string } }
const subfamilia = (d: unknown): string => (d as Datos).original_font_information?.fontSubfamily ?? ''
// [PULIDO 6] E1 · un solo ancho: wdth 100 (`?ancho=expandido` y sus fuentes se borraron).
const anchosBien = (): boolean => !('ancho' in ENTORNO.pruebas) && !('ancho' in entornoPedido('producto,ancho=expandido').pruebas) &&
  subfamilia(ARCHIVO_NORMAL_CTA) === 'wght 600 wdth 100' && subfamilia(ARCHIVO_NORMAL_CTA_FUERTE) === 'wght 900 wdth 100'
afirmar(anchosBien(), '3 · Archivo más ancha (wdth 100; el sitio pincha 62), la frase en 600 y el destacado y «HABLANOS» en 900')
// El kerning: «empezó» lleva el par «zó» (−20 unidades): la «ó» queda más cerca de la «z» que sólo con los avances.
const kerningBien = (f: FuenteConKerning): boolean => {
  const conKerning = avancesDe(f, 'empezó', 0)
  const sinKerning = avancesDe({ fuente: f.fuente, kerning: {} }, 'empezó', 0)
  return Object.keys(f.kerning).length >= 5 && conKerning.x[5] < sinKerning.x[5] - 0.015 && conKerning.ancho < sinKerning.ancho
}
const usaElKerning = (a: string, p: string): boolean => a.includes('const avances = avancesDe(fuerte, texto, TRACKING_DEL_CTA.fuerte)') && p.includes('avancesDe(r.fuerte ? fuerte : normal, r.texto, r.fuerte ? TRACKING_DEL_CTA.fuerte : TRACKING_DEL_CTA.frase)') && TRACKING_DEL_CTA.frase < 0 && TRACKING_DEL_CTA.fuerte < TRACKING_DEL_CTA.frase
const armado = sinComentarios(leer('_lib/escena/ctaDelFinal/armadoDelCta.ts'))
const piezas = sinComentarios(leer('_lib/escena/ctaDelFinal/piezasDeLaMetamorfosis.ts'))
afirmar(kerningBien(FUENTES_DEL_CTA.frase) && usaElKerning(armado, piezas), '  el kerning de la fuente (los pares del GPOS) en la frase y en «HABLANOS», con el interletrado de display', `«zó»: ${String(FUENTES_DEL_CTA.frase.kerning['zó'])} y «r.»: ${String(FUENTES_DEL_CTA.frase.kerning['r.'])} unidades; ${String(Object.keys(FUENTES_DEL_CTA.frase.kerning).length)} pares en la frase`)
controlPositivo('  el detector VE la frase sólo con los avances (sin kerning)', { fuente: FUENTES_DEL_CTA.frase.fuente, kerning: {} }, kerningBien)
const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const ctaDom = sinComentarios(leer('_secciones/por-que-develop/CtaTransformado.tsx'))
const tamanosBien = (pq: string, dom: string): boolean => pq.includes("const TAMANO_DEL_CTA = 'escritorio:text-[length:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/3.65))]'") && dom.includes("const TAMANO_DEL_CTA_EN_VOLUMEN = 'escritorio:text-[length:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/2.8))]'")
afirmar(tamanosBien(porQue, ctaDom), '  más grande: la frase con el tope del display y un 1/3,65 del lugar del CTA (era el título XL y 1/5); «HABLANOS», 1,3 veces')
controlPositivo('  el detector VE la frase del tamaño de antes', [porQue.replace('min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/3.65))', ['min(var(--text-fluido-titulo-xl),calc(var(--lugar-del-cta)', '/5))'].join('')), ctaDom] as const, ([a, b]: readonly [string, string]) => tamanosBien(a, b))
// Que entre: si un renglón no entra en el ancho, todos se achican juntos (centrados en su renglón).
const renglones = [{ texto: 'Este sitio empezó', fuerte: false, izquierda: 0, arriba: 100, ancho: 390, alto: 60, cuerpo: 60 }, { texto: 'El tuyo también.', fuerte: true, izquierda: 0, arriba: 160, ancho: 390, alto: 60, cuerpo: 60 }]
const entraBien = (maximo: number): boolean => {
  const letras = letrasDeLaFrase(renglones, FUENTES_DEL_CTA.frase, FUENTES_DEL_CTA.fuerte, maximo)
  const derecha = Math.max(...letras.map((l) => l.x + ((FUENTES_DEL_CTA.fuerte.fuente.data.glyphs[l.c]?.ha ?? 0) / 1000) * l.cuerpo))
  const izquierda = Math.min(...letras.map((l) => l.x))
  return derecha - izquierda <= 350 + 1 && new Set(letras.map((l) => l.cuerpo.toFixed(4))).size === 1
}
afirmar(entraBien(350), '  si no entra en el ancho (el teléfono), la frase se achica entera y queda adentro')
controlPositivo('  el detector VE una frase que se sale del ancho', 2000, entraBien)

// 4 · CADA GLIFO QUE LLEVA AGUJERO LO TIENE: el agujero se decide por GEOMETRÍA (un contorno adentro de un número impar de
// otros), no por el sentido: three lo decide por el sentido (`ShapePath.toShapes`), así que la fuente se escribe con los
// sentidos de cada rol (`scripts-retoque/fuentes-3d.py`, `contornos_en_su_sentido`). Para cada glifo de las fuentes del CTA y de
// los valores: los agujeros que arma three son los que da el anidamiento.
type Poligono = [number, number][]
function contornosCrudos(o: string): Poligono[] {
  const t = o.trim().split(/\s+/)
  const salida: Poligono[] = []
  let actual: Poligono = []
  for (let i = 0; i < t.length;) {
    const op = t[i]
    if (op === 'm') {
      if (actual.length > 0) salida.push(actual)
      actual = [[Number(t[i + 1]), Number(t[i + 2])]]
      i += 3
    } else if (op === 'l') {
      actual.push([Number(t[i + 1]), Number(t[i + 2])])
      i += 3
    } else if (op === 'q') {
      const [a, p, c] = [actual[actual.length - 1], [Number(t[i + 1]), Number(t[i + 2])], [Number(t[i + 3]), Number(t[i + 4])]]
      for (const u of [0.25, 0.5, 0.75, 1]) actual.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * p[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * p[1]])
      i += 5
    } else if (op === 'b') {
      actual.push([Number(t[i + 1]), Number(t[i + 2])])
      i += 7
    } else i += 1
  }
  if (actual.length > 0) salida.push(actual)
  return salida.filter((c) => c.length >= 3)
}
const adentro = ([x, y]: [number, number], pol: Poligono): boolean => {
  let d = false
  for (let k = 0, j = pol.length - 1; k < pol.length; j = k++) if ((pol[k][1] > y) !== (pol[j][1] > y) && x < pol[k][0] + ((y - pol[k][1]) * (pol[j][0] - pol[k][0])) / (pol[j][1] - pol[k][1])) d = !d
  return d
}
const agujerosEsperados = (o: string): number => {
  const cs = contornosCrudos(o)
  return cs.filter((c, k) => cs.filter((d, j) => j !== k && adentro(c[0], d)).length % 2 === 1).length
}
const agujerosDeThree = (f: Font, c: string): number => f.generateShapes(c, 1).reduce((n, s) => n + s.holes.length, 0)
type Glifos = { readonly glyphs: Record<string, { readonly o?: string }> }
const agujerosBien = (fuentes: readonly unknown[]): { ok: boolean; conAgujero: number } => {
  let conAgujero = 0
  const ok = fuentes.every((datos) => {
    const f = new Font(datos as FontData)
    return Object.entries((datos as Glifos).glyphs).every(([c, g]) => {
      if (c.trim() === '' || g.o === undefined) return true
      const esperados = agujerosEsperados(g.o)
      if (esperados > 0) conAgujero += 1
      return esperados === agujerosDeThree(f, c)
    })
  })
  return { ok, conAgujero }
}
const DEL_CTA = [ARCHIVO_NORMAL_CTA, ARCHIVO_NORMAL_CTA_FUERTE, CHIVO_400_VALORES]
const agujeros = agujerosBien(DEL_CTA)
afirmar(agujeros.ok && agujeros.conAgujero >= 20 && leerDeLaRaiz('scripts-retoque/fuentes-3d.py').includes('vueltos = contornos_en_su_sentido(glifos[nombre], glifos, pen)'), '4 · cada glifo que lleva agujero lo tiene (la «o», la «e», la «ó»…): los agujeros de three son los del anidamiento, en las cinco fuentes de la metamorfosis', `${String(agujeros.conAgujero)} glifos con agujero`)
// El control: la «o» de la frase con el agujero escrito en el sentido del borde (como lo dejaba una fuente dada vuelta).
const conLaOVuelta = (): unknown => {
  const d = JSON.parse(JSON.stringify(ARCHIVO_NORMAL_CTA)) as { glyphs: Record<string, { o: string; _cachedOutline?: unknown }> }
  // three guarda en el glifo el contorno ya leído: la copia no lo lleva (si no, three ignora el contorno nuevo).
  for (const g of Object.values(d.glyphs)) delete g._cachedOutline
  const [borde, agujero] = contornosCrudos(d.glyphs.o.o)
  const escribir = (c: Poligono): string => c.map(([x, y], k) => `${k === 0 ? 'm' : 'l'} ${String(Math.round(x))} ${String(Math.round(y))}`).join(' ') + ' z'
  d.glyphs.o.o = `${escribir(borde)} ${escribir([...agujero].reverse())}`
  return d
}
controlPositivo('4 · el detector VE una «o» con el agujero en el sentido del borde', [conLaOVuelta()], (f: readonly unknown[]) => agujerosBien(f).ok)
// Y el disolvente de `fusion` (abierto en las dos puntas): [PULIDO 6] E1 · `fusion` se borró entera (lo fija `s57` E1 · 5).

// 5 · `contorno`, LA DEL PRODUCTO.
const contorno = sinComentarios(leer('_lib/escena/ctaDelFinal/contorno.ts'))
// [PULIDO 6] E1 · `fusion` y `?meta=` se borraron: `contorno` es la única (lo fija `s57` E1 · 5).
afirmar(escena.includes('const meta = armarElContorno(medidas.valores, inicio, medidas.letras,') && !escena.includes('fusion'), '5 · `contorno` es la del producto (y la única: `fusion` se borró en PULIDO 6)')

// La asignación ÓPTIMA (el método húngaro): la misma suma que la mejor de todas las permutaciones, también rectangular.
function mejorPorFuerza(m: readonly (readonly number[])[]): number {
  const n = m.length
  const cols = m[0].length
  let mejor = Infinity
  const recorrer = (i: number, usadas: Set<number>, suma: number): void => {
    if (i === n) return void (mejor = Math.min(mejor, suma))
    for (let j = 0; j < cols; j += 1) if (!usadas.has(j)) recorrer(i + 1, new Set([...usadas, j]), suma + m[i][j])
  }
  recorrer(0, new Set(), 0)
  return mejor
}
const azar = (k: number): number => {
  const s = Math.sin(k * 12.9898) * 43758.5453
  return s - Math.floor(s)
}
const MATRICES = [4, 5, 6].flatMap((n) => [n, n + 2].map((m) => Array.from({ length: n }, (_, i) => Array.from({ length: m }, (__, j) => azar(n * 100 + m * 10 + i * 7 + j)))))
const optimaBien = (f: typeof asignar): boolean => MATRICES.every((m) => {
  const fila = f(m)
  return new Set(fila).size === m.length && Math.abs(fila.reduce((s, j, i) => s + m[i][j], 0) - mejorPorFuerza(m)) < 1e-9
})
afirmar(optimaBien(asignar), '  los contornos se emparejan por posición y área con la asignación ÓPTIMA (el método húngaro, contra la fuerza bruta)')
controlPositivo('  el detector VE una asignación golosa (cada uno el más barato que queda)', ((m: readonly (readonly number[])[]) => {
  const usadas = new Set<number>()
  return m.map((fila) => {
    const j = fila.map((v, k) => ({ v, k })).filter((x) => !usadas.has(x.k)).sort((a, b) => a.v - b.v)[0].k
    usadas.add(j)
    return j
  })
}) as typeof asignar, optimaBien)

// Emparejadas por lugar: dos valores (una «o» a la izquierda, una «e» a la derecha) y la frase «oe»: la «o» de la frase recibe un
// contorno del valor de la izquierda; lo que sobra se cierra (no viaja).
const FUENTES = { valores: new Font(CHIVO_400_VALORES as FontData), frase: FUENTES_DEL_CTA.frase.fuente, fuerte: FUENTES_DEL_CTA.fuerte.fuente }
const valor = (c: string): ValorMedido => ({ letras: [{ c, x: 0, base: 20, cuerpo: 24 }, { c: 'l', x: 14, base: 20, cuerpo: 24 }], iconos: [], ancho: 30, alto: 30, enLaRaiz: null })
const VALORES_DE_PRUEBA = [valor('o'), null, null, valor('e'), null, null]
const INICIO = [{ x: 100, y: 300, escala: 1 }, { x: 0, y: 0, escala: 1 }, { x: 0, y: 0, escala: 1 }, { x: 1200, y: 300, escala: 1 }, { x: 0, y: 0, escala: 1 }, { x: 0, y: 0, escala: 1 }]
const FRASE_DE_PRUEBA = [{ c: 'o', x: 500, base: 400, cuerpo: 80, fuerte: false, orden: 0 }, { c: 'e', x: 800, base: 400, cuerpo: 80, fuerte: false, orden: 1 }]
const pistas = pistasDeLaMetamorfosis(VALORES_DE_PRUEBA, INICIO, FRASE_DE_PRUEBA, FUENTES)
const lugarBien = (ps: typeof pistas): boolean => {
  const pares = ps.filter((p) => p.tipo === 0)
  const deLaO = pares.find((p) => p.t[0].x < 700)
  const deLaE = pares.find((p) => p.t[0].x > 700)
  return pares.length === 2 && deLaO?.item === 0 && deLaE?.item === 3 && ps.some((p) => p.tipo === 3) && ps.every((p) => p.s.length === CONTORNO.puntos && p.t.length === CONTORNO.puntos) && ps.some((p) => p.tipo === 2)
}
afirmar(lugarBien(pistas), '  emparejadas por lugar en la composición: lo de la izquierda va a la izquierda; las que sobran se cierran; los agujeros de la frase se abren (todas de N puntos)', `${String(pistas.length)} pistas: ${String(pistas.filter((p) => p.tipo === 0).length)} pares, ${String(pistas.filter((p) => p.tipo === 3).length)} que sobran`)
controlPositivo('  el detector VE el emparejamiento al revés', pistasDeLaMetamorfosis(VALORES_DE_PRUEBA, [INICIO[3], INICIO[1], INICIO[2], INICIO[0], INICIO[4], INICIO[5]], FRASE_DE_PRUEBA, FUENTES), lugarBien)

// El remuestreo EQUIDISTANTE (por largo de arco) y el ARRANQUE ALINEADO (el giro de puntos con menos distancia).
const rectangulo = [new THREE.Vector2(0, 0), new THREE.Vector2(100, 0), new THREE.Vector2(100, 20), new THREE.Vector2(0, 20), new THREE.Vector2(0, 10)]
const equidistanteBien = (f: typeof remuestrear): boolean => {
  const r = f(rectangulo, 24)
  const tramos = r.map((p, k) => p.distanceTo(r[(k + 1) % r.length]))
  return r.length === 24 && Math.max(...tramos) - Math.min(...tramos) < 0.02 * (240 / 24)
}
afirmar(equidistanteBien(remuestrear), '  el remuestreo es equidistante (por largo de arco)')
controlPositivo('  el detector VE un remuestreo por índice', ((c: readonly THREE.Vector2[], n: number) => Array.from({ length: n }, (_, i) => c[Math.floor((i * c.length) / n)].clone().lerp(c[(Math.floor((i * c.length) / n) + 1) % c.length], ((i * c.length) / n) % 1))) as typeof remuestrear, equidistanteBien)
const circulo = remuestrear(Array.from({ length: 64 }, (_, k) => new THREE.Vector2(Math.cos((k / 64) * Math.PI * 2) * 30, Math.sin((k / 64) * Math.PI * 2) * 30 + (k < 8 ? 6 : 0))), CONTORNO.puntos)
const girado = circulo.map((_, i) => circulo[(i + 13) % circulo.length].clone().multiplyScalar(2).add(new THREE.Vector2(500, 50)))
const arranqueBien = (f: typeof mejorGiro): boolean => girado.map((_, i) => girado[(i + f(girado, circulo)) % girado.length]).every((p, i) => p.distanceTo(circulo[i].clone().multiplyScalar(2).add(new THREE.Vector2(500, 50))) < 1e-6)
afirmar(arranqueBien(mejorGiro), '  el punto de arranque de cada par, alineado (el giro de puntos con menos distancia, centrados y en su escala): no se retuerce')
controlPositivo('  el detector VE un arranque sin alinear', (() => 0) as typeof mejorGiro, arranqueBien)

// La TURBULENCIA en campana: sube y baja suave (sin saltos, empieza y termina con pendiente cero) y es CERO exacto desde antes de
// que termine el cambio; después, la frase es rígida (nada ondula: lo que sigue es venir adelante y crecer en espesor).
const turbulenciaBien = (f: typeof estadoDeLaMetamorfosis): boolean => {
  const T = METAMORFOSIS.contorno.turbulencia
  const fin = T[0] + T[1]
  let maximo = 0
  let paso = 0
  let anterior = 0
  for (let k = 0; k <= 10000; k += 1) {
    const t = f(k / 10000).turbulencia
    maximo = Math.max(maximo, t)
    paso = Math.max(paso, Math.abs(t - anterior))
    anterior = t
  }
  const cero = [...Array(401).keys()].every((k) => f(fin + (k / 400) * (1 - fin)).turbulencia === 0)
  const terminaElCambio = METAMORFOSIS.contorno.cambia[0] + METAMORFOSIS.contorno.cambia[1]
  const suaveEnLasPuntas = f(T[0] + 0.002).turbulencia < 0.001 && f(fin - 0.002).turbulencia < 0.001
  return maximo > 0.99 && paso < 0.002 && cero && fin < terminaElCambio && suaveEnLasPuntas
}
afirmar(turbulenciaBien(estadoDeLaMetamorfosis), '  la turbulencia sube y baja en campana (suave) y llega a CERO exacto antes del final del cambio: formada, la frase queda quieta', `cero desde ${String(METAMORFOSIS.contorno.turbulencia[0] + METAMORFOSIS.contorno.turbulencia[1])}; el cambio termina en ${String(METAMORFOSIS.contorno.cambia[0] + METAMORFOSIS.contorno.cambia[1])}`)
controlPositivo('  el detector VE la turbulencia de antes (con el cambio, sin campana)', ((p: number) => {
  const e = estadoDeLaMetamorfosis(p)
  const cambia = e.cambia
  return { ...e, turbulencia: cambia >= 1 ? 0 : Math.sin(Math.PI * cambia) }
}) as typeof estadoDeLaMetamorfosis, turbulenciaBien)

// TOPOLOGÍA FIJA Y SU COSTO: las pistas se arman una vez; por cuadro sólo se escriben uniformes (nada de triangular ni de rehacer
// geometría): medido en Node, el cuadro cuesta menos de 2 ms de CPU (era 8–11). Las tapas, por stencil (las cuentas +1 de frente
// y −1 de espaldas: la regla no-cero; la cubierta pinta donde no es cero y la vuelve a cero), con el stencil del lienzo; al
// terminar, la malla exacta de la frase.
const cuadro = (p: number): CuadroDeLaMetamorfosis => ({ items: INICIO.map((c) => ({ ...c, cuerpo: 24, cx: c.x + 15, cy: c.y + 15, ancho: 30, alto: 30 })), cajaDeLosValores: { x: 650, y: 315, ancho: 1130, alto: 30 }, cajaDeLaFrase: { x: 700, y: 370, ancho: 400, alto: 90 }, corrimiento: { x: 0, y: 0 }, cuerpoDeLaFrase: 80, fuga: { x: 720, y: 450 }, fondo: 1600, progreso: p, apareceDeLosValores: 1 })
const armada = armarElContorno(VALORES_DE_PRUEBA, INICIO, FRASE_DE_PRUEBA, FUENTES, 'negro')
let peor = 0
for (let k = 0; k <= 400; k += 1) {
  armada.poner(estadoDeLaMetamorfosis(k / 400), cuadro(k / 400))
  peor = Math.max(peor, armada.costo())
}
const visibles = (p: number): string[] => {
  armada.poner(estadoDeLaMetamorfosis(p), cuadro(p))
  return armada.objetos.filter((o) => o.visible).map((o) => o.name)
}
const [aMitad, alFinal] = [visibles(0.5), visibles(1)]
const lienzo = sinComentarios(leer('_lib/escena/configuracionDelCanvas.ts'))
const topologiaBien = (co: string, li: string, costo: number): boolean => costo < 2 && !/triangulateShape|new THREE\.BufferGeometry\(\)\s*\n[^]*?poner/.test(co.slice(co.indexOf('const poner ='))) && co.includes('m.stencilZPass = op') && co.includes('THREE.IncrementWrapStencilOp : THREE.DecrementWrapStencilOp') &&
  co.includes('m.stencilFunc = THREE.NotEqualStencilFunc') && co.includes('m.stencilZPass = THREE.ZeroStencilOp') && co.includes('new THREE.InstancedBufferGeometry()') && li.includes('stencil: true,') &&
  aMitad.length === 4 && alFinal.length === 1 && alFinal[0] === 'metamorfosis · la frase exacta'
afirmar(topologiaBien(contorno, lienzo, peor), '  topología fija (por cuadro, sólo uniformes: menos de 2 ms de CPU), tapas por stencil con la regla no-cero y, al terminar, la malla exacta', `peor cuadro ${peor.toFixed(3)} ms (Node) · a mitad: ${String(aMitad.length)} piezas; al final: ${alFinal.join()}`)
controlPositivo('  el detector VE el lienzo sin stencil', [contorno, lienzo.replace('stencil: true,', ''), peor] as const, ([a, b, c]: readonly [string, string, number]) => topologiaBien(a, b, c))
controlPositivo('  y el costo de antes (re-triangular: 8 ms)', [contorno, lienzo, 8] as const, ([a, b, c]: readonly [string, string, number]) => topologiaBien(a, b, c))
armada.soltar()

// ═══════════════════════════════════════════════════════════════════════════
titulo('D2 · La luz del encastre: marcada y sólida; el logo, lo que más se ve')

// 1 a 4 · `?anillo=` y sus variantes (el tubo, el disco, el filo de las tapas y el tubo con el filo), el ensamble en el golpe y
// el orden con la niebla: [PULIDO 6] E2 · se borraron por decisión («gana el filo: se borran tubo, disco, tubo+filo, el anillo
// y el círculo liso»). El filo de ahora va por AFUERA del logo (`filoConPoder.ts`) y lo fija `s57` E2.
const cuadroD2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const logoDelFinal = sinComentarios(leer('_lib/escena/final/logoDelFinal.ts'))

// 5 · EL LOGO, LO QUE MÁS SE VE: en el final (con la cámara que sube), sin niebla, con menos reflejo del estudio (desde el cenit
// reflejaba su cielo claro) y sin polvo encima (un cilindro sin motas sobre el logo y su círculo). Medido en el banco, en el
// quieto: la mediana del logo, 12 de 255 en las cuatro variantes (en PULIDO 4, ~85: gris medio). [PULIDO 6] E2 · el cilindro
// sin polvo pasa la media diagonal del logo (4,2 u; era el radio del anillo, que se borró, y valía lo mismo).
const parche = sinComentarios(leer('_lib/escena/polvo/parche.ts'))
const luzDelLogo = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const probeLogo = sinComentarios(leer('_lib/escena/ProbeLogo.tsx'))
const logoProfundoBien = (lf: string, reflejo: typeof reflejoDelLogo): boolean => lf.includes('gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor * ( 1.0 - uLogoDelFinal ) );') && lf.includes(".replace('#include <fog_fragment>', NIEBLA_GLSL)") &&
  reflejo(1, 0) === 1 && reflejo(1, 1) <= 0.25 && luzDelLogo.includes('material.envMapIntensity = reflejoDelLogo(Math.min(1, principal.intensity / KEY_INTENSITY), LOGO_DEL_FINAL_EN_VIVO.uLogoDelFinal.value)') &&
  (probeLogo.match(/conElLogoDelFinal\(built\)/g) ?? []).length === 2 && cuadroD2.includes('LOGO_DEL_FINAL_EN_VIVO.uLogoDelFinal.value = sube') &&
  parche.includes('uSinPolvoSobreElLogo.z + 1.5') && cuadroD2.includes('AIRE.uSinPolvoSobreElLogo.value.set(logo?.position.x ?? 0, logo?.position.z ?? 0, LOGO_DEL_FINAL.sinPolvo, sube)') && LOGO_DEL_FINAL.sinPolvo > 4.2
afirmar(logoProfundoBien(logoDelFinal, reflejoDelLogo), '5 · el logo, lo que más se ve: en el final sin niebla, con menos reflejo del estudio y sin polvo encima', `reflejo ${String(LOGO_DEL_FINAL.reflejo)} del de siempre; sin polvo hasta ${String(LOGO_DEL_FINAL.sinPolvo)} u`)
controlPositivo('5 · el detector VE el logo con todo el reflejo del estudio', ((nivel: number) => nivel) as typeof reflejoDelLogo, (r: typeof reflejoDelLogo) => logoProfundoBien(logoDelFinal, r))

// 6 · UN SOLO GOLPE (ganó `b`, el de la sala; `a` «se escucha saturado»): en el sprite, el catálogo y el doc; sin bandera.
const sonidoDoc = leerDeLaRaiz('docs/rediseno/SONIDO.md')
const golpeBien = (cortes: Record<string, unknown>): boolean => 'golpe' in cortes && !('golpe-a' in cortes) && !('golpe-b' in cortes) && SONIDOS.golpe.volumen >= SONIDOS.pulso.volumen &&
  /^\| `golpe` \|/m.test(sonidoDoc) && !/^\| `golpe-[ab]` \|/m.test(sonidoDoc) && cuadroD2.includes("sonar('golpe')") && !('golpe' in ENTORNO.pruebas)
afirmar(golpeBien(CORTES_DEL_SPRITE), '6 · un solo golpe, el de la sala (era `golpe-b`; `golpe-a` y `?golpe=` se borraron)', `${String(CORTES_DEL_SPRITE.golpe[1])} ms`)
controlPositivo('6 · el detector VE el sprite con los dos golpes', { ...CORTES_DEL_SPRITE, 'golpe-a': [0, 0] }, golpeBien)

cerrar('s56-pulido-5')
