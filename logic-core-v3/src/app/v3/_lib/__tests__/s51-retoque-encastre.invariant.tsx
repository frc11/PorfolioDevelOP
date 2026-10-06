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
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-encastre/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import * as THREE from 'three'

import { CALMA_EN_EL_PISO, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { HUECO, crearElPozo, trazoDelBorde } from '../escena/final/hueco'
import { RELOJ_DEL_FINAL, pasoDelReloj, poseDelLogo, relojQuieto, retieneElGesto, type EntradaDelReloj, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { sentidoDeLaRueda, sentidoDeLaTecla, sentidoDelDedo } from '../gestosDelScroll'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { FLOOR_Y, PAPER_COLOR, PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

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
titulo('1D · Cinemática automática con rebobinado: arranca con el pie entero, a una velocidad; hacia arriba rebobina; al soltar retoma')

const DT = 1 / 60
type PasoDelReloj = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
const AL_FONDO: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobina: false, haciaAbajo: false, enViaje: false }
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
interface Cinematica { readonly esperaAlPie: number; readonly sola: number; readonly conRuedaAbajo: number; readonly rebobino: number; readonly retoma: boolean; readonly enCero: number; readonly fase: string; readonly sigueEnCero: number; readonly vuelveAbajo: boolean; readonly saliendo: number; readonly viaje: number; readonly saltoMaximo: number }
const cinematica = (paso: PasoDelReloj): Cinematica => {
  // Al fondo con el pie llegando: no arranca.
  const a = relojQuieto()
  correr(paso, a, 1.5, { pieEntero: false })
  const esperaAlPie = a.fin
  const sola = hasta(paso, a, 1)
  // La rueda hacia abajo en cada cuadro: el mismo ritmo.
  const b = relojQuieto()
  const conRuedaAbajo = hasta(paso, b, 1, { haciaAbajo: true })
  // Desde el final entero: 0,6 s rebobinando; después suelta.
  correr(paso, b, 0.6, { rebobina: true })
  const rebobino = 1 - b.fin
  const enElValle = b.fin
  correr(paso, b, 0.6)
  const retoma = b.fin > enElValle + 0.02
  // Rebobinada del todo: queda en cero (con la fase), aunque suelte; un gesto hacia abajo la vuelve a correr.
  const enCero = hasta(paso, b, 0, { rebobina: true })
  correr(paso, b, 0.2, { rebobina: true })
  const fase = b.fase
  correr(paso, b, 2)
  const sigueEnCero = b.fin
  paso(b, { ...AL_FONDO, haciaAbajo: true }, DT)
  correr(paso, b, 0.5)
  const vuelveAbajo = b.fin > 0
  // Fuera del fondo (la barra) y con un viaje del menú: vuelve a cero.
  const c = relojQuieto()
  correr(paso, c, 8)
  const saliendo = hasta(paso, c, 0, { alFondo: false })
  const d = relojQuieto()
  correr(paso, d, 8)
  const viaje = hasta(paso, d, 0, { enViaje: true })
  // Ningún cambio de sentido de golpe: lo más que cambia `fin` en un cuadro al pasar de adelante a rebobinar y vuelta.
  const e = relojQuieto()
  correr(paso, e, 3)
  let saltoMaximo = 0
  for (const rebobina of [true, false, true]) {
    for (let i = 0; i < 30; i += 1) {
      const antes = e.fin
      paso(e, { ...AL_FONDO, rebobina }, DT)
      saltoMaximo = Math.max(saltoMaximo, Math.abs(e.fin - antes))
    }
  }
  return { esperaAlPie, sola, conRuedaAbajo, rebobino, retoma, enCero, fase, sigueEnCero, vuelveAbajo, saliendo, viaje, saltoMaximo }
}
const R = RELOJ_DEL_FINAL
const cinematicaBien = (c: Cinematica): boolean =>
  c.esperaAlPie === 0 && Math.abs(c.sola - R.duracionS) < 0.25 && Math.abs(c.conRuedaAbajo - c.sola) <= DT && c.rebobino > 0.15 && c.retoma && c.enCero < R.rebobinaS && c.fase === 'rebobinada' && c.sigueEnCero === 0 && c.vuelveAbajo &&
  c.saliendo <= R.vueltaS + 0.3 && c.viaje <= R.vueltaDelViajeS + 0.3 && c.saltoMaximo <= 1.05 / (R.rebobinaS * 60)
const medida = cinematica(pasoDelReloj)
afirmar(cinematicaBien(medida), 'al fondo espera al pie entero y corre sola a UNA velocidad (la rueda hacia abajo no la adelanta); un gesto hacia arriba la rebobina mientras siga y al soltar retoma desde donde quedó; rebobinada del todo se queda en cero (aunque suelte) hasta un gesto hacia abajo; fuera del fondo o con un viaje del menú vuelve a cero; ningún cambio de sentido de golpe', `sola ${medida.sola.toFixed(2)} s · con la rueda abajo ${medida.conRuedaAbajo.toFixed(2)} s · rebobinó ${medida.rebobino.toFixed(2)} en 0,6 s · a cero en ${medida.enCero.toFixed(2)} s · viaje ${medida.viaje.toFixed(2)} s`)
// Los controles: el reloj de EL ENCASTRE (la rueda hacia abajo lo adelanta: la cola entera, la secuencia entera) y uno sin
// la espera en cero (al soltar, retoma desde cero: el siguiente gesto rebobinaría de nuevo y la página no subiría nunca).
const conRueda: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (e.haciaAbajo && e.alFondo && !e.enViaje) r.fin = Math.min(1, r.fin + 0.03)
}
controlPositivo('el detector VE el reloj de EL ENCASTRE (el scroll hacia abajo lo adelanta)', conRueda, (p: PasoDelReloj) => cinematicaBien(cinematica(p)))
const sinEspera: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (r.fase === 'rebobinada' && !e.rebobina) r.fase = 'corre'
}
controlPositivo('  y uno que retoma sola desde cero (atraparía al visitante abajo)', sinEspera, (p: PasoDelReloj) => cinematicaBien(cinematica(p)))
// Qué se retiene: sólo al fondo y hacia arriba, mientras no está en su inicio; rebobinada, sólo mientras sigue el gesto.
const corriendo: RelojDelFinal = { fin: 0.4, velocidad: 0, fase: 'corre' }
const enEspera: RelojDelFinal = { fin: 0, velocidad: 0, fase: 'espera' }
const rebobinada: RelojDelFinal = { fin: 0, velocidad: 0, fase: 'rebobinada' }
type Retiene = typeof retieneElGesto
const retencionBien = (f: Retiene): boolean =>
  f(corriendo, true, -1, 9) && !f(corriendo, true, 1, 9) && !f(corriendo, false, -1, 9) && !f(enEspera, true, -1, 9) && f(rebobinada, true, -1, 0.05) && !f(rebobinada, true, -1, R.sueltaS + 0.01)
afirmar(retencionBien(retieneElGesto), '  se retiene (no mueve la página) sólo el gesto hacia arriba al fondo mientras la cinemática no está en su inicio; rebobinada del todo, sólo mientras sigue el gesto que la llevó a cero: el siguiente gesto sube la página; hacia abajo, nunca', `soltar: ${String(R.sueltaS)} s`)
controlPositivo('  el detector VE una retención que no suelta nunca (la página no subiría)', ((r, alFondo, sentido) => alFondo && sentido < 0) as Retiene, retencionBien)
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
  componenteDelFinal.includes('useEffect(() => retenerLosGestos((g) => (m.current === null ? false : gestoDelFinal(m.current, g))), [])') &&
  finalTs.includes('pasoDelReloj(s.reloj, { alFondo: window.scrollY >= s.fondo - AL_FONDO_PX, pieEntero: EN_VIVO.pieEntero, rebobina: ahora - s.gestos.arriba < RELOJ_DEL_FINAL.sueltaS, haciaAbajo, enViaje: viajeEnCurso() !== null }, dt)') &&
  finalTs.includes('s.fondo = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)') &&
  armadas.includes('EN_VIVO.pieEntero = s.coreografia.mostrado >= 0.999 && s.armadas.every((a) => !a.grupo.visible || a.llego >= 0.999)') && pieDeVolumen.includes('EN_VIVO.pieEntero = true')
afirmar(cableado(gestos), '  el cableado: la rueda, el dedo y las teclas se ven en la captura de la ventana (antes que Lenis) y, retenidos, no le llegan a nadie; el final los pide al montarse; el reloj va con el fondo de la página, el pie entero (lo escribe el pie de volumen; sin él, no espera) y los gestos; un viaje del menú lo deshace (sus scroll no son gestos)')
controlPositivo('  el detector VE una rueda pasiva (no se puede retener)', gestos.replace("window.addEventListener('wheel', alRodar, { capture: true, passive: false })", "window.addEventListener('wheel', alRodar, { passive: true })"), cableado)
const pagina = sinComentarios(leer('page.tsx'))
afirmar(!pagina.includes('cola-del-final') && !leer('_estilos/pie.css').includes('--cola-del-final'), '  sin cola: la página termina en el pie (el scroll hacia abajo no tiene adónde ir)')

cerrar('s51-retoque-encastre')
