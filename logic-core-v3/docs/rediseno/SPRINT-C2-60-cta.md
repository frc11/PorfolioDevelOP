# SPRINT C2 · 60c — El CTA del Panel (cola 2, 2026-10-23)

Subagente 60c: la parte «El CTA del Panel» de la tarea 60 (`docs/cola/2026-10-23/60-panel.md`), en todos los anchos. El cuerpo del Panel
(título, palabra pálida, módulos, espacios, banderas) es de 60b, en paralelo.

## Plan

- **Dueño de:** `CtaDelPanel.tsx`, `NewsletterDelPanel.tsx`, el botón nuevo (`BotonDeProbar.tsx`) y los objetos `CTA` / `NEWSLETTER` de
  `contenido.ts`. Textos de `05-TEXTOS.md` («El CTA del Panel» y el aviso), tal cual.
- **Piezas de la 20, importadas:** `EstadoDeEnvio` (el envío), `AvisoDeScroll` (abajo de todo), `Reluciente` (en el botón) y el arreglo
  global del autocompletado (`piezas.css`, sin tocar: los campos son las píldoras de `Campos.tsx`, que no se excluyen).
- **La entrada desde abajo:** el gatillo del contrato (`_contrato/Gatillo.tsx`) gana una prop opcional `desde` (`costado` por defecto,
  `abajo` para el CTA). Los demás usos no cambian. Nada de una copia del gatillo.
- **El botón:** tres capas para que las transformadas no se pisen: el envoltorio late (la API de animaciones del navegador, en el
  compositor, `fotogramasDelReposo`), el botón se levanta y se aplasta (el `animate` de Motion con un resorte poco amortiguado), y el
  reflejo es la capa de `Reluciente`. Lo que hace al tocarlo: `AL_PROBAR`, un solo lugar (hoy `undefined`).
- **La newsletter:** `/api/newsletter` NO se toca y su esquema acepta sólo `mail`: viaja `{ mail }` (`cuerpoDelNewsletter`); el campo
  Nombre queda en el form. **Para Franco:** si la lista real necesita el nombre, la ruta tiene que aceptarlo.
- **Pruebas:** `s6-cta-del-panel` (nueva, registrada en `package.json`) + las del área a la spec nueva; el banco
  `scripts-carga/cta-del-panel.ts` para el orquestador.

## Log

1. `Gatillo.tsx`: `desde?: 'costado' | 'abajo'`; con `abajo`, la misma máquina, línea y duración con la traslación de 8 en y.
2. `contenido.ts`: `CTA` (titular, bajada nueva, `probar` con su `remate` «acá.», botón «Probar ahora», «o si no», el aviso) y
   `NEWSLETTER` («Suscribite a las novedades», su texto, «Nombre», «Mail», «Suscribirme»). Se fueron `NEWSLETTER.listo` y el
   `placeholder` (el envío lo cuenta `EstadoDeEnvio`; los ejemplos de los campos son los del contacto).
3. `CtaDelPanel.tsx`: el titular que se pinta; la bajada (más grande: el nivel fluido «titulo-s» en la letra del cuerpo); la fila
   (apilada abajo de 1024, en dos columnas desde 1024, del mismo alto); a la izquierda «Probar el panel» (h4, titulo-l), el texto con
   «acá.» en un bloque propio (último hijo del párrafo: cae solo en su renglón en cualquier ancho), la flecha punteada y el botón; el
   divisor (dos tramos con «o si no» en el hueco: parado desde 1024, acostado abajo); a la derecha «Suscribite a las novedades» (h4,
   titulo-m), su texto y el form; abajo de todo, `AvisoDeScroll`. Cuatro gatillos desde abajo: la bajada, las dos columnas y el divisor.
4. `BotonDeProbar.tsx`: la píldora grande en la tinta, «Probar ahora» y la flecha en un círculo claro. Reposo: cada 3000 ms un
   medio-apretón de 560 ms (0,94 → 1,035 → 1); quieto fuera de la pantalla, con movimiento reducido, con el mouse encima o con el foco del
   teclado. Hover (sólo mouse): sube 4 px; el reflejo se intensifica solo (`Reluciente` es hijo directo). Apretado: 0,9 y, al soltar, el
   resorte (amortiguamiento 0,32) rebota. **Por qué no `whileTap`:** Motion le suma `tabindex="0"` al botón en la rama animada (una
   parada de más para `s10`); se anima a mano con `animate`.
5. `NewsletterDelPanel.tsx`: el form chico del estándar (las píldoras de `Campos.tsx`, el error del campo en el formato de siempre,
   «Suscribirme» con `Cta`), envuelto en `EstadoDeEnvio` con los textos de la newsletter. Sin `aria-labelledby` en el form: con nombre se
   volvía un punto de referencia más (`s10` cuenta doce), igual que el de antes.
6. Pruebas a la spec nueva (cada una con su control):
   - `s6-tu-panel` §10 (sólo ese bloque) y §2 (una línea: descuenta la opacidad de la capa de `EstadoDeEnvio`, `sinLaOpacidadDelEnvio`
     en `deteccion.ts`);
   - `s41` B4 (la entrada ahora es desde abajo);
   - `s43` (las regiones vivas del newsletter son las de `EstadoDeEnvio`);
   - `s10-acceso` (`DELTA_DEL_CTA_DEL_PANEL`: +1 parada, el nombre; +2 encabezados, los h4);
   - `s6-render` §7 (las dos capas de `EstadoDeEnvio` reciben el foco desde el código y no son controles: se exceptúan sólo ellas);
   - `s77-ph` (la huella de Tu panel, retomada: **si se integra con 60b, hay que retomarla otra vez**).

## REGLA DE ALTURAS

- **Desde 1024** la sección mide los 700svh de la tabla (el respiro crece y llena: `geometria.ts`), así que el CTA no corre la escena:
  `k = 1`. El CTA sigue siendo `min-h-svh`; si su contenido pasa de una pantalla (a 1024 × 768 queda justo), lo absorbe el respiro.
- **Abajo de 1024** el tramo ya se anota solo (`tramo.ts`, `useTramoDelPanel`): mide la sección entera con un `ResizeObserver` y
  `k = alto medido / altoViejoAngosto(ancho útil)`. El CTA más alto entra en esa medida sin tocar nada.
- Altos del CTA (viejo: una pantalla en los cuatro, el contenido de antes entraba; nuevo: estimado del layout, lo mide el banco):

| Tamaño | Viejo | Nuevo (estimado) |
|---|---|---|
| 1440 × 900 | 900 px (1,00) | ~900 px (1,00): ~770 de contenido |
| 1024 × 768 | 768 px (1,00) | ~770–815 px (1,00–1,06) |
| 768 × 1024 | 1024 px (1,00) | ~1080 px (~1,05) |
| 390 × 844 | 844 px (1,00) | ~1080 px (~1,28) |

## Qué mirar

- El banco: `BASE=http://localhost:3000 npx tsx scripts-carga/cta-del-panel.ts` y cada `CONTROL=` (ver su cabecera). Imprime el alto
  medido del CTA y de la sección por tamaño (para la tabla de arriba).
- A ojo, `http://localhost:3000/v3` → «Panel» y bajar hasta «TU PANEL CRECE CON VOS.», en 1440, 1024, 768 y 390.

## Gate (sin navegador)

- `npx eslint` de los archivos tocados: 0 errores (2 avisos de antes en `s10-acceso`, línea 50).
- `tsc --noEmit` (4 GB): 0 errores.
- `s6-cta-del-panel`: 48 afirmaciones, 0 fallas (cada detector con su control). `s6-tu-panel`, `s10-acceso`, `s41`, `s42`, `s43`,
  `s75-carga`, `s77-ph`, `s37`, `s38`, `s46`, `s52`, `s78-b10`: 0 fallas.
- Fallas que ya estaban y no son de esta tarea: `s6-tokens` y `s6-lane` (servicios: clases fuera de familia, imports de `tu-panel` y
  de `next/font/google`), `s6-render` (el enlace de cada reseña con `tabindex="-1"`), `s7-contrato` (servicios importa de `tu-panel`),
  `s4-cobertura` (s23 a s39 sin el corredor).
