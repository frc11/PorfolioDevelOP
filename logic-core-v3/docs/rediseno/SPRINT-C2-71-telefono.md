# SPRINT C2 · 71t — el FAQ del teléfono y la tablet (la tarea 71 §6)

Cola 2 del 2026-10-23. La parte de abajo de 1024 de la tarea 71 (`docs/cola/2026-10-23/71-pie-faq.md` §6); lo de escritorio (el
hundimiento, el FAQ 3D, el botón, la pasada técnica y el bug del pie) lo hace 71e en paralelo. La revisión (línea ~131 de
`08-REVISION-VERBATIM.md`): «Que el faq este despues del footer, si, pero que no tenga fondo liso, que sea desplegable y semitransparente,
con liquid glass, algo mas moderno».

## Plan

- **Dónde**: `FaqEnLista` (el FAQ en lista: abajo de 1024 y con menos movimiento; lo elige `FaqDelPie`). Sigue después del pie: en el
  home, colgado fuera del layout (`absolute`, debajo de la sección del pie); en una página, en el flujo. `VidrioDelFaq` no se usa (es del
  escenario de escritorio: no se toca).
- **Sin fondo liso**: fuera el papel de B10. UN panel del vidrio líquido del sitio (`[data-material="vidrio"]` de `vidrio.css`, el mismo
  del formulario del pie de abajo de 1024 y del menú del teléfono: el desenfoque y la saturación de la escena de atrás, un tinte
  semitransparente, el filo de luz con la línea de arriba y el reflejo que baja desde el borde). Una sola definición del material: no se
  copia, no se agrega hoja.
- **El acordeón**: cada pregunta, un botón dentro de su `h3` (`aria-expanded`, `aria-controls` hacia su respuesta) con la flecha de
  Lucide que gira; la respuesta debajo, siempre en el DOM: cerrada, sin alto e `inert` (fuera del teclado y del lector). El despliegue es
  el del acordeón de Servicios del menú del teléfono (`PanelDelMenu.tsx`: la fila de la grilla de cero a su alto, el tiempo medio y la
  curva principal), más el texto que aparece. Una abierta a la vez. Teclado: Enter/Espacio (el botón), las flechas en ronda, Inicio y Fin.
- **Menos movimiento**: la fila no escribe ninguna transición si el sitio dice movimiento reducido (`useMovimientoReducido`) y el CSS
  la corta igual con la preferencia del sistema.
- **El tono**: el del pie que la lista continúa. `useTonoDebajo` (el del botón del menú y la caja del formulario) con una sonda: una franja
  justo arriba de la lista, adentro de la sección del pie (la lista colgada está fuera de toda sección y la lectura por su centro no
  encontraría nada). En el cierre de una página de noche (sala invertida), oscuro. Se escribe en el propio vidrio (`data-seccion`):
  `vidrio.css` da vuelta el filo y el reflejo sólo ahí.
- **Lo puro** en `acordeonDelFaq.ts` (sin React): una abierta a la vez, las teclas, el tono.
- **Pruebas**: `s71-faq-telefono` (nueva); `s78-b10` a la spec nueva donde fijaba el papel y «sin botones»; el banco
  `scripts-carga/faq-telefono.ts` y `faq-del-pie.ts` a la spec nueva en su lista («un botón por pregunta» en lugar de «sin botones»).

## Log

- `src/app/v3/_componentes/faq/acordeonDelFaq.ts` (nuevo): `alternarLaRespuesta`, `preguntaConLaTecla`, `tonoDeLaLista`.
- `src/app/v3/_componentes/faq/FaqEnLista.tsx`: la lista de vidrio con el acordeón (`FilaDelFaq`, exportada para la prueba); el gatillo
  de los gestos de B10 (la lista a la vista suelta los gestos del final) sin cambios.
- `src/app/v3/_lib/__tests__/s71-faq-telefono.invariant.tsx` (nueva, `npm run test:s71-faq-telefono`): 31 afirmaciones, 0 fallas, cada
  una con su control (lo puro; el marcado accesible; el texto entero en el HTML y en `FAQPage`; la fila abierta y la cerrada; el
  despliegue y su ausencia con menos movimiento; el material en `vidrio.css`; sin fondo liso; el tono en el vidrio).
- `src/app/v3/_lib/__tests__/s78-b10.invariant.tsx`: cambió por diseño la afirmación de la lista (de «sin botones, en papel» a «un botón
  por pregunta, sin el hundimiento y sin WhatsApp», con la raíz sin fondo) y la de las alturas (la clase de la raíz sin el papel); la de
  «en una página va en el flujo» ahora mira la raíz (la sonda es `absolute`) y suma su control. 55 afirmaciones, 0 fallas.
- `s52-nocturno-final` 108/0 y `s10-acceso` 77/0 (leen el escenario servido: sin cambios). `tsc` 0 errores; ESLint limpio en lo tocado.
- `scripts-carga/faq-telefono.ts` (nuevo, sin correr) y `scripts-carga/faq-del-pie.ts` (la lista: un botón por pregunta).

## La REGLA DE ALTURAS

- **El layout del home no cambia en ningún ancho**: la lista sigue colgada fuera del layout (`absolute`, debajo de la sección del pie),
  como en B10. La extensión de las secciones y el fondo del final (`offsetHeight`) son los de antes: `k` = 1, nada que anotar
  (ni `anotarTramo` ni `TRAMO_ESTIRADO`).
- **Lo que cambia es el desborde de abajo** (lo que se scrollea después del pie): la lista de B10 tenía las seis respuestas a la vista;
  la nueva arranca cerrada (seis filas) y crece con la respuesta abierta. El alto viejo y el nuevo de la lista a 768 × 1024 y 390 × 844
  los imprime el banco (`altos: lista … cerrada, … con la N abierta; layout …, desborde …`); el viejo, en la rama de integración, con
  `document.querySelector('[data-faq-del-pie="lista"]').getBoundingClientRect().height` con el pie al fondo.
- En una página la lista va en el flujo: el alto del cierre de la página baja abajo de 1024 (la regla no aplica al cierre de una página).

## Qué mirar

1. El banco: `BASE=http://localhost:3000 ANCHOS=390,768 RUTAS=/v3,/v3/pagina-base npx tsx scripts-carga/faq-telefono.ts` (4 de 4), y
   cada control con su criterio en FALLA: `CONTROL=sin-toque` (toque), `CONTROL=sin-vidrio` (vidrio), `CONTROL=desborde` (desborde),
   `CONTROL=foto-fuera` (foto). Fotos en `~/.cache/b4-medicion/faq-telefono/`.
2. `faq-del-pie.ts` a 390 (su lista, ahora con un botón por pregunta) sigue en ok.
3. A ojo, `http://localhost:3000/v3` a 390 × 844 y 768 × 1024 (táctil): bajar hasta el pie y seguir: el panel de vidrio con «Preguntas
   frecuentes» y seis preguntas cerradas, la escena desenfocada detrás (oscuro sobre la noche del final), el filo y el reflejo de arriba;
   tocar una abre su respuesta deslizándose, tocar otra la reemplaza, tocarla de nuevo la cierra. El contraste del texto sobre el vidrio
   (AA). Lo mismo en `/v3/pagina-base` (en el flujo, después del pie).
4. Con movimiento reducido (a 390 y a 1440, donde también sale la lista): se abre de golpe.
