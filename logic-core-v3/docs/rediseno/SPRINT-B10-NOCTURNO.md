# SPRINT B10 · nocturno del 2026-10-22 — el FAQ después del pie

Rama `nocturno/2026-10-22-b10` (nace de B13, `491e5ab2`). Tarea: `docs/cola/2026-10-22/62-B10-faq.md`. Sin navegador: lo que se ve lo mide
el orquestador (abajo, «Qué mirar»). Las pruebas sin navegador: `s78-b10` (`npm run test:s78-b10`), cada una con su control positivo. La
firma, en `docs/rediseno/B12a-API.md` §8 (el punto 4 y «Para una página de servicio»).

## Plan

### La forma (lectura del código)

- El final del home ocurre AL FONDO del documento (`cuadroDelFinal.ts`: `s.fondo` sale de `offsetHeight`, el LAYOUT, y lo fijan como texto
  s51, s71 y s78-b13): el logo cae a su hueco, la cámara sube y el pie de volumen queda acostado en el piso (`SALIDA_EN_VIVO.acostado`).
  Al fondo, los gestos de scroll ya son de la escena (`gestosDelScroll.ts`: un gesto hacia arriba rebobina el encastre).
- El efecto del formulario del pie: la placa baja por su hueco, el piso se cierra sobre ella, a cubierto se cambian, el piso se abre y
  sube la otra (`transformacionDelPie.ts` + `pisoDelHundimiento`, `CAMBIO_DEL_PIE` 2,04 s). El pie entero ya sabe hundirse en sus huecos
  con el piso cerrado antes de un viaje (`salidas.ts` b, `SALIDA_EN_VIVO.hunde`, leído por `caida.ts` y `huecosDeLaCaida.ts`).
- En una página el pie es plano (B13, `ModoDelPieForzado`) y el final del home no corre.

### La forma (lo que se arma)

- **El gatillo, sin sumar alto**: el FAQ nace del pie EN LA MISMA PANTALLA. Seguir scrolleando al fondo (un gesto nuevo hacia abajo con el
  pie entero) lo trae; subir (un gesto nuevo hacia arriba) lo saca. Como el final ya escucha esos gestos, el FAQ es un **dueño primero**
  de los gestos (`gestosDelScroll.ts`, `tomarLosGestos`): los ve antes que el final y, si los toma, el final no se entera (no rebobina).
  El teclado: el foco que entra al FAQ lo trae, el que vuelve al pie lo saca.
- **El reloj** (`_lib/pie3d/faqDelPie.ts`, puro): `fuera → entrando → adentro → saliendo → fuera`, con el tiempo del cambio del formulario:
  entrando, el pie se hunde la primera mitad y el FAQ sube la segunda (saliendo, al revés); dar la vuelta a mitad sigue desde donde iba.
- **El pie se hunde con el mismo efecto**: el de volumen, por la escena, con el hundimiento que ya existía (`pasoDelHundimiento` toma el
  del FAQ); el plano (la página), en el DOM con la curva de la placa (`hundimientoEnElDom.ts`, `pisoDelHundimiento` sin three).
- **Los bloques** (`_componentes/faq/`): de vidrio (el material del formulario del pie de abajo de 1024), a la izquierda el título y las
  preguntas (botones), a la derecha el aviso «Tocá una pregunta y mirá lo que pasa.» (titular liviano); al tocar una, se hunde lo que
  estaba y sube la respuesta (`relojDeLaRespuesta.ts`); con la primera sube abajo «¿Te quedaron dudas? Escribinos» (WhatsApp, el número
  del repo). Todo el texto en el HTML (las respuestas que no se ven, `hidden`) y en los datos estructurados (`FAQPage`).
- **Abajo de 1024 o con menos movimiento: la lista**, después del pie, en papel, sin efectos y sin WhatsApp. En el home cuelga FUERA del
  layout (`absolute`, debajo de la sección del pie): suma desborde y no alto, así el fondo del final (el layout) sigue siendo el del pie y
  el encastre corre donde siempre; mientras se ve, los gestos son de la página (el final no los retiene). En una página va en el flujo.

### Riesgos

- Sin navegador: el lugar de los bloques sobre el pie acostado (desde arriba, a 85°) va por CSS con el hueco del logo del pie; lo mide el
  orquestador. El vidrio de los bloques toma el tono de lo que tiene debajo (`useTonoDebajo`); en una página, el de la sección invertida.
- Las suites que leen el marcado del home (s10) ven una región más (el FAQ) con seis botones.

## Log

- **El motor** (sin three ni React):
  - `_lib/pie3d/faqDelPie.ts`: el reloj del FAQ, con `MITAD_DEL_CAMBIO_MS` = la mitad de `CAMBIO_DEL_PIE` (1,02 s); `nivelesDelFaq` (nunca
    los dos arriba); `entrar`/`salir` dan la vuelta en el punto en que iban; `hundeDelFaq` para la escena; la decisión del gatillo
    (`decidirElGestoDelFaq`: `entra | sale | toma | suelta | sigue`) y la cola del gesto que lo movió (`guardaHasta`, 200 ms por evento).
  - `_lib/pie3d/salidas.ts` c): `pasoDelHundimiento` es el máximo del de un viaje y el del FAQ: el pie de volumen se hunde en sus huecos con
    el piso cerrado (lo que la escena ya hacía antes de un viaje: `caida.ts` y `huecosDeLaCaida.ts`, sin tocarlos) y vuelve a subir al salir.
  - `_lib/gestosDelScroll.ts`: el DUEÑO PRIMERO (`tomarLosGestos`): ve el gesto antes que los retenedores y, si lo toma o lo suelta, el
    final del pie no se entera (no rebobina el encastre). Los escuchas, compartidos; las líneas que s51 y s52 leen, iguales.
    `cuadroDelFinal.ts` y `recorridoDelFinal.ts` no se tocaron (sin una línea más).
  - `_lib/formularios/volteo.ts`: `HUNDIMIENTO_DEL_PIE` y `pisoDelHundimiento` pasan acá (sin three: los usa el DOM); `transformacionDelPie.ts`
    los re-exporta.
  - `_lib/escena/final/encuadreDelPie.ts` (abajo de 1024): el fondo del LAYOUT (`offsetHeight`, el del final) en vez del desborde, y lo del
    FAQ no cuenta como algo que tapa el logo.
- **El FAQ** (`_componentes/faq/`): `FaqDelPie` (el modo; en el servidor, el escenario cerrado: sólo el recorte, ninguna transformada),
  `FaqEnEscenario` (los bloques, el cuadro que corre sólo mientras algo cambia, las flechas, `__faqDelBanco`), `FaqEnLista`, `useGatilloDelFaq`
  (los gestos, el foco, la página que se va), `hundimientoEnElDom`, `relojDeLaRespuesta`, `VidrioDelFaq` y `preguntas` (los datos, `FAQPage`,
  WhatsApp con `NUMERO_DE_WHATSAPP`).
- **El montaje**: el home, en su pie (`Cierre.tsx`, adentro de la sección; la lista cuelga debajo, fuera del layout); una página, en su
  cierre (`CierreDeLaPagina` con `preguntas`, después del pie; las tres columnas del pie, `data-columna-del-pie`). La página base pasa las
  suyas (`pagina-base/faq.ts`, como la de Páginas web); el home, las de develOP (`_secciones/cierre/faq.ts`). Seis cada una, sin cifras.
- **A la spec nueva** (cada una con su control): `s78-b13` (la base monta el cierre con `preguntas`), `s10-acceso` (`DELTA_DEL_FAQ`: seis
  paradas más, las preguntas, y un encabezado, su título; y un control nuevo) y `s52-nocturno-final` (la caja de vidrio del contacto se
  cuenta en el pie, antes del FAQ, cuyos bloques son de vidrio; y un control nuevo).
- **Sin landmarks nuevos**: la raíz del FAQ es un `div` con su `h2` (el home sigue con una región por sección: s7 y s10); las respuestas no
  son regiones; los datos estructurados van en una caja sin lugar que el lector no anuncia (s10 no los cuenta como marcadores).

### El gate (sin navegador)

- `npx eslint` de los archivos tocados y del banco: limpio. `tsc --noEmit` (4 GB): 0 errores.
- `s78-b10` (nueva): 54 afirmaciones, 26 controles positivos, 0 fallas. `s78` entero, 0 fallas.
- Sin fallas nuevas: s9, s10, s34, s36, s37, s39, s40, s41, s42, s43, s44, s45, s49, s50–s65, s70–s76, s78, s83. Con las fallas de la base y
  ninguna más: s3 (s3-peso), s5 (s5-compacto en `quienes-somos`; s5-peso), s7 (s7-compuerta: pide `.next`), s8 (s8-montaje: los seis de
  siempre, ninguno tocado; s8-tres, s8-peso), s17 (s17-revelado, s17-marca) y s47 (el control ciego del recorte del Portfolio).

### Las alturas (REGLA DE ALTURAS)

- **El alto del layout del home no cambia en ningún ancho** (1440 × 900, 1024 × 768, 768 × 1024, 390 × 844): desde 1024 el FAQ va
  `absolute` en la pantalla del pie (dentro de la sección, `bottom-0 h-svh`); abajo de 1024 la lista cuelga `absolute` debajo de la
  sección (suma desborde para scrollear, no alto). La extensión de las secciones (el denominador de la escena) y el fondo del final
  (`offsetHeight`) son los de antes: no hace falta tramo (`k` = 1, nada anotado). Lo que se puede scrollear de más abajo de 1024 es el alto
  de la lista (lo mide el orquestador). En una página la lista va en el flujo después del pie (la regla no aplica al cierre de una página).

## Qué mirar (el orquestador, en el navegador)

1. `http://localhost:3000/v3` a 1440 × 900: bajá hasta el final y esperá el encastre (el logo en su hueco, el pie acostado). Seguí
   scrolleando (una rueda hacia abajo): las piezas del pie se hunden en sus huecos y el piso se cierra (~1 s); después, a los costados del
   logo, se abre el piso y suben dos bloques de vidrio: a la izquierda «Preguntas frecuentes» con seis preguntas, a la derecha «Tocá una
   pregunta y mirá lo que pasa.» (liviano). La página no se mueve. Mirá que los bloques queden donde estaban las columnas del pie y que no
   pisen el logo.
2. Mismo lugar: tocá una pregunta: el aviso baja y se cierra, y sube la respuesta en su lugar (~2 s en total); con ella sube abajo «¿Te
   quedaron dudas? Escribinos» (WhatsApp, abre `wa.me/5493814154708` con un mensaje). Tocá otra: se hunde la anterior y sube la nueva; el
   WhatsApp se queda.
3. Mismo lugar, el teclado: Tab hasta las preguntas (o Mayús+Tab desde el pie): el foco las recorre; ↓ y ↑ pasan de una a otra; Enter abre.
   Mayús+Tab desde la primera vuelve al pie: el FAQ se hunde y el pie vuelve.
4. Mismo lugar: una rueda hacia arriba: el FAQ se hunde, el piso se abre y el pie sube a su lugar; el logo NO se rebobina con ese gesto
   (el siguiente gesto hacia arriba sí lo rebobina, como siempre).
5. `http://localhost:3000/v3/pagina-base` a 1440 × 900: al fondo (el pie del cierre, plano), una rueda hacia abajo: las tres columnas del
   pie se hunden en su lugar y suben los dos bloques (preguntas de Páginas web); lo mismo de 2 a 4 (sin encastre).
6. A 1024 × 768: lo mismo que 1440 (que los bloques entren a los costados del logo sin taparlo).
7. A 390 × 844 y 768 × 1024 (táctil), en el home y en la base: después del pie, una lista en papel con las seis preguntas y sus respuestas
   a la vista, sin WhatsApp. En el home, con el pie al fondo el encastre corre como siempre (detrás del pie) y, bajando, la lista entra por
   debajo; subiendo desde la lista la página sube (el dedo no queda retenido).
8. Con movimiento reducido a 1440: la lista (sin gatillo).
9. Contraste: el texto de los bloques de vidrio sobre la sala de noche del final (el home) y sobre la de la base.

Banco nuevo, sin correr: `BASE=http://localhost:3000 ANCHOS=1440,390 RUTAS=/v3,/v3/pagina-base npx tsx scripts-carga/faq-del-pie.ts` (la
entrada con el pie hundido antes de que suba el FAQ, la respuesta y el WhatsApp, el teclado, la salida sin rebobinar el encastre, el foco;
abajo de 1024, la lista y el dedo suelto; los datos estructurados). Su control: `CONTROL=sin-hundimiento …` (el pie no se hunde) tiene que dar
FALLA en «entrada» desde 1024.

## Lo que quedó afuera

- **P-S (servicios):** el FAQ que hoy está en el cuerpo de las páginas de servicio pasa al cierre (`preguntas`), y sale del cuerpo. Las
  páginas de servicio viven en `paginas/servicios`: acá no están.
- Los bloques del FAQ son DOM (vidrio) sobre la escena, no piezas de WebGL: el pie de volumen se hunde en 3D y el FAQ nace en el DOM con la
  misma curva. Si Valentino los quiere de volumen (como el formulario), es otro sprint (piezas del pie de volumen con su propia columna).
