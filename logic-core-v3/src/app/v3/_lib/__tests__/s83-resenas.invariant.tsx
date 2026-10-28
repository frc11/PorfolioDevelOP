/**
 * INVARIANTE — [NOCTURNO B2] LAS RESEÑAS EN EL ARO 3D (cola del 2026-10-22, `60-B2B3-resenas-cta.md`). Sin navegador: lo puro del tramo, del
 * aro, del giro del título y de la ida de los valores, el contenido, la fuente y el cableado. Cada afirmación con su control positivo. Lo que
 * se ve (el encuadre, el contraste en la placa, el costo por cuadro) lo miden los bancos `scripts-carga/aro-*.ts` en el navegador.
 *
 * Corre con `npm run test:s83-resenas`.
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

import { NOMBRES_REALES, escanearContenido } from '../../_secciones/_contrato/escaneo'
import { CapaDelAro } from '../../_secciones/por-que-develop/resenas/CapaDelAro'
import { RESENAS, TEXTO_DE_LAS_RESENAS, TITULO_DE_LAS_RESENAS, enlaceDelTrabajo } from '../../_secciones/por-que-develop/resenas/contenido'
import { DISOLUCION, estiloDeLaIda, idaDelValor } from '../../_secciones/por-que-develop/resenas/disolucion'
import { ALTO_DEL_ESPACIADOR_SVH, ESPACIO_ENTRE_LAS_MITADES_EM, INSERCION_DE_LAS_RESENAS, DURACION_DE_LA_ENTRADA_S, GATILLO, K_DE_LAS_RESENAS, LARGO_SIN_ESTIRAR_PX, PANTALLAS_DE_LAS_RESENAS, angulosDelGiro, avanceDeLasResenas, controlDeLaBandera, corrimientoConElGiro, corrimientosAlCentro, estadoDelAvance, objetivoDelGatillo, pinSinLasResenas, tramoDeLasResenas, varianteDeLaBandera, vueltaDelGiro } from '../../_secciones/por-que-develop/resenas/tramo'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { CAMARA_DEL_GUARDADO_EN_EL_GATILLO, HACIA_EL_CTA, VUELTA_DEL_CTA, aperturaDelHueco, bajadaDeLasResenas, cruceDeLaVuelta, esperaDelCta, objetivoDeLaBajada, pesoDeLaCamara, progresoDelGatillo } from '../../_secciones/por-que-develop/resenas/haciaElCta'
import { SETTLE_TAU } from '../escena/choreographyPhysics'
import { dampTowards } from '../escena/choreographySampler'
import { MIRA_AL_HUECO, POSE_DEL_GUARDADO, desvioDelGuardado, type PoseDelGuardado } from '../escena/resenas/camaraDelGuardado'
import { POSES_DEL_FINAL } from '../escena/finalDelRecorrido'
import type { Armado } from '../escena/titulos3d/armado'
import { TRANSFORMACION, caraDelCta } from '../escena/ctaDelFinal/transformacion'
import { ENGANCHE_DE_LAS_GRIETAS, avisarLaVueltaDelCta } from '../escena/resenas/enganches'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { CAPA_DEL_ARO } from '../escena/resenas/enVivo'
import { OPACIDAD_DE_LA_TARJETA, cajaDeLaPlaca, cajaDelLogo, esconderLasTarjetas, llevarLaTarjeta, nuevaCaja, nuevaTarjeta, tamanoDeLasTarjetas } from '../escena/resenas/tarjetas'
import { armarLasPlacas, enLaNiebla } from '../escena/resenas/placas'
import { aplicar } from '../pie3d/homografia'
import { ARO, VELOCIDAD_DE_LECTURA, curvaDeLaEntrada, finDeLaEntrada, medidasDeLaEscala, medidasDelAro, textoConLaEntrada, nieblaDeLaPlaca, nuevaPose, pasoDelGiro, placasQueSeLeen, poseDeLaPlaca, resenaDeLaPlaca, textoDeLaPlaca, type GiroDelAro } from '../escena/resenas/aro'
import { CORRIMIENTOS_DE_LOS_TITULOS, GIROS_DE_LOS_TITULOS, girarElTitulo, seVeConElGiro } from '../escena/titulos3d/giro'
import { medidaSinElEstiramiento, anotarTramo } from '../escena/tramoEstirado'
import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const RAIZ = process.cwd()
const V3 = path.join(RAIZ, 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const cerca = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) <= eps

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El pin de siempre: igual antes del tramo, quieto adentro, corrido después')

const PIN_NUEVO = PANTALLAS_DE_POR_QUE_DEVELOP - 1 + PANTALLAS_DE_LAS_RESENAS
const PIN_VIEJO = PANTALLAS_DE_POR_QUE_DEVELOP - 1
const muestras = Array.from({ length: 1001 }, (_, i) => i / 1000)
const pinBien = (f: (p: number) => number): boolean =>
  muestras.every((p) => {
    const s = p * PIN_NUEVO
    const esperado = s <= INSERCION_DE_LAS_RESENAS ? s / PIN_VIEJO : s <= INSERCION_DE_LAS_RESENAS + PANTALLAS_DE_LAS_RESENAS ? INSERCION_DE_LAS_RESENAS / PIN_VIEJO : (s - PANTALLAS_DE_LAS_RESENAS) / PIN_VIEJO
    return cerca(f(p), esperado)
  })
afirmar(pinBien(pinSinLasResenas), `el pin de siempre en 1001 puntos (${String(PIN_NUEVO)} pantallas de pin → ${String(PIN_VIEJO)}; quieto de ${String(INSERCION_DE_LAS_RESENAS)} a ${String(INSERCION_DE_LAS_RESENAS + PANTALLAS_DE_LAS_RESENAS)})`)
afirmar(pinSinLasResenas(0) === 0 && cerca(pinSinLasResenas(1), 1), '  y sus puntas: 0 y 1')
controlPositivo('el detector ve un pin sin el corrimiento de después', (p: number) => Math.min(1, (p * PIN_NUEVO) / PIN_VIEJO), pinBien)
afirmar(avanceDeLasResenas(INSERCION_DE_LAS_RESENAS / PIN_NUEVO) === 0 && cerca(avanceDeLasResenas((INSERCION_DE_LAS_RESENAS + PANTALLAS_DE_LAS_RESENAS) / PIN_NUEVO), 1), 'el avance del tramo: 0 en la inserción, 1 al final de sus cuatro pantallas')
afirmarIgual(ALTO_DEL_ESPACIADOR_SVH, (PANTALLAS_DE_POR_QUE_DEVELOP - 1 + PANTALLAS_DE_LAS_RESENAS) * 100, 'el espaciador: la caja clavada (100 svh) más él dan las 7 pantallas de siempre más las 4 del tramo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · REGLA DE ALTURAS: la escena ve el scroll de siempre (antes, adentro casi quieta, después sin deriva)')

const ANCHOS = [
  { nombre: '1440×900', ancho: 1440, alto: 900 },
  { nombre: '1024×768', ancho: 1024, alto: 768 },
]
const panelEn = (top: number): Element => ({ getBoundingClientRect: () => ({ top }), isConnected: true }) as unknown as Element
const deriva = (alto: number, conTramo: boolean): number[] => {
  const tope = 20000
  const soltar = conTramo ? anotarTramo(tramoDeLasResenas(panelEn(tope))) : (): void => undefined
  const ver = (y: number): number => medidaSinElEstiramiento(y, 1e7, 0, alto, { y: 0, abajo: 0 }).y
  // Lo que la escena ve contra el pin de siempre: en la inserción, al final del tramo (más los px estirados) y al final del pin.
  const enLaInsercion = ver(tope + INSERCION_DE_LAS_RESENAS * alto) - (tope + INSERCION_DE_LAS_RESENAS * alto)
  const alFinalDelTramo = ver(tope + (INSERCION_DE_LAS_RESENAS + PANTALLAS_DE_LAS_RESENAS) * alto) - (tope + INSERCION_DE_LAS_RESENAS * alto)
  const alFinalDelPin = ver(tope + PIN_NUEVO * alto) - (tope + PIN_VIEJO * alto)
  soltar()
  return [enLaInsercion, alFinalDelTramo, alFinalDelPin].map((x) => Math.round(x * 1000) / 1000)
}
for (const a of ANCHOS) {
  const d = deriva(a.alto, true)
  afirmar(d[0] === 0 && cerca(d[1], (PANTALLAS_DE_LAS_RESENAS * a.alto) / K_DE_LAS_RESENAS, 1e-3) && cerca(d[2], 0, 1e-3), `${a.nombre}: en la inserción 0 px, al final del tramo ${String(d[1])} px (sus cuatro pantallas, a 1/k: la sala casi quieta), al final del pin ${String(d[2])} px de deriva`)
  console.log(`      alto de la sección: ${String(PANTALLAS_DE_POR_QUE_DEVELOP * a.alto)} px → ${String((PANTALLAS_DE_POR_QUE_DEVELOP + PANTALLAS_DE_LAS_RESENAS) * a.alto)} px; k = ${String(K_DE_LAS_RESENAS)}`)
}
controlPositivo('sin anotar el tramo la escena llega 4 pantallas tarde al final del pin', false, (conTramo) => cerca(deriva(900, conTramo)[2], 0, 1e-3))
afirmarIgual(K_DE_LAS_RESENAS, (PANTALLAS_DE_LAS_RESENAS * 900 + LARGO_SIN_ESTIRAR_PX) / LARGO_SIN_ESTIRAR_PX, 'la k: (4 × 900 + 9) / 9 = 401, la misma en todo ancho de escritorio')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los momentos del tramo y las dos variantes (B3: sin rebobinado, la media pantalla del CTA sigue con todo puesto)')

const e = (r: number, d: number | null = null): number[] => Object.values(estadoDelAvance(r, d)).map((x) => Math.round(x * 1000) / 1000)
afirmarIgual([e(0), e(0.125), e(0.25), e(0.5), e(0.7)], [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 1, 1]], 'scroll: el título (0 a 0,125), los valores (a 0,25), la entrada (a 0,5) y la lectura con todo puesto')
afirmarIgual(e(1), [1, 1, 1], '[B3] al final del tramo todo sigue puesto: lo toma la transformación al CTA (el título, el aro que baja)')
controlPositivo('el detector ve un tramo que rebobina antes del CTA', { giro: 0, disolucion: 0, entrada: 0 }, (x) => x.entrada === 1 && x.giro === 1)
afirmarIgual(e(0.6, 0), [0, 0, 0], 'gatillo: con la animación en 0, nada (aunque el scroll esté adentro)')
afirmarIgual(e(0.6, 1), [1, 1, 1], '  y con la animación entera, todo')
afirmar(objetivoDelGatillo(0.03, 0) === 1 && objetivoDelGatillo(0.01, 1) === 1 && objetivoDelGatillo(0.001, 1) === 0 && objetivoDelGatillo(0.01, 0) === 0, 'el gatillo: entra al pasar 0,02 del tramo, sale al volver arriba de 0,005 (sin titilar en el medio)')
// [L5] La spec cambió (70 de la revisión 3: «con scroll mejor»): scroll por defecto, el gatillo de la entrada queda con la bandera.
const scrollPorDefecto = (f: (v: string | null) => string): boolean => f(null) === 'scroll' && f('scroll') === 'scroll' && f('gatillo') === 'gatillo' && f('x') === 'scroll'
afirmar(scrollPorDefecto(varianteDeLaBandera), '?resenas=: [L5] scroll por defecto, gatillo con la bandera (se conserva)')
controlPositivo('el detector ve la bandera de antes (gatillo por defecto, C2-70)', (v: string | null) => (v === 'scroll' ? 'scroll' : 'gatillo'), scrollPorDefecto)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El giro del título: una sola cara a la vista, de canto en la mitad')

const caras = (g: number, a = angulosDelGiro(g)): number => Number(seVeConElGiro(a.frase)) + Number(seVeConElGiro(a.resenas))
afirmar(muestras.filter((g) => Math.abs(g - 0.5) > 0.01).every((g) => caras(g) === 1), 'en cada punto del giro (salvo el canto) se ve exactamente una de las dos')
afirmar(caras(0.5) === 0, '  y en la mitad, de canto, ninguna')
afirmarIgual([seVeConElGiro(angulosDelGiro(0).frase), seVeConElGiro(angulosDelGiro(1).resenas)], [true, true], '  al empezar, «Seis razones»; al terminar, «Lo que dicen nuestros clientes»')
controlPositivo('el detector ve las dos caras a la vez (el título de las reseñas sin la media vuelta)', 0.2, (g) => caras(g, { frase: angulosDelGiro(g).frase, resenas: angulosDelGiro(g).frase - 0.2 }) === 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los valores se van en el aire, de abajo hacia arriba, y en 0 no queda nada escrito')

afirmar([0, 1, 2, 3, 4, 5].every((k) => estiloDeLaIda(idaDelValor(0, k)) === null), 'con la ida en 0 no se escribe nada (la medida del CTA los lee planos)')
afirmar([0, 1, 2, 3, 4, 5].every((k) => idaDelValor(1, k) === 1 && estiloDeLaIda(1)?.opacity === '0.000'), '  con la ida entera, los seis apagados')
const orden = (f: (d: number, k: number) => number): boolean => muestras.every((d) => f(d, 2) >= f(d, 1) && f(d, 1) >= f(d, 0) && f(d, 5) >= f(d, 4) && f(d, 4) >= f(d, 3) && f(d, 2) === f(d, 5))
afirmar(orden(idaDelValor), `de a pares (izquierda y derecha juntas) y de ABAJO hacia arriba (escalón ${String(DISOLUCION.escalon)})`)
controlPositivo('el detector ve una ida de arriba hacia abajo', (d: number, k: number) => idaDelValor(d, 2 - (k % 3) + (k >= 3 ? 3 : 0)), orden)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El aro: las de adelante se leen; las de atrás pierden el texto antes que la forma; el cambio de reseña nunca se ve')

const M = medidasDelAro(1.6)
afirmarIgual(placasQueSeLeen(0, M), [0, 1, 9], 'con el aro quieto en su lugar, se leen las tres de adelante (la del frente y sus vecinas)')
const giros = Array.from({ length: 721 }, (_, i) => (i * Math.PI) / 360)
afirmar(giros.every((g) => placasQueSeLeen(g, M).length >= 2 && placasQueSeLeen(g, M).length <= 3), 'girando, en cada medio grado se leen dos o tres')
const angulos = Array.from({ length: 3601 }, (_, i) => ((i - 1800) * Math.PI) / 1800)
const textoAntes = (texto: (a: number) => number, niebla: (a: number) => number): boolean => angulos.every((a) => niebla(a) === 0 || texto(a) === 0)
afirmar(textoAntes(textoDeLaPlaca, nieblaDeLaPlaca), `el texto se va (a ${String(ARO.texto.nada)}°) antes de que la placa entre en la niebla (${String(ARO.niebla.desde)}°)`)
controlPositivo('el detector ve una niebla que empieza con texto', (a: number) => (Math.abs(a) > 0.9 ? 1 : 0), (n) => textoAntes(textoDeLaPlaca, n))
const cambiosOcultos = (f: (i: number, g: number, n: number) => number): boolean => {
  for (let i = 0; i < ARO.placas; i += 1) {
    for (let k = 1; k < 2000; k += 1) {
      const [g0, g1] = [((k - 1) * 4 * Math.PI) / 2000 - Math.PI, (k * 4 * Math.PI) / 2000 - Math.PI]
      if (f(i, g0, RESENAS.length) === f(i, g1, RESENAS.length)) continue
      const p = poseDeLaPlaca(i, 1, g1, M, nuevaPose())
      if (nieblaDeLaPlaca(p.angulo) < 0.995 || textoDeLaPlaca(p.angulo) > 0) return false
    }
  }
  return true
}
afirmar(cambiosOcultos(resenaDeLaPlaca), 'cada placa cambia de reseña sólo en la nuca (sin texto y fuera de la niebla), en dos vueltas, para los dos lados')
// [C2-70] Con diez reseñas para diez placas cada placa muestra siempre la suya (no hay cambio); el error del control cambia de a una en el frente, ve igual con cualquier cantidad.
controlPositivo('el detector ve un cambio en el frente', (i: number, g: number, n: number) => (i + Math.floor((g + (i * 2 * Math.PI) / ARO.placas) / (2 * Math.PI)) + n * 4) % n, cambiosOcultos)
const sinRepetir = (n: number): boolean => giros.every((g) => {
  const vistas = placasQueSeLeen(g, M).map((i) => resenaDeLaPlaca(i, g, n))
  return new Set(vistas).size === vistas.length
})
afirmar(sinRepetir(RESENAS.length), `entre las que se leen nunca se repite una reseña (${String(RESENAS.length)} reseñas, ${String(ARO.placas)} placas)`)
controlPositivo('el detector ve repetidas con menos reseñas que las que se leen', 2, sinRepetir)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La entrada: en 0 las dos cadenas están afuera del cuadro (pose B); en 1, todas en el aro')

const camara = new THREE.PerspectiveCamera(35, 1.6, 0.1, 400)
camara.position.set(0, -3.2, 16)
camara.lookAt(0, 0, 0)
camara.updateMatrixWorld()
const afuera = (m: typeof M): boolean =>
  Array.from({ length: ARO.placas }, (_, i) => i).every((i) => {
    const p = poseDeLaPlaca(i, 0, 0, m, nuevaPose())
    const derecha = new THREE.Vector3(Math.cos(p.mira), 0, -Math.sin(p.mira))
    return [-1, 1].every((s) => {
      const v = new THREE.Vector3(p.x, -2.5, p.z).addScaledVector(derecha, (s * m.ancho) / 2).project(camara)
      return Math.abs(v.x) > 1 || v.z > 1
    })
  })
afirmar(afuera(M), 'con la entrada en 0 ninguna esquina de ninguna placa está en el cuadro (1440 × 900, la pose de los valores)')
controlPositivo('el detector ve una cadena que arranca adentro (sin la recta)', { ...M, recorrido: Math.PI * M.radio }, afuera)
afirmar(Array.from({ length: ARO.placas }, (_, i) => poseDeLaPlaca(i, 1, 0.3, M, nuevaPose()).enElAro).every(Boolean), 'con la entrada entera, las diez en el aro')
const continua = muestras.slice(1).every((x, k) => Array.from({ length: ARO.placas }, (_, i) => i).every((i) => {
  const [a, b] = [poseDeLaPlaca(i, muestras[k], 0, M, nuevaPose()), poseDeLaPlaca(i, x, 0, M, nuevaPose())]
  return Math.hypot(a.x - b.x, a.z - b.z) <= (M.recorrido / 1000) * 1.01
}))
afirmar(continua, 'la entrada es continua: ningún salto entre dos puntos vecinos de la entrada (función pura: para atrás, en reversa)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El giro: lento y solo; el hover lo frena; quieto con el aro sin armar; el arrastre con inercia')

const correr = (g: GiroDelAro, s: number, ...a: [boolean, boolean, boolean, boolean, number]): GiroDelAro => {
  for (let t = 0; t < s; t += 1 / 60) pasoDelGiro(g, 1 / 60, ...a)
  return g
}
const libre = correr({ angulo: 0, velocidad: 0 }, 10, true, false, false, false, 0)
afirmar(cerca(libre.velocidad, VELOCIDAD_DE_LECTURA, 1e-4) && libre.angulo > 0, `gira solo a velocidad de lectura (una vuelta en ${String(ARO.vueltaS)} s)`)
const frenado = correr({ angulo: 0, velocidad: VELOCIDAD_DE_LECTURA }, 2, true, true, false, false, 0)
afirmar(Math.abs(frenado.velocidad) < VELOCIDAD_DE_LECTURA * 0.01, 'con una placa señalada (hover o foco) frena hasta parar en dos segundos')
controlPositivo('el detector ve un aro que no frena', correr({ angulo: 0, velocidad: VELOCIDAD_DE_LECTURA }, 2, true, false, false, false, 0), (g) => Math.abs(g.velocidad) < VELOCIDAD_DE_LECTURA * 0.01)
afirmar(correr({ angulo: 1, velocidad: 0 }, 5, false, false, false, false, 0).angulo === 1 && correr({ angulo: 1, velocidad: 0 }, 5, true, false, true, false, 0).angulo === 1, 'sin armar, o con movimiento reducido, no gira')
const soltado = correr({ angulo: 0, velocidad: 2 }, 6, true, false, false, false, 0)
afirmar(soltado.velocidad < 2 * 0.1 + VELOCIDAD_DE_LECTURA && soltado.velocidad > VELOCIDAD_DE_LECTURA * 0.9, 'un arrastre soltado rápido sigue girando y se calma a la velocidad de lectura (la inercia)')
const arrastrado = pasoDelGiro({ angulo: 0, velocidad: 0 }, 1 / 60, true, false, false, true, 0.05)
afirmar(cerca(arrastrado.angulo, 0.05), 'arrastrando, el aro sigue al puntero')

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · El contenido: ficticio con aspecto final, sin cifras, sin clientes reales, con su retrato y su trabajo')

afirmar(RESENAS.length >= ARO.placas, `${String(RESENAS.length)} reseñas para ${String(ARO.placas)} placas`)
const texto = RESENAS.flatMap((r) => [r.cita, r.nombre, r.negocio]).join(' ') + ` ${TITULO_DE_LAS_RESENAS.izquierda} ${TITULO_DE_LAS_RESENAS.derecha} ${TEXTO_DE_LAS_RESENAS.verTrabajo}`
afirmarIgual(escanearContenido(texto), [], 'el escáner de contenido no encuentra cifras ni precios')
controlPositivo('el escáner ve una cita con una cifra', `${texto} Vendimos un 40% más.`, (t) => escanearContenido(t).length === 0)
afirmar(!NOMBRES_REALES.some((n) => texto.includes(n)), 'ninguna reseña nombra a un cliente real')
afirmar(RESENAS.every((r) => existsSync(path.join(RAIZ, 'public', r.foto))), 'cada retrato existe (public/v3/resenas)')
// [C2-70] Diez personas generadas, una por reseña (cinco y cinco): ninguna foto repetida, webp chicas (el avatar mide ~40 px).
const fotosUnicas = (fotos: readonly string[]): boolean => new Set(fotos).size === fotos.length && fotos.every((x) => /^\/v3\/resenas\/[a-z]+\.webp$/.test(x))
afirmar(fotosUnicas(RESENAS.map((r) => r.foto)) && RESENAS.every((r) => statSync(path.join(RAIZ, 'public', r.foto)).size <= 8000), `cada reseña con su retrato propio en webp chico (${String(RESENAS.length)} fotos)`)
controlPositivo('el detector ve un retrato repetido (las siluetas de antes, de a cuatro)', ['/v3/resenas/a.webp', '/v3/resenas/a.webp'], fotosUnicas)
afirmar(RESENAS.every((r) => ANCLAS_DEL_PORTFOLIO.some((a) => `#${a.id}` === enlaceDelTrabajo(r))), 'cada «Ver trabajo →» va a un deep link del Portfolio (B1)')
afirmar(!/llave|conLlave|CONTENIDO_INVENTADO/.test(leer('_secciones/por-que-develop/resenas/contenido.ts').replace(/\/\*[\s\S]*?\*\//g, '')), 'sin la llave de contenido falso (decisión de Valentino)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · La fuente: cada letra del título nuevo está en la Chivo de los títulos')

const glifos = (JSON.parse(readFileSync(path.join(V3, '_fuentes/chivo-400-titulos.json'), 'utf8')) as { glyphs: Record<string, unknown> }).glyphs
const tiene = (g: Record<string, unknown>): boolean => [...`${TITULO_DE_LAS_RESENAS.izquierda}${TITULO_DE_LAS_RESENAS.derecha}`].every((c) => c === ' ' || c in g)
afirmar(tiene(glifos), '«Lo que dicen» y «nuestros clientes» con todas sus letras (la L y la d, regeneradas)')
controlPositivo('el detector ve la fuente vieja (sin la L ni la d)', Object.fromEntries(Object.entries(glifos).filter(([c]) => c !== 'L' && c !== 'd')), tiene)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · El cableado: el pin traducido, el tramo, la lista, el giro, el módulo del aro y el viaje del menú')

const porQue = leer('_secciones/por-que-develop/PorQueDevelop.tsx')
const cableado = (f: string): boolean => /const pin = usePinSinLasResenas\(pinDelBloque\)/.test(f) && f.includes('<EscenarioDeLasResenas pin={pinDelBloque} />') && f.includes('<EspaciadorDeLasResenas />') && f.includes('<ResenasEnLista />')
afirmar(cableado(porQue), 'el escenario usa el pin de siempre, monta las reseñas con el pin del bloque y suma el espaciador; la lista, su carrusel')
controlPositivo('el detector ve un escenario sin el espaciador', porQue.replace('<EspaciadorDeLasResenas />', ''), cableado)
const titulos = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
afirmar(/ubicar\(a, d, deColocar\)\n.*\n\s*a\.malla\.visible = girarElTitulo\(a\)/.test(titulos), 'los títulos de volumen se dan vuelta en su lugar después de ubicarse')
const pruebas = leer('_lib/escena/PruebasDeLaEscena.tsx')
afirmar(/\{escritorio && \(\s*<Suspense fallback=\{null\}>\s*<EscenaDeLasResenas \/>/.test(pruebas), 'el aro en su módulo, sólo desde 1024 (abajo ni se descarga)')
afirmar(/espaciador-de-las-resenas[\s\S]*PANTALLAS_DE_LAS_RESENAS \* v/.test(leer('_componentes/destinosDelViaje.ts')), 'el viaje a «Por qué develOP» descuenta el tramo (cae donde caía)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · [B3] Reseñas → CTA: el anillo y la bajada a la par del giro del cartel; el título de las reseñas es el origen; el enganche de B9')

const GIRO_DEL_CARTEL = [TRANSFORMACION.giro.desde, TRANSFORMACION.giro.desde + TRANSFORMACION.giro.gira] as const
const aLaPar = (baja: (p: number) => number): boolean => {
  const empieza = muestras.find((p) => baja(p) > 0) ?? 1
  const termina = muestras.find((p) => baja(p) >= 1) ?? 1
  return empieza < GIRO_DEL_CARTEL[0] && termina <= GIRO_DEL_CARTEL[1] + 0.002 && termina > GIRO_DEL_CARTEL[0]
}
afirmar(aLaPar(bajadaDeLasResenas), `las reseñas bajan AL MISMO TIEMPO que el título se da vuelta: empiezan antes del giro del cartel (${String(GIRO_DEL_CARTEL[0])}) y terminan con él (${String(GIRO_DEL_CARTEL[1])})`)
controlPositivo('el detector ve una bajada que termina después del giro', (p: number) => bajadaDeLasResenas(p - 0.3), aLaPar)
afirmar(muestras.every((p) => bajadaDeLasResenas(p) <= 0 || aperturaDelHueco(p) > 0 || bajadaDeLasResenas(p) >= 1), 'mientras una placa baja, el anillo está abierto')
afirmar(aperturaDelHueco(0) === 0 && aperturaDelHueco(1) < 1e-6 && Math.max(...muestras.map(aperturaDelHueco)) > 0.999, '  y el anillo se abre y se vuelve a cerrar (en 0 y en 1, cerrado)')
afirmar(bajadaDeLasResenas(0) === 0 && bajadaDeLasResenas(1) === 1, '  función del progreso: al subir, todo vuelve (en 0, el aro en su lugar)')
afirmar(objetivoDeLaBajada(0.05, 0) === 1 && objetivoDeLaBajada(0.02, 1) === 1 && objetivoDeLaBajada(0.005, 1) === 0, 'gatillo: la bajada se dispara al empezar la transformación y vuelve al subir')
afirmar(bajadaDeLasResenas(progresoDelGatillo(1)) === 1 && aperturaDelHueco(progresoDelGatillo(1)) < 1e-6 && bajadaDeLasResenas(progresoDelGatillo(0)) === 0, '  y su animación recorre la ventana entera (abre, baja y cierra)')
afirmar(Math.abs(caraDelCta(VUELTA_DEL_CTA)) < 0.02, `el momento del enganche (${VUELTA_DEL_CTA.toFixed(2)}) es el cartel de canto`)
const cruces = muestras.map((p, k) => cruceDeLaVuelta(muestras[Math.max(0, k - 1)], p)).filter((c) => c !== null)
afirmarIgual(cruces, ['ida'], 'bajando, el enganche se cruza una vez (ida)')
afirmarIgual(cruceDeLaVuelta(0.9, 0.1), 'vuelta', '  y subiendo, vuelta')
const antes = ENGANCHE_DE_LAS_GRIETAS.veces
avisarLaVueltaDelCta('ida')
afirmar(ENGANCHE_DE_LAS_GRIETAS.veces === antes + 1, 'el enganche de B9 existe y se llama (vacío: B9 instala su disparador)')
const cta = leer('_secciones/por-que-develop/CtaTransformado.tsx')
const origen = (f: string): boolean => /TITULOS_DE_VOLUMEN\.has\(TITULOS_DE_LAS_RESENAS\[0\]\) \? TITULOS_DE_LAS_RESENAS : FRASE_DE_VOLUMEN/.test(f)
afirmar(origen(cta), 'con las reseñas, el cartel del CTA sale del título de las reseñas (lo que se da vuelta y se vuelve el CTA)')
controlPositivo('el detector ve el origen de siempre', cta.replace(/const ids[^\n]*\n/, ''), origen)
const delCta = leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx')
afirmar(/CTA_EN_VIVO\.sinLosValores \? 0 : apareceDeLosValores\(p\)/.test(delCta), 'sin los valores (se fueron antes del aro): la transformación no los redibuja y la frase llega del otro lado de sus placas')
afirmar(/abrirElHueco\(s\.hueco, v\.hueco\)/.test(leer('_lib/escena/resenas/EscenaDeLasResenas.tsx')), 'la escena abre el anillo con lo que dice el DOM')
afirmar(Math.abs(HACIA_EL_CTA.baja[0] + HACIA_EL_CTA.baja[1] - GIRO_DEL_CARTEL[1]) < 1e-9, '  y la bajada termina exactamente con el giro del cartel')

// ═══════════════════════════════════════════════════════════════════════════
titulo('13 · [B2, después de verla] El texto de cada placa: encima del lienzo, visible, en tinta, en el frente de su placa; el aro, calmo')

// a · Encima del lienzo: la sección (z-10) va arriba de la escena (fija, z-0); la capa de las tarjetas es hija directa de la caja clavada,
// después de la levantada (que se apaga sin WebGL), y su envoltorio no tiene caja (`contents`).
afirmar(/'relative z-10 /.test(leer('_componentes/Panel.tsx')) && /CLASES_FUERA_DE_FLUJO = 'fixed inset-0 z-0 pointer-events-none'/.test(leer('_lib/compuerta.ts')), 'la sección va arriba de la escena: el panel en z-10, el lienzo fijo en z-0')
const hijaDeLaCaja = (f: string): boolean => /<\/motion\.div>\n(?:\s*<[A-Za-z][^\n]*\/>\n)*\s*<EscenarioDeLasResenas pin=\{pinDelBloque\} \/>\n {4}<\/div>/.test(f)
afirmar(hijaDeLaCaja(porQue), 'la capa de las tarjetas es hija de la caja clavada, después de la levantada: ninguna opacidad de otra pieza le llega')
controlPositivo('el detector ve la capa adentro de la levantada', '</motion.div>\n      <motion.div style={{ opacity }}>\n      <EscenarioDeLasResenas pin={pinDelBloque} />\n      </motion.div>\n    </div>', hijaDeLaCaja)
afirmar(/className="contents"/.test(leer('_secciones/por-que-develop/resenas/EscenarioDeLasResenas.tsx')), '  y el envoltorio de las reseñas no tiene caja (`contents`): la capa se posiciona contra la caja clavada')
const capa = renderToStaticMarkup(<CapaDelAro />)
const raizDeLaCapa = /^<div[^>]*>/.exec(capa)?.[0] ?? ''
afirmar(/style="z-index:1"/.test(raizDeLaCapa) && /absolute inset-0/.test(raizDeLaCapa) && !/opacity/.test(raizDeLaCapa), 'la capa va arriba de sus hermanas de la caja clavada (z 1) y sin opacidad propia')
const conCartel = (marcado: string): boolean => marcado.includes('data-pieza="cartel-del-arrastre"') && marcado.includes(TEXTO_DE_LAS_RESENAS.arrastrar) && !/resenas-arrastre/.test((leer('_secciones/por-que-develop/resenas/useTramoDeLasResenas.ts') + leer('_secciones/por-que-develop/resenas/tramo.ts')).replace(/\/\*[\s\S]*?\*\//g, ''))
afirmar(conCartel(capa), '[C2-70] el arrastre sin bandera y el cartel «Mantené para arrastrar» en la capa del aro')
controlPositivo('el detector ve la capa sin el cartel', capa.replace('cartel-del-arrastre', 'otra'), conCartel)
// b · Visible y en tinta: cada tarjeta lleva la cara de papel con la tinta, y su texto está en el marcado.
const tarjetas = [...capa.matchAll(/<a [^>]*data-pieza="resena-del-aro"[\s\S]*?<\/a>/g)].map((m) => m[0])
afirmarIgual(tarjetas.length, ARO.placas, 'una tarjeta por placa en el marcado')
// La cara (el span de papel) lleva la tinta en su propia clase: la cita, el nombre y el negocio la heredan de ahí.
const enTinta = (html: string): boolean => /class="[^"]*bg-fondo[^"]*\stext-tinta(?:\s|")/.test(html) && RESENAS.some((r) => html.includes(`«${r.cita}»`))
afirmar(tarjetas.every(enTinta), 'cada tarjeta: papel (bg-fondo) con la tinta (text-tinta) en la cara, y su cita escrita')
controlPositivo('el detector ve una cara sin tinta', tarjetas[0].replace(/text-tinta(?!-)/g, 'text-fondo'), enTinta)
const tema = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const token = (n: string): string => new RegExp(`--color-${n}:\\s*(#[0-9A-Fa-f]{6})`).exec(tema)?.[1] ?? '#000000'
afirmar(razonDeContraste(token('tinta'), token('fondo')) >= 4.5 && razonDeContraste(token('tinta-media'), token('fondo')) >= 4.5, `la tinta y la tinta media sobre el papel: ${razonDeContraste(token('tinta'), token('fondo')).toFixed(2)}:1 y ${razonDeContraste(token('tinta-media'), token('fondo')).toFixed(2)}:1 (AA)`)
// c · En el frente de su placa: lo que la escena le escribe a la tarjeta (la cuenta de `EscenaDeLasResenas.tsx`), con la cámara de los valores.
const camaraB = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
camaraB.position.set(0, -3.2, 16)
camaraB.lookAt(0, 0, 0)
camaraB.updateMatrixWorld()
const MB = medidasDelAro(1440 / 900)
const centroY = -LOGO_BOX_WORLD / 2 + ARO.sobreElPie + MB.alto / 2
type Escrita = { style: { transform: string; opacity: string; visibility: string; setProperty: (k: string, v: string) => void } }
const nuevaEscrita = (): Escrita => ({ style: { transform: '', opacity: '', visibility: '', setProperty: () => undefined } })
CAPA_DEL_ARO.el = nuevaEscrita() as unknown as HTMLElement
const anchoDeMaqueta = tamanoDeLasTarjetas(camaraB, 900, MB, centroY, { ancho: 0 })
CAPA_DEL_ARO.el = null
const llevada = (e: number): { readonly el: Escrita; readonly esquinas: number[][]; readonly placa: number[][] } => {
  // La placa del aro más de frente con esa entrada, con la misma cuenta del texto que la escena.
  const poses = Array.from({ length: ARO.placas }, (_, i) => poseDeLaPlaca(i, e, 0, MB, nuevaPose())).filter((p) => p.enElAro && p.z > 0)
  const p = poses.sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0]
  const el = nuevaEscrita()
  const centro = new THREE.Vector3(p.x, centroY, p.z)
  llevarLaTarjeta(el as unknown as HTMLElement, nuevaTarjeta(), centro, p.mira, MB, textoDeLaPlaca(p.angulo) * textoConLaEntrada(e), camaraB, { ancho: 1440, alto: 900 }, anchoDeMaqueta)
  const alto = (anchoDeMaqueta * MB.alto) / MB.ancho
  const m3 = /matrix3d\(([^)]*)\)/.exec(el.style.transform)?.[1]?.split(',').map(Number) ?? null
  const m2 = /^matrix\(([^)]*)\)/.exec(el.style.transform)?.[1]?.split(',').map(Number) ?? null
  const llevar = (x: number, y: number): number[] => (m3 !== null ? aplicar(m3, x, y) : m2 !== null ? [m2[0] * x + m2[2] * y + m2[4], m2[1] * x + m2[3] * y + m2[5]] : [Number.NaN, Number.NaN])
  const derecha = new THREE.Vector3(Math.cos(p.mira), 0, -Math.sin(p.mira))
  const frente = centro.clone().addScaledVector(new THREE.Vector3(Math.sin(p.mira), 0, Math.cos(p.mira)), MB.espesor / 2)
  const placa = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => {
    const v = frente.clone().addScaledVector(derecha, (sx * MB.ancho) / 2).add(new THREE.Vector3(0, (sy * MB.alto) / 2, 0)).project(camaraB)
    return [((v.x + 1) / 2) * 1440, ((1 - v.y) / 2) * 900]
  })
  return { el, esquinas: [llevar(0, 0), llevar(anchoDeMaqueta, 0), llevar(anchoDeMaqueta, alto), llevar(0, alto)], placa }
}
const armada = llevada(1)
const sobreLaPlaca = (x: { readonly esquinas: number[][]; readonly placa: number[][] }): boolean => x.esquinas.every((q, k) => Math.hypot(q[0] - x.placa[k][0], q[1] - x.placa[k][1]) <= 2.5)
afirmar(armada.el.style.visibility === 'visible' && armada.el.style.opacity === OPACIDAD_DE_LA_TARJETA, `con el aro armado, la de frente: visible y entera (opacidad ${armada.el.style.opacity}; maqueta de ${String(anchoDeMaqueta)} px)`)
afirmar(sobreLaPlaca(armada) && armada.esquinas.every(([x, y]) => x >= 0 && x <= 1440 && y >= 0 && y <= 900), `  y su caja cae en el frente de su placa (a menos de 2,5 px en las cuatro esquinas), adentro del cuadro: ${armada.esquinas.map((q) => q.map(Math.round).join(',')).join(' · ')}`)
controlPositivo('el detector ve una tarjeta corrida de su placa', { ...armada, esquinas: armada.esquinas.map(([x, y]) => [x + 40, y]) }, sobreLaPlaca)
const aMitad = llevada(0.68)
afirmar(Number(aMitad.el.style.opacity) >= 0.8 && aMitad.el.style.visibility === 'visible' && sobreLaPlaca(aMitad), `a mitad de la entrada (0,68, ~38 % del alto de la sección) la que pasa por el frente ya se lee (opacidad ${aMitad.el.style.opacity}): antes, el texto recién desde 0,82`)
controlPositivo('el detector ve la entrada de antes (el texto recién desde 0,82)', 0.68, (e) => (e < 0.82 ? 0 : 1) >= 0.8)
// d · El aro, calmo: con la cámara de los valores a 1440 × 900, la de frente mide ~21 % del ancho y tapa poco del logo.
const encuadre = (m: typeof MB): { readonly ancho: number; readonly tapa: number } => {
  const yc = -LOGO_BOX_WORLD / 2 + m.alto / 2
  const px = (x: number, y: number, z: number): number[] => {
    const v = new THREE.Vector3(x, y, z).project(camaraB)
    return [((v.x + 1) / 2) * 1440, ((1 - v.y) / 2) * 900]
  }
  const [a, b] = [px(-m.ancho / 2, yc + m.alto / 2, m.radio), px(m.ancho / 2, yc - m.alto / 2, m.radio)]
  const [la, lb] = [px(-3.9, LOGO_BOX_WORLD / 2, 0), px(3.9, -LOGO_BOX_WORLD / 2, 0)]
  const ix = Math.max(0, Math.min(b[0], lb[0]) - Math.max(a[0], la[0]))
  const iy = Math.max(0, Math.min(b[1], lb[1]) - Math.max(a[1], la[1]))
  return { ancho: (b[0] - a[0]) / 1440, tapa: (ix * iy) / ((lb[0] - la[0]) * (lb[1] - la[1])) }
}
const calmo = (m: typeof MB): boolean => encuadre(m).ancho <= 0.23 && encuadre(m).tapa <= 0.16
afirmar(calmo(MB), `la de frente mide ${(encuadre(MB).ancho * 100).toFixed(0)} % del ancho y tapa ${(encuadre(MB).tapa * 100).toFixed(0)} % de la caja del logo (eran 33 % y 34 %)`)
controlPositivo('el detector ve el aro de antes (radio 6,4, placas de 3,2 × 2,15)', { ...medidasDeLaEscala(1), radio: 6.4, ancho: 3.2, alto: 2.15 }, calmo)

// e · [C2-70] Sólidas: ninguna tarjeta ni placa con opacidad < 1, en toda una vuelta; las de los costados y alguna de atrás, con su texto.
titulo('14 · [C2-70] Las tarjetas sólidas: opacidad 1 siempre (las de atrás también), escondidas sólo con visibility')
// [L5] La caja del logo ya no decide (la nuca no lleva texto): se mide igual, la usa el banco del guardado.
void cajaDelLogo(camaraB, { ancho: 1440, alto: 900 }, nuevaCaja())
const unaVuelta = (): { readonly opacidades: string[]; readonly conTexto: number; readonly deEspaldas: number } => {
  const opacidades: string[] = []
  let conTexto = 0
  let deEspaldas = 0
  const estados = Array.from({ length: ARO.placas }, nuevaTarjeta)
  const els = Array.from({ length: ARO.placas }, nuevaEscrita)
  for (let paso = 0; paso < 72; paso += 1) {
    const giro = (paso * 2 * Math.PI) / 72
    for (let i = 0; i < ARO.placas; i += 1) {
      const p = poseDeLaPlaca(i, 1, giro, MB, nuevaPose())
      const texto = nieblaDeLaPlaca(p.angulo) < 0.995 ? 1 : 0
      llevarLaTarjeta(els[i] as unknown as HTMLElement, estados[i], new THREE.Vector3(p.x, centroY, p.z), p.mira, MB, texto, camaraB, { ancho: 1440, alto: 900 }, anchoDeMaqueta)
      opacidades.push(els[i].style.opacity)
      if (els[i].style.visibility === 'visible') {
        conTexto += 1
        if (Math.cos(p.angulo) < 0) deEspaldas += 1
      }
    }
  }
  esconderLasTarjetas(els as unknown as HTMLElement[], estados)
  for (const el of els) opacidades.push(el.style.opacity)
  return { opacidades, conTexto, deEspaldas }
}
const enteras = (x: { readonly opacidades: readonly string[] }): boolean => x.opacidades.every((o) => Number(o) >= 1)
const vuelta = unaVuelta()
afirmar(enteras(vuelta), `ninguna tarjeta con opacidad < 1 en una vuelta entera (${String(vuelta.opacidades.length)} escrituras; las escondidas, con visibility)`)
controlPositivo('el detector ve una tarjeta a medias (la de antes: la opacidad con el ángulo)', { opacidades: [...vuelta.opacidades, '0.500'] }, enteras)
// [L5] La spec cambió (70: «se ve al revés la reseña cuando está pasando por atrás, en ese punto debe ser blanco nomás»): ninguna en la nuca.
const sinNuca = (x: { readonly conTexto: number; readonly deEspaldas: number }): boolean => x.conTexto / 72 >= 2 && x.deEspaldas === 0
afirmar(sinNuca(vuelta), `con su texto: ${(vuelta.conTexto / 72).toFixed(1)} por cuadro, todas de frente; de espaldas, ${String(vuelta.deEspaldas)} (la nuca es papel liso)`)
controlPositivo('el detector ve la nuca de antes (la reseña de una de atrás, C2-70)', { conTexto: vuelta.conTexto, deEspaldas: 3 }, sinNuca)
// [L5] Ninguna tarjeta encima de una placa más cerca (lote2/09): en una vuelta, cada tarjeta visible no toca la caja de las de adelante.
const cajasSeTocan = (a: { x0: number; y0: number; x1: number; y1: number }, b: { x0: number; y0: number; x1: number; y1: number }): boolean => a.x1 > b.x0 && a.x0 < b.x1 && a.y1 > b.y0 && a.y0 < b.y1
// Con la cámara de la lectura (B) y con una de costado y más cerca (el mouse gira la órbita), donde las de un costado se cruzan.
const camaraCerca = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
camaraCerca.position.set(7, 1.6, 9)
camaraCerca.lookAt(0, 0, 0)
camaraCerca.updateMatrixWorld()
const pisadas = (conDelante: boolean, camara: THREE.PerspectiveCamera): { readonly pisadas: number; readonly visibles: number } => {
  const ojo = camara.getWorldPosition(new THREE.Vector3())
  let [n, visibles] = [0, 0]
  const estados = Array.from({ length: ARO.placas }, nuevaTarjeta)
  const els = Array.from({ length: ARO.placas }, nuevaEscrita)
  for (let paso = 0; paso < 72; paso += 1) {
    const giro = (paso * 2 * Math.PI) / 72
    const placas = Array.from({ length: ARO.placas }, (_, i) => {
      const p = poseDeLaPlaca(i, 1, giro, MB, nuevaPose())
      const centro = new THREE.Vector3(p.x, centroY, p.z)
      return { p, centro, distancia: centro.distanceTo(ojo), caja: cajaDeLaPlaca(centro, p.mira, MB, 1, camara, { ancho: 1440, alto: 900 }, nuevaCaja()), cara: cajaDeLaPlaca(centro, p.mira, { ...MB, espesor: 0 }, 1, camara, { ancho: 1440, alto: 900 }, nuevaCaja()) }
    })
    placas.forEach((a, i) => {
      const delante = placas.filter((b) => b !== a && b.distancia < a.distancia).map((b) => b.caja)
      const texto = nieblaDeLaPlaca(a.p.angulo) < 0.995 ? 1 : 0
      llevarLaTarjeta(els[i] as unknown as HTMLElement, estados[i], a.centro, a.p.mira, MB, texto, camara, { ancho: 1440, alto: 900 }, anchoDeMaqueta, conDelante ? { delante } : {})
      if (els[i].style.visibility !== 'visible') return
      visibles += 1
      if (delante.some((c) => cajasSeTocan(a.cara, c))) n += 1
    })
  }
  return { pisadas: n, visibles }
}
const [enB, cerca2] = [pisadas(true, camaraB), pisadas(true, camaraCerca)]
afirmar(enB.pisadas === 0 && cerca2.pisadas === 0 && enB.visibles / 72 >= 2, `ninguna tarjeta pisa una placa más cerca (en una vuelta, con B: ${String(enB.pisadas)}, visibles ${(enB.visibles / 72).toFixed(1)} por cuadro; con la cámara cerca: ${String(cerca2.pisadas)})`)
// El resguardo en sí (`delante`), con un caso armado: la de frente con una placa más cerca cruzada delante de su borde.
const frenteDePrueba = new THREE.Vector3(0, centroY, MB.radio)
const cajaDeLaQueTapa = cajaDeLaPlaca(new THREE.Vector3(MB.ancho / 2, centroY, MB.radio + 2), 0, MB, 1, camaraB, { ancho: 1440, alto: 900 }, nuevaCaja())
const seVeCon = (delante: readonly ReturnType<typeof nuevaCaja>[] | undefined): boolean => {
  const el = nuevaEscrita()
  llevarLaTarjeta(el as unknown as HTMLElement, nuevaTarjeta(), frenteDePrueba, 0, MB, 1, camaraB, { ancho: 1440, alto: 900 }, anchoDeMaqueta, delante === undefined ? {} : { delante })
  return el.style.visibility === 'visible'
}
const resguarda = (conElResguardo: boolean): boolean => seVeCon([]) && !seVeCon(conElResguardo ? [cajaDeLaQueTapa] : undefined)
afirmar(resguarda(true), 'con una placa más cerca cruzada delante de su borde, la tarjeta se esconde (sin ninguna delante, se ve)')
controlPositivo('el detector ve la tarjeta de antes (sin mirar las de adelante: se pintaba encima)', false, resguarda)
const placaDePrueba = armarLasPlacas(new THREE.BufferGeometry())[0]
const solidas = (u: readonly number[]): boolean =>
  u.every((n) => {
    enLaNiebla(placaDePrueba, n, new THREE.Color(0x000000))
    return placaDePrueba.cara.opacity === 1 && placaDePrueba.costado.opacity === 1 && !placaDePrueba.cara.transparent && placaDePrueba.cara.depthWrite
  })
afirmar(solidas([0, 0.25, 0.5, 0.75, 1]), 'las placas: opacas en toda la niebla (sólo cambia el color), sin transparencia, escriben su profundidad')
controlPositivo('el detector ve la placa de antes (la opacidad con la niebla)', [0, 0.5], (u) => u.every((n) => 1 - n === 1))

// ═══════════════════════════════════════════════════════════════════════════
titulo('15 · [C2-70] La entrada sin escalón (la velocidad por cuadro) y el volteo, los valores y el aro a la vez (el gatillo)')

// La velocidad por cuadro (60 fps) de la placa 0 por su camino: la entrada del gatillo y después un segundo de giro armado.
const MG = medidasDelAro(1440 / 900)
const velocidadesPorCuadro = (curva: (s: number) => number, giroDesdeCero: boolean): number[] => {
  const cuadros = Math.round(DURACION_DE_LA_ENTRADA_S * 60)
  const g: GiroDelAro = { angulo: 0, velocidad: 0 }
  const pos: { x: number; z: number }[] = []
  for (let k = 0; k <= cuadros; k++) {
    pasoDelGiro(g, 1 / 60, false, false, false, false, 0)
    const p = poseDeLaPlaca(0, curva(k / cuadros), g.angulo, MG, nuevaPose())
    pos.push({ x: p.x, z: p.z })
  }
  if (giroDesdeCero) g.velocidad = 0
  for (let k = 0; k < 60; k++) {
    pasoDelGiro(g, 1 / 60, true, false, false, false, 0)
    const p = poseDeLaPlaca(0, 1, g.angulo, MG, nuevaPose())
    pos.push({ x: p.x, z: p.z })
  }
  return pos.slice(1).map((b, k) => Math.hypot(b.x - pos[k].x, b.z - pos[k].z) * 60)
}
const sinEscalon = (v: readonly number[]): boolean => {
  const tope = Math.max(...v)
  return v.slice(1).every((x, k) => Math.abs(x - v[k]) <= tope * 0.03)
}
const conLaCurva = velocidadesPorCuadro((s) => curvaDeLaEntrada(s, finDeLaEntrada(MG, DURACION_DE_LA_ENTRADA_S)), false)
const cuadrosDeLaEntrada = Math.round(DURACION_DE_LA_ENTRADA_S * 60)
const tabla = conLaCurva.filter((_, k) => k % 25 === 0 || k === cuadrosDeLaEntrada - 1 || k === cuadrosDeLaEntrada).map((x) => x.toFixed(3)).join(' · ')
afirmar(sinEscalon(conLaCurva), `la velocidad de la placa por cuadro (60 fps) baja pareja hasta la del giro y sigue: ningún cuadro cambia más del 3 % de la máxima (tabla, cada 25 cuadros y el empalme: ${tabla})`)
controlPositivo('el detector ve la entrada de antes (lineal, el giro desde 0 al armarse)', velocidadesPorCuadro((s) => s, true), sinEscalon)
const finG = finDeLaEntrada(MG, DURACION_DE_LA_ENTRADA_S)
const pendienteFinal = (curvaDeLaEntrada(1, finG) - curvaDeLaEntrada(1 - 1e-6, finG)) / 1e-6
const alEmpalmar = (pendienteFinal * MG.recorrido) / DURACION_DE_LA_ENTRADA_S
afirmar(cerca(alEmpalmar, MG.radio * VELOCIDAD_DE_LECTURA, MG.radio * VELOCIDAD_DE_LECTURA * 0.01) && Math.abs(conLaCurva[cuadrosDeLaEntrada] - conLaCurva[cuadrosDeLaEntrada - 1]) < conLaCurva[cuadrosDeLaEntrada - 2] - conLaCurva[cuadrosDeLaEntrada - 1] + 1e-9 + Math.max(...conLaCurva) * 0.01, 'en el empalme la entrada llega con la velocidad del giro de lectura (' + alEmpalmar.toFixed(4) + ' contra ' + (MG.radio * VELOCIDAD_DE_LECTURA).toFixed(4) + ') y el cuadro del empalme no cambia más que los de antes')
afirmar(curvaDeLaEntrada(0, 0.03) === 0 && curvaDeLaEntrada(1, 0.03) === 1 && Array.from({ length: 101 }, (_, k) => curvaDeLaEntrada(k / 100, 0.03)).every((x, k, a) => k === 0 || x >= a[k - 1]), 'la curva va de 0 a 1 sin volver para atrás')

const aLaVez = (x: ReturnType<typeof estadoDelAvance>): boolean => x.giro > 0.3 && x.giro < 0.7 && x.disolucion > 0.3 && x.entrada > 0
afirmar(aLaVez(estadoDelAvance(0.6, GATILLO.giro[0] + GATILLO.giro[1] / 2)), 'gatillo: a mitad del volteo del título los valores ya se están yendo y el aro ya entra (a la vez, no uno después del otro)')
controlPositivo('el detector ve el gatillo de antes (primero el volteo, después los valores, después el aro)', { giro: 0.5, disolucion: 0, entrada: 0 }, aLaVez)

// ═══════════════════════════════════════════════════════════════════════════
titulo('16 · [C2-70e] Las mitades se juntan en el medio mientras voltean; la cámara acompaña el guardado y vuelve antes de C')

// Las mitades a 1440 × 900 (las de la sala: el cuerpo de la frase, 36,7 px, y su hueco, 376 px a cada lado del centro).
const CUERPO = 36.7
const [MI, MD] = [{ desde: 720 - 376 - 5.6 * CUERPO, hasta: 720 - 376 }, { desde: 720 + 376, hasta: 720 + 376 + 8.3 * CUERPO }]
const ESPACIO = ESPACIO_ENTRE_LAS_MITADES_EM * CUERPO
const ENTERO = corrimientosAlCentro(MI, MD, 720, ESPACIO)
const GIROS = Array.from({ length: 41 }, (_, k) => k / 40)
type Corrimiento = (entero: number, giro: number) => number
type Mitad = { readonly desde: number; readonly hasta: number }
const mitadesCon = (c: Corrimiento, g: number): { readonly i: Mitad; readonly d: Mitad } => {
  const [ci, cd] = [c(ENTERO.izquierda, g), c(ENTERO.derecha, g)]
  return { i: { desde: MI.desde + ci, hasta: MI.hasta + ci }, d: { desde: MD.desde + cd, hasta: MD.hasta + cd } }
}
const juntasAlCentro = (c: Corrimiento): boolean => {
  const [fin, empieza] = [mitadesCon(c, 1), mitadesCon(c, 0)]
  return cerca((fin.i.desde + fin.d.hasta) / 2, 720, 1e-6) && cerca(fin.d.desde - fin.i.hasta, ESPACIO, 1e-6) && cerca(empieza.i.hasta, MI.hasta) && cerca(empieza.d.desde, MD.desde)
}
afirmar(juntasAlCentro(corrimientoConElGiro), `al terminar el volteo «Lo que dicen nuestros clientes» queda en un renglón centrado (un espacio de ${ESPACIO.toFixed(1)} px); al empezar, cada mitad en su lugar (corren ${ENTERO.izquierda.toFixed(1)} y ${ENTERO.derecha.toFixed(1)} px)`)
controlPositivo('el detector ve las mitades sin juntarse (la bandera de prueba sin-juntar)', () => 0, juntasAlCentro)
const lejosDelCentro = (m: Mitad): number => Math.abs((m.desde + m.hasta) / 2 - 720)
const monotono = (c: Corrimiento): boolean => GIROS.slice(1).every((g, k) => lejosDelCentro(mitadesCon(c, g).i) <= lejosDelCentro(mitadesCon(c, GIROS[k]).i) + 1e-9 && lejosDelCentro(mitadesCon(c, g).d) <= lejosDelCentro(mitadesCon(c, GIROS[k]).d) + 1e-9)
afirmar(monotono(corrimientoConElGiro), 'cada mitad se acerca al centro sin volver para atrás (41 muestras del giro)')
controlPositivo('el detector ve una mitad que se pasa y vuelve', (e: number, g: number) => (e * Math.sin(Math.PI * 0.75 * g)) / Math.sin(Math.PI * 0.75), monotono)
const conLaCurvaDelAngulo = (c: Corrimiento): boolean => GIROS.every((g) => cerca(c(ENTERO.izquierda, g) / ENTERO.izquierda, angulosDelGiro(g).frase / Math.PI) && cerca(c(ENTERO.derecha, g) / ENTERO.derecha, angulosDelGiro(g).resenas / Math.PI + 1))
afirmar(conLaCurvaDelAngulo(corrimientoConElGiro), 'el corrimiento va con la MISMA curva y el mismo tiempo que el ángulo del volteo (a la vez, no después)')
controlPositivo('el detector ve unas mitades que se juntan después del volteo', (e: number, g: number) => e * vueltaDelGiro((g - 0.5) * 2), conLaCurvaDelAngulo)
afirmar(controlDeLaBandera(null) === null && controlDeLaBandera('cualquiera') === null && controlDeLaBandera('sin-juntar') === 'sin-juntar' && controlDeLaBandera('sin-camara') === 'sin-camara', 'la bandera de prueba de los bancos: sin ella (el defecto), ningún control')

// La malla del título: el corrimiento (px del cuadro de su lectura) en em de su grupo, en su lugar y girando (su centro, corrido).
const mallaDePrueba = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 0.3).translate(2.5, 0.5, 0))
const armadoDePrueba = { titulo: { id: 's83-mitad', alejamiento: 1 }, lugar: { cuerpo: CUERPO }, malla: mallaDePrueba } as unknown as Armado
const corridoEnLaMalla = (corrido: number, angulo: number): number => {
  CORRIMIENTOS_DE_LOS_TITULOS.set('s83-mitad', corrido)
  GIROS_DE_LOS_TITULOS.set('s83-mitad', angulo)
  girarElTitulo(armadoDePrueba)
  mallaDePrueba.updateMatrix()
  return new THREE.Vector3(2.5, 0.5, 0).applyMatrix4(mallaDePrueba.matrix).x - 2.5
}
const enEm = (f: (corrido: number, angulo: number) => number): boolean => [0, Math.PI / 3, -Math.PI / 4].every((a) => cerca(f(ENTERO.izquierda, a), ENTERO.izquierda / CUERPO, 1e-9) && cerca(f(0, a), 0, 1e-9))
afirmar(enEm(corridoEnLaMalla), `la malla se corre ${(ENTERO.izquierda / CUERPO).toFixed(2)} em (lo pedido en px por su cuerpo), en su lugar y girando sobre su centro`)
controlPositivo('el detector ve la malla de antes (sólo el giro)', (_c: number, a: number) => corridoEnLaMalla(0, a), enEm)
CORRIMIENTOS_DE_LOS_TITULOS.delete('s83-mitad')
GIROS_DE_LOS_TITULOS.delete('s83-mitad')

// El cableado: la sección corre las cuatro mitades con el giro; el CTA toma el título desde donde quedó.
const gancho = leer('_secciones/por-que-develop/resenas/useTramoDeLasResenas.ts')
const escribeLasCuatro = (f: string): boolean => f.includes('corrimientoConElGiro(entero.izquierda, e.giro)') && f.includes('CORRIMIENTOS_DE_LOS_TITULOS.set(TITULOS_DE_LAS_RESENAS[0], izquierda).set(FRASE_DE_VOLUMEN[0], izquierda)') && f.includes('CORRIMIENTOS_DE_LOS_TITULOS.set(TITULOS_DE_LAS_RESENAS[1], derecha).set(FRASE_DE_VOLUMEN[1], derecha)')
afirmar(escribeLasCuatro(gancho), 'la sección corre cada lado con el giro: la mitad de las reseñas y la de la frase (su otra cara), lo mismo')
controlPositivo('el detector ve una sección que sólo corre las reseñas', gancho.replace('.set(FRASE_DE_VOLUMEN[0], izquierda)', ''), escribeLasCuatro)
const ctaTransformado = leer('_secciones/por-que-develop/CtaTransformado.tsx')
const armadoDelCta = leer('_lib/escena/ctaDelFinal/armadoDelCta.ts')
const ctaDesdeElCorrido = (armado: string): boolean => ctaTransformado.includes('corrido: () => CORRIMIENTOS_DE_LOS_TITULOS.get(id) ?? 0') && armado.includes('const dx = (b.fijo?.dx ?? 0) + (b.corrido?.() ?? 0)')
afirmar(ctaDesdeElCorrido(armadoDelCta), 'el CTA arranca su cartel desde las mitades juntadas (su origen, corrido lo mismo en cada cuadro): sin salto al tomarlo')
controlPositivo('el detector ve el origen del CTA sin el corrimiento', armadoDelCta.replace(' + (b.corrido?.() ?? 0)', ''), ctaDesdeElCorrido)

// La cámara: el peso del desvío con la animación de la bajada (t, a 60 fps en sus [L5] 3,6 s) y el progreso de la transformación (p).
const CG = CAMARA_DEL_GUARDADO_EN_EL_GATILLO
const CUADROS_DEL_GATILLO = Math.round(HACIA_EL_CTA.gatillo.duracionS * 60)
const T = Array.from({ length: CUADROS_DEL_GATILLO + 1 }, (_, k) => k / CUADROS_DEL_GATILLO)
const bajadaEnT = (t: number): number => bajadaDeLasResenas(progresoDelGatillo(t))
const huecoEnT = (t: number): number => aperturaDelHueco(progresoDelGatillo(t))
// [L5] EL ORDEN EN EL TIEMPO (70: «se abra, se escondan las reseñas, y se cierre»; «se sigan viendo hasta que se guarden bien, y luego alejarse»).
type Orden = { readonly bajada: (t: number) => number; readonly hueco: (t: number) => number; readonly peso: (t: number) => number }
const enOrden = (o: Orden): boolean =>
  T.filter((t) => o.bajada(t) > 0 && o.bajada(t) < 1).every((t) => o.hueco(t) >= 0.999) && T.filter((t) => o.hueco(t) > 1e-6).every((t) => cerca(o.peso(t), 1)) && o.hueco(1) < 1e-6 && o.bajada(1) === 1
const nuestroOrden: Orden = { bajada: bajadaEnT, hueco: huecoEnT, peso: (t) => pesoDeLaCamara(t, 0.35) }
afirmar(enOrden(nuestroOrden), `[L5] el piso se abre entero antes de que se mueva la primera placa, se cierra después de la última, y la cámara está arriba todo el tiempo que el piso está abierto (suelta en ${String(CG.suelta)})`)
controlPositivo('el detector ve la cámara de antes (soltaba en 0,66, con placas bajando)', { ...nuestroOrden, peso: (t: number) => (t < 0.66 ? 1 : 0) }, enOrden)
controlPositivo('el detector ve el anillo de antes (las placas bajaban con el anillo a medio abrir)', { ...nuestroOrden, hueco: (t: number) => aperturaDelHueco(progresoDelGatillo(t) - 0.04) }, enOrden)
type Peso = (t: number, p: number) => number
const acompana = (w: Peso): boolean => w(0, 0.35) === 0 && w(1, 0.35) === 0 && T.every((t) => w(t, 0.35) >= 0 && w(t, 0.35) <= 1) && T.filter((t) => bajadaEnT(t) > 0 && bajadaEnT(t) < 0.9).every((t) => cerca(w(t, 0.35), 1))
afirmar(acompana(pesoDeLaCamara), `el peso: 0 antes y después de la animación, acotado, y entero mientras las placas bajan (llega en ${String(CG.llega)}, suelta en ${String(CG.suelta)}, con la bajada en ${bajadaEnT(CG.suelta).toFixed(3)})`)
controlPositivo('el detector ve un desvío que no vuelve a 0', (t: number) => Math.min(1, t / CG.llega), acompana)
const mayorPaso = (w: Peso): number => Math.max(...T.slice(1).map((t, k) => Math.abs(w(t, 0.35) - w(T[k], 0.35))))
const sinSalto = (w: Peso): boolean => mayorPaso(w) <= 0.1
afirmar(sinSalto(pesoDeLaCamara), `sin salto: el peso cambia a lo sumo 0,1 por cuadro (de 0 a 1 en no menos de diez; el mayor, ${mayorPaso(pesoDeLaCamara).toFixed(3)}); la inercia del rig lo suaviza encima`)
controlPositivo('el detector ve una suelta de golpe', (t: number) => (t > CG.llega && t < 0.9 ? 1 : 0), sinSalto)
afirmar(pesoDeLaCamara(0.5, 0.7) === 0 && pesoDeLaCamara(0.5, CG.margen[0]) === 1, 'con el scroll mucho más allá de C (la transformación pasó su margen) el CTA manda: sin desvío')

// [L5] La pose del guardado ya no es B (contrapicado): es desde arriba, en diagonal. El detector mira entre la pose del recorrido y ella.
const POSE_B = POSE_DEL_GUARDADO
const POSE_C = POSES_DEL_FINAL.cta
afirmar(POSE_DEL_GUARDADO.height > POSES_DEL_FINAL.valores.height && POSE_DEL_GUARDADO.height > 0 && POSE_DEL_GUARDADO.height < 16, `[L5] la pose del guardado mira desde arriba (altura ${String(POSE_DEL_GUARDADO.height)}, sobre el piso y bajo el techo de la cámara; B, ${String(POSES_DEL_FINAL.valores.height)})`)
const poseCon = (base: PoseDelGuardado, peso: number, bajada: number): PoseDelGuardado => {
  const pose = { height: base.height, distance: base.distance, frameX: base.frameX, frameY: base.frameY }
  desvioDelGuardado(pose, peso, bajada)
  return pose
}
const igual = (a: PoseDelGuardado, b: PoseDelGuardado): boolean => cerca(a.height, b.height) && cerca(a.distance, b.distance) && cerca(a.frameX, b.frameX) && cerca(a.frameY, b.frameY)
const entre = (x: number, a: number, c: number): boolean => x >= Math.min(a, c) - 1e-9 && x <= Math.max(a, c) + 1e-9
const entreLaPoseYB = (desvio: typeof poseCon): boolean =>
  igual(desvio(POSE_C, 0, 0.5), POSE_C) &&
  igual(desvio(POSE_C, 0, 1), POSE_C) &&
  T.every((t) => {
    const d = desvio(POSE_C, pesoDeLaCamara(t, 0.35), bajadaEnT(t))
    return entre(d.height, POSE_C.height, POSE_B.height) && entre(d.distance, POSE_C.distance, POSE_B.distance) && entre(d.frameY, POSE_C.frameY, POSE_B.frameY + MIRA_AL_HUECO)
  })
afirmar(entreLaPoseYB(poseCon), `el desvío: con peso 0 la pose del recorrido intacta (antes y después, C es C); en el medio, entre la pose y B, mirando al hueco a lo sumo ${String(MIRA_AL_HUECO)} de encuadre`)
controlPositivo('el detector ve un desvío que se pasa de B', (base: PoseDelGuardado, peso: number, bajada: number) => ({ ...poseCon(base, peso, bajada), height: POSE_B.height - 2 * peso }), entreLaPoseYB)
const conLaBajada = (desvio: typeof poseCon): boolean => desvio(POSE_B, 1, 0.8).frameY > desvio(POSE_B, 1, 0.2).frameY && cerca(desvio(POSE_B, 1, 0).frameY, POSE_B.frameY)
afirmar(conLaBajada(poseCon), 'mientras bajan, la mirada las sigue (más bajada, más abajo mira)')
controlPositivo('el detector ve una mirada quieta', (base: PoseDelGuardado, peso: number) => poseCon(base, peso, 0), conLaBajada)

const rig = leer('_lib/escena/OrbitRig.tsx')
const enElRig = (f: string): boolean => /arc\.level = nivelConLaInterfaz\([^\n]*\n\s*\/\/ \[C2-70e\][^\n]*\n\s*if \(isChoreo && viajeEnCurso\(\) === null\) acompanarElGuardado\(target\)\n[\s\S]*live\[channel\] = physics/.test(f)
afirmar(enElRig(rig), 'el rig lo aplica sobre su objetivo (después de las mezclas, antes de la inercia: la vuelta es suave), fuera de un viaje del menú; el progreso no se toca')
controlPositivo('el detector ve un rig sin el desvío', rig.replace('acompanarElGuardado(target)', ''), enElRig)
// [L5] La spec cambió: la salida es un gatillo con las DOS variantes (era sólo con `gatillo`); sin la bandera de prueba sin-camara.
const siempreGatillo = (f: string): boolean => f.includes("CAMARA_DEL_GUARDADO.peso = prueba !== 'sin-camara' ? pesoDeLaCamara(disparoDeLaBajada.get(), p) : 0") && f.includes('const pb = progresoDelGatillo(disparoDeLaBajada.get())') && !f.includes("const pb = variante === 'gatillo'")
afirmar(siempreGatillo(gancho), '[L5] la salida (la bajada, la cámara y la espera) es un gatillo con las dos variantes de la entrada')
controlPositivo('el detector ve la salida de antes (del scroll con `?resenas=scroll`)', gancho.replace('const pb = progresoDelGatillo(disparoDeLaBajada.get())', "const pb = variante === 'gatillo' ? progresoDelGatillo(disparoDeLaBajada.get()) : p"), siempreGatillo)

// [C2-70e, verificación] El CTA espera a la cámara: con la cámara en B, el cartel anclado en el plano de C se veía grande y cortado arriba.
type Espera = (t: number, p: number, disparada: boolean) => number
const esperaBien = (e: Espera): boolean =>
  e(0, 0.02, false) === 1 && e(0, 0.05, true) === 1 && e(1, 0.35, true) === 0 && e(0.5, 0.7, true) === 0 && T.filter((t) => bajadaEnT(t) < 0.9).every((t) => e(t, 0.35, true) === 1)
afirmar(esperaBien(esperaDelCta), 'el CTA espera entero desde antes del disparo y mientras las placas bajan; nada al cerrarse el anillo ni con el scroll más allá de C')
controlPositivo('el detector ve el sostén de antes (el CTA sin esperar)', () => 0, esperaBien)
// Cuadro a cuadro (60 fps), la cámara viva con la inercia del rig (su distancia, de B a C) y el CTA: cuánto se adelanta el cartel a la cámara.
const adelantoDelCartel = (esperaDe: (t: number) => number, pesoDe: (t: number) => number, segundos: number = HACIA_EL_CTA.gatillo.duracionS): number => {
  let [vivo, mayor] = [0, 0]
  for (let k = 0; k <= 240; k += 1) {
    const t = k / 60 / segundos
    vivo = dampTowards(vivo, 1 - pesoDe(t), SETTLE_TAU.distance, 0, 1 / 60)
    mayor = Math.max(mayor, 1 - esperaDe(t) - vivo)
  }
  return mayor
}
const conElScroll = adelantoDelCartel((t) => 1 - vueltaDelGiro(t), (t) => 1 - vueltaDelGiro(t), 0.6)
const nuestro = adelantoDelCartel((t) => esperaDelCta(t, 0.35, true), (t) => pesoDeLaCamara(t, 0.35))
const cartelDetras = (adelanto: number): boolean => adelanto <= 0.25 && adelanto < conElScroll
afirmar(cartelDetras(nuestro), `el cartel no se adelanta a la cámara: a lo sumo ${nuestro.toFixed(3)} del camino (con una rueda que la lleva a C en 0,6 s, ${conElScroll.toFixed(3)}): suelta en ${String(CG.ctaSuelta)}, la cámara en ${String(CG.suelta)}`)
controlPositivo('el detector ve el sostén sin la espera (el cartel entero con la cámara en B)', adelantoDelCartel(() => 0, (t) => pesoDeLaCamara(t, 0.35)), cartelDetras)
const esperaCableada = (f: string, cta: string): boolean =>
  f.includes("const espera = prueba !== 'sin-camara' && prueba !== 'sin-espera' ? esperaDelCta(disparoDeLaBajada.get(), p, objetivoDeLaBajadaActual === 1) : 0") && f.includes('const tomado = delCta > 0 && ctaListo()') && f.includes('ESPERA_DEL_CTA.set(espera)') && cta.includes('const progreso = useProgresoQueEspera(delScroll)')
afirmar(esperaCableada(gancho, ctaTransformado), 'el tramo escribe la espera y el título lo toma el CTA con su progreso que espera; el CTA del escenario avanza con él')
controlPositivo('el detector ve el CTA con el progreso del scroll', [gancho, ctaTransformado.replace('useProgresoQueEspera(delScroll)', 'delScroll')] as const, ([f, c]: readonly [string, string]) => esperaCableada(f, c))

// El espacio entre las mitades: el de un renglón de la Chivo de los títulos (el avance del espacio y el tracking del título).
const fuenteDelTitulo = JSON.parse(readFileSync(path.join(V3, '_fuentes/chivo-400-titulos.json'), 'utf8')) as { readonly resolution: number; readonly glyphs: Record<string, { readonly ha: number }> }
const tracking = Number(/--tracking-titulo:\s*(-?[\d.]+)em/.exec(readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8'))?.[1] ?? NaN)
const espacioDeLaFuente = (fuenteDelTitulo.glyphs[' ']?.ha ?? NaN) / fuenteDelTitulo.resolution + tracking
const comoUnEspacio = (em: number): boolean => cerca(em, espacioDeLaFuente, 1e-3)
afirmar(comoUnEspacio(ESPACIO_ENTRE_LAS_MITADES_EM), `el espacio al juntarse es el de la fuente: ${String(ESPACIO_ENTRE_LAS_MITADES_EM)} em (el avance del espacio, ${String(fuenteDelTitulo.glyphs[' ']?.ha)} de ${String(fuenteDelTitulo.resolution)}, y el tracking, ${String(tracking)} em)`)
controlPositivo('el detector ve el espacio de antes (0,25 em, a ojo)', 0.25, comoUnEspacio)

cerrar('s83-resenas')
