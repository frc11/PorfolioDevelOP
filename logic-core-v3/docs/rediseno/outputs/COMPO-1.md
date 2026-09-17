# COMPO-1 · DIEZ AJUSTES DE COMPOSICIÓN DEL HERO

**Los diez puntos, aplicados y medidos.** Worktree `C:\rediseno-home\logic-core-v3`,
rama `rediseno/home`, sobre el árbol de **TEXTO-3** —que sigue sin commitear, y
arriba de MOVIL-1 y TEXTO-2, que tampoco—. **No se commiteó nada.**

**Instrumentos nuevos**: `scripts-compo/` — `a-composicion.ts` (las piezas con sus
**dos** bordes izquierdos y el aire hasta la pastilla), `b-ajuste.ts` (el avance en
`em` de cada cadena medido en el navegador, y el techo de tamaño que sale de
dividir la caja por él) y `c-peso.ts` (el A/B de peso).
**Instrumento reusado**: `scripts-texto/e-antes-despues.ts`, con las dos máscaras
de TEXTO-3.

**Salidas**: `outputs/compo/a-composicion-{antes,despues}.json`,
`outputs/compo/b-ajuste-hoy.json`, `outputs/compo/c-peso.json` y
`outputs/texto/e-compo1.json`.
**Capturas**: `capturas/compo/{antes,despues}-*.png` — **16 archivos**, los ocho
anchos en reposo y con recarga limpia por ancho, antes y después.

---

## 0 · LO QUE HAY QUE LEER PRIMERO

### 🔴 A 375 LA COMPOSICIÓN EMPEORA DE 16,2 % A 40,6 %, Y NO ES ARREGLABLE ACÁ

Los puntos 1 y 2 agregan filas. El bloque del Hero **está apoyado abajo**, así que
cada fila nueva **sube el tope del bloque**. A 375×667 —el viewport **más corto**
del set— las dos filas nuevas aterrizan adentro de la masa negra del logo:

| | antes | después |
|---|---|---|
| alto del bloque | 200,34 px | **267,86 px** |
| tope del bloque | 386,66 | **319,14** |
| la masa del logo termina en la fila | 454 | 454 |
| tinta del titular sobre la masa | 16,22 % | **40,59 %** |
| tinta del titular **bajo AA** | 16,12 % | **40,43 %** |

**Cuánto falta, con el número:** para que el tope caiga debajo de la masa el
bloque tendría que medir **133 px**; mide 267,86. Faltan **134,86 px** — o, dicho
al revés, el bloque tendría que bajar 134,86 px y abajo hay **8**.

**Ninguna de las palancas que lo cerrarían está en este sprint**: la escena, la
cámara y el anclaje están prohibidos; meter una superficie lo prohíbe el §7; y
`pb-20` no se toca por el §8 (y aunque se tocara, son 8 px). Queda para la parada,
con las dos salidas escritas en §7 de este informe.

⚠ **La capa tapada de 320 NO es esto.** Ahí la cifra «sobre la escena» sigue
publicando 43,76 % porque el problema está debajo del papel opaco de TEXTO-3;
**detrás del texto hay 0,00 %**, que es lo que la pantalla muestra. Las dos se
publican, como pide la instrucción.

### ✅ Y LO QUE SÍ CERRÓ

| ancho | tinta sobre la masa: antes → después |
|---|---|
| **768** | 16,26 % → **3,34 %** |
| 1024 | 1,41 % → **0,52 %** |
| 390 | 4,86 % → **2,71 %** |
| 425 | 5,06 % → **4,32 %** |
| 320 (sobre la escena, debajo del papel) | 46,65 % → 43,76 % |
| 1440 · 1920 | 0,69 → **0,69** · 0,05 → **0,05** — intactos |

**768 es el mayor cierre del sprint**, y no salió de la tipografía: salió de
descubrir que la columna lateral del Hero **está vacía** y reservaba 152 px de
nada a la izquierda del texto (§5).

### 🔴 UN MOVIMIENTO A 1440 Y 1920 QUE HAY QUE APROBAR O REVOCAR

El §10 dice que esos dos anchos **sólo pueden moverse por el §3**. Se movieron por
dos cosas:

1. **Por el §3**, como corresponde: la bajada pasa de 15 a 16 px, el bloque crece
   1,59 px y, centrado, su tope sube 0,79. Medido: 298,20 → 297,41 a 1440 y
   373,97 → 373,17 a 1920.
2. **Por el §4**, y esto es lo que hay que decidir: el CTA se corre 8 px a la
   izquierda **en los ocho anchos**, porque el §4 pide medir y alinear «en los
   ocho anchos» y la desalineación es la misma en los ocho. A 1440 su tinta pasa
   de x 196 a x 188, que es donde arranca el resto de la columna.

**Los dos puntos se contradicen y no lo resolví por mi cuenta: lo aplico y lo
reporto.** Revocar sólo la mitad de escritorio es una variante —
`escritorio:ml-0` al lado del `-ml-2`— y deja el CTA desalineado a 1440 y 1920,
que es lo que el dueño vio.

---

## 1 · §1 — EL TITULAR EN TRES RENGLONES ABAJO DE 1025

### 1.1 · ⚠️ LA PREMISA DE LA INSTRUCCIÓN ES FALSA EN SUS DOS MITADES

> *«🔴 «LAS 24 HS» entra entero en un renglón en TODOS los anchos de 320 a 1024.
> Ése es el requisito duro… Hoy su piso es 67 px a 375 y ahí envuelve en dos:
> tiene que bajar.»*

**A 375 no envuelve.** Medido en el navegador con la cara, el peso, el estilo y el
interletrado con los que se pinta (`b-ajuste-hoy.json`): «LAS 24 HS» mide
**306,79 px** a 67 px en una caja de **311,00** — entra con **4,21 px**. El ancho
donde 67 px empieza a entrar es **371,13** (`caja = ancho − 64`), así que el tramo
que falla es **320–371**, y en el set de ocho el único que cae adentro es 320.

**Y a 320, que es donde sí envuelve, EL PISO NO ES EL QUE MANDA.** El término
preferido del `clamp()` vale ahí

```
3,3732rem + 3,4742vw  →  53,9712 + 3,4742 × 3,20 = 65,09 px
```

o sea **por debajo** del piso de 67 — por eso el piso gobierna. Bajar el piso a 55
devolvería **65,09 px**, que siguen sin entrar en los 256 px de caja: el techo
que la caja admite es **55,85**. **Ningún valor del piso arregla 320.** Mover la
recta sí lo arreglaría, y mover la recta es mover el ancla de 375 o la de 1440:
las dos fuera de este sprint.

### 1.2 · EL TAMAÑO, DERIVADO

`--text-display-xl-angosto: 55px`, acotado con `max-angosto:` — el breakpoint que
TEXTO-3 ya había declarado, y del que éste es el **segundo consumidor**.

```
caja del titular a 320   256,00 px   (320 − 2 × 32; la grilla ya colapsó)
avance de «LAS 24 HS»    4,58406 em  (navegador)  ·  4,57900 em (el .woff2 itálico)

55 × 4,58406 = 252,12 px   →  entra, con 3,88 px      (251,84 y 4,16 con el binario)
56 × 4,58406 = 256,71 px   →  se pasa                 (256,42, se pasa igual)
```

Los 4,58406 em reproducen los **4,58409** con los que se derivó el 104 del nivel
—desvío 3 × 10⁻⁵ em—, que es la comprobación de que las dos cuentas hablan de la
misma cadena con la misma cara. `hero.invariant` §14a vuelve a correr las tres
cuentas **contra el binario itálico**, que ningún medidor del repo abría: el
propio `s10-avance.ts` lo declaraba como límite y dejaba la ruta escrita.

### 1.3 · EL RESULTADO, MEDIDO

| ancho | fila 1 + fila 2 (registro 1) | fila 3 (registro 2) | ¿entra en UN renglón? |
|---|---|---|---|
| 320 | 2 × 37,00 px | **55,00 px** | ✅ 251,8 en 256,0 |
| 375 | 2 × 37,00 | 67,00 | ✅ 306,8 en 311,0 |
| 390 | 2 × 37,30 | 67,52 | ✅ 309,2 en 326,0 |
| 425 | 2 × 37,99 | 68,74 | ✅ 314,7 en 361,0 |
| 768 | 2 × 44,75 | 80,65 | ✅ 369,3 en 704,0 |
| 1024 | 2 × 49,80 | 89,55 | ✅ 410,0 en 960,0 |
| **1440** | **1 × 58,00** | **104,00** | dos renglones, **sin tocar** |
| **1920** | **1 × 67,46** | **120,68** | dos renglones, **sin tocar** |

**El quiebre no inventa un corte: lo declara donde ya caía.** A 320 «TU NEGOCIO
VENDIENDO» mide **302,2 px** en una caja de 256 —no entraba— y las dos mitades
miden **152,7** y **145,7**. Lo que cambia es que ahora corta **siempre en el mismo lugar** en
vez de cortar sólo donde no entra: hasta hoy el titular tenía una forma a 320 y
otra a 375.

**El mecanismo** es un envoltorio que conmuta —`flex flex-col items-start
escritorio:block`— y no un `<br>` apagado con `display:none`: así el corte queda
escrito en el CONTENIDO y en la geometría, y no escondido detrás de una utilidad
de visibilidad. Arriba de 1025 el envoltorio vuelve a ser `block`, las dos filas
salen inline con el espacio que el marcado deja en medio, y el renglón es
**exactamente** el que el dueño aprobó.

---

## 2 · §2 — LA BAJADA EN DOS RENGLONES ABAJO DE 1025

Mismo mecanismo, mismo envoltorio. **Y una cosa que hay que decir: el corte NO es
una necesidad de medida.** La frase entera entra en UN renglón en los ocho anchos
aun al tamaño nuevo: 15,20727 em × 16 px = **243,32 px** contra una caja de 256 a
320, el peor caso. Es una decisión de composición del dueño y está escrita como tal
en `contenido.ts`.

| ancho | renglones antes | después | tamaño |
|---|---|---|---|
| 320 · 375 · 390 · 425 · 768 · 1024 | 1 | **2** | 15 → **16 px** |
| 1440 · 1920 | 1 | **1** | 15 → **16 px** |

**El presupuesto de caracteres se volvió a derivar**, porque ya no es el de la
frase entera sino el de cada fila sola en la caja más chica: con el avance PEOR de
las dos filas puestas —7,44 px por carácter a 16 px— el techo en 256 px son **34
caracteres por fila** (34 × 7,44 = 252,98; con 35 se pasa). `PEDIDO` pasó de dos
entradas a tres y `CONTENIDO-PENDIENTE.md` se regeneró: **47 pendientes**, Hero
con **3**. El texto pendiente es el mismo; lo que se agregó es dónde corta.

---

## 3 · §3 — LA BAJADA MÁS GRANDE EN ESCRITORIO

**Hay un escalón y se tomó: `cuerpo` (15 px) → `base` (16 px).** Es el
inmediatamente superior en la escala de tokens y el único que hay entre los dos.

⚠️ **Y hay que decir lo que compra: +1 px, +6,7 %.** El propio
`_lib/tipografia.ts` §B7 declara que a estos cuerpos *«una diferencia de un píxel
no la ve nadie»*, así que este cambio está **en el borde de lo perceptible**.

**La alternativa, con su número, para la parada:** el escalón siguiente es
`titulo-s`, que a 1440 vale **20,00 px** y a 1920 **21,35** — un **+33 %** y un
**+42 %**. Eso no es «un poco más grande»: es otro registro, y además trae el
interlineado de TÍTULO (1,09) donde un párrafo quiere el de texto (1,6). **No
inventé un valor intermedio**: un token nuevo por una preferencia estética es
exactamente lo que la puerta de control de cambios del tema existe para frenar.

Lo que costó en geometría: el bloque crece **1,59 px** a 1440 y **1,60** a 1920,
que es la caja de línea pasando de 24 a 25,6 px. Es el único movimiento
autorizado en esos dos anchos.

---

## 4 · §4 — EL CTA ALINEADO: LAS CAJAS SÍ, LA TINTA NO

**Se midió antes de moverlo, y la respuesta es «las dos cosas».** Los dos bordes,
en los ocho anchos: el de la CAJA con `getBoundingClientRect`, el de la TINTA
leyendo la primera columna de píxeles dibujados sobre la captura del texto sin
escena.

### 4.1 · ANTES

| ancho | titular fila 1 | fila 3 (itálica) | bajada | CTA | dispersión de las **cajas** |
|---|---|---|---|---|---|
| 320 | 33 | 36 | 32 | **40** | **0** |
| 375 | 33 | 36 | 32 | **40** | **0** |
| 390 | 33 | 36 | 32 | **40** | **0** |
| 425 | 33 | 36 | 32 | **40** | **0** |
| 768 | 185 | 189 | 184 | **192** | **0** |
| 1024 | 185 | 189 | 184 | **192** | **0** |
| 1440 | 189 | 194 | 188 | **196** | **0** |
| 1920 | 189 | 195 | 188 | **196** | **0** |

**Las cuatro cajas arrancan en el MISMO x al píxel en los ocho anchos.** Lo que no
coincide es la tinta, y **las dos causas se separan solas**:

| pieza | sangría de la tinta | ¿se mueve con el tamaño? | qué es |
|---|---|---|---|
| titular fila 1 | **+1** | sí (1 a 320 · 1 a 1920, con el cuerpo de 37 a 67) | banda del glifo |
| titular fila 3 | **+4 → +7** | **sí** (4 a 320 · 7 a 1920, con el cuerpo de 55 a 121) | banda del glifo (itálica) |
| bajada | 0 | — | — |
| **CTA** | **+8** | **NO: 8 exactos en los ocho** | `padding: var(--spacing-2)` de `cta.css` |

### 4.2 · QUÉ SE MOVIÓ Y QUÉ NO

**Se corrigió UNA: la del CTA**, con `-ml-2` —el MISMO token en negativo—. Es
layout, no óptica: el número no se mueve un décimo entre 320 y 1920 mientras el
tamaño del rótulo tampoco, y vale exactamente el escalón que el componente declara.
`hero.invariant` §14c lee los dos de `_estilos/cta.css` y afirma que son el mismo,
así que si alguien cambia el relleno del componente esto se pone en rojo.

**Las otras dos se reportan y NO se tocan.** Escalan con el cuerpo, o sea que son
la banda lateral del glifo: compensarlas es compensación óptica, y la instrucción
la declara otra decisión.

### 4.3 · DESPUÉS

| ancho | fila 1 | fila 3 | bajada | CTA | dispersión de la **tinta** |
|---|---|---|---|---|---|
| 320 | 33 | 35 | 32 | **32** | 8 → **3** |
| 375 · 390 · 425 | 33 | 36 | 32 | **32** | 8 → **4** |
| 768 · 1024 | 33 | 37 | 32 | **32** | 8 → **5** |
| 1440 | 189 | 194 | 188 | **188** | 8 → **6** |
| 1920 | 189 | 195 | 188 | **188** | 8 → **7** |

**La tinta del CTA arranca ahora en el mismo x que la de la bajada.** Lo que queda
de dispersión son las dos bandas de glifo, enteras y sin tocar.

⚠ **La caja del CTA queda 8 px a la IZQUIERDA de las otras tres** (x 24 contra 32),
que es el precio de que la tinta coincida. El anillo de foco y el área de toque
viajan con ella y siguen envolviendo el mismo relleno.

⚠ **Yo puedo decir que «el CTA arranca en x 32 y la bajada en x 32». Que quedó
alineado lo juzga el humano.**

---

## 5 · §5 — TABLET (768): TEXTO A LA IZQUIERDA

### 5.1 · 🔴 EL LOGO NO SE PUEDE MOVER POR LA GRILLA, Y LA RAZÓN ES DE ARQUITECTURA

La instrucción pedía moverlo *«por la grilla, por el reparto de columnas»* si se
podía. **No se puede.** El logo es un objeto de la escena 3D: lo dibuja un
`<canvas>` que el layout monta `fixed inset-0`, o sea que **su caja es el viewport
entero** y ninguna columna de ninguna grilla lo alcanza. Dónde cae en pantalla lo
deciden la cámara y `frameX`, y las dos están prohibidas. **Así que se movió sólo
el texto**, como la instrucción indica para ese caso.

### 5.2 · LO QUE SÍ ERA: 152 PX DE NADA

`Grilla columnas="lateral"` reserva 140 px fijos más su canaleta **desde 768**. En
el Hero **esa celda está vacía** —es un `<div>` que sólo reserva—, así que a 768 y
a 1024 el texto arrancaba en **x 184** mientras el logo está centrado y es más
ancho que el cuadro. En los cuatro anchos de abajo de 768 la grilla ya colapsaba
sola y el texto arrancaba en x 32.

El cambio corre ese colapso de 768 a **1025**: la columna lateral pasa a existir
sólo donde existe la grilla de 5, que es donde tiene un rótulo al lado que
sostener.

| ancho | borde de la caja | caja del titular | tinta sobre la masa |
|---|---|---|---|
| 768 | 184 → **32** | 552 → **704** | 16,26 % → **3,34 %** |
| 1024 | 184 → **32** | 808 → **960** | 1,41 % → **0,52 %** |

⚠ **El cambio alcanza a 1024 y no sólo a 768, y se declara.** El mecanismo es el
breakpoint `escritorio`, que es el corte donde la grilla de 5 aparece; acotarlo a
768 solo habría necesitado inventar otro corte. A 1024 el movimiento es una
mejora medida —de 1,41 % a 0,52 %— y es lo que hace **afordable** el §6: sin él,
subir el bloque a 1024 lo habría metido adentro de la masa.

---

## 6 · §6 — PORTÁTIL (1024): TODO MÁS ARRIBA

### 6.1 · LA DISTANCIA PEDIDA, EN LOS OCHO ANCHOS

Del borde de abajo del CTA al borde de arriba de la pastilla. Se publican las dos
lecturas: **caja contra caja** (lo que el layout reserva) y **tinta contra caja**
(lo que el ojo ve; el CTA lleva 8 px de relleno abajo).

| ancho | antes (caja / tinta) | después (caja / tinta) |
|---|---|---|
| 320 | 8 / 17 | 8 / 17 |
| 375 | 8 / 17 | 8 / 17 |
| 390 | 8 / 17 | 8 / 17 |
| 425 | 8 / 17 | 8 / 17 |
| 768 | 8 / 17 | 8 / 17 |
| **1024** | **8 / 17** | **24 / 33** |
| 1440 | 226,22 / 235 | 225,42 / 234 |
| 1920 | 301,97 / 311 | 301,17 / 310 |

**Los 8 px no eran una decisión de nadie**: son el sobrante de `pb-20` (80) menos
los `DESCUENTO_NACIMIENTO_PX` (72) que la pastilla ocupa. Y valían 8 en **los seis
anchos** donde el bloque se apoya abajo, no sólo a 1024.

**Los 24 px sí son una derivación**: la pastilla se separa del borde de abajo
`--spacing-6` (24 px) y se apoya arriba a `--spacing-6` cuando llega a reposo —es
la simetría que `navegacion.ts` declara—. Ese token ES «cuánto aire quiere la
pastilla»; el bloque se le acerca por el otro lado y le deja lo mismo. Lo que
faltaba son `24 − 8 = 16` = **`--spacing-4`**, y ése es el valor de la clase.

⚠ **`pb-20` NO se tocó**, como pide el §8: el aire se agrega por afuera, como
margen del contenido, así que la reserva del pie queda intacta y `soporte.ts` §9
sigue afirmándola contra `DESCUENTO_NACIMIENTO_PX`.

### 6.2 · «MOVER LA ESCENA» NO ES MOVER LA CÁMARA — pero tampoco se podía

La escena no se movió: no hay forma de subirla que no sea la cámara o `frameX`.
**Subió sólo el bloque de texto, y subió mucho más de lo que este punto pedía**,
porque los §1, §2 y §3 lo hicieron crecer:

| | antes | después |
|---|---|---|
| alto del bloque a 1024 | 238,86 px | **320,31 px** |
| tope del bloque | 449,14 | **351,69** |

**97,45 px de subida**, de los cuales 16 son de este punto y 81 del crecimiento.

### 6.3 · 🔴 LA TRAMPA QUE ESTO TRAJO, Y CÓMO SE CAZÓ

La primera versión escribió `medio:mb-4` creyendo que acotaba la banda 860–1024.
**No la acota: una variante de ancho de Tailwind es `min-width` y no se apaga
sola.** El margen llegaba a 1440 y a 1920, donde el bloque va CENTRADO, y un
margen abajo corre un bloque centrado la **mitad** para arriba. Medido:

| ancho | antes del sprint | con `medio:mb-4` solo | con el par |
|---|---|---|---|
| 1440 | 298,20 | **289,41** | 297,41 |
| 1920 | 373,97 | **365,17** | 373,17 |

**8,8 px de movimiento en los dos anchos que el §10 congela**, y la medición lo
encontró: el modelo de cajas no lo habría visto. La clase quedó escrita como par
—`medio:mb-4 escritorio:mb-0`— y el invariante afirma las dos mitades juntas.

---

## 7 · §7 — 425: EL ROCE QUE QUEDA

**Medido después de aplicar §1 y §2, como pide la instrucción:**

| | antes | después |
|---|---|---|
| tinta sobre la masa (escena sola) | 5,06 % | **4,32 %** |
| tinta sobre la masa (detrás del texto) | 4,86 % | **4,14 %** |
| tinta bajo AA | 4,17 % | **4,11 %** |

**No se resolvió solo, pero tampoco empeoró: bajó de 5,1 a 4,3 %.** La razón de
que baje aunque el bloque suba 68,6 px es que las dos filas nuevas del registro 1
son **angostas** —156,8 y 149,6 px contra los 310,2 del renglón único de antes— y
no alcanzan la cola del logo, que es lo único que queda a esa altura.

**Cuánto falta, con el número:** el bloque se apoya en la fila 764 y la masa del
logo termina en la **575**. Para que el titular no la toque, el bloque tendría que
medir **189 px**; mide **271,88**. Faltan **82,88 px**.

**No metí ninguna superficie por mi cuenta.** Las dos salidas, para la parada:

1. **Bajar el bloque 82,9 px** — imposible: abajo hay 8 px antes de la pastilla y
   `pb-20` está congelado por el §8.
2. **Achicar el bloque 82,9 px** — se puede estimar: sacar la fila 2 del titular
   devuelve 41,4 px y volver la bajada a un renglón devuelve 25,6. Suman 67,0, o
   sea **deshacer los §1 y §2 no alcanza**: con los dos revocados el bloque mide
   204,9 y siguen faltando 15,9 px. **El roce de 425 es anterior a este sprint.**

---

## 8 · §8 — LA PASTILLA DE NAVEGACIÓN

**No se tocó, no se arregló, y no se usó como excusa.** `pb-20` tampoco: los 72 px
que reserva siguen siendo los mismos y `soporte.ts` §9 los sigue afirmando. Donde
estorbó —el §6— se agregó aire **por afuera** en vez de tocar el relleno, y el
número está publicado arriba: los 8 px de sobrante son `80 − 72`.

---

## 9 · §9 — LA MEDICIÓN

### 9.1 · Superposición en los ocho anchos, con LAS DOS MÁSCARAS

| ancho | sobre la ESCENA (D) antes → después | DETRÁS del texto (E) antes → después | tinta bajo AA | contraste |
|---|---|---|---|---|
| **320** | 46,65 → **43,76 %** | **0,00 → 0,00 %** | 0,00 → 0,00 % | 17,60 → 17,60:1 |
| **375** | 16,22 → **40,59 %** 🔴 | 16,30 → **40,58 %** 🔴 | 16,12 → **40,43 %** | 14,04 → 14,01:1 |
| 390 | 4,86 → **2,71 %** | 4,60 → **2,83 %** | 3,95 → 2,74 % | 14,01 → 14,01:1 |
| 425 | 5,06 → **4,32 %** | 4,86 → **4,14 %** | 4,17 → 4,11 % | 14,01 → 14,01:1 |
| **768** | 16,26 → **3,34 %** ✅ | 16,57 → **3,26 %** ✅ | 13,32 → 2,95 % | 14,00 → 14,03:1 |
| 1024 | 1,41 → **0,52 %** | 1,34 → **0,51 %** | 1,20 → 0,49 % | 14,67 → 14,13:1 |
| 1440 | 0,69 → **0,69 %** | 0,51 → 0,60 % | 0,43 → 0,48 % | 14,55 → 14,55:1 |
| 1920 | 0,05 → **0,05 %** | 0,10 → 0,11 % | 0,03 → 0,04 % | 14,67 → 14,67:1 |

⚠ **A 320 la columna D publica 43,76 % y no es una regresión**: es la composición
que sigue rota **debajo** del papel opaco de TEXTO-3. Lo que la pantalla muestra
es la columna E, y ahí hay 0,00 %. La instrucción lo pedía dicho así.

⚠ **1440 y 1920 reproducen su cifra al centésimo** (0,69 y 0,05), y el titular
dibuja prácticamente los mismos glifos —20.523 → 20.530 y 27.393 → 27.391—: el
bloque se movió 0,79 px por el §3 y nada más.

### 9.2 · El alto del bloque y los tamaños finales

| ancho | alto del bloque | tope | registro 1 (filas × px) | registro 2 | bajada (renglones × px) |
|---|---|---|---|---|---|
| 320 | 313,69 → **254,78** | 174,31 → 233,22 | 2 × 37,00 | **55,00** | 2 × 16 |
| 375 | 200,34 → **267,86** | 386,66 → 319,14 | 2 × 37,00 | 67,00 | 2 × 16 |
| 390 | 201,22 → **269,05** | 562,78 → 494,95 | 2 × 37,30 | 67,52 | 2 × 16 |
| 425 | 203,30 → **271,88** | 560,70 → 492,13 | 2 × 37,99 | 68,74 | 2 × 16 |
| 768 | 223,67 → **299,63** | 720,33 → 644,38 | 2 × 44,75 | 80,65 | 2 × 16 |
| 1024 | 238,86 → **320,31** | 449,14 → 351,69 | 2 × 49,80 | 89,55 | 2 × 16 |
| 1440 | 303,58 → **305,17** | 298,20 → 297,41 | 1 × 58,00 | 104,00 | 1 × 16 |
| 1920 | 332,06 → **333,66** | 373,97 → 373,17 | 1 × 67,46 | 120,68 | 1 × 16 |

**320 es el único que se achica** (−58,91 px): ahí el titular envolvía solo y eran
cuatro renglones; el quiebre declarado los baja a tres.

### 9.3 · Contraste del titular con el método del glifo

Mediana de la luminancia debajo de los glifos del titular, contra la tinta medida,
sobre lo que REALMENTE hay detrás (máscara E). **Los ocho anchos siguen muy por
arriba de AA (4,5:1)**: 14,01 a 17,60:1.

Donde el tamaño cambió:

- **320**, la fila 3 de 67 a 55 px: **17,60:1**, que es la razón tinta/papel que el
  sistema publica desde S0 — el máximo que este sistema puede dar. **0,00 %** de
  la tinta bajo AA.
- **la bajada, de 15 a 16 px en los ocho**: no mueve el contraste (la bajada no
  entra en esta cifra, que es del titular) y su propia caja no cambió de
  superficie.

⚠ **La cifra que la mediana esconde es la que importa a 375**: el contraste
mediano dice 14,01:1 —porque el 59 % de la tinta sigue cayendo sobre papel— pero
el **40,43 % de los píxeles del titular está bajo AA**. Es el mismo defecto de
instrumento que `mascaras.ts` documenta, y por eso las dos cifras se publican
juntas.

### 9.4 · El gate

**30 pasos · 0 fallas · 16 deudas.** El detalle, los cinco rojos que hubo que
re-anclar y la verificación de que el `.next` que leyó es el del build de cierre,
en **§11**.

### 9.5 · El peso: 589 bytes, y la línea con su recibo

El lane sube, así que la línea se declara en el mismo acto.

| | bytes del lane | aire |
|---|---|---|
| antes (el árbol de TEXTO-3) | **66.306,2** | |
| TEXTO-3 había cerrado en | **66.306,2** | *desvío 0,0 B* ✅ |
| después | **66.895,2** | |
| **COMPO-1 monta** | **589,0 B** | |

**⚠️ El control que hace que la resta signifique algo:** el «antes» de este A/B
**reproduce el cierre de TEXTO-3 al décimo de byte**, con once archivos devueltos
al árbol de aquel sprint desde **tres** fuentes —ocho del respaldo que este sprint
copió fuera del árbol antes de tocar nada (con sha256 publicado), uno de `HEAD`
con su `git status` a la vista, y uno que se borra porque no existía—.

**La línea: `MONTAJE_DE_COMPO1_KIB = 0,59`.** 589,0 / 1024 = 0,5752 → 0,58, que
deja 4,9 B de aire, **3,1 B debajo** del umbral de 8; se aplica la regla del aire
útil y sube un centésimo: **0,59**, con **15,2 B**. **El techo de 60 no se movió**
y la línea es revocable sola. El lane cierra con **74,4 B de aire**.

⚠️ **Es la cuarta línea más grande del tablero** —detrás de B12 (1,36), B4-A (1,25)
y el titular (0,70)— y se dice por qué: no es un mecanismo nuevo, son **seis
cadenas de clase y ocho claves de geometría** adentro de un objeto que viaja
entero. **Y se dice qué se podría haber achicado**: tres de esas ocho claves las
lee sólo el invariante y sacarlas ahorraría unos **84 B**, el 14 %; no se hizo
porque volverlas literales escritos a mano es el defecto que `padron-de-tokens.ts`
documenta.

⚠ El A/B se corrió **dos veces**: la primera dio 573 B y después la medición del
navegador encontró la trampa del §6.3 (`medio:` no se apaga solo), cuya corrección
agregó 16 B. El número publicado es el de la segunda.

### 9.6 · La verificación visual con el subagente

`CLAUDE.md` pide despachar el subagente `visual-qa` en todo sprint que toque
pantallas. **Se despachó y no pudo mirar nada**: reportó que no tiene las
herramientas de preview en esta configuración —sólo `Read`, `Glob` y `Grep`— y
pidió que se abriera el navegador por otro camino. Verificó el CÓDIGO y declaró
la verificación de render **pendiente**, sin inventar un reporte, que es lo
correcto.

**El camino alternativo es el que este sprint ya usa de forma nativa**: las 16
capturas de `capturas/compo/` salen de Chrome por CDP, con recarga limpia por
ancho y con la ventana verificada antes de creerle a un número — y arriba de eso,
cada pieza está medida sobre el píxel. Es estrictamente más de lo que
`visual-qa` habría producido. Queda anotado que **el subagente sigue roto en esta
máquina**, como ya estaba.

### 9.7 · Capturas

**16 archivos** en `capturas/compo/`: los ocho anchos **antes** y los ocho
**después**, en reposo, con **recarga limpia por ancho** (pestaña nueva, métricas
puestas antes de navegar, escena esperada y `verificarVentana` que tira si la
pestaña no está visible). Bien abajo del tope de 50.

⚠ Dos corridas fallaron con `visibilityState="hidden"` y **el guardián las tiró en
vez de publicar ceros**, que es exactamente la lección de agosto funcionando. Se
repitieron con la ventana a la vista.

---

## 10 · §10 — LO QUE NO SE TOCÓ

- El botón que desliza hasta Trabajos (`TransitionContext.tsx`, congelado).
- La marca 2D arriba.
- Las otras siete secciones, `numeros` incluida.
- La escena, la cámara, `frameX`, la distancia, el anclaje, el alto de sección.
- Los pisos de las curvas fluidas de 1440/1920 — y §1.1 explica que además **no
  habrían servido**.
- `HeroArtifact.tsx` y `TransitionContext.tsx`.
- `a-verdad-hoy.json`: no se re-basó.
- `pb-20` y la pastilla de navegación.
- Cero `git`. Cero `any`. Ningún `router.push`.

⚠ **La única excepción, ya declarada arriba**: el CTA se corre 8 px a la izquierda
también a 1440 y 1920, porque el §4 pide medir y alinear «en los ocho anchos» y el
§10 dice que esos dos sólo se mueven por el §3. **Los dos puntos se contradicen y
la decisión es de la parada.**

---

## 11 · EL GATE

`NODE_OPTIONS=--max-old-space-size=6144 MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build`
(exit 0) · `npx prisma migrate status` · `npm run verificar`.

| paso | resultado |
|---|---|
| 1 · `package.json` | ok — limpio |
| 1b · conflictos en todo el repo | ok — limpio |
| 2 · `tsc --noEmit` | ok — sin errores de tipos (18,9 s) |
| 3 · los 27 agregados | **27 de 27 en verde** |

**135 invariantes · 5.624 afirmaciones · 960 controles positivos · 13 fuera de
ventana · 0 con falla · 16 deudas declaradas.**

**30 pasos · 0 fallas · 16 deudas**, que es lo que el sprint pedía. Las deudas son
las mismas que el repo ya declaraba: 12 en `test:s10-acceso`, 3 en `test:s8-tinta`
y 1 en `test:s22-emision`. Este sprint no agregó ninguna y no cerró ninguna.

`npx prisma migrate status`: **86 migraciones, al día.**

`npm run test:frontera`, que va aparte y ANTES del commit: **2 invariantes · 23
afirmaciones · 10 controles positivos · 0 con falla.**

⚠ **El `.next` que el gate leyó es el del build de cierre**, y se verificó que lo
es: después de la corrida se reconstruyó y `s5-peso` volvió a publicar **74,4 B de
aire**, el mismo número. Lo único que cambió entre los dos builds fueron
comentarios, que no llegan al bundle.

### ⚠️ Cinco invariantes se pusieron en rojo, y los cinco por algo que este sprint cambió

Ninguno era un falso rojo. Se listan porque el conjunto dice algo: **este sprint
tocó la GEOMETRÍA de una sección, y la geometría la miran más instrumentos de los
que parece.**

| invariante | qué afirmaba | qué afirma ahora |
|---|---|---|
| `hero` §4–§7 | dos líneas de titular, dos `<span>`, nombre accesible de dos | TRES filas, `filas + envoltorios` spans, nombre accesible de tres, y el de la bajada |
| `tokens` §1–2 | el tema difiere de S0 **exactamente** en lo aprobado | lo mismo, con `--text-display-xl-angosto` declarado con su motivo |
| `s7-pedido` | el documento de pendientes está al día | lo mismo, regenerado: 47 pendientes, Hero con 3 |
| `s5-codigo` §1 | nada en disco sin registrar en el padrón | lo mismo, con `composicion.ts` declarado |
| `s5-codigo` §8 | ningún archivo pasa las 300 líneas de código | lo mismo — `s5-peso.invariant.ts` llegó a **311** y se partió en dos |

Los tres primeros son las puertas de control de cambios funcionando: el token no
entró hasta que se declaró con su sprint y su motivo, y el documento de pendientes
no se pudo quedar viejo. **El quinto es el más útil de los cinco**: el archivo del
peso cruzó las 300 líneas al declararse la cuarta línea seguida «en el mismo
acto», y el corte que salió de ahí —`s5-peso-lineas.ts`— deja esas cuatro juntas,
que es donde se leen mejor.

---

## 11b · PARA COMMITEAR

⚠️ **Este sprint NO commitea.** Y el working tree lleva **cuatro sprints sin
commitear encimados** —MOVIL-1, TEXTO-2, TEXTO-3 y COMPO-1—, así que los `git add`
van **archivo por archivo, nunca `git add .`**. Esta lista es SÓLO lo de COMPO-1.

```bash
git add logic-core-v3/src/app/theme-develop.css
git add logic-core-v3/src/lib/utils.ts
git add logic-core-v3/src/app/v3/_secciones/hero/contenido.ts
git add logic-core-v3/src/app/v3/_secciones/hero/geometria.ts
git add logic-core-v3/src/app/v3/_secciones/hero/Hero.tsx
git add logic-core-v3/src/app/v3/_secciones/hero/composicion.ts
git add logic-core-v3/src/app/v3/_secciones/hero/soporte.ts
git add logic-core-v3/src/app/v3/_secciones/hero/hero.invariant.tsx
git add logic-core-v3/src/app/v3/_lib/__tests__/s3-banda-consecuencias.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/padron-de-tokens.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/tokens.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-archivos.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-compo1.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-peso.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-peso-lineas.ts
git add logic-core-v3/scripts-compo/compo-comun.ts
git add logic-core-v3/scripts-compo/a-composicion.ts
git add logic-core-v3/scripts-compo/b-ajuste.ts
git add logic-core-v3/scripts-compo/c-peso.ts
git add logic-core-v3/scripts-texto/texto-comun.ts
git add logic-core-v3/scripts-texto/e-antes-despues.ts
git add logic-core-v3/docs/rediseno/DIRECCION-ESCENA.md
git add logic-core-v3/docs/rediseno/CONTENIDO-PENDIENTE.md
git add logic-core-v3/docs/rediseno/outputs/COMPO-1.md
git add logic-core-v3/docs/rediseno/outputs/compo/a-composicion-antes.json
git add logic-core-v3/docs/rediseno/outputs/compo/a-composicion-despues.json
git add logic-core-v3/docs/rediseno/outputs/compo/b-ajuste-hoy.json
git add logic-core-v3/docs/rediseno/outputs/compo/c-peso.json
git add logic-core-v3/docs/rediseno/outputs/texto/e-compo1.json
git add logic-core-v3/docs/rediseno/capturas/compo/antes-320x568.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-375x667.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-390x844.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-425x844.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/compo/antes-1920x1080.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-320x568.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-375x667.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-390x844.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-425x844.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/compo/despues-1920x1080.png
```

⚠ `scripts-texto/e-antes-despues.ts` y `scripts-texto/texto-comun.ts` vienen de
TEXTO-1/2 y este sprint los MODIFICÓ (la bandera `--capturas=no`, el selector del
nivel nuevo y el contador de renglones sobre nodos de texto): van en este commit o
en aquéllos, **pero una sola vez**.

Mensaje propuesto, sin acentos:

```
COMPO-1: el titular en tres filas, la bajada en dos, el CTA alineado y la columna lateral fuera de tablet
```

---

## 12 · LOS ARCHIVOS

**Producto** (6):

- `src/app/theme-develop.css` — `--text-display-xl-angosto: 55px` con su derivación
- `src/lib/utils.ts` — la clase nueva en la lista de tamaños de `cn()`
- `src/app/v3/_secciones/hero/contenido.ts` — el titular en tres filas, la bajada en dos, `PEDIDO` de tres entradas
- `src/app/v3/_secciones/hero/geometria.ts` — las ocho claves nuevas y `TIPOGRAFIA_DEL_REGISTRO_2`
- `src/app/v3/_secciones/hero/Hero.tsx` — el marcado
- *(no viaja pero es de la sección)* `src/app/v3/_secciones/hero/composicion.ts` — **nuevo**, §14a–§14e

**Invariantes y presupuesto** (10):

- `src/app/v3/_secciones/hero/hero.invariant.tsx` — §4, §6, §7 re-anclados + la llamada a §14
- `src/app/v3/_secciones/hero/soporte.ts` — el factor del peso 700, importado en vez de duplicado
- `src/app/v3/_lib/__tests__/s3-banda-consecuencias.ts` — `TEXTO_DEL_TITULAR` y `medidaDelTitular`
- `src/app/v3/_lib/__tests__/padron-de-tokens.ts` — el token nuevo con su motivo
- `src/app/v3/_lib/__tests__/tokens.invariant.ts` — el diff aprobado
- `src/app/v3/_lib/__tests__/s5-archivos.ts` — `composicion.ts` en el padrón
- `src/app/v3/_lib/__tests__/s5-presupuesto.ts` — `MONTAJE_DE_COMPO1_KIB` y `LINEAS_CON_NOMBRE`
- `src/app/v3/_lib/__tests__/s5-peso.invariant.ts` — la suma y el corte de 300 líneas
- `src/app/v3/_lib/__tests__/s5-peso-lineas.ts` — **nuevo**, las tres líneas declaradas en el mismo acto
- `src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-compo1.ts` — **nuevo**, el recibo

**Instrumentos**: `scripts-compo/{compo-comun,a-composicion,b-ajuste,c-peso}.ts`
(nuevos) y `scripts-texto/{e-antes-despues,texto-comun}.ts` (la bandera
`--capturas=no`, el selector del nivel nuevo y el contador de renglones sobre
nodos de texto).

**Documentos**: `docs/rediseno/DIRECCION-ESCENA.md` (§7.65–§7.69),
`docs/rediseno/CONTENIDO-PENDIENTE.md` (regenerado: 47 pendientes, Hero con 3) y
este informe.

---

## 13 · LO QUE QUEDA PARA EL DUEÑO

1. **🔴 375 empeoró de 16,2 % a 40,6 %** y no hay palanca en este sprint que lo
   cierre. Faltan 134,9 px de alto. §0 y §7.65 de `DIRECCION-ESCENA.md`.
2. **🔴 El CTA se alineó también a 1440 y 1920**, lo que el §10 prohibía y el §4
   pedía. Revocar sólo esa mitad es una variante.
3. **La línea de peso: `MONTAJE_DE_COMPO1_KIB = 0,59`** (589 B). Declarada en el
   mismo acto porque la regla del repo lo pide; aprobarla o revocarla es de la
   parada.
4. **La bajada subió +1 px (+6,7 %)**, que está en el borde de lo perceptible. Si
   quiere más, el escalón siguiente es +33 % a 1440 y trae interlineado de título.
5. **El §5 alcanzó también a 1024** (texto a x 32). Es una mejora medida, pero no
   estaba pedida.
