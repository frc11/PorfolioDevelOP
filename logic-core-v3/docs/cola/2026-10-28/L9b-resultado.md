# L9b · resultado (lote liviano) — commit `3013c534`, evidencia en `C:\nocturno\cola3-fotos\L9b\`

1. **Latido del sonido — hecho.** La onda de la entrada viaja y se apaga en 2,5 s (antes 1,25; la del preloader no cambia). Late una sola vez por entrada: cada entrada queda registrada en la carga, así que un efecto repetido o una pieza remontada no vuelven a latir. Espera a que la página esté lista: el preloader y el velo idos, y el documento cargado. Banco `l9b-latido` 5 de 5 (`latido.txt`): normal, carga lenta simulada, página base, enlace (dos entradas, dos ondas) y preloader (ninguna). Control con el código de antes, 2 de 5 (`latido-control.txt`): latía a los 3,4–4,1 s con la página lista recién a los ~10 s, o sea en plena carga.
2. **Nanobots entrada → Desarrollo web — hecho.** Causa: el título de L8b es más grande y baja hasta rozar el globo. `cambioDeCapa` daba `null`, el cambio caía en g 0,5 sin medir y el panel cerraba encima del enjambre, que seguía detrás (~10.500 px sobre el panel, `capa-antes.txt`). Ahora, si el camino nunca sale del título con margen, el cambio va en la llegada y el panel espera afuera del globo. `servicios-capa` a 1440, 1366 y 1024: 6 de 6, con 0 px sobre el panel en los 72–83 cuadros que está detrás y 0 px sobre el título estando delante (`capa-*.json`). `l3-servicios MODO=doble`: 4 de 4, el centroide sube como mucho 74 px por cuadro. Fotos en `servicios\`.
3. **Reseñas → CTA — hecho.** Al llegar bajando, las reseñas quedan asentadas con el aro armado (pantalla 4,5) y el resto del gesto se retiene. Asentada, UN gesto hacia abajo hace la ida entera al CTA; uno hacia arriba suelta la página. Desde el CTA, un gesto hacia arriba vuelve a las reseñas asentadas. Banco `l9b-resenas` 9 de 9 a 1440, 1024 y 1440 con `?resenas=gatillo` (`resenas.txt`, fotos en `l9b-resenas\`). Control con el gatillo apagado: 0 de 3, el gesto largo pasaba de largo hasta la transformación.

**Gate:** `tsc` 0. ESLint limpio en los archivos tocados. Suites (`suites.txt`): s91-l9b (nueva) 17/0, s90 27/0, s81 80/0, s83 149/0, s88 30/0, s78-preloader 42/0, s78-preloader-entrada 17/0, s78-c2-81 45/0, s6-servicios 25/0. s81 sin el arreglo: 1 falla. Specs actualizadas: s90 §3 (el tramo arranca en el asiento: «afuera» ahora es antes de 4) y s81 (dos escenarios nuevos medidos con el título de L8b).

**Decisiones:**
- L9b-1: la onda dura 2500 ms (2×).
- L9b-2: el cambio de capa va en la llegada, con el título sin margen.
- L9b-3: el asiento está en la pantalla 4,5 (el aro armado). Los vuelos: 450 ms al asiento, 900 ms al guardado y 3000 ms de vuelta.

**No corrió:** humo del home, `verificar` y 768/390. El teléfono no cambia: el asiento y el latido son sólo desde 1024. Dev :3003 detenido por su PID.
