# L8a · resultado (revisión de Valentino sobre la cola 3 integrada, sólo escritorio)

Commit del lote: `3d111828` (más el de estos documentos). Plan: `L8a-plan.md`. Medido en el navegador (dev :3002, Chrome con WebGL) a 1440, 1366, 1280 y 1024 donde se indica; el teléfono/tablet no se tocó.

## Por ítem

1. **Etiquetas del equipo — hecho.** `marco.tsx`: desde 1024 el margen de la etiqueta es 0. Medido por layout (`offsetTop/offsetLeft` contra la foto, que no ve la transformada 3D): Franco top 0 / left 0; Valentino top 0 / right 0 (1440). Test: `s89-l8a` §1 con control.
2. **Demos centrado sobre el abanico — hecho.** El abanico quedaba arrimado a la izquierda de su estante y el giro de las placas le comía la derecha: el centro visible estaba 37 px a la izquierda del texto (1440). Se corre la primera placa medio sobrante más el 1,5 % de su ancho (`--libro-corrimiento`, desde 1024). Medido (centro del texto − centro visible de las portadas): 1440 −0,06 px; 1366 0,21; 1280 0,21; 1024 0,23. Test: `s89-l8a` §2; token registrado en `s3-registro-de-tokens.ts`.
3. **Alto del recomendador — hecho.** `useAltoDelRecomendador`: la caja toma el alto del primer paso y no baja de ahí; crece con transición de alto si el estado lo pide; el encabezado queda arriba de su celda con el tope de la primera medida. Medido a 1440 (y del encabezado en página): y del título 20807 en los seis estados (paso 1, 2, 3, procesando, resultado, contacto) = 0 px de salto; la caja crece 661 → 812 (resultado) y 722 (contacto). Tests: `s89-l8a` §3 (la cuenta pura y el cableado).
4. **Botones del contacto — hecho.** «Ver la página de …» arriba a la derecha de «Hablemos de …»; abajo «Empezar de nuevo» a la izquierda y «Enviar» a la derecha (foto en pantalla a 1440). En el resultado «Empezar de nuevo» ya estaba abajo a la izquierda. Abajo de 1024 la fila queda en columna con «Enviar» primero, como antes. Test: `s78-c2-51` (spec nueva) y `s89-l8a` §3.
5. **FAQ — hecho.** (a) El WhatsApp no sube: su placa, su hueco y su texto aparecen con el nivel (fundido). Medido por cuadro tras tocar una pregunta: opacidad 0 → 1 en ~1 s con la `y` fija en 698 px (el primer cuadro con la caja recién mostrada marca 661: un cuadro). (b) Respuesta centrada en ancho y alto y con la letra más grande que entra en el bloque (bisección 16–44 px contra el alto del formulario; foto a 1440: la respuesta de «¿Cuánto cuesta…?» llena el bloque). Tests: `s89-l8a` §4 y `s88-l5` (spec nueva).

## Gate
- `tsc --noEmit`: 0 errores. ESLint de los archivos tocados: limpio (se arregló un `react-hooks/refs`).
- Suites: `s89-l8a` 15/0 (nueva; cada afirmación con control), `s3-tokens` 29/0, `s6-servicios` 25/0, `s78-c2-51` 67/0, `s88-l5` 30/0, `s5-tokens`, `s5-quienes-somos` 67/0, `s71-faq-telefono` 31/0, `s78-b10` 55/0, `s84-demos` 65/0. `s8-montaje`: las mismas 2 fallas de la base (seis archivos viejos de más de 300 líneas; ninguno es de este lote).
- Humo de la home (rueda a Portfolio, ráfaga, Demos y vuelta a 1440 y 390): **no verificado** (presupuesto). A 390 (ventana mínima de 500) sólo se miró que las clases de escritorio no actúan (margen 0, alto automático).

## Decisiones tomadas solo
- **L8a-1:** «botón principal» = el CTA del sitio (`Cta`/`EnlaceDelServicio`, estilo de línea): el sitio no tiene otro estilo de botón sólido; «Enviar» queda a la derecha como «Siguiente» en los pasos.
- **L8a-2:** la base del alto del recomendador es el primer paso; los pasos 2 y 3 son hasta 16 px más altos y la caja crece con transición. El encabezado no se recentra nunca.
- **L8a-3:** abajo de 1024 el enlace a la página del servicio también pasa arriba (es el mismo marcado); la fila de abajo se invierte a columna para que «Enviar» siga primero. Es el único cambio visible fuera de escritorio.
- **L8a-4:** la letra de la respuesta se ajusta contra el alto del bloque (el del formulario del pie); si ni 16 px entra, el bloque crece.
- **L8a-5:** la pregunta chica sigue arriba de la respuesta, centrada con ella.
- **L8a-6:** el WhatsApp reusa la pose de la placa arriba y fundido de material (`transparent` sólo mientras el nivel < 1).

## Supuestos y descartes
- El corrimiento del abanico se calcula en CSS (sin JS) con un 1,5 % de la placa por el giro; con el hover una placa levantada cambia lo visible en unos px: no se corrige.
- Si la ventana pasa de <1024 a ≥1024 estando el recomendador en un paso distinto del primero, la base queda con la medida vieja hasta volver al primer paso. No se corrigió.
- El envío real del contacto no se probó (va a `/api/contacto`).

## Qué tiene que mirar Valentino
1. `/v3` a 1440, Quiénes somos: las etiquetas de las dos fotos pegadas a su esquina.
2. `/v3` a 1440 y 1280, Demos: el título y la bajada centrados sobre el abanico.
3. Servicios → recomendador a 1440 y 1024: respondé los tres pasos y elegí una solución; el título de la izquierda no se mueve y la caja crece suave; el orden de los botones.
4. Pie → FAQ a 1440: tocá una pregunta; el WhatsApp aparece en su lugar con fundido y la respuesta centrada y grande. Probá la pregunta más larga.

Banderas: ninguna nueva.

## Revisión independiente (Sonnet, sólo el diff de `3d111828`)
Sin hallazgos de seguridad; sin `any`, sin clases arbitrarias sin `var(--token)`, sin fugas de observers ni timeouts.

**Arreglados (commit siguiente):**
1. Teléfono y tablet: el enlace a la página del servicio y el orden de la fila de abajo habían cambiado. Ahora abajo de 1024 el enlace vuelve a la fila (entre «Enviar» y «Empezar de nuevo», el orden de antes) y arriba sólo se ve desde 1024. Corrige L8a-3 (ya no hay cambio fuera de escritorio).
2. El contenido se salía de la caja mientras crecía: `overflow-clip` desde 1024.
3. La base del alto sólo se toma con el primer paso ya montado (`data-etapa="0"`), no con el resultado saliendo.

**Anotados, no arreglados:** (4) el encabezado y la caja salen arriba en el HTML servido y se centran al hidratar (unos px); (5) la letra de la respuesta no se recalcula al cargar la tipografía y va en px; (6) `transparent` del material del WhatsApp recompila una vez por entrada/salida; (7) la etiqueta del equipo contra el recorte de la foto: no verificado en pantalla; cruzar 1023 ↔ 1024 fuera del primer paso deja la base vieja. Los puntos 2, 3, 6 y 7 **no se verificaron en el navegador** después del arreglo.
