# 41 · Demos

Modelo: **opus**. Cambia altos: el merge va en la cola de alturas. Va después de la 40 (Portfolio y Demos son espejos).

## Escritorio (capturas `lote1/13` y `14`)
1. **La primera pantalla de Demos, limpia.** Hoy, apenas scrolleás, se ve una franja blanca abajo (el piso o un degradado). No tiene que verse: **la primera pantalla de Demos es solo el fondo de la escena, sin nada invasivo.** Primero aparece todo (el título, la bajada y las demos) y **recién entonces deja scrollear**. Desde ahí, el scroll con gatillo que ya anda.
2. **El tamaño.** Quedó más grande de lo esperado.
   - **Portfolio y Demos son espejos:** sus títulos y sus bajadas van **a la misma altura** (medilo: |Δy| ≤ 2 px entre los dos títulos y entre las dos bajadas, a 1440 y 1024).
   - Lo que había que agrandar eran **las demos en sí**, pero no tanto: **achicá todo** a un tamaño **más grande que el de antes del agrandamiento, pero menor que el de ahora**. Un tamaño en el que las 5 se lean y entren cómodas.
3. **El abanico 3D queda fijo debajo del título**, alineado con él (como la mayoría de los objetos 3D de la página), **no delante del título**. Cuando hace la perspectiva, que haga el efecto y se vea todo bien (ya lo hace).
4. **El hover vibra** (captura `lote1/14`: con el mouse quieto, entra y sale muchas veces). Arreglalo de raíz: el área que detecta el hover no puede moverse con la transformación del hover (un área de detección estable, separada de la que se transforma).
5. **La carga de cada demo.** Hoy, al abrir una demo, se ve 3–5 s una imagen congelada (la portada), después desaparece y recién ahí arranca la pantalla de carga de la demo. El usuario no entiende que está cargando.
   - **Que cargue más rápido** si se puede: precargá (preconnect y, si conviene, empezá a cargar el iframe o la página) cuando el mouse entra a una demo o cuando la sección de Demos se vuelve visible. Medí el tiempo hasta el primer cuadro útil antes y después.
   - **Para las demos que tienen pantalla de carga propia:** la portada que se muestra al abrir **pasa a ser una captura de esa pantalla de carga**. Así, al abrir, el usuario ya ve que está cargando, y cuando la demo arranca de verdad se nota la continuidad.
   - **Nexo** no tiene pantalla de carga y su portada es coherente: queda como está.
   - **Las capturas las sacás vos** (Playwright, contra las URLs de las demos, en el primer cuadro de su carga): Valentino no tiene que hacer nada. Guardalas en `public/v3/demos/` (o donde viva el resto de los assets de Demos), optimizadas.
6. **La bajada nueva**, en `05-TEXTOS.md`.

## Teléfono y tablet (capturas `lote3/08` y `09`)
- **Demos ya no aparece desde atrás** (hoy entra chiquito desde detrás del logo y "queda re pocho"). Aparece **deslizándose hacia abajo con el scroll**, como una sección más, y **el título entra levantándose desde abajo**, con el mismo efecto de los títulos (en mobile no se desactiva).
- **El muestrario de demos, mejor** (hoy es una tarjeta sola con flechas, "re chombi"): el mismo criterio que el carrusel del Portfolio (una tarjeta grande, se desliza con el dedo, se ve un poco la siguiente, las barras de progreso como las historias de Instagram). Que se vea cuidado.

## Criterios
- Fotos de la primera pantalla de Demos a 1440 y 1024, sin la franja blanca.
- La medida de las alturas espejo con el Portfolio.
- El hover: con el mouse quieto sobre una demo durante 3 s, cero eventos de entrada/salida extra (contalos).
- El tiempo hasta el primer cuadro útil de cada demo, antes y después, y la portada nueva en las que tienen carga.
- A 390 y 768, la entrada deslizando y el título levantándose; el muestrario nuevo.
- `demos-parada` y la matriz del Portfolio siguen en verde.
