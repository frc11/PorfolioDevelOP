# MÉTODO: cómo se lleva un sprint

## Antes de escribir código

1. **Leé lo que existe.** Las piezas del home se importan, no se copian:
   - `TituloDeVolumen`;
   - `Titular` y `Textos` (`_componentes/tipografia/`);
   - los revelados de `_secciones/_contrato/`;
   - `Cta` y `CtaEnlace`;
   - `Contacto`, que se abre con `data-abre-contacto="panel"` + `data-precarga`;
   - `LOGOTIPO`, `PROYECTOS` y `PRECIOS_DESDE`.
2. **Sprint grande → Fase 0.** Antes del código va un plan, sin código, que lleva:
   - lectura del código con cita de `archivo:línea`;
   - medidas actuales;
   - árbol de archivos a crear y tocar;
   - riesgos;
   - decisiones para Valentino, cada una con opciones, su costo y una recomendación.

   Se vuelca a `docs/<línea>/SPRINT-<id>.md`, y ese archivo es la fuente de verdad del sprint: plan arriba, log abajo.
3. **Cada punto del pedido lleva un criterio medido.** Si el prompt no lo trae, proponelo y medilo. Ejemplos:
   - "centros a menos del 1 % del ancho";
   - "0 px de desvío vertical";
   - "AA ≥ 4,5:1";
   - "≤ 0,5 ms por cuadro".

## Durante

- **Los anchos de prueba:** 1440, 1024, tablet (768–1023) y 390.
- **Medir antes de afirmar.** Cada afirmación nueva lleva su test con un control positivo: una prueba de que el test detecta el defecto si se reintroduce.
- **Calibración:** como mucho tres versiones detrás de una bandera (`?algo=1|2|3`). Valentino elige; la bandera sale del código y el valor queda como constante.
- **Lo que no converge en ~60 minutos** se commitea detrás de una bandera apagada y se reporta. No se sigue empujando a ciegas.
- **Sprints de ~2 horas.** Si el pedido es más grande, se parte en subsprints con su propio FRENO.
- **Contexto de la sesión:** no `/clear` entre subsprints; `/compact` en los cortes. El plan y el log viven en el `.md`.

## El FRENO (cómo se reporta)

Al cerrar, en este orden:

1. **El commit:** hash y mensaje. Archivos agregados por nombre.
2. **La verificación:**
   - lint;
   - tsc;
   - la lista de fallas de `verificar` contra la base;
   - las invariantes;
   - el bench, si aplica.
3. **Lo que hiciste, punto por punto,** con el número del pedido y su medida.
4. **Las decisiones que tomaste sin preguntar**, una línea cada una.
5. **Qué tiene que mirar Valentino**: una lista numerada con la URL exacta, el ancho, la acción ("scrolleá hasta…", "pasá el mouse por…") y qué debería ver.
6. **Lo que quedó afuera** y por qué.

Después del FRENO se para. Se sigue recién con su feedback.

## Lo que nunca se hace

- Declarar "listo" sin que Valentino lo haya visto.
- Cambiar un test para que pase.
- Tocar algo fuera de las carpetas de tu línea sin que el prompt lo pida (ver `CONTRATO.md` §Fronteras).
- Inventar contenido para que la página "se vea completa".
