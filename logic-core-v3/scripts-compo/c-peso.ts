/**
 * COMPO-1 · C — CUÁNTOS BYTES LE SUMA ESTE SPRINT AL LANE.
 *
 *     npx tsx scripts-compo/c-peso.ts
 *
 * ── El mismo método de TEXTO-3, con el «antes» armado igual ───────────────
 *
 * Este sprint abre sobre el árbol de **TEXTO-3**, que sigue SIN COMMITEAR —y
 * arriba de MOVIL-1 y TEXTO-2, que tampoco—. Devolver los archivos a `HEAD`
 * mediría los cuatro sprints juntos y le cargaría a éste los 216 B que TEXTO-3
 * ya declaró, los 40 de TEXTO-2 y los 23 de TAPADO-1.
 *
 * Así que el «antes» se arma por archivo, de dos fuentes y con el sha256 a la
 * vista:
 *
 *   · **`respaldo`** — los que este sprint tocó y que venían tocados por los
 *     anteriores. Sus versiones se copiaron FUERA del árbol **antes** de la
 *     primera edición, y su sha256 está publicado en
 *     `s5-presupuesto-recibos-de-compo1.ts`: el script lo verifica antes de
 *     usarlas, así que no se está confiando en un archivo de temporales.
 *   · **`git`** — los que ningún sprint sin commitear había tocado, así que su
 *     estado en `HEAD` ES su estado al abrir este sprint. `src/lib/utils.ts` es
 *     el único, y se comprueba: si `git status` lo diera como modificado, esta
 *     fuente estaría mintiendo.
 *   · **`nuevo`** — los que este sprint CREA. En el «antes» no existen, así que
 *     se borran y se reponen. `composicion.ts` es el único.
 *
 * ── ⚠️ EL CONTROL QUE HACE QUE LA RESTA SIGNIFIQUE ALGO ──────────────────
 *
 * El «antes» de este A/B tiene que reproducir el «después» del A/B de TEXTO-3
 * —**66.306,2 B**— porque es exactamente el mismo árbol. Si no lo reproduce, el
 * «antes» está mal armado y la resta no vale: el script lo publica y avisa en
 * vez de seguir de largo con un número lindo.
 *
 * ── El resto del método es el de siempre ──────────────────────────────────
 *
 * Dos builds de producción del MISMO árbol en la MISMA máquina, con una sola
 * variable, los dos con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`, y `s5-peso` leyendo el
 * lane entre medio. Los invariantes entran en el swap aunque no viajen, por la
 * lección de `g-peso.ts`: el swap tiene que dejar el árbol **compilable**.
 *
 * ⚠ **No aplica ninguna línea.** Mide, restaura y propone.
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** Lo que este sprint copió fuera del árbol ANTES de la primera edición. */
const RESPALDO = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'compo-1-antes')

interface Archivo {
  readonly disco: string
  readonly fuente: 'respaldo' | 'git' | 'nuevo'
  /** `false` para los que no viajan en ningún chunk y entran sólo para compilar. */
  readonly viaja: boolean
}

const ARCHIVOS: readonly Archivo[] = [
  // Viajan: son código de cliente o el tema.
  { disco: 'src/app/theme-develop.css', fuente: 'respaldo', viaja: true },
  { disco: 'src/lib/utils.ts', fuente: 'git', viaja: true },
  { disco: 'src/app/v3/_secciones/hero/contenido.ts', fuente: 'respaldo', viaja: true },
  { disco: 'src/app/v3/_secciones/hero/Hero.tsx', fuente: 'respaldo', viaja: true },
  { disco: 'src/app/v3/_secciones/hero/geometria.ts', fuente: 'respaldo', viaja: true },
  // No viajan: entran para que el árbol del «antes» compile y tipe.
  { disco: 'src/app/v3/_secciones/hero/soporte.ts', fuente: 'respaldo', viaja: false },
  { disco: 'src/app/v3/_secciones/hero/hero.invariant.tsx', fuente: 'respaldo', viaja: false },
  { disco: 'src/app/v3/_secciones/hero/composicion.ts', fuente: 'nuevo', viaja: false },
  { disco: 'src/app/v3/_lib/__tests__/s3-banda-consecuencias.ts', fuente: 'respaldo', viaja: false },
  { disco: 'src/app/v3/_lib/__tests__/padron-de-tokens.ts', fuente: 'respaldo', viaja: false },
  { disco: 'src/app/v3/_lib/__tests__/tokens.invariant.ts', fuente: 'respaldo', viaja: false },
]

/** Lo que el A/B de TEXTO-3 midió como su «después». */
const LANE_AL_CERRAR_TEXTO3_BYTES = 66_306.2
const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'compo-1-peso')
const SALIDAS = 'docs/rediseno/outputs/compo'
const PREFIJO_EN_GIT = 'logic-core-v3/'

function construir(): void {
  const r = spawnSync('npm', ['run', 'build'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    shell: true,
    windowsHide: true,
    env: { ...process.env, MEDIR_CON_LA_LLAVE_PRENDIDA: '1', NODE_OPTIONS: '--max-old-space-size=6144' },
  })
  if (r.status !== 0) throw new Error(`el build fallo: ${`${r.stdout ?? ''}${r.stderr ?? ''}`.slice(-1500)}`)
}

interface Lectura {
  readonly bytesDelLane: number
  readonly aireB: number
  readonly linea: string
}

function leerElPeso(): Lectura {
  const r = spawnSync('npm', ['run', 'test:s5-peso'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
    windowsHide: true,
  })
  const salida = `${r.stdout ?? ''}${r.stderr ?? ''}`
  const linea = salida.split(/\r?\n/).find((l) => l.includes('lo que ESCRIBE el lane'))
  if (linea === undefined) throw new Error(`s5-peso no publico la linea del lane:\n${salida.slice(-2000)}`)
  const aire = /(-?[\d.]+) B de aire/.exec(linea)
  const kib = /entra en ([\d.]+) KiB crudo\s+—\s+([\d.]+) KiB/.exec(linea)
  if (aire === null || kib === null) throw new Error(`no pude leer la linea: ${linea}`)
  return {
    bytesDelLane: Number.parseFloat(kib[1]) * 1024 - Number.parseFloat(aire[1]),
    aireB: Number.parseFloat(aire[1]),
    linea: linea.trim(),
  }
}

interface Copia {
  readonly disco: string
  readonly original: Buffer | null
  readonly hash: string
  readonly viejo: Buffer | null
}

function versionDeAntes(a: Archivo): Buffer | null {
  if (a.fuente === 'nuevo') return null
  if (a.fuente === 'respaldo') {
    const ruta = path.join(RESPALDO, path.basename(a.disco))
    if (!existsSync(ruta)) {
      throw new Error(
        `falta el respaldo de ${a.disco} en ${ruta}. Sin el, el «antes» no se puede armar: ` +
          'no adivino el estado de un archivo que otro sprint dejo sin commitear.',
      )
    }
    return readFileSync(ruta)
  }
  const sucio = spawnSync('git', ['status', '--porcelain', '--', `${PREFIJO_EN_GIT}${a.disco}`], {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
  })
  const estado = (sucio.stdout ?? '').trim()
  // Este sprint SI lo toca, asi que aparece modificado. Lo que se comprueba es
  // que NO lo hayan tocado los sprints sin commitear: su `HEAD` tiene que ser
  // el estado al abrir, y para eso la unica linea de `git status` tiene que ser
  // la de este sprint. Se publica para que quede a la vista.
  console.log(`    git status de ${a.disco}: ${estado === '' ? '(limpio)' : estado}`)
  const r = spawnSync('git', ['show', `HEAD:${PREFIJO_EN_GIT}${a.disco}`], {
    cwd: process.cwd(),
    encoding: 'buffer',
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  })
  if (r.status !== 0 || r.stdout === null) throw new Error(`git show fallo para ${a.disco}: ${String(r.stderr)}`)
  return Buffer.from(r.stdout)
}

function main(): void {
  mkdirSync(TEMP, { recursive: true })
  mkdirSync(SALIDAS, { recursive: true })

  const copias: Copia[] = ARCHIVOS.map((a) => {
    const original = existsSync(a.disco) ? readFileSync(a.disco) : null
    if (original === null) throw new Error(`${a.disco} no existe: el «despues» esta incompleto`)
    const hash = createHash('sha256').update(original).digest('hex')
    writeFileSync(path.join(TEMP, path.basename(a.disco)), original)
    const viejo = versionDeAntes(a)
    if (viejo !== null && Buffer.compare(viejo, original) === 0) {
      throw new Error(`${a.disco} es IDENTICO a su version de antes: no hay nada que atribuir`)
    }
    console.log(`  ${a.disco}  [${a.fuente}${a.viaja ? '' : ', no viaja'}]`)
    console.log(`    sha256 de hoy ${hash}`)
    return { disco: a.disco, original, hash, viejo }
  })

  let antes: Lectura | null = null
  let despues: Lectura | null = null
  try {
    console.log(`\n  [1/2] los ${copias.length} archivos devueltos al arbol de TEXTO-3. Construyendo...`)
    for (const c of copias) {
      if (c.viejo === null) rmSync(c.disco, { force: true })
      else writeFileSync(c.disco, c.viejo)
    }
    construir()
    antes = leerElPeso()
    const desvio = antes.bytesDelLane - LANE_AL_CERRAR_TEXTO3_BYTES
    console.log(`        ANTES:   ${antes.bytesDelLane.toFixed(1)} B de lane · ${antes.aireB.toFixed(1)} B de aire`)
    console.log(
      `        CONTROL: TEXTO-3 cerro en ${LANE_AL_CERRAR_TEXTO3_BYTES} B — desvio ${desvio.toFixed(1)} B` +
        `${Math.abs(desvio) < 0.05 ? '  ✅ el «antes» ES el arbol de TEXTO-3' : '  ⚠️ NO REPRODUCE: la resta de abajo no vale'}`,
    )

    console.log(`\n  [2/2] restaurados a los de hoy. Construyendo...`)
    for (const c of copias) if (c.original !== null) writeFileSync(c.disco, c.original)
    construir()
    despues = leerElPeso()
    console.log(`        DESPUES: ${despues.bytesDelLane.toFixed(1)} B de lane · ${despues.aireB.toFixed(1)} B de aire`)
  } finally {
    let sucio = false
    console.log('')
    for (const c of copias) {
      if (c.original !== null) writeFileSync(c.disco, c.original)
      const hashFinal = createHash('sha256').update(readFileSync(c.disco)).digest('hex')
      const igual = hashFinal === c.hash
      if (!igual) sucio = true
      console.log(`  RESTAURADO ${c.disco} — ${igual ? 'IDENTICO' : 'DISTINTO: EL ARBOL QUEDO SUCIO'}`)
    }
    if (sucio) process.exitCode = 1
  }

  if (antes === null || despues === null) return
  const delta = despues.bytesDelLane - antes.bytesDelLane
  const alCentesimoDeArriba = Math.ceil((delta / 1024) * 100) / 100
  const aireQueDeja = alCentesimoDeArriba * 1024 - delta
  const AIRE_MINIMO_UTIL_BYTES = 8
  const propuesta = aireQueDeja >= AIRE_MINIMO_UTIL_BYTES ? alCentesimoDeArriba : alCentesimoDeArriba + 0.01
  const aireDeLaPropuesta = propuesta * 1024 - delta

  console.log(`\n  LO QUE COMPO-1 LE SUMA AL LANE: ${delta.toFixed(1)} B`)
  console.log(
    `  al centesimo de arriba: ${delta.toFixed(1)} / 1024 = ${(delta / 1024).toFixed(4)} -> ${alCentesimoDeArriba} KiB,` +
      ` que deja ${aireQueDeja.toFixed(1)} B de aire`,
  )
  console.log(
    `  PROPUESTA: ${propuesta} KiB, con ${aireDeLaPropuesta.toFixed(1)} B de aire` +
      `${propuesta === alCentesimoDeArriba ? '' : ` — el centesimo de arriba dejaba ${aireQueDeja.toFixed(1)} B, DEBAJO del umbral de ${AIRE_MINIMO_UTIL_BYTES} B`}`,
  )

  writeFileSync(
    path.join(SALIDAS, 'c-peso.json'),
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        archivos: ARCHIVOS.map((a) => ({ ...a, sha256DeHoy: copias.find((c) => c.disco === a.disco)?.hash })),
        laneAlCerrarTexto3: LANE_AL_CERRAR_TEXTO3_BYTES,
        desvioDelControl: Number((antes.bytesDelLane - LANE_AL_CERRAR_TEXTO3_BYTES).toFixed(1)),
        antes,
        despues,
        deltaBytes: Number(delta.toFixed(1)),
        alCentesimoDeArriba,
        aireDelCentesimoDeArribaBytes: Number(aireQueDeja.toFixed(1)),
        propuestaKib: propuesta,
        aireDeLaPropuestaBytes: Number(aireDeLaPropuesta.toFixed(1)),
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(SALIDAS, 'c-peso.json')}`)
}

main()
