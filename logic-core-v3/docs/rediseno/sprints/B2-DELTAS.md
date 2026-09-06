# B2 · LA TABLA DE DELTAS — los MOMENTOS de `/v3` contra `nk.studio`

**Qué es.** El producto de la Fase 0 de **B2 — Los momentos**. Es la vara con la
que los cuatro frentes de la Fase 1 deciden cuántos acontecimientos agregar y
dónde, para que ninguno lo decida por gusto.

**Cómo se midió.** Con la receta de `docs/rediseno/MEDICION-NAVEGADOR.md` sobre
`chrome-devtools-mcp`, viewport emulado, `visibilityState: 'visible'` y
`innerWidth > 0` verificados antes de cada lectura. **El puerto de este bloque es
el 3001** —hay otra sesión en el 3002— y está en la URL de cada medición.
**De nk se midió y no se copió**: ni un selector, ni una clase, ni un valor de
CSS, ni un asset. Una navegación por ancho, todas las lecturas adentro de esa
navegación, y la pestaña cerrada al terminar.

**Fecha de la medición:** 4 de septiembre de 2026. Lo de `/v3` sale del worktree
`C:\v3-momentos`, rama `v3/momentos`, sobre `8ab34b36`.

---

## 0. El instrumento nuevo, porque la métrica del bloque no tenía uno

**`s7-ritmo.invariant` NO puede ver un acontecimiento.** Calcula
`momentos = pantallas − pinneadas + secuencias` a partir de `secciones.ts`, o sea
**de la ESTRUCTURA del documento y de nada más**. Las cinco cifras de Números
entrando de a una —el ejemplo insignia de la instrucción— mueven ese número en
**exactamente cero**. Las dos cantidades son distintas y las dos hacen falta, así
que este bloque publica **dos**, con nombres distintos para que nadie las sume:

| | qué es | instrumento |
|---|---|---|
| **momentos estructurales** | `pantallas − pinneadas + secuencias` | `s7-ritmo.invariant` (ya existía) |
| **acontecimientos** | un lugar del scroll donde algo TERMINA de cambiar y se queda quieto | el censo de estilos en línea, nuevo, abajo |

### El censo de acontecimientos, y por qué corre igual en los dos sitios

Los dos sitios escriben la animación como **estilo en línea**: nosotros con
`motion/react` (`Pieza.tsx` es el único módulo del sistema que escribe estilo) y
la referencia con su propia librería. Entonces:

1. Se barre el scroll a paso fijo. En cada parada se espera a que **las firmas de
   estilo dejen de cambiar** —hasta 8 esperas de 140 ms— porque una animación
   atada al scroll con inercia sigue moviéndose después de que el scroll paró.
2. De cada elemento se guarda su estilo en línea, **con una clave estable por
   RUTA del DOM** (`tag:índice/tag:índice/…`) y no por índice de
   `querySelectorAll`. ⚠️ La primera versión cacheaba los nodos y daba
   **94 elementos activos contra 190**: cuando un componente reemplaza contenido
   —los tres servicios de la secuencia pinneada— los nodos viejos quedan
   desconectados y su estilo se congela, así que el instrumento los contaba
   «aterrizando» todos juntos en el mismo píxel de scroll. Es un modo de falla
   que da un número plausible y equivocado.
3. Un **cambio real** exige que la ruta exista en las DOS paradas. Alta y baja se
   cuentan aparte, como *montajes*: son los reemplazos de contenido de una
   secuencia, no aterrizajes.
4. El **aterrizaje** de un elemento es la última parada en la que cambió. Un
   **acontecimiento** es un grupo de aterrizajes separados por menos de dos pasos.
5. El **hueco** entre dos acontecimientos es la distancia del final de uno al
   principio del siguiente. Es el «no pasa nada» que se mide.

No toca el DOM de nadie, no lee un selector de nadie, y devuelve los mismos
números sobre un sitio propio y sobre uno ajeno.

---

## 1. La tabla que pide la instrucción

| medición | en nk | en /v3 (antes de B2) |
|---|---|---|
| **Alto del documento** | **23,47 pantallas** @1440 · **22,62** @1920 | 14,00 @1920 y @1440 |
| **Momentos estructurales** (`s7-ritmo`) | 23,47 − 5,01 + 2 = **20,5** | 14,0 − 4,0 + 2 = **12,0** |
| **Acontecimientos medidos** | **12** @1440 · **12** @1920 | **9** @1920 · **9** @1440 |
| **Distancia entre acontecimientos — media** | **1,11 pantallas** @1440 · **1,11** @1920 | 0,90 @1920 · 0,92 @1440 |
| **Distancia entre acontecimientos — MÁXIMA** | **1,56 pantallas** @1440 · 1,78 @1920 | **2,44 @1920 y @1440** |
| **Distancia entre acontecimientos — mínima** | 0,67 pantallas | 0,33 |
| **Cuántas piezas entran a la vez** | 11 · 10 · 7 · 6 · 6 · 6 · 11 · **132** · 1 · 11 · 1 · 22 | 8 · 2 · 6 · 1 · 2 · **131** · 6 · 14 · 12 |
| **Cuánto dura un acontecimiento** | de 0 a **4.320 px** (4,0 pantallas: la secuencia larga) | de 0 a 2.040 px (1,9 pantallas) |
| **Proporción del scroll pinneada** | ~**4,67 pantallas** de 22,47 (**20,8 %**) | 4,0 de 13 (**30,8 %**) |
| **Velocidad aparente de la escena** | 0,0271 de luminancia por 100 px de scroll | 0,0147 (hero) · 0,0279 (por qué develOP) |

### 1-bis. LO QUE LA MEDICIÓN CORRIGE DEL DIAGNÓSTICO

> **No nos faltan acontecimientos: nos falta REGULARIDAD.**

Tres cifras lo dicen, y ninguna es la que el bloque esperaba encontrar:

1. **La densidad media ya es mejor que la de la referencia.** Nuestro hueco medio
   entre acontecimientos es **0,90–0,92 pantallas** contra **1,11** de nk, en los
   dos anchos. Por acontecimiento y por pantalla de scroll no estamos más flacos.
2. **La cuenta bruta casi empata.** 9 acontecimientos contra 12, sobre un
   documento que mide 14 pantallas contra 22,6. Por pantalla, nosotros ponemos
   **0,69** y nk **0,53**.
3. **El defecto es UN pozo.** Nuestro hueco máximo es **2,44 pantallas** contra
   1,56 de nk — y el pozo está localizado: arranca donde termina el último
   acontecimiento de Quiénes somos y no pasa nada hasta la mitad de Trabajos.
   **Números, con 100svh, medía CERO acontecimientos**, y el Cierre también.

**La consecuencia práctica para los cuatro frentes:** la vara no es «poné más
eventos». Es **la banda de nk**, que es notablemente pareja en los dos anchos:

> **Ningún hueco entre acontecimientos consecutivos por encima de 1,56 pantallas.
> La banda a la que apuntar es 0,67 – 1,11 pantallas.**

Todo hueco que quede arriba de 1,56 se reporta con su número y su razón. No se
afloja: se explica.

---

## 2. La velocidad de la cámara — la queja del humano, medida

> *«El fondo de Star Wars avanza demasiado rápido cuando yo todavía no llegué a
> esa zona.»*

### 2.1 Lo que NO se pudo medir, y cómo se supo

**El búfer de dibujo de WebGL no se puede leer desde la página.** Se intentó por
las dos puertas —`ctx2d.drawImage(canvas)` y `gl.readPixels` sobre el contexto
vivo, esta última incluso adentro de un `requestAnimationFrame`— y **las dos
devuelven un cuadro rancio**: entre `scrollY` 0 y 600 la diferencia media de
luminancia daba 0,002, cuando dos capturas REALES de esos mismos dos scrolls
difieren en **0,1396**. Un lector que devuelve siempre el mismo cuadro no da un
error: da un cero, y un cero se lee como «no se movió».

> **Regla de método:** para la escena 3D, el único instrumento de píxel es
> `take_screenshot`. Cualquier medición del canvas hecha desde adentro de la
> página está midiendo el primer cuadro.

### 2.2 Lo que sí se midió, con capturas

Catorce capturas a 1920×1080 en las dos ventanas donde la sala se ve —la escena
se **suspende** detrás de los seis paneles opacos, que son el 88,9 % del
documento—, comparadas sobre la **banda de filas del viewport visible en las
dos** de cada par (el canvas es fijo al viewport: comparar bandas distintas mide
el recorte, no la cámara):

| ventana | pares | desplazamiento del centroide de tinta | cambio de luminancia |
|---|---|---|---|
| hero, doc 0–1080 | 3 | 0,0105 → 0,0124 → **0,0851** alturas de cuadro / 100 px | 0,0154 · 0,0160 · 0,0127 |
| por qué develOP, doc 12960–14040 | 6 | 0,0633 · 0,0407 · 0,0275 · 0,0253 · 0,0285 · 0,0652 | 0,0392 · 0,0370 · 0,0289 · 0,0251 · 0,0215 · 0,0159 |

**La ventana del regreso cambia 1,90× más por cada 100 px de scroll que la del
hero** (0,0280 contra 0,0147 de media). Y contra la referencia, medida igual:
nk cambia **0,0271** en sus primeras pantallas. **En esa unidad no somos más
rápidos que nk** — y por eso la cifra que sostiene la queja es otra.

### 2.3 LA CIFRA QUE SOSTIENE LA QUEJA

El arco de la cámara se integra con `speedAt`, el mismo instrumento que
`s13b-soporte.ts` ya usaba, y mide **12,29 alturas de cuadro** de punta a punta.
Repartido sobre el scroll de la tabla anterior daba **0,9451 alturas por
pantalla**. Ahora la fracción de ese arco ya consumida cuando el visitante llega
a cada sección:

| llega a | progreso | arco ya recorrido | ¿se ve la sala? |
|---|---|---|---|
| hero | 0,0000 | 0,0 % | **sí** |
| quiénes somos | 0,1250 | 14,1 % | no |
| números | 0,3750 | 31,2 % | no |
| trabajos | 0,5000 | 49,0 % | no |
| servicios | 0,6250 | 52,9 % | no |
| tu panel | 0,7121 | 79,7 % | no |
| **por qué develOP** | 0,8525 | **96,8 %** | **sí** |
| cierre | 1,0000 | 100,0 % | no |

> **Cuando el visitante llega a la segunda —y última— sección donde la sala se
> ve, la cámara ya hizo el 96,8 % de su camino.** Le quedan 3,2 % para las dos
> pantallas en las que finalmente la mira. El resto lo hizo detrás de seis
> paneles opacos, donde nadie lo vio.

Eso es «el fondo se adelanta antes de que yo llegue», literal y con su número.

### 2.4 EL TECHO, derivado DOS veces de la pantalla

`_lib/escena/techoDeVelocidad.ts`. **Un techo sobre la POSE sería acortar el
recorrido de la cámara —o sea tocar la coreografía—. Un techo sobre la PANTALLA
es repartir el mismo recorrido sobre más scroll**, que es lo que la instrucción
pide con *«un tramo que se pasa se estira; el progreso total no cambia»*.

1. **El ritmo de la propia página.** Scrollear una pantalla mueve la página
   exactamente una pantalla. Una cámara que se mueve más que eso se le adelanta a
   la página que la tapa. → **1,0**.
2. **El ritmo parejo del propio recorrido.** 12,29 alturas sobre las 13 pantallas
   de scroll de la tabla anterior. → **0,9451**.

Las dos caen a **5,8 %** una de otra. El techo toma la más floja, que es la
redonda: **1,0 altura de cuadro por pantalla de scroll.**

### 2.5 El techo aplicado, y los DOS tramos que NO lo cumplen

| segmento | pantallas antes → después | arco (fh) | fh/pantalla antes → después | ¿cumple? |
|---|---|---|---|---|
| hero | 1 → 1 | 1,728 | 1,7275 → **1,7275** | ❌ **trabado** |
| quiénes somos | 2 → **3** | 2,112 | 1,0558 → **0,7039** | ✅ |
| números | 1 → **4** | 2,179 | **2,1793** → **0,5448** | ✅ |
| trabajos | 3 → 3 | 0,479 | 0,1597 → 0,1597 | ✅ |
| demos | 4,305 → 4,305 | 3,536 | 0,8213 → 0,8213 | ✅ |
| cierre | 1,695 → 1,695 | 2,253 | 1,3294 → **1,3294** | ❌ **trabado** |

**El pico de velocidad del recorrido baja de 6,0945 a 4,6198 alturas por pantalla
de scroll: −24,2 %**, medido por `s13b-escena.invariant` §1, que es el
instrumento que este repo ya tenía. El tramo de Números, que era el pico, baja
**−75,0 %**.

**Los dos que no cumplen, con lo que los traba:**

- **`hero` (1,7275, 73 % arriba del techo).** Pide 2 pantallas. **No se le pueden
  dar:** `s8-chrome.invariant.ts` §2 afirma `pantallasDe(primera) === 1` porque de
  ahí sale el nacimiento de la pastilla de navegación (`100svh − 72px`). Subirlo
  a `200svh` no mueve la pastilla —vive en un envoltorio de alto cero— pero deja
  de nacer al pie del hero y pasa a nacer en su mitad, que es una decisión del
  chrome y no de este bloque. **Aflojar esa afirmación está prohibido por la
  regla 8.**
- **`cierre` (1,3294, 33 % arriba).** Pide 2,253 pantallas y tiene 1,695. **Ese
  largo no es libre: es exactamente `1,694915 × (pantallas de por-que-develop)`**,
  fijado por el ancla declarada 0,8525. Y `por-que-develop` no puede crecer sin
  mover el ancla de `tu-panel` — ver §5.

### 2.6 Lo que el techo NO arregla, y hay que decirlo

**El adelanto ADENTRO de cada tramo no se movió un punto**: la cámara sigue
haciendo el 90 % del camino de un tramo entre un 5,1 % y un 49,6 % antes de que
el visitante llegue al final de ese tramo. Eso **no es del reparto: es de las
curvas** `shift` y `arrive` de cada keyframe, y tocarlas es tocar una pose. Las
dos instrucciones que corren en paralelo lo prohíben. Queda anotado, no
arreglado.

---

## 3. Los momentos estructurales — de 12,0 a 16,0, y por qué no a 20,5

### 3.1 La tabla, derivada

Cada alto que subió es **el mayor de dos números medidos**, no una preferencia:

| sección | antes | después | de dónde sale |
|---|---|---|---|
| quiénes somos | 200svh | **300svh** | techo: `2,112 → 3` · densidad: 5 piezas × 0,67 = 3,35 |
| números | 100svh | **400svh** | techo: `2,179 → 3` · densidad: **6 piezas × 0,67 = 4,0** |

Las otras seis no se tocaron, y ninguna por gusto: hero trabado por la pastilla,
trabajos y servicios por `altoDeSecuenciaPinneada(pasos)` —que ata el alto a la
cantidad de piezas de su `contenido.ts`—, y tu panel, por qué develOP y cierre
por el anclaje (§5).

**Documento: 14,00 → 18,00 pantallas. Momentos estructurales: 12,0 → 16,0.**
Compresión 0,857 → **0,889**, contra 0,873 de la referencia.

### 3.2 EL TECHO DEL GATE, y sale de la propia regla del sprint

**`s7-ritmo` no puede pasar de 16,0 sin romper una regla del bloque.** La cuenta
se descompone así, y cinco de los ocho sumandos están trabados:

| sección | momentos | ¿se puede subir? |
|---|---|---|
| hero | 1 | **no** — la pastilla (§2.5) |
| quiénes somos | 3 | sí |
| números | 4 | sí |
| trabajos | **2** | **no** — una pinneada aporta `n − (n−1) + 1 = 2`, **mida lo que mida** |
| servicios | **2** | **no** — igual |
| tu panel | 2 | **no** — el anclaje (§5) |
| por qué develOP | 1 | **no** — el anclaje (§5) |
| cierre | 1 | **no** — el guardián 3 de `derivarAnclaje` |

Nueve momentos están fijos. Los otros siete son las dos secciones libres. **Y
arriba de 18 pantallas de documento, el ancla del diferencial deja de volver al
bit** (§5): con 19 se desvía **1,11e−16**, un ULP. Con la regla *«el anclaje no se
mueve un bit»* puesta como está, **18 pantallas es el techo del documento y 16,0
el del gate.**

> **Para llegar a 20,5 hay que elegir una de tres, y ninguna es de este bloque:**
> (a) aceptar que el ancla del diferencial se mueva un ULP y subir a 22 pantallas
> —21,7 % más documento que hoy, repartido entre dos secciones cuyo contenido son
> cinco cifras y cinco bloques de texto—; (b) aflojar la premisa de la pastilla y
> darle al hero sus 2 pantallas (+1,0); (c) despinnear una secuencia (+1,0 cada
> una, y se pierde la secuencia).

---

## 4. Quiénes somos — las dos mitades de §0.3, y qué pasó con cada una

### 4.1 «Que la composición entre en una pantalla» — LA PREMISA ESTÁ REFUTADA

La instrucción dice: *«El hueco de la foto se dimensiona por su relación de
aspecto, no por media pantalla»*. **Medido sobre el píxel a 1920×1080, el hueco
ya se dimensiona por su relación de aspecto, y al bit:**

```
1481,59 × 987,72 px   →   1481,59 / 987,72 = 1,500 exacto = los 3:2 que declara GEOMETRIA.foto
```

`MarcoDeMedio` emite `aspect-ratio` desde una prop y nunca una fracción de
pantalla. Los 987,72 px **son** 1481,59 × 2/3. Lo que fija ese alto no es media
pantalla: es que la foto ocupa **4 de 5 columnas**, y ese 4 lo puso B1 con su
propia medición —con 3 columnas la foto medía 738,1 px y dejaba 310 px de hueco—.
**No hay nada que arreglar acá: hay una decisión de B1 que habría que revertir, y
revertirla vuelve a abrir el hueco que B1 cerró.**

Y la segunda mitad de la premisa tampoco se sostiene: **la caja de la foto con su
epígrafe mide 1.019,64 px en una pantalla de 1.080, o sea que ya llena el 94,4 %
de su pantalla.** La composición mide dos pantallas porque tiene **dos grupos**
—la agencia y las personas—, cada uno llenando la suya. Meterla en una no es
redimensionar la foto: es tirar un grupo.

### 4.2 «Bajá la tabla a 100svh» — NO SE HIZO, y va al revés

Tres cifras, cada una con su instrumento, y las tres en la misma dirección:

1. **El techo de velocidad.** Con `100svh` el tramo corre a **2,112 alturas por
   pantalla**: 2,23× el ritmo parejo, el segundo segmento más rápido del
   recorrido. Es exactamente el defecto que §0.2 viene a arreglar.
2. **El gate del bloque.** Bajarla de 2 a 1 pantalla **baja `s7-ritmo` de 12,0 a
   11,0**: §0.3 movía la cifra que el bloque entero existe para subir.
3. **La densidad.** La sección tiene cinco piezas que pueden llegar por separado.
   En una pantalla no hay dónde repartirlas.

Y la cuarta, que es la que §0.3 pedía comprobar: **el desvío NO volvería a cero.**
El instrumento que lo mide ya existe —`s10-mobile.invariant` §2, que cuenta las
cajas de pantalla del marcado— y hoy publica que el flujo de esta sección son
**2 pantallas**. Con la tabla en `100svh` quedaría declarando 1 contra 2
renderizadas: exactamente el desvío que B1 midió, sin cambiar. La composición no
se tocó, así que la medición de B1 sigue valiendo carácter por carácter.

**Se subió a 300svh.** Queda escrito en el docblock de su fila en `secciones.ts`.

---

## 5. El anclaje — la regla exacta que salió de probarlo

`scripts-b2/probar-tabla.ts` corre `derivarAnclaje` con la tabla de hoy y con una
candidata y compara **al bit** los siete nudos y los ocho anclajes. Enumerando
candidatas salió una regla cerrada, y no una intuición:

- **Las cuatro primeras secciones son LIBRES.** Su ancla es un borde de tramo, así
  que vale el `to` de la coreografía pase lo que pase con los altos.
- **`servicios : tu panel : por qué develOP` tiene que quedarse en 3 : 2 : 1.** El
  ancla de `tu-panel` cae ADENTRO del tramo `demos` y vale
  `0,625 + 0,125 · S/(S + T − 0,694915·PQ)`. Igualarla al valor de hoy da
  `S = 2,29866·T − 1,59738·PQ`, que es **homogénea de grado 1**: todas sus
  soluciones son múltiplos de `(3, 2, 1)`. Con `S` clavado en 3 por
  `altoDeSecuenciaPinneada(3)` y alturas enteras, **`T = 2` y `PQ = 1` son la
  única solución** (`T = (77 + 41·PQ)/59` sólo es entero con `PQ ≡ 1 mod 59`).
- **`cierre` mide una pantalla y no puede medir otra**, o el guardián 3 de
  `derivarAnclaje` tira: sería una sección con recorrido de scroll propio y sin
  tramo que corra sobre ella.
- **Arriba de 18 pantallas de documento el ancla del diferencial se corre un
  ULP** (−1,110e−16). No es un error de la derivación —su propio guardián acepta
  hasta 1e−12— pero *«no se mueve un bit»* es literal, así que 18 es el techo.

**Verificado con la tabla nueva: los siete nudos conservan su progreso y las OCHO
secciones llenan el cuadro en el mismo progreso, al bit.** Lo que sí se movió son
las *pantallas* de los nudos, que es el punto de estirar: `[0, 1, 3, 4, 7,
11,305085, 13]` → `[0, 1, 4, 8, 11, 15,305085, 17]`.

---

## 6. La vara de la Fase 1 — qué le toca a cada sección

Los acontecimientos medidos hoy, por sección, y el objetivo. **El objetivo sale de
la banda de nk (0,67 – 1,11 pantallas por acontecimiento), no del gusto.**

| # | sección | pantallas | acontecimientos hoy | objetivo | frente |
|---|---|---|---|---|---|
| 01 | hero | 1 | 1 | **2** | A |
| 02 | quiénes somos | **3** ⚠ | 2 | **3 – 4** | A |
| 03 | números | **4** ⚠ | **0** | **5 – 6** | B |
| 04 | trabajos | 3 | 2 | **3 – 4** | B |
| 05 | servicios | 3 | 1 + 2 montajes | **4 – 5** | C |
| 06 | tu panel | 2 | 2 | **2 – 3** | D |
| 07 | por qué develOP | 1 | 1 | **1 – 2** | D |
| 08 | cierre | 1 | **0** | **1 – 2** | D |
| | **total** | **18** | **9** | **21 – 28** | |

⚠ **Las dos secciones marcadas tienen HOY más alto declarado que composición.**
`s10-mobile.invariant` está en rojo por eso, con estas dos líneas exactas:

```
FALLA quienes-somos: el flujo llena las 3 pantallas declaradas en los cuatro anchos
FALLA numeros:       el flujo llena las 4 pantallas declaradas en los cuatro anchos
```

**Ese rojo es el gate de los frentes A y B.** La Fase 0 abrió el scroll; el frente
que lo recibe tiene que componerlo. Un alto declarado que el contenido no llena es
la forma «largo y vacío» del mismo defecto que B1 midió como «corto y vacío».

### Las reglas que salen de la medición

1. **Ningún hueco por encima de 1,56 pantallas** (el máximo de nk @1440).
2. **Un acontecimiento es un ATERRIZAJE**: algo que estaba cambiando deja de
   cambiar en un lugar del scroll. Un elemento que cambia todo el tiempo no
   produce ninguno.
3. **Los nueve patrones ya existen.** Si ninguno sirve: frená y reportá.
4. **La sección tiene que LLENAR su alto declarado** — `s10-mobile` lo mide.
5. **Cero valores fuera de los tokens. No se cambia contenido.**

---

## 7. Los instrumentos de esta corrida

En el repo, y se commitean:

```
scripts-b2/velocidad.ts       la velocidad de la cámara, cuadro a cuadro, en fh/100 px
scripts-b2/adelanto.ts        el arco de la cámara, el adelanto por tramo y el techo por segmento
scripts-b2/probar-tabla.ts    corre derivarAnclaje con una tabla candidata y compara al bit
scripts-b2/nudos.ts           vuelca los nudos del anclaje vigente
```

En el scratchpad, y no van al repo:

```
pixeles.js    decodificador PNG + luminancia + contraste WCAG (el de B1 se había perdido)
escena.js     velocidad aparente de la escena sobre la captura, acotada a la banda visible
```

El censo de acontecimientos corre como `evaluate_script` adentro de la página y
queda transcripto en §0.

---

## 8. EL CIERRE DEL BLOQUE — antes y después, con el mismo instrumento

Medido a 1920×1080 sobre `localhost:3001/v3`, con la misma receta, el mismo paso
de censo (120 px) y la misma regla de fusión (2 pasos).

| | antes de B2 | **después** | nk |
|---|---|---|---|
| pantallas del documento | 14,00 | **18,00** | 22,62 |
| momentos estructurales (`s7-ritmo`) | 12,0 | **16,0** | 20,5 |
| compresión (momentos / pantallas) | 0,857 | **0,889** | 0,873 |
| acontecimientos medidos | 9 | **22** | 12 |
| hueco medio | 0,90 pantallas | **0,67** | 1,11 |
| **hueco MÁXIMO — el gate** | **2,44 pantallas** | **1,11** | **1,56** |
| hueco mínimo | 0,33 | 0,33 | 0,67 |
| pico de velocidad de la cámara | 6,0945 alturas/pantalla | **4,6198** (−24,2 %) | — |

> **El gate está cumplido: el hueco máximo pasó de 2,44 a 1,11 pantallas, por
> debajo del 1,56 de la referencia.** Y no por un evento suelto: los veintiún
> huecos del recorrido caen entre 0,33 y 1,11, o sea que **el recorrido entero
> entra en la banda de nk salvo por abajo** — somos más densos, no más flacos.

Los veintiún huecos, en pantallas y en orden:

```
0,56 · 0,33 · 1,11 · 0,78 · 0,67 · 0,33 · 0,67 · 0,33 · 1,00 · 0,44 · 0,78
1,00 · 1,00 · 1,11 · 0,44 · 0,44 · 0,78 · 0,56 · 0,44 · 0,89 · 0,33
```

### Por sección, atribuido por DUEÑO del elemento y no por posición de scroll

⚠ **La diferencia importa y cambia una cifra.** Un bloque aterriza cuando su
caja termina de entrar al cuadro, así que sus piezas pueden aterrizar **antes**
de que su sección llegue al tope del viewport. Partir los grupos por el `scrollY`
del aterrizaje le atribuye al Hero un grupo que es de Quiénes somos.

| # | sección | antes | después | quién |
|---|---|---|---|---|
| 01 | hero | **0** | **0** | A — imposible, ver abajo |
| 02 | quiénes somos | 2 | **4** | A |
| 03 | números | **0** | **6** | B |
| 04 | trabajos | 2 | **4** | B |
| 05 | servicios | 1 (+2 montajes) | **4** | C |
| 06 | tu panel | 1 | **2** | D |
| 07 | por qué develOP | 0 propios | **1** | D |
| 08 | cierre | **0** | **1** | D |

---

## 9. EL HERO — LA CUARTA PREMISA DE LA INSTRUCCIÓN QUE UNA MEDICIÓN REFUTA

**La instrucción de este bloque dice, textual: *«Hero: hoy es un momento —la
entrada del titular— y la escena en reposo. Puede tolerar uno más.»* Medido: no
es uno. Es CERO, y la coreografía del hero NUNCA CORRE.**

### La cuenta que lo prueba

Un acontecimiento es el `fin` del rango de un bloque. Con `fondo = topDoc + alto`
y una ventana `V`, los dos patrones que el hero usa cierran acá:

```
P2   top bottom      → bottom bottom          cierra en  fondo − V
P1   top bottom-=80  → bottom bottom-=240     cierra en  fondo − V + 240
```

El hero es la **primera** sección y mide **una** pantalla, o sea `topDoc = 0` y
`fondo = V`. Reemplazando:

```
P2 (la bajada y el CTA)   cierra en  y = −360
P1 (el titular)           cierra en  y = −295
```

**Los dos rangos cierran arriba del documento.** Los dos bloques llegan a destino
antes del primer píxel de scroll: lo que el visitante ve en el hero está quieto
desde el cuadro cero. No es que entren juntos —que es lo que la instrucción
suponía y lo que el propio docblock de `Hero.tsx` afirmaba—: **no entran.**

### Las tres salidas, cerradas, con lo que cuesta cada una

| salida | por qué no |
|---|---|
| `anclaje: 'seccion'` en el P1 | subiría su `fin` a `y` 240 y sería el único aterrizaje posible, pero deja el `h1` **en 0,8065 de progreso en el primer cuadro** — servido a media entrada, que es literalmente lo que el docblock del hero decidió no hacer |
| darle **dos pantallas** al hero | `s8-chrome.invariant.ts` §2 afirma `pantallasDe(primera) === 1`, porque de ahí sale el nacimiento de la pastilla de navegación (`100svh − 72px`). **Aflojar una afirmación está prohibido** |
| bajar el texto a los últimos 240 px del cuadro | movería el borde seguro del texto contra el logo que B1 midió —contraste 10,45:1 bajo el glifo a 1440, cero píxeles bajo AA— y obligaría a rehacer esa medición |

**Queda anotado y NO arreglado.** El hero es la única de las ocho que aporta
cero, y el sitio llega igual a un hueco máximo de 1,11 pantallas porque el
primer aterrizaje del documento —el de Quiénes somos, en `y` 600— cae a 0,56
pantallas del origen.

### Las cuatro premisas refutadas, juntas

Este bloque de trabajo lleva **cuatro** premisas escritas por el dueño del
proyecto que una medición dio vuelta. Van juntas porque el patrón importa más
que cada una:

| # | la premisa | lo que midió el instrumento |
|---|---|---|
| 1 | **B1** · *«el home tiene de más y hay que restar»* | **no somos largos, somos cortos y vacíos**: 14,00 pantallas contra 22,62 y 12,0 momentos contra 20,5 |
| 2 | **B2** · *«faltan momentos, agregá acontecimientos»* | la densidad media **ya superaba** a la de la referencia (0,90 contra 1,11); el defecto era **un pozo** de 2,44 pantallas contra 1,56 |
| 3 | **B2 §0.3** · *«el hueco de la foto se dimensiona por media pantalla»* | se dimensiona por su **relación de aspecto**, y al bit: 1481,59 / 987,72 = **1,500 exacto** |
| 4 | **B2** · *«el hero es un momento»* | es **cero**, y su coreografía cierra en `y = −360` y `y = −295`: arriba del documento |

⚠️ **Las cuatro se encontraron midiendo ANTES de construir**, que es la única
razón por la que ninguna se ejecutó. La tres se habría llevado por delante el
reparto que B1 dejó; la dos habría gastado el sprint agregando eventos donde ya
pasaban cosas.

---

## 10. LO QUE QUEDA ABIERTO

### 🔴 PRIORITARIO · LA MESETA DE TRABAJOS — un defecto VISIBLE, decidido por el dueño

**En `scrollY` 8640 y 9720 —los dos bordes de tramo de la secuencia— los TRES
planos están en `visibility: hidden` a la vez, o sea que el escenario queda vacío
un instante.** Medido con scroll real a 1920×1080.

**La causa.** La instrucción pide *«cada uno llega, **se queda**, y sale»*. Para
que un proyecto se vea quieto, el progreso local tiene que saturar donde TERMINA
la llegada de P7, que es **`3 / 3,5`** de su ventana. Hoy no satura, así que la
salida de uno termina **exactamente** donde arranca la llegada del siguiente y
entre las dos no hay un solo cuadro con algo pintado.

**Por qué no se arregló acá, y está bien que no.** Ese `3 / 3,5` vive en
`_lib/motion/patrones-piezas.ts`, y **`s7-contrato` §3 prohíbe que un archivo de
producto importe un valor de `_lib/motion/`** — la regla existe para que un valor
medido de un patrón tenga una sola fuente. Escribirlo a mano en la sección sería
crear la segunda.

> **LA SALIDA, para el sprint que sigue: `_secciones/_contrato/motion.ts` tiene
> que EXPONER el corte llegada/salida de un patrón con tramos.** Hoy sólo lo
> tiene `PATRONES`, que la sección no puede importar. Con ese corte publicado
> desde el contrato, la meseta se construye con el mismo `asentar` que ya usan
> Servicios, Tu panel y el Cierre, y sin una segunda fuente de nada.

**Y va junto con esto**, que es del mismo arreglo: `trabajos/contenido.ts`
declara `PATRONES_DE_LA_SECCION = ['P7']` y la sección hoy consume **dos** (P7
para los planos, P2 para el marco). El frente no podía tocar `contenido.ts`, así
que **no se aflojó nada**: `trabajos.invariant` §14 afirma las dos cosas por
separado —lo que la tabla dice y lo que el fuente consume— y publica la
desincronización con su dueño. Se corrige cuando se corrija la meseta.

### 🟡 ACEPTADO · El primer proyecto se ve la mitad de tiempo — **decisión revocable**

Medido con scroll real a 1920×1080: **Esquina** tiene opacidad > 0,4 entre
`scrollY` ~8100 y 8640, o sea **~540 px**, contra **~800 px** de El Garage
(8900–9700) y de Banú (10000–10800). Y su llegada **arranca abajo del pliegue**:
el centro de su tarjeta cae en `y` 1491 a `scrollY` 7800 —411 px por debajo del
borde inferior de la ventana—, en 1091 a 8200, y recién en 791 a 8500.

**La causa es estructural**: el ancla de P7 es `top bottom → bottom bottom` sobre
la sección, así que el primer tercio del recorrido transcurre mientras la sección
todavía está entrando.

**La alternativa existe y tiene su número: repartir los tres tramos sobre el PIN
en vez de sobre el recorrido.** Le da al primer proyecto el mismo tiempo que a
los otros dos, y cuesta esto:

| | reparto sobre el recorrido (hoy) | reparto sobre el pin |
|---|---|---|
| tiempo visible del primer proyecto | ~540 px | ~800 px, igual que los otros |
| aterrizaje del primer proyecto | `scrollY` 8640 | 9360 |
| **hueco contra el marco de la sección** | **0,78 pantallas** | **1,44 pantallas** |

**Se eligió el hueco chico porque el gate de este bloque es el hueco MÁXIMO.**
Queda con sus dos números para que la decisión se pueda dar vuelta el día que el
criterio sea otro.

### 🔵 EL HALLAZGO DE LA INTEGRACIÓN — tres frentes aislados y una primitiva que faltaba

**Servicios, Tu panel y el Cierre llegaron al mismo mecanismo, con el mismo
cuerpo, en la misma corrida y sin poder verse entre sí.** Cada frente tenía
prohibido escribir fuera de sus carpetas, y los tres `asentamiento.ts` salieron
con las mismas tres constantes del censo, la misma `asentar` y las mismas dos
funciones de medición, carácter por carácter.

**Eso no es un dato sobre los frentes: es un dato sobre el problema.** Tres
secciones sin relación entre sí tenían el mismo defecto —un canal cuya ventana
cierra en el píxel exacto donde su tramo se acaba, así que nunca llega a verse
quieto— y la única forma de arreglarlo era la misma. Cuando tres soluciones
independientes convergen carácter por carácter, lo que falta no es coordinación
entre quienes las escribieron: **es una primitiva que el contrato no tenía.** El
ancla de un canal ADENTRO de un tramo era implícita —el tramo entero— y no había
dónde declararla.

La Fase 2 la escribió: `_contrato/asentamiento.ts` (lo que se produce) y
`_invariantes/asentamiento.ts` (lo que se mide, y que por vivir ahí no viaja al
bundle del cliente). Cada sección se queda **sólo con su propia derivación**, que
es lo único que es una decisión suya.

⚠️ **Y es la misma clase de falta que abre el pendiente prioritario de arriba**:
la meseta de Trabajos no se puede construir porque el contrato tampoco expone el
corte llegada/salida de un patrón con tramos. Son dos huecos del mismo contrato,
encontrados el mismo día por dos caminos distintos.

### Los otros, sin prioridad asignada

- **`s5-peso`: lo propio de `/v3` mide 61,3 KiB crudo contra un presupuesto
  declarado de 60** (−1,3 KiB, 2,2 %). Es el costo de los acontecimientos que
  este bloque agregó. **No se aflojó el número**: su propio docblock dice que
  está escrito «para que se pueda discutir el número y no la intención», y el
  presupuesto se fijó cuando `/v3` era el esqueleto.
- **Los cuatro diferenciales no pueden entrar de a uno**: P5 declara escalonado
  **0** —valor medido— así que `ventanaDeHijo` le da a las cinco piezas la misma
  ventana `[0, 1]` por construcción. Cambiar el escalonado es cambiar un valor de
  un patrón.
- **El Cierre no puede tener dos acontecimientos propios**: su primer aterrizaje
  posible cae a **44 px** del último de `por-que-develop` y el censo funde todo lo
  que esté a 240 px o menos. Y quedan **120 px de cola** al final del documento
  sin nada, porque la línea de cierre no se animó: colgarla de P2 la haría correr
  en 34,92 px de scroll, un golpe y no un gesto.
- **`por-que-develop` se pasa 23,70 px de su alto a 1440** (renderiza 923,70 en
  una ventana de 900). Pendiente heredado de B1, no cerrado. Y apareció un
  hallazgo nuevo: **el modelo de P5 de `s7-por-que-develop.invariant` §8
  subestima el defecto en un 50 %**, porque deriva el rango de
  `ALTO_MINIMO_DEL_BLOQUE_SVH` en vez del alto real.
- **Dos contadores de líneas del repo no coinciden**: `s5-codigo` §8 usa
  `split('
').length`, que suma uno en todo archivo terminado en salto;
  `s6-lane` §7 y `s7-contrato` §7 cuentan saltos. Un archivo de 300 saltos queda
  verde en dos instrumentos y rojo en el tercero.
- **Sólo se midió a 1920×1080**, salvo la ventana del frente D, confirmada a
  1440×900. **El aire muerto sobre el píxel no se volvió a medir** y se reporta
  como *no medido*, no como «no empeoró».
- **No hay recorrido grabado**: `chrome-devtools-mcp` no graba. La evidencia son
  las dieciséis capturas de `docs/rediseno/capturas/b2/`.

