# SPRINT DEMOS — la biblioteca viva

Lane DEMOS · `rediseno/home` · dev en 3000 · punto de retorno: tag `vacio-aprobado` (a47239e7).
Cada fase cierra con un commit `wip(demos): fase N — …`.

## Fase 0 — reconocimiento

- [x] **El sistema de demos en vivo.** `src/components/sections/web-development/WebTemplatesImmersive.tsx`
      (610 líneas), montado por `src/app/web-development/page.tsx:257` → **lo comparte el sitio vivo**
      (`main` tiene el mismo archivo). No se toca.
  - La lista es `TEMPLATES`, una constante **no exportada** del archivo. Son **6, no 8**, en todas las
    ramas (`main`, `redesign/home`, `rediseno/home`, `origin/main`):
    | slug | nombre | rubro (tagline) | URL |
    |---|---|---|---|
    | zero | Zero Protocol | Tech / High contrast terminal | https://template-zero.netlify.app/ |
    | ethereal | The Ethereal Resort | Hospitality / Premium calm | https://template-ethernal.netlify.app/ |
    | noir | Noir Dining in the Void | Gastronomia / Dark immersive | https://template-noir.netlify.app/ |
    | skyline | Skyline Estates | Real estate / Clean modern | https://template-skyline.netlify.app/ |
    | bold | NEXO Bold | Agency / Brutalist creative | https://template-bold.netlify.app/ |
    | nebula | YAKU Nebula | SaaS / Neon performance | https://template-nebula.netlify.app/ |
  - **Portada:** pide `/assets/templates/chatgpt/<slug>/mid.webp`, que **no existe en ningún worktree**;
    cae a `image.thum.io` (captura remota) y después a `/images/showcase/case-default.svg`.
  - **Cómo renderiza el preview:** `<iframe src={url}>` de **otro origen** (`*.netlify.app`), con
    `pointer-events-none`, escalado y tapado por degradés. No es un componente reusable: es una
    sección entera con su propio scroll-snap.
  - Consecuencia: la lista no se puede importar sin modificar el archivo. La biblioteca lleva su
    propio catálogo en `demos/catalogo.ts` y **un invariante lo ata al del sitio vivo** (nombre y URL
    leídos del fuente), así la copia no puede envejecer sola.
- [x] **La ventana del CTA:** `VentanaDelCta` en `_secciones/trabajos/piezas.tsx:297` (cromo:
      `bg-semaforo-rojo/amarillo/verde`, barra `border-fondo rounded-sutil` con `font-codigo`). La
      mueve `CapaDelTunel.tsx`. El tipeo de la frase es un recorte por palabra + un cursor
      posicionado (`letrasEscritas`, `cabezaDelTipeo` en `tunel.ts`; titileo en `_estilos/tipeo.css`).
- [x] **El navbar:** `_componentes/chrome/Navegacion.tsx` + `_estilos/navegacion.css:160`. La pastilla:
      `border: var(--border-hairline) solid var(--color-borde)` · `border-radius: var(--radius-pastilla-l)` ·
      `background-color: var(--color-superficie-translucida)` · `backdrop-filter: blur(var(--blur-panel))` ·
      `box-shadow: var(--shadow-flotante)` · alto `--nav-alto` = `2 × --spacing-3 + cuerpo × leading-texto` ·
      `padding-inline: var(--spacing-4)` · rótulo `text-cuerpo tracking-texto leading-texto font-semi` en tinta.
- [x] **La capa del vacío:** `CapaDelTunel.tsx` pinta `recorteDelVacio(fraccionDelVacio(...))` sobre
      `data-pieza="tunel"` dentro de `pintar()`. La capa de demos entra en `Trabajos.tsx` como hermana
      de `CapaDelTunel` y lee la MISMA fracción desde `mostrado`, que el túnel ya publica. (Plan
      original: hermana anterior; quedó POSTERIOR con z negativo, porque `s10-acceso` exige que las
      demos se lean después del CTA en las dos ramas. `CapaDelTunel.tsx` no se tocó.)
- [x] **Otras restricciones encontradas:**
  - `ScrollSuaveDeV3.tsx` afirma que **nunca llama `lenis.stop()`** (la clase `lenis-stopped` cuelga un
    `overflow: clip` del `<html>`), y la instancia no se publica. La pausa del scroll se hace con
    `data-lenis-prevent` en el diálogo (Lenis ignora esa rueda) + `overflow: hidden` en el `<html>`
    mientras está abierto (la barra ya está oculta en `globals.css:476`, así que no corre el layout).
  - Abajo de 1025 **y con movimiento reducido** se monta la rama quieta (`CompuertaDelHome`).

## Fase 1 — el CTA se entiende como apretable (commit b4ae3f6c)
- [x] «Hablemos» un renglón más abajo (`pt-12`), a `--text-titulo-m`: más grande que un cuerpo y más chico que la frase
- [x] «Hablemos» es el `CtaEnlace` del sitio con su rollover, SIN modificar el componente. Dos
      redefiniciones en su caja: `--text-cuerpo → --text-titulo-m` y `--color-tinta → --color-fondo`
      (el CTA pinta siempre en tinta, y adentro de la ventana el papel es la tinta de la sala)
- [x] «(un clic y arrancamos)» en `Micro` mono, al lado; también en la rama quieta (paridad de `s10-acceso`)
- [x] hover/foco de la ventana: sube `--spacing-2` con la sombra flotante y se tipea «/hablemos» con
      `cabezaDelTipeo` (el mecanismo de la frase, con reloj de tiempo); al salir se borra (`encimaDelCta.ts`)
- [x] la ventana entera sigue siendo el enlace: el `::after` del `CtaEnlace` se estira sobre ella. §16: siete
      anclas, las siete paradas, destinos legítimos — en verde

## Fase 2 — la entrada (commit e343103e, junto con 3 y 4: el código depende entre sí)
- [x] `CapaDeDemos` escala = la fracción del vacío (`entrada.ts`, sin ley nueva), leída de `mostrado`
- [x] va DESPUÉS del túnel en el marcado (orden de lectura, `s10-acceso`) y se pinta DEBAJO con z negativo
- [x] fija con el cuadro lleno (pin); se va con la sección
- [x] medido a 1440: 0,224 / 0,482 / 0,740 / 1 en px 4100 / 4350 / 4600 / 4860, igual a la fracción del vacío
- [x] ⚠️ encontrado y arreglado: con `will-change` en la capa o en las caras, el túnel se componía encima y
      el vacío dejaba de cortar el fondo de la ventana del CTA (el agujero se veía claro). Sin `will-change`, bien
- [x] superposición contra la referencia (ver fase 6): dentro de 1 px

## Fase 3 — la biblioteca y el hover
- [x] logo a la izquierda (columna vacía), título + párrafo + estante a la derecha
- [x] seis piezas con su portada REAL (capturas de los templates, `public/demos/`, `scripts-b4/demos-portadas.ts`)
- [x] hover CSS: la cara sube con resorte crítico (`linear()`), las vecinas se abren, bajada 100 ms
- [x] cartel en portal con la pastilla del navbar token por token; medido: el nombre correcto en las seis
- [x] teclado: piezas focalizables (anclas), foco levanta igual, flechas recorren, Enter abre
- [x] precarga por intención: 150 ms, un solo `<link rel=prefetch>` que cambia de destino

## Fase 4 — abrir, usar y cerrar
- [x] la biblioteca retrocede (`data-alejada`) y el velo del CTA (el mismo `bg-fondo` de la sala a `VELO_DEL_CTA`)
- [x] la ventana nace con la caja de la pieza; líquido 180 ms (feTurbulence + feDisplacementMap, sólo chica)
      → sólido 450 ms con resorte crítico. Medido sin fotos: 69 cuadros, media 13,5 ms, peor 27 ms (el del
      montaje). El filtro NO cuesta: se queda
- [x] 16:10 (la del CTA), 80 % del ancho o 82 % del alto; cromo del CTA + URL real (enlace) + cruz; el rojo cierra
- [x] la rueda scrollea la demo y la página no se mueve (medido: 9573 → 9573 con 12 muescas)
- [x] clic adentro → pestaña nueva (medido 2 → 3). La capa transparente NO sirve: la rueda no atraviesa a
      un iframe de otro origen. Se detecta el clic por el foco que se va al iframe
- [x] esqueleto con forma de página en los tonos de la sala; el iframe aparece recién cargado y asentado
- [x] una sola viva; al cerrar se desmonta (medido: 0 iframes)
- [x] cierre (cruz, rojo, Esc, afuera) por la misma línea al revés; foco devuelto (medido con Esc y con el rojo)
- [x] diálogo modal con foco atrapado; movimiento reducido: fundido + escala 0,96

## Fase 5 — móvil y tablet
- [x] título, texto y cinta CSS (pista doble, media vuelta); quieta y deslizable con movimiento reducido
- [x] tocar una portada abre el template en otra pestaña
- [x] capturas a 375 y 768: la pista corre ~25 px/s en las dos; a sangre, sobre la noche de la escena
- [x] ⚠️ probado y revertido: un `bg-fondo` propio en el bloque. El papel que se veía detrás era la noche
      sin disparar (el banco saltaba); con fondo propio quedaba una costura contra la escena

## Fase 6 — verificación y reporte
- [x] lint + `tsc --noEmit`
- [x] s5-trabajos (301), s7-arboles, s7-contrato, s10-acceso, s21-llave en verde, y s5/s3 tokens, código, compacto
- [x] invariantes nuevos con control positivo (§25, `demos/demos-invariante.tsx`)
- [x] superposición del túnel dentro de 1 px: corrida 1 con UNA muestra afuera (yRef 1700, sólo la caja
      medida, las tres capturas con el mismo ×1,48 → un cuadro suelto); corrida 2, las 5 capas adentro del
      margen, peor A 1,5 % y peor B 1,6 % — lo mismo que el sprint del vacío
- [x] grabación a 1440 (41 s, `~/.cache/b4-medicion/demos-grabacion/demos-1440.mp4`) + cinta a 375 y 768
- [~] visual-qa: ❓ A CONFIRMAR. El subagente existe, pero en este contexto no tiene sus herramientas de
      preview (sólo lectura). Por el sprint, no se reemplazó por otra cosa: la verificación visual es la del
      banco (`demos-ver.ts`, `demos-cinta.ts`) y la grabación
- [x] reporte (en el chat)

## Pedidos para el usuario (no se inventó nada)
- **Las 2 demos que faltan**: el pedido dice 8 y el repo tiene 6 en todas las ramas. Para sumarlas:
  nombre, rubro y URL en `demos/catalogo.ts` Y en `WebTemplatesImmersive.tsx` (el invariante §25 exige
  que coincidan), y `npx tsx scripts-b4/demos-portadas.ts` para la portada.
  `CONTENIDO-PENDIENTE.md` NO se tocó: lo genera `s7-documento` y `s7-pedido` lo compara byte a byte.

---

# Sprint 2 — el Genie de macOS, la llegada escalonada y las 8 demos

Punto de retorno: tag `demos-casi-perfecto` (daafc5aa). Commits `wip(demos2): fase N — …`.

## Fase 1 — la apertura es el Genie (commit 6c6faef0, junto con la 2)
- [x] el filtro líquido se fue entero (`apertura.ts` quedó en la caja final y el fundido)
- [x] **tiras DOM, no WebGL.** 60 tiras; cada una es un CUADRILÁTERO con `matrix3d` (proyectiva de
      Heckbert), no un rectángulo: los bordes curvos se unen fila a fila, sin escalera. Cada tira pisa
      a la siguiente 1 px para tapar la costura del suavizado. No hubo costuras visibles → no hizo
      falta WebGL
- [x] la textura: la portada HORIZONTAL del template (`public/demos/*-ventana.webp`, 1152 × 654, la
      medida de la demo en la ventana) con el cromo de la ventana encima (`CromoDeLaVentana`, el mismo
      componente que la ventana viva, quieto). El cromo va sólo en las tiras que lo tocan
- [x] el lado que se curva sale del destino: lidera el borde de abajo si el libro está debajo del
      centro de la ventana; el borde del lado del libro recorre poco y queda casi vertical
- [x] abrir = el Genie de minimizar al revés, desde el libro; cerrar = minimizar hacia el libro; al
      cerrar primero se congela en la portada. El iframe se monta con la ventana ya abierta y se funde
- [x] **fps medidos sin fotos:** abriendo 59 cuadros, media 13,7 ms (73 fps), 2 de 27 ms a los 50 y 77 ms
      (el cuadro del clic, que monta el diálogo: el libro todavía está quieto) y ninguno durante el viaje;
      cerrando 59 cuadros, media 13,2 ms, peor 13,5 ms, ninguno largo. Antes de sacar los 60 cromos
      y el desenfoque del estante eran 6 de más de 20 ms
- [x] **tiras de contacto** (`~/.cache/b4-medicion/demos2-ver/tira-apertura.png` y `tira-cierre.png`),
      comparadas con la descripción: 1 plana · 2 el borde de abajo se tira al libro, la esquina izquierda
      barre, el borde izquierdo en S, el de arriba recto y ancho, el derecho casi vertical · 3–4 el
      embudo sube, las filas de abajo más comprimidas · 5 baja y se angosta el borde de arriba · 6 queda
      una franja junto al libro y el libro la recibe. La apertura es la misma tira al revés
- [x] lo demás de la ventana no cambió (se aleja la biblioteca, el velo, cruz, rojo, Esc, afuera, foco
      devuelto, rueda en la demo, página quieta, una sola viva, precarga); movimiento reducido: fundido

## Fase 2 — la llegada escalonada (commit 6c6faef0)
- [x] la capa de demos ya no escala: está en su lugar y la muestra el agujero del vacío
- [x] 0–60 % sólo el vacío · 60–72 % el título por P1 (renglón por renglón) · 68–80 % el párrafo
      (P2 + un fundido: P2 sólo desplaza y el párrafo se veía desde el principio) · 72–100 % los ocho
      libros de izquierda a derecha, con sobrepaso `easeOutBack` y un giro que se acomoda; el último
      termina en el 100 % exacto (`tramoDelLibro`)
- [x] todo es función de la fracción del vacío, sin reloj: subiendo se deshace al revés (§25 lo afirma)
- [x] fotos en 50 / 64 / 78 / 90 / 100 % (`demos2-ver/llegada.png`)
- [x] superposición del túnel contra la referencia: las 5 capas adentro del margen en todas sus muestras,
      peor A 1,5 % y peor B 1,6 % del margen (lo mismo que antes del sprint). Una primera corrida murió en
      el paso 1: editar el checklist mientras medía recargó la página (Tailwind escanea el repo entero)

## Fase 3 — las 8 demos, también en el sitio vivo (commit 0b4a23c9)
- [x] nombre y rubro de la propia página: **Niche Perfumes** (el logo dice eso; «Colección curada de
      perfumería árabe de alta gama») y **AXON Studio** — el template de la URL «aura» se presenta
      como AXON, agencia de diseño web. Acento: el dorado de Niche (#d4af37) y el verde del logo de
      AXON (#00ff88), leídos de su CSS y de su captura
- [x] en `demos/catalogo.ts` y en `WebTemplatesImmersive.tsx` (sólo las dos entradas, mismo formato)
- [x] portadas con `demos-portadas.ts`: las 8, vertical y horizontal (AXON con espera larga: su intro
      tarda más de 5 s y la primera foto la agarró a mitad)
- [x] sitio vivo: `/web-development` con 8 tarjetas; medido «07 / 08» con Niche activa y su iframe, y
      «08 / 08» con AXON activa y el suyo (`demos2-ver/sitio-vivo-web-development.png`)
- [x] el invariante del catálogo sigue exacto, ahora con 8
- [x] el estante entra en su columna: a 1280 los libros van de 656 a 1248 (la columna, exacta) y a 1440
      de 736 a 1408; las portadas siguen en 160 px y se pisan más (paso 62 / 73 px)

## Fase 4 — verificación
- [x] lint y `tsc --noEmit` sin errores nuevos (los 2 avisos de `s10-acceso` son previos)
- [x] en verde: s5-trabajos (320, con el §25), s7-arboles, s7-contrato, s10-acceso (34 paradas),
      s21-llave, y s5/s3 tokens, código, compacto, cta, mezcla
- [x] grabación a 1440 (`~/.cache/b4-medicion/demos2-grabacion/demos2-1440.mp4`, 29,8 s)
- [x] las dos tiras de contacto del Genie
- [x] reporte (en el chat)
