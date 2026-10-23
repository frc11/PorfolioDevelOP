import * as THREE from 'three'

import type { Armado } from './armado'

/**
 * [NOCTURNO B2] EL GIRO DE UN TÍTULO DE VOLUMEN — el gesto con que «Seis razones para elegirnos» se vuelve el CTA (`ctaDelFinal/
 * transformacion.ts`: un cartel de dos caras que gira sobre Y; en el medio del giro sólo se ve el canto), para un título en su lugar: la
 * malla gira sobre el eje vertical de su centro, adentro de su grupo (el grupo, colocado por la lectura, no cambia: su texto 2D y su sombra
 * siguen al plano). Lo usa el título de las reseñas: cada mitad de la frase gira de 0 a 180° y la mitad de «Lo que dicen nuestros clientes»
 * que la reemplaza, de −180° a 0; cada una se dibuja sólo con su cara a la vista (de canto, en ±90°, ninguna).
 *
 * Quién gira y cuánto lo escribe la sección (id → ángulo en rad); sin entrada, 0: la malla en su lugar, como siempre.
 */
export const GIROS_DE_LOS_TITULOS = new Map<string, number>()

/**
 * [C2-70e] CUÁNTO SE CORRE CADA TÍTULO A LO LARGO DE SU RENGLÓN (px del cuadro de su lectura; positivo, a la derecha), además del giro: las
 * mitades del título de las reseñas (y de la frase, su otra cara) se juntan en el medio mientras se dan vuelta. Lo escribe la sección; sin
 * entrada, 0. El grupo no se mueve (su sombra sigue a la malla); el CTA corre lo mismo su origen (`RenglonDelCta.corrido`).
 */
export const CORRIMIENTOS_DE_LOS_TITULOS = new Map<string, number>()

/** El corrimiento del título en em de su grupo (el grupo mide un cuerpo por em en el cuadro de su lectura, por su alejamiento). */
function corrimientoEnEm(a: Armado): number {
  const px = CORRIMIENTOS_DE_LOS_TITULOS.get(a.titulo.id) ?? 0
  const cuerpo = (a.lugar?.cuerpo ?? 0) * (a.titulo.alejamiento ?? 1)
  return px === 0 || cuerpo <= 0 ? 0 : px / cuerpo
}

/** Si un título girado `angulo` se dibuja: sólo con la cara de adelante a la vista. */
export const seVeConElGiro = (angulo: number): boolean => Math.cos(angulo) > 0.01

const EJE = new THREE.Vector3(0, 1, 0)
const CENTRO = new THREE.Vector3()
const GIRADO = new THREE.Vector3()

/** Pone la malla del título con su giro y su corrimiento (en em, en su grupo) y devuelve si se dibuja. */
export function girarElTitulo(a: Armado): boolean {
  const angulo = GIROS_DE_LOS_TITULOS.get(a.titulo.id) ?? 0
  const corrido = corrimientoEnEm(a)
  if (angulo === 0) {
    if (a.malla.position.x !== corrido || a.malla.position.y !== 0 || a.malla.position.z !== 0 || a.malla.quaternion.w !== 1) {
      a.malla.position.set(corrido, 0, 0)
      a.malla.quaternion.identity()
    }
    return true
  }
  const g = a.malla.geometry
  if (g.boundingBox === null) g.computeBoundingBox()
  const b = g.boundingBox
  if (b === null || b.isEmpty()) return seVeConElGiro(angulo)
  CENTRO.set((b.min.x + b.max.x) / 2, 0, (b.min.z + b.max.z) / 2)
  a.malla.quaternion.setFromAxisAngle(EJE, angulo)
  GIRADO.copy(CENTRO).applyQuaternion(a.malla.quaternion)
  a.malla.position.copy(CENTRO).sub(GIRADO)
  a.malla.position.x += corrido
  return seVeConElGiro(angulo)
}
