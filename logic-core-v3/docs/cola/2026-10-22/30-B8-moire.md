# B8 · El moiré (el cristal se queda)

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B8 · **El cristal y el moiré** (craneado el 2026-10-21).
  - **El cristal se queda tal cual.**
  - **El moiré:** lo que marea es que se mueve con la cámara y se acelera con el scroll. En todas las variantes deja de reaccionar a la cámara y al scroll. Variantes con `?moire=`:
    - `0`: sin moiré;
    - `1`: una rendija fija;
    - `2`: dos rendijas fijas;
    - `mouse`: una rendija que se mueve solo con el mouse, suave y con tope chico.

## Archivos (a confirmar)
- El moiré detrás del cristal, en la escena (`_lib/escena/**`). El cristal NO se toca.
- Comparte el material o la zona con B9: esta tarea va antes que B9 y le deja el terreno limpio.

## Criterios
- En las 4 variantes, el moiré no reacciona a la cámara ni al scroll. Prueba: la misma posición del patrón con la cámara en dos poses distintas y con dos velocidades de scroll.
- `?moire=mouse`: el desplazamiento máximo es chico (proponé el tope en px o en grados y medilo) y suavizado.
- El costo por cuadro no sube (banco antes y después).

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
