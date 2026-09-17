# TEXTO-3 · LA BAJADA POR VOZ, Y EL HERO QUE SE RINDE A 320

**Los dos cambios aplicados y medidos.** Worktree `C:\rediseno-home\logic-core-v3`,
rama `rediseno/home`, sobre el árbol de **TEXTO-2** —que sigue sin commitear— con
los cambios de MOVIL que tampoco se tocaron. **No se commiteó nada.**

**Instrumentos**: `scripts-texto/e-antes-despues.ts` con una **máscara de fondo
nueva** (§4.1) y `scripts-texto/h-peso.ts`, el A/B de peso que no pudo salir de
`git` (§5).

**Salidas**: `outputs/texto/e-texto3.json` y `h-peso.json`.
**Capturas**: `capturas/texto/texto3-*.png` — **8 archivos**, los ocho anchos en
reposo y con recarga limpia por ancho.

---

## 0 · EL RESULTADO, ARRIBA DE TODO

| ancho | detrás del texto ANTES | **DESPUÉS** | contraste del titular |
|---|---|---|---|
| **320 × 568** | **46,66 %** de tinta sobre la masa | **0,00 %** | **17,60:1** |
| 375 · 390 · 425 · 768 · 1024 · 1440 · 1920 | — | **sin cambio** | 14,00 – 14,67:1 |

**320 pasó de 46,66 % a 0,00 %.** Sobre papel opaco no hay masa detrás del texto,
y el contraste es **17,60:1** — que no es un número cualquiera: es exactamente la
razón tinta/papel que el sistema publica desde S0. La superficie está bien
montada.

Y tres cosas que el resto del informe sostiene:

1. **Los otros siete no se movieron, y hay prueba más fuerte que una tolerancia:**
   el alto del bloque es **idéntico a la centésima** en los ocho anchos y el
   titular dibuja **exactamente los mismos glifos** (8.347 · 8.305 · 8.527 ·
   8.802 · 12.131 · 14.887 · 20.523 · 27.393). La variante A tiene 2 caracteres
   más que la B y **las dos entran en un renglón**, así que la geometría no se
   movió un píxel.

2. **A 320 la composición no se arregló: se tapó**, y el informe publica las dos
   cifras para que eso no se lea mal (§4.1).

3. **La instrucción daba por inexistente un costo que existe**: hubo que inventar
   un corte. El lane no tenía **una sola media query de ancho** fuera de las tres
   `min-width` de Tailwind (§2.2).

---

## 1 · PASO 1 — LA BAJADA, VARIANTE A

```
bajada   'Sitio, chat y seguimiento en uno.'   (B, 33 car.)
       → 'Tu sitio, tu chat y tu seguimiento.' (A, 35 car.)
```

**Entra en UN renglón en los ocho anchos**, medido sobre el árbol real
(`renglonesBajada: 1` en las ocho filas de `e-texto3.json`). El margen en la caja
más chica —256 px a 320— es **27,89 px**.

**Y no movió la geometría:** el alto del bloque es el mismo a la centésima en los
ocho anchos, porque las dos variantes ocupan un renglón y el renglón mide lo
mismo:

| ancho | bloque con la B | bloque con la A |
|---|---|---|
| 320 | 313,69 | **313,69** |
| 375 | 200,34 | **200,34** |
| 390 | 201,22 | **201,22** |
| 425 | 203,30 | **203,30** |
| 768 | 223,67 | **223,67** |
| 1024 | 238,86 | **238,86** |
| 1440 | 303,58 | **303,58** |
| 1920 | 332,06 | **332,06** |

**El techo declarado no cambió: siguen siendo 37 caracteres.** La A mide 35, así
que entra con dos de sobra. Su avance por carácter es **6,517 px**, el más chico
de las tres cadenas medidas —con él el techo a 320 daría 39— pero `PEDIDO` sigue
declarando 37, que sale del avance PEOR de los tres y es el lado seguro para una
frase que todavía no existe.

**El censo no se movió:** **46 cosas pendientes**, Hero sigue con **2**
(`bajada` y `cta.rotulo`), las dos `prosa`. La bajada sigue siendo relleno
declarado y su `formato` no cambió. Documento regenerado con
`npm run test:s7-pedido -- --escribir`; el invariante cierra en **84
afirmaciones, 0 fallas**.

---

## 2 · PASO 2 — EL HERO EN `papel-opaco`, SÓLO A 320

### 2.1 · Se podía condicionar, y ésta es la derivación

La instrucción pedía frenar si la superficie no era condicionable por ancho. **Se
puede**, y el camino es único:

- `Panel.tsx` es un **componente de servidor**: no hay ancho en su render.
- El hook que sí lo lee (`useAnchoMinimo`) devuelve `false` en el servidor **y
  durante la hidratación**, a propósito y documentado. Decidirlo en JS pintaría
  el primer cuadro **sin** la superficie y la metería después: un parpadeo de
  exactamente el defecto que esto viene a tapar.
- Queda una sola puerta: **una media query**.

Se usó el mecanismo que ya existía, como la instrucción pedía: la superficie
sigue siendo un DATO por sección en `secciones.ts`, y lo único nuevo es que ese
dato puede depender del ancho.

```ts
{ id: 'hero', superficie: 'papel-transparente', superficieAngosta: 'papel-opaco', … }
```

### 2.2 · ⚠️ EL COSTO QUE LA INSTRUCCIÓN DABA POR INEXISTENTE

> *«320–374 es el más chico y queda abajo de todos los breakpoints, así que no
> hace falta inventar un corte.»*

**Es al revés: estar abajo de todos los breakpoints es exactamente por qué hubo
que inventar uno.** Medido sobre el fuente: el lane `/v3` **no tiene una sola
media query de ancho** fuera de las tres `min-width` que Tailwind emite desde
`--breakpoint-tablet` (768), `--breakpoint-medio` (860) y `--breakpoint-escritorio`
(1025), y **cero variantes `max-`**. Sin un corte, CSS no tiene forma de decir
«sólo acá».

Lo que sí es verdad de la instrucción es que el número no se inventó: **375 ya
estaba en el tema** como `--fluido-piso`, el piso de la banda fluida, o sea el
ancho más angosto al que se midió el sistema tipográfico. Lo que se agregó es la
declaración:

```css
--breakpoint-angosto: 375px;   →   @media (width < 375px)
```

verificado sobre el CSS construido. La banda es **320–374** y 375 queda afuera,
que es el rango pedido.

⚠ **Y `--fluido-piso` decía textualmente «No son breakpoints: no hay media query
en ninguno de los dos».** Ahora hay una. La línea se corrigió en el tema, y
`tokens.invariant` §7b ata los dos literales de 375 para que no se puedan
desincronizar — un `@media` no puede leer una custom property, así que el
breakpoint necesita su propio literal y ésa es la única razón por la que el
número está dos veces.

El token pasó por la puerta de control de cambios del tema: está declarado en
`padron-de-tokens.AGREGADOS` con su sprint y su motivo, y en el diff aprobado de
`tokens.invariant` §2. El gate lo rechazó hasta que se declaró, que es para lo
que existe.

### 2.3 · Lo que el mecanismo NO puede hacer, y el tipo lo prohíbe

Una media query **pinta clases; no escribe atributos**.
`data-seccion="invertida"` —el mecanismo de S0 que da vuelta `--color-fondo` y
`--color-tinta`— se decide en el servidor y no tiene forma condicional. Una banda
angosta oscura pintaría el fondo invertido con la tinta sin invertir: **tinta
negra sobre fondo negro**, y compilando. Por eso `ModoSuperficieAngosta` admite
sólo los dos modos claros, y `superficies.invariant` §1b lo afirma con control
positivo en vez de confiar en el tipo.

### 2.4 · ⚠️ LO QUE QUEDA ABIERTO, declarado y no resuelto

`dejaVerElCanvas` sigue siendo propiedad del **modo**, no del ancho. Así que
`TRANSPARENTES` —y todo lo derivado de ella: el mapeo de la escena, el anclaje,
las ventanas de tinta— sigue diciendo que el Hero deja ver la sala. **Es verdad
de 375 para arriba y falso abajo, y ningún modelo derivado lo sabe.**

No se arregló acá porque arreglarlo es volver ancho-dependiente media docena de
modelos de escena, y este sprint tiene la escena prohibida. El alcance de la
deuda, dicho con precisión: **afecta a lo DERIVADO, no a lo medido.** Las
mediciones de pantalla se sacan por ancho y ven la superficie real — de hecho es
lo que §4.1 tuvo que arreglar en el instrumento.

---

## 3 · PASO 3 — EL INVARIANTE DEL HERO

`hero.invariant.tsx` afirmaba `!quieto.includes('bg-fondo')`. Con la clase nueva
—`max-angosto:bg-fondo`, que contiene esa cadena— se ponía en rojo.

**Qué custodiaba antes:** que la sección no pintara fondo en NINGÚN ancho, o sea
que la sala se viera a través del panel — la propiedad que hace que ésta sea una
de las dos pantallas del sitio que dejan ver el escenario.

**Qué custodia ahora:** lo mismo **con su condición** — de 375 para arriba el
panel sigue sin pintar nada, y abajo pinta papel a propósito. Se afirma el PAR:

```ts
const FONDO_SIN_CONDICION = /(^|[\s"])bg-fondo\b/
afirmar(!FONDO_SIN_CONDICION.test(quieto), …)        // nadie tapa la sala en todo ancho
afirmar(quieto.includes('max-angosto:bg-fondo'), …)  // y el único fondo está acotado
```

El discriminador es el carácter de antes: un `bg-fondo` sin condición viene
precedido de espacio o comilla; el acotado viene precedido de `:`. Con dos
controles positivos: uno que ve un panel que lo pinta en todo ancho y otro que ve
un panel al que le falta la clase acotada.

---

## 4 · PASO 5 — LA MEDICIÓN

### 4.1 · ⚠️ EL INSTRUMENTO PREGUNTABA LO QUE YA NO ERA LA PREGUNTA

`SOLO_LA_ESCENA` esconde todo menos `[data-escena]`, así que la captura **D** es
«dónde está la masa del logo». Eso ERA lo que había detrás del texto **mientras
el panel del Hero fuera transparente en todos los anchos**.

**TEXTO-3 rompe esa equivalencia.** Y `visibility: hidden` esconde el fondo del
elemento junto con su contenido, así que D sigue fotografiando el logo entero
**como si el panel no existiera**: medir contra D a 320 contestaba 46,65 %, que
es la composición que sigue rota debajo, **no la pantalla**.

Se agregó una segunda máscara de fondo —**E**, la página sin el texto del Hero y
con todo lo demás en su lugar—, que es literalmente «qué hay detrás de los
glifos». **Las dos se publican**, porque contestan preguntas distintas:

| ancho | sobre la ESCENA (D) | **DETRÁS del texto (E)** | contraste | tinta bajo AA |
|---|---|---|---|---|
| **320** | **46,65 %** | **0,00 %** | **17,60:1** | **0,00 %** |
| 375 | 16,22 | 16,30 | 14,04:1 | 16,12 |
| 390 | 4,86 | 4,60 | 14,01:1 | 3,95 |
| 425 | 5,06 | 4,86 | 14,01:1 | 4,17 |
| 768 | 16,26 | 16,57 | 14,00:1 | 13,32 |
| 1024 | 1,41 | 1,34 | 14,67:1 | 1,20 |
| 1440 | 0,69 | 0,51 | 14,55:1 | 0,43 |
| 1920 | 0,05 | 0,10 | 14,67:1 | 0,03 |

**La diferencia entre las dos columnas ES cuánto tapa el panel.** A 320 vale
46,65 puntos; en los otros siete las dos coinciden dentro de 0,3 puntos, que es
lo que prueba que ahí el panel sigue siendo transparente y que la máscara nueva
no cambió de instrumento a mitad de camino.

**A 320 la composición no se arregló: se tapó.** Los 46,65 % contra la escena son
el problema que sigue abajo del papel, intacto, y por eso se publican.

### 4.2 · Los otros siete: idénticos, con prueba más fuerte que una tolerancia

| ancho | ANTES (TEXTO-2) | DESPUÉS | Δ | glifos ANTES → DESPUÉS |
|---|---|---|---|---|
| 320 | 46,66 | 46,65 | −0,01 | 8.347 → **8.347** |
| 375 | 16,34 | 16,22 | −0,12 | 8.305 → **8.305** |
| 390 | 4,80 | 4,86 | +0,06 | 8.527 → **8.527** |
| 425 | 5,00 | 5,06 | +0,06 | 8.802 → **8.802** |
| 768 | 16,26 | 16,26 | 0,00 | 12.131 → **12.131** |
| 1024 | 1,50 | 1,41 | −0,09 | 14.887 → **14.887** |
| 1440 | 0,69 | 0,69 | 0,00 | 20.523 → **20.523** |
| 1920 | 0,06 | 0,05 | −0,01 | 27.393 → **27.393** |

**El titular dibuja exactamente los mismos píxeles de tinta en los ocho anchos**,
y el alto del bloque es idéntico a la centésima (§1). O sea que la máscara C es
la misma y **la composición no se movió**: los desvíos de −0,12 a +0,06 puntos
están enteramente en la foto de la escena, que es la dispersión que TEXTO-2
acotó en ±0,1–0,2 puntos con un control de dos corridas del mismo árbol.

El único cambio de contenido —la bajada, de 33 a 35 caracteres— no toca el
titular y no movió su caja.

### 4.3 · El contraste, con el método del glifo

Mediana de la luminancia debajo de los glifos del titular, contra la tinta
medida, sobre lo que REALMENTE hay detrás:

- **320: 17,60:1.** Es la razón tinta/papel que el sistema publica desde S0 y que
  `superficies.invariant` §3 reproduce. Sobre papel opaco no hay nada más que
  papel, así que **es el máximo que este sistema puede dar** y es la comprobación
  de que la superficie está bien montada, no un número suelto.
- Los otros siete: **14,00 a 14,67:1**, la sala clara a través del panel
  transparente. Todos muy por arriba de AA (4,5:1).
- La cifra que una mediana esconde también mejora a 320: la **tinta bajo AA**
  pasa de 46,4 % a **0,00 %**.

---

## 5 · EL PESO — 216 BYTES, Y EL A/B QUE NO PODÍA SALIR DE `git`

El lane subió, así que la línea se declara en el mismo acto, con su recibo.

**El problema de método:** el A/B de TEXTO-2 devolvía sus archivos a `HEAD`, y
servía porque aquel sprint abría sobre `HEAD`. **Éste no**: abre sobre el árbol de
TEXTO-2, que está **sin commitear**, así que devolver a `HEAD` habría medido los
dos sprints juntos y le habría cargado a éste los 40 B que aquél ya declaró.

**La salida:** el «antes» se arma por archivo, de dos fuentes —cinco desde `HEAD`
(los que TEXTO-2 no tocó) y dos desde el respaldo que aquel sprint dejó FUERA del
árbol, **con su sha256 verificado contra el recibo publicado** antes de usarlos—.
Los cuatro invariantes entran en el swap aunque no viajen, por la lección de
`g-peso.ts`: el swap tiene que dejar el árbol **compilable**.

**⚠️ El control que hace que la resta signifique algo:** el «antes» de este A/B
**reproduce el cierre de TEXTO-2 al décimo de byte**.

| | bytes del lane | aire |
|---|---|---|
| antes (el árbol de TEXTO-2) | **66.090,2** | +50,0 B |
| TEXTO-2 había cerrado en | **66.090,2** | *desvío −0,0 B* ✅ |
| después | 66.306,2 | −166,0 B |
| **TEXTO-3 monta** | **216,0 B** | |

**La línea: `MONTAJE_DE_TEXTO3_KIB = 0,22`.** 216,0 / 1024 = 0,2109 → 0,22 KiB,
que deja **9,3 B de aire**, arriba del umbral de 8 **sin** necesitar la regla del
aire útil — la primera de las tres últimas líneas que cae del lado bueno sola.
**El techo de 60 no se movió** y la línea es revocable sola.

⚠️ **Son muchos bytes para lo que compran, y se dice:** 216 B es la quinta línea
más grande del tablero, por un fondo que se pinta en una banda de 55 px. Lo que
se paga es el **mecanismo** —un campo en el tipo del recorrido, una tabla de
clases, una rama en el panel y un atributo—, no la decisión. La segunda sección
que declare banda angosta ya lo encuentra pago.

⚠️ El token y su regla **no están en esta cuenta**: son CSS, y este techo mide
sólo los `<script src>` de la ruta.

---

## 6 · PASO 4 — LO NUMERADO EN `DIRECCION-ESCENA.md` §7

- **§7.62** 🔴 Un modelo que se equivoca de signo es peor que ninguno: a 320 el
  modelo predice que baja (37,1 → 33,2 %) y el navegador mide que sube (40,2 →
  46,6 %). **Se detectó sólo porque ese archivo mide las dos cosas.** La regla que
  deja: una afirmación sobre la pantalla se alimenta del recibo; donde modelo y
  recibo se contradigan, gana el recibo y la contradicción se publica.
- **§7.63** 🔴 Las palancas de composición no son aditivas: a 768 los tres pasos
  de TEXTO-2 juntos dan 16,3 % y el paso 1 solo daba 11,8. La regla que deja: se
  mide la combinación que se va a aplicar, entera; una tabla de palancas medidas
  por separado **no se puede sumar**.
- **§7.64** ✅ El Hero a 320 pasa a `papel-opaco`, con las cuatro palancas
  descartadas y su cifra, el mecanismo, el costo del corte inventado y la deuda
  de `dejaVerElCanvas`.

---

## 7 · EL GATE

`NODE_OPTIONS=--max-old-space-size=6144 MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build`
(exit 0) · `npx prisma migrate status` · `npm run verificar`.

| paso | resultado |
|---|---|
| 1 · `package.json` | ok — sin marcadores, JSON válido, cero claves duplicadas |
| 1b · conflictos en todo el repo | ok — ningún merge sin resolver |
| 2 · `tsc --noEmit` | ok — sin errores de tipos (11,4 s) |
| 3 · los 27 agregados | **27 de 27 en verde** |

**135 invariantes · 5.576 afirmaciones · 953 controles positivos · 13 fuera de
ventana · 0 con falla · 16 deudas declaradas.**

**30 pasos · 0 fallas · 16 deudas**, que es lo que el sprint pedía. Las deudas
son las mismas que el repo ya declaraba: 12 en `test:s10-acceso`, 3 en
`test:s8-tinta`, 1 en `test:s22-emision`. Este sprint no agregó ninguna y no
cerró ninguna.

`npx prisma migrate status`: 86 migraciones, al día.

`npm run test:frontera`, que va aparte y ANTES del commit: 2 invariantes · 23
afirmaciones · 10 controles positivos · **0 con falla**.

### ⚠️ Cuatro invariantes se pusieron en rojo, y los cuatro por la misma razón

Ninguno era un falso rojo: los cuatro afirmaban, con razón, propiedades que este
sprint cambió a propósito. Se listan porque el conjunto dice algo — **agregar un
breakpoint toca más cosas de las que parece**:

| invariante | qué afirmaba | qué afirma ahora |
|---|---|---|
| `tokens` §1–2 | el tema difiere de S0 **exactamente** en lo aprobado | lo mismo, con `--breakpoint-angosto` declarado en el padrón con su motivo |
| `s10-medida` §2 | los **tres** breakpoints, y a 375 no hay ninguna variante activa | los **cuatro**, y la banda sin variante ahora es 374 |
| `hero` §1 | la sección no pinta fondo **en ningún ancho** | no pinta fondo **sin condición**, y el único que pinta está acotado |
| `s7-integracion` | ninguna sección transparente contiene `bg-fondo` | ninguna lo contiene **suelto**, y la que declara banda trae su clase |

Los dos primeros son la puerta de control de cambios del tema funcionando: el
token no entró hasta que se declaró con su sprint y su motivo. Los dos últimos
son el mismo re-anclaje de §3.

---

## 8 · LOS ARCHIVOS

**Producto** (5):

- `src/app/theme-develop.css` — `--breakpoint-angosto: 375px` y la corrección del docblock de `--fluido-piso`
- `src/app/v3/_lib/superficies.ts` — `ModoSuperficieAngosta` y `CLASES_DE_LA_BANDA_ANGOSTA`
- `src/app/v3/_lib/secciones.ts` — el campo `superficieAngosta` y la fila del Hero
- `src/app/v3/_componentes/Panel.tsx` — la clase acotada y `data-superficie-angosta`
- `src/app/v3/_secciones/hero/contenido.ts` — la bajada, variante A

**Invariantes y presupuesto** (7):

- `src/app/v3/_secciones/hero/hero.invariant.tsx` — el chequeo del fondo, re-anclado
- `src/app/v3/_lib/__tests__/superficies.invariant.ts` — §1b, la banda angosta
- `src/app/v3/_lib/__tests__/tokens.invariant.ts` — el token declarado y §7b
- `src/app/v3/_lib/__tests__/padron-de-tokens.ts` — el agregado con su motivo
- `src/app/v3/_lib/__tests__/s5-presupuesto.ts` — `MONTAJE_DE_TEXTO3_KIB` y su suma
- `src/app/v3/_lib/__tests__/s5-peso.invariant.ts` — las cuatro afirmaciones de la línea
- `src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-texto3.ts` — **nuevo**, el recibo

**Instrumentos**: `scripts-texto/h-peso.ts` (nuevo) y `scripts-texto/e-antes-despues.ts`
(la máscara E).

**Documentos**: `docs/rediseno/DIRECCION-ESCENA.md` (§7.62–64),
`docs/rediseno/CONTENIDO-PENDIENTE.md` (regenerado, sin cambios de censo) y este
informe.

**No se tocó**: la escena, la cámara, `frameX`, la distancia, el anclaje, el alto
de sección, los tamaños de tipografía, los pisos de las curvas fluidas, las otras
siete secciones, los anchos 375 a 1920, `a-verdad-hoy.json`, `HeroArtifact.tsx` y
`TransitionContext.tsx`. Y **no se commiteó nada**.

---

## 9 · PARA COMMITEAR

⚠️ **Este sprint NO commitea.** Y el working tree lleva **tres sprints sin
commitear encimados** —MOVIL, TEXTO-2 y TEXTO-3—, así que los `git add` van
archivo por archivo, nunca `git add .`. Esta lista es SÓLO lo de TEXTO-3; lo de
TEXTO-2 está en su propio informe §10.

```bash
git add logic-core-v3/src/app/theme-develop.css
git add logic-core-v3/src/app/v3/_lib/superficies.ts
git add logic-core-v3/src/app/v3/_lib/secciones.ts
git add logic-core-v3/src/app/v3/_componentes/Panel.tsx
git add logic-core-v3/src/app/v3/_secciones/hero/contenido.ts
git add logic-core-v3/src/app/v3/_secciones/hero/hero.invariant.tsx
git add logic-core-v3/src/app/v3/_lib/__tests__/superficies.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/tokens.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/padron-de-tokens.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s10-medida.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s7-integracion.invariant.tsx
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-peso.invariant.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-texto3.ts
git add logic-core-v3/scripts-texto/h-peso.ts
git add logic-core-v3/scripts-texto/e-antes-despues.ts
git add logic-core-v3/docs/rediseno/DIRECCION-ESCENA.md
git add logic-core-v3/docs/rediseno/CONTENIDO-PENDIENTE.md
git add logic-core-v3/docs/rediseno/outputs/TEXTO-3.md
git add logic-core-v3/docs/rediseno/outputs/texto/e-texto3.json
git add logic-core-v3/docs/rediseno/outputs/texto/h-peso.json
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-320x568.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-375x667.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-390x844.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-425x844.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/texto/texto3-1920x1080.png
```

⚠️ `scripts-texto/e-antes-despues.ts` es de TEXTO-2 y este sprint lo MODIFICÓ
(la máscara E de §4.1): va en este commit o en aquél, pero una sola vez.

Mensaje propuesto, sin acentos:

```
TEXTO-3: la bajada por voz y el hero en papel opaco abajo de 375
```

---

## 10 · LO QUE QUEDA PARA EL DUEÑO

1. **La línea de peso: `MONTAJE_DE_TEXTO3_KIB = 0,22`** (216 B). Declarada en el
   mismo acto porque la regla del repo lo pide; aprobarla o revocarla es de la
   parada. Revocarla es sacar `superficieAngosta` de la fila del Hero.
2. **`dejaVerElCanvas` sigue siendo ciego al ancho** (§2.4). Afecta a los modelos
   DERIVADOS de la escena, no a lo medido. Cerrarlo es un sprint de escena.
3. **`a-verdad-hoy.json` sigue describiendo el árbol de TAPADO-1**, como quedó
   dicho en TEXTO-2. Este sprint tampoco lo re-basó, por instrucción.
