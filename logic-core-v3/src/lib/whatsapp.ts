/**
 * Destino único de WhatsApp del sitio público.
 *
 * El número real vive en `NEXT_PUBLIC_WHATSAPP_NUMBER` (declarada en
 * `.env.example` sin valor: el entorno la provee). El fallback NO es un número
 * nuevo — es el literal que ya usaban las landings de IA y de automatización,
 * el más repetido del repo.
 *
 * B2-S1 creó este módulo; B2-S2 migró los call-sites. Antes convivían SEIS
 * literales distintos para el mismo número — `5493816223508` (×5),
 * `543812223344` (×2), `5493815000000` (`Footer`), `543813165293` (`/contact`)
 * y cuatro call-sites SIN fallback, que servían `https://wa.me/undefined` si la
 * variable faltaba. Todos apuntan ahora acá.
 *
 * ⚠ Queda UNO sin migrar, a propósito: `components/ia/CalculadorIA.tsx` tiene
 * `5493815674738` hardcodeado y NO lee la variable de entorno — es el único
 * punto del sitio que hoy sirve un número REALMENTE distinto, no un fallback
 * muerto. Unificarlo cambiaría el destino que se sirve en producción, así que
 * se dejó como está y se reportó para que lo decida una persona.
 */
const FALLBACK_WHATSAPP_NUMBER = '5493816223508'

/**
 * Prefill por defecto del CTA. Es el MISMO texto que usaban `Footer.tsx`
 * (`WA_TEXT`) y `PortalDemoCTA.tsx` (`WHATSAPP_PREFILL_TEXT`), cada uno con su
 * copia local del string. Acá vive la copia canónica.
 */
export const WHATSAPP_PREFILL =
  '¡Hola develOP! Vi la web y quiero coordinar una llamada. Mi negocio es'

/**
 * Solo los dígitos del número.
 *
 * `replace(/\D/g, '')`: `wa.me` no acepta `+`, espacios ni guiones, y el valor
 * de entorno puede venir con cualquiera de los tres.
 *
 * Es público porque `/contact` no solo linkea a WhatsApp — también arma un
 * `tel:` con el MISMO número. Sin esta puerta, esa página necesitaría su propio
 * literal, que es exactamente la divergencia que este módulo vino a cerrar.
 */
export function getWhatsappDigits(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER

  return raw.replace(/\D/g, '')
}

/**
 * `https://wa.me/<numero>?text=<prefill>` listo para un `href`.
 *
 * El prefill se pasa en TEXTO PLANO — la codificación la hace esta función. Los
 * call-sites migrados traían el suyo ya percent-encoded a mano (`Hola%20DevelOP…`);
 * pasarlo así lo codificaría dos veces y el usuario vería los `%20` literales en
 * el mensaje.
 */
export function getWhatsappHref(prefill: string = WHATSAPP_PREFILL): string {
  return `https://wa.me/${getWhatsappDigits()}?text=${encodeURIComponent(prefill)}`
}
