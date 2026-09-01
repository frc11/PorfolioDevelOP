/**
 * INVARIANTE — EL ORDEN ENTRE LOS DOS `rAF` (§7.34), medido hasta donde se puede
 * medir sin navegador y declarado como hueco donde no.
 *
 *     npx tsx src/app/v3/_lib/__tests__/s10-raf.invariant.ts
 *
 * ── ⚠️ QUÉ CAMBIA ESTE ARCHIVO Y QUÉ NO ────────────────────────────────────
 *
 * **NO cambia `CUADROS_DE_REANUDACION`.** Es un valor de la escena y este sprint
 * tiene prohibido mover uno. Lo que cambia es el ESTADO EPISTÉMICO de la razón
 * que lo sostiene: §7.34 decía *«nada ordena uno respecto del otro»* y lo
 * declaraba **deducido leyendo el código, no medido**. Acá el orden queda
 * derivado eslabón por eslabón del código INSTALADO, con un control positivo por
 * eslabón, y la conclusión es la contraria: **el orden de registro está
 * determinado y r3f va primero.**
 *
 * **La decisión de bajar la constante a 1 es del humano y no de este archivo.**
 * Un instrumento publica el número; no toma la decisión que el número habilita.
 *
 * ── LA VARA, y por qué la conclusión no es «se midió» ──────────────────────
 *
 * Lo que se afirma es una propiedad del CÓDIGO: en qué orden quedan registradas
 * las dos callbacks. Lo que NO se afirma es que el planificador del navegador
 * las despache así en una corrida real — eso pide una traza con la pestaña AL
 * FRENTE, y con la pestaña ocluida el navegador ni siquiera despacha `rAF`
 * (`CLAUDE.md`), así que una corrida automatizada que no lo garantice mediría
 * cero por construcción. Va como `noCorre`, con su motivo.
 */

import { CUADROS_DE_REANUDACION, MARGEN_DE_REANUDACION } from '../escena/visibilidad'

import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from './afirmar'
import {
  cadenaDeRegistro,
  configureAplicaElFrameloop,
  efectoDeLayoutSinDependencias,
  elFrameloopSaleDeLaFase,
  elPulsoEsPasivo,
  elStoreInvalidaEnCadaCambio,
  fuenteDelCanvas,
  fuenteDelLazo,
  invalidateArrancaElLazo,
  leerRepo,
  loopSeReregistraPrimero,
  probeStagePasaElFrameloop,
  setFrameloopNoPideCuadro,
  versionDeR3f,
} from './s10-raf'

const LAZO = fuenteDelLazo()
const CANVAS = fuenteDelCanvas()
const ESCENA = leerRepo('src/app/v3/_lib/escena/EscenaDelHome.tsx')
const STAGE = leerRepo('src/app/v3/_lib/escena/ProbeStage.tsx')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LO QUE SE ESTÁ LEYENDO — la conclusión vale para ESTA versión')

console.log(`  @react-three/fiber ${versionDeR3f()} · el lazo son ${LAZO.length} caracteres de bundle`)
afirmar(LAZO.length > 1000, 'el bundle del lazo de r3f se encontró por FORMA, no por su nombre con hash')
afirmar(CANVAS.includes('function CanvasImpl('), '  y el módulo del <Canvas> también está en disco')
afirmar(ESCENA.length > 1000 && STAGE.length > 1000, '  y los dos fuentes del repo que arman la cadena')
controlPositivo('el lector de eslabones no da por bueno un fuente vacío', '', (f: string) => elStoreInvalidaEnCadaCambio(f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LOS SEIS ESLABONES DEL LADO DE r3f — cómo se registra SU rAF')

/** El `<Canvas>` reconfigura en cada render, y lo hace en la fase de LAYOUT. */
afirmar(
  efectoDeLayoutSinDependencias(CANVAS),
  '`CanvasImpl` corre `run()` desde un `useIsomorphicLayoutEffect` SIN arreglo de dependencias: reconfigura en cada render, en la fase de layout',
)
controlPositivo(
  'el detector no confunde un efecto PASIVO con uno de layout',
  'React.useEffect(() => {\n    run();\n  });',
  efectoDeLayoutSinDependencias,
)
controlPositivo(
  '  ni deja pasar el mismo efecto con arreglo de dependencias, que ya no correría en cada render',
  'useIsomorphicLayoutEffect(() => {\n    run();\n  }, [frameloop]);\n  otro(() => {\n  });',
  efectoDeLayoutSinDependencias,
)

afirmar(
  configureAplicaElFrameloop(LAZO),
  '`configure()` aplica el `frameloop` comparándolo contra el estado — y se evalúa SÍNCRONO: el `await` de `run()` sólo difiere lo que viene DESPUÉS',
)
controlPositivo('  y el detector ve un `configure` que ya no lo aplica', 'if (state.dpr !== dpr) state.setDpr(dpr);', configureAplicaElFrameloop)

/** El eslabón que da vuelta la intuición: `setFrameloop` NO pide el cuadro. */
afirmar(
  setFrameloopNoPideCuadro(LAZO),
  '`setFrameloop` NO pide un cuadro: sólo reinicia el reloj y escribe el estado — quien lo pide es otro',
)
controlPositivo(
  '  y el detector VE un `setFrameloop` que sí lo pidiera',
  "setFrameloop: (frameloop = 'always') => {\n  requestAnimationFrame(loop);\n},",
  setFrameloopNoPideCuadro,
)

afirmar(
  elStoreInvalidaEnCadaCambio(LAZO),
  'quien pide el cuadro es `rootStore.subscribe(state => invalidate(state))`, o sea CUALQUIER escritura del estado — incluida la de `setFrameloop`',
)
controlPositivo('  y el detector ve un store que ya no invalida', 'rootStore.subscribe(state => noop(state));', elStoreInvalidaEnCadaCambio)

afirmar(
  invalidateArrancaElLazo(LAZO),
  '`invalidate` se sale por su guarda mientras el lazo es `never`, y con `always` ya escrito hace `running = true; requestAnimationFrame(loop)` ← REGISTRO 1',
)
controlPositivo(
  '  y el detector ve un `invalidate` que ya no arranca el lazo',
  "function invalidate(state, frames = 1) {\n  if (state.frameloop === 'never') return;\n  state.internal.frames = 1;\n}",
  invalidateArrancaElLazo,
)

/** Y el que sostiene el orden una vez arrancado, cuadro tras cuadro. */
afirmar(
  loopSeReregistraPrimero(LAZO),
  '`loop()` hace `frame = requestAnimationFrame(loop)` como su PRIMERA sentencia: ya corriendo, r3f queda anotado para el cuadro siguiente antes de correr un solo efecto',
)
controlPositivo(
  '  y el detector ve un `loop` que se re-registra al final',
  'function loop(timestamp) {\n  running = true;\n  frame = requestAnimationFrame(loop);\n}',
  loopSeReregistraPrimero,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LOS TRES ESLABONES DEL LADO DEL REPO — cómo se registra EL PULSO')

afirmar(
  elPulsoEsPasivo(ESCENA),
  'el pulso de la reanudación vive en un `useEffect` (PASIVO) de `EscenaDelHome`, no en uno de layout ← REGISTRO 2',
)
controlPositivo(
  'el detector ve el mismo pulso movido a un efecto de LAYOUT',
  "useLayoutEffect(() => {\n    if (estado.fase !== 'reanudando') return",
  elPulsoEsPasivo,
)

afirmar(
  elFrameloopSaleDeLaFase(ESCENA) && probeStagePasaElFrameloop(STAGE),
  'el `frameloop` del canvas sale de la MISMA fase que arma el pulso, y `ProbeStage` lo pasa sin reinterpretarlo: un solo render, un solo commit',
)
controlPositivo('  y el detector ve un frameloop clavado a mano', "frameloop={'always'}", elFrameloopSaleDeLaFase)
controlPositivo('  y uno que ProbeStage decidiera por su cuenta', 'frameloop={suspendido ? "never" : "always"}', probeStagePasaElFrameloop)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA CONCLUSIÓN — el orden SÍ está determinado, y r3f va primero')

const cadena = cadenaDeRegistro(LAZO, CANVAS, ESCENA, STAGE)
for (const [nombre, ok] of cadena.eslabones) console.log(`    ${ok ? '✓' : '✗'} ${nombre}`)

afirmarIgual(cadena.cortados, [], `los ${cadena.eslabones.length} eslabones de la cadena de registro cierran`)
afirmar(
  cadena.determinado,
  'REGISTRO 1 (layout, r3f) precede a REGISTRO 2 (pasivo, el pulso) en el MISMO commit, y `rAF` despacha en orden de registro: el orden está DETERMINADO',
)
controlPositivo(
  'la cadena NO se declara determinada con un fuente de r3f equivocado',
  'export function loop() { /* otra cosa */ }',
  (falso: string) => cadenaDeRegistro(falso, CANVAS, ESCENA, STAGE).determinado,
)
controlPositivo(
  '  ni con el pulso del repo movido de fase',
  "useLayoutEffect(() => {\n    if (estado.fase !== 'reanudando') return",
  (falso: string) => cadenaDeRegistro(LAZO, CANVAS, falso, STAGE).determinado,
)

console.log(
  '  ⚠️ HALLAZGO PARA §7.34: la razón escrita para `CUADROS_DE_REANUDACION = 2` es «nada ordena uno\n' +
    '     respecto del otro». Sobre el código instalado eso NO se sostiene: el orden queda determinado\n' +
    '     y r3f corre PRIMERO, así que UN cuadro alcanzaría. La constante NO se movió — la decisión es\n' +
    '     del humano y pide la traza del §5 antes de tomarse.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL HUECO — lo que este instrumento NO puede contestar')

noCorre(
  'que el planificador del navegador DESPACHE las dos callbacks en ese orden en una corrida real',
  'pide una traza con la pestaña AL FRENTE: con la pestaña ocluida el navegador no despacha `rAF` y la medición da cero por construcción (`CLAUDE.md`). Lo que se afirma acá es el orden de REGISTRO, que es una propiedad del código',
)
noCorre(
  'en qué cuadro exacto React vacía los efectos PASIVOS del commit',
  'el planificador de React puede vaciarlos en el mismo cuadro o en el siguiente. Las dos ramas dejan a r3f primero —en la misma, por orden de registro; en la siguiente, porque `loop` ya se re-registró—, así que la conclusión no depende de esto; el número de milisegundos, sí',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LO QUE SÍ QUEDA CUSTODIADO — el margen cubre la reanudación')

/**
 * `visibilidad.ts` deriva `MARGEN_DE_REANUDACION` de lo que tiene que DURAR: los
 * cuadros de la reanudación al ritmo de scroll que se declara cubierto — **3,75
 * pantallas por segundo a 60 Hz**. Se afirma la desigualdad y no la igualdad a
 * propósito: bajar `CUADROS_DE_REANUDACION` a 1 dejaría el margen holgado, que
 * no es una falla; **subirlo sin subir el margen sí lo es**, y eso es lo único
 * que este chequeo tiene que ver.
 */
const RITMO_CUBIERTO_PANTALLAS_POR_SEGUNDO = 3.75
const HZ = 60
const necesario = CUADROS_DE_REANUDACION * (RITMO_CUBIERTO_PANTALLAS_POR_SEGUNDO / HZ)
afirmar(
  MARGEN_DE_REANUDACION >= necesario,
  `el margen cubre los ${CUADROS_DE_REANUDACION} cuadros al ritmo declarado (${RITMO_CUBIERTO_PANTALLAS_POR_SEGUNDO} pantallas/s a ${HZ} Hz)`,
  `${MARGEN_DE_REANUDACION} ≥ ${necesario.toFixed(4)} pantallas`,
)
controlPositivo(
  'el chequeo del margen ve una reanudación de 3 cuadros que ya no entra',
  3,
  (c: number) => MARGEN_DE_REANUDACION >= c * (RITMO_CUBIERTO_PANTALLAS_POR_SEGUNDO / HZ),
)
console.log(`  CUADROS_DE_REANUDACION = ${CUADROS_DE_REANUDACION} — sin tocar, y el porqué de arriba es lo que cambió`)

cerrar('s10-raf.invariant')
