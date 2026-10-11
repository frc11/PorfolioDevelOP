# SPRINT PULIDO 14 — nocturno

Rama `rediseno/home`. Invariante nuevo: `npm run test:s65-pulido-14` (`src/app/v3/_lib/__tests__/s65-pulido-14.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base) y `~/.cache/b4-medicion/pulido-14/_scripts/` (los de este sprint).
Recibos: `docs/rediseno/entregas/pulido-14/`.

Aprobados (no se tocan): el modal de Contacto completo (apertura, loader, éxito, error), los sonidos de éxito y error, mobile
completo (K5), la caída del logo como concepto. `lente.ts` (sólo fin de línea) fuera de los commits.

Nocturno: el humano no está. Ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- Los scripts del banco base (`pulido-11/_scripts`: `banco11.ts`, `g-matriz.ts`, `g-entradas.ts`, `cajas.ts` y el resto) se
  habían borrado con la limpieza del disco. Se REHICIERON repitiendo, en una caja aislada y en orden, lo que los escribió en los
  transcripts de PULIDO 10–13 (Write/Edit y los Bash que sólo tocaban esas carpetas, con los programas del banco apagados). Dos
  detalles para que el resultado sea el de entonces: la herramienta Bash junta `\\` en `\` (también dentro de un heredoc con
  comillas) y la Edit respeta el CRLF que deja Python en Windows. Todas las ediciones de los transcripts aplican sobre lo rehecho.
- El dev server del humano (3,4 GB) se apagó para el banco.

### Fase 0 · Lo pendiente de PULIDO 13
- HECHO · VISTO sí (banco). `npm run verificar` completo (con el dev server apagado, 5,9 GB libres): 71 pasos, 8 rojos, los de la
  base (s1, s17, s2, s3, s4, s5, s7, s8) y ni uno más.
- La matriz que faltó (`pulido-14/tanda-0.sh`, contra el build de HEAD 234058d0; comparada con la de PULIDO 12 en
  `pulido-13/base-p12/`, `comparar14.py`):
  - Matriz de 390, 1920 y 2560: nada nuevo. De 1024, 1280 y 1366: «viaje lento bajando a Servicios» (y a 1366 a Tu panel). El
    viaje pasa por Quiénes somos, donde K1 recortaba el cuerpo cada cuadro (el contorno del logo a seis profundidades): se vuelve
    a medir sin K1 (L1 lo borra).
  - Entradas de 1366, 1440, 1920 y 2560: lo nuevo es el cuerpo de Quiénes somos sobre el logo (lo de L1: el recorte de K1 que el
    instrumento no entiende, el cuerpo cortado al medio). Y a 1366/1440 subiendo, «Seis razones» (la frase 3D de Por qué develOP)
    contra un texto de Servicios: falso positivo del instrumento (la frase 3D figura visible mientras se va; en la captura no se
    dibuja; el mismo patrón ya estaba en Tu panel en PULIDO 12).
  - Entradas de 375: la frase del CTA contra «Demos» subiendo, 11 solapes (PULIDO 12: 16): el patrón conocido, menos que antes.
- K1 al entrar a 1280 (`k1-detras.ts`): hasta 6 letras visibles con el logo delante y 2 tapadas de más (moot: L1 borra K1).
- Disco al terminar: 80 GB libres; memoria entre 4,5 y 6,5 GB disponibles (el dev server apagado).

### L2 · El pie
- a) LA CÁMARA, UN SOLO MOVIMIENTO · HECHO · VISTO sí (banco `pulido-14/_scripts/l2-camara.ts`: por cuadro, la velocidad angular
  del eje de la cámara desde antes de llegar al pie hasta después del golpe, y el rebobinado; recibo `l2-camara.json`).
  - Lo que se veía (medido antes, 1440): el logo empieza a volcar y la cámara se acomodaba (el paralaje del mouse se iba atado al
    ángulo: hasta 20 °/s en 0,35 s, el desvío de 9° corregido de golpe), frenaba en seco a los 7,9° (0,1 °/s: el logo, que duda en
    su equilibrio, la dejaba casi quieta) y recién después lo seguía. Eran los dos movimientos.
  - La causa: en K4 la cámara era función del ÁNGULO (el paralaje y la subida), y la caída tiene una duda (la física arranca del
    reposo, a los ~8°): todo lo atado al ángulo se detiene ahí.
  - Ahora (`recorridoDelFinal.ts`): el desvío del arranque se corrige con el TIEMPO, de a poco, entre que el logo empieza a volcar
    y llega a 20° (`acercamiento`, la curva suave: arranca y llega quieta); la elevación de cada cámara es la suya más lo que el
    logo la pasó (una rampa suavizada de 1°), por el acercamiento (`alturaDeLaCaida`): sube siempre, nunca frena ni vuelve, y desde
    los 20° va de frente. El paralaje de costado se va con el mismo acercamiento girando hacia el azimut sin el mouse
    (`haciaElAzimutSinElMouse`; el de altura lo absorbe la subida, así no baja antes de subir). Antes del vuelco la cámara no se
    mueve (K4, aprobado). Todo es función de `fin`: el rebobinado hace el mismo camino al revés.
  - Medido después (1440, NVIDIA): ninguna detención desde el vuelco al golpe (antes 1); en la duda del logo, 3,4–6 °/s con el
    mouse a un costado y 0,9–3,6 al centro (antes 0,1); el mayor salto con el logo a menos de 20°, 2,7 °/s por cuadro (antes 6,2);
    al golpe, 0,82° de frente. El rebobinado: sin detenciones.
  - Invariante (s65): el modelo del cuadro, sin navegador, con el mouse en cinco lugares: sin detención y sin saltos (la prueba de
    los dos pasos: un salto no se achica al achicar el paso; la aceleración sí, a un cuarto), al golpe < 1°; control positivo: la
    cámara de K4. s64 (K4 a) sigue afirmando la referencia de frente (`subida`) y el cableado nuevo.
  - LECTURA ANOTADA: «entre la llegada al pie y el golpe» se leyó desde que arranca la caída (el vuelco): antes del vuelco la
    cámara del recorrido ya llegó y espera quieta (K4 a, aprobado: «antes de la caída la cámara no se mueve»), y lo que el humano
    describe (se acomoda, frena en seco, sigue) es lo de adentro de la caída, medido. La otra lectura (que la cámara no pare
    nunca desde que el recorrido llega) pediría arrancar la caída con el recorrido todavía en movimiento: no se implementó.
- b) EL FORM DEL PIE, CON TEMPORIZADOR · HECHO · VISTO sí (banco `l2-temporizador.ts`, recibo `l2-temporizador.json`). Como el
  panel: la tarjeta del éxito tiene su línea de cuenta (`TarjetaDeResultado`, `cuentaMs`) y a los 4 s de que su texto está vuelve
  SOLA al form vacío con el volteo inverso (`VUELTA_SOLA_MS`); «Enviar otro mensaje» sigue antes. El foco, si estaba en la
  tarjeta, va al form (no a un campo: en el teléfono abriría el teclado). Medido: a 1440 (en volumen) la cuenta arranca a los
  4,64 s y vuelve a los 8,64 (4,0 s); con «Enviar otro mensaje» a los 2 s de la tarjeta, vuelve ahí; a 390 (DOM), igual.
- c) LOS INPUTS DESPEGADOS DE LA PLACA · HECHO · VISTO sí (bancos `l2-inputs.ts` y `l2-vuelta.ts`, recibo `l2-campos.json`).
  - Reproducido: con el pie quieto los campos están en su lugar (la hoja de `l2-inputs`); el despegue es al irse y al volver. La
    CAUSA: el DOM del formulario va donde la placa VA a quedar (la homografía con el viaje en cero) y la placa llega volando por
    columnas (o se va, al subir); lo que el DOM muestra (lo escrito, a mano o autocompletado, y el anillo del foco) quedaba a la
    vista aparte de la placa que volaba. Vacío y sin foco no se ve nada (los campos son transparentes en 3D): por eso pasaba con
    los tres casos. Medido antes: 77 cuadros (escrito a mano) y 84 (con foco) con el DOM entero y la placa en 0.
  - Arreglo (`armadas.ts`, `DOM_CON_LA_PIEZA`): el DOM de cada pieza se apaga mientras vuela y se enciende en el último tramo de
    su llegada (desde el 90 %), sin pisar el apagado del volteo. Y al irse del pie el campo con el foco lo suelta
    (`FormularioDelPie`: el navegador no lo vuelve a traer a la vista). Lo escrito a mano se conserva; lo autocompletado se sigue
    vaciando (K4 b). Medido después: el DOM a la vista sólo con la placa en el 93–96 % de su llegada (2 cuadros, en la rampa);
    el foco suelto al volver.

### L1 · Quiénes somos: el texto siempre delante y legible
- HECHO · VISTO sí (banco `pulido-14/_scripts/l1-cruce.ts`: en el reposo del viaje, en la entrada y en la salida de a 48 px, por
  cada letra visible del cuerpo, si su centro cae en la silueta del logo; el contraste como WCAG; recibo `l1-cuerpo.json`).
- El recorte de K1 se borró con su código (`detrasDelLogo.ts`, el recorte en `acompanantes.ts`, el gancho del rayo del banco): el
  cuerpo va SIEMPRE delante y entero.
- El velo (`banda.css`, desde 1024): la receta de Portfolio, un degradé radial del papel detrás del cuerpo, sin caja; sobre el papel
  no se ve y sobre la tinta del logo la aclara detrás de las letras. Su caja (1,8 × el ancho del bloque, 2,4 × su alto) deja todas
  las letras en la parte entera del degradé (el 70 %). De noche se espesa con `--noche-de-la-sala` (de 82 % a 96 % del papel: el
  cuerpo es de tinta también de noche).
- La composición: el cruce estaba todo en la SALIDA (antes, en reposo y entrando, 0 %): el párrafo sube con la página por la parte
  de abajo a la izquierda del logo, que gira de canto camino a la pantalla del equipo. Se probaron, inyectando CSS en el banco, la
  columna angosta (22rem: a 1440 bajaba del 32 % al 13 %, a 1024 del 42 % al 30 %) y el cuerpo a la DERECHA del logo (0 % en los
  tres anchos probados). Quedó a la derecha: columnas 7 a 12, contra el borde, `min(26rem, 30vw)` (`geometria.ts`): el titular
  arriba a la izquierda, el ≠ a la izquierda, el cuerpo abajo a la derecha. LECTURA ANOTADA: el pedido deja elegir posición o
  ancho; el ancho solo no alcanzaba a 1024–1440. La columna de antes queda con `?cuerpo=izquierda` (con el velo).
- Medido (1024, 1280, 1366, 1440, 1920, 2560): el porcentaje del cuerpo que cruza la silueta, antes → después: salida 42,1 → 0;
  29,9 → 0; 29,9 → 0 (reposo 0,5 → 0); 32,2 → 0; 7,0 → 0; 21,0 → 0 (reposo y entrada, 0 en los dos). El contraste del cuerpo,
  8,7 a 10,4:1. Con `?cuerpo=izquierda` el cruce sigue (42 % y 32 % a 1024 y 1440) y el velo deja los renglones de encima del logo
  en 8,1 y 7,7:1 (sin velo, tinta sobre tinta: ~1:1). La noche: al volver de Portfolio con el menú la noche ya se retiró en el
  reposo (`--noche-de-la-sala` 0, el cuerpo 9,3:1); con la noche todavía puesta (de Portfolio a Quiénes somos con la rueda
  rápida): la variable de la noche en 1 (el velo en su versión más espesa) y el cuerpo en 8,26:1 (a la izquierda, 9,52 y los renglones sobre el logo 12,85:1). En la captura la sala ya es de día: la noche visible se retira antes de que el cuerpo entre (a los 0,9 s la variable ya está en 0).
- El instrumento de contraste se corrigió en el camino: el de PULIDO 11 tomaba de fondo los píxeles suavizados del borde de las
  letras (daba 2,6–3,3:1 sobre el papel); el nuevo es el de WCAG (la tinta contra el fondo típico, por tramos de 40 px, el peor).
- Los invariantes: s64 pierde la sección de K1 (su recorte se borró, nota en su lugar); s65, L1 (el recorte borrado, el velo con la
  geometría de su caja, la composición y lo medido), con controles positivos. Dos nombres del velo se cambiaron para no disparar el
  invariante de PULIDO 1 que ata el velo de Portfolio a la banda de abajo de 1024 (decía `degrade-del-velo`).

### L3 · Destellos de energía (`?destellos=`)
- HECHO · VISTO sí (banco `l3-destellos.ts`, una corrida por variante; hoja comparativa `pulido-14/l3/hoja-final.png`, recibo
  `l3-destellos.json`). El polvo sigue siendo el producto: sin la bandera nada cambia.
- Los hilos se borraron con su código y su bandera (`_lib/escena/hilos/`, `?hilos=`; sus secciones en s62 y s64, con nota).
- Los destellos (`_lib/escena/destellos/`): una nube de puntos (`gl.POINTS`) sin posiciones guardadas: cada vértice es una semilla y
  el sombreador calcula dónde está en el cuadro (una llamada de dibujo, nada por cuadro en la CPU). 96 000 en escritorio y 48 000
  en el teléfono (el polvo: 3000). Profundidad de verdad: el tamaño es el del mundo a esa distancia y la lejanía los apaga. Titilan;
  los más brillantes, con un brillo en cruz chico. Detrás de una caja de texto se apagan (con el borde ancho: un campo denso no deja
  un rectángulo). En el final del pie se apagan con la cámara que sube. Monocromos: de noche, blanco que suma luz; de día, tinta con
  un halo claro. `?destellos-color=si`: un azul frío (cian de noche), hecho de tono, saturación y luz. El dedo hace lo del mouse.
- Las variantes (`?destellos=`):
  - `chispas`: a la deriva y titilando; con el puntero se juntan sueltos hacia él, brillan y aparecen trazos tenues entre vecinos (la
    constelación: 12 000 de los destellos, a sus 3 vecinos); al irse, se sueltan.
  - `agujero`: el puntero es un pozo: los cercanos entran en órbita (más rápida adentro), se aprietan en un disco y se estiran en
    estelas; al irse siguen girando, frenando, y se dispersan con inercia hacia afuera.
  - `infinito`: cerca del puntero se alinean en corrientes que dibujan un ∞ alrededor de él, en movimiento; sin puntero, cada 9 s un
    ∞ se insinúa en el campo y se deshace.
  - `estallido`: cada tanto, en puntos al azar, un estallido radial que se frena y queda flotando; con el puntero se condensan en un
    núcleo brillante y al irse lo liberan en un estallido.
  - `galaxia`: el campo gira lento en espiral alrededor del logo (dos brazos, rotación diferencial) y un halo; con el puntero, un
    brazo local se curva hacia él.
  - `lente` (propuesta): estrellas a tres profundidades, con estrellas fugaces; el puntero es una lente gravitatoria: la luz de atrás
    se curva a su alrededor y se apila en un anillo, que brilla más.
- Las rondas (el banco de cada una, mirado en su hoja): la 1 (48 000) se veía bien de noche y muy sutil con el mouse y de día, y la
  galaxia saturaba; la 2 subió el alcance y el brillo del puntero, la presencia de día y bajó el núcleo de la galaxia; la 3 hizo que
  el ∞ y la lente se lean (los que el puntero toma se comprometen con la forma, más grandes) y la cantidad pasó a 96 000. El banco
  movía el mouse sobre el logo negro (de día, tinta sobre tinta: no se veía nada): las capturas ahora lo mueven en el cielo.
- Medido (NVIDIA RTX 5050, la pantalla del banco a 75 Hz): las seis variantes, con 96 000 a 1440 y 48 000 a 390, de día, con el
  mouse, de noche y en color: 13,34 ms de media (el tope de la sincronía), p95 13,4–13,8 y ningún cuadro de más de 20 ms. El
  barrido de la cantidad (chispas): con 160 000 a 1440 y a 390, igual. Se dejó 96 000 / 48 000 con margen para placas más débiles
  (la integrada AMD no se midió: la bandera del banco pide la de alto rendimiento).
- Dos tropiezos del banco: `npx` pisa la variable de entorno `COLOR` (npm la pone en 0 cuando la salida no es una terminal): las
  corridas «en color» de la tanda C salieron monocromas; la variable pasó a `DESTELLOS_COLOR`. Y el compilador del sombreador
  avisaba una división por cero en una rama que no se usa (la estela, cero en las demás variantes): se sacó la división.
- URLs: `/v3?destellos=chispas`, `/v3?destellos=agujero`, `/v3?destellos=infinito`, `/v3?destellos=estallido`,
  `/v3?destellos=galaxia`, `/v3?destellos=lente`; con `&destellos-color=si`, en azul frío.

### L4 · Diagnóstico del build de producción
- HECHO (informe: `docs/rediseno/BUILD-PRODUCCION.md`; sólo leer, correr y escribir: nada compartido ni de configuración se tocó).
- Con el dev server apagado y el banco cerrado (7,2 GB), `CIRCLE_NODE_TOTAL=2 NODE_OPTIONS=--max-old-space-size=6144 npm run build`:
  salida 0 en 190 s, una sola corrida, sin errores ni avisos (el `prebuild` pasa: la llave del contenido inventado está en `false`;
  TypeScript 42 s; 44 páginas estáticas). Lo que se sube: 11 MB de estáticos y 125 MB de servidor.
- Para un preview en Netlify: las variables críticas (con las `NEXT_PUBLIC_*` antes de buildear), la memoria del build (4096 en
  `netlify.toml`), el límite de 10 s de las funciones (no afecta a /v3, que es estática; sí al chat de 30 s y a dos crons de 300 s)
  y el formulario de /v3, que valida pero no envía a ningún lado (bloquea producción, no el preview).
- Los 8 rojos con el build: s1 se pone verde entero (y s2-css, s4-heredado y s8-chrome adentro de sus agregados); los otros siete
  siguen: cuatro por cosas que no son del build (s4-cobertura, s5-compacto, s8-montaje, s17-revelado) y el resto por el peso y la
  carga inicial de /v3 (three.js y tres curvas en el archivo inicial; los techos de peso). Todo de /v3; nada del sitio compartido ni
  de Franco. El plan, en siete pasos con sus riesgos, en el informe.

### Final · verificar
- PENDIENTE.

## Disco y memoria (antes de cada tanda: disco libre, memoria disponible y no paginado)

| Cuándo | Disco libre | Disponible | No paginado | Nota |
|---|---|---|---|---|
| arranque (dev server del humano prendido) | 88,8 GB | 3020 MB | 897 MB | |
| dev server apagado | 88,8 GB | 5886 MB | — | |

## VERIFICAR TRAS REINICIO

(vacío por ahora)

## Lo que no quedó bien

(se completa al final)
