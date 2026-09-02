/**
 * INVARIANTE — EL RELEVO: los dos números remedidos con la ESCENA REAL detrás.
 *
 * Corre con `npm run test:s8-relevo`.
 *
 * ── Por qué se remiden ────────────────────────────────────────────────────
 *
 * Los dos se midieron cuando `/v3` no montaba la escena: detrás del velo del
 * intro no había nada. Ahora hay una sala, y las dos preguntas cambian de
 * sujeto. **El escalón** (§7.11) se corrigió a 0,39 puntos sRGB mirando la
 * tinta del intro, su única superficie iluminada; con la sala detrás la
 * superficie es el CUADRO. **El margen** (§1.4) tenía 112,4 ms contra una
 * primera mota de la escena construida a mano, con un color crudo sobre un
 * papel calculado; ahora la población es la de verdad.
 *
 * `UMBRAL_DE_LEGIBILIDAD` del contrato es **1,10**, el mismo de S8d/S13/S14: un
 * número remedido con otra vara no refuta ni confirma nada, así que se afirma
 * que el umbral es el que usa el instrumento existente antes de usarlo.
 */

import { celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'
import { sampleFrame } from '@/app/probe-escena/__tests__/frameProbe'
import { shadeSurface } from '@/app/probe-escena/__tests__/shading'
import { buildIntroParticles } from '@/components/layout/home-intro/introParticleField'
import { introParticleWindows } from '@/components/layout/home-intro/introParticleTiming'
import { LEGIBLE, crossingS, introLegibility, sceneContrastAt } from '@/components/layout/home-intro/introLegibilityProbe'
import { contrastRatio } from '@/components/layout/home-intro/introShading'
import { HOME_INTRO_TIMELINE } from '@/components/layout/home-intro/introTimeline'

import { MEDIDO_CONTRA_EL_MARCADOR, UMBRAL_DE_LEGIBILIDAD } from '../contrato'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { CARAS_DEL_LOGO, SIN_NIEBLA, conContraluz, sinContraluz } from './luz'
import { CELOSIA_BAR, ESCENA_COMPLETA, ESCENA_SIN_CELOSIA_EN_EL_CIELO, INK_COLOR, INTRO_SKY_FACTOR, PAPER_COLOR, VISTA_A_MANO, VISTA_DEL_HERO, goboSobreLaTinta, parDeLaLineaDeBase, paresDeLaEscena, profundidadDelLogo } from './relevo'

const ms = (s: number) => `${(s * 1000).toFixed(1)} ms`
const T = HOME_INTRO_TIMELINE

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL INSTRUMENTO, ANTES QUE EL NÚMERO')

/** Los cuatro del papel de S11: si no salen, nada de lo que sigue vale. */
const papelS11 = ([[1, 1], [1, INTRO_SKY_FACTOR], [0, 1], [0, INTRO_SKY_FACTOR]] as const).map(
  ([gobo, sky]) => shadeSurface(PAPER_COLOR, [0, 1, 0], VISTA_DEL_HERO, 19, gobo, sky),
)
afirmar(
  [249.4, 248.3, 236.9, 218.7].every((e, i) => Math.abs(papelS11[i] - e) < 0.1),
  'el sombreador reproduce los cuatro números del papel que S11 publicó',
  papelS11.map((v) => v.toFixed(1)).join(' · '),
)

/** Y la pose: la línea de base la escribió a mano; acá sale del track. */
afirmarIgual(VISTA_DEL_HERO, VISTA_A_MANO, 'la vista de la pose de entrada sale del track y coincide con la que se usó a mano')
afirmar(
  Math.abs(profundidadDelLogo() - 20.05) < 0.01,
  '  y el logo está a esa distancia de la cámara',
  `${profundidadDelLogo().toFixed(3)} · la niebla arranca en ${SIN_NIEBLA}`,
)

/**
 * 🔴 **El rig del intro, reconstruido sin reescribirlo** (ver `luz.ts`). La
 * prueba de que funciona es que reproduce los tres números que §7.11 publica.
 */
const S711: Readonly<Record<string, readonly [number, number]>> = {
  'cara frontal': [1.68, 1.28],
  'canto superior': [1.34, 1.01],
  'canto inferior': [0.7, 0.44],
}
for (const [cara, normal] of CARAS_DEL_LOGO) {
  const abierto = sinContraluz(INK_COLOR, normal, 1)
  const conCelosia = sinContraluz(INK_COLOR, normal, INTRO_SKY_FACTOR)
  const esperado = S711[cara]
  if (esperado) {
    afirmar(
      Math.abs(abierto.valor - esperado[0]) < 0.005 && Math.abs(conCelosia.valor - esperado[1]) < 0.005,
      `${cara} — reproduce §7.11: ${esperado[0]} → ${esperado[1]}`,
      `${abierto.valor.toFixed(4)} → ${conCelosia.valor.toFixed(4)} · escalón ${(abierto.valor - conCelosia.valor).toFixed(4)}`,
    )
  }
  afirmar(
    abierto.meseta > abierto.muestras / 3,
    `  ${cara} — el mínimo es una MESETA: el contraluz está clampeado en cero`,
    `${abierto.meseta} de ${abierto.muestras} combinaciones dan el mismo valor al bit`,
  )
}

controlPositivo(
  'el MISMO barrido CON el contraluz puesto no reproduce §7.11 en el canto superior',
  { cameraAzimuthDeg: 0, cameraHeight: 6.4 },
  (v: { cameraAzimuthDeg: number; cameraHeight: number }) =>
    Math.abs(conContraluz(INK_COLOR, [0, 1, 0], 1, v) - 1.34) < 0.005,
)
controlPositivo(
  'y el barrido no está midiendo cero: con el cielo abierto da otro número',
  INTRO_SKY_FACTOR,
  (sky: number) => sinContraluz(INK_COLOR, [0, 0, 1], sky).valor === sinContraluz(INK_COLOR, [0, 0, 1], 1).valor,
)
afirmar(UMBRAL_DE_LEGIBILIDAD === LEGIBLE, 'el umbral del contrato es el del instrumento existente', `${LEGIBLE}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL ESCALÓN DE AMBIENTE AL CORTE ES CERO — por construcción')

/**
 * El intro termina en `HEMI_INTENSITY × celosiaSkyFactor(CELOSIA_BAR)` y la
 * escena arranca ahí mismo: **una constante compartida, no dos**. Y hay una
 * segunda razón, que sólo existe ahora que la escena está montada: durante todo
 * el fundido lo que se ve detrás YA ES la escena, con SU ambiente — el intro
 * nunca renderiza la sala, así que no hay un cuadro donde la sala cambie.
 */
afirmar(
  INTRO_SKY_FACTOR === celosiaSkyFactor(CELOSIA_BAR),
  'el factor de cielo del intro ES el de la escena, no una copia',
  `${INTRO_SKY_FACTOR.toFixed(4)}`,
)
controlPositivo(
  'con la celosía abierta el factor vuelve a 1, que es el estado del que §7.11 hablaba',
  0,
  (bar: number) => celosiaSkyFactor(bar) === INTRO_SKY_FACTOR,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · 🔴 CUÁNTO VALDRÍA ESE ESCALÓN CON LA SALA DETRÁS — el número nuevo')

const cuadro = sampleFrame(0, VISTA_DEL_HERO, ESCENA_COMPLETA, 320, 180)
const cieloAbierto = sampleFrame(0, VISTA_DEL_HERO, ESCENA_SIN_CELOSIA_EN_EL_CIELO, 320, 180)
const escalonEnElCuadro = cieloAbierto.mean - cuadro.mean

console.log(`  media del cuadro con cielo ABIERTO: ${cieloAbierto.mean.toFixed(2)}`)
console.log(`  media del cuadro con la celosía   : ${cuadro.mean.toFixed(2)}`)
console.log(`  escalón EN EL CUADRO              : ${escalonEnElCuadro.toFixed(2)} puntos sRGB de 255`)
console.log(`  contra los ${MEDIDO_CONTRA_EL_MARCADOR.escalonDeExposicionPuntos} que §7.11 mide sobre la tinta sola: ×${(escalonEnElCuadro / MEDIDO_CONTRA_EL_MARCADOR.escalonDeExposicionPuntos).toFixed(1)}`)

afirmar(cuadro.mean > 0 && cieloAbierto.mean > 0, `el cuadro se muestreó: ${(cuadro.ink * 100).toFixed(2)}% de tinta · ${(cuadro.floor * 100).toFixed(1)}% de piso`)
afirmar(
  escalonEnElCuadro > MEDIDO_CONTRA_EL_MARCADOR.escalonDeExposicionPuntos,
  '🔴 con la sala detrás el escalón es MUCHO más grande que los 0,39 de la tinta sola',
  `${escalonEnElCuadro.toFixed(2)} puntos · §7.11 corrigió los −15 del cuadro por 0,39 mirando sólo el logo, y eso deja de valer cuando hay sala`,
)
afirmar(escalonEnElCuadro < 15, '  y aun así es menor que los −15 que §7.11 declaraba: la corrección apuntaba bien, no tanto')
controlPositivo(
  'el medidor no inventa un escalón donde no lo hay: mismo cielo en las dos ramas da cero',
  ESCENA_COMPLETA,
  (v: typeof ESCENA_COMPLETA) =>
    sampleFrame(0, VISTA_DEL_HERO, v, 60, 34).mean !== sampleFrame(0, VISTA_DEL_HERO, ESCENA_COMPLETA, 60, 34).mean,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · 🔴 EL ESCALÓN QUE SÍ SOBREVIVE AL CORTE — y no es el que estaba anotado')

/**
 * En el traspaso el logo del intro —su propio canvas, su propio rig— desaparece
 * y queda el de la escena, en los mismos píxeles. Las tres diferencias entre
 * los dos rigs se miden por separado, encendiendo un parámetro por vez.
 */
const gobo = goboSobreLaTinta()
const profundidad = profundidadDelLogo()
const FRENTE = [0, 0, 1] as const

const soloIntro = sinContraluz(INK_COLOR, FRENTE, INTRO_SKY_FACTOR).valor
const masRim = conContraluz(INK_COLOR, FRENTE, INTRO_SKY_FACTOR, VISTA_DEL_HERO)
const masGobo = conContraluz(INK_COLOR, FRENTE, INTRO_SKY_FACTOR, VISTA_DEL_HERO, gobo.medio)
const masNiebla = shadeSurface(INK_COLOR, FRENTE, VISTA_DEL_HERO, profundidad, gobo.medio, INTRO_SKY_FACTOR)

console.log(`  la celosía deja pasar ${(gobo.medio * 100).toFixed(1)}% del sol sobre la tinta (${gobo.muestras} muestras, mín ${gobo.minimo.toFixed(2)} máx ${gobo.maximo.toFixed(2)})`)
console.log(`  cara frontal · intro ${soloIntro.toFixed(4)}`)
console.log(`               + contraluz ${masRim.toFixed(4)}  (${(masRim - soloIntro).toFixed(4)})`)
console.log(`               + celosía   ${masGobo.toFixed(4)}  (${(masGobo - masRim).toFixed(4)})`)
console.log(`               + niebla    ${masNiebla.toFixed(4)}  (${(masNiebla - masGobo).toFixed(4)})`)
for (const [cara, normal] of CARAS_DEL_LOGO) {
  const intro = sinContraluz(INK_COLOR, normal, INTRO_SKY_FACTOR).valor
  const escena = shadeSurface(INK_COLOR, normal, VISTA_DEL_HERO, profundidad, gobo.medio, INTRO_SKY_FACTOR)
  console.log(`  ${cara.padEnd(16)} intro ${intro.toFixed(4)} · escena ${escena.toFixed(4)} · paso ${(escena - intro).toFixed(4)}`)
}

/**
 * ⚠️ **LA DIFERENCIA ANOTADA NO ES LA QUE EXISTE.** `IntroSceneLights.tsx` deja
 * escrito que al intro le falta el CONTRALUZ, «la diferencia conocida entre el
 * logo que aterriza y el que la escena va a mostrar». En la pose de entrada esa
 * diferencia vale **cero exacto**: el rim está a 148° del azimut de cámara, o
 * sea detrás, y `max(0, n · rim)` lo apaga sobre la cara frontal.
 *
 * La que existe —y que nadie anotó— es **la celosía**: en la escena el logo
 * recibe el patrón de las rendijas y en el intro no.
 */
afirmar(masRim === soloIntro, 'el contraluz —la diferencia ANOTADA— aporta CERO en la pose de entrada')

afirmar(
  Math.abs(masNiebla - masGobo) < 0.01,
  '  y la niebla tampoco: el logo está justo en su borde',
  `${(masNiebla - masGobo).toFixed(4)} puntos a ${profundidad.toFixed(2)} de distancia`,
)
const pasoDelLogo = Math.abs(masNiebla - soloIntro)
afirmar(
  pasoDelLogo > 0.5,
  '🔴 la que existe es LA CELOSÍA, y no estaba anotada en ningún lado',
  `${pasoDelLogo.toFixed(4)} puntos sRGB sobre la cara frontal — más que los 0,39 que §7.11 corrigió`,
)
afirmar(pasoDelLogo < 1, '  y aun así no llega a UN byte: en pantalla ni siquiera puede cambiar de valor entero')
const enLaMedia = pasoDelLogo * cuadro.ink
afirmar(
  enLaMedia < 0.1,
  '  y pesado por la tinta en cuadro, no mueve la media',
  `${(cuadro.ink * 100).toFixed(2)}% del cuadro × ${pasoDelLogo.toFixed(3)} = ${enLaMedia.toFixed(3)} puntos`,
)
controlPositivo(
  'el diferenciador da cero cuando los dos lados son el mismo rig',
  INTRO_SKY_FACTOR,
  (sky: number) => sinContraluz(INK_COLOR, FRENTE, sky).valor !== soloIntro,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · 🔴 EL MARGEN DE LAS PARTÍCULAS, REMEDIDO CON LA POBLACIÓN REAL')

const WIN = introParticleWindows(T)
const CAMPO = buildIntroParticles(1440, 810)
const { everLegible, peakContrast, lastLegibleS } = introLegibility(T, WIN, CAMPO.motes)

afirmar(
  everLegible === CAMPO.motes.length && peakContrast > 2,
  'control positivo — las del intro SÍ son legibles mientras tienen que serlo',
  `las ${everLegible} cruzan el umbral · contraste máximo ${peakContrast.toFixed(2)}:1`,
)
/**
 * 🔴 **V3-A: ESTA AFIRMACIÓN CAMBIÓ DE FORMA, Y LA CIFRA VIEJA QUEDA AL LADO.**
 * Exigía el MISMO instante que la línea de base, y era correcto mientras el
 * mecanismo fuera el mismo. Con el acomodamiento la mota llega entera y recién
 * después se releva (`PARTICLE_HANDOFF_FRAC`), así que el instante se corre y
 * **tiene que correrse**. Lo que sigue siendo propiedad es que caiga adentro de
 * su ventana, antes de que el fondo empiece a disolverse — regla 15.
 */
afirmar(
  lastLegibleS > WIN.outStartS && lastLegibleS <= WIN.outEndS + 1e-9,
  'la última del intro deja de ser legible adentro de su ventana, sin derramarse',
  `${lastLegibleS.toFixed(4)} s contra el cierre en ${ms(WIN.outEndS)} · línea de base ${MEDIDO_CONTRA_EL_MARCADOR.ultimaDelIntroS} con la caída de S13, +${(1000 * (lastLegibleS - MEDIDO_CONTRA_EL_MARCADOR.ultimaDelIntroS)).toFixed(1)} ms`,
)

const primeraDe = (par: { mota: readonly [number, number, number]; fondo: readonly [number, number, number] }) =>
  crossingS((t) => sceneContrastAt(T, par.mota, par.fondo, t), T.veilOutStartS, T.veilOutEndS, false)

const base = parDeLaLineaDeBase()
const primeraDeLaBase = primeraDe(base)
afirmar(
  Math.abs(primeraDeLaBase - MEDIDO_CONTRA_EL_MARCADOR.primeraDeLaEscenaS) < 0.001,
  'y el par de la LÍNEA DE BASE reproduce sus 4,278 s: los dos números son comparables',
  `${primeraDeLaBase.toFixed(4)} s · contraste pleno ${contrastRatio(base.mota, base.fondo).toFixed(3)}:1`,
)

const pares = paresDeLaEscena(cuadro.mean)
let primeraDeLaEscena = Infinity
let elPar = ''
for (const par of pares) {
  const cruce = primeraDe(par)
  const cuando = Number.isFinite(cruce) ? `${cruce.toFixed(4)} s` : 'nunca cruza'
  console.log(`  ${par.nombre.padEnd(40)} ${contrastRatio(par.mota, par.fondo).toFixed(3)}:1 · ${cuando}`)
  if (Number.isFinite(cruce) && cruce < primeraDeLaEscena) {
    primeraDeLaEscena = cruce
    elPar = par.nombre
  }
}
afirmar(
  Number.isFinite(primeraDeLaEscena),
  'control positivo — alguna de la escena SÍ se vuelve legible al irse el velo',
  `la primera es «${elPar}» a los ${primeraDeLaEscena.toFixed(4)} s`,
)
afirmar(pares.some((p) => !Number.isFinite(primeraDe(p))), '  y otras NO cruzan nunca: el instrumento distingue, no dice que sí a todo')

const margen = primeraDeLaEscena - lastLegibleS
console.log('')
console.log(`  última del intro    ${lastLegibleS.toFixed(4)} s   (línea de base ${MEDIDO_CONTRA_EL_MARCADOR.ultimaDelIntroS})`)
console.log(`  primera de la escena ${primeraDeLaEscena.toFixed(4)} s   (línea de base ${MEDIDO_CONTRA_EL_MARCADOR.primeraDeLaEscenaS})`)
console.log(`  MARGEN               ${ms(margen)}      (línea de base ${MEDIDO_CONTRA_EL_MARCADOR.margenMs} ms)`)
console.log(`  la escena se vuelve legible ${ms(primeraDeLaEscena - T.veilOutStartS)} después de que el velo arranca`)

afirmar(
  lastLegibleS < primeraDeLaEscena,
  '🔴 LAS DOS POBLACIONES NO SE SOLAPAN — la del intro se va antes de que la escena se lea',
  `${ms(margen)} de margen, contra ${MEDIDO_CONTRA_EL_MARCADOR.margenMs} ms de la línea de base (${((margen * 1000 - MEDIDO_CONTRA_EL_MARCADOR.margenMs) >= 0 ? '+' : '')}${(margen * 1000 - MEDIDO_CONTRA_EL_MARCADOR.margenMs).toFixed(1)} ms)`,
)

/**
 * 🔴 **EL PISO ESTRUCTURAL.** Hasta `veilOutStartS` el velo está en opacidad 1 y
 * el contraste de CUALQUIER par de la escena vale exactamente 1: nada de lo que
 * haya detrás puede leerse antes. El margen no puede bajar de la distancia
 * entre la última del intro y el arranque del velo, pase lo que pase.
 */
const piso = T.veilOutStartS - lastLegibleS
afirmar(pares.every((p) => sceneContrastAt(T, p.mota, p.fondo, T.veilOutStartS) === 1), 'antes de que el velo arranque, NINGÚN par de la escena aporta contraste: es exactamente 1')
afirmar(
  piso > 0,
  '  y por eso el margen tiene un piso que no depende de la escena',
  `${ms(piso)} — el margen medido son ${ms(margen)}`,
)

const conDerrame = lastLegibleS + (T.veilOutEndS - T.veilOutStartS) * 0.5
afirmar(
  conDerrame > primeraDeLaEscena,
  'control negativo — si la salida se derramara adentro del velo, se solaparían',
  `saldría a ${conDerrame.toFixed(4)} s, ${ms(conDerrame - primeraDeLaEscena)} DESPUÉS de que la escena ya se lee`,
)

cerrar('s8-relevo.invariant')
