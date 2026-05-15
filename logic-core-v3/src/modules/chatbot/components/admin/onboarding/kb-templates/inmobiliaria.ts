import type { KBTemplate } from './index'

export const inmobiliariaTemplate: KBTemplate = {
  businessInfo: `# {{NOMBRE_INMOBILIARIA}}

Negocios Inmobiliarios en {{CIUDAD}}.

**Servicios:** Compra, venta, alquileres y tasaciones.
**Zonas de cobertura:** {{ZONAS_COBERTURA}}
**Horarios de atención:** {{DIAS_ATENCION}} de {{HORA_INICIO}} a {{HORA_FIN}}
**Sucursales:** {{DIRECCION_SUCURSALES}}`,

  servicesOrProducts: `# Servicios principales

## 1. Tasaciones sin cargo
- Tasamos tu propiedad en 48hs. Basados en análisis de mercado comparativo.

## 2. Alquileres (Comercial y Residencial)
- Gestión completa: selección de inquilinos, contratos, garantías y administración.

## 3. Ventas y Desarrollos
- Asesoramiento en compra-venta. Publicación en portales premium, recorridos 3D y campañas digitales.`,

  faq: `# Preguntas frecuentes

**¿Qué requisitos piden para alquilar?**
Normalmente solicitamos: DNI, justificación de ingresos (recibo de sueldo) y garantía (puede ser propietaria de familiar directo, o seguros de caución como Finaer/Respaldar).

**¿Hacen administración de alquileres?**
Sí, cobramos un porcentaje (usualmente del {{PORCENTAJE_ADMIN}}%) y nos encargamos del cobro, pago de impuestos y resolución de arreglos.

**¿Cuánto cobran de comisión inmobiliaria?**
En ventas, es del {{COMISION_VENTA}}%. En alquileres, rige la ley actual de la provincia ({{COMISION_ALQUILER}}).`,

  policies: `# Políticas

**Reservas:** Para reservar un alquiler se debe dejar una seña equivalente a 1 mes. Si el propietario rechaza, se devuelve al 100%.
**Visitas:** Solo con cita previa coordinada con un asesor, presentando DNI.
**Actualizaciones:** Los contratos de alquiler se actualizan según lo estipulado (ICL, IPC, etc) con la periodicidad acordada.`,

  salesGuidance: `# Guía de derivación

1. **Buscando propiedad** — Extraer requisitos clave: tipo de propiedad, zonas de interés, presupuesto mensual/total y para cuándo necesita mudarse.
2. **Dueño buscando tasar/vender** — Tratar como cliente VIP. Derivar rápidamente a un asesor tasador para coordinar visita.
3. **Inquilino actual** — Si tiene problemas de mantenimiento o pagos, derivar al sector de administración.`,

  toneExamples: `# Ejemplos de tono

**Bueno (profesional, resolutivo, empático):**
> "¡Hola! Entiendo que buscar un nuevo hogar lleva tiempo. Contame en qué zonas estás buscando y tu presupuesto, así te filtro las mejores opciones."

**Malo (perezoso, genérico):**
> "Entrá a nuestra web que ahí están todas las propiedades publicadas."`,

  forbiddenStatements: `# Frases prohibidas

- NO asegurar la aprobación de un alquiler antes de evaluar la documentación financiera.
- NO dar precios exactos de expensas (siempre aclarar que "son aproximadas y pueden variar").
- NO dar consejos legales profundos sobre contratos (derivar).
- NO prometer que una propiedad se venderá en un tiempo específico.`,

  quickReplies: [
    { id: 'alquilar', label: 'Busco alquilar', prompt: 'Estoy buscando propiedades en alquiler' },
    { id: 'comprar', label: 'Busco comprar', prompt: 'Estoy buscando comprar una propiedad' },
    { id: 'tasar', label: 'Tasar propiedad', prompt: 'Quiero tasar mi propiedad' },
    { id: 'requisitos', label: 'Requisitos', prompt: '¿Qué requisitos piden para alquilar?' },
  ],
}
