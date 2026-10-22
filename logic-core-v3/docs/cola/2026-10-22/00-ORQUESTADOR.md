# ORQUESTADOR · noche del 2026-10-22 · modo nocturno (corrida completa, v3)

Sos el orquestador de una noche de trabajo desatendido sobre el home v3 de develOP. Valentino duerme: nadie va a contestar preguntas. Tu trabajo es coordinar, verificar e integrar. El código lo escriben subagentes, cada uno en su worktree.

Leé primero la skill `.claude/skills/pagina-home-based/` (SKILL.md, GUSTO.md y METODO.md). Rige para vos y para cada subagente.

## 0. Qué hay en esta carpeta

`docs/cola/2026-10-22/` (en el worktree principal, sin trackear):
- `00-ORQUESTADOR.md`: este archivo;
- `10-T0-pendientes.md` y `11-T0-extra.md`: **T0**, lo que quedó de B12a.8 más los agregados de Valentino. El carrusel B1.2e (el Portfolio de menos de 1024) es una unidad aparte, **T0-B1.2e**;
- una tarea por archivo, autocontenida:
  - `20-B7-login.md`, `21-B6-panel.md`;
  - `30-B8-moire.md`, `31-B9-grietas.md`;
  - `40-B5-demos.md`;
  - `50-B4-servicios-y-viaje.md` (B4 y B12b, en dos entregas);
  - `60-B2B3-resenas-cta.md` (B2 y B3, en dos entregas), `61-B13-cierre.md`, `62-B10-faq.md`, `63-B11-chatbot.md`;
  - `70-B12c-preloader.md`.

La idea es hacer TODO esta noche. Si no alcanza, la prioridad del §3 decide qué queda afuera.

## 1. Preparación (antes de lanzar nada)

1. **El repo:** la raíz de git es `C:\rediseno-home` y la app vive en `logic-core-v3\`. Comprobalo con `git rev-parse --show-toplevel`.
2. **Los worktrees van FUERA de `C:\rediseno-home`.** Un worktree anidado dentro del árbol rompe el repo (está documentado en el `.gitignore`). Usá `C:\nocturno\2026-10-22\`:
   - integración: `git worktree add C:\nocturno\2026-10-22\integracion -b nocturno/2026-10-22 rediseno/home`;
   - cada tarea: `git worktree add C:\nocturno\2026-10-22\<id> -b nocturno/2026-10-22-<id> nocturno/2026-10-22` (desde la integración vigente).
   - **NO uses el aislamiento por worktree propio de Claude Code** (`isolation: worktree`): según su documentación, crea los worktrees en `.claude/worktrees/` dentro de la raíz del repo y los basa en la rama por defecto (`main`, el sitio vivo), no en la integración. Creálos vos acá, con `git worktree add`, y pasale la ruta a cada subagente.
3. **La cola viaja con la rama:** el primer commit de `nocturno/2026-10-22` son los archivos de `docs/cola/2026-10-22/` (solo docs). Así existen en todos los worktrees.
4. **Lo que no está en git y hace falta para correr:** copiá a la integración (sin commitear) los `.env*` de `logic-core-v3\` del principal. Antes, compará `git status --ignored --porcelain` del principal con la integración para encontrar otros archivos sin trackear que el dev o los tests necesiten. Si tracked code importa algo sin trackear, anotalo en el reporte. No copies `lente.ts` salvo que haga falta para compilar.
5. **`node_modules`:**
   - **integración** (desde donde corre el dev): `npm ci` real, una sola vez. Turbopack no sigue bien los enlaces fuera de la raíz del proyecto;
   - **tareas** (solo lint, tsc y tests sin navegador): un junction al del principal, con `powershell -NoProfile -Command "New-Item -ItemType Junction -Path node_modules -Target C:\rediseno-home\logic-core-v3\node_modules"` dentro de `logic-core-v3\` del worktree. Si el junction no se puede crear o falla, el subagente NO corre chequeos: solo escribe y commitea, y los chequeos (lint, tsc y tests) los corrés vos en la integración después del merge. No corras `npm ci` en cada tarea (disco).
6. **El disco (C: tiene poco espacio libre).**
   - Antes de crear un worktree, de `npm ci` o del build: ≥ 5 GB libres en C:. Si no hay, esperá a que se libere (sacando worktrees ya integrados) y anotalo.
   - Como máximo, la integración y 3 worktrees de tarea vivos a la vez.
   - Apenas integres y verifiques una tarea, borrá su worktree (`git worktree remove`) y su rama local si ya está mergeada.
   - El dev de la integración genera `.next` grande: si el disco baja de 3 GB, frená el dev, borrá `.next` y relanzalo.
7. **El turno pesado (obligatorio para todos).** `tsc` (con 4 GB de heap), ESLint de muchos archivos, las suites de tests, el dev, Chrome, `verificar` y el build se corren DE A UNO en toda la máquina. Usá un candado de carpeta:
   - para tomarlo, `mkdir C:\nocturno\2026-10-22\.turno` (si falla, está tomado: esperá 20 s y reintentá);
   - adentro, un archivo `dueno.txt` con quién lo tiene y desde cuándo;
   - al terminar, borrá la carpeta. Si un turno tiene más de 30 minutos y su dueño ya no existe, rompelo y anotalo;
   - además, ≥ 3 GB libres antes de tomarlo.

   Pasale estas instrucciones, literal, a cada subagente.

## 2. Las ramas y la regla del merge (excepción SOLO para esta noche)

- **Excepción a las reglas duras:** solo esta noche, y solo DENTRO de la rama `nocturno/2026-10-22`, podés hacer `git merge` de las ramas de tarea (`nocturno/2026-10-22-<id>`). Nunca mergees nada en `rediseno/home`, `paginas/servicios` ni `main`. Nunca hagas `push --force`. A la mañana, Valentino mergea `nocturno/2026-10-22` → `rediseno/home` a mano.
- El resto de las reglas duras sigue igual:
  - nunca `git add .`;
  - frozen intactos (`HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `schema.prisma`, `auth.ts`, `lib/prisma.ts`, `src/components/ui/*`);
  - cero `any`, nunca `router.push`, nunca `prisma migrate reset`, sin secretos;
  - sin debilitar tests, zonas de Franco intactas, nunca llamar `/api/` real;
  - no toques `C:\paginas-servicios` ni el puerto 3001.
- **Comandos denegados (importante):** si el modo de permisos te niega un comando, NO lo reintentes igual. Tres negaciones seguidas pausan el modo automático y la sesión se queda esperando a un humano toda la noche. Cambiá de camino en el acto:
  - si `git merge` está negado, probá `git cherry-pick` de los commits de la tarea;
  - si `git worktree add` está negado, seguí en serie: un subagente por vez trabajando directo en la integración, commiteando por tarea;
  - si algo no tiene alternativa, anotalo y seguí con otra tarea.
  Lo mismo vale para los subagentes: pasales esta regla.

## 3. El orden y el paralelismo

Los archivos que toca cada tarea deciden qué va en paralelo. Si dos tareas tocan el mismo archivo, van en serie.

1. **T0, sola y primero** (10 + 11, sin el carrusel). Toca la escena, el layout, la navbar y la página base: el núcleo de todo. Hasta que esté integrada y verificada, no arranca nada que toque la escena ni el layout. Mientras corre T0, sí podés lanzar las tareas que NO tocan la escena ni el layout (B7 y B6), para que escriban en paralelo; se integran después de T0.
2. **Después, hasta 3 subagentes escribiendo a la vez** (lo pesado de cada uno pasa por el turno). Los carriles, cada uno en serie por dentro:
   - **cierre:** B2 → B3 → B13 → B10;
   - **servicios:** B4 → B12b;
   - **DOM:** B7 → B6 → B11;
   - **cristal:** B8 → B9;
   - **sueltas:** T0-B1.2e (el carrusel), B5 (demos) y B12c (el preloader, que toca el layout; va después de T0).
3. **La prioridad**, para elegir qué lanzar cuando se libera un lugar: B4 · B2 · B3 · T0-B1.2e · B13 · B12c · B12b · B5 · B7 · B6 · B8 · B9 · B10 · B11.
4. **Las entregas parciales:** B4 + B12b y B2 + B3 se entregan en dos commits que se pueden integrar por separado (primero B4 y primero B2). Integrá cada entrega apenas esté, sin esperar la otra mitad.
5. **Las alturas:** B2, B3, B4, B5, B6 y el carrusel cambian altos de tramos del home y tocan `TRAMO_ESTIRADO`. Sus merges a la integración van DE A UNO. Después de cada uno, volvé a medir la deriva de la escena en los anchos de la matriz y corregí la k antes del siguiente merge.
6. **Las dependencias que cruzan carriles:**
   - B9 deja un disparador de las grietas (una función o señal) y su prueba. Los enganches son de quien llega segundo: el del home, en el momento en que el título se vuelve el CTA (B3); el de las páginas, cuando termina de entrar el título 3D (T0). Si B9 llega antes que B3, el enganche del home lo hace B3, o vos al integrar.
   - B13 reusa la transformación del título al CTA de B3. B10 nace del pie de B13.
   - B12b sale de los CTA de B4.
7. **Antes de lanzar cada tarea**, confirmá en su archivo y en el código qué archivos va a tocar. Si choca con algo en curso, esperá o lanzá otra.

## 4. El ciclo de cada tarea

1. **Subagente** (lanzalo con el modelo **opus** y el esfuerzo **xhigh** si la herramienta de agentes lo permite; si no, hereda el tuyo), en su worktree:
   - lee la skill y su archivo de tarea, y lee el código existente antes de crear;
   - escribe el código y las pruebas sin navegador;
   - pasa lint de lo tocado, `tsc --noEmit` sin errores nuevos y sus pruebas, todo dentro del turno pesado;
   - commitea por nombre en su rama.

   NO levanta un dev ni un Chrome. Termina con un reporte: qué hizo, qué archivos tocó, qué falta verificar en el navegador y sus banderas.
2. **Orquestador:** mergea la rama de la tarea en la integración y verifica en el navegador, de a UNA tarea por vez, con un solo dev en `:3000` desde la integración:
   - la prueba de la tarea en rojo con el defecto o sin la función, y en verde con ella, con su control positivo;
   - los criterios medidos de su archivo;
   - **humo del home:** un subconjunto corto de la matriz del Portfolio (entrar con la rueda y con una ráfaga, ir a Demos y volver, a 1440 y a 390). Las matrices completas y `verificar`, solo después de T0 y al final de la noche.
3. **Si la verificación falla:** devolvé la tarea al subagente (o arreglala vos) con el fallo concreto. Dos intentos como máximo. Si no converge, revertí ese merge en la integración (con un commit `revert`, nunca con `reset`), anotalo y seguí.
4. **El dev y el Chrome:**
   - al terminar cada verificación, cerrá el Chrome de la prueba;
   - si el dev pasa de 3,5 GB o lleva más de 6 verificaciones, reinicialo (cuidá la fuga de WebGL en el pool no paginado);
   - si un proceso muere por memoria, reintentá una vez partido a la mitad y, si vuelve a caer, anotalo y seguí.
5. **`next build`:** uno solo, al final, sobre la integración, dentro del turno. De ahí salen los números de costo por cuadro del reporte.

## 5. La cuota y los cortes

- Si se corta por la cuota de 5 horas, Claude Code retoma solo. Al volver, leé el estado de `nocturno/2026-10-22` y de los worktrees, y seguí sin repetir lo integrado.
- Si se acerca el límite, priorizá **integrar y verificar lo que ya está escrito** antes de lanzar tareas nuevas.
- El estado siempre consistente: la integración compila, cada merge está verificado o revertido, y el turno pesado nunca queda tomado por nadie.

## 6. El reporte de la mañana

Al terminar, o al quedarte sin cuota o sin tareas, escribí `docs/cola/2026-10-22/REPORTE.md` en la integración, commiteado y pusheado (`git push -u origin nocturno/2026-10-22`). Lleva:
- **arriba de todo**, el resumen en 10 líneas: qué quedó integrado y verificado, qué no, y lo primero que tiene que mirar Valentino;
- **por tarea:** el estado (integrada y verificada / integrada sin verificar / revertida / a medias en su rama / no empezada), los commits y lo que se midió;
- **qué tiene que mirar Valentino:** por tarea, URL, ancho, acción y qué debería ver, más las banderas para elegir:
  - `?titulo=`, `?composicion=`, `?navbar=`, `?legibilidad=`;
  - `?moire=`, `?grietas=`, `?grupo=`, `?diagonal=`, `?servicios-movil=`, `?resenas=`;
- **lo que no corrió** y por qué;
- **los comandos para la mañana:** cómo mergear `nocturno/2026-10-22` → `rediseno/home` a mano y cómo borrar los worktrees de `C:\nocturno\2026-10-22\`.

Limpieza: a esta altura, los worktrees de las tareas integradas ya tendrían que estar borrados (§1.6). Los que queden con trabajo sin integrar, no los borres: listalos en el reporte. La integración queda, para que Valentino la mire.

## 7. Lo que NO es tuyo esta noche

No toques nada que no esté en la cola. Si ves algo roto fuera de la cola, anotalo en el reporte y seguí.
