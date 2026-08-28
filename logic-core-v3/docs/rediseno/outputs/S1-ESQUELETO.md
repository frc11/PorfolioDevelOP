# S1 — El esqueleto · reporte de cierre

**Fecha:** 2026-08-28 · **Rama:** `rediseno/cimientos` · **Worktree:** `C:\v3-cimientos`
**Instrucción:** `docs/rediseno/sprints/S1-esqueleto.md`

Toda cifra de este documento tiene un instrumento en el repo que la produce (regla 11). La tabla cifra → instrumento está al final.

---

## Qué quedó construido

`/v3` — el esqueleto del sitio nuevo: **un canvas permanente a viewport completo con ocho paneles de DOM deslizándose encima**. Sin contenido, sin animación, sin escena 3D, sin GSAP, sin Lenis, sin Sanity.

```
<div data-v3>              ← el piso de papel
  <EscenarioCompuerta/>    ← canvas fijo, viewport completo, z-0, detrás de la compuerta de 1025
  <main>                   ← el flujo del documento, z-10
    <Panel superficie="…"> × 8
```

El home actual, `/probe-escena` y `home-intro/` no se tocaron.

---

## Los tres gates

| gate | resultado |
|---|---|
| `.\node_modules\.bin\tsc.cmd --noEmit` | **exit 0**, cero errores (ni siquiera el baseline `TS2307 @googleapis/webmasters`, que en este `node_modules` no aparece) |
| `npx eslint` sobre lo tocado | **exit 0**, cero errores, cero warnings |
| `npm run build` (`NODE_OPTIONS=--max-old-space-size=8192`) | **exit 0**. `/v3` y `/v3/control-estatico` prerenderizadas como estáticas |
| `npx prisma migrate status` | `Database schema is up to date!` — este sprint no tocó base de datos |

`npm run test:s1` — **156 afirmaciones, 0 fallas**, repartidas en cinco invariantes:

```
tokens        45 afirmaciones, 0 fallas
fuentes       29 afirmaciones, 0 fallas
compuerta     27 afirmaciones, 0 fallas
superficies   32 afirmaciones, 0 fallas
bundle        23 afirmaciones, 0 fallas
```

---

## La compuerta de 1025, sobre la salida del build

**Estructural, no cosmética.** `next/dynamic` + `ssr: false` detrás de un `useSyncExternalStore` sobre `matchMedia('(min-width: 1025px)')`. Abajo del umbral el componente devuelve `null`, el `import()` no se ejecuta y el chunk no se pide.

Se verifica leyendo los `<script src>` del **HTML prerenderizado** de cada ruta, no un manifiesto: ese HTML es lo que el servidor manda y lo que el navegador pide en el primer viaje. *(`app-build-manifest.json` dejó de existir en Next 16.2.9 — se intentó primero y no está.)*

| afirmación | resultado |
|---|---|
| **A1** la MARCA existe en la salida | en 2 chunks — el buscador no está ciego |
| **A2** la MARCA **no** está en la carga inicial de `/v3` | 0 de 24 archivos · tampoco en `v3.html` |
| **A3 — control positivo** la MARCA **sí** está en `/v3/control-estatico` | `app/v3/control-estatico/page-16808a5d67a85922.js`, y además en su HTML |

**El control positivo es la mitad del sprint.** Hoy el escenario es un marcador de posición: sin A3, A2 pasaría en verde aunque el escenario no existiera. La ruta gemela importa **el mismo módulo** de forma **estática**, en el **mismo build**, y la comprueba **la misma función**.

**No hubo contaminación del instrumento:** la ruta de control agrega **exactamente un archivo** sobre `/v3`. Si webpack hubiera hoisteado el módulo a un chunk compartido, `/v3` habría quedado sucia — y eso se habría reportado como falla, nunca como verde. El plan B (build aislado con `E2E_DIST_DIR=.next-s1-control`, ya en `.gitignore`) no hizo falta.

### Peso del bundle inicial

| | crudo | gzip | archivos |
|---|---|---|---|
| **abajo de 1025** | **1385,8 KiB** | 422,0 KiB | 24 |
| **arriba de 1025** | **1386,9 KiB** | 422,7 KiB | 24 + 1 chunk perezoso |
| el chunk perezoso del escenario | 1132 B | 663 B | — |

### ⚠️ El presupuesto de JS **no se cumple**, y no es de /v3

`JS < 300 KB` contra **422,0 KiB gzip** (1385,8 KiB crudo). El **99,7% es heredado del layout raíz**; lo propio de `/v3` es un archivo de 4,5 KiB.

**Queda como pendiente con nombre propio, abajo:** *"El presupuesto de JS — sacar el chrome viejo del layout raíz"*. Ahí está la causa, la lección y la salida.

### Sin salto de layout, sin discrepancia de hidratación

- **Salto:** el escenario vive en `fixed inset-0 z-0 pointer-events-none`. **No ocupa lugar en el flujo**, así que montarlo o desmontarlo no puede mover un panel. Abajo del umbral se renderiza `null`, no un placeholder con caja. El invariante afirma sobre la constante `CLASES_FUERA_DE_FLUJO` que no hay ninguna clase de alto, ancho, margen ni padding.
- **Hidratación:** `getServerSnapshot` devuelve `false`, y React lo usa también en el render de hidratación. `renderToStaticMarkup(<EscenarioCompuerta/>)` da **cadena vacía**, medido. Nunca se lee `window` durante el render.

---

## Los tokens: `@theme static`, y una cifra de S0 retractada

**Medido por el pipeline real** (`@tailwindcss/postcss` 4.3.1 sobre este `globals.css`), con el detector verificado por control positivo antes de creerle un número:

| variante | ausentes del `:root` | `.bg-fondo` | `.text-acento` |
|---|---|---|---|
| `@theme static` | **0 / 89** | `var(--color-fondo)` ✔ | `var(--color-acento)` ✔ |
| `@theme` a secas | **21 / 89** | `var(--color-fondo)` ✔ | `var(--color-acento)` ✔ |
| `@theme inline` | 33 / 89 | `#F7F7F5` ✘ | `var(--color-acento-web)` ✘ |

La fila `inline` **confirma** la Medición 3 de S0 en un segundo entorno: el override contextual no llega. Nunca se usa.

**El 21 no es una constante, y ése es el hallazgo.** La poda es por **uso**. Se comprobó en carne propia: al escribir tres nombres de token como literales dentro del invariante —que vive en `src/`, o sea que Tailwind lo escanea— esos tres dejaron de podarse y el conteo bajó de 24 a 21 **sin tocar una línea del tema**. Sin `static`, qué contiene el sistema de diseño en el navegador es función de qué componentes existan ese día.

La retractación completa, con la causa del error de S0, está en `docs/rediseno/s0/REPORTE-S0.md` — buscar *"RETRACTADO POR S1"*.

### La orden de retractar, y por qué no se cumplió literal

**Esto se deja escrito porque es lo que tiene que pasar cuando el gate se equivoca.**

La orden de Valentino en la Parada 1 fue textual:

> *"CORREGÍ REPORTE-S0.md: publicó que 4.3.1 no poda y en esta configuración es falso — **80 de 89**. Escribí por qué se equivocó (su proyecto de prueba usaba las utilidades que medía, así que no había nada que podar) y cuál es la cifra que vale. Es una cifra publicada que no se sostiene y este proyecto las retira."*

**La orden se dio sobre un número mío que era un artefacto.** Los 80 de 89 salieron de la API `compile()` de `tailwindcss/dist/lib.mjs`, que **no escanea el proyecto**: sin candidatos, poda casi todo. Ejecutar la corrección tal como venía habría reemplazado una cifra publicada que no se sostiene por otra que tampoco.

Lo que se hizo en su lugar: **seguir midiendo antes de escribir**. La salida real del build de S0 mostraba sus dos tokens sin referencias vivos en el `:root` —o sea que su medición tampoco era inventada—, y eso obligó a buscar la vía correcta. Recién con `@tailwindcss/postcss` sobre este `globals.css`, con el detector verificado por control positivo y variando el `from` por corrida, salió el número que vale: **21 de 89, y no es una constante**.

**Tres cosas de la orden se cumplieron y una no:**

- ✅ La cifra publicada se retiró, con aviso en la cabecera del reporte y marca en la tabla de la regla 11.
- ✅ Quedó escrito por qué S0 se equivocó — y la causa que da el reporte es **más precisa** que la de la orden: no es que su fixture usara todo, es que su experimento **quitó dos clases y un consumidor** de un fixture donde todo lo demás seguía en uso, así que el delta no tenía cómo dar distinto de cero. Midió bien y generalizó de más.
- ✅ Se escribió cuál es la cifra que vale.
- ❌ **No se escribió el 80.** La cifra de la orden no entró al reporte, y en su lugar entró la medida por el pipeline real, con la nota de método sobre el arnés que casi publica el error en espejo.

Un gate que ordena escribir un número no convierte ese número en verdadero. La orden era retirar una cifra que no se sostiene; cumplirla al pie habría sido publicar otra.

### Las cinco diferencias contra el archivo de S0

Verificadas línea por línea contra `docs/rediseno/s0/theme-develop.css`, que se conserva sin tocar como original. **Salen 14 líneas, entran 18** (14 de reemplazo + 4 de la regla de foco; su `}` de cierre ya existía).

| # | cambio | aprobado en |
|---|---|---|
| 1 | `@theme` → **`@theme static`**. `static` no es `inline`: conserva la indirección `var()` | Parada 1 |
| 2 | `--font-mono` → **`--font-codigo`**. Única colisión de los 89 contra los 93 de `globals.css`. Sin renombrar, `font-mono` se rompía en admin, dashboard y landings | Parada 1 |
| 3 | Las tres familias apuntan a **`var(--font-v3-chivo…)`**, la variable que genera `next/font/local` | Parada 1 |
| 4 | Los nueve `--spacing-*` pasan de **px a rem** | Parada 1 |
| 5 | **`--text-base` pasa de `16px` a `1rem`** | Parada 2 |

### Los CAMBIOS 4 y 5 son el mismo defecto, verificados igual

Las nueve equivalencias de espaciado, las quince utilidades afectadas y `--text-base` computan **el mismo píxel** con raíz 16. Cada uno con su control positivo: una equivalencia mal hecha tiene que hacer fallar el comparador.

Y la escala dinámica sobrevive — confirmado contra el CSS que se sirve:

```
.p-4{padding:var(--spacing-4)}            ← declarado, consume el token
.p-7{padding:calc(var(--spacing) * 7)}    ← no declarado, sigue en la fórmula
```

**El defecto, en una frase:** `--spacing-*` y `--text-base` son los únicos tokens de S0 que caen en nombres que Tailwind ya usa. En px dejaban la escala **mezclada en especie** —`p-4` en px contra `p-7` en rem, `text-base` en px contra `text-sm` en rem, en la misma pantalla— y solo los declarados dejaban de escalar con el tamaño de fuente del navegador. Eso es peor que cualquiera de las dos escalas puras: es un bug latente que solo aparece cuando alguien agranda la tipografía del sistema.

**No cambia un valor de S0.** Con raíz de 16px las equivalencias son exactas. Lo que Franco midió es el número; el px es implementación, no contrato — la misma distinción que S0 ya aplicó a `--color-borde-fuerte`, donde transfirió la **razón** de contraste y volvió a derivar el alfa en vez de copiarlo.

El CAMBIO 5 es además el más conservador de los cinco: no pisa el defecto de Tailwind, lo **restituye**.

**Historia del 5, porque importa para el método:** en la Parada 2 este token se reportó **anotado y no cambiado**, con su disparador escrito. La Parada 1 había fallado sobre `--spacing-*` y sobre éste no hubo decisión — y un valor de S0 no se cambia por analogía. La decisión llegó en la Parada 2 y recién ahí se aplicó.

---

## Las tres superficies, y el contraste

| valor | qué hace | cómo |
|---|---|---|
| `papel-opaco` | fondo papel sólido | `bg-fondo text-tinta` |
| `papel-transparente` | el canvas se ve | sin fondo, `text-tinta` |
| `oscuro-opaco` | sección invertida sólida | `data-seccion="invertida"` + las mismas clases |

`oscuro-opaco` **no cuesta un token**: usa el bloque `[data-seccion="invertida"]` que S0 ya trae. Y el anillo de foco se da vuelta solo, porque `--color-foco` es `var(--color-tinta)`.

Los tres modos se **renderizan** en el invariante y se compara el marcado: los tres salen distintos, y ninguno contiene un hex suelto.

**LAS OCHO SECCIONES ARRANCAN EN `papel-opaco`.** La decisión estética es de Valentino y este sprint no la toma. Cambiar el recorrido es editar ocho valores en `_lib/secciones.ts`.

### Contraste de la tinta sobre el canvas de prueba, en modo transparente

```
tinta #111111 sobre --color-superficie-2 (#E8E8E6)   15,3910:1
tinta #111111 sobre --color-superficie-3 (#DBDBD9)   13,6197:1   ← peor caso
```

**Peor caso 13,62:1 — pasa AAA (7:1) con holgura.** Ningún panel transparente queda condicionado por el contraste con este canvas.

⚠️ **La cifra vale para el marcador de posición, que es plano y pinta dos tokens.** La escena real es una sala con gradiente y **no hereda este número**: hay que volver a medirlo cuando entre.

Controles de la calculadora: negro/blanco **21,0000**, un color contra sí mismo **1,0000**, y reproduce las dos cifras publicadas por S0 — tinta/papel **17,6041** contra su 17,60, papel/invertida **17,9970** contra su 18,00.

### El anillo de foco: alcance acotado, con su número

La regla de `:focus-visible` se emite **ahora**, no cuando haya componentes. Pero está acotada al árbol de `/v3` con `[data-v3]`, y no es prudencia: `--color-foco` vale `#111111` y el portal es `zinc-950` (`#09090B`). Un anillo `#111111` ahí da **1,0536:1** — invisible. Una regla verdaderamente global cambiaría el foco de admin y dashboard por uno que no se ve, en un sprint cuya primera regla es no tocar el sitio vivo.

Sobre claro el anillo da **13,62:1** peor caso y sobre la sección invertida **18,00:1**: pasa 3:1 en los dos sentidos.

**Globalizarla es sacar `[data-v3] ` del selector — una edición, sin lógica nueva. Y NO se puede hacer hasta que el portal deje de ser `zinc-950`**, porque `#111111` sobre `#09090B` da **1,0536:1**: el anillo existiría en el CSS y sería invisible en pantalla, que es peor que no tenerlo — un indicador de foco que no se ve pasa las auditorías automáticas y falla con la persona.

Las dos salidas, cualquiera de las dos alcanza:

- que el portal adopte la base clara de develOP, y entonces `--color-foco` (= la tinta) funciona ahí igual que en `/v3`;
- o que se emita un `--color-foco` propio del tema oscuro, con ≥3:1 sobre `#09090B`.

Hasta entonces el alcance acotado no es una limitación del sprint: es la única forma correcta de emitir esta regla hoy.

---

## Las fuentes

`next/font/local` con **los binarios exactos de S0**, subset `latin`, variables (`weight: '100 900'`, eje `wght`, con el peso 300 que el sistema de Franco no tenía), `display: 'swap'`.

| archivo | bytes | sha256 (verificado contra el manifiesto de descarga de S0) |
|---|---|---|
| `chivo-latin.woff2` | 33.252 | `4b1f32027ce991997893f63a6b3bfd6ed887f1628b7baa2d3390d86bc67f6e28` |
| `chivo-mono-latin.woff2` | 26.380 | `aa138151dbaaf3a008469af5fd30d1e917b67d2b645dec435586f5a144082d1b` |

Control positivo: el mismo comparador contra una copia con **un byte cambiado** falla.

**Solo el subset `latin`:** el `css2` capturado por S0 muestra que cubre `U+0000–U+00FF …`, y los 18 caracteres del español rioplatense caen adentro. `next/font/local` no permite declarar `unicode-range` por cara, así que incluir `latin-ext` y `vietnamese` sería peso muerto sin forma de acotarlo.

### Por qué se tocó `.gitattributes` (no estaba en el plan de la Parada 1)

`core.autocrlf` está en **`true`** en este checkout, y **toda la trazabilidad del sistema tipográfico se apoya en el sha256 exacto** de estos dos archivos contra el manifiesto de descarga de S0. Git detecta binarios solo —los woff2 tienen NUL— pero eso es una heurística, no un contrato: sin declararlo, un byte convertido en un clon rompe la cadena entera y el invariante lo reporta como fuente adulterada cuando en realidad fue el checkout.

Se declaró explícito `*.woff2`, `*.woff`, `*.ttf` y `*.otf` como `binary`. Verificado con `git check-attr`: `binary: set`, `text: unset`.

---

## Lo que hay que saber para lo que sigue

### PENDIENTE · El presupuesto de JS — sacar el chrome viejo del layout raíz

**Es un sprint aparte, y toca el sitio vivo.**

```
presupuesto        JS < 300 KB
medido en /v3      422,0 KiB gzip  ·  1385,8 KiB crudo   → NO CUMPLE
   heredado del layout raíz   1381,3 KiB crudo   (23 de 24 archivos · 99,7%)
   propio de /v3                  4,5 KiB crudo   ( 1 de 24 archivos)
```

**La causa, con nombre y apellido:** el layout raíz importa **estáticamente** `Navbar`, `Shutter`, `Preloader`, `Lenis` (vía `SmoothScroll`), `sonner` y el widget de chat. `PublicOnlyComponents` los apaga en tiempo de ejecución para `/v3` —devuelve `null`— pero el import estático ya metió los chunks en la carga inicial de **toda ruta**.

> **La lección: apagar un componente no lo saca del bundle. Es la compuerta al revés.**
>
> `/v3` gasta 1,35 MB en código que decide, en el navegador, no renderizarse. Es exactamente el mecanismo que la compuerta de 1025 existe para evitar — y está pasando una capa más arriba, en el layout que /v3 hereda.

**La salida es import dinámico en el layout raíz:** el chrome público detrás de `next/dynamic`, igual que el escenario. Lo que hoy es un `if` en tiempo de render pasa a ser un `import()` que no se ejecuta.

No se hizo acá porque este sprint tiene prohibido tocar el layout raíz, y ese cambio afecta al home, a las landings y al portal. **El presupuesto se vuelve alcanzable en el sprint que reemplace al home**, o antes si se decide hacerlo solo.

Mientras tanto `bundle.invariant.ts` afirma lo que este sprint sí controla —**5,6 KiB** propios, chunk perezoso incluido— e impone una **línea de base de regresión de 1400 KiB** sobre el heredado, para que el chrome viejo no engorde en silencio. El total se imprime con veredicto **NO CUMPLE**, sin maquillar: nadie tiene que poder leer un verde y creer que el presupuesto se cumple.

`LCP < 2,5s` y `Lighthouse ≥ 80` **no se midieron**: requieren navegador, y el marco del sprint lo prohíbe.

### Deuda con fecha de baja

**`/v3/control-estatico` se borra cuando `/v3` reemplace al home.** Es un instrumento y no puede quedar vivo en producción. Al borrarla hay que borrar también la afirmación A3 de `bundle.invariant.ts`, o —mejor— reemplazarla por el control con build aislado, que no deja ruta. Lleva `noindex, nofollow, nocache`, igual que `/v3`.

### Para el lane de motion

- **La decisión pendiente NO es "sumar Lenis".** Lenis ya está instalada y es global en todo lo que no sea portal: `/v3` la heredaba sin que nadie la eligiera. La decisión es **"dejarla en /v3 o sacarla"**. Este sprint la excluye de `/v3` (`SmoothScroll.tsx`) para que el pinneado se pueda juzgar **sin una línea de JS**, que es la afirmación que hay que poder verificar. Incluirla habría cerrado la decisión por omisión.
- **El pinneado es CSS `sticky` y sobrevive abajo de la compuerta.** Servicios: 300svh de recorrido con un hijo `sticky` de 100svh → 200svh de pin. Cambiar cuánto dura es cambiar `alto` en `secciones.ts`.
- **Condición frágil, sin error en consola:** `position: sticky` muere si cualquier ancestro tiene `overflow` distinto de `visible`. Se verificó que la cadena está limpia hoy (`globals.css` no declara `overflow` en `html` ni `body`). Quien agregue un `overflow-hidden` arriba rompe el pinneado en silencio.
- **La compuerta ya existe.** El peso de la coreografía tiene dónde entrar sin colarse en el bundle base.

### Anotado y no cambiado

- **`/v3` sirve las dos familias**: la de Google (que baja por el layout raíz en toda ruta) y la local. Se resuelve solo el día que `/v3` reemplace al home y el layout raíz pase a `next/font/local`.
- **El `REPORTE-S0.md` de `C:\develop-v3-cimientos\` sigue con la afirmación vieja.** La corrección se escribió sobre la copia del repo, que es la que se commitea y la que va a leer el que venga. La copia de afuera está fuera del alcance de este sprint.

### PENDIENTE · `--text-base` — resuelto en la Parada 2

Ya no es pendiente: pasó a `1rem` (CAMBIO 5). Se deja la entrada para que el rastro quede: se reportó anotado y sin tocar, con su disparador, y la decisión llegó con el cierre.

---

## Tres modos de falla nuevos, para los sprints que siguen

**Los tres son de INSTRUMENTO, no de código. Los tres los encontraron los controles positivos.** Van ordenados de más general a más específico: el primero aplica a cualquier medición de CSS, el segundo a cualquier medición hecha desde adentro del proyecto que se mide, el tercero a las mediciones de poda.

### 1. `@tailwindcss/postcss` cachea por ruta `from`

**Cualquier medición futura que compare variantes de CSS tiene que variar el `from`, o el resultado es el de la primera corrida.**

Se procesaron tres variantes de `@theme` —`static`, a secas e `inline`— con el mismo `from`. Las tres devolvieron **el mismo CSS**: el de la primera. El plugin cachea por ruta de entrada y no ve que la cadena cambió, porque su modelo mental es un archivo en disco que se recompila cuando cambia, no un string que le pasás.

El síntoma es un **falso negativo perfecto**: las tres variantes dan el mismo número, y ese número dice *"no poda"*. Es exactamente la conclusión equivocada de S0, alcanzada por un camino completamente distinto — y por eso casi la confirma en vez de corregirla.

Lo cazó el control positivo del detector: se borró un token del tema y el detector lo vio ausente **también en las corridas siguientes**, donde el token estaba. Una ausencia que se propaga hacia adelante es la firma de un caché.

> **Regla:** al comparar variantes de una hoja de estilos por PostCSS, `from` distinto por corrida. Y antes de creerle a cualquier número, correr el detector contra una entrada mutilada.

### 2. El instrumento contamina el sujeto: nombrar un token lo rescata de la poda

**Vale para toda medición de poda hecha desde adentro del proyecto que se escanea.**

Tailwind escanea `src/` entero para juntar candidatos. Los invariantes viven en `src/app/v3/_lib/__tests__/`. Al escribir `'--radius-pastilla-l'`, `'--ease-principal'` y `'--grilla-canal-compacto'` como literales dentro de una afirmación, **esos tres dejaron de podarse**: el conteo bajó de **24 a 21 sin tocar una línea del tema**.

El instrumento estaba creando lo que medía. Es la misma clase de contaminación que la lección del `distDir` fuera de `.gitignore` —donde un directorio de build a la vista del escáner tiraba abajo la compilación del CSS— y tiene la misma forma: **el escáner de Tailwind no distingue entre código de producto y código que habla sobre el producto.**

La consecuencia práctica es más grande que el número: **cuál de los 89 tokens llega al `:root` es función de lo que el escáner vea ese día**. Sin `@theme static`, el contenido del sistema de diseño en el navegador depende de qué componentes —y qué tests— existan.

> **Regla:** no afirmar un conteo exacto de poda desde adentro del proyecto medido. Afirmar el fenómeno (`static` → 0, sin `static` → más de 0) e imprimir el listado del día, fechado.

### 3. La API `compile()` no escanea: sirve para ver el fenómeno, no para dar un número

`compile()` de `tailwindcss/dist/lib.mjs` recibe una lista cerrada de candidatos y **no recorre el proyecto**. Con dos candidatos vio dos, y podó todo lo demás: **80 de 89** contra los ~21 del pipeline real.

No está roto — está respondiendo otra pregunta. *"Qué sobrevive si nadie usa nada"* no es *"qué sobrevive en este proyecto"*. El error fue de encuadre, no de ejecución: **medir la poda de un build con un compilador que no escanea el proyecto es medir otra cosa.**

Esa cifra estuvo a punto de publicarse como la que retracta a S0. Habría sido el mismo error de S0 en espejo: una generalización correcta dentro de su fixture y falsa fuera de él.

> **Regla:** para cualquier cifra que vaya a un reporte, medir por el pipeline que corre en producción — `@tailwindcss/postcss` sobre el `globals.css` real, no la API del compilador.

### Y dos de lectura, más chicas pero del mismo género

4. **Un comparador que leía el texto de las reglas emitidas.** `.rounded-lg` emite `border-radius: var(--radius-lg)` pase lo que pase con el valor, así que un cambio de valor le pasaba por al lado. Se rehizo sobre los valores del `:root`. *(Éste es el que motivó que todos los demás lleven control positivo.)*
5. **Un chequeo que leía los comentarios del archivo.** El docblock del layout dice "No `next/font/google`" y menciona el eje `100 900` en prosa; el `includes` contaba la explicación como si fuera código. Se filtran comentarios antes de afirmar sobre fuente.

**El patrón común de los cinco:** el instrumento devolvía verde, o devolvía un número plausible, sin estar mirando la cosa. Ninguno lo habría encontrado una relectura.

---

## Archivos

### Creados

```
src/app/theme-develop.css                          el sistema de S0, con sus 4 cambios comentados
src/app/v3/layout.tsx                              fuentes locales + compuerta + <main>
src/app/v3/page.tsx                                las 8 secciones desde el dato
src/app/v3/control-estatico/page.tsx               INSTRUMENTO · deuda con fecha de baja
src/app/v3/_componentes/EscenarioCompuerta.tsx     la compuerta de 1025
src/app/v3/_componentes/EscenarioDePrueba.tsx      el marcador de posición (chunk perezoso)
src/app/v3/_componentes/Panel.tsx                  panel + rótulo, con la grilla medida
src/app/v3/_componentes/PanelPinneado.tsx          Servicios: sticky puro
src/app/v3/_lib/compuerta.ts                       umbral, consulta, snapshot de servidor
src/app/v3/_lib/marcaEscenario.ts                  la marca que busca el invariante del bundle
src/app/v3/_lib/secciones.ts                       las 8 secciones — EL DATO
src/app/v3/_lib/superficies.ts                     los 3 modos — EL DATO
src/app/v3/_lib/useAnchoMinimo.ts                  useSyncExternalStore sobre matchMedia
src/app/v3/_fuentes/chivo-latin.woff2              binario de S0
src/app/v3/_fuentes/chivo-mono-latin.woff2         binario de S0
src/app/v3/_lib/__tests__/afirmar.ts               afirmar + controlPositivo + contraste WCAG
src/app/v3/_lib/__tests__/tokens.invariant.ts
src/app/v3/_lib/__tests__/fuentes.invariant.ts
src/app/v3/_lib/__tests__/compuerta.invariant.ts
src/app/v3/_lib/__tests__/superficies.invariant.ts
src/app/v3/_lib/__tests__/bundle.invariant.ts
docs/rediseno/outputs/S1-ESQUELETO.md              este documento
```

### Modificados

```
src/app/globals.css                    +1 @import (y su comentario)
src/components/layout/publicRoute.ts   '/v3' a CHROME_FREE_PREFIXES
src/components/layout/SmoothScroll.tsx '/v3' fuera de Lenis
package.json                           6 scripts test:s1-*
.gitignore                             /.next-s1-control/ (plan B, agregado ANTES de buildear)
.gitattributes                         *.woff2 binary y compañía
```

### Entradas de S0 que entran al repo

```
docs/rediseno/s0/theme-develop.css     el original, SIN TOCAR — el invariante compara contra él
docs/rediseno/s0/REPORTE-S0.md         con la retractación de S1 escrita adentro
docs/rediseno/sprints/S1-esqueleto.md  la instrucción del sprint
```

---

## Regla 11 · cifra → instrumento

| cifra | instrumento |
|---|---|
| 89 tokens · 14 líneas fuera / 18 dentro · 1 sola colisión | `_lib/__tests__/tokens.invariant.ts` |
| 0 / 21 / 33 ausentes del `:root` · `inline` rompe el override | `_lib/__tests__/tokens.invariant.ts` |
| las 9 equivalencias rem↔px, las 15 utilidades y `--text-base` | `_lib/__tests__/tokens.invariant.ts` |
| sha256 y bytes de los dos binarios · cobertura del subset latin | `_lib/__tests__/fuentes.invariant.ts` |
| umbral 1025 · render de servidor vacío · fuera de flujo · sticky sin JS | `_lib/__tests__/compuerta.invariant.ts` |
| los 3 modos · las 8 en `papel-opaco` · 13,6197:1 · 1,0536:1 sobre el portal | `_lib/__tests__/superficies.invariant.ts` |
| A1/A2/A3 · 1385,8 y 1386,9 KiB · 1381,3 heredado / 4,5 propio · 89 tokens en el CSS servido | `_lib/__tests__/bundle.invariant.ts` |
| `tsc` exit 0 · `eslint` exit 0 · `build` exit 0 · `migrate status` | los tres gates, corridos a mano |
