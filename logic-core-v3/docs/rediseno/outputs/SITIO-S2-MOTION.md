# SITIO-S2 — El sistema de motion · reporte de cierre

**Rama:** `rediseno/motion` · **Worktree:** `C:\v3-motion` · **Fecha:** 2026-08-28 / 29
**Insumo:** `docs/rediseno/s0/SCROLL.md` (la especificación) · **Base:** el esqueleto y la compuerta de S1

---

## Qué quedó construido

**El sistema de motion completo de v3, sobre `motion/react`, y una ruta donde juzgarlo.** Sin GSAP, sin ScrollTrigger, sin SplitText, sin Lenis, y sin una sola dependencia nueva.

- **Los nueve patrones**, como datos tipados que salen de SCROLL.md instancia por instancia, y un motor que los corre: todos atados al progreso de scroll, todos exactamente reversibles, cero callbacks, cero disparos de una sola vez.
- **El divisor de líneas** —lo único que GSAP aportaba y había que reconstruir—, con su protección de accesibilidad y su disciplina de medición.
- **La tabla de traducción** de las claves declaradas de GSAP a las propiedades de CSS que realmente se escriben, que es el trabajo real de no usar la librería.
- **La reducción de movimiento**, donde el sistema no se acelera: no existe.
- **La compuerta de 1025**, reusando el mecanismo de S1 con una marca propia.
- **`/v3/motion`**, la mesa de calibración, con perillas y con fecha de baja.

El sistema vive en `src/app/v3/_lib/motion/` y **sobrevive al borrado del demo**. Lo que se borra el día que el sitio esté armado es `src/app/v3/motion/`.

---

## (a) Los tres gates

| gate | resultado |
|---|---|
| `.\node_modules\.bin\tsc.cmd --noEmit` | **exit 0** |
| `npx eslint src/app/v3/_lib/motion src/app/v3/motion` | **exit 0**, cero errores y cero warnings |
| `NODE_OPTIONS=--max-old-space-size=8192 npm run build` | **exit 0** · `/v3/motion` y `/v3/motion/control-estatico` prerenderizadas como estáticas |

`npx prisma migrate status` no corresponde: este sprint no toca la base de datos ni el esquema.

---

## (b) Las comprobaciones, una por una, con su control positivo

Once invariantes, **361 afirmaciones**, **34 controles positivos**, 0 fallas. Ninguna queda verde por vacío: `cerrar()` falla si el archivo no afirmó nada, y cada predicado se corre además contra una entrada que TIENE que hacerlo fallar.

| invariante | qué afirma | sus controles positivos |
|---|---|---|
| `curvas` | las seis curvas contra su fórmula exacta, su forma y el catálogo medido | una curva que retrocede · dos curvas distintas · la distancia contra sí misma |
| `traduccion` | las 12 equivalencias de la tabla, el orden de composición, los neutros | `autoAlpha` solo como `opacity` · una propiedad `z` · una cadena con `scale` adelantado · un neutro que sí emite |
| `cronograma` | 8,2 s aplicados · las ventanas · la reversibilidad · las dos trampas · los dos tramos de P7 | aplicada = declarada · la curva aplicada al progreso global · un hueco entre tramos |
| `anclas` | los píxeles medidos del pie de la home · la forma de los nueve rangos · el acotado | ancla sin el −240px · ancla sin el −80px · una función que no acota |
| `epoca` | 1 y 2 mediciones por instancia · la ráfaga de arrastre · la pestaña oculta | un reductor sin reposo · un reductor sin guardia de visibilidad |
| `lineas` | el agrupamiento · la reconstrucción · **la protección de lectores sobre el marcado real** | una versión sin protección · sin `aria-hidden` · sin copia accesible · una tolerancia enorme · un agrupamiento que pierde una palabra |
| `reducido` | los nueve no se montan · el divisor no corre · el árbol es más chico | una política que solo acorta duraciones · **y la mitad gemela entera: sin la preferencia, todo SÍ aparece** |
| `tokens-de-uso` | cero color/tamaño fuera de los tokens, leyendo el tema | `#ff0000` · `rgba()` · `p-7` · `-mt-1.5` · `bg-red-500` · `text-2xl` · `text-[13px]` |
| `galeria` | los nueve están EN la página, con su nombre y sus números · las perillas · `noindex` | un patrón que no existe · unos metadatos que sí dejan indexar |
| `motion-bundle` | la compuerta es la de S1 · B1/B2/B3 · el peso del chunk | un componente que declara su propio 1025 · una marca que no existe |
| `motion-css` | las 32 utilidades que la ruta escribe tienen regla emitida | una clase que no existe |

### Lo que encontraron, y no fue código

**Cinco cosas, las cinco de instrumento.** Es el mismo patrón que S1 reportó, y es la razón por la que la regla existe.

Las **dos más graves tienen sección propia más abajo** —"Modos de falla de instrumento"— porque no son anécdotas de este sprint: son dos formas en que una comprobación pasa en verde mientras produce algo falso, y las dos tienen una forma de detectarse.

Las otras tres, en una línea cada una:

- **Una afirmación falsa sobre el promedio del conjunto.** Se afirmaba que el avance promedio de las 32 piezas de P8 no es lineal. En el punto medio **sí lo es**, y exactamente, por simetría del escalonado. La afirmación correcta barre el recorrido entero: da 0,5 exacto en el medio y se aparta hasta **0,0832 en p = 0,17**.
- **Dos conteos escritos a mano en vez de derivados** (30 palabras cuando el párrafo tiene 39; "un estilo por bloque" cuando P4 no declara alto mínimo). Ver el Modo B.
- **Un chequeo que se cazó a sí mismo.** "El componente de la compuerta no escribe el 1025 por su cuenta" falló contra su propio archivo: el número estaba en el **título del comentario** que explica la compuerta. Explicarla es correcto; declararla no. El chequeo ahora saca los comentarios antes de mirar.
---

## CORRECCIÓN DE LA INSTRUCCIÓN

**La instrucción de este sprint tiene seis valores mal o sin declarar.** No son notas al pie: son seis lugares donde construir lo escrito habría dado un sistema distinto del medido. En los seis se aplicó SCROLL.md, que es lo que la propia instrucción manda ("Donde `SCROLL.md` tenga un valor y esta tabla otro, gana `SCROLL.md` y lo reportás").

### 1 · `power4.out` no es `1 − (1−t)⁴`

La instrucción escribe la fórmula de la **cuártica**. En la nomenclatura de GSAP `powerN` es de grado **N + 1**, así que `power4` es la **quíntica**: `1 − (1−t)⁵`. La cuártica de la instrucción es exactamente `power3.out`, y el invariante lo afirma.

SCROLL.md lo dice dos veces y de dos formas: *"En la nomenclatura de GSAP `power1` es la cuadrática"* (§9.4) y, de P4, *"`power4.out`: una quíntica de salida, la curva más frenada de todo el sitio"* (§9.7).

No es una diferencia decorativa. En t = 0,5 la cuártica va **0,9375** y la quíntica **0,96875**; la separación máxima entre las dos es **0,0819**, ochenta veces la tolerancia del criterio con el que la medición identificó las curvas. Y el rasgo por el que ese patrón se eligió —*"arranca disparada y se posa"*— vive justamente en el frenado final, que es donde las dos más se separan.

**Construido:** `1 − (1−t)⁵`.

### 2 · P4 — la instrucción no declara escalonado; SCROLL.md mide **0,2**

Sin escalonado, los once ítems de la lista entran **a la vez**. Con 0,2 entran en cascada, que es el gesto medido. Cambia además la duración aplicada: de 2 s a **4 s**.

### 3 · P5 — la instrucción no declara duración; SCROLL.md mide **1 s** (en los hijos)

Sin duración no hay ventana que repartir y el patrón no tiene forma.

### 4 · P6 — la instrucción dice `x` 280 → 0; SCROLL.md mide `x` **140 → −140**

Mismo recorrido de 280 px, pero **centrado**. La diferencia se ve: con 280 → 0 el texto llega y se queda; con 140 → −140 sigue de largo, que es el gesto de *cruzar* — y SCROLL.md lo describe así, como "el único desplazamiento horizontal del corpus". SCROLL.md agrega además la duración: **2 s**.

### 5 · P8 — la instrucción no declara curva; SCROLL.md mide **`power1.out`**

### 6 · P9 — la instrucción no declara curva ni duración; SCROLL.md mide **`power2.inOut`** y **2 s**

`power2.inOut` es el **único uso de esa curva en todo el corpus**: si se construía sin ella, el vocabulario de seis curvas se quedaba en cinco y una de las nueve no era reproducible.

### Y una derivación, que no es una corrección pero hay que declararla

La correspondencia entre las nueve filas de SCROLL.md §3 (agrupadas por ancla) y los nueve patrones de §9.7 (numerados por cantidad de instancias) **no está escrita en el documento**. Se resolvió cruzando tres hechos de §9.7 con los conteos por página de §3:

- P4 tiene "4 instancias, todas en `services`" → es la fila de 4 que está toda en services (`top bottom` → `bottom top`), no la de 4 repartida entre cuatro páginas.
- P5 tiene "3 instancias, una por página" → es la fila repartida (home 1, studio 1, services 1, work 1), que da 3 dentro del alcance de §9.7, que no incluye `work`.
- P8 es el único `scrub: 2` del sitio → es la fila `top 80%` → `bottom 70%`.

Las otras seis son inequívocas por conteo. **Es una inferencia, no una medición**, y si alguna vez se demuestra equivocada, lo que cambia son las anclas de P4 y P5 — no sus valores animados.

---

## MODOS DE FALLA DE INSTRUMENTO — dos, con su forma de detectarlos

**Los dos pasaron en verde mientras producían algo falso.** No son errores de código: son errores de la cosa que mira el código, y por eso son peores — un instrumento roto no avisa, certifica.

### Modo A · El instrumento mide su propia salvaguarda, no el fenómeno

**Qué pasó.** El bloque que despeja la fórmula de rango de los nueve patrones sondea con un elemento de prueba y dos viewports distintos, y de la diferencia despeja `k` y `c` en `rango = alto + k·viewport + c`. El elemento de sondeo medía 100 px. Con ese alto, el ancla de P5 —`top top+=20%` → `bottom bottom-=40%`, que mide `alto − 0,4·viewport`— da un rango **negativo**, y entonces entra la salvaguarda: `rangoDeScroll` acota el resultado a un mínimo de 1 px para no dividir por cero.

Los dos sondeos devolvieron 1 px acotado. El despeje sobre esos dos puntos imprimió:

```
P5  rango = alto + 0·viewport − 99 px
```

que no es la fórmula de P5: es el acotado leyéndose como si lo fuera. **Y todas las afirmaciones daban verde**, porque ninguna preguntaba por `k` ni por `c` — preguntaban si el rango era positivo, y 1 px lo es.

**Por qué es el hallazgo más valioso del sprint.** Una cifra falsa habría entrado al reporte con un instrumento verde detrás. Es exactamente la clase de número que después alguien cita.

**Cómo se detecta, en dos reglas:**

1. **Imprimir toda cifra derivada, no solo afirmar sobre ella — y leerla.** Una fórmula con un `−99 px` donde debería haber un `0,4·viewport` grita, pero solo si está impresa. Una afirmación booleana no muestra el número que la hizo verdadera. Regla operativa: **toda cifra que va a entrar al reporte se imprime en la salida del instrumento**, aunque ninguna afirmación la mire.
2. **Sondear lejos de las salvaguardas.** Todo sistema honesto tiene acotados, defaults y mínimos para no romperse en los bordes. Un sondeo que cae dentro de esa zona mide la salvaguarda. Regla operativa: **el dato de sondeo se elige en el régimen donde el sistema NO degrada**, y si no se sabe dónde está ese régimen, se sondea con dos entradas de escala muy distinta y se comparan — si dan lo mismo, una de las dos está tocando un límite.

Acá el arreglo fue subir el elemento de sondeo de 100 px a **3000 px**, y el despeje pasó a imprimir la fórmula real: `alto − 0,4·viewport`. El comentario del arreglo quedó en el archivo, con el número falso adentro, para que se entienda qué se está evitando.

### Modo B · Un dato de prueba equivocado vuelve trivial una comparación

**Qué pasó.** El invariante del divisor de líneas usa un texto de prueba y un arreglo de topes medidos a mano, uno por palabra. El texto tiene **trece** palabras y el arreglo tenía **doce**. La afirmación de reconstrucción falló, que es lo esperable. Lo que no era esperable: una afirmación posterior —"el texto que anuncia el lector de pantalla es el mismo con dos anchos de ventana distintos"— **pasaba en verde comparando dos cadenas truncadas idénticas**. Las dos habían perdido la última palabra, así que eran iguales por la razón equivocada.

La afirmación que salvó la situación fue la que parecía redundante: `afirmarIgual(palabras.length, 13, 'el texto de prueba tiene trece palabras')`.

**Cómo se detecta, en dos reglas:**

1. **Afirmar la cardinalidad de la entrada antes de afirmar sobre la salida.** Todo dato de prueba con un tamaño —N palabras, N piezas, N archivos— lleva su propia afirmación de tamaño. Parece ceremonia hasta que sostiene a las demás.
2. **Derivar los números esperados de los mismos datos que usa el código, no escribirlos.** El mismo invariante tenía dos conteos a mano —30 palabras cuando el párrafo tiene 39, y "un estilo por bloque" cuando P4 no declara alto mínimo y por lo tanto no lleva estilo— y los dos fallaron. Pasaron a calcularse con `palabrasDe(...)` y con `altoDelBloqueSvh(...)`, que son las mismas funciones que usa el componente. **Un número escrito a mano en un test es una segunda fuente de verdad, y las dos fuentes se desincronizan.**

### El corolario que vale para los dos

Un instrumento tiene DOS salidas: las afirmaciones y **las cifras**. Los controles positivos cuidan las primeras. Las segundas no las cuida nadie salvo la disciplina de imprimirlas y mirarlas — y son las que terminan en el reporte.

---

## (c) La tabla de traducción de GSAP a CSS real

Es la **trampa 3** del sprint (SCROLL.md §9.5, trampa 2): *"El plugin de CSS reescribe la propiedad."* Lo que se declara no es lo que se aplica, y reproducir las claves declaradas contra CSS plano **no da el mismo resultado**.

| se declara | se aplica | comprobación |
|---|---|---|
| `xPercent` | `transform: translate(v%, …)` — porcentaje del **ancho propio** | T1 |
| `yPercent` | `transform: translate(…, v%)` — porcentaje del **alto propio** | T1, T4 |
| `x` | `transform: translate3d(v px, …)` | T1 |
| `y` | `transform: translate3d(…, v px, …)` | T1 |
| `translateZ` | `transform: translate3d(…, …, v px)` — GSAP lo llama `z`, que **no es una propiedad de CSS** | T1, T3 |
| `scale` | `transform: scale(v)` — GSAP lo expande a `scaleX` + `scaleY`; con un valor único es la misma matriz | T1 |
| `rotationX` | `transform: rotateX(v deg)` | T1 |
| `rotationY` | `transform: rotateY(v deg)` | T1 |
| `rotationZ` | `transform: rotate(v deg)` — GSAP lo llama `rotation`; **no** `rotateZ()` | T1, T3 |
| `opacity` | `opacity` — la única que se traduce a sí misma | T1 |
| `autoAlpha` | `opacity` **y** `visibility` — no es CSS, es azúcar de GSAP | T1, T2 |
| `pointerEvents` | `pointer-events`, **discreta**: `ratio ? fin : inicio` | T1, T7 |

**El orden de composición también es parte de la traducción**, porque las funciones de `transform` no conmutan. GSAP compone `translate → rotate → rotateY → rotateX → skew → scale`; `motion/react` compone `scale` **antes** que las rotaciones (`transformPropOrder` de `motion-dom`). Por eso el sistema arma la cadena a mano y la entrega como un único string en `style.transform` — que `motion` soporta explícitamente: `buildHTMLStyles` saltea su propia construcción cuando `latestValues.transform` ya viene puesto.

La cadena completa de P8, verificada carácter por carácter (T5):

```
translate(0%, 120%) translate3d(0px, 0px, -3000px) rotate(45deg) rotateY(80deg) rotateX(60deg) scale(0.3)
```

**Los controles positivos de esta tabla son las traducciones ingenuas**: una que mapea `autoAlpha` solo a `opacity` (deja el elemento capturando foco y lector de pantalla), y una que escribe una propiedad `z` (que en CSS no existe y no hace nada). El mismo predicado las rechaza.

### ⚠️ El orden es un HUECO DECLARADO — qué mediría para cerrarlo y qué se rompe

SCROLL.md registra **qué** propiedades aplica GSAP, no **en qué orden las serializa**. Nuestro orden se tomó de la implementación conocida de `CSSPlugin`, no de la medición. Es decidido, no medido, y hay que dejar escrito cómo se cierra y dónde mirar si alguna vez se nota.

**Qué mediría para cerrarlo.** La matriz resuelta, no el string. `getComputedStyle(el).transform` devuelve un `matrix3d(...)` — ya resuelto y con el orden aplicado— y SCROLL.md §constancia B4.5 registra que los 44 planos de P7 y P8 tienen exactamente eso computado, con el `−3000` de Z incluido. El instrumento sería:

1. Tomar un target de P8 en la referencia a mitad de recorrido y leer su `matrix3d`.
2. Leer del mismo objeto los valores declarados en ese punto (`translateZ`, `scale`, `rotationX/Y/Z`).
3. Componer esos valores en los **dos** órdenes —el de GSAP y el de `motion`— y ver cuál de las dos matrices coincide con la leída.

**Con los valores de P8 el experimento no discrimina**, y eso también hay que anotarlo: su escala es **uniforme**, y una escala uniforme conmuta con cualquier rotación, así que las dos composiciones dan la MISMA matriz. Para discriminar hace falta un target con escala **no uniforme** (`scaleX ≠ scaleY`) o con traslación intercalada entre escala y rotación. En el corpus medido no hay ninguno: por eso el hueco no se puede cerrar con lo que está capturado, y por eso tampoco cambia un píxel hoy.

**Qué se rompe si el orden está al revés.** Dos cosas, y las dos son visibles:

| combinación | con el orden correcto | con el orden invertido |
|---|---|---|
| escala **uniforme** + rotación | idéntico | **idéntico** — conmutan; es el caso de P8 |
| escala **no uniforme** + rotación | la pieza rota y se achata sobre su propio eje | la pieza sale **cizallada**: un rectángulo queda romboide |
| traslación + escala | la pieza se mueve los px declarados | el desplazamiento se **multiplica por la escala**: `y: 100` con `scale(0.3)` mueve 30 px, no 100 |

**Dónde mirar.** El segundo caso aparece el día que un patrón use `scaleX`/`scaleY` por separado — hoy ninguno lo hace. El tercero es el que más fácil se cuela: `translate` va **primero** en los dos órdenes, así que hoy está a salvo, pero cualquier reordenamiento que ponga una escala antes de la traslación cambia distancias sin cambiar formas, que es más difícil de ver que un cizallamiento. El síntoma sería "la lista de P4 entra desde menos altura de la declarada", no "la lista está deformada".

---

## (d) Las tres trampas medidas

### Trampa 1 — el `ease` de un tween con escalonado dice `none` y miente

En 235 de 278 casos. Acá **no se puede cometer**, y no por disciplina: el sistema calcula el progreso LOCAL de cada pieza y no aplica ninguna curva en el conjunto. La curva la aplica la pieza, sobre su propio progreso. **No existe un objeto "envoltorio" con un easing propio que alguien pueda leer por error.**

Lo que el invariante exhibe (K4) es que las dos lecturas son verdad a la vez:

- el progreso del conjunto es **exactamente lineal** en el scroll — eso es lo que el `none` describe bien;
- la pieza 3 de P1 a mitad de recorrido llega en **0,84** y no en 0,60 — curvada.

Y el control positivo es la implementación equivocada: aplicar la curva al progreso **global** en vez de al local da **1** en vez de 0,84. El orden importa y el chequeo lo ve.

### Trampa 2 — la duración declarada no es la aplicada

`duración aplicada = duración declarada + escalonado × (piezas − 1)`.

El ejemplo publicado se reproduce exacto (K1): **P8 declara 2 s, tiene 32 piezas y escalonado 0,2 → 8,2 s aplicados.** El control positivo es la lectura ingenua (aplicada = declarada), que no reproduce el 8,2.

Los nueve, con su cantidad medida de piezas:

| patrón | declarada | piezas | escalonado | **aplicada** |
|---|---|---|---|---|
| P1 | 1 s | 6 | 0,2 | **2 s** |
| P3 | 0,5 s | 33 | 0,2 | **6,9 s** |
| P4 | 2 s | 11 | 0,2 | **4 s** |
| P8 | 2 s | 32 | 0,2 | **8,2 s** |
| P9 | 2 s | 18 | 0,1 | **3,7 s** |

**P2 es el único donde las dos coinciden**, porque tiene un solo target por instancia y el escalonado queda inerte.

### Trampa 3 — el plugin de CSS reescribe la propiedad

Es la sección (c). Está reproducida entera, con una comprobación por equivalencia y dos traducciones ingenuas como control.

---

## (e) El divisor de líneas

### Cómo mide

**Preguntando, no calculando.** Dónde corta una línea depende del ancho, de la familia, del tamaño y del algoritmo de corte del navegador.

El texto se renderiza en **flujo plano** —una palabra por `span`, como un párrafo cualquiera— y se leen los `offsetTop` de las palabras en **un solo recorrido sin escribir nada en el medio**: el navegador resuelve el layout una vez y las N lecturas caen sobre ese mismo resultado. Las palabras que comparten tope (± 2 px de tolerancia) son una línea.

**`offsetTop` y no `getBoundingClientRect()`**, y es la lección ya pagada en este repo: el rect **incluye las transformadas**, y este sistema las tiene puestas justo encima del texto que quiere medir. `offsetTop` es un valor de layout y no lo tocan. Se lee contra el ancestro posicionado más cercano —el contenedor del bloque, `position: relative`— así que significa lo mismo en las dos fases.

### Dos fases, y por qué no una

**Una vez que el texto está partido, ya no se puede volver a medir sobre él.** Cada línea vive en su propio contenedor de bloque: al angostar la ventana el texto no refluye como un párrafo, refluye DENTRO de cada contenedor, y el agrupamiento que sale de ahí parece razonable y es falso. Por eso cada época vuelve al flujo plano y mide de nuevo. Es lo mismo que hace SplitText —revertir y volver a partir—: se reproduce el comportamiento, no la librería.

La fase de medición se pinta con `visibility: hidden`, que conserva el layout: no hay un cuadro de texto sin partir antes de la partición.

### Cuándo se rehace

Tres razones, y una sola suscripción compartida por todo el árbol:

1. **`document.fonts.ready`** — si el divisor corre antes, parte con la métrica de la fuente del sistema. Si las fuentes **ya** estaban cargadas al montar, no se emite el evento y no se gasta una época.
2. **`resize`, con reposo de 150 ms** — durante un arrastre de ventana llegan decenas de eventos y se mide **una** vez, cuando para.
3. **La pestaña vuelve a estar visible** con una medición pendiente.

**La tercera es una lección del repo, no una precaución.** Con la pestaña ocluida el navegador saltea los rendering steps y `window.innerWidth` devuelve **0**: una medición tomada ahí no es imprecisa, es cero, y el texto queda partido con un ancho de cero para siempre. La guardia es estructural: con la pestaña oculta el estado no avanza de época, se anota como pendiente, y se mide cuando vuelve.

### Cuántas mediciones por ciclo de vida

| escenario | épocas | **mediciones por instancia** |
|---|---|---|
| fuentes ya cargadas al montar, sin resize | 0 | **1** (la del montaje) |
| fuentes en vuelo, sin resize | 1 | **2** |
| ráfaga de 20 `resize` + reposo | 1 | **2** |
| pestaña oculta + 2 `resize` + reposo | 0 | **1** |
| … y después vuelve a estar visible | 1 | **2** |

**Cota del ciclo típico: 2 mediciones por instancia, una lectura de layout cada una.** El instrumento es un reductor puro (`epoca.ts`) al que se le da una secuencia de eventos; el control positivo es un reductor **ingenuo**, sin reposo y sin guardia de visibilidad, que mide **20** veces la misma ráfaga y **2** veces con la pestaña oculta.

### La protección de accesibilidad, y su control

Partir texto en `span` por línea rompe los lectores de pantalla: leen fragmentos sueltos, con una pausa donde el diseñador puso un corte — y el corte depende del ancho, así que **la misma frase se anunciaría distinto en dos ventanas**.

```html
<div>                                          ← contenedor, position: relative
  <span class="sr-only" data-lineas-accesible>   el texto ENTERO, legible
  <span aria-hidden="true" data-lineas-piezas>   las líneas, invisibles al lector
```

Las dos mitades son obligatorias: sin la copia no queda texto que anunciar; sin `aria-hidden` la frase se anuncia dos veces. Se eligió **copia visualmente oculta** y no `aria-label` porque `aria-label` sobre un elemento sin rol es ignorado por parte de las tecnologías de asistencia.

**La comprobación renderiza el componente REAL a HTML** con `react-dom/server`, sin navegador, y afirma sobre el marcado. Los controles positivos son tres: una versión sin la protección, un marcado con la copia pero sin `aria-hidden`, y uno con `aria-hidden` pero sin la copia. Los tres tienen que fallar el **mismo** predicado, y fallan.

La referencia tiene cinco hallazgos de accesibilidad independientes. **No le agregamos un sexto.**

### El recorte, y los 4 px de holgura

Cada línea va en un contenedor con `overflow: hidden`. Con el interlineado de títulos del sistema (1,09) la caja de línea es más baja que el área de la fuente, así que un recorte exacto se comería las colas de la `g` y la `p`. La holgura son `py-1` (un token, 4 px) más `-my-1` del mismo tamaño en el **mismo** elemento: el borde de recorte se corre 4 px y el aporte al layout queda en cero exacto. En un contenedor flex los márgenes no colapsan, así que la cuenta vale también entre líneas vecinas.

**Costo declarado:** durante el recorrido se ven 4 px de la línea que entra antes del borde. Es el compromiso que hace cualquier divisor de líneas.

---

## MÉTODO — medir layout sobre elementos animados

**Esto no es un detalle del divisor de líneas: es el problema general, y el divisor es el caso donde apareció.** Cualquier cosa que mida cajas en una página con animaciones tiene las cuatro trampas de abajo, y las cuatro se pagan en silencio: devuelven un número, no un error.

### 1 · `getBoundingClientRect()` incluye las transformadas; `offsetTop` no

El rect es la caja **pintada**. Si el elemento —o cualquier ancestro— tiene un `transform` activo, el rect ya lo tiene aplicado: no está mintiendo, está contestando otra pregunta. `offsetTop` y `offsetLeft` son valores de **layout** y las transformadas no los tocan.

- ¿Querés saber **dónde está dibujado**? `getBoundingClientRect()`.
- ¿Querés saber **dónde lo puso el layout**? `offsetTop` / `offsetLeft`.

Un sistema de motion pregunta casi siempre lo segundo, y casi siempre alcanza lo primero por costumbre. En este repo ya había una lección escrita al respecto —"getBoundingClientRect() con transformaciones activas devuelve coordenadas incorrectas; arreglo: resetear la transformada antes de medir"—. **Este sprint agrega la salida más barata: no resetear nada, preguntar por el layout.**

El divisor de líneas lee `offsetTop` de cada palabra **mientras las líneas están transformadas**, y el número es correcto porque `offsetTop` no las ve.

### 2 · El elemento que se mide no puede ser el que se transforma

Cuando hace falta el rect —el motor de progreso lo usa para resolver el ancla— la regla es estructural, no de disciplina: **el `ref` de medición vive en un `div` pelado y todo lo que se mueve es descendiente suyo**. En `BloqueDePatron` hay un solo lugar donde se pone ese `ref`, y ese lugar no tiene `style`. No es que "hay que acordarse": es que no hay dónde equivocarse.

### 3 · Si la estructura es el resultado de una medición, hay que volver al estado canónico antes de re-medir

Es la trampa menos obvia y la que costó las dos fases del divisor.

Una vez que el texto está partido en líneas, **cada línea es un bloque independiente**. Al angostar la ventana el texto ya no refluye como un párrafo: refluye DENTRO de cada contenedor, y las palabras que deberían pasar a la línea siguiente se quedan en la suya. Medir ahí devuelve un agrupamiento que parece razonable —tiene la forma correcta, la cantidad correcta de líneas— y es falso.

Por eso cada época **vuelve al flujo plano**, mide sobre el reflujo real del navegador, y recién entonces vuelve a partir. Es lo mismo que hace SplitText cuando revierte antes de re-splittear: reproducimos el comportamiento, no la librería.

La fase plana se pinta con `visibility: hidden`, que conserva el layout y no muestra un cuadro de texto sin partir.

**La regla general:** si la medición depende de una estructura que la medición anterior produjo, el instrumento tiene que poder **deshacer** su efecto antes de volver a medir. Un instrumento que solo sabe avanzar mide su propio resultado.

### 4 · Fijar contra qué se mide

`offsetTop` se lee contra el **ancestro posicionado más cercano**. Si eso queda librado al azar, el mismo número significa cosas distintas en dos fases: en la plana, distancia al contenedor; en la partida, distancia al contenedor de línea (que sería siempre ~0).

Acá el contenedor del bloque es `position: relative` y los contenedores de línea son estáticos, **a propósito**: así el `offsetTop` de una palabra significa lo mismo en las dos fases, y el agrupamiento se puede comparar entre ellas.

### 5 · Y antes de todo: ¿el navegador está midiendo?

Con la pestaña ocluida, minimizada o en una ventana de fondo, el navegador saltea los rendering steps: no despacha `scroll`, no corre `requestAnimationFrame`, y `window.innerWidth` devuelve **0**. Una medición tomada ahí no es imprecisa: **es cero**, y el texto queda partido con un ancho de cero para siempre.

La guardia es estructural: con la pestaña oculta el estado no avanza de época, se anota como pendiente, y la medición ocurre cuando la pestaña vuelve. Y se resincroniza antes de cada evento y no solo en `visibilitychange`, porque de las dos condiciones —visibilidad y ancho— **solo una emite un evento**: un `innerWidth` en cero no avisa nada.

---

## (f) La compuerta

**Es la de S1, no otra igual.** El componente importa `ESCENARIO_MIN_ANCHO_PX`, `CONSULTA_ESCENARIO` y `useAnchoMinimo` de `_lib/`, y el invariante afirma que **no escribe el 1025 por su cuenta** (B0): un número repetido son dos compuertas que se van a desincronizar. El control positivo de esa afirmación es un componente que sí declara su propio umbral.

Lo único propio es la marca, porque son **dos chunks distintos detrás de la misma compuerta** —el escenario de S1 y la coreografía de S2— y hay que poder pesarlos por separado.

### LOS DOS NÚMEROS, por separado — con su instrumento (B4)

**Es la pregunta que sostiene toda la arquitectura de la compuerta**, y admite dos lecturas incompatibles: si el peso que subió es el de `/v3/motion` —una ruta más, con su propio chunk de página— no hay regresión; si es el de `/v3`, sí la hay, y de la peor clase.

Se distingue midiendo las dos y comparando los **conjuntos**, no los totales. Un total que sube no dice de dónde salió.

```
/v3         24 archivos · 1389,3 KiB crudo · 423,0 KiB gzip
/v3/motion  25 archivos · 1394,4 KiB crudo · 425,1 KiB gzip

de más en /v3/motion:  static/chunks/app/v3/motion/page-*.js   5,1 KiB
de más en /v3:         (ninguno)
```

**La carga inicial de `/v3` está ENTERA dentro de la de `/v3/motion`, y la diferencia es exactamente UN archivo: el chunk de página de la ruta nueva.** Los 425,1 KiB gzip / 25 archivos son de `/v3/motion`. Por ese lado no hay regresión: es lo que cuesta existir.

### ⚠️ Pero `/v3` sí se movió — y el mecanismo NO está explicado

Contra lo que S1 dejó registrado el **mismo día**, con el **mismo instrumento** (`bundle.invariant.ts`, cuyo guardia dice `HEREDADO_BASE_KIB = 1400 // medido 2026-08-28: 1381,3 KiB`):

| | S1 | ahora | delta |
|---|---|---|---|
| archivos | 24 | **24** | **0** |
| heredado del layout raíz | 1381,3 KiB | **1384,7 KiB** | **+3,4 KiB** |
| propio de /v3 | 4,5 KiB | **4,6 KiB** | +0,1 KiB |
| total crudo | 1385,8 KiB | **1389,3 KiB** | **+3,4 KiB** |

#### Lo que está PROBADO: no es la coreografía

Se buscaron en los 24 archivos de la carga inicial de `/v3` cinco cadenas que existen únicamente en cinco módulos distintos del sistema de motion — `salida-fuerte` (`curvas.ts`), `atado-al-scroll` (`cronograma.ts`), `simetrica-suave`, `data-lineas-piezas` (`lineas.ts`) y `bottom-=240px` (`anclas.ts`).

**Las cinco están ausentes**, y el control positivo confirma que el mismo buscador SÍ las encuentra en el chunk perezoso, donde tienen que estar. La marca tampoco aparece, ni en los archivos ni en el HTML. **Ésta es la pregunta que sostiene la arquitectura de la compuerta, y está contestada.**

#### Lo que está MEDIDO, y por qué NO alcanza

Dos de los 23 chunks compartidos con el home nombran las rutas nuevas. Es el manifiesto de rutas de **Sentry** —una lista de paths que viaja al cliente para resolver nombres de ruta—, y las dos entradas son literalmente esto:

```
{"path":"/v3/motion"},{"path":"/v3/motion/control-estatico"},
```

**61 bytes, duplicados en dos chunks: 122 bytes.** Sobre un delta de 3.482 bytes, eso explica el **3,5 %**.

⚠️ **Una versión anterior de este reporte decía que el mapa de rutas ERA el mecanismo del +3,4 KiB. Es falso, y lo desmintió medir los bytes en vez de conformarse con haber encontrado los nombres.** Encontrar *un* mecanismo plausible y dejar de buscar es la misma clase de error que los dos modos de falla de instrumento de más arriba: la evidencia era real y la conclusión, de dos órdenes de magnitud.

**Quedan 3.360 bytes sin explicar** en chunks compartidos que este sprint no importa y en los que no hay una sola huella de su código.

#### La comprobación diferida — **PREDICCIÓN DEL MAPA**

El 1 % que falta **no se cierra con un build aislado**: se cierra con una predicción que ya se puede escribir y que otro sprint va a poder verificar gratis.

> **PREDICCIÓN DEL MAPA.** El día que se borren `/v3/motion` y `/v3/motion/control-estatico` —que son deuda con fecha de baja declarada— el peso heredado de `/v3` tiene que **volver solo** a su valor anterior, ±3,4 KiB crudo, sin tocar ninguna otra cosa.
>
> - **Si vuelve:** el delta era el costo de existir de dos rutas, sea cual sea el mecanismo exacto, y la compuerta nunca tuvo nada que ver.
> - **Si NO vuelve:** el diagnóstico estaba mal y hay que buscar en otro lado. En ese caso el sospechoso deja de ser "agregar rutas" y pasa a ser algo que este sprint dejó en un chunk compartido sin que las cinco huellas lo detecten.
>
> **Instrumento:** `npm run test:s1-bundle`, que ya imprime el peso heredado en cada corrida. No hace falta construir nada nuevo: hace falta mirar ese número el día del borrado.
>
> **Lo hereda el sprint que reemplace al home**, que es el mismo que va a borrar estas dos rutas y el mismo que tiene el presupuesto de JS como pendiente.

### El chunk de la coreografía

```
ABAJO de 1025   1394,4 KiB crudo · 425,1 KiB gzip   — 25 archivos
ARRIBA de 1025  1422,5 KiB crudo · 434,2 KiB gzip   — +1 chunk de coreografía

CHUNK DE MOTION   28,2 KiB crudo · 9,2 KiB gzip     (28.832 B · 9.410 B)
```

**No está en la carga inicial de `/v3/motion`** (B2), **y sí está en la de la ruta gemela con import estático** (B3), en el MISMO build y con la MISMA función de chequeo. La marca existe en la salida (B1), así que el buscador no está ciego.

Ese chunk es **código propio**: `motion/react` no viaja ahí. La librería ya está en la carga inicial de toda ruta porque el layout RAÍZ importa el chrome viejo, que la usa. De los 25 archivos de `/v3/motion`, **23 son heredados** (1384,7 KiB) y **2 son propios** (9,7 KiB).

**Abajo del umbral la ruta no queda en blanco:** sirve un texto que explica qué falta y por qué, en DOM plano, sin una sola importación del sistema de motion. Se afirma sobre el HTML servido.

**Regresión verificada:** la marca de motion no aparece en la carga inicial de `/v3` ni en su HTML — la ruta hermana no arrastra la coreografía. Y `npm run test:s1-bundle` —el invariante de S1, que este sprint no tocó— sigue en verde: **23 afirmaciones, 0 fallas**. Su guardia de regresión del peso heredado (línea de base 1400 KiB) también pasa, con los 1384,7 KiB de arriba.

---

## CIFRA DEL SISTEMA — lo que cuesta una ruta nueva

**No es un dato de este sprint: es una constante de la aplicación, y la paga todo el sitio.**

```
+1,7 KiB crudo por ruta nueva, en chunks COMPARTIDOS
(3,4 KiB medidos / 2 rutas agregadas)
```

Lo que se observó: agregar dos rutas —`/v3/motion` y `/v3/motion/control-estatico`— movió el peso heredado del layout raíz de 1381,3 a 1384,7 KiB crudo. Ese peso lo cargan **todas** las rutas del sitio: `/v3`, el home actual, `/services`, los portales. Una ruta nueva no le cobra a su propia página: le cobra a las que ya existían.

**Qué clase de cifra es.** Empírica y derivada de **una sola observación de dos rutas**. El mecanismo exacto no está identificado —el manifiesto de Sentry explica el 3,5 %— así que el número puede no ser lineal ni constante. Se reporta porque es del orden que importa para planificar, no porque esté cerrado. La **PREDICCIÓN DEL MAPA** de más arriba es lo que lo va a confirmar o desmentir.

**Por qué le importa al sprint de secciones.**

- **Las ocho secciones del sitio NO agregan rutas.** Son secciones de una página: cuestan lo que pesa su código, y ese código entra por la compuerta.
- **Las páginas internas SÍ.** Cada caso de Trabajos, cada nota, cada landing de servicio es una ruta, y cada una le suma ~1,7 KiB crudo a todo el sitio. Veinte páginas de proyecto son **~34 KiB crudo** repartidos sobre cada visita a cualquier página, incluida la home.
- **Es una cifra que se decide, no que se sufre.** Veinte proyectos pueden ser veinte rutas o una ruta con un parámetro dinámico, y la diferencia en este renglón es de veinte a uno. Conviene que ese sprint arranque sabiéndolo, porque es una decisión de arquitectura de rutas que después es cara de revertir.

Y el contraste que ordena la escala: **la coreografía entera —los nueve patrones, el divisor de líneas y el motor de progreso— son 28,2 KiB crudo que NO baja abajo de 1025.** Dieciséis páginas internas cuestan lo mismo, y lo cobran arriba y abajo del umbral.

---

## (g) `prefers-reduced-motion`

**La referencia falla acá** y es uno de sus cinco hallazgos: apaga sus animaciones (de 291 instancias a 12) pero **mantiene el secuestro del scroll** — Lenis sigue cargado y activo con la preferencia puesta.

En `/v3` ese hallazgo no se puede repetir: S1 excluyó Lenis del árbol por ruta, así que no hay scroll programático que apagar. Lo que sí había que decidir es qué pasa con los nueve patrones, y la decisión es la del sprint: **no se montan**.

No es "más rápido" ni "sin desplazamiento": el motor de progreso no se instancia, el divisor de líneas no corre, y el contenido se renderiza en su estado final. Son **dos componentes distintos**, no una rama con las duraciones en cero.

**La comprobación renderiza el mismo árbol con la preferencia y sin ella**, en el mismo proceso, usando `MotionConfig reducedMotion="always" | "never"` — que es lo que lee `useReducedMotionConfig`, la misma función que en un navegador lee el media query.

| afirmación | con la preferencia | **sin la preferencia (control positivo)** |
|---|---|---|
| se escribe alguna transformada | **no**, en los 6 patrones renderizados | **sí**, en los 4 que pintan en el primer cuadro |
| se promueve una capa (`will-change`) | **no** | **sí** |
| P3 arranca en opacidad 0,3 | **no escribe opacidad** | **sí** |
| P7 escribe `visibility` y `pointer-events` | **ninguna de las dos** | **las dos** |
| el texto se parte en líneas | **no** (`data-lineas-piezas` ausente) | **sí** |
| elementos con estilo escrito | **solo el bloque**, ninguna pieza | **uno por pieza** |

Y una cifra que ordena la escala: el bloque de P1 pasa de **226 elementos a 22**. El divisor de líneas es la maquinaria más pesada del sistema, y con la preferencia no existe.

Sin la mitad derecha de esa tabla, la izquierda pasaría en verde aunque el sistema estuviera roto y no animara nunca.

---

## Los dos modos de avance, y en qué se diferencian

En la referencia **todo** está atado al scroll (291 de 291 con `scrub`), y ahí los segundos no existen: el `scrub` mapea la duración total del tween sobre el rango de scroll del disparador, así que de la duración declarada sobrevive su **proporción** y no su magnitud. Un tween de 2 s puede tardar diez segundos de reloj o dos décimas.

Para una entrada de carga eso no sirve, y por eso el sistema soporta el otro modo. **La diferencia es exactamente una línea**: de dónde sale el 0→1. La partición del cronograma, el escalonado, las curvas y la traducción son las mismas funciones puras con los mismos números.

| | `atado-al-scroll` | `tiempo-real` |
|---|---|---|
| quién empuja | `(scrollY − inicio) / (fin − inicio)` | `animate(0 → 1, duración aplicada)` |
| la pieza 32 de P8 arranca | en la fracción **0,7561** del recorrido | a los **6,2 segundos** |
| y ocupa | **24,39 %** del recorrido | **2 segundos** — la duración declarada, tal cual |
| disparo | ninguno: es continuo y reversible | `IntersectionObserver` al entrar a pantalla |

Las dos lecturas salen de la misma cuenta (`ventanaDeHijo`), y el invariante lo afirma: `proporción = segundos / total`.

El modo temporal es **la única parte del sistema que dispara algo**. Los nueve patrones atados al scroll no tienen un solo callback, igual que la referencia.

---

## La inercia del `scrub`

La referencia declara `scrub: 1` en 188 instancias, `scrub: true` en la mayoría del resto y `scrub: 2` en P8 —"el más alto del sitio, lo que le da un arrastre pesado"—. Ese número es el tiempo que tarda el cabezal en alcanzar la posición del scroll, y es parte de la sensación.

Se reproduce con un resorte **sin rebote** (`useSpring` con `duration` = el `scrub` y `bounce: 0`) que sigue al progreso crudo.

⚠️ **DECIDIDO, no medido:** GSAP implementa el `scrub` como un tween re-apuntado en cada evento de scroll; acá es un resorte con la misma duración de asentamiento. **Misma familia de comportamiento, no la misma matemática.** `bounce: 0` no es opcional: un rebote haría que el progreso pase de 1 y vuelva, y el sistema dejaría de ser exactamente reversible. Hay una perilla para apagarlo y comparar.

---

## Las anclas, verificadas contra los píxeles de la referencia

SCROLL.md §2 publica los `start` y `end` en **píxeles absolutos de scroll** de las 60 instancias de la home a 1440, con un viewport de 900. La función de anclas es pura —`(topDoc, alto, viewport) → (inicio, fin)`— así que se le puede pedir que reproduzca esos píxeles.

**El bloque de links del pie**: dieciséis instancias, todas con el mismo rango de 190 px y 30 px de desfase entre una y la siguiente. Con el ancla de P1 y un elemento de 30 px de alto:

```
start  19 839  →  reproducido EXACTO
end    20 029  →  reproducido EXACTO   (rango = alto + 160)
las siete posiciones distintas, moviendo el elemento de a 30 px  →  las siete
```

Los controles positivos son dos anclas mutiladas: una sin el `−240px` del final y otra sin el `−80px` del inicio. Ninguna reproduce el píxel medido.

**La forma del rango de los nueve**, despejada por el instrumento:

```
P1  alto + 160 px            top bottom-=80px  → bottom bottom-=240px
P2  alto                     top bottom        → bottom bottom
P3  alto + 0,4·viewport      top bottom-=10%   → bottom center
P4  alto + 1·viewport        top bottom        → bottom top
P5  alto − 0,4·viewport      top top+=20%      → bottom bottom-=40%
P6  alto + 1·viewport        (default de ScrollTrigger)
P7  alto                     top bottom        → bottom bottom
P8  alto + 0,1·viewport      top 80%           → bottom 70%
P9  alto + 0,2·viewport      top 80%           → bottom 60%
```

**P5 es el único que puede dar un rango negativo** —necesita un elemento más alto que el 40 % del viewport— y está acotado a 1 px en vez de dividir por cero. Los otros ocho no degeneran con la misma caja.

### Por qué el rango se calcula y no se le pide a `useScroll`

`useScroll({ target, offset })` resuelve cada extremo como `resolveEdge(bordeElemento) − resolveEdge(bordeViewport)`, y `resolveEdge` admite **un solo término**: o una fracción de la longitud, o un desplazamiento en píxeles, nunca los dos. `"top bottom-=80px"` sí se puede escribir (`['80px', 'end']`); `"bottom bottom-=240px"` **no**, porque haría falta `fracción 1 + 240px` sobre el elemento. Cuatro de las nueve anclas quedan fuera de lo expresable, y aproximar no es una opción: el rango de P1 para el bloque del pie son **190 px en total**, así que un error de 240 sería más grande que el rango entero.

### Y un beneficio lateral que no es menor

`useScroll` marca `scrollYProgress` como **acelerable** cuando el `offset` mapea a un rango con nombre de ViewTimeline, y ahí `motion` promueve en silencio a cualquier consumidor que derive ese valor hacia `transform`/`opacity`/`filter`/`clipPath` a una animación nativa de WAAPI atada al **contenedor de scroll ancestro más cercano** — no a la ventana. **Este sistema pone `overflow: hidden` en cada línea de texto**: ese camino se congelaría sin un solo error en consola, y solo en los navegadores con ViewTimeline. Derivando de `scrollY` —píxeles crudos, sin `target` y sin `offset`— no hay rango con nombre, no hay aceleración, y todos los consumidores corren por el mismo camino de JS.

---

## Rendimiento: qué corre y qué no

- **Cero `setState` por cuadro, y cero `setState` a secas en el motor.** La caja medida vive en un `ref` y el aviso de que cambió viaja por un `MotionValue`, no por un render. El scroll no dispara un solo render de React.
- **Lo único que re-renderiza la ruta son las perillas**, y siempre por un gesto del usuario.
- **No hace falta un `IntersectionObserver` para pausar los patrones fuera de pantalla.** El progreso está acotado a `[0, 1]` y un `MotionValue` solo avisa a sus suscriptores cuando el valor **cambia** (`updateAndNotify`: `if (this.current !== this.prev)`). Un patrón fuera de su rango devuelve siempre el mismo 0 o el mismo 1, así que no propaga: ni sus curvas, ni la composición de su `transform`, ni la escritura al DOM. La pausa ya está, y sin un oyente más por instancia.
- **`will-change: transform` solo donde hay transformada.** Un patrón que solo anima opacidad no declara `transform` y por lo tanto no crea una capa de composición que no pidió.
- **Un cálculo por cuadro y por pieza**, no cuatro: `propiedadesDePieza` corre una vez y devuelve el objeto entero.

---

## Cero valores fuera de los tokens

Hay un instrumento que lo mira, y **lee `theme-develop.css`** en vez de una lista escrita a mano: si mañana alguien agrega `--spacing-7`, `p-7` pasa a ser legítimo sin tocar el invariante.

| familia | resultado |
|---|---|
| colores literales (`#hex`, `rgb()`, `hsl()`) | **ninguno** |
| espaciado (`p-`, `m-`, `gap-`, `space-`, `top/right/bottom/left/inset-`) | los **9 múltiplos declarados**, más el cero estructural |
| `bg-` `text-` `border-` `leading-` `tracking-` `font-` `rounded-` `opacity-` `max-w-` | **todos** nombres de token |
| valores arbitrarios `[...]` | **4**, y los 4 son `var(--token)`: `--columna-lateral` ×2, `--pad-lateral-compacto`, `--z-cabecera` |

Los controles positivos son un `#ff0000`, un `rgba()`, un `p-7`, un `-mt-1.5`, un `bg-red-500`, un `text-2xl` y un `text-[13px]`. El escáner los ve a todos.

**Dos excepciones, las dos declaradas:**

1. **Los bordes.** `--border-hairline` **no genera utilidad** — el propio tema lo lista como uno de los renombres pendientes (`--border-hairline` → `--border-width-hairline` → `.border-hairline`). Mientras tanto el sprint usa `border`, `border-t`, `border-b` y `border-l` de Tailwind, que son de 1 px. No es un valor elegido a ojo: el invariante lee el token del tema, afirma que vale **exactamente `1px`**, y afirma que no hay un solo borde con grosor numérico.
2. **Los `svh` del demo.** Cuánto scroll gasta una demostración es geometría del **instrumento**, no del sistema de diseño, y no hay —ni tiene que haber— un token para eso. Pero tampoco son números elegidos: salen del ancla de cada patrón. `altoDelBloqueSvh` despeja el alto que hace falta para un recorrido objetivo de medio viewport, que es del mismo orden que lo medido en la referencia (0,18 a 0,59 pantallas).

---

## (h) Archivos

### Creados — el sistema (**no se borra**)

```
src/app/v3/_lib/motion/
  curvas.ts                    las seis curvas de GSAP, como funciones exactas
  traduccion.ts                la tabla de traducción a CSS real y su composición
  anclas.ts                    la gramática de ScrollTrigger → rango de scroll
  cronograma.ts                el escalonado y las dos trampas de duración
  fotograma.ts                 de un progreso a las propiedades de UNA pieza
  patrones.ts                  los tipos y el registro de los nueve
  patrones-tipografia.ts       P1, P2, P3 y P6 — 233 de las 244 instancias
  patrones-piezas.ts           P4, P5, P7, P8 y P9
  lineas.ts                    el agrupamiento y el contrato de accesibilidad
  epoca.ts                     cuándo se vuelve a medir, y cuándo NO
  escenografia.ts              cuánto scroll le toca a cada patrón, derivado
  reducido.ts                  la política de movimiento reducido
  marcaMotion.ts               la marca del chunk (la importa UN solo archivo)
  useProgresoDePatron.ts       el motor: scroll → 0→1 por patrón
  useProgresoEnTiempoReal.ts   el segundo modo: reloj → 0→1
  useLineasMedidas.ts          la medición de líneas, en dos fases
```

### Creados — los instrumentos

```
src/app/v3/_lib/motion/__tests__/
  curvas.invariant.ts          traduccion.invariant.ts
  cronograma.invariant.ts      anclas.invariant.ts
  epoca.invariant.ts           lineas.invariant.tsx
  reducido.invariant.tsx       tokens-de-uso.invariant.ts
  galeria.invariant.tsx        motion-bundle.invariant.ts
  motion-css.invariant.ts
```

### Creados — la ruta de demostración (**deuda con fecha de baja**)

```
src/app/v3/motion/
  page.tsx                          la mesa de calibración, noindex
  control-estatico/page.tsx         el control positivo del bundle, noindex
  _componentes/
    CompuertaDeMotion.tsx           la compuerta de 1025, reusando la de S1
    Coreografia.tsx                 el módulo perezoso — el único con la MARCA
    SeccionDePatron.tsx             una sección por patrón, con su ficha
    BloqueDePatron.tsx              el elemento medido + el motor
    Pieza.tsx                       el único lugar que escribe estilo
    Piezas.tsx                      N piezas del mismo patrón
    LineasDeTexto.tsx               el divisor, como componente
    contenidosTexto.tsx             P1, P2, P3, P6
    contenidosPiezas.tsx            P4, P5, P7, P8, P9
    Controles.tsx                   las perillas
    ajustes.ts                      qué se puede variar sin recompilar
    relleno.ts                      texto neutro de calibración
```

### Creados — el reporte

```
docs/rediseno/outputs/SITIO-S2-MOTION.md   este archivo
```

### Modificados

```
package.json    once scripts `test:s2-*` más el agregado `test:s2`, junto al bloque de S1
```

**Nada más se tocó.** Ni `/v3/page.tsx`, ni `secciones.ts`, ni `superficies.ts`, ni `Panel.tsx`, ni `PanelPinneado.tsx`, ni `EscenarioCompuerta.tsx`, ni `EscenarioDePrueba.tsx`, ni el `layout.tsx` de `/v3`, ni `theme-develop.css`. Ni el home, ni `/probe-escena`, ni `home-intro/`, ni un solo archivo congelado.

⚠️ **`package.json` es el único archivo compartido con el sprint paralelo.** Los once scripts se agregaron pegados al bloque `test:s1-*` y no al final del objeto, que es donde S3 previsiblemente agregaría los suyos. Si aun así hay conflicto, es de una línea y se resuelve conservando los dos bloques.

### `git status`

```
M  package.json
?? docs/rediseno/outputs/SITIO-S2-MOTION.md
?? src/app/v3/_lib/motion/     (27 archivos: 16 del sistema + 11 invariantes)
?? src/app/v3/motion/          (14 archivos: 2 rutas + 12 componentes)
```

**42 archivos nuevos, 1 modificado.** Sin commitear: la parada es bloqueante.

---

## (i) Qué queda para el sprint de secciones

### Listo para consumir

- **`src/app/v3/_lib/motion/` es el sistema y no se borra.** Dieciséis módulos, todos puros o hooks, sin una sola dependencia del demo. Una sección nueva usa `BloqueDePatron` + `Pieza` (o `LineasDeTexto` para P1) y no necesita saber nada más.
- **P7 es el mecanismo con el que van a entrar los proyectos** en Trabajos. Está construido con sus dos curvas, su conmutación de `pointerEvents` y su perspectiva de 1000 px en el ancestro.
- **La compuerta ya cubre la coreografía.** Una sección nueva que importe el sistema desde el árbol perezoso no agrega peso a la carga inicial.

### Pendiente, con su motivo

- **La calibración fina la hace el ojo.** Los nueve están en sus valores medidos y las perillas existen justamente porque el número medido en el sitio de otro no tiene por qué ser el número de develOP. Hasta que Valentino grabe y decida, lo que hay es la reconstrucción, no la decisión.
- **P1 en modo `tiempo-real` usa una cantidad de líneas declarada** (seis, el extremo medido) para calcular el total en segundos. Si el navegador parte el texto en más líneas, ese modo corre proporcionalmente más rápido. El modo atado al scroll —el que usa el sitio— no se entera. Se resuelve el día que una sección necesite el modo temporal sobre texto partido.
- **El reparto interno de P7 entre llegada y salida es una lectura**, no una medición: lo medido es la banda de duraciones (0,5 a 3 s), las dos curvas, el escalonado y los extremos. Que la llegada ocupe 3 s y la salida 0,5 es una decisión declarada.
- **El orden de composición de la transformada es decidido, no medido.** SCROLL.md registra QUÉ propiedades se aplican, no en qué orden las serializa GSAP. Para el único patrón que combina escala con rotación (P8) el orden es indistinguible —la escala es uniforme y conmuta con cualquier rotación—, así que hoy no cambia un píxel. Cambiaría con una escala no uniforme.
- **La inercia del `scrub` es un resorte, no un tween re-apuntado.** Ver arriba.
- **El presupuesto de JS de `/v3` sigue sin cumplirse y sigue sin ser de este lane.** 23 de los 25 archivos de la carga inicial vienen del layout RAÍZ, que importa estáticamente el chrome viejo. Es el pendiente que S1 dejó anotado y que se resuelve el día que `/v3` reemplace al home.
- **Una ruta nueva cuesta ~1,7 KiB crudo a TODO el sitio.** Ver "Cifra del sistema". Las ocho secciones no agregan rutas; las páginas internas sí, y ahí la decisión entre N rutas o una ruta con parámetro vale veinte a uno.
- **PREDICCIÓN DEL MAPA — comprobación diferida que hereda este sprint.** Al borrar `/v3/motion` y `/v3/motion/control-estatico`, el peso heredado de `/v3` tiene que volver solo ±3,4 KiB. Si no vuelve, el diagnóstico estaba mal. El instrumento ya existe (`npm run test:s1-bundle`); solo hay que mirar el número ese día.

### Deuda con fecha de baja

**`/v3/motion` y `/v3/motion/control-estatico` se borran cuando el sitio esté armado.** Las dos llevan `noindex, nofollow, nocache`. Al borrarlas hay que borrar también `src/app/v3/motion/_componentes/` entero y las afirmaciones B2 y B3 del invariante del bundle —o, mejor, reemplazar B3 por el control con build aislado (`E2E_DIST_DIR`), que no deja ruta. **Lo que NO se borra es `src/app/v3/_lib/motion/`.**

---

## Regla 11 · cifra → instrumento

| cifra | instrumento |
|---|---|
| las seis curvas contra su fórmula · 0,028005 contra `sine.inOut` · 0,0819 entre cuártica y quíntica · 0,025194 contra la ease-out-quad del repo | `_lib/motion/__tests__/curvas.invariant.ts` |
| las 12 equivalencias de la tabla de traducción · la cadena completa de P8 · los dos órdenes de composición | `_lib/motion/__tests__/traduccion.invariant.ts` |
| 8,2 s aplicados · 0,7561 y 24,39 % de la pieza 32 · 0,84 contra 1 del orden de la curva · 0,0832 en p=0,17 | `_lib/motion/__tests__/cronograma.invariant.ts` |
| 19 839 y 20 029 exactos · las 7 posiciones del pie · la forma del rango de los nueve | `_lib/motion/__tests__/anclas.invariant.ts` |
| 1 y 2 mediciones por instancia · 20 contra 1 en la ráfaga · 2 contra 0 con la pestaña oculta | `_lib/motion/__tests__/epoca.invariant.ts` |
| las dos mitades de la protección de lectores, sobre el marcado real · el agrupamiento y su reconstrucción | `_lib/motion/__tests__/lineas.invariant.tsx` |
| las seis afirmaciones de movimiento reducido y sus gemelas · 226 contra 22 elementos | `_lib/motion/__tests__/reducido.invariant.tsx` |
| 0 colores literales · los 9 múltiplos · los 4 arbitrarios · `--border-hairline` = 1px | `_lib/motion/__tests__/tokens-de-uso.invariant.ts` |
| los nueve EN la página con su ancla y su curva · 3 copias accesibles · `noindex` de las dos rutas | `_lib/motion/__tests__/galeria.invariant.tsx` |
| B0/B1/B2/B3/**B4** · 28,2 KiB crudo y 9,2 KiB gzip del chunk · **/v3: 24 archivos, 1389,3 / 423,0** · **/v3/motion: 25 archivos, 1394,4 / 425,1** · la diferencia de conjuntos (1 archivo) · las 5 huellas ausentes con su control | `_lib/motion/__tests__/motion-bundle.invariant.ts` |
| las 32 utilidades con regla emitida | `_lib/motion/__tests__/motion-css.invariant.ts` |
| 61 y 122 bytes de las entradas de ruta · 3,5 % explicado · 3.360 sin explicar | conteo directo sobre los chunks compartidos, en el reporte |
| +1,7 KiB crudo por ruta nueva | derivado de una observación de dos rutas · lo cierra la PREDICCIÓN DEL MAPA |
| `tsc` exit 0 · `eslint` exit 0 · `build` exit 0 | los tres gates, corridos a mano |
