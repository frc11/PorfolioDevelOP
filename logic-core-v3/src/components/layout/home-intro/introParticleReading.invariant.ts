import { check, report, section } from './introChecks'
import { buildIntroParticles } from './introParticleField'
import { INTRO_DUST_SCALE, INTRO_DUST_SHARE, INTRO_DUST_SIZE, type IntroMote } from './introParticles'
import { near, quantile } from './introParticleProbe'
import {
  CLASSIC_READ,
  READABLE_CONTRAST,
  READING_WINDOWS,
  classicDotPx,
  classicPitchPx,
  dustSizes,
  fullDensityContrast,
  inkCoverage,
  introField as after,
  isReadable,
  meanPitchPx,
  S13_DUST_SHARE,
  S13_DUST_SIZE,
  s13Field as before,
} from './introReadingProbe'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DE LA LECTURA — **que se lean como pelotitas.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleReading.invariant.ts
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LA MISMA ESPECIE NO PRODUCE LA MISMA LECTURA SOBRE LOS DOS FONDOS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * S13 dejó el campo del intro copiando la MEZCLA de la escena, y con eso el
 * mecanismo funcionó: aparecen, bajan, no se ven dos poblaciones juntas. Lo que
 * no funcionó fue la lectura. En la escena ese polvo tiene paralaje, se mueve
 * con las conchas y cae sobre un piso con bandas — se lee como atmósfera. En el
 * intro está quieto, sobre papel blanco liso y sin nada más en el cuadro: ahí se
 * lee como ruido de sensor.
 *
 * Esta suite mide **el reparto de tamaños** y **cuántas motas se leen**, contra
 * la única referencia que el sprint nombra: el campo de puntos del preloader
 * clásico. `introReadingProbe.ts` lo mide leyendo su propio código.
 *
 * **La perilla que lo produce** —su banda, sus vecinos y qué mueve y qué no del
 * margen contra la escena— vive en `introParticleScale.invariant.ts`. Las otras
 * tres siguen midiendo lo suyo: la especie en `introParticles.invariant.ts`, la
 * caída en `introParticleField.invariant.ts`, el ritmo y el margen en
 * `introParticleTiming.invariant.ts`.
 */

const T = HOME_INTRO_TIMELINE
const WINDOWS = READING_WINDOWS

// ── 1 · La referencia de lectura, leída de su propio código ─────────────────

section('1 · El punto del preloader clásico, medido en `DotMatrix.tsx` y `Hero.tsx`')

/**
 * 🔴 **El control positivo va PRIMERO.** Si los `grep` no encontraran nada, cada
 * número saldría `NaN` y toda comparación contra el umbral sería `false` — o
 * sea, un umbral que nadie supera y un sprint que "no hizo nada". El instrumento
 * tiene que probar que leyó los dos archivos antes de que sus cifras valgan.
 */
check(
  'control positivo — los dos archivos del clásico se leyeron de verdad',
  Number.isFinite(CLASSIC_READ.dotRadiusWorld) &&
    Number.isFinite(CLASSIC_READ.spacingWorld) &&
    Number.isFinite(CLASSIC_READ.cameraDepth) &&
    Number.isFinite(CLASSIC_READ.cameraFovDeg),
  `${CLASSIC_READ.sourceBytes} bytes leídos · esfera r=${CLASSIC_READ.dotRadiusWorld} · paso ${CLASSIC_READ.spacingWorld} · cámara a ${CLASSIC_READ.cameraDepth} con fov ${CLASSIC_READ.cameraFovDeg}`
)
check(
  'el punto del clásico proyecta la escala de lectura que se toma de ahí',
  near(classicDotPx(810), 4.28, 0.02),
  `${classicDotPx(810).toFixed(2)} px en 1440×810 · ${classicDotPx(1080).toFixed(2)} en 1920×1080 · ${classicDotPx(844).toFixed(2)} en 390×844`
)
/**
 * El paso NO se copia —el sprint es explícito: la distribución sigue siendo la
 * del campo proyectado, no una grilla— pero sí se mide, porque es lo que dice
 * si el campo nuevo quedó ralo. El clásico muestra sus puntos con
 * `DOT_SPACING_SPARSE`, que es el paso que tiene cuando `progress` vale 0.
 */
check(
  'y su grilla, en el instante en que la muestra, tiene este paso',
  near(classicPitchPx(810), 81.4, 0.2),
  `${classicPitchPx(810).toFixed(1)} px · ~${Math.round((1440 / classicPitchPx(810) + 1) * (810 / classicPitchPx(810) + 1))} puntos en cuadro · tapa ${(((Math.PI * (classicDotPx(810) / 2) ** 2) / classicPitchPx(810) ** 2) * 100).toFixed(2)}% del papel`
)

// ── 2 · El reparto nuevo contra el de S13, en las tres ventanas ─────────────

section('2 · 🔴 El reparto nuevo: menos motas, más grandes')

/**
 * 🔴 **CONTROL POSITIVO DE LA COLUMNA "ANTES": que sea una MEDICIÓN y no un
 * fantasma.**
 *
 * ── ⚠️ QUÉ CAMBIÓ EN V3-E, Y POR QUÉ NO SE PUEDE VOLVER A LOS CINCO NÚMEROS ──
 *
 * Esto pedía los cinco literales que S13 publicó —957 motas de polvo, 76 de
 * bokeh, cuantiles 2,09 / 3,16 / 4,97 px— y era el control correcto mientras la
 * cámara de entrada no se moviera. **V3-E movió `frameX` del hero de 0,68 a
 * 0,5**: la cámara ROTA, cambia qué motas caen adentro del cuadro, y el mismo
 * constructor con los mismos parámetros de S13 da hoy **1002 / 81 · 2,08 / 3,19
 * / 4,96 px**. Los cinco números de S13 describen una pose que ya no existe y
 * **no se pueden reproducir sin volver a mover la pose**: escribir los nuevos
 * los dejaría igual de vencidos el día que alguien vuelva a tocar el encuadre.
 *
 * **Lo que se afirma en su lugar es la propiedad, y no tiene literales.** La
 * columna "antes" no es un fantasma porque la produce **la misma función que la
 * columna "después"**, diferenciándose ÚNICAMENTE en las dos perillas que S14
 * movió. Se demuestra corriendo `s13Field` con las perillas de HOY y exigiendo
 * que dé, mota por mota, exactamente lo mismo que `introField`: si fuera otro
 * constructor —o si `s13Field` hubiera quedado apuntando a un campo congelado—
 * eso no podría dar igual. Los cinco números de S13 se PUBLICAN al lado, con su
 * fecha y su pose, que es lo que un número histórico puede seguir siendo.
 */
const s13 = before(1440, 810)
const s13Dust = dustSizes(s13.motes)
/** El campo "antes" corrido con las perillas de HOY: tiene que ser el "después". */
const mismoConstructor = buildIntroParticles(1440, 810, INTRO_DUST_SIZE, INTRO_DUST_SHARE)
const hoy = after(1440, 810)
check(
  'control positivo — la columna "antes" la produce EL MISMO constructor que la de "después"',
  mismoConstructor.motes.length === hoy.motes.length &&
    mismoConstructor.motes.every((m, i) => m.sizePx === hoy.motes[i].sizePx && m.xPx === hoy.motes[i].xPx),
  `con las perillas de hoy da las mismas ${hoy.motes.length} motas, mota por mota — la única diferencia entre las dos columnas son \`${S13_DUST_SIZE}\` y \`${S13_DUST_SHARE.toFixed(4)}\``,
)
check(
  'control positivo — y con las perillas de S13 da OTRA cosa: las perillas no son decorativas',
  s13.motes.length !== hoy.motes.length,
  `${s13.motes.length} contra ${hoy.motes.length} motas`,
)
console.log(
  `  el reparto de S13, RE-MEDIDO con la pose de hoy: ${s13.dustCount} / ${s13.bokehCount} · ` +
    `${quantile(s13Dust, 0.1).toFixed(2)} / ${quantile(s13Dust, 0.5).toFixed(2)} / ${quantile(s13Dust, 0.9).toFixed(2)} px\n` +
    `  (S13 publicó 957 / 76 · 2,09 / 3,16 / 4,97 px con \`frameX: 0,68\` en el hero; V3-E lo movió a 0,5 y la cámara rotó)`,
)

for (const [width, height] of WINDOWS) {
  const old = before(width, height)
  const now = after(width, height)
  const oldDust = dustSizes(old.motes)
  const newDust = dustSizes(now.motes)

  check(
    `${width}×${height} — el campo tiene menos motas`,
    now.motes.length < old.motes.length,
    `${old.dustCount} + ${old.bokehCount} = ${old.motes.length}  →  ${now.dustCount} + ${now.bokehCount} = ${now.motes.length}  (${(((now.motes.length - old.motes.length) / old.motes.length) * 100).toFixed(0)}%)`
  )
  check(
    `${width}×${height} — y cada una es más grande, en los tres cuantiles`,
    quantile(newDust, 0.1) > quantile(oldDust, 0.1) &&
      quantile(newDust, 0.5) > quantile(oldDust, 0.5) &&
      quantile(newDust, 0.9) > quantile(oldDust, 0.9),
    `p10 ${quantile(oldDust, 0.1).toFixed(2)}→${quantile(newDust, 0.1).toFixed(2)} · mediana ${quantile(oldDust, 0.5).toFixed(2)}→${quantile(newDust, 0.5).toFixed(2)} · p90 ${quantile(oldDust, 0.9).toFixed(2)}→${quantile(newDust, 0.9).toFixed(2)} px`
  )
  /**
   * El bokeh **no se tocó**: mismo conteo, mismo tamaño, mismo color y misma
   * opacidad. La escala grande del campo ya estaba donde tenía que estar; lo
   * que no leía era el polvo.
   */
  check(
    `${width}×${height} — el bokeh no se movió ni un píxel`,
    old.bokehCount === now.bokehCount &&
      near(
        quantile(
          now.motes.filter((m) => m.kind === 'bokeh').map((m) => m.sizePx),
          0.5
        ),
        quantile(
          old.motes.filter((m) => m.kind === 'bokeh').map((m) => m.sizePx),
          0.5
        ),
        1e-9
      ),
    `${now.bokehCount} motas · mediana ${quantile(now.motes.filter((m) => m.kind === 'bokeh').map((m) => m.sizePx), 0.5).toFixed(2)} px`
  )
  check(
    `${width}×${height} — el paso medio se abre, y no queda ralo`,
    meanPitchPx(now.motes, width, height) > meanPitchPx(old.motes, width, height) &&
      meanPitchPx(now.motes, width, height) < classicPitchPx(height),
    `${meanPitchPx(old.motes, width, height).toFixed(1)} → ${meanPitchPx(now.motes, width, height).toFixed(1)} px · el clásico, ${classicPitchPx(height).toFixed(1)}`
  )
  check(
    `${width}×${height} — y la tinta sobre el papel se queda en el mismo orden`,
    inkCoverage(now.motes, width, height, 'dust') < 2 * inkCoverage(old.motes, width, height, 'dust'),
    `${(inkCoverage(old.motes, width, height, 'dust') * 100).toFixed(2)}% → ${(inkCoverage(now.motes, width, height, 'dust') * 100).toFixed(2)}% del cuadro, con ${now.motes.length} \`drawImage\` por cuadro en vez de ${old.motes.length}`
  )
}

/**
 * Que la escala sea un FACTOR y no otra distribución: los tres cuantiles se
 * multiplican por el mismo número. La forma del reparto —la que produce la
 * profundidad del campo— queda intacta, y lo único que se corrió es la escala.
 */
const nowDust = dustSizes(after(1440, 810).motes)
const ratios = [0.1, 0.5, 0.9].map((q) => quantile(nowDust, q) / quantile(s13Dust, q))
check(
  'la escala es un factor, no otra distribución: los tres cuantiles se mueven igual',
  Math.max(...ratios) - Math.min(...ratios) < 0.1,
  `p10 ×${ratios[0].toFixed(2)} · mediana ×${ratios[1].toFixed(2)} · p90 ×${ratios[2].toFixed(2)} — contra ×${INTRO_DUST_SCALE} de la perilla`
)
/**
 * Y que ralear no corra el campo hacia afuera. El recorte se aplica **por
 * concha**, así que las tres conservan su proporción: si en vez de eso se
 * hubiera recortado el final del buffer —que está ordenado por radio— el campo
 * se quedaría sin las lejanas y la rampa de color perdería su extremo claro.
 */
const tintSpan = (motes: readonly IntroMote[]) => {
  const tints = motes.filter((m) => m.kind === 'dust').map((m) => m.tint)
  return [Math.min(...tints), quantile(tints, 0.5), Math.max(...tints)] as const
}
check(
  'ralear por concha deja la rampa de color intacta de punta a punta',
  tintSpan(after(1440, 810).motes).every((value, i) => value === tintSpan(s13.motes)[i]),
  `escalón mínimo / mediano / máximo: ${tintSpan(s13.motes).join(' · ')} antes, ${tintSpan(after(1440, 810).motes).join(' · ')} después`
)

// ── 3 · 🔴 El umbral de visibilidad ─────────────────────────────────────────

section('3 · 🔴 Cuántas motas superan el umbral de visibilidad, antes y después')

/**
 * 🔴 **EL NÚMERO QUE DICE SI EL SPRINT HIZO ALGO.** El umbral está declarado en
 * `introReadingProbe.ts` y tiene dos mitades: **el diámetro del punto del
 * clásico** —la escala de lectura que el sprint manda tomar de ahí— y **el
 * contraste `LEGIBLE`** contra el papel, medido en densidad completa.
 *
 * El control positivo de las dos mitades: la primera tiene que rechazar al
 * bokeh —24 px, pero 1,13:1— y la segunda tiene que aceptarlo, así que ninguna
 * de las dos sola alcanza. Si el umbral fuera solo de contraste, las 76 motas
 * que el humano describió como "están, pero apenas se distinguen del fondo"
 * contarían como visibles.
 */
const bokehSample = after(1440, 810).motes.find((mote) => mote.kind === 'bokeh')
/** Motas con tinta de sobra y sin tamaño: las que el humano llamó grano. */
const inkWithoutSize = (motes: readonly IntroMote[]) =>
  motes.filter(
    (mote) =>
      fullDensityContrast(T, mote) >= READABLE_CONTRAST && mote.sizePx < classicDotPx(810)
  ).length
check(
  'control positivo — la mitad del CONTRASTE discrimina: rechaza al bokeh entero',
  bokehSample !== undefined &&
    bokehSample.sizePx > classicDotPx(810) &&
    fullDensityContrast(T, bokehSample) < READABLE_CONTRAST &&
    !isReadable(T, bokehSample, 810),
  bokehSample
    ? `una mota de bokeh mide ${bokehSample.sizePx.toFixed(1)} px —pasa el tamaño de sobra— con ${fullDensityContrast(T, bokehSample).toFixed(3)}:1 contra los ${READABLE_CONTRAST}:1 que pide WCAG 1.4.11`
    : 'no hay bokeh en cuadro'
)
/**
 * 🔴 Y la mitad del TAMAÑO discrimina — **en el campo de S13, que es donde el
 * humano vio el problema**. Ahí 574 motas tenían la tinta y no el tamaño: eran
 * las de "dos o tres píxeles" que se leían como grano. Es la forma medida de la
 * queja, y el número que el sprint vino a mover.
 */
check(
  'control positivo — la mitad del TAMAÑO discrimina: en el campo de S13 rechaza 574',
  inkWithoutSize(s13.motes) > 500,
  `${inkWithoutSize(s13.motes)} motas de S13 pasan ${READABLE_CONTRAST}:1 de contraste y NO llegan a los ${classicDotPx(810).toFixed(2)} px del clásico`
)
check(
  '🔴 y en el campo nuevo no rechaza a ninguna: el tamaño dejó de ser el cuello',
  inkWithoutSize(after(1440, 810).motes) === 0,
  `${inkWithoutSize(after(1440, 810).motes)} motas con tinta y sin tamaño, contra ${inkWithoutSize(s13.motes)} de S13`
)

for (const [width, height] of WINDOWS) {
  const old = before(width, height)
  const now = after(width, height)
  const oldVisible = old.motes.filter((mote) => isReadable(T, mote, height)).length
  const newVisible = now.motes.filter((mote) => isReadable(T, mote, height)).length
  check(
    `${width}×${height} — 🔴 más motas superan el umbral, con menos motas en total`,
    newVisible > oldVisible,
    `${oldVisible} de ${old.motes.length}  →  ${newVisible} de ${now.motes.length}  (+${(((newVisible - oldVisible) / oldVisible) * 100).toFixed(0)}% de visibles con ${(((now.motes.length - old.motes.length) / old.motes.length) * 100).toFixed(0)}% de motas) · umbral ${classicDotPx(height).toFixed(2)} px`
  )
}

/** Y el contraste de la mota mediana contra el papel, que NO cambia: es color. */
const medianMote = (motes: readonly IntroMote[]) => {
  const dust = motes.filter((mote) => mote.kind === 'dust').sort((a, b) => a.sizePx - b.sizePx)
  return dust[Math.floor(dust.length / 2)]
}
for (const [width, height] of WINDOWS) {
  const oldMedian = medianMote(before(width, height).motes)
  const newMedian = medianMote(after(width, height).motes)
  check(
    `${width}×${height} — el contraste de la mota mediana contra el papel`,
    fullDensityContrast(T, newMedian) > 1.1,
    `${fullDensityContrast(T, oldMedian).toFixed(2)}:1 sobre ${oldMedian.sizePx.toFixed(2)} px  →  ${fullDensityContrast(T, newMedian).toFixed(2)}:1 sobre ${newMedian.sizePx.toFixed(2)} px`
  )
}

report('introParticleReading')
