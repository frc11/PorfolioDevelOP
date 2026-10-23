# ESTADO · cola 2 (2026-10-23)

**Cómo retomar:** leé `docs/cola/2026-10-23/00-ORQUESTADOR.md` y este archivo; seguí desde acá. La copia viva está en `C:\nocturno\2026-10-23\ESTADO.md` (fuera del repo); la de la integración (`docs/cola/2026-10-23/ESTADO.md`) se commitea al cerrar.

## La base
- Integración: `C:\nocturno\2026-10-23\integracion`, rama `nocturno/2026-10-23` desde `rediseno/home` (ae039793). Primer commit: 9a1b3b3d (la cola, sin `capturas/`). Pusheada a `origin/nocturno/2026-10-23`.
- `.env.local` y `next-env.d.ts` copiados (sin trackear). `npm ci` hecho (los install scripts quedan bloqueados por allow-scripts de npm 11; `.prisma` copiado del principal). tsc base: 0 errores.
- Scripts (fuera del repo, en `C:\nocturno\2026-10-23\`): `crear.sh <id>`, `quitar.ps1 <id>`, `dev.ps1 subir|bajar` (dev de la integración en **:3002**), `humo.sh <tanda>`, `PREAMBULO.md` (contexto común de los subagentes), `verif-*.sh` (las verificaciones, con su `.log`).
- **Puerto:** a la 01:05 apareció un `npm run dev` de Valentino (Windows Terminal, desde `C:\rediseno-home\logic-core-v3`) en :3000. No se toca. El dev de la integración va en :3002.
- Presupuesto: corrida con API (tope 95 USD). Medido: ~0,35 USD/min por subagente opus; las tareas 20, 21, 40 y 50 costaron ~12–18 USD cada una. Por eso solo se lanzaron 20, 21, 40, 50 y (acotada) 70.

## Tareas
| id | estado | worktree | commits | falta |
|---|---|---|---|---|
| 20 | **integrada y verificada** | quitar | 5d688d62 · merge 6745764a · e8910ec5 (bancos) | — (control `sin-datos` ciego, anotado) |
| 21 | **integrada (798bc079), verificada con un criterio sin alcanzar** | quitar | 39df0e85 | navegación: la cámara llega al 98 % antes del título (criterio ±1 % no alcanzado); píldora sin confirmar (velo 1/3 en el dev) |
| 50 | **integrada (ae272b67) y verificada** (36adcc5d) | quitado | b6fdbc7d, efe04c99, 36adcc5d | demos-parada a 1024 intermitente (9/12 una vez, 6/6 dos veces) |
| 40 | **integrada (15d750fd) y verificada**; sesión 2: el teléfono integrado y verificado (d5f8f299) | quitado | db0f6ec8, d5f8f299 | a 390×844 las barras y flechas del carrusel quedan ~100 px abajo con el título encima (a 768 entra todo); el levantarse del título sin grabar en cuadros; el banco de la ficha a 1440 (secuencia, AA, envío con `page.route`) |
| 70 | **integrada (c1803c9d) y verificada** (sesión 2: verif-70b) | quitado | a27d35d5, d16ae8e3, 7e0b7f72, e34f1924, b124b22a; sesión 2: 296cfd2f (curva de entrada sin escalón + volteo, valores y aro a la vez) y 4b585d62 (la letra de Seis razones en el teléfono cruza mientras amanece), verificadas | las dos mitades del título que se juntan en el medio al voltear; la secuencia de cuadros del volteo en el sitio; la salida con la cámara; el carrusel del teléfono (continuo, Deslizá para ver más, Ver trabajo); el paso a la mezcla de Seis razones sigue seco |
| 22, 30, 31, 41, 51, 60, 71, 80, 81 | no empezadas (presupuesto) | | | |
| 90 | no empezada (presupuesto: el build y las matrices quedan para la próxima sesión) | | | |

## En curso
- Sesión 2 (retomada 08:10 con la suscripción, presupuesto chico de 21 USD): consistencia hecha (3d048281); el teléfono de la 40 (d5f8f299) y la curva + el gatillo a la vez de la 70 (296cfd2f), los dos integrados y verificados en el dev :3002 (verif-40b*.log, verif-70c*.log; fotos en `fotos\40\`). Más 4b585d62 (Seis razones en el teléfono). REPORTE.md escrito. Sin subagentes, sin tareas nuevas. **Nada en curso; el turno libre; el dev abajo.** Para seguir: lo que falta de la 70 (arriba) y las tareas no empezadas, en el orden de prioridad del §3.

## Worktrees vivos y qué hacer con cada uno
- `integracion`: la rama `nocturno/2026-10-23`; no se borra. Ningún worktree de tarea vivo (20, 21, 40, 50 y 70 quitados; sus ramas mergeadas, borradas).

## Verificaciones del orquestador
- Humo base (antes de cualquier merge): matriz 4/4, ráfaga 2/2, carrusel 390 ok.
- **20:** dev :3002. `estado-de-envio.ts` 1440 3/3 y 390 2/2 (enviando, mensaje, vuelta; reducido con la carga quieta); `autocompletado.ts` 8/8 (papel e invertida, 1440 y 390). Controles: `sin-carga` 0/3 y `sin-arreglo` 0/4 en rojo; **`sin-datos` ciego** (borra los campos en el DOM pero vuelven del estado de React). Los bancos tenían criterios mal calibrados (encastre un cuadro tarde, vuelta del error contada desde el clic, colores comparados como texto): arreglados en e8910ec5. Humo 7/7.

- **21** (dev :3002, merge 798bc079): `desplegable.ts` 6/6 (borde a 0,00 px con la barra abajo y arriba; resaltado en «Servicios»; audio 0 con mute, 1 por ítem prendido), `CONTROL=corrido` rojo (−12 px). `chat-zonas.ts` 30/30 (1440, 1024, 390: se desvanece en trabajos, servicios y recomendador; abierto se queda; tinta y papel; 0 errores «attribute r»), `CONTROL=sin-desvanecer` rojo. `navegacion-escena.ts` **5/16**: con el arreglo la cámara está a 1,45–1,97 % de su pose asentada cuando aparece el título (tope del criterio 1 %); sin el arreglo (`CONTROL=sin-arreglo`) 24–540 %. El título siempre en 0 hasta que se va el velo. Se integra igual (mejora de dos órdenes; el resto de la 21 pasa entero) y se anota para Valentino. `velo.ts` 1440 **1/3**: «la página → el home» con un cuadro de 217 ms con la banda moviéndose y «el home → la página» con 34 ms (en el dev: a confirmar en el build, tarea 90). Humo 7/7.
- **50** (merge ae272b67): humo 7/7. `servicios-c2.ts` cayó con `__name is not defined` (tsx inyecta el ayudante en las funciones de `page.evaluate`): arreglado con un `window.__name` en el init script. Los otros tres bancos imprimen ✓/✗ (el filtro no los mostró): se repiten.
- **40** (merge 15d750fd, verif-50b-40.log): humo 7/7; carrusel 390 y 768 2/2; demos-parada 1440 6/6.
- **70** (merge c1803c9d): la primera verificación (verif-70.log) murió a las 03:29 en el carrusel 390 por un reinicio de Windows Update, con el turno tomado. Sesión 2 (verif-70b.log, verif-70b-b.log): turno roto (dueño muerto, 4 h 50 min); aro-legibilidad 1440 ok (todas las visibles con opacidad 1, núcleo ≥ 4,5) con el control en rojo (3,84:1 al 30 %); MODO=interaccion: cartel (pastilla 1), 10 placas visibles, clic lleva a #portfolio-el-garage; aro-costo con su control ok; humo 7/7 (carrusel 390 incluido); s83 98/0, s59 15/0; tsc 0.

- **40 (sesión 2, d5f8f299)**: título + carrusel en una pantalla y el título que se levanta. carrusel.ts 390 y 768 modo/recorrido/fuera 6/6 (juntos 0,97 y 1,00; tarjetas 592/592/592 y 695/695/695); CONTROL=separados (juntos 0,00) y alto-propio (Δ 48 px) en rojo; humo 7/7; s76 750/0, trabajos 222/0, tsc 0. El banco agarraba el carrusel de Demos (selectores sin acotar al flujo): corregido.
- **70 (sesión 2, 296cfd2f)**: curva de entrada + gatillo a la vez. s83 104/0 (15 nueva: velocidad por cuadro tabulada, dos controles); aro-legibilidad, interacción y costo ok; humo 7/7; tsc 0.

## Notas
- Sesión 2: cada espera larga del banco enfría la caché del contexto (~1 USD por vuelta): las verificaciones se agruparon en dos tandas de primer plano.
- **03:29 reinicio de Windows Update** a mitad de verif-70: el turno quedó tomado y el ESTADO desactualizado (decía 40 y 70 sin integrar). Retomado a las 08:10.
- La primera verificación de la 20 (verif-20.log) pegó contra el dev de Valentino en :3000: no vale.
- Memoria: con 3 subagentes y el dev, la memoria libre bajó a 0,73 GB.
