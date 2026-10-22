/**
 * s78 · T0 (2026-10-22) · LO QUE QUEDABA DE B12a.8 Y LOS AGREGADOS DE VALENTINO, sin navegador. Cada afirmación con su control positivo.
 * Lo que se ve (el color en el primer cuadro, el velo hacia el home, la píldora, el cartel del sonido, la consola) lo mide el orquestador
 * en el navegador: la lista está en `docs/rediseno/SPRINT-T0-NOCTURNO.md`.
 *
 *   1 · el color de la página desde el arranque: la variante de la base encendida en el avance 0, y el velo que destapa con la variante de
 *       la página ya dibujada (`listaDeLaRuta.ts`);
 *   3 · las dos vías del velo hacia el home (`viaDelVelo`): la banda corta y el montaje en una sola vez (la coreografía precargada);
 *   4 · la píldora: arranca con el hilo calmo y retiene el «quieto» del velo hasta terminar;
 *   5 · T3: la compilación que no tira con un material liberado («isReady»), el título que no se arma con medidas NaN y el cartel del
 *       sonido que no pisa el título abajo de 1024.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { arrancaElDesliz, CALMA_DEL_DESLIZ, cuadroCalmo } from '../../_chrome/barra/desliz'
import { VELO, VELO_CORTO, puedeDestapar, tiemposDelVelo } from '../../_chrome/velo/velo'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { useMovimientoEnTodoAncho } from '../../_secciones/_contrato/coreografia'
import { coreografiaPrecargada, precargarLaCoreografia } from '../../_secciones/_contrato/precargaDeLaCoreografia'
import { marcarElPrimerCuadro } from '../carga'
import { compilarConCuidado, programaDe, quitarLosTerminados, type RendererQueCompila } from '../escena/gpu/compilar'
import { NIVEL_DE_LA_NOCHE } from '../escena/lightArc'
import { claveDeLaVariante, escenaLista } from '../escena/ruta/listaDeLaRuta'
import { luzDeLaPagina } from '../escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../escena/ruta/preset'
import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS } from '../escena/ruta/variante'
import { cuadroDeLaPrueba } from '../escena/ruta/VarianteDePrueba'
import { medidaDelDomFinita } from '../escena/titulos3d/colocacion'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import type { MutableLightLevels } from '../escena/choreographyTypes'
import { EVENTOS_DEL_VELO, VELO_EN_CURSO, VIA_POR_DEFECTO, conElMontajeLiviano, conLaBandaCorta, marcarLaBanda, retenerElQuieto, viaDelVelo } from '../veloDeNavegacion'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El color de la página desde el arranque: la noche y el acento en el primer cuadro')

// La noche la pone el rig con el preset, en cualquier progreso (la luz del principio del recorrido, acotada a la noche).
const arco = (): MutableLightLevels => ({ level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 45 })
const deNoche = (f: typeof luzDeLaPagina): boolean => [0, 0.3, 1].every((p) => {
  const a = arco()
  f({ noche: true }, p, a)
  return a.level <= NIVEL_DE_LA_NOCHE + 1e-9
})
afirmar(deNoche(luzDeLaPagina), 'la noche de la página es la del preset desde el primer cuadro: el nivel de la luz, en la noche en cualquier progreso (no la trae el scroll)')
controlPositivo('  el detector ve una página que se queda de día', ((_p: { readonly noche: boolean } | null, _x: number, a: MutableLightLevels) => {
  a.level = 1
}) as typeof luzDeLaPagina, deNoche)

// El acento y la luz de abajo: la variante de la base, encendida en el avance 0 (antes se encendía con el scroll, de 0 a la mitad).
type Cuadro = typeof cuadroDeLaPrueba
const encendidaDesdeElArranque = (f: Cuadro): boolean => {
  const quieta = [0, 0.1, 0.5, 1].every((av) => {
    const c = f(av, false, false, 0, null)
    return c.encendido === 1 && c.brilloDelPiso === 1 && c.salida === null
  })
  // Al irse, la salida de siempre: de lo encendido a la composición en `SALIDA_DE_LA_VARIANTE_MS`.
  const empieza = f(0, false, true, 1000, null)
  const termina = f(0, false, true, 1000 + SALIDA_DE_LA_VARIANTE_MS, empieza.salida)
  const reducido = f(0, true, false, 0, null)
  return quieta && empieza.encendido === 1 && termina.encendido === 0 && termina.brilloDelPiso === COMPOSICION_DE_LA_LUZ.brilloDelPiso && reducido.encendido === 1
}
afirmar(encendidaDesdeElArranque(cuadroDeLaPrueba), 'la variante de la página base, ENCENDIDA desde el avance 0 (la luz de abajo entera y el acento en la luz y la energía): la composición inicial ya es la de la página; al irse vuelve a la composición')
const suave = (t: number): number => t * t * (3 - 2 * t)
const laDeAntes: Cuadro = (avance) => {
  const e = suave(Math.min(1, Math.max(0, avance / 0.5)))
  return { encendido: e, brilloDelPiso: COMPOSICION_DE_LA_LUZ.brilloDelPiso + (1 - COMPOSICION_DE_LA_LUZ.brilloDelPiso) * e, escala: 1, salida: null }
}
controlPositivo('  el detector ve la de B12a.3 (se encendía con el scroll: en blanco en el avance 0)', laDeAntes, encendidaDesdeElArranque)
const variante = leer('_lib/escena/ruta/VarianteDePrueba.tsx')
const usaElCuadro = (v: string): boolean => /const c = cuadroDeLaPrueba\(avance\.current, reducido, saliendo\.current, performance\.now\(\), salida\.current\)/.test(v) && /luzDeAbajo\(c\.brilloDelPiso, color\.current\)/.test(v) && /energia\(color\.current\)/.test(v)
afirmar(usaElCuadro(variante), '  y el componente escribe lo que dice ese cuadro (la luz de abajo, la energía y el anillo)')
controlPositivo('  el detector ve la variante que escribe otra luz', variante.replace('luzDeAbajo(c.brilloDelPiso, color.current)', 'luzDeAbajo(COMPOSICION_DE_LA_LUZ.brilloDelPiso, color.current)'), usaElCuadro)

// El velo destapa con la variante de la página ya dibujada (entrando por un enlace o por la flecha): sin ella, el primer cuadro destapado
// era la composición en blanco.
const BASE: Pick<PresetDeLaEscena, 'id' | 'variante'> = { id: 'base', variante: 'prueba' }
type Lista = typeof escenaLista
const listaBien = (f: Lista): boolean =>
  !f(BASE, null, true) && f(BASE, claveDeLaVariante('base', 'prueba'), true) && !f(BASE, claveDeLaVariante('web', 'prueba'), true) &&
  f(BASE, null, false) && f(BASE, null, true, true) && f(null, null, true) && f({ id: 'home', variante: null }, null, true)
afirmar(listaBien(escenaLista), 'la escena de la ruta está lista cuando la variante de ESA página dibujó (la de otra página no cuenta); sin escena, sin variante o con la variante apagada por el banco, en el acto')
controlPositivo('  el detector ve la de B12a.8 (destapaba sin mirar la variante)', (() => true) as Lista, listaBien)
afirmar(!puedeDestapar(5, false, 1000) && puedeDestapar(VELO.cuadrosPintados, true, 100) && puedeDestapar(0, false, VELO.esperaMaximaMs), '  el destape: con la escena lista y sus cuadros pintados, o el techo de emergencia (3,5 s)')
const delVelo = leer('_chrome/velo/VeloDeNavegacion.tsx')
const deLaRanura = leer('_lib/escena/ruta/RanuraDeLaVariante.tsx')
const elVeloEspera = (velo: string, ranura: string): boolean =>
  velo.includes('if (puedeDestapar(pintados, escenaDeLaRutaLista(), ahora - t0)) destapar()') &&
  /RANURA_EN_VIVO\.lista = lista/.test(ranura) && /escenaLista\(presetActual\(\), VARIANTE_DIBUJADA\.clave, hayPrimerCuadro\(\)/.test(ranura) &&
  /<Componente [^>]*\/>\s*<MarcaDeDibujo clave=\{claveDeLaVariante\(montada\.pagina, montada\.id\)\} \/>/.test(ranura) && /useFrame\(\(\) => \{\s*VARIANTE_DIBUJADA\.clave = clave/.test(ranura)
afirmar(elVeloEspera(delVelo, deLaRanura), '  el velo pregunta antes de destapar y la ranura lo contesta con la marca que va DESPUÉS de la variante (su cuadro corre después: la luz de la variante ya está escrita)')
controlPositivo('  el detector ve el velo que no pregunta (el de B12a.8)', delVelo.replace('escenaDeLaRutaLista(), ahora - t0', 'true, ahora - t0'), (v: string) => elVeloEspera(v, deLaRanura))
controlPositivo('  y la marca antes de la variante (anotaría antes de que la variante escriba)', deLaRanura.replace(/(<Componente [^>]*\/>)(\s*)(<MarcaDeDibujo [^>]*\/>)/, '$3$2$1'), (r: string) => elVeloEspera(delVelo, r))
const delPreset = leer('_lib/escena/ruta/PresetDeLaPagina.tsx')
afirmar(/if \(preset\.variante !== null\) void REGISTRO_DE_VARIANTES\[preset\.variante\]\(\)/.test(delPreset), '  y entrando directo, la página pide el trozo de su variante apenas se monta (el lienzo llega después)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El velo hacia el home: las dos vías (banda y montaje), elegidas por el banco')

const conVia = <T,>(v: unknown, f: () => T): T => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { __viaDelVelo: v } })
  try {
    return f()
  } finally {
    Reflect.deleteProperty(globalThis, 'window')
  }
}
type LeerVia = typeof viaDelVelo
const viasBien = (leerVia: LeerVia): boolean =>
  leerVia() === VIA_POR_DEFECTO && conVia('banda', leerVia) === 'banda' && conVia('montaje', leerVia) === 'montaje' && conVia('ninguna', leerVia) === 'ninguna' && conVia('cualquiera', leerVia) === VIA_POR_DEFECTO &&
  conLaBandaCorta('banda') && conLaBandaCorta('ambas') && !conLaBandaCorta('montaje') && !conLaBandaCorta('ninguna') &&
  conElMontajeLiviano('montaje') && conElMontajeLiviano('ambas') && !conElMontajeLiviano('banda') && !conElMontajeLiviano('ninguna')
afirmar(viasBien(viaDelVelo), `la vía sale de \`window.__viaDelVelo\` (la siembra \`scripts-carga/velo.ts\` con VIA=…; nunca la URL); sin ella, \`${VIA_POR_DEFECTO}\``)
controlPositivo('  el detector ve una vía que no escucha al banco', (() => VIA_POR_DEFECTO) as LeerVia, viasBien)
const corta = tiemposDelVelo(true)
const larga = tiemposDelVelo(false)
afirmar(corta.cubrirMs === VELO_CORTO.cubrirMs && corta.destaparMs === VELO_CORTO.destaparMs && larga.cubrirMs === VELO.cubrirMs && larga.destaparMs === VELO.destaparMs && VELO_CORTO.cubrirMs < VELO.cubrirMs && VELO_CORTO.destaparMs < VELO.destaparMs && Math.abs(VELO_CORTO.cubrirMs / VELO.cubrirMs - VELO_CORTO.destaparMs / VELO.destaparMs) < 0.02, `  banda: cubre en ${String(VELO_CORTO.cubrirMs)} ms y destapa en ${String(VELO_CORTO.destaparMs)} (eran ${String(VELO.cubrirMs)} y ${String(VELO.destaparMs)}: la misma proporción)`)
const usaLosTiempos = (v: string): boolean => v.includes("animar('destapando', tiempos().destaparMs") && v.includes("animar('cubriendo', tiempos().cubrirMs") && !/VELO\.(cubrir|destapar)Ms/.test(sinComentarios(v))
afirmar(usaLosTiempos(delVelo), '  y el velo los toma de la vía en cada pasada')
controlPositivo('  el detector ve el velo con los tiempos fijos', delVelo.replace("animar('destapando', tiempos().destaparMs", "animar('destapando', VELO.destaparMs"), usaLosTiempos)

// Montaje: llegando por la navegación cliente, con la coreografía ya en la mano, el home se monta animado de una (sin el árbol quieto).
const Sonda = (): React.JSX.Element => <i data-animada={useMovimientoEnTodoAncho() ? 'si' : 'no'} />
const montado = (): string => renderToStaticMarkup(
  <CompuertaDelHome>
    <Sonda />
  </CompuertaDelHome>,
)
const enLaHidratacion = montado()
const montajeBien = async (): Promise<void> => {
  const antes = coreografiaPrecargada()
  const cargadas = await precargarLaCoreografia()
  const sinPrimerCuadro = montado()
  marcarElPrimerCuadro()
  const deUnaNavegacion = montado()
  const conNinguna = conVia('ninguna', montado)
  afirmar(antes === null && cargadas !== null && coreografiaPrecargada() === cargadas, 'montaje: la coreografía animada se pide aparte (una vez) y queda a mano')
  afirmar(enLaHidratacion.includes('data-animada="no"') && sinPrimerCuadro.includes('data-animada="no"') && deUnaNavegacion.includes('data-animada="si"'), '  la compuerta: en la carga del documento (la hidratación: la escena no pintó) arranca quieta, como el servidor; llegando por la navegación cliente, animada en su primer render')
  controlPositivo('  el detector ve la vía `ninguna` (la de B12a.8: quieta y después rehecha)', conNinguna, (h: string) => h.includes('data-animada="si"'))
}
const calentar = leer('_componentes/navegacion/calentar.ts')
afirmar(/if \(ruta === RUTA_DEL_HOME\) \{\s*if \(!pedidas\.has\(ruta\) && conElMontajeLiviano\(viaDelVelo\(\)\)\) \{\s*pedidas\.add\(ruta\)\s*void precargarLaCoreografia\(\)/.test(calentar) && /calentarElDestino\(RUTA_DEL_HOME\)/.test(delVelo), '  y se pide en reposo desde cualquier página y al pasar por un enlace al home (`calentarElDestino`)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La píldora: arranca con el hilo calmo y retiene el «quieto» del velo hasta terminar')

type Calmo = typeof cuadroCalmo
const calmaBien = (f: Calmo, arranca: typeof arrancaElDesliz): boolean =>
  !f(null, { ahora: 100, hora: 99 }) && f({ ahora: 100, hora: 99 }, { ahora: 113.3, hora: 112 }) &&
  // El cuadro que llega tarde (medido: la hora del cuadro 56 ms detrás del reloj después del montaje): no es calmo.
  !f({ ahora: 2962, hora: 2950 }, { ahora: 3047, hora: 2991 }) && !f({ ahora: 100, hora: 99 }, { ahora: 160, hora: 158 }) &&
  arranca(CALMA_DEL_DESLIZ.seguidos, 0) && !arranca(CALMA_DEL_DESLIZ.seguidos - 1, CALMA_DEL_DESLIZ.esperaMaximaMs - 1) && arranca(0, CALMA_DEL_DESLIZ.esperaMaximaMs)
afirmar(calmaBien(cuadroCalmo, arrancaElDesliz), `la calma: ${String(CALMA_DEL_DESLIZ.seguidos)} cuadros seguidos con la hora fresca (≤ ${String(CALMA_DEL_DESLIZ.frescoMs)} ms detrás del reloj) y cortos (≤ ${String(CALMA_DEL_DESLIZ.intervaloMs)} ms); con un techo de ${String(CALMA_DEL_DESLIZ.esperaMaximaMs)} ms`)
controlPositivo('  el detector ve la del WIP (arrancaba en el cuadro siguiente, calmo o no)', (() => true) as Calmo, (f: Calmo) => calmaBien(f, arrancaElDesliz))

// El «quieto»: la banda termina antes que la píldora; las obras que esperan al velo arrancan cuando terminan las dos (una sola vez).
const ventanaDePrueba = new EventTarget()
Object.defineProperty(globalThis, 'window', { configurable: true, value: ventanaDePrueba })
let avisos = 0
ventanaDePrueba.addEventListener(EVENTOS_DEL_VELO.quieto, () => (avisos += 1))
interface Quieto {
  readonly banda: (enCurso: boolean) => void
  readonly retener: () => () => void
}
const quietoBien = (q: Quieto): boolean => {
  avisos = 0
  q.banda(true)
  const soltar = q.retener()
  q.banda(false)
  const conLaPildora = VELO_EN_CURSO.activo && avisos === 0
  soltar()
  soltar()
  const despues = !VELO_EN_CURSO.activo && avisos === 1
  // Sin retención, como antes: quieto al terminar la banda.
  q.banda(true)
  q.banda(false)
  return conLaPildora && despues && avisos === 2
}
afirmar(quietoBien({ banda: marcarLaBanda, retener: retenerElQuieto }), '  el velo sigue en curso mientras la píldora se desliza (las obras pesadas del home no caen en medio) y avisa «quieto» una sola vez, al soltarla')
controlPositivo('  el detector ve el «quieto» de B12a.8 (al terminar la banda, con la píldora todavía en camino)', { banda: marcarLaBanda, retener: () => () => undefined }, quietoBien)
Reflect.deleteProperty(globalThis, 'window')
const deLaPildora = leer('_chrome/barra/useDeslizDeLaPildora.ts')
const pildoraBien = (p: string): boolean =>
  /const alCubrir = \(\): void => \{[\s\S]*?soltarElQuieto = retenerElQuieto\(\)/.test(p) && /calmos = cuadroCalmo\(anterior, c\) \? calmos \+ 1 : 0/.test(p) && /if \(!arrancaElDesliz\(calmos, c\.ahora - t0\)\) \{/.test(p) &&
  /easing: CURVA_DEL_DESLIZ, fill: 'backwards' \}\)\s*a\.startTime = performance\.now\(\)/.test(p) && /a\.onfinish = \(\) => suelta\(\)\s*a\.oncancel = \(\) => suelta\(\)/.test(p) && !/EVENTOS_DEL_VELO\.repuso/.test(p)
afirmar(pildoraBien(deLaPildora), '  el deslizamiento: toma el «quieto» al cubrir, espera la calma después del destape, arranca con la hora de ese cuadro rellenando hacia atrás y lo suelta al terminar')
controlPositivo('  el detector ve el WIP (`97c80a64`: un cuadro después del destape, sin esperar la calma)', deLaPildora.replace('if (!arrancaElDesliz(calmos, c.ahora - t0)) {', 'if (false) {'), pildoraBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · T3 · «isReady»: compilar no tira si un material se libera mientras compila')

// Un renderer falso con lo que la espera usa: `compile` (los materiales), sus propiedades (el programa de cada uno) y las extensiones.
function rendererFalso(): { readonly r: RendererQueCompila; readonly listo: Set<THREE.Material>; readonly liberar: (m: THREE.Material) => void; readonly a: THREE.Material; readonly b: THREE.Material } {
  const a = new THREE.MeshBasicMaterial()
  const b = new THREE.MeshBasicMaterial()
  const listo = new Set<THREE.Material>()
  const propiedades = new Map<unknown, { currentProgram?: { isReady: () => boolean } }>()
  for (const m of [a, b]) propiedades.set(m, { currentProgram: { isReady: () => listo.has(m) } })
  const r: RendererQueCompila = {
    compile: () => new Set<THREE.Material>([a, b]),
    // Como `WebGLProperties`: `get` de algo que no está crea una entrada vacía.
    properties: { has: (o) => propiedades.has(o), get: (o) => propiedades.get(o) ?? (propiedades.set(o, {}), propiedades.get(o)) },
    extensions: { has: () => true },
  }
  return { r, listo, liberar: (m) => propiedades.delete(m), a, b }
}
/** La espera de three 0.182 (`checkMaterialsReady`, copiada): pregunta al programa sin mirar si el material sigue vivo. */
function laEsperaDeThree(r: Pick<RendererQueCompila, 'properties'>, pendientes: Set<THREE.Material>): number {
  pendientes.forEach((m) => {
    const p = r.properties.get(m) as { currentProgram: { isReady: () => boolean } }
    if (p.currentProgram.isReady()) pendientes.delete(m)
  })
  return pendientes.size
}
type Quitar = typeof quitarLosTerminados
const toleraLoLiberado = (quitar: Quitar): boolean => {
  const f = rendererFalso()
  const pendientes = f.r.compile(new THREE.Object3D(), new THREE.PerspectiveCamera())
  const primera = quitar(f.r, pendientes)
  f.liberar(f.b) // el título se suelta abajo de 1024 mientras compila
  f.listo.add(f.a)
  return primera === 2 && quitar(f.r, pendientes) === 0 && programaDe(f.r, f.b) === null
}
afirmar(toleraLoLiberado(quitarLosTerminados), 'la espera da por terminado el material liberado (ya no tiene programa) en vez de preguntarle: ni tira ni se cuelga')
controlPositivo('  el detector ve la espera de three (`currentProgram` undefined → «Cannot read properties of undefined (reading \'isReady\')»)', laEsperaDeThree, toleraLoLiberado)
const conCuidado = async (): Promise<void> => {
  const f = rendererFalso()
  const promesa = compilarConCuidado(f.r, new THREE.Object3D(), new THREE.PerspectiveCamera())
  f.liberar(f.a)
  setTimeout(() => f.listo.add(f.b), 30)
  const resuelta = await Promise.race([promesa.then(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), 2000))])
  afirmar(resuelta, '  y la promesa se resuelve (antes, la de three no se resolvía nunca: lo que la esperaba —los títulos que compilan, el pie— quedaba colgado)')
}
const ESCENA = ['titulos3d/sincronia.ts', 'pie3d/PieDeVolumen.tsx', 'pie3d/armadas.ts', 'gpu/Precompilar.tsx'].map((r) => sinComentarios(leer(`_lib/escena/${r}`)))
const sinCompileAsync = (fuentes: readonly string[]): boolean => fuentes.every((c) => !c.includes('compileAsync(') && c.includes('compilarConCuidado('))
afirmar(sinCompileAsync(ESCENA), '  los cuatro que compilaban con `compileAsync` (los títulos, el pie, las transformaciones del pie y la precompilación) usan la espera con cuidado')
controlPositivo('  el detector ve un `compileAsync` que quedó', [...ESCENA, 'void gl.compileAsync(escena, camara).then(listo)'], sinCompileAsync)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · T3 · el NaN: un título no se arma con una medida del DOM que no es un número')

const fuente = new Font(JSON.parse(readFileSync(path.join(V3, '_fuentes/chivo-400-titulos.json'), 'utf8')) as FontData)
const finita = (g: THREE.BufferGeometry): boolean => {
  const p = g.getAttribute('position')
  for (let i = 0; i < p.count * 3; i += 1) if (!Number.isFinite(p.array[i])) return false
  return true
}
const conNaN = armarElTitulo(fuente, 'Portfolio', [0, Number.NaN, 1, 1.5, 2, 2.5, 3, 3.5, 4])
const conRenglonNaN = armarElTitulo(fuente, 'Portfolio', [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4], 'letras', [], undefined, [0, 0, Number.NaN, 0, 0, 0, 0, 0, 0])
afirmar(finita(conNaN.geometria) && finita(conRenglonNaN.geometria), 'el título con una x o un renglón en NaN se arma con los avances de su fuente (sin una sola posición NaN: eran los ~60 avisos de `computeBoundingBox` al pasar a 360)')
const sinCuidado = new THREE.ExtrudeGeometry(fuente.generateShapes('P', 1), { depth: 0.1, bevelEnabled: false })
sinCuidado.translate(Number.NaN, 0, 0)
controlPositivo('  el detector ve una letra corrida por un NaN (la geometría de antes)', sinCuidado, finita)
afirmar(medidaDelDomFinita(16, 1, [0, 0.6], [0]) && !medidaDelDomFinita(0, 1, [0, 0.6], [0]) && !medidaDelDomFinita(16, 0, [0, 0.6], [0]) && !medidaDelDomFinita(16, 1, [0, Number.POSITIVE_INFINITY], [0]), '  y la medida del DOM con el cuerpo o la escala en cero (la cuenta da NaN o infinito) no se usa')
controlPositivo('  el detector ve la medida de antes (sin mirar)', (() => true) as typeof medidaDelDomFinita, (f: typeof medidaDelDomFinita) => !f(0, 1, [Number.NaN], [0]))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · T3 · el cartel del sonido no pisa el título de la intro abajo de 1024')

// La cuenta con los tokens (px, raíz 16): el parlante arriba a la izquierda, su cartel debajo; el título, después del aire de la intro.
const marco = leer('_componentes/pagina/ComposicionDeLaIntro.tsx')
const control = leer('_chrome/sonido/ControlDelSonido.tsx')
const SP: Readonly<Record<string, number>> = { 1: 4, 2: 8, 3: 12, 4: 16, 8: 32, 12: 48 }
const MICRO = 10
// Las clases se arman partidas (Tailwind lee también los tests: una clase arbitraria entera escrita acá se emitiría).
const DEBAJO_DEL_PARLANTE = ['className="pointer-events-none absolute top-full left-0 mt-', '[var(--spacing-2)]"'].join('')
const AIRE_DE_ANTES = [' pt-', '[calc(var(--zona-de-la-cabecera)+var(--spacing-8))] escritorio:pt-'].join('')
const cuentaBien = (m: string, c: string): boolean => {
  const aire = /'1': '[^']* pt-\[calc\(var\(--zona-de-la-cabecera\)\+var\(--spacing-(\d+)\)\)\] escritorio:pt-/.exec(m)?.[1]
  const tresIguales = ['1', '2', '3'].every((k) => new RegExp(`'${k}': '[^']* pt-\\[calc\\(var\\(--zona-de-la-cabecera\\)\\+var\\(--spacing-${String(aire)}\\)\\)\\] escritorio:pt-`).test(m))
  if (aire === undefined || !tresIguales || !c.includes(DEBAJO_DEL_PARLANTE)) return false
  const zona = SP[4] + SP[12] + SP[4]
  const tituloArriba = zona + (SP[aire] ?? 0)
  // El cartel: 16 + 48 del parlante, su margen de 8, el relleno de 8 + 8, dos renglones de Micro (interlineado 1) con 4 entre ellos y su borde.
  const cartelAbajo = SP[4] + SP[12] + SP[2] + 2 * SP[2] + 2 * MICRO + SP[1] + 2
  return tituloArriba - cartelAbajo >= SP[2]
}
afirmar(cuentaBien(marco, control), 'abajo de 1024 el título de la intro arranca debajo del cartel del sonido (con 8 px de aire, en las tres composiciones): el aire de arriba es `--spacing-12` (era 8)')
controlPositivo('  el detector ve el aire de B12a.8 (el cartel pisaba el título 2 px)', marco.replace(/ pt-\[calc\(var\(--zona-de-la-cabecera\)\+var\(--spacing-12\)\)\] escritorio:pt-/g, AIRE_DE_ANTES), (m: string) => cuentaBien(m, control))
afirmar(!control.includes('blur-panel)]\\"'), '  y el disco de escritorio con su vidrio entero (una barra invertida de más dejaba la clase del desenfoque sin aplicar)')

void conCuidado()
  .then(montajeBien)
  .then(() => cerrar('s78-t0'))
