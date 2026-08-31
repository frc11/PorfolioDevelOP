/**
 * LAS SEIS CONDICIONES DE §1.2, COMO DATO — y dónde se lee cada una.
 *
 * ⚠ **Ninguna es de este sprint.** Están implementadas y verificadas en
 * `HomeIntro.tsx` y su módulo desde S8d; lo que SITIO-S8 hace es montar esa
 * pieza en `/v3`, y por eso lo que hay que demostrar es que **siguen valiendo
 * montadas**, leyéndolas del código que ya existe y no de una copia.
 *
 * Están acá y no adentro del invariante por dos razones. La de siempre: un
 * detector se prueba corriendo la MISMA función contra una entrada rota, y para
 * eso la entrada y el predicado tienen que poder separarse. Y la del repo: el
 * invariante pasaba las 300 líneas.
 *
 * ── Las dos mitades, y por qué a veces hay una sola ───────────────────────
 *
 * Una condición se puede custodiar por lo que TIENE que aparecer (`exigidos`) o
 * por lo que NO PUEDE aparecer (`prohibidos`). Dos —«sin sonido» y «no espera a
 * que cargue nada»— son puras prohibiciones: no existe una línea que diga «acá
 * no suena». Ahí el riesgo de verde por vacío lo cubre el control positivo, que
 * corre el MISMO buscador contra un fuente que sí lo tiene.
 */

import { recorrer } from '../../_lib/__tests__/s8-padron'

export const HOME = 'src/app/v3/page.tsx'
export const LAYOUT_RAIZ = 'src/app/layout.tsx'
export const PIEZA = 'src/components/layout/HomeIntro.tsx'
export const BOOT = 'src/components/layout/home-intro/introBoot.tsx'
export const OVERLAY = 'src/components/layout/home-intro/IntroOverlay.tsx'
export const HANDOFF = 'src/components/layout/home-intro/introHandoff.ts'
export const LOGO_3D = 'src/components/layout/home-intro/IntroLogo3D.tsx'

/**
 * Todo el módulo del preloader, SIN sus propias comprobaciones: las
 * prohibiciones se buscan acá, archivo por archivo. Se recorre el disco en vez
 * de listar a mano para que un archivo nuevo entre solo.
 */
export const MODULO_DEL_PRELOADER: readonly string[] = [
  PIEZA,
  ...recorrer('src/components/layout/home-intro').filter(
    (a) => /\.tsx?$/.test(a) && !/\.invariant\.tsx?$/.test(a),
  ),
]

/**
 * Las piezas internas del preloader. Si el montaje nombrara una, habría dos
 * definiciones del mismo momento y una de las dos se quedaría vieja.
 */
export const PIEZAS_INTERNAS: readonly string[] = [
  'useIntroEngine',
  'IntroOverlay',
  'IntroLockup',
  'IntroLogo3D',
  'useReducedMotion',
  'sessionStorage',
  'usePreloader',
  'HOME_INTRO_TIMELINE',
  'setIntroStage',
  'dynamic',
]

export interface Condicion {
  readonly numero: string
  readonly titulo: string
  /** Pares `[archivo, texto]` que TIENEN que estar. Con las cadenas puestas. */
  readonly exigidos: readonly (readonly [string, string])[]
  /** Identificadores que no pueden estar en NINGÚN archivo del módulo. */
  readonly prohibidos: readonly string[]
  /** Con qué fuente roto se prueba que el buscador de `prohibidos` ve. */
  readonly fuenteRota: string
}

export const CONDICIONES: readonly Condicion[] = [
  {
    numero: '3.1',
    titulo: 'Solo la primera visita de la sesión — `sessionStorage`',
    exigidos: [
      [BOOT, "sessionStorage.getItem('${INTRO_SESSION_KEY}')!=='1'"],
      [BOOT, 'window.sessionStorage.setItem(INTRO_SESSION_KEY'],
      [HANDOFF, "export const INTRO_SESSION_KEY = 'home:intro'"],
    ],
    prohibidos: [],
    fuenteRota: '',
  },
  {
    numero: '3.2',
    titulo: 'Nunca bloquea el scroll, ni un frame',
    exigidos: [
      [OVERLAY, 'pointer-events-none'],
      [OVERLAY, 'fixed inset-0'],
      [OVERLAY, 'aria-hidden'],
      [OVERLAY, 'data-home-intro-overlay'],
    ],
    // `overflow` y `lenis` aparecen en los docblocks del módulo, que los nombran
    // PARA NEGARLOS. Por eso el buscador de prohibidos borra los comentarios: sin
    // eso, este chequeo pondría en rojo el trabajo de haber escrito la garantía.
    prohibidos: ['lenis', 'overflow', 'body.style', 'documentElement.style', 'preventDefault'],
    fuenteRota: 'useEffect(() => { lenis.stop(); document.body.style.overflow = "hidden" }, [])',
  },
  {
    numero: '3.3',
    titulo: 'No espera a que cargue nada — cero `await`, cero gate',
    exigidos: [[LOGO_3D, "dynamic(() => import('./IntroLogoCanvas'), { ssr: false })"]],
    prohibidos: ['await '],
    fuenteRota: 'const mesh = await cargarMesh()',
  },
  {
    numero: '3.4',
    titulo: 'Sin sonido',
    exigidos: [],
    prohibidos: ['AudioContext', 'HTMLAudioElement', 'new Audio', '<audio', 'Howl'],
    fuenteRota: "const ping = new Audio('/ping.mp3'); ping.play()",
  },
  {
    numero: '3.5',
    titulo: 'Honra `prefers-reduced-motion`: ahí no se monta la secuencia',
    exigidos: [
      [BOOT, "matchMedia('(prefers-reduced-motion: reduce)')"],
      [PIEZA, 'useReducedMotion'],
      [PIEZA, '!prefersReducedMotion'],
    ],
    prohibidos: [],
    fuenteRota: '',
  },
]

/**
 * Los dos archivos congelados, con la identidad que tenían en el disco al
 * escribir este instrumento. Un archivo congelado no cambia nunca: cualquier
 * edición, de cualquier sprint, mueve el hash y esto se pone rojo nombrando
 * cuál. El porqué del método —y por qué NO se compara contra `git`— está en
 * `soporte.ts`.
 */
export const IDENTIDADES: Readonly<Record<string, string>> = {
  'src/context/PreloaderContext.tsx':
    '8664d01dd44be214243aae378db16beef9699597b0cbac673f9bf4d8e744cc46',
  'src/context/TransitionContext.tsx':
    '75adc80403677b57a7957c91d3ebca0b6720fa17f3fd80a3c2c1152c9e7b3b87',
}
