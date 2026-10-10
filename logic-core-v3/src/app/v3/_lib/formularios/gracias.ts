/**
 * [PULIDO 9] H2 · H3 · LA TARJETA DE GRACIAS DE LOS DOS FORMULARIOS (el del pie y el de Contacto) — el copy, la variante de
 * la transformación (`?gracias=volteo`, el de siempre, o `?gracias=hundido`) y cómo cambia el DOM de un estado al otro
 * (en el teléfono, en el modal y con movimiento reducido; desde 1025 el pie lo transforma en 3D: `pie3d/transformacionDelPie.ts`).
 */
export const GRACIAS = {
  titulo: 'Gracias por tu mensaje.',
  bajada: 'Te contestamos pronto.',
  otro: 'Enviar otro mensaje',
} as const

/** Lo que se anuncia al llegar (la región viva de cada formulario). */
export const ANUNCIO_DE_GRACIAS = `${GRACIAS.titulo} ${GRACIAS.bajada}`

export type VarianteDeGracias = 'volteo' | 'hundido'

/**
 * La variante pedida en `?gracias=` (sin pedir, o con otro valor: la del formulario). [PULIDO 10] J4 · el pie va con el volteo y el
 * panel de Contacto con el hundido; `?gracias=` cambia los dos.
 */
export function varianteDeGracias(valor: string | null | undefined, porDefecto: VarianteDeGracias = 'volteo'): VarianteDeGracias {
  return valor === 'hundido' || valor === 'volteo' ? valor : porDefecto
}

/** La variante de la consulta de la página (la del pie: el volteo). */
export function varianteDeLaPagina(): VarianteDeGracias {
  return typeof window === 'undefined' ? 'volteo' : varianteDeGracias(new URLSearchParams(window.location.search).get('gracias'))
}

/** [PULIDO 10] J4 · la del panel de Contacto: el hundido. */
export function varianteDelPanel(): VarianteDeGracias {
  return typeof window === 'undefined' ? 'hundido' : varianteDeGracias(new URLSearchParams(window.location.search).get('gracias'), 'hundido')
}

const CURVA = [0.25, 0.46, 0.45, 0.94] as const

interface TransicionDelDom {
  readonly initial: Readonly<Record<string, number>> | false
  readonly animate: Readonly<Record<string, number>>
  readonly exit: Readonly<Record<string, number>>
  readonly transition: { readonly duration: number; readonly ease: typeof CURVA }
}

/**
 * Cómo entra y sale cada estado en el DOM (Motion, con `AnimatePresence` en `mode="wait"`): el volteo gira sobre X (sale
 * hasta 90°, entra desde −90°); el hundido baja los campos hacia la placa y el mensaje sube desde ella; con movimiento
 * reducido, un fundido; `quieto` (el pie en 3D: lo transforma la escena), nada.
 */
export function transicionDeGracias(variante: VarianteDeGracias, reducido: boolean, quieto = false): TransicionDelDom {
  if (quieto) return { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0, ease: CURVA } }
  if (reducido) return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25, ease: CURVA } }
  if (variante === 'volteo') return { initial: { rotateX: -90, opacity: 0 }, animate: { rotateX: 0, opacity: 1 }, exit: { rotateX: 90, opacity: 0 }, transition: { duration: 0.45, ease: CURVA } }
  return { initial: { opacity: 0, scale: 0.94, y: 12 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.94, y: 8 }, transition: { duration: 0.4, ease: CURVA } }
}
