
/**
 * LAS PARTÍCULAS — los dos campos y los tres generadores de sprite.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * S10: DEJAN DE SER ATMÓSFERA Y PASAN A SER EL RELLENO DE LA ESCENA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * S6 las bajó en cantidad y las subió en tamaño ("pocas y grandes en vez de
 * muchas y chicas"), y para una escena con once planos suspendidos eso estaba
 * bien: el aire era un detalle. **S10 vació la escena**, y ahora las partículas
 * son lo único que ocupa el espacio entre el logo y el fondo — y lo único que da
 * paralaje en las poses donde el cuadro es piso y la envolvente no llega.
 *
 * La decisión de S6 se revierte **parcialmente**: mucho más conteo, tamaño apenas
 * más chico. Las dos escalas se conservan, que es lo que da la profundidad.
 *
 * ── Por qué el tamaño baja poco y no mucho ─────────────────────────────────
 *
 * `gl_PointSize = size × dpr × (altoCSS / 2) / profundidad`, y **no interviene el
 * FOV** (`points.glsl.js` + `WebGLMaterials.refreshUniformsPoints`). Con 0,17 una
 * mota mide 7,6 px a media distancia (12) y 4,6 px en el fondo del campo (30);
 * con 0,10 caería a 2,7 px, que es el régimen donde S6 midió que el campo se lee
 * como ruido de compresión en vez de polvo. 0,17 es el piso.
 *
 * ── Las conchas: vida propia sin trabajo por partícula ─────────────────────
 *
 * "Que se muevan lento y con vida propia" no puede costar una escritura por
 * partícula y por frame: 2.400 motas son 7.200 floats y una subida de buffer por
 * cuadro. El campo se parte en **conchas por radio**, cada una en su propio grupo,
 * y el rig gira y cabecea cada una con su período — la interior más rápido. Es
 * **rotación diferencial**: una matriz por concha, cero costo por partícula, y el
 * campo deja de leerse como una nube rígida porque sus capas se descorrelacionan.
 *
 * Los tres generadores de máscara viven acá juntos porque son la misma técnica
 * con tres perfiles distintos, y porque los tres tienen que ser **puros**: se
 * llaman desde un `useMemo` y `react-hooks/purity` no perdona un efecto ahí
 * adentro. El PRNG sembrado está por lo mismo, más una razón propia: un campo de
 * partículas irrepetible haría incomparables dos capturas del mismo ángulo.
 */

// ── El campo de polvo ───────────────────────────────────────────────────────

/**
 * ── EL CONTEO (S10) ────────────────────────────────────────────────────────
 *
 * **De 400 reservadas / 220 dibujadas a 3.000 / 2.400.** En la pose inicial pasan
 * de 88 motas en cuadro a **953**.
 *
 * El costo está medido y es chico: **0,7% a 1,2% del cuadro** en overdraw sobre
 * un viewport de 1920×1080 con dpr 1,5. El campo de polvo nunca fue el gasto —
 * lo es el bokeh, que son discos grandes.
 *
 * Se reserva el buffer del máximo una sola vez y el slider mueve el `drawRange`:
 * cambiar la cantidad no reasigna ni recalcula nada.
 */
export const PARTICLES_MAX = 3000
/**
 * Media esfera de radio `PARTICLE_R_MIN..PARTICLE_R_MAX` alrededor del logo,
 * recortada por el papel. El mínimo deja libre el volumen del logo; el máximo
 * pasa la órbita más lejana, así que siempre hay partículas MÁS CERCA y MÁS LEJOS
 * que la cámara — que es la condición para que haya paralaje real entre ellas y
 * no una calcomanía de fondo.
 *
 * ⚠️ **Y por eso el polvo, a diferencia del bokeh, PUEDE cruzar la lente.** El
 * campo abarca los radios donde la cámara vive (9 a 27), así que tarde o temprano
 * una mota le pasa cerca. Su techo es el near plane de la cámara: a 0,1 de
 * distancia, una mota de 0,17 pide 1.377 px y el driver la recorta a 1.024. No se
 * puede evitar sin romper el paralaje del campo; lo acota `PARTICLE_SIZE`.
 */
export const PARTICLE_R_MIN = 5
export const PARTICLE_R_MAX = 34
export const PARTICLE_SIZE = 0.17
/**
 * Cerca oscuras, lejos claras: perspectiva atmosférica sobre papel blanco.
 *
 * `PointsMaterial` no recibe luz, así que estos valores son casi literalmente lo
 * que sale por pantalla: medido a través del tone mapping, la mota cercana
 * renderiza en **71** y la lejana en **214**. Ese degradé por distancia es lo que
 * hace que el campo se lea como volumen y no como una nube de puntos del mismo
 * tono — y es también lo que le da a la escena vaciada los 7 a 8 puntos de valor
 * medio que le bajan al cuadro.
 */
export const PARTICLE_NEAR_COLOR = '#5A5A57'
export const PARTICLE_FAR_COLOR = '#DCDCD9'
/** Semilla fija: el campo es idéntico en cada carga, así dos capturas se comparan. */
export const PARTICLE_SEED = 0x5eed1a

/**
 * Las tres conchas del polvo, como cortes sobre el campo YA ORDENADO POR RADIO.
 *
 * Son cortes por CANTIDAD y no por radio, así que las tres llevan el mismo número
 * de motas — y como el campo está cargado hacia adentro (exponente 1,4), eso
 * significa que **la interior es delgada y densa y la exterior gruesa y rala**.
 * Es exactamente lo que hace legible la rotación diferencial: la concha de
 * adentro está cerca, barre rápido y gira más rápido; la de afuera casi no se
 * mueve. Con conchas de igual espesor radial el efecto se perdería en la de
 * afuera, que es donde hay menos que ver.
 */
export const DUST_SHELLS: readonly number[] = [0, 1 / 3, 2 / 3, 1]

// ── La segunda escala: el bokeh ─────────────────────────────────────────────

/**
 * Partículas **grandes y desenfocadas**, cerca de la cámara. El desenfoque es lo
 * que más profundidad da por menos polígonos: no hay forma más barata de decirle
 * al ojo "esto está adelante del plano de foco" que un disco blando.
 *
 * **Van fijas al mundo, no pegadas a la cámara.** Pegadas al lente serían una
 * calcomanía que no se mueve: fijas al mundo barren rápido al orbitar, que es de
 * dónde sale la sensación de volumen.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ `BOKEH_R_MAX` BAJÓ DE 30 A 8, Y ES LO QUE ARREGLA EL DISCO "PEGADO"
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Un `<points>` con `sizeAttenuation` pide `gl_PointSize = size × dpr ×
 * (altoCSS/2) / profundidad`, y el driver lo recorta en
 * `ALIASED_POINT_SIZE_RANGE` —típicamente 1.024 px—. A partir de ahí el disco
 * **deja de escalar con la distancia y se pega a la pantalla**: es un defecto, no
 * un efecto.
 *
 * Con el campo entre 4,2 y 30 el problema no lo arregla `BOKEH_R_MIN`, y hay que
 * decir por qué: el campo abarcaba los radios donde la cámara vive, así que al
 * girar las conchas **una partícula termina pasando por la lente**. Medido sobre
 * el recorrido completo con el offset de mouse al máximo: la distancia mínima
 * cámara-partícula era **0,023**, o sea 42.000 px pedidos.
 *
 * **La palanca es `BOKEH_R_MAX`, no `BOKEH_R_MIN`.** Con 8 el campo entero queda
 * **por dentro de la órbita** (el recorrido nunca acerca la cámara a menos de 9),
 * así que la separación mínima pasa a ser una propiedad de la geometría:
 *
 * | | valor |
 * |---|---:|
 * | distancia mínima cámara-partícula, sobre todo el recorrido | **1,69** |
 * | `gl_PointSize` máximo que se puede pedir | **575 px** |
 * | límite del driver | 1.024 px |
 * | profundidad a la que se pediría 1.024 | 0,95 |
 * | máximo medido en cuadro, recorrido completo | **237 px** |
 *
 * **El recorte no puede ocurrir.** Y de paso el campo pasa a ser lo que su propio
 * doc decía que era: la escala CERCANA. La lejana es el polvo.
 *
 * De 30 sprites de 1,5 a **90 de 1,2**. El overdraw sube de ~1,3% a **2,0–8,5%**
 * del cuadro: sigue siendo el gasto más grande de las partículas y la primera
 * perilla si mobile no rinde.
 */
export const BOKEH_COUNT = 90
export const BOKEH_R_MIN = 4.2
export const BOKEH_R_MAX = 8
/**
 * Exponente de la distribución radial. Por debajo de 1 carga el campo hacia la
 * cámara — que es donde el desenfoque se ve.
 */
export const BOKEH_RADIUS_BIAS = 0.85
export const BOKEH_SIZE = 1.2
export const BOKEH_OPACITY = 0.2
/** Semilla propia: no puede compartir la del polvo o los dos campos coincidirían. */
export const BOKEH_SEED = 0xb04e12
export const BOKEH_SPRITE_SIZE = 64
/** Lado de la textura de una mota. Los generadores viven en `particleTextures.ts`. */
export const PARTICLE_SPRITE_SIZE = 64
/** Dos conchas, por la misma razón que el polvo tiene tres. */
export const BOKEH_SHELLS: readonly number[] = [0, 0.5, 1]

/**
 * PRNG determinista (mulberry32). `Math.random()` no puede ir en un `useMemo`
 * —la regla `react-hooks/purity` lo prohíbe, y con razón: el render dejaría de
 * ser puro— y además un campo de partículas irrepetible haría incomparables dos
 * capturas del mismo ángulo.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let x = Math.imul(state ^ (state >>> 15), 1 | state)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * El campo, generado una vez: media esfera de radio `rMin..rMax` recortada por el
 * papel, con las posiciones ORDENADAS POR RADIO.
 *
 * El orden por radio es lo que hace posibles las conchas: cada una es un tramo
 * contiguo del mismo buffer, así que las tres comparten geometría y solo cambian
 * su `drawRange`. Sin el orden habría que generar tres campos y perder la
 * garantía de que juntos son exactamente el campo de siempre.
 *
 * ⚠️ **Y tiene una consecuencia sobre el slider de cantidad.** Antes el campo
 * salía en orden aleatorio y recortar "raleaba parejo"; ahora recortaría solo las
 * lejanas. Por eso el recorte se aplica **por concha** (ver `DepthParticles`), que
 * ralea parejo igual y además mantiene las tres proporciones.
 */
export function buildParticleField(
  count: number,
  rMin: number,
  rMax: number,
  bias: number,
  seed: number,
  floorLimit: number,
  shells: readonly number[]
): { positions: Float32Array; radii: Float32Array } {
  const random = createRandom(seed)
  const span = rMax - rMin
  const raw: { x: number; y: number; z: number; r: number }[] = []

  for (let i = 0; i < count; i += 1) {
    let r = rMin
    let x = 0
    let y = 0
    let z = 0

    // Media esfera: nada debajo del papel. Rechazo con tope de intentos — arriba
    // del piso está más de la mitad del volumen, así que converge en uno o dos;
    // el tope solo existe para que el bucle no pueda colgarse.
    for (let attempt = 0; attempt < 12; attempt += 1) {
      r = rMin + span * Math.pow(random(), bias)
      const theta = random() * Math.PI * 2
      const cosPhi = 2 * random() - 1
      const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi))
      x = r * sinPhi * Math.cos(theta)
      y = r * cosPhi
      z = r * sinPhi * Math.sin(theta)
      if (y > floorLimit) break
    }

    raw.push({ x, y: Math.max(y, floorLimit), z, r })
  }

  raw.sort((a, b) => a.r - b.r)

  // Barajado DENTRO de cada concha, con el mismo PRNG. Sin esto el recorte del
  // slider se llevaría siempre las más lejanas de cada tramo (el orden por radio
  // lo garantiza), y el campo se raleraría de afuera hacia adentro en vez de
  // parejo. Con el barajado, recortar un tramo contiguo es un submuestreo
  // uniforme de esa concha.
  const shellCount = shells.length - 1
  for (let s = 0; s < shellCount; s += 1) {
    const from = Math.round(shells[s] * count)
    const to = Math.round(shells[s + 1] * count)
    for (let i = to - 1; i > from; i -= 1) {
      const j = from + Math.floor(random() * (i - from + 1))
      const tmp = raw[i]
      raw[i] = raw[j]
      raw[j] = tmp
    }
  }

  const positions = new Float32Array(count * 3)
  const radii = new Float32Array(count)
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = raw[i].x
    positions[i * 3 + 1] = raw[i].y
    positions[i * 3 + 2] = raw[i].z
    radii[i] = raw[i].r
  }

  return { positions, radii }
}
