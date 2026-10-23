# 80 · El login

Modelo: **sonnet** (opus para el punto 1 si hace falta). Usa la 20 (el autocompletado y los errores). Capturas: `lote2/14` a `18`. **`auth.ts` es frozen:** todo es interfaz.

## Qué arreglar (ítem 23)
1. **La expansión, de una sola vez.** Al abrir el login, la forma negra se expande, **se traba un momento a mitad de camino** (`lote2/14`) y después sigue. Tiene que ser **una sola expansión continua**, y lo mismo al cerrar (una sola compresión). Medí la curva (el área cubierta por cuadro) y que no tenga mesetas.
2. **El encabezado «Iniciá sesión para entrar al panel», centrado** (hoy está alineado a la izquierda del bloque; `lote2/15`).
3. **El autocompletado** con el estilo compartido de la 20.
4. **El botón «Ingresar»:** que no sea la barra larga de abajo. Va **a la derecha de «¿Olvidaste tu contraseña?»**, en el mismo renglón, como el botón de cualquier form del sitio.
5. **«Enviar Magic Link»:** lo mismo, **abajo a la derecha**, como un botón normal.
6. **Los errores, en el formato de siempre del sitio** (`lote2/17`: hoy sale «El email es requerido.» chiquito y un rojo distinto).
7. **Bug: si está cargando y tocás «Magic Link», se pone TODO NEGRO.** Arreglalo (el cambio de pestaña durante la carga tiene que cancelar o esperar la carga, nunca dejar la pantalla vacía).
8. **Google y la flecha atrás:** al tocar «Continuar con Google» y volver con la flecha del navegador, hoy se recarga la página y no vuelve al login abierto; y si volvés a abrir el login, aparece Google cargando. **No se abre en otra pestaña.** El arreglo:
   - el estado del login vive en la URL (`?ingresar`), así que al volver, el login aparece abierto;
   - al volver de Google (incluida la vuelta desde la caché de ida y vuelta del navegador, el evento `pageshow` con `persisted`), **el estado de "cargando" se limpia**.
9. **El rectángulo alrededor del loader** (`lote2/18`): al cargar después de Google aparece un rectángulo blanco alrededor del logo que se va al tocar en cualquier lado (es un contorno de foco). Que no aparezca, sin romper el foco visible para teclado donde sí hace falta.
10. **Abajo: «Volver al home» a la izquierda y «Probá el panel» a la derecha.**
11. **Una flecha para salir**, arriba, **en el mismo lugar donde estaba el botón «Login»**, para que se entienda cómo cerrar. Hace lo mismo que «Volver al home». `aria-label` en `05-TEXTOS.md`.

## Criterios
- `ingreso.ts` en verde y ampliado: la expansión sin meseta (control: con una pausa a mitad, falla); Magic Link durante la carga nunca deja la pantalla vacía; la vuelta con `pageshow` persistido deja el login abierto y sin "cargando".
- **El fundido a 390 entrando directo** (deuda del reporte: ~550 ms contra 200 objetivo): bajalo a ~200 ms.
- Nada de llamadas reales a la autenticación en las pruebas (interceptadas).
