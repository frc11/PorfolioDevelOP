/**
 * EL ENCHUFE DEL INTRO — el punto de montaje y su contrato.
 *
 * ⚠ **ESTE ARCHIVO NO LO ESCRIBE EL SUBAGENTE.** Lo escribió el agente
 * principal en la Fase 0 de SITIO-S8, antes de despachar.
 *
 * ── Qué es el enchufe, en tres piezas ──────────────────────────────────────
 *
 *   1. `src/components/layout/home-intro/introRutas.ts` — **la lista de rutas
 *      en las que el gate pre-paint arma**. Es la única pieza del preloader que
 *      la Fase 0 tocó, y toca el sitio vivo: el porqué, la garantía de que `/`
 *      no cambia y la consecuencia sobre `sessionStorage` están escritos ahí.
 *   2. `src/app/v3/_intro/IntroDelHome.tsx` — lo que se monta. Lo escribe el
 *      subagente. Export **nombrado** `IntroDelHome`, sin props.
 *   3. Este archivo — el contrato.
 *
 * ── Por qué el import es ESTÁTICO, y por qué eso no rompe el presupuesto ───
 *
 * El overlay tiene que viajar **en el HTML del servidor**, siempre. Es la mitad
 * del mecanismo del gate pre-paint: el servidor no conoce `sessionStorage`, así
 * que manda el overlay en el HTML y el `<script>` del `<head>` decide, antes
 * del primer pintado, si se ve o no —una regla de `globals.css` lo esconde
 * cuando el `<html>` no lleva la marca—. Con `dynamic(..., { ssr: false })` el
 * overlay no estaría en ese HTML y la primera visita vería un flash del hero
 * antes de que la capa apareciera, que es exactamente el defecto que el gate
 * existe para no tener.
 *
 * Lo que un import estático NO arrastra es `three`: `IntroLogo3D` pide su
 * canvas con `dynamic(() => import('./IntroLogoCanvas'), { ssr: false })`, así
 * que la librería queda del otro lado igual que en el home vivo. Medido sobre
 * el build de la línea de base: cero huellas de three en la carga inicial de
 * `/`, que monta este mismo componente de forma estática.
 *
 * ── Las seis condiciones, que NO son de este sprint ────────────────────────
 *
 * Son las de `DIRECCION-ESCENA.md` §1.2 y ya están implementadas y verificadas
 * en `HomeIntro.tsx`. El subagente **las consume, no las reimplementa**, y su
 * trabajo es demostrar que siguen valiendo montadas en `/v3`:
 *
 *   1. **Solo la primera visita de la sesión** — `sessionStorage`.
 *   2. **Nunca bloquea el scroll, ni un frame** — capa `pointer-events-none`,
 *      no toca `overflow`, no llama `lenis.stop()`, no gatea el render.
 *   3. **No espera a que cargue nada** — cero `await`, cero gate.
 *   4. **Sin sonido.**
 *   5. **Honra `prefers-reduced-motion`**: ahí no se monta la secuencia.
 *   6. **El logo nunca cambia de tamaño**: nace con el tamaño del destino, que
 *      sale del primer keyframe de la coreografía vía `lib/scene-framing.ts`.
 *
 * ── Los dos archivos congelados, y qué significa acá ───────────────────────
 *
 * `context/PreloaderContext.tsx` y `context/TransitionContext.tsx` **se leen, se
 * consumen y jamás se editan**. `HomeIntro` ya consume el primero de la única
 * forma correcta —la fase salta a `'done'` al montar, así el intro no retiene
 * chrome ni scroll ni contenido— y no necesita el segundo. Si el montaje en
 * `/v3` los necesitara distintos, **se frena y se reporta**: no se editan.
 *
 * ── Lo que este contrato NO decide ─────────────────────────────────────────
 *
 * Las dos mediciones que el sprint pide, porque las dos dependen de la escena
 * real y hasta ahora se midieron contra un marcador de posición plano:
 *
 *   · **El escalón de exposición** (§7.11): el intro termina en
 *     `HEMI_INTENSITY × celosiaSkyFactor(CELOSIA_BAR)` y la escena arranca ahí
 *     mismo — pero el número publicado, 0,39 puntos sRGB, se midió cuando la
 *     única superficie iluminada del intro era su propia tinta y detrás no
 *     había nada. Ahora el intro entrega a una sala de verdad.
 *   · **El margen de las partículas**: 112,4 ms entre la última mota legible
 *     del intro (4,166 s) y la primera de la escena (4,278 s), con el umbral de
 *     contraste 1,10 que el repo ya usa. También se midió contra el marcador.
 *
 * Los dos números se vuelven a medir con la escena real. Si el escalón se ve, o
 * si las dos poblaciones se solapan, **se frena y se reporta el número**: no se
 * tapa con un fundido inventado ni se corre una ventana.
 */

/** El módulo que se monta, con su ruta exacta. Para poder afirmar que existe. */
export const MODULO_DEL_INTRO = 'src/app/v3/_intro/IntroDelHome.tsx'

/** Cómo lo pide el home. Se afirma contra el fuente de `page.tsx`. */
export const IMPORT_DEL_INTRO = './_intro/IntroDelHome'

/** El nombre exportado. Nombrado y no por defecto: el import es estático. */
export const EXPORT_DEL_INTRO = 'IntroDelHome'

/**
 * La pieza terminada que el subagente CONSUME. No se copia, no se reescribe y
 * no se le cambia un valor: es el preloader de S8d, entero.
 */
export const PIEZA_QUE_SE_CONSUME = '@/components/layout/HomeIntro'

/**
 * Los archivos congelados que este frente puede LEER y no puede editar.
 * Escritos como dato para que el instrumento lo pueda afirmar contra el disco y
 * no contra `git` —comparar contra `git` mediría el momento del sprint y
 * vencería al commitear (regla 12 de §3)—.
 */
export const CONGELADOS_DEL_INTRO: readonly string[] = [
  'src/context/PreloaderContext.tsx',
  'src/context/TransitionContext.tsx',
]

/**
 * El umbral de contraste con el que se decide si una mota es legible.
 *
 * Es el mismo 1,10 que S8d usó para el cruce de tinta y S13/S14 para el relevo
 * de partículas. Está acá, en el contrato, y no adentro del instrumento del
 * subagente, por una razón: la medición nueva tiene que ser COMPARABLE con la
 * vieja, y eso sólo vale si el umbral es el mismo. Un número remedido con otra
 * vara no refuta ni confirma nada.
 */
export const UMBRAL_DE_LEGIBILIDAD = 1.1

/**
 * Los dos números que la escena real tiene que volver a producir, con su
 * origen. **Son la línea de base, no el resultado**: el subagente los remide y
 * publica los suyos al lado.
 */
export const MEDIDO_CONTRA_EL_MARCADOR = {
  /** §7.11 · el salto de ambiente en el corte, en puntos sRGB sobre 255. */
  escalonDeExposicionPuntos: 0.39,
  /** §1.4 · última mota legible del intro, en segundos de la línea de tiempo. */
  ultimaDelIntroS: 4.166,
  /** §1.4 · primera mota legible de la escena, en segundos. */
  primeraDeLaEscenaS: 4.278,
  /** §1.4 · el margen entre las dos, en milisegundos. */
  margenMs: 112.4,
} as const
