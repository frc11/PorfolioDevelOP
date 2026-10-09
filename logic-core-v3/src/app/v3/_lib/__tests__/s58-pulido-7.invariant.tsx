/**
 * PULIDO 7 — el invariante: npm run test:s58-pulido-7
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   F1 · gana la descarga, sin energía adentro del logo: las contraformas (con sus ranuras) son lisas (ninguna muestra recibe
 *        energía, descargas ni pistones; el piso no tiene bloques ahí); la descarga va por las juntas (las abre) y nunca pinta
 *        las tapas; una ráfaga con cada onda y en el golpe.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-7.md`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { HUECO, distanciaAfuera, rellenoDelLogo } from '../escena/final/hueco'
import { ENERGIA_EN_LA_SIMULACION_GLSL } from '../escena/final/luzDeAbajo'
import { ABRE_LA_JUNTA_GLSL, DESCARGA_DEL_FILO_GLSL, FILO, rafagaDelFilo } from '../escena/final/filoConPoder'
import { conElFinalEnElPiso } from '../escena/final/enElPiso'
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

cerrar('s58-pulido-7')
