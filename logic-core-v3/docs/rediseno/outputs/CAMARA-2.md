# CAMARA-2 · MOVER UN SOLO KEYFRAME — medido, y la hipótesis ya estaba medida

**Sprint de MEDICIÓN. No se aplicó nada.** `choreography.ts` cierra con el mismo
sha256 con el que abrió (`0c7c6e39…95a17d`), comprobado por los propios scripts.
Worktree `C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre
`5236872d` (TAPADO-1).

**Instrumentos** (nuevos, `scripts-camara2/`):

| archivo | qué hace |
|---|---|
| `camara2-comun.ts` | el banco: el batido recompuesto con su control, y el guardián de contaminación |
| `a-moire.ts` | PASO 2 — el techo del batido, en el cuadro del gate y en los verticales, y el pasaje |
| `b-paredes.ts` | PASO 3 — las cuatro paredes, cada una despejada como desigualdad |
| `c-preloader.ts` | PASO 1 y 5 — la identidad del objeto y el costo de los dos caminos |

Y **reusa dos de CAMARA-1 en vez de copiarlos**, que es el único cambio que este
bloque hace sobre archivos ya commiteados (`00317bed`):

| archivo | qué cambió |
|---|---|
| `scripts-camara/d-simulacion.ts` | la carpeta de capturas y la de salidas entran por argumento (`--carpeta`, `--salidas`); por defecto, las de CAMARA-1 |
| `scripts-camara/e-gate.ts` | ídem `--salidas`, y **reconstruye con `npm run build` antes de `verificar`** (`--construir=no` lo saltea) |

Copiar las cuarenta líneas de `medirVentana` habría dejado dos medidores que se
pueden desincronizar. Ninguno de los dos cambios mueve una cifra de CAMARA-1: los
valores por defecto son los de antes.

**Salidas**: `outputs/camara2/`. **Capturas**: `capturas/camara2/h2575-*.png`,
comparables contra `capturas/camara/d34-*.png` y `capturas/tapado/hoy-*.png`.

---

## 0 · EL RESULTADO, ARRIBA DE TODO

**La palanca no tiene margen: el gate clava la pose del hero.** Corriendo los
diecisiete invariantes que las dos pasadas del gate encontraron sensibles, uno por
distancia:

| distancia del hero | rojos de 17 |
|---|---|
| **19 (hoy)** | **0** |
| 20 | **8** |
| 21 | 11 |
| 22 | 12 |
| 23 | 11 |
| 24 | 13 |
| 25,75 | 14 |

Una unidad de movimiento y se caen ocho. No hay un techo en 25,75 que se pueda
aprovechar: **la mayor distancia con cero rojos es la de hoy**. (La fila de 19 es
el control del barrido: si algo hubiera dado rojo ahí, el instrumento no mediría
la palanca sino su propio ruido.) El resto de este
reporte publica dónde está cada pared —que sigue siendo útil para decidir qué
afirmaciones revocar—, pero la respuesta a *«¿se puede mover un solo keyframe?»*
es: **se puede, y cuesta ocho afirmaciones desde el primer paso.**

Buena parte de esas ocho son **invariantes de CALIBRACIÓN** —clavan la pose del
hero contra lo que S10/S11 midieron, con tolerancias de media celda o de dos
puntos—, no comprobaciones de que algo funcione. Mover el hero es, por
construcción, re-calibrar; y eso es una decisión del dueño, no un efecto lateral
que se pueda esconder.

---

## 0b · Y LA HIPÓTESIS YA ESTABA MEDIDA

La hipótesis dice *«alejar únicamente su keyframe … podría dar la misma mejora sin
tocar las otras siete ni el vuelo del intro»*.

**Las otras siete nunca se tocaron.** `d-simulacion.ts` y `e-gate.ts` de CAMARA-1
reemplazan **una sola cadena** —la línea de la pose del hero, que aparece una vez
en `choreography.ts`— y ninguna otra:

```
const LINEA_DEL_HERO = 'pose: { angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 },'
…
texto.replace(LINEA_DEL_HERO, LINEA_DEL_HERO.replace('distance: 19', `distance: ${distancia}`))
```

La prueba está en la salida del propio gate: con el hero en 40, `trabajos` y
`cierre` siguieron dando **3,7 y 4,7 bandas**, que son sus valores de siempre.

Así que **«d=34 global» en el reporte de CAMARA-1 quiere decir «en todos los
ANCHOS»** —porque `choreography.ts` tiene un número por keyframe y no sabe de
viewport—, **no «en todos los keyframes»**. Los 19 rojos, las 16,3 bandas y el
racimo de 25 fallas del preloader **ya son el resultado de mover el hero solo**.

Lo que este bloque agrega es lo que aquél no preguntó: **dónde está cada pared**,
en vez de saber que a 40 ya se cruzaron todas.

---

## 1 · PASO 1 — ¿SE PUEDE MOVER UN KEYFRAME SOLO?

**Sí, la distancia es por keyframe.** Son ocho literales independientes en
`CHOREO_KEYFRAMES` —`hero=19 · quiénes somos=14 · números=18,5 · trabajos=20 ·
demos=14 · cierre=27 · cierre·sostén=27`— y `sampleTrack` interpola cada canal por
separado. Ningún keyframe deriva su distancia de otro.

### 🔴 Pero el preloader es el MISMO OBJETO, y está afirmado

```
src/lib/scene-framing.ts:144
export const SCENE_ENTRY_POSE: ChoreoPose = CHOREO_KEYFRAMES[0].pose
```

Medido: `SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose` → **`true`**. No es
igualdad de valores, es identidad. Y no es un accidente: el docblock lo declara
como propiedad —*«si el humano recalibra ese keyframe, el preloader lo sigue sin
que nadie edite un segundo lugar»*— y **`s16-encuadre.invariant.ts:219` lo afirma
con `===`**.

Cuatro archivos del intro leen esa pose: `introLanding`, `introParticleField`,
`introParticleLanding`, `introParticleProbe`.

**¿Se puede desacoplar? Sí, y no conviene.** Bastaría con que `SCENE_ENTRY_POSE`
dejara de ser ese objeto. Eso rompe la afirmación de identidad —revocable, es un
atajo declarado— pero **abre un salto en el relevo**: el preloader dejaría el logo
de un tamaño y la escena lo tomaría de otro, en el mismo cuadro. El número está
en §5.2.

**No es un freno**: la hipótesis sigue viva, con el costo del preloader
cuantificado. Se sigue.

---

## 2 · PASO 2 — EL MOIRÉ, QUE ES LO QUE DECIDE

### 2.0 · El control de equivalencia

`phaseGradient` y `sunAzimuthAt` son funciones **locales** de
`s11-pantalla.invariant.ts` y no se exportan, así que este banco las recompone.
Una copia sin control es una fórmula que se arregla en un lado solo, y por eso lo
primero que corre es el contraste contra lo que el invariante publica:

```
d= 19  celda  108px (pub 108) · batido  626px (pub 626) ·   3.1 bandas (pub 3.1)   COINCIDE
d= 40  celda   34px (pub  34) · batido  118px (pub 118) ·  16.3 bandas (pub 16.3)  COINCIDE
```

⚠ **El control cobró una pieza en el primer intento.** La fila de la corrida del
gate se cargó como `distancia: 34` porque la línea publicada dice *«hero celda
34px»* — y ese 34 es el **tamaño de la celda**, no la distancia; la corrida había
sido con 40. El control salió «NO COINCIDE» y por eso existe.

### 2.1 · El techo del batido

| cuadro | bandas hoy | techo con <5 (la prosa) | techo con <6 (lo afirmado) |
|---|---|---|---|
| **1920×1080 (el del gate)** | 3,1 | **25,75** | **28,25** |
| 390×844 | **0,7** | ninguno hasta 44 | ninguno hasta 44 |
| 425×844 | **0,8** | ninguno hasta 44 | ninguno hasta 44 |
| 768×1024 | **1,2** | ninguno hasta 44 | ninguno hasta 44 |
| 1024×768 | 2,2 | 31,5 | 34,25 |

La curva a 16/9: `d19=3,1 · d21=3,5 · d23=4,1 · d25=4,7 · d27=5,5 · d29=6,3 ·
d31=7,4 · d33=8,6 · d35=10,2 · d37=12,2 · d39=14,7 · d41=18,1 · d43=22,9`.

**Respuesta a la pregunta del paso: el mayor valor que deja el batido adentro de
2–5 es `d = 25,75`.** Con la ventana que la condición realmente corre (`<6`),
28,25.

### 2.2 · ⚠ Pero la regla de 2–5 es una regla de ESCRITORIO

El invariante mide a **1920×1080**. En los cuadros verticales, que es donde esta
palanca viviría, **el hero da 0,7 · 0,8 · 1,2 bandas HOY** — o sea que ya está
**debajo del piso de 1,5** que la misma condición exige, y alejarlo lo acerca a la
regla en vez de alejarlo (a 390 va de 0,7 a ~1,0 en 25,75 y a 2,5 en 43).

El batido se cuenta como `ancho del cuadro / ancho del batido`: un cuadro angosto
entra menos veces. **No es que en vertical el moiré esté mejor: es que la cifra
que la regla usa no describe lo mismo ahí.**

### 2.3 · 🔴 El pasaje ya está roto HOY, y el gate no lo ve

Entre el hero (p=0) y `quiénes somos` (p=0,375) la cámara recorre distancias
intermedias. Barrido de 41 paradas, a 16/9:

| distancia del hero | peor del pasaje | dónde | muestras |
|---|---|---|---|
| **19 (hoy)** | **18,1 bandas** | p=0,131 | 3,1 · 3,5 · 15,6 · 10,8 · 2,6 · 6,3 |
| 22 | 20,5 | p=0,206 | 3,8 · 4,4 · 14,8 · 7,0 · 18,2 · 6,3 |
| 24 | 23,6 | p=0,122 | 4,4 · 5,1 · 14,2 · 5,7 · 13,4 · 6,3 |
| 26 | 17,3 | p=0,178 | 5,1 · 6,0 · 13,7 · 4,8 · 10,6 · 6,3 |
| 28 | 18,0 | p=0,225 | 5,9 · 7,0 · 13,1 · 18,0 · 8,8 · 6,3 |
| 31 | 25,1 | p=0,103 | 7,4 · 9,0 · 12,3 · 10,1 · 7,0 · 6,3 |
| 34 | 25,6 | p=0,113 | 9,4 · 11,8 · 11,5 · 7,0 · 5,8 · 6,3 |

**Con la distancia de hoy el pasaje ya llega a 18,1 bandas.** El invariante toma
tres muestras —p=0, 0,625 y 0,95— y entre ellas el batido se va a 15 y 18 sin que
nada lo mire. O sea que *«¿el moiré se rompe en el pasaje?»* tiene respuesta **sí,
y desde antes de esta palanca**. Lo que la palanca hace es empeorarlo de 18,1 a
25,6 en el peor caso, no abrir un problema nuevo.

---

## 3 · PASO 3 — LAS CUATRO PAREDES, CON SU VALOR EXACTO

CAMARA-1 supo que a 40 se cruzaban; acá cada una se despeja como desigualdad.

| d de cruce | pared | regla | fuente |
|---|---|---|---|
| **25,75** | **batido (16/9, <5 bandas)** | `bestBands > 1.5 && worstBands < 6`, con la prosa en 2–5 | `s11-pantalla.invariant.ts` |
| 28,25 | batido (16/9, <6 bandas) | ídem, la condición literal | `s11-pantalla.invariant.ts` |
| **30,59** | **techo de luz del hero** | media del cuadro en la pose del hero `< 210` | `s12-barrido.invariant.ts` |
| 33 | capa fina del fondo | `MOIRE_NEAR_RADIUS (38) > mayor distancia + 5` | `s10-fondo.invariant.ts` |
| 33,39 | campo de motas | `PARTICLE_R_MAX (34) > hypot(d, 6,4)` | `introParticles.invariant.ts` |

La luz, medida (un proceso hijo por valor, con la pose mutada antes del import —
ver §6):

| d | media del hero | |
|---|---|---|
| 19 | 204,3 | margen 5,7 |
| 24 | 207,4 | margen 2,6 |
| 28 | 209,1 | margen 0,9 |
| 30 | 209,8 | margen 0,2 |
| **32** | **210,5** | 🔴 cruza |
| 34 | 211,1 | 🔴 cruza |

El 204,3 de hoy es su propio control: el docblock de `s12-barrido` declara *«el
margen del valor embarcado es de 5,7 puntos»*, y 210 − 204,3 = 5,7.

**La pared que aprieta primero es el batido, en 25,75** — antes que la luz, la
capa fina y las motas. Y las dos últimas no dependen del aspecto: son la posición
de la cámara contra la geometría de la sala.

---

## 4 · PASO 4 — CUÁNTO SE GANA EN EL TECHO

Medido en el navegador, recarga limpia por ancho, con el hero en **25,75** y el
texto donde TAPADO-1 lo dejó:

| ancho | HOY | **hero solo a 25,75** | d=34 (CAMARA-1) | |
|---|---|---|---|---|
| 390 × 844 | 17,2 % | **8,8 %** | 7,2 % | ✅ un dígito, y a 1,6 puntos de d=34 |
| 425 × 844 | 11,4 % | **7,8 %** | 2,9 % | ✅ un dígito, a mitad de camino |
| 768 × 1024 | 41,6 % | **15,7 %** | 4,3 % | 🔴 dos dígitos |
| 1024 × 768 | 15,8 % | **4,6 %** | 0,2 % | ✅ un dígito |

Tinta bajo AA con 25,75: 8,8 % · 7,0 % · 15,5 % · 4,5 %.

**Tres de cuatro llegan a un dígito en el techo del batido. 768 queda en 15,7 %.**

Y «dónde exactamente», que es lo que el paso pide: cuánto del camino entre HOY y
d=34 cubre el techo del batido.

| ancho | camino cubierto | lectura |
|---|---|---|
| 390 | **84 %** | prácticamente d=34 |
| 1024 | **72 %** | cerca |
| 768 | **69 %** | cerca en proporción, pero el residuo son dos dígitos |
| 425 | **42 %** | a mitad de camino |

Capturas: `capturas/camara2/h2575-*.png`.

⚠ **Por qué 768 se queda.** A d=34 su mejora no venía de que el logo se
achicara sino de que **el codo de `frameX` se soltaba y lo empujaba a la derecha**,
fuera de la columna (que ahí mide 47,4 % del ancho por la grilla `tablet`). El
recorrido lateral es `|medio ancho del cuadro − caja/2| × 0,88`
(`recorridoDeEncuadre`, con `FRAME_TRAVEL_SAFETY`), y crece con la distancia —en
unidades de mundo, a 768×1024—:

| d | medio ancho del cuadro | recorrido | con `frameX` 0,5 |
|---|---|---|---|
| 19 (hoy) | 4,74 | 1,02 | 0,51 |
| **25,75** | 6,27 | **2,37** | **1,18** |
| 34 | 8,18 | 4,05 | 2,02 |

En el techo del batido el empuje va por la mitad del que hace falta, y la captura
lo muestra: el logo sigue encima de «TU NEGOCIO / VENDIENDO».

---

## 5 · PASO 5 — EL GATE Y EL PRELOADER

### 5.1 · El gate

`e-gate.ts` aplicó `distance: 25.75`, **reconstruyó con `npm run build`** y corrió
`verificar` entero. Restauró con sha256 idéntico.

| | d = 40 (CAMARA-1) | **d = 25,75** |
|---|---|---|
| invariantes en rojo | 20 | **15** |
| agregados con falla | 13 | **11** |
| causados por la palanca | 19 | **14** |

(el que no: `s5-peso`, deuda de TAPADO-1 —ver §7.6—, roja en los dos.)

**Y una parte de esos 14 no es rotura: son afirmaciones que DECLARAN un defecto y
se dan vuelta porque la palanca lo arregla.** Este repo escribe los defectos en
positivo —*«🔴 `hero`: la tinta es MÁS ANCHA que el cuadro»*— para que el día que
se arreglen, la línea se caiga sola. Con el hero en 25,75 se cayeron cuatro:

| invariante | lo que declaraba | lo que da ahora |
|---|---|---|
| `s10-vertical` | «la tinta es MÁS ANCHA que el cuadro» | **1,7853 contra 2,0000 — entra el 100 %** |
| `s10-vertical` | «el PRELOADER es INERTE a 390» | **175,73 px**, ya no el centro geométrico |
| `s9e-composicion` / `s16-encuadre` | «el eje óptico cae AFUERA de la caja» | **x0 0,2167 → 0,1127: cae adentro** |
| `s8e-encuadre` | «`frameX` no corre nada en el preloader» | el codo se soltó y corre |

El resto sí son movimientos de composición (la posición horizontal clavada
215,28 → 201,76; la tinta del preloader 523×364 → 337×235; la elevación de entrada
→ 13,96°) y **una pared que las cuatro de §3 no veían**, en §5.2.

### 5.2 · 🔴 La quinta pared, que el despeje a mano no encontró

`s12e-barrido` y `s11e-piso` se caen en 25,75 **aunque el techo de luz de 210 esté
en 30,59**. Lo que se rompe ahí es otra afirmación:

```
FALLA  la escena sin celosia, a la luz de hoy, reproduce el numero de S10 en la
       unica pose que nadie re-ilumino ni movio: el hero
       · hero 219.8 (S10 216, +1,3 por el encuadre de V3-E)
```

No compara contra un techo: compara contra **el valor que S10 midió (216) con una
tolerancia de 2**. Mover la cámara cambia ese valor, y 219,8 se pasa por 3,8. Es
una pared más apretada que todas las de §3 y **no se veía despejando
desigualdades**: había que correr el invariante.

Por eso el paso siguiente —`d-cruces.ts`— deja de despejar a mano y **corre los
invariantes de verdad, distancia por distancia**, para publicar la mayor con cero
rojos.

### 5.3 · El preloader — el costo de los dos caminos

Con el hero en 25,75, y el preloader ARRASTRADO (que es lo que pasa si no se toca
nada más, porque es el mismo objeto):

| ventana | tinta del preloader | centro X | salto si se DESACOPLA |
|---|---|---|---|
| 390 × 844 | 335 → 335 px (0 %) | 195,0 → 204,6 | 0 px de ancho · **9,6 px** de centro |
| 425 × 844 | 366 → 346 px (−5 %) | 212,5 → 229,8 | 20 px · **17,3 px** |
| 768 × 1024 | 555 → 420 px (**−24 %**) | 430,7 → 460,5 | **135 px** · 29,9 px |
| 1024 × 768 | 419 → 317 px (**−24 %**) | 645,5 → 667,9 | **102 px** · 22,4 px |

Y la inclinación de aterrizaje: **18,616° → 13,958°** (Δ −4,66°).

- **Arrastrarlo** cuesta que el vuelo entero del intro cambie de destino: el logo
  del preloader aterriza hasta un 24 % más chico y 4,66° más plano. Es el racimo
  de fallas `s8-intro` · `s8-relevo` · `s8e-encuadre` · `s13e-*` · `s14e-*` ·
  `s15e-*`, que aparece **desde d=20**.
- **Desacoplarlo** cuesta la afirmación de identidad de
  `s16-encuadre.invariant.ts:219` **y abre un salto en el relevo** de hasta
  **135 px de ancho y 30 px de centro, en un cuadro**. O sea que desacoplar no
  evita el problema: lo cambia de lugar, de «el vuelo termina en otro lado» a
  «el logo salta cuando la escena toma el control».

**Ninguno de los dos caminos es gratis, y el segundo es peor.** El preloader
existe para que el relevo no se vea; un salto de 135 px es exactamente lo que ese
diseño compra.

### 5.4 · La primera distancia que tira a cada uno

| d | invariantes |
|---|---|
| **20** | `s10-vertical` · `s16-encuadre` · `s8-intro` · `s8-relevo` · `s8e-encuadre` · `s11e-piso` · `s12e-tension` · `s14e-intro-escala` |
| 21 | `s9e-composicion` · `s12e-barrido` · `s14e-intro-lectura` |
| 22 | `s13e-intro-campo` |
| 24 | `s15e-intro-aterrizaje` |
| 25,75 | `s13e-intro-particulas` |

⚠ **`s13e-intro-campo` no es monótono**: rojo en 22, verde en 23, rojo otra vez
en 24. Es un umbral que el valor cruza y descruza, no una pared. Publicarlo como
«se cruza en 22» sería más prolijo que la medición.

---

## 6 · NOTAS DE MÉTODO

- **El guardián de contaminación.** Dos scripts de este banco escriben
  `choreography.ts` y lo restauran al cerrar. Correr una medición mientras uno de
  ellos tiene el árbol tocado devuelve la distancia modificada como si fuera la de
  hoy: salió una tabla de saltos del preloader **con todos los valores en cero** y
  «hoy = 25,75». Desde entonces la distancia de hoy se DECLARA (19) y se
  comprueba; un árbol tocado es una falla ruidosa y no una tabla plausible.
- **La luz necesitó un proceso hijo.** `sampleFrame` usa el `track` de módulo de
  `frameProbe.ts`, armado en el import, sin parámetro por donde pasarle otra
  pista. Lo que sí se puede es mutar la pose **antes** de ese import y pedirlo con
  `import()` dinámico. Como los módulos se cachean por proceso, cada distancia
  necesita el suyo. Nada de eso toca el árbol.
- **El gate reconstruye antes de correr.** `verificar` lee de `.next` y un dev
  server lo contamina — así fue como TAPADO-1 pasó en verde con `s5-peso` 12,4 B
  arriba del techo. `e-gate.ts` ahora corre `npm run build` con la llave prendida
  antes de `verificar`.

---

## 7 · EL VEREDICTO

**La hipótesis no se confirma ni se refuta por geometría: se disuelve.** Mover un
solo keyframe es posible y ya estaba medido; lo que no existía era una distancia
con margen. El gate clava la pose del hero, y **el primer escalón cuesta ocho
afirmaciones**.

Lo que sí queda, y es lo útil para decidir:

- **La mejora es real y está cuantificada**: a 25,75, 390 pasa de 17,2 a 8,8 % y
  1024 de 15,8 a 4,6 %. Pero **se compra revocando 14 afirmaciones**, no cruzando
  una pared física.
- **Ocho de esas catorce son de calibración** —clavan la pose contra lo que S10 y
  S11 midieron— y cuatro son **defectos declarados que la palanca arregla**. Esa
  distinción es la que el dueño necesita para decidir: no es «romper el gate», es
  **recalibrar**, y recalibrar es una decisión suya.
- **768 sigue siendo el que no cierra** (15,7 % a 25,75) y necesita d=34, que está
  tres paredes más allá.
- **El preloader no tiene salida barata** (§5.3).

---

## 8 · LO QUE QUEDA ANOTADO

1. 🔴 **La palanca no tiene margen**: 8 rojos en el primer escalón (d=20), 14 en
   el techo del batido. La mayor distancia con cero rojos es la de hoy (§0).
2. 🔴 **La hipótesis de este sprint ya estaba medida** (§0b). Mover el hero solo es
   lo que CAMARA-1 hizo; «global» ahí quería decir «en todos los anchos». Lo nuevo
   es dónde está cada pared, no si se pueden mover las otras siete.
3. 🔴 **El pasaje hero → `quiénes somos` ya viola la regla del batido HOY**: 18,1
   bandas contra una ventana de 2–5, con la distancia sin tocar. El invariante
   muestrea tres progresos y no ve el camino entre ellos. **Es un defecto abierto
   del árbol, anterior a cualquier palanca de cámara**, y no es de este bloque.
4. ⚠ **La regla de 2–5 bandas es de escritorio.** Se mide a 1920×1080 y en los
   cuadros verticales el hero da 0,7–1,2 bandas, ya debajo del piso de 1,5 de la
   misma condición. Si la palanca se condiciona por ancho, **el gate no la ve**:
   quedaría verde midiendo un cuadro en el que el cambio no se aplica. Eso es
   «verde por arnés» y hay que decidirlo antes de condicionar nada.
5. ⚠ **Dos paredes NO dependen del aspecto**: la capa fina del fondo (d<33) y el
   campo de motas (d<33,39) comparan la posición de la cámara contra la geometría
   de la sala. Una palanca condicionada por ancho las cruza en el runtime vertical
   **aunque el invariante siga verde**, porque el invariante lee
   `CHOREO_KEYFRAMES` y ahí el número no habría cambiado.
6. ⚠ **El preloader no se puede desacoplar gratis**: `SCENE_ENTRY_POSE` **es**
   `CHOREO_KEYFRAMES[0].pose`, con la identidad afirmada en
   `s16-encuadre.invariant.ts:219` y cuatro archivos del intro leyendo esa pose.
   Arrastrarlo cambia el destino del vuelo; desacoplarlo abre un salto en el
   relevo (§5.2).
7. ⚠ **`s5-peso` sigue en rojo en el árbol commiteado** —12,4 B arriba del techo,
   deuda de TAPADO-1 que CAMARA-1 ya reportó—. Este bloque lo vuelve a ver porque
   ahora el gate reconstruye antes de correr, que es justamente lo que hacía falta
   para que no se escondiera.
8. ⚠ **`s13e-intro-campo` cruza y descruza** (rojo en 22, verde en 23, rojo en 24):
   es un umbral, no una pared. Cualquier lectura que lo cite como «se cruza en X»
   está siendo más prolija que la medición.
