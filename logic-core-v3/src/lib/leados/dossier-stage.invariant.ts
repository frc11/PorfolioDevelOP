/**
 * Chequeo de invariante del GRAFO de stage del dossier — corre sin DB.
 *
 *   npm run check:invariant:dossier-stage
 *
 * ── Qué vigila ───────────────────────────────────────────────────────────────
 * `LEGAL_TRANSITIONS` es LA única puerta del stage: `transitionDossier()` lo
 * consulta y rechaza cualquier par que no esté ahí. Hasta C2 ningún invariante
 * lo miraba, y no podía mirarlo: era un `const` sin `export` adentro de
 * `dossier.ts`, que importa `@/lib/prisma`. C2 lo mudó VERBATIM a
 * `dossier-stage.ts`, un módulo cuyo árbol de runtime está vacío (su único
 * import es `import type`, que TypeScript borra), y esto es la red que faltaba.
 *
 * ── Por qué AHORA, antes del rediseño ────────────────────────────────────────
 * El rediseño pendiente fusiona m1 y m2 en una sola pantalla del stage FICHA. El
 * reporte A3 verificó que ahí vive una garantía que el código declara así:
 * «construir nunca se sugiere para un lead sin veredicto… La garantía es
 * estructural, no un `if`». Es estructural porque FICHA tiene UNA sola salida y
 * es EVALUADA: no hay camino de FICHA a BRIEF que no pase por el veredicto. El
 * día que FICHA→BRIEF sea legal, la garantía se evapora sin que nada se rompa
 * —compila, corre, y el bug es que el setter construye a ciegas—. La aserción 2
 * de acá es lo que lo atrapa.
 *
 * ── Por qué ts-node y no tsx ─────────────────────────────────────────────────
 * Porque la aserción 5 vive en el COMPILADOR, no en una comparación: los
 * `@ts-expect-error` de abajo se ponen en rojo (TS2578, «unused directive») si
 * alguien afloja una exigencia de `DossierTransitionInput`. Medido en este mismo
 * repo: `tsx` corre un archivo con un TS2322 deliberado y sale 0 —no
 * type-chequea—; `ts-node` sale 1. Con `tsx` la aserción 5 sería un adorno.
 *
 * ── Qué NO vigila ────────────────────────────────────────────────────────────
 * · No dice si el grafo es el que Franco QUIERE. Congela el que hay. Cambiar una
 *   transición es una decisión de producto: se cambia acá Y en el grafo, a mano,
 *   en el mismo commit, y el diff obliga a decirlo.
 * · No corre `transitionDossier()` (necesita DB). El gate comercial de BRIEF
 *   (`gateBriefAbierto`) ya tiene su propia cobertura.
 * · El ORDEN de las salidas de un stage no es contrato: el consumo es
 *   `.includes()`, que no lo mira. Se compara como conjunto para que un
 *   reordenamiento inocuo no dé un rojo que no significa nada.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LEGAL_TRANSITIONS } from './dossier-stage.ts'
import type { DossierTransitionInput } from './dossier.ts'

// ── EL CENSO CONGELADO ───────────────────────────────────────────────────────
// Escrito A MANO contra el grafo tal como estaba en `dossier.ts` antes de la
// mudanza (C2, Paso 1). NO se deriva de `LEGAL_TRANSITIONS`: un censo derivado
// de lo que vigila da verde contra cualquier cosa — es el modo de falla exacto
// que produjo los cuatro falsos verdes de C1b.
const GRAFO_CENSADO: Readonly<Record<string, readonly string[]>> = {
  FICHA: ['EVALUADA'],
  EVALUADA: ['DESCARTADA', 'BRIEF'],
  BRIEF: ['CONSTRUCCION'],
  CONSTRUCCION: ['EN_REVISION'],
  EN_REVISION: ['APROBADA', 'RECHAZADA'],
  RECHAZADA: ['CONSTRUCCION'],
  APROBADA: [],
  DESCARTADA: [],
}

/** Único stage de entrada: un dossier nace en FICHA y nada vuelve a él. */
const STAGE_INICIAL = 'FICHA'

/** Stages sin salida, a propósito: el dossier termina ahí. */
const STAGES_TERMINALES: readonly string[] = ['APROBADA', 'DESCARTADA']

const ARISTAS_CENSADAS = Object.values(GRAFO_CENSADO).reduce((n, s) => n + s.length, 0)

const conjunto = (xs: readonly string[]) => [...xs].sort().join(', ')
const grafo = LEGAL_TRANSITIONS as unknown as Record<string, readonly string[]>
const aristasDelGrafo = () => Object.values(grafo).reduce((n, s) => n + s.length, 0)

// ── 2. FICHA → BRIEF NO es legal (va primero a propósito) ────────────────────
// Va antes que el censo porque es la que el rediseño va a tocar, y quien la vea
// tiene que leer ESTE mensaje —el porqué— y no el genérico de «el grafo cambió».
assert.ok(
  !(grafo[STAGE_INICIAL] ?? []).includes('BRIEF'),
  'FICHA→BRIEF quedó LEGAL. Eso borra una garantía estructural del producto:\n' +
    '  hoy «construir nunca se sugiere para un lead sin veredicto» NO es un if que\n' +
    '  alguien pueda olvidar — es la forma del grafo. FICHA tiene UNA salida\n' +
    '  (EVALUADA), así que no existe camino de FICHA a BRIEF sin pasar por el\n' +
    '  veredicto del Evaluador. Con esta arista el camino existe, y el setter puede\n' +
    '  entrar a construir una demo para un lead que nadie evaluó.\n' +
    '  Si estás fusionando m1 y m2 en una sola pantalla de FICHA: ESTE es el punto\n' +
    '  donde hay que decidir explícitamente qué reemplaza a la garantía, en vez de\n' +
    '  perderla en silencio. No borres esta aserción para seguir: cambiala por la\n' +
    '  garantía nueva, o el producto se queda sin ninguna.',
)
assert.deepEqual(
  [...(grafo[STAGE_INICIAL] ?? [])],
  ['EVALUADA'],
  `la garantía estructural exige que ${STAGE_INICIAL} tenga UNA sola salida y que sea ` +
    `EVALUADA; hoy tiene [${(grafo[STAGE_INICIAL] ?? []).join(', ')}]. Cualquier segunda ` +
    'salida abre un camino que esquiva el veredicto, aunque no se llame BRIEF.',
)

// ── 1. El grafo es EXACTAMENTE el censado ────────────────────────────────────
assert.equal(
  conjunto(Object.keys(grafo)),
  conjunto(Object.keys(GRAFO_CENSADO)),
  'los STAGES del grafo ya no son los censados.\n' +
    `  censados:    ${conjunto(Object.keys(GRAFO_CENSADO))}\n` +
    `  en el grafo: ${conjunto(Object.keys(grafo))}\n` +
    '  Un stage de más sin aristas es un estado inalcanzable; uno de menos hace que ' +
    '`LEGAL_TRANSITIONS[from]` sea undefined y que `transitionDossier` explote con ' +
    'TypeError en vez de rechazar la transición.',
)
for (const stage of Object.keys(GRAFO_CENSADO)) {
  const censadas = GRAFO_CENSADO[stage] ?? []
  const reales = grafo[stage] ?? []
  assert.equal(
    conjunto(reales),
    conjunto(censadas),
    `las salidas de ${stage} cambiaron y nadie tocó el censo.\n` +
      `  censadas:    [${conjunto(censadas)}]\n` +
      `  en el grafo: [${conjunto(reales)}]\n` +
      '  Una transición NUEVA abre un camino que el producto nunca decidió; una que ' +
      'FALTA deja atrapados a los dossiers que ya están en ese stage — sin salida legal, ' +
      '`transitionDossier` los rechaza para siempre y hay que tocar la DB a mano.\n' +
      '  Si el cambio es a propósito: actualizá GRAFO_CENSADO en el MISMO commit y decí ' +
      'por qué. Que cueste un renglón es el punto.',
  )
}
assert.equal(
  aristasDelGrafo(),
  ARISTAS_CENSADAS,
  `el grafo tiene ${aristasDelGrafo()} aristas y el censo ${ARISTAS_CENSADAS}. El total se ` +
    'chequea aparte de las salidas una por una para que un cambio compensado (una arista ' +
    'que se va y otra que entra) no pase.',
)

// ── 3. Todo stage del enum aparece en el grafo ───────────────────────────────
// La fuente del enum es `prisma/schema.prisma`, NO el cliente generado: importar
// `DossierStage` como VALOR desde '@prisma/client' arrastraría el cliente a esta
// corrida, que se define por no necesitar DB. Y leer el schema atrapa el caso
// real —alguien agrega un stage y no toca el grafo—, que el tipo NO ve hasta que
// alguien corra `prisma generate`.
const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')
const bloqueEnum = /enum DossierStage \{([^}]*)\}/.exec(schema)
assert.ok(
  bloqueEnum,
  'no se encontró `enum DossierStage` en prisma/schema.prisma. O lo renombraron (y ' +
    'entonces el grafo quedó tipado contra un enum que no existe) o este invariante dejó ' +
    'de leer donde debía — que es un falso verde esperando: revisalo, no lo borres.',
)
const stagesDelEnum = bloqueEnum[1]
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.length > 0 && !l.startsWith('//'))
assert.equal(
  conjunto(stagesDelEnum),
  conjunto(Object.keys(grafo)),
  'el enum DossierStage de prisma/schema.prisma y el grafo dejaron de coincidir.\n' +
    `  en el schema: ${conjunto(stagesDelEnum)}\n` +
    `  en el grafo:  ${conjunto(Object.keys(grafo))}\n` +
    '  Un stage del enum SIN entrada en el grafo es un agujero mudo: un dossier que ' +
    'llegue ahí no tiene ninguna transición legal y queda trabado. Y el compilador no lo ' +
    've hasta que alguien corra `prisma generate` — puede vivir en main varios commits. ' +
    'Si agregaste un stage, dale sus salidas en LEGAL_TRANSITIONS (o declaralo terminal) ' +
    'y sumalo al censo, en el mismo commit.',
)
for (const stage of Object.keys(grafo)) {
  const salidas = grafo[stage] ?? []
  const esTerminal = STAGES_TERMINALES.includes(stage)
  assert.equal(
    salidas.length === 0,
    esTerminal,
    esTerminal
      ? `${stage} está declarado TERMINAL pero tiene salidas [${salidas.join(', ')}]. O deja ` +
        'de ser terminal (sacalo de STAGES_TERMINALES y decí por qué) o no debería tener ' +
        'salidas.'
      : `${stage} se quedó SIN salidas y no está declarado terminal. Todo dossier que ` +
        'llegue a ese stage queda trabado ahí para siempre: ninguna transición es legal y ' +
        'la única salida es tocar la DB a mano. Si es terminal a propósito, decilo en ' +
        'STAGES_TERMINALES.',
  )
}

// ── 4. Ningún stage sin camino de ENTRADA, salvo el inicial ──────────────────
const entradas = new Map<string, string[]>(Object.keys(grafo).map((s) => [s, []]))
for (const [desde, salidas] of Object.entries(grafo)) {
  for (const hasta of salidas) entradas.get(hasta)?.push(desde)
}
for (const [stage, desde] of entradas) {
  if (stage === STAGE_INICIAL) {
    assert.equal(
      desde.length,
      0,
      `${STAGE_INICIAL} es el stage INICIAL y ahora tiene entradas desde [${desde.join(', ')}]. ` +
        'Volver a FICHA re-abre la ficha de un lead que ya tiene veredicto (y, más abajo, ' +
        'demo): el historial deja de ser una línea y la garantía de la aserción 2 pierde ' +
        'sentido, porque «pasar por EVALUADA» ya no implica haberlo hecho para ESTA vuelta.',
    )
    continue
  }
  assert.ok(
    desde.length > 0,
    `${stage} quedó INALCANZABLE: ninguna transición legal llega a él.\n` +
      '  Un stage sin entrada es código muerto que parece vivo — el enum lo tiene, la UI ' +
      'probablemente lo pinte, y ningún dossier va a estar ahí nunca. Si además había ' +
      'dossiers en ese stage, quedaron sin forma de llegar y sin forma de salir.\n' +
      '  Suele pasar por sacar «una arista que no se usaba»: era la única que llegaba.',
  )
}

// ── 5. Las transiciones que exigen un dato lo DECLARAN ───────────────────────
// Dos patas, porque la exigencia vive en dos lados y ninguno de los dos es una
// copia: el TIPO (lo que el caller está obligado a mandar) y el GUARD de runtime
// (lo que `transitionDossier` verifica antes de escribir).
//
// Pata A — el tipo. Estos `@ts-expect-error` son la aserción: si alguien afloja
// `DossierTransitionInput` (por ejemplo `motivoDescarte?: string`), el error que
// esperan desaparece y ts-node corta con TS2578, «unused '@ts-expect-error'
// directive». Por eso este invariante corre con ts-node: con tsx no compilaría
// nada y esto sería decorado.
// @ts-expect-error EVALUADA→DESCARTADA sin motivoDescarte NO debe compilar: descartar sin motivo deja ciega la métrica de descarte del admin.
const _descartadaSinMotivo: DossierTransitionInput = { to: 'DESCARTADA' }
// @ts-expect-error EN_REVISION→RECHAZADA sin motivo NO debe compilar: manda al setter a re-hacer la demo sin saber qué arreglar.
const _rechazadaSinMotivo: DossierTransitionInput = { to: 'RECHAZADA' }
// @ts-expect-error FICHA→EVALUADA sin la evaluación NO debe compilar: el veredicto ES la transición.
const _evaluadaSinEvaluacion: DossierTransitionInput = { to: 'EVALUADA' }
void _descartadaSinMotivo
void _rechazadaSinMotivo
void _evaluadaSinEvaluacion

// Pata B — los guards de runtime, leídos de la FUENTE real y acotados al `case`
// que los contiene. Acotar importa: `dossier.ts` está lleno de `throw new
// DossierTransitionError`, así que buscar en el archivo entero daría verde sobre
// un `case` vaciado. Misma granularidad que `acuse-recibo.invariant.ts`.
const fuenteDossier = readFileSync(
  join(process.cwd(), 'src', 'lib', 'leados', 'dossier.ts'),
  'utf8',
)

/** Desde `case '<stage>': {`, el texto hasta su llave de cierre. */
function bloqueDelCase(stage: string): string {
  const marca = `case '${stage}': {`
  const i = fuenteDossier.indexOf(marca)
  assert.notEqual(
    i,
    -1,
    `no hay \`case '${stage}':\` en transitionDossier. Si la transición dejó de tener caso ` +
      'propio, sus exigencias se fueron con él — y este invariante no puede verificarlas: ' +
      'arreglá el invariante junto con el cambio, no lo borres.',
  )
  let nivel = 0
  for (let j = i + marca.length - 1; j < fuenteDossier.length; j += 1) {
    const c = fuenteDossier[j]
    if (c === '{') nivel += 1
    else if (c === '}') {
      nivel -= 1
      if (nivel === 0) return fuenteDossier.slice(i, j + 1)
    }
  }
  throw new Error(`el \`case '${stage}'\` de dossier.ts no cierra llaves — fuente ilegible`)
}

const caseDescartada = bloqueDelCase('DESCARTADA')
assert.match(
  caseDescartada,
  /if \(!motivo\)\s*\{[\s\S]*?throw new DossierTransitionError/,
  'EVALUADA→DESCARTADA perdió el guard de motivoDescarte NO VACÍO dentro de su `case`.\n' +
    '  El tipo exige el campo, pero `string` acepta "" y "   ": sin este guard un descarte ' +
    'con motivo en blanco se persiste igual y la métrica de descarte del admin queda ciega, ' +
    'que es justo lo que el campo existe para evitar.',
)
assert.match(
  caseDescartada,
  /EvaluacionSchema\.safeParse\(dossier\.evaluacionJson\)[\s\S]*?throw new DossierTransitionError/,
  'EVALUADA→DESCARTADA perdió el guard del `evaluacionJson` VÁLIDO dentro de su `case`.\n' +
    '  Ese guard es lo que hace que el descarte no pise la evaluación: el case reescribe ' +
    '`evaluacionJson` con `{...evaluacion.data, motivoDescarte}`, así que sin verificar ' +
    'primero que lo que había parsea, un dossier con evaluacionJson corrupto o ausente ' +
    'termina con un blob que solo tiene el motivo — y el veredicto del Evaluador se pierde, ' +
    'sin error y sin forma de recuperarlo.',
)

const caseRechazada = bloqueDelCase('RECHAZADA')
assert.match(
  caseRechazada,
  /if \(!motivo\)\s*\{[\s\S]*?throw new DossierTransitionError/,
  'EN_REVISION→RECHAZADA perdió el guard de motivo NO VACÍO dentro de su `case`. El motivo ' +
    'es lo único que el setter recibe para saber qué arreglar (F2 lo hizo visible en las 5 ' +
    'pantallas del retrabajo): un rechazo con motivo en blanco lo manda a re-hacer la demo ' +
    'a ciegas.',
)

console.log(
  `✓ invariante OK: el grafo de stage es el censado — ${Object.keys(GRAFO_CENSADO).length} stages y ` +
    `${ARISTAS_CENSADAS} aristas, ni una de más ni una de menos, con el enum de ` +
    'prisma/schema.prisma coincidiendo. FICHA→BRIEF NO es legal y FICHA sigue teniendo una ' +
    'sola salida (EVALUADA): la garantía estructural «no se construye sin veredicto» está en ' +
    `pie. Los ${STAGES_TERMINALES.length} stages sin salida están declarados terminales y ningún ` +
    `otro stage quedó inalcanzable (${STAGE_INICIAL} es el único sin entradas). Las exigencias ` +
    'siguen declaradas donde viven: en el tipo (3 @ts-expect-error, que ts-node compila) y en ' +
    'los guards de runtime de sus `case` (motivo/motivoDescarte no vacíos, evaluacionJson válido).',
)
