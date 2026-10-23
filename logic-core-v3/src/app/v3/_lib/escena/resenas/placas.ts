import * as THREE from 'three'

import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { ARO, type MedidasDelAro } from './aro'

/**
 * [NOCTURNO B2] LAS PLACAS DEL ARO — como la del contacto (`_chrome/contacto/placa.ts`: el frente de papel y los costados en tinta, con
 * espesor de verdad), más chicas y redondeadas: un rectángulo de esquinas redondas extruido. Las caras (frente y nuca) son de papel; los
 * costados, de la tinta del contacto (86 % tinta). Cada placa tiene sus dos materiales: se mete en la niebla por su cuenta (la opacidad y
 * el color hacia el de la niebla de la sala). Responden a las luces de la sala (de día, el papel iluminado).
 */

/** Los costados: la tinta del contacto (`color-mix` de la tinta al 86 % con el papel). */
const COSTADO = new THREE.Color(INK_COLOR).lerp(new THREE.Color(PAPER_COLOR), 0.14)
export const PAPEL = new THREE.Color(PAPER_COLOR)

export interface PlacaArmada {
  readonly malla: THREE.Mesh
  readonly cara: THREE.MeshStandardMaterial
  readonly costado: THREE.MeshStandardMaterial
}

/** La geometría de una placa: centrada en su origen, el frente hacia +z. */
export function geometriaDeLaPlaca(m: MedidasDelAro): THREE.ExtrudeGeometry {
  const [w, h, r] = [m.ancho, m.alto, Math.min(m.esquina, m.ancho / 2, m.alto / 2)]
  const s = new THREE.Shape()
  s.moveTo(-w / 2 + r, -h / 2)
  s.lineTo(w / 2 - r, -h / 2)
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  s.lineTo(w / 2, h / 2 - r)
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  s.lineTo(-w / 2 + r, h / 2)
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  s.lineTo(-w / 2, -h / 2 + r)
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  const bisel = m.espesor * 0.18
  const g = new THREE.ExtrudeGeometry(s, { depth: m.espesor - 2 * bisel, bevelEnabled: true, bevelThickness: bisel, bevelSize: bisel * 0.8, bevelSegments: 2, curveSegments: 6 })
  g.translate(0, 0, -(m.espesor - 2 * bisel) / 2)
  return g
}

export function armarLasPlacas(geometria: THREE.BufferGeometry): PlacaArmada[] {
  return Array.from({ length: ARO.placas }, (_, i) => {
    // [C2-70] Sólidas: opacas siempre (las de atrás ya no se transparentan).
    const cara = new THREE.MeshStandardMaterial({ color: PAPEL, roughness: 0.62, metalness: 0, transparent: false, dithering: true })
    const costado = new THREE.MeshStandardMaterial({ color: COSTADO, roughness: 0.55, metalness: 0, transparent: false, dithering: true })
    const malla = new THREE.Mesh(geometria, [cara, costado])
    malla.name = `resenas · la placa ${String(i)}`
    malla.visible = false
    return { malla, cara, costado }
  })
}

/** La placa metida `niebla` (0 a 1) en la niebla de la sala, de color `fondo`. */
export function enLaNiebla(p: PlacaArmada, niebla: number, fondo: THREE.Color | null): void {
  const u = Math.min(1, Math.max(0, niebla))
  // [C2-70] Sólo el color hacia el de la sala (era también la opacidad): la placa sigue opaca y escribe su profundidad.
  p.cara.opacity = 1
  p.costado.opacity = 1
  p.cara.color.copy(PAPEL)
  p.costado.color.copy(COSTADO)
  if (fondo !== null && u > 0) {
    p.cara.color.lerp(fondo, u * NIEBLA_SOLIDA)
    p.costado.color.lerp(fondo, u * NIEBLA_SOLIDA)
  }
  p.cara.depthWrite = true
  p.costado.depthWrite = true
}

/** [C2-70] Cuánto del color de la sala toma la placa más metida en la niebla (era 0,7 con la opacidad): se aleja sin borrarse. */
export const NIEBLA_SOLIDA = 0.35

export function soltarLasPlacas(placas: readonly PlacaArmada[], geometria: THREE.BufferGeometry | null): void {
  for (const p of placas) {
    p.cara.dispose()
    p.costado.dispose()
  }
  geometria?.dispose()
}
