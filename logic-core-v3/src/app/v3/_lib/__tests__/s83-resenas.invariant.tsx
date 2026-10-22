/**
 * INVARIANTE — [NOCTURNO B2] LAS RESEÑAS EN EL ARO 3D (cola del 2026-10-22, `60-B2B3-resenas-cta.md`). Sin navegador: lo puro del tramo, del
 * aro, del giro del título y de la ida de los valores, el contenido, la fuente y el cableado. Cada afirmación con su control positivo. Lo que
 * se ve (el encuadre, el contraste en la placa, el costo por cuadro) lo miden los bancos `scripts-carga/aro-*.ts` en el navegador.
 *
 * Corre con `npm run test:s83-resenas`.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

import { NOMBRES_REALES, escanearContenido } from '../../_secciones/_contrato/escaneo'
import { CapaDelAro } from '../../_secciones/por-que-develop/resenas/CapaDelAro'
import { RESENAS, TEXTO_DE_LAS_RESENAS, TITULO_DE_LAS_RESENAS, enlaceDelTrabajo } from '../../_secciones/por-que-develop/resenas/contenido'
import { DISOLUCION, estiloDeLaIda, idaDelValor } from '../../_secciones/por-que-develop/resenas/disolucion'
import { ALTO_DEL_ESPACIADOR_SVH, INSERCION_DE_LAS_RESENAS, K_DE_LAS_RESENAS, LARGO_SIN_ESTIRAR_PX, PANTALLAS_DE_LAS_RESENAS, angulosDelGiro, avanceDeLasResenas, estadoDelAvance, objetivoDelGatillo, pinSinLasResenas, tramoDeLasResenas, varianteDeLaBandera } from '../../_secciones/por-que-develop/resenas/tramo'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { HACIA_EL_CTA, VUELTA_DEL_CTA, aperturaDelHueco, bajadaDeLasResenas, cruceDeLaVuelta, objetivoDeLaBajada, progresoDelGatillo } from '../../_secciones/por-que-develop/resenas/haciaElCta'
import { TRANSFORMACION, caraDelCta } from '../escena/ctaDelFinal/transformacion'
import { ENGANCHE_DE_LAS_GRIETAS, avisarLaVueltaDelCta } from '../escena/resenas/enganches'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { CAPA_DEL_ARO } from '../escena/resenas/enVivo'
import { llevarLaTarjeta, nuevaTarjeta, tamanoDeLasTarjetas } from '../escena/resenas/tarjetas'
import { aplicar } from '../pie3d/homografia'
import { ARO, VELOCIDAD_DE_LECTURA, medidasDeLaEscala, medidasDelAro, textoConLaEntrada, nieblaDeLaPlaca, nuevaPose, pasoDelGiro, placasQueSeLeen, poseDeLaPlaca, resenaDeLaPlaca, textoDeLaPlaca, type GiroDelAro } from '../escena/resenas/aro'
import { seVeConElGiro } from '../escena/titulos3d/giro'
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
afirmar(varianteDeLaBandera(null) === 'scroll' && varianteDeLaBandera('gatillo') === 'gatillo' && varianteDeLaBandera('x') === 'scroll', '?resenas=: scroll por defecto, gatillo con la bandera')

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
controlPositivo('el detector ve un cambio en el frente', (i: number, g: number, n: number) => (i + ARO.placas * Math.floor((g + (i * 2 * Math.PI) / ARO.placas) / (2 * Math.PI)) + n * 4) % n, cambiosOcultos)
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
afirmar(RESENAS.every((r) => existsSync(path.join(RAIZ, 'public', r.foto))), 'cada retrato existe (los placeholders ilustrados de public/v3/resenas)')
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
const capa = renderToStaticMarkup(<CapaDelAro arrastre={false} />)
const raizDeLaCapa = /^<div[^>]*>/.exec(capa)?.[0] ?? ''
afirmar(/style="z-index:1"/.test(raizDeLaCapa) && /absolute inset-0/.test(raizDeLaCapa) && !/opacity/.test(raizDeLaCapa), 'la capa va arriba de sus hermanas de la caja clavada (z 1) y sin opacidad propia')
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
afirmar(armada.el.style.visibility === 'visible' && armada.el.style.opacity === '1.000', `con el aro armado, la de frente: visible y entera (opacidad ${armada.el.style.opacity}; maqueta de ${String(anchoDeMaqueta)} px)`)
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

cerrar('s83-resenas')
