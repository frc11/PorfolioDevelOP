# 22 · El contacto general

Va después de la 20. Modelo: **sonnet**.

El contacto general es el que se abre al tocar los CTA de contacto o «Contacto» en el menú (`_chrome/contacto/Contacto.tsx`, `[data-abre-contacto]`).

## Qué hacer
1. **En el teléfono y la tablet:** hoy sale desde abajo y ocupa toda la pantalla. Que **aparezca desde el fondo** (desde la profundidad: una escala y un fundido, como si se acercara), **centrado, ocupando ~70 % de la pantalla**, con **todo alrededor difuminado**, igual que hace el contacto en escritorio. Es el mismo form, no 3D.
2. **El envío con `EstadoDeEnvio`** (de la tarea 20), en todos los anchos.
3. **El autocompletado** con el estilo compartido de la tarea 20 (captura `lote1/09`).
4. Los errores de validación, en el formato de siempre del sitio.

## Criterios
- A 390, 768 y 1024: el panel ocupa 68–72 % del ancho y del alto visibles (o lo que permita el contenido sin scroll interno feo), centrado, con el fondo difuminado; entra desde el fondo y sale igual.
- La prueba del envío (éxito y error) con `page.route`. Nunca `/api/contacto` real.
- Escritorio: sin cambios de diseño, salvo el envío y el autocompletado.
