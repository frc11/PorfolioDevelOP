# B12 — El último de la etapa

Trabajos como tiene que ser, el pie transparente, los rótulos afuera, y el sitio
poblado detrás de una llave. Rama `v3/cierre-etapa`, worktree
`C:\v3-cierre-etapa`, dev server en el 3000.

> ⚠️ **EL SITIO TIENE CIFRAS INVENTADAS ADENTRO, Y NO SE PUEDE PUBLICAR.**
> `CONTENIDO_INVENTADO` está en `true` (`_secciones/_contrato/llave.ts`) y
> `npm run build` **falla** mientras lo esté. Veinte casillas de contenido falso,
> todas declaradas en un archivo, todas con el marcador al que vuelven. Apagar la
> llave es cambiar un token: vuelven `[CIFRA]`, `[MÉTRICA]` y `[TESTIMONIO]` en
> las ocho, la franja de aviso desaparece y el build pasa. Está en §6.
>
> Las secciones §1 a §5 son las que se cerraron en la PARADA 1, con las cinco
> decisiones del humano.

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

## 6 · El contenido de mentira, y la llave que lo apaga

> *«develOP tiene deuda registrada por cifras fabricadas y esto las mete a
> propósito.»*

### 6.1 · La llave: qué es, y las cuatro propiedades

**`CONTENIDO_INVENTADO`**, en `_secciones/_contrato/llave.ts`. El módulo **exporta
esa constante y nada más** y **no importa nada**: apagar todo el contenido
inventado del sitio es cambiar un token en un archivo que no hace otra cosa.

| propiedad que pide la instrucción | dónde vive | cómo se comprueba |
|---|---|---|
| una constante en su módulo propio | `_contrato/llave.ts` | `s21-llave` §1 — exporta 1 símbolo, importa 0 |
| todo lo inventado detrás de ella | `_contrato/inventado.ts`, 20 casillas | `s21-llave` §2–§4 |
| apagarla devuelve los marcadores | `conLlave(invento, llave)` | `s21-llave` §2 y §5, **las dos ramas en la misma corrida** |
| una marca visible en pantalla | `_contrato/MarcaDeLaLlave.tsx` | `s21-llave` §7 — prendida se ve, apagada **no existe** |
| el build de producción FALLA | `scripts/llave-contenido-inventado.mjs`, enganchado como `prebuild` | `s21-llave` §8 — **diez casos**, con el árbol real |

**El tipo está anotado `boolean` y no inferido**, y no es cosmético: con el
literal `true`, TypeScript estrecha cada ternario a una rama y el invariante que
comprueba **las dos** no compilaría.

**No es una variable de entorno**, y las dos razones son del sistema: un
`process.env` que no empiece con `NEXT_PUBLIC_` llega al cliente como `undefined`
mientras el servidor lee el valor de verdad —desajuste de hidratación en la
sección de Números—, y una llave de ambiente no se lee en el diff.

### 6.2 · La comprobación de lanzamiento, con sus diez casos

`npm run build` corre `prebuild` solo, acá y en el deploy: el comando que
`netlify.toml` declara termina en `npm run build`. **Medido en primer plano, con
Chrome cerrado:**

```
$ npm run build                      →  exit 1
  BUILD DE PRODUCCION CON CONTENIDO INVENTADO ADENTRO. NO SE PUBLICA.
$ MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build   →  exit 0, con su cartel
```

| # | caso | esperado | medido |
|---|---|---|---|
| 1 | la llave APAGADA | pasa | exit 0 |
| 2 | la llave PRENDIDA | **falla** | exit 1 |
| 3 | ⚠️ **sin la constante** — renombrada, borrada o el archivo movido | **falla** | exit 1 |
| 4 | con la constante DUPLICADA (dos declaraciones) | **falla** | exit 1 |
| 5 | declarada sólo adentro de un comentario | **falla** | exit 1 |
| 6 | el archivo de la llave no existe | **falla** | exit 1 |
| 7 | prendida + `MEDIR_CON_LA_LLAVE_PRENDIDA=1`, en una máquina de desarrollo | pasa, con cartel | exit 0 |
| 8 | ⚠️ **prendida + la salida + `NETLIFY`** | **falla** | exit 1 |
| 9 | ⚠️ **prendida + la salida + `VERCEL`** | **falla** | exit 1 |
| 10 | ⚠️ **prendida + la salida + `CI`** | **falla** | exit 1 |

Los diez corren en `s21-llave` §8, cada uno lanzando el guardián de verdad en un
proceso aparte, con un ambiente armado desde cero —`PATH` y lo que el caso
agregue— para que la máquina que corre esto no se mida a sí misma. Y el
undécimo compara contra el ÁRBOL REAL: el guardián y TypeScript tienen que decir
lo mismo sobre la llave que hay hoy.

**⚠️ Los dos casos que convierten esto en una llave y no en un recordatorio:**

**El 3 — un renombre la hace FALLAR.** El guardián no puede importar el módulo
—es TypeScript—, así que lee el fuente y busca la constante. Eso sería una
segunda copia peligrosa si el modo de falla fuera *«no la encuentro y sigo»*: la
regla es la contraria. **Si no la encuentra, da rojo.** Un renombre, un borrado o
un archivo movido no lo dejan pasar en silencio, y la única forma de que este
script pase es que alguien haya escrito `false`. (El script se comprueba a sí
mismo además: si su expresión dejara de nombrar `CONTENIDO_INVENTADO`, muere
antes de mirar nada.)

**El 8, 9 y 10 — en un deploy la salida de emergencia NO EXISTE.** Con `NETLIFY`,
`VERCEL` o `CI` en el ambiente, la llave prendida falla y **no hay variable que
lo evite**. La salida existe por una razón acotada y escrita —sin un build con la
llave prendida no hay forma de medir cuánto pesa— y vive sólo en una máquina de
desarrollo, gritando en la salida del build. Para publicar esto habría que
editar `netlify.toml`, que es un archivo commiteado y revisado por una persona.
Eso es un mecanismo; acordarse no lo es.

### 6.3 · ⚠️ El escáner NO se aflojó, y así se prueba

Los detectores de `escaneo.ts` y de `marcadores.ts` **no cambiaron una sola
condición**. Lo único que cambió es la ENTRADA: antes de escanear, las mentiras
declaradas se devuelven a su marcador, o sea que **lo que se escanea es el sitio
tal como queda cuando la llave se apaga** (`escanearLoReal`, `marcadoresRealesEn`,
`_contrato/restauracion.ts`).

De ahí sale la garantía, y está afirmada con control positivo:

- **la resta es una lista cerrada de literales exactos, no una clase de patrón.**
  Con la resta puesta, el escáner **sigue viendo la deuda real de develOP**
  (`+340% en consultas`, `86% más económico`, `2+ años`): 9 hallazgos;
- y sigue viendo **una cifra que nadie declaró** (`Entregamos 47 proyectos el año
  pasado`);
- y hay un **segundo pase, sobre el contenido CRUDO**, que impide que esto sea
  circular: `escritoAMano()` filtra los hallazgos que la restauración NO cambia.
  Un `12` tecleado en un `contenido.ts` no sale de ninguna casilla declarada, así
  que sobrevive al filtro y pone el invariante en rojo — igual que antes de §4.

**Dos trampas de la restauración, las dos medidas sobre este home:**

1. **Sobre el HTML crudo, la casilla que vale `4` se come el `4` de un `gap-4`.**
   Medido: cinco `[CIFRA]` esperados contra **nueve** encontrados.
2. **Restaurando nodo por nodo no aparecen las frases que Servicios parte en un
   `<span>` por palabra.** Medido: el censo de `s10-acceso` devolvía **34**
   marcadores donde hay **40**, y los seis que faltaban eran los tres párrafos de
   Servicios.

Las dos se cierran igual: el emparejamiento va contra el **texto visible** —los
nodos de texto concatenados, sin una etiqueta adentro— y la escritura vuelve a
los nodos de texto, dejando las etiquetas intactas. Y la sustitución respeta el
**límite de palabra**: el `4` de «14» no es la casilla que vale `4`.

### 6.4 · Qué se inventó: las veinte casillas

| sección | casillas | marcador que vuelve |
|---|---|---|
| Números | `23` · `9` · `4` · `6 h` · `31` | `[CIFRA]` ×5 |
| Trabajos | de 3 a 14 consultas por semana · de 2 a 11 visitas agendadas · de 40 a 260 pedidos al mes | `[MÉTRICA]` ×3 |
| Quiénes somos | qué hace Franco y qué hace Valentino en un proyecto | `[TEXTO]` ×2 |
| Servicios | la frase de prueba de los tres frentes | `[MÉTRICA]` + `[CIFRA]` ×3 |
| Tu panel | «la última semana al día, 2.140 consultas acumuladas» · «Mirar las 34 consultas de la semana…» | `[MÉTRICA]` + `[CIFRA]` |
| Por qué develOP | «entre **nueve** negocios» · «**Un mes** más rápido…» · la cita · el cuerpo · la firma | `[CIFRA]` `[MÉTRICA]` `[TESTIMONIO]` `[NOMBRE]` |

**Las veinte llegan a la pantalla** —ninguna casilla muerta— y **los 24
marcadores vuelven** al apagar, sección por sección. Afirmado en `s21-llave` §5.

**El nombre del testimonio no es un nombre.** Dice `Persona Inventada ·
testimonio de muestra`. La instrucción pide *«un nombre inventado que no pueda
confundirse con una persona real»*, y cualquier nombre rioplatense plausible **es
el nombre de alguien**: escribirlo abajo de una cita inventada le pone palabras
en la boca a una persona que existe. Éste tiene el largo y el lugar de una firma
—la composición se juzga igual— y no se puede leer como alguien.

### 6.5 · ⚠️ LAS CUATRO COSAS QUE NO SE INVENTARON, Y POR QUÉ

Con la llave prendida hay veinte casillas llenas. **Estas cuatro quedaron
vacías a propósito**, y ninguna es un olvido: cada una es una decisión, con su
razón escrita en `_contrato/inventado.ts` al lado de la lista.

**1 · ⚠️ EL CASO DE REFERENCIA DE SERVICIOS** — `[TESTIMONIO]` ×3, uno por
frente. **Es la que más importa.** Los tres clientes son REALES: Esquina, El
Garage y Banú. Elegir cuál de ellos dio el caso **es un hecho inventado sobre
alguien que existe**, y eso es peor que una cifra inventada — una cifra falsa la
desmiente una medición, un hecho falso sobre un cliente lo desmiente el cliente.
La línea de caso es la misma en los tres a propósito y ofrece los tres nombres
verdaderos *«con el cliente que corresponda»*: declara el hueco y deja la
decisión donde va, que es comercial y no de este archivo. **El propio archivo ya
lo decía antes de §4, y §4 no lo tocó.**

Es además la lección que este lane ya pagó: `Matsu Automotores` estuvo publicado
como cliente durante cinco revisiones en verde, porque un nombre propio no lleva
dígitos, no lleva símbolo y no es un precio — **el escáner cuida las cifras; los
hechos no los cuidaba nadie.**

**2 · LOS PRECIOS.** No están cerrados y no se inventan ni de ejemplo.
`preciosEncontrados` no admite lista blanca —ninguna, ni declarada— y §4 no
cambió eso. Un precio inventado en una pantalla se convierte en la expectativa
de alguien.

**3 · LOS DESTINOS DEL PIE** — `[ENLACE]`, `[FECHA]`, `[NOMBRE]`. Un enlace
falso **se puede clickear**: no es una composición que se juzga mirando, es una
acción que falla. Una dirección de contacto inventada es peor todavía: manda un
mensaje a ningún lado.

**4 · EL VIDEO DE SERVICIOS.** Uno de relleno que se reproduce se leería como el
recorrido definitivo. Entra el PÓSTER —que es lo que ocupa la caja mientras el
video no arranca, con su medida y su peso— y no el video.

Y una quinta que no es una casilla: **la prosa mejorada no vive detrás de la
llave.** Un párrafo sin cifras no afirma un hecho falso, y lo provisional que
tiene ya está declarado en el `PEDIDO` de cada sección con su ruta y su formato.
Además **no tiene marcador al que volver**: una casilla detrás de la llave sin
marcador sería texto que DESAPARECE al apagar, y eso no es «devolver los
marcadores».

> ### ⚠️ EL CENSO DE MARCADORES ANUNCIADOS SIGUE EN **40**
>
> Es la misma cifra que antes de §4, y es lo único que impide leer mal el sitio
> poblado: **no se cerró un solo pedido. Se taparon 24 y vuelven todos.**
>
> Un pedido se cierra cuando llega el dato real —como pasó con las tres capturas
> de Trabajos, que bajaron el censo de 43 a 40— y esa cifra tiene que bajar por
> eso y nunca porque alguien prendió una llave. Por eso `s10-acceso` cuenta sobre
> el marcado RESTAURADO: contarlos sobre el crudo daría **16** y se leería como
> «se cerraron 24 pedidos», que es exactamente lo contrario de la verdad.

**Lo que sigue siendo verdad y se escribe derecho:** los tres clientes, las dos
personas del equipo, Tucumán, y qué hace develOP.

### 6.6 · Las fotos: placeholders propios, con peso y con relación

**Ninguna imagen de terceros** (regla 6). Los tres archivos se **generan** con
`scripts-b12/placeholders.ts` —PNG de 8 bits en **escala de grises**, escrito a
mano con `zlib`, sin una dependencia nueva— y `s21-fotos` los **regenera en
memoria y los compara byte a byte**: si alguien reemplazara uno por una foto
bajada de algún lado, el sha1 no coincide.

| archivo | medida | peso | quién lo declara |
|---|---|---|---|
| `public/placeholders/equipo.png` | 1800 × 1200 (3:2) | 355,0 KiB | `GEOMETRIA.foto` de Quiénes somos |
| `public/placeholders/panel.png` | 1920 × 1080 (16:9) | 339,4 KiB | `CAPTURA` de Tu panel |
| `public/placeholders/poster.png` | 1920 × 1080 (16:9) | 339,4 KiB | el medio de Servicios |

Las tres capturas **reales** de Trabajos, para comparar: 166,5 · 21,8 · 95,7 KiB
(webp, ya optimizadas).

- **Sin color, y por FORMATO:** tipo de color 0, un canal. No es que no se haya
  usado color: **el formato no tiene dónde ponerlo**. Se lee de la cabecera.
- **El peso sale de un grano determinista** con semilla por archivo — el rayado
  solo comprime a nada, y sin peso el placeholder no dice nada sobre cómo carga
  la página. La semilla no es cosmética: sin ella, el panel y el póster —los dos
  de 1920×1080— salían con el **mismo sha1**.
- ⚠️ **Y se ven como placeholders:** rayado diagonal, filete y cruz de encuadre,
  con el **marcador escrito ENCIMA en texto de verdad** (`[FOTO DEL EQUIPO]`,
  `[CAPTURA DEL PANEL]`, `[VIDEO]` + `[PÓSTER]`). No se quema en el píxel.
- **El `alt` de la imagen va VACÍO** y el nombre accesible lo da el marcador:
  anunciar *«Franco y Valentino, juntos, en el lugar donde trabajan»* sobre un
  rayado sería contarle a quien no ve una foto que no existe.

El marco de medio tiene ahora **tres estados** —`fuente: null`, `fuente` a secas,
y `fuente` + `provisional`— y el tercero monta la `<Imagen>` de verdad, con su
`sizes` y su relación de aspecto declarada en el marcado.

### 6.7 · El peso de la llave — y una corrección que hay que leer

**4.303 B**, medidos A/B entre builds del MISMO árbol, apagando cada pieza y
restaurándola byte a byte (SHA-1 antes y después de los seis archivos).

| pieza | bytes | cómo se midió |
|---|---:|---|
| LA MAQUINARIA — las 20 casillas con sus dos caras, `conLlave`, los 20 usos | **2.422** | por diferencia |
| EL TEXTO INVENTADO — las 20 cadenas de `mentira` | **1.064** | vaciando las veinte: 71.325 → 70.261 B |
| LOS PLACEHOLDERS — el tercer estado del marco y sus tres usos | **817** | sacando la rama: 71.325 → 70.508 B |
| LA MARCA EN PANTALLA | **0** | sacándola del layout: 71.325 → 71.325 B |

⚠️ **La marca sale CERO y no es un redondeo: es un componente de SERVIDOR.** El
aviso viaja en el HTML y su código no llega al navegador. La propiedad más
visible de §4 es la más barata.

⚠️ **Y hay una corrección de la instrucción que sale de esta medición: apagar la
llave devuelve 0 BYTES.** Tiene sección propia — **§7**, abajo.

**El techo del lane no se movió.** `PESO_DE_LA_LLAVE_KIB = 4,20` va en su propia
línea, **fuera de `MONTAJES_DECLARADOS_KIB`**, y `s5-peso` la resta aparte y lo
dice en voz alta:

```
LA LLAVE (B12 §4): 4.2 KiB de contenido INVENTADO se restan APARTE del techo
  68,0 KiB escritos · 63,8 KiB sin el andamio · techo 63,76 · 6,0 B de aire
```

El techo del lane sigue en **63,76 KiB** —el mismo que B12 §1–§3 dejó, afirmado
al centésimo— y el de 60 sigue vigilando todo lo que no está declarado. Los
1,03 MiB de los tres PNG **no entran acá**: `s5-peso` mide lo que el lane
ESCRIBE en JS, y una imagen de `public/` no es un chunk. Se publican arriba.

⚠️ La suma del recibo (4.303 B) y la medición del árbol final (4.294,8 B) se
llevan **8,2 B**, que **se publican y no se apropian** — cada A/B se midió
apagando una pieza distinta, así que la suma es un MODELO y la cifra que manda es
la del árbol que se commitea.

### 6.8 · Las capturas de las ocho, con la llave y sin ella

`scripts-b12/fotos-de-la-llave.ts`, a 1440 y 1920, al medio de cada panel —la
primera pantalla de una sección de cuatro es escena y ahí no hay ninguna cifra
que mirar—. **32 capturas**, `con-llave-*` y `sin-llave-*` en `capturas/b12/`.

Es el «antes y después» que §4 puede producir sin romper la regla 1: reconstruir
el árbol de HEAD pediría un `checkout`. Apagar la llave es editar un token y
volver a editarlo, con el SHA-1 del archivo antes y después (`4d63fb2a…`).

Lo que se ve en el par, sección por sección: con la llave, `9 CLIENTES ACTIVOS` y
`4 AÑOS EN EL MERCADO`; sin ella, `[CIFRA]` y `[CIFRA]`. Y la franja negra de
arriba, que con la llave apagada **no existe**.

---

## 7 · ⚠️ UNA CORRECCIÓN DE LA INSTRUCCIÓN

La instrucción dice, en §4.4:

> *«Todo lo que agregue el contenido de mentira se declara aparte — no como
> montaje del lane, sino como **peso de la llave, que se va cuando la llave se
> apaga.***»

**La primera mitad se cumplió. La segunda es falsa, y está medida.**

```
CONTENIDO_INVENTADO = true     71.325 B de carga inicial propia de /v3
CONTENIDO_INVENTADO = false    71.325 B — LA MISMA CIFRA, AL BYTE
```

Dos builds del mismo árbol, mismo entorno y misma orden, cambiando una sola cosa:
el token de la llave. **Apagarla no devuelve un byte.**

### Por qué, y por qué no es un defecto que se arregle

`INVENTOS` es **un objeto en tiempo de ejecución**. Sus veinte cadenas viajan en
el chunk aunque `conLlave` devuelva siempre la otra cara: ningún minificador
puede borrar una propiedad de un objeto que alguien importa, y no hay forma de
que un `import` estático desaparezca según el valor de una constante.

**Lo que la llave apagada SÍ devuelve es la pantalla**, que es lo que la
instrucción le pide en las otras tres viñetas: vuelven los marcadores en las
ocho, la franja de aviso deja de existir y `npm run build` pasa. **Lo que
devuelve los BYTES es borrar las veinte entradas de `_contrato/inventado.ts`** —
una edición en un archivo, a la vista, con las dos caras de cada casilla escritas
al lado. Está medido: **1.064 B**.

### ⚠️ Lo que NO se hizo: cambiar el diseño para que la frase fuera cierta

Había una forma de hacer que apagar la llave devolviera los bytes, y es la única:
**escribir cada mentira adentro de su `contenido.ts`**, en un ternario contra la
constante, para que el minificador pudiera plegarlo.

Eso es exactamente **lo que la llave existe para impedir**. Con las veinte
cifras repartidas en seis archivos de contenido:

- no se pueden **enumerar** —y lo que no se enumera se publica—;
- no se puede afirmar que ninguna sección escribe la suya;
- el escáner no tiene una lista cerrada que restar, así que o se afloja o se
  llena de excepciones;
- y «apagar» pasa a ser buscar y reemplazar a mano en seis archivos.

Entre **cumplir la frase** y **cumplir lo que la frase protege**, el bloque
eligió lo segundo y publica la diferencia. Es la misma regla con la que B9
publicó que la hipótesis de su instrucción era falsa y con la que B10 publicó que
el diagnóstico de la suya no reproducía: **una instrucción que se cumple al pie
de la letra y rompe lo que buscaba no está cumplida.**

### Qué queda escrito, y dónde

La corrección vive en tres lugares, con el número:
`s5-presupuesto-recibos-de-la-llave.ts` (el recibo, con el A/B completo),
`s5-presupuesto.ts` (la línea declarada) y la salida de `s5-peso` en cada corrida:

```
⚠️ Y apagar la llave devuelve 0 bytes, medido: lo que devuelve los bytes es
   borrar las veinte entradas de `_contrato/inventado.ts` (1.064 B).
```

---

## 8 · Los gates

| gate | resultado |
|---|---|
| `npm run verificar` | **29 pasos, 0 con falla** — la suite `s21` (la llave y las fotos) entró por existir |
| `npm run build` (primer plano, Chrome cerrado, `CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`) | ⚠️ **exit 1 — y ES EL RESULTADO CORRECTO**: la llave está prendida y el guardián no deja publicar |
| `MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build` (el mismo, con la salida de medición) | exit 0, con su cartel de cuatro renglones |
| `npm run test:frontera` | 2 invariantes, 0 fallas, 12 fuera de ventana |
| `npx tsc --noEmit` | limpio |
| `npx prisma migrate status` | *Database schema is up to date* |

---

## 9 · Lo que frenó

1. ⚠️ **Apagar la llave no devuelve un solo byte, y la instrucción decía que sí.**
   Medido, publicado y con **sección propia: §7**, incluida la razón por la que
   el diseño NO se cambió para que la frase fuera cierta.
2. **El caso de referencia de Servicios sigue con su `[TESTIMONIO]`**, y es una
   decisión, no un olvido: elegir cuál de los tres clientes REALES dio el caso
   sería un hecho inventado sobre alguien que existe. Lo mismo con los tres
   destinos del pie y con los precios. La lista completa, con su razón, en §6.5.
3. **La franja de la llave es un hermano del `<main>` y no tiene hoja propia.**
   `s8-montaje` §4b leía la posición de los dos `.css` del chrome; ahora lee
   **también la clase del elemento**, que es una fuente más fuerte y no más
   floja. Abrir una sexta hoja de `_estilos/` sólo para satisfacer al
   instrumento habría movido tres padrones.
4. **Seis instrumentos cruzaron las 300 líneas** al entrar §4 —cuatro estaban
   exactamente en el límite— y se partieron o se consolidaron: `inventado.ts` →
   `restauracion.ts`, `s5-contenido` → `s5-contenido-piezas.ts`, `s21-llave` →
   su soporte, y las cuatro capas de «el contenido no es un dato» que Números y
   Trabajos escribían **dos veces** ahora viven una sola vez en
   `_invariantes/llave.ts`. Dos copias del mismo control se desincronizan, y §4
   lo demostró: cuando la llave entró, una quedó mirando el contenido crudo
   donde la otra miraba el restaurado.
5. **`D-B12.2`** — el titular del Cierre sobre la sala: 4 bloques a 1920 y 2 a
   1440. Queda declarada por decisión del humano: es donde quiere que la sala se
   vea.
6. **`D-B12.1`** — las motas blancas sobre el nombre de los proyectos. Queda
   declarada; volver a 0,25 es un número.
7. **`D-B12.3`** — el moiré del piso en la noche, con su umbral derivado.
8. **La banda del pie no sangra arriba de 1920.** Queda del ancho del contenido
   más los dos rellenos. Sangrarla de verdad pediría sacarla del `Envoltorio`,
   que es de `chrome/Pie.tsx` y lo comparten la galería y el arnés de piezas.
9. **El instrumento lee el cuadro entero como «logo» en la noche.**
   `siluetaMasGrande` toma todo lo que está bajo 60 de gris, y con la sala en 11
   eso es el cuadro. El `sobreElLogo` de 93–100 % que Trabajos publica **no es
   una atribución**: está declarado en `D-B12.1`.
10. **La trampa del módulo fantasma**, en `MEDICION-NAVEGADOR.md` §6: `./gota`
   resolvía a `Gota.tsx` por la caja insensible de Windows, con `tsc` en verde,
   la página en 200 y el censo en cero. El archivo se llama `CapaDeLaGota.tsx`
   por eso.
