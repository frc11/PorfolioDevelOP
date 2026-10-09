# SPRINT PULIDO 8 — la limpieza, «HABLANOS» que se nota botón y el verificar pendiente

Rama `rediseno/home`. Invariante nuevo: `npm run test:s59-pulido-8` (`src/app/v3/_lib/__tests__/s59-pulido-8.invariant.tsx`).

Aprobados por el humano: el pie entero (la descarga y las contraformas lisas) y el volteo.

## G1 · La limpieza

- **`?volteo=juntos` es el producto:** las seis placas se voltean a la vez, de `ARRANCA_EL_VOLTEO` (0,48) a `FIN_DEL_VOLTEO` (0,68),
  que sigue siendo el fin del giro de «HABLANOS». Se borraron la cascada (`VOLTEO.voltea.cada`, `arrancaElVolteo`, `VOLTEOS`) y la
  bandera.
- **`?meta=contorno` se borró con su código:**
  - `ctaDelFinal/contorno.ts` entero;
  - su estado en `transformacion.ts` (`METAMORFOSIS`, `ATRAS`, `estadoDeLaMetamorfosis`);
  - su ruido (`RUIDO_DE_LA_METAMORFOSIS_GLSL`);
  - el stencil que le pedía al lienzo (`configuracionDelCanvas.ts`);
  - `fondoDelMarco` y lo que el cuadro le pasaba sólo a ella.
- Lo que el volteo tomaba de `contorno.ts` quedó en `volteo.ts`:
  - el grosor y el tramo máximo de las letras;
  - el cuadro, ahora `CuadroDelVolteo`, sólo con lo que lee: los valores, el progreso y cuánto se ven;
  - los íconos, que se extruyen directo del SVG, sin el remuestreo de la metamorfosis.
- `MetamorfosisArmada.poner` recibe sólo el cuadro.

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- `s53` 54/0, `s54` 52/0, `s55` 21/0, `s56` 24/0, `s57` 15/0, `s58` 21/0, `s59` 5/0.
- Verdes: s38, s44, s51, s52 (nocturno-final y pulido-1), s34 y s36 (leen la configuración del lienzo).
- Captura a 1440 (`p` = 0,02 y 0,56): los íconos se dibujan en el relevo y las seis placas giran juntas.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s55` C1 · la metamorfosis, las dos técnicas, las banderas | el estado de `contorno` (en 0 nada, primero atrás, termina con «HABLANOS»); sus puntos remuestreados y sin partículas; `?meta=contorno` pedible; con sus 3 controles | borradas; las reemplaza `s59` G1 · 1 (ya no existen) | `contorno` se borró con su código. Lo que termina con «HABLANOS», en el volteo, lo fija `s58` F2 · 2 |
| `s55` C1 · 4 · continuo | lo que no salta incluía el estado de `contorno` | incluye el del volteo (lo que se va, lo alineado y el ángulo por π); mismos umbrales y controles | Ídem: el estado que existe es el del volteo |
| `s55` C1 · 7 · atrás del logo | la frase de `contorno` va de `−ATRAS` a 0 (`zF`) | el centro de cada placa, medio espesor atrás (`VOLTEO.espesor`); mismo control (z positivo) | Ídem |
| `s56` D1 · 5 | `contorno` en `?meta=contorno`; asignación óptima, emparejado por lugar, remuestreo equidistante, arranque alineado, turbulencia en campana, topología fija con stencil (8 controles) | borradas; las reemplaza `s59` G1 · 1 (el archivo, su estado y el stencil ya no existen) | Ídem |
| `s57` E1 · 1 a 3 | ningún contorno se cruza; el cartel y la frase que se arma no se pisan; el fundido a la malla exacta (5 controles) | borradas; las reemplaza `s59` G1 · 1. El cartel contra las placas del volteo ya lo fija `s58` F2 · 4 | Ídem |
| `s57` E1 · 5 · las decisiones | (PULIDO 7) `meta=fusion` no pide nada y en el producto `meta` es `no` | vuelve la de antes de PULIDO 7: la clave `meta` no está en las pruebas (ni en las sueltas), con su control de entonces | `?meta=` se borró entera. Es la más fuerte de las dos |
| `s58` F2 · 2 · la coreografía | en cascada (cada placa 0,035 después de la anterior) y `juntos` a la vez | las seis a la vez; arranca en `FIN_DEL_VOLTEO − dura` y termina con el giro; mismos controles | La cascada se borró: `juntos` es el producto |
| `s58` F2 · 3 y 4 | las placas con `'cascada'` | las placas a la vez | Ídem. Siguen 0 cruces con el giro |
| `s58` F2 · 5 · el producto | el volteo sin bandera, `?meta=contorno` y `?volteo=juntos` pedibles | el volteo sin bandera y sin ninguna rama de pruebas en la escena; que las banderas no existen lo fija `s59` G1 | Ídem |
| `s52-pulido-1` · las banderas | `rebobinado`, `angel`, `meta=contorno` y `volteo=juntos` | `rebobinado` y `angel` | Las dos banderas del volteo se borraron |

## G2 · «HABLANOS»: tocable apenas aparece, y que se note que es un botón

### 1) Tocable apenas su cara se lee

- **Cuándo** (`transformacion.ts`):
  - `caraDelCta(p)` es cuánto de su ancho le muestra a la cámara la cara de «HABLANOS» en el giro: −1 de espaldas, 0 de canto,
    1 de frente.
  - `ctaTocable(p)` vale desde `CARA_LEGIBLE` (0,3: pasó el canto y mira a la cámara), en p ≈ 0,494. Antes era 0,97.
  - El DOM pone `pointer-events` con eso. El hover que levanta el CTA usa lo mismo.
- **Dónde:**
  - `enLaCaraDelCta` es la cuenta del giro para un punto de la cara. La usan sus letras (`posesDe`, la misma cuenta que antes),
    el subrayado y las esquinas del enlace.
  - Desde que es tocable, `homografiaDelCta` recibe las esquinas de la caja de «HABLANOS» donde están en ese cuadro, con el
    levante del hover (`esquinasEnElGiro`). El enlace del DOM sigue a las letras en cada cuadro, todavía girando y bajando.
- **El teclado:**
  - Enter antes de que se lea no abre nada.
  - El enlace sigue enfocable siempre: el foco del teclado lleva al final, como antes, donde ya se lee.
  - El salto al final ahora pasa sólo con el foco del teclado (`:focus-visible`). Un clic del mouse, que ya puede caer a mitad del
    giro, no mueve la página.
- **Medido en el banco** (`g2-toque.ts`, a 1440 y a 390):

  | p | ¿Tocable? | Letras que reciben el puntero | ¿El clic abre Contacto? |
  |---|---|---|---|
  | 0,44 y 0,482 | no | 0 de 8 | no |
  | 0,50, 0,52, 0,58, 0,64, 0,70, 0,85 y 1 | sí | 8 de 8 | sí (0,50, 0,60 y 1) |

  - Ninguna capa le intercepta el puntero.
  - El clic no mueve la página.
  - Cursor: `pointer`.

### 2) El subrayado (`subrayado.ts`)

- Es una barra 3D en el marco del CTA:
  - el volumen de las letras (espesor y bisel) y su material, con su propio contorno para el filo de noche;
  - 0,07 em de alto, con su centro 0,13 em debajo de la línea de base;
  - va con el giro y el levante del hover.
- **Cuándo se dibuja:**
  - Con el mouse encima o con el foco visible, sobre el CTA tocable: se dibuja de izquierda a derecha en 0,3 s y se retira igual.
  - Con el dedo (`(hover: none)`, que la escena escucha): se dibuja cuando «HABLANOS» termina de formarse (p = 1) y queda.
  - Con movimiento reducido: aparece y se va sin animación.
- El cursor es de enlace (`cursor-pointer`). El tic del hover ya lo daba el sonido de los CTA (`[data-abre-contacto]`).
- **Medido en el banco** (`g2-subrayado.ts`):

  | Caso | Resultado |
  |---|---|
  | Mouse, a 1440 y 390 | llega a 1 en ~0,28 s y vuelve a 0 en ~0,25 s |
  | Shift+Tab | el foco llega visible y lo dibuja; al perderlo, se retira |
  | Táctil emulado | dibujado con el CTA formado, sin hover ni foco |
  | Movimiento reducido | 1 y 0 de golpe |

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- `s53` 54/0, `s54` 52/0, `s55` 21/0, `s56` 24/0, `s57` 15/0, `s58` 21/0, `s59` 15/0.
- Verdes: s37, s38 y s44.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s37` T3 · 2 · el «Hablanos» del final | `onFocus={(e) => alEnfocar(e.currentTarget, progreso.get())}` | el mismo llamado, sólo si `e.target.matches(':focus-visible')` | El clic ya cae a mitad del giro: con el foco del mouse, la página saltaba al final debajo de Contacto. Lo que fija, igual: el foco del teclado lleva al final |

## G3 · El verificar pendiente

Se corrió con el protocolo de memoria:
1. El Chrome del banco no estaba abierto.
2. Con el dev server prendido había 2,72 GB libres; se apagó (su árbol, con `taskkill /T`) y quedaron 5,15 GB.
3. `npm run verificar` completo.
4. El dev server, de nuevo arriba: `/v3` responde 200.

**Resultado: 66 pasos, 9 con falla.**
- 8 son los rojos de la base de PULIDO 6: s1, s2, s3, s4, s5, s7, s8 y s17 (piden un build, que no se corre).
- El noveno era `s50`. Se arregló:
  - venía de PULIDO 7 F1: la condición del hueco en el piso sumó las contraformas (canal B), y `s50` fija el texto exacto de la
    condición anterior;
  - no se había visto porque el verificar de PULIDO 7 se cortó y `s50` no estaba en su gate;
  - ahora `s50` da 61/0.
- s53 a s59, verdes.

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s50` · en el piso, el hueco | `return m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95;` | `return ( m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95 ) \|\| ( uApertura >= 1.0 && m.b > 0.5 );` | PULIDO 7 F1: con el hueco abierto entero, las contraformas también se descartan (ahí va lo liso). La condición de antes sigue entera adentro |
