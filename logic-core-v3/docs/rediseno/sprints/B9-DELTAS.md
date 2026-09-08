# B9-DELTAS — cada cosa a su tiempo

La tabla de desfases antes y después, instancia por instancia. **Es el gate del bloque.**

Todo lo de acá está medido con `scripts-b9/`, con scroll real, en `http://localhost:3002/v3`, con
la pestaña verificada al frente (`visibilityState: "visible"`, `innerWidth` exacto, `rAF` corriendo)
y paso de 120 px con asentamiento por parada. Ninguna cifra está modelada.

---

## §0 · El instrumento

| archivo | qué mide |
|---|---|
| `scripts-b9/b9-comun.ts` | el barrido por bloque y la resta de las dos ventanas |
| `scripts-b9/b9-desfases.ts` | la tabla, por instancia, en un perfil |
| `scripts-b9/b9-referencia.ts` | lo mismo pero descubriendo el elemento por su estilo en línea, para que corra igual en un sitio ajeno |
| `scripts-b9/b9-censo.ts` | el censo de acontecimientos de B2, arriba del umbral |
| `scripts-b9/b9-capturas.ts` | las capturas de Por qué develOP en el mismo `scrollY` |
| `scripts-b9/b9-derivar.ts` | la regla, derivada sobre la geometría medida, ANTES de tocar código |

**Las dos ventanas.** La **visible** de un bloque es el tramo de `scrollY` en el que su caja toca el
cuadro; se mide preguntándole a cada parada, no derivándola de `secciones.ts`. La de **animación**
es el tramo entre la primera parada en la que la firma de estilos en línea de sus descendientes
cambió y la última — que es, carácter por carácter, la definición de aterrizaje de
`scripts-b4/censo.ts` (B2) aplicada por bloque.

**Dos columnas contra las que se lee todo:**

- **arranque** — a qué fracción de pantalla **adentro del cuadro** está el bloque cuando empieza a
  moverse. `0` = justo al asomar por abajo.
- **aterrizaje** — dónde queda su **borde inferior** cuando llega al estado final, en fracción de
  pantalla desde el tope. `1` = al ras del borde de abajo; `0,5` = al centro.

---

## §1 · La causa, y las tres hipótesis refutadas

El humano señaló los cuatro bloques del diferencial de **Por qué develOP**. Medido a 1920×1080:

| `scrollY` | dónde está el bloque | opacidad en línea |
|---|---|---|
| 16.794 | acaba de asomar (top 994 de 1080) | **0** |
| **17.280** | **la sección llena el cuadro exacto** (top 508) | **0** |
| 17.518 | centrado (top 270) | **0** |
| 17.636 | top 152 | 0,593 |
| 17.755 | top 33 — la sección ya se fue el 44 % | 1 |

```
ventana visible del bloque   [16.708 · 18.328]   1.620 px
  864 px (53,3 %)  en cuadro y sin que pase nada
  108 px ( 6,7 %)  toda la animación
  648 px (40,0 %)  quieto hasta que sale
```

Por tarjeta, medida una por una (`referencia-propio-1920.json`):

| tarjeta | su ventana visible | px a opacidad 1 | **% de su ventana visible** |
|---|---|---|---|
| 1 · «Software propio» | 1.169 px | 117 | **10,0 %** |
| 2 · «Un panel, no un informe» | 1.169 px | 267 | 22,8 % |
| 3 · «Clientes con nombre» | 1.167 px | 417 | 35,7 % |
| 4 · «Entrega medida» | 1.169 px | 568 | 48,6 % |

### Las tres alternativas, refutadas con número

| hipótesis | veredicto |
|---|---|
| **el rango está anclado a la SECCIÓN** | **REFUTADA.** 27 de las 28 instancias llevan `data-anclaje="propia"`; la única con `"seccion"` es `trabajos#1`. Y para el caso capturado: con la caja del bloque el ancla predice `[17.572 · 17.680]` contra `[17.520 · 17.760]` observado — **132 px de error sobre una grilla de 120**; con la `<section>` predice `[17.064 · 17.712]`, **456 px de error en el arranque**. |
| **un escalonado que corre al último** | **REFUTADA.** Los cinco `CanalDePieza` de P5 arrancan los cinco en 17.520 y terminan los cinco en 17.760. **Desparramo 0 px.** (`P5.escalonado = 0`.) |
| **un alto declarado que no coincide con lo renderizado** | **REFUTADA.** El bloque renderiza **540,0 px** a 1080 y **450,0** a 900 — exactamente su piso de `50svh`. |

### La causa: el ancla de P5

`top top+=20%` → `bottom bottom-=40%`. El arranque pide que el **borde superior** del bloque haya
bajado hasta el 20 % del cuadro **desde arriba**. Para un bloque que vive al pie de una sección de
una pantalla eso ocurre **864 px después** de que entró en cuadro.

---

## §2 · La referencia — `https://www.nk.studio/`, una navegación, una medición

Mismo instrumento, mismo paso, 1920×1080. **226 elementos animados en nk, 193 en el nuestro.**
Los cuantiles de abajo excluyen los elementos cuya ventana visible pasa de dos pantallas (los
pinneados): 202 de nk, y para el nuestro los 46 que quedan fuera de las dos secciones pinneadas.

| medición | **nk** | **nosotros, antes** |
|---|---|---|
| arranque desde el borde inferior — p25 / p50 / p75 | −0,05 / **0,05** / 0,28 | −0,21 / **−0,12** / −0,08 |
| aterrizaje, fondo de la caja — p25 / p50 / p75 | 0,58 / **0,70** / 0,77 | 0,69 / **0,84** / 0,94 |
| duración en pantallas de scroll — p50 | **0,22** | 0,33 |
| fracción fuera de cuadro — p50 / p75 | 0 / 0,25 | 0 / 0 |
| escalonado: desparramo del arranque — p50 / p75 / máx | 0,33 / 0,44 / 3,67 | 0,22 / 0,22 / 2,00 |

**Lo que dice.** El arranque estaba bien en los dos. El **aterrizaje** llegaba **0,14 pantallas —
151 px— demasiado abajo**: la referencia deja el gesto terminado con la caja en el 0,70 del cuadro
y nosotros en el 0,84.

Y el escalonado de nk **sí corre al último** —0,33 pantallas de mediana, con grupos de 23 a 29
hermanos— **y aun así el último aterriza con su fondo en 0,395–0,455**, arriba del centro.

---

## §3 · LA REGLA

> **El rango de una instancia se deriva de la ventana visible de SU caja: arranca cuando su borde
> superior está 80 px adentro del cuadro, y llega cuando su borde inferior está a 240 px del borde
> de abajo.** En la gramática de `anclas.ts`: **`top bottom-=80px` → `bottom bottom-=240px`.**

**Los dos números no se inventan: son los de la referencia, y ya estaban en el repo.** 80/1080 =
0,074 cae sobre la mediana de arranque de nk (0,05). 1 − 240/1080 = **0,778** cae sobre su p75 de
aterrizaje (0,77); a 900 da **0,733**, sobre su mediana (0,70). Y esa pareja **es el ancla de P1**,
el patrón con 142 de las 244 instancias del corpus de la referencia. Las 6 instancias nuestras que
ya la usaban son las 6 que la medición encontró en regla.

`ANCLAS` **no se toca**: es la medición del sitio ajeno. La regla se publica en el contrato
(`_contrato/bloqueAnimado.ts`, al lado de `ANCLA_DEL_PIN`) con las dos constantes de
`_contrato/asentamiento.ts`, y `s19-sincronia` afirma la igualdad contra `ANCLAS.P1`.

---

## §4 · LA TABLA DE DESFASES — 1920×1080

`*` = la instancia se movió. Las que no llevan `*` están en el padrón de exclusiones de
`s19-sincronia` con su motivo.

| instancia | arranque antes → después | aterrizaje antes → después | fuera de cuadro | op@centro |
|---|---|---|---|---|
| **por-que-develop#1** * | **0,752 → −0,026** | **0,526 → 0,748** | 0,000 → 0,125 | **0 → 1** |
| quienes-somos#1 * | −0,078 → 0,033 | 0,967 → 0,744 | 0,333 → 0,000 | — |
| quienes-somos#2 * | −0,070 → 0,041 | 0,959 → 0,737 | 0,333 → 0,000 | — |
| quienes-somos#3 * | −0,029 → −0,029 | 1,000 → 0,778 | 0,500 → 0,250 | — |
| quienes-somos#4 * | −0,070 → 0,041 | 0,930 → 0,708 | 0,333 → 0,000 | — |
| quienes-somos#5 * | −0,028 → −0,028 | 0,972 → 0,750 | 0,100 → 0,083 | — |
| numeros#0 * | −0,100 → 0,011 | 0,955 → 0,733 | 0,250 → 0,000 | — |
| numeros#1 * | −0,058 → 0,053 | 0,929 → 0,706 | 0,333 → 0,000 | — |
| numeros#2 * | −0,098 → 0,013 | 0,942 → 0,719 | 0,333 → 0,000 | — |
| numeros#3 * | −0,068 → 0,043 | 0,894 → 0,672 | 0,333 → 0,000 | — |
| numeros#4 * | −0,074 → 0,037 | 0,932 → 0,710 | 0,333 → 0,000 | — |
| numeros#5 * | −0,067 → 0,044 | 0,911 → 0,689 | 0,333 → 0,000 | — |
| tu-panel#1 * | −0,016 → −0,016 | 0,926 → 0,704 | 0,143 → 0,111 | — |
| tu-panel#2 * | −0,016 → −0,016 | 0,989 → 0,767 | 0,500 → 0,250 | — |
| tu-panel#3 * | −0,051 → 0,060 | 0,913 → 0,691 | 0,333 → 0,000 | — |
| tu-panel#4 * | −0,086 → 0,025 | 0,926 → 0,704 | 0,333 → 0,000 | — |
| tu-panel#5 * | −0,003 → −0,003 | 0,926 → 0,704 | 0,111 → 0,091 | 1,000 → 0,998 |
| quienes-somos#0 | −0,025 → −0,025 | 0,737 → 0,737 | 0,167 → 0,167 | — |
| tu-panel#0 | 0,059 → 0,059 | 0,715 → 0,715 | 0,000 → 0,000 | — |
| por-que-develop#0 | 0,028 → 0,028 | 0,755 → 0,755 | 0,000 → 0,000 | — |
| cierre#1 | −0,032 → −0,032 | 0,742 → 0,742 | 0,250 → 0,250 | — |
| cierre#0 · `D-B9.C1` | 0,073 → 0,073 | 0,967 → 0,967 | 0,000 → 0,000 | — |
| cierre#2 · `D-B9.C2` | −0,029 → −0,029 | 0,940 → 0,940 | 0,250 → 0,250 | — |
| trabajos#0 · `D-B9.T1` 🚫 | −0,059 → −0,059 | 0,984 → 0,984 | 0,333 → 0,333 | — |
| trabajos#1 🚫 | −0,236 → −0,236 | 0,970 → 0,970 | 0,115 → 0,115 | 0,000 → 0,000 |
| servicios#0 · el pin | 1,000 → 1,000 | 1,333 → 1,333 | 0,000 → 0,000 | 1,000 → 1,000 |
| hero#0, hero#1 | no animan: su rango cierra en `scrollY` negativo | | | |

⚠️ **Las cuatro filas sin `*` que SÍ declaran la regla —`quienes-somos#0`, `tu-panel#0`,
`por-que-develop#0`, `cierre#1`— no se movieron un dígito, y eso es la comprobación empírica de que
el ancla de la regla ES la de P1.** No es un argumento: es la misma tabla, medida dos veces.

### Agregado

| | 1920 antes | 1920 después | 1440 antes | 1440 después | nk |
|---|---|---|---|---|---|
| aterrizaje p25 / **p50** / p75 | 0,911 / **0,932** / 0,967 | 0,706 / **0,737** / 0,767 | 0,872 / **0,911** / 0,969 | 0,644 / **0,700** / 0,719 | 0,58 / **0,70** / 0,77 |
| fracción fuera de cuadro, suma sobre 26 | **6,049** | **2,025** | **6,494** | **2,263** | — |
| instancias movidas | — | **17** | — | **17** | — |

---

## §5 · EL CENSO DE ACONTECIMIENTOS DE B2 — el gate del ritmo

⚠️ **La vara es la de ESTE instrumento**, medida sobre este árbol antes de tocar nada. El 1,11 que
B2 publicó salió de otro instrumento y no se puede restar contra éste.

| | 1920 antes | 1920 después | 1440 antes | 1440 después |
|---|---|---|---|---|
| **hueco máximo (pantallas)** | **1,33** | **1,33** | **1,20** | **1,20** |
| hueco medio | 0,67 | 0,66 | 0,73 | 0,74 |
| acontecimientos | 22 | 21 | 19 | 17 |
| piezas | 193 | 193 | 182 | 182 |

**El hueco máximo no se movió un dígito en ninguno de los dos anchos**, y es el mismo hueco en el
mismo lugar: entre el último aterrizaje de Trabajos y el primero de Servicios (10.560 → 12.000 a
1920; 8.880 → 9.960 a 1440). B9 no pudo mover ninguno de los dos extremos: uno está en la zona
prohibida y el otro es el pin.

### ⚠️ Lo que SÍ cambió, y no es el gate: dos fusiones

| dónde | qué pasó | por qué |
|---|---|---|
| `numeros#5` + `trabajos#0` (los dos anchos) | eran dos acontecimientos, ahora son uno | `numeros#5` aterriza 240 px más tarde y queda a **exactamente 240 px** de `trabajos#0`, que es el umbral de fusión del censo. **`trabajos#0` no se movió porque está en la zona prohibida (`D-B9.T1`).** Si se mueve con la regla, los dos vuelven a estar a 480 px y el acontecimiento vuelve. |
| lista de `tu-panel` + titular de `por-que-develop` (sólo a 1440) | ídem | la lista aterriza 240 px más tarde y el titular de la sección siguiente no se movió — es P1 y la regla es un no-op para él. Es geometría del documento, no del ancla. |

---

## §6 · POR QUÉ DEVELOP — antes y después, en el mismo `scrollY`

El `scrollHeight` del documento es **idéntico** en las dos corridas (19.525 a 1920, 16.275 a 1440),
así que el mismo `scrollY` es el mismo lugar y el par se puede restar.

| `scrollY` (1920) | opacidad antes | opacidad después | captura |
|---|---|---|---|
| 16.794 | 0 | 0,009 | `por-que-develop-1920-{antes,despues}-y16794.png` |
| **17.280** — la sección llena el cuadro | **0** | **0,703** | `…-y17280.png` |
| 17.518 — el bloque, centrado | **0** | **1** | `…-y17518.png` |
| 17.636 | 0,593 | 1 | `…-y17636.png` |
| 17.755 | 1 | 1 | `…-y17755.png` |

A 1440 (`y14400`, la sección llena el cuadro): **0 → 0,659**.

---

## §7 · SERVICIOS — sigue siendo una secuencia sincronizada

| comprobación | resultado |
|---|---|
| `npm run test:s6-servicios` | **121 afirmaciones, 0 fallas** — incluye §8 (los cinco canales del mismo tramo, 601 puntos, `desincronizaciones === []` y `cambiosDeTramo === 2`) y §14 (un solo remapeo) |
| `npx tsx scripts-b7/b-pin.ts` | **25 comprobaciones, 0 fallas** — los dos pines pegados, con su recorrido |
| la tabla de desfases | `servicios#0` no se movió un dígito en ninguno de los dos anchos |

`Servicios.tsx` **no declara `rango`**, y no puede: `anclasDe` resuelve el pin **antes** de mirar esa
propiedad. `s19-sincronia` §4 lo afirma sobre el fuente, y §3 lo tiene en el padrón con su motivo.

---

## §8 · EL ESCALONADO — qué se midió y cuál de las dos salidas se eligió

La instrucción daba dos salidas y pedía elegir con el número. **Ninguna de las dos hizo falta, y
eso también está medido:**

- **El escalonado no era la causa del caso capturado.** Las cinco piezas de P5 comparten la ventana
  `[0, 1]` exacta: desparramo **0 px**, medido elemento por elemento.
- **La referencia elige la segunda** —cada elemento con su propia ventana, desparramo p50 de 0,33
  pantallas— **y la compensa aterrizando alto**: sus grupos de 23 a 29 hermanos dejan al último con
  su fondo en 0,395–0,455, arriba del centro.
- **Nuestro único escalonado largo vivo es la lista de `tu-panel` (11 ítems, P4)**, y ya usaba la
  primera salida: `asentamiento.ts` comprime el grupo entero adentro de la ventana. B9 no la cambia
  de salida: **le corrige el punto de llegada**, que estaba 240 px abajo.

O sea: **se conservó la salida que cada instancia ya tenía y se corrigió el número contra el que la
salida se calibraba.** Ningún patrón se rediseñó, ningún gesto cambió de carácter.

---

## §9 · LO DIFERIDO, con su número

| id | instancia | qué le falta | por qué no acá |
|---|---|---|---|
| **`D-B9.T1`** | `trabajos#0` — el marco de Trabajos (P2) | aterriza en **0,984** contra el 0,778 de la regla; el mismo desvío que las 17 que sí se movieron | **ZONA PROHIBIDA**: `_secciones/trabajos/` es de la sesión vecina. Es además la causa de la primera fusión de §5: cerrarlo devuelve ese acontecimiento. |
| **`D-B9.C1`** | `cierre#0` — el titular del Cierre (P1 + asentamiento) | aterriza en **0,967** (1920) y **0,827** (1440) contra 0,778 / 0,733 | Su ancla de P1 YA es la de la regla; lo que lo devuelve a `bottom bottom` es `cierre/asentamiento.ts`, que B2 puso para que el Cierre tuviera un acontecimiento propio. Cerrarlo es **sacar** ese remapeo y reescribir la sección «B2 · el asentamiento del titular» de `s8-entrada.ts`, con dos afirmaciones load-bearing. Cambiar la cosa que se mide y la razón por la que se mide en la misma pasada fabrica un verde por arnés. **Lo medido para el que lo cierre está escrito en `cierre/asentamiento.ts`**, incluido que con `por-que-develop#1` adelantado 272 px la separación que ese asentamiento compraba ahora la da el vecino (476 px, muy arriba del umbral de 240). |
| **`D-B9.C2`** | `cierre#2` — las columnas del pie (P2) | aterriza en **0,940** (1920) y **0,884** (1440) | **LA REGLA NO SE PUEDE CUMPLIR ACÁ.** Su punto de llegada cae en `scrollY` **18.415** (1920) y **15.376** (1440), y el último píxel de scroll del documento es **18.360** y **15.300**: **55 px y 76 px después del final**. Las tres columnas quedarían al 87 % de su entrada, para siempre, sin un error en consola. Es un hecho de dónde cae el bloque en el documento —el Cierre es la última pantalla y el scroll se termina antes que él—, no del ancla. |

Y dos que **no** son defectos y se dicen para no contarlos dos veces:

- **`hero#0` y `hero#1`** cierran su rango en `scrollY` negativo: llegan a su estado final antes del
  primer píxel de scroll. Ya estaba declarado como aritmética en `Hero.tsx`.
- **`trabajos#1`** mide la `<section>` por diseño (`anclaje="seccion"`) y su rango arranca
  exactamente cuando la sección entra en cuadro. Su `op@centro` de 0 es un **artefacto de la
  métrica** —es el mínimo entre descendientes, y en una secuencia de tres planos siempre hay dos en
  cero— y no un defecto.

---

## §10 · EL PESO — el recibo, medido sobre dos builds del mismo árbol

`s5-peso` fue **lo único que llegó en rojo a la parada**, y la decisión de moverlo era del humano,
no mía. **Aprobada ahí, con el recibo de abajo**: la línea con nombre está puesta y el invariante
cierra en verde. El techo NO lo subí yo.

| | lane «crudo» | aire contra el techo de 61,95 KiB |
|---|---|---|
| sin los 13 `rango="ventana-visible"` (`E2E_DIST_DIR=.next-b9`) | **61,9 KiB** | **+0,06** |
| con los 13 (`.next`) | **62,2 KiB** | **−0,24** |

**La causa medida, byte por byte.** Los cinco chunks propios de `/v3` pasan de **65.111** a
**65.423 bytes**: **312 B exactos**, que son **13 × 24 B** del literal `rango:"ventana-visible",`
minificado, contados con `grep` sobre el chunk. Las dos cuentas coinciden a la unidad: **no hay
efecto de segundo orden del minificador.** (`docs/rediseno/outputs/b9/peso.json`.)

### ⚠️ LAS CINCO FORMAS QUE SE PROBARON PARA ACHICARLO, CADA UNA CON SU NÚMERO

**Ésta es la razón por la que se paga, y por eso queda escrita.** El déficit contra el techo viejo
era de **246 B**. El ahorro de cada forma está calculado sobre el mismo literal minificado que la
medición cuenta:

| forma | ahorro | lane resultante | ¿cierra? | qué cuesta |
|---|---|---|---|---|
| `rango="en-cuadro"` | **−52 B** | 62,15 KiB | **no** | nada, y no alcanza |
| `rango="cuadro"` | **−91 B** | 62,11 KiB | **no** | pierde la palabra: «cuadro» no dice que el rango salga de la ventana VISIBLE |
| prop booleana `enCuadro` | **−156 B** | 62,05 KiB | **no** | deja `'del-patron'` sin nombre — el tipo pierde la mitad de su vocabulario y el defecto deja de ser una opción declarada |
| no declararla en los 4 sitios donde es un no-op comprobable | **−96 B** | 62,10 KiB | **no** | deja el padrón de `s19-sincronia` con cuatro huecos sin motivo, que es lo que el padrón existe para no tener |
| un componente envoltorio `<BloqueEnCuadro>` | **~−250 B** | ~61,94 KiB | **sí, por ~0,01 KiB** | una **segunda forma de declarar un bloque** conviviendo con `Bloque`, las dos haciendo lo mismo con distinto nombre — y un margen de ~10 bytes que el próximo byte vuelve a romper |

**Sólo la quinta cierra, y por un margen de una decena de bytes.** Se descartó por lo que cuesta, no
por lo que ahorra: un sistema con dos maneras de declarar la misma cosa es exactamente la clase de
divergencia que `_contrato/forma.ts` documenta haber tenido que unificar una vez, y un techo con
0,01 KiB de aire no protege nada — el siguiente sprint lo rompe sin haber montado nada.

**La alternativa escrita:** no aplicar la regla. Cuesta las 17 instancias de §4 y el caso capturado
de §1.

**El reparto por dueño:** los 312 B son **enteros de B9**. Nada heredado, así que no hay una segunda
línea como la que B7 tuvo que partir.

**Aprobado en la parada.** La línea con nombre es `MONTAJE_DE_B9_KIB = 0.31` en
`_lib/__tests__/s5-presupuesto.ts`, sumada a `MONTAJES_DECLARADOS_KIB` — el mismo mecanismo con el
que B4-A montó 1,25 y B7 montó 0,55, y con la misma propiedad: **el techo viejo de 60 KiB sigue vivo
y resta cada montaje declarado**, así que un byte que crezca sin declararse sigue poniendo el rojo.
Con la línea puesta: `s5-peso` **17 afirmaciones, 0 fallas** — el lane entra en 62,26 con **0,07 KiB
de aire**, y restando los 2,26 de montajes con nombre vuelve a **59,9 contra el 60 original**.

---

## §11 · Lo verde, y con qué

| comprobación | resultado |
|---|---|
| `npx tsc --noEmit` | 0 errores |
| `npm run build` (primer plano, `CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`) | exit 0 |
| `npm run verificar` | 27 pasos, **0 con falla** · 127 invariantes permanentes en 24 suites |
| `npm run test:frontera` | 2 invariantes, **0 fallas** |
| `npm run test:s19-sincronia` (nuevo) | **80 afirmaciones, 0 fallas** |
| `npm run test:s5-peso` con el montaje aprobado | **17 afirmaciones, 0 fallas** — 62,26 de techo, **0,07 KiB de aire**, y 59,9 contra el 60 original al restar los montajes con nombre |
| `npx tsx scripts-b7/b-pin.ts` | **25 comprobaciones, 0 fallas** |

---

## §12 · LA NOTA DE MÉTODO — el padrón atrapó un error del propio autor

⚠️ **`s19-sincronia` se ganó su lugar durante el mismo sprint en que se escribió, y contra quien lo
escribió.**

Para medir el peso neto de la regla hubo que sacar los 13 `rango="ventana-visible"`, correr un build
aislado y volver a ponerlos. **Al restaurarlos, uno quedó afuera** —el titular de Por qué develOP,
`PorQueDevelop.tsx :: <Bloque patron="P1" className="pt-[var(--spacing-8)]">`—, porque el script de
restauración abortó a mitad de camino en ese archivo y escribió los otros.

El padrón lo encontró y lo nombró, con el archivo y el `<Bloque>` textual, **antes de que llegara a
ninguna medición**:

```
FALLA todo <Bloque> que no declara la regla está en el padrón de exclusiones con su motivo
      — obtenido ["src/app/v3/_secciones/por-que-develop/PorQueDevelop.tsx ::
                   <Bloque patron=\"P1\" className=\"pt-[var(--spacing-8)]\">"]
```

Sin él, ese bloque habría entrado a la tabla de «después» con su número viejo y la tabla habría
dicho la verdad sobre un árbol que no era el que se iba a commitear. **Un padrón que atrapa un error
del propio autor en el sprint en el que se escribió vale más que cualquier afirmación verde**: la
afirmación verde demuestra que el instrumento no se queja; ésta demuestra que sabe quejarse.

Y es la forma exacta que la regla 9 del repo pide —«ninguna comprobación verde por vacío, ni verde
por arnés»— llevada un paso más allá: no alcanza con que el instrumento tenga control positivo
contra una entrada fabricada. Éste corrió contra una entrada **real**, que nadie fabricó a propósito,
y la vio.
