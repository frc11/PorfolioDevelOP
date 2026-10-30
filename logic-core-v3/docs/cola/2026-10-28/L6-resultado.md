# L6 · resultado (carril b · rama `cola3b/2026-10-28` · Sonnet 5.5 medio)

Fotos: `C:\nocturno\cola3-fotos\b\L6\` (`fotos\` las de la página y el preloader; el resto, de cada banco). Sin las cuentas de prueba en ninguna foto ni log.

## Por ítem

| # | Ítem | Estado | Evidencia |
|---|---|---|---|
| 1 | La entrada del login anima siempre | **hecho** | Causa raíz reproducida y arreglada: en la primera entrada del día con `?ingresar` el login se desplegaba DEBAJO del preloader y, al irse éste, ya estaba abierto («no hace la animación a veces»). `apertura.ts`: `seguirCuandoEntre()` espera a que la entrada del sitio se abra. `scripts-carga/ingreso-real.ts`: rojo antes («con el preloader tapando true»), verde después; las otras maneras (entrada directa sin preloader, «Login» de la barra, cerrar y abrir, después de un intento fallido) animan: Genie 557–570 ms con 33–41 avances intermedios; fundido de 200 ms terminado. Invariante `s79-ingreso-url` §9b (con control rojo). |
| 2a | Intento fallido: se queda en el login nuevo | **hecho (ya era así)** | Con la cuenta de prueba y la contraseña equivocada: ruta `/v3?…`, error «Email o contraseña incorrectos.» en el formulario (`ingreso-real.ts`). No pude reproducir el salto al login viejo; ver L6-8. |
| 2b | «¿Olvidaste tu contraseña?» a la estética de hoy | **hecho** (parcial en el correo, ver 2e) | Ya no sale a `/forgot-password`: es otra vista de la hoja del login nuevo (`OlvidoDeLaClave.tsx`, la misma `forgotPasswordAction`). `ingreso-real.ts`: se queda en `/v3`, valida el email vacío, el aviso es el de siempre, «Volver a iniciar sesión» vuelve; foto `fotos\login-olvido-390.png`. |
| 2c | Tras cerrar sesión, al login nuevo | **no hecho · FRENADO** | Ver «Decisiones que necesitan a Valentino» · D1. |
| 2d | Error de Google al login nuevo | **no hecho · FRENADO** | D2. |
| 2e | El correo de recuperación apunta a `/reset-password` (login viejo) | **no hecho · FRENADO** | D3. |
| 3 | Preloader sin flechas, con vibración | **hecho** | `scripts-carga/preloader.ts` (1440, 1024, 768, 390; `/v3` y `/v3/pagina-base`): sin flechas (0 piezas en toda la entrada); el botón del sonido (y el del movimiento en 768/390) aparece en su lugar (centro a 0,0 px, 48 contra 48 px); la onda nace centrada en el botón (desvío 0,0 px) y termina a escala 1 con radio = la esquina más lejana (1625 px a 1440; 877 px a 390); los dos pulsos a 300 ms; los latidos que hace la animación = los de la línea; con la carga tarde el latido se repite (3 latidos con lista a los 9,1 s). Controles rojos: `CONTROL=sin-onda` (5 fallas), `CONTROL=onda-corrida` (desvío 120 px). Reducido: sin onda. Fotos `fotos\preloader-onda-{1440,1024,390}.png`. Invariantes: `s78-preloader` 42/0, `s78-preloader-entrada` 17/0, `s78-c2-81` 45/0. |
| 3b | Movimiento prendido vuelve al recargar | **hecho** | `prenderSinGesto()` + `retomarElMovimiento`: se pide el permiso sin gesto primero; si el aparato lo rechaza, se espera el toque como antes. `scripts-carga/movimiento.ts` completo en verde: «recargado, permiso sin gesto (Chrome) → vuelve prendido, 1 pedido» y «permiso desde un gesto (iOS) → intenta, queda apagado, el primer toque lo prende». Control `CONTROL=sin-reintento`: rojo en 3 casos (incluido el «prendido y recargado» que ya tenía el banco: era el defecto reportado, Chrome 156 trae `requestPermission`). |
| 4 | Flags de la página base fijos | **hecho** | `?titulo=1`, `?composicion=3`, `?legibilidad=peso` fijos; sin banderas, variantes, `data-composicion`/`data-legibilidad`, ni la página `/v3/titulos-de-pagina`; las cinco instancias de Archivo que sólo usaban las otras combinaciones se borraron (L6-1). `s78-b12a` 162/0 (los casos que clavaban las variantes ahora clavan la familia fija, con controles). Fotos `fotos\pagina-base-sin-flags-{1440,390}.png`. Los tres valores son los que ya eran el defecto: lo que se ve no cambia (no medí contra la base, ver «no verificado»). |
| 5 | El destello del viaje | **hecho** | `paginaTapada.ts` apaga la `transition` del `<main>` nuevo mientras está tapado. `scripts-carga/viaje.ts` 1440 y 390: 0 cuadros a la vista antes del destape. Quitando el arreglo a propósito: FALLA («la página nueva A LA VISTA en 3 cuadros», opacidad 1,00 → 0,98); `CONTROL=sin-tapar`: FALLA. |

Puerta: `tsc --noEmit` 0 errores; ESLint limpio en lo tocado; suites afectadas verdes (`s78-b12a` 162, `s78-b12b` 35, `s78-preloader` 42, `s78-preloader-entrada` 17, `s78-c2-81` 45, `s79-ingreso` 40, `s79-ingreso-c2` 33, `s79-ingreso-url` 37, `s17-marca` 32). Humo del home (`humo-l6.ts`): rueda a 1440 y dedo a 390 bajan por Quiénes somos → Números → Trabajos (→ Servicios… en 390) y vuelven arriba, 0 errores de página. `ingreso.ts` (SIMULAR=1) 0 fallas.

La cuenta de la cola de tests bajó donde se borró la flecha (`s78-preloader` pasó de la parte «trazado de la flecha» a la parte nueva del latido) y donde se sacaron variantes (`s78-b12a`): son pruebas de código que ya no existe; cada afirmación nueva lleva su control rojo.

## Decisiones que necesitan a Valentino (frenadas: tocan auth o lo que muestra el sitio vivo)

Las tres comparten la causa: el login nuevo vive en `/v3?ingresar` y los destinos viejos están escritos en archivos compartidos con el sitio vivo.

**D1 · Cerrar sesión lleva a `/login`.** `src/actions/auth-actions.ts` (`signOutAction`, usada por admin, dashboard y setter) hace `signOut({ redirectTo: '/login' })`.
- Opción A (la mínima, recomendada): `redirectTo: '/v3?ingresar'` (una línea). Cambia adónde van a parar los usuarios del sitio vivo al salir. Se deshace volviendo la línea.
- Opción B: que `src/proxy.ts` mande `/login` sin `callbackUrl` al login nuevo (cubre también «sin sesión entrando a /dashboard»). Más amplia; toca autenticación. Se deshace quitando la regla.
- Opción C: no hacerlo hasta que el nuevo home reemplace al viejo en `/` (entonces `/login` puede apuntar al nuevo en un solo lugar).

**D2 · El error de Google (`unauthorized`) cae en el login viejo.** `src/auth.ts` (congelado): el callback `signIn` devuelve `/login?error=unauthorized` y `pages.signIn = '/login'`.
- Opción A (recomendada): en `proxy.ts`, redirigir `GET /login?error=…` (sin `callbackUrl`) a `/v3?ingresar&error=…`, y yo leo `error` en el login nuevo y muestro el texto del formulario (esta mitad es del lado v3, no está hecha por depender de que la A exista). No toca `auth.ts`. Se deshace quitando la regla.
- Opción B: cambiar el `return` del callback en `auth.ts` (una línea, congelado). Más directo, pero es configuración de auth.
- Opción C: dejarlo (el caso sólo ocurre con cuentas de Google sin organización).

**D3 · El mail «Recuperar contraseña» manda a `/reset-password?token=…` (página vieja).** La URL la arma `src/app/forgot-password/actions.ts:88`. Para que la persona termine el flujo en el estilo de hoy hacen falta dos cosas: (i) esa línea apunta a una vista nueva y (ii) yo hago la vista (una segunda vista de la hoja, con `resetPasswordAction`). La (ii) es del lado v3 y la dejo para cuando se decida la (i).
- Opción A (recomendada): que la línea 88 quede como variable de ruta (`/v3?ingresar&restablecer=<token>`) y yo hago la vista. Se deshace volviendo la línea.
- Opción B: dejar la página vieja sólo para el restablecimiento (es lo único viejo que queda en el flujo).
- Opción C: no hacerlo.

## Decisiones tomadas solo

- **L6-1** Borré la ruta `/v3/titulos-de-pagina` (y su entrada en `RUTAS_SIN_CHAT`) y las cinco instancias de Archivo que sólo usaban las otras combinaciones (`75-500/800/900`, `125-200/500`: json + woff, el layout, `fuentesDePagina.ts`, `CARA_DEL_DOM`, métricas, tipo `FuenteDePagina`). El pedido era «quitar las otras variantes y sus caminos». Quedan sin tocar el generador `scripts-retoque/fuentes-3d.py` y los bancos que barrían los flags (`scripts-carga/composicion.ts`, `titulo-familias.ts`, `contraste-de-la-intro.ts`…): quedan viejos, fuera de alcance.
- **L6-2** El primer commit de L6 (`8732d787`, el del ítem 5) arrastró tres borrados que ya estaban en el índice (la flecha, el trazado, la página de comparación): el mensaje sólo habla del 5. El árbol final es lo que cuenta.
- **L6-3** «¿Olvidaste tu contraseña?» es una vista dentro de la hoja y no una ruta nueva: sin escena, sin chrome, sin la pista de una página; es lo que ya hace el Magic Link (otra vista del mismo formulario) y no necesita ruta.
- **L6-4** La onda es un anillo HTML que crece con `transform: scale`: el grosor del borde crece con la escala (nace de menos de 1 px y llega a 2 px mientras se desvanece). Alternativa descartada: SVG con trazo no escalable, cuyo comportamiento bajo una transformada del HTML no está garantizado y no iría en el compositor. En las fotos se ve como una línea fina y visible; si Valentino la quiere más gruesa al nacer es un número (`GROSOR_DE_LA_ONDA_PX`).
- **L6-5** El botón se dibuja en la capa (la capa tapa el chrome y el botón real está debajo): disco con su borde, su sombra y su ícono, a la caja medida del real. No se toca (aria-hidden); lo que se toca es la frase.
- **L6-6** Los botones se montan desde el blanco, no desde el primer cuadro: lo que hidrata al arrancar no compite con el fundido de la bienvenida.
- **L6-7** El latido se repite cada 2,8 s mientras se espera (no sólo pasado un umbral): el segundo latido llega a los 6,3 s desde el arranque, que es el «tarda» natural; el caso normal ve uno solo.
- **L6-8** El login real se probó contra un dev server propio con `NEXTAUTH_URL` pisado por entorno al puerto 3003 (el `.env.local` lo manda al 3000 y la redirección al panel salía de la página). No toqué ningún `.env`. Sobre «el intento fallido me lleva al login viejo»: con credenciales malas la acción devuelve el error y el formulario nuevo lo muestra; no hay redirección. Lo más probable es que lo que vio fuera la ruta de Google (D2) o el cierre de sesión (D1).
- **L6-9** `s17-marca` tenía la lista de binarios del layout desactualizada (`75-800` y `112-300`): la ajusté a las tres caras que quedan, junto al borrado.
- **L6-10** `ingreso.ts`: «¿Olvidaste…?» ahora es un botón (`[data-parte="olvido"]`), no un enlace a `/forgot-password`: cambié ese selector.
- **L6-11** Los defectos del banco `sin-freno` y `punta-corta` se reemplazaron por `sin-onda` y `onda-corrida` (su razón de ser se fue con la flecha); `sin-reintento` es nuevo (movimiento).

## No planificado, a propósito
- Las grietas del cristal (quitadas en L1; se rediseñan después).
- El movimiento del teléfono completo: sólo el botón, en beta.
- El cuadro largo «página → home» (defecto 3 del informe): necesita un build; queda para la pasada técnica final.

## Supuestos y descartes
- No pude reproducir otras causas de «no anima» (por ejemplo, la carrera entre `history.back()` y volver a abrir muy rápido): sólo la del preloader tiene reproducción y arreglo medidos.
- Los bancos del preloader corrieron contra el dev (no el build): el hilo principal va a tirones y por eso las comprobaciones de la onda leen lo que dicen las animaciones (compositor), no el muestreo por cuadro.
- Con el dev, a 768 y 390 el banco marca «la bienvenida arrancó 286–299 ms después de crearse» (criterio de C2-81 sobre el fundido del texto, que L6 no toca: los botones se montan después). No lo medí contra la base: queda para el build.
- Una primera entrada a 1440 marcó una vez «la cubierta desde el primer cuadro» en la corrida de los cuatro anchos y salió bien al repetirla sola: lo trato como ruido del dev.
- `s8-montaje` está en rojo por seis archivos que L6 no toca (`s32-escena7`, `s34-calidad1`, `EscenaDelCta`, `cuadroDelFinal`, `recorridoDelFinal`, `armadas`): anterior a L6.
- Hallazgo fuera de alcance (anterior a L6): en iOS, después de recargar con el movimiento prendido, si el primer toque cae SOBRE el botón del movimiento, el oyente de la ventana lo prende y el clic del botón lo apaga (el banco lo mostró con un toque sobre el botón; con el toque en otra parte, bien).

## Qué tiene que mirar Valentino
1. **La primera entrada del día con `/v3?ingresar`** (1440 y 390; borrar la clave `develop-v3-preloader` del almacenamiento local para verla): el login espera a que se vaya el preloader y entonces se despliega (el fundido, o el Genie desde «Login»).
2. **El preloader del home**, primera entrada del día, a 1440 y en el teléfono: la frase, el botón del sonido aparece en su lugar arriba a la izquierda y late «tu-tu», una línea fina sale de él y cruza toda la pantalla; si la carga tarda (CPU lenta), se repite; en el teléfono vibran los dos botones, sin flechas.
3. **«¿Olvidaste tu contraseña?»** dentro del login (cualquier ancho): cambia la vista en la misma hoja; «Enviar instrucciones» muestra «Revisá tu email»; «Volver a iniciar sesión» regresa. Y las tres decisiones D1–D3 de arriba.
4. **El teléfono con movimiento prendido y recarga** (Android/Chrome): vuelve prendido sin otro toque. `/v3/pagina-base` sin banderas, y `?titulo=2&composicion=1&legibilidad=tamano` ya no cambian nada.

Banderas: ninguna nueva. Las que se fueron: `?titulo=`, `?composicion=`, `?legibilidad=`. Siguen las de desarrollo (`?envio=lento|error`).

## Revisión independiente (subagente Sonnet, sólo lectura del diff)
Sin hallazgos altos ni de seguridad. Arreglados: comentarios viejos de las banderas (`pagina-base/page.tsx`) y de «flecha» (`PreloaderDelSitio.tsx`, `reloj.ts`), la línea «reservado» de `ingreso-real.ts`, y el foco: la vista de olvido ahora enfoca el email al abrirse (con mouse). Descartados: el grosor de la onda («delgada pero visible»: las fotos `fotos\preloader-onda-1024.png` y `-390.png` muestran la línea visible; el número es `GROSOR_DE_LA_ONDA_PX`); lo escrito en la contraseña se pierde al ir a la vista de olvido (es lo esperable al cambiar de vista).
**Pendiente anotado (fuera de alcance):** los bancos `scripts-carga/titulo-familias.ts`, `titulo.ts`, `composicion.ts`, `titulo-3d.ts` y `contraste-de-la-intro.ts` siguen barriendo `?titulo=`, `?composicion=` y `?legibilidad=`: ahora fotografían la misma página varias veces. Hay que borrarlos o rehacerlos; y `compilar.ts:6` cita `?composicion=1` en un comentario.
