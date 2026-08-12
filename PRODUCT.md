# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Scope

Este registro cubre **el sitio de marketing de develOP** — la superficie pública: home, las cuatro landings de servicio (`/web-development`, `/ai-implementations`, `/process-automation`, `/software-development`) y `/contact`.

**Fuera de alcance.** El mismo repositorio contiene un portal de producto (`/admin/*`, `/dashboard/*`, el módulo LeadOS del setter y el chatbot). El portal tiene su propio lenguaje visual ya cerrado y no está en agenda de rediseño. Ninguna decisión de este archivo aplica a pantallas de portal.

## Users

Dueños de PyMEs de Argentina y LATAM, **sin perfil técnico**. Deciden ellos mismos; no hay comité ni CTO intermediando.

Verticales principales: **concesionarias, inmobiliarias, clínicas.**

Situación en la que llegan: tienen un problema operativo concreto (pierden consultas, contestan a mano, no tienen sistema) y están evaluando a quién contratar. No están comparando frameworks — están decidiendo si confiar.

El trabajo que vienen a hacer: entender qué hace develOP, si resuelve su caso, y encontrar cómo hablar con alguien.

## Product Purpose

develOP es una **agencia de ingeniería de software de dos personas en Tucumán, Argentina**. Vende cuatro servicios: desarrollo web, agentes de IA, automatización de procesos y software a medida.

El sitio existe para una sola cosa: **que el prospecto escriba por WhatsApp para coordinar una llamada.** Un solo CTA en todo el sitio. El sitio no vende, no cierra y no cobra — califica y deriva a conversación.

Éxito = conversaciones iniciadas por WhatsApp con prospectos del perfil correcto. No pageviews, no tiempo en página, no descargas.

## Positioning

Equipo de dos, no agencia de veinte. El prospecto habla con quien construye — no con un ejecutivo de cuentas. Eso permite prometer especificidad (un caso de concesionaria, no "soluciones para retail") y es lo que una agencia más grande no puede copiar honestamente.

Alcance argentino/LATAM y presencia local en Tucumán: se habla el idioma del negocio del cliente, no el del proveedor.

## Operating Context

- **Canal de conversión único: WhatsApp.** No hay formulario largo, no hay demo agendada por calendario, no hay pricing público en el sitio. El sitio termina en un mensaje.
- El prospecto entra casi siempre desde el celular. La lectura es rápida y en movimiento.
- El vocabulario del visitante es el de su negocio ("pierdo consultas", "contesto de noche"), no el de software ("pipeline", "integración").

## Capabilities and Constraints

Cuatro servicios, cada uno con landing propia y un color de acento fijo:

| Servicio | Ruta | Acento |
|---|---|---|
| Desarrollo web | `/web-development` | cyan |
| Agentes de IA | `/ai-implementations` | verde |
| Automatización de procesos | `/process-automation` | ámbar |
| Software a medida | `/software-development` | índigo |

Restricciones técnicas vigentes: Next.js 16 (App Router), TypeScript estricto, Tailwind 4, Framer Motion. Sistema de diseño propio en `logic-core-v3/src/components/design-system/` con tokens en el bloque `@theme` de `globals.css` y una página `/styleguide`. La navegación del sitio público usa `triggerTransition()`; no `router.push()`.

Sin decidir todavía (no inventar): estructura definitiva de capítulos del home post-rediseño.

## Brand Commitments

- **Nombre:** develOP. Logo en `logodevelOP.svg` / `logodevelOP.png` (raíz del repo).
- **Voz:** voseo rioplatense. Frases cortas. Datos concretos por encima de adjetivos.
- **Voz — prohibido:** jerga de agencia. Nada de "soluciones integrales", "potenciamos tu negocio", "llevamos tu empresa al siguiente nivel".
- **Un solo CTA en todo el sitio.** Escribir por WhatsApp. No se agregan CTAs secundarios compitiendo.
- **Los cuatro colores de acento por servicio son fijos** y no se cambian (ver tabla arriba).
- **Tipografía comprometida:** Geist y Geist Mono. No se incorporan familias nuevas.

## Evidence on Hand

- Sistema de diseño real y funcionando: `src/components/design-system/`, tokens en `globals.css`, página `/styleguide`.
- Baseline de calidad medido: `logic-core-v3/docs/impeccable-baseline.md` (detector Impeccable v3.5.0, 2026-07-31).
- Portal de producto real y en uso, que respalda la afirmación de que develOP construye software — pero **no es contenido del sitio de marketing**.

**Ausencias que no se deben fabricar:** no hay testimonios verificados, ni logos de clientes autorizados, ni benchmarks públicos, ni casos de estudio publicados, ni pricing. Ninguna pieza del sitio puede inventarlos.

## Product Principles

1. **Una sola acción.** Todo el sitio empuja a un único destino: escribir por WhatsApp. Cualquier elemento que compita con eso se saca.
2. **Concreto sobre adjetivo.** Un número, un plazo o un caso vale más que tres calificativos. Si no se puede sostener con un dato, no se dice.
3. **El idioma del cliente, no el del proveedor.** Se nombra el problema del negocio, no la tecnología que lo resuelve.
4. **Dos personas es una ventaja, no una disculpa.** El tamaño se declara; no se disimula con lenguaje corporativo.
5. **Nada que no exista.** Sin testimonios, logos, métricas ni casos inventados. La ausencia de prueba se resuelve con especificidad, no con relleno.

## Accessibility & Inclusion

Contraste mínimo WCAG AA. Toda animación respeta `prefers-reduced-motion`. Elementos con solo ícono llevan `aria-label`. Audiencia mayoritariamente mobile: los objetivos táctiles y la legibilidad en pantalla chica son requisito, no mejora.
