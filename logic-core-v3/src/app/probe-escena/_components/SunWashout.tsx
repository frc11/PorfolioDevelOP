'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  SUN_CORE,
  SUN_SPRITE_RADIUS,
  SUN_WASHOUT_FALLOFF,
  SUN_WASHOUT_ORDER,
  SUN_WASHOUT_SCALE,
  SUN_WASHOUT_SPRITE_SIZE,
  createWashoutSpriteData,
} from './probeSun'

/**
 * EL WASHOUT DEL SOL — el disco que apaga la trama donde el sol pasa.
 *
 * Un `<sprite>` más, hermano de `SunBody`: **no decide dónde está**, su posición
 * y su opacidad las escribe `applyLightRig` sobre el mismo eje del sol, en el
 * mismo frame. El porqué y los números están en `probeSun.ts`.
 *
 * ── Las tres decisiones de material ────────────────────────────────────────
 *
 * 1. **`AdditiveBlending`.** Es lo que lo hace un glare y no una calcomanía: suma
 *    luz sobre lo que hay detrás, así que la trama se apaga por saturación y no
 *    porque se la tape con un color inventado que habría que hacer coincidir con
 *    el fondo. Y como suma, apagarlo es bajar su opacidad a cero: no deja rastro.
 *
 * 2. **`toneMapped: false`**, igual que el cuerpo del sol. Si pasara por
 *    `NeutralToneMapping` la suma quedaría comprimida contra el techo del papel y
 *    el glare no llegaría a saturar nada.
 *
 * 3. **`depthWrite: false`, `depthTest: true`.** Lo tapa lo que esté delante,
 *    pero no recorta a nada. El orden contra la envolvente y contra el cuerpo del
 *    sol lo fija `renderOrder` y no la distancia — ver la nota de `probeMoire.ts`
 *    sobre cómo ordena three los transparentes.
 *
 * ── Por qué su radio se mide contra el NÚCLEO y no contra el halo ──────────
 *
 * Adentro del núcleo el sol ya tapa la trama por sí solo: su alfa es 1. El
 * trabajo de este disco es el **anillo de afuera**, donde el halo del sol cae de
 * 0,5 a 0 y la trama vuelve a asomar. Por eso se dimensiona en múltiplos del
 * núcleo (2,2×) y no del sprite entero: un washout del tamaño del halo lavaría
 * el 117% del alto del cuadro.
 */
export const SunWashout = forwardRef<THREE.Sprite>(function SunWashout(_props, ref) {
  const sprite = useMemo(() => {
    const texture = new THREE.DataTexture(
      createWashoutSpriteData(SUN_WASHOUT_SPRITE_SIZE, SUN_WASHOUT_FALLOFF),
      SUN_WASHOUT_SPRITE_SIZE,
      SUN_WASHOUT_SPRITE_SIZE,
      THREE.RGBAFormat
    )
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [])

  // r3f solo libera lo que declara el JSX; ésta la creó `useMemo`.
  useEffect(() => () => sprite.dispose(), [sprite])

  const diameter = SUN_SPRITE_RADIUS * SUN_CORE * SUN_WASHOUT_SCALE * 2

  return (
    <sprite ref={ref} scale={[diameter, diameter, 1]} renderOrder={SUN_WASHOUT_ORDER}>
      <spriteMaterial
        map={sprite}
        color="#FFFFFF"
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
})
