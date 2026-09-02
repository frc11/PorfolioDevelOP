import { LINE_SETTLE_MARGIN_FRAC, type IntroTimeline } from './introTimeline'

/**
 * EL RITMO DE LAS PARTÍCULAS — cuándo aparece cada una y cuándo se va.
 *
 * Módulo puro, sin React y sin DOM, por la misma regla que separa
 * `introSampling.ts` de `introTimeline.ts`.
 *
 * ⚠ **Y desde V3-A la misma regla lo partió en dos:** acá quedan **las dos
 * ventanas y las dos fracciones que las reparten** —el archivo que se abre para
 * calibrar, todo dato— y en `introParticleSampling.ts` la aritmética que las
 * lee. Es la costura exacta que separa `introTimeline.ts` de `introSampling.ts`,
 * aplicada al mismo archivo cuando pasó las 300 líneas.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * NO ES UNA FASE NUEVA: ES UN CONSUMIDOR MÁS DEL PROGRESO QUE YA EXISTE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Las siete perillas de S8e no se tocan y no aparece una octava. Las dos
 * ventanas de las partículas se **derivan** de instantes que el timeline ya
 * publica, igual que `samplePlace` alimenta desplazamiento, rotación y entrada
 * en la luz con un solo número:
 *
 *   aparecen    →  adentro de la TRANSFORMACIÓN DE COLOR (`colorStartS` → `colorEndS`)
 *   se acomodan →  adentro de la SALIDA DE LA LETRA      (`letterOutStartS` → `letterOutEndS`)
 *
 * **Aparecen con el color porque son de tinta, no de luz:** sobre el fondo
 * oscuro no tendrían contra qué recortarse. Es la misma razón por la que el
 * disco del sol no se veía en S10.
 *
 * **Y se acomodan con la letra porque ahí sigue estando la tapadera.** El fondo
 * recién empieza a disolverse en `veilOutStartS`, así que el campo del intro
 * tiene que haber terminado antes de ese instante — no "casi", antes. Ver
 * `PARTICLES_BEFORE_VEIL` en `introTimeline.invariant.ts`. **Las dos esquinas de
 * la ventana no se movieron un milisegundo en V3-A**: lo que cambió es qué pasa
 * ADENTRO.
 *
 * ── 🔴 V3-A · LA VENTANA DE SALIDA SE PARTIÓ EN DOS ───────────────────────
 *
 * S13 tenía **un solo número** para las dos cosas que pasaban al bajar —el
 * desplazamiento y el apagado— y eso era correcto mientras la mota se fuera: si
 * arrancaban y terminaban juntos, no había calibración que desajustar.
 *
 * Con el acomodamiento **dejan de ser la misma cosa**: la mota tiene que
 * LLEGAR y recién después relevarse, o nunca se la ve acomodada. Así que el
 * gesto de cada mota se parte en dos tramos consecutivos adentro de su MISMO
 * lugar del escalonado:
 *
 *     [ se acomoda: posición, tamaño y color ] [ el relevo: la alfa se va ]
 *      ←── 1 − PARTICLE_HANDOFF_FRAC ──────→   ←─ PARTICLE_HANDOFF_FRAC ─→
 *
 * Siguen colgando de un solo instante de arranque y de una sola duración, así
 * que el escalonado no se puede desfasar; lo único que se agrega es dónde cae
 * la costura.
 *
 * ── El respiro de las dos ventanas es el mismo de las líneas ───────────────
 *
 * Las dos se cierran `LINE_SETTLE_MARGIN_FRAC` antes del final de su fase, que
 * es exactamente el respiro con el que las letras asientan antes de que el trazo
 * cierre. No es un número nuevo: es el mismo, importado.
 *
 * De ahí salen las dos garantías que el sprint pide en una línea cada una:
 * **densidad completa antes de que se vaya la letra**, y **campo afuera antes
 * de que arranque el fondo**.
 */

/**
 * QUÉ PARTE DE CADA VENTANA SE VA EN EL ESCALONADO.
 *
 * El resto es la duración del gesto de cada mota. Con 0,45 sobre la ventana de
 * entrada del default (1,26 s) el desfase entre la primera y la última es de
 * 0,567 s y cada una tarda 0,693 s; sobre la de salida (0,54 s), 0,243 s de
 * desfase y 0,297 s de caída.
 *
 * **Por qué una fracción y no un desfase en segundos:** es la ley del módulo
 * desde S8 —"la coreografía interna se declara en fracciones de su fase, nunca
 * en segundos"—, y es lo que hace que mover una perilla reacomode todo lo de
 * adentro sin desarmar el escalonado. Las dos cotas que importan las verifica la
 * comprobación **sobre las once calibraciones**: que el desfase total quede por
 * encima de `REVEAL_STAGGER_S` (o sea que se lea como secuencia y no como
 * bloque) y que la duración de cada mota quede por encima de
 * `MOTION_DURATION.micro` (o sea que no sea un parpadeo).
 */
export const PARTICLE_STAGGER_FRAC = 0.45

/**
 * 🔴 **QUÉ PARTE DEL GESTO DE CADA MOTA SE VA EN EL RELEVO — la perilla de V3-A,
 * y la que reemplaza a `INTRO_FALL_WORLD` como "la que se decide mirando".**
 *
 * El resto —`1 − PARTICLE_HANDOFF_FRAC`— es el acomodamiento propiamente dicho:
 * el viaje hasta la mota de la escena, el encogimiento hasta su diámetro y el
 * corrimiento hasta su color, **con la alfa entera**. Recién cuando eso terminó
 * la mota se releva.
 *
 * ── Por qué una fracción y no un desfase en segundos ──────────────────────
 *
 * Misma ley del módulo desde S8: *"la coreografía interna se declara en
 * fracciones de su fase, nunca en segundos"*. Con 0,35 sobre la ventana de
 * salida del default (0,54 s → 0,297 s por mota) el acomodamiento dura
 * **0,193 s** y el relevo **0,104 s**.
 *
 * ── La cota que sí es una propiedad ───────────────────────────────────────
 *
 * El ACOMODAMIENTO es el gesto, así que es el que tiene que superar
 * `MOTION_DURATION.micro` (0,15 s) para no ser un parpadeo — 0,193 s lo supera
 * por 1,29×. El relevo no es un gesto sino una extinción: que dure menos que un
 * `micro` es lo correcto, porque su virtud es no verse.
 *
 * ⚠️ **Los dos vecinos, para la grabación:** si las motas se apagan de golpe
 * apenas llegan, **0,25** (relevo 0,074 s, acomodamiento 0,223 s); si no se
 * llega a leer que se acomodan, **0,45** (acomodamiento 0,163 s, todavía arriba
 * del `micro`). Arriba de **0,495** el acomodamiento cae por debajo del `micro`
 * y `introParticleTiming.invariant.ts` §2 se pone en rojo.
 */
export const PARTICLE_HANDOFF_FRAC = 0.35

export type IntroParticleWindows = {
  /** Aparecen: adentro de la transformación de color. */
  readonly inStartS: number
  readonly inEndS: number
  /** Bajan: adentro de la salida de la letra. */
  readonly outStartS: number
  readonly outEndS: number
  /** Lo que cada mota tarda en aparecer y en irse del todo, por separado. */
  readonly inDurationS: number
  readonly outDurationS: number
  /** Y las dos mitades de esa salida: primero se acomoda, después se releva. */
  readonly settleDurationS: number
  readonly handoffDurationS: number
  /** El desfase entre la primera y la última, en cada ventana. */
  readonly inStaggerS: number
  readonly outStaggerS: number
}

export function introParticleWindows(timeline: IntroTimeline): IntroParticleWindows {
  const colorS = timeline.colorEndS - timeline.colorStartS
  const letterOutS = timeline.letterOutEndS - timeline.letterOutStartS

  const inStartS = timeline.colorStartS
  const inEndS = timeline.colorEndS - colorS * LINE_SETTLE_MARGIN_FRAC
  const outStartS = timeline.letterOutStartS
  const outEndS = timeline.letterOutEndS - letterOutS * LINE_SETTLE_MARGIN_FRAC

  const inSpanS = Math.max(0, inEndS - inStartS)
  const outSpanS = Math.max(0, outEndS - outStartS)

  const outDurationS = outSpanS * (1 - PARTICLE_STAGGER_FRAC)

  return {
    inStartS,
    inEndS,
    outStartS,
    outEndS,
    inDurationS: inSpanS * (1 - PARTICLE_STAGGER_FRAC),
    outDurationS,
    settleDurationS: outDurationS * (1 - PARTICLE_HANDOFF_FRAC),
    handoffDurationS: outDurationS * PARTICLE_HANDOFF_FRAC,
    inStaggerS: inSpanS * PARTICLE_STAGGER_FRAC,
    outStaggerS: outSpanS * PARTICLE_STAGGER_FRAC,
  }
}
