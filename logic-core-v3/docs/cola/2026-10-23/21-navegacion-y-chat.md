# 21 · La navegación desde la escena oscura, el desplegable y el chat

Modelo: **opus**. Toca la escena (la cámara y la navegación por secciones): va en serie con cualquier tarea que toque la cámara.

## 1. Ir a otra sección desde el Portfolio (ítem 1, prioridad alta)
Lo que pasa hoy: desde el Portfolio (escena oscura), al tocar en la navbar Home, Quiénes somos, Por qué develOP, etc., **la cámara no se mueve**: el logo se queda donde estaba en el Portfolio y el cartel de la sección de destino aparece antes. La única que "anda" es Por qué develOP, pero llega oscura y con la letra antes que la cámara.

Lo que tiene que pasar (regla general, para ir desde cualquier sección a cualquier otra con la navbar):
1. la cámara y el estado de la escena (día o noche, el logo) **vuelven a la normalidad y viajan a la composición de la sección de destino**;
2. **recién cuando la cámara llegó**, aparece el título o cartel de esa sección, con su entrada de siempre.

- Revisá cómo se resuelve hoy la navegación por anclas del home (el scroll programático, Lenis, los gatillos del Portfolio y de Demos, el día y la noche) y por qué desde el Portfolio no se actualiza la cámara. Arreglá la causa, no el síntoma.
- Probalo desde Portfolio y desde Demos hacia todas las secciones, y desde una sección de día hacia el Portfolio.

## 2. El desplegable de Servicios (ítem 8)
- El borde izquierdo del desplegable se alinea con el borde izquierdo del botón «Servicios» (capturas `lote1/10` y `11`), con la navbar arriba y abajo.
- Mientras el mouse está dentro del desplegable, **el resaltado (hover) queda sobre «Servicios»**, no sobre el ítem de la página actual.
- Cada ítem del desplegable hace **el mismo sonido de hover que los ítems de la navbar**, respetando el mute.

## 3. La regresión de la píldora (deuda del reporte)
`velo.ts`, «el home → la página»: la píldora va a 11,7–14,3 px/ms con la hora del banco (el tope es 3,96); empezó después de B9 y B10. Medila con la hora del cuadro y con la del banco, encontrá la causa y arreglala.

## 4. El chat (ítems 2 y 24)
- **Investigación (ítem 2):** ¿la estética del chat (captura `lote1/01`: el panel turquesa, los chips con letra roja ilegible) es la de fábrica del componente del sitio vivo, o la de la configuración de este cliente en el panel? Los colores se cambian desde el panel del cliente (Valentino lo sabe: esos colores son una prueba vieja). Reportá qué viene de dónde.
  - **Si se puede adaptar desde el v3 sin tocar el estilo de fábrica**, usando la prop `overrides` que sumó B11 en `LogicCompanion.tsx`: adaptalo a la estética del home (blanco, negro y papel, la tipografía del sitio, los botones del sitio, los chips legibles).
  - **Si para cambiarlo hay que tocar el componente del sitio vivo o su estilo general**, no lo toques: dejalo como está y explicalo en el reporte.
- `?chat=geometrico` pasa a ser **el valor por defecto**. Las otras dos variantes (`onda`, `monograma`) se borran.
- **Ítem 24:** el chat (la burbuja, el globo de las preguntas y el panel si está cerrado) **se desvanece en las zonas cruciales y vuelve al salir**: por ahora, el Portfolio y Servicios **incluido su recomendador**. Si el chat está abierto, no se cierra solo.
- El error de consola «`<circle>` attribute r» del `PulseAvatar`: si viene del componente del sitio vivo y se puede evitar desde el v3 (con `overrides`), evitalo; si no, reportalo.
- **Revisá la prop `overrides`** que sumó B11 en `src/modules/chatbot/components/LogicCompanion.tsx`: confirmá que es aditiva, que el sitio vivo (`/`) no cambia y que no rompe nada. Si hay riesgo, describilo en el reporte para Franco.

## Criterios
- Una prueba que navega desde el Portfolio a cada sección por la navbar y mide que el título aparece después de que la cámara llegó (la cámara en su pose ±1 %, el título con opacidad 0 hasta ese momento), y su control (sin el arreglo, falla).
- El desplegable: medida de alineación (|Δx| ≤ 1 px) en 1440 y 1024, el hover que se queda en «Servicios» y el sonido (espía del audio).
- La píldora dentro del tope en las 4 vías de `velo.ts`.
- El chat se desvanece en el Portfolio y en Servicios y vuelve fuera de ellos; `/` del sitio vivo, igual que antes (foto antes y después).
