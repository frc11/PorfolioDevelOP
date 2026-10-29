# L5 · resultado (carril b: `cola3b/2026-10-28`, worktree `C:\nocturno\cola3b`)

Base `ce589d21` (L6). Commits: `d3cafeb8` (aro y salida), `469af329` (reflejo del CTA, teléfono), `c0b4e61e` (pie y FAQ), `594dc704` (s88, banco de fotos, plan) y `9912f6b7` (arreglos de la revisión independiente, abajo). Fotos y salidas: `C:\nocturno\cola3-fotos\b\L5\`.

## Ítems

### 1 · El aro — hecho
- a) `?resenas=scroll` es el defecto; `?resenas=gatillo` queda (`tramo.ts`). s83 «[L5] scroll por defecto» con su control.
- b) Sin selección al arrastrar: `select-none` en la capa del aro. Banco: arrastre sobre la tarjeta del frente → selección vacía (`fotos-1440.txt`, «arrastre {"seleccion":""}»); s88 §5.
- c) De espaldas, papel liso (la tarjeta no se pinta); ninguna tarjeta encima de una placa más cerca (`tarjetas.ts`, `delante`). s83: en una vuelta entera, 0 tarjetas de espaldas y 0 pisadas con la cámara de la lectura y con una de costado; el resguardo con un caso armado y su control. Foto `l5-escritorio-1440/01-lectura.png`.
- d) El reflejo del CTA escondido: `Reluciente` se monta sólo con el CTA tocable. En la lectura, 0 reflejos montados (`fotos-1440.txt`); s88 §2.

### 2 · La salida de las reseñas — hecho
- La salida es un gatillo con las dos variantes (3,6 s). Orden: la cámara sube a la pose del guardado (desde arriba, en diagonal: altura 9, distancia 19), el piso se abre entero ANTES de que se mueva la primera placa, bajan, el piso se cierra, y recién ahí la cámara suelta y el CTA deja de esperar. s83 «[L5] el piso se abre entero antes…» con dos controles (la cámara de antes, el anillo de antes).
- El piso se abre de verdad: el dibujo descarta la corona, la simulación deja al ras 1,2 u alrededor (el mouse no levanta bloques sobre las placas) y debajo hay un pozo de tinta (paredes y fondo). s88 §1; s49, s50, s51, s70, s72, s38 verdes.
- Banco `resenas-volteo.ts MODO=salida` a 1440: «ok: el aro en el cuadro hasta guardarse, la cámara sale de B después y llega a C sin salto, el cartel entero» (`banco-salida.txt`); fotos `resenas-salida/salida-1440-00…05.jpg` (arriba, abierto, bajando, cerrándose).

### 3 · Reseñas en el teléfono y la tablet — hecho
- La pista a sangre: a 390 y 768 su caja va de 0 al ancho de la ventana, sin desborde del documento (`fotos-390.txt`, `fotos-768.txt`); fotos `l5-telefono-390/01-resenas.png`, `l5-telefono-768/01-resenas.png`.
- El CTA de la lista es un gatillo: pasado 0,2 del bloque clavado corre solo (deslizamiento de 1,4 s) y vuelve al subir antes de 0,12. Fotos `03-cta-disparado`, `04-cta-1-5s`, `05-cta-llegado` (sin scrollear entre la 03 y la 05). s88 §3. `resenas-telefono.ts`: 20 de 20.

### 4 · Pie → FAQ en escritorio — hecho
- El botón en un renglón y más abajo (la placa 3D también: estaba pegada al logo y pisaba las columnas): 42 px del borde de abajo. Foto `l5-escritorio-1440/03-pie-con-el-boton.png`.
- Los recuadros en el aire: eran los huecos de las piezas del pie, que se volvían a abrir sobre las piezas ya hundidas cuando se cerraba el piso de su columna (`huecosDeLaCaida.ts`). Foto `10-faq.png` sin ellos; s78-c2-71 con el control de la condición de antes.
- «Preguntas frecuentes», la introducción y las preguntas; el bloque mide lo del formulario (sin el 30 % de más). Foto `10-faq.png`.
- El aviso centrado: su centro a −3/−4 px del centro del bloque (`fotos-1440.txt`).
- El guardado de la respuesta es el del formulario (`pisoDelHundimiento`): la placa negra entera baja por su hueco abierto, el piso se cierra encima y vuelve con la respuesta; sin negro en las esquinas. Fotos `11…16-respuesta*.png`; s88 §4 con el control de la curva de antes.
- El WhatsApp del FAQ hace lo del pie: se hunde con el mouse, el foco y al apretar, se aclara y suena (el selector del sonido de las piezas del pie). Medido: la cara pasa de −4,096 a −4,200 con el mouse encima (`fotos-1440.txt`); s88 §4.
- Banco `faq-del-pie.ts` a 1440: entrada, respuesta, teclado, salida, foco, botón una vez, la vuelta al pie: todo ok (`banco-faq.txt`).

### 5 · Teléfono: el FAQ primero y después el pie — hecho
- Abajo de 1024, en el home, la lista va ANTES del pie (anotada como tramo: la escena no la ve). A 390 y 768: `faqArriba: true` (`fotos-390.txt`, `fotos-768.txt`); fotos `06-faq.png`, `07-pie.png`. Banco `faq-del-pie.ts` a 390: home y página base ok (`banco-faq-390.txt`).

## Verificación
- `tsc --noEmit`: 0 errores. ESLint limpio en lo tocado.
- Invariantes: s83-resenas 146/0 (149/0 después de la revisión), s83-resenas-telefono 43/0, s88-l5 30/0 (nueva, 13 controles), s78-c2-71 39/0, s78-b10 55/0, s78-b13 42/0, s71-faq-telefono 31/0, s49 54/0, s50 61/0, s51 46/0, s70 77/0, s72 42/0, s38 56/0, s85 54/0, s36 66/0, s71-pulido-20 56/0, s78-b12a 162/0, s78-b9 49/0, s10-acceso 77/0, s4-paquete 21/0.
- Bancos (dev :3003): `resenas-volteo` salida ok; `aro-legibilidad` ok (núcleo ≥ 7,9:1); `aro-costo` (el aro 0,1 ms de mediana, p95 0,2 ms); `faq-del-pie` 1440 y 390 ok; `cierre-de-pagina` 1440 y 390 ok; `resenas-telefono` 20/20; humo del home (`humo-l6.ts`) a 1440 y 390 ok.
- No verificado: `npm run verificar` completo (no se corrió en este lote); la placa del banco fue la NVIDIA (la que eligió Windows).

## Revisión independiente
- Sin defectos de producción.
- Aplicado: el lazo de «ninguna tarjeta encima de una placa más cerca» no se dispara con las cámaras del sitio, así que el cableado no estaba fijado: s83 afirma ahora que la segunda pasada le pasa `delante` a `llevarLaTarjeta` con las placas más cerca (dos controles: sin `delante`, con la comparación dada vuelta).
- Aplicado: el umbral de la nuca sin texto subió a 3,5.
- Aplicado: el alfa del fondo del pozo (`uFondo`) no hacía nada (material opaco); se quitó.
- Descartado: `cajaDelLogo` en cada cuadro (8 proyecciones; el banco `resenas-volteo` lee `logo`).
- Después de la revisión: tsc 0, s83-resenas 149/0, s88-l5 30/0, ESLint limpio en los dos archivos.

## Tests cambiados porque cambió la spec
- s83-resenas: la bandera por defecto (scroll), la nuca sin texto, la salida gatillo con las dos variantes (antes sólo con `gatillo`), la pose del guardado (desde arriba, no B), la espera cableada sin la variante, 3,6 s.
- s83-resenas-telefono: la clase de la pista (a sangre).
- s78-c2-71: el bloque de preguntas por lo menos del alto del formulario (era más alto); la condición de los huecos de las piezas.
- s78-b10 y s71-faq-telefono: el FAQ del home se monta dos veces (antes del pie en el teléfono, después en escritorio).
- `scripts-carga/faq-del-pie.ts`: a 390, en el home, la lista se mira donde está (antes del pie) y se afirma que va antes.

## Decisiones tomadas solo
- L5-1 · La salida es gatillo en las dos variantes; después del guardado, la transformación al CTA sigue al scroll (sólo su espera suelta por tiempo). Hacerla entera por tiempo obligaba a desatar la cámara del recorrido.
- L5-2 · La pose del guardado: altura 9, distancia 19, encuadre 0,25 (+0,2 mirando al hueco mientras bajan); 3,6 s en total.
- L5-3 · El piso se abre de verdad (corona descartada, al ras alrededor, pozo de tinta de 3,6 u) en vez de la ranura pintada.
- L5-4 · El resguardo de «no encima de una placa más cerca» va por cajas proyectadas; con las cámaras del sitio no se dispara nunca (lo de `lote2/09` era una tarjeta de espaldas, que ya no se pinta): queda de red.
- L5-5 · «Enteras, el límite es la pantalla» = la pista a sangre con la deriva de siempre (no un carrusel por pasos).
- L5-6 · El CTA del teléfono: 2,8 s de transformación (1,4 s el deslizamiento); el bloque sigue midiendo tres pantallas (no mueve la escena).
- L5-7 · La introducción del FAQ también en la lista del teléfono.
- L5-8 · El botón del FAQ baja en la escena 1,6 alturas suyas (su lugar lo pone la placa 3D, no el DOM).
- L5-9 · El sonido del WhatsApp del FAQ: su bloque entra al selector de las piezas del pie (`ControlDelSonido.tsx`).
- L5-10 · El FAQ antes del pie sólo en el home; las páginas siguen como estaban.

## Supuestos y descartes
- La captura `lote2/12` era la variante scroll (la de Valentino): la salida de entonces era del scroll y la cámara se iba a C mientras bajaban.
- La mancha de `lote2/10` era la franja blanca de `Reluciente` con la mezcla del texto encima del logo.
- No se tocaron las páginas (`CierreDeLaPagina`): su FAQ sigue después del pie en el teléfono.

## Qué tiene que mirar Valentino
1. `/v3` a 1440: bajá hasta las reseñas y seguí. La cámara sube y mira desde arriba, el piso se abre, las reseñas bajan, se cierra, y recién ahí se va al CTA. Arrastrá una tarjeta: no se pinta nada de azul; las de atrás, blancas.
2. `/v3` a 1440 al fondo: «Scrolleá una vez más…» abajo y en un renglón; tocalo. Preguntas con su introducción, el aviso centrado; tocá una pregunta (el bloque negro se guarda entero como el formulario) y pasá el mouse por «¿Te quedaron dudas? Escribinos».
3. `/v3` a 390 (y 768): las reseñas entran y salen por el borde de la pantalla; seguí bajando y el CTA llega solo; al final, las preguntas antes del pie.
4. Bandera: `?resenas=gatillo` (la entrada por tiempo; por defecto, scroll).
