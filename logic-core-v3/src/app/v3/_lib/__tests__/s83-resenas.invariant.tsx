/**
 * INVARIANTE — [NOCTURNO B2] LAS RESEÑAS EN EL ARO 3D (cola del 2026-10-22, `60-B2B3-resenas-cta.md`). Sin navegador: lo puro del tramo, del
 * aro, del giro del título y de la ida de los valores, el contenido, la fuente y el cableado. Cada afirmación con su control positivo. Lo que
 * se ve (el encuadre, el contraste en la placa, el costo por cuadro) lo miden los bancos `scripts-carga/aro-*.ts` en el navegador.
 *
 * Corre con `npm run test:s83-resenas`.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { NOMBRES_REALES, escanearContenido } from '../../_secciones/_contrato/escaneo'
import { RESENAS, TEXTO_DE_LAS_RESENAS, TITULO_DE_LAS_RESENAS, enlaceDelTrabajo } from '../../_secciones/por-que-develop/resenas/contenido'
import { DISOLUCION, estiloDeLaIda, idaDelValor } from '../../_secciones/por-que-develop/resenas/disolucion'
import { ALTO_DEL_ESPACIADOR_SVH, INSERCION_DE_LAS_RESENAS, K_DE_LAS_RESENAS, LARGO_SIN_ESTIRAR_PX, PANTALLAS_DE_LAS_RESENAS, angulosDelGiro, avanceDeLasResenas, estadoDelAvance, objetivoDelGatillo, pinSinLasResenas, tramoDeLasResenas, varianteDeLaBandera } from '../../_secciones/por-que-develop/resenas/tramo'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { ARO, VELOCIDAD_DE_LECTURA, medidasDelAro, nieblaDeLaPlaca, nuevaPose, pasoDelGiro, placasQueSeLeen, poseDeLaPlaca, resenaDeLaPlaca, textoDeLaPlaca, type GiroDelAro } from '../escena/resenas/aro'
import { seVeConElGiro } from '../escena/titulos3d/giro'
import { medidaSinElEstiramiento, anotarTramo } from '../escena/tramoEstirado'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

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
titulo('3 · Los momentos del tramo, las dos variantes y el rebobinado sin B3')

const e = (r: number, d: number | null = null): number[] => Object.values(estadoDelAvance(r, d)).map((x) => Math.round(x * 1000) / 1000)
afirmarIgual([e(0), e(0.125), e(0.25), e(0.5), e(0.7)], [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 1, 1]], 'scroll: el título (0 a 0,125), los valores (a 0,25), la entrada (a 0,5) y la lectura con todo puesto')
afirmarIgual(e(1), [0, 0, 0], 'sin B3, al final del tramo todo volvió (el CTA de siempre arranca igual)')
controlPositivo('el detector ve un tramo que termina con el aro armado', estadoDelAvance(1, null, true), (x) => x.entrada === 0)
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

cerrar('s83-resenas')
