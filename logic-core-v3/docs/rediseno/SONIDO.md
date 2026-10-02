# El sonido de /v3 — fuentes y licencias

> [3D Y SONIDO] T2. Con bandera, **apagado en el producto** hasta que Valentino lo escuche: el sitio con sonido es
> `/v3?pruebas=sonido=si` (aparece el parlante al lado del infinito) y la página de prueba, `/v3?sonidos=1` (un botón y
> un volumen por sonido). El estado del sprint, en `ESTADO-INTERFAZ.md` §7.

## Licencias

| Qué | Licencia | Notas |
|---|---|---|
| **howler.js** 2.2.4 (`node_modules/howler`) | MIT | La biblioteca de audio; se descarga recién al prender el sonido (un `import()`). |
| **@types/howler** 2.2.13 | MIT | Sólo tipos (desarrollo). |
| **Los once sonidos** (`public/v3/sonido/sonidos.webm` y `.m4a`) | **CC0 1.0** (dominio público) | **Generados en este repo**, no descargados: síntesis propia en `scripts-3d-sonido/t2-sonidos.ts`. Nadie más tiene derechos sobre ellos; se dedican al dominio público con CC0. |

No se descargó ningún sonido de terceros: así no hay licencia ajena que seguir ni atribución que mantener. Si un día
se reemplaza alguno por uno descargado, va con su fuente (URL), su autor y su licencia en esta tabla, y sólo si la
licencia permite el uso comercial sin atribución (CC0) o con una atribución que el sitio pueda cumplir.

## Cómo se generan

`npx tsx scripts-3d-sonido/t2-sonidos.ts` — síntesis fuera de línea en Node (lo mismo que un `OfflineAudioContext`, sin
navegador y determinista: el ruido lleva semilla): osciladores con la fase integrada, ruido blanco, rosa (Paul Kellet) y
marrón, filtros de dos polos (el «Audio EQ Cookbook» de R. Bristow-Johnson) y envolventes. Escribe UN sprite mono a
48 kHz en Opus (32 kbit/s, WebM: Chrome, Firefox, Edge) y en AAC (40 kbit/s, M4A: Safari), y sus cortes en
`src/app/v3/_lib/sonido/sprite.ts`. Pesos: **124 KB** en Opus y **151 KB** en AAC (el pedido: menos de ~200 KB).
Volver a correrlo da los mismos archivos.

## Los sonidos

| Sonido | Dónde suena | Cómo está hecho | Duración |
|---|---|---|---|
| `tic` | El hover de la barra (un ítem nuevo bajo el puntero o el foco) | Un seno de 3,1 kHz con caída de 6 ms y un golpecito de ruido agudo | 60 ms |
| `clic` | Cualquier enlace o botón (un solo oyente, delegado) | Un «toc»: un seno que baja de 1,4 kHz a 700 Hz en 12 ms y un golpe de ruido filtrado en 2,4 kHz | 100 ms |
| `abre` · `cierra` | El Genie del menú del teléfono y el de las demos | Aire (ruido rosa) por un filtro que barre de 350 Hz a 2,6 kHz al abrir y al revés al cerrar, en los 560 ms del Genie (`MS_DEL_GENIE`), con un cuerpo de seno que sube (o baja) una octava; al cerrar, un apoyo grave al llegar al botón | 720 ms |
| `pulso` | El principal del pulso del logo (lo larga el hover del logo o un CTA; no el periódico) | Un golpe grave: un seno que cae de 78 a 44 Hz con un armónico (para que exista en un parlante chico), casi imperceptible | 900 ms |
| `encendido` | El haz que se enciende al caer la noche | Un zumbido eléctrico (100 Hz y armónicos, la red de 50 Hz rectificada) que sigue EXACTAMENTE al guion de la escena (`entorno/encendido.ts`: los cuatro intentos que fallan, con un chisporroteo al arrancar cada uno), el golpe del encendido en el mismo instante (1,94 s) y el zumbido firme que se apaga solo | 4,5 s |
| `amanecer` | El amanecer, cuando arranca de a poco (no si salta) | Un acorde (La mayor) que crece desde nada y se abre con un filtro que sube como el día; cada nota con un par apenas desafinado | 5,2 s |
| `tunel` | Entrar al túnel de Trabajos (de cualquier lado) | Un soplido: aire por un filtro que se abre y se cierra, con un silbido tenue | 1,4 s |
| `foto` | El hover de las fotos del equipo (el mouse que entra, el foco del teclado o el toque que la abre) | Un roce: ruido agudo granulado | 170 ms |
| `dia` · `noche` | El ambiente (bucles), muy bajo, repartido por la noche que se ve; sin él con movimiento reducido o con la pestaña oculta | Día: aire claro (rosa entre 300 Hz y 2,2 kHz) que respira, con un brillo apenas. Noche: un grave hondo (marrón bajo 250 Hz) y un zumbido de 55 Hz con su quinta. Bucles sin costura (la cola fundida en la cabeza) | 6 s cada uno |

## Las reglas (del pedido)

- **Apagado por defecto**; el parlante lo prende y la elección se recuerda (`localStorage`, siempre con try/catch).
- **Nada suena sin una acción.** Prenderlo es un clic; si quedó prendido de otra visita, howler y el archivo se
  descargan recién con la primera acción en la página (un toque o una tecla).
- **Bajo y corto**: el volumen general es 0,7 y cada sonido tiene el suyo (`_lib/sonido/catalogo.ts`; el ambiente,
  0,05–0,06). La página de prueba los mueve y los guarda en el navegador; el sitio usa esos.
- **Un solo sprite, con carga diferida.**
- **Con movimiento reducido, sin ambiente.**
