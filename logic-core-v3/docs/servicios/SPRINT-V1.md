# V1 — Páginas web con la escena: la intro, la variante y la salida

2026-10-20 · Autor: CC · Viene de: el prompt «V1» de Valentino, `docs/rediseno/B12a-API.md` (`a0ecd331`), la skill `pagina-home-based`, `SPRINT-V0.md` y `SPRINT-M2b.md`.
Rama `paginas/servicios`, sobre el merge-5 (`660a9d2f`). Las rutas son desde `src/app/v3/`, salvo las que empiezan con `src/`, `docs/` o `scripts-`; `esc/` es `_lib/escena/`.

**El orden de la corrida (decidido por CC, revisar):** Paso 0 → Grupo 2 (commit) → Grupo 3 (commit) → Grupo 1 (sin commit, FRENO, el dev prendido). El Grupo 1 y el 2 tocan los mismos archivos (`pagina.invariant.tsx` y este log): así los commits de los grupos 2 y 3 salen limpios mientras el 1 espera el «commit» de Valentino. Las mediciones del M2b y de P-H26 (Grupo 3) corren contra la página de hoy (con la tapa): miden las historias del precio y el modal, que el Grupo 1 no toca.

---

## 1. Paso 0 — el merge-5 y la API

### 1.1 El merge-5

- `git log -4`: `660a9d2f` (el merge de `rediseno/home`), `a0ecd331` (`B12a-API.md`), `627db1be` (B12a.3, la ranura y P-H29 a–f), `92f96cf9` (mediciones). El M2b (`912be004`) es el primer padre del merge. `git status`: solo `SPEC.md` y `CONTRATO.md` sin seguir.
- El merge no tocó ningún archivo de `[servicio]/`, `_servicios/`, `docs/servicios/`, `public/servicios/` ni `scripts-servicios/`.
- **tsc: 0 errores.** Antes de correrlo borré `.next/dev/types` sin mirar si estaba corrupta (la regla dice borrarla si lo está; el dev la regenera).
- **Los tests de servicios y los 6 barridos, iguales a la base del M2b:** `datos` 55/0 · `precios` 22/0 · `slots` 44/0 · `seo` 56/0 · `pagina` 240/0 · `medios` 26/0 · `diagonales` 47/0 · `escena` 45/0 · `historias` 37/0 · s38, s44 y s74 sin invariantes con falla · `s77` 44/0 · `s25-contacto` 35/0; `s4-paquete` 21/0 · `s40` 38/0 · `s53` 54/0 · `s8-escena` 33/0 · `s8-montaje` 56/2 (las dos de siempre, los 300 renglones; solo se suman a su lista los archivos nuevos de `esc/ruta/`) · `s9-sentry` 22/0 con 2 fuera de ventana. Las salidas, en `C:\paginas-servicios-datos\c4\paso0\`.
- **Lo que importamos del home, igual:** 38 archivos (36 del home y 2 nuestros de `scripts-servicios/`), resueltos desde cada import de `_servicios/**` y `[servicio]/`; ninguno cambió entre `912be004` y `660a9d2f`.
- **La espera de memoria (O-10):** quedaron tres utilidades de Chrome huérfanas del banco del home (`StorageService` de los `foco-perfil` de las 07:01–07:21, sin padre, en reposo). No se tocan; la espera de esta corrida no las cuenta como arnés corriendo (sí cuenta todo lo demás del home).

### 1.2 Lo que dice la API, punto por punto

| Punto | Lo que dice | Dónde |
|---|---|---|
| **El registro de una variante** | Un módulo `'use client'` que exporta el componente como `default`; una línea en `_variantes/registro.ts` con su id y un `import()` dinámico (cada servicio agrega SU línea). El preset lleva ese id. `_lib/` nunca importa `_servicios/`: el registro es el único lugar del home que nombra a las variantes | API §4 `B12a-API.md:148-154` y `:164-168`; `_variantes/registro.ts:17-24` (`REGISTRO_DE_VARIANTES`, `IdDeVariante`, `esIdDeVariante`); la ranura lo carga en `esc/ruta/RanuraDeLaVariante.tsx:134-138` |
| **El preset de ruta y el id de la página** | `IdDePagina = 'home' \| IdDeServicio \| 'prueba'`; el preset es una constante del módulo (el mismo objeto en cada render): `{ id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante }` | API §1 `:28-68`; `esc/ruta/preset.ts:18-40`; `PresetDeLaPagina` (`esc/ruta/PresetDeLaPagina.tsx:11-14`: lo apila con `useLayoutEffect`) |
| **Cómo se monta `IntroDeLaPagina`** | `<IntroDeLaPagina titulo bajada preset />`, de servidor: el bloque de 1,5 pantallas transparente, con `data-intro-de-pagina="<preset.id>"`, `data-servicio="<preset.acento>"` y `data-seccion="invertida"` de noche; declara el preset; el `h1` (`titulo`) siempre en el DOM; la bajada, párrafos (`ParrafoDeLaBajada`), fija arriba (sticky) | API §2 `:70-99`; `_componentes/pagina/IntroDeLaPagina.tsx:16-18` (atributo y selector), `:28-48` (el bloque: el alto de 1,5 pantallas en su clase `:37`, `data-servicio` `:33`, `data-seccion` `:36`, el preset `:39`, sticky `:40`, el `h1` `:41-43`), `:51-53` (`ParrafoDeLaBajada`) |
| **`AVANCE_DE_LA_INTRO`** | `{ current: number }`, de 0 (el tope del bloque en el tope del cuadro) a 1 (1,5 pantallas después); lo escribe la lectura del scroll, medido en el layout sobre el bloque del selector; lo leen el rig y la variante (`avance` de sus props) | API §1 `:56-60`; `esc/ruta/pistaDeLaIntro.ts:26` (`PANTALLAS_DE_LA_INTRO`), `:47-50` (`avanceDeLaIntro`), `:57`; lo escribe `esc/ataduraAlScroll.ts:138-139` |
| **Los canales de luz de P-H29** | a · `luzDeAbajo(energia, color)`: la luz de abajo del piso (las juntas y el plano), con un dueño por tramo (en la intro, la ranura, mientras el avance es menor que 1 o la variante sale). b · su color: `uColorDeLaLuz` en el piso y en el plano (blanco de base). c · `energia(color)`: `uLuzNoche` de las brasas, los arcos y la red (`ENERGIA_DE_LA_RUTA`, que `PlasmaYCargas` copia mientras la ranura lo pide). f · `COMPOSICION_DE_LA_LUZ = { noche: 1, brilloDelPiso: 0,12 }`, la del avance 0, del home | API §4 `:127-146` y `:181-185`; `esc/ruta/variante.ts:29` (a), `:31` (c), `:51` (f); b: `esc/final/enElPiso.ts:245,274`, `esc/final/planoDeLaLuz.ts:45,60`, `esc/final/luzDeAbajo.ts:213`; la ranura los escribe en `RanuraDeLaVariante.tsx:183-186`; c: `esc/energia/PlasmaYCargas.tsx:96-100` |
| **`pedirLaSalidaDeLaVariante()` y la navegación** | La pide la navegación ANTES de irse y espera la promesa: `saliendo` pasa a `true`, la variante baja a la composición en `SALIDA_DE_LA_VARIANTE_MS` (420), se resuelve y recién ahí se navega. En el acto sin variante, con la escena tapada o con movimiento reducido. La navegación definitiva es `EnlaceDeRuta` (B12a.6, con el velo), nunca `router.push`; hasta entonces, el enlace interino de la página de prueba: espera la señal y vuelve a apretar el MISMO enlace | API §4 `:187-194`, §5 `:204-213`; `esc/ruta/salidaDeLaVariante.ts:13-15` (y `atenderLaSalida` `:18-23`); `variante.ts:45`; la ranura la atiende en `RanuraDeLaVariante.tsx:79-105,144-148`; el interino, `prueba-de-pagina/EnlaceConLaSalida.tsx:13-34` |
| **El preset del título 3D (P-H14)** | **No existe todavía.** Es B12a.4 (con el FRENO de la familia, `?titulo=1\|2\|3`): `_componentes/titulos3d/presets.ts` y `TituloDePagina.tsx` no están en el árbol. Hasta entonces el `h1` es el visible | API estado `:16`, §3 `:101-121`; `_componentes/titulos3d/` (solo `TituloDeVolumen.tsx`, `titular2d.ts`, `useTextoDeVolumen.ts`) |
| **El presupuesto de costo** | `PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0,5 }`: la diferencia con y sin la variante, alternadas y recién recargadas, contra el build de producción (`COSTO=1 BASE=<build> npx tsx scripts-carga/ranura.ts`). Memoria: diez idas y vueltas dejan `renderer.info.memory` como estaba | API §4 `:196-202`; `variante.ts:42`; el banco, `scripts-carga/ranura.ts:66-77,192-214` |

**Además, leído en el código:**
- La ranura se monta en `esc/ProbeStage.tsx:299`, después del final del pie (`:297`). El final del pie (con el plano de la luz) se monta solo `!reducedMotion || calidad === 'compacta'`: con movimiento reducido a 1024 o más, la luz de abajo prestada enciende las juntas pero no hay plano debajo del piso.
- El avance llega a 1 con la intro entera fuera del cuadro: de ahí en adelante la ranura suelta la luz (la del final) y el papel tapa el cuadro entero.

### 1.3 Donde la API y el V0 difieren (manda la API)

| V0 | La API | Qué se hace |
|---|---|---|
| Cuatro canales: `noche`, `brilloDelPiso`, `tinteDelPiso`, `tinteDeLaEnergia` | La variante no toca la noche (la pone el preset) ni la luz de la sala; escribe la luz de abajo (energía y color) y el color de la energía | Quedan tres canales: el brillo del piso y los dos tintes. La noche sale del preset (`noche: 'noche'`) |
| `COMPOSICION_COMPARTIDA` local (0,12) y `DURACION_DE_LA_SALIDA_MS` (420) | `COMPOSICION_DE_LA_LUZ` y `SALIDA_DE_LA_VARIANTE_MS`, del home (P-H29f y d) | Se importan; las copias se van |
| `AJUSTE_POR_CALIDAD` (el campo de la luz a la mitad en compacta) | La variante no tiene un campo propio: la luz de abajo la dibuja el piso del home, y la calidad compacta la elige el home | Se va: en el celular, la compacta del home sin nada propio |
| `presetDeWeb(pista, variante)`: la variante como componente, la intro por `[data-intro-de-servicio]`, `pista: 'home' \| keyframes` | `variante` es un id; la intro por `SELECTOR_DE_LA_INTRO`; `pista: PISTA_DE_LA_INTRO` | El preset es una constante con el id `'web'` |
| `firmas.ts`: cinco firmas copiadas con «B12a-API: reemplazar por el import» | Las firmas existen en `esc/ruta/` | `firmas.ts` se va; se importan |
| Nuestra intro: `data-intro-de-servicio`, una pantalla (`ALTO_DE_LA_INTRO`), la tapa interina, sin `data-servicio` (P-S1) | `IntroDeLaPagina`: `data-intro-de-pagina`, 1,5 pantallas, sin tapa, y con `data-servicio="<acento>"` en el bloque | Se reemplaza; P-S1 se acota: `data-servicio` solo en la intro, puesto por el home (§4) |

---

## 2. Grupo 2 — La pausa común (P-H27)

### 2.1 Lo hecho

- **`movimiento/VideoDeFondo.tsx`:** la pausa del video de trabajos es `BotonPausa` del home (`_componentes/medios/BotonPausa.tsx`), nombre «Pausar el video de trabajos» (`DE_LA_PAUSA`). Con el comportamiento del panel después de su F7 (`CLASE_DE_LA_PAUSA_DEL_PANEL`, `_secciones/trabajos/portfolio/MedioDeLaTira.tsx:17`):
  - en escala 0 y sin puntero: el mouse nunca la ve ni la toca;
  - sigue en el orden del Tab y aparece entera con `:focus-visible`;
  - el lugar es el nuestro, abajo a la derecha (`CLASE_DE_LA_PAUSA_DEL_VIDEO`: arriba la tapaba la barra fija del sitio, medido en el M3).
- **Con movimiento reducido no hay pausa** (`PausaDelVideo` devuelve nada): queda el póster, quieto, como ya hacía la capa.
- **Se borró nuestra pausa propia:** `BotonDePausa`, `ROTULO_DE_LA_PAUSA` y `siguienteDeLaPausa` (`reproduccion.ts`); la nota «P-H27: reemplazar…» se fue con ella. `s77` ya deja importarla a `_servicios/movimiento/VideoDeFondo.tsx` (`PUEDEN_IMPORTAR_LA_PAUSA`, s77 §1): no se tocó.

### 2.2 Los tests (`pagina.invariant` §10 y §12)

Reemplazados por la común del home, no aflojados; cada uno con su control:

| Antes (la nuestra) | Ahora (`BotonPausa`) | Control |
|---|---|---|
| el botón, nombre fijo, `aria-pressed`, el ícono, y que alterna (`siguienteDeLaPausa`) | el botón del home en el slot, «Pausar el video de trabajos», `aria-pressed="false"`, el ícono de pausa; que alterne lo fija s77 §1 sobre el mismo componente | la nuestra de antes; otro nombre; una página sin el botón |
| — | **sólo para el teclado:** el botón lleva TODAS las clases de comportamiento de la pausa del panel (escala 0, sin puntero, `focus-visible`) | una sin la escala 0; una que el puntero alcanza |
| abajo a la derecha | igual, sobre el botón del home | uno arriba a la derecha |
| la nota P-H27 y «no importa BotonPausa» | no queda la nuestra en ningún fuente, y el video importa `BotonPausa` | un fuente con la pausa de antes |
| — | **con movimiento reducido no hay pausa** | una pausa que ignora el reducido |
| los pedidos cumplidos: P-H18 y P-H21 | se suma P-H27 | la nota de P-H27 |

`pagina`: 240 → **244/0**.

### 2.3 En el navegador (`scripts-servicios/pausa.ts`, el Chrome del sistema a la vista, `/api/` bloqueado)

| Corrida | 1440 | 390 |
|---|---|---|
| **Rojo, con el código de antes** | FALLA: la pausa propia, sin la del home, el nombre, **con el mouse se ve (44 × 44), el puntero la toca y un clic pausa el video**, y con Tab mide 44 | ídem |
| **Verde, con el arreglo** | ok: «Pausar el video de trabajos», sin apretar; con el mouse, caja 0 × 0, el puntero no la toca y el clic en su lugar no pausa (el video sigue); con Tab, enfocada con `:focus-visible`, 48 × 48 adentro del cuadro; Enter pausa (el video se para) y Enter suelta (anda); el ícono contra el peor píxel de su disco (cinco cuadros con el video andando): **6,70:1**; sin errores ni llamadas a `/api` | ok, lo mismo; 6,70:1 |

- La primera corrida en rojo midió mal la parte del mouse: el botón quedaba debajo del borde del cuadro (y = 1013 con 900 de alto) y el puntero nunca lo alcanzaba. El banco ahora lo centra y exige que el punto esté adentro; con eso, el rojo de arriba es válido.
- **No corrieron todavía** (O-10: con el dev del home y el nuestro prendidos a la vez la memoria libre no pasa de ~2,4 GB): el control en el navegador (la hoja que la deja a la vista y con puntero: tiene que dar FALLA) y la corrida con movimiento reducido (`REDUCIDO=1`: sin botón, sin `<video>`, el póster). Los dos los cubre el test en el marcado (§2.2).

### 2.4 El gate

lint de los archivos tocados: 0 · tsc: 0 · los tests de servicios y los 6 barridos, iguales a la base del Paso 0 salvo `pagina` (244/0) · `s77` 44/0. Las salidas, en `C:\paginas-servicios-datos\v1\gate-g2\`.
