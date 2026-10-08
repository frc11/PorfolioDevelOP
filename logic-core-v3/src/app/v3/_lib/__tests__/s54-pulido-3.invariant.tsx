/**
 * PULIDO 3 — el invariante: npm run test:s54-pulido-3
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   A1 · la energía bajo el piso en TODA la escena: la mancha negra (ninguna tapa baja hasta el plano), el campo continuo
 *        (cobertura, fluye, nunca se apaga, sin ciclos), la expansión desde el hueco (función de `fin`: el rebobinado sin
 *        cortes), las ondas del logo, la sala gradual y las variantes `?energia=red|inestable`.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-3.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-3/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import {
  ALTO_DEL_PLANO,
  ENERGIA_EN_LA_SIMULACION_GLSL,
  INESTABLE,
  LUZ_DE_ABAJO,
  RED_DE_LA_LUZ_GLSL,
  campoDeLaLuz,
  energiaDelCampo,
  fondoDeLaLuz,
  radioDeLaExpansion,
} from '../escena/final/luzDeAbajo'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL, duracionDelRebobinado, expansionDeLaLuz, quedaDelRebobinado } from '../escena/final/recorridoDelFinal'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

import * as THREE from 'three'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · La energía bajo el piso: de un sector a TODA la escena («sobrecarga»), sin la mancha negra')

const L = LUZ_DE_ABAJO
const sim = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))

// LA MANCHA NEGRA: en el golpe la súper onda dibujaba valles más hondos que el plano de abajo (y que el pie de los bloques):
// el plano quedaba por encima de esas tapas y se veía de frente, oscuro en su borde. Con energía, ninguna tapa baja hasta el
// plano: un piso blando (igual arriba de `desde`, nunca bajo `hasta`), por encima del plano; en la simulación, después de las
// alturas de la luz, con la energía.
type Fondo = (alto: number) => number
const manchaBien = (fondo: Fondo, s: string, plano: number): boolean => {
  const altos = Array.from({ length: 400 }, (_, i) => -3 + i * 0.01)
  const nuncaBajo = altos.every((a) => fondo(a) > plano + 0.02)
  const igualArriba = altos.filter((a) => a >= L.fondo.desde).every((a) => Math.abs(fondo(a) - a) < 1e-12)
  const continuo = altos.every((a, i) => i === 0 || Math.abs(fondo(a) - fondo(altos[i - 1])) <= 0.0100001)
  return nuncaBajo && igualArriba && continuo && s.includes('dibujo += alturaDeLaLuz( xz, energiaAqui );\n\tdibujo = mix( dibujo, fondoDeLaLuz( dibujo ), clamp( uEnergiaDeLaLuz * 4.0, 0.0, 1.0 ) );')
}
afirmar(manchaBien(fondoDeLaLuz, sim, ALTO_DEL_PLANO), 'la mancha negra: con energía ninguna tapa baja hasta el plano de abajo (un piso blando por encima de él, continuo, igual en el resto)', `piso blando ${String(L.fondo.desde)} → ${String(L.fondo.hasta)} u · plano a ${ALTO_DEL_PLANO.toFixed(2)} u`)
controlPositivo('el detector VE las tapas que bajan hasta el plano (la súper onda de antes)', ((a: number) => a) as Fondo, (f: Fondo) => manchaBien(f, sim, ALTO_DEL_PLANO))
controlPositivo('  y el piso blando sin aplicar en la simulación', sim.replace('\n\tdibujo = mix( dibujo, fondoDeLaLuz( dibujo ), clamp( uEnergiaDeLaLuz * 4.0, 0.0, 1.0 ) );', ''), (s: string) => manchaBien(fondoDeLaLuz, s, ALTO_DEL_PLANO))

// EL CAMPO: la gran mayoría del piso visible con algo de luz (~70–85 % de las juntas, con intensidad variable), en cualquier
// momento (nunca se apaga), en lo que se ve a 1440 (56 × 24 u) y a 390 (18 × 36 u), fuera del mar calmo.
type Campo = (x: number, z: number, t: number) => number
const coberturas = (campo: Campo, X: number, Z: number): number[] => {
  const salida: number[] = []
  for (let t = 0; t < 600; t += 13) {
    let [n, con] = [0, 0]
    for (let x = -X; x <= X; x += 0.8) {
      for (let z = -Z; z <= Z; z += 0.8) {
        if (Math.hypot(x, z) < 7) continue
        n += 1
        if (energiaDelCampo(campo(x, z, t)) > 0.02) con += 1
      }
    }
    salida.push(con / n)
  }
  return salida
}
const coberturaBien = (campo: Campo): boolean => [[28, 12], [9, 18]].every(([X, Z]) => {
  const c = coberturas(campo, X, Z)
  const media = c.reduce((a, b) => a + b, 0) / c.length
  return media >= 0.7 && media <= 0.88 && Math.min(...c) >= 0.4
})
const c1440 = coberturas(campoDeLaLuz, 28, 12)
afirmar(coberturaBien(campoDeLaLuz), '  la gran mayoría del piso con algo de luz (~70–85 % de los bloques, en promedio), y nunca se apaga', `a 1440: media ${(100 * c1440.reduce((a, b) => a + b, 0) / c1440.length).toFixed(0)} %, mínimo ${(100 * Math.min(...c1440)).toFixed(0)} %`)
controlPositivo('  el detector VE un campo que se apaga casi entero (zonas sueltas)', ((x: number, z: number, t: number) => campoDeLaLuz(x, z, t) - 0.2) as Campo, coberturaBien)

// FLUYE: un ruido con domain warping que se mueve en el tiempo: de un cuadro al otro casi igual (continuo) y, a los 20 s, otro
// (las zonas calientes viajan por todo el entorno sin parar).
const correlacion = (campo: Campo, dt: number): number => {
  const [a, b]: [number[], number[]] = [[], []]
  for (let x = -20; x <= 20; x += 1.6) for (let z = -12; z <= 12; z += 1.6) for (const t of [5, 50, 170]) {
    a.push(energiaDelCampo(campo(x, z, t)))
    b.push(energiaDelCampo(campo(x, z, t + dt)))
  }
  const m = (v: number[]): number => v.reduce((p, q) => p + q, 0) / v.length
  const [ma, mb] = [m(a), m(b)]
  const cov = a.reduce((p, v, i) => p + (v - ma) * (b[i] - mb), 0)
  const va = a.reduce((p, v) => p + (v - ma) ** 2, 0)
  const vb = b.reduce((p, v) => p + (v - mb) ** 2, 0)
  return cov / Math.sqrt(Math.max(1e-12, va * vb))
}
const fluyeBien = (campo: Campo, glsl: string): boolean => correlacion(campo, 1 / 60) > 0.98 && correlacion(campo, 20) < 0.5 && /return fbmDeLaLuz\( p \+ [0-9.]+ \* \( q - 0\.5 \) \);/.test(glsl) && glsl.includes('campoDeLaLuz( xz, uRelojDeLaLuz )')
afirmar(fluyeBien(campoDeLaLuz, ENERGIA_EN_LA_SIMULACION_GLSL), '  el campo fluye (domain warping que se mueve): continuo de un cuadro al otro y otro a los 20 s', `correlación: un cuadro ${correlacion(campoDeLaLuz, 1 / 60).toFixed(3)} · 20 s ${correlacion(campoDeLaLuz, 20).toFixed(2)}`)
controlPositivo('  el detector VE un campo quieto (las zonas no viajan)', ((x: number, z: number) => campoDeLaLuz(x, z, 0)) as Campo, (c: Campo) => fluyeBien(c, ENERGIA_EN_LA_SIMULACION_GLSL))

// SIN CICLOS: no hay zonas que nacen, viven y mueren (ni su reloj, ni sus uniformes).
const luzTs = sinComentarios(leer('_lib/escena/final/luzDeAbajo.ts'))
const sinCiclos = (fuente: string): boolean => !/zonasDeLaLuz|uZonasDeLaLuz|prendidoDeLaLuz|\bnace: \[|\bmuere: \[/.test(fuente)
afirmar(sinCiclos(luzTs) && sinCiclos(cuadro), '  nada de ciclos de nacer y morir: sin zonas (ni su reloj, ni sus uniformes)')
controlPositivo('  el detector VE las zonas de PULIDO 2', `${luzTs}\nexport function zonasDeLaLuz() {}`, sinCiclos)

// LA EXPANSIÓN: en el golpe la energía sale del hueco y cubre la escena en ~1,5 s (y llega más allá de lo que se ve); es
// función de `fin`, así que al rebobinar se retira hacia el hueco con la curva de P2, sin cortes de un cuadro al otro.
type Expansion = (fin: number) => number
const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS
const enS = (s: number): number => s / RELOJ_DEL_FINAL.duracionS
const expansionBien = (e: Expansion, c: string): boolean => {
  const finDelRebobinado = (s: number, dura: number): number => 0.35 + 0.65 * quedaDelRebobinado(s, dura)
  const dura = duracionDelRebobinado(1)
  let [salto, radio] = [0, 0]
  for (let s = 1 / 60; s <= dura; s += 1 / 60) {
    salto = Math.max(salto, Math.abs(e(finDelRebobinado(s, dura)) - e(finDelRebobinado(s - 1 / 60, dura))))
    radio = Math.max(radio, Math.abs(radioDeLaExpansion(e(finDelRebobinado(s, dura)), 6.2) - radioDeLaExpansion(e(finDelRebobinado(s - 1 / 60, dura)), 6.2)))
  }
  return e(golpe) === 0 && e(golpe - 0.01) === 0 && Math.abs(e(golpe + enS(0.75)) - 0.5) < 0.05 && e(golpe + enS(1.5)) === 1 && e(1) === 1 &&
    radioDeLaExpansion(1, 6.2) >= 30 && salto < 0.2 && radio < 6 && c.includes('const expansion = expansionDeLaLuz(fin)') &&
    ENERGIA_EN_LA_SIMULACION_GLSL.includes('float llego = 1.0 - smoothstep( uExpansionDeLaLuz.x - ')
}
afirmar(expansionBien(expansionDeLaLuz, cuadro), '  arranca con el encastre: se expande desde el hueco en ~1,5 s hasta cubrir la escena; al rebobinar se retira con la curva de P2, sin cortes', `hasta ${String(L.expansion.hasta)} u`)
controlPositivo('  el detector VE una energía que se prende entera en el golpe (de un cuadro al otro)', ((fin: number) => (fin >= golpe ? 1 : 0)) as Expansion, (e: Expansion) => expansionBien(e, cuadro))
controlPositivo('  y una expansión por el reloj de la escena (no vuelve con el rebobinado)', cuadro.replace('const expansion = expansionDeLaLuz(fin)', 'const expansion = 1'), (c: string) => expansionBien(expansionDeLaLuz, c))

// LAS ONDAS DEL LOGO: cada una pasa como un frente que sube la energía (y abre más las juntas: la separación es de la energía).
// Durante el final el logo no larga los anillos del pulso (NOCTURNO FINAL B3), así que larga los suyos en la energía.
const ondasBien = (g: string): boolean => /e \+= [0-9.]+ \* ondaDeLaLuz\( r \) \* llego \* \( 0\.35 \+ e \);/.test(g) && g.includes('float s = ondaDelLogo( r, ') && g.includes('vec4 a = uAnillos[ i ];') && g.includes('if ( uGolpe.w > 0.0 ) {') &&
  L.ondas.cadaS >= 2 && L.ondas.cadaS <= 6 && L.ondas.sube >= 0.5
afirmar(ondasBien(ENERGIA_EN_LA_SIMULACION_GLSL), '  cada onda del logo (las suyas cada pocos segundos, el golpe y los anillos si los hubiera) pasa como un frente que sube la energía', `una cada ${String(L.ondas.cadaS)} s a ${String(L.ondas.velocidad)} u/s`)
controlPositivo('  el detector VE una energía que no reacciona a las ondas', ENERGIA_EN_LA_SIMULACION_GLSL.replace(/e \+= [0-9.]+ \* ondaDeLaLuz\( r \) \* llego \* \( 0\.35 \+ e \);/, ''), ondasBien)

// LA SALA SE OSCURECE GRADUAL, acompañando la expansión: a 60 cuadros por segundo, lo más que cambia en uno.
type Oscuro = (fin: number) => number
const oscuroDe = (e: Expansion): Oscuro => (fin) => L.oscurece * (1 - (1 - e(fin)) ** 2)
const salaBien = (o: Oscuro, c: string): boolean => {
  let salto = 0
  for (let s = 4.5; s < 6.4; s += 1 / 60) salto = Math.max(salto, Math.abs(o(enS(s)) - o(enS(s - 1 / 60))))
  return salto <= 0.02 && o(1) >= 0.3 && o(golpe) === 0 && c.includes('const extendida = (1 - (1 - expansion) * (1 - expansion)) * LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value') && c.includes('piso.uOscuroDelBrillo.value = LUZ_DE_ABAJO.oscurece * extendida')
}
afirmar(salaBien(oscuroDe(expansionDeLaLuz), cuadro), '  la escena se oscurece gradualmente, acompañando la expansión')
controlPositivo('  el detector VE una sala que se oscurece de golpe', ((fin: number) => (fin >= golpe ? L.oscurece : 0)) as Oscuro, (o: Oscuro) => salaBien(o, cuadro))

// LAS VARIANTES (`?energia=`, 3 como máximo; sin bandera, la sobrecarga): `red` suma corrientes que corren POR las juntas (la
// distancia por la grilla, L1: doblan en ángulo recto y se bifurcan; sólo por los tramos que conducen) y un anillo por las
// juntas con cada onda; `inestable` suma el temblor donde la energía es más alta, los picos que levantan un racimo, las
// chispas y el canto del logo. Se borraron `?chispas=si` y `?velo=escena` como banderas sueltas.
const dibujoDe = (variante: 'sobrecarga' | 'red' | 'inestable'): string => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial(), variante)
  const sombreador = { fragmentShader: ['float cuantoDelPulso( float r ) {', '#include <clipping_planes_fragment>', 'vec2 m = manchaDelContacto( vPiso.xz );', '#include <fog_fragment>'].join('\n'), vertexShader: '#include <common>\nvAlto = transformed.y;', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return sombreador.fragmentShader
}
const luzDelLogo = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const variantesBien = (red: string, simInestable: string, logo: string): boolean =>
  ENTORNO.pruebas.energia === 'no' && entornoPedido('producto,energia=red').pruebas.energia === 'red' && entornoPedido('producto,energia=inestable').pruebas.energia === 'inestable' &&
  entornoPedido('producto,energia=otra').pruebas.energia === 'no' && !PRUEBAS_SUELTAS.some((k: string) => k === 'chispas' || k === 'velo') && PRUEBAS_SUELTAS.some((k: string) => k === 'energia') &&
  red.startsWith('#define ENERGIA_RED') && red.includes('float d = abs( g.x - fuente.x ) + abs( g.y - fuente.y );') && red.includes('float conduce = step(') && red.includes('junta += redDeLaLuz( vPiso.xz, uLado );') &&
  RED_DE_LA_LUZ_GLSL.includes('float anillo = ondaDelLogo( r, 0.9 );') && !dibujoDe('sobrecarga').includes('#define ENERGIA_') &&
  simInestable.indexOf('#define ENERGIA_INESTABLE\n') >= 0 && simInestable.indexOf('#define ENERGIA_INESTABLE') < simInestable.indexOf('#ifdef ENERGIA_INESTABLE') && simInestable.includes('h += ') && /if \( u < 1\.0 && azarDeLaLuz\( racimo \+ n \* 7\.13 \) < [0-9.]+ \)/.test(simInestable) &&
  INESTABLE.temblor <= 0.05 && INESTABLE.cuantos <= 0.03 && logo.includes("e.pruebas.energia === 'inestable' ? <RimDelLogo logoMaterialRef={props.logoMaterialRef} /> : null")
const simInestable = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL), 'inestable')
afirmar(variantesBien(dibujoDe('red'), simInestable, luzDelLogo), '  `?energia=red` (corrientes por las juntas, en ángulo recto, que se bifurcan; el anillo de cada onda) e `?energia=inestable` (temblor, picos, chispas, el canto del logo); sin bandera, la sobrecarga')
controlPositivo('  el detector VE corrientes en línea recta (sin la grilla)', [dibujoDe('red').replace('float d = abs( g.x - fuente.x ) + abs( g.y - fuente.y );', 'float d = length( g - fuente );'), simInestable, luzDelLogo] as const, ([r, s, l]: readonly [string, string, string]) => variantesBien(r, s, l))
controlPositivo('  y el canto del logo en el producto', [dibujoDe('red'), simInestable, luzDelLogo.replace("e.pruebas.energia === 'inestable' ? <RimDelLogo logoMaterialRef={props.logoMaterialRef} /> : null", '<RimDelLogo logoMaterialRef={props.logoMaterialRef} />')] as const, ([r, s, l]: readonly [string, string, string]) => variantesBien(r, s, l))

cerrar('s54-pulido-3')
