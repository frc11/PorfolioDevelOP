import {
  FILL_INTENSITY,
  HEMI_INTENSITY,
  KEY_INTENSITY,
} from '@/app/v3/_lib/escena/probeLighting'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'

import { INTRO_SHADOW } from './introTimeline'

/**
 * EL RIG DEL INTRO — cuánta luz tiene el logo en cada instante del acomodamiento.
 *
 * Salió de `introShading.ts` en S13, y **la mudanza es la mitad importante de
 * este archivo** — ver abajo. Allá quedó el color (que lo consume el bundle de
 * la primera visita); acá está la luz, que solo existe cuando el canvas 3D
 * existe.
 *
 * De dibujo a objeto, con una sola perilla — y esa perilla es el progreso del
 * **acomodamiento**, así que la transición ocurre exactamente durante el gesto
 * final, ni antes ni después. En `reveal` 0 las tres intensidades valen cero y
 * no hay sombra: por eso el logo se lee plano **por construcción y no por
 * calibración**, que es lo que conserva el arreglo del especular de S8c
 * (iluminar de frente pone `dotNH = 1` sobre toda la cara —el pico del lóbulo
 * GGX— y con `INK_ROUGHNESS` en 0,34 la cara salía en #D9D9D9).
 *
 * Falta el contraluz, que en la escena es solidario a la cámara y necesita la
 * órbita — anotado, no olvidado.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * S13 · EL ESCALÓN DE EXPOSICIÓN DE §7.11, RESUELTO — Y POR QUÉ SE RESOLVIÓ
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Hasta S12 el intro terminaba con el ambiente en `HEMI_INTENSITY` exacto y la
 * escena arrancaba en `HEMI_INTENSITY × celosiaSkyFactor(CELOSIA_BAR)` = ×0,6743:
 * **−32,6% de ambiente en un corte**, el único frame del sitio donde las dos
 * escenas se tocan. Acá el hemisférico lleva ese mismo factor, así que el intro
 * termina en el ambiente con el que la escena empieza. **Una constante
 * compartida, no dos** — las tres intensidades y el factor entran importados y
 * no hay un solo literal.
 *
 * ── ⚠ §7.11 SOBREESTIMABA EL ESCALÓN, y conviene que quede escrito ─────────
 *
 * Los **−18,2 puntos en el papel en sombra** y los **−15 en el valor medio del
 * cuadro** son sobre el piso y sobre el cuadro **de la escena**, y el intro no
 * renderiza ninguna de las dos cosas: no tiene papel, y su plano de sombra es un
 * `ShadowMaterial`, que oscurece lo que hay detrás en vez de recibir luz. La
 * ÚNICA superficie iluminada del intro es el logo, y ahí la tinta `#0F0F0F`
 * queda tan abajo que el toe del tone map la aplasta:
 *
 *     cara frontal    1,68 → 1,28   (−0,39 puntos sRGB)
 *     canto superior  1,34 → 1,01   (−0,33)
 *     canto inferior  0,70 → 0,44   (−0,25)
 *
 * **Cuatro décimas de un byte.** Medido en `introParticles.invariant.ts`, con el
 * mismo instrumento que reproduce los 249,4 / 236,9 / 248,3 / 218,7 de S11.
 *
 * ── Entonces por qué se resolvió igual ─────────────────────────────────────
 *
 * 🔴 **No por los 0,39 puntos: por la mudanza.** Traer el factor de cielo
 * obliga a importar `probeCelosia.ts`, que arrastra `celosiaGeometry`,
 * `celosiaPenumbra`, `moireTextures` y `probeMoire` —**5 módulos, 10,6 KiB de
 * código**— y corre una integral de hemisferio de 24.000 muestras al cargar el
 * módulo: **1,54 ms**. Hacerlo en `introShading.ts` habría puesto todo eso en el
 * bundle de la PRIMERA visita, que es exactamente la visita en la que el
 * preloader corre.
 *
 * Poniéndolo acá, esa cadena cae en el chunk diferido de `three` (~903 KiB, ahí
 * es ruido) y **`probeLighting.ts` sale del grafo de primera carga**, porque era
 * `introShading.ts` quien lo arrastraba y ya no lo necesita. El escalón es el
 * pretexto; el peso ahorrado en la visita del preloader es el premio.
 *
 * ⚠ **La `key` y el `fill` no tenían escalón**, y eso depende de un dato del
 * arco: el nivel de `LIGHT_ARC` en p=0 vale 1, así que `KEY_INTENSITY × level`
 * es `KEY_INTENSITY`. `introShading.invariant.ts` lo verifica en vez de
 * suponerlo — si alguna vez el hero deja de estar a luz plena, aparecen dos
 * escalones más y hay que volver acá.
 *
 *     npx tsx src/components/layout/home-intro/introShading.invariant.ts
 */

/**
 * Cuánto del hemisférico llega con la celosía rodeando la sala. Es el mismo
 * número que `applyLightRig` le escribe a la luz de la escena, leído de la misma
 * función: si mañana cambian los radios o la barra, los dos se mueven juntos.
 */
export const INTRO_SKY_FACTOR = celosiaSkyFactor(CELOSIA_BAR)

export type IntroInkShading = {
  /** Cuánta emisiva plana queda. 1 = dibujo sin luz · 0 = objeto iluminado. */
  readonly emissiveMix: number
  readonly keyIntensity: number
  readonly fillIntensity: number
  readonly hemiIntensity: number
  /** Opacidad del plano que recibe la sombra. */
  readonly shadowOpacity: number
}

/**
 * Las tres intensidades son las **de la escena** (`probeLighting.ts` × el factor
 * de cielo de `probeCelosia.ts`), no inventadas acá: cuando el logo termina de
 * acomodarse tiene que estar iluminado como va a estarlo un segundo después.
 */
export function sampleInkShading(reveal: number): IntroInkShading {
  const t = Math.min(1, Math.max(0, reveal))
  return {
    emissiveMix: 1 - t,
    keyIntensity: KEY_INTENSITY * t,
    fillIntensity: FILL_INTENSITY * t,
    hemiIntensity: HEMI_INTENSITY * INTRO_SKY_FACTOR * t,
    shadowOpacity: INTRO_SHADOW.opacity * t,
  }
}
