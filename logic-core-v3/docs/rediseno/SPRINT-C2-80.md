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
