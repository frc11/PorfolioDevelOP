# SPRINT S3b — Cuerpo en papel e intro (P-S4 del contrato v4)

Versión 1 · 2026-10-18 · Autor: CC (S3b) · Viene de: `docs/servicios/SPRINT-merge-1.md` (HEAD `408f965f`, con B1.2b mergeado).

**Estado en una línea:** las tres páginas tienen dos partes. La **intro** es la primera pantalla: transparente sobre la tapa interina, con el `h1`, su bajada y el enlace al home en claro, y `data-intro-de-servicio` para que B12 la encuentre; es lo único invertido de la página. El **cuerpo**, del Qué hacemos al cierre provisorio, son secciones opacas en papel con tinta y el acento oscuro del tema. El vidrio se fue, y con él el test que fallaba desde el merge-1. Gate en verde (tsc 0, cinco tests sin fallas, barridos iguales a la base). En el navegador, en los cinco anchos de las tres páginas: nada desborda, la costura entre la intro y el cuerpo es 0 px y sin borde, y el contraste mínimo es 6,02:1 en el cuerpo y 7,21:1 en la intro. Las dos corridas que se habían caído por memoria se cerraron después, con 3,5 GB libres, y pasaron (§5.2). Commit «S3b: cuerpo en papel e intro de las paginas de servicio».

> El contrato v4 no está en el disco (`docs/servicios/CONTRATO.md` es la versión 1). Lo de §0, §3 y §4 sale del prompt del S3b.

---

## 1. Paso 0 — lo que se leyó antes de tocar

### 1.1 Las secciones opacas del home

Las secciones en papel opaco son dos, **Servicios** y **Tu panel** (`_lib/secciones.ts:542-548` y `:585`, superficie `papel-opaco`). Su lenguaje, que es el que se imita (sin importar `Panel` ni `Seccion`, que emiten `data-panel`, y sin copiar archivos):

| Qué | Cómo lo hace el home | Dónde |
|---|---|---|
| Estructura | Una `<section>` a sangre por sección, con su nombre (`aria-labelledby` al titular) y la superficie como clases: `papel-opaco` es el fondo y la tinta del papel. **Entre secciones, cero margen**: el ritmo es de adentro | `_componentes/Panel.tsx:34-38` y `:61-145`; `_lib/superficies.ts:90-91` |
| Envoltorio | `ContenidoDeSeccion` es el `Envoltorio`: 32 px fijos a los lados y el tope de 1920 en el contenido | `_secciones/_contrato/Seccion.tsx:249-263`; `_componentes/layout/Envoltorio.tsx:55-79` |
| Aire vertical | De la escala del tema: Tu panel lleva 80 px (`--spacing-20`) arriba y abajo y entre sus piezas; un servicio de Servicios, 32 px (`--spacing-8`) | `tu-panel/TuPanel.tsx:32-33`; `servicios/ContenidoDeServicio.tsx:53` |
| Tipografía | El titular de la sección es un `h2` con `Titular` en `titulo-l` (Servicios) o `titulo-xl` (Tu panel); la descripción, `Cuerpo` en tinta media; los metadatos, `Micro` o `Caption` en mayúsculas y tinta media. La `EtiquetaDeSeccion` (el nombre de la sección) **ya no se usa en las secciones**: el título es lo primero | `servicios/CabeceraDeServicios.tsx:106` y `geometria.ts:289`; `tu-panel/TuPanel.tsx:52` y `:60`; `servicios/BloqueDeServicio.tsx:120`; `_contrato/Rotulo.tsx:14-23` |
| Separadores | El filete del borde (`--color-borde`, decorativo) en los renglones y el `Separador` vertical; arriba del título, la **marca de la sección** (el cuadrado del acento) en la columna lateral | `_componentes/marca/Marca.tsx:116-117`; `_contrato/Rotulo.tsx:71-77` y `:90-103`; usada en `CabeceraDeServicios.tsx:105` y `numeros/Numeros.tsx:251` (Tu panel no la monta: `TuPanel.tsx:21-24`) |
| Acento | Como relleno (el prefijo de la marca), como color del CTA (el envoltorio recolorea la tinta del botón) y como texto solo sobre claro; el contexto lo da el atributo del tema en el bloque | `Marca.tsx:97-102`; `servicios/CtaDelServicio.tsx:21`; `_contrato/acento.ts:67-72`; `servicios/Servicios.tsx:120` |
| Revelados | El título entra por línea y las piezas, enteras (P2), con el contrato de secciones (`Bloque` + canales), sobre la ventana visible del bloque | `tu-panel/TuPanel.tsx:47-63`; `tu-panel/Tarjeta.tsx:55-57` |

### 1.2 El tema: la noche y el alias del acento

- `[data-seccion="invertida"]` (`theme-develop.css:1386-1465`) redefine el fondo (`#0E0E0E`), las tres tintas, los dos bordes y la superficie translúcida. **No redefine `--color-acento`** (`:1444`) y no hay un contexto que devuelva el papel: el papel vive solo en el `@theme static` (`:179`, `:253-255`, `:285-286`).
- El alias `--color-acento` vale por defecto `var(--color-acento-web)` (`:344`) y lo reasignan las tres reglas de contexto `[data-servicio="…"]` (`:1350-1360`). Los tres oscuros son tokens: `--color-acento-web` `#1D5B8F`, `--color-acento-software` `#57429E` y `--color-acento-ia-automatizacion` `#1B6B4C` (`:326-328`). Los claros no existen como tokens (P-H2).

### 1.3 La decisión: la inversión va solo en la intro

Con la inversión en la raíz, el cuerpo tendría que volver al papel adentro de un contexto invertido, y para eso hay dos caminos: escribir en el cuerpo los hex del papel (las tintas, los bordes) o sumarle al tema un contexto «vuelta al papel». El primero mete hex en el cuerpo y el segundo toca el tema: los dos están afuera. Con la inversión **solo en el bloque de la intro**, el cuerpo queda en el papel del tema sin una línea nueva.

**Cambia una regla nuestra:** desde el S1b el único `data-seccion="invertida"` estaba en la raíz. Ahora sigue siendo uno solo, pero está en la intro (la raíz ya no se invierte). `pagina.invariant` §5 lo afirma así.

---

## 2. Qué cambió en el código

| Archivo | Cambio |
|---|---|
| `_servicios/Intro.tsx` (nuevo, 46 renglones) | La intro: un `div` con `data-intro-de-servicio` (el slug; la constante `ATRIBUTO_DE_LA_INTRO` es la única fuente), el único `data-seccion="invertida"`, la tinta (`text-tinta` en el mismo elemento: el color se hereda ya resuelto), el acento claro y el alto en UNA constante, `ALTO_DE_LA_INTRO`, una pantalla como piso, con el comentario «el alto lo fija B12». Adentro: la tapa interina (`fixed`, `inset-0`, `-z-10`, el fondo, que acá es la noche), el encabezado y el problema. Sin fondo propio |
| `_servicios/PaginaDeServicio.tsx` | La raíz ya no se invierte: fija el acento del cuerpo (`estiloDelAcentoSobrePapel`, el token oscuro del servicio por `var()`) y monta la intro, el `main` con el cuerpo, el cierre y, al final, los JSON-LD (no se ven, y así la intro es lo primero) |
| `_servicios/estiloDelAcento.ts` | `tokenDelAcento(id)` deriva el token del tema del id del home (`--color-acento-<id>`); `estiloDelAcentoSobrePapel(id)` y `estiloDelAcentoSobreNoche(claro)` reemplazan a `estiloDelAcento(claro)`. `ESTILO_DEL_CTA` sigue igual |
| `_servicios/bloques/Bloque.tsx` | La sección del cuerpo, opaca en papel: la superficie `papel-opaco` del home (`CLASES_DEL_PAPEL`, que se lee de `SUPERFICIES`: el fondo y la tinta del papel), el aire arriba de cada bloque (48 px y 80 desde 1025, la escala del tema) y ningún margen, la marca de la sección arriba del título (`MarcaDeSeccion`) y el contenido entero con el revelado P2. Sin panel de vidrio. El FAQ sigue con su panel quieto |
| `_servicios/bloques/Cierre.tsx` | El pie provisorio en papel, con el filete del borde arriba del contenido; el contenido entra con el mismo revelado que antes. Sin vidrio |
| `_servicios/bloques/Problema.tsx` | En la intro: la sección llena lo que queda de la pantalla. Por debajo de 1025 el bloque se apoya abajo, como el titular del hero del home; desde 1025 va arriba, porque el revelado del home llega con la caja 240 px por encima del pie del cuadro y apoyado abajo la bajada cargaría a medio revelar (§5) |
| `_servicios/bloques/PanelDeVidrio.tsx`, `_servicios/vidrio.ts` | **Borrados**: sin vidrio en el cuerpo no queda quien los use |
| `_servicios/bloques/Prueba.tsx` | Solo el comentario de P-H9 (renglones 26-32): las medidas actuales de los pósters, que desde B1.2b viven en `portfolio/medios.ts` (`MEDIDAS_DE_LOS_MEDIOS`): escritorio 1440×900 y 1280×800 (El Garage), los dos 16:10; móvil 780×1688 (Banu), 690×1494 (Esquina) y 390×844 (El Garage), la misma relación. La constante no cambia |
| `_servicios/bloques/precio/Planes.tsx` | Un comentario que nombraba el vidrio del panel |
| `[servicio]/page.tsx` | El docblock: la raíz fija el acento y la intro es la invertida |
| `__tests__/pagina.invariant.tsx`, `__tests__/pagina-detectores.ts` | §3 |

Nada fuera de `src/app/v3/_servicios/`, `src/app/v3/[servicio]/` y `docs/servicios/`. Del home solo se **importan** dos piezas nuevas: `SUPERFICIES` (`_lib/superficies.ts`, datos sin imports) y `MarcaDeSeccion` (`_secciones/_contrato/Rotulo.tsx`, sin `data-panel`).

---

## 3. Los tests

`pagina.invariant.tsx`: de 143 afirmaciones con 1 falla (la del merge-1) a **157 sin fallas**. Los otros cuatro (`datos`, `precios`, `slots`, `seo`) no cambian.

**Test retirado por quitar la funcionalidad (no aflojado).** La comparación del vidrio contra la fórmula del Portfolio (renglones 296-299 del merge-1: leía `Tira.tsx` como texto y fallaba desde que B1.2b movió el vidrio a `EscenarioDelPortfolio.tsx`) se borró porque el vidrio ya no existe: no queda qué comparar. Con ella se fueron las otras tres afirmaciones que describían la página de vidrio (cada bloque es un panel de vidrio; lo único opaco es la tapa; ningún `style` pinta un fondo que no sea translúcido), porque su propiedad cambió por diseño. Las reemplazan afirmaciones nuevas, más estrictas: ningún vidrio y ningún fondo en un `style`, el cuerpo en papel y la tapa adentro de la intro.

**Lo nuevo, cada uno con su control positivo:**

| § | Afirma | Control (tiene que fallar) |
|---|---|---|
| 1 | La intro es lo primero de la raíz, lleva `data-intro-de-servicio` con su slug, el único `h1` (el título del problema) y la bajada (su texto); el cuerpo no lleva ninguno de los dos | sin el atributo; el `h1` mudado al cuerpo; algo antes de la intro |
| 2 | El orden, ajustado a la intro: la intro lleva un solo bloque (el problema) y el cuerpo arranca en Qué hacemos y sigue el SPEC | un bloque del cuerpo metido en la intro |
| 5 | `data-seccion` es uno solo, «invertida», en la apertura de la intro (ya no en la raíz) | dos veces; en la raíz y no en la intro |
| 6 | El cuerpo no tiene ningún hex; el único hex del marcado es el claro de SUS datos, en el `style` de la intro | un hex en el cuerpo; el claro en el cuerpo |
| 6 | El token oscuro de cada servicio es el que el **tema** le da en su contexto (`[data-servicio]`, leído del CSS) y está declarado en su `@theme static`; la raíz lo fija por `var()` | el token de otro servicio; el claro en la raíz; un token que el tema no declara; un servicio que el tema no conoce |
| 9 | El encabezado (enlace al home con el logotipo) va adentro de la intro y antes del `main` | el encabezado fuera de la intro |
| 10 | La tapa es una sola y va adentro de la intro; la intro no pinta fondo propio; cada bloque del cuerpo lleva la superficie `papel-opaco` del home; ningún vidrio ni fondo en un `style` | una intro con fondo; un bloque sin papel; un panel de vidrio; un `style` con un fondo opaco |

**Lo que se mantiene, sin cambios:** `data-servicio` prohibido, el CTA con `data-precarga`, los ids reservados, el orden del SPEC, `[a definir]` solo en desarrollo, que `Prueba` no lee `resena` ni `problemaResuelto`, los revelados (el título y el contenido de cada bloque; el panel del FAQ quieto) y lo demás.

**Mutaciones sobre los fuentes** (como en el S2c): nueve cambios a propósito en `Intro`, `PaginaDeServicio`, `estiloDelAcento`, `Bloque` y `Cierre` —la inversión de vuelta en la raíz, la intro sin su atributo, el token de un solo servicio para las tres, el claro en la raíz, un bloque sin papel, el cierre sin papel, los JSON-LD antes de la intro, la tapa fuera de la intro y el encabezado fuera de la intro—. **Las nueve las atrapa el invariante** (de 1 a 9 fallas cada una) y los fuentes volvieron byte por byte (sha256). La del token salió floja la primera vez: el test calculaba lo esperado con la misma función que probaba, y solo la vio su control. Se corrigió: lo esperado sale ahora de las reglas de contexto del tema, y la mutación la atrapan las dos afirmaciones principales.

---

## 4. Gate

| Paso | Resultado |
|---|---|
| ESLint de los 11 archivos tocados | 0 errores, 0 avisos (los dos borrados no se pueden lintear) |
| `datos` · `precios` · `slots` · `seo` · `pagina` (`npx tsx`) | 48/0 · 22/0 · 44/0 · 56/0 · **157/0** |
| Mutaciones sobre los fuentes | 9 de 9 atrapadas; fuentes restaurados byte por byte (§3) |
| Seis barridos (§5.1 del plan) | `s4-paquete` 21/0 · `s8-montaje` 56/**2** (las dos fallas de la base, los mismos seis archivos del home) · `s8-escena` 33/0 · `s9-sentry` 22/0 (2 fuera de ventana) · `s40-3d-sonido` 38/0 (con el índice del commit, ver §6) · `s53-pulido-2` 54/0. Contra las salidas del merge-1 lo único que cambia son los conteos de archivos: uno menos (se fueron dos, entró `Intro.tsx`) |
| **tsc completo** | **0 errores** (17 s) |

---

## 5. Navegador

**Cómo se midió.** `next dev --webpack -p 3001` (Next 16.2.9) contra Chromium (Playwright 1.61.1) sin WebGL, con `home:intro=1` y la página visible antes de medir. Anchos 375, 390, 768 (táctiles), 1023 y 1280, y 1280 con movimiento reducido (todo en su estado final: da los mismos números). Los scripts están en el scratchpad de la sesión, no en el repo; los resultados, en `C:\paginas-servicios-datos\s3b\*.json`, y las capturas en `C:\paginas-servicios-datos\s3b\capturas\`. **El formulario no se envió ni se escribió en ningún campo**: cero llamadas a `/api/*`, cero respuestas ≥ 400 y cero requests fallidos; el único error es el de correr sin WebGL («Error creating WebGL context»).

| Página | Ancho | Contraste mín. del cuerpo | Contraste mín. de la intro | Desborde | Costura intro / cuerpo |
|---|---|---|---|---|---|
| Páginas web | 375 · 390 · 768 · 1023 · 1280 | 6,65:1 (el azul oscuro sobre papel) | 7,21:1 | ninguno | 0 px y sin borde en los cinco; en píxeles, limpia a 390 y a 1280 |
| Software a medida | 375 · 390 · 768 · 1023 · 1280 | 7,17:1 (la tinta media; el violeta da 7,31) | 7,21:1 | ninguno | 0 px y sin borde en los cinco; en píxeles, limpia a 390 y a 1280 |
| IA y automatizaciones | 375 · 390 · 768 · 1023 · 1280 | 6,02:1 (el verde oscuro: tabla, tarjetas y CTA) | 7,21:1 | ninguno | 0 px y sin borde en los cinco; en píxeles, limpia a 390 y a 1280 (§5.2) |

Los números son los mismos en los cinco anchos de cada página, con las preguntas del FAQ cerradas y abiertas: ningún par de texto queda debajo de 4,5:1.

### 5.1 Lo que se vio

- **La intro**, en las tres y en los cinco anchos:
  - es lo primero de la raíz y mide una pantalla (667, 844, 1024, 768 y 800 px);
  - no tiene fondo propio y su tinta es `#F7F7F5`: el `h1` va en tinta y la bajada y el nombre del servicio, en tinta media (`#9E9E9E` sobre `#0E0E0E`, 7,21:1);
  - el logotipo va en claro;
  - la tapa es `#0E0E0E`, va en `-z-10` y cubre la ventana;
  - es el único `data-seccion`;
  - a 1280 × 800, al cargar, el `h1` y la bajada están enteros (opacidad 1, traslación 0).
- **El cuerpo:**
  - todos los bloques, del Qué hacemos al cierre (nueve en Páginas web; ocho en las otras dos, que no tienen Extra), son papel opaco (`#F7F7F5`, alfa 1), con 0 px entre bloque y bloque y ningún `backdrop-filter`;
  - el CTA va en el acento oscuro (`rgb(29, 91, 143)` en Páginas web);
  - en IA, la tabla de planes (desde 768) y las tarjetas (por debajo) dan 6,02:1 en el verde.
- **Los acentos, por zona:**
  - en la intro solo el claro (`#8FC0E8`, `#AFA0E8`, `#7FCBA4`: el cuadrado del nombre);
  - en el cuerpo solo el oscuro del tema (`#1D5B8F`, `#57429E`, `#1B6B4C`): rellenos, textos, el marcador del FAQ y el subrayado del CTA;
  - ningún `data-servicio`.
- **La costura:**
  - en el layout, el pie de la intro y el tope del primer bloque coinciden al píxel en todos los anchos; el primer bloque no tiene borde y el `main` no tiene margen;
  - en la captura, con el borde al 25, 50 y 75 % de la ventana y en cuatro columnas (los dos bordes, el centro y el margen), arriba hay `#0E0E0E` y abajo `#F7F7F5`, sin ningún píxel intermedio. Se midió en las tres, a 1280 y a 390.
- **El FAQ con teclado** (1280, las tres):
  - el primer Tab va al logotipo, con el anillo claro (2 px, `#F7F7F5`) sobre la noche;
  - la pregunta toma el anillo oscuro (`#111111`) sobre el papel;
  - Enter y Espacio abren y cierran sin sacar el foco y sin mover el scroll;
  - abrir una pregunta con el mouse, con Lenis, la corre 0 px (109 muestras);
  - las respuestas están en el HTML.
- **El modal** (1280):
  - en las tres, abierto desde el llamado y desde el cierre y cerrado con la X y con Escape, marca `web`, `software` y `chatbot` + `automatizaciones`;
  - deja los campos vacíos, no envía nada y no mueve el scroll.
- **El `<head>` y el JSON-LD:** 19 de 19 comprobaciones en las tres.
- **Los revelados** (1280):
  - lo que está a la vista llega a opacidad 1;
  - los bloques que entran llevan su traslación atada al scroll (el P2 del home);
  - al fondo, el cierre queda 21 px corrido (§6).

### 5.2 Memoria: dos corridas que se cerraron después

Durante la pasada el home tuvo su dev arriba (llegó a unos 6 GB) y después corrió un `next build`. Cuatro corridas cayeron bajo el piso de 1,5 GB libres y se reintentaron **una vez**: las cuatro pasaron. Dos murieron **dos veces** y quedaron reportadas, sin reintentar:

- el modal de Software a medida (1280);
- la costura en píxeles de IA a 1280.

Valentino pidió cerrarlas antes del commit si había 3 GB libres o más. Con 3,5 GB corrieron las dos y **pasaron al primer intento**:

- **El modal de Software a medida:** desde el llamado y desde el cierre, cerrado con la X y con Escape, marca `software`. Deja los campos vacíos, el diálogo entra en la ventana, no se envía nada, no mueve el scroll y no hay llamadas a `/api/*`.
- **La costura de IA a 1280:** con el borde al 25, 50 y 75 % de la ventana y en las cuatro columnas, `#0E0E0E` arriba y `#F7F7F5` abajo, sin ningún píxel intermedio.

Mientras corría el build del home apagué mi dev, porque nadie lo estaba mirando, y lo volví a levantar cuando terminó. No toqué los procesos del home.

---

## 6. Pedidos y observaciones

- **Ningún pedido nuevo al home.** Siguen P-H2 (los claros como tokens: hoy son el único hex), P-H10 y P-H12.
- **`s40-3d-sonido` depende del índice de git, no solo del disco.** Lista los archivos de /v3 con `git ls-files -co` y los lee: con un borrado que todavía no está en el índice (`PanelDeVidrio.tsx`, `vidrio.ts`), se cae con `ENOENT` antes de su resumen. Corrido con una copia del índice que ya registra los dos borrados (el estado del commit, por `GIT_INDEX_FILE`, sin tocar el índice real) da 38/0, igual que la base. Con el commit (`git rm`) ya no hace falta la copia: se corre así después del commit (§7). Para el home: un padrón que lee lo que lista el índice se cae con cualquier borrado sin commitear.
- **P-H9 se puede cerrar.** Las medidas de los pósters ya existen en `portfolio/medios.ts` (`MEDIDAS_DE_LOS_MEDIOS`). Si el home las suma a `PROYECTOS` (o deja importar ese archivo), `MEDIDAS_DE_LA_CAPTURA` de `Prueba.tsx` se va.
- **El cierre no termina de llegar al final del scroll** (de antes, no lo trajo este sprint): con la ventana visible, la llegada del revelado cae 240 px antes del pie del cuadro, y el pie de la página termina antes. Al fondo, el contenido del cierre queda con opacidad 1 y 21 px por debajo de su lugar, adentro de sus 80 px de aire (en el S2b eran 23 px, con el panel). No es una costura ni se lee mal.
- **No medido:** el rebote del scroll al fondo (macOS, iOS) mostraría la tapa oscura debajo del papel del cierre, porque la tapa cubre la ventana. Chromium no rebota; queda para mirarlo en un teléfono.
- El contrato v4 no está en el disco (`CONTRATO.md` es la v1): §0, §3 y §4 salen del prompt.

---

## 7. Cierre

- **El commit, con el «commit» de Valentino:**
  - primero se cerraron las dos corridas pendientes (§5.2);
  - `git status --short` y staging archivo por archivo (los dos borrados con `git rm`, sin repetirlos en el `git add`);
  - el mensaje «S3b: cuerpo en papel e intro de las paginas de servicio» y `git push` sin force;
  - con el commit hecho, `s40-3d-sonido` se corre sin la copia del índice (§6);
  - el dev se apaga.
- **Qué entra en el commit:** `Intro.tsx` (nuevo), `PaginaDeServicio.tsx`, `estiloDelAcento.ts`, `bloques/Bloque.tsx`, `bloques/Cierre.tsx`, `bloques/Problema.tsx`, `bloques/Prueba.tsx`, `bloques/precio/Planes.tsx`, `[servicio]/page.tsx`, los dos tests y este LOG; `bloques/PanelDeVidrio.tsx` y `vidrio.ts`, borrados. `SPEC.md` y `CONTRATO.md` siguen sin trackear a propósito.
- **Las páginas para mirar** (con el dev de `:3001`): <http://localhost:3001/v3/paginas-web>, <http://localhost:3001/v3/software-a-medida> y <http://localhost:3001/v3/ia-y-automatizaciones>, en escritorio y a 390, de la intro al cuerpo.
