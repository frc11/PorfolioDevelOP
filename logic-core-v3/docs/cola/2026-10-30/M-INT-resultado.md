# M-INT · resultado — L7g, M1, M2 y M3 juntos

Rama `l7/a`, dev :3002. Valentino mergeó a mano `m/1` (`df7cbbdd`), `m/2` (`d30db82a`) y `m/3` (`7049e63c`); esta sesión resolvió los conflictos, los dejó en stage y no hizo ninguna otra operación de git más que un worktree temporal de la base (creado y borrado). El trabajo de integración de abajo queda **sin commitear**.

## Lo que chocó en los merges

1. **`m/1` — la foto de la facultad, hecha dos veces.** `facultad.webp` (add/add): quedó UNA copia, la de L7g (calidad 90, 46 KB; mismo original de 500 × 298 que la de M1). `HistoriaYEquipo.tsx` (M1 lo borró, L7g lo modificó): borrado; M1 lo partió en `Historia`, `Equipo` y `ComoTrabajamos`. `FotoDeLaFacultad.tsx` de L7g, huérfano: borrado. La foto que queda es la de M1 (se abre desde la rendija con el scroll, 500 px como mucho), la aprobada. `nosotros/contenido.ts`: una sola constante (`FACULTAD`, de M1); de la de L7g sólo pasó la descripción visual al `alt`.
2. **`m/2` — la 404, hecha dos veces.** `not-found.tsx`: la caja de texto con el ajuste de L7g (termina a 4,5 rem del logo) y, adentro, el logo que no encaja de M2 arriba del `h1`; el arranque que espera al preloader (`_no-encontrada/arranque.ts`) entró sin conflicto. Medido después (`l7g-404.ts`): holgura **82 / 65 / 43 / 43 px** a 1025 / 1280 / 1440 / 1920 (L7g tenía 87 / 65 / 43 / 43). Los 43 px se sostienen.
3. **`m/3`** entró sin conflicto de texto.

## El mapa de colisiones, punto por punto

1. **La foto de la facultad:** arriba (1).
2. **Nosotros, el resto:** lo único que L7g había arreglado ahí era la foto (H5 de L7g); el enlace «Conocé más sobre nosotros» de L7g vive en el home (`_secciones/quienes-somos/equipo.tsx`), que M1 no tocó: sigue. Historia, equipo y «Cómo trabajamos» son los de M1.
3. **La 404:** arriba (2).
4. **El recorte de costado.** Ahora recorta **una sola vez y en el mismo lugar en todas las páginas: el `<main>`**, como el home. `overflow-x-clip` en el `<main>` de Nosotros y Portfolio (M1), del blog, de la nota, de las tres de servicio (`PaginaDeServicio`), de las legales (`PaginaLegal`), de la 404 y de la página base; y salió de `CierreDeLaPagina.tsx` (L7g), que vive adentro de ese `<main>`. `clip` no abre un contenedor de scroll, así que no rompe los `sticky`: verificado que la pantalla clavada de Desarrollo web (`m3-momentos.ts`, 46/46 a 390 y 1440, el menú de trabajos cambia sin mover el scroll) y el índice de las legales (humo, cabecera → texto → pie a 1440 y 390) siguen andando.
5. **La intro larga contra el blog.** No hubo que tocar nada: la regla de M1 (día + pista + bloque «de qué se trata» = larga) la toma el índice del blog solo. Medido (humo, 1440): Nosotros, Portfolio y el blog **3,40 pantallas** (el cuerpo al centro a las 3,0); la nota (sin bloque) **1,80**; las tres de servicio, 1,80. Una sola intro por página.
6. **`banda.css`.** La regla de los trazos abajo de 1024 se acotó a lo que mezcla (descendientes de la clase de la mezcla y el ≠, que la lleva en sí mismo). El parche local de M3 en `RenglonesTachados.tsx` (los dos tonos escritos en el elemento y la utilidad importante) se sacó: era la copia exacta de `trazo.css`. Verificado en el navegador a 390: en el home los 4 subrayados, los 2 tachados y los 4 trazos del ≠ de Quiénes somos siguen del color del papel (`rgb(247, 247, 245)`, todos adentro de la mezcla); en Nosotros los 5 subrayados de «Cómo trabajamos» quedan en tinta media (`rgb(83, 83, 83)`); en Software a medida lo de siempre y su raya se ven (`m3-momentos.ts`, 46/46).
7. **`package.json`.** `test:s92-m1`, `test:s93-m2-blog` (el `test:m2-blog` del lote, renombrado: `verificar` sólo deriva los `test:sN-…`) y `test:s94-m3-momentos`, cada grupo con su agregador (`test:s92`, `test:s93`, `test:s94`). Al cablear `momentos`, `s4-cobertura` pidió los otros nueve invariantes de `_servicios/__tests__/` (los del V1, que L7a dejó fuera): van en s94. `verificar` corre los tres grupos: s92 47/0, s93 60/0, s94 **644/0** (10 invariantes).
8. **Los anchos: no hay nada que cambiar.** M1 lo midió: la cadena de contenedores es la misma en el home y en las páginas; la columna angosta y centrada que se vio era la del laboratorio (`l7/lab`, `mx-auto max-w-*`), no la de las páginas. Lo angosto a propósito es la nota (columna de lectura) y las legales (índice + texto).

## Lo que nadie había reportado (y se arregló)

- **MI-1 · «Saltar al contenido» no llevaba a ningún lado en las diez páginas.** El chrome lo monta el layout de `/v3` para todas las rutas y apuntaba siempre a `#hero`, que sólo existe en el home (medido: en las diez el destino no estaba en el documento). Ahora `EnlaceDelSalto.tsx` (una isla de cliente; `SaltarAlContenido` le pasa el id del home como texto para no traer `Panel` al cliente) elige según la ruta: en el home `#hero` como siempre, fuera `#contenido`, que llevan la intro de página (8 páginas), la cabecera legal y la 404, con `tabIndex={-1}` como la sección de entrada del home. Probado con el teclado: Privacidad (Tab → el salto; Enter → el foco en la cabecera; el próximo Tab, la primera entrada del índice, adentro del `<main>`), Nosotros (el foco en la intro, sin mover el scroll), el home (`#hero`) y la navegación sin recarga del home a Nosotros (mismo documento, el salto pasa a `#contenido`). Las páginas no pueden llevar `id="hero"`: el «Home» de la barra y el deslizamiento lo buscan por id y harían scroll en la página.
- **MI-2 · Los subrayados de «Cómo trabajamos» (M1) eran invisibles abajo de 1024** — la misma regla de `banda.css` que M3 encontró en su página; M1 no la vio. Arreglado con el punto 6.
- **MI-3 · Cuatro suites que los carriles no corrieron, rotas por cambios de spec de otro carril:**
  - `s5-trabajos` (6 fallas): el «Ver todos los trabajos» de L7g en el encabezado del Portfolio del home. Actualizado a la spec: un enlace más e interno (sin `noopener`), su ruta permitida, una parada más, y un segundo oculto por estilo (el enlace fuera de la presencia del encabezado, que es como L7g lo diseñó).
  - `s66-pulido-15` (2): el halo del cuerpo de Quiénes somos ahora cubre también el enlace (L7g); el detector lo exige.
  - `s78-b12b` (1): M1 cambió `const hueco` por `const { hueco, giro }` sin mover el orden que el test protege; el patrón lee la forma nueva.
  - `s4-cobertura` (+1): punto 7.
  Ninguna se aflojó: las tres primeras exigen la pieza nueva y su control positivo sigue viendo el error.
- **Nombres, `h1` y landmarks:** sin daños de texto. El pie de cada página dice los seis rótulos actuales (humo: «Páginas» bien en las 20 corridas), cada página tiene un `h1` igual a su título 3D, ningún archivo traído por M1–M3 nombra un servicio por un nombre viejo.

## Los desbordes pendientes

**Cero.** Humo a 390 (`innerWidth` 390, pestaña visible): el blog **0 px** (M1 medía 32) y la nota **0 px** (M1 medía 3); las diez páginas en 0 a 1440 y a 390. Por qué los dos bancos no coincidían: el de M1 corría con la intro larga de M1, que el blog hereda; el de M2, con la intro corta de su rama. Lo más probable es que el desborde lo trajera algo de la intro larga que entra de costado. No lo aislé: con el recorte en el `<main>` desaparece.

## La compuerta, sobre lo fusionado

- **`tsc --noEmit`:** 0 errores (paso 2 de `verificar`). **ESLint** de los 95 archivos que trajeron los merges: 0 errores, 5 avisos viejos (imports sin usar en `s10-acceso.invariant.ts` y `equipo.tsx`, los mismos que en `HEAD`); de los 17 de esta sesión: 0 problemas.
- **Build de producción** (`NODE_OPTIONS=--max-old-space-size=6144`): **pasa, 0 errores, 0 avisos**, todas las rutas prerenderizadas (las tres de servicio y las seis notas por SSG). Nada que clasificar.
- **`npm run verificar`** (con el build presente), contra `rediseno/home` **construida** (worktree temporal de `14fd3fc5`, build + `verificar`, comparado afirmación por afirmación): **98 pasos, 11 grupos con falla, los mismos 11 que la base** (s2, s3, s4, s5, s6, s7, s8, s10, s17, s76, s77).
  - Fallas de la base, iguales: s6 (el relleno de arriba de 7 rem escrito a mano y los literales de `Cierre.tsx`), s76 (la huella del modal de contacto), s77 (los dos hashes `f8deb37f755a · 64083f6736c4`), s8-montaje (los seis archivos de más de 300 líneas), s17, s10-mobile, s4-cobertura (los agregadores que faltan desde s23), y las de peso con otros números y otros nombres de chunk.
  - **Nueva, una:** `s7-compuerta` «y la diferencia está pesada» — la que ya reportó L7-INT (el chunk del preloader lo bajan todas las rutas de `/v3`). **Empeoró en peso:** lo que `/v3` baja de entrada pasa de 405,6 (base) / 408,4 (L7-INT) a **411,9 KiB gzip** (+6,3 contra la base, +3,5 contra L7-INT; 0,3 de eso es la isla del salto). Lo que `/v3` escribe, de 921,2 a 938,4 KiB; la guardia cruda de s3, de 45,8 a 46,1 KiB. No lo arreglé: es contabilidad de peso adentro de grupos que ya están rojos. El candidato más directo son los enlaces discretos de L7g, la única pieza nueva del árbol del home, pero no lo medí por separado.
- **Pasada por las diez páginas** (`l7-int-humo.ts`, 1440 y 390, bajando y subiendo): **20 de 20** — estado, un `h1`, desborde 0, intro → cuerpo → cierre en los dos sentidos (las legales, cabecera → texto → pie), el FAQ abre, el pie está, consola limpia. Privacidad a 1440 dio una vez `pageerror: Invalid or unexpected token` (el H3 de L7g: el dev sirviendo un chunk a medias) y en las dos repeticiones con la pila salió limpia.
- **Bancos de los carriles:** `m3-momentos.ts` 46/46 (390 y 1440). `m2-blog.ts` 17/18 a la primera; la que falló es la 404 a 390, y es de tiempo: tres corridas a 390, una entera bien, una con el reinicio ya en curso a los 60 ms del toque y otra que a los 5 s todavía no había chocado. Cada vez arranca, choca y el toque la repite. No la causa el recorte del `<main>`: la tarjeta no se sale de él (desborde 0) y el choque lo marca un temporizador. La anoto como intermitente contra el dev. `l7g-404.ts`: arriba.
- Fotos: `C:\nocturno\cola3-fotos\MINT\humo\<página>\` (1440 y 390), `MINT\m2\`, `MINT\m3\`; logs en `C:\nocturno\cola3-fotos\MINT\`.

## Decisiones tomadas solo

- **MINT-1** La foto: la copia de L7g, el componente de M1 (el aprobado). Se fueron `FotoDeLaFacultad.tsx` y `FOTO_DE_LA_FACULTAD`.
- **MINT-2** El recorte va en el `<main>` de cada página y no en el cierre: así recorta una vez, en el mismo lugar que el home, y cubre la intro y el cuerpo (de donde salían los 32 px del blog), no sólo el cierre.
- **MINT-3** La regla de los trazos se acotó con el selector de la clase de la mezcla y no con `[data-panel='quienes-somos']` (la propuesta de M3): la mezcla tiene trazos también en el ≠ y el selector dice exactamente la condición física (sólo un trazo que mezcla necesita el papel).
- **MINT-4** `test:m2-blog` entró como `test:s93-m2-blog`: con otro nombre `verificar` no lo corre. Los nueve del V1 entraron al grupo s94 junto con `momentos`.
- **MINT-5** El salto según la ruta (MI-1), con la isla de cliente en vez de hacer de cliente a `SaltarAlContenido`, para no meter `Panel` en el bundle inicial.
- **MINT-6** No corrí `visual-qa`: la verificación visual la hicieron el humo y los bancos de los carriles, con fotos, más las lecturas de color y de foco en el navegador.
- **MINT-7** La base de la comparación: worktree temporal `C:\nocturno\cola3-base-mint` de `rediseno/home` (`node_modules` por junction al de `C:\rediseno-home`, `.env.local` copiado sin leerlo), construida; se borró al terminar (primero la junction, después el `.env.local`, después el worktree).

## Supuestos y descartes

- La duplicación del color por palabra (`COLOR_DE_LA_PALABRA` y el partido en palabras pintables, en `nosotros/Historia.tsx` de M1 y en `blog/_movimiento/pintado.tsx` de M2) **no se unificó**: el home ya lo repite en otras tres piezas; es deuda de antes, no daño del merge.
- El `nav` «El recorrido» del pie de las páginas queda adentro del `<main>` (viene de NOCTURNO B13, el pie común); está al final del contenido y no traba el salto. No se tocó.
- `useAlCruzar` (M1) y `useCruzoLaLinea` (M2) no son la misma lógica (centro con histéresis contra la línea de disparo del sitio): no se juntaron.
- El bloque del giro del índice del blog es su «de qué se trata» de siempre (M1 propuso escribirle uno para ese lugar): es copy, para Valentino.

## Lo que queda pendiente para Valentino

1. **El logo del pie arriba y al centro en las páginas** (L7g ítem 1, no hecho): el plan está en `L7g-resultado.md`, decisión L7g-1 (banda + columnas en `PieDelCierre.tsx`; `poseDelPortfolio` + `encuadreArribaAlCentro` en `composicionEnLaEscena.ts`).
2. **Los nanobots de la primera pantalla de servicio:** falta el archivo (`C:\nocturno\l7-assets\nanobots-slide1.*` no existe).
3. **`noindex` / `robots.ts` para el lanzamiento** (L7g H5 y L7g-4): las páginas nuevas no declaran `robots` (el home `/v3` sí); qué hacer el día del lanzamiento está en L7g-4.
4. **Las fotos del blog son placeholders** (M2): `public/v3/blog/<slug>.webp`.
5. **`?hilo=barra`** (M2): elegir entre el hilo al costado (por defecto) y la barra; después sacar la bandera.
6. **La estética nueva del tablero de Software a medida** (M3) y el texto de los casos del Portfolio (M1): para mirar y reescribir.
7. **El peso de `/v3`**: +6,3 KiB gzip de entrada contra la base, y `s7-compuerta` con su afirmación nueva (arriba).
8. El sonido de la 404 y el toque real en el teléfono (mantener apretado el carrusel del blog): **no verificados** (M2; el banco corre con el audio apagado y el mouse).

## Qué tiene que mirar Valentino

1. `/v3/nosotros` en el teléfono (o a 390): los cinco pasos de «Cómo trabajamos» con su subrayado visible.
2. `/v3/software-a-medida` a 390: «lo de siempre» tachado se ve (sin el parche de M3).
3. Cualquier página: Tab al cargar → «Saltar al contenido» → Enter: el foco cae en la intro de la página (en el home, en el hero como siempre).
4. `/v3/no-existe` a 1440 y 1920: la tarjeta del logo que no encaja arriba del texto, y el texto sin tocar el logo.

## Candado

Cinco tomas, ninguna en paralelo: base (build + `verificar`, 16:58–17:16), compuerta 1 (17:17–17:40), suites corregidas (~17:45), dev :3002 + Chrome (17:48–18:18; dev parado por PID con `taskkill /T`), compuerta final (18:21–18:39). Sin esperas ni robos.

## Archivos de esta sesión (sin commitear)

- Resolución de los merges (ya commiteada por Valentino): `nosotros/contenido.ts`, `not-found.tsx`, borrados `nosotros/HistoriaYEquipo.tsx` y `nosotros/FotoDeLaFacultad.tsx`.
- Integración: `_estilos/banda.css`, `_servicios/momentos/orden/RenglonesTachados.tsx`, `_componentes/pagina/cierre/CierreDeLaPagina.tsx`, el `<main>` de `blog/page.tsx`, `blog/[slug]/page.tsx`, `_servicios/PaginaDeServicio.tsx`, `_componentes/pagina/PaginaLegal.tsx`, `not-found.tsx`, `pagina-base/page.tsx`; el salto: `_chrome/EnlaceDelSalto.tsx` (nuevo), `_chrome/SaltarAlContenido.tsx`, `_componentes/pagina/atributoDeLaIntro.ts`, `_componentes/pagina/IntroDeLaPagina.tsx`, `PaginaLegal.tsx`, `not-found.tsx`.
- Tests y scripts: `package.json` (15 scripts), `_secciones/trabajos/trabajos.invariant.tsx`, `_lib/__tests__/s66-pulido-15.invariant.tsx`, `_lib/__tests__/s78-b12b.invariant.tsx`, la línea de cómo se corren `blog/__tests__/m2-blog.invariant.ts` y `_servicios/__tests__/momentos.invariant.tsx`.
- Docs: este archivo, una línea en `ESTADO-a.md`, el marcador `M-INT-TERMINADO`. (`M-INT.md` sigue sin seguimiento, como llegó.)
