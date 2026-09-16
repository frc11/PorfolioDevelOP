# TAPADO-1 · EL INSTRUMENTO MENTÍA, Y EL TEXTO SE MUDÓ ABAJO

Worktree `C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre
`cdd7ae03`. Puerto 3000, la receta canónica (`MEDICION-NAVEGADOR.md`).

**Instrumentos nuevos** (`scripts-tapado/`, leen y no escriben producto):

| archivo | qué hace |
|---|---|
| `scripts-tapado/tapado-comun.ts` | el banco: Chrome propio por ancho, las ocho ventanas con su procedencia, las capas por hoja de estilos |
| `scripts-tapado/mascaras.ts` | la lectura del píxel: máscara del glifo, máscara de masa, contraste local |
| `scripts-tapado/logo-analitico.ts` | la máscara del logo pedida al muestreador analítico, un byte por píxel |
| `scripts-tapado/a-verdad.ts` | la verdad de pantalla del hero en reposo, ocho anchos |
| `scripts-tapado/b-cruce.ts` | el cruce a lo largo del scroll, ocho secciones, 41 paradas |
| `scripts-tapado/c-recibo.ts` | emite el literal del recibo que el invariante consume |

**Piezas nuevas del gate** (corren sin navegador, dentro de `verificar`):

| archivo | qué hace |
|---|---|
| `_lib/escena/__tests__/s10-logo-alto.ts` | el reparto VERTICAL derivado + `superposicionReal` |
| `_lib/escena/__tests__/s10-logo-composicion.ts` | la tabla de los ocho anchos + el recibo del navegador |

**Salidas**: `outputs/tapado/a-verdad-{centrado,hoy}.json`,
`outputs/tapado/b-cruce-{centrado,hoy}-390.json`.
**Capturas**: `capturas/tapado/{centrado,hoy}-<ancho>x<alto>.png`.

---

## 0. LA RESPUESTA, EN UNA PÁGINA

**El 0 % era real y no describía la pantalla.** `s10-vertical.invariant.ts` §5
publicaba `barridoVertical(...).minima`: el **mínimo sobre todas las posiciones
verticales que la caja podría ocupar**. Su propia línea lo decía —«existe una
altura con superposición CERO»— y era cierto. Lo que no era cierto es el título
que lo envolvía («LA SUPERPOSICIÓN CON LA COLUMNA»), porque **el bloque no estaba
en esa altura**: estaba donde lo ponía `justify-center`, o sea el medio de la
pantalla, o sea exactamente donde está el logo.

Medido sobre el píxel en la misma ventana donde el instrumento decía 0 %:

| | instrumento (antes) | pantalla, medida |
|---|---|---|
| hero a 390×844 | **0,0 %** | **54,8 %** de la tinta del titular sobre la masa negra · **54,7 %** por debajo de AA |

De las cuatro hipótesis de la instrucción: la primera (**mide cajas en vez de
tinta contra tinta**) es cierta pero secundaria —la lectura de caja da 44,1 % y
la de tinta 54,8 %, las dos lejísimos de cero—; la segunda, la tercera y la
cuarta se **refutan** con su medición (§1.3). La causa es una quinta que no
estaba en la lista: **la posición vertical del texto no se derivaba en ningún
lado, y el instrumento publicaba el mejor caso sobre posiciones que el texto no
ocupa.**

El arreglo deriva la posición real y mide ahí. Con el instrumento arreglado, el
texto del hero se mudó abajo en los anchos donde el logo lo tapa, y la
superposición bajó en cinco de los seis anchos de alcance. **En 320 no baja, y
eso está medido y declarado, no promediado.**

---

## 1. PASO 1 — EL INSTRUMENTO

### 1.1 · La causa, con su línea

Las líneas son las de **`cdd7ae03`**, o sea el árbol antes de este sprint.

| pieza | archivo:línea | qué hacía |
|---|---|---|
| el barrido | `s10-logo-lectura.ts:140-161` | `barridoVertical` recorre TODAS las alturas que caben y devuelve `{minima, maxima, peorArriba}` |
| el consumo | `s10-vertical.invariant.ts:87-93` (`minimaEn`) | devolvía **`.minima`**: el mejor caso |
| la publicación | `s10-vertical.invariant.ts:243` | lo titulaba «LA SUPERPOSICIÓN CON LA COLUMNA — 0 % en seis de siete» |
| el hueco declarado | `s10-logo-cajas.ts:79` (`SUPUESTOS_DE_LAS_CAJAS[3]`) | «la posición VERTICAL del bloque no se deriva» |
| el diferimiento que lo tapaba | `s10-logo.invariant.ts:87-89` | cuatro anchos en `noCorre`, al lado de la cifra verde |

El barrido no estaba mal: contesta **«¿es evitable moviendo el bloque?»**, que es
una pregunta buena y sigue en pie (§5b del invariante). Lo que estaba mal es que
esa respuesta se publicaba con el nombre de otra. Es la falla que este repo llama
«verde por arnés»: **el instrumento fabrica la entrada favorable que después
afirma**.

Y el `noCorre` al lado agravaba: mientras estuvo puesto, la única cifra de
superposición que existía debajo del breakpoint era ese 0 %, y un hueco declarado
junto a un verde hace que el verde parezca respaldado por lo que no se midió.

### 1.2 · La segunda enfermedad, en el instrumento nuevo

El primer banco de este sprint sacaba la máscara del glifo restando dos capturas
—con y sin texto— y quedándose con lo que cambiaba. **Donde el texto cae sobre el
logo eso no cambia**: las dos tintas son el mismo negro. Resultado medido a 390:
la línea 1 del titular publicaba **13,0 % de tinta sobre el logo con el 79,3 % de
su caja sobre masa negra**, y la luz media debajo de sus glifos daba 217 sobre
255. El instrumento sólo veía los glifos que caen sobre el fondo claro — los que
no son el problema.

Se arregló con tres capturas separadas por hoja de estilos: **A** (la vista),
**C** (el texto sin escena, para la máscara del glifo) y **D** (la escena sola,
para la máscara del logo). Está escrito en `mascaras.ts`.

Y una tercera: con la máscara del logo sacada por luminancia, **el arco de luz
baja a noche a mitad del recorrido** y el cuadro entero cae debajo del umbral. El
barrido publicó por eso «trabajos 100 %» y «servicios 100 %» sobre una masa negra
que era la noche. Desde ahí la máscara del logo se le pide al muestreador
analítico (`logo-analitico.ts`), que sabe distinguir «acá hay logo» de «acá está
oscuro».

### 1.3 · Las cuatro hipótesis, contestadas

| hipótesis | veredicto | la medición |
|---|---|---|
| ¿mide cajas de layout en vez de tinta contra tinta? | **cierta, pero no es la causa** | caja 44,1 % contra tinta 54,8 % a 390: las dos lejísimos de 0 % |
| ¿mide en un progreso que no es el que se ve al cargar? | **refutada para el hero** | el keyframe `hero` está en `p = 0,000`, que es el estado de carga. Sí es cierto para las otras seis: §5b mapea keyframes a secciones que no son la suya (`quiénes somos` → `numeros`) |
| ¿el z-order lo hace medir el logo de atrás? | **refutada** | el muestreador marcha rayos y pregunta por profundidad (`tTinta < profundidad`), no por orden de pintado; no hay un z que pueda invertir eso |
| ¿la máscara se calcula a un ancho y se aplica a otro? | **refutada** | `ASPECTO = 390/844` y `ANCHO = 390` en el mismo archivo, y §4 del invariante clava las siete posiciones contra media celda de malla |

### 1.4 · El arreglo

`s10-logo-alto.ts` deriva la posición vertical con las mismas clases que el
reparto horizontal ya leía (`min-h-svh`, `justify-*`, `content-*`, `pt-*`/`pb-*`,
`gap-*`, columnas de grilla), sobre el **mismo árbol** que `s10-logo-cajas.ts`
arma (`arbolDeLaSeccion`, extraído para no recorrer el marcado dos veces).
`superposicionReal` cruza esas cajas con la silueta del logo proyectada.

Toda clase vertical que el modelo no sabe resolver **se devuelve** en
`sinModelar` en vez de ignorarse: el hero no tiene ninguna.

**El control positivo es la composición de la captura del humano.** Le da de
comer al medidor el hero CENTRADO y exige que no lo lea como limpio; y un segundo
control corre el instrumento VIEJO sobre esa misma composición y comprueba que sí
estaba ciego. Los dos juntos impiden que alguien vuelva a publicar un mínimo con
el nombre de una superposición.

```
5 · 🔴 LA SUPERPOSICIÓN DONDE EL TEXTO ESTÁ
  ok   🔴 CON EL BLOQUE CENTRADO — la composición de la captura del humano — el hero NO está limpio
       — 48.4 % del área del texto sobre tinta del logo; el navegador midió 54,8 % de la TINTA del titular
  ok     y la composición de HOY —`justify-end` abajo del breakpoint— baja esa cifra
       — 48.4 % → 5.1 % · peor caja: «TU NEGOCIO VENDIENDO» al 18.0 %
  ok   [control positivo] el medidor de superposición REAL no está ciego: con el bloque centrado no devuelve «limpio»
  ok   [control positivo]   y el barrido VIEJO SÍ estaba ciego: sobre esa misma composición su mínimo da cero
```

### 1.5 · El modelo contra el navegador

El desvío del modelo **no se tapa con una tolerancia: se afirma su forma.**

```
  el desvío contra el navegador — apoyado abajo: 23.0 · 22.9 · 22.9 · 23.0 · 23.0 px · centrado: 11.5 · 11.5 px
  ok   el desvío del modelo es CONSTANTE dentro de cada composición  — dispersión 0.1 px apoyado · 0.0 px centrado
  ok     y ese término es el ALTO DEL CTA que el modelo no ve: 47 px en pantalla contra 24 calculados
  ok     y con el bloque CENTRADO aparece la MITAD  — 11.5 px contra 11.5 — un solo término explica los dos grupos
```

El CTA mide **47 px** en pantalla y el modelo le da **24** (la caja de línea:
`--text-cuerpo` 15 px × `--leading-texto` 1,6). Los 23 que faltan son la regla del
rollover y su separación, que `Cta.tsx` estila **por selector de atributo** y no
por clase — invisibles para un modelo que lee clases, y declarado como frontera.
Con el bloque apoyado abajo el faltante entero aparece arriba (23 px); con el
bloque centrado, la mitad (11,5 px). **Un solo término explica los dos grupos y su
factor 2.**

El único ancho que queda afuera es **768**, donde además el modelo y el navegador
cuentan distinta cantidad de renglones del titular (delta 71,7 px). Se declara,
no se esconde en un promedio.

---

## 2. PASO 2 — EL CRUCE A LO LARGO DEL SCROLL, a 390×844

41 paradas de `t = 0` a `t = 1`, las ocho secciones medidas en cada una. El texto
se lee del navegador; la máscara del logo, del muestreador analítico con el
progreso que la página tiene en esa parada (`progresoDelScroll`, la función de
producción, alimentada con la extensión de las secciones leída del DOM).

| sección | tramo `t` | pantallas | paradas | ANTES med / peor (`t`) | DESPUÉS med / peor (`t`) | cruce >5 % (pantallas) | bajo AA (mediana) |
|---|---|---|---|---|---|---|---|
| hero | 0,000–0,025 | 0,48 | 2 | 50,3 % / 50,3 % (0,000) | **12,0 % / 12,0 %** (0,000) | 0 → 0,48 | 60,9 % → **13,6 %** |
| quienes-somos | 0,025–0,175 | 2,87 | 7 | 7,8 % / 51,5 % (0,150) | 7,8 % / 51,5 % (0,150) | 2,39 → 2,39 | 29,9 % → 29,6 % |
| numeros | 0,200–0,375 | 3,35 | 8 | 18,8 % / **90,3 %** (0,375) | 18,8 % / **90,3 %** (0,375) | 3,35 → 3,35 | 66,1 % → 66,3 % |
| trabajos | 0,375–0,550 | 3,35 | 8 | 0,0 % / 55,1 % (0,475) | 0,0 % / 55,1 % (0,475) | 0 → 0 | 3,4 % → 3,4 % |
| servicios | 0,550–0,750 | 3,83 | 9 | 17,1 % / 32,0 % (0,700) | 17,1 % / 32,0 % (0,700) | 2,87 → 2,87 | 64,5 % → 63,6 % |
| tu-panel | 0,750–0,900 | 2,87 | 7 | 15,3 % / 38,1 % (0,800) | 15,3 % / 38,1 % (0,800) | 2,39 → 2,39 | 61,7 % → 60,8 % |
| por-que-develop | 0,875–0,975 | 1,92 | 5 | 13,0 % / 35,1 % (0,900) | 13,0 % / 35,1 % (0,900) | 0,96 → 0,96 | 63,1 % → 63,4 % |
| cierre | 0,950–1,000 | 0,96 | 3 | 12,7 % / 35,6 % (0,975) | 12,7 % / 35,6 % (0,975) | 0,48 → 0,48 | 43,7 % → 43,8 % |

**Las siete que este sprint no toca dan idénticas antes y después**, hasta la
décima. Es la prueba de que el cambio está acotado al hero.

Lo que la tabla dice y nadie había medido:

- 🔴 **`numeros` es peor que lo que era el hero**: pico de **90,3 %** y **66,1 %
  de su tinta por debajo de AA a lo largo de sus 3,35 pantallas**. El cruce dura
  el tramo entero — no hay una parada limpia.
- 🔴 **`servicios`** (64,5 % bajo AA, 2,87 pantallas de cruce),
  **`tu-panel`** (61,7 %, 2,39) y **`por-que-develop`** (63,1 %, 0,96) están en el
  mismo régimen.
- ✅ **`trabajos` es el único sano**: 3,4 % bajo AA. Es la sección INVERTIDA — su
  tinta es el papel sobre panel oscuro — y ahí el texto claro sobre sala oscura es
  exactamente lo que se quiere. Su «55,1 % de superposición con el logo» es real y
  **no es un problema de lectura**: las dos cifras juntas son lo que lo distingue.
- ⚠ **Resolución**: con 41 paradas cada paso mide 0,48 pantallas, y el hero ocupa
  una sola pantalla de veinte: le tocan **2 paradas**. Para el hero la cifra que
  manda es la de §4.1, medida en reposo. Para las otras siete, de 5 a 9 paradas.
- ⚠ **La celda «0 → 0,48» del hero no es una regresión.** Con dos paradas, «cuánto
  dura el cruce» se mide entre la primera y la última que pasan el 5 %: antes sólo
  la pasaba una (duración 0) y ahora las dos (duración 0,48, que es el paso). La
  cifra que describe el tramo es la mediana: **50,3 % → 12,0 %**, y el bajo AA
  **60,9 % → 13,6 %**.

---

## 3. PASO 3 — EL TEXTO DEL HERO ABAJO

**Un solo cambio, en una sola línea de producto:**

```
src/app/v3/_secciones/hero/Hero.tsx:188
-  className="flex min-h-svh w-full flex-col justify-center pt-20 pb-20"
+  className="flex min-h-svh w-full flex-col justify-end pt-20 pb-20 escritorio:justify-center"
```

Es el mecanismo responsivo que ya existe: la variante `escritorio:` conmuta en
1025, el mismo píxel donde conmuta el nivel de calidad de la escena. Abajo, el
bloque entero —titular, bajada y CTA— se apoya en el borde de abajo; el orden
interno no cambia y ninguna otra clase se toca. **1440 y 1920 conservan
`justify-center` y no se movieron un píxel** (§4.3).

`pb-20` sigue siendo el que reserva los 72 px de la pastilla de navegación
(`hero/soporte.ts` lo afirma contra `DESCUENTO_NACIMIENTO_PX`), así que
`justify-end` apoya el bloque **exactamente en ese borde** y no debajo de la
pastilla. Medido: en los seis anchos de abajo el bloque termina en `alto − 80`,
al píxel.

---

## 4. PASO 4 — LAS MEDICIONES

### 4.1 · `s10-logo` arreglado, antes y después, en los ocho anchos

Tinta del titular sobre la masa negra del logo, medida sobre el píxel con recarga
limpia por ancho. Las dos columnas salen del **mismo árbol**: «centrado»
reproduce la composición anterior con una regla que pisa el `justify-content`, así
que la única variable es la composición y no el build.

| ancho × alto | derivado: centrado → hoy | navegador: centrado → hoy | bloque hoy |
|---|---|---|---|
| 320 × 568 | 33,3 % → **33,8 %** | 30,7 % → **31,5 %** | 133–488 de 568 |
| 375 × 667 | 49,1 % → 28,1 % | 56,2 % → **47,2 %** | 346–587 de 667 |
| 390 × 844 | 48,4 % → 5,1 % | 54,8 % → **17,2 %** | 522–764 de 844 |
| 425 × 844 | 39,2 % → 3,0 % | 48,1 % → **11,4 %** | 544–764 de 844 |
| 768 × 1024 | 48,7 % → 10,9 % | 56,8 % → **41,6 %** | 591–944 de 1024 |
| 1024 × 768 | 25,6 % → 8,9 % | 20,6 % → **15,8 %** | 432–688 de 768 |
| 1440 × 900 | 0,0 % → 0,0 % | 0,6 % → **0,7 %** | 310–590 de 900 |
| 1920 × 1080 | 0,0 % → 0,0 % | 0,1 % → **0,1 %** | 385–695 de 1080 |

Los números de «antes» con el instrumento arreglado son **peores** que los que
teníamos (0 %). Eso es lo correcto: los viejos estaban mal.

### 4.2 · Bajó, y dónde no

**Bajó en cinco de los seis anchos de alcance.** Cuánto baja lo decide una sola
cosa, medida: si el bloque **entra** en el hueco que la masa del logo deja.

| ancho | bloque | banda de masa del logo | libre arriba / abajo | ¿cabe fuera? | resultado |
|---|---|---|---|---|---|
| 390 | 265 px (31 %) | 261–575 (37 %) | 261 / 268 | **sí** | 54,8 % → **17,2 %** |
| 425 | 243 px (29 %) | 261–575 (37 %) | 261 / 268 | **sí** | 48,1 % → **11,4 %** |
| 1024 | 279 px (36 %) | 239–531 (38 %) | 239 / 236 | no, por 40 px | 20,6 % → **15,8 %** |
| 375 | 264 px (40 %) | 206–454 (37 %) | 206 / 212 | no, por 52 px | 56,2 % → **47,2 %** |
| 768 | 424 px (41 %) | 316–699 (38 %) | 316 / 324 | no, por 100 px | 56,8 % → **41,6 %** |
| 320 | 378 px (66 %) | 176–386 (37 %) | 176 / 181 | no, por 197 px | 30,7 % → **31,5 %** |

Los dos que entran caen a 11–17 %; los cuatro que no entran bajan sólo lo que el
desplazamiento les permite, y **el orden del residuo sigue exactamente al déficit
de la última columna**: 40 px → 15,8 %, 52 px → 47,2 %, 100 px → 41,6 %, 197 px →
31,5 %. (1024 rompe el orden porque su logo tapa menos de entrada: 20,6 % contra
los 48–57 % de los otros tres.)

🔴 **En 320 no baja: 30,7 % → 31,5 %.** No es una regresión del cambio, es que a
ese ancho **no existe una posición limpia**: el barrido de la mejor posición
posible da **21,8 %** con el bloque pegado al borde de arriba, contra el 33,0 %
de hoy. `justify-end` sólo puede moverlo 27 px porque el bloque ocupa el 62 % del
viewport. Las palancas que quedan están fuera del alcance de este sprint: la
escena (prohibida) o la tipografía del titular a ese ancho (de otro).

### 4.3 · 1440 y 1920 no se movieron

| ancho | bloque antes | bloque después |
|---|---|---|
| 1440 × 900 | 298,2 → 601,8 | **298,2 → 601,8** |
| 1920 × 1080 | 374,0 → 706,0 | **374,0 → 706,0** |

Idénticos al decimal. Es lo que garantiza la variante `escritorio:`, y el
invariante lo afirma (`arriba.every((f) => f.centrado === f.hoy)`).

### 4.4 · Capturas

En reposo, con recarga limpia, ocho anchos × dos composiciones:
`docs/rediseno/capturas/tapado/{centrado,hoy}-<ancho>x<alto>.png`.

### 4.5 · El gate

```
verificar: 30 pasos, 0 con falla        (16 deudas declaradas, 14 fuera de ventana)
test:frontera: 2 invariantes · 23 afirmaciones · 0 fallas · 12 fuera de ventana
tsc --noEmit: 0 errores
npx prisma migrate status: Database schema is up to date!
```

**Un conteo se movió y es el que este sprint tenía que mover: «fuera de ventana»
pasó de 17 a 14.** Son los tres `noCorre` de `s10-logo.invariant.ts` —375, 768 y
1024— que esperaban «el sprint de composición». Llegó, así que salieron de la
lista y entraron a la tabla del §1b. Los 30 pasos y las 16 deudas no se movieron.

El agregado `s10` pasó de 7 a 4 fuera de ventana y de 432 afirmaciones con 91
controles positivos (`test:s10-logo` 51/14 y `test:s10-vertical` 52/6).

⚠ **`npm run build` falla a propósito** mientras `CONTENIDO_INVENTADO` esté en
`true`: es el guardián de B12 en `prebuild`, no una regresión de este sprint. El
build que corresponde correr acá es el documentado por ese mismo guardián,
`MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build`.

---

## 5. LO QUE QUEDA ABIERTO — anotado, no implementado

1. 🔴 **`numeros` a 390: pico de 90,3 % y 66,1 % de su tinta bajo AA durante 3,35
   pantallas.** Es peor que lo que era el hero. Mismo régimen: `servicios`
   (64,5 % / 3,83 pantallas), `tu-panel` (61,7 % / 2,87),
   `por-que-develop` (63,1 % / 1,92). Este sprint las midió y no las tocó.
2. 🔴 **320 no tiene composición limpia** (§4.2). Pide una palanca de otro sprint.
3. ⚠ **768 y 375 quedan en 41,6 % y 47,2 %** porque el bloque no entra en el hueco.
   La única palanca que queda dentro del layout es `pb-20`, que está atado a la
   pastilla y no se toca sin decidirlo.
4. ⚠ **El modelo vertical no ve el alto real del CTA** (23 px, §1.5). Se declara y
   se afirma su forma; cerrarlo pide que la geometría del CTA salga de un lugar
   que un lector de clases pueda ver.
5. ⚠ **El modelo y el navegador cuentan distintos renglones del titular a 768.**
   Único ancho; delta 71,7 px.
6. ⚠ **§5b del invariante mapea keyframes a secciones que no son la suya**
   (`quiénes somos` → `numeros`, `números` → `trabajos`). La tabla del §2 lo
   reemplaza para todo efecto práctico, pero el mapeo sigue ahí.
7. ⚠ **La tercera pestaña de un mismo Chrome no monta la escena del home.** El
   patrón sigue al índice de pestaña, no al ancho, y sobrevive a
   `Target.closeTarget`. El banco lo esquiva con un proceso por ancho y hasta tres
   cargas; la causa no se investigó.
8. ⚠ **`hayCanvas` no alcanza como comprobación de que la escena montó**: el
   preloader trae su propio `<canvas>`. La verificación que vale es el nodo
   `[data-escena]`.
