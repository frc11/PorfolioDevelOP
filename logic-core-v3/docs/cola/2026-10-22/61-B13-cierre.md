# B13 · El cierre de cada página

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B13 · **El cierre de cada página** (craneado el 2026-10-21). Es una pieza común del home que usa cualquier página:
  1. **Seis razones**: las mismas seis de develOP, con la misma entrada que en el home;
  2. **el título se transforma en el CTA**, con el mismo mecanismo que gane en B2/B3 (`?resenas=gatillo` o `scroll`); en las páginas no hay aro de reseñas. El CTA abre el contacto con `data-precarga` del servicio de la página;
  3. **el pie**.
  - **La escena** es la de cada página (su preset y su variante). **El gesto del pie es la resolución:** lo que la variante movió (por ejemplo, los bloques que suben en Páginas web) se acomoda y el piso queda liso y calmo; recién ahí aparece el pie. En el home, el pie queda como está.
  - **Por debajo de 1024:** el modo plano.
  - **Para servicios:** reemplaza su cierre provisorio. La resolución de cada variante la implementa servicios en su variante, con la señal del tramo del pie que expone la ranura (P-H29, «un dueño por tramo»).

## Sprint P-H · HECHO (`91413a5b` … `0eef3476`, log en `docs/rediseno/SPRINT-PH.md`)

## Dependencia
Va DESPUÉS de B2 + B3: reusa la transformación del título al CTA de esa tarea, con las dos variantes. Probalo en `/v3/pagina-base`.

## Criterios
- Seis razones → CTA (con `data-precarga` del servicio de la página) → pie, como pieza común que cualquier página monta.
- La «resolución»: una señal del tramo del pie que la ranura le pasa a la variante (P-H29, un dueño por tramo); con la variante de ejemplo de la página base, el piso queda liso antes del pie.
- Por debajo de 1024, el modo plano. Documentá en `B12a-API.md` cómo se monta el cierre en una página.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
