/**
 * Destino único de WhatsApp del sitio público.
 *
 * El número real vive en `NEXT_PUBLIC_WHATSAPP_NUMBER` (declarada en
 * `.env.example` sin valor: el entorno la provee). El fallback NO es un número
 * nuevo — es el literal que ya usan hoy las landings de IA y de automatización,
 * el más repetido del repo.
 *
 * ⚠ Deuda conocida, fuera del alcance de B2-S1: hoy conviven CINCO fallbacks
 * distintos hardcodeados para la misma variable — `5493816223508` (×5),
 * `543812223344` (×2), `5493815000000` (Footer), `5493815555555` y
 * `543813165293` (`/contact`) — repartidos entre landings, `Footer.tsx`,
 * `PortalDemoCTA.tsx` y `app/contact/page.tsx`. Este módulo es el destino al
 * que migrarlos; esa migración no se hizo acá para no tocar archivos fuera del
 * sprint. Está reportado como hallazgo fuera de scope.
 */
const FALLBACK_WHATSAPP_NUMBER = '5493816223508'

/**
 * Prefill del CTA. Es el MISMO texto que ya usan `Footer.tsx` (`WA_TEXT`) y
 * `PortalDemoCTA.tsx` (`WHATSAPP_PREFILL_TEXT`), cada uno con su copia local
 * del string. Acá vive la copia canónica.
 */
export const WHATSAPP_PREFILL =
  '¡Hola develOP! Vi la web y quiero coordinar una llamada. Mi negocio es'

/**
 * `https://wa.me/<numero>?text=<prefill>` listo para un `href`.
 *
 * `replace(/\D/g, '')` deja solo dígitos: `wa.me` no acepta `+`, espacios ni
 * guiones, y el valor de entorno puede venir con cualquiera de los tres.
 */
export function getWhatsappHref(prefill: string = WHATSAPP_PREFILL): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER
  const digits = raw.replace(/\D/g, '')

  return `https://wa.me/${digits}?text=${encodeURIComponent(prefill)}`
}
