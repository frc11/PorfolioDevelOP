/**
 * s78 · B13 (2026-10-22) · EL CIERRE DE CADA PÁGINA, sin navegador. Cada afirmación con su control positivo. Lo que se ve (la frase que
 * se da vuelta en el CTA sobre la sala de noche, el piso que se calma, el pie que llega después) lo mide el banco en el navegador
 * (`scripts-carga/cierre-de-pagina.ts`, lo corre el orquestador); el plan y qué mirar, en `docs/rediseno/SPRINT-B13-NOCTURNO.md`.
 *
 *   1 · la cámara del cierre es la del final del home: la misma pose en cada pantalla del pin, sin vueltas al llegar desde la intro;
 *   2 · la pantalla del cierre: el escenario a una pantalla por pantalla, la lista repartida en las mismas seis, y después la resolución y el pie;
 *   3 · la resolución: 0 hasta que se suelta el pin, 1 antes de que el pie empiece a llegar; la pista manda antes de que la escena despierte;
 *   4 · la ranura: le pasa la resolución a la variante y es dueña de la luz en el cierre; la variante de la base deja el piso liso;
 *   5 · el rig toma la pista del cierre y el final del home (el encastre) no corre en una página;
 *   6 · el CTA: abre el contacto con el servicio de la página (`data-precarga`), y de noche la escena lo arma en papel;
 *   7 · la pieza: el marcado del cierre en la página base, sus tres partes en orden, el pie plano, y el home sin cambios.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { motionValue } from 'motion/react'
import React, { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { DestinoDelCta, PrecargaDelCta } from '../../_componentes/ctaDelFinal/CtaDelFinal'
import { CierreDeLaPagina } from '../../_componentes/pagina/cierre/CierreDeLaPagina'
import { MaterialDeLosTitulos } from '../../_componentes/titulos3d/materialDeLosTitulos'
import { PRESET as PRESET_DE_LA_BASE } from '../../pagina-base/preset'
import { LLEGADAS_DEL_PIE } from '../../_secciones/cierre/Cierre'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { buildTrack, sampleTrack } from '../escena/choreographySampler'
import type { ChoreoKeyframe, MutableChoreoPose } from '../escena/choreographyTypes'
import { CTA_EN_VIVO, ctaDeNoche } from '../escena/ctaDelFinal/enVivo'
import { POSES_DEL_FINAL, progresoDelFinal } from '../escena/finalDelRecorrido'
import { SELECTOR_DEL_CIERRE, SELECTOR_DEL_CIERRE_DE_NOCHE, PARTES_DEL_CIERRE } from '../escena/ruta/atributoDelCierre'
import {
  CIERRE_EN_VIVO,
  FIN_DEL_CIERRE,
  PANTALLAS_DEL_PIN_DEL_CIERRE,
  PISTA_DEL_CIERRE,
  RELEVO_DEL_CIERRE,
  RESOLUCION_DEL_CIERRE,
  avanceDeLaPista,
  cierreManda,
  enUnaPagina,
  medirElCierre,
  pantallaDelCierre,
  resolucionDelCierre,
  type FuenteDelCierre,
} from '../escena/ruta/cierreDeLaPagina'
import { poseDeLaIntro } from '../escena/ruta/composicionEnLaEscena'
import { PISTA_DE_LA_INTRO, POSE_DE_LA_INTRO } from '../escena/ruta/pistaDeLaIntro'
import { PRESET_DEL_HOME, apilarElPreset } from '../escena/ruta/preset'
import { COMPOSICION_DE_LA_LUZ } from '../escena/ruta/variante'
import { cuadroDeLaPrueba } from '../escena/ruta/VarianteDePrueba'
import { MARGEN_DE_REANUDACION } from '../escena/visibilidad'
import { ModoDelPieForzado, useModoDelPie, type ModoDelPie } from '../pie3d/registro'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const nuevaPose = (): MutableChoreoPose => ({ angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 })
const cerca = (a: number, b: number, e = 1e-6): boolean => Math.abs(a - b) < e
const mismoAngulo = (a: number, b: number): boolean => {
  const d = (((a - b) % 360) + 360) % 360
  return d < 1e-6 || d > 360 - 1e-6
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La cámara del cierre es la del final del home')

const HOME = buildTrack(CHOREO_KEYFRAMES)
const pantallas = Array.from({ length: 901 }, (_, i) => -1 + i * 0.01)
/** El mayor desvío entre la pista del cierre y la del home en las mismas pantallas del pin (de −1 al pie entero). */
function desvioContraElHome(pista: readonly ChoreoKeyframe[]): number {
  const t = buildTrack(pista)
  const a = nuevaPose()
  const b = nuevaPose()
  let peor = 0
  for (const p of pantallas) {
    sampleTrack(t, avanceDeLaPista(p), a)
    sampleTrack(HOME, progresoDelFinal(Math.min(p, PANTALLAS_DE_POR_QUE_DEVELOP)), b)
    peor = Math.max(peor, Math.abs(a.height - b.height), Math.abs(a.distance - b.distance), Math.abs(a.frameX - b.frameX), Math.abs(a.frameY - b.frameY), mismoAngulo(a.angleDeg, b.angleDeg) ? 0 : 1)
  }
  return peor
}
const igualAlHome = (pista: readonly ChoreoKeyframe[]): boolean => desvioContraElHome(pista) < 1e-6
afirmar(igualAlHome(PISTA_DEL_CIERRE), `en cada pantalla del pin (−1 a ${String(FIN_DEL_CIERRE)}) la cámara del cierre hace la pose del final del home: A, B, C, el alejamiento y E (desvío ${desvioContraElHome(PISTA_DEL_CIERRE).toExponential(1)})`)
controlPositivo('  el detector ve el CTA corrido media pantalla', PISTA_DEL_CIERRE.map((k) => (k.name === 'cta' ? { ...k, at: k.at + 0.5 / (FIN_DEL_CIERRE - RELEVO_DEL_CIERRE) } : k)), igualAlHome)
const sinVueltas = (pista: readonly ChoreoKeyframe[]): boolean => pista.every((k) => cerca(k.pose.angleDeg, 0))
afirmar(sinVueltas(PISTA_DEL_CIERRE) && cerca(POSE_DE_LA_INTRO.angleDeg, 38), '  con el ángulo en 0 (la misma cámara que 360): desde la pose de la intro (38°) no da una vuelta entera')
controlPositivo('  el detector ve la frase en 360', PISTA_DEL_CIERRE.map((k, i) => (i === 0 ? { ...k, pose: { ...k.pose, angleDeg: 360 } } : k)), sinVueltas)
const c = nuevaPose()
sampleTrack(buildTrack(PISTA_DEL_CIERRE), avanceDeLaPista(4), c)
afirmar(cerca(c.distance, POSES_DEL_FINAL.cta.distance) && cerca(c.frameY, POSES_DEL_FINAL.cta.frameY) && cerca(c.height, POSES_DEL_FINAL.cta.height), '  en el sostén del CTA, la pose C (el logo abajo, el CTA al centro): la misma cámara con que el CTA se coloca en el mundo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La pantalla del cierre')

const H = 900
const ESCENARIO = { arriba: 5000, abajo: 5000 + PANTALLAS_DE_POR_QUE_DEVELOP * H }
const LISTA = { arriba: 5000, abajo: 5000 + 4.3 * H }
type Medida = (seis: { arriba: number; abajo: number }, scrollY: number, alto: number) => number
const medidaBien = (m: Medida): boolean =>
  cerca(m(ESCENARIO, 5000, H), 0) &&
  [1, 2.4, 3.6, 5.6].every((k) => cerca(m(ESCENARIO, 5000 + k * H, H), k)) &&
  cerca(m(ESCENARIO, ESCENARIO.abajo - H, H), PANTALLAS_DEL_PIN_DEL_CIERRE) &&
  cerca(m(LISTA, LISTA.abajo - H, H), PANTALLAS_DEL_PIN_DEL_CIERRE) &&
  cerca(m(LISTA, LISTA.abajo, H), PANTALLAS_DEL_PIN_DEL_CIERRE + 1) &&
  cerca(m(ESCENARIO, 5000 - H, H), -1)
afirmar(medidaBien(pantallaDelCierre), 'el escenario va a una pantalla por pantalla (A, B, C donde el home); la lista llega al final del pin con su fondo en el del cuadro; después, una pantalla por pantalla (la resolución y el pie)')
controlPositivo('  el detector ve la lista contada a una pantalla por pantalla (el CTA quedaría fuera de su pose)', ((s, y, a) => (y - s.arriba) / a) as Medida, medidaBien)

const parte = `${SELECTOR_DEL_CIERRE} [data-parte="${PARTES_DEL_CIERRE.seisRazones}"]`
const documentoCon = (top: number, bottom: number): FuenteDelCierre => ({ querySelector: (s) => (s === parte ? { getBoundingClientRect: () => ({ top, bottom }) } : null) })
const medirBien = (d: FuenteDelCierre): boolean => {
  medirElCierre(d, SELECTOR_DEL_CIERRE, 1000, H)
  const adentro = cerca(CIERRE_EN_VIVO.pantalla, 6.5) && cerca(RESOLUCION_DEL_CIERRE.current, resolucionDelCierre(6.5))
  medirElCierre(d, null, 1000, H)
  return adentro && CIERRE_EN_VIVO.pantalla === Number.NEGATIVE_INFINITY && RESOLUCION_DEL_CIERRE.current === 0
}
afirmar(medirBien(documentoCon(-5850, -5850 + 7 * H)), '  medida en el layout sobre su parte (`data-parte`): escribe la pantalla y la resolución; sin cierre (el home), −∞ y 0')
controlPositivo('  el detector ve un documento sin la parte medida', { querySelector: () => null } as FuenteDelCierre, medirBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La resolución, antes del pie')

const muestras = Array.from({ length: 1001 }, (_, i) => RELEVO_DEL_CIERRE + (i * (FIN_DEL_CIERRE - RELEVO_DEL_CIERRE)) / 1000)
const PRIMERA_LLEGADA_DEL_PIE = PANTALLAS_DEL_PIN_DEL_CIERRE + 1 + Math.min(LLEGADAS_DEL_PIE.izquierda[0], LLEGADAS_DEL_PIE.derecha[0], LLEGADAS_DEL_PIE.abajo[0])
const resolucionBien = (r: (p: number) => number): boolean =>
  muestras.every((p) => r(p) >= 0 && r(p) <= 1) &&
  muestras.every((p, i) => i === 0 || r(p) >= r(muestras[i - 1]) - 1e-12) &&
  r(PANTALLAS_DEL_PIN_DEL_CIERRE) === 0 &&
  r(PANTALLAS_DEL_PIN_DEL_CIERRE + 1) === 1 &&
  r(PRIMERA_LLEGADA_DEL_PIE) === 1
afirmar(resolucionBien(resolucionDelCierre), `0 con el CTA clavado, sube mientras el CTA se va y está entera (el piso liso) en la pantalla ${String(PANTALLAS_DEL_PIN_DEL_CIERRE + 1)}, antes de que llegue la primera pieza del pie (${PRIMERA_LLEGADA_DEL_PIE.toFixed(2)})`)
controlPositivo('  el detector ve una resolución que termina con el pie ya llegando', (p: number) => resolucionDelCierre(p - 0.5), resolucionBien)
const despiertaYa = (relevo: number): boolean => relevo < -1 - MARGEN_DE_REANUDACION
afirmar(despiertaYa(RELEVO_DEL_CIERRE) && !cierreManda(-2) && cierreManda(-1 - MARGEN_DE_REANUDACION), `  la pista del cierre manda desde ${String(RELEVO_DEL_CIERRE)}: antes de que la escena despierte (−1 − ${String(MARGEN_DE_REANUDACION)}), así el primer cuadro ya es la frase; en el papel, la de la intro`)
controlPositivo('  el detector ve un relevo recién con el cierre a la vista', -1, despiertaYa)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La ranura y la variante: el piso liso antes del pie')

const ranura = sinComentarios(leer('_lib/escena/ruta/RanuraDeLaVariante.tsx'))
const ranuraBien = (r: string): boolean =>
  /const enElCierre = deLaPagina !== null && deLaPagina\.pista !== null && cierreManda\(\)/.test(r) &&
  /if \(!ahora && !enElCierre\) \{/.test(r) &&
  /resolucion=\{resolucion\} \/>/.test(r) &&
  /const resolucion = hayBanco\(\) && \(window as VentanaDelBanco\)\.__cierreSinResolucion === true \? SIN_RESOLUCION : RESOLUCION_DEL_CIERRE/.test(r)
afirmar(ranuraBien(ranura), 'la ranura le pasa la resolución a la variante y es dueña de la luz de abajo y de la energía en el cierre (el final del home no corre en una página); el banco la apaga para su control')
controlPositivo('  el detector ve la ranura que suelta la luz en el cierre', ranura.replace(' && !enElCierre', ''), ranuraBien)
afirmar(/const ahora = saliendo\.current \|\| yendose \|\| \(deLaPagina !== null && deLaPagina\.pista !== null && AVANCE_DE_LA_INTRO\.current < 1\)/.test(ranura), '  y en la intro, la de siempre (P-H29a)')

const resuelta = (cuadro: typeof cuadroDeLaPrueba): boolean => {
  const sin = cuadro(1, false, false, 0, null, 0)
  const mitad = cuadro(1, false, false, 0, null, 0.5)
  const toda = cuadro(1, false, false, 0, null, 1)
  const quieta = cuadro(1, true, false, 0, null, 0.4)
  return cerca(sin.encendido, 1) && mitad.encendido > 0 && mitad.encendido < 1 && cerca(toda.encendido, 0) && cerca(toda.brilloDelPiso, COMPOSICION_DE_LA_LUZ.brilloDelPiso) && cerca(quieta.encendido, 1) && cerca(cuadro(1, true, false, 0, null, 0.6).encendido, 0)
}
afirmar(resuelta(cuadroDeLaPrueba), 'la variante de la base: sin resolución, encendida (como siempre); a mitad, a mitad; resuelta, el anillo apagado y la luz de abajo en la de la composición (el piso liso y calmo); con menos movimiento, de una')
controlPositivo('  el detector ve una variante que ignora la resolución', ((a: number, r: boolean, s: boolean, t: number, x: null) => cuadroDeLaPrueba(a, r, s, t, x)) as typeof cuadroDeLaPrueba, resuelta)
const variante = sinComentarios(leer('_lib/escena/ruta/VarianteDePrueba.tsx'))
const leeLaSenal = (v: string): boolean => /cuadroDeLaPrueba\(avance\.current, reducido, saliendo\.current, performance\.now\(\), salida\.current, resolucion\.current\)/.test(v)
afirmar(leeLaSenal(variante), '  y la lee en su cuadro (`resolucion.current`)')
controlPositivo('  el detector ve la variante sin la señal', variante.replace(', resolucion.current)', ')'), leeLaSenal)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El rig y el final del home')

const LOGO = { w: 6.9, h: 4.78 }
const pose = (pantalla: number): MutableChoreoPose => {
  CIERRE_EN_VIVO.pantalla = pantalla
  const p = nuevaPose()
  poseDeLaIntro(buildTrack(PISTA_DE_LA_INTRO), 1, p, 1.6, 35, LOGO.w, LOGO.h)
  CIERRE_EN_VIVO.pantalla = Number.NEGATIVE_INFINITY
  return p
}
const enC = pose(4)
const enLaIntro = pose(-3)
afirmar(cerca(enC.distance, POSES_DEL_FINAL.cta.distance) && cerca(enC.frameY, -1) && cerca(enLaIntro.distance, POSE_DE_LA_INTRO.distance) && cerca(enLaIntro.angleDeg, POSE_DE_LA_INTRO.angleDeg), 'el rig de una página toma la pista del cierre donde manda (la pose C en la pantalla 4) y la de la intro antes (sin tocar el rig: la pose de la intro la delega)')
controlPositivo('  el detector ve el cierre sin su pista (la cámara se quedaría en la intro)', pose(-3), (p) => cerca(p.distance, POSES_DEL_FINAL.cta.distance))

const final = leer('_lib/escena/final/cuadroDelFinal.ts')
const finalApagado = (f: string): boolean => /s\.fondo = Math\.max\(0, document\.documentElement\.offsetHeight - window\.innerHeight\)\n\s*\/\/[^\n]*\n\s*if \(enUnaPagina\(\)\) s\.fondo = Number\.POSITIVE_INFINITY\n\s*EN_VIVO\.pegadoDesde = s\.fondo/.test(f)
afirmar(finalApagado(final), 'en una página el final del home (el encastre) nunca está al fondo: no corre, y si venía armado del home, se deshace')
controlPositivo('  el detector ve el final que corre al fondo de una página', final.replace(/\n\s*if \(enUnaPagina\(\)\) s\.fondo = Number\.POSITIVE_INFINITY/, ''), finalApagado)
const sacarLaBase = apilarElPreset(PRESET_DE_LA_BASE)
const enLaBase = enUnaPagina()
const sacarElHome = apilarElPreset(PRESET_DEL_HOME)
const enElHome = enUnaPagina()
sacarElHome()
sacarLaBase()
afirmar(enLaBase && !enElHome, '  `enUnaPagina`: con el preset de una página (con pista), sí; con el del home, no')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El CTA: el servicio de la página y, de noche, en papel')

const Progreso = motionValue(1)
const cta = (precarga: 'web' | null): string => renderToStaticMarkup(
  <PrecargaDelCta.Provider value={precarga}>
    <DestinoDelCta rotulo="Hablanos" destino="#contacto" progreso={Progreso} />
  </PrecargaDelCta.Provider>,
)
const conPrecarga = (html: string): boolean => /data-abre-contacto="panel" data-precarga="web"/.test(html)
afirmar(conPrecarga(cta('web')) && !cta(null).includes('data-precarga'), 'con el servicio de la página, el CTA lo precarga en el contacto (`data-precarga`); sin él (el home), el marcado de siempre')
controlPositivo('  el detector ve el CTA sin el servicio', cta(null), conPrecarga)
const deNoche = (cerrado: Element | null): boolean => {
  CTA_EN_VIVO.destino = { closest: (s: string) => (s === SELECTOR_DEL_CIERRE_DE_NOCHE ? cerrado : null) } as unknown as HTMLElement
  const r = ctaDeNoche()
  CTA_EN_VIVO.destino = null
  return r
}
afirmar(deNoche({} as Element) && !deNoche(null), 'el CTA adentro del cierre de una página de noche se arma en papel; el del home, en tinta')
controlPositivo('  el detector ve un CTA del home', null, (x: Element | null) => deNoche(x))
const escenaDelCta = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))
afirmar(/const color: Variante = entornoDeLaEscena\(\)\.titulos === 'blanco' \|\| ctaDeNoche\(\) \? 'blanco' : 'negro'/.test(escenaDelCta), '  y la escena del CTA lo lee al armarse (se rearma cuando cambia su lugar)')
const titulo3d = sinComentarios(leer('_componentes/titulos3d/TituloDeVolumen.tsx'))
const materialBien = (t: string): boolean => /const delTramo = useContext\(MaterialDeLosTitulos\)/.test(t) && /useTituloDeVolumen\(\{ id, texto, lugar, lectura, subida, material: delTramo,/.test(t)
afirmar(materialBien(titulo3d) && /<MaterialDeLosTitulos\.Provider value=\{deNoche \? 'blanco' : undefined\}>/.test(leer('_componentes/pagina/cierre/SeisRazonesDelCierre.tsx')), 'la frase en volumen del cierre de noche va en papel (el material del tramo); sin proveedor, el del entorno (el home)')
controlPositivo('  el detector ve el título que ignora el material del tramo', titulo3d.replace('material: delTramo, ', ''), materialBien)
const SondaDelMaterial = (): React.JSX.Element => <i data-m={useContext(MaterialDeLosTitulos) ?? 'entorno'} />
afirmar(renderToStaticMarkup(<SondaDelMaterial />).includes('data-m="entorno"'), '  sin proveedor, `undefined` (el del entorno)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La pieza en la página base')

const html = renderToStaticMarkup(<CierreDeLaPagina preset={PRESET_DE_LA_BASE} />)
const posicion = (s: string): number => html.indexOf(s)
const piezaBien = (h: string): boolean =>
  h.startsWith('<div data-cierre-de-pagina="base" data-cierre-de-noche="" data-servicio="web" data-seccion="invertida"') &&
  h.indexOf(`data-parte="${PARTES_DEL_CIERRE.seisRazones}"`) > 0 &&
  h.indexOf(`data-parte="${PARTES_DEL_CIERRE.seisRazones}"`) < h.indexOf(`data-parte="${PARTES_DEL_CIERRE.resolucion}"`) &&
  h.indexOf(`data-parte="${PARTES_DEL_CIERRE.resolucion}"`) < h.indexOf(`data-parte="${PARTES_DEL_CIERRE.pie}"`) &&
  /data-parte="resolucion-del-cierre" aria-hidden="true" class="h-svh"/.test(h) &&
  /data-abre-contacto="panel" data-precarga="web"/.test(h) &&
  h.includes('Por qué develOP') && h.includes('Seis razones') &&
  /<footer data-pieza="pie"/.test(h) &&
  /href="\/v3#servicios"/.test(h) &&
  !/href="#servicios"/.test(h)
afirmar(piezaBien(html), 'el cierre de la base: su atributo (el id de la página), de noche y con el acento de web; Seis razones, la resolución (una pantalla vacía) y el pie, en orden; el CTA con `data-precarga="web"`; el recorrido del pie va al home (`/v3#…`)')
controlPositivo('  el detector ve un cierre con el pie antes de la resolución', html.replace(`data-parte="${PARTES_DEL_CIERRE.resolucion}"`, 'data-parte="x"').replace(`data-parte="${PARTES_DEL_CIERRE.pie}"`, `data-parte="${PARTES_DEL_CIERRE.resolucion}"`), piezaBien)
afirmar(posicion('frase-del-final') > 0 && posicion('data-pieza="cta-del-final"') > posicion('frase-del-final'), '  sin coreografía (el árbol quieto, abajo de 1024 y con menos movimiento): la lista, con la frase y el CTA en su bloque')
const sinAcento = renderToStaticMarkup(<CierreDeLaPagina preset={{ ...PRESET_DE_LA_BASE, acento: null, noche: 'dia' }} />)
afirmar(!sinAcento.includes('data-precarga') && !sinAcento.includes('data-cierre-de-noche') && !sinAcento.includes('data-seccion="invertida"'), '  una página sin acento y de día: sin precarga, en la tinta')

const Sonda = (): React.JSX.Element => <i data-modo={useModoDelPie()} />
const modo = (forzado: ModoDelPie | null): string => renderToStaticMarkup(<ModoDelPieForzado.Provider value={forzado}><Sonda /></ModoDelPieForzado.Provider>)
const forzadoBien = (f: (m: ModoDelPie | null) => string): boolean => f('volumen').includes('data-modo="volumen"') && f('plano').includes('data-modo="plano"') && f(null).includes('data-modo="plano"')
afirmar(forzadoBien(modo) && /<ModoDelPieForzado\.Provider value="plano">/.test(leer('_componentes/pagina/cierre/PieDelCierre.tsx')), 'el pie del cierre va plano en todo ancho (el modo pedido por el tramo); sin proveedor, el de la carga')
controlPositivo('  el detector ve el modo que ignora el pedido', (() => renderToStaticMarkup(<Sonda />)) as (m: ModoDelPie | null) => string, forzadoBien)

const base = leer('pagina-base/page.tsx')
const cuerpo = leer('pagina-base/CuerpoDeLaBase.tsx')
// [B10] cambió por diseño: el cierre recibe también las preguntas del FAQ de la página (`preguntas`); lo afirma s78-b10.
const baseBien = (p: string, cu: string): boolean => /<CuerpoDeLaBase \/>\n\s*\{\/\*[^\n]*\*\/\}\n\s*<CierreDeLaPagina preset=\{PRESET\}(?: preguntas=\{[A-Z_]+\})? \/>\n\s*<\/main>/.test(p) && !cu.includes('data-pie-de-pagina') && PRESET_DE_LA_BASE.tramos?.pie === SELECTOR_DEL_CIERRE
afirmar(baseBien(base, cuerpo), 'la página base monta el cierre después del cuerpo, su preset lo declara en `tramos.pie` y el pie provisorio se fue')
controlPositivo('  el detector ve el pie provisorio de vuelta', [base, `${cuerpo}<section data-pie-de-pagina="provisorio" />`] as const, ([p, cu]) => baseBien(p, cu))

const delHome = ['page.tsx', '_secciones/Home.tsx', '_secciones/por-que-develop/PorQueDevelop.tsx', '_secciones/cierre/Cierre.tsx'].map(leer).join('\n')
afirmar(!delHome.includes('CierreDeLaPagina') && !delHome.includes('PrecargaDelCta') && !delHome.includes('ModoDelPieForzado'), 'el home no monta el cierre de las páginas ni provee la precarga ni el modo del pie: su final y su pie, como estaban')

cerrar('s78-b13')
