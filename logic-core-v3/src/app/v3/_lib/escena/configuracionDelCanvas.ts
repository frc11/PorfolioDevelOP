import * as THREE from 'three'

import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from './probeScene'
import { PROBE_DEFAULTS } from './probeStore'

/**
 * LA CONFIGURACIÓN DEL `<Canvas>` — sombras, cámara inicial, contexto y `dpr`.
 *
 * ⚠️ **NO ES CÓDIGO NUEVO NI UN VALOR NUEVO. SALIÓ DE `ProbeStage.tsx` EN B5,
 * VERBATIM**, con sus comentarios enteros. El motivo es aritmético y está
 * declarado: `ProbeStage.tsx` estaba en **300 líneas exactas** —el límite del
 * repo— y B5 tenía que agregarle los dos props de la fuente de eventos. La regla
 * dice que un archivo que pasa las 300 se parte; esto es la parte que se puede
 * sacar sin partir el árbol de JSX, porque es configuración y no composición.
 *
 * Los cuatro objetos se declaran a nivel de módulo y no adentro del componente:
 * son constantes, y crearlos en cada render le daría a `<Canvas>` una identidad
 * nueva por render para props que nunca cambian.
 */

/**
 * `PCFShadowMap` explícito, y NO el `PCFSoftShadowMap` que r3f pone con
 * `shadows` en `true`. Suena al revés y no lo es: en three 0.182 el "soft" no
 * tiene entrada en la tabla de defines del shader y compila como
 * `SHADOWMAP_TYPE_BASIC`, o sea una sola muestra sin filtrar. El PCF común es el
 * único que da un disco de muestreo, y su tamaño es `shadow.radius`. La cita del
 * código de three está en `SHADOW_RADIUS`.
 */
export const SOMBRAS_DEL_CANVAS = { type: THREE.PCFShadowMap } as const

/**
 * La posición inicial la pisa `OrbitRig` en el primer frame; se declara igual
 * para que el primer render no salga desde el origen.
 */
export const CAMARA_DEL_CANVAS = {
  fov: CAMERA_FOV,
  near: CAMERA_NEAR,
  far: CAMERA_FAR,
  position: [0, PROBE_DEFAULTS.height, PROBE_DEFAULTS.distance] as [number, number, number],
}

export const CONTEXTO_DEL_CANVAS = {
  /** Canvas opaco: el fondo lo pinta la escena, no el CSS de atrás. */
  alpha: false,
  /**
   * El hero lo tiene en false. Acá va en true a propósito: lo que se juzga son
   * los cantos de un objeto negro contra papel blanco, y sin antialias el
   * escalonado del borde se confunde con el objeto.
   */
  antialias: true,
  powerPreference: 'high-performance' as const,
  /**
   * r3f pone ACES por default. Neutral (Khronos PBR Neutral) conserva el blanco
   * del papel y mantiene el matiz de la luz de color al mover la temperatura.
   */
  toneMapping: THREE.NeutralToneMapping,
}

/** El techo de la regla del repo: `dpr={[1, 1.5]}` máximo, nunca 2 en producción. */
export const DPR_DEL_CANVAS: [number, number] = [1, 1.5]
