# M3 · resultado — los momentos de las tres páginas de servicio

Rama `m/3` (desde `3d89b628`), dev :3005 (parado por PID al final). Todo en `src/app/v3/_servicios/momentos/`, montado después de «Qué hacemos».

## Por ítem
1. **Desarrollo web — hecho.** El plano de cada trabajo, calcado de su póster real (`pantalla/planos.ts`), se dibuja trazo a trazo. Después la pantalla real se abre desde el centro, el marco se angosta hasta ser un teléfono y el video de escritorio cede al del celular. Es un solo escenario clavado. El menú (los tres de PROYECTOS) está a la izquierda desde 1024 y arriba por debajo. Cambiar de trabajo re-corre la secuencia en tiempo hasta donde está el scroll, sin moverlo.
2. **Software a medida — hecho.** El tachado (la raya y el despinte de `trazo.css`) y lo nuevo avanzan con un mismo valor: son simultáneos. Después viene el tablero que se ordena.
   - **Estética nueva:**
     - una hoja con las rayas finas de la grilla en lugar de cajas;
     - las columnas en monoespaciada, con la cuenta real de lo que llegó;
     - cada papel lleva un rótulo de tipo y viaja «levantado» (con sombra, arriba de los demás);
     - al llegar se apoya, derecho, con el cuadrado del acento;
     - las curvas son las del sitio y al final queda una línea de la página.
3. **Integraciones con IA — hecho.**
   - Un chat propio en el verde de la página, sin el panel y sin cian. Contesta solo con la conversación de ejemplo del panel vivo, con «escribiendo…», al ritmo del panel. Tiene pausa de teclado. Se puede probar con las preguntas sugeridas: el guion se corta donde estaba y sigue la pregunta. Sigue al último mensaje sin mover la página.
   - Un módulo «Lo repetitivo, que pase solo», con textos de 05-TEXTOS y del recomendador.
   - La lista «pasa solo», con tic. El tic no se llama con movimiento reducido, y con el sonido apagado lo calla el bus.
4. **Lo que no cambia:** no se tocó ni la escena, ni los slugs, ni la intro, ni el FAQ, ni el home.

## Verificación
- `tsc --noEmit`: 0 errores. ESLint de todo lo tocado: limpio.
- Invariantes de servicios:
  - `momentos.invariant` (nuevo): 51/0.
  - `pagina`: 244/0. Se actualizó a la spec: el orden de bloques, los archivos de cliente, la tabla de revelado de los bloques nuevos, «un video fuera de la pantalla» y la pausa del chat fuera del chequeo del slot de trabajos.
  - Del V1: datos 56/0, escena 64/0, seo 53/0, precios 22/0, slots 44/0, medios 26/0, diagonales 47/0, historias 37/0.
- **Banco** `scripts-carga/m3-momentos.ts`, después de los arreglos: 46/46 a 390 y 1440, 23/23 a 768, 23/23 a 1024 y 3/3 con movimiento reducido.
  - 390 es real: `innerWidth` = 390 por el viewport de Playwright; la ventana de Chrome es más ancha.
  - En cada página: un `h1`, desborde 0 y consola limpia.
  - Web: el cambio de trabajo en tres puntos deja `scrollY` igual, y el video que queda es el del trabajo elegido.
  - Software: lo de siempre y su raya se ven (el control: antes del arreglo, a 390 eran del color del papel). Tachado y lo nuevo van al mismo valor. En el tablero, el paso más grande es de 11,5 % de la mesa por cada 2 % de scroll; al final, 0 solapes y 0 textos cortados.
  - IA: el chat avanza solo sin mover la página, la pregunta sugerida llega, y las 5 tareas se tildan y se destildan.
  - Una corrida de 768 y 1024 seguidos dio dos rojos a 1024: todo quieto y un salto de 74 %. No se repitió: corrida sola a 1024, 23/23. Es el defecto de los pasos de render apagados (Lessons learned), no del código.
  - Fotos: `C:\nocturno\cola3-fotos\M3\`.
- **`npm run verificar`:** 95 pasos, 11 grupos con falla (s1, s2, s3, s4, s5, s6, s7, s8, s17, s76, s77).
  - Fuera del build, las fallas son las mismas de la base (L7-INT):
    - s6: `pt-[7rem]` de `Cierre.tsx` y el `rootMargin`;
    - s76: el modal de contacto;
    - s77: los mismos dos hashes `f8deb37f755a · 64083f6736c4`;
    - s8-montaje: dos tests de la escena de más de 300 líneas;
    - s17 y s4-cobertura: ajenos a `_servicios`.
  - s1, s2, s3, s4-heredado, s5-peso, s7-compuerta y s8-chrome/peso/tres fallan por «0 archivos / 0 chunks»: este worktree no tiene build de producción. No se construyó (candado y memoria). Por eso s1 aparece rojo y s10 verde, contra la base de INT, que sí estaba construida. Eso queda **no verificado contra el build**.
  - Se cazó y se arregló una falla propia: s77 «sólo la importan los de la lista». Los momentos importaban `BotonPausa`; ahora pasan por `PausaDelVideo` (`movimiento/VideoDeFondo.tsx`, con `de` opcional) y s77 volvió a su falla de base.
- **Revisión independiente** (Sonnet, sólo el diff): 12 puntos. Arreglados:
  1. (media) El chat trababa el scroll de la página en el teléfono (`overscroll-contain`): se sacó.
  2. (media) Una pregunta a mitad del guion lo completaba de golpe: ahora el guion se corta donde estaba.
  3. (baja) El registro del chat se puede desplazar con el teclado (`tabIndex`).
  4. (baja) `aria-disabled` en las preguntas, para no matar el foco.
  5. (baja) El chat en bucle ahora tiene pausa (WCAG 2.2.2), la del home para el teclado. El «escribiendo…» ya no se anuncia.
  8. (baja) Ningún papel arranca sobre las cabeceras (con su test y control).
  11. (baja) `videosQuietos` exige `loop` y `playsinline`.

  Descartados:
  - 6, 7, 12: confirmaciones, sin cambio.
  - 9: el marco 0×0 sin JS está debajo de la intro y se monta al hidratar.
  - 10: `left`/`top` y `width`/`height` por cuadro. Lo segundo es necesario (el video cambia de proporción). Lo primero queda como mejora posible; el tablero anda entero a 1440 y a 390.
- No corrió `visual-qa`: la verificación visual la hizo el banco con fotos, que miré a 1440 y 390.

## Decisiones (M3-n)
- **M3-1** Los momentos van después de «Qué hacemos», como secciones propias en papel.
- **M3-2** El plano no es genérico: es el de cada trabajo, calcado.
- **M3-3** Cambiar de trabajo re-corre la secuencia en tiempo (2,6 s × avance) hasta donde está el scroll.
- **M3-4** El chat usa la conversación de ejemplo del panel vivo y se rotula «Respuestas de ejemplo». No conecta el chatbot real (costaría tokens y llegaría a `/api`).
- **M3-5** Los papeles se cruzan mientras viajan, pero quietos (al principio y al final) no se solapan.
- **M3-6** «Pedido por WhatsApp» pasó a «Pedido por mensaje»: el bot de WhatsApp no se ofrece.
- **M3-7** La pausa del chat y la de los videos de la pantalla entran por `PausaDelVideo` (la de servicios) y no importando `BotonPausa`. Así la lista de s77 no se toca: está fuera del carril.
- **M3-8** Desde las 13:47, con la regla nueva de Valentino, el banco y `verificar` corrieron sin el candado; siempre con un solo Chrome a la vez.

## Hallazgo fuera de scope
Por debajo de 1024, `_estilos/banda.css` pinta todo `[data-trazo]` del color del papel (por la mezcla de Quiénes somos). Cualquier página que use el trazo fuera de esa mezcla queda invisible. Acá se resolvió escribiendo los dos tonos en el elemento: el color en el `style` y la raya con una utilidad importante, porque la página prohíbe fondos en `style`. Propuesta: acotar esa regla a Quiénes somos.

## Qué tiene que mirar Valentino
1. `/v3/paginas-web`, a 1440 y en el teléfono: bajá por «Pensada antes que hecha» y cambiá de trabajo a mitad de camino.
2. `/v3/software-a-medida`: «Hoy, y con tu sistema» y el tablero. ¿La estética nueva va?
3. `/v3/ia-y-automatizaciones`: el chat contestando solo; probá una pregunta; después la lista que se tilda (con el parlante prendido suena el tic).
