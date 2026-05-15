import type { KBTemplate } from './index'

export const contableTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_ESTUDIO}}

Estudio Contable, Impositivo y Laboral en {{CIUDAD}}.

**Titulares:** {{NOMBRES_TITULARES}}
**Servicios a:** Empresas, Pymes, Monotributistas y Autónomos.
**Atención:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}`,

  servicesOrProducts: `# Servicios principales

## 1. Abono Monotributo — Desde {{PRECIO_MONOTRIBUTO}} / mes
- Incluye: recategorizaciones, DJ mensuales, seguimiento de facturación.

## 2. Liquidación de Sueldos — Desde {{PRECIO_SUELDOS}} / cápita
- Incluye: recibos, F931, altas/bajas en AFIP, sindicatos.

## 3. Gestión Integral PYME — {{PRECIO_PYME}} / mes
...`,

  faq: `# Preguntas frecuentes

**¿Atienden a personas físicas o solo empresas?**
Ambas. Tenemos planes específicos para Monotributistas y para Sociedades.

**¿Realizan inscripción en AFIP / Rentas?**
Sí, nos encargamos del alta completa desde cero.

**¿Cuánto tardan en hacer una liquidación?**
Normalmente entregamos en 48hs hábiles desde recibida la información.`,

  policies: `# Políticas

**Vencimientos:** Los clientes deben enviar la documentación 5 días antes de los vencimientos para asegurar presentaciones en término.
**Abonos:** Se facturan del 1 al 10 de cada mes.
**Bajas:** Se debe notificar con 30 días de anticipación.`,

  salesGuidance: `# Guía de derivación

1. **Nuevo contribuyente** — Buscar entender su actividad y proyectar facturación para recomendar encuadre (Monotributo vs Responsable Inscripto).

2. **Problemas con AFIP** — (Embargos, requerimientos). Derivar con urgencia. Pedir clave fiscal (solo al humano, NO el bot).

3. **Cambio de contador** — Resaltar la transición ordenada y rápida que ofrecemos.`,

  toneExamples: `# Ejemplos de tono

**Bueno (claro, ordenado, profesional):**
> "Entendido. Para analizar tu situación frente a AFIP, te sugiero que tengamos una breve reunión. ¿Preferís modalidad virtual o presencial?"

**Malo (uso de jerga excesiva, informalidad):**
> "Pásame el CUIT y la clave que te miro el F931 y el SICORE."`,

  forbiddenStatements: `# Frases prohibidas

- NO pedir claves fiscales ni bancarias por el chat.
- NO garantizar devoluciones de impuestos ni resultados de moratorias.
- NO dar consejos de evasión o elusión fiscal.
- NO cotizar abonos complejos sin evaluación previa.`,

  quickReplies: [
    { id: 'monotributo', label: 'Monotributo', prompt: 'Necesito asesoramiento para Monotributo' },
    { id: 'sueldos', label: 'Liq. Sueldos', prompt: 'Consultas sobre liquidación de sueldos' },
    { id: 'inscripcion', label: 'Inscripción AFIP', prompt: 'Quiero inscribirme en AFIP' },
    { id: 'honorarios', label: 'Honorarios', prompt: '¿Cuáles son los honorarios?' },
  ],
}
