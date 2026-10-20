# B12a — la API para las páginas (firmas definitivas)

**Para qué:** servicios trabaja contra este archivo. Son las firmas con las que una página se enchufa a la escena del home: el preset de ruta, la intro, el preset del título y la ranura de variantes.
- El plan y el log de B12a están en `docs/rediseno/SPRINT-B12a.md`.
- Las rutas son desde `src/app/v3/`; `esc/` es `_lib/escena/`.

**La regla:** estas firmas no cambian sin aviso. Si servicios necesita otra cosa, se pide como P-H y el cambio se anota acá con su fecha. Lo que todavía no existe en el código tiene la firma fijada igual, y dice en qué subsprint llega.

**Estado** (2026-10-20, después de `627db1be`):

| Pieza | Estado |
|---|---|
| El preset de ruta | hecho (B12a.1, B12a.2 y B12a.3); `variante` es un id del registro (P-H29e) |
| La intro | hecha (B12a.2 y B12a.3): la pista compartida con la pose 2 (P-H29g), `SELECTOR_DE_LA_INTRO`, el id de la página como valor del atributo y el acento en el bloque; el título 3D, con B12a.4 |
| La ranura de variantes | hecha (B12a.3), con P-H29 a–f, medida en el build de D7 |
| El preset del título | B12a.4 (la familia, a elegir por Valentino con `?titulo=1\|2\|3`) |
| La navegación entre páginas | B12a.6: `EnlaceDeRuta`, que pide la salida de la variante antes del velo (§5) |

**Los cambios de firma desde la primera versión (`8926656a`).** Todos son del 2026-10-20 y los pidió servicios como P-H29 (su `SPRINT-V0.md` §4):
- `PresetDeLaEscena.variante` pasa de componente a id (e).
- `PropsDeLaVariante` suma `luzDeAbajo`, `energia` y `saliendo` (a, b, c y d).
- Llegan:
  - `SALIDA_DE_LA_VARIANTE_MS`, `pedirLaSalidaDeLaVariante` y `COMPOSICION_DE_LA_LUZ` (d y f);
  - `PISTA_DE_LA_INTRO` con `POSE_DE_LA_INTRO` (g).

---

## 1. El preset de ruta (D1: lo declara la página)

```ts
// esc/ruta/preset.ts
export type IdDePagina = 'home' | IdDeServicio | 'prueba'      // IdDeServicio: 'web' | 'ia-automatizacion' | 'software' (_secciones/_contrato/acento.ts)

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
export const PANTALLAS_DE_LA_INTRO = 1.5
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

## 2. La intro de la página (P-H13, P-H20)

```tsx
// _componentes/pagina/IntroDeLaPagina.tsx — sin 'use client' (se renderiza en el servidor)
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'   // su valor es preset.id (el IdDeServicio en servicios)
export const SELECTOR_DE_LA_INTRO = '[data-intro-de-pagina]'           // lo que va en tramos.intro

export interface PropsDeLaIntro {
  /** El nombre de la página: el texto del h1 del DOM y el del título 3D, el MISMO (B12a.4). */
  readonly titulo: string
  /** [B12a.4] Las dos partes del título, para las dos variantes de Archivo (D3). Unidas con un espacio dan `titulo`. Sin ellas: la primera palabra y el resto. */
  readonly partes?: readonly [string, string]
  /** La bajada: párrafos (`ParrafoDeLaBajada`), sin heading. */
  readonly bajada: React.ReactNode
  readonly preset: PresetDeLaEscena
}
export function IntroDeLaPagina(props: PropsDeLaIntro): React.JSX.Element
export function ParrafoDeLaBajada(props: { readonly children: React.ReactNode }): React.JSX.Element
```

**Qué hace:**
- **El bloque:** mide `PANTALLAS_DE_LA_INTRO` pantallas y es transparente, así que se ve la sala.
  - Lleva el atributo con el id de la página y es el bloque que mide la escena: el avance de la intro va de 0 (su tope en el tope del cuadro) a 1 (1,5 pantallas después).
  - De noche lleva los claros (la sección invertida). Con acento, lleva `data-servicio="<preset.acento>"`: la regla `[data-servicio]` del tema pone su claro.
- **El `h1`:** está siempre en el DOM, con `titulo`. Desde B12a.4 queda escondido sólo a la vista mientras el título 3D está puesto, y es el visible sin WebGL, con movimiento reducido o abajo de 1024.
- **La bajada:** va fija arriba mientras dura la intro.

**Para servicios:**
- `_servicios/Intro.tsx` deja su atributo (`data-intro-de-servicio`), su alto de una pantalla y la tapa interina: los tres pasan a ser los de `IntroDeLaPagina`.
- Es el P-S chico que anticipaba el plan (D2): el bloque lo pone el home, y servicios pone su contenido adentro.

## 3. El preset del título (P-H14)

```ts
// _componentes/titulos3d/presets.ts — B12a.4
export interface PresetDelTitulo {
  /** D3: dos variantes de Archivo, ninguna la condensada 700 del home: la primera parte con `fuentes[0]` y la segunda con `fuentes[1]`. */
  readonly fuentes: readonly [FuenteDelTitulo, FuenteDelTitulo]
  readonly lectura: Titulo['lectura']
  readonly asiento: 'cercano' | 'lejano'
  /** Se va con una caída, nunca de golpe ni hacia arriba. */
  readonly saleCayendo: true
}
export const TITULO_DE_PAGINA: PresetDelTitulo     // el mismo en todas las páginas; las fuentes, las del combo que elija Valentino

// _componentes/titulos3d/TituloDePagina.tsx — lo renderiza IntroDeLaPagina; una página no lo llama directo
export function TituloDePagina(props: { readonly id: IdDePagina; readonly titulo: string; readonly partes: readonly [string, string] }): React.JSX.Element
```

- **El avance** lo lee el título de `AVANCE_DE_LA_INTRO`: no hay prop, así no se re-renderiza por cuadro.
- **Las letras:** las de los tres nombres se generan en los JSON de `_fuentes/`, y el invariante de cobertura las exige todas. Un nombre nuevo obliga a regenerar.
- **La familia, D3:** 2 o 3 combinaciones detrás de `?titulo=1|2|3`. Valentino elige, la bandera se va, y `TITULO_DE_PAGINA` queda con la elegida. La firma no cambia con la elección.

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
export const SALIDA_DE_LA_VARIANTE_MS = 420                              // [P-H29d] termina antes del velo (760 ms)
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
- **La referencia** es `esc/ruta/VarianteDePrueba.tsx`, la de `/v3/prueba-de-pagina`: un anillo de luz en el piso, la luz de abajo de 0,12 a 1 en la primera mitad del avance y teñida, la energía teñida, y la salida con 1 − (1 − t)³.

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
  - se resuelve, y recién entonces se navega.
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

## 5. La navegación entre páginas (B12a.6)

```tsx
// _componentes/navegacion/EnlaceDeRuta.tsx — el <Link> de next con el velo; nunca router.push ni TransitionContext
export function EnlaceDeRuta(props: { readonly href: string; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element
```

- Un enlace de una página a otra de `/v3` va con `EnlaceDeRuta`, no con `<a>` ni con `<Link>` suelto: el velo y la vuelta a la composición inicial cuelgan de él.
- **Antes del velo pide `pedirLaSalidaDeLaVariante()` y no navega hasta que se resuelva** (§4). Hasta B12a.6, la página de prueba lo hace con un enlace interino (`prueba-de-pagina/EnlaceConLaSalida.tsx`).
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
- **Un ejemplo que anda:** `componentes/_bloques/GaleriaHistorias.tsx`, en `/v3/componentes`. Son tres pasos sobre el acento de web, con un corte diagonal de prueba (`componentes/_bloques/corteDiagonal.ts`: hacia adelante destapa desde abajo a la derecha, hacia atrás desde arriba a la izquierda).

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
| B12a.4 | el título 3D y el `h1`; FRENO: la familia (`?titulo=`) | era B12a.3 |
| B12a.5 | la navbar en el layout y el desplegable | era B12a.4 |
| B12a.6 | la navegación cliente y el velo (pide la salida de la variante); build de D7 al cerrarla | era B12a.5 |
| B12a.7 | la vuelta al home | era B12a.6 |
