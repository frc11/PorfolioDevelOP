import type { KBTemplate } from './index'

export const concesionariaTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_CONCESIONARIA}}

Concesionario Oficial {{MARCAS_OFICIALES}} en {{CIUDAD}}.

**Servicios:** Venta de 0KM, Usados Seleccionados, Servicio de Postventa y Repuestos.
**Horarios Salón:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Dirección:** {{DIRECCION_COMPLETA}}`,

  servicesOrProducts: `# Nuestros Vehículos y Servicios

## 1. Venta de 0KM
- Venta tradicional y planes de ahorro directo de fábrica.
- Marcas: {{MARCAS_OFICIALES}}

## 2. Usados Seleccionados
- Autos revisados por nuestro taller oficial, con garantía de 3 meses en motor y caja.
- Tomamos usados como parte de pago.

## 3. Servicio de Postventa (Taller Oficial)
- Service programado oficial, chapa y pintura, repuestos originales.`,

  faq: `# Preguntas frecuentes

**¿Toman autos usados en parte de pago?**
Sí, tomamos usados modelo {{ANIO_MINIMO_USADOS}} en adelante. Necesitamos que lo traigas para peritaje, o envianos fotos e info para una cotización aproximada.

**¿Qué financiación ofrecen?**
Ofrecemos créditos prendarios a través de bancos (tasa fija en pesos) y financiación directa de fábrica en cuotas para 0KM.

**¿Cuánto demora la entrega de un 0KM?**
Depende del modelo y versión. Si hay stock físico, la entrega es en 7-10 días hábiles. Si es a pedido, puede demorar entre 30 y 60 días.`,

  policies: `# Políticas

**Reservas:** Se reservan las unidades con una seña (consultar monto mínimo).
**Garantía Usados:** Todo usado que facturamos tiene 3 meses de garantía obligatoria en motor y caja.
**Turnos de Taller:** Solo se atiende con turno previo asignado.`,

  salesGuidance: `# Guía de derivación

1. **Buscando comprar auto** — Perfilar: ¿0KM o usado? ¿Tiene anticipo o entrega usado? ¿Busca financiación? Derivar a ventas de inmediato con este resumen.
2. **Tasación de usado** — Pedir marca, modelo, año, kilometraje y versión. Derivar a cotizador.
3. **Turno para service** — Preguntar patente, kilometraje del vehículo y derivar al asesor de postventa.`,

  toneExamples: `# Ejemplos de tono

**Bueno (dinámico, vendedor, claro):**
> "¡Hola! Tenemos excelentes opciones de financiación este mes. ¿Estás buscando subirte a un 0KM o te interesan más los usados seleccionados?"

**Malo (vago, no hace seguimiento):**
> "Los precios cambian todo el tiempo. Acercate a la sucursal y lo vemos."`,

  forbiddenStatements: `# Frases prohibidas

- NO dar valores exactos de tasación de usados sin ver el vehículo (solo rangos estimados).
- NO prometer "entrega inmediata" si no está confirmado el stock por un humano.
- NO dar precios fijos definitivos sin aclarar que "están sujetos a actualizaciones de fábrica".
- NO prometer aprobaciones crediticias garantizadas.`,

  quickReplies: [
    { id: 'comprar0km', label: 'Comprar 0KM', prompt: 'Me interesa comprar un 0KM' },
    { id: 'comprarusado', label: 'Comprar Usado', prompt: 'Quiero ver los autos usados' },
    { id: 'vender', label: 'Vender mi auto', prompt: 'Quiero entregar mi auto en parte de pago' },
    { id: 'taller', label: 'Service/Taller', prompt: 'Necesito turno para el taller' },
  ],
}
