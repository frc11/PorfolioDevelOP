/**
 * TEXTO-3 · H — CUÁNTOS BYTES LE SUMA ESTE SPRINT AL LANE.
 *
 *     npx tsx scripts-texto/h-peso.ts
 *
 * ── Por qué no alcanzaba con `g-peso.ts` ──────────────────────────────────
 *
 * El A/B de TEXTO-2 devolvía sus archivos a `HEAD` con `git show`, y eso servía
 * porque TEXTO-2 abrió sobre `HEAD`. **TEXTO-3 no**: abre sobre el árbol de
 * TEXTO-2, que está SIN COMMITEAR. Devolver a `HEAD` mediría los dos sprints
 * juntos y le cargaría a éste los 40 B que aquél ya declaró.
 *
 * Así que el «antes» se arma por archivo, de dos fuentes y con el sha256 a la
 * vista:
 *
 *   · **`git`** — los archivos que TEXTO-2 no tocó, así que su estado en `HEAD`
 *     ES su estado al abrir este sprint.
 *   · **`temp`** — los que TEXTO-2 sí tocó. Sus versiones quedaron guardadas
 *     FUERA del árbol por el A/B de aquel sprint, y su sha256 está publicado en
 *     `s5-presupuesto-recibos-de-texto2.ts`: el script lo verifica antes de
 *     usarlas, así que no se está confiando en un archivo de temporales.
 *
 * ── ⚠️ EL CONTROL QUE HACE QUE ESTO SIGNIFIQUE ALGO ──────────────────────
 *
 * El «antes» de este A/B tiene que reproducir el «después» del A/B de TEXTO-2
 * —**66.090,2 B**— porque es exactamente el mismo árbol. Si no lo reproduce, el
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** Lo que el A/B de TEXTO-2 dejó guardado fuera del árbol, con su sha256
 *  publicado. Si la carpeta ya no está, el script lo dice y no adivina. */
const RESPALDO_DE_TEXTO2 = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'texto-2-peso')

interface Archivo {
  readonly disco: string
  /** `git` = intacto desde HEAD · `temp` = lo tocó TEXTO-2, viene del respaldo. */
  readonly fuente: 'git' | 'temp'
  /** El sha256 publicado por el recibo de TEXTO-2. Sólo para los `temp`. */
  readonly sha256?: string
  /** `false` para los que no viajan en ningún chunk y entran sólo para compilar. */
  readonly viaja: boolean
}

const ARCHIVOS: readonly Archivo[] = [
  { disco: 'src/app/theme-develop.css', fuente: 'git', viaja: true },
  { disco: 'src/app/v3/_lib/superficies.ts', fuente: 'git', viaja: true },
  { disco: 'src/app/v3/_lib/secciones.ts', fuente: 'git', viaja: true },
  { disco: 'src/app/v3/_componentes/Panel.tsx', fuente: 'git', viaja: true },
  {
    disco: 'src/app/v3/_secciones/hero/contenido.ts',
    fuente: 'temp',
    sha256: 'a05883c4be82fbd5256d4443e9339092f398cb0c77437a724e7968c3af772378',
    viaja: true,
  },
  // Los cuatro de abajo NO viajan: entran para que el árbol del «antes» compile.
  {
    disco: 'src/app/v3/_secciones/hero/hero.invariant.tsx',
    fuente: 'temp',
    sha256: '7f5e035bba4008a9c31d1aed087bb472bffc9d644551b0c76ab2822bab3d1aab',
    viaja: false,
  },
  { disco: 'src/app/v3/_lib/__tests__/superficies.invariant.ts', fuente: 'git', viaja: false },
  { disco: 'src/app/v3/_lib/__tests__/tokens.invariant.ts', fuente: 'git', viaja: false },
  { disco: 'src/app/v3/_lib/__tests__/padron-de-tokens.ts', fuente: 'git', viaja: false },
]

/** Lo que el A/B de TEXTO-2 midió como su «después». Este A/B tiene que
 *  reproducirlo en su «antes»: es el mismo árbol. */
const LANE_AL_CERRAR_TEXTO2_BYTES = 66_090.2
const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'texto-3-peso')
const SALIDAS = 'docs/rediseno/outputs/texto'
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
  return { bytesDelLane: Number.parseFloat(kib[1]) * 1024 - Number.parseFloat(aire[1]), aireB: Number.parseFloat(aire[1]), linea: linea.trim() }
}

interface Copia {
  readonly disco: string
  readonly original: Buffer
  readonly hash: string
  readonly respaldo: string
  readonly viejo: Buffer
}

function versionDeAntes(a: Archivo): Buffer {
  if (a.fuente === 'temp') {
    const ruta = path.join(RESPALDO_DE_TEXTO2, path.basename(a.disco))
    if (!existsSync(ruta)) {
      throw new Error(
        `falta el respaldo de TEXTO-2 para ${a.disco} en ${ruta}. Sin el, el «antes» no se puede armar: ` +
          'no adivino el estado de un archivo que otro sprint dejo sin commitear.',
      )
    }
    const buf = readFileSync(ruta)
    const sha = createHash('sha256').update(buf).digest('hex')
    if (sha !== a.sha256) {
      throw new Error(`el respaldo de ${a.disco} no es el que el recibo de TEXTO-2 publica: ${sha} != ${a.sha256}`)
    }
    return buf
  }
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
    const original = readFileSync(a.disco)
    const hash = createHash('sha256').update(original).digest('hex')
    const respaldo = path.join(TEMP, path.basename(a.disco))
    writeFileSync(respaldo, original)
    const viejo = versionDeAntes(a)
    if (Buffer.compare(viejo, original) === 0) {
      throw new Error(`${a.disco} es IDENTICO a su version de antes: no hay nada que atribuir`)
    }
    console.log(`  ${a.disco}  [${a.fuente}${a.viaja ? '' : ', no viaja'}]`)
    console.log(`    sha256 de hoy ${hash}`)
    return { disco: a.disco, original, hash, respaldo, viejo }
  })

  let antes: Lectura | null = null
  let despues: Lectura | null = null
  try {
    console.log(`\n  [1/2] los ${copias.length} archivos devueltos al arbol de TEXTO-2. Construyendo...`)
    for (const c of copias) writeFileSync(c.disco, c.viejo)
    construir()
    antes = leerElPeso()
    const desvio = antes.bytesDelLane - LANE_AL_CERRAR_TEXTO2_BYTES
    console.log(`        ANTES:   ${antes.bytesDelLane.toFixed(1)} B de lane · ${antes.aireB.toFixed(1)} B de aire`)
    console.log(
      `        CONTROL: TEXTO-2 cerro en ${LANE_AL_CERRAR_TEXTO2_BYTES} B — desvio ${desvio.toFixed(1)} B` +
        `${Math.abs(desvio) < 0.05 ? '  ✅ el «antes» ES el arbol de TEXTO-2' : '  ⚠️ NO REPRODUCE: la resta de abajo no vale'}`,
    )

    console.log(`\n  [2/2] restaurados a los de hoy. Construyendo...`)
    for (const c of copias) writeFileSync(c.disco, c.original)
    construir()
    despues = leerElPeso()
    console.log(`        DESPUES: ${despues.bytesDelLane.toFixed(1)} B de lane · ${despues.aireB.toFixed(1)} B de aire`)
  } finally {
    let sucio = false
    console.log('')
    for (const c of copias) {
      writeFileSync(c.disco, c.original)
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

  console.log(`\n  LO QUE TEXTO-3 LE SUMA AL LANE: ${delta.toFixed(1)} B`)
  console.log(
    `  al centesimo de arriba: ${delta.toFixed(1)} / 1024 = ${(delta / 1024).toFixed(4)} -> ${alCentesimoDeArriba} KiB,` +
      ` que deja ${aireQueDeja.toFixed(1)} B de aire`,
  )
  console.log(
    `  PROPUESTA: ${propuesta} KiB, con ${aireDeLaPropuesta.toFixed(1)} B de aire` +
      `${propuesta === alCentesimoDeArriba ? '' : ` — el centesimo de arriba dejaba ${aireQueDeja.toFixed(1)} B, DEBAJO del umbral de ${AIRE_MINIMO_UTIL_BYTES} B`}`,
  )

  writeFileSync(
    path.join(SALIDAS, 'h-peso.json'),
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        archivos: ARCHIVOS.map((a) => ({ ...a, sha256DeHoy: copias.find((c) => c.disco === a.disco)?.hash })),
        laneAlCerrarTexto2: LANE_AL_CERRAR_TEXTO2_BYTES,
        desvioDelControl: Number((antes.bytesDelLane - LANE_AL_CERRAR_TEXTO2_BYTES).toFixed(1)),
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
  console.log(`\n  -> ${path.join(SALIDAS, 'h-peso.json')}`)
}

main()
