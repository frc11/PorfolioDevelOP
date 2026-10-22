# B5 · Demos

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B5 · **Demos** (craneado el 2026-10-21).
  - **El efecto de agua sale.**
  - **Una parada, como el Portfolio:** al llegar desde el Portfolio, la entrada de Demos se completa entera aunque se siga scrolleando (el impulso que sobra se descarta), y Demos se queda hasta un gesto nuevo. Recién ahí pasa a Servicios. Hoy, si se sigue scrolleando, se pasa de largo antes de que termine la animación.
  - **Las tarjetas en 3D:** se mantiene el abanico, pero las tarjetas pasan a ser placas 3D fijas debajo del título, con la perspectiva del mouse como los títulos.
  - **Las demos:** las 5 (Ethereal, Niche, Nexo, Noir y Skyline). Más grandes: el abanico ocupa al menos el 85 % del ancho de la columna del título a 1440 y a 1024, sin taparlo.
  - **La interacción**, con la misma gramática que las reseñas:
    - el hover levanta un poco la tarjeta, suena el hover de la navbar y aparece su nombre;
    - el clic abre la demo con el despliegue de siempre.
  - **En el teléfono:** el carrusel del Portfolio (B1.2e).

## Archivos (a confirmar)
- La sección Demos (`_secciones/**`) y su efecto de agua (sale entero: código, banderas y pruebas).
- La parada: reusá la máquina de estados del Portfolio (A8, F1 y F2), no hagas una nueva.
- Las tarjetas 3D: reusá la perspectiva del mouse de los títulos.
- El carrusel del teléfono: el de B1.2e.
- REGLA DE ALTURAS si cambia el tramo.

## Criterios
- La parada: una ráfaga desde el Portfolio deja Demos entera y quieta; recién un gesto nuevo pasa a Servicios. Al subir, al revés. Matriz en el arnés (rueda, ráfaga, trackpad, teclado) con su control.
- El abanico ocupa ≥ 85 % del ancho de la columna del título a 1440 y a 1024, sin taparlo.
- El hover levanta la tarjeta, suena y muestra el nombre. El clic abre la demo con el despliegue de siempre.
- Las 5 demos: Ethereal, Niche, Nexo, Noir y Skyline.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
