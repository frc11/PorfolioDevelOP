/**
 * Chequeo de invariante del PASO SEÑALADO — corre sin DB.
 *
 *   npm run check:invariant:paso-admitido
 *
 * NINGUNA combinación de estado señala como PASO DE AHORA una pantalla cuya
 * tarea ese estado no admite.
 *
 * ── Qué defecto existe para impedir ─────────────────────────────────────────
 * La corrida del novato encontró tres lugares donde el producto señalaba mal, y
 * los tres salían de la misma capa. El barrido de P19
 * (`scripts/qa-corridas/barrido-derivacion.ts`) los midió sobre las 373.248
 * combinaciones que la derivación admite: 41.376 señalaban una pantalla no
 * admitida, y 29.856 de ésas la señalaban como el paso de AHORA — con el badge
 * «Tu paso ahora» y, desde P18, con su acción permanentemente en la barra fija.
 * No eran tres casos: era una raíz. La derivación no recibía el estado de la
 * postergación, así que un lead pausado hasta una fecha futura mostraba el paso
 * de trabajo que le tocara por stage («Agendá la reunión», «Construí la demo»,
 * «Aplicá las correcciones»…), y ningún test de pantalla podía verlo, porque
 * cada pantalla, mirada sola, estaba bien.
 *
 * ── Por qué no puede pasar en verde sobre nada ──────────────────────────────
 * Cuatro dientes, y el tercero es el que de verdad prueba el instrumento:
 *
 *   §1 PISO DEL BARRIDO — un generador que deja de producir estados recorre 0 y
 *      sale 0. Se exige un piso de seis cifras.
 *   §2 TODA PANTALLA SE SEÑALA — si una pantalla del registro deja de ser
 *      alcanzable, el barrido dejaría de ejercer su rama en silencio.
 *   §3 CONDUCTA / SABOTAJE — al censo se le pasan derivaciones TORCIDAS a
 *      propósito y se exige que las vea. Sin esto, un censo que no detecta nada
 *      también estaría «verde». Una de las dos saboteadoras reproduce
 *      exactamente el defecto de P19 (ignorar la postergación): este invariante
 *      se pone rojo contra el código de antes del sprint, y eso se prueba acá
 *      adentro, no de palabra.
 *   §4 LA EXCEPCIÓN SE DECLARA Y SE EXIGE VIVA — el único desacuerdo que queda
 *      es un aterrizaje TERMINAL declarado abajo; si desapareciera, la
 *      declaración quedaría mintiendo y esto se pone en rojo hasta borrarla.
 *
 * Importa los módulos puros directo (relativos, sin `@/`): `manual.ts` y
 * `paso-admitido.ts` son `@/`-free a propósito, así que tsx los carga sin Neon
 * ni tsconfig-paths.
 */
import assert from 'node:assert/strict'
import {
  derivarPantalla,
  PANTALLA_IDS,
  type DerivacionManualInput,
  type PantallaId,
} from './manual.ts'
import {
  admitePantalla,
  censarDesacuerdos,
  type Derivacion,
} from './paso-admitido.ts'

const censo = censarDesacuerdos(derivarPantalla)

// ── §1. Piso del barrido ────────────────────────────────────────────────────

const PISO = 100_000
assert.ok(
  censo.barridos > PISO,
  `el barrido se quedó corto (${censo.barridos} < ${PISO}): un generador que dejó ` +
    `de producir estados recorre poco y sale verde sin haber mirado nada`,
)

// ── §2. Toda pantalla del registro se señala en algún estado ────────────────

for (const id of PANTALLA_IDS) {
  assert.ok(
    (censo.senaladas.get(id) ?? 0) > 0,
    `la pantalla «${id}» no se señaló como actual en ninguno de los ${censo.barridos} ` +
      `estados del barrido: o quedó inalcanzable, o el barrido dejó de cubrir su rama ` +
      `— en los dos casos su afirmación pasa en verde sin mirarla`,
  )
}

// ── §3. Conducta / sabotaje: el censo tiene que VER una derivación torcida ──

/**
 * La saboteadora que reproduce el defecto de P19: ignora la postergación, o sea
 * deriva como si toda pausa comercial ya hubiera vencido. Es LITERALMENTE el
 * comportamiento de antes del sprint — la derivación no recibía el campo.
 */
const derivacionCiegaALaPausa: Derivacion = (input) =>
  derivarPantalla({ ...input, postergadoVencido: true })

const censoCiego = censarDesacuerdos(derivacionCiegaALaPausa)
const activosCiego = censoCiego.desacuerdos.filter((d) => d.peso === 'activo')
assert.ok(
  activosCiego.length > 0,
  'SABOTAJE no detectado: una derivación que ignora la postergación tiene que ' +
    'producir desacuerdos ACTIVOS (leads pausados a los que se les señala trabajo). ' +
    'Si el censo no los ve, no está midiendo nada.',
)
assert.ok(
  activosCiego.some((d) => d.postergacion === 'futuro'),
  'SABOTAJE mal detectado: los desacuerdos de la derivación ciega tienen que caer ' +
    'sobre leads POSTERGADOS con la fecha por delante — que es el estado que el ' +
    'campo distingue.',
)

/** Segunda saboteadora, gruesa: señalar siempre la misma pantalla, y activa. */
const derivacionTerca: Derivacion = () => ({ actual: 'm16', habilitadas: ['m16'] })
const censoTerco = censarDesacuerdos(derivacionTerca)
assert.ok(
  censoTerco.desacuerdos.filter((d) => d.peso === 'activo').length > 0,
  'SABOTAJE no detectado: una derivación que señala «Agendá la reunión» en todo ' +
    'estado tiene que producir desacuerdos activos.',
)

// Y el otro lado del par: el oráculo tiene que decir que SÍ donde corresponde.
// Sin esto, un oráculo que niega todo también dejaría el sabotaje "detectado".
const leadNuevo: DerivacionManualInput = {
  stage: null,
  status: 'PROSPECTO',
  caliente: false,
  ficha: null,
  draftUrl: null,
  progreso: { completadas: [] },
  agenda: null,
  contactos: 0,
  followUpCount: 0,
  followUpVencido: false,
  postergadoVencido: false,
  hayRechazo: false,
  finalUrl: null,
  demoEnviada: false,
}
assert.equal(
  admitePantalla('m1', leadNuevo).admite,
  true,
  'el oráculo niega la ficha de un lead sin veredicto: un oráculo que niega todo ' +
    'hace pasar cualquier sabotaje',
)
assert.equal(
  admitePantalla('m14', leadNuevo).admite,
  false,
  'el oráculo admite el chequeo final sobre un lead que ni siquiera se evaluó',
)
assert.equal(
  admitePantalla('m1', { ...leadNuevo, status: 'POSTERGADO' }).admite,
  false,
  'el oráculo admite trabajo sobre un lead postergado a futuro — es EL caso',
)
assert.equal(
  admitePantalla('m1', { ...leadNuevo, status: 'POSTERGADO', postergadoVencido: true })
    .admite,
  true,
  'el oráculo niega trabajo sobre un postergado YA VENCIDO: la postergación vencida ' +
    'vuelve a ser trabajo de ahora (mismo criterio que `grupoPara` en el panel)',
)

// ── §4. La afirmación, y la única excepción declarada ───────────────────────

const activos = censo.desacuerdos.filter((d) => d.peso === 'activo')
assert.deepEqual(
  activos.map(
    (d) => `${d.stage}/${d.status}/${d.postergacion} → ${d.senala}: ${d.motivo}`,
  ),
  [],
  'HAY estados que señalan como PASO DE AHORA una pantalla que su estado no admite. ' +
    'Con la barra de P18 eso no es una etiqueta: es una acción incorrecta ofrecida ' +
    'permanentemente. Corré `npx tsx scripts/qa-corridas/barrido-derivacion.ts` para ' +
    'ver la tabla completa.',
)

/**
 * Los aterrizajes TERMINALES que quedan declarados. No son pasos: `habilitadas`
 * viene vacía, así que la pantalla se pinta «Completada» y su acción no llega a
 * la barra. Se declaran uno por uno —no se perdonan por categoría— y se exige
 * que sigan ocurriendo: una excepción que ya no pasa es una declaración que
 * miente, y tiene que borrarse.
 *
 * m16 con la reunión ya agendada: el manual aterriza ahí a propósito («la cierra
 * Franco — no hay pantalla por delante»), el cuerpo de la pantalla renderiza el
 * resumen del traspaso, y el único desajuste es el TÍTULO del registro de
 * pantallas, que sigue diciendo «Agendá la reunión». Mudarlo a `espera` haría
 * que `causaDeEspera` —que no mira la agenda— dijera «Le toca al negocio» sobre
 * un lead con reunión reservada: se cambiaría una señal floja por una falsa.
 * Queda declarado y fuera del alcance de P19.
 */
const TERMINALES_DECLARADOS: readonly { senala: PantallaId; motivo: string }[] = [
  { senala: 'm16', motivo: 'la reunión ya está agendada' },
]

const terminales = censo.desacuerdos.filter((d) => d.peso === 'terminal')
for (const d of terminales) {
  assert.ok(
    TERMINALES_DECLARADOS.some(
      (dec) => dec.senala === d.senala && dec.motivo === d.motivo,
    ),
    `aterrizaje terminal NO declarado: ${d.stage}/${d.status} → «${d.senala}» ` +
      `(${d.motivo}). O se arregla, o se declara acá con su motivo.`,
  )
}
for (const dec of TERMINALES_DECLARADOS) {
  assert.ok(
    terminales.some((d) => d.senala === dec.senala && d.motivo === dec.motivo),
    `la excepción declarada «${dec.senala}: ${dec.motivo}» ya no ocurre en ningún ` +
      `estado: la declaración quedó mintiendo — borrala.`,
  )
}

console.log(
  `OK paso señalado — ${censo.barridos} estados barridos, ` +
    `${activos.length} desacuerdos activos, ` +
    `${terminales.reduce((n, d) => n + d.n, 0)} aterrizajes terminales declarados ` +
    `(${terminales.length} clase${terminales.length === 1 ? '' : 's'})`,
)
