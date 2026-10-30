# M3 — El video de trabajos

2026-10-18 · Autor: CC, en la corrida desatendida (tarea 2) · Viene de: `docs/servicios/SPRINT-M0.md` §4 (el plan) y el prompt de la corrida, que manda sobre el plan donde chocan.
Rama `paginas/servicios`, sobre `5c002d10` (el M1). **Commit «M3: video de trabajos (sin ver)».** Valentino lo revisa al volver.

**Estado en una línea:**
- **El video existe:** tres demos del home (Ethereal, Noir y Skyline) grabadas a 2× e intercaladas con los tres casos del Portfolio, con fundidos de 0,5 s. Es un bucle de 24 s sin costura, en dos versiones de 4 MB o menos, cada una con su póster.
- **La sección 6** lo monta de fondo, solo en Páginas web. Lleva el velo de tinta, la línea dictada, la pausa y el gatillo con su guarda.
- **Software e IA** no montan el slot.
- **Gate:** lint 0, `tsc` 0; los seis tests en verde (427 afirmaciones, 172 controles positivos); los seis barridos iguales al M1.
- **Navegador, en los cuatro anchos:** el video se ve y pausa con el mouse y con el teclado. El peor contraste del texto sobre el velo va de 9,97:1 a 11,10:1. Sin desborde y sin nada escondido en reposo.
- **Detrás de una bandera:** nada. **Cortado por memoria:** nada.

---

## 1. Los pesos (el recibo: `docs/servicios/entregas/m3/medios.json`)

| Archivo | Bytes | Medidas | CRF | Duración |
|---|---|---|---|---|
| `public/servicios/paginas-web/trabajos-horizontal.mp4` | **3.962.398** | 1280 × 800 | 28 | 24 s (720 cuadros) |
| `public/servicios/paginas-web/trabajos-horizontal.webp` (póster) | **39.404** | 1280 × 800 | — | — |
| `public/servicios/paginas-web/trabajos-vertical.mp4` | **3.661.483** | 720 × 1560 | 32 | 24 s (720 cuadros) |
| `public/servicios/paginas-web/trabajos-vertical.webp` (póster) | **28.016** | 720 × 1560 | — | — |

- El techo es de 4.000.000 bytes. La horizontal entró con CRF 28 (con 26 pesaba 4,92 MB). La vertical, con CRF 32 (con 26, 28 y 30 pesaba 6,74, 5,48 y 4,47 MB). Ninguna necesitó la resolución reducida.
- **El formato:** H.264 High, `yuv420p`, `faststart`, sin pista de audio, 30 cuadros por segundo. `medios.invariant` lo vuelve a leer de los bytes de cada mp4 y no del recibo, y ffprobe coincide.
- **El póster** es el primer cuadro de cada versión, en WebP a calidad 80. Así no hay salto cuando el video arranca encima.

---

## 2. Lo hecho

### 2.1 La grabación (`scripts-servicios/`)

El enfoque de `scripts-portfolio/`: se leyó, no se editó ni se importó. Sin dependencias nuevas.

- **`guiones.ts`:**
  - las tres demos, por su slug en el catálogo del home;
  - la url sale del catálogo, a través de `datos/fuenteDeDemos.ts`, la única puerta a las demos;
  - un tramo de 9 s de página (4,5 s de video) por demo y dispositivo, más los cortes, las versiones, el techo y el tipo del recibo.
- **`sonda.ts`:** por demo y por dispositivo, el GET de la portada, el alto, dos capturas y diez cuadros de prueba del tiempo virtual. Ethereal mide 11.551 px y Noir 11.043. **Skyline es una sola pantalla** (900 px a 1440) y es una SPA: un GET a `/properties` da el 404 de Netlify.
- **`grabar.ts`:** tiempo virtual por CDP. Captura, re-emula y avanza. Lleva un «latido» de 1 px, con opacidad 0,004, para las portadas quietas.
  - **Ethereal** grabó así en los dos dispositivos: 135 cuadros, scroll exacto.
  - **Noir** se colgó en el cuadro 30 y **Skyline** en el 14. La captura no volvía, también con el latido. La portada de Skyline es un carrusel que pasa solo.
- **`grabarEnVivo.ts`:** el plan B del Portfolio, `recordVideo` en tiempo real más ffmpeg (2× y 30 cuadros por segundo). Lo usaron Noir y Skyline, en escritorio y en teléfono.
- **El intento de grabar la apertura de Skyline:** pausar el tiempo virtual antes de navegar dejó la carga colgada (el evento `load` nunca llegó). Por eso su clip es la portada asentada, con el carrusel andando: en el video se ven tres propiedades.

### 2.2 El montaje (`montar.ts`, `mp4.ts`, `velo.ts`)

- **El orden:** El Garage, Ethereal, Esquina Estudio, Noir, Banú Scents y Skyline, de 135 cuadros cada uno.
- **El bucle sin costura:** El Garage se parte en dos. El video arranca en su mitad y termina en su principio, y el test lo afirma cuadro por cuadro.
- **El cálculo:** 7 tramos de 4,5 s, menos 6 fundidos de 0,5 s, dan 24 s.
- **Los casos** se leen de `public/portfolio/<slug>/escritorio.mp4` y `movil.mp4`, solo para leer. Toda escritura pasa por `destino()`, cuyas raíces son los medios de servicios, la carpeta del recibo y la de las hojas, fuera del repo. El recibo guarda el sha256 de las seis fuentes leídas, y `git status` queda limpio en `public/portfolio/`.
- **Las versiones:** cada tramo se escala y se recorta al formato (`force_original_aspect_ratio=increase` + `crop`). El teléfono de El Garage, de 390 × 844, se agranda 1,85 veces: es la segunda generación que el M0 ya anotaba (D14).
- **`velo.ts`** mide dos cuadros por segundo de cada versión, 48 cuadros, a la resolución del archivo:
  - toma el píxel más claro de cada cuadro entero;
  - le compone la tinta del tema con el alfa que el velo garantiza bajo el texto (0,75);
  - mide el papel del tema contra ese resultado.

  **El peor da 7,88:1 en las dos versiones.** Es la cota sobre un píxel blanco, porque el video tiene píxeles blancos, y el test la recalcula del tema.

### 2.3 La sección 6, en la plantilla

- **`bloques/Trabajos.tsx`:**
  - la `<section>` va en papel, como todo el cuerpo;
  - adentro, un cuadro de una pantalla de alto (`min-h-svh`) en el `Envoltorio`, con el video de fondo, el velo y el texto en `text-fondo`, abajo;
  - no lleva la marca del acento: sobre el velo, el oscuro no pasa (M0 §4.7).
- **`movimiento/VideoDeFondo.tsx`** (cliente) sigue el patrón de `VideoDeServicio.tsx` del home:
  - un solo `<video>`, `muted`, `loop`, `playsInline` y `preload="none"`, sin `autoplay` ni `src`;
  - la fuente se pide al acercarse (medio cuadro antes), una sola vez, con la versión que toca a la orientación de la pantalla en ese momento. La pone el efecto en el elemento: el lint prohíbe un `setState` en un efecto;
  - anda solo en pantalla, sin pausa y con el scroll quieto (`seguirElScroll` con `ASIENTO.quietoMs`, el escucha compartido del home);
  - debajo van los dos pósters, y el CSS los alterna por orientación. El escondido no se baja: se midió en la red.
  - **Con movimiento reducido** no hay `<video>` ni pausa: queda el póster.
- **La decisión de reproducir es pura** (`movimiento/reproduccion.ts`, `debeReproducirse`) y se prueba en los 32 momentos posibles.
- **La pausa** es un botón conmutable propio:
  - nombre fijo «Pausar el video», `aria-pressed`, el ícono de Lucide con `strokeWidth={1.5}`, y el teclado nativo;
  - el comentario «P-H21: reemplazar por BotonPausa» está en `VideoDeFondo.tsx`.
- **El velo** (`bloques/veloDelVideo.ts`) es tinta en degradé de abajo hacia arriba: 90 % al pie y 75 % hasta el 45 % del alto, donde vive el texto. De ahí se abre hasta transparente. Las clases y los números están en el mismo archivo, y el test afirma que dicen lo mismo.
- **La línea**, dictada, con la marca de LOGOTIPO:

  > Sitios para clientes (El Garage, Esquina Estudio y Banú Scents) y demos propias de develOP (The Ethereal Resort, Noir Dining in the Void y Skyline Estates).

  Los casos se verificaron contra PROYECTOS y las demos contra la sección Demos del home: ver §3.1.
- **El revelado:** el texto entero, título y línea, entra con el `Gatillo`, con su guarda en reposo (§3.6).
- **Solo Páginas web.** `prueba.video` es el dato; en Software e IA vale `null` y el slot no se monta.

---

## 3. Decidido por CC, revisar

1. **Los nombres de las demos son los del home.**
   - El dictado decía «Ethernal, Noir y Skyline». En la sección Demos del home (`trabajos/demos/catalogo.ts:41-43`) se llaman «The Ethereal Resort», «Noir Dining in the Void» y «Skyline Estates». «Ethernal» es la url (`template-ethernal`), no el nombre.
   - Ganó el home, como pide el prompt.
   - Los tres casos coinciden con PROYECTOS.
   - Si se prefieren los nombres cortos, es una línea en `datos/paginas-web.ts` más el literal del test.
2. **En Software e IA, el slot 6 no se monta, y con eso dejan de verse dos cosas que el M1 había dejado ahí:** la nota de Software («2 sistemas más en desarrollo») y «Probá el panel» de IA (`/login`, D11).
   - Los dos datos siguen en los archivos, para la réplica: el M0 §11 pone la demo del panel en ese slot.
   - El test del viejo §12 de `pagina` («Probá el panel» en el slot) se retiró por quitar la funcionalidad.
3. **Los tramos de los casos se eligieron sin la hoja de contactos:**
   - El Garage, desde el cuadro 15 en escritorio y el 12 en el teléfono;
   - Esquina Estudio, desde el 0;
   - Banú Scents, desde el 15.

   Las hojas están en `C:\paginas-servicios-datos\m3\hojas\`: un cuadro cada medio segundo, de izquierda a derecha.
   - Cambiar un tramo es un número en `CORTES` (`scripts-servicios/guiones.ts`) y volver a correr `montar.ts` y `velo.ts`.
   - Los cuadros de las demos quedaron en `~/.cache/servicios/m3/` (662 MB) para no regrabar. Se corrió con `CONSERVAR_CUADROS=1`; sin esa variable, `montar.ts` los borra.
4. **La grabación de Noir y Skyline es en vivo** (plan B), porque en tiempo virtual se colgaban. `recordVideo` graba en píxeles CSS, así que en el teléfono sus cuadros salen de 390 × 844 agrandados: la versión vertical se ve más blanda en esos dos cortes.
5. **La versión se elige por orientación, no por ancho:** vertical en retrato y horizontal en apaisado. A 768 × 1024 la tablet en retrato recibe la vertical, que recorta menos.
6. **El título del slot entra con el gatillo, junto con la línea, y no por línea como los demás bloques.**
   - Medido a 1440: el texto vive al pie de un cuadro de una pantalla, y el revelado por línea termina con el pie a 240 px del borde de abajo. Con el cuadro justo en pantalla, «Trabajos» quedaba a medio revelar.
   - El M0 (§2.3) ya decía «gatillo para el texto».
   - La tabla de marcas del test pasa a 0 progresivos y 1 gatillo en `trabajos`.
7. **La pausa va abajo a la derecha.**
   - Arriba a la derecha la tapaba la barra fija del sitio con el cuadro en pantalla: el clic del banco movía la página media pantalla para alcanzarla.
   - Por debajo de 1024, el texto le deja lugar con `pb-20`.
8. **El HTML que sirve /v3 no trae el `<video>`:** el proveedor de movimiento del home sirve `reducedMotion: 'always'` hasta hidratar, así que el HTML servido es la rama reducida, solo con los pósters.
   - El `<video>` y la pausa aparecen al hidratar, si no hay movimiento reducido.
   - Es la política del home, y `VideoDeServicio` hace lo mismo.
   - El test renderiza la rama sin reducir (en Node no hay proveedor) y lo dice en su descripción.
9. **La espera de memoria** cuenta como arnés del home los procesos `node` bajo `C:\rediseno-home` que no son su `next dev`, cualquier `next build`, y el Chrome o el `node` de un banco del home.
   - El servidor de desarrollo del home estuvo prendido toda la corrida. Si contara, ningún proceso pesado habría corrido.
   - Los `bash` y `tail` de la otra sesión son sus monitores y no cuentan.

---

## 4. Tests

**`pagina.invariant.tsx`, el nuevo §12.** Cada afirmación lleva su control positivo:

| Afirmación | Control |
|---|---|
| Solo Páginas web tiene video en sus datos | — (la lista exacta) |
| Sin movimiento reducido: un `<video>` con `muted`, `loop`, `playsinline`, `preload="none"` y `data-video-de-trabajos`, sin `autoplay` ni `src`, en los dos modos | un `autoplay`; un `src`; dos `<video>` |
| **Con movimiento reducido no hay autoplay:** la capa sin `<video>`, solo los dos pósters | la capa sin reducir |
| `debeReproducirse` nunca da verdadero con reducido (32 momentos) y anda en uno solo | una decisión que ignora el reducido |
| **La pausa existe y alterna:** `type="button"`, nombre, `aria-pressed` y el ícono, en los dos estados | sin nombre; una que no alterna; una página sin botón |
| El comentario P-H21 está | un fuente sin él |
| **La línea es literal**, en un párrafo del slot | un carácter cambiado; los nombres cortos del dictado |
| La línea dice LOGOTIPO, los casos de PROYECTOS y las demos del catálogo | una línea sin una demo |
| **En Software e IA no se monta:** ni el bloque, ni un `<video>`, ni la pausa | Software con el video de web |
| El velo: las clases dicen los números de `veloDelVideo.ts` (0,7 o más bajo el texto) y el texto va en `text-fondo` | un velo al 60 %; la línea en tinta |

**Cambian:**
- §2, el orden: web lleva el slot en los dos modos; Software e IA, sin él.
- §4, los marcadores de web: dos.
- §7, las imágenes: las únicas son los dos pósters, decorativos, adentro de la capa del slot.
- §9, el código de cliente: más `movimiento/VideoDeFondo.tsx`.
- §10, la marca de `trabajos`: el gatillo, sin progresivo.

**Se retiran por quitar la funcionalidad:** el marcador del video (§4: el video existe) y «Probá el panel» en el slot de IA (el viejo §12).

**`medios.invariant.ts`, nuevo, con 26 afirmaciones y 12 controles:**
- los bytes y la duración, contra el techo;
- el peso y el sha256 contra el disco;
- el formato, leído de los bytes. Un mp4 armado a mano prueba que el lector ve el `moov` al final y la pista de sonido;
- los datos contra el recibo;
- el montaje contra los datos;
- el bucle sin costura;
- las fuentes intactas;
- el contraste del velo, 4,5:1 o más, y la cota sobre blanco;
- `montar.ts` no escribe en `public/portfolio/`.

---

## 5. Gate (sobre el estado final)

| Paso | Resultado |
|---|---|
| Lint de los 20 archivos tocados (código, tests y scripts) | 0 problemas |
| `tsc --noEmit`, con el `tsconfig` del repo | 0 errores |
| `datos` · `precios` · `slots` · `seo` | 55/0 (19) · 22/0 (8) · 44/0 (8) · 56/0 (10) |
| `pagina` | **224 / 0 (115 controles)**; en el M1, 200 (100) |
| `medios` (nuevo) | **26 / 0 (12)** |

**Los seis barridos, contra el M1:** la misma lista de fallas.
- `s8-montaje` 56/2, las dos del home, con `stderr` idéntico.
- `s9-sentry` 22/0, con sus dos «fuera de ventana».
- `s4-paquete`, `s8-escena`, `s40-3d-sonido` y `s53-pulido-2` en 0.

Solo cambian los conteos de archivos:
- `src/`: de 2470 a 2475, por los cinco nuevos;
- el repo: de 4056 a 4069, por los cinco nuevos, los siete scripts y el recibo.

**Sin `next build`.** Las salidas están en `C:\paginas-servicios-datos\m3\gate\`.

---

## 6. Navegador

En el dev de :3001, con un Chromium de prueba sin WebGL; los JSON y los logs están en `C:\paginas-servicios-datos\m3\navegador\`. El contraste se mide con una captura sin el texto (color transparente y el overlay de desarrollo de Next escondido), en seis momentos del video (1, 5, 9, 13, 17 y 21 s, que cubren los seis cortes), contra los píxeles de detrás de las cajas del h2 y de la línea.

| `/v3/paginas-web` | Versión que baja (red) | Anda | Pausa: mouse / Enter / Espacio | Peor contraste sobre el velo | Texto (del pie del cuadro) | Desborde | Escondido en reposo |
|---|---|---|---|---|---|---|---|
| 1440 × 900 | horizontal, 1 mp4 y 1 póster | sí (2,81 → 3,82 s) | pausa / pausa / sigue | **10,93:1** | hasta el 17,8 % | no | nada |
| 1024 × 768 | horizontal, 1 y 1 | sí | ídem | **10,77:1** | hasta el 19,7 % | no | nada |
| 768 × 1024 | vertical, 1 y 1 | sí | ídem | **11,10:1** | hasta el 17,4 % | no | nada |
| 390 × 844 | vertical, 1 y 1 | sí | ídem | **9,97:1** | hasta el 25,9 % | no | nada |
| 1440, reducido | ningún mp4; el póster horizontal | sin `<video>` | sin botón | 11,82:1 | — | no | — |
| 390, reducido | ningún mp4; el póster vertical | sin `<video>` | sin botón | 9,97:1 | — | no | — |

- **Escondido en reposo:** se paró cada media pantalla (12 paradas a 1440, 13 a 1024 y a 768, 15 a 390).
  - Los únicos «sospechosos» son Incluye y el Precio a mitad de su revelado progresivo, con opacidad 1 y corridos de 7 a 30 px. Es lo mismo que se vio en el M1.
  - El slot de trabajos no aparece en ninguna parada.
  - El cierre queda al final, en 0 px y con opacidad 1, en los cuatro anchos.
- **La pausa,** en los cuatro anchos:
  - con el mouse: pausado con `aria-pressed="true"` y el cuadro quieto; el segundo clic lo devuelve;
  - con el teclado: el foco en el botón, Enter pausa y Espacio sigue;
  - la página no se mueve en ningún paso.
- **Software e IA, a 1440 y a 390, con movimiento reducido:**
  - sin bloque de trabajos ni `<video>`, sin desborde;
  - contraste mínimo del cuerpo: 7,17 en Software y 6,02 en IA, en los planes;
  - ninguna llamada a `/api`.
- **Los errores de consola** son los de siempre del banco: WebGL no crea contexto en este Chromium. Más dos avisos: el LCP del póster, porque el banco salta al slot con un `scrollTo` (en el sitio, el primer gesto del usuario cierra la medida del LCP), y el canvas de la propia medición.

---

## 7. Incidentes

- **Una falsa alarma del instrumento:** al buscar las clases nuevas en el CSS del dev, escapé mal la barra en la búsqueda y parecía que Tailwind no las había generado. Con una búsqueda literal están todas. No se tocó nada por eso.
- **El overlay de desarrollo de Next** (la insignia roja abajo a la izquierda) caía sobre la caja del texto a 1440 y ensució la primera medición: dio 3,65 por su rojo. Se esconde para medir.
- **El clic sobre la pausa movía la página:** el botón estaba debajo de la barra fija (§3.7). Ahora la medición vuelve a leer las cajas justo antes de cada captura, y corta si la página se movió.
- **El lint:** un `setState` dentro de un efecto (`react-hooks/set-state-in-effect`). La fuente se pone en el elemento.
- **Dos fallas propias en los tests, arregladas:**
  - la marca escrita en un comentario de los datos (`datos` §: la marca no se escribe suelta);
  - PROYECTOS entrando al runtime de los datos por la línea (`precios`: el grafo de imports). La línea va escrita y el test la compara con las fuentes.
- **La memoria:** ninguna espera hizo falta (siempre hubo 3 GB o más y el arnés del home no corrió). Lo más bajo durante el navegador fue 3,25 GB, y nada murió.

---

## 8. Fuera de alcance, anotado

- **P-H21:** la pausa es nuestra hasta que el home publique `BotonPausa`.
- **El aviso de LCP del póster:** solo aparece en desarrollo, y lo provoca el salto programático del banco.
- **Volver a grabar los sitios de los clientes con nuestro script** (D14): queda para cuando Valentino lo vea debajo del velo.

---

## 9. Qué mira Valentino

1. http://localhost:3001/v3/paginas-web a 1440 y a 390, en el slot de trabajos, debajo de Extra:
   - los seis cortes;
   - el empalme del bucle: en El Garage, a los 24 s, no se tiene que notar;
   - el velo;
   - la línea y sus nombres (§3.1);
   - la pausa, con el mouse y con Tab y Enter;
   - el texto, que entra con el gatillo.
2. **Los tramos de los casos:** las hojas en `C:\paginas-servicios-datos\m3\hojas\` (§3.3).
3. **Software e IA:** ya no tienen el slot (§3.2).

El dev se prende con `npm run dev -- -p 3001`.
