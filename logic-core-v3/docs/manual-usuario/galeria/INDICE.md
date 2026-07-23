# Galería de estados — Panel del Setter (corrida M0)

Base observacional del manual de usuario. Cada fila es **un estado del recorrido
del setter**: una pantalla del registro `PANTALLAS` (`src/lib/leados/manual.ts`)
en una **variación** concreta — porque la mitad del manual vive en las variaciones,
no en las pantallas.

**Fuentes de la enumeración**
1. `src/lib/leados/manual.ts` — registro `PANTALLAS` (20 ids: m1…m16 + `mr` + `espera` + `revision` + `archivo`) y todas las ramas de `posicionDe`.
2. `tests/helpers/setter-db.ts` + `tests/setter/*.spec.ts` — qué escenarios ya sabe montar el fixture (stages, actividades, rechazos, agenda).
3. Variaciones documentadas en sprints 2.2 / 2.3 / 3.3 / 4.1 / 5.1 / 5.2 / 5.3 / 6.1 / 6.2.

**Cómo leer las columnas**
- *Cómo se llega* — en palabras del setter, no del motor.
- *Alcanzable* — juicio previo a la corrida; el resultado real queda en la tabla final y en INALCANZABLES.

---

## Terreno de la corrida

| Chequeo | Resultado |
|---|---|
| Rama | `main` |
| HEAD al arrancar | `6a88cbe` (sprint 6.2) |
| Sprint 6.2 en el log | **Sí** → los estados de m16 con horarios ofrecidos se enumeran como alcanzables |
| `npx tsc --noEmit` | exit 0 |
| Sucio al arrancar | solo `docs/probe-01-censo-cosecha.md` (untracked, WIP ajeno — no se toca) |

---

## Los estados enumerados

### Tramo Ficha y Evaluación

| # | Estado | Pantalla | Cómo se llega (palabras del setter) | Alcanzable |
|---|---|---|---|---|
| 01 | `m1-ficha-vacia` | m1 | Te asignan un negocio nuevo y todavía no cargaste nada de la ficha. | sí |
| 02 | `m1-ficha-cargada` | m1 | Ya cargaste la ficha y volvés a mirarla — queda navegable, no se resetea. | sí |
| 03 | `m2-al-evaluador` | m2 | La ficha tiene señal: te toca copiar el bloque y pasarlo por el Gem Evaluador. | sí |
| 04 | `m3-veredicto-registrar` | m3 | Volviste del Evaluador con el resultado y vas a registrar score y veredicto. | sí |
| 05 | `m3-veredicto-descartado` | m3 | El Evaluador dijo DESCARTAR: el negocio queda con el veredicto a la vista y nada por delante. | sí |

### Tramo Opener y Seguimiento

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 06 | `m4-opener-pendiente` | m4 | El negocio quedó AVANZAR pero todavía no le escribiste el primer mensaje. | sí |
| 07 | `m4-opener-enviado` | m4 | Ya mandaste el opener y volvés a mirar la pantalla. | sí |
| 08 | `espera-post-opener` | espera | Mandaste el opener, el próximo toque todavía no vence: la pelota la tiene el negocio. | sí |
| 09 | `m5-toque-vencido` | m5 | Venció el toque de la cadencia y te toca registrar qué pasó. | sí |
| 10 | `m5-cadencia-agotada` | m5 | Ya hiciste todos los toques y nadie contestó: la cadencia se agotó (2.2 — «No respondió» deja de ofrecerse). | sí |
| 11 | `m5-charla-poblada` | m5 | El negocio te contestó algo: «Lo último de la charla» muestra el último toque real (5.1). | sí |

### Tramo Brief

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 12 | `m6-brief-abierto` | m6 | El negocio respondió: se abrió el brief y te toca generarlo y traerlo. | sí |
| 13 | `m6-brief-guardado` | m6 | El brief ya quedó guardado y volvés a leerlo. | sí |

### Tramo Construcción (auto-reporte, navegación libre)

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 14 | `m7-tilde-deshabilitado` | m7 | Estás en las fases pero todavía no arrancaste la construcción: el tilde no se ofrece y dice por qué (3.3). | sí |
| 15 | `m7-estructura` | m7 | Arrancaste la construcción: primera fase, tilde habilitado. | sí |
| 16 | `m8-personalizacion` | m8 | Segunda fase de la construcción. | sí |
| 17 | `m9-assets` | m9 | Tercera fase de la construcción. | sí |
| 18 | `m10-cta` | m10 | Cuarta fase de la construcción. | sí |
| 19 | `m11-calidad` | m11 | Quinta fase de la construcción. | sí |
| 20 | `m12-mobile-fases-hechas` | m12 | Última fase, con varias fases anteriores ya tildadas (chips verdes en la nav). | sí |

### Tramo Borrador, Chequeo y Revisión

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 21 | `m13-borrador-vacio` | m13 | Terminaste de construir y te toca publicar en Netlify Drop y pegar el link. | sí |
| 22 | `m14-chequeo` | m14 | Ya hay borrador publicado: te toca pasar los 6 checks duros y mandar a revisión. | sí |
| 23 | `revision-franco` | revision | Mandaste la demo: Franco la está revisando y no hay nada que hacer. | sí |
| 24 | `error-persistente-chequeo` | m14 | Mandás el chequeo y el server lo rechaza: el error queda visible y en criollo (4.1). | **dudoso** — depende de poder provocar el rechazo desde la UI |

### Tramo Re-loop (rechazo)

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 25 | `mr-correccion-1` | mr | Franco rechazó la demo por primera vez: la nota está al frente. | sí |
| 26 | `mr-correccion-2` | mr | Segundo rechazo: la corrección nueva al frente y las anteriores colapsadas (5.2). | sí |

### Tramo Envío

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 27 | `m15-envio-abierto` | m15 | Franco aprobó y el negocio está respondiendo: se destrabó el envío del link. | sí |
| 28 | `m15-espera-sin-respuesta` | espera | Está aprobada pero el negocio no respondió todavía: espera con m15 consultable, que nombra la causa real (5.3). | sí |
| 29 | `m15-espera-sin-final-url` | espera | Está aprobada y el negocio respondió, pero falta la URL final que carga el admin. | sí |

### Tramo Agenda

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 30 | `m16-virgen` | m16 | Mandaste el link, el negocio dijo «sí, reunámonos» y todavía no ofreciste horarios. | sí |
| 31 | `m16-ofrecidos` | m16 | Ya le pasaste 3 horarios y volvés a entrar: los mismos horarios siguen ahí (6.1/6.2). | sí |
| 32 | `m16-agendada` | m16 | La reunión quedó agendada: resumen del traspaso, nada por delante. | sí |
| 33 | `m5-post-envio` | m5 | Mandaste el link y venció el toque: registrás el seguimiento post-envío con m16 al lado. | sí |

### Terminales y home

| # | Estado | Pantalla | Cómo se llega | Alcanzable |
|---|---|---|---|---|
| 34 | `archivo-perdido` | archivo | El negocio se cerró sin avanzar (Franco lo marcó PERDIDO): vista de archivo, read-only (2.3). | sí |
| 35 | `home-foco` | — (`/setter`) | Entrás al panel: el foco te dice con qué negocio seguir. | sí |
| 36 | `home-cartera` | — (`/setter`) | Mirás toda tu cartera, subordinada al foco. | sí |

### Mobile (pantallas con navegación o layout propio)

| # | Estado | Cómo se llega | Alcanzable |
|---|---|---|---|
| M1 | `home-foco` mobile | El panel en el celular — el drawer reemplaza la navegación de escritorio. | sí |
| M2 | `m7-estructura` mobile | Una fase de construcción en el celular: la nav de fases cambia de forma. | sí |
| M3 | `m16-ofrecidos` mobile | La agenda en el celular (la pantalla con más form). | sí |
| M4 | `m5-toque-vencido` mobile | El registro de toque en el celular — es lo que más se usa fuera del escritorio. | sí |

---

## Resultado de la corrida

> Se completa en la Etapa 4 con: archivo del screenshot, alcanzado por flujo real
> o sembrado directo, y pantalla del registro `PANTALLAS` a la que corresponde.

## INALCANZABLES

> Se completa en la Etapa 4. Todo estado enumerado y no alcanzado, con el motivo
> exacto.

## Lo que vi y me llamó la atención

> Se completa en la Etapa 4.
