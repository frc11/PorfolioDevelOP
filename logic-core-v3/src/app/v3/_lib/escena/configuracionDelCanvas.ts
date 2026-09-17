import * as THREE from 'three'

import { AJUSTES } from './ajustes'
import type { NivelDeCalidad } from './calidad'
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

/**
 * EL CONTEXTO, UNO POR NIVEL DE CALIDAD.
 *
 * ⚠️ **Son DOS objetos congelados a nivel de módulo y no uno armado en el
 * render, y es por la misma razón que el docblock de arriba da para los otros
 * tres**: `<Canvas>` recibe `gl` como prop, y un objeto nuevo por render le
 * daría una identidad nueva a algo que nunca cambia. Con la tabla de niveles
 * indexada, `contextoDe` devuelve siempre la MISMA referencia para el mismo
 * nivel.
 *
 * Lo único que difiere entre los dos es `antialias`; el resto es idéntico y se
 * escribe una vez en `COMUN`.
 */
const COMUN = {
  /** Canvas opaco: el fondo lo pinta la escena, no el CSS de atrás. */
  alpha: false,
  powerPreference: 'high-performance' as const,
  /**
   * r3f pone ACES por default. Neutral (Khronos PBR Neutral) conserva el blanco
   * del papel y mantiene el matiz de la luz de color al mover la temperatura.
   */
  toneMapping: THREE.NeutralToneMapping,
} as const

/**
 * El hero lo tiene en false. En `plena` va en true a propósito: lo que se juzga
 * son los cantos de un objeto negro contra papel blanco, y sin antialias el
 * escalonado del borde se confunde con el objeto. Lo que `compacta` hace con
 * ese true lo decide `ajustes.ts`, con su medición.
 */
const CONTEXTOS: Readonly<Record<NivelDeCalidad, typeof COMUN & { readonly antialias: boolean }>> = {
  plena: { ...COMUN, antialias: AJUSTES.plena.antialias },
  compacta: { ...COMUN, antialias: AJUSTES.compacta.antialias },
}

export function contextoDe(nivel: NivelDeCalidad): (typeof CONTEXTOS)[NivelDeCalidad] {
  return CONTEXTOS[nivel]
}

/**
 * ⚠️ **SE MUDÓ A `ajustes.ts` Y ACÁ QUEDA LA RE-EXPORTACIÓN.** El valor no
 * cambió —sigue siendo el techo de la regla del repo, `[1, 1.5]`, nunca 2 en
 * producción— y sigue habiendo UNA sola definición. Se mudó porque este archivo
 * importa `three` y `ajustes.ts` tiene que poder leerse sin arrastrarlo.
 */
export const DPR_DEL_CANVAS: [number, number] = AJUSTES.plena.dpr
