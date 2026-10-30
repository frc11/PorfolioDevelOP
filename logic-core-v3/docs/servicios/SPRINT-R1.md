# R1 — Verificación del merge-3 y reemplazos de lo que entregó el home

2026-10-18 · Autor: CC · Viene de: el prompt R1 (y su agregado de P-H10, P-H12 y los finales de línea) y `docs/rediseno/SPRINT-PH.md`.
Rama `paginas/servicios`, sobre `34c2c71d` (el merge de `rediseno/home`). **Cerrado el 2026-10-19 en la corrida desatendida «R1, precio b y V0»** (§10): la pausa volvió a ser la nuestra por P-H27, y el commit es «R1: gatillo comun del home (pausa propia por P-H27)».

**Al cierre (§10):** el gatillo es el común del home; la pausa **sigue siendo la nuestra**, con la nota «P-H27: reemplazar por BotonPausa cuando llegue el ajuste de s77», y `s77` está en verde (35/0). Lo que sigue, del 18 de octubre, cuenta la pausa del home integrada: vale como medición de esa variante, que vuelve cuando el home afloje `s77`.

**Estado en una línea (al FRENO del 18):**
- **El merge está limpio.** `tsc` en 0 (hubo que borrar un archivo generado y cortado), los siete tests de servicios y los seis barridos iguales a la base, y s38, s44 y s74 **pasan** (57, 45 y 34).
- **Ninguna firma que importamos cambió.** De los 31 archivos del home que usamos, cambiaron 2, y los dos son aditivos o alias.
- **Reemplazado por el común del home:** el gatillo con su máquina y su guarda (P-H18 + P-H25) y el botón de pausa (P-H21). Del P-H23 queda la firma anotada (§2.4). No se registró nada.
- **El navegador:** el gatillo, la pausa, el video, los anchos y Software e IA están bien. La X del modal (P-H12) cierra siempre. **El foco (P-H10) vuelve al botón, pero no siempre:** en 30 de 108 cierres cae en `body`. Es una carrera del lado del home, con causa medida: **pedido P-H26** (§5.1).
- **Un segundo pedido, P-H27:** `s77` afirma que nadie importa `BotonPausa` todavía. Integrarlo, como pedía el R1, deja a `s77` en 35 afirmaciones y 1 falla (§5.2). No se tocó.

---

## 1. Paso 0 — la verificación del merge

### 1.1 Lo que se miró, antes de cambiar nada

| Chequeo | Resultado |
|---|---|
| `git log -4` | `34c2c71d` (el merge) · `6653d560` (M2a) · `d51d95fc` (plan de B12a) · `f2631309` (M3) |
| `git status` | solo `docs/servicios/CONTRATO.md` y `SPEC.md`, sin trackear, como siempre |
| `tsc` | **0 errores**, con una vuelta: la primera corrida dio 1 error en `.next/dev/types/validator.ts(812,1)` (TS1128). Es un archivo generado por el dev, cortado: en la línea 809 quedó un fragmento suelto, `ed<typeof handler>`. Con un error de sintaxis `tsc` no llega a chequear tipos (por eso tardó 15 s). Se borró `.next/dev/types` (generada, ignorada por git), como pedía el prompt, y la segunda corrida dio 0 en 46 s. La copia del archivo roto está en `C:\paginas-servicios-datos\r1\merge\validator.ts.corrupto` |
| Los siete tests de servicios | `datos` 55/0 · `precios` 22/0 · `slots` 44/0 · `seo` 56/0 · `pagina` 224/0 · `medios` 26/0 · `diagonales` 36/0: **iguales al M2a** |
| **s38, s44 y s74** (finales de línea) | **pasan**: s38 57/0 (9 controles), s44 45/0 (13) y s74 34/0 (24). Son las cifras del home. En este worktree, que está en CRLF, antes fallaban los tres; `f1cd4b4e` los normaliza a LF. La nota de la skill («s38, s44 y s74 fallan… hasta el sprint P-H») ya no aplica |
| Los seis barridos | iguales a la base (§3.2) |
| Del home, `s77` y `s25-contacto` | 35/0 y 35/0, como las reportó el home |

### 1.2 Lo que importamos del home sigue igual

Se leyeron todos los imports de `_servicios/` y de `[servicio]/` que apuntan afuera: **31 archivos del home**. Se cruzaron con lo que el merge cambió (`6653d560` → `34c2c71d`). Cambiaron 2, y ninguna firma que usamos:

| Archivo | Qué cambió | Nos afecta |
|---|---|---|
| `_componentes/chrome/Cta.tsx:158-161`, `:173-180` | `CtaEnlace` suma dos props opcionales, `externo` y `etiqueta`. `Cta` (el que usamos) no cambió | No |
| `_secciones/tu-panel/entrada.ts:73` y `:82` | `DISPARO_DEL_REMATE` pasó a valer `LINEA_DEL_DISPARO` (sigue siendo 6) y `margenDelDisparo` se reexporta desde el contrato | Solo el test que lee `DISPARO_DEL_REMATE` (§2.5) |

Los otros 29 (el contrato de coreografía, `cruce`, `acento`, `Textos`, `Titular`, `Envoltorio`, `Imagen`, `LOGOTIPO`, `PROYECTOS`, el catálogo de demos, `Contacto`, `scrollEnMovimiento`, etc.) están sin una línea de diferencia. La lista completa está en `C:\paginas-servicios-datos\r1\merge\imports-del-home.txt`.

### 1.3 P-H10, P-H12 y lo demás que entró (`SPRINT-PH.md`)

- **P-H10 + P-H12 entraron** en `54766fc1`: el foco vuelve al control real que abrió el modal, y las caras de la placa no tapan la X. Se miden en el navegador en §4.4.
- **P-H18, P-H21, P-H23 y P-H25** entraron como piezas comunes. Reemplazamos el gatillo (P-H18 + P-H25) y la pausa (P-H21); del P-H23 solo se anota la firma.

---

## 2. Paso 1 — los reemplazos

### 2.1 Los archivos

| Archivo | Qué |
|---|---|
| `movimiento/Gatillo.tsx` | **BORRADO.** Reemplazado por el común del home (`_secciones/_contrato/Gatillo.tsx`) |
| `movimiento/disparo.ts` | **BORRADO.** Reemplazado por el común del home (`_contrato/disparo.ts`; la guarda vive en `_contrato/reposo.ts`) |
| `bloques/Bloque.tsx`, `bloques/Llamado.tsx`, `bloques/Trabajos.tsx` | El import del gatillo, al contrato (3 líneas) y un comentario |
| `movimiento/VideoDeFondo.tsx` | Usa `BotonPausa`; se fue el `<button>` propio con sus íconos. **Al cierre se deshizo** (§10): vuelve el propio |
| `movimiento/reproduccion.ts` | Se fueron `siguienteDeLaPausa` y `ROTULO_DE_LA_PAUSA`; entra `DE_LA_PAUSA`. **Al cierre se deshizo** (§10) |
| `__tests__/pagina.invariant.tsx` | Los imports y las afirmaciones del reemplazo (§2.4) |
| `docs/servicios/SPRINT-R1.md` | Este log |

Total de la rama: 6 archivos modificados, 2 borrados y 1 nuevo. Nada fuera de `src/app/v3/_servicios/` y `docs/servicios/`.

### 2.2 P-H18 + P-H25 — el gatillo

- **La firma cubre todo lo que usamos.** El común es `Gatillo({ children, className })`, con el mismo marcado (`data-gatillo` y un hijo con las clases del estado), la misma máquina de cuatro estados, la misma línea (6 %) y el mismo `rootMargin`. Su guarda en reposo es la nuestra, un poco más estricta: con el alto del cuadro en 0 (la pestaña oculta) no dispara a ciegas (`aLaVistaEn`, `disparo.ts:44`). **No hay P-H26 por esto.**
- **Se probó que no cambia nada visible:** el marcado servido de las tres páginas, en desarrollo y en producción, **antes y después**:
  - Software e IA salen **idénticos byte a byte**, en los dos modos (cuatro archivos).
  - Páginas web sale idéntica **salvo el botón de pausa** (la otra pieza que se reemplazó): sin el botón, el mismo sha256 en desarrollo y en producción.
  - Las dos capturas están en `C:\paginas-servicios-datos\r1\html-antes\` y `html-despues\`.
- Para correr los barridos con el borrado ya contado, ver §3.3 (`s40` lee `git ls-files`).

### 2.3 P-H21 — la pausa (al cierre se deshizo por P-H27: §10)

- **`BotonPausa({ pausado, alCambiar, de, className })`** (`_componentes/medios/BotonPausa.tsx:36`). `alCambiar` recibe el estado **contrario**, así que `alCambiar={setPausado}` alcanza: se fue el `siguienteDeLaPausa`.
- **El nombre queda «Pausar el video»**, el mismo de antes: `de="el video"` (`DE_LA_PAUSA`, `reproduccion.ts`). El componente arma «Pausar » + `de`, y el nombre es igual en los dos estados (`aria-pressed` dice cuál es).
- **La posición sigue abajo a la derecha:** el componente deja pasar `className` (`cn(…, className)`), y se le pasa la de antes: absoluta, a 16 px de la derecha y del pie del cuadro. Medido: 16 y 16 px, a 1440, 1024 y 390.
- **Lo que cambia a la vista** (el prompt lo pedía: es el disco del home): era un disco de tinta con ícono claro de 44 px; ahora es el disco de vidrio del botón de sonido, de 48 px, con el papel al 60 %, desenfoque de 12 px, borde fino y la sombra flotante, y el ícono en tinta. El anillo de foco es el de la casa (dos tonos: contorno de tinta y aro de papel), no el claro que le habíamos puesto.

### 2.4 P-H23 — la firma del punto de registro de la llave (solo anotada)

Para la ronda de la réplica. **No se registró nada.**

```ts
// src/app/v3/_secciones/_contrato/inventado.ts:170
export function registrarInventos<const T extends Readonly<Record<string, Invento>>>(origen: string, inventos: T): T
```

- `Invento` es `{ marcador, pedido, mentira }`: el `marcador` sale del conjunto cerrado de `marcadores.ts`, el `pedido` es lo que se lee con la llave apagada y **tiene que contener el marcador**, y la `mentira` (lo que se lee con la llave prendida) no puede estar vacía. Si no, el registro tira `[P-H23] la casilla «origen.clave» no lleva su marcador en el pedido, o su mentira está vacía`.
- Devuelve las mismas casillas, para usarlas con `conLlave(invento, llave = CONTENIDO_INVENTADO)` (`inventado.ts:191`; `CONTENIDO_INVENTADO` es `false` en `llave.ts:80`). Con la llave apagada se lee el `pedido`.
- `todosLosInventos()` (`inventado.ts:179`) suma los del home y los registrados, y es lo que lee por defecto el escáner (`restauracion.ts:78`, `:153` y `:196`). `INVENTOS` y `LISTA_DE_INVENTOS` siguen siendo solo los del home (s21 los cuenta contra las secciones).
- **El escáner de producción sigue bloqueando:** una cifra escrita suelta, aunque esté registrada, lo pone en rojo; solo se restauran los literales exactos registrados.
- **Para tener en cuenta:** el registro es estado de módulo (un `Map` por `origen`). Registrar dos veces con el mismo `origen` pisa el anterior, y el módulo que registra tiene que estar importado antes de que el escáner lea `todosLosInventos()`.
- Ejemplo del docblock del home: `registrarInventos('servicios', { precioDeWeb: { marcador: '[PRECIO]', pedido: '[PRECIO]', mentira: '…' } })` y después `conLlave(INVENTOS_DE_SERVICIOS.precioDeWeb)`.

### 2.5 Los tests (`pagina.invariant.tsx`): ajustados a los imports, sin aflojar

**Lo borrado se anota como «reemplazado por el común del home», no como retirado.** Lo que se afirmaba de la máquina del gatillo y de la pausa se sigue afirmando, ahora sobre `_contrato/disparo.ts` y sobre `BotonPausa`.

| Qué | Cambio | Control |
|---|---|---|
| Imports | La máquina viene de `_contrato/disparo`; la pausa, de `BotonPausa` | — |
| «El único código de cliente son…» | De cinco archivos a cuatro: ya no está `movimiento/Gatillo.tsx` | el de siempre (un bloque de cliente fuera de `movimiento/`) |
| La línea de disparo es la del remate | Sigue, y ahora dice que es una sola constante con el contrato (`DISPARO_DEL_REMATE` es `LINEA_DEL_DISPARO`) | el de siempre (la línea en 0) |
| La máquina, la guarda y la franja (§10) | **Sin cambios**: las mismas afirmaciones y los mismos controles, ahora sobre la máquina del home | los de siempre |
| La pausa que alterna (§12) | Ahora sobre el botón del home: marcador `boton-pausa`, el nombre sale de `nombreDeLaPausa(DE_LA_PAUSA)`, y «apretarlo alterna» llama al `onClick` del componente y mira lo que pide a `alCambiar` | los tres de siempre (sin nombre, que no alterna, sin el botón), más **uno nuevo**: un botón que cambia de nombre al pausar |
| «En Software e IA no hay video» | El marcador de la pausa es `boton-pausa` | el de siempre, más **uno nuevo**: un botón de pausa suelto |

**Afirmaciones nuevas (7, con 11 controles), las de «reemplazado por el común»:**
1. En `_servicios` ya no están `movimiento/Gatillo.tsx` ni `movimiento/disparo.ts` (control: una copia de cada uno).
2. Lo usan tres bloques (`Bloque`, `Llamado`, `Trabajos`).
3. Y los tres lo importan del contrato (control: uno que lo importa de `movimiento/`).
4. Ningún fuente define la máquina, la línea, el margen ni la guarda (control: un fuente con su propia máquina).
5. Ningún fuente guarda la nota de un pedido cumplido, `P-H18: reemplazar` o `P-H21: reemplazar` (control: la nota sin cumplir).
6. El botón va abajo a la derecha: `absolute`, `right-4` y `bottom-4`, leído del marcado servido (control: uno arriba).
7. El video usa la pausa del home: importa `BotonPausa`, no arma su `<button>` ni sus íconos, y apretarla pone el estado del video (`alCambiar={setPausado}`) (controles: un botón propio, uno que no pone el estado, uno sin el import).

**Retirada, reemplazada por el común del home:** «el botón lleva el comentario P-H21: reemplazar por BotonPausa», con su control. Ya no hay botón propio; la afirmación equivalente es la 5.

**`pagina`: de 224 a 240 afirmaciones (de 115 a 125 controles):** 7 nuevas y 1 retirada dan +6, y 11 controles nuevos y 1 retirado dan +10. Ningún test del home se editó.

---

## 3. Paso 2 — el gate

### 3.1 En orden

| Paso | Resultado |
|---|---|
| Lint de los 6 archivos tocados | **0** |
| `tsc --noEmit` (4 GB) | **0 errores** (13 s con la caché; el programa tiene 7627 archivos, con los 6 tocados y sin los 2 borrados) |
| `datos` · `precios` · `slots` · `seo` | 55/0 · 22/0 · 44/0 · 56/0 |
| `pagina` · `medios` · `diagonales` | **240/0 (125)** · 26/0 (12) · 36/0 (19) |
| **s38 · s44 · s74** | **57/0 · 45/0 · 34/0** |
| Los seis barridos | iguales a la base (§3.2) |
| `s25-contacto` (del home) | 35/0 |
| **`s77` (del home)** | **35 afirmaciones, 1 falla** (§5.2: P-H27) |
| `next build` | no se corrió |

Los siete tests de servicios suman 479 afirmaciones y 201 controles positivos (antes, 463 y 191).

### 3.2 Los seis barridos contra la base del merge

| Barrido | Base (merge, antes de tocar) | Ahora |
|---|---|---|
| `s4-paquete` | 21/0 | 21/0 |
| `s40-3d-sonido` | 38/0 | 38/0 (con el índice del commit, §3.3) |
| `s53-pulido-2` | 54/0 | 54/0 |
| `s8-escena` | 33/0 | 33/0 |
| `s8-montaje` | 56/2 (las dos de los 300 renglones, de siempre) | 56/2, el mismo `stderr` |
| `s9-sentry` | 22/0, 2 fuera de ventana | 22/0, 2 fuera de ventana |

Cambian solo los conteos de archivos, en dos: `src/` 2492 → 2490 y el repo 4092 → 4090 (los dos borrados). Contra el M2a, además, el merge sumó 11 archivos de `src/` y 2 aparecen en la lista informativa de «no declarados en el padrón»: `_chrome/barra/corrimiento.ts` y `useCorrimientoDeLaPastilla.ts`, del home.

### 3.3 Por qué `s40` pide el índice del commit

`s40-3d-sonido` lee los archivos que lista `git ls-files -co`. Un borrado que está solo en el disco (todavía no en el índice) lo tira con `ENOENT` y sin resumen. Es lo que ya había pasado en el S3b. **Se corrió con una copia del índice con los dos borrados registrados** (`GIT_INDEX_FILE`), el estado que tendrá el commit; el índice real no se tocó (`git diff --cached --stat` vacío). En el commit, los dos `git rm` hacen que `s40` pase solo. La corrida sin la copia dio exit 1 con ese `ENOENT`, y está guardada.

### 3.4 Dónde están las salidas

`C:\paginas-servicios-datos\r1\`: `merge\` (el estado del merge, antes de tocar), `final\` (con el borrado solo en el disco), `final-commit\` (con el índice del commit), `html-antes\` y `html-despues\`, y `navegador\` (los JSON y los logs de cada corrida).

---

## 4. Paso 2 — el navegador

En el dev de :3001, con Chromium (sin WebGL: el único error de página en todas las corridas es «Error creating WebGL context» de la escena, como en M1, M3 y M2a). **Nunca se envió el formulario ni se llamó a `/api/*`**: 0 llamadas en todas las corridas.

### 4.1 Los gatillos entran al bajar, salen a la vista al subir y nada queda escondido en reposo

Los tres de Páginas web (el CTA del precio, el texto del video y el CTA del final), a 1440, 1024 y 390; y los dos CTA de Software y de IA, a 1440 y 390.

- **Al cargar**, los que están abajo esperan (`espera`, opacidad 0); es lo esperado.
- **En la franja de abajo, sin cruzar la línea** (el tope al 97 % del cuadro): recién llegado, sigue esperando; con el scroll quieto, **la guarda lo pone** (`puesto`, opacidad 1). Es la guarda en reposo (P-H25) del gatillo común.
- **Bajando por la línea:** entra (`puesto`, 1, sin corrimiento). **Subiendo con el bloque debajo del cuadro:** `ido` (0, corrido 32 px). **Bajando otra vez:** vuelve a entrar.
- **Subiendo despacio se ven salir:** de 43 a 48 cuadros por subida, **15 o 16 con el bloque yéndose a la vista**, con la opacidad bajando hasta 0,21 o 0,26.
- **Al terminar en reposo**, con el tope al 99 %: `puesto`, opacidad 1. Nada quedó escondido a la vista.
- Los revelados progresivos del resto de la página (`revelados`): igual que en M1, M3 y M2a. Los «sospechosos» son Incluye, Extra y Proceso a mitad de su revelado (opacidad 1, corridos unos píxeles) y, a 1440 y 1024, el anclaje del precio, donde los paneles que todavía no llegaron están en 0 (el scrub del M2a, ya anotado). A 390, ninguno. El cierre llega con 0 px y opacidad 1 en los tres anchos.

### 4.2 El video y su pausa

| Ancho | Archivo | Pausa con el mouse | Enter | Espacio | Peor contraste del texto | Ícono contra el vidrio | Anillo de foco contra el velo | Desborde |
|---|---|---|---|---|---|---|---|---|
| 1440 | horizontal | pausa y sigue, `aria-pressed` alterna | pausa | sigue | **10,93** | 6,43 | **17,63** (sin foco, 1,13) | no |
| 1024 | horizontal | ídem | ídem | ídem | **10,77** | 6,47 | **17,62** (1,08) | no |
| 390 | vertical | ídem | ídem | ídem | **9,97** | 6,43 | **17,60** (1,10) | no |
| 390 y 1440, reducido | solo el póster (sin `<video>`, sin botón, sin mp4) | — | — | — | 9,97 y 11,82 | — | — | no |

- **El disco:** 48 × 48 px a 16 px de la derecha y del pie del cuadro, adentro del cuadro y **sin pisar el texto**, en los tres anchos. Nombre «Pausar el video», `type="button"`.
- **El scroll de la página no se mueve** al apretar (mouse, Enter, Espacio): el mismo `scrollY` en las seis lecturas.
- **El anillo de foco** es el de dos tonos de la casa: contra el velo de tinta da 17,6:1 (la medición tiene su control: sin foco, la misma corona da 1,1:1).
- **El video:** baja un solo archivo por ancho, anda solo en pantalla (`paused: false`, el tiempo avanza), mudo, en bucle y sin `autoplay`.

### 4.3 Software e IA, un vistazo

- **Sin el slot de trabajos:** ni el bloque, ni un `<video>`, ni la pausa. Con movimiento reducido, contraste mínimo del cuerpo **7,17** (Software) y **6,02** (IA), los mismos del M3; sin desborde.
- **Los gatillos** de sus dos CTA hacen lo mismo que en Páginas web (franja en reposo → `puesto`; subiendo se ven salir, 15 a 17 cuadros).
- **El marcado servido es idéntico byte a byte** al de antes del R1 (§2.2).
- **El modal** abre con el interés marcado (`software`; `chatbot` y `automatizaciones`), los campos vacíos y el foco adentro, y cierra con la X y con Esc. Al cerrar, el foco cae en `body` en 2 de 4 cierres en cada una: es el mismo P-H26.

### 4.4 P-H12 y P-H10, el modal de contacto de Páginas web

Se abrió y se cerró el modal desde **cada CTA de `/v3/paginas-web`**: el de debajo del precio (`llamado-del-precio`), el del final (`llamado`) y el del cierre (`cierre`), con cuatro maneras (mouse + X, mouse + Esc, Enter + Esc y Espacio + X) y tres vueltas de cada una: **12 ciclos por CTA, 36 por ancho, 108 en total**, más un recorrido con Tab de verdad desde el tope de la página hasta cada botón.

| | 1440 | 1024 | 390 |
|---|---|---|---|
| Abre con el interés marcado (`web`) y los campos vacíos | 36/36 | 36/36 | 36/36 |
| El foco entra al modal | 36/36 | 36/36 | 36/36 |
| **P-H12 · la X:** el elemento en el punto de la X es la X | 18/18 | 18/18 | 18/18 |
| **P-H12 · un clic normal** (sin `force`) en la X cierra | 18/18 | 18/18 | 18/18 |
| **P-H10 · el foco vuelve al botón** · precio / final / cierre | 7 · 6 · 6 de 12 | 3 · 10 · 12 de 12 | 12 · 11 · 11 de 12 |
| **P-H10 · cae en `body`** | 17 de 36 | 11 de 36 | 2 de 36 |
| Cae en **otro** control | 0 | 0 | 0 |
| Con Tab real: vuelve al botón, con el anillo a la vista | 2 de 3 | 3 de 3 | 3 de 3 |

- **P-H12 funciona:** 54 clics normales sobre la X, 54 cierres.
- **P-H10 funciona a medias.** Cuando el foco vuelve, vuelve **siempre al botón que abrió** (nunca a otro control), y el anillo se ve (contorno de 2 px y aro de papel). Pero **en 30 de 108 cierres no vuelve y queda en `body`**, con cualquiera de las cuatro maneras y desde los tres CTA. Es intermitente: el mismo CTA y la misma manera dan «vuelve, `body`, vuelve».
- **La causa está medida** y es del lado del home: §5.1.
- **El scroll de la página no cambia al abrir y cerrar:** en 104 de los 108 cierres, ≤ 2 px. Las cuatro excepciones son el primer ciclo desde un CTA del final de la página: 4 px a 1440 (6595 → 6591), a 1024 (6046 → 6042) y a 390 (5293 → 5289) desde el CTA del final, y 208 px a 390 (5081 → 5289) desde el del cierre. En las cuatro la posición de después es el máximo del documento, y desde el segundo ciclo no se mueve más (5289 → 5289 en los otros 12 del cierre): es la prueba, que lleva la página hasta el fondo antes de abrir, y no el modal. Es lo que se infiere de los datos; no se aisló.

---

## 5. Pedidos al home

### 5.1 P-H26 — el foco cae en `body` en uno de cada cuatro cierres del modal de contacto

**Es el caso que el home vio una vez «sin causa clara».** Ahora tiene causa y se reproduce a pedido.

**Dónde:** cualquier disparador de `data-abre-contacto="panel"`. Medido en `/v3/paginas-web` a 1440, 1024 y 390, desde los tres CTA «Quiero mi página web» (debajo del precio, el del final y el del cierre). Por el código, es igual para la barra y para los CTA de Servicios del home.

**Pasos exactos (1440, `/v3/paginas-web`, el CTA de debajo del precio):**
1. Bajar hasta el CTA «Quiero mi página web» de debajo del precio y darle el foco con el teclado.
2. Enter (o un clic). Esperar a que la hoja termine de entrar (≈ 1,6 s).
3. Esc (o un clic en la X). Esperar a que se vaya.
4. Mirar el anillo: **en uno de cada cuatro cierres no está en el botón** y `document.activeElement` es `body`.
5. Repetir 20 veces. Corrida medida: **6 de 24 cierres** (25 %) con Enter + Esc a 1440.

**La causa, medida con un espía sobre `focus()` y los eventos de foco** (el script está en `C:\paginas-servicios-datos\r1\scripts\diag-foco.cjs`; con `RESUMEN=1 node diag-foco.cjs 1440 llamado-del-precio enter escape 24` da la línea por cierre y el resumen):
- `<AnimatePresence onExitComplete={devolverElFoco}>` (`FormularioDeContacto.tsx:65`) llama a `devolverElFoco()` (`apertura.ts:79`), que pide **un solo** `requestAnimationFrame(() => destino?.focus())`.
- Ese código supone que, un cuadro después, la hoja ya se desmontó. **No es así siempre:** `onExitComplete` corre antes del desmontaje.
- En los 18 cierres buenos, el frame corre 9 a 31 ms después del pedido y la hoja se desmontó 1 a 3 ms después del pedido: `focus()` encuentra el foco en `body` y lo toma.
- En los **6 cierres malos**, el frame corre **0 a 1 ms** después del pedido, **antes** del desmontaje (que llega 3 a 4 ms después). `focus()` mueve el foco al botón, pero la trampa del diálogo (`useDialogo`, `dialogo.ts:63-69`, `alEntrarElFoco`: «un foco que se escapa vuelve») lo devuelve a un vínculo de la hoja. Después la hoja se desmonta y el foco cae en `body`. Nadie lo reintenta.
- Los 6 malos tienen esa firma y **ninguno de los 18 buenos**. La probabilidad es la de que el cuadro de pantalla caiga en esos ~4 ms: 4 / 16,7 ≈ 24 %, y lo medido fue 25 %. Con GPU y una pantalla real debería ser parecida: el mecanismo es el mismo.

**Cómo arreglarlo (no se aplicó, es del home):**
1. **Verificar y reintentar** en `devolverElFoco`: después del `focus()`, si `document.activeElement !== destino`, probar en el cuadro siguiente (hasta unos cinco) o hasta que la hoja ya no esté. Es lo más chico.
2. Que la trampa deje de devolver el foco una vez pedido el cierre (un indicador que ponga `cerrarContacto` y lea `alEntrarElFoco`).
3. Llamar a `devolverElFoco` desde el desmontaje de la hoja y no desde `onExitComplete`.

Recomiendo la 1: no toca la trampa ni el momento de la salida. Sin probar.

### 5.2 P-H27 — `s77` afirma que nadie importa `BotonPausa`; integrarlo lo deja en rojo

- **Qué dice el test del home** (`s77-ph.invariant.tsx:65-66`): `usanLaPausa(PRODUCTO, leer)` tiene que ser `[]`, «y no está integrada: ningún archivo de producto la importa todavía». `PRODUCTO` (línea 40) es todo archivo que no es test bajo `src/app/v3`, **`_servicios` incluida**.
- **Qué pasa con el R1:** al integrar la pausa, como pedía el prompt, esa afirmación falla con `esperado [], obtenido ["src/app/v3/_servicios/movimiento/VideoDeFondo.tsx"]`. `s77`: 35 afirmaciones, **1 falla**. Es la única; con la pausa propia, `s77` daba 35/0.
- **No se editó** (ningún test del home se edita) **ni se evadió** (un import por otra ruta o un reexport lo habría esquivado, y eso es aflojar el test por la puerta de atrás).
- **Pedido:** que el home afloje esa afirmación en su carril (por ejemplo, que acepte `_servicios/movimiento/VideoDeFondo.tsx`, o que la saque: su docblock ya dice dónde iría). Si no, cuando Valentino mergee servicios en el home, `s77` queda en rojo.
- **Si preferís** que `s77` no esté en rojo en esta rama hasta que el home lo afloje, la integración de la pausa se puede dejar para después. La del gatillo no tiene este problema: `s77` no afirma nada sobre quién importa `Gatillo`.

---

## 6. Decidido por CC, revisar (al FRENO del 18; los 1 a 3 quedaron sin efecto con el cierre, §10)

1. **El nombre de la pausa sigue siendo «Pausar el video».** El componente arma «Pausar » + `de`. Si preferís «Pausar el video de trabajos», es cambiar `DE_LA_PAUSA` (`reproduccion.ts`) y el test lo sigue solo.
2. **El disco cambió a la vista**, como el prompt lo implica: vidrio claro de 48 px con ícono de tinta, en vez del disco de tinta de 44 px. Se midió: el ícono contra el vidrio da de 6,43 a 7,2:1 (el mínimo para un componente es 3:1) y el anillo de foco se ve (17,6:1).
3. **Integré la pausa aunque `s77` lo desaprueba** (P-H27). Lo pedía el prompt. Está la salida en §5.2 si no lo querés ahora.
4. **Memoria:** el prompt del R1 no trae regla. Seguí la de la corrida desatendida, con un cambio: el dev del home estaba prendido en :3002 (2,5 GB) y el mío en :3001 (2,4 a 2,7 GB), así que bajé la espera de 3 a **2 GB** libres antes de cada corrida del navegador y el corte, de 1,5 a 0,9 GB. El mínimo libre durante las corridas fue **3,61 GB**: el corte no se disparó nunca y nada murió. Hubo un momento, con los dos dev prendidos y antes de abrir un navegador, en que la memoria libre llegó a 0,9 GB; esperé (volvió a 2,5 GB) y recién ahí corrí.
5. **Borré `.next/dev/types`** (generada, ignorada por git), como pedía el prompt, y guardé una copia del archivo roto.
6. **`s40` se corrió con una copia del índice** con los dos borrados registrados (§3.3). Es solo para medir; el índice real no se tocó. No hay `git rm` hasta el «commit».
7. **El gatillo del texto de Trabajos** se midió con las mismas reglas que los CTA (la franja, la guarda y la salida al subir): los tres se comportan igual.
8. **El espía del foco** (`diag-foco.cjs`) envuelve `focus()` y `requestAnimationFrame` en la página para medir. No toca el repo ni la página servida.
9. **Lo medido del foco es de un Chromium sin GPU.** El mecanismo es el mismo en un navegador real, pero el 25 % puede variar con la máquina.

---

## 7. Qué mira Valentino

El dev está en `http://localhost:3001` (se prende con `npm run dev -- -p 3001`).

1. **La pausa del video** (`/v3/paginas-web`, a 1440 y a 390): bajá hasta «Trabajos». Abajo a la derecha, el disco con el ícono de pausa (al cierre, el nuestro de tinta de 44 px, el del M3: §10). Apretalo con el mouse; después con Tab hasta el disco y Enter, y Espacio. Tiene que pausar y seguir, mostrar el ícono contrario, y el anillo de foco tiene que verse sobre el video.
2. **Los gatillos** (`/v3/paginas-web`, a 1440 y a 390): el CTA de debajo del precio, el texto de «Trabajos» y el CTA del final tienen que entrar al bajar, **verse salir** al subir despacio, y, si parás con alguno apenas asomado abajo, entrar solo (≈ 180 ms después).
3. **El foco, P-H10** (`/v3/paginas-web`, a 1440, con el teclado): Tab hasta «Quiero mi página web» de debajo del precio, Enter, Esc, y mirá si el anillo vuelve al botón. **Repetí 8 o 10 veces: en una de cada cuatro no va a volver** (P-H26). Lo mismo con el CTA del final.
4. **La X, P-H12** (a 1440): abrí el contacto y cerrá con un clic en la X. Tiene que cerrar siempre.
5. **De pasada, Software e IA** (`/v3/software-a-medida` y `/v3/ia-y-automatizaciones`): no hay video de trabajos; sus dos CTA entran con el mismo gatillo.

---

## 8. Lo que quedó afuera

- **El P-H26 y el P-H27** son del home; no se tocaron.
- **`npm run verificar` completo** no se corrió: el gate de este sprint son el lint, `tsc`, los seis barridos y los tests. Se corrieron además `s77` y `s25-contacto` del home.
- **La barra de Contacto del home** (la que también abre el modal) no se midió: es del home y el código del foco es el mismo.
- **Los logs de M1 y de M3** siguen diciendo que el gatillo y la pausa eran nuestros: son historia, de cuando era así.

---

## 9. Al «commit» (el plan del 18; lo que se hizo está en §10.4)

1. Los dos borrados, con `git rm` (no se repiten en el `git add`): `movimiento/Gatillo.tsx` y `movimiento/disparo.ts`.
2. `git add` por nombre de los 6 archivos modificados y de este log. No `SPEC.md` ni `CONTRATO.md`.
3. Mirar `git status --short` y `git diff --cached --stat` antes de commitear.
4. Mensaje «R1: gatillo y pausa comunes del home». Push sin force.
5. Apagar el dev (:3001).

---

## 10. El cierre (2026-10-19): la pausa propia por P-H27

Lo pidió la corrida desatendida «R1, precio b y V0», tarea 1: volver el video a nuestra pausa, la de antes del R1, con el comentario «P-H27: reemplazar por BotonPausa cuando llegue el ajuste de s77», sin editar ni esquivar `s77`.

### 10.1 Qué cambió

| Archivo | Qué |
|---|---|
| `movimiento/VideoDeFondo.tsx` | Vuelve el `BotonDePausa` propio (el `<button>` con sus íconos de lucide). Contra el de antes del R1 (`34c2c71d`), **la única diferencia es el comentario**: «P-H21: reemplazar por BotonPausa» pasó a «P-H27: reemplazar por BotonPausa cuando llegue el ajuste de s77» |
| `movimiento/reproduccion.ts` | Vuelven `siguienteDeLaPausa` y `ROTULO_DE_LA_PAUSA`: queda **igual al de antes del R1**, así que no entra en el commit |
| `__tests__/pagina.invariant.tsx` | La pausa (§12) vuelve a afirmarse sobre la nuestra (§10.2). Lo del gatillo (§10 del test) no cambió |

El commit lleva así **5 archivos modificados, 2 borrados y este log**: `Bloque`, `Llamado`, `Trabajos` (el import del gatillo), `VideoDeFondo` (el comentario), el test, y los borrados `movimiento/Gatillo.tsx` y `movimiento/disparo.ts`.

**El marcado servido de las tres páginas, en desarrollo y en producción, es idéntico byte a byte al de antes del R1** (los seis archivos; antes, Páginas web cambiaba en el botón). Las capturas están en `C:\paginas-servicios-datos\c2\r1\html\`, y la base, en `C:\paginas-servicios-datos\r1\html-antes\`. Por eso no se volvió al navegador: la pausa propia es la que se midió en el M3, con el mismo marcado, y el gatillo es el que se midió el 18 (§4.1).

### 10.2 Los tests de la pausa, sin aflojar

- **Vuelven sobre la nuestra:** el marcador `pausa-del-video`, el nombre `ROTULO_DE_LA_PAUSA` y la alternancia `siguienteDeLaPausa`, con sus tres controles de siempre (sin nombre, que no alterna, sin el botón).
- **Se quedan del R1,** porque valen igual para la nuestra: el nombre igual en los dos estados (control: uno que cambia de nombre al pausar) y el lugar abajo a la derecha (control: uno arriba).
- **La afirmación del pedido:** el botón lleva el comentario «P-H27: reemplazar por BotonPausa cuando llegue el ajuste de s77» **y** el video no importa `BotonPausa`, que es lo que `s77` fija hoy. Controles: un fuente sin el comentario, y uno que ya importa `BotonPausa`.
- **Se va** «el video usa la pausa del home» (con sus tres controles), porque ya no la usa. La equivalente es la del pedido.
- **«En Software e IA no hay video»** mira las dos pausas, la nuestra y la del home, con un control para cada una.
- **La nota de un pedido cumplido** (`P-H18: reemplazar`, `P-H21: reemplazar`) sigue sin aparecer en ningún fuente: la del P-H21 pasó a ser la del P-H27.

**`pagina`: 240 afirmaciones y 125 controles**, las mismas cifras que el 18: de los 4 de «el video usa la pausa del home» (1 afirmación y 3 controles) quedan 3 en la del pedido (1 y 2), y se suma 1 control en «sin video».

### 10.3 El gate

| Paso | Resultado |
|---|---|
| Lint de los 6 archivos tocados (con `reproduccion.ts`) | **0** |
| `tsc --noEmit` (4 GB) | **0 errores** (21 s; `.next/dev/types` estaba sana, regenerada por un dev de las 21:23) |
| `datos` · `precios` · `slots` · `seo` | 55/0 · 22/0 · 44/0 · 56/0 |
| `pagina` · `medios` · `diagonales` | **240/0 (125)** · 26/0 · 36/0 |
| s38 · s44 · s74 | 57/0 · 45/0 · 34/0 |
| **`s77` (del home)** | **35/0: en verde** |
| `s25-contacto` (del home) | 35/0 |
| Los seis barridos | iguales a la base del merge: `s4-paquete` 21/0, `s40-3d-sonido` 38/0 (con el índice del commit, §3.3), `s53-pulido-2` 54/0, `s8-escena` 33/0, `s8-montaje` 56/2 (las dos de los 300 renglones; la salida es la del merge salvo los conteos, 2492 → 2490 y 984 → 982), `s9-sentry` 22/0 con 2 fuera de ventana |
| `next build` | no se corrió |

Las salidas están en `C:\paginas-servicios-datos\c2\r1\`. Antes de cada proceso pesado se esperó a tener 3 GB libres y ningún `next build` ni arnés del home corriendo (la regla de esta corrida). No hizo falta esperar: hubo entre 7,4 y 7,8 GB libres. El dev de :3001 del 18 ya estaba apagado al empezar.

### 10.4 El commit

`git rm` de los dos borrados, `git add` por nombre de los cinco modificados y de este log (sin `SPEC.md` ni `CONTRATO.md`), `git status --short` y `git diff --cached --stat` mirados antes, mensaje «R1: gatillo comun del home (pausa propia por P-H27)» y push sin force.

### 10.5 Decidido por CC, revisar

1. **Me quedé con dos afirmaciones del R1 en la pausa propia** (el nombre igual en los dos estados y el lugar abajo a la derecha): son verdad también para la nuestra y no aflojan nada.
2. **No volví al navegador** para la pausa: el marcado servido es byte a byte el de antes del R1, y esa pausa se midió en el M3.
3. **P-H26 sigue abierto** (es del home y no depende de la pausa): el foco puede caer en `body` al cerrar el modal.
