# M3 · plan — los momentos de las tres páginas de servicio

Carril M3, `C:\nocturno\cola3d`, rama `m/3` (desde `3d89b628`, L7-INT), dev :3005. Las páginas no se rehacen: cada una suma su momento
**después de «Qué hacemos»** (el bloque cuyo texto es el de 05-TEXTOS que el momento ilustra), como secciones propias en papel.

## Dónde vive
`src/app/v3/_servicios/momentos/` (nuevo), montado por `MomentoDelServicio` dentro de `CuerpoDelServicio` (`PaginaDeServicio.tsx`):
- `useAvanceDelRecorrido.ts` — el avance de un tramo clavado (sticky) o de un elemento que cruza la pantalla; rAF + `scroll`, escucha sólo
  cerca de la pantalla (`IntersectionObserver`). Uno para los cinco momentos.
- `pantalla/` (web): `planos.ts` (puro: el plano de cada trabajo CALCADO de su póster real, y las fases), `Plano.tsx`, `LaPantalla.tsx`, `MenuDeTrabajos.tsx`.
- `orden/` (software): `datos.ts` (puro: renglones, papeles, lugares), `LoDeSiempre.tsx`, `ElOrden.tsx`.
- `atiende/` (IA): `ChatQueAtiende.tsx` (sobre los datos y `usePasos` del panel vivo, sin el panel), `datos.ts`, `Automatizaciones.tsx` (texto + «pasa solo»).
- `__tests__/momentos.invariant.tsx` (a mano, como los demás de `_servicios`).

## Por ítem (hecho cuando…, cómo se verifica)
1. **Web, A→B encadenados + menú.** Un tramo de ~4 pantallas con un escenario clavado: el plano del trabajo se dibuja trazo a trazo
   (0–0,38), la pantalla real se abre desde el centro (0,38–0,52), el marco se angosta a teléfono y cede al video móvil (0,58–0,92).
   El menú (los tres `PROYECTOS`) a la izquierda desde 1024, arriba del escenario por debajo; cambiar de trabajo re-corre la secuencia
   (de 0 hasta donde está el scroll, en tiempo) sin tocar el scroll. Lo «no genérico»: el plano es el del trabajo, calcado de su póster.
   Verifica: invariante (fases monótonas, la repetición nunca pasa el scroll, ningún `src`/`autoplay` en el HTML) + banco a 1440/1024/768/390:
   `scrollY` igual antes y después de cambiar de trabajo en tres puntos de la secuencia; fotos.
2. **Software, tachado simultáneo + tablero.** Cada renglón: el tachado (la raya y el despinte de `trazo.css`, la de Quiénes somos) y
   lo nuevo al lado avanzan con el MISMO valor. Después, los papeles viajan a su columna y se enderezan; estética nueva escrita en el
   resultado. Verifica: invariante (mismo avance; lugares finales sin solapes a tres proporciones; trayectorias continuas) + fotos.
3. **IA, chat + automatizaciones + pasa solo.** Un chat en la superficie de la página, en verde, que contesta solo (la conversación
   de ejemplo del panel vivo, con su «escribiendo…» y su ritmo) y se puede probar con las preguntas sugeridas; sin el panel, sin cian,
   sin `h1`. Un módulo de automatizaciones (textos de 05-TEXTOS y del recomendador) con la lista que se tilda sola; el tic sólo con el
   sonido prendido y nunca con movimiento reducido. Verifica: invariante (un `h1` en la página entera de IA; `debeSonar` con sus ramas;
   ningún cian) + banco (un `h1`, el chat avanza solo).
4. **Lo que no cambia:** escena, acentos, slugs, intro, FAQ, banderas; el home no se toca. Verifica: invariantes del V1 (datos, escena,
   seo, slots, medios, pagina) verdes.

## Gate
`tsc --noEmit` 0 nuevos; eslint de lo tocado; `momentos.invariant` + `pagina.invariant` (actualizado: los bloques nuevos en su orden) +
los otros siete de `_servicios`; banco `scripts-carga/m3-momentos.ts` contra :3005 a 1440/1024/768/390 (consola limpia, un `h1`, desborde 0,
las tres comprobaciones del lote) con fotos en `C:\nocturno\cola3-fotos\M3\`. Revisión independiente sobre el diff.

## Implicaciones / fuera de scope
- El ancho: M1 ensancha el contenedor; los momentos usan `Envoltorio` y anchos relativos, nada clavado al centro.
- Tests que cambian de spec: `pagina.invariant` (orden de bloques). Ninguno se afloja.
- No se toca `_panel-vivo`, `_secciones`, `_componentes`, `_lib` ni `src/modules`: se importan.
- Abrir el chat real del sitio desde el momento de IA necesitaría tocar el widget (`src/modules`): propuesta, no se hace.

## Premortem
«M3 falló»: (a) el escenario clavado no se clava porque un ancestro tiene `overflow`/transform → se monta fuera del `Revelado`, como
`Trabajos`; (b) el cambio de trabajo salta el scroll por un cambio de alto o un foco → alto fijo del escenario, ningún `scrollIntoView`,
el banco mide `scrollY`; (c) el tablero se solapa a 390 → lugares en % con alto de papel fijo y prueba de solapes en tres proporciones;
(d) el chat hace scroll de la página al auto-seguir → sólo `scrollTop` de su propia caja; (e) la memoria: el candado es de cuatro
sesiones — un solo tramo pesado con todo junto; (f) videos que bajan de entrada → `preload="none"` y `src` puesto al acercarse.
