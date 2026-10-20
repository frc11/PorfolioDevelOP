# B12a — la API para las páginas (firmas definitivas)

**Para qué:** servicios trabaja contra este archivo. Son las firmas con las que una página se enchufa a la escena del home: el preset de ruta, la intro, el preset del título y la ranura de variantes.
- El plan y el log de B12a están en `docs/rediseno/SPRINT-B12a.md`.
- Las rutas son desde `src/app/v3/`; `esc/` es `_lib/escena/`.

**La regla:** estas firmas no cambian sin aviso. Si servicios necesita otra cosa, se pide como P-H y el cambio se anota acá con su fecha. Lo que todavía no existe en el código tiene la firma fijada igual, y dice en qué subsprint llega.

**Estado** (2026-10-19, después de `edd64c7c`):

| Pieza | Estado |
|---|---|
| El preset de ruta | hecho (B12a.1 y B12a.2); suma `variante` con la ranura |
| La intro | hecha (B12a.2); con B12a.3 llegan `SELECTOR_DE_LA_INTRO`, el id de la página como valor del atributo y el acento en el bloque; el título 3D, con B12a.4 |
| La ranura de variantes | B12a.3 |
| El preset del título | B12a.4 (la familia, a elegir por Valentino con `?titulo=1\|2\|3`) |

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
  /** El servicio dueño del acento: el claro sale del token por el id (`--color-acento-claro`), nunca un hex. */
  readonly acento: IdDeServicio | null
  /** [B12a.3] La variante de escena de la página (§4), o `null`. */
  readonly variante: ComponenteDeVariante | null
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
export const PISTA_DE_LA_INTRO: readonly ChoreoKeyframe[]   // llega cuando Valentino elija la pose; hasta entonces, keyframesDeLaIntro(v) con ?intro=1|2|3
export const AVANCE_DE_LA_INTRO: { current: number }  // 0 → 1; lo escribe la lectura del scroll, lo leen el rig y la variante
```

**Cómo lo usa una página de servicio:**
- Arma su preset como constante del módulo, una por servicio. Debe ser el mismo objeto en cada render: la escena arma la pista una vez por preset.
  - `{ id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante }`.
- Se lo pasa a `IntroDeLaPagina` (§2), que lo declara. Una página sin intro monta `<PresetDeLaPagina>` sola.
- **La variante tiene que estar exportada de un módulo `'use client'`.** Así es una referencia de cliente, y el preset puede cruzar de la página de servidor a `PresetDeLaPagina` (React Flight serializa las referencias de cliente; cualquier otra función, no).
- `_lib/` nunca importa nada de `_servicios/`: la variante entra por el preset.

## 2. La intro de la página (P-H13, P-H20)

```tsx
// _componentes/pagina/IntroDeLaPagina.tsx — sin 'use client' (se renderiza en el servidor)
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'   // su valor es el id de la página (el IdDeServicio en servicios)
export const SELECTOR_DE_LA_INTRO = '[data-intro-de-pagina]'                        // B12a.3

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
  - De noche lleva los claros (la sección invertida) y el acento del preset (`[data-servicio]`).
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

## 4. La ranura de variantes (B12a.3)

```ts
// esc/ruta/variante.ts — sólo tipos y el presupuesto (lo importa servicios)
export interface PropsDeLaVariante {
  /** El avance de la intro, 0 → 1. Se lee en el useFrame (`avance.current`): la variante no se re-renderiza por cuadro. */
  readonly avance: Readonly<{ current: number }>
  /** El claro del acento de la página, leído del token una vez por montaje. */
  readonly acento: THREE.Color
  /** 'plena' o 'compacta' (abajo de 1024, o con la GPU chica): esc/calidad.ts. */
  readonly calidad: NivelDeCalidad
  /** Movimiento reducido: el estado final, quieto. */
  readonly reducido: boolean
}
export type ComponenteDeVariante = React.ComponentType<PropsDeLaVariante>
export const PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0.5 } as const

// esc/ruta/RanuraDeLaVariante.tsx — adentro del <Canvas>; monta preset.variante y la desmonta al salir de la página
export function RanuraDeLaVariante(): React.JSX.Element | null
```

**Lo que una variante puede hacer:**
- Agregar objetos a la escena y animarlos con `useFrame`, sin prioridad: el render lo sigue haciendo la escena.
- Leer `avance`, `acento`, `calidad` y `reducido`.

**Lo que no puede hacer:**
- Mover la cámara, la luz, el progreso del rig ni el avance.
- Tocar `_lib/**`, salvo importar los tipos de `esc/ruta/variante.ts`.
- Usar un `EffectComposer`: el canvas es transparente (lección del repo).

**Lo que cuesta, y cómo se mide:**
- ≤ `PRESUPUESTO_DE_LA_VARIANTE.cpuMsPorCuadro` de CPU por cuadro, medido con el banco en el build de producción de D7.
- Al desmontarse libera todo: montar y desmontar 10 veces deja `renderer.info.memory` como estaba.
- Cuando la escena duerme (el papel), la variante no corre: no hay cuadros.

## 5. La navegación entre páginas (B12a.6)

```tsx
// _componentes/navegacion/EnlaceDeRuta.tsx — el <Link> de next con el velo; nunca router.push ni TransitionContext
export function EnlaceDeRuta(props: { readonly href: string; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element
```

- Un enlace de una página a otra de `/v3` va con `EnlaceDeRuta`, no con `<a>` ni con `<Link>` suelto: el velo y la vuelta a la composición inicial cuelgan de él.
- Los CTA que abren el contacto siguen siendo `data-abre-contacto="panel"` con su `data-precarga`, sin cambios.

---

## El orden de B12a (reordenado por P-H28)

Servicios necesita primero la ranura, la intro, el título y la navegación. La ranura, que en el plan era la última, pasa a la tercera: sólo depende del preset (B12a.1).

| # | Qué | En el plan |
|---|---|---|
| B12a.1 | el preset y la escena consciente de la ruta | hecho (`fcd57f53`) |
| B12a.2 | la intro y la composición inicial | hecho (`edd64c7c`); FRENO: la pose (`?intro=`) |
| **B12a.3** | **la ranura de variantes**, con su variante de prueba; build de D7 al cerrarla | era B12a.7 |
| B12a.4 | el título 3D y el `h1`; FRENO: la familia (`?titulo=`) | era B12a.3 |
| B12a.5 | la navbar en el layout y el desplegable | era B12a.4 |
| B12a.6 | la navegación cliente y el velo; build de D7 al cerrarla | era B12a.5 |
| B12a.7 | la vuelta al home | era B12a.6 |
