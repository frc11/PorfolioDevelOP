# L8b · resultado (segunda tanda de la revisión de Valentino, sólo escritorio)

Commits: `4be77340` (los cuatro ítems, los bancos y `s90-l8b`), `b6241c84` (arreglos de la revisión) y el de estos documentos. Plan: `L8b-plan.md`. Evidencia: `C:\nocturno\cola3-fotos\L8b\`. Builds: base (HEAD `3728481f`) y final (`4be77340`), servidos con `next start` en :3004; el dev, en :3002.

## Por ítem

1. **El latido del botón del sonido en cada entrada — hecho.**
   - **Causa:** el latido vivía sólo en la capa del preloader. En las entradas del mismo día no hay preloader y el botón no latía nunca.
   - **Arreglo:** `_chrome/sonido/LatidoDeLaEntrada.tsx`. Cuando el botón real aparece, late «tu-tu» UNA vez y de cada pulso sale la onda fina que cruza el fondo. Usa las animaciones del preloader, de una vuelta. Late en la carga y en cada ruta nueva (por enlace, después del velo). Si el preloader corrió en esta carga, no se repite.
   - **Banco `l8b-latido.ts` (dev), 7 de 7:**
     - `/v3` a 1440 y a 1024 y `/v3/pagina-base` a 1440: una onda y el botón escala;
     - con movimiento reducido: ninguna onda y un pulso de opacidad;
     - con `?preloader=si`: no repite;
     - del home a la página base por un enlace: dos ondas;
     - a 390: nada.
   - **Fotos con la onda visible:** `latido\home-1440.png`, `latido\pagina-base-1440.png`, `latido\home-1024.png`, `latido\enlace-a-pagina-base-1440*.png`.
   - **Test:** `s90-l8b` §1.
2. **«Nuestros servicios» — hecho.** El título baja y queda justo arriba de la bajada, 1,28 veces más grande (1,34 a 1024) y en un renglón. Ahora la caja del aro se mide con el título de antes en em (7,32 de ancho y 0,9 de alto, medidos en el build), así que no se mueve.
   - **Banco `l8b-entrada.ts`, base (build) contra después (dev): 6 de 6.**
     - 1440, 1366, 1280 y 1024: el aro, la bajada y el aviso quedan a ±0,1 px; del pie del título a la bajada hay 12–13 px.
     - 768 y 390: todo igual.
   - **Salidas:** `entrada-antes.txt`, `entrada-despues.txt` y las fotos `entrada\entrada-*.png`.
   - **Test:** `s90-l8b` §2.
3. **Reseñas → CTA en un solo gatillo — hecho.**
   - **Antes:** el guardado era un gatillo, pero la transformación al CTA seguía al scroll.
   - **Ahora** (`resenas/useGatilloHaciaElCta.ts`; la parte pura, en `haciaElCta.ts`):
     - **Ida:** se dispara al cruzar el fin de la lectura bajando. Hace un vuelo corto hasta disparar el guardado, espera a que la cámara lo suelte y vuela hasta el CTA armado.
     - **Vuelta:** se dispara al cruzar el CTA subiendo. Vuela hasta el fin de la lectura y espera a que las reseñas vuelvan a subir.
     - Mientras dura, los gestos se retienen, también el resto del gesto que la disparó.
   - **Banco `l8b-resenas.ts` (una sola muesca por sentido, dev), 4 de 4 (1440 y 1024):**
     - **Bajando:** la transformación y el CTA terminan en 1,000, a los ~5,8 s.
     - **Subiendo:** la transformación y el guardado terminan en 0 y la página en el fin de la lectura, a los ~5,5 s.
     - **Control** (`CONTROL=apagado`, el comportamiento de antes): 0 de 2. El CTA se queda en 0.
   - **Fotos:** `resenas\1440-ida.png` (HABLANOS armado) y `resenas\1440-vuelta.png` (las reseñas).
   - **Test:** `s90-l8b` §3.
4. **La pausa del primer paso de Servicios — hecho.**
   - **Causa, medida con traza** (`l8b-pausa.ts`, perfilador de CDP):
     1. al llegar Desarrollo web, su video, que es un enlace a la página, queda debajo del puntero quieto;
     2. el `pointerenter` calienta el destino (`calentarElDestino`): los trozos de las variantes y las fuentes del título de la página;
     3. el `loadingdone` de esas fuentes hace que la coreografía reajuste las letras de los tres paneles (`ajuste.ts`), todo dentro del cuadro de la transición.
   - **Por qué parecía al azar:** sólo pasa si el puntero queda sobre el video. Con el puntero en el centro no hay pausa; en la esquina, sí (`pausa-aislar.txt`).
   - **Arreglo:** `useCalentarLosDestinos.ts` calienta las páginas de los servicios con la entrada a la vista, 1,2 s después de llegar y en un rato ocioso. El teléfono no cambia.
   - **Medido contra el build:**

     | Banco | Antes | Después |
     |---|---|---|
     | `l3-servicios MODO=doble` «desde 0» (1440 y 1024, dos corridas) | 4 de 4 con cuadros de 376–411 ms | 0 cuadros lentos (el peor, 30 ms) |
     | Puntero en la esquina (`l8b-pausa ESQUINA=1`) | 427 ms | 0 de 6 corridas con un cuadro > 100 ms (el peor, 27 ms) |

   - **Salidas:** `l3-doble-base.txt`, `l3-doble-final.txt`, `pausa-esquina-traza.txt` y `pausa-esquina-final.txt`.
   - **Test:** `s90-l8b` §4.
5. **Matriz «rueda desde Demos → clic afuera · sin hover · lenta» — inestable, sin falla.** `RANGO=20-20` cinco veces contra el build de la base: 5 de 5 bien, con tres idas y vueltas cada una (`matriz5-base.txt`). No se reprodujo, así que no se tocó nada. Queda anotada como inestable.

**Además:**
- **Humo de la home** (`humo-l6.ts` contra el build final, 1440 y 390): bien. La ráfaga baja por el home, pasa por el Portfolio y vuelve arriba, sin errores de página (`humo.txt`).
  - Demos y su vuelta se cubrieron con la matriz de 5 corridas, que arranca en Demos.
  - La ráfaga de la matriz (`MODO=rafaga`) no corrió.
- **Contacto del recomendador después de los arreglos de L8a** (`recomendador.ts` contra el build, 1440 y 1024): 26 de 26 (`recomendador.txt`).
  - En pantalla, «Ver la página de …» queda arriba a la derecha de «Hablemos de …», y abajo «Empezar de nuevo» a la izquierda y «Enviar» a la derecha (`recomendador\1440-producto-7-contacto.png`).
  - El envío no salta: 0 px, también con Enter.

## Gate
- `tsc --noEmit`: 0 errores (antes y después de la revisión). ESLint de los archivos tocados: limpio.
- Suites (`suites.txt`):

  | Suite | Afirmaciones |
  |---|---|
  | `s90-l8b` (nueva, cada afirmación con su control) | 27/0 |
  | `s78-preloader` | 42/0 |
  | `s78-preloader-entrada` | 17/0 |
  | `s78-c2-81` | 45/0 |
  | `s83-resenas` | 149/0 |
  | `s88-l5` | 30/0 |
  | `s89-l8a` | 15/0 |
  | `s6-servicios` | 25/0 |
  | `s81-servicios` | 72/0 |
  | `s3-tokens` | 29/0 |
  | `s6-tokens` | 34/0 |
  | `s10-acceso` | 77/0 |

  `s8-montaje` tiene las mismas 2 fallas de la base: los seis archivos viejos de más de 300 líneas, ninguno de este lote.
- **Control rompiendo el código:** se sacó de verdad el latido de la esquina, el aro medido con el título de antes, el gatillo del tramo y el calentado del escenario. `s90-l8b` dio 4 fallas; con el código restaurado, 0.
- **`verificar` entero:** no corrió (presupuesto). Ningún test existente cambió de spec.

## Revisión independiente (Sonnet, sólo el diff de `4be77340`)
**Sin hallazgos de seguridad.**

**Arreglados (`b6241c84`):**
1. **Un viaje del navbar o un ancla a mitad de la secuencia no se detectaba.** La espera vencía y la página volvía al CTA. Ahora, en cada cuadro de la secuencia, se suelta si:
   - hay un viaje en curso;
   - el vuelo fue pisado (Lenis lleva otra marca);
   - o el scroll salió del tramo.

   Es `debeAbortar`, con test y control.
2. **Al desmontar a mitad de un vuelo, el cierre lanzaba otra espera** y, 6 s después, un vuelo sobre un bloque suelto. Ahora hay una marca `vivo` y la espera se puede cancelar.
3. **La marca de primera entrada vivía en un `ref` dentro del efecto.** Con el efecto corriendo dos veces (StrictMode), se perdía la guarda del preloader. Además, sacarse y volver a suscribirse dentro del aviso de la entrada podía recorrer el Set sin fin. Ahora la primera entrada sale de un dato de la carga (`esLaPrimeraEntrada`, con test) y la suscripción es una sola.

**Descartados:**
- **(4)** «Los tests del cableado son textuales». Las partes con lógica tienen tests puros: cruces, lugares, abortar y primera entrada. La máquina se verificó en el sitio con el banco y su control rojo.
- **(5)** «Entre 6,02 y 9,58 no hay gatillo». Es a propósito: la página recargada o una barra que deja la página ahí scrollea libre hasta cruzar un borde.

Después de los arreglos: `l8b-resenas` 4 de 4 y `l8b-latido` 7 de 7 otra vez (dev). Lo que se suelta por un viaje del navbar sólo tiene el test puro: **en el navegador, no verificado**.

## Decisiones tomadas solo
- **L8b-1:** el latido no se repite si el preloader corrió en la carga, porque la capa nunca sale sin haber latido una vez. En las entradas por enlace late a los 0,9 s, con el velo ya destapado.
- **L8b-2:** el latido es sólo desde 1024. El lote es de escritorio y el teléfono no cambia.
- **L8b-3:** la onda de la página va con `mix-blend-difference` sobre el color del papel: oscura sobre el papel, clara sobre la escena de noche. El grosor es el del preloader (2 px).
- **L8b-4:** el título de Servicios va con divisor 8,2 y tope 16 svh: 1,28 veces el de antes, la medida del dibujo de Valentino (`lote3/04`). Más grande seguiría entrando en un renglón (cabría hasta ~1,5), pero taparía más el aro. Es un número (`TAMANO_DEL_TITULO.escritorioGrande`).
- **L8b-5:** el título cuelga 8 px arriba de la bajada (`--spacing-2`). El arco de arriba del aro se sigue viendo sobre el título, porque el aro no se movió.
- **L8b-6:** la ida tarda ~5,8 s: 0,7 s de vuelo, ~3 s del guardado que ya existía (L5, 3,6 s) y 2,4 s de vuelo al CTA. Mientras dura, los gestos se retienen. La vuelta tarda ~5,5 s.
- **L8b-7:** el gatillo mira los bordes del tramo, no los gestos. Un salto que cruza el tramo entero no dispara: el foco al CTA o la barra de desplazamiento.
- **L8b-8:** el calentado de Servicios no cambia `calentar.ts` ni el ajuste de las letras. Sólo adelanta el pedido al rato quieto de la entrada.
- **L8b-9:** el `next dev` que dejó L8a en :3002 (PID 13008) no lo maté, porque no lo arranqué yo. Lo usé como dev de verificación y los builds fueron a :3004.

## Supuestos y descartes
- Si el puntero queda quieto sobre un enlace de página de otro panel, el `loadingdone` igual reajusta las letras; ahora pasa en la entrada, no en el paso. No se midió si eso traba el aro de la entrada (en las corridas, el peor cuadro después del calentado fue de 27 ms).
- El latido de la entrada por enlace se midió sólo del home a la página base.
- La matriz no falló en 5 corridas contra el build. Si vuelve a fallar, falta el registro de esa corrida.
- `verificar` entero y la ráfaga de la matriz no corrieron.

## Qué tiene que mirar Valentino
1. **`/v3` y `/v3/pagina-base` a 1440 (una entrada del mismo día, sin preloader):** el botón del sonido late «tu-tu» y una línea fina sale de él y cruza la pantalla. Con «reducir movimiento» del sistema, sólo un parpadeo suave.
2. **`/v3#servicios` a 1440 y 1024:** «NUESTROS SERVICIOS» más grande y apoyado sobre «Los tipos de trabajos…». El aro y «Scrolleá para explorarlo» siguen donde estaban. Después, una muesca hacia Desarrollo web: sin la traba de medio segundo, también con el mouse sobre el video.
3. **`/v3` a 1440, en las reseñas:**
   - Al terminar de leer, UNA muesca hacia abajo: se guardan, el piso se cierra, la cámara va al CTA y el título se vuelve «HABLANOS», todo solo.
   - Desde el CTA, UNA muesca hacia arriba: vuelve entero.
4. **Ojo:** el `next dev` de la sesión de L8a sigue corriendo en :3002 (PID 13008). Si no lo usás, cerralo.

Banderas: ninguna nueva. Banco: `__defectoDelGatilloHaciaElCta = 'apagado'` (sólo con el banco prendido).
