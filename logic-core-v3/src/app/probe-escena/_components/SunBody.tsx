'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  SUN_BODY_ORDER,
  SUN_COLOR,
  SUN_CORE,
  SUN_GLOW_FALLOFF,
  SUN_GLOW_OPACITY,
  SUN_SPRITE_RADIUS,
  SUN_SPRITE_SIZE,
  createSunSpriteData,
} from './probeSun'

/**
 * EL CUERPO DEL SOL.
 *
 * Un `<sprite>` y nada más. **No decide dónde está**: su posición y su opacidad
 * las escribe `applyLightRig` en cada frame, sobre la misma dirección con la que
 * coloca la luz principal (ver `probeSun.ts` y `LIGHT_ARC`).
 *
 * ── Por qué un sprite y no una malla ───────────────────────────────────────
 *
 * Un sol tiene que mirar siempre a la cámara. `THREE.Sprite` lo hace **en el
 * vertex shader**, con el `modelViewMatrix` que ya está subido: cero trabajo por
 * frame del lado de JS y cero código de orientación en el loop. Una malla con
 * `lookAt` sería una llamada más por cuadro para conseguir exactamente lo mismo.
 *
 * ── Las tres decisiones de material ────────────────────────────────────────
 *
 * 1. **`toneMapped: false`.** Es la única superficie de la escena que se salta
 *    el tone mapping, y es la razón por la que se ve. `NeutralToneMapping`
 *    comprime todo lo que pasa de 0,76 en lineal, así que el papel a luz plena
 *    ya sale en 248/255; una fuente que pasara por la misma curva quedaría
 *    indistinguible del piso. Sin tone mapping el sol es exactamente 255 — el
 *    píxel más claro que este canvas puede producir.
 *
 * 2. **Con niebla** (el default del material). El sol está a unas 40 unidades
 *    de la cámara, o sea dentro del rango donde la niebla ya trabaja: se vela
 *    un poco y, sobre todo, **se apaga con ella** cuando la sala se oscurece,
 *    porque el color de la niebla sigue al arco.
 *
 * 3. **`depthWrite: false`, `depthTest: true`.** Lo tapa lo opaco que se le
 *    cruce —el logo y el piso—, pero no recorta a las partículas que pasen por
 *    delante.
 *
 *    ⚠️ **Y el orden entre transparentes NO lo resuelve la distancia**, que es lo
 *    que este mismo comentario afirmaba hasta S10 y era falso: three ordena por
 *    la posición del OBJETO, y la envolvente está centrada en el origen, así que
 *    su distancia es la de la cámara (9 a 27) contra los 34 del sol — o sea que
 *    **la envolvente se dibujaba ENCIMA del sol**. Lo fija `renderOrder`, que
 *    tiene prioridad sobre la distancia. Ver la nota de `probeMoire.ts`.
 *
 * ── Lo que NO hace ─────────────────────────────────────────────────────────
 *
 * No proyecta sombra ni ilumina: de eso se encarga la `directionalLight` que
 * está sobre su mismo eje. Este objeto es solo el cuerpo.
 */
export const SunBody = forwardRef<THREE.Sprite>(function SunBody(_props, ref) {
  const sprite = useMemo(() => {
    const texture = new THREE.DataTexture(
      createSunSpriteData(SUN_SPRITE_SIZE, SUN_CORE, SUN_GLOW_OPACITY, SUN_GLOW_FALLOFF),
      SUN_SPRITE_SIZE,
      SUN_SPRITE_SIZE,
      THREE.RGBAFormat
    )
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [])

  // r3f solo libera lo que declara el JSX; ésta la creó `useMemo`.
  useEffect(() => () => sprite.dispose(), [sprite])

  return (
    <sprite
      ref={ref}
      scale={[SUN_SPRITE_RADIUS * 2, SUN_SPRITE_RADIUS * 2, 1]}
      renderOrder={SUN_BODY_ORDER}
    >
      <spriteMaterial
        map={sprite}
        color={SUN_COLOR}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
})
