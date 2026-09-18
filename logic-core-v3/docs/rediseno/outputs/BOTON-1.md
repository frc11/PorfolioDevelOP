# BOTON-1 — el comportamiento del CTA de la referencia

**Medido. NO SE CONSTRUYÓ NADA.** El árbol queda con cuatro entradas nuevas —este reporte, el
banco, el destilado y las capturas— y **ni un byte de producto tocado**: el sha256 de `Cta.tsx` y de
`cta.css` al cerrar es el mismo que al abrir (§9).

Una navegación a la referencia, una medición, pestaña cerrada. Todo lo que sigue son números y
píxeles propios; no se transcribe un selector, una clase, un id ni una línea de su CSS.

---

## 0 · TRES COSAS DE MÉTODO, ANTES DE LAS TABLAS

### 0.1 · ⚠️ `HANDOFF-3` no existe en el disco

La instrucción cita `HANDOFF-3 §B.1` como la declaración de que el brillo no es transferible.
**Ese archivo no está.** Se buscó en los cinco worktrees (`git worktree list`), en el historial
de todas las ramas (`git log --all --diff-filter=A -- '*HANDOFF*'`, que devuelve un solo
acierto: `docs/HANDOFF-LEADOS-CIERRE.md`) y por contenido (`grep -rl "HANDOFF-3"` sobre los tres
árboles, cero aciertos).

Es la segunda vez en este track: DESLIZAR-1 §0 documentó lo mismo con
`DESLIZAR-1-PLAN.md`. Se siguió adelante porque **la instrucción reafirma por su cuenta la
sustancia** —«no propongas transferirlo», «su sala es negra y la nuestra es papel»— así que
nada quedó a elección. Lo que sí se hizo fue **medir el brillo igual** (§3), que es lo que la
instrucción pide, y **no proponerlo**.

### 0.2 · 🔴 El defecto que el instrumento se cazó a sí mismo: el `clip` apaga el `:hover`

La primera corrida de este banco sacó las cuatro capturas de estado de los dos botones
nuestros y **las tres de hover eran, todas, el reposo**. La foto salía, pesaba lo que tenía que
pesar y mostraba el botón quieto con el puntero encima.

El discriminador fue cambiar una variable por vez, con el puntero quieto sobre el CTA del hero,
leyendo la cadena `:hover` del documento y el alto de la ventana de recorte **antes y después**
de cada forma de sacar la foto:

| forma de capturar | `:hover` después | alto de la ventana |
|---|---|---|
| `Page.captureScreenshot` **con `clip`** | **vacío** | 51 → **47** |
| `Page.captureScreenshot` **sin `clip`** | intacto | 51 |
| `Page.startScreencast` (42 cuadros en 1,5 s) | intacto | 51 |

O sea que **la culpa no es de capturar: es del `clip`**, que por debajo pasa por un ciclo de
`Emulation.setDeviceMetricsOverride` y con él se va la posición emulada del puntero. La salida
fue capturar la ventana entera y recortar en Node con el decodificador que el repo ya tiene
(`scripts-b4/png.ts`). Desde entonces cada captura lleva **la caja del CTA antes y después de
la foto** en el JSON, que es el control permanente del defecto: en las doce capturas de este
reporte, las de hover miden 51 px de alto antes y después y las de reposo 47.

**Corolario para el banco:** `scripts-b4/captura.ts` usa `clip` en todos lados y está bien,
porque ninguna de sus mediciones depende del puntero. Ésta sí, y por eso el recorte vive en
`scripts-boton/boton-comun.ts` y no allá.

Un segundo defecto del mismo tipo, cazado antes: el `clip` se interpreta contra el
**documento** y no contra la ventana. Con el hero (scroll 426) fotografiaba el titular, y con
el Cierre (scroll 15.300) devolvía un PNG blanco de 502 bytes que parecía una captura.

### 0.3 · ⚠️ Qué reproduce el congelado y qué no — y por qué importa para leer las capturas

La captura «a mitad del hover» no se saca a reloj: se **congela** la coreografía en el
milisegundo exacto (`Animation.pause()` + `currentTime`) y recién ahí se fotografía. Sobre una
transición de 1,3 s, una captura a reloj con 80 ms de desvío es un 6 % del gesto.

El congelado es **fiel en su contabilidad**, y eso está verificado: al subir el instante, las
diez animaciones de la referencia se van terminando exactamente cuando les toca —a los 400 ms
caen las dos de 300 ms de la ventana (10 → 8), a los 850 la de 700 del `::before` (→ 7), a los
1000 la de 700+100 del `::after` (→ 6), a los 1150 la de 600+400 del brillo (→ 5) y a los 1450
las cinco de 1300 del rótulo (→ 0)—. Las cinco cuentas dan.

**Pero el PINTADO de los dos pseudo-elementos no lo sigue.** De los 18 cuadros de la tira de la
referencia, **tres no muestran la raya en ninguna fila del recorte** (`0000`, `0160`, `0320`) y
otros tres (`0400`, `0480`, `0560`) sólo devuelven corridas de 10 a 15 px que son el rótulo y la
escena, no la raya — aunque los tiempos declarados digan que en esos seis instantes tendría que
estar pintado entre el 60 % y el 100 % de ella. En los mismos cuadros **el rótulo —que son elementos reales—
sí sale en su pose correcta**, y nuestro subrayado —que también es un elemento real— sale fiel
en toda la tira y coincide con el DOM dentro del 3 % del ancho.

> **La regla que queda:** con el congelado por API de animaciones, **un elemento real es fiel y
> un pseudo-elemento puede no pintarse**. La autoridad sobre los tiempos del subrayado de la
> referencia es la **serie por cuadro** (37 y 38 muestras, contrastadas contra la curva
> declarada con un desvío máximo de 0,025 y 0,022 — §2.3); la tira es corroboración, y de sus
> 18 cuadros sirven los que se citan y no los demás.

### 0.4 · El instrumento, en tres líneas

`scripts-boton/`. Un Chrome propio por CDP, 1440×900 (el ancho donde `COMPONENTS.md` §3.2 midió
este CTA), puntero movido **de verdad** por `Input.dispatchMouseEvent` en un camino de 14 pasos,
y un muestreador que corre **adentro de la página** en `requestAnimationFrame` y guarda, por
cuadro y sólo cuando cambian, 33 propiedades computadas + la caja + el atributo `style` de cada
nodo del subárbol del CTA, pseudo-elementos incluidos. Los tiempos se anclan al `mouseenter` y
al `mouseleave` **que despachó la página**, no al reloj del conductor.

| | nodos | cuadros | Δt p50 / p95 / máx | anclas (entrar · salir · entrar · salir) |
|---|---|---|---|---|
| **referencia** | 10 | 748 | 17,5 / 21,6 / 66,8 ms | 746 · 3.769,8 · 7.263,5 · 10.273,4 ms |
| **/v3 hero** | 5 | 995 | 13,3 / 13,5 / 20,7 ms | 691,8 · 3.714,1 · 7.076,0 · 10.089,9 ms |
| **/v3 Cierre** | 5 | 993 | 13,3 / 13,5 / 40,0 ms | 691,7 · 3.705,3 · 7.067,3 · 10.094,7 ms |

Dos ciclos completos de entrar y salir en cada botón, con 3.000 ms de quietud a cada lado —más
del doble del gesto más largo conocido—. El segundo ciclo no es un control de más: es la mitad
de la respuesta del PASO 1.

⚠️ **Un dato del instrumento que hace falta para leer §3:** con el puntero quieto sobre el CTA
de la referencia, la página despachó **8 eventos `pointerout`/`pointerover` de hijo** sin que el
cursor se moviera. Es el rollover cambiando el elemento que está debajo. Por eso las anclas se
toman del evento de la **raíz** y no de los hijos.

---

## 1 · PASO 1 — EL ESTADO, NO LA TRANSICIÓN

### 1.1 · Las dos copias en los tres estados

Todo medido en el mismo ciclo, sobre el mismo botón, con el puntero movido de verdad.
`giro` y `traslación` salen de descomponer la matriz computada.

**La referencia** (`button > span > span > span[0] | span[1]`):

| | copia A | copia B |
|---|---|---|
| **reposo** | giro 0° · traslación 0 · 0 · **opacidad 1** · sin recorte | giro **10°** · traslación **−30 · 24,75** · **opacidad 0** · recorte `inset(80% 0 0)` |
| **hover pleno** | giro **6°** · traslación **20 · −33,75** · **opacidad 0** | giro 0° · traslación 0 · 0 · **opacidad 1** · recorte `inset(0)` |
| **después de salir** | giro 0° · traslación 0 · 0 · **opacidad 1** | giro **10°** · traslación **−30 · 24,75** · **opacidad 0** · recorte `inset(80% 0 0)` |

**El nuestro** (los dos ejemplares dan lo mismo, con la traslación escalada a nuestra
tipografía):

| | copia A | copia B |
|---|---|---|
| **reposo** | giro 0° · 0 · 0 · opacidad 1 | giro **10°** · **−33,842 · 19,1645** · opacidad 0 · `inset(80% 0 0)` |
| **hover pleno** | giro **6°** · **23,4183 · −31,4745** · opacidad 0 | giro 0° · 0 · 0 · opacidad 1 · `inset(0)` |
| **después de salir** | giro 0° · 0 · 0 · opacidad 1 | giro **10°** · **−33,842 · 19,1645** · opacidad 0 · `inset(80% 0 0)` |

**Los dos vuelven al estado inicial, al centésimo.** No hay una sola propiedad del rollover que
quede donde el hover la dejó, ni en la referencia ni en el nuestro. En el nuestro **ninguna de
las 63 propiedades leídas difiere** entre reposo y después de salir, en los dos ejemplares. En
la referencia difieren **tres, y las tres son del brillo**, no del rótulo (§3.4).

### 1.2 · Lo que sí cambia: CÓMO vuelven

| al soltar, la copia A… | referencia | /v3 (los dos) |
|---|---|---|
| muestras de la vuelta | **1** | **98** |
| arranca / termina | +4,4 → +4,4 ms | +27,6 → +1.320,3 ms |
| o sea | **un solo cuadro** | **una animación de 1,3 s, la misma de la ida** |

Y el mecanismo está declarado en el propio CSS computado, sin ambigüedad:

| | `transition-duration` en REPOSO | `transition-duration` en HOVER |
|---|---|---|
| copias de la referencia | **`0s`** | `1.3s, 0.3s` |
| copias de /v3 | **`1.3s`** | `1.3s` |

**La referencia declara la transición del rollover DENTRO de la regla de estado.** Al entrar,
la regla de hover aporta la duración y el intercambio se anima. Al salir, la regla que queda es
la de reposo, con duración **cero**: el navegador no tiene con qué animar la vuelta y salta.
Nosotros la declaramos en la regla base (`cta.css`, `[data-parte="copia-a"], [data-parte="copia-b"]`),
así que aplica en los dos sentidos.

### 1.3 · 🔴 LA RESPUESTA, CON EL NÚMERO

> **No es que «se queda». Son las dos mitades a la vez, y la segunda es la que hace el efecto.**
>
> **(a)** La copia B termina el hover **exactamente donde arrancó la copia A** —giro 0°,
> traslación 0 · 0, opacidad 1— así que el estado final del hover es **visualmente idéntico** al
> de reposo. Eso ya lo hacemos nosotros, al centésimo.
>
> **(b)** Al soltar, la referencia **repone el estado de reposo en UN SOLO CUADRO** (medido: un
> único cambio a +4,4 ms del `mouseleave`, contra los 98 cuadros que tarda el nuestro). Como el
> estado al que salta es indistinguible del que se estaba viendo, **no hay nada que ver**: el
> rótulo no «vuelve», simplemente deja de moverse en el sitio donde ya estaba.
>
> Lo que el dueño ve como «el nuestro vuelve» es **(b)**, no **(a)**: nosotros animamos la
> vuelta durante 1,3 s, así que el ojo ve el rótulo girar en diagonal hacia atrás. **La
> diferencia entera es dónde está declarada `transition-duration`**, y es un cambio de
> estructura, no de número (§5).

---

## 2 · PASO 2 — EL SUBRAYADO

### 2.1 · ⚠️ Son DOS, y son pseudo-elementos — y `COMPONENTS.md` §3.2 midió otra cosa

El subrayado de la referencia son **dos pseudo-elementos de la ventana de recorte**
(`::before` y `::after`), no un elemento. Cada uno es una caja absoluta que llena la ventana
(`inset: 0`, **182,438 × 22,5 px** en reposo) y **lo que se ve es su `border-bottom` de 1 px**,
en `rgb(0, 255, 194)`.

Contraste de píxel: en la captura de reposo la raya mide **182 px de corrida contigua** contra
los **182,438 px** declarados del pseudo. Coinciden a 0,44 px.

> 🔴 **Corrección a `COMPONENTS.md` §3.2.** La fila *«CTA · subrayado | `transform` + tamaño |
> `scale(0)`, 0×0 → `translate(−30,0)`, 120×3 px | 0.6s, retardo 0.4s»* **no es el subrayado**:
> es el envoltorio de la imagen del brillo. Las cuatro cifras de esa fila corresponden, una por
> una, al nodo `button > div > span` medido acá: caja **120 × 3 px** en los dos estados,
> `transform` de `scale(0) translate(−30, −4,2)` a `scale(1) translate(−30, 0)`, y transición
> declarada **`600 ms + 400 ms de retardo · ease.salida`**. El subrayado real está en los dos
> pseudo-elementos y sus números son otros (abajo).
>
> Y la fila *«CTA · ventana de recorte | `height` | 24,5 → 28,5 px | 0.3s»*: los dos extremos
> son correctos, pero **las propiedades que se animan son `margin-bottom` y `padding-bottom`**,
> no `height`, y la curva es **`ease`** —el default del navegador— y no una de sus dos cúbicas.

**Consecuencia directa sobre `cta.css`, y es el hallazgo más caro del sprint:** nuestro
`--cta-subrayado-duracion` (600 ms) y `--cta-subrayado-retardo` (400 ms) están **derivados del
BRILLO de la referencia, no de su subrayado**. La transferencia se hizo bien sobre lo que §3.2
publicaba; lo que estaba mal era la atribución de §3.2. El subrayado de la referencia dura
**700 ms** y usa **la otra curva**.

### 2.2 · Qué propiedad cambia, y el origen de cada capa

| | propiedad que cambia | `transform-origin` en x | recorrido |
|---|---|---|---|
| `::before` | **`transform`** (escala pura en X: b=c=0, d=1) | **182,438 px** = su **borde derecho** | scaleX **1 → 0** |
| `::after` | **`transform`** (escala pura en X) | **0 px** = su **borde izquierdo** | scaleX **0 → 1** |

No cambia el ancho, ni el `clip-path`, ni el `background-position`, ni el
`background-image`: las tres son `none`/constantes en los dos estados. El `height` de los dos
pseudos sí se mueve (22,5 → 26,5 px), pero **eso es arrastre de layout**, no una transición
propia: sigue al `padding-bottom` de la ventana.

> **🔴 «¿se invierte a mitad de camino?» — No.** El origen de cada capa es **fijo**: el
> `transform-origin` computado cambia 15 veces en el ciclo, pero **sólo en la coordenada y**
> (11,3 → 13,25 px), que es la mitad del alto siguiendo al crecimiento de la ventana. **La x no
> se mueve ni una milésima**: 182,438 px en el `::before` y 0 px en el `::after`, en los 748
> cuadros. Lo que parece una inversión a mitad de camino es que **son dos capas con orígenes
> opuestos**, no una capa que cambia de origen.

### 2.3 · El orden, los tiempos y las curvas — declarados y verificados

Las duraciones y las curvas salen de las **animaciones vivas** leídas a los 60 ms del hover, y
después se contrastan contra la serie por cuadro. El «arranque» es el mejor ajuste del origen:
la transición no empieza en el evento sino en el primer recálculo de estilo posterior, y esa
latencia se publica en vez de esconderse en el residuo.

| capa | declarado | observado (arranque → fin) | arranque real tras el evento | desvío máx vs la curva | muestras |
|---|---|---|---|---|---|
| `::before` (se retrae) | **700 ms + 0 ms** · `cubic-bezier(0.77, 0, 0.175, 1)` = **`ease.principal`** | +4,5 → **+738,2 ms** | **+37 ms** | **0,0251** | 35 |
| `::after` (crece) | **700 ms + 100 ms** · **`ease.principal`** | +140,1 → **+829,9 ms** | **+31 ms** | **0,0220** | 38 |

Los tres cuartos del recorrido, observado contra esperado: `::before` 0,0516 / 0,6516 / 0,9613
contra 0,053 / 0,6597 / 0,962. `::after` 0,0686 / 0,6162 / 0,9574 contra 0,068 / 0,6008 /
0,9601. **La curva no se transcribe: se verifica.**

> **🔴 EL ORDEN Y LOS TIEMPOS, que es lo que la instrucción pide.**
>
> | | |
> |---|---|
> | cuánto tarda en retraerse | **700 ms**, sin retardo |
> | cuánto tarda en volver a crecer | **700 ms**, con **100 ms de retardo** |
> | ¿seguidos o solapados? | **SOLAPADOS, y casi enteros: 600 ms de los 700 de cada uno, el 85,7 %** |
> | el gesto entero, de punta a punta | **800 ms** |
>
> **Los dos tramos corren juntos, no uno después del otro.** Lo único que los separa son los
> **100 ms de retardo del `::after`**, y ése es exactamente el mecanismo del hueco: la capa que
> crece va 100 ms atrás de la que se retrae, sobre la misma curva. El hueco **es** ese retardo,
> hecho visible.

### 2.4 · El hueco: de dónde sale, cuánto mide y hacia dónde viaja

Con el origen y el ancho de cada capa, la escala computada dice **qué tramo del píxel pinta cada
una**: la capa cubre `[o + s(0 − o), o + s(w − o)]`. El `::before` cubre `[(1−s)·W, W]` y el
`::after` cubre `[0, s′·W]`, así que el hueco es el intervalo entre los dos. Muestreado sobre la
serie real, en % del ancho de la raya:

| t tras el `mouseenter` | lo que se pinta | el hueco | ancho del hueco | **centro del hueco** |
|---|---|---|---|---|
| 0 ms | 0 – 100 | — | 0 | — |
| 120 ms | 0,2 – 100 | 0,0 – 0,2 | 0,2 % | **0,1 %** |
| 240 ms | 0 – 1,4 + 7,5 – 100 | 1,4 – 7,5 | 6,1 % | **4,5 %** |
| 360 ms | 0 – 8,2 + 32,0 – 100 | 8,2 – 32,0 | 23,7 % | **20,1 %** |
| **420 ms** | 0 – 23,8 + 75,7 – 100 | 23,8 – 75,7 | **51,9 %** ← el máximo | **49,8 %** |
| 480 ms | 0 – 43,8 + 85,1 – 100 | 43,8 – 85,1 | 41,3 % | **64,5 %** |
| 540 ms | 0 – 81,1 + 94,4 – 100 | 81,1 – 94,4 | 13,3 % | **87,7 %** |
| 700 ms | 0 – 96,5 + 99,6 – 100 | 96,5 – 99,6 | 3,1 % | **98,1 %** |
| 800 ms | 0 – 99,8 | 99,8 – 100 | 0,2 % | **99,9 %** |
| 900 ms | 0 – 100 | — | 0 | — |

> 🔴 **El hueco viaja de IZQUIERDA A DERECHA, no de derecha a izquierda.** El centro del hueco
> es **monótono creciente del 0,1 % al 99,9 %** en las quince muestras: abre pegado al borde
> izquierdo, engorda hasta comerse **la mitad de la raya (51,9 % del ancho, 94,7 px de los
> 182,4) a los 420 ms**, y se cierra contra el borde derecho a los 800 ms.
>
> Es lo contrario de lo que describe el dueño («la separación se mueve de derecha a izquierda»).
> No es una interpretación: sale de dos números fijos y medidos —el origen del `::before` en su
> borde **derecho** y el del `::after` en el **izquierdo**— y del retardo de 100 ms que hace que
> la capa que crece vaya atrás de la que se retrae.
>
> **Contraste de píxel, en los cuadros que el congelado sí pintó** (§0.3): a `t = 240 ms` la
> raya cubre **0 – 2,8 % y 12,7 – 100 %**, o sea **el hueco está en 2,8 – 12,7 %: pegado al
> borde IZQUIERDO**. La derivación predecía 1,4 – 7,5 % a los 240 y 3,8 – 15,2 % a los 300 —el
> cuadro congelado cae entre las dos—. En reposo y en hover pleno la raya mide **182 de 182 px**.

### 2.5 · La salida no tiene hueco, y también es por el retardo

Al soltar, los dos pseudos se invierten: el `::before` vuelve de 0 a 1 y el `::after` de 1 a 0,
**los dos en 700 ms y los dos con retardo 0** —porque el `0.1s` vive en la regla de hover y al
salir queda la de reposo—. Medido: `::before` +48,2 → +741,5 ms · `::after` +48,2 → +741,5 ms.

Con la misma curva, el mismo tiempo y el mismo arranque, los tramos que pintan son
**complementarios en todo instante**: `[0, (1−p)W]` del `::after` más `[(1−p)W, W]` del
`::before`. **La raya queda entera durante toda la vuelta.** Se comprueba en la serie: a +324 ms
el `::before` está en 0,262 y el `::after` en 0,7377 — la suma es 0,9997.

El hueco, entonces, **existe sólo al entrar**. Es el único gesto asimétrico del componente.

### 2.6 · La coreografía completa de la referencia, en una línea de tiempo

| gesto | arranca | termina | duración · curva |
|---|---|---|---|
| la ventana crece (+4 px, por `padding-bottom` y `margin-bottom`) | 0 | **300** | 300 ms · `ease` |
| el subrayado se retrae (`::before`) | 0 | **700** | 700 ms · `ease.principal` |
| el subrayado vuelve a crecer (`::after`) | **100** | **800** | 700 ms · `ease.principal` |
| **el brillo** entra | **400** | **1.000** | 600 ms · `ease.salida` |
| el intercambio de las dos copias | 0 | **1.300** | 1.300 ms · `ease.salida` |

El subrayado **termina 500 ms antes que el rótulo**. El brillo empieza a entrar justo cuando el
hueco está en la mitad exacta de su viaje (centro en 49,8 % a los 420 ms) y se completa 200 ms
después de que la raya se cierra.

---

## 3 · PASO 3 — EL BRILLO, MEDIDO PARA DESCARTARLO BIEN

### 3.1 · Qué es

**No es `box-shadow`, no es un degradado, no es un pseudo-elemento, no es un filtro.** Los
cuatro están en `none` en los dos estados, medidos sobre el nodo y sobre sus dos pseudos.

Es **un `<img>`** —un archivo de imagen— de **150 × 33,4375 px**, adentro de un envoltorio
absoluto de **120 × 3 px** con `z-index: 1`. El envoltorio no lo recorta (`overflow: visible`),
así que la imagen desborda su caja once veces en alto. Ninguno de los dos tiene color propio:
`background-color` es transparente y `background-image` es `none`. **El brillo es el contenido
del archivo.**

Contraste de píxel, sobre la fila del subrayado: en reposo el máximo de luminancia de esa fila
es **196,4** —que es exactamente el color declarado del `border-bottom`, `rgb(0,255,194)`— y en
hover pleno es **220,3**, en el 53 % del ancho de la raya. **El brillo le sube 23,9 puntos de
luminancia (+12,2 %) a la raya, en un tramo de ~35 px de ancho y ~5 px de alto** (se ve en las
filas 74, 75 y 76 de la captura). El píxel del máximo cae a **5,5 px del puntero**.

### 3.2 · Cuándo entra y cuándo sale

| | declarado | observado |
|---|---|---|
| **al entrar** | `transform` · **600 ms + 400 ms de retardo** · `ease.salida` | +436,1 → **+1.036,2 ms** · arranque real +34 ms · desvío máx **0,0321** |
| **al salir** | la regla de reposo declara **`all 0.2s ease`** | +48,2 → **+235,0 ms** |

**Entra en 600 ms tras esperar 400 y sale en 235.** Es la única transición asimétrica en
duración del componente: tarda tres veces más en aparecer que en irse.

### 3.3 · 🔴 Qué propiedad NO cromática lo acompaña

Dos, y las dos son medibles:

1. **La escala.** El envoltorio va de `scale(0)` a `scale(1)` —uniforme, no sólo en X— con una
   traslación fija de −30 px en x y de **−4,2 → 0 px en y**, atada a la escala
   (`ty = −4,2·(1−s)` en las 33 muestras). O sea: **crece desde nada, y mientras crece sube
   4,2 px**. Esa es la parte del gesto que no depende del color.
2. **La posición: sigue al puntero.** El `left` del envoltorio lo escribe **JavaScript, inline,
   232 veces** en la grabación, con una aproximación exponencial clásica de lerp: 64,15 px a los
   400 ms, 87,15 a los 775, 95,39 a los 1.148, 98,35 a los 1.523, 100,0 a los 5.380 (constante
   de tiempo ≈ 365 ms). El ancho del envoltorio es fijo en 120 px, así que el `right` va en
   espejo, de 80,4375 a −19,5625.

**Se mide y no se propone.** Lo cromático no transfiere —la instrucción ya lo declara y §5 lo
anota con su razón—; lo que sí es transferible en principio son esas dos: una escala con
subida, y una posición que sigue al cursor.

### 3.4 · ⚠️ Lo único que NO vuelve al soltar, en todo el componente

Las tres propiedades que difieren entre reposo y después de salir, en los dos sitios juntos, son
**del envoltorio del brillo y de nadie más**: `left` 0 → 100 px, `right` 80,4375 → −19,5625 px,
`inset` en consecuencia. El brillo **se apaga** (la escala vuelve a 0 en 235 ms) pero **se queda
donde el puntero lo dejó**, y en el segundo ciclo vuelve a encenderse ahí mismo.

### 3.5 · 🟡 Lo que NO se pudo separar, con su discriminador escrito

**`left` convergió a exactamente 100,0 px**, que es a la vez (a) la x del puntero relativa al
botón (304 − 204 = 100) y (b) el centro del botón (200,44 / 2 = 100,22). Con **dos** posiciones
del puntero adentro del botón en toda la corrida —el contador de `pointermove` sobre la raíz da
2, porque el camino de entrada cruza el botón en un solo paso— **las dos hipótesis son
indistinguibles**: «sigue al puntero» y «va siempre al centro» predicen el mismo número.

Lo que inclina la balanza sin cerrarla: un lerp por cuadro existe para perseguir un blanco que
se mueve, y al salir el `left` **no vuelve a 0** sino que se queda en 100, que es lo que hace un
manejador atado al `mousemove` del propio botón.

> **El discriminador, para cuando haga falta:** hover sobre el CTA parando el puntero **fuera
> del centro** (por ejemplo al 25 % del ancho) y leer a dónde converge `left`. Si da ~50 px,
> sigue al puntero; si da 100, va al centro. Es una sola lectura y **cuesta una navegación**,
> así que no se gastó en este sprint.

---

## 4 · PASO 4 — LO NUESTRO, EN LA MISMA VARA

### 4.1 · ⚠️ Son dos ejemplares del MISMO componente, y no hacen lo mismo

El CTA del hero y el del Cierre montan los dos `CtaEnlace`. **Lo que se decida los mueve a los
dos.** Pero el del hero lleva `registro="rotulo"` y el del Cierre no, y esa prop —según el
propio `cta.css`— **apaga el crecimiento del subrayado**. Medido: al entrar, el hero levanta
**6 animaciones** y el Cierre **7**. La séptima es el subrayado.

| | rótulo | caja | subrayado en reposo | subrayado al entrar |
|---|---|---|---|---|
| **hero** | «MIRÁ LOS TRABAJOS» (mayúsculas por `text-transform`) | 175,47 × 47 px | **`scaleX(1)`: la regla está puesta, entera, siempre** | **no se mueve** (`transition-property: none`) |
| **Cierre** | «Ver los servicios» | 133,33 × 47 px | `scaleX(0)`: **invisible** | `scaleX(0 → 1)`, 600 ms + 400 de retardo |

Contraste de píxel: en el hero la raya mide **159 de 159 px en los 22 cuadros** de la corrida
—reposo, mitad, hover pleno, después de salir y los 18 de la tira—. No se mueve nunca. En el
Cierre no hay raya en reposo y aparece **140 px** en hover pleno.

🟡 **Y es un dato para el dueño:** de nuestros dos ejemplares, **el del hero ya coincide con la
referencia en el estado de reposo** (una raya de ancho completo, siempre puesta) y el del Cierre
no. La referencia tiene la raya puesta en reposo, en `rgb(0,255,194)`, 182 de 182 px.

### 4.2 · El intercambio de las dos copias — idéntico en los dos lados

| | referencia | /v3 hero | /v3 Cierre |
|---|---|---|---|
| declarado | 1.300 ms + 0 · `ease.salida` | 1.300 ms + 0 · `ease.salida` | 1.300 ms + 0 · `ease.salida` |
| observado, al entrar | +4,5 → **+1.336,5 ms** | +2,1 → **+1.315,1 ms** | +1,1 → **+1.319,9 ms** |
| arranque real tras el evento | **+31 ms** | **+2 a +8 ms** | **+5 a +13 ms** |
| desvío máx vs la curva | 0,0159 | **0,0073** | **0,0067** |
| muestras | 67 | 98 | 95 |
| **al salir** | **1 cuadro** | 98 cuadros, +27,6 → **+1.320,3 ms** | 98 cuadros, +27,3 → **+1.320,7 ms** |

La ida es la misma coreografía con la misma curva y el mismo tiempo, verificada por separado en
los tres. **La vuelta es lo único que difiere**, y es §1.

*(La latencia de arranque —31 ms allá contra 2–13 ms acá— es del sitio, no del componente: su
home tiene una escena más pesada y el muestreador midió 17,5 ms de intervalo entre cuadros
contra nuestros 13,3.)*

### 4.3 · Nuestro subrayado (el del Cierre)

| | declarado | observado |
|---|---|---|
| al entrar | `transform` · **600 ms + 400 ms de retardo** · `ease.salida` | +413,2 → **+1.012,9 ms** · arranque +13 ms · desvío máx **0,0044** |
| al salir | **600 ms + 0 ms** (el retardo vive en la regla de estado) | +27,3 → **+613,9 ms** |

Es **una** capa, con `transform-origin` en el **borde izquierdo** y `scaleX(0 → 1)`: una raya
que **crece de izquierda a derecha después de esperar 400 ms**. No hay hueco, no hay segunda
capa, no hay nada que viaje.

Contraste de píxel, con la tira congelada (acá sí fiel, porque es un elemento real): a 650 ms la
raya cubre **0 – 59,7 %**, a 750 ms **0 – 92,8 %** y a 850 ms **0 – 100 %**. La derivación del
DOM daba 0 – 26,7 % a los 600, 0 – 80,7 % a los 700 y 0 – 94,3 % a los 800: cada cuadro
congelado cae entre los dos que lo rodean. **DOM y píxel coinciden.**

---

## 5 · PASO 5 — LA TABLA DE DECISIÓN

| # | qué hace nk | qué hacemos nosotros | qué propiedad falta | ¿transfiere a papel y tinta? |
|---|---|---|---|---|
| **1** | Al soltar, repone el reposo en **1 cuadro** (`transition-duration: 0s` en la regla de reposo) | Anima la vuelta en **1.300 ms** (la duración vive en la regla base) | **Dónde está declarada `transition-duration`** de las dos copias | **SÍ.** No toca color, ni tamaño, ni paleta. Es la diferencia que el dueño nombró y la más barata de las cinco |
| **2** | Subrayado de **DOS capas** con orígenes opuestos (derecha y izquierda) y **100 ms de desfase** → un hueco que viaja de izquierda a derecha, hasta el **51,9 %** del ancho | **UNA** capa, origen izquierdo, `scaleX(0→1)` → una raya que crece | **Una segunda capa** (elemento o pseudo) + su origen espejado + el desfase | **SÍ**, y es lo único del sprint que hay que *construir*. No usa color: dos capas de tinta bastan |
| **3** | Subrayado: **700 ms** por capa, curva **`ease.principal`** (`0.77, 0, 0.175, 1`), desfase **100 ms** | **600 ms**, curva **`ease.salida`** (`0.64, 0.1, 0, 1`), retardo **400 ms** | Tres números | **SÍ**, y son tres números. ⚠️ Los nuestros están derivados de la fila mal atribuida de `COMPONENTS.md` §3.2: **son los del brillo de la referencia, no los de su subrayado** (§2.1) |
| **4** | La raya está **puesta en reposo**, ancho completo (182 de 182 px medidos) | El **hero** sí (registro `rotulo`); el **Cierre** no (`scaleX(0)`) | El valor de reposo del subrayado en el registro `cuerpo` | **SÍ**, pero es una **decisión de composición**, no una carencia: la raya siempre puesta cambia qué parece el CTA (pie de bloque contra enlace de párrafo), y eso ya está decidido por registro |
| **5** | Un **`<img>`** de 150 × 33,4 px que entra con `scale(0→1)`, 600 ms tras 400 de retardo, sube 4,2 px, y cuyo `left` escribe JS con un lerp que lo deja sobre el puntero. Sube la luminancia de la raya de **196,4 a 220,3** | Nada | Un asset + un envoltorio + un lerp por cuadro | **NO.** Su sala es negra y la nuestra es papel: un resplandor sobre blanco no enciende nada. Ya se descartó dos veces (el CTA del hero y el blend). Además **no es una propiedad de CSS sino un archivo**, así que ni siquiera es «transferible» en el sentido en que lo son las otras cuatro. Lo que sí podría transferir es **la escala con subida** (§3.3), que no es cromática |
| **6** | La ventana crece **+4 px** por `padding-bottom` + `margin-bottom`, 300 ms, curva **`ease`** (el default) | **+4 px** por `block-size`, 300 ms, curva `ease.salida` | La propiedad y la curva | **NO HACE FALTA.** El resultado en pantalla es el mismo salto de 4 px en el mismo tiempo; `cta.css` ya deriva ese +4 de `--spacing-1` con su razón escrita. Cambiar la curva a `ease` sería cambiar un token del sistema por el default del navegador |
| **7** | El rollover **no se dispara con Tab** (`COMPONENTS.md` §3.4) | `:hover` y `:focus-visible` dicen lo mismo en cada regla de `cta.css` | — | **NO SE TOCA.** Es una corrección nuestra deliberada, con instrumento propio. Acá la referencia es la que está peor |

### 5.1 · 🔴 Cuáles son de ESTADO y cuáles son de CURVA

> **DE ESTADO (estructura — cuestan un cambio de forma):**
>
> - **#1**, el regreso instantáneo. Mover `transition-property/duration/timing-function` de la
>   regla base a las cuatro reglas de estado de `cta.css`. No es un número: es **qué regla
>   declara la transición**, y toca las dos copias. Riesgo declarado: hoy las cuatro reglas de
>   estado nombran `:hover`, `:focus-visible` y los dos `[data-forzado]` juntos, así que la
>   duración habría que ponerla en las cuatro o el foco dejaría de animar.
> - **#2**, el hueco que viaja. Pide **una segunda capa que hoy no existe**, con su origen
>   espejado. Es lo único que agrega DOM (o un pseudo) al componente.
> - **#4**, la raya en reposo. Es cambiar el **valor de reposo** de una propiedad, no su
>   transición. Ya está resuelto por registro y la decisión es de composición.
> - **#5**, el brillo. Un archivo, un envoltorio y un escucha de puntero. **Descartado.**
>
> **DE CURVA (un número — cuestan una línea):**
>
> - **#3**, los tres números del subrayado: `600 → 700 ms`, `--ease-salida → --ease-principal`,
>   `400 → 100 ms` de desfase. ⚠️ Con una advertencia: los 600 y los 400 de hoy **no son una
>   mala transferencia**, son una transferencia correcta de una fila mal atribuida. Cambiarlos
>   sin cambiar #2 daría una raya que crece en 700 ms con otra curva, que **no es lo que hace la
>   referencia** — los tres números sólo tienen sentido junto con la segunda capa.
> - **#6**, la curva de la ventana. Un número, y la recomendación medida es **no tocarlo**.

**El reparto del costo, dicho de una vez:** de las siete filas, **una sola es barata y cierra la
queja del dueño** (#1: dónde se declara la duración). Una es una construcción de verdad (#2, con
#3 pegada atrás). Tres no se tocan (#4 ya decidido, #6 ya resuelto, #7 mejor que la referencia).
Y una se descarta con la medición en la mano (#5).

---

## 6 · LO QUE ESTE SPRINT LE CORRIGE A `COMPONENTS.md` §3.2

Tres filas de la tabla de estados, y ninguna es un detalle:

| fila de §3.2 | qué decía | qué es |
|---|---|---|
| «CTA · subrayado» | `scale(0)`, 0×0 → `translate(−30,0)`, 120×3 px · **0.6s, retardo 0.4s** | **Es el envoltorio de la imagen del brillo.** Las cuatro cifras corresponden una por una al nodo medido acá |
| «CTA · imagen revelada» | 0×0 → 150 × 33,44 px | Correcto. Es el `<img>` que va **adentro** del nodo de arriba |
| «CTA · ventana de recorte» | `height` 24,5 → 28,5 px, 0.3s | Los extremos y el tiempo son correctos; **las propiedades son `margin-bottom` y `padding-bottom`**, y la curva es **`ease`**, no una de sus cúbicas |
| *(ausente)* | — | **El subrayado real: dos pseudo-elementos con `border-bottom: 1px solid rgb(0,255,194)`, 700 ms cada uno con 100 ms de desfase y `ease.principal`** |

Nada de esto invalida §3.2 como inventario —los valores están bien medidos— y la corrección es
de **atribución**: §3.2 leyó dos instantes y no podía ver cuál nodo era cuál sin la serie.

Lo que sí cambia es una cifra viva de nuestro código: `--cta-subrayado-duracion` y
`--cta-subrayado-retardo` en `cta.css`. **No se tocaron** (este sprint no construye) y quedan
anotadas acá con su procedencia real.

🟢 **Y una convergencia que vale anotar:** `cta.css` ya resuelve por su cuenta, con su comentario
escrito, que **el retardo del subrayado tiene que vivir en la regla de estado para que no se
aplique al salir**. La referencia hace exactamente lo mismo con los 100 ms de su `::after`: en
reposo declara `0s`. Dos implementaciones independientes, la misma decisión.

---

## 7 · LAS CAPTURAS

`docs/rediseno/capturas/boton/`, 1440×900, dpr 1, recorte único por botón (la unión de la caja
de reposo y la de hover, con su aire), **la misma para los cuatro estados** para que la tira se
pueda leer.

| estado | referencia | /v3 hero | /v3 Cierre |
|---|---|---|---|
| reposo | `nk-1-reposo.png` | `hero-1-reposo.png` | `cierre-1-reposo.png` |
| a mitad del hover (congelado en **650 ms**) | `nk-2-mitad.png` | `hero-2-mitad.png` | `cierre-2-mitad.png` |
| hover pleno | `nk-3-hover-pleno.png` | `hero-3-hover-pleno.png` | `cierre-3-hover-pleno.png` |
| después de salir | `nk-4-despues-de-salir.png` | `hero-4-despues-de-salir.png` | `cierre-4-despues-de-salir.png` |

Más seis cuadros de la tira que son evidencia citada: `nk-tira-0080` (la raya entera),
`nk-tira-0240` (**el hueco pegado al borde izquierdo**), `nk-tira-0850` (la raya cerrada con el
brillo puesto), y `cierre-tira-0650/0750/0850` (nuestra raya creciendo).

**650 ms es la mitad del intercambio (1.300 ms) y es el mismo número en los tres**, a propósito:
si cada botón se fotografiara en la mitad de su propio gesto, las tres capturas mostrarían
instantes distintos y no se podrían comparar.

> ⚠️ **Cómo leer `nk-2-mitad.png`.** El rótulo sale en su pose correcta (elementos reales,
> congelado fiel). **El subrayado NO aparece, y eso es el artefacto de §0.3, no el sitio.** A los
> 650 ms la serie dice que la raya está cubierta al 96 %. Lo que sí se ve en esa captura es el
> brillo, que a esa altura está casi entero.

---

## 8 · LO QUE QUEDA ABIERTO

1. **🟡 Si el brillo sigue al puntero o va al centro** (§3.5). Indistinguible con una sola
   posición interior. Discriminador escrito; cuesta una navegación.
2. **🟡 El congelado de pseudo-elementos** (§0.3). Se midió el síntoma y se acotó el uso del
   instrumento; no se buscó la causa, porque la serie por cuadro ya contesta lo que el sprint
   pregunta. Si un sprint futuro necesita una tira fiel de un pseudo, el camino es
   `Page.startScreencast` —que en §0.2 demostró no tocar el `:hover`— en vez del congelado.
3. **🟡 `:active`.** Sigue sin medirse, por lo mismo que en `COMPONENTS.md` §3.5: no hay forma
   de sostener el botón apretado y leer estilos a la vez con este instrumento. Este sprint no lo
   mejora.
4. **🟡 La segunda fila de §5 toca los DOS ejemplares.** Si se construye el hueco, el hero
   —cuyo subrayado hoy no se mueve por `registro="rotulo"`— tiene que decidir si participa. Hoy
   su raya es fija y ancho completo; un hueco que viaja sobre ella es un gesto nuevo en el hero,
   no una corrección.

---

## 9 · VERIFICACIÓN DE CIERRE

```
sha256 al ABRIR y al CERRAR — idénticos

ae3a1987b220de0f8044d25446bf8d47132dab3b35b0426e4fdb5d2808b698a3  src/app/v3/_componentes/chrome/Cta.tsx
19577b3f69ab211eb1c08870349d7300fb0a2d75f6930f49d1665c07d9c1fe66  src/app/v3/_estilos/cta.css

git status --porcelain
?? logic-core-v3/docs/rediseno/capturas/boton/
?? logic-core-v3/docs/rediseno/outputs/BOTON-1.md
?? logic-core-v3/docs/rediseno/outputs/boton/
?? logic-core-v3/scripts-boton/

npx tsc --noEmit   → 0 errores
npx eslint scripts-boton → limpio
```

**Cero archivos modificados.** Las cuatro entradas son nuevas: el reporte, el banco, el
destilado y las capturas. No se tocó `useDeslizamientoDelCta.ts` ni `deslizamiento.css` (viven en `C:\deslizar`,
otro worktree), ni `HeroArtifact.tsx`, ni `TransitionContext.tsx`, ni la composición del hero.

### El banco

| archivo | qué es |
|---|---|
| `scripts-boton/pagina-de-boton.ts` | el grabador que corre adentro de la página: 33 propiedades por cuadro, sólo cuando cambian, pseudo-elementos incluidos |
| `scripts-boton/boton-comun.ts` | el Chrome propio, el puntero por camino, el recorte sin `clip` |
| `scripts-boton/medida.ts` | el protocolo de ocho pasos, idéntico para los tres botones |
| `scripts-boton/a-referencia.ts` | **una navegación**, con el censo de rótulos adentro de esa misma carga |
| `scripts-boton/b-nuestro.ts` | los dos ejemplares de `/v3` |
| `scripts-boton/analisis.ts` | tramos, descomposición de matrices, ajuste de curva con arranque libre, tramo pintado |
| `scripts-boton/c-tabla.ts` | el destilado y el contraste de píxel. **No abre el navegador**: se puede volver a correr sobre el crudo |

El crudo (las series por cuadro y los 66 PNG: 54 de tira y 12 de estado) queda **fuera del
repo**, en el
temporal del sistema, por la regla 3 de `scripts-b8/b8-comun.ts`: escribir en `docs/` con el
navegador abierto dispara una recompilación del dev server que deja la página a medio compilar
bajo la captura.

---

*Medido el 17 de septiembre de 2026, a 1440×900, dpr 1, sobre `next dev` en el puerto 3000 de
este worktree y sobre la referencia en producción. Una navegación, una medición, pestaña
cerrada.*
