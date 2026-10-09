# SPRINT PULIDO 6 — el entremedio del CTA y el filo con poder

Rama `rediseno/home`. Invariante nuevo: `npm run test:s57-pulido-6` (`src/app/v3/_lib/__tests__/s57-pulido-6.invariant.tsx`).
Entregas: `docs/rediseno/entregas/pulido-6/` (qué mirar: `mirar.txt`).

Decisiones del humano:
- **Ancho normal:** se borra `?ancho=expandido`.
- **`contorno` es el producto:** se borra `?meta=fusion` con su código.
- **Gana el filo:** se borran `tubo`, `disco`, `tubo+filo`, el anillo y el círculo liso (en E2).

## E1 · El CTA: que el entremedio sea tan lindo como el final

### a) Los contornos que se cruzaban a sí mismos

**Medido antes de tocar nada.** Con las pistas reales (los valores en la Chivo del DOM, la frase con su layout de 1440), 17 de los
47 pares se cruzaban a sí mismos en el camino directo, de su letra de los valores a la de la frase. Ir derecho a un círculo
tampoco alcanzaba: 26 de 94 caminos se cruzaban.

**El arreglo es un camino canónico por flujo** (`contorno.ts`, `fotosDelFlujo`):
- Cada letra de los valores se redondea de a poco con el suavizado laplaciano del contorno, que es el acortamiento de curvas
  discreto: una curva simple sigue simple. Se toman 7 fotos, en 0, 2, 6, 14, 30, 60 y 90 iteraciones, cada una con el área de
  origen.
- Viaja redonda: entre 0,42 y 0,58 de su camino se mezclan las dos formas redondas.
- Se desenrolla en la letra de la frase (sus fotos, al revés).
- Las fotos van en una textura (RGBA de 32 bits, una fila por par) y el vértice interpola entre las dos vecinas.
- Los centros viajan como antes, así que la coreografía no cambió.

**Probado de más a menos:**

| Fotos hasta | Pares que se cruzan |
|---|---|
| 320 iteraciones (redondas del todo) | 0, pero a mitad de camino eran gotas |
| 30 iteraciones | 3 |
| 60 o 90 iteraciones | 0 |

Quedó 90, con margen.

**Dos cosas más en el vértice:**
- **La turbulencia lleva cada contorno entero.** La de antes desplazaba punto por punto: con 32 px de amplitud y el gradiente del
  ruido (mediana 0,028 por píxel), plegaba los trazos finos, y eso dejaba 15 cruces que quedaban. Ahora es la misma deriva para
  todos los puntos de un contorno: una traslación no puede cruzar nada.
- **El centro de cada contorno se ajusta primero en vertical** (al 60 % de su camino ya está a la altura de su destino). Así lo
  que va a la frase llega a su franja antes de acercarse de costado.

**El invariante** (`s57` E1 · 1) rehace en la CPU la cuenta del vértice, con el ruido simplex portado. En 30 cuadros del
progreso, a 1440 y a 390, ningún contorno se cruza: 23.700 contornos medidos. Tiene dos controles: un cruce inyectado y el
camino directo de antes.

### b) El giro y la frase se pisaban

El cartel del giro era del ancho del CTA y sus dos renglones subían a la franja de la frase. Ahora:
- no puede ser más alto que la franja de «HABLANOS», del borde de abajo de la frase (más un aire) al de «HABLANOS»
  (`altoDelCartel`; `cartelDe` lo comparten el giro y `armadoSobreElCta`);
- se achica si hace falta.

`s57` E1 · 2 mide, en 61 cuadros a 1440 y a 390, que la caja de lo que muestra el giro y la de los contornos que ya van a la frase
no se tocan. Su control es el cartel de antes.

### c) El cambio a la malla exacta

Es un fundido de tramado complementario en el último 3 % del progreso (`fundido`): cada píxel es de la que se mueve o de la
exacta, sin sumarse ni dejar huecos. Medido cuadro a cuadro entre p = 0,965 y 1 en la página, la diferencia media es de 2 a 3
niveles por cuadro: no hay salto de brillo del bisel.

### Chico · El foco del teclado

Medido en el banco (`e1-foco.ts`):
- Tab desde lo anterior en el orden real («AXON Studio») llega a «HABLANOS» transformado, con `:focus-visible`.
- El anillo de foco rodea la palabra 3D, porque la homografía va en el enlace.
- Enter abre el diálogo de Contacto («Armemos algo juntos.»).

Capturas: `e1-foco-1440.png` y `e1-foco-enter-1440.png`.

### Las bajas

- `fusion.ts` entero, con sus ayudas en `piezasDeLaMetamorfosis.ts`: `geometriaDelIcono`, `conAtributo` y `EN_SU_LUGAR_GLSL`.
- `?meta=`.
- `?ancho=` y `archivo-expandido-cta(-fuerte).json`.
- El campo `corte` del estado: era el umbral del disolvente de `fusion` y nada lo dibujaba.

**Gate:**
- lint limpio;
- `tsc` 0;
- `s53` 54/0, `s54` 50/0, `s55` 27/0, `s56` 48/0, `s57` 11/0;
- verdes: s34, s36, s38, s40–s44, s52-nocturno-final y s52-pulido-1.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s55` C1 · la metamorfosis | las dos técnicas (`contorno` y `fusion`); `corte` en 0 y en 1 | una sola, `contorno`; sin `corte` | `fusion` se borró por decisión (E1); `corte` era sólo de `fusion` (nada lo dibuja). Lo demás (atrás primero, termina con «HABLANOS») igual |
| `s55` C1 · las técnicas | lo de `fusion` (sus dos mallas, el disolvente complementario) y su control | sólo lo de `contorno`; control nuevo: una metamorfosis de partículas | Ídem |
| `s55` C1 · las banderas | `?meta=fusion\|contorno` | sin `?meta=`: `contorno` es la única | Ídem |
| `s55` 4 · la continuidad | el estado de `fusion` (con su `corte`) y el de `contorno` | el de `contorno` (sin `corte`, que saltaba de 0 a 1 sin dibujarse) | Ídem |
| `s55` 6 · la fuente | los dos anchos | wdth 100 | `?ancho=expandido` se borró por decisión (E1) |
| `s55` 7 · lo que se mantiene | `fusion` va hacia atrás (`-uAtras * ( 1.0 - uAdelante )`) | sólo `contorno` | `fusion` se borró |
| `s54` B1 · el CTA en Archivo | los JSON expandidos | los normales | Ídem |
| `s52-pulido-1` · las banderas | `meta=` y `ancho=` entre las pedidas | sin ellas | Ídem |
| `s56` D1 · 3 · el ancho | `?ancho=normal\|expandido` y las cuatro fuentes | wdth 100, sin bandera, y sus dos fuentes | Ídem |
| `s56` D1 · 3 y 4 · el kerning, que entre, los agujeros | con las fuentes expandidas (y las cinco fuentes) | con las normales (y las tres) | Ídem |
| `s56` D1 · 4 · el disolvente de `fusion` | abierto en las dos puntas (y su control) | borrado | `fusion` se borró (lo fija `s57` E1 · 5) |
| `s56` D1 · 5 · `contorno` | el producto, con `fusion` detrás de `?meta=fusion` | el producto y la única | Ídem |

## E2 · El filo con poder

### 1) El filo, por afuera del logo

Antes, el filo era el borde de las tapas del logo pintado de blanco (PULIDO 5). Iba por adentro y le comía el negro. Se borró de
`logoDelFinal.ts`.

Ahora es una banda plana y blanca (`final/filoConPoder.ts`, `bandaDelFilo`):
- Nace en la silueta del logo: el contorno más lo que sale su bisel, 0,007 u.
- Crece hacia afuera del negro: en los dos agujeros del logo, hacia adentro del agujero.
- De qué lado queda el negro se prueba, no se supone.
- Esquinas a inglete, con tope.
- Ancho de 0,13 u. Se arma con el ancho mayor (con el destello y la corriente) y se recorta en el dibujo, con un borde de un píxel.

Va en el grupo del final, con la matriz del logo en cada cuadro (`seguirAlLogo`). No va en el grupo del logo: la caja del logo la
miden la mancha de contacto y la caída, y una banda más ancha la cambiaría.

`s57` E2 · 1 lo mide en una grilla de 0,01 u, con el contorno en los dos sentidos: ningún punto del negro queda debajo de la
banda, así que el área negra con filo es igual a la de sin filo. Su control es la banda por adentro, el filo de antes.

### 2) Sin el círculo liso

**La distancia al logo.** La calma, la energía, el golpe y las ondas se miden con la distancia al contorno del logo, no con el
radio:
- es un campo exacto (la transformada de Felzenszwalb y Huttenlocher, `distanciaAfuera`);
- cubre la caja del logo y 10 u alrededor (`HUECO.campo`, 512 px; en el teléfono, 256);
- más allá, se funde con la distancia a la caja.

Con sólo 0,8 u de campo, la onda del golpe salía cuadrada: se probó y se cambió. Ahora los frentes salen con la forma del logo y
se redondean al alejarse.

**La calma** es un margen pegado al hueco:
- quedan al ras y quietos los bloques que tocan el filo entero (media diagonal de bloque más el filo en su ancho mayor: hasta 0,95 u del logo desde el centro del bloque);
- en 1 u vuelven al caos.

**La luz** ya no se calma: sale por las juntas hasta el borde mismo. La calma aplana las alturas y los pistones, no la energía.

**Las ondas nacen en el filo:** las del logo (`desde` 0), la expansión de la energía (desde 0), el frente del golpe en la
energía, y el empuje del golpe en la física.

La regla vieja («las ondas no cruzan el círculo quieto») se revisó: el círculo no existe. Los anillos del pulso siguen apagados en
el final porque sus ondas son las del logo, que ahora nacen en el filo.

### 3) Las tres maneras de hacer luz (`?filo=`)

En las tres, en el golpe el filo se enciende entero en el mismo cuadro que suena (`luzDelFilo`), con un destello que lo ensancha.
Al rebobinar se apaga al pasar el golpe para atrás. Quieto (movimiento reducido): encendido, sin moverse.

- **`corriente`** (sin bandera): un tramo más ancho y más blanco recorre cada contorno.
  - Su fase se integra con su velocidad (no salta).
  - Se acelera ×3,5 con cada onda y ×7 en el golpe.
- **`pulso`:** el filo entero late con cada onda y con el golpe.
  - El latido sale al piso como un anillo, en la energía (`latidoDelFilo`).
  - En las juntas, la luz se derrama más ancha sobre la tapa: las juntas de alrededor ya brillan enteras con B0, y sumar luz no se veía.
- **`descarga`:** de cada media junta cercana salen corrientes que corren hacia afuera desde el filo (`descargaDelFilo`).
  - Se ven en las juntas y en el plano de abajo.
  - Se pierden a 5 u, donde siguen las del piso.
  - Sin partículas.

### 4) En el teléfono y la tablet

Es el mismo filo, sin rama por ancho. La distancia va a la mitad de resolución.

Medido en las capturas:
- A 390 y a 820, el logo con su filo entra entero (a 820, a ~44 px del borde).
- La energía llega a todos los bordes.

### Las bajas

- `anilloDeLuz.ts` entero: el tubo, el disco y el tubo con el filo.
- `?anillo=`.
- El filo de las tapas (`uFiloDelFinal`, `LOGO_DEL_FINAL.filo` y `anchoDelFilo`).
- El círculo de la calma (`CALMA_EN_EL_PISO.radio`).
- La calma de la luz (`uCalmaDeLaLuz`, `LUZ_DE_ABAJO.margen`).

### Entregas y gate

**Entregas:**
- `e2-filo-1440.png`: columnas `corriente`, `pulso`, `descarga`; filas golpe y quieto. Del pulso y de la descarga, el cuadro de la ráfaga del quieto donde se ve su luz.
- `e2-filo-390.png`: los seis cuadros, en el mismo orden.
- `e2-filo-820.png`: `corriente` en la tablet.

Sonda: `e2-filo.ts`.

**Gate:**
- lint de lo tocado limpio;
- `tsc` 0;
- `s53` 54/0, `s54` 52/0, `s55` 27/0, `s56` 38/0, `s57` 22/0;
- verdes: s38, s40–s44, s47–s51, s52-nocturno-final y s52-pulido-1.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s51` 1F · el brillo espera al encastre | con la calma de la luz (`uCalmaDeLaLuz`, `CALMA_DE_LA_LUZ`, `* ( 1.0 - calma )`); control: una luz que entra al mar calmo | sin la calma de la luz (`return min( 1.8, e ) * uEnergiaDeLaLuz;`); control: una luz que se apaga contra el círculo de antes | Se borró el círculo liso por decisión: la luz llega hasta el borde (E2 · 2). Lo de esperar al encastre, igual |
| `s51` · sin partículas en el final | `g.add(estado.pozo.grupo, plano)` (y su control) | `g.add(estado.pozo.grupo, estado.filo.malla, plano)` | El filo es una malla del grupo del final. Lo de sin partículas, igual |
| `s52-nocturno-final` B2 · el brillo | `* ( 1.0 - calma )` | sin la calma | Ídem que `s51` 1F |
| `s52-nocturno-final` B3 · el círculo estable | un círculo de radio 4,2 (entre la mitad y 1,6 mitades del logo), borde ≥ 3,2 u, con `length( xz )`; la luz se apaga contra él; control: un borde angosto | un margen pegado al hueco con `distanciaAlLogo` (cubre el filo entero, borde ≥ 1 bloque, todo en menos de 2,5 u); la luz no se calma; los pistones sí; controles: el círculo de antes y un margen que no cubre el filo | Decisión: se borra el círculo liso. Lo de quieto de verdad (los empujes se apagan, la onda se amortigua), igual |
| `s52-pulido-1` · las banderas | `anillo=tubo\|disco\|filo\|tubo+filo` (y el «+» de la URL) | `filo=corriente\|pulso\|descarga` (ningún valor lleva «+») | `?anillo=` se borró; entra `?filo=` (E2 · 3) |
| `s53` §4 · las alturas | `return min( e, 1.4 ) * mix( … );` | `… * ( 1.0 - calmaDelFinal( xz ) );` | Los bloques pegados al hueco quedan al ras (la calma pasó de la luz a las alturas) |
| `s54` A1 · la expansión | `radioDeLaExpansion(·, 6.2)` (desde el borde del círculo) | `radioDeLaExpansion(·, 0)` (desde el filo) | Sale del filo (E2 · 2). Los topes (≥ 30 u, sin saltos), igual |
| `s54` B0 · la luz | el anillo después del oscurecimiento, con un pulso en cada onda (`pulsoDelAnillo`); controles: el anillo oscurecido, un anillo sin pulso | el filo, malla aparte sin oscurecimiento ni niebla, con una corriente que se acelera con cada onda; controles: el filo oscurecido, un filo sin pulso. Más: el piso ya no dibuja el anillo (con control) | El anillo se borró por decisión; la luz es el filo |
| `s56` D2 · 1 a 4 | `?anillo=`, el tubo, su ensamble, el orden con la niebla, el disco y el filo de las tapas | borrados (los fija `s57` E2) | Decisión: gana el filo, se borran el tubo, el disco, el tubo con el filo y el anillo |
| `s56` D2 · 5 · sin polvo | `sinPolvo > ANILLO_DE_LUZ.radio` | `sinPolvo > 4.2` (la media diagonal del logo: el mismo valor) | El anillo se borró |
| `s38` · cierre | `filo` no está en las pruebas | los valores de RONDA 2 (`filo=a\|b\|c`) no piden nada | El nombre `filo=` volvió con otro sentido, pedido así (E2 · 3). Lo de la bandera de RONDA 2, igual |
| `s44` P1 · la bandera de los títulos | `!('filo' in pruebas)` | `pruebas.filo === 'no'` y `filo=a\|b\|c` no piden nada; los títulos no la leen | Ídem |

`s55` no cambió. Prohíbe `filoDelLogo` en el piso (el filo encendido de B0): por eso el archivo nuevo se llama `filoConPoder.ts`.
