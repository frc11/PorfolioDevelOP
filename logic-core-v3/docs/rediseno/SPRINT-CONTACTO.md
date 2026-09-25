# SPRINT CONTACTO Y NAVEGACIÓN — interfaz

Rama `rediseno/home` · dev 3000 · punto de retorno: tag `antes-de-contacto`.
Los viajes del navbar con sus destinos van en el sprint siguiente: acá los clicks del
navbar hacen lo que hacían, salvo «Contacto», que abre el formulario.

## Fase 0 — Leer y medir

- [x] **El navbar de v3 es propio**: `src/app/v3/_componentes/chrome/Navegacion.tsx` y
  `_estilos/navegacion.css`, montado por `_chrome/ChromeDelHome.tsx`. El sitio vivo no lo
  importa (nada fuera de `src/app/v3` lo toca), así que se cambia sin tocar lo compartido.
  Hoy: una pastilla que nace abajo y se pega arriba; oculta abajo de `medio` (860 px), donde
  no hay menú.
- [x] **Los CTA de contacto, hoy**: «Hablemos» de Trabajos → `#cierre` (derivado de la
  entrada «Contacto» de la navegación); «Hablanos» del final y el contacto del pie →
  `#contacto` (ancla que no existe); los «Quiero mi…» de Servicios son `<button>` sin
  acción; «Contacto» del navbar → `#cierre`.
- [x] **nk, medido a 1440** (`~/.cache/b4-medicion/contacto/nk/`):
  - Formulario: hoja blanca que entra desde la derecha, bordes redondeados del lado de
    adentro; título grande en tres renglones con el mail subrayado; tres preguntas
    numeradas («/ 1. What do you want to create?») en una columna angosta y los campos a la
    derecha; chips y campos píldora de 35 px de alto (radio 80 px, borde 1 px
    `rgb(223,224,221)`); cruz de 48 × 48 con radio 7 px; botón lleno con ícono; pie «All
    fields are required. Vague is totally fine.» y casilla de newsletter.
  - Fondo: `rgba(7,11,10,.3)` con `backdrop-filter: blur(24px)`; entra en 0,4 s con
    `cubic-bezier(.77,0,.175,1)` y 0,4 s de demora; la hoja, 0,7 s con la misma curva.
  - Navbar: una barra de 473 × 56 abajo al centro, **radio 10 px** (`--radius-fuerte`),
    fondo `rgba(7,11,10,.3)` con `blur(12px)`, 32 px de padding lateral.

## Fase 1 — El formulario de contacto

- [x] **Un módulo del chrome**, `_chrome/contacto/`: `contenido.ts` (copy, opciones y precarga),
  `enviarContacto.ts` (la única puerta del envío y su validación), `apertura.ts` (el estado y la
  delegación de clics), `CamposDelContacto.tsx` y `FormularioDeContacto.tsx`. Lo monta
  `ChromeDelHome` una sola vez.
- [x] **Se abre desde cualquier CTA de contacto**: todo `a[href="#contacto"]` (el «Hablanos»
  final, el contacto del pie, «Contacto» del navbar y el «Hablemos» de Trabajos, que deriva de
  esa entrada) y todo `[data-abre-contacto]` (los dos «Quiero mi…» de Servicios, con su
  servicio en `data-precarga`). Los componentes compartidos no cambiaron.
- [x] **Escritorio**: el navbar se esconde (CSS con `:has`, así vuelve recién cuando termina la
  salida), el sitio se oscurece y desenfoca, el scroll queda bloqueado y la hoja BAJA desde
  arriba: a todo el ancho con el contenido centrado, tope 90 svh con scroll interno y bordes de
  abajo redondeados. Curva de nk (`.77,0,.175,1`), 0,7 s la hoja y 0,4 s el velo.
- [x] **El costo del desenfoque, medido a 1440** sobre la escena: 75 cuadros por segundo con el
  formulario cerrado y 75 abierto. Se queda el desenfoque de panel (`--blur-panel`) con un
  oscurecido de tinta al 35 %.
- [x] **Cierre**: la cruz, Esc o un click en el velo; el foco vuelve al botón que lo abrió un
  cuadro después de la salida (antes, la trampa de foco lo retenía y quedaba en el `body`).
- [x] **Móvil**: sube desde abajo y ocupa la pantalla (`h-[100dvh]`); cada campo se lleva al
  centro con `scrollIntoView` al tomar el foco. Lo decide el modo del chrome (fase 4).
- [x] **El envío sin backend**: `enviarContacto(datos)` valida y abre `wa.me/5493814154708` con
  el mensaje armado; el botón dice «Enviar por WhatsApp» y después se lee «Te abrimos WhatsApp
  con el mensaje armado: sólo falta que lo mandes desde ahí.» Nunca un «enviado».
- [x] Invariantes: `s25-contacto` nuevo (27 afirmaciones, 5 controles): diálogo accesible con
  foco atrapado y devuelto y Esc, scroll bloqueado, precarga desde los tres «Quiero mi…» y el
  envío. `s8-chrome` y `s10-acceso` al día (y `s8-chrome` §4–5, que seguían con el pie de antes
  de FINAL 3).

## Fase 2 — El navbar de escritorio

- [x] **Forma**: rectángulo con el radio medido en nk, 10 px (`--radius-fuerte`), en lugar de la
  píldora. El fondo, el borde, el desenfoque y cómo nace abajo y se pega arriba no cambiaron.
- [x] **Estado activo** (PROPUESTA): sin punto azul (se fue el prefijo del enlace). El activo va
  en tinta plena y los demás al 60 % (`--opacity-casi`, ≈ 4,6:1 sobre la barra, AA calculado);
  una raya fina se desliza hasta el rótulo activo. El activo es la sección que cruza el medio
  del cuadro; el hero, Números y Tu panel no tienen ítem y dejan la barra sin activo.
- [x] Vive en `_chrome/NavegacionDelHome.tsx` (cliente): `Navegacion` sólo suma `activo` y la
  ranura de la raya, así los archivos del navbar original siguen sin una señal de scroll
  (`s3-navegacion` §5) y la galería de componentes no cambia.
- [x] **«Contacto» abre el formulario**: va a `#contacto`, que intercepta el contacto.
- Preexistente, anotado: `s3-foco` marca reglas de hover sin gemela de foco en el «libro» de las
  demos; el único CSS de este sprint es `navegacion.css`.
