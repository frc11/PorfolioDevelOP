# SPRINT C2-21 · La navegación desde la escena oscura, el desplegable, la píldora y el chat

Cola 2 del 2026-10-23, tarea 21 (`docs/cola/2026-10-23/21-navegacion-y-chat.md`). Rama `nocturno/2026-10-23-21`.

## Plan

1. **Desde el Portfolio a otra sección (ítem 1).** La causa: la pose del Portfolio (`PORTFOLIO_EN_LA_ESCENA.adentro` → el peso → la
   mezcla en el rig) la sostiene el ORDEN del Portfolio, que se va en orden visible (el panel, el título y recién después la cámara:
   0,7 + 0,8 × 1,4 = 1,82 s desde que el scroll sale del pin, más 0,7 s del peso). Un viaje del menú dura 1,2–2,5 s del clic a la
   llegada: el viaje terminaba (el velo se iba, el título llegaba) con la cámara todavía en la pose del Portfolio y el oscurecido puesto
   (por eso «Por qué develOP llega oscura»). Arreglo en dos partes:
   - **el Portfolio se suelta desde el clic** de un viaje cuyo destino queda fuera del pin (`useViajeQueSale`, decidido con el `y1` del
     plan del viaje) y, en un viaje, irse es de una (`useOrdenDeLaEscena`: el `<main>` va apagado, la salida en orden no se ve);
   - **la regla general: el título espera a la escena.** Llegado el scroll, `useDeslizamientoDelCta` no devuelve el velo ni pide la
     llegada del título hasta que la escena llegó (`_lib/escena/llegadaDeLaEscena.ts`): la cámara viva a menos del 1 % de la que
     persigue (el rig la anota por cuadro: `anotarLaCamara`), el peso del Portfolio en su punta y la noche en una punta. Techo 1,5 s; sin
     cuadros, con la pestaña oculta o a un destino de papel opaco (Servicios, el Panel), no espera.
2. **El desplegable de Servicios (ítem 8):** el borde izquierdo de la lista en el de «Servicios» (`--desplegable-x` y la hoja sin el
   −50 %); con el mouse o el foco en la lista el resaltado se queda en «Servicios» (`BarraDelHome`); cada ítem hace el tic de la barra.
3. **La píldora (deuda):** la velocidad con la hora del banco sube por cuadros largos del hilo MIENTRAS se desliza (con la hora del cuadro
   está dentro del tope: 3,44 contra 3,96). Causa probable, de B9: las grietas de la página se piden 2,4 s después de que el título quedó
   armado (que pasa con el velo tapando), y armarlas (el trazado y dos texturas flotantes) cae en el deslizamiento. Arreglo: el armado
   espera al velo quieto (`grietasEnVivo.ts`, la regla de las obras pesadas de T0). Y `velo.ts` nombra los cuadros largos del
   deslizamiento con sus scripts, para confirmarlo.
4. **El chat (ítems 2 y 24):** investigación (abajo), el geométrico como único avatar (la onda, el monograma y `?chat=` se borran), los
   colores del home por `overrides`, y el desvanecido en el Portfolio y en Servicios (con su recomendador).

## Log

- Leído: la skill, B12a-API (§ viajes), el REPORTE de la noche anterior, `useDeslizamientoDelCta`, `viaje.ts`, `planDelViaje.ts`,
  `nocheDisparada.ts`, `CapaDeLaGota.tsx`, `usePortfolio.ts`, `orden.ts`, `useOrdenDeLaEscena.ts`, `OrbitRig.tsx`, la barra y el
  desplegable, el chat y `LogicCompanion.tsx`.
- OrbitRig: 2 líneas (la llamada y su comentario) y el import en la línea que ya existía; 628 líneas, techo 651. Ninguna línea fijada
  por otras suites se tocó.
- s18-deslizamiento: el conteo de `terminar(` pasa de 6 a 7 por diseño (la llegada de la escena vuelve a llamarla).
- s87-chat: a la spec nueva (el geométrico, sin bandera, la apariencia constante), con su control.
- Nueva: s78-c21 (`test:s78-c21`).

### El chat: qué viene de dónde (ítem 2)
- El panel turquesa: `chatSurfaceTint` de la config del bot `develop` (la base, editable desde el panel del cliente). De fábrica, sin
  tinte, el panel es un degradé oscuro.
- Los chips con letra roja: en la ventana los chips se pintan con `accentSecondary` (o `accentColor`) en la letra, el fondo y el borde:
  el rojo es el `accentSecondary` de la config. De fábrica (la siembra) es un pizarra oscuro.
- El punto naranja (botón y cabecera): `accentColor` de la config.
- De fábrica y fijo: la tipografía, los botones, los textos de la ventana, el vidrio y el layout. `fontStyle` de la config no lo usa
  el widget (sólo el admin).
- Como el bot es el MISMO que el del sitio vivo, cambiar los colores desde el panel cambia también `/`. Por eso /v3 fija los suyos por
  `overrides`: el panel en la tinta (#111111, intensidad alta) y el resto en el papel (#F7F7F5). La tipografía y los botones del sitio no
  se pueden poner sin tocar el estilo de fábrica: no se tocaron.
- La prop `overrides` (B11) es aditiva: sin ella la config es el mismo objeto; el sitio vivo no la pasa. Los colores viajan en el mismo
  objeto aunque el tipo de la prop sólo declare el avatar y la esquina (un objeto con claves de más es asignable). Riesgo para Franco:
  si el widget dejara de esparcir `overrides` entero, los colores de /v3 vuelven a los de la config, sin error.
- El error «`<circle>` attribute r» es del `PulseAvatar` (la onda, del sitio vivo: anima `r` con motion). Con el geométrico, /v3 no lo
  monta: el error no aparece desde /v3. En el sitio vivo sigue si su config usa la onda.

## Qué mirar al final
- `scripts-carga/navegacion-escena.ts` (y su `CONTROL=sin-arreglo`), `scripts-carga/desplegable.ts` (y `CONTROL=corrido|sin-resaltado`),
  `scripts-carga/velo.ts` (las 4 vías; `CONTROL=grietas-sin-esperar`) y `scripts-carga/chat-zonas.ts` (y `CONTROL=sin-desvanecer`).
- A ojo: desde el Portfolio a cada sección por la barra (la cámara vuelve, después el título); el botón del chat en papel sobre la sala
  de día (¿se lee?).
