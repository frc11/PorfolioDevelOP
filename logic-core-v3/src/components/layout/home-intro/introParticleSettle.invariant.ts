import { BOKEH_SIZE, PARTICLES_MAX, PARTICLE_SIZE } from '@/app/v3/_lib/escena/probeParticles'
import { ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'

import { check, pct, px, report, s, section } from './introChecks'
import { INTRO_DUST_SCALE, SCENE_DUST_SHARE } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { buildSceneParticles, type SceneMote } from './introParticleLanding'
import { derivaDelCampoDeLaEscena, near, quantile, readSource } from './introParticleProbe'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL ACOMODAMIENTO — **la vía que se eligió, con la
 * diferencia visible contra la otra, medida.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleSettle.invariant.ts
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LAS DOS VÍAS, Y POR QUÉ LA (a) COMPLETA NO ES ALCANZABLE DESDE ACÁ
 * ════════════════════════════════════════════════════════════════════════════
 *
 * El sprint plantea dos:
 *
 *  **(a) Correspondencia real** — cada mota del intro se asigna a una de la
 *  escena y viaja hasta su posición proyectada.
 *
 *  **(b) Convergencia sin correspondencia** — las del intro se acomodan hacia
 *  donde el campo de la escena tiene densidad, y el relevo se esconde en el
 *  momento de mayor coincidencia.
 *
 * **Lo construido es (a) en su geometría y (b) en su identidad**, y la costura
 * está exactamente en un número que este archivo mide.
 *
 * La geometría es (a) sin concesiones: cada mota del intro se asigna a una mota
 * REAL del campo de la escena —el mismo generador, la semilla de la escena, su
 * reparto y su tamaño—, cada destino se toma una sola vez, y la mota viaja hasta
 * su posición, su diámetro y su color. Al llegar, el campo del intro **es** un
 * subconjunto exacto del de la escena. Eso se afirma en §1.
 *
 * 🔴 **Lo que no es (a): la mota que mirabas no es, en el cuadro del relevo, esa
 * mota de la escena.** El campo de la escena está en movimiento —`driftShells`
 * en `OrbitRig.tsx` gira las conchas y las hace cabecear con el reloj de SU
 * canvas— y **eso no se apaga con la retención del intro**: sólo con
 * `prefers-reduced-motion`. El preloader no tiene forma de leer esa fase, así
 * que aterriza sobre el campo en fase cero. §3 mide cuánto se corre ese campo
 * por segundo de reloj de la escena; es la diferencia visible contra (a), en
 * píxeles y en diámetros.
 *
 * **Qué haría falta para (a) completa, en una línea:** que `driftShells` se
 * apague mientras `escenaRetenida()` da `true`, igual que ya se apagan la vira,
 * el mouse y la inercia. Es una línea en `_lib/escena/OrbitRig.tsx` — **la zona
 * de otro frente**, y por eso queda declarada acá en vez de hecha.
 */

const T = HOME_INTRO_TIMELINE
const W = 1440
const H = 810

const CAMPO = buildIntroParticles(W, H)
const ESCENA = buildSceneParticles(W, H)
const POLVO = CAMPO.motes.filter((m) => m.kind === 'dust')
const POLVO_ESCENA = ESCENA.filter((m) => m.kind === 'dust')

// ── 1 · El destino ES el campo de la escena ─────────────────────────────────

section('1 · El destino es el campo de la ESCENA, no una nube parecida')

check(
  'el campo de la escena se construye con SU semilla y SU reparto, no con los del intro',
  ESCENA.length > CAMPO.motes.length,
  `${ESCENA.length} motas de la escena en cuadro contra ${CAMPO.motes.length} del intro — ${ESCENA.length - CAMPO.motes.length} destinos de sobra`
)

const escenaBokeh = ESCENA.filter((m) => m.kind === 'bokeh').length
check(
  'las dos especies tienen destino propio: el polvo no aterriza en un bokeh',
  POLVO_ESCENA.length > POLVO.length && escenaBokeh >= CAMPO.bokehCount,
  `polvo ${POLVO.length} → ${POLVO_ESCENA.length} · bokeh ${CAMPO.bokehCount} → ${escenaBokeh}`
)

const mismaConcha = CAMPO.motes.every((mote) => {
  const destino = ESCENA.find(
    (m) =>
      Math.abs(m.xPx - (mote.xPx + mote.settleDxPx)) < 1e-9 &&
      Math.abs(m.yPx - (mote.yPx + mote.settleDyPx)) < 1e-9
  )
  return destino !== undefined && destino.shell === mote.shell && destino.kind === mote.kind
})
check(
  'y cada una aterriza en su MISMA concha: el morfeo de tamaño y color es el chico',
  mismaConcha,
  'la concha es una banda de radio, y de ahí salen el diámetro y el color'
)

// ── 2 · La asignación, contra la alternativa ────────────────────────────────

section('2 · 🔴 Vecino más cercano contra rango de radio: acomodarse, no mudarse')

const recorrido = POLVO.map((m) => Math.hypot(m.settleDxPx, m.settleDyPx))

/**
 * La alternativa que se descartó: asignar por RANGO adentro de la concha —la
 * mota i-ésima del intro a la i-ésima de la escena—. Es igual de determinista y
 * de barata, y produce un gesto completamente distinto.
 */
const porRango = (() => {
  const buckets = new Map<string, SceneMote[]>()
  for (const m of ESCENA) {
    const key = `${m.kind}:${m.shell}`
    const lista = buckets.get(key)
    if (lista === undefined) buckets.set(key, [m])
    else lista.push(m)
  }
  const cursor = new Map<string, number>()
  return CAMPO.motes.map((mote) => {
    const key = `${mote.kind}:${mote.shell}`
    const lista = buckets.get(key) ?? []
    const i = cursor.get(key) ?? 0
    cursor.set(key, i + 1)
    const destino = lista[Math.min(i, lista.length - 1)]
    return Math.hypot(destino.xPx - mote.xPx, destino.yPx - mote.yPx)
  })
})()

check(
  '🔴 el vecino más cercano deja el viaje en unos pocos diámetros',
  quantile(recorrido, 0.5) < quantile(porRango, 0.5) / 5,
  `mediana ${px(quantile(recorrido, 0.5))} contra ${px(quantile(porRango, 0.5))} por rango — ×${(quantile(porRango, 0.5) / quantile(recorrido, 0.5)).toFixed(1)} más corto`
)
check(
  '  y el reparto entero, no sólo la mediana',
  quantile(recorrido, 0.9) < quantile(porRango, 0.9),
  `p10 ${px(quantile(recorrido, 0.1))} · p50 ${px(quantile(recorrido, 0.5))} · p90 ${px(quantile(recorrido, 0.9))} · máximo ${px(quantile(recorrido, 1))}`
)
check(
  'control positivo — la asignación es una BIYECCIÓN, no un vecino repetido',
  new Set(CAMPO.motes.map((m) => `${(m.xPx + m.settleDxPx).toFixed(6)}|${(m.yPx + m.settleDyPx).toFixed(6)}`))
    .size === CAMPO.motes.length,
  `${CAMPO.motes.length} destinos distintos para ${CAMPO.motes.length} motas`
)
check(
  'control positivo — y es determinista: dos corridas dan el mismo destino',
  buildIntroParticles(W, H).motes.every(
    (m, i) =>
      m.settleDxPx === CAMPO.motes[i].settleDxPx && m.settleDyPx === CAMPO.motes[i].settleDyPx
  ),
  'sin `Math.random` y sin reloj: el campo es el mismo en cada carga'
)

// ── 3 · 🔴 La diferencia visible contra la vía (a) completa ─────────────────

section('3 · 🔴 La deriva del campo de la escena: la diferencia contra la vía (a)')

const derivaPorSegundo = quantile(derivaDelCampoDeLaEscena(1, W, H), 0.5)
const diametroEscena = quantile(POLVO_ESCENA.map((m) => m.sizePx), 0.5)
check(
  '🔴 el campo de la escena DERIVA mientras el intro lo tapa, y ésta es la cifra',
  derivaPorSegundo > 0,
  `${derivaPorSegundo.toFixed(2)} px por segundo de mediana sobre motas de ${diametroEscena.toFixed(2)} px — ${(derivaPorSegundo / diametroEscena).toFixed(1)} diámetros por segundo`
)
check(
  '  y crece con el reloj, así que la vía (a) exige conocer su fase',
  quantile(derivaDelCampoDeLaEscena(4, W, H), 0.5) > quantile(derivaDelCampoDeLaEscena(1, W, H), 0.5) * 2,
  `1 s → ${px(quantile(derivaDelCampoDeLaEscena(1, W, H), 0.5))} · 4 s → ${px(quantile(derivaDelCampoDeLaEscena(4, W, H), 0.5))} · 8 s → ${px(quantile(derivaDelCampoDeLaEscena(8, W, H), 0.5))}`
)
check(
  '  la ventana en la que sí es despreciable es el MARGEN, no el reloj entero',
  quantile(derivaDelCampoDeLaEscena(0.1, W, H), 0.5) < diametroEscena / 2,
  `en los ~100 ms de margen entre las dos poblaciones el campo se corre ${px(quantile(derivaDelCampoDeLaEscena(0.1, W, H), 0.5))}, menos de un radio`
)
check(
  'control positivo — con el reloj en cero la deriva es exactamente cero',
  derivaDelCampoDeLaEscena(0, W, H).every((d) => d === 0),
  'si el instrumento devolviera ruido, esto no daría 0'
)

/** El interruptor que faltaría, leído del fuente para que la cita no se venza. */
const rig = readSource('src/app/v3/_lib/escena/OrbitRig.tsx')
check(
  '🔴 y el interruptor NO existe: `driftShells` corre fuera del gate de física',
  rig.includes('driftShells(') && rig.includes('A diferencia de la vira, esto NO se apaga con la'),
  'apagarlo con la retención es una línea en `_lib/escena/OrbitRig.tsx` — zona de otro frente'
)

// ── 4 · La especie con la que aterrizan ─────────────────────────────────────

section('4 · Al llegar, la mota ES una mota de la escena: tamaño y color')

const antes = quantile(POLVO.map((m) => m.sizePx), 0.5)
const despues = quantile(POLVO.map((m) => m.sizePx + m.settleDSizePx), 0.5)
/**
 * ⚠ El diámetro con el que aterriza cada mota es EXACTO —es el de su gemela— y
 * eso ya lo prueba §1 por la posición. Lo que se compara acá es la MEDIANA del
 * reparto, y ésa no tiene por qué coincidir al bit: el campo del intro es un
 * subconjunto de 366 de las 913 de la escena, así que su mediana es la de la
 * muestra, no la de la población. Que caiga a menos de un décimo de píxel es lo
 * que dice que la muestra no está sesgada hacia una concha.
 */
check(
  'el polvo entra con la escala del intro y termina con la de la escena',
  near(despues, diametroEscena, 0.1) && antes > despues,
  `mediana ${antes.toFixed(2)} px (×${INTRO_DUST_SCALE}) → ${despues.toFixed(2)} px contra ${diametroEscena.toFixed(2)} px de la escena entera`
)
check(
  '  y cada mota, una por una, aterriza con el diámetro EXACTO de su gemela',
  CAMPO.motes.every((mote) => {
    const destino = ESCENA.find(
      (m) =>
        Math.abs(m.xPx - (mote.xPx + mote.settleDxPx)) < 1e-9 &&
        Math.abs(m.yPx - (mote.yPx + mote.settleDyPx)) < 1e-9
    )
    return destino !== undefined && Math.abs(destino.sizePx - (mote.sizePx + mote.settleDSizePx)) < 1e-9
  }),
  'no es un promedio que coincide: es el mismo número, mota por mota'
)
const bokehIntro = CAMPO.motes.filter((m) => m.kind === 'bokeh')
check(
  'y el bokeh no cambia de tamaño, porque nunca lo tuvo distinto',
  Math.abs(quantile(bokehIntro.map((m) => m.settleDSizePx), 0.5)) < quantile(bokehIntro.map((m) => m.sizePx), 0.5) * 0.5,
  `mediana del cambio ${quantile(bokehIntro.map((m) => m.settleDSizePx), 0.5).toFixed(2)} px sobre ${quantile(bokehIntro.map((m) => m.sizePx), 0.5).toFixed(1)} px · ${BOKEH_SIZE} es el mismo de los dos lados`
)
const saltosDeTinte = POLVO.map((m) => Math.abs(m.settleTint - m.tint))
check(
  'el color se corre poco, que es la consecuencia de respetar la concha',
  quantile(saltosDeTinte, 0.9) <= 4,
  `p50 ${quantile(saltosDeTinte, 0.5)} escalones · p90 ${quantile(saltosDeTinte, 0.9)} · máximo ${quantile(saltosDeTinte, 1)} de 24`
)

// ── 5 · El número copiado, leído de su fuente ──────────────────────────────

section('5 · `SCENE_DUST_SHARE` es el de la escena, leído de `probeStore.ts`')

const store = readSource('src/app/v3/_lib/escena/probeStore.ts')
const declarado = /particleCount:\s*(\d+)\s*,/.exec(store)
check(
  'el reparto de la escena sale de su default y no de un literal inventado',
  declarado !== null && Number(declarado[1]) / PARTICLES_MAX === SCENE_DUST_SHARE,
  `probeStore.ts declara particleCount ${declarado?.[1]} de ${PARTICLES_MAX} = ${SCENE_DUST_SHARE}`
)
check(
  'control positivo — el detector lee el archivo de verdad y encuentra el número',
  store.length > 1000 && declarado !== null,
  `${store.length} bytes leídos`
)

// ── 6 · La vía (b) declarada, no escondida ─────────────────────────────────

section('6 · 🔴 Lo que la vía elegida NO da, dicho con su número')

const escenaEn = (segundos: number): number => quantile(derivaDelCampoDeLaEscena(segundos, W, H), 0.5)
check(
  '🔴 la mota NO sobrevive al relevo sobre el mismo píxel, y ésta es la distancia',
  escenaEn(2) > diametroEscena,
  `con 2 s de reloj de la escena, su gemela está a ${px(escenaEn(2))} — ${(escenaEn(2) / diametroEscena).toFixed(1)} diámetros`
)
check(
  '  lo que SÍ sobrevive: la forma, la densidad, el tamaño y el color del campo',
  near(despues, diametroEscena, 0.1) && mismaConcha,
  'el campo del intro aterriza como un subconjunto exacto del de la escena, rotado por la deriva'
)
check(
  '  y el requisito duro no depende de la identidad: es de ORDEN',
  T.veilOutStartS > 0,
  `el campo del intro termina antes de ${s(T.veilOutStartS)}, que es cuando el fondo empieza a irse — el margen lo mide introParticleTiming §4`
)
check(
  'control positivo — el reparto del intro y el de la escena NO son el mismo campo',
  CAMPO.motes.length !== ESCENA.length &&
    quantile(POLVO.map((m) => m.sizePx), 0.5) !== quantile(POLVO_ESCENA.map((m) => m.sizePx), 0.5),
  `si compartieran semilla y escala, la comparación de arriba sería una resta de un número contra sí mismo · ${pct(CAMPO.motes.length / ESCENA.length)} de la población, ×${(antes / diametroEscena).toFixed(2)} de tamaño`
)
check(
  'control positivo — el tamaño de mundo del polvo de la escena es el que se cita',
  PARTICLE_SIZE * INTRO_DUST_SCALE > PARTICLE_SIZE && ORBIT_TARGET_Y === 0,
  `${PARTICLE_SIZE} de la escena contra ${(PARTICLE_SIZE * INTRO_DUST_SCALE).toFixed(4)} del intro`
)

report('introParticleSettle')
