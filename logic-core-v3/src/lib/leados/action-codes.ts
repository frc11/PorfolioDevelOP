/**
 * LeadOS 4.1 — Códigos de error estructurados de las actions del setter.
 *
 * Un `ActionResult` fallido lleva copy para el humano; cuando la UI además
 * necesita REACCIONAR a un fallo puntual (y no solo mostrarlo), el código es el
 * contrato — no el texto. Antes `agenda-form` matcheaba el copy por substring:
 * cualquier retoque de redacción rompía la reacción en silencio.
 *
 * Módulo sin dependencias a propósito: lo importan el server (actions) y el
 * cliente (forms).
 */

/**
 * El horario elegido se ocupó entre la oferta y la confirmación. La UI tira la
 * oferta vieja y vuelve a pedir horarios. Lo emite `confirmarReunion`, tanto
 * por la re-validación fresca del slot como por el rebote de Cal.com.
 */
export const SLOT_OCUPADO = 'SLOT_OCUPADO'

/** Códigos que hoy viajan en un `ActionResult` fallido del setter. */
export type ActionCode = typeof SLOT_OCUPADO
