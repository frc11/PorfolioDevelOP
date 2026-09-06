# B4-B — La medición

Todo lo que decía "no se puede sin navegador". Ahora se puede.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-medicion`, rama **`v3/medicion`**. Sesión en `C:\v3-medicion\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con B4-A (la costura), en otro worktree.**

## ⚠️ El puerto es 3002

```powershell
npm run dev -- -p 3002
```

La otra sesión usa el 3001. **Si medís en otro puerto, medís el sitio de otro.**

⚠️ **El build va en primer plano.** El chequeo de procesos filtra **por línea de comando** y con ventana de **horas**: hay tres `node` permanentes que son `chrome-devtools-mcp` y **no se matan**.

⚠️ **Y una regla que B2 descubrió:** una tarea mandada a fondo **sí deja salida si redirigís a un archivo.**

---

## ⚠️ Este lane MIDE. No arregla nada.

**Es la regla que define el sprint.** Hay otra sesión arreglando cosas en paralelo, y **si vos también tocás código de producto, van a chocar al mergear.**

- **Escribís instrumentos, corrés mediciones, y reportás.**
- **Si encontrás un defecto, lo documentás con su número y su causa. NO lo arreglás.**
- **La única excepción:** un instrumento tuyo que esté mal. Ése sí.

Lo que produce este lane es **un inventario de defectos ordenado por gravedad**, que va a alimentar el sprint siguiente. Los defectos con su número valen más que los arreglos apurados.

---

## El contexto

Durante veinte sprints la regla fue que CC no abre navegador. **Eso dejó una lista larga de cosas que dicen "necesita navegador" y nunca se midieron.** Ahora `chrome-devtools-mcp` está conectado.

Y hay **dos reglas de método** que dos lanes descubrieron por separado y que gobiernan todo lo que sigue:

**El búfer de WebGL no se puede leer desde la página.** `ProbeStage` monta el canvas con `alpha:false` y **sin `preserveDrawingBuffer`**, así que `toDataURL`, `drawImage` y `readPixels` devuelven un cuadro **rancio o en blanco**. No es un bug: es el contrato de WebGL con esa configuración. **Toda medición de la escena va por `Page.captureScreenshot`** —la foto de lo compuesto— decodificada aparte con los instrumentos de B1.

**Y la pestaña tiene que estar al frente.** Con `visibilityState: "hidden"` no corre `requestAnimationFrame` y medís una página con las animaciones clavadas en `opacity: 0`. **Verificalo antes de cada captura**, como manda `docs/rediseno/MEDICION-NAVEGADOR.md`.

---

# FASE 0 — El principal, sin subagentes

**El banco de medición compartido**, antes de despachar. Los tres frentes miden sobre el mismo instrumento o sus números no se pueden comparar.

- **Emulación de dispositivo**: viewport, `devicePixelRatio`, `userAgent` y throttling de red y CPU.
- **Los perfiles**: `iPhone SE` (375×667), `iPhone 15` (393×852), `iPad` (768×1024), `1024` (justo abajo del umbral), `1025` (justo arriba), `1440` y `1920`.
- **La receta de captura** que ya existe, extendida a mobile.
- **Dónde se guarda todo**: `docs/rediseno/capturas/b4/<frente>/<perfil>-<seccion>.png` y las mediciones en JSON.

⚠️ **Todo lo que salga de emulación se declara como emulado**, no como medido en un dispositivo. Es un modelo bueno, no es un teléfono.

---

# FASE 1 — Tres frentes

## Subagente A · Rendimiento

**Nunca se corrió Lighthouse ni se midió LCP.** El presupuesto declarado abajo de 1025 es `LCP < 2,5s`, `JS < 300 KB` y `Lighthouse ≥ 80`, y hoy el peso está en **378,6 KiB gzip**.

- **Lighthouse completo** en móvil y en escritorio. Las cuatro categorías.
- **LCP, CLS, INP y TBT**, con throttling de red y CPU realistas.
- **Cuál es el elemento LCP** y cuánto tarda. Es lo que decide qué optimizar.
- **El reparto del peso**, archivo por archivo, contra el piso del framework de 248,2 KiB — de los cuales **142,1 son el SDK de Sentry**, que **no se puede diferir**: sin `init`, `global-error.tsx` descarta el evento devolviendo un id igual y no avisa en producción.
- **Si Lighthouse da ≥ 80 con el peso actual**, el techo de 300 se re-fija con el número real y su dueño, según la regla 13. **Reportá esa recomendación, no la apliques.**
- **El costo de la escena**: cuadros por segundo durante el recorrido, arriba de 1025, y si hay caídas. Con capturas, nunca leyendo el canvas.

## Subagente B · Mobile

**Abajo de 1025 hay un segundo sitio y casi nadie lo miró.** B2 midió los acontecimientos **solo a 1920 y lo declaró**: el aire muerto y el ritmo en móvil **están sin medir**.

- **Las ocho secciones en los cuatro perfiles de abajo del umbral**, con capturas.
- **Aire muerto por sección**, con el mismo instrumento de B1, contra sus cifras de escritorio.
- **Los acontecimientos y el hueco máximo** en móvil, con el censo de B2. ⚠️ **Abajo de 1025 no hay coreografía**: el ritmo lo dan solo el `sticky` y las transiciones de CSS. **Puede que el censo dé cero. Si da cero, eso es el hallazgo.**
- **La escala tipográfica resuelta** en los cuatro perfiles. A 375 es el piso de la banda fluida.
- **Los pines que sobreviven abajo del umbral**, con scroll real.
- **Desbordes horizontales**, que es el defecto más común y más feo en móvil.
- **El área de toque** de todo lo interactivo: la pastilla, el CTA, las tarjetas, el formulario del pie.

## Subagente C · Lo que quedó abierto desde S0

Tres verificaciones que arrastran sprints y todas dicen "necesita navegador".

**Las siete anclas del pie**, con scroll real. `scroll-padding-top` está en 72 px y es un número geométrico: **medí dónde aterriza cada una de verdad**, y si la pastilla tapa el destino.

**La verificación óptica de la tipografía**, abierta desde S0. Hay un empate esperando: **la cap height de Chivo es 4,72% más chica** que la de la familia de origen, la x-height coincide, y compensar una desajusta la otra. La decisión se cerró con cuatro razones medidas, **pero el desvío en píxeles ordena al revés, −22,6%.** Rendé los ocho niveles con texto real en Title Case y en minúscula, en `/v3/tipografia`, con capturas a 1440 y 1920. **No decidas: dejá la evidencia para que la mire el humano.**

**El arranque del scroll.** B2 puso un techo de 1,0 altura de cuadro por pantalla y el pico bajó de 6,0945 a 4,6198. **Medilo cuadro a cuadro con scroll real** y reportá si el techo se respeta en todo el recorrido o solo en promedio.

**Y `prefers-reduced-motion`**, que B1 no pudo emular. Con el navegador se puede: verificá que con la preferencia activa **no se monte ni un patrón** y que el contenido esté completo.

---

# FASE 2 — Integración

1. **`verificar`** y el build en primer plano. ⚠️ **`s5-peso` puede estar en rojo**: es conocido, lo tiene la otra sesión, **no lo toques.**
2. **El inventario de defectos ordenado por gravedad**, no por frente. Es lo que voy a leer primero.
3. **Separá defecto de decisión.** Un desborde horizontal es un defecto; un techo de presupuesto que no se alcanza es una decisión.
4. **Lo que se puede arreglar sin decidir nada**, listado aparte con su costo. **No lo arregles.**
5. **Las capturas**, con su índice.

---

## Reglas absolutas

1. **Rama `v3/medicion`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. Para leer `HEAD`: `git show HEAD:<ruta>`. **Nunca `git add .`**
2. ⚠️ **ESTE LANE NO ARREGLA CÓDIGO DE PRODUCTO.** Ni una sección, ni un token, ni un componente, ni un contrato. Si te tienta arreglar algo, **documentalo con su número y seguí.** Hay otra sesión arreglando y van a chocar.
3. **No toques el preloader, `_lib/escena/`, el contenido, el home actual, `/probe-escena`, `scene-camera.ts` ni los frozen.**
4. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
5. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.**
6. **Toda cifra que salga de emulación se declara como emulada.** Un modelo no es un dispositivo, y confundirlos es el modo de falla que este repo lleva veinte sprints cazando.
7. **Ninguna comprobación verde por vacío.** Control positivo obligatorio en cada instrumento nuevo.
8. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia.
9. **PowerShell:** no hay `&&`, no hay heredoc.
10. **No auto-confirmás que se ve bien.**
11. Archivos de más de 300 líneas se parten.
12. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto. Y un `workflow` que devuelve `completed` en pocos segundos **no terminó**.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `verificar` y el build.
- (b) **El inventario de defectos por gravedad**, con defectos separados de decisiones.
- (c) **Lighthouse y las métricas web**, móvil y escritorio, con el elemento LCP identificado.
- (d) **El reparto del peso** contra el piso, y la recomendación sobre el techo de 300.
- (e) **Mobile**: las ocho en los cuatro perfiles, aire muerto, acontecimientos, desbordes y áreas de toque.
- (f) **Las siete anclas**, dónde aterrizan de verdad.
- (g) **La tipografía**: los ocho niveles renderizados, con capturas, **sin decidir.**
- (h) **El techo de velocidad**, cuadro a cuadro.
- (i) **`prefers-reduced-motion`.**
- (j) **Lo que se puede arreglar sin decidir**, con su costo.
- (k) El índice de capturas, archivos y `git status`.
- (l) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B4-B: la medicion"` → `git push -u origin v3/medicion`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B4-B-medicion.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-medicion, rama v3/medicion. Corre EN PARALELO con otra
  sesión que está ARREGLANDO cosas en C:\v3-costura.
- ⚠️ TU PUERTO ES EL 3002. La otra sesión usa el 3001.
- ⚠️ ESTE LANE MIDE Y NO ARREGLA NADA. Ni una sección, ni un token, ni un
  componente, ni un contrato. Si encontrás un defecto, lo documentás con su
  número y su causa y SEGUÍS. La única excepción es un instrumento tuyo que
  esté mal. Si arreglás código de producto, vamos a chocar al mergear.
- TRES FASES: la fase 0 la hacés vos solo —el banco de medición compartido
  con sus siete perfiles— y nada se despacha hasta que exista. La fase 1 son
  tres subagentes. La fase 2 la integrás vos.
- DOS REGLAS DE MÉTODO que dos lanes descubrieron por separado: el búfer de
  WebGL NO se puede leer desde la página —ProbeStage monta con alpha:false y
  sin preserveDrawingBuffer, así que toDataURL, drawImage y readPixels dan
  un cuadro rancio o en blanco— así que toda medición de la escena va por
  Page.captureScreenshot. Y la pestaña tiene que estar AL FRENTE: con
  visibilityState hidden no corre rAF y medís una página congelada.
- Toda cifra que salga de emulación se declara COMO EMULADA. Un modelo no es
  un dispositivo.
- Abajo de 1025 no hay coreografía: si el censo de acontecimientos da cero,
  ESO es el hallazgo, no un error.
- La tipografía se RENDERIZA y se captura, NO se decide. Hay un empate
  medido esperando y lo rompe el ojo del humano.
- s5-peso puede estar en rojo: es conocido y lo tiene la otra sesión. NO lo
  toques.
- El build va EN PRIMER PLANO. El chequeo de procesos filtra por LÍNEA DE
  COMANDO y con ventana de HORAS: hay tres node permanentes que son
  chrome-devtools-mcp y no se matan.
- Ninguna comprobación verde por vacío. Toda cifra con su instrumento, y la
  captura es evidencia.
- Git: commit y push en v3/medicion. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte, y git stash. Nunca git add .
- Cero any. Sin dependencias nuevas.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- EN EL REPORTE, lo que más me importa es el inventario de defectos ORDENADO
  POR GRAVEDAD, con los defectos separados de las decisiones.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
