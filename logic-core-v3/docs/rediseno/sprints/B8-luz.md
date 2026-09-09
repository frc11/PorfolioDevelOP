# B8 — La luz manda

Se saca el velo, el sol hace el trabajo, y Trabajos se convierte en lo que tiene que ser.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo: Fable 5.1.** **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** El bloque entero es **una sola decisión de iluminación y su consecuencia**. Tres subagentes iluminarían la sala de tres formas.
- **Worktree:** `C:\v3-luz`, rama **`v3/luz`**. Sesión en `C:\v3-luz\logic-core-v3`.
- **DOS PARADAS 🛑.**
- **Dev server en el 3001**, Chrome **al frente**. Receta en `docs/rediseno/MEDICION-NAVEGADOR.md`.
- **El build en primer plano**, `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`, con el chequeo de procesos **por ruta de worktree**.
- ⚠️ **El búfer de WebGL no se lee desde la página.** Toda medición de la escena va por `Page.captureScreenshot`.
- ⚠️ **Nunca `git stash`, `checkout`, `restore` ni ninguna escritura de git en el árbol.** Para leer `HEAD`: `git show HEAD:<ruta>`.

---

# El diagnóstico, y es un error de concepción del bloque anterior

B6-A construyó una superficie `oscuro-transparente`: **un velo oscuro sobre la escena.** El humano lo grabó y el veredicto fue que Trabajos *"no se parece en NADA"* y que el pie *"sigue con el fondo oscuro"*.

**Los dos tienen la misma causa y es de diseño, no de ejecución:**

> **Un velo oscuro sobre una sala de papel blanco da GRIS. Nunca da negro.**

La escena en Trabajos es **una sala blanca con el sol alto**. Ningún velo la vuelve la noche de la referencia — la lava y la deja gris.

**Y en el pie pasa lo contrario.** Ahí el sol ya se puso —el arco en 0,34 por decisión de S11— así que la sala está en penumbra, el velo encima, y queda negro. **Técnicamente abierto, visualmente idéntico a cerrado.**

## La corrección

**La oscuridad no la da un velo: la da la luz.**

S11 ató el nivel de iluminación a la elevación del sol con `level = sin(elevación)/sin(36°)`. **Esa es la palanca real**, y usarla es lo que hace que el fondo oscuro salga de la física del mundo en vez de un vidrio ahumado encima.

## Y el orden, que lo fijó el humano

> *"Para algo quise hacer una coreografía, para luego acomodar la información. La información va acomodada a la coreografía. En el hero está bien acomodado, falta el resto. Primero saquemos el velo y vemos cómo va quedando, y luego acomodemos la info."*

**Este bloque hace la primera mitad.** El acomodamiento del contenido es el bloque siguiente, y es deliberado que vaya después: **no se puede acomodar texto contra una luz que todavía no está decidida.**

---

# §1 · Se saca el velo

**La superficie `oscuro-transparente` con su gradiente se elimina.** Fue una respuesta al problema equivocado.

**Las secciones que ven la escena:**

| # | sección | superficie |
|---|---|---|
| 1 | Hero | ve la escena |
| 2 | Quiénes somos | **ve la escena** |
| 3 | Números | **ve la escena** |
| 4 | Trabajos | **ve la escena** |
| 5 | Servicios | **opaca** — acá cambia el fondo, por pedido |
| 6 | Tu panel | **opaca** |
| 7 | Por qué develOP | ve la escena |
| 8 | Cierre + pie | **ve la escena** |

## ⚠️ Esto rompe el contraste a propósito, y hay que manejarlo bien

Está medido lo que va a pasar: **Quiénes somos falla en 12 de 17 bloques y Números en 12 de 13**, con el peor en **1,00:1** — el texto encima del logo. Y el diferencial ya falla hoy en 6 de 7.

**Ese estado es intermedio y deliberado**, para que el humano vea la coreografía y decida dónde va el contenido. **Pero:**

1. **NINGUNA afirmación de contraste se afloja ni se borra.** Las que fallen **pasan a deuda declarada con su número y su fecha de cierre — el bloque siguiente.** Es la diferencia entre saber que algo está roto y esconderlo.
2. **El agregado publica la lista completa de lo que falla**, sección por sección y bloque por bloque. **Esa lista es el insumo del bloque siguiente**: le dice exactamente qué texto hay que mover y a dónde.
3. ⚠️ **De esta rama no se publica nada.** Es una etapa de trabajo.

---

# §2 · El arco del sol 🔴

**Es el corazón del bloque y donde el modelo tiene que trabajar.**

## 2.1 Lo que cada sección necesita

**Medí primero, y contra la referencia:**

| sección | qué tiene que pasar ahí | qué luz pide |
|---|---|---|
| Hero | la sala se lee, el logo entrega el preloader | **clara** — hoy funciona |
| Quiénes somos | texto sobre la sala | clara |
| Números | cifras sobre la sala | clara |
| **Trabajos** | **los proyectos vienen del fondo profundo, con las partículas brillando** | **oscura** |
| Por qué develOP | el diferencial, el momento más íntimo | media |
| **Cierre + pie** | **la sala se ve detrás del pie** | **suficiente para verse** |

⚠️ **Y hay una consecuencia narrativa que el humano ya aceptó:** hoy el arco es **una tarde monótona** — la luz baja de principio a fin. Para oscurecer Trabajos y volver a tener luz en el cierre, **el arco deja de ser monótono.**

**Diseñá esa curva.** No es un interruptor por sección: es una luz que atraviesa el recorrido y que tiene que **contar algo**. Escribí qué cuenta.

## 2.2 Lo que no se rompe

- ⚠️ **`level = sin(elevación)/sin(36°)` es la relación medida** entre elevación y nivel. Si la cambiás, **decilo con la razón** — S11 la derivó de la geometría.
- ⚠️ **La celosía proyecta sobre el piso y el logo**, y su penumbra depende del tamaño angular del sol. Con el sol bajo, **la penumbra se ensancha y las bandas se alargan.** Verificá que no se lave.
- ⚠️ **El moiré del piso** vive de la interferencia entre dos tramas de borde definido. **Con poca luz puede desaparecer.** Medilo.
- ⚠️ **El sol es visible en cuadro en algunos tramos** y se lee porque borra la trama. Verificá que siga leyéndose.
- **La coreografía de cámara, el anclaje y el progreso no se tocan.** Este bloque cambia **la luz**, no el recorrido.

## 2.3 Contra la referencia

**Se mide, no se copia. Una navegación, una medición.**

| medición | por qué |
|---|---|
| **La luminancia media de su sección de proyectos** | Es el "oscuro" que hay que alcanzar |
| **La luminancia de su hero** y de sus secciones claras | El rango completo de su recorrido |
| **El contraste de su texto** sobre cada una | Qué se puede escribir sobre qué |
| **Sus partículas sobre el fondo oscuro**: tamaño, densidad, brillo | Para el §3 |

---

# §3 · Trabajos, el efecto de verdad 🔴

El humano fue explícito:

> *"Debería hacer como el efecto de Star Wars con las imágenes en el medio, usando 2 imágenes como hacen en nk, y que vengan bien desde el fondo, con el fondo oscuro y partículas fluorescentes en la zona, tal cual nk."*

## 3.1 Medí cómo lo hace la referencia

- **Cuántas piezas trae cada proyecto** y con qué disposición — el nombre en tipografía grande, la imagen, y qué más.
- **Desde qué profundidad vienen** y cuánto tardan.
- **Cuántos proyectos hay en cuadro a la vez.**
- **Qué hace el fondo mientras**: si las partículas se mueven, si hay paralaje, si la cámara acompaña.

## 3.2 Construilo, con lo que ya existe

- **P7 ya está y ya mira con el lente de la escena**: B6-A midió que con ese lente los −3000 px caen a **63,6 unidades**, adentro de la pared del fondo que va de 58 a 64. **Eso está bien y no se rompe.**
- ⚠️ **La meseta de B4-A no se rompe:** cada proyecto llega, **se queda**, y sale, y **nunca los tres invisibles a la vez.** Su comprobación barre el pin entero.
- **Las tres capturas reales están en el repo** — Esquina, El Garage y Banú. Se usan.
- ⚠️ **Y el techo de velocidad de B2 (4,6531) sigue en pie.**

## 3.3 Las partículas ⚠️

**Las de la referencia son verdes porque su mundo es verde. El nuestro es blanco y negro, y eso es decisión cerrada desde el primer día.**

**Lo que sí se puede: que brillen.** Partículas emisivas sobre el fondo oscuro, **en blanco**. Es el mismo efecto sin el primer color del sitio.

- **Las partículas ya existen** en dos escalas, con su bokeh. **Sobre fondo oscuro se leen al revés que sobre papel**: medí qué les pasa y ajustá su emisión, no su color.
- **Y el conteo**: si la sección pide más densidad ahí, **que salga del campo que ya existe**, no de un sistema nuevo.

---

## Reglas absolutas

1. **Rama `v3/luz`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. **NO toques el contenido ni la composición de ninguna sección.** Ése es el bloque siguiente, y el humano fijó ese orden. **Si te tienta mover un texto porque no se lee, ANOTALO en la lista de la §1 — es exactamente lo que esa lista tiene que producir.**
3. **NO toques la coreografía de cámara, ni `anclaje.ts`, ni `recorrido.ts`, ni el progreso.**
4. **NO toques el preloader, el home actual, `/probe-escena`, `scene-camera.ts` ni los frozen** (`3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`).
5. **Cero color.** Blanco y negro, sin excepción.
6. **De la referencia se MIDE, no se copia:** ni un shader, ni un selector, ni un asset. Una navegación, una medición.
7. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
8. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
9. **Ninguna afirmación se afloja.** Las de contraste que fallen **pasan a deuda declarada con su número y su cierre en el bloque siguiente.**
10. **Ninguna comprobación verde por vacío, ni verde por arnés.**
11. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado. **15:** se afirma la propiedad, no el literal.
12. **PowerShell:** no hay `&&`, no hay heredoc.
13. **No auto-confirmás que se ve bien.** Podés decir *"la luminancia media de Trabajos pasó de 214 a 31"*. **No podés decir "ahora sí se parece": eso lo juzga el humano grabando, y es el gate real.**
14. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
15. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto.

## 🛑 PARADA 1 — antes de construir

- (a) **La medición contra la referencia**: la luminancia de su sección de proyectos, de su hero, y el contraste de su texto sobre cada una.
- (b) **La curva de luz que proponés**, sección por sección, **con qué cuenta.**
- (c) **Qué le pasa a la celosía, a la penumbra, al moiré y al sol visible** con esa curva.
- (d) **Qué medís de su efecto de proyectos** y cómo pensás construirlo con P7 y la meseta que ya existen.
- (e) **La lista de lo que va a fallar de contraste** al sacar el velo, sección por sección.

Esperá el OK.

## 🛑 PARADA 2 — al cerrar

- (a) `verificar`, build en primer plano, y `frontera`. ⚠️ **Con las afirmaciones de contraste en deuda declarada, no aflojadas.**
- (b) **La luminancia de cada sección**, antes y después, con capturas.
- (c) **Trabajos**: cómo entran los proyectos, desde qué profundidad, con la meseta todavía verde y el techo de B2 en pie.
- (d) **Las partículas** sobre el fondo oscuro.
- (e) **La lista completa de lo que falla de contraste** — el insumo del bloque siguiente.
- (f) **Que la coreografía, el anclaje y el progreso no se movieron un bit.**
- (g) **FPS** contra la línea de base, y **`prefers-reduced-motion`** sin arnés.
- (h) Capturas, archivos y `git status`.
- (i) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B8: la luz manda"` → `git push -u origin v3/luz`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B8-luz.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-luz, rama v3/luz. Dev server en el 3001, Chrome al frente.
- NO uses subagentes: el bloque es UNA decisión de iluminación y su
  consecuencia, y tres subagentes iluminarían la sala de tres formas.
- EL DIAGNÓSTICO: un velo oscuro sobre una sala de papel blanco da GRIS,
  nunca negro. La superficie oscuro-transparente que construyó el bloque
  anterior fue una respuesta al problema equivocado y SE ELIMINA. La
  oscuridad la da LA LUZ: level = sin(elevación)/sin(36°) es la palanca.
- El arco hoy es una tarde monótona. Para oscurecer Trabajos y tener luz en
  el cierre, DEJA DE SER MONÓTONO, y eso ya está aceptado. Diseñá esa curva
  y escribí qué cuenta.
- SE SACA EL VELO y las secciones 1,2,3,4,7,8 ven la escena. Servicios y Tu
  panel se quedan opacas por pedido.
- ⚠️ ESTO ROMPE EL CONTRASTE A PROPÓSITO: Quiénes somos falla en 12 de 17 y
  Números en 12 de 13, con el peor en 1,00:1. Es un estado INTERMEDIO y
  deliberado para que el humano vea la coreografía. NINGUNA afirmación se
  afloja ni se borra: las que fallen pasan a DEUDA DECLARADA con su número
  y su cierre en el bloque siguiente. Y el agregado publica la lista
  completa de lo que falla, que es el insumo de ese bloque.
- NO toques el contenido ni la composición de ninguna sección. El humano
  fijó el orden: primero la luz, después la información. Si te tienta mover
  un texto porque no se lee, ANOTALO en la lista.
- NO toques la coreografía de cámara, ni anclaje.ts, ni recorrido.ts, ni el
  progreso, ni el preloader, ni /probe-escena, ni los frozen.
- P7 ya mira con el lente de la escena y los −3000 px caen a 63,6 unidades,
  adentro de la pared del fondo: eso está bien y no se rompe. La meseta
  tampoco: cada proyecto llega, se queda y sale, y nunca los tres
  invisibles a la vez.
- LAS PARTÍCULAS NO LLEVAN COLOR. Las de la referencia son verdes porque su
  mundo es verde; el nuestro es blanco y negro y es decisión cerrada. Lo
  que se puede es que BRILLEN: emisivas sobre fondo oscuro, en blanco.
- Verificá que con el sol bajo no se laven la celosía, la penumbra, el
  moiré ni el sol visible en cuadro.
- De la referencia se MIDE, no se copia. Una navegación, una medición.
- El búfer de WebGL no se lee desde la página: todo por captureScreenshot.
- El build en primer plano, con el chequeo de procesos por RUTA DE
  WORKTREE. NUNCA git stash, checkout ni restore.
- Git: commit y push en v3/luz. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Cero color. Sin dependencias nuevas. Cero valores fuera de los
  tokens.
- PowerShell: no hay &&, no hay heredoc.
- Podés decir «la luminancia media de Trabajos pasó de 214 a 31». NO podés
  decir «ahora sí se parece»: eso lo juzgo yo grabando.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
