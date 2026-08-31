/**
 * Chequeo de invariante del VOCABULARIO de las pantallas del setter — sin DB.
 *
 *   npm run check:invariant:copy-sin-jerga
 *
 * NINGUNA frase que el setter pueda leer nombra un código de sprint interno ni
 * una columna de la base.
 *
 * Qué protege. El último paso del recorrido moría con esto, literal:
 *
 *     «Setup B7.0 pendiente: cargá en la organización develOP el username de
 *      Cal.com (calComUsername) y el slug del event type (calComEmbedUrl…).»
 *
 * Un código de sprint y dos columnas, en imperativo, para alguien que no entra a
 * la base. El arreglo puntual de ese mensaje no vale nada solo: el próximo hueco
 * de configuración iba a hablar igual. Lo que fija este invariante es que la
 * PRÓXIMA frase no pueda entrar así.
 *
 * ── El sujeto: la PROSA, no los identificadores ──────────────────────────────
 * El instrumento ingenuo (buscar nombres de columna en cualquier literal) se
 * ahoga en falsos positivos: `'businessName'` como clave de Prisma, `'notes'`
 * como `name` de un input, `'assignedToId'` como `orderBy`. Ninguno es copy.
 * El discriminador medido es la FORMA: el copy es una oración (varias palabras,
 * separadas por espacios); una clave es un identificador suelto. Por eso solo se
 * miran literales con `PALABRAS_MINIMAS` tokens o más.
 *
 * Y de las columnas se vigilan solo las que tienen JOROBA (`calComUsername`,
 * `evaluacionJson`): una columna toda en minúscula —`lead`, `notas`, `zona`— es
 * además una palabra del castellano, y prohibirla prohibiría el vocabulario del
 * producto. Esas quedan afuera a propósito, y es el límite conocido del chequeo.
 *
 * ── La única jerga permitida, y por qué se prueba sola ───────────────────────
 * `dossier.ts` habla en jerga de máquina de estados a PROPÓSITO: sus mensajes
 * son la CLAVE que `error-copy.ts` traduce antes de que salgan al cliente (ver
 * el encabezado de ese archivo). Así que no hay lista de excepciones escrita a
 * mano para eso: una frase con jerga se perdona SI Y SOLO SI `error-copy.ts` la
 * tiene como clave traducida. Si alguien borra la traducción, la frase deja de
 * estar perdonada y esto se pone en rojo — que es exactamente lo que tiene que
 * pasar, porque en ese momento la jerga sí llegaría a la pantalla.
 *
 * ── Por qué no puede pasar en verde sobre nada ───────────────────────────────
 * Un barrido que deja de matchear descubre 0 archivos, examina 0 frases y sale
 * 0. Contra eso hay tres dientes: el piso de barrido (§4), el piso de la lista
 * de columnas leída del schema (§1) y —el que de verdad prueba el detector— el
 * par CONDUCTA/SABOTAJE de §0, que le da al detector fuentes sintéticas con la
 * jerga adentro y exige que las encuentre, y fuentes limpias y exige que no.
 * Sin ese par, un detector que no detecta nada también estaría "verde".
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = process.cwd()

/** Dónde vive el texto que el setter puede leer. */
const AMBITO = [
  join(RAIZ, 'src', 'app', '(protected)', 'setter'),
  join(RAIZ, 'src', 'lib', 'leados'),
  // Los `message` de este error viajan al setter tal cual (`mapError` de
  // agenda.actions.ts los devuelve sin traducir) y no los usa nadie más.
  join(RAIZ, 'src', 'lib', 'integrations', 'cal-com-v2.ts'),
]

/** Cuántos tokens hacen de un literal una ORACIÓN y no una clave. */
const PALABRAS_MINIMAS = 4

/**
 * Un código de sprint: `B7.0`, `B6`, `FG-2`, `admin-1b`, `P5-B`. Es la forma que
 * tienen los rótulos internos del repo — sirven en un comentario y en la
 * bitácora, no en una pantalla.
 */
const SPRINT = /\b(?:[A-Z]{1,3}\d+(?:[.-][0-9A-Za-z]+)*|admin-\d+[a-z]?|FG-\d(?:\.\d)?)\b/g

// ── Las columnas, leídas del schema (fuente distinta del sujeto) ─────────────
// El fixture NO se deriva de la copy que vigila: sale de `prisma/schema.prisma`.
// Un invariante que arma sus fixtures de la misma lista que mira da falso verde.
function columnasConJoroba(): Set<string> {
  const schema = readFileSync(join(RAIZ, 'prisma', 'schema.prisma'), 'utf8')
  const salida = new Set<string>()
  for (const m of schema.matchAll(/^\s{2}([a-z][A-Za-z0-9_]*)\s+\S/gm)) {
    const columna = m[1]!
    if (/[A-Z]/.test(columna)) salida.add(columna)
  }
  return salida
}

const COLUMNAS = columnasConJoroba()

// ── §1 · La lista tiene que existir ─────────────────────────────────────────
assert.ok(
  COLUMNAS.size >= 100,
  `se leyeron ${COLUMNAS.size} columnas con joroba de prisma/schema.prisma, se esperaban ≥100 — ` +
    '¿cambió el formato del schema? El detector quedaría sin nada que buscar y pasaría en verde',
)
for (const conocida of ['calComUsername', 'calComEmbedUrl', 'evaluacionJson', 'assignedToId']) {
  assert.ok(COLUMNAS.has(conocida), `la lista de columnas perdió "${conocida}" — el lector del schema se rompió`)
}

// ── El detector, como función pura sobre un texto fuente ────────────────────

export type Hallazgo = { linea: number; texto: string; codigos: string[]; columnas: string[] }

const BLOQUE = /\/\*[\s\S]*?\*\//g
const LINEA = /^[ \t]*\/\/.*$/gm
const LITERAL = /'((?:[^'\n]|\\')*)'|"((?:[^"\n]|\\")*)"|`([^`]*)`/g
const CONSOLE = /\bconsole\s*\.\s*\w+\s*\(/g

/** Blanquea de `desde` (el `(` de la llamada) hasta su paréntesis de cierre. */
function blanquearLlamada(fuente: string, desde: number): [number, number] | null {
  let profundidad = 0
  for (let i = desde; i < fuente.length; i++) {
    const c = fuente[i]!
    if (c === "'" || c === '"' || c === '`') {
      const comilla = c
      i++
      while (i < fuente.length && fuente[i] !== comilla) {
        if (fuente[i] === '\\') i++
        i++
      }
      continue
    }
    if (c === '(') profundidad++
    else if (c === ')') {
      profundidad--
      if (profundidad === 0) return [desde, i + 1]
    }
  }
  return null
}

/**
 * Deja la fuente con solo lo que PUEDE llegar a una pantalla. Se blanquean, sin
 * mover ni un carácter (así los números de línea siguen siendo los reales):
 *   - los comentarios: explican el porqué, nadie los lee desde el panel;
 *   - los argumentos de `console.*`: ese es el log del SERVIDOR, que es
 *     justamente adonde este sprint mandó el detalle técnico que el setter no
 *     necesita. Un `console.warn` con nombres de columna es el comportamiento
 *     buscado; el mismo texto en un `fail()` es el bug.
 */
function soloLoQueSeVe(fuente: string): string {
  let limpia = fuente
    .replace(BLOQUE, (m) => m.replace(/[^\n]/g, ' '))
    .replace(LINEA, (m) => ' '.repeat(m.length))

  CONSOLE.lastIndex = 0
  const rangos: [number, number][] = []
  for (const m of limpia.matchAll(CONSOLE)) {
    const rango = blanquearLlamada(limpia, m.index! + m[0]!.length - 1)
    if (rango) rangos.push(rango)
  }
  for (const [ini, fin] of rangos.reverse()) {
    const trozo = limpia.slice(ini, fin).replace(/[^\n]/g, ' ')
    limpia = limpia.slice(0, ini) + trozo + limpia.slice(fin)
  }
  return limpia
}

/**
 * Las frases de `fuente` que nombran jerga. Las interpolaciones `${…}` se
 * reemplazan por `~`: adentro va código, no copy.
 */
export function jergaEnProsa(fuente: string, columnas: Set<string>): Hallazgo[] {
  const limpia = soloLoQueSeVe(fuente)

  const hallazgos: Hallazgo[] = []
  for (const m of limpia.matchAll(LITERAL)) {
    const texto = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, '~')
    if (texto.trim().split(/\s+/).filter(Boolean).length < PALABRAS_MINIMAS) continue

    const codigos = [...new Set([...texto.matchAll(SPRINT)].map((x) => x[0]!))]
    const cols = [
      ...new Set(
        [...texto.matchAll(/\b[a-z][a-zA-Z0-9]{3,}\b/g)].map((x) => x[0]!).filter((w) => columnas.has(w)),
      ),
    ]
    if (codigos.length === 0 && cols.length === 0) continue
    hallazgos.push({
      linea: fuente.slice(0, m.index!).split('\n').length,
      texto,
      codigos,
      columnas: cols,
    })
  }
  return hallazgos
}

// ── §0 · CONDUCTA / SABOTAJE — la prueba del detector ───────────────────────
// Cada par: una fuente donde la jerga ESTÁ (el detector DEBE encontrarla) y una
// donde no (el detector NO debe inventarla). Sin el par, un detector apagado
// pasaría los dos.
{
  const casos: { nombre: string; fuente: string; espera: boolean }[] = [
    {
      nombre: 'CONDUCTA · código de sprint en una oración',
      fuente: "return fail('Setup B7.0 pendiente: cargá el username de Cal.com en la organización')",
      espera: true,
    },
    {
      nombre: 'CONDUCTA · columna de la base en una oración',
      fuente: "return fail('Falta cargar calComUsername antes de poder buscar horarios libres')",
      espera: true,
    },
    {
      nombre: 'CONDUCTA · jerga adentro de un template con interpolación',
      fuente: 'return fail(`Hay ${n} organizaciones con calComEmbedUrl cargado, se necesita una sola`)',
      espera: true,
    },
    {
      nombre: 'SABOTAJE · la misma jerga, pero en un comentario de línea',
      fuente: "// Setup B7.0 pendiente: cargá calComUsername\nreturn fail('Avisale a Franco')",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · la misma jerga, pero en un comentario de bloque',
      fuente: "/* decía: cargá calComUsername y calComEmbedUrl */\nreturn fail('Avisale a Franco')",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · identificador suelto (clave de Prisma), no una oración',
      fuente: "select: { calComUsername: true }, orderBy: 'assignedToId'",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · copy legítimo del producto, sin jerga',
      fuente: "return fail('La agenda de Franco todavía no está conectada — avisale y volvé')",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · el detalle técnico en el log del SERVIDOR (console.*)',
      fuente:
        "console.warn('Cal.com sin configurar: ninguna Organization tiene calComUsername cargado')",
      espera: false,
    },
    {
      // El par que le da sentido al anterior: no es el TEXTO lo que se perdona,
      // es el destino. La misma frase saliendo a la pantalla tiene que doler.
      nombre: 'CONDUCTA · esa misma frase, pero saliendo a la pantalla',
      fuente: "return fail('Cal.com sin configurar: ninguna Organization tiene calComUsername cargado')",
      espera: true,
    },
  ]

  for (const caso of casos) {
    const encontrado = jergaEnProsa(caso.fuente, COLUMNAS).length > 0
    assert.equal(
      encontrado,
      caso.espera,
      `el detector falló su propia prueba — ${caso.nombre}: esperaba ${caso.espera ? 'ENCONTRAR' : 'NO encontrar'} ` +
        'jerga y pasó lo contrario. Sin este par, un detector roto pasa en verde sobre toda la superficie',
    )
  }
}

// ── §2 · Lo único perdonado: la clave que `error-copy.ts` traduce ───────────
const ERROR_COPY = readFileSync(join(RAIZ, 'src', 'lib', 'leados', 'error-copy.ts'), 'utf8')

/** Las claves literales del mapa de traducción — la prueba de que no salen crudas. */
const CLAVES_TRADUCIDAS = new Set(
  [...ERROR_COPY.matchAll(/^\s{2}'((?:[^'\\]|\\.)*)':/gm)].map((m) => m[1]!),
)
assert.ok(
  CLAVES_TRADUCIDAS.size >= 10,
  `se leyeron ${CLAVES_TRADUCIDAS.size} claves de error-copy.ts, se esperaban ≥10 — el lector del mapa ` +
    'se rompió y este invariante perdonaría cualquier cosa (o nada)',
)

/**
 * Lo que NO es copy de pantalla aunque viva en el ámbito. Cada entrada con su
 * `prueba`: si el motivo deja de ser cierto en el archivo, la excusa no matchea
 * y la frase vuelve a la regla.
 */
const EXIMIDAS: Record<string, { motivo: string; prueba: RegExp }> = {
  'setter/_actions/outreach.actions.ts::Enviada por el setter desde LeadOS (B6)': {
    motivo:
      'no es un mensaje: es el `notes` del registro OsDemo que crea crearDemoComercial — queda en la base ' +
      'como apunte de auditoría y ninguna pantalla del setter lo renderiza (el timeline lee Activity.notes)',
    prueba: /crearDemoComercial\s*\(\s*\{[\s\S]{0,400}?notes\s*:\s*'Enviada por el setter desde LeadOS \(B6\)'/,
  },
}

// ── §3 · El barrido ─────────────────────────────────────────────────────────
function fuentesDelAmbito(ruta: string, salida: string[] = []): string[] {
  const stat = statSync(ruta)
  if (stat.isFile()) {
    if (/\.(ts|tsx)$/.test(ruta) && !/\.invariant\.ts$/.test(ruta)) salida.push(ruta)
    return salida
  }
  for (const entrada of readdirSync(ruta, { withFileTypes: true })) {
    if (entrada.name === '__tests__') continue
    fuentesDelAmbito(join(ruta, entrada.name), salida)
  }
  return salida
}

function corto(ruta: string): string {
  return ruta.slice(RAIZ.length + 1).replace(/\\/g, '/').replace(/^src\/app\/\(protected\)\//, '')
}

const archivos = AMBITO.flatMap((ruta) => fuentesDelAmbito(ruta))
let prosaExaminada = 0
const eximidasVistas = new Set<string>()

for (const ruta of archivos) {
  const fuente = readFileSync(ruta, 'utf8')
  // El MISMO blanqueo del detector: la cuenta del piso tiene que medir lo que
  // el detector realmente mira, no una superficie más grande que la disimule.
  const limpia = soloLoQueSeVe(fuente)
  for (const m of limpia.matchAll(LITERAL)) {
    const texto = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, '~')
    if (texto.trim().split(/\s+/).filter(Boolean).length >= PALABRAS_MINIMAS) prosaExaminada++
  }

  const nombre = corto(ruta)
  for (const hallazgo of jergaEnProsa(fuente, COLUMNAS)) {
    // Perdonada por traducción: la frase es una CLAVE de error-copy.ts. Vale
    // tanto para el `throw` de dossier.ts como para la clave del propio mapa.
    if (CLAVES_TRADUCIDAS.has(hallazgo.texto)) continue

    const clave = `${nombre}::${hallazgo.texto}`
    const eximida = EXIMIDAS[clave]
    if (eximida) {
      eximidasVistas.add(clave)
      assert.ok(
        eximida.prueba.test(fuente),
        `${clave} está eximida porque «${eximida.motivo}», pero eso ya no es cierto en el archivo: ` +
          'la prueba no matchea. O se reescribe la frase, o se corrige el motivo',
      )
      continue
    }

    const que = [
      hallazgo.codigos.length ? `código(s) de sprint: ${hallazgo.codigos.join(', ')}` : null,
      hallazgo.columnas.length ? `columna(s) de la base: ${hallazgo.columnas.join(', ')}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    assert.fail(
      `${nombre}:${hallazgo.linea} — una frase que el setter puede leer nombra ${que}:\n` +
        `    «${hallazgo.texto.slice(0, 200)}»\n` +
        '  El setter no entra a la base ni conoce los sprints. Escribila en idioma de negocio, decí a quién ' +
        'pedirle lo que falta (el patrón del producto es «avisale a Franco»), y dejá el detalle técnico en un ' +
        'log del servidor. Si de verdad no es copy de pantalla, va a EXIMIDAS con su motivo y su prueba.',
    )
  }
}

// ── §4 · El piso del barrido ────────────────────────────────────────────────
assert.ok(
  archivos.length >= 100 && prosaExaminada >= 500,
  `barrido flaco: ${archivos.length} archivos / ${prosaExaminada} frases — se esperaban ≥100 y ≥500. ` +
    'El invariante no está viendo la superficie del setter y pasaría en verde sobre casi nada',
)

for (const clave of Object.keys(EXIMIDAS)) {
  assert.ok(
    eximidasVistas.has(clave),
    `${clave} figura en EXIMIDAS pero ya no aparece en el código — sacala de la lista`,
  )
}

console.log(
  `✓ invariante OK: ninguna de las ${prosaExaminada} frases de las ${archivos.length} fuentes del setter ` +
    `nombra un código de sprint ni una de las ${COLUMNAS.size} columnas con joroba del schema ` +
    `(${CLAVES_TRADUCIDAS.size} claves del motor perdonadas por traducción, ${eximidasVistas.size} eximidas).`,
)
