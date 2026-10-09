/**
 * PULIDO 7 — el invariante: npm run test:s58-pulido-7
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   F1 · gana la descarga, sin energía adentro del logo: las contraformas (con sus ranuras) son lisas (ninguna muestra recibe
 *        energía, descargas ni pistones; el piso no tiene bloques ahí); la descarga va por las juntas (las abre) y nunca pinta
 *        las tapas; una ráfaga con cada onda y en el golpe.
 *   F2 · el CTA con volteo vertical: los seis valores se alinean en las filas de la frase y se voltean sobre X hasta sus tramos,
 *        que al terminar son la frase exacta; el volteo termina con el giro de «HABLANOS»; sin saltos ida y vuelta, las placas no
 *        se cruzan con el giro. [PULIDO 8] G1 · las placas a la vez (la cascada, `?volteo=` y `?meta=contorno`, borradas).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-7.md`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { HUECO, distanciaAfuera, rellenoDelLogo } from '../escena/final/hueco'
import { ENERGIA_EN_LA_SIMULACION_GLSL } from '../escena/final/luzDeAbajo'
import { ABRE_LA_JUNTA_GLSL, DESCARGA_DEL_FILO_GLSL, FILO, rafagaDelFilo } from '../escena/final/filoConPoder'
import { conElFinalEnElPiso } from '../escena/final/enElPiso'
import { FUENTES_DEL_CTA, TRACKING_DEL_CTA, avancesDe } from '../escena/ctaDelFinal/fuentesDelCta'
import type { ValorMedido } from '../escena/ctaDelFinal/medidaDeLosValores'
import { geometriaDeLaLetra, letrasDeLaFrase, type LetraDeLaFrase } from '../escena/ctaDelFinal/piezasDeLaMetamorfosis'
import { TRANSFORMACION, armadoSobreElCta, nuevaPose, posesDe, suave, type EscenaDeLaTransformacion, type LetraEnPantalla, type PosesDeLaTransformacion } from '../escena/ctaDelFinal/transformacion'
import { ARRANCA_EL_VOLTEO, FIN_DEL_VOLTEO, VOLTEO, armarElVolteo, cajaDelTitulo, cajaDelTramo, caraEnLaPantalla, escalaDeLaCara, letrasDelTitulo, placaDelVolteo, tramosDeLaFrase, type CuadroDelVolteo } from '../escena/ctaDelFinal/volteo'
import { VOLUMEN_DEL_TITULO } from '../escena/titulos3d/geometria'
import { CTA, FRASE, VALORES } from '../../_secciones/por-que-develop/contenido'
import CHIVO_400_VALORES from '../../_fuentes/chivo-400-valores.json'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F1 · Gana la descarga: adentro del logo, liso')

// LA FORMA DE PRUEBA, con la topología del logo (su SVG no se lee en Node): dos anillos, la C y la P, cada uno con una RANURA de
// 0,28 u que une su contraforma con el exterior (la del logo, entre el trazo y la diagonal, medida en el SVG: 40 unidades × 0,007),
// y un disco lleno (sin contraforma). En la grilla del campo de distancia (`HUECO.campo`: ~27 u en 512 px, y en el teléfono 256).
const LADO_DEL_CAMPO = 6.9 + 2 * HUECO.campo.margen
const RANURA = 0.28
interface Prueba {
  readonly dentro: Uint8Array
  readonly lado: number
  readonly porPixel: number
  /** Las muestras adentro de las contraformas y las de afuera (lejos del cierre), como índices de píxel. */
  readonly contraforma: readonly number[]
  readonly afuera: readonly number[]
}
function formaDePrueba(porPixel: number): Prueba {
  const lado = Math.ceil(9 / porPixel)
  const anillos = [{ x: 2.2, y: 4.5, ranura: 0.6 }, { x: 6.4, y: 4.5, ranura: 3.9 }]
  const negro = (x: number, y: number): boolean => anillos.some((a) => {
    const [dx, dy] = [x - a.x, y - a.y]
    const r = Math.hypot(dx, dy)
    const [ux, uy] = [Math.cos(a.ranura), Math.sin(a.ranura)]
    const enLaRanura = dx * ux + dy * uy > 0 && Math.abs(-dx * uy + dy * ux) < RANURA / 2
    return r >= 1 && r <= 1.6 && !enLaRanura
  }) || Math.hypot(x - 4.3, y - 1.3) <= 0.6
  const dentro = new Uint8Array(lado * lado)
  const contraforma: number[] = []
  const afuera: number[] = []
  for (let j = 0; j < lado; j += 1) {
    for (let i = 0; i < lado; i += 1) {
      const [x, y] = [(i + 0.5) * porPixel, (j + 0.5) * porPixel]
      const k = j * lado + i
      if (negro(x, y)) dentro[k] = 1
      const cerca = Math.min(...anillos.map((a) => Math.hypot(x - a.x, y - a.y)))
      if (cerca < 0.9) contraforma.push(k)
      else if (cerca > 1.6 + HUECO.relleno.cierre + 3 * porPixel && Math.hypot(x - 4.3, y - 1.3) > 0.6 + HUECO.relleno.cierre + 3 * porPixel) afuera.push(k)
    }
  }
  return { dentro, lado, porPixel, contraforma, afuera }
}

// LA ENERGÍA EN UNA MUESTRA: la de la simulación y la de la descarga se cortan en el umbral que dice su sombreador (leído del GLSL:
// lo que corre en la placa), antes de calcular nada. Una muestra «recibe energía» si su distancia al logo pasa ese umbral.
const umbralDe = (glsl: string, patron: RegExp): number | null => {
  const m = patron.exec(glsl)
  return m === null ? null : Number(m[1])
}
type Campo = (dentro: Uint8Array, lado: number, porPixel: number) => Float32Array
const DEL_PRODUCTO: Campo = (dentro, lado, porPixel) => distanciaAfuera(rellenoDelLogo(dentro, lado, HUECO.relleno.cierre / porPixel), lado)
const lisoBien = (campo: Campo, energia: string, descarga: string): boolean => {
  const deLaEnergia = umbralDe(energia, /piston = 0\.0;\n[^\n]*\n\tfloat r = distanciaAlLogo\( xz \);\n\tif \( r < ([0-9.]+) \) return 0\.0;/)
  const deLaDescarga = umbralDe(descarga, /float r = distanciaAlLogo\( xz \);\n\tif \( r < ([0-9.]+) \|\|/)
  if (deLaEnergia === null || deLaDescarga === null) return false
  return [LADO_DEL_CAMPO / HUECO.campo.lado, (2 * LADO_DEL_CAMPO) / HUECO.campo.lado].every((porPixel) => {
    const p = formaDePrueba(porPixel)
    const d = campo(p.dentro, p.lado, porPixel)
    const recibe = (k: number): boolean => d[k] * porPixel >= Math.min(deLaEnergia, deLaDescarga)
    return p.contraforma.length > 100 && p.contraforma.every((k) => !recibe(k)) && p.afuera.every((k) => recibe(k)) && p.dentro.every((v, k) => v === 0 || d[k] === 0)
  })
}
const prueba = formaDePrueba(LADO_DEL_CAMPO / HUECO.campo.lado)
afirmar(lisoBien(DEL_PRODUCTO, ENERGIA_EN_LA_SIMULACION_GLSL, DESCARGA_DEL_FILO_GLSL), '1 · ninguna muestra adentro de las contraformas recibe energía ni descargas (el logo lleno, con ranuras de 0,28 u, a la resolución de escritorio y del teléfono); afuera, todas', `${String(prueba.contraforma.length)} muestras adentro · ${String(prueba.afuera.length)} afuera · cierre ${String(HUECO.relleno.cierre)} u`)
controlPositivo('1 · el detector VE el campo de antes (sin rellenar: la energía entra por las ranuras)', ((dentro, lado) => distanciaAfuera(dentro, lado)) as Campo, (c: Campo) => lisoBien(c, ENERGIA_EN_LA_SIMULACION_GLSL, DESCARGA_DEL_FILO_GLSL))
controlPositivo('1 · y una energía sin el corte adentro del logo', ENERGIA_EN_LA_SIMULACION_GLSL.replace(/\n\tif \( r < [0-9.]+ \) return 0\.0;/, ''), (e: string) => lisoBien(DEL_PRODUCTO, e, DESCARGA_DEL_FILO_GLSL))
controlPositivo('1 · y un cierre que no tapa la ranura (más angosto que su mitad)', ((dentro, lado, porPixel) => distanciaAfuera(rellenoDelLogo(dentro, lado, (0.4 * RANURA) / 2 / porPixel), lado)) as Campo, (c: Campo) => lisoBien(c, ENERGIA_EN_LA_SIMULACION_GLSL, DESCARGA_DEL_FILO_GLSL))

// Y LO LISO EN LA PANTALLA: el campo es el del logo lleno; la máscara lleva las contraformas (B); con el hueco abierto entero el piso
// descarta ahí sus bloques (sin juntas ni pistones) y se dibuja lo liso, que no tiene luz (ni juntas, ni plano de abajo encima).
const hueco = sinComentarios(leer('_lib/escena/final/hueco.ts'))
const liso = sinComentarios(leer('_lib/escena/final/liso.ts'))
const finalDelPie = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const dibujo = ((): { fragmento: string; vertice: string } => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: ['float cuantoDelPulso( float r ) {', '#include <clipping_planes_fragment>', 'vec2 m = manchaDelContacto( vPiso.xz );', '#include <fog_fragment>'].join('\n'), vertexShader: '#include <common>\nvAlto = transformed.y;', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return { fragmento: sombreador.fragmentShader, vertice: sombreador.vertexShader }
})()
const enPantallaBien = (piso: string, l: string): boolean => /const afuera = distanciaAfuera\(rellenoDelLogo\(adentroDe\(dibujar\(formas, marco, n, 0, 0\), n\), n, \(HUECO\.relleno\.cierre \/ lado\) \* n\), n\)/.test(hueco) &&
  hueco.includes('datos[i * 4 + 2] = lleno[i] === 1 && nitida[i * 4] <= 127 ? 255 : 0') &&
  piso.includes('return ( m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95 ) || ( uApertura >= 1.0 && m.b > 0.5 );') && piso.includes('if ( enElHueco( vPiso.xz ) ) discard;') &&
  l.includes('if ( uApertura < 1.0 || texture2D( uHueco, ( vEnElLogo - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw ).b < 0.5 ) discard;') && !/Juntas|descarga|Energia/.test(l) &&
  finalDelPie.includes('const liso = crearLoLiso(mascara.marco)') && finalDelPie.includes('estado.pozo.grupo.add(liso)')
afirmar(enPantallaBien(dibujo.fragmento, liso), '1 · y en la pantalla: el piso descarta sus bloques en las contraformas con el hueco abierto, y ahí va lo liso (sin juntas ni luz)')
controlPositivo('1 · el detector VE un piso que deja los bloques en las contraformas', dibujo.fragmento.replace(' || ( uApertura >= 1.0 && m.b > 0.5 )', ''), (p: string) => enPantallaBien(p, liso))

// 2 · LA DESCARGA VA POR LAS JUNTAS, NUNCA PINTA LAS TAPAS (las manchas blancas de la captura eran su derrame de PULIDO 6): en la
// tapa, la única luz es la del canto (0,04 u desde el borde); la descarga se suma a la luz de la JUNTA y, en el vértice, abre la
// junta por donde pasa (cada esquina retrocede hacia el centro del bloque: la tapa se achica, nunca se pinta).
const tapa = (f: string): string => f.slice(f.indexOf('} else {', f.indexOf('vec3 conLasJuntas(')), f.indexOf('float junta =', f.indexOf('vec3 conLasJuntas(')))
const juntasBien = (d: { fragmento: string; vertice: string }): boolean => {
  const enLaTapa = tapa(d.fragmento)
  return (enLaTapa.match(/luz =/g) ?? []).length === 1 && enLaTapa.includes('exp( - min( borde.x, borde.y ) / 0.04 )') && !/descarga|max\( luz/.test(enLaTapa) &&
    d.fragmento.includes('junta += descarga * ( 0.4 + min( s, 1.0 ) );') && d.vertice.includes(ABRE_LA_JUNTA_GLSL) && ABRE_LA_JUNTA_GLSL.includes(`transformed.xz -= esquina * abre * ${String(FILO.descarga.abre)};`) &&
    d.vertice.indexOf(ABRE_LA_JUNTA_GLSL) < d.vertice.indexOf('vAlto = transformed.y;') && FILO.descarga.abre > 0 && FILO.descarga.abre * FILO.descarga.fuerza < 0.15
}
afirmar(juntasBien(dibujo), '2 · la descarga va por las juntas: en la tapa sólo el canto; por donde pasa, la junta se abre (la tapa retrocede, no se pinta)', `abre hasta ${(FILO.descarga.abre * FILO.descarga.fuerza).toFixed(3)} u por bloque`)
controlPositivo('2 · el detector VE el derrame de antes sobre la tapa', { ...dibujo, fragmento: dibujo.fragmento.replace('luz = 0.75 * exp( - min( borde.x, borde.y ) / 0.04 );', 'luz = 0.75 * exp( - min( borde.x, borde.y ) / 0.04 );\n\t\tluz = max( luz, 0.75 * descarga * exp( - min( borde.x, borde.y ) / 0.12 ) );') }, juntasBien)

// 3 · LA RÁFAGA: con cada onda que larga el logo, la descarga sale de muchas juntas a la vez (y en el golpe, de todas); se va
// cuando pasó el alcance hasta la más lenta. Va en el sombreador y la escribe el cuadro del final.
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
type Rafaga = typeof rafagaDelFilo
const rafagaBien = (r: Rafaga): boolean => {
  const D = FILO.descarga
  const sale = (D.alcance + D.largo[1]) / D.velocidad[0]
  return r(Infinity, 0)[1] === D.rafaga.golpe && r(0.1, Infinity)[1] === D.rafaga.onda && r(0.1, 0.05).join() === `0.05,${String(D.rafaga.golpe)}` &&
    r(sale + 0.01, Infinity)[1] === 0 && r(Infinity, Infinity)[1] === 0 && D.rafaga.onda >= 0.5 &&
    DESCARGA_DEL_FILO_GLSL.includes('azarDeLaLuz( semilla + 0.29 ) < uRafagaDelFilo.y') && cuadro.includes('F.uRafagaDelFilo.value.set(...rafagaDelFilo(desdeLaOnda, desdeElGolpeVivo))')
}
afirmar(rafagaBien(rafagaDelFilo), '3 · con cada onda, una ráfaga de descargas sale del filo por muchas juntas a la vez (en el golpe, por todas) y se va al pasar el alcance', `${String(100 * FILO.descarga.rafaga.onda)} % de las juntas con la onda`)
controlPositivo('3 · el detector VE una ráfaga que no se va', ((a: number, b: number) => [Math.min(a, b), Number.isFinite(Math.min(a, b)) ? 0.6 : 0]) as unknown as Rafaga, rafagaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('F2 · El CTA: los seis valores se alinean y se voltean en vertical hasta la frase')

// LA COMPOSICIÓN DE PRUEBA (la de `s57` E1: las medidas del banco a 1440 × 900 y a 390 × 844): los seis valores en la Chivo del DOM
// (en el teléfono, sólo sus títulos), la frase en sus renglones de ESE ancho (en el teléfono, tres), «HABLANOS» y «Seis razones».
// En el teléfono, la lista y el título donde los mide la captura de este sprint a 390 (p = 0): los títulos de 310 a 426 px (cada
// 22,4) y «Seis razones» / «para elegirnos» a 216 y 256 (en la de `s57` la lista bajaba hasta la franja de «HABLANOS»).
const CHIVO = new Font(CHIVO_400_VALORES as FontData)
const av = (c: string): number => (CHIVO.data.glyphs[c]?.ha ?? 0) / CHIVO.data.resolution
function valorDePrueba(titular: string, linea: string | null): ValorMedido {
  const letras: { c: string; x: number; base: number; cuerpo: number }[] = []
  let x = 0
  for (const c of titular) {
    if (c.trim() !== '') letras.push({ c, x, base: 22, cuerpo: 20 })
    x += av(c) * 20
  }
  let [lx, base] = [0, 50]
  for (const palabra of linea === null ? [] : linea.split(' ')) {
    if (lx + [...palabra].reduce((a, c) => a + av(c) * 14, 0) > 260) [lx, base] = [0, base + 18]
    for (const c of palabra) {
      if (c.trim() !== '') letras.push({ c, x: lx, base, cuerpo: 14 })
      lx += av(c) * 14
    }
    lx += av(' ') * 14
  }
  return { letras, iconos: [], ancho: 270, alto: base + 6, enLaRaiz: null }
}
const letrasDe = (texto: string, x0: number, y: number, cuerpo: number, renglon: number, f: (c: string) => number): LetraEnPantalla[] => {
  let x = x0
  return [...texto].flatMap((c) => {
    const l = { x: x + (f(c) * cuerpo) / 2, y, cuerpo, ancho: f(c) * cuerpo, alto: 0.7 * cuerpo, renglon, letra: c }
    x += f(c) * cuerpo
    return c.trim() === '' ? [] : [l]
  })
}
interface Composicion {
  readonly valores: ValorMedido[]
  readonly inicio: { x: number; y: number; escala: number }[]
  readonly renglones: { texto: string }[]
  readonly frase: LetraDeLaFrase[]
  readonly origen: LetraEnPantalla[]
  readonly destino: LetraEnPantalla[]
  readonly pantalla: { readonly ancho: number; readonly alto: number }
}
function composicion(escritorio: boolean): Composicion {
  const [ancho, alto] = escritorio ? [1440, 900] : [390, 844]
  const valores = VALORES.map((v) => valorDePrueba(v.titulo, escritorio ? v.linea : null))
  const inicio = escritorio ? [0, 1, 2, 3, 4, 5].map((k) => ({ x: k < 3 ? 160 : 1010, y: 240 + (k % 3) * 120, escala: 1 })) : [0, 1, 2, 3, 4, 5].map((k) => ({ x: 110, y: 288 + k * 22.4, escala: 0.8 }))
  const renglones = escritorio
    ? [{ texto: CTA.frase, fuerte: false, izquierda: 150, arriba: 300, ancho: 1140, alto: 90, cuerpo: 87 }, { texto: CTA.destacado, fuerte: true, izquierda: 150, arriba: 390, ancho: 1140, alto: 90, cuerpo: 87 }]
    : [{ texto: CTA.fraseEnDos[0], fuerte: false, izquierda: 16, arriba: 290, ancho: 358, alto: 46, cuerpo: 40 }, { texto: CTA.fraseEnDos[1], fuerte: false, izquierda: 16, arriba: 336, ancho: 358, alto: 46, cuerpo: 40 }, { texto: CTA.destacado, fuerte: true, izquierda: 16, arriba: 382, ancho: 358, alto: 46, cuerpo: 40 }]
  const frase = letrasDeLaFrase(renglones, FUENTES_DEL_CTA.frase, FUENTES_DEL_CTA.fuerte, escritorio ? 1238 : 350)
  const fuerte = FUENTES_DEL_CTA.fuerte
  const cuerpoDelCta = escritorio ? 104 : 46
  const avCta = avancesDe(fuerte, CTA.rotulo.toUpperCase(), TRACKING_DEL_CTA.fuerte)
  const destino = letrasDe(CTA.rotulo.toUpperCase(), ancho / 2 - (avCta.ancho * cuerpoDelCta) / 2, escritorio ? 555 : 470, cuerpoDelCta, 0, (c) => (fuerte.fuente.data.glyphs[c]?.ha ?? 0) / fuerte.fuente.data.resolution)
  const origen = [...letrasDe(FRASE.izquierda, escritorio ? 450 : 90, escritorio ? 150 : 216, escritorio ? 64 : 34, 0, av), ...letrasDe(FRASE.derecha, escritorio ? 470 : 75, escritorio ? 220 : 256, escritorio ? 64 : 34, 1, av)]
  return { valores, inicio, renglones, frase, origen, destino, pantalla: { ancho, alto } }
}
const COMPOSICIONES = [composicion(true), composicion(false)]
const FUENTES = { valores: CHIVO, frase: FUENTES_DEL_CTA.frase.fuente, fuerte: FUENTES_DEL_CTA.fuerte.fuente }
const TITULOS = VALORES.map((v) => v.titulo)

// 1 · LOS TRAMOS: la frase por palabras («Este sitio» / «empezó» / «con una» / «charla.» y «El tuyo» / «también.»), de su layout final
// (con kerning); los 4 primeros van en el primer renglón y los 2 últimos en el destacado; en el teléfono, en los renglones de ESE
// ancho (2 y 2 y 2). Cada placa mide lo de su tramo.
type Tramos = typeof tramosDeLaFrase
const tramosBien = (t: Tramos): boolean => COMPOSICIONES.every((k, j) => {
  const tramos = t(k.renglones, k.frase)
  const textos = tramos.map((x) => x.map((l) => l.c).join(''))
  const filas = tramos.map((x) => x[0]?.base ?? -1)
  const enFilas = j === 0 ? filas.slice(0, 4).every((b) => b === filas[0]) && filas[4] === filas[5] && filas[4] > filas[0] : filas[0] === filas[1] && filas[2] === filas[3] && filas[4] === filas[5] && filas[0] < filas[2] && filas[2] < filas[4]
  const juntos = tramos.flat()
  return textos.join('|') === 'Estesitio|empezó|conuna|charla.|Eltuyo|también.' && enFilas && juntos.length === k.frase.length && juntos.every((l, i) => l === k.frase[i]) &&
    tramos.every((x) => Math.abs(cajaDelTramo(x, FUENTES).x - cajaDelTramo(x, FUENTES).ancho / 2 - x[0].x) < 1e-9 && cajaDelTramo(x, FUENTES).ancho > x[x.length - 1].x - x[0].x)
})
afirmar(tramosBien(tramosDeLaFrase), '1 · los tramos de la frase, por palabras y de su layout final: 4 en el primer renglón y 2 en el destacado (en el teléfono, 2 y 2 y 2); cada placa mide su tramo')
controlPositivo('1 · el detector VE tramos partidos por letras (no por palabras)', ((r: readonly { texto: string }[], l: readonly LetraDeLaFrase[]) => [0, 1, 2, 3, 4, 5].map((i) => l.slice(i * 7, i === 5 ? l.length : i * 7 + 7))) as Tramos, tramosBien)

// 2 · LA COREOGRAFÍA, FUNCIÓN PURA DEL PROGRESO: lo que no es el título se desvanece primero, los títulos se alinean (escalados
// parejo) y después las placas se voltean sobre X, [PULIDO 8] G1 · todas a la vez (la cascada se borró). Sin saltos, ida y vuelta
// (pasos de 1/4000). Y SIMULTÁNEO: el volteo termina en el mismo punto que el giro de «HABLANOS».
type Placa = typeof placaDelVolteo
const coreografiaBien = (placa: Placa): boolean => {
  let peor = 0
  let antes = placa(0)
  for (let i = 1; i <= 8000; i += 1) {
    const p = i <= 4000 ? i / 4000 : (8000 - i) / 4000
    const e = placa(p)
    peor = Math.max(peor, Math.abs(e.seVa - antes.seVa), Math.abs(e.alinea - antes.alinea), Math.abs(e.angulo - antes.angulo) / Math.PI)
    antes = e
  }
  const G = TRANSFORMACION.giro
  const fin = G.desde + G.gira
  const terminaConElGiro = placa(fin).angulo > Math.PI - 1e-9 && placa(fin - 1e-3).angulo < Math.PI && FIN_DEL_VOLTEO === fin && ARRANCA_EL_VOLTEO === fin - VOLTEO.voltea.dura
  const enOrden = placa(VOLTEO.seVa[0] + VOLTEO.seVa[1]).seVa === 1 && VOLTEO.seVa[0] + VOLTEO.seVa[1] <= VOLTEO.alinea[0] + VOLTEO.alinea[1] && VOLTEO.alinea[0] + VOLTEO.alinea[1] <= ARRANCA_EL_VOLTEO &&
    placa(ARRANCA_EL_VOLTEO).alinea === 1 && placa(ARRANCA_EL_VOLTEO).angulo === 0 && placa(1).angulo === Math.PI && placa(0).angulo === 0
  return peor < 0.01 && terminaConElGiro && enOrden
}
afirmar(coreografiaBien(placaDelVolteo), '2 · se va lo demás, se alinean los títulos y se voltean las placas a la vez, sin saltos ida y vuelta; el volteo termina con el giro de «HABLANOS»', `de ${ARRANCA_EL_VOLTEO.toFixed(2)} a ${FIN_DEL_VOLTEO.toFixed(2)} del progreso`)
controlPositivo('2 · el detector VE un volteo que salta (sin la curva)', ((p: number) => ({ ...placaDelVolteo(p), angulo: placaDelVolteo(p).angulo > Math.PI / 2 ? Math.PI : 0 })) as Placa, coreografiaBien)
controlPositivo('2 · y uno que termina con el progreso (no con el giro)', ((p: number) => ({ ...placaDelVolteo(p), angulo: Math.PI * Math.min(1, Math.max(0, (p - 0.5) / 0.5)) })) as Placa, coreografiaBien)

// 3 · LAS PLACAS EN LA ESCENA (armadas de verdad, con las fuentes del CTA): la cara de adelante, el título escalado PAREJO (ni
// apretado ni estirado) que entra en su tramo; al terminar, la cara de atrás está EXACTAMENTE donde la frase (la malla de los
// títulos, con su bisel y su kerning, en z = 0): no hay cambio de malla. Medido con las matrices de three en los dos anchos.
type Armado = typeof armarElVolteo
const placasBien = (armar: Armado): boolean => COMPOSICIONES.every((k) => {
  const armada = armar(k.valores, k.renglones, k.frase, FUENTES, 'negro', TITULOS)
  const tramos = tramosDeLaFrase(k.renglones, k.frase)
  const cuadro = (p: number): CuadroDelVolteo => ({ items: k.inicio, progreso: p, apareceDeLosValores: 1 })
  const raiz = new THREE.Group()
  raiz.add(...armada.objetos)
  const placas = armada.objetos.filter((o) => o.name.startsWith('volteo · la placa'))
  let bien = placas.length === 6
  for (const p of [0, 0.25, 0.5, 0.7, 1]) {
    armada.poner(cuadro(p))
    raiz.updateMatrixWorld(true)
    for (const placa of placas) {
      const [cara, atras] = placa.children
      bien &&= Math.abs(cara.scale.x - cara.scale.y) < 1e-9 && Math.abs(cara.scale.y - cara.scale.z) < 1e-9 && atras.scale.x === 1 && atras.scale.y === 1
    }
  }
  // Alineado: el título entra en su tramo.
  armada.poner(cuadro(ARRANCA_EL_VOLTEO - 1e-4))
  raiz.updateMatrixWorld(true)
  placas.forEach((placa, i) => {
    const caja = new THREE.Box3().setFromObject(placa.children[0])
    bien &&= caja.max.x - caja.min.x <= VOLTEO.cara.ancho * cajaDelTramo(tramos[i], FUENTES).ancho + 1e-6
  })
  // Terminado: cada letra del tramo, donde la de la frase exacta.
  armada.poner(cuadro(1))
  raiz.updateMatrixWorld(true)
  placas.forEach((placa, i) => {
    const malla = placa.children[1].children[0] as THREE.Mesh
    const vista = new THREE.Box3().setFromObject(malla)
    const exacta = new THREE.Box3()
    for (const l of tramos[i]) {
      const g = geometriaDeLaLetra(l.fuerte ? FUENTES.fuerte : FUENTES.frase, l.c, l.x, l.base, l.cuerpo, VOLUMEN_DEL_TITULO.profundidad, true, VOLTEO.maximo)
      g.computeBoundingBox()
      if (g.boundingBox !== null) exacta.union(g.boundingBox)
      g.dispose()
    }
    bien &&= vista.min.distanceTo(exacta.min) < 1e-3 && vista.max.distanceTo(exacta.max) < 1e-3 && placa.children[1].visible && !placa.children[0].visible
  })
  armada.soltar()
  return bien
})
afirmar(placasBien(armarElVolteo), '3 · la cara de adelante, el título escalado parejo y dentro de su tramo; al terminar, la de atrás es la frase exacta en su lugar (sin cambio de malla), a 1440 y a 390')
controlPositivo('3 · el detector VE una placa que no termina de voltearse', ((...a: Parameters<Armado>) => {
  const armada = armarElVolteo(...a)
  return { ...armada, poner: (c: CuadroDelVolteo) => armada.poner({ ...c, progreso: Math.min(c.progreso, FIN_DEL_VOLTEO - 0.02) }) }
}) as Armado, placasBien)

// 4 · EL GIRO Y LAS PLACAS NO SE SUPERPONEN: desde que los títulos salen de su grilla, la caja de cada placa (el título, o su tramo
// volteado) y la de cada letra del giro («Seis razones» → «HABLANOS») no se cruzan en ningún cuadro, a 1440 y a 390.
type Caja = { x0: number; y0: number; x1: number; y1: number }
const seTocan = (a: Caja, b: Caja): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
const cajaDeLaFraseDe = (letras: readonly LetraDeLaFrase[]): { y: number; alto: number } => {
  const y0 = Math.min(...letras.map((l) => l.base - 0.75 * l.cuerpo))
  const y1 = Math.max(...letras.map((l) => l.base + 0.2 * l.cuerpo))
  return { y: (y0 + y1) / 2, alto: y1 - y0 }
}
function cruces(alinea: readonly [number, number]): number {
  let n = 0
  COMPOSICIONES.forEach((k) => {
    const f = cajaDeLaFraseDe(k.frase)
    const alto = Math.max(1, Math.max(...k.destino.map((l) => l.y + l.alto / 2)) - (f.y + f.alto / 2) - 0.12 * (k.destino[0]?.cuerpo ?? 0))
    const e: EscenaDeLaTransformacion = { origen: k.origen, destino: k.destino, pantalla: k.pantalla, armado: armadoSobreElCta(k.origen, k.destino, alto), altoDelCartel: alto }
    const poses: PosesDeLaTransformacion = { origen: k.origen.map(nuevaPose), destino: k.destino.map(nuevaPose) }
    const tramos = tramosDeLaFrase(k.renglones, k.frase)
    for (let c = 0; c <= 200; c += 1) {
      const p = c / 200
      if (p < alinea[0]) continue
      posesDe(p, e, poses)
      const giro: Caja[] = []
      ;[...poses.origen.map((q, i) => ({ q, l: k.origen[i] })), ...poses.destino.map((q, i) => ({ q, l: k.destino[i] }))].forEach(({ q, l }) => {
        if (q.aparece <= 0) return
        const [w, h] = [(l.ancho * q.escala) / l.cuerpo / 2, (l.alto * q.escala) / l.cuerpo / 2]
        giro.push({ x0: q.x - w, y0: q.y - h, x1: q.x + w, y1: q.y + h })
      })
      k.valores.forEach((v, i) => {
        const placa = cajaDelTramo(tramos[i], FUENTES)
        const titulo = cajaDelTitulo(v, letrasDelTitulo(TITULOS[i]), CHIVO)
        const estado = placaDelVolteo(p)
        const b = estado.angulo >= Math.PI / 2 ? placa : caraEnLaPantalla(suave(Math.min(1, Math.max(0, (p - alinea[0]) / alinea[1]))), titulo, k.inicio[i], placa, escalaDeLaCara(titulo, 20, placa))
        const caja = { x0: b.x - b.ancho / 2, y0: b.y - b.alto / 2, x1: b.x + b.ancho / 2, y1: b.y + b.alto / 2 }
        if (giro.some((g) => seTocan(g, caja))) n += 1
      })
    }
  })
  return n
}
afirmar(cruces(VOLTEO.alinea) === 0, '4 · desde que los títulos salen de su grilla, ninguna placa se cruza con el giro, a 1440 y a 390', `${String(cruces(VOLTEO.alinea))} cruces`)
controlPositivo('4 · el detector VE una alineación más temprana (desde 0,04: se cruza con «Seis razones», que baja)', [0.04, 0.24] as const, (a: readonly [number, number]) => cruces(a) === 0)

// 5 · LO QUE SE MANTIENE: el volteo es el producto ([PULIDO 8] G1 · el único: `?meta=contorno` y `?volteo=juntos` se borraron, lo
// fija `s59` G1), va en el lienzo del CTA (detrás del logo, anclado en el mundo con la frase y «HABLANOS»), el enlace sigue en el DOM (Tab y Enter) y quieto
// llega al final (el progreso en 1).
const escenaF2 = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))
const ctaDelFinal = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const productoBien = (escena: string): boolean => escena.includes('const meta = armarElVolteo(medidas.valores, renglones, medidas.letras, deLasFuentes, color, VALORES.map((v) => v.titulo))') &&
  escena.includes('for (const o of meta.objetos) a.lienzo.add(o)') && !/pruebas\.(volteo|meta)/.test(escena) && ctaDelFinal.includes('progreso.set(quieto ? 1 : progresoEnLaLista(r))')
afirmar(productoBien(escenaF2), '5 · el volteo es el producto (sin bandera), en el lienzo del CTA (detrás del logo); quieto, el final directo')
controlPositivo('5 · el detector VE el volteo atrás de una bandera', escenaF2.replace('const meta = armarElVolteo(', "const meta = pruebas.volteo === 'no' ? otro() : armarElVolteo("), productoBien)

cerrar('s58-pulido-7')
