import * as THREE from 'three'

import { CORRIMIENTO_DE_LA_COLUMNA_2, disposicionDeLaPagina } from '../pie3d/disposicion'
import { PROGRESO_DEL_PIE } from '../pie3d/registro'
import { BANDA_EN_VIVO, factorDeLaBanda, fovConFactor } from './banda'
import { CAMERA_FOV } from './probeScene'

/**
 * [PULIDO 10] EL CAMPO DE VISIÓN DE LA CÁMARA VIVA, en cada cuadro (lo llama `OrbitRig`; salió de ahí para que el rig no engorde):
 *
 *   · J1 · la banda portátil (`banda.ts`): el campo de visión vertical, abierto en las pantallas más angostas que 1,6 para que
 *     el logo ocupe del ancho lo mismo que a 1440 × 900. La cámara no se mueve.
 *   · J8 · `?pie=columna2`: en el pie, el encuadre corrido (`setViewOffset`) hasta dejar el logo en el centro de la segunda de
 *     cuatro columnas, a medida que el pie llega. La escena no se mueve; la cámara sin el mouse copia la proyección
 *     (`sinElMouse.ts`) y el pie de volumen se coloca con ella, así que sigue sobre su DOM.
 */
export function ponerElCampoDeVision(camara: THREE.Camera, ancho: number, alto: number): void {
  BANDA_EN_VIVO.factor = factorDeLaBanda(ancho, alto)
  const corrimiento = disposicionDeLaPagina() === 'columna2' ? Math.round(CORRIMIENTO_DE_LA_COLUMNA_2 * llegadaDelCorrimiento(PROGRESO_DEL_PIE.valor?.get() ?? 0) * ancho) : 0
  if (!(camara instanceof THREE.PerspectiveCamera)) return
  const fov = fovConFactor(CAMERA_FOV, BANDA_EN_VIVO.factor)
  const vista = camara.view
  const corrido = vista !== null && vista.enabled
  const otroCuadro = corrido && (vista.fullWidth !== ancho || vista.fullHeight !== alto)
  if (camara.fov === fov && (corrido ? vista.offsetX : 0) === corrimiento && !otroCuadro) return
  camara.fov = fov
  if (corrimiento !== 0) camara.setViewOffset(ancho, alto, corrimiento, 0, ancho, alto)
  else if (corrido) camara.clearViewOffset()
  camara.updateProjectionMatrix()
}

/** [PULIDO 10] J8 · cuánto del corrimiento de `?pie=columna2` va puesto: nada hasta que el pie asoma, entero con el pie llegado. */
export function llegadaDelCorrimiento(progresoDelPie: number): number {
  const t = Math.min(1, Math.max(0, (progresoDelPie - 0.25) / 0.5))
  return t * t * (3 - 2 * t)
}
