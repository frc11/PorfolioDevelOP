# CONTRATO: la frontera entre el home y las páginas

Es la parte estable de `claude/ESCENA-CONTRATO.md` (en el proyecto de claude.ai). El estado de los pedidos (P-H y P-S) vive allá. **Desde B12a.8 la frontera está construida:** las firmas son las de `docs/rediseno/B12a-API.md` (mandan sobre esta copia; si no coinciden, avisá) y la maqueta que anda es `/v3/pagina-base`, con el paso a paso en la API §7. **Desde B12b, B13, B10 y la cola 2 también están construidos** el viaje, el cierre de cada página (con el FAQ) y las piezas compartidas de abajo; la API §8 y §9 los firman.

## Estructura de una página

La maqueta que anda es `/v3/pagina-base` y el paso a paso, `docs/rediseno/B12a-API.md` §7. Antes de construir, verificá contra el código: la API manda sobre esta copia.

| Tramo | Qué es | De quién |
|---|---|---|
| **1. Intro con escena** | **2,5 pantallas** (`PANTALLAS_DE_LA_INTRO`), de noche, con el acento y la variante. Primero el **título 3D impreso** con su bajada; después un bloque corto de **«de qué se trata»** sobre la escena; después el papel. La cámara hace la pose 2 (girar) a lo largo de toda la intro | **Del home:** la escena, la cámara, el título 3D y la composición. **De la página:** el texto del título, la bajada, «de qué se trata» y la variante |
| **2. Cuerpo en papel** | Secciones opacas, en papel, con los acentos oscuros. Tapan la escena | **De la página** |
| **3. Cierre genérico (B13)** | `CierreDeLaPagina` (API §8), al final del `<main>`: Seis razones → el CTA (abre el contacto con el servicio de la página) → una pantalla de resolución → el pie plano → el FAQ (si la página trae `preguntas`), con la escena de la página y de noche | **Del home** (la pieza, la pista de cámara y la señal `resolucion`). **De la página:** el preset (`tramos.pie`), sus 6 preguntas y que su variante implemente `resolucion` |

**La composición de la intro** (`?composicion=1|2|3`, a elegir por Valentino; sin la bandera, la 3):
1. el título centrado ARRIBA del logo;
2. el título a la DERECHA y el logo a la IZQUIERDA;
3. el título a la IZQUIERDA y el logo a la DERECHA (como el hero del home).
- El logo se corre con el encuadre de la cámara, no moviéndolo; título, bajada y «de qué se trata» en el mismo eje.
- Abajo de 1024, las tres son la 1.

**El `h1` y el título 3D (hechos en B12a.4 y B12a.8):**
- un solo texto con dos versiones: el `h1` del DOM y el título 3D dicen exactamente lo mismo; el `h1` queda siempre en el DOM y es el visible sin 3D (sin WebGL, con movimiento reducido o abajo de 1024);
- **el título es el protagonista:** en una línea, del ancho que le da su columna (en la 1, 60–75 % del cuadro desde 1024; en las de costado, ≥ 85 % de la columna; abajo de 1024, ≥ 85 % del ancho útil);
- lo arma el home (`TituloDePagina`, un preset de `TituloDeVolumen`); la página pone el texto, no arma su título;
- **es 3D como los del home (T4):** fijo en el mundo, y con el mouse se ve en perspectiva con la misma reacción que los títulos del home (sus topes y su suavizado); la bajada va en su plano, como la del hero. Abajo de 1024, la regla del home: el `h1` del DOM;
- en las páginas de servicio el texto es **el nombre del servicio**; el problema va en la bajada.
- **Contraste (P-H33, T5):** sin velo ni mancha detrás del texto: la escena se ve limpia. El título 3D se lee por su volumen, su material (papel, de noche) y su luz; la bajada y «de qué se trata», con una sombra pegada a las letras.

**La REGLA DE ALTURAS no aplica al cuerpo de las páginas:**
- la pista de la intro se ancla al bloque de la intro, y la del pie, a su propia sección;
- el alto del cuerpo en papel (y las secciones ancladas con su propio largo de scroll) no corre la escena.

## Navegación (B12a.5 a B12a.8, hecha)

La firma y el detalle viven en `docs/rediseno/B12a-API.md` §5 y §7; la maqueta que anda, en `/v3/pagina-base`. Esto es el criterio.

**La composición inicial compartida.** Todas las páginas arrancan desde la misma composición de escena: la pose de llegada, con el logo donde la composición de la intro lo pone (`?composicion=`, §Estructura).

| Caso | Qué pasa |
|---|---|
| **Del CTA de Servicios del home a su página** | **El viaje** (B12b, hecho): no pasa la banda sino la escena. Suena la salida, el papel de la sección sube una pantalla, anochece y la cámara baja a la composición inicial de la página; recién ahí se navega, y el velo destapa con la variante ya dibujada. Si la escena no despierta en ~1,5 s, cae a la banda. `?viaje=escena|velo` (sin la bandera, `escena`). La página exporta su preset de un módulo sin JSX para que el home lo apile antes de navegar (API, B12b) |
| **Cualquier otra navegación** (navbar, de página a página, «Home») | 1. La variante vuelve a su composición (`pedirLaSalidaDeLaVariante`), a la par del velo.<br>2. Pasa **el velo**: una banda en diagonal que contrasta con lo que tapa (sobre papel, la tinta; sobre la escena de noche, el papel). Se mueve en el compositor (`transform`): no se traba con el montaje.<br>3. Con el cuadro cubierto, navega; la página nueva se monta tapada y el velo destapa apenas tiene su primer cuadro con el scroll en su lugar. **Una sola pasada, ~1 s.** |
| **Entrada directa** (link) | El preloader del sitio (B12c): una vez por día; la recarga y la navegación interna no lo muestran. Termina en la flecha al botón del sonido y suelta el scroll cuando entra la página |
| **Flecha del navegador hacia el home** | El velo corta y devuelve el home como estaba **en esa entrada del historial**: el scroll, la noche y el día del final |
| **«Home» de la navbar** | En el home, sube al principio; desde una página, va al home con el velo |
| **Vuelta del bfcache** | La variante vuelve a su avance y el velo queda quieto (P-H35) |

**La navbar:**
- La misma píldora del home en todas las páginas (la monta el layout). El orden: **Home** primero, después las secciones.
- **Servicios** es un enlace a `/v3#servicios`. El desplegable con las páginas de servicio abre con el hover (con su demora) y con el teclado (ArrowDown sobre el enlace, o la flechita con Enter). Sin «Todos los servicios».
- En las páginas, la píldora nace **arriba** (donde termina en el home después de subir) y no se mueve con el scroll (`?navbar=abajo` muestra la del home, para comparar). Mientras pasa el velo, se desliza de su lugar al del destino: no salta ni se rearma.
- En el celular, el menú: tocar «Servicios» navega y la flechita de al lado abre el acordeón.
- **[C2-21]** El borde izquierdo de la lista del desplegable queda en el de «Servicios»; con el mouse o el foco en la lista, el resaltado se queda en «Servicios»; cada ítem hace el tic de la barra.

- **Sonido:** uno suave al cubrir y otro al destapar; respeta el mute.
- **Técnica:**
  - `EnlaceDeRuta` (el `<Link>` de next con el velo y la precarga en hover y foco); nunca `router.push`, nunca `TransitionContext.tsx`;
  - el `<Canvas>` vive en el layout de `/v3`: `v3/layout.tsx` → `EscenarioCompuerta` → `EscenaDelHome`, y el lienzo en `_lib/escena/ProbeStage.tsx`;
  - la escena es consciente de la ruta con un preset por página: la pista de cámara de la intro, la noche, el acento y la ranura;
  - **[C2-21] el título espera a la escena:** al llegar a una sección por un viaje del menú, el velo no se va ni el título llega hasta que la cámara está a menos del 1 % de la pose que persigue (`_lib/escena/llegadaDeLaEscena.ts`; techo 1,5 s; a un destino de papel opaco no espera).

## El final del home y el FAQ (B13, B10, C2-71)

El FAQ va **después del pie**, en el home y en cada página; las preguntas de una página viven en su carpeta (6, sin cifras inventadas) y entran por `CierreDeLaPagina` (API §8).

| Dónde | Pie | FAQ |
|---|---|---|
| **Home, desde 1025 con movimiento** | de volumen: el logo que cae se encastra en su hueco y el formulario es una placa de la escena | de volumen (C2-71): sus bloques son placas de la escena como la del formulario; el pie se guarda por columnas (cada una con su base) y abajo sale el botón «Scrolleá una vez más…» (`BotonDelFaq`, una vez por carga) |
| **Página, desde 1024 con movimiento** | plano (el cierre de B13) | dos bloques de vidrio (B10): seguir scrolleando al fondo hunde las columnas del pie; las preguntas a la izquierda, la respuesta a la derecha con WhatsApp en la primera. **No es de volumen, y sin el botón** |
| **Abajo de 1024 o con menos movimiento** | plano | el acordeón de vidrio (C2-71t, `FaqEnLista`): una abierta a la vez, con Tab y las flechas, sin efectos ni WhatsApp. El componente es compartido: también cambia `/v3/pagina-base` |

El texto entero va siempre en el HTML y en `FAQPage`; las preguntas son botones. El botón «Scrolleá una vez más…» del home es un `AvisoDeScroll` con `alTocar`.

## Las grietas del cristal (C2-31g)

- Están en el material del muro del cristal (`_lib/escena/cristal/`: `vidrio.ts`, `grietasDelVidrio.ts`), no en la variante de una página.
- **Por celda:** cada celda dibuja su propia telaraña (rayos desde su centro y anillos), todas a la vez, y se ve formarse de principio a fin.
- `?grietas=centro` (por defecto: el frente va del centro al borde de cada celda) o `?grietas=borde` (al revés). Los valores viejos (`1`, `2`, `3`, `no`) caen al por defecto; `?grietas-prueba=si` repite el ciclo solo.
- **Sin brillo en el home:** ahí sólo hay la banda oscura (de noche, un gris tenue). La luz es del acento de una página que lo tiene (`brillanLasGrietas`, `cristal/grietas.ts`).
- Costo: 0,103 ms por cuadro en el home con `centro` (tope 0,1), bajo el tope con `borde`; hay que medirlo en el build.

## Ranura de variantes (B12a.3, hecha)

- La variante es un componente de R3F que vive en `src/app/v3/_servicios/escena/` (o en la carpeta de la página dueña): un módulo `'use client'` con `export default`, registrado con su id en `_variantes/registro.ts`. El preset de la página lleva ese id.
- Recibe el avance de la intro, el acento (el claro), la calidad, si el usuario pidió menos movimiento, la luz de abajo y la energía (para teñirlas) y la señal de salida.
- La firma exacta, el presupuesto por cuadro (0,5 ms) y cómo se mide están en `docs/rediseno/B12a-API.md` §4; la referencia que anda es la de `/v3/pagina-base` (`esc/ruta/VarianteDePrueba.tsx`).
- La ranura la desmonta al salir de la página; antes, `EnlaceDeRuta` le pide la salida (la luz vuelve a la composición mientras pasa el velo).

## Piezas compartidas (se importan; no se copian ni se modifican)

Las de la cola 2 se ven juntas en `/v3/piezas` (instrumento, `noindex`). Las firmas de las cuatro primeras: API §9.

| Pieza | Dónde |
|---|---|
| Modal de contacto | `_chrome/contacto/Contacto.tsx`; abre con `[data-abre-contacto="panel"]` (`_chrome/contacto/apertura.ts`); preselección con `data-precarga="<IdDeServicio>"` |
| `data-servicio` | Solo el contexto del acento del tema (`src/app/theme-develop.css`, `_secciones/_contrato/acento.ts`) |
| Logotipo | `LOGOTIPO`, en `_componentes/marca/sistema.ts` |
| Casos | `PROYECTOS`, en `_secciones/trabajos/proyectos.ts`; los medios, en `public/portfolio/<slug>/`. **Hoy los tres son de desarrollo web:** una página de otro servicio no los muestra como propios |
| Enlace al Portfolio | Los deep links de B1 (formato en `docs/rediseno/SPRINT-B1-PORTFOLIO.md`), sin filtro por servicio por ahora |
| Precios | `PRECIOS_DESDE`, en `src/app/v3/_servicios/precios.ts` |
| Revelados | `_secciones/_contrato/` |
| Llave de contenido falso | `_secciones/_contrato/llave.ts` |
| `EstadoDeEnvio` (C2-20) | `_componentes/formularios/EstadoDeEnvio.tsx` (lo puro y los textos, `_lib/formularios/estadoDeEnvio.ts`). El estándar de envío de los formularios que no son el del pie: el formulario no se desmonta; carga, encastre del logo y mensaje; vuelve a `reposo` en `alVolver` |
| `AvisoDeScroll` (C2-20, C2-70t) | `_componentes/avisos/AvisoDeScroll.tsx`. Texto corto con dos chevrones. `tono`: `papel` | `escena`; `alTocar` lo vuelve un `<button>`; `direccion="costado"` para un carrusel que se desliza (chevrones hacia la derecha) |
| `Reluciente` (C2-20) | `_componentes/efectos/Reluciente.tsx` (y `RELUCIENTE`, el ritmo, para la escena): el reflejo que pasa por una caja (`como="caja"`, con `relative` y `overflow-hidden`) o por las letras (`como="texto"`); quieto con movimiento reducido |
| Autocompletado | Global, en `_estilos/piezas.css`: todo `input`, `textarea` y `select` de /v3 conserva su fondo y su tinta cuando el navegador autocompleta. No se importa nada |
| `CarruselDeTarjetas` (C2-40, C2-41t) | `_componentes/carrusel/CarruselDeTarjetas.tsx`. El carrusel común del Portfolio y de Demos abajo de 1024. `asoma` (opcional, `asoma.ts`): una tarjeta grande y la siguiente asomada a la derecha, más chica y apagada; el dedo la arrastra y un toque a la que asoma la trae. Sin `asoma`, el Portfolio queda igual |
| `TitularQueSeLevanta` (C2-40, C2-41t) | `_secciones/trabajos/portfolio/levantarse.tsx`. El titular se levanta desde abajo de su ventana, de acostado a parado, cuando cruza la línea; es el efecto de los títulos del flujo (sin 3D, abajo de 1024) y lo usan el Portfolio y Demos en el teléfono. Con movimiento reducido salta |
| `CierreDeLaPagina` (B13, B10) | `_componentes/pagina/cierre/CierreDeLaPagina.tsx`, con el FAQ de `_componentes/faq/` (`FaqDelPie`, `preguntas.ts`). API §8 |
| Otras | `Cta`, `Titular`, los textos de `Textos.tsx` (`Cuerpo`, `Caption`, `Micro`…), `Envoltorio`, `Imagen`, `IdDeServicio` |

**Reservados del home**, que las páginas no usan:
- los ids de las secciones y `portfolio-*`;
- `data-panel`, `data-seccion-id` y `data-servicio`;
- `data-seccion`, salvo `invertida` en la raíz.

## Colores de servicio

| Paleta | Web | Software | IA | Dónde |
|---|---|---|---|---|
| Oscuros | `#1D5B8F` | `#57429E` | `#1B6B4C` | Cuerpo en papel. Tokens `--color-acento-web`, `--color-acento-software`, `--color-acento-ia-automatizacion` |
| Claros | `#8FC0E8` | `#AFA0E8` | `#7FCBA4` | Sobre la escena: la intro, la luz y las variantes. Tokens `--color-acento-web-claro`, `--color-acento-software-claro`, `--color-acento-ia-automatizacion-claro` (y el alias `--color-acento-claro`), desde B1.2c |

- Se usan los tokens, nunca el hex escrito a mano.
- La paleta vieja de cian, verde, ámbar y violeta **no se usa**.
- Se mide cada combinación de texto contra AA.

## Fronteras

- **El home** (rama `rediseno/home`) es dueño de:
  - `src/app/v3/_lib/**`, `_secciones/**`, `_chrome/**`, `_componentes/**` y `_archivo/**`;
  - `src/app/v3/layout.tsx` y `src/app/v3/page.tsx`;
  - `src/app/layout.tsx`, `globals.css` y `theme-develop.css`;
  - `public/v3/**` y `public/portfolio/**`;
  - `docs/rediseno/**`, `scripts-carga/**` y `scripts-portfolio/**`;
  - `package.json` y el lockfile.
- **Servicios** (rama `paginas/servicios`) es dueño de:
  - `src/app/v3/[servicio]/` y `src/app/v3/_servicios/` (incluida `escena/`);
  - `docs/servicios/`;
  - `public/servicios/**`, sus assets (el video de montaje, por ejemplo);
  - `scripts-servicios/**`, sus scripts de producción.
- **`public/portfolio/` se puede leer** para producir assets propios (por ejemplo, con ffmpeg como binario del sistema, sin dependencia nueva). Nunca se escribe ahí.
- **Si te sirve un script del home**, copiá el enfoque en tu carpeta: no lo edites ni lo importes.
- **De nadie** (compartido con el sitio vivo): `src/lib/` (con `scene-camera.ts` y `chromeReveal.ts`), `src/components/layout/` (el chrome del sitio vivo) y las zonas de Franco.
- Si necesitás algo del otro lado, no lo tocás: lo pedís en el reporte como un pedido nuevo (P-H para el home, P-S para servicios).
