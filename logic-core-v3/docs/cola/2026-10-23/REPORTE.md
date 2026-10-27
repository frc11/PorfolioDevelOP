# REPORTE · cola 2 (2026-10-23, cerrada el 2026-10-27)

## Resumen (10 líneas)
1. **Las 14 tareas de la cola están integradas en `nocturno/2026-10-23` y verificadas en el navegador**, cada una con su banco y sus controles en rojo y el humo del home después de cada merge: 20, 21, 22, 30, 31, 40, 41, 50, 51, 60, 70, 71, 80 y 81. **La 90 (el cierre técnico) también está hecha.**
2. **El `next build` pasó** al primer intento (3 min 18 s, sin avisos). Contra el build: la matriz de escritorio 90/90 y la del teléfono verde a 390, 768, 820×1180 y 1023×768 (salvo el deep link a un proyecto, punto 7). `verificar`: los mismos 8 grupos con falla que la base construida, **0 afirmaciones nuevas en falla** (11 arregladas en 90v), `tsc` 0.
3. **Lo primero que tiene que mirar Valentino:** `/v3` a 1440 de arriba abajo, después en un teléfono (o a 390) con el movimiento, y el viaje desde el CTA de un servicio hasta `/v3/pagina-base` (abajo, «Qué tiene que mirar Valentino»).
4. **Un defecto real abierto, con la causa (81):** el movimiento prendido no vuelve prendido al recargar. Chrome 156 ya trae `DeviceOrientationEvent.requestPermission` y lo concede sin gesto, así que el sitio trata a Android como iOS y espera un toque. Arreglo propuesto abajo; no se implementó (la 81 usó sus dos intentos).
5. **Un defecto real que encontró la 90 en el viaje (B12b, de la noche anterior):** la página que llega se ve 3–4 cuadros sobre la escena antes del destape. La `transition` de opacidad que `deslizamiento.css` le pone a todo `main` pelea con el `opacity: 0` de `paginaTapada.ts`. Arreglo propuesto abajo; no se tocó.
6. **Un criterio sin alcanzar (21, sigue en el build):** «la página → el home» tiene un cuadro de 250–313 ms con la banda moviéndose (el chunk de la página del home 171 ms + la carga de las fuentes 98 ms), en las 4 vías. La píldora, en cambio, va dentro del tope (3,39 y 3,44 px/ms con la hora del cuadro; tope 3,96).
7. **A decidir:** el deep link `/v3#portfolio-esquina-estudio` en el teléfono deja el carrusel del 66 al 143 % del alto (desde la 40 el título va arriba). Los 404 del build son las páginas de servicio del desplegable, que viven en `paginas/servicios`.
8. **Arreglado en la 90 (21d):** el desplegable de Servicios cerrado desbordaba la página 19 px a 360 y 4 px a 390. Verificado: 0 desbordes, el desplegable abierto en su lugar, humo 7/7.
9. **Avisos para Franco:** la newsletter no recibe el nombre (`/api/newsletter` sólo acepta `mail`) y «Probar ahora» del Panel no hace nada; el chat recibe los colores por la prop `overrides`.
10. Nada se mergeó en `rediseno/home`, `paginas/servicios` ni `main`. Ningún push forzado. No queda ningún worktree de tarea.

## Por tarea
| id | estado | commits (merge) | medido |
|---|---|---|---|
| 20 · piezas compartidas | integrada y verificada | 5d688d62 (6745764a) · e8910ec5 | `estado-de-envio` 1440 3/3 y 390 2/2; `autocompletado` 8/8; controles `sin-carga` y `sin-arreglo` en rojo; `sin-datos` ciego (los campos vuelven del estado de React) |
| 21 · navegación y chat | integrada; un criterio sin alcanzar | 39df0e85 (798bc079) · 21d: aba5b8a9 (7931926e) | `desplegable` 6/6; `chat-zonas` 30/30; `navegacion-escena` 5/16 (la cámara a 1,45–1,97 % de su pose al aparecer el título; tope 1 %; sin el arreglo, 24–540 %); en el build «la página → el home» con un cuadro de 250–313 ms; 21d: sin desborde a 360/390 |
| 22 · contacto general | integrada y verificada | e4eb0849 (d8a0537f) · 36d17a4e | `contacto-general` 8/8 a 390 y 768, 1024 y 1440 sin fallas; los 5 controles en rojo |
| 30 · Quiénes somos | integrada y verificada | 30s: 60006f71 (59592d81) · 06dc2d6d; 30f: 26610ce1 (25e6877d, marcadores sacados en 68085a09) · f17e1a0e (7803dea3) · 218f1873 | `distinto` verde a 1440/1024/768 (la tinta del ≠ 3,12 y 2,93 veces la de antes); `equipo` verde (peor caso 0,906 y 0,914, piso 0,87); controles en rojo |
| 31 · cristal | integrada y verificada, con notas | 31m: 153b4276 (9b953a00); 31g: 8f410917 (e299519a) · 923c6374 (ec220dd3) | el moiré sin la loma del cursor (el piso ya no se levanta: cambio de diseño); grietas por celda; en el build se forman en 1,39 s y cuestan +0,062 ms (`centro`) y +0,024 (`borde`) |
| 40 · Portfolio | integrada y verificada | db0f6ec8 (15d750fd) · d5f8f299 | carrusel 390/768 (título y carrusel juntos 0,97 y 1,00; tarjetas iguales); en el build, la matriz del teléfono verde salvo el ancla |
| 41 · Demos | integrada y verificada | 41t: 5da44bfa (d795ea04) · c6b48575; 41e: b14bb875 (44a16fb0) · 3f355971 · 1b7216bf (133edbf4) · f10df90b (ca2c14a3) | `demos-telefono` 6/6; `demos-escritorio` sin franja (banda 0,103 y 0,084), espejo Δ 0,0 px, hover 20/20, carga 6/6; controles en rojo |
| 50 · Servicios | integrada y verificada | b6fdbc7d, efe04c99 (ae272b67) · 36adcc5d | `servicios-c2` 31/31 (12/12 a 1440 contra el build); gatillos 16/16; capa 4/4 |
| 51 · recomendador | integrada y verificada | 7c7be763 (6422be13) · a0c2f706 | `recomendador` 8/8 a 1440 y 390 (8/8 a 1440 contra el build); los 7 controles en rojo |
| 60 · Tu panel | integrada y verificada | 60b: 7b7d66bb (39b3fd8d) · 3e6cd6e6 (e50f1cd8); 60c: 231d3942 (805fe1dc) · 8a1ea55d; 2b2c72e6 | `panel-b6` verde a 1440/1024 (también contra el build); espacios verdes a 4 anchos; `cta-del-panel` 38/38; controles en rojo |
| 70 · reseñas y CTA | integrada y verificada | a27d35d5, d16ae8e3, 7e0b7f72, e34f1924, b124b22a (c1803c9d) · 296cfd2f · 4b585d62 · 70t: 6cd4c729 (60ba7252) · 70e: 0fe2f0fc, 6f8cdd08 (e2de8770, 87c16109) | aro legible (control al 30 % en rojo); `resenas-telefono` 20/20 (también contra el build); en el build el aro cuesta +0,1 ms |
| 71 · pie y FAQ | integrada y verificada | 71t: 301622d6 (eaa5838a); 71e: 9acc7e4b | `faq-del-pie` 5/5; `faq-telefono` 4/4; el bug del pie al cruzar 1024 (contexto global) reproducido por su control y arreglado por lienzo |
| 80 · login | integrada y verificada | ff89a892 (106ae46f) · 1b1e7c0a | `ingreso` verde; en el build el fundido a 390 en el compositor: 200 ms, 16 cuadros, 0 perdidos, arranca 248 ms después de crearse (en el dev 323–363) |
| 81 · preloader y movimiento | integrada y verificada, con un defecto abierto | fde3c964 (7fa2f564) · c6f61f71 (789ea385) | preloader verde; bienvenida en el compositor, en el build arranca 245–249 ms después de crearse; el movimiento no vuelve prendido al recargar (causa encontrada) |
| 90 · cierre técnico | hecha | 7246be74 (6c253169: la skill) · b779997c, 35ce4413 (bancos) · 21d: aba5b8a9 (7931926e) · 90v: 7373c62f, 4b946356, 1e46450a (bdf0c7ad) | build, §1 contra el build, matrices, controles, `verificar`, limpieza (abajo) |

## La 90 contra el build (`next start` en :3002; el 3000 es de Valentino)
| qué | resultado |
|---|---|
| `next build` | ok al primer intento (3 min 18 s, sin avisos); otra vez con 21d y con 90v, ok |
| la vía del velo hacia el home | `ambas` (la de por defecto) sigue siendo la más rápida: 1,7–2,2 s contra 1,8–2,1 s de `banda`, `montaje` y `ninguna` |
| «la página → el home» | falla en las 4 vías: un cuadro de 250–313 ms con la banda moviéndose (el chunk de la página del home 171 ms + `FontFaceSet.onloadingdone` 98 ms); «el home → la página» y los otros dos recorridos, ok |
| la píldora | 3,39 px/ms hacia el home y 3,44 hacia la página con la hora del cuadro (tope 3,96) |
| los 404 del barrido | los `?_rsc` de `/v3/paginas-web`, `/v3/software-a-medida` y `/v3/ia-y-automatizaciones`: el desplegable (B12a.5) precarga páginas que viven en `paginas/servicios` |
| el fundido del login a 390 | 200 ms en el compositor, 16 cuadros, 0 perdidos; arranca 248 ms después de crearse |
| las grietas en el home | se forman en 1,39–1,40 s (objetivo 1,5); +0,062 ms por cuadro con `centro`, +0,024 con `borde` (tope 0,1) |
| la bienvenida en el teléfono | arranca 245–249 ms después de crearse; continua (0–1 cuadros perdidos) |
| el costo de la escena | reposo: 75 fps, p95 13,7 ms, 0 cuadros largos, hilo 219 ms/s; una pasada de rueda: p95 13,5 ms, 0 largos; el aro de reseñas +0,1 ms (placa NVIDIA) |
| la matriz de escritorio | 90/90 |
| la matriz del teléfono | 390×844, 768×1024, 820×1180 y 1023×768: todo verde salvo `ancla` (arreglos propuestos, 4) |
| `verificar` | base construida (ae039793): 8 grupos con falla (s10, s17, s2, s3, s4, s5, s7, s8); integración: los mismos 8, 0 afirmaciones nuevas en falla; dos de la base ahora pasan (s5-compacto y una de s7-compuerta) |
| controles ciegos | `preloader.ts en-recargas` (lo hizo la 81) y el del aro al 30 % (2,52:1) en rojo; `viaje.ts sin-tapar` rehecho: ahora falla con el defecto (4 cuadros en 1,00 y el logo a 3,75 % de su hueco) |
| limpieza | `.next-b12` de la integración del 22 borrado; los worktrees de tarea, todos quitados con sus ramas |

Lo que la 90 arregló (con subagente, en su worktree, mergeado y verificado):
- **21d** — el desplegable de Servicios cerrado desbordaba la página a lo ancho: 19 px a 360 y 4 px a 390, en `/v3` y en la página base. La 21 lo dejó con la x medida sólo al abrir y un respaldo en la mitad de la cabecera. El respaldo pasó a 0. Verificado: 0 desbordes, el desplegable abierto a 0,00 px de «Servicios», humo 7/7.
- **90v** — las 11 afirmaciones nuevas de `verificar`:
  - lo compartido entre secciones pasó a `_componentes/` (el pintado del título de Tu panel, la letra del formulario del Portfolio);
  - las cinco fuentes de Google de la bandera de Servicios quedan como excepción enumerada y provisoria;
  - tokens en el aro de reseñas (atributos de presencia) y en Servicios;
  - cuatro invariantes que fijaban texto cambiado a propósito, aflojados con sus controles.
  - Verificado: aro legible con su control en rojo; el cartel del arrastre aparece y sigue al mouse (foto `fotos\90\cartel-del-arrastre.png`); reseñas del teléfono 20/20, Servicios 12/12, Tu panel en verde, recomendador 8/8, humo 7/7.
- **Los bancos** (b779997c, 35ce4413):
  - `viaje.ts`: el control `sin-tapar`, y a 390 llega a web por el gatillo de Servicios;
  - `chrome-en-los-anchos.ts`: anota la URL de cada respuesta ≥ 400;
  - `carrusel.ts`: el resultado de «la tuya» es el de `EstadoDeEnvio`.

## Qué tiene que mirar Valentino
Con el dev en `C:\rediseno-home\logic-core-v3` después del merge (o la integración en :3002), siempre en `/v3`:
- **20 · piezas compartidas** — a 1440, enviá el formulario de «la tuya» (Portfolio) y el del pie: la carga de develOP, el encastre con «¡Recibido!» o el error, y a los 3 s el formulario de vuelta. HABLANOS y «Probar ahora» con su reflejo.
- **21 · navegación** — a 1440, desde el Portfolio tocá «Home» en la píldora: el velo, la cámara, el título. Abrí «Servicios» en la barra: la lista abre con su borde izquierdo en el de «Servicios». El chat se desvanece en Trabajos, Servicios y el recomendador.
- **22 · contacto** — a 390 y 768, «Contacto»: el panel llega por escala desde el botón, con el fondo desenfocado; a 1024 también es el panel (modo menú).
- **30 · Quiénes somos** — a 1440 y 1024, el ≠ grande y centrado al costado del logo; las fotos del equipo con su etiqueta, cada una mirando a su lado; la descripción más grande.
- **31 · cristal** — a 1440, mové el mouse sobre el piso: **ya no se levanta bajo el cursor** (cambio de diseño, confirmalo). Bajá hasta el CTA del final: las grietas por celda. Compará con `?grietas=borde`.
- **40 · Portfolio** — a 390 y 768, «Portfolio» con su bajada arriba del carrusel, en la misma pantalla, levantándose.
- **41 · Demos** — a 1440, la primera pantalla sin franja; el clic abre la demo correcta con su portada de carga. A 390, Demos entra pegada y el título se levanta.
- **50 · Servicios** — a 1440 con la rueda y a 390 con el dedo: cada gesto un servicio; web desde la izquierda, software desde la derecha, IA desde arriba.
- **51 · recomendador** — debajo de IA: las tres etapas, el procesando, el resultado y el contacto precargado.
- **60 · Tu panel** — a 1440 y 1024, los espacios entre títulos y el CTA con «acá.» en el último renglón. **A decidir** abajo de 1024: los títulos de los módulos casi no separan las palabras (foto `fotos\60b\390-modulo.png`).
- **70 · reseñas** — a 1440, «Seis razones» y el aro: el título se voltea y sus mitades se juntan en el medio, la cámara acompaña, el aro entra frenando parejo; con el mouse sobre la placa del frente, «Mantené para arrastrar». A 390, el carrusel de reseñas que deriva solo.
- **71 · pie y FAQ** — a 1440, al fondo: el FAQ en 3D después del pie (el pie se hunde por columnas). A 390, la lista de vidrio.
- **80 · login** — a 1440, «Login»: la expansión sin meseta. A 390, `/v3?ingresar`: el fundido. **A decidir:** en la entrada directa el velo de carga tapa el login varios segundos.
- **81 · preloader y movimiento** — la primera entrada del día (`/v3?preloader=si`): la flecha a trazos hacia el sonido; en un teléfono también hacia el movimiento, y tocar la frase prende los dos. El botón del movimiento, arriba a la derecha: inclinar mueve la cámara y el moiré.
- **El viaje** — a 1440, en Servicios, tocá el CTA de Desarrollo web: la escena cubre y llega la página base. Ahí se ve el destello (la página aparece y se apaga antes del destape).

**Banderas para elegir** (entre paréntesis, el valor por defecto):
- `?titulo-servicio=1|2|3` (1);
- `?fuente-servicio=1|2|3|4` (1);
- `?diagonal=` (6,5);
- `?resenas=gatillo|scroll` (gatillo);
- `?grietas=centro|borde` (centro).

**Se borraron:**
- `?moire=` (queda el del mouse, sin la loma);
- `?servicios-movil=deslizar` (el teléfono con movimiento es siempre el escenario con gatillos);
- `?resenas-arrastre` y `?chat=` (en la sesión 2).

## Arreglos propuestos (no implementados)
1. **El movimiento al recargar (81).** En `retomarElMovimiento` (`_lib/escena/movimiento.ts`), cuando `pidePermiso()` da verdadero, probar primero `DeviceOrientationEvent.requestPermission()` sin gesto: si resuelve `granted` (Chrome), prender en el acto; si rechaza (iOS sin gesto), esperar el toque como ahora. `movimiento.ts` ya lo mide («prendido y recargado, vuelve prendido»).
2. **El destello de la página que llega en el viaje (B12b).** En `paginaTapada.ts`, al tapar un `main` nuevo, apagarle también la transición (en línea, devuelta en `mostrar` y en `soltar`), para que la de `deslizamiento.css` no lo desvanezca a la vista. `viaje.ts` lo mide («la página nueva tapada hasta el destape»).
3. **El cuadro largo de «la página → el home» (21).** El chunk de la página del home y la carga de las fuentes caen mientras la banda se mueve. Una idea: precargar el chunk del home desde la página y esperar a las fuentes antes de soltar la banda.
4. **El deep link a un proyecto en el teléfono (40).** `#portfolio-esquina-estudio` deja el carrusel del 66 al 143 % del alto (la tarjeta pedida, bien). Mover el ancla al carrusel o compensar el título. A decidir si importa.

## Avisos para Franco
- `/api/newsletter` acepta sólo `mail`: el «Nombre» del formulario del CTA del Panel no viaja (60c).
- «Probar ahora» del Panel no hace nada todavía (`AL_PROBAR` en `BotonDeProbar.tsx`).
- El chat del sitio recibe los colores del home por la prop `overrides` de `LogicCompanion.tsx` (B11, la noche anterior). Es aditiva y `/` sigue igual; revisarla antes de que llegue al sitio vivo.
- Nada de esta cola toca `/api/` ni el sitio vivo fuera de eso.

## Lo que no corrió y por qué
- De la matriz de escritorio, sólo el modo por defecto entero (90/90). La ráfaga corrió con los índices del humo, y los modos `a1`, `a2`, `a3` y `a9` no corrieron.
- `moire-costo.ts` se cae contra el build: no encuentra una sección, el banco quedó viejo desde la 31m. El costo del moiré lo midió la 31m con `moire.ts`.
- El `.next-b12` del checkout principal (`C:\rediseno-home\logic-core-v3`) no se borró: es un build completo en la copia de Valentino, ignorado por git.
- La integración de la noche anterior (`C:\nocturno\2026-10-22\integracion`) sigue como worktree: es de esa corrida.

## Comandos
- Mergear a mano:
  - `git -C C:\rediseno-home switch rediseno/home`
  - `git -C C:\rediseno-home merge --no-ff nocturno/2026-10-23`
- Antes del merge: si `logic-core-v3/docs/cola/2026-10-23/` existe sin trackear en el checkout principal, moverlo (choca con la rama).
- Borrar la integración cuando ya no haga falta:
  - `git -C C:\rediseno-home worktree remove --force C:\nocturno\2026-10-23\integracion` (su `node_modules` es propio, de su `npm ci`: no es un junction al del principal);
  - `git -C C:\rediseno-home branch -d nocturno/2026-10-23`.
- No queda ningún worktree de tarea.
