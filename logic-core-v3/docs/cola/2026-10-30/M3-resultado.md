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
   - Un chat propio en el verde de la página, sin el panel y sin cian. Contesta solo con la conversación de ejemplo del panel vivo, con «escribiendo…», al ritmo del panel. Se puede probar con las preguntas sugeridas y sigue al último mensaje sin mover la página.
   - Un módulo «Lo repetitivo, que pase solo», con textos de 05-TEXTOS y del recomendador.
   - La lista «pasa solo», con tic. El tic no se llama con movimiento reducido, y con el sonido apagado lo calla el bus.
4. **Lo que no cambia:** no se tocó ni la escena, ni los slugs, ni la intro, ni el FAQ, ni el home.

## Verificación
- `tsc --noEmit`: 0 errores. ESLint de lo tocado: limpio (antes de los últimos dos retoques; no se volvió a correr).
- Invariantes:
  - `momentos.invariant` (nuevo): 47/0.
  - `pagina`: 244/0. Se actualizó a la spec: orden de bloques, archivos de cliente, revelado de los bloques nuevos y «un video fuera de la pantalla».
  - Del V1: datos 56/0, escena 64/0, seo 53/0, precios 22/0, slots 44/0, medios 26/0, diagonales 47/0, historias 37/0.
- **Banco** `scripts-carga/m3-momentos.ts` a 1440, 1024, 768 y 390: 88/88 en la corrida completa, más 46/46 a 390 y 1440 después del arreglo de color.
  - 390 es real: `innerWidth` = 390 por el viewport de Playwright (la ventana es más ancha).
  - En las páginas: un `h1`, desborde 0 y consola limpia.
  - Web: el cambio de trabajo en tres puntos deja `scrollY` igual.
  - Software: tachado y lo nuevo al mismo valor; el tablero sin saltos (≤ 11,5 % por cada 2 % de scroll) y sin solapes al final.
  - IA: el chat avanza solo sin mover la página y las 5 tareas se tildan y destildan.
  - Con `REDUCIDO=1`: 3/3, todo quieto y entero.
  - Fotos en `C:\nocturno\cola3-fotos\M3\`.
- **No hecho: la revisión independiente** (se cortó por límite de uso). Tampoco corrieron `verificar` ni `visual-qa`.

## Decisiones (M3-n)
- **M3-1** Los momentos van después de «Qué hacemos», como secciones propias en papel.
- **M3-2** El plano no es genérico: es el de cada trabajo, calcado.
- **M3-3** Cambiar de trabajo re-corre la secuencia en tiempo (2,6 s × avance) hasta donde está el scroll.
- **M3-4** El chat usa la conversación de ejemplo del panel vivo y se rotula «Respuestas de ejemplo». No conecta el chatbot real (costaría tokens y llegaría a `/api`).
- **M3-5** Los papeles se cruzan mientras viajan, pero quietos (al principio y al final) no se solapan.
- **M3-6** «Pedido por WhatsApp» pasó a «Pedido por mensaje»: el bot de WhatsApp no se ofrece.

## Hallazgo fuera de scope
Por debajo de 1024, `_estilos/banda.css` pinta todo `[data-trazo]` del color del papel (por la mezcla de Quiénes somos). Cualquier página que use el trazo fuera de esa mezcla queda invisible. Acá se resolvió con los dos tonos escritos en el elemento. Propuesta: acotar esa regla a Quiénes somos.

## Qué tiene que mirar Valentino
1. `/v3/paginas-web`, a 1440 y en el teléfono: bajá por «Pensada antes que hecha» y cambiá de trabajo a mitad de camino.
2. `/v3/software-a-medida`: «Hoy, y con tu sistema» y el tablero. ¿La estética nueva va?
3. `/v3/ia-y-automatizaciones`: el chat contestando solo; probá una pregunta; después la lista que se tilda (con el parlante prendido suena el tic).
