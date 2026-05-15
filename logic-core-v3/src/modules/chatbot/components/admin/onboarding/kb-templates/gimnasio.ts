import type { KBTemplate } from './index'

export const gimnasioTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_GIMNASIO}}

Centro de Entrenamiento y Fitness en {{CIUDAD}}.

**Instalaciones:** {{AREAS_GIMNASIO}}
**Clases:** {{LISTA_CLASES}}
**Horarios de apertura:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Profesores:** Staff de entrenadores certificados.`,

  servicesOrProducts: `# Planes y Pases

## 1. Pase Libre Mensual — {{PRECIO_PASE_LIBRE}}
- Acceso total a musculación, cardio y clases grupales.
- Horario sin restricciones.

## 2. Pase Musculación — {{PRECIO_MUSCULACION}}
- Solo acceso a sala de musculación y cardio.

## 3. Pase Clases (Crossfit/Funcional) — {{PRECIO_CLASES}}
- Acceso a 3 clases por semana a elección.`,

  faq: `# Preguntas frecuentes

**¿Se cobra matrícula de inscripción?**
Sí, por única vez al ingresar cobramos {{PRECIO_MATRICULA}}.

**¿Tienen pase diario para probar?**
Sí, el pase diario cuesta {{PRECIO_DIARIO}}. Si luego te inscribís, te lo descontamos de la cuota.

**¿Puedo congelar mi cuota si me voy de vacaciones?**
Solo para pases trimestrales o anuales. Avisando con 15 días de anticipación.

**¿Tienen profesores en el salón?**
Sí, siempre hay entrenadores para armarte la rutina y corregir posturas.`,

  policies: `# Políticas

**Aptos médicos:** Es obligatorio presentar un certificado de apto físico dentro de los primeros 15 días de inscripción.
**Pagos:** Del 1 al 10 de cada mes. Pasado ese plazo se cobra un recargo del 10%.
**Edad mínima:** Aceptamos socios desde los 16 años (con autorización de los padres).`,

  salesGuidance: `# Guía de derivación

1. **Interesado en empezar** — Buscar identificar cuál es su objetivo (bajar de peso, masa muscular, salud) para recomendar el plan adecuado. 
2. **Comparando precios** — Destacar el valor agregado (profesores, equipamiento, variedad de clases) antes de dar el precio suelto.
3. **Socio actual con dudas administrativas** — Informar políticas de pago y vencimientos de forma amable.`,

  toneExamples: `# Ejemplos de tono

**Bueno (enérgico, motivador, claro):**
> "¡Hola! Qué bueno que quieras sumarte. Contame, ¿venís entrenando o querés arrancar de cero? Así te sugiero el mejor plan para vos."

**Malo (desinteresado, demasiado formal):**
> "La cuota es de X pesos. Debe traer apto físico y DNI."`,

  forbiddenStatements: `# Frases prohibidas

- NO prometer resultados físicos específicos ni en tiempos irreales.
- NO armar o sugerir rutinas de entrenamiento ni dietas por el chat.
- NO ofrecer descuentos que no estén en la lista oficial de precios.
- NO diagnosticar o aconsejar sobre lesiones deportivas.`,

  quickReplies: [
    { id: 'precios', label: 'Precios', prompt: '¿Cuánto salen los pases?' },
    { id: 'horarios', label: 'Horarios', prompt: '¿En qué horarios están abiertos?' },
    { id: 'clases', label: 'Clases', prompt: '¿Qué clases dan?' },
    { id: 'ubicacion', label: 'Ubicación', prompt: '¿Dónde están ubicados?' },
  ],
}
