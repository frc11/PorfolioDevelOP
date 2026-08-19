# S4 — Rig de coreografía · Escena 3D del home develOP

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** La verificación visual la hace el humano. Verificación tuya: `tsc --noEmit` exit 0 y lint limpio. Nada más.

## Lecturas obligatorias

1. `docs/rediseno/outputs/PROBE-ESCENA.md` — el probe que este sprint extiende, incluido el hallazgo del perfil y las decisiones de §10.
2. `src/app/probe-escena/_components/` — todo el módulo. Este sprint lo amplía; no lo reescribe.
3. `src/components/design-system/motion/tokens.ts` — el vocabulario de motion del sistema.

## Qué construye este sprint

El **rig de coreografía**: la cámara recorriendo una secuencia de posiciones ligada a un progreso 0→1, con inercia y offset de mouse, sobre una escena enriquecida.

**Sigue viviendo en `/probe-escena`.** No toca el home. El objetivo es que el humano pueda **calibrar el movimiento con un control de progreso simulado**, sin pelearse todavía con el layout de las secciones. La conexión al scroll real y al contenido es del sprint siguiente.

## Parte 1 · El recorrido

La coreografía cubre **8 pantallas de scroll**, en seis tramos:

| Tramo | Contenido | Pantallas |
|---|---|---|
| 1 | Hero | 1 |
| 2 | Quiénes somos (dos personas) | 2 |
| 3 | Números | 1 |
| 4 | Portfolio | 1 |
| 5 | Demos | 1 |
| 6 | Movimiento final + cierre | 2 |

### Descripción del recorrido, en palabras del dueño del proyecto

1. **Arranque:** la cámara mira alto y **baja** hasta encuadrar el hero.
2. **Quiénes somos, persona 1:** baja el encuadre horizontal, sube el vertical y se acerca al logo, **todo al mismo tiempo**.
3. **Quiénes somos, persona 2:** sube el vertical, sube el horizontal, y **luego** vuelve a bajar el vertical. Distancia al logo aproximadamente igual.
4. **Números:** reduce altura, aumenta distancia (**en ese orden, secuencial**), el encuadre horizontal se reacomoda a cero, y luego vuelve a subir altura y a acercarse.
5. **Portfolio:** se acerca, rota hacia la derecha y sube la altura — un acercamiento diagonal. El contenido va **arriba a la derecha** (2 o 3 trabajos y un botón "ver más").
6. **Demos:** rota **360°** mientras baja la altura, y termina con la cámara mirando el logo **desde abajo a la izquierda hacia arriba a la derecha**. El contenido va **abajo a la izquierda** (varias demos).
7. **Movimiento final:** se levanta, gira un poco, baja, y se aleja. Durante todo ese recorrido aparecen **palabras sueltas flotando** que después desaparecen.
8. **Cierre:** se aleja del todo y queda el logo con **"develOP" arriba y el slogan abajo**. Después las letras se van, la cámara se mueve a otros ángulos y termina en el CTA final.

### Posiciones capturadas por el humano en el probe

Estos son valores reales, tomados componiendo cada momento en pantalla. Están en orden aproximado del recorrido. **Usalos como base de los keyframes** — el humano los va a calibrar después con el simulador, así que no los "mejores": respetalos y dejalos editables.

```
{ angleDeg: 0.0,   height: 9.00,  distance: 16.2, frameX: 0.85,  frameY: 0.02,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 0.0,   height: -0.20, distance: 16.2, frameX: 0.85,  frameY: 0.02,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 0.0,   height: 3.50,  distance: 10.5, frameX: -0.50, frameY: -0.11, keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 0.0,   height: 4.25,  distance: 10.7, frameX: 0.77,  frameY: -0.11, keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 0.0,   height: -0.30, distance: 22.3, frameX: 0.01,  frameY: 0.01,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 0.0,   height: 5.10,  distance: 15.2, frameX: 0.01,  frameY: 0.01,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 39.5,  height: 5.65,  distance: 6.3,  frameX: -1.00, frameY: 0.10,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 113.5, height: 4.25,  distance: 6.3,  frameX: -1.00, frameY: 0.10,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 144.5, height: -1.90, distance: 6.3,  frameX: -1.00, frameY: 0.10,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 228.0, height: -3.50, distance: 6.3,  frameX: -1.00, frameY: 0.10,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 302.0, height: -2.70, distance: 7.7,  frameX: 1.00,  frameY: 0.10,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 312.0, height: 3.55,  distance: 7.7,  frameX: 1.00,  frameY: 0.14,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 347.0, height: 3.55,  distance: 7.7,  frameX: -0.02, frameY: 0.00,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 360.0, height: -2.05, distance: 7.7,  frameX: -0.02, frameY: 0.00,  keyIntensity: 3.40, keyKelvin: 6500 }
{ angleDeg: 360.0, height: 6.25,  distance: 30.0, frameX: -0.02, frameY: 0.00,  keyIntensity: 0.20, keyKelvin: 7850 }
```

Notas sobre estos valores:

- El recorrido **cruza las dos ventanas de perfil** (90° y 270°), pero a distancia 6.3 con encuadre al extremo el logo llena la pantalla y el problema del perfil **no se manifiesta**. Verificado por el humano. No hay que evitar esos ángulos.
- La iluminación arranca clara y **termina apagándose** (`keyIntensity` 3.40 → 0.20, `keyKelvin` 6500 → 7850). Ese apagado es parte de la coreografía, no un detalle.
- Varios tramos describen **sub-movimientos secuenciales** ("en ese orden", "y luego"). Eso implica más keyframes que posiciones capturadas: derivá los intermedios necesarios y **documentá cuáles inventaste**, para que el humano sepa qué calibrar primero.

### Cómo se estructura

Los keyframes van en un **archivo de datos propio**, no incrustados en el componente: un array de posiciones, cada una con su punto en el progreso 0→1 y un nombre legible del momento. Tiene que poder editarse sin tocar lógica.

La interpolación entre keyframes usa las curvas del sistema de motion (`MOTION_EASE`). El ángulo interpola por el camino corto salvo que se indique lo contrario — el tramo de 360° necesita dar la vuelta entera, no volver por donde vino: resolvelo explícitamente.

## Parte 2 · Física

**Inercia.** El movimiento no salta al valor objetivo: lo persigue con amortiguación. Cuando el progreso se detiene, la cámara sigue asentándose un momento. Los parámetros de la amortiguación, expuestos y editables.

**Offset de mouse.** Sobre la posición que determina el progreso, el mouse suma un desplazamiento **pequeño y relativo** — no reemplaza la posición, la modula. Cuando el progreso está quieto, ese offset es el único movimiento y tiene que sentirse vivo sin marear. Magnitud editable.

**Vira en reposo.** Con el progreso detenido, el logo mantiene un movimiento **muy leve y continuo** — un balanceo lento, no una rotación. Es lo que evita que la escena parezca congelada.

**`prefers-reduced-motion`:** sin inercia, sin offset de mouse, sin vira. La cámara va directo a la posición del progreso.

**Regla dura:** todo esto en `useFrame` y escritura directa a objetos de three. **Cero `setState` por frame.**

## Parte 3 · La escena

Enriquecer manteniendo la coherencia: el mundo es un **estudio fotográfico**. Todo lo que se agregue tiene que pertenecer a ese mundo. Nada orgánico, nada que brille por sí mismo, nada que compita en peso visual con el logo.

En orden de prioridad:

1. **Softboxes flotantes** — dos o tres paneles rectangulares, apenas más luminosos que el fondo, suspendidos alrededor del logo. Al orbitar generan paralaje y ocultamientos. Es lo que más espacio aporta por menos costo.
2. **Marcas de piso** — ampliar las marcas de esquina actuales a un sistema de marcas de encuadre, cruces y cintas de posición. El piso pasa de vacío a set. Lenguaje de precisión.
3. **Partículas en dos escalas** — las actuales como polvo en suspensión, más unas pocas **más grandes y desenfocadas** cerca de la cámara. El desenfoque es lo que más profundidad da por menos polígonos. Dejá preparado que las grandes puedan cambiar de color más adelante, sin implementarlo.
4. **Ciclorama** — que el piso curve hacia arriba en el fondo en vez de cortar en horizonte recto, como un estudio real. Elimina la línea dura visible hoy.
5. **Fragmentos del logo** — arcos sueltos de la `c` y la `p` flotando lejos, muy tenues. Es el único elemento que no podría estar en el estudio de otro: es lo que hace la escena de develOP y no un render genérico. Con moderación.

**Logo más grueso:** aumentá la profundidad de extrusión. Ayuda al perfil y acerca el peso visual a la referencia. Dejá el valor como constante editable y reportá cuál elegiste.

Todo lo nuevo, con su **costo medido**: cuánto suma al peso y al frame time. El presupuesto actual es 242 KiB sobre la red; si algo lo empuja mucho, decilo antes de darlo por bueno.

## Parte 4 · El simulador

En `/probe-escena`, además de los controles actuales:

- Un **control de progreso 0→1** que recorra toda la coreografía.
- Un **botón de reproducción** que lo recorra automáticamente, con velocidad ajustable.
- **Lectura del tramo actual** y del keyframe más cercano, por nombre.
- Los controles manuales existentes siguen funcionando en un modo aparte, para seguir componiendo posiciones nuevas.
- Todo escrito al DOM directo. Cero `setState` por frame.

🛑 **PARADA 1:** antes de construir, mostrá (a) la estructura de keyframes que proponés, con cuántos son y cuáles derivaste vos, (b) cómo resolvés el tramo de 360°, y (c) qué elementos de escena vas a construir y su costo estimado. Esperá el OK.

🛑 **PARADA 2:** al cerrar: (a) `tsc`, (b) archivos, (c) `git status`, (d) cómo usar el simulador, y (e) el peso y el frame time medidos contra el baseline de 242 KiB. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S4: rig de coreografia de la escena 3D"` → `git push`.

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`. Si algo tiene que salir de ahí para reutilizarse, **reportalo y esperá**: la extracción es del sprint siguiente.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No sumar dependencias.** R3F, drei y three ya están.
4. **Cero `any`.** **Cero `setState` por frame.**
5. **Nada de base de datos.**
6. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
7. **No corras el dev server ni verifiques en pantalla.** Si algo requiere ojo humano, decilo y dejalo anotado.
8. **No auto-confirmás que se ve bien.** El juicio del movimiento es del humano.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S4-rig.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código, aislado en /probe-escena.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0 y lint limpio, nada más.
- No tocás el home ni ningún archivo frozen.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo en pantalla.

Arrancá. No me confirmes el entendimiento.
```
