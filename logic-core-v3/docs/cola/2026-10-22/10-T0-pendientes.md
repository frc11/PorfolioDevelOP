# T0 · lo que queda de B12a.8 y B1.2e (2026-10-22)

**Dónde está todo:** rama `rediseno/home`, worktree `C:\rediseno-home\logic-core-v3`. Pusheado hasta `97c80a64`.
- `11f74c95` — B12a.8, lo verificado en el navegador (en el build).
- `97c80a64` — **WIP sin verificar**: el arranque de la píldora un cuadro después (ver T2).
- El log completo, con sus números y el FRENO, está en `docs/rediseno/SPRINT-B12a.md` (la sección «B12a.8»). La API, en `docs/rediseno/B12a-API.md` (§2, §3, §5 y la §7 nueva, «Cómo armar una página, paso a paso»).
- `lente.ts`, `dev*.log`, la carpeta de imágenes, `scripts-portfolio/fuentes/` y `../.gitignore` quedaron afuera a propósito. Nunca entran.

**Cómo se mide (lo mismo para todo lo de abajo):**
- **En el build:** `E2E_DIST_DIR=.next-b12 npx next build` (`.next-b12` está en `.gitignore`), después `E2E_DIST_DIR=.next-b12 npx next start -p 3004`, y los bancos con `BASE=http://localhost:3004`. El build lo autoriza el pedido («medido en el build»); avisarlo en el log.
- **Cada banco con el guardián de memoria:** `bash scripts-carga/con-memoria.sh npx tsx scripts-carga/<banco>.ts` (espera 3 GB libres).
- **Nunca** tocar el :3001 ni los procesos de servicios. El `next dev` del :3000 no es de la sesión: tampoco se toca.
- **La placa** cambia sola (la AMD integrada o la NVIDIA): cada banco del velo la imprime. Rotular cada número con la suya.
- **Un corte** deja vivos a los hijos del banco: buscarlos por línea de comando (`b4-medicion`, `scripts-carga`) y terminarlos con `taskkill /T`.

---

## Las elecciones pendientes de Valentino (banderas; se miran en `/v3/pagina-base`)

| Qué | Bandera | Por defecto (sin bandera) | Dónde se cambia el defecto |
|---|---|---|---|
| La familia del título | `?titulo=1…4` (y `/v3/titulos-de-pagina`, las cuatro lado a lado) | la 1, la del «6»: Archivo ancha 125 negra + ancha 125 fina | `TITULO_DE_PAGINA` en `_componentes/titulos3d/presets.ts` |
| La composición de la intro | `?composicion=1\|2\|3`: 1 título arriba del logo, 2 título a la derecha, 3 título a la izquierda | la 3 (como el hero) | `COMPOSICION_POR_DEFECTO` en `_lib/escena/ruta/composicion.ts` |
| La navbar en las páginas | `?navbar=abajo` (la del home, para comparar) | arriba: la píldora nace en el reposo del home y no se mueve con el scroll | `nacimientoDeLaPildora` en `_chrome/barra/BarraDelHome.tsx` |
| La legibilidad del título sin velo (T5) | `?legibilidad=peso` («web» en Archivo 125/400) o `?legibilidad=tamano` (el título al 80 % de la intro en la 1, desde 1024) | ninguna | `_componentes/titulos3d/legibilidad.ts` |

- **Para probar con los nombres reales:** `?nombre=1` «Páginas web», `2` «Software a medida», `3` «IA y automatizaciones» (`6` es el «6», «Prueba de la intro»).
- **Recomendación de la sesión:** `peso` (9 de 9 en AA; `tamano` 8 de 9).
- **Cuando elija:** dejar la elegida como defecto y borrar la bandera y el código de las opciones que no van (GUSTO: «una bandera sirve para calibrar con él y después se va»).

---

## B12a.8

### 1 · La intro de 2,5 pantallas — hecho y verificado
- **Commit:** `11f74c95`.
- **Falta:** nada.
- **Cómo se verifica:** `scripts-carga/intro-larga.ts` con `ANCHOS=1440x900,1024x768,390x844`: el avance da 0, 0,5 y 1 exactos; el título cae en 0,18, antes de que el bloque se suelte en 0,26, y no sube. Control `CONTROL=caida-tarde`: rojo desde 1024.
- **A ojo:** `/v3/pagina-base` a 1440, scrolleando despacio: título con bajada, «de qué se trata» sobre la escena, papel.

### 2 · El título (el «6» y las familias) — hecho y verificado; falta la elección (arriba)
- **Commit:** `11f74c95`.
- **Qué era el «6»:** `?nombre=6`, con la familia 1, que ya era la de por defecto.
- **Las familias:** cuatro distintas; la comparación, en `/v3/titulos-de-pagina`.
- **Falta:** que Valentino elija la familia.
- **Cómo se verifica:** `/v3/titulos-de-pagina` a 1440.

### 3 · La navbar — hecho y verificado
- **Commit:** `11f74c95`.
- **Falta:** nada.
- **Cómo se verifica:** `scripts-carga/barra.ts` (31 de 31). A ojo:
  - **1440:** «Home» primero. «Servicios» lleva al home en su sección. La lista abre con el hover quieto, con la flecha abajo sobre «Servicios» o con Enter en la flechita.
  - **390, el menú:** tocar «Servicios» navega; la flechita abre el acordeón.

### 4 · El velo sin pantalla en blanco — hecho y verificado; el tiempo hacia el home, a medias
- **Commit:** `11f74c95`.
- **Medido** (`scripts-carga/velo.ts`, `ANCHOS=1440,390`): 0 cuadros en blanco en los cuatro recorridos.
  - Del home a la página, 1,15–1,23 s.
  - A «Portfolio», 1,35–1,43 s.
  - A 390, 1,33–1,39 s.
  - **De la página al home, 1,66–1,73 s** (el objetivo era ≤ 1,2 s típico).
  - El control `CONTROL=sin-velo`: rojo.
- **Falta:** decidir cómo bajar el tiempo hacia el home. Hoy el velo destapa apenas el home está montado, con su scroll y dos cuadros pintados, y ese montaje (React y su primer render) tapa 550–650 ms. Las dos salidas, para que decida Valentino:
  - acortar la banda (hoy cubre en 460 ms y destapa en 560: `VELO` en `_chrome/velo/velo.ts`);
  - aligerar el montaje del home.
- **Cómo se verifica:** `velo.ts`; el resultado por recorrido está en `~/.cache/b4-medicion/velo/resultados.txt`.

### 5 · El velo contrastado — hecho y verificado
- **Commit:** `11f74c95`.
- **Medido:** el color esperado en los cuatro recorridos de `velo.ts` (sobre la escena el papel, sobre el papel la tinta).

### 6 · P-H32, el velo en el compositor — hecho y verificado en la NVIDIA; en la integrada no llega
- **Commit:** `11f74c95`.
- **El primer tramo al cubrir** (los primeros 200 ms), en el compositor (traza de `DrawFrame`):
  - en la NVIDIA, 13,5–14,4 ms (≤ 20 ✓);
  - en la AMD integrada, 21–47 ms sobre la escena. La escena sola, sin el velo, ya da un p95 de 21,5 ms y máximos de 22 a 38. Sobre el papel, 18–19 ms.
- **Falta:** nada en el velo. Si se quiere cumplir en la integrada, es el costo de la escena a 1440, otro tema.
- **Cómo se verifica:** `velo.ts`, que imprime la placa y la referencia de «la escena sola».

### 7 · La vuelta al home por entrada del historial — hecho y verificado
- **Commit:** `11f74c95`.
- **Medido:** `scripts-carga/vuelta-por-entrada.ts` con `ANCHO=1440` y con `ANCHO=390` (por el menú): Atrás, Atrás, Atrás, Adelante, Adelante: |Δy| 0. Control `CONTROL=una-sola`: rojo.
- **Falta:** nada.

### 8 · La página base, la API §7 y la skill — hecho; las secciones del cuerpo, sin verificar una por una
- **Commit:** `11f74c95`.
- **Lo que hay:** `/v3/pagina-base` (era `/v3/prueba-de-pagina`), la API §7 y `.claude/skills/pagina-home-based/` (`SKILL.md` y `CONTRATO.md`).
- **Lo verificado:** la intro, la navbar, el velo y la variante.
- **Falta:** mirar el cuerpo en el navegador, a 1440 y a 390:
  - el revelado progresivo (ejemplo 1);
  - el gatillo (ejemplo 2);
  - el CTA «Hablemos», que tiene que abrir el contacto con «Páginas web» marcado (`data-precarga="web"`), sin llamar a `/api/`;
  - el enlace «Volver al home», con el velo;
  - el lugar del pie.

### T1 · El título protagonista — hecho y verificado
- **Commit:** `11f74c95`.
- **Medido:** `scripts-carga/composicion.ts` con `NOMBRE=1`, `2` y `3` (45 casos en verde):
  - en una línea;
  - en la 1, 65–67 % del cuadro;
  - en las de costado, 91–92,5 % de su columna;
  - abajo de 1024, 92–93 % del ancho útil;
  - a la píldora, 47 px o más; al logo, 116 px o más.
- **Una corrida intermitente:** «IA y automatizaciones» a 1280 midió una vez con la página una pantalla más abajo (2 fallas). Repetida, 3 de 3.

### T2 · La navbar en las páginas — hecho y verificado; el arranque del deslizamiento, WIP sin verificar
- **Commits:** `11f74c95` (arriba y abajo, y el deslizamiento al destapar) y `97c80a64` (WIP).
- **Medido en `11f74c95`:**
  - la píldora nace arriba, en el reposo del home (Δ 0,00 px), y no se mueve con el scroll;
  - `?navbar=abajo` la deja como en el home;
  - al cambiar de ruta se desliza (el salto de 582 px que había se fue).
- **Queda:** las dos primeras muestras van rápido (7,4 y 5,7 px/ms; su curva da a lo sumo 2,6), y `velo.ts` lo marca FALLA en «la página → el home».
- **El WIP `97c80a64`:** arranca el deslizamiento un cuadro después del aviso `destapa`, con su hora real (`performance.now()`).
- **Falta:**
  1. reconstruir y correr `velo.ts` con `ANCHOS=1440`: en «la página → el home», «la más rápida» tiene que dar ≤ 3,96 px/ms;
  2. si pasa, decirlo en el log; si no, ver las muestras en `~/.cache/b4-medicion/velo/crudo-1440-la-p-gina-el-home-Home-.json`.

### T3 · La auto-revisión — a medias
- **Commit:** `11f74c95`.
- **Hecho:** la lista de lo encontrado y arreglado está en el log (§T3): el papel de la carga, la espera de las obras del home, el foco de la lista, `useRouter` fuera del router, el título plano, el título que se salía y pisaba la bajada, la caída que subía, el salto de la píldora y el tono del velo.
- **El sonido cortado a ~1070:** no se reprodujo (0 cortes en 29 anchos de 360 a 1920, en las tres composiciones y en el home).
- **Falta:**
  1. **Abajo de 1024, el cartel del sonido pisa el título de la intro**, en las tres composiciones, de 360 a 1023: aparece después de tocar el parlante. Lo encontró `scripts-carga/chrome-en-los-anchos.ts` con `RUTAS=/v3/pagina-base?composicion=1,/v3/pagina-base?composicion=2,/v3/pagina-base?composicion=3,/v3`; las fotos están en `~/.cache/b4-medicion/chrome/`. Arreglarlo (el cartel o el aire arriba del título) y volver a correr el barrido: 0 anchos con falla.
  2. **La consola** (del mismo barrido):
     - 12 × «Failed to load resource: 404»: averiguar qué recurso es (en la pestaña de red, o con `p.on('response')` en el banco);
     - 2 × `pageerror` «Cannot read properties of undefined (reading 'isReady')»: encontrar quién lo tira;
     - el aviso de WebGL «Feedback loop formed between Framebuffer and active Texture», desde 1024 y también en el home: viene de antes de B12a.8 (P-H nuevo);
     - 1 aviso de compilación X4122 (la precisión de una suma en un sombreador).
     - Ningún «NaN».
  3. **La pasada visual contra `GUSTO.md`:** se hizo con las capturas de cada banco. Pendiente de opinión de Valentino: con el mouse en un extremo, el título de las composiciones 2 y 3 se inclina mucho. Es la reacción de los títulos del home; GUSTO dice «la cámara calma».
  4. **Las matrices del home** (que nada del home se rompió): `scripts-carga/matriz.ts` (escritorio, el Portfolio) e `historias.ts` (`ANCHOS=390x844,768x1024,820x1180,1023x768`) contra el build. No corrieron.
  5. **`npm run verificar`** (la bisagra, ~10 min): comparar la LISTA de fallas con la base (s1, s2, s3, s4, s5, s7, s8 y s17). No corrió. Las que sí corrieron, en verde: s78 (160 de 0), s51, s3-tokens, s40, s42, s44, s47, s48, s49, s54 a s59, s62, s74, s75, s76; `tsc` 0.
  6. **Un error de lint que ya estaba:** `_lib/escena/titulos3d/SombraDeLosTitulos.tsx:93` («This value cannot be modified»), un archivo que B12a.8 no tocó. `VeloDeCarga.tsx:76` ya tenía su `set-state-in-effect` antes.

### T4 · El título en 3D, como los del home — hecho y verificado
- **Commit:** `11f74c95`.
- **Medido:** `scripts-carga/titulo-3d.ts`, 15 de 15 (3 composiciones × 1440, 1280, 1024, 768 y 390):
  - desde 1024, el 3D montado, el `h1` oculto y accesible, la entrada y la salida;
  - con el mouse de un lado al otro, la caja se corre 117–217 px; en los extremos, dentro del cuadro, debajo de la píldora y con la bajada en su plano;
  - abajo de 1024, el `h1` del DOM (la regla del home).
- **El control:** `CONTROL=pegado-al-h1`, rojo (0,0 px).

### T5 · Sin el velo negro — hecho y verificado; falta la elección (arriba)
- **Commit:** `11f74c95`.
- **Medido:** `scripts-carga/contraste-de-la-intro.ts` (con `COMPOSICION=1`, `2` y `3`; `ANCHOS=1440x900,1280x800,1024x768,768x1024,390x844`): 74 de 75.
  - El DOM, al 100 %.
  - **No llega:** «web» a 1280 en la 1, 94,1–94,6 % (el cuerpo de la letra, 98 %).
  - Con `LEGIBILIDAD=peso`, 9 de 9 en la 1; con `LEGIBILIDAD=tamano`, 8 de 9 (a 1024, 92,6 %).
  - Control `CONTROL=sin-sombra`: rojo.
- **Falta:** la elección de Valentino (`?legibilidad=`).

### P-H33 — hecho y verificado
- **Commit:** `11f74c95`.
- Es el mismo trabajo de T5 (sin velo; con la sombra pegada a las letras): mismos números y misma elección pendiente.

### P-H35 · el bfcache — hecho y verificado
- **Commit:** `11f74c95`.
- **Medido:** `scripts-carga/bfcache.ts` contra el build, con el bfcache prendido: la variante vuelve a su avance y el velo queda quieto. Control `CONTROL=sin-bfcache`: rojo.
- **Falta:** nada.

### La composición de la intro — hecho y verificado; falta la elección (arriba)
- **Commit:** `11f74c95`.
- **Medido:** `composicion.ts`: el logo a ≤ 0,5 % de su hueco y el eje en 0,00 %.
- **Las de costado** dejan 8 vw de aire del lado de afuera (por la perspectiva de T4).
- **Abajo de 1024,** las tres son la 1.

---

## B1.2e · el Portfolio en el teléfono y la tablet (< 1024, incluido 768) — no empezado

**Commit:** ninguno. **Falta todo.** Es el pedido de servicios, al pie de la letra:
1. **Las historias salen del Portfolio** abajo de 1024. El componente común `_componentes/historias/` queda: lo usa el precio de servicios.
2. **Sin trampa de scroll:** primero el título «Portfolio» y después un CARRUSEL que no ocupa toda la pantalla.
3. **Cada tarjeta:** el video del proyecto y TODA la información de antes. Si no entra, se acortan los textos y se avisa en el reporte. Nada de contenido inventado.
4. **La rotación:**
   - infinita, cada 10 s, con una línea que se llena;
   - mantener apretado la pausa;
   - flechas de anterior y siguiente, y deslizar de costado;
   - se pausa fuera de la vista y con movimiento reducido;
   - el reloj vuelve a empezar en cada cambio.
5. **Debajo,** el CTA «la tuya» como bloque propio (el formulario que ya existe) y después Demos.
6. **La matriz,** a 390, 768, 820 × 1180 y 1023 × 768:
   - entrar y salir scrolleando en los dos sentidos;
   - las flechas, los deslices y mantener apretado;
   - la vuelta infinita en los dos sentidos;
   - la pausa fuera de la vista;
   - el CTA.
   - El escritorio intacto: su matriz entera (`scripts-carga/matriz.ts`).
7. **El cierre:** su commit propio, con su lista de qué mirar.

**Antes de empezar:**
- leer `docs/rediseno/SPRINT-B1-PORTFOLIO.md` y los invariantes s76, que fijan las historias del Portfolio y habrá que reemplazar por la spec, con su control;
- leer `scripts-carga/historias.ts` y `historias-cuenta.ts`, la matriz de hoy en el teléfono.
