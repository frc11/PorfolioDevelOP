# B7 · LOS DEFECTOS ABIERTOS — el reporte

**Qué es.** Los defectos que B1, B2, B4-A, B4-B y B5 dejaron anotados, verificados
uno por uno contra el sitio de hoy antes de tocar nada, y después arreglados,
cerrados por medición o diferidos con su razón.

**Dónde y cuándo.** Worktree `C:\v3-defectos\logic-core-v3`, rama `v3/defectos`,
sobre `5ecfbe55`. 7 de septiembre de 2026. **Puerto 3002** para el sitio en
desarrollo y **3005** para el build de producción (`.next-probe`). Corrió en
paralelo con la sesión de la escena persistente, que usa el 3001.

**La zona prohibida quedó intacta**, verificado con `git status --porcelain` sobre
sus rutas: ni un byte en `_secciones/trabajos/`, `_secciones/cierre/`, el pie,
`_lib/superficies.ts`, `_lib/escena/` ni `_lib/secciones.ts`.

---

## 1 · EL GATE DEL BLOQUE — la tabla de antes y después, defecto por defecto

| defecto | antes | después | instrumento |
|---|---|---|---|
| **🔴 D1 · `prefers-reduced-motion` se ignora** | **2.450** transformadas acumuladas con la preferencia contra **2.450** sin ella · 5 piezas de línea en las dos · `matchMedia` `true` | **0** con la preferencia contra **2.450** sin ella · **0** piezas contra 5 · contenido **7.115** caracteres visibles (7.104 sin) y **0** nodos apagados por opacidad | `npx tsx scripts-b7/a-reducido.ts` → `b7/a-reducido.json` |
| **🔴 D1-bis · el invariante estaba verde por arnés** | **46** afirmaciones, 0 fallas, **con el sitio roto** — renderizaba a través de `<MotionConfig reducedMotion={preferencia}>` y afirmaba sobre esa misma `preferencia` | **76** afirmaciones, 0 fallas. R1…R6 intactas; R7·R7b·R8·R9·R10 cierran el camino de producción, con el defecto de hoy capturado como control negativo | `npm run test:s2-reducido` |
| **🟠 D-B5.1 · el cuerpo del diferencial al borde de AA** | mediana **4,64:1**, **34,72 %** de 22.387 px de glifo bajo AA (1440) · **11,25 %** (1920) · peor píxel 1,00:1 | mediana **4,64:1**, **33,61 %** (1440) · **8,05 %** (1920) · peor píxel **1,91:1** y **2,14:1**, misma masa de glifo | `npx tsx scripts-b7/c-contraste.ts despues` → `b7/c-contraste-despues.json` |
| **🟡 D7 · `/v3/tipografia/muestra` desborda a 375** | la receta **tira**: `innerWidth` 638 con 375 pedidos | `innerWidth` 375 · `scrollWidth` 375 · los ocho niveles fluidos resuelven contra 375 | `npx tsx scripts-b7/c-tipografia.ts despues` |
| **🟡 D9 · los 8 niveles sólo en Title Case** | **2 de 8** con las dos formas | **8 de 8**, con el mismo texto en minúscula y la misma cadena de clases | ídem |
| **⛔ D2 · «el pin de Servicios no pinea»** | 0 paradas pegado de 243, en los seis perfiles | **NO SE REPRODUCE.** El pin anda: **2.158 px** a 1920 (11.882 → 14.040), 1.798 a 1440, 1.502 a 1025 · `git diff 8ab34b36 HEAD` sobre `geometria.ts` y `Servicios.tsx` = **vacío** | `npx tsx scripts-b7/b-pin.ts` → `b7/b-pin.json` |
| **⛔ LCP móvil cruza 2.500 ms** | mediana **2.378**, con una corrida en **2.524** | **NO SE REPRODUCE.** 2.084 · 2.132 · 2.156 · 2.204 ms — **4 de 4 abajo**, mediana **2.144** | `npx tsx scripts-b7/f0-lcp.ts` → `b7/f0-lcp.json` |
| **🟠 D-B5.5 · el cuadro de ≈26,7 ms** | 2 de 3 corridas, siempre cerca del cuadro 439 | **NO SE REPRODUCE**, ni con `scrollBy` ni con rueda real: **0 cuadros sobre 20 ms en los seis brazos**, con el lector demostrado sensible (vio los 40 ms inyectados) | `npx tsx scripts-b7/d-cuadro-largo.ts` → `b7/d-cuadro-largo.json` |
| **🟡 punto ciego de `marcadoresAnunciados`** | contaba sólo hojas: un nodo con etiqueta adentro **y** texto propio perdía su texto | detector corregido con control positivo; `s10-acceso` pasó de 74 a **79** afirmaciones | `npm run test:s10-acceso` |
| **⚠️ la premisa de `compuerta.ts`** | «el `sticky` SÍ cruza … mobile conserva el ritmo del pinneado gratis» | reescrita contra la medición: **cruza el MECANISMO, no el pin** — a 1024 hay 2 `sticky` y ninguno pinea contenido | `b7/f0-reproduccion.json`, claves `pines1024`/`pines1920` |
| **🟡 13 de 21 capturas de anclas sin tomar** | 8 de 21 | **21 de 21**, y las 21 mediciones reproducen contra B4-B al centésimo | `npx tsx scripts-b7/d-anclas.ts` · `docs/rediseno/capturas/b7/` |

---

## 2 · 🔴 LA TRAMPA ESTRUCTURAL QUE PRODUJO `D2` — y cómo se discrimina

**No es un detalle de D2.** Es una trampa estructural que va a engañar a cualquier
instrumento futuro que mida ese envoltorio, y el que cayó fue **B4-B, con Fase 0,
con banco propio y con controles positivos**. Publicó un defecto rojo que no
existía.

`Servicios` tiene **DOS `sticky` anidados y sólo uno pinea**:

| elemento | alto propio | alto del padre | **recorrido disponible** | paradas pegado |
|---|---|---|---|---|
| `div[data-seccion-id=servicios][data-pinneado=siempre].w-full.sticky.top-0.min-h-svh` — **el que midió B4-B** | 3.240 | 3.240 | **0** | **0 / 154** |
| `div.sticky.top-0.flex.min-h-svh.w-full.flex-col.justify-center.gap-[…]` — **el pin real** | 1.080 | 3.240 | **2.160** | **18 / 154** |
| `div[data-seccion-id=trabajos][data-pinneado=desde-escritorio]` (control: un pin que anda) | 1.080 | 3.240 | 2.160 | 18 / 154 |

La causa del cero de arriba es de construcción: `Seccion.tsx` emite ese envoltorio
para una sección `pinneada: 'siempre'`, y `Servicios.tsx` le pone adentro un
`Bloque` con el alto de la sección ENTERA. El envoltorio **mide lo mismo que su
padre**, así que su rango es cero **en todos los perfiles y para siempre**
(2.370,44 de 2.370,44 a 1024). **No está roto: nunca tuvo recorrido.**

> ### EL DISCRIMINADOR, Y VALE PARA CUALQUIER `sticky` DEL REPO
>
> Un `sticky` son **dos** elementos: **el hijo que se pega** y **el padre que le
> da recorrido**. La cifra que decide es
> **`recorrido disponible = alto del padre − alto propio`**.
>
> **Medir sólo la posición del hijo devuelve el MISMO cero en los dos casos** —el
> que está roto y el que nunca tuvo recorrido—. Un cero sin el recorrido
> disponible al lado no significa nada, y por eso `clasificar` de
> `scripts-b7/b-pin-lectores.ts` **no acepta publicar un cero sin decir de cuál de
> los cuatro casos se trata**: `pegado`, `inerte-sin-recorrido`,
> `roto-con-recorrido` o `no-sticky`.

⚠️ **Y hay una segunda vuelta del mismo pozo, que la verificación adversarial de
este bloque encontró en el instrumento nuevo:** el censo leía el alto del hijo
**una sola vez, con el scroll en cero**, y este hijo **crece a mitad del pin** —de
774,55 a 798,55 px a 1025×768, porque la secuencia cambia de servicio—. Con el
alto estático el desborde daba **6,55 px**; medido parada por parada da **30,55
px**, casi cinco veces, y la pérdida de recorrido es el **2,21 %** y no el 0,43 %.
**Una altura que puede cambiar durante el recorrido se mide durante el recorrido.**

**El envoltorio inerte se deja como está, y la decisión va escrita**: sacarle el
pinneo es tocar la rama `'siempre'` de un archivo que sirve a las DOS secciones
pinneadas, y una de ellas es zona prohibida. No cuesta un píxel de layout en
ninguna de las paradas del barrido; lo que cuesta es medirlo mal, y eso se
arregló acá.

---

## 3 · LAS DOS POLÍTICAS DE MOVIMIENTO REDUCIDO, Y CUÁL NO LLEGABA

`useMovimientoReducido()` era `useReducedMotionConfig() ?? false`. Ese hook de
`motion` mira **primero el contexto** y el default de `MotionConfigContext` es,
textual, `reducedMotion: "never"` — que corta antes del media query. En todo
`/v3` no había un solo proveedor, así que **la preferencia nunca se leía**.

**Y el repo ya tenía la política que funciona.** `_lib/usePrefiereMenosMovimiento.ts`
es `useSyncExternalStore` sobre `matchMedia('(prefers-reduced-motion: reduce)')`,
con snapshot de servidor `true` —la opción conservadora, argumentada en su
docblock— y reactiva a que la preferencia cambie con la ventana abierta. De ahí
leen **el cursor** y **el scroll suave**, que son dos de las tres piezas que B5
verificó que sí la honran.

> **O sea que hoy había DOS políticas de movimiento reducido, y la que no llegaba
> era la del sistema de motion.** Los docblocks decían lo contrario:
> `reducido.ts` justificaba `useReducedMotionConfig` «para poder forzar en una
> comprobación» sin ver que tampoco lee el media query si nadie pone el contexto,
> y `CompuertaDelHome` advertía que «usar otro hook para la misma preferencia
> sería tener dos políticas» cuando las dos ya existían.
>
> **El arreglo unifica hacia la que ya funciona; no escribe una tercera.**
> `v3/layout.tsx` monta `ProveedorDeMovimiento`, que traduce esa única política al
> vocabulario de `MotionConfig` (`'always' | 'never'`, con una función pura). Los
> dos docblocks se reescribieron con la causa.

**Y el forzado por contexto sobrevive entero**, que es lo que permite fortalecer
el invariante en vez de reemplazarlo: un `<MotionConfig>` anidado más adentro
sigue ganando, y R1…R6 quedaron carácter por carácter.

---

## 4 · ⚠️ TRES INSTRUMENTOS DE ESTE BLOQUE FALLARON DE LAS FORMAS QUE EL BLOQUE VINO A CAZAR

Los encontró la verificación adversarial —un verificador escéptico por frente, con
prohibición de escribir—, no sus autores. Van escritos porque el patrón importa
más que el arreglo.

**(a) Una TAUTOLOGÍA con forma de afirmación.** `b-pin-comprobaciones.ts`
afirmaba «lo que el pin pierde de recorrido es exactamente lo que el hijo
desborda» con los dos lados sacados de las MISMAS dos alturas del censo:

```
derivado − disponible − (alto − V) = (pasos−1)·V − (padre − alto) − alto + V = pasos·V − padre
```

`alto` **se cancela**: el predicado se reducía a lo que ya afirmaba la fila de
arriba y **no podía ponerse en rojo por nada que tuviera que ver con el desborde**.
Peor: había reemplazado a una afirmación que sí daba rojo a 1025. Hoy los dos
lados salen de mediciones independientes —el alto por caja parada por parada, el
rango por scroll real bisectado— y **tiene un control que la hace fallar a
propósito**: con el alto alterado 40 px, roja. Y la tolerancia pasó de **un paso
entero (120 px)** a **4 px**, que es lo que el instrumento resuelve.

**(b) Una MEDICIÓN QUE MEZCLA DOS CORRIDAS EN SILENCIO.** `c-palancas.ts` leía la
**geometría** del JSON versionado y los **píxeles** de `os.tmpdir()`, que se pisa
en cada corrida y no llevaba identidad. Re-correrlo cruzaba **la caja de una
corrida con los píxeles de otra** sin fallar ni advertir: el agregado caía de
22.387 a 16.777 píxeles de glifo —los 5.610 que faltan son exactamente el
testimonio, cuya caja vieja aterriza en papel en blanco— y tres de los cinco
techos cambiaban solos (16,70 → 7,77; 24,02 → 16,22; 77,08 → 85,07). **El cuarto
coincidía por casualidad, que es lo peor: hacía que la corrida corrupta pareciera
una reproducción.**

Arreglado con un **sello de contenido** en los dos artefactos
(`scripts-b7/c-sello.ts`): el consumidor **tira** en vez de publicar, y se
comprobó que tira. **La columna «antes» de las palancas se retiró** —no se puede
re-derivar, y un número que no se puede volver a producir no se publica como
medición—; sobrevive la de hoy, que es la que sostiene la conclusión: **ninguna
palanca llega a AA**.

**(c) UN ARGUMENTO CON FORMA DE MEDICIÓN QUE NO SEPARABA LAS DOS HIPÓTESIS.** Un
docblock del banco afirmaba, como regla de método, que «24,0 px por evento
exactos es scroll NATIVO y no un motor que interpola». `/v3` construye Lenis con
`wheelMultiplier: 1` (`OPCIONES_DE_LENIS`, importadas del sitio vivo), así que
**con** el motor el total también es `n × 24`: medido, **23,968 px/evento con
motor y 23,968 sin él**. Lo que discrimina es el atributo `data-v3-scroll-suave` y
la clase `lenis`, y es lo que se afirma ahora. **Es la familia de «verde por
arnés», un piso más abajo.**

**(d) Y un guardián que comprobaba la variable equivocada.** `volverAlTope`
verificaba `window.scrollY === 0` —la POSICIÓN— cuando lo que el brazo necesita es
el **objetivo interno** del motor. Medido: tras un `volverAlTope` exitoso, la
misma calibración que da 24,0 px/evento en frío daba **44,12** y después
**76,54**, y el exceso era exactamente donde había terminado el brazo anterior.
Hoy se vuelve al tope **por el mismo canal que después se conduce** —con la
rueda, así el objetivo vuelve con la posición— y el guardián mide **la
respuesta**, con tolerancia del 25 % sobre el arranque en frío.

---

## 5 · LO QUE SE CIERRA SIN ARREGLAR, con el número

**`D2` — el pin de Servicios.** El pin anda: 2.158 px de recorrido a 1920 con los
dos bordes bisectados a 2 px, el mismo orden que B1 publicó. Y el código no
cambió: `git diff 8ab34b36 HEAD` sobre `geometria.ts` y `Servicios.tsx` está
vacío. **No hubo regresión; la medición apuntaba al elemento equivocado.**

**El LCP móvil.** Mismo instrumento que B4-B (las tres fuentes de
`scripts-b4/a-observador.ts`), build de producción propio, 375 con el preset
móvil: **2.084 · 2.132 · 2.156 · 2.204 ms**, mediana **2.144** contra 2.378.
**4 corridas de 4 abajo del techo de 2.500.** El elemento LCP sigue siendo el
`<h1>` del hero, texto, 34.892 px².

Y lo que lo demora, con su número: **diferir el JS no es la palanca.** Bloqueando
los 25 chunks (350,0 KiB) el techo de contención de ancho de banda mide **20 ms en
una corrida y −8 ms en otra, con una dispersión de 56–60 ms dentro de un solo
brazo**: **indistinguible de cero con n = 3**, y los dos brazos ahora se alternan
en vez de correr en serie. Lo que queda antes del FCP son las cuatro hojas
bloqueantes y la fuente. **Sentry no se difiere y eso sigue cerrado.**

**`D-B5.5` — el cuadro largo.** Seis brazos, tres conduciendo con `scrollBy` y
tres con eventos de rueda reales, los seis pasando por `y ≈ 10.500`, con el lector
demostrado sensible: **cero cuadros por encima de 20 ms en los seis**, el peor de
cada uno entre 13,5 y 13,7 ms. **Ni del producto ni del instrumento: hoy no está.**

---

## 6 · LO DIFERIDO, con su razón

| defecto | razón |
|---|---|
| **D3** · abajo de 1025 no queda ningún pin del recorrido | el arreglo es composición en `_secciones/trabajos/` — **zona prohibida**. La premisa falsa de `compuerta.ts` sí se reescribió |
| **D6** · los tres enlaces de proyecto miden 20 px de alto a 375 | mismo archivo — **zona prohibida** |
| **el último plano de Trabajos no sale** (B4-A) | `_secciones/trabajos/` + `secciones.ts` — **zona prohibida** |
| **D4 · D5** · cero acontecimientos y aire muerto abajo de 1025 | decisión de composición, y necesita la escena abajo del umbral |
| **D8** · la escala tipográfica se comprime a 375 | **DECISIÓN TOMADA — aceptada**, ver §7.1 |
| **D13** · el heap del build | **FRENADO** — `netlify.toml` ya fija 4096 y el script es del sitio vivo, ver §7.2 |
| **§7.13 · §7.17** · los archivos arriba de 300 líneas | fuera de los cuatro frentes — ver §7.4, que tiene el nombre y lo que es peor que el rojo |
| **D-B5.4** · el paralaje bajo el orden de la referencia | **no se reabre**: el techo lo siguen poniendo las tarjetas, que no se movieron |

---

## 7 · LAS DECISIONES DE LA PARADA — tomadas, con su número

### 7.1 · `D8` — la jerarquía a 375: **ACEPTADA**

**Decisión del dueño, en la parada.** No es un límite: es una decisión escrita, y
vive en el docblock de `_lib/tipografia.ts` para que sea revocable.

A 375 la banda fluida resuelve `cuerpo 15 → base 16 → titulo-s 17 → titulo-m 18`
—**cuatro niveles en tres píxeles**—, con saltos de **×1,06 y ×1,06** donde a 1920
valen **×1,33 y ×1,79** (`b4/b-tipografia.json`). Y no es un descuido: el piso de
`titulo-s` **ya es el único entero posible**, porque 16 colisiona con
`--text-base` y 18 con el piso de `titulo-m`.

Las tres salidas, con lo que cuesta cada una:

1. **Bajar `--text-cuerpo` (15 px).** ⚠️ Es **el mismo texto que `D-B5.1` tiene al
   borde**: 33,61 % de sus píxeles bajo AA a 1440. Empeora un defecto de
   accesibilidad abierto para arreglar uno de composición. **Descartada.**
2. **Subir el piso de `titulo-m` (18 px).** Aplana una banda cuyos seis techos
   **salieron de medición** y están anclados a 1440. **Descartada.**
3. **Aceptarlo.** A 375 la jerarquía la llevan el peso, el color y el aire —que es
   lo que de hecho pasa— y **una diferencia de un píxel no la ve nadie.**
   **Tomada.**

### 7.2 · `D13` — el heap del build: **FRENADO, y por una causa mejor que la anticipada**

La instrucción pedía fijarlo sin sumar dependencias, con `cross-env` como el
bloqueo previsible. **`cross-env` ya está instalado** (`devDependencies`,
`^10.1.0`), así que ése no era el problema. **El problema es otro y es más
grave:**

> **`netlify.toml` YA fija `NODE_OPTIONS = "--max-old-space-size=4096"`** para el
> build del sitio vivo (`[build.environment]`). Meter `NODE_OPTIONS` adentro de
> `npm run build` **lo pisaría en el deploy de producción**, subiendo el heap del
> contenedor de CI de 4096 a 6144 sin que nadie lo haya pedido ni medido ahí.

Eso es exactamente el caso de la regla 5: **no se puede sin cambiar el
comportamiento de una ruta compartida con el sitio vivo, así que se frena y se
reporta.** `package.json` no se tocó.

**El comando exacto, para que no dependa de que alguien se acuerde:**

```bash
CIRCLE_NODE_TOTAL=2 NODE_OPTIONS=--max-old-space-size=6144 npx next build --webpack
```

Y con un `distDir` aislado, que es como se corrió en este bloque para no pisar el
`.next` que `verificar` lee:

```bash
CIRCLE_NODE_TOTAL=2 NODE_OPTIONS=--max-old-space-size=6144 E2E_DIST_DIR=.next-b7 npx next build --webpack
```

⚠️ **Cualquier `distDir` alternativo se agrega a `.gitignore` ANTES de correr el
build** — es la lección de agosto, y `/.next-b7/` se agregó ahí antes de la
primera corrida.

**Lo que quedaría por decidir, si se quiere fijar igual:** o se sube el número en
`netlify.toml` (y entonces hay que medir que el contenedor de CI lo aguante), o se
agrega un script aparte que **no** reemplace a `build`. Las dos cambian algo del
sitio vivo, y ninguna es de este bloque.

### 7.3 · `s5-peso` — la regla 13 aplicada, con el excedente PARTIDO POR DUEÑO

**El excedente no era todo de B7, y ésa es la noticia.** Tres builds de
producción del mismo árbol, con `E2E_DIST_DIR` aislado y una sola variable entre
uno y otro:

| árbol | lo que escribe el lane | contra el techo viejo (61,25) |
|---|---|---|
| (1) sin el proveedor y sin el cambio de columna del testimonio | **61,40 KiB** | **−0,11 · ROJO** |
| (2) + el cambio de columna del testimonio (frente C) | **61,40 KiB** | −0,13 |
| (3) + el proveedor de `prefers-reduced-motion` (frente A) | **61,90 KiB** | −0,60 |

> **El punto (1) es este árbol ANTES de que B7 tocara una línea de producto, y ya
> estaba en rojo.** `s5-peso` no lo puso B7: entró en `5ecfbe55` (B5), que midió
> su peso neto sobre un `distDir` aislado y **para Lenis en particular**, no el
> total del lane contra este techo.

Por lo tanto, y es literalmente la regla 13:

- **Se AFIRMA lo propio — `ARREGLO_DE_B7_KIB = 0,55`.** El proveedor cuesta
  **0,50 KiB** medidos entre (2) y (3); el cambio de columna, **0,02**. Es lo que
  cuesta que la preferencia se honre.
- **Se PUBLICA lo heredado con su dueño y NO se afirma —
  `HEREDADO_SIN_DECLARAR_KIB = 0,15`.** Los **0,11 KiB** que ya estaban en rojo,
  con B5 nombrado. **B7 no se los apropia.**

**Son dos constantes y no una**, porque el día que alguien encuentre de dónde
salieron los 0,11 y los devuelva, **el techo baja solo** al borrar esa línea. Un
número único habría enterrado la distinción.

**Y el techo viejo de 60 KiB sigue mordiendo, más fuerte que antes:** ahora se
afirma restando **todos los montajes declarados**, no sólo el de B4-A. Un byte
que crezca sin declararse no tiene línea que lo cubra y pone la comprobación en
rojo igual. Hoy da **59,9 contra 60**.

Y lo que se achicó **antes** de subirlo: el arreglo usa `MotionConfigContext.Provider`
pelado y no `<MotionConfig>`, que arrastra `resolveTransition` y
`loadExternalIsValidProp`. La alternativa —montar el proveedor abajo, en
`CompuertaDelHome`— evitaría que webpack ice el núcleo compartido de `_lib` a un
chunk propio, y **dejaría `/v3/motion` sin el arreglo**: se descartó por eso, no
por el peso.

### 7.4 · 🔴 `tokens.invariant.ts` — 498 líneas, y lo que es PEOR que el rojo

**`src/app/v3/_lib/__tests__/tokens.invariant.ts` mide 498 líneas.** Pasó de
**475 a 498 en V3-C** (2026-09-02 → 09-04) y está clavado ahí desde entonces. No
se partió: no es de ninguno de los cuatro frentes y §7.17 ya decidió que estos van
juntos, en un sprint de limpieza.

> **Y hay algo peor que el rojo que se teme: hoy no lo cubre NINGÚN gate.**
> `LARGOS_HEREDADOS` de `s8-largos.ts` lista **sólo los seis de `_lib/escena/`**;
> `s5-codigo` §8 mira los archivos de S5 y `s6-lane` §7 los del lane de secciones.
> **`tokens.invariant.ts` no está en ninguna de las tres listas**, así que no va a
> ponerse rojo cuando alguien le agregue una línea: **va a crecer en silencio**, y
> el sprint que finalmente lo mire va a encontrarlo más grande, no igual.

Los otros cuatro en la misma situación: `motion-bundle.invariant.ts` (453),
`_lib/secciones.ts` (421), `bundle.invariant.ts` (375) y
`cronograma.invariant.ts` (324).

## 8 · LOS GATES

| gate | resultado |
|---|---|
| `npm run build` (`CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`, primer plano) | **exit 0** |
| `npm run verificar` | **26 pasos, 0 con falla** |
| `npm run test:frontera` | **2 invariantes · 23 afirmaciones · 10 controles positivos · 0 fallas** |
| `npx tsc --noEmit` | **limpio** |
| `npm run test:s2-reducido` | **76 afirmaciones, 0 fallas** (eran 46) |
| `npm run test:s6-servicios` | **121 afirmaciones, 0 fallas** |
| `npm run test:s6-por-que-develop` | **72 afirmaciones, 0 fallas** |
| `npm run test:s10-acceso` | **79 afirmaciones, 0 fallas** (eran 74) |
| `npm run test:s1-compuerta` | **30 afirmaciones, 0 fallas** |
| `npx tsx scripts-b7/b-pin.ts` | **25 comprobaciones, 0 fallas** |
| `npx tsx scripts-b7/a-reducido.ts` | **13 afirmaciones, 0 fallas** |
| ningún archivo de B7 arriba de 300 líneas · cero `any` · cero dependencias nuevas | **verificado** |

---

## 9 · TODO LO QUE FRENÓ

1. 🔴 **Los tres subagentes de reparo murieron a los 17,8 s con «You've hit your
   monthly spend limit»** — 0 de 3 terminados, el workflow devolvió `completed`
   en segundos. Es §7.21 y la regla 14 de la instrucción. **Los reparos los
   cerró el agente principal a mano**, uno por uno, y están todos en §4.
2. 🟡 **`verificar` no puede apuntar a otro `distDir`**, así que para correrlo hay
   que bajar el `next dev` del 3002 y construir en `.next`. Se hizo así, y el
   `next start` del 3005 —que vive en `.next-probe`— quedó intacto.
3. 🟡 **`netlify.toml` ya fija `NODE_OPTIONS` en 4096**, así que `D13` no se pudo
   fijar sin cambiar el build del sitio vivo. Se frenó y se reportó (§7.2), con el
   comando exacto escrito.
4. 🟡 **El chequeo de procesos fue por ruta de worktree**, nunca por comando: se
   bajaron sólo los dos `node` de `C:\v3-defectos`, y se verificó en el acto que
   el 3001 del lane vecino seguía respondiendo 200.
5. 🟡 **El primer intento de aislar el tercer punto de peso no produjo build
   medible**; se repitió capturando la salida y salió limpio en 3,3 min. Los tres
   puntos de §7.3 son de builds completos, ninguno interrumpido.
6. ⚠️ **La verificación visual la hace el humano.** Este reporte publica números y
   capturas; no dice que se vea bien.
