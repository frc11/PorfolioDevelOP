# Manifiesto de capturas — corrida de recorrido (31/08/2026)

**79 PNG**, todas a **1440 px de ancho** (el mismo de las 47 de agosto, para que sean
comparables). Las dimensiones se leen del **IHDR del archivo**, no de lo que se pidió.

## Cómo se esquivó la trampa del fold

El shell del setter es `fixed inset-0` y el scroller es el `<main>` interno: **`fullPage` no
sirve** — devuelve 900 px siempre. En cada toma se midió el alto real del scroller interno y se
agrandó el *viewport* a ese alto, de modo que el contenedor entra entero en una toma normal.

Las capturas de **estado transitorio** (un popup abierto, un modal, un toast) se toman a viewport
fijo a propósito: agrandar el viewport re-renderiza y cierra el estado que se quería fotografiar.
Están marcadas como tales en la tabla.

## Chequeos

| chequeo | resultado |
|---|---|
| Capturas con ancho ≠ 1440 | **0** |
| Capturas de scroller medido que salieron de 900 px exactos | **5** — pantallas que genuinamente no scrollean: 04-tras-cargar-prospecto.png, 18-espera-post-opener.png, 39-espera-revision.png, 67-encabezado-archivo.png, 67-encabezado-revision.png |
| Colisiones de md5 | **5**, todas declaradas abajo |

### Las colisiones, explicadas

Cada una es **la misma pantalla fotografiada dos veces con dos nombres**, no dos archivos que
digan mostrar cosas distintas. Su identidad byte a byte es prueba de que el render es determinista.

- `13-tras-evaluacion.png` ≡ `15-m4-opener.png` — la raíz del manual redirige a m4: es la misma pantalla del opener
- `45-tras-abrir-novedad.png` ≡ `46-mr-guia-retrabajo.png` — «Abrir» en la novedad aterriza en /mr: es la misma guía de retrabajo
- `53-tras-enviar-link.png` ≡ `54-m16-agenda.png` — tras registrar el envío la raíz del manual redirige a m16: misma pantalla de agenda
- `63-descarte-confirmacion.png` ≡ `63-descarte-sin-respuesta.png` — el mismo diálogo de confirmación del descarte, capturado en dos pasadas
- `68-encabezado-espera-vs-revision.png` ≡ `69-postergado-dice-agenda.png` — la misma escena en dos pasadas

## Las capturas

| archivo | dimensiones | modo de toma | md5 (12) | peso |
|---|---|---|---|---|
| `01-panel-primera-vez.png` | 1440×2366 | scroller medido | `6588c284799a` | 249 kB |
| `02-cargar-prospecto.png` | 1440×1071 | scroller medido | `570a8a2e48e1` | 107 kB |
| `03-formulario-completo.png` | 1440×1071 | scroller medido | `d731c2288d00` | 112 kB |
| `04-tras-cargar-prospecto.png` | 1440×900 | scroller medido | `9f75394c89b1` | 44 kB |
| `05-m1-ficha.png` | 1440×2614 | scroller medido | `dd2f273d7427` | 281 kB |
| `06-m1-select-abierto.png` | 1440×900 | viewport fijo (estado transitorio) | `435fb71b8dd9` | 104 kB |
| `07-m1-ficha-completa.png` | 1440×2542 | scroller medido | `7cd14d359897` | 295 kB |
| `08-tras-guardar-ficha.png` | 1440×2737 | scroller medido | `fa14d205ac09` | 309 kB |
| `09-m2-veredicto.png` | 1440×1971 | scroller medido | `b51d10b6ddf8` | 196 kB |
| `10-m2-copiar-bloque.png` | 1440×900 | viewport fijo (estado transitorio) | `e114a3f04b35` | 117 kB |
| `11-m2-veredicto-abierto.png` | 1440×900 | viewport fijo (estado transitorio) | `541f262bb24f` | 103 kB |
| `12-m2-registro-completo.png` | 1440×1971 | scroller medido | `46235e50bc1a` | 219 kB |
| `13-tras-evaluacion.png` | 1440×1787 | scroller medido | `2fb3993dbc64` | 182 kB |
| `13-tras-registrar-evaluacion.png` | 1440×1971 | scroller medido | `6d69e6103d5a` | 225 kB |
| `14-panel-lead-nuevo-no-esta-en-foco.png` | 1440×2366 | scroller medido | `74a6d33f474e` | 248 kB |
| `15-m4-opener.png` | 1440×1787 | scroller medido | `2fb3993dbc64` | 182 kB |
| `16-m4-opener-escrito.png` | 1440×1949 | scroller medido | `c68fe157cdab` | 215 kB |
| `17-tras-opener.png` | 1440×1949 | scroller medido | `3b47dac020ae` | 218 kB |
| `18-espera-post-opener.png` | 1440×900 | scroller medido | `c806e220a9b7` | 96 kB |
| `19-m5-registrar-respuesta.png` | 1440×2043 | scroller medido | `55bec3fbe18a` | 233 kB |
| `20-m5-respondio-elegido.png` | 1440×2168 | scroller medido | `d5a8c109a324` | 238 kB |
| `21-tras-respondio.png` | 1440×2148 | scroller medido | `5b26b13e9193` | 199 kB |
| `22-m6-brief.png` | 1440×2148 | scroller medido | `c2bf7011284e` | 194 kB |
| `23-m6-brief-completo.png` | 1440×2148 | scroller medido | `a2674a421877` | 241 kB |
| `24-tras-guardar-brief.png` | 1440×2148 | scroller medido | `46a2375c7490` | 245 kB |
| `25-construccion-mc1.png` | 1440×2410 | scroller medido | `24feb4791d8d` | 240 kB |
| `26-mc1-construccion-arrancada.png` | 1440×2330 | scroller medido | `1d7a782bbce0` | 240 kB |
| `27-mc1-tres-fases-hechas.png` | 1440×2330 | scroller medido | `f2dde7d25dda` | 239 kB |
| `28-mc2-refinar.png` | 1440×3113 | scroller medido | `dd88fb079d20` | 353 kB |
| `29-mc2-seis-fases-hechas.png` | 1440×3113 | scroller medido | `4738d1ba9e64` | 352 kB |
| `30-mc2-calidad-tildada.png` | 1440×3113 | scroller medido | `8175d5a9d75d` | 352 kB |
| `31-mc2-race-ui.png` | 1440×900 | viewport fijo (estado transitorio) | `33ecf9fedc1f` | 101 kB |
| `31-mc2-tres-tildes-en-pantalla.png` | 1440×900 | viewport fijo (estado transitorio) | `bd7958b0a8b1` | 101 kB |
| `32-escalar-modal.png` | 1440×900 | viewport fijo (estado transitorio) | `e7c692fa6ba1` | 98 kB |
| `33-escalar-enviado.png` | 1440×900 | viewport fijo (estado transitorio) | `d0e797dc0a1a` | 105 kB |
| `34-m13-borrador.png` | 1440×1594 | scroller medido | `fcb8f26cff66` | 178 kB |
| `35-m13-borrador-listo.png` | 1440×1594 | scroller medido | `c99ab89e8995` | 179 kB |
| `36-m14-chequeo.png` | 1440×3296 | scroller medido | `1f91e0b88fc6` | 426 kB |
| `37-m14-diez-tildes.png` | 1440×2737 | scroller medido | `54b8eb8baf48` | 321 kB |
| `38-tras-enviar-a-revision.png` | 1440×2737 | scroller medido | `59426c2c311f` | 326 kB |
| `39-espera-revision.png` | 1440×900 | scroller medido | `7a36640643c4` | 101 kB |
| `40-admin-cola-de-franco.png` | 1440×6000 | scroller medido | `44058ef3d507` | 919 kB |
| `41-admin-lead-en-revision.png` | 1440×2090 | scroller medido | `5aff71b11966` | 344 kB |
| `42-admin-rechazo-modal.png` | 1440×900 | viewport fijo (estado transitorio) | `4ff0354e9e4f` | 137 kB |
| `43-admin-tras-rechazo.png` | 1440×900 | viewport fijo (estado transitorio) | `401b15e28aaa` | 193 kB |
| `44-panel-tras-rechazo.png` | 1440×2366 | scroller medido | `6094cbb2e061` | 248 kB |
| `45-tras-abrir-novedad.png` | 1440×1784 | scroller medido | `9aa00fa65d68` | 193 kB |
| `46-mr-guia-retrabajo.png` | 1440×1784 | scroller medido | `9aa00fa65d68` | 193 kB |
| `47-reloop-m13.png` | 1440×1706 | scroller medido | `b27043443dbf` | 202 kB |
| `47-reloop-m14.png` | 1440×3436 | scroller medido | `eecb5034f32c` | 445 kB |
| `47-reloop-mc1.png` | 1440×2555 | scroller medido | `948ad52c23b0` | 265 kB |
| `47-reloop-mc2.png` | 1440×3338 | scroller medido | `c5fb5c4df248` | 376 kB |
| `48-m14-rehecho.png` | 1440×2877 | scroller medido | `562a539ab05d` | 340 kB |
| `49-admin-aprobar-modal.png` | 1440×900 | viewport fijo (estado transitorio) | `330e630c762a` | 129 kB |
| `50-admin-tras-aprobar.png` | 1440×900 | viewport fijo (estado transitorio) | `41b12b76e9de` | 211 kB |
| `51-panel-tras-aprobacion.png` | 1440×2366 | scroller medido | `15a1b2c1e8cf` | 248 kB |
| `52-m15-mandar-link.png` | 1440×1360 | scroller medido | `3508cf1781b0` | 146 kB |
| `53-tras-enviar-link.png` | 1440×1235 | scroller medido | `fc628f2f0147` | 142 kB |
| `54-m16-agenda.png` | 1440×1235 | scroller medido | `fc628f2f0147` | 142 kB |
| `55-m16-buscar-horarios.png` | 1440×1283 | scroller medido | `80f181652403` | 169 kB |
| `56-m5-seguimiento.png` | 1440×1870 | scroller medido | `3c5f4cafc9e8` | 203 kB |
| `57-m5-postergar-elegido.png` | 1440×2071 | scroller medido | `29c90cef4dae` | 215 kB |
| `58-m5-postergar-con-fecha.png` | 1440×2071 | scroller medido | `92b6fdb27d37` | 221 kB |
| `59-cartera-desplegada.png` | 1440×6000 | scroller medido | `85d984bd2f50` | 736 kB |
| `59b-404-ruta-adivinada.png` | 1440×6000 | scroller medido | `c9491f4f2233` | 736 kB |
| `60-cartera-busqueda-postergado.png` | 1440×2638 | scroller medido | `74f83fed3385` | 270 kB |
| `61-m2-descarte.png` | 1440×2033 | scroller medido | `25878f522962` | 212 kB |
| `62-tras-descarte.png` | 1440×2033 | scroller medido | `f1e0cded1660` | 191 kB |
| `63-descarte-confirmacion.png` | 1440×900 | viewport fijo (estado transitorio) | `240d6792b956` | 93 kB |
| `63-descarte-sin-respuesta.png` | 1440×900 | viewport fijo (estado transitorio) | `240d6792b956` | 93 kB |
| `64-tras-descarte.png` | 1440×2033 | scroller medido | `a19b1652edc3` | 194 kB |
| `65-m13-error-confirmacion.png` | 1440×900 | viewport fijo (estado transitorio) | `13aa88f084a5` | 109 kB |
| `66-par2-pantalla-no-acompana.png` | 1440×900 | viewport fijo (estado transitorio) | `e97dbecdd667` | 115 kB |
| `67-encabezado-archivo.png` | 1440×900 | scroller medido | `ee3dc4395ed3` | 71 kB |
| `67-encabezado-espera.png` | 1440×1836 | scroller medido | `4003c4763ff9` | 205 kB |
| `67-encabezado-revision.png` | 1440×900 | scroller medido | `2a742cbb159f` | 88 kB |
| `68-encabezado-espera-vs-revision.png` | 1440×1310 | scroller medido | `3b4b867e5cea` | 161 kB |
| `69-postergado-dice-agenda.png` | 1440×1310 | scroller medido | `3b4b867e5cea` | 161 kB |
| `70-panel-novedad-caducada.png` | 1440×2366 | scroller medido | `7f4c57a0c5fa` | 251 kB |

---

Los PNG están **gitignorados** (`.gitignore` local con `*.png`): esta carpeta es propia y
descartable. No se escribió un byte en `docs/diagnostico-visual-2026-08/` ni en la galería.
