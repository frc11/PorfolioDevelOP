/**
 * CAMARA-1 · C — QUÉ ROMPE LA PALANCA, con su número.
 *
 *     npx tsx scripts-camara/c-rotura.ts
 *
 * Tres preguntas, ninguna supuesta:
 *
 *   1. **¿Se puede condicionar sin mover nada arriba de 1025?** Se contesta
 *      cruzando los aspectos de las ventanas en alcance contra los de las
 *      ventanas que el repo declara ARRIBA del umbral. Si algún par comparte
 *      aspecto a los dos lados, el aspecto NO separa y hay que decirlo.
 *   2. **¿Qué le pasa al PRELOADER?** `SCENE_ENTRY_POSE` **es** la pose del
 *      hero (`scene-framing.ts:144`), así que mover la distancia del hero mueve
 *      el aterrizaje del preloader. Se mide su centro, su tamaño y su rotación
 *      de aterrizaje, con la copia de la fórmula que `lib/scene-camera.ts`
 *      conserva con el `max(0, …)`.
 *   3. **¿Qué afirmaciones del gate dependen de la distancia?** Se censan por
 *      grep sobre el fuente de los invariantes, y se listan con su línea.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import { SCENE_ENTRY_POSE, frameScenePose } from '@/lib/scene-framing'
import { RAIZ_DE_SALIDAS, VENTANAS, dos, tres } from './camara-comun'

/**
 * LAS VENTANAS QUE EL REPO DECLARA ARRIBA DEL UMBRAL. Salen de
 * `s10-logo-lectura.VENTANAS` (1025 cruzado con los tres altos declarados) y de
 * `scripts-b4/perfiles.ts`. Son las que NO se pueden mover.
 */
const ARRIBA_DEL_UMBRAL: readonly (readonly [number, number, string])[] = [
  [1025, 667, 's10-logo-lectura.VENTANAS — 1025 x el alto de 375'],
  [1025, 844, 's10-logo-lectura.VENTANAS — 1025 x el alto de 390'],
  [1025, 900, 's10-logo-lectura.VENTANAS — 1025 x el alto de escritorio'],
  [1025, 768, 'scripts-b4/perfiles.ts — el par del umbral'],
  [1440, 900, 'scripts-b4/perfiles.ts — CERRADO'],
  [1920, 1080, 'scripts-b4/perfiles.ts — CERRADO'],
]

/** Las distancias candidatas por ventana, del PASO 1b. `null` = no hay. */
const CANDIDATA: Readonly<Record<number, number | null>> = {
  320: null,
  375: null,
  390: 28,
  425: 23,
  768: 37,
  1024: 37,
  /** Las dos cerradas: la palanca NO se les aplica, y por eso entran como `null`. */
  1440: null,
  1920: null,
}

function separaElAspecto(): void {
  console.log('\n1 · ¿SEPARA EL ASPECTO? — los aspectos de los dos lados del umbral\n')
  const enAlcance = VENTANAS.filter((v) => v.enAlcance).map((v) => ({
    etiqueta: `${v.ancho}x${v.alto}`,
    aspecto: v.ancho / v.alto,
  }))
  const arriba = ARRIBA_DEL_UMBRAL.map(([w, h, p]) => ({ etiqueta: `${w}x${h}`, aspecto: w / h, procedencia: p }))
  console.log('  EN ALCANCE:  ' + enAlcance.map((x) => `${x.etiqueta} ${x.aspecto.toFixed(4)}`).join(' · '))
  console.log('  ARRIBA:      ' + arriba.map((x) => `${x.etiqueta} ${x.aspecto.toFixed(4)}`).join(' · '))

  const maxEnAlcance = Math.max(...enAlcance.map((x) => x.aspecto))
  const minArriba = Math.min(...arriba.map((x) => x.aspecto))
  console.log(
    `\n  el mayor aspecto EN ALCANCE es ${maxEnAlcance.toFixed(4)} y el menor ARRIBA es ${minArriba.toFixed(4)}: ` +
      `${maxEnAlcance < minArriba ? 'SEPARAN' : 'SE CRUZAN'}`,
  )
  // Sin 1024, que es el unico apaisado del alcance.
  const sin1024 = enAlcance.filter((x) => !x.etiqueta.startsWith('1024'))
  const maxSin1024 = Math.max(...sin1024.map((x) => x.aspecto))
  console.log(
    `  sin 1024x768, el mayor EN ALCANCE es ${maxSin1024.toFixed(4)}: ` +
      `${maxSin1024 < minArriba ? `SEPARAN, con un umbral entre ${maxSin1024.toFixed(4)} y ${minArriba.toFixed(4)}` : 'SE CRUZAN'}`,
  )
  const choques = enAlcance.flatMap((a) =>
    arriba.filter((b) => Math.abs(a.aspecto - b.aspecto) < 1e-6).map((b) => `${a.etiqueta} contra ${b.etiqueta}`),
  )
  console.log(`  pares con el MISMO aspecto a los dos lados: ${choques.length === 0 ? 'ninguno' : choques.join(' · ')}`)
}

function preloader(): void {
  console.log('\n2 · EL PRELOADER — `SCENE_ENTRY_POSE` ES la pose del hero\n')
  console.log(
    'ventana     d       centro X (px)   ancho tinta (px)   alto tinta (px)   centro Y (px)   codo `max(0,…)`',
  )
  const filas: Record<string, unknown>[] = []
  for (const v of VENTANAS) {
    const cand = CANDIDATA[v.ancho]
    for (const d of cand === null ? [SCENE_ENTRY_POSE.distance] : [SCENE_ENTRY_POSE.distance, cand]) {
      const f = frameScenePose({ ...SCENE_ENTRY_POSE, distance: d }, v.ancho, v.alto)
      if (f === null) {
        console.log(`${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)} ${String(d).padStart(5)}   (sin encuadre)`)
        continue
      }
      // El codo: ¿la perilla `frameX` mueve el centro, o sigue clavada?
      const conMenos = frameScenePose({ ...SCENE_ENTRY_POSE, distance: d, frameX: -1 }, v.ancho, v.alto)
      const conMas = frameScenePose({ ...SCENE_ENTRY_POSE, distance: d, frameX: 1 }, v.ancho, v.alto)
      const recorrido = Math.abs((conMas?.centerXPx ?? 0) - (conMenos?.centerXPx ?? 0))
      const clavado = recorrido < 0.5
      console.log(
        `${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)} ${String(d).padStart(5)}   ` +
          `${f.centerXPx.toFixed(2).padStart(13)}   ${f.inkWidthPx.toFixed(1).padStart(15)}   ` +
          `${f.inkHeightPx.toFixed(1).padStart(15)}   ${f.centerYPx.toFixed(2).padStart(13)}   ` +
          `${clavado ? 'CLAVADO' : `libre (${recorrido.toFixed(1)} px)`}`,
      )
      filas.push({
        ancho: v.ancho,
        alto: v.alto,
        distancia: d,
        centroXPx: dos(f.centerXPx),
        centroYPx: dos(f.centerYPx),
        anchoDeLaTintaPx: dos(f.inkWidthPx),
        altoDeLaTintaPx: dos(f.inkHeightPx),
        recorridoDeFrameXPx: dos(recorrido),
        codoClavado: clavado,
      })
    }
  }

  // La rotación de aterrizaje: `SCENE_ENTRY_VIEW.pitchDeg`, que NO depende del viewport.
  console.log('\n  la ROTACIÓN de aterrizaje del preloader — `SCENE_ENTRY_VIEW.pitchDeg`\n')
  const pitch = (d: number): number =>
    (Math.atan2(SCENE_ENTRY_POSE.height - ORBIT_TARGET_Y, d) * 180) / Math.PI
  const hoy = pitch(SCENE_ENTRY_POSE.distance)
  for (const d of [SCENE_ENTRY_POSE.distance, 23, 28, 37]) {
    console.log(
      `    d=${String(d).padStart(3)}  pitch ${pitch(d).toFixed(3)}°` +
        (d === SCENE_ENTRY_POSE.distance ? '   (hoy)' : `   Δ ${(pitch(d) - hoy).toFixed(3)}°`),
    )
  }
  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'c-preloader.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), pitchHoy: tres(hoy), filas }, null, 2)}\n`,
    'utf8',
  )
}

/** Censo por grep: qué archivos del gate nombran una distancia o la pose de entrada. */
function censoDelGate(): void {
  console.log('\n3 · QUÉ MIRA EL GATE — censo de los invariantes que dependen de la distancia\n')
  const raices = ['src/app/v3/_lib/escena/__tests__', 'src/app/probe-escena/__tests__', 'src/app/v3/_lib/__tests__', 'src/lib']
  const patrones: readonly (readonly [string, RegExp])[] = [
    ['distancia literal', /\bdistance:\s*\d/],
    ['distancia por nombre', /\bpose\.distance\b|\.distance\b/],
    ['pose de entrada', /SCENE_ENTRY_POSE|SCENE_ENTRY_VIEW|frameSceneEntry/],
    ['posición del logo en px', /centra la tinta en|centerXPx/],
  ]
  const hallazgos: { archivo: string; patron: string; linea: number; texto: string }[] = []
  const recorrer = (dir: string): void => {
    for (const nombre of readdirSync(dir)) {
      const p = path.join(dir, nombre)
      if (statSync(p).isDirectory()) {
        recorrer(p)
        continue
      }
      if (!/\.tsx?$/.test(nombre)) continue
      const lineas = readFileSync(p, 'utf8').split(/\r?\n/)
      for (const [etiqueta, re] of patrones) {
        lineas.forEach((l, i) => {
          if (re.test(l)) hallazgos.push({ archivo: p.replace(/\\/g, '/'), patron: etiqueta, linea: i + 1, texto: l.trim().slice(0, 96) })
        })
      }
    }
  }
  for (const r of raices) recorrer(r)

  const porArchivo = new Map<string, number>()
  for (const h of hallazgos) porArchivo.set(h.archivo, (porArchivo.get(h.archivo) ?? 0) + 1)
  const orden = [...porArchivo.entries()].sort((a, b) => b[1] - a[1])
  for (const [archivo, n] of orden.slice(0, 18)) console.log(`  ${String(n).padStart(3)}  ${archivo}`)
  console.log(`\n  ${hallazgos.length} coincidencias en ${porArchivo.size} archivos`)
  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'c-censo.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), hallazgos }, null, 2)}\n`,
    'utf8',
  )
}

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  console.log('PASO 2 — QUÉ ROMPE LA PALANCA')
  console.log(`\n  el keyframe del hero de hoy: distance ${CHOREO_KEYFRAMES[0].pose.distance}, height ${CHOREO_KEYFRAMES[0].pose.height}`)
  separaElAspecto()
  preloader()
  censoDelGate()
}

main()
