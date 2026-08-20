# S5 — Editor de keyframes y escena arquitectónica

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA PARADA 🛑** bloqueante, antes del commit.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0 y lint limpio. Nada más.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S4-RIG.md` — el sprint anterior, en particular §9 (lista de calibración) y las decisiones de física.
2. `src/app/probe-escena/_components/` — el módulo entero, sobre todo `choreography.ts` y `choreographySampler.ts`.

## Qué construye este sprint

Dos cosas, ambas dentro de `/probe-escena`:

1. **Un editor de keyframes** — para que el humano pueda pararse en cada keyframe, ajustarlo mirando, y llevarse el archivo actualizado.
2. **La escena enriquecida**, con un mundo definido: **espacio arquitectónico abstracto**.

**No toca el home.** Sigue siendo el instrumento de diseño.

---

## Parte 1 · El editor de keyframes

Hoy el simulador deja scrubear y leer, pero para ajustar hay que copiar una pose y editar `choreography.ts` a mano. Eso hace que nadie calibre.

Lo que tiene que permitir:

**Seleccionar un keyframe.** Una lista con los 17 actuales, por nombre y con su `at`, marcando cuáles fueron derivados. Al elegir uno, la cámara va a esa pose.

**Editarlo mirando.** Con el keyframe seleccionado, los siete sliders de escena pasan a estar **activos** y modifican esa pose en vivo. Es el flujo central: parado en "hero", movés la altura y ves cómo queda ese momento exacto.

**Editar el `at`.** Poder mover el punto del recorrido en que ocurre el keyframe — es lo que resuelve dos de los pendientes anotados en S4 (la pose que no se sostiene y el reparto del giro de Demos).

**Exportar.** Un botón que genere el contenido completo y actualizado del array de keyframes, listo para pegar en `choreography.ts`, con el mismo formato y comentarios que tiene hoy. Copiable de una.

**Duplicar un keyframe.** Para el patrón de sostén: copia el seleccionado con su misma pose y un `at` nuevo. Es la operación que más se va a usar.

**Reset.** Volver a los valores del archivo, para descartar una tanda de ajustes sin recargar.

Las ediciones viven **en memoria**, no escriben el archivo. El humano exporta y pega. Eso mantiene el archivo como fuente de verdad y evita que el probe escriba en disco.

El modo **coreografía** (reproducir, física, inercia, mouse) y el modo **manual** (componer libre) siguen funcionando igual. El editor es un tercer modo, o una extensión del de coreografía — resolvelo como quede más claro.

**Cero `setState` por frame** sigue vigente: las ediciones son eventos del usuario, no del loop.

---

## Parte 2 · La escena

### El mundo

**Espacio arquitectónico abstracto.** Piso claro, luz limpia, y en el aire **planos y estructura suspendidos** — como la maqueta a escala real de algo que todavía no se terminó de construir. El logo es la única pieza terminada, en el centro.

No es un taller ni un estudio fotográfico: no hay herramientas, no hay objetos reconocibles. Es geometría con intención. Elegante, silenciosa, ordenada.

**Prohibido explícitamente:** cualquier iconografía de tecnología — nodos de red, circuitos, burbujas de chat, ventanas de navegador, pantallas, engranajes, cerebros. Es el imaginario por defecto de "tecnología" y es exactamente lo que este proyecto evita. Nada orgánico tampoco: sin rocas, terreno, agua ni vegetación.

### Qué construir

Los `Softboxes` actuales se **reemplazan o se reinterpretan** como planos arquitectónicos: la idea de "panel suspendido" se conserva, la referencia al estudio de fotos se va.

1. **Planos suspendidos** — rectángulos grandes flotando en distintas orientaciones e inclinaciones, a distintas distancias. Algunos **negro mate**, otros apenas más claros que el fondo. Son la fuente principal del negro que la escena necesita, y al orbitar generan ocultamientos y paralaje. Es el elemento que más aporta: dale peso.

2. **Estructura aérea** — una retícula de tubos finos, oscuros, cruzando por encima de la escena. Resuelve el vacío del techo, que es donde más se nota cuando la cámara mira hacia arriba (el recorrido pasa por ahí: keyframes 11 y 12, altura negativa).

3. **Pilares** — dos o tres elementos verticales finos que van del piso hacia arriba y se pierden, lejos y muy tenues. Dan escala y anclan la profundidad.

4. **Marcas de replanteo** — ampliar las marcas de piso existentes con lenguaje de plano: ejes, cotas, referencias de posición. Ya hay un sistema instanciado; extenderlo.

5. **Fragmentos del logo** — los que ya existen, ahora con una lectura: piezas que todavía no se ensamblaron. Podés sumar alguno más si la composición lo pide.

**Balance de negro:** hoy la escena es casi toda clara y se siente vacía. El objetivo es que haya masa oscura real en el cuadro sin perder la base clara. Usá tu criterio; el humano lo va a calibrar mirando.

**Coherencia:** todo lo nuevo tiene que responder a las luces de la escena (nada que brille por sí mismo), y nada puede competir en peso visual con el logo.

### Costo

El presupuesto actual es **243,9 KiB** sobre la red. Las geometrías de three ya están en el bundle y no suman bytes de librería, así que el margen es amplio — pero **medí el resultado** y reportalo, junto con draw calls y triángulos nuevos.

Si algún elemento empuja mucho el frame time (superficies grandes de overdraw, transparencias apiladas), decilo antes de darlo por bueno.

---

## Nota sobre la luz

La narrativa de luz que hay hoy en los keyframes (3,40 → 0,20 de intensidad, 6500 → 7850 K) **fue tanteada, no diseñada**. No la trates como decisión firme: el editor es justamente lo que va a permitir calibrarla. Dejá los valores como están y no los "corrijas".

---

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No sumar dependencias.**
4. **Cero `any`.** **Cero `setState` por frame** en el loop de render.
5. **Nada de base de datos.**
6. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
7. **No corras el dev server ni verifiques en pantalla.**
8. **No auto-confirmás que se ve bien.** El juicio es del humano.
9. Archivos de más de 300 líneas se parten. `ProbeControls.tsx` ya está cerca del límite: el editor va en su propio componente.

## Cierre

🛑 **PARADA:** mostrá (a) `tsc`, (b) archivos, (c) `git status`, (d) cómo usar el editor —el flujo completo de seleccionar, ajustar, duplicar y exportar—, y (e) el peso medido y la contabilidad de draw calls y triángulos contra el baseline de 243,9 KiB. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S5: editor de keyframes y escena arquitectonica"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S5-editor.md.
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
- Nada de iconografía de tecnología en la escena: sin nodos, circuitos,
  chats, pantallas ni engranajes. Geometría arquitectónica abstracta.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo en pantalla.

Arrancá. No me confirmes el entendimiento.
```
