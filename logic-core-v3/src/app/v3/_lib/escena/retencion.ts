import { isSceneHeld, type IntroStage } from '@/components/layout/home-intro/introHandoff'

/**
 * ¿LA ESCENA TIENE QUE QUEDARSE QUIETA EN LA POSE INICIAL?
 *
 * Es el contrato de `home-intro/introHandoff.ts` (líneas 43-54) leído literal,
 * con sus dos mitades:
 *
 * - **`covering`** — la capa es opaca y tapa todo. Quieta en la pose 0,
 *   **siempre**: es la pose desde la que está proyectado el campo de partículas
 *   del preloader (§1.4 de `DIRECCION-ESCENA.md`), así que es la única que hace
 *   que las motas del intro caigan sobre los lugares donde reaparecen las de la
 *   escena.
 * - **`revealing`** — la capa se está desvaneciendo y la escena YA se ve. Sigue
 *   retenida **sólo si la entrada fue limpia**. Si el visitante scrolleó durante
 *   el intro, `introEnteredClean()` da `false` y la regla acordada es *"se ata
 *   al scroll donde esté y no fuerza nada"*: retenerla en la pose 0 sería
 *   clavarla donde no corresponde para después saltar a donde el scroll está.
 * - **`idle` / `clear`** — suelta. `idle` es además el caso de la visita
 *   repetida, del movimiento reducido y de la automatización: ahí el intro no
 *   corre y la escena hace lo suyo sin enterarse de nada.
 *
 * ── Por qué vive en su propio módulo ──────────────────────────────────────
 *
 * Para que el invariante la pueda correr contra las cuatro etapas **sin montar
 * el canvas**. Si estuviera adentro de `EscenaDelHome.tsx`, importarla
 * arrastraría `ProbeStage` y con él `three` y `@react-three/fiber` a un proceso
 * de Node que no tiene WebGL. Un predicado que sólo se puede probar levantando
 * media escena no se prueba.
 *
 * ⚠ **No decide nada nuevo.** Traduce el contrato a un booleano; la política de
 * `prefers-reduced-motion` no pasa por acá —vive adentro de `OrbitRig`— y la
 * pose 0 tampoco: la escribe `EscenaDelHome` cuando esto devuelve `true`.
 */
export function escenaRetenida(etapa: IntroStage, entradaLimpia: boolean): boolean {
  if (!isSceneHeld(etapa)) return false
  return etapa === 'covering' || entradaLimpia
}
