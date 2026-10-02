# El sonido de /v3 — fuentes y licencias

> [3D Y SONIDO] T2: con bandera y apagado en el producto. **[RETOQUE 3D] Al producto**: el parlante está siempre (al lado
> del infinito), **apagado por defecto**; la bandera `?pruebas=sonido=si` se borró. Los volúmenes son los finales de
> Valentino. Se fueron el túnel, el amanecer y los dos ambientes de día y de noche. Nuevos, con candidatos para elegir de
> oído en la página de prueba, `/v3?sonidos=1`: el clic de la barra (cuatro), el clic de los CTA (cuatro) y UN ambiente
> para toda la página (tres). Lo que se elige ahí (y los volúmenes) queda guardado en el navegador y es lo que suena en
> el sitio; de fábrica, el `a` de cada uno. El estado, en `ESTADO-INTERFAZ.md` §7.

## Licencias

| Qué | Licencia | Notas |
|---|---|---|
| **howler.js** 2.2.4 (`node_modules/howler`) | MIT | La biblioteca de audio; se descarga recién al prender el sonido (un `import()`). |
| **@types/howler** 2.2.13 | MIT | Sólo tipos (desarrollo). |
| **Los sonidos del sprite** (`public/v3/sonido/sonidos.webm` y `.m4a`) | **CC0 1.0** (dominio público) | **Generados en este repo**, no descargados: síntesis propia en `scripts-retoque/sonidos.ts`. Nadie más tiene derechos sobre ellos; se dedican al dominio público con CC0. |
| **Los tres ambientes** (`public/v3/sonido/ambiente-{a,b,c}.webm` y `.m4a`) | **CC0 1.0** (dominio público) | **Generados en este repo** (el mismo archivo): compuestos y sintetizados acá, inspirados en el clima del de nk.studio pero sin copiar nada de él (ni notas, ni muestras, ni la grabación). |

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
  **59 KB** y **61 KB**.
- **Los tres ambientes**, cada uno en su archivo, en estéreo, en Opus (48 kbit/s) y AAC (64 kbit/s): entre **200 y
  264 KB** cada uno (el pedido: hasta ~500 KB). Se descarga sólo el elegido, recién la primera vez que tiene que sonar.
- Los cortes, en `src/app/v3/_lib/sonido/sprite.ts`.

Volver a correrlo da los mismos archivos.

### Cómo empalma el ambiente sin corte

Cada bucle dura 24 s exactos (múltiplo del cuadro de Opus, 20 ms, y de los compases de los tres). Se arma en un búfer más
largo: cada nota con su caída, el retardo y la reverb con su cola; después, lo que pasa del final se suma al principio
(lo que una vuelta le deja a la siguiente), así el principio ya trae las colas del final. Lo que se mueve (el filtro que
se abre en `b`) lo hace con el período del bucle. En el archivo va con un colchón (su final antes y su principio
después) y howler lo toca entre sus cortes: el relleno del decodificador cae afuera. Medido sobre el WAV: el salto en la
costura es menor que la diferencia normal entre dos muestras seguidas (0,002–0,010 contra 0,018–0,066).

## Los sonidos

| Sonido | Dónde suena | Cómo está hecho | Duración | Volumen |
|---|---|---|---|---|
| `tic` | El hover de la barra (un ítem nuevo bajo el puntero o el foco; la esquina) y **el hover de los CTA** (el mismo) | Un seno de 3,1 kHz con caída de 6 ms y un golpecito de ruido agudo | 60 ms | 0,1 |
| `clic` | Los demás enlaces y botones (un solo oyente, delegado) | Un «toc»: un seno que baja de 1,4 kHz a 700 Hz en 12 ms y un golpe de ruido filtrado en 2,4 kHz | 100 ms | 0,22 |
| `abre` · `cierra` | El Genie del menú del teléfono y el de las demos | Aire (ruido rosa) por un filtro que barre de 350 Hz a 2,6 kHz al abrir y al revés al cerrar, en los 560 ms del Genie, con un cuerpo de seno; al cerrar, un apoyo grave | 720 ms | 0,1 |
| `pulso` | El principal del pulso del logo | Un golpe grave: un seno que cae de 78 a 44 Hz con un armónico | 900 ms | 1 |
| `encendido` | El haz que se enciende al caer la noche | Un zumbido eléctrico (100 Hz y armónicos) que sigue al guion de la escena (los intentos que fallan, el golpe a los 1,94 s, el zumbido firme) | 4,5 s | 0,2 |
| `foto` | El hover de las fotos del equipo (el mouse, el foco, el toque) | Un roce: ruido agudo granulado | 170 ms | 0,1 |
| `barra-a` · `barra-b` · `barra-c` · `barra-d` | **El clic de la barra** (la pastilla, la esquina y el menú del teléfono): suena el elegido | a: tecla de madera (ruido en una banda de 1,25 kHz con un cuerpo grave). b: burbuja (un seno que sube de 520 a 1.150 Hz en 45 ms). c: cristal (una campanita de FM en 1,76 kHz). d: pestillo (dos golpes a 18 ms, el segundo más grave) | 80–160 ms | 0,15 |
| `cta-a` · `cta-b` · `cta-c` · `cta-d` | **El clic de los CTA** (los del sistema, la ventana del final del túnel, «Clickeá acá», los de Servicios): suena el elegido | a: confirmación (dos notas que suben, mi y si). b: golpe de fieltro (un grave que cae de 150 a 95 Hz). c: destello (tres campanitas que suben: do, mi, sol). d: tecla grave (un «bonk» de 220 Hz filtrado) | 220–340 ms | 0,18 |

Se borraron: `tunel` (el soplido del túnel), `amanecer` (el crescendo) y `dia` · `noche` (los dos ambientes).

## El ambiente (uno para toda la página)

| Candidato | Qué es | Archivo |
|---|---|---|
| `a` · Cristales | 80 BPM, ocho compases. Un arpegio de campanitas de FM en corcheas sobre un colchón cálido (la m9 → fa maj9 → do maj9 → sol6, dos compases cada uno) y la fundamental abajo; el retardo de ida y vuelta abre el estéreo y la reverb lo lleva lejos. El más cercano al clima del de nk: melódico y quieto, con algo que se mueve siempre | `ambiente-a` |
| `b` · Datos | 120 BPM, doce compases. Pellizcos en semicorcheas (pentatónica de re menor) que cambian de fundamental cada cuatro compases (re, si bemol, fa), con un filtro que se abre y se cierra con el bucle; un pulso grave muy bajo en cada negra y un tic de ruido en las semicorcheas. El más tecnológico | `ambiente-b` |
| `c` · Niebla | 60 BPM, seis compases. Colchones largos (re maj9 → si m9 → sol maj9) y una melodía de vidrio espaciada, con un retardo largo y mucha sala. El más tranquilo | `ambiente-c` |

Suena muy bajo (0,2 por el general), entra y se va con un fundido de 1,2 s, y no suena con movimiento reducido ni con la
pestaña oculta. No cambia con el día y la noche.

## Las reglas (del pedido)

- **Apagado por defecto**; el parlante lo prende y la elección se recuerda (`localStorage`, siempre con try/catch).
- **Nada suena sin una acción.** Prenderlo es un clic; si quedó prendido de otra visita, howler y los archivos se
  descargan recién con la primera acción en la página (un toque o una tecla).
- **Bajo y corto**: el volumen general es 0,7 y cada sonido tiene el suyo (`_lib/sonido/catalogo.ts`). La página de
  prueba los mueve y los guarda en el navegador; el sitio usa esos.
- **Un sprite con carga diferida, y el ambiente en su archivo** (también diferido: sólo el elegido, cuando suena).
- **Con movimiento reducido, sin ambiente.**
