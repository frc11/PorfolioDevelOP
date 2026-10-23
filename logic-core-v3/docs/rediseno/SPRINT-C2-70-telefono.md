# SPRINT C2-70t · Las reseñas en el teléfono y la tablet (tarea 70 §4, el carrusel)

Lo de escritorio (la escena, los títulos, la cámara) es del 70e y va en `SPRINT-C2-70.md`. Acá, abajo de 1025 y la rama de movimiento reducido.

## Plan
1. Sin flechas, continuo: una deriva lenta y pareja con el scroll NATIVO de la pista (no `transform`: el dedo y la rueda siguen andando y la mezcla de los textos no se corta), en bucle con la pista duplicada (la copia `aria-hidden`). Se frena con el dedo, el mouse encima o el foco adentro, y retoma desde donde quedó con una curva suave. Sólo en pantalla (IntersectionObserver) y con la pestaña visible. Con movimiento reducido: quieta, una sola copia, con encaje.
2. El aviso «Deslizá para ver más»: `AvisoDeScroll` extendido con `direccion="costado"` (no copiado). Aparece con el carrusel en pantalla y se va con el primer deslizamiento; guarda su lugar (sólo se desvanece).
3. Tarjetas sólidas con su foto: ya lo eran desde la sesión 1 de C2-70 (`bg-fondo` opaco, el retrato webp); se afirma y se mide.
4. «Ver trabajo →» con el `CtaEnlace` de línea del sitio, enlace real a `#portfolio-…`, sólo si la reseña tiene trabajo.
5. Pruebas: suite nueva `s83-resenas-telefono` y banco `scripts-carga/resenas-telefono.ts`.

## Log
- `resenas/deriva.ts` (puro): `DERIVA` (24 px/s, espera 1,2 s, retoma 1,2 s con smoothstep, tolerancia 1,5 px), `velocidadDeLaDeriva`, `pasoDeLaDeriva` (módulo del ancho de una copia), `laMovioElUsuario`, `estadoDelAviso`.
- `resenas/useDerivaDelCarrusel.ts`: el bucle de rAF (escribe `scrollTo` con `behavior: 'instant'`, guarda la posición en coma flotante y lee la del navegador para saber si la movió el usuario: entonces toma esa posición y espera). Un deslizamiento cuenta para el aviso sólo después de un gesto de entrada (dedo, rueda, puntero, foco).
- `ResenasEnLista.tsx`: sin flechas ni `scrollBy`; la pista (`PistaDeLasResenas`, exportada para la suite) con la copia `data-copia` si deriva; sin encaje si deriva (pelearía); `overflow-x-auto` también desde 1024 (con movimiento reducido ya no hay flechas: se desliza con trackpad o la barra); el aviso abajo. La tarjeta ya no tiene `onClick`: el botón es el enlace.
- `Cta.tsx`: `CtaEnlace` con `fueraDelTeclado` (opcional, `tabIndex -1`). `contenido.ts`: `proyecto` opcional, `enlaceDelTrabajo` devuelve `undefined` sin trabajo; el texto `deslizar`; salen `anterior`/`siguiente` (sin uso). `ResenasParaElLector`: sin enlace si la reseña no tiene trabajo.
- DECISIÓN (accesibilidad): el botón visible es un `<a href>` real (dedo, mouse, abrir aparte) pero `aria-hidden` y fuera del teclado; la parada del teclado de cada reseña sigue siendo el enlace de `ResenasParaElLector`, que con el foco aparece como la pastilla (foco visible). Probado lo contrario (el botón en el teclado y el lector sin enlaces): s10 se cae, porque las dos ramas tienen que anunciar exactamente lo mismo y el anuncio de la lista quedaba «Ver trabajo →» ×10 al final en vez de «Ver el trabajo que comenta…» después de cada cita.
- Suites: s83-resenas-telefono 43/0 (nueva), s83-resenas 104/0, s10-acceso 77/0, s7-mezcla 116/0, s85-piezas 54/0, s59 15/0, s3-cta 28/0, y las que renderizan el home (s10-banco, s10-lectura, s18, s33, s35, s36, s37, s39–s43, s45, s47, s51–s54, s56, s78-b13) sin fallas. s61-pulido-10 tiene 1 falla (J7, el titular del Portfolio en `EncabezadoDelPortfolio.tsx`): ajena, no toqué ese archivo. tsc 0, eslint limpio.

## Alturas (REGLA DE ALTURAS)
El bloque se anota solo (`anotarTramo` con `k = (alto/escala + 9)/9`, medido por su ResizeObserver): no hay `k` a mano. Cambio derivado del CSS, igual en los dos anchos (la tarjeta no cambia): la fila del botón pasa de 32 px (8 + 24 del texto) a 47 (el CTA: 8 + 24 + 4 + 3 + 8) y la fila de las flechas (46 px) pasa al aviso (24 px): **−7 px** a 768×1024 y a 390×844 (Δk ≈ −0,68 y −0,83). El alto absoluto lo imprime el banco («alto del bloque»); el viejo es ése + 7.

## Qué mirar
- `/v3` a 390×844 y 768×1024: el carrusel se corre solo, despacio y parejo; con el dedo se desliza y, al soltar, queda quieto un momento y sigue desde ahí; sin flechas; abajo «Deslizá para ver más» con dos chevrones a la derecha, titilando, que se va al primer deslizamiento; cada tarjeta opaca con su foto y, debajo, «Ver trabajo →» con el subrayado del sitio (el rollover con el mouse) que lleva al trabajo del Portfolio.
- Con movimiento reducido: quieto, deslizable a mano, con encaje; el aviso igual.
- El teclado: Tab por las reseñas muestra la pastilla abajo al medio (como antes).
- Banco: `BASE=http://localhost:3000 npx tsx scripts-carga/resenas-telefono.ts`; controles `CONTROL=quieto` (falla «deriva» y «la deriva sigue desde ahí») y `CONTROL=con-flechas` (falla «sin flechas»).
