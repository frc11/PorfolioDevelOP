# COMPO-2 · CINCO AJUSTES DE COMPOSICIÓN Y UNA REGLA GLOBAL

**Los cinco puntos y la regla, aplicados y medidos.** Worktree
`C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre el árbol de
**PAPEL-2** —que sigue sin commitear, y arriba de COMPO-1, MOVIL-1, TEXTO-2 y
TEXTO-3, que tampoco—. **No se commiteó nada.**

**Instrumentos nuevos**: cuatro, en `scripts-compo2/` — `compo2-comun.ts` (el
lector de la columna entera con sus renglones), `a-medir.ts` (la medición y los
barridos, con las dos máscaras de TAPADO-1), `b-derivacion.ts` (las dos paradas,
sin navegador y ANTES de construir) y `c-antes.mjs` (el «antes» del A/B de peso,
reconstruido con un `assert` por quite).
**Instrumentos reusados**: `scripts-tapado/{tapado-comun,mascaras}.ts`,
`scripts-b4/{captura,navegador,cdp}.ts` y `scripts-papel/c-peso.mjs`.

**Salidas**: `outputs/compo2/{a-hoy,a-regla0,a-b425,a-b768,a-b768sub,a-b768fino,
a-b1024,a-b1024fino,a-pastilla,a-despues,b-derivacion}.json` + `b-derivacion.txt`.
**Capturas**: `capturas/compo2/despues-*.png` — **8 archivos**, los ocho anchos
con recarga limpia por ancho, `deviceScaleFactor` 1. Contra un tope de 50.

⚠️ **El que captura NO tiene `prefers-reduced-motion` activo, y no por defecto:**
`enLaVentana` fuerza `Emulation.setEmulatedMedia` con
`prefers-reduced-motion: no-preference` antes de navegar, así que las ocho
capturas y las nueve corridas de medición salen con **todas las animaciones
corriendo**. Queda declarado porque cambia qué se ve.

---

## 0 · LO QUE HAY QUE LEER PRIMERO

### 🔴 TRES COSAS QUE LA INSTRUCCIÓN DABA POR CIERTAS Y LA MEDICIÓN CORRIGE

**1. En 425 y en 768 el bloque NO se cae al sacar la pastilla — no hacía falta
sostenerlo.** El §2c y el §3b son explícitos: *«al sacar la pastilla se liberan
72 px y el bloque, que se apoya abajo, va a CAER»*. **Medido: no cae, y no puede
caer.** Lo que reserva esos 72 px es `pb-20`, no la pastilla, y `pb-20` no se
toca en esa banda: PAPEL-2 acotó su `max-chico:pb-2` a los anchos de papel. Con
la pastilla apagada y el pie intacto el tope de la columna es **el mismo a la
centésima** (425: 492,13 con y sin; 768: 644,38 con y sin). El pedido se cumple
**no haciendo nada**, y lo que se hizo fue medirlo.

**2. Lo que SÍ movió el bloque fue la regla global, y a 768 eso costó caro.** La
bajada pasa de dos renglones a uno, o sea que el bloque pierde una caja de línea
de `--text-base` (25,6 px); con el bloque apoyado abajo eso lo BAJA. En siete
anchos no importa o mejora. **A 768 la superposición pasa sola de 3,35 % a
8,53 %** —sin que nadie toque el titular— porque mete el registro 2 adentro de la
**segunda masa de la escena** (filas 800–838, la que `TEXTO-1` §4 midió en ~0,781
del alto). Se arregla devolviéndole al pie exactamente el renglón que la regla le
sacó, y el control lo confirma al píxel: vuelve a **3,35 %**.

**3. El §3c y el §4b esperaban el mismo resultado en 768 y en 1024, y no lo
dan.** El §4 dice que a 1024 el registro 1 tiene que quedar *«casi del ancho de
LAS 24 HS, como quedó en 768»*. A 1024 el techo medido deja el registro 1 al
**95,5 %** del registro 2 — casi, efectivamente. **A 768 el techo medido lo deja
al 74,8 %**, y no es una elección: es donde la superposición deja de cumplir el
criterio que el propio §3c fija («que se mantenga en lo que está hoy o baje»).
Los dos anchos tienen la misma regla y dan resultados distintos porque la escena
es distinta ahí. El número está abajo, con la tabla del barrido.

### ✅ LOS SEIS PUNTOS, EN UNA TABLA

| § | qué pedía | resultado |
|---|---|---|
| 0 | la bajada en UN renglón, en los ocho | ✅ un renglón en los ocho, **243,34 px** contra la caja más chica de 256 |
| 1 | la marca mucho más grande y el bloque centrado | ✅ **×2,63219** (isotipo 66,6 → **175,2 px**), centrado real: 31,81 / 31,83 px de aire a 320 |
| 2 | 425: el solapamiento y la pastilla | ✅ **4,12 % → 1,13 %** con la regla global sola · pastilla fuera · bloque a 0,00 px de movimiento |
| 3 | 768: la pastilla y el titular más grande | ✅ pastilla fuera · **44,75 → 67,00 px** y la superposición BAJA: 3,36 % → 3,18 % |
| 4 | 1024: el titular casi del ancho del registro 2 | ✅ **49,80 → 95,00 px** — a **18,4 px (4,5 %)** del ancho de «LAS 24 HS» |
| 5 | 390, 1440 y 1920 intactos | ⚠️ 1440 y 1920 **idénticos al decimal**; **390 se movió 25,60 px por la regla global** (y mejoró) |

---

## 1 · REGLA GLOBAL — LA BAJADA EN UN RENGLÓN

### 1.1 · Entra en los ocho, medido en el navegador

El párrafo es un ítem de una columna `items-start`, así que su caja se achica al
contenido: **su ancho ES el renglón**.

| ancho | renglón | caja de la bajada | margen |
|---|---|---|---|
| **320** | 243,34 | 256,00 | **12,66** ← el que manda |
| 375 | 243,34 | 311,00 | 67,66 |
| 390 | 243,34 | 326,00 | 82,66 |
| 425 | 243,34 | 361,00 | 117,66 |
| 768 | 243,34 | 346,00 | 102,66 |
| 1024 | 243,34 | 474,00 | 230,66 |
| 1440 | 243,34 | 354,80 | 111,46 — ya era un renglón |
| 1920 | 243,34 | 498,80 | 255,46 — ya era un renglón |

El modelo del `.woff2` da 245,22 px (15,32600 em × 16): **sobreestima 1,88 px**
porque no cuenta kerning, o sea que erra para el lado seguro.

### 1.2 · ⚠️ El instrumento tenía una ceguera y este punto la destapó

El lector de renglones va por **nodo de texto** (la corrección de COMPO-1), y la
frase eran DOS nodos —uno por `<span>`—, así que su `anchoDeTinta` publicaba
**126,50 px**: el más ancho de los dos, no la suma con el espacio en medio. Medir
la regla global por ahí habría publicado media frase. Lo que se mide es la caja
del `<p>`, y el porqué quedó escrito en `b-derivacion.ts`.

### 1.3 · El quiebre se revoca en el DATO, no en el marcado

`bajadaFila1` y `bajadaFila2` vuelven a ser **un solo campo**, y con ellos se van
los dos `<span>`, el separador de texto entre ellos y el envoltorio que
conmutaba. El pedido de `PEDIDO` pasa de tres entradas a dos. **El texto
pendiente es el mismo**; lo que cambió es que ya no hay que decir dónde corta.

El techo de caracteres se re-derivó para una frase entera: **36**, contra el ancho
más angosto (256 px de caja a 320 y 7,006 px por carácter sobre esta cadena).

---

## 2 · §1 — LA MARCA GRANDE Y EL BLOQUE CENTRADO

### 2.1 · El factor es una RAZÓN, y es UNA sola para los dos anchos

El isotipo mide hoy una caja de línea del registro 1 y su ancho sale del `viewBox`
recortado a la tinta. Pedirle que su ancho **iguale el ancho de tinta del
titular** fija el factor sin elegir un número:

```
ancho del isotipo = tamaño₁ × 1,09 × 1,43749 × k
ancho del titular = tamaño₁ × 4,12429        (el avance de «TU NEGOCIO»)

k = 4,12429 / (1,09 × 1,43749) = 2,63219
```

**No depende del ancho de pantalla**: depende de la cara y del dibujo. Por eso la
marca **no cambia de forma entre dos teléfonos** — el defecto que COMPO-1 le
arregló al titular y que este sprint no vuelve a introducir por el otro lado.

### 2.2 · Los dos techos, y por qué el factor queda abajo de los dos

| ancho | techo por ALTO | techo por ANCHO | aplicado | sobrante |
|---|---|---|---|---|
| 320 | ×3,1373 | **×2,6760** | ×2,63219 | 47,6 px |
| 375 | ×3,2584 | **×2,6683** | ×2,63219 | 66,3 px |

El techo común es **×2,6683** —lo pone el ANCHO a 375— y el factor derivado queda
**un 1,4 % por debajo**. O sea que «el mayor alto que entra» y «el que iguala la
tinta del titular» son, acá, prácticamente el mismo número.

El respiro no se eligió: es `--spacing-2` por lado, el mismo hueco con el que la
columna separa sus piezas. Un bloque no puede quedar más cerca del borde de su
caja de lo que sus piezas quedan entre sí.

### 2.3 · Lo que eso da en pantalla

| | 320×568 | 375×667 |
|---|---|---|
| isotipo antes | 66,55 × 95,66 | 81,08 × 116,55 |
| **isotipo ahora** | **175,19 × 251,83** | **213,42 × 306,78** |
| palabra `develOP` | 11,00 → **28,95 px** | 11,00 → **28,95 px** |
| columna antes → ahora | 401,75 → **504,36** | 458,42 → **584,73** |
| tope de la columna | 158,25 → **31,81** | 200,58 → **41,13** |
| aire arriba / abajo | **31,81 / 31,83** | **41,13 / 41,14** |

**El centrado es real, no aproximado**: 0,02 px de diferencia entre el aire de
arriba y el de abajo, en los dos anchos.

⚠️ **Lo que sube el bloque son DOS cosas y se separan:** el centrado aporta la
mitad del sobrante (23,8 px a 320); el resto lo aporta que la columna **creció
hacia arriba** 102,6 px. El tope pasa de 158,25 a 31,81 px.

### 2.4 · ⚠️ Dos cosas que hubo que agregar para que «centrado» fuera cierto

**(a) El aire de arriba, igualado al del pie.** `justify-content: center` centra
en la CAJA DE CONTENIDO, no en el viewport, y con `pt-20` (80 px) arriba y
`pb-2` (8) abajo la caja no está centrada en la pantalla: el bloque habría
quedado **36 px por debajo** del centro. El valor no se elige — `Hero.tsx` ya
declaraba que *«el `pt-20` de arriba es aire»*, y con el bloque centrado el aire
lo pone el centrado y el relleno pasa a ser el PISO; el piso de abajo ya estaba
derivado, así que arriba se le iguala. Eso sube el alto útil de 480 a **552 px** a
320 y de 579 a **651** a 375 — y son esos 72 px los que dejan entrar una marca de
×2,63 en vez de una de ×2,22.

**(b) La celda lateral vacía, apagada.** COMPO-1 dejó el `<div>` que reserva la
columna de 140 px con el argumento de que abajo de 1025 es «una fila de alto cero
que cae arriba del bloque y no mueve un píxel». **Era cierto con `justify-end` y
dejó de serlo con `justify-center`:** una fila de alto cero no cuesta cero, la
grilla le pone su canaleta (12 px) igual, y con el bloque centrado eso lo corre
**6 px por debajo del centro** — medido antes de la clase: 37,81 px de aire arriba
contra 25,83 abajo.

---

## 3 · §2 — 425: EL SOLAPAMIENTO Y LA PASTILLA

### 3.1 · La palanca fue la REGLA GLOBAL, y ninguna propia

| máscara | hoy | después |
|---|---|---|
| sobre la ESCENA (D) | 4,12 % | **1,13 %** |
| DETRÁS del texto (E) | 4,05 % | **1,31 %** |

El registro 1 —que es el que el §2a nombra— pasa de **7,82 % a 0,40 %**.

⚠ El «hoy» de 425 midió **4,12 · 4,33 · 4,34 %** en tres corridas distintas del
mismo árbol: la escena tiene motas sueltas que no caen en el mismo píxel entre
dos cargas. La tabla usa el par de corridas que abren y cierran el sprint
(`a-hoy.json` y `a-despues.json`); los barridos intermedios traen su propio
«hoy» y por eso sus cifras no coinciden al centésimo con ésta. No hizo
falta achicar el titular ni subir el bloque: la regla global baja el bloque 25,6
px y eso ya lo saca de la cola de la masa (filas 261–575).

**Por qué no se usó ninguna de las dos palancas que el §2a ofrecía:** subir el
bloque a 425 lo mete MÁS adentro de la masa, que termina en la fila 575 y está
arriba del bloque, no abajo; y achicar el titular resuelve un problema que la
regla global ya cerró.

### 3.2 · La pastilla, y los 72 px que NO se cobran

`max-medio:hidden`. El bloque **no se mueve**: 492,13 px de tope con la pastilla y
492,13 sin ella, y la superposición idéntica a la milésima (4,330 % en las dos).
Si los 72 px se soltaran —bajando el pie a 8 px, como hace la banda de papel— el
bloque caería y **la superposición pasaría de 4,33 % a 14,82 %**. Por eso quedan
como aire muerto a propósito.

---

## 4 · §3 — 768: LA PASTILLA Y EL TITULAR MÁS GRANDE

### 4.1 · El renglón devuelto, y por qué no es «subir el bloque»

La regla global le saca al bloque una caja de línea de la bajada
(`--text-base × --leading-texto` = 25,6 px) y el bloque se apoya abajo, así que
eso lo BAJA. A 768 el registro 2 cae adentro de la segunda masa:

| | superposición del titular | del registro 2 |
|---|---|---|
| hoy | 3,35 % | 6,08 % |
| con la regla global sola | **8,53 %** | **16,79 %** |
| con el renglón devuelto | **3,35 %** | 6,08 % |

El valor devuelto **no es un escalón de la escala**: es
`calc(var(--text-base) * var(--leading-texto))`, la misma cuenta que produjo el
defecto. El control es exacto: con el margen puesto la superposición vuelve al
mismo número de hoy, con el mismo titular.

⚠️ **Los 72 px de la pastilla siguen reservados por `pb-20`, que no se toca.** Lo
que se devuelve son 25,6 px, no 72.

### 4.2 · El techo del registro 1, barrido sobre el píxel

Con el bloque devuelto a su posición, el criterio del §3c («que la superposición
se mantenga en lo que está hoy o baje»):

| registro 1 | superposición del titular | ¿pasa? |
|---|---|---|
| 44,75 (hoy) | 3,35 % | — |
| 62 | 2,46 % | sí |
| 64 | 2,60 % | sí |
| 65 | 2,73 % | sí |
| 66 | 3,07 % | sí |
| **67** | **3,35 %** | **sí — el techo** |
| 68 | 3,58 % | no |

**67 px**, un 50 % más grande que hoy. Su tinta mide **276,5 px** contra los 369,7
de «LAS 24 HS», o sea el **74,8 %**.

### 4.3 · ⚠️ Y sin devolver el renglón el criterio es INALCANZABLE

Barrido con el bloque bajado (la regla global sola): el mínimo de todo el barrido
es **4,98 % a 75 px** y nunca vuelve a 3,35 %. Si el criterio se midiera contra el
estado post-regla-global (8,53 %) el techo subiría a ~85 px —y ahí sí el titular
quedaría al 94,9 % del registro 2, que es lo que el §4b esperaba—, **pero al
precio de duplicar la tinta bajo AA de 3,0 % a 6,7 %**. Se eligió el criterio que
la instrucción escribió, y la alternativa queda con su número para el dueño.

---

## 5 · §4 — 1024: EL TITULAR CASI DEL ANCHO DEL REGISTRO 2

| registro 1 | tinta | razón contra «LAS 24 HS» | superposición | ¿pasa? |
|---|---|---|---|---|
| 49,80 (hoy) | 205,48 | 0,501 | 0,51 % | — |
| 75 | 309,53 | 0,754 | 0,41 % | sí |
| 90 | 371,44 | 0,905 | 0,53 % | sí |
| **95** | **392,08** | **0,955** | **0,52 %** | **sí — el techo** |
| 96 | 396,20 | 0,965 | 0,58 % | no |
| 97 | 400,33 | 0,975 | 0,65 % | no |
| 99,5 | 410,64 | 1,000 | 0,87 % | no |
| 105 | 433,34 | 1,056 | 2,61 % | no |

**El margen que el §4b pedía: 18,4 px, o sea un 4,5 % por debajo del ancho de
«LAS 24 HS».** Y no sale de la razón de PAPEL-2 —que es la de IGUALAR— sino del
barrido: es donde la superposición deja de estar plana.

⚠️ **La banda es plana y el codo está en 96.** Entre 49,8 y 95 px la
superposición se mueve entre 0,41 % y 0,61 % —menos que la diferencia entre tres
corridas del mismo «hoy», que dio 0,49, 0,51 y 0,53 %—; de 96 en adelante sube
monótona. El techo es el último punto de la meseta, no un valor con tres
decimales.

**Sigue en DOS renglones** ✅ (medido: `renglones` del registro 1 = 2 a 1024), y
la pastilla **se queda** ✅ (medido: `pastillaVisible` = true a 1024, false en los
cinco de abajo).

---

## 6 · §5 — LOS TRES INTOCABLES

| ancho | columna hoy → después | tope hoy → después | superposición hoy → después |
|---|---|---|---|
| **390** | 269,05 → **243,45** | 494,95 → **520,55** | 2,80 % → **1,02 %** |
| **1440** | 305,17 → **305,17** | 297,41 → **297,41** | 0,67 % → 0,68 % |
| **1920** | 333,66 → **333,66** | 373,17 → **373,17** | 0,06 % → 0,07 % |

**1440 y 1920 son idénticos al decimal** — en la columna y en el tope. Los 0,01
puntos de la superposición son ruido de la escena entre dos cargas, no un cambio:
la escena tiene motas sueltas que no caen en el mismo píxel.

### 🔴 390 SE MOVIÓ, Y ES POR LA REGLA GLOBAL

La instrucción lo anticipaba (*«si alguno se movió por la regla 0, reportalo con
el número»*) y pasó: **la columna pierde 25,60 px de alto y su tope baja 25,60
px**, porque la bajada deja de ocupar dos renglones y el bloque se apoya abajo.

**No hay forma de cumplir las dos cosas.** La regla 0 es global por pedido —«en
los OCHO anchos»— y una bajada de un renglón mide 25,6 px menos que una de dos.
Compensarlo con un margen, como se hizo en 768, devolvería 390 a su posición
exacta **y también devolvería su superposición de 1,02 % a 2,80 %**. Se eligió no
compensar porque el movimiento MEJORA el ancho: la decisión queda dicha con los
dos números para que el dueño la revoque si prefiere la posición.

---

## 7 · LO QUE NO SE TOCÓ

- La escena, la cámara, `frameX`, la distancia, el anclaje y el alto de sección:
  **cero cambios**.
- `HeroArtifact.tsx` y `TransitionContext.tsx`: intactos.
- El botón que desliza a Trabajos y las otras siete secciones: fuera de alcance.
- `pb-20` y `pt-20`: siguen los dos en el marcado; lo que se agregó son
  CONDICIONES acotadas a la banda de papel.
- `--breakpoint-angosto` (375): **no se tocó**. Este sprint tampoco declaró un
  corte nuevo: la banda de la pastilla usa `--breakpoint-medio` (860), que ya
  existía desde COMPO-1 y es el único corte declarado entre 768 y 1024.
- Cero `any`, cero `router.push`, cero `git add`.

---

## 8 · EL PESO

### 8.1 · La línea: +0,19 KiB, con su recibo

**186,0 B** de desvío, medidos A/B entre dos builds del mismo árbol, con el mismo
`distDir` que lee el gate.

```
«antes» (árbol de PAPEL-2, reconstruido)    71.960,0 B
«después» (árbol de cierre)                 72.146,0 B   +186,0
```

**El control: el «antes» reconstruido da EXACTAMENTE los 71.960,0 B que PAPEL-2
publicó en su §10 — y los da en OTRO `distDir`**, o sea que la reconstrucción es
fiel y el directorio de build no mueve la cifra. El «antes» se RECONSTRUYÓ
quitando de cada archivo lo que el sprint le puso, con un `assert` por quite:
`scripts-compo2/c-antes.mjs`, con los sha256 publicados.

⚠️ **Es la línea más chica del tablero después de TAPADO-1, y hay un motivo: la
regla global DEVUELVE 70 B.** Se van dos `<span>`, el separador de texto entre
ellos y el `className` del envoltorio. Sin esa devolución la línea habría sido
256 B. El inventario derivado, con sus **15 B publicados SIN atribuir**, está en
`s5-presupuesto-recibos-de-compo2.ts`.

Al centésimo de arriba: 186,0 / 1024 = 0,1816 → **0,19**, que deja **8,6 B** de
aire. **Es la primera línea en cuatro que NO necesita la regla del aire útil.**

**El techo de 60 NO se movió.** El techo del lane pasa de 66,16 a **66,35 KiB**.

### 8.2 · El ruido entre dos builds del mismo árbol: 9,0 B

El árbol de cierre se construyó dos veces —`.next-compo2` y `.next`, mismo
comando, mismo contenido— y dio **72.155,0 y 72.146,0 B**. El «antes», en cambio,
dio 71.960,0 en sus dos builds. Se declara en vez de apropiarse: la línea usa el
par que el gate lee y el otro queda publicado.

---

## 9 · TRES HALLAZGOS DE MÉTODO

| qué | dónde apareció |
|---|---|
| **`next build` SÍ corre el typecheck** en Next 16.2.9 — la nota del repo decía que lo ignoraba. Lo destapó el primer intento del «antes», que murió con `Failed to type check` sobre un instrumento de este mismo sprint. | A/B de peso |
| **PAPEL-2 no dejó archivo de recibo ni afirmación para su línea de 0,76 KiB**: es la única de las quince que nadie vigila desde `s5-peso-lineas.ts`. No lo arregla este sprint —es de otro— y queda anotado. | `s5-peso-lineas.ts` |
| **Una fila de grilla de alto cero NO cuesta cero**: se lleva su canaleta. Invisible mientras el bloque se apoya abajo; 6 px de descentrado apenas se centra. | §1 |

---

## 10 · EL GATE

`MEDIR_CON_LA_LLAVE_PRENDIDA=1 NODE_OPTIONS=--max-old-space-size=6144 npm run build`
(exit 0) · `npx prisma migrate status` · el gate por grupos.

| paso | resultado |
|---|---|
| 1 · `package.json` | ok — JSON válido, 0 marcadores de conflicto, 0 claves duplicadas |
| 1b · conflictos en TODO el repo | ok — **0**, con 1 exclusión declarada |
| 2 · `tsc --noEmit` | ok — sin errores de tipos |
| 3 · los 27 agregados | **27 de 27 en verde** |

**135 invariantes · 5.737 afirmaciones · 977 controles positivos · 13 fuera de
ventana · 0 con falla · 19 deudas declaradas.**

### ✅ **30 pasos · 0 fallas · 19 deudas** — las mismas 19 que dejó PAPEL-2

Ninguna se cerró y **ninguna nueva**: 12 en `test:s10-acceso`, 3 en
`test:s10-logo` (las tres que PAPEL-2 abrió al destapar el verde por arnés de su
§0), 3 en `test:s8-tinta` y 1 en `test:s22-emision`. Ninguna es del producto de
este sprint.

⚠️ **Los dos landmarks que la pastilla se lleva pasan de DOS anchos del set a
CINCO** y eso NO abre una deuda nueva: `s10-acceso-landmarks` ya la contaba, y lo
que se reescribió es la banda —de «abajo de 390» a «abajo de 860»— con una
afirmación más que ata el corte al declarado. La regresión de accesibilidad
sigue siendo la misma, en más anchos, y sigue siendo temporal.

`npm run test:frontera`, que va aparte y ANTES del commit: **2 invariantes · 23
afirmaciones · 10 controles positivos · 0 con falla · 12 fuera de ventana** (las
12 necesitan el sitio vivo y se saltean sin él, que es la tercera salida que
`afirmar.ts` da).

⚠ **El `.next` que el gate leyó es el build de cierre**: se reconstruyó con
`MEDIR_CON_LA_LLAVE_PRENDIDA=1` antes de correrlo, y `c-peso.mjs` volvió a
publicar **72.146,0 B**, el mismo número del A/B del §8.

`npx prisma migrate status`: **86 migraciones, al día.**

⚠ **`npm run build` FALLA a propósito sin la llave** (`CONTENIDO_INVENTADO` +
guardián en `prebuild`). El árbol tiene cifras inventadas de B12 §4 y el guardián
existe para que no se publiquen. `MEDIR_CON_LA_LLAVE_PRENDIDA=1` es la salida
declarada para medir fuera de un deploy.

---

## 11 · LA TABLA FINAL — LOS OCHO ANCHOS, ANTES Y DESPUÉS

| ancho | columna | tope de la columna | aire arriba/abajo | sobre la ESCENA (D) | DETRÁS (E) | tinta bajo AA |
|---|---|---|---|---|---|---|
| **320** | 401,75 → **504,36** | 158,25 → **31,81** | **31,81 / 31,83** | 31,58 → 31,72 % | **0,00 → 0,00 %** | 0,00 % |
| **375** | 458,42 → **584,73** | 200,58 → **41,13** | **41,13 / 41,14** | 34,96 → 30,58 % | **0,00 → 0,00 %** | 0,00 % |
| **390** | 269,05 → 243,45 | 494,95 → 520,55 | 520,55 / 80,00 | 2,80 → **1,02 %** | 3,04 → **1,01 %** | 0,48 % |
| **425** | 271,88 → 246,28 | 492,13 → 517,72 | 517,72 / 80,00 | 4,12 → **1,13 %** | 4,05 → **1,31 %** | 0,73 % |
| **768** | 299,63 → **322,53** | 644,38 → **595,88** | 595,88 / 105,59 | 3,36 → **3,18 %** | 3,31 → **2,88 %** | 2,57 % |
| **1024** | 320,31 → **393,28** | 351,69 → **278,72** | 278,72 / 96,00 | 0,49 → 0,52 % | 0,52 → 0,56 % | 0,52 % |
| 1440 | 305,17 → **305,17** | 297,41 → **297,41** | 297,41 / 297,42 | 0,67 → 0,67 % | 0,52 → 0,53 % | 0,44 % |
| 1920 | 333,66 → **333,66** | 373,17 → **373,17** | 373,17 / 373,17 | 0,06 → 0,07 % | 0,11 → 0,11 % | 0,03 % |

⚠️ **A 320 y a 375 la columna D sigue alta y NO es una regresión**: es la
composición que sigue rota **debajo** del papel opaco. Lo que la pantalla muestra
es la columna E, y ahí hay **0,00 % en los dos**, con el contraste en **17,60:1**
— la razón tinta/papel que el sistema publica desde S0, el máximo que este
sistema puede dar. Es la misma lectura que PAPEL-2 dejó escrita.

### Los tamaños finales de cada pieza, por ancho

| ancho | palabra | isotipo (alto × ancho) | registro 1 | registro 2 | bajada | CTA |
|---|---|---|---|---|---|---|
| **320** | **28,95** | **175,19 × 251,83** | 61,06 ×2 | 55,00 | 16 ×1 | 15 |
| **375** | **28,95** | **213,42 × 306,78** | 74,39 ×2 | 67,00 | 16 ×1 | 15 |
| 390 | — | — | 37,30 ×2 | 67,52 | 16 ×1 | 15 |
| 425 | — | — | 37,99 ×2 | 68,74 | 16 ×1 | 15 |
| **768** | — | — | **67,00** ×2 | 80,65 | 16 ×1 | 15 |
| **1024** | — | — | **95,00** ×2 | 89,55 | 16 ×1 | 15 |
| 1440 | — | — | 58,00 ×1 | 104,00 | 16 ×1 | 15 |
| 1920 | — | — | 67,46 ×1 | 120,68 | 16 ×1 | 15 |

(«×2» y «×1» son los renglones que ocupa el registro 1. La marca sólo se dibuja
en los dos anchos de papel; en los otros seis está en el HTML y no ocupa.)

### Las capturas

**8 archivos**, `capturas/compo2/despues-<ancho>x<alto>.png`, recarga limpia por
ancho, `deviceScaleFactor` 1, **2,5 MiB**. Muy por debajo del tope de 50.

⚠ Las capturas salen del **dev server**, así que llevan dos cosas que no son el
sitio: la banda negra de arriba es el aviso de `CONTENIDO_INVENTADO` (la llave de
B12) y el círculo negro de abajo a la izquierda es el indicador de Next en
desarrollo, que tapa el arranque del CTA.
