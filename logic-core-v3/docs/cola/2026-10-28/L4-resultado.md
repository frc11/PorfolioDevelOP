# L4 · resultado (el recomendador y el Panel, ítems 51 y 60)

Commits: ver `git log` (L4 1/3 recomendador, 2/3 Panel, 3/3 revisión). Plan: `L4-plan.md`. Bancos: `scripts-carga/recomendador.ts` (ampliado) y `scripts-carga/l4-panel.ts` (nuevo). Fotos: `C:\nocturno\cola3-fotos\L4\` (`recomendador\`, `l4-panel\`).

## Por ítem
1. **Distribución de escritorio + restilo: hecho.** Banco `DISTRIBUCIÓN` a 1440: encabezado 33 % del ancho, recomendador a la derecha, centros a 0,0 px. A 390: columna. Restilo: recuadro más redondo, tarjetas de opción con aire y transición, íconos de las soluciones en círculo, opciones en 2 o 3 columnas según el ancho del recuadro. Ojo: Valentino debe mirarlo; el restilo es sobrio, no un rediseño.
2. **Contacto en el lugar, vuelta a resultados, indicador del teléfono: hecho. Salto al Portfolio: NO reproducido.**
   - Elegir cambia las tarjetas por el contacto en el mismo tope (banco `ELEGIR`: diferencia ≤ 8 px, 1440 y 390), con «Enviar», «Ver la página de…» y «Empezar de nuevo» en una fila. Éxito → resultados con las dos soluciones (acción pura `volver`, s78-c2-51); error → formulario con lo escrito.
   - Teléfono/tablet: sólo el paso de ahora, centrado, con fundido (banco ETAPAS a 390). El bloque visual va `aria-hidden`; la lista de tres queda `sr-only` para el lector.
   - **Salto:** ni con ratón (1440 y 390, éxito y error) se movió la página (0 px). El «salto de 526 px» que vio el banco primero era el scroll de Playwright hacia el botón. No probé el envío con Enter desde el teclado. No hay causa identificada; lo que dejé: el banco mide el desvío del scroll con el botón ya a la vista (tope 40 px) con control rojo `salto-al-enviar` (4000 px: rojo), y s78-c2-51 vigila que nada del recomendador haga scroll/hash/router y que `llevarALaVista` sólo corra al cambiar de etapa o fase. Hipótesis sin probar: el envío real (no interceptado) o el foco que cae en `body` al volverse `inert` el formulario.
3. **Palabras de fondo: hecho.** Alfa 0,0285→0,09 (1,06→1,21:1) y 0,06→0,12 (1,29:1). Tope del título en la mitad de la palabra: 0,0 px en el título y en los 3 módulos, a 1440 y 390 (`l4-panel.ts`). Teléfono: la palabra mide 334 px de tinta contra 235 del título (se queda, no se cambió la frase). Control `palabra-centrada` rojo. Se pasa del borde de la sección ~2 %: `panel-b6` lo acepta ahora (≤ 104 %).
4. **Muestra: hecho.** Sin «Pausar» (marco) ni botón del video (teléfono); sin el estado de pausa. Tarjetas de lead que se pisaban (`TarjetaDeLead.tsx`, de v3): ahora envuelven; banco: 0 solapes en 5 (1440) y 6 (390) tarjetas, control `sin-envolver` rojo. Nada que avisarle a Franco: no era de `src/modules`.
5. **CTA: hecho.** Newsletter con píldoras de 512×36 px (antes ~26 de alto, 416 de ancho), carga en su tamaño normal; flecha rehecha (S suave, puntos a paso 9, centro a 0 px del botón); teléfono: títulos de 41 px (antes ~32).

## Verificación
- tsc 0 errores; eslint 0 errores (3 avisos previos). s78-c2-51 67/0, s6-servicios 25/0, s6-tu-panel 169/0 (con c2), s6-cta-del-panel 48/0, s45 42/0, s47 159/0, s48 95/0, s3-tokens 29/0, s6-lane 50/0, s78-b12b 35/0. El conteo no baja.
- Bancos: `recomendador.ts` 11/11 a 1440 y 390; `panel-b6` verde (1440, 1024) y `MODO=espacios` verde salvo el criterio de la palabra, actualizado a la spec; `l4-panel.ts` 8/8 (1440) y 10/10 (390); controles rojos: salto-al-enviar, sin-desvanecer, palabra-centrada, con-pausa, sin-envolver.
- Humo: `matriz.ts SOLO=rueda-desde-arriba,rueda-desde-demos` 24/24, `MODO=rafaga` 16/16 (1440); `l2-telefono.ts MODO=recorrido` 2/2 (390). **No verificado:** 768 y 1024 del recomendador en el navegador; `visual-qa`; `npm run verificar` completo.
- Revisión independiente (Sonnet): 6 hallazgos. Arreglados: regex de s78-c2-51 que no admitía el `className` (alta), foco perdido al cambiar tarjetas↔contacto (ahora vuelve al resultado), doble anuncio del paso en el teléfono. Descartados con razón: alfa (decisión visual, ver abajo), `.focus()` sin `preventScroll` en el detector de scroll (son previos al lote y están en el campo inválido; el banco mide el scroll real), pausa/WCAG (pedido explícito).

## Decisiones
- L4-1: el título y el análisis del resultado quedan visibles cuando aparece el contacto; sólo se cambian las tarjetas (y «Elegí…»).
- L4-2: no agregué «volver a las soluciones» en el contacto (no se pidió); «Empezar de nuevo» está en la fila.
- L4-3: padding del recuadro de 48 px (`--spacing-12`): los `--spacing-10/16/24` no existen y daban 0 (el `pb-24` de ese contenedor sigue así, preexistente).
- L4-4: alfa 0,09 / 0,12 (contraste 1,21 / 1,29:1), tope del banco 1,15–1,35.
- L4-5: «Lo que nos distingue» se queda en el teléfono (más ancha y más notoria, no se acortó).
- L4-6: sin pausa en la muestra a pedido; queda sólo `prefers-reduced-motion` (WCAG 2.2.2).

## Supuestos y descartes
- Supuse que «tope del título» es el borde superior de su caja, no de la tinta de la A.
- Descarté mover `Card`/`Badge`/`LeadPipelineColumn` (de `src/components/ui`/módulos).
- No toqué `src/modules/**`, `src/lib/**` ni `src/app/api/**`.

## Qué tiene que mirar Valentino
1. `/v3` a 1440, Servicios → recomendador: encabezado a la izquierda y recomendador a la derecha; respondé, elegí una solución, enviá (el envío real manda a `/api/contacto`): ¿vuelve a los resultados y la página no se mueve? Si salta al Portfolio, avisame cómo (teclado/Enter, ratón).
2. Lo mismo a 390: el indicador muestra un solo paso centrado y el contacto aparece en el lugar.
3. Panel a 1440 y 390: ¿las palabras de fondo se leen lo suficiente (alfa 0,09 / 0,12)? Es el único número a ojo.
4. Panel, módulos y CTA: sin botón de pausa, tarjetas sin pisarse, newsletter y flecha nuevas.
Banderas: ninguna nueva. Desde `scripts-carga/recomendador.ts`: `CONTROL=salto-al-enviar`.
