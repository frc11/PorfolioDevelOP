# B11 — LA INFORMACIÓN ACOMODADA A LA COREOGRAFÍA

> Rama `v3/acomodamiento` · worktree `C:\v3-acomodamiento` · instrucción
> `docs/rediseno/sprints/B11-acomodamiento.md`. **La coreografía manda y el
> texto se mueve.** Seis deudas declaradas por B8 (`deudas-b8.ts`, D-B8.1 a
> D-B8.6), una causa —el logo pasa por detrás del texto—, y un solo tipo de
> arreglo permitido: correr el texto. La escena, el arco, el anclaje, el
> progreso, las poses y las superficies no se tocaron (§11).

---

## 0 · En una pantalla

| | |
|---|---|
| **Qué se movió** | Números entero a la mitad que el logo deja libre (c7–c12, dispersión conservada); en Quiénes somos «Cómo trabajamos» y la primera persona a c7–c10 y la foto de 4 a 3 columnas en c3–c5 con el epígrafe a la derecha; en Trabajos el renglón del nombre arriba de la captura. En la PARADA 2, la palanca de la tinta en Quiénes somos: dos piezas de `opacity-casi` a plena. Ni una palabra cambió. |
| **Qué cierra** | **Cuatro de las seis, por estructura:** el logo pasa por detrás del texto el **0 % del tramo en 1440, 1920 y 2560** en Números (D-B8.1, su mitad del logo), Trabajos (D-B8.2, su mitad de la captura), Hero (D-B8.5) y Quiénes somos (D-B8.6). Es la vara que fijó la PARADA 1: estructura 0 % + logo 0 %. |
| **Qué NO cierra, por decisión** | D-B8.3 (el diferencial: el logo detrás del titular el 3–6 % del tramo, y el cuerpo sobre la PARED —luz, no posición—; el nivel del titular no se toca) y D-B8.4 (el Cierre como está). La mitad del atardecer de D-B8.1 (la última cifra no se sube a la fila 1: reabriría el hueco de 1,47 pantallas de B2). |
| **Ninguna cierra por AA** | Abajo de la estructura hay un piso —las motas, las partículas de la sala— que ninguna columna baja: **0,42–0,57 % del cuadro bajo AA en cualquier instante**. Se publica con número por sección (`deudas-b11.ts`, D-B11.1 a D-B11.4) y las filas de `s10-acceso-escena.ts` corren como `deudaDeclarada` contra él, **con la condición intacta**. |
| **La palanca de la tinta** | Las dos piezas de Quiénes somos al 0,6 fallaban ENTERAS (mediana 4,06–4,30, 494 de 494 px). A plena la mediana salta a 7,4–13,2 y quedan 5–21 px bajo AA de ~550: el peor píxel sigue en 2,37–3,98, y son motas. La tinta corrige el borde, no el piso (§6). |
| **Una atribución falsa** | D-B8.5 (hero) decía «el logo detrás de piloto automático.»: el logo pasa por detrás del hero el **0 %** del tramo, antes y después. Los 3 de 7 eran motas. Cerró sin mover un píxel, y estuvo contada como deuda del logo durante tres bloques (§3). |
| **Un defecto del instrumento de B8** | `c-las-ocho.ts` leía el texto de la pastilla de navegación como glifo del bloque de abajo (los 540 px «bajo AA» a 1,00 de «Lo que se puede contar» eran la pastilla). `scripts-b11/b-bloques.ts` recorta la pastilla; las cifras sin recorte quedan en `outputs/b11/sin-recorte/`. |
| **Peso** | +25 B netos contra los 2,9 B de aire que dejó B10 (+63 antes de la palanca, −38 por las dos clases que se fueron) → **montaje declarado `MONTAJE_DE_B11_KIB = 0.03`** con A/B sobre el mismo árbol, reparto byte a byte y alternativa escrita. **El 60 no se movió**; aire 8,6 B. Tres cifras que no se comparan entre sí, en §10. |
| **Censo de B9** | 1,33 (1920) y 1,20 (1440) antes y después: no cambió un hueco máximo. |
| **La referencia** | nk.studio resuelve por LUZ (sala a 0,001–0,06, tinta clara, objeto oscuro del 1–7 % del cuadro), no por posición; nuestra paleta es la inversa y por eso acá es estructuralmente más difícil (§14). |
| **Gate** | `npm run verificar`: 28 pasos, 0 con falla (15 deudas declaradas: 11 en `s10-acceso`, 4 en `s8-tinta`). `test:frontera`: 0 fallas. Build final: exit 0. |

---

## 1 · `verificar`, build y frontera (PARADA 2 · a)

- **`npm run verificar`** sobre el árbol final: PASO 1 y 1b limpios, `tsc --noEmit` exit 0, 25 agregados, **28 pasos y 0 con falla**. Las deudas declaradas se cuentan aparte: 11 en `s10-acceso` (las filas de la escena) y 4 en `s8-tinta` (las del modelo, EXACTAMENTE las cuatro de B8, sin cambios).
  - ⚠️ La primera corrida sobre el árbol falló en dos agregados (`s5-codigo` y `s7-contrato`) por la MISMA causa: los tres archivos que B11 tocó con prosa —`Numeros.tsx`, `QuienesSomos.tsx`, `numeros.invariant.tsx`— venían de HEAD con 299, 299 y 300 líneas y cruzaron las 300. Se resolvió **comprimiendo prosa, no partiendo módulos** (partir un módulo de producto cuesta bytes de envoltorio y el aire no da): 298, 300 y 296 líneas, con los mismos hechos y decisiones; los dos lectores genéricos de etiquetas del invariante (`etiquetasDeAperturaCon`, `claseDe`) se mudaron a `_secciones/_invariantes/marcado.ts`, que es donde viven los lectores de marcado. Cero bytes, probado con un rebuild (§10).
- **Build:** `next build --webpack` en primer plano con `CIRCLE_NODE_TOTAL=2` y `NODE_OPTIONS=--max-old-space-size=6144`, tres veces (115, 162 y 168 s), exit 0 las tres; el último, sin un solo proceso `node` o `chrome` del worktree vivo, da los 63.889 B que se declaran. `.next` es el árbol final; `.next-b11` es el «antes» (ignorado en `.gitignore` ANTES de construirlo). Los servidores se cerraron por PID verificando la ruta del worktree antes de cada build.
- **`npm run test:frontera`** (contra HEAD, antes del commit): 2 invariantes · 23 afirmaciones · 10 controles positivos · 0 fallas (12 fuera de ventana).
- Corridas sueltas, para el reporte: `s5-peso` 17/0 · `s10-acceso` 98/0 + 11 deudas · `s8-tinta` 30/0 + 4 deudas · `s5-numeros` 99/0 · `s5-quienes-somos` 83/0 · `s5-trabajos` 137/0 · `s5-codigo` 40/0 · `s7-contrato` 28/0.

---

## 2 · Las seis deudas, antes y después, con el instrumento que las declaró (b)

**El instrumento es el de B8** —`scripts-b8/c-las-ocho.ts`: cinco capturas por posición (C, A, T, S, V), máscara de glifo, el peor píxel bajo el glifo con el logo incluido— importado tal cual por `scripts-b11/b-bloques.ts`, con tres diferencias que no son del método: paso de un cuarto de pantalla (B8: media), los tres anchos de la instrucción (1440×900, 1920×1080 y el 2560×1440 local de `b11-comun.ts`), y **la pastilla de navegación recortada de las cajas** (§13). El «antes» se midió sobre el build intacto (`.next-b11`, servido en el 3005); el «después» sobre el dev del 3000 con el producto movido. A cada bloque se le cruzó además la silueta del logo a lo largo del tramo entero (`a-logo.ts` + `e-cruce.ts`, §7): «logo» abajo es la fracción de la caja del bloque que la silueta tapó **alguna vez** en el tramo y la fracción **del tiempo** en que la tapó.

| Deuda | B8 (1440, media pantalla) | B11 antes · peor / bajo AA · logo detrás | B11 después | ¿Cierra? |
|---|---|---|---|---|
| **D-B8.5 Hero** | 3 de 7, 2,94 · «el logo detrás de piloto automático.» | 1440 2,94 (3/7) · 1920 3,04 (1/6) · 2560 2,90 (5/6) · **logo 0 %** en las 17 paradas de los tres anchos | 2,94 (3/7) · 2,56 (2/6) · 2,90 (5/6) · logo 0 % | **Sí, por estructura, sin mover nada**: la atribución era falsa (§3). Lo que falla son 6–20 px de 10.191 por captura: motas (D-B11.1). |
| **D-B8.6 Quiénes somos** | 14 de 17, 1,00 | tinta plena **1,00** (11/15 · 12/16 · 12/16); «Trabajamos desde Tucumán…» 62,9 / 17,7 / 61,4 % de su caja bajo el logo, la foto **100 %** en los tres anchos, el epígrafe el 76,6 % (1440) y el 100 % (2560); 3 bloques con logo por ancho, hasta el 40,9–47,8 % del tiempo · al 0,6: 1,87 · 1,93 · 1,93 | tinta plena 2,26 (16/17) · 2,26 (16/18) · 2,12 (11/18) · **logo 0 % en los 17–18 bloques, tres anchos** · las dos piezas al 0,6 pasaron a plena: 2,37–3,98 (§6) | **Sí, por estructura.** Queda el piso (D-B11.2): motas y la celosía bajo la segunda persona. |
| **D-B8.1 Números** | 10 de 13, 1,00 + el atardecer | tinta plena **1,00** (7/8 en los tres) · media 1,00 (5/5) · 1,03 (5/5) · 1,03 (4/5); 9, 9 y 10 de 13 cajas con logo, hasta el 53,2 / 44,6 / 51,7 % del tiempo | tinta plena 2,33 (6/8) · 2,22 (5/8) · 2,06 (5/8) · media 1,01 (5/5) · 1,37 (4/5) · 1,04 (4/5) · **logo 0 % en las 13 cajas, tres anchos** (§4: el «03» de la costura a 2560 aparte) | **La mitad del logo, sí.** La del atardecer queda ABIERTA por decisión: «Procesos automatizados» con el 95,9 % de su caja bajo AA en la peor parada a 1440 (8,7 % del tramo, 1,06:1). El piso, D-B11.3. |
| **D-B8.2 Trabajos** | 3 de 9, 2,53 | tinta clara 3,84 (5/6) · **2,04** (4/7) · 3,84 (3/5); a 1920 el renglón del nombre caía en la franja de piso iluminado al pie del cuadro: «Banú» 2,04 (449 de 455 px), «Lo que cambió» 3,14, «[MÉTRICA]» 3,82, «El Garage» 3,62, con el 85,7–100 % de su caja bajo el mapa de AA · logo 0 % (33 paradas a oscuras) | 3,78 (2/5) · 3,78 (3/5) · 4,00 (6/8); a 1920 los cuatro dan 4,83 · 3,67 · 4,75 · 3,62 con **0 %** de su caja bajo el mapa | **La mitad de la captura, sí** (el renglón arriba de la captura). La del modelo —asoma con la sala a pleno sol— es luz. Las partículas que brillan, D-B11.4. |
| **D-B8.3 Por qué develOP** | 5 de 7, 1,11 | 1,11 (7/9) · 2,30 (7/9) · 2,16 (7/9); el titular con el logo detrás el 21,8–32,8 % de su caja alguna vez y el **3,2–6,0 % del tiempo** (1440; 3,6–4,2 % a 1920/2560); el cuerpo con logo **0 %** y con la pared el 92–100 % alguna vez, **18–49 % del tiempo** | idéntico (nada se movió): 1,11 (10/12) · 2,30 (7/9) · 2,30 (7/9) | **No, por decisión 4.** La palanca de la tinta no existe ahí (los 14 bloques ya están en #111111 a alfa 1). Es luz: D-B5.1 re-escrita (§9). |
| **D-B8.4 Cierre** | 0 de 25 (el pie tapa la sala) · variantes 13/25 y 25/25 | como está: **0 de 25–26** en los tres anchos (18,00). Con el pie sin relleno, en la pose: papel-transparente 13/25 · 13/26 · 10/26 (peor 1,01–1,09); oscuro-transparente 25/25 · 26/26 · 26/26 (peor 1,00–1,01); en las dos el peor es «El envío está deshabilitado…» con todo su glifo bajo AA (2.354–2.417 px), y 0 bloques sobre el logo en la pose | idéntico | **No, por decisión 6.** |

**La otra mitad de cada deuda —el modelo de `s8-tinta` §4— no cambió y no podía cambiar:** mide la luz en la ventana de cada sección (numeros 1,20:1 en p=0,5000 · trabajos 1,02 en p=0,4688 · por-que-develop 3,19 en p=0,7411 · cierre 1,59 en p=0,8838), B11 no tocó la luz, y el invariante sigue afirmando «las deudas son EXACTAMENTE esas cuatro». Las entradas de `deudas-b8.ts` se re-escribieron con lo medido; **ninguna condición de `deudaDeclarada()` cambió** en `s8-tinta` ni en `s10-acceso` (§6).

---

## 3 · D-B8.5: una ATRIBUCIÓN FALSA, y cómo se detectó

**La deuda era real y la causa estaba mal.** B8 declaró D-B8.5 así: «Hero — el logo queda detrás de «piloto automático.» y del cuerpo (captura: 3 de 7 bloques bajo AA, peor 2,94:1)». B6-A ya medía 2–4 de 7 bajo AA en el hero, y S9 citaba 9,73:1 del modelo sin el logo; la lectura de B8 —hay logo en el hero, hay bloques bajo AA, luego el logo está detrás— pasó por tres bloques (B6-A, B8, B10) sin que nadie la contradijera, porque el instrumento de esos bloques medía **el peor píxel bajo el glifo en una posición** y no **qué había debajo**: un píxel a 2,94 no dice si lo que tiene detrás es el logo o una partícula.

**Cómo se detectó.** B11 agregó la pregunta que faltaba: la silueta del logo a lo largo del tramo entero (`a-logo.ts`, cada 1/16 de pantalla, volcada al documento y partida en estructura —componentes de más de 400 px— y motas), cruzada con la caja aterrizada de cada bloque (`e-cruce.ts`). Para el hero, en las 17 paradas de cada uno de los tres anchos, la fracción de la caja de cada bloque con logo detrás es **0 % alguna vez y 0 % del tiempo**, antes y después. Lo que sí había debajo, en el mapa de AA partido: 0 % de estructura y **1,2–4,5 % de motas** del tiempo. Y en las capturas, los píxeles bajo AA de «Tu negocio vendiendo» y «piloto automático.» son **6–20 de 10.191** por captura, en lugares distintos en cada captura: partículas.

**Por qué es el modo de falla que más caro sale.** Una deuda real con la causa equivocada manda trabajo al lugar incorrecto: si B11 hubiera seguido la entrada de B8 al pie de la letra, habría movido el hero —el titular y el cuerpo, con su composición de B1— para esquivar un logo que nunca estuvo ahí, pagando bytes y amplitud para dejar exactamente los mismos 6–20 px de motas debajo. La deuda cerró **sin mover un píxel** y su entrada en `deudas-b8.ts` quedó re-escrita con la causa medida, para que la próxima lectura no vuelva a mandar a nadie a la misma esquina. La regla que sale de acá: **una deuda de contraste se declara con lo que hay debajo del glifo, no sólo con el número del peor píxel.**

---

## 4 · Números: la salida elegida y la dispersión conservada (c)

**Dónde estaba el logo**, medido a lo largo de las cuatro pantallas con `a-logo.ts` (la silueta cada 1/16 de pantalla, volcada al documento) y cruzado con las doce columnas de la grilla (`h-columnas.ts`, `grillas.json`). Porcentaje de cada columna que alguna parada del tramo vio bajo AA:

| ancho | c1 | c2 | c3 | c4 | c5 | c6 | c7 … c12 |
|---|---|---|---|---|---|---|---|
| 1440 | 100 | 100 | 100 | 100 | 100 | 67–95 | **0** |
| 1920 | 20–100 | 86–100 | 100 | 100 | 100 | 17–81 | **0–3** |
| 2560 | 97–100 | 100 | 100 | 100 | 100 | 10–85 | **0–7** |

Las columnas 1–5 están tapadas en las cuatro pantallas y en los tres anchos; la 6 a medias; **de la 7 a la 12 queda libre**. La salida (decisión 2 de la PARADA 1): la composición entera vive desde la 7 —`GEOMETRIA.primeraColumnaLibre = 7`, afirmado por el invariante sobre el marcado—:

| pieza | antes | después |
|---|---|---|
| rótulo «03 · Números» | sin `col-start` (columna 1) | `col-start-7` |
| cabecera (titular + bajada) | c1–c7 | c7–c12 |
| proyectos (`titulo-xl`) | c1–c5, fila 1 | **c7**–c12, fila 1 |
| clientes (`titulo-m`) | c9–c12, fila 2 | **c9**–c12, fila 2 (no se mueve) |
| años (`titulo-s`) | c3–c5, fila 1 | **c8**–c10, fila 1 |
| respuesta (`titulo-l`) | c7–c12, fila 2 | **c10**–c12, fila 2 |
| procesos (`titulo-m`) | c2–c5, fila 2 | **c7**–c10, fila 2 |

**La dispersión se conserva en cinco ejes** —cinco arranques de columna en cuatro valores distintos (7 · 9 · 8 · 10 · 7), tres anchos distintos (6 · 4 · 3), renglón propio (cinco pares `(pantalla, fila)` distintos), tres pantallas para las cifras y los cuatro tamaños de la escala— y el invariante lo afirma (99 afirmaciones, 0 fallas). **Lo que se pierde, con número:** la amplitud. La composición medía 1.220 px de ancho a 1440 y pasa a 594: de doce columnas a seis. Es el trade que la instrucción pedía elegir con el número, y lo eligió el humano.

**Lo que no cierra y por qué no se sube:** «Procesos automatizados» (fila 2 de la pantalla 4) queda bajo el atardecer al final de su ventana: el modelo cruza AA hacia abajo en p=0,4882 y el bloque sale del cuadro en p≈0,4995; en la captura, el 95,9 % de su caja está bajo AA en la peor parada (8,7 % del tramo, 1,06:1 a 1440). Subirla a la fila 1 la sacaría del atardecer, pero B2 la bajó a propósito: en la fila de arriba su aterrizaje dejaba **1,47 pantallas** hasta el primero de Trabajos, contra el gate de 1,33 de B9. El ritmo tiene gate y la cifra no: queda publicada (D-B8.1 por el modelo, D-B11.3 por el piso).

**El instrumento se arregló, no se aflojó (decisión 2):** `celdasDe` en `numeros.invariant.tsx` levantaba toda clase con `tablet:col-start-` y por eso el rótulo iba sin `col-start` —posicionado, contaba como sexta cifra—. Ahora salta el rótulo **por su pieza** (`data-pieza="etiqueta-de-seccion"`), no por su clase, y afirma aparte que el rótulo está posicionado en la pantalla de la cabecera, en su misma columna, y que ninguna pieza arranca antes de la primera columna libre. Un control positivo prueba que la misma clase SIN la pieza sigue contando: lo que lo salva es la marca.

**El «03» de la costura, a 2560:** la única lectura de Números con logo debajo después del movimiento es el número de sección que `Seccion.tsx` pinta en la costura (documento y = top − 1, 12 px de alto, x = 336): la silueta lo tapa el 100 % alguna vez y el 40,7 % del tiempo, porque el borde superior de la sección entra por el pie del cuadro justo donde el logo de la pantalla 3 de Quiénes somos está abajo a la izquierda. No es una celda de la composición, sus 13 capturas pasan AA (peor 5,25) y a 1440 y 1920 el mapa le da 0 %. Se publica; no se toca.

---

## 5 · Capturas: las que quedan y cómo se regeneran las otras (d)

**Lo que se commitea** (`docs/rediseno/capturas/b11/`, 99 PNG, 21 MB) es la evidencia que sostiene las afirmaciones, por decisión de la PARADA 2:

- **Los mapas cruzados** (72): `cruce-<antes|despues>-logo-<sección>-<ancho>.png` (la silueta del logo a lo largo del tramo, con las cajas de los bloques encima) y `cruce-<antes|despues>-aa-<tinta>-<sección>-<ancho>.png` (el mapa de AA de la tinta de la sección). Son §7.
- **El peor bloque de cada sección** (27): `<antes|despues>-<sección>-<ancho>-peor-y<scrollY>-C.png`, el recorte de la captura compuesta en la posición donde cada sección tiene su peor píxel: `antes-trabajos-1920-peor-y10800-C.png` (el renglón en la franja de piso iluminado), `antes-quienes-somos-1440-peor-y1575-C.png` (el logo detrás de «Trabajamos desde Tucumán…»), `despues-quienes-somos-*-peor-*` (la medición con la tinta a plena), etc.

**Lo que NO se commitea** (118 PNG, 74 MB) es reproducible con el instrumento y quedó en `.b11-capturas/no-commiteadas/` (carpeta ignorada). Cómo se regenera cada clase, con los servidores de la receta (`MEDICION-NAVEGADOR.md`: Chrome y dev servers cerrados antes de escribir en `docs/`):

```
# la pose C/S de cada sección (antes y después) y los peores bloques
E2E_DIST_DIR=.next-b11 QA_ALLOW_LOCALHOST=1 npx next start -p 3005      # el build intacto, para «antes»
npx tsx scripts-b11/b-bloques.ts --etiqueta=antes   --perfil=1440,1920,2560 --origen=http://localhost:3005
npx tsx scripts-b11/b-bloques.ts --etiqueta=despues --perfil=1440,1920,2560   # contra el dev del 3000
# las variantes del Cierre con el pie sin relleno (sobre el build intacto)
npx tsx scripts-b11/b-bloques.ts --etiqueta=antes-cierre-papel  --solo=cierre --cierre=papel-transparente  --origen=http://localhost:3005
npx tsx scripts-b11/b-bloques.ts --etiqueta=antes-cierre-oscuro --solo=cierre --cierre=oscuro-transparente --origen=http://localhost:3005
# los mapas de la silueta (insumo de los cruces) y los cruces
npx tsx scripts-b11/a-logo.ts --perfil=1440 ; ... --perfil=1920 ; ... --perfil=2560
npx tsx scripts-b11/e-cruce.ts --etiqueta=antes ; npx tsx scripts-b11/e-cruce.ts --etiqueta=despues
# la referencia (nk.studio a 1920, 44 paradas de media pantalla; el sitio puede cambiar: el JSON guarda las cifras)
npx tsx scripts-b11/c-referencia.ts
```

Las cifras de todas las capturas, commiteadas o no, están en `docs/rediseno/outputs/b11/` (7,9 MB): `bloques-<antes|despues>-<ancho>.json` (cajas aterrizadas, peor por bloque, veredicto, recortes de la pastilla y **las cajas crudas por posición**, para re-evaluar sin abrir el navegador), `logo-<ancho>.json`, `cruce-*.json`, `censo-*.json`, `grillas.json`, `referencia-nk-1920.json` y `sin-recorte/`.

---

## 6 · Contraste por bloque y por ancho, y la palanca de la tinta (e)

Cada fila es la PEOR de los tres anchos, derivada con `scripts-b11/d-filas.ts` de los tres JSON y transcripta a `s10-acceso-escena.ts` sin escribirla a mano; `(n/m)` es bloques bajo AA sobre bloques de esa tinta.

| sección · tinta | B8 (1440) | B11 antes: 1440 · 1920 · 2560 | B11 después: 1440 · 1920 · 2560 | causa después · deuda |
|---|---|---|---|---|
| hero · tinta@1 | 2,94 | 2,94 (3/7) · 3,04 (1/6) · 2,90 (5/6) | 2,94 (3/7) · 2,56 (2/6) · 2,90 (5/6) | motas · D-B11.1 |
| quienes-somos · tinta@1 | 1,00 | 1,00 (11/15) · 1,00 (12/16) · 1,00 (12/16) | 2,26 (16/17) · 2,26 (16/18) · 2,12 (11/18) | motas + celosía · D-B11.2 |
| quienes-somos · tinta@0,6 | 1,97 | 1,87 (2/2) · 1,93 (2/2) · 1,93 (2/2) | **la fila desaparece**: las dos piezas pasaron a plena (abajo) | — |
| numeros · tinta@1 | 1,00 | 1,00 (7/8) · 1,00 (7/8) · 1,00 (7/8) | 2,33 (6/8) · 2,22 (5/8) · 2,06 (5/8) | motas · D-B11.3 |
| numeros · tinta-media@1 | 1,02 | 1,00 (5/5) · 1,03 (5/5) · 1,03 (4/5) | 1,01 (5/5) · 1,37 (4/5) · 1,04 (4/5) | motas; y «Procesos» bajo el atardecer (D-B8.1) · D-B11.3 |
| trabajos · tinta@1 | 2,53 | 3,84 (5/6) · 2,04 (4/7) · 3,84 (3/5) | 3,78 (2/5) · 3,78 (3/5) · 4,00 (6/8) | partículas que brillan · D-B11.4 |
| trabajos · tinta@0,87 | 5,29 | 3,62 (2/2) · 3,62 (1/1) · 3,62 (1/1) | 3,85 (1/1) · 3,62 (2/2) · — | en tránsito; a plena 4,17 · D-B11.4 |
| trabajos · tinta@0,54 | — | 3,77 (1/1) · 3,82 (1/1) · 3,82 (1/3) | 2,39 (2/3) · 4,75 (0/2) · 3,89 (1/1) | en tránsito; a plena 4,23 · D-B11.4 |
| por-que-develop · tinta@1 | 1,11 | 1,11 (7/9) · 2,30 (7/9) · 2,16 (7/9) | 1,11 (10/12) · 2,30 (7/9) · 2,30 (7/9) | la pared (y el logo tras el titular 3–6 % del tiempo) · D-B8.3 |
| por-que-develop · tinta@0,66 / 0,7 / 0,76 | — | 2,25 (9/9) · 2,30 (8/8) · 2,19 (7/8) | 1,03 (6/6) · 1,03 (8/8) · 2,46 (7/8) | en tránsito; a plena 1,03: la pared · D-B5.1 |
| cierre · tinta@1 / @0,6 / tenue@1 | 18,00 / 6,85 / 6,44 | igual, 0 bajo AA en los tres | igual | el pie pinta #0E0E0E |

**La palanca de la tinta (PARADA 2).** Las dos piezas de Quiénes somos que iban a `opacity-casi` —«Tucumán, Argentina» (el lugar, pantalla 1) y el rótulo del pedido «Qué hace en un proyecto» de las dos personas (`Persona`)— pasaron a tinta plena, que es exactamente lo que B6-A hizo con el rótulo de Trabajos. Medido con el mismo instrumento, en los tres anchos, sobre el dev del 3000:

| pieza | al 0,6 (peor · px bajo AA / glifo · mediana) | a plena: 1440 | 1920 | 2560 |
|---|---|---|---|---|
| «Tucumán, Argentina» | 1,87–1,97 · 384–435 / 435–505 · 4,06 | 2,60 · 8 / 537 · 11,76 | 3,98 · 5 / 647 · 7,38 | 2,69 · 18 / 613 · 11,73 |
| «Qué hace en un proyecto» | 1,75–1,97 · 494 / 494 · 4,30 | 2,37 · 15 / 534 · 11,96 | 2,64 · 21 / 534 · 12,00 | 2,48 · 16 / 548 · 13,24 |

Al 0,6 los dos bloques fallaban ENTEROS: el 0,6 sobre el gris de la pared dejaba la mediana en 4,06–4,30, al borde de AA, y el 78–100 % del glifo abajo. A plena la mediana salta a **7,4–13,2** y lo que queda bajo AA son **5–21 píxeles de 534–647**, en lugares distintos en cada captura: motas. **No cierra en el peor píxel (2,37–3,98) y ya no es la tinta: es el piso, como en el resto**, y se publica en D-B11.2 con estas cifras. La palanca corrige el borde, no el piso. Costó −38 B (§10).

Dos lecturas de la tabla, y las dos con número: **(1) el logo desapareció** —la causa de cada fila bajo AA después es motas, celosía, pared o atardecer, y la fracción de la caja con logo detrás es 0 % en las cuatro secciones que lo tenían—; **(2) las razones «después» no llegan a AA y no van a llegar moviendo texto**: los peores píxeles son ahora 2 a 65 px por bloque (contra 1.135–3.496 con el logo detrás), y son partículas. Por eso el registro pasa de 7 filas en deuda (B8) a 11 (B11): tres anchos y los bloques en tránsito agregan filas, y cada una apunta a la deuda que la explica, con `f.razon >= AA` intacta. El guardia «ninguna fila declarada como deuda está ya saldada» sigue verde: el día que la escena baje el piso, las filas pasan y el guardia pide sacarles la deuda.

---

## 7 · Legibilidad a lo largo del tramo: los mapas cruzados (f)

`a-logo.ts` recorre cada sección cada 1/16 de pantalla (17 paradas el hero, 65 Quiénes somos, 81 Números, 33 Trabajos, 33 el diferencial, 17 el Cierre), clasifica cada parada —`logo` (silueta válida), `vacio` (cuadro sin escena), `oscuro` (silueta > 35 % del cuadro: la noche)— y vuelca al documento seis máscaras por parada: la silueta del logo (estructura, componentes > 400 px), las motas (≤ 400 px), el brillo, y el mapa de AA de cada tinta partido en estructura y motas. `e-cruce.ts` cruza esos mapas con la caja aterrizada de cada bloque (`cruce-<antes|despues>.json`, y los PNG de §5):

| sección | paradas (logo / oscuras) | bloques con logo detrás: antes → después (1440 · 1920 · 2560) | logo del tiempo, máximo: antes → después |
|---|---|---|---|
| hero | 17 / 0 | 0 · 0 · 0 → 0 · 0 · 0 | 0 → 0 |
| quienes-somos | 65 / 0 | 3 · 3 · 3 → **0 · 0 · 0** | 40,9 · 41,4 · 47,8 % → **0** |
| numeros | 80 / 1 | 9 · 9 · 10 → **0 · 0 · 1 («03» de la costura)** | 53,2 · 44,6 · 51,7 % → 0 · 0 · 40,7 (el «03») |
| trabajos | 0 / 33 (la noche) | 0 → 0 | 0 → 0 |
| por-que-develop | 33 (29 + 4 vacías a 1920/2560) / 0 | 4 · 3 · 3 → 4 · 3 · 3 (nada se movió) | 6,0 · 4,2 · 3,9 % → igual |
| cierre | 17 / 0 | 2 · 0 · 0 → igual (pasan: 18,00, el pie tapa la sala) | 6,8 % → igual |

**El piso, por sección** (`motasDeAAMedia` / `Maxima`: fracción del cuadro bajo AA por motas, promedio de las paradas / peor parada): hero 0,42–0,45 % / 0,56–0,58 · quienes-somos 0,54–0,57 / 0,66–0,74 · numeros 0,45–0,48 / 0,61–0,65 · trabajos (tinta clara) 0,45–0,53 / 0,48–0,58 · por-que-develop 0,24–0,28 / 0,40–0,54 · cierre 0,08–0,39 / 0,13–0,54. Es lo que un bloque tiene debajo en cualquier instante sin que nadie lo haya puesto ahí, y es lo que las filas de §6 miden cuando ya no hay logo.

---

## 8 · El censo de B9: 1,33 y 1,20, antes y después (g)

`scripts-b11/censo.ts` (el `scripts-b4/censo.ts` de B2-DELTAS §0, paso 120 px, origen 3000), contra la vara de B9:

| | 1920 antes | 1920 después | 1440 antes | 1440 después |
|---|---|---|---|---|
| hueco máximo (pantallas) | **1,33** | **1,33** | **1,20** | **1,20** |
| hueco medio | 0,66 | 0,66 | 0,73 | 0,73 |
| acontecimientos · piezas | 21 · 193 | 21 · 193 | 17 · 182 | 17 · 182 |

A 1920 dos huecos vecinos cambian de reparto (1,11 y 0,78 → 1,00 y 0,89; la suma es la misma): la foto de Quiénes somos, 270 px más corta, aterriza un paso del censo antes (el grupo pasa de `y` 3.480 a 3.360). A 1440 la lista es idéntica. `censo-antes.json` y `censo-despues.json`. (La palanca de la tinta no mueve una caja: no cambia el censo.)

---

## 9 · El diferencial (h)

- **La palanca de la tinta no existe ahí** (decisión 4): los 14 bloques aterrizados del diferencial están en `#111111` a alfa 1 en el marcado y en la captura; no hay tinta media ni `opacity-casi` que subir a plena.
- **El nivel del titular no se toca** (decisión 4): el logo pasa por detrás de las tres líneas del titular el 21,8–32,8 % de su caja alguna vez y el 3,2–6,0 % del tiempo a 1440 (3,6–4,2 % a 1920 y 2560), en el tramo de entrada de la sección.
- **El cuerpo es luz, no posición:** «El diferencial no está en el diseño…» y los cuatro bloques tienen el 92–100 % de su caja bajo AA alguna vez y el 18–49 % del tiempo **con el logo debajo el 0 %**: lo que hay detrás es la PARED de la sala al nivel 0,643 del ancla. Moverlos de columna no cambia lo que hay detrás, porque detrás hay pared en las doce. A 1440 el peor píxel es 1,03–1,11:1 y a plena da lo mismo. **D-B5.1 queda ABIERTA y RE-ESCRITA como problema de luz** (`deudas-b11.ts`, `diferencialPared`): el nivel del amanecer en el ancla, o la sala detrás de esa pantalla, y lo decide el humano.
- **El paralaje no se tocó.** D-B8.3 sigue como deuda del modelo (3,19:1 en p=0,7411, vuelve a AA en p=0,8118) y de la captura (1,11), ABIERTA por decisión.

---

## 10 · Peso: +25 B netos contra 2,9 B de aire → un montaje declarado (i)

- **A/B sobre el mismo árbol y el mismo entorno**, con `scripts-b8/peso.ts` (5 chunks propios, el preámbulo de Sentry restado): `.next-b11` (antes de tocar producto) **63.864 B escritos** —exactamente los de B10— y `.next` (final) **63.889 B = 62,392 KiB**: **+25 B**, todos en el chunk de `page` (49.098 → 49.123 B); los otros cuatro chunks son idénticos.
- **Atribuidos byte a byte** con un diff por tokens del chunk minificado (`s5-presupuesto-recibos-de-b11.ts`): la caja de la foto de Quiénes somos +27 (el minificador la saca a una variable), su epígrafe alineado a la derecha +34 (`className:"escritorio:text-right",`), Números +2 (dos dígitos más en dos clases), Trabajos 0 (el `MarcoDeMedio` sale de un lugar y entra en otro: −120/+120), **las dos clases `opacity-casi` que se fueron −38** (−13 en el rótulo del pedido, −25 en «Tucumán, Argentina»), el `_sentryDebugId` 0. Suma: 25.
- **Declarado `MONTAJE_DE_B11_KIB = 0.03`** (25 B = 0,0244 KiB, al centésimo de arriba como B8 y B10), sumado en `MONTAJES_DECLARADOS_KIB`. El techo pasa de 62,37 a **62,40 KiB**; aire **8,6 B**; y el techo viejo sigue vigilando: 62,392 − 2,40 = 59,992 < 60. **El 60 no se tocó.**
- **La alternativa, escrita:** no mover la foto ni su epígrafe (−61 B, cierra sin declarar) y dejar el marcador de la foto el 100 % bajo el logo en los tres anchos. Descartada por eso, no por el ahorro. Con la palanca puesta, también «la foto movida y el epígrafe a la izquierda» (−34 B) cierra sin declarar, por 11,9 B, dejando los 372 px del epígrafe en c3 (34–60 % bajo el logo): descartada por lo mismo.
- La compresión de prosa de §1 costó **0 B**: el build posterior a la compresión dio los mismos 63.927 B que el anterior (comentarios no llegan al chunk; B10 ya lo había probado). El build final, después de la palanca, da los 63.889 B de arriba.

### 10.1 · 0,03 estimados, 0,07 medidos, 0,03 declarados: tres cifras que NO se comparan entre sí

En la PARADA 1 el montaje se estimó en **0,03 KiB**; en la PARADA 2 el número medido fue **0,07**; el declarado final es **0,03**. Son tres cifras de tres varas distintas y ninguna valida a la otra:

1. **0,03 (PARADA 1) es una estimación sobre los literales del FUENTE:** foto +23 (`col-start-3` sobre `col-span-4`), epígrafe +22 (`escritorio:text-right`), Números +2 = 47 B, contados sobre el `.tsx` antes de construir.
2. **0,07 (PARADA 2) es una medición sobre el CHUNK:** 63 B entre dos builds. El minificador no copia el fuente: la clase de la foto entró como variable (`y="…",w` +49 y `className:y` −22 = +27, no +23) y el epígrafe pagó su propiedad `className:` entera (+34, no +22). La estimación se quedó corta 16 B por dos mecanismos que sólo aparecen en el chunk.
3. **0,03 (final) es la misma medición sobre el chunk después de la palanca de la tinta:** 63 − 38 = 25 B. Coincide con la estimación por casualidad de dos desvíos de signo contrario —16 B de minificador hacia arriba, 38 B de dos clases que se fueron hacia abajo—, no porque estimar sobre el fuente funcione.

**La regla que sale de acá:** dos cifras del mismo sprint sólo se comparan si salen de la misma vara. Una estimación sobre literales sirve para decidir si vale la pena construir; el número que se declara es el del chunk, y el recibo escribe los tres para que nadie sume una con otra.

---

## 11 · Nada más se movió (j)

`git status` lista exactamente los archivos de §12. `git diff --stat` contra HEAD es **vacío** para `_lib/escena/`, `anclaje.ts`, `recorrido.ts`, `superficies.ts`, `secciones.ts`, el preloader, `_contrato/`, `/probe-escena`, los archivos congelados (`3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`), el home actual y las zonas del otro socio (`OsLead*`, `ActivityChannel`, `/setter`, `/leados/`). El diff de los tres archivos de producto **sin comentarios** contra HEAD es exactamente: en `Numeros.tsx` el campo `primeraColumnaLibre` y siete cadenas de clase; en `QuienesSomos.tsx` `columnas: 3`, `claseDeLaCaja`, dos cadenas del reparto, el `className` del `Bloque` de la foto, el del `Caption` del epígrafe, y las dos clases `opacity-casi` que se fueron; en `Proyecto.tsx` el `MarcoDeMedio` después del renglón del nombre. Poses, arco, anclaje, progreso, rangos de patrón y superficies: intactos. Ningún `any`, ninguna dependencia nueva, ningún valor fuera de tokens, ningún `setState` por cuadro.

---

## 12 · Archivos y `git status` (k)

**Producto (3):** `src/app/v3/_secciones/numeros/Numeros.tsx` · `quienes-somos/QuienesSomos.tsx` · `trabajos/Proyecto.tsx`.
**Invariantes y registro (9):** `numeros/numeros.invariant.tsx` · `_secciones/_invariantes/marcado.ts` (dos lectores genéricos) · `_lib/__tests__/deudas-b8.ts` (prosa re-escrita, condiciones intactas) · `deudas-b11.ts` (nuevo) · `s10-acceso-escena.ts` (las 14 filas de B11) · `s10-acceso-contraste.ts` (el registro unido; condiciones intactas) · `s5-presupuesto.ts` (`MONTAJE_DE_B11_KIB`) · `s5-presupuesto-recibos-de-b11.ts` (nuevo) · `s5-peso.invariant.ts` (la línea del techo).
**Instrumentos (nuevos, `scripts-b11/`, 11 archivos):** `b11-comun.ts` · `mapa.ts` · `a-logo.ts` · `b-bloques.ts` · `c-referencia.ts` · `censo.ts` · `d-filas.ts` · `e-cruce.ts` · `f-tablas.ts` · `g-grillas.ts` · `h-columnas.ts`.
**Evidencia:** `docs/rediseno/outputs/b11/` (7,9 MB de JSON) · `docs/rediseno/capturas/b11/` (99 PNG, 21 MB: los mapas cruzados y el peor bloque por sección; §5) · este reporte · la instrucción `docs/rediseno/sprints/B11-acomodamiento.md`.
**Configuración:** `.gitignore` (`/.next-b11/`, `/.b11-capturas/`) · `tsconfig.json` (Next agregó `.next-b11/types/**` al `include`, como pasó con `.next-b8` y `.next-b10`).

```
 M .gitignore                                            M src/app/v3/_lib/__tests__/s5-presupuesto.ts
 M src/app/v3/_lib/__tests__/deudas-b8.ts               M src/app/v3/_secciones/_invariantes/marcado.ts
 M src/app/v3/_lib/__tests__/s10-acceso-contraste.ts    M src/app/v3/_secciones/numeros/Numeros.tsx
 M src/app/v3/_lib/__tests__/s10-acceso-escena.ts       M src/app/v3/_secciones/numeros/numeros.invariant.tsx
 M src/app/v3/_lib/__tests__/s5-peso.invariant.ts       M src/app/v3/_secciones/quienes-somos/QuienesSomos.tsx
 M tsconfig.json                                         M src/app/v3/_secciones/trabajos/Proyecto.tsx
?? docs/rediseno/capturas/b11/     ?? docs/rediseno/outputs/b11/     ?? docs/rediseno/outputs/B11-ACOMODAMIENTO.md
?? docs/rediseno/sprints/B11-acomodamiento.md            ?? scripts-b11/
?? src/app/v3/_lib/__tests__/deudas-b11.ts               ?? src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-b11.ts
```

---

## 13 · Todo lo que se frenó, y cómo siguió (l)

1. **El harness mató tres barridos de fondo** «porque el sistema tiene poca memoria» (el Chrome del humano ocupaba ~5,9 GB; ~1 GB libre). Salida: todo en primer plano, en tandas de ≤ 10 min, un Chrome por vez, barridos por `--solo` sección y `fusionar()` de las rebanadas, JSON por ancho escrito a `.b11-capturas/` apenas termina cada sección. Al final mató también el `next dev` del 3000 lanzado para la verificación del humano; el proceso sobrevivió huérfano, siguió sirviendo, y fue el que sirvió la re-medición de Quiénes somos (misma vara que el resto del «después»); se cerró por PID, verificando la ruta del worktree, antes del build final.
2. **A 1920 la página no estaba entera** cuando el banco la verificaba (`verificarQueLaPaginaEstaEntera`: un panel de 3.325 px en un documento de 19.525): la fuente tarda en asentar. `asentarElHome` en `b11-comun.ts` reintenta hasta 6 veces cada 1,5 s; **la comprobación no se aflojó**.
3. **El instrumento de B8 leía la pastilla como glifo.** En «Lo que se puede contar» (Números, y=4050) los 540 px «bajo AA» a 1,00:1 estaban adentro de la pastilla de navegación, que flota encima; se confirmó con el recorte de la captura. `b-bloques.ts` recorta la pastilla de las cajas en cada posición (`recortes` en cada JSON: 1–5 bloques y 1.072–23.427 px descontados por sección y ancho). Las cifras sin recorte quedan en `outputs/b11/sin-recorte/` (14 JSON) y el «antes» se volvió a medir con el recorte sobre el build intacto servido en el 3005, para que antes y después tengan la misma vara. Es un defecto de `scripts-b8/c-bloques.ts` que sigue ahí: D-B11.5.
4. **Tres estados de la silueta, no dos.** Una parada con la escena suspendida (cuadro en blanco) se contaba como «a oscuras»; ahora `logo` / `vacio` / `oscuro`, y el mapa de oscuridad sólo cuenta las paradas iluminadas como vistas.
5. **La caja aterrizada de un bloque de P2** leída antes de entrar traía su transformada (el epígrafe de la foto, 372 px debajo de su sección): a igual opacidad gana la lectura más tardía.
6. **El 2560 es un perfil LOCAL** de `b11-comun.ts`: `scripts-b4/perfiles.ts` tiene siete y `banco.invariant.ts` afirma que son siete; agregar el octavo ahí es tocar un instrumento custodiado por otro bloque. Va con su procedencia (el ancho del peor caso del hero de la receta, §1 paso 2). Una corrida a 2560 falló una vez con el scroll sin asentar («se pidió y=3240 y el scroll quedó en 12382») y pasó al reintentar; el instrumento no se aflojó.
7. **La palanca de la tinta del diferencial no existe** (decisión 4): verificado en el marcado y en la captura, los 14 bloques ya están a plena. En Quiénes somos sí existía y se usó (§6).
8. **Las 300 líneas:** los tres archivos tocados con prosa cruzaron el límite y `verificar` los frenó; se comprimió prosa (0 B), no se partieron módulos (§1). De paso se corrigió en `QuienesSomos.tsx` un «`papel-opaco`» del docblock que venía viejo desde B8.
9. **El «[NOMBRE]» del Cierre** aparece en cada JSON con `peorContraste: null` (caja fuera del cuadro en la pose, sin glifo): el instrumento lo lista, `d-filas` no lo cuenta, y no cambia ninguna fila.
10. **El «03» de Números a 2560** (§4): la única lectura con logo debajo después del movimiento, y no es una celda.
11. **El montaje se midió dos veces** (63 B antes de la palanca, 25 después) y se declaró una: §10.1 explica por qué las tres cifras del sprint no se suman.

---

## 14 · La referencia: resuelve por LUZ, no por posición

`scripts-b11/c-referencia.ts` midió nk.studio a 1920 en 44 paradas de media pantalla (`referencia-nk-1920.json`; las capturas `referencia-<n>-C/S.png` se regeneran con el mismo script, §5), con el mismo criterio que acá: el objeto oscuro de la escena (desviación de la mediana, partículas descontadas), la caja del texto y su lado, y el peor píxel bajo cada glifo.

- **La sala es negra.** Luminancia de la sala entre **0,0007 y 0,0586** en las 44 paradas (0,001–0,06); entre las pantallas 3,5 y 9 directamente no hay objeto (0,0007: negro). La tinta es clara y **el objeto es oscuro y chico**: 1,3–7,5 % del cuadro en casi todas las paradas, 16,7 % dos veces y 31,1 % una.
- **Los glifos SÍ caen sobre el objeto**, en 9 de 44 paradas (hasta el 99,9 % de los glifos en la pantalla 11), y ahí los bloques bajan a **1,11–2,82:1** (39 de 304 bloques bajo AA en total, varios de ellos por tinta clara a baja opacidad sin objeto detrás). Es decir: **la referencia no acomoda el texto para esquivar el objeto; deja que se crucen y paga poco**, porque un objeto oscuro sobre una sala negra le quita al texto claro un margen chico, y porque el objeto ocupa poco cuadro.
- **Nuestra paleta es la inversa**: papel claro, tinta oscura y un logo NEGRO que ocupa hasta el 35 % del cuadro. Cada cruce es 1,00:1 sin remedio, no 1,1–2,8, y el logo tapa cinco columnas de doce durante pantallas enteras. Por eso acá el mismo hallazgo es estructuralmente más difícil, y por eso seis bloques distintos chocaron contra lo mismo: **el problema de la referencia se resuelve con luz** (sala oscura, tinta clara, objeto tenue) **y el nuestro sólo se puede resolver con posición** —que es lo que B11 hizo— hasta donde la posición llega; lo que queda (motas, pared, atardecer) es luz, y lo decide el humano.

Es la información que necesita cualquier decisión futura sobre la paleta: mientras la sala sea papel y el logo sea negro, cada cruce cuesta todo el contraste, y el piso de motas es la parte de la paleta que ningún acomodamiento alcanza.

---

## 15 · El instrumento por triplicado — D-B11.5, no unificado por decisión

`scripts-b6/` y `scripts-b8/` conviven con el mismo instrumento bajo dos prefijos (`b8-comun.ts` declaraba que las copias de B8 se borraban al mergear las ramas, y no se borraron), y B11 agrega `scripts-b11/`: `b-bloques.ts` reimplementa `c-las-ocho.ts` para sumar el 2560, el recorte de la pastilla y las cajas crudas por posición, importando de `scripts-b8/` la máscara de glifo, los lectores, el ocultamiento y la evaluación. El recorte de la pastilla —un defecto del instrumento de B8— está arreglado SÓLO en la copia de B11. Declarado con número en `deudas-b11.ts` (`instrumentoDuplicado`) y **no unificado acá**, por decisión de la PARADA 1: unificarlo es un banco de contraste con una sola máscara, un solo evaluador y el recorte adentro.

---

## 16 · Lo que queda abierto, con dueño

- **La escena (decide el humano):** el piso de motas (D-B11.1–4, incluidos los 5–21 px que quedaron bajo las dos tintas subidas a plena), el atardecer sobre la última cifra de Números (D-B8.1), la pared del diferencial (D-B5.1) y la entrada de Trabajos a pleno sol (D-B8.2, modelo).
- **Composición, no tomada acá:** el nivel del titular del diferencial (D-B8.3); el Cierre (D-B8.4).
- **Instrumento:** D-B11.5.
- **Revocable con número:** el montaje de 0,03 (−61 B si la foto vuelve a 4 de 5).
