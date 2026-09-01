/**
 * LOS DETECTORES DEL ORDEN DE LOS DOS `rAF` — la cadena de registro, leída del
 * código instalado.
 *
 * ── LA PREGUNTA (§7.34 de `DIRECCION-ESCENA.md`) ───────────────────────────
 *
 * `CUADROS_DE_REANUDACION` valía 2 y no 1 «aunque por la matemática alcanzara
 * uno» (SITIO-S11 lo bajó a 1, citando lo que este módulo mide),
 * porque *«el pulso que despacha "pintado" vive en un `rAF` del documento
 * (`EscenaDelHome`) y el lazo de r3f en el suyo, y **nada ordena uno respecto
 * del otro**»*. Ese orden **se dedujo leyendo el código y no se midió**, y §7.34
 * lo dejó anotado: si alguien lo mide y r3f siempre corre primero, la constante
 * baja a 1. **Se midió acá, y bajó.**
 *
 * ── QUÉ SE PUEDE CONTESTAR SIN NAVEGADOR, Y QUÉ NO ─────────────────────────
 *
 * El navegador corre las callbacks de `requestAnimationFrame` **en orden de
 * registro** dentro de un mismo cuadro (HTML, *run the animation frame
 * callbacks*: itera la lista en orden). Así que la pregunta «¿quién corre
 * primero?» se parte en dos, y sólo una necesita un navegador:
 *
 *   · **¿EN QUÉ MOMENTO SE REGISTRA CADA UNO, Y ESE MOMENTO ESTÁ ORDENADO?**
 *     Es una propiedad del código instalado y se contesta LEYENDO. Es lo que
 *     este módulo detecta, eslabón por eslabón.
 *   · **¿El planificador del navegador respeta eso en una corrida real?** Pide
 *     una traza con la pestaña AL FRENTE. Queda declarado como hueco: con la
 *     pestaña ocluida el navegador ni siquiera despacha `rAF`, así que una
 *     medición hecha así valdría cero por construcción (`CLAUDE.md`).
 *
 * ── LA CADENA, tal como el código la deja ──────────────────────────────────
 *
 *   1. `setEstado` lleva la fase a `reanudando`. Un solo render: `frameloop` y
 *      el efecto del pulso salen del MISMO `estado`.
 *   2. **Fase de LAYOUT** — el `useIsomorphicLayoutEffect` del `<Canvas>` de r3f
 *      corre **sin arreglo de dependencias**, o sea en cada render, y llama a
 *      `run()`, cuyo `await root.current.configure({… frameloop …})` evalúa
 *      `configure` de forma SÍNCRONA (el `await` sólo difiere lo que viene
 *      después). `configure` hace `if (state.frameloop !== frameloop)
 *      state.setFrameloop(frameloop)`.
 *   3. `setFrameloop` **no pide un cuadro**: sólo hace `set(() => ({frameloop}))`.
 *      Quien lo pide es `rootStore.subscribe(state => invalidate(state))`, que
 *      corre por ese `set`. Con `frameloop` ya en `'always'`, `invalidate` no se
 *      sale por su guarda de `'never'` y, como el lazo estaba detenido, hace
 *      `running = true; requestAnimationFrame(loop)`. ← **REGISTRO 1**
 *   4. **Fase PASIVA** — recién ahí corre el `useEffect` de `EscenaDelHome` que
 *      registra el pulso con `requestAnimationFrame`. ← **REGISTRO 2**
 *
 * React corre los efectos de LAYOUT antes que los PASIVOS del mismo commit;
 * `rAF` corre en orden de registro. **Conclusión estática: r3f va primero.**
 *
 * ⚠️ **Y el eslabón que la sostiene una vez arrancado el lazo:** `loop()` hace
 * `frame = requestAnimationFrame(loop)` **como su PRIMERA sentencia**, antes de
 * correr un solo efecto. Una vez corriendo, r3f queda registrado para el cuadro
 * siguiente antes de que ninguna callback pueda registrar nada.
 *
 * ⚠️ **Este archivo NO termina en `.invariant.ts` a propósito** (regla 14): los
 * detectores puros van aparte del instrumento que los afirma, para que las
 * afirmaciones puedan correr la MISMA función contra una entrada equivocada.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s5-archivos'

const R3F = 'node_modules/@react-three/fiber'

export const leerRepo = (relativo: string): string =>
  readFileSync(path.join(RAIZ, relativo), 'utf8')

/** La versión instalada de r3f. Toda conclusión de acá vale para ELLA. */
export function versionDeR3f(): string {
  const crudo: unknown = JSON.parse(leerRepo(`${R3F}/package.json`))
  if (typeof crudo === 'object' && crudo !== null) {
    const v = (crudo as { version?: unknown }).version
    if (typeof v === 'string') return v
  }
  return '(sin versión)'
}

/**
 * El bundle donde vive el lazo. Su nombre lleva un hash de contenido
 * (`events-b389eeca.esm.js`), así que se busca por FORMA y no por nombre — la
 * misma lección que D2 (§7.30): un nombre generado no se escribe a mano.
 */
export function fuenteDelLazo(): string {
  const dist = path.join(RAIZ, R3F, 'dist')
  const archivo = readdirSync(dist).find((f) => /^events-.*\.esm\.js$/.test(f))
  if (archivo === undefined) return ''
  return readFileSync(path.join(dist, archivo), 'utf8')
}

export const fuenteDelCanvas = (): string => leerRepo(`${R3F}/dist/react-three-fiber.esm.js`)

// ── Los cinco eslabones, cada uno como un predicado sobre un fuente ─────────

/**
 * 1 · El efecto del `<Canvas>` es de LAYOUT y corre en CADA render.
 *
 * Se busca la FORMA del bloque y no una indentación: dónde abre, dónde cierra, y
 * si ese cierre lleva arreglo de dependencias. Un `}, [ … ]);` antes del `});`
 * significaría que el efecto dejó de correr en cada render, y con eso el
 * `setFrameloop` podría no caer en el commit que arma el pulso.
 */
export function efectoDeLayoutSinDependencias(canvas: string): boolean {
  const desde = canvas.indexOf('useIsomorphicLayoutEffect(() => {')
  if (desde < 0) return false
  const sinDeps = canvas.indexOf('\n  });', desde)
  const conDeps = canvas.indexOf('\n  }, [', desde)
  const fin = sinDeps < 0 ? conDeps : conDeps < 0 ? sinDeps : Math.min(sinDeps, conDeps)
  if (fin < 0 || fin === conDeps) return false
  return canvas.slice(desde, fin).includes('run();')
}

/** 2 · `configure` recibe `frameloop` y lo aplica comparándolo con el estado. */
export const configureAplicaElFrameloop = (lazo: string): boolean =>
  /if \(state\.frameloop !== frameloop\) state\.setFrameloop\(frameloop\);/.test(lazo)

/** 3 · `setFrameloop` NO pide un cuadro por su cuenta: sólo escribe el estado. */
export function setFrameloopNoPideCuadro(lazo: string): boolean {
  const desde = lazo.indexOf("setFrameloop: (frameloop = 'always') => {")
  if (desde < 0) return false
  const cuerpo = lazo.slice(desde, lazo.indexOf('},', desde))
  return !/requestAnimationFrame|invalidate\(/.test(cuerpo)
}

/** 4 · Quien pide el cuadro es la suscripción del store, en cada `set`. */
export const elStoreInvalidaEnCadaCambio = (lazo: string): boolean =>
  /rootStore\.subscribe\(state => invalidate\(state\)\);/.test(lazo)

/** 5 · Y `invalidate` arranca el lazo con un `rAF` cuando estaba detenido. */
export function invalidateArrancaElLazo(lazo: string): boolean {
  const desde = lazo.indexOf('function invalidate(state, frames = 1) {')
  if (desde < 0) return false
  const cuerpo = lazo.slice(desde, desde + 1400)
  return (
    /state\.frameloop === 'never'\) return;/.test(cuerpo) &&
    /if \(!running\) \{\s*running = true;\s*requestAnimationFrame\(loop\);/.test(cuerpo)
  )
}

/** 6 · Y una vez corriendo, `loop` se re-registra ANTES de correr nada. */
export function loopSeReregistraPrimero(lazo: string): boolean {
  const desde = lazo.indexOf('function loop(timestamp) {')
  if (desde < 0) return false
  const primera = lazo.slice(desde).split('\n')[1]
  return primera.trim() === 'frame = requestAnimationFrame(loop);'
}

// ── Y los dos eslabones del lado del repo ──────────────────────────────────

/** El pulso vive en un `useEffect` (PASIVO), no en uno de layout. */
export function elPulsoEsPasivo(escena: string): boolean {
  const desde = escena.indexOf("if (estado.fase !== 'reanudando') return")
  if (desde < 0) return false
  const antes = escena.slice(Math.max(0, desde - 200), desde)
  return /useEffect\(\(\) => \{\s*$/.test(antes) && !antes.includes('useLayoutEffect')
}

/** El `frameloop` del canvas sale de la MISMA fase que arma el pulso. */
export const elFrameloopSaleDeLaFase = (escena: string): boolean =>
  /frameloop=\{frameloopDe\(estadoDeLaEscena\)\}/.test(escena)

/** …y `ProbeStage` lo pasa al `<Canvas>` sin reinterpretarlo. */
export const probeStagePasaElFrameloop = (stage: string): boolean =>
  /frameloop=\{frameloop\}/.test(stage)

// ── La conclusión, derivada de los eslabones y no escrita ───────────────────

export interface Cadena {
  /** Eslabón por eslabón, con su nombre, para que el rojo diga cuál se cortó. */
  readonly eslabones: readonly (readonly [string, boolean])[]
  /** Los que NO se cumplen. Vacío = la cadena cierra. */
  readonly cortados: readonly string[]
  /** ¿El orden de registro queda determinado por el código leído? */
  readonly determinado: boolean
}

/**
 * La cadena entera, con los tres fuentes por parámetro para que se la pueda
 * correr contra uno equivocado. Un eslabón cortado no es «no sé»: es que el
 * código instalado dejó de sostener la deducción y la conclusión no vale.
 */
export function cadenaDeRegistro(lazo: string, canvas: string, escena: string, stage: string): Cadena {
  const eslabones: readonly (readonly [string, boolean])[] = [
    ['el efecto del <Canvas> es de LAYOUT y corre en cada render', efectoDeLayoutSinDependencias(canvas)],
    ['configure() aplica el frameloop comparándolo con el estado', configureAplicaElFrameloop(lazo)],
    ['setFrameloop NO pide un cuadro por su cuenta', setFrameloopNoPideCuadro(lazo)],
    ['el store invalida en cada cambio de estado', elStoreInvalidaEnCadaCambio(lazo)],
    ['invalidate arranca el lazo con un rAF si estaba detenido', invalidateArrancaElLazo(lazo)],
    ['loop se re-registra como su PRIMERA sentencia', loopSeReregistraPrimero(lazo)],
    ['el pulso del documento vive en un efecto PASIVO', elPulsoEsPasivo(escena)],
    ['el frameloop sale de la MISMA fase que arma el pulso', elFrameloopSaleDeLaFase(escena)],
    ['ProbeStage pasa el frameloop al <Canvas> sin reinterpretarlo', probeStagePasaElFrameloop(stage)],
  ]
  const cortados = eslabones.filter(([, ok]) => !ok).map(([nombre]) => nombre)
  return { eslabones, cortados, determinado: cortados.length === 0 }
}
