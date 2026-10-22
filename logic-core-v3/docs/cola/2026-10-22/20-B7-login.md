# B7 · El login que se despliega como una demo

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B7 · **El login** (craneado el 2026-10-21). Ya no es flotante: se despliega como una demo.
  - **Apertura:** desde el botón «Login», con el mismo efecto con que se despliegan las demos. Un fondo negro tapa la página y, al mismo tiempo, aparece el formulario en el centro. Una vez desplegado, todo está.
  - **Contenido:**
    - el título «Iniciá sesión para entrar al panel»;
    - el formulario actual de cliente y admin (ya están juntos en el código), con todos sus inicios de sesión y la arquitectura de los formularios del sitio nuevo;
    - un botón «Probá el panel» (C1, se desarrolla más adelante);
    - debajo, «Volver al home».
  - **Cierre:** «Volver al home» hace la animación inversa y la página sigue donde estaba.
  - **La URL:** cambia (por ejemplo `/v3?ingresar`), así la flecha atrás hace lo mismo que «Volver al home», sin alterar el efecto.
  - **Al loguearse:** un fundido simple al panel, fuera de `/v3`.
  - **Lo demás:** los sonidos de abrir y cerrar de las demos; el logo de carga mientras procesa; los errores con el estilo de los formularios; la escena duerme detrás del negro; en el teléfono, pantalla completa.
  - **Frozen:** `auth.ts` y la lógica de login no se tocan. Se rediseña solo la presentación, que llama a lo mismo de siempre.

## Archivos (a confirmar leyendo el código)
- El botón «Login» de la navbar y el modal o login actual de `/v3` (`_chrome/**`).
- El efecto de despliegue de las demos: importalo o extraelo a una pieza común; no lo dupliques.
- La lógica de autenticación NO se toca (`auth.ts` frozen): el formulario nuevo llama exactamente a lo mismo que el actual.

## Criterios
- La apertura y el cierre usan el mismo efecto que las demos (mismo tiempo y misma curva), medido.
- «Volver al home» y la flecha atrás cierran con la animación inversa, y la página queda en el mismo scroll (|Δy| = 0).
- La URL cambia al abrir (por ejemplo `?ingresar`), sin `router.push`.
- Los formularios con el estilo del sitio (redondeados, foco y errores), AA en todo.
- Sin errores en consola. Ninguna llamada real a la API de login en las pruebas (mockeá).

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
