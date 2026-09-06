# B4-A — La costura · reporte de la parada

**Worktree** `C:\v3-costura`, rama **`v3/costura`**. **Puerto medido: 3001** (la
otra sesión, B4-B, usa el 3002). Instrumentos: la receta de
`docs/rediseno/MEDICION-NAVEGADOR.md` sobre `chrome-devtools-mcp`, viewport
emulado, `visibilityState: 'visible'` e `innerWidth > 0` verificados antes de
cada lectura, `dpr` 1. El build corrió **en primer plano**.

Los cinco puntos son MONTAJE y CIERRE, no construcción nueva. Los cinco están
cerrados. Lo que se decidió, lo que se frenó y lo que no reprodujo está abajo.

---

## (a) `verificar` · build · `frontera`

| gate | resultado |
|---|---|
| `npm run build` (primer plano, `--max-old-space-size=6144`) | **exit 0** · `✓ Compiled successfully in 29.7s` · 42 páginas estáticas en 2,4 s, `/v3` prerenderizada |
| `npx tsc --noEmit` | **limpio** |
| `npm run verificar` | **25 pasos, 0 con falla** (24 agregados + tsc) |
| `npm run test:frontera` | **2 invariantes · 23 afirmaciones · 0 fallas** · 12 fuera de ventana |

⚠️ **La falla de `s3-frontera` que B3 reportó como preexistente ya no está.** B3
la publicó como «1 falla, PREEXISTENTE y ajena»: el token
`--color-superficie-translucida` ya estaba en `HEAD`, así que el diff daba `[]` y
la afirmación —escrita para medir el MOMENTO de S3— fallaba en vez de declararse
fuera de ventana. Hoy las 10 comprobaciones de esa clase se reportan **fuera de
ventana**, que es lo correcto: 0 fallas.

**El chequeo de procesos.** Antes del build se filtró por LÍNEA DE COMANDO
(`CommandLine like '*v3-costura*'`) y se pararon los **tres** `node` de este
worktree (43116 npm · 61644 `next dev --webpack -p 3001` · 37812 `start-server`).
Los `node` de `chrome-devtools-mcp` **no se tocaron**. RAM libre al lanzar: 3,08 GB.

---

## (b) LA MARCA MONTADA — dónde, con qué, y qué se movió

B3 construyó los tres registros y **los dejó sin montar**, porque las superficies
de marca del home caían en `_secciones/` y en la geometría de la pastilla. B4-A
los enchufa en los tres lugares que la instrucción nombra.

| superficie | qué se montó | archivo |
|---|---|---|
| **rótulo de sección** | el **prefijo** en las OCHO (es la única pieza del rótulo que las ocho comparten) y el **separador** en las cuatro donde el número y el nombre son contiguos | `_secciones/_contrato/Rotulo.tsx` |
| **el pie** | **prefijo · logotipo │ continuación** — los tres registros como conjunto | `_secciones/cierre/LineaDeCierre.tsx` |
| **la pastilla** | el marcador de cada enlace **ES** `PrefijoDeServicio`: la hoja pone la geometría y el movimiento, la marca pone el relleno | `_componentes/chrome/Navegacion.tsx` + `_estilos/navegacion.css` |

Contado sobre la página viva a 1920×1080: **14 prefijos** (8 rótulos + 1 pie +
5 enlaces de la pastilla), **5 separadores** (4 rótulos + el pie) y **1
logotipo**. `s17-marca` §6 lo afirma sobre el home renderizado, en las dos ramas.

### ⚠️ La pastilla NO se movió un píxel — medido

|  | antes | después |
|---|---|---|
| caja de la pastilla en reposo, 1920×1080 | `x 657,9765625 · y 24 · 604,046875 × 48` | **idéntica, bit por bit** |
| el marcador del enlace | 4 px, `--radius-circulo`, `--color-tinta` | 4 px, `--radius-circulo`, **`--color-acento`** (rgb(29,91,143) = `--color-acento-web`) |

La hoja sigue declarando el tamaño, el radio, la escala 0,8, los −16 px y los
500 ms; lo único que dejó de declarar es el `background-color`, que ahora llega
en la clase `bg-acento` de la pieza —el ALIAS, que se retiñe por `data-servicio`—.
Declararlo en la hoja lo ganaría por especificidad y mataría el retiñido.

### ⚠️ EL MONTAJE ARREGLÓ UN DEFECTO QUE ESTABA EN PANTALLA: el pie decía «DEVELOP»

La marca viajaba como **texto** adentro de un `Caption` con `uppercase`, así que
el último renglón del documento leía **«DEVELOP · [FECHA] · [NOMBRE] · [ENLACE]»**:
la caja alta se comía la única forma que este logotipo tiene —la `d` minúscula y
el `OP` en mayúscula—. Está en `capturas/b4a/pie-1920-antes.png`. La pieza trae
la palabra sin transformar y `normal-case` la protege de la herencia; que sea una
pieza y no una cadena es lo que hace que no vuelva a pasar. `s17-marca` §6 lo
afirma sobre el marcado, con su control positivo.

**Capturas** en `docs/rediseno/capturas/b4a/`, todas a 1920:
`rotulo-1920-antes.png` / `-despues.png` · `pie-1920-antes.png` / `-despues.png` ·
`pastilla-1920-antes.png` / `-despues.png` · `pastilla-1920-despues-hover.png`
(el prefijo sólo se ve con el puntero encima: en reposo su opacidad es 0).

### Un defecto que introduje y arreglé, con su número

Al darle `flex items-center` al número de sección, el `<p>` —que es ítem de
grilla— **se estiraba a la fila y el número se iba al medio**: medido a 1920, el
`02` de Quiénes somos bajaba de `y 5` a `y 539`. `self-start` le devuelve su alto
natural. Está escrito en el propio componente, con el número.

---

## (c) INSTRUMENT SERIF — **NO se montó**, y por qué

El sistema le reserva **una sola aparición en todo el sitio** y todavía no está
decidida; B3 propuso el separador. **No se carga**, y la razón no es una
preferencia: **el `.woff2` no está en el repo** —`src/app/v3/_fuentes/` tiene
`chivo-latin.woff2` y `chivo-mono-latin.woff2`, y nada más—, así que montarla
pedía **agregar un asset nuevo** y una tercera familia en el layout. Eso es una
decisión de tipografía, no de montaje, y este sprint es de montaje.

**Se dejó el contador igual**, que es lo que la instrucción pide para el día que
se monte: `s17-marca` §7 cuenta las apariciones de una serif **en el árbol
renderizado del home**, en las dos ramas → **cero**, con **dos controles
positivos** (una clase `font-serif` y una familia escrita a mano) para que ese
cero no sea un verde por ceguera.

---

## (d) LA MESETA DE TRABAJOS — el único defecto visible, cerrado

### 🔴 EL DEFECTO ERA TRES VECES MÁS GRANDE — y lo que lo hizo visible fue el instrumento

**B2 reportó dos cuadros sueltos. Eran tres, más una pantalla entera seguida.**

1920×1080, puerto 3001, barrido de `[7560, 11880]` de **20 en 20 px**, con tres
cuadros de espera por muestra:

| `scrollY` | qué pasa | ¿lo tenía B2? |
|---|---|---|
| 8640 | los TRES planos en opacidad 0 | sí |
| 9720 | los TRES | sí |
| **10800** | los TRES | **no** |
| **10820 → 11880** | **los TRES, 54 muestras seguidas = 1.060 px más** | **no** |

El recorrido de P7 cierra donde el pin suelta —`scrollY` 10800— con el último
plano ya en 0, y de ahí en adelante el progreso satura: la sección **se va con el
escenario vacío durante una pantalla entera**, con el marco quieto arriba y nada
abajo. Es el mismo defecto que en 8640 y 9720, en el único borde que no tiene un
plano siguiente que lo tape.

#### Cómo se detectó, que es lo que importa del método

**Un muestreo puntual no lo podía ver.** B2 midió los dos bordes de tramo —los
puntos donde la aritmética dice que algo pasa— y ahí encontró los dos cuadros. El
tercer borde no es un borde de tramo: es **el final del recorrido**, y lo que
sigue no es un cuadro sino **un tramo entero saturado**, que sólo aparece si se
mide LO QUE HAY EN EL MEDIO.

Lo que lo destapó fue **barrer**: 217 muestras de 20 en 20 px sobre todo el
recorrido de la sección, en vez de leer los puntos donde uno espera algo. Un
apagón de un cuadro y uno de 1.060 px se ven idénticos en una tabla de tres
lecturas puntuales; en un barrido, uno es una fila y el otro son cincuenta y
cuatro seguidas.

⚠️ **Y el barrido tuvo que aprender a esperar.** Con **dos** cuadros de espera por
muestra la lectura llega **una muestra tarde** —verificado: la misma opacidad
aparecía repetida en dos posiciones de scroll distintas— y el perfil entero sale
corrido. Con tres se estabiliza. Una medición de scroll que no verifica que el
valor dejó de moverse describe la muestra anterior, no la actual.

### El arreglo, y por qué la regla no se aflojó

`s7-contrato` §3 prohíbe que una sección importe un valor de `_lib/motion/`, y el
corte llegada/salida de P7 —`3 / 3,5`— vive ahí. **El contrato lo intermedia:**
`_secciones/_contrato/asentamiento.ts` publica `CORTE_DE_TRAMOS`, con la misma
forma que `ANCLA_DEL_PIN` ya tenía, y **la guardia que lo vuelve un espejo y no
una segunda fuente** es `corteDeTramos`, que re-deriva el corte del patrón real
desde el instrumento (`s6-contrato` §8, con dos controles positivos).

La meseta se arma con el **mismo `saturarEn`** que usan Servicios, Tu panel y el
Cierre. Cada tramo se parte en tres, y el tercero **se desborda al tramo
siguiente a propósito** — ése es el arreglo:

| | fracción del tramo | px a 1080 |
|---|---|---|
| llegada (`local` 0 → corte) | 7/9 = 0,7778 | 840 |
| **meseta** (`local` clavado en el corte) | 2/9 = 0,2222 | **240** |
| salida (corte → 1), **desbordada** | 0,1296 | 140 |

Ninguna fracción se eligió: la meseta sale de `FUSION_DEL_CENSO` (240 px, el
umbral con el que el censo funde dos acontecimientos — una banda quieta más corta
no se lee como que algo se quedó), la llegada es lo que queda, y la salida es la
que hace que el gesto corra a **velocidad de scroll constante** de punta a punta.

### La comprobación que barre el pin, con control positivo

`trabajos.invariant` §16 (vive en `trabajos/soporte.ts`, que es módulo de apoyo
declarado y puede leer el fotograma de P7 sin violar §3):

- **barriendo el pin entero** —desde `1/pantallas`, derivado, no escrito—
  **no queda un solo cuadro con los tres planos invisibles**;
- **el control positivo**: con el reparto de B2 el mismo barrido encuentra **3**
  cuadros apagados, que a 1920×1080 son `scrollY` **8640 · 9720 · 10800**;
- las tres mesetas existen sobre la función real y la más corta mide **237,6 px**,
  que reproduce los 240 declarados dentro de un paso del barrido (5,4 px);
- el reparto de B2 **no tenía ninguna** meseta.

### Verificado con scroll real (1920×1080, paso 20 px)

| | antes | después |
|---|---|---|
| cuadros con los tres apagados | 7560 · **8640** · **9720** · **10800→11880 (55 muestras)** | **sólo 7560** — la sección todavía entra por el pie del viewport |
| opacidad máxima MÍNIMA dentro del pin | **0** | **0,265** |
| muestras del pin bajo 0,4 (de 109) | 25 | **8** |
| de 10800 a 11880 | 0 en las 55 muestras | **1 en las 55** |
| meseta a plena opacidad, por plano | — | 8380→8640 · 9460→9720 · 10540→11880 |

### ⚠️ EL HUECO NUEVO, antes de dejarlo

La instrucción pide reportarlo si la meseta cambia el reparto. **Cambia los
aterrizajes y el hueco BAJA:**

| | antes | después |
|---|---|---|
| aterrizaje de los tres planos | 8640 · 9720 · 10800 (el final de la SALIDA) | **8400 · 9480 · 10560** (el arranque de la meseta) |
| aterrizaje del marco (P2, medido con scroll real) | 7800 | 7800 (sin tocar) |
| **hueco contra el marco** | 840 px = **0,78 pantallas** | 600 px = **0,56 pantallas** |

El gate de B2 es el hueco MÁXIMO, así que la meseta lo mejora y no hay nada que
compensar. **El reparto en tercios no se tocó**: el primer proyecto sigue con su
tercio y la decisión medida de B2 —verse la mitad de tiempo, a cambio de un hueco
de 0,78 en vez de 1,44— se respeta tal cual.

### 🟡 PENDIENTE — el último plano no sale (NO es un defecto)

**Se anota como pendiente, con su número, y no como defecto:** lo que hace es
**lo contrario** de lo que vinimos a arreglar.

**El número.** La salida del plano `i` ocupa `1 → 1 + 0,12963` de su tramo. Para
el tercero eso cae en **progreso 1,04321**, y el recorrido termina en 1: el ancla
de P7 (`top bottom → bottom bottom` sobre la sección) cierra cuando el pin
suelta, y de ahí en adelante el progreso satura. O sea que faltan **0,0432 del
recorrido = 140 px de scroll** que este recorrido no tiene.

**Qué pasa en su lugar.** El tercer proyecto se queda en su meseta —opacidad 1,
medido de `scrollY` 10540 a 11880— mientras la sección se va. Donde antes había
1.060 px de escenario vacío ahora hay un proyecto quieto y a plena.

**Qué lo cerraría**, con su costo, para que la decisión exista:

| salida | qué cuesta |
|---|---|
| **darle a la sección 140 px más de recorrido** (`alto` de 300svh a ~304svh) | toca `_lib/secciones.ts`, que dos sprints acaban de calibrar y que esta instrucción declara intocable. Mueve el documento entero y con él todas las cifras de `scrollY` publicadas |
| **repartir los tres tramos sobre el PIN en vez del recorrido** | es la alternativa que B2 midió y descartó: le da tiempo igual a los tres, pero abre el hueco de 0,78 a **1,44 pantallas**, y el gate del bloque es el hueco MÁXIMO |
| **achicar los tres tramos a 0,3195 del recorrido cada uno** (de 1/3 a `1/(3+salida)`) | los tres saldrían adentro, pero el primer proyecto pierde otro **4,14 %** de su tiempo, y ya es el más corto de los tres por decisión medida |
| **dejarlo** | cero costo, y el último cuadro de la sección es un proyecto entero en vez de una banda vacía |

**Se dejó**, y las tres alternativas quedan escritas con su número para que se
pueda dar vuelta el día que el criterio sea otro.

### La desincronización de `PATRONES_DE_LA_SECCION`, cerrada

`trabajos/contenido.ts` decía `['P7']` y la sección consume dos. Hoy dice
`['P2', 'P7']` y `trabajos.invariant` §14 lo afirma como **igualdad** en vez de
publicarlo como delta. La razón que traía escrita —*el marco es el plano quieto
contra el que se lee la profundidad*— **sigue en pie y está escrita**: el ancla
de P2 cierra antes de que el pin arranque.

---

## (e) LOS 24 px DE POR QUÉ DEVELOP — el modelo primero, y después el desborde

### El modelo estaba ciego, y se arregló antes de tocar el defecto

§8 derivaba el alto del bloque de P5 de `ALTO_MINIMO_DEL_BLOQUE_SVH` —o sea del
**piso declarado, 450 px**— cuando un `min-height` produce **el mayor entre el
piso y el contenido**, y el contenido medía **475,19**. Las dos consecuencias:

- subestimaba el bloque en **25,19 px**, más que el desborde entero;
- un modelo de la sección alimentado con ese número daba **898,52 px** —o sea
  *entra*— para una sección que medía **923,70**. El árbitro decía verde sobre el
  defecto que había que arreglar.

El modelo nuevo (`por-que-develop/soporte.ts`, §8) declara **pieza por pieza** qué
es medido y qué sale de un token, y usa `max(piso, contenido)`:

```
  🔧 relleno de arriba (--spacing-4)     16      🔧 = derivado de un token del tema
  🔧 relleno de abajo  (--spacing-8)     32      📏 = medido en el navegador,
  🔧 tres costuras     (--spacing-4)     48           1440×900, puerto 3001
  📏 rótulo                              11
  📏 titular                            276,13
  📏 bajada                              65,39
  📏 bloque de P5 (piso 450 · contenido 443,2)  450
                                       ───────
                                        898,52   contra 900 declarados
```

Y **reproduce el defecto** que estaba ciego: con el contenido de antes (475,19)
el mismo modelo da **923,71**, contra los **923,70** que mide el navegador —0,01
de redondeo de las tres piezas medidas—. El control positivo le pasa el piso
(450) y exige que **falle** en ver el desborde, que es lo que hacía el viejo.

⚠️ **La cifra de B2 —«subestima el defecto en un 50 %»— NO se reproduce, y se
declara** (regla 11). Contra el bloque real la subestimación es de 25,19 px sobre
475,19 = **5,30 %**; contra el desborde de 23,70 px la ceguera es del **100 %**,
porque el modelo no lo veía en absoluto. Ninguna de las dos da 50. Lo que sí se
sostiene es la conclusión: **el árbitro subestimaba y por eso no podía arbitrar.**

### El desborde, con el número real

**La sangría de la tarjeta del diferencial baja de `--spacing-4` a `--spacing-2`.**
No es un ajuste de altura disfrazado: las dos medían `--spacing-4`, así que la
regla de cada tarjeta quedaba **exactamente en el medio** de una banda de 32 px
—16 la separaban del texto de arriba y 16 de su propio título— y una regla
equidistante no agrupa. Con la sangría en 8 px la regla queda a 8 de su título y
a 16 del bloque anterior: **el arreglo de composición y el de altura son el mismo.**

Cuatro tarjetas × 8 px = **32 px** menos de lista → el bloque cae de 475,19 a
443,2 de contenido propio, o sea **por debajo de su piso de 450**, y ahí vuelve a
mandar el piso.

**Medido en el navegador a 1440×900, con scroll real:**

| | antes | después |
|---|---|---|
| alto intrínseco de la sección | **923,70** | **898,52** |
| desborde sobre su pantalla de 900 | **23,70 px** | **0** (1,48 px de aire) |
| lo que renderiza | 923,70 | **900** (su `min-height` declarado) |
| a 1920×1080 | 1080 exactos | **1080 exactos** |

1,48 px es el mínimo alcanzable sin bajar `ALTO_MINIMO_DEL_BLOQUE_SVH`, que es lo
que impide que el rango de P5 degenere. El modelo lo publica.

### El ancla y el contraste NO se movieron

`npx tsx …/s16-anclaje.invariant.ts` → **27 afirmaciones, 0 fallas**, antes y
después:

- «el ancla cae ADENTRO de la ventana medida p=[0,8232 · 0,8782]» — **0,8525**,
  +0,0293 del borde de abajo y −0,0257 del cruce de AA;
- «el contraste del peor píxel del fondo en el ancla pasa AA: **4,98:1**».

---

## (f) `s5-peso` — de dónde salían los 1,3 KiB

### La causa, medida y exacta: **el preámbulo de Sentry**

`@sentry/nextjs` le inyecta a **cada chunk del build** un bloque idéntico de
**348 bytes** que registra un `_sentryDebugId`. Cuatro chunks propios × 348 B =
**1.392 B = 1,36 KiB**, que es **exactamente** el desvío que B2 publicó (61,3
contra 60). El mismo preámbulo pesa **5,10 KiB** en los 21 chunks heredados.

**Es heredado y el lane no lo puede tocar**: lo declara la configuración RAÍZ, que
estos sprints tienen prohibida. Regla 13 → **se publica, no se afirma**. El techo
del lane **no se movió por eso**: lo que cambió es QUÉ se mide contra él —los
bytes que el lane escribe, con el preámbulo restado y publicado al lado, con su
dueño y con su detector controlado.

**Con esa corrección, el lane siempre entró:** lo que escribía antes de B4-A es
**59,94 KiB**. Lo que no entraba era el preámbulo del build.

### Lo que se achicó, antes de declarar nada

**503 B medidos**: la glue del bloque ANIMADO —`ANCLA_DEL_PIN`, `cronogramaDe`,
`especificacionDe`, `inerciaDe`— viajaba en la carga inicial de `/v3` por
compartir archivo con `deberiaAnimar`, que sí consume el árbol quieto. Es una
**fuga de la compuerta de 1025 que ningún instrumento veía**: `s7-compuerta` busca
las huellas del SISTEMA de motion (`_lib/motion/`) y esto era del CONTRATO. Se fue
a `_contrato/bloqueAnimado.ts`, que sólo importa el módulo perezoso.

### El estado, y la decisión que va a la parada

```
  propio de /v3            62,499 KiB crudo (4 chunks)
  − preámbulo heredado      1,359 KiB   (348 B × 4, @sentry/nextjs, config raíz)
  = lo que ESCRIBE el lane 61,140 KiB
  − lo que monta B4-A       1,200 KiB   (la marca en los tres lugares + la meseta)
  = el lane sin B4-A       59,940 KiB   → entra en los 60 de siempre
```

**El techo del lane sigue en 60 y no se movió.** Lo que se agregó es una **línea
declarada de 1,25 KiB** para lo que ESTA instrucción mandó montar, con su recibo:
qué compró, y qué se achicó antes de declararla. No es un techo redondo más alto
—eso absorbería cualquier cosa que crezca después—: es una línea que nombra su
contenido, y el invariante afirma **las dos cosas**, que el total entra y que
**sin lo que B4-A monta el lane sigue entrando en 60**.

⚠️ **Es un aumento de presupuesto igual, y va a la parada como decisión del
humano.** La alternativa medida era no montar la marca, que es lo que esta misma
instrucción manda montar. Queda a la vista para que se pueda dar vuelta.

---

## (g) LOS DOS CONTADORES — cuál estaba mal, y por qué difería

**El que estaba mal es `s5-codigo` §8.** Contaba con `split('\n').length`, que
suma uno en todo archivo terminado en salto: publicaba `Hero.tsx — 300 líneas`
donde `wc -l` dice **299**. `s6-lane` §7 y `s7-contrato` §7 contaban saltos, o sea
`wc -l`.

**Pero no eran tres cuentas: eran TRES FORMAS escritas NUEVE VECES en siete
instrumentos** —`s3-codigo`, `s4-cobertura`, `s5-codigo`, `s6-servicios`,
`s6-tu-panel`, `s8-cierre`, `s7-pedido`—, y la forma correcta **ya existía,
exportada y sin un solo importador**: `contarLineas` en `s8-largos.ts`.

**Por qué difería.** La corrección de SITIO-S7 se hizo donde apareció el problema
—dos archivos del lane B parados en 300 exactos— y viajó **por copia** al
instrumento de al lado. `s5-codigo` es de SITIO-S5, de otro lane, y nunca se
enteró: cada instrumento llevaba su propia expresión de una línea, y **una
expresión copiada no tiene dónde recibir un arreglo**. Que la forma correcta
estuviera escrita y sin usar es la medida exacta del problema. **Es un hallazgo
de método y está en §6.2.**

**El arreglo.** Las nueve llamadas entran ahora por `contarLineas`. La cuenta no
se mueve: los **374** `.ts`/`.tsx`/`.css` de `src/app/v3` terminan en salto —
verificado— y ahí las dos formas coinciden. Los tres instrumentos publican hoy
el mismo número que `wc -l` (`s5-codigo.invariant.ts` 300 · `s8-cierre` 300).

**Y una guardia nueva**, en `s8-montaje` §8: **ningún archivo de `/v3` cuenta
líneas por su cuenta** —368 archivos barridos, comentarios descontados— con el
ÚNICO permitido declarado uno por uno (`s5-codigo`, que la corre a propósito en
su control positivo para mostrar que las dos cuentas no daban lo mismo) y **dos
controles positivos**: que el detector ve la cuenta vieja en código y que NO la ve
en un comentario.

---

## (h) ARCHIVOS

**Nuevos (7)**

| archivo | por qué |
|---|---|
| `_secciones/_contrato/Rotulo.tsx` | el rótulo de sección con la marca; salió de `Seccion.tsx` por la regla de 300 líneas, y se re-exporta para que las ocho secciones no cambien un import |
| `_secciones/_contrato/bloqueAnimado.ts` | la glue del bloque animado, fuera de la carga inicial (503 B) |
| `_secciones/cierre/LineaDeCierre.tsx` | la última línea del documento, con la marca; salió de `Cierre.tsx` por la misma regla |
| `_secciones/trabajos/asentamiento.ts` | la derivación de la meseta |
| `_secciones/por-que-develop/soporte.ts` | el modelo de alto de §8 |
| `docs/rediseno/capturas/b4a/` | 7 capturas |
| `docs/rediseno/outputs/B4-A-COSTURA.md` | este reporte |

**Modificados (32)** — el detalle está en `git status`. Por punto:

- **marca**: `_contrato/Seccion.tsx` · `chrome/Navegacion.tsx` · `_estilos/navegacion.css` · `cierre/Cierre.tsx` · `cierre/contenido.ts` · `s17-marca.invariant.tsx`
- **meseta**: `_contrato/asentamiento.ts` · `_contrato/motion.ts` · `_contrato/coreografia-animada.tsx` · `trabajos/{Trabajos.tsx,contenido.ts,geometria.ts,soporte.ts,trabajos-piezas.ts,trabajos.invariant.tsx}` · `_invariantes/{s6-contrato.invariant.ts,soporte.ts}` · `servicios/s6-servicios.invariant.tsx`
- **24 px**: `por-que-develop/{Diferenciales.tsx,s7-por-que-develop.invariant.tsx}`
- **peso**: `s5-peso.invariant.ts`
- **contadores**: `s8-largos.ts` · `s3-codigo` · `s4-cobertura` · `s5-codigo` · `s7-contrato` · `s7-pedido` · `s8-montaje` · `s6-lane` · `s6-servicios` · `s6-tu-panel` · `s8-cierre`
- **padrón**: `s5-archivos.ts`

---

## (i) TODO LO QUE FRENÓ, Y TODO LO QUE NO REPRODUJO

1. **La pastilla NO lleva logotipo, y eso se frenó.** La forma nk —un logotipo
   arriba a la izquierda del chrome— es **una aparición que hoy no existe** y una
   decisión de composición. B3 ya había frenado ahí y se mantiene. Lo que sí se
   montó es el **prefijo**, porque ese registro **ya existía** en la pastilla —el
   marcador de cada enlace es un relleno que precede a un rótulo— y sólo cambió de
   dueño. La geometría no se movió un bit.
2. **Instrument Serif no se montó** (ver (c)). El `.woff2` no está en el repo.
3. **Punto ciego de `s10-acceso`, encontrado y NO arreglado.**
   `marcadoresAnunciados` cuenta marcadores **sólo en las HOJAS** —para no
   contarlos dos veces— así que **un nodo con una etiqueta adentro Y texto propio
   pierde su texto**. Lo destapó el montaje del pie: el censo cayó de 40 a 37
   marcadores anunciados mientras el texto seguía entero en pantalla. Se sorteó
   poniendo la continuación del pie en su propia hoja; **el detector no se tocó,
   es de otro sprint.**
4. **El último plano de Trabajos no sale** (ver (d)).
5. **La cifra «50 %» de B2 no se reproduce** (ver (e)).
6. **Tres afirmaciones cambiaron de forma porque la instrucción revirtió su
   decisión, y las tres se ENDURECIERON en vez de aflojarse:**
   - `s8-cierre` §8 decía «cero usos de acento: el Cierre no usa acento». Hoy el
     Cierre usa acento —el prefijo ES relleno en `--color-acento`— y lo que se
     afirma es **más fuerte**: que los usos de acento son **exactamente** las
     piezas `prefijo-de-servicio` del marcado, contadas, y que ninguno es texto ni
     borde (esa afirmación queda intacta).
   - `s6-tu-panel` §2 decía «la rama quieta no tiene un solo `aria-hidden`». Hoy
     tiene dos —el prefijo y el separador, decorativos por la razón correcta— y se
     afirma que **todo lo escondido son esas piezas** y que esconderlas **no le
     saca una letra al texto anunciado**.
   - `s7-por-que-develop` §7 decía «ningún descendiente pinta». Hoy pinta el
     prefijo, y se afirma que **lo único que pinta afuera de la `<section>` son
     piezas de marca** y que son **marcas y no capas** (un cuadrado de
     `--spacing-2`, nada con `inset-0`).
7. **El aumento del presupuesto de `s5-peso`** (ver (f)) — decisión del humano.
8. **La regla de 300 líneas y el presupuesto de peso tiran en direcciones
   opuestas — pero MENOS de lo que yo dije, y lo corrijo con la medición.** Ver
   §6.4: partir un archivo cuesta cero cuando la pieza tiene UN consumidor
   —webpack la concatena— y cuesta una frontera real sólo cuando es COMPARTIDA.
9. **Un error de método, propio, que la instrucción avisaba** — el filtro de
   procesos alcanzó al envoltorio `npm` del servidor de la OTRA sesión. Sin daño
   (verificado en el acto: 3002 → 200 y 3005 → 200). **Está escrito con su nombre
   y con la regla que sale, en §6.1.**
10. **Se midió a 1920×1080 y a 1440×900.** A 375 se comprobó lo que el montaje de
    la marca podía romper —la pastilla— y no lo rompe: entra (x 32, 311 px de
    ancho útil), **cero elementos desbordados** y `scrollWidth` = 375, o sea sin
    scroll horizontal. El resto de mobile lo cubren los invariantes
    (`s10-mobile`, 72 afirmaciones, 0 fallas, 3 fuera de ventana).
11. **La verificación visual la hace el humano.** Este reporte publica números y
    capturas; no dice que se vea bien.

---

# 6 · REGLAS DE MÉTODO QUE SALEN DE ESTE BLOQUE

## 6.1 · El filtro de procesos va por la RUTA DEL WORKTREE, no por el comando

⚠️ **Error propio, con nombre.** Antes del build hay que parar el servidor de dev
del worktree, y este bloque corría **en paralelo con otra sesión**. El filtro que
usé fue:

```
CommandLine -like '*v3-costura*'  -or  CommandLine -like '*npm-cli.js run dev*'
```

La segunda mitad **no distingue worktrees**: los envoltorios de `npm` llevan la
ruta de `npm-cli.js`, no la del proyecto. Así que alcanzó al envoltorio del
servidor de la OTRA sesión —PID 70672, `npm run dev -- -p 3002`, el worktree
`C:\v3-medicion`—.

**Qué pasó de verdad:** el `next dev` hijo **sobrevivió** —un envoltorio de npm no
se lleva al hijo al morir— y se verificó **en el acto**, no después:
**3002 → 200** y **3005 → 200**. Sin daño.

**La regla, para el próximo que corra en paralelo:** el filtro se escribe **por la
ruta del worktree y por nada más**. Un `next dev` la lleva en su línea de comando
(`C:\v3-costura\logic-core-v3\node_modules\...`); un envoltorio de `npm` **no**,
así que un envoltorio que no se puede atribuir **no se mata**: se lo deja
huérfano, que no molesta a nadie, o se lo mata por su hijo. Y después de matar
cualquier cosa, **se verifica que el sitio del otro siga contestando**, en el acto.

⚠️ Los tres `node` permanentes de `chrome-devtools-mcp` **no se tocaron** en
ninguna de las dos pasadas. Ésos ya estaban declarados en la instrucción.

## 6.2 · Una corrección que se hace donde aparece viaja POR COPIA, y los lanes no se enteran

`s5-codigo` §8 contaba una línea de más. La causa no era un criterio distinto:
**eran TRES FORMAS de contar líneas, escritas NUEVE VECES en SIETE instrumentos**,
y **la correcta ya existía, exportada y sin un solo importador** (`contarLineas`
en `s8-largos.ts`).

Lo que produjo la divergencia:

1. SITIO-S7 chocó con el problema —dos archivos del lane B parados en 300
   exactos— y **lo arregló donde apareció**: en `s6-lane` §7;
2. de ahí viajó **por copia** al instrumento de al lado, `s7-contrato` §7, porque
   es una expresión de una línea y copiarla es más rápido que importarla;
3. `s5-codigo` es de SITIO-S5, **de otro lane**, y nunca se enteró.

**La regla:** una expresión copiada **no tiene dónde recibir un arreglo**. Cuando
una comprobación se repite en más de un instrumento, lo que se comparte es la
FUNCIÓN, no la línea — y si la función ya existe y nadie la importa, eso mismo es
el síntoma. Este bloque cerró las nueve llamadas contra una sola función y dejó
la guardia que lo impide (`s8-montaje` §8: ningún archivo de `/v3` cuenta líneas
por su cuenta, con el único permitido declarado y dos controles positivos).

## 6.3 · Un muestreo puntual no puede ver un apagón que dura un tramo

B2 midió los dos bordes de tramo de la secuencia de Trabajos —los puntos donde la
aritmética dice que algo pasa— y publicó dos cuadros con los tres planos
invisibles. **Eran tres, más 1.060 px seguidos.** El tercero no está en ningún
borde de tramo: está en el **final del recorrido**, y lo que sigue no es un cuadro
sino un tramo entero saturado.

**Un apagón de un cuadro y uno de una pantalla se ven idénticos en una tabla de
tres lecturas puntuales.** En un barrido, uno es una fila y el otro son cincuenta
y cuatro seguidas. La medición que lo destapó fueron **217 muestras de 20 en 20 px**
sobre todo el recorrido de la sección.

⚠️ **Y el barrido tuvo que aprender a esperar:** con **dos** cuadros de espera por
muestra la lectura llega **una muestra tarde** —la misma opacidad aparecía repetida
en dos posiciones de scroll distintas— y el perfil entero sale corrido. Con
**tres** se estabiliza. Va con la lección de `CLAUDE.md` sobre la pestaña oculta:
antes de creerle a una medición de scroll hay que comprobar que el valor **dejó de
moverse**, no sólo que la pestaña está visible.

## 6.4 · Partir un archivo cuesta bytes SÓLO si la pieza es compartida — medido

La regla del repo es que un archivo de más de 300 líneas se parte. El presupuesto
de peso empuja para el otro lado. **La tensión es real pero es más chica de lo que
parece, y el número lo dice.** Medido sobre el chunk de `/v3` del build:

| pieza que salió a su archivo | consumidores | qué costó |
|---|---|---|
| `_contrato/Rotulo.tsx` | 1 (`Seccion.tsx` lo re-exporta) | **0 B** — webpack lo concatenó adentro de su importador |
| `cierre/LineaDeCierre.tsx` | 1 (`Cierre.tsx`) | **0 B** — concatenado |
| `trabajos/asentamiento.ts` | 1 (`geometria.ts`) | **0 B** — concatenado |
| `_componentes/marca/Marca.tsx` | **3** (rótulo, pie, pastilla) | **módulo propio de 626 B**, de los cuales **~100 B son envoltorio** |
| `_componentes/marca/sistema.ts` | 2 | **módulo propio de 64 B** para una sola cadena, **49 B de envoltorio** |

El empaquetador **concatena un módulo que tiene un solo consumidor** y lo mete en
el ámbito de quien lo importa: ahí partir es gratis. **La frontera aparece cuando
la pieza la usan varios**, que es exactamente lo que pasa con una pieza de
SISTEMA: `Marca.tsx` no puede vivir adentro de ninguna de las tres superficies
que la montan.

**La regla:** partir por la regla de 300 líneas **no cuesta peso**; **compartir**
sí, y cuesta el envoltorio de un módulo —31 a 100 B en este build, medido sobre
los cinco módulos más chicos del chunk—. Es el precio de que exista un sistema, y
es el precio correcto: la alternativa es tres copias de la marca.

⚠️ **Corrijo lo que yo mismo había escrito en la parada.** Dije que *«parte del
peso que B4-A agrega es exactamente eso»* señalando a los cuatro archivos nuevos.
Medido, tres de esos cuatro cuestan cero. Lo que cuesta es la pieza compartida.

## 6.5 · Un presupuesto se sube UNA vez, con tres cosas en la mano

El techo de `s5-peso` pasó de 60 a **61,25 KiB**, y lo decidió el humano en la
parada. Lo que hace que eso no sea *«subirlo cada vez que se pasa»* son tres cosas
que estuvieron antes de la decisión, no después:

1. **La causa de lo viejo, medida byte por byte y atribuida.** Los 1,3 KiB que B2
   reportó son **1,36 KiB de preámbulo de `@sentry/nextjs`** —348 B × 4 chunks—,
   heredados de la configuración raíz. Salieron de la cuenta por la regla 13: se
   publican, no se afirman. **Con eso, el lane siempre había entrado en 60.**
2. **Lo propio, achicado ANTES de declararlo.** 503 B de glue del bloque animado
   que cruzaba la compuerta de 1025 sin que ningún instrumento lo viera. Sin ese
   arreglo el aumento habría sido de 1,70 KiB en vez de 1,20.
3. **La alternativa, escrita, para que la decisión sea revocable.** Era **no
   montar la marca**. Está en el docblock de `s5-peso`, y el techo viejo de 60
   sigue vivo como afirmación aparte sobre todo lo que NO es la marca: desmontarla
   tiene que devolver el número a 59,94 y el invariante lo va a decir.
