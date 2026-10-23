# REPORTE · cola 2 (2026-10-23)

## Resumen (10 líneas)
1. Integradas y verificadas en el dev :3002: **20** (piezas compartidas), **21** (navegación y chat, con un criterio sin alcanzar), **50** (Servicios), **40** (Portfolio, más el teléfono en la sesión 2) y **70** (reseñas y CTA, acotada, más la curva, el gatillo a la vez y la letra de Seis razones en la sesión 2).
2. No empezadas (presupuesto): 22, 30, 31, 41, 51, 60, 71, 80, 81 y la 90 (sin `next build` ni matrices completas).
3. La corrida 1 murió a las 03:29 por un reinicio de Windows Update a mitad de la verificación de la 70. La sesión 2 la repitió entera (verde).
4. Humo del home (rueda lenta y rápida, ida y vuelta a Demos, ráfaga, carrusel a 390) 7/7 después de cada merge y de cada cambio de la sesión 2.
5. tsc 0 en la integración.
6. **Lo primero que tiene que mirar Valentino:** el aro de reseñas a 1440 (`/v3`). Volteo, valores y aro a la vez; la entrada que frena sin escalón; tarjetas sólidas con foto; el cartel «Mantené para arrastrar».
7. Después, el Portfolio a 390 y 768: «Portfolio» encima del carrusel, en la misma pantalla, levantándose.
8. Abierto de la 21: al volver desde el Portfolio, la cámara llega al 98 % antes del título (criterio ±1 %). La píldora está sin confirmar (el velo pasó 1/3 en el dev).
9. Abierto de la 70: las mitades del título que se juntan en el medio, la salida con la cámara y el carrusel del teléfono (continuo, «Deslizá para ver más», «Ver trabajo»).
10. Nada se mergeó en `rediseno/home`, `paginas/servicios` ni `main`. Ningún push forzado.

## Por tarea
| id | estado | commits | medido |
|---|---|---|---|
| 20 | integrada y verificada | 5d688d62 · merge 6745764a · e8910ec5 | estado-de-envio 1440 3/3 y 390 2/2; autocompletado 8/8; controles `sin-carga` y `sin-arreglo` en rojo; `sin-datos` ciego (los campos vuelven del estado de React) |
| 21 | integrada; un criterio sin alcanzar | 39df0e85 · merge 798bc079 | desplegable 6/6; chat-zonas 30/30; navegacion-escena 5/16 (la cámara a 1,45–1,97 % de su pose cuando aparece el título; sin el arreglo, 24–540 %); velo 1440 1/3 en el dev |
| 50 | integrada y verificada | b6fdbc7d, efe04c99 · merge ae272b67 · 36adcc5d | servicios-c2 31/31; gatillos 16/16; capa 4/4; demos-parada 1440 6/6, a 1024 intermitente (9/12 una vez, 6/6 dos veces) |
| 40 | integrada y verificada | db0f6ec8 · merge 15d750fd · d5f8f299 | carrusel 390 y 768: modo, recorrido y fuera 6/6; título y carrusel juntos 0,97 y 1,00; tarjetas 592/592/592 y 695/695/695; controles `separados` y `alto-propio` en rojo; s76 750/0 |
| 70 | integrada y verificada (acotada) | a27d35d5, d16ae8e3, 7e0b7f72, e34f1924, b124b22a · merge c1803c9d · 296cfd2f · 4b585d62 | aro-legibilidad 1440 ok con el control en rojo; interacción y costo ok; s83 104/0 (velocidad por cuadro tabulada, sin escalón); letra de Seis razones a 390 progresiva en 0,5 s (el control salta) |

## Qué tiene que mirar Valentino
- **`/v3` a 1440, bajando hasta «Seis razones».**
  - Con el gatillo (por defecto): el título se voltea mientras los valores se van y el aro ya entra.
  - La entrada del aro arranca rápido y frena pareja hasta el giro lento, sin frenazo.
  - Las placas son sólidas, cada una con su foto, y la de adelante más grande.
  - Con el mouse sobre el aro sale el cartel; arrastrar lo gira.
  - HABLANOS hace un reflejo cada 3,5 s, y en el acto con el mouse.
- **`/v3` a 390 y 768, en el Portfolio:** «Portfolio» con su bajada justo arriba del carrusel; el título se levanta desde abajo; las tres tarjetas del mismo alto; las barras de las ya vistas llenas. A 390×844 las barras y las flechas quedan ~100 px abajo de la pantalla con el título arriba (la tarjeta sola mide 592 px).
- **`/v3` a 390, Seis razones mientras amanece:** la letra cruza de clara a oscura en medio segundo. El paso final a la mezcla sigue seco.
- **Portfolio a 1440:** el póster chico entra con la salida del contenido; la marca de agua entra con un fundido; «Visitar sitio» va en el color de cada marca; el form usa `EstadoDeEnvio`.
- **Servicios:** la entrada, los títulos, el video y la nube.
- **Banderas para elegir:**
  - `?titulo-servicio=1|2|3`;
  - `?fuente-servicio=1|2|3|4`;
  - `?diagonal=` (6,5 por defecto);
  - `?resenas=gatillo|scroll`;
  - `?grietas=centro|borde` (no la verifiqué en esta corrida).
- **Cambiaron de valor por defecto:**
  - `?resenas=gatillo` es el valor por defecto;
  - se borró `?resenas-arrastre` (el arrastre va siempre);
  - se borró `?chat=` (el geométrico es el único avatar).

## Avisos para Franco
- El chat recibe los colores del home por la prop `overrides` (tarea 21): revisar antes de que llegue al sitio vivo.
- La newsletter no se tocó (la 22 no corrió).

## Lo que no corrió y por qué
- Por presupuesto: las tareas 22, 30, 31, 41, 51, 60, 71, 80, 81 y la 90 (sin `next build`, sin `verificar` completo, sin la matriz entera de anchos).
- De la 40: el banco de la ficha a 1440 (la secuencia de cuadros, el AA de los tres «Visitar sitio» en el navegador, el envío con `page.route`). El AA se midió en la tarea: 8,55, 19,8 y 6,98 sobre `#0E0E0E`.
- De la 70:
  - las mitades del título que se juntan en el medio (los títulos de volumen de la escena);
  - la secuencia de cuadros del volteo en el sitio (la simultaneidad la afirma s83);
  - la salida con la cámara;
  - el carrusel del teléfono;
  - «Ver trabajo».

## Comandos
- Mergear a mano: `git -C C:\rediseno-home switch rediseno/home` y después `git -C C:\rediseno-home merge --no-ff nocturno/2026-10-23`.
- Borrar la integración cuando ya no haga falta: `git -C C:\rediseno-home worktree remove C:\nocturno\2026-10-23\integracion` y `git -C C:\rediseno-home branch -d nocturno/2026-10-23`. No quedan worktrees de tarea.
