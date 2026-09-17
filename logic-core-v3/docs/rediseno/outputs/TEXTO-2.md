# TEXTO-2 · EL ALCANCE DEL `col-span`, LA BAJADA EN UN RENGLÓN Y LOS DOS HUECOS

**Los tres pasos APLICADOS y medidos, antes y después, sobre el árbol.** Worktree
`C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre `4009d327`
(TEXTO-1), con los cambios de MOVIL que ya estaban sin commitear en el working
tree y que este sprint **no** tocó. **No se commiteó nada.**

**Instrumentos nuevos** (`scripts-texto/`):

| archivo | qué hace |
|---|---|
| `e-antes-despues.ts` | mide EL ÁRBOL —sin reglas encima— en los ocho anchos, con `--sims=1` para verificar una palanca antes de aplicarla |
| `f-bajada.ts` | pone cada candidata de bajada en el párrafo real y cuenta sus renglones con un `Range` |
| `g-peso.ts` | el A/B de dos builds del mismo árbol, con los cuatro archivos del hero devueltos a `HEAD` y restaurados con sha256 — §8.1 |

Y una modificación a un instrumento que ya estaba: `scripts-tapado/c-recibo.ts`
toma las etiquetas por argumento, para poder emitir el recibo de una composición
nueva **sin pisar la referencia anterior** (§8.2).

**Salidas**: seis JSON en `outputs/texto/` (`e-antes`, `e-despues`, `e-control`,
`e-control2`, `f-bajada`, `g-peso`) y dos en `outputs/tapado/`
(`a-verdad-texto2-centrado`, `a-verdad-texto2-hoy`).
**Capturas**: **32 archivos**, todas en reposo y con recarga limpia por ancho —
16 en `capturas/texto/` (`antes-*` y `despues-*`, los ocho anchos de cada lado) y
16 en `capturas/tapado/` (`texto2-centrado-*` y `texto2-hoy-*`, el recibo
re-medido).

---

## 0 · EL RESULTADO, ARRIBA DE TODO

**Tinta del titular sobre la masa negra del logo, en %. Lo medido, no lo
estimado:**

| ancho | ANTES | **DESPUÉS** | Δ |
|---|---|---|---|
| 320 × 568 | 31,6 | **46,7** | **+15,1 · EMPEORA** |
| 375 × 667 | 47,0 | **16,3** | −30,7 |
| 390 × 844 | 17,1 | **4,8** | −12,3 |
| 425 × 844 | 11,4 | **5,0** | −6,4 |
| 768 × 1024 | 41,5 | **16,3** | −25,3 |
| 1024 × 768 | 15,6 | **1,5** | −14,1 |
| 1440 × 900 | 0,7 | **0,7** | **sin cambio** |
| 1920 × 1080 | 0,1 | **0,1** | **sin cambio** |

Tres cosas, en orden de importancia:

1. **A 768 da 16,3 % y no 11,5 %, y el motivo está medido: los tres pasos
   juntos NO son la suma de sus partes.** Con las simulaciones corridas sobre el
   mismo árbol, el PASO 1 solo daría **11,8 %** y el PASO 1 más el PASO 3
   **7,0 %**. Agregarle la bajada corta baja el bloque 24 px más y la línea 2
   aterriza sobre la **segunda masa**. Es el hallazgo ① de TEXTO-1 —la
   superposición no es monótona en el corrimiento— reproducido con el árbol
   aplicado, no simulado.

2. **A 320 empeora, de 31,6 a 46,7 %, y era lo previsto.** TEXTO-1 midió esa
   misma configuración (su fila 3) y publicó **46,7**: reproducido al decimal
   por una corrida independiente. Es el único de los ocho que empeora.

3. **1440 y 1920 NO se movieron.** El apartado §5 lo prueba con un control, y no
   con una tolerancia.

---

## 1 · PASO 1 — LA MEDICIÓN SE SOSTIENE, Y LA CLASE TENÍA UN SOLO CONSUMIDOR

### 1.1 · La verificación, antes de tocar nada

`e-antes.ts --sims=1` monta la palanca como hoja `!important` sobre el árbol sin
tocar, en la misma página en la que mide el control:

| a 768 | control | `sim-caja-entera` |
|---|---|---|
| caja del titular | 364 px | **552 px** |
| renglones de la línea 1 | 2 | **1** |
| renglones de la línea 2 | 2 | **1** |
| alto del bloque | 424,34 | **287,67** |
| tinta del titular sobre el logo | 41,5 % | **11,8 %** |

TEXTO-1 §7 D1 predecía **11,5 %**; se midió **11,8**. La diferencia es del orden
de la dispersión del instrumento (§5), y todo lo demás —la caja, los dos
desenvuelvos, el alto del bloque— reproduce **exacto**. **La medición se
sostiene.**

El escalón que explica el salto ya estaba medido y se confirma: a 768 la línea 1
se pasaba del umbral por **0,17 px de cuerpo** y la línea 2 por **1,24**; esos
1,41 px costaban **136,67 px de alto**, que es justo lo que el bloque baja
(424,34 − 287,67).

### 1.2 · Qué MÁS usa esa clase — el recorrido completo

**`GEOMETRIA.claseDelTitular` tiene UN solo consumidor**: el `Bloque` del titular
en `Hero.tsx`. El literal `tablet:col-span-2`, en cambio, aparece en otros
lugares, y ninguno comparte la constante:

| dónde | qué es | se toca |
|---|---|---|
| `por-que-develop/PorQueDevelop.tsx` × 4 (`:173`, `:209`, `:211`, `:243`) | la clase escrita a mano, sobre las grillas de ESA sección | **no** |
| `trabajos/geometria.ts:102` | una MENCIÓN en prosa: «el mismo ancho que emitía `tablet:col-span-2`» | **no** |
| `s10-logo-columna.ts:143` | el par `(3, 2)` de hoy en la tabla de candidatos, en un modelo cuyas ventanas son todas **≥ 1025** | **no** |

Verificado sobre el CSS construido: `tablet:col-span-2` **se sigue emitiendo**
(`5c6f928e.css`), porque `por-que-develop` lo sigue escribiendo. El cambio no
borra ninguna regla que otra sección necesite.

### 1.3 · El cambio, y su alcance MEDIDO

```
GEOMETRIA.claseDelTitular   'tablet:col-span-2'
                          → 'tablet:col-span-3 escritorio:col-span-2'
GEOMETRIA.columnasDelTitularEnTablet  (nuevo) = 3
```

El breakpoint no se eligió: **1025 es donde ya conmutan** la medida
(`escritorio:col-span-3`), la grilla de 5 (`escritorio:grid-cols-5`) y la
coreografía. Las tres derivaciones de la caja angosta —los tres bordes seguros de
B1— están medidas a **1440, 1920 y 2560**, o sea que su alcance siempre fue
escritorio; lo que se corrigió es la etiqueta, no la decisión.

**Qué mueve, ancho por ancho:**

| ancho | caja del titular | efecto |
|---|---|---|
| 320 · 375 · 390 · 425 | sin cambio | la grilla de la caja ya colapsa a 1 columna abajo de 768: la clase nunca se aplicaba |
| **768** | 364 → **552** | los dos registros pasan de 2 renglones a 1 |
| **1024** | 535 → **808** | **cero efecto sobre la tinta (15,6 % → 15,6 %)**: los dos registros ya entraban en un renglón |
| 1440 · 1920 | sin cambio | `escritorio:col-span-2` es la clase de antes |

⚠ **A 1024 la caja queda 273 px más ancha sin que hoy se note, y hay que
decirlo**: con el copy de hoy no cambia un píxel de tinta, pero con un titular
más largo esa caja llega más a la derecha que antes. Es la única consecuencia del
cambio que **no** está cubierta por una medición de pantalla, porque hoy no se
manifiesta. Queda anotada, no arreglada.

### 1.4 · El invariante quedó MÁS fuerte, no igual

`hero.invariant.tsx` comparaba la clase con `endsWith(columnasDelTitular)`. Con
eso, **un `tablet:col-span-2` suelto pasaba** — que es exactamente el defecto que
este sprint corrigió. Ahora la comparación es la igualdad literal contra los DOS
números, con dos controles positivos: uno que ve una clase a la que le falta la
mitad de escritorio y otro que ve la clase vieja.

---

## 2 · PASO 2 — LAS DOS VARIANTES, Y EL TECHO QUE NO ERA 53

### 2.1 · Las dos, para que elija el dueño

**No las elige este sprint.** Las dos dicen las tres cosas que se venden —sitio,
chat y seguimiento— y se diferencian en qué resignan:

| | texto | car. | ancho | margen a 320 | qué conserva | qué resigna |
|---|---|---|---|---|---|---|
| **A** | `Tu sitio, tu chat y tu seguimiento.` | 35 | 228,11 px | 27,89 px | el «tu» de la voz de hoy | «un sistema» |
| **B** | `Sitio, chat y seguimiento en uno.` | 33 | 223,81 px | 32,19 px | la integración | el «tu» |

**Las dos entran en UN renglón en los ocho anchos**, medido con el párrafo real
(`f-bajada.json`). **Queda aplicada la B**, que es la más corta, para poder
medir. Cambiar a la A no necesita tocar nada más.

### 2.2 · El control del instrumento

La bajada de hoy —49 caracteres— **envuelve en dos renglones a 320, 375, 390 y
768**, que es exactamente lo que `a-desglose-hoy.json` había medido. El
instrumento reproduce el estado conocido antes de medir los candidatos.

### 2.3 · El techo real son 37 caracteres, y el de 53 era el de 1440

`contenido.ts` declaraba **53**, derivado de la caja de media medida a 1440
(354,80 px). La caja **más chica** es otra: **256 px a 320** y 270 a 768. Medido:

| ancho | caja disponible | techo |
|---|---|---|
| **320** | **256,00** | **37 car.** |
| 768 | 270,00 | 39 |
| 375 | 311,00 | 45 |
| 1440 | 354,80 | 52 |
| 1920 | 498,80 | 73 |

⚠ **El techo en caracteres no es una constante de la caja: depende de la frase.**
El avance por carácter medido sobre tres cadenas reales va de **6,52 a 6,78 px**.
Los 38 que TEXTO-1 §7 D3 publicó salen de 6,7035 —el avance de la cadena de
entonces—; con el peor de los tres el techo a 320 es **37**. `PEDIDO` declara el
37 y dice por qué.

### 2.4 · El censo, y una corrección a la instrucción

⚠️ **La bajada NO está detrás de `CONTENIDO_INVENTADO`.** El Hero no llama
`conLlave()` ni figura en `inventado.ts`: no hay una sola entrada suya en la
lista cerrada. Lo que la bajada sí es, y siempre fue, es **relleno declarado en
`PEDIDO` con clase `prosa`** — el otro mecanismo, el que produce
`CONTENIDO-PENDIENTE.md`. Son dos cosas distintas y esta sprint tocó la segunda.

La llave sigue prendida y sin tocar: `npm run build` sigue necesitando
`MEDIR_CON_LA_LLAVE_PRENDIDA=1`.

**El censo no se movió:** **46 cosas pendientes** en las ocho secciones, 33
marcadores y 13 de prosa; **Hero sigue con 2** (`bajada` y `cta.rotulo`), las dos
`prosa`. Lo único que cambió en el documento es la línea de `formato` de la
bajada. Regenerado con `npm run test:s7-pedido -- --escribir`; el invariante
cierra en **84 afirmaciones, 0 fallas**.

También hay una diferencia de conteo con la instrucción, que no cambia nada pero
conviene dejar dicha: la bajada de hoy tiene **49 caracteres**, no 48.

---

## 3 · PASO 3 — LOS DOS HUECOS, ABAJO DE 1025 Y NADA MÁS

```
flex flex-col gap-8              →  flex flex-col gap-2 escritorio:gap-8
flex flex-col items-start gap-6  →  flex flex-col items-start gap-2 escritorio:gap-6
```

Medido en el navegador, hueco por hueco, **entre cajas y no leído del `gap`**:

| ancho | ANTES (titular→bajada / bajada→CTA) | DESPUÉS |
|---|---|---|
| 320 · 375 · 390 · 425 · 768 · 1024 | 32 / 24 | **8 / 8** |
| 1440 · 1920 | 32 / 24 | **32 / 24** |

Seis de ocho cambian y dos no: el alcance es exactamente el declarado. Las cuatro
clases nuevas se emiten en el CSS de producción (`escritorio:gap-8`,
`escritorio:gap-6`, `gap-2`, `tablet:col-span-3`, `escritorio:col-span-2`),
comprobado sobre el `.css` construido.

---

## 4 · LA MEDICIÓN COMPLETA

### 4.1 · Las cuatro configuraciones, en los ocho anchos

Las dos del medio son simulaciones corridas sobre el árbol de ANTES; la última es
el árbol aplicado.

| ancho | hoy | sim: sólo PASO 1 | sim: PASO 1 + PASO 3 | **APLICADO (1+2+3)** |
|---|---|---|---|---|
| 320 | 31,6 | 31,6 | 39,6 | **46,7** |
| 375 | 47,0 | 47,0 | 49,4 | **16,3** |
| 390 | 17,1 | 17,1 | 11,5 | **4,8** |
| 425 | 11,4 | 11,4 | 5,0 | **5,0** |
| 768 | 41,5 | **11,8** | **7,0** | **16,3** |
| 1024 | 15,6 | 15,6 | 1,5 | **1,5** |
| 1440 | 0,7 | 0,7 | 0,7 | **0,7** |
| 1920 | 0,1 | 0,1 | 0,1 | **0,1** |

Dos cosas que la tabla dice y que no estaban en la instrucción:

**① Los huecos SOLOS empeoran 320 y 375.** 31,6 → 39,6 y 47,0 → 49,4. Lo que los
vuelve buenos a esos anchos es la bajada corta, no ellos: la fila B de TEXTO-1
—la que da 16,2 a 375— lleva las dos cosas. Las tres palancas interactúan y
ninguna se puede juzgar sola.

**② A 768 la mejor de las cuatro es la que NO incluye el PASO 2 (7,0 %).** La
bajada corta, que a 375 vale 33 puntos, a 768 cuesta 9. El copy es global: no se
puede tener las dos.

### 4.2 · Dónde cae la tinta: se MUDÓ de registro

| ancho | línea 1 antes → después | línea 2 antes → después |
|---|---|---|
| 320 | 6,1 → **54,0** | 58,3 → 39,0 |
| 375 | 51,1 → 28,4 | 42,8 → **3,8** |
| 390 | 24,7 → 7,0 | 9,0 → 2,5 |
| 425 | 21,6 → 7,1 | 0,8 → 2,8 |
| **768** | **80,5 → 0,4** | **0,3 → 33,1** |
| 1024 | 30,3 → 2,3 | 0,4 → 0,7 |

A 768 el cambio no es sólo de tamaño: **la línea 1 pasa de estar 80 % adentro del
logo a estar limpia**, y la línea 2 pasa de limpia a 33 %. El total baja a menos
de la mitad, pero lo que queda tapado es ahora el registro grande en itálica, no
el chico condensado. Está en `despues-768x1024.png` contra `antes-768x1024.png`.

### 4.3 · El alto del bloque contra el hueco REAL

El hueco libre es el que va **entre las dos masas** —la segunda arranca en 0,781
del alto—, no lo que sobra hasta el borde:

| ancho | hueco libre | bloque ANTES | veces | bloque DESPUÉS | veces |
|---|---|---|---|---|---|
| 320 | 57 | 377,69 | 6,63× | 313,69 | **5,50×** |
| 375 | 66 | 264,34 | 4,01× | 200,34 | **3,04×** |
| 390 | 83 | 265,22 | 3,20× | 201,22 | **2,42×** |
| 425 | 83 | 243,30 | 2,93× | 203,30 | **2,45×** |
| 768 | 100 | 424,34 | 4,24× | 223,67 | **2,24×** |
| 1024 | 73 | 278,86 | 3,82× | 238,86 | **3,27×** |
| 1440 | sin 2.ª masa | 303,58 | — | 303,58 | — |
| 1920 | sin 2.ª masa | 332,06 | — | 332,06 | — |

**El bloque sigue sin entrar en el hueco en ninguno de los seis.** Lo que cambió
es cuánto le falta: de 2,9–6,6 veces a 2,2–5,5. El objetivo de TEXTO-1 sigue
siendo inalcanzable y este sprint no lo persigue: persigue la superposición, que
es otra cosa y sí bajó.

---

## 5 · ⚠️ 1440 Y 1920 — POR QUÉ 0,02 PUNTOS NO ES UN MOVIMIENTO

La instrucción pedía frenar si se movían. **La composición es idéntica al
píxel**, y el residuo no está en el texto:

| a 1440 | ANTES | DESPUÉS |
|---|---|---|
| cuerpo de las dos líneas | 58 / 104 | 58 / 104 |
| renglones L1 / L2 / bajada | 1 / 1 / 1 | 1 / 1 / 1 |
| caja del titular | 478,39 | 478,39 |
| los dos huecos | 32 / 24 | 32 / 24 |
| alto del bloque | 303,58 | 303,58 |
| tope y fondo del bloque | 298,20 · 601,78 | 298,20 · 601,78 |
| **glifos del titular** | **20.523** | **20.523** |
| tinta sobre el logo | 0,0071 | 0,0069 |

**El titular dibuja los mismos 20.523 píxeles de tinta en la misma caja**
(27.393 a 1920, también idénticos). Si la máscara del texto es la misma y la
intersección cambia, lo que cambió es la OTRA máscara: la foto de la escena.

**El control que lo cierra: dos corridas del MISMO árbol.**

| | 1440 | 1920 |
|---|---|---|
| antes | 0,0071 | 0,0005 |
| después | 0,0069 | 0,0006 |
| **control (mismo árbol que «después»)** | **0,0068** | **0,0007** |

A 1920 el control se aleja de «después» **más** de lo que se aleja «antes». La
dispersión del instrumento entre corridas es de ±0,0001–0,0002 y el delta
antes→después cae adentro. **1440 y 1920 no se movieron.**

(El único número que sí cambia a esos anchos es `bloque.glifos`: 22.582 → 22.310
a 1440. Son los 272 glifos que la bajada perdió al pasar de 49 a 33 caracteres, y
es la comprobación de que el PASO 2 —el único global de los tres— llegó también
ahí.)

---

## 6 · 320, CON SU NÚMERO

**31,6 % → 46,7 %.** Es el único de los ocho que empeora, y no es una sorpresa:
TEXTO-1 barrió 16 configuraciones a ese ancho y publicó que **la de hoy es la
mejor de las 16**; la que este sprint aplica es su fila 3, que allá midió
**46,7 %** — reproducido al decimal por una corrida independiente.

La causa está medida y es estructural: a 320 el bloque ocupa el 66 % del viewport
contra una masa de logo del 37 %, así que **no existe ninguna posición en la que
no se toquen** (`s10-logo-composicion.ts`). Bajar el bloque 64 px mete la línea 1
adentro del logo: pasa de 6,1 % a 54,0 %.

**No se compensó acá.** Cualquier salida a 320 —un corte de titular propio, otra
escala, mover la masa— es escena o tipografía, y las dos están fuera del alcance
de este sprint por escrito.

---

## 7 · FUERA DEL ALCANCE, ANOTADO Y NO TOCADO

**D6 · A 768 la mejor configuración medida no incluye el PASO 2 (7,0 % contra los
16,3 aplicados).** Es un conflicto real entre anchos, no un error: el copy es uno
solo y a 375 la bajada corta vale 33 puntos. Si el dueño quisiera priorizar 768,
la salida no es el copy: es la línea 2, que es la que aterriza en la segunda masa.

**D7 · La caja del titular a 1024 quedó en 808 px sin efecto medible.** §1.3.

**D8 · La bajada sigue en media medida desde `tablet` (`D2` de TEXTO-1).** Con 33
caracteres entra en un renglón igual, así que el defecto dejó de manifestarse —
pero la caja sigue siendo de 270 px a 768 y volvería a partir un copy de 40
caracteres. No se tocó: es la misma clase de cambio de layout que el PASO 1, y no
estaba pedido.

**D9 · El margen del titular a 1440 sigue publicado en 3,55 px y el medido es
4,70** (`D5` de TEXTO-1). Sin cambios.

---

## 8 · ⚠️ LO QUE EL GATE ROMPIÓ, Y QUE NO ESTABA EN LA INSTRUCCIÓN

La primera corrida del gate dio **2 pasos con falla**. Las dos son consecuencias
reales del cambio, las dos están cerradas, y las dos enseñan algo.

### 8.1 · `s5-peso` — el lane se pasó por 1,2 BYTES

El techo de peso estaba a **38,8 B de aire** y este sprint toca producto:
`s5-peso` quedó en **−1,2 B**. Es exactamente lo que B10 dejó anotado —«el
próximo sprint que agregue producto choca»— y lo que la regla de
`MONTAJE_DE_TAPADO_KIB` obliga a hacer: *un sprint que toca producto declara su
línea en el mismo acto*.

**Medido** (`scripts-texto/g-peso.ts`, el A/B de `scripts-peso/a-atribuir.ts` con
cuatro archivos): dos builds de producción del MISMO árbol en la MISMA máquina,
con los cuatro archivos del hero devueltos a `HEAD` por `git show` y restaurados
desde copias FUERA del árbol, con los cuatro sha256 verificados (los cuatro
dieron IDÉNTICO).

| | bytes del lane | aire |
|---|---|---|
| antes (`HEAD`) | 66.050,2 | +38,8 B |
| después | 66.090,2 | −1,2 B |
| **TEXTO-2 monta** | **40,0 B** | |

**La línea: `MONTAJE_DE_TEXTO2_KIB = 0,05`.** Al centésimo de arriba —0,04, la
convención— quedan **0,96 B de aire**, 7,04 B debajo del umbral de 8; la regla
del aire útil que la parada de PAPEL-1 escribió manda al siguiente: **0,05, con
11,2 B**, el orden de B11 (8,6), B12 (8,2), el titular (10,8) y MOVIL-1 (10,0).
**El techo de 60 no se movió** y la línea es revocable sola.

⚠️ **El control que nadie pidió y que cierra la cadena:** el «antes» de este A/B
da 66.050,2 B, que es **exactamente** el «después» del A/B de TAPADO-1, al décimo
de byte. Y el aire cierra igual: TAPADO-1 leía −2,2 B y la parada de PAPEL-1 le
sumó 40,96 B de techo → 38,76. Las dos cuentas dicen lo mismo: **entre TAPADO-1 y
TEXTO-2 ningún sprint agregó un byte de producto.**

⚠️ **Una trampa del método, aprendida fallando:** el swap tiene que dejar el árbol
**compilable**, no sólo el bundle comparable. La primera corrida dejó
`hero.invariant.tsx` afuera —no viaja en ningún chunk— y el build del «antes»
falló a los tres minutos, porque el invariante nuevo referencia
`columnasDelTitularEnTablet`, que en `HEAD` no existe.

🛑 **La línea la aprueba la parada, no este sprint.** Está escrita porque la regla
del repo pide declararla en el mismo acto; si el dueño la rechaza se borran las
dos puntas juntas y el gate vuelve a ponerse rojo por los 40 B, que es lo
correcto.

### 8.2 · `s10-logo` — el recibo del navegador se quedó viejo

`s10-logo-composicion.ts` contrasta un modelo derivado contra un recibo del
navegador guardado. Cambiar la composición abrió el desvío **exactamente como ese
archivo decía que se iba a abrir**: de una constante de 23 px pasó a **87 · 87 ·
87 · 63 · 63**, con la dispersión en 24 px.

**Y estaba enteramente atribuido antes de re-medir: 87 = 23 + 64 y 63 = 23 + 40**,
donde 64 y 40 son lo que el bloque se acortó en cada grupo de anchos (los dos
huecos valen 40 px en los cinco; la bajada que deja de envolver, 24 más en tres
de ellos). El término de 23 px —el alto del CTA que el modelo no ve— nunca se
movió.

Re-medido con `a-verdad.ts` en las dos composiciones y emitido por `c-recibo.ts`,
**el desvío vuelve a 23,0 px con una dispersión de 0,1 px** — la más ajustada que
tuvo (venía de 2,0).

⚠️ **`a-verdad-hoy.json` NO se pisó, y es una decisión con costo.** Las etiquetas
nuevas son `texto2-centrado` y `texto2-hoy`. El motivo: de `a-verdad-hoy.json`
salen también las bandas de masa del logo de TEXTO-1 §4 y de §4.3 de este
informe, y esas bandas se miden **dentro de la columna del bloque de texto**, que
esta composición ensancha a 768 y a 1024 — re-medir encima habría movido en
silencio la tabla de dos informes ya escritos. **El costo: `a-verdad-hoy.json`
describe el árbol de TAPADO-1 y no el de hoy.** Re-basar esa etiqueta es una
decisión del dueño y queda reportada acá.

### 8.3 · 🔴 Y una divergencia nueva: a 320 el modelo se equivoca de SIGNO

El recibo nuevo mide, a 320: **centrado 40,2 % → hoy 46,6 %** (sube). El modelo
derivado dice **37,1 % → 33,2 %** (baja). No difieren en magnitud: difieren en el
signo, y un modelo que se equivoca de signo no se puede promediar con nada.

Las dos afirmaciones sobre la composición —«bajan cinco de los seis» y «el sexto
es 320»— **pasaron de alimentarse del modelo a alimentarse del recibo**. El
enunciado no cambió y sobre el píxel sigue siendo cierto: 5 de 6 bajan y el sexto
es 320. Lo que cambió es de dónde sale el dato. La divergencia del modelo queda
**declarada y no afirmada**, igual que la de 768, que es la otra.

### 8.4 · El gate, cerrado

`MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build` (exit 0) · `npx prisma migrate
status` (86 migraciones, al día) · `npm run verificar`.

⚠ El build con `.next` borrado murió por memoria (heap OOM de V8) y salió con
`NODE_OPTIONS=--max-old-space-size=6144`, que es el mismo orden que `netlify.toml`
declara para el deploy (4096). Queda anotado: en esta máquina un build en frío no
entra con el heap por defecto.

| paso | resultado |
|---|---|
| 1 · `package.json` | ok — sin marcadores, JSON válido, cero claves duplicadas |
| 1b · conflictos en todo el repo | ok — ningún merge sin resolver |
| 2 · `tsc --noEmit` | ok — sin errores de tipos (56,7 s) |
| 3 · los 27 agregados | **27 de 27 en verde** |

**135 invariantes · 5.550 afirmaciones · 947 controles positivos · 13 fuera de
ventana · 0 con falla · 16 deudas declaradas.**

**30 pasos · 0 fallas · 16 deudas**, que es lo que el sprint pedía.

Las 16 deudas, con dueño: **12** en `test:s10-acceso`, **3** en `test:s8-tinta`,
**1** en `test:s22-emision`. Son las mismas que el repo ya declaraba; este sprint
no agregó ninguna y no cerró ninguna.

Contra la corrida de TEXTO-1 el agregado creció **5 afirmaciones y 2 controles
positivos**, y las dos puntas se pueden señalar: `test:s5-peso` pasó de **29
afirmaciones y 4 controles a 32 y 5** (las tres de la línea nueva) y
`test:s5-hero` absorbió las otras dos en el chequeo de la clase del titular.
`test:s10-logo` queda en las mismas 51 y 14: ahí no se agregó nada, se cambió de
dónde sale el dato.

⚠ **Este gate NO incluye `npm run test:frontera`**, que compara el árbol contra
`HEAD` y va ANTES del commit. Lo recuerda el propio gate al pie. Se corrió
aparte, que es su momento: **2 invariantes · 23 afirmaciones · 10 controles
positivos · 12 fuera de ventana · 0 con falla.**

---

## 9 · LOS ARCHIVOS

**Producto** (3):

- `src/app/v3/_secciones/hero/geometria.ts` — el alcance del `col-span` y el número nuevo
- `src/app/v3/_secciones/hero/Hero.tsx` — los dos huecos
- `src/app/v3/_secciones/hero/contenido.ts` — la bajada y su `formato`

**Invariantes y presupuesto** (5):

- `src/app/v3/_secciones/hero/hero.invariant.tsx` — la comparación de la clase, más fuerte
- `src/app/v3/_lib/__tests__/s5-presupuesto.ts` — `MONTAJE_DE_TEXTO2_KIB` y su suma
- `src/app/v3/_lib/__tests__/s5-peso.invariant.ts` — las tres afirmaciones de la línea nueva
- `src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-texto2.ts` — **nuevo**, el recibo de los 40 B
- `src/app/v3/_lib/escena/__tests__/s10-logo-composicion.ts` — el recibo re-medido y las dos afirmaciones re-ancladas

**Instrumentos**: `scripts-texto/e-antes-despues.ts`, `f-bajada.ts`, `g-peso.ts`
(nuevos) y `scripts-tapado/c-recibo.ts` (las etiquetas por argumento).

**Generado** (1): `docs/rediseno/CONTENIDO-PENDIENTE.md`

**Salidas**: seis JSON en `outputs/texto/` y dos en `outputs/tapado/`.
**Capturas**: 16 en `capturas/texto/` (`antes-*` y `despues-*`) y 16 en
`capturas/tapado/` (`texto2-centrado-*` y `texto2-hoy-*`). **32 en total.**

**No se tocó**: la escena, la cámara, `frameX`, la distancia, el anclaje, ninguna
superficie, los tamaños de tipografía, los pisos de las curvas fluidas, `pb-20`,
las otras siete secciones, `HeroArtifact.tsx` y `TransitionContext.tsx`. Y **no se
commiteó nada.**

---

## 10 · PARA COMMITEAR

⚠️ **Este sprint NO commitea.** Los `git add` van archivo por archivo —nunca
`git add .`— porque el working tree lleva además los cambios de MOVIL que este
sprint no tocó.

```bash
git add logic-core-v3/src/app/v3/_secciones/hero/Hero.tsx
git add logic-core-v3/src/app/v3/_secciones/hero/geometria.ts
git add logic-core-v3/src/app/v3/_secciones/hero/contenido.ts
git add logic-core-v3/src/app/v3/_secciones/hero/hero.invariant.tsx
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-peso.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-texto2.ts
git add logic-core-v3/src/app/v3/_lib/escena/__tests__/s10-logo-composicion.ts
git add logic-core-v3/scripts-tapado/c-recibo.ts
git add logic-core-v3/scripts-texto/e-antes-despues.ts
git add logic-core-v3/scripts-texto/f-bajada.ts
git add logic-core-v3/scripts-texto/g-peso.ts
git add logic-core-v3/docs/rediseno/CONTENIDO-PENDIENTE.md
git add logic-core-v3/docs/rediseno/outputs/TEXTO-2.md
git add logic-core-v3/docs/rediseno/outputs/texto/e-antes.json
git add logic-core-v3/docs/rediseno/outputs/texto/e-despues.json
git add logic-core-v3/docs/rediseno/outputs/texto/e-control.json
git add logic-core-v3/docs/rediseno/outputs/texto/e-control2.json
git add logic-core-v3/docs/rediseno/outputs/texto/f-bajada.json
git add logic-core-v3/docs/rediseno/outputs/texto/g-peso.json
git add logic-core-v3/docs/rediseno/outputs/tapado/a-verdad-texto2-centrado.json
git add logic-core-v3/docs/rediseno/outputs/tapado/a-verdad-texto2-hoy.json
git add logic-core-v3/docs/rediseno/capturas/texto/antes-320x568.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-375x667.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-390x844.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-425x844.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/texto/antes-1920x1080.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-320x568.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-375x667.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-390x844.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-425x844.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/texto/despues-1920x1080.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-320x568.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-375x667.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-390x844.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-425x844.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-centrado-1920x1080.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-320x568.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-375x667.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-390x844.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-425x844.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/tapado/texto2-hoy-1920x1080.png
```

Mensaje propuesto, sin acentos:

```
TEXTO-2: el col-span acotado a escritorio, la bajada en un renglon y los huecos a 8
```
