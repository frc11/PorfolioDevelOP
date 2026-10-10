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

### Defecto 6 · Quiénes somos al salir (y su revisión)
- `_lib/escena/titulos3d/esquivaAlSalir.ts`: el cuerpo (`data-esquiva-al-salir`) se va si, pasado el reposo del viaje de su
  sección más de 24 px, su caja (la que se ve) cruza la del logo (esquinas de la caja de cada malla, con la cámara de verdad), y
  vuelve recién a menos de 8 px del reposo. Tres vueltas medidas: con la caja del documento (sin transformadas) y la cámara sin
  el mouse no actuaba a 1920 (el mouse del banco corre la cámara: lo que se ve es con la cámara viva); con el muestreo de vértices
  se escapaban unos px del pie de la P.
- Revisión adversaria: la primera versión se iba a los 9 px (un empujón de la rueda la borraba) y comparaba con el tope del panel
  y no con el reposo del viaje → dos marcas (24/8) y `destinoDelViaje` (medido una vez por tamaño); el estado y la opacidad se
  sueltan al desmontarse la escena de los títulos; la caja y el logo se miden sólo cuando pueden cambiar algo.
- Queda (anotado en «Lo que no quedó bien»): quien se queda leyendo 30–40 px pasado el reposo no ve el cuerpo hasta volver un poco.

### Defecto 7 · los viajes y el scroll: el cuadro largo del principio y del final
- Hallado en la matriz (cada viaje tenía un cuadro de 27–40 ms a los ~40 ms y otro al llegar). Diagnóstico con la traza del
  navegador: una tarea de 29 ms con 22,5 ms de recálculo de estilo dentro del rAF de Lenis. Medido aparte (`p-raiz*.ts`):
  cambiar CUALQUIER clase de `<html>` o `<body>` cuesta 6–8 ms (una clase en una hoja: 0; un atributo `data-` en `<html>`: 0); sin
  las 173 reglas con `:not(` cuesta 0: son las de `@tailwindcss/typography` (`[class~="not-prose"] *`), globales (las usa el
  chatbot: no se tocan desde este sprint).
- Arreglo en /v3: `_componentes/lenisSinClasesDeScroll.ts` — la instancia de /v3 deja en `<html>` sólo las clases que cambian
  poco (`lenis`, `lenis-stopped`, `lenis-locked`) y el scroll suave en curso va en `data-scroll-suave-en-curso` de `[data-v3]`; la
  regla de los iframes sin puntero mientras corre, en `demos.css` con el atributo. Revisión adversaria: sin defectos (Lenis no
  lee sus clases; el único iframe de /v3 está adentro de `[data-v3]`); aplicados dos detalles (el comentario y
  `lenis-autoToggle` si algún día se prende).
- Queda (anotado): la causa de fondo está en la hoja global (typography); cualquier otra clase que se cambie en `<html>` o
  `<body>` en /v3 sigue costando la página entera.

### 4 · La matriz completa
- El instrumento de cajas (`cajas.ts`) contaba texto que NO se ve: el DOM transparente que marca dónde va el 3D (la frase
  del CTA estando en Demos), lo que un ancestro recorta (los mensajes adentro de la ventana de la demo de Tu panel, las
  tarjetas de Servicios fuera de su carrusel). Ahora se recorta con `overflow` y `clip-path: inset(…)` de los ancestros y se
  saltea la tinta transparente; control positivo: un párrafo inyectado encima de un texto se detecta (a 375 y 1440). Una
  primera versión trataba `rgb(0, 0, 0)` como transparente (el control lo vio).
- Abajo de 1024 el logo va DETRÁS del texto por diseño (la mezcla de la bajada, V3/B13): ahí el solape texto × logo no es un
  defecto; cuentan texto × texto, desbordes y consola.
- Segunda corrección del instrumento (las entradas a 320–390 marcaban texto × texto que no se ve: la frase del CTA de
  Portfolio debajo del panel oscuro de Demos; las tarjetas de Servicios que se apilan; mirado en las capturas): un texto TAPADO
  no cuenta — en el centro de su caja, `elementsFromPoint` (con los eventos del puntero prendidos en todo mientras se mide)
  encuentra encima algo opaco que no es su ancestro (fondo con alfa ≥ 0,9, imagen, video o iframe). Controles: el párrafo
  inyectado encima de un texto se detecta; el mismo, tapado por un bloque opaco inyectado, no (a 375 y 1440).
- La primera corrida de la matriz se tiró: el banco de controles corrió A LA VEZ que la matriz sobre la misma página (un solo
  Chrome, una página): se redimensionaban entre sí. Regla: con una tanda en marcha, ningún otro script contra el banco.
- Los cuadros del viaje: el registro de rAF arrancaba un lazo nuevo en cada parada (los cuadros salían repetidos): uno solo.

- HECHO · la matriz (primera corrida y la de confirmación, con todos los arreglos), 12 anchos, de día y de noche (bajando: día
  hasta Portfolio, noche después; subiendo: la otra luz), con los viajes del menú (Demos incluido) como camino a cada reposo y
  las entradas barridas de a un tercio de cuadro bajando y subiendo:

  | Ancho | Reposo: texto×texto | Reposo: texto×logo (≥1024) | Desborde | Consola | Entradas: lo que queda |
  |---|---|---|---|---|---|
  | 320 · 375 | 0 | — | 0 | 0 | la frase final de Portfolio contada debajo del panel de Demos (no se ve: mirado) |
  | 390 · 414 · 768 · 820 | 0 | — | 0 | 0 | ídem (1–4 paradas) |
  | 1024–2560 | 2 (los dos renglones inclinados del titular del hero: cajas proyectadas, la tinta no se toca: mirado) | 0 | 0 | 0 | Quiénes somos: 0 (antes, toda la salida); lo demás, mirado en las capturas: la copia del rollover de los títulos de Por qué, las palabras gigantes y tenues de fondo de Tu panel, el cartel de Portfolio que no se ve, las placas del CTA |

  Abajo de 1024 el logo va detrás del texto por diseño (la mezcla): no se cuenta.
- Los forms en todos sus estados: ver la sección 1 (pie y panel, `?envio=lento|error`, las dos variantes del volteo, a 1440, 1024,
  768 y 390, con Reintentar, Enviar otro y el autocompletado): ningún cuadro de más de 20 ms en corridas tibias.
- La caída del logo, las dos variantes, cuadro a cuadro (12 momentos con el reloj clavado y la corrida en vivo): sin saltos ni
  interpenetración; el golpe en el contacto.
- `?hilos=si` a 1440 y 390: 13,34 ms por cuadro con y sin hilos (p95 13,7; ninguno de más de 20 ms), sin errores de consola. De
  noche los hilos cruzan el texto de Portfolio (finos, por encima): es la exploración detrás de la bandera; anotado, no tocado.

### 5 · Loop y verificar final
- Siete defectos encontrados, arreglados y re-verificados (tabla de arriba). La matriz de confirmación no mostró ningún ancho
  roto por un arreglo.
- Los viajes del menú (sin capturas ni traza, `v-todos.ts`, todos los destinos bajando y subiendo, dos vueltas, a 1440 y 390):
  siguen perdiendo uno o dos cuadros (27–40 ms a 75 Hz) al arrancar y al llegar. El recálculo de la página entera por las clases
  de Lenis (22 ms) ya no está; lo que queda está repartido (el perfil de un viaje contra 2 s quietos: las lecturas del DOM por
  cuadro de los lazos de la escena —el amanecer y la noche del final miden Servicios y Tu panel, el `useScroll` de Framer—,
  el trabajo de React al arrancar el viaje). Arreglarlo es rehacer cómo mide la escena (cachear las posiciones en el documento,
  como `esquivaDelLogo`): un cambio de arquitectura en lazos aprobados, no un arreglo puntual. Anotado en «Lo que no quedó bien».

### Verificar final (sin banco ni servidor)
- Primera corrida: 70 pasos, 9 rojos — los 8 de la base y `s6-tokens`: el `25%` suelto de la clase de C1 (la regla admite sólo
  `100%`, `50%`, `-50%`). Arreglado como `calc(50%/2)` (a81b8310; la misma medida, re-medida en el banco: 264 px a 1024, 140/140 y
  316/316).
- Segunda corrida: 70 pasos, exactamente los 8 rojos de la base (s1, s2, s3, s4, s5, s7, s8, s17) y ni uno más. Después, el
  servidor de desarrollo de nuevo.

## Defectos encontrados

| # | Dónde | Ancho | Causa | Commit | Re-verificado |
|---|---|---|---|---|---|
| 1 | La tarjeta del resultado del panel de Contacto al rotar | 390 × 844 → 844 × 390 | El alto del formulario guardado al enviar no se soltaba: la tarjeta seguía de 498 px en un cuadro de 390 y «Reintentar» quedaba afuera (379–420) | 036b0c48 | sí: 318 px, «Reintentar» en 306–346 |
| 2 | La cabecera: Login contra el disco del progreso | 1000 y 1023 (desde que la barra entra, ~980) | C2 ponía el progreso arriba a la derecha por el ANCHO (< 1024) y no por el modo: con la barra a la vista su esquina (Contacto y Login) está ahí. Choque de 27 × 32 px | 631d4e71 | sí: 0 choques de 390 a 1023 |
| 3 | El pie: la columna izquierda se salía de la suya | 1024 | Un cuarto (240 px) no alcanzaba: WhatsApp +13, «Por qué develOP» +7, Facebook +16 | dd484243 | sí: columna de 264, nada visible afuera |
| 4 | El pie no era simétrico a la vista | 1280–2560 | Las letras de la izquierda no llegaban al borde de su columna (+8 a +117 px más lejos del logo que el formulario) | dd484243 | sí: iguales ±1 px en los seis anchos |
| 5 | El formulario del pie pierde la tarjeta y lo escrito al rotar una tablet | 768 × 1024 → 1024 × 768 (cruza 1024) | `CanalDePieza` cambia de tipo con el modo del pie (con progreso / sin él): React desmonta el formulario | 036b0c48 | sí: la tarjeta sigue (rotada y de vuelta) |
| 7 | Un cuadro de 27–40 ms al arrancar y al terminar cada viaje del menú (y cada gesto de la rueda) | todos (medido a 1440 y 390) | Lenis escribe `lenis-scrolling`/`lenis-smooth` en `<html>` al arrancar y parar; cualquier clase de `<html>` recalcula el estilo de la página entera (6–8 ms; 22 ms en un viaje) porque las reglas globales de `@tailwindcss/typography` terminan en `:not(:where([class~="not-prose"], [class~="not-prose"] *))` | (este commit) | sí: el viaje Servicios → Tu panel sin cuadros de más de 20 ms (dos trazas; antes 27 y 27) |
| 6 | Quiénes somos al salir: el cuerpo sube a través del logo | 1024–2560 (y 1093 × 570) | En el reposo el cuerpo queda justo debajo del logo y no tiene salida propia: al seguir bajando cruza su silueta de ~24 a ~600 px después del reposo (el instrumento de J1 medía sólo el reposo; A2 arregló la ENTRADA) | 14f677f2 | sí: oculto desde 48 px pasado el reposo en los siete cuadros; en el reposo, entero; vuelve al volver al reposo y al llegar por el menú |

## Memoria (antes de cada tanda: disponible y no paginado)

| Cuándo | Disponible | No paginado | Nota |
|---|---|---|---|
| Al empezar (PC reiniciada, driver de la placa nuevo, sin dev server) | 7064 MB | 826 MB | |
| Tanda 1 (build hecho, `next start` andando, antes de lanzar el Chrome del banco) | 7681 MB | 793 MB | |
| Tanda B (los formularios y C1) · al empezar | 6358 MB | 807 MB | Chrome del banco relanzado una vez (para borrar el caché de sombreadores: el diagnóstico) |
| Tanda B · al terminar | 3876 MB | 856 MB | +49 MB de no paginado en la tanda |
| Tanda C · al empezar | 4484 MB | 812 MB | |
| Tanda C · al terminar | 3584 MB | 823 MB | El más bajo del sprint: se cerró el banco y el servidor para compilar (volvió a 6587) |
| Tandas D, E, H (rotación, cruces, cabecera) | 5379–7336 MB | 788–838 MB | |
| Primera matriz (G, 12 anchos) | 5565–6340 MB | 797–863 MB | |
| Tanda I (entradas de escritorio) | 5465–5932 MB | 830–839 MB | |
| Seis compilaciones más (la salida de Quiénes somos, Lenis): cada una con el banco cerrado y relanzado | 7437–7990 MB | 754–804 MB | |
| Matriz de confirmación · al empezar | 6862 MB | 801 MB | |

El no paginado se movió entre 754 y 875 MB en todo el sprint: ninguna tanda lo subió más de 60 MB (lejos de los 300 que pedían
anotarse). El driver nuevo no muestra la fuga de PULIDO 10.

## VERIFICAR TRAS REINICIO

Nada pendiente del banco: todo lo de PULIDO 11 y PULIDO 12 se corrió y se miró. Para el próximo sprint de rendimiento:
`~/.cache/b4-medicion/pulido-11/_scripts/v-todos.ts 1440 900 2` y `v-perfil.ts 1440 900 "#servicios" "#tu-panel"` (el estado de hoy).

## Lo que no quedó bien

- Los viajes del menú pierden 1–2 cuadros (27–40 ms) al arrancar y al llegar (sección 5): queda para un sprint de rendimiento
  de la escena (medir una vez por tamaño y leer `scrollY`, como `esquivaDelLogo`). La causa de fondo de los recálculos enteros
  (las reglas globales de `@tailwindcss/typography` con `[class~="not-prose"] *`) está en `globals.css`, compartido: no se tocó.
- Quiénes somos: quien se queda leyendo 30–40 px pasado el reposo no ve el cuerpo (se fue porque ahí ya cruza el logo) hasta
  volver un poco o tocar «Quiénes somos» en el menú.
- La tarjeta del resultado recuperada tras girar una tablet vuelve a caer (y suena el pestillo) una vez; y en el pie de volumen
  toma su alto natural (463 en vez de 400 a 1024 × 768): su esquina de abajo a la derecha pasa debajo del parlante y el progreso.
- C1 a 2560: «El recorrido» a lo ancho deja ~250 px entre sus dos columnas (es la geometría pedida; a la vista pueden leerse
  como dos listas).
- Los cuadros largos de la PRIMERA vez que se ve cada cosa (53–880 ms) son el caché de sombreadores vacío tras el driver nuevo
  (Skia en el proceso de la GPU): los usuarios con el caché vacío los van a ver una vez; no se arregla desde la página sin sacar
  los filtros (gusto).
- `?hilos=si`: de noche los hilos pasan por encima del texto de Portfolio; de día casi no se ven en las capturas chicas.
- El instrumento de solapes sigue sin poder ver algunas cosas tapadas por un fondo en degradé o una máscara (la frase final de
  Portfolio debajo de Demos a 320/375): esos se miraron en las capturas.
- El giroscopio (F) sigue sin probarse en un teléfono (hace falta HTTPS y un aparato).
