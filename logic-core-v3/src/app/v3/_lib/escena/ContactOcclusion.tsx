'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from './entorno'
import { sombraEn } from './entorno/sombra'
import { PULSO_VIVO, VIVO } from './entorno/vivo'

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
import { createContactSpriteData } from './particleTextures'

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
/**
 * [ESCENA 3] LA SOMBRA CON FÍSICA. Con `logoGroupRef`, la mancha acompaña la altura REAL del punto
 * más bajo del logo (si sube, más chica y más tenue; si baja, más grande y más marcada) y se contrae
 * apenas con cada pulso principal. Las cuentas son puras y están en `entorno/sombra.ts`. En reposo
 * vale exactamente escala 1 y la opacidad de siempre: la altura se compara contra la de reposo,
 * medida UNA vez sobre la geometría y sin la vira.
 */
type ContactOcclusionProps = {
  readonly logoGroupRef?: RefObject<THREE.Group | null>
}

const CAJA = new THREE.Box3()

/** Cuánto flota el punto más bajo del logo sobre el papel, o `null` si todavía no cargó. */
function alturaDelLogo(logo: THREE.Object3D): number | null {
  CAJA.setFromObject(logo)
  return CAJA.isEmpty() ? null : CAJA.min.y - FLOOR_Y
}

export function ContactOcclusion({ logoGroupRef }: ContactOcclusionProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const reposoRef = useRef<number | null>(null)
  const viva = entornoDeLaEscena().sombraViva && logoGroupRef !== undefined

  useFrame(() => {
    if (!viva) return
    const logo = logoGroupRef?.current
    const mesh = meshRef.current
    const material = materialRef.current
    if (!logo || !mesh || !material) return
    if (reposoRef.current === null) {
      // La altura de reposo, sin la vira: se saca el giro un instante para medir y se devuelve.
      const giro = logo.rotation.clone()
      logo.rotation.set(0, 0, 0)
      logo.updateMatrixWorld(true)
      reposoRef.current = alturaDelLogo(logo)
      logo.rotation.copy(giro)
      logo.updateMatrixWorld(true)
      if (reposoRef.current === null) return
    }
    const altura = alturaDelLogo(logo)
    if (altura === null) return
    const sombra = sombraEn(altura, reposoRef.current, VIVO.uTiempo.value - PULSO_VIVO.ultimoPrincipal)
    mesh.scale.set(sombra.escala, sombra.escala, 1)
    material.opacity = CONTACT_OPACITY * sombra.opacidad
  })

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
      ref={meshRef}
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
        ref={materialRef}
        map={sprite}
        color={CONTACT_COLOR}
        transparent
        opacity={CONTACT_OPACITY}
        depthWrite={false}
      />
    </mesh>
  )
}
