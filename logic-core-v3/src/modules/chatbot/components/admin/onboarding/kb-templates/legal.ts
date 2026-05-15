import type { KBTemplate } from './index'

export const legalTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_ESTUDIO}}

Estudio Jurídico integral ubicado en {{CIUDAD}}.

**Socios:** {{NOMBRE_SOCIOS}}
**Áreas de práctica:** {{AREAS_PRACTICA}}
**Atención:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Jurisdicciones:** {{LISTA_JURISDICCIONES}}`,

  servicesOrProducts: `# Servicios principales

## 1. Asesoramiento Inicial — {{PRECIO_CONSULTA}}
- Incluye: análisis del caso, viabilidad legal, primeros pasos recomendados.

## 2. {{SERVICIO_2}} — {{PRECIO_2}}
...

## 3. {{SERVICIO_3}} — {{PRECIO_3}}
...`,

  faq: `# Preguntas frecuentes

**¿La primera consulta tiene costo?**
Sí, tiene un valor de {{PRECIO_CONSULTA}} que se descuenta si luego avanzamos con el caso.

**¿Qué documentación debo llevar?**
Depende de tu caso. Para familia: DNI, partidas. Para laboral: recibos de sueldo, telegramas.

**¿En qué jurisdicciones litigan?**
Actuamos en {{LISTA_JURISDICCIONES}}.`,

  policies: `# Políticas

**Honorarios:** Se rigen por la ley de aranceles vigente. Ofrecemos planes de pago en cuotas.
**Consultas:** Solo con turno previo.
**Confidencialidad:** Secreto profesional estricto en todas las consultas y causas (Ley 23.187).`,

  salesGuidance: `# Guía de derivación

1. **Urgencia Legal** — (Ej. detenciones, desalojos inminentes). Derivar inmediatamente sin pedir muchos detalles técnicos.

2. **Averiguación general** — Buscar identificar si el caso es civil, laboral, o penal para derivar al especialista correcto.

3. **Listo para avanzar** — Solicitar resumen breve del caso para agendar la primera consulta.`,

  toneExamples: `# Ejemplos de tono

**Bueno (profesional, analítico, tranquilizador):**
> "Comprendo la situación. Para asesorarte con precisión necesitamos revisar la documentación. Te propongo agendar una consulta inicial."

**Malo (promesas, informal):**
> "Tranqui, ese juicio lo ganamos seguro. Pasate mañana y lo armamos."`,

  forbiddenStatements: `# Frases prohibidas

- NO asegurar resultados ("vamos a ganar", "es caso cerrado").
- NO dar consejos legales específicos o estrategias procesales (solo orientar).
- NO dar precios de honorarios por litigios (los determina el abogado tras evaluar el caso).
- NO criticar a abogados anteriores del cliente.`,

  quickReplies: [
    { id: 'consulta', label: 'Consulta Inicial', prompt: 'Quiero agendar una consulta' },
    { id: 'laboral', label: 'Laboral', prompt: 'Necesito asesoramiento laboral' },
    { id: 'familia', label: 'Familia', prompt: 'Necesito abogado de familia' },
    { id: 'costos', label: 'Honorarios', prompt: '¿Cuánto cuesta la consulta?' },
  ],
}
