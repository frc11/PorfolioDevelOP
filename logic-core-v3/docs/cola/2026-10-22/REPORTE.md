# REPORTE · noche del 2026-10-22

## Actualización 09:27 (corte por la cuota de uso): esto manda sobre el resumen de abajo
- **Integradas y verificadas, 12 en total:**
  - T0, B7, B1.2e, B4 y B12c;
  - B12b (`48ba9510`);
  - B5 (`219a693c`);
  - B2 + B3 (reintegradas en `cd04d271` con el arreglo `436404fa`: las placas ya tienen texto);
  - B6 (reintegrada en `728717d0` + `a7840f71`);
  - B11 (`126c8a53`);
  - B8 (`16e3781a`).
- **Lo medido en cada una:**
  - **B12b (el viaje):** `viaje.ts` 2 de 2, con 0 cuadros en blanco y el logo en su hueco a 0,28 %; los controles `velo` y `sin-hueco` dan rojo; `sin-tapar` es un control ciego. `velo.ts` 4 de 4.
  - **B5 (Demos):** la parada 12 de 12, con sus dos controles en rojo.
  - **B2 + B3 (las reseñas):** las tarjetas de adelante dan 8,95 y 10,28:1. El aro cuesta 0,1 ms por cuadro. B3 se ve: HABLANOS y el anillo en el piso.
  - **B6 (el Panel):** `panel-b6` todo en verde. Las fallas eran del banco; el candado abierto se arregló.
  - **B11 (el chat):** llega a los 11 s, sin pisar el chrome a 1440, 860 ni 390, y el control da rojo.
    - **Ojo:** suma una prop opcional `overrides` a `src/modules/chatbot/components/LogicCompanion.tsx`, compartido con el sitio vivo. Es aditiva y `/` sigue cargando, pero hay que revisarla.
    - En la consola aparece «`<circle>` attribute r» del `PulseAvatar` existente.
  - **B8 (el moiré):** suites de la escena en verde. Costo del moiré: la trama gruesa ~0,05 ms y la fina ~0,06 ms por cuadro; el control del banco da verde. Banderas `?moire=0|1|2|mouse` (defecto 2).
- **Arreglos del orquestador:**
  - el control de s47, ciego desde B1.2e (`3209d764`);
  - los bancos `viaje.ts` y `panel-b6.ts`;
  - el alto viejo de Servicios.
- **A medias, en sus worktrees (sin commitear, cortadas por la cuota):**
  - B13 (`C:\nocturno\2026-10-22\b13`, 25 archivos): estaba sacando el pie provisorio de la página base.
  - B9 (`C:\nocturno\2026-10-22\b9`, sobre la rama de B8, 3 archivos): estaba conectando las grietas al sombreador del vidrio.
- **No empezada:** B10 (va después de B13).
- **No corrieron:** el `verificar` completo final, las matrices completas y el `next build`. Lo último completo fue el `verificar` con T0. Después de cada merge corrí las suites del área: ninguna falla nueva.
- **Antes de mergear a `rediseno/home`:** borrar o mover `docs/cola/2026-10-22/` del checkout principal. Está sin trackear y choca con esta rama.

---

# (Lo de abajo es la versión de las 07:40)

## Resumen
1. **Integradas y verificadas en `nocturno/2026-10-22`:**
   - T0: los pendientes de B12a.8 y los agregados.
   - B7: el login como demo.
   - B1.2e: el carrusel del Portfolio de menos de 1024.
   - B4: la sección Servicios.
   - B12c: el preloader del sitio.
2. **Revertidas, con su trabajo en su rama:**
   - **B6 (el Panel):** el candado de la rueda no anda.
   - **B2 (el aro de reseñas):** las tarjetas del aro salen vacías, sin cita, nombre ni retrato; el contraste da 1,19:1.
3. **En curso a esta hora, en sus worktrees:** B6 (el arreglo), B5 (Demos) y B12b (el viaje). Las tres se cortaron dos veces por el límite de uso y se retomaron a las 07:21.
4. **No empezadas:** B3 (está escrita en la rama de B2, sin integrar), B13, B8, B9, B10 y B11.
5. **Verificar:** con T0, vuelve a la base histórica (s1, s2, s3, s4, s5, s7, s8 y s17). Después de cada merge corrí las suites del área: ninguna falla nueva. `tsc` da 0. El `verificar` completo del final todavía no corrió.
6. **Corregido por el orquestador al integrar:**
   - REGLA DE ALTURAS: el alto viejo de Servicios y el de Tu panel abajo de 1024, medidos en el navegador.
   - Un choque de nombres entre el carrusel nuevo y el de Demos.
   - Un banco que tomaba mal la hora.
   - `armadas.ts`, que había vuelto a pasar las 300 líneas.
7. **Lo primero que tiene que mirar Valentino:**
   - `/v3?preloader=si` a 1440: la secuencia y la flecha al botón del sonido.
   - `/v3/pagina-base`: la noche y el acento desde el primer cuadro.
   - `/v3#servicios` a 1440: una muesca por servicio.
8. **Antes de mergear a `rediseno/home`:** borrar o mover `docs/cola/2026-10-22/` del checkout principal. Está sin trackear y choca con esta rama.

## Por tarea

### T0 · integrada y verificada
- **Commits:** de `a13ac4ea` a `222656ff`, merge `4332fcb9`, más `20c226f5` (`armadas.ts` vuelve a 333 líneas).
- **Medido en el dev (:3000, NVIDIA):**
  - `velo.ts` a 1440: las cuatro vías dan 3 de 3, con 0 cuadros en blanco.
  - De la página al home, en el dev: ninguna 2,6 s, banda 2,7 s, montaje 2,7 s y ambas 2,5 s. Después de B12c, 2,3 s. El objetivo de 1,2 s es en el build, que no corrió.
  - La píldora va a 2,8–3,9 px/ms (tope 3,96; el WIP daba 6,51). El control `sin-velo` da rojo.
  - `chrome-en-los-anchos`, en 4 rutas: 0 anchos con falla. Sin «isReady», sin NaN y sin 404.
  - El color desde el primer cuadro: carga directa y flecha atrás.
  - El cuerpo de la página base, a 1440 y a 390.
  - `verificar`: 8 grupos con falla, la base histórica.

### B7 · integrada y verificada (`decd55a0`)
- `ingreso.ts`: 24 de 25. La apertura dura 547 ms, |Δy| = 0, la flecha atrás, la de adelante y Esc andan, y la escena duerme. El control `scroll` da rojo.
- **La falla:** a 390, entrando directo con `?ingresar`, el fundido dura 514–573 ms en vez de 200. Lo más probable es que sea la carga del dev; no se confirmó en el build.

### B1.2e · integrada y verificada (`5b93773b`, `06b66881`, merge `53169678`, más `6ed4aa3f` del orquestador)
- **Lo que arregló el orquestador:**
  - La pieza nueva chocaba con el carrusel de Demos (los dos con `data-pieza="carrusel"`); pasó a `carrusel-de-tarjetas`.
  - El caso `reinicio` del banco tomaba la hora después de una espera de 700 ms.
- **Medido:** `carrusel.ts` a 390, 768, 820×1180 y 1023×768 da 43 de 44 (la que falta era esa hora del banco; repetida, ok). Los controles `trampa` y `sin-pausa-fuera` dan rojo. Humo: 7 de 7.
- **Falta:** la matriz entera de escritorio.

### B4 · integrada y verificada (`473d1016`, `cd787804`, `1cc74766`, merge `0958549f`, más `a897b02e`)
- **El alto viejo abajo de 1024, medido por el orquestador antes del merge:** 1661 px a 390, 1338 a 768×1024, 1382 a 820×1180 y 1555 a 1023×768.
- **Medido:**
  - `servicios-gatillos`: 16 de 16 a 1440 y 1024. El control `sin-candado` da rojo.
  - `servicios-capa`: 4 de 4. Un solo cambio de capa por sentido, con 0 px de nanobots sobre el título y sobre el panel. El control `capa-a-destiempo` da rojo.
  - Humo: 7 de 7.
- **Pendiente:** a 390 con `?servicios-movil=gatillo` (la variante alternativa), la rueda bajando saltea la entrada (−1 → 1).

### B12c · integrada y verificada (`aa734fd4`, `e0fe86ca`, `b4c59ce1`, merge `99c2f6af`)
- **`preloader.ts` a 1440 y 1024, todo ok:**
  - dura 5,7 s;
  - la punta de la flecha queda a 24,0 px del centro del botón (su radio);
  - el scroll queda bloqueado y se suelta 2,5 s después de irse el blanco;
  - no aparece en la recarga ni en otra entrada del mismo día;
  - la consola sin errores;
  - con la siembra de los bancos no aparece.
- **A 390:** el banco da 4 fallas por cómo lee la `y`. A mano, la rueda y el dedo quedan bloqueados (scroll en 0).
- **Controles:** `sin-bloqueo` da rojo. `en-recargas` NO da rojo: es un control ciego. Con `LENTO=6` la carga llega antes del freno, así que el freno y el pulso no se vieron en el navegador. Con movimiento reducido, 1,5 s.
- Humo 7 de 7 y `velo.ts` 3 de 3: los bancos no ven el preloader.

### B6 · revertida y en arreglo (`af4e53ca` más `fc916b7d` en su rama)
- **Banco `panel-b6.ts`:**
  - Pasan: el pintado del título (49,5 % del alto), AA 6,43:1, el alto de 7,00 pantallas y el CTA.
  - Fallan: el eje de los grupos y `?grupo=` (las fotos sugieren que es el banco) y el candado de la rueda (sin cartel, y la página se mueve con el candado abierto).
- Se le devolvió con esos números y con la calibración del alto viejo.

### B2 · revertida (`4ad48208` más `2047e714` en su rama; B3 = `ba7039d2` encima, sin integrar)
- `tsc` 0 y suites limpias, pero en el navegador las tarjetas del aro salen vacías (`aro-legibilidad`: 1,19:1; el control al 30 % anda). El título 3D «Lo que dicen / nuestros clientes» sí aparece.
- Se le devuelve al subagente cuando haya lugar.

### B5 y B12b · en curso, con worktrees en `C:\nocturno\2026-10-22\{b5,b12b}`

### B3, B13, B8, B9, B10 y B11 · no empezadas
- Por tiempo y por la cadena de dependencias (B13 necesita B3, que viene después de B2).

## Qué tiene que mirar Valentino (todo en `http://localhost:3000`, desde la integración)
1. `/v3?preloader=si` a 1440, 1024 y 390:
   - el negro con «Bienvenido…», el blanco con «Recomendamos activar el sonido.»;
   - la flecha punteada que termina en el botón del sonido;
   - la página entra después. Tocar la frase prende el sonido.
   - Banderas: `?preloader=si|no`.
2. `/v3/pagina-base` a 1440, cargada directo: la noche, la luz celeste y el anillo desde el primer cuadro. `?legibilidad=tamano` (el defecto ya es `peso`).
3. `/v3` a 1440, «Login»: el Genie, `?ingresar`; «Volver al home», la flecha atrás y Esc cierran en el mismo scroll.
4. `/v3#servicios` a 1440 y 1024:
   - una muesca por servicio: web desde la izquierda con el globo, software desde la derecha con los engranajes, IA desde arriba con la red;
   - después, el recomendador.
   - `?diagonal=30|20|12` (defecto 20) y, a 390, `?servicios-movil=deslizar|gatillo`.
5. `/v3` a 390, 768 y 820×1180: el Portfolio es un carrusel de tarjetas que rota cada 10 s, con flechas, deslices y mantener apretado. Debajo, «la tuya» y Demos.
6. Banderas de antes, sin cambios: `?titulo=1…4`, `?composicion=1|2|3`, `?navbar=abajo`.

## Lo que no corrió todavía
- El `next build` final: los 404, la vía del velo en números reales y el fundido de B7.
- Las matrices completas y el `verificar` del final.
- Se corre al cerrar la noche, con lo que esté integrado.

## Comandos para la mañana
```
cd C:\rediseno-home
git fetch origin
git switch rediseno/home
git merge --no-ff nocturno/2026-10-22
```
- Antes del merge, mover o borrar `logic-core-v3\docs\cola\2026-10-22\` del checkout principal: está sin trackear.
- Worktrees que quedan: `C:\nocturno\2026-10-22\{b5,b6,b12b}` (en curso) y la integración.
- Para borrar un worktree sin tocar el `node_modules` del principal: `powershell -NoProfile -File C:\nocturno\2026-10-22\quitar.ps1 <id>`. Borra primero el junction y conserva la rama si no está mergeada.
