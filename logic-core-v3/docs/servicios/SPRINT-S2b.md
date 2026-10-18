# SPRINT S2b — Las tres páginas publicadas y verificadas en navegador

Versión 1 · 2026-10-17 · Autor: CC (S2b) · Plan: `docs/servicios/SPRINT-S0.md` v2 · Viene de: `docs/servicios/SPRINT-S1b.md` (§8 «Qué falta ver en pantalla», §9 pedidos, §11).

**Estado en una línea:** `PUBLICADOS` tiene los tres servicios y la ruta sirve `/v3/paginas-web`, `/v3/software-a-medida` y `/v3/ia-y-automatizaciones`. El gate sin navegador está en verde (lint, seis barridos iguales a la base, cinco tests, tsc completo en 0 errores) y la pasada en navegador se hizo en las tres páginas a 1280 y 390, con las medidas de desborde, apilado y contraste también a 375, 768, 1023 y 1024. **Se encontró y se arregló un defecto** (el panel del FAQ se corría al abrir una pregunta, §6). Valentino vio la pasada y tomó tres decisiones (§9): el panel del FAQ se queda quieto, la tabla de planes de IA pasa a tarjetas por debajo de 640 px en el S2c y «Probá el panel» se queda en tinta. **Commiteado** como «S2b: tres paginas publicadas y verificadas en navegador» (el hash no puede ir en este archivo: un commit no lleva su propio hash); al cerrar, el dev quedó apagado, sin procesos del navegador de prueba y con el candado soltado (§10).

---

## 0. Notas del contrato ESCENA v3

Valentino lo releyó y dictó tres cosas; CC **no puede leer** `ESCENA-CONTRATO.md` (vive en el proyecto de Claude, igual que `CIERRE-HOME-V3.md`), así que se anotan tal como llegaron:

| Id | Qué se dijo | Dónde queda |
|---|---|---|
| **P-H10** (el foco vuelve al botón al cerrar el modal) | Va al sprint P-H del home. | Confirmado otra vez en las tres páginas (§8): al cerrar, `document.activeElement` queda en `BODY`. Solo se anota, Servicios no lo toca. |
| **P-H6** (el modo del contacto sin la barra) | Sale. | Nada que hacer: el modal abre bien a 1280 y a 390 (§8). |
| **P-H11** (`movil.webp` de El Garage mal exportado) | Lo arregla el home en B1.2b. | Sigue visible en `Prueba` de Páginas web a 390 (§5): el póster móvil de El Garage sale gris salvo el cuarto de arriba a la izquierda. |

**P-H12 del S1b (`twitter:*` heredaba el título y la descripción del home): retirado.** Lo resolvió Servicios: `metadataDe` arma `twitter` propio, como ya armaba `openGraph` (§1). El id queda libre y los pedidos nuevos arrancan ahí (§9).

---

## 1. Qué cambió en el código

| Archivo | Cambio |
|---|---|
| `_servicios/rutas.ts` | `PUBLICADOS` = `['paginas-web', 'software-a-medida', 'ia-y-automatizaciones']`, en el orden del SPEC. Es el único lugar: sacar uno lo devuelve a 404 y lo saca del cierre de las otras. |
| `[servicio]/page.tsx` | Los comentarios dicen que están los tres. `generateMetadata` le pasa a `metadataDe` también las imágenes de `twitter` del padre. |
| `_servicios/seo.ts` | `metadataDe` suma `twitter` propio (`summary_large_image`, título y descripción de los datos, imágenes del padre): sin esto el `twitter:*` heredaba el del home. |
| `bloques/PanelDeVidrio.tsx`, `bloques/Bloque.tsx`, `bloques/Faq.tsx` | **El arreglo de §6**: `PanelDeVidrio` acepta `quieto` (sin revelado), `Bloque` lo recibe como `panelQuieto` y el FAQ lo pide. |
| `__tests__/pagina.invariant.tsx` | Con los tres publicados: el control del enlace usa una página que no existe (`/v3/otra-pagina`), el cierre se verifica por página, `PUBLICADOS` es igual a los tres servicios, y la ruta da 404 para `xyz`, `paginas-web/x` y `Paginas-Web`. **Más** (§6): afirma que el panel del FAQ no se revela y el de todos los otros bloques sí, con dos controles positivos. 108 → 123 afirmaciones (120 con la publicación, 123 con el arreglo del FAQ). |
| `__tests__/seo.invariant.ts` | Afirma el `twitter` propio (tarjeta, título, descripción, imágenes) y detecta uno heredado. 50 → 56 afirmaciones. |

Ningún test se aflojó. Lo que sigue sin tocar: todo lo del home (`_secciones/`, `_chrome/`, `_lib/`), `HeroArtifact`, los contextos congelados, `prisma/`.

---

## 2. Gate sin navegador

| Paso | Resultado |
|---|---|
| ESLint de los 8 archivos `.ts`/`.tsx` tocados | 0 errores, 0 avisos |
| `datos` · `precios` · `slots` · `seo` · `pagina` (`npx tsx`) | 48/0 · 22/0 · 34/0 · 56/0 · **123/0** |
| Mutación del arreglo: sacar `panelQuieto` del FAQ | la afirmación nueva falla en las 6 vistas (3 páginas × desarrollo/producción) y vuelve a verde al restaurar |
| Seis barridos (§5.1 del plan) | `s4-paquete` 21/0 · `s8-montaje` 56/**2** (las mismas dos fallas de la base: archivos del home que pasan las 300 líneas, ninguno nuestro) · `s8-escena` 33/0 · `s9-sentry` 22/0 (2 fuera de ventana, igual que la base) · `s40-3d-sonido` 38/0 · `s53-pulido-2` 54/0 |
| tsc acotado a lo de Servicios | 0 |
| **tsc completo, con el candado** | **0 errores.** 46 s antes del arreglo del FAQ y 16 s (incremental) después, los dos con el candado tomado |

El tsc completo corrió a las 20:54, apenas el home soltó el candado (esperé desde las 20:40; el home tenía su banco de carga corriendo contra `:3101`, lo vi vivo por la línea de comandos y la CPU de su Chrome). El candado se tomó **una sola vez** para el tsc, el dev y el navegador, para no dejar un hueco entre los tres; queda tomado hasta el «commit» (§10).

---

## 3. Cómo se midió

- **Servidor:** `npm run dev -- -p 3001` (Next 16.2.9, webpack), log en `C:\paginas-servicios-datos\dev-S2b.log`. Ocupa unos 3,4 GB.
- **Navegador:** `chrome-devtools` no reconectó, así que se manejó Chromium (la build de Playwright 1.61.1) por script: ventanas emuladas de 1280×800, 1025×768, 1024×768, 1023×768, 768×1024, 390×844 y 375×667 (táctil en las tres últimas), `deviceScaleFactor` 1, página siempre visible (`visibilityState` y `innerWidth` se comprueban antes de medir). Los scripts viven en el scratchpad de la sesión, **no en el repo**: miden y no escriben nada. Resultados en `C:\paginas-servicios-datos\s2b\*.json`.
- **Sin WebGL, y por qué es fiel.** Las páginas de servicio tienen la tapa opaca encima del lienzo de la escena, así que lo que se ve no depende de la escena. La primera corrida, con WebGL por software y el Chrome del banco del home todavía vivo, bajó de 1,5 GB libres y el runner se cortó solo; sin WebGL el mínimo fue de 2,6 a 3,5 GB, y con el home ya sin procesos un control con WebGL prendido tuvo de 3,0 a 3,5 GB (se podría haber medido con él). Control: con y sin WebGL, **0 diferencias** de DOM, apilado, contraste y acentos (Páginas web a 1280). Costo conocido: el overlay del dev marca «4 Issues» (el error de THREE por no tener contexto) y hay un `[role="dialog"]` oculto del overlay de errores de Next; los selectores del modal van acotados por eso. Con WebGL prendido, en un control aparte de las tres páginas a 1280: **cero errores de página, cero requests fallidos, cero respuestas ≥ 400, cero llamadas a `/api/*`**; en la consola, solo la advertencia de shader de la escena del home (`X4122`, la misma que ya figuraba en la S1b).
- **El formulario nunca se envió.** Los modales se abrieron y se cerraron; no se escribió en ningún campo.
- **El log del dev** (`dev-S2b.log`) trae líneas `[browser]` de estas corridas —el error de WebGL y el aviso de «Reduced Motion enabled» de las corridas con movimiento reducido—, más la advertencia de shader de la escena: no son de las páginas.
- **No se despachó `visual-qa`:** levantaría su propio servidor de preview (otros ~3 GB) con el candado tomado y la memoria justa, y la pasada la hizo CC contra el dev de `:3001` con medición de DOM, contraste y capturas (el estándar de `CLAUDE.md` para sprints que tocan pantallas queda sin cumplir a la letra; si Valentino lo quiere, se despacha contra `:3001`).
- **Corte de memoria:** el runner se corta solo si la memoria libre baja de 1,5 GB (lo hizo una vez, al principio, con WebGL prendido y el Chrome del banco del home todavía vivo).

---

## 4. Estados HTTP (dev, `curl`)

| Ruta | Estado |
|---|---|
| `/v3/paginas-web` | **200** (17,7 s la primera vez: compila la ruta) |
| `/v3/software-a-medida` | **200** |
| `/v3/ia-y-automatizaciones` | **200** |
| `/v3/xyz` | **404** |
| `/v3/paginas-web/x` | **404** |
| `/v3/Paginas-Web` (otra capitalización) | **404** |
| `/v3/componentes` | **200** (los segmentos estáticos de `/v3` le siguen ganando al dinámico) |
| `/v3/tipografia/muestra` | **200** |

---

## 5. La pasada visual y las medidas en reposo

Leí las capturas de las tres páginas a 1280 (con la coreografía, de arriba abajo a pasos de 0,85 de la ventana, y con movimiento reducido, que es el layout final sin revelados) y a 390 (hojas de tres capturas), más 768 y 1023 en las dos páginas que mostraban algo distinto.

| Página | 1280 | 390 |
|---|---|---|
| **Páginas web** | ✅ Vidrio sobre la tapa (paneles de 4 % de tinta, desenfoque de 20 px, borde fino), un solo acento (azul `#8FC0E8`), tres calibres en tres columnas con su «Desde USD 200 / 600 / 1.000», los `[a definir]` son solo marcadores de desarrollo. | ⚠️ ✅ salvo el póster móvil de El Garage (`movil.webp`, **P-H11**, lo arregla el home). Todo apila, sin desbordes. |
| **Software a medida** | ✅ Un acento (violeta `#AFA0E8`), precio «Desde USD 1.000 — Se cotiza según lo que necesites», casos propios con sus marcadores. | ✅ |
| **IA y automatizaciones** | ✅ Un acento (verde `#7FCBA4`), la tabla de planes entera (Starter, Pro, Business) con «Por mes USD 49 / 90 / 150»; «Implementación desde» es marcador de desarrollo. | ⚠️ La tabla scrollea adentro de su caja, como se pidió, y la página no se mueve. Pero **no hay ninguna pista de que scrollea** (se ve Starter y nada de Pro ni Business) y, scrolleada, la columna de rótulos se va y quedan números sin fila. Ver §9. |

Marcas de lectura:

- ✅ **Sin fondos propios.** Lo único opaco de la página es la tapa (`fixed`, `-z-10`, `#0E0E0E`); lo otro con fondo es el punto de acento del rótulo del h1. Los paneles son `color-mix` de tinta al 4 % (`#171717` sobre la tapa) con `blur(20px) saturate(1.8)`: leen sobre la tapa y el borde los separa.
- ✅ **Un acento por página, y el que corresponde.** En los estilos computados de toda la página, el único color con croma es el acento claro del servicio (18, 11 y 14 usos), y `--color-acento` en la raíz vale lo mismo. Ninguno de los otros dos acentos aparece.
- ⚠️ **En reposo, con la coreografía, los paneles de abajo de la ventana están a medio subir.** Es el revelado P2 del home, atado al scroll y reversible: un panel que está al borde de abajo está desplazado hasta 227 px y sube al acercarse. No hay nada invisible (§7), pero la separación entre paneles *parece* despareja en las capturas con coreografía. Con movimiento reducido, que es el layout final, todas las separaciones son iguales. **La coreografía la juzga Valentino.**
- ❓ **Producción.** En el navegador solo se ve el modo desarrollo (con los `[a definir]`). El modo producción, donde esos ítems no se montan, está cubierto por el invariante (que renderiza los dos modos) y no se vio en pantalla.

### A. Reposo, por página y ancho

| Página | Ancho | Documento sin desborde | Bloques | Contraste mínimo | Acento (único cromático) | Fondos propios | Imágenes rotas | Tabla de planes |
|---|---|---|---|---|---|---|---|---|
| Páginas web | 1280 | sí (1280 ≤ 1280) | lado a lado, calibres en 3 col. | 6,67:1 | #8FC0E8 | 2 (tapa + punto de acento) | 0 | — |
| Páginas web | 1024 | sí (1024 ≤ 1024) | lado a lado, calibres en 3 col. | 6,67:1 | #8FC0E8 | 2 | 0 | — |
| Páginas web | 1023 | sí (1023 ≤ 1023) | apilado, calibres en 1 col. | 6,67:1 | #8FC0E8 | 2 | 0 | — |
| Páginas web | 768 | sí (768 ≤ 768) | apilado, calibres en 1 col. | 6,67:1 | #8FC0E8 | 2 | 0 | — |
| Páginas web | 390 | sí (390 ≤ 390) | apilado, calibres en 1 col. | 6,67:1 | #8FC0E8 | 2 | 0 (el `movil.webp` de El Garage carga, pero mal exportado: P-H11) | — |
| Páginas web | 375 | sí (375 ≤ 375) | apilado, calibres en 1 col. | 6,67:1 | #8FC0E8 | 2 | 0 | — |
| Software a medida | 1280 | sí | lado a lado | 6,67:1 | #AFA0E8 | 2 | 0 | — |
| Software a medida | 1023 | sí | apilado | 6,67:1 | #AFA0E8 | 2 | 0 | — |
| Software a medida | 768 | sí | apilado | 6,67:1 | #AFA0E8 | 2 | 0 | — |
| Software a medida | 390 | sí | apilado | 6,67:1 | #AFA0E8 | 2 | 0 | — |
| Software a medida | 375 | sí | apilado | 6,67:1 | #AFA0E8 | 2 | 0 | — |
| IA y automatizaciones | 1280 | sí | lado a lado | 6,67:1 | #7FCBA4 | 2 | 0 | entra (761 px) |
| IA y automatizaciones | 1023 | sí | apilado | 6,67:1 | #7FCBA4 | 2 | 0 | entra (909 px) |
| IA y automatizaciones | 768 | sí | apilado | 6,67:1 | #7FCBA4 | 2 | 0 | entra (654 px; el mínimo de la tabla son 640) |
| IA y automatizaciones | 390 | sí | apilado | 6,67:1 | #7FCBA4 | 2 | 0 | **scrollea adentro** (640 > 276), **la página no** |
| IA y automatizaciones | 375 | sí | apilado | 6,67:1 | #7FCBA4 | 2 | 0 | **scrollea adentro** (640 > 261), **la página no** |

El corte de dos columnas es en **1024** (a 1023 apila, a 1024 va lado a lado). Los anchos que se pidieron por debajo de 1024 (375, 390, 768 y 1023) apilan todo y no desbordan: el documento mide lo mismo que la ventana y ningún elemento queda fuera del recorte de un ancestro.

---

## 6. El defecto que se encontró y se arregló: el panel del FAQ se corría al abrir una pregunta

**Qué pasaba.** Con Lenis (arriba de 1024 y sin movimiento reducido), abrir una pregunta no hace saltar el scroll (`scrollY` no cambia: 0 px en las tres páginas), pero el **panel entero se corría hacia abajo** y se llevaba la pregunta recién clickeada: el segundo clic en el mismo lugar ya no la cerraba. Medido cuadro por cuadro con el resumen de la pregunta en distintos lugares de la ventana:

| Dónde estaba la pregunta | Antes del arreglo | Después |
|---|---|---|
| Arriba o al medio de la ventana (el panel «llegó») | 0 a 0,2 px | 0 px |
| Abajo (el panel todavía sube): Páginas web, preguntas 1 y 3 / Software / IA | **+26 / +27 / +26 / +15 px**, en **dos saltos** (≈ 0,3 s y ≈ 0,5 s después del clic) | **0 px** (en las cuatro, con la pregunta al borde de abajo: 775 de 800 px) |
| Al medio, en la corrida del teclado (Páginas web / Software / IA) | 16,4 / 12,8 / 11,3 px | 0 / 0 / 0 px |
| Con movimiento reducido, o debajo de 1025 | 0 px | 0 px |

**Por qué.** El panel de cada bloque se revela con el patrón P2 del home, atado al scroll y medido sobre la caja del bloque. El motor del home observa el alto del documento y, cuando cambia (una pregunta que se abre lo agranda), abre una época nueva y vuelve a medir todos los bloques, dos veces (`resize` y `reposo`). El panel del FAQ cambia de alto con lo que hace quien lo mira, y con el panel en la mitad de abajo de la ventana (revelado a medias) el recálculo lo corría.

**El arreglo.** El panel del FAQ **no se revela** (`panelQuieto` → `PanelDeVidrio quieto`): aparece en su lugar. El **título** del bloque entra por línea como los demás. Es un cambio de coreografía de un solo bloque, no de diseño. **Valentino lo vio y lo dejó así** (decisión 1, §9). Volver atrás sería sacar `panelQuieto` de `Faq.tsx`, y el invariante avisaría, porque ahora afirma lo contrario. El invariante nuevo afirma: título y panel entran en todos los bloques (2 revelados), menos el FAQ (1: solo el título) y el cierre (1: solo el panel, no tiene título).

No se tocó nada del home: el motor, `Revelado` y el contrato de coreografía siguen intactos. Otro bloque con alto dinámico dentro de un P2 le pasaría lo mismo (anotado en §9 como observación).

---

## 7. Lo que se verificó, punto por punto

### B. FAQ (con el arreglo)

| Página | Ancho | Preguntas (con respuesta) | Respuestas en el HTML cerrado | Tab hasta la 1.ª | Enter / Espacio | Anillo de foco | Corrimiento del panel al abrir (antes → después) |
|---|---|---|---|---|---|---|---|
| Páginas web | 1280 | 5 (5) | 5/5 | 5 paradas | abre y cierra, el foco se queda | visible: contorno de 2 px `#F7F7F5` a 2 px + halo de 6 px `#0E0E0E` | scroll 0 px; panel 16,4 → 0 px |
| Páginas web | 390 | 5 (5) | 5/5 | 5 paradas | ídem | ídem | scroll 0 px; panel 0 px |
| Software a medida | 1280 | 4 (2) | 2/2 | 2 paradas | ídem | ídem | scroll 0 px; panel 12,8 → 0 px |
| Software a medida | 390 | 4 (2) | 2/2 | 2 paradas | ídem | ídem | scroll 0 px; panel 0 px |
| IA y automatizaciones | 1280 | 6 (5) | 5/5 | 4 paradas | ídem | ídem | scroll 0 px; panel 11,3 → 0 px |
| IA y automatizaciones | 390 | 6 (5) | 5/5 | 4 paradas | ídem | ídem | scroll 0 px; panel 0 px |

- Las respuestas están **en el HTML que manda el servidor**, cerradas por defecto, palabra por palabra igual a los datos (se leyó el HTML crudo con `fetch` y se parseó, y se comparó con el DOM hidratado).
- **Las preguntas con respuesta `null` no salen en el JSON-LD** (el `FAQPage` tiene solo las respondidas, en orden). **En el navegador de desarrollo sí aparecen**, con el marcador `[a definir]` en lugar de la respuesta: es el diseño (el marcador existe solo en desarrollo, plan §8.4; en producción esas preguntas no se montan, lo afirma el invariante).
- Tab recorre las preguntas una por una (cada `summary` es una parada, sin paradas de más), y la última lleva al botón del llamado. En IA, la caja de la tabla de planes es una parada con anillo visible y, a 390, **las flechas la scrollean** (a 1280 la tabla entra y no hace falta).

### C. `<head>` y JSON-LD (renderizados, y comparados con lo que manda el servidor)

| Página | Comprobaciones | Falla | title / description | robots | canonical / og:url | twitter | JSON-LD |
|---|---|---|---|---|---|---|---|
| Páginas web | 28/28 | — | de los datos | `noindex, nofollow, nocache` | /v3/paginas-web / /v3/paginas-web | `summary_large_image`, título, descripción e imagen propios | Service + FAQPage + BreadcrumbList |
| Software a medida | 28/28 | — | de los datos | ídem | /v3/software-a-medida / ídem | ídem | ídem |
| IA y automatizaciones | 28/28 | — | de los datos | ídem | /v3/ia-y-automatizaciones / ídem | ídem | ídem |

Las 28 incluyen: un solo `canonical` y un solo `og:url`, **los de la propia página** (resueltos a `https://develop.com.ar/v3/<slug>`) y ninguno apunta a la raíz; `og:title`, `og:description`, `og:type`, `og:site_name`, `og:image`; el JSON-LD parsea, es exactamente lo que arma `jsonLdDe` para esa página y es igual en el HTML del servidor y en el DOM; el `FAQPage` tiene solo las preguntas con respuesta; las migas son Inicio › servicio con URLs absolutas; **en IA el precio es mensual** (`UnitPriceSpecification` con `unitCode: MON`, desde USD 49) y en las otras dos es único (USD 200 en Páginas web, USD 1.000 en Software). (La comprobación 29, un meta `googlebot`, no corresponde: Next emite solo `robots` si no se declara `googleBot`; se descartó.)

### D. Contraste (computado en el navegador, sobre el vidrio, sobre el color resultante)

Para cada nodo con texto visible: el color del texto mezclado con su opacidad, sobre la composición de todos los fondos translúcidos de sus ancestros encima de la tapa (`#0E0E0E` → vidrio `#171717`). Con las respuestas del FAQ abiertas y cerradas.

| Texto sobre fondo | Razón | Dónde |
|---|---|---|
| `#9E9E9E` (tinta media) sobre `#171717` | **6,67:1** — el mínimo de todo | las leyendas «Desde», las conversaciones del plan, textos secundarios (11,8 a 15 px) |
| `#9E9E9E` sobre `#0E0E0E` | 7,21:1 | el rótulo del h1 (10 px) |
| acento sobre `#171717` | 9,25 (azul), 7,67 (violeta), 9,35 (verde) :1 | precios, «Desde el panel», botones |
| `#F7F7F5` sobre `#171717` | 16,66:1 | el cuerpo |
| `#F7F7F5` sobre `#0E0E0E` | 18:1 | el logotipo |

Mínimo medido en las tres páginas a 1280, 1023, 768, 390 y 375: **6,67:1** (≥ 4,5 pedido). Ninguna combinación bajo 4,5. El anillo de foco (`#F7F7F5` sobre el vidrio) da 16,7:1.

### E. Revelados y movimiento reducido

- **Nada invisible en reposo**, en las tres páginas: cuatro escenarios (arriba en reposo; carga con ancla al FAQ, o sea con el scroll a mitad de página; recarga; vuelta al tope) más 6–8 paradas **subiendo** desde el ancla y 7–9 **bajando** de a 400 px, esperando 1,3 s en cada una. En todas, cada bloque a la vista tiene opacidad 1 (el P2 desplaza, no desvanece) y los títulos a la vista terminaron de entrar. Un panel al borde de abajo está a medio subir (§5), y llega al subir o bajar la ventana.
- (Una recarga a mitad de página no restaura el scroll —la página siempre abre arriba—; la carga con scroll a mitad se probó con el ancla `#titular-servicio-faq`.)
- **Movimiento reducido** (1280): Lenis apagado y ningún elemento con opacidad menor a 1 ni transformación, salvo las copias `aria-hidden` del rollover de los botones (por diseño del `Cta`). Sin revelado: el contenido sale pelado y en su lugar.

### F. Modal de contacto

| Página | Ancho | Interés marcado al abrir | Disparadores y cierres probados | Hoja dentro del viewport | Foco al abrir | Tras cerrar | Cambio de scroll | `/api/*` |
|---|---|---|---|---|---|---|---|---|
| Páginas web | 1280 | `web` ✓ | 4 (el botón del bloque y el del cierre × la X y Escape) | sí, 944×619 | dentro de la hoja | cerrado; el foco queda en `BODY` | 0 | 0 |
| Páginas web | 390 | `web` ✓ | 4 | sí, 326×726 | dentro de la hoja | ídem | 0 | 0 |
| Software a medida | 1280 y 390 | `software` ✓ | 4 y 4 | sí | dentro | ídem | 0 | 0 |
| IA y automatizaciones | 1280 y 390 | `chatbot` + `automatizaciones` ✓ | 4 y 4 | sí | dentro | ídem | 0 | 0 |

- Los intereses marcados son los que dice `PRECARGA_POR_SERVICIO` del home para cada servicio (web → `web`, software → `software`, IA → `chatbot` y `automatizaciones`). No se escribió nada ni se envió: los campos quedaron vacíos.
- **El foco queda en `BODY` al cerrar (P-H10)**, en las 24 cerradas: el disparador que el contacto recuerda es el `div` envoltorio, que no es enfocable. Solo se anota.
- **Un falso positivo que conviene dejar escrito.** Automatizando, el clic sobre la X «no entra»: Playwright dice que `div[data-cara="atras"]` **intercepta** los eventos del puntero y reintenta 30 s. No es un defecto del sitio. La placa 3D del contacto tiene cinco caras `aria-hidden` detrás del frente (`PlacaDelContacto.tsx`), y `document.elementsFromPoint` —un hit-test por lista, en orden del DOM— pone la cara de atrás arriba de todo en cualquier punto de la hoja; Playwright usa eso para decidir si el elemento «recibe» el clic. Con un clic real (`mouse.click`) el modal se cierra y los campos reciben el foco, con y sin GPU. Se registra como sugerencia menor (§9).

---

## 8. Lo que Valentino miró

`http://localhost:3001/v3/paginas-web` · `http://localhost:3001/v3/software-a-medida` · `http://localhost:3001/v3/ia-y-automatizaciones`, cada una en escritorio y a 390 (modo dispositivo), con el FAQ abierto y cerrado y abriendo y cerrando el botón de llamado y el del cierre.

Lo que **solo él podía juzgar**, y qué salió:

1. La coreografía: el revelado de los paneles y los títulos (en reposo, los de abajo de la ventana están a medio subir) y que el panel del FAQ ahora aparece en su lugar. → **El panel del FAQ se queda quieto** (decisión 1, §9). El resto de la coreografía no se tocó.
2. La tabla de planes de IA a 390. → **Pasa a tarjetas por debajo de 640 px, en el S2c** (decisión 2, §9).
3. Cómo se ve el modo producción (los `[a definir]` no se montan). → Sigue sin verse en pantalla: lo cubre el invariante (renderiza los dos modos).
4. La escena a la vista: las páginas todavía la tapan (B12). → Sin cambios.

---

## 9. Pedidos, observaciones y decisiones

### Pedidos al home

| Id | Estado | Qué |
|---|---|---|
| **P-H10** | Va al sprint P-H (dicho por Valentino). | El foco vuelve a `BODY` al cerrar el modal (el disparador es un `div`). Confirmado en las tres páginas. |
| **P-H11** | Lo arregla el home en B1.2b. | `public/portfolio/el-garage/movil.webp` mal exportado. Se ve en `Prueba` de Páginas web a 390. |
| **P-H12** *(nuevo)* | Sugerencia menor. | `pointer-events: none` en las cinco caras de la placa del contacto (`CARAS` en `PlacaDelContacto.tsx`): son decorativas y `aria-hidden`, y hoy reciben el «hit» de `elementsFromPoint` en toda la hoja. A un usuario no le pasa nada; sí a la automatización (Playwright reintenta 30 s) y a cualquier herramienta que decida el destino con ese hit-test. |

### Observaciones (no son pedidos)

- **El motor re-mide los bloques cuando cambia el alto del documento** (`epoca.ts`, el `ResizeObserver` del `body`, dos veces: `resize` y `reposo`). Cualquier bloque con alto dinámico adentro de un P2 se corre en esa re-medición. Servicios lo esquivó solo para el FAQ (§6); si el home tiene un acordeón o un contenido que crece dentro de un bloque con revelado, le pasa lo mismo.
- **`/v3/tipografia` es un mal control** (cuatro iframes = cinco escenas): el parejo es `/v3/tipografia/muestra`.

### Decisiones de Valentino (tras ver la pasada)

Las tres salen de lo que CC dejó «para decidir» (cambian el diseño, no entran en un sprint de arreglos):

1. **`panelQuieto` se queda en el FAQ.** El panel aparece en su lugar y el título entra por línea; no se vuelve al revelado atado al scroll (§6). Queda como regla de Servicios: un panel cuyo alto cambia por lo que hace quien lo mira no se revela.
2. **La tabla de planes de IA pasa a tarjetas por debajo de 640 px, en el S2c.** Una tarjeta por plan, sin scroll horizontal ni caja con `tabindex`; de 640 px para arriba la tabla se queda como está (entra entera: 654 px a 768). Es la opción (a) de la recomendación de CC; la (b), una columna fija, necesitaba un fondo propio opaco y depende de B12, y la (c), una leyenda, no resolvía la columna de rótulos. **Lo commiteado en la S2b todavía scrollea adentro de su caja** (lo pedido en el prompt): el cambio es del S2c.
3. **«Probá el panel» se queda en tinta, como acción secundaria** (bloque Prueba de IA). Los llamados principales van en el acento del servicio y el enlace al panel es la acción secundaria: no cambia.

---

## 10. Cierre y qué sigue

- **Commiteado en un solo commit,** «S2b: tres paginas publicadas y verificadas en navegador», con staging archivo por archivo y `git status --short` antes y después de cada tanda de `git add`: los 8 archivos de §1 (`rutas.ts`, `page.tsx`, `seo.ts`, `PanelDeVidrio.tsx`, `Bloque.tsx`, `Faq.tsx`, `pagina.invariant.tsx`, `seo.invariant.ts`) y este LOG. `SPEC.md` y `CONTRATO.md` siguen sin trackear a propósito. Nada fuera de `src/app/v3/[servicio]/`, `src/app/v3/_servicios/` y `docs/servicios/`. `git push` sin force a `origin/paginas/servicios`.
- **Cierre de recursos:** el dev de `:3001` apagado (puerto libre), sin procesos del navegador de prueba (Playwright/Chromium; `chrome-devtools` sigue sin conectar) y el candado compartido (`C:\develop-pesado.lock`, tomado a las 20:54:44 para el tsc, el dev y el navegador) soltado.
- **Para el S2c:** la tabla de planes de IA pasa a una tarjeta por plan por debajo de 640 px, con su test (decisión 2, §9). Lo que queda en manos del home no cambia: P-H10 (sprint P-H), P-H11 (B1.2b) y la sugerencia P-H12.
