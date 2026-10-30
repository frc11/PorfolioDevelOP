# SPRINT S2c — Los planes de IA en tarjetas por debajo de 768 px

Versión 2 · 2026-10-17 · Autor: CC (S2c) · Viene de: `docs/servicios/SPRINT-S2b.md` (§9, decisiones 2 y 3). La versión 1 cortaba en 640; el corte pasó a 768 por decisión de Valentino (§6 y §7).

**Estado en una línea:** por debajo de 768 px (el `md` de Tailwind) los planes de IA son una tarjeta por plan y desde 768 px sigue la tabla de hoy, **entera**; las dos versiones van en el marcado y las alterna el CSS, sin JavaScript. En la tarjeta el «Por mes» va en el nivel `titulo-m` del Titular. El gate está en verde y la pasada en Chromium da 767 → tarjetas, 768 → tabla sin corte y ningún desborde de la página en ningún ancho. Commit «S2c: planes en tarjetas por debajo de 768».

---

## 1. Qué cambió en el código

| Archivo | Cambio |
|---|---|
| `_servicios/bloques/precio/Planes.tsx` | Las dos versiones de los planes van en el marcado: la tabla de hoy, sin cambios, se oculta por debajo de 768 (`max-md:hidden`) y la lista de tarjetas se oculta desde 768 (`md:hidden`). Es `display: none` en el ancho que no les toca, así que el texto no se lee dos veces ni el teclado llega a una región oculta. Cada versión lleva `data-planes` (`tabla` / `tarjetas`) como gancho de los tests. El archivo pasa de una función a tres (`Planes`, `TablaDeLosPlanes`, `TarjetasDeLosPlanes`): 73 → 123 renglones. |
| `_servicios/bloques/precio/vistaDeLosPlanes.ts` | La vista suma `tarjetas`: la misma tabla leída por columnas (el plan *i* toma la celda *i* de cada fila). Sale de las filas y no de los planes, así que nada se formatea dos veces, las dos versiones no pueden diferir y lo que falta en producción (la fila de funcionalidades) falta igual en las dos. |
| `__tests__/slots.invariant.ts` | 34 → 44 afirmaciones: sección nueva 5 («las tarjetas son la tabla leída por plan»), con dos controles positivos. |
| `__tests__/pagina.invariant.tsx` | 123 → 143 afirmaciones: las dos versiones están en el marcado y cada una lleva su clase de breakpoint (cinco controles: sin `max-md:hidden`, sin `md:hidden`, las dos cruzadas, el corte viejo de 640 y una versión sola); los cinco datos de cada plan están en su tarjeta, cada uno con su rótulo (tres controles); el «Por mes» es el único valor en el nivel `titulo-m` y los demás van en Cuerpo (tres controles); y la sección nueva 12 sobre «Probá el panel» (§2). La sección de la ruta pasa a ser la 13. |

**La tarjeta.** El nombre del plan es un `h3` (igual que los calibres de Páginas web) y debajo hay una lista de definición (`dl`) con un dato por renglón: el rótulo chico en tinta media arriba y el valor abajo. Los cinco datos de cada plan son el nombre, «Por mes», «Conversaciones», «Soporte» y «Cambios web incluidos»; en desarrollo suma «Funcionalidades» con el marcador, igual que la fila de la tabla. Una regla arriba y sin fondo propio (el vidrio es del panel), el mismo lenguaje que los calibres.

**El «Por mes» es el valor más grande.** Va en `<Titular nivel="titulo-m" como="span">` dentro del `dd`, en el acento, que es el mismo nivel con el que los calibres de Páginas web muestran su «Desde»: sale de la escala del home, sin ningún tamaño propio. La escala es fluida: mide 18,2 px a 390, 22,3 a 700 y 23,2 a 767, contra los 15 px del resto de los valores y los 17,0–18,1 px del nombre del plan (`titulo-s`). Los otros cuatro valores siguen en Cuerpo.

**El corte es el `md` de Tailwind (48 rem = 768 px),** el mismo ancho que el token `tablet` del home. El CSS que sirve el dev trae las dos reglas: `md:hidden` con `@media (width >= 48rem)` y `max-md:hidden` con `@media (width < 48rem)`.

Nada fuera de `src/app/v3/_servicios/` y `docs/servicios/`. `Prueba.tsx` y todo lo del home quedan sin tocar y ningún test existente se aflojó.

---

## 2. «Probá el panel»: ya es el Cta del home, tal cual

El pedido era confirmar que usa la «variante secundaria» del `Cta` del home y, si era un estilo armado a mano, pasarlo a ella. **No hay estilo armado a mano y esa variante no existe:**

- Las variantes del `Cta` del home son dos, `linea` y `bloque` (`VARIANTES_CTA`), y son de **forma** (en línea y de ancho completo), no de jerarquía. El registro (`cuerpo` / `rotulo`) es el otro eje y tampoco lo es.
- `PanelDeLaDemo` (en `Prueba.tsx`) renderiza `<CtaEnlace href rotulo />` sin `className` ni `style`: la variante por defecto, en tinta.
- La jerarquía de la página la pone el envoltorio de los **llamados principales** (`ESTILO_DEL_CTA`, que redefine `--color-tinta` con el acento); el enlace al panel no lo lleva. Esa es la diferencia entre principal y secundaria, y es la decisión 3 de la S2b.
- **Medido en el navegador** (§5): el enlace tiene `data-variante="linea"`, `data-registro="cuerpo"`, la clase `text-base no-underline` que le pone el propio componente, ningún `style`, y el color calculado es `rgb(247, 247, 245)`, la tinta del tema (`#F7F7F5`). El llamado principal («Quiero mi asistente con IA») da `rgb(127, 203, 164)`, el acento (`#7FCBA4`).

No hay nada que cambiar y no cambia de color. Para que no se pierda, la sección 12 de `pagina.invariant.tsx` afirma que el `<a>` del bloque Prueba es **byte por byte** el `CtaEnlace` del home con esos datos y que ningún envoltorio del bloque redefine la tinta (y la inversa: los llamados sí). Lleva dos controles positivos. Al escribirla apareció un falso positivo del propio detector, que se corrigió: el vidrio del panel *lee* `--color-tinta` con `var()` para mezclar su 4 %, y eso no es recolorear; el detector busca la *redefinición* (`--color-tinta:`).

---

## 3. Gate sin navegador

| Paso | Resultado |
|---|---|
| ESLint de los 4 archivos tocados | 0 errores, 0 avisos |
| `datos` · `precios` · `slots` · `seo` · `pagina` (`npx tsx`) | 48/0 · 22/0 · **44/0** · 56/0 · **143/0** |
| Mutación sobre los fuentes | con el corte de 640: sin la clase de ocultar de las tarjetas (2 fallas), sin la de la tabla (2), sin el dato «Soporte» en la tarjeta (1 en `pagina` y 6 en `slots`) y «Probá el panel» con una clase propia (1); con el corte de 768: volver al `sm` (2) y bajar el «Por mes» a `titulo-s` (1). Cada una la atrapa un test, y los fuentes se restauraron byte por byte |
| Seis barridos (§5.1 del plan) | `s4-paquete` 21/0 · `s8-montaje` 56/**2** (las mismas dos fallas de la base, línea por línea: seis archivos del home pasan las 300 líneas, ninguno de `_servicios`) · `s8-escena` 33/0 · `s9-sentry` 22/0 (2 fuera de ventana) · `s40-3d-sonido` 38/0 · `s53-pulido-2` 54/0 |
| **tsc completo** | **0 errores** (13 s, incremental) |

El control del corte viejo de 640 arma sus clases por partes: el escaneo de Tailwind lee hasta los tests, y una clase escrita entera allí emitiría una regla muerta en el CSS de todas las páginas.

---

## 4. Cómo se midió

- **Servidor:** `next dev --webpack -p 3001` (Next 16.2.9), lanzado desacoplado del arnés con la salida a archivos (`C:\paginas-servicios-datos\dev-S2c.out.log` y `.err.log`).
- **Navegador:** Chromium (la build de Playwright 1.61.1), sin WebGL y con `home:intro=1` en `sessionStorage`, como en la S2b. Ventanas emuladas de 320 a 1280 en la primera pasada (corte en 640) y, con el corte en 768, de **390** (táctil), **700**, **767**, **768** (de escritorio y táctil) y **1280**. La página siempre visible (`visibilityState` e `innerWidth` se comprueban antes de medir). Los scripts están en el scratchpad de la sesión, **no en el repo**; miden y no escriben nada. Resultados en `C:\paginas-servicios-datos\s2c\*.json`.
- **El formulario no se envió y no se escribió en ningún campo.** En todos los anchos: cero llamadas a `/api/*`, cero respuestas ≥ 400, cero requests fallidos; el único error de página es «Error creating WebGL context», el de correr sin WebGL.
- **No se despachó `visual-qa`** (levantaría su propio servidor de preview con la memoria justa): la pasada la hizo CC contra el dev de `:3001`, con medición de DOM, árbol de accesibilidad, contraste y capturas.
- **Un incidente de memoria.** A las 22:00 el home levantó su dev (`C:\rediseno-home`, ~2,4 GB) y la memoria libre bajó a 0,2 GB. En esa ventana los workers de Next de mi dev cayeron («Jest worker encountered 2 child process exceptions», después `EPIPE`), la ruta pasó a `500` y la primera corrida de la cola falló esperando el `h1`. La causa exacta no la verifiqué: lo que se vio es la coincidencia con la baja de memoria. Reinicié mi dev y repetí **una vez**; esa segunda corrida pasó entera. Los procesos del home no se tocaron.
- **El candado se terminó** (contrato v3, O-3): la carpeta `C:\develop-pesado.lock` se borró y no se usa más. Rige lo de siempre: si un proceso muere por memoria se reintenta una vez, y si vuelve a morir se reporta.

---

## 5. La pasada con el corte en 768 (`/v3/ia-y-automatizaciones`)

| Ancho | Qué se ve | Documento | Tabla (caja / contenido) | Tarjetas | «Por mes» | Foco programático en la región de la tabla |
|---|---|---|---|---|---|---|
| 390 (táctil) | **tarjetas** | sin desborde | oculta | 276 × 413, dentro del panel | 18,2 px | no |
| 700 | **tarjetas** | sin desborde | oculta | 586 × 418, dentro del panel | 22,3 px | no |
| **767** | **tarjetas** | sin desborde | oculta | 653 × 420, dentro del panel | 23,2 px | no |
| **768** | **tabla** | sin desborde | 654 / 654 → **entra entera, sin corte** | ocultas | — | sí |
| 768 (táctil) | **tabla** | sin desborde | 654 / 654 → entra entera | ocultas | — | sí |
| 1280 | **tabla** | sin desborde | 761 / 761 → entra entera | ocultas | — | sí |

- **Una versión por ancho, nunca las dos.** Cada plan (Starter, Pro, Business) aparece **una vez** en el texto visible (`innerText`) en todos los anchos, y cada cifra una vez por plan que la lleva (el «Estándar» sale dos veces porque Starter y Pro lo comparten). En el árbol de accesibilidad solo hay una de las dos estructuras: a 767 una `list "Planes"` con tres `listitem`, cada uno con su `heading` y sus pares `term` / `definition`; a 768 una `table "Planes"` con su `caption`, sus `columnheader` y sus `rowheader`.
- **Las tarjetas** no tienen fondo propio (`rgba(0, 0, 0, 0)`), caben en el panel sin desbordar y ningún dato desborda su renglón. Lo opaco de la página sigue siendo solo la tapa y el punto del rótulo del `h1`; el único acento es `#7FCBA4`.
- **Contraste, mínimo 4,5:1:** el rótulo (`#9E9E9E` sobre el vidrio `#171717`) da **6,67:1**, el «Por mes» en el acento (`#7FCBA4`) da **9,35:1** y el valor en tinta (`#F7F7F5`) da unos **16,7:1** (calculado con los mismos colores). El mínimo de toda la página es 6,67:1 y no hay ningún par bajo 4,5:1, en ningún ancho.
- **«Probá el panel»:** ver §2; en tinta en todos los anchos.

---

## 6. El corte: de 640 a 768

La primera versión cortaba en 640, como se pidió. Con ese corte la pasada mostró que la tabla pide 640 px (es su mínimo) y su caja mide **el ancho de la ventana menos 114** (64 de márgenes de la página, 2 del borde del panel y 48 de su relleno): a 640 la caja medía 526 y a 700, 586. Un barrido de 640 a 800 dio que la tabla **entra entera recién desde 754 px**, así que entre 640 y 753 quedaba cortada por la derecha y sin ninguna pista (a 640 el «Prioritario 24 h» de Business se leía «Prioritario 2»): el mismo defecto que se vio a 390 en la S2b.

Valentino decidió cortar en el `md` de Tailwind (768). A 768 la caja mide 654 contra los 640 de la tabla: entra con 14 px de sobra, en escritorio y en táctil. (En este Chromium el ancho disponible no descuenta barra de scroll; en un navegador de escritorio con una barra clásica de unos 15 px, a exactamente 768–769 sobraría un píxel de scroll interno. Es una estimación que no medí.)

---

## 7. Decisiones de Valentino (tras ver la pasada)

1. **El corte de la tabla de planes pasa de 640 a 768** (el `md` de Tailwind): tabla desde `md`, tarjetas por debajo. Hecho (§1, §6).
2. **En la tarjeta, el «Por mes» más grande que el resto de los valores, con un nivel de la escala del home.** Hecho con el `titulo-m` del Titular, sin tamaños propios (§1). Si en teléfono se quiere más contraste (a 390 mide 18,2 px contra 15 de los otros valores), el nivel siguiente es `titulo-l`: es un cambio de una palabra.
3. **El candado se terminó** (contrato v3, O-3): se borró la carpeta y no se usa más (§4).

---

## 8. Pedidos y observaciones

- **Ningún pedido nuevo al home.** Siguen P-H10 (sprint P-H), P-H11 (B1.2b) y la sugerencia P-H12 de la S2b.
- Los `[a definir]` que se ven (Funcionalidades, Implementación desde) son marcadores de desarrollo: en producción no se montan (lo cubre el invariante, igual que en la S2b).

---

## 9. Cierre

- **Un solo commit,** «S2c: planes en tarjetas por debajo de 768», con staging archivo por archivo y `git status --short` antes y después: `Planes.tsx`, `vistaDeLosPlanes.ts`, `slots.invariant.ts`, `pagina.invariant.tsx` y este LOG. `SPEC.md` y `CONTRATO.md` siguen sin trackear a propósito. Nada fuera de `src/app/v3/_servicios/` y `docs/servicios/`.
- **Cierre de recursos:** el dev de `:3001` apagado (puerto libre), sin procesos del navegador de prueba y la carpeta del candado borrada.
