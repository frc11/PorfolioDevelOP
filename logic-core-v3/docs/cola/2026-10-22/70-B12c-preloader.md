# B12c · El preloader del sitio

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B12c · **El preloader del sitio** (reemplaza al "preloader corto"). Decidido por Valentino el 2026-10-21:
  - **Cuándo:** una vez por día (la primera entrada del día, por cualquier página). Las otras entradas de ese día, sin preloader. Nunca en las recargas ni en la navegación interna. No se puede saltear. El scroll queda bloqueado hasta que termina la entrada: en el home, hasta que cae el logo del hero; en las páginas, hasta que entra el título 3D.
  - **La secuencia** (5 a 6 s en el caso normal):
    1. pantalla negra; «Bienvenido a una nueva experiencia.» en formato párrafo, grande y centrado, aparece con un fundido lento, se queda y se va con un fundido;
    2. el fondo pasa a blanco, con un fundido simple; en negro y centrado aparece «Recomendamos activar el sonido.», SIN subrayado. La frase se puede tocar, como algo opcional: activa el sonido y la página entra con el sonido prendido y un sonido suave de llegada;
    3. sobre el blanco se dibuja una flecha punteada que sale de alrededor de la frase, hace unos giros en su recorrido y termina donde va el botón de sonido (sin dibujar el botón);
    4. al completarse la flecha, el blanco se desvanece y aparece la página, con el botón de sonido justo donde apuntó la flecha (desactivado, salvo que lo hayan activado).
  - **La flecha regula la carga:** a ritmo normal tarda ~1,5 s; si falta cargar, se frena en su último 20 %; pasados ~6 s, se queda quieta con un pulso suave en la punta hasta que esté listo. No hay ícono de carga, salvo que la página resulte muy pesada.
  - **Por detrás:** mientras dura, se prepara la escena (shaders y primeros cuadros).
  - **Movimiento reducido:** una versión de ~1 s, sin fundidos largos.
  - **Técnica:** `PreloaderContext.tsx` es frozen. El preloader de `/v3` se hace nuevo, sin tocarlo.

## Archivos (a confirmar)
- Un componente nuevo del layout de `/v3`. `PreloaderContext.tsx` es FROZEN: no se toca ni se reusa su lógica si eso implica modificarlo.
- La flecha punteada: SVG con el trazo dibujándose; su punta termina exactamente donde está el botón de sonido (medilo a 1440, 1024 y 390).
- «Una vez por día»: guardado local (con try/catch: si no hay almacenamiento, se muestra igual). Las recargas, detectadas por el tipo de navegación.

## Que no rompa las pruebas (crítico)
Todo el arnés de pruebas (Playwright) arranca con un navegador limpio: sin una salida, TODAS las matrices verían el preloader y fallarían por tiempo.
- Agregá una forma de saltearlo solo para las pruebas (por ejemplo `?sinpreloader=1` y/o una clave sembrada en el almacenamiento antes de cargar) y aplicala en el arnés común, para que todas las sondas existentes la usen sin tocarlas una por una.
- Una prueba propia que SÍ lo muestre y mida sus tiempos.
- En producción, la salida no se puede activar por accidente (documentalo).

## Criterios
- Los tiempos medidos (5 a 6 s en el caso normal); la flecha frena en su último 20 % si falta cargar y pulsa a partir de los 6 s.
- La frase del sonido, tocable: activa el sonido, y la página entra con el sonido prendido.
- El scroll, bloqueado hasta que cae el logo (en el home) o entra el título 3D (en las páginas).
- Detrás, la escena se prepara (los shaders y los primeros cuadros): medí los tirones en la entrada con y sin preloader.
- Con movimiento reducido, ~1 s.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
