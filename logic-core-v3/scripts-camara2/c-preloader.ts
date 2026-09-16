/**
 * CAMARA-2 · C — EL PRELOADER: el daño de arrastrarlo y el daño de desacoplarlo.
 *
 *     npx tsx scripts-camara2/c-preloader.ts --distancia=25.75
 *
 * ── La pregunta del PASO 1, contestada con su línea ───────────────────────
 *
 * `scene-framing.ts:144` dice, literal:
 *
 *     export const SCENE_ENTRY_POSE: ChoreoPose = CHOREO_KEYFRAMES[0].pose
 *
 * No es una copia: **es el mismo objeto**. Y no es un accidente: el docblock de
 * arriba lo declara como propiedad — *«si el humano recalibra ese keyframe, el
 * preloader lo sigue sin que nadie edite un segundo lugar»*— y
 * `s16-encuadre.invariant.ts:219` **afirma la identidad con `===`**.
 *
 * Así que hay exactamente dos caminos, y este script le pone número a los dos:
 *
 *   · **Arrastrarlo** — no tocar nada más. El preloader aterriza en la pose
 *     nueva: cambia de tamaño y de inclinación. Es lo que CAMARA-1 midió a 40.
 *   · **Desacoplarlo** — que `SCENE_ENTRY_POSE` deje de ser ese objeto. Rompe la
 *     afirmación de `s16-encuadre` (revocable, es un atajo declarado) y, sobre
 *     todo, **abre un salto en el relevo**: el preloader deja el logo de un
 *     tamaño y la escena lo toma de otro, en el mismo cuadro.
 *
 * El salto del relevo es lo que decide, y por eso se mide en píxeles.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import { SCENE_ENTRY_POSE, frameScenePose } from '@/lib/scene-framing'
import { DISTANCIA_DECLARADA_DEL_HERO, RAIZ_DE_SALIDAS, argumento, dos, exigirArbolLimpio } from './camara2-comun'

const VENTANAS = [
  { ancho: 390, alto: 844 },
  { ancho: 425, alto: 844 },
  { ancho: 768, alto: 1024 },
  { ancho: 1024, alto: 768 },
] as const

/** El guardián de contaminación vive en el banco. Ver su docblock allá. */
exigirArbolLimpio()
const HOY = DISTANCIA_DECLARADA_DEL_HERO

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const propuesta = Number.parseFloat(argumento('distancia', '25.75'))

  console.log('PASO 1 — ¿SON EL MISMO OBJETO?\n')
  console.log(
    `  SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose  →  ${SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose}` +
      '   (identidad, no igualdad de valores)',
  )
  console.log(
    `  y la distancia ES por keyframe: ${CHOREO_KEYFRAMES.map((k) => `${k.name}=${k.pose.distance}`).join(' · ')}`,
  )
  console.log('  ningún keyframe deriva su distancia de otro: son ocho literales independientes en el array.\n')

  console.log(`PASO 5 — EL RELEVO, con el hero en ${propuesta} (hoy ${HOY})\n`)
  console.log(
    'ventana      tinta del preloader (px)      centro X (px)        salto si se DESACOPLA',
  )
  const filas: Record<string, unknown>[] = []
  for (const v of VENTANAS) {
    const hoy = frameScenePose({ ...SCENE_ENTRY_POSE, distance: HOY }, v.ancho, v.alto)
    const nueva = frameScenePose({ ...SCENE_ENTRY_POSE, distance: propuesta }, v.ancho, v.alto)
    if (hoy === null || nueva === null) {
      console.log(`${v.ancho}x${v.alto}: sin encuadre`)
      continue
    }
    const saltoAncho = Math.abs(nueva.inkWidthPx - hoy.inkWidthPx)
    const saltoX = Math.abs(nueva.centerXPx - hoy.centerXPx)
    console.log(
      `${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(5)} ` +
        `${hoy.inkWidthPx.toFixed(0).padStart(5)} → ${nueva.inkWidthPx.toFixed(0).padEnd(5)} ` +
        `(${(((nueva.inkWidthPx - hoy.inkWidthPx) / hoy.inkWidthPx) * 100).toFixed(0).padStart(4)} %)   ` +
        `${hoy.centerXPx.toFixed(1).padStart(6)} → ${nueva.centerXPx.toFixed(1).padEnd(6)}   ` +
        `${saltoAncho.toFixed(0).padStart(4)} px de ancho · ${saltoX.toFixed(1).padStart(5)} px de centro`,
    )
    filas.push({
      ancho: v.ancho,
      alto: v.alto,
      anchoDeLaTintaHoyPx: dos(hoy.inkWidthPx),
      anchoDeLaTintaNuevaPx: dos(nueva.inkWidthPx),
      centroXHoyPx: dos(hoy.centerXPx),
      centroXNuevoPx: dos(nueva.centerXPx),
      saltoDeAnchoPx: dos(saltoAncho),
      saltoDeCentroPx: dos(saltoX),
    })
  }

  const pitch = (d: number): number => (Math.atan2(CHOREO_KEYFRAMES[0].pose.height - ORBIT_TARGET_Y, d) * 180) / Math.PI
  console.log(
    `\n  la inclinación de aterrizaje: ${pitch(HOY).toFixed(3)}° → ${pitch(propuesta).toFixed(3)}°` +
      `   (Δ ${(pitch(propuesta) - pitch(HOY)).toFixed(3)}°)`,
  )
  console.log(
    '\n  ARRASTRARLO cuesta: el preloader aterriza con esa tinta y esa inclinación, o sea que el vuelo entero cambia de destino.',
  )
  console.log(
    '  DESACOPLARLO cuesta: el relevo salta esos píxeles en un cuadro, y se cae la afirmación de identidad de `s16-encuadre.invariant.ts:219`.',
  )

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'c-preloader.json'),
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        mismoObjeto: SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose,
        distanciaDeHoy: HOY,
        distanciaPropuesta: propuesta,
        pitchHoy: dos(pitch(HOY)),
        pitchPropuesto: dos(pitch(propuesta)),
        filas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'c-preloader.json')}`)
}

main()
