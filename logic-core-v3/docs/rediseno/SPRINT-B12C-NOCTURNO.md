# SPRINT B12c · nocturno del 2026-10-22 — el preloader del sitio

Rama `nocturno/2026-10-22-b12c`. Tarea: `docs/cola/2026-10-22/70-B12c-preloader.md` (lo decidido por Valentino el 2026-10-21). Sin
navegador: lo que se ve lo mide el orquestador (abajo, «Qué mirar»). Las pruebas sin navegador están en `s78-preloader`
(`npm run test:s78-preloader`), cada una con su control positivo; el banco nuevo es `scripts-carga/preloader.ts` (sin correr).

## Plan

| # | Qué | Cómo | Criterio sin navegador | Criterio en el navegador |
|---|---|---|---|---|
| 1 | Cuándo: una vez por día, nunca en recargas ni navegación interna | un script ES5 en el `<head>` (`useServerInsertedHTML`, el camino del gate del intro viejo) decide antes del primer pintado: la fecha LOCAL en `localStorage` (`develop-v3-preloader`), el tipo de navegación del documento (`reload`, `back_forward` no); sin almacenamiento se muestra igual. La navegación interna no remonta el layout | s78 §1: 17 casos contra el script corrido con una ventana falsa, con tres controles | `preloader.ts`: aparece en la primera, no en la recarga ni en otra entrada del día, sí con la fecha de otro día |
| 2 | La secuencia (5 a 6 s) | `linea.ts`, pura: negro + bienvenida (0,9 entra, 1,1 queda, 0,6 sale), blanco (0,5), frase (0,4), flecha (1,5), salida (0,7) = 5,7 s | s78 §2 | `preloader.ts`: 5–6 s con la carga lista |
| 3 | La flecha regula la carga | la flecha frena en su último 20 % si falta la carga (se acerca a 0,97 sin llegar), quieta con un pulso en la punta desde los 6 s; ícono de carga recién a los 12 s; tope a los 20 | s78 §2 (con dos controles) | `LENTO=6`: el freno y el pulso |
| 4 | La flecha termina donde está el botón del sonido | `trazado.ts`, puro: rodea la frase por abajo, un rizo, y la punta en el borde del disco del botón apuntando a su centro; las cajas son las reales, medidas en cada cuadro (si el botón llega tarde o la ventana cambia, se rehace) | s78 §3 a 1440, 1024 y 390 (cajas de los tokens) | `preloader.ts`: a su radio del centro ± 1,5 px en los tres anchos |
| 5 | La frase del sonido, tocable | un botón sin subrayado; prende la preferencia de siempre (`guardarPrendido`, y el toque es la acción que el navegador pide); «Sonido activado» arriba de la frase (sin correrla: la flecha sale de su caja); al aparecer la página, la llegada suave (`sonar('cierra')`, la del velo al destapar) | — | `preloader.ts`: la preferencia en `si` y el botón con `aria-pressed` |
| 6 | El scroll bloqueado hasta que entra la página | el script bloquea desde el primer instante (la rueda y el toque en la captura de la ventana, también para Lenis; las teclas que scrollean); con la entrada abierta se suelta cuando no queda nada que la retenga: en el home el logo que cae (`CaidaDelLogo`), en una página el título 3D (`TituloDePagina`, el reloj del titular); tope 6 s | s78 §1, §4, §5 | `preloader.ts`: la rueda no mueve nada hasta ~2,4 s después del blanco (≥ 1024) |
| 7 | La escena se prepara detrás | lo que espera la entrada (`entradaLista`): las fuentes, el primer cuadro, la escena compilada y calentada (`Precompilar` avisa: `marcarLaEscenaPreparada`), el titular del hero armado y ningún título urgente en camino | s78 §2 | los tirones de la entrada con y sin preloader (`preloader.ts`) |
| 8 | Movimiento reducido (~1 s) | 0,35 s la bienvenida, de golpe la frase con la flecha dibujada 0,65 s, un fundido de 0,15 s; sin pulso | s78 §2 | `preloader.ts` (reducedMotion) |
| 9 | Que no rompa las pruebas | las salidas: `navigator.webdriver` (Playwright y chrome-devtools-mcp la marcan) y la siembra `home:intro` que todos los bancos ya ponen; a mano `?preloader=no` | s78 §5: los bancos de `scripts-carga/` que abren /v3 salen sin él sin tocarlos | — |

## Las piezas

- `_lib/entrada.ts` (nuevo): la entrada del sitio. Cerrada mientras el preloader tapa: la carga del home no se abre (`carga.ts`) y el
  título de una página no llega. Las retenciones del scroll (lo que llega con la entrada).
- `_chrome/preloader/`: `decision.ts` (el script y las salidas), `linea.ts` (el reloj), `trazado.ts` (la flecha),
  `PreloaderDelSitio.tsx` (la cubierta del layout, el script y el bloqueo), `CapaDelPreloader.tsx` (perezosa: la secuencia),
  `FlechaDelSonido.tsx` (el SVG), `s78-preloader.invariant.tsx`.
- `_estilos/preloader.css`: la cubierta escondida salvo con la decisión (`--preloader-del-sitio` en el `<html>`), y su seguro sin
  hidratar (a los 20 s se esconde sola; con movimiento reducido también, con el `!important` como `carga.css`).
- Tocados: `layout.tsx` (la hoja y el montaje), `_lib/carga.ts` (la carga espera la entrada; la escena preparada),
  `escena/gpu/Precompilar.tsx` (avisa la escena preparada), `escena/intro/CaidaDelLogo.tsx` (retiene el scroll mientras cae),
  `_componentes/titulos3d/TituloDePagina.tsx` (espera la entrada y retiene el scroll hasta llegar), los padrones (`s3-archivos`,
  `s3-registro-de-tokens`, `s10-banco`) y `package.json`.

## Lo que reemplaza y lo que envuelve

- El intro viejo del home vivo (`IntroDelHome`, el de S8) sigue apagado en /v3 (`CON_PRELOADER = false` desde ESCENA 4). No se toca
  ni se usa; `PreloaderContext.tsx` tampoco (frozen).
- El velo de carga del home (`VeloDeCarga`) queda debajo: en la primera entrada del día lo tapa el preloader y su fundido ya no abre
  la carga hasta que la entrada se abre (el titular del hero y el logo caen a la vista, no debajo del blanco). En las otras entradas,
  todo como antes.

## Las salidas de las pruebas, y por qué no se activan por accidente en producción

1. `navigator.webdriver === true`: sólo un navegador automatizado (Playwright, Puppeteer, chrome-devtools-mcp). El mismo criterio del
   gate del intro viejo.
2. `sessionStorage['home:intro'] === '1'`: la siembra de todos los bancos. En /v3 nadie la escribe; en producción sólo la escribe el
   intro viejo del home vivo (`/`), en la misma pestaña (o sea: quien vio la presentación vieja en esa pestaña no ve la nueva). Se va con D8.
3. `?preloader=no`: hay que escribirlo.

Para verlo: el banco pone `window.__preloaderDelBanco = 'normal'` (o `'mostrar'`); a mano, `?preloader=si` (siempre, también en una
recarga). Los controles del banco: `window.__defectosDelPreloader` = `sin-freno`, `en-recargas` o `sin-bloqueo` (nunca la URL).

## Log

### La entrada y la escena que se prepara detrás
- `_lib/entrada.ts` nuevo. `carga.ts`: `abrirLaCarga` pide; la carga se abre con la entrada abierta (sin preloader, como siempre: s48
  sigue igual). `marcarLaEscenaPreparada` (la llama `Precompilar` después de calentar).
- `CaidaDelLogo`: retiene el scroll mientras cae (suelta al llegar y al desmontarse). `TituloDePagina`: con la entrada cerrada la
  presencia arranca en 0 y `leer` no la mueve; abierta, llega; retiene el scroll hasta `LLEGADA_DEL_TITULAR_S` después de abierta y
  armado. Las regex de s48, s49, s52 y s78-b12a sobre esos archivos siguen en verde.

### El preloader
- `_chrome/preloader/` y `_estilos/preloader.css`; el layout lo monta después de la marca de la llave (fijo, no suma alto: la REGLA DE
  ALTURAS no aplica). Padrones: s3 (la hoja y `--preloader-seguro`), s10 (`PIEZAS_MONTABLES`).
- La cubierta en el servidor es un `div` vacío y `aria-hidden` (s10 la ve así); la capa, perezosa, sólo la baja quien la ve. La hoja la
  esconde sola a los 20 s mientras la capa no pintó su primer cuadro (si su módulo no llega o la página no hidrata); desde ese cuadro la
  maneja la capa.
- Pruebas: `s78-preloader` (la decisión, la línea, la flecha) y `s78-preloader-entrada` (la entrada, el cableado, el arnés), partidas
  para que ningún archivo pase las 300 líneas de código (s8-montaje).

### Commits
- `aa734fd4` la entrada (`_lib/entrada.ts`, `carga.ts`, el logo, el título de una página, la escena preparada).
- `e0fe86ca` el preloader (`_chrome/preloader/`, la hoja, el layout, los padrones, las dos pruebas).
- el banco `scripts-carga/preloader.ts` y este archivo.

### Verificación sin navegador
- `tsc --noEmit`: 0. ESLint de lo tocado: limpio.
- s78 (b12a, t0, preloader, preloader-entrada): 0 fallas. s3: sólo `s3-peso` (pide el build, base). s10: 0 fallas. s48, s49, s52, s34,
  s74, s75: 0 fallas. s8: `s8-tres` y `s8-peso` piden el build (base); `s8-montaje` con las 6 de la base (archivos de más de 300 líneas
  que no son de esta tarea). s47: 1 falla de la base (el control del recorte de Trabajos, que cambió B1.2e en
  `EscenarioDelPortfolio.tsx`, no tocado acá).

## Qué mirar (el orquestador, en el navegador)

1. `http://localhost:3000/v3?preloader=si` a 1440: negro, «Bienvenido a una nueva experiencia.» entra lento, se queda y se va; el blanco
   con un fundido; «Recomendamos activar el sonido.» sin subrayado; la flecha punteada sale de debajo de la frase, hace un rizo y termina
   en el botón del sonido (arriba a la izquierda) sin dibujarlo; el blanco se va y el botón está donde apuntó; el titular del hero y el
   logo caen recién ahí; la rueda no mueve la página hasta que el logo llega (~2,4 s). Total 5–6 s.
2. Lo mismo a 1024x768 y a 390x844 (la punta en el disco de la cabecera).
3. `http://localhost:3000/v3/pagina-base?preloader=si` a 1440: igual, y el título 3D de la página llega después del blanco; el scroll,
   suelto cuando terminó de llegar.
4. Tocar la frase: «Sonido activado» arriba; la página entra con el sonido prendido (el botón con las ondas) y la llegada suave.
5. Recargar (F5): sin preloader, ni un cuadro. Otra pestaña con `/v3` el mismo día (sin la bandera): tampoco.
6. Con «reducir movimiento» del sistema: ~1 s, sin fundidos largos ni pulso.
7. El banco: `BASE=http://localhost:3000 npx tsx scripts-carga/preloader.ts` (los tres anchos, el home y la página base, la recarga, el
   mismo día, la reducida, la frase, los tirones con y sin preloader). Controles: `CONTROL=en-recargas` y `CONTROL=sin-bloqueo` tienen
   que dar FALLA; `LENTO=6` muestra el freno y el pulso, y con `LENTO=6 CONTROL=sin-freno` tiene que dar FALLA en el freno.
8. Que los bancos de siempre no lo vean: cualquiera de `scripts-carga/` (por ejemplo `intro.ts`) sin cambios; bajo Playwright,
   `navigator.webdriver` tiene que dar `true` en la página.
