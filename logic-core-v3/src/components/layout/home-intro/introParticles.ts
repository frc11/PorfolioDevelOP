import {
  BOKEH_R_MAX,
  BOKEH_SIZE,
  PARTICLE_SIZE,
} from '@/app/v3/_lib/escena/probeParticles'

/**
 * LAS PARTÍCULAS DEL PRELOADER — LA ESPECIE.
 *
 * Qué es una mota: de dónde salen sus tamaños y el borde entre las dos escalas.
 * **El color** vive en `introParticleTint.ts`, **cómo se arma el campo** en
 * `introParticleField.ts` y **el ritmo** en `introParticleTiming.ts`, por la
 * misma regla que separa `introTimeline.ts` de `introSampling.ts`: los datos de
 * un lado, la aritmética que los lee del otro.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * NO HAY RELEVO. LAS DEL INTRO **BAJAN** ANTES DE QUE SE VAYA EL BLANCO.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Las que caen son las del intro; las que quedan flotando son las de la escena,
 * que ya estaban ahí desde siempre. Nadie puede notar que no son las mismas
 * **porque nunca se ven las dos poblaciones a la vez**, y ése es el único
 * requisito del mecanismo. La bajada es la tapadera, igual que la inversión de
 * la tinta es la tapadera del relevo 2D→3D.
 *
 * El margen está medido, no estimado — `introParticleTiming.invariant.ts`.
 *
 * ── La especie se PROYECTA. El TAMAÑO, no ─────────────────────────────────
 *
 * El campo del intro **es** el campo de la escena —el mismo generador, los
 * mismos radios, el mismo sesgo, los mismos colores, el mismo material—
 * **proyectado por la cámara de la pose inicial**. De ahí salen solos el reparto
 * sobre la pantalla, la perspectiva atmosférica y el paralaje de la caída. Lo
 * propio son la SEMILLA, la ESCALA y la DENSIDAD.
 *
 * **Por qué otra semilla y no la misma.** Con la misma, las motas del intro
 * caerían desde exactamente los lugares donde, tres décimas más tarde, las de la
 * escena vuelven a estar. Es el único modo de que el corte se note: no por
 * parecerse poco, sino por parecerse demasiado.
 *
 * 🔴 **Por qué otra escala — S14.** S13 hizo que el intro copiara también la
 * MEZCLA de la escena (957 de polvo contra 76 de bokeh, mediana 3,16 px), y esa
 * restricción se soltó: **la lectura no depende solo de la especie, depende del
 * fondo.** En la escena ese polvo tiene paralaje, se mueve con las conchas y cae
 * sobre un piso con bandas — se lee como atmósfera. En el intro está quieto,
 * sobre papel blanco liso y sin nada más en el cuadro: ahí se lee como ruido de
 * sensor. El relevo nunca pidió que las poblaciones se correspondieran; pidió
 * que no se vieran las dos juntas, y de eso se ocupa `PARTICLES_BEFORE_VEIL`.
 *
 * Lo que **sí** se conserva de la especie es el color (`introParticleTint.ts`),
 * el material (`DUST_MATERIAL_ALPHA`, `BOKEH_OPACITY`) y la forma (los sprites
 * de la escena, importados tal cual). Un cambio de tamaño se perdona; un cambio
 * de sustancia, no.
 *
 * ── La bajada es una caída en el MUNDO, no un deslizamiento en pantalla ────
 *
 * El campo entero baja `INTRO_FALL_WORLD` unidades de mundo y se lo vuelve a
 * proyectar. Como la proyección divide por la profundidad, las motas cercanas
 * barren cientos de píxeles y las lejanas unas decenas: **el paralaje sale
 * gratis y es el que corresponde**, y de paso es la "dispersión" que la
 * instrucción permite — con una causa física en vez de un número al azar. La
 * dirección dominante es hacia abajo por construcción: el desplazamiento es −Y
 * de mundo y nada más.
 */

// ── Lo que el intro toma de la escena, y no puede importar ──────────────────

/**
 * Tres números que `DepthParticles.tsx` y `BokehParticles.tsx` pasan como
 * literales y ningún módulo exporta. Se copian acá **y la comprobación lee el
 * código de esos componentes para exigir que sigan siendo el mismo número**: es
 * el patrón de `introSilhouette.invariant.ts`, que verifica el clip leyendo el
 * SVG en vez de confiar en que nadie lo mueva.
 */
export const DUST_RADIUS_BIAS = 1.4
/** El campo se corta a esta altura sobre el papel: media esfera, nada abajo. */
export const FLOOR_CLEARANCE = 0.4
/** `opacity` del material del polvo. El del bokeh sí se exporta. */
export const DUST_MATERIAL_ALPHA = 0.9

/**
 * 🔴 LA ESCALA DEL POLVO DEL INTRO — la perilla de tamaño de S14.
 *
 * Multiplica `PARTICLE_SIZE` **solo del lado del intro**: el campo de la escena
 * no se toca, y el bokeh del intro tampoco. Como el tamaño en pantalla es
 * `size × (altoCSS/2) / profundidad`, la escala mueve el reparto entero por un
 * factor —p10, mediana y p90 se multiplican por lo mismo— sin cambiar su forma:
 * la dispersión de tamaños sigue siendo la que produce la profundidad del campo.
 *
 * ── De dónde sale el 2,05 ──────────────────────────────────────────────────
 *
 * De la **referencia de lectura** que el sprint manda mirar: el campo de puntos
 * del preloader clásico, que sobre el mismo blanco se lee como puntos contables
 * y con presencia propia. Su punto proyecta **4,28 px** en 1440×810
 * (`introReadingProbe.ts` lo mide leyendo `DotMatrix.tsx` y `Hero.tsx`), y esa
 * es la escala de visibilidad que se toma de ahí — **no** su grilla regular, que
 * no se quiere.
 *
 * Con 2,05 el **p10** del polvo del intro llega a 4,26 px: nueve de cada diez
 * motas están en la escala de lectura del clásico o por encima. Con el reparto
 * de S13 la que llegaba era una de cada cinco, y la mediana —3,16 px— caía justo
 * en el régimen de "dos o tres píxeles" que el humano describió como grano.
 *
 * **Los dos vecinos, para la grabación:** si se leen demasiado grandes, **1,35**
 * (ahí lo que llega al punto del clásico es la MEDIANA, no el p10); si todavía
 * se leen chicas, **2,4** (el p25 llega a 6,36 px). La banda de
 * `introParticleReading.invariant.ts` acepta los dos y rechaza los extremos:
 * 1,0 —el reparto de S13, cuya mediana no llega al punto del clásico— y 3,0,
 * donde el recorte de la regla de las dos escalas ya se come el 4,3% del campo.
 */
export const INTRO_DUST_SCALE = 2.05

/** El tamaño de mundo con el que el intro proyecta una mota de polvo. */
export const INTRO_DUST_SIZE = PARTICLE_SIZE * INTRO_DUST_SCALE

/**
 * QUÉ FRACCIÓN DEL CAMPO RESERVADO SE DIBUJA — la otra mitad de S14.
 *
 * S13 embarcaba el default del probe (0,8 = 2.400 de `PARTICLES_MAX`), que era
 * la mezcla de la escena. **Con motas al doble de tamaño, esa densidad ya no es
 * la del clásico sino la del grano**: el campo pasa a 366 motas de polvo en
 * cuadro contra 957, o sea un paso medio de **51 px** contra los 34 de S13.
 *
 * El número no copia la grilla del clásico —el sprint es explícito en que la
 * distribución sigue siendo la del campo, no un patrón regular— pero sí queda
 * del lado denso de ella: el clásico muestra sus puntos con `DOT_SPACING_SPARSE`
 * y ahí su paso es **81 px**, o sea que el campo del intro sigue siendo **1,6×
 * más denso** que la referencia que se está tomando.
 *
 * El recorte se aplica **por concha** (ver `drawnRanges`), así que ralear no
 * corre el campo hacia afuera: las tres conchas conservan su proporción y la
 * rampa de color queda intacta de punta a punta — medido, no supuesto.
 */
export const INTRO_DUST_SHARE = 0.3

/** Semillas propias: mismo campo estadístico que la escena, otra muestra. */
export const INTRO_DUST_SEED = 0x1de1a
export const INTRO_BOKEH_SEED = 0xb0cad0
/** Y una tercera para el escalonado, que no puede correlacionar con el radio. */
export const INTRO_PHASE_SEED = 0x5ca10a

/**
 * CUÁNTO BAJA EL CAMPO, en unidades de mundo.
 *
 * 🔴 **La única perilla de S13 que se decide MIRANDO.** Todo lo demás sale de la
 * escena o de una propiedad; esto no tiene respuesta correcta en un archivo — es
 * la misma clase de número que `placeS` en `introTimeline.ts`, y se anota igual,
 * con sus dos vecinos.
 *
 * ── Lo que este número gobierna, y por qué es UNO SOLO ─────────────────────
 *
 * Medido en **diámetros de la propia mota**, el recorrido de la caída no depende
 * de la profundidad: el desplazamiento y el tamaño se dividen los dos por ella y
 * el cociente se cancela. Tampoco depende de la ventana. Queda
 *
 *     recorrido = INTRO_FALL_WORLD / (tamaño × tan(fov/2))
 *
 * o sea **16,5 diámetros** para el polvo del intro con la escala de S14 —eran
 * 33,8 con la de S13, exactamente el doble—, idénticos en 1440×810, 1920×1080 y
 * 390×844: verificado en las tres. Repartidos sobre los 17,8 cuadros de la
 * ventana de salida son **0,93 diámetros por cuadro**, que es el número que
 * decide si la caída se lee como movimiento o como una fila de puntos (ver
 * `sampleParticleOut`).
 *
 * ⚠ **`INTRO_FALL_WORLD` no cambió: lo que bajó el paso fue la mota, que creció.**
 * Y eso no refuerza el argumento de `linear` contra `shift` — lo vuelve
 * innecesario, porque a esta escala `shift` tampoco se saldría de la banda. El
 * número está medido en `introParticleField.invariant.ts`.
 *
 * En píxeles, sobre desktop 1440×810: mediana **109 px**, de 47 en la mota más
 * lejana a 248 en la más cercana. Esa dispersión ×5,3 es el paralaje, y es lo
 * que hace que el campo se lea con profundidad en vez de como una capa que se
 * desliza. (Con el reparto de S13 el extremo llegaba a 377 y la razón a ×8,1:
 * los extremos de una muestra dependen de su tamaño, y S14 la ralea. Lo que no
 * se movió es la ley — el cociente entre deciles, ×2,21 contra ×2,11.)
 *
 * **Los dos vecinos, para la grabación:** si la caída estrobea o se lee
 * violenta, **1,2**; si se lee como un desvanecimiento en el lugar, **3,0**.
 */
export const INTRO_FALL_WORLD = 1.9

/**
 * EL BORDE ENTRE LAS DOS ESCALAS — el único recorte que el campo del intro tiene.
 *
 * El campo de polvo llega hasta radio 34 y la cámara de la pose inicial está a
 * 20,05 del origen, así que **una mota puede quedar a dos unidades de la lente**.
 * En la escena eso es transitorio: las conchas giran y la mota barre. Acá el
 * campo se queda quieto 1,4 s, y una mota de polvo de 33 px inmóvil no es la
 * misma especie que las de la escena — es un disco.
 *
 * El corte no se elige a ojo: sale de la propia regla de las dos escalas de S10.
 * **El polvo es la escala LEJANA y el bokeh la CERCANA**, así que ninguna mota
 * de polvo puede proyectar más grande que el disco de bokeh más chico, que es el
 * borde entre las dos. Ese disco está en el punto más lejano del campo de
 * bokeh —`BOKEH_R_MAX` detrás del origen—, y de ahí sale una profundidad mínima
 * para el polvo, en unidades de mundo y sin depender de la ventana:
 *
 *     depthMin = INTRO_DUST_SIZE × (ojo + BOKEH_R_MAX) / BOKEH_SIZE
 *
 * ⚠ **Entra el tamaño del intro, no el de la escena** (S14): al agrandar la mota
 * el borde se aleja en la misma proporción —de 3,97 a **8,15**— y el diámetro
 * del corte **no se mueve**, porque los dos factores se cancelan. Lo que sube es
 * cuánto campo queda afuera: de **0,21% a 0,81%** del polvo dibujado. La escena,
 * en esta pose, sigue cumpliéndolo sola.
 */
export function dustDepthFloor(eyeDistance: number): number {
  return (INTRO_DUST_SIZE * (eyeDistance + BOKEH_R_MAX)) / BOKEH_SIZE
}

// ── La especie ──────────────────────────────────────────────────────────────

/** De qué campo salió una mota. */
export type IntroMoteKind = 'dust' | 'bokeh'

export type IntroMote = {
  readonly kind: IntroMoteKind
  /** Posición y diámetro en píxeles CSS, con el campo quieto. */
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
  /** Cuánto se mueven esos tres cuando el campo terminó de bajar. */
  readonly dxPx: number
  readonly dyPx: number
  readonly dSizePx: number
  /** El color que la escena renderiza para esta mota, ya con el tone mapping. */
  readonly color: string
  /** El escalón de la rampa con el que se la dibuja. −1 = bokeh. */
  readonly tint: number
  /** La opacidad del material del campo del que salió. */
  readonly materialAlpha: number
  /** 0 → 1: su lugar en el escalonado, de entrada y de salida. */
  readonly phase: number
}

export type IntroParticleField = {
  readonly motes: readonly IntroMote[]
  readonly dustCount: number
  readonly bokehCount: number
}
