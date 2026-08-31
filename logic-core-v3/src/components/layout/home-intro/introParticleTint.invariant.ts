import {
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
} from '@/app/v3/_lib/escena/probeParticles'
import { shadeUnlit } from '@/app/probe-escena/__tests__/shading'

import { check, report, section } from './introChecks'
import type { IntroMote } from './introParticles'
import { near } from './introParticleProbe'
import { INTRO_TINT_STEPS, introTintColor, moteRampColor } from './introParticleTint'
import { introField } from './introReadingProbe'
import { hexToSrgb, mixSrgbInLinearLight, srgbToHex } from './introShading'

/**
 * COMPROBACIÓN ESTÁTICA DEL COLOR — **la mitad de la especie que S14 no toca.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleTint.invariant.ts
 *
 * Salió de `introParticles.invariant.ts` en S14, cuando la rampa se mudó a
 * `introParticleTint.ts` y esa suite cruzó las 300 líneas. La costura es la del
 * módulo: **allá el tamaño, acá el color.**
 *
 * 🔴 **Y es lo que hace verdadera la frase del sprint.** S14 corre el reparto de
 * tamaños hacia la escala grande, pero **el color, el material y la forma se
 * conservan**: un cambio de tamaño se perdona, uno de sustancia no. Estas
 * comprobaciones son las que lo miden, y sus cifras son las mismas que S13
 * publicó — la rampa no cambió ni un byte.
 */

const intro = introField(1440, 810)

// ── 4 · El color ────────────────────────────────────────────────────────────

section('El color de cada mota es el que la escena renderiza')

/**
 * La rampa del intro contra `shadeUnlit`, que es como la escena mide el valor de
 * una mota: el color del vértice —la mezcla en luz lineal de cerca a lejos, que
 * es donde `THREE.Color.lerp` trabaja— pasa directo al tone mapping, porque
 * `PointsMaterial` no recibe luz.
 *
 * Son dos caminos independientes al mismo número: acá el del intro
 * (`moteRampColor`, con la versión para grises del operador) y allá el de la
 * escena (`neutralToneMap` entero, canal por canal).
 */
const NEAR = hexToSrgb(PARTICLE_NEAR_COLOR)
const FAR = hexToSrgb(PARTICLE_FAR_COLOR)
const greenOf = (hex: string) => parseInt(hex.slice(3, 5), 16)

let worstColor = 0
let exactColors = 0
for (let i = 0; i <= 200; i += 1) {
  const t = i / 200
  const raw = srgbToHex(mixSrgbInLinearLight(NEAR, FAR, t))
  const difference = Math.abs(greenOf(moteRampColor(NEAR, FAR, t)) - Math.round(shadeUnlit(raw)))
  if (difference === 0) exactColors += 1
  worstColor = Math.max(worstColor, difference)
}
check(
  'la rampa del intro es la que la escena renderiza — 201 puntos, dos caminos',
  worstColor <= 1,
  `${exactColors} de 201 exactos · el resto a un byte, que es el redondeo`
)
check(
  'y los dos extremos son las motas cercana y lejana de la escena',
  near(shadeUnlit(PARTICLE_NEAR_COLOR), 70.6, 0.1) &&
    near(shadeUnlit(PARTICLE_FAR_COLOR), 214.5, 0.1),
  `${shadeUnlit(PARTICLE_NEAR_COLOR).toFixed(1)} → ${shadeUnlit(PARTICLE_FAR_COLOR).toFixed(1)}`
)

/** El error que introduce cuantizar la rampa en escalones para poder teñir. */
let worstTint = 0
for (const mote of intro.motes as readonly IntroMote[]) {
  if (mote.tint < 0) continue
  worstTint = Math.max(
    worstTint,
    Math.abs(greenOf(mote.color) - greenOf(introTintColor(mote.tint)))
  )
}
check(
  'y el escalonado del teñido queda acotado por la mitad del paso',
  worstTint <= 3.2,
  `${INTRO_TINT_STEPS} escalones sobre ${(shadeUnlit(PARTICLE_FAR_COLOR) - shadeUnlit(PARTICLE_NEAR_COLOR)).toFixed(0)} bytes · peor mota ${worstTint.toFixed(1)} de 255`
)

/**
 * Control positivo: repartir los escalones parejo en `t` —que es lo obvio y lo
 * que estaba primero— **duplica el peor error**, y lo concentra en las motas
 * cercanas. Sin esta medición, el reparto por valor parecería una elección de
 * estilo en vez de la que baja el error a la mitad.
 */
let worstEven = 0
for (let step = 1; step < INTRO_TINT_STEPS; step += 1) {
  const a = greenOf(moteRampColor(NEAR, FAR, (step - 1) / (INTRO_TINT_STEPS - 1)))
  const b = greenOf(moteRampColor(NEAR, FAR, step / (INTRO_TINT_STEPS - 1)))
  worstEven = Math.max(worstEven, (b - a) / 2)
}
check(
  'control positivo — con escalones parejos en `t` el error sería el doble',
  worstEven > worstTint * 1.8,
  `${worstEven.toFixed(1)} contra ${worstTint.toFixed(1)} de 255`
)

report('introParticleTint')
