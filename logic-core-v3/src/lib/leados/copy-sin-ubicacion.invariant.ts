/**
 * P23 — Chequeo de invariante: NINGUNA copy del setter dice DÓNDE está una cosa.
 *
 *   npm run check:invariant:copy-sin-ubicacion
 *
 * Qué protege. La segunda corrida del novato leyó esto en mc1 y mc2:
 *
 *     «Los tildes se abren cuando arranques la construcción — el botón
 *      «Arrancar construcción» está acá arriba.»
 *
 * El botón NO está arriba. P18 lo mudó a la barra de acción, que es
 * `sticky bottom-0`: vive pegada al borde de ABAJO del scroller, en cualquier
 * posición del scroll. La frase era correcta el día que se escribió y dejó de
 * serlo cuando otro sprint movió lo que nombraba — y ninguna prueba lo vio,
 * porque ninguna comparaba la frase con la posición real.
 *
 * ── Por qué la regla es «no digas dónde», y no «decí bien dónde» ─────────────
 * Arreglar la frase para que dijera «abajo» la habría dejado igual de frágil: el
 * próximo sprint que toque el layout la rompe otra vez, en silencio, y el costo
 * lo paga el setter que busca un botón donde no está. Nombrar el control
 * («el botón «Arrancar construcción»») alcanza para encontrarlo —el ojo lo busca
 * por su nombre, que es lo único que no se mueve— y no afirma nada que el CSS
 * pueda desmentir. Cuando además hace falta llegar a otra pantalla, el nombre ES
 * el enlace (`EnlacePantalla`), que es lo que la rama RECHAZADA de ese mismo
 * componente ya hacía bien.
 *
 * El instrumento que MIDIÓ el defecto —frase contra posición computada, en el
 * navegador— es `scripts/qa-corridas/_p23/censo-ubicaciones.ts`. Este chequeo es
 * su red permanente: corre sin navegador y sin DB, así que puede correr siempre.
 *
 * ── Por qué no puede pasar en verde sobre nada ──────────────────────────────
 * Tres dientes, el mismo criterio que `copy-sin-jerga.invariant.ts`:
 *   §0 el par CONDUCTA/SABOTAJE, que le da al detector frases con ubicación y
 *      frases sin ella y exige que distinga;
 *   §1 el piso de barrido (archivos y frases examinadas);
 *   §2 el barrido real sobre el ámbito del setter.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const RAIZ = process.cwd()

/** Dónde vive el texto que el setter puede leer. Mismo ámbito que `copy-sin-jerga`. */
const AMBITO = [
  join(RAIZ, 'src', 'app', '(protected)', 'setter'),
  join(RAIZ, 'src', 'lib', 'leados'),
]

/** Cuántos tokens hacen de un literal una ORACIÓN y no una clave. */
const PALABRAS_MINIMAS = 4

/**
 * Las palabras que atan una frase a una posición del layout. Es la MISMA lista
 * que usa el censo en el navegador — si una entra acá, entra allá.
 */
const UBICACION =
  /(ac[aá] arriba|ac[aá] abajo|m[aá]s arriba|m[aá]s abajo|de arriba|de abajo|ah[ií] abajo|ah[ií] arriba|est[aá] arriba|est[aá] abajo|al costado|en el rail|arriba a la derecha|arriba a la izquierda|abajo a la derecha|abajo a la izquierda)/gi

/**
 * La ÚNICA excepción, y se justifica: `copy-blocks.ts` arma el texto que el
 * setter COPIA y pega en un chat de IA. Su «pegala acá abajo» no habla de la
 * pantalla: habla del lugar dentro del mensaje pegado, debajo del marcador
 * `>>>`. Ese texto no lo dibuja ningún layout, así que ningún sprint puede
 * moverlo. La excepción es por ARCHIVO y por FRASE — no una lista abierta.
 */
const PERMITIDAS: readonly { archivo: string; contiene: string; porque: string }[] = [
  {
    archivo: join('src', 'lib', 'leados', 'copy-blocks.ts'),
    contiene: 'OBJECIÓN RECIBIDA',
    porque:
      'la ubicación es DENTRO del bloque que el setter copia y pega (debajo del marcador >>>), no en la pantalla',
  },
]

// ── El detector, como función pura sobre un texto fuente ────────────────────

export type HallazgoUbicacion = { linea: number; texto: string; palabras: string[] }

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
 * Deja la fuente con solo lo que PUEDE llegar a una pantalla: se blanquean los
 * comentarios (que explican el porqué y sí pueden decir «el bloque de arriba»,
 * porque hablan del CÓDIGO) y los argumentos de `console.*` (log del servidor).
 * Se blanquea sin mover ni un carácter, para que las líneas sigan siendo reales.
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
 * TEXTO SUELTO DE JSX — el que va entre `>` y `<`, sin comillas.
 *
 * No es un detalle: el defecto que abrió este chequeo vivía EXACTAMENTE ahí
 * (`m-construccion.tsx`, dentro de un `<p>`), y un detector que sólo mirara
 * literales entre comillas lo habría dejado pasar. Está medido: la primera
 * versión de este archivo falló su propio caso de CONDUCTA por esto.
 *
 * Se corta en `{` y `}` a propósito: una interpolación es código, y el texto de
 * cada lado es un tramo independiente — que es como se lee en pantalla.
 */
const TEXTO_JSX = />([^<>{}]+)</g

/** Todo lo que una pantalla puede DECIR: literales entre comillas + texto de JSX. */
function frasesDe(fuente: string): { texto: string; index: number }[] {
  const limpia = soloLoQueSeVe(fuente)
  const salida: { texto: string; index: number }[] = []
  for (const m of limpia.matchAll(LITERAL)) {
    salida.push({
      texto: (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, '~'),
      index: m.index!,
    })
  }
  for (const m of limpia.matchAll(TEXTO_JSX)) {
    // El salto de línea del JSX es sangría, no una pausa: se normaliza antes de
    // buscar, o «acá⏎arriba» no matchea.
    salida.push({ texto: m[1]!.replace(/\s+/g, ' ').trim(), index: m.index! })
  }
  return salida
}

/** Las frases de `fuente` que dicen una ubicación. */
export function ubicacionEnProsa(fuente: string): HallazgoUbicacion[] {
  const hallazgos: HallazgoUbicacion[] = []
  for (const { texto, index } of frasesDe(fuente)) {
    if (texto.trim().split(/\s+/).filter(Boolean).length < PALABRAS_MINIMAS) continue
    const palabras = [...new Set([...texto.matchAll(UBICACION)].map((x) => x[0]!.toLowerCase()))]
    if (palabras.length === 0) continue
    hallazgos.push({
      linea: fuente.slice(0, index).split('\n').length,
      texto,
      palabras,
    })
  }
  return hallazgos
}

// ── §0 · CONDUCTA / SABOTAJE — la prueba del detector ───────────────────────
{
  const casos: { nombre: string; fuente: string; espera: boolean }[] = [
    {
      nombre: 'CONDUCTA · el defecto textual de P23',
      fuente:
        "return <p>Los tildes se abren cuando arranques la construcción — el botón «Arrancar construcción» está acá arriba.</p>",
      espera: true,
    },
    {
      nombre: 'CONDUCTA · «de abajo» en una frase del panel',
      fuente: "const t = 'Quedan 3 más para trabajar, en tu cartera (acá abajo).'",
      espera: true,
    },
    {
      nombre: 'CONDUCTA · «más abajo» suelto',
      fuente: "const t = 'Tu cartera completa está más abajo.'",
      espera: true,
    },
    {
      nombre: 'SABOTAJE · el arreglo correcto (nombra el control, no lo ubica)',
      fuente:
        "return <p>Los tildes se abren cuando arranques la construcción, con el botón «Arrancar construcción».</p>",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · un COMENTARIO puede hablar del código',
      fuente: "// el bloque copiable de arriba va a Claude Design\nconst t = 'Copiá el bloque y pegalo ahí como primer mensaje.'",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · un console.* del servidor no es copy',
      fuente: "console.warn('el aviso de arriba no se pudo emitir para este lead')",
      espera: false,
    },
    {
      nombre: 'SABOTAJE · un identificador suelto no es una oración',
      fuente: "const orden = 'de-abajo'",
      espera: false,
    },
  ]
  for (const caso of casos) {
    const hallo = ubicacionEnProsa(caso.fuente).length > 0
    assert.equal(
      hallo,
      caso.espera,
      `${caso.nombre}: el detector ${hallo ? 'encontró' : 'NO encontró'} ubicación y se esperaba lo contrario`,
    )
  }
}

// ── §1/§2 · El barrido real ─────────────────────────────────────────────────

function archivosDe(dir: string): string[] {
  const salida: string[] = []
  const stack = [dir]
  while (stack.length > 0) {
    const actual = stack.pop()!
    for (const entrada of readdirSync(actual)) {
      const ruta = join(actual, entrada)
      if (statSync(ruta).isDirectory()) {
        stack.push(ruta)
        continue
      }
      if (!/\.(ts|tsx)$/.test(entrada)) continue
      // Los `.invariant.ts` son chequeos, no pantallas — y este mismo archivo
      // lleva las frases del defecto adentro, como fixtures.
      if (entrada.endsWith('.invariant.ts')) continue
      salida.push(ruta)
    }
  }
  return salida
}

const archivos = AMBITO.flatMap((dir) => archivosDe(dir))

assert.ok(
  archivos.length >= 80,
  `se descubrieron ${archivos.length} archivos de copy del setter, se esperaban ≥80 — ` +
    'el barrido quedó sin sujeto y pasaría en verde sobre nada',
)

let frasesExaminadas = 0
const malas: string[] = []
for (const archivo of archivos) {
  const fuente = readFileSync(archivo, 'utf8')
  const rel = relative(RAIZ, archivo)
  for (const { texto } of frasesDe(fuente)) {
    if (texto.trim().split(/\s+/).filter(Boolean).length >= PALABRAS_MINIMAS) frasesExaminadas += 1
  }
  for (const hallazgo of ubicacionEnProsa(fuente)) {
    const perdonada = PERMITIDAS.some(
      (p) => rel === p.archivo && hallazgo.texto.includes(p.contiene),
    )
    if (perdonada) continue
    malas.push(
      `${rel}:${hallazgo.linea} — dice ${hallazgo.palabras.map((p) => `«${p}»`).join(', ')}\n` +
        `    "${hallazgo.texto.slice(0, 160)}"`,
    )
  }
}

assert.ok(
  frasesExaminadas >= 500,
  `se examinaron ${frasesExaminadas} frases, se esperaban ≥500 — el extractor de literales se rompió`,
)

assert.deepEqual(
  malas,
  [],
  'hay copy del setter que dice DÓNDE está una cosa. Una ubicación es correcta hasta que otro ' +
    'sprint mueve el layout, y entonces manda al setter a buscar donde no está (P18 mudó la acción ' +
    'principal a una barra sticky y la frase siguió diciendo «acá arriba»). Nombrá el control —o ' +
    'enlazá la pantalla con `EnlacePantalla`— en vez de ubicarlo:\n' +
    malas.join('\n'),
)

console.log(
  `✓ copy sin ubicación — ${archivos.length} archivos, ${frasesExaminadas} frases examinadas, ` +
    `${PERMITIDAS.length} excepción justificada`,
)
