# SPRINT PULIDO 12 — loop autónomo de verificación (sólo defectos objetivos)

Rama `rediseno/home`. Invariante nuevo: `npm run test:s63-pulido-12` (`src/app/v3/_lib/__tests__/s63-pulido-12.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (los de PULIDO 11, fuera del repo). Recibos: `docs/rediseno/entregas/pulido-12/`.

Alcance: sólo defectos OBJETIVOS y medibles (solapes de texto entre sí o con la silueta del logo, algo cortado o fuera de
pantalla, controles fijos que chocan, contraste < AA, cuadros > 20 ms en una transición, errores o advertencias de consola,
interpenetración 3D, estados rotos). No se tocan defaults de banderas, timings, curvas, colores ni copy. `lente.ts` (sólo fin
de línea) no entra en ningún commit.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### 1 · VERIFICAR TRAS REINICIO (de PULIDO 11) y los tres puntos nuevos
- HECHO: el build de producción para el banco (`.next-probe`, 171 s) y `next start`; un Chrome (placa: la NVIDIA, leída en la
  página: «ANGLE (NVIDIA, NVIDIA GeForce RTX 5050 …)»).
- Fase B (los formularios), VISTO sí, en el banco:
  - Recorridos tibios (la segunda vez que el navegador ve ese estado): el cuadro más largo, 13,5–14,2 ms, en el pie a 1440,
    1024, 768 y 390 y en el panel a 1440 y 1024; con las dos variantes del volteo; con éxito y con error. Reintentar toma el
    foco; vuelve con los tres valores; el foco, en Enviar. «Enviar otro mensaje» deja los campos vacíos. Sin errores de consola.
  - El autocompletado (`Autofill.trigger`): a 1440 y 390 el nombre y el mail quedan autocompletados sobre su pozo.
  - Los cuadros largos de la PRIMERA vez (53 a 880 ms) NO son de la página: con la traza del navegador (`diag-traza.ts`) el
    hilo principal no tiene ninguna tarea de más de 40 ms; lo que se traba es el proceso de la GPU, en
    `RendererRasterWorker` → `Program::MainLinkLoadEvent::wait` / `GetVertexExecutableTask` (compila los sombreadores de Skia
    para rasterizar el DOM nuevo: el desenfoque de la tarjeta). Con el caché de sombreadores borrado se reproduce; la segunda
    vez, nunca. El driver nuevo vació ese caché. No se arregla desde la página sin sacar los filtros (eso es gusto): anotado.
  - El panel abajo de 1024 no se pudo abrir en la primera tanda: era el banco (el primer `[data-abre-contacto]` visible es un
    CTA que viaja al pie); se abre desde el menú (corregido en `b-formulario.ts`).
- C1 medido (`c1-pie.ts`, `c1-bordes.ts`): ver la sección 2.
- Los tres puntos nuevos:
  - La caída contra las piezas 3D del pie (`d-cruces.ts` con el gancho `__crucesDelBanco`: puntos de la superficie del logo
    adentro de la caja de cada malla de cada pieza, con el reloj clavado cada 0,05 s): 0 cruces en los 105 momentos, a 1024,
    1280, 1440, 1920 y 2560, las dos variantes; en pantalla, la silueta del logo no toca ninguna caja del pie. El margen
    mínimo, en la tanda E.
  - La cabecera de 860 a 1023: defecto 2 (tabla).
  - El pie a 375: va en la matriz (el recibo de cada parada del fondo ahora mide los solapes del pie).
- La fase D (la caída) en vivo: un golpe por corrida, en el cuadro del contacto (la pose justo antes: −87°; en el golpe:
  −89°), el reinicio entero (dos golpes, el logo acostado en su lugar). Hojas cuadro a cuadro miradas: parado, baja, se inclina,
  cae al hueco, el piso se enciende; nada atraviesa nada a la vista.
- Lección del banco: un `taskkill` filtrado por `CommandLine -match 'next start'` se mató a sí mismo y a su cadena (el filtro
  coincidía con su propia línea de comando): filtrar por `Name='node.exe'` y el patrón exacto.

### 2 · C1, el pie simétrico
- EN CURSO (código escrito; falta el banco con el build nuevo).
- Medido ANTES (al fondo, el final clavado en 0): el logo centrado (0–1 px) a 1024, 1280, 1366, 1440, 1920 y 2560; las dos
  cajas de columna del mismo ancho (un cuarto) y a la misma distancia del logo. Lo que no es simétrico es lo que se VE: el borde
  derecho de las letras de la izquierda contra el del formulario (que llena su columna):

  | Ancho | Columna izq.–logo (letras) | Logo–form | Diferencia | Se sale de la columna izquierda |
  |---|---|---|---|---|
  | 1024 | 157 | 164 | −7 | sí: «Por qué develOP» +7 px, WhatsApp +13, Facebook +16 |
  | 1280 | 216 | 208 | +8 | no |
  | 1366 | 247 | 225 | +22 | no |
  | 1440 | 251 | 220 | +31 | no |
  | 1920 | 417 | 316 | +101 | no |
  | 2560 | 401 | 284 | +117 | no |

  «El recorrido»: los renglones de las dos columnas están a la MISMA altura en reposo (Inicio y Servicios, 501 = 501 a 1024; 676
  = 676 a 1920, también en la captura del 3D).
- Arreglo (geometría, sin tocar tipografía ni color): (a) las dos columnas con un mínimo de 264 px si el hueco del logo lo deja
  (`max(25 %, min(264 px, 50 % − hueco))`): a 1024 la izquierda entra entera; (b) en la columna izquierda las dos columnas de «El
  recorrido» a lo ancho (`justify-between`): la segunda termina en el borde de la columna, así las letras de la izquierda llegan
  a donde llega el formulario del otro lado (la referencia, form–logo, no cambia). `s8` y `s61` fijaban la clase de la columna:
  actualizadas al valor nuevo con la misma propiedad (y `s8` sigue afirmando que un cuarto deja el hueco).

### 3 · La tarjeta de resultado al rotar el teléfono
- Defectos 1 y 5 (tabla). Para el 5: `_lib/formularios/memoriaDelFormulario.ts`: al desmontarse guarda lo suyo; si se monta
  otro dentro de 1 s, arranca de ahí; un envío en viaje se anota como promesa y su respuesta llega al nuevo. Con la tarjeta
  recuperada el encastre vuelve a caer (y suena) una vez: es el montaje nuevo (anotado en «Lo que no quedó bien»).
- EN CURSO: `_lib/formularios/altoGuardado.ts` (`useAltoGuardado`): el alto guardado al enviar se suelta si cambia el ANCHO de la
  ventana (no con un cambio sólo de alto: la barra del navegador). Banco: `r-rotar.ts` (antes con el build viejo, después con
  el nuevo).

### Revisión adversaria (agente de sólo lectura) antes de los commits de 1 · 2 · 3
- Sin defectos graves. Confirmó: la clase de C1 compila a CSS válido (`max(25%, min(calc(… * 3.3), calc(50% - …)))`), `cn()`
  deja `justify-between` y el gap chico, el orden de los efectos del montaje nuevo, sin desajuste de hidratación, ningún test
  más débil.
- Arreglado por la revisión: (a) el modo de arranque del cromo es `barra`: en una navegación del cliente el progreso podía
  pintarse un cuadro abajo en el teléfono → `useLaBarraSeVe` dice que sí sólo cuando la barra ya midió; (b) si la respuesta
  llegaba entre el dibujo del formulario nuevo y su efecto, el pedido ya se había soltado y quedaba «enviando» para siempre →
  el pedido se queda hasta el envío siguiente (s63 con su control); (c) el ancho del diseño (`clientWidth`) en vez de
  `innerWidth` (el zoom de dos dedos del iPhone lo cambia); (d) lo escrito no queda en memoria: se borra 1,1 s después de
  que el formulario se fue; (e) el gancho del banco contaba la raíz del pie como una pieza más.

### 4 · La matriz completa
- El instrumento de cajas (`cajas.ts`) contaba texto que NO se ve: el DOM transparente que marca dónde va el 3D (la frase
  del CTA estando en Demos), lo que un ancestro recorta (los mensajes adentro de la ventana de la demo de Tu panel, las
  tarjetas de Servicios fuera de su carrusel). Ahora se recorta con `overflow` y `clip-path: inset(…)` de los ancestros y se
  saltea la tinta transparente; control positivo: un párrafo inyectado encima de un texto se detecta (a 375 y 1440). Una
  primera versión trataba `rgb(0, 0, 0)` como transparente (el control lo vio).
- Abajo de 1024 el logo va DETRÁS del texto por diseño (la mezcla de la bajada, V3/B13): ahí el solape texto × logo no es un
  defecto; cuentan texto × texto, desbordes y consola.

### 5 · Loop y verificar final
- PENDIENTE.

## Defectos encontrados

| # | Dónde | Ancho | Causa | Commit | Re-verificado |
|---|---|---|---|---|---|
| 1 | La tarjeta del resultado del panel de Contacto al rotar | 390 × 844 → 844 × 390 | El alto del formulario guardado al enviar no se soltaba: la tarjeta seguía de 498 px en un cuadro de 390 y «Reintentar» quedaba afuera (379–420) | (pendiente) | sí: 318 px, «Reintentar» en 306–346 |
| 2 | La cabecera: Login contra el disco del progreso | 1000 y 1023 (desde que la barra entra, ~980) | C2 ponía el progreso arriba a la derecha por el ANCHO (< 1024) y no por el modo: con la barra a la vista su esquina (Contacto y Login) está ahí. Choque de 27 × 32 px | (pendiente) | sí: 0 choques de 390 a 1023 |
| 3 | El pie: la columna izquierda se salía de la suya | 1024 | Un cuarto (240 px) no alcanzaba: WhatsApp +13, «Por qué develOP» +7, Facebook +16 | (pendiente) | sí: columna de 264, nada visible afuera |
| 4 | El pie no era simétrico a la vista | 1280–2560 | Las letras de la izquierda no llegaban al borde de su columna (+8 a +117 px más lejos del logo que el formulario) | (pendiente) | sí: iguales ±1 px en los seis anchos |
| 5 | El formulario del pie pierde la tarjeta y lo escrito al rotar una tablet | 768 × 1024 → 1024 × 768 (cruza 1024) | `CanalDePieza` cambia de tipo con el modo del pie (con progreso / sin él): React desmonta el formulario | (pendiente) | (tanda E) |

## Memoria (antes de cada tanda: disponible y no paginado)

| Cuándo | Disponible | No paginado | Nota |
|---|---|---|---|
| Al empezar (PC reiniciada, driver de la placa nuevo, sin dev server) | 7064 MB | 826 MB | |
| Tanda 1 (build hecho, `next start` andando, antes de lanzar el Chrome del banco) | 7681 MB | 793 MB | |
| Tanda B (los formularios y C1) · al empezar | 6358 MB | 807 MB | Chrome del banco relanzado una vez (para borrar el caché de sombreadores: el diagnóstico) |
| Tanda B · al terminar | 3876 MB | 856 MB | +49 MB de no paginado en la tanda |
| Tanda C · al empezar | 4484 MB | 812 MB | |

## VERIFICAR TRAS REINICIO

(vacío por ahora)

## Lo que no quedó bien

(se completa al cierre)
