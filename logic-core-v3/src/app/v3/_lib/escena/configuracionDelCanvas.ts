import * as THREE from 'three'

import { AJUSTES } from './ajustes'
import { entornoDeLaEscena } from './entorno'
import { instalarElRuidoAzul } from './ruidoAzul'
import { instalarElTono } from './tono'
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
// [CALIDAD 1] B8: el dithering de los materiales, con ruido azul (`ruidoAzul.ts`). Antes de compilar la escena.
instalarElRuidoAzul()
// [ESCENA 10] T1 · el tono ACES compensado (`tono.ts`): también antes de compilar nada.
instalarElTono()

const COMUN = {
  /** Canvas opaco: el fondo lo pinta la escena, no el CSS de atrás. */
  alpha: false,
  powerPreference: 'high-performance' as const,
  /**
   * r3f pone ACES por default. Hasta ESCENA 9 fue Neutral (Khronos PBR Neutral):
   * conserva el blanco del papel y el matiz de la luz de color.
   *
   * [CALIDAD 1] B9 · ACES y AgX, MEDIDOS contra Neutral con la exposición
   * compensada (`scripts-calidad/b9-tono.ts`): ninguno dejaba los colores
   * canónicos en ΔE < 2 (ACES corría el piso 2,5–2,8).
   *
   * [ESCENA 10] T1 · el tono es ACES COMPENSADO (`tono.ts`, el `Custom` de three):
   * el color de ACES con la curva de brillo de Neutral. En un gris da Neutral
   * exacto; en un color, la cromaticidad de ACES. Lo eligió Valentino en ESCENA 9
   * (T3); lo que corre los blancos cálidos está en ESTADO-ESCENA §4, regla 10.
   */
  toneMapping: THREE.CustomToneMapping,
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

/**
 * [ESCENA 9] T3 · con la prueba del antialiasing, un contexto propio por nivel, fijo (se arma una vez por carga: las
 * banderas no cambian), SIN el antialias del lienzo: las muestras las pone el búfer del posproceso, y el lienzo sólo
 * recibe la copia final (con las suyas serían dos resoluciones de MSAA por cuadro).
 */
function sinMuestras(base: (typeof CONTEXTOS)[NivelDeCalidad]): (typeof CONTEXTOS)[NivelDeCalidad] {
  return { ...base, antialias: false }
}
const CONTEXTOS_CON_POSPROCESO: Readonly<Record<NivelDeCalidad, (typeof CONTEXTOS)[NivelDeCalidad]>> = { plena: sinMuestras(CONTEXTOS.plena), compacta: sinMuestras(CONTEXTOS.compacta) }
const CON_POSPROCESO = entornoDeLaEscena().pruebas.aa !== 'no'

export function contextoDe(nivel: NivelDeCalidad): (typeof CONTEXTOS)[NivelDeCalidad] {
  return CON_POSPROCESO ? CONTEXTOS_CON_POSPROCESO[nivel] : CONTEXTOS[nivel]
}

/**
 * ⚠️ **SE MUDÓ A `ajustes.ts` Y ACÁ QUEDA LA RE-EXPORTACIÓN.** El valor no
 * cambió —sigue siendo el techo de la regla del repo, `[1, 1.5]`, nunca 2 en
 * producción— y sigue habiendo UNA sola definición. Se mudó porque este archivo
 * importa `three` y `ajustes.ts` tiene que poder leerse sin arrastrarlo.
 */
export const DPR_DEL_CANVAS: [number, number] = AJUSTES.plena.dpr
