# MERGE-1 — Verificación del merge de B1.2b en la rama de servicios

Versión 1 · 2026-10-17 · Autor: CC (merge-1) · Viene de: `docs/servicios/SPRINT-S2c.md`. El merge lo hizo Valentino; acá solo se verifica, sin tocar git ni el código.

**Estado en una línea:** el merge `c659d1eb` (los tres commits de B1.2b del home) entró limpio y no tocó nada del carril; tsc da 0 errores, `datos`, `precios`, `slots` y `seo` y los seis barridos dan lo mismo que antes del merge, lo que servicios importa del home sigue igual (salvo el `logo` que B1.2b suma a `PROYECTOS`, que no se usa) y el póster móvil de El Garage se ve entero a 390. **Una falla trajo el merge:** `pagina.invariant.tsx:298` (143 afirmaciones, 1 falla). El test busca el vidrio del Portfolio en `Tira.tsx` y B1.2b lo movió a `EscenarioDelPortfolio.tsx`; los números del vidrio son los mismos. No se arregló (§4).

---

## 1. Qué trajo el merge

- `HEAD` es `c659d1eb` «Merge branch 'rediseno/home' into paginas/servicios», con padres `554a9b5b` (el S2c) y `490762c0` (B1.2b 3/3). `origin/paginas/servicios` ya apunta a él y la rama no va adelantada.
- Entraron tres commits del home: `41f91e58` (B1.2b 1/2), `92a01b2c` (2/3) y `490762c0` (3/3). En total 64 archivos, +1699 −764 (merge-base `54655181`): 52 en `src/app` (Portfolio, escena, títulos 3D, diagnóstico y sus tests), 5 en `public/portfolio`, 2 en `docs/rediseno` y 5 scripts.
- **Sin conflictos:** ningún archivo difiere de los dos padres (`git show --cc` y `git diff-tree -c` vacíos).
- **El carril no se tocó:** la diferencia entre `554a9b5b` y `HEAD` sobre `src/app/v3/_servicios/`, `src/app/v3/[servicio]/` y `docs/servicios/` es vacía.
- `git status --short` antes y después de todo lo hecho acá: solo `SPEC.md` y `CONTRATO.md` sin trackear.

---

## 2. Gate

| Paso | Ahora | Antes del merge (S2c) |
|---|---|---|
| **tsc completo** (`tsc --noEmit`, incremental) | **0 errores** (16 s) | 0 |
| `datos` | 48 / 0 | 48 / 0 |
| `precios` | 22 / 0 | 22 / 0 |
| `slots` | 44 / 0 | 44 / 0 |
| `seo` | 56 / 0 | 56 / 0 |
| `pagina` | 143 / **1 falla** (§4) | 143 / 0 |
| `s4-paquete` | 21 / 0 | 21 / 0 |
| `s8-montaje` | 56 / 2 | 56 / 2 |
| `s8-escena` | 33 / 0 | 33 / 0 |
| `s9-sentry` | 22 / 0 (2 fuera de ventana) | igual |
| `s40-3d-sonido` | 38 / 0 | 38 / 0 |
| `s53-pulido-2` | 54 / 0 | 54 / 0 |

- **Controles positivos:** en `datos` 15, `precios` 8, `slots` 8, `seo` 10 y `pagina` 64, todos imprimen `ok`. **Uno de los 64 pasa en vacío:** el de `pagina.invariant.tsx:299`, ver §4.
- **Barridos contra la salida del S2c** (la corrida con el código de `554a9b5b`, comparada línea por línea): `s8-escena`, `s9-sentry`, `s40-3d-sonido` y `s53-pulido-2` salen idénticos. `s4-paquete` difiere en una línea (el escáner recorre 4028 archivos de texto en vez de 4026). `s8-montaje` difiere en conteos y nombres del home: **las mismas dos fallas y los mismos seis archivos** (`s32-escena7`, `s34-calidad1`, `EscenaDelCta`, `cuadroDelFinal`, `recorridoDelFinal`, `armadas`; ninguno de `_servicios`), con el universo de 367 a 366 archivos porque el home borró `SignoDeLaTuya.tsx` y `tunelEnLaEscena.ts` y sumó `poseDelPortfolio.ts`; `OrbitRig.tsx` (del home, fuera de la falla) pasa de 383 a 384 líneas de código.
- **Cómo se corrió:** `npx tsx` sobre cada invariante (los de servicios en `src/app/v3/_servicios/__tests__/`, los barridos con la ruta de su script `test:` del `package.json`), la salida a archivos en `C:\paginas-servicios-datos\merge1\`. Sin candado (terminado, contrato v3 O-3): memoria libre mirada antes de cada pesado, uno por vez; nada murió y no hubo reintentos.

---

## 3. Lo que servicios importa del home

Se resolvió cada import del carril contra el disco (`C:\paginas-servicios-datos\merge1-imports.txt`: 20 archivos del home) y cada destino se comparó entre `554a9b5b` y `HEAD`.

| Lo que servicios toma | Dónde lo usa | ¿Cambió? |
|---|---|---|
| `PROYECTOS`: `slug`, `nombre`, `rubro`, `url`, `medios.poster`, `alt` | `datos/fuenteDeProyectos.ts:10` → `bloques/Prueba.tsx:51-58`; el origen es `_secciones/trabajos/proyectos.ts` | **Sí, solo aditivo:** `ProyectoDelPortfolio.logo: string \| null` (`proyectos.ts:58`; valores en `:88`, `:104` y `:120`) y `textosDelProyecto` devuelve ahora `Omit<…, 'medios' \| 'logo'>` (`:131`). Los seis campos y la forma de `medios.poster` (`mediosDe`, `:64`) siguen igual. Servicios no lee `logo` ni usa `textosDelProyecto` |
| Los revelados: `CanalDeUnaPieza`, `CanalDeTexto`, `Bloque as BloqueMedido` | `movimiento/Revelado.tsx:4,6`, `movimiento/TitularQueEntra.tsx:6,7` ← `_contrato/canales.tsx`, `_contrato/coreografia.tsx` | No |
| El acento y la marca del home quieto | `bloques/Proceso.tsx:6`, `estiloDelAcento.ts:11`, `tipos.ts:10`, `pagina.invariant.tsx:22` ← `_contrato/acento.ts`, `_contrato/marcaHomeQuieto.ts` | No |
| `Cta`, `CtaEnlace` | `bloques/Llamado.tsx:11`, `bloques/Prueba.tsx:11`, `pagina.invariant.tsx:19` ← `_componentes/chrome/Cta.tsx` | No |
| `Contacto`, `PRECARGA_POR_SERVICIO` | `[servicio]/page.tsx:3`, `pagina.invariant.tsx:17` ← `_chrome/contacto/Contacto.tsx`, `contenido.ts` | No |
| `data-precarga` | lo lee `_chrome/contacto/apertura.ts:123`; lo emiten `bloques/Llamado.tsx:21`, `_secciones/servicios/CtaDelServicio.tsx:20` y `CtaQueRota.tsx:272` | No |
| Envoltorio, Marca, sistema de marca, Imagen, Textos, Titular, `afirmar`, `imagen`, `motion/texto`, `tipografia`, `CompuertaDelHome`, `cn` (12 archivos) | los bloques, `TitularQueEntra.tsx`, `[servicio]/page.tsx` y los cinco tests | No |
| **El vidrio del Portfolio, leído como texto** | `pagina.invariant.tsx:296` ← `portfolio/Tira.tsx` | **Sí: se movió** (§4) |

De los 20 archivos del home que servicios importa, **uno cambió y su cambio es aditivo.** Lo único que servicios leía por texto y se movió es el vidrio.

**Cierre transitivo.** Desde las páginas de servicio se alcanzan 9 archivos que el merge modificó, todos por `_lib/diagnostico/publicar.ts` (que importa el estado del Portfolio y la colocación de los títulos 3D) y por `proyectos.ts`. `publicar.ts` importaba esos mismos módulos antes del merge (solo dejó de importar `banderas`, que el home borró, y cambió los nombres que toma de `estado` y `pasos`), así que no es una dependencia nueva de servicios; un archivo nuevo del home, `_lib/escena/poseDelPortfolio.ts`, entra por `colocacion.ts`. Desde el layout de `/v3` (compartido por todas las rutas) se alcanzan 18 modificados: la escena, los títulos 3D, el scroll suave y el deslizamiento del CTA.

---

## 4. La falla que trajo el merge (no se arregló)

**`pagina.invariant.tsx:298`** — «el vidrio es el del Portfolio, número por número: blur(20px) saturate(180%)».

- **Causa.** Las líneas 296–297 leen el texto de `_secciones/trabajos/portfolio/Tira.tsx` y buscan ahí el `background` y el `backdropFilter` del vidrio. B1.2b sacó `ESTILO_DEL_VIDRIO` de `Tira.tsx` (estaba en `Tira.tsx:36` en `554a9b5b`) y lo puso en **`EscenarioDelPortfolio.tsx:18-24`**: el panel es ahora la única superficie de vidrio y las tiras «se separan con su borde» (`Tira.tsx:28-29`). El fondo dejó de ser un literal y pasó a una plantilla con `OPACIDAD_DEL_VIDRIO` (`:18`).
- **Lo que no cambió.** Se evaluaron las dos constantes (la del Portfolio y `_servicios/vidrio.ts:14-18`) y `background` (`color-mix(in srgb, var(--color-tinta) 4%, transparent)`), `backdropFilter` y `WebkitBackdropFilter` (`blur(20px) saturate(180%)`) **son idénticos**. El panel del Portfolio suma un `borderLeft` de tinta al 8 % (`:23`) que servicios no lleva; el filete de servicios (el borde de tinta al 10 %) sigue siendo el del lomo de una tira, que está en `Tira.tsx:32`. La página no se rompió: se rompió el lugar donde el test busca su referencia.
- **El control positivo de la línea 299** («un vidrio con otro desenfoque se detecta») imprime `ok` pero **pasa en vacío**. Medido: contra el `Tira.tsx` de antes del merge el predicado aceptaba el vidrio sano y rechazaba el torcido; contra el de ahora rechaza los dos, así que ya no distingue nada. Al arreglar la afirmación, el control tiene que volver a discriminar.
- **Propuesta (sin aplicar; dentro del carril, la decide Valentino).** (1) En `pagina.invariant.tsx:296-299` comparar valores evaluados: importar `ESTILO_DEL_VIDRIO` de `EscenarioDelPortfolio` (el test s76 del home ya lo importa, `s76-portfolio-escena.tsx:19`) y exigir que `background`, `backdropFilter` y `WebkitBackdropFilter` sean iguales a los de `vidrio.ts`; el control, ese mismo vidrio con el desenfoque de 8 px, tiene que ser rechazado. (2) Corregir el comentario de `vidrio.ts:4`, que nombra `Tira.tsx`. El código de producción de servicios no importa de ahí: el límite entre servidor y cliente de `vidrio.ts` sigue valiendo.

---

## 5. El póster móvil de El Garage a 390 (`/v3/paginas-web`, P-H11)

- **Cómo se miró.** `next dev --webpack -p 3001` lanzado desacoplado (la ruta compiló con 200 en 17,9 s); Chromium de Playwright sin WebGL, 390×844 táctil con DPR 3, `home:intro=1` y movimiento reducido; `visibilityState` e `innerWidth` comprobados antes de medir. **No se escribió en ningún campo ni se hizo clic en nada.** Resultados en `C:\paginas-servicios-datos\merge1\poster390.json`, capturas en el scratchpad de la sesión (no en el repo).
- **El archivo.** `public/portfolio/el-garage/movil.webp`: 390×844, 12 748 B (antes del merge, 17 236 B). Su proporción, 0,4621, es la del 780×1688 que declara `Prueba.tsx:31-34`: la caja del póster no se mueve. Esquina Estudio (690×1494) y Banú Scents (780×1688) no cambiaron en el merge.
- **En pantalla.** El navegador pide `/_next/image` con `w=750` y recibe 200; el optimizador no agranda y sirve los 390×844 (a `w=384` da 384×831). El póster ocupa 165,6×358,4 px CSS, los 3/5 del ancho de la tarjeta de 276 px.
- **Se ve entero.** El primer cuadro de la página de El Garage completo: la barra con el logo y el menú, la camioneta frente al mar, «EST. 2016», «EL GARAGE AUTOMÓVILES», «Donde la confianza se maneja.» y el botón «EXPLORAR COLECCIÓN». Sin el resto gris que describía P-H11 (la captura en el cuarto de arriba a la izquierda). Los cuatro cuadrantes del archivo tienen contenido (desvío de luminancia de 22 a 83), igual que los de los otros dos pósters.
- **Nitidez.** 390 px es la resolución real de la grabación (P-H11: escalar no agrega detalle). A DPR 3 el póster ocupa unos 497 px físicos, o sea se amplía 1,27 veces: la captura se lee, apenas blanda. A DPR 2 son 331 px y entra sin ampliar. Esquina y Banú se sirven a 690 y 750 px.
- **La página a 390.** No desborda (ancho de documento 390 contra 390), cero llamadas a `/api/*`, cero respuestas ≥ 400 y cero pedidos fallidos. Consola: los dos errores de THREE por correr sin WebGL (el overlay de Next marca «4 Issues», como en la S2b) y tres avisos de LCP de `next/image` por los pósters, que salen de llevarlos a la vista con el scroll de la prueba: el control, cargando la página sin scroll, no los da y los pósters siguen sin pedirse (lazy).
- Memoria libre mínima durante la corrida: 2,57 GB (piso del runner: 1,5 GB).

---

## 6. Pedidos y observaciones

- **Para Valentino:** decidir si se arregla la afirmación de §4 (dos cambios chicos, dentro del carril) en un sprint corto.
- `bloques/Prueba.tsx:26-34` (P-H9) dice que los pósters de móvil miden 780×1688 (uno 690×1494). Con el merge El Garage mide 390×844; la proporción es la misma, no hay desplazamiento de layout y no falla nada, pero el comentario quedó viejo. `portfolio/medios.ts:17` (`MEDIDAS_DE_LOS_MEDIOS`) tiene hoy las medidas de los tres, por si se quiere cerrar P-H9.
- **P-H11** (el póster de El Garage) queda resuelto por el merge. P-H10 sigue en el sprint P-H y la sugerencia P-H12 (las caras de la placa del contacto) sigue abierta.
- **Qué no cubre esta verificación:** no se corrió `verificar` completo ni `npm run build` (no estaban pedidos); solo se cargó `/v3/paginas-web` (las otras dos páginas comparten ruta y código) y no se miró escritorio; un Chromium sin WebGL no ejercita la escena 3D que el merge modificó (`_lib/escena/*`, los títulos de volumen), de eso se ocupan los bancos del home.

---

## 7. Cierre

- **Un solo commit,** «docs: verificacion del merge de B1.2b», con este LOG como único archivo. Nada de código tocado; `SPEC.md` y `CONTRATO.md` siguen sin trackear a propósito. Nada fuera de `docs/servicios/`.
- **Cierre de recursos:** el dev de `:3001` apagado (puerto libre), sin procesos del navegador de prueba; los procesos del home no se tocaron.
- **Datos y scripts** en `C:\paginas-servicios-datos\merge1\` (tsc, tests, barridos, JSON del navegador, mapa de imports y cierre transitivo) y en el scratchpad de la sesión; ninguno en el repo.
