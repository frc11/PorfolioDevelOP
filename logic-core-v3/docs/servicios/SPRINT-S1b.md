# SPRINT S1b — Template, bloques y ruta de /v3/paginas-web + medición de la escena

Versión 2 · 2026-10-17 · Autor: CC (S1b) · Plan: `docs/servicios/SPRINT-S0.md` v2 (§3, §4, §7, §8, §10 y §12) · Contenido: `docs/servicios/SPEC.md` §5 y §7 · Pendiente heredado: `docs/servicios/SPRINT-S1a.md` §7.

**Estado en una línea:** el template y la ruta de Páginas web están hechos y commiteados (`09c7b7ff`, pusheado). Después hubo un cambio de plan (§1) y se hicieron la pasada de vidrio y revelados, la lógica de los slots de S2 y las piezas de S3 (JSON-LD, metadata, FAQ): **commiteado en un segundo commit «S1c-S2-S3 sin publicar» (hash en §2.2) para proteger el trabajo, SIN VER EN PANTALLA y sin aprobación**. `PUBLICADOS` sigue con `paginas-web`. El dev server y el navegador están apagados y el candado liberado: **la pasada visual de la versión nueva está pendiente** (§8).

---

## 0. Cambios del contrato v2 (reemplazan a D5 del plan)

Llegaron con el prompt del S1b ya pegado: el home publicó la v2 del contrato. Pisan lo que diga el prompt y el plan.

| # | Qué cambia | Cómo queda en el S1b |
|---|---|---|
| **P-S1** | `data-servicio` sale. | El CTA lleva **solo** `data-abre-contacto="panel"` y `data-precarga={idEnElHome}`. `data-servicio` queda **prohibido en toda la página** (es el contexto del acento del tema, con otro vocabulario). Reemplaza a D5. El acento llega solo por la custom property `--color-acento` en la raíz. |
| **P-S2** | Candado compartido `C:\develop-pesado.lock`. | Antes de cada proceso pesado (tsc completo, dev server, `verificar`, build): si existe y tiene menos de 3 h, se espera revisando cada 2 min hasta 20 min; si no existe o es viejo, se escribe con «servicios», la tarea y la hora; después, 3 GB libres o más. Se borra al terminar. El dev server lo retiene mientras esté prendido. |
| **P-S3** | La escena sale como tabla para el LOG. | Va en §6: métrica · `/v3/paginas-web` · `/v3/tipografia`, a 1280 y a 390. Son el «antes» de P-H4. |
| **P-H4 y P-H6** | Ya aceptados para el sprint P-H del home. | La tapa queda como red de seguridad. En 390 se anota cómo abre el modal (§9); no hace falta abrir pedido. |

El candado es un **directorio** (`C:\develop-pesado.lock\` con un `candado.txt` adentro: `worktree`, `tarea`, `hora`). Crearlo es atómico, así que se toma con `mkdir`. Servicios usa la misma forma.

**Algo pesado que corrió sin candado:** el tsc completo del Paso 0 (≈18:32, 18 s, con 4,6 GB libres y el pool no paginado en 608 MB) corrió **antes de recibir P-S2** y coincidió con el `verificar` del home, que había arrancado a las 18:31: hubo dos procesos pesados a la vez entre los dos worktrees. Antes de lanzarlo miré los procesos por línea de comando y no vi ninguno pesado (el `verificar` recién arrancaba y no estaba entre los 15 de más memoria). Sin consecuencias: terminó en 0 errores. Desde ahí, todo proceso pesado fue con candado (el tsc del gate y el dev server).

---

## 1. Lo que cambió después del commit

Tres mensajes de Valentino, en este orden. Cada uno pisa al anterior donde choca.

1. **«Soltá el candado ya»:** commitear lo que estuviera en verde (`09c7b7ff`, con push sin force), apagar el dev de :3001, cerrar `chrome-devtools-mcp` y borrar el candado. Hecho. El árbol de procesos del dev (npm → next → start-server) y el del MCP (con su Chrome) se terminaron por PID. Al cerrar el MCP, las herramientas `mcp__chrome-devtools__*` quedaron desconectadas en esta sesión.
2. **«Cambio de plan»:** B12 (la escena por ruta) pasa a después de B1.3. Mientras tanto la pasada visual sí va, **con el lenguaje del home**: los componentes de tipografía, `Cta`, los patrones de revelado de `_lib/motion` (se importan, no se tocan) y paneles de vidrio como los del Portfolio. Las secciones van **transparentes, sin fondos opacos propios**: la tapa interina es lo único opaco y se va con B12. El dev server y el navegador, solo con el candado y cediendo al home mientras cierra B1.2b.
3. Mientras el home tiene prioridad, solo trabajo sin navegador: S2 (datos y lógica de los slots `proyecto` y `planes`), de S3 (JSON-LD, metadata y el marcado accesible del FAQ), tests con `npx tsx`, y este LOG.

**`CIERRE-HOME-V3.md` v5 no la pude releer.** Vive en el proyecto de Claude (`claude/CIERRE-HOME-V3.md`, según SPEC §1), y CC no ve esos archivos: la busqué en los cuatro worktrees, en el historial de git de todas las ramas y en las carpetas del usuario, y no está en el disco. Seguí con lo que el mensaje fija. Si la v5 dice algo más que me toque (el orden de B12 y B1.3, por ejemplo), hay que pegármelo o volcarlo a un `.md` en este worktree, como pide el SPEC.

---

## 2. Qué quedó hecho

### 2.1 Commiteado (`09c7b7ff`, pusheado a `origin/paginas/servicios`)

Template, bloques, ruta y `pagina.invariant.tsx`, con el CTA ya sin `data-servicio`. Detalle en §3.

### 2.2 El segundo commit: vidrio, S2 y S3 — SIN VER EN PANTALLA

Valentino mandó commitearlo **para proteger el trabajo; no es una aprobación**: ni el vidrio ni los slots nuevos ni el JSON-LD se vieron en un navegador (el candado lo tenía el home y el MCP estaba cerrado). `PUBLICADOS` sigue con `paginas-web`. Un solo commit, porque partirlo dejaría commits que no compilan. **Hash: `113d52ef`** («S1c-S2-S3 sin publicar: vidrio del home, slots de precio y SEO», 26 archivos, pusheado sin force), anotado en un tercer commit que solo toca este archivo (un commit no puede llevar su propio hash). **SIN VER EN PANTALLA. Sin aprobación.**


| Qué | Archivos |
|---|---|
| **Pasada visual con el lenguaje del home** | `vidrio.ts`, `movimiento/Revelado.tsx`, `movimiento/TitularQueEntra.tsx`, `bloques/PanelDeVidrio.tsx`; cambios en `bloques/Bloque.tsx`, `Problema.tsx`, `Cierre.tsx`, `PaginaDeServicio.tsx` y `[servicio]/page.tsx` (la compuerta de la coreografía). |
| **S2 · slots `proyecto` y `planes`** | `bloques/precio/vistaDelPrecioPorProyecto.ts`, `vistaDeLosPlanes.ts` (la lógica, sin markup), `Proyecto.tsx`, `Planes.tsx`, `rotulos.ts`; `Precio.tsx` con las tres ramas; `formato.ts` suma `numero()`; `__tests__/slots.invariant.ts`. `PUBLICADOS` **no cambia**: las otras dos páginas siguen en 404. |
| **S3 · SEO y FAQ** | `seo.ts` (`metadataDe`, `jsonLdDe`, `serializarJsonLd`), `JsonLd.tsx`, `rutas.ts` (`ORIGEN_DEL_SITIO` y `urlAbsolutaDe`), `bloques/Faq.tsx` (lista de `<details>`), `__tests__/seo.invariant.ts`. `page.tsx` arma la metadata con `metadataDe`. |
| **Tests** | `pagina.invariant.tsx` ampliado (108 afirmaciones) y `pagina-detectores.ts`. |

---

## 3. El template (lo commiteado, con lo que cambió encima)

```
src/app/v3/[servicio]/page.tsx          ruta: generateStaticParams desde PUBLICADOS, dynamicParams = false, notFound(), metadata, compuerta, Contacto hermano
src/app/v3/_servicios/PaginaDeServicio.tsx   raíz invertida, tapa, JSON-LD, encabezado, main con los bloques, cierre
src/app/v3/_servicios/Encabezado.tsx    un enlace al home con el logotipo (D4)
src/app/v3/_servicios/estiloDelAcento.ts   la custom property del acento y el estilo del CTA
src/app/v3/_servicios/vidrio.ts         el vidrio del Portfolio, una vez
src/app/v3/_servicios/seo.ts · JsonLd.tsx
src/app/v3/_servicios/movimiento/       Revelado.tsx y TitularQueEntra.tsx (los dos únicos archivos de cliente)
src/app/v3/_servicios/bloques/          Bloque, PanelDeVidrio, Problema, QueHacemos, QueIncluye, Precio, Extra, Proceso, Prueba, Faq, Llamado, DelBlog, Cierre
src/app/v3/_servicios/bloques/precio/   Calibres, Proyecto, Planes, rotulos.ts y las dos vistas (lógica pura)
src/app/v3/_servicios/__tests__/        datos, precios, slots, seo, pagina (+ pagina-detectores.ts)
```

**Archivos que el plan no listaba, y por qué:** `estiloDelAcento.ts` (un solo lugar para el acento y su tipo, sin cast); `Encabezado.tsx` (D4 pide el enlace al home y no tenía dueño); `bloques/Bloque.tsx` y `PanelDeVidrio.tsx` (la caja que comparten los bloques, para no repetirla once veces); `vidrio.ts` (el estilo del Portfolio no se puede importar: vive en un archivo de cliente); `movimiento/*` (el contrato del revelado recibe funciones como hijo y una función no cruza desde un componente de servidor); `bloques/precio/rotulos.ts` y las dos vistas (lógica del S2 separada del markup); `JsonLd.tsx` y `seo.ts` (S3); `pagina-detectores.ts` (los detectores de los tests, para que el invariante se lea de arriba abajo y cada control reuse el mismo detector).

**Reglas que sostiene el template, con su test:** un solo `h1` con el problema; los bloques en el orden de SPEC §5 (Del blog no se monta sin `href`); el CTA con `data-abre-contacto` y `data-precarga`, y ningún `data-servicio` en ninguna parte; `[a definir]` solo en desarrollo; ningún id del home ni atributo de la escena, y un solo `data-seccion` (`invertida`, en la raíz); el único hex es el del acento; de `PROYECTOS` salen nombre, rubro, dirección y póster, **nunca** reseña ni lo resuelto; ninguna cifra escrita en el JSX; todo apila por debajo de 1024; toda clase arbitraria lee un token con `var()`; los enlaces son `<a href>` (ni `next/link` ni router). Todo con su control positivo.

---

## 4. La pasada de vidrio y revelados (commiteada, SIN VER EN PANTALLA)

Hecha **sin navegador**: el candado lo tenía el home (B1.2b) y el MCP estaba cerrado. Lo que sí está comprobado son las propiedades del marcado, con tests.

- **Las secciones son transparentes.** La raíz ya no pinta fondo y ninguna sección lo hace. Lo único opaco de la página es la tapa interina (`fixed`, `-z-10`, `bg-fondo`), que se va con B12. Lo afirma el test («lo único opaco de cada página es la tapa»), con control.
- **Los paneles son de vidrio como los del Portfolio.** Cada bloque con contenido (todos menos el problema, que va directo sobre el fondo) es un panel con la misma fórmula de `ESTILO_DEL_VIDRIO` de `portfolio/Tira.tsx`: tinta al 4 %, desenfoque de 20 px, saturación del 180 %, filete de tinta al 10 %. El test lee el fuente de `Tira.tsx` y exige los mismos números, así que si el Portfolio cambia, el test avisa.
- **Los revelados son los del home, importados.** El contrato de secciones (`Bloque` y los canales de `_secciones/_contrato`): cada panel entra entero con P2 sobre la ventana visible, y los títulos y la bajada entran por línea con el canal del texto (T1). Sin coreografía (SSR, abajo de 1024, movimiento reducido) todo sale quieto y en su lugar. La página se monta dentro de `CompuertaDelHome`, como `v3/page.tsx`.
- **Lo único de cliente** son los dos envoltorios de `movimiento/`; el contenido cruza ya renderizado, así que los bloques siguen siendo de servidor. El test fija la lista exacta de archivos de cliente.
- **Nada de `_lib/motion` ni de `_secciones` se tocó.** Los seis barridos y los padrones del home dan las mismas cifras que la base.

**Qué hay que mirar cuando se pueda (no lo vi):** que el vidrio se lea sobre la tapa (es un tinte del 4 % sobre un fondo plano: casi no se va a notar hasta B12), el ancho de las tarjetas de «Prueba» (a 1280 quedan de ≈230 px dentro del panel), el `-ml-2` del CTA dentro del panel, los revelados al scrollear (y que no dejen texto invisible al recargar a mitad de página), y el contraste del texto sobre el vidrio.

---

## 5. Gate

| Chequeo | Resultado |
|---|---|
| Lint (`eslint.cmd` sobre `_servicios/` y `[servicio]/page.tsx`) | Limpio, código 0. |
| tsc completo | **0 errores**, código 0, 12 s, **con candado** (incremental; el `tsbuildinfo` lista los 29 archivos de `_servicios/` y la ruta). Corrió antes de la pasada de vidrio, S2 y S3; después de ellas solo corrió el tsc acotado a lo tocado (más un archivo que importa r3f, para que el JSX de la escena tipe): **0 errores**. El completo queda para la próxima ventana con candado. |
| Tests propios | `datos` 48/0 · `precios` 22/0 · `slots` 34/0 · `seo` 50/0 · `pagina` 108/0. Todos con sus controles positivos detectando. |
| Los 6 barridos de §5.1 | `s8-montaje` 56 y **las mismas 2 fallas de la base** (la lista de archivos de más de 300 líneas, ninguno nuestro); `s8-escena` 33/0; `s40-3d-sonido` 38/0; `s53-pulido-2` 54/0; `s9-sentry` 22/0 (2 fuera de ventana, como en la base); `s4-paquete` 21/0. |
| Padrones extra | `s4-cobertura` 19 y **la misma falla de la base**; `s3-tokens` 29/0; `s3-codigo` 18/0; `s7-contrato` 31/0; `s10-acceso` 74/0; `s6-lane` 44/0. |
| Tamaño | Ningún archivo de `_servicios/` pasa las 300 líneas (el más largo, `datos.invariant.ts`, 273). |
| Clases arbitrarias en la prosa | Ninguna deletreada en comentarios ni en docs. |

`verificar` y el build no se corrieron (son del S4, y el home tiene prioridad).

---

## 6. La escena en la subruta: números para P-H4 (el «antes»)

**Cómo se midió.** Dev server en :3001 (Next 16.2.9, webpack), Chrome por `chrome-devtools`, pantalla de **75 Hz** (por eso 75 fps es el techo y 13,3 ms el cuadro). Pestaña visible y con foco, `innerWidth` verificado en cada carga. 1280×800 con DPR 1; 390×844 con DPR 2, móvil y táctil. Un contador de `requestAnimationFrame` desde el inicio del documento y un `PerformanceObserver('longtask')`. «Quieto» = 10 s sin tocar nada; «bajando» = 10 s con un scroll por `scrollBy` a velocidad constante (la herramienta no repite teclas: es la salvedad del punto 4 de la receta). Sin capturas en el medio.

### 6.1 La tabla

| Métrica | `/v3/paginas-web` · 1280 | `/v3/tipografia` · 1280 | `/v3/paginas-web` · 390 | `/v3/tipografia` · 390 |
|---|---|---|---|---|
| **Consola** | 0 errores · 1 aviso (WebGL, ver nota 1) · 1 issue (nota 2) | no se leyó | 0 errores · 0 avisos · 1 issue (nota 2) | 4 errores de CSP «report-only» de sus iframes (nota 3) · 1 issue |
| **NaN** (`?diag=carga`) | 7 números, **0 no finitos** · `cargaLista` false · fallas `[]` | 7 · **0** · false · `[]` | 5 · **0** · false · `[]` · `lenis: null` | no se corrió |
| **FPS quieto** (p50 / p95 / máx del cuadro) | **75 fps** · 13,3 / 13,4 / 14 ms | 72,6 fps · 13,3 / 13,4 / **80** ms | **75 fps** · 13,3 / 13,4 / 14 ms | 75 fps · 13,3 / 13,6 / 14 ms (nota 4) |
| **FPS bajando** | **75 fps** · 13,3 / 13,8 / 14 ms (328 px/s) | 74,8 fps · 13,3 / 13,4 / 40 ms (33 px/s: la página mide 1128) | **75 fps** · 13,3 / 13,5 / 14 ms (543 px/s) | 74,2 fps · 13,3 / 13,4 / 67 ms |
| **Tareas largas** (en esos 20 s) | **0** | 0 | **0** | 0 |
| **Tareas largas de la carga** (dev) | 14 tareas, suma 8,7 s | 24, suma 8,3 s | 12, suma 9,2 s (una de 5,7 s); en una **segunda** carga: 11, suma 2,4 s | 39, suma 11,1 s |
| **CPU del hilo principal** (trace de 15 s) | **24,1 % ocupado**, 75,9 % ocioso · `cajasDelTexto` 25 ms inclusivo (0,16 %), 4 ms propio | trace de 573 MB: no se parseó (nota 5) | no se tomó | no se tomó |
| **Heap de JS** (entrada → +20 s → 5 min) | 286,2 → 220 → **194,9 MB** | 1249,5 → 574,9 → 576,1 MB (a 2,3 min) | 255,9 → 199 → **169,7 MB** | 502,8 → 754,3 → 757,8 MB |
| **Pool no paginado** (antes → después) | 739,9 → **740,3 MB** (+0,4, a ≈5 min) | 728,9 → 741,4 MB (+12,5) | 743,3 → **747,1 MB** (+3,8, a ≈5 min) | no se midió |
| **Gesto al fondo** | **no hay retención** (nota 6) | igual | **no hay retención**: nunca prevenido | — |
| **Documento** | 4081 px · 1 canvas · 312 nodos | 1128 px · 1 canvas + 4 iframes (5 escenas) | 6271 px · `scrollWidth` 390 · 0 elementos fuera de la pantalla | 1276 px · 4 iframes |

Control B, **una sola escena** (`/v3/tipografia/muestra`, el mismo patrón de panel opaco sobre la escena): 1280, quieto 75 fps · 13,3 / 13,7 / 14 ms, 0 tareas largas, 13 tareas de carga (3,1 s). 390, quieto 74,8 fps · 13,3 / 13,7 / 40 ms, 0 tareas largas, 11 tareas de carga (2,6 s). Su heap quedó contaminado por la página anterior y no se informa.

Memoria del sistema: con el dev server solo, 3,1–3,5 GB resident; con el dev y Chrome sobre la página, **1,5–1,7 GB libres** (de 13,9); con la tipografía abierta y un trace de 573 MB se bajó a **0,64 GB** (el servidor del MCP llegó a 2,4 GB parseando el trace y hubo que dejar la página para recuperar memoria).

### 6.2 Las notas

1. **Aviso de WebGL:** `THREE.WebGLProgram` con avisos de HLSL (`X4122` y `X4008`, «floating point division by zero») de un shader de la escena (`_lib/escena/estudio.ts:75`). Sale igual en la tipografía y no sale a 390 (otra calidad). Es de la escena del home, no de la página.
2. **Issue de Chrome «Lazy-loaded images should have explicit dimensions» (×3).** Los pósters tienen `width`, `height` y `aspect-ratio` computado, y el CLS del trace es 0,00. Probé inyectar una imagen perezosa con atributos y sin CSS y también la marca: **no es accionable** desde la página.
3. **Los 4 errores de CSP de la tipografía** son de sus propios iframes (`frame-ancestors 'none'` en modo report-only); no aparecen en `/v3/paginas-web`.
4. A 390 la primera ventana «quieto» de la tipografía salió contaminada por la carga (un cuadro de 7,6 s: cuatro iframes con su escena cada uno); la que se informa es la repetida con la página asentada.
5. **El control no es parejo, y conviene decirlo para el LOG:** `/v3/tipografia` embebe **cuatro iframes** de `/v3/tipografia/muestra` (de 373, 858, 1438 y 1918 px) y cada uno monta su propia escena: son **cinco escenas** en un proceso. Por eso su heap triplica al de una página común. El control parejo es `/v3/tipografia/muestra`.
6. **El gesto.** El criterio de la receta (un `WheelEvent` hacia arriba, `defaultPrevented` = el final retiene el gesto) **no discrimina en 1280**: Lenis cancela *todo* `wheel`, así que da «prevenido» desde ≈2,4 s de la carga **también arriba de todo** (lo comprobé con un control: en el tope, prevenido). El discriminador que sí sirve son dos:
   - **El desplazamiento.** Con Lenis prendido, cada gesto hacia arriba movió la página 120 px (3281 → 3161 → 3041) en cinco instantes entre 2,4 s y 11,4 s: ninguno quedó retenido.
   - **Lenis apagado** (`prefers-reduced-motion: reduce`). Siete intentos entre 1,9 s y 4,3 s de la carga, parado al fondo: **todos sin prevenir**.
   - Antes de ≈2,4 s no hay nadie escuchando (ni Lenis ni el final): el evento no se previene y no mueve nada. **No pude pegarle a la carrera** que describe el S0 (el final arrancando antes de que `PieDeVolumen` baje `pieEntero`); en esta página, `PieDeVolumen` no arma piezas. A 390 no hay Lenis y el criterio de la receta sí vale: nunca prevenido, ni al fondo ni arriba.
7. **Heap y pool:** sin crecimiento a la escala de minutos (el heap de la página baja con el GC y el pool se mueve en MB).
8. **Costo de la escena (el dato para P-H4):** a 1280, en reposo, el hilo principal está **24 % ocupado** (3,68 s de 15,26 s), casi todo el lazo de la escena (`lazo` 881 ms, `entreEllas` 550 ms, `ruidoConGradienteEn` 186 ms). `cajasDelTexto`, la lectura del texto de la página que anticipaba el S0, **cuesta 25 ms en 15 s**: no es el problema, aunque la página sea larga. Y es el mismo costo en una página «vacía» (control B): la escena no sabe de qué página es.

### 6.3 Estados HTTP (dev, `curl`)

| URL | Estado | Primera vez |
|---|---|---|
| `/v3/paginas-web` | **200** | 51 s (compila) |
| `/v3/software-a-medida` | **404** | 11,3 s |
| `/v3/ia-y-automatizaciones` | **404** | 0,1 s |
| `/v3/xyz` | **404** | 0,07 s |
| `/v3/componentes` | **200** | 2 s |

El log del dev muestra `generate-params` en la línea de `/v3/paginas-web`: la ruta (A) con `generateStaticParams` anda en Next 16 con webpack.

El `<head>` servido de `/v3/paginas-web`: `title` «Páginas web · develOP», `description` de los datos, `robots: noindex, nofollow, nocache`, `canonical` `https://develop.com.ar/v3/paginas-web` y `og:url`/`og:title`/`og:description` propios, con `og:image` heredada del padre. **No se pisó `twitter:*`**: conserva el título y la descripción del home (queda para el S3 completo).

---

## 7. La pasada visual de la PRIMERA versión (anterior al vidrio)

Con el formato ✅/⚠️/❌/❓. Describe el template claro de `09c7b7ff`: la estructura, el desborde, el foco y los contenidos siguen valiendo; los fondos y las tarjetas cambiaron en §4.

**1280×800**
- ✅ Encabezado con el logotipo; marca de relleno en el acento y nombre del servicio; `h1` «¿Te buscan y no te encuentran?» en una línea; bajada en gris.
- ✅ «Construimos tu presencia, bloque por bloque» (título a la izquierda en tres líneas, párrafo a la derecha), «Qué incluye» y «Va aparte», «Precio» (tres calibres en tres columnas, con «Desde» y el USD en el acento; «AUTOGESTIONABLE: [A DEFINIR]» solo en desarrollo), «Mantenimiento», «Proceso y plazos» (01–05 y el plazo), «Prueba» (tres pósters con nombre, rubro, texto y enlace), FAQ, llamado y cierre.
- ✅ Sin scroll horizontal (`scrollWidth` 1280). Foco visible en el primer Tab: anillo de 2 px sólido en el papel, con desplazamiento de 2 px.
- ⚠️ El rótulo del CTA quedaba 8 px adentro del texto de arriba (el padding del botón del home). **Corregido** con un margen negativo en el envoltorio; medido después: 442,7 y 442,7 px.
- ⚠️ Los pósters quedan de 247 px de ancho (tres columnas en 8/12). Chicos pero legibles.

**390×844**
- ✅ Todo apila. `scrollWidth` 390 y **ningún elemento** se sale de la pantalla. Precio, Mantenimiento, Proceso, FAQ, llamado y cierre, legibles.
- ❌ **El póster móvil de El Garage está roto en el asset, no en el template.** `public/portfolio/el-garage/movil.webp` (780×1688) trae la captura solo en el cuarto superior izquierdo (390×844) y el resto en gris plano. Los de Esquina y Banú están bien. Lo abrí suelto en el navegador para descartar la página. Es de B1.1a; **pedido nuevo al home (§9, P-H11)**. ❓ No miré si el `movil.mp4` de El Garage tiene el mismo defecto: si el póster es su primer cuadro, probablemente.
- ❓ **Una vez** (de cuatro), al cerrar el modal a 1280, la página quedó en `scrollY` 1 en vez de volver donde estaba. No se reprodujo en las tres repeticiones siguientes, ni por clic real ni sintético, ni desde el fondo. Puede haber sido un reinicio del dev por la carga perezosa del formulario; queda anotado, no lo atribuyo a nada.

**404:** `/v3/software-a-medida` muestra la página de «404 · Página no encontrada» del sitio vivo («Este rincón del internet no existe todavía»), con su estética y sin el chrome de /v3. Su `title` es el del home (`noindex`). El 404 con la estética del home es del S3.

**Árbol de accesibilidad** (snapshot): `banner` con el enlace al home, `main` con una región por bloque nombrada por su título, headings `h1` → `h2` → `h3` sin saltos, el FAQ como `DisclosureTriangle`, `contentinfo` con el CTA y la navegación «Más de develOP». Las listas llevan `role="list"`.

---

## 8. Qué falta ver en pantalla (con el candado y el navegador)

Todo lo de §4, más los slots nuevos. Para retomarlo hace falta: (1) el candado libre y el home cediendo; (2) `chrome-devtools-mcp` conectado de nuevo (lo cerré a pedido: hay que reconectarlo, por ejemplo con `/mcp`); (3) `npm run dev -- -p 3001` con el log en `C:\paginas-servicios-datos\dev-S1b.log`. Después: la pasada a 1280 y 390 de la versión con vidrio; modal otra vez (el contenedor del CTA ahora está dentro de un panel con transformada); y, como `PUBLICADOS` sigue en una sola página, para ver los slots de software e IA hay que publicarlos (S2) o renderizarlos a mano.

---

## 9. Pedidos al home

| Id | Estado | Qué se midió |
|---|---|---|
| **P-H4** (pausar o no montar la escena fuera del home) | Aceptado. Números en §6. | 75 fps y 0 tareas largas en reposo y bajando, a 1280 y a 390; la escena ocupa el **24 %** del hilo principal en reposo; heap y pool estables. El costo que paga una página de servicio es el de la escena entera, tapada. |
| **P-H6** (el modo del contacto sin la barra) | Aceptado, sin pedido nuevo. | A **390** el modal abre como la placa de escritorio: una hoja de **326×726 px** a 59 px del borde de arriba y 32 de cada lado, que **entra** en 390×844 y se puede usar (el contenido scrollea adentro). «Una página web» sale marcada. El foco inicial va al enlace del mail. A 1280 es una placa de 944×619 centrada. |
| **P-H10** (el foco vuelve al botón al cerrar) | **Confirmado: el foco se pierde.** | Con Escape, en 1280 y en 390, `document.activeElement` queda en **`BODY`**. El disparador que el contacto recuerda es el envoltorio `div` (`closest('[data-abre-contacto]')`), y `focus()` sobre un `div` sin `tabindex` no hace nada. Pasa igual en el `CtaDelServicio` del home. Salidas: que el home recuerde el botón (o el primer elemento enfocable adentro), que `CtaEnlace` acepte `data-precarga`, o un `tabindex="-1"` en el envoltorio. Servicios no la tomó por su cuenta: taparía la evidencia. |
| **P-H9** (medidas de los pósters) | Abierto. | La relación de aspecto está declarada una sola vez en `Prueba.tsx` (1440×900 de escritorio, 780×1688 de móvil); los tres pósters de escritorio son 16:10 y los móviles, la misma relación. |
| **P-H2** (los claros del acento en el tema) | Abierto. | El único hex de la página es `--color-acento` en la raíz, con el `claro` de cada archivo de datos. |
| **P-H7** (scripts de los tests en `package.json`) | Abierto. | Los cinco tests de servicios se corren a mano con `npx tsx`. |
| **P-H11** (nuevo, id propuesto) | **Abierto.** | `public/portfolio/el-garage/movil.webp` está mal exportado (la captura en el cuarto superior izquierdo, el resto gris). Revisar también `movil.mp4`. |
| **P-H12** (nuevo, id propuesto) | Abierto. | `twitter:*` hereda del layout raíz el título y la descripción del home. Hay que pisarlo igual que `openGraph` (S3). |

---

## 10. Decisiones de CC (a revisar)

1. **`PUBLICADOS` no cambia.** El S2 «pasa los tres», pero Valentino pidió solo la lógica y los datos de los slots. La lógica y los componentes están; la ruta sigue publicando una sola página.
2. **El vidrio es el del Portfolio, repetido una vez** (`vidrio.ts`), en línea, porque no son tokens. No se usa `data-material="vidrio"` del home (el vidrio líquido del menú y del pie, otra receta) ni se importa `ESTILO_DEL_VIDRIO` (viene de un archivo de cliente).
3. **El revelado es P2 sobre la ventana visible** (`rango: ventana-visible`) para los paneles y el canal del texto T1 para los títulos y la bajada del problema. El resto del contenido no se anima.
4. **La tabla de planes es una `<table>` de verdad** con `th scope`, un título solo para lectores de pantalla y una caja que scrollea por debajo de 1024, con `role="region"`, nombre y `tabindex="0"`.
5. **La fila de funcionalidades de los planes no se publica si falta el dato en uno solo de los planes**: una comparación a medias es peor que ninguna.
6. **JSON-LD:** un `<script>` por documento (`Service`, `FAQPage` y `BreadcrumbList`), con el «desde» como `priceSpecification` mínima (`minPrice`, en USD; `UnitPriceSpecification` con `unitCode` mensual en IA) tomado de `precioDesde`. La migas dicen «Inicio» (`// C2: provisorio`). Las URLs son absolutas sobre `ORIGEN_DEL_SITIO`, que un test compara con el `metadataBase` del layout raíz.
7. **El FAQ es una lista (`ul` con `role="list"`) de `<details>`.** Sin `aria-expanded`, `tabindex` ni manejadores propios.
8. **Los envoltorios de `movimiento/` son de cliente** y son los únicos: el contrato de revelado del home recibe una función como hijo.
9. **Los títulos de los bloques son los nombres de SPEC §5** (D10), todos `// C2: provisorio`.
10. **Un nombre de archivo no puede repetirse sin contar mayúsculas ni extensión.** Con `Planes.tsx` y `planes.ts` en la misma carpeta, en Windows el import `./precio/Planes` resolvió al `.ts` y el componente llegó `undefined`: las dos vistas se llaman ahora `vistaDeLosPlanes.ts` y `vistaDelPrecioPorProyecto.ts`, y un test lo vigila.

---

## 11. Para el S2, el S3 y los próximos

- **S2 (publicar):** cambiar `PUBLICADOS` a los tres y mirar `software-a-medida` e `ia-y-automatizaciones` en escritorio y a 390 (hoy solo están probados por tests). Falta decidir la salida de los casos propios de software sin texto (hoy no se montan en producción, y el bloque queda con su nota).
- **S3:** las migas visibles, el 404 con la estética del home, el `twitter:*`, la medición del contraste con los colores computados, el foco al cerrar el modal (P-H10) y la pasada por debajo de 1024 en 375, 390, 768, 860 y 1023.
- **Con el candado:** tsc completo de lo nuevo, la pasada visual de §8 y, si el home lo pide, `verificar`.
- **El helper del candado** (`candado.ps1`) vive en el scratchpad de la sesión, no en el repo; se toma con `mkdir` y se escribe `candado.txt` sin BOM.
