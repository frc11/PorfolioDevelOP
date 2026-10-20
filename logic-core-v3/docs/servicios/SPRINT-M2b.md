# M2b — El precio en el teléfono, con las historias comunes

**Rama:** `paginas/servicios`. **Corrida desatendida** del 2026-10-20: «merge-4 + M2b». Lo que no estaba en el prompt lo decidí yo, por lo más conservador, y está en la §5 («decidido por CC, revisar»).

**Qué es:**
- **Paso 0:** verificar el merge-4 (`b0ba408b`, Valentino mergeó `rediseno/home`) y anotar qué trajo B12a y si cambia algo del V0. El V0 no se toca.
- **M2b:** el precio de Páginas web por debajo de 768, con las historias comunes del home (`_componentes/historias/`). Desde 768 nada cambia: queda la b escalonada del M2a.

---

## 1. Paso 0 — el merge-4

### 1.1 Qué trajo

`b0ba408b` mergea siete commits de `rediseno/home`. Son 64 archivos, ninguno en la zona de servicios (`_servicios/`, `[servicio]/`, `docs/servicios/`, `scripts-servicios/`, `public/servicios/`):

| Commit | Qué |
|---|---|
| `5ef4ce83` | B1.2d A2, los ajustes del Portfolio de escritorio |
| `8336ba14` | **B1.2d B: las historias comunes** (`_componentes/historias/`, P-H19) y los campos del formulario en `_componentes/formularios/Campos.tsx` |
| `fcd57f53` | **B12a.1:** el preset de la página y la escena consciente de la ruta |
| `edd64c7c` | **B12a.2:** la intro de la página, la composición inicial y `AVANCE_DE_LA_INTRO` |
| `b75a8482` | **P-H26 y P-H27:** el foco al cerrar el contacto, y quién puede importar `BotonPausa` |
| `8926656a` | **`docs/rediseno/B12a-API.md`:** las firmas definitivas para servicios (P-H28) |

`package.json` suma dos scripts del home (`test:s78-b12a` y `test:s78`).

### 1.2 La verificación (sin `next build`)

- **tsc:** la primera corrida dio 124 líneas de errores, todas en `.next/dev/types/routes.d.ts`: los tipos generados estaban corruptos (el caso conocido). Borré `.next/dev/types` y la segunda corrida dio **0 errores** (40 s).
- **Los tests de servicios:** iguales a la base del V0.
  - datos 55/0, precios 22/0, slots 44/0, seo 56/0, pagina 240/0, medios 26/0, diagonales 47/0, escena 45/0;
  - s38, s44 y s74, 0 invariantes con falla;
  - s25-contacto 35/0;
  - **s77 pasó de 35 a 44 afirmaciones, 0 fallas:** las nuevas son del home (P-H26 §4 y la lista de P-H27 §1).
- **Los 6 barridos:** iguales a la base.
  - s4-paquete 21/0, s40 38/0, s53 54/0 y s8-escena 33/0;
  - **s8-montaje 56/2:** las dos fallas de siempre. Solo cambian dos cifras de esas fallas, por archivos del home: el padrón tiene 357 archivos no declarados (antes 354; los tres nuevos son `_lib/escena/ruta/`), y `OrbitRig.tsx` tiene 651 líneas (antes 648);
  - s9-sentry 22/0, con 2 fuera de ventana, como en la base.
- **Lo que importamos del home sigue igual.** `_servicios/` y `[servicio]/` importan 36 módulos de afuera, y el merge no cambió ninguno.
  - El cruce marcó uno, `BotonPausa`, pero es un falso positivo: el import está escrito como texto dentro de un control de `pagina.invariant.tsx:676`, no en código.
- **Nada falló por el merge**, así que no hubo nada que anotar sin arreglar.

### 1.3 Qué trajo B12a y qué cambia del V0 (el V0 no se tocó)

**Lo que llegó al código:**
- **El preset de ruta:** `PresetDeLaEscena` (`_lib/escena/ruta/preset.ts:19-34`), `PRESET_DEL_HOME`, la pila (`apilarElPreset`) y `<PresetDeLaPagina>`.
- **La intro:** `IntroDeLaPagina` (`_componentes/pagina/IntroDeLaPagina.tsx`): el bloque de 1,5 pantallas con el `h1` y la bajada, que declara el preset. Su atributo es `data-intro-de-pagina`.
- **El avance:** `AVANCE_DE_LA_INTRO` (`_lib/escena/ruta/pistaDeLaIntro.ts:69`) va de 0 a 1 en `PANTALLAS_DE_LA_INTRO = 1.5` pantallas, medido en el layout.
  - Es un canal propio, no el progreso del rig.
  - La composición inicial es `COMPOSICION_INICIAL`: la pose del hero, con el logo centrado (`:31`).
  - La pose de la intro sigue detrás de `?intro=1|2|3`, hasta que Valentino elija.
- **La luz de la página:** `luzDeLaPagina` (`:92-95`) toma la del principio del recorrido y, si el preset es de noche, la acota a `NIVEL_DE_LA_NOCHE`.

**Lo que NO llegó: la ranura.** Es B12a.3 (`B12a-API.md` §4: `esc/ruta/variante.ts` y `RanuraDeLaVariante.tsx`). El preset del código todavía no tiene `variante`.

**Qué cambia del V0** contra `escena/firmas.ts` y `escena/presetDeWeb.ts`. Va al ajuste del montaje (`SPRINT-V0.md` §6.1) y no se aplicó:

| Pieza | El V0 (copia local) | B12a (código o API) | Qué cambia |
|---|---|---|---|
| `IdDePagina` | `'home' \| IdDeServicio \| 'pagina'` | `'home' \| IdDeServicio \| 'prueba'` | el nombre de la página de prueba |
| `pista` | `'home' \| readonly ChoreoKeyframe[]` | `readonly ChoreoKeyframe[] \| null` (`null` en el home; las páginas, `PISTA_DE_LA_INTRO`) | la forma: **resuelve P-H29g** (la pista compartida se importa del home cuando Valentino elija la pose) |
| `tramos.intro` | `[data-intro-de-servicio]` (el atributo de nuestro `Intro.tsx`) | `SELECTOR_DE_LA_INTRO = '[data-intro-de-pagina]'` (B12a.3) | `Intro.tsx` deja su atributo, su alto de una pantalla y la tapa: pasan a ser los de `IntroDeLaPagina` (`B12a-API.md` §2) |
| `variante` | un argumento de `presetDeWeb` | un componente exportado de un módulo `'use client'`: la referencia de cliente cruza de la página de servidor a `PresetDeLaPagina` (D1) | **resuelve P-H29e**, por un camino distinto del que recomendé (yo proponía la salida 2, el id con import dinámico). Queda el riesgo 5 del V0: la variante no puede traer three a la carga inicial |
| `PropsDeLaVariante`, `ComponenteDeVariante`, `PRESUPUESTO_DE_LA_VARIANTE` | copias locales | las mismas firmas (`B12a-API.md` §4) | nada; se importan cuando exista `esc/ruta/variante.ts` |
| el avance | `parametrosEnElAvance(avance)` con un número | `avance.current`, que sale de `AVANCE_DE_LA_INTRO` | compatible: `ENCENDIDO_HASTA = 0.5` es la mitad de las 1,5 pantallas |

**Cuándo se pueden reemplazar los tipos:**
- `PresetDeLaEscena` e `IdDePagina` ya se pueden importar de `esc/ruta/preset.ts`, pero sin `variante`. Por eso `firmas.ts` no se puede reemplazar entero hasta B12a.3.
- **Siguen abiertos:** P-H29a, b, c, d y f. La API no expone la luz de abajo fuera del pie, ni su tinte, ni el color de la energía, ni una señal de salida, ni la composición en términos de luz.

**Los pedidos al home:**
- **P-H26 está arreglado en el home:** `devolverElFoco` espera cuadro a cuadro.
- **P-H27 está habilitado:** s77 §1 deja importar `BotonPausa` a `_servicios/movimiento/VideoDeFondo.tsx` (`s77-ph.invariant.tsx:74`). La pausa del video sigue siendo la nuestra, con su nota: cambiarla no estaba en este prompt.

---

## 2. M2b — el plan

**La firma de las historias** (`SPRINT-B1-PORTFOLIO.md` §14.5) es `Historias<T extends ItemDeHistoria>({ items, renderItem, alSalir, etiqueta, rotulos, duracionMs?, alCambiar?, className? })`. El código suma `arribaDeLasBarras?`.
- Se importa y no se edita.
- El comportamiento es el del componente: 10 s por paso, mantener para pausar, los toques (el tercio izquierdo vuelve, los dos tercios derechos avanzan), los deslices, el tic por toque y nada con el scroll.

**Cómo se monta, copiando el patrón del Portfolio** (`EscenarioDelPortfolio.tsx:104-112`): las historias se montan cuando tienen que correr y se desmontan al salir.
- **Por debajo de 768,** la sección del precio tiene el título en papel y, debajo, una sección alta (dos pantallas) con una caja anclada de una pantalla.
- **Las historias se montan** solo cuando la caja está pegada (cubre el cuadro), el ancho está por debajo de 768 y el movimiento no está reducido. Entran con un fundido.
- **Mientras la caja no está pegada,** se ve el primer paso quieto (la Simple). Las historias empiezan en ese mismo paso, así que al entrar solo aparecen las barras.
- **Las salidas** (`alSalir`):
  - deslizar hacia arriba, o pasar después de la Premium, lleva al final de la sección alta: el CTA del precio queda arriba;
  - deslizar hacia abajo vuelve al título «Precio».
- **El scroll no avanza nada.** Con la caja pegada, el dedo sobre ella no mueve la página (`touch-action: none`, del componente). La rueda pasa de largo y desmonta las historias.

**Los tres pasos** son Simple, Mediana y Premium, en ese orden.
- Cada uno es una pantalla en su superficie: la Simple y la Premium en papel, la Mediana en el acento. Es lo mismo que en escritorio.
- El texto es el de la vista pura del M2a (`tresOpciones.ts`): el nombre, «Desde» y el monto, la descripción y «Autogestionable».
- La Mediana suma su marca «Recomendada» y la línea literal: «Todo lo de la Simple, en varias páginas y con catálogo o buscador para mostrar lo que vendés.»
- El contenido de cada paso es el mismo componente que el de las diagonales (`ContenidoDeLaOpcion`), que sale a su archivo.

**Texto real y movimiento reducido:**
- **El HTML servido** trae la lista de los tres pasos, con su texto, en el DOM y en orden.
- **Con movimiento reducido** las historias no se montan (la política de `_lib/motion/reducido.ts`: «no se montan; el contenido se renderiza en su estado final»). La sección mide lo que mide la lista, sin caja anclada, y los tres pasos se leen uno debajo del otro, quietos.
- **Sin reducir,** el CSS (`motion-safe`) arma la caja anclada y deja a la vista el primer paso. Lo decide el CSS, como en las diagonales, así el HTML servido ya tiene el alto que va a tener.

**La transición entre pasos (el corte diagonal): el componente no la permite.** Cada ítem va en un `div` con `key` y el componente lo reemplaza en el mismo render (`Historias.tsx:167`).
- No hay una prop de transición, ni un saliente que quede montado mientras entra el nuevo.
- Una entrada animada adentro de `renderItem` sería solo eso: entraría sobre el vacío, porque el anterior ya se fue.
- **No la hice. Queda como candidato a pedido, P-H30a (§6).**

**Desde 768 nada cambia.** Siguen las diagonales escalonadas. Las historias no se montan: lo decide `matchMedia` con la misma consulta que `max-md:` (`(width < 48rem)`), y la versión del teléfono va con `md:hidden`.

**Los archivos:**
- **Nuevos:**
  - `bloques/precio/historiasDelPrecio.ts`, puro: los pasos, la consulta, cuándo se montan, cuándo está pegada la caja y adónde sale cada gesto;
  - `bloques/precio/ContenidoDeLaOpcion.tsx`, que sale de `Diagonales.tsx`;
  - `bloques/precio/PasoDelPrecio.tsx`, la pantalla de un paso;
  - `movimiento/PrecioEnHistorias.tsx`, el de cliente;
  - `__tests__/historias.invariant.tsx`.
- **Cambian:**
  - `Precio.tsx`: la versión de debajo de 768;
  - `Bloque.tsx`: `EncabezadoDelBloque` sale de `ContenidoDelBloque`, con la misma salida;
  - `Diagonales.tsx`: importa `ContenidoDeLaOpcion`, con la misma salida;
  - `precio/rotulos.ts`: los rótulos de las historias;
  - `diagonales.invariant.tsx` y `pagina.invariant.tsx`: las afirmaciones que cambian con la spec (§4).
- **Se borra:** `bloques/precio/Calibres.tsx`. Era la versión de debajo de 768 del D15 y queda sin uso (§5).

---

## 3. Lo hecho y la verificación

**El código** es el del plan (§2). La lista de archivos está al final de la §2.

**El gate:**
- **lint** de los 11 archivos tocados: limpio.
- **tsc:** 0 errores (14 s).
- **Los tests de servicios,** con los del merge como base:
  - datos 55/0, precios 22/0, slots 44/0, seo 56/0, medios 26/0, escena 45/0;
  - pagina 240/0 y diagonales 47/0, con las afirmaciones reemplazadas de la §4;
  - **historias 37/0 (nuevo);**
  - s38, s44 y s74, 0 con falla; s77 44/0; s25-contacto 35/0.
- **Los 6 barridos,** iguales al merge:
  - s4-paquete 21/0, s40 38/0, s53 54/0 y s8-escena 33/0;
  - s8-montaje 56/2, las dos de siempre: solo cambia cuántos archivos mira (2.511 contra 2.507);
  - s9-sentry 22/0, con 2 fuera de ventana.
- **Sin `next build`.**

**El navegador, a 390 × 844** (Chromium sin WebGL, táctil emulado, en el dev de :3001):

| Qué | Medido |
|---|---|
| Por debajo de 768 | se ve el teléfono y no las diagonales |
| Antes del pin | sin historias; la caja asoma con la Simple quieta |
| Con la caja pegada | historias montadas en la Simple; la lista de abajo queda `inert` |
| Los tres pasos | Simple, Mediana (con «Recomendada» y la línea literal) y Premium |
| El texto | todo adentro del cuadro y debajo de las barras, en los tres pasos |
| Contraste del texto | **6,65:1 el mínimo**, en los tres pasos (el acento y el papel) |
| Desborde horizontal | 0 |
| Los toques | derecha → Mediana, derecha → Premium, izquierda → Mediana, derecha → Premium; la página no se movió (`scrollY` igual) |
| Mantener | `data-pausada` «si» apretado y «no» al soltar |
| Deslice de costado | a la derecha vuelve uno; la página no se movió |
| Pasar después de la Premium | sale: `scrollY` 3.470, el final de la sección alta (esperado 3.470); el CTA del precio queda arriba (48 px), a la vista |
| Deslizar hacia abajo | vuelve al título: `scrollY` 1.652 (esperado 1.652) |
| El tiempo | a los 10,6 s pasó de la Simple a la Mediana |
| El CTA de debajo del precio | abre el modal con «web» marcado y los campos vacíos; se cerró con Escape. **Cero llamadas a `/api/*`** |
| Lo que flota arriba | nada: a 20 px del tope, en tres puntos, el elemento es la historia, así que las barras van en su lugar por defecto |
| Errores | solo «Error creating WebGL context», el de siempre de un Chromium sin GPU |

**Un hallazgo, del componente: las barras sobre el acento** dan 2,65:1 (`bg-tinta` sobre el celeste oscuro de la Mediana), debajo del 3:1 de un gráfico (WCAG 1.4.11). Sobre el papel dan 17,6:1. Las barras son del componente y no se pueden teñir desde afuera sin cambiar sus clases: queda como P-H30c (§6).

**Lo que NO corrió, por memoria.** La matriz del home (`scripts-carga/matriz.ts`, con su Chrome de `b4-medicion`) estaba corriendo. Mientras la corrida de 375 esperaba los 3 GB, Claude Code cortó por memoria el dev y esa corrida.
- Busqué los procesos de servicios por línea de comando: el `next dev` de :3001 y su hijo, y los dos `bash` de la espera. Los terminé con `taskkill /T`. No toqué nada del home.
- Por la regla del repo («el lote cortado no se vuelve a lanzar por cuenta propia») no lo relancé. Quedaron sin correr:
  - **375 × 667:** lo mismo que a 390;
  - **768 y 1440:** que en todo el recorrido del precio no se monte ninguna historia. Lo cubren en puro la §3 de `historias.invariant` y la §4 de `diagonales.invariant`;
  - **390 con movimiento reducido:** los tres pasos quietos, uno debajo del otro, y nunca historias. Lo cubre en el marcado la §4 de `historias.invariant`.
- El banco quedó listo para correrlo: `scratchpad/c3/verificar-historias.cjs` (`historias|sinmontar|reducido <ancho>`) con `una.sh`.

---

## 4. Las afirmaciones que cambiaron con la spec (ninguna aflojada)

| # | Dónde | Antes | Ahora |
|---|---|---|---|
| 1 | `diagonales.invariant` §4 | «por debajo de 768 se ve el bloque de antes, byte por byte (título y calibres en su grilla)», con dos controles | **retirada**: esa versión (el D15) ya no existe. Queda «las dos versiones se reparten el ancho en 768 (`md:hidden` y `max-md:hidden`) y la del D15 no vuelve», con dos controles (las clases cruzadas y la versión del D15 montada) |
| 2 | `pagina.invariant` §4 | los marcadores y «Autogestionable» contados en las versiones `calibres` y `diagonales` | en `historias` y `diagonales`, con las mismas cuentas (3/1/1 y 3/2) |
| 3 | `pagina.invariant` §10 | el precio de web con 3 marcas del árbol quieto (el título y el panel de la versión chica, más el Bloque de las diagonales) | 2: la versión del teléfono deja el panel revelado (la caja anclada no es un panel que entra con el scroll); el título sigue entrando por línea |
| 4 | `pagina.invariant` §9 | cuatro archivos de cliente en `movimiento/` | cinco: suma `PrecioEnHistorias.tsx` |

El test nuevo, `historias.invariant.tsx`, tiene 37 afirmaciones: 16 y 21 controles positivos, en seis partes:
1. los tres pasos en orden, en la vista y en el HTML servido;
2. la marca y la línea literal solo en la Mediana, en el acento, en lo que pinta cada paso y en la lista quieta, con mundo cerrado;
3. cuándo se montan: la tabla de las ocho combinaciones, la consulta igual a la de `max-md:`, el montaje en el componente, el HTML servido sin historias y la caja pegada;
4. el texto real y el movimiento reducido;
5. el componente común tal cual, que arranca en la Simple, y las dos salidas;
6. sin `data-servicio`.

---

## 5. Decidido por CC, revisar

1. **Cómo se montan: con una caja anclada de una pantalla en una sección alta de dos.** Es el patrón del Portfolio: las historias corren a pantalla completa y solo con la caja pegada. Las dos pantallas frenan la inercia del dedo al entrar. Un golpe muy fuerte puede pasar de largo el precio entero, como la ráfaga del Portfolio.
2. **Con movimiento reducido, sin historias:** los tres pasos quietos, uno debajo del otro. Es la política del sitio (`_lib/motion/reducido.ts`: «no se montan»). El Portfolio, en cambio, deja sus historias con movimiento reducido. Lo elegí porque «legible sin animación» no se cumple con un paso que cambia solo cada 10 s y una barra que se llena.
3. **Al entrar se ve primero la Simple, quieta** (la lista con el CSS de movimiento). Las historias aparecen encima con un fundido de 600 ms, con la curva de la casa: como arrancan en el mismo paso, solo se nota la llegada de las barras. Al salir se desvanecen en 600 ms.
4. **Las salidas:**
   - adelante, al final de la sección alta, con el CTA del precio arriba;
   - atrás, al título «Precio», con su aire.
   Las dos con `scrollTo` suave: por debajo de 1025 no hay Lenis.
5. **El contenido de cada paso** es el de las diagonales, centrado en el alto y en la columna del sitio (los 32 px). No le agregué nada, ni lo agrandé.
6. **Los rótulos para el lector:** el grupo, «Las opciones de precio»; los dos controles del teclado, «Opción anterior» y «Opción siguiente» (como los del Portfolio, «Proyecto anterior» y «Proyecto siguiente»).
7. **Borré `Calibres.tsx`** porque quedó sin uso. Si hace falta, se recupera con `git show bb5491a6:logic-core-v3/src/app/v3/_servicios/bloques/precio/Calibres.tsx`. Con él se fue la rama `calibres` del `switch` del slot (los calibres arman su sección arriba).
8. **El arrastre que arranca en lo que flota encima** (si algo flota sobre las historias) mueve la página. El Portfolio lo frena con su `useSinScrollEnLasHistorias`, que es suyo y no del componente; no lo copié (P-H30b).

---

## 6. Candidatos a pedido al home (P-H30)

| # | Qué | Por qué |
|---|---|---|
| **P-H30a** | **Una transición propia entre pasos** en `Historias`: una prop, o que el saliente quede montado mientras entra el nuevo | El prompt pide el corte diagonal del precio de escritorio entre los pasos. Hoy el componente reemplaza el ítem en el mismo render (`Historias.tsx:167`, el `div` con `key`), así que no hay de dónde salir: una entrada animada adentro de `renderItem` entraría sobre el vacío |
| **P-H30b** | **`useSinScrollEnLasHistorias` común**, en `_componentes/historias/` | Hoy es del Portfolio (`trabajos/portfolio/useSinScrollEnLasHistorias.ts`). Lo que frena el arrastre desde lo que flota encima tendría que venir con el componente para todos los usos |
| **P-H30c** | **El color de las barras según la superficie del ítem** (una prop, o que lean `currentColor`) | Hoy son `bg-tinta` fijas (`Historias.tsx:48-49` y `:57-58`): sobre el acento de la Mediana dan 2,65:1, debajo del 3:1 de un gráfico. En el Portfolio no se nota, porque van sobre un video |

---

## 7. Qué mira Valentino (FRENO)

En el dev de servicios (`npm run dev -- -p 3001`), en **http://localhost:3001/v3/paginas-web a 390** (y a 375, que no corrió), bajando hasta el precio, con el táctil emulado:
1. **La entrada:** el título «Precio» y, debajo, la caja. Al quedar pegada aparecen las barras arriba y corre la Simple. Ojo: entre el título y la Simple queda media pantalla de papel mientras la caja sube, porque el paso va centrado en una pantalla entera y la Simple también es papel. Decí si va así, o arriba, o abajo como la ficha del Portfolio.
2. **Los tres pasos:** Simple, Mediana en el acento con «Recomendada» y su línea, y Premium.
   - Tocá a la derecha y a la izquierda, mantené apretado (pausa) y deslizá de costado.
   - Cada paso dura 10 s.
3. **Las barras sobre la Mediana:** se ven poco (P-H30c).
4. **Las salidas:**
   - deslizar hacia arriba, o tocar a la derecha en la Premium, lleva al CTA del precio;
   - deslizar hacia abajo vuelve a «Precio».
5. **El CTA de debajo del precio** abre el contacto con «Páginas web» marcado. No lo envíes.
6. **Con movimiento reducido** (en las DevTools, Rendering → `prefers-reduced-motion: reduce`): los tres pasos uno debajo del otro, quietos, sin historias.
7. **A 768 y 1440:** las diagonales de siempre; nada cambió.
8. **El corte diagonal entre pasos no está** (P-H30a): hoy los pasos cambian de golpe, como en el Portfolio.
