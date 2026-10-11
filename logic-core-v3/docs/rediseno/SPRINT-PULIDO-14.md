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
- PENDIENTE.

### L3 · Destellos de energía (`?destellos=`)
- PENDIENTE.

### L4 · Diagnóstico del build de producción
- PENDIENTE (informe en `docs/rediseno/BUILD-PRODUCCION.md`).

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
