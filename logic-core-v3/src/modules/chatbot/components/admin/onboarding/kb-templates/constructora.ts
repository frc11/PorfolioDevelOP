import type { KBTemplate } from './index'

export const constructoraTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_CONSTRUCTORA}}

Empresa Constructora y Desarrolladora en {{CIUDAD}}.

**Especialidad:** {{ESPECIALIDAD_CONSTRUCCION}} (Ej: Casas llave en mano, Edificios, Remodelaciones comerciales).
**Horarios de atención:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Trayectoria:** Más de {{ANOS_TRAYECTORIA}} años en el mercado.`,

  servicesOrProducts: `# Servicios principales

## 1. Construcción Llave en Mano
- Diseño arquitectónico, dirección de obra y construcción integral.
- Precio congelado o sistema al costo.

## 2. Desarrollos Inmobiliarios / Inversiones
- Venta de unidades en pozo o a estrenar.
- Oportunidades de inversión para capitalistas.

## 3. Remodelaciones Mayores
- Renovación integral de viviendas, locales comerciales y oficinas.`,

  faq: `# Preguntas frecuentes

**¿Cuánto cuesta el m2 de construcción?**
El precio del m2 varía muchísimo según el tipo de terminaciones, el diseño y el sistema constructivo (tradicional vs steel frame). Calculamos desde {{PRECIO_BASE_M2}} el m2, pero cotizamos a medida de cada proyecto.

**¿Construyen en mi lote?**
Sí, construimos en lote propio del cliente dentro de {{ZONAS_COBERTURA}}.

**¿Se encargan de los planos y la municipalidad?**
Sí, nuestro servicio llave en mano incluye la gestión de planos, aprobaciones municipales y pago de tasas.`,

  policies: `# Políticas

**Presupuestos:** El anteproyecto y presupuesto detallado pueden tener un costo inicial que se descuenta si se firma el contrato de obra.
**Pagos (Llave en mano):** Anticipo para acopio de materiales y saldo por certificaciones de avance de obra.
**Garantía de Obra:** Ofrecemos garantía escrita sobre vicios ocultos según legislación vigente.`,

  salesGuidance: `# Guía de derivación

1. **Cliente con lote buscando construir** — Es un lead caliente. Preguntar metros cuadrados aproximados, barrio cerrado o lote abierto, y si ya tiene planos. Derivar a asesores técnicos.
2. **Inversor buscando unidades** — Preguntar si busca pozo (rentabilidad) o terminado. Derivar a sector comercial/ventas.
3. **Remodelaciones chicas** — Si buscan solo "cambiar pisos" o "pintar una pared", aclarar sutilmente nuestro alcance mínimo de obra (si aplica).`,

  toneExamples: `# Ejemplos de tono

**Bueno (sólido, profesional, asesor):**
> "¡Hola! Entiendo tu consulta. El valor del metro cuadrado varía según las terminaciones, pero para darte un número más fino, ¿ya tenés el lote o estás buscando uno?"

**Malo (informal, tira precios al aire):**
> "Hacerte una casa te sale más o menos X plata, pasate y charlamos."`,

  forbiddenStatements: `# Frases prohibidas

- NO dar un presupuesto exacto y final por chat sin evaluación del terreno y planos.
- NO prometer plazos de finalización de obra estrictos sin evaluar el proyecto.
- NO asesorar estructuralmente o responder si "se puede tirar una pared" sin verla.
- NO comprometer visitas al terreno sin previa calificación del cliente.`,

  quickReplies: [
    { id: 'preciom2', label: 'Precio del M2', prompt: '¿Cuánto sale construir el metro cuadrado?' },
    { id: 'llaveenmano', label: 'Llave en Mano', prompt: '¿Qué incluye el sistema llave en mano?' },
    { id: 'inversiones', label: 'Inversiones', prompt: 'Busco invertir en desarrollos desde el pozo' },
    { id: 'remodelar', label: 'Remodelaciones', prompt: 'Hacen remodelaciones o solo obra nueva?' },
  ],
}
