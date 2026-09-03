import {
  DUST_SHELLS,
  PARTICLES_MAX,
  PARTICLE_SIZE,
} from '@/app/v3/_lib/escena/probeParticles'

import { check, report, s, section } from './introChecks'
import { introLegibility } from './introLegibilityProbe'
import {
  INTRO_DUST_SCALE,
  INTRO_DUST_SHARE,
  INTRO_DUST_SIZE,
} from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { near, quantile } from './introParticleProbe'
import { introParticleWindows } from './introParticleTiming'
import {
  S13_DUST_SHARE,
  classicDotPx,
  dustSizes,
  inkCoverage,
  introField as after,
  isReadable,
  s13Field as before,
} from './introReadingProbe'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DE LA PERILLA DE TAMAÑO — **la banda, y qué arrastra.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleScale.invariant.ts
 *
 * `INTRO_DUST_SCALE` es de la misma clase que `PARTICLE_HANDOFF_FRAC` y que `placeS`:
 * **se decide mirando**, así que lo que se comprueba no es su valor sino la
 * banda que lo contiene — que acepta los dos vecinos anotados y rechaza los dos
 * extremos.
 *
 * Y acá va también la pregunta que el sprint dejó abierta: **si agrandar la mota
 * mueve el instante en que la última deja de ser legible**, o sea el margen
 * contra las de la escena. La respuesta está medida en §2, y no es la esperada.
 *
 * El reparto que la perilla produce se mide en
 * `introParticleReading.invariant.ts`.
 */

const T = HOME_INTRO_TIMELINE
const WIN = introParticleWindows(T)

// ── 1 · La banda ────────────────────────────────────────────────────────────

section('1 · 🔴 `INTRO_DUST_SCALE` es una banda, no un valor: se decide mirando')

/**
 * 🔴 Misma clase que `PARTICLE_HANDOFF_FRAC` y que `placeS`: la juzga el humano por
 * grabación, así que la comprobación **no puede fijar su valor**. Acepta los dos
 * vecinos anotados y rechaza los dos extremos.
 *
 * Las dos cotas de la banda salen de números que ya existen:
 *
 *  · **Abajo** — la MEDIANA del polvo tiene que llegar al punto del clásico. Por
 *    debajo de eso, la mitad del campo queda en el régimen de "dos o tres
 *    píxeles" que el humano describió como grano.
 *  · **Arriba** — el recorte de la regla de las dos escalas tiene que quedarse
 *    por debajo del 2% del campo dibujado. Al agrandar la mota, el borde entre
 *    las dos escalas se aleja y deja afuera a las más cercanas: pasado ese punto
 *    la escala grande se está comiendo el campo en vez de agrandarlo.
 */
/**
 * Cuántas motas de polvo caerían en cuadro **sin recorte alguno**. Es el
 * denominador honesto: el recorte de las dos escalas se mide contra el campo que
 * está en cuadro, no contra el buffer entero —del que la mayoría cae afuera de
 * la pantalla por razones que no tienen nada que ver con la escala—. Con un
 * tamaño de mundo ínfimo el borde entre las dos escalas se va a cero y no deja
 * afuera a nadie; las posiciones no dependen del tamaño, así que el conteo es el
 * mismo campo.
 */
const UNCLIPPED_DUST = buildIntroParticles(
  1440,
  810,
  PARTICLE_SIZE * 0.01
).dustCount
/** Cuántas se dibujan del buffer, para poder decir de cuántas se está hablando. */
const DRAWN_DUST = DUST_SHELLS.slice(0, -1).reduce((sum, _, shell) => {
  const from = Math.round(DUST_SHELLS[shell] * PARTICLES_MAX)
  const to = Math.round(DUST_SHELLS[shell + 1] * PARTICLES_MAX)
  return sum + Math.round((to - from) * INTRO_DUST_SHARE)
}, 0)
const scaleReport = (scale: number) => {
  const field = buildIntroParticles(1440, 810, PARTICLE_SIZE * scale)
  const dust = dustSizes(field.motes)
  return {
    median: quantile(dust, 0.5),
    p10: quantile(dust, 0.1),
    p25: quantile(dust, 0.25),
    clipped: (UNCLIPPED_DUST - field.dustCount) / UNCLIPPED_DUST,
  }
}
const inBand = (scale: number) => {
  const it = scaleReport(scale)
  return it.median >= classicDotPx(810) && it.clipped < 0.02
}

/**
 * 🔴 Control positivo del instrumento del recorte: tiene que ver DESAPARECER
 * motas al subir la escala. Si el denominador estuviera mal —o si el recorte no
 * dependiera de la escala— la cota de arriba de la banda sería verde por vacío.
 */
check(
  'control positivo — el instrumento del recorte ve desaparecer motas al agrandar',
  UNCLIPPED_DUST > after(1440, 810).dustCount &&
    scaleReport(4).clipped > 10 * scaleReport(INTRO_DUST_SCALE).clipped,
  `${DRAWN_DUST} de polvo dibujadas de ${PARTICLES_MAX} · ${UNCLIPPED_DUST} en cuadro sin recorte · ${after(1440, 810).dustCount} con el default · ${scaleReport(4).clipped > 0 ? (scaleReport(4).clipped * 100).toFixed(1) : 0}% con escala 4`
)
check(
  'el default cae en la banda',
  inBand(INTRO_DUST_SCALE),
  `${INTRO_DUST_SCALE} → mediana ${scaleReport(INTRO_DUST_SCALE).median.toFixed(2)} px contra ${classicDotPx(810).toFixed(2)} del clásico · p10 ${scaleReport(INTRO_DUST_SCALE).p10.toFixed(2)} · recorte ${(scaleReport(INTRO_DUST_SCALE).clipped * 100).toFixed(2)}%`
)
check(
  'y los dos vecinos anotados también',
  inBand(1.35) && inBand(2.4),
  `1,35 → mediana ${scaleReport(1.35).median.toFixed(2)} px, recorte ${(scaleReport(1.35).clipped * 100).toFixed(2)}% · 2,4 → mediana ${scaleReport(2.4).median.toFixed(2)} px, p25 ${scaleReport(2.4).p25.toFixed(2)}, recorte ${(scaleReport(2.4).clipped * 100).toFixed(2)}%`
)
/**
 * 🔴 El control negativo de abajo **es el estado del que este sprint viene**:
 * el reparto de S13 no llega a la escala de lectura del clásico. No es un valor
 * inventado para que falle — es el que estaba embarcado y el que el humano juzgó
 * como grano.
 */
check(
  'control negativo — el reparto de S13 no llega a la escala del clásico',
  !inBand(1),
  `1,0 → mediana ${scaleReport(1).median.toFixed(2)} px contra ${classicDotPx(810).toFixed(2)}: la mitad del campo por debajo del punto del clásico`
)
check(
  'control negativo — y con 3,0 la regla de las dos escalas se come el campo',
  !inBand(3),
  `3,0 → mediana ${scaleReport(3).median.toFixed(2)} px pero recorte ${(scaleReport(3).clipped * 100).toFixed(2)}%, contra el 2% de la banda · con la escala de S13 el recorte era ${(scaleReport(1).clipped * 100).toFixed(2)}%`
)
check(
  'la banda es monótona en la perilla, así que rechaza por el lado que dice',
  scaleReport(1).median < scaleReport(1.35).median &&
    scaleReport(1.35).median < scaleReport(2.4).median &&
    scaleReport(1).clipped < scaleReport(2.4).clipped &&
    scaleReport(2.4).clipped < scaleReport(3).clipped,
  `mediana ${scaleReport(1).median.toFixed(2)} < ${scaleReport(1.35).median.toFixed(2)} < ${scaleReport(2.4).median.toFixed(2)} · recorte ${(scaleReport(1).clipped * 100).toFixed(2)}% < ${(scaleReport(2.4).clipped * 100).toFixed(2)}% < ${(scaleReport(3).clipped * 100).toFixed(2)}%`
)

// ── 2 · 🔴 El tamaño NO mueve el instante en que deja de ser legible ────────

section('2 · 🔴 Qué mueve el margen, y qué no: la escala no, la población sí')

/**
 * 🔴 **El sprint pide recalcular el margen porque "una mota más grande es
 * legible más tiempo". Medido, eso NO es cierto para esta forma y esta salida**,
 * y conviene decir por qué antes de dar el número.
 *
 * El criterio de legibilidad del repo es la razón de contraste de WCAG, que es
 * **ciega al tamaño**; y aunque no lo fuera, la alfa de la caída multiplica a la
 * mota entera por igual y el sprite del polvo es opaco adentro del 75% de su
 * radio. O sea: cuando el pico de la mota cruza el umbral, lo cruza TODA la
 * mota a la vez, mida 2 px o 15. Una mota más grande pone más tinta por encima
 * del umbral en cada instante —eso sí es cierto y es lo que el sprint busca—
 * pero no lo cruza más tarde.
 *
 * Lo que sí mueve el instante es **la población**: menos motas es menos chances
 * de que alguna combine el color más oscuro con la fase más tardía. Y eso solo
 * puede correr el instante hacia ADELANTE, o sea agrandar el margen.
 */
const lastLegibleWith = (scale: number, share: number) =>
  introLegibility(
    T,
    WIN,
    buildIntroParticles(1440, 810, PARTICLE_SIZE * scale, share).motes
  ).lastLegibleS

const s13Last = lastLegibleWith(1, S13_DUST_SHARE)
const scaledLast = lastLegibleWith(INTRO_DUST_SCALE, S13_DUST_SHARE)
const thinnedLast = lastLegibleWith(1, INTRO_DUST_SHARE)
const bothLast = lastLegibleWith(INTRO_DUST_SCALE, INTRO_DUST_SHARE)

check(
  '🔴 con la misma población, la escala NO mueve el instante ni un microsegundo',
  scaledLast === s13Last,
  `escala 1,0 → ${s(s13Last)} · escala ${INTRO_DUST_SCALE} → ${s(scaledLast)} — el mismo número, ${Math.abs(scaledLast - s13Last).toExponential(1)} s de diferencia`
)
/** Control positivo: el instrumento SÍ ve moverse el instante cuando algo lo mueve. */
check(
  'control positivo — y sí lo mueve ralear, que es lo que cambia la población',
  thinnedLast !== s13Last && thinnedLast < s13Last,
  `${s13Last.toFixed(4)}s con ${S13_DUST_SHARE} de reparto → ${thinnedLast.toFixed(4)}s con ${INTRO_DUST_SHARE} · ${((s13Last - thinnedLast) * 1000).toFixed(1)} ms ANTES`
)
check(
  'y el campo de S14 hereda exactamente ese instante, no otro',
  bothLast === thinnedLast,
  `${bothLast.toFixed(4)}s · el margen contra la escena solo puede CRECER, nunca achicarse`
)

/**
 * Y el sentido en el que "más grande" sí es "más visible", medido: la tinta que
 * la mota pone por encima del umbral de contraste escala con el área, así que a
 * cada instante hay más de ella. Lo que no cambia es CUÁNDO deja de haberla.
 */
const inkAt = (scale: number, share: number) => {
  const field = buildIntroParticles(1440, 810, PARTICLE_SIZE * scale, share)
  return inkCoverage(
    field.motes.filter((mote) => isReadable(T, mote, 810)),
    1440,
    810
  )
}
check(
  'más grande sí es más visible: la tinta que pasa el umbral crece con el área',
  inkAt(INTRO_DUST_SCALE, INTRO_DUST_SHARE) > inkAt(1, S13_DUST_SHARE),
  `${(inkAt(1, S13_DUST_SHARE) * 100).toFixed(2)}% → ${(inkAt(INTRO_DUST_SCALE, INTRO_DUST_SHARE) * 100).toFixed(2)}% del cuadro en motas que se leen`
)

// ── 3 · Lo que la escala NO tocó ────────────────────────────────────────────

section('3 · El tamaño del polvo es lo único que se movió')

check(
  'la escala entra donde tiene que entrar: el tamaño de mundo del polvo',
  near(INTRO_DUST_SIZE, PARTICLE_SIZE * INTRO_DUST_SCALE, 1e-12) &&
    INTRO_DUST_SIZE > PARTICLE_SIZE,
  `${PARTICLE_SIZE} × ${INTRO_DUST_SCALE} = ${INTRO_DUST_SIZE.toFixed(4)} contra los ${PARTICLE_SIZE} de la escena`
)
const colorsBefore = new Set(before(1440, 810).motes.map((mote) => mote.color))
const colorsAfter = new Set(after(1440, 810).motes.map((mote) => mote.color))
const alphasBefore = new Set(before(1440, 810).motes.map((mote) => mote.materialAlpha))
const alphasAfter = new Set(after(1440, 810).motes.map((mote) => mote.materialAlpha))
check(
  'el color no depende del tamaño: sale del radio, y todos siguen siendo los de S13',
  [...colorsAfter].every((color) => colorsBefore.has(color)),
  `${colorsAfter.size} colores en el campo nuevo, los ${colorsBefore.size} de S13 los contienen`
)
check(
  'y la opacidad del material tampoco: son las dos del componente de la escena',
  alphasAfter.size === alphasBefore.size &&
    [...alphasAfter].every((alpha) => alphasBefore.has(alpha)),
  `${[...alphasAfter].sort((a, b) => a - b).join(' y ')}`
)

report('introParticleScale')
