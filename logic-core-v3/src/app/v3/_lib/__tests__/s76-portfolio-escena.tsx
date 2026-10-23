/**
 * [B1] s76 · B1.2 y B1.2b — EL SELECTOR VIVO, sin navegador: los videos (sólo el activo, nada antes de estar cerca, sin autoplay con
 * movimiento reducido), el Portfolio sin contextos WebGL propios, la pose del logo (una sola, calma: un desplazamiento sobre la del
 * scroll, el progreso no se toca) con sus criterios medidos (el logo centrado en su mitad, el título en su lugar y sin perspectiva),
 * el oscurecido (un multiplicador último), el hover instantáneo con sus guardas, el pin del panel, la secuencia por tiempo, las
 * marcas de agua, «la tuya» y el título que sale cayendo. Y que las banderas de B1.2 salieron.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'

import { rayLogoInk } from '@/app/probe-escena/__tests__/frameProbe'

import { TOLERANCIA_DEL_TOPE_PX, enHorizontal, tramosDelPanel, type MuestraDelPanel } from '../../../../../scripts-carga/panel'

import { marcar } from '../../_secciones/_invariantes/render'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { CONSULTA_DEL_PUNTERO_FINO, HOVER, pasoConElPin, seMovioDeVerdad, suenaElCambio } from '../../_secciones/trabajos/portfolio/estado'
import { ESTILO_DEL_VIDRIO, OPACIDAD_DEL_VIDRIO } from '../../_secciones/trabajos/portfolio/EscenarioDelPortfolio'
import { DESPEJE_DE_LA_BARRA, NIVEL_DEL_TITULO_DE_LA_TUYA } from '../../_secciones/trabajos/portfolio/LaTuya'
import { OPACIDAD_DE_LA_MARCA } from '../../_secciones/trabajos/portfolio/MarcaDeAgua'
import { CONTORNO_DEL_SIGNO, PUNTO_DEL_SIGNO } from '../../_secciones/trabajos/portfolio/SignoDePregunta'
import { ESTILO_DEL_HUECO, PROPORCION_DEL_LOGO, huecoEnElCuadro } from '../../_secciones/trabajos/portfolio/hueco'
import { MedioDeLaTira, estadoDelVideo } from '../../_secciones/trabajos/portfolio/MedioDeLaTira'
import { ANTES_DEL_PIN, EN_LA_COLA, type IndiceDePaso } from '../../_secciones/trabajos/portfolio/pasos'
import { SECUENCIA, demoraDe, enLaSecuencia } from '../../_secciones/trabajos/portfolio/secuencia'
import { COLUMNA_DEL_ANCHO } from '../../_secciones/trabajos/portfolio/usePortfolio'
import { SOLAPE_DE_LA_SECCION } from '../../_secciones/trabajos/geometria'
import { fovConFactor, factorDeLaBanda } from '../escena/banda'
import { progresoDeLaCamara } from '../escena/camaraDeEntonces'
import type { MutableChoreoPose } from '../escena/choreographyTypes'
import { VIRA_PITCH_DEG, VIRA_YAW_DEG } from '../escena/choreographyPhysics'
import { armarLaCamara, poseDelPortfolio } from '../escena/poseDelPortfolio'
import { DIM_DEL_PORTFOLIO, PERSECUCION_DEL_PESO_S, PORTFOLIO_EN_LA_ESCENA, avanzarElPeso, huecoDeLaColumna, mezclarLaPose, multiplicadorDelOscurecido, type HuecoDelLogo } from '../escena/portfolioEnLaEscena'
import { CAMERA_FOV } from '../escena/probeScene'
import { pantallaDeProgreso, progresoDePantalla } from '../escena/recorrido'
import { camaraDeLaLectura, colocar, lineaDeBase, poseDeLaLectura, type MedidasDeLaFuente } from '../escena/titulos3d/colocacion'
import { VERIFICACION } from '../escena/titulos3d/sincronia'
import { LECTURA } from '../titulos3d/registro'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const veces = (h: string, a: string): number => h.split(a).length - 1

/** El logo medido de la escena (el mesh: `ProbeLogo`), el que el rig le pasa al encuadre. */
const LOGO = { w: 6.863, h: 4.779 }
/** Los cuadros donde se mide: escritorio (1440 y 1024) y tablet (parada y acostada), con la columna que deja el panel en cada uno. */
const CUADROS = [
  { ancho: 1440, alto: 900, columna: COLUMNA_DEL_ANCHO.escritorio },
  { ancho: 1024, alto: 768, columna: COLUMNA_DEL_ANCHO.escritorio },
  { ancho: 820, alto: 1180, columna: COLUMNA_DEL_ANCHO.tablet },
  { ancho: 1023, alto: 768, columna: COLUMNA_DEL_ANCHO.tablet },
] as const
type Cuadro = (typeof CUADROS)[number]

const RAYO = new THREE.Vector3()
/** La caja del logo en el cuadro (−1…1), por rayos contra su tinta (`frameProbe`): un instrumento distinto del que usa la pose. */
function cajaPorRayos(c: THREE.PerspectiveCamera): { x0: number; x1: number; y0: number; y1: number } | null {
  let [x0, x1, y0, y1] = [9, -9, 9, -9]
  const n = 200
  const m = 150
  for (let iy = 0; iy < m; iy += 1) {
    for (let ix = 0; ix < n; ix += 1) {
      const x = ((ix + 0.5) / n) * 2 - 1
      const y = ((iy + 0.5) / m) * 2 - 1
      RAYO.set(x, y, 0.5).unproject(c).sub(c.position).normalize()
      if (rayLogoInk([c.position.x, c.position.y, c.position.z], [RAYO.x, RAYO.y, RAYO.z]) === Infinity) continue
      x0 = Math.min(x0, x)
      x1 = Math.max(x1, x)
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }
  }
  return x1 < x0 ? null : { x0, x1, y0, y1 }
}

const fovDe = (q: Cuadro): number => fovConFactor(CAMERA_FOV, factorDeLaBanda(q.ancho, q.alto))
const camaraDelCuadro = (q: Cuadro): THREE.PerspectiveCamera =>
  armarLaCamara(new THREE.PerspectiveCamera(), { ...poseDelPortfolio(q.ancho / q.alto, fovDe(q), LOGO.w, LOGO.h, huecoDeLaColumna(q.columna)) }, q.ancho / q.alto, fovDe(q), LOGO.w, LOGO.h)

/** [B1.2c] La normal del plano del logo (el mesh quieto mira en z) y el ángulo de una cámara con ella (como rectas, en grados). */
const NORMAL_DEL_LOGO = new THREE.Vector3(0, 0, 1)
function anguloConElLogo(c: THREE.PerspectiveCamera): number {
  const mirada = new THREE.Vector3()
  c.getWorldDirection(mirada)
  return THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.abs(mirada.dot(NORMAL_DEL_LOGO)))))
}

export function afirmarElSelectorVivo(): void {
  titulo('B1.2 · 7 · Los videos: sólo el activo, nada antes de estar cerca, sin autoplay con movimiento reducido')

  const reproducen = (reducido: boolean, cerca: boolean, aLaVista: boolean): number =>
    [0, 1, 2].filter((i) => estadoDelVideo(i === 1, cerca, reducido, aLaVista).reproduce).length
  afirmarIgual([reproducen(false, true, true), reproducen(false, true, false), reproducen(false, false, true), reproducen(true, true, true)], [1, 0, 0, 0], 'con la sección cerca y a la vista reproduce UNO (el activo); fuera de cuadro o con la pestaña oculta, ninguno; antes de estar cerca, ninguno; con movimiento reducido, ninguno')
  const p = PROYECTOS[0]
  const activo = marcar(<MedioDeLaTira proyecto={p} activa cerca aLaVista reducido={false} />, { anima: true })
  const inactivo = marcar(<MedioDeLaTira proyecto={p} activa={false} cerca aLaVista reducido={false} />, { anima: true })
  const lejos = marcar(<MedioDeLaTira proyecto={p} activa cerca={false} aLaVista reducido={false} />, { anima: true })
  const quieto = marcar(<MedioDeLaTira proyecto={p} activa cerca aLaVista reducido />, { anima: false })
  afirmar(/<video[^>]*\ssrc="\/portfolio\/el-garage\/escritorio\.mp4"/.test(activo) && /preload="auto"/.test(activo) && /\smuted=""/.test(activo) && /\sloop=""/.test(activo) && /playsInline=""|playsinline=""/.test(activo), 'el activo, cerca: `muted playsInline loop`, con su `src` y `preload="auto"`')
  afirmar(!/\ssrc="/.test(inactivo) && /preload="none"/.test(inactivo) && !/\sposter="/.test(inactivo), 'un inactivo: sin `src`, sin póster y `preload="none"` (no se pide nada)')
  afirmar(!/\ssrc="/.test(lejos) && !/\sposter="/.test(lejos), 'el activo antes de estar cerca: sin `src` ni póster')
  afirmar(/\sposter="\/portfolio\/el-garage\/escritorio\.webp"/.test(quieto) && /preload="none"/.test(quieto) && !/autoplay/i.test(quieto), 'con movimiento reducido: el póster, `preload="none"` y sin `autoplay` (el video no arranca solo)')
  afirmarIgual(veces(activo, 'autoplay'), 0, '  y ningún `autoplay` en el marcado: lo reproduce el efecto, sólo si corresponde')
  controlPositivo('  dos activos a la vez se ven', (i: number) => estadoDelVideo(true, true, false, true).reproduce && i >= 0, (f: (i: number) => boolean) => [0, 1, 2].filter(f).length === 1)

  titulo('B1.2 · 8 · Un solo lienzo: el Portfolio no abre ningún contexto WebGL ([B1.2b] y el «?» 3D se borró)')

  const DE_LA_ESCENA = ['_lib/escena/portfolioEnLaEscena.ts', '_lib/escena/poseDelPortfolio.ts', '_lib/escena/OscurecidoDelPortfolio.tsx'].map((r) => ({ r, t: leer(r) }))
  const CONTEXTO = /<Canvas\b|new THREE\.WebGLRenderer|WebGLRenderer\(|getContext\(\s*['"](webgl|experimental-webgl)/
  afirmar(DE_LA_ESCENA.every(({ t }) => !CONTEXTO.test(t)), 'las piezas del Portfolio en la escena no crean un renderer ni piden un contexto')
  controlPositivo('  un renderer propio se ve', 'const r = new THREE.WebGLRenderer({ alpha: true })', (t: string) => !CONTEXTO.test(t))
  const stage = sinComentarios(leer('_lib/escena/ProbeStage.tsx'))
  afirmar(!existsSync(path.join(V3, '_lib/escena/SignoDeLaTuya.tsx')) && !/SignoDeLaTuya|addAfterEffect/.test(stage), '  el «?» 3D y su pase con scissor se borraron (no se archivan): el «?» de «la tuya» es un SVG en el DOM')
  controlPositivo('  el detector ve el pase montado', `${stage}\n<SignoDeLaTuya />`, (c: string) => !/SignoDeLaTuya|addAfterEffect/.test(c))

  titulo('B1.2c · 9 · Una sola pose, DE FRENTE al plano del logo: la mirada perpendicular, el logo corrido moviendo la cámara (el progreso no se toca)')

  const rig = leer('_lib/escena/OrbitRig.tsx')
  const linea = 'sampleTrack(track, progresoDeLaCamara(progress), target)\n      // [B1]'
  afirmar(rig.replace(/\r\n/g, '\n').includes(linea) && /if \(isChoreo\) mezclarConElPortfolio\(target, Math\.min\(delta, 0\.1\), state\.size\.width \/ Math\.max\(1, state\.size\.height\), fovDeLaBanda\(CAMERA_FOV, state\.size\.width, state\.size\.height\), stats\.current\.logoW, stats\.current\.logoH\)/.test(rig), 'el rig mezcla la pose del Portfolio en el objetivo, justo después de muestrear la del scroll y antes de la inercia, con el cuadro de este momento')
  afirmar(!/mezclarConElPortfolio\([^)]*progress/.test(rig), '  y no le pasa el progreso: la regla de B5 (un desplazamiento, nunca un cambio del progreso)')
  const pin = progresoDePantalla(pantallaDeProgreso(0.5) - SOLAPE_DE_LA_SECCION)
  const enElPin = poseDeLaLectura(progresoDeLaCamara(pin))
  const angulos = CUADROS.map((q) => anguloConElLogo(camaraDelCuadro(q)))
  afirmar(angulos.every((a) => a < 0.01), 'en los cuatro cuadros la cámara mira PERPENDICULAR al plano del logo (la mirada en +z): ni desde arriba ni de costado; el logo se corre en el cuadro moviendo la cámara en un plano paralelo, no girándola', angulos.map((a) => `${a.toFixed(4)}°`).join(' · '))
  const delPin = armarLaCamara(new THREE.PerspectiveCamera(), { ...enElPin }, CUADROS[0].ancho / CUADROS[0].alto, fovDe(CUADROS[0]), LOGO.w, LOGO.h)
  controlPositivo(`  el detector ve la cámara del pin, la base de la pose de B1.2b (de arriba: ${anguloConElLogo(delPin).toFixed(1)}°)`, delPin, (c: THREE.PerspectiveCamera) => anguloConElLogo(c) < 0.01)
  const poses = CUADROS.map((q) => ({ ...poseDelPortfolio(q.ancho / q.alto, fovDe(q), LOGO.w, LOGO.h, huecoDeLaColumna(q.columna)) }))
  const base = (): MutableChoreoPose => ({ angleDeg: 555, height: 4.5, distance: 20, frameX: -0.85, frameY: 0 })
  const cero = base()
  mezclarLaPose(cero, poses[0], 0)
  afirmarIgual(cero, base(), 'con el peso en 0 la pose es la del scroll, bit a bit')
  const uno = base()
  mezclarLaPose(uno, poses[0], 1)
  afirmar(Math.abs((((uno.angleDeg - poses[0].angleDeg) % 360) + 360) % 360) < 1e-9 && Math.abs(uno.distance - poses[0].distance) < 1e-12 && Math.abs(uno.frameX - poses[0].frameX) < 1e-12 && Math.abs(uno.angleDeg - 555) <= 180, 'con el peso en 1, la del Portfolio (el ángulo por el camino corto)')
  let peso = 0
  let t = 0
  while (peso < 1 && t < 5) {
    peso = avanzarElPeso(peso, 1, 1 / 60, false)
    t += 1 / 60
  }
  afirmar(Math.abs(t - PERSECUCION_DEL_PESO_S) < 1 / 30 && avanzarElPeso(0, 1, 1 / 60, true) === 1, `el peso llega en ${PERSECUCION_DEL_PESO_S} s (con el panel), y con movimiento reducido de una`)

  titulo('B1.2c · 9b · Medido: el logo en su hueco, en el eje de la columna (±1 % del ancho), entero y adentro del cuadro')

  const desvio = (q: Cuadro, k: { readonly x0: number; readonly x1: number } | null): number => (k === null ? Infinity : Math.abs((k.x0 + k.x1) / 4 + 0.5 - q.columna / 2))
  // Dos huecos por cuadro: el de la columna (sin medir) y el del bloque (debajo del título y la bajada: la proporción del logo, el ancho
  // de la columna menos su aire hasta el 30 % del alto, y su tope al 55 % del cuadro, como lo deja el bloque centrado en la banda).
  const delBloque = (q: Cuadro): HuecoDelLogo => {
    const ancho = Math.min(q.columna * q.ancho - 64, 0.3 * q.alto * PROPORCION_DEL_LOGO)
    return huecoEnElCuadro({ x: (q.columna * q.ancho) / 2 - ancho / 2, y: 0.55 * q.alto, ancho, alto: ancho / PROPORCION_DEL_LOGO }, q.ancho, q.alto)
  }
  for (const q of CUADROS) {
    for (const [nombre, h] of [['de la columna', huecoDeLaColumna(q.columna)], ['del bloque', delBloque(q)]] as const) {
      const k = cajaPorRayos(armarLaCamara(new THREE.PerspectiveCamera(), { ...poseDelPortfolio(q.ancho / q.alto, fovDe(q), LOGO.w, LOGO.h, h) }, q.ancho / q.alto, fovDe(q), LOGO.w, LOGO.h))
      const margen = 0.012
      const dentro = k !== null && k.x0 > -1 && k.x1 < 2 * q.columna - 1 && k.y0 > -1 && k.y1 < 1 && k.x0 >= h.x - h.ancho / 2 - margen && k.x1 <= h.x + h.ancho / 2 + margen && k.y0 >= h.y - h.alto / 2 - margen && k.y1 <= h.y + h.alto / 2 + margen
      afirmar(desvio(q, k) < 0.01 && dentro, `${String(q.ancho)} × ${String(q.alto)}, el hueco ${nombre}: el centro del logo a ${(desvio(q, k) * 100).toFixed(2)} % del ancho de su eje, entero adentro de su hueco, de la columna y del cuadro`, k === null ? 'sin logo' : `x ${k.x0.toFixed(2)}…${k.x1.toFixed(2)} · y ${k.y0.toFixed(2)}…${k.y1.toFixed(2)}`)
    }
  }
  controlPositivo('  el detector ve el logo de la cámara del pin (sin la pose)', CUADROS[0], (q: Cuadro) => desvio(q, cajaPorRayos(armarLaCamara(new THREE.PerspectiveCamera(), { ...enElPin }, q.ancho / q.alto, fovDe(q), LOGO.w, LOGO.h))) < 0.01)
  const escenario = leer('_secciones/trabajos/portfolio/EscenarioDelPortfolio.tsx')
  const enBloque = (c: string): boolean =>
    /data-pieza="columna-del-portfolio"\s+className="@container absolute inset-y-0 left-0 flex w-1\/2 flex-col items-center justify-center px-8 text-center max-escritorio:w-full max-escritorio:justify-start"/.test(c) &&
    /<EncabezadoDelPortfolio [^>]*\/>\s*<div data-pieza="hueco-del-logo" aria-hidden="true" className="mt-8 shrink-0 max-escritorio:hidden" style=\{ESTILO_DEL_HUECO\} \/>/.test(c)
  afirmar(enBloque(escenario) && /'absolute inset-y-0 right-0 flex w-1\/2 [^']*max-escritorio:w-full max-escritorio:translate-x-0'/.test(escenario) && COLUMNA_DEL_ANCHO.escritorio === 0.5 && COLUMNA_DEL_ANCHO.tablet === 0.4, 'la columna es UN bloque centrado en el alto: «Portfolio», la bajada y debajo el hueco del logo, en el mismo eje (la mitad desde 1024; el panel, la otra mitad; [B1.2d B] debajo de 1024, las historias: la columna a todo el ancho con el título arriba y el panel en su lugar, sin deslizarse)')
  controlPositivo('  el detector ve la columna de B1.2b (el encabezado en la mitad de arriba, el logo en la otra)', escenario.replace('data-pieza="columna-del-portfolio"', 'data-pieza="mitad-del-encabezado"'), enBloque)
  afirmar(Math.abs(PROPORCION_DEL_LOGO - LOGO.w / LOGO.h) < 1e-9 && ESTILO_DEL_HUECO.aspectRatio === PROPORCION_DEL_LOGO.toFixed(4), '  el hueco tiene la proporción del logo medido: lo llena por las dos medidas')

  titulo('B1.2c · 9c · El título 3D en el plano del logo: la misma normal (menos de 3°), en su lugar del DOM y sin perspectiva')

  const fuente = JSON.parse(leer('_fuentes/chivo-400-titulos.json')) as MedidasDeLaFuente
  afirmarIgual(LECTURA.portfolio, { portfolio: true }, 'Portfolio se lee (y se coloca) con la pose del Portfolio')
  const cuadro = CUADROS[0]
  PORTFOLIO_EN_LA_ESCENA.columna = cuadro.columna
  PORTFOLIO_EN_LA_ESCENA.hueco = null
  const lugar = { izquierda: 248, arriba: 190, linea: 113, cuerpo: 101, ancho: cuadro.ancho, alto: cuadro.alto }
  const colocado = (lectura: THREE.PerspectiveCamera): THREE.Group => {
    const g = new THREE.Group()
    colocar(g, lectura, lugar, fuente)
    return g
  }
  const grupo = colocado(camaraDeLaLectura(LECTURA.portfolio, cuadro.ancho / cuadro.alto, LOGO.w, LOGO.h, new THREE.PerspectiveCamera()))
  /** El ángulo (°) entre la normal del título y la del logo (con la vira que se le pida: `rx`, `ry` en grados). */
  const entreNormales = (g: THREE.Object3D, rx = 0, ry = 0): number => {
    const delTitulo = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion)
    const delLogo = NORMAL_DEL_LOGO.clone().applyEuler(new THREE.Euler(THREE.MathUtils.degToRad(rx), THREE.MathUtils.degToRad(ry), 0))
    return THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.abs(delTitulo.dot(delLogo)))))
  }
  const sinVira = entreNormales(grupo)
  const conLaVira = entreNormales(grupo, VIRA_PITCH_DEG, VIRA_YAW_DEG)
  afirmar(sinVira < 3 && conLaVira < 3 && Math.abs(grupo.position.z) < 1e-6, 'el título va EN el plano del logo y con su orientación: el ángulo entre sus normales es menos de 3° (quieto y con la vira del logo en su punta), y a la profundidad del logo', `${sinVira.toFixed(4)}° quieto · ${conLaVira.toFixed(2)}° con la vira · z ${grupo.position.z.toExponential(1)}`)
  controlPositivo('  el detector ve el título de B1.2b (de frente a la cámara del pin, el logo girado)', colocado(delPin), (g: THREE.Group) => entreNormales(g) < 3)
  const proyectar = (c: THREE.PerspectiveCamera, x: number, y: number): THREE.Vector2 => {
    const v = new THREE.Vector3(x, y, 0).applyMatrix4(grupo.matrixWorld).project(c)
    return new THREE.Vector2(((v.x + 1) / 2) * cuadro.ancho, ((1 - v.y) / 2) * cuadro.alto)
  }
  /** La diferencia de alto de las letras entre las dos puntas del título («Portfolio», ~4,6 em). */
  const perspectiva = (c: THREE.PerspectiveCamera): number => {
    const izq = proyectar(c, 0, 0).distanceTo(proyectar(c, 0, 0.7))
    const der = proyectar(c, 4.6, 0).distanceTo(proyectar(c, 4.6, 0.7))
    return Math.abs(izq - der) / Math.max(izq, der)
  }
  const viva = camaraDelCuadro(cuadro)
  const origen = proyectar(viva, 0, 0)
  const apartamiento = Math.hypot(origen.x - lugar.izquierda, origen.y - lineaDeBase(lugar, fuente))
  afirmar(apartamiento < 0.5 && perspectiva(viva) < 0.03, 'con el panel adentro (la cámara ES la pose del Portfolio), el título queda donde el DOM le guarda el lugar y el alto de sus letras no cambia de punta a punta (menos del 3 %)', `apartamiento ${apartamiento.toFixed(3)} px · diferencia de alto ${(perspectiva(viva) * 100).toFixed(2)} %`)
  const conLaDeB12 = armarLaCamara(new THREE.PerspectiveCamera(), { angleDeg: 210, height: 8.5, distance: 24, frameX: -0.9, frameY: -0.9 }, cuadro.ancho / cuadro.alto, fovDe(cuadro), LOGO.w, LOGO.h)
  controlPositivo('  el detector ve la perspectiva de la pose `a` de B1.2 (la cámara girada)', conLaDeB12, (c: THREE.PerspectiveCamera) => perspectiva(c) < 0.03)

  titulo('B1.2 · 10 · El oscurecido: un multiplicador último (la exposición no llega a todas las capas), con el dim constante')

  const capasSinTono = ['_lib/escena/estrellas/Estrellas.tsx', '_lib/escena/amanecer/haces.ts', '_lib/escena/cieloDeDia/CieloDeDia.tsx', '_lib/escena/final/filoConPoder.ts'].filter((r) => /toneMapped: false/.test(leer(r)))
  afirmarIgual(capasSinTono.length, 4, 'la exposición NO llegaría a todas: estrellas, haces, cielo y filo van con `toneMapped: false` (el ajuste B lo pedía verificar)')
  afirmarIgual([DIM_DEL_PORTFOLIO, multiplicadorDelOscurecido(DIM_DEL_PORTFOLIO, 1), multiplicadorDelOscurecido(DIM_DEL_PORTFOLIO, 0), multiplicadorDelOscurecido(2, 1)], [0.35, 1 - 0.35, 1, 0], '[B1.2b] el dim es una constante, 0,35: con el panel adentro el color va por 0,65; afuera, intacto; el dim se acota')
  const osc = DE_LA_ESCENA[2].t
  afirmar(/blending: THREE\.CustomBlending/.test(osc) && /blendSrc: THREE\.ZeroFactor/.test(osc) && /blendDst: THREE\.SrcColorFactor/.test(osc) && /toneMapped: false/.test(osc) && /renderOrder = ORDEN_DEL_OSCURECIDO/.test(osc) && /multiplicadorDelOscurecido\(DIM_DEL_PORTFOLIO, PORTFOLIO_EN_LA_ESCENA\.pesoDelOscurecido\)/.test(osc), '  el cuadro multiplica (`dst × src`), sin tono, último del cuadro principal y con el dim de la constante ([C2-41e] con el peso del oscurecido, que persigue sólo al panel: con Demos a la vista la pose se queda y el oscurecido se va; s84 §11)')
  afirmar(/<OscurecidoDelPortfolio \/>\n[\s\S]*<PaseDeLaEscena \/>\n\s*<\/Suspense>/.test(leer('_lib/escena/ProbeStage.tsx').replace(/\r\n/g, '\n')), '  montado antes del pase compartido, que sigue último (s69)')

  titulo('B1.2b · 11 · Sin banderas: ningún lector, y las constantes valen lo pedido')

  const LECTORES = /portfolio-(dim|paso|panel|lado|camara)/
  const codigo = ['_secciones/trabajos/Trabajos.tsx', '_secciones/trabajos/portfolio/usePortfolio.ts', '_secciones/trabajos/portfolio/EscenarioDelPortfolio.tsx', '_secciones/trabajos/portfolio/Tira.tsx', '_secciones/trabajos/portfolio/Acordeon.tsx', '_lib/escena/portfolioEnLaEscena.ts', '_lib/escena/poseDelPortfolio.ts', '_lib/diagnostico/publicar.ts'].map((r) => sinComentarios(leer(r)))
  afirmar(codigo.every((c) => !LECTORES.test(c) && !/location\.search/.test(c)) && !existsSync(path.join(V3, '_secciones/trabajos/portfolio/banderas.ts')), '`?portfolio-dim`, `-paso`, `-panel`, `-lado` y `-camara` salieron con sus lectores (`banderas.ts` no existe y nadie lee la consulta)')
  controlPositivo('  el detector ve un lector', "const dim = Number.parseFloat(q.get('portfolio-dim') ?? '')", (c: string) => !LECTORES.test(c))
  afirmar(OPACIDAD_DEL_VIDRIO === 0.04 && ESTILO_DEL_VIDRIO.backdropFilter === 'blur(20px) saturate(180%)' && ESTILO_DEL_VIDRIO.borderLeft === '1px solid color-mix(in srgb, var(--color-tinta) 8%, transparent)' && ESTILO_DEL_VIDRIO.background === 'color-mix(in srgb, var(--color-tinta) 4%, transparent)', 'el panel es de vidrio (el del sistema: blanco —la tinta de la sala de noche— al 4 %, desenfoque de 20 px, saturación del 180 %, borde al 8 %)')
  const panel = /'absolute inset-y-0 right-0 [^']*'/.exec(escenario)?.[0] ?? ''
  // [B1.3] Sin fondo propio desde 768: en el teléfono la hoja de la ficha sí lo lleva (`max-tablet:`), sobre el video.
  afirmar(panel !== '' && !/(?<![:\w-])bg-fondo/.test(sinComentarios(leer('_secciones/trabajos/portfolio/Tira.tsx'))) && /style=\{ESTILO_DEL_VIDRIO\}/.test(escenario), '  una sola estructura: el vidrio en el panel (del lado derecho) y las tiras de la tinta sin fondo propio (desde 1024; [B1.2e] debajo, el carrusel no tiene panel)')

  titulo('B1.2b · 12 · El panel entra y sale en horizontal: el gatillo espera al pin')

  const casos: readonly [IndiceDePaso, boolean, IndiceDePaso][] = [[2, false, ANTES_DEL_PIN], [2, true, 2], [0, false, ANTES_DEL_PIN], [EN_LA_COLA, false, EN_LA_COLA], [ANTES_DEL_PIN, true, ANTES_DEL_PIN]]
  afirmarIgual(casos.map(([paso, pegado]) => pasoConElPin(paso, pegado)), casos.map(([, , e]) => e), 'con el escenario suelto (un salto o un scroll rápido que llega antes de que el pin se asiente) el panel no entra; pegado, sí; la cola queda')
  controlPositivo('  sin la compuerta el panel entra con el escenario suelto', (paso: IndiceDePaso) => paso, (f: (paso: IndiceDePaso) => IndiceDePaso) => f(2) === ANTES_DEL_PIN)
  // [B1.2c] Lo que mide el DOM salió a `medida.ts` (la regla de las 300 líneas): se leen los dos.
  const usePortfolio = `${leer('_secciones/trabajos/portfolio/usePortfolio.ts')}\n${leer('_secciones/trabajos/portfolio/medida.ts')}\n${leer('_secciones/trabajos/portfolio/useAnclaDeLaCarga.ts')}`
  afirmar(/const mostrable = pasoConElPin\(siguiente, pegado\(caja\)\)/.test(usePortfolio) && /Math\.abs\(escenario\.getBoundingClientRect\(\)\.top\) <= 1/.test(usePortfolio), '  la sección publica el paso con la compuerta del pin, medido en el escenario (su tope en el del cuadro)')
  afirmar(/transition-transform duration-700/.test(panel) && /'translate-x-full'/.test(escenario) && !/translate-y|inset-y-[1-9]/.test(panel) && /className="sticky top-0 h-svh w-full overflow-clip"/.test(escenario), '  el panel sólo se traslada en x (`translate-x-full` ↔ 0), adentro del escenario pegado: el tope de su caja no se mueve')
  const elCorte = (c: string): boolean =>
    /if \(ahora\) \{\s*panel\.style\.removeProperty\('transition'\)\s*panel\.style\.removeProperty\('translate'\)\s*\} else \{\s*panel\.style\.setProperty\('transition', 'none'\)\s*panel\.style\.setProperty\('translate', '100% 0'\)/.test(c) &&
    /const alMoverse = \(\): void => \{\s*cortar\(\)\s*pedir\(\)\s*\}/.test(c) && /window\.addEventListener\('scroll', alMoverse, \{ passive: true \}\)/.test(c) && /soltar: de\.on\('scroll', cortar\)/.test(c)
  afirmar(elCorte(usePortfolio), '  y existe sólo pegado: despegado, afuera y sin transición, en el MISMO cuadro en que se mueve el scroll (sincrónico con el `scroll` nativo y con el de Lenis). El banco: con la rueda, la salida subía 1858 px; con el corte en un render, un cuadro tarde, 38 px')
  controlPositivo('  el detector ve el corte un cuadro tarde (sólo en la lectura por cuadro)', usePortfolio.replace(/const alMoverse = \(\): void => \{\s*cortar\(\)\s*pedir\(\)\s*\}/, 'const alMoverse = pedir'), elCorte)
  // El arnés lo mide en el sitio (`scripts-carga/estres.ts`, al final de cada tanda): la caja, cuadro a cuadro, con la rueda, la barra,
  // el menú y un ancla. La cuenta es ésta: entrando (hacia la izquierda, a mitad de camino), el tope a ±1 px del de su primer cuadro.
  const viaje = (tope: (k: number) => number): MuestraDelPanel[] => Array.from({ length: 30 }, (_, k) => ({ top: tope(k), left: 1440 - Math.min(720, k * 30), ancho: 720, vista: 1440 }))
  const enX = tramosDelPanel(viaje(() => 0))
  afirmar(enHorizontal(enX.entrada) && enX.entrada.cuadros === 23 && enX.salida.cuadros === 0 && TOLERANCIA_DEL_TOPE_PX === 1, '  el arnés: con scroll rápido, la caja del panel durante la entrada mantiene el tope (±1 px), cuadro a cuadro', `${String(enX.entrada.cuadros)} cuadros entrando`)
  controlPositivo('  la cuenta ve una entrada que viaja con la página (el escenario suelto)', viaje((k) => 400 - k * 40), (m: MuestraDelPanel[]) => enHorizontal(tramosDelPanel(m).entrada))
  controlPositivo('  y la ve aunque se corra apenas 2 px', viaje((k) => (k > 10 ? 2 : 0)), (m: MuestraDelPanel[]) => enHorizontal(tramosDelPanel(m).entrada))
  // La salida: el escenario se despega en el cuadro 8 y sube 100 px por cuadro. Con la compuerta el panel se va de una (en el cuadro 8
  // ya está afuera); sin ella, sigue a mitad de camino y sube con el escenario.
  const saliendo = (seVaDeUna: boolean): MuestraDelPanel[] => Array.from({ length: 30 }, (_, k) => ({ top: k < 8 ? 0 : -(k - 7) * 100, left: seVaDeUna && k >= 8 ? 1440 : 720 + Math.min(720, k * 30), ancho: 720, vista: 1440 }))
  const salidaBien = (m: MuestraDelPanel[]): boolean => {
    const { salida } = tramosDelPanel(m)
    return salida.cuadros === 0 || enHorizontal(salida)
  }
  afirmar(salidaBien(saliendo(true)) && tramosDelPanel(saliendo(true)).salida.cuadros === 7, '  y en la salida: o ningún cuadro a mitad de camino, o el tope quieto (con la compuerta, el panel se va de una al despegarse)')
  controlPositivo('  la cuenta ve la salida que sube con el escenario', saliendo(false), salidaBien)
  const estres = leer('../../../scripts-carga/estres.ts')
  afirmar(/const ok = enHorizontal\(entrada\) && \(salida\.cuadros === 0 \|\| enHorizontal\(salida\)\)/.test(estres) && /METODOS_DEL_PANEL = \['rueda', 'barra', 'menu', 'ancla'\] as const/.test(estres) && /if \(PANEL !== 'no' &&/.test(estres), '  y el arnés la corre al final de cada tanda, de las cuatro maneras, con la entrada y la salida')

  titulo('B1.2b · 13 · La secuencia de una tira: un gatillo, por tiempo')

  afirmar(demoraDe(0) === 0 && demoraDe(1) === SECUENCIA.fichaTrasS && Math.abs(demoraDe(3) - demoraDe(2) - SECUENCIA.escalonS) < 1e-12 && SECUENCIA.fichaTrasS >= 0.3 && SECUENCIA.fichaTrasS <= 0.5, `primero el video y el nombre; a los ${String(SECUENCIA.fichaTrasS * 1000)} ms la ficha, escalonada de a ${String(SECUENCIA.escalonS * 1000)} ms`)
  const entra = enLaSecuencia(true, 2, false)
  const seVa = enLaSecuencia(false, 2, false)
  const quieta = enLaSecuencia(true, 2, true)
  afirmar(entra.animate.opacity === 1 && seVa.animate.opacity === 0 && quieta.transition.duration === 0 && entra.initial === false, '  por tiempo (Motion), apagada fuera de su tira y de una con movimiento reducido')
  const tira = sinComentarios(leer('_secciones/trabajos/portfolio/Tira.tsx'))
  const acordeonDeLaSecuencia = sinComentarios(leer('_secciones/trabajos/portfolio/Acordeon.tsx'))
  afirmar(!/vista === 'ficha'|VistaDelPaso|portada/.test(tira) && /const visibleLa = \(i: number\): boolean => vivo\.panel && muestraSuContenido\(transicion, i\)/.test(acordeonDeLaSecuencia), '  sin portada ni ficha: la tira activa muestra siempre el video y la ficha, y la secuencia arranca con su tira (o con el panel entrando; [B1.2c] después de la salida de la anterior y del respiro; [B1.2d] `vivo.panel`, la pieza del orden)')

  titulo('B1.2b · 14 · El hover instantáneo y sus guardas; el teclado; el sonido')

  const acordeon = sinComentarios(leer('_secciones/trabajos/portfolio/Acordeon.tsx'))
  afirmar(/flushSync\(\(\) => vivo\.saltarAlPaso\(indice, true\)\)/.test(acordeon) && !/setTimeout/.test(acordeon) && /onPointerOver=\{alPasar\}/.test(acordeon) && CONSULTA_DEL_PUNTERO_FINO === '(hover: hover) and (pointer: fine)', 'el hover activa el proyecto en el mismo cuadro (`flushSync`, sin los 150 ms de antes) y [B1.2c] el scroll se acomoda en silencio (inmediato), sólo con puntero fino')
  controlPositivo('  el detector ve la espera de antes', `${acordeon}\nhover.current = window.setTimeout(() => vivo.saltarAlPaso(i), 150)`, (c: string) => !/setTimeout/.test(c))
  afirmar(!seMovioDeVerdad({ x: 100, y: 100 }, 102, 101) && seMovioDeVerdad({ x: 100, y: 100 }, 104, 100) && seMovioDeVerdad(null, 0, 0) && HOVER.movimientoMinimoPx === 4, 'después de una activación, un lomo que se reacomoda debajo del puntero no activa nada hasta que el puntero se mueve 4 px o más')
  controlPositivo('  sin la guarda, el reacomodo activa', (d: { readonly x: number; readonly y: number } | null, x: number, y: number) => d === null || x !== -1 || y !== -1, (f: (d: { readonly x: number; readonly y: number } | null, x: number, y: number) => boolean) => !f({ x: 100, y: 100 }, 101, 100))
  afirmar(/activacion\.current = puntero\.current/.test(acordeon) && /activaElHover\(\{ x: e\.clientX, y: e\.clientY, indice, fino, mueve \}, tira, fase === 'adentro', activacion\.current, vivo\.inerteDesde\(e\.clientX, e\.clientY\), deLaRueda\)/.test(acordeon), '  la guarda vale para cualquier cambio de tira (el hover, el clic, el teclado o el scroll): el puntero de ese momento ([B1.2c] y el de la rueda, `activaElHover`; [B1.2d] y la transición de la rueda, A3)')
  afirmar(suenaElCambio(0, HOVER.rafagaMs) && !suenaElCambio(0, HOVER.rafagaMs - 1) && /if \(cambio && suenaElCambio\(a\.cuando, ahora\)\) sonar\('tic'\)/.test(acordeon) && !/pestillo/.test(acordeon), 'cruzando varios lomos gana el último y suena un solo `tic` (un cambio a menos de 250 ms del anterior no suena); `pestillo` salió de la secuencia')
  const estado = sinComentarios(leer('_secciones/trabajos/portfolio/estado.ts'))
  afirmar(/case 'ArrowLeft':/.test(estado) && /case 'ArrowRight':/.test(estado) && !/ArrowUp|ArrowDown/.test(estado), '  ←/→ cambian de proyecto (↑/↓ quedan para la página)')

  titulo('B1.2b · 15 · Las marcas de agua y «la tuya»')

  afirmar(OPACIDAD_DE_LA_MARCA >= 0.06 && OPACIDAD_DE_LA_MARCA <= 0.1, `las cuatro con el mismo tratamiento: monocromas (la tinta) y al ${String(OPACIDAD_DE_LA_MARCA * 100)} %`)
  const conAlfa = (b: Buffer): boolean => b.length > 26 && b.toString('latin1', 1, 4) === 'PNG' && b[25] === 6
  // Un SVG de silueta: sólo contornos (la máscara toma su forma), sin una imagen incrustada que traiga el fondo, sin guiones ni enlaces.
  const deSilueta = (s: string): boolean => /^<svg [^>]*viewBox="[\d. ]+"/.test(s) && /<path [^>]*d="M/.test(s) && [...s.matchAll(/<([a-zA-Z]+)/g)].every((m) => m[1] === 'svg' || m[1] === 'path') && !/href|script|base64/i.test(s)
  const logos = PROYECTOS.map((q) => {
    if (q.logo === null) return `${q.slug}: el nombre`
    const ruta = path.join(process.cwd(), 'public', q.logo)
    if (q.logo.endsWith('.svg')) return deSilueta(existsSync(ruta) ? readFileSync(ruta, 'utf8') : '') ? `${q.slug}: SVG de silueta` : `${q.slug}: falta o no es una silueta`
    return conAlfa(existsSync(ruta) ? readFileSync(ruta) : Buffer.alloc(0)) ? `${q.slug}: PNG con alfa` : `${q.slug}: falta o sin alfa`
  })
  afirmarIgual(logos, ['el-garage: PNG con alfa', 'esquina-estudio: PNG con alfa', 'banu-scents: SVG de silueta'], 'los logos bajados de los sitios (sin fondo: PNG con canal alfa) y el de Banú, el que pasó Valentino, recortado y vectorizado (sólo las letras: un SVG de contornos)')
  controlPositivo('  el lector ve un PNG sin alfa', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 2, 0]), conAlfa)
  controlPositivo('  y un SVG que incrusta la imagen con su fondo', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 669 183"><image href="data:image/png;base64,iVBOR" width="669" height="183"/><path d="M0 0H1Z"/></svg>', deSilueta)
  const numeros = (d: string): number[] => [...d.matchAll(/-?\d+(\.\d+)?/g)].map((m) => Number(m[0]))
  const n = numeros(CONTORNO_DEL_SIGNO)
  const punto = numeros(PUNTO_DEL_SIGNO)
  afirmar(n[2] - n[9] === 104 && n[16] - n[18] === 104 && punto[2] - punto[0] === 104, 'el «?»: la cinta del logo, de ancho constante (104 = 252 − 148 en el gancho, el palo y el punto), con su relleno, su filo y su sombra corrida', `radios ${String(n[2])} y ${String(n[9])}`)
  const anchoDeProxima = (cuerpo: number): number => 3.95 * cuerpo
  afirmar(NIVEL_DEL_TITULO_DE_LA_TUYA === 'titulo-xl' && anchoDeProxima(28.96 + 0.018779 * 1024) <= 280 && anchoDeProxima(28.96 + 0.018779 * 1440) <= 488 && anchoDeProxima(53.97 + 0.034742 * 1024) > 280, 'el título de «la tuya», el más grande de los titulares que entra sin cortar «próxima» a 1024 y a 1440 (`display-xl` la parte a 1024)')
  const laTuya = sinComentarios(leer('_secciones/trabajos/portfolio/LaTuya.tsx'))
  afirmar(/<FormularioDeLaTuya visible=\{visible\} reducido=\{vivo\.reducido\} desde=\{2\} \/>/.test(laTuya) && !/data-abre-contacto/.test(laTuya), '  y [B1.2c] en lugar del CTA, el formulario corto (B1.2c · 23)')
  const expresion = (s: string): string => s.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim()
  const despejeDeLasAnclas = expresion(/html:has\(\[data-v3\]\) \{\s*scroll-padding-top: (calc\([\s\S]*?\));\s*\}/.exec(leer('_estilos/navegacion.css'))?.[1] ?? '?')
  const despejaLaBarra = (e: string): boolean => despejeDeLasAnclas.startsWith('calc(var(--spacing-6)') && expresion(e) === despejeDeLasAnclas
  afirmar(despejaLaBarra(DESPEJE_DE_LA_BARRA) && /style=\{activa \? \{ paddingTop: DESPEJE_DE_LA_BARRA, paddingBottom: DESPEJE_DE_LA_BARRA \} : undefined\}/.test(laTuya), '  el título no queda debajo de la barra: la tira activa deja libre lo que ocupa la barra en reposo, con la misma expresión que el despeje de las anclas (el banco: a 1024 la pastilla lo tapaba, 2,1:1)', despejeDeLasAnclas)
  controlPositivo('  el detector ve un despeje que se separó del de las anclas', 'calc(var(--spacing-6) + var(--spacing-2) * 2 + var(--text-cuerpo) * var(--leading-texto))', despejaLaBarra)

  titulo('B1.2b · 17 · Demos en tablet: llega como en escritorio y su título no asoma durante el Portfolio')

  // El banco (820 × 1180, paso 1): sin la capa rígida, el título DOM de Demos (su P2 nace corrido sólo el 60 %) asomaba cortado
  // durante todo el Portfolio. Fuera de la capa rígida su ventana entra también en opacidad, con su progreso.
  const capaDeDemos = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
  const tituloQueNoAsoma = (c: string): boolean =>
    /titulo\.current = capa\.current\?\.querySelector<HTMLElement>\('#demos > div:first-child'\)/.test(c) &&
    /progresoDelTitulo\.set\(enElTramo\(l, LLEGADA\.titulo\)\)\s*titulo\.current\?\.style\.setProperty\('opacity', progresoDelTitulo\.get\(\)\.toFixed\(3\)\)/.test(c) &&
    /parrafo\.current\?\.style\.setProperty\('opacity', '1'\)\s*titulo\.current\?\.style\.removeProperty\('opacity'\)/.test(c)
  afirmar(tituloQueNoAsoma(capaDeDemos) && /className="block overflow-hidden py-2 -my-2"|VENTANA_QUE_RECORTA = 'block overflow-hidden py-2 -my-2'/.test(leer('_secciones/_contrato/canales.tsx')), 'el título DOM de Demos entra con su progreso también en opacidad (en 0, no asoma); con la capa rígida (abajo de 768) la escala de la capa lo esconde y la opacidad se suelta')
  controlPositivo('  el detector ve el título que asoma (sólo el P2)', capaDeDemos.replace(/\s*titulo\.current\?\.style\.setProperty\('opacity', progresoDelTitulo\.get\(\)\.toFixed\(3\)\)/, ''), tituloQueNoAsoma)

  titulo('B1.2b · 18 · Lo que encontró el arnés de carga')

  // Con la pestaña oculta al cargar, «Portfolio» se imprimía con la x de las letras de la métrica de respaldo y el relevo del DOM las
  // corría sin una tanda de fuentes nueva que lo rehiciera (0,121 em en 18 de 26 corridas). El guardián verifica una vez cada armado.
  const sincronia = sinComentarios(leer('_lib/escena/titulos3d/sincronia.ts'))
  const verificaLasLetras = (c: string): boolean =>
    /verificarLasLetras\(v, ahora\)/.test(c) && /if \(VERIFICADOS\.has\(a\) \|\| !tituloListo\(a\.titulo\.id\)\) continue/.test(c) &&
    /if \(ahora - desde < VERIFICACION\.esperaMs\) continue/.test(c) && /if \(REARMADOS_POR_LAS_LETRAS\.has\(a\.titulo\.id\) \|\| !corridas\(a\)\) continue/.test(c) &&
    /MOSTRADO_DE_LOS_REARMADOS\.set\(a\.titulo\.id, \{ \.\.\.a\.mostrado \}\)\s*soltarElArmado\(v\.t, v\.armados, a\)\s*pedirOtraSincronia\(\)/.test(c)
  afirmar(verificaLasLetras(sincronia) && VERIFICACION.esperaMs >= 300, 'un título impreso con las letras de otro momento (el DOM cambió sin una tanda de fuentes nueva) se vuelve a armar, una vez por armado ya relevado y a lo sumo una vez por título y por carga')
  controlPositivo('  el detector ve el guardián sin la verificación', sincronia.replace(/\s*verificarLasLetras\(v, ahora\)/, ''), verificaLasLetras)
  // Cargar con el ancla de un proyecto y hacer clic en el menú: la marca del ancla quedaba y el diagnóstico la daba por desfasada.
  const conElClic = (c: string): boolean => /const gestos = \['wheel', 'touchstart', 'keydown', 'pointerdown'\] as const/.test(c)
  afirmar(conElClic(sinComentarios(usePortfolio)), '  la marca del ancla con que cargó la página se suelta también con un clic (el menú lleva a otra sección)')
  controlPositivo('  el detector ve la marca que sólo soltaban la rueda, el tacto y el teclado', usePortfolio.replace(", 'pointerdown'", ''), (c: string) => conElClic(sinComentarios(c)))

  titulo('B1.2b · 16 · El título entra en su lugar y se va cayendo')

  const encabezado = sinComentarios(leer('_secciones/trabajos/portfolio/EncabezadoDelPortfolio.tsx'))
  afirmar(/animate\(presencia, adentro \? 1 : 0/.test(encabezado) && /llegada=\{progresoDeLaMascara === null \? null : presencia\}/.test(encabezado) && /saleCayendo queda/.test(encabezado), 'la presencia del encabezado va por tiempo con el panel adentro (ya pegado: no viaja con la sección) y el título sale cayendo')
  const titulos = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
  afirmar(/if \(m\.llegada >= 1\) a\.cayendo = true/.test(titulos) && /else if \(m\.llegada <= 0\) a\.cayendo = false/.test(titulos) && /a\.uniforms\.uLevanta\.value = a\.cayendo \|\| a\.titulo\.gesto === 'levanta' \? 1 : 0/.test(titulos), '  llegado entero, lo que baja es la caída de `levanta` (se acuesta y su línea lo tapa); de vuelta en 0, su próxima llegada es la de siempre')
}
