# ROCE-1 · QUE EL BLOQUE NO ROCE EL LOGO EN 425 Y EN 768

**Un solo cambio aplicado, y en un solo ancho: a 768 el bloque baja 6 px.**
Worktree `C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre el árbol
de **COMPO-2** (commiteado en `f9cd14da`, reconciliado por `ORDEN-2` en
`9c58041d`). **No se commiteó nada.**

**Instrumentos nuevos**: tres, en `scripts-roce/` — `roce-comun.ts` (la palanca
del corrimiento y los dos techos), `a-barrido.ts` (el corrimiento vertical como
variable, con las dos máscaras de TAPADO-1 más la silueta analítica del logo) y
`b-ocho.ts` (los ocho anchos, antes y después, en la misma carga).
**Instrumentos reusados**: `scripts-tapado/{tapado-comun,mascaras,logo-analitico}.ts`,
`scripts-compo2/compo2-comun.ts`, `scripts-b4/{captura,navegador,cdp,png}.ts` y
`scripts-papel/c-peso.mjs`.

**Salidas**: `outputs/roce/{a-grueso425,a-grueso768,a-fino425,a-fino768,a-logo425,
a-logo768,a-logo768fino,a-repite768,a-control425,a-candidatos425,a-candidatos768,
b-cierre}.json`.
**Capturas**: `capturas/roce/` — **13 archivos** contra un tope de 50. Ocho son
los ocho anchos del cierre con recarga limpia por ancho (`cierre-*.png`) y cinco
son los candidatos del barrido, tomados sobre el árbol anterior
(`candidatos*-baja*.png`); `candidatos768-768x1024-baja0.png` **es el «antes» de
768** y hace par con `cierre-768x1024.png`. `deviceScaleFactor` 1, y el que
captura fuerza `prefers-reduced-motion: no-preference`, o sea que las capturas
salen con todas las animaciones corriendo.

---

## 0 · LO QUE HAY QUE LEER PRIMERO

### 🔴 LAS CIFRAS DE LA INSTRUCCIÓN NO MIDEN EL LOGO: MIDEN «LO QUE ESTÁ OSCURO»

La instrucción parte de **«425 en 1,13 % y 768 en 3,18 %»** y de ahí concluye que
«el titular todavía toca la masa del logo». Los dos números son ciertos y están
bien medidos —son el cruce de la tinta del titular contra la máscara **D** de
TAPADO-1, la que separa la masa por LUMINANCIA—, pero **esa máscara cuenta como
masa todo lo que está bien oscuro**, y en el hero eso incluye la celosía del piso
del estudio y las sombras de la sala, que no son el logo. `mascaras.ts` ya lo deja
escrito («lo que se busca es la MASA NEGRA del logo, no *lo que está un poco más
oscuro que el promedio*») y por eso el repo tiene un segundo instrumento:
`logo-analitico.ts`, que marcha rayos contra la **silueta real** y sabe distinguir
«acá hay logo» de «acá está oscuro».

Pedidas las dos cifras sobre el mismo cuadro, la pregunta del sprint cambia de
respuesta:

| ancho | tinta del titular sobre **cualquier masa oscura** (D) | tinta del titular sobre **la silueta del logo** (analítica) |
|---|---|---|
| **425** | 1,26 % | **0,00 %** |
| **768** | 3,35 % | **0,62 %** |

**A 425 el titular no toca el logo, y no lo tocaba antes de este sprint.** Lo que
su 1,26 % mide es la banda diagonal oscura de las filas 659–690 —la celosía del
piso— pasando por debajo de «LAS 24 HS».

Las dos máscaras coinciden en DÓNDE está el logo, y eso es lo que hace creíble la
diferencia: la banda oscura por luminancia va de la fila 261 a la 575 a 425 y de
la 316 a la 699 a 768; la silueta analítica va de **261 a 574** y de **317 a 698**.
**Un píxel de diferencia en los cuatro bordes.** Lo que la luminancia agrega son
las OTRAS bandas —659–690 a 425, 800–838 a 768—, que caen fuera de la silueta y
por lo tanto no pueden ser logo.

### ✅ EL CONTROL POSITIVO, PORQUE UN CERO HAY QUE GANARLO

Un instrumento que publica 0,00 % puede estar ciego. A 425 se lo hizo hablar
**subiendo** el bloque (`a-control425.json`): el roce con el logo **aparece**.

| corrimiento | −16 px | **−20 px** | −28 px |
|---|---|---|---|
| tinta sobre el logo | 0,00 % | **0,39 %** | 4,20 % |

O sea que a 425 el cero de hoy es un cero medido con **16–20 px de holgura** por
arriba, no una ceguera.

---

## 1 · PASO 1 — EL BARRIDO, Y LAS DOS CIFRAS QUE PEDÍA

La palanca es el relleno de abajo del hero: con `justify-end` y `box-sizing:
border-box`, el borde inferior del bloque queda exactamente a `padding-bottom`
del borde del viewport, así que bajar N px es `padding-bottom: 80 − N`. La
relación es **exacta** y el banco la audita fila por fila (`corrimientoDe`). No se
usó `transform: translateY`, por la lección de abril: con una transformada activa
`getBoundingClientRect()` devuelve coordenadas que no son las del layout, y este
banco cruza esos rectángulos con píxeles de una captura.

Además hay un centinela: **si el alto de la columna cambia entre dos filas, el
banco tira.** El relleno tiene que MOVER el bloque, no comprimirlo.

### 1.1 · Los dos techos, derivados

| | 425×844 | 768×1024 |
|---|---|---|
| fondo del bloque hoy | 764 px | 918,41 px |
| **techo ÚTIL** — el pie en el piso que PAPEL-2 derivó (`pb-2`, 8 px) | **72 px** | **72 px** |
| **techo DURO** — el bloque al ras del viewport | **80 px** | **105,59 px** |

El techo útil es 72 en los dos y no es una coincidencia: es exactamente lo que
`pb-20` reserva para la pastilla (`DESCUENTO_NACIMIENTO_PX`), que a estos dos
anchos está apagada por `max-medio:hidden`. A 768 el techo duro es 33,59 px más
grande porque ahí hay una reserva de más: los 25,6 px de margen que COMPO-2 le
devolvió a la grilla.

### 1.2 · 425 — el mínimo que resuelve **no existe, porque no hay nada que resolver**

Barrido completo de 0 a 80 px, de a 4 (`a-logo425.json`, 21 filas):

| corrimiento | 0 | 8 | 20 | 40 | 56 | 72 | 80 |
|---|---|---|---|---|---|---|---|
| **sobre el logo** | **0,00 %** | 0,00 % | 0,00 % | 0,00 % | 0,00 % | 0,00 % | 0,00 % |
| sobre cualquier masa oscura | 1,26 % | 4,53 % | 13,35 % | 16,28 % | 10,31 % | 2,42 % | 3,64 % |
| aire bajo el bloque | 80 | 72 | 60 | 40 | 24 | 8 | 0 |

**Contra el logo, las 21 filas dan 0,00 %: el corrimiento mínimo es CERO.**

Contra la masa oscura la respuesta también es cero, pero por el otro motivo:
**la posición de hoy es el mínimo de todo el barrido** y cualquier bajada empeora
—+1,64 puntos con 4 px, ×13 con 40—. La causa está medida: la segunda banda
oscura vive en las filas 659–690 y el registro 2 vive en 600,50–675,41, o sea que
ya le toca el borde; bajar el bloque lo mete adentro. Su tinta pasa de 1,90 % a
33,15 % en el peor punto del barrido.

### 1.3 · 768 — el mínimo que resuelve es **6 px**

Barrido de a UN píxel en el tramo decisivo (`a-logo768fino.json`), y repetido en
una segunda corrida (`a-repite768.json`) que da **los mismos centésimos**:

| corrimiento | 0 | 1 | 2 | 3 | 4 | 5 | **6** | 7 |
|---|---|---|---|---|---|---|---|---|
| **sobre el logo** | 0,62 % | 0,47 % | 0,31 % | 0,19 % | 0,11 % | 0,04 % | **0,00 %** | 0,00 % |
| sobre cualquier masa oscura | 3,35 % | 3,36 % | 3,35 % | 3,42 % | 3,47 % | 3,52 % | 3,57 % | 3,63 % |

La serie es **monótona** y reproducible al centésimo, y tiene por qué: los dos
términos del cruce son deterministas —la silueta sale del muestreador analítico
con el progreso de reposo, la tinta de una captura SIN escena—, así que ninguno
arrastra el ruido de motas que sí tiene la lectura por luminancia (COMPO-2 midió
el mismo «hoy» en 4,12 · 4,33 · 4,34 %).

**Todo el roce es del registro 1**: 0,89 % de su tinta a 0 px, 0,00 % a 6. El
registro 2 publica 0,00 % en todo el tramo. Lo que se toca es el borde inferior
del lóbulo izquierdo del isotipo, que baja hasta la fila 698, contra la primera
fila del registro 1, que nace en 595,88.

### 1.4 · ⚠️ LA PARADA DE LA INSTRUCCIÓN **NO** SE DISPARA, y hay que decir por qué

La instrucción manda frenar si el desplazamiento que resuelve el roce de arriba
mete el bloque en la segunda masa. **No pasa: 6 px queda a un doceavo del techo
útil.** El precedente de COMPO-2 era a **25,6 px** —cuatro veces más— y ahí sí el
registro 2 caía entero adentro de las filas 800–838 (3,35 % → 8,53 %). Con 6 px la
lectura por luminancia del titular sube **0,17 puntos** (3,35 % → 3,52 %), que es
menos que el ruido de 0,2 puntos entre tres corridas del mismo árbol que COMPO-2
publicó.

**Lo que sí hay que decir es la otra mitad: bajar 6 px no mejora la lectura por
luminancia, la empeora un pelo.** Son dos cosas distintas y las dos se publican.

---

## 2 · PASO 2 — LO QUE SE APLICÓ

### 2.1 · A 425, nada — y es el cumplimiento literal de la instrucción

El paso 2 dice «el mínimo que da 0,00 %, no más». A 425 ese mínimo es **0 px**,
porque la cifra ya está en 0,00 %. Bajar cualquier cantidad sería moverse por
encima del mínimo y, además, empeorar la única cifra que ahí se mueve.

### 2.2 · A 768, 6 px, cambiando **un término de un `calc()` que ya existía**

`GEOMETRIA.claseDelAireDelPieEnPortatil`, tercera banda:

```
antes    tablet:mb-[calc(var(--text-base)*var(--leading-texto))]      = 25,60 px
después  tablet:mb-[calc(var(--text-base)*var(--leading-texto)-6px)]  = 19,60 px
```

**No hay clase nueva, no hay breakpoint nuevo y no hay declaración nueva.** La
banda de esa clase ya era **768–859** —`medio:mb-4` la pisa en 860 y
`escritorio:mb-0` la apaga en 1025—, o sea exactamente el ancho que este sprint
tiene que mover y ninguno de los que tiene que dejar quietos. Es también el
motivo por el que 425 no podía moverse con esta palanca aunque hubiera hecho
falta: **no existe un corte declarado entre 390 y 425**, y los dos caen en la
misma banda.

**Por qué el valor se escribe como una resta y no como un escalón:** los dos
términos son cosas distintas con procedencias distintas. El primero es el renglón
que la regla global de COMPO-2 le sacó al bloque (`--text-base × --leading-texto`);
el segundo es el corrimiento medido que lo despega del lóbulo. Sumarlos en un
número redondo escondería las dos derivaciones. El escalón más cercano
(`--spacing-2`, 8 px) pasaría 2 px del mínimo.

### 2.3 · Los tres archivos tocados, y qué se le agregó a cada uno

| archivo | qué |
|---|---|
| `src/app/v3/_secciones/hero/geometria.ts` | el término nuevo del `calc()`, su derivación con la tabla del barrido, y la constante `CORRIMIENTO_DEL_ROCE_EN_768_PX` |
| `src/app/v3/_secciones/hero/ajuste.ts` | §16d afirma ahora la **resta** contra esa constante, con dos afirmaciones nuevas: que el corrimiento es positivo y que no se come el renglón (si lo igualara, el registro 2 volvería a la segunda masa) |
| `src/app/v3/_secciones/hero/Hero.tsx` | el comentario del marcado, que describía el valor viejo |

---

## 3 · PASO 3 — LA MEDICIÓN

### 3.1 · Los ocho anchos, antes y después, en la misma carga

El «antes» se reproduce con una regla sobre el mismo árbol —mismo bundle, mismo
chunk de la escena, UNA variable— y la regla repone **la cascada de tres bandas**,
no una sola: sin las media queries, el margen de 768 se habría puesto también en
320, 375, 390 y 425, donde la clase no aplica, y el resultado no habría sido el
antes sino otro estado.

| ancho | tinta sobre **el logo** | tinta sobre masa oscura | columna (arriba → abajo) | ¿idéntico? |
|---|---|---|---|---|
| 320×568 | 31,12 % → 31,12 % | 31,77 % → 31,77 % | 31,81 → 536,17 | ✅ |
| 375×667 | 30,04 % → 30,04 % | 30,48 % → 30,48 % | 41,13 → 625,86 | ✅ |
| 390×844 | 0,00 % → 0,00 % | 1,01 % → 1,01 % | 520,55 → 764 | ✅ |
| 425×844 | 0,00 % → 0,00 % | 1,27 % → 1,27 % | 517,72 → 764 | ✅ |
| **768×1024** | **0,62 % → 0,00 %** | 3,25 % → 3,48 % | 595,88 → 918,41 **→ 601,88 → 924,41** | 🔵 el único que se mueve |
| 1024×768 | 0,00 % → 0,00 % | 0,52 % → 0,52 % | 278,72 → 672 | ✅ |
| 1440×900 | 0,00 % → 0,00 % | 0,63 % → 0,63 % | 297,41 → 602,58 | ✅ |
| 1920×1080 | 0,00 % → 0,00 % | 0,06 % → 0,06 % | 373,17 → 706,83 | ✅ |

**Los siete que no son 768 quedaron idénticos, y no «al decimal»: la comparación
es de igualdad exacta sobre el JSON entero** —la columna, los seis rectángulos de
pieza y los seis cruces de máscara de cada ancho—. El movimiento de 768 es
exactamente **6,00 px** en los dos bordes de la columna.

### 3.2 · El alto del bloque contra el viewport en 425 y 768

| | 425×844 | 768×1024 |
|---|---|---|
| columna | 517,72 → 764 | 601,88 → 924,41 |
| alto | 246,28 px | 322,53 px |
| **fracción del viewport** | **29,18 %** | **31,50 %** |
| aire bajo el bloque | 80 px | **99,59 px** (era 105,59) |
| ¿desborda? | **no** | **no** |

A 768 el bloque sigue a 99,59 px del borde de abajo: el pie conserva sus 80 px de
`pb-20` intactos y los 6 px salieron del margen de 25,6, que queda en 19,6.

### 3.3 · El gate

```
MEDIR_CON_LA_LLAVE_PRENDIDA=1 NODE_OPTIONS=--max-old-space-size=6144 npm run build   → exit 0
npm run verificar                                                                    → 30 pasos, 0 con falla
```

**30 pasos · 0 fallas · 19 deudas declaradas** (15 en `s10`, 3 en `s8`, 1 en
`s22`) — las mismas que traía el árbol.

⚠ `next build` **corre el typecheck** en Next 16.2.9, y los tres instrumentos
nuevos están adentro del `tsconfig` (sólo `scripts/**` está excluido), así que el
build verde también los typechequea. `npx tsc --noEmit` se corrió aparte, limpio.

### 3.4 · La línea de peso: **+4,0 B, medidos, y NO nace línea**

A/B de dos builds **en el mismo `distDir`**, así que el directorio no es una
variable (`scripts-papel/c-peso.mjs`):

| | escrito por el lane | chunk de `/v3/page` |
|---|---|---|
| **antes** (el `calc()` sin el término) | **72.146,0 B** | 57.068 B |
| **después** | **72.150,0 B** | 57.072 B |
| **desvío** | **+4,0 B** | **+4 B** |

**El control es exacto: el «antes» da 72.146,0 B, que es el número que COMPO-2
dejó publicado como su «después» en `.next`.** La reconstrucción es fiel, y el
desvío cae entero en **un solo chunk** y vale exactamente los **4 caracteres**
que el `calc()` agregó (`-6px`). El árbol de cierre se construyó **dos veces** y
las dos dieron 72.150,0 B con el **mismo hash de chunk**: acá el ruido entre
builds del mismo árbol es **0 B**, contra el piso de 9 B que COMPO-2 declaró.

**No se declara una línea nueva, y el motivo es una regla del propio tablero.**
El escalón de declaración es 0,01 KiB = 10,24 B; una línea de 0,01 para 4 B
medidos nacería con **6,2 B de aire**, por debajo del umbral de **8 B** que
`AIRE_MINIMO_UTIL_BYTES` impone. Los 4 B se absorben en el aire del techo vigente:

- techo del lane: **66,35 KiB**, sin mover — **93,2 B de aire** con el cambio adentro;
- **el 60 NO se movió**: las 15 líneas con nombre se le siguen sumando y siguen
  siendo revocables una por una;
- `s5-peso.invariant`: **45 afirmaciones, 0 fallas**.

### 3.5 · Las capturas

**13 archivos** en `capturas/roce/`, contra un tope de 50. Ocho son los ocho
anchos del cierre, **una pestaña nueva y una carga de cero por ancho**
(`enLaVentana` pone las métricas ANTES de navegar, porque el nivel de calidad de
la escena se decide al montar). El par que muestra el cambio es
`candidatos768-768x1024-baja0.png` (antes) contra `cierre-768x1024.png` (después).

---

## 4 · LO QUE QUEDA ABIERTO, CON SU NÚMERO

**1. 🔴 320 y 375 tienen roce REAL con el logo, y es un orden de magnitud peor
que el que este sprint cerró: 31,12 % y 30,04 % de la tinta del titular sobre la
silueta.** Son los dos anchos de la banda de papel, donde el bloque va centrado y
el logo es más ancho que el cuadro. COMPO-2 ya dejó medido que a 320 *«no existe
ninguna posición en la que no se toquen»* —el bloque ocupa el 88,8 % del viewport
y la masa el 37 %—, así que la salida de ahí no es mover el bloque. Fuera del
alcance de este sprint, que la instrucción acotó a 425 y 768.

**2. A 425 la palanca que mejora la lectura por luminancia es SUBIR, no bajar.**
Medido: subir 8 px lleva el 1,30 % a **0,40 %**, y el roce con el logo recién
aparece a los 20. Hay una banda de −4 a −16 px donde la cifra queda en 0,40–0,53 %
sin tocar el logo. No se aplicó porque el pedido de este sprint era bajar y porque
a 425 no hay roce que arreglar; queda con su número para que el dueño decida.

**3. Los 6 px son el mínimo exacto, y eso quiere decir que la holgura es una
hebra.** A 5 px la cifra es 0,04 %. Si en algún momento cambia el tamaño del
registro 1 a 768, el anclaje de la escena o la distancia de la cámara, este valor
hay que volver a barrerlo: `npx tsx scripts-roce/a-barrido.ts --ancho=768
--valores=4,5,6,7,8`.

---

## 5 · LO QUE NO SE TOCÓ

- Los tamaños de tipografía: el bloque se **movió**, no se achicó. Cero cambios.
- La escena, la cámara, `frameX`, la distancia, el anclaje y el alto de sección:
  **cero cambios**.
- La marca, el centrado de 320/375 y la bajada en un renglón: todo COMPO-2 queda
  en pie, y los siete anchos que no son 768 lo prueban al JSON.
- La pastilla: `max-medio:hidden` intacta. `pb-20` y `pt-20`: intactos —los 6 px
  salieron del margen de la grilla, no del pie—.
- `HeroArtifact.tsx` y `TransitionContext.tsx`: **congelados, no se abrieron**.
- `.gitignore` y `tsconfig.json`: **sin cambios**. El A/B de peso se corrió en
  `.next` con el dev server apagado, en vez de estrenar un `distDir` alternativo,
  justamente para no tener que tocarlos.
- Cero `any`, cero `router.push`, cero `git add`, cero commits.
