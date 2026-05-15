import type { KBTemplate } from './index'

export const genericoTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_EMPRESA}}

Somos una empresa del rubro {{RUBRO}} ubicada en {{CIUDAD}}.

**Atención al público:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Contacto principal:** {{MEDIO_CONTACTO}}
**Redes Sociales:** {{REDES_SOCIALES}}`,

  servicesOrProducts: `# Nuestros Productos o Servicios

## 1. {{PRODUCTO_1}} — {{PRECIO_1}}
- Descripción detallada del producto o servicio.
- Beneficio principal para el cliente.

## 2. {{PRODUCTO_2}} — {{PRECIO_2}}
- Descripción detallada del producto o servicio.
- Beneficio principal para el cliente.

## 3. {{PRODUCTO_3}} — {{PRECIO_3}}
...`,

  faq: `# Preguntas frecuentes

**¿Cuáles son las formas de pago?**
Aceptamos efectivo, transferencia bancaria, tarjetas de débito y crédito. Para cuotas, usamos MercadoPago.

**¿Realizan envíos?**
Sí, realizamos envíos a todo el país. Los costos dependen del destino y peso del paquete.

**¿Tienen tienda física o showroom?**
Sí, estamos ubicados en {{DIRECCION_COMPLETA}}. Podés pasar dentro de nuestro horario comercial.`,

  policies: `# Políticas

**Garantía y Devoluciones:** Ofrecemos 30 días para cambios de productos sin uso, con etiqueta original y ticket de compra.
**Tiempos de respuesta:** Intentamos responder todas las consultas dentro de las 24 horas hábiles.
**Facturación:** Emitimos factura A y B. Por favor, enviar CUIT al momento de la compra.`,

  salesGuidance: `# Guía de derivación

1. **Interés de compra claro** — Si el cliente ya sabe qué producto quiere, guiarlo hacia la compra final o captura el lead para que un vendedor lo cierre.
2. **Consultas técnicas o de stock** — Responder basándose en la información proporcionada. Si no tenés la información, derivar a un asesor.
3. **Reclamos o post-venta** — Actuar con extrema amabilidad, empatía y derivar el caso a soporte o atención al cliente lo antes posible.`,

  toneExamples: `# Ejemplos de tono

**Bueno (amable, claro y resolutivo):**
> "¡Hola! Qué gusto saludarte. Te cuento que hacemos envíos a todo el país. ¿A qué código postal te gustaría que lo mandemos así calculo el costo?"

**Malo (robótico, indiferente):**
> "Nuestros horarios son de 9 a 18. Saludos."`,

  forbiddenStatements: `# Frases prohibidas

- NO prometas cosas que no figuran en este documento (tiempos de entrega irreales, descuentos inexistentes).
- NO discutas ni te pongas a la defensiva si el cliente presenta una queja.
- NO des opiniones personales sobre los productos o la competencia.
- NO solicites información sensible (tarjetas de crédito, contraseñas) por el chat.`,

  quickReplies: [
    { id: 'precios', label: 'Lista de Precios', prompt: '¿Tienen una lista de precios o catálogo?' },
    { id: 'envios', label: 'Envíos', prompt: '¿Hacen envíos?' },
    { id: 'horarios', label: 'Horarios', prompt: '¿Cuáles son sus horarios de atención?' },
    { id: 'pago', label: 'Medios de Pago', prompt: '¿Qué formas de pago aceptan?' },
  ],
}
