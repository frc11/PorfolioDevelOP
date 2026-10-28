# 50 · La sección Servicios del home

Modelo: **opus**. La tarea más visual de la cola. Cambia altos: el merge va en la cola de alturas. Usa `AvisoDeScroll` de la 20.

Capturas: `lote1/15` a `18` (escritorio) y `lote3/02` (teléfono).

## 1. «Nuestros servicios» (ítem 12)
- **El título se pinta al llegar**, igual que el del Panel («El panel donde controlás TODO»), con el gatillo, rápido.
- **La estela inicial de nanobots rodea al título**, girando a su alrededor y **cambiando de color entre los tres colores de servicio** (los claros u oscuros, el que contraste sobre el papel), todos mezclándose. Si el título queda tan grande como el del Panel, los nanobots pueden pasar **por detrás** de él en su recorrido.
- **El subtítulo**, más grande y con contraste contra los puntos: negro o un gris bien oscuro. Texto nuevo en `05-TEXTOS.md`.
- Debajo, **`AvisoDeScroll`** con «Scrolleá para explorarlo».

## 2. Cada servicio (ítems 13 y 20)
- **El título del servicio**, centrado verticalmente **justo encima de la animación de nanobots** (alineados en el mismo eje).
- **El título, más grande e imponente.** Hoy parece un cuerpo grande; tiene que decir "sí, soy este servicio". Dejá **3 opciones con bandera `?titulo-servicio=1|2|3`**, de las familias que ya carga el sitio o de Google Fonts por `next/font` (sin dependencias nuevas): (1) la display condensada en negrita del título del Panel, en mayúsculas; (2) una serif display grande; (3) una grotesca extra negrita. Por defecto, la 1.
- **Al terminar de llegar, el título se subraya**, con el subrayado que primero va rápido y después desacelera (el del resto del sitio).
- **El video ocupa toda su mitad, de arriba a abajo** (la izquierda en web e IA, la derecha en software), con **un velo oscuro leve** encima que le baja la importancia (queda de placeholder).
- **La diagonal que separa el video**, más parada: **6,5° desde la vertical** por defecto. La bandera `?diagonal=` queda, numérica.
- **El texto del medio:**
  - **más grande**, con **una fuente más elegante, en cursiva**, que acompaña la diagonal (cada renglón arranca donde lo corta la diagonal, como ahora);
  - **bandera `?fuente-servicio=1|2|3|4`** con cuatro serif en cursiva de Google Fonts (por ejemplo Instrument Serif, Fraunces, Cormorant Garamond y Playfair Display), por defecto la 1;
  - **ocupa todo el alto disponible**, de arriba a abajo, **sin chocar con los nanobots**;
  - el texto nuevo, en `05-TEXTOS.md`.
- **El cuerpo aparece antes:** cuando la entrada del panel va por la mitad, el texto empieza a aparecer (no al mismo tiempo que todo lo demás).
- **IA y automatizaciones:** el título **centrado**, y el video se adapta a eso, otra vez de arriba a abajo.
- **La nube de nanobots al viajar de un servicio al otro** hoy casi no se nota (se pierde contra el video). Que sea **una nube muy volumétrica, grande, que viaja más lento y pasa por encima de todo**, para que se vea bien el efecto: una nube, no un rastro.

## 3. Teléfono y tablet (`lote3/02`)
- **`?servicios-movil=gatillo` pasa a ser el valor por defecto.** Se borra `deslizar`.
- **El orden de cada servicio:** el título arriba **con el dibujo de nanobots a su derecha**; debajo, el video; debajo, la descripción; y el CTA abajo de todo.
- Debajo, `AvisoDeScroll` con «Deslizá para pasar de servicio» (para que se entienda el gesto).
- **Bug de la deuda:** a 390 con el gatillo, la rueda saltea la entrada de Servicios. Arreglalo y agregá la prueba.

## Criterios
- `servicios-gatillos` y `servicios-capa` siguen en verde; 0 px de nanobots sobre el título y el texto en reposo.
- Medidas: el título del servicio y el centro de los nanobots en el mismo eje (|Δx| ≤ 4 px); el video de arriba a abajo; el texto sin intersección con el área de los nanobots.
- Fotos a 1440 y 1024 de los tres servicios con cada `?titulo-servicio` y `?fuente-servicio` (para que Valentino elija).
- La nube en tránsito, visible sobre el video (foto en el medio del viaje).
- Teléfono: el orden nuevo a 390 y 768; el gatillo sin saltear la entrada con la rueda.
