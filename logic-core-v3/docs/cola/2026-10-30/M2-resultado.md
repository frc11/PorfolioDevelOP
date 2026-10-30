# M2 · resultado — el blog, la nota y la 404

Rama `m/2` desde `3d89b628` (L7-INT). Commits `bd6d4fb3`, `f66c2f7b`, `473db134` y el de la revisión y el cierre. No toqué el contenedor compartido ni la intro (M1).

## Por ítem
1. **Carrusel de las destacadas: hecho.** El carrusel común (`CarruselDeTarjetas`, importado tal cual) en su modo `asoma`: la tarjeta grande y la siguiente asomada. Cambia cada **5,5 s** (`_movimiento/carrusel.ts`; el común trae 10 s). La **tarjeta entera** (foto y título) es el enlace a la nota. **Parallax doble** en la foto: con el scroll y, al cambiar de tarjeta, la foto vuelve a su lugar más despacio que su marco. Un apoyo largo (450 ms o más) pausa y al soltar no abre la nota; un toque, un clic, Enter o un lector entran. Medido en el navegador a 1440/1024/768/390: avanza solo (0 → 1), mantener apretado pausa (`data-pausa=mantenido`, el índice quieto 5 s) y no navega, un clic en la foto entra a la nota; con movimiento reducido no avanza (`pausa reducido`, 0 → 0 en 6,4 s).
2. **Grilla de notas: hecha.** La tarjeta del Panel viejo (`af4e53ca^:…/tu-panel/Tarjeta.tsx`): la foto en su marco (esquinas redondeadas, sombra física de dos capas) y **el título debajo**, que se levanta al cruzar la línea. Desde 1024, dos columnas escalonadas en una grilla de 12: cada tarjeta ocupa dos filas, con su columna, su ancho, su proporción (4:3, 4:5, 1:1, 3:2) y un corrimiento hacia abajo (`lugares.ts`). Abajo de 1024, una columna que alterna los costados. La llegada es el gatillo de siempre, desde abajo, sin el giro. Medido: 6 tarjetas, título debajo de la foto en las 6, **0 pisadas** en los cuatro anchos.
3. **La nota: hecha.** Los subtítulos se levantan; la frase destacada se pinta palabra por palabra; «N min de lectura» sin tachado. **El hilo**: se probaron dos versiones (ver M2-3). Medido: la aguja en la línea de lectura en los cuatro anchos (por ejemplo, a 1440 y = 360 con la línea en 360; a 390 y = 338 con la línea en 338), las marcas se llenan al pasar.
4. **404: hecha.** El encastre del error del formulario (`EncajeDelLogo` en `no-encaja`: la misma pieza, los mismos tiempos y el mismo sonido de error) en la misma tarjeta oscura del resultado, sobre la escena, arriba del `h1`. Un toque (o Enter) lo repite. Medido en los cuatro anchos: estado 404, arranca, llega al choque (`data-contacto`), y el toque lo repite. **No verificado:** el sonido (el banco corre con el audio apagado).
5. **Las seis notas:** los textos no se tocaron. `portada` (tipográfica) → `foto` (una línea por nota) y `destacado` (una frase literal de la nota).

**Fotos: van placeholders.** No existe `C:\nocturno\l7-assets\blog\` (en `l7-assets` sólo hay `facultad.png`). Cada nota tiene `public/v3/blog/<slug>.webp`: un degradé neutro, 1600 × 1200 (4:3), sin texto. Para cambiar una foto alcanza con reemplazar ese archivo; la línea `foto:` de la nota también sirve.

## Verificación
- `npx tsc --noEmit`: 0 errores, después de borrar `.next/dev/types`, que traía tipos viejos de `laboratorio/`. ESLint de lo tocado: limpio.
- Invariante nuevo `npx tsx src/app/v3/blog/__tests__/m2-blog.invariant.ts`: 60/0 (después de la revisión), cada regla con su control positivo. Se mantuvieron en verde: s3-tokens 29/0, s3-imagen 21/0, s8-chrome 42/0, s78-b12a 162/0 y s6-lane 50/0.
- `npm run build` (bajo el candado): pasa también después de la revisión, con el blog estático y las seis notas prerenderizadas (SSG). La primera corrida murió por memoria con el heap por defecto (2 GB); con `NODE_OPTIONS=--max-old-space-size=6144` pasó.
- Navegador: `scripts-carga/m2-blog.ts` (Chrome del sistema a la vista, dev :3004). **36/36** en 1440, 1024, 768 y 390. **390 es real**: la página informa `innerWidth` 390 y la pestaña visible. Hubo dos ajustes después y se volvieron a correr 768 y 390: 18/18. También pasaron movimiento reducido a 1440 (7/7) y `?hilo=barra` (capturas).
- Capturas: `C:\nocturno\cola3-fotos\M2\` (`<ancho>-blog-carrusel`, `-blog-grilla`, `-nota-hilo`, `-nota-destacada`, `-404`; `hilo-barra\` y `reducido\`).
- **No verificado:** el sonido de la 404; el toque real (táctil) del teléfono, porque el mantener apretado se probó con el mouse; el menú del toque largo en Android.

## Revisión independiente (Sonnet, sobre el diff, sin construir nada)
10 hallazgos, ninguno de seguridad. Aplicados:
- **1 y 2 (media), la guarda del clic del carrusel.** Un Enter o un lector de pantalla después de un arrastre no navegaba (quedaba un apoyo viejo), y un toque lento, de 200 a 450 ms, tampoco. Ahora la guarda es una función pura (`bloqueaElClic` en `_movimiento/carrusel.ts`): sólo cancela el clic que cierra un apoyo de **450 ms o más** y nunca el del teclado o un lector (`detail` 0). Además el apoyo se borra con `pointercancel`. El invariante la prueba por comportamiento con los casos del revisor, y su control positivo es la guarda vieja. Banco 18/18 de nuevo a 1440 y 390.
- **4, la cuenta de la sobra en el invariante.** La corrida ahora se mide en el marco (× 1,16).
- **5, el control del enlace.** Ahora mueve el enlace entre la foto y el título, en vez de borrarlo.
- **6, el comentario del invariante.** Decía `npm run test:m2-blog`, que no existe.
- **9, HTML inválido.** Un `span` que contenía el `h3` pasó a `div`, en el carrusel y en la tarjeta.
- **10, el foco recortado del carrusel.** `px-1` en la vista.

Descartados:
- **3, el parpadeo del título al hidratar.** Pasa sólo con un título ya en el cuadro al cargar. En el blog y en la nota, al cargar se ve la intro: ningún título de tarjeta ni subtítulo está en el cuadro.
- **7, la constante importada de Trabajos.** Es a propósito: el tiempo de los títulos que se levantan es el mismo en todo el sitio, y la página ya carga los títulos 3D por la intro.
- **8, `?hilo=barra` en producción.** Lo dejo para que Valentino compare las dos versiones; es inofensivo y está anotado en las banderas. Se saca cuando elija.

## Decisiones tomadas solo
- **M2-1** El modo `asoma` del carrusel común y no el de a una. En el de a una, apoyar el dedo sobre un enlace no mantiene ni desliza (`SE_USA_NORMAL` incluye `a[href]`), y Valentino pidió las dos cosas: toda la imagen como enlace y el dedo. No toqué el componente común.
- **M2-2** El parallax «con el carrusel» se hace por la posición relativa de cada tarjeta (avisada por `alCambiar`): la foto se acomoda con el resorte de la UI al cambiar. Mientras se arrastra con el dedo, la foto no acompaña, porque el común no expone la posición continua.
- **M2-3 El hilo.** Probé (a) la barra de arriba, más gruesa (`?hilo=barra`), y (b) un hilo al costado de la columna con una aguja que viaja en la línea de lectura y una marca por subtítulo. Elegí **(b)**. La barra, aun gruesa, queda en el borde de la pantalla, pegada a la navbar y lejos del texto: es el mismo lugar donde Valentino no la vio. La aguja de (b) está siempre al lado del renglón que se lee, y las marcas dicen en qué parte de la nota vas. Captura de cada una a 1440 y 390. La bandera queda para que la compare; por defecto se ve el hilo al costado.
- **M2-4** La frase destacada es una frase **que ya está** en la nota (no texto nuevo) y se repite grande debajo de su párrafo, con `aria-hidden` para que el lector no la lea dos veces. El invariante exige que sea literal y que aparezca una sola vez.
- **M2-5** Hipótesis de por qué la animación de la 404 del prototipo «no se ejecuta»: arrancaba a los 700 ms del montaje, con el preloader de la primera entrada tapando o la pestaña en el fondo, y se veía sólo el final. Ahora espera la entrada abierta, la pestaña visible y la tarjeta a la vista (`_no-encontrada/arranque.ts`). Usa el mismo `useMovimientoReducido` que el formulario.
- **M2-6** Las tarjetas de la grilla llevan la fecha y los minutos y el título, sin la bajada, como el Panel viejo (título y rótulo). La bajada sigue en el carrusel y en la nota.
- **M2-7** El hilo anda también con movimiento reducido: sigue al scroll y no anima nada.
- **M2-8** El invariante se corre con `npx tsx`. No agregué un script `test:m2-blog` a `package.json` (está fuera del carril): queda como propuesta.

## Supuestos y descartes
- Placeholders neutros y no fotos de otros trabajos (serían falsas como tapa de una nota).
- Las relacionadas de la nota usan la tarjeta nueva (4:3, título debajo).
- `PortadaDeNota.tsx` (la tapa tipográfica) se borró.
- La 404 a 1440 con la tarjeta arriba del `h1`: no toqué su caja de texto (el roce con el logo que anotó L7-INT es de L7g).

## Propuestas fuera del carril
- `package.json`: `"test:m2-blog": "npx tsx src/app/v3/blog/__tests__/m2-blog.invariant.ts"` y sumarlo a `verificar`.
- `npm run build` necesita más heap que el de por defecto en esta máquina (murió a los 2 GB).

## Qué tiene que mirar Valentino
1. `/v3/blog` a 1440: el carrusel (cada 5,5 s; mantené apretado sobre la foto y soltá: pausa y no entra; un clic entra) y, más abajo, la grilla dispersa con la foto arriba y el título debajo.
2. Cualquier nota a 390 y a 1440: el hilo al costado (la aguja va al lado de lo que leés). Para comparar con la otra versión: `?hilo=barra`.
3. `/v3/no-existe`: el logo cae, choca con el borde rojo y queda torcido afuera; tocalo para repetir. Con el sonido prendido, suena el error.
4. Las fotos son placeholders: van en `public/v3/blog/<slug>.webp`.

Banderas: `?hilo=barra` (por defecto, el hilo al costado).
