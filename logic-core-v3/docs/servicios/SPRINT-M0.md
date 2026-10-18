# SPRINT M0 — Fase 0 de la maqueta de Páginas web (el plan, sin código)

Rama `paginas/servicios`, worktree `C:\paginas-servicios\logic-core-v3`, sobre `e75fe035` (S3b). 2026-10-18.

**Solo lectura.** Este archivo es lo único que se escribió: sin commit, sin dev, sin grabar ni montar (de ffmpeg solo se
leyeron la versión y los metadatos de los videos del Portfolio). Manda el prompt del M0: `SPEC.md` (v2) y `CONTRATO.md` (v1) son
copias viejas y no se usaron. Las marcas del documento:

- **[NO DETERMINABLE LEYENDO]**: lleva al lado cómo se mide, y está juntado en §13.
- **D-n**: una decisión de Valentino (§12.2), con mi recomendación.
- **P-H18…**: un pedido al home (§12.1). El P-H17 ya está usado.

---

## 0. El plan en diez líneas

1. **Tres sprints de ~2 h, todos en Opus 5.5 · xhigh** (§10):
   - **M1**: la intro con el nombre, el orden nuevo, el acento en un solo lugar, el contenido nuevo, el CTA del precio, Cómo trabajamos y el cierre sin revelado.
   - **M2**: el precio en diagonales, en escritorio y tablet, y en historias en el teléfono.
   - **M3**: la grabación de las demos, el montaje y la sección del video.
2. **Los dos revelados existen en `_contrato`.**
   - El *progresivo* es `Bloque` más los canales, y ya lo usamos.
   - El *gatillo* son las cuatro entradas de `_contrato/cruce.ts` más el observador que el home escribió en `tu-panel/Remate.tsx`. Ese observador no es una pieza publicada, así que se escribe en `_servicios/movimiento/` (P-H18). Ninguno de los dos pide `data-panel`.
3. **El precio es una sección de tres pantallas con un hijo `sticky`.** Lleva tres paneles cortados con `clip-path` (con `calc()` en % y `svh`, para que el ángulo no cambie con el ancho) y un quiebre en zigzag por corte. El avance lo dan `tramoDeSecuencia` y `saturarEn` del contrato, el mismo mecanismo que la secuencia de Servicios del home.
4. **En el teléfono, las historias son hojas `sticky` que suben una sobre otra**, con el corte diagonal en el borde de arriba. Es CSS solo, sin gestos propios, como B1 §5.10.
5. **El video es un solo `<video>`.**
   - Carga diferida, suena nunca, se reproduce en pantalla y se pausa al scrollear: el patrón de `VideoDeServicio.tsx` del home.
   - Con movimiento reducido, solo el póster.
   - El velo y la pausa son decisiones (D4 y D5).
6. **Las demos del home son cinco, y el repo no marca ninguna como «premium»** (`trabajos/demos/catalogo.ts:41-45`). Recomiendo tres que no compartan rubro con un cliente (D1).
7. **El acento claro pasa a un mapa por `IdDeServicio`** en `estiloDelAcento.ts`. Con el merge de B1.2c (`233fd262`, que todavía no está en origin) el mapa se reemplaza por `--color-acento-<id>-claro`, ya escrito en ese commit (P-H22).
8. **Los 21 px del cierre** son la llegada de la ventana visible, que cae después del último píxel de scroll. Sale en el M1 al sacarle el revelado al cierre, como pide la fila 10 de la tabla.
9. **Se retiran `Prueba.tsx`, `DelBlog.tsx` y `Calibres.tsx`, y sus tests se retiran con ellos** (funcionalidad quitada, no aflojada). P-H9 deja de hacer falta.
10. **Necesito de Valentino catorce decisiones** (§12.2). Las que frenan un sprint son D1 (M3), D3 (M1) y D4–D6 (M3).

---

## 1. Lo que hay hoy (después del S3b) y qué cambia

### 1.1 El árbol de `_servicios/`

| Archivo | Qué es |
|---|---|
| `PaginaDeServicio.tsx` | La plantilla. La raíz (`relative z-10 text-tinta`, con el acento oscuro por `var()`) monta la `Intro`, el `main` con los bloques, el `Cierre` y el `JsonLd`. |
| `Intro.tsx` | La intro reservada. Lleva `data-intro-de-servicio`, el único `data-seccion="invertida"`, el acento claro (P-H2), la tapa interina, el `Encabezado` y el `Problema`. |
| `Encabezado.tsx` | El enlace al home con el logotipo (D4). |
| `estiloDelAcento.ts` | El token oscuro de la raíz (`tokenDelAcento`), el claro de la intro (hoy recibe el hex de los datos) y `ESTILO_DEL_CTA`. |
| `tipos.ts`, `formato.ts`, `precios.ts`, `rutas.ts`, `seo.ts`, `JsonLd.tsx` | El modelo, el formato de precios y marcadores, los «desde», las rutas y `PUBLICADOS`, la metadata y el JSON-LD. |
| `datos/` | Los tres servicios, `servicios.ts` y `fuenteDeProyectos.ts` (la única puerta a `PROYECTOS`). |
| `bloques/` | `Bloque`, `Problema`, `QueHacemos`, `QueIncluye`, `Precio` (con `precio/`: `Calibres`, `Proyecto`, `Planes` y sus vistas puras), `Extra`, `Proceso`, `Prueba`, `Faq`, `Llamado` (con `AbreElContacto`), `DelBlog` y `Cierre`. |
| `movimiento/` | `Revelado.tsx` y `TitularQueEntra.tsx`, el único código de cliente (`pagina.invariant.tsx:333`). |
| `__tests__/` | `datos` (48), `precios` (22), `slots` (44), `seo` (56) y `pagina` (157), más `pagina-detectores.ts`. |

### 1.2 Los revelados montados hoy

| Bloque | Componente | Título | Contenido |
|---|---|---|---|
| problema (intro) | `Problema.tsx:21-58` | `h1` = `problema.titulo`, por línea (`TitularQueEntra`, P2 · ventana-visible) | la bajada = `problema.texto`, por línea |
| que-hacemos, que-incluye, precio, extra, proceso, prueba, llamado (y del-blog) | `Bloque.tsx:55-77` | `h2` por línea (`TitularQueEntra`) | entero (`Revelado`: P2 · ventana-visible · `CanalDeUnaPieza`) |
| faq | `Bloque` con `panelQuieto` (`Faq.tsx:38`) | por línea | quieto |
| cierre | `Cierre.tsx:28` | — | entero (`Revelado`) |

Por debajo de 1025 y con movimiento reducido, todo sale quieto (`CompuertaDelHome.tsx:63-87`).

### 1.3 Qué cambia para llegar al orden decidido

| # | Decidido | Hoy | Qué cambia (sprint) |
|---|---|---|---|
| intro | `h1` = `nombre`; la bajada sale del `problema` | `h1` = `problema.titulo`; etiqueta con el nombre; bajada = `problema.texto` | `Problema.tsx`: el `h1` dice el nombre, el problema baja a dos `p` (D2) y se va la etiqueta, que repetía el nombre (M1) |
| 1 | Qué hacemos · progresivo | igual | nada |
| 2 | Incluye · progresivo | igual (`QueIncluye`) | nada |
| 3 | Precio en diagonales · progresivo | `Bloque` con los calibres en grilla de tres | slot nuevo para `calibres`; `Calibres.tsx` se retira (M2) |
| 4 | CTA · gatillo | no existe | bloque nuevo `llamado-del-precio` (M1) |
| 5 | Extra · progresivo | igual, ya iba detrás del precio | queda detrás del CTA |
| 6 | Video de trabajos · gatillo | `Prueba` (casos con pósters, «Visitar sitio») | `Trabajos.tsx` reemplaza a `Prueba`. En el M1 queda reservado: monta solo si hay video, nota o panel. El M3 lo llena en web |
| 7 | Cómo trabajamos · progresivo | `Proceso` (pasos y plazo) | suma una frase por trabajo y el CTA al Portfolio (M1) |
| 8 | FAQ · panel quieto | igual | dos respuestas nuevas (M1) |
| 9 | CTA · gatillo | `Llamado` · progresivo | pasa a gatillo; IA suma su texto (M1) |
| — | Del blog | monta si hay `href` | sale del orden y el componente se retira (D7, M1) |
| 10 | Cierre provisorio · — | `Revelado` | sin revelado (M1, §7) |

Lo que lleva cada página sale de los datos. Extra solo existe en web. Trabajos, en el M1, solo en IA, con «Probá el panel», y en Software, con su nota. Web lo gana en el M3.

---

## 2. Los revelados del home

### 2.1 El progresivo: el seam y los canales

```ts
// _contrato/coreografia.tsx:258-289 (firma) · :314-327 (Bloque)
interface BloqueProps {
  readonly patron: FuenteDelBloque          // 'P1'…'P9' | 'pin'                    (:158)
  readonly anclaje?: AnclajeDelBloque       // 'propia' (defecto) | 'seccion'        (:206)
  readonly lente?: 'escena'
  readonly rango?: RangoDelBloque           // 'del-patron' (defecto) | 'ventana-visible' | 'ventana-del-trazo' | … (:247-256)
  readonly className?: string
  readonly style?: React.CSSProperties
  readonly children: (progreso: Progreso) => ReactNode   // Progreso = MotionValue<number> | null (:39)
}
```

- **Los canales** (`_contrato/canales.tsx`):
  - `CanalDePieza` (`:37-65`, una pieza de un conjunto, con `cantidad` e `indice`);
  - `CanalDeUnaPieza` (`:67-115`);
  - `CanalDePiezas` (`:117-143`);
  - `CanalDeTexto` (`:220-243`: el título y el párrafo por línea, la etiqueta por palabra; el mismo elemento en las dos ramas).
- **La regla compartida** (`:27-31`): con `progreso === null` no se monta la primitiva animada. Sale el contenido pelado, en su estado final.
- **Las anclas que usamos**:
  - `ANCLA_DE_LA_VENTANA_VISIBLE` (`bloqueAnimado.ts:120-123`): arranca con el tope 80 px adentro del cuadro y llega con el pie a 240 px del borde de abajo (`asentamiento.ts:106,117`).
  - `ANCLA_DEL_PIN` (`bloqueAnimado.ts:63`): `top top` → `bottom bottom`, sin inercia.
  - P2 del patrón (`_lib/motion/anclas.ts:134-138`): `top bottom` → `bottom bottom`; el rango es el alto exacto.
- **La secuencia y el asentamiento**:
  - `tramoDeSecuencia(progreso, cantidad)` (`_contrato/secuencia.ts:53-61`): un progreso, N tramos, el mismo `indice` y `local` para todos los canales.
  - `saturarEn(fraccion)` (`_contrato/asentamiento.ts:153-158`): satura el local para que lo que entra se vea quieto antes de que el tramo se acabe.
- **La compuerta.** `Bloque` anima arriba de 1025 y sin movimiento reducido (`motion.ts:76-83`, `CompuertaDelHome.tsx:63-87`).
  - `CoreografiaEnTodoAncho` (`coreografia.tsx:129-133`) da las mismas primitivas en todo ancho, salvo con movimiento reducido. Así lo hace Trabajos.
  - `useMovimientoEnTodoAncho()` (`:98-101`) es la pregunta para lo que no es un `Bloque`.

### 2.2 El gatillo: el disparo por línea

```ts
// _contrato/cruce.ts
type EntradaAlTramo = 'arriba-bajando' | 'arriba-subiendo' | 'abajo-bajando' | 'abajo-subiendo'    // :22-23
interface CruceObservado { readonly cruza: boolean; readonly tope: number; readonly pie: number }   // :27-33
function cruceDelTramo(c: CruceObservado): EntradaAlTramo                                         // :36-39
function gestoDelCruce(entrada: EntradaAlTramo): 'ida' | 'vuelta' | 'nada'                         // :42-46
function puestoTras(entrada: EntradaAlTramo): boolean                                              // :49-51
```

**La implementación del home es `tu-panel/Remate.tsx:30-142`.**

- Un `IntersectionObserver`, con la línea de disparo como borde de abajo del `rootMargin`: `margenDelDisparo(DISPARO_DEL_REMATE)`, de `tu-panel/entrada.ts:71,80-82`.
- El gesto va con la API de animaciones: una corrida corta desde la derecha con fundido, con la curva `expo.out` pasada a `linear()` (`entrada.ts:19-31`) y las duraciones leídas de los tokens (`tu-panel/tokens.ts:7-26`).
- Bajando por la línea, `ida`. Subiendo por encima, la misma animación en espejo (`reproducir(…, -1)`).
- **El primer aviso es el estado de carga, no un cruce** (`:80-87`): se posa sin gesto.
- **El salto que pasa por encima de la línea** se posa (`:94-99`, A13).
- Corre en todo ancho, salvo con movimiento reducido (`:32`, `useMovimientoEnTodoAncho`).

El home lo registra en su padrón de gestos por tiempo (`motion.ts:128-136`). **Para nosotros:** las cuatro funciones de `cruce.ts` se importan; el observador se escribe en `_servicios/movimiento/Gatillo.tsx`; y las tres utilidades de `tu-panel` (`margenDelDisparo`, la curva y los tokens) se importan evaluadas, no se leen como texto ni se copian. Sale P-H18: que el home las suba al contrato, como ya hizo con `cruce.ts`.

### 2.3 Cuál usa cada sección

| # | Sección | Revelado | Con qué |
|---|---|---|---|
| intro | `h1` y bajada | progresivo (como hoy) | `TitularQueEntra` |
| 1, 2, 5, 7 | Qué hacemos, Incluye, Extra, Cómo trabajamos | progresivo | `Bloque` (título por línea y panel entero), sin cambios |
| 3 | Precio | progresivo, atado al pin | `Bloque` P2 · `del-patron` sobre la sección alta; `tramoDeSecuencia` (3) y `saturarEn` por panel; canales con el progreso local (§3.2) |
| 4, 9 | CTA | gatillo | `movimiento/Gatillo.tsx` |
| 6 | Video de trabajos | gatillo para el texto; el video tiene su propio en-pantalla | `Gatillo` y `movimiento/VideoDeFondo.tsx` |
| 8 | FAQ | título por línea, panel quieto | `Bloque panelQuieto` |
| 10 | Cierre | — | nada (§7) |

### 2.4 Lo que depende de algo prohibido

- **`anclaje: 'seccion'`** mide «el ancestro más cercano con `ATRIBUTO_DE_PANEL`» (`coreografia.tsx:166-169`), o sea `data-panel`. No se usa nunca.
- **`lente: 'escena'`** solo sirve en una sección que deja ver la escena (`:268-276`). No se usa.
- **Un `Bloque` adentro de un hijo `sticky` no se mueve**, así que consume su patrón antes de que la sección llegue a cuadro (`coreografia.tsx:173-189`). Por eso, adentro del precio anclado no va ningún `Revelado` ni `TitularQueEntra`: todo cuelga del progreso de la sección.
- `cruce.ts`, la secuencia, el asentamiento y los canales no leen ningún atributo del home.
- Lo único del home que no podemos emitir sigue igual: `data-panel`, `data-seccion-id`, `data-signo-de-la-tuya`, los ids reservados con su prefijo `portfolio-` (`pagina-detectores.ts:14-28`) y `data-servicio`.
- El video tampoco lleva `data-video-del-portfolio`: lo cuenta el diagnóstico del home (`_lib/diagnostico/publicar.ts:224`).

---

## 3. El precio en diagonales

### 3.1 La geometría

**Recomiendo `clip-path: polygon()` con `calc()`, y no SVG.** Un SVG que llena la caja necesita `preserveAspectRatio="none"`, que deforma los ángulos con la proporción, o medir la caja con JS, que salta al hidratar y no anda sin JS. Con `calc()` el polígono mezcla % del ancho con `svh`, y como la caja mide 100svh, la pendiente queda fija en px por px: **el ángulo es el mismo en 1440×900, 1024×768 y 768×1024.**

Dos cortes «/» con la misma pendiente `s`, centrados a media altura en `X1` y `X2` del ancho, cada uno con un quiebre en zigzag de alto `h` y corrida `j`. Valores de partida, para calibrar en el M2 con Valentino: `X1` 30 %, `X2` 70 %, `s` 0,36 (unos 20° de la vertical), `h` 8svh y `j` 5svh. Los cuatro puntos de un corte, con `H` = 100svh:

```
P0 = (Xi + s·H/2,                    0)          arriba
P1 = (Xi + s·h/2,                    H/2 − h/2)  donde empieza el quiebre
P2 = (P1.x + j,                      H/2 + h/2)  el zag: un tramo corto en la dirección opuesta
P3 = (P2.x − s·(H/2 − h/2),          H)          abajo
Simple  = 0,0 · P0₁ · P1₁ · P2₁ · P3₁ · 0,H
Mediana = P0₁ · P0₂ · P1₂ · P2₂ · P3₂ · P3₁ · P2₁ · P1₁
Premium = P0₂ · W,0 · W,H · P3₂ · P2₂ · P1₂
```

Los tres comparten bordes y llenan la caja sin huecos ni encimados. Todo sale de una función pura (`bloques/precio/diagonales.ts`) que da el polígono en CSS y, para un ancho y un alto, los puntos en números: una sola fuente para la página y para el test. Escala:

| Caja | Corte 1 (P0 → P3) | Corte 2 (P0 → P3) | Banda de la Mediana | Lo más angosto para texto |
|---|---|---|---|---|
| 1440×900 | 594 → 341 | 1170 → 917 | 576 px | la Premium, arriba (de 1170 a 1440) |
| 1024×768 | 445 → 229 | 855 → 639 | 410 px | ídem (de 855 a 1024) |
| 768×1024 | 415 → 127 | 722 → 434 | 307 px | la Simple abajo (127 px) y la Premium arriba (46 px) |

Cada nombre va en su esquina ancha (la Simple arriba a la izquierda, la Premium abajo a la derecha, la Mediana al centro de la banda), y la información en la parte ancha de su región, al lado del quiebre. **[NO DETERMINABLE LEYENDO]** si el texto entra sin cruzar un corte a 1024×768 y 768×1024: la línea de la Mediana tiene 95 caracteres. Se mide en el M2 en el navegador, con las cajas de texto contra el polígono de la función pura y un margen mínimo de 16 px. Si a 768 no entra, las historias suben hasta 1023 (D10).

Las utilidades: la página no escribe polígonos en las clases. El `style` fija las custom properties (`--corte-del-panel`, `--alto-del-precio`) desde la función pura, y las clases las leen con `var()`. Eso cumple `arbitrariasSinToken` (`pagina-detectores.ts:178-181`, `pagina.invariant.tsx:293-295`) y no pone ningún `background` en un `style` (`:357`). Por la regla de Tailwind de CLAUDE.md, este documento las describe y no las escribe.

### 3.2 El scroll

- **Cuánto dura.** Tres pantallas: la sección mide 300svh con un hijo `sticky` de 100svh, la regla del home para una secuencia de N pasos (`_lib/secciones.ts:119-134`). La REGLA DE ALTURAS no aplica: la sección no se declara en `secciones.ts` y no corre nada de la escena.
- **El avance.** `Bloque` con P2 y `rango="del-patron"` sobre la sección alta: vale 0 cuando su tope asoma por abajo y 1 cuando el pin suelta. `tramoDeSecuencia(p, 3)` reparte un tercio por panel:
  - el primero, mientras la sección sube (no hay pantalla en blanco cuando el pin arranca);
  - los otros dos, durante el pin.

  Cada panel usa `saturarEn(0,7)`: llega al 70 % de su tercio y queda quieto el resto antes de que arranque el siguiente, como la banda quieta de Servicios (`asentamiento.ts:32`). Para la Simple quieta desde el principio estaría `patron="pin"` sin inercia (`bloqueAnimado.ts:40-63`); no lo recomiendo, porque sería un revelado de dos pasos y no de tres.
- **Qué se mueve.**
  - El relleno de cada panel se desliza un tramo corto a lo largo del corte, con fundido. Solo `transform` y `opacity`, con `will-change: transform` en las tres capas mientras dura el pin. El `clip-path` nunca se anima por cuadro.
  - Su texto entra con los canales del home: el nombre con `CanalDeTexto`, la información con `CanalDeUnaPieza`, con el progreso local derivado (`useTransform` de `motion/react`, que ya viaja en toda ruta: `coreografia.tsx:34-38`).
  - Subiendo, deshace el camino (es *scrub*).
- **Con Lenis** (`layout.tsx:309`, arriba de 1025): Lenis mueve el scroll de la ventana y el motor lo lee; el `sticky` es nativo y el home ya lo usa en /v3 (Servicios, Trabajos). Lo que se mide es el `div` del `Bloque`, que nunca se transforma (`coreografia.tsx:294-301`). La inercia de P2 suma una segunda suavidad sobre la de Lenis: **[NO DETERMINABLE LEYENDO]** cuánto atrasa. Se mide en el M2 con tres muestras a 250 ms con la rueda quieta: los tres paneles tienen que estar quietos y llegados.
- **Con los revelados.** Adentro del anclado no hay otro revelado (§2.4). Incluye, arriba, y el CTA, abajo, siguen con los suyos.
- **El ancho y el reducido.**
  - El precio va en `CoreografiaEnTodoAncho` y anima también de 768 a 1024 (el precedente es Trabajos).
  - Las tres pantallas existen solo con la preferencia sin reducir y desde 768, por CSS (la variante de movimiento y la de ancho sobre la custom property del alto). Así el alto es el correcto desde el HTML servido y no salta al hidratar.
  - Con movimiento reducido es una pantalla quieta, con los tres a la vista.
  - Sin JS, los tres quedan a la vista en una sección alta: dos pantallas sin cambio. Lo acepto como degradación.

### 3.3 La accesibilidad

- **El DOM, en orden.**
  - El `h2` «Precio» va `sr-only` (D11). Es el precedente de `ServiciosEnSecuencia.tsx:62-72`: la sección es «lo único que se ve».
  - Después, `ul role="list"` con tres `li`, en el orden Simple, Mediana, Premium (el mismo orden en que se leen en pantalla, de arriba a la izquierda hasta abajo a la derecha).
  - Cada `li` lleva el `h3` con el nombre; el precio («Desde» y el monto de `usd()`); la descripción; «Autogestionable» cuando es `true`, y `[a definir]` solo en desarrollo.
  - La Mediana suma «Recomendada» y su línea, como texto.
  - El árbol de encabezados queda `h1 > h2 > h3` (`pagina.invariant.tsx:286`).
- **Texto real.** Nada en imágenes ni en SVG. El HTML servido es la rama quieta: los tres paneles en su lugar, sin `transform` ni opacidad cero.
- **Contraste**, de los tokens del tema:
  - Simple y Premium, tinta sobre papel: 17,60:1, y la tinta media en su peor caso, 5,55:1 (`theme-develop.css:179,253-254`).
  - La Mediana, papel sobre el acento: 6,65:1 en web, 6,02 en IA y 7,31 en software (`:326-328`; el mismo par que `CLASE_TINTA_SOBRE_ACENTO = 'text-fondo'`, `_contrato/acento.ts:89`). Adentro de la banda todo va en `text-fondo`: la tinta media sobre el acento no pasa.
- **Foco y zoom.** Adentro de los paneles no hay enfocables: el CTA es el bloque siguiente. Al 200 % de zoom, 1440 queda en 720 px CSS y pasa a historias solo.

### 3.4 El destaque de la Mediana

- Va al centro, en la banda: la geometría la pone ahí y la vista pura lo exige (`destacada` siempre es el índice 1).
- Lleva relleno en el acento oscuro del servicio (`bg-acento`) con `text-fondo`.
- Lleva la marca «Recomendada» y esta línea, literal: «Todo lo de la Simple, en varias páginas y con catálogo o buscador para mostrar lo que vendés.»
- Ningún otro texto de venta. Los dos textos van en `datos/paginas-web.ts` con la marca `// M0 §3 (dictado)`, no en el componente.
- El test es de mundo cerrado: lo que se lee en la sección es exactamente lo de los datos y los rótulos declarados, y hay una lista de palabras prohibidas («más elegida», «popular», …) (§9).

### 3.5 Las historias en el teléfono (por debajo de 768)

- **El mismo DOM**, con otro CSS: tres pantallas, una por opción. Cada `li` mide una pantalla y es `sticky` arriba, y la siguiente sube por encima. Es «la hoja que sube desde abajo» de B1 §5.10 (`SPRINT-B1-PORTFOLIO.md:504-511`), sin ningún gesto propio que pelee con el scroll.
- **El corte entre una y otra** es el borde de arriba de la segunda y de la tercera: un diagonal de lado a lado con su zigzag, de la misma función pura, definido en `vw` para que el ángulo se sostenga. La hoja que entra se monta sobre la anterior lo que cae el diagonal, así no queda un hueco de papel.
- **Los nombres** van en el mismo lugar que en escritorio (arriba a la izquierda, al centro, abajo a la derecha), y la Mediana, en el acento.
- **Con movimiento reducido**, el `sticky` no se aplica: tres pantallas seguidas con el corte dibujado.
- Las barras de progreso de las historias del home son de B1.3, que todavía no existe (`EscenarioDelPortfolio.tsx:34`). Las sumamos cuando el home las publique (P-H19).

### 3.6 La firma de datos del slot (para que IA la use después)

```ts
// bloques/precio/tresOpciones.ts — datos puros, como vistaDeLosPlanes.ts (sin react ni next)
export interface OpcionDeTres {
  readonly nombre: string               // 'Simple' · 'Starter'
  readonly rotuloDelPrecio: string      // 'Desde' (ROTULO_DEL_PRECIO) · 'Por mes'
  readonly precio: string               // usd(): 'USD 200' · 'USD 49'
  readonly lineas: readonly string[]    // web: descripción y «Autogestionable»; IA: conversaciones, soporte, cambios web
}
export interface Destacada { readonly marca: string; readonly linea: string }
export interface VistaDeTresOpciones {
  readonly opciones: readonly [OpcionDeTres, OpcionDeTres, OpcionDeTres]   // tres, por tipo
  readonly destacada: Destacada | null                                      // siempre la del medio
}
export function tresOpcionesDeLosCalibres(precio: PrecioPorCalibres, enDesarrollo: boolean): VistaDeTresOpciones
export function tresOpcionesDeLosPlanes(precio: PrecioPorPlanes, enDesarrollo: boolean): VistaDeTresOpciones  // la réplica
```

- **En `tipos.ts`**, las variantes `calibres` y `planes` de `Precio` suman `destacada: { readonly nombre: string; readonly marca: string; readonly linea: string } | null`.
- **La vista** tira si el `nombre` no es la opción del medio, y el test lo controla.
- **Lo que falta** sigue la regla de `vistaDeLosPlanes`: el marcador solo en desarrollo, y la línea no se monta en producción.

### 3.7 El costo y los riesgos

| Riesgo | Mitigación | Cómo se mide (M2) |
|---|---|---|
| El texto no entra en sus regiones a 1024 o 768 | los parámetros en un solo módulo; las historias hasta 1023 si hace falta (D10) | cajas de texto contra el polígono, 16 px de margen, a 1440, 1024 y 768 |
| Teléfono acostado (844×390: ancho de tablet, alto de teléfono) | **[NO DETERMINABLE LEYENDO]**; sin una variante de alto en el tema no hay corte limpio por CSS | captura a 844×390 |
| `clip-path` con `calc()` y `svh` en Safari | se usan las dos en todos los motores actuales | **[NO DETERMINABLE LEYENDO]**: el banco es Chromium; lo ve Valentino en su iPhone |
| La doble suavidad (Lenis + P2) | `saturarEn` deja quietud al final de cada tercio | tres muestras a 250 ms con la rueda quieta |
| Pintar tres capas a pantalla completa con la escena abajo (P-H4) | solo `transform` y `opacity`; el recorte quieto | cuadros por segundo y tareas largas a 1440 durante el pin, como en el S1b |
| Cargar adentro del precio, con el chunk de la coreografía todavía en camino | el árbol quieto muestra todo; al instalarse esconde lo que aún no llegó (le pasa igual al home) | recarga con el scroll a mitad del pin |
| Costo de escribirlo | ~2 h (M2); el slot sirve también para IA | — |

---

## 4. El video de trabajos

### 4.1 El criterio de `scripts-portfolio/` (se lee, no se edita ni se importa)

| Qué | Cómo lo hace el Portfolio | Dónde |
|---|---|---|
| Herramienta | Playwright con el Chrome del sistema (`--force_high_performance_gpu --hide-scrollbars --mute-audio`), por CDP | `grabar.ts:21,30,115-119` |
| Reloj | tiempo virtual en pausa: cada cuadro mueve el scroll, avanza la página y captura; se re-emula después de cada captura (la lección de CLAUDE.md) | `grabar.ts:142-156` |
| Pantallas | escritorio 1440×900 a escala 1; teléfono 390×844 a escala 2 | `guiones.ts:34-37` |
| Velocidad | 2×: cada segundo de video son dos de página, a 30 cuadros por segundo | `guiones.ts:28-31` |
| Guion | por tramo: la ruta (solo GET), quietudes y scrolls con curva suave | `guiones.ts:66-137` |
| Limpieza | sin avisos de cookies ni burbujas de chat, ningún clic, ningún formulario | `grabar.ts:35-54,126-135` |
| Plan B | `recordVideo` en vivo, al tamaño del viewport (P-H11), y ffmpeg recorta, acelera y saca cuadros | `grabarEnVivo.ts:51-58,95-99` |
| Códec | H.264 `libx264 -preset slow`, `yuv420p`, `+faststart`, sin audio, 30 fps, `xfade` de 0,3 s entre tramos | `codificar.ts:4-8,35-51`; `guiones.ts:31` |
| Peso | el CRF más bajo que entra en el techo (de 24 a 30, de a 2) y, si no, menos resolución; techo de 2 MB | `codificar.ts:24-29,69-80`; `guiones.ts:40` |
| Póster | el primer cuadro, WebP calidad 80, a la resolución del video | `codificar.ts:81` |
| Recibo | bytes, CRF, medidas y duración en `docs/rediseno/entregas/b1-portfolio/medios.json`; los cuadros, en la caché, se borran al codificar | `codificar.ts:83-98`; `guiones.ts:43,58` |

Lo que hay en `public/portfolio/` (leído con ffprobe): seis H.264 High, `yuv420p`, 30 fps, de 9,6 a 10,3 s y de 1,84 a 1,97 MB (entre 1,43 y 1,64 Mbps).

| Sitio | Escritorio | Teléfono |
|---|---|---|
| El Garage | 1280×800, CRF 30 | 390×844, CRF 24 |
| Esquina Estudio | 1440×900, CRF 26 | 690×1494, CRF 28 |
| Banú Scents | 1440×900, CRF 24 | 780×1688, CRF 30 |

En la máquina está ffmpeg 8.1.2 (gyan.dev), con `libx264`, `libsvtav1`, `libvpx-vp9`, `libwebp` y `xfade`.

### 4.2 Las URL de las demos (para que Valentino confirme)

Son todas las de la sección Demos del home (`_secciones/trabajos/demos/catalogo.ts:41-45`), atadas a `TEMPLATES` del sitio vivo (`src/components/sections/web-development/WebTemplatesImmersive.tsx:28-74`). **Ninguna está marcada «premium»:** el catálogo no tiene niveles, y «Premium calm» es solo el estilo de Ethereal en el sitio vivo (`:32`).

| Demo | Rubro | URL |
|---|---|---|
| The Ethereal Resort | Hotelería | https://template-ethernal.netlify.app/ |
| Noir Dining in the Void | Gastronomía | https://template-noir.netlify.app/ |
| Skyline Estates | Inmobiliaria | https://template-skyline.netlify.app/ |
| NEXO Bold | Agencia creativa | https://template-bold.netlify.app/ |
| Niche Perfumes | Perfumería | https://nicheperfumeria.netlify.app/ |

Recomiendo tres: Ethereal, Noir y Skyline (D1). Ninguna comparte rubro con un cliente: Niche es perfumería, como Banú, y Bold es una agencia creativa, cerca de Esquina Estudio. Así se reduce el riesgo de que una demo se lea como un caso.

### 4.3 El plan de grabación (M3)

- **`scripts-servicios/grabar.ts`** copia el enfoque de `grabar.ts`: Chrome del sistema, CDP, tiempo virtual, 1440×900 y 390×844 a escala 2, 2× y 30 fps, la misma limpieza y solo GET. No importa nada de `scripts-portfolio/`.
- **`guiones.ts`**, por demo: la portada y un scroll lento, con quietudes, unos 8 s de página por demo, que a 2× dan unos 4 s de video.
- **La sonda va antes.** **[NO DETERMINABLE LEYENDO]** el alto de cada demo (el tope del scroll del guion) y si graban limpias en tiempo virtual, porque las plantillas tienen animaciones propias. Primero va una pasada de sonda por demo: GET, mide `scrollHeight` y saca una captura. Si una no graba limpia, se pasa al plan B en vivo (`grabarEnVivo.ts`) para esa sola.
- **Los cuadros** van a `~/.cache/servicios/m3/<demo>-<dispositivo>/`, fuera del repo, y se borran al montar.
- **Memoria.** Un Chrome a la vez y la memoria libre (3 GB o más) antes de cada uno, con la regla de siempre (un reintento; si vuelve a caerse, se reporta). Mientras se graba no hace falta el dev: las demos son externas.

### 4.4 El plan de montaje (M3)

- **Los cortes.** Se intercalan sitio y demo: El Garage → Ethereal → Esquina Estudio → Noir → Banú Scents → Skyline. Son seis cortes de 4 s y 24 s en total.
  - El clip de cada sitio sale de su `escritorio.mp4` o `movil.mp4`, y el tramo lo elige Valentino sobre una hoja de contactos (**[NO DETERMINABLE LEYENDO]**: cuál es el mejor tramo de cada sitio).
  - Para que el bucle no tenga costura, el primer corte se parte en dos: el video arranca en su mitad y termina en su principio, así el empalme cae adentro de un mismo scroll continuo.
- **Las transiciones**: un fundido de 0,5 s (`xfade=fade`), calmo (D12).
- **Las versiones**:
  - horizontal: 1280×800 (16:10, la proporción de las fuentes);
  - vertical: 720×1560, la proporción del teléfono a 2×, con techo en el ancho de la fuente más angosta reescalada.
- **El formato**:
  - H.264 High, `yuv420p`, `+faststart`, sin pista de audio, 30 fps;
  - el CRF más bajo que entre en **4.000.000 bytes**: de 26 a 34 de a 2 y, si no, 1024×640 o 540×1170;
  - póster: el primer cuadro en WebP calidad 80.
- **El presupuesto.** 24 s en 4 MB dejan 1,33 Mbps. Las fuentes están en ~1,5 Mbps a 1440×900, y a 1280×800 con CRF 28–30 tendría que entrar: **[NO DETERMINABLE LEYENDO]** hasta codificar.
- **El riesgo es la segunda generación.** Los clips de los sitios ya vienen comprimidos (El Garage, con CRF 30) y el teléfono de El Garage mide 390×844, así que se agranda 1,85 veces. Debajo del velo se nota menos. Si molesta, la salida es volver a grabar los sitios con nuestro script, y eso lo decide Valentino.
- **Lo que lee y lo que escribe.** `montar.ts` lee `public/portfolio/*/` sin escribir ahí: abre solo para leer, y el test lo afirma. Escribe en `public/servicios/` y deja el recibo en `docs/servicios/entregas/m3/medios.json`: bytes, sha256, CRF, medidas, segundos, la lista de cortes y el sha256 de cada fuente leída.

### 4.5 Los árboles

```
scripts-servicios/                      (Tailwind también escanea acá: nada de clases arbitrarias)
  guiones.ts        las demos: rutas, movimientos, pantallas, techo de 4 MB, carpeta de cuadros
  grabar.ts         la grabación por CDP (el enfoque de scripts-portfolio/grabar.ts)
  grabarEnVivo.ts   el plan B, solo si una demo no graba limpia
  montar.ts         los cortes, los fundidos, las dos versiones, los pósters y el recibo
  velo.ts           el contraste del texto sobre el peor cuadro del video, con el velo elegido (§4.7)
public/servicios/paginas-web/
  trabajos-horizontal.mp4 · trabajos-horizontal.webp · trabajos-vertical.mp4 · trabajos-vertical.webp
docs/servicios/entregas/m3/medios.json
```

Los scripts corren con `npx tsx <ruta>`: `package.json` no se toca, así que no hay `npm run`.

### 4.6 El montaje en la página

`movimiento/VideoDeFondo.tsx` (cliente) sigue a `VideoDeServicio.tsx:24-85`:

- `muted`, `loop`, `playsInline` y `preload="none"`, sin `autoPlay` ni `src` en el HTML servido.
- La fuente se pide recién cuando el recuadro se acerca: `useInView` con margen del 50 % y `once`.
- Se reproduce solo en pantalla y se pausa afuera.
- Se pausa en su cuadro mientras el scroll se mueve, con `seguirElScroll` de `_lib/scrollEnMovimiento.ts:23` (ESCENA 10 T2: cada cuadro nuevo durante el scroll costaba cuadros a la página).
- **Uno a la vez.** Hay un solo `<video>` en la página, y la versión se elige por el ancho en el momento de pedir la fuente, así que baja un solo archivo.
- **Los pósters** van debajo del video, como dos `Imagen` que el CSS alterna. Es la forma de `Prueba.tsx`: el póster escondido no se baja, porque la imagen diferida no se carga oculta.
- **Con movimiento reducido** no se monta el `<video>`: queda solo el póster.
- **El video es decorativo** (`aria-hidden`). Lo que dice la sección lo dice su texto, que entra con el gatillo. Con la pausa (D5), un botón con `aria-label` y `aria-pressed`, Lucide con `strokeWidth={1.5}`.
- **La sección.** La `<section>` lleva la superficie de papel del home (sigue valiendo `cuerpoEnPapel`, `pagina.invariant.tsx:351-356`), y adentro van la capa del medio y el velo, con clases y sin `style`.
- **El atributo propio** es `data-video-de-trabajos`, nunca `data-video-del-portfolio` (§2.4).

### 4.7 El velo y el texto (AA)

Lo que dice abajo vale para el peor píxel posible (blanco bajo un velo oscuro, negro bajo uno claro), compuesto en sRGB como lo pinta el navegador, con los tokens del tema. **Recomiendo el velo oscuro en degradé, del lado del texto, con `text-fondo`** (D4).

- `data-seccion="invertida"` sigue solo en la intro, como está decidido, así que el texto claro se pide con `text-fondo`, la misma clase que el home usa sobre el acento (`_contrato/acento.ts:89`).
- El alfa mínimo bajo la caja del texto es 0,7.
- La sección no lleva acento: sobre el velo, el oscuro no pasa.

| Velo | α | Texto | Contraste en el peor píxel |
|---|---|---|---|
| tinta (oscuro) | 0,6 | `text-fondo` | 4,60:1 |
| tinta (oscuro) | 0,7 | `text-fondo` | 6,59:1 |
| tinta (oscuro) | 0,8 | `text-fondo` | 9,58:1 |
| papel (claro) | 0,5 | `text-tinta` | 4,49:1 (no pasa) |
| papel (claro) | 0,6 | `text-tinta` | 6,23:1 |
| papel (claro) | 0,85 | `text-tinta` | 12,47:1 |

El velo de papel pasa con 0,6 o más, pero deja el video como un fantasma, y el video está para mostrar los trabajos. El contraste real se mide en el M3 con `velo.ts`: saca un cuadro cada 0,5 s de las dos versiones, compone el velo y mide el texto contra los píxeles que tiene debajo. Va al recibo y lo lee el test.

**El texto no da a entender que las demos son clientes.** El título y la línea los dicta Valentino (D6); hasta entonces van como copy provisorio (C2). Lo que hay que decir ya tiene una frase del home: «Son sitios de ejemplo hechos por develOP, con clientes ficticios.» (`catalogo.ts:60`). Si se usa, se importa, no se copia. El test vigila que ningún nombre de demo aparezca en el texto y que «cliente» no aparezca salvo en la frase aprobada.

---

## 5. La intro y el h1

- **Los datos.** `nombre` no cambia, y es la única fuente del `h1`. `problema.titulo` y `problema.texto` siguen en los datos, pero pasan a ser la bajada.
- **La página** (`Problema.tsx`):
  - El `h1` dice `servicio.nombre` («Páginas web»), por línea, con `TitularQueEntra`, como hoy. Es el mismo texto que el título 3D de B12a: no se adivina su API ni se suma un atributo para ella (P-H20), y su tipografía la resuelve el home.
  - Se va la etiqueta con el nombre, que ahora repetiría el `h1`. Queda el cuadrado del acento (`PrefijoDeServicio`) al lado del `h1`, decorativo: es lo único que usa el acento claro de la intro.
  - La bajada son dos `p`, sin heading (D2): primero el problema como entrada (`problema.titulo`) y abajo el texto. Así cada uno queda literal. El título de software no lleva punto, y juntar los dos en un solo párrafo obligaría a escribir uno.
- **El alto.** `ALTO_DE_LA_INTRO` sigue en una pantalla, y la constante cambia solo su comentario: el alto lo fija B12a, que lo lleva a 1,5 pantallas.
- **`data-seccion="invertida"`** sigue solo en la intro (`pagina.invariant.tsx:138-147`).
- **El SEO no cambia**, porque ya dice el nombre:
  - el `title` es `nombre · LOGOTIPO` (`datos.invariant.ts:208`);
  - el `Service.name` y la segunda miga del `BreadcrumbList` son `servicio.nombre` (`seo.ts:77,101`);
  - la `description` sigue siendo `queHacemos.texto` (D10 del S1a).

  Se suma una afirmación de coherencia: el texto del `h1` es el `Service.name`, la segunda miga y el comienzo del `title`.
- **Los tests:**
  - el §1 de `pagina` cambia: `h1Dice` compara con `nombre` y `laIntro` busca los dos textos del problema en `p`, no en un heading (§9);
  - `seo` no cambia: sus cuentas salen de los datos (`seo.invariant.ts:63-73`).

---

## 6. El acento en un solo lugar

- **El mapa.** Los datos no guardan colores: el acento de un servicio es su `idEnElHome`. El claro pasa a un mapa por `IdDeServicio` en `estiloDelAcento.ts`, marcado P-H2, una línea por servicio y cada una con su `// P-H2`.
  - `estiloDelAcentoSobreNoche(id)` recibe el id y lee el mapa.
  - Sale `acento` de `Servicio` (`tipos.ts:116-119`) y de los tres archivos de datos (`paginas-web.ts:32-34`, `software-a-medida.ts:26-28`, `ia-y-automatizaciones.ts:26-28`).
  - `Intro.tsx` pasa `servicio.idEnElHome`.
  - El oscuro no cambia: sigue saliendo del token (`tokenDelAcento`).
- **Qué quiere decir «un solo hex».** Hoy son tres, uno por servicio, en un solo lugar.
- **Con el merge de B1.2c, cero.** `233fd262` (en `rediseno/home`, sin push: el origin está en `490762c0`) emite en el tema `--color-acento-web-claro`, `--color-acento-ia-automatizacion-claro` y `--color-acento-software-claro`, con los mismos tres valores, y publica `ALIAS_DE_ACENTO_CLARO` en `_contrato/acento.ts`. Con ese merge (P-H22), el mapa se va:
  - la intro fija `--color-acento: var(--color-acento-<id>-claro)`;
  - el test compara contra los tokens del tema, igual que el oscuro (`tokensDelTema`, `pagina.invariant.tsx:157-164`).
- **Qué lo vigila:**
  - `datos` §8 (`datos.invariant.ts:211-230`): los únicos hex de `_servicios/` son los del mapa, tres, con sus claves iguales a `IDS_DE_SERVICIO` y sus valores iguales a los de SPEC §9. El control es un hex en un archivo de datos.
  - `pagina` §6 (`:150-169`): el único hex del marcado es el del mapa para ese `idEnElHome`, en el `style` de la intro. El control es el claro de otro servicio.
  - El tipo: el mapa es un `Record` completo, así que un id sin claro no compila.

---

## 7. El cierre provisorio y sus 21 px

**La causa:**

- El contenido del cierre va en un `Revelado` (P2 · ventana-visible, `Cierre.tsx:28`), y esa ventana llega cuando el pie de la caja queda a 240 px del borde de abajo del cuadro (`bloqueAnimado.ts:114-118`).
- El cierre es lo último del documento. En el último píxel de scroll, el pie de su caja queda apenas a lo que mide el padding de abajo del `footer` (80 px en escritorio). Le faltan 160 px, el progreso nunca llega a 1 y queda la traslación que se midió: 21,3 px en el S3b y 23 px en el S2b.
- El home tiene escrito ese borde para su propio pie (`coreografia.tsx:232-237`: 55 px a 1920 y 76 a 1440 más allá del final).

**El arreglo:** la fila 10 de la tabla dice «—». Sacarle el `Revelado` al cierre en el M1 lo resuelve por construcción, con una línea, sin esperar a B13. El test pasa a esperar cero marcas de revelado en el cierre, con su control, y en el navegador se mide `transform: none` al fondo del scroll a 1440 y a 1024.

---

## 8. El árbol de archivos

| Sprint | Nuevos | Se tocan | Se retiran (`git rm` al preparar su commit) |
|---|---|---|---|
| M1 | `bloques/LlamadoDelPrecio.tsx`, `bloques/Trabajos.tsx` (el slot, reservado), `movimiento/Gatillo.tsx`, `movimiento/disparo.ts` (puro: la línea y el cronograma), `__tests__/gatillo.invariant.ts` | `tipos.ts`, `datos/paginas-web.ts`, `datos/software-a-medida.ts`, `datos/ia-y-automatizaciones.ts`, `estiloDelAcento.ts`, `Intro.tsx`, `PaginaDeServicio.tsx`, `bloques/Bloque.tsx` (los nombres), `bloques/Problema.tsx`, `bloques/Proceso.tsx` (Cómo trabajamos), `bloques/Llamado.tsx`, `bloques/Cierre.tsx`, `__tests__/pagina.invariant.tsx`, `__tests__/pagina-detectores.ts`, `__tests__/datos.invariant.ts` | `bloques/Prueba.tsx`, `bloques/DelBlog.tsx` (D7) |
| M2 | `bloques/precio/Diagonales.tsx`, `bloques/precio/diagonales.ts`, `bloques/precio/tresOpciones.ts`, `movimiento/RepartoDelPrecio.tsx`, `__tests__/diagonales.invariant.ts` | `tipos.ts`, `datos/paginas-web.ts` (`destacada`), `bloques/Precio.tsx`, `__tests__/slots.invariant.ts`, `__tests__/pagina.invariant.tsx`, `__tests__/datos.invariant.ts` | `bloques/precio/Calibres.tsx` |
| M3 | `scripts-servicios/*` (§4.5), `public/servicios/paginas-web/*` (4), `docs/servicios/entregas/m3/medios.json`, `movimiento/VideoDeFondo.tsx`, `__tests__/medios.invariant.ts` | `tipos.ts` y `datos/paginas-web.ts` (el video), `bloques/Trabajos.tsx`, `__tests__/pagina.invariant.tsx` | — |

Todo cae adentro de `_servicios/`, `[servicio]/` (no se toca), `docs/servicios/`, `public/servicios/` y `scripts-servicios/`. Nada del home, del tema, de `scripts-portfolio/`, de `public/portfolio/` ni de `package.json`. Lo de cliente va todo en `movimiento/`, así el padrón de `pagina.invariant.tsx:331-334` sigue diciendo dónde está y solo crece su lista.

---

## 9. Los tests (cada afirmación nueva con su control positivo)

**M1**

| Afirmación | Control positivo |
|---|---|
| El cuerpo, en el orden nuevo: que-hacemos, que-incluye, precio, llamado-del-precio, extra, trabajos, proceso, faq, llamado y cierre; la intro solo con el problema | dos cambiados de lugar; `del-blog` montado; `prueba` montado |
| `h1` = `nombre`, uno solo, en la intro | un `h1` con `problema.titulo` |
| La bajada lleva `problema.titulo` y `problema.texto` en `p`, en la intro | `problema.titulo` como `h2` |
| `h1` = `Service.name` = segunda miga = comienzo del `title` | un `title` con otro nombre |
| El CTA del precio va inmediatamente después del precio, con un envoltorio `data-abre-contacto="panel"` y `data-precarga` = `idEnElHome`; la página tiene tres envoltorios (precio, llamado y cierre) y ningún `data-servicio` | sin `data-precarga`; la precarga de otro servicio; el CTA después de Extra |
| Cómo trabajamos: los cinco pasos y el plazo de los datos; en web, una frase por trabajo con el nombre de la fuente y el texto propio, sin `resena`, `problemaResuelto` ni lo demás (el §7 de hoy se muda a `Proceso.tsx`); un `CtaEnlace` a `HREF_DEL_HOME#` más el primer id de `ANCLAS_DEL_PORTFOLIO`, derivado y no escrito | un ancla que no es del Portfolio; la frase con la reseña |
| Los enlaces internos permitidos suman el deep link (`pagina.invariant.tsx:299-302`) | `/v3#portfolio-otro` |
| Gatillo, puro (`disparo.ts`): las cuatro entradas dan ida, vuelta, nada y nada; la carga se posa salvo debajo de la línea; el salto por encima se posa. Es lo mismo que `cruce.ts` | la implementación que trata «abajo-subiendo» como ida |
| Gatillo, en el marcado: cada bloque de gatillo tiene un solo envoltorio `data-gatillo`, y el HTML servido no lo esconde (sin `invisible` ni opacidad cero) | un envoltorio escondido en el servidor |
| Las marcas de revelado, por tabla: 2 en los progresivos (título y panel), 1 en el FAQ, 0 en el cierre, y gatillo en el CTA del precio, el llamado y trabajos | el cierre con `Revelado`; un CTA con revelado progresivo |
| El acento (§6): los únicos hex de `_servicios/` son los tres del mapa, con `// P-H2` y claves = `IDS_DE_SERVICIO`; `Servicio` no tiene `acento`; el `style` de la intro lleva el claro del mapa para su id | un hex en un archivo de datos; el claro de otro servicio |
| El contenido nuevo, literal: Software «¿Qué pasa si después necesito cambios?», IA «¿El bot reemplaza a mi equipo?» y el texto del CTA de IA, contra una tabla del test; la regla D9 acepta `// SPEC §7.x` o `// M0 §8 (dictado)`, y la segunda solo para los textos de esa tabla | una respuesta sin marca; una con `// M0 §8` que no está en la tabla |
| Sin respuesta queda solo «¿El sistema es mío?» (`datos.invariant.ts:158`) | la lista vieja |
| El código de cliente: `movimiento/` con su lista nueva | un `'use client'` fuera de `movimiento/` |

**Se retiran, por quitar la funcionalidad (no se aflojan):**

- los casos con pósters y «Visitar sitio» y las seis imágenes (`pagina.invariant.tsx:187-198`);
- «con un artículo con `href`, Del blog se monta» (`:98-99`);
- la marca de revelado del cierre (`:365`);
- `CLARO_DEL_SPEC` contra `acento.claro`, que pasa a compararse con el mapa (`datos.invariant.ts:213-214`).

**M2**

| Afirmación | Control positivo |
|---|---|
| Los tres polígonos llenan la caja sin huecos ni encimados: una grilla de 64×40 puntos, cada uno adentro de uno solo, a 1440×900, 1024×768 y 768×1024 | `X2` < `X1` (encimados); un corte corrido (hueco) |
| Cada corte tiene un quiebre en zigzag y uno solo (la corrida cambia de signo dos veces) | un corte recto |
| El ángulo es el mismo en los tres tamaños (±0,1°) | la pendiente en % |
| La Mediana es la del medio, la única en el acento, con «Recomendada» y su línea literal | el acento en la Simple; la línea con un carácter cambiado |
| Ninguna palabra prohibida en la sección («más elegida», «popular», «más vendida», «favorita», «oferta») | un texto con «popular» |
| Mundo cerrado: todo texto de la sección sale de los datos o de los rótulos declarados | un «¡Oferta!» suelto |
| En el DOM: Simple, Mediana y Premium, `h2` y tres `h3`, `ul role="list"` | dos cambiados de lugar |
| El HTML servido muestra los tres en su lugar, sin `transform` ni opacidad cero | un panel escondido en el servidor |
| La sección mide tres pantallas solo con la variante de movimiento y desde 768, y una pantalla con movimiento reducido (las clases sobre la custom property) | el alto alto sin la variante de movimiento |
| Las historias: tres pantallas, con el corte en el borde de arriba de la segunda y la tercera | la tercera sin corte |
| `tresOpcionesDeLosPlanes(IA)` da Starter, Pro y Business con sus datos (lista para la réplica); un `destacada` que no es la del medio tira | cuatro planes |

**Se retiran:** las afirmaciones del marcado de los calibres. «Autogestionable» tres veces en desarrollo y dos en producción (`pagina.invariant.tsx:129-131`) se mantiene, porque cuenta sobre el slot nuevo.

**M3**

| Afirmación | Control positivo |
|---|---|
| Recibo contra archivos: cada video pesa 4.000.000 bytes o menos, dura de 20 a 30 s, sin audio, H.264 `yuv420p` `faststart`, con su póster; bytes y sha256 iguales a los del disco | un recibo de 4,1 MB; un audio; un sha distinto |
| El HTML servido: un solo `<video>`, `muted loop playsInline preload="none"`, sin `autoPlay` ni `src` | un `autoPlay`; un `src` en el servidor; dos `<video>` |
| Con movimiento reducido, solo el póster: ningún `<video>` | un `<video>` en la rama reducida |
| El contraste del velo en el peor cuadro, del recibo, da 4,5 o más | 4,4 |
| El texto: ningún nombre de demo, y «cliente» solo en la frase aprobada | «Noir, nuestro cliente» |
| `montar.ts` no escribe en `public/portfolio/` (el fuente, sin escritura con esa ruta; `git status` limpio ahí) | una escritura con esa ruta |
| La pausa (si D5): el botón con `aria-label` y `aria-pressed` | sin `aria-label` |

**El gate de cada sprint, el del S3b:**

- lint de lo tocado;
- los seis barridos de §5.1 iguales a la base (`s8-montaje` con sus dos fallas del home);
- `datos`, `precios`, `slots`, `seo`, `pagina` y los nuevos;
- `tsc` completo en 0.

Los tests nuevos corren con `npx tsx`.

---

## 10. La partición en sprints

Los tres en **Opus 5.5 · xhigh**: los tres son visuales. Anchos de prueba: 1440, 1024, 768 y 390, más 1280 donde haya medición previa con qué comparar.

Cada sprint corre el dev en :3001 y lo apaga cuando nadie lo mira. Mira la memoria antes de cada pesado, corre uno a la vez, reintenta una vez y, si vuelve a caerse, lo reporta. Termina en FRENO: sin commit hasta que Valentino lo mire.

### M1 — La intro, el orden y el contenido (~2 h)

- **Objetivo:** la plantilla en el orden decidido, con los revelados de la tabla, salvo las diagonales (M2) y el video (M3). La intro con el nombre, el acento en un solo lugar, el contenido nuevo, el CTA del precio, Cómo trabajamos con el Portfolio y el cierre sin revelado.
- **Archivos:** la fila M1 de §8.
- **Criterios medidos:**
  - los tests con sus cuentas y 0 fallas;
  - en las tres páginas y los cuatro anchos: el orden de `data-bloque`, el `h1`, el CTA con su precarga (el modal abre, marca el interés y nunca se envía, con 0 llamadas a /api);
  - el gatillo: entra bajando, se queda, se deshace subiendo, y con movimiento reducido todo está a la vista (estados muestreados);
  - contraste de cada texto de 4,5 o más (el mínimo por página), sin desborde, y el cierre con `transform: none` al fondo;
  - el deep link: cargar `/v3#portfolio-el-garage` cae en El Garage (lo corrige el home, `usePortfolio.ts:221-239`).
- **Qué mira Valentino:**
  - http://localhost:3001/v3/paginas-web a 1440 y 390: la intro dice «Páginas web» con su bajada; después del precio, el botón; Cómo trabajamos con las tres frases y «Ver el portfolio».
  - http://localhost:3001/v3/software-a-medida y http://localhost:3001/v3/ia-y-automatizaciones: las respuestas nuevas, el texto del CTA de IA y que nada se rompió.
- **Si se pasa de 2 h**, el corte natural es M1a (datos, acento, `h1` y contenido, sin movimiento nuevo) y M1b (el gatillo, los dos CTA, Cómo trabajamos y el orden).

### M2 — El precio en diagonales (~2 h)

- **Objetivo:** el slot `calibres` como tres paneles diagonales anclados desde 768 y como historias por debajo, con la Mediana destacada; la firma del slot, lista para IA.
- **Archivos:** la fila M2 de §8.
- **Criterios medidos:**
  - el llenado y el ángulo (puros);
  - las cajas de texto adentro de su región con 16 px a 1440, 1024 y 768;
  - las historias a 390: una opción por pantalla, con el corte entre una y otra;
  - el contraste mínimo de la Mediana (papel sobre el acento, 6,65);
  - con movimiento reducido, una pantalla quieta;
  - la secuencia: en tres puntos del scroll, cada panel llegado y quieto, y reversible;
  - cuadros por segundo y tareas largas durante el pin a 1440, con la escena debajo;
  - las capturas a 844×390.
- **Qué mira Valentino:** http://localhost:3001/v3/paginas-web a 1440, 1024, 768 y 390 (DevTools): recorrer el precio bajando y subiendo, la Mediana y las historias. Y, si puede, en su iPhone (Safari).

### M3 — El video de trabajos (~2 h, más la grabación)

- **Objetivo:** grabar las demos elegidas (D1), montar las dos versiones de 4 MB o menos y montar la sección con su velo y su texto.
- **Archivos:** la fila M3 de §8.
- **Criterios medidos:**
  - el recibo: bytes, segundos, CRF, medidas y el contraste del peor cuadro;
  - el HTML servido: un `<video>`, sin `src` ni `autoPlay`;
  - con movimiento reducido, solo el póster;
  - se reproduce solo en pantalla y se pausa al scrollear;
  - baja un solo archivo por ancho (red);
  - el texto.
  - **Los pesos van en el FRENO.**
- **Qué mira Valentino:** el video a 1440 y a 390 en http://localhost:3001/v3/paginas-web: los cortes, el empalme del bucle, el velo y el texto. Y la hoja de contactos de los tramos de cada sitio, antes de montar.

---

## 11. Qué implica para la réplica (solo anotado)

- **Software y el caso «sin casos».**
  - Cómo trabajamos lleva sus cinco pasos y su plazo, más el CTA al Portfolio general. Es el Portfolio del sitio: no se presenta como casos de software.
  - El slot de trabajos no monta el montaje de web. Muestra la nota «2 sistemas más en desarrollo» y, solo en desarrollo, los huecos de los dos casos propios (Sistema de gestión · Pollería; Sistema de boletas: `software-a-medida.ts:56-62`).
  - Si hiciera falta un texto de caso, va genérico y detrás de la llave (`_contrato/llave.ts:80`, `conLlave` en `inventado.ts:166-168`). Pero la lista cerrada de `INVENTOS` es del home, y **[NO DETERMINABLE LEYENDO]** si `s21-llave` admite una lista propia. Sale P-H23.
- **El precio único de Software.** `proyecto` es una sola opción («Desde USD 1.000» y su nota) y el slot es de tres. Hace falta una variante de una opción (un panel con un solo corte, sin pin) o quedarse con el bloque `Proyecto` de hoy. Se decide en la réplica.
- **IA:**
  - Los planes entran al slot con `tresOpcionesDeLosPlanes`: tres o cuatro líneas por plan, más que las de web, así que hay que medir el texto otra vez. Las funcionalidades siguen en `[a definir]`, solo en desarrollo.
  - Cuál plan es «Recomendado» y su línea los dicta Valentino.
  - La tabla y las tarjetas del S2 y el S2c se retiran con sus tests.
  - El slot de trabajos de IA es la demo del panel: un video del panel grabado con el mismo script (de qué superficie, se decide entonces), más «Probá el panel» (D11 del S1b, `/login`), que en el M1 ya vive en ese slot.
- **El acento** es el mismo mecanismo (§6) en las tres.

---

## 12. Pedidos al home y decisiones para Valentino

### 12.1 Pedidos al home

| Id | Pedido | Por qué | Bloquea |
|---|---|---|---|
| **P-H18** | Subir al contrato el gatillo: `margenDelDisparo`, la curva (`salidaExponencial`, `curvaComoLinear`) y la lectura de tokens (`leerToken`, `milisegundosDe`, `pixelesDe`), o un hook del disparo por línea | Hoy viven en `tu-panel/entrada.ts:19-31,80-82` y `tu-panel/tokens.ts:7-26`, y servicios los importa evaluados. Un cambio adentro de `tu-panel` los rompe (así se rompió el test del merge-1 con `Tira.tsx`), aunque esta vez lo avisa `tsc` | No |
| **P-H19** | Que las historias de B1.3 (las barras y la hoja que sube) sean reusables, o que el home diga si el precio en historias las lleva | B1 §5.10 (`SPRINT-B1-PORTFOLIO.md:504-511`); hoy no existen (`EscenarioDelPortfolio.tsx:34`) | No |
| **P-H20** | B12a: qué necesita del DOM de la intro | Servicios deja el `h1` = `nombre` adentro de `[data-intro-de-servicio]` y el alto en una constante, sin atributos nuevos | No |
| **P-H21** | Una pausa para los videos de fondo en bucle (WCAG 2.2.2, nivel A: lo que se mueve solo más de 5 s junto a otro contenido necesita pausa) | `VideoDeServicio.tsx` tampoco la tiene; si el home elige un patrón, servicios lo copia | No (D5) |
| **P-H22** | Pushear B1.2c (`233fd262`) para el merge-2 | Trae `--color-acento-<id>-claro` y `ALIAS_DE_ACENTO_CLARO`: con eso P-H2 se cierra y el mapa de §6 se va | No |
| **P-H23** | Una casilla de servicios en `INVENTOS`, o el visto bueno para una lista propia que use `conLlave` | Solo si la réplica sin casos necesita un texto genérico | No (réplica) |

**Se cierra P-H9:** con `Prueba` se van los pósters, y servicios ya no necesita sus medidas.

**Siguen abiertos:**

- P-H4: la escena debajo de la tapa. Con un anclado y un video, su costo pesa más, y el M2 y el M3 lo miden.
- P-H10: el foco vuelve a `BODY` al cerrar el modal. Ahora son tres los que lo abren.

### 12.2 Decisiones para Valentino

| Id | Decisión | Opciones | Recomiendo |
|---|---|---|---|
| **D1** | Qué demos son las «premium» | las cinco (8 cortes de 3 s) · tres (6 de 4 s, sitio y demo uno a uno) | **Tres: Ethereal, Noir y Skyline.** No comparten rubro con ningún cliente; Niche es perfumería, como Banú |
| **D2** | La bajada de la intro | dos `p`: el problema como entrada y su texto · solo `problema.texto` | **Dos `p`**: los dos textos literales, sin inventar puntuación |
| **D3** | El CTA de debajo del precio | solo el botón · el título, el texto y el botón (repetiría el llamado) | **Solo el botón.** El texto de IA va en el llamado (`cta.texto`) |
| **D4** | El velo del video | tinta en degradé del lado del texto, con `text-fondo` · papel parejo con `text-tinta` | **Tinta en degradé**, alfa de 0,7 o más bajo el texto (6,59:1 en el peor píxel). El papel deja el video como un fantasma |
| **D5** | La pausa del video | un botón de pausa · ninguno, como el home | **El botón** (WCAG 2.2.2), con P-H21 para que el home lo adopte |
| **D6** | El texto del video (título y la línea que separa clientes de demos) | dictado por Valentino · reusar la frase de Demos del home (`catalogo.ts:60`) | **Dictado**; hasta entonces, C2 provisorio |
| **D7** | Del blog | retirar el componente y su test · dejarlo sin montar | **Retirarlo.** `articulos` queda en los datos para cuando exista el blog |
| **D8** | Lo que se va con `Prueba` | se van los pósters y «Visitar sitio» · cada frase de Cómo trabajamos conserva «Visitar sitio» | **Que se vayan.** El nombre está en la frase y el Portfolio tiene los sitios |
| **D9** | El deep link «sin filtro» | `/v3#portfolio-el-garage` · `/v3#trabajos` | **`#portfolio-el-garage`**: es donde aterriza el ítem «Portfolio» del menú (`SPRINT-B1-PORTFOLIO.md:727`); `#trabajos` cae antes del selector |
| **D10** | Dónde empiezan las historias | por debajo de 768 · por debajo de 1024 | **768**, como B1 §5.10; sube a 1024 si el M2 mide que a 768 el texto no entra |
| **D11** | El `h2` «Precio» en el anclado | `sr-only` · visible | **`sr-only`** (el precedente es `ServiciosEnSecuencia.tsx:62-72`) |
| **D12** | La transición del montaje | fundido de 0,5 s · barrido diagonal (eco del precio) | **El fundido**: calmo |
| **D13** | La velocidad de las demos | 2×, como el Portfolio · 1× | **2×**: los clips de los sitios ya están a 2× |
| **D14** | Volver a grabar los sitios en vez de reusar los MP4 del Portfolio | reusar (segunda generación, El Garage agrandado) · grabarlos de nuevo con nuestro script | **Reusar**, como dice el plan; si debajo del velo se nota, lo vemos en el FRENO del M3 |

---

## 13. Lo que no se determina leyendo (y cómo se mide)

| # | Qué | Cómo | Sprint |
|---|---|---|---|
| 1 | Si el texto entra en las regiones a 1024×768 y 768×1024 | cajas de texto contra el polígono, 16 px de margen | M2 |
| 2 | El teléfono acostado (844×390) | captura | M2 |
| 3 | `clip-path` con `calc()` y `svh` en Safari | el iPhone de Valentino | M2 |
| 4 | La doble suavidad (Lenis + P2) | tres muestras a 250 ms con la rueda quieta | M2 |
| 5 | El costo del pin con la escena debajo | cuadros por segundo y tareas largas a 1440, como el S1b | M2 |
| 6 | El alto de cada demo, y si graba limpia en tiempo virtual | la sonda: GET, `scrollHeight` y una captura | M3 |
| 7 | El mejor tramo de cada sitio | la hoja de contactos, y elige Valentino | M3 |
| 8 | Si 24 s entran en 4 MB a la calidad de partida | el bucle de CRF | M3 |
| 9 | El contraste real sobre los cuadros con el velo elegido | `velo.ts` | M3 |
| 10 | Si `tu-panel` cambia las utilidades del gatillo antes del merge-2 | `tsc` y el barrido al mergear | merge-2 |
| 11 | Si `s21-llave` admite una lista de inventos fuera de `inventado.ts` | leerlo en la réplica, o P-H23 | réplica |
