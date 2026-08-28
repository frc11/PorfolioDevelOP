# S0 — Reporte de las tres mediciones

**Fecha:** 2026-08-28 · **Carpeta:** `C:\develop-v3-cimientos\`
**Estado:** 🛑 **PARADA 1.** Las tres mediciones están hechas. El `theme.css` de develOP **no** está escrito: espera tu OK.

Toda cifra de este reporte tiene un instrumento que la produce dentro de esta carpeta (regla 11). Al final está la tabla cifra → instrumento.

> ### 🛑 UNA CIFRA DE ESTE REPORTE FUE RETRACTADA — 2026-08-28, por el sprint S1
>
> **"Tailwind 4.3.1 no poda" (Medición 3.B) es falso.** Sí poda, y poda por uso.
> El resto del reporte se sostiene; la Medición 3 sobre `@theme inline` quedó
> además **confirmada** en un segundo entorno.
> La corrección completa, con su causa y su instrumento, está al final de la
> Medición 3 — buscar *"RETRACTADO POR S1"*.

---

## Resumen en cinco líneas

1. **La escala transfiere a Chivo.** Factor 510/511 = **0,998**, dentro de la banda 0,98–1,02. Si se reescalara igual, **se moverían 0 de 14 valores**.
2. **Los tres acentos de develOP pasan AA sobre papel claro**, peor caso **4,65:1**. **Las variantes brillantes no hacen falta** y el sistema se simplifica.
3. **El acento contextual compila** con `@theme` en Tailwind **4.3.1**, y el control con `@theme inline` demuestra que ahí **no** funciona.
4. Aparecieron **tres cosas que hay que decidir** y no son mías: la sección invertida, el anillo de foco sobre esa sección, y ocho namespaces vivos que la cabecera de Franco no lista.
5. Los tres controles positivos **pasaron**. Ninguna comprobación quedó verde por vacío.

---

## Antes que nada: lo que decidí solo

Separado a propósito de lo que vos confirmaste, que hasta acá es nada.

| # | Qué hice | Por qué | Riesgo |
|---|---|---|---|
| 1 | Leí `package-lock.json` y `node_modules/tailwindcss/package.json` de `logic-core-v3`, además del `package.json` | La regla decía leer **solo** el `package.json`, pero ahí Tailwind figura como `"^4"` — un rango, no una versión. La instrucción también pedía *"fijá la versión exacta"*. Las dos cosas no se podían cumplir a la vez | Nulo: lectura pura, cero escrituras, cero comandos git en ese repo |
| 2 | **Cero operaciones de git en todo el sprint** | Descubrí que hay un repo git inicializado en la **raíz `C:\`**, que trackea todo el disco. Cualquier `git add` desde acá tocaría ese repo | Ninguno. Nada quedó commiteado, acá ni en ningún lado |
| 3 | Bajé también el TTF upstream de `google/fonts`, además del woff2 de gstatic | Para poder contrastar el binario subseteado contra el original. Si el subseteo tocara métricas, había que saberlo | Ninguno |
| 4 | Agregué dos variantes de build (`@theme static`, y una sin referencia `var()` opaca) y un instrumento extra (`poda.mjs`) | Apareció una duda sobre si un token declarado siempre existe. La dejé cerrada en vez de reportarla a medias | Ninguno |
| 5 | Corrí igual la rama *"si cae afuera"* de la Medición 1, aunque el factor cayó adentro | Sin la tabla, *"cae dentro"* es prosa. Con la tabla, la recomendación es auditable | Ninguno |
| 6 | Elegí el método para derivar las superficies claras (abajo, Medición 2 · B) | Había que elegir alguno para que fuera reproducible y no a ojo | **Es una propuesta, no una decisión.** La decisión estética es tuya |

---

# Medición 1 · ¿La escala transfiere a Chivo?

## (a) Métricas, normalizadas a em de 1000, con su control de bbox

Fuente: el woff2 que sirve `fonts.gstatic.com` —el mismo que `next/font` auto-hospeda—, pedido con el mismo User-Agent de Chrome que usa `next/font`, descomprimido a TTF y medido. Control cruzado contra el TTF upstream de `google/fonts`.

**`unitsPerEm` = 1000 en las dos familias.** No hubo que escalar nada; el factor de normalización es exactamente 1.

| | Chivo | Chivo Mono | Instrument Sans (Franco) |
|---|---|---|---|
| unitsPerEm | **1000** | **1000** | 1000 |
| x-height | **511** | **511** | 510 |
| cap height | **686** | **686** | 720 |
| ascender | 940 | 940 | 970 |
| descender | −250 | −250 | −250 |
| lineGap | 0 | 0 | 0 |
| winAscent / winDescent | 1151 / 413 | 1151 / 413 | — |
| OS/2 versión | 4 | 4 | — |
| usWeightClass | 500 | 500 | — |
| monoespaciada | no | **sí** (avance 600) | no |

### Control positivo: bbox real de los glifos contra las métricas declaradas

Franco corroboró *"'x' cierra en 510 y 'H' en 720, exacto"*. El equivalente acá, **en las nueve instancias nombradas** y con **tres lecturas independientes** de cada caja (fontkit, la caja de control del glifo, y un recorrido propio de los puntos del contorno):

```
Thin ExtraLight Light Regular Medium SemiBold Bold ExtraBold Black
   x: bbox 511  vs  sxHeight   511    → coincide en las nueve
   H: bbox 686  vs  sCapHeight 686    → coincide en las nueve
   las tres lecturas coinciden en las nueve
```

**El control pasa.** Chivo declara métricas que cumple.

**Prueba de viveza del instrumento.** Un bbox constante podría ser una caja congelada leída mal. Se verificó que a lo largo del eje de peso el ancho del bbox de `'x'` va de **438 a 597** unidades y su avance de **519 a 585**: el instrumento lee contornos **variados**. Que las verticales no se muevan es una propiedad medida de la fuente, no un artefacto.

**Control cruzado de subseteo.** Las métricas declaradas son idénticas en los seis woff2 de gstatic y en los dos TTF upstream. El subseteo de Google no toca las verticales. *(Los subsets `latin-ext` y `vietnamese` no cubren `x` ni `H`; se marcan como no aplicables en vez de dar un rojo falso.)*

**No hay tabla `MVAR`** en ninguna de las dos familias: las métricas declaradas no varían con el peso.

## El factor contra los 510 de Instrument Sans

```
factor = 510 / 511 = 0,998043  →  0,998
banda de corte fijada en B6.5b: 0,98 – 1,02
```

### ✅ **CAE DENTRO.** Distancia al borde más cercano: 0,018.

Por el criterio que ya existe y que nadie había corrido, **la escala transfiere y no se reescala**.

## (b) Qué pasaría si se reescalara igual

No hacía falta —cae adentro— pero sin la tabla la respuesta sería prosa:

| token | antes | crudo | después | delta |
|---|---|---|---|---|
| `--text-micro` | 10px | 9,98 | 10px | — |
| `--text-caption` | 12px | 11,976 | 12px | — |
| `--text-cuerpo` | 15px | 14,97 | 15px | — |
| `--text-base` | 16px | 15,968 | 16px | — |
| `--text-titulo-s` | 20px | 19,96 | 20px | — |
| `--text-titulo-m` | 32px | 31,936 | 32px | — |
| `--text-titulo-l` | 44px | 43,912 | 44px | — |
| `--text-titulo-xl` | 56px | 55,888 | 56px | — |

Las seis `clamp()` quedan **idénticas**, coeficiente por coeficiente.

**Se mueven 0 de 14 valores.** Más limpio todavía que el caso de Franco, donde se movían 2. La decisión de no reescalar es más sólida para Chivo que para Instrument Sans.

### Los dos controles positivos de esta medición

1. **Reproducir las seis `clamp()` publicadas** con el método que él documenta (`a=(max−min)/(1440−375)`, `b=min−a×375`): **las seis reproducen exacto**, coeficiente por coeficiente. Error máximo de sus expresiones en los extremos de la banda: **0,00053px**.
2. **Reproducir su cuenta**: 504/510 = **0,9882** ✓, y aplicado mueve **2 de 14** valores, 1px cada uno: `titulo-l 44→43` y `titulo-xl 56→55` — **exactamente lo que él escribió**.

Recién con esos dos controles pasando calculé lo de Chivo.

## Lo que el criterio no mira: la cap height

El criterio de B6.5b es de x-height, y por x-height Chivo entra casi perfecto. **La cap height es otra cosa:**

```
cap height   Instrument Sans 720  ·  Chivo 686   → factor 1,0496  (FUERA de la banda)
razón cap/x  Instrument Sans 1,4118  ·  Chivo 1,3425
diferencia relativa: −4,72%
```

**No cambia la respuesta** —el criterio vigente es de x-height y no lo voy a cambiar yo—, pero es lo único que la medición deja abierto. En cuerpo de texto no se va a notar; en `titulo-l` y `titulo-xl` las mayúsculas van a leerse ~5% más chicas que con Instrument Sans. **Es material para la verificación óptica que ya estaba declarada como pendiente.**

## (c) Pesos disponibles y licencia

### Pesos

```
Chivo y Chivo Mono — eje wght 100 → 900 (defecto del binario: 500)
Thin 100 · ExtraLight 200 · Light 300 · Regular 400 · Medium 500 ·
SemiBold 600 · Bold 700 · ExtraBold 800 · Black 900
```

- **Los cuatro pesos de Franco (400/500/600/700) existen todos.** Transfieren sin hueco.
- **Chivo SÍ tiene el peso 300 (Light)**, que Instrument Sans no tenía. El hueco que Franco documentó —*"el peso 300 que la referencia usa en 1.741 elementos NO EXISTE en nuestra familia"*— **desaparece con Chivo**. Si querés recuperarlo es una decisión abierta, no una consecuencia forzada.
- **Chivo NO tiene eje de ancho.** Instrument Sans tenía `wdth 75→100`. Es lo único que se pierde en el cambio de familia.
- Dato menor pero real: el **defecto del binario variable es `wght 500`**, no 400, y `usWeightClass` es 500 (el PostScript name es `Chivo-Medium`). Los navegadores mapean `font-weight` al eje, así que no afecta al render; sí afectaría a cualquier consumidor que use el binario sin fijar peso.

### Licencia — **cerrada, con cita textual**

Método: el mismo de Franco, fuente primaria, más dos fuentes independientes.

**`google/fonts` · `ofl/chivo`** y **`ofl/chivomono`** — el mismo `OFL.txt` en los dos (4385 bytes, sha256 `c9b69fa18c372df2b187b49efc57b1ea…`):

> línea 1: `"Copyright 2019 The Chivo Project Authors (https://github.com/Omnibus-Type/Chivo)"`
> línea 3: `"This Font Software is licensed under the SIL Open Font License, Version 1.1."`

El `METADATA.pb` de los dos directorios dice `license: OFL`, `designer: Omnibus-Type`.

**Dentro del binario upstream**, nameID 13:

> `"This Font Software is licensed under the SIL Open Font License, Version 1.1. This license is available with a FAQ at: https://scripts.sil.org/OFL"`

**`OS/2 fsType = 0`** en los cuatro binarios: *Installable Embedding*, sin restricción de incrustación ni de subseteo. **Costo USD 0. Auto-hospedarla no tiene restricción ni costo.**

Diseño: **Omnibus-Type**, fundición de **Buenos Aires**; diseñador `Hector Gatti`. Marca registrada declarada: *"Chivo is a trademark of Omnibus-Type."* — es marca sobre el nombre, no una restricción sobre el software.

**Dos cosas honestas que encontró el control:**

1. **Chivo Mono declara `Copyright 2018` en el binario y `Copyright 2019` en su `OFL.txt`.** Mismos autores, mismo proyecto, misma licencia. Es una inconsistencia de año entre el archivo de licencia del repo y el metadato del binario. **No afecta el estado OFL**, pero está y prefiero decirlo a taparlo.
2. **El woff2 de gstatic —el que el sitio va a hospedar— viene con la tabla `name` recortada**: conserva el copyright (nameID 0) y la URL de licencia (nameID 14), pero Google le saca el nameID 13, el fabricante, el diseñador y la marca. No es un problema de licencia; es un dato a saber si alguna vez hay que probar procedencia desde el archivo hospedado.

---

# Medición 2 · ¿Los acentos pasan AA sobre papel?

## (d) La reproducción de los números de Franco — **antes** que los míos

El instrumento **impone el orden**: si el control falla, corta con código 1 y no imprime una sola cifra de develOP.

**26 de 26 cifras publicadas reproducidas exactamente a dos decimales.** Incluye las cinco que la instrucción pedía y veintiuna más que encontré en los comentarios de su `theme.css`:

| afirmación publicada | dice | calculado |
|---|---|---|
| los 4 acentos sobre tema claro | 2,10 · 2,19 · 1,86 · 3,66 | **2,10 · 2,19 · 1,86 · 3,66** ✓ |
| tinta oscura sobre claro-fondo | 15,43 | **15,43** ✓ |
| tinta sobre fondo | 16,23 | **16,23** ✓ |
| los 4 acentos sobre fondo | 8,09 · 7,74 · 9,15 · 4,64 | **idénticos** ✓ |
| foco en la peor superficie | 12,52 | **12,52** ✓ |
| tinta-tenue peor caso | 5,00 | **5,00** ✓ |
| borde-fuerte `rgba(…,0.38)` compuesto | 3,09 | **3,09** ✓ |
| violeta sobre superficie-1/2/3 | 4,40 · 4,04 · 3,58 | **idénticos** ✓ |
| las 4 brillantes sobre fondo | 10,87 · 10,22 · 11,77 · 7,22 | **idénticos** ✓ |
| las 4 brillantes, peor caso | 8,39 · 7,89 · 9,08 · 5,57 | **idénticos** ✓ |
| claro-tinta-media | 5,53 | **5,53** ✓ |

El borde con alfa se compone sobre su fondo antes de medir: un `rgba()` no tiene contraste propio.

**El control pasa.** La implementación de WCAG 2.1 que produce todo lo que sigue es la misma que reproduce sus cifras.

## (f) Las superficies claras derivadas — **PROPUESTA, no decisión**

develOP no tiene equivalentes claros de `superficie-1/2/3`. Método, elegido para que sea reproducible y no a ojo:

1. Se miden las razones de contraste de **sus** tres superficies contra **su** fondo: **1,0533 · 1,1483 · 1,2957**.
2. Se busca, desde el papel de develOP y hacia el otro extremo (oscuro), el color que da esa misma razón.
3. El matiz del papel se conserva escalando los tres canales en espacio **lineal** por el mismo factor.

| token | valor | razón objetivo | razón lograda | error | espejo de |
|---|---|---|---|---|---|
| `--color-superficie-1` | **`#F1F1EF`** | 1,0533 | 1,0543 | 0,00105 | `#151210` |
| `--color-superficie-2` | **`#E8E8E6`** | 1,1483 | 1,1438 | 0,00447 | `#1F1B17` |
| `--color-superficie-3` | **`#DBDBD9`** | 1,2957 | 1,2925 | 0,00318 | `#2A2521` |

**Lo que NO repliqué, y es tuyo decidirlo:** en su rampa el sesgo cálido **crece** con cada escalón (R−B va de 4 a 9). El papel de develOP es casi neutro (R−B = 2) y el escalado lineal conserva esa proporción en vez de aumentarla. Si querés que las superficies se vayan calentando como las de él, es un cambio de valores, no de método.

## (e) La matriz de contraste completa

### Los tres acentos como texto

| acento | papel `#F7F7F5` | s-1 `#F1F1EF` | s-2 `#E8E8E6` | s-3 `#DBDBD9` | peor | AA texto |
|---|---|---|---|---|---|---|
| web `#1D5B8F` | 6,65 | 6,30 | 5,81 | 5,14 | **5,14** | ✅ |
| ia + automatización `#1B6B4C` | 6,02 | 5,71 | 5,26 | 4,65 | **4,65** | ✅ |
| software `#57429E` | 7,31 | 6,93 | 6,39 | 5,66 | **5,66** | ✅ |

### 🟢 **Los tres pasan AA como texto en las cuatro superficies claras. Peor caso del sistema: 4,65:1.**

Los tres pasan también el umbral de texto grande (3:1) con margen enorme.

### El acento como relleno

| acento | con tinta `#111111` encima | con papel `#F7F7F5` encima |
|---|---|---|
| web `#1D5B8F` | 2,65 ❌ | **6,65** ✅ |
| ia + automatización `#1B6B4C` | 2,93 ❌ | **6,02** ✅ |
| software `#57429E` | 2,41 ❌ | **7,31** ✅ |

**La matriz pedía el relleno con tinta encima y los tres fallan.** Es esperable y no es un problema: los acentos de develOP son colores **oscuros**, y tinta sobre acento es oscuro sobre oscuro. **Un panel de acento lleno lleva texto claro.** Es el espejo exacto de la regla de Franco, que sobre claro usaba el acento de relleno con tinta oscura encima.

### La tinta sobre las superficies claras

| superficie | razón | AA |
|---|---|---|
| papel `#F7F7F5` | 17,60 | ✅ |
| superficie-1 `#F1F1EF` | 16,70 | ✅ |
| superficie-2 `#E8E8E6` | 15,39 | ✅ |
| superficie-3 `#DBDBD9` | 13,62 | ✅ |

**4 de 4 pasan AA, peor caso 13,62:1.** Franco reporta 12 de 12 con peor caso 5,00:1 — pero él tiene **tres** tintas (primaria, media, tenue) y develOP tiene **una sola declarada**. Por eso su equivalente son 4 comparaciones y no 12. **Las tintas secundaria y terciaria son un hueco declarado, no algo que yo deba inventar.** Cota, por si sirve: una tinta secundaria que pase AA en las cuatro no puede superar Y = 0,11830 — un gris neutro de `#616161` o más oscuro.

### ¿Hacen falta variantes brillantes?

En el sistema de Franco existen porque su violeta **falla** como texto sobre las tres superficies elevadas (4,40 · 4,04 · 3,58, reproducido arriba). En develOP el peor acento sobre la peor superficie clara da **4,65:1**.

### 🟢 **Sobre superficie clara las brillantes NO hacen falta. Son ocho tokens que el sistema de develOP no necesita.**

Esto contesta lo que la instrucción anticipaba: **la paleta de develOP no es una desviación del sistema de Franco — resuelve la restricción que a ellos los obligó al fondo negro.** Ellos fueron a base oscura porque sus acentos no aguantaban el claro. Los de develOP sí.

---

## ⚠️ Lo que apareció y no estaba en la lista: la sección invertida

La medición encontró **el problema de Franco al revés**, y no lo puedo resolver yo.

| acento | sobre sección oscura `#0E0E0E` | como texto |
|---|---|---|
| web `#1D5B8F` | 2,71 | ❌ falla |
| ia + automatización `#1B6B4C` | 2,99 | ❌ falla |
| software `#57429E` | 2,46 | ❌ falla |

**Los tres acentos fallan como texto sobre la sección invertida — los tres, no uno.** Ni siquiera llegan a texto grande (3:1); el más alto queda en 2,99.

Y el anillo de foco tiene el mismo problema:

| `--color-foco: #111111` sobre… | razón | 3:1 |
|---|---|---|
| las cuatro superficies claras | 13,62 (peor) | ✅ |
| **sección oscura `#0E0E0E`** | **1,02** | ❌ |

La regla de Franco —*"el foco no puede depender de en qué landing esté parado el usuario"*— vale igual acá, pero con un eje distinto: **el foco no puede depender de si la sección es clara u oscura.** Su sistema no tenía este problema porque su fondo por defecto era el oscuro.

Tinta clara sobre `#0E0E0E`: el propio papel `#F7F7F5` da **18,00:1** y pasa holgado. Es el candidato natural, pero **develOP no declara una tinta clara y yo no la voy a decidir.**

**Tres huecos, tres decisiones tuyas:**

1. ¿En la sección oscura el acento va solo como relleno/borde (regla simétrica a la de Franco), o develOP quiere variantes claras de los tres acentos para poder usarlos como texto ahí?
2. ¿El anillo de foco es un token que cambia con la sección, o hay un color único que pase 3:1 tanto sobre papel como sobre `#0E0E0E`?
3. ¿La tinta clara de la sección invertida es el papel `#F7F7F5`, u otro valor?

Ninguna de las tres es una medición. Son decisiones de sistema.

---

# Medición 3 · ¿El acento contextual compila?

## Versión exacta

```
tailwindcss           4.3.1     ← la que usa logic-core-v3
@tailwindcss/postcss  4.3.1
next                  16.2.9    (build con --webpack, como logic-core-v3)
```

`logic-core-v3/package.json` declara `"tailwindcss": "^4"` — un rango. La versión exacta salió del lockfile y de `node_modules` (ver *"lo que decidí solo"* #1). El proyecto de prueba las fija exactas, sin `^`.

## (g) El resultado, con el CSS emitido

Las variantes salen del **mismo archivo** y difieren en **una palabra**, verificado con `diff`. Si difirieran en algo más, la comparación no probaría nada sobre `inline`.

### Variante A · `@theme`

```css
.text-acento   { color:var(--color-acento) }
.bg-acento     { background-color:var(--color-acento) }
.border-acento { border-color:var(--color-acento) }

[data-servicio=web]      { --color-acento:var(--color-acento-web) }
[data-servicio=ia]       { --color-acento:var(--color-acento-ia) }
[data-servicio=software] { --color-acento:var(--color-acento-software) }
```

Las tres utilidades consumen el token **por `var()`**. Las tres reglas de override sobreviven al build y quedan **fuera** de toda `@layer`, así que ganan sobre la capa `theme` en la cascada.

### ✅ **EL OVERRIDE RETIÑE LA UTILIDAD.**

### Variante B · `@theme inline` — **control positivo**

```css
.text-acento   { color:var(--color-acento-web) }
.bg-acento     { background-color:var(--color-acento-web) }
.border-acento { border-color:var(--color-acento-web) }

[data-servicio=web]      { --color-acento:var(--color-acento-web) }
[data-servicio=ia]       { --color-acento:var(--color-acento-ia) }
[data-servicio=software] { --color-acento:var(--color-acento-software) }
```

El valor quedó **incrustado**: la utilidad ya no menciona `--color-acento`. Las reglas de override siguen ahí y siguen escribiendo `--color-acento`, **pero ninguna utilidad lo lee**. Redefinirlo no pinta nada.

### ❌ **EL OVERRIDE NO RETIÑE.** Que es exactamente lo que tenía que pasar.

### 🟢 El control positivo **PASA**

Las dos variantes se comportan **distinto**. El mecanismo sí depende de lo que la documentación dice que depende, y el verde de la variante A **se puede usar**.

Evidencia completa en `prueba-tailwind/salida/css-emitido-theme.css` y `css-emitido-theme-inline.css`.

**El mecanismo no falla. No hay nada que frenar acá.**

## (h) Namespaces reconocidos por 4.3.1

Una sonda por namespace: un token con nombre que no existe en el tema por defecto. Si aparece la utilidad, el namespace está vivo.

**Vivos (20):**
`--color-*` `--font-*` `--font-weight-*` `--text-*` `--leading-*` `--tracking-*` `--spacing-*` `--radius-*` `--shadow-*` `--blur-*` `--ease-*` `--breakpoint-*` `--opacity-*` `--container-*` `--aspect-*` `--animate-*` `--drop-shadow-*` `--inset-shadow-*` `--perspective-*` `--text-shadow-*`

**Muertos (2):** `--duration-*` · `--z-*`

### Contra la lista de la cabecera de Franco

- **Los 12 que su cabecera declara vivos están los 12 vivos.** Ni uno de menos. ✓
- **Su diagnóstico sobre `--duration-*` y `--z-*` es correcto**: no son namespaces, y sus `--duracion-*` y `--z-*` efectivamente no generan clase. ✓
- **Pero su lista está incompleta para 4.3.1: hay 8 namespaces vivos que no lista.** Y dos de ellos le pegan directo a tokens que él puso en el bloque "SIN UTILIDAD":

| token de Franco | está en | namespace vivo en 4.3.1 | qué significa |
|---|---|---|---|
| `--opacidad-tenue/media/alta/casi` | SIN UTILIDAD | **`--opacity-*` SÍ existe** | renombrados a `--opacity-*` generarían `opacity-tenue`, `opacity-media`… en vez de consumirse solo con `var()` |
| `--envoltorio-dominante/tope` | SIN UTILIDAD | **`--container-*` SÍ existe** | renombrados generarían `max-w-*` |

Los otros seis (`--aspect-*`, `--animate-*`, `--drop-shadow-*`, `--inset-shadow-*`, `--perspective-*`, `--text-shadow-*`) no tienen hoy tokens de develOP que los usen, pero están disponibles.

**No renombré nada.** Es una decisión de nomenclatura del sistema y es tuya.

## Un cabo suelto que cerré: ¿un token declarado existe siempre?

Durante la medición me quedó la duda de si Tailwind poda los tokens del tema que nadie usa. Si lo hiciera, declarar 93 tokens no emitiría 93 custom properties y el bloque "SIN UTILIDAD" sería aire — justo lo que la cabecera de Franco afirma que **no** pasa.

Dos builds de la misma variante, con y sin las clases que consumen esos tokens:

```
con esas clases:  34 tokens en el :root de la capa theme
sin esas clases:  34 tokens
tokens que desaparecen: ninguno
```

Probado también con tokens que **no referencia absolutamente nadie**, en namespace reconocido y no reconocido: **los dos sobreviven**.

### ✅ Tailwind 4.3.1 **no poda**. La afirmación de la cabecera de Franco sobre el bloque "SIN UTILIDAD" queda **verificada**: esos tokens existen como custom property, se consumen con `var()` y con valor arbitrario (`duration-[var(--duracion-media)]` genera regla), y simplemente no generan clase.

`@theme static` no cambia nada en esta versión: 34 tokens en los dos casos.

---

## 🛑 RETRACTADO POR S1 — 2026-08-28. Tailwind 4.3.1 **sí poda.**

**La conclusión de arriba se retira.** Queda escrita, tachada y con su causa, porque este proyecto no borra una cifra publicada: la corrige y deja el rastro.

### Lo que vale

Medido sobre el repo `logic-core-v3` por el pipeline **real** —`@tailwindcss/postcss` 4.3.1 procesando el `globals.css` del proyecto, que es literalmente lo que corre `next build`— con el archivo final de 89 tokens:

| variante | tokens ausentes del `:root` | override contextual |
|---|---|---|
| `@theme static` | **0 de 89** | funciona |
| `@theme` a secas | **21 de 89** (2026-08-28) | funciona |
| `@theme inline` | 33 de 89 | **se rompe** |

La fila `inline` **confirma** la Medición 3 original: `.bg-fondo` emite `#F7F7F5` incrustado y `.text-acento` emite `var(--color-acento-web)`, o sea que el override por contexto no llega. Esa parte del reporte se sostiene entera y no se toca.

**El 21 no es una constante, y ése es el punto.** La poda es **por uso**: sobrevive el token que consume una utilidad, un valor arbitrario, o una regla de CSS común de la misma hoja. Se comprobó en carne propia — al escribir tres nombres de token como literales dentro del invariante (que vive en `src/`, así que Tailwind lo escanea), esos tres dejaron de podarse y el conteo bajó de 24 a 21 **sin tocar una línea del tema**. Sin `static`, qué contiene el sistema de diseño en el navegador es función de qué componentes existan ese día.

### Por qué la Medición 3.B concluyó lo contrario

**El instrumento está bien hecho. El error es de alcance, no de ejecución.**

`poda.mjs` construyó dos veces el mismo fixture de **30 tokens** y le quitó a la página, entre una corrida y la otra, **dos clases de valor arbitrario y un consumidor directo**. Todo lo demás del fixture seguía en uso —los `--sonda*` estaban ahí precisamente para que la página los usara, que era el objetivo de la Medición 3.A— así que el delta dio cero. Y dio cero correctamente.

Lo que no se sigue es la conclusión. *"Estos tres consumidores no son los que mantienen vivos a estos tokens"* no es *"Tailwind no poda"*. El experimento no tenía cómo mostrar poda: no había nada sin usar que pudiera desaparecer.

Los dos tokens `--color-nadie` y `--duracion-nadie`, que el reporte cita como *"tokens que no referencia absolutamente nadie"*, sobrevivieron en esa corrida y son la parte que más convence de la conclusión equivocada. Su presencia en `salida/css-emitido-poda-sin-clases.css` es real y está verificada. Lo que no se hizo fue aislarlos: nunca se construyó un fixture donde un token sin usar fuera lo **único** que pudiera cambiar.

**Y el propio docblock de `poda.mjs` guarda la señal que lo contradecía:**

> *"En una corrida temprana, seis tokens declarados en @theme no llegaron al :root. En la corrida final, con mas clases en la pagina, los treinta y cuatro llegaron."*

Esa observación temprana era el hallazgo. Con más clases en la página, más tokens quedaron en uso — que es exactamente el mecanismo de la poda, descrito sin nombrarlo. El docblock incluso escribe el criterio correcto: *"Las dos cosas no pueden ser ciertas a la vez sin una explicacion"*. La explicación estaba a un fixture de distancia y la corrida final la tapó en vez de reconciliarla.

### Lo que S1 hizo con esto

`theme-develop.css` entra al repo con `@theme static`. **`static` no es `inline`**: la tabla de arriba muestra que conserva la indirección `var()`, así que el acento contextual y la sección invertida siguen funcionando. La regla no negociable —nunca `inline`— se cumple.

### Nota de método, porque el sprint casi repite el error en espejo

La primera medición de S1 dio **80 de 89 podados** y estuvo a punto de publicarse. Era un artefacto del arnés: usaba la API `compile()` de `tailwindcss/dist/lib.mjs`, que **no escanea el proyecto**, así que casi no veía candidatos y podaba de más. Un compilador que no escanea no mide la poda de un build: mide otra cosa.

Lo que lo cazó fue el mismo control positivo que después encontró que el plugin de PostCSS **cachea por ruta `from`** — con el mismo `from`, las tres variantes devolvían el CSS de la primera y el resultado era un falso *"no poda"*, idéntico al de S0 y por un motivo completamente distinto.

**Instrumento vigente:** `src/app/v3/_lib/__tests__/tokens.invariant.ts` (`npm run test:s1-tokens`). Compila las tres variantes por el pipeline real, verifica el detector con control positivo antes de creerle un número, e imprime el listado de podados del día.

---

# Regla 11 · cifra → instrumento

| Cifras | Instrumento |
|---|---|
| URLs, bytes y sha256 de los binarios; los `@font-face` del css2 | `medicion-1-tipografia/descargar-fuentes.mjs` |
| unitsPerEm, x-height, cap, ascender, descender, ejes, instancias, bbox de `x`/`H`, control de subseteo, prueba de viveza | `medicion-1-tipografia/metricas.mjs` |
| OFL, copyright, fsType, tabla `name` | `medicion-1-tipografia/licencias.mjs` |
| factor 0,998, banda, tabla antes/después, reproducción de los clamp() y de la cuenta de Franco, cap height | `medicion-1-tipografia/escala.mjs` |
| las 26 cifras de Franco, superficies derivadas, matriz completa, veredictos | `medicion-2-contraste/contraste.mjs` |
| tintas media y tenue derivadas, su separación, foco en los dos sentidos, tinta clara, cotas del acento en la sección invertida, alfas de los bordes | `medicion-2-contraste/contraste.mjs` · PARTE E |
| CSS emitido, override con `@theme` y con `@theme inline`, namespaces | `prueba-tailwind/verificar.mjs` |
| poda de tokens — ⚠ RETRACTADA, ver corrección de S1 | `prueba-tailwind/poda.mjs` (original) · `src/app/v3/_lib/__tests__/tokens.invariant.ts` en `logic-core-v3` (vigente) |
| renombre a `--opacity-*` / `--container-*`, control negativo, los tres namespaces vivos bajo otra grafía | `prueba-tailwind/renombre.mjs` |
| acento con los nombres definitivos y la cadena de dos niveles del foco | `prueba-tailwind/verificar-develop.mjs` |
| el archivo final construido: compila, 48/48 utilidades, conteo de tokens | `prueba-tailwind/verificar-archivo-final.mjs` |
| la comparación token por token que respalda `DIFERENCIAS.md` | `comparar-tokens.mjs` |

Salidas crudas (`.txt` y `.json`) en las carpetas `salida/` de cada medición. Nada de este reporte es prosa sin productor.

**Cero commits. Cero escrituras fuera de `C:\develop-v3-cimientos\`. `C:\rediseno-home` intacto: solo lectura, y solo de `package.json`, `package-lock.json` y `node_modules/*/package.json`.**

---

# Los 26 namespaces de Tailwind 4.3.1 — corrección de la cabecera de Franco

Sondeados con builds reales, un token por namespace con nombre que no existe en el tema por defecto. **23 vivos, 3 muertos.**

| namespace | vivo | ¿lo usa el sistema de develOP? |
|---|---|---|
| `--color-*` | ✅ | **sí** — 14 tokens |
| `--font-*` | ✅ | **sí** — 3 (titulo, cuerpo, mono) |
| `--font-weight-*` | ✅ | **sí** — 4 |
| `--text-*` | ✅ | **sí** — 8 + 6 fluidas |
| `--leading-*` | ✅ | **sí** — 3 |
| `--tracking-*` | ✅ | **sí** — 4 |
| `--spacing-*` | ✅ | **sí** — 9 |
| `--radius-*` | ✅ | **sí** — 6 |
| `--shadow-*` | ✅ | **sí** — 1 |
| `--blur-*` | ✅ | **sí** — 1 |
| `--ease-*` | ✅ | **sí** — 2 |
| `--breakpoint-*` | ✅ | **sí** — 3 |
| `--opacity-*` | ✅ | **sí desde S0** — 4, renombrados |
| `--container-*` | ✅ | **sí desde S0** — 2, renombrados |
| `--transition-duration-*` | ✅ | **no** — `--duracion-*` sigue fuera de namespace |
| `--z-index-*` | ✅ | **no** — `--z-*` sigue fuera de namespace |
| `--border-width-*` | ✅ | **no** — `--border-hairline` sigue fuera |
| `--aspect-*` | ✅ | no — sin tokens |
| `--animate-*` | ✅ | no — sin tokens |
| `--drop-shadow-*` | ✅ | no — sin tokens |
| `--inset-shadow-*` | ✅ | no — sin tokens |
| `--perspective-*` | ✅ | no — sin tokens |
| `--text-shadow-*` | ✅ | no — sin tokens |
| `--duration-*` | ❌ **muerto** | — |
| `--z-*` | ❌ **muerto** | — |
| `--mix-blend-*` | ❌ **muerto** | — |

**El diagnóstico de Franco sobre `--duration-*` y `--z-*` es correcto**: esas grafías no son namespaces y sus tokens efectivamente no generan clase. Eso queda dicho, y el control negativo lo confirma en el mismo build.

## Las excepciones del bloque SIN UTILIDAD no eran dos: eran cinco

Lo que su cabecera no dice es que **los conceptos no están muertos por lo que SON sino por cómo se LLAMAN**. Los mismos tokens, escritos con la grafía inglesa que usa Tailwind, generan utilidad.

**Se renombraron las dos autorizadas. Las otras tres quedan medidas y sin aplicar** — es decisión de un sprint futuro, y acá está resuelta para que ese sprint no tenga que volver a medir.

### Lo que habría que renombrar — 10 tokens, ningún valor cambia

| token hoy | pasaría a | utilidad que ganaría | valor |
|---|---|---|---|
| `--duracion-rapida` | `--transition-duration-rapida` | `.duration-rapida` | `300ms` |
| `--duracion-media` | `--transition-duration-media` | `.duration-media` | `400ms` |
| `--duracion-lenta` | `--transition-duration-lenta` | `.duration-lenta` | `500ms` |
| `--duracion-muy-lenta` | `--transition-duration-muy-lenta` | `.duration-muy-lenta` | `700ms` |
| `--z-base` | `--z-index-base` | `.z-base` | `0` |
| `--z-elevado` | `--z-index-elevado` | `.z-elevado` | `1` |
| `--z-sticky` | `--z-index-sticky` | `.z-sticky` | `10` |
| `--z-cabecera` | `--z-index-cabecera` | `.z-cabecera` | `100` |
| `--z-overlay` | `--z-index-overlay` | `.z-overlay` | `10000` |
| `--border-hairline` | `--border-width-hairline` | `.border-hairline` | `1px` |

**Qué se gana:** dejan de consumirse como `duration-[var(--duracion-media)]` —valor arbitrario, sin autocompletado, sin verificación de que el token exista— y pasan a ser una clase de primera, con el mismo nombre en español.

**Qué no cambia:** ni un valor, ni la posibilidad de seguir usándolos con `var()`.

**Qué se queda donde está, con certeza:** `--blend-inversion`. Se sondeó `--mix-blend-*` y **no** es namespace. Y los cuatro de grilla y columnas (`--columna-lateral`, `--pad-lateral-compacto`, `--grilla-canal-*`), que no se sondearon contra `--spacing-*` porque eso ya sería una tercera decisión de nomenclatura y nadie la pidió.

**Advertencia para quien lo verifique:** el instrumento que compruebe ese renombre tiene que comparar contra `var(--token)`, **no** contra el nombre de la clase. Ver el bug más abajo — dos tokens distintos generan la misma clase y la comprobación por selector da falsos positivos.

Su cabecera lista 12 namespaces vivos. Son 23.

---

# Un bug en mi propio instrumento, que casi da un verde falso

Vale escribirlo porque es exactamente el tipo de error que la regla de los controles positivos existe para atrapar — y acá lo atrapó el control, no yo.

## Qué pasó

`renombre.mjs` buscaba las reglas del CSS emitido **por nombre de clase**:

```js
// MAL
function buscar(rs, clase) {
  return rs.find((r) => r.prelude.split(',').includes(escapar(clase)));
}
```

El problema: **dos tokens distintos pueden generar la misma clase.** `--duracion-media` y `--transition-duration-media` producen las dos el nombre `duration-media`. Como en ese build estaban declarados los dos, y el segundo **sí** generó `.duration-media`, la búsqueda del primero encontró esa regla y se la atribuyó.

## Qué reportó de más

```
duration-media   --duracion-media   *** SI ***     ← FALSO
z-overlay        --z-overlay        *** SI ***     ← FALSO
```

Es decir: el instrumento dijo que los tokens de Franco **sí** generaban utilidad. Eso habría dado por bueno lo contrario de lo que es cierto, y encima habría "refutado" su diagnóstico, que es correcto.

## Cómo se detectó

No lo detecté leyendo el código: lo detectó **el control negativo del propio instrumento**, que pasó de `true` a `false` al agregar la segunda ronda de sondas. Un control negativo que se rompe cuando agregás sondas nuevas es una señal de que el instrumento, no el sujeto, cambió de opinión.

## El arreglo

El discriminador no es el nombre de la clase: es **a qué token referencia la declaración emitida**.

```js
// BIEN
function buscarPorToken(rs, clase, token) {
  return buscarTodas(rs, clase).find((r) => r.decl.includes(`var(${token})`)) || null;
}
```

Y se registra aparte el caso de la clase homónima, para no confundir "no genera" con "no existe":

```
duration-media  --duracion-media  no  (hay una clase homónima, generada por OTRO token:
                                       transition-duration:var(--transition-duration-media))
```

Con el arreglo, el control negativo vuelve a sostenerse: **las 10 grafías de Franco no generan ninguna utilidad**, y las 3 grafías inglesas sí. Las dos afirmaciones son ciertas a la vez y no se contradicen — que era justamente lo que el bug ocultaba.

## Por qué importa más allá de este caso

Cualquier verificación que identifique una utilidad de Tailwind **por su nombre de clase** tiene este agujero, porque el nombre de la clase no determina el token que la generó. Si en un sprint futuro se verifica el renombre de los otros tres grupos, el instrumento tiene que comparar contra `var(--token)`, no contra el selector.

---

# La verificación óptica pendiente ya tiene objeto concreto

El criterio de x-height está bien aplicado y **no se cambia**: factor 0,998, dentro de banda, la escala transfiere.

Pero la cap height de Chivo es **686 contra 720** de Instrument Sans: **−4,72%** a igual tamaño en px. La razón cap/x pasa de 1,4118 a 1,3425.

**Qué hay que mirar, concretamente:** los **niveles de display** —`--text-titulo-l` (44px) y `--text-titulo-xl` (56px)— compuestos en Chivo, en un navegador. En **Title Case la mayúscula domina el tamaño percibido**, así que un titular que en Instrument Sans llenaba su caja va a leerse ~5% más chico en Chivo aunque el px sea idéntico. En cuerpo de texto no se va a notar, porque ahí manda la x-height y esa coincide casi exacto.

Eso es lo que la medición no puede cerrar y un humano sí.

---

# Registro: la inconsistencia de copyright de Chivo Mono

El binario de Chivo Mono declara `Copyright 2018 The Chivo Project Authors`; el `OFL.txt` de su directorio en `google/fonts` dice `Copyright 2019`.

**Misma licencia (SIL OFL 1.1), mismos autores, mismo proyecto, mismo repositorio upstream.** No afecta el estado OFL, no afecta el costo (USD 0) y no afecta el permiso de auto-hospedaje (`fsType 0`). Queda anotado como registro porque lo encontró el control y taparlo sería peor que decirlo.

---

# Fuera de scope, para vos: hay un repositorio git en la raíz de `C:\`

**Hallazgo, no tocado.** Al empezar el sprint, `git status` desde `C:\develop-v3-cimientos` devolvió cientos de rutas de todo el disco. `git rev-parse --show-toplevel` desde ahí devuelve **`C:/`**.

Hay un repositorio git inicializado en la raíz del disco, en rama `master`, **sin ningún commit todavía** (`fatal: your current branch 'master' does not have any commits yet`). Trackea como no-rastreados `Windows/`, `Program Files/`, `Users/`, `ProgramData/`, `hiberfil.sys`, `pagefile.sys`, `$Recycle.Bin/` y todos los proyectos del disco, incluido `rediseno-home`.

**El riesgo, concreto:**

1. **Cualquier `git add` sin ruta explícita** (`git add .`, `git add -A`) ejecutado desde cualquier carpeta del disco que no tenga su propio `.git` intentaría indexar **el disco entero**. Con `pagefile.sys` y `hiberfil.sys` adentro, eso son decenas de GB y un cuelgue casi seguro.
2. **Un `git commit` ahí adentro** metería rutas de sistema y datos personales en un historial.
3. **Es una trampa silenciosa**: cualquier carpeta de proyecto que no tenga su propio `.git` queda automáticamente bajo ese repo, y los comandos de git "funcionan" en vez de fallar con *not a git repository*. Justamente por eso este sprint no ejecutó **ni una sola operación de git**.
4. `C:\rediseno-home\logic-core-v3` sí parece tener su propio repo, así que estaría aislado — pero no lo verifiqué, porque verificarlo requería correr git ahí y la restricción lo prohibía.

**Sugerencia, para cuando quieras y fuera de este sprint:** revisar si ese `C:\.git` fue intencional. Si no lo fue, borrarlo es inmediato y no afecta a ningún repo de proyecto que tenga su propio `.git`. Si lo fue, al menos merece un `.gitignore` en la raíz.

No lo toqué y no voy a tocarlo.

---

# 🛑 PARADA 1 — RESUELTA

Los tres resultados confirmados y las cinco decisiones tomadas. Cada una con la cifra que la respalda, producida después del OK:

| # | decisión | cómo quedó, con su número |
|---|---|---|
| 1 | Acento en sección invertida: **relleno o subrayado. Nunca texto.** Sin variantes claras. **Regla corregida con la medición** — ver abajo | Escrita en el token y en el bloque `[data-seccion="invertida"]`, con los tres valores (**2,71 · 2,99 · 2,46**) y el disparador: si hiciera falta como texto, tres variantes con **Y ≥ 0,19476** |
| 2 | Foco: **`--color-foco: var(--color-tinta)`**, la sección invertida redefine la tinta | Pasa 3:1 **en los dos sentidos**: 13,62:1 peor caso sobre claro, 18,00:1 sobre `#0E0E0E`. Cero tokens nuevos. La cadena es de **dos** niveles de `var()` —uno más que la del acento— y se verificó entera en un build real, no se asumió |
| 3 | Tinta clara = **el papel `#F7F7F5`** | **18,00:1** sobre `#0E0E0E`. Franco no tiene esa simetría: su fondo claro `#F2EEE6` y su tinta clara `#EDE9E1` son dos hex distintos a 1,0464:1 entre sí, porque su sistema es cálido |
| 4 | Tintas secundaria y terciaria **ahora**, método espejado | **`--color-tinta-media: #535353`** (peor 5,55:1) y **`--color-tinta-tenue: #5A5A5A`** (peor 4,97:1). **Las dos pasan AA en las cuatro superficies.** Ver abajo la advertencia que pediste no tapar |
| 5 | Renombrar a `--opacity-*` y `--container-*` | **Verificado con CSS emitido y control negativo.** Y apareció algo: no eran dos las excepciones, **eran cinco** |

## La regla del acento en sección invertida, corregida por la medición

La decisión 1 llegó como *"relleno, borde o subrayado"*, espejando la regla de Franco. **La medición corrige el "borde".**

| acento sobre `#0E0E0E` | razón | AA texto 4,5:1 | mínimo de componente 3:1 |
|---|---|---|---|
| web `#1D5B8F` | **2,71** | ❌ | ❌ |
| ia + automatización `#1B6B4C` | **2,99** | ❌ | ❌ |
| software `#57429E` | **2,46** | ❌ | ❌ |

Son **dos fallas, no una**. Que fallen como texto se esperaba: es el espejo exacto de la restricción que obligó a Franco al fondo negro. Que **tampoco lleguen a 3:1** no estaba previsto, y es lo que cambia la regla.

### La regla queda así

> El acento en sección invertida va como **RELLENO** o como **SUBRAYADO**.
> Nunca como texto. **Nunca como el único indicador de un límite de componente.**

Un borde de acento ahí es **decorativo**: sirve para acompañar un límite que ya se ve por otra cosa, no para *ser* ese límite. Si el borde de acento es lo único que marca dónde termina una tarjeta o dónde empieza un campo de formulario, ese límite no se ve.

Como relleno funciona con holgura — el papel encima da **6,65 · 6,02 · 7,31**, los tres pasan AA.

En el sistema de Franco esto no aparece porque sus acentos son colores de tema oscuro *sobre* fondo oscuro y llegan a 3:1 de sobra. Es una asimetría real entre los dos sistemas, no una traducción defectuosa.

---

## Lo que pediste que no tape: las dos tintas están al borde de ser indistinguibles

`--color-tinta-media` y `--color-tinta-tenue` quedan a **1,1153:1** entre sí, ΔL\* 2,94.

**No las forcé ni las degradé.** Las dos pasan AA 4,5:1 como texto sobre las cuatro superficies claras, que era la condición. Pero hay que saber esto antes de usarlas:

**El par de Franco está igual de cerca: 1,1140:1, ΔL\* 3,29.** El método espejado reprodujo fielmente la separación de su sistema — no es un defecto introducido acá, es una propiedad heredada. Si el par te resulta demasiado cerrado en pantalla, el problema viene de origen y la decisión de separarlas es tuya.

**Margen disponible, por si querés:** la terciaria puede llegar hasta **5,8165:1** contra el papel (`#616161`) y seguir pasando AA en la peor superficie clara. Eso las separaría **1,2420:1**. Es una cota, no una propuesta.

---

# 🛑 PARADA 2 — el archivo está escrito, espero tu OK

## Lo que quedó

| archivo | qué es |
|---|---|
| **`theme-develop.css`** | El sistema de develOP. 89 tokens, 4 bloques de override |
| **`DIFERENCIAS.md`** | Token por token contra el de Franco, producido por `comparar-tokens.mjs` |
| `comparar-tokens.mjs` + `salida-diferencias.txt/.json` | El instrumento que produce esa comparación y sus datos crudos |

**No se copió a ningún repo. Cero commits. `C:\rediseno-home` intacto.**

## ⚠️ El archivo NO se llama `theme.css`, y necesito que decidas

La Parada 2 pedía escribir `C:\develop-v3-cimientos\theme.css`. **Ese path ya está ocupado por el `theme.css` de Franco** — el que vos me diste y del que este sprint lee todo: la escala que `escala.mjs` parsea, las 26 cifras que reproduce el control de contraste, la lista de namespaces de su cabecera.

Sobrescribirlo habría destruido la entrada del sprint y roto la reproducibilidad de los instrumentos, sin vuelta atrás desde acá. Así que escribí **`theme-develop.css`** y te lo dejo a vos: si querés que ocupe `theme.css`, hay que renombrar el de Franco primero y actualizar la ruta en `escala.mjs` y `comparar-tokens.mjs`. Es un minuto, pero es tu llamada.

## El archivo está construido, no sólo escrito

`prueba-tailwind/verificar-archivo-final.mjs` toma **el archivo real, tal cual**, le antepone el `@import` de Tailwind y lo compila con `next build --webpack` contra 4.3.1:

- **compila sin error**, 12.666 bytes de CSS emitido;
- **48 de 48** utilidades prometidas se generan (`.text-acento`, `.outline-foco`, `.max-w-dominante`, `.opacity-tenue`, `.escritorio:block`…);
- **control negativo**: las 4 clases del bloque SIN UTILIDAD no generan nada;
- los conteos de la cabecera los produce el instrumento, no los conté a mano.

## Resumen de la comparación

| | Franco | develOP |
|---|---|---|
| tokens en `@theme` | 99 | **89** |
| idénticos | — | **67** |
| cambiados | — | **14** |
| renombrados | — | **6** |
| eliminados | — | **12** |
| nuevos | — | **2** |

**−10 tokens, y no por recortar:** mueren las 4 variantes brillantes + su token contextual (5) porque los tres acentos de develOP pasan donde el violeta de Franco falla; mueren los 5 tokens paralelos `--color-claro-*` porque la sección invertida se resuelve con el mismo mecanismo de override del acento, en 4 líneas; y muere el cuarto acento (2).

---

# Método: cómo transferir un token definido con alfa compuesto

**Esto no es una nota sobre `--color-borde-fuerte`. Es el criterio, y aplica a cualquier token de Franco definido como un `rgba()` sobre un fondo.**

## El problema, medido

La composición alfa **no es simétrica**. Un mismo alfa produce razones de contraste distintas según se componga sobre oscuro o sobre claro, porque la luminancia resultante cae en tramos distintos de la curva gamma.

| | alfa | compuesto sobre | razón |
|---|---|---|---|
| Franco, `rgba(237,233,225, α)` | **0,38** | su fondo oscuro `#0D0B09` | **3,09:1** ✅ |
| develOP, misma alfa copiada | **0,38** | papel `#F7F7F5` | **2,37:1** ❌ |
| develOP, alfa derivada | **0,47** | peor superficie clara | **3,01:1** ✅ |
| develOP, la misma | **0,47** | sección invertida `#0E0E0E` | **4,62:1** ✅ |

Copiar el 0,38 habría dejado un token que **parece transferido y no cumple lo que su propio comentario promete**: 2,37:1 está por debajo del mínimo de 3:1 de un límite de componente.

## El criterio

El comentario de Franco documenta el token como *"límite de componente — **3,09:1**"*. Lo que define la intención ahí es **la razón**. El alfa es sólo cómo la consiguió sobre *su* fondo — es el resultado de un cálculo hecho contra otra base.

> **Cuando un token de Franco esté definido con alfa y su comentario declare una razón de contraste: transferir la RAZÓN y re-derivar el alfa sobre el fondo nuestro. Nunca copiar el alfa.**

Un solo alfa derivado (**0,47**) sirve para los dos temas de develOP, así que el sistema no paga complejidad por esto.

## A qué otros tokens aplica

En el archivo de Franco hay cuatro tokens con alfa compuesto. Dos entraron a develOP y dos murieron con el tema claro paralelo:

| token | estado | tratamiento |
|---|---|---|
| `--color-borde-fuerte` | transferido | **razón re-derivada** — declara 3,09:1, es el caso de arriba |
| `--color-borde` | transferido | alfa copiada, y está bien: es decorativo y **su comentario no declara ninguna razón**, así que no hay intención de contraste que preservar |
| `--color-claro-borde` | eliminado | murió con los cinco tokens `--color-claro-*` |
| variantes brillantes | eliminadas | no usan alfa |

La distinción es esa: **si el comentario declara una razón, la razón es el contrato y el alfa es implementación.** Si no la declara, el alfa es el valor y se copia.

## Tres `[pendiente]`, cada uno con su disparador escrito

Ninguno es un olvido:

1. **Superficies elevadas de la sección invertida** — no las inventé: el brief declara `#0E0E0E` y nada más. Disparador y método escritos.
2. **Variantes claras del acento** — con los tres valores actuales y la cota `Y ≥ 0,19476`.
3. **Opacidad de `--shadow-flotante`** — el 0,45 se eligió sobre base oscura; sobre papel claro es otra cosa. Se transfirió sin tocar porque cambiarlo sin mirarlo sería inventar. Es lo primero para la verificación óptica.

## Lo que decidí solo en esta parada

| # | qué | por qué |
|---|---|---|
| 7 | Nombrar el token del papel **`--color-fondo`** y no `--color-papel` | El nombre dice la **función**, que es la convención que transfiere del archivo de Franco. "El papel" queda en el comentario. Se cambia en una línea |
| 8 | Atributo **`[data-servicio="ia-automatizacion"]`** | La Medición 3 se corrió con `"ia"`. Para que lo probado sea exactamente lo escrito, **volví a construir** con los nombres definitivos: `verificar-develop.mjs` |
| 9 | Derivar la alfa de `--color-borde-fuerte` en vez de copiarla | Explicado arriba. Es el único valor donde no transferí el número de Franco |
| 10 | **No** renombrar los otros tres grupos (`--duracion-*`, `--z-*`, `--border-hairline`) | Autorizaste dos renombres, no cinco. Quedan reportados sin aplicar |
| 11 | **No** agregar un quinto peso (300) aunque Chivo lo tenga | Agregarlo es decisión de sistema, no consecuencia de la medición. Queda escrito en el archivo para que se decida con el dato |
