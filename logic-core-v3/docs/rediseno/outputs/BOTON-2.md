# BOTON-2 — el CTA construido con lo que BOTON-1 midió

**Construido y verificado. NO commiteado.** `npm run verificar` da **30 pasos, 0 con falla, 19
deudas declaradas** — el mismo resultado que el árbol de partida. Cinco archivos modificados,
ninguno fuera del scope, ningún intocable tocado.

Los dos gestos que pidió el dueño están puestos, y los dos están medidos en el píxel:

> **el rótulo que se desliza y SE QUEDA** — al soltar, el reposo vuelve en **1 muestra** contra
> las **98** de antes.
>
> **el subrayado que se parte, el hueco viaja y se une al llegar al final** — el hueco llega al
> **51,57 % del ancho de la raya** leído del píxel, contra el **51,92 %** que BOTON-1 midió en la
> referencia y el **51,95 %** que el invariante deriva de los números de la hoja.

---

## 1 · QUÉ SE CONSTRUYÓ, Y DÓNDE

| archivo | qué cambió | ¿pesa? |
|---|---|---|
| `src/app/v3/_estilos/cta.css` | **el gesto entero**: la transición del intercambio se mudó a la regla de estado, y el subrayado pasó de una capa a dos con orígenes opuestos | es CSS: **no entra en el techo de `/v3`**, que mide sólo los `<script src>` de la ruta |
| `src/app/v3/_componentes/chrome/Cta.tsx` | **sólo comentarios** — 41 líneas agregadas y 9 sacadas, todas adentro de un bloque de comentario | **0 bytes**: el JSX no se movió, así que el código emitido es idéntico |
| `src/app/v3/_lib/cta.ts` | los tres números del subrayado, con su procedencia corregida | no viaja al cliente |
| `src/app/v3/_lib/__tests__/s3-registro-de-tokens.ts` | el padrón de propiedades de componente | instrumento |
| `src/app/v3/_lib/__tests__/s3-cta.invariant.tsx` | **dos secciones nuevas**, §6 y §7 | instrumento |

**El gesto costó cero bytes de JavaScript, y no es casualidad: es por lo que las dos capas son
pseudo-elementos.** `Cta.tsx` viaja adentro de `Hero` y `Cierre`, que son componentes de
cliente, así que dos `<span>` más habrían costado marcado en las dos secciones. El `<span
data-parte="subrayado">` que ya existía pasó a ser el contenedor posicionado y las dos capas son
su `::before` y su `::after`. **El marcado servido no cambió en un solo carácter.**

Precio declarado: un pseudo-elemento **no se puede congelar para fotografiarlo**
(`BOTON-1.md` §0.3). Por eso las capturas de este reporte salen **por reloj y no congeladas**, y
cada una publica el corchete del instante en que cayó el cuadro.

---

## 2 · EL RÓTULO QUE SE QUEDA — la transición se mudó de regla

### 2.1 · Qué se cambió

La transición del intercambio estaba declarada en la regla BASE de las dos copias. Pasó a la
regla de ESTADO, en un bloque propio que las nombra a las dos juntas —el tiempo es el mismo para
las dos; lo que difiere son los valores de destino, que siguen en sus dos reglas—.

Al entrar, la regla de estado aporta la duración y el intercambio se anima en 1,3 s. Al salir, la
regla deja de aplicar, `transition-duration` vuelve a su valor inicial (`0s`), y el navegador
**cancela la transición en curso y repone el reposo en un cuadro**. Es el mismo mecanismo que la
referencia, por el mismo camino: ella lo declara (`transition: all 0s` en reposo), acá
simplemente no se declara, que es el mismo `0s`.

### 2.2 · La medición, antes y después

Mismo banco, mismo protocolo, mismo árbol, con el `cta.css` de HEAD restaurado por
`git show` para el «antes» y devuelto después con su sha256 verificado (§7).

| al soltar, las dos copias | ANTES | DESPUÉS | la referencia |
|---|---|---|---|
| **hero** · `transform` | 98 muestras, +28,0 → **+1.320,7 ms** | **1 muestra, a +2,2 ms** ⚡ | 1 muestra, a +4,4 ms |
| **hero** · `opacity` | 98 muestras, +28,0 → +1.320,7 ms | **1 muestra, a +2,2 ms** ⚡ | 1 muestra, a +4,4 ms |
| **Cierre** · `transform` | 98 muestras, +27,3 → +1.320,7 ms | **1 muestra, a +2,4 ms** ⚡ | 1 muestra, a +4,4 ms |
| **Cierre** · `opacity` | 98 muestras, +27,3 → +1.320,7 ms | **1 muestra, a +2,4 ms** ⚡ | 1 muestra, a +4,4 ms |

Muestreado a 13,3 ms de intervalo (p50) sobre 994–997 cuadros por botón, con los tiempos
anclados al `mouseleave` **que despachó la página**.

**Y el estado sigue volviendo entero:** de las 63 propiedades leídas en cada nodo del subárbol,
**cero difieren** entre el reposo y el después-de-salir, en los dos ejemplares, antes y después.
Lo que cambió es cuánto tarda, no a dónde llega.

⚠️ **La ventana NO se tocó, y es deliberado.** Su transición se queda en la regla base porque
BOTON-1 §1.2 midió que en la referencia la ventana **sí** vuelve animada: 15 muestras de sus
300 ms, contra la única muestra de las copias. Lo que salta es el rótulo, no la caja. El
invariante afirma las dos mitades.

---

## 3 · EL SUBRAYADO QUE SE PARTE — dos capas con orígenes opuestos

### 3.1 · El mecanismo, en cuatro líneas

| capa | `transform-origin` | reposo | hover | tiempo |
|---|---|---|---|---|
| **la que se va** (`::before`) | **borde derecho** | `scaleX(1)` — la raya entera | `scaleX(0)` | 700 ms · desfase 0 |
| **la que llega** (`::after`) | **borde izquierdo** | `scaleX(0)` — plegada | `scaleX(1)` | 700 ms · **desfase 100 ms** |

Las dos sobre `--ease-principal` (`cubic-bezier(0.77, 0, 0.175, 1)`), que es la curva que
BOTON-1 midió en el subrayado de la referencia.

**El hueco ES el desfase, hecho visible.** Las dos capas recorren la misma curva; la que llega va
100 ms atrás de la que se va, así que en cada instante el hueco es esa curva evaluada con 100 ms
de diferencia. De ahí salen las tres cosas que el dueño describió: **abre** pegado al borde
izquierdo, **viaja** hacia la derecha, y **se une** contra el borde derecho a los 800 ms.

⚠️ **Al SALIR no hay hueco, y también es por dónde vive el desfase.** Los 100 ms están en la
regla de estado, así que a la vuelta las dos capas se invierten con el mismo tiempo y la misma
curva: los tramos que pintan son complementarios en todo instante y **la raya queda entera todo
el camino**. Es lo que BOTON-1 §2.5 midió en la referencia (a +324 ms, 0,262 + 0,7377 = 0,9997).

### 3.2 · Los tres números, y de dónde salen ahora

| | antes | ahora | por qué |
|---|---|---|---|
| duración | 600 ms (`2 × --duracion-rapida`) | **700 ms** (`--duracion-muy-lenta`) | BOTON-1 §2.3 lo midió por capa, con desvío máximo **0,0251** contra la curva declarada sobre 35 muestras. Cae **exacto** sobre un token: no hay cuenta que hacer |
| curva | `--ease-salida` | **`--ease-principal`** | es la curva declarada del subrayado de la referencia, verificada contra la serie |
| el tercero | retardo de 400 ms (`--duracion-media`) | **desfase de 100 ms** (`--duracion-media − --duracion-rapida`) | deja de ser una espera antes del gesto y pasa a ser la distancia entre las dos capas. 400 − 300 = 100 exactos, compuesto de dos duraciones del sistema |

> 🔴 **Los 600 y los 400 no eran una mala transferencia: eran una transferencia correcta de una
> fila mal atribuida.** `COMPONENTS.md` §3.2 llamaba «CTA · subrayado» a lo que BOTON-1 §2.1
> demostró que es **el envoltorio de la imagen del brillo** —120 × 3 px, `scale(0)` → `scale(1)`,
> `translate(−30,0)`, 600 ms con 400 de retardo—: las cuatro cifras de esa fila corresponden una
> por una a ese otro nodo. Queda anotado en `cta.css` y en `_lib/cta.ts`, en los dos sitios donde
> alguien podría volver a leerlos.

⚠️ **El cuarto número con la misma procedencia rota NO se cambió, y se declara:** el alto de la
raya. La de la referencia mide **1 px** (`BOTON-1.md` §2.1) y los nuestros 3 salían de esa misma
fila. Se dejan en 3 por dos razones escritas en la hoja: ya son parte de la composición aprobada
del hero —COMPO-1, COMPO-2, PAPEL-2 y ROCE-1 corrieron con ellos— y **1 px de tinta sobre papel
es una decisión de peso visual que nadie midió para nuestra paleta**. No está en la tabla de
transferibles de BOTON-1 §5 y no se toca sin una medición propia.

### 3.3 · El hueco, medido tres veces por tres caminos

| | ancho máximo del hueco, en % del ancho de la raya |
|---|---|
| **medido en la referencia** (serie por cuadro, `BOTON-1.md` §2.4) | **51,92 %** |
| **derivado de nuestros números** (`s3-cta.invariant` §7, sobre la curva del sistema) | **51,95 %**, a los 384 ms |
| **leído del píxel en nuestro hero** (`scripts-boton/d-hueco.ts`) | **51,57 %** |

El cuadro del píxel cayó en el corchete **[319,9 · 586,1] ms** del hover y muestra la raya
partida en `0 – 19,5 %` y `71,1 – 100 %`. *(El fragmento de 0,6 px al 59 % es una partícula de la
escena cruzando la fila, no la raya.)*

Y el recorrido completo, derivado de la serie por cuadro de nuestro propio hero:

| t desde el `mouseenter` | lo que se pinta | ancho del hueco | **centro del hueco** |
|---|---|---|---|
| 0 ms | 0 – 100 | 0 | — |
| 120 ms | 2,1 – 100 | 2,1 % | **1,1 %** |
| 240 ms | 0 – 3,1 + 12,8 – 100 | 9,7 % | **7,9 %** |
| 360 ms | 0 – 16,6 + 65,2 – 100 | **48,6 %** | **40,9 %** |
| 420 ms | 0 – 35,5 + 82,6 – 100 | 47,0 % | **59,0 %** |
| 480 ms | 0 – 73,6 + 92,1 – 100 | 18,6 % | **82,8 %** |
| 600 ms | 0 – 93,9 + 98,8 – 100 | 4,9 % | **96,4 %** |
| 700 ms | 0 – 98,6 | 1,4 % | **99,3 %** |
| 800 ms | 0 – 100 | 0 | — |

El centro **sólo avanza**, del 1,1 % al 99,3 %. El invariante lo afirma sobre 801 muestras: si
alguien invirtiera un origen o moviera el desfase, el hueco dejaría de viajar y el instrumento lo
diría.

### 3.4 · Lo que la serie observó, contra lo declarado

| | declarado | observado al entrar |
|---|---|---|
| hero · la que se va | 700 ms + 0 · `ease.principal` | +12,8 → **+704,4 ms** |
| hero · la que llega | 700 ms + 100 · `ease.principal` | +104,4 → **+797,5 ms** |
| Cierre · la que se va | 700 ms + 0 · `ease.principal` | +26,3 → **+719,8 ms** |
| Cierre · la que llega | 700 ms + 100 · `ease.principal` | +119,7 → **+812,9 ms** |
| *(la referencia, para comparar)* | *700 + 0 · 700 + 100* | *+4,5 → +738,2 · +140,1 → +829,9* |

---

## 4 · 🔴 LA CONSECUENCIA DE COMPOSICIÓN QUE HAY QUE MIRAR

**El CTA del Cierre ahora muestra la raya en reposo. Antes no.**

El gesto que el dueño pidió —que la raya *se parta*— **exige que la raya exista antes de
partirse**. Con una sola capa que crece desde cero no hay hueco posible: sólo hay una raya que
crece, que es lo que había. Así que la raya en reposo dejó de ser una propiedad del registro
`rotulo` y pasó a ser del componente.

Los tres motivos, en orden de fuerza:

1. **El gesto lo exige.** No hay forma de partir lo que no está.
2. **Es lo que hace la referencia**, en sus 26 ejemplares y sin bifurcar por registro: raya
   entera en reposo, 182 de 182 px medidos en `BOTON-1.md` §2.1.
3. **El registro `cuerpo` se define a sí mismo como «el medido»**, y lo medido tiene la raya
   puesta. Ponérsela lo acerca a su propia definición, no lo aleja.

Lo que el registro `rotulo` conserva: mayúsculas y `--tracking-micro`. Lo que pierde: la
excepción que apagaba el subrayado, que se quedó sin motivo. **Los dos ejemplares hacen hoy
exactamente el mismo gesto**, que es la otra mitad de la simplificación.

| el CTA del Cierre en reposo | ANTES | DESPUÉS |
|---|---|---|
| raya bajo el rótulo, leída del píxel | **no hay** (el detector no encuentra raya en la banda) | **99,15 % del ancho, cubierto** |
| captura | `capturas/boton/cierre-1-reposo.png` | `capturas/boton2/cierre-1-reposo.png` |

> **Si el dueño prefiere el Cierre como estaba, es UNA regla** y está escrita al pie de
> `cta.css`:
> `[data-registro="cuerpo"] [data-parte="subrayado"]::before { transform: scaleX(0) }`.
> Con ella el Cierre vuelve a la raya que crece sin hueco, el hero conserva el gesto nuevo, y el
> registro vuelve a bifurcar la coreografía.

---

## 5 · EL INSTRUMENTO, QUE TAMBIÉN SE MOVIÓ

### 5.1 · Dos secciones nuevas en `s3-cta.invariant.tsx` (58 afirmaciones, 0 fallas)

**§6 — la transición vive en el estado.** No se puede afirmar leyendo un valor: hay que saber en
qué REGLA está escrito. El invariante parsea la hoja y separa lo que aplica en reposo de lo que
aplica sólo en estado. Afirma que las copias **no** declaran `transition-property`,
`transition-duration` ni `transition-timing-function` en reposo, que **sí** las declaran en el
estado, y —la otra mitad— que la ventana las conserva en la base. Con su control positivo: el
separador de reglas tiene que distinguir un selector de estado de uno de reposo.

⚠️ El corte por coma no sirve para partir estos selectores: el de estado lleva `:is(a, b)` y
partirlo por todas las comas rompe el grupo. Se parte por comas de **nivel cero**.

**§7 — las dos capas y el hueco.** Afirma los dos orígenes opuestos, los cuatro valores de
`scaleX`, la curva, y que el desfase está **sólo** en la capa que llega y **sólo** en el estado.
Y después deriva el hueco de esos números y lo compara contra el máximo medido en la referencia.
Con su control positivo: **con las dos capas apoyadas en el mismo borde no hay hueco que medir** —
si alguien alineara los orígenes, el derivador tiene que devolver cero y no un número parecido.

La curva se lee del token (`--ease-principal`) y no se escribe: si alguien la mueve, el hueco
deja de dar 51,95 % y el invariante lo dice.

Reusa `cubicBezierEase` de `_lib/escena/bezier.ts` en vez de escribir un segundo evaluador. Es la
regla del repo: dos instrumentos iguales con dos nombres son la forma de que un día midan
distinto.

### 5.2 · El banco de BOTON-1, extendido con dos cosas

**`sinCongelar`** en la descripción de un botón. Desde que nuestro subrayado es un
pseudo-elemento, la captura «a mitad del hover» **no puede** salir congelada: `BOTON-1.md` §0.3
midió que el congelado no pinta el `transform` pausado de un pseudo. Sale por reloj, y cada
captura publica su corchete.

**`LATENCIA_DEL_CUADRO_MS = 70`**, y no es un número elegido: se calibró con el propio gesto, que
es un reloj de 700 ms con posiciones conocidas. Se capturó con el pedido lanzado a los 134,9 y a
los 400,5 ms del hover, se midió **sobre el píxel** qué tramo de la raya estaba pintado, y se
invirtió contra la tabla del hueco: las dos dieron **el pedido + ~45 ms** (un hueco de 0,6–6,3 %
implica t ≈ 180; uno de 61,4–88,9 % implica t ≈ 455). Sumadas las dos lecturas previas, la espera
se adelanta 70. Verificado después: pidiendo para los 384 ms, el cuadro salió con el hueco en su
**máximo**.

**`d-hueco.ts`**, nuevo: lee el hueco del píxel. Existe porque el detector de `c-tabla.ts` busca
la corrida contigua más larga de todo el recorte —correcto contra la sala oscura de la
referencia— y contra papel pierde: la celosía del Cierre tiene filas de 56 px de corrida y le
gana al subrayado **justo en los cuadros donde está partido**. Éste acota por dos condiciones que
un fondo no cumple: el rango de x **sale del DOM** (la caja del nodo de la raya en hover pleno) y
la fila tiene que tener **a lo sumo tres corridas** —la raya entera es una, la partida son dos,
un renglón de texto son doce—.

---

## 6 · LAS CAPTURAS

`docs/rediseno/capturas/boton2/`, 1440×900, dpr 1, recorte único por botón, puntero movido de
verdad por `Input.dispatchMouseEvent`. El «antes» equivalente está en `capturas/boton/`, sacado
con el MISMO banco sobre el `cta.css` de HEAD.

| estado | hero | Cierre |
|---|---|---|
| reposo | `hero-1-reposo.png` | `cierre-1-reposo.png` |
| **el hueco en su máximo** (cuadro en [319,9 · 586,1] ms) | `hero-2b-hueco-maximo.png` | `cierre-2b-hueco-maximo.png` |
| a mitad del hover (cuadro en [602,4 · 864,0] ms) | `hero-2-mitad.png` | `cierre-2-mitad.png` |
| hover pleno | `hero-3-hover-pleno.png` | `cierre-3-hover-pleno.png` |
| después de salir | `hero-4-despues-de-salir.png` | `cierre-4-despues-de-salir.png` |

**Van DOS capturas de hover y no una, por una razón medida:** los 650 ms de «la mitad del hover»
son la mitad del INTERCAMBIO (1.300 ms), y a esa altura **el subrayado ya se volvió a unir** —el
píxel lo confirma: 97,5 % cubierto, 0 % de hueco—. El hueco vive entre los 100 y los 800 ms y su
máximo cae a los **384**. Una sola captura no muestra los dos gestos.

*(Por eso `hero-2-mitad.png` muestra el rótulo a mitad del intercambio con la raya entera: no es
un error, es el instante que la instrucción nombra.)*

---

## 7 · VERIFICACIÓN DE CIERRE

```
npm run verificar            → 30 pasos, 0 con falla, 19 deudas declaradas
npm run test:frontera        → 2 invariantes, 0 con falla (12 fuera de ventana, preexistentes)
npx tsc --noEmit             → 0 errores
npx eslint (los 5 + el banco)→ limpio
MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build → OK
npm run test:s5-peso         → 45 afirmaciones, 0 fallas · 59,909 KiB contra el techo de 60
```

⚠️ **Dos cosas del build que hay que saber para repetirlo.** `npm run build` a secas **falla a
propósito**: el guardián de `prebuild` frena todo build de producción mientras
`CONTENIDO_INVENTADO` esté prendida, y la salida es `MEDIR_CON_LA_LLAVE_PRENDIDA=1`. Y en esta
máquina el build **se quedó sin memoria** con el heap por defecto (`FATAL ERROR: Ineffective
mark-compacts near heap limit`): hay que darle `NODE_OPTIONS=--max-old-space-size=8192`.
`netlify.toml` ya fija 4096 para el CI, así que esto es local.

### El «antes» se volvió a medir, y por qué

Al re-correr el banco pisé los JSON de BOTON-1 con los datos del «después». La reparación fue
medir el «antes» **de verdad**: `cta.css` restaurado desde HEAD con `git show`, banco corrido
entero, y mi versión devuelta con **sha256 verificado a los dos lados**
(`d39541d27f836e95961ea24a6a5ee90b2c841974915bc8110604da9fc8aa4a33`). De ahí salen todas las
columnas «ANTES» de este reporte, que ahora son medidas y no afirmadas.

🟡 **Lo que NO se pudo reparar, declarado:** la serie por cuadro CRUDA de la referencia y su
sección de `tablas.json` se perdieron en el mismo pisón, y regenerarlas costaría una segunda
navegación a `nk.studio`, que la regla del proyecto prohíbe. **Lo que sobrevive es todo lo que el
reporte cita**: `BOTON-1.md` con sus tablas completas, `outputs/boton/referencia-resumen.json` y
las siete capturas `capturas/boton/nk-*.png`. Lo que falta es material de re-análisis, no
evidencia de ninguna afirmación publicada.

### El árbol

```
 M src/app/v3/_componentes/chrome/Cta.tsx          (sólo comentarios)
 M src/app/v3/_estilos/cta.css                     (el gesto)
 M src/app/v3/_lib/cta.ts                          (los tres números)
 M src/app/v3/_lib/__tests__/s3-registro-de-tokens.ts
 M src/app/v3/_lib/__tests__/s3-cta.invariant.tsx
?? docs/rediseno/outputs/BOTON-1.md · outputs/boton · outputs/boton2
?? docs/rediseno/capturas/boton · capturas/boton2
?? scripts-boton/
```

Intocables sin un byte de diferencia: `HeroArtifact.tsx`, `TransitionContext.tsx`,
`PreloaderContext.tsx`, `prisma/schema.prisma`. `useDeslizamientoDelCta.ts` y
`deslizamiento.css` **no existen en este worktree** —corren en `C:\deslizar`— así que no se
pudieron tocar ni por accidente. No se agregó ningún invariante de composición. Cero color, cero
brillo, cero degradado: la única propiedad de pintura que las dos capas declaran es
`background-color: var(--color-tinta)`.

---

## 8 · LO QUE QUEDA ABIERTO

1. **🔴 La raya del Cierre en reposo** (§4). Es la única decisión de composición que este bloque
   toma, es la que el gesto exige, y se revierte con una regla escrita al pie de `cta.css`.
   **La mira el humano en las dos capturas.**
2. **🟡 El alto de 3 px** (§3.2). Cuarto número con la procedencia rota; la referencia usa 1 px.
   No se tocó, y no se debería tocar sin medir 1 px de tinta sobre papel.
3. **🟡 La tira de cuadros de nuestro subrayado.** Desde que es pseudo-elemento no se puede
   congelar. El camino, si hace falta, es `Page.startScreencast` —que `BOTON-1.md` §0.2 verificó
   que no apaga el `:hover`— y no el congelado.
4. **🟡 `prefers-reduced-motion`.** El bloque global de `globals.css` fuerza
   `transition-duration: 1ms !important` sobre `*`, `*::before` y `*::after`, así que el gesto
   nuevo queda instantáneo en los dos sentidos y **el hueco no llega a verse**. Es el
   comportamiento correcto y no hizo falta tocar nada; queda anotado porque nadie lo había
   verificado sobre pseudo-elementos.

---

*Construido el 17 de septiembre de 2026 sobre `rediseno/home`, medido a 1440×900 con el banco de
BOTON-1. El «antes» y el «después» salen del mismo banco, la misma máquina y el mismo árbol.*
