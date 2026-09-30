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
// [ESCENA 9] T3 · la prueba del tono (AgX o ACES compensados, `tono.ts`): también antes de compilar nada.
const TONO_DE_PRUEBA = instalarElTono(entornoDeLaEscena().pruebas.tono)

const COMUN = {
  /** Canvas opaco: el fondo lo pinta la escena, no el CSS de atrás. */
  alpha: false,
  powerPreference: 'high-performance' as const,
  /**
   * r3f pone ACES por default. Neutral (Khronos PBR Neutral) conserva el blanco
   * del papel y mantiene el matiz de la luz de color al mover la temperatura.
   *
   * [CALIDAD 1] B9 · ACES y AgX, MEDIDOS contra este, en los cinco momentos, con
   * la exposición compensada para igualar el piso (`scripts-calidad/b9-tono.ts`):
   * ninguno deja los colores canónicos en ΔE < 2 (CIEDE2000). ACES corre el piso
   * 2,5–2,8 y el cielo del hero 2,1; AgX no llega al blanco del piso ni con
   * exposición 4 y compensado queda en 3–4,3. Se queda Neutral. La salida es
   * sRGB y los materiales propios codifican su color a sRGB (lo verificó B9).
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

/** El contexto con las pruebas de esta carga (el tono y el antialias pueden cambiar; el resto es el de siempre). */
type ContextoConPruebas = Omit<(typeof CONTEXTOS)[NivelDeCalidad], 'toneMapping'> & { readonly toneMapping: THREE.ToneMapping }

/**
 * [ESCENA 9] T3 · con las pruebas, un contexto propio por nivel, fijo (se arma una vez por carga: las banderas no
 * cambian): el tono propio (`Custom`) con la prueba del tono, y SIN el antialias del lienzo con el posproceso (el bloom
 * o el antialiasing de prueba): ahí las muestras las pone su búfer, y el lienzo sólo recibe la copia final (con las suyas
 * serían dos resoluciones de MSAA por cuadro).
 */
function conPruebas(base: (typeof CONTEXTOS)[NivelDeCalidad]): ContextoConPruebas {
  const { pruebas } = entornoDeLaEscena()
  const posproceso = pruebas.bloom || pruebas.aa !== 'no'
  return { ...base, toneMapping: TONO_DE_PRUEBA ? THREE.CustomToneMapping : base.toneMapping, antialias: posproceso ? false : base.antialias }
}
const CONTEXTOS_CON_PRUEBAS: Readonly<Record<NivelDeCalidad, ContextoConPruebas>> = { plena: conPruebas(CONTEXTOS.plena), compacta: conPruebas(CONTEXTOS.compacta) }
const HAY_PRUEBAS_DEL_CONTEXTO = TONO_DE_PRUEBA || entornoDeLaEscena().pruebas.bloom || entornoDeLaEscena().pruebas.aa !== 'no'

export function contextoDe(nivel: NivelDeCalidad): ContextoConPruebas {
  return HAY_PRUEBAS_DEL_CONTEXTO ? CONTEXTOS_CON_PRUEBAS[nivel] : CONTEXTOS[nivel]
}

/**
 * ⚠️ **SE MUDÓ A `ajustes.ts` Y ACÁ QUEDA LA RE-EXPORTACIÓN.** El valor no
 * cambió —sigue siendo el techo de la regla del repo, `[1, 1.5]`, nunca 2 en
 * producción— y sigue habiendo UNA sola definición. Se mudó porque este archivo
 * importa `three` y `ajustes.ts` tiene que poder leerse sin arrastrarlo.
 */
export const DPR_DEL_CANVAS: [number, number] = AJUSTES.plena.dpr
