/**
 * PESO-1 · B — ¿UN DEV SERVER PONE `s5-peso` EN VERDE?
 *
 *     npx tsx scripts-peso/b-contaminacion.ts
 *
 * ── Qué se está probando, y por qué hace falta probarlo ──────────────────
 *
 * TAPADO-1 cerró con `npm run verificar` en verde y el lane **12,4 B arriba del
 * techo**. La explicación candidata es que durante esa corrida había un
 * `next dev` escribiendo en `.next`, y que `s5-peso` —que lee de `DIST`, o sea
 * `.next`— midió la salida de DESARROLLO en vez de la de producción.
 *
 * Eso es una historia plausible, no una medición. Este script la convierte en
 * una: lee el lane contra el build de producción que ya está en `.next`, levanta
 * un `next dev`, lo hace compilar `/v3`, lo mata, y vuelve a leer el lane **sin
 * reconstruir**. Si el número cambia, la contaminación es real y se puede citar
 * con su cifra. Si no cambia, la explicación era falsa y hay que buscar otra.
 *
 * ⚠️ **Deja `.next` inservible para el gate.** Es el punto del experimento. Hay
 * que reconstruir con `MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build` después, y
 * el script lo dice al terminar en vez de hacerlo solo, para que quien lo corra
 * no se olvide de que el árbol quedó en ese estado.
 *
 * ⚠️ **No toca ningún archivo del árbol.** La única variable es el contenido de
 * `.next`, que es exactamente la entrada cuya influencia se está midiendo.
 *
 * ── EL RESULTADO, 2026-09-16: LA EXPLICACIÓN ERA FALSA ───────────────────
 *
 *     build de producción          ROJO · -2,2 B de aire · 2 fallas
 *     el mismo .next, con dev      ROJO · -2,2 B de aire · 2 fallas
 *
 * Ni un bit. Y la razón está a la vista: lo que `s5-peso` mide sale de
 * `htmlDe()`, que lee `.next/server/app/v3.html`, y **`next dev` no prerenderiza
 * a ese archivo** —renderiza al vuelo—. Después de servir `/v3`, `v3.html`
 * conservaba el mtime del build de producción.
 *
 * **La causa real es un `.next` VIEJO**, y `exigirBuild()` no la puede ver:
 * comprueba que el directorio exista, no que corresponda al árbol. El dev server
 * no es el autor, es el encubridor — hace que el árbol parezca construido.
 * Escrito en `DIRECCION-ESCENA.md` §7.61 con el A/B que lo cuantifica.
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const PUERTO = 3399
const SALIDAS = 'docs/rediseno/outputs/peso'

interface Lectura {
  readonly linea: string
  readonly verde: boolean
  readonly aireB: number
  readonly fallas: number
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
  const fallas = /(\d+) fallas?/.exec(salida)
  if (aire === null) throw new Error(`no pude leer el aire: ${linea}`)
  const recortada = linea.trim()
  return {
    linea: recortada,
    verde: !recortada.startsWith('FALLA'),
    aireB: Number.parseFloat(aire[1]),
    fallas: fallas === null ? -1 : Number.parseInt(fallas[1], 10),
  }
}

async function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function main(): Promise<void> {
  mkdirSync(SALIDAS, { recursive: true })
  if (!existsSync('.next')) throw new Error('no hay .next: corre el build de produccion primero')

  console.log('  [1/3] El lane contra el build de PRODUCCION que ya esta en .next...')
  const produccion = leerElPeso()
  console.log(`        ${produccion.verde ? 'VERDE' : 'ROJO '} · ${produccion.aireB} B de aire · ${produccion.fallas} fallas`)

  console.log(`\n  [2/3] Levantando next dev en :${PUERTO} y haciendolo compilar /v3...`)
  const binDeNext = path.join('node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(binDeNext)) throw new Error(`no encuentro ${binDeNext}`)
  const dev = spawn(process.execPath, [binDeNext, 'dev', '--webpack', '-p', String(PUERTO)], {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: 'ignore',
    env: { ...process.env, MEDIR_CON_LA_LLAVE_PRENDIDA: '1' },
  })
  let compilo = false
  try {
    for (let i = 0; i < 90; i += 1) {
      await esperar(2000)
      try {
        const res = await fetch(`http://127.0.0.1:${PUERTO}/v3`)
        if (res.ok) {
          await res.text()
          compilo = true
          console.log(`        /v3 respondio ${res.status} a los ~${(i + 1) * 2} s. dev escribio en .next.`)
          break
        }
      } catch {
        /* todavia no levanto */
      }
    }
  } finally {
    if (dev.pid !== undefined) {
      spawnSync('taskkill', ['/PID', String(dev.pid), '/T', '/F'], { windowsHide: true })
    }
    await esperar(3000)
  }
  if (!compilo) throw new Error('el dev server nunca sirvio /v3: el experimento no corrio')

  console.log('\n  [3/3] El lane OTRA VEZ, sin reconstruir. Misma afirmacion, otra entrada...')
  const contaminado = leerElPeso()
  console.log(`        ${contaminado.verde ? 'VERDE' : 'ROJO '} · ${contaminado.aireB} B de aire · ${contaminado.fallas} fallas`)

  const cambio = contaminado.verde !== produccion.verde || contaminado.aireB !== produccion.aireB
  console.log(`\n  VEREDICTO: ${cambio ? 'LA CONTAMINACION ES REAL' : 'el dev server NO cambio el numero: la explicacion era falsa'}`)
  if (cambio) {
    console.log(`    produccion : ${produccion.aireB} B de aire (${produccion.verde ? 'verde' : 'ROJO'})`)
    console.log(`    con dev    : ${contaminado.aireB} B de aire (${contaminado.verde ? 'VERDE' : 'rojo'})`)
  }

  writeFileSync(
    path.join(SALIDAS, 'b-contaminacion.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), puerto: PUERTO, produccion, contaminado, cambio }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(SALIDAS, 'b-contaminacion.json')}`)
  console.log('  ⚠ .next quedo contaminado. Reconstruir: MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build')
}

void main()
