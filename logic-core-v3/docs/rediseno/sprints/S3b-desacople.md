# S3b — Desacople del preloader y el hero

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `xhigh`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA PARADA 🛑** bloqueante, antes del commit.
- Continuación directa de S3 (`docs/rediseno/outputs/S3-HERO.md`). Los cambios de S3 están **sin commitear** en el working tree: este ajuste se aplica encima y se commitea todo junto.

## Por qué existe este ajuste

El requisito de "entrega del logo sin discontinuidad" que se agregó al Bloque 2 **fue un malentendido de la capa de planificación**, no un pedido del dueño del proyecto. Se revierte.

La intención real:

- **El preloader es un momento cerrado.** Tiene su propio logo, que se va hacia arriba con el resto de la secuencia y desaparece. No entrega nada a nadie.
- **El hero tiene su propia animación**, que se construye en un sprint posterior: el logo 3D reaccionando al **progreso del scroll**, al estilo de nk.studio. Sin mouse-follow.
- Las dos cosas no comparten estado, ni medición, ni coreografía.

## Decisiones cerradas

1. **Se elimina el vuelo del logo** del preloader al hero, y todo lo que existe para sostenerlo: el atributo `data-hero-logo-mark`, la medición de posición del slot, la regla de "si el destino no está en pantalla, no hay vuelo", y cualquier estado compartido entre `HomeIntro` y el hero.
2. **El logo del preloader sube con el texto y desaparece.** Toda la secuencia se levanta junta, como estaba aprobado originalmente en la Parada 2 del sprint.
3. **El logo 2D del hero se queda**, con un rol nuevo y más simple: **estado de carga y red de seguridad**. Se ve mientras el 3D carga (la cadena completa puede tardar hasta 6 s: chunk de three/r3f/drei + HDRI de 1,7 MB), y queda como único contenido si el 3D falla o el dispositivo no lo soporta. El reemplazo por el 3D es un cambio simple, sin crossfade calibrado ni coincidencia de posición: el 2D no tiene que calzar con nada.
4. **El logo 3D va en desktop y en mobile.** Esto revierte la decisión previa de "sin 3D en mobile": la animación de scroll va a ser la misma en ambos, como en la referencia. **En este sprint solo se habilita la carga en mobile**; la coreografía se construye después.
5. **El mouse-follow no se usa.** El logo va a obedecer al scroll y a nada más. En este sprint no hace falta desactivarlo si eso implica tocar `HeroArtifact.tsx` (frozen) — si el follow vive ahí, se anota como pendiente para el sprint de coreografía.
6. **`logo-footprint.ts`:** al morir el handoff, la calibración 2D↔3D exacta deja de ser necesaria. Si se agregó una segunda calibración para canvas in-box solo para sostener el vuelo, revertila. Si sirve para el encuadre del 3D en su caja, dejala y documentá cuál es cuál y cuál manda.

## El trabajo

1. **Sacá el acople.** Buscá todo lo que exista para el handoff en `HomeIntro.tsx`, `HeroSection.tsx`, `HeroLogoSlot.tsx`, `LogoMark.tsx`, `HeroArtifactLayer.tsx`, `HeroCanvas.tsx` y `logo-footprint.ts`. **No borres archivos**: si alguno queda sin razón de ser, reportalo.

2. **Simplificá el preloader.** El logo se comporta como el resto del lockup: entra, se lee, sube y desaparece. Los tres parámetros de `HOME_INTRO_PHASES` (2.5 / 1.0 / 2.5) se conservan tal cual, con su derivación proporcional intacta.

3. **Habilitá el 3D en mobile.** Sacá el gate de 1024px de `HeroArtifactLayer` que impide pedir el chunk. **Reportá qué implica esto en peso y en riesgo**: cuánto se descarga en mobile y qué pasa si el dispositivo no rinde. Si el gate protege algo más que el breakpoint, decilo antes de sacarlo.

4. **Verificá que el 2D siga cumpliendo su rol nuevo:** visible desde el primer paint en ambos breakpoints, reemplazado por el 3D cuando carga, y único contenido si el 3D no llega nunca.

5. **Verificación y reporte.** `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\`, solo: **EXIT 0**. Lint limpio en lo tocado. Actualizá `docs/rediseno/outputs/S3-HERO.md` con una sección de cierre que registre el desacople, el cambio de rol del 2D, la habilitación del 3D en mobile con su costo, y **qué queda listo para el sprint de coreografía** (dónde vive el logo, qué lo monta, qué constantes lo gobiernan, y si el mouse-follow quedó vivo dentro del componente frozen).

🛑 **PARADA:** mostrá (a) `tsc`, (b) archivos tocados, (c) `git status`, (d) qué verificar en el navegador, y (e) el costo de habilitar el 3D en mobile. Esperá el OK.

Con el OK: staging archivo por archivo (nunca `git add .`), incluyendo **todo lo de S3 que sigue sin commitear** → `git commit -m "S3: preloader nuevo, hero de dos capas y enganche de scroll"` → `git push`.

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
2. **No construyas la coreografía del logo.** Este sprint desacopla y habilita; la animación de scroll es de otro sprint.
3. **No romper Route B ni `DotMatrix`.**
4. **No tocar `OurServices.tsx`** ni construir otras secciones.
5. **No borrar archivos.** Lo que quede huérfano se reporta.
6. **Todo lo que animes consume los tokens de motion de S2.**
7. **Cero `any`.** Cero `setState` por frame.
8. **No sumar dependencias.**
9. **Nada de base de datos.**
10. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
11. **No auto-confirmás que funciona porque compila.**

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S3b-desacople.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código, continuación de S3 (sin commitear).
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- No tocás archivos frozen ni OurServices.tsx.
- No construís la coreografía del logo: eso es de otro sprint.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá. No me confirmes el entendimiento.
```
