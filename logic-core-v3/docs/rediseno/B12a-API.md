# B12a — la API para las páginas (firmas definitivas)

**Para qué:** servicios trabaja contra este archivo. Son las firmas con las que una página se enchufa a la escena del home: el preset de ruta, la intro, el preset del título y la ranura de variantes. **Para armar una página, empezá por §7** (el paso a paso) y por la maqueta que anda, `/v3/pagina-base`.
- El plan y el log de B12a están en `docs/rediseno/SPRINT-B12a.md`.
- Las rutas son desde `src/app/v3/`; `esc/` es `_lib/escena/`.

**La regla:** estas firmas no cambian sin aviso. Si servicios necesita otra cosa, se pide como P-H y el cambio se anota acá con su fecha. Lo que todavía no existe en el código tiene la firma fijada igual, y dice en qué subsprint llega.

**Estado** (2026-10-21, B12a.8):

| Pieza | Estado |
|---|---|
| El preset de ruta | hecho (B12a.1, B12a.2 y B12a.3); `variante` es un id del registro (P-H29e) |
| La intro | hecha (B12a.2, B12a.3 y B12a.8): 2,5 pantallas con el título y «de qué se trata», la composición (`?composicion=1\|2\|3`), la bajada en el plano del título y el texto sin velo (§2) |
| La ranura de variantes | hecha (B12a.3), con P-H29 a–f, medida en el build de D7 |
| El preset del título | hecho (B12a.4 y B12a.8): en volumen como los del home, en una línea y protagonista; la familia, a elegir por Valentino con `?titulo=1…4` o en `/v3/titulos-de-pagina` (sin la bandera, la 1, la del «6») (§3) |
| La navbar | hecha (B12a.5 y B12a.8): «Home» primero, «Servicios» es un enlace con su lista aparte, la píldora arriba en las páginas (§5) |
| La navegación entre páginas | hecha (B12a.6 a B12a.8): `EnlaceDeRuta` con la precarga, y la salida de la variante y el velo juntos; el velo en el compositor y sin pantalla en blanco; la vuelta al home por entrada del historial; el bfcache (§5) |
| Las historias | P-H31 (`4af1539c`): la transición propia, el freno en cualquier uso y las barras sobre el acento (§6) |
| La página base | hecha (B12a.8): `/v3/pagina-base`, la maqueta que se copia; el paso a paso en §7 |
| El cierre de una página | hecho (B13, 2026-10-22, sin ver): `CierreDeLaPagina`, Seis razones → el CTA (con el servicio de la página) → la resolución → el pie, con la escena de la página; la señal `resolucion` para la variante (§8) |

**Los cambios de firma desde la primera versión (`8926656a`).** Todos son del 2026-10-20 y los pidió servicios como P-H29 (su `SPRINT-V0.md` §4):
- `PresetDeLaEscena.variante` pasa de componente a id (e).
- `PropsDeLaVariante` suma `luzDeAbajo`, `energia` y `saliendo` (a, b, c y d).
- Llegan:
  - `SALIDA_DE_LA_VARIANTE_MS`, `pedirLaSalidaDeLaVariante` y `COMPOSICION_DE_LA_LUZ` (d y f);
  - `PISTA_DE_LA_INTRO` con `POSE_DE_LA_INTRO` (g).

**Después (2026-10-20):**
- **B12a.4:** `PresetDelTitulo` quedó sin `lectura`. `fuentes` son dos fuentes de página y `asiento` es el de la llegada (`AsientoDeLaLlegada`). `TituloDePagina` toma `partes` opcional (§3).
- **P-H31:** `PropsDeLasHistorias` suma `transicion` y `colorDeLasBarras`, y llega `BARRAS_SOBRE_ACENTO` (§6).

**Después (2026-10-21, B12a.8):**
- `IdDePagina` cambia `'prueba'` por `'base'`: la ruta de prueba pasó a ser `/v3/pagina-base`.
- `PANTALLAS_DE_LA_INTRO` pasa de 1,5 a 2,5. Llegan `TRAMO_DEL_TITULO`, `TRAMOS_DE_LA_INTRO` y `PropsDeLaIntro.deQueSeTrata` (opcional) (§2).
- `COMBINACIONES_DEL_TITULO` pasa a cuatro y llega `idDeLaParte` (§3).
- `EnlaceDeRuta` acepta los atributos de un `<a>` y su `ref`. Llegan `EVENTOS_DEL_VELO.quieto`, `VELO_EN_CURSO`, `esperaAlVelo` y `cuandoElVeloQuede` (§5).

**Después (2026-10-22, T0 nocturno; `docs/rediseno/SPRINT-T0-NOCTURNO.md`):**
- **La variante, encendida desde el avance 0.** La noche y el acento de la página tienen que estar en el primer cuadro, en la composición
  inicial (pedido de Valentino). La de la base lo está (`cuadroDeLaPrueba`); las de servicios se encienden con el scroll (P-S). El velo
  destapa con la variante de la página ya dibujada (`esc/ruta/listaDeLaRuta.ts`, `escenaDeLaRutaLista`), con el techo de siempre.
- `EVENTOS_DEL_VELO.destapa` (de B12a.8) y llegan `marcarLaBanda` y `retenerElQuieto`: el «quieto» se avisa cuando terminan la banda y lo
  que la retiene (la píldora que se desliza). `viaDelVelo` y `VIA_POR_DEFECTO` son las vías del velo hacia el home (sólo el banco las elige).
- El título de una página va con la legibilidad `peso` por defecto (`LEGIBILIDAD_POR_DEFECTO`, §3); `?legibilidad=tamano`, con la bandera.
- La escena compila con `compilarConCuidado` (`esc/gpu/compilar.ts`), no con `compileAsync`: una variante que compile algo, que use esa.

**Después (2026-10-22, B12b nocturno; `docs/rediseno/SPRINT-B12B-NOCTURNO.md`):** el viaje desde el CTA de un servicio del home (§5, «El
viaje»). Ninguna firma cambia: `EnlaceDeRuta` sigue igual. Llegan `pedirElViaje`, `ViajeDelVelo`, `PedidoDelVelo.viaje` y `hayVelo`
(`_lib/veloDeNavegacion.ts`), y `esc/ruta/viajeDelServicio.ts`. El preset de la página base pasó a `pagina-base/preset.ts` (lo lee el viaje).
**Para servicios (P-S):** cada página de servicio exporta su preset de un módulo SIN JSX (como `pagina-base/preset.ts`), para que el home
lo apile antes de navegar (`PRESET_DEL_DESTINO`, `_secciones/servicios/escenario/datos.ts`); tiene que ser el mismo objeto que declara la página.

**Después (2026-10-22, B13 nocturno; `docs/rediseno/SPRINT-B13-NOCTURNO.md`):** el cierre de cada página (§8).
- `PropsDeLaVariante` suma `resolucion` (§4): la señal del tramo del pie, 0 → 1. **Para servicios (P-S):** cada variante la implementa (en
  1, lo que movió en reposo y su luz en la de la composición: el piso liso y calmo). Una variante que no la lee sigue andando (el piso no se
  calma: se ve encendida debajo del pie).
- `tramos.pie` deja de ser `null`: es `SELECTOR_DEL_CIERRE` (`esc/ruta/atributoDelCierre.ts`) y la página monta `<CierreDeLaPagina preset={PRESET} />`
  al final de su `<main>` (§7 y §8).
- Un dueño por tramo (P-H29a), al día: en el cierre de la página la luz de abajo y la energía son de la ranura (con la resolución); el final
  del home (el encastre del logo en su hueco) no corre en una página (§4).
- Llegan, del home y para el cierre: `PrecargaDelCta` (el servicio que el CTA del final precarga), `MaterialDeLosTitulos` (el material de los
  títulos de volumen de un tramo) y `ModoDelPieForzado` (el pie plano en un tramo). Sin proveedor, el home no cambia.

---

## 1. El preset de ruta (D1: lo declara la página)

```ts
// esc/ruta/preset.ts
export type IdDePagina = 'home' | IdDeServicio | 'base'        // IdDeServicio: 'web' | 'ia-automatizacion' | 'software' (_secciones/_contrato/acento.ts); 'base', la maqueta

export interface PresetDeLaEscena {
  readonly id: IdDePagina
  /** Los bloques que despiertan la escena (selectores de CSS): la intro y, desde B13, el pie. Fuera de ellos, en el papel, la escena duerme (D8). */
  readonly tramos: { readonly intro: string; readonly pie: string | null } | null
  /** La pista de cámara de la intro: de la composición inicial (avance 0) a la pose de la intro (avance 1). `null` sólo en el home. */
  readonly pista: readonly ChoreoKeyframe[] | null
  readonly noche: 'dia' | 'noche'
  /** El servicio dueño del acento: el claro sale del token por el id (`--color-acento-<id>-claro`), nunca un hex. */
  readonly acento: IdDeServicio | null
  /** [P-H29e] La variante de escena de la página, por su id en el registro (§4), o `null`. Un id, no el componente. */
  readonly variante: IdDeVariante | null
}

export const PRESET_DEL_HOME: PresetDeLaEscena
export function presetActual(): PresetDeLaEscena | null
export function apilarElPreset(p: PresetDeLaEscena): () => void          // una pila: la página nueva entra antes de que salga la vieja
export function suscribirseAlPreset(f: () => void): () => void

// esc/ruta/PresetDeLaPagina.tsx — 'use client'; no pinta nada
export function PresetDeLaPagina(props: { readonly preset: PresetDeLaEscena }): null

// esc/ruta/pistaDeLaIntro.ts
export const PANTALLAS_DE_LA_INTRO = 2.5                  // [B12a.8] era 1,5 (§2)
export const COMPOSICION_INICIAL: ChoreoPose          // la pose de llegada de todas las páginas: la del hero con el logo centrado
export const POSE_DE_LA_INTRO: ChoreoPose             // la pose 2, girar (la eligió Valentino): un cuarto de vuelta corto alrededor del logo
export const PISTA_DE_LA_INTRO: readonly ChoreoKeyframe[]   // [P-H29g] la pista compartida, de COMPOSICION_INICIAL a POSE_DE_LA_INTRO
export const AVANCE_DE_LA_INTRO: { current: number }  // 0 → 1; lo escribe la lectura del scroll, lo leen el rig y la variante
```

**Cómo lo usa una página de servicio:**
- Arma su preset como constante del módulo, una por servicio. Debe ser el mismo objeto en cada render: la escena arma la pista una vez por preset.
  - `{ id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: SELECTOR_DEL_CIERRE }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante: '<su id del registro>' }`.
  - [B13] `pie: SELECTOR_DEL_CIERRE` (de `esc/ruta/atributoDelCierre.ts`, NO del componente de cliente) con el cierre montado (§8); `null` sólo en una página sin cierre.
- Se lo pasa a `IntroDeLaPagina` (§2), que lo declara. Una página sin intro monta `<PresetDeLaPagina>` sola.
- **La variante viaja por id (P-H29e).** Una página de servidor no puede pasarle una función a un componente de cliente. El preset lleva el id, y la ranura carga el componente del registro con un import dinámico (§4). Así cada variante queda en su propio pedazo.
- `_lib/` nunca importa nada de `_servicios/`. El único lugar del home que nombra a las variantes es el registro (`_variantes/registro.ts`, fuera de `_lib/`).

## 2. La intro de la página (P-H13, P-H20; B12a.8)

```tsx
// _componentes/pagina/IntroDeLaPagina.tsx — sin 'use client' (se renderiza en el servidor)
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'   // su valor es preset.id (el IdDeServicio en servicios)
export const SELECTOR_DE_LA_INTRO = '[data-intro-de-pagina]'           // lo que va en tramos.intro
export const TRAMOS_DE_LA_INTRO = { titulo: 'tramo-del-titulo', deQueSeTrata: 'de-que-se-trata' } as const   // [B12a.8] sus dos tramos (data-parte)

export interface PropsDeLaIntro {
  /** El nombre de la página: el texto del h1 del DOM y el del título 3D, el MISMO (B12a.4). Uno de TITULOS_CON_LETRAS (§3). */
  readonly titulo: string
  /** [B12a.4] Las dos partes del título, para las dos variantes de Archivo (D3). Unidas con un espacio dan `titulo`. Sin ellas: la primera palabra y el resto. */
  readonly partes?: readonly [string, string]
  /** La bajada: párrafos (`ParrafoDeLaBajada`), sin heading. */
  readonly bajada: React.ReactNode
  /** [B12a.8] El bloque corto de «de qué se trata», sobre la escena, entre el título y el papel: una etiqueta y un párrafo. Opcional. */
  readonly deQueSeTrata?: React.ReactNode
  readonly preset: PresetDeLaEscena
}
export function IntroDeLaPagina(props: PropsDeLaIntro): React.JSX.Element
export function ParrafoDeLaBajada(props: { readonly children: React.ReactNode }): React.JSX.Element

// esc/ruta/pistaDeLaIntro.ts
export const PANTALLAS_DE_LA_INTRO = 2.5   // [B12a.8] era 1,5: calibrable acá (el bloque la lee por una variable de CSS)
export const TRAMO_DEL_TITULO = 1.6        // [B12a.8] cuántas pantallas dura el tramo del título; el resto es «de qué se trata»

// esc/ruta/composicion.ts — [B12a.8] la composición de la intro (a elegir por Valentino)
export type IdDeComposicion = '1' | '2' | '3'
export const COMPOSICION_POR_DEFECTO: IdDeComposicion   // '3', hasta que Valentino elija
```

**Qué hace:**
- **El bloque:** mide `PANTALLAS_DE_LA_INTRO` pantallas (2,5) y es transparente: se ve la sala de noche.
  - Lleva el atributo con el id de la página y es el bloque que mide la escena: el avance de la intro va de 0 (su tope en el tope del cuadro) a 1 (2,5 pantallas después). La pose 2 (girar) se estira sobre la intro entera.
  - De noche lleva los claros (la sección invertida). Con acento, lleva `data-servicio="<preset.acento>"`.
- **El orden** (B12a.8):
  1. **el tramo del título** (`TRAMO_DEL_TITULO`, 1,6 pantallas): el título en volumen con su bajada, fijos arriba mientras dura; el título cae al terminar el tramo;
  2. **«de qué se trata»**, centrado en el resto de la intro, sobre la escena (si la página no lo pasa, el tramo queda vacío);
  3. **el papel** (el cuerpo de la página).
- **La composición** (`?composicion=1|2|3`, se lee en el cliente; sin la bandera, la 3):
  1. el título centrado ARRIBA del logo;
  2. el título a la DERECHA y el logo a la IZQUIERDA;
  3. el título a la IZQUIERDA y el logo a la DERECHA (como el hero del home).
  - El logo se corre con el encuadre de la cámara (`frameX`/`frameY`, resueltos para que su centro caiga en el hueco que deja el DOM), no moviéndolo. El avance 0 es el de la composición; la pose 2 gira con el logo en su lugar.
  - El título, la bajada y «de qué se trata» van en el mismo eje (± 1 % del ancho).
  - En la 2 y la 3, 8 vw de aire del lado de afuera: el título en volumen va fijo en el mundo y, con el mouse en ese extremo, la perspectiva lo agranda hacia el borde (sin el aire se salía del cuadro).
  - **Abajo de 1024, las tres son la 1.**
- **El `h1`:** siempre en el DOM, con `titulo`, en UNA línea (T1). Desde 1024 con la escena queda escondido a la vista mientras el título en volumen está puesto; es el visible sin WebGL, con movimiento reducido o abajo de 1024.
- **La bajada va en el plano de su título** (`BajadaDeLaIntro`, con `useAcompananteDelTitulo`, como la bajada del hero): con el mouse el título se ve en perspectiva y la bajada lo acompaña; nunca le queda debajo.
- **El contraste (P-H33, T5):** sin velo ni mancha detrás: la escena se ve limpia. La bajada, «de qué se trata» y el `h1` del DOM llevan una sombra oscura pegada a las letras (`--sombra-de-la-intro`, `_estilos/intro.css`); el título en volumen, de noche, va en papel y se lee por su volumen, su material y su luz.

**Para servicios:**
- `_servicios/Intro.tsx` deja su atributo (`data-intro-de-servicio`), su alto y la tapa interina: los pone `IntroDeLaPagina`. Servicios pone su contenido adentro (D2): el título, la bajada y «de qué se trata».
- No le pongas alto, color ni fondo a la intro, ni nada entre la intro y el cuerpo.

## 3. El preset del título (P-H14; B12a.4 y B12a.8)

```ts
// _componentes/titulos3d/presets.ts
export interface PresetDelTitulo {
  /** D3: dos variantes de Archivo, ninguna la condensada del home: la primera parte con `fuentes[0]` y la segunda con `fuentes[1]`. */
  readonly fuentes: readonly [FuenteDePagina, FuenteDePagina]
  /** Dónde asienta la llegada al frenar a mitad. */
  readonly asiento: AsientoDeLaLlegada
  /** Se va con una caída, nunca de golpe ni hacia arriba. */
  readonly saleCayendo: true
}
export const COMBINACIONES_DEL_TITULO: readonly [PresetDelTitulo, PresetDelTitulo, PresetDelTitulo, PresetDelTitulo]  // [B12a.8] las de ?titulo=1…4
export const TITULO_DE_PAGINA: PresetDelTitulo        // la 1 (la del «6»), hasta que Valentino elija
export const TITULOS_CON_LETRAS: readonly string[]    // los títulos que las fuentes de página saben escribir
export function partesDelTitulo(titulo: string, partes?: readonly [string, string]): readonly [string, string]

// _componentes/titulos3d/TituloDePagina.tsx — lo renderiza IntroDeLaPagina; una página no lo llama directo
export function TituloDePagina(props: { readonly id: IdDePagina; readonly titulo: string; readonly partes?: readonly [string, string]; readonly deNoche?: boolean }): React.JSX.Element
export const idDeLaParte: (id: IdDePagina, parte: 1 | 2) => string   // [B12a.8] el id de cada parte en volumen (lo usa su bajada)
```

- **En volumen, como los del home (T4):** fijo en el mundo, como la mayoría de los títulos del home (`parteDelMouse` 0): la cámara sigue al mouse con sus topes y su suavizado y el título se ve en perspectiva. Abajo de 1024, la regla de los títulos del home a ese ancho: el `h1` del DOM.
  - Llega con el gesto y el reloj del titular del hero; al terminar su tramo cae donde estaba (si el bloque se suelta a mitad de la caída, no se lo lleva para arriba).
- **El protagonista (T1):** en UNA línea, del ancho que le da su columna: el tamaño sale del ancho medido de cada título en su cara (`anchoDelTitulo.ts`, con las métricas de `_fuentes/metricas-del-titulo.json`), no de una escala fija. En la 1 desde 1024, el 74 % del ancho de la intro; de costado (la 2 y la 3), el 97 % de su columna (sin el aire de afuera); abajo de 1024, el 97 % del ancho útil, arriba del logo.
- **Las partes:** el `h1` lleva el título entero. Desde 1024 con la escena, cada parte es un título de volumen en la cara de su instancia.
- **El avance** lo lee el título de `AVANCE_DE_LA_INTRO`: no hay prop, así no se re-renderiza por cuadro.
- **Las fuentes:** un JSON 3D por instancia (unos 13 KB, con import dinámico: el home no las baja) y la misma instancia en WOFF para el DOM.
- **Las letras:** las de `TITULOS_CON_LETRAS`. s78 exige cada letra en cada instancia. **Un título nuevo obliga a regenerar** con `scripts-retoque/fuentes-3d.py` (que también escribe las métricas): pedilo como P-H.
- **La familia, D3:** cuatro combinaciones detrás de `?titulo=1…4`, y la comparación lado a lado en `/v3/titulos-de-pagina`. La 1 es la del «6» (el nombre de `?nombre=6`, «Prueba de la intro», con la familia por defecto): la pesada en la primera parte y la liviana en la segunda. Valentino elige, la bandera se va y `TITULO_DE_PAGINA` queda con la elegida. La firma no cambia.

## 4. La ranura de variantes (B12a.3, hecha)

```ts
// esc/ruta/variante.ts — sólo tipos y números (lo importa servicios): ningún valor de three ni de react
export interface PropsDeLaVariante {
  /** El avance de la intro, 0 → 1. Se lee en el useFrame (`avance.current`): la variante no se re-renderiza por cuadro. */
  readonly avance: Readonly<{ current: number }>
  /** El claro del acento de la página, leído del token al cargar la variante (blanco sin acento). No cambia durante la salida. */
  readonly acento: THREE.Color
  /** 'plena' o 'compacta' (abajo de 1024, o con la GPU chica): esc/calidad.ts. */
  readonly calidad: NivelDeCalidad
  /** Movimiento reducido: el estado final, quieto, en cualquier avance; la salida, inmediata. */
  readonly reducido: boolean
  /** [P-H29a · b] La luz de abajo del piso (las juntas y el plano de debajo), en el useFrame: energía 0 → 1 y color (blanco → el acento: es luz). */
  readonly luzDeAbajo: (energia: number, color: THREE.Color) => void
  /** [P-H29c] El color de la energía de noche (las brasas, los arcos y la red: `uLuzNoche`), en el useFrame. */
  readonly energia: (color: THREE.Color) => void
  /** [P-H29d] Pasa a `true` cuando la página se va: SALIDA_DE_LA_VARIANTE_MS para volver a la composición; sigue en `true` hasta el desmontaje. */
  readonly saliendo: Readonly<{ current: boolean }>
  /** [B13] La resolución, 0 → 1: la señal del tramo del pie (el cierre, §8). En 1, resuelta: lo que movió en reposo y su luz en la de la composición. */
  readonly resolucion: Readonly<{ current: number }>
}
export type ComponenteDeVariante = React.ComponentType<PropsDeLaVariante>
export const PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0.5 } as const
export const SALIDA_DE_LA_VARIANTE_MS = 420                              // [P-H29d] termina antes de que el velo cubra (460 ms; B12a.8: van juntos)
export const COMPOSICION_DE_LA_LUZ = { noche: 1, brilloDelPiso: 0.12 } as const   // [P-H29f] la del avance 0 de toda página, del home

// _variantes/registro.ts — [P-H29e] fuera de _lib/: el único lugar del home que nombra a las variantes
export const REGISTRO_DE_VARIANTES = {
  prueba: () => import('../_lib/escena/ruta/VarianteDePrueba'),
  // web: () => import('../_servicios/escena/<su archivo>'),   ← cada servicio agrega SU línea al montar su variante
} as const
export type IdDeVariante = keyof typeof REGISTRO_DE_VARIANTES
export const esIdDeVariante: (id: string) => id is IdDeVariante

// esc/ruta/RanuraDeLaVariante.tsx — 'use client'; adentro del <Canvas>, montada después del final del pie (ProbeStage)
export function RanuraDeLaVariante(props: { readonly calidad: NivelDeCalidad; readonly reducido: boolean }): React.JSX.Element | null

// esc/ruta/salidaDeLaVariante.ts — [P-H29d] la señal; sin react ni three (la importa la navegación)
export function pedirLaSalidaDeLaVariante(): Promise<void>
export function atenderLaSalida(a: () => Promise<void>): () => void   // sólo la ranura
```

**Cómo se arma una variante:**
- **Archivo:** un módulo `'use client'` que exporta el componente como `default` (el registro hace `import()` del módulo).
- **Registro:** una línea en `_variantes/registro.ts`, con su id. El preset de la página lleva ese id.
- **Lo que crea, en JSX** (`<mesh>`, `<ringGeometry>`…): R3F lo libera al desmontarse. Lo que cree a mano con `new THREE.*`, lo libera ella.
- **La referencia** es `esc/ruta/VarianteDePrueba.tsx`, la de `/v3/pagina-base`: un anillo de luz en el piso, la luz de abajo de 0,12 a 1 en la primera mitad del avance y teñida, la energía teñida, y la salida con 1 − (1 − t)³. [T0] Encendida desde el avance 0. [B13] Con la resolución, lo encendido se apaga (`1 − resolucion`): el anillo se cierra y se apaga, la luz de abajo vuelve a 0,12 y la energía al blanco; con movimiento reducido, de una a la mitad.

**Lo que una variante puede hacer:**
- Agregar objetos a la escena y animarlos con `useFrame`, sin prioridad: el render lo sigue haciendo la escena.
- Leer `avance`, `acento`, `calidad`, `reducido`, `saliendo` y [B13] `resolucion`.
- [B13] **Resolverse con `resolucion`** (la tiene que implementar cada variante): de 0 a 1 en la pantalla que sigue al CTA del cierre, lo que
  movió vuelve a su reposo (los bloques que subieron, abajo; lo que se abrió, cerrado) y su luz de abajo y su energía, a la composición
  (`COMPOSICION_DE_LA_LUZ.brilloDelPiso`, blancas). En 1 el piso queda liso y calmo, y recién ahí entra el pie. Al subir, vuelve. Función del
  valor, sin reloj (es scroll).
- Encender y teñir la luz de abajo con `luzDeAbajo`, y teñir la energía con `energia`, en su `useFrame`, cada cuadro. Sin llamarlas queda la luz de la composición.

**Lo que no puede hacer:**
- Mover la cámara, la luz de la sala, el progreso del rig ni el avance.
- Escribir los almacenes directo (`LUZ_DE_ABAJO_EN_VIVO`, `ENERGIA_DE_LA_RUTA`): sólo a través de las dos funciones.
- Tocar `_lib/**`, salvo importar los tipos y números de `esc/ruta/variante.ts`.
- Usar un `EffectComposer`: el canvas es transparente (lección del repo).

**Un dueño por tramo (P-H29a):**
- **En la intro** la luz de abajo y el color de la energía son de la ranura, y con ella de la variante: mientras el avance es menor que 1, o mientras la variante sale.
- **[B13] En el cierre** (desde que manda su pista, `cierreManda`, media pantalla antes de que asome) también son de la ranura, y con ella
  de la variante, que se resuelve con `resolucion`. **El final del home (el encastre del logo en su hueco) no corre en una página**
  (`enUnaPagina`, `esc/ruta/cierreDeLaPagina.ts`): el gesto del pie de una página es la resolución.
- **En el cuerpo en papel** la escena duerme: nadie escribe.
- **En el home** (sin pista) la ranura no toca nada, y el final es el de siempre.
- La ranura escribe después del final del pie (está montada después de él), así que en la intro y en el cierre manda la suya.

**La salida (P-H29d):**
- **La pide la navegación antes de irse,** con `pedirLaSalidaDeLaVariante()`, y espera la promesa:
  - `saliendo` pasa a `true`;
  - la variante baja a la composición en `SALIDA_DE_LA_VARIANTE_MS`, con la página todavía quieta;
  - se resuelve, y recién entonces se navega. [B12a.8] `EnlaceDeRuta` la pide a la par del velo: la banda cubre mientras la luz baja, y navega cuando terminaron las dos.
- **Se resuelve en el acto** sin variante montada, con la escena tapada por el papel o con movimiento reducido. Se resuelve siempre.
- **Por qué antes y no al cambiar la ruta** (medido en el build de D7): si arranca con la navegación, el montaje de la página nueva traba los cuadros (huecos de 133 ms a 1440 y de 547 a 390), y la luz salta en vez de bajar.
- **El respaldo:** si la ruta cambia sin la señal (la flecha del navegador), la salida arranca ahí, con esos tirones. La variante se desmonta con la salida terminada.

**Lo que cuesta, y cómo se mide** (`scripts-carga/ranura.ts`, contra el build de producción):
- ≤ `PRESUPUESTO_DE_LA_VARIANTE.cpuMsPorCuadro` de CPU por cuadro: la diferencia con y sin la variante, alternadas y recién recargadas.
  - La de prueba da Δ ≈ 0 (de −0,06 a 0,002 ms), bajo la resolución del banco (~0,1 ms).
  - El control, 0,8 ms a propósito, da 0,66: FALLA.
  - Para la variante de un servicio: `COSTO=1 BASE=<build> npx tsx scripts-carga/ranura.ts`, con su página en la ruta.
- **La memoria:** diez idas y vueltas dejan `renderer.info.memory` como estaba (40/27 a 1440, 32/21 a 390).
- **Con la escena dormida** (el papel), la variante no corre: no hay cuadros.

## 5. La navbar y la navegación entre páginas (B12a.5 a B12a.8; hechas)

```tsx
// _componentes/navegacion/EnlaceDeRuta.tsx — el <Link> de next con el velo; nunca router.push ni TransitionContext
export function EnlaceDeRuta(props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { readonly href: string; readonly ref?: Ref<HTMLAnchorElement> }): React.JSX.Element

// _lib/veloDeNavegacion.ts — [B12a.8] los avisos del velo y la espera de las obras pesadas
export const EVENTOS_DEL_VELO = { cubre: 'v3:velo-cubre', repuso: 'v3:velo-repuso', quieto: 'v3:velo-quieto' } as const
export const VELO_EN_CURSO: { activo: boolean }
export function esperaAlVelo(lugares: readonly (Element | null)[]): boolean   // ¿la obra espera? (en curso y nada a la vista)
export function cuandoElVeloQuede(f: () => void): () => void
```

- **La navbar la monta el layout** (`ChromeDelHome`): la misma píldora, el menú, el contacto y el sonido en el home y en las páginas. Una página no la monta.
  - **El orden:** «Home» primero, después las secciones del home. En el home, «Home» sube al principio (el viaje); desde una página, va al home arriba con el velo.
  - **«Servicios» es un enlace** a `/v3#servicios` (desde una página, al home en su sección, con el velo). La lista de las páginas de servicio (`PAGINAS_DE_SERVICIO`, `_chrome/paginas.ts`, copiadas hasta el merge) abre aparte: con el hover con intención (180 ms quieto encima), con la flecha abajo sobre «Servicios», o con la flechita del costado (clic, Enter o Espacio). Sin «Todos los servicios». Esc la cierra y el foco vuelve.
  - **En el teléfono**, en el menú: tocar «Servicios» navega; la flechita de al lado abre el acordeón con las páginas.
  - **En una página, la píldora nace ARRIBA** (donde termina en el home después de subir) y no se mueve con el scroll (`?navbar=abajo` muestra la del home, para comparar). Al cambiar de ruta se desliza de su lugar al del destino mientras pasa el velo.
- **Un enlace de una página a otra de `/v3` va con `EnlaceDeRuta`,** no con `<a>` ni con `<Link>` suelto. Hace:
  1. precarga el destino: el `prefetch` del `<Link>` (la ruta, apenas el enlace está a la vista; con el puntero encima o un toque, el `<Link>` la adelanta) y, con el puntero o el foco, las fuentes de su título (`calentarElDestino`);
  2. al clic, pide `pedirLaSalidaDeLaVariante()` (§4) y cubre con el velo, JUNTOS: la banda cubre mientras la luz baja;
  3. con los dos terminados, deja pasar el clic: la navegación cliente, sin rehacer el lienzo ni el chrome.
  - Un ancla del documento (`#…`) sigue siendo un `<a>`.
- **El velo:** una banda en diagonal que se mueve con `transform` (en el compositor: no se traba con el montaje) y contrasta con lo que tapa: sobre papel o la sala de día, la tinta; sobre la escena de noche, el papel. Pasa por debajo del chrome. Cubre en 460 ms y destapa en 560.
- **La página nueva se monta tapada y se destapa apenas tiene su primer cuadro estable:** montada, con su scroll en su lugar y dos cuadros pintados (a lo sumo a los 3,5 s, de emergencia). Lo que tu página arme al montarse (la variante, su título) entra en esa espera: hacelo liviano.
  - **Lo pesado que no se ve, después:** una obra cara que no hace falta para el primer cuadro espera al velo quieto con `esperaAlVelo` o `cuandoElVeloQuede` (el home lo hace con la frase del CTA del final, las piezas del pie y el ocio de los títulos). Lo que está a la vista se arma tapado.
  - Al cambiar de ruta se reponen la noche, el día del final, el avance de la intro y el scroll (arriba, o el ancla).
- **La flecha del navegador** también pasa por el velo: lo corta (cubre de una) y destapa igual.
  - **Hacia el home, devuelve la posición de ESA entrada del historial** (el scroll, la noche y el día del final): con dos entradas del home, cada una vuelve a la suya. No hace falta nada de la página.
  - **Del bfcache (P-H35):** una página que vuelve con `pageshow` `persisted` repone la variante a su avance y deja el velo quieto.
- Los CTA que abren el contacto siguen siendo `data-abre-contacto="panel"` con su `data-precarga`, sin cambios.

**El viaje (B12b, 2026-10-22): del CTA de un servicio del home a su página.**

```ts
// _lib/veloDeNavegacion.ts
export type ViajeDelVelo = () => Promise<'escena' | 'banda'>       // cubre con la escena; 'banda' si no pudo (el velo cubre como siempre)
export interface PedidoDelVelo { readonly cubierto: () => void; readonly viaje: ViajeDelVelo | null }
export function pedirElViaje(v: ViajeDelVelo): void                 // para el PRÓXIMO cubrirConElVelo, en el mismo clic (se olvida al terminar la tarea)
export const hayVelo: () => boolean

// esc/ruta/viajeDelServicio.ts — puro: el reloj del viaje (lo leen el rig, la luz de la intro y la atadura)
export const TIEMPOS_DEL_VIAJE, POSE_DE_PARTIDA, SONIDOS_DEL_VIAJE
export function camaraDelViaje(ahora: number): number    // 0 la partida → 1 la composición; fuera de un viaje, 1
export function nocheDelViaje(ahora: number): number     // 0 → 1; fuera de un viaje, 1 (la noche del preset, exacta)

// _componentes/navegacion/viajeAlServicio.ts — el DOM del viaje
export function pedirElViajeAlServicio(e: MouseEvent<HTMLAnchorElement>, destino: PresetDeLaEscena): void   // el onClick del CTA
```

- **Quién lo usa:** sólo el CTA de cada servicio de la sección Servicios del home (`EnlaceDelServicio`: los paneles, las pantallas sueltas y el
  recomendador), con `onClick={(e) => pedirElViajeAlServicio(e, PRESET_DEL_DESTINO[id])}`. `EnlaceDeRuta` corre el `onClick` antes de cubrir:
  el pedido viaja con su `cubrirConElVelo()`. Cualquier otra navegación sigue con la banda.
- **Qué hace:** apila en el home el preset de la página de destino (la escena se entera de adónde va; la ranura monta la variante tapada),
  despierta la escena detrás del papel (con la cámara en `POSE_DE_PARTIDA`, de día) y, cuando dibujó con la variante del destino: suena la
  salida, el papel (lo que se ve del `<main>` del home) se levanta, los nanobots se apagan, anochece y la cámara baja a la composición
  inicial de la página (con el logo en su hueco: `HuecoDelViaje` lo mide en el home con el mismo marco de la intro). Llegada la cámara, el
  velo navega (sin banda: `data-modo="viaje"`); la página nueva entra transparente y con su scroll (`_chrome/velo/paginaTapada.ts`) y, con
  su primer cuadro estable, aparece encima de la escena con el sonido de la llegada.
- **Cuándo no:** con menos movimiento, sin la escena, fuera del home, con `?viaje=velo`, o si la escena no dibujó en 1,5 s: la banda.
- **Para una página de servicio:** su preset en un módulo sin JSX, el mismo objeto en la página y en `PRESET_DEL_DESTINO` (P-S). Su variante
  dibuja en la composición desde el avance 0 (T0): el viaje la monta tapada y la muestra al levantar el papel.

## 6. Las historias (P-H31, 2026-10-20)

El componente común de `_componentes/historias/` (P-H19) lo usan el Portfolio en el teléfono y el precio de servicios. P-H31 le suma dos props y el freno del arrastre. El Portfolio no pasa ninguna de las dos props y su marcado es el de antes (s76 §43).

```tsx
// _componentes/historias/Historias.tsx
export interface PropsDeLasHistorias<T extends ItemDeHistoria> {
  // … las de P-H19, sin cambios (items, renderItem, alSalir, etiqueta, rotulos, duracionMs, alCambiar, arribaDeLasBarras, className)
  /** a · Una transición propia entre pasos. Sin ella, el corte de siempre (el Portfolio). */
  readonly transicion?: TransicionDeLasHistorias
  /** c · El color de las barras sobre un fondo propio: sobre un acento, BARRAS_SOBRE_ACENTO. Sin él, las de la tinta. */
  readonly colorDeLasBarras?: ColorDeLasBarras
}

export interface TransicionDeLasHistorias {
  readonly ms: number
  readonly Envoltorio: ComponentType<{ readonly avance: MotionValue<number>; readonly sentido: 1 | -1; readonly children: ReactNode }>
}

export interface ColorDeLasBarras {
  readonly pista: string    // un color de CSS: lo que falta
  readonly relleno: string  // lo que pasó y el avance de ahora
}

export const BARRAS_SOBRE_ACENTO: ColorDeLasBarras   // el papel; la pista, el papel al 25 %
```

- **a · La transición.**
  - **Durante `ms`, el paso que entra se pinta ENCIMA del que se va,** envuelto en `Envoltorio`. El que se va sigue montado debajo, en pausa, hasta que termina.
  - **`avance`** va de 0 a 1, lineal, en un valor de Motion: sin renders por cuadro. La curva la pone el `Envoltorio`.
  - **`sentido`:** 1 hacia adelante, −1 hacia atrás.
  - **En reposo el ítem sigue envuelto, con `avance` en 1,** para no volver a montarse al terminar: en 1 el `Envoltorio` no tiene que hacer nada (el recorte, `none`).
  - **Con movimiento reducido, el corte.**
- **b · El freno del arrastre.** Mientras las historias están montadas y presentes (`useIsPresent`), el dedo no mueve la página, ni arrastrando desde afuera de su caja. Adentro de un diálogo (`data-lenis-prevent`: el menú, el contacto) no frena.
  - Lo tiene cualquier uso: **montalas sólo mientras corren**, como el Portfolio, que las monta con su panel. Montadas en reposo, la página no scrollea con el dedo.
- **c · Las barras sobre un acento (WCAG 1.4.11).** Con `BARRAS_SOBRE_ACENTO` sobre `bg-acento`, en el peor de los tres acentos del tema:
  - el relleno da 6,02:1 contra el acento y 3,57:1 contra la pista (las de la tinta daban 2,41:1);
  - medido en el sitio sobre el de web: 6,65:1 y 3,81:1.
- **Un ejemplo que anda:** `componentes/_bloques/GaleriaHistorias.tsx`, en `/v3/componentes`. Son tres pasos sobre el acento de web, con un corte diagonal de prueba (`_componentes/historias/corteDiagonal.tsx`, `CORTE_DIAGONAL_DE_PRUEBA`: hacia adelante destapa desde abajo a la derecha, hacia atrás desde arriba a la izquierda).

## 7. Cómo armar una página, paso a paso (B12a.8)

La maqueta que anda es `/v3/pagina-base` (`pagina-base/`): copiala y cambiá los datos. Todo lo de abajo está en ella.

**Qué es del home y qué es de la página:**

| Del home (no se toca, viene solo) | De la página (lo pone ella) |
|---|---|
| La escena, la cámara y su pista (`PISTA_DE_LA_INTRO`, pose 2) | El preset (`PresetDeLaEscena`): su id, su acento, su variante |
| El título 3D, su llegada y su caída, el halo de contraste | El texto del título (de `TITULOS_CON_LETRAS`) y sus partes |
| La navbar, el menú, el contacto, el sonido (los monta el layout) | La bajada y «de qué se trata» (texto, detrás de la llave si es relleno) |
| El velo, la vuelta al home, la precarga | El cuerpo en papel: sus secciones con las piezas de `_secciones/_contrato/` |
| La composición (`?composicion=`), el alto de la intro | Su variante de escena (en `_servicios/escena/`, una línea en el registro) |

**El código mínimo** (un servidor, sin `'use client'`):

```tsx
// src/app/v3/<ruta>/page.tsx
const PRESET: PresetDeLaEscena = { id: '<id>', tramos: { intro: SELECTOR_DE_LA_INTRO, pie: SELECTOR_DEL_CIERRE }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: '<id>', variante: '<id del registro>' }

export default function Pagina(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <IntroDeLaPagina titulo="<nombre>" preset={PRESET} bajada={<ParrafoDeLaBajada>…</ParrafoDeLaBajada>} deQueSeTrata={<>…</>} />
      <CuerpoDeLaPagina />   {/* 'use client', adentro de <CompuertaDelHome> */}
      <CierreDeLaPagina preset={PRESET} />   {/* [B13] §8: Seis razones → el CTA → la resolución → el pie */}
    </main>
  )
}
```

**Paso a paso:**
1. **El preset**, constante del módulo (el mismo objeto en cada render). `noche: 'noche'`: el título y la bajada van en claro sobre la escena.
2. **La intro:** `IntroDeLaPagina` con el título, la bajada y «de qué se trata». No le pongas alto ni color: los pone ella (`PANTALLAS_DE_LA_INTRO`).
3. **El cuerpo:** un componente `'use client'` envuelto en `CompuertaDelHome`. Cada sección `bg-fondo text-tinta` (papel opaco: la escena duerme debajo). Los revelados son los del contrato: progresivo (`Bloque` + canal) o gatillo (`Gatillo`), elegidos a propósito.
4. **Los CTA:** el contacto con `data-abre-contacto="panel"` y `data-precarga="<id>"`. Otra página de `/v3` con `EnlaceDeRuta`, nunca `<a>`, `<Link>` suelto ni `router.push`.
5. **La variante** (si tiene): un módulo `'use client'` con `export default`, en `_servicios/escena/`, y su línea en `_variantes/registro.ts` (§4).
6. **El título nuevo:** si el nombre no está en `TITULOS_CON_LETRAS`, pedilo como P-H (hay que regenerar las fuentes).
7. **El cierre** [B13]: `<CierreDeLaPagina preset={PRESET} />` al final del `<main>`, después del cuerpo, y `tramos.pie: SELECTOR_DEL_CIERRE` en el preset (§8). La página no le pone nada: es del home.

**Las reglas:**
- **`'use client'` sólo donde hay interactividad:** la página y la intro son de servidor; el cuerpo animado y la variante, de cliente.
- **La salida de la variante:** `EnlaceDeRuta` la pide sola (`pedirLaSalidaDeLaVariante`). Si navegás por otro camino imperativo, pedila vos y esperá la promesa antes de navegar.
- **Los altos:** la intro mide lo suyo; no le cambies el alto ni pongas nada entre la intro y el cuerpo. El papel empieza donde la intro termina.
- **Los colores:** sólo tokens (`bg-fondo`, `text-tinta`, `bg-acento`…), con el acento de la página por `data-servicio`. En la escena el acento es luz, nunca superficie.
- **La memoria:** lo que la variante cree con `new THREE.*` lo libera ella; diez idas y vueltas tienen que dejar `renderer.info.memory` igual (§4).
- **Nada de contenido inventado:** los textos que faltan van detrás de la llave (`registrarInventos`), como `pagina-base/relleno.ts`.

**Lista para cerrar una página:**
- [ ] El preset es una constante; su `id` está en `IdDePagina` y su variante en el registro.
- [ ] El título está en `TITULOS_CON_LETRAS` (s78 lo exige).
- [ ] La intro sin alto ni color propios; el cuerpo en papel adentro de `CompuertaDelHome`.
- [ ] Cada enlace a `/v3` es `EnlaceDeRuta`; cada CTA de contacto, `data-abre-contacto` con su `data-precarga`.
- [ ] El texto de la intro llega a AA sobre la escena en las tres composiciones (`scripts-carga/contraste-de-la-intro.ts`).
- [ ] La ida y la vuelta con el velo sin cuadros en blanco (`scripts-carga/velo.ts`, en el build).
- [ ] La variante cuesta ≤ 0,5 ms por cuadro y no pierde memoria (`scripts-carga/ranura.ts`).
- [ ] A 390 y a 768: la intro, el cuerpo y el menú (el teléfono es otra experiencia).
- [ ] [B13] El cierre montado (`tramos.pie`), su CTA con el `data-precarga` de la página y la variante resuelta antes del pie (`scripts-carga/cierre-de-pagina.ts`).

---

## 8. El cierre de una página (B13, 2026-10-22)

```tsx
// _componentes/pagina/cierre/CierreDeLaPagina.tsx — 'use client'; la página lo monta al final de su <main>, después del cuerpo
export function CierreDeLaPagina(props: { readonly preset: PresetDeLaEscena; readonly preguntas?: readonly PreguntaFrecuente[] }): React.JSX.Element

// [B10] _componentes/faq/preguntas.ts — el FAQ después del pie (lo monta el cierre; en el home, su pie)
export interface PreguntaFrecuente { readonly pregunta: string; readonly respuesta: string }   // 6 por página (MAXIMO_DE_PREGUNTAS)

// esc/ruta/atributoDelCierre.ts — sólo cadenas (lo importa el preset de una página de servidor)
export const SELECTOR_DEL_CIERRE = '[data-cierre-de-pagina]'                  // lo que va en tramos.pie
export const PARTES_DEL_CIERRE = { seisRazones, resolucion, pie } as const     // sus tres partes (data-parte)

// esc/ruta/cierreDeLaPagina.ts — puro: la pantalla del cierre, su pista y la resolución
export const RESOLUCION_DEL_CIERRE: { current: number }   // la que la ranura le pasa a la variante (PropsDeLaVariante.resolucion)
export function pantallaDelCierre(seis: CajaVertical, scrollY: number, alto: number): number
export function resolucionDelCierre(pantalla: number): number
export const enUnaPagina: () => boolean                  // ahí el final del home no corre
```

**Qué es:** la pieza común del home que cualquier página monta. Un bloque con tres partes, en orden:
1. **Seis razones** (`SeisRazonesDelCierre`): las mismas seis de develOP con la misma entrada que en el home. **Desde 1024 y con
   movimiento, el escenario del home**: 7 pantallas con el escenario clavado; la frase llega (la pose A), los valores entran de a pares (B),
   se levantan y la frase **se da vuelta y se vuelve el CTA** (la transformación de B3, C). Sin el aro de las reseñas (el origen del
   cartel es la frase). Las ventanas, la geometría y las piezas son las del home. **Abajo de 1024 o con menos movimiento, el modo plano**:
   la lista (la frase, los valores y el CTA que la escena desliza en su bloque clavado), como el home a ese ancho.
2. **La resolución:** una pantalla de la sala sola. La escena le pasa a la variante la señal del tramo del pie (`resolucion`, 0 → 1: §4) y
   la cámara va a la pose del pie (E, el logo en el centro). Con la de ejemplo de la base, el anillo se apaga y la luz vuelve a la
   composición: el piso queda liso y calmo.
3. **El pie** (`PieDelCierre`): el del home (el titular, el mail y WhatsApp, el formulario de contacto, las redes, la línea legal), plano
   en todo ancho; llega mientras su pantalla entra, con el piso ya calmo. El recorrido va a las secciones del home (`/v3#…`, con el velo).
4. **[B10] El FAQ, después del pie** (`FaqDelPie`, `_componentes/faq/`), con las preguntas de la página (`preguntas`; sin preguntas, no
   hay FAQ). **Desde 1024 y con movimiento**, en la pantalla del pie, con gatillo: seguir scrolleando al fondo hunde las columnas del pie
   (el efecto del formulario del pie) y de esos lugares nacen dos bloques de vidrio: el título y las preguntas a la izquierda; a la derecha
   «Tocá una pregunta y mirá lo que pasa.», que se hunde cuando tocás una y sube la respuesta en su lugar (con la primera, abajo, «¿Te
   quedaron dudas? Escribinos», a WhatsApp con el número del repo). Subir lo saca y vuelve el pie. **Abajo de 1024 o con menos
   movimiento**, una lista normal después del pie, sin efectos y sin WhatsApp. El texto entero va en el HTML y en los datos estructurados
   (`FAQPage`); las preguntas son botones (Tab y las flechas).

**El CTA abre el contacto con el servicio de la página:** `data-precarga` es el acento del preset (sin acento, sin precarga).

**La escena es la de la página:** su preset (la noche y el acento) y su variante. Sobre el bloque, la escena hace el final del home: la
pantalla del cierre (`pantallaDelCierre`) es la del pin del home (en el escenario, una por pantalla de scroll; en la lista, su recorrido
repartido en las mismas seis; después, la resolución de 6 a 7 y el pie de 7 a 8) y la cámara sigue `PISTA_DEL_CIERRE` (las poses del final
del home con sus curvas, con el ángulo en 0), que manda desde media pantalla antes de que el cierre asome. De noche, el texto del cierre va
en los claros (la sección invertida, sin la mezcla del home) y lo que dibuja la escena, en papel: la frase en volumen (`MaterialDeLosTitulos`)
y el CTA (`ctaDeNoche`).

**Para una página de servicio (P-S):**
- `tramos.pie: SELECTOR_DEL_CIERRE` (importado de `esc/ruta/atributoDelCierre.ts`: desde un componente de cliente, una página de servidor
  recibiría una referencia y no la cadena) y `<CierreDeLaPagina preset={PRESET} />` al final del `<main>`. Reemplaza su cierre provisorio.
- **[B10] Sus preguntas frecuentes** en su carpeta (como `pagina-base/faq.ts`: 6, sin cifras inventadas) y
  `<CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS} />`. El FAQ que hoy está en el cuerpo de una página de servicio pasa acá (y sale
  del cuerpo): un solo FAQ por página, después del pie.
- **Su variante implementa la resolución** (§4): lo que movió vuelve a su reposo y su luz a la composición cuando `resolucion` llega a 1.
- No le pongas alto, color ni fondo al cierre, ni nada entre el cierre y el fin del `<main>`.

**Cómo se mide** (`scripts-carga/cierre-de-pagina.ts`, en el navegador, a 1440 y 390): el relevo de la pista, la transformación armada en
la pose C, el CTA con su precarga (un clic abre el contacto), la resolución en 1 antes de que el pie asome (la luz de abajo prestada en la
de la composición) y el pie llegado al fondo con el final del home quieto; `CONTROL=sin-resolucion` (la variante recibe siempre 0) tiene
que fallar. Sin navegador, s78-b13. [B10] El FAQ: `scripts-carga/faq-del-pie.ts` (`CONTROL=sin-hundimiento` tiene que fallar la entrada);
sin navegador, s78-b10.

**[C2-71] En el home (desde 1025, con el pie de volumen armado)** el FAQ es de volumen: sus bloques son placas de la escena como la del
formulario del pie (`escena/pie3d/faqDeVolumen.ts`; el DOM de cada bloque, anotado con `useBloqueDelFaq`, queda sobre su cara), el pie se
guarda por columnas (cada columna con su base: abrir, hundir tal como es, cerrar; `HUNDIMIENTO_EN_COLUMNAS` en `pie3d/salidas.ts`) y
abajo sale el botón «Scrolleá una vez más…» (`BotonDelFaq`, una vez por carga). **En una página no cambia nada**: el pie es plano y el FAQ
sigue con los bloques de vidrio de B10, sin botón. Sin navegador, s78-c2-71; en el navegador, el mismo banco (sus controles nuevos, en
`docs/rediseno/SPRINT-C2-71.md`).

## 9. Piezas compartidas de la cola 2 (C2 · 20, 2026-10-23)

Cuatro piezas para todo /v3; se importan, no se copian. Se ven juntas en `/v3/piezas` (instrumento, `noindex`): cada una sobre el papel y
en una sección invertida. Las reglas viven en `_estilos/piezas.css` (entra por el layout). Los colores salen de la sección (la tinta y el
fondo del contexto), así que andan igual sobre el papel y en una sección `data-seccion="invertida"`. Sin navegador: `npm run test:s85-piezas`.

**`EstadoDeEnvio`** — `src/app/v3/_componentes/formularios/EstadoDeEnvio.tsx` (lo puro y los textos: `_lib/formularios/estadoDeEnvio.ts`).
El estándar de envío de los formularios (no el del pie). Envuelve al formulario y recibe el estado; el formulario nunca se desmonta.

```tsx
import { EstadoDeEnvio } from '../../_componentes/formularios/EstadoDeEnvio'
import { MENSAJES_DEL_ENVIO, type EstadoDelEnvio } from '../../_lib/formularios/estadoDeEnvio'

const [estado, setEstado] = useState<EstadoDelEnvio>('reposo') // 'reposo' | 'enviando' | 'exito' | 'error'
// al enviar: setEstado('enviando'); con la respuesta: setEstado('exito') o setEstado('error')
const alVolver = (despuesDe: 'exito' | 'error') => { if (despuesDe === 'exito') vaciar(); setEstado('reposo') }
<EstadoDeEnvio estado={estado} alVolver={alVolver} mensajes={MENSAJES_DEL_ENVIO.newsletter} compacto>
  <form onSubmit={alEnviar}>…</form>
</EstadoDeEnvio>
```

- Props: `estado` (obligatorio), `alVolver(despuesDe)` (obligatorio: el mensaje terminó; volvé a `reposo` y, si `despuesDe` es `'exito'`,
  vaciá el formulario: todavía no se ve), `mensajes` (por defecto
  `MENSAJES_DEL_ENVIO.contacto`; también `.newsletter`), `etiquetaDeCarga` (por defecto «Enviando…»), `textosDeCarga` (líneas que se suceden
  debajo de la carga), `compacto` (formularios chicos), `className`.
- Qué hace: enviando → el formulario se desvanece y aparece la carga de develOP (`Carga`) ya girando, por lo menos 600 ms; éxito o error → el
  encastre del logo (`EncajeDelLogo`, con su sonido) y el mensaje; a los 3 s de que aterrizó, `alVolver`. Después del éxito, el formulario
  vuelve vacío (lo vacía quien lo monta, en `alVolver`); después del error, con lo escrito. Una respuesta `invalido` (errores de campos) se resuelve con
  `setEstado('reposo')` y los errores en el formato de siempre (`ErrorDelCampo`).
- Banco: `scripts-carga/estado-de-envio.ts` (`CONTROL=sin-carga`, `CONTROL=sin-datos`).

**`AvisoDeScroll`** — `src/app/v3/_componentes/avisos/AvisoDeScroll.tsx`.

```tsx
import { AvisoDeScroll } from '../../_componentes/avisos/AvisoDeScroll'

<AvisoDeScroll texto="Scrolleá para explorarlo" />
<AvisoDeScroll texto="Scrolleá una vez más para ver las preguntas frecuentes" tono="escena" alTocar={unGestoDeScroll} />
```

- Props: `texto` (de `05-TEXTOS.md`), `tono` (`'papel'` por defecto | `'escena'`: con la sombra pegada del texto de la intro), `alTocar`
  (si está, es un `<button>`; si no, decorativo con `aria-hidden`), `className`. Centrado con `mx-auto`; quien lo monta lo ubica debajo
  del contenido. Titila con la opacidad (1,6 s); quieto con movimiento reducido o fuera de la pantalla.

**`Reluciente`** — `src/app/v3/_componentes/efectos/Reluciente.tsx` (y `RELUCIENTE`, el ritmo, para un brillo en la escena 3D).

```tsx
import { Reluciente } from '../../_componentes/efectos/Reluciente'

<button className="relative overflow-hidden rounded-full …">Probar ahora<Reluciente /></button>  // en una caja
<Reluciente como="texto">HABLANOS</Reluciente>                                                   // en un texto
```

- Props: `como` (`'caja'` por defecto: una capa encima, que necesita una caja con `relative` y `overflow-hidden`, y hereda su redondeo |
  `'texto'`: el reflejo pasa por adentro de las letras), `children` (sólo en `texto`), `className`. Una pasada cada 3,5 s; con el mouse o
  el foco encima (de la caja, o del `a`/`button` que contiene al texto), una en el acto y cada 1,4 s. El reflejo es blanco: se ve sobre
  letras y rellenos oscuros. Sin barrido con movimiento reducido.

**El autocompletado** — global: `piezas.css` le aplica a TODO `input`, `textarea` y `select` de /v3 el arreglo del pie (el fondo y la tinta
de cada formulario se quedan cuando el navegador autocompleta). No hay que importar nada: un formulario nuevo lo toma solo. Los campos del
pie (`data-foco="campo"`) siguen con el suyo. Banco: `scripts-carga/autocompletado.ts` (`CONTROL=sin-arreglo`).

## Qué P-H29 resolvió cada cosa

| P-H29 | Qué pidió servicios | Dónde está |
|---|---|---|
| a | La luz de abajo encendible en la intro, con un dueño por tramo | `PropsDeLaVariante.luzDeAbajo`; la ranura, dueña en la intro (§4) |
| b | Un uniforme de color para esa luz | `uColorDeLaLuz` en `esc/final/enElPiso.ts` y `esc/final/planoDeLaLuz.ts` (blanco de base) |
| c | `uLuzNoche` expuesto | `PropsDeLaVariante.energia` (`esc/energia/energiaDeLaRuta.ts`, prestado por `PlasmaYCargas`) |
| d | Una señal de salida | `saliendo`, `SALIDA_DE_LA_VARIANTE_MS` y `pedirLaSalidaDeLaVariante` |
| e | El preset con un id y la ranura que carga del registro | `PresetDeLaEscena.variante: IdDeVariante`, `_variantes/registro.ts` |
| f | La luz de la composición compartida, del home | `COMPOSICION_DE_LA_LUZ` |
| g | La pista de la intro compartida, exportada | `PISTA_DE_LA_INTRO` y `POSE_DE_LA_INTRO` |

## El orden de B12a (reordenado por P-H28)

Servicios necesita primero la ranura, la intro, el título y la navegación. La ranura, que en el plan era la última, pasa a la tercera: sólo depende del preset (B12a.1).

| # | Qué | En el plan |
|---|---|---|
| B12a.1 | el preset y la escena consciente de la ruta | hecho (`fcd57f53`) |
| B12a.2 | la intro y la composición inicial | hecho (`edd64c7c`; la pose 2, `e2da3dfc`) |
| **B12a.3** | **la ranura de variantes**, con su variante de prueba y P-H29; build de D7 al cerrarla | hecho (`627db1be`); era B12a.7 |
| B12a.4 | el título 3D y el `h1`; FRENO: la familia (`?titulo=`) | hecho (`4a74e290`); era B12a.3 |
| B12a.5 | la navbar en el layout y el desplegable | hecho (`c99aaa7e`); era B12a.4 |
| B12a.6 | la navegación cliente y el velo (pide la salida de la variante) | hecho (`f4b37280`); era B12a.5 |
| B12a.7 | la vuelta al home; el build de D7 | hecho (`7cb477d6`); era B12a.6 |
| B12a.8 | la maqueta base: la intro larga y su composición, el título en volumen protagonista, la navbar, el velo sin pantalla en blanco, la vuelta por entrada, la página base y el paso a paso (§7) | hecho (este FRENO); pedido directo, fuera del plan |
