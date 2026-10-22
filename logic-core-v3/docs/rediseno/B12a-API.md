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
  - `{ id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante: '<su id del registro>' }`.
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
- **La referencia** es `esc/ruta/VarianteDePrueba.tsx`, la de `/v3/pagina-base`: un anillo de luz en el piso, la luz de abajo de 0,12 a 1 en la primera mitad del avance y teñida, la energía teñida, y la salida con 1 − (1 − t)³.

**Lo que una variante puede hacer:**
- Agregar objetos a la escena y animarlos con `useFrame`, sin prioridad: el render lo sigue haciendo la escena.
- Leer `avance`, `acento`, `calidad`, `reducido` y `saliendo`.
- Encender y teñir la luz de abajo con `luzDeAbajo`, y teñir la energía con `energia`, en su `useFrame`, cada cuadro. Sin llamarlas queda la luz de la composición.

**Lo que no puede hacer:**
- Mover la cámara, la luz de la sala, el progreso del rig ni el avance.
- Escribir los almacenes directo (`LUZ_DE_ABAJO_EN_VIVO`, `ENERGIA_DE_LA_RUTA`): sólo a través de las dos funciones.
- Tocar `_lib/**`, salvo importar los tipos y números de `esc/ruta/variante.ts`.
- Usar un `EffectComposer`: el canvas es transparente (lección del repo).

**Un dueño por tramo (P-H29a):**
- **En la intro** la luz de abajo y el color de la energía son de la ranura, y con ella de la variante: mientras el avance es menor que 1, o mientras la variante sale.
- **Fuera de la intro** son del final, el pie de B13.
- **En el home** (sin pista) la ranura no toca nada.
- La ranura escribe después del final del pie (está montada después de él), así que en la intro manda la suya.

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
const PRESET: PresetDeLaEscena = { id: '<id>', tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: '<id>', variante: '<id del registro>' }

export default function Pagina(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <IntroDeLaPagina titulo="<nombre>" preset={PRESET} bajada={<ParrafoDeLaBajada>…</ParrafoDeLaBajada>} deQueSeTrata={<>…</>} />
      <CuerpoDeLaPagina />   {/* 'use client', adentro de <CompuertaDelHome> */}
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
7. **El pie:** el lugar de `data-pie-de-pagina` hasta B13.

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

---

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
