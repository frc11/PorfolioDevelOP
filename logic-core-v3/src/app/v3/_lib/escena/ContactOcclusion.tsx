'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from './entorno'
import { sombraEn } from './entorno/sombra'
import { PULSO_VIVO, VIVO } from './entorno/vivo'
import { MANCHA_EN_EL_PISO } from './sombra/enElPiso'
import { SOMBRA_DEL_HAZ, manchasDelHaz } from './sombra/sombraDelHaz'
import { HAZ_ENCENDIDO } from './entorno/encendido'

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
  const duraRef = useRef<THREE.Mesh>(null)
  const duraMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const reposoRef = useRef<number | null>(null)
  const entorno = entornoDeLaEscena()
  const viva = entorno.sombraViva && logoGroupRef !== undefined
  // [ESCENA 6] 5c: la mancha según el haz, en el producto (`sombra/sombraDelHaz.ts`).
  const conElHaz = entorno.sombraHaz
  // [ESCENA 6] Con el piso vivo la mancha la pinta el piso (los bloques que suben taparían el plano).
  const enElPiso = entorno.pruebas.pisoVivo !== 'no'

  useFrame(() => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh || !material) return
    let escala = 1
    let opacidad = 1
    if (viva) {
      const logo = logoGroupRef?.current
      if (!logo) return
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
      escala = sombra.escala
      opacidad = sombra.opacidad
    }
    if (!viva && !conElHaz && !enElPiso) return
    // [ESCENA 6] Con 6e, la mancha dura sigue al encendido del haz (k es 1 sin la prueba).
    const haz = manchasDelHaz(VIVO.uNoche.value * HAZ_ENCENDIDO.k, conElHaz && entorno.E1)
    mesh.scale.set(escala * haz.escalaBlanda, escala * haz.escalaBlanda, 1)
    material.opacity = CONTACT_OPACITY * opacidad * haz.opacidadBlanda
    const opacidadDura = Math.min(1, CONTACT_OPACITY * opacidad * haz.opacidadDura)
    const dura = duraRef.current
    const duraMaterial = duraMaterialRef.current
    if (dura && duraMaterial) {
      dura.scale.set(escala * haz.escalaDura, escala * haz.escalaDura, 1)
      duraMaterial.opacity = opacidadDura
    }
    if (enElPiso) {
      MANCHA_EN_EL_PISO.uMancha.value.set(escala * haz.escalaBlanda, material.opacity, escala * haz.escalaDura, conElHaz ? opacidadDura : 0)
      mesh.visible = false
      if (dura) dura.visible = false
    }
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

  const spriteDuro = useMemo(() => {
    if (!conElHaz) return null
    const s = SOMBRA_DEL_HAZ.sprite
    const texture = new THREE.DataTexture(createContactSpriteData(CONTACT_SPRITE_SIZE, s.nucleo, s.caida), CONTACT_SPRITE_SIZE, CONTACT_SPRITE_SIZE, THREE.RGBAFormat)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [conElHaz])

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(() => () => sprite.dispose(), [sprite])
  useEffect(() => () => spriteDuro?.dispose(), [spriteDuro])

  return (
    <>
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
      {spriteDuro !== null && (
        <mesh ref={duraRef} position={[0, FLOOR_Y + CONTACT_LIFT + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
          <planeGeometry args={[CONTACT_WIDTH, CONTACT_DEPTH]} />
          <meshBasicMaterial ref={duraMaterialRef} map={spriteDuro} color={CONTACT_COLOR} transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}
