# SPRINT C2-51 · El recomendador de Servicios (cola 2, 2026-10-23)

Tarea: `docs/cola/2026-10-23/51-recomendador.md` (ítem 14 de la revisión; capturas `lote1/19` y `lote1/20`). Worktree `C:\nocturno\2026-10-23\51`.

## Plan

1. **El último tramo sin gatillo.** La máquina común (`_componentes/gatillos/maquina.ts`) gana `salidaDeAbajoLibre` (sólo la pide
   Servicios): en el último paso, un gesto NUEVO hacia abajo es de la página (rueda, teclas y dedo, sin `preventDefault`); lo que queda
   del gesto que trajo a IA se sigue tragando; IA aterriza al pie de su tramo (a 2 px de soltarse el escenario), así el primer gesto
   ya mueve la página. Subiendo desde el recomendador, la entrada sigue atrapando (se planta en IA).
2. **El encabezado** (`recomendador/EncabezadoDelRecomendador.tsx`): el título de 05-TEXTOS en la letra y el pintado de los títulos
   grandes (`TituloQueSePintaAlLlegar`, display en mayúsculas, tres renglones, tope de 11 svh como «Nuestros servicios»), arriba a la
   izquierda; debajo, los dos párrafos en el registro de título chico, que se levantan con el `Gatillo` desde abajo.
3. **El formulario por etapas** (`EtapaDelRecomendador.tsx`): el indicador 1-2-3, la pregunta como `legend`, cinco tarjetas-radio
   con ícono de lucide (la elegida se invierte: tinta con letra de papel), «Atrás» y «Siguiente» / «Ver mi recomendación». Sin
   elegir, el aviso de siempre (`ErrorDelCampo`). Abajo de 1024, una columna con las opciones a lo ancho.
4. **La lógica, pura** (`logica.ts`, sin React) y **el flujo, puro** (`flujo.ts`, un reductor). Desempate: total, después lo sumado
   en la pregunta 1, después el orden de la tabla.
5. **Las transiciones**: el fundido de `EstadoDeEnvio` (su duración y su curva) con el texto que se levanta (`movimiento.ts`), el
   pintado de los títulos (también el análisis, más lento: `usePintadoAlLlegar`), `AnimatePresence` en `wait` para los cambios de fase.
6. **El procesando** (`Procesando.tsx`): `Carga` y las tres líneas que se reemplazan con fundido, una cada `CARGA.textoMs` (2,7 s).
7. **El resultado en el mismo lugar** (`ResultadoDelRecomendador.tsx`) y **el contacto precargado** (`ContactoDelRecomendador.tsx`):
   los campos del sitio, `validarContacto`/`enviarContacto` (el endpoint del contacto general, con los intereses de la precarga del
   servicio), `EstadoDeEnvio`, el link chico con el viaje (`EnlaceDelServicio` con `rotulo` y `enTinta`) y «Empezar de nuevo».
8. **El chat**: el recomendador sigue adentro de la sección de Servicios (la zona de C2-21).
9. **REGLA DE ALTURAS**: desde 1024 la pista queda fija en 700svh (lo que medía estirada) y el recomendador crece hacia abajo (antes,
   estirada con `flex-1`, la pista se achicaba arriba y el recomendador saltaba en la pantalla al cambiar de alto); `tramoDeServicios`
   anota el tramo también desde 1024 con el alto viejo = la tabla (8 pantallas).

## Log

- Hecho todo el plan. `preguntas.ts` borrado; las casillas `serviciosPregunta*` de `INVENTOS` y el pedido del recomendador se fueron
  (los textos son reales); `CONTENIDO-PENDIENTE.md` regenerado (`s7-pedido --escribir`).
- Los números del indicador los dibuja el CSS (`content` con una variable): como texto, el escáner de cifras de s6 los marcaba.
- El árbol servido no lleva props de Motion hasta el primer gesto: con movimiento reducido escribía `transform:none` (s10 lo marca).
- Pruebas: `s78-c2-51` nueva (47 afirmaciones, 0 fallas, con sus controles). Actualizadas a la spec, con su comentario y su control:
  s81 (la salida de abajo es de la página; el recomendador de dos soluciones; el tramo desde 1024; cinco radios), s6-servicios (los
  dos párrafos; el recorrido del teclado con cinco opciones), s10-acceso (paradas 3 + 5 + 1) y su censo (las doce casillas cerradas).
  Verdes sin tocar: s78-c21, s78-b12b, s84-demos, s21-llave, s7-pedido, s37, s43, s62, s85, s49-cierre-final.
- Banco nuevo, sin correr: `scripts-carga/recomendador.ts` (TRAMO, ETAPAS, PROCESANDO, RESULTADO, ELEGIR, ENVIO, REINICIO; siete
  controles; fotos de cada etapa). El defecto `con-gatillo-al-final` de `defectos.ts` es su control del tramo.

## Qué mirar

1. `/v3` a 1440 y 1024: desde IA, la rueda baja normal hasta el Panel (el panel de IA se va con el primer gesto, sin vuelo).
2. El encabezado: el título grande arriba a la izquierda, que se pinta; el texto que se levanta debajo.
3. Las tres etapas, Atrás, el aviso sin elegir; el procesando (2,7 s); el análisis que se pinta; elegir una (la otra se desvanece) y
   el contacto debajo con el mensaje escrito; enviar (interceptado); «Empezar de nuevo».
4. 768 y 390: lo mismo en una columna; el dedo desde IA baja normal.
