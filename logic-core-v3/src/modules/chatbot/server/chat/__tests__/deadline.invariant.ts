/**
 * DEADLINE-ONFINISH — Invariantes del techo de tiempo de los hooks del stream.
 * Corre SIN DB, SIN red y SIN server:
 *
 *   npm run test:deadline
 *   (o: npx tsx src/modules/chatbot/server/chat/__tests__/deadline.invariant.ts)
 *
 * Cubre:
 *   1. `withDeadline` resuelve normal cuando la operación llega a tiempo.
 *   2. Vence con `DeadlineExceededError` tipado (label + ms correctos).
 *   3. El timer se limpia SIEMPRE — verificado de verdad contra
 *      `process.getActiveResourcesInfo()`, no por inspección.
 *   4. El error propio de la operación se propaga TAL CUAL y `isDeadlineExceeded`
 *      lo distingue del deadline (de esa distinción depende el gate del retry).
 *   5. Una operación abandonada que rechaza DESPUÉS del deadline no produce
 *      unhandled rejection, y reporta `onLateSettle` (el discriminador
 *      socket-vs-lock).
 *   6. `createBudget` no se excede con operaciones encadenadas.
 *   7. `computeHookBudgetMs`: el presupuesto se techa contra el `maxDuration` de
 *      la ruta, nunca es negativo.
 *   8. La decisión del gate del retry (deadline → NO reintentar).
 *   9. WATCHDOG-2/3: calibración de las dos ventanas (`idleMs`/`initialIdleMs`),
 *      APLICADAS POR STEP (WATCHDOG-3: el cold start es de cada step, no del
 *      stream completo — tras un tool, el step que genera el texto final
 *      necesita la ventana LARGA), y del techo de suspensión por tools
 *      (`STREAM_WATCHDOG_TOOL_MAX_MS`) contra los presupuestos de persistencia
 *      y el `maxDuration` de la ruta.
 */
import assert from 'node:assert/strict'
import {
  DeadlineExceededError,
  createBudget,
  isDeadlineExceeded,
  withDeadline,
  type LateSettleInfo,
} from '../withDeadline.ts'
import {
  EVENT_LOG_DEADLINE_MS,
  HOOK_SAFETY_MARGIN_MS,
  ONFINISH_TOTAL_BUDGET_MS,
  PERSIST_TX_DEADLINE_MS,
  PERSIST_TX_MAX_ATTEMPTS,
  PERSIST_TX_RETRY_BACKOFF_MS,
  QUOTA_COMPENSATION_DEADLINE_MS,
  ROUTE_MAX_DURATION_MS,
  STREAM_WATCHDOG_IDLE_MS,
  STREAM_WATCHDOG_INITIAL_IDLE_MS,
  STREAM_WATCHDOG_TOOL_MAX_MS,
  computeHookBudgetMs,
} from '../reconcile.ts'

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Cuántos timers hay vivos ahora mismo. Tipado en @types/node — cero `any`. */
const liveTimers = (): number =>
  process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length

// Sin top-level await (mismo criterio que el resto de los invariant del repo):
// todo corre dentro de main(), fallo = exit 1.
async function main(): Promise<void> {
// ── 1. Camino feliz: resuelve con el valor de la operación ────────────────────
{
  const value = await withDeadline(Promise.resolve('ok'), 1_000, 'fast')
  assert.equal(value, 'ok')

  const slowerButInTime = await withDeadline(sleep(20).then(() => 42), 1_000, 'in-time')
  assert.equal(slowerButInTime, 42)
}

// ── 2. Vence con el error tipado y distinguible ───────────────────────────────
{
  const error = await withDeadline(sleep(5_000), 30, 'hangs').then(
    () => null,
    (e: unknown) => e,
  )
  assert.ok(error instanceof DeadlineExceededError, 'el rechazo es DeadlineExceededError')
  assert.ok(isDeadlineExceeded(error), 'el type guard lo reconoce')
  assert.equal(error.label, 'hangs', 'conserva el label para saber QUÉ fase venció')
  assert.equal(error.ms, 30)
  assert.equal(error.name, 'DeadlineExceededError')

  // ms <= 0 (presupuesto agotado) rechaza inmediato, sin esperar.
  const startedAt = Date.now()
  const zero = await withDeadline(sleep(5_000), 0, 'no-budget').then(
    () => null,
    (e: unknown) => e,
  )
  assert.ok(isDeadlineExceeded(zero), 'ms=0 vence de una')
  assert.ok(Date.now() - startedAt < 50, 'no espera nada con presupuesto 0')
}

// ── 3. El timer se limpia en AMBOS caminos ───────────────────────────────────
// Sin el clearTimeout del finally, la función serverless queda viva esperando un
// timer huérfano. Se verifica contra el runtime, no leyendo el código.
{
  const baseline = liveTimers()

  // 3.a — La operación gana: queda un timer de 60s que hay que matar.
  await withDeadline(Promise.resolve('ganó la operación'), 60_000, 'winner')
  assert.equal(
    liveTimers(),
    baseline,
    'operación que gana la carrera: el timer del deadline NO queda vivo',
  )

  // 3.b — Gana el deadline: el timer ya disparó, pero igual se limpia.
  await withDeadline(sleep(5_000), 20, 'loser').catch(() => undefined)
  const afterDeadline = liveTimers()
  // El sleep(5000) de la operación abandonada sigue vivo (es esperado: abandona,
  // no cancela) — por eso se compara contra baseline+1, no contra baseline.
  assert.ok(
    afterDeadline <= baseline + 1,
    `deadline vencido: solo sobrevive el timer de la operación abandonada (vivos: ${afterDeadline}, baseline: ${baseline})`,
  )
}

// ── 4. El error de la operación se propaga tal cual (NO se disfraza) ─────────
// De esta distinción depende el gate del retry: error real → se reintenta;
// deadline → NO se reintenta (la operación abandonada retuvo una conexión).
{
  class PrismaishError extends Error {
    readonly code = 'P2024'
  }
  const original = new PrismaishError('pool timeout')
  const caught = await withDeadline(Promise.reject(original), 1_000, 'real-error').then(
    () => null,
    (e: unknown) => e,
  )
  assert.equal(caught, original, 'se propaga la MISMA instancia, sin envolver')
  assert.equal(isDeadlineExceeded(caught), false, 'un error real no se confunde con deadline')
}

// ── 5. Operación abandonada: sin unhandled rejection + onLateSettle ─────────
{
  // 5.a — rechaza tarde. Sin el .catch() obligatorio de withDeadline, esto sería
  // un unhandled rejection y Node mataría el proceso: el test entero es el assert.
  const lateRejections: LateSettleInfo[] = []
  const rejectsLate = sleep(60).then(() => {
    throw new Error('murió tarde')
  })
  const err = await withDeadline(rejectsLate, 20, 'late-reject', {
    onLateSettle: (info) => lateRejections.push(info),
  }).then(
    () => null,
    (e: unknown) => e,
  )
  assert.ok(isDeadlineExceeded(err))
  await sleep(120)
  assert.equal(lateRejections.length, 1, 'reporta el settlement tardío')
  assert.equal(lateRejections[0].settled, 'rejected')
  assert.equal(lateRejections[0].label, 'late-reject')
  assert.equal(lateRejections[0].deadlineMs, 20)
  assert.ok(
    lateRejections[0].elapsedMs >= 50,
    'elapsedMs mide el tiempo REAL de la operación, no el deadline',
  )

  // 5.b — resuelve tarde: es el discriminador socket-vs-lock (commit tardío =
  // conexión viva pero lenta; silencio = socket muerto).
  const lateFulfills: LateSettleInfo[] = []
  await withDeadline(sleep(60).then(() => 'commiteó tarde'), 20, 'late-commit', {
    onLateSettle: (info) => lateFulfills.push(info),
  }).catch(() => undefined)
  await sleep(120)
  assert.equal(lateFulfills.length, 1)
  assert.equal(lateFulfills[0].settled, 'fulfilled')

  // 5.c — control negativo: si la operación llega a tiempo, onLateSettle NO se
  // dispara (si no, todo turno sano ensuciaría el log con un falso positivo).
  const noLate: LateSettleInfo[] = []
  await withDeadline(sleep(10).then(() => 'ok'), 1_000, 'in-time', {
    onLateSettle: (info) => noLate.push(info),
  })
  await sleep(60)
  assert.equal(noLate.length, 0, 'operación puntual NO reporta settlement tardío')
}

// ── 6. El presupuesto global no se excede con operaciones encadenadas ───────
{
  const budget = createBudget(150)
  assert.equal(budget.totalMs, 150)
  assert.ok(budget.hasRoomFor(100), 'recién creado hay lugar')

  // Cada operación pide 100ms, pero el techo total es 150: la 2ª sale recortada.
  const first = budget.clamp(100)
  assert.equal(first, 100, 'la 1ª entra entera')
  await withDeadline(sleep(5_000), first, 'op1').catch(() => undefined)

  const second = budget.clamp(100)
  assert.ok(second < 100, `la 2ª sale recortada al remanente (fue ${second})`)
  assert.ok(second <= budget.totalMs - first + 5, 'el recorte respeta el techo global')

  await withDeadline(sleep(5_000), second, 'op2').catch(() => undefined)
  assert.equal(budget.remainingMs(), 0, 'presupuesto agotado')
  assert.equal(budget.clamp(100), 0, 'agotado, clamp da 0 → el llamador no arranca la operación')
  assert.equal(budget.hasRoomFor(1), false, 'y hasRoomFor corta antes de arrancar la última')
  assert.ok(budget.elapsedMs() >= 150)

  // Un total negativo nunca produce un presupuesto negativo.
  assert.equal(createBudget(-500).totalMs, 0)
  assert.equal(createBudget(-500).remainingMs(), 0)
}

// ── 7. computeHookBudgetMs: techo contra el maxDuration de la ruta ──────────
{
  // Request normal: manda el techo del hook, no el de la ruta.
  assert.equal(computeHookBudgetMs(3_000), ONFINISH_TOTAL_BUDGET_MS)
  assert.equal(computeHookBudgetMs(0), ONFINISH_TOTAL_BUDGET_MS)

  // LLM lento: el remanente de la ruta manda y recorta el presupuesto.
  assert.equal(
    computeHookBudgetMs(24_000),
    ROUTE_MAX_DURATION_MS - 24_000 - HOOK_SAFETY_MARGIN_MS,
  )
  assert.ok(
    computeHookBudgetMs(24_000) < ONFINISH_TOTAL_BUDGET_MS,
    'con LLM lento el presupuesto sale recortado — si no, el hook volvería a rozar el kill',
  )

  // Al borde del maxDuration: 0 → no se arranca ninguna query, se cierra el stream.
  assert.equal(computeHookBudgetMs(28_000), 0)
  assert.equal(computeHookBudgetMs(ROUTE_MAX_DURATION_MS), 0)
  assert.equal(computeHookBudgetMs(999_999), 0, 'nunca negativo')

  // El punto de quiebre está donde debe: el hook completo tiene que entrar
  // ANTES del kill de la plataforma, con el colchón incluido.
  const breakEven = ROUTE_MAX_DURATION_MS - HOOK_SAFETY_MARGIN_MS - ONFINISH_TOTAL_BUDGET_MS
  assert.equal(computeHookBudgetMs(breakEven), ONFINISH_TOTAL_BUDGET_MS)
  assert.ok(computeHookBudgetMs(breakEven + 1) < ONFINISH_TOTAL_BUDGET_MS)
  assert.ok(
    breakEven + ONFINISH_TOTAL_BUDGET_MS + HOOK_SAFETY_MARGIN_MS <= ROUTE_MAX_DURATION_MS,
    'presupuesto + colchón nunca superan el maxDuration de la ruta',
  )
}

// ── 8. Gate del retry: deadline NO reintenta, error real sí ─────────────────
// Modelo ejecutable de la decisión que vive en el bucle de handleChatRequest.
// El bucle real necesita DB; lo que se pinnea acá es el CRITERIO.
{
  type SkipReason = 'deadline' | 'budget' | 'max_attempts' | null
  const decideRetry = (
    error: unknown,
    attempt: number,
    remainingMs: number,
  ): SkipReason => {
    if (attempt >= PERSIST_TX_MAX_ATTEMPTS) return 'max_attempts'
    if (isDeadlineExceeded(error)) return 'deadline'
    const needed = PERSIST_TX_RETRY_BACKOFF_MS + PERSIST_TX_DEADLINE_MS + EVENT_LOG_DEADLINE_MS
    if (remainingMs < needed) return 'budget'
    return null
  }

  const realError = new Error('connection reset')
  const deadline = new DeadlineExceededError('persist_tx_1', PERSIST_TX_DEADLINE_MS)

  assert.equal(decideRetry(realError, 1, 5_000), null, 'error real con presupuesto → reintenta')
  assert.equal(
    decideRetry(deadline, 1, 5_000),
    'deadline',
    'deadline con presupuesto de sobra → NO reintenta (no envenena una 2ª conexión del pool)',
  )
  assert.equal(decideRetry(realError, 1, 100), 'budget', 'sin presupuesto → no reintenta')
  assert.equal(
    decideRetry(realError, PERSIST_TX_MAX_ATTEMPTS, 5_000),
    'max_attempts',
    'intentos agotados',
  )

  // Sanidad de la aritmética. El camino de error real completo —intento 1 +
  // backoff + intento 2 + evento de cierre— es exactamente lo que el gate exige
  // como remanente antes de autorizar el reintento, y entra JUSTO en el techo:
  // cero margen de sobra.
  const retryPath =
    PERSIST_TX_DEADLINE_MS +
    PERSIST_TX_RETRY_BACKOFF_MS +
    PERSIST_TX_DEADLINE_MS +
    EVENT_LOG_DEADLINE_MS
  assert.ok(
    retryPath <= ONFINISH_TOTAL_BUDGET_MS,
    `el camino de retry completo (${retryPath}ms) tiene que entrar en el techo (${ONFINISH_TOTAL_BUDGET_MS}ms)`,
  )
  // Y entra sin margen: cualquier fase condicional que haya corrido antes
  // (compensación de cupo, evento de warnings) ya no deja lugar para el
  // reintento. Por eso el clamp del budget es obligatorio y no decorativo — es
  // lo que absorbe el exceso en vez de que el hook se pase del techo.
  assert.ok(
    retryPath + QUOTA_COMPENSATION_DEADLINE_MS > ONFINISH_TOTAL_BUDGET_MS,
    'con una fase condicional previa el nominal se pasa del techo → el clamp es el que corta',
  )
}

// ── 9. WATCHDOG-2/3: la calibración de las DOS ventanas —POR STEP— deja vivir
// a la persistencia y no corta respuestas sanas ──────────────────────────────
// Reemplaza al bloque que pinneaba `stepMs` (removido: beneficio medido cero y
// truncaba generaciones legítimas). Quien cierra el stream es el watchdog de
// nuestro borde, con dos ventanas separadas (WATCHDOG-2: bajar la ventana
// post-chunk de 3000 a 1200ms sin romper el arranque) que ahora aplican POR
// STEP, no por stream completo (WATCHDOG-3: el arranque en frío del provider es
// una propiedad de CADA step — tras un tool, el step 2 que genera el texto
// final es una llamada nueva al provider con su propio cold start). Lo que hay
// que pinnear: que cada ventana dispare a tiempo para que `persistTurn`
// conserve su presupuesto, y que ninguna corte una respuesta sana. Acá falla
// el test, no prod.
{
  // Elapsed real medido en prod: el watchdog se crea (~return de la respuesta)
  // a los ~4.9s; el único chunk de Gemini llega ~1.5s después, a los ~6.4s.
  const WATCHDOG_CREATED_ELAPSED_MS = 4_900
  const LAST_CHUNK_ELAPSED_MS = 6_400

  // 9a. Camino real (CON chunk): dispara idleMs después del último chunk.
  const firesAtMsWithChunk = LAST_CHUNK_ELAPSED_MS + STREAM_WATCHDOG_IDLE_MS
  assert.equal(
    computeHookBudgetMs(firesAtMsWithChunk),
    ONFINISH_TOTAL_BUDGET_MS,
    `con idle=${STREAM_WATCHDOG_IDLE_MS} el watchdog dispara a ${firesAtMsWithChunk}ms y la ` +
      'persistencia todavía recibe el presupuesto COMPLETO',
  )
  assert.ok(
    firesAtMsWithChunk + ONFINISH_TOTAL_BUDGET_MS + HOOK_SAFETY_MARGIN_MS < ROUTE_MAX_DURATION_MS,
    'disparo + persistencia + colchón entran holgados antes del kill de la plataforma',
  )

  // 9b. Camino patológico (SIN ningún chunk jamás): dispara initialIdleMs
  // desde la creación del watchdog. Sin texto acumulado no hay nada que
  // persistir, así que lo único que importa es que cierre antes del kill.
  const firesAtMsNoChunk = WATCHDOG_CREATED_ELAPSED_MS + STREAM_WATCHDOG_INITIAL_IDLE_MS
  assert.ok(
    firesAtMsNoChunk + HOOK_SAFETY_MARGIN_MS < ROUTE_MAX_DURATION_MS,
    `sin ningún chunk, el watchdog igual cierra a ${firesAtMsNoChunk}ms, antes del kill de 30s`,
  )

  // 9c. Camino con un tool al límite del techo de seguridad: el peor caso de
  // suspensión (STREAM_WATCHDOG_TOOL_MAX_MS agotado) todavía deja el
  // presupuesto COMPLETO para persistTurn — si esto falla, TOOL_MAX_MS quedó
  // calibrado demasiado alto.
  const firesAtMsAfterToolMax =
    WATCHDOG_CREATED_ELAPSED_MS + STREAM_WATCHDOG_TOOL_MAX_MS + STREAM_WATCHDOG_IDLE_MS
  // PROVIDER-CLOSE — al subir `STREAM_WATCHDOG_IDLE_MS` de 1200 a 3000 (el
  // watchdog del borde pasó a ser RED DE SEGURIDAD, ver reconcile.ts), este
  // peor caso ya NO conserva el presupuesto COMPLETO: quedan ~4100ms en vez de
  // 5000ms. Es un trade-off aceptado y medido, no una regresión silenciosa —
  // `persistTurn` tarda ~300-1600ms en producción, así que 4100ms sigue siendo
  // holgado. Lo que se pinnea ahora es lo que de verdad importa: que alcance
  // para un intento completo de persistencia MÁS su evento de cierre.
  const persistenceFloorMs = PERSIST_TX_DEADLINE_MS + EVENT_LOG_DEADLINE_MS
  assert.ok(
    computeHookBudgetMs(firesAtMsAfterToolMax) >= persistenceFloorMs,
    `con TOOL_MAX_MS=${STREAM_WATCHDOG_TOOL_MAX_MS} el peor caso de suspensión dispara a ` +
      `${firesAtMsAfterToolMax}ms y el presupuesto (${computeHookBudgetMs(firesAtMsAfterToolMax)}ms) ` +
      `sigue alcanzando para un intento de persistencia + su evento (${persistenceFloorMs}ms)`,
  )
  assert.ok(
    firesAtMsAfterToolMax + computeHookBudgetMs(firesAtMsAfterToolMax) < ROUTE_MAX_DURATION_MS,
    'el peor caso de suspensión sigue cerrando antes del kill de la plataforma',
  )
  // Nota sobre 9c: modela el resume() del PROPIO techo de seguridad — dispara
  // con la ventana CORTA (`idleMs`) porque en ese punto `beginStep()` todavía
  // no corrió (el tool ni terminó). Sigue siendo el comportamiento correcto:
  // no cambia con WATCHDOG-3.

  // 9d. WATCHDOG-3 — camino REALISTA: el tool termina DENTRO de su cold start
  // esperado (Neon fría: 6-7s medidos, bien por debajo de TOOL_MAX_MS), y el
  // step 2 arranca con la ventana LARGA (`beginStep()` → `initialIdleMs`), no
  // con la corta — que es exactamente el bug que este sprint arregla. Aun con
  // el cold start COMPLETO del step 2 sumado encima, sigue cerrando antes del
  // kill de la plataforma.
  const TYPICAL_TOOL_DURATION_MS = 7_000
  const firesAtMsStep2NoChunk =
    WATCHDOG_CREATED_ELAPSED_MS + TYPICAL_TOOL_DURATION_MS + STREAM_WATCHDOG_INITIAL_IDLE_MS
  assert.ok(
    firesAtMsStep2NoChunk + HOOK_SAFETY_MARGIN_MS < ROUTE_MAX_DURATION_MS,
    `tool (${TYPICAL_TOOL_DURATION_MS}ms) + cold start COMPLETO del step 2 con la ventana LARGA ` +
      `(dispara a ${firesAtMsStep2NoChunk}ms) sigue cerrando antes del kill de la plataforma`,
  )
  // ⚠️ RESIDUAL, fuera de scope de este sprint (no se tocan constantes): en el
  // caso EXTREMO donde el techo de seguridad fuerza el resume (TOOL_MAX_MS
  // agotado) Y el tool termina poco después Y el step 2 necesita su cold start
  // COMPLETO, la suma teórica puede superar ROUTE_MAX_DURATION_MS:
  //   WATCHDOG_CREATED(~4.9s) + TOOL_MAX_MS(15s) + IDLE_MS(~1.2s de margen) +
  //   INITIAL_IDLE_MS(12s) ≈ 33.1s > 30s.
  // Es un doble-edge-case (tool casi colgado + step 2 lento) que no se
  // resuelve en este sprint — si aparece en prod, revisar TOOL_MAX_MS con
  // Valentino/Franco.

  // Piso de la ventana INICIAL: los gaps medidos hasta el primer chunk fueron
  // 1470 y 1664ms. Tiene que superarlos con margen o cortaría respuestas sanas
  // que tardan en arrancar.
  const MAX_OBSERVED_GAP_TO_FIRST_CHUNK_MS = 1_664
  assert.ok(
    STREAM_WATCHDOG_INITIAL_IDLE_MS > MAX_OBSERVED_GAP_TO_FIRST_CHUNK_MS * 1.5,
    `initialIdleMs demasiado bajo: el gap máximo medido hasta el primer chunk fue ` +
      `${MAX_OBSERVED_GAP_TO_FIRST_CHUNK_MS}ms y cortaría el arranque de respuestas sanas`,
  )
  // La ventana post-chunk tiene que ser la CORTA — si no, separar las dos
  // ventanas no logra nada (WATCHDOG-2 existe para poder bajar justo esta).
  assert.ok(
    STREAM_WATCHDOG_IDLE_MS < STREAM_WATCHDOG_INITIAL_IDLE_MS,
    'idleMs (post-chunk) tiene que ser más corto que initialIdleMs — si no, no hay para qué separarlas',
  )
  // MUDEZ (commit 1) — la aserción "watchdog antes que chunkMs" se removió
  // JUNTO con STREAM_CHUNK_TIMEOUT_MS: la premisa que pinneaba (que chunkMs
  // existe y es benigno) resultó falsa — su timer corría durante la ejecución
  // de tools legítimos y abortaba el run en silencio (variante orig3 del turno
  // mudo). Sin chunkMs, la relación que este bloque protegía ya no existe.
}

console.log(
  '✓ deadline invariants OK: withDeadline resuelve/vence con error tipado y distinguible, ' +
    'limpia el timer en ambos caminos (verificado contra getActiveResourcesInfo), no deja ' +
    'unhandled rejections al abandonar, reporta el settlement tardío solo cuando lo hubo, el ' +
    'presupuesto global no se excede en cadena, computeHookBudgetMs techa contra el maxDuration ' +
    'de la ruta y el gate del retry no reintenta ante deadline.',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
