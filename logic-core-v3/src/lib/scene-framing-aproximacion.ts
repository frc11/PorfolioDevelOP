/**
 * EL CONTROL NEGATIVO DEL DESTINO — que la proyección real NO es la
 * aproximación lineal, y por qué.
 *
 * Sale de `scene-framing.invariant.ts` en V3-E, cuando la reescritura de sus dos
 * umbrales lo cruzó las 300 líneas del repo. El corte es el mismo que ya usa
 * `scene-encuadre-deuda.ts`, y por la misma razón: el invariante de al lado
 * verifica que el DESTINO sea correcto; esto verifica que la fórmula fácil que
 * alguien podría poner en su lugar NO lo produce.
 *
 * Recibe el arnés del invariante en vez de traer el suyo: dos contadores de
 * comprobaciones sobre el mismo archivo darían dos resúmenes y ninguno sería el
 * del archivo.
 */

import { CAMERA_FOV } from '@/app/v3/_lib/escena/probeScene'
import { recorridoDeEncuadre } from '@/app/v3/_lib/escena/encuadre'
import { SCENE_LOGO_MESH_WORLD } from '@/lib/scene-camera'
import type { ArnesDeComprobacion } from '@/lib/scene-encuadre-deuda'
import { SCENE_ENTRY_POSE, type SceneFrame, frameScenePose } from '@/lib/scene-framing'

export function afirmarElControlNegativo(
  { check, section }: ArnesDeComprobacion,
  desktop: SceneFrame | null,
): void {
  section('6 · Control negativo: la proyección no es la aproximación lineal')

  /**
   * La aproximación que S8 usaba —`frameX × travel / halfWidth`— ignora que el
   * `lookAt` con el target corrido ROTA la cámara. Si algún día alguien la
   * "simplifica" así, el logo aterriza en otro lado.
   *
   * ⚠️ **S9 tuvo que cambiarle la métrica a este control.** Con la pose vieja el
   * error se repartía 5 px en X y 61 px en Y; con la de S9 —`frameX` 0,68 en vez
   * de 0,90 y una elevación de 18,6° en vez de 31,0°— la componente HORIZONTAL
   * cae a 0,9 px y deja de discriminar. La vertical sigue, así que el control se
   * mide sobre el desplazamiento total y no sobre uno de sus ejes.
   *
   * ⚠️ **Y V3-E LE SACÓ LOS DOS UMBRALES, que era lo que quedaba mal.** Con
   * `frameX` en 0,5 el error total baja de 22,8 a **12,5 px** y los umbrales
   * escritos —`> 15` y `> 20`— se ponían en rojo. Bajarlos a 8 los habría
   * aflojado: son cifras que describían una pose, no la propiedad.
   *
   * Lo que se afirma ahora es **el mecanismo**, y no tiene número arbitrario: la
   * aproximación lineal **no tiene término en Y por construcción**, así que pone
   * el centro en el medio exacto de la pantalla; la proyección real sólo puede
   * caer ahí si la elevación de entrada es CERO. Y el control positivo lo
   * demuestra con la misma función: con `height: 0` la proyección real da
   * **405,0000 exacto**. El umbral desapareció porque la propiedad lo reemplaza.
   */
  if (desktop) {
    // ⚠ SITIO-S12: esta era la QUINTA escritura de `travelX` (§7.44), con `35` y
    // `0.88` a mano. Ahora consume `recorridoDeEncuadre` y los dos tokens de
    // `probeScene`, y el número NO se mueve: a 1440×810 el argumento es positivo
    // (halfW 11,238 contra m/2 3,432), así que `abs` y `max(0, ·)` dan el mismo bit.
    const TAN = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)
    const eye = Math.hypot(SCENE_ENTRY_POSE.distance, SCENE_ENTRY_POSE.height)
    const halfW = TAN * eye * (1440 / 810)
    const travelX = recorridoDeEncuadre(halfW, SCENE_LOGO_MESH_WORLD.width)
    const approxX = (0.5 + (SCENE_ENTRY_POSE.frameX * travelX) / halfW / 2) * 1440
    // La aproximación lineal no mueve el centro en Y: se queda en el medio de la
    // pantalla. La proyección real sí, y por eso el error total es sobre todo
    // vertical.
    const error = Math.hypot(desktop.centerXPx - approxX, desktop.centerYPx - 405)
    const desvioY = Math.abs(desktop.centerYPx - 405)
    check(
      'la proyección real NO coincide con la aproximación lineal',
      error > 0,
      `${error.toFixed(1)}px de error total · ${Math.abs(desktop.centerXPx - approxX).toFixed(1)} en X, ${desvioY.toFixed(1)} en Y`
    )
    check(
      'y el grueso del error es el corrimiento vertical que la aproximación no ve',
      desvioY > Math.abs(desktop.centerXPx - approxX),
      `real y = ${desktop.centerYPx.toFixed(1)} contra el centro de pantalla 405 — ${(desvioY / error * 100).toFixed(1)}% del error total`
    )
    /**
     * ⚠ **EL CONTROL QUE HACE QUE LOS DOS DE ARRIBA SIGNIFIQUEN ALGO.** Sin él,
     * «no coinciden» lo cumpliría también una proyección rota que devolviera
     * cualquier cosa. Se corre la MISMA función con la elevación en cero —única
     * condición bajo la cual la aproximación lineal puede ser exacta en Y— y ahí
     * la proyección real cae en el medio de la pantalla al bit.
     */
    const sinElevacion = frameScenePose({ ...SCENE_ENTRY_POSE, height: 0 }, 1440, 810)
    check(
      'control positivo — con la elevación en CERO la proyección real SÍ cae en el medio: el desvío es la elevación, no ruido',
      sinElevacion !== null && Math.abs(sinElevacion.centerYPx - 405) < 1e-9,
      sinElevacion === null
        ? 'no hay proyección'
        : `${sinElevacion.centerYPx.toFixed(4)} con altura 0 contra ${desktop.centerYPx.toFixed(4)} con la altura viva (${SCENE_ENTRY_POSE.height})`
    )
  }
}
