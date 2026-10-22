# SPRINT B13 · nocturno del 2026-10-22 — el cierre de cada página

Rama `nocturno/2026-10-22-b13`. Tarea: `docs/cola/2026-10-22/61-B13-cierre.md`. Sin navegador: lo que se ve lo mide el orquestador (abajo,
«Qué mirar»). Las pruebas sin navegador: `s78-b13` (`npm run test:s78-b13`), cada una con su control positivo. La firma, en
`docs/rediseno/B12a-API.md` §8 (y §1, §4, §7).

## Plan

### La forma (lectura del código)

- El final del home es una coreografía de la escena atada al progreso del recorrido (`finalDelRecorrido.ts`: A frase, B valores, C CTA, D,
  E pie; los keyframes `frase · sostén` … `pie · sostén` de `CHOREO_KEYFRAMES`), y el DOM de «Por qué develOP» reparte sus piezas sobre el
  pin con las mismas cuentas (`geometria.ts`). En una página el progreso del rig está clavado en 0 (`ataduraAlScroll.ts`) y la cámara la
  pone la pista de la intro (`poseDeLaIntro`, `composicionEnLaEscena.ts`).
- El CTA en volumen (`EscenaDelCta`) se arma desde el DOM (`CTA_EN_VIVO`: el origen, los valores, la frase, el destino) y en el escenario
  se coloca con la cámara de la pose C (`planosDelCta.ts`: `camaraDeLaLectura('cta')`, una pose fija). Si la cámara de la página hace las
  mismas poses en las mismas pantallas, la transformación de B3 anda igual.
- El pie del home de volumen se arma alrededor del logo que cae a su hueco (el encastre: `FinalDelPie`, `cuadroDelFinal.ts`), que corre
  «al fondo» del documento — también al fondo de una página, en cuanto la escena despierta ahí.
- `preset.tramos.pie` ya estaba previsto («desde B13») y despierta la escena (`despiertaEnLaPagina`). La ranura es dueña de la luz en la
  intro; «fuera de la intro, el final» (P-H29a).

### La forma (lo que se arma)

- **La pieza:** `_componentes/pagina/cierre/CierreDeLaPagina.tsx`, que una página monta al final de su `<main>`: Seis razones
  (`SeisRazonesDelCierre`: el escenario del home desde 1024 con movimiento, la lista abajo o con menos movimiento), una pantalla de la
  resolución (vacía) y el pie (`PieDelCierre`, plano). De noche, invertida (los claros).
- **La escena:** `_lib/escena/ruta/cierreDeLaPagina.ts` (puro): la pantalla del cierre (la del pin del home; en la lista, su recorrido
  repartido en las seis), la pista del cierre (los nudos del final del home en esas pantallas, ángulo 0) y la resolución (0 → 1 en la
  pantalla 6 a 7). La atadura la mide; `poseDeLaIntro` la toma cuando manda (el rig no se toca); la ranura le pasa `resolucion` a la
  variante y es dueña de la luz en el cierre; el final del home no corre en una página (`enUnaPagina`).
- **Lo que necesita del home** (sin cambiar lo que renderiza el home): `PrecargaDelCta` (el `data-precarga` del CTA), `MaterialDeLosTitulos`
  (la frase en papel), `ModoDelPieForzado` (el pie plano), `ctaDeNoche` (el CTA en volumen en papel), y `export` en piezas de
  `PorQueDevelop.tsx` y `ColumnasDelPie.tsx`.

### Riesgos

- Sin navegador: el escenario de noche (los claros del DOM, la frase y el CTA en papel), el encuadre del pie plano en escritorio con el logo
  en el centro y el contraste del texto sobre la sala de noche los mide el orquestador.
- La lista: su cámara es la pista del home repartida en su recorrido (aproximada: el CTA de la lista con la pose C cerca de su bloque).
- Un cuerpo en papel de menos de una pantalla deja la intro y el cierre a la vista a la vez: una sola cámara. La base tiene más.

## Log

- **La escena** (`_lib/escena/ruta/cierreDeLaPagina.ts`, puro): `pantallaDelCierre` (la del pin del home sobre el bloque de Seis razones,
  medido en el layout), `PISTA_DEL_CIERRE` (los siete nudos del final del home, `frase · sostén` … `pie · sostén`, en esas pantallas, con
  una frase en el relevo y el pie sostenido hasta el fondo; el ángulo en 0), `resolucionDelCierre` (suave, de la 6 a la 7) y `enUnaPagina`.
  - La atadura mide el cierre en una página (`tramos.pie`) y lo vuelve a −∞ en el home (`ataduraAlScroll.ts`, 4 líneas).
  - El rig no se toca: `poseDeLaIntro` (que el rig ya llama en una página) toma la pista del cierre cuando manda (`composicionEnLaEscena.ts`).
  - La ranura le pasa `resolucion` a la variante y es dueña de la luz en el cierre (`enElCierre`, al lado de la condición de la intro, que
    queda como estaba: s78-b12a la lee). `__cierreSinResolucion`, el control del banco.
  - La variante de la base se resuelve: `cuadroDeLaPrueba(…, resolucion = 0)` apaga lo encendido con `1 − resolucion` (el anillo se cierra y
    se apaga, la luz vuelve a 0,12 y blanca); con movimiento reducido, de una a la mitad.
  - El final del home no corre en una página: `if (enUnaPagina()) s.fondo = Number.POSITIVE_INFINITY` (`cuadroDelFinal.ts`, dos líneas: el
    import y esa; el archivo ya pasaba las 300 de código: s8-montaje informa 348 donde decía 346, la misma falla de la base).
- **Lo del home para el cierre** (sin cambiar lo que renderiza el home: sin proveedor, igual): `PrecargaDelCta` (el `data-precarga` del
  enlace del CTA), `MaterialDeLosTitulos` (`TituloDeVolumen` le pasa el material del tramo al registro), `ModoDelPieForzado`
  (`useModoDelPie`), `ctaDeNoche` (la escena del CTA en `blanco` adentro del cierre de noche) y `export` de `AnchoDeLaFrase`,
  `CLASE_DE_LA_COLUMNA`, `FraseDelFinal`, `ValorEnElEscenario` y `TAMANO_DEL_CTA` (`PorQueDevelop.tsx`) y de `CajaDeVidrio` (`ColumnasDelPie.tsx`).
- **La pieza** (`_componentes/pagina/cierre/`): `CierreDeLaPagina` (el bloque, de noche invertido, con la compuerta del home),
  `SeisRazonesDelCierre` (el escenario del home sin las reseñas, o la lista), `PieDelCierre` (plano, con el recorrido a `/v3#…`) y
  `LlegaDelCierre` (P5 sin la mezcla). La página base la monta y su pie provisorio se fue.
- **`?resenas=scroll|gatillo` en las páginas:** sin el aro, las dos dan lo mismo (en B3 el cartel sigue al scroll en las dos; lo que cambia es
  la bajada de las placas, que acá no hay). No se lee.
- **Los altos:** el cierre es de la página (no del home): 7 pantallas de Seis razones desde 1024 (las del home), 1 de la resolución y el pie
  (al menos 1). La REGLA DE ALTURAS no aplica: ninguna sección del home cambió de alto.

### El gate (sin navegador)

- `npx eslint` de los 25 archivos tocados: limpio. `tsc --noEmit` (4 GB): 0 errores.
- `s78-b13` (nueva): 42 afirmaciones, 17 controles positivos, 0 fallas.
- A la spec nueva, con su control: `s78-t0` (la variante arma su cuadro con `resolucion.current`; control nuevo: sin la resolución, rojo).
- La medida del cierre en la atadura va después del despertar (la regla de s78-b12a sobre ese tramo del código queda como estaba).
- Sin fallas nuevas: s49, s74, s75, s76, s83, s34, s36, s40, s41, s42, s44, s45, s50–s59, s61–s63, s71, s73, s6, s10. Con las fallas de la
  base y ninguna más: s3 (s3-peso), s5 (s5-compacto, la misma lista; s5-peso), s7 (s7-compuerta), s8 (s8-montaje: `cuadroDelFinal.ts` dice
  348 líneas de código donde decía 346, la misma afirmación; s8-tres, s8-peso), s17 (s17-revelado, s17-marca). s47: el control «el recorte
  sólo en el teléfono» ciego, sobre `EscenarioDelPortfolio.tsx`, que este sprint no toca (viene de la integración).

## Qué mirar (el orquestador, en el navegador)

1. `http://localhost:3000/v3/pagina-base` a 1440 × 900: bajá hasta el final del cuerpo en papel. Al soltarse el papel, la sala de noche con
   el acento de web (el anillo y la luz de abajo azulados) y «Seis razones | para elegirnos» que se arma en volumen, en PAPEL, a los costados
   del logo (pose A, frontal). Seguí: los seis valores entran de a pares desde abajo (B, la cámara baja a contrapicado), en claro; después
   se levantan, la frase se da vuelta sobre su eje y del otro lado está «HABLANOS» (C, el logo abajo y el CTA al centro), en papel, con «Este
   sitio empezó con una charla. El tuyo también.» armada desde los valores. Sin el aro de reseñas.
2. Mismo lugar: pasá el mouse por «HABLANOS» (el subrayado) y hacé clic: se abre el contacto con Desarrollo web ya marcado (`data-precarga="web"`).
3. Seguí bajando: el CTA se va con su escenario y queda la sala sola una pantalla; mientras tanto la cámara se aleja a la del pie (el logo en el
   centro) y el anillo se cierra y se apaga, la luz de abajo vuelve a la de la composición: el piso queda liso y calmo. Recién ahí entra el
   pie (el titular, el mail y WhatsApp a la izquierda; el recorrido y el formulario a la derecha; las redes y la línea legal abajo), en claro,
   sin tapar el logo. Al fondo, el logo NO cae a su hueco (ese es el final del home). Subí: todo vuelve (el piso se vuelve a encender).
4. A 390 × 844 (táctil): el modo plano. La frase en dos renglones, los seis valores en lista, el CTA que la escena desliza en su bloque
   clavado (sin giro: el del teléfono del home); tocá «HABLANOS»: el contacto con web marcado. Después la pantalla de la sala sola (el piso
   se calma) y el pie apilado.
5. A 1024 × 768 y a 768 × 1024: lo mismo que 1440 (escenario) y 390 (lista), respectivamente; mirá que el pie plano de escritorio no pise el
   logo a 1024.
6. Con movimiento reducido a 1440: la lista (el CTA quieto, sin giro) y la resolución de una (sin el paso intermedio).
7. El home, `http://localhost:3000/v3`, al final: Seis razones → reseñas → CTA y el pie con el encastre del logo, como antes.
8. Contraste: el texto en claro del cierre sobre la sala de noche (los valores, la lista, el pie) no lleva la sombra de la intro; si en algún
   tramo no llega a AA, el arreglo es sumarle `--sombra-de-la-intro` (`_estilos/intro.css`), fuera de este sprint.

Banco nuevo, sin correr: `BASE=http://localhost:3000 ANCHOS=1440,390 npx tsx scripts-carga/cierre-de-pagina.ts` (el relevo de la pista, la
transformación en la pose C, el CTA con su precarga y el contacto, la resolución antes de que el pie asome y el pie al fondo con el final del
home quieto). Su control: `CONTROL=sin-resolucion …` (la variante recibe siempre 0) tiene que dar FALLA en «resolución».
