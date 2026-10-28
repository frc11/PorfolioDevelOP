# L5 · plan (carril b: worktree `C:\nocturno\cola3b`, rama `cola3b/2026-10-28`, dev :3003, fotos `C:\nocturno\cola3-fotos\b\L5\`)

Base: `ce589d21` (L6 cerrado). Pedidos: 70 y 71 de `REVISION-3.md` (capturas `lote2/08`–`19`, abiertas). Presupuesto ~4 h.

## Lo que existe (leído)
- Aro: `_secciones/por-que-develop/resenas/` (`tramo.ts` la bandera y la entrada; `haciaElCta.ts` la bajada, el anillo, la cámara y la espera; `useTramoDeLasResenas.ts` lo aplica), escena `_lib/escena/resenas/` (`EscenaDeLasResenas.tsx`, `tarjetas.ts` el DOM sobre cada placa, `huecoDelAro.ts` la ranura, `camaraDelGuardado.ts` el desvío del rig).
- Brillo del CTA escondido: `DestinoDelCta` (`_componentes/ctaDelFinal/CtaDelFinal.tsx:231`) monta `<Reluciente />` siempre; el enlace está centrado sobre el logo mientras el CTA no llegó, y la franja blanca, con la mezcla del texto, se ve como una mancha oscura delante del logo (`lote2/10`).
- Piso: `final/enElPiso.ts` ya descarta el piso donde hay un hueco (`enElHueco`, `huecoDelPie`) y tiene techos por zona en la simulación. La ranura de B3 es una calcomanía oscura sobre el piso: las placas se hunden en un piso entero (la cara del piso las corta) y los bloques levantados por el mouse las atraviesan (`lote2/12`).
- Teléfono: `ResenasEnLista.tsx` (pista con deriva, recortada por el ancho del contenido: `lote2/13`); el CTA de la lista va con el scroll (`MedirLaLista`, `CtaDelFinal.tsx:55`).
- FAQ: `_componentes/faq/` (`FaqEnEscenario`, `BotonDelFaq`, `FaqEnLista`, `FaqDelPie`), escena `pie3d/faqDeVolumen.ts`; WhatsApp del pie: `PiezasDeContacto.tsx` con `BloqueSolido` (placa que se hunde con el mouse, `useHundido`, `armadas.ts:187`).

## Ítems

### 1 · El aro (esfuerzo M)
- a) `?resenas=scroll` por defecto (`varianteDeLaBandera`); `gatillo` queda como bandera. Hecho cuando sin bandera la entrada sigue al scroll. s83 actualizado (la spec cambió).
- b) Sin selección de texto: `select-none` en la capa del aro (las tarjetas viven adentro). Verificado: `getComputedStyle(...).userSelect === 'none'` en la capa y en una tarjeta (banco) + arrastre en el navegador sin azul.
- c) De espaldas, sin texto: `llevarLaTarjeta` esconde la tarjeta de una placa que da la espalda (la nuca queda papel liso). Y ninguna tarjeta encima de una placa más cerca: se oculta la tarjeta cuyo cuadrilátero toca la caja proyectada (con espesor) de una placa más cercana. Puro y testeado en s83 (casos: de frente sin vecina → visible; de espaldas → oculta; tapada por una más cerca → oculta; la más cerca no se oculta por una más lejos).
- d) El brillo del CTA escondido: `Reluciente` sólo cuando el CTA se puede tocar (llegó). Test: s-invariante de texto + control (quitar la condición lo pone rojo).

### 2 · La salida de las reseñas (esfuerzo L)
- La salida es SIEMPRE gatillo (las dos variantes): la animación por tiempo de la bajada.
- Orden en el tiempo (fracciones de la animación, `haciaElCta.ts`): la cámara sube a una diagonal desde arriba (0 → 0,15); el piso se abre (desde 0,12); las reseñas bajan; el piso se cierra (hasta 0,82); recién ahí la cámara suelta (0,84 → 1) y el CTA deja de esperar (0,86 → 1). Duración legible (~3,6 s).
- La cámara del guardado: una pose propia (alta, mirando hacia abajo en diagonal), no B con la mirada baja.
- El piso se abre de verdad: el dibujo del piso descarta la corona bajo el aro con su apertura (uniforme nuevo, como `huecoDelPie`), la simulación pone un techo a ras en esa corona mientras está abierta (el mouse no levanta bloques sobre las placas) y la ranura de B3 pasa a ser el fondo del pozo (debajo del piso, con dos paredes de tinta). Las placas caben en la corona (huella 0,11 u fuera del radio contra 0,31 de medio ancho): ninguna cara del piso las corta.
- Hecho cuando: s83 (orden temporal: peso entero mientras haya placas o anillo abierto; anillo abierto antes de la primera placa y cerrado después de la última; espera del CTA hasta soltar) verde, con controles; en el navegador a 1440 una secuencia de cuadros (subida de la cámara, abierto, bajando, cerrado, CTA).

### 3 · Reseñas en el teléfono y la tablet (esfuerzo S/M)
- La pista a sangre: llega a los bordes de la pantalla (márgenes negativos del relleno lateral, con el mismo relleno adentro): las tarjetas entran por la derecha y salen por la izquierda, sin el corte interior.
- El CTA de la lista es un gatillo: al cruzar el umbral del bloque clavado, el deslizamiento corre por tiempo (~1,4 s el deslizamiento: se lee) y vuelve al subir. `MedirLaLista` con `gatillo` (opcional; la página no lo pide).
- Hecho cuando: a 390 y 768 las tarjetas no se cortan antes del borde de la pantalla (captura + medida: el recorte de la pista es el ancho de la ventana) y el CTA llega solo pasado el umbral sin seguir scrolleando.

### 4 · Pie → FAQ en escritorio (esfuerzo M)
- a) El botón «Scrolleá una vez más…» más abajo y en un renglón (`BotonDelFaq`: sin el ancho máximo, `whitespace-nowrap`).
- b) Los recuadros hundidos no quedan en el aire en el cambio (`lote2/15`): diagnóstico en el navegador (qué pieza flota y en qué nivel) y arreglo en su lugar.
- c) El bloque de preguntas: título, la introducción («Lo que más nos preguntan antes de arrancar. Si no está acá, escribinos.») y las preguntas; el bloque mide su contenido (sin el alto de más).
- d) «Tocá una pregunta y mirá lo que pasa.» centrado en su bloque.
- e) El guardado del bloque de la respuesta, como el del formulario: el bloque negro entero se hunde; sin negro en las esquinas (`lote2/19`): diagnóstico en el navegador y arreglo.
- f) El WhatsApp del FAQ: el mismo efecto que el del pie (la placa se hunde con el mouse y suena: `useHundido` + `data-solido` y el hundido en `faqDeVolumen.ts`).

### 5 · Teléfono: FAQ primero, después el pie (esfuerzo S)
- Abajo de 1024 la lista del FAQ va ANTES del pie, en el flujo (anotada como tramo: la escena no la ve, REGLA DE ALTURAS). En escritorio (escenario o lista con menos movimiento) no cambia nada.
- Hecho cuando: a 390 y 768 el FAQ está arriba del pie (captura) y s71-faq-telefono / s78-b10 al día.

## Implicancias
- s83 (bandera por defecto, gatillo de la salida, cámara), s78-c2-71 (botón), s71-faq-telefono y s8-cierre (orden) pueden clavar lo que cambia: se actualizan donde la spec cambió y se dice.
- Bancos del navegador: `aro-legibilidad`, `aro-costo`, `faq-del-pie`, `cierre-de-pagina` (con `BASE=http://localhost:3003`).
- `MedirLaLista` es compartido con la página (`SeisRazonesDelCierre`): el gatillo es opcional y la página no lo pide (no cambia).
- Opcional / fuera: las páginas (el orden FAQ→pie en el teléfono sólo en el home), el CTA de escritorio por tiempo entero (la transformación sigue al scroll después del guardado).

## Gate
1. `eslint` sobre los archivos tocados.
2. `NODE_OPTIONS=--max-old-space-size=4096 tsc --noEmit`: 0 errores nuevos.
3. Invariantes: s83-resenas, s83-resenas-telefono, s78-c2-71, s78-b10, s78-b13, s71-faq-telefono, s8-cierre, s7-por-que-develop; cada test nuevo con su control (romper el código a propósito → rojo).
4. Navegador (dev :3003): 1440 la secuencia de la salida, el cambio al FAQ, una respuesta guardada; 390 y 768 el carrusel y el FAQ arriba del pie; humo del home (rueda y ráfaga a Portfolio, a Demos y vuelta, a 1440 y 390).

## Premortem
«La semana que viene L5 falló»: (1) el piso con la corona descartada dejó ver lo de abajo (el plano de la luz) como un aro blanco en vez de un pozo → el fondo del pozo va debajo del piso con paredes de tinta, y se mira en captura antes de dar el ítem por hecho; (2) la cámara alta pasó por el techo del domo o mostró el borde del piso → altura moderada y verificada en la captura; (3) cambiar la bandera por defecto rompió la espera del CTA (el código la ataba a `variante === 'gatillo'`) → la salida deja de depender de la variante y s83 lo afirma; (4) el FAQ arriba del pie en el teléfono corrió la escena del final → anotado como tramo; (5) se consumió el presupuesto en el diagnóstico del FAQ 3D → los ítems 4b y 4e tienen tope de ~40 min; si no convergen, quedan «no hecho» con lo medido.
