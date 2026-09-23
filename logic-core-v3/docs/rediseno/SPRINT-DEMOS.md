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
- [ ] visual-qa
- [ ] reporte
