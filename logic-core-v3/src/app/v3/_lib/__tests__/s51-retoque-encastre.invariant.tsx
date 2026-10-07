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
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-encastre/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import * as THREE from 'three'

import { ANCLAS_DEL_HUECO, CALMA_EN_EL_PISO, LUZ_EN_EL_PISO, RASTRO_EN_EL_PISO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { pasoDelRastro, rastroQuieto } from '../escena/final/rastro'
import { ANCLAS_DEL_DIBUJO } from '../escena/piso/ondaDirigida'
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('1E · El brillo bajo el mouse: luz que nace abajo y sale por las rendijas, con núcleo y halo; la tapa sombreada; sin dientes ni bandas')

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
const FIRMA_DE_LA_LUZ = 'vec3 conLaLuz( vec3 color, float raton, float caliente, float energia ) {'
const luzBien = (glsl: string): boolean => {
  const luz = cuerpo(glsl, FIRMA_DE_LA_LUZ)
  return luz.includes('vec3 luz = vec3( 1.0 );') && luz.includes('return mix( color, luz, clamp( max( junta, nucleo ), 0.0, 1.0 ) );') && luz.includes('if ( vTapa < 0.5 ) return mix( color, luz, mayor );') &&
    luz.includes('float px = length( fwidth( vPiso.xz ) );') && (luz.match(/\+ px \)/g) ?? []).length === 4 && luz.includes('vec4 delta = abs( vVecinos );') && luz.includes('vec4 abre = smoothstep( 0.0, 0.12, delta );') && !/[^h]step\(/.test(luz) &&
    luz.includes('float junta = min( 1.0, dot( vec4( raton ), linea + 0.8 * halo )') && glsl.includes('return conLaLuz( color, rastro.x, rastro.y, ') && glsl.includes('nucleo = max( nucleo, q.w * q.z * exp(') && !/vec3\( 0\.045 \)/.test(glsl)
}
afirmar(luzBien(dibujo) && LUZ_EN_EL_PISO.sombra <= 0.4 && LUZ_EN_EL_PISO.luz === 1, 'por las juntas bajo el mouse sale LUZ (blanca, hacia arriba del papel; antes, tinta): una línea y un halo que entra a la tapa en cada junta, más fuertes donde la rendija se abre; la pared de la rendija, iluminada; el núcleo, sólo alrededor de la cabeza del rastro; la tapa, sombreada (no más de 0,4) para el contraste; sin dientes (nunca más fino que un píxel, con `fwidth`) y sin bandas (sin umbrales: sólo exponenciales y `smoothstep`)', `sombra ${String(LUZ_EN_EL_PISO.sombra)} · halo ${String(LUZ_EN_EL_PISO.halo)} u · núcleo ${String(LUZ_EN_EL_PISO.nucleo.radio)} u`)
controlPositivo('el detector VE el resplandor de tinta de EL ENCASTRE', dibujo.replace('return conLaLuz( color, rastro.x, rastro.y, ', 'return mix( color, vec3( 0.045 ), rastro.x ); conLaLuz( color, rastro.x, rastro.y, '), luzBien)
controlPositivo('  y un núcleo en cada punto del rastro (la hilera de perlas)', dibujo.replace('q.w * q.z * exp(', 'q.z * exp('), luzBien)
controlPositivo('  y una línea sin el píxel mínimo (con dientes)', dibujo.replace('float px = length( fwidth( vPiso.xz ) );', 'float px = 0.0;'), luzBien)
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
titulo('1F · Brillo también en lo automático: con el poder liberado, las ondas, el mar y el pulso dejan salir la luz por las rendijas, más tenue')

// Lo automático: por junta (la diferencia de alto es la misma de los dos lados: continua, sin escalones de bloque), sólo
// donde la rendija está de verdad abierta (el mar quieto no llega), más tenue que el mouse, con el poder (después del
// encastre) y fuera del mar calmo del logo; su sombra, sólo en una banda angosta junto a la junta encendida.
const A = LUZ_EN_EL_PISO.automatico
const automaticoBien = (glsl: string): boolean => {
  const luz = cuerpo(glsl, FIRMA_DE_LA_LUZ)
  const juntas = cuerpo(glsl, 'vec3 conLasJuntas( vec3 color, vec2 xz ) {')
  return luz.includes(`vec4 solo = min( vec4( 1.0 ), ${String(A.ondas)} * energia * smoothstep( ${String(A.abre[0])}, ${String(A.abre[1])}, delta ) );`) &&
    luz.includes('dot( solo, linea + 0.6 * haloDeLaOla )') && luz.includes(`${String(A.sombra)} * min( 1.0, dot( solo, exp( - filo / ( ${String(A.banda)} + px ) ) ) )`) &&
    juntas.includes('return conLaLuz( color, rastro.x, rastro.y, uPoder * fueraDeLaCalma( xz ) );') && glsl.includes('float fueraDeLaCalma( vec2 xz ) {') && !/resplandorDelFinal|ruidoDelPoder/.test(glsl)
}
afirmar(automaticoBien(dibujo) && A.ondas < 1 && A.sombra < LUZ_EN_EL_PISO.sombra && A.abre[0] >= 0.05 && A.banda <= 0.1, 'después del encastre (con el poder) las rendijas que abren las ondas, el mar y el pulso del golpe dejan salir la misma luz, más tenue que bajo el mouse: por junta, sólo donde la rendija está abierta de verdad (el mar quieto no se enciende), con su sombra en una banda angosta junto a la junta; fuera del mar calmo del logo (su borde, encendido, dibujaba un marco de bloques); sin el brillo parejo alrededor del logo ni la banda del pulso (se leían como manchas grises)', `${String(A.ondas)} de la luz · rendija desde ${String(A.abre[0])} u · banda ${String(A.banda)} u`)
controlPositivo('el detector VE la sombra de la tapa entera (el parche en escalones de bloque)', dibujo.replace(`dot( solo, exp( - filo / ( ${String(A.banda)} + px ) ) )`, 'max( max( solo.x, solo.y ), max( solo.z, solo.w ) )'), automaticoBien)
controlPositivo('  y un brillo que no espera al encastre', dibujo.replace('uPoder * fueraDeLaCalma( xz )', 'fueraDeLaCalma( xz )'), automaticoBien)

cerrar('s51-retoque-encastre')
