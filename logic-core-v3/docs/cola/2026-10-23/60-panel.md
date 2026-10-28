# 60 · El Panel

Modelo: **opus**. Cambia altos: cola de alturas. Usa `EstadoDeEnvio`, `AvisoDeScroll` y `Reluciente` de la 20.

## Escritorio
1. **El título** (ítem 15): detrás de «El panel donde controlás TODO», **una palabra pálida y disimulada**, como las palabras de fondo que ya usa esta parte: **«Lo que nos distingue»** (subraya que es algo que solo tenés con develOP). Adelante, el título como está.
2. **Los espacios:** menos espacio entre el título y el primer módulo; **mucho menos entre cada módulo** (hoy hay muchísimo: probablemente esa parte no se achicó bien); y menos entre el último módulo y el CTA. Respetá la REGLA DE ALTURAS y recalibrá `TRAMO_ESTIRADO`.
3. **Los textos de los módulos** (`05-TEXTOS.md`): «Cada posible cliente, en un solo lugar», «El resumen del mes» con «Las estadísticas de tu sitio a mano:…», y el del chatbot.
4. **`?grupo=final`** queda; **se borra `union`**.

### El CTA del Panel (captura `lote2/01`)
- **Hasta acá sigue el papel blanco** (no entra la escena): el título arriba y lo demás abajo.
- **El título** «TU PANEL CRECE CON VOS.» queda. Debajo, **la bajada nueva, un poco más grande**.
- **Dos columnas, separadas por una línea vertical** que en el medio **se corta** y deja un hueco con **«o si no»**:
  - **Izquierda**, un poco más abajo: el subtítulo **«Probar el panel»** (grande, pero menos que el título), centrado en su columna; debajo, el texto, con **«acá.» siempre solo en el último renglón** (forzalo con la estructura, no con el ancho); debajo, **una flecha punteada** que baja y **señala el botón**.
  - **El botón «Probar ahora»:** no es el botón de siempre del sitio. **Grande, bien redondeado, llamativo, que den ganas de tocarlo** ("a ver qué pasa si lo toco"):
    - en reposo, **una animación adictiva**: cada ~3 s un medio-apretón (se hunde un poco y rebota), y el brillo de `Reluciente` que lo barre;
    - al hover, se levanta y el brillo se intensifica; al presionarlo, se aplasta y rebota;
    - **por ahora no hace nada al tocarlo** (decisión de Valentino: para el lanzamiento el panel de prueba va a estar). Dejá el `href`/handler en un solo lugar, fácil de conectar.
  - **Derecha:** el título **«Suscribite a las novedades»**, el texto, y **un form chico** con **Nombre**, **Mail** y el botón **«Suscribirme»**. El envío con `EstadoDeEnvio`; el autocompletado compartido.
    - **Ojo con la API:** `/api/newsletter` es del sitio vivo y no se toca. **Si no acepta el nombre**, mandá solo el mail, dejá el campo Nombre en el form y anotalo en el reporte (para Franco). Las pruebas, con `page.route`.
- **La entrada de la bajada, las columnas y el botón:** **desde abajo**, como el resto de las cosas del sitio. Se saca el deslizamiento de derecha a izquierda.
- Debajo de todo, **`AvisoDeScroll`** con «Seguí bajando, que todavía hay más».

## Teléfono y tablet (capturas `lote3/10` y `11`)
- **El título del Panel, más grande**, en varios renglones.
- **`?palabra-movil=debajo`** pasa a ser el valor por defecto (se borra `union`), y la palabra pálida **mucho más grande: que ocupe el ancho de la sección** y que se note más (hoy casi no se ve).
- **Los títulos de los módulos** («Cada posible cliente, en un solo lugar» y los otros) se diferencian del cuerpo (otro peso o tamaño, otra familia del sitio), **pero no son iguales al título general**.
- El CTA en una columna: la bajada; «Probar el panel» con su botón; el divisor horizontal con «o si no»; las novedades; el aviso.

## Criterios
- `panel-b6` en verde (eje, `?grupo=final`, el cartel, el candado) y recalibrado con los altos nuevos.
- Las medidas de los espacios antes y después.
- El botón: un video corto del reposo (dos ciclos), el hover y el presionado.
- La newsletter con `page.route` (éxito y error); nunca `/api/newsletter` real.
- «acá.» solo en el último renglón a 1440, 1024, 768 y 390.
