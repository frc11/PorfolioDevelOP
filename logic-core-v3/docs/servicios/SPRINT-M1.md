# M1 — La maqueta de Páginas web: la intro, el orden, el acento y el contenido

Versión 2 · 2026-10-18 · Autor: CC (M1) · Viene de: `docs/servicios/SPRINT-M0.md` (el plan) y `docs/servicios/SPRINT-merge-2.md` (sus cinco citas viejas).
Rama `paginas/servicios`, sobre `754f321a`. **Commiteado «(sin ver)» en la corrida desatendida del 2026-10-18 (tarea 1, sin cambios de código desde el FRENO); Valentino lo revisa al volver.**

La versión 2 suma el ajuste del gatillo que pidió Valentino (§3.1): la línea vuelve al 6 % del home, con una guarda en reposo. También corre todo lo que la versión 1 dejó sin correr.

**Estado en una línea:**
- **Los seis puntos están hechos** en la plantilla y llegan a las tres páginas.
- **El paso 0** dejó el detector leyendo la declaración que busca, y `tsc` en 0.
- **El gatillo** volvió a la línea del home, con la guarda en reposo (P-H25).
- **Gate, sobre el estado final:**
  - lint 0 y `tsc` 0;
  - los cinco tests en verde: 377 afirmaciones, 145 controles positivos;
  - 14 de 14 mutaciones atrapadas;
  - los seis barridos iguales a la base.
- **Navegador:** la tabla está completa. No queda nada escondido en pantalla en reposo, y la salida al subir se ve.
- **El commit** salió en la corrida desatendida, con «(sin ver)» en el mensaje (§11).

---

## 1. Paso 0

### 1.1 El detector (`pagina-detectores.ts`)

**La causa** (merge-2 §5): desde B1.2c cada regla `[data-servicio]` del tema trae dos declaraciones (`theme-develop.css:1366-1379`), y el detector leía la regla entera como una sola.

**El arreglo:**
- `declaracionDelTemaPorServicio(css, propiedad)` parte el cuerpo de cada regla por `;` y se queda con la declaración de esa propiedad, haya las que haya.
- `acentosDelTemaPorServicio` es ahora esa función con `--color-acento`.
- No se aflojó nada: el resto de la regla se sigue leyendo entero.

**`pagina.invariant.tsx:162` y `:167` vuelven a pasar.**

**Los tres controles vuelven a fallar con su entrada mala.** Se probó rompiendo cada uno a propósito, en una copia descartable del test. El original no se tocó: su sha256 es igual antes y después.

| Control | Con la entrada sana en lugar de la mala | Resultado |
|---|---|---|
| `:164`, un servicio que el tema no conoce | 157 / 1 | discrimina |
| `:168`, el token de otro servicio | 157 / 1 | discrimina |
| `:169`, el claro en la raíz | 157 / 1 | discrimina |

El script y la salida: `C:\paginas-servicios-datos\m1\paso0\controles.txt`.

### 1.2 `tsc`

- Se borró `.next\dev\types`, la única excepción del alcance.
- `tsc --noEmit` normal, con el `tsconfig` del repo: **0 errores** (`m1\paso0\tsc.txt`).
- **Un error mío:** lo corrí con 2,88 GB libres, por debajo del piso de 3 GB. Terminó bien, pero no debió arrancar así.

---

## 2. Lo hecho, punto por punto

### 2.1 La intro

- **El h1 es `nombre`.** Lo pinta `TitularQueEntra` en `bloques/Problema.tsx:38`.
- **La bajada sale de `problema`, en dos párrafos y sin heading** (`Problema.tsx:42`, `data-pieza="bajada-de-la-intro"`):
  - el primero es `problema.titulo`;
  - el segundo, `problema.texto`.
- **Lo que necesita B12a (P-H20):**
  - el bloque con su atributo propio: `data-intro-de-servicio`, que ahora vale el `IdDeServicio` (`web`, `software` o `ia-automatizacion`) y no el slug;
  - el h1 y la bajada;
  - el alto en su constante, que sigue en una pantalla: `ALTO_DE_LA_INTRO`, en `Intro.tsx:35`.
- **`data-seccion="invertida"` va solo en la intro.**
- **Arriba del h1 va la `MarcaDeSeccion`**, la marca del home (ver §3).
- **Criterio cumplido:**
  - un solo h1, igual a `nombre`, en las tres páginas y en los dos modos;
  - el `title`, el `Service.name` del JSON-LD y la posición 2 del breadcrumb son coherentes con `nombre`.

### 2.2 El orden del cuerpo

`PaginaDeServicio.tsx` arma la intro y después el `main`, el cierre y el JSON-LD.

| # | Bloque (`data-bloque`) | Revelado | Dónde |
|---|---|---|---|
| — | `problema` (la intro) | el del título que entra | `Problema.tsx` |
| 1 | `que-hacemos` | progresivo | `Bloque` (por defecto) |
| 2 | `que-incluye` | progresivo | ídem |
| 3 | `precio` | progresivo; la versión de hoy | ídem |
| 4 | `llamado-del-precio` | gatillo | `Llamado.tsx:34` |
| 5 | `extra` | progresivo; no se monta si el servicio no tiene | ídem |
| 6 | `trabajos` (el slot del video) | gatillo | `Trabajos.tsx:34`; ver §3 |
| 7 | `proceso` (Cómo trabajamos) | progresivo | `Proceso.tsx` |
| 8 | `faq` | panel quieto | `Faq.tsx:38` |
| 9 | `llamado` | gatillo | `Llamado.tsx:57` |
| 10 | `cierre` | sin revelado | `Cierre.tsx` |

**El progresivo** es el del home: `_secciones/_contrato`, por `Bloque` y los canales, como antes.

**El gatillo** es nuestro (`movimiento/`):
- `disparo.ts` es la máquina pura de cuatro estados: `quieto`, `espera`, `puesto` e `ido`.
- `Gatillo.tsx` la monta: un `IntersectionObserver` con la línea de disparo como `rootMargin`.
- **Del contrato del home importa** `cruceDelTramo`, `gestoDelCruce` y `puestoTras` (`_contrato/cruce.ts`), y `useMovimientoEnTodoAncho`.
- **Las reglas son las del remate del home:**
  - el primer aviso es el estado de carga, no un cruce;
  - un salto por encima de la línea se posa sin gesto (A13);
  - sin movimiento, `quieto`;
  - la línea al 6 % desde abajo.
- **Más una regla que el remate no tiene:** la guarda en reposo (§3.1).
- **La transición** usa los tokens `--duracion-muy-lenta` y `--ease-salida` del tema.
- **Hay una sola implementación**, con el comentario «P-H18: reemplazar por el import de _contrato» en `disparo.ts:4` y `Gatillo.tsx:13`.

**Con movimiento reducido** todo queda a la vista y quieto. **En reposo no hay nada invisible:** el HTML servido trae cada gatillo en `quieto`, y en el sitio lo cuida la guarda.

### 2.3 El acento

- **Los tres hex de los datos se fueron.** El campo `acento` salió de `Servicio` (`tipos.ts`) y de los tres archivos de datos: el servicio guarda solo su `IdDeServicio` (`idEnElHome`).
- **La intro lee el token claro del tema:** `estiloDelAcentoSobreNoche(id)` devuelve el alias `--color-acento` = `var(--color-acento-<id>-claro)` (`estiloDelAcento.ts`). Los tokens son los de `theme-develop.css:356-358`.
- **El cuerpo sigue con el oscuro**, sin cambios.
- **Cero hex en `_servicios/`:**
  - lo cuida `datos.invariant` sobre las fuentes que no son tests (más de 30 archivos), con su control;
  - `pagina.invariant` §6 lo afirma además sobre el marcado.

### 2.4 El contenido nuevo (literal)

Los tres textos dejan de ser `null` y se ven en producción:
- **Software**, «¿Qué pasa si después necesito cambios?» (`datos/software-a-medida.ts`).
- **IA**, «¿El bot reemplaza a mi equipo?» (`datos/ia-y-automatizaciones.ts:95-98`).
- **IA**, el texto del CTA (`:128-129`).

Cada uno lleva la marca `// M0 §8 (dictado)`, la segunda fuente admitida además del SPEC. `datos.invariant` los compara letra por letra con su tabla `DICTADOS` y cuenta las marcas (3), con controles.

**Queda sin respuesta solo «¿El sistema es mío?»**, que el SPEC deja [a definir].

### 2.5 El CTA de debajo del precio

`LlamadoDelPrecio` (`Llamado.tsx:34`) lleva **solo el botón** (D3):
- el envoltorio con `data-abre-contacto="panel"` y `data-precarga` = el `IdDeServicio`;
- el gatillo como revelado;
- sin `data-servicio`.

Comparte `AbreElContacto` con el llamado: ese envoltorio no se duplicó.

### 2.6 Cómo trabajamos

`Proceso.tsx` lleva:
- **los cinco pasos y el plazo**, de los datos;
- **una frase por trabajo**, de `prueba.casos`:
  - un proyecto da su `nombre` (de `FUENTE_DE_PROYECTOS`, el del home) más el texto del caso;
  - un caso propio da su texto, o el marcador si es `null`;
  - sin imágenes;
- **el enlace al Portfolio:**
  - rótulo «Ver el portfolio»;
  - el `href` lo arma `hrefDelCasoEnElPortfolio` (`rutas.ts:49`): `/v3#portfolio-el-garage`;
  - es el formato de B1: un ancla por proyecto, en el paso de su portada (`docs/rediseno/SPRINT-B1-PORTFOLIO.md:471`);
  - el id no se escribe a mano: sale de `ANCLAS_DEL_PORTFOLIO` (`_secciones/trabajos/portfolio/anclas.ts:18-21`) por el lugar del proyecto en `PROYECTOS`.

**No se inventó nada:** todos los textos ya existían en los datos.

### 2.7 Lo que se quitó

- **Borrados: «Del blog»** (`bloques/DelBlog.tsx`) y **la sección de casos con pósters** (`bloques/Prueba.tsx`).
- **El revelado del cierre** (`Cierre.tsx`). Eso saca los 21 px.
- **El slot del video** no se monta hasta el M3. En desarrollo muestra «Video de trabajos: [a definir]».

---

## 3. Decisiones

### 3.1 La línea del gatillo y la guarda en reposo (pedido de Valentino, versión 2)

**El defecto.** Con la línea al 6 %, a 1024, el CTA del precio quedaba quieto con 44 px en pantalla y opacidad 0, porque su borde de arriba caía en la franja entre el borde del cuadro y la línea (§7.3).
- La versión 1 bajó la línea al borde, y con eso la salida al subir pasaba fuera de la vista.
- Valentino pidió volver al 6 % y cubrir la franja con una guarda.

**Hecho:**
- `LINEA_DEL_DISPARO = 6` (`disparo.ts:48`). `pagina` afirma que es igual a `DISPARO_DEL_REMATE` del home (`tu-panel/entrada.ts:71`).
- **La guarda es un evento nuevo de la máquina pura, `reposo`** (`disparo.ts:33-35`). Con el scroll quieto:
  - **a la vista y sin disparar** (`espera` o `ido`): pasa a `puesto`, con su gesto de entrada;
  - **fuera de la vista:** no cambia nada, así que la salida al subir sigue pasando a la vista, bien abajo, como en el home.
- El comentario «P-H25: el gatillo común del home trae esta guarda» está en `disparo.ts:33`.
- **Cómo sabe que el scroll paró** (`Gatillo.tsx:44-56`):
  - usa el escucha compartido del home, `seguirElScroll` (`_lib/scrollEnMovimiento.ts:23`), el mismo del video de Servicios y del panel vivo;
  - espera el quieto del asiento del home, `ASIENTO.quietoMs` (180 ms, `_lib/titulos3d/repeticiones.ts:13`). No hay escucha ni número nuevo.
- **La guarda arranca con el primer aviso del observador.** Así, el primer reposo, que el escucha arma al suscribirse, encuentra el estado de carga. Eso cubre la página que carga quieta con una pieza en la franja.
- **«A la vista»** es la caja del elemento observado cortando el cuadro, medida con el scroll quieto. Ese elemento nunca se transforma: lo que se corre es su hijo.

**¿Hay una causa raíz mejor?** No, dentro del mismo criterio:
- **La franja es inevitable:** con cualquier línea por encima del borde, una pieza puede quedar quieta en ella a la vista y sin cruzar.
- **Una salida que se ve también deja la pieza ida y todavía a la vista.**
- **Las dos cosas pasan con el scroll quieto**, y el observador no avisa nada con el scroll quieto: tiene que haber una regla por tiempo.

Mover la línea solo cambia de lugar el problema:
- en el borde, la salida no se ve (versión 1);
- con una histéresis (entrar en el borde y salir en la línea), lo escondido a la vista queda subiendo.

La guarda es la regla mínima. Lo que sí se puede mejorar es dónde vive: en el gatillo común del home (P-H25), para que el remate la tenga también.

**El costo, a la vista:** si el scroll para con la pieza en la franja después de irse, la pieza vuelve a entrar a los 180 ms. Es lo que pide el criterio, nada invisible en reposo. Valentino lo ve en §10.

### 3.2 Tomadas sin preguntar

1. **`data-intro-de-servicio` vale el `IdDeServicio`, no el slug.**
   - **Por qué:** es la llave de los tokens del tema y del título 3D, y B12a la va a leer.
2. **El slot 6 sigue en producción en Software e IA:**
   - Software, con su `prueba.nota`;
   - IA, con «Probá el panel», que va a `/login` (D11).

   Es lo que esos dos servicios tenían en el slot; el video se suma en el M3. Su revelado es el gatillo, porque la tabla del M0 no le da uno.
3. **El enlace al Portfolio sale solo si el servicio tiene un caso de proyecto.**
   - Hoy eso es solo Páginas web.
   - En Software e IA no hay enlace, y el slot 6 no muestra ningún caso web.
4. **Los títulos nuevos son provisorios (C2):** «Trabajos», «Cómo trabajamos» y «Ver el portfolio».
5. **La `MarcaDeSeccion` del home va arriba del h1 de la intro**, como en las secciones del home.

---

## 4. Archivos

Todos dentro de `src/app/v3/_servicios/`.

**Modificados (17):**
- `Intro.tsx`
- `PaginaDeServicio.tsx`
- `estiloDelAcento.ts`
- `rutas.ts`
- `tipos.ts`
- `bloques/Bloque.tsx`
- `bloques/Cierre.tsx`
- `bloques/Faq.tsx`
- `bloques/Llamado.tsx`
- `bloques/Problema.tsx`
- `bloques/Proceso.tsx`
- `datos/paginas-web.ts`
- `datos/software-a-medida.ts`
- `datos/ia-y-automatizaciones.ts`
- `__tests__/datos.invariant.ts`
- `__tests__/pagina.invariant.tsx`
- `__tests__/pagina-detectores.ts`

**Nuevos (3):**
- `bloques/Trabajos.tsx`
- `movimiento/disparo.ts`
- `movimiento/Gatillo.tsx`

**Borrados (2):**
- `bloques/Prueba.tsx`
- `bloques/DelBlog.tsx`

Se borraron con `rm` a secas. Entran al commit con `git rm` y no se repiten en el `git add`.

**Más este log:** `docs/servicios/SPRINT-M1.md`.

**Fuera del carril no se tocó nada,** salvo el borrado de `.next\dev\types` del paso 0. Del home solo se importa:
- `_lib/scrollEnMovimiento.ts`
- `_lib/titulos3d/repeticiones.ts`
- y, en el test, `_secciones/tu-panel/entrada.ts`

`SPEC.md` y `CONTRATO.md` siguen sin trackear.

---

## 5. Tests

### 5.1 Lo pedido, con su control

| Pedido | Dónde |
|---|---|
| El orden de los bloques | `pagina` §2 (`ORDEN_DE_LA_MAQUETA` y lo esperado por página y modo) |
| h1 = `nombre`, uno solo | `pagina` §1 |
| La bajada en dos párrafos | `pagina` §1 (`bajadaEnDosParrafos`) |
| Cero hex | `pagina` §6 (el marcado) y `datos` §8 (las fuentes) |
| Los tres textos literales | `datos` (`DICTADOS` y las marcas contadas) |
| El CTA del precio con `data-precarga` y sin `data-servicio` | `pagina` §3 (`ctaDelPrecio`) |
| El enlace a El Garage, en el formato de B1 | `pagina` §7 (`vaAlGarage`) |
| El cierre sin revelado | `pagina` §10 (`REVELADO_ESPERADO`) |
| Del blog y los pósters, fuera | `pagina` §2 y §7 |
| El gatillo, visible con movimiento reducido | `pagina` §10: el estado `quieto` en el HTML y la máquina con `sin-movimiento` |
| **v2 ·** la línea, la del remate del home | `pagina` §10 (`lineaDelRemate`); control: la línea en el borde |
| **v2 ·** un gatillo a la vista que no cruzó la línea queda visible en reposo | `pagina` §10 (`enLaFranja`). Control: la máquina sin la guarda lo deja escondido |
| **v2 ·** la guarda no toca lo que no está a la vista, y la salida sigue | `pagina` §10 (los reposos por estado y `saleYSeQueda`). Control: una guarda que también pone lo que no está a la vista |

Detalle de algunos controles:
- **El orden:** dos bloques cambiados, uno inventado y la `prueba` de antes.
- **El h1:** dos h1, otro texto, y el título del problema de antes.
- **El enlace:** otro caso, y `#trabajos` a secas.

Todos los controles positivos se ven en la salida con su entrada equivocada.

### 5.2 Retirados (por quitar la funcionalidad, no aflojados)

**De `pagina` §7, con la sección de casos (`Prueba.tsx`):**
- las tres afirmaciones de los casos con rubro, enlace y pósters;
- las seis imágenes con `alt` y `sizes`.

En su lugar se afirma que el código que lee `PROYECTOS` no nombra los campos prohibidos, y que no hay imágenes.

**De `pagina` §2:** «con un artículo con href, Del blog se monta». Ahora se afirma lo contrario: no se monta ni con `href`.

Los dos retiros quedan escritos en el docblock del test (`pagina.invariant.tsx:14-18` y `:254-255`).

### 5.3 Mutaciones

Se rompió el código fuente a propósito, una cosa por vez, y se restauró con el sha256 verificado. **14 de 14 atrapadas.** Una se repite (el gatillo sin movimiento), corrida otra vez sobre el `disparo.ts` final.

**Versión 1** (`m1\mutaciones.txt`), 10 de 10:
- el h1 vuelve al problema;
- la bajada con heading;
- el claro como hex;
- el CTA detrás de Extra;
- la precarga con el slug;
- el cierre con revelado;
- el gatillo sin movimiento que no vuelve a la vista;
- el enlace a otro caso;
- el llamado progresivo;
- un dictado con una letra cambiada.

**Versión 2** (`m1\ajuste\mutaciones.txt`), sobre `disparo.ts`, 4 de 4:

| Mutación | `pagina` | Qué afirmación cae |
|---|---|---|
| **Sin la guarda**: el reposo no cambia nada | 200 / 2 | los reposos por estado, y «un gatillo a la vista que no cruzó la línea queda visible en reposo» |
| La guarda dispara también lo que no está a la vista | 200 / 2 | los reposos por estado, y «la salida al subir sigue» |
| La línea vuelve al borde | 200 / 1 | «la línea es la del remate del home» |
| El gatillo sin movimiento no vuelve a la vista | 200 / 1 | la de siempre |

El cableado de la guarda en `Gatillo.tsx` (la suscripción al scroll) no lo ve un test de Node, porque el efecto no corre en el servidor. Lo verifica el navegador (§7.3): sin el cableado, la pieza de la franja se queda en `espera`.

---

## 6. Gate (sobre el estado final, versión 2)

Corrido después del ajuste, uno por vez. Antes de cada proceso pesado se esperó a tener 3 GB libres o más y a que el arnés del home terminara.

| Paso | Resultado |
|---|---|
| Lint de los 20 archivos tocados | 0 problemas |
| `tsc --noEmit` normal, con el `tsconfig` del repo | 0 errores |
| `datos` | 55 / 0 (19 controles `ok`); antes del M1, 48 |
| `precios` | 22 / 0 (8) |
| `slots` | 44 / 0 (8) |
| `seo` | 56 / 0 (10) |
| `pagina` | **200 / 0 (100 controles `ok`)**; antes del M1, 157 |

**Los seis barridos de §5.1,** contra la base de merge-2 (§4.3) y corridos con el índice del commit:
- `s4-paquete` 21 / 0;
- `s8-montaje` 56 / 2, las mismas dos fallas del home, con `stderr` idéntico;
- `s8-escena` 33 / 0;
- `s9-sentry` 22 / 0, con los mismos dos «fuera de ventana»;
- `s40-3d-sonido` 38 / 0;
- `s53-pulido-2` 54 / 0.

**Ninguna falla nueva.** Contra la corrida de la versión 1 la salida es idéntica línea por línea. La única diferencia es el conteo de `s4-paquete`, que sube de 4055 a 4056 archivos: es este log.

Contra merge-2, solo cambian los conteos de archivos:
- `s8-montaje` y `s8-escena` suben en uno (2469 → 2470 y 961 → 962): los tres archivos nuevos menos los dos borrados.
- `s4-paquete` sube en tres (4053 → 4056): `SPRINT-merge-2.md` (escrito después de aquel barrido), este log y la diferencia del código.

**Cómo se corrieron:** `s40` lee `git ls-files -co`, así que los barridos corrieron con una copia del índice (`GIT_INDEX_FILE`) donde los dos borrados ya estaban quitados. Vieron el árbol del commit sin tocar el índice real.

**Sin `next build`** (O-10). Salidas de la versión 2 en `C:\paginas-servicios-datos\m1\ajuste\`: `tests/`, `barridos/`, `tsc.txt`, `lint.txt` y `mutaciones.txt`.

---

## 7. Navegador

**Cómo se midió:**
- Playwright con su Chromium, sin WebGL: sin placa, la escena no pinta y cada página deja un error de contexto WebGL, que es esperado.
- Contra el dev de :3001, con `home:intro=1` en `sessionStorage`.
- La ventana se re-emite después de cada captura.
- **Una corrida por vez,** y antes de cada una 3 GB libres y ningún banco ajeno corriendo. La primera cola de la versión 1 usó 2 GB (§8).
- **En la versión 2 no murió ninguna corrida.** La memoria libre más baja fue 2,15 GB (el modal a 1440). Todas arrancaron con 3 GB o más.

Los scripts están en el scratchpad de la sesión; los JSON, en `C:\paginas-servicios-datos\m1\`.

### 7.1 `/v3/paginas-web` × ancho

**El contraste se toma de las corridas con movimiento reducido.** Con movimiento, lo que todavía no entró está en opacidad 0 a propósito, y el instrumento lo cuenta como 1:1.

| Ancho | Contraste mín. cuerpo | Contraste mín. intro | Desborde | Costura | Escondido en pantalla en reposo | Cierre al final del scroll |
|---|---|---|---|---|---|---|
| 1440 | 6,65 (el acento) | 7,21 | no | 0 px | ninguno en 10 paradas | en vista, 0 px de traslación, opacidad 1 |
| 1024 | 6,65 | 7,21 | no | 0 px | ninguno en 11 paradas | en vista, 0 px, opacidad 1 |
| 768 | 6,65 | 7,21 | no | 0 px | ninguno en 11 paradas | en vista, 0 px, opacidad 1 |
| 390 | 6,65 | 7,21 | no | 0 px | ninguno en 13 paradas | en vista, 0 px, opacidad 1 |

Los revelados de esta tabla son todos de la versión 2: la línea al 6 % con la guarda.

**Los «sospechosos» del instrumento son progresivos a mitad de camino:** opacidad 1 y algo de traslación, porque siguen al scroll como está diseñado.
- a 1440: Incluye 6,8 px y Cómo trabajamos 5,2 px;
- a 1024: Incluye 30 px y Precio 15,9 px;
- a 768 y 390: ninguno.

Ningún gatillo aparece entre ellos.

**El llamado también queda en vista al final del scroll,** con 0 px y opacidad 1, en los cuatro anchos.

En los cuatro anchos:
- la intro mide una pantalla, sin fondo propio y en claro;
- el cuerpo va en papel;
- los acentos son `#8FC0E8` en la intro y `#1D5B8F` en el cuerpo;
- `data-servicio` aparece 0 veces;
- no hay imágenes rotas;
- `/api/*` no se llamó ninguna vez.

Contraste por pieza, con movimiento reducido e igual en los cuatro anchos:
- tinta 7,17;
- acento 6,65;
- CTA 6,65;
- enlace del CTA 17,6.

### 7.2 El CTA del precio y el modal (re-medido en la versión 2)

A 1440 y 390, desde `llamado-del-precio` y desde `llamado`, con la X y con Escape:
- el modal abre con `["web"]` marcado y los campos vacíos;
- cierra bien;
- **el `scrollY` es el mismo antes de abrir, con el modal abierto y después de cerrarlo, en las 8 aperturas:** el cambio de scroll da 0;
- `/api/*`: ninguna llamada;
- **el formulario no se envió nunca.**

Los 391 y 362 px de la versión 1 eran del instrumento: el scroll todavía viajaba hacia el CTA. Con la espera larga dan 0.

### 7.3 El gatillo a 1024, bajando y subiendo (versión 2)

| Paso | CTA del precio | Llamado |
|---|---|---|
| Al cargar | `espera`, opacidad 0 | `espera`, opacidad 0 |
| **En la franja sin cruzar** (el tope en 745 de 768; la línea, en 722), recién llegado | `espera`, opacidad 0 | `espera`, opacidad 0 |
| **Ídem, en reposo** | **`puesto`, opacidad 1** | **`puesto`, opacidad 1** |
| Bajando: al medio del cuadro | `puesto`, 1 | `puesto`, 1 |
| Subiendo: debajo del cuadro (tope en 1152) | `ido`, 0, fuera de la vista: la guarda no la trae | `ido`, 0 |
| Bajando otra vez | `puesto`, 1 | `puesto`, 1 |
| **Subiendo despacio** (6 px por cuadro, del 80 % al 99 %) | se va **en 722**, justo en la línea; **16 cuadros yéndose a la vista**, la opacidad baja hasta 0,21 | ídem |
| Ídem, quieto con el tope en 764 (a la vista) | `puesto`, 1: la guarda la vuelve a entrar | ídem |

**Lo que dice la tabla:**
- **El defecto de 1024 ya no está.**
  - La fila de la franja es exactamente su caso: a la vista, debajo de la línea y sin cruzarla.
  - Recién llegado sigue escondido, porque la línea es la del home; en reposo, la guarda lo dispara.
  - En los revelados, la parada de 1152 px, donde estaba el defecto, ya no muestra el CTA escondido.
- **La salida al subir se ve:** arranca en la línea y corre a la vista.
  - Con la línea en el borde (versión 1) habría arrancado fuera del cuadro.
  - El control positivo de `pagina` y la mutación «la línea vuelve al borde» lo cuidan en el test.
- **Fuera de la vista la guarda no actúa:** la fila de «debajo del cuadro» queda `ido`.

**Con movimiento reducido:** `quieto`, opacidad 1, siempre (medido en la versión 1 a 1440; la guarda no cambia ese camino).

**Sin errores de página,** salvo el de WebGL.

### 7.4 El enlace a El Garage

A 1440:
- el `href` es `/v3#portfolio-el-garage`;
- aterriza en el Portfolio en el paso 0, en la fase `adentro`;
- la tira activa es `el-garage`, con el escenario pegado;
- `/api/*`: ninguna llamada.

### 7.5 Software e IA (1440 y 390)

| Página | Ancho | Contraste mín. cuerpo (reducido) | Contraste mín. intro | Desborde | Costura | Acentos (intro / cuerpo) |
|---|---|---|---|---|---|---|
| Software a medida | 1440 | 7,17 (tinta) | 7,21 | no | 0 px | `#AFA0E8` / `#57429E` |
| Software a medida | 390 | 7,17 (tinta) | 7,21 | no | 0 px | ídem |
| IA y automatizaciones | 1440 | 6,02 (la tabla de planes) | 7,21 | no | 0 px | `#7FCBA4` / `#1B6B4C` |
| IA y automatizaciones | 390 | 6,02 (las tarjetas de planes) | 7,21 | no | 0 px | ídem |

En las dos páginas y los dos anchos:
- ningún par está bajo 4,5;
- el acento y el CTA dan 7,31 en Software y 6,02 en IA;
- el orden es el esperado: sin Extra y con el slot 6;
- h1 = `nombre`, y la bajada en dos párrafos;
- las respuestas nuevas del FAQ están en el HTML, iguales a los datos, y el teclado las abre y cierra sin salto;
- la cabecera da 19 / 19;
- `/api/*`: ninguna llamada;
- el único error es el de WebGL;
- el slot 6 no muestra ningún caso web;
- `data-servicio` aparece 0 veces.

---

## 8. Incidentes

**Memoria.** El dev del home (`C:\rediseno-home`) ocupó de 2 a 5 GB durante todo el sprint, y el arnés de carga del home (`scripts-carga/matriz.ts`) corrió dos veces en medio de la re-medición.

**En la versión 1:**
- **Corridas cortadas por el piso de 1,5 GB** (exit 7), cada una reintentada una vez:
  - `estatico-1440`: con el piso de entrada en 2 GB murió las dos veces y la cola se cortó. Se rehizo con el piso en 3 GB.
  - `estatico-390` y `portfolio-1440`: murieron una vez cada una.
- **Dos colas se cortaron** sin memoria antes de empezar una corrida.
- **La última cola la cortó Claude Code** por memoria crítica, con la sesión en espera.
  - Alcanzó a correr una sola corrida.
  - Sus procesos hijos quedaron vivos y se terminaron con `taskkill /T`.
  - No se relanzó por cuenta propia.

**En la versión 2:**
- Todo corrió en primer plano.
- Antes de cada corrida, la espera de los 3 GB y de que no hubiera banco ajeno.
- Nada murió.

**El `tsc` del paso 0 corrió por debajo del piso** (ver §1.2).

**Artefactos del instrumento, no del sitio:**
- el h1 se leía con el texto doble del canal animado, porque la copia visual `aria-hidden` también está en `textContent`; ahora se lee el texto accesible;
- el contraste «1» de las corridas con movimiento, explicado en §7.1;
- el cambio de scroll de la primera apertura del modal, explicado en §7.2.

---

## 9. Fuera de alcance, anotado

- **P-H18:** el gatillo al `_contrato` del home. El día que exista, `disparo.ts` y `Gatillo.tsx` se reemplazan por el import.
- **P-H25 (nuevo):** el gatillo común del home trae la guarda en reposo.
  - Hoy el remate del home (`tu-panel/Remate.tsx`, línea al 6 %) puede tener la misma franja escondida.
  - **No se midió en el home:** está fuera del carril.
- **P-H20 / B12a:** el título 3D de la intro y su alto de 1,5 pantallas. Lo que B12a necesita ya está (§2.1).
- **M2b:** el precio en el teléfono (D15: queda como está).
- **M3:** el video del slot 6.
- **La skill** sigue con su `CONTRATO.md` v1 (merge-2 §2). No se tocó.

---

## 10. Qué mira Valentino

1. http://localhost:3001/v3/paginas-web a 1440, **de la intro al cierre**:
   - el h1 y la bajada en dos párrafos;
   - el orden;
   - el CTA de debajo del precio: entra con el gatillo al asomar y, subiendo, se va recién bien abajo, a la vista;
   - Cómo trabajamos, con las frases y «Ver el portfolio», que aterriza en El Garage;
   - el FAQ quieto;
   - el cierre sin revelado.
2. **La guarda:** parar el scroll con el CTA del precio apenas asomado abajo. A los 180 ms entra, en lugar de quedarse escondido.
   - Se ve mejor a 1024 de ancho, con la ventana de 768 de alto.
   - Lo mismo subiendo: si se para con el CTA todavía asomado, vuelve.
3. Lo mismo a 390.
4. Un vistazo a http://localhost:3001/v3/software-a-medida y http://localhost:3001/v3/ia-y-automatizaciones:
   - las respuestas nuevas del FAQ;
   - el texto del CTA de IA;
   - que no haya nada roto.

---

## 11. Al decir «commit»

1. `git status --short`.
2. `git rm` de los dos borrados.
3. `git add` archivo por archivo de los 20 restantes y de este log (ni `SPEC.md` ni `CONTRATO.md`).
4. `git diff --cached --stat` y `git status --short`.
5. Commit «M1: intro, orden, acento y contenido de la maqueta (sin ver)» (el mensaje de la corrida desatendida).
6. `git push`, sin force.
7. Apagar el dev.
8. Borrar la copia del índice (`C:\paginas-servicios-datos\m1\indice-del-commit`).
