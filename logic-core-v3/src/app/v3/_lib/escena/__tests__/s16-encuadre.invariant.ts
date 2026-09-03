/**
 * INVARIANTE — V3-E · EL ENCUADRE DEL LOGO EN EL HERO.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s16-encuadre.invariant.ts
 *     npm run test:s16-encuadre
 *
 * ── ⚠️ LA PREMISA DEL SPRINT ESTÁ REFUTADA, Y ÉSTE ES EL NÚMERO ────────────
 *
 * V3-E llegó con *«en el Hero el logo entra por la derecha y queda cortado»*.
 * **No se reproduce.** Con `frameX: 0.68` —el valor con el que el sprint
 * empezó— el logo entraba al **100,00% en las 21 muestras** (siete cuadros por
 * los tres progresos de su ventana) y sin una sola celda de tinta en el anillo
 * exterior de la grilla extendida, que es lo que avisaría que el total está
 * truncado. Es la misma respuesta que `s13b-escena.invariant.ts` §2 y
 * `s10-logo.invariant.ts` §3 ya publicaban; acá se re-mide contra la pose vieja
 * para poder ponerla al lado de la nueva.
 *
 * ── LO QUE SÍ SE MIDIÓ, Y ES LO QUE SE ARREGLÓ ────────────────────────────
 *
 * Dos propiedades del cuadro, las dos falsas con 0,68 y las dos ciertas con
 * 0,5, medidas en el cuadro que el humano mira (16:9) y en p=0:
 *
 *   1. **El eje óptico apuntaba AFUERA del logo.** `frameX` no corre el logo
 *      dentro de un cuadro fijo: **rota la cámara**. Con 0,68 el eje —que es
 *      x=0 por definición— caía **0,0953 a la izquierda del borde de la caja**,
 *      o sea que la cámara no apuntaba a su propio sujeto sino a piso vacío. En
 *      grados son **12,834° de desvío** sobre un medio campo de 29,272°, y eso
 *      es exactamente el pedazo de SALA que el cuadro dejaba de mostrar del
 *      lado del logo: **16,439° en vez de 29,272°**. «No se ve toda la escena
 *      con el logo» es una frase sobre la sala, y ése es su número.
 *   2. **El margen derecho era el más chico de los tres que aprietan.** En
 *      unidades de ancho de cuadro: derecho 0,1317, inferior 0,1583, superior
 *      0,1849. Un logo que entra entero pero con el aire más chico del cuadro
 *      contra un borde se lee cortado.
 *
 * **0,5 es el valor más grande que cumple las dos**, y las dos cruzan entre
 * 0,51 y 0,52 (§3, con una grilla de 1400 × 1030): 0,51 quedaría a menos de
 * media celda del borde, así que se elige 0,50, que cumple con margen.
 *
 * ── LA VENTANA DE LA MEDICIÓN, declarada ──────────────────────────────────
 *
 * - **La cámara es la de producción**, no la del arnés: `camaraDelCuadro.ts`
 *   compone `cameraAt` con el recorrido de `encuadre.ts`. Todo lo demás que
 *   `s10-logo.ts` declara en su cabecera se hereda tal cual: la caja del arnés
 *   (7,168) no es la del mesh medido (6,863), y no se modelan partículas,
 *   sombra proyectada ni especular.
 * - **Los tres anchos de la instrucción comparten aspecto** (1,7778), así que
 *   devuelven la misma caja: la proyección depende del aspecto y no del ancho.
 *   Se miden los tres igual, y se agregan los cuatro cuadros de `s10-logo` para
 *   cubrir el rango entero de aspectos que el repo declara (1,139 a 1,778).
 * - **El contraste de ANTES no se puede re-derivar acá**, y se dice por qué:
 *   `muestrearCuadro` fija el track del módulo, así que no acepta una pose
 *   hipotética como sí la acepta `muestrearLogo`. La cifra vieja es la que
 *   `npm run test:s8-tinta` imprimió antes de la edición, citada como tal en
 *   §5; la de hoy se mide acá con la misma función que aquel invariante usa.
 *
 * El banco —cómo se mide y la lista de pendientes— está en
 * `s16-encuadre-soporte.ts`. Acá sólo se afirma.
 */

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'
import { muestrearLogo } from './s10-logo'
import { ESCENA_REAL, contrasteSobreElFondo, fraccionDentro } from './s10-logo-lectura'
import { CUADROS_DE_V3B, cuantoSeMovio, destinoEn } from './s13b-encuadre'
// prettier-ignore
import { FRAME_X_ANTES, FRAME_X_HOY, PENDIENTES, cumpleElCriterio, derechaNoAprieta, desvioDelEje, ejeAdentro, lineasDeLaBarrida, lineasDeLaTabla, medioCampo, medir, pistaCon, sigueAbierto, tabla, type Pendiente } from './s16-encuadre-soporte'

/** El cuadro que el humano mira. Los tres anchos comparten esta relación. */
const DEL_HUMANO = CUADROS_DE_V3B[1]
/** AA y AAA para texto normal. */
const AA = 4.5
const AAA = 7

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA PREMISA — «el logo queda cortado» NO se reproduce con 0,68')

const ANTES = tabla(FRAME_X_ANTES)
afirmar(
  ANTES.every((f) => f.dentro >= 1 && !f.toca),
  `con \`frameX: ${FRAME_X_ANTES}\` el logo YA entraba ENTERO en las ${ANTES.length} muestras`,
  'siete cuadros × tres progresos · 100,00% dentro · ninguna celda de tinta en el anillo de la grilla extendida, que es lo que avisaría que el total está truncado',
)
controlPositivo(
  'y el medidor sabe ver un logo que se sale: la pose del diferencial no da 100%',
  0.75,
  (p: number) =>
    fraccionDentro(muestrearLogo(p, DEL_HUMANO.aspecto, ESCENA_REAL, 300, 220, 2.6)) >= 1,
)

const antes16 = medir(pistaCon(FRAME_X_ANTES), DEL_HUMANO, 0)
afirmar(
  !ejeAdentro(antes16) && !derechaNoAprieta(antes16),
  'LO QUE SÍ FALLABA, y son dos cosas: la puntería y cuál era el margen más chico',
  `el eje óptico caía ${antes16.x0.toFixed(4)} AFUERA de la caja · aires en ancho de cuadro: izq ${antes16.izquierda.toFixed(4)} · der ${antes16.derecha.toFixed(4)} · abajo ${antes16.abajo.toFixed(4)} · arriba ${antes16.arriba.toFixed(4)}`,
)

const CAMPO = medioCampo(DEL_HUMANO)
const desvioAntes = desvioDelEje(FRAME_X_ANTES, DEL_HUMANO)
const desvioHoy = desvioDelEje(FRAME_X_HOY, DEL_HUMANO)
afirmar(
  desvioAntes > desvioHoy && desvioHoy > 0,
  'LA SALA QUE SE PIERDE DEL LADO DEL LOGO, que es la frase del dueño en grados',
  `desvío del eje ${desvioAntes.toFixed(3)}° → ${desvioHoy.toFixed(3)}° sobre un medio campo de ${CAMPO.toFixed(3)}° · la sala visible de ese lado sube de ${(CAMPO - desvioAntes).toFixed(3)}° a ${(CAMPO - desvioHoy).toFixed(3)}°, un ${((100 * (desvioAntes - desvioHoy)) / (CAMPO - desvioAntes)).toFixed(1)}% más`,
)
controlPositivo(
  'y el desvío no es una constante disfrazada: con `frameX` en 0 la cámara apunta al logo y da exactamente 0°',
  0,
  (fx: number) => Math.abs(desvioDelEje(fx, DEL_HUMANO)) > 1e-9,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL ENCUADRE DE HOY — las 21 muestras con el valor que el archivo declara')

const HOY = tabla(FRAME_X_HOY)
for (const linea of lineasDeLaTabla(HOY)) console.log(`  ${linea}`)
afirmar(
  HOY.every((f) => f.dentro >= 1 && !f.toca),
  `con \`frameX: ${FRAME_X_HOY}\` el logo SIGUE entrando entero en las ${HOY.length} muestras`,
  `el margen derecho más chico de las 21 es ${Math.min(...HOY.map((f) => f.derecha)).toFixed(4)} del ancho, en ${HOY.reduce((a, b) => (b.derecha < a.derecha ? b : a)).v.etiqueta} — con 0,68 era ${Math.min(...ANTES.map((f) => f.derecha)).toFixed(4)}`,
)

const hoy16 = medir(pistaCon(FRAME_X_HOY), DEL_HUMANO, 0)
afirmar(
  ejeAdentro(hoy16),
  'EL EJE ÓPTICO VUELVE A APUNTAR AL LOGO: cae adentro de su caja',
  `x0 ${antes16.x0.toFixed(4)} → ${hoy16.x0.toFixed(4)} · el eje es x=0 por definición, así que un x0 negativo ES el eje adentro`,
)
afirmar(
  derechaNoAprieta(hoy16),
  '  y el margen derecho pasa de ser el MÁS CHICO a ser el MÁS GRANDE de los tres que aprietan',
  `der ${antes16.derecha.toFixed(4)} → ${hoy16.derecha.toFixed(4)} · abajo ${antes16.abajo.toFixed(4)} → ${hoy16.abajo.toFixed(4)} · arriba ${antes16.arriba.toFixed(4)} → ${hoy16.arriba.toFixed(4)}`,
)
controlPositivo(
  'el criterio del eje no da verde contra cualquier valor: con `frameX` 1 el eje queda afuera',
  1,
  (fx: number) => ejeAdentro(medir(pistaCon(fx), DEL_HUMANO, 0)),
)
controlPositivo(
  'y el del margen tampoco: con `frameX` 1 el derecho vuelve a ser el más chico',
  1,
  (fx: number) => derechaNoAprieta(medir(pistaCon(fx), DEL_HUMANO, 0)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · POR QUÉ 0,5 — la barrida, y dónde cruzan las dos condiciones')

for (const linea of lineasDeLaBarrida([0.4, 0.44, 0.48, 0.5, 0.54, 0.58, 0.62, 0.68], DEL_HUMANO)) {
  console.log(`  ${linea}`)
}

/**
 * ⚠ **EL CRUCE SE BUSCA CON UNA GRILLA MÁS FINA, y por una razón aritmética.**
 * La grilla de publicación tiene celdas de 0,01733 de coordenada de cuadro y el
 * borde de la caja se mueve ~0,0058 por centésima de `frameX`: o sea que tres
 * valores consecutivos caen en la MISMA celda y el barrido de arriba no puede
 * separarlos. Con 1400 × 1030 la celda baja a 0,00371 y los tres se separan.
 */
const FINO = { columnas: 1400, filas: 1030, celda: (2 * 2.6) / 1400 }
const cumpleFino = (fx: number): boolean =>
  cumpleElCriterio(medir(pistaCon(fx), DEL_HUMANO, 0, FINO.columnas, FINO.filas))
const fino = [0.5, 0.51, 0.52].map((fx) => ({
  fx,
  a: medir(pistaCon(fx), DEL_HUMANO, 0, FINO.columnas, FINO.filas),
}))
for (const { fx, a } of fino) {
  console.log(
    `  fino ${fx.toFixed(2)}  x0 ${a.x0.toFixed(6).padStart(9)}  der ${a.derecha.toFixed(6)}  ` +
      `arriba ${a.arriba.toFixed(6)}  ${cumpleElCriterio(a) ? 'cumple' : 'NO cumple'}`,
  )
}
afirmar(
  cumpleFino(FRAME_X_HOY) && !cumpleFino(0.52),
  `${FRAME_X_HOY} CUMPLE LAS DOS Y 0,52 NO: el cruce cae entre 0,51 y 0,52`,
  `0,51 cumple por ${Math.abs(fino[1].a.x0).toFixed(6)} de coordenada, menos de media celda (${(FINO.celda / 2).toFixed(6)}): por eso el valor elegido es ${FRAME_X_HOY} y no 0,51`,
)
afirmar(
  CHOREO_KEYFRAMES[0].name === 'hero' && FRAME_X_HOY === 0.5,
  '  y el valor que el archivo declara es el que se midió: no hay una segunda fuente',
  `\`CHOREO_KEYFRAMES[0]\` es «${CHOREO_KEYFRAMES[0].name}» con frameX ${FRAME_X_HOY}`,
)
controlPositivo(
  'la barrida no dice que sí a todo: con 0,68 el criterio compuesto es falso',
  FRAME_X_ANTES,
  cumpleFino,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL DESTINO DEL PRELOADER — cuánto se movió, y que se sigue derivando')

const POSE_ANTES = { ...CHOREO_KEYFRAMES[0].pose, frameX: FRAME_X_ANTES }
const CORRIMIENTOS = CUADROS_DE_V3B.map((v) => {
  const antes = destinoEn(v, POSE_ANTES)
  const hoy = destinoEn(v)
  if (antes === null || hoy === null) throw new Error(`sin destino en ${v.etiqueta}`)
  return { v, antes, hoy, delta: cuantoSeMovio(antes, hoy) }
})
for (const c of CORRIMIENTOS) {
  console.log(
    `  ${c.v.etiqueta.padEnd(11)} centro (${c.antes.centroX.toFixed(1)}, ${c.antes.centroY.toFixed(1)}) → ` +
      `(${c.hoy.centroX.toFixed(1)}, ${c.hoy.centroY.toFixed(1)}) px · tinta ` +
      `${c.antes.anchoDeTinta.toFixed(1)}×${c.antes.altoDeTinta.toFixed(1)} → ` +
      `${c.hoy.anchoDeTinta.toFixed(1)}×${c.hoy.altoDeTinta.toFixed(1)} · se movió ${c.delta.toFixed(1)} px`,
  )
}
afirmar(
  CORRIMIENTOS.every((c) => c.delta > 0),
  'EL DESTINO SE MOVIÓ, y ésta es la cifra que el relevo del preloader tiene que seguir',
  CORRIMIENTOS.map((c) => `${c.v.etiqueta}: ${c.delta.toFixed(1)} px`).join(' · '),
)
afirmar(
  SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose &&
    CORRIMIENTOS.every((c) => cuantoSeMovio(c.hoy, destinoEn(c.v, CHOREO_KEYFRAMES[0].pose)!) === 0),
  '  y lo sigue: `scene-framing.ts` proyecta el keyframe vivo, no una constante escrita',
  'proyectar `SCENE_ENTRY_POSE` y proyectar `CHOREO_KEYFRAMES[0].pose` dan el mismo píxel en los tres cuadros — el relevo al bit lo mide `introLanding.invariant.ts`',
)
controlPositivo(
  'el comparador de destinos no devuelve cero contra cualquier par: ve el corrimiento de arriba',
  CORRIMIENTOS[1],
  (c: (typeof CORRIMIENTOS)[number]) => cuantoSeMovio(c.antes, c.hoy) === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL CONTRASTE DE LA TINTA DEL HERO SOBRE LA ESCENA, con el encuadre nuevo')

const VENTANA_DEL_HERO = [0, 0.03125, 0.0625, 0.09375, 0.125]
const CONTRASTES = VENTANA_DEL_HERO.map((p) => ({ p, c: contrasteSobreElFondo(p) }))
for (const { p, c } of CONTRASTES) {
  console.log(`  p=${p.toFixed(5)}  peor píxel del cuadro: ${c.toFixed(2)}:1`)
}
const peorDeLaVentana = Math.min(...CONTRASTES.map((x) => x.c))
afirmar(
  CONTRASTES[0].c >= AAA,
  'LA TINTA PASA AA Y AAA sobre la escena real en p=0 con el encuadre nuevo',
  `${CONTRASTES[0].c.toFixed(2)}:1 contra ${AA}:1 de AA y ${AAA}:1 de AAA — era 9,73:1 con 0,68, citado de \`test:s8-tinta\` §2 corrido antes de la edición`,
)
afirmar(
  peorDeLaVentana >= AA,
  '  y en toda la ventana en que el Hero se ve, que es donde la pregunta existe',
  `peor de [0 · 0,125]: ${peorDeLaVentana.toFixed(2)}:1 — la misma cifra que publicaba §4 de \`s8-tinta\` con 0,68`,
)
controlPositivo(
  'el medidor de contraste sabe reprobar: al final del recorrido la misma escena no llega a AA',
  1,
  (p: number) => contrasteSobreElFondo(p) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LO QUE V3-E DEJÓ FUERA DE LA ZONA DE ESTE FRENTE, detectado y con su arreglo')

const abiertos = PENDIENTES.filter(sigueAbierto)
afirmar(
  PENDIENTES.length > 0 && abiertos.length + PENDIENTES.filter((p) => !sigueAbierto(p)).length === PENDIENTES.length,
  `los ${new Set(PENDIENTES.map((p) => p.archivo)).size} archivos de la lista existen y se leen: la lista no se vacía por no encontrarlos`,
  `${PENDIENTES.length} pendientes declarados · ${abiertos.length} siguen abiertos · ${PENDIENTES.length - abiertos.length} ya se aplicaron`,
)
controlPositivo(
  'y el detector no encuentra una marca que no está: no da «abierto» contra cualquier cosa',
  { ...PENDIENTES[0], marca: 'esta cadena no existe en ningún fuente del repo' },
  (p: Pendiente) => sigueAbierto(p),
)
for (const p of abiertos) {
  console.log(`  🔴 ${p.archivo}`)
  console.log(`     síntoma: ${p.sintoma}`)
  console.log(`     arreglo: ${p.arreglo}`)
}

cerrar('s16-encuadre.invariant')
