/**
 * RETOQUE DEL ENCASTRE — el invariante: npm run test:s51-retoque-encastre
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1A · sin partículas: el vapor se fue entero (se abre el hueco y el logo encaja).
 *   1B · el hueco del tono del piso, un poco más sombreado adentro (no negro); el labio, apenas, y se va al quedar al ras.
 *   1C · sin línea blanca: el piso pisa el borde del logo y queda un pelo debajo de su cara al ras (sin rendija).
 *   1D · la cinemática automática con rebobinado: sin cola; al fondo arranca cuando el pie llegó entero y corre a una
 *        velocidad (el scroll hacia abajo no la acelera); un gesto hacia arriba retenido la rebobina mientras siga y al
 *        soltar retoma; rebobinada del todo espera, y el siguiente gesto mueve la página; los viajes del menú salen.
 *   1E · el brillo bajo el mouse es LUZ que nace abajo: línea y halo en las juntas (más en las rendijas abiertas), un núcleo
 *        bajo el mouse, la tapa sombreada para el contraste; sin dientes (un píxel como mínimo) ni bandas.
 *   1F · después del encastre el piso entero queda energizado: las rendijas que abren las ondas, el mar y el pulso dejan
 *        salir la misma luz, más tenue, por junta (sin parches ni anillos grises), fuera del mar calmo del logo.
 *   1G · el pie no recibe la luz de la cinemática: su normal y su vista giran con la cámara del final (la luz y los
 *        reflejos, como antes de la cinemática, en cualquier pose).
 *   2A · los nanobots se desarman donde se VE el cursor de la sala (su halo, interpolado), no en el puntero nativo.
 *   2B · el pie llega y se va bastante más rápido (1,4 s de punta a punta; eran 3,2), con el escalonado por columnas.
 *   2C · los viajes del menú sin freno: durante el viaje el scroll se ignora y termina siempre en su destino.
 *   2D · cada destino del menú (Quiénes somos, Portfolio, Servicios, Panel, Por qué develOP; Contacto abre la hoja) cae
 *        en su punto de lectura, con su llegada completa (y la llegada aislada de Portfolio y de la frase, entera).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-encastre/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { ANCLAS_DEL_HUECO, CALMA_EN_EL_PISO, RASTRO_EN_EL_PISO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { pasoDelRastro, rastroQuieto } from '../escena/final/rastro'
import { ANCLAS_DEL_DIBUJO } from '../escena/piso/ondaDirigida'
import { HUECO, crearElPozo, trazoDelBorde } from '../escena/final/hueco'
import { REBOBINADO, RELOJ_DEL_FINAL, camaraDelFinal, decidirElGesto, pasoDelReloj, poseDelLogo, relojQuieto, type EntradaDelReloj, type FaseDelFinal, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { LUZ_DEL_PIE, giroDeLaLuzDelPie, materialDelPie } from '../escena/pie3d/material'
import { TRAMOS_DEL_PIE, avanceDelPie } from '../escena/pie3d/coreografia'
import { pasoDelPuntero, punteroQuieto, type ObjetivoDelPuntero, type PunteroDelEnjambre } from '../nanobots/puntero'
import { sentidoDeLaRueda, sentidoDeLaTecla, sentidoDelDedo } from '../gestosDelScroll'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { FLOOR_Y, PAPER_COLOR, PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../escena/probeScene'
import { BarraDelHome } from '../../_chrome/barra/BarraDelHome'
import { ABRE_EL_PANEL } from '../../_chrome/contacto/apertura'
import { Menu } from '../../_chrome/menu/MenuMovil'
import { DESTINOS_CON_NUDO, destinoDelViaje } from '../../_componentes/destinosDelViaje'
import { ANCLA_DE_LA_MASCARA, ANCLA_DE_LA_VENTANA_VISIBLE, ANCLA_DEL_TRAZO } from '../../_secciones/_contrato/bloqueAnimado'
import { MARCA_COREOGRAFIA_DEL_HOME } from '../../_secciones/_contrato/marcaCoreografia'
import { VENTANA_DE_LA_SUBIDA_DE_LA_FRASE } from '../../_secciones/por-que-develop/geometria'
import { posicionDeAncla } from '../motion/anclas'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { NodoFalso, VENTANA, conDomFalso } from './s27-dom-falso'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1A · Sin partículas: el vapor se fue entero (subida, caída y posado); se abre el hueco y el logo encaja')

const FINAL = '_lib/escena/final'
const delFinal = readdirSync(`${V3}/${FINAL}`).filter((a) => /\.tsx?$/.test(a))
const fuentesDelFinal = delFinal.map((a) => sinComentarios(leer(`${FINAL}/${a}`)))
const componenteDelFinal = sinComentarios(leer(`${FINAL}/FinalDelPie.tsx`))
const sinParticulas = (fuentes: readonly string[], componente: string): boolean =>
  !existsSync(`${V3}/${FINAL}/vapor.ts`) && !existsSync(`${V3}/${FINAL}/explosion.ts`) && fuentes.every((f) => !/THREE\.Points|PointsMaterial|\bvapor\b/i.test(f)) && componente.includes('g.add(estado.pozo.grupo)')
afirmar(sinParticulas(fuentesDelFinal, componenteDelFinal), 'en el final no hay partículas: ningún `Points` en `final/`, sin `vapor.ts` (ni la explosión de CIERRE); al grupo del final sólo se le suma el pozo', `${String(delFinal.length)} archivos en final/`)
controlPositivo('el detector VE el vapor de EL ENCASTRE (sus puntos en el grupo del final)', [fuentesDelFinal, componenteDelFinal.replace('g.add(estado.pozo.grupo)', 'g.add(estado.vapor.puntos, estado.pozo.grupo)')] as const, ([f, c]: readonly [readonly string[], string]) => sinParticulas([...f, c], c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1B · El hueco del tono del piso, un poco más sombreado adentro (no negro); el labio, apenas, y se va al quedar al ras')

const TAM = { alto: 4.78, espesor: 0.56 } as const
const cuadrado = new THREE.Shape([new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1), new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1)])
const pozo = crearElPozo([cuadrado], TAM.espesor)
const [paredes, fondo] = pozo.grupo.children as THREE.Mesh[]
const colorDe = (m: THREE.Material | THREE.Material[]): THREE.Color => ((Array.isArray(m) ? m[1] : m) as THREE.MeshStandardMaterial).color
const luz = (c: THREE.Color): number => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
const papel = luz(new THREE.Color(PAPER_COLOR))
// Del papel del piso, más sombreado adentro: las paredes entre el 75 % y el papel, el fondo más oscuro que ellas (y no negro).
const tonoDelPiso = (pared: THREE.Color, deFondo: THREE.Color): boolean => luz(pared) < papel && luz(pared) >= 0.75 * papel && luz(deFondo) < luz(pared) && luz(deFondo) >= 0.6 * papel
const [pared, deFondo] = [colorDe(paredes.material), colorDe(fondo.material)]
afirmar(tonoDelPiso(pared, deFondo), 'las paredes y el fondo del pozo son el papel del piso, un poco más sombreado adentro (el fondo, más que las paredes): ni negro ni tinta', `pared ${(luz(pared) / papel).toFixed(2)} · fondo ${(luz(deFondo) / papel).toFixed(2)} del papel`)
controlPositivo('el detector VE el pozo de tinta de EL ENCASTRE', [new THREE.Color('#2a2a2a'), new THREE.Color('#121212')] as const, ([a, b]: readonly [THREE.Color, THREE.Color]) => tonoDelPiso(a, b))
pozo.soltar()
const enElPisoTs = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const labioBien = (c: string, cuanto: number): boolean => cuanto <= 0.12 && c.includes('return uApertura * ( 1.0 - min( 1.0, uPoder ) ) * smoothstep( 0.12, 0.45, m.g ) * ( 1.0 - smoothstep( 0.3, 0.6, m.r ) );')
afirmar(labioBien(enElPisoTs, CALMA_EN_EL_PISO.labio), '  el labio del corte oscurece apenas el piso alrededor del hueco abierto y se va cuando el logo queda al ras (con el poder): no queda un contorno', `labio ${String(CALMA_EN_EL_PISO.labio)}`)
controlPositivo('el detector VE el labio de EL ENCASTRE (0,3 y siempre)', enElPisoTs.replace('( 1.0 - min( 1.0, uPoder ) ) * ', ''), (c: string) => labioBien(c, 0.3))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1C · Sin línea blanca: el piso pisa el borde del logo (el corte por adentro del contorno) y queda un pelo debajo de su cara al ras')

// La rendija que queda entre el corte del piso y el canto del logo (u): el corte se corre `borde` del contorno (+ afuera,
// − adentro) y el canto del logo está `canto` afuera (el bisel). Por la rendija se veía el fondo claro de la escena.
const rendija = (borde: number, canto: number): number => Math.max(0, borde - canto)
const canto = PROBE_EXTRUDE.bevelSize * PROBE_SVG_SCALE
const ladoDeLaMascara = 7
const trazo = trazoDelBorde(-(HUECO.solape / ladoDeLaMascara) * HUECO.lado)
const huecoTs = sinComentarios(leer('_lib/escena/final/hueco.ts'))
const sinRendija = (borde: number): boolean => rendija(borde, canto) === 0 && trazo !== null && trazo.color === '#000' && huecoTs.includes('const nitida = dibujar(formas, marco, n, 0, -(HUECO.solape / lado) * n)')
afirmar(sinRendija(-HUECO.solape), 'el corte del piso va por ADENTRO del contorno del logo (lo achica un trazo negro): el piso pisa el borde, no queda rendija por la que se vea el fondo', `pisa ${String(HUECO.solape)} u · canto del logo ${canto.toFixed(3)} u`)
controlPositivo('el detector VE la holgura de EL ENCASTRE (0,035 u por afuera: la línea blanca)', 0.035, sinRendija)
// Y la cara del logo al ras queda encima: el piso calmo y el borde del pozo, un pelo más abajo (sin pelear en el solape).
const simulacion = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const alRas = { centro: new THREE.Vector3(), rotacionX: 0 }
poseDelLogo(1, TAM, alRas)
const caraDelLogo = alRas.centro.y + TAM.espesor / 2
const pozoAlRas = crearElPozo([cuadrado], TAM.espesor)
const bordeDelPozo = new THREE.Box3().setFromObject(pozoAlRas.grupo).max.y
pozoAlRas.soltar()
const encima = (sim: string, bajo: number): boolean => bajo > 0 && bajo < PROBE_EXTRUDE.bevelThickness * PROBE_SVG_SCALE && sim.includes(`dibujo -= ${String(bajo)} * calmaDelFinal( xz );`) && Math.abs(caraDelLogo - FLOOR_Y) < 1e-9 && Math.abs(bordeDelPozo - (FLOOR_Y - bajo)) < 1e-6
afirmar(encima(simulacion, HUECO.bajoElRas), '  la cara del logo al ras queda encima: el piso calmo (en la simulación) y el borde del pozo, `bajoElRas` más abajo (menos que su bisel: no se ve un escalón)', `${String(HUECO.bajoElRas)} u`)
controlPositivo('  el detector VE el piso calmo justo al ras (pelea con la cara del logo en el solape)', simulacion.replace(`dibujo -= ${String(HUECO.bajoElRas)} * calmaDelFinal( xz );`, ''), (s: string) => encima(s, HUECO.bajoElRas))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1D · Cinemática automática con rebobinado: arranca con el pie entero, a una velocidad; hacia arriba rebobina (NOCTURNO FINAL A1: entera, con un gesto)')

const DT = 1 / 60
type PasoDelReloj = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
const AL_FONDO: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, enViaje: false }
const correr = (paso: PasoDelReloj, r: RelojDelFinal, s: number, e: Partial<EntradaDelReloj> = {}): void => {
  for (let i = 0; i < Math.round(s / DT); i += 1) paso(r, { ...AL_FONDO, ...e }, DT)
}
const hasta = (paso: PasoDelReloj, r: RelojDelFinal, meta: number, e: Partial<EntradaDelReloj> = {}): number => {
  for (let i = 1; i <= 2400; i += 1) {
    paso(r, { ...AL_FONDO, ...e }, DT)
    if (r.fin === meta) return i * DT
  }
  return Number.POSITIVE_INFINITY
}
// [NOCTURNO FINAL] A1 · cambió por pedido: ya no rebobina «mientras siga el gesto» ni retoma al soltar (había que
// scrollear mucho para sacar el logo y al soltar se volvía a encastrar): UN gesto hacia arriba la rebobina ENTERA, sola, a
// la velocidad de la cinemática; parada, vuelve a empezar a los 2,5 s sin gestos (el detalle y sus controles, en s52 A1).
// Lo que sigue de 1D: arranca con el pie entero y corre a UNA velocidad (la rueda hacia abajo no la acelera); fuera del
// fondo o en un viaje, vuelve a cero (A2: con tope, sin saltos).
interface Cinematica { readonly esperaAlPie: number; readonly sola: number; readonly conRuedaAbajo: number; readonly rebobinaSola: number; readonly saliendo: number; readonly viaje: number }
const cinematica = (paso: PasoDelReloj): Cinematica => {
  // Al fondo con el pie llegando: no arranca.
  const a = relojQuieto()
  correr(paso, a, 1.5, { pieEntero: false })
  const esperaAlPie = a.fin
  const sola = hasta(paso, a, 1)
  // La rueda hacia abajo en cada cuadro: el mismo ritmo.
  const b = relojQuieto()
  const conRuedaAbajo = hasta(paso, b, 1, { haciaAbajo: true })
  // Desde el final entero, UN gesto (un cuadro) y nada más: rebobina sola hasta cero.
  paso(b, { ...AL_FONDO, rebobinar: true }, DT)
  const rebobinaSola = hasta(paso, b, 0) + DT
  // Fuera del fondo (la barra) y con un viaje del menú: vuelve a cero.
  const c = relojQuieto()
  correr(paso, c, 8)
  const saliendo = hasta(paso, c, 0, { alFondo: false })
  const d = relojQuieto()
  correr(paso, d, 8)
  const viaje = hasta(paso, d, 0, { enViaje: true })
  return { esperaAlPie, sola, conRuedaAbajo, rebobinaSola, saliendo, viaje }
}
const R = RELOJ_DEL_FINAL
const cinematicaBien = (c: Cinematica): boolean =>
  c.esperaAlPie === 0 && Math.abs(c.sola - R.duracionS) < 0.25 && Math.abs(c.conRuedaAbajo - c.sola) <= DT && Math.abs(c.rebobinaSola - REBOBINADO.topeS) < 0.1 && c.saliendo < 3 && c.viaje < 3
const medida = cinematica(pasoDelReloj)
afirmar(cinematicaBien(medida), 'al fondo espera al pie entero y corre sola a UNA velocidad (la rueda hacia abajo no la adelanta); UN gesto hacia arriba la rebobina entera, sola ([PULIDO 1] P2: en 1,6 s desde el final entero, no a la velocidad de la cinemática); fuera del fondo o con un viaje del menú vuelve a cero', `sola ${medida.sola.toFixed(2)} s · con la rueda abajo ${medida.conRuedaAbajo.toFixed(2)} s · rebobina sola en ${medida.rebobinaSola.toFixed(2)} s · saliendo ${medida.saliendo.toFixed(2)} s · viaje ${medida.viaje.toFixed(2)} s`)
// Los controles: el reloj de EL ENCASTRE (la rueda hacia abajo lo adelanta: la cola entera, la secuencia entera) y el de
// RETOQUE DEL ENCASTRE 1D (rebobina sólo mientras siga el gesto: sin gesto en el cuadro, vuelve a correr).
const conRueda: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (e.haciaAbajo && e.alFondo && !e.enViaje) r.fin = Math.min(1, r.fin + 0.03)
}
controlPositivo('el detector VE el reloj de EL ENCASTRE (el scroll hacia abajo lo adelanta)', conRueda, (p: PasoDelReloj) => cinematicaBien(cinematica(p)))
const mientrasSiga: PasoDelReloj = (r, e, dt) => {
  if (r.fase === 'rebobina' && !e.rebobinar) r.fase = 'corre'
  pasoDelReloj(r, e, dt)
}
controlPositivo('  y el de RETOQUE DEL ENCASTRE 1D (rebobina sólo mientras siga el gesto: al soltar, se vuelve a encastrar)', mientrasSiga, (p: PasoDelReloj) => cinematicaBien(cinematica(p)))
// Qué se retiene: sólo al fondo y hacia arriba; el gesto que EMPIEZA mientras corre pide el rebobinado y se retiene entero
// (hasta su tope); un gesto nuevo rebobinando o parada sube la página.
const enFase = (fase: FaseDelFinal, fin: number): RelojDelFinal => ({ ...relojQuieto(), fin, fase })
type Decide = typeof decidirElGesto
const retencionBien = (f: Decide): boolean => {
  const corre = enFase('corre', 0.4)
  const rebobinando = enFase('rebobina', 0.3)
  return f(corre, true, -1, true, false, 0, false).retiene && f(corre, true, -1, true, false, 0, false).rebobina && !f(corre, true, 1, true, false, 0, false).retiene && !f(corre, false, -1, true, false, 0, false).retiene && !f(enFase('espera', 0), true, -1, true, false, 0, false).retiene &&
    f(rebobinando, true, -1, false, true, 0.5, false).retiene && !f(rebobinando, true, -1, false, true, R.topeDelGestoS + 0.1, false).retiene && f(rebobinando, true, -1, false, true, R.topeDelGestoS + 0.1, true).retiene && !f(rebobinando, true, -1, true, false, 0, false).retiene && !f(enFase('parada', 0), true, -1, true, false, 0, false).retiene
}
afirmar(retencionBien(decidirElGesto), '  se retiene (no mueve la página) sólo hacia arriba al fondo: el gesto que empieza mientras corre (lo rebobina) y lo que queda de ese gesto, hasta su tope; un gesto nuevo rebobinando o parada sube la página; hacia abajo, nunca', `tope del gesto: ${String(R.topeDelGestoS)} s`)
controlPositivo('  el detector VE una retención que no suelta nunca (la página no subiría)', ((r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1) => (alFondo && sentido < 0 ? { retiene: true, rebobina: true } : { retiene: false, rebobina: false })) as Decide, retencionBien)
// Los gestos: la rueda (sin pellizcos ni de costado), el dedo (hacia abajo sube la página) y las teclas (no en un campo).
const sentidosBien = (rueda: typeof sentidoDeLaRueda, tecla: typeof sentidoDeLaTecla, dedo: typeof sentidoDelDedo): boolean =>
  rueda(0, -100, false) === -1 && rueda(0, 3, false) === 1 && rueda(0, 0.5, false) === null && rueda(40, 10, false) === null && rueda(0, -100, true) === null &&
  tecla('ArrowUp', false, false, false) === -1 && tecla('PageUp', false, false, false) === -1 && tecla('Home', false, false, false) === -1 && tecla(' ', true, false, false) === -1 && tecla(' ', false, false, false) === 1 &&
  tecla(' ', true, false, true) === null && tecla('ArrowUp', false, true, false) === null && tecla('a', false, false, false) === null && dedo(30) === -1 && dedo(-30) === 1 && dedo(1) === null
afirmar(sentidosBien(sentidoDeLaRueda, sentidoDeLaTecla, sentidoDelDedo), '  los gestos que mueven la página: la rueda (sin el pellizco con ctrl, ni la de costado, ni un temblor), el dedo y las teclas (no mientras se escribe en un campo, ni con un modificador)')
controlPositivo('  el detector VE un dedo al revés', sentidoDelDedo, (d: typeof sentidoDelDedo) => sentidosBien(sentidoDeLaRueda, sentidoDeLaTecla, (dy) => d(-dy)))
// El cableado: los escuchas en la captura de la ventana (antes que Lenis, en la burbuja) y no pasivos; el final los pide
// al montarse; el reloj con el fondo de la página, el pie entero y los gestos; el pie de volumen escribe si llegó entero.
const gestos = sinComentarios(leer('_lib/gestosDelScroll.ts'))
const finalTs = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const armadas = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const pieDeVolumen = sinComentarios(leer('_lib/escena/pie3d/PieDeVolumen.tsx'))
const cableado = (g: string): boolean =>
  g.includes("window.addEventListener('wheel', alRodar, { capture: true, passive: false })") && g.includes("window.addEventListener('touchmove', alArrastrar, { capture: true, passive: false })") && g.includes("window.addEventListener('keydown', alApretar, { capture: true })") &&
  /function retener\(e: Event\): void \{\s*if \(e\.cancelable\) e\.preventDefault\(\)\s*e\.stopPropagation\(\)/.test(g) &&
  // [PULIDO 1] P22 · en escritorio, al montarse (como antes); abajo de 1024, mientras se ve el escenario (o el pie, con la otra lectura).
  componenteDelFinal.includes('const retener = (): (() => void) => retenerLosGestos((g) => (m.current === null ? false : gestoDelFinal(m.current, g)))') && componenteDelFinal.includes('if (!angosto) return retener()') &&
  finalTs.includes('pasoDelReloj(s.reloj, { alFondo: window.scrollY >= s.fondo - AL_FONDO_PX, pieEntero: EN_VIVO.pieEntero, rebobinar, haciaAbajo, sinGestoS, enViaje: viajeEnCurso() !== null }, dt)') &&
  finalTs.includes('s.fondo = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)') &&
  armadas.includes('EN_VIVO.pieEntero = s.coreografia.mostrado >= 0.999 && s.armadas.every((a) => !a.grupo.visible || a.llego >= 0.999)') && pieDeVolumen.includes('EN_VIVO.pieEntero = true')
afirmar(cableado(gestos), '  el cableado: la rueda, el dedo y las teclas se ven en la captura de la ventana (antes que Lenis) y, retenidos, no le llegan a nadie; el final los pide al montarse; el reloj va con el fondo de la página, el pie entero (lo escribe el pie de volumen; sin él, no espera) y los gestos; un viaje del menú lo deshace (sus scroll no son gestos)')
controlPositivo('  el detector VE una rueda pasiva (no se puede retener)', gestos.replace("window.addEventListener('wheel', alRodar, { capture: true, passive: false })", "window.addEventListener('wheel', alRodar, { passive: true })"), cableado)
const pagina = sinComentarios(leer('page.tsx'))
afirmar(!pagina.includes('cola-del-final') && !leer('_estilos/pie.css').includes('--cola-del-final'), '  sin cola: la página termina en el pie (el scroll hacia abajo no tiene adónde ir)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1E · El brillo bajo el mouse (NOCTURNO FINAL B2: ya no; el rastro sólo levanta los bloques)')

// El dibujo del piso de verdad: el material con el final inyectado, compilado sobre un sombreador con sus anclas.
const dibujoDelPiso = (): string => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)].join('\n'), vertexShader: '', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return sombreador.fragmentShader
}
const dibujo = dibujoDelPiso()
const cuerpo = (glsl: string, firma: string): string => {
  const i = glsl.indexOf(firma)
  return i < 0 ? '' : glsl.slice(i, glsl.indexOf('\n}', i) + 2)
}
// [NOCTURNO FINAL] B2 · cambió por pedido: el mouse ya NO hace brillo (sólo levanta los bloques, como antes de esta luz) y
// el brillo pasa a ser la lava de todo el piso después del encastre (lo detalla s52 B2). Lo que queda de 1E: el rastro sigue
// levantando los bloques en la simulación y su cabeza sigue siendo una sola, bajo el mouse; el dibujo ya no lo lee.
const simDelPiso = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const sinBrilloDelMouse = (glsl: string, sim: string): boolean => !glsl.includes('uRastro') && !glsl.includes('resplandorDelRastro') && sim.includes('fuerza += empujeDelGolpe( p * uLado ) + empujeDelRastro( p, h );')
afirmar(sinBrilloDelMouse(dibujo, simDelPiso), 'el mouse ya no hace brillo (NOCTURNO FINAL B2): su rastro sólo levanta los bloques, como antes de la luz de abajo')
controlPositivo('el detector VE el brillo bajo el mouse de 1E', [`${dibujo}\nuniform vec4 uRastro[ 8 ];`, simDelPiso] as const, ([g, m]: readonly [string, string]) => sinBrilloDelMouse(g, m))
// La cabeza del rastro (la del núcleo): una sola, siempre bajo el mouse; al nacer otra, la de antes la suelta.
type PasoDelRastro = typeof pasoDelRastro
const cabezas = (paso: PasoDelRastro): { readonly unaSola: boolean; readonly bajoElMouse: boolean } => {
  const puntos = Array.from({ length: RASTRO_EN_EL_PISO.puntos }, () => new THREE.Vector4(9999, 9999, 0, 0))
  const e = rastroQuieto()
  let unaSola = true
  let bajoElMouse = true
  for (let i = 0; i <= 90; i += 1) {
    const x = -3 + i * 0.07
    paso(puntos, e, x, 1, 1, 1 / 60)
    const conNucleo = puntos.filter((q) => q.w > 0)
    if (conNucleo.length !== 1) unaSola = false
    if (conNucleo.length === 1 && Math.hypot(conNucleo[0].x - x, conNucleo[0].y - 1) > 1e-9) bajoElMouse = false
  }
  return { unaSola, bajoElMouse }
}
const cabezaBien = (c: ReturnType<typeof cabezas>): boolean => c.unaSola && c.bajoElMouse
afirmar(cabezaBien(cabezas(pasoDelRastro)), '  el núcleo va en la cabeza del rastro: una sola, siempre bajo el mouse (la nueva nace donde quedó la anterior: no salta)')
const todasConNucleo: PasoDelRastro = (puntos, e, x, z, vale, dt) => {
  pasoDelRastro(puntos, e, x, z, vale, dt)
  for (const q of puntos) if (q.z > 0) q.w = 1
}
controlPositivo('  el detector VE un núcleo en cada punto', todasConNucleo, (p: PasoDelRastro) => cabezaBien(cabezas(p)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1F · Brillo en lo automático (NOCTURNO FINAL B2: ahora es la lava del piso entero, después del encastre)')

// [NOCTURNO FINAL] B2 · cambió por pedido: lo automático (las rendijas que abrían las ondas) pasó a ser la LAVA del piso
// entero: focos al azar que pulsan, por las juntas (lo detalla s52 B2). Lo que queda de 1F: espera al encastre (el poder) y
// no entra al mar calmo del logo (su borde encendido dibujaba un marco de bloques).
// [PULIDO 1] P1 · la lava pasó a ser el brillo blanco por zonas (s52-pulido-1 P1): lo que fija esto sigue igual.
const juntasDelPiso = cuerpo(dibujo, 'vec3 conLasJuntas( vec3 color, vec2 xz ) {')
const lavaConElPoder = (j: string): boolean => j.includes('float energia = min( 1.0, uPoder ) * fueraDeLaCalma( xz );') && j.includes('return conElBrillo( color, energia );')
afirmar(lavaConElPoder(juntasDelPiso) && dibujo.includes('float fueraDeLaCalma( vec2 xz ) {'), 'el brillo del piso espera al encastre (con el poder liberado) y queda fuera del mar calmo del logo ([PULIDO 1] P1: las zonas blancas)')
controlPositivo('el detector VE un brillo que no espera al encastre', juntasDelPiso.replace('min( 1.0, uPoder ) * fueraDeLaCalma( xz )', 'fueraDeLaCalma( xz )'), lavaConElPoder)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1G · El pie no recibe la luz de la cinemática: se ve como antes, en cualquier pose de la cámara')

// La cuenta: una pieza de frente a la cámara sin el mouse tiene la misma normal y la misma vista en el espacio de la
// cámara antes y durante el final; lo que cambia es dónde quedan las luces (quietas en el mundo). Con el giro, la luz
// (difusa y especular) y el reflejo del estudio son los de antes del final; sin él, otros.
type GiroDeLaLuz = typeof giroDeLaLuzDelPie
const comoAntes = (giroDe: GiroDeLaLuz): { readonly peor: number; readonly cambio: number } => {
  const camara = (): THREE.PerspectiveCamera => {
    const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
    c.position.set(6, 1.5, 21)
    c.lookAt(0, -0.5, 0)
    c.updateMatrixWorld()
    return c
  }
  let [peor, cambio] = [0, 0]
  for (const [k, giro, aleja] of [[0.3, 0, 0], [0.8, 0, 0], [1, 0, 0], [1, 40, 6], [1, 215, 12]] as const) {
    const antes = camara()
    const ahora = camara()
    camaraDelFinal(ahora, k, new THREE.Vector3(0, -4, 0), giro, aleja, null)
    // El giro del final, en el mundo: de la orientación de ahora a la de antes (lo que escribe `cuadroDelFinal.ts`).
    const delFinal = ahora.quaternion.clone().invert().premultiply(antes.quaternion)
    const enVista = giroDe(ahora.quaternion, delFinal, new THREE.Matrix3())
    for (const luzDelMundo of [new THREE.Vector3(0.4, 1, 0.6), new THREE.Vector3(-0.8, 0.3, 0.2), new THREE.Vector3(0, 1, 0)].map((v) => v.normalize())) {
      for (const normal of [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0.3, 0.2, 0.93).normalize(), new THREE.Vector3(-0.9, 0, 0.44).normalize()]) {
        const vista = new THREE.Vector3(0.1, -0.05, 1).normalize()
        const luzAntes = luzDelMundo.clone().applyQuaternion(antes.quaternion.clone().invert())
        const luzAhora = luzDelMundo.clone().applyQuaternion(ahora.quaternion.clone().invert())
        const medio = (n: THREE.Vector3, v: THREE.Vector3, l: THREE.Vector3): number => n.dot(v.clone().add(l).normalize())
        const n2 = normal.clone().applyMatrix3(enVista)
        const v2 = vista.clone().applyMatrix3(enVista)
        peor = Math.max(peor, Math.abs(n2.dot(luzAhora) - normal.dot(luzAntes)), Math.abs(medio(n2, v2, luzAhora) - medio(normal, vista, luzAntes)))
        cambio = Math.max(cambio, Math.abs(normal.dot(luzAhora) - normal.dot(luzAntes)))
      }
    }
  }
  return { peor, cambio }
}
const medidoElPie = comoAntes(giroDeLaLuzDelPie)
afirmar(medidoElPie.peor < 1e-9 && medidoElPie.cambio > 0.3, 'con la cámara del final (subiendo, arriba del todo, girando y alejándose en el quieto) la luz difusa y la especular sobre las piezas del pie son las de antes de la cinemática: su normal y su vista giran con el giro que el final le dio a la cámara (sin eso, la luz cambiaba hasta 0,3 o más)', `diferencia ${medidoElPie.peor.toExponential(1)} · sin el giro, ${medidoElPie.cambio.toFixed(2)}`)
controlPositivo('el detector VE el pie de EL ENCASTRE (sin girar la luz)', ((_viva, _giro, destino) => destino.identity()) as GiroDeLaLuz, (g: GiroDeLaLuz) => comoAntes(g).peor < 1e-9)
// El sombreador de verdad (el material compilado sobre el estándar de three) y el cableado.
const sombreadorDelPie = (): { readonly fragmento: string; readonly uniforme: boolean } => {
  const m = materialDelPie()
  const s = { fragmentShader: THREE.ShaderLib.standard.fragmentShader, vertexShader: THREE.ShaderLib.standard.vertexShader, uniforms: {} as Record<string, THREE.IUniform> }
  m.onBeforeCompile(s as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  m.dispose()
  return { fragmento: s.fragmentShader, uniforme: s.uniforms.uGiroDeLaLuz === LUZ_DEL_PIE.uGiroDeLaLuz }
}
const delPie = sombreadorDelPie()
const armadasDelPie = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const pieBien = (f: string, armadasTs: string, finalTs2: string): boolean =>
  delPie.uniforme && f.includes('uniform mat3 uGiroDeLaLuz;') && f.includes('#include <normal_fragment_maps>\n\tnormal = normalize( uGiroDeLaLuz * normal );') && f.includes('geometryViewDir = normalize( uGiroDeLaLuz * geometryViewDir );') && !f.includes('#include <lights_fragment_begin>') &&
  armadasTs.includes('giroDeLaLuzDelPie(viva.quaternion, EN_VIVO.giroDelPie, LUZ_DEL_PIE.uGiroDeLaLuz.value)') && finalTs2.includes('EN_VIVO.giroDelPie.copy(CAMARA_SIN_EL_MOUSE.quaternion).invert().premultiply(ANTES_DEL_FINAL)') && finalTs2.includes('EN_VIVO.giroDelPie.identity()')
afirmar(pieBien(delPie.fragmento, armadasDelPie, finalTs), '  en el sombreador del pie la normal y la vista giran (después de los mapas de normales, antes de las luces: también el reflejo del estudio); el pie lo escribe en cada cuadro con la cámara viva y el giro que publica el final (sin final, la identidad)')
controlPositivo('  el detector VE una vista sin girar (el brillo especular, de otro lado)', delPie.fragmento.replace('geometryViewDir = normalize( uGiroDeLaLuz * geometryViewDir );', ''), (f: string) => pieBien(f, armadasDelPie, finalTs))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2A · Los nanobots siguen al cursor de la sala (donde se ve, interpolado), no al puntero nativo')

// El hueco va justo donde está el objetivo (el cursor que se ve ya trae su interpolación: un resorte encima lo dejaba
// atrás); la fuerza conserva su resorte (se abre pasándose un poco).
type PasoDelEnjambre = (p: PunteroDelEnjambre, o: ObjetivoDelPuntero, dt: number) => void
const siguiendo = (paso: PasoDelEnjambre): { readonly peorAtraso: number; readonly pico: number } => {
  const p = punteroQuieto()
  let [peorAtraso, pico] = [0, 0]
  for (let i = 0; i < 120; i += 1) {
    const o = { x: -0.6 + i * 0.01, y: 0.2 * Math.sin(i * 0.1), dentro: true }
    paso(p, o, 1 / 60)
    peorAtraso = Math.max(peorAtraso, Math.hypot(p.x - o.x, p.y - o.y))
    pico = Math.max(pico, p.fuerza)
  }
  return { peorAtraso, pico }
}
const enElCursor = (m: ReturnType<typeof siguiendo>): boolean => m.peorAtraso < 1e-9 && m.pico > 1.05
afirmar(enElCursor(siguiendo(pasoDelPuntero)), 'el hueco va justo donde está el cursor que se ve (sin un resorte encima que lo atrase); la fuerza sigue abriéndose con su resorte')
const conResorteDeLugar: PasoDelEnjambre = (p, o, dt) => {
  const [x, y] = [p.x, p.y]
  pasoDelPuntero(p, o, dt)
  p.x = x + (p.x - x) * 0.25
  p.y = y + (p.y - y) * 0.25
}
controlPositivo('el detector VE el hueco de EL ENCASTRE (con un resorte que lo atrasa)', conResorteDeLugar, (p: PasoDelEnjambre) => enElCursor(siguiendo(p)))
// El cableado: el cursor de la sala publica su halo en cada cuadro (y se apaga al irse el puntero o al desmontarse); el
// enjambre lo usa cuando está, y si no, el puntero.
const cursorDeLaSala = sinComentarios(readFileSync(`${V3}/_chrome/cursor/CursorDeLaSala.tsx`, 'utf8').replace(/\r\n/g, '\n'))
const montajeDelEnjambre = sinComentarios(leer('_lib/nanobots/montaje.ts'))
const cursorBien = (cursor: string, montaje: string): boolean =>
  /halo\.y \+= \(destino\.y - halo\.y\) \* fh\s*CURSOR_EN_VIVO\.x = halo\.x\s*CURSOR_EN_VIVO\.y = halo\.y\s*CURSOR_EN_VIVO\.activo = adentro/.test(cursor) && (cursor.match(/CURSOR_EN_VIVO\.activo = false/g) ?? []).length === 2 &&
  montaje.includes('const conCursor = CURSOR_EN_VIVO.activo') && montaje.includes('((conCursor ? CURSOR_EN_VIVO.x : mouse.x) - caja.izquierda)') && montaje.includes('((conCursor ? CURSOR_EN_VIVO.y : mouse.y) - caja.arriba)')
afirmar(cursorBien(cursorDeLaSala, montajeDelEnjambre), '  el cursor de la sala publica dónde se ve (su halo) en cada cuadro de su bucle y se apaga al irse el puntero o al desmontarse; el enjambre lo sigue cuando está (sin él —táctil, movimiento reducido, abajo de 1024—, el puntero)')
controlPositivo('  el detector VE el enjambre siguiendo al puntero nativo', montajeDelEnjambre.replace('((conCursor ? CURSOR_EN_VIVO.x : mouse.x) - caja.izquierda)', '(mouse.x - caja.izquierda)'), (m: string) => cursorBien(cursorDeLaSala, m))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2B · La llegada y la salida del pie, bastante más cortas (con el escalonado por columnas): reciben clics antes')

// Un salto al último píxel (llegar) y otro afuera de la última pantalla (irse): cuánto tarda, y si las columnas siguen
// llegando una después de la otra.
type Seguidor = (m: number, p: number, asentar: boolean, dt: number) => number
const tiemposDelPie = (f: Seguidor): { readonly llega: number; readonly seVa: number; readonly enOrden: boolean } => {
  const DTP = 1 / 60
  let [m, t] = [0, 0]
  const cruces: number[] = []
  for (const b of [TRAMOS_DEL_PIE[0].hasta, TRAMOS_DEL_PIE[1].hasta, TRAMOS_DEL_PIE[2].hasta]) {
    while (m < b - 1e-9 && t < 30) {
      m = f(m, 1, false, DTP)
      t += DTP
    }
    cruces.push(t)
  }
  const llega = t
  let s = 0
  while (m > TRAMOS_DEL_PIE[0].desde + 1e-9 && s < 30) {
    m = f(m, 0.3, false, DTP)
    s += DTP
  }
  return { llega, seVa: s, enOrden: cruces[0] < cruces[1] && cruces[1] < cruces[2] && cruces[1] - cruces[0] >= 0.3 && cruces[2] - cruces[1] >= 0.3 }
}
const tiemposBien = (m: ReturnType<typeof tiemposDelPie>): boolean => m.llega <= 1.7 && m.seVa <= 1.7 && m.enOrden
const medidosDelPie = tiemposDelPie(avanceDelPie)
afirmar(tiemposBien(medidosDelPie), 'el pie llega entero en menos de 1,7 s desde que asoma la última pantalla y se va en menos de 1,7 s al salir de ella (eran 3,2 s), con las columnas una después de la otra; las piezas reciben clics al llegar (antes, entonces)', `llega ${medidosDelPie.llega.toFixed(2)} s · se va ${medidosDelPie.seVa.toFixed(2)} s`)
controlPositivo('el detector VE el ritmo de antes (3,2 s)', ((m, p, a, dt) => avanceDelPie(m, p, a, dt * 0.44)) as Seguidor, (f: Seguidor) => tiemposBien(tiemposDelPie(f)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2C · Los viajes del menú sin freno: durante el viaje se ignora el scroll; termina en su destino y recién ahí se puede scrollear')

// Al despegar, el viaje retiene todos los gestos de scroll (la rueda, el dedo y las teclas, antes que Lenis); al terminar
// (por cualquiera de sus salidas) los suelta. Ningún gesto lo cancela: ni `virtual-scroll` de Lenis ni los crudos.
const deslizamiento = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
const viajeSinFreno = (d: string): boolean => {
  const alClick = d.slice(d.indexOf('const alClick = (evento: MouseEvent): void => {'))
  const terminar = d.slice(d.indexOf('const terminar = (llego: boolean): void => {'), d.indexOf('const alClick = (evento: MouseEvent): void => {'))
  return alClick.indexOf('soltarLaRueda = retenerLosGestos(() => true)') > alClick.indexOf('enVuelo = true') && /if \(soltarLaRueda !== null\) \{\s*soltarLaRueda\(\)\s*soltarLaRueda = null/.test(terminar) &&
    !d.includes("lenis.on('virtual-scroll'") && !/addEventListener\('(wheel|touchstart|keydown)'/.test(d)
}
afirmar(viajeSinFreno(deslizamiento), 'al despegar, el viaje retiene todos los gestos de scroll (rueda, dedo, teclas; antes que Lenis) y los suelta al terminar por cualquier salida; ningún gesto lo cancela: termina en su destino (medido en vivo: con rueda y flechas durante todo el vuelo, cae en el mismo píxel que sin ellas)')
controlPositivo('el detector VE el viaje de antes (la rueda lo cancelaba)', deslizamiento.replace('soltarLaRueda = retenerLosGestos(() => true)', "soltarLaRueda = lenis.on('virtual-scroll', ({ deltaX, deltaY }) => terminar(false))"), viajeSinFreno)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2D · Cada destino del menú cae en su punto de lectura, con su llegada completa; Contacto abre la hoja')

// Los destinos: la barra y el menú del teléfono llevan a las cinco secciones, y cada una tiene su nudo (si no, el viaje iría
// al ancla nativa, que deja el título a medio llegar); el Contacto de la barra abre la hoja (no viaja).
const nada = (): void => undefined
const hrefsDe = (html: string, marca: string): string[] => [...html.matchAll(new RegExp(`<a[^>]*${marca}[^>]*>`, 'g'))].map((m) => /href="([^"]+)"/.exec(m[0])?.[1] ?? '?')
const barraHtml = renderToStaticMarkup(<BarraDelHome />)
const delMenu = [...hrefsDe(barraHtml, 'data-pieza="barra-enlace"'), ...hrefsDe(renderToStaticMarkup(<Menu abierto boton={{ current: null }} alCubrir={nada} alCerrado={nada} alSoltar={nada} alContacto={nada} />), 'data-parte="item-del-menu"')]
const secciones = delMenu.filter((h) => h.startsWith('#') && h !== '#contacto').map((h) => h.slice(1))
const conNudo = (ids: readonly string[], nudos: readonly string[]): boolean => ids.length === 10 && ['quienes-somos', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop'].every((id) => ids.filter((x) => x === id).length === 2) && ids.every((id) => nudos.includes(id))
afirmar(conNudo(secciones, DESTINOS_CON_NUDO) && new RegExp(`href="#contacto"[^>]*data-abre-contacto="${ABRE_EL_PANEL}"`).test(barraHtml), 'la barra y el menú del teléfono llevan a Quiénes somos, Portfolio, Servicios, Panel y Por qué develOP, y cada uno tiene su nudo (su punto de lectura); el Contacto de la barra abre la hoja', secciones.join(' '))
controlPositivo('el detector VE un destino sin nudo (iría al ancla nativa)', DESTINOS_CON_NUDO.filter((id) => id !== 'tu-panel'), (nudos: readonly string[]) => conNudo(secciones, nudos))

// El punto de lectura con la llegada completa, en cada nudo (con la mecánica de verdad sobre un documento falso; los
// números de la sección, los de 1440 × 900 con el túnel en k = 1,8): el título ya llegó (su ventana terminó) y queda
// despejado debajo de la barra; Servicios en su 00; la cabecera del panel entera en el cuadro libre.
const BLOQUE = `[data-arbol="${MARCA_COREOGRAFIA_DEL_HOME}"]`
const PAR: Readonly<Record<string, typeof ANCLA_DEL_TRAZO>> = { 'ventana-visible': ANCLA_DE_LA_VENTANA_VISIBLE, 'ventana-del-trazo': ANCLA_DEL_TRAZO, 'ventana-de-la-mascara': ANCLA_DE_LA_MASCARA }
const bloque = (tope: number, alto: number, rango: string): NodoFalso => new NodoFalso({ tope, alto }, { 'data-rango': rango, 'data-arbol': MARCA_COREOGRAFIA_DEL_HOME })
const finDe = (b: NodoFalso, v: number): number => {
  const caja = b.getBoundingClientRect()
  return posicionDeAncla(PAR[b.getAttribute('data-rango') ?? ''].fin, { topDoc: caja.top + VENTANA.scrollY, alto: caja.height }, v)
}
type Destino = (seccion: HTMLElement) => number
const DESPEJE = 72
const V = 900
const enSuPuntoDeLectura = (destino: Destino): Record<string, boolean> => conDomFalso(V, DESPEJE, () => {
  VENTANA.scrollY = 0
  const r: Record<string, boolean> = {}
  // Quiénes somos: el título (máscara y trazo) y la primera pantalla.
  const tituloQs = bloque(900 + 224, 100, 'ventana-de-la-mascara')
  const trazoQs = bloque(900 + 224, 100, 'ventana-del-trazo')
  const qs = new NodoFalso({ tope: 900, alto: 2700 }, { 'data-panel': 'quienes-somos' })
    .lista(BLOQUE, [tituloQs, trazoQs, bloque(900 + 450, 120, 'ventana-del-trazo'), bloque(900 + 600, 150, 'ventana-visible'), bloque(900 + 1000, 200, 'ventana-de-la-mascara')])
    .responde('[data-composicion="agencia"] > [data-arbol]', tituloQs)
  const dQs = destino(qs as unknown as HTMLElement)
  r.quienes = dQs >= Math.max(finDe(tituloQs, V), finDe(trazoQs, V)) - 1 && 900 + 224 - dQs >= DESPEJE
  // Portfolio: el título del cartel termina de subir (su máscara) antes del pin o después; las dos.
  for (const [nombre, alto] of [['portfolio', 300], ['portfolioTarde', 600]] as const) {
    const titulo = bloque(5073 + alto, 180, 'ventana-de-la-mascara')
    const trabajos = new NodoFalso({ tope: 5073, alto: 7997 }, { 'data-panel': 'trabajos' }).responde(`[data-pieza="cartel"] ${BLOQUE}`, titulo)
    const d = destino(trabajos as unknown as HTMLElement)
    r[nombre] = d >= finDe(titulo, V) - 1 && d >= 5073 && 5073 + alto - d >= DESPEJE - 1 && 5073 + alto + 180 - d <= V
  }
  // Servicios: en su 00 (el pin, sin pasar al 01).
  const servicios = new NodoFalso({ tope: 13069.6, alto: 7200 }, { 'data-panel': 'servicios' })
  const dS = destino(servicios as unknown as HTMLElement)
  r.servicios = dS <= 13069.6 && 13069.6 - dS < 1
  // Panel: la cabecera (título, bajada y panel en vivo) entera en el cuadro que deja la barra.
  const cabecera = new NodoFalso({ tope: 20270 + 160, alto: 640 })
  const panel = new NodoFalso({ tope: 20270, alto: 6300 }, { 'data-panel': 'tu-panel' }).responde('[data-pieza="encabezado-del-panel"]', cabecera)
  const dP = destino(panel as unknown as HTMLElement)
  r.panel = 20270 + 160 - dP >= DESPEJE - 1 && 20270 + 160 + 640 - dP <= V && dP >= 20270
  // Por qué develOP: la frase subida entera (el fin de su ventana), sin valores en camino.
  const pin = new NodoFalso({ tope: 26570, alto: 3600 })
  const escenario = new NodoFalso({ tope: 26570, alto: V }).cercano(BLOQUE, pin)
  const porQue = new NodoFalso({ tope: 26570, alto: 3600 }, { 'data-panel': 'por-que-develop' }).responde('[data-pieza="escenario-del-final"]', escenario)
  const dQ = destino(porQue as unknown as HTMLElement)
  r.porQue = dQ >= 26570 + VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.hasta * (3600 - V) - 1 && dQ < 26570 + VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.hasta * (3600 - V) + 2
  return r
})
const todosEnSuPunto = (r: Record<string, boolean>): boolean => Object.values(r).length === 6 && Object.values(r).every(Boolean)
const enLosNudos = enSuPuntoDeLectura(destinoDelViaje)
afirmar(todosEnSuPunto(enLosNudos), '  cada destino cae en su punto de lectura con su llegada completa: Quiénes somos con el título llegado y despejado; Portfolio con «Portfolio» subido entero (llegue antes o después del pin), debajo de la barra; Servicios en su 00; la cabecera del panel entera en el cuadro libre; la frase de Por qué develOP subida entera, sin valores en camino', Object.entries(enLosNudos).map(([k, v]) => `${k} ${v ? 'sí' : 'NO'}`).join(' · '))
const alAncla: Destino = (seccion) => Math.round(seccion.getBoundingClientRect().top + VENTANA.scrollY - DESPEJE)
controlPositivo('  el detector VE el ancla nativa (el tope menos la barra: títulos a medio llegar)', alAncla, (d: Destino) => todosEnSuPunto(enSuPuntoDeLectura(d)))
// La llegada aislada (Portfolio y la frase): al llegar, el título de la sección repite su llegada, entera, después del fundido.
const efectoDelViaje = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
const piezasDePortfolio = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const fraseDePorQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const llegadaDelTitulo = sinComentarios(leer('_componentes/llegadaDelTitulo.ts'))
const aislada = (efecto: string): boolean =>
  efecto.includes('if (llego && destino !== null) repetirLaLlegadaDelTitulo(destino.id, duracionDelFundido(zona))') && /<TituloDeVolumen id="portfolio"[^>]*llegadaDe=\{seccion\.id\}/.test(piezasDePortfolio) && /<TituloDeVolumen [^>]*llegadaDe="por-que-develop" \/>/.test(fraseDePorQue) &&
  /control = animate\(repeticion, 1,/.test(llegadaDelTitulo) && /void control\.then\(\(\) => \{\s*repeticion\.set\(-1\)/.test(llegadaDelTitulo)
afirmar(aislada(efectoDelViaje), '  y al llegar, el título de Portfolio (y la frase de Por qué develOP) repite su llegada aislada, entera hasta 1, después del fundido del velo; al terminar vuelve al scroll (que en el nudo ya vale 1: no salta)')
controlPositivo('  el detector VE un viaje que no la pide', efectoDelViaje.replace('if (llego && destino !== null) repetirLaLlegadaDelTitulo(destino.id, duracionDelFundido(zona))', ''), aislada)

cerrar('s51-retoque-encastre')
