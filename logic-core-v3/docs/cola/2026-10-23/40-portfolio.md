# 40 · El Portfolio

Modelo: **opus**. Cambia altos (el form, el teléfono): el merge va en la cola de alturas. Usa las piezas de la 20.

Lo de escritorio de la sección ya le encanta a Valentino: esto son ajustes finos. **No cambies la máquina de estados del Portfolio** (la ráfaga atrapada, un proyecto por gesto): está aprobada.

## Escritorio
1. **La transición de la ficha (ítem 5).** Al scrollear o cambiar de proyecto, la foto que queda después en su versión chica (el placeholder, en el lomo o la miniatura) **aparece instantánea**. Tiene que **transformarse:** el contenido se desvanece hacia esa foto y recién ahí se comprime, todo rápido pero visible. Lo mismo con **el nombre del negocio** (el texto grande de fondo, por ejemplo «El Garage Automóviles»): hoy aparece de la nada; que entre con un fundido.
2. **«Visitar sitio» con el color de cada marca (ítem 6):** El Garage, el **naranja** de su marca; Esquina Estudio, **blanco**; Banú, el **marrón** de su marca. Sacá los colores de los assets de cada proyecto (`public/portfolio/<slug>/`, sus capturas o su logo) y medí el contraste contra el fondo (AA). Guardalos como un dato del proyecto en `PROYECTOS`, no escritos a mano en el componente.
3. **El link de WhatsApp (ítem 7):** «O escribinos por WhatsApp» (con O mayúscula) **con efecto de botón** (el hover y el estado presionado de los botones del sitio; captura `lote1/06`).
4. **El form (ítems 9 y 10):**
   - Un solo título, **«¿El próximo sos vos?»**, del tamaño del «La próxima es la tuya» de hoy, y la bajada nueva (ver `05-TEXTOS.md`).
   - El form **más grande:** los labels, los placeholders y la letra de los inputs del tamaño de la bajada del Portfolio («Cada uno de estos proyectos…»).
   - El envío con **`EstadoDeEnvio`**; el autocompletado con el estilo compartido (captura `lote1/07`).
5. **La bajada del Portfolio (ítem 10):** se saca el slogan entero (incluido «Acá abajo no hay plantillas», que ya no está abajo) y va el texto nuevo de `05-TEXTOS.md`.

## Teléfono y tablet (capturas `lote3/03` a `07`)
- **El título «Portfolio» y su bajada van directamente arriba del carrusel**, y **los dos entran a la pantalla al mismo tiempo** (hoy el carrusel queda abajo, fuera de pantalla, y el título queda solo sobre el logo).
- **El título y la bajada se tienen que leer sobre el logo de atrás:** usá el mismo recurso de contraste que ya usa el sitio en otros lugares (el blend, la mezcla con el fondo); buscalo en el código e importalo.
- **El título entra levantándose desde abajo**, con el efecto de los títulos (en mobile no se desactiva).
- **Todas las tarjetas de los trabajos, del mismo alto** (hoy la de El Garage es más alta que la de Esquina; capturas `lote3/05` y `06`). El alto lo pone la más larga; el contenido se acomoda adentro.
- **Las barras de progreso como las historias de Instagram:** las de los trabajos ya vistos quedan **completas** (llenas), la actual se llena, las que siguen vacías (captura `lote3/07`: hoy las anteriores no se marcan).

## Criterios
- Un video o una secuencia de cuadros de la transición de la ficha (el contenido → la foto chica → se comprime) a 1440.
- Contraste AA de los tres «Visitar sitio».
- A 390 y 768: título + carrusel en la misma pantalla al entrar, sin scroll extra; las tres tarjetas con el mismo alto (|Δ| ≤ 1 px); las barras de progreso, completas las anteriores.
- El envío del form con `page.route` (nunca `/api/contacto` real).
- La matriz del Portfolio (rueda, ráfaga, ir a Demos y volver) sigue en verde.
