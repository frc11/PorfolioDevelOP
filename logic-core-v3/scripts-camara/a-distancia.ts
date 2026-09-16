/**
 * CAMARA-1 · A — CUÁNTO HAY QUE ALEJAR, keyframe por keyframe y ancho por ancho.
 *
 *     npx tsx scripts-camara/a-distancia.ts
 *
 * ── Las dos preguntas, y por qué la segunda es la que decide ──────────────
 *
 *   1. **¿Qué distancia hace entrar la tinta ENTERA con 5 % de margen?** Es la
 *      pregunta de la instrucción, y se contesta con un barrido.
 *   2. **Con el logo entero, ¿cuánto alto libre queda para el texto?** Es la que
 *      decide: si la tinta entra pero ocupa igual todo el alto, la palanca no
 *      sirve y hay que decirlo. Se publica en PÍXELES de viewport, que es la
 *      unidad en la que el bloque de texto está medido.
 *
 * ⚠️ **No aplica nada.** Cada cifra sale de una pista armada con `makeTrack`
 * sobre una copia de `CHOREO_KEYFRAMES`.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { bloqueDeTexto, repartoVertical } from '@/app/v3/_lib/escena/__tests__/s10-logo-alto'
import {
  MALLA_FINA,
  RAIZ_DE_SALIDAS,
  VENTANAS,
  bandaLibre,
  distanciaNecesaria,
  dos,
  medir,
  tres,
  type Ventana,
} from './camara-comun'

interface Fila {
  readonly keyframe: string
  readonly progreso: number
  readonly altura: number
  readonly ancho: number
  readonly alto: number
  readonly aspecto: number
  readonly distanciaDeHoy: number
  readonly distanciaNecesaria: number | null
  readonly factor: number | null
  readonly techoDeLaSala: number
  readonly yaEntra: boolean
  readonly anchoDeLaTintaHoy: number
  readonly anchoDeLaTintaDespues: number | null
  readonly coberturaHoy: number
  readonly coberturaDespues: number | null
  readonly libreArribaHoyPx: number
  readonly libreAbajoHoyPx: number
  readonly libreArribaDespuesPx: number | null
  readonly libreAbajoDespuesPx: number | null
}

/** El alto del bloque de texto del hero en cada ventana, del modelo de TAPADO-1. */
function altoDelBloque(v: Ventana): number {
  const b = bloqueDeTexto(repartoVertical('hero', v.ancho, v.alto))
  return b === null ? Number.NaN : b.abajoPx - b.arribaPx
}

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const filas: Fila[] = []

  console.log('PASO 1 — la distancia que hace entrar la tinta con 5 % de margen\n')
  console.log(
    'keyframe          ventana     hoy   necesaria  factor  techo   ancho tinta      libre arriba/abajo (px)',
  )
  for (const k of CHOREO_KEYFRAMES) {
    for (const v of VENTANAS) {
      const sol = distanciaNecesaria(k.name, k.at, v, k.pose.height)
      const hoy = medir(k.name, k.at, v, sol.distanciaDeHoy, MALLA_FINA)
      const desp = sol.distanciaNecesaria === null ? null : medir(k.name, k.at, v, sol.distanciaNecesaria, MALLA_FINA)
      if (hoy === null) throw new Error(`sin tinta en ${k.name} a ${v.ancho}`)
      const bHoy = bandaLibre(hoy.caja, v.alto)
      const bDesp = desp === null ? null : bandaLibre(desp.caja, v.alto)
      filas.push({
        keyframe: k.name,
        progreso: k.at,
        altura: k.pose.height,
        ancho: v.ancho,
        alto: v.alto,
        aspecto: tres(v.ancho / v.alto),
        distanciaDeHoy: sol.distanciaDeHoy,
        distanciaNecesaria: sol.distanciaNecesaria === null ? null : dos(sol.distanciaNecesaria),
        factor: sol.factor === null ? null : tres(sol.factor),
        techoDeLaSala: dos(sol.techo),
        yaEntra: sol.yaEntra,
        anchoDeLaTintaHoy: tres(hoy.ancho),
        anchoDeLaTintaDespues: desp === null ? null : tres(desp.ancho),
        coberturaHoy: tres(hoy.cobertura),
        coberturaDespues: desp === null ? null : tres(desp.cobertura),
        libreArribaHoyPx: Math.round(bHoy.arribaPx),
        libreAbajoHoyPx: Math.round(bHoy.abajoPx),
        libreArribaDespuesPx: bDesp === null ? null : Math.round(bDesp.arribaPx),
        libreAbajoDespuesPx: bDesp === null ? null : Math.round(bDesp.abajoPx),
      })
      const f = filas[filas.length - 1]
      console.log(
        `${k.name.padEnd(16)} ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)} ` +
          `${String(f.distanciaDeHoy).padStart(5)}   ${(f.distanciaNecesaria ?? '  n/a').toString().padStart(7)}  ` +
          `${(f.factor ?? '  n/a').toString().padStart(6)}  ${String(f.techoDeLaSala).padStart(5)}   ` +
          `${f.anchoDeLaTintaHoy.toFixed(3)} -> ${(f.anchoDeLaTintaDespues ?? NaN).toFixed(3)}   ` +
          `${String(f.libreArribaHoyPx).padStart(4)}/${String(f.libreAbajoHoyPx).padStart(4)} -> ` +
          `${String(f.libreArribaDespuesPx ?? '   -').padStart(4)}/${String(f.libreAbajoDespuesPx ?? '   -').padStart(4)}` +
          `${f.yaEntra ? '   (ya entra)' : ''}`,
      )
    }
  }

  // ── El alto que el texto necesita, para poder decir si el hueco alcanza ──
  console.log('\nEl bloque de texto del HERO, y el hueco que la palanca le deja\n')
  console.log('ventana     bloque   libre abajo HOY   libre abajo con la palanca   reserva pb-20')
  const PB = 80
  const resumenDelHero = VENTANAS.map((v) => {
    const f = filas.find((x) => x.keyframe === 'hero' && x.ancho === v.ancho)!
    const bloque = altoDelBloque(v)
    const utilHoy = f.libreAbajoHoyPx - PB
    const utilDesp = f.libreAbajoDespuesPx === null ? null : f.libreAbajoDespuesPx - PB
    console.log(
      `${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)} ${bloque.toFixed(0).padStart(6)}   ` +
        `${String(f.libreAbajoHoyPx).padStart(5)} (util ${String(utilHoy).padStart(4)})   ` +
        `${String(f.libreAbajoDespuesPx ?? '-').padStart(5)} (util ${String(utilDesp ?? '-').padStart(4)})        ` +
        `${utilDesp !== null && utilDesp >= bloque ? 'ENTRA' : 'NO ENTRA'}`,
    )
    return {
      ancho: v.ancho,
      alto: v.alto,
      altoDelBloquePx: Math.round(bloque),
      libreAbajoHoyPx: f.libreAbajoHoyPx,
      libreAbajoDespuesPx: f.libreAbajoDespuesPx,
      utilHoyPx: utilHoy,
      utilDespuesPx: utilDesp,
      entraElBloque: utilDesp !== null && utilDesp >= bloque,
    }
  })

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'a-distancia.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), reservaDelPiePx: PB, filas, resumenDelHero }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'a-distancia.json')}`)
}

main()
