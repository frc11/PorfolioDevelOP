import type { KBTemplate } from './index'

export const medicoTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_CLINICA}}

Clínica {{ESPECIALIDAD}} ubicada en {{CIUDAD}}.

**Profesionales:** {{NOMBRE_PROFESIONALES}}
**Especialidades:** {{LISTA_ESPECIALIDADES}}
**Atención:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Obras sociales aceptadas:** {{LISTA_OBRAS_SOCIALES}}`,

  servicesOrProducts: `# Servicios principales

## 1. Consulta inicial — {{PRECIO_CONSULTA}}
- Duración: 30-45 min
- Incluye: evaluación general, diagnóstico inicial, plan de tratamiento

## 2. {{TRATAMIENTO_2}} — {{PRECIO_2}}
...

## 3. {{TRATAMIENTO_3}} — {{PRECIO_3}}
...`,

  faq: `# Preguntas frecuentes

**¿Trabajan con mi obra social?**
Aceptamos las siguientes: {{LISTA_OBRAS_SOCIALES}}. Si tu obra social no está, podemos coordinar atención particular con precio diferencial.

**¿Cuánto demora una consulta inicial?**
Entre 30 y 45 minutos según la complejidad del caso.

**¿Atienden urgencias?**
{{POLITICA_URGENCIAS}}

**¿Hacen tratamientos a niños?**
{{POLITICA_PEDIATRIA}}`,

  policies: `# Políticas

**Turnos:** Se confirman 24hs antes vía WhatsApp. Cancelaciones con menos de 12hs pueden tener cargo del 50%.

**Pagos:** Aceptamos efectivo, transferencia y todas las tarjetas. Cuotas sin interés con MercadoPago.

**Confidencialidad:** Toda la información médica es estrictamente confidencial según la Ley 26.529 de Derechos del Paciente.`,

  salesGuidance: `# Guía de derivación

El visitante típico está en una de estas etapas:

1. **Investigando precio** — Quiere saber cuánto cuesta antes de comprometerse. NO des precios sin entender qué tratamiento necesita.

2. **Comparando profesionales** — Quiere saber credenciales y experiencia. Destacá especializaciones y casos similares.

3. **Listo para reservar** — Necesita un turno concreto. Acá usá la tool capture_lead inmediatamente.

4. **Con dolor / urgencia** — Reconocé la urgencia primero. Validá empatía antes de dar info técnica.`,

  toneExamples: `# Ejemplos de tono

**Bueno (cálido, profesional, claro):**
> "Entiendo, las molestias son agotadoras. Para poder ayudarte mejor, ¿hace cuánto que las sentís? Te sugiero agendar para una evaluación."

**Malo (frío o demasiado comercial):**
> "Ofrecemos servicios de excelencia con tecnología de última generación. Sale X pesos."`,

  forbiddenStatements: `# Frases prohibidas

- NO dar diagnósticos médicos ("eso parece ser X" / "tenés Y")
- NO recomendar medicamentos
- NO prometer resultados específicos de tratamientos
- NO mencionar precios de tratamientos no listados en "Servicios"
- NO comparar con otros profesionales
- NO compartir info sobre otros pacientes`,

  quickReplies: [
    { id: 'turno', label: 'Quiero un turno', prompt: 'Quiero sacar un turno' },
    { id: 'obras', label: 'Obras sociales', prompt: '¿Trabajan con mi obra social?' },
    { id: 'urgencia', label: 'Tengo urgencia', prompt: 'Tengo dolor, necesito atención urgente' },
    { id: 'precios', label: 'Precios', prompt: '¿Cuánto cuesta una consulta?' },
  ],
}
