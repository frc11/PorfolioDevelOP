/**
 * PESO-1 · A — A QUIÉN SE LE ATRIBUYEN LOS BYTES QUE DEJARON `s5-peso` EN ROJO.
 *
 *     npx tsx scripts-peso/a-atribuir.ts
 *
 * ── Por qué hace falta, si la propuesta ya estaba escrita ────────────────
 *
 * La parada aprobó subir `MONTAJE_DEL_TITULAR_KIB` de 0,69 a 0,70. Aplicado y
 * medido, eso da **+10,24 B de techo** y el lane estaba **12,4 B arriba**: quedan
 * **2,2 B sin cubrir** y el gate sigue en rojo. La propuesta del titular arregla
 * el AIRE DE SU LÍNEA —0,6 B de redondeo, que es de lo que hablaba— y no el
 * excedente del lane, que es otra cuenta.
 *
 * El excedente lo puso TAPADO-1: su único archivo de PRODUCTO es `Hero.tsx`
 * (30 líneas, de las cuales lo único que viaja es la cadena de clases
 * `justify-end … escritorio:justify-center` y las utilidades que Tailwind emite
 * por ella). Este script lo mide, para que la línea que haga falta tenga recibo
 * y no sea una intención.
 *
 * ── EL MÉTODO: el A/B de `s5-presupuesto-recibos-de-movil.ts` ───────────
 *
 * Dos builds de producción del MISMO árbol en la MISMA máquina, con UNA sola
 * variable: `Hero.tsx` devuelto a `cdd7ae03` (el commit anterior a TAPADO-1) con
 * `git show` para el «antes», y restaurado desde una copia FUERA del árbol para
 * el «después», verificado por sha256. Entre medio, `s5-peso` lee el lane.
 *
 * ⚠ **El build va con la llave prendida**, que es la forma documentada de
 * construir este árbol (`MEDIR_CON_LA_LLAVE_PRENDIDA=1`), y es además la que
 * `s5-peso` espera: resta el andamio de la llave aparte.
 *
 * ⚠ **No se aplica ninguna línea nueva.** Este script mide y restaura; subir un
 * montaje es decisión del humano en su parada, que es la regla que sostiene todo
 * este subsistema.
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ARCHIVO = 'src/app/v3/_secciones/hero/Hero.tsx'
/** La ruta como la ve git desde la raíz del repo, que es el worktree de arriba. */
const RUTA_EN_GIT = 'logic-core-v3/src/app/v3/_secciones/hero/Hero.tsx'
/** El commit anterior a TAPADO-1. */
const ANTES_DE_TAPADO = 'cdd7ae03'
const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'peso-1')
const SALIDAS = 'docs/rediseno/outputs/peso'

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

function main(): void {
  mkdirSync(TEMP, { recursive: true })
  mkdirSync(SALIDAS, { recursive: true })

  const original = readFileSync(ARCHIVO)
  const hashOriginal = createHash('sha256').update(original).digest('hex')
  const respaldo = path.join(TEMP, 'Hero.tsx.original')
  writeFileSync(respaldo, original)
  console.log(`  original: sha256 ${hashOriginal}`)
  console.log(`  respaldo FUERA del arbol: ${respaldo}\n`)

  const viejo = spawnSync('git', ['show', `${ANTES_DE_TAPADO}:${RUTA_EN_GIT}`], {
    cwd: process.cwd(),
    encoding: 'buffer',
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  })
  if (viejo.status !== 0 || viejo.stdout === null) {
    throw new Error(`git show fallo: ${String(viejo.stderr)}`)
  }
  if (Buffer.compare(Buffer.from(viejo.stdout), original) === 0) {
    throw new Error('el Hero.tsx de antes de TAPADO-1 es IDENTICO al de hoy: no hay nada que atribuir')
  }

  let antes: Lectura | null = null
  let despues: Lectura | null = null
  try {
    console.log(`  [1/2] Hero.tsx devuelto a ${ANTES_DE_TAPADO}. Construyendo...`)
    writeFileSync(ARCHIVO, Buffer.from(viejo.stdout))
    construir()
    antes = leerElPeso()
    console.log(`        ANTES:   ${antes.bytesDelLane.toFixed(1)} B de lane · ${antes.aireB.toFixed(1)} B de aire`)

    console.log(`\n  [2/2] Hero.tsx restaurado al de hoy. Construyendo...`)
    writeFileSync(ARCHIVO, original)
    construir()
    despues = leerElPeso()
    console.log(`        DESPUES: ${despues.bytesDelLane.toFixed(1)} B de lane · ${despues.aireB.toFixed(1)} B de aire`)
  } finally {
    writeFileSync(ARCHIVO, original)
    const hashFinal = createHash('sha256').update(readFileSync(ARCHIVO)).digest('hex')
    const igual = hashFinal === hashOriginal
    console.log(`\n  RESTAURADO: sha256 ${hashFinal} — ${igual ? 'IDENTICO' : 'DISTINTO: EL ARBOL QUEDO SUCIO'}`)
    if (!igual) process.exitCode = 1
  }

  if (antes === null || despues === null) return
  const delta = despues.bytesDelLane - antes.bytesDelLane
  const kibAlCentesimoDeArriba = Math.ceil((delta / 1024) * 100) / 100
  const aireQueDeja = kibAlCentesimoDeArriba * 1024 - delta

  console.log(`\n  LO QUE TAPADO-1 LE SUMA AL LANE: ${delta.toFixed(1)} B`)
  console.log(
    `  al centesimo de arriba: ${delta.toFixed(1)} / 1024 = ${(delta / 1024).toFixed(4)} -> ${kibAlCentesimoDeArriba} KiB,` +
      ` que deja ${aireQueDeja.toFixed(1)} B de aire`,
  )

  writeFileSync(
    path.join(SALIDAS, 'a-atribuir.json'),
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        archivo: ARCHIVO,
        commitDeReferencia: ANTES_DE_TAPADO,
        antes,
        despues,
        deltaBytes: Number(delta.toFixed(1)),
        propuestaKib: kibAlCentesimoDeArriba,
        aireQueDejaBytes: Number(aireQueDeja.toFixed(1)),
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(SALIDAS, 'a-atribuir.json')}`)
}

main()
