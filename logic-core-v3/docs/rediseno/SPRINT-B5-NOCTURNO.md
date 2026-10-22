# SPRINT B5 · NOCTURNO 2026-10-22 · Demos

Tarea: `docs/cola/2026-10-22/40-B5-demos.md`. Worktree `C:\nocturno\2026-10-22\b5`, rama `nocturno/2026-10-22-b5`.

## Plan

1. **El agua sale entera.** `demos/OndaDeLasPortadas.tsx` y `demos/ondaDeLaPortada.ts` (el filtro SVG que ondeaba la portada al pasar),
   su montaje en `_chrome/ChromeDelHome.tsx`, su banco (`scripts-interfaz2/t3-portadas.ts`) y sus afirmaciones de s38 (reemplazadas por la
   spec: que no vuelva). La bandera `vida=si` ya se había borrado antes (s38 lo afirma).
2. **La parada** (`demos/parada.ts`, `demos/ParadaDeDemos.tsx`). Es la máquina de gatillos común (`_componentes/gatillos/`, la del
   Portfolio con A8, F1 y F2, extraída en B4) con UN paso, sobre una pista invisible en la caja del Portfolio, centrada en el fin del pin
   (media ventana a cada lado; termina media ventana dentro de Servicios sin ocupar lugar). Ahí aterrizan los dos vuelos que llegan a
   Demos: el del Portfolio desde «la tuya» (el fin del pin, dos px antes) y la salida de arriba de Servicios (una ventana antes de su
   pista: el fin del pin). Lo que agrega a la máquina común (sin cambiar a Servicios):
   - `ocupada`: la transición PROPIA de la sección. La de Demos es su llegada (lo mostrado persigue a lo pedido con la velocidad tope de
     `entrada.ts`); `CapaDeDemos` publica su persecución (`LLEGADA_DE_DEMOS`). Mientras corre, la rueda y las teclas se tragan (F1).
   - `salidaDeArriba`: arriba, la parada sale a «la tuya» (su ancla), no a una ventana antes de la pista.
   - `vueloAjeno`: con el vuelo de OTRA sección en curso (una marca de Lenis que no es la propia), la rueda se traga y no se lanza otro
     encima (A8: el que vuela llega). Así la entrada de la parada no le pisa el vuelo al Portfolio, ni la de Servicios a la parada.
   - `nombre`: el banco la publica en `__gatillosDelBancoDe.demos` (Servicios sigue en `__gatillosDelBanco`).
   - Dos defectos para el control del banco: `sin-parada` (la de antes) y `parada-sin-llegada`.
   Abajo de 1024 no hay parada: el Portfolio es un flujo con carrusel y la rueda es de la página (como B1.2e).
3. **Las placas 3D** (`demos/Biblioteca.tsx`, `_estilos/demos.css`). Se mantiene el abanico y su marcado (`data-pieza="libro"`: lo leen el
   cursor, el foco, el Genie y las pruebas). Cada pieza: su cámara (`[data-parte="cara"]`: la perspectiva y la MIRADA de la escena,
   `giroDeLaPieza` de `miradaDeLaCamara.ts`, la de los títulos y los valores: mismos topes, mismo suavizado, misma exageración; sin
   transición), la placa (el giro del abanico y el hover) y su espesor (la portada y cinco cantos, el bloque de CSS 3D de `BloqueSolido`).
   Más grandes: la placa es el 36 % de su columna y el solape llena el estante (242 px a 1440, 167 a 1024; antes 160 en los dos).
4. **El hover de las reseñas**: la placa se levanta un poco (el alza del estante) y se pone de frente, suena el tic de la barra
   (`sonar('tic')`, al entrar el puntero o el foco del teclado) y aparece su nombre en la pastilla de la barra (la de siempre, «Click para
   ver …»; con el cursor de la sala, la del cursor). El clic abre la demo con el Genie de siempre, desde la placa entera.
5. **El teléfono (y la tablet)**: el carrusel común de B1.2e (`_componentes/carrusel/`) con las cinco demos como tarjetas
   (`demos/CarruselDeDemos.tsx`: la captura de la demo en su ventana, el nombre y el rubro; un enlace a la demo en otra pestaña). Se monta
   en el cliente (como el del Portfolio: servido, sus tarjetas de afuera escribirían su transformada). En tablet llega con el gesto de los
   libros (entero, como un renglón). La cinta que se lanzaba con el dedo (`demos/Carrusel.tsx`) y su física se fueron.
6. **REGLA DE ALTURAS**: no cambia ningún alto (la pista de la parada es un elemento posicionado; las placas y el carrusel viven en la capa
   pegada). Sin tramo nuevo.
7. **Pruebas**: s84-demos (nueva) y las suites que fijaban lo que cambió, reemplazadas por la spec con su control. Banco nuevo, SIN correr:
   `scripts-carga/demos-parada.ts` (la matriz de la parada, con `CONTROL=sin-parada` y `parada-sin-llegada`).

## Log

- **01964739 (1/3)** el agua sale: los dos archivos de la onda, su montaje en el chrome y su banco. s38 reemplazada por la spec (que no
  vuelva), 56 de 0.
- **f40a554c (2/3)** la parada: la máquina común con `ocupada`, `salidaDeArriba`, `nombre` y `vueloAjeno`; la pista y su geometría; los
  dos defectos; el banco `scripts-carga/demos-parada.ts` (sin correr).
- **(3/3)** las placas 3D, el hover, el carrusel del teléfono, la capa que publica su llegada y las pruebas.
  - s84 (nueva): 33 afirmaciones, 18 controles, 0 fallas. La parada en números a 1440 × 900 y 1024 × 768 (los dos vuelos que llegan
    aterrizan en ella, su salida de abajo cae en el primer paso de Servicios pasada la histéresis, no pisa a Servicios, la llegada pedida
    está entera donde empieza; controles: una parada sin ancho, una que pisa a Servicios, una que empieza antes de la llegada); la parada
    con un reloj de mentira sobre la decisión REAL de la rueda (cinco casos; controles: sin la llegada, la rueda de a píxeles); el vuelo
    ajeno; el cableado; el abanico (1440: 95,2 % de 672 px; 1024: 95,2 % de 464 px; el de antes, 75,9 % a 1440: el control); las placas
    con la mirada y el espesor; el hover (se levanta, suena, su nombre) y el clic con el Genie; las cinco demos y el carrusel.
  - Reemplazadas por la spec, con su control: s37 (el anillo de adentro, ahora de la tarjeta de la demo; la física de la cinta se fue),
    s49 y s50 (la capa publica su llegada para la parada en lugar de arrancar el carrusel de antes; la caja del foco del carrusel),
    s10-acceso (paradas de Demos en el marcado servido: cinco, el carrusel se monta en el cliente), s5-trabajos §27 (`movil-invariante`:
    el carrusel común con las cinco, sólo la activa en el recorrido, montado en el cliente) y §11/§16 (imágenes, enlaces y paradas
    servidas), s76-archivo-tunel (lo mismo en el invariante del túnel archivado), s3-registro (los tokens nuevos del estante).
  - lint limpio (dos avisos de antes en s10-acceso), tsc 0. Sin fallas nuevas en s3, s5, s6, s7, s10, s37, s38, s41, s42, s45, s47, s49,
    s50, s52, s63, s64, s74, s75, s76, s78, s81 y s84. Las de la base: s3-peso, s5-peso y s7-compuerta (piden el build), s5-compacto
    (quienes-somos) y s47 (el control del recorte del escenario del Portfolio, ciego desde B1.2e: no lo toca B5).

## Qué mirar (el orquestador, en el navegador)

1. `http://localhost:3000/v3#trabajos` a 1440 × 900: en «la tuya», una muesca hacia abajo: el Portfolio vuela a Demos y Demos llega
   entera (título, párrafo y las cinco placas). Una ráfaga larga o el trackpad con inercia: lo mismo, y Demos se queda quieta (nunca
   Servicios). Quieta la rueda, una muesca nueva: Servicios (su entrada). Desde el primer paso de Servicios, una ráfaga hacia arriba:
   Demos, quieta; una muesca nueva: «la tuya». Con AvPág desde «la tuya»: la página llega a Demos y las teclas de más se tragan mientras
   llega; una AvPág nueva: Servicios.
2. Lo mismo a 1024 × 768.
3. A 1440 y a 1024, las placas: el abanico ocupa casi toda la columna derecha, debajo de «Demos» y su párrafo, sin taparlos; mover el
   mouse por la pantalla: las placas acompañan la perspectiva del título 3D (se ven sus cantos: el costado izquierdo por el giro del
   abanico, arriba o abajo según la mirada).
4. El hover de una placa: se levanta un poco y se pone de frente, las vecinas se abren, aparece «Click para ver <nombre>» (la pastilla, o
   la del cursor de la sala) y, con el sonido prendido, el tic de la barra. El clic abre la demo con el Genie desde la placa; al cerrar,
   vuelve a ella. Con Tab: lo mismo con el foco; Enter abre.
5. Ninguna portada ondea al pasar el puntero (el agua se fue).
6. A 390 × 844 y 768 × 1024 (y 1023 × 768): Demos con el carrusel del Portfolio (una tarjeta: la captura de la demo, su nombre y su
   rubro; las flechas y la línea de 10 s); tocar la tarjeta abre la demo en otra pestaña; deslizar de costado cambia; el dedo vertical
   scrollea la página. En tablet el carrusel llega con el gesto de los libros (no se ve durante el Portfolio). A 1023 × 768 entra entero.
7. Bancos: `BASE=http://localhost:3000 ANCHOS=1440,1024 npx tsx scripts-carga/demos-parada.ts` (12 de 12), y sus controles
   `CONTROL=sin-parada` (rojo en bajando rafaga/trackpad/teclado) y `CONTROL=parada-sin-llegada` (rojo en el teclado). Y los de B4, porque la
   máquina común cambió: `scripts-carga/servicios-gatillos.ts` (y su `CONTROL=sin-candado`), más el humo del Portfolio (`matriz.ts`).
