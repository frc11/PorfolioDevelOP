/**
 * [B1] s76 · B1.2 — EL SELECTOR VIVO, sin navegador: los videos (sólo el activo, nada antes de estar cerca, sin autoplay con
 * movimiento reducido), el Portfolio sin contextos WebGL propios, la pose del logo (un desplazamiento sobre la del scroll: el progreso
 * no se toca), el oscurecido (un multiplicador último, y el «?» después), el hover con intención, los sonidos y las banderas.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { marcar } from '../../_secciones/_invariantes/render'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { BANDERAS_POR_DEFECTO, DIM_POR_DEFECTO, banderasDe } from '../../_secciones/trabajos/portfolio/banderas'
import { CONSULTA_DEL_PUNTERO_FINO, INTENCION_DEL_HOVER_MS } from '../../_secciones/trabajos/portfolio/estado'
import { MedioDeLaTira, estadoDelVideo } from '../../_secciones/trabajos/portfolio/MedioDeLaTira'
import {
  PERSECUCION_DEL_PESO_S, POSES_DEL_PORTFOLIO, POSE_VERTICAL, avanzarElPeso, mezclarLaPose, multiplicadorDelOscurecido, poseParaElAspecto, type PoseDelPortfolio,
} from '../escena/portfolioEnLaEscena'
import type { MutableChoreoPose } from '../escena/choreographyTypes'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8')
const veces = (h: string, a: string): number => h.split(a).length - 1

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

  titulo('B1.2 · 8 · Un solo lienzo: el Portfolio no abre ningún contexto WebGL')

  const DE_LA_ESCENA = ['_lib/escena/portfolioEnLaEscena.ts', '_lib/escena/OscurecidoDelPortfolio.tsx', '_lib/escena/SignoDeLaTuya.tsx'].map((r) => ({ r, t: leer(r) }))
  const CONTEXTO = /<Canvas\b|new THREE\.WebGLRenderer|WebGLRenderer\(|getContext\(\s*['"](webgl|experimental-webgl)/
  afirmar(DE_LA_ESCENA.every(({ t }) => !CONTEXTO.test(t)), 'las tres piezas del Portfolio en la escena no crean un renderer ni piden un contexto')
  const signo = DE_LA_ESCENA[2].t
  afirmar(/const gl = useThree\(\(s\) => s\.gl\)/.test(signo) && /addAfterEffect\(/.test(signo) && /gl\.setScissorTest\(true\)/.test(signo), '  el «?» usa el renderer de la escena (`useThree`), después del render (`addAfterEffect`), con scissor')
  controlPositivo('  un renderer propio se ve', 'const r = new THREE.WebGLRenderer({ alpha: true })', (t: string) => !CONTEXTO.test(t))

  titulo('B1.2 · 9 · La pose del logo: un desplazamiento sobre la del scroll (el progreso no se toca)')

  const rig = leer('_lib/escena/OrbitRig.tsx')
  const linea = 'sampleTrack(track, progresoDeLaCamara(progress), target)\n      // [B1]'
  afirmar(rig.replace(/\r\n/g, '\n').includes(linea) && /if \(isChoreo\) mezclarConElPortfolio\(target, Math\.min\(delta, 0\.1\), state\.size\.width \/ Math\.max\(1, state\.size\.height\)\)/.test(rig), 'el rig mezcla la pose del Portfolio en el objetivo, justo después de muestrear la del scroll y antes de la inercia')
  afirmar(!/mezclarConElPortfolio\([^)]*progress/.test(rig), '  y no le pasa el progreso: la regla de B5 (un desplazamiento, nunca un cambio del progreso)')
  const base = (): MutableChoreoPose => ({ angleDeg: 555, height: 4.5, distance: 20, frameX: -0.85, frameY: 0 })
  const cero = base()
  mezclarLaPose(cero, POSES_DEL_PORTFOLIO.a, 0, 'der')
  afirmarIgual(cero, base(), 'con el peso en 0 la pose es la del scroll, bit a bit')
  const uno = base()
  mezclarLaPose(uno, POSES_DEL_PORTFOLIO.a, 1, 'der')
  const igual = (a: PoseDelPortfolio, b: PoseDelPortfolio): boolean => Math.abs(((a.angleDeg - b.angleDeg) % 360 + 360) % 360) < 1e-9 && Math.abs(a.height - b.height) < 1e-12 && Math.abs(a.distance - b.distance) < 1e-12 && Math.abs(a.frameX - b.frameX) < 1e-12 && Math.abs(a.frameY - b.frameY) < 1e-12
  afirmar(igual(uno, POSES_DEL_PORTFOLIO.a) && Math.abs(uno.angleDeg - 555) <= 180, 'con el peso en 1, la del Portfolio (el ángulo por el camino corto: el acumulado de la vuelta no da una vuelta de más)')
  const izq = base()
  mezclarLaPose(izq, POSES_DEL_PORTFOLIO.a, 1, 'izq')
  afirmar(Math.abs(izq.frameX + POSES_DEL_PORTFOLIO.a.frameX) < 1e-12, '  `?portfolio-lado=izq` espeja el encuadre horizontal')
  afirmar(poseParaElAspecto('a', 1.6) === POSES_DEL_PORTFOLIO.a && poseParaElAspecto('b', 0.7) === POSE_VERTICAL, '  apaisado, la de la variante; vertical (la tablet parada), la vertical')
  let peso = 0
  let t = 0
  while (peso < 1 && t < 5) {
    peso = avanzarElPeso(peso, 1, 1 / 60, false)
    t += 1 / 60
  }
  afirmar(Math.abs(t - PERSECUCION_DEL_PESO_S) < 1 / 30 && avanzarElPeso(0, 1, 1 / 60, true) === 1, `el peso llega en ${PERSECUCION_DEL_PESO_S} s (con el panel), y con movimiento reducido de una`)
  controlPositivo('  una mezcla que no espeja se ve', (o: MutableChoreoPose) => mezclarLaPose(o, POSES_DEL_PORTFOLIO.a, 1, 'der'), (f: (o: MutableChoreoPose) => void) => {
    const o = base()
    f(o)
    return Math.abs(o.frameX + POSES_DEL_PORTFOLIO.a.frameX) < 1e-12
  })

  titulo('B1.2 · 10 · El oscurecido: un multiplicador último (la exposición no llega a todas las capas), y el «?» después')

  const capasSinTono = ['_lib/escena/estrellas/Estrellas.tsx', '_lib/escena/amanecer/haces.ts', '_lib/escena/cieloDeDia/CieloDeDia.tsx', '_lib/escena/final/filoConPoder.ts'].filter((r) => /toneMapped: false/.test(leer(r)))
  afirmarIgual(capasSinTono.length, 4, 'la exposición NO llegaría a todas: estrellas, haces, cielo y filo van con `toneMapped: false` (el ajuste B lo pedía verificar)')
  afirmarIgual([multiplicadorDelOscurecido(DIM_POR_DEFECTO, 1), multiplicadorDelOscurecido(DIM_POR_DEFECTO, 0), multiplicadorDelOscurecido(2, 1)], [1 - DIM_POR_DEFECTO, 1, 0], `con el panel adentro el color va por ${1 - DIM_POR_DEFECTO}; afuera, intacto; el dim se acota`)
  const osc = DE_LA_ESCENA[1].t
  afirmar(/blending: THREE\.CustomBlending/.test(osc) && /blendSrc: THREE\.ZeroFactor/.test(osc) && /blendDst: THREE\.SrcColorFactor/.test(osc) && /toneMapped: false/.test(osc) && /renderOrder = ORDEN_DEL_OSCURECIDO/.test(osc), '  el cuadro multiplica (`dst × src`), sin tono y último del cuadro principal')
  const stage = leer('_lib/escena/ProbeStage.tsx').replace(/\r\n/g, '\n')
  afirmar(/<OscurecidoDelPortfolio \/>\n\s*<SignoDeLaTuya \/>\n[\s\S]*<PaseDeLaEscena \/>\n\s*<\/Suspense>/.test(stage), '  montados antes del pase compartido, que sigue último (s69)')

  titulo('B1.2 · 11 · El hover, los sonidos y las banderas')

  const acordeon = leer('_secciones/trabajos/portfolio/Acordeon.tsx')
  afirmar(INTENCION_DEL_HOVER_MS === 150 && CONSULTA_DEL_PUNTERO_FINO === '(hover: hover) and (pointer: fine)' && /window\.matchMedia\(CONSULTA_DEL_PUNTERO_FINO\)\.matches/.test(acordeon), 'el hover con intención: 150 ms, sólo con un puntero fino (en táctil, el clic)')
  afirmar(/sonar\('tic'\)/.test(acordeon) && /sonar\('pestillo'\)/.test(acordeon) && /fase === 'adentro' && a\.fase === 'adentro'/.test(acordeon), '`tic` al cambiar de proyecto y `pestillo` al abrir la ficha, sólo con el panel adentro (y no al cargar); el bus respeta el mute')
  afirmarIgual(banderasDe(''), BANDERAS_POR_DEFECTO, 'sin banderas: lado derecho, panel «tinta», el dim por defecto, el paso de 0,75 y la cámara a')
  afirmarIgual(banderasDe('?portfolio-lado=izq&portfolio-panel=vidrio&portfolio-dim=0.6&portfolio-paso=0.6&portfolio-camara=c'), { lado: 'izq', material: 'vidrio', dim: 0.6, paso: 0.6, camara: 'c' }, '  con todas puestas')
  afirmarIgual([banderasDe('?portfolio-dim=2').dim, banderasDe('?portfolio-dim=x').dim, banderasDe('?portfolio-paso=0.5').paso, banderasDe('?portfolio-camara=z').camara], [0.8, DIM_POR_DEFECTO, 0.75, 'a'], '  y lo que no se reconoce cae al default (el dim se acota a 0,8)')
}
