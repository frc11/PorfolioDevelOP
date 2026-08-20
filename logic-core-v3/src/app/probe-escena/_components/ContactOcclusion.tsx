'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  CONTACT_COLOR,
  CONTACT_CORE,
  CONTACT_DEPTH,
  CONTACT_FALLOFF,
  CONTACT_LIFT,
  CONTACT_OPACITY,
  CONTACT_SPRITE_SIZE,
  CONTACT_WIDTH,
} from './probeAtmosphere'
import { FLOOR_Y } from './probeScene'
import { createContactSpriteData } from './probeParticles'

/**
 * LA OCLUSIÓN DE CONTACTO — la mancha que hace que el logo pertenezca al piso.
 *
 * La sombra proyectada dice de dónde viene la luz. Esto dice otra cosa, y es la
 * que faltaba: que hay un objeto **apoyado ahí**. Es la luz ambiente que no
 * llega a la rendija entre la pieza y el papel, así que es más densa, más
 * cerrada y no tiene dirección — se queda debajo del objeto mientras la sombra
 * proyectada se va en diagonal.
 *
 * Los números y el porqué de cada uno están en `probeLighting.ts`.
 *
 * ── Un plano y una textura, y nada por frame ───────────────────────────────
 *
 * Un draw call, dos triángulos y una máscara de 96² que se calcula una vez al
 * montar. La alternativa de biblioteca (`<ContactShadows>` de drei) renderiza la
 * escena desde abajo a una textura **en cada cuadro**, o sea una pasada de
 * render completa más, para un efecto que acá es una mancha fija debajo de un
 * objeto fijo.
 *
 * ── Por qué la opacidad NO sigue al arco de luz ────────────────────────────
 *
 * Podría parecer que al apagarse la sala la oclusión tiene que apagarse con
 * ella, o quedaría como lo más oscuro del cuadro. No hace falta, y la razón es
 * la mezcla: alfa constante sobre un fondo que se oscurece **conserva la
 * proporción** (`dst × (1 − a)` con `a` fijo es siempre la misma fracción del
 * piso). La oclusión ya se apaga sola, exactamente al ritmo del piso sobre el
 * que está. Un canal más en el loop para reproducir lo que la mezcla hace gratis
 * sería costo sin efecto.
 *
 * ── `renderOrder` ──────────────────────────────────────────────────────────
 *
 * Va primero entre los transparentes, antes que los dos campos de partículas:
 * una partícula que pase por delante tiene que quedar POR ENCIMA de la mancha,
 * no oscurecida por ella. Los tres tienen `depthWrite` apagado, así que el orden
 * es lo único que lo decide.
 */
export function ContactOcclusion() {
  const sprite = useMemo(() => {
    const texture = new THREE.DataTexture(
      createContactSpriteData(CONTACT_SPRITE_SIZE, CONTACT_CORE, CONTACT_FALLOFF),
      CONTACT_SPRITE_SIZE,
      CONTACT_SPRITE_SIZE,
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
    <mesh
      // Acostado mirando hacia arriba, y apoyado apenas por encima de las
      // marcas de piso (que suben hasta 0,012 desde el papel) para que también
      // las oscurezca: una oclusión que no toca lo que está debajo del objeto no
      // es una oclusión, es una calcomanía.
      position={[0, FLOOR_Y + CONTACT_LIFT, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={-1}
    >
      <planeGeometry args={[CONTACT_WIDTH, CONTACT_DEPTH]} />
      {/*
        `basic` y no `standard`: esto no es una superficie iluminada, es una
        modulación de lo que hay debajo. Un material que respondiera a las luces
        estaría calculando el sombreado de una mancha negra.

        El mapa aporta SOLO la forma: sus canales de color son blancos, así que
        el tono lo pone `color` y la densidad el alfa por `opacity`.
      */}
      <meshBasicMaterial
        map={sprite}
        color={CONTACT_COLOR}
        transparent
        opacity={CONTACT_OPACITY}
        depthWrite={false}
      />
    </mesh>
  )
}
