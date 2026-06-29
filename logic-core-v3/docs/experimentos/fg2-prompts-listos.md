# FG-2.0 — Los 10 prompts del experimento, listos para pegar

> 🤖 **Generado** por `scripts/_experimental/fg2-gen-prompts.ts` desde `CASOS_GASTRO`.
> No editar a mano: si cambia un caso, regenerá con el comando del encabezado del script.
>
> **Cómo se usa:** por cada negocio hay un prompt **A (formulario)** y un prompt
> **B (a mano)**. Pegá uno por vez en Claude Design, generá, cronometrá, mirá la
> demo y registrá calidad + costo. El paso a paso está en `fg2-brief-experimento.md`.
>
> ⚠️ Los WhatsApp son números de ejemplo: la calidad de la demo no depende del
> dígito. Reemplazalos por el real solo si querés probar que el link abre el chat.

---

## Negocio 1 — Noir Dining (Yerba Buena)

- **Procedencia:** Real — ficha cargada en un seed del repo (verbatim).
- **Nota de datos:** Ficha verbatim de scripts/demos-seed-review-queue.ts (reseñas, contenido, presencia e identidad). WhatsApp de ejemplo (el negocio reserva por DM, sin número público en el seed).
- **Decisiones del formulario:** estilo `nocturno-premium` · tono `sofisticado` · CTA `reserva` · 7 secciones

### A1 · Prompt del FORMULARIO (~609 tokens, 381 palabras)

```text
DEMO WEB — Noir Dining (Yerba Buena)
Rubro: Gastronomía

Construí una landing de UNA sola página para este negocio gastronómico. Seguí esta especificación al pie: es un brief estructurado, no una sugerencia.

DIRECCIÓN VISUAL
Modo nocturno premium: fondo oscuro, acentos dorados/ámbar, contraste alto, para cena o bar. Fotografía con luz cálida y sombras. Sensación elegante, de ocasión especial.
Tono del copy: Sofisticado y cuidado: prolijo, descriptivo con los platos, sin ser acartonado.
Color de marca a respetar: Negro profundo con acentos cálidos dorados, serif elegante

SECCIONES (en este orden exacto, ni más ni menos)
1. Hero a pantalla con la foto del plato/producto estrella, el nombre del negocio y una frase-gancho. CTA de WhatsApp visible desde el primer scroll.
2. Menú destacado: 3 a 6 platos con foto, nombre, breve descripción y precio. Grilla limpia y legible.
3. Sobre nosotros: historia corta y honesta del lugar y qué lo hace distinto.
4. Galería: 4 a 8 fotos reales del local y los platos, en grilla tipo mosaico.
5. Reseñas reales de clientes como prueba social, citadas textualmente — nunca inventar reseñas.
6. Ubicación y horarios: dirección, mapa embebido, días y horarios de atención.
7. Cierre con CTA fuerte de contacto (WhatsApp / reserva) y los datos del negocio.

LO QUE HACE ÚNICO AL NEGOCIO (usalo en el hero y el copy)
Menú degustación de cocina de autor en un salón dark e inmersivo; cupos limitados por noche, reservan con anticipación.

LLAMADO A LA ACCIÓN
Botón «Reservá tu mesa» que abre WhatsApp para coordinar la reserva.
WhatsApp real del negocio: 549000000001 (link wa.me, mensaje pre-cargado simple).
El botón de WhatsApp es el corazón comercial: siempre visible y alcanzable con el pulgar en mobile.

DATOS REALES (obligatorio — nada de placeholders ni lorem ipsum)
Reseñas reales como prueba social (textuales):
Reseñas que mencionan la ambientación y la cocina de autor.

Tono y contenido real del negocio:
Fotos propias de platos sobre fondo negro, logo serif.

Bajá el logo y las fotos reales de:
Instagram: https://instagram.com/noir.dining.demo

CALIDAD (no negociable)
Máximo 2–3 colores, tomados de la marca del negocio.
Jerarquía clara: un solo título grande por sección, espaciados consistentes.
Mobile-first: la mayoría la abre del celular. Nada cortado ni desbordado, textos legibles sin zoom.
Fotografía de comida protagonista: grande y apetitosa, nunca de stock genérico.
```

### B1 · Prompt LIBRE / a mano (~93 tokens, 62 palabras)

```text
Hola, necesito una landing de una sola página para Noir Dining, un restaurante de autor en Yerba Buena. Que sea oscura y elegante, tipo fine dining, con menú degustación. Poné un hero con una foto de plato, el menú, algo del ambiente y un botón para reservar por WhatsApp. Usá las fotos reales del Instagram (instagram.com/noir.dining.demo). Que quede bien en el celular.
```

---

## Negocio 2 — Pizzería Don Carlo (Barrio Norte)

- **Procedencia:** Real — ficha cargada en un seed del repo (verbatim).
- **Nota de datos:** Reseña y presencia verbatim de la ficha QA de scripts/b6-qa-outreach.ts; el seed no carga contenidoReal, así que la voz de marca es dirección representativa derivada de la identidad ("el dueño contesta los DMs"). WhatsApp de ejemplo.
- **Decisiones del formulario:** estilo `apetitoso-calido` · tono `cercano-familiar` · CTA `whatsapp-pedido` · 5 secciones

### A2 · Prompt del FORMULARIO (~568 tokens, 358 palabras)

```text
DEMO WEB — Pizzería Don Carlo (Barrio Norte)
Rubro: Gastronomía

Construí una landing de UNA sola página para este negocio gastronómico. Seguí esta especificación al pie: es un brief estructurado, no una sugerencia.

DIRECCIÓN VISUAL
Paleta cálida y apetitosa (terracota, mostaza, crema, marrón cálido). Fotografía de comida en primer plano, grande, que dé hambre. Sensación acogedora, de mesa servida. Una serif amable para los títulos.
Tono del copy: Cercano y familiar: tuteo, frases cortas, calidez, como te recibe el dueño.

SECCIONES (en este orden exacto, ni más ni menos)
1. Hero a pantalla con la foto del plato/producto estrella, el nombre del negocio y una frase-gancho. CTA de WhatsApp visible desde el primer scroll.
2. Menú destacado: 3 a 6 platos con foto, nombre, breve descripción y precio. Grilla limpia y legible.
3. Reseñas reales de clientes como prueba social, citadas textualmente — nunca inventar reseñas.
4. Ubicación y horarios: dirección, mapa embebido, días y horarios de atención.
5. Cierre con CTA fuerte de contacto (WhatsApp / reserva) y los datos del negocio.

LO QUE HACE ÚNICO AL NEGOCIO (usalo en el hero y el copy)
Pizza a la piedra; el dueño atiende y arma cada pedido en persona.

LLAMADO A LA ACCIÓN
Botón grande «Pedí por WhatsApp» que abre el chat con un mensaje pre-cargado simple.
WhatsApp real del negocio: 549000000002 (link wa.me, mensaje pre-cargado simple).
El botón de WhatsApp es el corazón comercial: siempre visible y alcanzable con el pulgar en mobile.

DATOS REALES (obligatorio — nada de placeholders ni lorem ipsum)
Reseñas reales como prueba social (textuales):
"Atienden de diez pero nunca sé si está abierto" — reseña de Google.

Tono y contenido real del negocio:
Instagram activo con stories diarias de las pizzas del día; tono de barrio, cercano. El dueño contesta los DMs él mismo.

Bajá el logo y las fotos reales de:
Instagram: https://instagram.com/pizzeria.doncarlo.qa

CALIDAD (no negociable)
Máximo 2–3 colores, tomados de la marca del negocio.
Jerarquía clara: un solo título grande por sección, espaciados consistentes.
Mobile-first: la mayoría la abre del celular. Nada cortado ni desbordado, textos legibles sin zoom.
Fotografía de comida protagonista: grande y apetitosa, nunca de stock genérico.
```

### B2 · Prompt LIBRE / a mano (~70 tokens, 52 palabras)

```text
Necesito una web simple de una sola página para Pizzería Don Carlo, en Barrio Norte. Es pizza a la piedra y atiende el dueño. Que dé hambre, cálida. Un hero con la pizza, el menú con precios, las reseñas de Google y un botón de WhatsApp para pedir. El WhatsApp es 549000000002.
```

---

## Negocio 3 — Café La Esquina (Yerba Buena)

- **Procedencia:** Lead real del seed; contenido de ficha representativo (el seed no lo carga).
- **Nota de datos:** El lead, IG y Maps son del seed (scripts/b3-qa-assign-leads.ts), pero ese seed NO carga reseñas ni contenido de ficha. Sin reseñas reales → viaja SIN sección de reseñas. Estilo/tono/diferencial son dirección representativa de café de barrio. WhatsApp de ejemplo.
- **Decisiones del formulario:** estilo `rustico-artesanal` · tono `cercano-familiar` · CTA `ver-menu` · 6 secciones

### A3 · Prompt del FORMULARIO (~552 tokens, 344 palabras)

```text
DEMO WEB — Café La Esquina (Yerba Buena)
Rubro: Gastronomía

Construí una landing de UNA sola página para este negocio gastronómico. Seguí esta especificación al pie: es un brief estructurado, no una sugerencia.

DIRECCIÓN VISUAL
Estética rústica y artesanal: texturas de madera y papel kraft, paleta tierra (verde oliva, marrón, crema). Detalles hechos a mano. Sensación auténtica, de producto casero.
Tono del copy: Cercano y familiar: tuteo, frases cortas, calidez, como te recibe el dueño.

SECCIONES (en este orden exacto, ni más ni menos)
1. Hero a pantalla con la foto del plato/producto estrella, el nombre del negocio y una frase-gancho. CTA de WhatsApp visible desde el primer scroll.
2. Menú destacado: 3 a 6 platos con foto, nombre, breve descripción y precio. Grilla limpia y legible.
3. Sobre nosotros: historia corta y honesta del lugar y qué lo hace distinto.
4. Galería: 4 a 8 fotos reales del local y los platos, en grilla tipo mosaico.
5. Ubicación y horarios: dirección, mapa embebido, días y horarios de atención.
6. Cierre con CTA fuerte de contacto (WhatsApp / reserva) y los datos del negocio.

LO QUE HACE ÚNICO AL NEGOCIO (usalo en el hero y el copy)
Café de especialidad y pastelería casera, en la esquina del barrio.

LLAMADO A LA ACCIÓN
Botón «Mirá el menú» como acción principal + botón de WhatsApp para consultas.
WhatsApp real del negocio: 549000000003 (link wa.me, mensaje pre-cargado simple).
El botón de WhatsApp es el corazón comercial: siempre visible y alcanzable con el pulgar en mobile.

DATOS REALES (obligatorio — nada de placeholders ni lorem ipsum)
Tono y contenido real del negocio:
Café de barrio, cercano y tranquilo; pastelería casera. Posteos simples de los productos del día.

Bajá el logo y las fotos reales de:
Instagram: https://instagram.com/cafelaesquina.qa
Google Maps: https://maps.google.com/?q=cafe+la+esquina+qa

CALIDAD (no negociable)
Máximo 2–3 colores, tomados de la marca del negocio.
Jerarquía clara: un solo título grande por sección, espaciados consistentes.
Mobile-first: la mayoría la abre del celular. Nada cortado ni desbordado, textos legibles sin zoom.
Fotografía de comida protagonista: grande y apetitosa, nunca de stock genérico.
```

### B3 · Prompt LIBRE / a mano (~87 tokens, 57 palabras)

```text
Armame una landing de una página para un café de barrio, Café La Esquina, en Yerba Buena. Café de especialidad y pastelería casera, onda rústica y acogedora. Hero, el menú, una sección de quiénes somos, una galería de fotos y dónde estamos. Botón para ver el menú y uno de WhatsApp. Sacá las fotos del Instagram (instagram.com/cafelaesquina.qa).
```

---

## Negocio 4 — Parrilla El Fogón (San Miguel de Tucumán)

- **Procedencia:** REPRESENTATIVO — arquetipo realista, NO un cliente real.
- **Nota de datos:** Arquetipo de parrilla/bodegón familiar AR. NO es un negocio real. Sin reseñas reales → sin sección de reseñas. IG con sufijo .demo para marcar que es placeholder. WhatsApp de ejemplo.
- **Decisiones del formulario:** estilo `apetitoso-calido` · tono `cercano-familiar` · CTA `reserva` · 5 secciones

### A4 · Prompt del FORMULARIO (~542 tokens, 341 palabras)

```text
DEMO WEB — Parrilla El Fogón (San Miguel de Tucumán)
Rubro: Gastronomía

Construí una landing de UNA sola página para este negocio gastronómico. Seguí esta especificación al pie: es un brief estructurado, no una sugerencia.

DIRECCIÓN VISUAL
Paleta cálida y apetitosa (terracota, mostaza, crema, marrón cálido). Fotografía de comida en primer plano, grande, que dé hambre. Sensación acogedora, de mesa servida. Una serif amable para los títulos.
Tono del copy: Cercano y familiar: tuteo, frases cortas, calidez, como te recibe el dueño.
Color de marca a respetar: Rojo ladrillo y madera

SECCIONES (en este orden exacto, ni más ni menos)
1. Hero a pantalla con la foto del plato/producto estrella, el nombre del negocio y una frase-gancho. CTA de WhatsApp visible desde el primer scroll.
2. Menú destacado: 3 a 6 platos con foto, nombre, breve descripción y precio. Grilla limpia y legible.
3. Sobre nosotros: historia corta y honesta del lugar y qué lo hace distinto.
4. Ubicación y horarios: dirección, mapa embebido, días y horarios de atención.
5. Cierre con CTA fuerte de contacto (WhatsApp / reserva) y los datos del negocio.

LO QUE HACE ÚNICO AL NEGOCIO (usalo en el hero y el copy)
Asado a la leña, achuras y vacío; porciones generosas para compartir en familia.

LLAMADO A LA ACCIÓN
Botón «Reservá tu mesa» que abre WhatsApp para coordinar la reserva.
WhatsApp real del negocio: 549000000004 (link wa.me, mensaje pre-cargado simple).
El botón de WhatsApp es el corazón comercial: siempre visible y alcanzable con el pulgar en mobile.

DATOS REALES (obligatorio — nada de placeholders ni lorem ipsum)
Tono y contenido real del negocio:
Parrilla tradicional de barrio, ambiente familiar y abundante. Fotos de las carnes y la brasa.

Bajá el logo y las fotos reales de:
Instagram: https://instagram.com/parrilla.elfogon.demo

CALIDAD (no negociable)
Máximo 2–3 colores, tomados de la marca del negocio.
Jerarquía clara: un solo título grande por sección, espaciados consistentes.
Mobile-first: la mayoría la abre del celular. Nada cortado ni desbordado, textos legibles sin zoom.
Fotografía de comida protagonista: grande y apetitosa, nunca de stock genérico.
```

### B4 · Prompt LIBRE / a mano (~67 tokens, 45 palabras)

```text
Landing de una sola página para una parrilla, El Fogón, en Tucumán. Asado a la leña, ambiente familiar, porciones generosas. Que se vea apetitosa y cálida. Hero con la parrilla, el menú, una sección sobre nosotros, ubicación y un botón para reservar mesa por WhatsApp.
```

---

## Negocio 5 — Verde Hoja (Palermo, CABA)

- **Procedencia:** REPRESENTATIVO — arquetipo realista, NO un cliente real.
- **Nota de datos:** Arquetipo de café saludable / brunch para público joven. NO es un negocio real. Sin reseñas reales → sin sección de reseñas. IG con sufijo .demo. WhatsApp de ejemplo.
- **Decisiones del formulario:** estilo `moderno-minimal` · tono `divertido-joven` · CTA `whatsapp-pedido` · 5 secciones

### A5 · Prompt del FORMULARIO (~538 tokens, 340 palabras)

```text
DEMO WEB — Verde Hoja (Palermo, CABA)
Rubro: Gastronomía

Construí una landing de UNA sola página para este negocio gastronómico. Seguí esta especificación al pie: es un brief estructurado, no una sugerencia.

DIRECCIÓN VISUAL
Minimalismo moderno: mucho aire y espacio en blanco, paleta sobria (2 neutros + 1 acento), tipografía sans limpia. Fotos editoriales bien recortadas. Sensación premium y ordenada, sin saturar.
Tono del copy: Divertido y joven: desenfadado, con chispa, ideal para público joven y redes.
Color de marca a respetar: Verde salvia y crema

SECCIONES (en este orden exacto, ni más ni menos)
1. Hero a pantalla con la foto del plato/producto estrella, el nombre del negocio y una frase-gancho. CTA de WhatsApp visible desde el primer scroll.
2. Menú destacado: 3 a 6 platos con foto, nombre, breve descripción y precio. Grilla limpia y legible.
3. Galería: 4 a 8 fotos reales del local y los platos, en grilla tipo mosaico.
4. Ubicación y horarios: dirección, mapa embebido, días y horarios de atención.
5. Cierre con CTA fuerte de contacto (WhatsApp / reserva) y los datos del negocio.

LO QUE HACE ÚNICO AL NEGOCIO (usalo en el hero y el copy)
Brunch saludable, bowls y café de especialidad; opciones veggie y sin TACC.

LLAMADO A LA ACCIÓN
Botón grande «Pedí por WhatsApp» que abre el chat con un mensaje pre-cargado simple.
WhatsApp real del negocio: 549000000005 (link wa.me, mensaje pre-cargado simple).
El botón de WhatsApp es el corazón comercial: siempre visible y alcanzable con el pulgar en mobile.

DATOS REALES (obligatorio — nada de placeholders ni lorem ipsum)
Tono y contenido real del negocio:
Café moderno y saludable, público joven. Estética clara, fotos luminosas de bowls y latte art.

Bajá el logo y las fotos reales de:
Instagram: https://instagram.com/verdehoja.cafe.demo

CALIDAD (no negociable)
Máximo 2–3 colores, tomados de la marca del negocio.
Jerarquía clara: un solo título grande por sección, espaciados consistentes.
Mobile-first: la mayoría la abre del celular. Nada cortado ni desbordado, textos legibles sin zoom.
Fotografía de comida protagonista: grande y apetitosa, nunca de stock genérico.
```

### B5 · Prompt LIBRE / a mano (~65 tokens, 44 palabras)

```text
Necesito una web de una página para Verde Hoja, un café saludable con brunch y bowls, público joven, en Palermo. Moderna, minimalista, bien clarita. Hero, el menú con fotos, una galería y dónde estamos. Botón de WhatsApp para pedir. Que ande bien en mobile.
```

---

_Fin de los 10 prompts. El experimento NO se corrió: el gate de FG-2 sigue abierto._
