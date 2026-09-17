/**
 * TEXTO-2 · G — CUÁNTOS BYTES LE SUMA ESTE SPRINT AL LANE.
 *
 *     npx tsx scripts-texto/g-peso.ts
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * `s5-peso` quedó en rojo por **1,2 B**: el lane escribe 60.001 KiB contra un
 * techo de 60. TEXTO-2 tocó producto —tres archivos del hero— así que esos bytes
 * son suyos y necesitan una línea con nombre. La regla está escrita en
 * `MONTAJE_DE_TAPADO_KIB`, y se escribió porque TAPADO-1 no la cumplió: *«un
 * sprint que toca producto declara su línea en el mismo acto, como hicieron B11
 * y MOVIL-1»*. Este script produce el recibo de esa línea.
 *
 * ── EL MÉTODO: el A/B de `scripts-peso/a-atribuir.ts`, con tres archivos ──
 *
 * Dos builds de producción del MISMO árbol en la MISMA máquina, con UNA sola
 * variable: los tres archivos de producto devueltos a `HEAD` con `git show` para
 * el «antes» y restaurados desde copias guardadas **FUERA del árbol** para el
 * «después», con el sha256 verificado. Entre medio, `s5-peso` lee el lane.
 *
 * ⚠ **`hero.invariant.tsx` ENTRA EN EL SWAP AUNQUE NO VIAJE, y se aprendió
 * fallando.** La primera corrida lo dejó afuera —es un invariante, no está en
 * ningún chunk— y el build del «antes» **falló a los tres minutos**: con
 * `geometria.ts` devuelto a `HEAD`, el invariante nuevo referencia
 * `columnasDelTitularEnTablet`, que en esa versión no existe, y el paso de tipos
 * del build tira. O sea: el swap tiene que dejar el árbol **compilable**, no
 * sólo el bundle comparable. No puede mover un byte —no lo importa ningún
 * chunk— y la comparación sigue teniendo una sola variable: el hero de HEAD
 * contra el hero de hoy.
 *
 * ⚠ **El build va con la llave prendida** (`MEDIR_CON_LA_LLAVE_PRENDIDA=1`), que
 * es la forma documentada de construir este árbol y la que `s5-peso` espera:
 * resta el andamio de la llave aparte.
 *
 * ⚠ **No aplica ninguna línea.** Mide, restaura y propone. Subir un montaje es
 * decisión del humano en su parada, que es la regla que sostiene todo este
 * subsistema.
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** Los TRES archivos de producto que TEXTO-2 tocó, con su ruta como la ve git
 *  —desde la raíz del repo, que es el worktree de arriba—. */
const ARCHIVOS: readonly { readonly disco: string; readonly git: string }[] = [
  {
    disco: 'src/app/v3/_secciones/hero/Hero.tsx',
    git: 'logic-core-v3/src/app/v3/_secciones/hero/Hero.tsx',
  },
  {
    disco: 'src/app/v3/_secciones/hero/geometria.ts',
    git: 'logic-core-v3/src/app/v3/_secciones/hero/geometria.ts',
  },
  {
    disco: 'src/app/v3/_secciones/hero/contenido.ts',
    git: 'logic-core-v3/src/app/v3/_secciones/hero/contenido.ts',
  },
  // No viaja en ningún chunk; entra para que el árbol del «antes» COMPILE. El
  // porqué, con el modo de falla que lo destapó, está en el docblock.
  {
    disco: 'src/app/v3/_secciones/hero/hero.invariant.tsx',
    git: 'logic-core-v3/src/app/v3/_secciones/hero/hero.invariant.tsx',
  },
]

/** El commit sobre el que abrió este sprint: TEXTO-1, que no tocó `src/`. */
const ANTES_DE_TEXTO2 = 'HEAD'
const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'texto-2-peso')
const SALIDAS = 'docs/rediseno/outputs/texto'

function construir(): void {
  const r = spawnSync('npm', ['run', 'build'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    shell: true,
    windowsHide: true,
    env: { ...process.env, MEDIR_CON_LA_LLAVE_PRENDIDA: '1' },
  })
  if (r.status !== 0) throw new Error(`el build fallo: ${`${r.stdout ?? ''}${r.stderr ?? ''}`.slice(-1500)}`)
}

interface Lectura {
  /** Los bytes que el lane escribe, sin el andamio de la llave. */
  readonly bytesDelLane: number
  /** El aire contra el techo declarado, en bytes. */
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
  const linea = salida
    .split(/\r?\n/)
    .find((l) => l.includes('lo que ESCRIBE el lane'))
  if (linea === undefined) throw new Error(`s5-peso no publico la linea del lane:\n${salida.slice(-2000)}`)
  const aire = /(-?[\d.]+) B de aire/.exec(linea)
  const kib = /entra en ([\d.]+) KiB crudo\s+—\s+([\d.]+) KiB/.exec(linea)
  if (aire === null || kib === null) throw new Error(`no pude leer la linea: ${linea}`)
  const techoKib = Number.parseFloat(kib[1])
  const aireB = Number.parseFloat(aire[1])
  return { bytesDelLane: techoKib * 1024 - aireB, aireB, linea: linea.trim() }
}

interface Copia {
  readonly disco: string
  readonly original: Buffer
  readonly hash: string
  readonly respaldo: string
  readonly viejo: Buffer
}

function main(): void {
  mkdirSync(TEMP, { recursive: true })
  mkdirSync(SALIDAS, { recursive: true })

  const copias: Copia[] = ARCHIVOS.map((a) => {
    const original = readFileSync(a.disco)
    const hash = createHash('sha256').update(original).digest('hex')
    const respaldo = path.join(TEMP, path.basename(a.disco))
    writeFileSync(respaldo, original)
    const viejo = spawnSync('git', ['show', `${ANTES_DE_TEXTO2}:${a.git}`], {
      cwd: process.cwd(),
      encoding: 'buffer',
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    })
    if (viejo.status !== 0 || viejo.stdout === null) {
      throw new Error(`git show fallo para ${a.git}: ${String(viejo.stderr)}`)
    }
    const buf = Buffer.from(viejo.stdout)
    if (Buffer.compare(buf, original) === 0) {
      throw new Error(`${a.disco} es IDENTICO al de ${ANTES_DE_TEXTO2}: no hay nada que atribuir`)
    }
    console.log(`  ${a.disco}`)
    console.log(`    sha256 ${hash}`)
    console.log(`    respaldo FUERA del arbol: ${respaldo}`)
    return { disco: a.disco, original, hash, respaldo, viejo: buf }
  })

  let antes: Lectura | null = null
  let despues: Lectura | null = null
  try {
    console.log(`\n  [1/2] los ${copias.length} archivos devueltos a ${ANTES_DE_TEXTO2}. Construyendo...`)
    for (const c of copias) writeFileSync(c.disco, c.viejo)
    construir()
    antes = leerElPeso()
    console.log(`        ANTES:   ${antes.bytesDelLane.toFixed(1)} B de lane · ${antes.aireB.toFixed(1)} B de aire`)

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
  /** El umbral de aire útil de `s5-presupuesto-recibos-del-titular.ts`: una
   *  línea nueva no nace por debajo de 8 B de aire. */
  const AIRE_MINIMO_UTIL_BYTES = 8
  const propuesta = aireQueDeja >= AIRE_MINIMO_UTIL_BYTES ? alCentesimoDeArriba : alCentesimoDeArriba + 0.01
  const aireDeLaPropuesta = propuesta * 1024 - delta

  console.log(`\n  LO QUE TEXTO-2 LE SUMA AL LANE: ${delta.toFixed(1)} B`)
  console.log(
    `  al centesimo de arriba: ${delta.toFixed(1)} / 1024 = ${(delta / 1024).toFixed(4)} -> ${alCentesimoDeArriba} KiB,` +
      ` que deja ${aireQueDeja.toFixed(1)} B de aire`,
  )
  console.log(
    `  PROPUESTA: ${propuesta} KiB, con ${aireDeLaPropuesta.toFixed(1)} B de aire` +
      `${propuesta === alCentesimoDeArriba ? '' : ` — el centesimo de arriba dejaba ${aireQueDeja.toFixed(1)} B, DEBAJO del umbral de ${AIRE_MINIMO_UTIL_BYTES} B`}`,
  )

  writeFileSync(
    path.join(SALIDAS, 'g-peso.json'),
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        archivos: ARCHIVOS.map((a) => a.disco),
        commitDeReferencia: ANTES_DE_TEXTO2,
        sha256: Object.fromEntries(copias.map((c) => [c.disco, c.hash])),
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
  console.log(`\n  -> ${path.join(SALIDAS, 'g-peso.json')}`)
}

main()
