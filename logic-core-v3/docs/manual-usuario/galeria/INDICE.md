# Galería de estados — Panel del Setter (corrida M0)

Base observacional del manual de usuario. Cada fila es **un estado del recorrido
del setter**: una pantalla del registro `PANTALLAS` (`src/lib/leados/manual.ts`)
en una **variación** concreta — porque la mitad del manual vive en las variaciones,
no en las pantallas.

**Resultado: 37 estados enumerados, 37 alcanzados, 0 inalcanzables.** Más 4
capturas mobile. Todas las fotos son de estados a los que se llegó de verdad;
ninguna fue fabricada.

---

## Cómo se regenera

Desde `logic-core-v3/`, con la DB de dev sembrable:

```bash
npm run galeria
```

Equivale a `npm run seed:galeria && npm run galeria:capturar`. Requiere el
servidor prod-QA en :3001; si no hay uno corriendo, el config lo levanta solo
(`npm run start:qa`). Para reusar un server ya levantado:

```bash
SETTER_EXTERNAL_SERVER=1 npm run galeria:capturar
```

**Los `.png` NO están en el repo** (~62 MB, 41 archivos) — ver
[.gitignore](.gitignore). La fuente de verdad de la galería es este índice + el
sembrador + la captura; los binarios se regeneran enteros con el comando de
arriba. Salen en `docs/manual-usuario/galeria/png/`.

Piezas:
- Sembrado — [`scripts/dev/m0-galeria-seed.ts`](../../../scripts/dev/m0-galeria-seed.ts)
- Captura — [`tests/galeria/captura.spec.ts`](../../../tests/galeria/captura.spec.ts) + [`playwright.galeria.config.ts`](../../../playwright.galeria.config.ts)
- Fixtures reusados — [`tests/helpers/setter-db.ts`](../../../tests/helpers/setter-db.ts)

## Terreno de la corrida

| Chequeo | Resultado |
|---|---|
| Rama | `main` |
| HEAD al arrancar | `6a88cbe` (sprint 6.2) |
| Sprint 6.2 en el log | **Sí** → los estados de m16 con horarios ofrecidos existen y se alcanzaron |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 |
| Sucio al arrancar | solo `docs/probe-01-censo-cosecha.md` (untracked, WIP ajeno — no se tocó) |

## Flujo real vs sembrado directo

| Modo | Cuántos | Qué significa |
|---|---|---|
| **Flujo real (parcial)** | 8 | Los toques de la cadencia son `OsLeadActivity` reales — las mismas filas que escribe el motor. La oferta de horarios de #31 pasa por `guardarHorariosOfrecidosOwned`, el write-path exacto de la action `ofrecerHorarios`. |
| **Interacción real** | 2 | #24a y #24b se provocan **desde la UI**: se escribe en el form y se manda, no se siembra nada. |
| **Sembrado directo** | 27 | Se coloca el lead por `stage` + blobs del dossier. |

**Por qué sembrado directo en la mayoría.** Llevar 30 leads hasta su estado por
la UI real exigiría encadenar el recorrido completo por cada uno (ficha →
evaluador → opener → cadencia → brief → 6 fases → borrador → chequeo → revisión
→ aprobación de Franco → envío → agenda). Varios pasos no los puede dar el
setter solo: la **aprobación / rechazo de la demo es de Franco desde admin** y la
**`finalUrl` la carga el admin**, así que APROBADA y RECHAZADA no son alcanzables
desde el panel del setter por definición. Eso vuelve el sembrado por flujo
impracticable para una galería reproducible, y se marca acá como pide la regla.
Ninguna combinación sembrada es imposible para el flujo real: son todas
posiciones que el motor produce.

---

## Los estados alcanzados

### Tramo Ficha y Evaluación

| # | Estado | Screenshot | Pantalla | Cómo se llega (palabras del setter) | Modo |
|---|---|---|---|---|---|
| 01 | m1 ficha vacía | `01-m1-ficha-vacia.png` | m1 | Te asignan un negocio nuevo y todavía no cargaste nada de la ficha. | directo |
| 02 | m1 ficha cargada | `02-m1-ficha-cargada.png` | m1 | Ya cargaste la ficha y volvés a mirarla — queda navegable, no se resetea. | directo |
| 03 | m2 al Evaluador | `03-m2-al-evaluador.png` | m2 | La ficha tiene señal: te toca copiar el bloque y pasarlo por el Gem Evaluador. | directo |
| 04 | m3 registrar veredicto | `04-m3-veredicto-registrar.png` | m3 | Volviste del Evaluador con el resultado y vas a registrar score y veredicto. | directo |
| 05 | m3 descartado | `05-m3-veredicto-descartado.png` | m3 | El Evaluador dijo DESCARTAR: queda el veredicto a la vista y nada por delante. | directo |

### Tramo Opener y Seguimiento

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 06 | m4 opener pendiente | `06-m4-opener-pendiente.png` | m4 | El negocio quedó AVANZAR pero todavía no le escribiste el primer mensaje. | directo |
| 07 | m4 opener enviado | `07-m4-opener-enviado.png` | m4 | Ya mandaste el opener y volvés a mirar la pantalla. | flujo |
| 08 | espera post-opener | `08-espera-post-opener.png` | espera | Mandaste el opener y el próximo toque no vence todavía: la pelota la tiene el negocio. | flujo |
| 09 | m5 toque vencido | `09-m5-toque-vencido.png` | m5 | Venció el toque de la cadencia y te toca registrar qué pasó. | flujo |
| 10 | m5 cadencia agotada | `10-m5-cadencia-agotada.png` | m5 | Hiciste todos los toques y nadie contestó: la cadencia se agotó (2.2). | flujo |
| 11 | m5 charla poblada | `11-m5-charla-poblada.png` | m5 | Hubo ida y vuelta: «Lo último de la charla» muestra el último toque con su nota (5.1). | flujo |

### Tramo Brief

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 12 | m6 brief abierto | `12-m6-brief-abierto.png` | m6 | El negocio respondió: se abrió el brief y te toca generarlo y traerlo. | directo |
| 13 | m6 brief guardado | `13-m6-brief-guardado.png` | m6 | El brief ya quedó guardado y volvés a leerlo. | directo |

### Tramo Construcción

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 14 | m7 tilde deshabilitado | `14-m7-tilde-deshabilitado.png` | m7 | Estás en las fases pero no arrancaste la construcción: el tilde no se ofrece y dice por qué (3.3). | directo |
| 15 | m7 estructura | `15-m7-estructura.png` | m7 | Arrancaste la construcción: primera fase, tilde habilitado. | directo |
| 16 | m8 personalización | `16-m8-personalizacion.png` | m8 | Segunda fase, con la primera ya tildada. | directo |
| 17 | m9 assets | `17-m9-assets.png` | m9 | Tercera fase. | directo |
| 18 | m10 CTA | `18-m10-cta.png` | m10 | Cuarta fase. | directo |
| 19 | m11 calidad | `19-m11-calidad.png` | m11 | Quinta fase. | directo |
| 20 | m12 mobile, fases hechas | `20-m12-mobile-fases-hechas.png` | m12 | Última fase, con las 5 anteriores tildadas (chips verdes en la nav). | directo |

### Tramo Borrador, Chequeo y Revisión

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 21 | m13 borrador vacío | `21-m13-borrador-vacio.png` | m13 | Terminaste de construir y te toca publicar en Netlify Drop y pegar el link. | directo |
| 22 | m14 chequeo | `22-m14-chequeo.png` | m14 | Ya hay borrador publicado: te toca pasar los 6 checks duros y mandar a revisión. | directo |
| 23 | revisión de Franco | `23-revision-franco.png` | revision | Mandaste la demo: Franco la está revisando y no hay nada que hacer. | directo |
| 24a | error de URL del borrador | `24a-error-borrador-url-invalida.png` | m13 | Pegás cualquier cosa en el campo del link y guardás: el error queda fijo, no se va como un toast. | interacción |
| 24b | error persistente del chequeo | `24b-error-persistente-chequeo.png` | m14 | Tenías el chequeo abierto y el lead se movió por detrás: al mandar, el server rebota y el motivo queda a la vista, en criollo (4.1). | interacción |

### Tramo Re-loop

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 25 | mr corrección N°1 | `25-mr-correccion-1.png` | mr | Franco rechazó la demo por primera vez: la nota está al frente. | directo |
| 26 | mr corrección N°2 | `26-mr-correccion-2.png` | mr | Segundo rechazo: la corrección nueva al frente y las anteriores colapsadas (5.2). | directo |

### Tramo Envío

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 27 | m15 envío abierto | `27-m15-envio-abierto.png` | m15 | Franco aprobó y el negocio está respondiendo: se destrabó el envío del link. | directo |
| 28 | espera sin respuesta | `28-m15-espera-sin-respuesta.png` | espera | Está aprobada pero el negocio no respondió: espera con m15 consultable, que nombra la causa real (5.3). | directo |
| 29 | espera sin URL final | `29-m15-espera-sin-final-url.png` | espera | Aprobada y el negocio respondió, pero falta la URL final que carga el admin. | directo |

### Tramo Agenda

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 30 | m16 virgen | `30-m16-virgen.png` | m16 | Mandaste el link, el negocio dijo «sí, reunámonos» y todavía no ofreciste horarios. | directo |
| 31 | m16 con horarios ofrecidos | `31-m16-ofrecidos.png` | m16 | Ya le pasaste 3 horarios y volvés a entrar: los mismos horarios siguen ahí (6.1/6.2). | flujo |
| 32 | m16 agendada | `32-m16-agendada.png` | m16 | La reunión quedó agendada: resumen del traspaso, nada por delante. | directo |
| 33 | m5 post-envío | `33-m5-post-envio.png` | m5 | Mandaste el link y venció el toque: registrás el seguimiento post-envío con m16 al lado. | flujo |

### Terminales y home

| # | Estado | Screenshot | Pantalla | Cómo se llega | Modo |
|---|---|---|---|---|---|
| 34 | archivo (perdido) | `34-archivo-perdido.png` | archivo | El negocio se cerró sin avanzar (Franco lo marcó PERDIDO): vista de archivo, read-only (2.3). | flujo |
| 35 | home — tu foco | `35-home-foco.png` | `/setter` | Entrás al panel: el foco te dice con qué negocio seguir. | directo |
| 36 | home — tu cartera | `36-home-cartera.png` | `/setter` | Mirás toda tu cartera, subordinada al foco. | directo |

### Mobile

| Screenshot | Qué muestra |
|---|---|
| `M-35-home-foco.png` | El panel en el celular: el drawer (botón hamburguesa) reemplaza la barra lateral. |
| `M-09-m5-toque-vencido.png` | El registro de toque en el celular — lo que más se usa fuera del escritorio. |
| `M-15-m7-estructura.png` | Una fase de construcción en el celular: la nav de fases cambia de forma. |
| `M-31-m16-ofrecidos.png` | La agenda en el celular (la pantalla con más form). |

---

## INALCANZABLES

**Ninguno de los 37 estados enumerados quedó sin alcanzar.**

Se registran igual dos límites que la corrida encontró y que el manual tiene que
tener en cuenta:

1. **APROBADA y RECHAZADA no son alcanzables desde el panel del setter.** No es
   una falla: aprobar o rechazar una demo, y cargar la `finalUrl`, son acciones
   de Franco desde el admin. Todo el tramo Envío + Agenda + re-loop (#25 a #33)
   sólo existe para el setter *después* de que Franco actúe. El manual no puede
   prometer "hacé X y llegás acá" en ese tramo: hay una espera de un tercero en
   el medio. Por eso esos estados van sembrados directo.

2. **El estado 24 (error persistente) no se puede sembrar, sólo provocar.** Es un
   estado de interacción: existe durante la vuelta de un submit rechazado. Se
   alcanzó desde la UI, pero no hay forma de "dejar la app" en ese estado — si
   alguien quiere volver a verlo, tiene que re-provocarlo.

## Lo que vi y me llamó la atención

**1. Cuatro de las cinco herramientas externas dicen PENDIENTE.** Visible en la
barra lateral de *todas* las capturas (p. ej. `35-home-foco.png`): **Evaluador**,
**Gem de diseño**, **Claude Design** y **Gem de outreach** aparecen con la
etiqueta `PENDIENTE` y sin link. La única con URL real es **Netlify Drop**. Esto
no es cosmético: el manual del setter dice literalmente "copiá el bloque y pasalo
por el Gem Evaluador" (m2) y "generá el brief" (m6) — y desde el panel no hay
adónde ir. **Es el hallazgo más importante de la corrida**: el recorrido está
completo en la app y roto en las herramientas. Las URLs viven en
`herramientas.ts` y son de Franco.

**2. En una pantalla larga, `fullPage` de Playwright no captura la pantalla
completa.** El layout del setter no scrollea el documento: scrollea un
`<main class="overflow-y-auto">`, y el `document` mide siempre el viewport.
Cualquier verificación visual de este portal que confíe en `fullPage: true` está
mirando sólo el primer scroll — la primera vuelta de esta misma galería salió
recortada así. Está arreglado en `captura.spec.ts`, pero afecta a cualquier otro
job de screenshots contra `/setter/*`.

**3. Un lead que llegó hasta APROBADA muestra la Construcción como no
completada.** En `31-m16-ofrecidos.png` la tira "COMPLETADAS" lista Ficha, Al
Evaluador, Veredicto, Brief, Borrador, Chequeo final y Envío — **pero ninguna de
las 6 fases de construcción**. Es coherente con el diseño (el checklist es
auto-reporte y `completadasDe` lo lee de `progresoJson`, no del stage), pero al
setter le queda un rastro que sugiere que se salteó la construcción de un
negocio que evidentemente construyó. Vale decidir si el manual lo explica o si
la pantalla debería inferirlo del stage.

**4. Un toque vencido no se ve vencido.** En `09-m5-toque-vencido.png` /
`M-09-m5-toque-vencido.png` el contexto dice "Próximo toque: 22/7" — una fecha
**ya pasada** (la corrida fue el 23/7) — sin ninguna marca de atraso. La pantalla
es la correcta (el motor derivó bien que hay que tocar ahora), pero el dato en
crudo se lee como si el toque fuera a futuro.

**5. El home llega con mucho ruido acumulado.** En `35-home-foco.png`: campana
con `9+`, **60 novedades** sin leer y "1 de 44 para trabajar". Las novedades
visibles son todas "Te reasignaron un lead" de datos de smoke viejos. Es DB de
dev, no producción — pero muestra que la sección de novedades no tiene techo ni
resumen cuando se acumula, y para las capturas del manual conviene un setter con
la bandeja limpia.

**6. Mezcla de controles en la misma pantalla.** En m16 (`31-m16-ofrecidos.png`)
el "Estoy hablando con el dueño / quien decide" es un checkbox cuadrado nativo,
mientras que los 6 checks de m14 y los toggles de las fases son switches
(`role="switch"`). Dos controles distintos para la misma idea de "tildar algo".

**7. Detalle de captura, no del producto.** Las animaciones de `motion/react` no
las frena el CSS inyectado, así que en las fotos disparadas justo después de un
clic (24a/24b) puede quedar un círculo gris del toggle a mitad de transición. No
es un bug de la app; anotado para que nadie lo lea como uno.
