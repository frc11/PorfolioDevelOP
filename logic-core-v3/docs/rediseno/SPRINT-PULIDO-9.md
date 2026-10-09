# SPRINT PULIDO 9 — el polvo que no se levanta y los estados de envío de los dos formularios

Rama `rediseno/home`. Invariante nuevo: `npm run test:s60-pulido-9` (`src/app/v3/_lib/__tests__/s60-pulido-9.invariant.tsx`).

Aprobado por el humano: PULIDO 8 («HABLANOS» tocable y con su subrayado).

## H1 · El polvo se posa y no se vuelve a levantar

### La causa

No era un estado del golpe, del final, del pie ni de un viaje. Era el cableado entre la máquina de la quietud (`posarse.ts`) y la
simulación (`simulacion.ts`), en `Fisica.tsx`:

- La simulación levanta lo posado con un frente que sale del origen del despertar a 16 u/s (`despierta` en el shader: la mota se
  levanta si el despertar es posterior a cuando se soltó y el frente ya llegó a ella).
- La escena le pasaba ese despertar sólo si era el último y había encontrado el polvo posado (más de `empiezaS` de quietud). Si no,
  le pasaba un despertar de nunca (−1e9).
- Con la rueda, cada muesca llega después de la quietud mínima (`quietudS`, 0,25 s) y antes de `empiezaS` (4 s): es un despertar
  nuevo, sin polvo posado. Pasaba el −1e9 y apagaba el frente de la muesca anterior.
- Lo que ese frente todavía no había alcanzado (todo lo que estaba a más de ~10 u del origen) quedaba en el piso hasta otra quietud
  de más de 4 s. Y con esa quietud lo levantado se volvía a posar.

Un segundo estado sin salida: la mota levantada cuyo lugar en el aire está cerca de las caras de la caja (`cercaDeLasCaras`) sólo
dejaba de estar levantada al volver a posarse. Mientras hubiera movimiento seguía levantada, más visible que el polvo suspendido
(en el aire, cerca de las caras, la caja la apaga porque ahí se repite).

### El arreglo

- **`posarse.ts`:** el frente que levanta lo posado (`FrenteDelPolvo`, `tomarElFrente`) es el del último despertar que encontró el
  polvo posado, con su origen y si fue del cursor.
- **`Fisica.tsx`:** la simulación lee ese frente. Un despertar corto ya no lo apaga. El remolino sigue siendo sólo del despertar
  que encontró el polvo posado.
- **`simulacion.ts`:** la levantada de cerca de las caras, cuando llegó, baja su peso hasta como el aire la dibuja ahí (el fundido
  de salida, 1,5 s) y recién entonces es del aire, sin salto. Con la quietud se posa antes, como siempre.

### Medido en el banco (Portfolio de noche, 1440, `h1-polvo.ts`)

Quieto 14 s (todo en el piso), después 15 s de rueda (una muesca de 60 px y 500 ms de pausa), después quieto.

| | Antes | Ahora |
|---|---|---|
| En el piso durante la rueda | 11.810 de 14.000, los 15 s | 0 a los 2 s |
| Levantadas a los 15 s de rueda | 352 (y 11.810 en el piso) | 0: las 14.000 en el aire desde los 9 s |
| Con scroll continuo (6 px cada 50 ms), levantadas a los 15 s | 4.608 (con el mouse, 5.298) | 0: las 14.000 en el aire desde los 8,5 s |
| Quieto otra vez | se posa | se posa: es reversible |

### El invariante (`s60` H1)

1. Simula posarse (15 s quieto), la rueda (una muesca de 0,1 s cada 0,6 s) y a los 10 s compara la altura media y la dispersión
   con las del polvo suspendido (±0,3). Otra vez quieto se posa y con la rueda vuelve. Usa la máquina de la quietud real y las
   reglas del shader con sus constantes.
   - Control positivo: el cableado de antes falla (lo lejano queda en el piso).
2. El cableado de `Fisica.tsx` y la regla `despierta` del shader son los del modelo (por texto, con control).
3. La levantada de cerca de las caras vuelve al aire apagándose (por texto, con control).

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- s53 a s59, verdes. `s60` 7/0.
- También verdes: s30, s31, s32, s33, s34, s35, s41, s42 y s52, que leen los archivos del polvo.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s41` B3 · el estado recuerda de dónde salió el despertar | `p.remolino = despertar.delCursor ? 1 : 0` | `p.remolino = m.frente.delCursor ? 1 : 0`, y el frente copia `delCursor` del despertar (`f.delCursor = e.delCursor`) | El remolino es el del frente, que es ese despertar mientras no haya otro con polvo posado. Lo que fija, igual |
| `s34` B4 · cada salida de la simulación escribe el modo con su peso | 9 escrituras de `salida0` | 11 | Las dos de la vuelta al aire de cerca de las caras. Las dos escriben el modo con su peso (`modoConPeso`), que es lo que fija |

## H2 · Formulario del pie: «Enviando», «Gracias» y error

### 1) La causa del desalineado en «Enviando…»

Desde 1025 el formulario es una placa 3D y el DOM (los campos de verdad) va encima, llevado por una homografía que le escribe la
escena en cada cuadro, con origen `0 0`. Al pasar el botón a «Enviando…» cambia la forma de la pieza y la escena la rearma:
- armaba la nueva (que pone el origen `0 0` en el elemento) y DESPUÉS soltaba la vieja;
- `soltar` le borra a ese mismo elemento la transformada y el origen.

La homografía quedaba aplicada alrededor del centro. Con la cámara de frente casi no se nota (la transformada es casi la
identidad). En el final, con la órbita del mouse, la transformada tiene perspectiva y los valores quedaban corridos de sus pozos,
encima de los rótulos. Pasaba con cualquier rearmado: «Enviando…», los errores, el «listo».

**El arreglo** (`pie3d/armadas.ts`): la vieja se suelta antes de armar la nueva, y la nueva conserva la transformada hasta el
cuadro siguiente. Mientras viaja, los campos son de sólo lectura y nada cambia de lugar: el botón guarda el ancho del rótulo más
largo y la ruedita va dentro de su aire (en el angosto no entra: sólo el rótulo).

### 2) Gracias: la placa se transforma en una tarjeta

- **El DOM** (`TarjetaDeGracias`, la misma que va a usar Contacto):
  - «Gracias por tu mensaje.» / «Te contestamos pronto.» y el enlace «Enviar otro mensaje»;
  - el resultado se anuncia en la región viva y el foco va a la tarjeta; de vuelta, al nombre.
- **Desde 1025, la placa 3D** (`pie3d/transformacionDelPie.ts`, puro):
  - el formulario marca su estado (`data-estado`) y la variante (`data-gracias`);
  - el rearmado ve el cambio y deja la placa vieja como «saliente» mientras dura la transformación; el DOM se apaga hasta que
    termina;
  - el título de la tarjeta va en relieve en Archivo 700 (se regeneró `archivo-700-titulos.json` con su texto); la bajada y el
    enlace, en Chivo, como el resto del pie.
- **Variantes** (`?gracias=`):
  - `volteo` (sin bandera, también): la placa gira sobre X en 0,9 s; de canto, la cambia la tarjeta, que termina el giro con el
    mensaje en su cara.
  - `hundido`: el relieve se hunde contra la cara hasta aplanarse (los pozos, la tecla y el espesor); la placa plana toma el
    tamaño de la tarjeta y el mensaje sale en relieve desde la superficie (1,2 s).
  - Con movimiento reducido: un fundido de 0,4 s (el disuelto de la llegada del pie).
- **Abajo de 1025** (el form de vidrio, 390 y 768): el DOM con Motion. El volteo gira sobre X y el hundido baja los campos y sube
  el mensaje; con movimiento reducido, fundido.
- «Enviar otro mensaje» vuelve al formulario vacío con la transformación inversa.

### 3) Error

Vuelve el formulario con todo lo escrito, el error a la vista en su región viva y el foco en Enviar, para volver a probar.

### Las banderas (sólo en desarrollo, `_lib/formularios/enviar.ts`)

- `?envio=lento`: 2,5 s y llega.
- `?envio=error`: 2,5 s y el error de red.
- Ninguna toca la ruta. El límite de intentos de `/api/contacto` vive en la base (5 cada 15 min por IP) y los bancos lo
  gastaban.

### Medido en el banco (`h2-estados.ts`: escrito, enviando, transformando, gracias, otra vez y error)

| | 1440 volteo | 1440 hundido | 1440 reducido | 390 volteo |
|---|---|---|---|---|
| Enviando: los valores en sus pozos (con la órbita del final) | sí | sí | sí (sin órbita) | sí (DOM) |
| Enviando: campos de sólo lectura, el botón del mismo tamaño | sí | sí | sí | sí |
| Gracias: anunciada, el foco en la tarjeta | sí | sí | sí | sí |
| «Enviar otro mensaje»: vacío, el foco en el nombre | sí | sí | sí | sí |
| Error: lo escrito queda y el error se ve | sí | sí | sí | sí |

### El invariante (`s60` H2)

1. El orden del rearmado (la vieja se suelta antes de armar la nueva). Control: el orden de antes.
   Mientras viaja: sólo lectura, el ancho guardado y la ruedita en su aire. Control: los campos escribibles.
2. Las poses de la transformación:
   - volteo: se cambian de canto y la tarjeta termina en su lugar exacto. Control: cambio a los 45°;
   - hundido: la plana toma el lugar y el tamaño de la saliente. Control: aparece en su tamaño;
   - reducido: un fundido. Control: el volteo con movimiento reducido.
3. Los estados del DOM: la tarjeta anunciada y con el foco, y el error que no borra nada. Control: un error que borra lo
   escrito. La tarjeta enfocable. Control: sin `tabIndex`.
4. Las banderas, sólo en desarrollo. Control: en producción.

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- s53 a s59, verdes. `s60` 23/0.
- También verdes: s37, s38, s39, s41 a s52 y s3-cta.

### Las aserciones viejas

Ninguna cambió. El copy `listo` del pie («¡Listo! Te escribimos pronto.») se borró: lo reemplaza la tarjeta.

## H3 · Contacto (el panel): la carga 3D y «Gracias»

- **Al enviar**, el contenido del panel se transforma en la carga, con la misma familia de transformación que el pie
  (`transicionDeGracias`: volteo o hundido según `?gracias=`, fundido con movimiento reducido).
  - La carga es un anillo que gira (`AnilloDeCarga.tsx`), en el material de la escena: el negro satinado (`SATINADO`), los
    reflejos de su estudio (`crearElEstudio`) y un filo claro donde la superficie se pone de costado.
  - Va en su propio lienzo, chico y transparente, sin compositor y con `dpr` [1, 1,5]. Se descarga aparte (`next/dynamic`) y
    sólo está montado mientras carga. Con movimiento reducido, quieto.
  - Lo escrito vive en la hoja: la carga no lo toca. La carga y la tarjeta guardan el alto del formulario, así que la placa no
    se achica de golpe.
- **Al llegar**, la carga se transforma en la tarjeta de gracias, la misma del pie, con el mismo copy.
  - El resultado se anuncia en la región viva (`DESPUES_DEL_ENVIO` ahora es el texto de la tarjeta) y el foco va a la tarjeta.
  - A los 3 s (`CIERRE_MS`) el panel se cierra solo, con su salida de siempre, y el foco vuelve a quien lo abrió.
  - Mientras, una línea fina se consume. Anima el ancho, así que también corre con movimiento reducido.
  - Esc y la X siguen cerrando.
  - Reemplaza al «¡Gracias! Te escribimos pronto.» de texto suelto.
- **Con error**, vuelve el formulario con todo lo escrito, el error a la vista y el foco en Enviar.
- Mientras carga, el foco queda en la carga, dentro del diálogo; antes caía al `body`.

### Medido en el banco (`h3-modal.ts`, a 1440 y a 390)

| | 1440 | 390 |
|---|---|---|
| Enviando: la carga con su lienzo, el foco adentro | sí | sí |
| Gracias: la tarjeta anunciada, el foco en ella | sí | sí |
| La línea se consume (a +1,9 s y a +3,4 s del envío) | 766 → 291 px | 310 → 122 px |
| Se cierra solo; el foco vuelve a quien lo abrió | sí | sí |
| Error: lo escrito queda, el error se ve, el foco en Enviar | sí | sí |
| Esc cierra | sí | sí |

### El invariante (`s60` H3)

1. Los estados del panel: la carga, la tarjeta, el cierre a los 3 s y la línea; con error, nada se borra.
   Controles: un panel que no se cierra solo y el «¡Gracias!» de texto suelto.
2. El anillo en el material de la escena, en un lienzo sin compositor y con el dpr de la regla.
   Controles: dpr 2, y sin el filo.

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- s53 a s59, verdes. `s60` 29/0.
- También verdes: s25, s37, s39, s42, s43, s47, s49 y s50, que leen el panel.

### Las aserciones viejas

Ninguna cambió. `DESPUES_DEL_ENVIO` cambió de texto, y `s25` (que nada diga «enviado») sigue verde.

## Verificar (al cierre)

Con el protocolo de memoria:
1. El Chrome del banco no estaba abierto.
2. Con el dev server prendido había 3,02 GB libres; se apagó (su árbol, con `taskkill /T`) y quedaron 6,16 GB.
3. `npm run verificar` completo.
4. El dev server, de nuevo arriba: `/v3` responde 200.

**Resultado: 67 pasos, 10 con falla.**
- 8 son los rojos de la base de PULIDO 6: s1, s2, s3, s4, s5, s7, s8 y s17 (piden un build, que no se corre).
- Los otros dos, `s6` y `s10`, eran de H2. Se arreglaron:
  - `s6-render`, `s6-cierre` (`s8-cierre`), `s10-mobile` y `s10-banco` piden que el HTML del servidor de la rama quieta no
    escriba ninguna transformada;
  - el `motion.div` nuevo del formulario del pie escribía `opacity:1;transform:none`;
  - ahora, hasta el primer cambio de estado, el formulario queda en reposo sin transformada (`huboCambio`) y escribe sólo la
    opacidad;
  - la salida y las transformaciones siguientes son las mismas (re-medido a 390: gira a la tarjeta y vuelve).
- Después del arreglo, los agregados `s6` (628/0) y `s10` (240/0) vuelven a verde, y s53 a s60 también. El `verificar` completo
  no se volvió a correr.
