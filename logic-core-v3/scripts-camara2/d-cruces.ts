/**
 * CAMARA-2 · D — DÓNDE SE CRUZA CADA INVARIANTE, uno por uno.
 *
 *     npx tsx scripts-camara2/d-cruces.ts
 *
 * ── Por qué hace falta, después de dos corridas del gate ─────────────────
 *
 * El gate con `distance: 40` dio 19 rojos y con 25,75 dio 14. Eso acota, no
 * localiza. Y sobre todo: **aparecieron rojos que ninguna de las cuatro paredes
 * de `b-paredes.ts` predecía** —`s12e-barrido` y `s11e-piso` se caen en 25,75
 * aunque el techo de luz de 210 esté en 30,59—, porque lo que se rompe ahí es
 * otra afirmación: la que exige que el hero **reproduzca el valor de S10** con
 * una tolerancia de 2, no la que lo compara contra 210.
 *
 * Así que en vez de seguir despejando desigualdades a mano, esto corre **los
 * invariantes de verdad**, uno por distancia, y publica la primera que los tira.
 * La respuesta que da es la única que importa para decidir: **cuál es la mayor
 * distancia del hero con CERO rojos nuevos**.
 *
 * ── ⚠️ MISMO CONTRATO QUE EL RESTO DEL BANCO ────────────────────────────
 *
 * Respaldo fuera del árbol, restauración en `finally`, sha256 comparado al
 * cerrar. No corre `npm run build`: ninguno de los invariantes de esta lista lee
 * `.next` — el único que lo hace es `s5-peso`, que está excluido porque su rojo
 * es anterior a este bloque (deuda de TAPADO-1, ver CAMARA-1 §5.4).
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ_DE_SALIDAS, argumento } from './camara2-comun'

const ARCHIVO = 'src/app/v3/_lib/escena/choreography.ts'
const LINEA_DEL_HERO = 'pose: { angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 },'
const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'camara-2')

/** Los que las dos corridas del gate encontraron en rojo, menos `s5-peso`. */
const INVARIANTES = [
  's10-vertical',
  's16-encuadre',
  's9e-composicion',
  's8-intro',
  's8-relevo',
  's8e-encuadre',
  's11e-piso',
  's11e-pantalla',
  's12e-barrido',
  's12e-tension',
  's13e-intro-particulas',
  's13e-intro-campo',
  's14e-intro-lectura',
  's14e-intro-escala',
  's15e-intro-aterrizaje',
  's10e-fondo',
  's7e-recorridos',
] as const

function corre(nombre: string): boolean {
  const r = spawnSync('npm', ['run', `test:${nombre}`], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: true,
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  })
  return r.status === 0
}

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  mkdirSync(TEMP, { recursive: true })
  const lista = argumento('distancias', '19,20,21,22,23,24,25.75')
    .split(',')
    .map((x) => Number.parseFloat(x))

  const original = readFileSync(ARCHIVO)
  const hashOriginal = createHash('sha256').update(original).digest('hex')
  writeFileSync(path.join(TEMP, 'choreography.ts.cruces'), original)
  console.log(`  original: sha256 ${hashOriginal}\n`)
  const texto = original.toString('utf8')
  if (!texto.includes(LINEA_DEL_HERO)) throw new Error('no encontre la pose del hero')

  const filas: { distancia: number; rojos: string[] }[] = []
  try {
    for (const d of lista) {
      writeFileSync(
        ARCHIVO,
        texto.replace(LINEA_DEL_HERO, LINEA_DEL_HERO.replace('distance: 19', `distance: ${d}`)),
        'utf8',
      )
      const rojos = INVARIANTES.filter((n) => !corre(n))
      filas.push({ distancia: d, rojos: [...rojos] })
      console.log(
        `  d=${String(d).padStart(6)}  ${String(rojos.length).padStart(2)} rojo(s)` +
          `${rojos.length === 0 ? '' : `   ${rojos.join(' · ')}`}`,
      )
    }
  } finally {
    writeFileSync(ARCHIVO, original)
    const hashFinal = createHash('sha256').update(readFileSync(ARCHIVO)).digest('hex')
    const igual = hashFinal === hashOriginal
    console.log(`\n  RESTAURADO: sha256 ${hashFinal} — ${igual ? 'IDENTICO' : 'DISTINTO: EL ARBOL QUEDO SUCIO'}`)
    if (!igual) process.exitCode = 1
  }

  // ── La primera distancia que tira a cada uno ────────────────────────────
  console.log('\n  LA PRIMERA DISTANCIA QUE TIRA A CADA UNO\n')
  const primera = new Map<string, number>()
  for (const f of filas) {
    for (const n of f.rojos) if (!primera.has(n)) primera.set(n, f.distancia)
  }
  for (const [n, d] of [...primera.entries()].sort((a, b) => a[1] - b[1])) {
    console.log(`   d = ${String(d).padStart(6)}   ${n}`)
  }
  const sinRojos = filas.filter((f) => f.rojos.length === 0).map((f) => f.distancia)
  const mayorLimpia = sinRojos.length === 0 ? null : Math.max(...sinRojos)
  console.log(
    `\n  🔴 la mayor distancia del hero con CERO rojos: ${mayorLimpia === null ? 'ninguna del barrido' : mayorLimpia}` +
      `   (barrido: ${lista.join(' · ')})`,
  )

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'd-cruces.json'),
    `${JSON.stringify(
      { cuando: new Date().toISOString(), invariantes: INVARIANTES, filas, primera: Object.fromEntries(primera), mayorLimpia },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'd-cruces.json')}`)
}

main()
