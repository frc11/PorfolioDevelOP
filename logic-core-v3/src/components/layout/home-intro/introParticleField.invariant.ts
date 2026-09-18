import { check, report, section } from './introChecks'
import { readSource } from './introParticleProbe'

/**
 * COMPROBACIÓN ESTÁTICA — dónde cuelga la capa de partículas y qué pasa con
 * `prefers-reduced-motion`. La geometría del acomodamiento (destino, curva,
 * dirección del viaje) era composición y se desarmó (Modo pulido).
 */

// ── 3 · Dónde cuelga la capa, y `prefers-reduced-motion` ───────────────────

section('3 · Movimiento reducido: las partículas no existen, y por dónde cuelgan')

/**
 * **No hay nada nuevo que definir, y ésa es la respuesta.** El intro entero se
 * saltea con movimiento reducido —doble guard: el script pre-paint y el
 * componente—, y las partículas viven ADENTRO de `IntroOverlay`, así que no
 * tienen camino a montarse. Lo que se verifica es exactamente eso.
 */
const OVERLAY_SRC = readSource('src/components/layout/home-intro/IntroOverlay.tsx')
const HOME_SRC = readSource('src/components/layout/HomeIntro.tsx')
const BOOT_SRC = readSource('src/components/layout/home-intro/introBoot.tsx')

check(
  'la capa de partículas cuelga del overlay, y de ningún otro lado',
  OVERLAY_SRC.includes('<IntroParticleCanvas') &&
    !HOME_SRC.includes('IntroParticleCanvas') &&
    !BOOT_SRC.includes('IntroParticleCanvas')
)
check(
  'y el overlay solo se monta mientras el intro corre',
  HOME_SRC.includes("state !== 'finished' && (") && HOME_SRC.includes('<IntroOverlay')
)
check(
  'el guard de movimiento reducido del componente sigue puesto',
  HOME_SRC.includes('introWasArmed() && !prefersReducedMotion')
)
check(
  'y el del script pre-paint también',
  BOOT_SRC.includes("matchMedia('(prefers-reduced-motion: reduce)')"),
  'doble guard, como desde S8'
)
/** Control positivo: los cuatro pasarían igual si el `grep` leyera el vacío. */
check(
  'control positivo — los tres archivos se leyeron de verdad',
  OVERLAY_SRC.includes('IntroLockup') &&
    HOME_SRC.includes('useIntroEngine') &&
    BOOT_SRC.includes('navigator.webdriver'),
  `${OVERLAY_SRC.length} + ${HOME_SRC.length} + ${BOOT_SRC.length} bytes leídos`
)

/**
 * Y la capa va DEBAJO del lockup, que es lo que hace que la marca las tape en
 * todo instante y sin discontinuidad — primero el SVG relleno, después el mesh.
 * Se verifica por posición en el archivo, que es donde el orden vive.
 */
check(
  'la capa va debajo del lockup y del mesh, no encima',
  OVERLAY_SRC.indexOf('<IntroParticleCanvas') < OVERLAY_SRC.indexOf('<IntroLockup') &&
    OVERLAY_SRC.indexOf('<IntroParticleCanvas') < OVERLAY_SRC.indexOf('<IntroLogo3D'),
  'la marca las ocluye en todo instante, igual que en la escena'
)
check(
  'y por encima del velo, que es contra lo que se recortan',
  OVERLAY_SRC.indexOf('bg-ds-void') < OVERLAY_SRC.indexOf('<IntroParticleCanvas'),
  'son de tinta, no de luz'
)

report('introParticleField')
