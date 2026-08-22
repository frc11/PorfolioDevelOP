import { HOME_INTRO_PHASES, type HomeIntroPhases, type IntroTimeline } from './introTimeline'

/**
 * EL ANDAMIO DE LAS COMPROBACIONES ESTÁTICAS — no es código de la aplicación.
 *
 * Lo importan los `*.invariant.ts` de este directorio y **nadie más**: no
 * hay un solo `import` desde un componente, un hook o una ruta, así que no viaja
 * a ningún bundle. Vive acá y no en un `__tests__` porque el repo no tiene
 * runner de tests — las comprobaciones son scripts que se corren con `tsx`, y
 * este es el módulo que comparten:
 *
 *     npx tsx src/components/layout/home-intro/introTimeline.invariant.ts
 *     npx tsx src/components/layout/home-intro/introSampling.invariant.ts
 *     npx tsx src/components/layout/home-intro/introFlight.invariant.ts
 *     npx tsx src/components/layout/home-intro/introSilhouette.invariant.ts
 *     npx tsx src/components/layout/home-intro/introShading.invariant.ts
 */

let passed = 0
const failures: string[] = []

export function check(label: string, condition: boolean, detail = ''): void {
  const line = `${label}${detail ? `  · ${detail}` : ''}`
  if (condition) {
    passed += 1
    console.log(`  ok  ${line}`)
    return
  }
  failures.push(line)
  console.log(`  FALLA  ${line}`)
}

export function section(title: string): void {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 66 - title.length))}`)
}

/** Cierra la corrida. Devuelve un exit code distinto de 0 si algo falló. */
export function report(name: string): void {
  console.log(`\n${name}: ${passed} en verde, ${failures.length} en rojo`)
  if (failures.length > 0) {
    for (const failure of failures) console.log(`  ✗ ${failure}`)
    process.exitCode = 1
  }
}

export const s = (value: number) => `${value.toFixed(3)}s`
export const pct = (value: number) => `${(100 * value).toFixed(1)}%`
export const px = (value: number) => `${value.toFixed(0)}px`
/** El progreso que corresponde a un instante de la secuencia. */
export const at = (timeline: IntroTimeline, seconds: number) => seconds / timeline.totalS

/** Un barrido parejo del progreso, para las propiedades que valen en todo instante. */
export const SWEEP = 600
export function sweep(fn: (progress: number, index: number) => void): void {
  for (let i = 0; i <= SWEEP; i += 1) fn(i / SWEEP, i)
}

/**
 * Las calibraciones contra las que corre todo: la de default más las que un
 * humano con siete sliders va a producir de verdad — un intro corto, uno largo,
 * y el caso de mover UNA sola perilla, una por una.
 *
 * Existe porque **las perillas las calibra el dueño del proyecto mirando la
 * pantalla, sin leer el razonamiento detrás de las fracciones**. Lo que se
 * rompe al mover un número no se ve compilando, y a velocidad real tampoco: se
 * ve como "el final quedó raro".
 */
export const CALIBRATIONS: readonly (readonly [string, HomeIntroPhases])[] = [
  ['default', HOME_INTRO_PHASES],
  [
    'corto',
    { strokeS: 0.9, fillS: 0.25, holdS: 0.3, colorS: 0.4, letterOutS: 0.3, veilOutS: 0.35, placeS: 1.2 },
  ],
  [
    'largo',
    { strokeS: 2.2, fillS: 0.6, holdS: 1.4, colorS: 1.8, letterOutS: 1, veilOutS: 1.4, placeS: 6 },
  ],
  ['solo trazo corto', { ...HOME_INTRO_PHASES, strokeS: 0.7 }],
  ['solo relleno largo', { ...HOME_INTRO_PHASES, fillS: 1.2 }],
  ['solo espera corta', { ...HOME_INTRO_PHASES, holdS: 0.1 }],
  ['solo color brevísimo', { ...HOME_INTRO_PHASES, colorS: 0.12 }],
  ['solo color larguísimo', { ...HOME_INTRO_PHASES, colorS: 2.6 }],
  ['solo letra lenta', { ...HOME_INTRO_PHASES, letterOutS: 1.6 }],
  ['solo fondo lento', { ...HOME_INTRO_PHASES, veilOutS: 2.4 }],
  ['solo acomodo larguísimo', { ...HOME_INTRO_PHASES, placeS: 7.5 }],
]
