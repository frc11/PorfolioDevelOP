# SPRINT B7 · NOCTURNO (2026-10-22) — el login que se despliega como una demo

Tarea: `docs/cola/2026-10-22/20-B7-login.md`. Rama `nocturno/2026-10-22-b7`. Sin navegador: lo que se mide en el sitio lo corre el orquestador (`scripts-carga/ingreso.ts`).

## Plan

**Lo que había (leído antes de escribir):**
- «Login» es un enlace a `/login` en la esquina de la barra (`_chrome/barra/BarraDelHome.tsx:242`, `ENLACE_DE_LOGIN` en `_chrome/enlaces.ts:39`). En el teléfono el menú no lleva Login (s26 y s41 lo fijan: decisión de C5).
- El login de siempre: `src/app/login/page.tsx` (la presentación vieja: DotMatrix, cian) y `src/app/login/actions.ts` (`loginAction`, `magicLinkAction`, `googleSignInAction`, que llaman a `signIn` de `src/auth.ts`). Cliente y admin ya están juntos: `loginAction` decide el destino por rol.
- El despliegue de las demos: el Genie (`_secciones/trabajos/demos/genie.ts`: `MS_DEL_GENIE` 560 ms, `filaDelGenie` con el embudo y el deslizamiento, `correrPorTiempo`), su fundido de movimiento reducido (`demos/apertura.ts`: 200 ms, escala 0,96) y los sonidos `abre`/`cierra` (`VentanaDeDemo.tsx:114,144`). El menú del teléfono ya lo reusa con una silueta recortada (`_chrome/menu/silueta.ts`).
- El diálogo: `useDialogo` de las demos (foco atrapado, Esc, `overflow: hidden` en el `<html>` sin mover el scroll, `data-lenis-prevent`).
- La escena se suspende desde `_lib/escena/ataduraAlScroll.ts` (fuera de cuadro → `frameloop` `never`; vuelve por `reanudando`).
- Los formularios del sitio: `_componentes/formularios/Campos.tsx` (la píldora, su foco, el error punteado), `Cta`, `Carga` (el logo), el aviso único de `FormularioDeContacto`.

**Árbol:**
- nuevo `_chrome/despliegue/despliegue.ts` y `useDespliegue.ts`: la pieza común (el Genie de las demos importado, con la silueta del menú, sobre una hoja de pantalla completa). La prueba del panel (C1) se va a desplegar igual.
- nuevo `_chrome/ingreso/`: `apertura.ts` (estado, URL `?ingresar`, delegación del clic, la flecha), `Ingreso.tsx` (lo monta el chrome; la hoja va perezosa), `IngresoAbierto.tsx`, `HojaDelIngreso.tsx`, `FormularioDelIngreso.tsx`, `FormulariosConEmail.tsx`, `CamposDelIngreso.tsx`, `envio.ts`, `acciones.ts`, `simulacion.ts`, `telon.ts`, `contenido.ts`, y sus dos invariantes `s79-*`.
- nuevo `_lib/escena/tapa.ts`: la sala tapada (la escena duerme).
- tocados, mínimo: `BarraDelHome.tsx` (un atributo en «Login»), `ChromeDelHome.tsx` (monta `<Ingreso />`), `ataduraAlScroll.ts` (la lectura con la sala tapada), `package.json` (los scripts de s79).
- nuevo `scripts-carga/ingreso.ts` (el banco, sin correr).

**Riesgos:** T0 corre en paralelo y toca la barra: en `BarraDelHome.tsx` sólo cambia la línea del enlace. `ataduraAlScroll.ts` es de la escena: el cambio es un bloque nuevo al principio de la lectura (ninguna línea que s27, s34, s49, s52 o s78 fijen cambió).

## Decisiones tomadas sin preguntar
1. **El negro es la ventana del Genie y «Login» su libro**: la hoja negra sale del botón con la forma de las demos (su curva y su tiempo) y cubre la pantalla entera; lo de adentro viaja recortado por la misma forma y aparece con el avance (`1 − m`, lineal, como el velo de las demos): «al mismo tiempo». Sin tiras: una sola capa con `clip-path` (la silueta del menú), porque el negro es liso.
2. **Sin un botón a la vista** (la entrada directa por la URL, la tablet o el teléfono con el menú) **o con movimiento reducido: el fundido de las demos** (200 ms).
3. **«Volver al home» = la flecha atrás**: si la entrada `?ingresar` la empujó el login, `history.back()` (no deja una entrada muerta); si se entró directo con `?ingresar`, se reemplaza la URL (atrás sacaría del sitio). Esc hace lo mismo. Un clic en el negro NO cierra (es la pantalla entera).
4. **El rótulo «Volver al home» se deja en todas las rutas de /v3** (en una página vuelve a la página: cierra y nada más).
5. **El teléfono**: el menú sigue sin Login (lo fijan s26 y s41; no se tocó). El login se ve a pantalla completa en todos los anchos y se llega por la URL (`?ingresar`).
6. **El fundido al panel**: el éxito del login es la redirección de `loginAction` (next navega solo). Se cuelga un telón del mismo negro en `<body>`, fuera de React (sobrevive al cambio de ruta) y se funde (450 ms, la curva premium) cuando la ruta ya es la del panel. El panel no se toca. La redirección no se vuelve a tirar (next ya navegó): no se desmonta el home detrás del telón.
7. **El formulario**: los tres inicios de siempre (Google, contraseña, Magic Link) con los textos del login de siempre; la contraseña y el Magic Link en dos chips (los del contacto). La validación del cliente repite la del servidor con sus mismos mensajes (el invariante los compara con `actions.ts`). Los errores del servidor se muestran tal cual (son textos para la persona), en el rojo del error del tema; los de los campos, en el borde punteado y su texto.
8. **El envío no es la `action` del `<form>`** (React vaciaría el formulario al terminar): `onSubmit` valida y despacha `useActionState` en una transición.
9. **La simulación**: la bandera de los formularios del sitio, `?envio=lento|error`, sólo en desarrollo. `error` no llama al servidor; `lento` llama a una acción de desarrollo (`simulacion.ts`) que espera y redirige al panel sin tocar la autenticación (en producción no hace nada).
10. **La hoja viaja perezosa** (se pide al acercarse a «Login»): el formulario y las acciones no pesan en la carga del home.
11. **La escena duerme detrás del negro** desde que terminó de cubrir hasta que empieza a irse, y nunca antes de su primer cuadro (la carga lo espera).
12. **La G de Google** lleva sus colores (la marca), copiada del login de siempre.
13. **El suite es s79**: si otra tarea de la noche también tomó el 79, renumerar al integrar.

## Log
- Lectura: barra, menú, contacto, demos (genie, apertura, ventana, diálogo), silueta del menú, atadura de la escena, login viejo y sus acciones, sonido, carga, campos.
- Primera versión de la atadura con `&& !tapada` en dos líneas: rompía la regex de s78 («cableada»). Rehecha como un bloque al principio de la lectura (ninguna línea fijada cambia).
- s79: 71 afirmaciones, 0 fallas al primer paso. Lint: una advertencia (`_previo` sin usar), corregida. tsc 0.
- Suites del área (s4 s8 s9 s10 s17 s25 s26 s27 s34 s37 s38 s39 s40 s41 s42 s47 s48 s49 s51 s52 s61 s73 s74 s75 s76 s78): las que fallan son las de la base, con las mismas afirmaciones, salvo s8-montaje: el invariante de s79 pasaba las 300 líneas de código (s8 mide la carpeta del chrome). Partido en dos (`s79-ingreso` y `s79-ingreso-url`).

## Qué mirar (el orquestador, en el navegador)
Ver el reporte de la tarea (la lista numerada con URL, ancho, acción y qué debería verse) y el banco `scripts-carga/ingreso.ts` (con `SIMULAR=1` sólo contra el dev; `CONTROL=scroll` tiene que fallar).
