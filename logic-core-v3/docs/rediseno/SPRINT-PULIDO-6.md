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
