# TAREA: Pulida Premium v2 — Process Automation

Sos un senior frontend developer con ojo de diseñador de producto premium.
Nivel Vercel, Linear, Stripe. No vibe code. Criterio real.

El dueño te dio carta blanca para lucirte en la página /process-automation.

## ARCHIVOS A TRABAJAR (en orden)

1. src/components/automation/VaultAutomation.tsx
2. src/components/automation/SocialProofAutomation.tsx
3. src/components/automation/HeroAutomation.tsx
4. src/components/automation/CalculadoraAutomation.tsx
5. src/components/automation/BentoAutomation.tsx
6. src/components/automation/FlujoAutomation.tsx
7. src/components/automation/RubrosAutomation.tsx
8. src/components/automation/ProcesoAutomation.tsx
9. src/components/automation/IntegracionesAutomation.tsx

Lee cada archivo COMPLETO antes de modificarlo.

## MEJORAS CONCRETAS

### VaultAutomation.tsx
- Reemplazar el emoji de reloj por SVG limpio o badge "ROI"
- Quitar el emoji del CTA "ENCENDER MI EMPRESA", dejar solo texto + flecha
- Agregar grid pattern sutil al mini calculator (lineas rgba(255,255,255,0.02))
- FAQ: cuando abierto, text-shadow amber sutil en la pregunta
- Footer: hacerlo mas elegante

### SocialProofAutomation.tsx
- Estrellas como SVG reales con fill amarillo y entrada staggered (no caracteres de texto)
- Rating global container: noise texture sutil
- Cards de testimonios: noise texture muy sutil en background
- Comillas decorativas: SVG path tipografico en vez de caracter de texto
- Avatar circular: ring de color con hover state elegante

### HeroAutomation.tsx
- Marquee: mejor padding-top y linea decorativa superior mas elegante
- Floating stats: mejor backdrop-blur, highlight top de 1px de color
- Scroll cue: un solo chevron con opacity decreciente, mas elegante

### CalculadoraAutomation.tsx
- Tipografia mas jerarquizada en resultados
- Mejor contraste en inputs/sliders
- Separadores mas elegantes

### BentoAutomation.tsx
- Flip cards: box-shadow multicapa mas definido
- Contador de perdida: mejor tipografia monospace
- Verificar que GearDecoration con circulos concentricos se vea bien

### FlujoAutomation.tsx
- Particulas y conexiones SVG mas nitidas
- Log de eventos: mejor tipografia y animaciones de entrada

### RubrosAutomation.tsx
- Chat mockup header: glow sutil del color del rubro activo
- Tabs: glow ambient debajo del tab activo

### ProcesoAutomation.tsx
- Steps expandibles: mejor contraste estado activo
- Linea vertical de acento mas visible
- Deliverable: chip visual con icono en vez de texto plano

### IntegracionesAutomation.tsx
- Hover states de app cards mejorados
- Filtro por categoria: mejor estado activo

## REGLAS ESTRICTAS
1. Lee cada archivo completo antes de modificar
2. NO toques logica de negocio ni calculos
3. NO cambies el copy/texto
4. NO rompas animaciones existentes — mejora o expande
5. Se quirurgico: cambia lo justo para maximo impacto visual
6. Paleta: amber #f59e0b, orange #f97316, bg #070709/#080810
7. Cuando termines cada archivo escribi en stdout: COMPLETADO: [nombre]

## AL TERMINAR TODO
Ejecuta este comando exacto:
openclaw system event --text "DONE: Pulida premium v2 process-automation lista" --mode now
