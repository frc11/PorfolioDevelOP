/**
 * Chequeo de invariante del REFLEJO DE LA PANTALLA — corre sin DB.
 *
 *   npm run check:invariant:reflejo
 *
 * ── Qué protege, y por qué no se ve a simple vista (P29 · P30 · P31) ─────────
 * Después de una acción del recorrido, la pantalla del setter muestra el estado
 * nuevo porque UN CARTEL DE AVISOS SE CIERRA SOLO A LOS CUATRO SEGUNDOS. No es
 * una figura retórica: es la cadena, medida.
 *
 *   1. `useStepAction.run()` despacha la server action. Next envuelve ese
 *      despacho en `React.startTransition` SIEMPRE (`callServer`, en
 *      `next/dist/client/app-call-server.js`) — producto no puede evitarlo.
 *   2. El estado del router queda en una promesa que `AppRouter` consume con
 *      `use()`, así que el render de la transición SUSPENDE:
 *      `root.suspendedLanes |= 0x200` y `root.warmLanes |= 0x200`.
 *   3. La action responde (~0,9 s) y React entrega EXACTAMENTE UN ping. Si en
 *      ese reintento el árbol RSC revalidado todavía no resolvió, el render se
 *      vuelve a suspender — y de esa segunda suspensión NO LLEGA NINGÚN PING
 *      MÁS: `getNextLanes` no vuelve a elegir un lane marcado «warm».
 *   4. Cualquier actualización de estado no-idle en el mismo root llama
 *      `markRootUpdated`, que pone `suspendedLanes = 0` y `warmLanes = 0`.
 *      React reintenta, los datos ya están, y COMMITEA.
 *   5. En producción la primera actualización así es el AUTO-CIERRE DEL CARTEL
 *      de sonner, a los 4000 ms exactos de haberse montado.
 *
 * Medido en P30 y reproducido en P31: sin cartel, la pantalla de `mc1` no
 * refleja NUNCA — 75 segundos con el dossier ya en CONSTRUCCION en la base. Con
 * cartel, refleja a los ~4,6 s. No es que tarde: es que la está destrabando otra
 * cosa.
 *
 * ── Por qué hace falta un invariante y no alcanza con las pruebas ────────────
 * Porque las pruebas esperan POR CONDICIÓN, y la condición se cumple — gracias
 * al cartel. Sacar el `<Toaster>`, pasarle un `duration` corto o quitarle el
 * `successToast` a una acción rompe el reflejo de varias pantallas a la vez, EN
 * SILENCIO Y CON TODOS LOS GATES EN VERDE. Este chequeo vigila la FORMA; la
 * CONDUCTA la vigila `tests/setter/31-reflejo-del-arbol.spec.ts`. Hacen falta
 * los dos: el estático no puede ver si la pantalla commitea, y la prueba de
 * conducta corre sobre una acción sola.
 *
 * ── La regla NO es «toda acción emite el cartel» ─────────────────────────────
 * Esa sería más simple y sería FALSA. P31 la midió: `ofrecerHorarios` (m16) no
 * emite cartel y su pantalla refleja igual — 4 de 4 pasadas, a ~0,7 s, con cero
 * carteles en pantalla y el lane limpio. Por dos razones que van juntas:
 *
 *   · NO REVALIDA (única de las nueve). Sin `revalidatePath` no hay árbol de
 *     servidor esperando commit, así que no hay carrera que perder.
 *   · Su `onSuccess` hace `setOferta(...)` — un `setState` local, que ES una
 *     actualización y por lo tanto su propio empujón.
 *
 * La regla real, y la que se chequea acá: LA ACCIÓN QUE REVALIDA DEPENDE DEL
 * EMPUJÓN EXTERNO Y TIENE QUE EMITIR EL CARTEL; LA QUE NO REVALIDA, NO. Escribir
 * la regla simple habría forzado un cartel nuevo sobre una pantalla que anda —un
 * cambio de conducta gratuito— y habría dejado escrito un modelo equivocado de
 * por qué anda.
 *
 * ── Limitación ACEPTADA a propósito ─────────────────────────────────────────
 * Esto no arregla el mecanismo: lo hace visible y lo vigila. La decisión (P30,
 * opción 1) fue no meter un empujón deliberado, porque el umbral es una CARRERA
 * —entre 800 y 1100 ms en esta máquina— y un retardo fijo anda acá y se rompe
 * con una red más lenta. Reporte completo: `docs/perf-p30/REPORTE.md`.
 */
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  bloqueDeParentesis,
  bloqueTopLevelDe,
  cuerpoDeFuncion,
  fuenteDe,
  sinComentarios,
} from '../invariant-call-site.ts'

const RAIZ = process.cwd()
const SETTER_DIR = join(RAIZ, 'src', 'app', '(protected)', 'setter')
const ACTIONS_DIR = join(SETTER_DIR, '_actions')
const LAYOUT = ['src', 'app', 'layout.tsx'] as const

const corto = (ruta: string): string => ruta.slice(SETTER_DIR.length + 1).replace(/\\/g, '/')

// ── GUARDIÁN 1 · El <Toaster> está montado en el root layout ─────────────────
/*
 * Es el eslabón del que cuelga todo lo demás: sin `<Toaster>` montado, ningún
 * `toast.success()` monta nada, no hay auto-cierre, y no hay actualización que
 * limpie el lane. Las pantallas del recorrido dejan de reflejar a la vez.
 */
const layout = sinComentarios(fuenteDe(...LAYOUT))

assert.ok(
  /from\s+['"]sonner['"]/.test(layout) && /<Toaster\b/.test(layout),
  'src/app/layout.tsx ya no monta el <Toaster> de sonner.\n' +
    '  POR QUÉ IMPORTA: el reflejo de las pantallas del recorrido depende de que ALGO produzca ' +
    'una actualización de estado después de que el árbol revalidado esté listo. Hoy ese algo es ' +
    'el auto-cierre del cartel. Sin <Toaster> montado no hay cartel, no hay auto-cierre, y las ' +
    'pantallas del setter dejan de mostrar el resultado de sus acciones — no más lento: NUNCA ' +
    '(medido: 75 s con el dato ya escrito en la base, y un solo ping a los 973 ms).\n' +
    '  Si lo estás sacando a propósito, hay que resolver antes el empujón: docs/perf-p30/REPORTE.md.',
)

// ── GUARDIÁN 2 · El cartel dura lo suficiente para ganar la carrera ──────────
/*
 * Lo que decide no es cuándo APARECE el cartel sino cuándo SE CIERRA: el cierre
 * es `montaje + duration`, y tiene que caer DESPUÉS de que el árbol revalidado
 * haya resuelto. P30 acotó ese punto empujando a mano: a los 800 ms no commitea,
 * a los 1100 ms sí.
 *
 * P31 lo midió por el lado del `duration`, con la sonda de lanes, tres builds:
 *
 *   duration=4000 (el default de sonner, lo que corre hoy)
 *       el cartel se monta a ~0,63 s y cierra a ~4,65 s  →  COMMITEA 4/4
 *   duration=800
 *       monta a ~0,62 s y cierra a ~1,43 s               →  COMMITEA 3/3
 *   duration=150
 *       monta, reintenta, SE RE-SUSPENDE, y el cierre no lo saca
 *                                                        →  NO COMMITEA NUNCA
 *       (`frase=true`, `tildeOk=0`, `susp=0x200` al cerrar la ventana de 12 s)
 *
 * O sea: el acantilado real, en ESTA máquina, está entre 150 y 800 ms.
 *
 * EL PISO NO ES EL ACANTILADO — ES EL ACANTILADO MÁS MARGEN, y es una decisión,
 * no una medición. 3000 ms quiere decir «no le recortes el default»; a 800 ms el
 * producto anda hoy y este chequeo igual lo pondría en rojo, a propósito. El
 * motivo es que el margen ES el punto: el momento en que el árbol resuelve NO es
 * una constante, se movió entre 0,62 s y 1,44 s entre corridas de la misma
 * máquina, y con una red más lenta se corre más. P29 propuso `duration: 1200` y
 * P30 lo desarmó por eso mismo — le ganaba al umbral por 100 ms. Un número que
 * anda por 100 ms sobre una carrera no es un umbral: es suerte con buena cara.
 *
 * NO cubierto: un `duration` corto pasado por cartel (`toast.success(msg, {
 * duration })`). Hoy no existe ninguno en el repo —verificado— y `useStepAction`
 * no ofrece por dónde pasarlo, así que el agujero es teórico. Si algún día se
 * escribe uno, este chequeo no lo va a ver.
 */
const PISO_DURACION_MS = 3000

const tagToaster = ((): string => {
  const i = layout.indexOf('<Toaster')
  const fin = layout.indexOf('/>', i)
  assert.notEqual(fin, -1, 'no se pudo recortar el tag <Toaster …/> de layout.tsx')
  return layout.slice(i, fin + 2)
})()

for (const m of tagToaster.matchAll(/duration\s*[:=]\s*\{?\s*(\d+)/g)) {
  const valor = Number(m[1])
  assert.ok(
    valor >= PISO_DURACION_MS,
    `el <Toaster> de layout.tsx lleva duration=${valor} ms, por debajo del piso de ${PISO_DURACION_MS} ms.\n` +
      '  POR QUÉ IMPORTA: la pantalla del setter no commitea cuando el cartel APARECE, commitea ' +
      'cuando el cartel SE CIERRA — ése es el `setState` que limpia el lane suspendido. Si el ' +
      'cierre cae antes de que el árbol revalidado esté listo (umbral medido: entre 800 y 1100 ms ' +
      'desde el clic, y el cartel se monta a ~0,7 s), React reintenta, no encuentra los datos, se ' +
      're-suspende, y de esa segunda suspensión NO SALE MÁS. Acortar el cartel no hace que la ' +
      'pantalla refleje antes: hace que no refleje nunca.\n' +
      '  Ver docs/perf-p30/REPORTE.md §4.',
  )
}

// ── El censo de acciones, y cuáles revalidan ─────────────────────────────────
/*
 * `revalidatePath` casi nunca se llama derecho: las actions llaman a un helper
 * local (`revalidarSetter`, `revalidarPipelineAdmin`). Así que primero se
 * averigua qué helpers del archivo revalidan, y recién después se pregunta por
 * cada action si revalida — derecho o por uno de esos helpers.
 *
 * Todo se lee SIN COMENTARIOS, y a propósito: `ofrecerHorarios` tiene escrito
 * «Sin revalidatePath: este sprint es backend puro», y un grep crudo la cuenta
 * revalidando — justo al revés de lo que dice. El primer censo de P31 se comió
 * esa línea.
 */
const REVALIDA_DIRECTO = /\brevalidatePath\s*\(|\brevalidateTag\s*\(/

type Accion = { nombre: string; archivo: string; revalida: boolean }
const ACCIONES = new Map<string, Accion>()

for (const archivo of readdirSync(ACTIONS_DIR)) {
  if (!archivo.endsWith('.actions.ts')) continue
  const partes = ['src', 'app', '(protected)', 'setter', '_actions', archivo] as const
  const fuente = sinComentarios(readFileSync(join(ACTIONS_DIR, archivo), 'utf8'))

  const revalidadores: string[] = []
  for (const m of fuente.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm)) {
    const nombre = m[1]!
    if (REVALIDA_DIRECTO.test(sinComentarios(cuerpoDeFuncion(partes, nombre)))) {
      revalidadores.push(nombre)
    }
  }
  const porHelper =
    revalidadores.length > 0 ? new RegExp(`\\b(?:${revalidadores.join('|')})\\s*\\(`) : null

  for (const m of fuente.matchAll(/^export async function (\w+)/gm)) {
    const nombre = m[1]!
    const cuerpo = sinComentarios(cuerpoDeFuncion(partes, nombre))
    ACCIONES.set(nombre, {
      nombre,
      archivo,
      revalida: REVALIDA_DIRECTO.test(cuerpo) || (porHelper !== null && porHelper.test(cuerpo)),
    })
  }
}

assert.ok(
  ACCIONES.size >= 20,
  `se esperaban ≥20 acciones en _actions/*.actions.ts y se leyeron ${ACCIONES.size} — ` +
    '¿cambió la forma de declararlas? El invariante quedaría vacío y no protegería nada',
)

// ── GUARDIÁN 3 · La acción que revalida emite el cartel, EN SU BLOQUE ────────
/*
 * Por call-site y no por archivo, por lo mismo que P25 y P27 arreglaron dos veces
 * en `acuse-recibo`: en un archivo con dos acciones, el `successToast` de una le
 * firmaba la señal a la otra. `agenda-form.tsx` es exactamente ese caso
 * —`confirmarReunion` anuncia, `ofrecerHorarios` no— y un chequeo por archivo lo
 * daría por bueno sin mirar.
 */
const ANUNCIA = /successToast\s*:|toast\s*\.\s*success\s*\(/
/**
 * Navegar también es una actualización: el despacho al router limpia el lane.
 * P30 lo midió — las 4 acciones que navegan salieron limpias 3/3 sin cartel.
 */
const NAVEGA = /router\s*\.\s*push\s*\(/

type CallSite = { ambito: string; acciones: Accion[]; revalida: boolean }
const callSites: CallSite[] = []
const sinCartel: string[] = []

function tsxDel(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) salida.push(...tsxDel(ruta))
    else if (entrada.name.endsWith('.tsx')) salida.push(ruta)
  }
  return salida
}

for (const ruta of tsxDel(SETTER_DIR)) {
  const fuente = sinComentarios(readFileSync(ruta, 'utf8'))
  const nombre = corto(ruta)

  for (const m of fuente.matchAll(/\brun\s*\(/g)) {
    const parenIdx = m.index! + m[0].length - 1
    const bloque = bloqueDeParentesis(fuente, parenIdx, `${nombre}: bloque de run(`)

    // Qué action se llama adentro. Sin esto el chequeo no sabe de qué habla.
    const llamadas = [...ACCIONES.values()].filter((a) =>
      new RegExp(`(?<![\\w.])${a.nombre}\\s*\\(`).test(bloque),
    )
    if (llamadas.length === 0) continue // `run(` de otra cosa: no es del recorrido.
    /*
     * Un bloque puede encadenar DOS actions y sigue siendo un solo acto:
     * `chequeo-form` guarda el último tilde (que puede estar en el debounce del
     * autosave) y recién después envía a revisión — «si el guardado rebota, su
     * fallo ES el fallo del envío». Para el reflejo alcanza con que UNA revalide:
     * esa sola ya deja el lane suspendido esperando el empujón.
     */
    const revalida = llamadas.some((a) => a.revalida)
    const componente = bloqueTopLevelDe(fuente, m.index!)
    const ambito = `${nombre}::${componente?.nombre ?? '(top)'}::${llamadas
      .map((a) => a.nombre)
      .join('+')}`
    callSites.push({ ambito, acciones: llamadas, revalida })

    if (!revalida) continue // No hay árbol esperando: no necesita empujón.
    if (ANUNCIA.test(bloque) || NAVEGA.test(bloque)) continue
    sinCartel.push(ambito)
  }
}

assert.deepEqual(
  sinCartel,
  [],
  'Estas acciones REVALIDAN y no emiten cartel ni navegan en su bloque:\n' +
    sinCartel.map((a) => `    · ${a}`).join('\n') +
    '\n\n  POR QUÉ IMPORTA: no es una pantalla sin acuse — es una pantalla QUE NO SE ACTUALIZA. ' +
    'Al revalidar, la respuesta de la action trae el árbol nuevo, pero React lo dejó en un lane ' +
    'suspendido y «warm» que no vuelve a elegir solo. Lo destraba la próxima actualización de ' +
    'estado, y hoy la única que llega es el auto-cierre del cartel. Sin cartel el setter registra ' +
    'su trabajo, la base lo guarda, y la pantalla se queda mostrando el estado VIEJO para siempre ' +
    '(medido: 75 s, con un único ping a los 973 ms).\n' +
    '  Poné el `successToast:` del patrón. Si la pantalla ya se actualiza sola por otro camino ' +
    '(un `setState` propio en `onSuccess`, una navegación), entonces la action tampoco debería ' +
    'revalidar: mirá `ofrecerHorarios` en agenda-form.tsx, que es ese caso y está medido en ' +
    'docs/perf-p30/REPORTE.md.',
)

// ── GUARDIÁN 4 · El censo congelado: quién puede NO emitir cartel ────────────
/*
 * Sin esto, la forma más fácil de poner el invariante en verde sería sacarle el
 * `revalidatePath` a la action en vez de darle el cartel — y eso no arregla el
 * reflejo, lo empeora: la pantalla deja de recibir el árbol nuevo Y sigue sin
 * empujón. Congelar el conjunto obliga a que ese cambio se declare acá.
 */
const SIN_REVALIDAR_ESPERADAS = ['ofrecerHorarios']

const sinRevalidar = [
  ...new Set(
    callSites.filter((c) => !c.revalida).flatMap((c) => c.acciones.map((a) => a.nombre)),
  ),
].sort()

assert.deepEqual(
  sinRevalidar,
  [...SIN_REVALIDAR_ESPERADAS].sort(),
  'el conjunto de acciones del recorrido que NO revalidan cambió.\n' +
    `    esperado: ${SIN_REVALIDAR_ESPERADAS.join(', ') || '(ninguna)'}\n` +
    `    leído:    ${sinRevalidar.join(', ') || '(ninguna)'}\n\n` +
    '  POR QUÉ IMPORTA: una acción que no revalida queda EXIMIDA del cartel por este mismo ' +
    'chequeo, así que este conjunto es la lista de excepciones. Si creció, hay dos casos, y son ' +
    'muy distintos:\n' +
    '    · La acción nueva de verdad no necesita el árbol del servidor y pinta su resultado con ' +
    'un `setState` propio (el caso de `ofrecerHorarios`): sumala acá, con esa explicación.\n' +
    '    · A una acción que SÍ mostraba datos del servidor le sacaron el `revalidatePath`: ' +
    'entonces su pantalla quedó mostrando el estado viejo, y el invariante está por dejarlo ' +
    'pasar. Devolvé la revalidación y ponele el cartel.',
)

// ── Piso: que esto no pase en verde sobre casi nada ──────────────────────────
assert.ok(
  callSites.length >= 9,
  `barrido flaco: ${callSites.length} call-sites de run( con acción del recorrido — se esperaban ≥9. ` +
    'El invariante no está viendo la superficie y pasaría en verde sobre casi nada.',
)

const conCartel = callSites.filter((c) => c.revalida).length
console.log(
  `✓ reflejo-del-arbol — <Toaster> montado (piso ${PISO_DURACION_MS} ms) · ` +
    `${callSites.length} call-sites de run( · ${conCartel} revalidan y anuncian · ` +
    `${sinRevalidar.length} eximida por no revalidar (${sinRevalidar.join(', ')})`,
)
