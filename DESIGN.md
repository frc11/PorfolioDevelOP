---
name: develOP — sitio público
description: Instrumento de precisión, editorial. Monocromo cálido, superficies planas, relieve solo en lo que se aprieta.
colors:
  void: "#0D0B09"
  surface: "#151210"
  ink: "#EDE9E1"
  ink-muted: "#A39C8F"
  border: "rgba(237, 233, 225, 0.10)"
  light-bg: "#F2EEE6"
  light-surface: "#EAE5DA"
  light-ink: "#1A1713"
  light-ink-muted: "#6E675C"
  light-border: "rgba(26, 23, 19, 0.12)"
  accent-web: "#06b6d4"
  accent-ia: "#10b981"
  accent-automation: "#f59e0b"
  accent-software: "#8b5cf6"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 8vw, 7rem)"
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 4.25rem)"
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.6vw, 1.375rem)"
    lineHeight: 1.55
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.7
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    lineHeight: 1.2
    letterSpacing: "0.18em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1
rounded:
  surface: "0px"
  control: "9px"
spacing:
  section: "clamp(6rem, 14vh, 11rem)"
  gutter: "clamp(1.25rem, 4vw, 3rem)"
components:
  cta-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    rounded: "{rounded.control}"
    padding: "16px 28px"
    typography: "1rem/1"
  cta-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px 28px"
    typography: "1rem/1"
  surface-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: develOP — sitio público

## Overview

**Creative North Star: "El instrumento de precisión"**

El sitio se comporta como un objeto fabricado, no como una página. La superficie es plana, quieta y monocroma; el color y el movimiento son recursos escasos que se gastan solo donde hay algo que señalar. La estructura es editorial: capítulos numerados, labels en monoespaciada, reglas de 1px que dividen. La lectura es la de una ficha técnica bien compuesta — densa donde importa, con aire alrededor.

Lo táctil está racionado con una regla dura: **si no se puede apretar, es plano.** Un panel no tiene relieve, no tiene sombra de color, no tiene desenfoque de fondo. Un botón sí: radio de 9px, canto superior iluminado, sombra corta de dos capas, y un hundimiento visible de 2px al presionar. Esa asimetría es la que convierte el relieve en información en vez de decoración.

El sistema se rechaza a sí mismo en su versión anterior. Lo que se está eliminando —glassmorphism, `backdrop-blur`, gradientes decorativos, sombras de color, radios grandes en superficies, motion perpetuo, cards que escalan en hover, cursores custom, typewriters— no es materia de gusto: es la lista de anti-referencias del rediseño.

Referencias tomadas: `otsuka-air.jp` y `coffee-tech.com` — el producto como objeto físico protagonista, estructura editorial por capítulos, monocromo con acento mínimo. **Sin serif de lujo.**

**Key Characteristics:**
- Monocromo cálido, con inversión de tema por sección (oscuro ↔ crema)
- Radio 0 en superficies, 9px solo en controles
- Geist para escala y tracking negativo; Geist Mono como elemento de identidad
- Un acento por servicio, en dosis mínimas, nunca en gradiente
- Reveals sobrios (opacity + translateY, `once`), cero movimiento perpetuo

## Colors

Base monocroma cálida — el negro tira a marrón y el claro a papel, no a blanco clínico. El acento aparece por servicio y casi nunca.

### Primary

- **Tinta Hueso** (`{colors.ink}`): el texto y todo lo que en tema oscuro tiene que leerse primero. También es el fondo del CTA primario, que invierte contra el lienzo.
- **Vacío Cálido** (`{colors.void}`): el lienzo por defecto. No es negro puro; el matiz cálido evita el contraste quirúrgico.

### Secondary

- **Papel** (`{colors.light-bg}`) y **Tinta Grafito** (`{colors.light-ink}`): el tema invertido. Las secciones alternan crema y oscuro a lo largo del scroll — la inversión es ritmo estructural, no un toggle de usuario.

### Tertiary

Un acento por servicio, y solo uno visible por vista:

- **Cian** (`{colors.accent-web}`) — Desarrollo web
- **Verde** (`{colors.accent-ia}`) — Agentes de IA
- **Ámbar** (`{colors.accent-automation}`) — Automatización de procesos
- **Violeta** (`{colors.accent-software}`) — Software a medida

> **Decisión abierta (Gate 1).** El brief de dirección nombra el acento de Software como *índigo*, y el token vigente es `#8b5cf6` (violeta). Además, `globals.css` deja anotado que `CLAUDE.md` asigna estos mismos cuatro hex a servicios distintos — una permutación alternativa. `/styleguide` muestra las dos opciones y **Franco elige**. Hasta que elija, la tabla de arriba refleja el código, no una decisión tomada. No resolver acá.

### Neutral

- **Panel** (`{colors.surface}`) / **Panel Claro** (`{colors.light-surface}`): el único escalón de superficie sobre el lienzo. No hay tercero.
- **Tinta Apagada** (`{colors.ink-muted}`) / **Grafito Apagado** (`{colors.light-ink-muted}`): texto secundario, metadatos, pies.
- **Regla** (`{colors.border}`) / **Regla Clara** (`{colors.light-border}`): divisiones de 1px. Es el único borde del sistema.

### Named Rules

**La Regla de la Voz Única.** Nunca dos acentos en una misma vista. El acento identifica al servicio; dos acentos no identifican nada.

**La Regla del Acento Plano.** El acento se usa como color sólido. Nunca en gradiente, nunca como glow, nunca como sombra de color.

**La Regla de la Inversión Local.** El tema lo escribe la sección en su propio `<section>` (`data-ds-theme`), no un provider global. Una sección oscura anidada en una crema tiene que funcionar sin que nadie la configure.

## Typography

**Display Font:** Geist (fallback `system-ui, sans-serif`)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (fallback `ui-monospace, monospace`)

**Character:** Una sola familia sostiene display y cuerpo — la jerarquía la produce la escala y el tracking negativo, no un cambio de tipo. La monoespaciada es lo único que rompe esa unidad, y por eso funciona como identidad: eyebrows, labels de capítulo y cifras se leen como instrumental, no como texto.

### Hierarchy

- **Display** (`clamp(3.25rem, 8vw, 7rem)`, line-height 0.98, tracking −0.03em): titulares de apertura. Uno por pantalla.
- **Headline** (`clamp(2.25rem, 5vw, 4.25rem)`, line-height 1.05, tracking −0.02em): apertura de capítulo dentro de la página.
- **Lead** (`clamp(1.125rem, 1.6vw, 1.375rem)`, line-height 1.55): subhead. Corta a 55ch — más angosto que la prosa, a propósito.
- **Body** (`1.0625rem`, line-height 1.7): prosa. Medida máxima 65ch.
- **Label** (Geist Mono, `0.75rem`, tracking 0.18em): eyebrows y labels de capítulo.
- **Data** (Geist Mono, `clamp(2rem, 4vw, 3.5rem)`, weight 500, line-height 1): cifras. Es el único lugar donde un número puede ser grande.

### Named Rules

**La Regla del Tracking.** El display gana peso visual por tamaño y tracking negativo, nunca por una familia distinta. No se incorporan fuentes nuevas.

**La Regla de la Mono como Dato.** Geist Mono se reserva para labels, eyebrows y cifras. Un párrafo de cuerpo en monoespaciada rompe el sistema.

## Layout

Container de página de 1240px con gutter fluido (`clamp(1.25rem, 4vw, 3rem)`). El ritmo vertical lo marca un único paso de sección (`clamp(6rem, 14vh, 11rem)`) — las secciones respiran igual entre sí, y la variación se produce dentro, no en el espaciado entre bloques.

La prosa corta a 65ch y el subhead a 55ch. Esas dos medidas —no el ancho del container— son las que gobiernan la línea de lectura.

Estructura editorial: cada sección es un capítulo con su label mono, su apertura y su regla divisoria. La página se recorre como un documento, no como una grilla de cards.

La audiencia es mayoritariamente mobile: la escala fluida está calibrada para que el display siga siendo display en 390px, no para que se degrade a un título común.

## Elevation & Depth

**Este sistema es plano por defecto y no usa sombras ambientales.** La profundidad se consigue por capas tonales (lienzo → panel), por la regla de 1px, y por la inversión de tema entre secciones. No hay `backdrop-filter`, no hay glassmorphism, no hay sombras de color.

### Shadow Vocabulary

- **Relieve de control** (`box-shadow: 0 2px 0 rgba(0,0,0,0.9), 0 3px 6px rgba(0,0,0,0.5)`): dos capas — un canto duro que da el grosor físico y una difusa corta que lo apoya. **Exclusivo del CTA primario.** Se apaga por completo en `:active`.

### Named Rules

**La Regla del Relieve Táctil.** Si no se puede apretar, es plano. El relieve es la señal de que algo es interactivo; usarlo en un panel decorativo lo vuelve ruido y deja al botón sin voz.

## Shapes

Dos radios y nada en el medio. **Superficies a radio 0** (`{rounded.surface}`): paneles, secciones, contenedores, imágenes. **Controles a 9px** (`{rounded.control}`): botones y campos. El salto entre 0 y 9 es deliberado — una escala de radios intermedios diluiría la señal.

El borde es siempre de 1px y siempre del token de regla. No hay bordes de 2px, no hay bordes de acento, no hay bordes laterales gruesos (`border-left: 4px solid` es una anti-referencia explícita).

## Components

### Buttons

- **Shape:** radio de control (9px). Padding generoso (`28px` horizontal, `16px` vertical), tamaño de texto `1rem` con line-height 1 — no hereda el 1.7 del cuerpo.
- **Primary:** inversión monocroma — fondo tinta sobre lienzo oscuro, texto del color del lienzo. Canto superior de 1px más claro que el fondo, más el relieve de dos capas. El valor del canto se invierte con el tema.
- **Hover / Focus:** hover baja la opacidad al 90%. **Sin `scale` y sin `letter-spacing` animado** — el CTA anterior animaba tracking y provocaba reflow del texto en cada hover. Foco visible: `outline` de 2px con offset de 2px.
- **Active:** hunde 2px (`translate-y`) y apaga la sombra. Es el estado que declara que el objeto es físico.
- **Secondary:** plano. Borde de regla, fondo transparente; el hover sube el borde a tinta, el active hunde 1px. No lleva relieve porque competiría con el primario.
- **Icono:** una flecha final, opcional. Es el único ícono que admite el sistema en un CTA (`strokeWidth={1.5}`).

### Cards / Containers

- **Corner Style:** radio 0.
- **Background:** panel sobre lienzo.
- **Shadow Strategy:** ninguna. Ver *Elevation & Depth*.
- **Border:** 1px del token de regla.
- **Internal Padding:** escala de cuatro pasos (`0 / 16px / 24px / 32–40px`).
- **Sin hover.** Un panel no responde al puntero porque no se aprieta.

### Signature: la sección como capítulo

El wrapper de sección es el dueño del theming. Escribe su tema en su propio elemento, y todo lo que esté adentro toma los colores sin recibir ninguna prop. Anida, funciona sin provider, y avisa al tema global cuando ocupa la banda central del viewport para que el fondo del documento acompañe. El ritmo dark/crema del home sale de acá.

### Motion

Jerárquica y escasa. Reveals de sección: `opacity` + `translateY`, ~0.9s, `once` — no se repiten al volver a subir. Transiciones de estado: 150ms `ease-out` sobre `translate`, `box-shadow` y `opacity`. Todo respeta `prefers-reduced-motion` (`motion-reduce:transition-none`), y el press del botón está gateado contra `useReducedMotion()`.

## Do's and Don'ts

### Do:

- **Do** usar radio 0 en superficies y 9px solo en controles.
- **Do** darle relieve únicamente a lo que se aprieta: canto iluminado + sombra de dos capas + hundimiento de 2px en `:active`.
- **Do** dejar que la sección declare su tema (`data-ds-theme`) en vez de pasar colores por props.
- **Do** cortar la prosa a 65ch y el subhead a 55ch.
- **Do** usar Geist Mono para eyebrows, labels de capítulo y cifras — es identidad, no ornamento.
- **Do** animar solo `transform` y `opacity`.
- **Do** agregar un token cuando falta un valor. Se agrega el token, no un valor suelto.

### Don't:

- **Don't** usar `backdrop-blur` ni glassmorphism en ninguna superficie.
- **Don't** usar gradientes decorativos, ni `bg-clip-text` con gradiente en titulares o métricas.
- **Don't** usar sombras de color ni glow de acento.
- **Don't** mostrar dos acentos de servicio en una misma vista.
- **Don't** dejar animaciones perpetuas (`infinite`), typewriters ni cursores custom.
- **Don't** escalar cards en hover ni animar `letter-spacing`, `width`, `height`, `padding` o `margin`.
- **Don't** poner un borde lateral grueso de acento (`border-left: 4px solid`) como decoración de card.
- **Don't** incorporar familias tipográficas nuevas.
