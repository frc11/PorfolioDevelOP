# L8b · plan (segunda tanda de la revisión de Valentino, sólo escritorio)

Anchos: 1440, 1366, 1280, 1024. Teléfono y tablet no cambian. Fotos de la revisión: `C:\nocturno\cola3-capturas\lote3\03.png` (hoy) y `04.png` (dibujo). Evidencia: `C:\nocturno\cola3-fotos\L8b\`. Presupuesto ~2 h.

Orden de trabajo: build de la base (HEAD `3728481f`) → ítems 4 y 5 medidos contra ese build (antes) → código de 1, 2, 3 → dev :3002 (verificación de 1, 2, 3) → build final → ítem 4 después, matriz, humo.

## Ítems

1. **El latido del botón del sonido en cada entrada** (`_chrome/sonido/`). Hoy el latido («tu-tu» y la onda) vive sólo en la capa del preloader (`BotonQueVibra`): en las entradas del mismo día no hay preloader y no late nunca. Se agrega `LatidoDeLaEntrada`: cuando el botón real aparece y la entrada está abierta, el botón real late UNA vez (los dos pulsos de `latidoDelBoton`) y de cada pulso nace la onda que cruza el fondo (`ondaDelPulso`), en el compositor. Si el preloader ya hizo latir su botón en esta carga, no se repite (un registro de módulo que marca `BotonQueVibra`). Con movimiento reducido: un pulso de opacidad, sin onda. Sólo desde 1024 (el teléfono no cambia). Espera la pestaña visible.
   - Hecho = a 1440 en `/v3` y `/v3/pagina-base`, sin preloader (`develop-v3-preloader` de hoy), el botón escala y la onda se ve en un cuadro capturado; con reducido, una animación de opacidad y ninguna onda.
   - Esfuerzo medio. Verifica: banco nuevo `scripts-carga/l8b-latido.ts` (cuadros por screencast; las animaciones que corren sobre la onda) y foto con la onda visible.
2. **La entrada de «Nuestros servicios»** (`servicios/escenario/IntroDeServicios.tsx`): el aro, la bajada y el aviso quedan donde están (la caja del aro deja de medirse contra el título: su ancho sale del tamaño de antes por el ancho del título en em, medido); el título baja y se apoya justo arriba de la bajada, más grande (en un renglón, con tope por el ancho). Teléfono: el mismo marcado con `contents` (sin cambio de layout).
   - Hecho = a 1440/1366/1280/1024: la caja del aro y la bajada a ±2 px de la base; el título en un renglón, ≥ 1,2× la letra de antes, su borde de abajo a ≤ 24 px del tope de la bajada y sin salirse del contenedor. A 390/768 todo a ±1 px.
   - Esfuerzo medio. Verifica: medidas en el navegador antes/después y fotos.
3. **Reseñas → CTA, un gatillo entero** (`por-que-develop/resenas/`): hoy el guardado es un gatillo pero la transformación al CTA sigue al scroll: un gesto corto deja el CTA a medio camino. Nuevo `useGatilloHaciaElCta`: cruzar el fin de la lectura bajando dispara la secuencia entera (vuelo corto hasta disparar el guardado, espera a que la cámara suelte, vuelo al CTA armado); cruzar el CTA armado subiendo dispara la vuelta entera (vuelo hasta el fin de la lectura y espera a que el guardado vuelva). Mientras dura, los gestos se retienen (`retenerLosGestos`) y la cola del gesto también. No se dispara con un viaje del navbar en curso ni con un salto que pase todo el tramo (el foco al CTA, la barra de desplazamiento). Sólo existe con el escenario (escritorio con movimiento).
   - Hecho = banco con UNA muesca de rueda desde el fin de la lectura: termina con la transformación en 1 (CTA armado) sin otra entrada; UNA muesca hacia arriba desde el CTA: termina con la transformación en 0, el guardado en 0 y la página en el fin de la lectura.
   - Esfuerzo alto. Verifica: banco `scripts-carga/l8b-resenas.ts` (estado de `__resenasDelBanco` en el tiempo) a 1440 y 1024, más el test puro.
4. **La pausa del primer paso de Servicios** (~0,5 s en el build): trazar el primer gesto en el build (Performance de CDP), nombrar la tarea larga, quitarla o adelantarla al rato quieto de la entrada.
   - Hecho = `l3-servicios MODO=doble` contra el build: 0 cuadros > 100 ms desde la entrada en 5 corridas a 1440 y 1024 (antes: 4 de 5 con 429–512 ms en INT).
   - Esfuerzo incierto. Si no converge en ~40 min: «no hecho» con la causa medida.
5. **Matriz «rueda desde Demos → clic afuera · sin hover · lenta»**: `RANGO=20-20` cinco veces contra el build de la base. Si falla, causa y arreglo; si no, flaky con los 5 resultados.

Además: humo de la home (rueda y ráfaga al Portfolio, a Demos y vuelta, 1440 y 390: `humo-l6.ts` y `matriz MODO=rafaga`) y el contacto del recomendador en pantalla después de los arreglos de L8a (foto a 1440 y 1024).

## Implicaciones
- Alturas: ninguna sección cambia de alto (2: misma caja de la entrada; 3: no se agrega scroll, se viaja por el que existe). Se mide la entrada a 1440 antes/después.
- Tests que fijan texto de los archivos tocados: s78-preloader, s78-c2-81, s83-resenas, s88-l5, s6-servicios, s10-acceso, s3-tokens. Correrlos y pasar a la spec nueva diciéndolo.
- `useTramoDeLasResenas.ts` ya mide 225 líneas: la lógica nueva va en su archivo y su parte pura en `haciaElCta.ts`.
- Clases arbitrarias nuevas: sólo con `var(--…)`; constantes nuevas registradas si `s3-tokens` lo pide.
- Fuera de scope: teléfono/tablet, el latido del preloader en sí, el copy.

## Gate
- `npx tsc --noEmit` (4 GB), ESLint de los archivos tocados.
- Suites: `s90-l8b` nueva (latido: una vez, sin onda en reducido, no repite tras el preloader; servicios: el aro no depende del título; reseñas: zonas, cruces, secuencia y sus guardas), cada afirmación con su control que rompe el código; s78-preloader, s78-c2-81, s83-resenas, s88-l5, s6-servicios, s3-tokens, s8-montaje (mismas fallas de la base).
- Navegador: 1 → foto con la onda a 1440 en `/v3` y `/v3/pagina-base` (sin preloader) y conteo de animaciones con reducido; 2 → medidas a 1440/1366/1280/1024/768/390; 3 → banco de una muesca a 1440 y 1024; 4 → l3 doble ×5 contra el build; 5 → matriz ×5.
- Aceptación: 1 → onda visible en una captura y ≥ 1 latido sin preloader; 2 → aro y bajada ±2 px, título ≥ 1,2× y pegado; 3 → transformación 1 y 0 con una muesca; 4 → 0 cuadros > 100 ms; 5 → 5/5 o causa.

## Premortem («la semana que viene falló, ¿por qué?»)
- El latido corre antes de que el botón perezoso exista o con la pestaña oculta → se arma con el botón medido y la pestaña visible; si el botón no llega en 6 s, nada.
- La onda oscura no se ve sobre la escena de noche → se mira en foto; si hace falta, el color sale del tema.
- El título más grande en 1024×768 pasa el ancho → tope por el ancho del contenedor; se mide a 1024.
- El gatillo de las reseñas se pelea con el viaje del navbar, el foco que salta al CTA o la barra → guardas por viaje en curso y por salto que cruza todo; se prueban en el test puro.
- La cola del gesto (inercia del trackpad) mueve la página al soltar → se retiene hasta que empieza un gesto nuevo.
- La pausa de Servicios no tiene una sola causa → se reporta lo medido y lo que se movió.

## Notas de ejecución
- El puerto 3002 lo tenía tomado un `next dev` de la sesión de L8a (PID 13008, padre 24776, arrancado 14:48). No es mío: no se mató. Se usó para la verificación en dev (es el mismo árbol, con recarga) y los builds se sirvieron en :3004.
- Ítem 4: el banco del plan (puntero en el centro) no reproducía la pausa; la reproducía `l3-servicios` con el puntero en la esquina. De ahí salió la causa (ver resultado).
