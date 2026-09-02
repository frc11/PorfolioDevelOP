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
 * 🔴 V3-A · LAS DEL INTRO SE **ACOMODAN** EN EL CAMPO DE LA ESCENA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * **Hasta acá bajaban.** El campo entero se desplazaba `INTRO_FALL_WORLD`
 * unidades de mundo y se apagaba, y esa bajada era la tapadera del relevo:
 * caían las del intro y quedaban las de la escena, que ya estaban ahí. El
 * humano miró y dijo lo contrario: *«me gusta cómo empieza pero no cómo se van.
 * Lo que podríamos hacer sería que esas mismas partículas se acomoden en la
 * escena»*.
 *
 * Ahora **cada mota viaja hasta una mota real del campo de la escena** y se
 * queda: se corre hasta su posición, se encoge hasta su diámetro y se mueve
 * hasta su color. El destino y la asignación viven en
 * `introParticleLanding.ts`; el ritmo —acomodarse primero, relevarse después—
 * en `introParticleTiming.ts`.
 *
 * ── Lo que NO cambia: nunca se ven las dos poblaciones ─────────────────────
 *
 * Sigue siendo el único requisito duro del mecanismo, y sigue garantizado por
 * el mismo orden: el campo del intro termina de relevarse **antes** de que el
 * fondo empiece a disolverse (`PARTICLES_BEFORE_VEIL`, sin tocar). Lo que
 * cambió es qué esconde el relevo: antes, que las motas eran otras; ahora, que
 * son las mismas pero de otra fase — ver `introParticleLanding.ts`.
 *
 * El margen se volvió a medir, no a estimar — `introParticleTiming.invariant.ts`
 * y `introParticleSettle.invariant.ts`.
 *
 * ── La especie se PROYECTA. El TAMAÑO, no ─────────────────────────────────
 *
 * El campo del intro **es** el campo de la escena —el mismo generador, los
 * mismos radios, el mismo sesgo, los mismos colores, el mismo material—
 * **proyectado por la cámara de la pose inicial**. De ahí salen solos el reparto
 * sobre la pantalla y la perspectiva atmosférica. Lo propio son la SEMILLA, la
 * ESCALA y la DENSIDAD.
 *
 * **Por qué otra semilla y no la misma.** S13 lo escribió así: con la misma, las
 * motas del intro caerían desde exactamente los lugares donde, tres décimas más
 * tarde, las de la escena vuelven a estar — *«el único modo de que el corte se
 * note: no por parecerse poco, sino por parecerse demasiado»*.
 *
 * 🔴 **V3-A conserva la semilla propia y le da vuelta el argumento.** El defecto
 * de nacer en el lugar del destino era que **no habría viaje**: la mota ya
 * estaría acomodada antes de acomodarse. Con semilla propia el campo nace donde
 * el humano lo aprobó y **termina** en el de la escena, que es el gesto que
 * pidió. La semilla no cambia; cambia qué defecto evita.
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
 * 🔴 **Y desde V3-A esa diferencia de escala tiene fecha de vencimiento adentro
 * de la propia secuencia**: la mota nace con la escala del intro (×2,05) y
 * **termina con la de la escena**, porque su destino es una mota de la escena
 * con su diámetro y su color. El reparto que S14 calibró mirando sigue siendo el
 * de la ENTRADA y el de la espera, que es donde el humano lo aprobó; lo que se
 * agrega es a dónde va después.
 *
 * ── El acomodamiento es un viaje en PANTALLA, y por qué ───────────────────
 *
 * La bajada de S13 era un desplazamiento en el MUNDO —el campo entero bajando
 * `INTRO_FALL_WORLD` y volviéndose a proyectar—, y de ahí salía el paralaje
 * gratis. El acomodamiento no puede serlo: su destino no es una traslación
 * rígida sino **un punto distinto por mota**, el de la mota de la escena que la
 * recibe. Se resuelve en píxeles porque las dos puntas ya están proyectadas por
 * la MISMA cámara, así que la perspectiva ya está adentro de los dos números y
 * volver al mundo no agregaría nada — sólo pondría una segunda proyección donde
 * hay una.
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
 * QUÉ FRACCIÓN DEL CAMPO DIBUJA **LA ESCENA** — `PROBE_DEFAULTS.particleCount`
 * (2.400) sobre `PARTICLES_MAX` (3.000).
 *
 * Cuarto número copiado, y por la misma regla que los tres de arriba: **la
 * comprobación lee `probeStore.ts` y exige que siga siendo el mismo**.
 *
 * ⚠ **Importarlo tiene un costo concreto y por eso no se importa.**
 * `probeStore.ts` arrastra `probeCelosia`, `celosiaPenumbra`, `probeMoire`,
 * `probeLighting` y `choreographyPhysics`; este módulo lo consume
 * `IntroParticleCanvas.tsx`, que es un canvas 2D y por lo tanto **viaja en el
 * bundle de la PRIMERA visita** —la única en la que el preloader corre—. Es
 * exactamente el motivo por el que S13 mudó `introRig.ts` al chunk diferido de
 * `three` (ver su docblock).
 */
export const SCENE_DUST_SHARE = 0.8

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
 * 🔴 **LA PERILLA DE S13 QUE DESAPARECIÓ, Y QUÉ LA REEMPLAZA.**
 *
 * `INTRO_FALL_WORLD` valía 1,9 unidades de mundo y era *«la única perilla de
 * S13 que se decide MIRANDO»*: cuánto bajaba el campo. Con el acomodamiento no
 * hay nada que bajar — **el destino de cada mota no es una traslación, es la
 * mota de la escena que la recibe**, y ese punto no se elige, se calcula
 * (`introParticleLanding.ts`).
 *
 * Lo que queda decidiéndose mirando es OTRA cosa y vive en
 * `introParticleTiming.ts`: `PARTICLE_HANDOFF_FRAC`, qué parte del gesto de
 * cada mota se va en el relevo con el campo de la escena. La perilla no se
 * perdió: cambió de pregunta.
 *
 * Las cifras que S13 y S14 publicaban sobre la caída —16,5 diámetros de
 * recorrido, mediana de 109 px, dispersión ×5,3 por el paralaje— **quedan
 * vencidas y se reemplazan por las del acomodamiento**, medidas en
 * `introParticleSettle.invariant.ts`. Regla 11: se corrigen con su medición al
 * lado, no se borran.
 */

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
  /** La concha del campo de la que salió. Ata el destino al origen. */
  readonly shell: number
  /** Posición y diámetro en píxeles CSS, donde la mota APARECE. */
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
  /**
   * Cuánto se mueven esos tres al ACOMODARSE, o sea al llegar a la mota de la
   * escena que la recibe. Los tres son cero si no hubo destino para ella.
   */
  readonly settleDxPx: number
  readonly settleDyPx: number
  readonly settleDSizePx: number
  /** El color que la escena renderiza para esta mota, ya con el tone mapping. */
  readonly color: string
  /** El escalón de la rampa con el que se la dibuja. −1 = bokeh. */
  readonly tint: number
  /** Y el escalón de la mota de la escena en la que se acomoda. */
  readonly settleTint: number
  /** La opacidad del material del campo del que salió. */
  readonly materialAlpha: number
  /** 0 → 1: su lugar en el escalonado, de entrada y de acomodamiento. */
  readonly phase: number
}

export type IntroParticleField = {
  readonly motes: readonly IntroMote[]
  readonly dustCount: number
  readonly bokehCount: number
}
