# PAPEL-2 · LA COMPOSICIÓN DE LOS ANCHOS DE PAPEL

**Los cinco puntos, aplicados y medidos.** Worktree `C:\rediseno-home\logic-core-v3`,
rama `rediseno/home`, sobre el árbol de **COMPO-1** —que sigue sin commitear, y
arriba de MOVIL-1, TEXTO-2 y TEXTO-3, que tampoco—. **No se commiteó nada.**

**Instrumentos nuevos**: cuatro, en el `scripts-papel/` que PAPEL-1 abrió — `a-derivacion.ts` (los tamaños del §3
y el presupuesto de alto del §4, sin navegador y ANTES de construir), `b-antes.mjs`
(el «antes» del A/B de peso, reconstruido con un `assert` por quite),
`c-peso.mjs` (la cifra del lane en BYTES) y `d-alto.ts` (la columna entera contra
el viewport, y las capturas).
**Instrumentos reusados**: `scripts-texto/e-antes-despues.ts` con las dos máscaras
de TEXTO-3, y `scripts-tapado/{a-verdad,c-recibo}.ts` para el recibo del modelo.

**Salidas**: `outputs/papel/{a-derivacion.json,a-derivacion.txt,d-alto.json}`,
`outputs/texto/e-papel2.json`, `outputs/tapado/a-verdad-papel2-{hoy,centrado}.json`.
**Capturas**: `capturas/papel/papel2-*.png` — **8 archivos**, los ocho anchos en
reposo y con recarga limpia por ancho. Más los **16** que `a-verdad.ts` escribe al
regenerar el recibo (`capturas/tapado/papel2-{hoy,centrado}-*`): **24 en total**,
contra un tope de 50.

---

## 0 · LO QUE HAY QUE LEER PRIMERO

### 🔴 EL VERDE DE `s10-logo` §1b ERA FALSO, Y ESTE SPRINT LO DESTAPÓ

Es el hallazgo más importante del sprint y **no es sobre este sprint**: es sobre
COMPO-1.

Ese invariante tiene dos mitades —un MODELO que deriva la composición del Hero sin
navegador y un RECIBO medido sobre el píxel— y afirma que la diferencia entre
ellas es constante. Estaba en verde con una dispersión de **0,1 px**.

PAPEL-2 cambió la composición en dos anchos, así que **tuvo que regenerar el
recibo**. Con el recibo fresco la reconciliación se abrió a **155,6 px de
dispersión — en anchos que este sprint no tocó**. Eso no lo podía causar el
sprint. Al mirar:

- **El recibo publicaba la pantalla ANTERIOR a COMPO-1.** Su `arribaHoy` a 390 era
  562,8 px, que es exactamente el «antes» que COMPO-1 §9.2 publica; el «después»
  de aquel sprint era 494,95. COMPO-1 no lo regeneró.
- **Y el modelo tampoco ve a COMPO-1.** A 390 publica el registro 1 como UNA caja
  de 40,7 px y la bajada como UNA de 25,6, cuando en pantalla son **dos y dos**.
  Los dos renglones que le faltan, más sus huecos, son los ~81 px de diferencia.
  La causa es del medidor de cajas: cuenta los renglones que una cadena
  **necesita** para entrar, y un quiebre DECLARADO —dos `<span>` adentro de un
  envoltorio `flex-col`— no los necesita, los impone.

**Las dos mitades estaban igual de viejas, y por eso coincidían.** Es la clase de
falla que el repo llama «verde por arnés»: un invariante que pasa porque su patrón
y su medida se movieron juntos, no porque el sitio esté bien.

**Qué se hizo:** se dejó el recibo FRESCO —es la única mitad que dice la verdad de
la pantalla— y las tres afirmaciones de la reconciliación pasaron a
`deudaDeclarada` con sus números y su fecha de cierre. **Volver a poner el recibo
viejo habría devuelto el verde apagando la mitad que mide.**

**Qué NO se hizo, y por qué:** rehacer el conteo de renglones y la tabla de niveles
de `s10-logo-cajas.ts`. Es el instrumento de otro sprint y la regla del repo es
anotar y reportar lo que cae fuera del alcance.

> ⚠️ **Consecuencia para el dueño: el gate cierra con 19 deudas y no con 16.** Las
> tres nuevas son éstas, todas del mismo hallazgo. Ninguna es del producto.

### ✅ LOS CINCO PUNTOS, EN UNA TABLA

| § | qué pedía | resultado |
|---|---|---|
| 1 | el papel también a 375 | ✅ corte nuevo `--breakpoint-chico` (390). 375 pinta papel; 390 no |
| 2 | la marca arriba (palabra + logo 2D) | ✅ `Logotipo` + `Isotipo`, sólo abajo de 390 |
| 3 | igualar el ancho de los dos registros | ✅ desvío **0,13 y 0,17 px** medidos en el navegador, contra una tolerancia de 2 |
| 4 | medir el alto ANTES de construir | ✅ medido primero; **entra**, con 78,3 y 120,6 px de holgura |
| 5 | la pastilla desactivada en angosto | ✅ `max-chico:hidden`, declarada temporal en `contrato.ts` |

### ✅ Y LOS SEIS ANCHOS INTOCABLES NO SE MOVIERON

Alto de la columna, medido en el navegador contra lo que COMPO-1 publicó:

| ancho | COMPO-1 | PAPEL-2 |
|---|---|---|
| 390 | 269,05 | **269,0** |
| 425 | 271,88 | **271,9** |
| 768 | 299,63 | **299,6** |
| 1024 | 320,31 | **320,3** |
| 1440 | 305,17 | **305,2** |
| 1920 | 333,66 | **333,7** |

Y `hero.invariant` §15d lo afirma además como PROPIEDAD y no como captura: las
cinco clases que el sprint agrega llevan variante `max-chico:`, `max-angosto:` o
`chico:`, así que **ninguna puede pintar de 390 para arriba** sin que alguien le
saque la variante.

---

## 1 · §1 — EL CORTE, DERIVADO

### 1.1 · El valor: 390 px, y por qué NO se movió el token que ya había

`max-angosto:` emite `@media (width < 375px)`, que deja 375 **afuera**. La forma
obvia —subirle el número a `--breakpoint-angosto`— se descartó, y está medido:

**Ese token tiene DOS consumidores con bandas distintas.**

| consumidor | banda | de dónde sale |
|---|---|---|
| `max-angosto:bg-fondo` | la superficie del Hero | 320 (TEXTO-3) y ahora 375 |
| `max-angosto:text-display-xl-angosto` | el registro 2 a 55 px | **320–374**, medido |

La segunda banda termina en 374 porque **de 371,13 px de ventana para arriba el
décimo nivel ya entra solo** en la caja del titular (a 375: 306,79 px de tinta en
una caja de 311,00, con 4,21 de margen). Subir el token a 390 habría achicado el
registro 2 de 375 un **18 %** sin una medición que lo pida, habría dejado al token
contradiciendo su derivación escrita, y habría desincronizado `tokens.invariant`
§7b —que ata ese 375 al de `--fluido-piso`, y cuya prosa ya se corrigió una vez
por esto—.

**Así que son dos cortes, porque son dos preguntas:**

- `angosto` (375): ¿dónde deja de entrar el décimo nivel en un renglón?
- `chico` (390): ¿dónde deja de haber composición limpia sobre la escena?

**El 390 sale del mismo lugar del que salió el 375: es el primer ancho del set
donde la regla deja de aplicar.** Tinta del titular sobre la masa del logo,
COMPO-1 §9.1: **43,76 % a 320 · 40,59 % a 375 · 2,71 % a 390.**

### 1.2 · ⚠️ El 390 es un PROXY, y se dice

**Lo que hunde a 375 no es su ancho: es su ALTO.** El set aparea 320×568 y 375×667
contra 390×844, o sea que los dos anchos que necesitan papel son los dos
**viewports cortos**, y el bloque —apoyado abajo— sube hasta meterse en el logo
justamente porque le falta alto. Una media query de ancho no puede preguntar eso.

**Queda declarado: una ventana de 390×600 caería del lado equivocado del corte.**

### 1.3 · Lo que el token nuevo cuesta y lo que le da consumidores a los dos lados

`--breakpoint-chico` es el **único breakpoint del lane con consumidores en los DOS
sentidos**, y no es casualidad: `max-chico:` pinta el papel, achica el pie y baja
el registro 1; `chico:` esconde la marca del Hero y la pastilla. Los cinco
invariantes de breakpoints pasaron de afirmar CUATRO a afirmar CINCO, con la banda
de cada uno escrita.

---

## 2 · §2 — LA MARCA ARRIBA

### 2.1 · El recurso: NO se generó nada, NO se capturó el 3D

El SVG de la marca existe y es uno solo: **`public/logodevelOP.svg`, 596 B,
`viewBox` 1024×1024, un solo `<path>`**. Es el asset canónico —el mismo que el
mesh 3D extrude por `SVGLoader`— y su path ya está exportado como constante:
`LOGO_PATH_D` en `src/components/ui/LogoMark.tsx`.

La pieza nueva —`Isotipo`, en `_componentes/marca/Marca.tsx`— **importa esa
constante**. No agrega la quinta copia del path (ese archivo documenta que ya hay
cuatro y que si la marca cambia hay que tocar las cuatro), no lee el canvas y no
genera nada. El preloader nuevo ya usa exactamente este camino —SVG inline en el
DOM, sin WebGL— como su respaldo declarado.

**El `viewBox` es el de la TINTA (`LOGO_INK_VIEWBOX_ATTR`), no el cuadrado.** La
tinta mide 978,5 × 680,7 y **no llena el cuadrado ni está centrada en él: su
centro cae 33 unidades por debajo**. Con el cuadrado, un alto de 81 px pintaría 54
de marca y 27 de aire mudo, con la pieza corrida para abajo.

### 2.2 · Los tamaños, derivados

| pieza | de dónde sale | 320 | 375 |
|---|---|---|---|
| la palabra `develOP` | `text-fluido-caption` — el único registro en el que el lane ya pinta la palabra sola como marca (`LineaDeCierre` la monta en un `Caption`) | 11,00 px → caja de 12,0 | 11,00 px → 12,0 |
| el isotipo (alto) | `calc(var(--text-display-r1-papel) * var(--leading-titulo))` — **una fila del titular**, el mismo alto que cada renglón de abajo | 66,5 px | 81,1 px |
| el isotipo (ancho) | sale solo del `viewBox` de la tinta (razón 1,4375) con `w-auto` | 95,7 px | 116,5 px |

Los seis valores son **medidos en el navegador** (`outputs/papel/d-alto.json`) y
coinciden con los derivados al décimo.

**Ningún número inventado:** el `calc()` del isotipo multiplica dos tokens y no
lleva una constante escrita.

### 2.3 · Sólo donde el fondo es papel

`chico:hidden`. **`display:none` y no `visibility`**: un ítem de flex apagado deja
de ser ítem, así que **se lleva su hueco con él** — con `visibility:hidden` el
`gap-2` seguiría empujando el bloque 8 px en los seis anchos intocables.

⚠ Es una media query y no una rama de JS, por el mismo argumento con el que
`superficies.ts` justifica que la banda de papel sea CSS: el hook que lee el ancho
devuelve `false` en el servidor **y en la hidratación**, así que una rama pintaría
el primer cuadro sin marca y la metería después.

⚠ **El costo que sí se paga de 390 para arriba es marcado**: el path viaja en el
HTML de los ocho anchos aunque sólo se vea en dos. Está medido y declarado como
línea de peso (§5 de este informe).

---

## 3 · §3 — LOS DOS REGISTROS, IGUALADOS

### 3.1 · La respuesta es una RAZÓN, no un valor

Dos cadenas igualan su tinta cuando `tamaño₁ × avance₁ = tamaño₃ × avance₃`, o sea
`tamaño₁ = tamaño₃ × (avance₃ / avance₁)`. **El factor no depende del ancho de
pantalla: depende sólo de las dos caras.** Por eso el registro 1 se declara como
el registro 2 multiplicado por él, y la igualdad se cumple en TODO el tramo y no
sólo en los dos anchos que se midieron.

Los tres avances, medidos contra los binarios que se sirven:

```
«TU NEGOCIO»   4,12429 em   Archivo wdth 62 · wght 700 · tracking −0,02
«VENDIENDO»    3,93223 em   la misma cara — NO es la que manda
«LAS 24 HS»    4,57900 em   Chivo Light itálica · tracking −0,03

4,57900 / 4,12429 = 1,11025
```

### 3.2 · Los tamaños finales de los tres renglones

| ancho | renglón 1 y 2 (antes → después) | renglón 3 | tinta del más ancho | tinta del renglón 3 | desvío |
|---|---|---|---|---|---|
| **320** | 37,00 → **61,06 px** | 55,00 px | 251,85 px | 251,85 px | **0,0000** |
| **375** | 37,00 → **74,39 px** | 67,00 px | 306,79 px | 306,79 px | **0,0000** |

El escalón que cierra era de **99,25 px a 320 y 154,19 px a 375**.

### 3.2b · ⚠️ Y medido EN EL NAVEGADOR, que es lo que vale

La tabla de arriba es la derivación. Ésta es la caja de tinta de cada registro
leída en pantalla (`outputs/texto/e-papel2.json`, `linea1.caja.ancho` contra
`linea2.caja.ancho`):

| ancho | registro 1 | registro 2 | desvío | caja |
|---|---|---|---|---|
| **320** | 252,00 | 252,13 | **0,13 px** ✅ | 256 |
| **375** | 306,97 | 307,14 | **0,17 px** ✅ | 311 |
| 390 | 153,91 | 309,52 | 155,61 — intacto | 326 |
| 425 | 156,75 | 315,06 | 158,31 — intacto | 361 |
| 768 | 184,64 | 369,70 | 185,06 — intacto | 704 |
| 1024 | 205,48 | 410,45 | 204,97 — intacto | 960 |
| 1440 | 473,70 | 476,70 | 3,00 — intacto | 478,39 |
| 1920 | 550,98 | 553,16 | 2,18 — intacto | 670,39 |

**El escalón se cierra exactamente en los dos anchos de papel y en ningún otro.**
Los 3,00 y 2,18 px de 1440 y 1920 son de antes y no son el mismo fenómeno: ahí el
registro 1 va en UN renglón con las dos palabras inline, así que su ancho ya se
parecía al del registro 2 por su cuenta.

**Y entra en la caja**, que es la otra mitad: el techo que la caja del titular
admite para «TU NEGOCIO» es 62,07 px a 320 y 75,41 a 375.

⚠️ **ALINEACIÓN IZQUIERDA, sin excepción.** No se centró nada: las cuatro piezas
siguen arrancando en el mismo borde que COMPO-1 §4 unificó, y la marca nueva se
suma a ese borde (x 32 en los dos anchos, medido).

### 3.3 · Las tres clases de tamaño conviven, y el orden lo decide Tailwind

A 320 aplican las dos variantes `max-` a la vez. Tailwind emite los `max-*` de
mayor a menor, así que la de 375 sale **después** y gana en la cascada — que es lo
que corresponde, porque el régimen más chico manda. **No se confía en eso**:
`hero.invariant` §15b lo lee del **CSS construido** y afirma que todas las reglas
`max-chico:` salen antes que todas las `max-angosto:`.

---

## 4 · §4 — EL RIESGO DE ALTO, MEDIDO ANTES DE CONSTRUIR

`scripts-papel/a-derivacion.ts` corrió **antes de tocar una línea de marcado**, sin
navegador y sin build. Ésa era la parada.

| | 320×568 | 375×667 |
|---|---|---|
| disponible con la pastilla (`pt-20` + `pb-20`) | 408,00 | 507,00 |
| disponible **sin** la pastilla (`pb` a 8) | **480,00** | **579,00** |
| bloque de texto con el §3 | 308,27 | 350,39 |
| la marca del §2 (palabra + hueco + isotipo + hueco) | 94,55 | 109,07 |
| **total** | **402,82** | **459,47** |
| holgura CON la pastilla | 5,18 | 47,53 |
| **holgura SIN la pastilla** | **77,18** | **119,53** |

**Entra, y no se frenó.** Pero los 72 px del §5 no son un lujo: **con la pastilla
puesta, 320 entra por 5,18 px**, que es menos que el desvío conocido del propio
modelo contra el navegador. Con los 72 liberados el «entra» deja de depender de la
precisión del modelo.

**Confirmado después en el navegador** (`outputs/papel/d-alto.json`): columna de
**401,8 px de 480 útiles a 320** (holgura 78,3) y **458,4 de 579 a 375** (holgura
120,6). El modelo erró por 1,0 px en los dos, que es su sesgo conocido.

**No se achicó el logo por cuenta propia**: su alto sale de una fila del titular y
se quedó ahí, con 78 y 120 px de sobra.

---

## 5 · §5 — LA PASTILLA, DESACTIVADA

`max-chico:hidden` en el punto de MONTAJE (`ChromeDelHome`) y no en la pieza:
`/v3/componentes` monta la misma `Navegacion` en su galería y ahí no hay razón
para que desaparezca.

**Declarada temporal en el código**: `PASTILLA_APAGADA_EN_PAPEL` en
`_chrome/contrato.ts`, con el pedido, el mecanismo y lo que se lleva.

### 5.1 · ⚠️ Lo que esto se lleva, y es una regresión de accesibilidad

Abajo de 390 el documento **pierde DOS landmarks**: el `banner` —que es el
envoltorio con `como="header"`— y la `navigation` que cuelga de él. Quedan **9 de
los 11** que `s10-acceso-landmarks` cuenta, y el `<main>` pasa a abrir el
documento. `SaltarAlContenido` NO se tocó y sigue siendo el primer foco.

**Es aceptable sólo porque es temporal.** El día que la navegación se rehaga, la
constante y su clase se van juntas; y si el reemplazo tampoco aparece en angosto,
tiene que traer su propio landmark.

### 5.2 · Los 72 px liberados

`pb-20` **no se tocó** —`soporte.ts` §9 lo sigue afirmando contra
`DESCUENTO_NACIMIENTO_PX`— y lo que se agrega es una CONDICIÓN: `max-chico:pb-2`.
El 8 no se eligió: es el sobrante que COMPO-1 §6 ya había medido y nombrado,
`80 − 72`.

Los invariantes que afirmaban la presencia de la pastilla **se reescribieron con
la condición, no se borraron**: `s10-acceso-landmarks` declara los dos landmarks
que se pierden abajo de 390, y `hero.invariant` §15d afirma que `pb-20` **sigue en
el marcado** y que lo que se agregó es una condición.

---

## 6 · §6 — LA MEDICIÓN

### 6.1 · Superposición en los ocho anchos, con LAS DOS MÁSCARAS

| ancho | sobre la ESCENA (D) COMPO-1 → PAPEL-2 | DETRÁS del texto (E) | contraste |
|---|---|---|---|
| **320** | 43,76 → **31,6 %** | 0,00 → **0,00 %** | 17,60 → **17,60:1** |
| **375** | 40,59 → **35,0 %** | 40,58 → **0,00 %** ✅ | 14,01 → **17,60:1** |
| 390 | 2,71 → **2,8 %** | 2,83 → 3,0 % | 14,01 |
| 425 | 4,32 → **4,4 %** | 4,14 → 4,1 % | 14,01 |
| 768 | 3,34 → **3,4 %** | 3,26 → 3,3 % | 14,01 |
| 1024 | 0,52 → **0,5 %** | 0,51 → 0,5 % | 14,13 |
| 1440 | 0,69 → **0,7 %** | 0,60 → 0,6 % | 14,55 |
| 1920 | 0,05 → **0,1 %** | 0,11 → 0,1 % | 14,67 |

⚠ **A 320 y 375 la columna D sigue alta y NO es una regresión**: es la composición
que sigue rota **debajo** del papel opaco. Lo que la pantalla muestra es la columna
E, y ahí hay **0,00 % en los dos**. La instrucción lo anticipaba: *el problema está
tapado, no resuelto.*

### 6.2 · Contraste del titular sobre papel

**17,60:1 en los dos anchos de papel** — que es exactamente **la razón tinta/papel
que el sistema publica desde S0**, el máximo que este sistema puede dar, y lo que
el §6 pedía comprobar. **0,00 % de la tinta bajo AA.**

### 6.3 · El alto de la columna contra el viewport, en los ocho

| ancho×alto | marca | pastilla | fondo del panel | columna | % del viewport | holgura |
|---|---|---|---|---|---|---|
| 320×568 | **sí** | no | `rgb(247,247,245)` papel | 401,8 | 70,7 % | 78,3 |
| 375×667 | **sí** | no | `rgb(247,247,245)` papel | 458,4 | 68,7 % | 120,6 |
| 390×844 | no | sí | `rgba(0,0,0,0)` | 269,0 | 31,9 % | 415,0 |
| 425×844 | no | sí | `rgba(0,0,0,0)` | 271,9 | 32,2 % | 412,1 |
| 768×1024 | no | sí | `rgba(0,0,0,0)` | 299,6 | 29,3 % | 564,4 |
| 1024×768 | no | sí | `rgba(0,0,0,0)` | 320,3 | 41,7 % | 287,7 |
| 1440×900 | no | sí | `rgba(0,0,0,0)` | 305,2 | 33,9 % | 434,8 |
| 1920×1080 | no | sí | `rgba(0,0,0,0)` | 333,7 | 30,9 % | 586,3 |

Las tres columnas de la derecha son la comprobación del §1, del §2 y del §5 a la
vez: el papel y la marca están **exactamente** en los dos anchos donde tienen que
estar, y la pastilla en los otros seis.

### 6.4 · Las capturas

**8 archivos**, `capturas/papel/papel2-<ancho>x<alto>.png`, recarga limpia por
ancho, `deviceScaleFactor` 1. Muy por debajo del tope de 50.

⚠ Las capturas salen del **dev server**, así que llevan dos cosas que no son el
sitio: la banda negra de arriba es el aviso de `CONTENIDO_INVENTADO` (la llave de
B12) y el círculo negro de abajo a la izquierda es el indicador de Next en
desarrollo, que tapa el arranque del CTA.

---

## 7 · EL PESO

### 7.1 · La línea: +0,76 KiB, con su recibo

**764,0 B** de desvío, medidos A/B entre dos builds del mismo árbol.

```
«antes» (árbol de COMPO-1)              66.895,2 B
sin la marca (§1 + §3 + §5)             67.063,2 B   +168,0
cierre (todo)                           67.659,2 B   +764,0
→ LA MARCA SOLA (§2)                                  596,0 B
```

Se corrió un **tercer build** —el árbol de cierre con la marca quitada— para que
la pieza cara se pueda revocar sola sin adivinar cuánto vale. **El 78 % de la
línea es la marca**, y adentro de ella manda una sola cosa: los **493 caracteres**
de `LOGO_PATH_D`. Un path vectorial es una cadena y un minificador no la achica.

Al centésimo de arriba: 764,0 / 1024 = 0,7461 → 0,75, que deja **4,0 B** de aire,
**4,0 B debajo** del umbral de 8. Se aplica la regla del aire útil y la línea sube
un centésimo: **0,76**, con **14,2 B**.

**El techo de 60 NO se movió.** El techo del lane pasa de 65,40 a **66,16 KiB**, y
el árbol cierra con **88,6 B de aire**.

### 7.2 · ⚠️ El «antes» reproduce el cierre de COMPO-1 al décimo de byte

**66.895,2 contra 66.895,2 — desvío 0,0 B.** Es lo que prueba que la resta aísla
ESTE sprint y no arrastra los cuatro sin commitear que tiene debajo.

El «antes» se **RECONSTRUYÓ** —no se copió de `HEAD` ni se sacó de un `stash`, que
con `core.autocrlf=true` reescribiría el árbol en CRLF— quitando de cada archivo
exactamente lo que el sprint le puso, con un `assert` por quite:
`scripts-papel/b-antes.mjs`, con los sha256 publicados.

### 7.3 · Lo que se podría haber achicado, con el número

La marca viaja en el chunk de cliente porque `Hero.tsx` lleva `'use client'`.
**Montada desde un componente de SERVIDOR costaría 0 B de JS** —es lo que B12
midió para la marca en pantalla—. No se hizo porque pasarla por el contrato de
secciones es cambiarle la forma a las ocho. **Queda como la primera palanca para
quien necesite estos 596 B.**

La alternativa barata —`<img src="/logodevelOP.svg">`— cuesta ~40 B de marcado
pero pierde `currentColor` (el path no declara `fill`, sale negro y hay que
invertirlo con un filtro), agrega un request y deja un hueco mientras baja.

⚠ Los tres tokens nuevos y sus reglas **no están en esta cuenta**: son CSS, y el
techo mide sólo los `<script src>` de la ruta.

---

## 8 · LO QUE NO SE TOCÓ

- La escena, la cámara, `frameX`, la distancia y el anclaje: **cero cambios**.
- `HeroArtifact.tsx` y `TransitionContext.tsx`: intactos.
- El botón que desliza a Trabajos y las otras siete secciones: fuera de alcance.
- `pb-20`: sigue en el marcado; lo que se agregó es una condición.
- Cero `any`, cero `router.push`, cero `git add`.

---

## 9 · TRES CORRECCIONES DE INSTRUMENTO QUE EL SPRINT TUVO QUE HACER

Las tres son cegueras que la marca del Hero estrenó, y las tres se arreglaron
porque las rompió este sprint:

| instrumento | qué no veía | qué ve ahora |
|---|---|---|
| `s10-css.clasesEfectivas` | los prefijos `max-*` caían en la rama de «no es de ancho» y se conservaban **enteros**, o sea que nunca se resolvían. `hero/composicion.ts` lo declaraba como límite y resolvía su único caso a mano | `max-<bp>:` aplica cuando el viewport es **estrictamente menor**, que es lo que Tailwind emite |
| `s10-logo-alto.repartoVertical` | un nodo `display:none` seguía ocupando alto **y** su caja de texto seguía en la envolvente del bloque | un nodo apagado vale 0 y sus descendientes salen de la lista de cajas |
| `s7-contrato` §5 | buscaba `useAnchoMinimo` en el fuente ENTERO, así que se ponía en rojo cuando un docblock **explicaba por qué** una clase es una media query y no una rama | mira el código sin comentarios, con control positivo en las dos direcciones |

El tercero es el mismo defecto que `s10-mobile-pastilla` ya había cazado en su
chequeo de breakpoints, y se arregló igual.

---

## 10 · EL GATE

`MEDIR_CON_LA_LLAVE_PRENDIDA=1 NODE_OPTIONS=--max-old-space-size=6144 npm run build`
(exit 0) · `npx prisma migrate status` · el gate por grupos.

| paso | resultado |
|---|---|
| 1 · `package.json` | ok — limpio, sin diff |
| 1b · conflictos en todo el repo | ok — sólo el fixture deliberado del control positivo |
| 2 · `tsc --noEmit` | ok — sin errores de tipos |
| 3 · los 27 agregados | **27 de 27 en verde** |

**135 invariantes · 5.680 afirmaciones · 968 controles positivos · 13 fuera de
ventana · 0 con falla · 19 deudas declaradas.**

### ⚠️ **30 pasos · 0 fallas · 19 deudas** — y no 16

Las 16 de siempre siguen ahí y ninguna se cerró: 12 en `test:s10-acceso`, 3 en
`test:s8-tinta` y 1 en `test:s22-emision`. **Las 3 nuevas son todas de
`test:s10-logo` y todas del mismo hallazgo del §0**: la reconciliación entre el
modelo y el recibo, que estaba verde porque las dos mitades estaban igual de
viejas. Ninguna es del producto y ninguna se puede cerrar sin rehacer el conteo de
renglones de `s10-logo-cajas.ts`, que es de otro sprint.

`npm run test:frontera`, que va aparte y ANTES del commit: **2 invariantes · 23
afirmaciones · 10 controles positivos · 0 con falla.**

⚠ **El `.next` que el gate leyó es el del build de cierre**: se reconstruyó antes
de correrlo y `c-peso.mjs` volvió a publicar **71.960,0 B**, el mismo número de la
medición del §7.

`npx prisma migrate status`: **86 migraciones, al día.**

⚠ **`npm run build` FALLA a propósito sin la llave** (`CONTENIDO_INVENTADO` +
guardián en `prebuild`). El árbol tiene cifras inventadas de B12 §4 y el guardián
existe para que no se publiquen. `MEDIR_CON_LA_LLAVE_PRENDIDA=1` es la salida
declarada para medir fuera de un deploy.

---

## 11 · PARA COMMITEAR

⚠️ **Este sprint NO commitea.** Y el working tree lleva **cinco sprints sin
commitear encimados** —MOVIL-1, TEXTO-2, TEXTO-3, COMPO-1 y PAPEL-2—, así que los
`git add` van **archivo por archivo, nunca `git add .`**. Esta lista es SÓLO lo de
PAPEL-2.

```bash
# producto
git add src/app/theme-develop.css
git add src/app/v3/_lib/superficies.ts
git add src/app/v3/_lib/secciones.ts
git add src/app/v3/_componentes/marca/Marca.tsx
git add src/app/v3/_secciones/hero/Hero.tsx
git add src/app/v3/_secciones/hero/geometria.ts
git add src/app/v3/_chrome/contrato.ts
git add src/app/v3/_chrome/ChromeDelHome.tsx
git add src/lib/utils.ts

# instrumentos
git add src/app/v3/_secciones/hero/papel.ts
git add src/app/v3/_secciones/hero/hero.invariant.tsx
git add src/app/v3/_lib/__tests__/tokens.invariant.ts
git add src/app/v3/_lib/__tests__/padron-de-tokens.ts
git add src/app/v3/_lib/__tests__/superficies.invariant.ts
git add src/app/v3/_lib/__tests__/s10-medida.invariant.ts
git add src/app/v3/_lib/__tests__/s10-css.ts
git add src/app/v3/_lib/__tests__/s17-marca.invariant.tsx
git add src/app/v3/_lib/__tests__/s7-contrato.invariant.ts
git add src/app/v3/_lib/__tests__/s5-archivos.ts
git add src/app/v3/_lib/__tests__/s5-presupuesto.ts
git add src/app/v3/_lib/__tests__/s10-acceso-landmarks.ts
git add src/app/v3/_lib/escena/__tests__/s10-logo-alto.ts
git add src/app/v3/_lib/escena/__tests__/s10-logo-composicion.ts

# bancos y evidencia
git add scripts-papel/a-derivacion.ts
git add scripts-papel/b-antes.mjs
git add scripts-papel/c-peso.mjs
git add scripts-papel/d-alto.ts
git add .gitignore
git add docs/rediseno/outputs/PAPEL-2.md
git add docs/rediseno/outputs/papel/
git add docs/rediseno/outputs/texto/e-papel2.json
git add docs/rediseno/outputs/tapado/a-verdad-papel2-hoy.json
git add docs/rediseno/outputs/tapado/a-verdad-papel2-centrado.json
git add docs/rediseno/capturas/papel/
git add docs/rediseno/capturas/tapado/papel2-hoy-*.png
git add docs/rediseno/capturas/tapado/papel2-centrado-*.png
git add docs/rediseno/DIRECCION-ESCENA.md
```

⚠ Los 16 archivos `capturas/tapado/papel2-*` los escribe `a-verdad.ts` al
regenerar el recibo —ocho por composición— y son la evidencia de esa corrida. Con
los 8 de `capturas/papel/` son **24 capturas nuevas**, la mitad del tope de 50.

Mensaje sugerido, sin acentos:

```
PAPEL-2: el papel hasta 375, la marca arriba y los dos registros igualados

- corte nuevo --breakpoint-chico (390): cubre 375 y no cubre 390. NO se movio
  --breakpoint-angosto porque su otro consumidor tiene banda medida 320-374
- la marca arriba del titular solo en los anchos de papel: la palabra develOP y
  el isotipo 2D, que importa LOGO_PATH_D en vez de copiarlo por quinta vez
- el registro 1 igualado al registro 2 por RAZON de avances (1,11025): desvio
  0,0000 px en los dos anchos
- la pastilla desmontada en angosto, declarada temporal; sus 72 px pasan al
  presupuesto de alto de la marca
- +0,76 KiB con recibo de tres builds (596 B la marca, 168 el resto). Techo 60
  intacto
- HALLAZGO: el verde de s10-logo 1b era falso (modelo y recibo igual de viejos).
  Tres deudas declaradas con su cierre
```

---

## 12 · LO QUE QUEDA PARA EL DUEÑO

1. **Aprobar las tres deudas nuevas** o pedir que el conteo de renglones de
   `s10-logo-cajas.ts` se rehaga en un sprint propio. El gate cierra con **19** y
   no con 16 por esto, y por nada más.
2. **El tamaño del isotipo.** Está derivado de una fila del titular y sobran 78 px
   a 320 y 120 a 375. Si lo quiere más grande, hay lugar — y el número ya está.
3. **Los 596 B de la marca**, con la palanca escrita para devolverlos.
4. **El proxy del §1.3**: el corte es de ancho y el problema es de alto. Una
   ventana de 390×600 cae del lado equivocado.
