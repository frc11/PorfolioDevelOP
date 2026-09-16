/**
 * CAMARA-1 · E — QUÉ INSTRUMENTOS SE PONEN EN ROJO, corriendo el gate de verdad.
 *
 *     npx tsx scripts-camara/e-gate.ts --distancia=40
 *
 * ── Por qué no alcanza con el censo por grep ─────────────────────────────
 *
 * `c-rotura.ts` cuenta qué archivos NOMBRAN una distancia. Eso dice dónde
 * mirar, no qué falla: un archivo puede leer `.distance` y no afirmar nada sobre
 * su valor, y otro puede clavar una posición en píxeles sin nombrar la palabra.
 * La única respuesta que no es una conjetura es correr `npm run verificar` con
 * la palanca puesta y leer los rojos.
 *
 * ── ⚠️ MISMO CONTRATO QUE `d-simulacion.ts` ──────────────────────────────
 *
 * Respaldo FUERA del árbol, restauración en `finally`, sha256 comparado al
 * cerrar y salida 1 si no coincide.
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ_DE_SALIDAS, TEMP_DEL_BANCO, argumento } from './camara-comun'

const ARCHIVO = 'src/app/v3/_lib/escena/choreography.ts'
const LINEA_DEL_HERO = 'pose: { angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 },'

function main(): void {
  const distancia = argumento('distancia', '40')
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  mkdirSync(TEMP_DEL_BANCO, { recursive: true })

  const original = readFileSync(ARCHIVO)
  const hashOriginal = createHash('sha256').update(original).digest('hex')
  const respaldo = path.join(TEMP_DEL_BANCO, 'choreography.ts.gate')
  writeFileSync(respaldo, original)
  console.log(`  original: sha256 ${hashOriginal}`)
  console.log(`  respaldo FUERA del arbol: ${respaldo}`)

  const texto = original.toString('utf8')
  if (!texto.includes(LINEA_DEL_HERO)) throw new Error('no encontre la pose del hero: el archivo cambio de forma')

  let salida = ''
  try {
    writeFileSync(ARCHIVO, texto.replace(LINEA_DEL_HERO, LINEA_DEL_HERO.replace('distance: 19', `distance: ${distancia}`)), 'utf8')
    console.log(`\n  APLICADO distance: ${distancia}. Corriendo \`npm run verificar\` (tarda)...\n`)
    const r = spawnSync('npm', ['run', 'verificar'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      shell: true,
      windowsHide: true,
    })
    salida = `${r.stdout ?? ''}${r.stderr ?? ''}`
  } finally {
    writeFileSync(ARCHIVO, original)
    const hashFinal = createHash('sha256').update(readFileSync(ARCHIVO)).digest('hex')
    const igual = hashFinal === hashOriginal
    console.log(`\n  RESTAURADO: sha256 ${hashFinal} — ${igual ? 'IDENTICO al original' : 'DISTINTO: EL ARBOL QUEDO SUCIO'}`)
    if (!igual) process.exitCode = 1
  }

  const destino = path.join(RAIZ_DE_SALIDAS, `e-gate-d${distancia}.log`)
  writeFileSync(destino, salida, 'utf8')

  const lineas = salida.split(/\r?\n/)
  const rojos = lineas.filter((l) => /^\s*(FALLA|falla)\b/.test(l) || /con falla/.test(l))
  const invariantesRojos = lineas.filter((l) => /^\s{2,}falla\s+test:/.test(l) || /^\s*FALLA\s+/.test(l))
  console.log('\n  LOS ROJOS:\n')
  for (const l of invariantesRojos.slice(0, 60)) console.log(`   ${l.trim()}`)
  console.log(`\n  ${rojos.length} lineas con falla · salida completa en ${destino}`)
  const resumen = lineas.slice(lineas.findIndex((l) => l.includes('PASO 4')))
  for (const l of resumen.filter((l) => /FALLA|verificar:/.test(l))) console.log(`   ${l.trim()}`)
}

main()
