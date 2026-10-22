# T0 · Agregados de Valentino (van junto con 10-T0-pendientes.md)

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Cómo se corre
La corre el orquestador, o un subagente en `C:\nocturno\2026-10-22\t0`, con el turno pesado para tsc, lint, tests, el dev y Chrome (ver el §1 del orquestador). Lo verificado en el navegador va con su commit normal; lo que no se pudo verificar se anota.

## Agregados
1. **El color de las páginas desde el arranque.** En las páginas de servicio (y en `/v3/pagina-base`) hoy hay que scrollear un poco para que la escena tome su estado (la noche y el acento). Tiene que estar así desde el primer cuadro, en la composición inicial. Prueba: carga directa, sin scroll; el primer cuadro ya con la noche y el acento. Probalo también entrando por el velo y con la flecha atrás.
2. **Las elecciones de Valentino:** quedan las banderas y los defaults que dejó la sesión anterior (`?titulo=1…4` con la 1, `?composicion=1|2|3` con la 3, `?navbar=arriba|abajo` con arriba y `?legibilidad=peso|tamano`). Para la legibilidad, dejá **peso** por defecto (lleva «web» a 9 de 9 en AA) y mantené la otra opción con la bandera.
3. **El tiempo del velo hacia el home** (hoy 1,66–1,73 s; el objetivo era ≤ 1,2 s): proponé y medí las dos vías (acortar la banda o aligerar el montaje del home) y dejá la mejor que no deje cuadros en blanco. Si no baja de 1,2 s sin romper nada, dejá lo mejor que consigas y anotá el número.
4. **El WIP de la píldora** (`97c80a64`): medilo con `velo.ts` a 1440. Si está bien, que quede; si no, arreglalo.
5. **T3 a medias:**
   - abajo de 1024, el cartel del sonido pisa el título de la intro: que no se superpongan;
   - en la consola, los 12 recursos con 404 y los 2 errores «isReady»: encontrá la causa y arreglalo; el aviso de WebGL que ya estaba, anotalo;
   - las secciones del cuerpo de la página base, revisadas una por una;
   - `npm run verificar` completo y las matrices del home (escritorio y teléfono).
6. **B1.2e, el carrusel del teléfono y la tablet:** el pedido completo está en 10-T0-pendientes.md. Es su propia unidad de trabajo: el orquestador lo puede lanzar como una tarea aparte (toca el Portfolio de menos de 1024) después de cerrar el resto de T0.


## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
