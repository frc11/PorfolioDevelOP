/**
 * Tokens compartidos de la animación de "revelado del chrome": la barra de
 * navegación (`Navbar`) y el widget de chat (`LogicCompanion`) cuelgan ambos de
 * `useChromeRevealed()` y deben aparecer JUNTOS con el MISMO fade + slide.
 * Fuente única para que queden en lockstep — se cambia acá, se mueven los dos.
 *
 * El consumidor era `DynamicDock` hasta B2-S2, cuando el dock flotante inferior
 * se reemplazó por la barra superior. El offset se sigue aplicando en el eje Y,
 * pero con el signo invertido: la barra baja desde arriba, el dock subía desde
 * abajo.
 *
 * GPU-friendly: los consumidores animan `opacity` + un transform/`translate`
 * (nunca width/height). La barra lo aplica vía Framer (`y` + `opacity`); el widget
 * vía un keyframe CSS (`translate` + `opacity`, robusto al paint pesado del
 * arranque). Cada consumidor respeta `prefers-reduced-motion` (sin slide / dur 0).
 *
 * Valores (old → new):
 *   - offset:   dock 80px / widget 14px → 40px (compartido; widget mucho más visible)
 *   - duración: dock 500ms / widget 600ms → 900ms (más lento, más visible)
 *   - easing:   dock [0.22,1,0.36,1] / widget cubic-bezier(.25,.46,.45,.94) → [0.22,1,0.36,1]
 */
export const CHROME_REVEAL_OFFSET_PX = 40
export const CHROME_REVEAL_DURATION_MS = 900
export const CHROME_REVEAL_DURATION_S = CHROME_REVEAL_DURATION_MS / 1000
// Expo-out: arranque rápido, asentado largo y suave — se ve claro sin sentirse lento.
export const CHROME_REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const CHROME_REVEAL_EASE_CSS = `cubic-bezier(${CHROME_REVEAL_EASE[0]}, ${CHROME_REVEAL_EASE[1]}, ${CHROME_REVEAL_EASE[2]}, ${CHROME_REVEAL_EASE[3]})`
