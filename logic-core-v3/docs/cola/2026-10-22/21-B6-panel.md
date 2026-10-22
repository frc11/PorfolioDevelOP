# B6 · La sección del Panel

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B6 · **La sección del Panel** (craneado el 2026-10-21).
  - **El título:** «El panel donde controlás» y, en un segundo renglón, «*TODO*» en cursiva.
    - Va en la letra de las palabras fundidas del fondo, grande, centrado y de lado a lado.
    - Se pinta de gris claro a negro palabra por palabra, atado al scroll. Termina de pintarse con el título más o menos en la mitad de la pantalla, no arriba.
    - «TODO» se subraya mientras se pinta.
    - Un respiro antes de que entren los módulos.
  - **Tres módulos alternados:** el 1 a la derecha, el 2 a la izquierda, el 3 a la derecha. Del lado opuesto de cada uno, su palabra fundida, que se queda pálida, con el título y la descripción del módulo en tinta, encima o debajo, en el mismo eje vertical:
    1. **Clientes** — «Cada cliente, en un solo lugar» (los leads);
    2. **Resultados** — «Resumen del mes» (las métricas);
    3. **Chatbot** — «Enseñale a tu chatbot cómo responder» (lo que sabe el bot).
    - Descripciones más largas que las de hoy, redactadas por CC con lo que existe.
    - **La posición vertical del grupo:** dos variantes detrás de una bandera, a la altura del final de su módulo o en la unión con el siguiente.
  - **Los módulos** siguen siendo las maquetas del panel (datos de ejemplo y el sello «EJEMPLO»), un poco más chicas.
    - **El scroll:** con la rueda encima de un módulo, scrollea la página, no el módulo, y aparece un cartel sobre el módulo (con su fondo atenuado): «Hacé clic para scrollear acá».
    - El clic habilita el scroll interno, y salir del módulo lo vuelve a bloquear. En el teléfono, lo mismo con un toque.
  - **El CTA, a pantalla completa:**
    - el titular «Tu panel crece con vos.», con el mismo pintado y la misma letra que el título;
    - debajo, «Sumamos módulos nuevos todo el tiempo, a medida que tu negocio los necesita. Si querés indagar más:»;
    - a la izquierda, el botón «Probar el panel»; en el medio, una «o» chiquita; a la derecha, el formulario de suscripción a las novedades, redondeado como los formularios del sitio.
    - **El botón:** por ahora no hace nada. Cuando exista la prueba (C1), se despliega como el login y carga la prueba.
  - **Después**, la escena siguiente.
  - **En el teléfono:** apilado. La palabra fundida va mucho más discreta, sin competir con el título (debajo o en la unión: lo decide CC con una variante). Debajo, el título, la descripción y el módulo. El CTA, apilado: el botón, la «o» y el formulario.

## Archivos (a confirmar)
- La sección del Panel en `_secciones/**` (hoy «Tu Panel», con los módulos y «Y más…»).
- Las maquetas del panel que ya existen: se reusan.
- El formulario de novedades actual: se reusa (los tests nunca llaman `/api/newsletter` real).
- REGLA DE ALTURAS: si cambia el alto de la sección, compensá con `TRAMO_ESTIRADO` y medí la deriva antes y después.

## Criterios
- El título termina de pintarse con su centro entre el 45 y el 55 % del alto de la pantalla, a 1440 × 900 y a 1024 × 768.
- «TODO» en cursiva, subrayado a la par del pintado.
- Los módulos alternan derecha, izquierda, derecha. Grupo palabra/título/descripción alineado a ±1 % en su eje. Bandera `?grupo=final|union`.
- El scroll sobre un módulo mueve la página y muestra el cartel. El clic habilita el scroll interno y salir lo bloquea (prueba con la rueda).
- El CTA ocupa una pantalla; el botón «Probar el panel» no hace nada por ahora (visible, sin enlace roto).
- AA en todo el texto. Teléfono a 390 y 768 según la decisión.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
