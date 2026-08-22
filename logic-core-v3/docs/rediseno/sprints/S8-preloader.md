# S8 — Preloader con trazo y entrega a la escena

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0 y lint limpio. Además, el gate de `navigator.webdriver` hace que el intro **no corra bajo automatización**: este componente solo se verifica a ojo humano.

## Lecturas obligatorias

1. **`docs/rediseno/DIRECCION-ESCENA.md`, sección 1** — la especificación del preloader, acordada con el dueño del proyecto. Es la fuente de verdad de este sprint.
2. `docs/rediseno/outputs/S3-HERO.md` — el preloader actual (`HomeIntro.tsx`), su timeline parametrizado, el gate pre-paint y la historia del handoff que se descartó.
3. `src/components/ui/Preloader.tsx` — el preloader clásico de `main`, del que se recupera **el gesto del trazo**, no el código.

## Qué construye este sprint

**El preloader definitivo del home**, y su entrega a la escena 3D.

Reemplaza al `HomeIntro` de S3 (negro → logo → nombre → slogan → inversión → se levanta), que fue un paso intermedio. La secuencia nueva la definió el dueño del proyecto y está en `DIRECCION-ESCENA.md`.

## La secuencia

1. Pantalla **oscura**.
2. El logo **se dibuja con un trazo**. Se recupera el gesto del preloader clásico de `main` — pero más corto y más limpio, no su implementación.
3. **Antes de que el trazo se complete**, aparecen **"develOP"** arriba e **"Ingeniería para negocios reales"** abajo, con **efecto de aparición**. No de escritura, no letra por letra: aparición.
4. **En el instante exacto en que el trazo cierra: corte seco de color.** Sin fundido. Fondo claro, logo negro, letras negras.
   - El corte tiene que caer en el frame preciso del cierre del trazo. Un cuadro antes o después se lee como error, no como decisión.
   - Es intencional que sea corte y no transición: un corte se lee como decisión, un fundido en el mismo lugar se lee como default.
5. En ese mismo momento, **el logo y las letras se alejan levemente** — el gesto de "presentación de empresa".
6. Las letras **desaparecen con el mismo efecto con que aparecieron**.
7. La capa del preloader **se desvanece** y aparece la escena 3D detrás.
8. El **logo 3D** toma el lugar, va a su **pose inicial** de la coreografía, y de ahí **baja al hero** siguiendo el recorrido.

## Reglas del preloader

- **Sin sonido.** Los navegadores bloquean el audio antes de la primera interacción del usuario, así que en la primera visita —la única que importa— no sonaría.
- **Sin bloqueo de scroll en ningún momento.** Ni un frame. Es el problema que S3 resolvió y no se reintroduce.
- **Solo en la primera visita de la sesión** (`sessionStorage`), con el gate pre-paint que ya existe para que la visita repetida no muestre ni un frame de overlay.
- **Honra `prefers-reduced-motion`:** se salta o se reduce a un fade mínimo.
- **El contenido del hero existe en el DOM y es visible para buscadores desde el primer paint**, aunque el preloader esté encima.
- **Duración total parametrizada**, con las fases editables por separado como en S3. Elegí un default corto y justificalo; el dueño del proyecto lo va a calibrar.
- **No romper Route B:** la rama de marketing de `Preloader.tsx` sigue funcionando igual.

## La entrega del logo — la parte delicada

En S3 este handoff se descartó, y con razón: el destino era un SVG estático que no significaba nada, el logo 3D flotaba sin pose de reposo, tenía auto-cull y estaba frozen.

**Ahora la situación es distinta y por eso es viable:** el destino es el logo 3D de la escena, con una **pose inicial conocida y controlada por la coreografía**, y la vira se puede apagar durante la entrada para que el blanco esté quieto.

Aun así, **es el punto que puede fallar**. Antes de construirlo:

- Verificá que la pose inicial de la coreografía sea alcanzable y estable en el momento de la entrega.
- Verificá qué pasa si el visitante **scrolleó durante el preloader** — el scroll está libre, así que el progreso puede no ser cero cuando el velo se levanta. **Regla ya acordada: si el destino no está donde corresponde, no hay vuelo — el logo se desvanece y la escena aparece con el logo ya en su lugar.**
- Verificá qué pasa si **la escena 3D todavía no cargó**. El preloader no debe esperarla: si no está lista, el logo del preloader se va igual y la escena aparece cuando puede.

**Si el handoff no se puede garantizar, frená y reportá con los números antes de construirlo.** Es preferible un preloader que se desvanece limpio a uno con un salto visible.

## Sobre la escena en el home

Este sprint **no monta la escena 3D en el home** — eso es el sprint siguiente. Pero el preloader tiene que estar construido para entregarle el lugar.

Resolvelo de modo que la entrega funcione cuando la escena exista, y que **hoy degrade limpio** con lo que hay en el home (el logo 2D y el canvas actual). Reportá cómo lo dejaste preparado y qué va a haber que conectar después.

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
2. **No toques `/probe-escena`.** Es el instrumento de diseño y está cerrado.
3. **No construyas secciones del home** ni montes la escena.
4. **No romper Route B ni `DotMatrix`.**
5. **No borrar archivos.** Lo que quede huérfano se reporta.
6. **Todo lo que animes consume los tokens de motion de S2.** Si algo no entra en el vocabulario, frená y reportá.
7. **Cero `any`.** **Cero `setState` por frame.**
8. **No sumar dependencias.**
9. **Nada de base de datos.**
10. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
11. **No auto-confirmás que funciona porque compila.** Este componente además no se puede verificar por automatización: solo a ojo.
12. Archivos de más de 300 líneas se parten.

## Paradas

🛑 **PARADA 1** — antes de construir: mostrá (a) cómo resolvés el trazo y el corte seco en el frame exacto, (b) el desglose de tiempos propuesto con su justificación, y (c) **tu análisis del handoff**: si se puede garantizar, cómo, y qué pasa en los tres casos límite (scroll durante el intro, escena sin cargar, movimiento reducido). Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) `tsc`, (b) archivos, (c) `git status`, (d) qué verificar en el navegador paso por paso, y (e) qué queda preparado para conectar la escena. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S8: preloader con trazo y entrega a la escena"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S8-preloader.md.
Leela ENTERA antes de empezar, junto con la sección 1 de
docs/rediseno/DIRECCION-ESCENA.md que ella referencia, y tratalas como si
te las hubiera escrito directamente.

Marco no negociable:
- Es un sprint de ESCRITURA de código, sobre el home.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0 y lint limpio, nada más.
- No tocás archivos frozen ni /probe-escena. No montás la escena 3D ni
  construís secciones.
- No rompés Route B ni DotMatrix.
- El preloader NO bloquea el scroll en ningún momento, ni un frame.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá. No me confirmes el entendimiento.
```
