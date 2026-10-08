# El sonido de /v3 — fuentes y licencias

> [3D Y SONIDO] T2: con bandera y apagado en el producto. **[RETOQUE 3D] Al producto**: el parlante está siempre (al lado
> del infinito), **apagado por defecto**; la bandera `?pruebas=sonido=si` se borró. Los volúmenes son los finales de
> Valentino. Se fueron el túnel, el amanecer y los dos ambientes de día y de noche. Nuevos, con candidatos para elegir de
> oído en la página de prueba, `/v3?sonidos=1`: el clic de la barra (cuatro), el clic de los CTA (cuatro) y UN ambiente
> para toda la página (tres). Lo que se elige ahí (y los volúmenes) queda guardado en el navegador y es lo que suena en
> el sitio; de fábrica, el `a` de cada uno. El estado, en `ESTADO-INTERFAZ.md` §7.
>
> **[CIERRE RETOQUE 3D]** S1 · el clic de la barra y el de los CTA son el mismo: el **pestillo** (era el candidato `d`
> de la barra); los otros siete candidatos de clic se borraron. S2 · ninguno de los tres bucles: el ambiente ahora es
> **generativo**, con Web Audio en tiempo real y sin archivo (`_lib/sonido/ambienteGenerativo.ts`): eventos sueltos y
> espaciados, con silencios largos y notas al azar dentro de una escala, para que nunca se repita igual. Tres para elegir
> en `/v3?sonidos=1` (Vidrio, Bruma, Gotas); de fábrica, `a`. Los bucles se borraron, código y archivos.
>
> **[RONDA 2] F6** · queda **Bruma**, de fábrica, al **0,5**; Vidrio y Gotas se borraron y ya no se elige nada (la página
> de prueba lo deja escuchar y moverle el volumen). La clave de los volúmenes en el navegador es nueva.

## Licencias

| Qué | Licencia | Notas |
|---|---|---|
| **howler.js** 2.2.4 (`node_modules/howler`) | MIT | La biblioteca de audio; se descarga recién al prender el sonido (un `import()`). |
| **@types/howler** 2.2.13 | MIT | Sólo tipos (desarrollo). |
| **Los sonidos del sprite** (`public/v3/sonido/sonidos.webm` y `.m4a`) | **CC0 1.0** (dominio público) | **Generados en este repo**, no descargados: síntesis propia en `scripts-retoque/sonidos.ts`. Nadie más tiene derechos sobre ellos; se dedican al dominio público con CC0. |
| **El ambiente generativo** (`src/app/v3/_lib/sonido/ambienteGenerativo.ts`) | Código propio del sitio | No hay archivo de audio: lo sintetiza el navegador en tiempo real (osciladores, filtros, una reverb de ruido armada en el momento). |

No se descargó ningún sonido de terceros: así no hay licencia ajena que seguir ni atribución que mantener. Si un día
se reemplaza alguno por uno descargado, va con su fuente (URL), su autor y su licencia en esta tabla, y sólo si la
licencia permite el uso comercial sin atribución (CC0) o con una atribución que el sitio pueda cumplir.

## Cómo se generan

`npx tsx scripts-retoque/sonidos.ts` (el de 3D Y SONIDO, `scripts-3d-sonido/t2-sonidos.ts`, queda como historia: escribía
el sprite de antes; no se vuelve a correr) — síntesis fuera de línea en Node (lo mismo que un `OfflineAudioContext`, sin
navegador y determinista: el ruido lleva semilla): osciladores con la fase integrada, FM, ruido blanco y rosa (Paul
Kellet), filtros de dos polos (el «Audio EQ Cookbook» de R. Bristow-Johnson), envolventes, un retardo de ida y vuelta y
una reverb de Schroeder. Escribe:

- **El sprite**, mono a 48 kHz, en Opus (32 kbit/s, WebM: Chrome, Firefox, Edge) y en AAC (40 kbit/s, M4A: Safari):
  **46 KB** y **45 KB** (9,9 s: los siete de siempre y el pestillo). [PULIDO 4] C2 · con el golpe del encastre (sus dos
  variantes): **64 KB** y **67 KB** (14,4 s).
- Los cortes, en `src/app/v3/_lib/sonido/sprite.ts`.
- [CIERRE RETOQUE 3D] Ya no escribe ambientes: el ambiente es generativo, en el navegador.

Volver a correrlo da los mismos archivos.

## Los sonidos

| Sonido | Dónde suena | Cómo está hecho | Duración | Volumen |
|---|---|---|---|---|
| `tic` | El hover de la barra (un ítem nuevo bajo el puntero o el foco; la esquina) y **el hover de los CTA** (el mismo) | Un seno de 3,1 kHz con caída de 6 ms y un golpecito de ruido agudo | 60 ms | 0,1 |
| `clic` | Los demás enlaces y botones (un solo oyente, delegado) | Un «toc»: un seno que baja de 1,4 kHz a 700 Hz en 12 ms y un golpe de ruido filtrado en 2,4 kHz | 100 ms | 0,22 |
| `abre` · `cierra` | El Genie del menú del teléfono y el de las demos | Aire (ruido rosa) por un filtro que barre de 350 Hz a 2,6 kHz al abrir y al revés al cerrar, en los 560 ms del Genie, con un cuerpo de seno; al cerrar, un apoyo grave | 720 ms | 0,1 |
| `pulso` | El principal del pulso del logo | Un golpe grave: un seno que cae de 78 a 44 Hz con un armónico | 900 ms | 1 |
| `encendido` | El haz que se enciende al caer la noche | Un zumbido eléctrico (100 Hz y armónicos) que sigue al guion de la escena (los intentos que fallan, el golpe a los 1,94 s, el zumbido firme) | 4,5 s | 0,2 |
| `foto` | El hover de las fotos del equipo (el mouse, el foco, el toque) | Un roce: ruido agudo granulado | 170 ms | 0,1 |
| `pestillo` | **El clic de la barra** (la pastilla, la esquina y el menú del teléfono) **y el de los CTA** (los del sistema, la ventana del final del túnel, «Clickeá acá», los de Servicios) | Dos golpes mecánicos a 18 ms (ruido en 3,4 kHz y en 1,7 kHz), el segundo más grave, con un cuerpo de 190 Hz: un cerrojo que encaja | 80 ms | 0,15 |
| `golpe-a` | [PULIDO 4] C2 · **El golpe del encastre**: en el instante en que el logo conecta y nace la súper onda (el mismo evento del código, `cuadroDelFinal.ts`); otra vez en el reinicio automático, nunca en el rebobinado. El de fábrica | El pulso más grave (un seno que cae de 62 a 34 Hz, más largo), un sub-golpe de 27 Hz debajo y el «toc» del contacto (ruido grave muy corto), con una saturación suave: ~6 dB más que el pulso (RMS), pico a −0,5 dB (−0,2 dB después de codificar: no satura) | 1,5 s | 1 |
| `golpe-b` | El mismo, con `?golpe=b` | `golpe-a` y una cola corta de la sala (una reverb de Schroeder: cuatro peines amortiguados y dos pasatodos, 0,9 s, húmeda al 30 %) | 2,4 s | 1 |

Se borraron: `tunel` (el soplido del túnel), `amanecer` (el crescendo), `dia` · `noche` (los dos ambientes) y
[CIERRE RETOQUE 3D] los otros siete candidatos de clic (`barra-a` a `barra-c`, `cta-a` a `cta-d`).

## El ambiente (uno para toda la página): generativo

Sin archivo y sin bucle: Web Audio en tiempo real, sobre el contexto de howler (que habilitó la acción de la persona) y
su volumen general. Cada tanto suena un evento (una nota, un acorde o una frase corta) y entre uno y otro pasan varios
segundos; de vez en cuando, un silencio largo. Las notas salen al azar de una escala, con su volumen, su paneo y su
duración al azar también: nunca se repite igual. Todo pasa por una sala (una reverb de ruido que decae, armada en el
momento) y, en dos de ellos, por un eco.

| Ambiente | Qué es | Entre eventos | Silencio largo |
|---|---|---|---|
| Bruma | Colchones de dos o tres notas (re dórico): tres triángulos apenas desafinados por un pasabajos, que entran en 2,5 a 4 s, quedan unos segundos y se van en 5 a 8 s, por una sala | 9 a 18 s | 30 %: 20 a 40 s |

[RONDA 2] F6: Vidrio (campanitas FM) y Gotas (punteos con eco) se borraron.

Suena bajo (0,5 del ambiente por el 0,7 general), entra y se va con un fundido de 1,6 s, y no suena con movimiento reducido ni con
la pestaña oculta (deja de programar notas). No cambia con el día y la noche.

## Las reglas (del pedido)

- **Apagado por defecto**; el parlante lo prende y la elección se recuerda (`localStorage`, siempre con try/catch).
- **Nada suena sin una acción.** Prenderlo es un clic; si quedó prendido de otra visita, howler y los archivos se
  descargan recién con la primera acción en la página (un toque o una tecla).
- **Bajo y corto**: el volumen general es 0,7 y cada sonido tiene el suyo (`_lib/sonido/catalogo.ts`). La página de
  prueba los mueve y los guarda en el navegador; el sitio usa esos.
- **Un sprite con carga diferida**; el ambiente no se descarga: se arma en el navegador recién cuando tiene que sonar.
- **Con movimiento reducido, sin ambiente.**
