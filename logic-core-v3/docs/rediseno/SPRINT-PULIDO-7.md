# SPRINT PULIDO 7 — la descarga sin energía adentro del logo y el CTA con volteo vertical

Rama `rediseno/home`. Invariante nuevo: `npm run test:s58-pulido-7` (`src/app/v3/_lib/__tests__/s58-pulido-7.invariant.tsx`).
Entregas: `docs/rediseno/entregas/pulido-7/`.

Decisiones del humano:
- **Gana la descarga:** `?filo=descarga` pasa al producto; se borran la corriente y el pulso con su código.
- **El CTA se voltea en vertical:** reemplaza la metamorfosis por contorno, que queda en `?meta=contorno` hasta que se apruebe.

## F1 · El filo: gana la descarga, y adentro del logo, liso

### a) Las contraformas, lisas

El logo es un solo contorno: la C y la P se abren al exterior por una ranura de unas 0,28 u (40 unidades del SVG, medidas entre el
trazo y la diagonal). Por esas ranuras entraban los bloques, las juntas y la energía.

**El logo lleno** (`hueco.ts`, `rellenoDelLogo`):
1. Se cierra la silueta `HUECO.relleno.cierre` (0,2 u, más que media ranura).
2. Se rellena desde el borde del cuadro: el exterior es lo que se alcanza sin pasar por las ranuras cerradas.
3. Se devuelve el cierre: la silueta de afuera no crece, salvo un redondeo en las esquinas de adentro.

Con el logo lleno:
- **La distancia al logo** es la misma referencia que usa el filo, ahora medida al logo lleno: vale 0 adentro de las contraformas.
  La energía y la descarga se cortan ahí (`r < HUECO.relleno.liso`), con los pistones. Las ondas, la calma y el golpe salen del
  logo lleno.
- **La máscara del hueco** lleva las contraformas en su canal B.
- **El piso** descarta sus bloques ahí, con el hueco abierto entero: no quedan juntas, pistones ni luz.
- **Lo liso** (`liso.ts`) es un plano del papel del piso, a la altura del piso calmo, que sólo se dibuja en las contraformas.

El filo sigue igual por los bordes de adentro, y el negro, entero.

### b) Las manchas blancas eran de la descarga

Venían del derrame de PULIDO 6: la luz de la junta se ensanchaba sobre la tapa. Se borró.

Ahora la descarga va **por las juntas**:
- se suma a la luz de la junta;
- en el vértice del piso, por donde pasa, la junta **se abre** (`ABRE_LA_JUNTA_GLSL`): cada esquina del bloque retrocede hacia su
  centro, hasta 0,1 u, y por la rendija se ve la luz de abajo. La tapa se achica; nunca se pinta.

### c) La ráfaga

La corriente era lo que «pulsaba con cada onda», una condición que viene de B0 (`s54`). Ahora con cada onda que larga el logo sale
una ráfaga de descargas por el 60 % de las juntas a la vez, y en el golpe por todas (`rafagaDelFilo`). En el golpe, el filo se
sigue encendiendo entero en el mismo cuadro que suena, con su destello.

### Las bajas

- `FILO.corriente`, `FILO.pulso`, `velocidadDeLaCorriente`, `LATIDO_DEL_FILO_GLSL`, `DERRAME_DEL_FILO` y su uniforme del latido.
- La fase de la corriente y lo recorrido del contorno en la banda del filo (`aFilo` quedó en 0 o 1).
- `?filo=` entera: `FILOS_DEL_LOGO`, `FILO_DEL_PRODUCTO` y la clave de las pruebas.

### Entrega

`f1-descarga.png`, de izquierda a derecha: 1440 quieto, 1440 golpe, 390 golpe y 390 quieto (el logo y lo que lo rodea).

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- `s53` 54/0, `s54` 52/0, `s55` 27/0, `s56` 38/0, `s57` 22/0, `s58` 10/0.
- Verdes: s38, s44, s51, s52-nocturno-final y s52-pulido-1.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s38` · cierre | (E2) los valores de RONDA 2 (`filo=a\|b\|c`) no piden nada | vuelve la de antes de E2: la clave `filo` no está en las pruebas | `filo=` se borró (ganó la descarga). Es la aserción más fuerte de las dos |
| `s44` P1 · la bandera de los títulos | (E2) `pruebas.filo === 'no'` y `filo=a\|b\|c` no piden nada | vuelve la de antes de E2: `!('filo' in pruebas)` | Ídem |
| `s52-pulido-1` · las banderas | con `filo=corriente\|pulso\|descarga`: juntas con `filo=pulso`, control con `filo=`, URL con `?filo=descarga` | sin `filo=`: juntas con `rebobinado` y `angel`, control con `angel=`, URL con `?rebobinado=minimo` | `filo=` se borró. Lo que fija, igual: cada suelta se pide por su nombre, otro valor es el producto, la URL las pide |
| `s54` · el logo brilla | lo que pulsa con cada onda es la corriente (más de 2 veces su velocidad recién nacida la onda, menos de 1,15 a 1,8 s; fase integrada); control: la velocidad fija | lo que pulsa es la ráfaga (sale recién nacida la onda y ya se fue a 1,8 s; la escribe el cuadro); control: una ráfaga apagada | La corriente se borró. Lo demás, igual: las ondas corridas al azar, el filo fuera del oscurecimiento y los anillos del pulso apagados |
| `s57` E2 · 3 · las tres maneras | `?filo=corriente\|pulso\|descarga` (sin bandera, `corriente`); la corriente se acelera, el latido sale al piso, la descarga con su variante; controles: un filo que se prende de a poco y una corriente con la fase por el reloj | sin variantes ni `?filo=` (sin corriente ni latido en el código); el filo se enciende de golpe en el cuadro que suena, con su destello; la descarga en el producto, por las juntas y el plano; controles: un filo que se prende de a poco y una descarga apagada | Decisión: gana la descarga. Lo nuevo (lo liso, las juntas, la ráfaga) lo fija `s58` F1 |

## F2 · El CTA: los seis valores se alinean y se voltean en vertical hasta la frase

Reemplaza a la metamorfosis por contorno, que queda entera en `?meta=contorno` hasta que se apruebe el volteo. El giro de «Seis
razones» a «HABLANOS» no se tocó.

### La coreografía (`ctaDelFinal/volteo.ts`, función pura del progreso)

1. **Se va lo demás** (0 a 0,10): la línea y el ícono de cada valor se desvanecen con el tramado. Queda sólo el título.
2. **Se alinean** (0,22 a 0,30): cada título sale de su grilla y va sobre su **tramo** de la frase, escalado parejo (el mismo en x y
   en y) para entrar en él: no más del 92 % de su ancho ni más del 62 % del cuerpo de la frase. Los 4 primeros valores van en el
   primer renglón y los 2 últimos en el destacado. En el teléfono, en los renglones de ese ancho (2, 2 y 2).
3. **Se voltean** (cada placa en 0,2 del progreso; en cascada, cada 0,035, en orden de lectura): cada valor es una placa de dos
   caras que gira sobre X, con la parte de arriba hacia atrás. En el medio sólo se ve el canto. `?volteo=juntos`: todas a la vez.
4. **La última termina en 0,68**, el mismo punto en que termina el giro de «HABLANOS» (`TRANSFORMACION.giro.desde + gira`). Desde ahí
   la frase queda rígida y quieta, y «HABLANOS» se asienta como antes.

Los tramos son por palabras: «Este sitio» / «empezó» / «con una» / «charla.» y «El tuyo» / «también.». La cara de atrás de cada
placa es la **malla exacta** de su tramo (la de los títulos, con su bisel y el kerning del layout final), puesta relativa a la
placa. Con la placa volteada queda exactamente donde la frase, así que al terminar **es** la frase: no hay cambio de malla.

**Por qué la alineación arranca en 0,22:** el cartel del giro baja desde «Seis razones» hasta la franja de «HABLANOS» y cruza la de
la frase (en el teléfono, también la lista de los valores) hasta ~0,21. Desde 0,04 se cruzaban (lo detecta el control de `s58`
F2 · 4).

Se mantiene:
- Va en el lienzo del CTA (detrás del logo), anclado en el mundo con la frase y «HABLANOS».
- El enlace sigue en el DOM (Tab y Enter).
- No se dibuja en un viaje del menú.
- Quieto, el progreso es 1: la frase directa.

### Entregas

- `f2-volteo-1440.png` y `f2-volteo-390.png`: 10 cuadros, de p = 0 a 1.
- `f2-volteo-juntos-1440.png`: `?volteo=juntos`, de 0,30 a 0,68.

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- `s53` 54/0, `s54` 52/0, `s55` 27/0, `s56` 38/0, `s57` 22/0, `s58` 21/0.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s55` · las banderas | (E1) sin `?meta=`: la clave no está y la escena arma `contorno` siempre | `?meta=contorno` (sólo ese valor; `meta=fusion` no pide nada); la escena arma `contorno` sólo con la bandera y, sin ella, el volteo | Pedido así: `contorno` queda en `?meta=contorno` hasta que se apruebe el volteo |
| `s56` D1 · 5 | `contorno` es la del producto (`const meta = armarElContorno(…)`) | `contorno` sigue entero, en `?meta=contorno` | Ídem; lo del volteo lo fija `s58` F2 |
| `s57` E1 · 5 · las decisiones | `meta` no está en las pruebas (ni en las sueltas) | `meta=fusion` no pide nada y en el producto `meta` es `no`; control: un traductor que acepta `meta=fusion` | Ídem. Lo de `fusion` y `?ancho=expandido` borrados, igual |
| `s52-pulido-1` · las banderas | `rebobinado` y `angel` | más `meta=contorno` y `volteo=juntos` (cada una, sólo su valor) | Las banderas nuevas del sprint |
