---
name: develOP — sitio público
description: Instrumento de precisión, editorial. Monocromo cálido, superficies planas, relieve solo en lo que se aprieta.
colors:
  void: "#0D0B09"
  surface: "#151210"
  ink: "#EDE9E1"
  ink-muted: "#A39C8F"
  border: "rgba(237, 233, 225, 0.10)"
  control-stroke: "rgba(237, 233, 225, 0.42)"
  light-bg: "#F2EEE6"
  light-surface: "#EAE5DA"
  light-ink: "#1A1713"
  light-ink-muted: "#6E675C"
  light-border: "rgba(26, 23, 19, 0.12)"
  light-control-stroke: "rgba(26, 23, 19, 0.52)"
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
  subhead:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 2.9vw, 2.375rem)"
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.6vw, 1.375rem)"
    lineHeight: 1.55
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.18vw, 1.0625rem)"
    lineHeight: 1.7
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    lineHeight: 1.2
    letterSpacing: "0.18em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "clamp(1.5rem, 3.5vw, 3rem)"
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
    borderColor: "{colors.control-stroke}"
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

> **Gate 1 — CERRADO (B2-S4).** Ganó la **opción A, la del código**: web cian · IA verde · automatización ámbar · software violeta. Es la permutación que la tabla de arriba ya reflejaba, así que no se movió ningún hex. El brief de dirección nombraba el acento de Software como *índigo* contra el `#8b5cf6` (violeta) vigente; queda el token, no el nombre del brief. `/styleguide` sigue mostrando las dos permutaciones como referencia de por qué se eligió esta.

### Neutral

- **Panel** (`{colors.surface}`) / **Panel Claro** (`{colors.light-surface}`): el único escalón de superficie sobre el lienzo. No hay tercero.
- **Tinta Apagada** (`{colors.ink-muted}`) / **Grafito Apagado** (`{colors.light-ink-muted}`): texto secundario, metadatos, pies.
- **Regla** (`{colors.border}`) / **Regla Clara** (`{colors.light-border}`): divisiones de 1px. Es el único borde del sistema.

### Named Rules

**La Regla de la Voz Única.** Nunca dos acentos en una misma vista. El acento identifica al servicio; dos acentos no identifican nada. La única excepción documentada es la sección de los cuatro frentes, donde el color *es* lo que distingue una fila de otra.

**La Regla del Acento Plano.** El acento se usa como color sólido. Nunca en gradiente, nunca como glow, nunca como sombra de color.

**La Regla de la Dosis Mínima es de Color, no de Área.** El acento vivía en un tick de 6×6 px — 36 px² por fila. Con tan poca área, sacarle el color a las cuatro filas de servicios casi no perdía información: un identificador que no identifica. El acento se aplica sobre superficie **grande y plana** (el nombre del frente, su plazo, una cifra); lo que se raciona es en cuántos lugares aparece y con qué forma, no cuánto mide. "Discreto" no significa "diminuto".

**La Regla del Acento sobre Oscuro.** Los cuatro acentos viven **solo sobre tema oscuro**. No es una limitación pendiente de resolver: es la regla. Tres de los cuatro no llegan a 3:1 sobre el lienzo crema, así que sobre claro no pueden portar información.

| Acento | Sobre `void` | Sobre `light-bg` |
|---|---|---|
| Cian (web) | 8.09:1 | 2.10:1 ✗ |
| Verde (IA) | 7.74:1 | 2.19:1 ✗ |
| Ámbar (automatización) | 9.15:1 | 1.86:1 ✗ |
| Violeta (software) | 4.64:1 | 3.66:1 |

Ninguna sección crema lleva acento. Una sección que necesita acento es, por esa sola razón, una sección oscura.

**La Regla de que la Distinguibilidad Depende del Área.** Cian contra verde es el par más cercano del sistema: 0.125 de distancia OKLab, la mitad del siguiente par, con luminancia casi igual (L 0.715 contra 0.696). Medido así, sobre el papel, el par parece un problema. **No lo es**, y la razón es que la distancia OKLab no se juzga sola: la distinguibilidad de dos colores parecidos crece con el área que ocupan. En 36 px² de tick el par era efectivamente indistinguible; en los 13.704 y 16.646 px² que hoy ocupan los nombres de los frentes, se separan sin esfuerzo.

> **Verificado mirando, no calculando (B2-S4).** Se capturó la sección de los cuatro frentes a 1440 y a 390 con los cuatro acentos puestos, y en las dos anchuras las cuatro filas se distinguen por su acento — cian lee azulado y verde lee verde, incluso en las mono de 12px de los plazos. El punto queda **cerrado y no se movió ningún hex**. Evidencia: [`servicios-1440-antes.png`](logic-core-v3/docs/proof-screenshots/b2-s4/servicios-1440-antes.png) y [`servicios-390-antes.png`](logic-core-v3/docs/proof-screenshots/b2-s4/servicios-390-antes.png).
>
> Corrige de paso una instrucción errada del sprint anterior: sobre lienzo oscuro, para subir contraste hay que **aclarar**, no oscurecer. No hizo falta aplicarla, pero queda escrita para que nadie la aplique al revés.

> **Una observación abierta.** El violeta es el más flojo de los cuatro sobre oscuro (4.64:1 contra 7.7–9.1) — sigue pasando 3:1, pero desparejo. Se anota medido; no se toca, porque los cuatro hex están congelados en `CLAUDE.md`.

**La Regla de la Inversión Local.** El tema lo escribe la sección en su propio `<section>` (`data-ds-theme`), no un provider global. Una sección oscura anidada en una crema tiene que funcionar sin que nadie la configure.

**La Regla de la Alternancia Estricta.** La inversión es el dispositivo de ritmo del sistema, así que **no hay dos secciones seguidas con el mismo tema**. El home alterna oscuro · crema · oscuro · crema · oscuro · crema. Dos capítulos contiguos del mismo tema son 236px de fondo idéntico (118px de padding inferior + 118 de superior) sin ningún corte: ahí el ritmo simplemente no existe.

La alternancia y la Regla del Acento sobre Oscuro se restringen entre sí, y el orden de las secciones se decide con las dos a la vez: **una sección que necesita acento tiene que caer en una posición oscura.** Por eso los cuatro frentes van quintos y los contrastes cuartos, y no al revés. Cerrar en crema es consecuencia deseada: obliga a que el CTA funcione sobre claro, que era un hueco real del sistema.

## Typography

**Display Font:** Geist (fallback `system-ui, sans-serif`)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (fallback `ui-monospace, monospace`)

**Character:** Una sola familia sostiene display y cuerpo — la jerarquía la produce la escala y el tracking negativo, no un cambio de tipo. La monoespaciada es lo único que rompe esa unidad, y por eso funciona como identidad: eyebrows, labels de capítulo y cifras se leen como instrumental, no como texto.

### Hierarchy

- **Display** (`clamp(3.25rem, 8vw, 7rem)`, line-height 0.98, tracking −0.03em): titulares de apertura. Uno por pantalla.
- **Headline** (`clamp(2.25rem, 5vw, 4.25rem)`, line-height 1.05, tracking −0.02em): apertura de capítulo dentro de la página.
- **Subhead** (`clamp(1.625rem, 2.9vw, 2.375rem)`, line-height 1.25, tracking −0.01em): subtítulo de bloque. Abre una unidad DENTRO de una sección — un frente de servicio, un contraste. Es el peldaño entre el titular y el lead.
- **Lead** (`clamp(1.25rem, 1.6vw, 1.375rem)`, line-height 1.55): bajada. Corta a 42ch — más angosto que la prosa, a propósito.
- **Body** (`clamp(1rem, 1.18vw, 1.0625rem)`, line-height 1.7): prosa. Medida máxima 65ch.
- **Label** (Geist Mono, `0.75rem`, tracking 0.18em): eyebrows y labels de capítulo.
- **Data** (Geist Mono, `clamp(1.5rem, 3.5vw, 3rem)`, weight 500, line-height 1): cifras. Es el único lugar donde un número puede ser grande — pero nunca más grande que el titular de su sección.

### Named Rules

**La Regla del Tracking.** El display gana peso visual por tamaño y tracking negativo, nunca por una familia distinta. No se incorporan fuentes nuevas.

**La Regla de la Mono como Dato.** Geist Mono se reserva para labels, eyebrows y cifras. Un párrafo de cuerpo en monoespaciada rompe el sistema.

**La Regla del Piso como Escala.** En mobile todos los `clamp()` tocan su piso a la vez, así que el piso no es una lista de mínimos sueltos: **es la escala que ve la mayoría de la audiencia**, y se elige como escala. Dos invariantes, verificadas con un barrido continuo de 320 a 1920px y no solo en los breakpoints:

| Invariante | Por qué | Antes (390px) | Ahora (peor caso) |
|---|---|---|---|
| `lead` / `body` ≥ 1.20 | A 18 contra 17 el único separador real era el color: dos niveles que no se distinguen no son dos niveles | 1.06 | **1.25** |
| `data` / `display-lg` ≤ 0.75 | La cifra no puede competir con el titular de su propia sección | 0.89 | **0.71** |

**La Regla de la Medida en `ch`.** Las medidas de lectura se cuentan en caracteres, no en píxeles — pero `ch` es relativo al `font-size` **del propio elemento**. El subhead a 55ch sobre 22px rendía 802px contra los 732px de la prosa a 65ch sobre 17px: el orden declarado y el renderizado eran opuestos. Al fijar una medida nueva hay que compararla en píxeles a su tamaño real, no en el número declarado.

## Layout

Container de página de 1240px con gutter fluido (`clamp(1.25rem, 4vw, 3rem)`). El ritmo vertical lo marca un único paso de sección (`clamp(6rem, 14vh, 11rem)`) — las secciones respiran igual entre sí, y la variación se produce dentro, no en el espaciado entre bloques.

La prosa corta a 65ch y la bajada a 42ch. Esas dos medidas —no el ancho del container— son las que gobiernan la línea de lectura. Medidas a su tamaño real: ≈732px la prosa y ≈612px la bajada (ver *La Regla de la Medida en `ch`*).

Estructura editorial: cada sección es un capítulo con su label mono, su apertura y su regla divisoria. La página se recorre como un documento, no como una grilla de cards.

La audiencia es mayoritariamente mobile: la escala fluida está calibrada para que el display siga siendo display en 390px, no para que se degrade a un título común.

## Elevation & Depth

**Este sistema es plano por defecto y no usa sombras ambientales.** La profundidad se consigue por capas tonales (lienzo → panel), por la regla de 1px, y por la inversión de tema entre secciones. No hay `backdrop-filter`, no hay glassmorphism, no hay sombras de color.

### Shadow Vocabulary

- **Relieve de control**: dos capas — un canto duro que da el grosor físico y una difusa corta que lo apoya. **Exclusivo del CTA primario.** Se apaga por completo en `:active`. Se invierte con el tema, porque una sombra calculada contra lienzo oscuro sobre crema se lee como una mancha, no como un objeto apoyado:
  - oscuro: `0 2px 0 rgba(0,0,0,.9), 0 3px 6px rgba(0,0,0,.5)`
  - crema: `0 2px 0 rgba(26,23,19,.30), 0 3px 6px rgba(26,23,19,.16)`

  Misma **forma** en los dos temas —dos capas, mismos offsets—; lo único que cambia es cuánta sombra proyecta la superficie.

- **Borde de control** (`{colors.control-stroke}`): la frontera del control secundario, que es plano y por lo tanto no tiene relieve que lo delate. Es un token propio y **no** el de regla: 3.55:1 en oscuro y 3.48:1 en crema, contra los ~1.25:1 del token de división.

### Named Rules

**La Regla del Relieve Táctil.** Si no se puede apretar, es plano. El relieve es la señal de que algo es interactivo; usarlo en un panel decorativo lo vuelve ruido y deja al botón sin voz.

**La Regla de las Dos Señales.** El relieve son exactamente dos capas de sombra. Tenía una tercera —un canto superior iluminado— que medía 1.18:1 contra el fondo del propio botón: no era una señal débil, era una línea que no existía más que en la spec. Una señal que no se puede medir no cuenta como señal.

**La Regla del Contrapeso.** Si un control es plano, su borde tiene que llegar a 3:1 (WCAG 1.4.11). El secundario usaba el token de regla y quedaba en 1.23:1: sin frontera en reposo, aparecía recién en `hover` —o sea nunca a touch— y el `hover` terminaba siendo más visible que el estado normal. **Ningún estado puede ser más visible que el reposo.**

## Shapes

Dos radios y nada en el medio. **Superficies a radio 0** (`{rounded.surface}`): paneles, secciones, contenedores, imágenes. **Controles a 9px** (`{rounded.control}`): botones y campos. El salto entre 0 y 9 es deliberado — una escala de radios intermedios diluiría la señal.

El borde es siempre de 1px y siempre del token de regla. No hay bordes de 2px, no hay bordes de acento, no hay bordes laterales gruesos (`border-left: 4px solid` es una anti-referencia explícita).

## Components

### Buttons

- **Shape:** radio de control (9px). Padding generoso (`28px` horizontal, `16px` vertical), tamaño de texto `1rem` con line-height 1 — no hereda el 1.7 del cuerpo.
- **Primary:** inversión monocroma — fondo tinta sobre lienzo oscuro, texto del color del lienzo, más el relieve de dos capas (que se invierte con el tema). Sin canto superior iluminado: ver *La Regla de las Dos Señales*.
- **Hover / Focus:** hover baja la opacidad al 90%. **Sin `scale` y sin `letter-spacing` animado** — el CTA anterior animaba tracking y provocaba reflow del texto en cada hover. Foco visible: `outline` de 2px con offset de 2px.
- **Active:** hunde 2px (`translate-y`) y apaga la sombra. Es el estado que declara que el objeto es físico. **Un solo press**: convivía con un `whileTap: scale .97` de Framer Motion, y los dos se aplicaban a la vez porque animan propiedades distintas (`translate` contra `transform`). Un objeto físico se hunde; no se comprime.
- **Secondary:** plano. Fondo transparente y borde de control (no el de regla — ver *La Regla del Contrapeso*); el hover sube el borde a tinta, el active hunde 1px. No lleva relieve porque competiría con el primario.
- **Disabled:** `opacity: .5` sobre el borde de control deja 1.73:1 en oscuro y 1.74:1 en crema — más visible que el borde en **reposo** del diseño anterior (1.23:1). WCAG exime a los controles inactivos del mínimo de 3:1; lo que se exige acá es que se siga percibiendo, y se percibe.
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

**El índice de capítulos.** Si la sección-como-capítulo es la firma, el índice tiene que existir de verdad: **todas** las secciones llevan su `ChapterLabel`, correlativo y sin saltos. Estaba aplicado en 2 de 6 y con dos formatos distintos —`( 01 )` en la segunda sección, `( 03 — Un lunes cualquiera )` en la tercera—, o sea dos marcas sueltas que no numeraban nada.

Dos decisiones, que se replican tal cual en las cuatro landings:

- **El formato es solo el número**: `( 01 )`. El título repetía el titular de la sección, que va justo debajo. La prop `title` queda para superficies que no sean el home, donde el número solo no alcanza para ubicar al lector.
- **El hero lleva número, y es el `01`.** Una portada sin numerar deja el índice arrancando en "01" sobre la segunda sección — exactamente la inconsistencia que se estaba corrigiendo. En el hero va en la misma fila que el eyebrow: son dos etiquetas mono del mismo peso, y apiladas leen como dos kickers en pugna.

### Motion

Jerárquica y escasa. Reveals de sección: `opacity` + `translateY`, ~0.9s, `once` — no se repiten al volver a subir. Transiciones de estado: 150ms `ease-out` sobre `translate`, `box-shadow` y `opacity`. Todo respeta `prefers-reduced-motion` (`motion-reduce:transition-none`).

El press del CTA es **CSS puro** (`:active`), no Framer Motion. Con `prefers-reduced-motion` no desaparece: se vuelve instantáneo. Un cambio de estado inmediato no es movimiento — quitarlo dejaría al botón sin acuse de recibo justo para quien pidió menos animación.

## Do's and Don'ts

### Do:

- **Do** usar radio 0 en superficies y 9px solo en controles.
- **Do** darle relieve únicamente a lo que se aprieta: sombra de dos capas + hundimiento de 2px en `:active`.
- **Do** numerar TODAS las secciones con `ChapterLabel`, correlativo y solo con el número.
- **Do** elegir los pisos de los `clamp()` como una escala, no como mínimos sueltos.
- **Do** dejar que la sección declare su tema (`data-ds-theme`) en vez de pasar colores por props.
- **Do** cortar la prosa a 65ch y la bajada a 42ch.
- **Do** usar Geist Mono para eyebrows, labels de capítulo y cifras — es identidad, no ornamento.
- **Do** animar solo `transform` y `opacity`.
- **Do** agregar un token cuando falta un valor. Se agrega el token, no un valor suelto.

### Don't:

- **Don't** usar `backdrop-blur` ni glassmorphism en ninguna superficie.
- **Don't** usar gradientes decorativos, ni `bg-clip-text` con gradiente en titulares o métricas.
- **Don't** usar sombras de color ni glow de acento.
- **Don't** mostrar dos acentos de servicio en una misma vista (única excepción: la sección de los cuatro frentes).
- **Don't** poner un acento de servicio sobre tema crema — tres de los cuatro no llegan a 3:1.
- **Don't** dejar que un estado (`hover`, `focus`) sea más visible que el reposo.
- **Don't** dejar animaciones perpetuas (`infinite`), typewriters ni cursores custom.
- **Don't** escalar cards en hover ni animar `letter-spacing`, `width`, `height`, `padding` o `margin`.
- **Don't** poner un borde lateral grueso de acento (`border-left: 4px solid`) como decoración de card.
- **Don't** incorporar familias tipográficas nuevas.
