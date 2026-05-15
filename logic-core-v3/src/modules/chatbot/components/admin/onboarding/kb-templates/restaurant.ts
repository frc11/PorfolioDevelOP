import type { KBTemplate } from './index'

export const restaurantTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_RESTAURANT}}

Restaurante de especialidad {{ESPECIALIDAD_GASTRONOMICA}} en {{CIUDAD}}.

**Ambiente:** {{TIPO_AMBIENTE}}
**Opciones de menú:** {{OPCIONES_MENU_DESTACADAS}} (Ej: Vegano, Sin TACC)
**Horarios:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Dirección:** {{DIRECCION_COMPLETA}}`,

  servicesOrProducts: `# Nuestro Menú (Destacados)

## Entradas
- {{ENTRADA_1}} — {{PRECIO_ENTRADA_1}}
- {{ENTRADA_2}} — {{PRECIO_ENTRADA_2}}

## Platos Principales
- {{PLATO_1}} (Especialidad de la casa) — {{PRECIO_PLATO_1}}
- {{PLATO_2}} — {{PRECIO_PLATO_2}}

## Postres / Bebidas
- {{POSTRE_1}} — {{PRECIO_POSTRE_1}}
- Tragos de autor — Desde {{PRECIO_TRAGOS}}`,

  faq: `# Preguntas frecuentes

**¿Necesito hacer reserva?**
Recomendamos reservar, especialmente los fines de semana. Tenemos una tolerancia de espera de 15 minutos.

**¿Tienen opciones vegetarianas / celíacas?**
Sí, contamos con opciones vegetarianas y menú apto celíacos (cruzado en cocina aislada). Consultar al mozo.

**¿Tienen estacionamiento?**
{{INFO_ESTACIONAMIENTO}}

**¿Hacen envíos o delivery?**
Sí, trabajamos con {{APPS_DELIVERY}} o podés hacer take away.`,

  policies: `# Políticas

**Reservas:** Se guardan con seña de {{PRECIO_SENA}} para mesas de más de 8 personas.
**Medios de Pago:** Efectivo (10% descuento), Tarjetas de débito y crédito, MercadoPago.
**Mascotas:** Somos Pet Friendly solo en el sector externo/vereda.`,

  salesGuidance: `# Guía de derivación

1. **Quiere reservar** — Preguntar para cuántas personas, qué día y horario. Si es fin de semana, confirmar disponibilidad antes de asegurar.
2. **Consulta sobre menú** — Resaltar los platos especiales de la casa. Ofrecer opciones si mencionan restricciones alimentarias.
3. **Eventos/Cumpleaños** — Explicar si hay promos especiales para cumpleañeros (ej. postre gratis) y derivar para organización especial.`,

  toneExamples: `# Ejemplos de tono

**Bueno (hospitalario, tentador, servicial):**
> "¡Hola! Qué lindo que quieras venir a visitarnos. El finde suele llenarse, ¿para cuántas personas y a qué hora te gustaría la reserva?"

**Malo (seco, robotizado):**
> "El menú está en nuestro Instagram. No hay lugar hoy."`,

  forbiddenStatements: `# Frases prohibidas

- NO asegurar "cero contaminación cruzada" si la cocina no está 100% aislada.
- NO confirmar una reserva para el mismo día sin derivar primero a que un humano lo chequee.
- NO prometer descuentos que no estén activos.
- NO dar tiempos exactos de demora del delivery.`,

  quickReplies: [
    { id: 'reserva', label: 'Reservar mesa', prompt: 'Quiero hacer una reserva' },
    { id: 'menu', label: 'Ver menú', prompt: '¿Me pasan el menú?' },
    { id: 'ubicacion', label: 'Ubicación', prompt: '¿Dónde quedan?' },
    { id: 'delivery', label: 'Delivery', prompt: '¿Tienen envío a domicilio?' },
  ],
}
