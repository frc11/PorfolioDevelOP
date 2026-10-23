# SPRINT C2-80 · El login (cola 2, 2026-10-23)

Modo solo escribir: nada se corrió en navegador. `auth.ts` intacto (todo es interfaz).

## Plan

| # | Punto | Dónde |
|---|-------|-------|
| 1 | Expansión de una sola vez, sin meseta | `despliegue/despliegue.ts` (`FASES_DEL_DESPLIEGUE`), `demos/genie.ts` y `menu/silueta.ts` (parámetro `fases` opcional) |
| 2 | Encabezado centrado | `HojaDelIngreso.tsx` |
| 3 | Autocompletado | sin cambio: lo cubre la regla global de `piezas.css` (`:autofill`, la de la 20) para `input`; el login ya usaba `CampoDePildora` |
| 4 | «Ingresar» a la derecha del olvido | `FormulariosConEmail.tsx` (el `Cta` de línea, no la variante de bloque) |
| 5 | «Enviar Magic Link» abajo a la derecha | idem |
| 6 | Errores en el formato del sitio | el error del servidor (y el de Google) con `ErrorDelCampo`, sin el rojo propio |
| 7 | Magic Link durante la carga → todo negro | `FormularioDelIngreso.tsx`: chips y Google deshabilitados con un envío en curso |
| 8 | Google + flecha atrás | `apertura.ts` (`pageshow` persistido → `volverDeLaCache`), `telon.ts` (`quitarElTelon`), `Ingreso.tsx` / `IngresoAbierto.tsx` (`key={vuelta}`) |
| 9 | Rectángulo del loader | `foco.css`: regla para el foco visible de la pieza de carga (solo `outline-color`) |
| 10 | Abajo: Volver a la izquierda, Probá el panel a la derecha | `HojaDelIngreso.tsx` |
| 11 | Flecha para salir en el lugar de «Login» | `FlechaDeSalida.tsx` nuevo; `aria-label` «Cerrar» (`05-TEXTOS.md`) |
| + | Fundido a 390 entrando directo (~550 → ~200 ms) | `HojaDelIngreso.tsx`: bandera `TAPAR_AL_EMPEZAR_EL_FUNDIDO` |

## Log

- **1 · La meseta, medida sin navegador.** El área que cubre la forma por cuadro con las fases del Genie de las demos (embudo 0–0,55, deslizamiento 0,25–1) SUBE hasta ~0,67 (a ~215 ms), BAJA hasta ~0,58 (a ~265 ms) y recién sigue: es la «traba a mitad de camino» de `lote2/14`, y es del efecto, no del login. Se buscaron fases con área monótona y sin meseta en 1440 (botón arriba a la derecha y abajo a la izquierda), 1024, 768 y 390: **embudo 0–0,8 y deslizamiento 0–1** (los dos a la vez) dan área siempre creciente y un paso por cuadro ≥ 0,7 del parejo entre el 4 y el 96 %. Solo el despliegue las usa: `filaDelGenie` y `siluetaDelGenie` ganan un parámetro opcional, y las demos y el menú siguen con `FASES_DEL_GENIE`. Se ve distinto del Genie de las demos (el embudo se cierra más tarde y el deslizamiento arranca con él): **a mirar con el ojo**.
- **s79-ingreso** (sección 2) afirma el área monótona y sin meseta en los cinco casos; controles en rojo con las fases de las demos y con una pausa a mitad. La afirmación de «cada vértice cae sobre el contorno de `filaDelGenie`» ahora usa `FASES_DEL_DESPLIEGUE` (cambio por diseño).
- **7 · Magic Link con la carga.** Sin poder reproducirlo, la causa más probable: tocar un chip con un envío en vuelo desmonta el formulario que espera la acción (el `AnimatePresence` lo saca) y la respuesta llega a un componente que ya no está. Se espera la carga (no se cancela): los chips y Google quedan deshabilitados mientras algo viaja y `setModo` ignora el clic. Si el banco sigue viendo la pantalla vacía, la causa es otra.
- **8 · Google.** El estado del login ya vivía en la URL (`?ingresar`). Lo nuevo: `pageshow` con `persisted` quita el telón de la ida (Google lo baja), sube `vuelta` (el formulario se arma de nuevo con `key`: Google, la contraseña y el Magic Link vuelven a reposo) y deja que el login siga a la URL. «Se recarga la página» al volver NO se pudo diagnosticar sin navegador (puede ser el `popstate` de next sobre una entrada sin su marca): si el banco lo ve, mirar el estado del historial en esa entrada.
- **9 · Rectángulo.** El foco por código a la carga (para anunciarla) caía en la regla general de foco visible de `foco.css` (con el atributo de raíz repetido) (más específico que la utilidad `outline-none`). Regla nueva solo con `outline-color: transparent` (como la píldora: sigue sin existir un `outline: none` en la hoja). No se tocan los demás focos.
- **Fundido a 390.** La función ya usa 200 ms (`MS_DEL_FUNDIDO`); los ~550 medidos son cuadros perdidos mientras la placa dibuja la sala detrás durante la carga de la página. Con la bandera (por defecto `true`) la escena duerme desde que ARRANCA el fundido en la entrada directa. No se midió; si el banco sigue sobre 200 ms, lo siguiente es llevar la opacidad al compositor (animación nativa).
- **11 · Flecha.** Se coloca con una referencia de callback (sin estado: la regla `set-state-in-effect` del repo) centrada en la caja de «Login» (`origen`, o el botón de la página); sin el botón a la vista, esquina superior derecha.

## Qué mirar (todo está SIN ver)

1. 1440/1024/768/390: abrir y cerrar el login. Una sola expansión, una sola compresión, sin pausa; ¿se parece lo bastante al Genie de las demos?
2. Flecha donde estaba «Login» (1440) y esquina (390/768 con el menú); cierra igual que «Volver al home».
3. Encabezado centrado; «Ingresar» a la derecha del olvido; «Enviar Magic Link» abajo a la derecha; abajo «Volver al home» | «Probá el panel».
4. Error del servidor y de campo con el mismo formato.
5. Con la carga en curso, los chips y Google no responden y la pantalla nunca queda vacía.
6. Google y flecha atrás: el login vuelve abierto, sin «cargando», sin rectángulo.
7. Banco: `BASE=http://localhost:3000 npx tsx scripts-carga/ingreso.ts` y, uno por uno, con `CONTROL=pausa`, `CONTROL=pantalla-vacia`, `CONTROL=sin-pageshow` (cada uno tiene que dar FALLA en su línea).

## Sesión 5 (2026-10-23, orquestador): verificado en el navegador, y el fundido a 390 en el compositor

- **El banco contra el dev :3002** (`verif-80a.log`, `ab80*.log`, `verif-80c/d/e.log` en `C:\nocturno\2026-10-23\`). A/B contra el código de antes de la 80 (`e31070f1`, un worktree temporal con el mismo banco): la **meseta** estaba (el área bajaba 4,2 % a mitad de la expansión y 4,3 % de la compresión) y con la 80 ya no (0,0 %, hueco máximo 14–18 ms, 1440). Lo demás de la 80 en verde a 1440: la flecha en el centro de «Login» (a 0,01 px) con `aria-label` «Cerrar» y cierra; el encabezado centrado; «Ingresar» a la derecha del olvido, en su renglón (80 px de ancho, no la barra); «Volver al home» | «Probá el panel»; Magic Link con la carga en curso (el chip deshabilitado, la pantalla nunca vacía, el formulario sigue, al terminar vuelve todo); la vuelta con `pageshow` persistido (el login abierto, sin «cargando», sin telón).
- **El cierre en 510 ms** de la primera corrida era del arranque en frío del dev: repetido, 541–548 ms (ok).
- **El fundido a 390 (la deuda: ~550 ms contra 200).** La bandera `TAPAR_AL_EMPEZAR_EL_FUNDIDO` no lo movía (632 ms antes, 632–679 con ella). Medido: en la entrada directa el home termina de montar sus secciones JUSTO mientras abre el login (antes de `abriendo` los cuadros van a 13–14 ms; durante, ~250 ms: un render de React de ~130 ms + ~80 de microtareas y el `ResizeObserver` de `useCoreografiaDelEscenario` de Servicios, ~80–106 ms, que se monta en el medio). El fundido, pintado desde JS por `rAF`, tenía 3 cuadros y saltaba de 0 a 1 de golpe. **Arreglo: el fundido corre en el compositor** (`useDespliegue.ts`, `fundir`: una animación nativa de opacidad y escala, lineal como `pintar`; el avance lo sigue leyendo el hilo principal para `data-avance` y para cortar a mitad de camino). El Genie sigue igual (un `clip-path` con `path()` no se compone).
- **El banco mide el fundido en el compositor** (`ingreso.ts`): la página publica cuándo arrancó de verdad la animación nativa sobre el fondo (`startTime`) y el trace de Chrome dice si se compuso y cuántos cuadros presentó el compositor en esos 200 ms (un `DroppedFrame` con `hasPartialUpdate` es un cuadro presentado sin el hilo principal). Integración: **200 ms, compuesta, 14–15 cuadros presentados, 0 perdidos** (dos corridas); contra el código de antes: FALLA (sin animación nativa). Lo que ve el hilo principal (~550 ms) queda impreso como dato. **Queda:** la animación arranca 323–363 ms después de crearse en el dev (el hilo principal recién confirma el cuadro cuando el home termina esas tareas): a medir en el build (tarea 90).
- El screencast de CDP no sirve para esto (pasa por el hilo principal: 800 ms sin cuadros mientras el home monta).
- **De antes, no de la 80:** con `SIMULAR=1`, `?envio=lento` no muestra el telón («0 cuadros con telón · ruta /») también con el código de antes; la consola de la sección C2 tenía el «Failed to load resource» de las acciones que aborta el mismo banco (filtrado).
- **Los controles del banco**, en rojo donde tienen que estar: `CONTROL=pausa` (hueco de 164 ms y desvío 0,262), `CONTROL=pantalla-vacia` (su línea), `CONTROL=sin-pageshow` (queda «cargando»).
- **Los cuatro anchos** (chequeo aparte, fotos en `C:\nocturno\2026-10-23\fotos\80\`): 1440 el Genie desde «Login» sin meseta (45 cuadros, hueco 14 ms); 1024 y 768 el chrome en modo menú (sin «Login» a la vista: el fundido) y la flecha en la esquina de arriba a la derecha; 390 igual. En los cuatro: el encabezado centrado, «Ingresar» a la derecha del olvido, «Volver al home» | «Probá el panel», y la flecha cierra. Humo 7/7. s79-ingreso 40/0, s79-ingreso-url 35/0, s79-ingreso-c2 33/0, tsc 0, eslint limpio.
- **A decidir (Valentino), no es de la 80:** en la entrada directa (`/v3?ingresar`) el velo de carga (papel, el mismo `z-index` que el login y después en el DOM) tapa todo hasta ~6,7–8,9 s en el dev: el login abre y termina su fundido DEBAJO del velo, y lo que se ve es el velo yéndose. Para que el fundido se vea, el login tendría que quedar encima del velo (no necesita la escena) o esperar a que el velo se vaya. No se tocó (es la pila global). A medir en el build (tarea 90).
- **A confirmar:** abajo de 1024, entrando con `?ingresar`, el foco del diálogo cae en la flecha y se ve su anillo de foco (un cuadrado, porque no hubo interacción con el puntero); a 1440, abriendo con el clic, el foco va al email.
