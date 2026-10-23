# 51 · El recomendador de Servicios

Modelo: **opus**. Va después de la 50 (misma sección) y usa `EstadoDeEnvio` de la 20. Cambia altos: cola de alturas.

Capturas: `lote1/19` (el de hoy, con los `[TEXTO]`) y `lote1/20` (la referencia: el diagnóstico por etapas de Desarrollo de Software del sitio vivo).

## Qué cambia
1. **El último tramo de Servicios (el que lleva al recomendador) deja de ser gatillo:** scroll normal.
2. **El encabezado:** el título nuevo, **grande, arriba (no centrado en el alto)**, y debajo un texto **más grande y más largo** que explica para qué sirve. Los dos en `05-TEXTOS.md`. A Valentino no le gustaron los títulos genéricos: el texto es ese, el trabajo tuyo es que se vea con presencia (el tamaño y la tipografía de los títulos grandes del sitio, no la de un párrafo).
3. **El formulario, interactivo y por etapas** (reemplaza a la lista de radios):
   - **3 preguntas, una por etapa**, cada una con **opciones para tocar** (tarjetas o botones grandes, con un ícono de `lucide-react` si ya está en el proyecto). Se parece al diagnóstico de Software del sitio vivo (`lote1/20`: el indicador 1-2-3 arriba, las tarjetas, Siguiente y Atrás), **pero con la estética del home** (papel, negro, los tokens y la tipografía del sitio; nada de violeta).
   - Las preguntas, las opciones, los puntos y la lógica están en `05-TEXTOS.md` (sección «El recomendador»). La lógica va en un archivo de datos puro, sin React, con pruebas de unidad de las 125 combinaciones.
   - Las transiciones entre etapas, el "procesando" y el resultado usan **efectos que ya usa el sitio** (los fundidos, el texto que se levanta, los títulos que se pintan): buscalos e importalos.
4. **El "procesando":** el loader de develOP (el de `EstadoDeEnvio`) con las tres líneas de `05-TEXTOS.md` reemplazándose con fundido, ~2,5 s.
5. **El resultado, en el mismo lugar** (no abre el modal de contacto):
   - el título «¡Listo!…», **el análisis armado con las frases** (que parezca hecho por una IA, aunque es fijo), y **dos tarjetas** con las dos soluciones (la A destacada);
   - **al elegir una, la otra se desvanece** y aparece **debajo el contacto precargado** (el mensaje ya escrito con las respuestas, editable), con `EstadoDeEnvio` y el autocompletado compartido;
   - debajo, el link a la página del servicio (el viaje de B12b) y «Empezar de nuevo».
   - El contacto se envía con el mismo endpoint que el contacto general (con `data-precarga` del servicio). **En las pruebas, interceptado con `page.route`.**
6. El chat se desvanece en esta zona (lo hace la 21; confirmá que el recomendador está dentro de la zona).

## Teléfono y tablet
- El mismo flujo, en una columna: el título y el texto arriba, las etapas debajo, las opciones a lo ancho.

## Criterios
- Las pruebas de unidad de la lógica (125 combinaciones: siempre 2 soluciones distintas, determinístico, el desempate documentado).
- Un recorrido completo en el navegador a 1440 y 390: las 3 etapas, Atrás, el procesando, el resultado, elegir una, el contacto precargado, enviar (interceptado) y «Empezar de nuevo».
- El tramo sin gatillo: la rueda baja normal desde el último servicio hasta el Panel.
