# REPORTE · noche del 2026-10-22 (corte por la cuota de uso)

## Resumen
1. **Integradas y verificadas en `nocturno/2026-10-22`:** T0 (los pendientes de B12a.8 y los agregados de Valentino) y B7 (el login que se despliega como una demo).
2. **Revertida:** B6 (el Panel). El código está en su rama y compila, pero su banco en el navegador dio 10 fallas: el eje de los grupos, `?grupo=` y el candado de la rueda. Se revirtió con dos commits `revert`.
3. **A medias, sin commitear, en su worktree (se cortaron por la cuota):** B4 (Servicios), B1.2e (el carrusel) y B2 (las reseñas).
4. **No empezadas:** B3, B13, B12c, B12b, B5, B8, B9, B10 y B11.
5. Con T0, `verificar` vuelve a la base histórica: 8 grupos con falla (s1, s2, s3, s4, s5, s7, s8 y s17). Antes eran 13: las 5 suites de la navbar quedaron resueltas. `tsc` da 0.
6. **La vía del velo hacia el home** (`VIA_POR_DEFECTO = 'ambas'`) no se pudo decidir en el dev: los totales dan 2,5–2,7 s en las cuatro vías y el ruido manda. Falta medirla en un build.
7. **Lo primero que tiene que mirar Valentino:** `/v3/pagina-base` a 1440, cargada directo sin scrollear. Ya en el primer cuadro tiene que verse la noche, la luz celeste y el anillo (T0 11·1). Después, «Login» en `/v3` (B7).
8. **Antes de mergear a `rediseno/home`:** en el checkout principal existe `docs/cola/2026-10-22/` sin trackear, con los mismos archivos que esta rama. Hay que borrarlo o moverlo antes del merge; si no, git se niega a pisarlo.

## Por tarea
- **T0: integrada y verificada.**
  - Commits: 9, de `a13ac4ea` a `222656ff`. Merge `4332fcb9`, más el arreglo del orquestador `20c226f5` (`armadas.ts` volvía a pasar las 300 líneas de s8).
  - Medido en el dev (:3000, NVIDIA):
    - `velo.ts` a 1440, las cuatro vías: 3 de 3 recorridos, salvo una corrida de `ambas` que dio 2 de 3 por el techo de 3,5 s (3811 ms; repetida, 3 de 3). 0 cuadros en blanco. La píldora va a 2,8–3,9 px/ms (el WIP daba 6,51; el tope es 3,96). Control `CONTROL=sin-velo`: rojo.
    - `chrome-en-los-anchos.ts` en las 4 rutas: 0 anchos con falla. El cartel del sonido ya no pisa el título. La consola sin «isReady», sin NaN y sin 404.
    - El color desde el arranque, en carga directa y con la flecha atrás: capturas en `C:\nocturno\2026-10-22\diag\fotos`.
    - El cuerpo de la página base, a 1440 y a 390: «Hablemos» abre el contacto con «Una página web» marcado, 0 pedidos a `/api/`; «Volver al home» vuelve a `/v3`.
    - Humo de la matriz: 17 de 18. La falla (rueda desde arriba → Demos, sin hover, rápida) pasó al repetirla: intermitente en el dev. Historias a 390: 2 de 2.
    - `verificar`: 8 grupos con falla, los mismos que la base.
- **B7: integrada y verificada** (`decd55a0`, merge `20a9430c`).
  - `ingreso.ts`: 24 de 25. La apertura dura 547 ms (la del Genie de las demos), |Δy| = 0, la flecha atrás, la de adelante y Esc andan, y la escena duerme (0 dibujos). Control `CONTROL=scroll`: rojo.
  - **La falla:** a 390, entrando directo con `?ingresar`, el fundido dura 514–573 ms en vez de 200. La causa probable: arranca durante la carga del dev, con cuadros largos. Hay que confirmarlo en un build.
  - Humo de la matriz: 7 de 7.
- **B6: revertida** (`af4e53ca` en su rama; los reverts son `bbd70f71` y `50f7769c`).
  - Lo que pasó en el navegador: el pintado del título (centro al 49,5 % del alto), AA (6,43:1), el CTA y el alto de 7,00 pantallas.
  - Lo que falló: el eje de los grupos (49 % y 76 %); `?grupo=final` (el pie del grupo a −327 px del pie del módulo); `?grupo=union`; el candado de la rueda (el cartel no aparece y la página se mueve igual después del clic).
  - El orquestador calibró el alto viejo abajo de 1024 contra lo medido (`cb25e1ea`, revertido junto con B6): sirve para reintegrarla.
  - Altos viejos medidos (px): 390×844 4893 · 768×1024 8584 · 820×1180 9111 · 1023×768 11169 · 1024×768 6489 (8,45 pantallas: una deriva que ya estaba).
- **B4, B1.2e y B2: a medias.** Sus worktrees en `C:\nocturno\2026-10-22\{b4,b12e,b2}` tienen trabajo sin commitear (25, 41 y 6 archivos). No los borré.
- **El resto: no empezadas.**

## Qué tiene que mirar Valentino
1. `http://localhost:3000/v3/pagina-base` a 1440, carga directa sin scroll: la noche, el acento y el anillo desde el primer cuadro. Probá también `?legibilidad=tamano` (el defecto ahora es `peso`).
2. `/v3` a 1440: scrolleá y hacé clic en «Login». Se despliega con el Genie y la URL pasa a `?ingresar`. «Volver al home», la flecha atrás y Esc lo cierran en el mismo scroll.
3. Desde una página, «Home» a 1440: la píldora baja sin saltar.
4. Banderas que siguen vivas: `?titulo=1…4`, `?composicion=1|2|3`, `?navbar=abajo` y `?legibilidad=tamano`.

## Lo que no corrió
- El build final (los 404 y la elección de `VIA`), las matrices completas, y todas las tareas que no empezaron. Motivo: se acabó la cuota de uso.
- Notas para retomar: `C:\nocturno\2026-10-22\ESTADO.md`.
- Pendientes de T0, del reporte de su subagente:
  - P-S: las variantes de servicios, encendidas desde el avance 0.
  - La píldora se queda 80 px corta y después salta.
  - P-H: el aviso de WebGL «feedback loop».

## Comandos para la mañana
```
cd C:\rediseno-home
git fetch origin
git switch rediseno/home
git merge --no-ff nocturno/2026-10-22
```
Antes del merge, mover o borrar `logic-core-v3\docs\cola\2026-10-22\`, que en el checkout principal está sin trackear.

Para borrar un worktree, primero va el junction de `node_modules` y después el worktree:
```
powershell -NoProfile -File C:\nocturno\2026-10-22\quitar.ps1 <id>
```
Los `<id>` son `b4`, `b12e` y `b2`; tienen trabajo sin commitear, así que mirá antes de borrar. Después, `git worktree remove C:\nocturno\2026-10-22\integracion`.
