/**
 * CAMARA-2 · B — LAS CUATRO PAREDES, cada una como función de la distancia del
 * hero.
 *
 *     npx tsx scripts-camara2/b-paredes.ts
 *     npx tsx scripts-camara2/b-paredes.ts --luz=28      (modo hijo, ver abajo)
 *
 * CAMARA-1 encontró las paredes corriendo el gate con UN valor (40) y leyendo qué
 * se ponía en rojo. Eso dice que a 40 se cruzan; no dice DÓNDE. Acá cada pared se
 * despeja como desigualdad y se publica el valor exacto en que se cruza.
 *
 * ── Las cuatro, y de dónde sale cada una ──────────────────────────────────
 *
 *   1. **La capa fina del fondo** — `s10-fondo.invariant.ts`:
 *      `MOIRE_NEAR_RADIUS > max(distancias) + 5`. La holgura de 5 es del
 *      invariante, no de este banco.
 *   2. **El campo de motas** — `introParticles.invariant.ts`:
 *      `PARTICLE_R_MAX > hypot(distancia, altura − ORBIT_TARGET_Y)`. Es un
 *      CONTROL POSITIVO: cuando se cae, las tres comprobaciones que protege
 *      quedan verdes por vacío.
 *   3. **El techo de luz del hero** — `s12-barrido.invariant.ts`: el valor medio
 *      del cuadro en la pose del hero contra 210.
 *   4. **El batido** — lo mide `a-moire.ts`.
 *
 * ── ⚠️ POR QUÉ LA TERCERA NECESITA UN PROCESO HIJO ───────────────────────
 *
 * `sampleFrame` usa el `track` de módulo de `frameProbe.ts`, que se arma con
 * `makeTrack(CHOREO_KEYFRAMES)` **en el momento del import**. No hay parámetro
 * por donde pasarle otra pista. Lo que sí se puede es **mutar la pose ANTES de
 * que ese módulo se importe** y pedirlo con un `import()` dinámico: la pista se
 * arma con el valor nuevo. Como los módulos se cachean por proceso, cada
 * distancia necesita su proceso, y por eso este archivo se llama a sí mismo.
 *
 * **Nada de esto toca el árbol**: la mutación vive en la memoria del proceso
 * hijo y muere con él. `choreography.ts` no se escribe.
 */

import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import type { MutableChoreoPose } from '@/app/v3/_lib/escena/choreographyTypes'
import { ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import { MOIRE_NEAR_RADIUS } from '@/app/v3/_lib/escena/probeMoire'
import { PARTICLE_R_MAX } from '@/app/v3/_lib/escena/probeParticles'
import { RAIZ_DE_SALIDAS, argumento, dos, exigirArbolLimpio } from './camara2-comun'

const HERO = CHOREO_KEYFRAMES[0]
/** La holgura que `s10-fondo.invariant.ts` exige entre la capa y la cámara. */
const HOLGURA_DE_LA_CAPA = 5
/** El techo que el humano fijó en S12 para el valor medio del hero. */
const TECHO_DE_LUZ = 210

// ── MODO HIJO: un solo valor de luz, con la pose mutada antes del import ─────

async function modoLuz(distancia: number): Promise<void> {
  // El guardian corre ANTES de la mutacion deliberada: comprueba que el archivo
  // en disco este limpio, no el objeto que este proceso esta por tocar.
  exigirArbolLimpio()
  ;(HERO.pose as MutableChoreoPose).distance = distancia
  const { sampleFrame } = await import('@/app/probe-escena/__tests__/frameProbe')
  const { MOIRE_MISMATCH } = await import('@/app/v3/_lib/escena/probeMoire')
  const { CELOSIA_BAR, celosiaSkyFactor } = await import('@/app/v3/_lib/escena/probeCelosia')
  const { CELOSIA_SUN_RADIUS_DEG, celosiaSunSpread } = await import('@/app/v3/_lib/escena/celosiaPenumbra')
  const sky = celosiaSkyFactor(CELOSIA_BAR)
  /** La fila del hero de `s12-barrido`: azimut 0, altura 6,4, menos su delta de motas. */
  const DELTA_DE_MOTAS_DEL_HERO = 8
  const media =
    sampleFrame(
      HERO.at,
      { progress: HERO.at, cameraAzimuthDeg: 0, cameraHeight: HERO.pose.height },
      {
        backdrop: true,
        mismatch: MOIRE_MISMATCH,
        celosia: { bar: CELOSIA_BAR, sky, spread: celosiaSunSpread(CELOSIA_SUN_RADIUS_DEG) },
      },
      200,
      113,
    ).mean - DELTA_DE_MOTAS_DEL_HERO
  console.log(JSON.stringify({ distancia, media }))
}

// ── MODO PADRE ──────────────────────────────────────────────────────────────

function luzEn(distancia: number): number {
  const r = spawnSync('npx', ['tsx', 'scripts-camara2/b-paredes.ts', `--luz=${distancia}`], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: true,
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  })
  const linea = `${r.stdout ?? ''}`.trim().split(/\r?\n/).filter((l) => l.startsWith('{')).pop()
  if (linea === undefined) throw new Error(`el hijo no devolvio una medicion para d=${distancia}: ${r.stdout}${r.stderr}`)
  return (JSON.parse(linea) as { media: number }).media
}

function main(): void {
  exigirArbolLimpio()
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const otras = CHOREO_KEYFRAMES.filter((k) => k.name !== HERO.name).map((k) => k.pose.distance)
  const mayorDeLasOtras = Math.max(...otras)
  const altura = HERO.pose.height - ORBIT_TARGET_Y

  console.log('PASO 3 — LAS CUATRO PAREDES, con el keyframe del hero solo\n')
  console.log(`  la distancia de hoy del hero: ${HERO.pose.distance} · altura ${HERO.pose.height} · las otras siete: ${otras.join(' · ')}\n`)

  // 1 · La capa fina
  const cruceDeLaCapa = MOIRE_NEAR_RADIUS - HOLGURA_DE_LA_CAPA
  console.log('1 · LA CAPA FINA DEL FONDO')
  console.log(
    `   regla: MOIRE_NEAR_RADIUS (${MOIRE_NEAR_RADIUS}) > mayor distancia + ${HOLGURA_DE_LA_CAPA}` +
      `   ·   hoy el mayor es ${mayorDeLasOtras} (\`cierre\`)`,
  )
  console.log(`   🔴 se cruza con el hero en d = ${cruceDeLaCapa} (estricto: d < ${cruceDeLaCapa})\n`)

  // 2 · El campo de motas
  const cruceDeLasMotas = Math.sqrt(PARTICLE_R_MAX ** 2 - altura ** 2)
  console.log('2 · EL CAMPO DE MOTAS')
  console.log(
    `   regla: PARTICLE_R_MAX (${PARTICLE_R_MAX}) > hypot(distancia, ${altura})` +
      `   ·   hoy la cámara está a ${Math.hypot(HERO.pose.distance, altura).toFixed(2)}`,
  )
  console.log(`   🔴 se cruza con el hero en d = ${dos(cruceDeLasMotas)}\n`)

  // 3 · El techo de luz
  console.log('3 · EL TECHO DE LUZ DEL HERO (un proceso hijo por valor, tarda)\n')
  const valores = [19, 22, 24, 26, 28, 30, 32, 34]
  const luces = valores.map((d) => ({ distancia: d, media: luzEn(d) }))
  for (const l of luces) {
    console.log(
      `   d=${String(l.distancia).padStart(3)}  media ${l.media.toFixed(1).padStart(6)}` +
        `   ${l.media < TECHO_DE_LUZ ? `margen ${(TECHO_DE_LUZ - l.media).toFixed(1)}` : `🔴 CRUZA por ${(l.media - TECHO_DE_LUZ).toFixed(1)}`}`,
    )
  }
  const bajo = luces.filter((l) => l.media < TECHO_DE_LUZ)
  const ultimoBajo = bajo.length === 0 ? null : bajo[bajo.length - 1]
  const primerAlto = luces.find((l) => l.media >= TECHO_DE_LUZ) ?? null
  const cruceDeLaLuz =
    ultimoBajo === null || primerAlto === null
      ? null
      : ultimoBajo.distancia +
        ((TECHO_DE_LUZ - ultimoBajo.media) * (primerAlto.distancia - ultimoBajo.distancia)) /
          (primerAlto.media - ultimoBajo.media)
  console.log(
    `\n   🔴 se cruza con el hero en d ≈ ${cruceDeLaLuz === null ? 'fuera del barrido' : dos(cruceDeLaLuz)} (interpolado entre las dos paradas que lo rodean)\n`,
  )

  console.log('4 · EL BATIDO — lo mide `a-moire.ts`: techo 25,75 a 16/9 con la regla estricta (<5)\n')

  const paredes = [
    { pared: 'batido (16/9, <5 bandas)', cruce: 25.75, fuente: 's11-pantalla.invariant.ts' },
    { pared: 'batido (16/9, <6 bandas)', cruce: 28.25, fuente: 's11-pantalla.invariant.ts' },
    { pared: 'techo de luz del hero (210)', cruce: cruceDeLaLuz === null ? null : dos(cruceDeLaLuz), fuente: 's12-barrido.invariant.ts' },
    { pared: 'capa fina del fondo', cruce: cruceDeLaCapa, fuente: 's10-fondo.invariant.ts' },
    { pared: 'campo de motas', cruce: dos(cruceDeLasMotas), fuente: 'introParticles.invariant.ts' },
  ]
  console.log('LAS CUATRO, ORDENADAS POR CUÁL APRIETA PRIMERO\n')
  for (const p of [...paredes].sort((a, b) => (a.cruce ?? 1e9) - (b.cruce ?? 1e9))) {
    console.log(`   d = ${String(p.cruce ?? 'n/d').padStart(6)}   ${p.pared.padEnd(28)} ${p.fuente}`)
  }

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'b-paredes.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), distanciaDeHoy: HERO.pose.distance, luces, paredes }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'b-paredes.json')}`)
}

const luz = argumento('luz', '')
if (luz !== '') {
  void modoLuz(Number.parseFloat(luz))
} else {
  main()
}
