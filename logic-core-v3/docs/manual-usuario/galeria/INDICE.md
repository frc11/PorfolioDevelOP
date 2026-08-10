# Galería de estados — Panel del Setter (corrida M0/G)

> **Archivo GENERADO.** No editar a mano: se regenera con
> `npx tsx scripts/dev/m0-galeria-indice.ts`, que deriva el conteo y las
> dimensiones de los `.png` que hay en `png/`. El texto de cada estado vive
> en el catálogo de ese script.

Base observacional del manual de usuario. Cada fila es **un estado del recorrido
del setter**: una pantalla del registro `PANTALLAS` (`src/lib/leados/manual.ts`)
en una **variación** concreta — porque la mitad del manual vive en las variaciones,
no en las pantallas.

**Resultado: 43 estados capturados** sobre 43 catalogados, en 16 pantallas distintas. Más 7 capturas mobile. 50 archivos en total (9.3 MB).

Huecos (catalogados sin foto): **0**. Residuos (fotos sin entrada en el catálogo): **0**.

---

## Cómo se regenera

Desde `logic-core-v3/`, con la DB de dev sembrable:

```bash
npm run galeria
```

Equivale a `npm run seed:galeria && npm run galeria:capturar && npm run galeria:indice`.
La captura levanta su PROPIO servidor: `npm run start:galeria` buildea en
`.next-galeria/` y sirve en `:3004`, y el config NO reutiliza lo que haya en el
puerto. Es a propósito — compartir `.next/` con el `next dev`/`next start` del
checkout hace que la corrida lea artefactos mezclados y le reconstruya el build
por debajo al otro frente. Para reusar un server ya levantado, a propósito:

```bash
SETTER_EXTERNAL_SERVER=1 npm run galeria:capturar
```

**Los `.png` NO están en el repo** — ver [.gitignore](.gitignore). La fuente de
verdad de la galería es este índice + el sembrador + la captura; los binarios se
regeneran enteros. Salen en `docs/manual-usuario/galeria/png/`.

Piezas:
- Sembrado — [`scripts/dev/m0-galeria-seed.ts`](../../../scripts/dev/m0-galeria-seed.ts)
- Captura — [`tests/galeria/captura.spec.ts`](../../../tests/galeria/captura.spec.ts) + [`playwright.galeria.config.ts`](../../../playwright.galeria.config.ts)
- Índice — [`scripts/dev/m0-galeria-indice.ts`](../../../scripts/dev/m0-galeria-indice.ts)
- Fixtures reusados — [`tests/helpers/setter-db.ts`](../../../tests/helpers/setter-db.ts)

## Flujo real vs sembrado directo

| Modo | Cuántos | Qué significa |
| --- | --- | --- |
| **Flujo real (parcial)** | 8 | Los toques de la cadencia son `OsLeadActivity` reales — las mismas filas que escribe el motor. La oferta de horarios de #31 pasa por `guardarHorariosOfrecidosOwned`, el write-path exacto de la action `ofrecerHorarios`. |
| **Interacción real** | 2 | Se provocan **desde la UI**: se escribe en el form y se manda, no se siembra nada. |
| **Sembrado directo** | 33 | Se coloca el lead por `stage` + blobs del dossier. |

**Por qué sembrado directo en la mayoría.** Llevar 40 leads hasta su estado por
la UI real exigiría encadenar el recorrido completo por cada uno. Varios pasos no
los puede dar el setter solo: la **aprobación / rechazo de la demo es de Franco
desde admin** y la **`finalUrl` la carga el admin**, así que APROBADA y RECHAZADA
no son alcanzables desde el panel del setter por definición. Ninguna combinación
sembrada es imposible para el flujo real: son todas posiciones que el motor produce.

---

## Los estados capturados

### Tramo Ficha y Evaluación

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| m1 ficha vacía | `01-m1-ficha-vacia.png` | `m1` | 1440×2597 | Te asignan un negocio nuevo y todavía no cargaste nada de la ficha. | directo |
| m1 ficha cargada | `02-m1-ficha-cargada.png` | `m1` | 1440×2720 | Ya cargaste la ficha y volvés a mirarla — queda navegable, no se resetea. | directo |
| m2 llevar la ficha a evaluar | `03-m2-al-evaluador.png` | `m2` | 1440×1929 | La ficha tiene señal: te toca copiar el bloque y pasarlo por el Evaluador. Ir y volver son UNA pantalla desde P4. | directo |
| m2 con el veredicto ya registrado | `04-m2-veredicto-registrado.png` | `m2` | 1440×1699 | Volviste del Evaluador, registraste score y veredicto, y volvés a mirar la pantalla — queda completada y navegable. | directo |
| m2 descartado | `05-m2-veredicto-descartado.png` | `m2` | 1440×1732 | El Evaluador dijo DESCARTAR: queda el veredicto a la vista y nada por delante. | directo |

### Tramo Opener y Seguimiento

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| m4 opener pendiente | `06-m4-opener-pendiente.png` | `m4` | 1440×1727 | El negocio quedó AVANZAR pero todavía no le escribiste el primer mensaje. | directo |
| m4 opener enviado | `07-m4-opener-enviado.png` | `m4` | 1440×1634 | Ya mandaste el opener y volvés a mirar la pantalla. | flujo |
| espera post-opener | `08-espera-post-opener.png` | `espera` | 1440×900 | Mandaste el opener y el próximo toque no vence todavía: la pelota la tiene el negocio. | flujo |
| m5 toque vencido | `09-m5-toque-vencido.png` | `m5` | 1440×1874 | Venció el toque de la cadencia y te toca registrar qué pasó. | flujo |
| m5 cadencia agotada | `10-m5-cadencia-agotada.png` | `m5` | 1440×1826 | Hiciste todos los toques y nadie contestó: la cadencia se agotó (2.2). | flujo |
| m5 charla poblada | `11-m5-charla-poblada.png` | `m5` | 1440×1902 | Hubo ida y vuelta: «Lo último de la charla» muestra el último toque con su nota (5.1). | flujo |

### Tramo Brief

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| m6 «Decidí cómo va a ser la demo» — abierto | `12-m6-brief-abierto.png` | `m6` | 1440×2107 | El negocio respondió: se destrabó la pantalla donde decidís cómo va a ser la demo (secciones, qué cuenta, a qué invita). | directo |
| m6 decisión guardada | `13-m6-brief-guardado.png` | `m6` | 1440×1694 | Ya cerraste cómo va a ser la demo y volvés a leerlo. | directo |

### Tramo Construcción

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| mc1 con el tilde deshabilitado | `14-mc1-tilde-deshabilitado.png` | `mc1` | 1440×2313 | Estás en Construcción pero todavía no la arrancaste: el tilde no se ofrece y dice por qué (3.3). | directo |
| mc1 «Construí la demo» — sin avance | `15-mc1-construir.png` | `mc1` | 1440×2224 | Arrancaste la construcción: la pantalla junta estructura, personalización y assets, y ninguna está tildada. | directo |
| mc1 a medio hacer | `16-mc1-parcial.png` | `mc1` | 1440×2224 | Tildaste una de las tres cosas de esta pantalla; las otras dos siguen abiertas. | directo |
| mc1 completa | `17-mc1-completa.png` | `mc1` | 1440×2308 | Tildaste las tres: la pantalla figura completada (hace falta que TODAS sus fases lo estén) y volvés a mirarla. | directo |
| mc2 «Refiná la demo» — sin avance | `18-mc2-refinar.png` | `mc2` | 1440×3007 | Terminaste de construir y pasás a refinar: CTA, calidad y mobile, con la demo ya en pantalla. | directo |
| mc2 a medio hacer | `19-mc2-parcial.png` | `mc2` | 1440×3007 | Tildaste una de las tres de refinado; faltan dos. | directo |
| mc2 completa (las seis tildadas) | `20-mc2-completa.png` | `mc2` | 1440×3091 | Las seis del checklist tildadas: la construcción quedó cerrada y lo que sigue es publicar el borrador. | directo |

### Tramo Borrador, Chequeo y Revisión

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| m13 borrador vacío | `21-m13-borrador-vacio.png` | `m13` | 1440×1557 | Terminaste de construir y te toca publicar en Netlify Drop y pegar el link. | directo |
| m14 chequeo sin tildar | `22-m14-chequeo.png` | `m14` | 1440×3259 | Ya hay borrador publicado: la grilla de los diez obligatorios, en sus dos grupos («esto lo revisás vos» / «esto lo mira Franco»), toda en cero. | directo |
| m14 chequeo a medias | `22b-m14-chequeo-parcial.png` | `m14` | 1440×2819 | Cerraste tu grupo y te falta el de Franco: el botón de mandar a revisión sigue trabado y dice cuántos faltan. | directo |
| m14 chequeo completo | `22c-m14-chequeo-completo.png` | `m14` | 1440×2700 | Los diez en verde: recién ahí se destraba «Enviar a revisión». | directo |
| revisión de Franco | `23-revision-franco.png` | `revision` | 1440×900 | Mandaste la demo: Franco la está revisando y no hay nada que hacer. | directo |
| error de URL del borrador | `24a-error-borrador-url-invalida.png` | `m13` | 1440×1557 | Pegás cualquier cosa en el campo del link y guardás: el error queda fijo, no se va como un toast. | interacción |
| error persistente del chequeo | `24b-error-persistente-chequeo.png` | `m14` | 1440×2739 | Tenías el chequeo abierto y el lead se movió por detrás: al mandar, el server rebota y el motivo queda a la vista, en criollo (4.1). | interacción |

### Tramo Re-loop

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| mr corrección N°1 | `25-mr-correccion-1.png` | `mr` | 1440×1555 | Franco rechazó la demo por primera vez: la nota está al frente. | directo |
| mr corrección N°2 | `26-mr-correccion-2.png` | `mr` | 1440×1555 | Segundo rechazo: la corrección nueva al frente y las anteriores colapsadas (5.2). | directo |

### Tramo Envío

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| m15 envío abierto | `27-m15-envio-abierto.png` | `m15` | 1440×1362 | Franco aprobó y el negocio está respondiendo: se destrabó el envío del link. | directo |
| espera sin respuesta | `28-m15-espera-sin-respuesta.png` | `espera` | 1440×900 | Está aprobada pero el negocio no respondió: espera con m15 consultable, que nombra la causa real (5.3). | directo |
| espera sin URL final | `29-m15-espera-sin-final-url.png` | `espera` | 1440×900 | Aprobada y el negocio respondió, pero falta la URL final que carga el admin. | directo |

### Tramo Agenda

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| m16 virgen | `30-m16-virgen.png` | `m16` | 1440×1218 | Mandaste el link, el negocio dijo «sí, reunámonos» y todavía no ofreciste horarios. | directo |
| m16 con horarios ofrecidos | `31-m16-ofrecidos.png` | `m16` | 1440×1553 | Ya le pasaste 3 horarios y volvés a entrar: los mismos horarios siguen ahí (6.1/6.2). | flujo |
| m16 agendada | `32-m16-agendada.png` | `m16` | 1440×1270 | La reunión quedó agendada: resumen del traspaso, nada por delante. | directo |
| m5 post-envío | `33-m5-post-envio.png` | `m5` | 1440×1776 | Mandaste el link y venció el toque: registrás el seguimiento post-envío con m16 al lado. | flujo |

### Tramo Terminal

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| archivo (perdido) | `34-archivo-perdido.png` | `archivo` | 1440×900 | El negocio se cerró sin avanzar (Franco lo marcó PERDIDO): vista de archivo, read-only (2.3). | flujo |

### Tramo Panel de inicio

| Estado | Screenshot | Pantalla | Dimensiones | Cómo se llega (palabras del setter) | Modo |
| --- | --- | --- | --- | --- | --- |
| el foco, con cartera cargada | `35-home-foco.png` | `/setter` | 1440×2406 | Entrás al panel con trabajo acumulado: el foco te dice con qué negocio seguir. Sale de la cartera REAL del setter de prueba. | directo |
| la cartera completa | `36-home-cartera.png` | `/setter` | 1440×2406 | Mirás toda tu cartera, subordinada al foco. | directo |
| el foco manda a construir | `37-home-foco-construir.png` | `/setter` | 1440×900 | Tenés un negocio que pasó el filtro y le falta la demo: es lo primero que el foco pone adelante (P8). | directo |
| el foco dice «te está esperando a vos» | `38-home-foco-espera-accion.png` | `/setter` | 1440×900 | No hay nada para construir pero sí algo trabado esperándote: una demo que Franco rechazó. | directo |
| cartera vacía | `39-home-vacio.png` | `/setter` | 1440×900 | Sos setter nuevo y todavía no te asignaron ni cargaste ningún negocio. | directo |
| nada para trabajar ahora | `40-home-nada-para-trabajar.png` | `/setter` | 1440×1121 | Tenés cartera pero está toda en vuelo (esperando a Franco o al negocio): el panel muestra dónde quedó el trabajo en vez de un foco. | directo |

### Mobile

| Screenshot | Dimensiones | Qué muestra |
| --- | --- | --- |
| `M-09-m5-toque-vencido.png` | 390×2486 | El registro de toque en el celular — lo que más se usa fuera del escritorio. |
| `M-15-mc1-construir.png` | 390×2602 | «Construí la demo» en el celular: la navegación de la construcción cambia de forma. |
| `M-18-mc2-refinar.png` | 390×3743 | «Refiná la demo» en el celular — la segunda mitad de la construcción. |
| `M-22b-m14-chequeo-parcial.png` | 390×3914 | El chequeo final en el celular: los dos grupos, uno cerrado y otro abierto. |
| `M-31-m16-ofrecidos.png` | 390×2055 | La agenda en el celular (la pantalla con más form). |
| `M-35-home-foco.png` | 390×2875 | El panel en el celular: el drawer (botón hamburguesa) reemplaza la barra lateral. |
| `M-37-home-foco-construir.png` | 390×1097 | El foco que manda a construir, en el celular. |

---

## Huecos y residuos (derivado del cruce)

**Huecos: ninguno.** Cada estado del catálogo tiene su `.png`.

**Residuos: ninguno.** No quedó ningún `.png` de un estado que ya no existe.

## Altos de captura

El portal **no scrollea el documento**: scrollea un `<main class="overflow-y-auto">`,
y el `document` mide siempre el viewport. Por eso `fullPage: true` por sí solo NO
alcanza acá — la primera vuelta de esta galería salió recortada así. La captura
agranda el viewport hasta que el `<main>` deja de desbordar y **afirma contra el DOM**
que no quedó nada fuera de cuadro antes de disparar (`ajustarYVerificar`): si alguna
quedara cortada, la corrida falla en vez de guardar una foto que miente.

Altos: de 900px a 3914px (la más larga es `M-22b-m14-chequeo-parcial.png`). 8 de 50 entraron en una sola pantalla (900px desktop / 844px mobile) — eso es contenido corto, no recorte.

