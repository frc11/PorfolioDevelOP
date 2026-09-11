# B13 — QUE EL LOGO EMITA

> Rama `v3/emite` · worktree `C:\v3-emite` · instrucción
> `docs/rediseno/sprints/B13-emite.md`. **El objeto de la referencia emite y el
> nuestro absorbe.** §1 le cambia el material a la pieza, §2 la aleja, §3 mide
> las cifras contra la referencia y §4 le saca la banda al pie.

---

## 0 · En una pantalla (PARADA 1)

| | |
|---|---|
| **Lo que se construyó** | §1: el logo EMITE, con la emisión atada al nivel del arco —cero con luz, `0,16` lineal en la noche—. §2: dos poses se alejaron, `quiénes somos` de 11,5 a 14 y `demos` de 9 a 14. |
| **La vara no la puse yo: la puso la referencia** | nk.studio, medido en una navegación: su objeto es **más claro que su sala en 20 de sus 21 paradas** y su contraste barra/sala va de **1,92:1 a 7,90:1 con mediana 2,9:1**. Con `0,16` el nuestro da **2,97:1** en la noche de Trabajos. |
| **Lo que compra, en un número** | En la noche el logo pasa de **indetectable** (el detector de silueta devuelve «ninguno»; el modelo da 1,14:1 contra su sala) a **2,95:1 medido en la captura** — un agujero negro en el campo de estrellas se convierte en la pieza luminosa de la escena. ⚠️ **Y se ve el 67,8 % cuando el pin suelta y el 0,1 % en el ancla**: ahí la tarjeta del proyecto lo tapa (§2.25). |
| **Lo que NO compra, y es la respuesta al gate de la PARADA 1** | **La emisión NO resuelve el 1,00:1 del texto sobre el logo en los cinco tramos con luz, y la medición dice que nada puede.** Para que la tinta oscura pase AA encima, el logo tiene que estar en ≥140 de 255; a ese valor se funde con una sala de 209–248 (1,95–3,17:1 contra el papel) y en el diferencial y el Cierre colapsa a 1,17–1,21:1 contra la sala. Los dos objetivos son **mutuamente excluyentes con nuestra paleta**; la referencia no lo sufre porque su sala es negra. |
| **La trampa, confirmada con número** | Sobre papel claro un objeto que emite desaparece: a emisiva 0,62 el logo da **1,56:1 contra el papel del hero** y **1,12:1 en Números**. Por eso la emisión **no es constante**: es cero por encima de `RIM_NIGHT_LEVEL` (0,34) y sube sólo en la noche. |
| **El tamaño en cuadro** | El «35–50 %» del diagnóstico existe y está localizado: **36,10 % del cuadro en p≈0,746, en 1025×900** —el máximo de todo el recorrido, y es la pose `demos`—. Con las dos poses alejadas ninguna sección pasa de **15,50 %**. |
| **Lo que se llevó puesto** | El pico de velocidad de cámara del recorrido **BAJA de 4,6198 a 3,4126** alturas de cuadro por pantalla de scroll, y ningún tramo se acelera. El censo de B9 **no se movió**: 1,33 a 1920 y 1,20 a 1440. El aterrizaje del preloader **no se movió**: 445 × 310 px en 1440×810. |
| **Lo que se abrió** | Con el logo más chico, **la palanca de layout de §7.43 —que SITIO-S12 midió como inexistente— existe**: hay banda que lleva la superposición del titular del diferencial a **0 % en los cuatro cuadros**. Y la ventana del diferencial abre en p=0,7245, o sea **antes del ancla heredada**. |
| **`/probe-escena/__tests__/`** | **CINCO afirmaciones reescritas con autorización del dueño** (regla 15: contra la propiedad nueva, sin aflojar y sin borrar). Ninguna cifra publicada de S10/S11 se pisó; lo que se reescribió es qué pose sirve de ancla y por qué. §7.1. |
| **§3 · los números — ⚠️ SIGUE ABIERTO** | **No se rehicieron: se midieron.** La referencia usa **UN tamaño** (56 px) y el rótulo a **4,67:1**: la premisa «tamaños distintos» está **refutada**. De los cuatro pedidos, dos ya estaban, **la amplitud NO se recupera** (c7 sigue siendo la primera libre: 602 px de 1220 antes y después) y la llave apagada **aguanta** (`[CIFRA]` es 2,1–3,2× más ancho y ninguna desborda). Lo que falta pide tocar el anclaje o sacar un eje: las dos están fuera de B13 y van con su número, **y la sección de acá abajo tiene su hoja de ruta.** |
| **§4 · el pie** | **La banda se fue.** Medido bloque por bloque con el instrumento de B11: **7 de 24 fallan a 1920 y 8 de 23 a 1440, peor 2,41:1** — cuatro son el titular (ya declarado `D-B12.2`) y tres son el texto chico que la banda tapaba (0,8–4,3 % del glifo). **El formulario pasa con su fondo propio.** **NO CIERRA → `D-B13.3`**, y la banda no vuelve. |
| **Deudas nuevas** | **D-B13.1** (el cruce de la vuelta, 1,08:1, topológico) · **D-B13.2** (el logo brilla pero no ilumina) · **D-B13.3** (el pie sin banda). |

---

# ⚠️ §3 SIGUE ABIERTO — LOS NÚMEROS NO SE REHICIERON

**Que quede claro antes de cualquier otra cifra: §3 era uno de los tres pedidos
explícitos del humano y NO se construyó.** Se midió, se verificó que lo que hay
sigue funcionando, y se publicó el número de lo que falta. Eso no es lo mismo que
hacerlo. Si algún punto de este reporte se lee como «los números están
resueltos», se lee mal.

## Qué pedía §3, textual

> *«La presentación que tienen los números no me gusta, me gustaría algo más como
> nk.»*

Y §3.2, los cuatro pedidos: **las cifras integradas**, no puestas encima, con la
escena visible entre ellas · **sin perder los cinco ejes** que B11 conservó, y
*«si el logo se achica en §2, esa amplitud se puede recuperar: medilo»* · **el
rótulo con su cifra** · y **verificado con la llave apagada** también.

## Qué se hizo en su lugar

| pedido | qué pasó |
|---|---|
| el rótulo con su cifra | **ya estaba** — `Cifra.tsx` los pone en el mismo `<p>`. Verificado, no construido |
| la escena visible entre ellas | **ya estaba** — las cifras ocupan el 1,9 % al 5,95 % del cuadro; el 94–98 % es sala. Verificado, no construido |
| recuperar la amplitud | **medido — NO se puede** (§3.4) |
| la llave apagada | **medido — aguanta** (§3.5) |
| **la presentación** | **NO SE TOCÓ.** Ni una celda de `GEOMETRIA` |

Cuando el punto (e) de la parada dice *«cinco ejes intactos, ni una celda
movida»*, dice exactamente eso: **se comprobó que no se rompieron**, no que se
rehicieran.

## Por qué no se construyó, con el número

La diferencia con la referencia **no está en la dispersión: está en la
densidad.**

| | referencia | nuestro |
|---|---|---|
| cifras por cuadro | **7** | **1 o 2** |
| pantallas | **1** | **4** |
| tamaños | **1** (todas iguales) | **4** |
| ancho que ocupan | **34,1 %** | — |

Eso es lo que hace que las suyas se lean como una constelación y las nuestras
como una lista. Y las dos palancas que lo cerrarían caen **fuera de las reglas de
B13**:

1. **Juntarlas en menos pantallas** es cambiar el alto de la sección en
   `secciones.ts` — **el anclaje, prohibido por la regla 6** — y además reabre lo
   que B2 cerró: con las cinco en una pantalla quedan tres pantallas vacías
   detrás, y ése era el hueco de **5,44 pantallas** contra el gate de **1,33** de
   B9.
2. **Unificar el tamaño** es sacar uno de los cinco ejes que §3.2 **manda
   conservar**. Es **una línea** —los cinco `nivel` de `GEOMETRIA.celdas`— y
   está medida: las cinco a 65 px, razón cifra/rótulo **6,5:1** en las cinco (hoy
   2,14 a 6,5; la referencia usa 4,67), dispersión en cuatro ejes.

Ninguna se aplicó: la primera está prohibida y la segunda **contradice la
instrucción**, y contradecirla sin que el humano lo sepa es lo que la regla 11
prohíbe.

## ⚠️ Y qué haría falta AHORA — la condición que antes no existía

§2 cambió el terreno: **el logo bajó de 36,10 % a 15,40 % del cuadro** y **la
columna 6 pasó de tapada SIEMPRE a tapada el 48 % de las paradas**. Antes de B13
esa conversación no se podía tener. Ahora sí, y lo que falta para tenerla son
tres cosas concretas, en este orden:

**1 · Un instrumento que hoy no existe: la ocupación por PANTALLA, no por
sección.** `h-amplitud.ts` mide la ventana **entera** de Números —54 paradas a
1440— y por eso publica «c6 tapada el 48 %». Pero **cada cifra vive en UNA
pantalla**: a la cifra de la pantalla 2 sólo le importa si c6 está libre en las
paradas de la pantalla 2. Partir esa medición por pantalla es media jornada y
cero riesgo, y es **la única pregunta que decide si esto se puede o no**. Si
alguna pantalla da **100 % libre**, esa cifra se corre a c6 **sin aflojar la
regla de B11 y sin tocar el anclaje**.

**2 · Cuánta amplitud compraría, derivado de lo ya medido.** De las dos cifras de
§3.4 —c7–c12 = 602 px y las doce = 1.220 px— salen el ancho de columna y el
canal: 6·w + 5·g = 602 y 12·w + 11·g = 1.220 → **w = 87 px, g = 16 px**. Sumar c6
lleva la amplitud de **602 a 705 px de 1.220**: del 49,3 % al **57,8 %** del
ancho. **No devuelve los 1.220 que B11 sacrificó** —eso ya está medido y no
vuelve con el tamaño, porque `frameX = −0,45` empuja el logo a la izquierda—,
pero es **una columna más de dispersión real**, que es lo que §3.2 pedía medir.

**3 · Una decisión que es del humano, no una medición.** B11 fijó su regla en
**0 % de las paradas**, no en «casi nunca». Usar c6 al 48 % es aflojarla. Las dos
salidas honestas: o el punto 1 encuentra una pantalla al 100 % —y entonces no se
afloja nada—, o **el humano reformula la regla de B11 por pantalla en vez de por
sección**, que es un cambio de sujeto y no de constante, con el mismo criterio
que se aplicó a las cuatro afirmaciones de `/probe-escena` en §7.1.

Y aun con las tres, **la densidad sigue bloqueada** por la regla 6: siete cifras
en un cuadro necesitan el anclaje. **§3 queda abierto, y ésta es su hoja de
ruta.**

---

# ⛔ LA RESPUESTA AL GATE — la emisión NO resuelve el texto sobre el logo, y NADA PUEDE

Es la pregunta con la que la instrucción corta la PARADA 1: *«si el logo
emitiendo no resuelve el contraste, §3 y §4 se planifican distinto»*. La
respuesta es **no**, y no es una derrota de calibración: es una imposibilidad de
la paleta, con el número que la cierra.

## El argumento, en dos desigualdades que no caben juntas

Para que la tinta oscura del sistema (`#111111`) pase **AA (4,5:1)** sobre el
logo, el logo tiene que estar en **≥ 140 de 255** — es el barrido de §2.1, y la
cifra sale de despejar la razón WCAG, no de una corrida afortunada.

Para que el logo **se lea como pieza** tiene que separarse de la sala que lo
rodea. Y a 140 de 255 la sala vale:

| tramo | sala (p50 / papel) | logo a 140 | contraste |
|---|---|---:|---|
| hero | 219 / 248 | 140 | 2,43 / **3,17** |
| quiénes somos | 206 / 247 | 140 | 2,11 / **3,10** |
| números | 209 / 212 | 140 | 2,20 / **2,27** |
| diferencial | 152 / 197 | 140 | **1,17** / 1,95 |
| cierre | 155 / 198 | 140 | **1,21** / 1,97 |

**En el diferencial y en el Cierre la pieza desaparece exactamente en el valor en
el que el texto empieza a leerse.** Y subiendo más el logo la segunda desigualdad
empeora antes de mejorar: a 0,62 de emisiva el logo da **1,56:1 contra el papel
del hero** y **1,12:1 en Números**. No hay ventana común. **Los dos objetivos son
mutuamente excluyentes con esta paleta.**

## El remate: su peor caso es nuestro caso normal

La referencia no sufre nada de esto, y la medición dice exactamente por qué:
**su sala es negra.** En 44 paradas su objeto es **más claro que su sala en 20 de
las 21** en que aparece, y su sala vive entre 0,0000 y 0,0576 de luminancia.

Y su peor caso es la prueba: **de las 44 paradas, en 9 el texto le cae encima y
la peor da 1,17:1 — y esa parada es la ÚNICA en la que su objeto es OSCURO**
(luminancia 0,0000 sobre una sala de 0,0576, ocupando el 30,56 % del cuadro).
Cuando su objeto se comporta como el nuestro, su contraste se derrumba como el
nuestro.

> **Su peor caso es nuestro caso normal.**

## La consecuencia, que es lo que cierra diez bloques de discusión

**Mover el texto —lo que hizo B11— no era un parche. Era la única solución.**

B11 corrió las seis secciones y cerró cuatro deudas por estructura, y quedó
leyéndose como el arreglo barato: acomodar el producto porque la escena no se
podía tocar. Con B13 la escena SÍ se tocó —el material y el tamaño— y la
medición muestra que la otra puerta estaba cerrada con llave desde el principio:
sobre papel claro con tinta oscura, **cualquier** valor del logo que deje pasar
el texto lo funde con la sala. La única salida que quedaba era que el texto no
pasara por encima, que es literalmente lo que B11 construyó.

Lo que B13 sí compra está en otro lado, y es real: **la noche**. Ahí la paleta se
da vuelta —sala negra, tinta clara— y el logo que emite entra en la banda de la
referencia (§2.2). Es el único tramo del recorrido donde nuestra escena y la suya
son la misma escena.

---

## 1 · LA REFERENCIA, MEDIDA — una navegación, una medición (PARADA 1 · a)

`scripts-b13/b-referencia.ts` recorrió **nk.studio a 1920 en 44 paradas de media
pantalla** (`outputs/b13/referencia-emision-nk-1920.json`). El objeto de su
escena sale de S —su canvas solo— como la componente conexa más grande que se
aparta de la mediana del cuadro, sin partículas; es el criterio de
`scripts-b11/c-referencia.ts`, para que las cifras se puedan cruzar con las que
B11 publicó. **No se copió nada**: ni un selector, ni una clase, ni un valor.

### 1.1 · La luminancia de su barra contra la de su fondo

| | |
|---|---|
| paradas con objeto | **21 de 44** |
| **¿la barra es MÁS CLARA que su sala?** | **20 de esas 21** |
| luminancia de la barra (mediana de la silueta) | **0,0477 a 0,4551** |
| luminancia de la sala (mediana de lo que no es silueta) | **0,0000 a 0,0576** |
| **contraste barra / sala** | **1,92:1 a 7,90:1 · mediana ≈ 2,9:1** |

Dos lecturas que importan. **(1) Su objeto no es un faro**: la mediana de 2,9:1
es una diferencia moderada — lo que lo hace legible no es que la barra sea
brillante, es que **su sala es negra**. **(2) La única parada en que su objeto es
oscuro es la única en que su texto sufre**: en la pantalla 11 el objeto ocupa el
30,56 % del cuadro con luminancia 0,0000 sobre una sala de 0,0576, y ahí el
99,3 % de sus glifos cae encima y el peor bloque da **1,17:1**. O sea: **el peor
caso de la referencia es exactamente nuestro caso normal.**

### 1.2 · ⚠️ Sí aporta luz al entorno — y eso es lo que la emisiva sola NO da

La pregunta de §1.2 («¿aporta luz o sólo brilla ella?») se contestó con los
**anillos**: la luminancia media de la sala en cuatro coronas alrededor de la
silueta (1–5 px, 6–15, 16–40, 41–100) contra el resto del cuadro.

| parada | 1–5 px | 6–15 | 16–40 | 41–100 | lejos | anillo/lejos |
|---|---|---|---|---|---|---|
| 0 | 0,0190 | 0,0101 | 0,0046 | 0,0022 | 0,0008 | **×23,8** |
| 2,5 | 0,0293 | 0,0256 | 0,0175 | 0,0114 | 0,0044 | ×6,7 |
| 3 | 0,0274 | 0,0238 | 0,0169 | 0,0100 | 0,0034 | ×8,1 |
| 9,5 | 0,0351 | 0,0285 | 0,0236 | 0,0201 | 0,0089 | ×3,9 |
| 21,5 | 0,0619 | 0,0496 | 0,0389 | 0,0358 | 0,0260 | ×2,4 |

El gradiente baja monótono con la distancia en todas las paradas con objeto: **su
objeto ILUMINA, no sólo brilla.**

⚠️ **Y eso el mecanismo de este sprint no lo da, por construcción del motor.** El
`emissive` de three es radiancia de salida del fragmento: **no es una luz**, no
entra en `RE_Direct` ni en el hemisférico, y por lo tanto el piso, la pared y las
motas alrededor del logo valen exactamente lo mismo con el logo emitiendo que sin
él —verificado en la captura: en el hero la sala da `186/227/248` antes y después
en los dos anchos, y lo único que se mueve entre corridas del MISMO estado es un
punto de la mediana, que son las partículas—. Reproducir el halo es otro trabajo
con dos salidas conocidas
(sprites aditivos como `CoreHalo.tsx`, o una luz de verdad atada al logo), y las
dos agregan objetos a la escena, que es más de lo que «cambia su material» pide.
**Se mide, se publica y se deja a decisión del humano.**

### 1.3 · Qué fracción del cuadro ocupa, y su texto encima

- **1,33 % a 7,54 % en 18 de las 21 paradas.** Las tres excepciones: 16,17 %,
  16,18 % y 30,56 %.
- Glifos sobre el objeto en **9 de las 44 paradas**; los peores bloques dan
  1,17 · 1,22 · 1,23 · 2,70 · 2,90 · 5,71 · 9,76:1.

---

## 2 · EL BARRIDO DE EMISIÓN — las tres columnas que compiten (PARADA 1 · b)

`scripts-b13/a-barrido.ts`, sobre el modelo de sombreado de S7 con el término de
emisiva puesto **adentro** del tone mapping (`logoEmitido.ts`).

> **CONTROL DE EQUIVALENCIA — 3.150 casos comparados contra `shadeSurface`, 0
> discrepancias.** Con la emisiva en 0 la cadena nueva devuelve *exactamente* la
> de S7: no «parecido», el mismo doble. Sin eso, ninguna cifra de acá se podría
> comparar con las de S7–S12, B8 y B11.

Cada tramo se mide **con SU tinta**: las cinco con tinta oscura (`#111111`) y
Trabajos con la clara (`#F7F7F5`), que es la invertida. Medir Trabajos con la
oscura habría sido medirla con una tinta que no usa.

### 2.1 · Los tramos con luz (nivel 1 y 0,643) — la trampa, con número

| emisiva | logo (de 255) | HERO texto / logo-papel | NÚMEROS texto / logo-papel | DIFERENCIAL texto / logo-sala |
|---:|---:|---|---|---|
| 0 (hoy) | 0,3–0,7 | **1,11** / 19,65 | **1,11** / 14,17 | **1,11** / 7,28 |
| 0,10 | 69–71 | 2,03 / 8,61 | 2,00 / 6,37 | 2,00 / 3,27 |
| 0,20 | 112 | 3,81 / 4,60 | 3,81 / 3,34 | 3,81 / 1,72 |
| **0,30** | 140 | **5,62 ✅** / 3,17 | **5,62 ✅** / 2,27 | **5,62 ✅** / **1,17** |
| 0,45 | 172 | 8,32 ✅ / 2,14 | 8,32 ✅ / 1,53 | 8,32 ✅ / 1,27 |
| 0,62 | 200 | 11,40 ✅ / **1,56** | 11,40 ✅ / **1,12** | 11,40 ✅ / 1,74 |
| 1,50 | 248 | 17,78 ✅ / **1,00** | 17,78 ✅ / 1,40 | 17,78 ✅ / 2,72 |

**Se lee de una:** la emisiva que hace pasar AA al texto (≥0,30) es la misma que
empieza a fundir el logo con el papel, y en el diferencial y el Cierre lo funde
con la sala en el mismo punto (1,17 y 1,21). **No hay valor que cierre las dos.**

### 2.2 · La noche de Trabajos — donde sí cierra

| emisiva | logo | sala | **logo/sala** | **tinta CLARA encima** | ¿banda de la referencia? ¿AA? |
|---:|---:|---:|---:|---:|---|
| 0 (hoy) | 0,0 | 19,9 | **1,14** | 19,58 | — · AA |
| 0,10 | 69,3 | 19,9 | 1,92 | 8,94 | banda · AA |
| **0,16** | **97,2** | **19,9** | **2,97** | **5,77** | **banda · AA** |
| 0,20 | 111,4 | 19,9 | 3,67 | 4,68 | banda · AA |
| 0,21 | 114,6 | 19,9 | 3,89 | **4,42** | banda · ✗ |
| 0,30 | 139,5 | 19,9 | 5,41 | 3,18 | banda · ✗ |

### 2.25 · ⚠️ ¿Y el visitante lo VE? — la tarjeta de Trabajos tapa el centro

`c-escena.ts` mide la escena DESNUDA, y ahí el logo que emite se ve perfecto.
Pero en el pin de Trabajos la tarjeta del proyecto ocupa el centro del cuadro y
la caja del logo (x 385–999, y 357–747 a 1920) cae adentro de ella. Medir la
escena sola no contesta la pregunta, así que `scripts-b13/g-noche-visible.ts`
cruza la captura COMPUESTA contra la de la escena sola en toda la ventana:

| scrollY | mediana de la sala | lo claro de la escena | **sobrevive a lo compuesto** |
|---:|---:|---:|---:|
| 8.100 (antes de la noche) | 173 | 0,05 % | 0,0 % |
| **8.640 (el ancla)** | 21 | 7,10 % | **0,1 %** |
| 9.180 | 21 | 7,16 % | 18,6 % |
| 9.720 | 18 | 7,33 % | 9,4 % |
| 10.260 | 16 | 7,46 % | 39,7 % |
| **10.800 (el pin suelta)** | 16 | 17,64 % | **67,8 %** |
| 11.340 en adelante | 247 | 0,00 % | — (Servicios, papel opaco) |

**En el ancla de Trabajos la tarjeta lo tapa casi entero**; el logo aparece a la
izquierda del cuadro sobre el final del pin y se ve entero cuando el pin suelta.
La evidencia es
`capturas/b13/despues-trabajos-1920-compuesto-y10800.png`: la pieza gris
luminosa a la izquierda, la sala negra, el campo de estrellas, y la tarjeta del
proyecto al lado. Es la composición de la referencia, con nuestra marca.

⚠️ **Dicho al revés, que es la parte incómoda:** el tramo donde la emisión se
luce es **una pantalla y media de las tres del pin**, no las tres. Si el humano
quiere que se vea antes, la palanca no es la emisión: es dónde entra la tarjeta.

### 2.3 · La tercera columna: ¿sigue leyéndose como el logo?

⚠️ **El modelo NO puede contestar esta columna, y hay que decirlo.** `shading.ts`
no incluye el lóbulo especular, y el especular es exactamente lo que le da forma
a una pieza negra: `probeScene.ts` lo dice con su número —el albedo de la tinta
es 0,0046 lineal, así que «lo único que dibuja su volumen es el reflejo
especular»—. Por eso el degradé interno se mide **en la captura**
(`scripts-b13/c-escena.ts`), no en el modelo:

| sección | degradé del logo ANTES (p95−p05) | DESPUÉS |
|---|---:|---:|
| hero | 4,2 | 4,3 |
| quiénes somos | 3,0 | 3,0 |
| números | 15,0 | 15,1 |
| **trabajos** | **— (indetectable)** | **3,0** |
| diferencial | 1,0 | 0,1 |
| cierre | 3,1 | 3,1 |

En los cinco tramos con luz el degradé **no se mueve un punto**, porque ahí la
emisión es cero exacto. En Trabajos la pieza pasa de no existir a leerse con un
degradé de 3 puntos sobre un fondo de 21: la silueta, las dos contras y el canto
se ven en la captura (`capturas/b13/despues-trabajos-1920-S.png`).

---

## 3 · EL VALOR PROPUESTO: `EMISION_EN_LA_NOCHE = 0,16` (PARADA 1 · c)

**No se eligió: lo acotan dos cosas medidas, y en el medio queda una banda.**

1. **Por abajo, la referencia.** Su barra da 1,92:1 como mínimo contra su sala.
   Emisiva 0,10 es el primer valor que llega ahí (1,92:1).
2. **Por arriba, Trabajos.** Es la única sección INVERTIDA que deja ver la sala:
   escribe con tinta CLARA, y sobre un logo que emite esa tinta pierde contraste
   —al revés que la oscura—. En 0,21 se cae de AA (4,42:1).

La banda en la que se cumplen **las dos** es **0,10 a 0,20**. Dentro de esa banda,
**0,16 es el valor cuyo contraste (2,97:1) más se acerca a la mediana de la
referencia (2,9:1)**. Y sí: **la emisión tiene que depender del nivel de luz de la
escena** — §2.1 lo prueba con número.

### 3.1 · La curva, y por qué sus dos puntas no se eligen

```
emisionDelLogoEn(nivel) = smoothstep(RIM_NIGHT_LEVEL → NIVEL_DE_LA_NOCHE) × 0,16
```

`RIM_NIGHT_LEVEL` (0,34) es el nivel en el que este proyecto **ya declaraba** que
empieza la noche: por debajo se apaga el contraluz (`rimIntensityAt`, B8) y por
debajo empiezan a brillar las motas (`brilloDeLaNocheEn`, B8/B12).
`NIVEL_DE_LA_NOCHE` (0,04) es su fondo. **Es la misma rampa que el brillo de las
motas, escalada** —el invariante lo afirma comparándolas punto por punto—: el
logo y el polvo se encienden juntos, así que la noche se lee como un solo hecho.

**Consecuencia dura y verificada: por encima de 0,34 la emisión es CERO EXACTO**,
así que todo lo que S6–S12, B8 y B11 midieron con la sala iluminada queda intacto
bit a bit. `s22-emision` §3 lo afirma sobre las seis anclas comparando el valor
del logo con y sin emisión.

---

## 4 · LO QUE SE MOVIÓ Y LO QUE SE ROMPIÓ (PARADA 1 · e)

### 4.1 · La sombra: no cambia, y es una propiedad del motor

El mapa de sombras se dibuja con `MeshDepthMaterial` —sólo profundidad—, así que
la emisiva no puede entrar. Verificado en el píxel: en el hero la sala da
`186/227/248` (p05/p50/p95) **antes y después**, y en el diferencial
`117/151/208` contra `118/152/208` — un punto, que es el ruido de las motas entre
corridas del mismo estado. Lo que sí mueve la sombra es §2: alejar la
cámara la deja entrar más en cuadro (visible en `despues-numeros-1920-S.png`).

### 4.2 · El contraluz que B8 ató a la sala: se lo llevó la emisión

B8 hizo que el rim se apagara por debajo de 0,34 porque, siendo del observador,
seguía iluminando el piso. A nivel 0,04 `rimIntensityAt` devuelve **0,2224** de
los 3,2 nominales, y sobre la tinta —albedo lineal 0,004777— su aporte máximo es
**3,382·10⁻⁴ lineal**. La emisión es **0,16**: **×473**. O sea que en la noche el
filo del logo ya no lo dibuja el contraluz, lo dibuja la pieza. El freno de B8
sigue teniendo sentido para el PISO (que es para lo que se puso) y no hace falta
tocarlo.

### 4.3 · ⚠️ D-B13.1 — el cruce de la vuelta

En la **vuelta** (B12: la pantalla en la que Trabajos se va y Servicios, papel
opaco, entra desde el pie) la sala sube de 20 a 122 mientras la emisión baja de
0,16 a 0. En el camino los dos valores se cruzan:

| p | 0,589 | 0,594 | **0,599** | 0,604 | 0,609 | 0,614 |
|---|---:|---:|---:|---:|---:|---:|
| logo/sala | 2,42 | 1,67 | **1,08** | 1,48 | 2,33 | 3,31 |

**Es topológico, no de calibración**: para pasar de oscuro-sobre-claro a
claro-sobre-oscuro el valor del logo tiene que cruzar el de la sala, y en el cruce
el contraste es 1. Lo único que se elige es **dónde** y **cuánto dura**. Hoy dura
~0,014 de progreso (**~0,34 pantallas de scroll**) y cae detrás del panel opaco
que entra.

### 4.3.1 · ⚠️ La solución YA EXISTE en el repo, y es de otro lane

**El preloader tiene exactamente este problema y lo resolvió en S8d/S8e.**
`introTimeline.ts`, en el docblock de `INK_FLIP_FRAC`, lo escribe con el mismo
teorema:

> *«Hay un problema geométrico en "el fondo va de oscuro a claro **y** el logo de
> blanco a negro": los dos arrancan en valores opuestos y terminan en los
> opuestos cambiados, así que **por el teorema del valor intermedio son iguales
> en algún instante.** En ese instante el logo tiene el color exacto del fondo y
> desaparece. Es inevitable con dos recorridos continuos de luminancia; lo único
> que se puede elegir es cuánto dura.»*

Y su salida no fue tocar el recorrido del fondo: **la tinta no usa la ventana
entera, invierte en una franja central con la misma curva.** El fondo se
transforma despacio —eso es lo que se ve— y la tinta lo cruza rápido por el
medio. Medido: el cruce por debajo de 1,25:1 pasó a durar **0,038 s** contra un
tope declarado de **0,100 s**, y el de 1,10:1, **0,015 s** contra 0,050 s;
`introSampling.invariant.ts` los mide en segundos por interpolación y los
custodia.

**La traducción a B13 es directa.** Hoy la emisión usa la banda ENTERA de la
noche —de `NIVEL_DE_LA_NOCHE` a `RIM_NIGHT_LEVEL`, la misma de
`brilloDeLaNocheEn`, para que el logo y el polvo se enciendan juntos—, que es el
caso «ventana ancha». La franja central sería una banda más angosta adentro de
ésa. **Lo que cuesta:** el logo dejaría de encenderse con las motas, que es
justamente la propiedad por la que la banda se eligió compartida. **Y el tope hay
que medirlo en PANTALLAS DE SCROLL, no en segundos** — lección de B2: el
visitante no controla el tiempo, controla el scroll.

Se declara con su número en `deudas-b13.ts`, con el puntero al lane que ya lo
resolvió, y lo decide el humano.

### 4.4 · El acomodamiento de B11, re-medido

**Las seis secciones, en la captura** (`outputs/b13/escena-antes.json` y
`escena-despues-1440.json` / `escena-despues-1920.json`), fracción del cuadro que
ocupa el logo en el progreso donde la sección llena el cuadro:

| sección | 1440 antes → después | 1920 antes → después | logo/sala después |
|---|---|---|---|
| hero | 6,16 % → 6,16 % | 5,62 % → 5,62 % | 16,26:1 |
| quiénes somos | 8,11 % → **6,99 %** | 7,29 % → **6,29 %** | 14,38:1 |
| números | 15,66 % → **11,04 %** | 14,47 % → **10,22 %** | 14,86:1 |
| trabajos | *indetectable* → **6,19 %** | *indetectable* → **5,64 %** | **2,95:1** |
| diferencial | 4,48 % → **4,09 %** | 4,05 % → **3,69 %** | 7,21:1 |
| cierre | 3,16 % → 3,16 % | 2,84 % → 2,84 % | 7,19:1 |

**Las doce bandas del cuadro** (`scripts-b13/f-columnas.ts`, a 1,600; qué fracción
de las paradas de la ventana vio tapada cada banda vertical de 1/12 del cuadro).
⚠️ **No son las columnas de la grilla de B11** —son bandas del cuadro, no del
contenedor— así que lo que vale es la DIFERENCIA, medida con la misma vara a los
dos lados:

| sección | banda que más cambia | antes → después |
|---|---|---|
| números | **c7** | **100 % → 44 %** |
| quiénes somos | c7 | 69 % → 41 % |
| diferencial | c4 · c6 | 6 % → 0 % · 100 % → 79 % |
| hero · trabajos · cierre | — | sin cambio |

**La sección con margen de sobra es Números**, que es exactamente la que B11 tuvo
que mudar entera a c7–c12 perdiendo amplitud (1.220 → 594 px a 1440). Con el logo
más chico su banda de frontera pasa de estar tapada siempre a estarlo menos de la
mitad del tramo. **No se movió una columna en este sprint**: mover producto es
composición y cuesta bytes y censo; lo que §2 pide es medir y reportar, y esto es
lo medido.

### 4.5 · El censo de B9 y el aterrizaje del preloader: intactos

- **Censo** (`scripts-b11/censo.ts`, la vara de B9): **1920 → hueco máximo 1,33
  pantallas · 21 acontecimientos · 229 piezas**; **1440 → 1,20 · 17 · 214**.
  Exactamente las cifras de B11. La cámara no mueve una caja de texto.
- **Preloader**: `scene-framing.invariant.ts` **40 en verde, 0 en rojo**, con la
  tinta en **445 × 310 px en 1440×810**, la misma cifra de V3-E. La pose del hero
  no se tocó, así que el destino no se movió. Y `s22-emision` §7 afirma que ni
  `IntroLogoCanvas.tsx`, ni `introRig.ts`, ni `introShading.ts` importan nada de
  `logoEmision.ts`: **el cambio no alcanza al preloader.**

### 4.6 · El ritmo de la cámara: nada se aceleró

| tramo | antes de B13 | después |
|---|---:|---:|
| hero | 3,4643 | **3,4126** |
| quiénes somos | 2,20 | 2,17 |
| números | 1,52 | 1,39 |
| trabajos | 0,44 | 0,44 |
| demos | 2,19 | 2,09 |
| cierre | 4,62 | **2,74** |

En alturas de cuadro por pantalla de scroll. **El pico del recorrido baja de
4,6198 (cierre) a 3,4126 (hero)**, y ninguno de los seis sube. La consecuencia
que hay que decir igual: **el arranque pasa a ser el tramo más rápido**, no
porque se haya acelerado —bajó— sino porque los otros se frenaron.
`s13b-escena.invariant.ts` §1 lo afirma con la pista de antes al lado.

### 4.7 · Lo que se abrió sin buscarlo

- **P-B13.1 · LA PALANCA DE §7.43 EXISTE.** Va con nombre propio porque **reabre
  una decisión que se cerró con la medición contraria**. SITIO-S12 fue a
  ejecutar §7.43 —acotar la columna del diferencial— y midió que la palanca **no
  existía**: el barrido exhaustivo de 81 bandas `(izquierda, ancho)` dejaba un
  mínimo mayor que cero en su peor cuadro, y la causa quedó publicada al lado
  —*«el hueco libre más grande a 1025×900 mide 197 px»*—. Esa causa era el
  TAMAÑO del logo, no la columna. Con `demos` a 14 el hueco se abrió: **la mejor
  banda (izquierda 32 px · ancho 635 px) lleva la superposición del titular a
  0,0 % en los cuatro cuadros**, contra el 11,2 % que dejaba la mejor de antes, y
  **varias de las formas que la `Grilla` ya sabe emitir** la cierran solas
  (`columnas=3 col-span-2`, `columnas=5 col-span-3`, `columnas=7 col-span-4`,
  `columnas=8 col-span-5`, `columnas=5 col-span-2`, `columnas=3 col-span-1`).
  **NO se aplicó**: este bloque no mueve una columna, y aplicarla es composición
  con su costo en bytes y en censo. Lo que se reporta es que **la salida de
  composición para D-B8.3 volvió a estar disponible, y con qué banda.**
  `s10-logo-columna.ts` §9 la afirma, con el control positivo dado vuelta.
- **La ventana del diferencial abre antes**: p=0,7245, o sea **antes del ancla
  heredada (0,7500)**. Los dos anclajes cuantizados caen ahora adentro, y lo
  único que los descarta es el corrimiento de `tu-panel` (`s16-anclaje` §5).
- **El logo entra ENTERO en las 32 muestras**: el recorte por arriba que
  SITIO-S11 declaró como decisión desapareció con el alejamiento.

---

## 5 · EL TAMAÑO EN CUADRO (PARADA 1 · d)

**Dónde estaba el «35–50 %».** Barriendo la ventana de cada sección sólo en las
paradas en que la escena DIBUJA (`scripts-b13/d-tamano.ts`):

| cuadro | máximo ANTES | dónde | máximo DESPUÉS | dónde |
|---|---:|---|---:|---|
| 1025×900 (1,139) | **36,10 %** | p=0,7461 | **15,51 %** | p=0,3945 |
| 1025×844 (1,214) | 33,51 % | p=0,7500 | 14,61 % | p=0,3984 |
| 1025×667 (1,537) | 26,73 % | p=0,7500 | 12,06 % | p=0,3906 |
| 1440×900 (1,600) | 25,56 % | p=0,7500 | 11,73 % | p=0,3984 |
| 1920×1080 (1,778) | 23,14 % | p=0,7500 | 10,75 % | p=0,3945 |

**Los cinco máximos de ANTES caen en la pose `demos`.** El 35–50 % del
diagnóstico no era una exageración: es esa pose en el cuadro más angosto donde la
escena existe. **Y el «~40 % → ~15 %» que la instrucción pide es literal:
36,10 % → 15,51 %.** El máximo se mudó de `demos` al tramo de Números, y la
media del recorrido entero baja de 12,00 % a **9,46 %**.

**Por sección, a 1025×900** (máximo de la ventana, sólo paradas en que la escena
dibuja): hero **11,85 → 10,68** · quiénes somos **21,97 → 15,17** · números
**22,06 → 15,50** · trabajos **8,70 → 8,64** · diferencial **36,10 → 15,40** ·
cierre **6,26 → 5,80**. **Ninguna pasa de 15,50 %**, contra el 1,33–7,54 % en el
que la referencia vive el 86 % de sus paradas.

**Las dos palancas, medidas por separado antes de aplicarlas** (a 1025×900):

| pose | de → a | qué baja |
|---|---|---|
| `quiénes somos` | 11,5 → **14** | quiénes somos **21,97 % → 15,17 %** · números **22,06 % → 15,50 %** · hero 11,85 → 10,68 · trabajos 8,70 → 8,64 |
| `demos` | 9 → **14** | diferencial **36,10 % → 15,40 %** · cierre 6,26 → 5,80 · las otras cuatro, cero |

Las dos son ortogonales y las dos aterrizan en el «~15 %» que pide la
instrucción. Y **las dos restricciones que fijaban esos números están vencidas**:

- **11,5 lo imponía el anillo de planos suspendidos** (radio 11,8–22). **S10 lo
  borró entero**, archivo incluido.
- **9 lo imponía «sol visible en cuadro»**. **S11 borró el cuerpo del sol** —sus
  dos sprites— y no hay sol que encuadrar.

### 5.1 · Lo que cuesta `quiénes somos` a 14, y su alternativa

La altura mínima segura contra el papel es `FLOOR_Y + 0,045 × distancia`. Con
11,5 la holgura era **0,187** de mundo (**×1,360** sobre `MOUSE_HEIGHT_FACTOR`);
con 14 es **0,074** (**×1,118**). Sigue del lado bueno —la cámara nunca perfora el
papel ni con el puntero en el extremo, y `s18-azimut` §4 lo recalcula y lo
publica— pero el margen es la mitad. **La alternativa medida: 13,0 deja ×1,203 y
el logo en 16,3–16,7 %.** La altura no se toca: §7 de la instrucción autoriza la
distancia y nada más.

---

## 6 · QUÉ SE VERIFICÓ

`npm run verificar` **cerró en cero** sobre el árbol entero y sin cortar en la
primera falla: **30 pasos, 0 con falla**. Sus 27 agregados suman **133
invariantes · 5.365 afirmaciones · 913 controles positivos · 17 afirmaciones
fuera de ventana · 16 deudas declaradas**. Y `test:frontera`, que no corre ahí y
va ANTES del commit, también: **23 afirmaciones, 0 fallas**.

| paso | resultado |
|---|---|
| **`npm run verificar`** | **30 pasos · 0 con falla** · `package.json` limpio · conflictos limpio · `tsc --noEmit` 14,5 s · 27 agregados |
| **`npm run test:frontera`** | **2 invariantes · 23 afirmaciones · 10 controles positivos · 0 fallas** (`s3-frontera` 12 · `s11-frontera` 11) |
| **`npm run build`** | **exit 0**, en primer plano, con `MEDIR_CON_LA_LLAVE_PRENDIDA=1` y Chrome cerrado |
| `s22-emision` (nueva) | **42 afirmaciones, 0 fallas, 1 deuda declarada** |
| **`/probe-escena/__tests__/` (22 suites)** | **todas en verde** tras las cinco reescrituras: `s12-tension` 21·0 · `s11-piso` 16·0 · `s12-barrido` 12·0 · `s9-composicion` 15·0 · las otras 18 sin tocar |
| `s10-logo` | 36 · 0 (era 34; §3, §6, §7 y §9 re-escritos) |
| `s13b-escena` | 50 · 0 (era 48) |
| `s16-encuadre` · `s16-anclaje` · `s16-techo` | 21 · 0 / 29 · 0 / 16 · 0 |
| `s8-tinta` · `s8-escena` | 30 · 0 (+3 deudas) / 36 · 0 |
| `s9-anclaje` · `s9-visibilidad` · `s17-revelado` | 46 · 0 / 88 · 0 / 35 · 0 |
| `s18-azimut` · `s18-modulacion` · `s20-arco` · `s20-brillo` | 32 · 0 / 28 · 0 / 41 · 0 / 19 · 0 |
| `tsc --noEmit` | exit 0 |

---

## 7 · LO QUE FRENÓ (PARADA 1 · g)

### 7.1 · `/probe-escena/__tests__/` — AUTORIZADO Y REESCRITO (regla 15)

La regla 6 prohíbe tocar `/probe-escena` y §2 autoriza mover la distancia de las
poses: las dos chocan. **El dueño del proyecto autorizó el toque al cerrar la
PARADA 1**, con dos condiciones: cada afirmación dice en su docblock qué
custodiaba antes y por qué cambió, y `s9-composicion` cambia de SUJETO y no de
constante. Las **CINCO** —apareció una quinta del mismo tipo al correr la suite
entera— quedan así:

| archivo | qué custodiaba | qué corre ahora |
|---|---|---|
| `s12-tension` §1 | «con α = 0 `quiénes somos` sigue siendo la de S11» (166, tol. < 1) | **se movió por la DISTANCIA y no por la luz**: 177,0 contra 166, hacia arriba y **menos que el más chico de los cuatro movimientos por LUZ** (+11,0 contra 20,2). La cota no es un número elegido: es lo que separa las dos causas |
| `s12-tension` §1 | «sin celosía reproduce S10 en las DOS intactas» | el **hero** con su tolerancia de siempre (2, la del `frameX` de V3-E, sin tocar) + `quiénes somos` se movió, con su causa |
| `s11-piso` §3 | ídem, `INTACTAS = ['hero','quiénes somos']` | `INTACTAS = ['hero']` —la única que ni B8 re-iluminó ni B13 movió— + la afirmación nueva de que la otra ya NO reproduce **por la cámara**, con el nivel del arco publicado al lado (1,00, el mismo de S9) |
| `s12-barrido` §4 | ídem sobre el barrido del slider | lo mismo, con la misma partición |
| `s9-composicion` §6 | «y el rango de distancias también [es el mayor de los cinco]»: 18,0 contra 17,5 | **la afirmación perdió su objeto y se reemplaza**: el rango se comprimió a 13,0 porque su punta CERCANA se retiró a propósito. Lo que corre es **«la cámara nunca se acerca tanto como en ninguno de los otros cuatro: nuestro mínimo (14,0) es el mayor de los cinco»** —contra 11,5 de la arquitectónica, 7,0 de la calibrada y de la dramática, 6,4 de la íntima— y el rango se **publica** sin afirmarse |

**Ninguna cifra publicada se pisó.** `S10_MEAN` y `S11_MEAN` siguen siendo lo que
S10 y S11 publicaron: son historia, no parámetros. Lo que se reescribió es la
**clasificación** —qué pose sirve de ancla y por qué— y se agregó la afirmación
que faltaba: que una pose que se MUEVE y una pose que se RE-ILUMINA dejan de
reproducir por causas distintas, y ahora el instrumento lo dice.

⚠️ **Lo que se perdió, dicho:** `s12-tension` ya no tiene ninguna pose sentada
exactamente sobre una cifra publicada. **El ancla exacta viva del repo quedó en
`s11-piso`, en el hero contra los 216 de S10** — la única pose que ni B8
re-iluminó ni B13 movió. Está anotado en los tres archivos.

### 7.1.1 · El margen que queda en `quiénes somos`

`choreography.ts` lo lleva escrito al lado de la pose, para el próximo que venga
a acercar esa cámara: con la altura de −3,60, la distancia a la que la cámara
TOCA el papel con el puntero en el extremo es **`(−3,60 − FLOOR_Y) / 0,045` =
15,64**. Estamos en 14: **quedan 1,64 de distancia**, y ni un centímetro más sin
mover también la altura o `MOUSE_HEIGHT_FACTOR`. Pasado ese número
`s18-azimut` §4 se pone en rojo; no se degrada en silencio.

### 7.2 · El halo de la referencia no se reprodujo

§1.2: su objeto ilumina y el nuestro sólo brilla. Medido, publicado, no
construido — porque construirlo agrega objetos a la escena y §1 dice «cambia su
material».

### 7.3 · Lo que la instrucción pedía y no cerró

- **El texto sobre el logo en los cinco tramos con luz sigue en 1,00–1,11:1** y
  §2.1 muestra que no hay emisiva que lo cierre sin fundir el logo con la sala.
  Es la respuesta al gate de la PARADA 1.
- **El acomodamiento de B11 se re-midió con el modelo** (bandas del cuadro), no
  con el instrumento de bloques de B11 sobre el navegador. Esa corrida —194
  paradas por ancho— queda para después del OK.

### 7.3.1 · ⚠️ Lo que §3 pedía y NO se construyó, con su razón

**Ni una línea de producto en §3.** Los cuatro pedidos están contestados —dos ya
estaban, la amplitud se midió y no se puede, la llave apagada pasa— y lo que
falta pide **tocar el anclaje** (prohibido) o **sacar uno de los cinco ejes de
dispersión** (que §3.2 manda conservar). Las dos van con su número en §3.6 y las
dos son decisión del humano. Tocar algo para mostrar movimiento habría sido
exactamente lo contrario de lo que la regla 17 pide.

### 7.3.2 · La quinta afirmación de `/probe-escena/__tests__/`

La PARADA 1 reportó **cuatro**. Al correr las 22 suites del directorio apareció
una **quinta** del mismo tipo —`s12-barrido` §4, la misma reproducción de S10 en
«las dos poses intactas»—. Se reescribió con el mismo criterio y está en la
tabla de §7.1. **La autorización se dio sobre un número que resultó ser uno menos
que el real**, y eso se dice acá en vez de contarlo entre las cuatro.

### 7.3.3 · El exportador de la coreografía obligó a mover la prosa

Escribir el porqué de B13 adentro de los comentarios del array de
`choreography.ts` puso en rojo a **`s7-export.invariant.ts`**: el exportador
emite esos comentarios desde `choreographyNotes.ts`
(`/probe-escena/_components/`) y el round-trip se compara **byte por byte**.
Arreglarlo escribiendo allá habría sido tocar un directorio que ni siquiera la
autorización de la PARADA 1 cubría —era sobre `__tests__`—, así que **el bloque
del array se restauró EXACTO desde HEAD** (con las dos distancias nuevas) y todo
el porqué se mudó a la **cabecera** del archivo, que el editor no toca.
`s10-logo` §6 afirma ahora las dos mitades: que la cabecera lo declara **y que el
bloque del keyframe NO lo lleva**, o sea que el round-trip puede cerrar.

### 7.4 · Notas de instrumento

- **`c-escena.ts` necesitó un detector de DOS regímenes.** El de B11 («la
  componente OSCURA más grande») no puede ver el logo en la noche: ahí lo oscuro
  es todo. Se corren los dos regímenes y decide un tercero independiente: la caja
  que el modelo predice. En la corrida ANTES, Trabajos devuelve «ninguno» — que
  es el hallazgo, no una falla.
- **A 1920 la página tardó en asentar** (`altos que no son múltiplo de 1080`) y
  la corrida de las dos anchuras juntas falló una vez; se corrió por ancho. La
  comprobación no se aflojó.
- **La prueba de las dos OPACAS nació sin control positivo y dio un falso
  hallazgo.** Comparar «lo compuesto» contra «lo compuesto sin escena» mide la
  diferencia entre DOS capturas tomadas en momentos distintos: si algo de la
  página todavía se está asentando, la diferencia aparece igual y se parece a un
  hallazgo. Dio 2.252 px en `tu-panel` a 1920 y era un disco en dos posiciones.
  El instrumento ahora captura una tercera vez con la escena de vuelta y publica
  `C` contra `C2`; si eso no es cero, dice que la comparación no vale. Detalle en
  la parada, punto (i).
- **`s13b-soporte.ts` se tocó y quedó idéntico a HEAD.** `git status` lo da sin
  cambios: el contrafactual que le iba a entrar terminó viviendo en
  `s13b-antes.ts`. No se lista como archivo del sprint porque no lo es.

---

# §3 · LOS NÚMEROS ADENTRO DE LA ESCENA

> *«La presentación que tienen los números no me gusta, me gustaría algo más
> como nk.»*

## 3.1 · La referencia, medida — sin una segunda navegación

⚠️ **No se abrió el navegador otra vez.** La regla es *una navegación, una
medición*, y §1 gastó la suya. Pero la sección de cifras de la referencia **ya
estaba medida**: B11 recorrió nk.studio a 1920 en 44 paradas y guardó, bloque por
bloque, el texto, el tamaño en píxeles, la caja y la opacidad
(`outputs/b11/referencia-nk-1920.json`). `scripts-b13/i-cifras-referencia.ts`
deriva de ahí las cuatro respuestas de §3.1. Su sección de cifras está en la
**pantalla 2,5** y tiene **siete**.

| pregunta de §3.1 | respuesta medida |
|---|---|
| **qué tamaños usa, y cuánto varían** | ⚠️ **UNO SOLO: 56 px las siete.** Variación: ninguna |
| **dónde pone el rótulo, y con qué peso** | **debajo** de la cifra, alineado a su izquierda (desfase en x de −9,7 a +124 px), a **12 px** — razón **4,67:1**, la misma en las siete. Los sufijos (`+`, `%`, `x`, `weeks`) van **al lado**, al mismo tamaño del rótulo |
| **si entran juntas o de a una** | **de a una**: en la pantalla 2 hay **6** y en la 2,5 hay **7** — «150» aparece en el medio |
| **cómo se relacionan con su objeto** | **lo CRUZAN**: su objeto ocupa la caja `[348, 287, 1632, 732]` y las cifras viven en x 1052–1753. Pero de sus glifos **sólo el 0,03 % cae sobre la SILUETA**: el objeto es un trazo fino y grande, no una masa |
| dispersión | **5 columnas × 4 filas**, amplitud **654,5 px de 1920 = 34,1 % del ancho**, con un escalonado vertical **dentro** de la fila de hasta 24 px |

### ⚠️ La premisa de §3.1 está refutada en su primera mitad

La instrucción dice: *«Sus cifras flotan sobre el paisaje: **tamaños distintos**,
el rótulo chiquito debajo»*. **El rótulo chiquito debajo, sí —4,67:1—. Tamaños
distintos, NO: usa uno solo, 56 px en las siete.** La referencia dispersa por
POSICIÓN, no por tamaño.

Y eso importa más de lo que parece, porque es la premisa fundacional de nuestra
sección. `Numeros.tsx` abre con: *«Medido y observado sobre la referencia:
"Están dispersos en posiciones asimétricas **y tamaños distintos**"»*. **La
medición refuta la segunda mitad de esa cita.** Es el mismo modo de falla que
B11 documentó con D-B8.5: una atribución a la referencia que gobernó tres
sprints sin que nadie la volviera a medir.

## 3.2 · Lo nuestro, medido en pantalla (`scripts-b13/j-cifras.ts`)

| pantalla | cifras | tamaños | ocupan del cuadro |
|---|---|---|---|
| 1 · entrada | 0 (sólo la cabecera) | — | 0 % |
| 2 · volumen | 2 — «23», «9» | 65 px · 38 px | 5,95 % |
| 3 · tiempo | 2 — «4», «6 h» | 21 px · 53 px | 2,77 % |
| 4 · escala | 1 — «31» | 38 px | 1,90 % |

**Tamaños: 21,4 · 38,3 · 53 · 65 px — cuatro, razón 3,04:1.**
**Razón cifra/rótulo: 6,5 · 5,3 · 3,83 · 2,14:1** (la referencia: 4,67 en las
siete). ⚠️ **La más chica tiene su rótulo a menos de la mitad de la distancia a
la que la referencia nunca baja**: a 2,14:1 el rótulo deja de leerse como rótulo.

## 3.3 · Los cuatro pedidos de §3.2, uno por uno

| pedido | estado | medición |
|---|---|---|
| **«el rótulo va con su cifra, no como etiqueta suelta»** | **YA ESTABA** | `Cifra.tsx` los pone en el MISMO `<p>`, `flex flex-col gap-2`: cifra arriba, rótulo abajo, alineados a la izquierda. Es exactamente la disposición de la referencia |
| **«con la escena visible entre ellas»** | **YA ESTABA** | el panel es `papel-transparente` y las cifras ocupan el **1,9 % al 5,95 %** del cuadro: el 94–98 % restante es sala. La captura lo muestra |
| **«recuperar la amplitud, si el logo se achica: medilo»** | **MEDIDO — NO SE PUEDE** | §3.4 |
| **«verificar con la llave apagada»** | **MEDIDO — AGUANTA** | §3.5 |

## 3.4 · ⚠️ La amplitud NO se recupera, y está medido sobre las columnas de B11

`scripts-b13/h-amplitud.ts` corre la MISMA pregunta de B11 sobre las MISMAS doce
columnas —las de `outputs/b11/grillas.json`, medidas en el navegador sobre la
grilla renderizada— con las poses de antes y de después de B13. A 1440, sobre las
54 paradas de la ventana de Números:

| cuándo | c1 | c2 | c3 | c4 | c5 | c6 | c7 | c8–c12 | primera libre | amplitud |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|
| ANTES | 89 | 100 | 100 | 100 | 100 | **100** | 0 | 0 | **c7** | **602 px de 1220** |
| DESPUÉS | 89 | 100 | 100 | 100 | 100 | **48** | 0 | 0 | **c7** | **602 px de 1220** |

**El logo se achicó y la columna libre no se movió.** Lo que cambió es que la
columna 6 pasa de estar tapada SIEMPRE a estarlo en el 48 % de las paradas — y
B11 fijó su regla en el 0 %, no en «casi nunca». Bajar la composición a c6 sería
aflojar esa regla, no cumplirla.

**Por qué**: `frameX` = −0,45 en la pose de Números empuja el logo a la
izquierda, y achicarlo alrededor de un punto de mira que ya está a la izquierda
mueve su borde derecho apenas media columna (~87 px). **La amplitud que B11
sacrificó no vuelve con el tamaño.**

## 3.5 · La llave apagada: la composición aguanta los dos

⚠️ **Con la llave PRENDIDA la sección muestra cifras inventadas** —«23», «9»,
«4», «6 h», «31»—, no marcadores: los marcadores son lo que se ve con la llave
APAGADA (`inventado.ts`: `pedido: '[CIFRA]'`, `mentira: '23'`). `[CIFRA]` es más
largo, y la pregunta es si la composición lo aguanta:

| cifra | marca con la llave prendida | con `[CIFRA]` | su celda | ¿desborda? |
|---|---:|---:|---:|---|
| proyectos | 102 px | **243 px** | 842 px | no |
| clientes | 49 | **159** | 556 | no |
| años | 39 | **100** | 413 | no |
| respuesta | 97 | **203** | 413 | no |
| procesos | 72 | **159** | 556 | no |

**`[CIFRA]` es 2,1 a 3,2 veces más ancho que la mentira y ninguna desborda su
celda**: la más apretada es «respuesta», que usa 203 de 413 px — la mitad. La
composición aguanta los dos estados. Evidencia:
`capturas/b13/numeros-llave-prendida-1920-p2.png` y `numeros-llave-apagada-1920-p2.png`.

## 3.6 · ⚠️ LO QUE FALTA NO SE PUEDE CONSTRUIR ADENTRO DE B13, Y ÉSTE ES EL NÚMERO

Los cuatro pedidos están: dos ya estaban, uno se midió y no se puede, el cuarto
pasa. **Y sin embargo la diferencia con la referencia sigue ahí**, así que hay
que decir cuál es, con su cifra, en vez de tocar algo para mostrar movimiento.

**La referencia muestra SIETE cifras en UN cuadro, todas del mismo tamaño, en el
34,1 % del ancho. Nosotros mostramos UNA O DOS por pantalla, en CUATRO pantallas,
en cuatro tamaños.** Eso es lo que hace que las suyas se lean como una
constelación y las nuestras como una lista. Las dos palancas que lo cerrarían
están las dos **fuera de las reglas de B13**:

1. **Juntarlas en menos pantallas** es cambiar el alto de la sección en
   `secciones.ts`, o sea **el anclaje** —prohibido por la regla 6—, y además
   reabre lo que B2 arregló: con las cinco en una pantalla quedan tres pantallas
   vacías detrás, y ése era el hueco de **5,44 pantallas** que B2 encontró,
   contra el gate de 1,33 de B9.
2. **Unificar el tamaño** es sacar uno de los **cinco ejes de dispersión que
   §3.2 manda conservar**. Medido, si se hiciera: las cinco cifras pasarían a
   65 px, la razón cifra/rótulo quedaría en **6,5:1 en las cinco** (hoy 2,14 a
   6,5; la referencia usa 4,67) y la dispersión quedaría en **cuatro ejes**
   —arranque de columna, ancho, renglón y pantalla—, que siguen siendo cuatro
   valores distintos de arranque y tres de ancho. **Es una línea**: los cinco
   `nivel` de `GEOMETRIA.celdas`.

**No se aplicó ninguna de las dos.** La primera está prohibida; la segunda
contradice la instrucción, y contradecirla sin que el humano lo sepa sería
exactamente lo que la regla 11 prohíbe. **La decisión es suya, y ahora tiene el
número de las dos.**

---

# §4 · EL PIE, TRANSPARENTE DE VERDAD

> *«El footer sigue siendo sólido, no transparente.»*

## 4.1 · Qué se revirtió, y qué se conservó

- **Se fue el fondo**: la regla `[data-pieza="banda-del-pie"]` de
  `_estilos/pie.css` pintaba `background-color: var(--color-fondo)` debajo del
  CTA, las tres columnas y la línea de cierre. Con ella se fueron el relleno y el
  margen negativo que la compensaban —existían **sólo** para que el fondo llegara
  más lejos que el contenido, y netean cero: la geometría queda idéntica— y el
  sangrado horizontal del `<div>` (`mx-` negativo + `px-`), que era lo mismo en
  el otro eje.
- **Se conserva el `<div>` con su `grid gap-12`**: es el agrupador, no el velo.
  Sacarlo devolvería la caja de contenido de TRES filas a CINCO y movería el
  censo de B9, que está en su vara y no es de este bloque.
- **El formulario se queda con su fondo propio**, que es la excepción que §4
  nombra: *«es un control, no una superficie»*. Y la medición la justifica: sus
  cuatro bloques pasan (6,43 · 6,43 · 7,22 · 17,60:1).

## 4.2 · Medido DESPUÉS de §1 y §2 — y las dos no lo cambiaron

§4 pide medirlo después de §1 y §2 «porque las dos lo cambian». **Medido: no lo
cambian, y el porqué es exacto.**

- **§1 no llega**: en el Cierre el arco está en **0,643**, muy por encima de
  `RIM_NIGHT_LEVEL` (0,34), así que `emisionDelLogoEn` devuelve **cero exacto**.
  El logo del Cierre vale 2 de 255 antes y después.
- **§2 casi no llega**: `demos` a 14 baja el máximo de la ventana del Cierre de
  6,26 % a 5,80 % del cuadro, y en su ancla la cobertura no se mueve (3,16 % a
  1440 · 2,84 % a 1920).
- **Y la sala del Cierre es la misma**: luminancia media **0,3028**, el número
  que B12 publicó (gris 145,5, luminancia 0,303).

## 4.3 · La tabla por bloque — 24 bloques, con el instrumento de B11

`scripts-b11/b-bloques.ts --solo=cierre` a 1440 y 1920 (el mismo que firma cada
fila de `s10-acceso-escena.ts`, con el recorte de la pastilla).
`outputs/b13/bloques-b13-cierre-{1440,1920}.json`.

**Los SIETE que fallan (1920; a 1440 son ocho):**

| bloque | px | glifos | peor | bajo AA | umbral |
|---|---:|---:|---:|---:|---|
| «las redes, una por red» | 10 | 487 | **2,44** | 21 | 4,5 |
| «[ENLACE]» | 12 | 306 | **2,45** | 3 | 4,5 |
| «Lo que» (titular) | 65 | 2.940 | **2,49** | 78 | 3 |
| «sigue lo» (titular) | 65 | 3.872 | **2,49** | 79 | 3 |
| «la dirección de contacto…» | 10 | 895 | **2,49** | 7 | 4,5 |
| «armamos» (titular) | 65 | 4.599 | **2,50** | 38 | 3 |
| «con vos» (titular) | 65 | 3.232 | **2,66** | 35 | 3 |

**Los DIECISIETE que pasan:** las **siete anclas** del recorrido (4,90 · 4,97 ·
4,97 · 4,97 · 5,04 · 5,53 · 8,59), el logotipo (4,97), el legal (4,97), el CTA
(5,77), la línea de cierre con `[FECHA] · [NOMBRE]` (5,98), los tres rótulos de
columna (7,22 · 8,50 · 9,30) y **los cuatro del formulario** (6,43 · 6,43 · 7,22
· 17,60).

**Se parten en dos familias y sólo una es nueva:**

- **Cuatro son el titular** (`titulo-xl`, 65 px, 2,49–2,66 contra 3:1). Es
  **D-B12.2**, que ya estaba declarada CON la banda puesta: la banda nunca los
  cubrió. Su causa es la varianza de la sala a nivel 0,643 —piso brillante y
  barras de celosía oscuras—, no el logo: `sobreElLogo` = 0,0 % en los siete.
- **Tres son texto chico** y son **lo que la banda tapaba**: 21, 7 y 3 píxeles
  bajo AA de 487, 895 y 306, o sea **el 0,8 % al 4,3 % del glifo**. (Los cuatro
  del titular pierden 78, 79, 38 y 35 de 2.940–4.599: el 0,8 % al 2,7 %.)

## 4.4 · NO CIERRA — D-B13.3, declarada, y la banda no vuelve

§4 lo dice: *«Si con el logo emitiendo el pie cierra, cerró. Si no, la deuda se
declara con su número — no vuelvas a poner la banda.»* **No cierra**, y la
emisión no podía cerrarlo porque en el Cierre vale cero por construcción.

**`D-B13.3`** queda declarada en `deudas-b13.ts` con la tabla entera, y las filas
del Cierre de `s10-acceso-escena.ts` —que publicaban **18,00 / 6,85 / 6,44
«sobre el pie que pinta #0E0E0E»**, o sea la medición de B11 con el pie
relleno— se re-escribieron contra lo que hoy se ve: **2,41:1 (8 de 21 a 1440) y
2,44:1 (7 de 22 a 1920)**, y la del formulario en 6,43 con su fondo propio. La
fila de `@0,6` desaparece: ya no hay ningún bloque a esa opacidad.

⚠️ **Estaban en verde describiendo un pie de hace dos bloques.** Es el mismo modo
de falla que §7.1: una afirmación que sobrevive a la decisión que describía.

**Las dos salidas, medidas y las dos fuera de B13:** la **luz** (bajar el nivel
del arco detrás de esa pantalla — es `lightArc.ts` y es del humano) o la
**composición** (bajar el titular de `titulo-xl`, o moverlo fuera de la lonja
brillante del piso). **La tinta no es salida**: B12 midió las dos variantes y las
dos fallan, porque lo que falla no es el contraste medio sino el peor píxel.

---

# 🛑 PARADA 2 — el cierre, punto por punto

## (a) `verificar` en cero, el build en primer plano, y `frontera`

| | |
|---|---|
| `npm run verificar` | **30 pasos · 0 con falla** — 133 invariantes · **5.365 afirmaciones** · 913 controles positivos · 17 fuera de ventana · 16 deudas declaradas |
| `npm run build` | **exit 0**, en primer plano, Chrome cerrado, con `MEDIR_CON_LA_LLAVE_PRENDIDA=1` (sin esa variable falla a propósito, y está bien) |
| `npm run test:frontera` | **23 afirmaciones · 10 controles positivos · 0 fallas** |
| `tsc --noEmit` | exit 0 |

El registro de deudas pasó de **15 a 18**: las tres de B13 (`cruceDeLaVuelta`
§4.3 · `haloQueNoIlumina` §7.2 · `pieSinBanda` §4.4). Las «16 deudas declaradas»
de la tabla son otra cuenta —los `deudaDeclarada()` que corren, repartidos en
`s10` (12), `s8` (3) y `s22` (1)—, no el tamaño del registro.

Ninguna afirmación se aflojó ni se borró; las cinco de `/probe-escena/__tests__/`
se reescribieron contra la propiedad nueva (§7.1) y las cinco quedaron en verde.

## (b) El logo: el valor, el contraste encima, y la silueta

**`EMISION_EN_LA_NOCHE = 0,16`** en luz lineal, con la curva atada al arco: cero
por encima de `RIM_NIGHT_LEVEL` (0,34) y el tope en `NIVEL_DE_LA_NOCHE` (0,04).

**El contraste del texto encima, en las seis secciones**, con la tinta de cada
una y el peor píxel del logo (modelo, `s22-emision` §3 y §4):

| sección | nivel del arco | emisión | tinta | texto encima ANTES | DESPUÉS |
|---|---:|---:|---|---:|---:|
| hero | 1,000 | 0 | `#111111` | 1,11 | **1,11** (idéntico, bit a bit) |
| quiénes somos | 1,000 | 0 | `#111111` | 1,11 | **1,11** |
| números | 1,000 | 0 | `#111111` | 1,11 | **1,11** |
| **trabajos** | **0,040** | **0,16** | `#F7F7F5` | 19,58 | **5,77** ✅ |
| el diferencial | 0,643 | 0 | `#111111` | 1,11 | **1,11** |
| cierre | 0,643 | 0 | `#111111` | 1,10 | **1,10** |

**La silueta sigue leyéndose**, medido en la captura y no en el modelo (el
modelo no tiene especular): el degradé interno del logo no se mueve un punto en
los cinco tramos con luz —4,2 · 3,0 · 15,0 · 1,0 · 3,1— y en Trabajos pasa de no
existir a 3,0 sobre un fondo de 21. La marca, sus dos contras y el canto se ven
en `capturas/b13/despues-trabajos-1920-S.png`.

## (c) El tamaño en cuadro por tramo, y el margen libre

Máximo de la ventana de cada sección, sólo en las paradas en que la escena
dibuja, a 1025×900 —el cuadro más angosto donde la escena existe—:

| sección | antes | después |
|---|---:|---:|
| hero | 11,85 % | **10,68 %** |
| quiénes somos | 21,97 % | **15,17 %** |
| números | 22,06 % | **15,50 %** |
| trabajos | 8,70 % | **8,64 %** |
| el diferencial | **36,10 %** | **15,40 %** |
| cierre | 6,26 % | **5,80 %** |
| **todo el recorrido** | **36,10 %** | **15,51 %** |

**El margen libre por sección** (las doce columnas reales de la grilla de B11, a
1440, sobre la ventana entera): la primera columna que el logo no toca en
ninguna parada sigue siendo **la 7 en Números** —602 px de 1220, antes y
después—. Lo que se ganó es que **la columna 6 pasa de tapada siempre a tapada
el 48 % de las paradas**. §3.4.

## (d) ⚠️ LAS DEUDAS DE CONTRASTE: NINGUNA CERRÓ CON LA EMISIÓN

Es el número que dice si valió la pena, y hay que darlo derecho.

| deuda | qué esperaba | qué pasó |
|---|---|---|
| D-B8.1 · Números, el atardecer | — | **no cierra**: la emisión vale 0 ahí (nivel 1) |
| D-B8.2 · Trabajos, el modelo | — | **no cierra**: es la sala a pleno sol al asomar, no el logo |
| D-B8.3 · el diferencial | — | **no cierra por contraste**, pero se abrió su palanca de layout: **P-B13.1** |
| D-B11.1–4 · el piso de motas | — | **no cierra**: son partículas, no el logo |
| D-B5.1 · la pared del diferencial | — | **no cierra**: es luz |
| D-B12.1 · las motas blancas | — | **no cierra** |
| D-B12.2 · el titular del Cierre | — | **no cierra**, y D-B13.3 lo vuelve a publicar |

**Cero de siete.** Y la razón está medida en «LA RESPUESTA AL GATE»: con esta
paleta, cualquier valor del logo que deje pasar la tinta oscura lo funde con la
sala. **La emisión no fue a cerrar esas deudas: fue a cerrar un defecto que
nadie había declarado** — el logo era **indetectable** en la noche de Trabajos
(1,14:1 contra su sala; el detector de silueta devuelve «ninguno») y ahora está
en **2,95:1**, la banda de la referencia. Ese defecto no tenía número porque el
instrumento que lo habría visto tampoco podía verlo: `D-B12.1` lo dejó anotado
sin nombrarlo — *«con la sala en 11 de gris, `siluetaMasGrande` toma el cuadro
entero»*.

**Y §2 abrió dos cosas que estaban cerradas con la medición contraria**:
**P-B13.1** (la palanca de §7.43, que S12 midió como inexistente) y la ventana
del diferencial, que ahora abre **antes** del ancla heredada.

## (e) Los números: la dispersión conservada, con la llave prendida y apagada

⚠️ **Esto es verificación, no construcción.** §3 pedía rehacer la presentación y
**no se rehizo**: ver «§3 SIGUE ABIERTO» arriba de todo, con el porqué, el número
y lo que haría falta ahora.

**Los cinco ejes intactos**: cinco arranques de columna en cuatro valores (7 · 9
· 8 · 10 · 7), tres anchos (6 · 4 · 3), renglón propio, tres pantallas y los
cuatro tamaños. **No se movió una celda**: §3 no tocó `GEOMETRIA`.

**Con la llave prendida** la sección muestra las cinco mentiras (23 · 9 · 4 ·
6 h · 31) a 65 · 38 · 21 · 53 · 38 px. **Con la llave apagada**, `[CIFRA]` mide
**243 · 159 · 100 · 203 · 159 px** contra celdas de 842 · 556 · 413 · 413 · 556:
2,1 a 3,2 veces más ancho que la mentira y **ninguna desborda**. §3.5.

## (f) El pie: sin banda, la tabla por bloque, y qué quedó abierto

La banda se fue. **7 de 24 bloques fallan a 1920 y 8 de 23 a 1440, peor 2,41:1.**
Cuatro son el titular (D-B12.2, que la banda nunca cubrió) y tres son el texto
chico que la banda tapaba, con 3 a 21 píxeles bajo AA de 306 a 895. **El
formulario pasa con su fondo propio** (6,43 · 6,43 · 7,22 · 17,60). **NO CIERRA →
`D-B13.3`**, declarada, y la banda no vuelve. §4.

## (g) El preloader: ni su logo ni su aterrizaje se movieron

- `scene-framing.invariant.ts`: **40 en verde, 0 en rojo**, con la tinta en
  **445 × 310 px en 1440×810** — la misma cifra de V3-E. La pose del hero no se
  tocó.
- `s22-emision` §7 afirma que **`IntroLogoCanvas.tsx`, `introRig.ts` e
  `introShading.ts` no importan nada** de `logoEmision.ts`, y que su relevo
  sigue aterrizando en emisiva **cero** (`emissiveMix: 1 - t`).
- Los seis invariantes del intro (`s8e`) corren en verde: 484 afirmaciones.

## (h) El censo y el techo de velocidad, sin moverse

- **Censo de B9** (`scripts-b11/censo.ts`, el de B2-DELTAS §0): **1920 → hueco
  máximo 1,33 pantallas · 21 acontecimientos · 229 piezas**; **1440 → 1,20 · 17
  · 214**. Exactamente las cifras de B11.
- **Techo de velocidad**: `s16-techo` en verde, 16 afirmaciones. Y el pico del
  recorrido **BAJÓ** de 4,6198 a 3,4126 alturas de cuadro por pantalla de
  scroll: ningún tramo se aceleró (§4.6).

## (i) Las capturas de las OCHO, a 1440 y 1920

`capturas/b13/`, 66 PNG. `C` es lo compuesto, `S` la escena sola, `N` lo
compuesto **con la escena escondida**.

| sección | superficie | antes | después | cómo se lee |
|---|---|---|---|---|
| hero | transparente | `antes-hero-{1440,1920}-{C,S}` | `despues-…` | el logo entero, más chico |
| quiénes somos | transparente | ✓ | ✓ | la pose que más se movió (11,5 → 14) |
| números | transparente | ✓ | ✓ | ✓ |
| trabajos | transparente | ✓ | ✓ | **la noche**: el logo pasa de no existir a verse |
| **servicios** | **OPACA** | — (ver abajo) | `despues-servicios-{1440,1920}-{C,N}` | la escena no aporta un píxel |
| **tu panel** | **OPACA** | — (ver abajo) | `despues-tu-panel-{1440,1920}-{C,N}` | la escena no aporta un píxel |
| por qué develOP | transparente | ✓ | ✓ | **36,10 % → 15,40 %** del cuadro |
| cierre | transparente | ✓ | ✓ | sin banda, con el fondo de la escena |

### ⚠️ Las dos OPACAS no tienen «antes», y la razón es más fuerte que un par de capturas

`servicios` y `tu-panel` declaran `dejaVerLaEscena: false`. En vez de sacarles un
«antes» que sería la misma imagen, se midió **si la escena aporta algo**: se
captura lo compuesto, se esconde `[data-escena]`, se vuelve a capturar, y se
cuentan los píxeles que difieren.

| sección | ancho | control del cuadro quieto (C contra C2) | esconder la escena cambia |
|---|---:|---:|---:|
| servicios | 1440 | 0 px | **0 px** |
| servicios | 1920 | 0 px | **0 px** |
| tu panel | 1440 | 0 px | **0 px** |
| tu panel | 1920 | 0 px | **0 px** |

**Cero en las cuatro.** La escena no pinta un solo píxel de esas dos secciones,
así que ningún cambio de la escena puede alcanzarlas: **«antes» y «después» son
la misma imagen por construcción, no por parecido.** Y la otra mitad de B13 —la
banda del pie— vive en `Cierre.tsx` y en `pie.css`: `git status` no tiene ni un
archivo de esas dos secciones.

### La trampa que casi se publica como hallazgo (el método, en M.1 y M.2)

La **primera** pasada dio **2.252 px (0,109 % del cuadro)** en `tu-panel` a 1920,
en una caja de 67 × 61. Mirados de cerca eran **el mismo disco en dos posiciones
a 30 px una de otra** — una pieza todavía asentándose del ciclo de escondido de
la sección anterior, no la escena. El control aislado lo reprodujo en **0 px**, y
en esa caja no vive ningún elemento del DOM.

Así que el instrumento se arregló en vez de creerle a una sola pasada: ahora
captura una **tercera** vez con la escena de vuelta y publica `C` contra `C2`. Si
el cuadro no estaba quieto, la comparación **no dice nada** y lo dice. Es la
misma regla de `verde-por-arnés`: una medición sin control positivo mide el
arnés.

## (j) EL PESO: B13 NO DECLARA MONTAJE — **DEVUELVE 75,0 B**

> **Es la primera vez en el proyecto que un bloque le DA aire al presupuesto en
> vez de pedirlo.** B4-A subió el techo de 60 a 61,25 con recibo. B9 dejó ~34 B
> sin línea. B10 cerró con **2,9 bytes** de margen. B11 declaró +25 B netos y
> dejó 8,6 B de aire. B13 abre con **6,0 B** y cierra con **81,0**.

| | |
|---|---|
| escrito por el lane | **67.881 KiB** (69.510 B, restado el preámbulo de Sentry de 1.740 B) |
| sin el andamio de la llave | **63,7 KiB** contra el techo de **63,76** → **81,0 B de aire** |
| contra el techo VIEJO de 60 | **59,921 KiB** |

La instrucción abrió con **6,0 B de aire**; quedan **81,0**. **B13 devuelve
75,0 B** y no declara ni un montaje.

**Atribuido**: las dos clases del sangrado de la banda que salieron de
`Cierre.tsx` —`mx-[calc(var(--pad-lateral-compacto)*-1)]` y
`px-[var(--pad-lateral-compacto)]`— suman **73 caracteres**. Los 2 B restantes no
se atribuyen y se publican como tales (la lección de B11 §10.1: el chunk es la
vara, no el fuente).

⚠️ **Lo de la escena no pesa en esta cuenta, y eso también es un dato**:
`logoEmision.ts`, los tres archivos de la escena y `choreography.ts` viajan en el
chunk diferido de `three` (el de las dos distancias es `657-…js`, que no es
ninguno de los cinco de la carga inicial). La compuerta de 1025 sigue haciendo su
trabajo: **el logo que emite no le cuesta un byte a la primera visita.**

---

## (k) Archivos y `git status`

**34 entradas: 23 modificados y 11 sin rastrear.** El detalle por archivo está en
§8; lo que importa acá es el reparto.

| | cuántos | cuáles |
|---|---:|---|
| producto de la escena | 5 | `logoEmision.ts` (nuevo) · `ProbeLogo.tsx` · `ProbeStage.tsx` · `OrbitRig.tsx` · `choreography.ts` |
| producto de §4 | 2 | `_estilos/pie.css` · `_secciones/cierre/Cierre.tsx` |
| instrumentos del lane | 16 | 5 nuevos (`logoEmitido.ts`, `s22-emision.invariant.ts`, `s13b-antes.ts`, `s10-logo-lateral.ts`, `deudas-b13.ts`) y 11 reescritos |
| **`/probe-escena/__tests__/`** | **4** | `s9-composicion` · `s11-piso` · `s12-tension` · `s12-barrido` — **autorizados**, regla 15, §7.1 |
| banco de medición | 11 | `scripts-b13/` entero, nuevo |
| configuración | 2 | `.gitignore` · `package.json` |
| evidencia | 3 | este reporte · `outputs/b13/` (18 JSON) · `capturas/b13/` (66 PNG) |

**Ni un archivo de `servicios` ni de `tu-panel`.** Ni del anclaje, del progreso,
de los rangos, del arco del sol, del home actual, de `scene-camera.ts` ni de los
frozen. Cero `any`, cero color, cero dependencias.

## (l) Todo lo que frenó

Once cosas, todas con su número y su lugar:

1. **⛔ La emisión NO resuelve el texto sobre el logo, y nada puede** — la
   pregunta del gate, contestada con medición y con su consecuencia sobre B11.
   Sección propia, arriba de todo.
2. **D-B13.1 · el cruce de la vuelta** (§4.3) — declarada, con el paralelo al
   problema del valor intermedio que S8 ya resolvió en el preloader (§4.3.1).
3. **D-B13.2 · el halo que no ilumina** (§7.2) — la referencia le aporta luz al
   entorno; la emisiva sola no. No se reprodujo: pedía luz nueva en la escena.
4. **D-B13.3 · el pie sin banda** (§4.4) — 7 de 24 bloques a 1920 y 8 de 23 a
   1440 fallan AA. Declarada, **y la banda no vuelve**.
5. **P-B13.1 · la palanca de §7.43, que ahora EXISTE** (§4.7) — S12 la midió como
   inexistente y la medición contraria la reabre. **Reportada, no aplicada.**
6. **⚠️ §3 quedó ABIERTO** — la presentación de los números no se rehizo. Sección
   propia arriba de todo, con lo que pedía, lo que se hizo en su lugar, el número
   de por qué no, y las tres cosas que harían falta ahora que el logo bajó a
   15,40 % y c6 se liberó el 52 % de las paradas. También §7.3.1 y §3.6.
7. **La quinta afirmación de `/probe-escena/__tests__/`** (§7.3.2) — apareció al
   correr las 22 suites, de la misma familia que las cuatro autorizadas.
8. **El exportador de la coreografía** (§7.3.3) — obligó a mover toda la prosa de
   B13 al encabezado del archivo: el bloque de keyframes se compara byte a byte.
9. **El margen de `quiénes somos`** (§7.1.1) — la holgura bajó de ×1,360 a
   ×1,118. Anotado con su número: a 14 quedan **1,64 de distancia** antes de que
   la cámara toque el papel (toca en 15,64).
10. **Cero de siete deudas de contraste cerradas** (d) — el número que dice si
    valió la pena, dado derecho.
11. **El falso hallazgo de 2.252 px** (i) — se arregló el instrumento en vez de
    publicarlo.

---

# MÉTODO — dos cosas que este sprint deja para el próximo

## M.1 · «El disco en tránsito» — el modo de falla de comparar DOS capturas

Toda pregunta del tipo *«¿esto aporta algo?»* se contesta restando dos capturas.
Y toda resta de dos capturas tiene el mismo agujero: **las dos se toman en
momentos distintos.** Si algo de la página todavía se está asentando, la
diferencia aparece igual, tiene forma, tiene área, y **se parece a un hallazgo**.

Pasó acá. La primera pasada de la prueba de las opacas dio **2.252 px (0,109 %
del cuadro)** en `tu-panel` a 1920, en una caja de **67 × 61**. Con el detector
apuntando a la sección más opaca del sitio, eso leía como «la escena sí aporta».
Era **el mismo disco en dos posiciones a 30 px una de otra**.

**Cómo se distingue una pieza en tránsito de un aporte real.** Cuatro
discriminadores, del más barato al más caro:

1. **El control del cuadro quieto — el único decisivo.** Capturar una TERCERA vez
   con todo de vuelta como al principio, y comparar `C` contra `C2`. Si eso no da
   **cero**, el cuadro no estaba quieto y la resta `C − N` **no dice nada**: no
   es que dé mal, es que no mide lo que uno cree. Es el mismo principio de
   `verde-por-arnés`: una medición sin control positivo mide el arnés.
2. **La forma de la diferencia.** Una pieza en tránsito aparece **dos veces** —la
   misma figura congruente en dos lugares, el hueco de donde salió y el bulto de
   adonde llegó—. Un aporte real aparece **una**. En el mapa de deltas se ve
   directo: acá los dos discos eran idénticos, el interior difería poco (la
   figura contra su propio fondo, delta 16 a 64) y sólo el cruce difería fuerte
   (delta 230).
3. **Preguntarle al DOM qué vive en esa caja.** Si no hay ningún elemento con esa
   geometría, lo que cambió no es una superficie de la sección.
4. **Reproducirlo aislado.** Un tránsito **depende de lo que pasó ANTES** —acá,
   del ciclo de escondido de la sección anterior—, así que corrido solo no
   aparece. Dio **0 px**.

**La salida no fue publicar el hallazgo ni bajar el umbral: fue arreglar el
instrumento.** `c-escena.ts` ahora captura la tercera vez siempre y publica `C`
contra `C2` al lado del resultado; si el cuadro no estaba quieto, **lo dice él**.

## M.2 · Cómo se contesta «¿esto aporta algo?», en cuatro pasos

El problema concreto era: `servicios` y `tu-panel` son opacas, B13 no tiene un
«antes» de ellas, y sacarles dos capturas que se parezcan no prueba nada —dos
imágenes parecidas son dos imágenes parecidas—. **La pregunta correcta no era
«¿cambió?» sino «¿la escena pinta un solo píxel acá?».**

**La receta, que sirve para cualquier capa:**

1. **Capturar lo compuesto** (`C`).
2. **Esconder la capa** con `visibility: hidden`, **nunca con `display: none`**:
   `visibility` conserva el layout, así que lo que quede en el cuadro no se movió
   ni un píxel por el hecho de esconder. `display` reflota la página y la resta
   pasa a medir el reflow.
3. **Capturar de nuevo** (`N`), **restaurar**, y **capturar una tercera vez**
   (`C2`) para el control de M.1.
4. **Contar píxeles que difieren, no promediar.** Un promedio diluye 2.252 px en
   dos millones hasta volverlos invisibles; el conteo los deja a la vista. Y la
   vara es **cero**, no «poco».

**Por qué esto es más fuerte que un par de capturas.** «Se ven iguales» es un
juicio sobre dos imágenes. **«La capa no pinta un píxel»** es una propiedad del
sistema: si la escena no aporta nada, entonces **ningún** cambio de la escena
—éste ni el próximo— puede alcanzar esa sección. Antes y después son la misma
imagen **por construcción**, y eso no hay que volver a medirlo el sprint que
viene.

Dio **0 px en los cuatro casos** (dos secciones × dos anchos), con el control del
cuadro quieto también en 0.

---

## 8 · ARCHIVOS

**Escena (producto), 4:** `_lib/escena/logoEmision.ts` (nuevo: la curva, el tope
y la escritura) · `ProbeLogo.tsx` (publica su material por un ref) ·
`ProbeStage.tsx` (crea el ref y lo reparte) · `OrbitRig.tsx` (una línea en el
`useFrame`, al lado del brillo de las motas) · `choreography.ts` (dos distancias
y su porqué).

**Instrumentos y registro, 11:** `_lib/escena/__tests__/logoEmitido.ts` (nuevo:
la cadena con emisiva y su control de equivalencia) · `s22-emision.invariant.ts`
(nuevo) · `s13b-antes.ts` (nuevo: el contrafactual de B13) ·
`s10-logo-lateral.ts` (nuevo: §7, sacado por la regla de las 300 líneas) ·
`s10-logo.ts` (la emisión entra al muestreo) · `s10-logo.invariant.ts` ·
`s10-logo-tablas.ts` · `s10-logo-columna.ts` · `s10-logo-encuadre.ts` ·
`s13b-escena.invariant.ts` · `s13b-diferencial.ts` ·
`s16-anclaje.invariant.ts` · `s16-encuadre.invariant.ts` ·
`_lib/__tests__/deudas-b13.ts` (nuevo) · `deudas-b11.ts` (el registro unido) ·
`_lib/__tests__/s10-acceso-escena.ts` (las tres filas del `cierre` que hablaban
de la banda, reemplazadas por dos derivadas: `--color-tinta@1` razón 2,41 con
`deuda: 'pieSinBanda'`, y `--color-tinta-tenue@1` razón 6,43).

**Producto de §4 (2):** `_estilos/pie.css` (se fue la banda; el formulario
conserva su fondo) · `_secciones/cierre/Cierre.tsx` (el `<div>` queda como
agrupador, sin el sangrado).

**Instrumentos nuevos (`scripts-b13/`, 11):** `b13-comun.ts` · `a-barrido.ts` ·
`b-referencia.ts` · `c-escena.ts` · `d-tamano.ts` · `e-noche.ts` ·
`f-columnas.ts` · `g-noche-visible.ts` · `h-amplitud.ts` ·
`i-cifras-referencia.ts` · `j-cifras.ts`.

**`/probe-escena/__tests__/` (4), AUTORIZADOS:** `s9-composicion.invariant.ts`
(cambió de SUJETO) · `s11-piso.invariant.ts` · `s12-tension.invariant.ts` ·
`s12-barrido.invariant.ts`. Cada uno dice en su docblock qué custodiaba antes y
por qué cambió. Regla 15: reescritos contra la propiedad nueva, ni aflojados ni
borrados. El porqué está en §7.1.

**Evidencia:** `outputs/b13/` (18 JSON) · `capturas/b13/` (66 PNG: C y S de las
seis transparentes, antes y después, a 1440 y 1920; C y N de las dos opacas; los
tres compuestos de la noche de Trabajos; y las de las cifras) · este reporte.

**Configuración:** `.gitignore` (`/.next-b13/`, `/.b13-capturas/`) ·
`package.json` (`test:s22-emision`, `test:s22`).

**Ninguna línea fuera de eso.** No se tocó: el anclaje, el progreso, los rangos
de los patrones, el arco del sol, el home actual, `scene-camera.ts`, los frozen,
ni las zonas del otro socio. De `/probe-escena` se tocaron **sólo** las cuatro
afirmaciones autorizadas de `__tests__/` —ni un archivo de la ruta— más la quinta
de §7.3.2. Ni un `any`, ni una dependencia nueva, ni un `setState` por cuadro, ni
un color.
