# SITIO-S3 — Chrome, layout y componentes

**Rama** `rediseno/chrome`, worktree `C:\v3-chrome`. **Fecha** 2026-08-28/29.
**Insumos** `docs/rediseno/s0/LAYOUT.md` y `docs/rediseno/s0/COMPONENTS.md`.
**Estado:** construido y verificado; **la verificación óptica la cierra Valentino
mirando**. Este documento no dice que nada se vea bien.

**Etiquetas de evidencia**, las del proyecto. `[medido]` sale de un volcado de
S0. `[derivado]` es aritmética sobre valores medidos o sobre tokens del sistema,
con la cuenta a la vista. `[decidido]` es de este sprint, y lleva razón.

---

## 0. Lo que hay que saber antes de leer el resto

**Corre en paralelo con el sprint de motion y no comparte un archivo.** Se
verifica, no se promete: `s3-navegacion.invariant.ts` §5 recorre los 35 archivos
del sprint buscando nueve señales de dependencia del scroll —listener de
`scroll`, `useScroll`, `useTransform`, `ScrollTrigger`, `gsap`, `lenis`,
`scroll/view/animation-timeline`, `scrollY`, `IntersectionObserver`— y las nueve
dan cero, con control positivo.

**El vocabulario es sólo el de CSS.** `--ease-principal` y `--ease-salida`, con
las cuatro duraciones 300 · 400 · 500 · 700 ms. Ninguna curva ni duración nueva.

**`theme-develop.css` cambió en UNA cosa y sólo en una**, aprobada en la
parada: entró `--color-superficie-translucida`, la superficie que le faltaba a
`--blur-panel` (§12). No es una promesa: `s3-frontera.invariant.ts` compara el
archivo **token por token contra HEAD** y afirma que el único nombre nuevo es
ése y que **ningún valor previo se movió**.

Los otros archivos **modificados** son `package.json` —12 scripts nuevos, con
`dependencies` y `devDependencies` idénticos a HEAD byte a byte—,
`src/app/v3/layout.tsx`, que suma cinco `import` de hojas de estilo, y los dos
invariantes de S1 que guardan el conteo de tokens. Todo lo demás es alta.
Ver §13.6.

---

## 1. Las primitivas de layout — el sistema invierte lo esperado

| | valor | token | verificado por |
|---|---|---|---|
| Padding lateral | **fijo, 32px** | `--pad-lateral-compacto` | `s3-layout` §1 |
| Columnas | **fluidas** | `minmax(0, 1fr)` | `s3-layout` §3 |
| Canaletas | **fijas**, 12 / 16px | `--grilla-canal-*` | `s3-layout` §4 |
| Envoltorio | **a sangre**, `max-width: 100%` | — | `s3-layout` §2 |
| Tope del contenido | 1920px | `--container-tope` | `s3-layout` §2 |
| Columna lateral | 140px | `--columna-lateral` | `s3-layout` §3 |

**`Envoltorio`** pinta a sangre y aplica los 32px fijos; el tope de 1920 lo lleva
la caja de CONTENIDO, no el panel. Los tres valores declarados por la referencia
que la medición **no encontró ni una vez** en 36 volcados —`1280px`, `95%`,
`28px`— no están en el código.

**`Grilla`** ofrece seis definiciones de columnas (1, 2, 3, 4, 5 y `lateral`) y
tres canaletas. Dos detalles que salen de la medición y no de la comodidad:

- **la canaleta CONMUTA en 1025** —12px abajo, 16px arriba— y lo hace por la
  variante `escritorio:`, que Tailwind genera desde `--breakpoint-escritorio`.
  El número 1025 no está escrito en ninguna hoja del sprint;
- **la grilla de cinco columnas no existe abajo de 1025**: cero apariciones a
  768 y a 1024, cuarenta arriba. Es la firma estructural del breakpoint, y acá
  cae a una sola columna en vez de apretar cinco en 375px.

**Ninguna hoja del sprint contiene un `@media` con un literal de longitud.** Los
breakpoints entran por variantes generadas desde los tokens. Comprobado en
`s3-tokens` §6, con control positivo.

---

## 2. Tipografía — los ocho niveles, y el pendiente que se destraba

Los ocho existen, valen lo que dice el sistema, y **seis tienen contraparte
fluida y dos no**: `cuerpo` (15px) y `base` (16px) se midieron INVARIANTES entre
768 y 1920. Emitir `clamp()` para los ocho sería tan falso como no emitir
ninguno — el 21,8% del texto medido no escala en absoluto.

**La costura del sistema**, que es lo que un instrumento puede afirmar y una
lectura no: cada `clamp()` topa EXACTAMENTE en el valor fijo de su nivel. Si el
techo del fluido no coincidiera con el fijo, arriba de 1440px habría dos tamaños
distintos para el mismo nivel. Los seis coinciden (`s3-tipografia` §2), con
control positivo que mueve un techo y ve la discrepancia.

Los **tres interlineados** y los **cuatro interletrados** se consumen. El cuarto
—`--tracking-display`— no lo usa ningún componente del inventario medido, así que
lo ejercita la ruta de demostración: un token que no se usa en ningún lado es un
token que nadie puede juzgar.

### El número que hace urgente mirar, y de dónde sale

**No está citado: se lee del binario que /v3 sirve.**
`s3-tipografia.invariant.ts` abre `_fuentes/chivo-latin.woff2`, descomprime su
directorio de tablas con `node:zlib` y lee `head` y `OS/2`:

```
unitsPerEm  1000        (tabla head)
sxHeight     511        (tabla OS/2 v4)
sCapHeight   686        (tabla OS/2 v4)

cap height   Chivo 686 · Instrument Sans 720  →  −4,72%
x-height     Chivo 511 · Instrument Sans 510  →  +0,20%
razón cap/x  Chivo 1,3425 · Instrument Sans 1,4118
```

Reproduce exacto lo que S0 midió con fontkit en otra máquina. La cadena queda
cerrada: `fuentes.invariant.ts` de S1 comprueba el sha256 del binario contra el
manifiesto de descarga, y este sprint lee las métricas de ese mismo binario.

**Qué significa, y por eso la ruta:** en Title Case la mayúscula domina el tamaño
óptico percibido, así que en `titulo-l` y `titulo-xl` el texto se va a leer ~5%
más chico que en la familia sobre la que se calculó la escala, con el px
idéntico. En cuerpo de texto no se va a notar: ahí manda la x-height, y coincide
casi exacto. **Eso es lo que hay que mirar en `/v3/tipografia`.**

---

## 3. Los componentes — inventario, componente por componente

20 piezas en 12 archivos. Estados: **R** reposo · **H** hover · **F** foco
visible · **D** deshabilitado · **—** sin estados.

| # | pieza | archivo | estados |
|---|---|---|---|
| 1 | `Envoltorio` | `_componentes/layout/Envoltorio.tsx` | — |
| 2 | `Grilla` | `_componentes/layout/Grilla.tsx` | — |
| 3 | `Titular` (4 niveles) | `_componentes/tipografia/Titular.tsx` | — |
| 4 | `Cuerpo` · `Caption` · `Micro` · `TextoBase` | `_componentes/tipografia/Textos.tsx` | — |
| 5 | `EtiquetaDeSeccion` | `_componentes/tipografia/Textos.tsx` | — |
| 6 | `Cta` (variantes línea y bloque) | `_componentes/chrome/Cta.tsx` | R · H · F · D |
| 7 | `CtaEnlace` | `_componentes/chrome/Cta.tsx` | R · H · F |
| 8 | `Navegacion` (la pastilla) | `_componentes/chrome/Navegacion.tsx` | R (viaja por `sticky`) |
| 9 | `EnlaceDeNavegacionFlotante` | `_componentes/chrome/Navegacion.tsx` | R · H · F |
| 10 | `CursorCompuerta` | `_componentes/chrome/CursorCompuerta.tsx` | monta / no monta |
| 11 | `CursorPropio` | `_componentes/chrome/CursorPropio.tsx` | R · sobre control · sección invertida · sin puntero |
| 12 | `Pie` | `_componentes/chrome/Pie.tsx` | papel / invertido |
| 13 | `TituloDeCierreDelPie` | `_componentes/chrome/Pie.tsx` | — |
| 14 | `BloqueDeColumnasDelPie` | `_componentes/chrome/Pie.tsx` | — |
| 15 | `EnlaceDelPieConIcono` | `_componentes/chrome/PiePiezas.tsx` | R · H · F |
| 16 | `BotonSocialDelPie` | `_componentes/chrome/PiePiezas.tsx` | R · H · F |
| 17 | `EnlaceDeContactoDelPie` | `_componentes/chrome/PiePiezas.tsx` | R · H · F |
| 18 | `EnlaceDeTextoDelPie` | `_componentes/chrome/PiePiezas.tsx` | R · H · F |
| 19 | `FormularioDeNovedades` (campo + envío) | `_componentes/chrome/Novedades.tsx` | R · foco dentro · H · F · D |
| 20 | `Imagen` | `_componentes/medios/Imagen.tsx` | — |

**El padrón se verifica, no se promete.** `s3-foco.invariant.tsx` renderiza un
padrón de **19 entradas** —no es la misma lista: agrupa las que comparten
archivo, como las cinco piezas de texto, y agrega dos variantes de estado que
hay que afirmar por separado, el CTA deshabilitado y el envío deshabilitado— y
su §5 afirma que ese padrón cubre los **12 archivos de componente** y que
ninguna entrada apunta a un archivo que no existe. Un componente nuevo sin
entrada hace fallar la comprobación.

---

## 4. El rollover del CTA — aplicado contra medido

### 4.1 La geometría

| | medido (COMPONENTS.md §3.2/§3.3) | aplicado | cómo |
|---|---|---|---|
| copia A · giro | +6° | `--cta-giro-salida: 6deg` | literal `[medido]` |
| copia A · traslación | (+20, −33,75) px | `--cta-salida-x/-y` | literal `[medido]` |
| copia A · opacidad | 1 → 0 | idem | — |
| copia B · giro de entrada | +10° | `--cta-giro-entrada: 10deg` | literal `[medido]` |
| copia B · traslación | (−30, +24,75) px | `--cta-entrada-x/-y` | literal `[medido]` |
| copia B · `clip-path` | `inset(80% 0 0)` → `inset(0)` | `--cta-recorte-inicial/-final` | literal `[medido]` |
| ventana · alto | 24,5 → 28,5 px | 24 → 28 px | `[derivado]`, ver abajo |
| subrayado | 120×3 px | 100% × 3px | `[derivado]`, ver abajo |

### 4.2 Los tiempos — se COMPONEN, no se escriben

1,3s y 0,6s no son tokens del sistema, y no se inventó ninguno:

```
--cta-intercambio        calc(--duracion-muy-lenta + 2 × --duracion-rapida)  = 1300 ms  ✔ medido 1,3s
--cta-subrayado-duracion calc(2 × --duracion-rapida)                          =  600 ms  ✔ medido 0,6s
--cta-subrayado-retardo  var(--duracion-media)                                =  400 ms  ✔ medido 0,4s
ventana                  var(--duracion-rapida)                               =  300 ms  ✔ medido 0,3s
```

`s3-cta.invariant.tsx` **resuelve las expresiones** contra los tokens reales y
compara contra la medición; no compara cadenas. Con un control positivo que
cambia `--duracion-rapida` a 100ms y verifica que la cuenta se mueve — sin eso,
`calc()` sería decoración.

### 4.3 Lo que transfiere de la ventana es la RESTA

Los extremos medidos —24,5 y 28,5— dependen de la familia. Lo que transfiere
entero es **28,5 − 24,5 = 4,0px exactos**, que es `--spacing-1`, la unidad base
del sistema. Acá el reposo es nuestra caja de línea (`--text-cuerpo` × 
`--leading-texto` = 24px) y el hover le suma esa unidad (28px). El invariante
afirma la resta.

### 4.4 Dos números que NO se transfieren, con su razón

- **el subrayado de 120px** es el ancho de SU rótulo, no una medida del sistema.
  Acá vale el 100% de la ventana, o sea el ancho del nuestro. Copiarlo daría una
  raya que no termina donde termina la palabra. El alto sí transfiere: 3px, como
  `calc(var(--border-hairline) * 3)`.
- **la imagen revelada de 150×33,44px** es contenido, y este sprint no tiene.

### 4.5 La protección de accesibilidad, y su control

El rollover necesita dos copias del rótulo en el DOM. En la referencia las dos
son visibles para el árbol de accesibilidad y el rótulo se anuncia duplicado y
**sin espacio**, porque la última palabra de la primera copia y la primera de la
segunda quedan pegadas.

La corrección es una línea: **la copia B va `aria-hidden="true"`**. No un
`aria-label` encima — eso taparía el síntoma dejando el árbol sucio.

Medido por el instrumento, sobre el marcado renderizado de verdad:

```
con la corrección       "Ver el trabajo"                 14 caracteres · 3 palabras
sin la corrección       "Ver el trabajoVer el trabajo"   28 caracteres · 5 palabras
                         ────────────┘└──────
                         las dos palabras fusionadas: la forma exacta del defecto
```

**El control positivo es la segunda línea**, y no es una simulación: es el MISMO
marcado del componente con los `aria-hidden` borrados, pasado por la MISMA
función. Si `rotuloAccesible()` estuviera ciega, la primera línea también pasaría
en verde. Hay además un tercer control que verifica que la cuenta NO ignora un
subárbol que no está oculto.

Y las dos copias siguen en el DOM: el rollover las necesita. Afirmado.

---

## 5. El cursor — las dos compuertas, las dos con control

**Las dos son de MONTAJE, no de CSS.** El componente devuelve `null` y el
`import()` perezoso nunca se ejecuta: el navegador no pide el chunk.

La decisión vive en una función pura, `deberiaMontarseElCursor(ancho, preferencia)`,
y no adentro de un `if` de JSX. La razón es que una condición encerrada en un
componente exige montar React con un DOM para comprobarla, y ese arnés es más
frágil que la conjunción de dos booleanos que estaría comprobando.

**La tabla de verdad, entera:**

| arriba de 1025 | prefiere menos movimiento | monta |
|---|---|---|
| sí | no | **sí** |
| no | no | no |
| sí | sí | no |
| no | sí | no |

**Los dos controles positivos** son los que impiden el error clásico de esta
comprobación: una compuerta que devolviera `false` siempre pasaría las tres filas
negativas y parecería correcta. Un control verifica que existe un caso que SÍ
monta; el otro, que el ancho por sí solo puede negarla.

Además se verifica sobre el texto del componente que **llame** a esa función —una
función pura que nadie usa no es una compuerta— y que el `import()` sea
`next/dynamic` con `ssr: false`, sin ningún import estático que lo anule.

### El cursor nativo nunca se oculta

**`cursor: none` no existe en ninguno de los 35 archivos del sprint.** Afirmado
con dos controles positivos: uno con la declaración CSS y otro con la utilidad de
Tailwind equivalente. Las dos capas y la raíz llevan `pointer-events: none`
—verificado pieza por pieza— así que `elementFromPoint` ve lo que hay debajo y no
a sí misma.

### Las medidas, compuestas desde tokens

```
núcleo      var(--spacing-1)                       =  4 px   ✔ medido 4×4
halo        calc(--spacing-8 + --spacing-1)        = 36 px   ✔ medido 36×36
desenfoque  calc(--blur-panel / 3)                 =  4 px   ✔ medido blur(4px)
transición  var(--duracion-media)                  = 400 ms  ✔ medido 0,4s
curva       var(--ease-salida)                              ✔ medida
```

### El color acompaña a la sección, y no cuesta un token

El componente copia el `data-seccion="invertida"` de lo que hay bajo el puntero a
su propia raíz. El bloque que S0 ya trae redefine ahí `--color-tinta` y
`--color-borde`, que son exactamente los dos que pintan las capas: se dan vuelta
solas. El invariante verifica que ese bloque redefina los dos.

---

## 6. El foco — la ventaja más barata que hay

La referencia tiene **88 reglas de hover contra 5 de foco**, y de esas 5 ninguna
aplica a ninguno de los cinco objetivos medidos. Con Tab, el único cambio
computado en todo el sitio es `outline-offset` de 0 a 1px con `outline-style:
none` — o sea, nada que se vea.

### Las cuatro afirmaciones

1. **Paridad hover/foco, regla por regla.** Toda regla del sprint que nombra
   `:hover` nombra también `:focus-visible`. Son **11 reglas de hover** las que
   la paridad tuvo que revisar, y el número se reporta justamente para que la
   afirmación no pueda ser verde por vacío. Dos controles positivos: uno con una
   regla de hover suelta, otro con una regla de hover cuya VECINA sí tiene foco.
   Y una afirmación extra: ningún componente esconde una variante `hover:` de
   Tailwind fuera de las hojas, que es donde la paridad se puede verificar.
2. **Cero apagados del anillo** en los 35 archivos, con controles positivos para
   las tres formas de escribirlo y para la utilidad de Tailwind.
3. **La regla del anillo existe** y consume los tres tokens del sistema. El
   anillo forzado de la galería consume los mismos tres: si el sistema cambia el
   grosor, la demostración se mueve con él en vez de mentir.
4. **Pieza por pieza**, sobre el marcado renderizado: cada componente interactivo
   expone al menos un elemento focalizable, y ninguno está adentro de la caja
   recortada del rollover —un anillo con desplazamiento positivo sobre un
   elemento con `overflow: hidden` desaparece sin dejar rastro.

**Lo que encontró el control positivo del punto 4.** El detector contaba `<button`
como focalizable sin mirar `disabled`, y por eso el CTA deshabilitado —declarado
como no interactivo en el padrón— fallaba. El defecto era del instrumento, no del
componente. Corregido: ahora descuenta los controles `disabled`, los `<a>` sin
`href` y los `tabindex="-1"`, con un control positivo por cada exclusión más un
contrapeso que verifica que los tres casos que SÍ entran se cuentan. El
formulario de novedades deshabilitado lo muestra: expone **un** focalizable, el
campo, y no dos.

---

## 7. El umbral de la navegación — de dónde sale el número

La referencia va de `top: 816` a `top: 24`, con umbral en **792px**. **Esos tres
números son de SU héroe a 1440×900 y no entran al repo**: `s3-navegacion` §3
afirma que ni el 816 ni el 792 aparecen en el código del sprint, y que viven en
un solo lugar, rotulados como suyos, para poder comparar.

El nuestro se deriva:

```
reposo      = --spacing-6                                   =  24 px
alto        = 2 × --spacing-3  +  --text-cuerpo × --leading-texto
            = 24              +  24                         =  48 px
margen-pie  = --spacing-6                                   =  24 px   ← [decidido]
nacimiento  = 100svh − margen-pie − alto                    = 100svh − 72px
UMBRAL      = nacimiento − reposo                           = 100svh − 96px
```

A un viewport de 900px —el de sus capturas, sólo para poder comparar— da
**804px** contra sus 792. La diferencia de 12px se descompone entera: 8px porque
su pastilla mide 56 y la nuestra 48, y 4px porque ella deja 28 al pie y la
nuestra deja 24.

**Lo `[decidido]` es la simetría**, y está declarado como tal: la pastilla se
separa del borde inferior lo mismo que después se va a separar del superior. No
está medida en la referencia.

**El mecanismo es geometría, no scroll.** `position: sticky` con `top:
calc(var(--nav-umbral) * -1)` y la pastilla `absolute` adentro a `top:
var(--nav-nacimiento)`. Con eso la posición sale sola: `top = nacimiento −
scrollY` hasta topar en `reposo`, que es la misma curva medida. Sin listener, sin
JavaScript y sin nada del sprint de motion.

El invariante recorre la cuenta en los DOS lugares —el módulo de datos y la
hoja— y verifica que digan lo mismo, con un control positivo que mueve
`--spacing-6` y ve cambiar el resultado.

---

## 8. El pipeline de imagen

El `srcset` de la referencia usa **descriptores de densidad con `sizes` en
`null`**: el navegador elige por `devicePixelRatio` y no mira el ancho de la
caja, así que de 768 a 1920 descarga lo mismo, en las 134 imágenes del sitio.

Nuestro componente emite **10 candidatos, los 10 con descriptor `w`**, y cero con
descriptor de densidad. Verificado sobre el marcado renderizado.

**Tres capas para que no se pueda olvidar**, y cada una atrapa algo distinto:

| capa | qué atrapa |
|---|---|
| el TIPO — `sizes` obligatorio | el olvido: sin él no compila |
| la VALIDACIÓN en construcción | `sizes=""`, que compila perfecto |
| el ESCÁNER estático | a quien agregue otro componente de imagen que no pase por el nuestro |

Los `sizes` se **componen** desde el breakpoint del sistema, no se escriben: el
1025 aparece una sola vez en el repo. La escalera de candidatos es la del
framework —`next.config.ts` no sobreescribe `images.deviceSizes`, y hay una
afirmación que lo comprueba— para que la escalera documentada sea la que corre.

---

## 9. Cero valores fuera de los tokens — cómo se resolvió la tensión

Hay una tensión real y hay que decirla: la coreografía del CTA tiene ángulos de
6° y traslaciones de −33,75px que **no son tokens del sistema y no pueden
serlo** —son la forma de un movimiento medido, no una escala—, y
`theme-develop.css` no se toca.

**La salida, y es una decisión de este sprint:** esos valores viven en
propiedades personalizadas de ALCANCE DE COMPONENTE, declaradas en un solo bloque
por pieza, y **en el punto de uso no aparece ni un literal**. Toda declaración
normal escribe `var()` o `calc()` sobre `var()`.

Para que la excepción no sea un agujero, hay un **padrón**: 25 propiedades de
componente, cada una con su valor y su procedencia escrita.

| evidencia | cuántas |
|---|---|
| `[medido]` | 14 |
| `[derivado]` | 10 |
| `[decidido]` | 1 |

`s3-tokens.invariant.ts` afirma que el conjunto declarado en las hojas es
EXACTAMENTE ése, con esos valores, y que las 25 declaran de dónde salen. Agregar
una propiedad sin registrarla falla; registrarla obliga a escribir su origen.

Lo demás:

- **cero hex** en los 35 archivos, y cero `rgb()`/`hsl()`/`oklch()` en las hojas;
- **cero literales con unidad** en el punto de uso, salvo cuatro estructurales
  declarados: `0s`, `100%`, `50%` y `-50%`;
- **toda clase arbitraria de Tailwind consume un token** por `var()`;
- **todo selector empieza por `[data-v3]`**: ninguna de estas hojas puede
  alcanzar al sitio vivo.

Los cinco con control positivo.

---

## 10. Las dos rutas de demostración

Las dos con `robots: { index: false, follow: false }` y anotadas como deuda:
**se borran el día que /v3 reemplace al home, y a más tardar el 2026-12-31.**

- **`/v3/tipografia`** — los ocho niveles con texto real, en tres anchos.
  Los tres anchos son **tokens**: 375 (`--fluido-piso`), 860
  (`--breakpoint-medio`) y 1440 (`--fluido-techo`).
  Van en `<iframe>` y no en tres columnas, y la razón es de fondo: los seis
  niveles fluidos usan `clamp()` con `vw`, que se resuelve contra el **viewport**
  y no contra el contenedor. Tres columnas mostrarían el mismo tamaño en las tres
  y no demostrarían nada. Nada está escalado — escalar arruinaría exactamente el
  juicio óptico que la ruta existe para permitir. Cuelga de ella
  `/v3/tipografia/muestra`, que es lo que cargan los marcos.
- **`/v3/componentes`** — cada componente con todos sus estados, incluido el foco
  por teclado. Cada ficha muestra la pieza **viva** primero y las copias con el
  estado congelado después: si se separaran, se vería en la misma ficha. El
  cursor y la pastilla están montados de verdad, no en una ficha.

`data-forzado` es deuda de estas dos rutas y se va con ellas.

---

## 11. Decisiones que tomé yo — con su alternativa al lado

Ninguna de éstas la pidió la instrucción ni sale de una medición. **Las siete
son visuales y reversibles**, y quedan como están hasta que Valentino las juzgue
mirando `/v3/componentes`.

La columna de la derecha existe para eso: **cambiar cualquiera es editar un
valor, no abrir una discusión.** Cada fila dice dónde vive el valor.

| # | lo que decidí | alternativa, y dónde se cambia |
|---|---|---|
| 1 | **La simetría del margen al pie de la navegación**: la pastilla se separa 24px del borde inferior, lo mismo que después se separa del superior. Es lo único `[decidido]` de la derivación del umbral. | Cualquier otro token de espaciado en `--nav-margen-al-pie`, en `_estilos/navegacion.css`. El umbral se recalcula solo y el invariante se mueve con él. |
| 2 | **Los coeficientes de interpolación del cursor**: 0,22 el núcleo, 0,12 el halo. Lo medido es la RELACIÓN —el halo va por detrás— y eso sí se respeta; el coeficiente exacto no se midió porque hacía falta movimiento real sostenido. | `SEGUIMIENTO` en `_lib/cursor.ts`. Subir los dos acelera la persecución; acercarlos entre sí achica el retraso del halo. El invariante sólo exige que el del halo sea menor. |
| 3 | **El cursor usa tinta y borde, no acento.** No es preferencia: la instrucción pide que el color acompañe a la sección "con el bloque `[data-seccion="invertida"]` que ya existe", y ese bloque redefine `--color-tinta` y `--color-borde` y **no** `--color-acento`. Con el acento, el color no acompañaría a la sección. | `background-color` del núcleo en `_estilos/cursor.css`. Si se quiere acento, hay que decidir además qué pasa en la sección invertida, donde los tres dan 2,46–2,99:1. |
| 4 | **El marcador del enlace de navegación mide `--spacing-1`** (4px). La medición da su animación, no su tamaño. | `inline-size`/`block-size` del marcador en `_estilos/navegacion.css`. |
| 5 | **La sangría de la etiqueta de sección son 32px** (`--spacing-8`); la medida es 31px. No hay token de 31 y la unidad base del sistema es 4px. | La clase `pl-[var(--spacing-8)]` en `EtiquetaDeSeccion`, o `sangria={false}` para quitarla por instancia. |
| 6 | **El pie por defecto NO es invertido.** El de la referencia es oscuro, pero develOP invierte el tema por defecto y su escena es una sala clara: esa relación se da vuelta entera y hay que diseñarla, no asumirla. | La prop `invertido` de `Pie`. Es un booleano, no una reescritura: las mismas clases pintan las dos versiones. |
| 7 | **La fecha de baja de las rutas de demostración** (2026-12-31) es un tope que puse yo; el disparador real es el reemplazo del home. | Los tres encabezados de las rutas de demostración. |

**La octava decisión ya no es mía.** El `backdrop-filter` de la pastilla estaba
en esta lista como "no transferido por falta de token"; con la corrección
aprobada, el token existe y el desenfoque medido se aplica. Ver §12.

---

## 12. El token que faltaba — CORRECCIÓN A S0

**`--color-superficie-translucida` entró al sistema**, aprobado en la parada.

### Por qué es una corrección y no un token nuevo

S0 emitió `--blur-panel: 12px`, medido en la pastilla flotante de la referencia,
y **no emitió ninguna superficie sobre la cual ese desenfoque signifique algo**.
`backdrop-filter` sobre un fondo opaco no se ve. El sistema declaró un
desenfoque sin declarar sobre qué: un token muerto que parecía vivo, que es
exactamente la categoría contra la que advierte la cabecera de `theme.css`.

### La derivación, con el método de las tres superficies

Reproducir lo medido y corregir sólo lo que el piso de accesibilidad obligue:

| paso | | resultado |
|---|---|---|
| 1 | la única alfa clara **medida** en la referencia — el halo del cursor, `rgba(236,236,236,0.4)` | **0,4** |
| 2 | reproducida acá, tinta sobre el papel al 0,4 con el peor fondo detrás | **3,54:1** claro · **2,63:1** invertida — las dos **fallan** AA |
| 3 | se sube al mínimo escalón de la escala del sistema que pase en los **dos** sentidos | 0,5 pasa en claro (4,98:1) y **falla** invertida (3,54:1) |
| 4 | el escalón siguiente | **0,6 = `--opacity-casi`**, que ya estaba declarada |

**La alfa no se inventó: se eligió de la escala.** Y el piso lo fija el tema
oscuro, no el claro — eso también está afirmado.

### El peor caso, y por qué es ése

La pastilla flotante **no se invierte con lo que pasa por atrás**: su tema lo
fija su ancestro en el DOM, no lo que se ve a través. Una pastilla clara
viajando sobre una sección invertida es una configuración real, así que el fondo
peor caso de cada tema es el fondo del **otro**.

```
claro      #111111 sobre #9A9A99   (con #0E0E0E detrás)  →  6,7046:1   AA ✓
invertida  #F7F7F5 sobre #6B6B6A   (con #F7F7F5 detrás)  →  4,9735:1   AA ✓
sobre su propio papel, el caso cómodo                    →  17,6041:1
```

Los cinco números los produce `s3-papel-translucido.invariant.ts`, que compone
el color a 8 bits **antes** de medir —es lo que la pantalla pinta— con control
positivo sobre la alfa de 0,4, que tiene que fallar. Si esa afirmación pasara,
la de arriba no mediría nada.

### Lo que la corrección arrastró

- **`--blur-panel` dejó de estar muerto**: la pastilla ahora aplica
  `backdrop-filter: blur(var(--blur-panel))` sobre la superficie translúcida, y
  hay una afirmación de que los dos tienen consumidor.
- **Los invariantes de S1 se actualizaron**, y no subiendo un contador. Eso
  convertiría `tokens.invariant.ts` en un contador y dejaría entrar cualquier
  token futuro. Lo que se hizo es **nombrar la excepción**:
  `AGREGADOS_POR_S3 = ['--color-superficie-translucida']`. Un token nuevo que no
  sea ése sigue rompiendo la comprobación, con un control positivo que lo
  demuestra. `bundle.invariant.ts` pasó de 89 a 90.
- **`theme-develop.css` salió de la lista de intocables de `s3-frontera`**, y en
  su lugar entró una afirmación más filosa: se compara **token por token contra
  HEAD**, y lo que se afirma es que el único nombre nuevo es el declarado y que
  **ningún valor previo se movió**. Un token que cambia de valor en silencio es
  el peor cambio posible en ese archivo: no rompe nada, no da error, y mueve la
  mitad del sitio.

### El peso 300 — NO entra

Chivo lo tiene disponible (eje `wght` 100→900, y es el hueco que la familia
anterior no podía cubrir), pero el sistema declara cuatro pesos —400, 500, 600,
700— y no hay `--font-weight-ligero`. **Ninguna pieza construida lo necesita**:
revisé la columna de tokens del inventario para las nueve piezas del sprint y
ninguna consume `font-weight.ligero`.

Un token sin consumidor es exactamente lo que la corrección de arriba vino a
arreglar; emitir otro igual sería repetir el defecto. **Queda anotado como
disponible: entra el día que una pieza lo pida.**

---

## 13. Verificación

### 13.1 tsc, eslint, build

| comando | alcance | resultado |
|---|---|---|
| `.\node_modules\.bin\tsc.cmd --noEmit` | el repo entero | **exit 0** |
| `npx eslint src/app/v3` | el árbol del sprint | **exit 0**, cero errores y cero warnings |
| `npm run build` con `NODE_OPTIONS=--max-old-space-size=8192` | — | compiló y prerenderizó las 40 páginas — ver abajo |
| `npm run test:s3` | las diez estáticas | **288 afirmaciones, 0 fallas** |
| `npm run test:s3-peso` | sobre la salida del build | **19 afirmaciones, 0 fallas** |

**Sobre el build, con precisión.** La corrida que cuenta compiló en **6,3 min**,
generó las **40 páginas estáticas en 16,5 s** y emitió la tabla de rutas completa
con las cinco de `/v3` marcadas `○ (Static)`. `BUILD_ID`, `routes-manifest.json`
y `prerender-manifest.json` quedaron escritos, que es lo que Next sólo hace al
terminar bien.

#### El exit code que no capturé, y el defecto que lo explica

**En la primera corrida completa el código de salida numérico no quedó
escrito.** La causa está identificada y es reutilizable:

> En un `.cmd` de Windows, `echo VAR=%ERRORLEVEL%>>archivo` **no escribe nada**.
> Cuando `%ERRORLEVEL%` vale `0`, la línea queda como `echo VAR=0>>archivo` y
> `cmd` lee el `0>>` como una **redirección del descriptor 0** —stdin— en vez de
> como texto. El `echo` sale por consola y el archivo queda sin la línea.
>
> Se escribe con espacio, `echo VAR=%ERRORLEVEL% >>archivo`, o al revés,
> `>>archivo echo VAR=%ERRORLEVEL%`. Cualquier sprint que desacople un proceso
> largo con un `.cmd` va a tropezar con esto.

Es un defecto de **mi envoltorio**, no del build ni de las herramientas — y
tardé dos diagnósticos en verlo porque el síntoma es un archivo de log que
simplemente termina antes.

**Lo que hice mientras tanto es lo correcto y queda escrito como criterio:
preferir la evidencia indirecta a citar un `exit 0` que no se leyó.** La
evidencia de que ese build terminó bien son `BUILD_ID`, `routes-manifest.json`
y `prerender-manifest.json` —que Next sólo escribe al final— más la tabla de
rutas completa. Eso es verificable; un exit code inventado no lo es.

Con el envoltorio corregido, la corrida de cierre sí capturó los suyos:
`TSC_EXIT=0` y `ESLINT_EXIT=0`.

Hubo antes **dos corridas que no terminaron**, ninguna por el código de este
sprint. La primera la corté yo al darme cuenta de que había editado archivos
mientras compilaba. La segunda compiló bien —28,5 min— y se cayó al recolectar
datos de página con `0xC0000142`, que es agotamiento de recursos de Windows:
tenía `eslint` y otros procesos corriendo en paralelo contra 15 workers de Next.
La tercera, sola, pasó. El OOM preexistente que la instrucción declara conocido
no se investigó.

#### El control del propio `tsc`, y el procedimiento que deja

Para que "exit 0" signifique algo hay que saber que está mirando estos archivos.
Se inyectó un error de tipo deliberado en `_lib/cursor.ts` y `tsc` lo reportó
(`TS2322`, línea exacta); después se revirtió.

**Y se repitió al cerrar, por una razón concreta: la corrida pasó de siete
minutos a trece segundos.** Ese salto es indistinguible de un caché que no
revisó nada. Se inyectó el mismo error en el archivo **más nuevo**
—`s3-frontera.invariant.ts`, que no existía en la primera corrida— y `tsc`
volvió a reportarlo en la línea 244.

**EL PROCEDIMIENTO, para cualquier sprint futuro:**

> **Cada vez que un gate se acelere de forma sospechosa —caché incremental,
> `.tsbuildinfo`, un `--cache` nuevo, una corrida que baja de minutos a
> segundos— hay que probar que todavía muerde.** Se inyecta un error del tipo
> que ese gate existe para atrapar, en el archivo **más nuevo** del sprint, se
> verifica que lo reporte, y se revierte.
>
> No sirve inyectarlo en un archivo viejo: eso sólo demuestra que el gate mira
> lo que ya miraba. El archivo nuevo es el que un `include` mal armado, un
> caché viejo o un padrón desactualizado dejarían afuera.

Un gate que se volvió rápido y no se re-verificó es un gate que se puede haber
apagado sin que nadie se entere, y el verde se ve exactamente igual.

**Los dos errores de baseline, con precisión.** La instrucción declara conocidos
`TS2307 @googleapis/webmasters` y `react-hooks/set-state-in-effect` en
`PreloaderContext`. El primero **no apareció**: `tsc` corre sobre el repo entero
y salió limpio. El segundo es de eslint y vive fuera del árbol del sprint — ver
§13.5. Ninguno se investigó ni se tocó.

### 13.1 bis · EL CONTRAPESO DEL PADRÓN DE GIT — el check que estaba ciego

Va con sección propia porque es el hallazgo con más consecuencia del sprint, y
porque **es el check en el que se apoya correr dos sprints en paralelo**.

**Qué pasaba.** La raíz del repositorio es `C:3-chrome` y la aplicación vive
en `logic-core-v3/`, así que `git status --porcelain` y `git show HEAD:…` hablan
en rutas con ese prefijo, mientras los padrones del sprint las escriben sin él.
`s3-frontera.invariant.ts` comparaba

```
padrón      src/app/theme-develop.css
git status  logic-core-v3/src/app/theme-develop.css
```

No coincidían nunca. La afirmación **"ninguno de los archivos prohibidos fue
tocado" habría pasado en verde con el repositorio entero destruido.**

**Qué lo cazó.** No una relectura: un **contrapeso**. Exigir que los archivos
del propio sprint —que con certeza están tocados, porque son altas— aparezcan
en la lista de `git status`. Si el padrón y `git` no hablan el mismo idioma, ese
número da **cero**. Hoy declara `git status ve 35 de los 35 archivos del sprint`.

**LA REGLA GENERAL, para cualquier sprint futuro:**

> **Todo padrón que se compare contra rutas de `git` tiene que resolverse
> contra el TOPLEVEL del repositorio, no contra el directorio de trabajo.**
> Y no alcanza con poner bien el prefijo: hay que agregar el contrapeso que
> exige que el padrón encuentre lo que sabemos que está ahí. El prefijo se
> puede volver a romper —un worktree nuevo, un `cd`, un renombre de carpeta— y
> sólo el contrapeso lo nota.

Está escrita en la cabecera de `_lib/__tests__/s3-git.ts`, que es donde ahora
vive `git()`, `PREFIJO`, `enElRepo()` y `rutasTocadas()`. Cualquier instrumento
que hable con git pasa por ahí.

**Y hay una segunda ceguera de la misma familia**, encontrada el mismo día por
`s3-papel-translucido.invariant.ts`: `tokensDelTema()` recorría
`theme-develop.css` entero con último-gana, y como la sección invertida
redefine `--color-fondo` y `--color-tinta`, devolvía **el tema invertido
disfrazado de base**. El instrumento midió el contraste del papel contra sí
mismo y dio **17,99:1 en los dos temas**: una razón perfecta y completamente
falsa. Los instrumentos anteriores no lo habían notado porque sólo pedían
duraciones, espaciados y tamaños, que ningún bloque redefine. Ahora
`tokensDelTema()` lee **sólo el bloque `@theme`** y hay `tokensDelBloque()` para
los contextos.

Las dos tienen la misma forma: **un identificador que parece el mismo y no lo
es** —una ruta con prefijo, un token con contexto—. Las dos pasaban en verde.

### 13.2 Las once comprobaciones

Diez corren sin build (`npm run test:s3`); la undécima necesita `npm run build`
delante (`npm run test:s3-peso`).

| instrumento | afirmaciones | fallas | qué produce |
|---|---|---|---|
| `s3-tokens` | 23 | 0 | el padrón de 35 archivos · las 25 propiedades de componente y su reparto de evidencia |
| `s3-layout` | 25 | 0 | 32px de padding · 12/16 de canaleta · 140 de columna lateral · 768/860/1025 |
| `s3-tipografia` | 23 | 0 | cap height 686 · x-height 511 · unitsPerEm 1000 · −4,72% · cap/x 1,3425 |
| `s3-cta` | 34 | 0 | 1300/600/400/300 ms · 24→28 px · resta 4,0 px · 3 px · 14 car./3 pal. contra 28/5 |
| `s3-navegacion` | 38 | 0 | 48 px de pastilla · 96 px de descuento · 804 px a 900 de viewport |
| `s3-cursor` | 34 | 0 | 4 / 36 / 4 px · 400 ms · la tabla de verdad de las dos compuertas |
| `s3-foco` | 63 | 0 | 11 reglas de hover con paridad · 10 piezas interactivas · 12 archivos cubiertos |
| `s3-imagen` | 20 | 0 | 10 candidatos, los 10 con descriptor `w` · los tres `sizes` compuestos |
| `s3-papel` | 19 | 0 | 6,70:1 y 4,97:1 con el peor fondo detrás · la alfa medida de 0,4 falla · alfa 0,6 = `--opacity-casi` |
| `s3-frontera` | 29 | 0 | 8 prohibidos intactos · el tema cambió sólo en la corrección · `dependencies` idéntico a HEAD · 81 imports · 54 archivos bajo 300 líneas |
| `s3-peso` | 19 | 0 | 422,3 KiB gzip · 43 reglas y 10,3 KiB de CSS propio · 1 chunk perezoso · 34 utilidades |
| **total** | **307** | **0** | |

**Y los cinco invariantes de S1, que este sprint tocó**, porque le agregó un
token al archivo que guardan: `tokens` 48 · `fuentes` 29 · `compuerta` 27 ·
`superficies` 32 · `bundle` 23 — **159 afirmaciones, 0 fallas**. Con S3 son
**466 afirmaciones y 0 fallas**.

**`s3-frontera` encontró un defecto en sí mismo, y es el hallazgo más útil de
la corrida.** La raíz del repositorio es `C:\v3-chrome` y la aplicación vive en
`logic-core-v3/`, así que `git status --porcelain` habla en rutas con ese
prefijo y el padrón no lo llevaba: comparaba `src/app/theme-develop.css` contra
`logic-core-v3/src/app/theme-develop.css`, no coincidía nunca, y la afirmación
"ningún archivo prohibido fue tocado" **habría pasado en verde con el repo
entero destruido**. Lo cazó el contrapeso —exigir que los archivos del propio
sprint aparezcan en la lista de tocados—, no una relectura. Corregido: ahora
declara `git status ve 35 de los 35 archivos del sprint`.

#### Los controles positivos, uno por uno

Ninguna de estas comprobaciones puede quedar verde por vacío. Cada control corre
la **misma función** que hizo pasar la afirmación, contra una entrada
deliberadamente rota. La tabla los agrupa por lo que prueban; el conteo exacto
lo imprime la corrida, y está en §13.4.

| # | control | contra qué entrada |
|---|---|---|
| 1 | el detector de hex ve un color escrito a mano | `.x { color: #1D5B8F }` |
| 2 | el detector de funciones de color ve un `rgba()` | `.x { background: rgba(17,17,17,.1) }` |
| 3 | el detector de literales ve un padding en px | `padding-left: 32px` |
| 4 | y ve una duración suelta | `transition-duration: 1.3s` |
| 5 | el comparador ve una propiedad de componente sin registrar | `--inventada-por-nadie: 7px` |
| 6 | el detector de alcance ve un selector global | `button:hover { … }` |
| 7 | y lo ve en la segunda mitad de una lista de selectores | `[data-v3] .a:hover, button { … }` |
| 8 | el detector ve un breakpoint escrito a mano | `@media (min-width: 1025px)` |
| 9 | el detector ve una clase arbitraria con un px adentro | `px-[32px]` |
| 10 | el detector ve un relleno lateral fluido | `px-[5vw]` |
| 11 | y uno en px escrito a mano | `pl-[31px]` |
| 12 | el detector ve una columna con ancho fijo | `grid-cols-[300px_minmax(0,1fr)]` |
| 13 | el detector ve una canaleta escrita a mano | `gap-[14px]` |
| 14 | el comparador de costura ve un `clamp()` cuyo techo no coincide | techo 11px contra nivel 10px |
| 15 | el buscador de consumo ve un nivel que nadie usa | `text-nivel-que-no-existe` |
| 16 | el lector de métricas rechaza un archivo que no es WOFF2 | un `.ts` |
| 17 | **el rótulo accesible sin `aria-hidden` da 5 palabras** | el marcado real del CTA, sin la corrección |
| 18 | **y 28 caracteres, con las dos palabras fusionadas** | idem |
| 19 | la cuenta de palabras NO ignora un subárbol que no está oculto | dos copias sin `aria-hidden` |
| 20 | la resolución del intercambio depende del token, no de la cadena | `--duracion-rapida` movida a 100ms |
| 21 | el buscador de acento vería uno si estuviera | `color: var(--color-acento)` |
| 22 | **la compuerta del cursor no es un `false` constante** | el caso que SÍ monta |
| 23 | **y no es un `true` constante** | el ancho por sí solo |
| 24 | el detector ve un `cursor: none` | `body { cursor: none }` |
| 25 | y la utilidad de Tailwind equivalente | `cursor-none` |
| 26 | el buscador de `pointer-events` ve una parte que no lo apaga | una parte inexistente |
| 27 | la resolución del umbral depende de los tokens | `--spacing-6` movida a 40px |
| 28 | el buscador de señales de scroll ve una | `addEventListener('scroll', …)` |
| 29 | **el detector ve un `:hover` sin su gemelo de foco** | `[data-pieza=x]:hover { … }` |
| 30 | **y lo ve aunque la regla vecina sí tenga foco** | dos reglas, una con foco |
| 31 | el detector ve las tres formas de apagar el anillo | `outline: none` · `outline-width: 0` · `outline-style: none` |
| 32 | y la utilidad de Tailwind | `outline-none` |
| 33 | el buscador de focalizables ve uno que no está | `<div><span>…</span></div>` |
| 34 | **y no cuenta un `tabindex="-1"`** | `<div tabindex="-1">` |
| 35 | **ni un control deshabilitado** | `<button disabled>` |
| 36 | **ni un ancla sin `href`** | `<a data-pieza="x">` |
| 37 | el detector de recorte vería un botón adentro de la ventana | `<span data-parte="ventana"><button>` |
| 38 | el lector de descriptores distingue `w` de `x` | `/a.png 1x, /b.png 2x` |
| 39 | el escáner ve un uso de `<Imagen` sin `sizes` | un uso roto a propósito |
| 40 | el buscador vería el override de la escalera si estuviera | `images: { deviceSizes: […] }` |
| 41 | el extractor de reglas del sprint no se queda con las ajenas | una utilidad de Tailwind |
| 42 | el buscador de chunks no encuentra una marca inexistente | una marca inventada |
| 43 | **la misma búsqueda SÍ encuentra la sonda en la carga inicial** | la consulta de preferencia |
| 44 | el buscador de utilidades ve una clase que no existe | `text-nivel-que-no-existe` |
| 45 | **el filtro reconocería un archivo prohibido entre los tocados** | `theme-develop.css` en la lista |
| 46 | el comparador de dependencias vería un agregado | una dependencia inventada |
| 47 | el escáner de imports ve uno fuera de la lista blanca | `@prisma/client` |
| 48 | el detector de `any` lo ve | `const x: any = 1` |
| 49 | y el de `router.push` también | `router.push("/a")` |

Hay además **seis contrapesos**, que son controles al revés —verifican que el
detector SÍ ve lo que tiene que ver, no sólo que rechaza lo que no—:

- el detector de focalizables cuenta los tres casos que sí entran en el orden de
  tabulación;
- hay **11 reglas de hover** que la paridad tuvo que revisar (sin ese número,
  "cero fallas" sería compatible con cero reglas);
- hay **1 uso** de `<Imagen` que el escáner de `sizes` tuvo que mirar;
- **`git status` ve 35 de los 35 archivos del sprint** — el que encontró el
  error de prefijo;
- el escáner de imports miró **81 imports**;
- la misma búsqueda de chunks SÍ encuentra la sonda en la carga inicial (§13.3);
- el comparador del tema leyó **89 tokens en HEAD y 90 ahora**.

### 13.3 Peso — qué le agrega este sprint a los 422,0 KiB gzip de S1

**La respuesta corta: +2,2 KiB gzip, y ninguno es JavaScript propio.**

| | crudo | gzip | archivos |
|---|---|---|---|
| S1 midió en `/v3` | 1385,8 KiB | **422,0 KiB** | 24 |
| **S3 mide en `/v3`** | 1386,4 KiB | **422,3 KiB** | **24** |
| diferencia de JS | +0,6 KiB | **+0,3 KiB** | **0** |

**Los mismos 24 archivos.** Este sprint **no monta ninguna pieza en `/v3`** —el
home nuevo es del sprint de secciones— así que no agrega un chunk. Los 0,3 KiB
son el chunk del layout, que cambió porque ahora importa las cinco hojas.

Lo que sí agrega es **CSS**, y ahí está la cifra que importa:

| | crudo | gzip |
|---|---|---|
| CSS servido de `/v3`, total | 519,3 KiB | 67,4 KiB |
| **del cual, reglas de S3** | **10,3 KiB** | **1,9 KiB** |

Las **43 reglas** del sprint se aíslan del CSS servido por sus propios atributos
(`data-pieza`, `data-parte`, `data-forzado`) y se pesan aparte — no es una
estimación, es una extracción, con control positivo que verifica que el
extractor no se queda con reglas ajenas.

**Total que S3 le suma a la carga inicial de `/v3`: 2,2 KiB gzip** (0,3 de JS +
1,9 de CSS), sobre los 422,0 de S1. El 99,7% heredado del layout raíz que S1
diagnosticó sigue igual, y sigue sin ser de este sprint.

**Las dos rutas de demostración, aparte** —su peso se va con ellas:

| ruta | crudo | gzip | propio de la ruta |
|---|---|---|---|
| `/v3/componentes` | 1392,0 KiB | 424,3 KiB | 5,6 KiB · 1 archivo |
| `/v3/tipografia` | 1386,4 KiB | 422,3 KiB | 0 |
| `/v3/tipografia/muestra` | 1386,4 KiB | 422,3 KiB | 0 |

Las cinco rutas de `/v3` quedaron **prerenderizadas como estáticas** (`○` en la
tabla del build), incluidas las tres nuevas.

**La compuerta del cursor, sobre la salida del build.** La marca vive en
**exactamente 1 chunk** (`static/chunks/7983.…js`) y **no está** en la carga
inicial de `/v3/componentes`, que es la ruta que lo monta, ni en su HTML
servido. Con los dos controles que hacen que eso signifique algo: uno verifica
que el buscador no encuentra una marca inventada, y el otro —el que importa—
que **la misma búsqueda SÍ encuentra una sonda que está en la carga inicial**.
Sin ese segundo control, "no lo encontré" y "no sé buscar" serían
indistinguibles.

**Las 34 utilidades del sistema que el sprint escribe tienen regla emitida** en
el CSS servido, y las media queries de 768px y 1025px existen. Es la
comprobación contra el peor tipo de error: una clase que Tailwind no generó deja
el atributo en el HTML, no da error en consola, no la caza el tipado ni el
linter, y la página se ve "casi bien".

### 13.4 El conteo de la corrida

Los tres números los imprime la corrida, no los cuento yo: cada `ok` es una
línea, cada control rotula la suya con `[control positivo]`, y `cerrar()` se
niega a salir en verde si un instrumento hizo cero afirmaciones.

```
S3   11 instrumentos, los 11 en exit 0   307 afirmaciones   0 fallas   55 controles
S1    5 invariantes, los 5 en exit 0     159 afirmaciones   0 fallas
                                         ───────────────
                                         466 afirmaciones   0 fallas
```

Los cinco de S1 se corren porque este sprint **tocó el archivo que guardan**.
Dos de sus afirmaciones había que actualizar, y una de las dos es un hallazgo:
S1 afirmaba que las seis expresiones fluidas se podaban sin `@theme static`
porque **ningún componente las consumía todavía**. Ya no es cierto — S3
construyó la tipografía y las seis tienen consumidor. La afirmación no se
borró: se dio vuelta, y el testigo de que la poda sigue siendo real pasó a ser
`--radius-medio` y `--radius-fuerte`, que son los que ahora quedan sin consumir.

Ninguno de los once puede quedar verde por vacío: además de los 55 controles,
seis afirmaciones son contrapesos que publican el tamaño de lo que revisaron
—35 archivos, 11 reglas de hover, 10 piezas interactivas, 81 imports, 1 uso de
`<Imagen>`, 35 de 35 archivos vistos por `git`— para que "cero fallas" no sea
compatible con "cero casos".

### 13.5 El alcance de eslint

`npx eslint src/app/v3` — el árbol que este sprint escribió: **exit 0, cero
errores y cero warnings**, con la salida entera vacía. Es el mismo alcance que
declaró S1 ("`npx eslint` sobre lo tocado"), y lo digo porque no es el repo
entero.

El baseline de eslint que la instrucción declara conocido
—`react-hooks/set-state-in-effect` en `PreloaderContext`— vive fuera de ese
alcance: `src/context/PreloaderContext.tsx` es uno de los seis archivos
congelados y este sprint no lo lee ni lo lintea. No se investigó ni se tocó.

### 13.6 Lo que este sprint NO tocó, medido

`s3-frontera.invariant.ts` lo produce con `git`, no de memoria:

- **los 8 archivos prohibidos, intactos** — `/v3/page.tsx`, el home, y los
  seis congelados (`HeroArtifact`,
  `TransitionContext`, `PreloaderContext`, `schema.prisma`, `auth.ts`,
  `lib/prisma.ts`), más los cinco directorios (`probe-escena/`, `home-intro/`,
  `setter/`, `leados/`);
- **`theme-develop.css` comparado token por token contra HEAD**: 89 antes, 90
  ahora, el único nombre nuevo es la corrección declarada y ningún valor previo
  se movió — con control positivo que mueve `--color-fondo` y lo detecta;
- **`dependencies` y `devDependencies` idénticos a HEAD**, byte a byte. Los
  únicos cambios de `package.json` son **12 scripts nuevos**, y ningún script
  previo se modificó;
- **81 imports** revisados uno por uno: ninguno fuera de una lista blanca de
  nueve módulos (`react`, `react-dom/server`, `next/*`, `lucide-react`,
  `@/lib/utils`) más relativos y `node:*`;
- **cero** `prisma`, `PrismaClient`, `OsLead*`, `ActivityChannel`, `/setter`,
  `/leados`, `router.push` y `any`;
- **54 archivos** —los 35 del sprint más los 19 instrumentos— y ninguno pasa las
  300 líneas. El más largo es `s3-frontera.invariant.ts`, con 274. Ese límite lo
  hizo cumplir el propio instrumento: se pasó a 301 líneas al agregarle la
  comparación del tema, se cayó a sí mismo, y la plomería de `git` salió a
  `s3-git.ts`.

---

### 13.7 Archivos y `git status`

`git status --porcelain` devuelve **39 entradas** —5 modificadas y el resto
altas, con los directorios nuevos colapsados en una línea—. Contados de verdad
son **55 archivos nuevos**: los 35 del sprint, los 19 instrumentos y este
reporte.

Los **5 modificados**, uno por uno:

| archivo | qué cambió |
|---|---|
| `package.json` | 12 scripts nuevos; dependencias idénticas a HEAD |
| `src/app/v3/layout.tsx` | 5 `import` de las hojas del chrome |
| `src/app/theme-develop.css` | la corrección aprobada: `--color-superficie-translucida`, en el tema claro y en la sección invertida (§12) |
| `_lib/__tests__/tokens.invariant.ts` | la excepción **nombrada** del token nuevo, y la afirmación de la poda dada vuelta porque S3 le dio consumidor a la escala fluida |
| `_lib/__tests__/bundle.invariant.ts` | 89 → 90 tokens en el CSS servido |

| | |
|---|---|
| **modificados** | `package.json` (11 scripts) · `src/app/v3/layout.tsx` (5 `import` de hojas) |
| hojas del chrome | `_estilos/` — `cta.css` · `navegacion.css` · `cursor.css` · `pie.css` · `foco.css` |
| componentes | `_componentes/chrome/` (7) · `layout/` (2) · `tipografia/` (2) · `medios/` (1) |
| datos y hooks | `_lib/` — `cta.ts` · `cursor.ts` · `imagen.ts` · `marcaCursor.ts` · `navegacion.ts` · `tipografia.ts` · `usePrefiereMenosMovimiento.ts` |
| rutas de demostración | `componentes/` (page + 6 bloques) · `tipografia/` (page + muestra + 2 bloques) |
| instrumentos | `_lib/__tests__/` — 11 invariantes `s3-*.invariant.*` más 8 de apoyo (`s3-archivos`, `s3-calc`, `s3-css`, `s3-escaneo`, `s3-git`, `s3-piezas`, `s3-registro-de-tokens`, `s3-woff2`) |
| **corrección a S0** | `src/app/theme-develop.css` (§12) y los dos invariantes de S1 que lo guardan: `tokens.invariant.ts` y `bundle.invariant.ts` |
| reporte | `docs/rediseno/outputs/S3-CHROME.md` |

Nada fuera de `src/app/v3/`, `src/app/theme-develop.css`, `package.json` y este
documento.

---

## 14. Lo que queda para el sprint de secciones

1. **Montar el chrome en `/v3`.** La pastilla, el cursor y el pie existen y no
   están puestos en el home nuevo: `/v3/page.tsx` es del sprint de secciones y
   este sprint tenía prohibido tocarlo.
2. **Las tres familias de tarjeta** —nota, proyecto en grilla, proyecto de
   caso—, que el inventario lista y este sprint no construyó porque no están
   entre las piezas que la instrucción enumera. Comparten propiedad, duración y
   curva de hover y sólo difieren en la magnitud del `scale`: 1,25 / sin efecto /
   1,05.
3. **El panel de contacto** (`form` fijo de 820×767 que a 390 va a sangre), el
   chip de etiqueta, la pastilla de opción de formulario y el campo de texto del
   panel. Todos del inventario, ninguno enumerado en esta instrucción.
4. **El menú de superposición**, que la medición nunca abrió: sus componentes no
   están inventariados (`COMPONENTS.md`, hueco 5).
5. **El contenido**: copy, fotos, videos, métricas, precios. El componente de
   imagen está listo y espera un `src`.
6. **La decisión del recorrido de superficies**: cuál de las ocho secciones va
   invertida, y si el pie va oscuro.
7. **Borrar `/v3/tipografia`, `/v3/componentes`, `_bloques/` y el atributo
   `data-forzado`** cuando /v3 reemplace al home.
8. **Los dos tokens que faltan** (§12), si Valentino los quiere.
