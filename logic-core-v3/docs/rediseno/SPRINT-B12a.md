# SPRINT B12a — la escena por ruta, la navegación y la intro de las páginas

**Fase 0: el PLAN. Sin código de producción.** Rama `rediseno/home`, sobre el sprint P-H. Cola desatendida del 18 de octubre de 2026, TAREA 2. Este archivo es la fuente de verdad del sprint: el plan va arriba y el log se suma abajo cuando arranque.

Las rutas son desde `src/app/v3/`, salvo las que empiezan con `src/`. `esc/` es `_lib/escena/`. «servicios» es la rama `paginas/servicios`: lo de esa rama se cita con su ruta en ella.

## 0. Alcance

**Entra:**
1. La escena consciente de la ruta, con un preset por página: la pista de cámara de la intro, la noche, el acento y la ranura.
2. La composición inicial compartida: la pose de llegada de todas las páginas.
3. El velo para toda navegación.
4. La vuelta al home.
5. La intro de las páginas con el preset del título 3D (P-H13, P-H14, P-H20).
6. El `h1` del DOM igual al título 3D.
7. La navbar del home en todas las páginas, con el desplegable de servicios.
8. La ranura de variantes en el `<Canvas>`.

**No entra:**
- B12b y B12c.
- Las variantes en sí: son del carril de servicios (`_servicios/escena/`).
- El pie genérico (B13).
- El preloader corto de la entrada directa: el CONTRATO dice que se cranea como un elemento propio.
- D8 (pasar `/v3` a la raíz).

## 1. Lectura del código

### 1.1 Dónde vive la escena

- **El `<Canvas>` vive en el LAYOUT de `/v3`.** `layout.tsx:283` abre el `<div data-v3>`. Adentro van `<CompuertaDelScrollSuave/>` (`:309`), `<CompuertaDelDeslizamiento/>` (`:313`), `<EscenarioCompuerta/>` (`:314`) y `{children}` (`:315`).
  - No hay `template.tsx`, así que con navegación cliente **el layout persiste y el lienzo también**.
  - Hoy toda navegación entre rutas es de documento completo: se rehace el layout, el lienzo y Lenis.
- **`EscenarioCompuerta.tsx`:**
  - `:85` carga `EscenaDelHome` con `dynamic(…, { ssr: false })`;
  - `:88` elige la calidad por el ancho (`useAnchoMinimo(CONSULTA_ESCENARIO)`);
  - `:97` hace `<EscenaDelHome key={calidad} calidad={calidad} />`: cruzar 1024 rehace la escena entera.
- **`esc/EscenaDelHome.tsx`:**
  - `:117` crea la pista (`crearPistaDelHome()`);
  - `:124` hace `useEscenaAtadaAlScroll(rig, retenida, reveladoRef)`;
  - `:147` monta `<ProbeStage>`, con `frameloop={frameloopDe(estado)}` en `:168`.
- **`esc/ProbeStage.tsx:178-189`, el lienzo:**
  - `frameloop` y `eventSource` (el documento);
  - `camera={CAMARA_DEL_CANVAS}`, `gl={contextoDe(calidad)}`, `dpr={ajustes.dpr}`: `[1, 1.5]` en plena, `[1, 1]` en compacta.
- **`esc/visibilidad.ts:290`:** `frameloopDe` sólo da `'never'` en la fase `suspendida`.
- **En una subruta sin `[data-panel]`:**
  - `medirLasSeccionesEn` (`esc/extensionDeLasSecciones.ts:152`) devuelve `null`;
  - la lectura del scroll (`esc/ataduraAlScroll.ts:122-136`) sale sin escribir;
  - el progreso queda en 0 y la fase sigue «corriendo»;
  - **la escena dibuja a cuadro completo, quieta, en cualquier subruta.** §2 mide cuánto cuesta.

### 1.2 Lo que la escena lee del DOM del home

Todo esto asume la página del home:
- `[data-panel]`: la extensión de las secciones, `esc/extensionDeLasSecciones.ts:169-170,192` (servicios, tu-panel);
- el día del final: `esc/nocheDisparada.ts`, `DIA_DEL_FINAL` en `:100`;
- el revelado por sección;
- `TRAMO_ESTIRADO`;
- el amanecer (`[data-panel=cierre]`);
- el final del pie, `#cierre`: `esc/final/FinalDelPie.tsx:177,199`;
- los títulos 3D registrados por las secciones (`_lib/titulos3d/registro.ts`);
- el velo de carga, que espera el titular del hero.

En otra página, cada lectura da `null` o conserva su último valor. **Con navegación cliente, ese último valor es el del home**, y ese es el riesgo R1.

### 1.3 La cámara con el scroll

- **Una lectura por cuadro:** `esc/ataduraAlScroll.ts:122` lee el scroll y escribe el progreso con `rig.set('progress', progreso)` (`:136`).
- **La pista:** `esc/pistaDelHome.ts:91` construye la pista con `buildTrack(CHOREO_KEYFRAMES)` (`:96`). `setVariant` tira error (`:116`): **no hay preset por ruta**, ni `usePathname` en `esc/`, ni `next/navigation` en `/v3`.
- **La coreografía:** `esc/choreography.ts` define `CHOREO_SCREENS = 8` (`:178`), `CHOREO_TRAMOS` (`:189`) y `CHOREO_KEYFRAMES` (`:224`).
- **El rig:** `esc/OrbitRig.tsx:287` corre su `useFrame`. Ahí toma la pose con `sampleTrack(track, progresoDeLaCamara(progress), target)` (`:334`) y la luz con `sampleLightArc(progress, arc)` (`:337`), con la noche disparada encima (`:339`).
- **El acoplamiento con el sitio vivo:**
  - `src/lib/scene-framing.ts:1,144` hace `SCENE_ENTRY_POSE = CHOREO_KEYFRAMES[0].pose`: el destino del preloader vivo es la pose del hero de `/v3`;
  - `src/lib/scene-camera.ts:8` importa los tipos de la coreografía.
  - **Mover la pose del hero mueve el intro del sitio vivo.** La pista de las páginas tiene que ser OTRA: `CHOREO_KEYFRAMES` no se toca.

### 1.4 La noche y el velo

- **La noche:**
  - `esc/nocheDisparada.ts:63` define `NOCHE_DISPARADA.cantidad`, que escribe sólo la gota;
  - `:73` define `nivelConLaNocheDisparada`;
  - `:100` define `DIA_DEL_FINAL`.
- **El velo del día y la noche es la banda diagonal de la gota:**
  - en `_secciones/trabajos/gota.ts`: `ANCHO_DE_LA_BANDA = 30` (`:44`), `PLUMA_DE_LA_BANDA = 16` (`:45`) y `DURACION_DEL_BARRIDO = 760` ms (`:54`);
  - `CapaDeLaGota.tsx` la pinta (`pintar`, `:135`) con dos observadores (`:221`, `:242`).
  - **La matemática de la banda vive en una sección:** el chrome no la puede importar, así que para usarla en la navegación hay que subirla al contrato, como `cruce.ts` en el sprint P-H.
- **Los velos de hoy, ninguno entre páginas:**
  - el del deslizamiento: `main[data-v3-deslizando]` con opacidad 0, en `_estilos/deslizamiento.css`;
  - el de carga (`page.tsx:68`, `VeloDeCarga`);
  - el del menú y el del contacto.

### 1.5 La navbar

- **El chrome lo monta la PÁGINA, no el layout:** `page.tsx:69` monta `<ChromeDelHome/>`. En `_chrome/ChromeDelHome.tsx` están el salto al contenido (`:113`), la barra (`:160`), el menú (`:161`), el contacto (`:163`), la onda de las portadas (`:169`) y el sonido (`:172`).
- **Los enlaces son todos anclas del home:** `_chrome/enlaces.ts:21-26` (`#quienes-somos`, …, `#contacto`), y `/login` en `:34`. Van en `<a href>` (`_chrome/barra/BarraDelHome.tsx:161,179,190`). En `/v3` no hay `next/link`.
- **Servicios no monta el chrome del home** (`[servicio]/page.tsx:27`, en servicios): sus enlaces relativos no llevan a ninguna parte desde una subruta (P-H3). Sus páginas se navegan con `<a href>` y recarga completa (`_servicios/rutas.ts:38`).

### 1.6 Lenis, el scroll y los viajes

- **Lenis es una sola instancia, del layout:** `_componentes/ScrollSuaveDeV3.tsx:78-79` la crea y `:86` la publica en `LENIS_DEL_SITIO`. El deslizamiento del CTA cuelga de ella (`:125`).
- **`_componentes/useDeslizamientoDelCta.ts`:**
  - `:153` captura el `<main>` en el montaje (las dependencias son `[instancia, modo]`, `:441`): con navegación cliente se queda con el `<main>` de la página anterior;
  - `:301` hace `pushState` para el ancla y `:431` escucha `popstate`.
- **`history.scrollRestoration = 'manual'`** lo pone el sitio vivo para todo el sitio (`src/components/layout/SmoothScroll.tsx:77`); su Lenis sale en `/v3` (`:98-100`).
- **Nada guarda la posición del home.**

### 1.7 La intro y el preloader

- `_intro/IntroDelHome.tsx:77` tiene `CON_PRELOADER = false`. El gate de antes de pintar, `src/components/layout/home-intro/introRutas.ts:57` (`['/', '/v3']`), sólo corre en una carga dura.
- `PreloaderContext` y `TransitionContext` están congelados, y en `/v3` no se montan: CLAUDE.md, «Frozen files».

### 1.8 Los títulos 3D

- **El componente:** `_componentes/titulos3d/TituloDeVolumen.tsx:26`. Las props son `id`, `texto`, `lectura`, `llegada`, `salida`, `llegadaDe`, `queda`, `asiento` y `saleCayendo`.
- **Las fuentes:** `FuenteDelTitulo` (`_lib/titulos3d/registro.ts:5`) es `'chivo-400' | 'archivo-700' | 'chivo-300-italica' | 'chivo-700' | 'chivo-300'`.
- **El motor:** el `FontLoader` de three con los JSON de `_fuentes/`, importados estáticos (`esc/titulos3d/armado.ts:2-8`).
- **Los JSON los genera `scripts-retoque/fuentes-3d.py`:** una instancia por peso, con SÓLO los caracteres de los textos listados. **Un título nuevo obliga a regenerarlos**, y los invariantes exigen cada carácter.

### 1.9 Lo que servicios ya dejó para B12a (P-H20)

En servicios:
- `_servicios/Intro.tsx:32` define `ATRIBUTO_DE_LA_INTRO = 'data-intro-de-servicio'`, con el `IdDeServicio` como valor;
- `:35` define `ALTO_DE_LA_INTRO`, que hoy es una pantalla («el alto lo fija B12a: 1,5 pantallas»);
- `:46` es una tapa interina, fija, que tapa la escena sin bajar su costo y se va con B12;
- el `h1` es el nombre del servicio, pintado por `TitularQueEntra`.

## 2. Lo que cuesta hoy la escena en una subruta

**Las condiciones.** Se midió en el dev server de :3000 (`next dev --webpack`), sin `next build` (O-10), así que los números absolutos están inflados por React de desarrollo y sólo valen comparados entre sí. La placa, leída en la misma página con `WEBGL_debug_renderer_info`, es la NVIDIA GeForce RTX 5050 (D3D11). El cuadro es de 1440 × 900 con pestaña visible, y el monitor tiene vsync de 75 Hz (los cuadros por segundo topan ahí). Cada corrida es un Chrome nuevo, con la memoria medida antes de arrancar (≥ 3 GB). La sonda es `scratchpad/ph/costo-subruta.ts`; los datos, `scratchpad/ph/costo.jsonl`.

**Qué se midió.** En `/v3/tipografia` (sin `[data-panel]`: el progreso en 0 y la escena «corriendo»), 10 s en reposo arriba y 8 s de rueda. En cada corrida:
- los cuadros (los intervalos de `requestAnimationFrame`);
- el hilo principal (`TaskDuration` y `ScriptDuration` por segundo, de `Performance.getMetrics`);
- el heap de JS;
- la memoria de los procesos del Chrome del banco.

Se midió contra la misma ruta con WebGL apagado (`--disable-webgl --disable-3d-apis`), donde el escudo de la escena no la monta.

| En reposo, 10 s | Con la escena (corridas 1 · 2 · 3) | Sin WebGL (1 · 2 · 3) |
|---|---|---|
| Cuadros por segundo | 72 · 73 · 73 | 75 · 71 · 71 |
| p95 del cuadro | 13,4 · 13,4 · 13,4 ms | 13,7 · 26,3 · 26,5 ms |
| Cuadros de más de 50 ms | 4 · 4 · 3 | 0 · 0 · 0 |
| Hilo principal: tareas | 933 · 617 · 633 ms/s | 15 · 15 · 15 ms/s |
| Hilo principal: script | 895 · 590 · 606 ms/s | 2 · 2 · 2 ms/s |
| Heap de JS | 214 · 199 · 191 MB | 105 · 158 · 143 MB |
| Proceso de la GPU | 335 · 359 · 367 MB | 171 · 170 · 171 MB |
| Renderer | 1.105 · 1.233 · 1.236 MB | 933 · 1.126 · 1.109 MB |

| Con rueda, 8 s | Con la escena | Sin WebGL |
|---|---|---|
| Cuadros por segundo | 75 · 75 · 75 | 75 · 72 · 73 |
| Cuadros de más de 50 ms | 0 · 0 · 0 | 0 · 0 · 0 |
| Hilo principal: tareas | 925 · 543 · 553 ms/s | 28 · 26 · 26 ms/s |
| Heap de JS | 235 · 198 · 191 MB | 105 · 105 · 105 MB |

**La lectura.**
- **El costo de la escena en una subruta, con las corridas 2 y 3:**
  - unos **600 ms por segundo de hilo principal** (contra 15 sin ella), casi todo script: la escena dibuja a cuadro completo aunque no haya nada que mirar;
  - **3 a 4 cuadros de más de 50 ms** cada 10 s en reposo;
  - unos **+50 MB de heap** y unos **+190 MB en el proceso de la GPU**.
- **La corrida 1** (933 ms/s) es la primera contra el dev recién compilado: incluye la compilación perezosa del módulo de la escena, y no se toma como base.
- **Los cuadros por segundo no la delatan**, porque topan en el vsync: el costo se ve en el hilo principal y en los cuadros largos.
- **En el home** lo mismo pasa sólo donde la escena está a la vista: detrás de un panel opaco duerme (`escenaEnCuadro`, `esc/visibilidad.ts:233`). En una subruta no hay paneles que la duerman.
- **La medida de referencia en `/v3`**, arriba, no corrió: el reaper de Claude Code la cortó por falta de memoria del sistema. No hace falta para esta tabla.

**De acá salen dos criterios:**
- **B12a.1:** en una página sin intro a la vista, en reposo, **≤ 50 ms/s de tareas** (sin WebGL da 15) y **0 cuadros de más de 50 ms**.
- **B12a.7:** el presupuesto de la variante, **≤ 0,5 ms de script por cuadro**. Es alrededor del 6 % de los ~8 ms por cuadro que la escena ya gasta en dev.

## 3. Las APIs propuestas

Son firmas, no código. Los nombres siguen la casa.

### 3.1 El preset de la página

Lo declara LA PÁGINA, no una tabla del home (decisión D1): `_lib/` nunca importa `_servicios/`, y la variante entra por el preset.

```ts
// esc/ruta/preset.ts — tipos y el almacén que lee la escena (sin JSX)
export type IdDePagina = 'home' | IdDeServicio | 'pagina'
export interface PresetDeLaEscena {
  readonly id: IdDePagina
  /** La pista de la intro: de la composición inicial (avance 0) a la pose de la intro (avance 1). El home sigue con CHOREO_KEYFRAMES. */
  readonly pista: 'home' | readonly ChoreoKeyframe[]
  /** Lo que ancla el avance: el bloque de la intro y el del pie (B13). En el home, null: manda el mapeo de las secciones. */
  readonly tramos: { readonly intro: string; readonly pie: string | null } | null
  readonly noche: 'dia' | 'noche'
  /** El servicio dueño del acento: el claro sale del token por el id (`--color-acento-claro`, `_secciones/_contrato/acento.ts:57,72`), nunca un hex. */
  readonly acento: IdDeServicio | null
  readonly variante: ComponenteDeVariante | null
}
export const PRESET_DEL_HOME: PresetDeLaEscena
export function presetActual(): PresetDeLaEscena           // lo lee la escena en su useFrame, sin render
export function suscribirseAlPreset(alCambiar: () => void): () => void

// esc/ruta/PresetDeLaPagina.tsx — 'use client'; lo monta la página; al desmontarse vuelve el del home
export function PresetDeLaPagina({ preset }: { readonly preset: PresetDeLaEscena }): null
```

### 3.2 La intro de la página (P-H13 y P-H20)

```ts
// _componentes/pagina/IntroDeLaPagina.tsx — el bloque de 1,5 pantallas, transparente, con el h1 y la bajada
export const PANTALLAS_DE_LA_INTRO = 1.5
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'   // o se adopta el de servicios (D2)
export interface PropsDeLaIntro {
  readonly titulo: string             // el nombre del servicio: el h1 del DOM y el título 3D, el MISMO texto
  readonly bajada: React.ReactNode    // dos párrafos, sin heading
  readonly preset: PresetDeLaEscena
  readonly antes?: React.ReactNode    // la marca de sección, el encabezado
}
export function IntroDeLaPagina(props: PropsDeLaIntro): React.JSX.Element
/** El avance de la intro, 0 → 1, medido en el layout del bloque (nunca con scrollHeight: lección de PULIDO 19). */
export function avanceDeLaIntro(bloque: { readonly arriba: number; readonly alto: number }, scrollY: number, altoDelCuadro: number): number
```

### 3.3 El título 3D de las páginas (P-H14)

```ts
// _componentes/titulos3d/presets.ts
export interface PresetDelTitulo {
  readonly fuente: FuenteDelTitulo
  readonly lectura: Titulo['lectura']
  readonly asiento: 'cercano' | 'lejano'
  readonly saleCayendo: true          // se va con una caída, nunca de golpe ni hacia arriba
}
export const TITULO_DE_PAGINA: PresetDelTitulo   // el mismo en todas las páginas; la familia sale de D3
// _componentes/titulos3d/TituloDePagina.tsx — el h1 siempre en el DOM; escondido sólo a la vista mientras el 3D está puesto
export function TituloDePagina(props: { readonly id: string; readonly texto: string; readonly avance: MotionValue<number> }): React.JSX.Element
```

Sin WebGL, con movimiento reducido o abajo de 1024, el `h1` es el visible, por el mismo corte de CSS que ya usa `TituloDeVolumen`.

### 3.4 La ranura de variantes

```ts
// esc/ruta/RanuraDeLaVariante.tsx — adentro del <Canvas>; monta preset.variante y la desmonta al salir de la página
export interface PropsDeLaVariante {
  /** El avance de la intro, 0 → 1. Una referencia que se lee en el useFrame: la variante no re-renderiza por cuadro. */
  readonly avance: Readonly<{ current: number }>
  readonly acento: THREE.Color                  // el claro, leído del token una vez por montaje
  readonly calidad: NivelDeCalidad              // 'plena' | 'compacta' (esc/calidad.ts)
  readonly reducido: boolean                    // movimiento reducido: el estado final, quieto
}
export type ComponenteDeVariante = React.ComponentType<PropsDeLaVariante>
export const PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0.5 } as const   // el criterio de B12a.7 (§2: ≈ 6 % de lo que la escena gasta por cuadro)
```

### 3.5 La navegación

```ts
// _componentes/navegacion/EnlaceDeRuta.tsx — <Link> de next con el velo; nunca router.push, nunca TransitionContext
export function EnlaceDeRuta(props: { readonly href: string; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element
// _chrome/velo/velo.ts — la máquina pura del velo
export type FaseDelVelo = 'quieto' | 'volviendo' | 'cubriendo' | 'cubierto' | 'destapando'
export function siguienteFaseDelVelo(fase: FaseDelVelo, evento: EventoDelVelo): FaseDelVelo
// esc/ruta/posicionDelHome.ts — guardar y devolver el home
export interface PosicionDelHome { readonly y: number; readonly noche: number; readonly diaDelFinal: boolean; readonly pasoDelPortfolio: number }
export function guardarLaPosicionDelHome(p: PosicionDelHome): void         // sessionStorage, con try/catch
export function posicionGuardadaDelHome(): PosicionDelHome | null
```

## 4. La tipografía

**Lo que usa el home:**
- **El DOM** (`layout.tsx:239-275`, con `next/font/local`, todas variables en `wght` 100–900):

| Archivo | Bytes | Qué es |
|---|---|---|
| `chivo-latin.woff2` | 33.252 | la Chivo romana |
| `chivo-italic-latin.woff2` | 11.172 | la itálica, recortada a 68 posiciones de mayúsculas |
| `archivo-display-latin.woff2` | 10.180 | la Archivo con el ancho clavado en 62 (condensada), 68 posiciones |
| `chivo-mono-latin.woff2` | 26.380 | la Chivo Mono |

- **El 3D** (`_fuentes/*.json`, instancias estáticas):
  - el hero: `archivo-700-titulos` (7.177 B) en el renglón 1 y `chivo-300-italica-titulos` (2.700 B) en el renglón 2;
  - los títulos de sección: `chivo-400-titulos` (12.701 B), con el subrayado en `chivo-700` (5.204 B) y el tachado en `chivo-300` (4.505 B);
  - el CTA del final: `archivo-normal-cta` (7.943 B), la Archivo de ancho normal en 600, y `-fuerte` (8.542 B), en 900;
  - el pie: `chivo-400`, `500` y `600-pie`.
- **Las fuentes de origen**, en `scripts-titular/_upstream/`, sin versionar:
  - `Archivo[wdth,wght].ttf`: 658.596 B, la variable completa, con ancho de 62 a 125;
  - `Chivo-Italic[wght].ttf`: 177.852 B;
  - `pinchada-archivo-display.ttf`: 263.108 B.
  - No hay TTF de la Chivo romana: sus JSON salen del woff2.

**Tres propuestas para el título de las páginas** (decisión D3):

| | Familia | Se ve | Costo en el DOM | Costo en el 3D |
|---|---|---|---|---|
| **A** | Archivo 700 condensada, la del renglón 1 del hero | la voz del hero: «seguís en el sitio» | 0 B (ya está cargada) | regenerar `archivo-700-titulos` con las letras de los tres nombres: unos KB |
| **B** | Archivo ancho normal 600, la del CTA del final | más llana y de producto; los nombres largos ocupan más | un woff2 nuevo de la Archivo con ancho 100: ≈ 10–15 KB estimados, a medir | regenerar `archivo-normal-cta` con las letras nuevas |
| **C** | Chivo 400, la de los títulos de sección | calma, de lectura; se distingue del hero | 0 B | regenerar `chivo-400-titulos` |

**Recomiendo A.** Es la continuidad más directa con el hero, la condensada aguanta «IA y automatizaciones» en una línea a 1440, y no suma bytes al DOM. Queda en pie B si los nombres se leen apretados. Con cualquiera, el `h1` del DOM usa la misma familia del DOM que el 3D (la Archivo display ya está), y el invariante de cobertura de letras se extiende a los tres nombres.

## 5. La navegación

**El caso general** (navbar, de página a página):
1. Click en un `EnlaceDeRuta`, que es `<Link>`: la navegación cliente arranca enseguida.
2. Si la escena está a la vista, la cámara vuelve a la composición inicial y la página que sale se apaga. Si estás en el papel, se saltea.
3. Pasa el velo: la banda de la gota, con su anochecer o su amanecer.
4. La página nueva se monta escondida debajo (el mismo mecanismo de `main[data-v3-deslizando]`).
5. Se destapa en su composición inicial.
- El lienzo no se rehace, porque vive en el layout. Ver D2 por la alternativa con View Transitions.

**El viaje del CTA de Servicios del home a su página:** el papel de la sección se levanta, aparece la escena, anochece y la cámara llega a la composición inicial. Es el deslizamiento de hoy, hacia otra ruta.

**La vuelta al home:**
- **Al salir del home** se guarda la `PosicionDelHome`: el scroll, la noche, el día del final y el paso del Portfolio.
- **Con la flecha del navegador** (un `popstate` hacia `/v3`), después de la primera medida de las secciones, se devuelve el scroll con Lenis (`immediate`), se reponen los almacenes y se destapa con el amanecer.
- **«Home» del menú** va al principio, y amanece.

**Lenis en cada cambio de ruta:**
- `scrollTo(0, { immediate: true })`, salvo en la vuelta;
- `resize()`;
- el deslizamiento vuelve a capturar el `<main>` (hoy lo captura una vez, `useDeslizamientoDelCta.ts:153`).

**Lo que no se usa:**
- `router.push`;
- `TransitionContext.tsx`;
- `scrollRestoration` del navegador: queda en `manual`, como lo pone el sitio vivo.

## 6. La REGLA DE ALTURAS

- **En el home sigue igual:** cambiar el alto de una sección corre el mapeo, y se compensa con `TRAMO_ESTIRADO`.
- **B12a no toca el alto de ninguna sección del home ni `secciones.ts`.**
- **El criterio:** la deriva de los 7 nudos del mapeo a 1440, 1024 y 390 da 0 px antes y después de cada subsprint (`s76-portfolio-mapeo` y `s74`, `s75` y `s76` verdes).
- **En las páginas no aplica:**
  - la pista de la intro se ancla al bloque de la intro (1,5 pantallas);
  - la del pie, a su sección (B13);
  - el alto del cuerpo en papel no corre la escena.

## 7. O-2: ningún padrón alcanza las carpetas de servicios

**Lo que recorre hoy cada padrón de «sin registrar»:**

| Padrón | Qué recorre |
|---|---|
| s3-archivos | `_estilos`, `_componentes/{chrome,layout,medios,tipografia}`, `componentes` y `tipografia` |
| s5-archivos | las carpetas `hero`, `quienes-somos`, `numeros` y `trabajos` de `_secciones/` |
| s6-lane | las otras cuatro secciones y `_invariantes` |
| s7-contrato | `_secciones/**` |
| s8-padron | `esc/`, `_intro`, `_chrome` y `src/components/layout/carga-diferida` |

Ninguno entra a `_servicios/escena/`, a `public/servicios/` ni a `scripts-servicios/`.

**Lo que sí llega a `_servicios/`** son barridos de REGLA, no padrones:
- s8-montaje (`_lib/__tests__/s8-montaje-soporte.ts:38`, todo `src/`): nadie fuera de su lista importa `marcaEscena`. Una variante no lo necesita.
- s8-escena (`esc/__tests__/s8-escena-soporte.ts:39`): ningún módulo de la escena importa un valor del panel.
- s7-cn (`_lib/__tests__/s7-cn.invariant.ts:234`): el corpus de clases.
- s4-conflictos: todo el repo.

`scripts-servicios/` existe en esta rama (`pin-1440.ts` y `traspaso-1440.ts`) y sólo lo toca s4-conflictos.

**La regla de B12a:**
- todo archivo nuevo va a carpetas del home ya cubiertas (`esc/ruta/`, `_chrome/velo/`, `_componentes/pagina/`, `_componentes/navegacion/`), registrado en su padrón;
- ningún padrón nuevo recorre una carpeta de servicios;
- un invariante de B12a lo afirma (control positivo: un padrón que agrega `_servicios/` se ve).

## 8. Riesgos

1. **Los almacenes sobreviven a la navegación cliente.** Son `NOCHE_DISPARADA`, `DIA_DEL_FINAL`, `TRAMO_ESTIRADO`, el viaje, el registro de títulos y `LENIS_DEL_SITIO`, y hoy cada carga de documento los reinicia.
   - Se reponen en un solo lugar, el preset.
   - Una prueba navega home → página → home y compara los almacenes.
2. **Lo que captura el DOM en el montaje** queda con nodos viejos: el `<main>` del deslizamiento, los `[data-panel]` de la barra, los observadores de la gota, la medida de las secciones.
   - Se vuelve a capturar con cada cambio de ruta.
3. **La pose del hero es la del intro vivo** (`src/lib/scene-framing.ts:144`).
   - `CHOREO_KEYFRAMES` no se toca: una prueba lo compara profundo contra una copia.
4. **La banda de la gota vive en una sección.**
   - Subirla al contrato, como `cruce.ts`, sin cambiar lo que pinta la gota (huella del marcado y la máscara iguales).
5. **La memoria de GPU.** La escena ya no se rehace entre páginas, así que una variante que no libera sus recursos acumula.
   - `dispose` obligatorio.
   - Una prueba monta y desmonta la ranura 10 veces y compara `renderer.info.memory`.
6. **El costo en las páginas:** la escena dibuja a cuadro completo en cualquier subruta (§2).
   - En el cuerpo en papel el lienzo tiene que dormir (`'never'`), como ya duerme detrás de un panel opaco del home.
7. **Medir en dev.** O-10 prohíbe `next build`, así que las medidas de B12a son relativas en dev (escena contra sin WebGL, antes contra después).
   - Un número de producción necesita tu permiso (D7).
8. **Tailwind escanea la prosa.** Este plan y los logs no deletrean clases arbitrarias.
9. **La pestaña oculta da medidas en cero.** Toda sonda verifica `visibilityState` y el ancho antes de medir.
10. **El acople con servicios.** Su intro y su `h1` ya existen (§1.9); B12a los adopta sin romper sus pruebas (D2), y lo que les cambie se pide como P-S.

## 9. El árbol de archivos

**Se crean** (carril del home):

| Archivo | Qué es |
|---|---|
| `esc/ruta/preset.ts` | el preset, sus tipos y el almacén |
| `esc/ruta/PresetDeLaPagina.tsx` | lo que monta la página para declarar su preset |
| `esc/ruta/RanuraDeLaVariante.tsx` | la ranura, adentro del `<Canvas>` |
| `esc/ruta/pistaDeLaIntro.ts` | la composición inicial y la pose de la intro |
| `esc/ruta/posicionDelHome.ts` | guardar y devolver el home |
| `_chrome/velo/velo.ts` | la máquina pura del velo |
| `_chrome/velo/VeloDeNavegacion.tsx` | el velo, en el layout |
| `_secciones/_contrato/banda.ts` | la banda de la gota, subida |
| `_componentes/pagina/IntroDeLaPagina.tsx` | el bloque de la intro |
| `_componentes/titulos3d/presets.ts` | el preset del título |
| `_componentes/titulos3d/TituloDePagina.tsx` | el título de la página, con su `h1` |
| `_componentes/navegacion/EnlaceDeRuta.tsx` | el `<Link>` con el velo |
| `_chrome/barra/DesplegableDeServicios.tsx` | el desplegable de la barra |
| `_lib/__tests__/s78-b12a-*.invariant.tsx` | las suites, con sus scripts |

**Se tocan:**

| Archivo | Por qué |
|---|---|
| `layout.tsx` | el velo y, según D4, el chrome |
| `page.tsx` | según D4 |
| `_componentes/EscenarioCompuerta.tsx` | el preset |
| `esc/EscenaDelHome.tsx` | el preset y la ranura |
| `esc/ataduraAlScroll.ts` | el avance de la intro cuando hay `tramos` |
| `esc/pistaDelHome.ts` | la pista por preset |
| `_chrome/ChromeDelHome.tsx`, `_chrome/enlaces.ts`, `_chrome/barra/BarraDelHome.tsx` y el panel del menú | los enlaces por ruta y el acordeón |
| `_componentes/useDeslizamientoDelCta.ts` y `_componentes/ScrollSuaveDeV3.tsx` | el cambio de ruta |
| `_secciones/trabajos/gota.ts` | reexporta la banda |
| `scripts-retoque/fuentes-3d.py` | las letras de los nombres |
| los padrones (`s3-archivos`, `s8-padron`) y `package.json` | registrar lo nuevo |

**No se tocan:**
- los congelados: `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `schema.prisma`, `src/auth.ts`, `src/lib/prisma.ts` y `src/components/ui/*`;
- `src/app/page.tsx`, `src/lib/scene-camera.ts` y `src/lib/scene-framing.ts`;
- `esc/choreography.ts` (sus valores) y `_lib/secciones.ts`;
- `_servicios/**` y `[servicio]/**`, que son de servicios;
- `lente.ts` no entra en ningún commit.

## 10. Los subsprints

Son de unas 2 h cada uno. Cada uno cierra con su FRENO y su criterio medido.

| # | Qué | Criterio medido | FRENO: qué mira Valentino |
|---|---|---|---|
| **B12a.1** | El preset y la escena consciente de la ruta; el home con su preset de siempre; el lienzo duerme en el papel de una subruta | el home idéntico (s74, s75, s76 y la deriva de los 7 nudos en 0 px); en `/v3/tipografia` en reposo, ≤ 50 ms/s de tareas y 0 cuadros de más de 50 ms (hoy, unos 600 ms/s y 3 o 4; §2) | `/v3` a 1440 y 390: nada cambió; `/v3/tipografia`: la escena quieta |
| **B12a.2** | La intro de la página y la composición inicial: la pista anclada al bloque, avance de 0 a 1 en 1,5 pantallas | avance 0 arriba y 1 a 1,5 pantallas (± 1 %); la pose en avance 0 es la composición inicial (≤ 1 px del logo a 1440) | una ruta de prueba a 1440 y 390: scrolleá la intro y volvé |
| **B12a.3** | El título 3D de las páginas y el `h1` (P-H13, P-H14): el preset, las letras regeneradas | `h1.textContent` igual al texto 3D (prueba); cobertura de letras 100 %; bytes antes y después | la ruta de prueba con los tres nombres |
| **B12a.4** | La navbar del home en las páginas y el desplegable de servicios (en el teléfono, el acordeón) | la píldora mide lo mismo en el home y en la página (rects ± 0,5 px); teclado (orden, Esc, foco que vuelve); AA ≥ 4,5:1 | la barra a 1440 y el menú a 390 |
| **B12a.5** | La navegación cliente y el velo | 0 cargas de documento en home → página → página → home; el velo cubre el 100 % del cuadro en el cuadro del cambio; ningún cuadro de más de 50 ms durante el velo (dev); el sonido respeta el mute | ir y venir por la navbar, a 1440 y a 390 |
| **B12a.6** | La vuelta al home | la flecha devuelve el scroll con \|Δy\| ≤ 1 px, el mismo paso del Portfolio y la misma noche; «Home» va a 0; amanece | atrás desde una página a mitad del Portfolio |
| **B12a.7** | La ranura de variantes, con una variante de prueba del arnés | ≤ 0,5 ms por cuadro de CPU de la variante de prueba (bench); montar y desmontar 10 veces deja `renderer.info.memory` como estaba | la variante de prueba en avance 0, 0,5 y 1 |

El orden es el de la tabla: cada uno se apoya en el anterior. B12a.4 y B12a.7 son independientes entre sí.

## 11. Decisiones para Valentino

**D1 · ¿Quién declara el preset?**
- (a) La página monta `<PresetDeLaPagina>`. `_lib/` no importa nada de servicios, y la variante viaja en el preset.
- (b) Una tabla de rutas del home (`presetDeLaRuta(pathname)`). Es más simple, pero el home tendría que conocer las variantes de servicios: rompe la frontera.
- **Recomiendo (a).** Cuesta lo mismo.

**D2 · ¿Cómo pasa el velo con navegación cliente, sin `router.push`?**
- (a) Navegación inmediata con `<Link>`: la página nueva se monta escondida, la escena (que persiste en el layout) vuelve a la composición inicial, pasa la banda y se destapa.
  - Respeta todas las reglas.
  - Lo único brusco es que el DOM de la página que sale se va enseguida: se apaga con el `main` antes del cambio.
- (b) View Transitions de React y Next (bandera experimental en `next.config`, compartido con el sitio vivo). La foto de la página vieja queda quieta mientras pasa la banda como máscara.
  - Es elegante.
  - La cámara no puede volver antes, porque la foto está quieta, y es una bandera experimental en un archivo de todos.
- (c) Navegación de documento, como hoy, más un velo de llegada.
  - Es lo más simple.
  - Se rehace el lienzo en cada página: es el costo de arranque de la escena, y se pierde la continuidad.
- **Recomiendo (a).**
- Va junto la intro: ¿se adopta el atributo de servicios (`data-intro-de-servicio`) o uno del home (`data-intro-de-pagina`)? Recomiendo el del home en `IntroDeLaPagina`, y servicios lo pone adentro: un P-S chico.

**D3 · La familia del título de las páginas** (§4).
- **Recomiendo A**, la condensada del hero.

**D4 · ¿Dónde vive la navbar en las páginas?**
- (a) En el layout: una sola píldora que no se vuelve a montar entre rutas. Es la máxima continuidad, y obliga a sacar `<ChromeDelHome/>` de `page.tsx` y a registrarlo en el padrón del layout (s10-banco).
- (b) Cada página monta su chrome: la píldora se vuelve a montar debajo del velo.
- **Recomiendo (a).** La píldora es la pieza que más se nota si parpadea.

**D5 · El desplegable de servicios en el escritorio.**
- (a) Se abre con clic y Enter, y con el hover con intención (un retardo corto).
- (b) Sólo con clic.
- **Recomiendo (a).** En el teléfono es un acordeón adentro del menú, como dice el CONTRATO.

**D6 · ¿Qué devuelve la flecha al home?**
- (a) El scroll.
- (b) El scroll, la noche y el paso del Portfolio, o sea el estado visible.
- **Recomiendo (b).** Es lo que dice el CONTRATO: «con la escena en su estado».

**D7 · Medir en producción.**
- O-10 prohíbe `next build`, y las medidas de B12a serían relativas en dev.
- (a) Sigue así.
- (b) Autorizás un build al cerrar B12a.5 y otro al cerrar B12a.7, para el presupuesto por cuadro real.
- **Recomiendo (b)**, solo esos dos.

**D8 · El cuerpo en papel duerme el lienzo.**
- (a) `'never'` mientras el papel tapa todo el cuadro, como en el home.
- (b) Baja los cuadros por segundo.
- **Recomiendo (a).** Ya existe la lógica: `escenaEnCuadro`, en `esc/visibilidad.ts:233`.

---

## Log

### B12a.1 · el preset y la escena consciente de la ruta (2026-10-18)

Valentino decidió D1 a D8 sobre el plan (`d51d95fc`).
- D1: la página declara su preset.
- D2: `<Link>` inmediato y la banda, sin View Transitions.
- D3, corregida: el título de las páginas va con dos variantes de Archivo distintas de las del home, en 2 o 3 combinaciones detrás de `?titulo=1|2|3`.
- D4: la navbar, en el layout.
- D5: el desplegable con clic, Enter y hover con retardo; en el teléfono, un acordeón.
- D6: la flecha devuelve el scroll, la noche y el paso del Portfolio.
- D7: dos `next build`, al cerrar B12a.5 y B12a.7.
- D8: el lienzo duerme detrás del papel.

**Lo hecho:**
- **`esc/ruta/preset.ts`**: `PresetDeLaEscena` (el id, los bloques que despiertan la escena, la noche y el acento), `PRESET_DEL_HOME`, el almacén (una PILA: la página nueva entra antes de que salga la vieja, y cada una saca sólo lo suyo), `despiertaEnLaPagina` (pura) y `bloquesDelPreset`.
- **`esc/ruta/PresetDeLaPagina.tsx`**: la página lo apila al montarse (con `useLayoutEffect`) y lo saca al desmontarse, sin pintar nada. El home lo declara en `v3/page.tsx` con `PRESET_DEL_HOME`.
- **`esc/ataduraAlScroll.ts`**: sin las secciones del home, la lectura del scroll pregunta al preset.
  - Sin preset (las galerías de `/v3`), la escena se suspende (`never`) después de su primer cuadro, para que el lienzo no quede vacío.
  - Con preset, despierta mientras asoma un bloque suyo, con el margen de encendido del home; en el papel duerme (D8).
  - Se vuelve a leer cuando cambia el preset y cuando la escena pinta su primer cuadro.
  - En el home la lectura es la de siempre.
- **La suite s78-b12a** (`test:s78-b12a` y `test:s78`): 11 afirmaciones y 4 controles.

**Verificación:**
- lint limpio y `tsc` con 0 errores;
- s74 34, s75 55, s76 670 (con el mapeo de la deriva), s10 240 y s78 11;
- `verificar`: el reaper de Claude Code lo cortó por memoria (en segundo plano, con 2 GB libres). Lo reintenté una vez, partido en dos mitades en primer plano (`scratchpad/cola2/verificar-mitad.sh`), más los 16 grupos que no tienen script de agregado. Dio los 8 grupos rojos de la base (s1, s2, s3, s4, s5, s7, s8 y s17) con las mismas cuentas de suites rojas, y todo lo demás en verde (s74, s75, s76, s77 y s78 incluidos). La frontera, aparte: en verde;
- sin `next build`.

**Lo que no corrió por memoria: el criterio medido de B12a.1.** En `/v3/tipografia` en reposo tiene que dar ≤ 50 ms/s de tareas y 0 cuadros de más de 50 ms (en Fase 0, unos 600 ms/s y 3 o 4 cuadros largos). Con el dev de servicios arriba, el dev del home y un Chrome no entran juntos.
- La sonda está lista: `scratchpad/ph/costo-subruta.ts`, con `BASE=http://localhost:3002`.

**Qué mirar (B12a.1):**
1. `/v3` a 1440 y 390: el home, igual que siempre.
2. `/v3/tipografia` y `/v3/componentes`: la escena de fondo aparece (su primer cuadro) y queda quieta. El ventilador de la máquina se tiene que notar menos que antes.

### B12a.2 · la intro de la página y la composición inicial (2026-10-19)

**Lo hecho:**
- **`esc/ruta/pistaDeLaIntro.ts`** (nuevo):
  - `PANTALLAS_DE_LA_INTRO` (1,5).
  - `COMPOSICION_INICIAL`: la pose del hero del home con el logo centrado (`frameX` 0; el hero lo corre a 0,5 para su texto). Es una copia: `CHOREO_KEYFRAMES[0]` es el destino del preloader del sitio vivo (`scene-framing.ts:144`) y no se toca.
  - Las tres poses candidatas de la intro, detrás de `?intro=1|2|3` (sin la bandera, la 1). Las tres dejan el logo centrado y quedan dentro de las alturas y distancias del recorrido del home:
    - 1, **acercarse**: de frente, más baja;
    - 2, **girar**: 38° alrededor del logo, a media altura;
    - 3, **subir**: más alto y un poco más lejos, mirando hacia abajo.
  - `avanceDeLaIntro`: de 0, con el tope de la intro en el tope del cuadro, a 1, 1,5 pantallas después, medido en el layout.
  - `AVANCE_DE_LA_INTRO`: el canal del avance, la referencia que el plan le da a la variante (§3.4).
  - `pistaDeLaPagina`: la pista de la página, armada una vez por preset; no crea nada por cuadro.
  - `luzDeLaPagina`: la luz del cuadro, que en una página es la del principio del recorrido con la noche del preset.
- **`esc/ruta/preset.ts`**: suma el campo `pista`, `null` en el home.
- **`esc/ataduraAlScroll.ts`**: en una página con pista, mide el tope de su intro en el layout y escribe el avance en `AVANCE_DE_LA_INTRO`. En la página no toca el progreso del rig.
- **`esc/OrbitRig.tsx`**: tres líneas nuevas, y las líneas del home quedan tal cual (s38, s48, s52, s73 y s76 las fijan literalmente):
  - en una página con pista, la cámara toma esa pista con el avance de la intro, encima de la del recorrido y de la mezcla del Portfolio;
  - la luz (`luzDeLaPagina`) va antes de la noche disparada, así el nivel natural que ella publica, el que leen los módulos de noche, ya es la noche de la página;
  - el dolly del CTA y el mouse del recorrido no llevan guarda: leen el progreso del rig, que en una página queda en el del hero.
  - Queda en 651 líneas, la base de s8.
- **`_componentes/pagina/IntroDeLaPagina.tsx`** (nuevo): el bloque de 1,5 pantallas, transparente, con el `h1` y la bajada fijos al tope mientras dura. Declara el preset de la página y, de noche, lleva los claros (`data-seccion="invertida"`).
- **`/v3/prueba-de-pagina`** (nueva, instrumento sin indexar): la intro de noche y un cuerpo en papel. Tiene un enlace a cada pose y un preset por variante, armado una vez. Se borra cuando exista la primera página de servicio con su intro.
- **s78-b12a**: suma §4 a §8, que son 22 afirmaciones con 8 controles. En total quedan 33.
  - §4: el avance, 0 arriba y 1 a 1,5 pantallas (± 1 %), a 1440 × 900 y a 390 × 844.
  - §5: la pose en avance 0 es la composición inicial en las tres variantes. Es la misma pose, así que hay 0 px de diferencia del logo a cualquier ancho.
  - §6: la bandera, la pista que lee el rig y la luz.
  - §7: el cableado.
  - §8: el bloque y la ruta.
  - De B12a.1 cambió una sola afirmación, la de §2: la lectura de la página ahora tiene las dos líneas del avance antes de decidir si despierta.
  - Ninguna afirmación de otro sprint se tocó.

**Decisiones mías, para que Valentino las vea:**
1. **El avance va por un canal propio, no por el progreso del rig.** Ese progreso lo leen también los títulos 3D, el polvo, la formación, el moiré, el entorno, el dolly del CTA y el mouse, con el significado del home: con el avance en 0,4 aparecería en la página lo que el home muestra en 0,4. En una página quedan en el estado del hero (el progreso queda en 0 en una carga directa).
   - Para B12a.5: al navegar desde el home, la vuelta a la composición inicial también tiene que llevar el progreso a 0. Si no, desde el CTA del home el dolly se metería en la página.
2. **El cambio de pista vive en el rig, no en `pistaDelHome.ts`** (el árbol del plan, §9, decía ese archivo). La pista cambia con el preset sin un render, y el rig la lee en su cuadro.
3. **La intro mide 1,5 pantallas, como dice el plan.** Con el avance en 1, el fondo del bloque llega al tope del cuadro: el papel sube desde la media pantalla, así que la última pantalla del movimiento se ve con el papel entrando.
   - Si Valentino quiere ver el movimiento entero sin papel, el bloque pasa a 2,5 pantallas con el texto fijo, sin tocar el avance.

**Verificación:**
- lint limpio en los 7 archivos tocados y `tsc` con 0 errores. Para que `tsc` chequeara hubo que borrar `.next/dev/types`, que estaba roto con un error de sintaxis; lo regenera el dev.
- `verificar`, partido en mitades en primer plano por la memoria (dos FRENO por memoria con los devs de :3000 arriba, retomados donde quedaron), más los 17 scripts sin agregado:
  - los 8 grupos rojos de la base (s1, s2, s3, s4, s5, s7, s8 y s17) con las mismas suites y las mismas cuentas de fallas que B12a.1;
  - todo lo demás en verde, s78 con 33.
- Las suites que leen el rig (21) se corrieron otra vez después del último cambio: todas como en la base.
- Sin `next build`.

**Lo que no corrió por memoria:** la medición en el sitio, o sea el avance a 1,5 pantallas (± 1 %) y el logo a ≤ 1 px de la composición inicial a 1440 en la ruta de prueba. El modelo lo afirma en s78 (es la misma pose), pero el sitio no se midió: con un dev ajeno arriba, otro dev más un Chrome no entran en la regla de los 3 GB.

**Fuera de scope (anotado, no hecho):**
- La ruta de prueba no está en el padrón de rutas de demo (`s4-rutas-de-demo.ts`). Sumarla rompe la cuenta escrita a mano en `s7-integracion.invariant.tsx:167` (7 rutas). Su peso recién se mide con build: va con B12a.5 (D7).

**P-H28 (cambio de prioridad, recibido durante B12a.2):** A2 y B ya estaban commiteados (`5ef4ce83` y `8336ba14`), y B12a.1 también (`fcd57f53`). Lo que había en curso era B12a.2, y lo llevé a este punto estable y lo commiteé.
- El orden de ahora es P-H26 (el foco del modal), P-H27 (la regla de s77), `docs/rediseno/B12a-API.md` con las firmas definitivas, y después el resto de B12a.
- El subsprint B ya está hecho, así que no queda nada de B1.2d para después de B12a.

**Qué mirar (B12a.2) — elegir la pose de la intro:**
1. `/v3/prueba-de-pagina?intro=1`, `?intro=2` y `?intro=3`, a 1440 y a 390. Arriba, de noche, el logo centrado: es la composición inicial. Scrolleá la intro (1,5 pantallas) y volvé: la cámara va y vuelve con el scroll. **Elegí la pose**; la elegida queda y la bandera se va.
2. Sobre la escena de noche, el `h1` y la bajada en claro: que se lean.
3. Cuando el papel tapa la escena, ella se duerme (D8); al volver, despierta sin saltar.
4. Si la última pantalla del movimiento, con el papel entrando, te alcanza, o preferís la intro de 2,5 pantallas (decisión 3).
5. `/v3` a 1440 y 390: el home igual que siempre (se tocó el rig).

### P-H28 · el orden nuevo y la API publicada (2026-10-19)

Valentino puso B12a antes que el subsprint B de B1.2d, porque la maqueta completa de servicios depende de B12a. B ya estaba commiteado (`8336ba14`), así que no queda nada de B1.2d para después.

**Las firmas definitivas** para servicios están en `docs/rediseno/B12a-API.md`: el preset de ruta, la intro, el preset del título y la ranura de variantes, con el estado de cada pieza.
- Lo que la API fija y el código todavía no tiene llega con su subsprint:
  - `variante` en el preset, `SELECTOR_DE_LA_INTRO`, el id de la página como valor del atributo de la intro y el acento en su bloque: B12a.3.
  - `partes` del título y `TITULO_DE_PAGINA`: B12a.4.
  - `PISTA_DE_LA_INTRO`: cuando Valentino elija la pose.
- **La variante va en un módulo `'use client'`.** Así es una referencia de cliente, y el preset puede ir de una página de servidor a `PresetDeLaPagina`: React Flight serializa las referencias de cliente en cualquier prop y rechaza cualquier otra función (verificado en `react-server-dom-webpack-server.node.development.js:2943`).

**El orden se reordenó.** El plan ponía la ranura última (B12a.7), y servicios necesita primero la ranura, la intro, el título y la navegación. La ranura sólo depende del preset (B12a.1), así que adelantarla no cuesta nada. La vuelta al home no bloquea a servicios (es del home), así que queda última.

| # | Qué | En el plan |
|---|---|---|
| B12a.3 | la ranura de variantes, con su variante de prueba | B12a.7 |
| B12a.4 | el título 3D y el `h1` (FRENO: `?titulo=`) | B12a.3 |
| B12a.5 | la navbar en el layout y el desplegable | B12a.4 |
| B12a.6 | la navegación cliente y el velo | B12a.5 |
| B12a.7 | la vuelta al home | B12a.6 |

**Los dos `next build` de D7 siguen a su contenido, no a su número.** Uno va al cerrar la ranura (B12a.3, por el presupuesto de 0,5 ms por cuadro) y el otro al cerrar la navegación cliente (B12a.6). Se avisan acá cuando corran.

### B12a.2 · cierre: la pose 2 y la intro medida en el sitio (2026-10-20)

**La decisión de Valentino:** la pose de la intro es la 2 (girar), y la intro sigue en 1,5 pantallas.
- **`pistaDeLaIntro.ts`:** salen las poses 1 y 3, la variante y `?intro=`. Quedan `POSE_DE_LA_INTRO` (girar) y `PISTA_DE_LA_INTRO`, la pista compartida y exportada: es P-H29 g.
- **La ruta de prueba:** queda con un solo preset.
- **s78:** se reemplazaron por la decisión, cada una con su control:
  - las afirmaciones de las tres variantes (la pista llega a girar; los controles, la pista que arranca en el hero y la de acercarse);
  - la de la bandera (salió; el control es la bandera de las tres);
  - y la de la ruta (un preset);
  - y se sumó que la pose deja el logo centrado en todo el camino (el control es la de subir).

**La medición en el sitio, que antes no había corrido** (`scripts-carga/intro.ts`): el Chrome del sistema contra el dev, con el banco de la escena.
- **Lo que publica la escena:** el avance (`__avanceDeLaIntro`, sólo con banco) y la silueta del logo (`__siluetaDelBanco`). El mouse quieto en el medio.
- **El avance:** 0 → 0,0000, 0,5 → 0,5000 y 1 → 1,0000 a 1440 y a 390. Criterio ± 1 %.
- **ENCONTRÓ UN DEFECTO:** en la página no estaba el logo; se veían su sombra en el piso y la sala.
  - `CaidaDelLogo` levanta el logo al cargar arriba y lo hace caer con la carga abierta (`cargaLista`).
  - La carga la abre el velo de carga, que vive sólo en el home (`v3/page.tsx`). En una página no se abría nunca y el logo quedaba arriba para siempre.
  - **El arreglo:** sin el velo y con la carga cerrada, no hay caída y el logo está en su lugar. El home no cambia: ahí el velo está en el HTML del servidor cuando la escena se monta (la foto lo muestra cayendo con el titular). s52, que fija esa línea, sigue en verde.
- **El logo en avance 0:**
  - **A 390:** idéntico al del hero del home (0 px en x, en y y en alto).
  - **A 1440:** centrado exacto en x (0,0 px). En y da −10 px y en alto −12 px contra el hero, porque ahí el hero corre el logo a la derecha (`frameX` 0,5) y, fuera de eje, la perspectiva lo agranda y lo baja. La composición inicial es esa pose centrada, así que ahí la comparación en y no vale y queda informada.
- **El control:** es la corrida de antes del arreglo, sin logo (silueta vacía, rojo).
- **Fotos a 1440:**
  - avance 0, el logo de noche y centrado;
  - a las 1,5 pantallas, el papel (la escena duerme);
  - el home arriba, el logo cayendo con el titular.

**Verificación:** lint y tsc limpios; `verificar` con la misma lista de fallas que la base.

**Qué mirar (B12a.2):**
1. `/v3/prueba-de-pagina` a 1440 y a 390: arriba, el logo centrado de noche. Scrolleá la intro y volvé: la cámara gira un cuarto de vuelta corto alrededor del logo y vuelve.
2. `/v3` arriba: el logo sigue cayendo con el titular, como siempre.

### B12a.1 · el criterio medido (2026-10-20)

`scripts-carga/costo-subruta.ts` (el banco de la Fase 0, pasado al repo), `/v3/tipografia` a 1440, tres corridas, con la NVIDIA RTX 5050:
- **En reposo, 10 s:** **20 ms/s de tareas** (6 de script) y **0 cuadros de más de 50 ms**, en las tres corridas. El criterio era ≤ 50 ms/s y 0. En la Fase 0, sin el preset, daba unos 600 ms/s y 3 o 4 cuadros largos.
- **Con la rueda, 8 s:** de 32 a 34 ms/s y 0 cuadros largos.
- El control es la Fase 0: la misma ruta y el mismo banco, antes de B12a.1.
