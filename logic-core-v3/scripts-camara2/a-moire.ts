/**
 * CAMARA-2 · A — EL MOIRÉ, que es lo que decide.
 *
 *     npx tsx scripts-camara2/a-moire.ts
 *
 * Tres preguntas:
 *
 *   0. **El control de equivalencia.** Esta composición tiene que reproducir los
 *      números que `s11-pantalla.invariant.ts` publica, o no mide lo mismo que
 *      el gate.
 *   1. **¿Hasta dónde se puede alejar el hero** antes de que el batido se salga
 *      de 2–5 bandas? En el cuadro del gate (16/9) y en el vertical, que es
 *      donde la palanca vive.
 *   2. **¿Y en el PASAJE?** Entre el hero y el keyframe siguiente la cámara
 *      recorre distancias intermedias. Si el batido se rompe ahí, la palanca no
 *      sirve aunque las dos puntas estén bien.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import {
  BANDAS_AFIRMADAS,
  BANDAS_PROSA,
  CUADRO_DEL_GATE,
  HERO,
  RAIZ_DE_SALIDAS,
  batidoEn,
  dos,
  exigirArbolLimpio,
  pistaConHeroEn,
  uno,
} from './camara2-comun'

/** Los cuadros verticales del alcance. 375 y 320 quedan fuera por instrucción. */
const CUADROS_VERTICALES = [
  { ancho: 390, alto: 844 },
  { ancho: 425, alto: 844 },
  { ancho: 768, alto: 1024 },
  { ancho: 1024, alto: 768 },
] as const

/**
 * LO QUE `s11-pantalla.invariant.ts` PUBLICA, para el control de equivalencia.
 *
 * ⚠ **La segunda fila es de la corrida del gate de CAMARA-1, que corrió con
 * `--distancia=40`, no 34.** La primera versión de este control la cargó como
 * `distancia: 34` porque la línea publicada dice *«hero celda 34px»* y ese 34 es
 * el tamaño de la CELDA en píxeles, no la distancia. El control lo cantó al
 * primer intento —«NO COINCIDE»— y por eso existe.
 */
const PUBLICADO = [
  { distancia: 19, celdaPx: 108, batidoPx: 626, bandas: 3.1 },
  { distancia: 40, celdaPx: 34, batidoPx: 118, bandas: 16.3 },
] as const

function control(): boolean {
  console.log('0 · CONTROL DE EQUIVALENCIA — contra lo que el invariante publica\n')
  let ok = true
  for (const p of PUBLICADO) {
    const b = batidoEn(pistaConHeroEn(p.distancia), HERO.at, CUADRO_DEL_GATE.ancho, CUADRO_DEL_GATE.alto)
    if (b === null) {
      console.log(`  d=${p.distancia}: SIN IMPACTO CONTRA EL PISO`)
      ok = false
      continue
    }
    const coincide =
      Math.round(b.celdaPx) === p.celdaPx && Math.round(b.batidoPx) === p.batidoPx && Math.abs(b.bandas - p.bandas) < 0.05
    if (!coincide) ok = false
    console.log(
      `  d=${String(p.distancia).padStart(3)}  celda ${b.celdaPx.toFixed(0).padStart(4)}px (pub ${p.celdaPx})` +
        ` · batido ${b.batidoPx.toFixed(0).padStart(4)}px (pub ${p.batidoPx})` +
        ` · ${b.bandas.toFixed(1).padStart(5)} bandas (pub ${p.bandas})   ${coincide ? 'COINCIDE' : '🔴 NO COINCIDE'}`,
    )
  }
  return ok
}

interface Curva {
  readonly cuadro: string
  readonly ancho: number
  readonly alto: number
  readonly puntos: readonly { distancia: number; bandas: number; celdaPx: number; profundidad: number }[]
  /** La mayor distancia que deja las bandas debajo del tope, o `null`. */
  readonly techoProsa: number | null
  readonly techoAfirmado: number | null
  readonly bandasHoy: number
}

function curva(ancho: number, alto: number): Curva {
  const puntos: { distancia: number; bandas: number; celdaPx: number; profundidad: number }[] = []
  for (let d = HERO.pose.distance; d <= 44 + 1e-9; d += 0.25) {
    const b = batidoEn(pistaConHeroEn(d), HERO.at, ancho, alto)
    if (b === null) continue
    puntos.push({ distancia: dos(d), bandas: dos(b.bandas), celdaPx: dos(b.celdaPx), profundidad: dos(b.profundidad) })
  }
  const ultimaBajo = (tope: number): number | null => {
    let ultima: number | null = null
    for (const p of puntos) {
      if (p.bandas < tope) ultima = p.distancia
      else break
    }
    return ultima
  }
  return {
    cuadro: `${ancho}x${alto}`,
    ancho,
    alto,
    puntos,
    techoProsa: ultimaBajo(BANDAS_PROSA.max),
    techoAfirmado: ultimaBajo(BANDAS_AFIRMADAS.max),
    bandasHoy: puntos[0]?.bandas ?? Number.NaN,
  }
}

function main(): void {
  exigirArbolLimpio()
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const equivale = control()
  console.log(`\n  el banco ${equivale ? 'REPRODUCE' : '🔴 NO reproduce'} los números del gate\n`)

  console.log('1 · EL TECHO DEL BATIDO — la mayor distancia del hero que deja las bandas adentro\n')
  console.log('cuadro       bandas hoy   techo con <5 (la prosa)   techo con <6 (lo afirmado)')
  const curvas = [curva(CUADRO_DEL_GATE.ancho, CUADRO_DEL_GATE.alto), ...CUADROS_VERTICALES.map((c) => curva(c.ancho, c.alto))]
  for (const c of curvas) {
    console.log(
      `${c.cuadro.padEnd(12)} ${c.bandasHoy.toFixed(1).padStart(10)}   ` +
        `${String(c.techoProsa ?? 'ninguna').padStart(22)}   ${String(c.techoAfirmado ?? 'ninguna').padStart(24)}`,
    )
  }

  console.log('\n  la curva del cuadro del gate (16/9):')
  const gate = curvas[0]
  console.log(
    '   ' +
      gate.puntos
        .filter((_, i) => i % 8 === 0)
        .map((p) => `d${p.distancia}=${p.bandas.toFixed(1)}`)
        .join('  '),
  )
  console.log('  la curva a 390x844:')
  const vert = curvas[1]
  console.log(
    '   ' +
      vert.puntos
        .filter((_, i) => i % 8 === 0)
        .map((p) => `d${p.distancia}=${p.bandas.toFixed(1)}`)
        .join('  '),
  )

  // ── 2 · EL PASAJE ────────────────────────────────────────────────────────
  console.log('\n2 · EL PASAJE — entre el hero y el keyframe siguiente\n')
  const siguiente = CHOREO_KEYFRAMES[1]
  console.log(
    `  del hero (p=${HERO.at}) a \`${siguiente.name}\` (p=${siguiente.at}, distance ${siguiente.pose.distance}) — 41 paradas\n`,
  )
  const pasajes: Record<string, unknown>[] = []
  for (const d of [HERO.pose.distance, 22, 24, 26, 28, 31, 34]) {
    const pista = pistaConHeroEn(d)
    let peor = { progreso: 0, bandas: 0 }
    const fila: number[] = []
    for (let i = 0; i <= 40; i += 1) {
      const p = HERO.at + ((siguiente.at - HERO.at) * i) / 40
      const b = batidoEn(pista, p, CUADRO_DEL_GATE.ancho, CUADRO_DEL_GATE.alto)
      if (b === null || Number.isNaN(b.bandas)) continue
      if (b.bandas > peor.bandas) peor = { progreso: p, bandas: b.bandas }
      if (i % 8 === 0) fila.push(b.bandas)
    }
    console.log(
      `  hero d=${String(d).padStart(3)}  peor en el pasaje ${peor.bandas.toFixed(1).padStart(5)} bandas (p=${peor.progreso.toFixed(3)})` +
        `   muestras: ${fila.map((x) => x.toFixed(1)).join(' · ')}`,
    )
    pasajes.push({ distanciaDelHero: d, peorBandas: dos(peor.bandas), peorProgreso: dos(peor.progreso), muestras: fila.map(uno) })
  }

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'a-moire.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), equivale, publicado: PUBLICADO, curvas, pasajes }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'a-moire.json')}`)
}

main()
