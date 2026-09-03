# V3-E — Los rojos del merge, y el hero como tiene que verse

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**, con los cuatro lanes ya mergeados.
- **UNA PARADA 🛑**, al cerrar.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **El build va UNA sola vez, en la Fase 2, y en segundo plano:**

```powershell
$env:CIRCLE_NODE_TOTAL=2
$env:NODE_OPTIONS="--max-old-space-size=6144"
```

Con el chequeo de `node.exe` y memoria comprometida de §6.1 antes. **Y nada más corriendo al lado.**

⚠️ **Nunca `git stash`, ni `checkout`, ni `restore`, ni ninguna escritura de git en el árbol** — con `core.autocrlf` lo pasa a CRLF y pone instrumentos en rojo sin que una línea cambie. Para leer `HEAD`: `git show HEAD:<ruta>`.

---

## Dónde estamos

Cuatro lanes en paralelo cerraron y se mergearon: el preloader que entrega la escena, la escena que se mueve desde el primer scroll, la tipografía que crece arriba de 1440, y el contenido real de los tres trabajos.

**`npm run verificar` da 23 pasos con 5 en falla.** Las seis fallas son consecuencias conocidas del merge y ninguna es una regresión sorpresa.

Este sprint las cierra, y hace **las tres cosas visibles que ningún lane pudo hacer** porque cada una estaba prohibida en su prompt.

---

# FASE 0 — Los seis rojos (el agente principal, sin subagentes)

**Son mecánicos y tocan superficie compartida. Van primero y los hacés vos.**

### 1 · `s9e-recorrido` — 4 fallas

Consecuencia directa de sacar el keyframe `hero · sostén`. El invariante afirma **ocho entradas**, que `hero · sostén` es copia exacta de `hero`, que cada tramo termina en su pose, y que **la cámara no se mueve en toda la pantalla del hero**.

⚠️ **Las cuatro afirmaciones ahora son falsas y las cuatro describían la decisión vieja.** No las aflojes: **reescribilas contra la propiedad nueva** — siete keyframes, un solo sostén, y la cámara **sí** se mueve desde el primer píxel. Es la regla 15.

**Reportá la velocidad máxima del arranque** — hoy 2,8e+1 alturas de cuadro por unidad de progreso — y **si esa cifra merece un techo declarado.**

### 2 · `s7e-variantes` — la nota huérfana

`choreographyNotes.ts` conserva una nota para un keyframe que ya no existe. **El arreglo está escrito: borrar el bloque `'hero · sostén'`.**

Y con él, **`CHOREO_ARRAY_DOC` quedó desincronizado**: sus líneas fuente siguen diciendo "ocho capturados" y "dos son sostenes". Pegá ahí el texto que ya quedó bien en `choreography.ts`.

### 3 · `s9-instrumentos` — el censo

34→38 archivos, 80→93 etiquetas, 27→31. **Su propio docblock dice que el frente que mueve el censo no lo toca y que lo remide el agente de integración.** Ese sos vos ahora: remedilo.

⚠️ **Que se derive, no que se fije.** Es la regla 14, y una cardinalidad escrita a mano ya se rompió tres veces en este proyecto.

### 4 · `s5-codigo` — las tres capturas

Las tres imágenes que agregó el lane de contenido no están en el padrón de S5. **Registralas.**

⚠️ **Y una decisión que quiero declarada:** quedaron en `src/app/v3/_secciones/trabajos/` y no en `public/`. En Next eso es válido y mejor —se importan como módulo, con hash y con dimensiones en tiempo de compilación— **pero tiene que ser deliberado.** Verificá que el componente de imagen las esté consumiendo así y **reportá el peso servido de cada una.**

### 5 · `s7-pedido` — el documento viejo

`CONTENIDO-PENDIENTE.md` se desincronizó del generador con el merge. **Regeneralo con su instrumento**, no a mano.

### 6 · `s7e-export-sprites` — la trampa de CRLF

**Preexistente**, no del merge: `bloqueDelArchivo` busca un texto con `\n` y el árbol es CRLF, así que compara contra 0 bytes. Su control positivo tampoco lo discrimina.

**Arreglalo normalizando el fin de línea antes de comparar**, como ya se hizo en `s10-logo` §6, y **con un control que exija encontrarlo con los dos finales de línea.**

---

# FASE 1 — Los tres frentes visibles

## Subagente A · El encuadre del logo 🔴

> *"No se ve toda la escena con el logo."*

En el Hero el logo entra por la derecha y **queda cortado.** El lane de la escena no lo pudo tocar: `frameX: 0.68` es un valor de pose y las poses estaban prohibidas.

**Acá tenés permiso explícito para tocar `frameX` de la pose del hero. Solo ése.**

- **Medí qué fracción del logo queda dentro del cuadro** en 1440, 1920 y 2560, antes y después. El humano mira en 1920.
- **Que entre entero en los tres**, o que lo que quede afuera sea una decisión declarada con su número.
- ⚠️ **Esto mueve dónde aterriza el logo del preloader.** `scene-framing.ts` lee `CHOREO_KEYFRAMES[0]`, así que cambiar `frameX` del hero **mueve el destino**. El relevo se acaba de arreglar y aterriza con el centro coincidiendo al bit. **Medí cuánto se movió y verificá que siga coincidiendo**, con `test:s8-relevo` y `test:s15e-*`.
- ⚠️ **Y verificá el contraste de la tinta del Hero sobre la escena** con el encuadre nuevo. Mover el logo mueve dónde cae sobre el texto, y sobre el logo el contraste es 1,00:1 por construcción.
- **Ninguna otra pose se toca.** Ni distancia, ni altura, ni `frameY`, ni las otras seis.

## Subagente B · La cap height de Chivo 🔴

> *"El texto se ve muy chico a comparación de la página que quiero imitar."*

El lane de tipografía extendió la banda hasta 1920, **y refutó la premisa**: la referencia topa en 1440 igual que nosotros, medido sobre 24 volcados. Así que queda **una sola causa medida**: **la cap height de Chivo es 4,72% más chica** que la de Instrument Sans. A igual tamaño en píxeles, en Title Case la mayúscula domina el tamaño percibido.

**Y hay un argumento nuevo que cambia el estatus de los anclajes:** los valores de 375 y 1440 se transfirieron midiendo **Instrument Sans**. Igualar el píxel con Chivo **no iguala el tamaño óptico**. Compensar puede ser **más fiel a la referencia, no menos.**

⚠️ **Pero hay una tensión que no se puede resolver de los dos lados a la vez:** la **x-height de Chivo coincide** (factor 0,998, adentro de la banda 0,98–1,02) y la **cap height no**. Compensar la cap desajusta la x, y al revés.

**Lo que hay que hacer:**

- **Medí las dos compensaciones** y qué le pasa a cada nivel con cada una.
- **Proponé, y el criterio es dónde manda cada métrica:** el cuerpo de texto es mayormente minúscula y ahí manda la x-height; los niveles de display van en Title Case y ahí manda la cap. **Compensar solo los de display es defendible** — y es exactamente donde el tema ya dice que se vería.
- ⚠️ **Eso rompe la razón geométrica de la escala.** Verificá que los ocho niveles sigan separados en 375, 1440, 1920 y 2560, y **que ningún par colisione.**
- ⚠️ **Si compensar mueve un valor de 375 o de 1440, decilo con el número antes de aplicarlo.** Eran innegociables por una razón, y el argumento nuevo la debilita pero no la borra. **Si el cambio es grande, frená y reportá.**

## Subagente C · El ancla del diferencial 🔴

El lane de la escena midió que **la ventana existe** —p entre 0,8232 y 0,8782, donde el titular queda limpio en los cuatro cuadros y el fondo pasa AA— **y que es inalcanzable**: enumeró las 28 particiones posibles y el ancla está cuantizada a exactamente **0,7500 y 0,9167**. Uno queda 0,073 corto, el otro se pasa 0,038.

**La salida elegida: que el ancla del diferencial deje de estar cuantizada a un límite de tramo y pase a ser un valor declarado.**

- **Es un cambio al modelo de anclaje**, en `anclaje.ts`. **No toca ninguna pose ni `secciones.ts`.**
- ⚠️ **El progreso tiene que seguir siendo monótono y exactamente reversible.** Es lo que los nueve patrones de motion asumen y romperlo los rompe a todos.
- **Verificá que el progreso de las otras siete secciones no se mueva.**
- **Confirmá con `test:s10-logo`** que la superposición del titular cae a 0 en los cuatro cuadros, y con `test:s8-tinta` que el contraste sigue pasando AA.
- **Si al descuantizar aparece otra restricción que lo impide, frená y reportá** con el número.

---

## Reglas para todo subagente

1. **Escribís SOLO en tu zona.** Si necesitás algo de afuera, **reportalo.**
2. **Los rojos de la Fase 0 ya están cerrados: no los toques.** Si tu cambio abre uno nuevo, **es un hallazgo y va reportado.**
3. **Cero valores fuera de los tokens. Tu invariante propio con controles positivos.**
4. **NO corras `npm run build`.** Lo corre el agente principal en la Fase 2.

---

# FASE 2 — Integración

1. **`npm run verificar` en cero.** Los seis rojos cerrados y ninguno nuevo.
2. **El build, una sola vez**, con las dos variables y la máquina libre.
3. **`npm run test:frontera`**, que va antes del commit y no entra en `verificar`.
4. **La tabla de antes y después**: los seis rojos, y los tres frentes con su número.
5. **Actualizá `DIRECCION-ESCENA.md`.**

---

## Reglas absolutas

1. **Rama `rediseno/home`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **Solo se toca `frameX` de la pose del hero.** Ninguna otra pose, ningún otro valor.
4. **No toques `secciones.ts` ni el contenido.** Los marcadores que quedan se quedan.
5. **No toques el home actual ni `src/lib/scene-camera.ts`.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.**
8. **Ninguna afirmación se afloja para que pase.** Si una describe una decisión que cambió, **se reescribe contra la propiedad nueva** — regla 15.
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
10. **Regla 11:** toda cifra con su instrumento. **14:** los agregados se derivan.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No auto-confirmás que se ve bien.**
13. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` **en cero**, el build, y `test:frontera`.
- (b) **Los seis rojos**, uno por uno, con qué los cerró.
- (c) **El encuadre**: fracción del logo dentro del cuadro en 1440, 1920 y 2560, antes y después. **Y cuánto se movió el destino del preloader**, con el relevo verificado.
- (d) **La cap height**: las dos compensaciones medidas, cuál elegiste, qué le pasa a 375 y 1440, y la separación de los ocho niveles en los cuatro anchos.
- (e) **El ancla del diferencial**: la superposición en 0, el contraste, y que las otras siete no se movieron.
- (f) **El peso** de `/v3`.
- (g) Archivos y `git status`.
- (h) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "V3-E: los rojos del merge y el hero"` → `git push origin rediseno/home`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/V3-E-hero.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home, con los cuatro lanes ya
  mergeados. TRES FASES: la fase 0 la hacés vos solo —los seis rojos del
  merge, que tocan superficie compartida— y nada se despacha hasta que
  estén cerrados. La fase 1 son tres subagentes. La fase 2 la integrás vos.
- El BUILD va UNA sola vez, en la fase 2, en segundo plano, con
  CIRCLE_NODE_TOTAL=2 y --max-old-space-size=6144, con el chequeo de §6.1
  antes y nada corriendo al lado. Los subagentes NO corren build.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Tenés permiso explícito para tocar frameX de la pose del HERO. SOLO ése.
  Ninguna otra pose, ningún otro valor. Y ojo: eso mueve dónde aterriza el
  logo del preloader, que se acaba de arreglar y aterriza al bit. Medí
  cuánto se movió y verificá que siga coincidiendo.
- La premisa de que la referencia no topa en 1440 está REFUTADA y medida.
  La única causa que queda es la cap height de Chivo, 4,72% más chica. La
  x-height SÍ coincide, así que compensar una desajusta la otra: medí las
  dos y proponé. Si compensar mueve un valor de 375 o de 1440, decilo con el
  número ANTES de aplicarlo, y si el cambio es grande FRENÁ Y REPORTÁ.
- El ancla del diferencial se DESCUANTIZA: deja de estar atada a un límite
  de tramo. No toca poses ni secciones.ts. El progreso tiene que seguir
  siendo monótono y exactamente reversible: los nueve patrones lo asumen.
- Ninguna afirmación se afloja. Las cuatro de s9e-recorrido describen la
  decisión VIEJA: se reescriben contra la propiedad nueva, no se borran.
- Ninguna comprobación verde por vacío. El censo de s9-instrumentos se
  DERIVA, no se fija: una cardinalidad a mano ya se rompió tres veces acá.
- NUNCA git stash, checkout, restore ni ninguna escritura de git en el
  árbol: con core.autocrlf lo pasa a CRLF. Para leer HEAD, git show HEAD:<ruta>.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
