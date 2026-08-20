# S6 — Iluminación, atmósfera y arreglos de coreografía

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA PARADA 🛑** bloqueante, antes del commit.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0 y lint limpio.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S5-EDITOR.md` y `S4-RIG.md`.
2. `src/app/probe-escena/_components/` — el módulo entero, con `choreography.ts` en su estado actual (24 keyframes, ya calibrados por el humano).

## Contexto: qué se vio

El humano grabó el recorrido completo y lo revisó frame a frame. La coreografía funciona: tiene ritmo, el giro de demos es el momento más fuerte, y el arco general se lee. Pero hay cuatro problemas concretos y la escena está subiluminada — se ve plana, sin la profundidad que la referencia tiene.

La referencia es **nk.studio**: un objeto que es el punto de mayor contraste de la escena, con un filo de luz que lo recorta del fondo, atmósfera con profundidad real, y partículas pocas pero grandes y visibles. **Adaptado a develOP:** logo negro mate sobre base clara, sin neón ni paleta de color. El gesto es el mismo; el vocabulario es el nuestro.

**Instrucción del dueño del proyecto: acomodá los valores como creas correctos.** Se van a calibrar después con el editor. Elegí con criterio profesional, no busques el consenso de nadie.

---

## Parte 1 · La luz sale de los keyframes

`keyIntensity` y `keyKelvin` **se eliminan de la pose de los keyframes**. Fueron dos sliders más mientras se componían posiciones y quedaron valores sin diseñar (intensidad 0 en el primer keyframe, saltos de 9 → 5 → 4 sin razón). La iluminación no es una propiedad de la cámara.

En su lugar: **un sistema de iluminación propio de la escena**, diseñado por vos.

**Setup de tres puntos**, que es el estándar y es exactamente lo que le falta a la escena:

1. **Key** — la luz principal. La que ya existe, recolocada con criterio.
2. **Fill** — luz de relleno, opuesta y más suave, para que las caras en sombra no sean negro plano.
3. **Rim / contraluz** — **la más importante de este sprint.** Una luz desde atrás que dibuje el canto del logo y lo separe del fondo.

El rim resuelve el problema que el humano detectó: el logo es casi negro y los planos oscuros son `#191917`; cuando coinciden, el logo desaparece. Moverlos no alcanza porque la cámara orbita y siempre habrá ángulos donde se superpongan. **Un filo de luz sobre el canto lo recorta siempre**, y de paso convierte la profundidad de extrusión que se aumentó en S4 en protagonista en vez de accidente.

**El rim tiene que funcionar en toda la órbita.** Con la cámara girando 360°, una luz fija deja de ser contraluz en la mitad del recorrido. Resolvelo: puede ser solidaria a la cámara, pueden ser dos opuestas, o lo que te parezca — pero **verificá el razonamiento contra el recorrido real**, que pasa por ángulos de 0° a 360° y alturas de +9 a −3,9.

### El arco de luz

La narrativa se conserva: **la escena arranca clara y se va apagando hacia el cierre.** Pero como curva ligada al progreso de la coreografía, no como número por keyframe.

Diseñá esa curva: cuánto baja, dónde empieza a bajar, si la temperatura acompaña. Que quede en `choreography.ts` junto al resto, editable, con su razón documentada.

---

## Parte 2 · Atmósfera y sombras

La escena se ve plana. Lo que falta:

**Niebla / profundidad atmosférica.** Que lo lejano se desvanezca hacia el fondo. Es lo que más separa una escena 3D amateur de una profesional, y cuesta casi nada. Ojo con el fondo claro: la niebla tiene que integrarse con el ciclorama, no producir un halo.

**Sombras de calidad.** Hoy hay una direccional con mapa de 2048² y `autoUpdate = false`. Mejorala: suavidad de borde adecuada, sin acné ni peter-panning, y con la resolución justa. El logo tiene que **apoyar** en el piso, no flotar.

**Oclusión de contacto.** La sombra donde el logo toca el piso tiene que ser más densa y cerrada que la sombra proyectada. Es el detalle que hace que un objeto pertenezca al espacio.

**Los materiales.** El logo es negro mate: revisá su rugosidad para que la luz lo describa en vez de aplanarlo. Un negro completamente mate no muestra forma; un poco de reflexión especular sí, sin volverlo cromado.

Todo esto tiene **costo de frame time**. Medí lo que puedas de forma estática (draw calls, pasadas de sombra, resolución de mapas) y **decí explícitamente qué es lo primero que hay que apagar si mobile no rinde.**

---

## Parte 3 · Partículas

**Menos cantidad, más grandes, más visibles.** Hoy hay 4.000 puntos chicos que se leen como ruido. La referencia tiene pocas partículas pero cada una se ve.

Rediseñá los dos campos: reducí el conteo, aumentá el tamaño, y hacé que aporten profundidad real — las cercanas grandes y desenfocadas, las lejanas chicas y tenues. Que se muevan lento y con vida propia, no estáticas.

El parámetro de conteo sigue vivo en el panel para calibrar.

---

## Parte 4 · Arreglos de coreografía

Cuatro problemas detectados por el humano mirando el video. **Arreglalos en los datos**, conservando la intención de cada tramo:

**1 · El salto de Números.** El keyframe derivado `números · baja la altura` (`at: 0.464`, `height: -3.9`) y el siguiente `números · se aleja` (`at: 0.488`, `height: 1`) recorren casi 5 unidades de altura en 0,024 de progreso. Es un tirón, y además el keyframe llamado "se aleja" en realidad sube. Resolvelo: sacá el intermedio derivado, o separá los `at` para que el movimiento respire. Elegí y justificá.

**2 · El giro de Demos no es parejo.** `giro ¼` y `giro ½` tienen **el mismo `angleDeg` (135)**: entre ellos la cámara no rota, solo cae de altura. Después rota 90° y otros 90°. El giro se siente frenar-caer-arrancar. Repartí los ángulos de forma pareja o ajustá los `at` para que coincidan con lo que cada tramo realmente rota. El comentario del archivo dice "proporcional al ángulo" y dejó de ser cierto: actualizalo.

**3 · El retroceso del final.** La secuencia va 315 → 360 → **354,09** → 0. Ese retroceso de 6° no está en la intención descrita y se lee como vacilación, seguido de otro cambio casi imperceptible. **Dejá el final en tres beats limpios**: se levanta, gira hasta 360, se aleja al cierre. Sacá el 354.

**4 · El cierre no sostiene.** Termina a distancia 16 con la luz casi apagada: el logo queda chico y apenas visible. Ahí va a ir "develOP" arriba y el slogan abajo. Recomponelo para que sea una pantalla de cierre de verdad — más presencia del logo, y luz suficiente para que se lea, sin perder que sea el momento más oscuro del recorrido.

**Documentá cada cambio** en el comentario del keyframe: qué había, qué pusiste, por qué.

---

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No sumar dependencias.** Todo con three, R3F y drei ya instalados.
4. **Nada de iconografía de tecnología** ni elementos orgánicos. El mundo sigue siendo geometría arquitectónica abstracta.
5. **Cero `any`.** **Cero `setState` por frame** en el loop.
6. **Nada de base de datos.**
7. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
8. **No corras el dev server ni verifiques en pantalla.**
9. **No auto-confirmás que se ve bien.**
10. **El editor tiene que seguir funcionando.** Si sacar `keyIntensity`/`keyKelvin` de la pose rompe el editor, la lista o el exportador, arreglalos: son parte del entregable.
11. Archivos de más de 300 líneas se parten.

## Cierre

🛑 **PARADA:** mostrá (a) `tsc`, (b) archivos, (c) `git status`, (d) qué cambió en la coreografía keyframe por keyframe, (e) el setup de luces con su razonamiento —sobre todo cómo el rim funciona en toda la órbita—, y (f) el costo: peso, draw calls, pasadas de sombra, y qué apagar primero si mobile no rinde. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S6: iluminacion, atmosfera y arreglos de coreografia"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S6-luz.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código, aislado en /probe-escena.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0 y lint limpio, nada más.
- No tocás el home ni ningún archivo frozen.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame en el loop.
- Nada de iconografía de tecnología ni elementos orgánicos en la escena.
- Elegí los valores con criterio profesional: se calibran después.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo en pantalla.

Arrancá. No me confirmes el entendimiento.
```
