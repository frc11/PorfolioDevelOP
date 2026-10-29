# INT · resultado de la integración de la cola 3

Rama `cola3/2026-10-28` con L1–L4 (carril a) y L6, L5 (carril b, `cola3b/2026-10-28`) juntos. Plan: `INT-plan.md`. Fotos y salidas: `C:\nocturno\cola3-fotos\INT\`. Base para comparar: `e7fcd80d` (`rediseno/home`), construida en un worktree temporal (`C:\nocturno\cola3-fotos\base\`, ya borrado; quedan sus logs).

Commits: `4b8eac5c` (merge), `43784e66` (restos de L6 y s8-montaje), `b708e3b6` (alturas, rampa, Enter, s6-tokens), `14c815a4` (el aro a 320), `331613f1` (arreglos de la revisión), `e9359d96` (cuatro suites a la spec) y el de estos documentos.

## Por paso

### 1 · El merge — hecho
- `git merge --no-ff cola3b/2026-10-28`. Un solo conflicto: `TituloDePagina.tsx`. Quedan las dos intenciones: sin grietas (el efecto que las pedía se fue; no queda `dispararLasGrietas` ni `?grietas` en `src` ni en los bancos; `ENGANCHE_DE_LAS_GRIETAS` sigue vacío, como lo dejó L1) y la página base con el preset fijo de L6 (título 1, composición 3, legibilidad peso).
- `ESTADO.md` y `ESTADO-b.md` no chocaron; `ESTADO.md` suma L5, L6 e INT.
- `tsc --noEmit`: 0 errores (después de borrar `.next`: los tipos generados viejos citaban la página `titulos-de-pagina` que borró L6).
- Las suites de los seis lotes, dentro de `verificar` (paso 5).

### 2 · Alturas — hecho, con un suavizado
- Banco nuevo `scripts-carga/alturas.ts` (gancho de banco `__medidaDeLaEscenaDelBanco` en `ataduraAlScroll.ts`, sólo con el banco prendido): por sección, la pantalla del recorrido que ve la escena con su tope arriba; y el perfil de velocidad de la escena en pasos de 0,1 pantallas.
- Contra la base construida (mismo banco, mismo gancho aplicado sólo en el worktree temporal), en 1440, 1366, 1280, 1024, 820, 768, 390 y 360: **la escena ve lo mismo al milésimo** en el tope de cada sección, del hero al Panel. Única diferencia: el final del teléfono y la tablet. Es lo que diseñó L5: el FAQ va antes del pie y la escena no lo ve. El tope del cierre queda 0,6–0,96 pantallas antes; el total y lo de antes no cambian. Salidas: `alturas-base.txt`, `alturas.txt`, `alturas-rampa.txt` y los perfiles en `alturas-*\`.
- `TRAMO_ESTIRADO` y la nota de L2. Teléfono y tablet: la escena se ve detrás del carrusel (fotos `tramo\390-*.png`). En la base, ese tramo iba a 1,9 pantallas de escena por pantalla de scroll durante 3,3 pantallas. Con L2 iba a 5,9 durante 1,8 pantallas, y entraba y salía de golpe.
- **Arreglo:**
  - El tramo del carrusel arranca cuando la sección asoma, una pantalla antes del pin.
  - La velocidad entra y sale en rampa (`TramoEstirado.rampa`, `RAMPA_DEL_CARRUSEL = 0,3`). Recorre lo mismo, así que afuera de Trabajos todo sigue al milésimo (medido).
  - El mayor cambio de velocidad entre pasos de 0,1 pantallas:

    | Ancho | Base | Con L2 | Ahora |
    |---|---|---|---|
    | 390 | 1,31 | 4,45 | 1,19 |
    | 820 | 1,60 | 5,17 | 1,99 |

  - El pico baja de 5,85 a 5,48.
- s76 a la spec nueva (`[INT]`): continuidad en teléfono y tablet, más un tramo que estira (k = 4). Tiene controles: sin rampa, rampa de 0,1 y el respaldo de antes. Además, el control rompiendo el código (`RAMPA_DEL_CARRUSEL = 0`) da rojo.
- **Costo:** con el Portfolio arriba, la escena del teléfono ya va adelantada 2,4 pantallas respecto de la base, porque la recuperación empieza antes. El desvío contra la tabla ya era de +1,8 en la base, así que el teléfono nunca coincidió con la tabla de escritorio.

### 3 · Restos — hecho salvo lo marcado
- **L3, aro a 320:**
  - **Causa:** el aro del teléfono quedaba más angosto que el aviso. Lo limitaban el tope por el título (5,4 títulos, 266 px) y el ancho del bloque. Daba radio 1,04 y 238 px del aro sobre el aviso.
  - **Arreglo:** un piso de `min(20rem, 100vw)` por encima de los dos topes.
  - **Medido con `l3-servicios MODO=medidas`:** 0 px sobre el aviso a 320, 360, 390 y 768 (76/76). 390 y 768 no cambian.
  - **A 280 (plegable, fuera de la matriz):** entra en la pantalla y roza en 12 px.
- **L4, recomendador:**
  - 1024 y 768: 26/26 (`recomendador-768-1024.txt`).
  - Caso nuevo: envío con Enter desde el campo del medio. Éxito, vuelven los resultados y 0 px de desvío.
  - El control `salto-al-enviar` da rojo también por Enter (4000 px).
- **L6, bancos que barrían banderas borradas:**
  - Se borran `titulo-familias.ts` y `titulo.ts`, que sólo comparaban variantes.
  - `composicion.ts`, `titulo-3d.ts` y `contraste-de-la-intro.ts` miden la página fija.
  - `compilar.ts` ya no cita `?composicion=1` como URL viva.
- **s8-montaje:**
  - `faqDeVolumen.ts` pasó las 300 líneas de código con L5 (307). Era de la cola 3: el hundido del WhatsApp sale a `hundidoDelFaq.ts`.
  - Los otros seis archivos de esa falla son anteriores a la cola 3 y fallan igual en la base (`s32-escena7`, `s34-calidad1`, `EscenaDelCta`, `cuadroDelFinal`, `recorridoDelFinal`, `armadas`).
- **Hallazgo de paso:** s6-tokens estaba rojo por un `font-serif` (sin token) que dejó L3 como respaldo de la cursiva perezosa. Ahora es `font-titulo`.

### 4 · Build y medición — hecho, con dos pendientes
- **Builds:** `next build` (6 GB de heap, sin dev) y `next start` en :3002. Fueron tres builds en vez de uno, porque los arreglos de los pasos 2 y 3 y los de la revisión se midieron contra el build. Las tres páginas de servicio dan 404, como se esperaba.
- **Pausa del primer paso de Servicios (L3):** **sigue en el build**. Hubo cuadros de 429–512 ms en 4 de 5 corridas del doble gesto «desde la entrada», a 1440 y 1024. «Desde web»: 0 lentos (`l3-doble*.txt`). No era sólo la precarga del dev. **No resuelto:** la causa no se buscó (presupuesto).
- **Velocidad de la píldora (`velo.ts`):**
  - Home → página: 3,86 px/ms (tope 3,96).
  - Página → home falla igual que en la base. Es un cuadro largo mientras se desliza: 451 ms ahora contra 345 ms en la base, una corrida de cada uno. Son 227 ms de script de la página y 170 ms de `FontFaceSet.onloadingdone`. Es el pendiente conocido «la página → el home» (cola 2, ítem 21); no lo trae la cola 3.
- **El viaje sin destello (`viaje.ts`):** 2/2 (1440 y 390), 0 cuadros en blanco.
- **El fundido del login a 390:** no verificado contra el build. `ingreso.ts` con `SIMULAR` sólo corre contra el dev, y el banco del login real necesita la cuenta de prueba.
- **La escena en reposo:** 75 fps en el monitor de 75 Hz, p95 13,4 ms y 0 cuadros > 33 ms, en el hero y en Quiénes somos, a 1440 y 390. Igual que la base. Placa NVIDIA, leída en la misma página.

### 5 · verificar y matrices
- **`npm run verificar`** sobre el árbol integrado con su build (`verificar.log`), comparado afirmación por afirmación con la base construida (`base\verificar.log`; listas en `fallas-base.txt` y `fallas-int.txt`).
- **Base:** 8 grupos con falla (s10, s17, s2, s3, s4, s5, s7, s8).
- **Integración:** 11 grupos. Los tres de más son 4 suites nuevas en rojo:
  - s84-demos-telefono, por el tramo de INT;
  - s78-t0, que todavía leía las tres composiciones que L6 fijó;
  - s77-ph, la huella del Panel que L4 cambió;
  - s10-acceso, por las paradas de Servicios de L3.
  - Ningún lote las había corrido. Las cuatro pasaron a la spec, cada una con su control (`e9359d96`).
  - Los agregados s10, s77, s78, s84, s76 y s88, corridos de nuevo: s77, s78, s84, s76 y s88 en 0 fallas; s10, con la misma falla de la base (`s10-mobile`, la escena en la carga inicial).
- **El resto de las fallas son las de la base,** con otros números: peso 396,3 contra 396,6 KiB, 90 suites contra 89, los mismos seis archivos de más de 300 líneas.
- **s17 pasó a verde** (L6 arregló `s17-marca`).
- **Resultado: 0 fallas nuevas contra la base.** `verificar` no se volvió a correr entero después de los cuatro arreglos: se corrieron sus agregados.
- **Conteo:** s78 baja de 739 a 700 afirmaciones (la base tenía 16 invariantes; ahora 15). Son las pruebas del código que borró L6 (la flecha del preloader, las variantes de la página base y la página `titulos-de-pagina`), anotadas en `L6-resultado.md`. Suben s76 (751 → 771), s84 (96 → 103), s81 (55 → 72) y s83 (181 → 192).
- **Matriz de escritorio** (`matriz.ts SOLO=rueda-desde-arriba,rueda-desde-demos`, build): 23/24.
  - **Falla:** «rueda desde Demos → clic afuera · sin hover · lenta» (panel y barra fuera de lugar).
  - **Repetición:** contra el build final, `SOLO=rueda-desde-demos` llegó a 7/7 en verde y se cortó por tiempo antes de ese caso. **No repetido.**
- **Ráfaga:** no corrió contra el build (cortada por presupuesto).
- **Teléfono** (`l2-telefono MODO=recorrido`, 390 y 768, rueda y dedo, build final): 4/4.
- **Humo del carril b (`humo-l6.ts`):** no corrió.

### 6 · Fotos para Valentino — hecho
`C:\nocturno\cola3-fotos\INT\fotos\`:
- Cada sección del home en reposo a 1440 y 390: hero, Quiénes somos, Números, Trabajos, Demos, Servicios, Panel, Por qué develOP, cierre y el fondo.
- `1440-pagina-base.png` y `390-pagina-base.png`.

Las fotos del aro a 320–768 están en `l3\`.

## Revisión independiente (Sonnet, sólo el diff de la integración)
**Sin hallazgos de seguridad.**

**Arreglados:**
1. La rampa volvía al escalón si el tramo estira mucho (k ≥ 1/rampa). Ahora la rampa se acota a la mitad de lo que recorre. Test con k = 4 y su control.
2. El test de continuidad tenía un tope flojo (0,25) y sólo miraba el teléfono. Ahora el tope es 0,06 y mide teléfono y tablet, con un control de rampa corta.
3. El piso en `rem` podía pasar el ancho de la pantalla por debajo de 320. Ahora es `min(20rem, 100vw)`.

**Anotado:** `?nombre=N` sigue leyéndose en la página base. Es anterior y lo usan los bancos.

**Verificado por la revisión:** el merge sin grietas, la matemática de la rampa (continuidad y extremos), que s88 no se debilitó y que el gancho del banco no cambia nada sin el banco.

## Decisiones tomadas solo
- **INT-1:** la base para comparar no existía (`cola3-fotos\base\` vacía). La armé construida: un worktree temporal en `e7fcd80d` con su build y su `verificar`. Se borró al terminar.
- **INT-2:** el desvío se compara contra la base, no contra la tabla. En el teléfono la escena nunca coincidió con la tabla de escritorio, y la regla de L2 es «afuera, lo mismo que antes».
- **INT-3:** suavizar con rampa y con el tramo desde que la sección asoma, sin pasar la recuperación a Servicios. Servicios es opaco y ahí se podría esconder, pero cambiaría lo que se ve en el cruce Demos → Servicios.
- **INT-4:** el gancho del banco queda en el código (sólo con `__entornoDeLaEscena`), igual que los otros `__…DelBanco`.
- **INT-5:** `font-titulo` como respaldo de la cursiva mientras carga. No hay token serif, y Servicios está lejos del primer cuadro.
- **INT-6:** tres builds en vez de uno, para medir los arreglos contra el build y no contra el dev.
- **INT-7:** la ráfaga, el humo del carril b y la repetición entera de la matriz quedaron afuera por el presupuesto.

## Supuestos y descartes
- La pausa del primer paso no es la precarga del dev, porque está en el build. Queda la sospecha de la compilación de la forma nueva de los nanobots o de la precarga de producción de los enlaces nuevos; sin medir.
- La falla de la matriz de escritorio puede ser ruido (24/24 en L3 y L4 contra el dev), pero no la repetí.
- Las decisiones frenadas de L6 (D1 cerrar sesión, D2 error de Google, D3 el mail de recuperación) siguen frenadas: tocan auth y el sitio vivo.

## Qué tiene que mirar Valentino (la ruta de la cola 3)
1. **`/v3` a 769, 1024, 1280 y 768:** barra de escritorio desde 769 y hamburguesa a 768. «Contacto» a 320 y 390 entra en el panel. A 1440, mové el mouse por los bordes de la placa (esquinas cerradas) y sobre el piso (la loma; avisar si aparecen rayas). [L1]
2. **`/v3` a 390 y 375×667:**
   - El Portfolio entra en una pantalla y el formulario no se sale.
   - Scrolleá con el dedo de Portfolio a Servicios y de vuelta: sin gatillo en Demos.
   - **Mirá la escena de fondo en el Portfolio:** acelera y frena en rampa, sin el salto de antes. [L2, INT]
3. **`/v3` a 1440×900 y 1280×720:** Demos más chico y entero; a 1280×720 su título va más arriba que el del Portfolio, a propósito. [L2]
4. **`/v3#servicios` a 1440:**
   - «Nuestros servicios» en un renglón, con el aro detrás. `?aro-color=mezcla|tercios` (defecto `ola`).
   - Los títulos en dos renglones, con `?titulo-cursiva=2|3` (defecto 1).
   - «Leer más…» lleva a la página.
   - Dos ruedas seguidas sin cortes. **Ojo:** el primer paso desde la entrada puede trabarse medio segundo (no resuelto). [L3]
5. **Servicios en el teléfono (320, 390 y uno real):** el aro vertical no toca «Deslizá para pasar de servicio». [L3, INT]
6. **Recomendador a 1440, 1024, 768 y 390:**
   - Respondé y elegí una solución: el contacto aparece en el lugar.
   - Enviá con el botón y con Enter: vuelve a los resultados y la página no salta.
   - Ojo: el envío real va a `/api/contacto`. [L4, INT]
7. **El Panel a 1440 y 390:**
   - ¿Las palabras de fondo se leen lo suficiente? Alfa 0,09 / 0,12, el único número a ojo.
   - Sin botón de pausa (WCAG 2.2.2 anotado).
   - CTA con la newsletter y la flecha nuevas. [L4]
8. **Las reseñas a 1440:**
   - Seguí bajando: la cámara sube, el piso se abre, bajan, se cierra y recién ahí va al CTA.
   - Arrastrar no selecciona.
   - `?resenas=gatillo` (defecto `scroll`). [L5]
9. **El fondo:**
   - A 1440: «Scrolleá una vez más…» en un renglón; las preguntas con su introducción; la respuesta se guarda como el formulario; el WhatsApp se hunde y suena.
   - A 390 y 768: reseñas a sangre, el CTA llega solo y el FAQ va antes del pie. [L5]
10. **Primera entrada del día con `/v3?ingresar`, a 1440 y 390** (borrá `develop-v3-preloader` del almacenamiento local): el login espera al preloader. El preloader no tiene flechas: el botón del sonido late y sale la onda. Probá «¿Olvidaste tu contraseña?» dentro de la hoja. Con el movimiento prendido, al recargar vuelve prendido. [L6]
11. **`/v3/pagina-base` a 1440 y 390:** sin banderas, título fijo. `?titulo=2&composicion=1&legibilidad=tamano` ya no cambia nada. El viaje desde «Leer más…» llega sin destello. [L6, L3]
12. **Las decisiones frenadas de L6:** D1, cerrar sesión lleva a `/login`; D2, el error de Google cae en el login viejo; D3, el mail de recuperación apunta a `/reset-password`. Opciones y recomendación en `L6-resultado.md`.

Banderas vivas: `?aro-color=` (ola), `?titulo-cursiva=` (1), `?diagonal=` (7), `?resenas=` (scroll), `?nombre=N` (página base, de prueba). Se fueron: `?grietas`, `?titulo=`, `?composicion=`, `?legibilidad=`, `?titulo-servicio`, `?fuente-servicio`.
