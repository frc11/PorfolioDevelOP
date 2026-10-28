# 81 · El preloader y el movimiento del teléfono

Modelo: **opus**. Toca el layout de `/v3` y la escena: va después de la 31 (el moiré deja su entrada preparada). `PreloaderContext.tsx` es frozen.

## 1. El preloader se traba (ítem 18)
- El texto («Bienvenido a una nueva experiencia.») **aparece a medio camino, se traba un rato y después sigue**. Se nota. **Todo tiene que ser continuo.**
- La causa probable: el hilo principal ocupado mientras se prepara la escena (los shaders, la hidratación) y la animación del texto corriendo en JS. El arreglo:
  - las animaciones del preloader, **en el compositor** (CSS o la Web Animations API, solo `opacity` y `transform`), para que no dependan del hilo principal;
  - y **repartí la preparación de la escena** para que no bloquee en el momento del fundido (por ejemplo, empezarla después de que el texto terminó de aparecer, o en partes).
- Medí los cuadros largos (Long Tasks) durante el preloader antes y después, y que la opacidad del texto avance sin saltos (graficala por cuadro).

## 2. La flecha nueva (ítem 18)
Captura `lote2/05` (el dibujo de Valentino) contra `lote2/04` (la de hoy). **No tiene que ser exactamente igual; es la idea:**
- **a trazos** (rayas), no de puntos;
- sale desde la derecha del texto «Recomendamos activar el sonido.», **hace tres bucles grandes encadenados** en su recorrido, y **termina con la punta en el botón de sonido** (arriba a la izquierda);
- se dibuja de punta a punta, con la misma lógica de carga de hoy (frena en su último 20 % si falta cargar, pulsa a partir de los 6 s).
- Lo mismo en el teléfono (el mismo ticket que en la compu).

## 3. El movimiento del teléfono (nuevo)
Valentino quiere que, así como se recomienda el sonido, se pueda activar **el giroscopio** del teléfono: "una entrada gigante a mejores efectos". **En esta cola va la base;** la adaptación de todo el sitio al movimiento es un sprint futuro.
- **Teléfono y tablet (táctil, con `DeviceOrientationEvent`):**
  - **un botón de movimiento arriba a la derecha** (el de sonido queda arriba a la izquierda), con un ícono de movimiento o de accesibilidad (de `lucide-react` si está en el proyecto: por ejemplo un teléfono inclinándose), con su estado prendido/apagado y sus `aria-label`;
  - **el preloader dice «Recomendamos activar el sonido y el movimiento.»** y dibuja **dos flechas** (con el mismo estilo de bucles), una hacia cada botón. **Tocar la frase activa los dos;** cada botón sirve también por separado;
  - **el permiso:** en iPhone hay que pedirlo con `DeviceOrientationEvent.requestPermission()` dentro de un toque del usuario; en Android no se pide. Si lo niegan o no hay sensor, el botón queda apagado y no pasa nada más;
  - **qué hace por ahora:** inclinar el teléfono **mueve la cámara** como el mouse en la compu (el mismo paralaje, con un filtro suave para que no tiemble) y **maneja el moiré** (la entrada que dejó la 31). Nada más.
  - **Con `prefers-reduced-motion`:** apagado por defecto (se puede prender a mano).
  - El estado (prendido/apagado) dura la sesión, como el sonido.
- **Escritorio:** sin cambios (sin botón de movimiento; la frase queda «Recomendamos activar el sonido.»).

## Criterios
- El preloader: la opacidad del texto sin escalones por cuadro; cuántos cuadros largos durante la entrada, antes y después.
- La flecha: a trazos, con 3 bucles, la punta sobre el botón de sonido a 1440, 1024 y 390 (|Δ| ≤ 4 px), y la segunda sobre el de movimiento a 390 y 768.
- El movimiento: una prueba con eventos `deviceorientation` simulados que mueve la cámara y el moiré, y con el permiso negado no hace nada. Con movimiento reducido, apagado por defecto.
- `preloader.ts` en verde. El control ciego `CONTROL=en-recargas` del reporte, hacelo real (que falle de verdad si el preloader aparece en una recarga).
