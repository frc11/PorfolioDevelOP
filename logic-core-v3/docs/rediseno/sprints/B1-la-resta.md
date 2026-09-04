# B1 — La resta

Las ocho secciones a su contenido, el hero adaptado, y la pastilla sin colisiones. Medido contra nk.studio con los mismos instrumentos.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **El dev server tiene que estar corriendo** en otra terminal: `npm run dev`. Y **la ventana de Chrome al frente** durante toda la corrida.

## ⚠️ Lo que cambió: ahora tenés ojos

`chrome-devtools-mcp` está conectado. **Podés abrir la página, sacar capturas, medir píxeles renderizados y emular viewports.** Se usa así:

- **Para MEDIR:** anchos de columna, alturas de sección, contraste sobre el píxel real, aire muerto, posiciones. Todo lo que antes era un modelo estático ahora es medición.
- **Para COMPARAR:** la misma medición en nk.studio y en `/v3`, con la misma herramienta.
- **NO para JUZGAR.** Seguís sin poder decir "se ve bien". Eso lo decide el humano por grabación. **Lo que sí podés es darle capturas de antes y después para que juzgue más rápido.**

**La receta de captura a 1920×1080 en este equipo** —`Emulation.setDeviceMetricsOverride` + reload + verificar `visibilityState` antes de capturar— ya se encontró en el smoke test. **Escribila en `docs/rediseno/MEDICION-NAVEGADOR.md` como Fase 0.0, y usala siempre.** Con la pestaña oculta `rAF` no corre y medís una página que no existe.

⚠️ **Y la regla del build no cambió:** `CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`, chequeo de `node.exe` antes, nada al lado. Solo en la Fase 2.

---

## Por qué existe este bloque

Franco lo dejó escrito como condición de publicación y nunca se cumplió:

> *Se construye el layout completo y se resta después. **La resta tiene que ocurrir antes de publicar.** Un layout diseñado para densidad, vacío, rinde peor que el sitio actual.*

El humano grabó `/v3` y el veredicto fue: *"está a medias de construir"*. Y ahora está medido: Trabajos con media pantalla vacía debajo del titular, Servicios con 500 px de nada, Quiénes somos con dos párrafos y aire. **`secciones.ts` declara alturas en `svh` y el contenido no las llena.**

Más dos defectos que el smoke test encontró en el hero a 1920:

- **El H1 y la bajada entran debajo del logo negro.** "piloto" y "que es tu negocio" quedan ilegibles. **Contraste 1,00:1** — no es poco, es invisible.
- **La bajada es una sola línea de ~1.700 px.** En nk las columnas de texto son angostas.

---

# FASE 0 — El principal, sin subagentes

## 0.0 La receta de captura

Escribí `docs/rediseno/MEDICION-NAVEGADOR.md` con la receta canónica de este equipo: viewport emulado, reload, `visibilityState` verificado, y **dónde se guardan las capturas** (`docs/rediseno/capturas/<bloque>/<seccion>-<ancho>-<antes|despues>.png`). Todo lo que sigue la usa.

## 0.1 La comparación contra nk 🔴

**Medí lo mismo en `https://nk.studio` y en `/v3`, con la misma herramienta, a 1440 y 1920.** No explores nk: **medí estas cosas y nada más**:

| medición | en nk | en /v3 |
|---|---|---|
| Ancho de la columna de texto del hero, en px y como fracción del viewport | | |
| Tamaño renderizado del titular del hero, en px | | |
| Longitud de línea del párrafo del hero, en caracteres | | |
| Alto de cada sección del home, en pantallas | | |
| **Aire muerto por sección**: fracción de la sección sin contenido ni imagen | | |
| Distancia del titular al tope de su sección | | |
| Dónde termina el texto respecto de dónde empieza el objeto 3D | | |

**Producto: una tabla de deltas.** Es lo que los subagentes van a usar como vara. Sin esto, cada uno decide "cuánto aire" por gusto.

⚠️ **Se mide, no se copia.** Ni selectores, ni clases, ni valores de CSS. Los números sí, escritos por nosotros. Es la postura transformativa del proyecto y está en `PLAN-MAESTRO.md`.

⚠️ **nk es un sitio ajeno en producción.** Una navegación, una medición. No lo martilles.

## 0.2 El hero — es la sección de referencia y la hacés vos

Las decisiones ya están tomadas:

- **La bajada se acota a media columna.** Decidido por el humano. Que termine **antes de donde empieza el logo**: así se arreglan el ancho de línea y la colisión de una.
- **El titular con la tipografía grande.** El nivel ya existe; verificá que se use el correcto y que no lo pise nada.
- **Ningún píxel de texto sobre el logo.** Medilo sobre el píxel real: el contraste del texto contra lo que tiene detrás, en 1440, 1920 y 2560. **Techo: AA en el peor píxel.**
- ⚠️ **La pose del hero no se toca.** `frameX` ya se movió a 0,5 y está aprobado. Esto es layout.

**Captura de antes y después** en los tres anchos.

## 0.3 El contrato: `svh` pasa a mínimo

En `secciones.ts` y en el contrato, **el alto declarado deja de ser el alto y pasa a ser el mínimo.** Cada sección se dimensiona por su contenido y nunca queda más corta que su declaración.

⚠️ **Las secciones pinneadas son la excepción**: Servicios y Trabajos necesitan su alto para el recorrido del pin. **Ahí el alto se deriva del contenido de la secuencia**, no se declara a mano. Verificá que el pin siga funcionando **con scroll real en el navegador**, no con geometría.

**Reportá el alto de cada sección antes y después**, y el progreso de la escena en cada ancla — **que no se movió**, o cuánto y por qué.

## 0.4 Reglas para todo subagente

1. **Escribís SOLO en tus dos secciones.** Si necesitás algo de afuera, **reportalo.**
2. **Usás la tabla de deltas de 0.1 como vara.** No tu gusto.
3. **Medís sobre el píxel real**, con la receta de 0.0. Captura de antes y después, en 1440 y 1920.
4. **No cambiás contenido.** Los marcadores se quedan. Esto es composición.
5. **No tocás `secciones.ts`, `anclaje.ts`, el contrato ni el hero.**
6. **Cero valores fuera de los tokens.**
7. **Reportás:** aire muerto antes y después, alto antes y después, y las dos capturas.

---

# FASE 1 — Las otras siete, en cuatro subagentes

## Subagente A · Quiénes somos + Números

**Quiénes somos:** dos párrafos y aire. Con `svh` como mínimo se achica sola; verificá que **la composición en dos columnas se sostenga** con el alto nuevo y que `[FOTO DEL EQUIPO]` tenga su lugar.

**Números:** la composición dispersa —cinco cifras, cinco tamaños, sin grilla— **es la que más riesgo tiene al achicar.** Está medido que es lo que se rompe primero. Que la dispersión sobreviva al alto nuevo, y **que a 375 siga teniendo sentido**.

## Subagente B · Trabajos + Servicios

**Trabajos:** media pantalla vacía debajo del titular. Es pinneada, así que el alto sale de la secuencia. **Las tres tarjetas con sus capturas reales** tienen que llenar el recorrido del pin sin banda vacía — ni arriba de 1025 ni entre 768 y 1024, que fue el bug de S11.

**Servicios:** 500 px de nada debajo de la lista. Es pinneada y es **la sección más coreografiada del sitio de referencia**. El hueco del `[VIDEO]` es enorme y solo: **dale una proporción que no domine la sección hasta que haya video.** No inventes contenido para llenarla.

## Subagente C · Tu panel + Por qué develOP

**Tu panel:** el alto de 200svh que S6 pidió y S11 puso. Verificá que el contenido lo justifique o achicalo.

**Por qué develOP:** `papel-transparente`, con la escena detrás y el ancla en 0,8525. **El titular ya está limpio del logo** — verificalo sobre el píxel real, que hasta ahora fue geometría. Y que el alto nuevo **no mueva el ancla**: si se mueve, frená.

## Subagente D · Cierre + la pastilla

**Cierre:** `oscuro-opaco`, con el pie afuera desde S12. Que el titular de cierre y el CTA llenen su pantalla sin que el pie los empuje.

**La pastilla:** **tapa los titulares.** Medido en Trabajos ("nombre la") y en Servicios ("Software a medida"). Es constante donde el titular arranca arriba. **Dos salidas:** que la pastilla deje espacio, o que los titulares bajen. **Medí cuánto tapa en cada sección**, con el píxel real, y elegí con el número. ⚠️ **Arriba de 1025 su geometría está aprobada por grabación**: si la tocás, reportá exactamente qué cambió.

---

# FASE 2 — Integración

1. **`npm run verificar` en cero** y el build, una vez.
2. **`test:frontera`.**
3. **Las capturas de antes y después de las ocho**, a 1440 y 1920, en la carpeta de 0.0. **Es lo que el humano va a mirar primero.**
4. **La tabla de aire muerto**, antes y después, sección por sección, **contra nk**.
5. **El alto total del home** en pantallas, antes y después.
6. **Actualizá `DIRECCION-ESCENA.md`**: la condición de Franco pasa de "sin cumplir" a "cumplida", con los números.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — cualquier escritura de git en el árbol lo pasa a CRLF. Para leer `HEAD`: `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No toques ninguna pose de la escena**, ni el preloader, ni `_lib/escena/`, ni el contenido.
4. **No toques el home actual ni `/probe-escena`.**
5. **De nk.studio se MIDE, no se copia.** Ni un selector, ni una clase, ni un asset.
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío.**
9. **Regla 11:** toda cifra con su instrumento. Ahora el instrumento puede ser el navegador, **y la captura es la evidencia.**
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. **No auto-confirmás que se ve bien.** Podés decir "el aire muerto bajó de 61% a 12%". No podés decir "queda lindo".
12. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar`, el build, y `test:frontera`.
- (b) **La tabla de deltas contra nk**, de la Fase 0.1.
- (c) **Las dieciséis capturas** — ocho secciones, antes y después, a 1920. Con sus rutas.
- (d) **Aire muerto por sección**, antes y después, contra nk.
- (e) **El hero**: contraste del texto sobre el píxel real en los tres anchos, ancho de línea de la bajada, y que no toca el logo.
- (f) **La pastilla**: cuánto tapaba en cada sección, qué salida elegiste, y que arriba de 1025 no cambió — o qué cambió.
- (g) **Los pines de Trabajos y Servicios con scroll real.**
- (h) **El progreso de la escena en cada ancla**, que no se movió.
- (i) Archivos y `git status`.
- (j) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B1: la resta"` → `git push origin rediseno/home`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B1-la-resta.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. TRES FASES: la fase 0 la
  hacés vos solo —la receta de captura, la comparación contra nk, el hero y
  el contrato— y nada se despacha hasta que la tabla de deltas exista. La
  fase 1 son cuatro subagentes, dos secciones cada uno. La fase 2 la
  integrás vos.
- AHORA TENÉS OJOS: chrome-devtools-mcp está conectado. Lo usás para MEDIR
  sobre el píxel real y para COMPARAR contra nk.studio con la misma
  herramienta. NO para juzgar: seguís sin poder decir "se ve bien". Lo que
  sí hacés es dejar capturas de antes y después para que el humano juzgue.
- La receta de captura a 1920×1080 en este equipo (setDeviceMetricsOverride
  + reload + verificar visibilityState) va escrita en
  docs/rediseno/MEDICION-NAVEGADOR.md ANTES de cualquier medición, y se usa
  siempre. Con la pestaña oculta rAF no corre y medís una página que no
  existe.
- De nk.studio se MIDE, no se copia: ni un selector, ni una clase, ni un
  asset. Una navegación, una medición: es un sitio ajeno en producción.
- La bajada del hero se acota a MEDIA COLUMNA y termina antes de donde
  empieza el logo. Ningún píxel de texto sobre el logo: contraste medido
  sobre el píxel real, AA en el peor caso. La pose del hero NO se toca.
- svh pasa a MÍNIMO en el contrato: cada sección se dimensiona por su
  contenido. Las pinneadas derivan su alto de la secuencia, y el pin se
  verifica con SCROLL REAL en el navegador, no con geometría.
- Los subagentes no cambian contenido, no tocan secciones.ts, anclaje.ts,
  el contrato ni el hero. Usan la tabla de deltas como vara, no su gusto.
- El build va UNA vez, en la fase 2, con CIRCLE_NODE_TOTAL=2 y
  --max-old-space-size=6144, con el chequeo de §6.1 antes y nada al lado.
- NUNCA git stash, checkout, restore ni ninguna escritura de git en el
  árbol. Para leer HEAD, git show HEAD:<ruta>.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento — y ahora la captura es evidencia.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
