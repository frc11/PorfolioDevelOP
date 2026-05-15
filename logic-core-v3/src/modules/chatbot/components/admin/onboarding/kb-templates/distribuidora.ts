import type { KBTemplate } from './index'

export const distribuidoraTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_DISTRIBUIDORA}}

Distribuidora mayorista de {{RUBRO_DISTRIBUCION}} en {{CIUDAD}}.

**Clientes:** Atendemos a kioscos, despensas, supermercados y revendedores.
**Horarios:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Zonas de reparto:** {{ZONAS_REPARTO}}`,

  servicesOrProducts: `# Nuestro Catálogo

## 1. Venta Mayorista
- Distribuimos marcas líderes y segundas marcas en {{RUBRO_DISTRIBUCION}}.
- Catálogo con más de {{CANTIDAD_ARTICULOS}} artículos.
- Venta por bulto cerrado o caja.

## 2. Reparto a domicilio (Logística propia)
- Entregas programadas en {{ZONAS_REPARTO}}.

## 3. Retiro en sucursal (Take Away)
- Opción de compra en nuestro depósito con descuentos especiales.`,

  faq: `# Preguntas frecuentes

**¿Venden a consumidor final?**
Solo vendemos por bulto cerrado. Si el consumidor final compra esa cantidad, sí le vendemos, pero los precios están pensados para comercios.

**¿Tienen compra mínima?**
Sí, para el envío a domicilio el pedido mínimo es de {{COMPRA_MINIMA}}. Para retirar en el local no hay mínimo (solo respetar el bulto cerrado).

**¿Cómo accedo a la lista de precios?**
Podés pedirla por acá mismo y te la enviamos en PDF, o podés crearte un usuario en nuestra web mayorista.`,

  policies: `# Políticas

**Envíos:** Los pedidos se entregan dentro de las 48hs hábiles de confirmados.
**Pagos:** Efectivo contra entrega, transferencia bancaria (acreditada previa entrega) o cheques (sujeto a aprobación crediticia).
**Cambios y Devoluciones:** Solo se aceptan reclamos dentro de las 24hs de recibida la mercadería por fallas de origen o fechas de vencimiento cortas.`,

  salesGuidance: `# Guía de derivación

1. **Comercio nuevo** — Preguntar qué tipo de comercio es (kiosco, almacén) y en qué zona está. Derivar a ventas para apertura de cuenta.
2. **Consulta por stock/precios** — Facilitar lista de precios general. Si buscan un producto muy específico, derivar a ventas.
3. **Reclamos de entrega** — Pedir nombre del local y derivar inmediatamente a logística/atención al cliente.`,

  toneExamples: `# Ejemplos de tono

**Bueno (ágil, comercial, directo):**
> "¡Hola! Sí, hacemos envíos a esa zona. Para pasarte la lista de precios correcta, contame, ¿es para un comercio o compra particular?"

**Malo (lento, burocrático):**
> "Debe enviar un mail con el comprobante de CUIT para solicitar lista de precios."`,

  forbiddenStatements: `# Frases prohibidas

- NO prometer "entrega hoy mismo" a menos que esté confirmado por logística.
- NO dar descuentos extra por el chat (los maneja cada vendedor).
- NO dar precios exactos de productos sin aclarar que "pueden variar según cantidad o actualizaciones del día".`,

  quickReplies: [
    { id: 'lista', label: 'Lista de Precios', prompt: 'Me gustaría ver la lista de precios' },
    { id: 'envios', label: 'Zonas de Envío', prompt: '¿A qué zonas hacen envíos?' },
    { id: 'comprar', label: 'Cómo comprar', prompt: '¿Cómo hago para hacer un pedido?' },
    { id: 'minimo', label: 'Compra mínima', prompt: '¿Tienen monto mínimo de compra?' },
  ],
}
