/**
 * Chequeo de invariante — UNA DEMO APROBADA SIN EL LINK DE FRANCO NO DERIVA LO
 * MISMO QUE UNA CON EL LINK. Corre sin DB.
 *
 *   npm run check:invariant:aprobada-sin-link
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 * `dossier.finalUrl` —la URL permanente que Franco registra AL APROBAR— es la
 * CONDICIÓN del envío: sin ella no hay link que mandar. El producto tiene cinco
 * superficies que derivan algo de un lead aprobado, y la misma omisión apareció
 * en las cinco, una por una, a lo largo de cuatro sprints: la superficie no
 * proyectaba `finalUrl`, así que trataba «aprobada» como sinónimo de «lista para
 * mandar» y le pedía al setter una acción imposible, o contaba la demo como
 * «esperando al negocio» cuando el negocio ya había contestado.
 *
 * Las cuatro primeras se cerraron a mano. La quinta —la tarjeta de cartera y el
 * contador del panel— se cerró con este invariante al lado, porque el dato que
 * hizo peligroso ese sprint fue éste: NINGÚN chequeo del repo afirmaba la
 * distinción. Se podía romper cualquiera de las cinco y todo seguía en verde.
 *
 * ── Qué se fija, y qué NO ────────────────────────────────────────────────────
 * PARTE A · el censo congelado. Una entrada por derivación, escrita a mano, con
 * su archivo y qué decide. De cada una se afirma que el caso CON link y el caso
 * SIN link dan resultados distintos Y que cada uno da el resultado correcto — no
 * alcanza con que difieran: dos ramas invertidas también difieren. Y se afirma
 * que las dos expectativas de una entrada NO son iguales entre sí, así que una
 * entrada no puede quedar satisfecha por una constante: eso sería una aserción
 * vacua, que es la forma más común de falso verde en este repo.
 *
 * PARTE B · el guard de descubrimiento — la razón por la que no debería haber
 * una SEXTA. El censo de la parte A es a mano, así que por sí solo no ve una
 * superficie nueva: simplemente no la tiene. La parte B cierra eso por el otro
 * lado — congela el CONJUNTO DE ARCHIVOS que pueden derivar algo de un lead
 * aprobado (los que nombran el stage, los que leen `finalUrl`, o los que llaman
 * a los deciders) y falla si el conjunto cambió. Un archivo nuevo ahí es un
 * candidato a sexta superficie y obliga a censarlo antes de seguir.
 *
 * Lo que NO hace: no afirma copy palabra por palabra sobre la UI renderizada
 * (eso lo hace la suite del setter, contra el navegador) y no toca gates ni
 * transiciones — todas las funciones de acá son derivación pura.
 *
 * Importa los módulos puros directo (relativos, con `.ts`): `turno.ts`,
 * `flow.ts` y `manual.ts` tienen su árbol de runtime `@/`-free a propósito, así
 * que el harness los carga sin tsconfig-paths ni Neon.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  clasificarLead,
  contarEnVueloPorTurno,
  gateEnvioDemo,
  motivoOrden,
  vistaDeLead,
  type HomeLeadInput,
} from './flow.ts'
import { derivarPantalla, type DerivacionManualInput } from './manual.ts'
import { admitePantalla } from './paso-admitido.ts'
import { causaDeEspera, turnoDelLead, FALTA_LINK_PERMANENTE } from './turno.ts'

const CON_LINK = 'https://demo-final.example.com'

/**
 * El lead del caso. Dos ejes y nada más: si el negocio ya respondió (el gate del
 * brief/envío) y si Franco cargó su link. Todo lo demás es un aprobado normal
 * sin la demo mandada — el estado exacto de la captura que abrió el sprint.
 */
function leadAprobado(finalUrl: string | null, respondio: boolean): HomeLeadInput {
  return {
    id: `aprobada-${respondio ? 'abierto' : 'cerrado'}-${finalUrl ? 'con' : 'sin'}-link`,
    businessName: 'Negocio Aprobado',
    industry: null,
    zone: null,
    status: respondio ? 'RESPONDIO' : 'PROSPECTO',
    caliente: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    stage: 'APROBADA',
    ficha: null,
    evaluacion: null,
    ultimoRechazo: null,
    agenda: null,
    contactos: 1,
    followUpVencido: false,
    postergadoVencido: false,
    finalUrl,
    demoEnviada: false,
    pinned: false,
    snoozed: false,
    snoozedUntil: null,
    note: null,
  }
}

/** El mismo lead, en la forma que necesita la derivación de pantalla del manual. */
function leadManual(finalUrl: string | null, respondio: boolean): DerivacionManualInput {
  return {
    stage: 'APROBADA',
    status: respondio ? 'RESPONDIO' : 'PROSPECTO',
    caliente: false,
    // P19 — El censo mide el borde `finalUrl`; ni la pausa comercial ni el
    // re-loop entran en juego con este status/stage.
    postergadoVencido: false,
    hayRechazo: false,
    ficha: null,
    draftUrl: 'https://borrador.example.com',
    progreso: { completadas: [] },
    agenda: null,
    contactos: 1,
    followUpCount: 1,
    followUpVencido: false,
    finalUrl,
    demoEnviada: false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTE A · El censo congelado de derivaciones
// ─────────────────────────────────────────────────────────────────────────────

type Derivacion = {
  /** Identificador estable — sale en el mensaje de error. */
  id: string
  /** Dónde vive, para que el rojo diga a qué archivo ir. */
  donde: string
  /** Qué decide esta derivación, en una línea del idioma del producto. */
  decide: string
  /** La derivación, parametrizada SOLO por el link. */
  derivar: (finalUrl: string | null) => unknown
  /** Lo que tiene que dar con el link cargado. */
  conLink: unknown
  /** Lo que tiene que dar sin el link. */
  sinLink: unknown
}

/**
 * EL CENSO. Las cinco superficies, más los dos deciders de los que salen.
 * Agregar una derivación nueva sobre el stage aprobado significa agregar su
 * entrada acá — y el guard de la parte B es lo que obliga a acordarse.
 */
const CENSO: readonly Derivacion[] = [
  {
    id: 'gate-envio',
    donde: 'flow.ts · gateEnvioDemo',
    decide: 'si el envío del link está habilitado (la línea roja, server-side)',
    derivar: (finalUrl) =>
      gateEnvioDemo({ status: 'RESPONDIO', caliente: false, stage: 'APROBADA', finalUrl }),
    conLink: true,
    sinLink: false,
  },
  {
    id: 'causa-espera',
    donde: 'turno.ts · causaDeEspera',
    decide: 'QUÉ se está esperando',
    derivar: (finalUrl) =>
      causaDeEspera({ status: 'PROSPECTO', stage: 'APROBADA', finalUrl, accionPendiente: false }),
    conLink: 'respuesta',
    sinLink: 'linkPermanente',
  },
  {
    id: 'turno',
    donde: 'turno.ts · turnoDelLead',
    decide: 'de quién es la pelota',
    derivar: (finalUrl) =>
      turnoDelLead({ status: 'PROSPECTO', stage: 'APROBADA', finalUrl, accionPendiente: false }),
    conLink: 'negocio',
    sinLink: 'franco',
  },
  {
    id: 'grupo-cartera',
    donde: 'flow.ts · grupoPara (vía clasificarLead)',
    decide: 'en qué cola de la cartera cae el lead',
    derivar: (finalUrl) => clasificarLead(leadAprobado(finalUrl, true)).grupo,
    conLink: 'trabajar',
    sinLink: 'seguimiento',
  },
  {
    id: 'accionable',
    donde: 'flow.ts · proximaAccionPara (vía clasificarLead)',
    decide: 'si la tarjeta se pinta en cyan accionable o en neutro de espera',
    derivar: (finalUrl) => clasificarLead(leadAprobado(finalUrl, true)).accionable,
    conLink: true,
    sinLink: false,
  },
  {
    id: 'sugerencia-tarjeta',
    donde: 'flow.ts · proximaAccionPara (vía clasificarLead)',
    decide: 'la línea más leída del producto: qué hacer con este lead',
    derivar: (finalUrl) => clasificarLead(leadAprobado(finalUrl, true)).proximaAccion,
    conLink: 'Demo aprobada — mandá el link al negocio',
    sinLink: `Le toca a Franco — ${FALTA_LINK_PERMANENTE}`,
  },
  {
    id: 'rotulo-orden',
    donde: 'flow.ts · motivoOrden',
    decide: 'por qué la tarjeta ocupa su lugar en la cola de trabajo',
    derivar: (finalUrl) => motivoOrden(clasificarLead(leadAprobado(finalUrl, true))),
    // Fuera de «trabajar» no hay rótulo de orden que mostrar: el criterio de
    // orden sólo aplica a la cola de trabajo.
    conLink: 'La demo está lista para mandar',
    sinLink: null,
  },
  {
    id: 'filtro-cartera',
    donde: 'flow.ts · vistaDeLead',
    decide: 'bajo qué filtro de la cartera lo encuentra el setter',
    derivar: (finalUrl) => vistaDeLead(clasificarLead(leadAprobado(finalUrl, true))),
    conLink: 'trabajar',
    sinLink: 'seguimiento',
  },
  {
    id: 'contador-panel',
    donde: 'flow.ts · contarEnVueloPorTurno (lo muestra setter/page.tsx)',
    decide: 'a quién dice el panel que el setter está esperando',
    // Gate CERRADO: con el gate abierto el aprobado CON link es trabajo y no
    // llega al conteo. Éste es el caso que el panel contaba mal —los dos caían
    // en «esperando al negocio»— y el negocio no tenía nada que ver con uno.
    derivar: (finalUrl) => contarEnVueloPorTurno([clasificarLead(leadAprobado(finalUrl, false))]),
    conLink: { negocio: 1, franco: 0, setter: 0 },
    sinLink: { negocio: 0, franco: 1, setter: 0 },
  },
  {
    id: 'pantalla-manual',
    donde: 'manual.ts · posicionDe (vía derivarPantalla)',
    decide: 'en qué pantalla del manual aterriza el setter al abrir el lead',
    derivar: (finalUrl) => derivarPantalla(leadManual(finalUrl, true)).actual,
    conLink: 'm15',
    sinLink: 'espera',
  },
  {
    // P19 — La SEXTA que el censo estaba esperando, y llegó como oráculo: el
    // módulo que decide si el estado admite la tarea de una pantalla. Si
    // admitiera «Mandá el link» sin link cargado, `paso-admitido.invariant.ts`
    // dejaría pasar en verde exactamente la derivación que este censo prohíbe.
    // No re-deriva el gate: llama a `gateEnvioDemo`, el del motor.
    id: 'admision-envio',
    donde: 'paso-admitido.ts · admitePantalla(«m15»)',
    decide: 'si el oráculo del paso señalado da por hacible «Mandá el link al negocio»',
    derivar: (finalUrl) => admitePantalla('m15', leadManual(finalUrl, true)).admite,
    conLink: true,
    sinLink: false,
  },
]

const ids = CENSO.map((entrada) => entrada.id)
assert.equal(
  new Set(ids).size,
  ids.length,
  'Hay dos entradas del censo con el mismo id: el mensaje de error no diría cuál falló.',
)

for (const entrada of CENSO) {
  const { id, donde, decide, derivar, conLink, sinLink } = entrada

  // Anti-vacuidad. Una entrada cuyas dos expectativas son iguales pasa siempre,
  // incluso sobre una derivación que ignore `finalUrl` por completo. Ya hubo
  // cinco falsos verdes en este repo y cuatro eran aserciones de esta forma.
  assert.notDeepStrictEqual(
    conLink,
    sinLink,
    `[${id}] El censo espera LO MISMO con y sin link, así que esta entrada no ` +
      `prueba nada: pasaría igual sobre una derivación que ignore \`finalUrl\`. ` +
      `Corregí las expectativas de ${donde}.`,
  )

  assert.deepStrictEqual(
    derivar(CON_LINK),
    conLink,
    `[${id}] Con el link permanente cargado, ${donde} tiene que decidir ` +
      `${JSON.stringify(conLink)} y decidió ${JSON.stringify(derivar(CON_LINK))}. ` +
      `Eso cambia ${decide} para una demo que SÍ se puede mandar.`,
  )

  assert.deepStrictEqual(
    derivar(null),
    sinLink,
    `[${id}] Franco aprobó la demo pero todavía no cargó su link permanente, y ` +
      `${donde} decidió ${JSON.stringify(derivar(null))} en vez de ` +
      `${JSON.stringify(sinLink)} — lo mismo que decide con el link cargado. ` +
      `Esta superficie está tratando «aprobada» como «lista para mandar»: le pide ` +
      `al setter una acción que no puede hacer (no hay link que mandar), o cuenta ` +
      `la demo como espera del negocio, que ya contestó y no tiene nada que hacer. ` +
      `Le toca a Franco. Revisá ${decide} en ${donde}.`,
  )
}

// El texto corto de la tarjeta es EL MISMO fragmento que el envío ya mostraba —
// no una segunda redacción del mismo hecho, que es como nacieron las cinco.
assert.ok(
  String(CENSO.find((entrada) => entrada.id === 'sugerencia-tarjeta')?.sinLink).includes(
    FALTA_LINK_PERMANENTE,
  ),
  'La sugerencia de la tarjeta dejó de reusar `FALTA_LINK_PERMANENTE`: si el ' +
    'texto se reescribe aparte, vuelve a poder decir algo distinto que el envío.',
)

// ─────────────────────────────────────────────────────────────────────────────
// PARTE B · El guard de descubrimiento (que no aparezca una sexta)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Un archivo puede derivar algo de un lead aprobado sólo si nombra el stage, lee
 * su link, o llama a alguno de los deciders. Se busca el LITERAL (no la palabra
 * suelta) para no entrar por una mención en prosa.
 */
const SENALES = [
  "'APROBADA'",
  'finalUrl',
  'turnoDelLead(',
  'causaDeEspera(',
  'gateEnvioDemo(',
  'contarEnVueloPorTurno(',
]

/**
 * EL CONJUNTO CONGELADO, al 2026-08-27. Si esto falla, NO lo actualices sin
 * mirar: un archivo nuevo acá es un candidato a SEXTA superficie y lo primero es
 * preguntarse si distingue los dos casos. Si deriva una acción, sumale su
 * entrada al censo de arriba y RECIÉN DESPUÉS sumá el archivo a esta lista. Que
 * cueste dos renglones es el punto.
 */
const ARCHIVOS_CENSADOS: readonly string[] = [
  'src/app/(protected)/admin/leados/[leadId]/_components/decision-bar.tsx',
  'src/app/(protected)/admin/leados/[leadId]/page.tsx',
  'src/app/(protected)/admin/leados/_actions/revision.actions.ts',
  'src/app/(protected)/admin/leados/_actions/revision.schemas.ts',
  'src/app/(protected)/setter/_actions/outreach.actions.ts',
  'src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx',
  'src/app/(protected)/setter/leads/[leadId]/manual/_components/envio-form.tsx',
  'src/app/(protected)/setter/leads/[leadId]/manual/_components/estado-manual.tsx',
  'src/app/(protected)/setter/leads/[leadId]/manual/_components/m15-envio.tsx',
  'src/app/(protected)/setter/leads/[leadId]/manual/_data.ts',
  'src/app/(protected)/setter/page.tsx',
  'src/lib/leados/copy-blocks.ts',
  'src/lib/leados/dossier-stage.ts',
  'src/lib/leados/dossier.ts',
  'src/lib/leados/flow.ts',
  'src/lib/leados/guidance-content.ts',
  'src/lib/leados/home.ts',
  'src/lib/leados/manual.ts',
  'src/lib/leados/paso-admitido.ts',
  'src/lib/leados/paso.ts',
  'src/lib/leados/turno.ts',
]

const RAIZ_SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function archivosDeFuente(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) {
      salida.push(...archivosDeFuente(ruta))
      continue
    }
    if (!/\.tsx?$/.test(entrada.name)) continue
    // Los invariantes son la red, no la superficie: nombran el stage a propósito.
    if (entrada.name.endsWith('.invariant.ts')) continue
    salida.push(ruta)
  }
  return salida
}

const encontrados = archivosDeFuente(RAIZ_SRC)
  .filter((ruta) => {
    const contenido = readFileSync(ruta, 'utf8')
    return SENALES.some((senal) => contenido.includes(senal))
  })
  .map((ruta) => `src/${relative(RAIZ_SRC, ruta).split(sep).join('/')}`)
  .sort()

const censados = [...ARCHIVOS_CENSADOS].sort()
const nuevos = encontrados.filter((ruta) => !censados.includes(ruta))
const desaparecidos = censados.filter((ruta) => !encontrados.includes(ruta))

assert.deepStrictEqual(
  nuevos,
  [],
  `Aparecieron archivos que tocan la derivación del lead APROBADO y no están en ` +
    `el censo:\n${nuevos.map((ruta) => `    · ${ruta}`).join('\n')}\n` +
    `  Cada uno es un candidato a SEXTA superficie. Antes de sumarlo a ` +
    `ARCHIVOS_CENSADOS, verificá que distinga el aprobado CON link del aprobado ` +
    `SIN link — y si deriva una acción, sumale su entrada al censo de arriba.`,
)

assert.deepStrictEqual(
  desaparecidos,
  [],
  `Archivos censados que ya no tocan la derivación del lead APROBADO:\n` +
    `${desaparecidos.map((ruta) => `    · ${ruta}`).join('\n')}\n` +
    `  Si se renombraron o se movieron, actualizá ARCHIVOS_CENSADOS. Si dejaron ` +
    `de leer \`finalUrl\`, la distinción se PERDIÓ ahí: eso es el bug volviendo.`,
)

console.log(
  `✓ aprobada-sin-link: ${CENSO.length} derivaciones censadas distinguen el ` +
    `aprobado con link del aprobado sin link; ${encontrados.length} archivos en ` +
    `el conjunto congelado, sin altas ni bajas.`,
)
