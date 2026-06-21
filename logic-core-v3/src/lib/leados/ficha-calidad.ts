/**
 * LeadOS FG-1.3 — Heurística de CALIDAD del input de la ficha. ADVISORY: decide
 * si vale la pena SUGERIR más detalle en un campo flojo. Nada más.
 *
 * 🔴 LÍMITE DURO (SENSIBLE-lite): esto NO es un gate. Vive fuera de `flow.ts` a
 * propósito — los gates de transición (`fichaFaltantes`, `transitionDossier`)
 * deciden si el lead AVANZA; esto solo orienta cómo mejorar lo escrito. Su
 * salida únicamente pinta un mensaje: jamás habilita/deshabilita el submit, jamás
 * dispara una transición, jamás bloquea. Si algún día alguien la enchufa a un
 * gate, dejó de cumplir su contrato.
 *
 * Sin Prisma, sin 'use server', sin React: lógica pura, testeable e importable
 * desde cualquier capa (mismo patrón que `flow.ts`).
 */

/**
 * Largo mínimo (trim) para considerar que un campo de texto tiene detalle real.
 * Umbral SUAVE a propósito: por debajo, un input como «tiene Instagram» (15) se
 * marca flojo; una respuesta de una o dos cláusulas lo supera. El mensaje INVITA
 * a sumar, no rechaza — un falso positivo en una respuesta corta-pero-ok no
 * molesta, y no bloquea nada de todos modos.
 */
export const FICHA_MIN_DETALLE = 40

/**
 * ¿El input quedó flojo? `true` SOLO si hay contenido pero es demasiado corto
 * para tener detalle. Vacío → `false`: de "todavía falta llenar esto" se ocupa
 * la guía de faltantes/gate, no este nudge (que es para enriquecer, no exigir).
 */
export function campoFichaFlojo(valor: string): boolean {
  const limpio = valor.trim()
  return limpio.length > 0 && limpio.length < FICHA_MIN_DETALLE
}
