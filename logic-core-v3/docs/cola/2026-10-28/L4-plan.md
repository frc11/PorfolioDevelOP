# L4 · plan (el recomendador y el Panel, ítems 51 y 60)

Base: `2ae70695` (L3 cerrado). ESTADO.md y `git log` coinciden. Fotos: `C:\nocturno\cola3-fotos\L4\`. Dev en :3002.

## Lo que hay (leído)
- `servicios/recomendador/`: `Recomendador` (columna: encabezado arriba, cuerpo abajo), `EncabezadoDelRecomendador`, `EtapaDelRecomendador` (indicador 1-2-3 + opciones), `ResultadoDelRecomendador` (título, análisis, tarjetas; al elegir, la otra se va y el contacto aparece DEBAJO), `ContactoDelRecomendador` (form precargado + link a la página), `flujo.ts` (reductor puro).
- `tu-panel/`: `TuPanel` (palabra pálida del título `CLASE_DE_LA_PALABRA_DEL_TITULO`, centrada, alfa 0,0285 desde 1024 / 0,06 abajo), `Fila` (palabra fundida de cada módulo: `CLASE_DE_LA_PALABRA`, mismo alfa), `CtaDelPanel` (flecha punteada, columnas), `NewsletterDelPanel`.
- La muestra del panel es `_panel-vivo/` (componentes de v3, arreglables): `MarcoDelPanel` (botón «Pausar» en el encabezado) y `DemoDelPanel` (`pausa-del-video`, teléfono). Las tarjetas de leads se pisan en `demos/leads/Leads.tsx`.

## Ítems
1. **Distribución en escritorio** (M). Desde 1024: grilla `1fr · 2fr`, el encabezado (título + texto) a la izquierda centrado en alto contra el recomendador, el recomendador a la derecha. Restilo (indicador, tarjetas de opción, botones, tarjetas de resultado) al lenguaje del sitio sin tocar la funcionalidad. Abajo de 1024, la columna de hoy.
   - Hecho cuando: a 1440 y 1024 el ancho del encabezado ≈ 1/3 y el del cuerpo ≈ 2/3, y los centros verticales de ambos a ≤ 4 px (se mide en el banco); a 390 y 768 sigue la columna.
2. **Contacto en el lugar + salto al Portfolio** (L).
   - El resultado cambia EN EL MISMO LUGAR (`AnimatePresence` `wait`): tarjetas ⇄ contacto. El contacto trae «Enviar», «Ver la página de {servicio}» y «Empezar de nuevo» en una fila ordenada. Nueva acción pura `volver` en `flujo.ts` (`elegida` → `null`): después del envío con éxito el flujo vuelve a la pantalla de resultados (no reinicia). Tras un error, el formulario vuelve con lo escrito (como hoy).
   - Teléfono/tablet: el indicador muestra SÓLO el paso de ahora, centrado (número + nombre), con fundido al siguiente.
   - **Bug del salto:** se reproduce con el banco (`scripts-carga/recomendador.ts` mide el desvío del scroll durante el envío), se busca la causa y se arregla; el test que lo cuida es el caso `ENVIO sin salto` del banco + un invariante en `s78-c2-51` sobre la causa.
   - Hecho cuando: banco `ENVIO sin salto` ≤ 40 px a 1440 y 390 (con el control rojo); `volver` y `elegir` en `s78-c2-51`; fotos del flujo completo a 1440 y 390.
3. **Palabras de fondo del Panel** (M). Subir el alfa (0,0285 → ~0,085 desde 1024; 0,06 → ~0,11 abajo) con contraste medido sobre el papel (tinta secundaria, sin competir con el título: la palabra queda ≥ 1,15:1 y ≤ 1,6:1 contra el papel). Colocación: el tope del título principal en la mitad de la altura de la palabra (el título baja/sube respecto de la caja de la palabra); igual para los módulos (el tope del título del módulo en la mitad de su palabra). Teléfono: «Lo que nos distingue» más ancha y más grande que el título; si no se lee, frase más corta; si nada anda, se saca en el teléfono (decisión en el resultado).
   - Hecho cuando: el banco mide `top(título) − (top(palabra)+alto(palabra)/2)` ≤ 3 px en el título y en un módulo, a 1440 y 390; contraste de la palabra contra el papel en rango; foto.
4. **La muestra** (S). Se sacan «Pausar» del marco (`MarcoDelPanel`) y el botón del video (`DemoDelPanel`); la demo corre a la vista como siempre. Se arreglan las tarjetas que se pisan en `Leads.tsx` (es de v3). WCAG 2.2.2 anotado en el resultado (sin pausa, a pedido de Valentino).
5. **CTA del Panel** (M). Newsletter más grande (campos y botón); la flecha punteada rehecha (curva limpia, puntos parejos con `pathLength` y `dasharray` calculado, punta bien orientada hacia el botón, a la izquierda del texto como ahora); teléfono: «Probar el panel» y «Suscribite a las novedades» más grandes.

## Implicancias
- Tests que leen texto/estructura: `s6-servicios`, `s78-c2-51`, `s6-tu-panel`, `s6-cta-del-panel`, `s45`, `s47`, `s48` (los botones de pausa), `s3-tokens` (cada valor nuevo en un único lugar). Se actualizan a la spec nueva y se dice.
- Alturas: el recomendador cambia de alto → `tramoDeServicios` ya lo sigue con `ResizeObserver`; el Panel mide su contenido (`tramo.ts`). Se mide la deriva a 1440 y 390.
- Opcional: nada. Fuera de alcance: la barra, las páginas de servicio, `src/modules/**`.

## Compuerta
- eslint de los archivos tocados: 0 errores. `tsc --noEmit` (4096): 0 errores (base 0).
- `test:s78-c2-51`, `test:s6-servicios`, `test:s6-tu-panel`, `test:s6-cta-del-panel`, `test:s78-b12b`, `test:s45…`, `test:s47…`, `test:s48…`, `test:s3-tokens`, `test:s6-lane`: sin más fallas que la base. Controles: (a) sin `volver` el caso rojo; (b) con la causa del salto reintroducida el banco `ENVIO sin salto` rojo; (c) alfa de la palabra al valor viejo → test de contraste rojo.
- Navegador (dev :3002): `recomendador.ts` (1440, 390), `panel-b6.ts`, banco nuevo `scripts-carga/l4-panel.ts` (palabra/título, CTA, muestra sin pausa); humo del home (rueda y ráfaga a Portfolio, a Demos y de vuelta, 1440 y 390).

## Premortem
«L4 falló»: (1) el salto no se reproduce en el banco y se declara arreglado sin causa → se instrumenta el scroll y se busca el evento (foco, `scrollIntoView`, `llevarALaVista`, ancla); si no se reproduce, se deja el tope del banco y se dice «no reproducido»; (2) el contacto en el lugar cambia el alto y `llevarALaVista` o el tramo mueve la escena → se compara el alto de tarjetas y de contacto, y el efecto de `llevarALaVista` sólo corre en cambios de fase o etapa; (3) subir el alfa de la palabra la vuelve competencia del título → se acota con tope de contraste; (4) clases arbitrarias escritas enteras en prosa (Tailwind 4 escanea); (5) sacar «Pausar» rompe invariantes de WCAG → se actualizan y se registra.
