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
