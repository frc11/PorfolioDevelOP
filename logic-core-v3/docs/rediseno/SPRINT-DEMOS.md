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
      `data-pieza="tunel"` dentro de `pintar()`. La capa de demos entra como HERMANA ANTERIOR de
      `CapaDelTunel` en `Trabajos.tsx` (el orden del marcado es el orden de pintura) y lee la MISMA
      fracción, que `pintar()` publica en un `MotionValue`.
- [x] **Otras restricciones encontradas:**
  - `ScrollSuaveDeV3.tsx` afirma que **nunca llama `lenis.stop()`** (la clase `lenis-stopped` cuelga un
    `overflow: clip` del `<html>`), y la instancia no se publica. La pausa del scroll se hace con
    `data-lenis-prevent` en el diálogo (Lenis ignora esa rueda) + `overflow: hidden` en el `<html>`
    mientras está abierto (la barra ya está oculta en `globals.css:476`, así que no corre el layout).
  - Abajo de 1025 **y con movimiento reducido** se monta la rama quieta (`CompuertaDelHome`).

## Fase 1 — el CTA se entiende como apretable
- [ ] «Hablemos» un renglón más abajo, más grande que un cuerpo y más chico que la frase
- [ ] «Hablemos» es el `Cta` del sitio con su rollover (sin modificar el componente)
- [ ] «(un clic y arrancamos)» en mono chico
- [ ] hover/foco de la ventana: se eleva, mano, se tipea «/hablemos» y se borra al salir
- [ ] la ventana sigue siendo el enlace; §16 intacto

## Fase 2 — la entrada
- [ ] capa de demos detrás del túnel y encima del canvas, escala = la fracción del vacío
- [ ] fija con el cuadro lleno; se va con la sección
- [ ] ida y vuelta sin saltos; el largo del tramo no cambia
- [ ] superposición contra la referencia dentro de 1 px

## Fase 3 — la biblioteca y el hover
- [ ] layout: logo a la izquierda, título + párrafo + estante a la derecha
- [ ] las piezas en perspectiva con su portada
- [ ] hover: levanta, vecinas se abren, subida suave, bajada ≤120 ms
- [ ] cartel con la estética del navbar, con el nombre correcto
- [ ] teclado: foco levanta, flechas recorren, Enter abre
- [ ] precarga por intención (>150 ms, una por vez)

## Fase 4 — abrir, usar y cerrar
- [ ] la biblioteca se aleja y el velo del CTA oscurece
- [ ] la ventana nace de la pieza, líquido → sólido; fps medidos
- [ ] cromo del CTA + URL real + cruz; el rojo cierra
- [ ] rueda en la demo, página quieta; click → pestaña nueva con cartel
- [ ] esqueleto mientras carga, sin destello blanco; una sola viva
- [ ] cerrar (cruz, rojo, Esc, afuera) al revés, foco devuelto
- [ ] diálogo accesible con foco atrapado; movimiento reducido

## Fase 5 — móvil y tablet
- [ ] título, texto y cinta infinita CSS; quieta y deslizable con movimiento reducido
- [ ] tocar una portada abre el template

## Fase 6 — verificación y reporte
- [ ] lint + `tsc --noEmit`
- [ ] s5-trabajos, s7-arboles, s7-contrato, s10-acceso, s21-llave en verde
- [ ] invariantes nuevos con control positivo
- [ ] superposición del túnel dentro de 1 px
- [ ] grabación a 1440 + capturas de la cinta a 375 y 768
- [ ] visual-qa (si está disponible)
- [ ] reporte
