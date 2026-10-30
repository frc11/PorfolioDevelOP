# L8a · plan (revisión de Valentino sobre la cola 3 integrada, sólo escritorio)

Anchos: 1440, 1366, 1280, 1024. Teléfono y tablet no cambian. Fotos de la revisión: `C:\nocturno\cola3-capturas\lote3\NN.png`. Evidencia: `C:\nocturno\cola3-fotos\L8a\`.

## Ítems
1. **Etiquetas del equipo** (`quienes-somos/marco.tsx`, `ETIQUETA`): desde 1024 el margen de la etiqueta es 0 (arriba/izquierda en Franco, arriba/derecha en Valentino). Hecho = la esquina de la etiqueta coincide con la de la foto (0 px en `getBoundingClientRect`). Esfuerzo bajo. Verifica: medida en el navegador a 1440/1366/1280/1024.
2. **Demos centrado sobre el abanico** (`demos/CapaDeDemos.tsx`, `TextoDeDemos.tsx`): el centro del bloque título+bajada = el centro del abanico (las placas visibles). Hecho = |Δx| ≤ 2 px a los cuatro anchos. Verifica: medida + foto.
3. **Alto fijo del recomendador** (`recomendador/useAltoDelRecomendador.ts`, `Recomendador.tsx`): desde 1024 la caja toma el alto de su primer paso y no baja de ahí; si un estado necesita más, crece con transición de alto. El encabezado queda `self-start` con el tope de la primera medida (nunca se recentra). Hecho = la `y` del título no cambia entre paso 1, 2, 3, procesando, resultado y contacto (0 px).
4. **Botones del contacto** (`ContactoDelRecomendador.tsx`): «Ver la página de …» a la derecha de «Hablemos de …»; abajo «Empezar de nuevo» a la izquierda y «Enviar» a la derecha. Mismo orden en el resultado (ya: «Empezar de nuevo» abajo a la izquierda). Estilos: los CTA del sitio (`Cta`, `EnlaceDelServicio`).
5. **FAQ** (`faq/RespuestaDelFaq.tsx`, `faq/FaqEnEscenario.tsx`, `pie3d/faqDeVolumen.ts`, `hundidoDelFaq.ts`): (a) el WhatsApp no sube del piso: aparece en su lugar con un fundido (placa con opacidad = nivel, hueco = nivel, texto = nivel); (b) la respuesta centrada (ancho y alto) y con la letra más grande que entra en el bloque (bisección 16–44 px contra el alto del formulario); una larga baja hasta 16 y el bloque crece.

## Implicaciones
- Tests que leen texto de los archivos tocados (s88-l5, s6-servicios, s78-c2-51, s78-b10, quienes-somos): correrlos y, si fijan la spec vieja, pasarlos a la nueva diciéndolo.
- `FaqEnEscenario.tsx` debe seguir ≤ 300 líneas de código (s8-montaje).
- Alturas / `TRAMO_ESTIRADO`: el recomendador crece sólo en estados con más contenido; la sección ya se mide con `ResizeObserver` (`tramoDeServicios.ts`). Se revisa que no cambie la altura del primer paso.
- Opcional: nada. Fuera de scope: teléfono/tablet, copy, el envío real.

## Gate
- `npx tsc --noEmit` (4 GB de heap), ESLint de los archivos tocados.
- Suites: `test:s88-l5`, `test:s6-servicios`, s78-c2-51, s78-b10, `quienes-somos`, la de Demos (`demos-invariante`), y las nuevas: letra del FAQ (bisección), alto del recomendador (`altoDeLaCaja`), etiqueta a 0, WhatsApp sin subida; cada una con su control (se rompe el código y tiene que dar rojo).
- Navegador (dev :3002): cada ítem a 1440/1366/1280/1024 con medidas y foto; humo de la home (rueda a Portfolio, a Demos y vuelta, 1440 y 390).
- Aceptación por ítem: 1 → 0 px; 2 → |Δx| ≤ 2 px; 3 → Δy del título = 0 px en los seis estados; 4 → orden izquierda/derecha medido; 5 → el WhatsApp no cambia de `y` mientras aparece y la letra de la respuesta llena el bloque (≥ 70 % del alto libre en la corta).

## Premortem («la semana que viene falló, ¿por qué?»)
- La letra de la respuesta se mide antes de que cargue la fuente → ancho/alto mal: el `ResizeObserver` del contenedor la reajusta cuando cambia el layout.
- El bloque 3D se mide una vez por firma: al crecer la respuesta la placa se rearma (`rearmar` lo hace por tamaño); se verifica con una respuesta larga.
- El hueco del WhatsApp y su placa transparente: `transparent` cambia el orden de dibujo; se mira en foto que no queda un cuadrado oscuro.
- La caja del recomendador baja de golpe al volver al primer paso → se acepta (vuelve al alto base sin demora; el encabezado no se mueve).
- Un invariante que fija el texto viejo → se actualiza con aviso.
- La base del alto se mide con la fuente sin cargar → el `ResizeObserver` del interior la corrige mientras está en el primer paso.
