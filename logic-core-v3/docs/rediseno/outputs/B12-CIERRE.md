# B12 — El último de la etapa

Trabajos como tiene que ser, el pie transparente, los rótulos afuera. Rama
`v3/cierre-etapa`, worktree `C:\v3-cierre-etapa`, dev server en el 3000.

> ⚠️ **§4 —el contenido de mentira y su llave— NO SE HIZO.** La PARADA 1 se
> cerró con las cinco decisiones del humano y la orden de commitear. Lo que
> sigue es §1, §2 y §3. **No se escribió una sola cifra falsa**, y la constante
> `CONTENIDO_INVENTADO` no existe todavía: el día que §4 arranque, arranca por
> ahí.

---

## 1 · Los rótulos, afuera de las ocho

El número (`01`…`08`) y el nombre en micro se fueron de las ocho.
`NumeroDeSeccion` y `EncabezadoDeSeccion` ya no existen; en su lugar quedan
`MarcaDeSeccion` y `CabeceraDeSeccion` (`_secciones/_contrato/Rotulo.tsx`).

**Dos cosas NO se fueron, y cada una con su razón:**

| qué se queda | por qué, con el número |
|---|---|
| El **prefijo de la marca** (el cuadrado de `--color-acento`) | Era la única pieza que las ocho compartían. `s17-marca` §5 cuenta *«al menos una por cada una de las 8 secciones»*: borrarlo con el número sacaba la marca de las ocho secciones del sitio. |
| La **columna lateral de 140 px** | Es la que sostiene el cierre estructural de B11 (c7–c12 en Quiénes somos, c3–c5 la foto). Sacarla corría la composición 140 px + canaleta y **reabría D-B8.1, D-B8.2 y D-B8.6** sin que nada se quejara. |

**El slogan del Hero se queda** («Ingeniería para negocios reales.»): ocupa el
registro del rótulo pero es copy aprobado (`[verdad]`), no un nombre de sección.
Confirmado por el humano en la PARADA 1.

### 1.1 · El censo, antes y después

`scripts-b12/censo.ts`, paso 120 px, origen 3000 — el mismo instrumento de B2,
B9 y B11.

| | antes | después | vara de B9 |
|---|---:|---:|---:|
| hueco máximo @1920 | 1,33 | **1,33** | 1,33 |
| hueco máximo @1440 | 1,20 | **1,20** | 1,20 |
| acontecimientos @1920 / @1440 | 21 / 17 | 21 / 17 | — |
| piezas | 193 / 182 | 194 / 183 | — |

**No se movió un centésimo**, ni con los rótulos afuera, ni con la portada de
Trabajos, ni con la banda del pie. El censo se corrió tres veces por eso.

### 1.2 · Los landmarks siguen con nombre

`s10-acceso` §5: **11 landmarks, 8 `region`, ningún `aria-labelledby` colgado.**
El nombre accesible ya salía del `h*` vía `idDelTitularDeSeccion`, no del rótulo,
así que sacarlo no dejó ninguna sección sin nombre. El título toma ese rol
porque siempre lo tuvo.

### 1.3 · El contraste de los títulos, las ocho, método del glifo

`scripts-b12/bloques.ts` (importa la máscara, los lectores y el evaluador de
`scripts-b8/`), a 1920 y 1440. **`sobreElLogo` = 0,0 % en todos los títulos.**
El título subió a donde estaba el rótulo y **no cayó sobre el logo en ninguna de
las ocho**: el cierre estructural de B11 aguanta.

Lo que sigue bajo AA en Números y Por qué develOP es D-B8.1 y D-B8.3, abiertas
antes de este bloque y de luz, no de posición.

### 1.4 · Las afirmaciones reescritas (regla 15)

Ninguna se borró ni se aflojó; las ocho se dan vuelta contra la propiedad nueva,
y la cadena del rótulo se conserva para afirmar su AUSENCIA sin escribirla a
mano (`ROTULO_DE_SECCION_RETIRADO`).

`numeros.invariant` (el rótulo posicionado → *no está*, con el mismo lector y su
control positivo) · `s8-cierre` · `s7-por-que-develop` · `s6-tu-panel` ·
`s6-servicios` · `quienes-somos.invariant` · `trabajos.invariant` ·
`s6-contraste`.

---

## 2 · El pie, transparente de verdad

`[data-pieza="pie"]` ya no pinta `var(--color-fondo)`. Ésa era la causa —B8 la
había diagnosticado con `elementsFromPoint` y la había dejado como decisión de
dirección— y sacarla destapó lo que tapaba: **la sala al final es CLARA**
(gris 145,5 · luminancia 0,303 en la pose) **y con varianza**: piso brillante y
barras de celosía oscuras.

### 2.1 · Las cuatro variantes, medidas en la pose, a 1920 y 1440

| estado | @1920 fallan | peor | @1440 fallan | peor |
|---|---:|---:|---:|---:|
| pie con relleno (B8/B11) | 0 de 26 | 6,44 | 0 de 25 | 6,44 |
| sin relleno, tinta clara (`oscuro-transparente`) | **24 de 24** | 1,00 | 23 de 23 | 1,02 |
| **+ tinta dada vuelta** (`papel-transparente`) | 12 de 24 | 1,04 | 10 de 23 | 1,01 |
| **+ formulario con fondo sólido + marcadores a plena** | 8 de 24 | 2,45 | 8 de 23 | 2,49 |
| **+ la banda local del pie** | **4 de 24** | **2,49** | **2 de 23** | **2,66** |

`papel-opaco` —el pie pintando papel— da 0 de 24 y **no se usa**: es lo contrario
de lo que se pidió.

### 2.2 · La palanca híbrida, que no estaba en la lista

La decidió el humano en la PARADA 1: *«un velo LOCAL en la banda del pie, no en
la sección entera. La sala se sigue viendo arriba —donde está el titular de
cierre, que es donde el gesto de la cámara alejándose se lee— y el pie tiene
fondo donde tiene el texto chico.»*

La sección queda partida en dos registros:

- **Arriba, la sala entera.** El titular en `titulo-xl`, sobre la escena.
- **Abajo, fondo donde hay texto chico.** El CTA, las tres columnas y la línea
  de cierre: **20 de los 24 bloques**, todos entre 10 y 15 px, todos en
  **17,60:1** con 0 px bajo AA. El formulario, con su fondo propio, en 6,43:1.

**El CTA entró a la banda por medición, no por simetría:** con la banda
arrancando en las columnas daba 3,50–4,18:1 contra los 4,5 que pide, y flotaba
entre corridas (el ruido del revelado que B8 declaró). Adentro da 17,60:1.

**Tres cosas que la banda tuvo que resolver, y están medidas:**

1. **No mover el anclaje.** Con el relleno suelto el Cierre pasó de 900 px a
   **952,3** a 1440 y el documento de 16.200 a 16.252 —lo cazó
   `verificarQueLaPaginaEstaEntera`—. Una sección que no mide un número entero
   de pantallas estira el mapeo de `pantallaDeScroll`. Con `margin-block` igual
   y opuesto al relleno, la caja de margen mide lo mismo que el contenido: la
   sección vuelve a **900 / 1080** y el documento a **16.200 / 19.440**.
2. **Llegar al borde de abajo.** Con los dos lados en `--spacing-8` quedaba una
   franja de sala de 48 px debajo de la línea de cierre. El margen negativo de
   abajo es el relleno ENTERO del pie.
3. **No pagar una frontera de módulo.** Es un `<div>` y no un componente:
   envolverlo en uno con `props` y `cn()` cuesta **81 B** de carga inicial,
   medidos A/B. Lo que se hizo en cambio fue acortar dos docblocks heredados de
   B1 sin perder una sola cifra.

### 2.3 · Lo que queda: `D-B12.2`

**4 bloques a 1920 (2,49 · 2,49 · 2,50 · 2,66) y 2 a 1440 (2,66 · 2,96), contra
los 3:1 del texto grande. Los seis son las líneas del titular.** Bajo AA quedan
28–79 px de 2.940–4.732 a 1920 y 1–15 px de 4.442–4.732 a 1440: **entre el
0,02 % y el 3 % del glifo**. `sobreElLogo` = 0,0 % en los seis: la causa es la
varianza de la celosía, no el logo.

Está declarada en `deudas-b12.ts` con sus dos salidas medidas (bajar la banda por
encima del titular, o la luz) y con la que NO sirve (la tinta: las dos están
medidas y las dos fallan).

---

## 3 · Trabajos

### 3.1 · El negro, por la luz

`NIVEL_DE_LA_NOCHE` **0,08 → 0,04**; el sol pasa de 2,70° a **1,35°**.

| | antes (B8) | después (B12) |
|---|---:|---:|
| gris medio de la sala en el pin | 36–48 | **17,1–21,9** |
| luminancia media | 0,020–0,031 | **0,0094–0,0119** |

La referencia tiene **0,0010** en su sección de proyectos. **Se eligió 0,04 y no
0,02**: a 0,67° la punta de la sombra del logo cae a profundidad 693 del mapa,
`SHADOW_FAR` tendría que ir a 720 y el `SHADOW_BIAS` equivaldría a 0,21 unidades
de mundo **a pleno sol**, que es donde la sombra se ve. Con 0,04 el FAR va a
**380** y el bias se re-escala: ahora se declara **en mundo** (−0,0564, el de B8)
y el normalizado se deriva del slab, para que la próxima vez no haya que
acordarse.

### 3.2 · Las partículas, en blanco

`BLANCO_DE_LA_NOCHE` **0,25 → 1**. Censo con el instrumento de B8, que es el que
midió la referencia:

| | por pantalla | ⌀ mediana | pico mediano | fondo |
|---|---:|---:|---:|---:|
| B8 (0,25) @1440 | 799–847 | 2,99–3,19 px | 117–119 | 39–51 |
| **B12 (1,0) @1920** | **634–1.239** | **3,39–4,22 px** | **217** | **16–21** |
| referencia @1440 | ≈600 | 1,6 px | 47 | 0,6 |

**Cuesta `D-B12.1`**, declarada: los nombres de los proyectos caen de
3,62–4,75:1 a **1,27–1,42:1** (2–23 px por bloque, el 1 % al 5 % del glifo),
porque el peor píxel de cada glifo cae sobre una mota. **Volver a 0,25 es cambiar
el número de la constante y nada más.** Lo decidió el humano con la cifra a la
vista.

### 3.3 · Las dos transiciones

`scripts-b12/transiciones.ts`, de a 1/8 de pantalla entre la 6,5 y la 11,5, a
1920 — el mismo paso con el que se midió la salida de la referencia.

**La gota (entrada).** El mecanismo de B3 —función pura + `mask-image`— con la
forma cambiada: `radial-gradient` en vez de `linear-gradient`. La pluma del borde
es `REVELADO_FRACCION` (0,125), el mismo octavo de B3.

| pantalla | radio de la gota | gris del cuadro |
|---:|---|---:|
| 7,000 | −12,5 → 0 % (nada) | 221,0 |
| 7,500 | 43,8 → 56,3 % | 155,7 |
| 8,000 | 100 → 112,5 % (cubre) | 109,2 |
| 8,125 | α 0,44 (se disuelve) | 35,9 |
| 8,250 | oculta | **24,5** |

**Una pantalla de scroll de expansión y 0,25 más de disolución.** Al ritmo que
B3 midió: **1.250 ms a 1 pantalla/s y 333 ms a 3,75**. La referencia resuelve la
suya con un `ShaderMaterial` de 1.111 ms.

**La vuelta (salida).** El arco gana una parada: `VUELTA` es la última pantalla
del pin —la única en la que Trabajos se va y Servicios sube— y llega a
`RIM_NIGHT_LEVEL` (0,34), la frontera de la noche que el sistema ya declaraba.

| | nuestra | la referencia |
|---|---|---|
| duración | 1 pantalla | 1 pantalla |
| gris | **27 → 243,5** | **26,4 → 246,5** |

Medido en la referencia con una navegación (`scripts-b12/referencia-salida.ts`),
en la costura entre sus pantallas 12 y 13, con una pantalla a cada lado.

### 3.4 · Centrado, y la info con los planos

El marco clavado arriba desapareció. El bloque de P7 es la pantalla entera y el
plano se centra con **la misma medida de 2 de 3 columnas** que B1 midió,
reconstruida con los tokens de la grilla: una celda de 2 en una grilla de 3 no
tiene posición centrada.

El título y la bajada son la **portada**: el plano de **índice −1** del mismo
reparto (`localDelPlano(progreso, -1)`). Ya está compuesta cuando la sección
asoma y se va por delante de la cámara cruzándose con la llegada del primer
proyecto, que es el cruce que la meseta de B4-A ya garantiza entre consecutivos.
**No es un cuarto paso**: `pasosDeLaSecuencia` sigue en 3 y el alto de la sección
no se mueve.

Consecuencia medida: la sección pasa de consumir **dos patrones a uno**. El P2
del marco se fue con el marco, y con él se cierra `D-B9.T1` —sin arreglarse:
se fue el bloque que la llevaba—.

### 3.5 · Lo calibrado, verificado

| qué | instrumento | resultado |
|---|---|---|
| **La meseta de B4-A** | `s5-trabajos` §16 | 141 afirmaciones, 0 fallas. Nunca los tres invisibles. |
| **El lente de P7** | `scripts-b12/lente.ts` | `perspective 1712,66px` y origen `960px 540px` = centro exacto del viewport, en las tres posiciones del pin. |
| **El techo de velocidad de B2 (4,6531)** | `s16-techo` | 16 afirmaciones, 0 fallas. |
| **Las seis costuras del revelado** | `scripts-b12/lente.ts` | idénticas a B8: tres sin máscara, `sale` en trabajos→servicios, `entra` en tu-panel→por-que-develop. |
| **Anclaje, progreso, rangos, preloader, `scene-camera.ts`, `_lib/motion/`** | `git diff --stat` | vacío. |
| **Los altos de las ocho** | lectura del DOM | múltiplos exactos de la pantalla a 1440 y 1920; documento en 16.200 / 19.440. |

---

## 4 · El peso — la línea más grande que este techo llevó

**+1,36 KiB**, o sea **1.384,4 B**, medidos A/B entre builds del mismo árbol y el
mismo entorno, apagando cada pieza sólo durante la medición y restaurándola byte
a byte (SHA-1 de `Trabajos.tsx` antes y después: `79484340…`).

| renglón | bytes | alternativa |
|---|---:|---|
| **La gota** | **+1.304** | Se pierde la transición de entrada. Apagarla son dos líneas y devuelve 95,6 B de aire. |
| **La banda del pie** | **+176** | Se pierden 16 de los 20 bloques que hoy están en 17,60:1. |
| **El resto del bloque, NETO** | **−87** | Ninguna: es una devolución. |

**Lo que se paga son las DOS piezas nuevas, y las dos las pidió el humano por su
nombre.** §1, §2, §3.1 y §3.3 juntos DEVUELVEN 87 B: sacar dos piezas de texto de
las ocho secciones pesa menos que lo que la portada y el centrado agregan.

**Dos mediciones descartadas, publicadas igual (regla 12):**

- Escribir la suscripción a mano (`useEffect` + `progreso.on`) en vez de
  `useMotionValueEvent`: **40 B MÁS**. La hipótesis de que el hook metía un
  módulo nuevo era falsa.
- Envolver la banda en un componente con `props` y `cn()`: **81 B MÁS**. Y no es
  la frontera de archivo —mudarlo a `chrome/Pie.tsx`, un módulo que ya estaba en
  el grafo, devolvió lo mismo—: es la función.

⚠️ **Autorizado en 1,28 KiB y declarado en 1,36.** El humano subió el techo en la
PARADA 1 con la cifra que había ahí (la gota sola). En la misma parada pidió
probar la banda y dejarla si cerraba: cerró, y son 176 B más. La diferencia no se
esconde en el redondeo ni en el heredado.

⚠️ La suma de los renglones da 1.393 B y la medición del árbol final da 1.384,4.
Cada A/B se midió sobre un árbol intermedio distinto, así que **la suma es un
modelo del reparto y la cifra que manda es la del árbol que se commitea**. Los
8,6 B de diferencia se publican sin apropiárselos.

---

## 5 · Las siete afirmaciones reescritas en `/probe-escena/__tests__`

La regla 3 protege esa carpeta y la regla 4 autoriza el arco en el tramo de
Trabajos. Cuando las dos se cruzan manda la regla 15: **la afirmación cuya
decisión cambió se reescribe contra la propiedad nueva, no se borra ni se
afloja.** El humano lo confirmó en la PARADA 1 y pidió que cada una diga qué
custodiaba antes. Las siete lo dicen.

| archivo | qué custodiaba | qué afirma ahora |
|---|---|---|
| `s11-pantalla` §2 | el batido entre 2 y 5 bandas en las CUATRO poses | las tres con luz igual, **y en la noche NO hay batido** — con su control positivo |
| `s11-proyeccion` §1 | el rayo cruza las dos capas en TODO el arco | cruza las dos **por encima del umbral**, y sólo la cercana debajo |
| `s11-proyeccion` §1b | el alcance en la noche > 40 % | **cero moiré de piso** en la noche, con igualdad exacta |
| `s11-proyeccion` §2 | el batido en cuatro muestras | las tres con luz, **y exactamente una sin batido** |
| `s12-tension` §1 | `< 60` para Números y Trabajos | `< 60` para Números **y la VUELTA en Trabajos**, con `levelAt(0,625) === RIM_NIGHT_LEVEL` |
| `s12-tension` §2 | las CUATRO poses devuelven batido | las de luz igual, **y la de la noche es exactamente una** |
| `s12-barrido` | la portadora de la noche es una fracción | **no hay portadora**, con igualdad exacta |
| `s10-escena` | la sombra más larga en el literal `0.5` | la más larga **en la ventana `NOCHE`**, derivada del arco |

**El umbral, que es el hallazgo:** `tan(elev) ≥ (MOIRE_FAR_BOTTOM − FLOOR_Y) /
MOIRE_FAR_RADIUS` = (−2,5 − (−4,304)) / 44, o sea **elevación ≥ 2,348°**, que por
la ley `level = sin(elev)/sin(36°)` es **nivel ≥ 0,0697**. El 0,08 de B8 estaba a
un escalón del borde. Está declarado como `D-B12.3`: sobre una sala de 11 de gris
no hay piso iluminado donde un moiré pudiera verse, pero **perder en silencio una
propiedad que el sistema custodiaba sería peor que perderla escrita**.

---

## 6 · Los gates

| gate | resultado |
|---|---|
| `npm run verificar` | **28 pasos, 0 con falla** |
| `npm run build` (primer plano, `CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`, Chrome cerrado) | exit 0 |
| `npm run test:frontera` | 2 invariantes, 0 fallas |
| `npx tsc --noEmit` | limpio |
| `npx prisma migrate status` | *Database schema is up to date* |

---

## 7 · Lo que frenó

1. **§4 no se hizo.** El contenido de mentira, la llave `CONTENIDO_INVENTADO`, la
   marca en pantalla, la comprobación que falla en producción y los placeholders
   de foto quedan sin arrancar. La PARADA 1 se cerró con la orden de commitear.
2. **`D-B12.2`** — el titular del Cierre sobre la sala: 4 bloques a 1920 y 2 a
   1440. Queda declarada por decisión del humano: es donde quiere que la sala se
   vea.
3. **`D-B12.1`** — las motas blancas sobre el nombre de los proyectos. Queda
   declarada; volver a 0,25 es un número.
4. **`D-B12.3`** — el moiré del piso en la noche, con su umbral derivado.
5. **La banda del pie no sangra arriba de 1920.** Queda del ancho del contenido
   más los dos rellenos. Sangrarla de verdad pediría sacarla del `Envoltorio`,
   que es de `chrome/Pie.tsx` y lo comparten la galería y el arnés de piezas.
6. **El instrumento lee el cuadro entero como «logo» en la noche.**
   `siluetaMasGrande` toma todo lo que está bajo 60 de gris, y con la sala en 11
   eso es el cuadro. El `sobreElLogo` de 93–100 % que Trabajos publica **no es
   una atribución**: está declarado en `D-B12.1`.
7. **La trampa del módulo fantasma**, en `MEDICION-NAVEGADOR.md` §6: `./gota`
   resolvía a `Gota.tsx` por la caja insensible de Windows, con `tsc` en verde,
   la página en 200 y el censo en cero. El archivo se llama `CapaDeLaGota.tsx`
   por eso.
