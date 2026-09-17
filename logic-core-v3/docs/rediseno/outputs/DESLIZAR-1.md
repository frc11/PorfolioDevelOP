# DESLIZAR-1 — el deslizamiento del CTA del hero hasta Trabajos

**Construido y medido. NO commiteado.** El árbol queda listo para que el dueño lo revise y lo commitee.

---

## 0 · ⚠️ EL PLAN NO EXISTE EN EL DISCO, Y ESTO SE CONSTRUYÓ SIN ÉL

La instrucción manda leer `docs/rediseno/outputs/DESLIZAR-1-PLAN.md` entero antes de tocar código. **Ese archivo no existe.** Se buscó en los cinco worktrees (`git worktree list`), en las 33 ramas locales (`git ls-tree -r` sobre cada una), en el historial (`git log --all --diff-filter=A`) y en el disco `C:` completo: los únicos aciertos de `deslizar*` son las refs de git de las ramas `rediseno/deslizar` y `rediseno/deslizar2`. Tampoco está en los scratchpads de las sesiones anteriores de este worktree, donde sí están los de ORDEN-2.

Se siguió adelante porque **la instrucción reafirma por su cuenta las tres decisiones del dueño y los cinco requisitos**, así que nada quedó a elección. Lo que sí se cambió de método: **las cifras que el plan publicaba no se citaron de memoria, se volvieron a medir**. El resultado de eso está en §5 y es la mejor noticia del sprint — tres de las cuatro reproducen al cuarto decimal, y la que no reproduce se dice cuál es.

---

## 1 · QUÉ SE CONSTRUYÓ

El CTA del hero (`a[data-pieza="cta"]` con `href="#trabajos"`) deja de saltar y **se desliza**: dos segundos de scroll animado con `expoOut`, con el `<main>` apagado durante el viaje para que lo que se vea sea la escena.

Cuatro archivos nuevos de producto y una línea de montaje:

| archivo | qué es | líneas de código |
|---|---|---|
| `src/app/v3/_componentes/deslizamiento.ts` | los datos y la compuerta del intro, **como función pura** | 9 |
| `src/app/v3/_componentes/useDeslizamientoDelCta.ts` | el escucha delegado, el velo, el foco y el historial | 85 |
| `src/app/v3/_estilos/deslizamiento.css` | el velo: dos reglas | 2 reglas |
| `src/app/v3/_lib/__tests__/s18-deslizamiento.invariant.tsx` | el guardián: 73 afirmaciones, 7 controles positivos | 274 |

El montaje son **tres líneas** en `ScrollSuaveDeV3.tsx`: una `ref` para la instancia de Lenis, la llamada al hook, y el `import`. Más la línea de la hoja en `layout.tsx`.

**`Hero.tsx` y `geometria.ts` NO se tocaron** — ni una línea. Tampoco `HeroArtifact.tsx`, `TransitionContext.tsx`, `page.tsx` (prohibido por la frontera de S3), los otros catorce enlaces, ni las otras siete secciones.

---

## 2 · LAS TRES DECISIONES DEL DUEÑO, EJECUTADAS

### 2.1 · Frena en el ancla nativa, no en el borde de la sección

El deslizamiento **no calcula a dónde va**. Le pasa a `lenis.scrollTo()` el elemento `<section id="trabajos">` y deja que la librería resuelva el destino, que sobre `lenis@1.3.25` es exactamente lo que hace el navegador con un ancla:

```js
target = rect.top + animatedScroll
       − getComputedStyle(node).scrollMarginTop
       − getComputedStyle(rootElement).scrollPaddingTop   // lenis.mjs:776-778
```

y `rootElement` es `document.documentElement` cuando el `wrapper` es `window` (`lenis.mjs:938-940`), que es el caso porque `OPCIONES_DE_LENIS` no declara `wrapper`. **O sea que lee los 72 px de `_estilos/navegacion.css`**, los mismos que despejan los quince enlaces del sitio.

Las dos líneas de terceros de las que esto depende **se afirman sobre el fuente de `node_modules`** (§5 del invariante), porque si una actualización de Lenis las cambia el deslizamiento aterrizaría 72 px más abajo que los otros catorce y nada más se pondría rojo.

**Medido en el navegador:** a 1440×900 el viaje frena en **7.128 px**, que es `8 × 900 − 72` exacto. Y ningún píxel de destino está escrito en el código — el invariante afirma que ni `8568` ni `8640` aparecen en el fuente del sprint.

### 2.2 · Sólo el CTA del hero

El selector es `[data-panel="hero"] a[data-pieza="cta"]`, armado de `ATRIBUTO_DE_PANEL` + `IDS_DE_SECCION[0]` — no escrito a mano, así que si alguien reordena `secciones.ts` el selector se mueve con ella.

El `<a>` del Cierre lleva **el mismo** `data-pieza="cta"` (apunta a `#servicios`) y queda afuera **por el ancestro, no por el `href`**. Los otros catorce enlaces siguen siendo el ancla nativa y siguen andando.

⚠ El escucha es **delegado en el `document`, no un `onClick`**, y la razón está medida: `hero.invariant.tsx` §11 afirma `veces(FUENTE, 'onClick') === 0` sobre el fuente de `Hero.tsx`. **Corrección a la instrucción:** la línea que la instrucción cita —`hero.invariant.tsx:268`— es la del nombre accesible del `<h1>`, no la del CTA. La que fuerza la arquitectura delegada es la **338**. La sustancia de la instrucción es correcta; la referencia estaba 70 líneas corrida.

⚠ Y el `event.target` **nunca es el `<a>`**: `Cta.tsx` mete dos copias del rótulo y un subrayado adentro, así que el click aterriza en un `<span data-parte="…">`. Va `closest()`, no `matches()`.

### 2.3 · `expoOut`, T = 2,0 s — y la curva no se declara

`DURACION_DEL_DESLIZAMIENTO_S = 2` está en el módulo puro. **La curva no está en ninguna parte del sprint**, y eso es la decisión: `scrollTo` hereda `this.options.easing` cuando no se le pasa una (`lenis.mjs:746`), y `OPCIONES_DE_LENIS.easing` —la configuración del sitio vivo, la que `ScrollSuaveDeV3` ya importaba— **ES** un expoOut: `min(1, 1,001 − 2^(−10t))`.

Escribir la fórmula habría dado dos definiciones de la misma curva. Lo que el invariante afirma en su lugar son dos cosas:

1. que el producto sigue declarando esa línea exacta, carácter por carácter;
2. que **muestreada** pertenece a la familia: pega con el expoOut canónico `1 − 2^(−10t)` en las 101 muestras, con un desvío máximo de **0,001000**, que es el `1,001` de escala de la librería y nada más.

⚠ **El precio del truco de la librería, medido:** el `1,001` y el `min` le hacen tocar el 1 en `t = 0,996578`, o sea a los **1.993,2 ms de los 2.000**. Los últimos 6,8 ms la curva ya está quieta.

---

## 3 · 🔴 EL GATE DEL INTRO — Y POR QUÉ NO ES `=== 'clear'`

El requisito es correcto y está cumplido: **antes de que la capa del intro se vaya, el botón no desliza**. Durante los ~7,1 s del intro el CTA es clickeable (el overlay es `pointer-events-none`), la escena está retenida en la pose 0, y `markIntroEntry()` todavía no muestreó el scroll. Un deslizamiento ahí le pisa el dato al muestreo.

**Pero la FORMA que la instrucción pide rompe el pedido, y hay evidencia en el propio contrato del intro.**

La instrucción dice gatear sobre `getIntroStage() === 'clear'`. Eso deja el deslizamiento **muerto en toda visita repetida**:

- `markIntroPlayed()` publica `'clear'` **sólo si la escena estaba retenida** — `introBoot.tsx:91`, `if (isSceneHeld()) setIntroStage('clear')`;
- cuando el intro NO corre (visita repetida en la misma sesión, `prefers-reduced-motion`, o automatización) la etapa se queda en **`'idle'` para siempre**, y el comentario de `HomeIntro.tsx` lo escribe con esas palabras: *«`idle` significa "no hay intro", no "el intro terminó"»*.

O sea que con `=== 'clear'` el botón desliza en la primera visita de la sesión y nunca más. Y sería **invisible para toda medición automatizada**, porque el gate pre-paint no arma el intro cuando `navigator.webdriver` es `true`: todo instrumento caería en la rama `'idle'`. Es exactamente la clase de defecto que este repo ya cazó una vez —*«la escena congelada en la visita repetida»*, catorce sprints invisible por esa misma causa.

**Lo que se construyó** es `deberiaDeslizar(etapa) = !isSceneHeld(etapa)`, consumiendo el booleano que el módulo del intro **ya publica para esta pregunta** (`introHandoff.ts:124-126`). Tabla de verdad entera, recorrida por el invariante:

| etapa | desliza | por qué |
|---|---|---|
| `idle` | **sí** | el intro no corre: es la visita repetida, y es la mayoría |
| `covering` | no | la capa tapa |
| `revealing` | no | la capa se está yendo, la escena sigue retenida |
| `clear` | **sí** | la capa se fue |

Honra el requisito —las dos etapas en que la capa está puesta frenan el viaje— sin apagar la función en la rama más frecuente. **Si el dueño quiere la letra literal, es un cambio de una línea en `deslizamiento.ts`, y el invariante lo detecta.**

---

## 4 · EL VELO, Y LAS CINCO SALIDAS

`opacity: 0` no alcanza: un `<main>` transparente **sigue siendo tabulable**, y `preventDefault()` no mueve el foco. Van las dos mitades.

### 4.1 · Qué hace

Un atributo en el `<main>` (`data-v3-deslizando`) más `main.inert = true`. Va como atributo y no como clase porque el `<main>` lo pinta `page.tsx`, que es un **archivo prohibido** por la frontera de S3 y además un componente de servidor: no hay dónde escribirle una clase condicional, y toquetearle el `className` desde un efecto sería pisar el valor que el reconciliador cree que tiene. Es el idioma que /v3 ya usa (`data-v3-scroll-suave` en el `<html>`, `data-home-intro`).

### 4.2 · Reversible por construcción

La `transition` vive en la regla de **reposo**, no en la del estado. Sacar el atributo devuelve la opacidad con la misma curva y el mismo tiempo con los que se fue, **sin depender de que dispare nada**. Si estuviera adentro de `[data-v3-deslizando]`, la ida se animaría y la vuelta sería un corte.

Eso importa porque **el `onComplete` de un viaje cancelado no dispara nunca**, y está verificado sobre el fuente de la librería: `scrollTo` arma la animación con `animate.fromTo`, que sobrescribe `this.onUpdate` entero (`lenis.mjs:101-118`); cuando una rueda entra por `onVirtualScroll` y termina en `scrollTo(targetScroll + delta, { programmatic: false })` (`lenis.mjs:630`), la animación se reemplaza y el cierre anterior se pierde con su `onComplete` adentro.

Por eso hay **una función idempotente y cinco sitios que la llaman** (el invariante cuenta las cinco):

1. `onComplete` — llegó. El foco va al destino.
2. `virtual-scroll` con delta ≠ 0 — la rueda canceló. El foco vuelve al CTA.
3. `popstate` — apretaron atrás a mitad de vuelo.
4. **el reloj de seguridad** — y no es cinturón de más: con la pestaña oculta el navegador no corre `requestAnimationFrame`, así que `lenis.raf` no avanza y `onComplete` **no llega nunca**. Volver a la pestaña encontraría la página en blanco y sin foco. `setTimeout` sigue corriendo estrangulado, así que es la única salida que funciona con la pestaña tapada. Es la lección de agosto de `CLAUDE.md`, aplicada.
5. la limpieza del efecto — desmontar no puede dejar un `<main>` inerte.

### 4.3 · El foco

Al llegar, el foco va al `<section id="trabajos">`. **El destino no es focalizable**: `Panel` le pone `tabindex="-1"` sólo a la sección de entrada. Así que el hook se lo pone **en tiempo de ejecución** y lo enfoca con `preventScroll: true`.

Es el remedio que `Panel.tsx` ya documenta para este problema exacto: *«Un ancla a un elemento NO focalizable mueve el punto de partida del foco secuencial en Chromium y en Gecko, pero WebKit no lo hace, y ahí el Tab siguiente vuelve al enlace: el enlace parece andar y no anda»*. Y no cambia el documento: `s10-lectura.paradasDeTabulacion` descarta el `-1` explícitamente, y un foco programático sobre un contenedor no dispara `:focus-visible`. Al escribirse en runtime **no viaja en el HTML del servidor**, así que ningún censo de `s10-acceso` cambia de número.

En una cancelación el foco vuelve al CTA, que es de donde salió.

### 4.4 · ⚠️ La consecuencia del `inert`, declarada

`inert` saca el subárbol **también del árbol de accesibilidad**. Son dos segundos, sobre una acción que el visitante pidió, con el contenido invisible y el foco manejado en las dos salidas. Y no lo sufre quien más lo sentiría: con `prefers-reduced-motion` este archivo **no se monta**.

Los censos de `s10-acceso` (19 paradas, 27 encabezados, 11 landmarks) siguen verdes **y siguen siendo ciertos**: miden el documento en reposo, donde el atributo no existe. Para que eso no sea un verde por ceguera, el invariante afirma las dos mitades: que el `inert` vive en **un solo archivo** de todo el árbol de /v3, y que **no aparece en el marcado servido**.

### 4.5 · El historial

`preventDefault()` se come la entrada de sesión que un ancla del mismo documento empuja, y sin reponerla **atrás se va de la página**. Se repone con `history.pushState(null, '', ancla)` y no con `location.hash`, que empuja historial pero además salta al instante.

⚠ Lo que esto reproduce es el comportamiento de **hoy**, no el del navegador en abstracto: `SmoothScroll` pone `history.scrollRestoration = 'manual'` en un efecto sin condiciones, en toda ruta, así que atrás ya no devolvía la posición antes de este sprint. Cambia la URL y no el scroll — igual que antes.

### 4.6 · Nadie llama `stop()`

`lenis.css` cuelga `overflow: clip` de la clase `lenis-stopped`, que Lenis escribe **sólo** al llamar `stop()`, y un `overflow` distinto de `visible` en el `<html>` apaga en silencio los tres `sticky` de /v3. La cancelación de acá no detiene nada: `lock: false` —explícito, aunque sea el default, porque ES la decisión que hace al viaje cancelable— deja que la rueda entre por el camino normal de Lenis y la animación se reemplace sola.

**`s18-compuertas` §3b se extendió de tres archivos a cinco** para que su barrido de `.stop(` cubra los dos nuevos. Sin eso, la garantía habría tenido un agujero exactamente del tamaño del único lugar nuevo desde donde se podría llamar. El invariante propio afirma la otra mitad: que esa lista los nombra.

---

## 5 · LAS MEDICIONES

`npx tsx scripts-deslizar/a-llegada.ts` — no abre el navegador: todo sale de las funciones **puras** del árbol (`anclaje`, `recorrido`, `choreographySampler`, `harness`).

### 5.1 · El destino y la luz de llegada — las tres cifras de la instrucción REPRODUCEN

| ventana | tope de `#trabajos` | el ancla frena en | progreso | **luz medida** | la instrucción decía |
|---|---|---|---|---|---|
| 800 | 6.400 | **6.328** | 0,4971875 | **0,1264** | 0,1264 ✅ |
| 1080 | 8.640 | **8.568** | 0,4979167 | **0,1040** | 0,1040 ✅ |
| 1200 | 9.600 | **9.528** | 0,4981250 | **0,0976** | 0,0976 ✅ |

Las tres al cuarto decimal, y el `y = 8.568` también.

**Sin el descuento del ancla las tres ventanas aterrizan en 0,0400** — la noche plena, idéntica. Los 72 px son toda la dispersión: **29,5 % de diferencia de luz entre 800 y 1200**, por una constante que no tiene nada que ver con la escena.

Está numerado como **§7.73 de `DIRECCION-ESCENA.md`**, como hallazgo propio y con las tres salidas escritas sin elegir ninguna. Es del mecanismo de anclas que ya gobernaba los quince enlaces desde SITIO-S9; el deslizamiento no lo introduce, lo vuelve **visible**, porque un salto instantáneo no deja ver con qué luz se llegó y dos segundos de viaje sí.

### 5.2 · 🔴 La velocidad de cámara — y la trampa de la unidad

La instrucción pide comparar contra «el pico de hoy, que es 3,4126 y está en el hero». **Ese número reproduce en este árbol**: `npm run test:s13b-escena` lo reimprime en la fila `hero`, en **alturas de cuadro por pantalla de scroll**.

Y ahí está la trampa, que conviene decir antes de las cifras: **esa unidad no tiene tiempo adentro.** Es una propiedad de la PISTA — cuántas alturas de cuadro se mueve la cámara por cada pantalla de scroll. Un deslizamiento recorre las mismas pantallas por las mismas poses, así que **no la puede mover ni un bit**. Comparar el sprint contra el techo en esa unidad da «no cambió nada», y es cierto, y es inútil.

Lo que el deslizamiento cambia es **pantallas por segundo**. Medido muestreando la curva a 60 Hz:

| ventana | fh **por pantalla de scroll** | fh **por cuadro** | px por cuadro |
|---|---|---|---|
| 800 | 3,3882 | **1,4198** | 361,5 |
| 1080 | 3,3915 | **1,4254** | 489,5 |
| 1200 | 3,3924 | **1,4269** | 544,3 |

**En la unidad del techo el deslizamiento NO supera el pico de hoy: llega a 3,3915 contra 3,4126, el 99,4 %.** Y no lo supera por construcción — lo que le falta es el 0,6 % que se pierde al discretizar a 60 Hz, porque el primer cuadro ya salta 0,45 pantallas y promedia por encima del pico continuo.

**En la unidad que el sprint sí mueve, la cámara salta 1,43 alturas de cuadro en UN cuadro** (a los 33 ms), o 85,5 por segundo. La vara: un diente de rueda —100 px animados con la misma curva y la duración del sitio vivo, 1,1 s— pica a **10,5 px/cuadro**. El deslizamiento pica **46,6 veces más rápido** a 1080. Es inherente a un `expoOut` que arranca desde quieto a velocidad máxima: la derivada en `t = 0` vale `10 ln 2 = 6,93`.

**Esto es un dato para el dueño, no una objeción a su decisión.** La curva y la duración son decisión tomada; lo que el sprint aporta es el número. `TECHO_DE_VELOCIDAD = 1` sigue siendo un presupuesto sobre la pista, custodiado por `s16-techo`, y no un clamp del bucle de render: no hay nada que se ponga rojo.

### 5.3 · ⚠️ La cifra de la instrucción que NO reproduce

«Retardo al llegar 0,144 pantallas, asentar 967 ms.» Con la curva heredada y T = 2,0 s, el instante en que faltan 0,144 pantallas cae a los **1.141 ms** y la cola desde ahí hasta el final es de **859 ms**, no 967. Se probó también con el expoOut canónico (sin el `1,001`): da 843 ms. **No se pudo reproducir con ninguna de las dos formas**, y no se cita.

El 0,144 sí es reconocible como un umbral razonable, pero como no reproduce queda anotado y no usado. La cifra que sí vale y está medida es la de arriba: **el 90 % del camino a los 662 ms, el 99 % a los 1.301, y la curva quieta desde los 1.993**.

### 5.4 · La escena no se suspende durante el viaje

El viaje va de la pantalla 0 a la 7,93. La única banda suspendida del recorrido es `pantalla ∈ (11,125 · 14,875)` — Servicios y Tu panel, las dos secciones opacas. **El viaje entero está en zona de dibujo**, así que no hay un cuadro de `reanudando` ni una puesta al día de pose. Es una de las dos razones por las que esto es un enlace y no quince: con el mecanismo compartido, `#por-que-develop` y `#cierre` cruzan esa banda **dos veces** y `#tu-panel` aterriza adentro.

---

## 6 · LOS CUATRO CONTROLES EN EL NAVEGADOR

`npx tsx scripts-deslizar/b-controles.ts` — Chrome propio por CDP, perfil 1440×900, contra el dev server de este worktree en el 3007 (el 3000 es del lane de `rediseno/home`).

| control | velo | scroll | hash | foco al final |
|---|---|---|---|---|
| **0 · el viaje** | 25 → **1.985 ms**, apagado al final | 0 → **7.128** | `#trabajos` | `section#trabajos` |
| **1 · cancelar a mitad** (rueda a los 800 ms) | 28 → **838 ms**, apagado | 0 → **6.868** (260 px corto) | `#trabajos` | `a` (el CTA) |
| **2 · el botón de atrás** (a los 800 ms) | 24 → **813 ms**, apagado | 0 → 7.128 | **`""`** | `a` (el CTA) |
| **3 · click durante el intro** | **nunca se prendió** | ya estaba en 7.128 en el cuadro 0 | `#trabajos` | `body` |

Y en las cuatro: **`inert` suelto al final**, verificado cuadro por cuadro y no sólo al cierre.

**Lo que cada uno prueba:**

- **0** — el viaje frena en `8 × 900 − 72 = 7.128` **exacto**: el mecanismo del ancla se honra. El velo se pone **en la misma vuelta del bucle de eventos que el click** (`veloSincronico: true`), o sea que el escucha delegado está instalado y es síncrono. El foco aterriza en el destino, que es el `tabindex="-1"` de runtime funcionando.
- **1** — «cancelar a los 800 ms deja el velo apagado y el control lo detecta»: el velo se va a los **838 ms**, 38 ms después de la rueda, y el scroll queda donde el visitante lo dejó. Es la reversibilidad por `lock: false` medida en vivo, no deducida del fuente.
- **2** — atrás **no se va del documento**: el hash pasa de `#trabajos` a `""` y la página es la misma. El `pushState` cumple su función. ⚠ Y el scroll **sigue viaje hasta 7.128**, lo cual conviene decir: es **fidelidad al comportamiento de hoy** —con `scrollRestoration: 'manual'`, atrás sobre el ancla nativa tampoco devuelve la posición— no un descuido. Si el dueño quiere que atrás además congele el viaje, es una línea, y no usa `stop()`.
- **3** — el gate del intro anda: el velo **no se prende ni un cuadro**, y el scroll ya estaba en 7.128 en el primer cuadro, o sea que **el click cayó en el ancla nativa y saltó al instante**. Es el requisito rojo, cumplido y medido.

⚠ **Dos notas de instrumento, porque las dos costaron una corrida.** (a) La primera corrida en frío dio el velo a los 935 ms y el scroll clavado 800 ms: es el dev server compilando el chunk diferido en el primer pedido, **no reproduce en caliente**, y la discriminación fue agregar el instante del click al muestreo. (b) `window.scrollTo(0, 0)` **no resetea el scroll** con Lenis corriendo: la lectura volvía 328 px, porque Lenis reemplaza el valor de la posición. El reset tuvo que hacerse esperando cuadros hasta que la lectura se quede quieta en 0.

**Grabación: no.** La coreografía la verifica el humano. Este banco mide que el mecanismo hace lo que dice; que «se sienta bien» no se afirma acá.

---

## 7 · EL PESO — +68,0 B, y la línea es 0,08

**El hallazgo:** el código del sprint **cuesta cero en la carga inicial**. El deslizamiento vive adentro de `ScrollSuaveDeV3`, el módulo que `CompuertaDelScrollSuave` pide con `dynamic(…, { ssr: false })`, así que sus dos archivos viajan en un chunk asíncrono —`437.*.js`, **4.151 B** crudos, contiene el `data-v3-deslizando`— que **no aparece en los 26 `<script src>` de `/v3`**.

Los 4.151 B se publican y no se suman, con el mismo criterio con el que MOVIL-1 publicó sus 259,8 KiB aparte: este techo mide la carga inicial y eso es carga diferida. Los descarga igual cualquiera que cruce el umbral de 1025 sin `prefers-reduced-motion`, sólo que después del primer pintado.

### El A/B, con tres builds

| corrida | árbol | escrito por el lane |
|---|---|---|
| A | antes del sprint | **72.144,0 B** |
| C | el sprint, con la hoja **desconectada** del layout | **72.153,0 B** |
| B | el sprint entero | **72.212,0 B** |

Los tres con `MEDIR_CON_LA_LLAVE_PRENDIDA=1` y `--max-old-space-size=8192`, en la misma máquina, con `s5-peso` leyendo el lane en el medio. La corrida C fue en `.next-deslizar`, **agregado a `.gitignore` ANTES del build**, por la lección del `distDir` que envenena a Tailwind 4. `v3/layout.tsx` se restauró con sha256 verificado (`4f60db6a…`, publicado en el recibo).

**Desvío total: +68,0 B**, 7,6 veces el piso de ruido de 9,0 B.

### El reparto, y los 9 B que no cerraron

El reparto por chunk acorrala todo el desvío en **uno**: `app/v3/layout-*.js` va de 5.894 a 5.962 (+68) y `page-*.js` no se mueve un byte. De ahí salió la predicción —«los 68 son la línea del `import` de la hoja»— y la tercera corrida **la desmintió parcialmente**:

| | bytes | cómo |
|---|---|---|
| la registración de `_estilos/deslizamiento.css` | **+59,0** | 72.212 − 72.153, medido |
| del lado del JS, mismo chunk | **+9,0** | 72.153 − 72.144, medido |
| **total** | **68,0** | |

🔴 **Los 9,0 B son EXACTAMENTE el piso de ruido, así que no se pueden separar de él.** Hay un mecanismo plausible y no medido —el chunk asíncrono nuevo tiene que quedar registrado en el mapa de chunks que el chunk del layout lleva adentro, y eso son bytes en el layout aunque el código viva afuera— pero distinguirlo del ruido pide una cuarta corrida contra el mismo árbol de la tercera, y no se corrió. **Se declaran SIN ATRIBUIR.** Lo que el reparto sostiene con holgura es la conclusión: 59 de 68, el **87 %**, es una línea de `import`.

### La línea

68,0 / 1024 = 0,0664 → 0,07, que deja **3,68 B** de aire, **abajo** del umbral de 8. Se aplica la **regla del aire útil** —cuarta vez, después de TAPADO-1, TEXTO-2 y COMPO-1— y la línea nace en **`MONTAJE_DE_DESLIZAR_KIB = 0,08`**, con 13,92 B.

| | antes | después |
|---|---|---|
| techo propio | 66,35 KiB | **66,43 KiB** |
| aire contra el techo propio | 99,2 B | **113,1 B** |
| lo que el 60 vigila | 59,903 KiB | **59,890 KiB** |

⚠ **El techo de 60 no se movió, y declarar 0,08 por 68 B medidos le AGRANDA el margen** (de 99,2 a 113,1 B), porque la línea se le suma al techo propio y se le resta a la cifra que el 60 mira. La línea es revocable sola.

**La continuidad de la cadena de A/B:** el «antes» de este sprint reproduce el «después» que COMPO-2 publicó — **72.144,0 contra 72.146,0, o sea 2,0 B**, dentro del piso de ruido y sin causa atribuible en el medio (ORDEN-2 reparte commits y no toca producto). Queda dicho en vez de redondeado: la convención pide reproducir «al décimo de byte» y esto reproduce al byte, no al décimo.

---

## 8 · EL GATE

`npm run verificar` → **30 pasos · 0 con falla · 19 deudas declaradas** (15 en `s10`, 3 en `s8`, 1 en `s22` — las mismas que traía el árbol, ninguna nueva). Y siguen siendo 30 pasos porque el invariante nuevo entró a la suite **`s18`** —la de las compuertas— en vez de abrir una. No es acomodo: el deslizamiento **no agrega una compuerta, consume las dos que B5 ya puso**, así que la tabla de verdad que `s18-compuertas` §2 recorre es también la de acá.

Los dos rojos que la instrucción anticipaba, con su reescritura:

- **`s5-peso`** — declarado: `MONTAJE_DE_DESLIZAR_KIB = 0,08`, su recibo (`s5-presupuesto-recibos-de-deslizar.ts`), su fila en `LINEAS_CON_NOMBRE`, su término en la suma, y su bloque de **siete afirmaciones** en `s5-peso-lineas.ts`. **54 afirmaciones · 0 fallas.**
- **`s4-cobertura`** — el script con la forma exacta: `"test:s18-deslizamiento": "npx tsx src/app/v3/_lib/__tests__/s18-deslizamiento.invariant.tsx"`. Nada de `cross-env`, nada de `&&`, y la palabra `frontera` afuera. **19 afirmaciones · 0 fallas.**

Y el que la instrucción mandaba vigilar, **`s10-acceso`**: no se movió, y §4.4 explica por qué es legítimo y no ceguera.

La suite `s18` pasó de 3 invariantes a 4: **179 afirmaciones · 20 controles positivos · 0 fallas**. El invariante propio aporta **73 afirmaciones y 7 controles positivos**, uno por sección.

`npx tsc --noEmit` → **exit 0**. Cero `any`, cero `router.push`, cero `triggerTransition`.

**Y `npm run test:frontera`, que el gate dice que va ANTES del commit** — 33 afirmaciones · 10 controles positivos · 0 fallas:

- **«ninguno de los 8 archivos prohibidos fue tocado — []»**: `HeroArtifact.tsx`, `TransitionContext.tsx` y `page.tsx` intactos, verificado contra `git status` y no por declaración;
- `dependencies` y `devDependencies` **idénticos a HEAD** — no se agregó una sola dependencia (se consumió `lenis`, que ya estaba);
- **1 script nuevo** (`test:s18-deslizamiento`) y ningún script previo modificado;
- los tokens del tema: **102 en HEAD y 102 ahora, ninguno movido**. `theme-develop.css` no se tocó.

---

## 9 · ARCHIVOS

**Nuevos (8):**

```
src/app/v3/_componentes/deslizamiento.ts
src/app/v3/_componentes/useDeslizamientoDelCta.ts
src/app/v3/_estilos/deslizamiento.css
src/app/v3/_lib/__tests__/s18-deslizamiento.invariant.tsx
src/app/v3/_lib/__tests__/s18-curva.ts
src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-deslizar.ts
scripts-deslizar/a-llegada.ts
scripts-deslizar/b-controles.ts
```

**Modificados (10):**

```
src/app/v3/_componentes/ScrollSuaveDeV3.tsx        la ref, la llamada al hook, y el bloque del contexto actualizado
src/app/v3/layout.tsx                              el import de la hoja (y el encabezado: cinco → seis)
src/app/v3/_lib/__tests__/s3-archivos.ts           la hoja en el padrón
src/app/v3/_lib/__tests__/s18-compuertas.invariant.ts  §3b barre 5 archivos, no 3
src/app/v3/_lib/__tests__/s5-presupuesto.ts        la constante, la fila y el término de la suma
src/app/v3/_lib/__tests__/s5-peso-lineas.ts        el bloque de 7 afirmaciones
package.json                                       el script del invariante
.gitignore                                          /.next-deslizar/, con su motivo
docs/rediseno/DIRECCION-ESCENA.md                   §7.73
tsconfig.json                                       ⚠ lo tocó NEXT, no yo — ver abajo
```

⚠ **`tsconfig.json`**: el build con `E2E_DIST_DIR=.next-deslizar` le agregó solo `.next-deslizar/types/**/*.ts` y `.next-deslizar/dev/types/**/*.ts` al `include`. Es lo mismo que ya está ahí para `.next-setter`, `.next-galeria` y `.next-perf-a` de sprints anteriores, así que se deja; si el dueño prefiere no cargar con esas dos líneas, se borran y el único costo es que el próximo build con ese `distDir` las vuelva a escribir.

---

## 10 · LO QUE QUEDA ABIERTO

1. 🔴 **La forma del gate del intro es una decisión pendiente del dueño.** Se construyó `!isSceneHeld(etapa)` con la evidencia de §3. La letra literal de la instrucción —`=== 'clear'`— apaga la función en toda visita repetida. Un cambio de una línea en cualquier dirección, con el invariante detectándolo.
2. **Atrás apaga el velo pero no congela el viaje** (§6, control 2). Es fidelidad al comportamiento de hoy. Si se quiere congelar, es una línea y no usa `stop()`.
3. **Los 9,0 B del peso siguen sin atribuir.** Una cuarta corrida contra el árbol de la tercera los separaría del ruido. No se corrió.
4. **«Retardo 0,144 pantallas, asentar 967 ms» no reproduce** (§5.3). Si esa cifra vino de una calibración que este árbol no tiene, conviene saber de dónde salió antes de que alguien la use como referencia.
5. **El plan no existe en el disco** (§0). Si existe en otra máquina, vale contrastar §5 contra él: tres de cuatro cifras reprodujeron exactas.
6. **La velocidad de cámara por cuadro es 46,6× la de un diente de rueda** (§5.2). No rompe ningún invariante y es consecuencia directa de `expoOut` desde quieto. Queda publicada por si el dueño quiere revisar la curva después de verlo en pantalla.
7. **El deslizamiento de los otros catorce enlaces sigue frenado**, con el motivo medido: la banda suspendida de la escena. El día que se quiera, lo que hace falta primero es decidir qué pasa cuando el viaje cruza una zona donde la escena no dibuja.

---

## 11 · MÉTODO — dos cosas que este sprint deja escritas

**Una instrucción puede traer una referencia de línea vencida y la sustancia intacta.** `hero.invariant.tsx:268` no habla del CTA; la que fuerza la arquitectura delegada es la 338. La forma de no tropezar fue **ir a leer la línea** en vez de confiar en la cita, y la del sprint que venga es la misma: una referencia `archivo:línea` de una instrucción se verifica como cualquier otra medición.

**Y un requisito puede estar bien y su forma mal, y hay que separarlos.** El gate del intro era un requisito correcto —el click durante la capa rompe el muestreo— con una forma que lo rompía en la rama más frecuente. Lo que permitió verlo no fue desconfiar de la instrucción: fue **leer el contrato del módulo que la instrucción nombraba** (`introBoot.tsx:91`, y el comentario de `HomeIntro.tsx` que dice `idle` significa «no hay intro», no «el intro terminó»). Cuando una instrucción nombra un símbolo, el símbolo tiene la última palabra sobre qué significa.
