# ORQUESTADOR · cola 2 (2026-10-23) · corrida desatendida con la API (v5)

Sos el orquestador de una corrida larga y desatendida sobre el home v3 de develOP: **la revisión completa de Valentino** (25 puntos + mobile) más la deuda técnica de la noche anterior. Valentino no está mirando: nadie va a contestar preguntas. Tu trabajo es coordinar, verificar e integrar. El código lo escriben subagentes, cada uno en su worktree.

Corrés con `claude -p` y una clave de API (créditos de la Console). **Si la corrida se corta** (por el tope de gasto o por cualquier cosa), Valentino la retoma después con su suscripción en una sesión nueva, que va a leer este archivo y **`ESTADO.md`**. Por eso `ESTADO.md` se mantiene al día en todo momento (§6).

## 0. Qué hay en esta carpeta (`docs/cola/2026-10-23/`)
- `00-ORQUESTADOR.md`: este archivo.
- `05-TEXTOS.md`: **todos los textos de cara al usuario**, ya escritos. Van tal cual.
- `06-COMUN.md`: **las reglas comunes**. Pasáselas literal a cada subagente, junto con su tarea y `05-TEXTOS.md`.
- `07-CAPTURAS.md`: el índice de las capturas. **Las imágenes (`capturas/loteN/NN.png`) NO se commitean** (pesan 37 MB): viven sin trackear en el checkout principal, `C:\rediseno-home\logic-core-v3\docs\cola\2026-10-23\capturas\`. Pasale esa ruta absoluta a cada subagente: puede abrir las imágenes con su herramienta de lectura.
- `08-REVISION-VERBATIM.md`: lo que escribió Valentino, palabra por palabra. **Ante cualquier duda de interpretación, manda este archivo.**
- Las tareas, una por archivo, autocontenidas:
  - `20-compartidos.md` (las piezas que usan todas), `21-navegacion-y-chat.md`, `22-contacto-general.md`;
  - `30-quienes-somos.md`, `31-cristal.md`;
  - `40-portfolio.md`, `41-demos.md`;
  - `50-servicios.md`, `51-recomendador.md`;
  - `60-panel.md`;
  - `70-resenas-cta.md`, `71-pie-faq.md`;
  - `80-login.md`, `81-preloader-y-movimiento.md`;
  - `90-cierre-tecnico.md` (al final, la hacés vos).

## 1. Preparación (antes de lanzar nada)
1. **El repo:** la raíz de git es `C:\rediseno-home` y la app vive en `logic-core-v3\`. Comprobalo con `git rev-parse --show-toplevel`. La rama base es `rediseno/home` (con el merge de la noche anterior, `ae039793` o posterior).
2. **Los worktrees van FUERA del repo**, en `C:\nocturno\2026-10-23\`:
   - integración: `git worktree add C:\nocturno\2026-10-23\integracion -b nocturno/2026-10-23 rediseno/home`;
   - cada tarea: `git worktree add C:\nocturno\2026-10-23\<id> -b nocturno/2026-10-23-<id> nocturno/2026-10-23` (desde la integración vigente).
   - **NO uses el aislamiento por worktree propio de Claude Code** (`isolation: worktree`): crea los worktrees dentro del repo y los basa en `main` (el sitio vivo). Creálos vos, con `git worktree add`, y pasale la ruta a cada subagente.
3. **La cola viaja con la rama:** el primer commit de `nocturno/2026-10-23` son los `.md` de esta carpeta (solo docs, por nombre; **sin `capturas/`**).
4. **Lo que no está en git:** copiá a la integración (sin commitear) los `.env*` de `logic-core-v3\` del principal. Compará `git status --ignored --porcelain` del principal con la integración para encontrar otros archivos sin trackear que hagan falta. No copies `lente.ts` salvo que haga falta para compilar.
5. **`node_modules`:** en la integración, `npm ci` real, una sola vez. En cada tarea, un junction al del principal: `powershell -NoProfile -Command "New-Item -ItemType Junction -Path node_modules -Target C:\rediseno-home\logic-core-v3\node_modules"` dentro de `logic-core-v3\` del worktree. Si el junction falla, el subagente solo escribe y commitea, y los chequeos los corrés vos en la integración.
6. **El disco:** ≥ 5 GB libres en C: antes de crear un worktree, de `npm ci` o del build. Como máximo, la integración y 3 worktrees de tarea vivos a la vez. Apenas integres y verifiques una tarea, borrá su worktree y su rama local mergeada. Si el disco baja de 3 GB, frená el dev, borrá `.next` y relanzalo.
7. **El turno pesado** (obligatorio para todos): `tsc`, ESLint de muchos archivos, las suites, el dev, Chrome, `verificar` y el build, DE A UNO en toda la máquina, con el candado `mkdir C:\nocturno\2026-10-23\.turno` (ver `06-COMUN.md`). Si un turno tiene más de 30 minutos y su dueño ya no existe, rompelo y anotalo.
8. **El puerto 3000** es tuyo: si hay otro proceso escuchando ahí al empezar, anotalo en `ESTADO.md` y usá el 3002 para tu dev (nunca el 3001, que es de servicios).
9. Creá `ESTADO.md` en `C:\nocturno\2026-10-23\` (fuera del repo) y en la integración (`docs/cola/2026-10-23/ESTADO.md`, commiteado) con el formato del §6.

## 2. Las ramas y la regla del merge (excepción SOLO para esta corrida)
- **Solo DENTRO de `nocturno/2026-10-23`** podés hacer `git merge` de las ramas de tarea. Nunca mergees en `rediseno/home`, `paginas/servicios` ni `main`. Nunca `push --force`. Valentino mergea `nocturno/2026-10-23` → `rediseno/home` a mano.
- El resto de las reglas duras, en `06-COMUN.md`, sigue igual.
- **Comandos denegados:** si el modo de permisos te niega un comando, NO lo reintentes igual: cambiá de camino en el acto.
  - si `git merge` está negado, `git cherry-pick` de los commits de la tarea;
  - si `git worktree add` está negado, seguí en serie: un subagente por vez trabajando directo en la integración, commiteando por tarea;
  - si algo no tiene alternativa, anotalo en `ESTADO.md` y seguí con otra tarea.

## 3. El orden y el paralelismo
Si dos tareas tocan el mismo archivo, van en serie. **Antes de lanzar cada tarea**, confirmá en el código qué archivos va a tocar y que no choque con algo en curso.

1. **Primero, la 20 (las piezas compartidas), sola.** Mientras corre, podés lanzar la **21** (navegación y chat) y la **31** (cristal), que no las usan.
2. **Después, hasta 3 subagentes escribiendo a la vez.** Los carriles, en serie por dentro:
   - **arriba:** 30 (Quiénes somos) → 40 (Portfolio) → 41 (Demos);
   - **medio:** 50 (Servicios) → 51 (recomendador) → 60 (Panel);
   - **cierre:** 70 (reseñas y CTA) → 71 (pie y FAQ);
   - **sueltas:** 21 → 22 (contacto) → 80 (login); 31 → 81 (preloader y movimiento).
3. **La prioridad**, para elegir qué lanzar cuando se libera un lugar: 20 · 21 · 40 · 50 · 70 · 41 · 60 · 71 · 51 · 80 · 22 · 30 · 31 · 81. La 90, al final.
4. **Las alturas:** 30, 40, 41, 50, 51, 60, 70 y 71 cambian altos de tramos del home y tocan `TRAMO_ESTIRADO`. **Sus merges a la integración van DE A UNO**, y después de cada uno volvé a medir la deriva de la escena en los anchos de la matriz y corregí la k antes del siguiente.
5. **Los modelos:** cada tarea dice el suyo. Lanzá cada subagente con ese modelo (`opus` o `sonnet`) pasando el parámetro `model` de la herramienta de agentes. Vos sos `opus`.

## 4. El ciclo de cada tarea
1. **Subagente**, en su worktree, con `06-COMUN.md` + su tarea + `05-TEXTOS.md` + la ruta de las capturas:
   - lee la skill, su tarea y el código existente antes de crear;
   - escribe el código y las pruebas sin navegador;
   - pasa el gate (lint, `tsc`, sus pruebas) dentro del turno;
   - commitea por nombre en su rama y termina con su reporte.
2. **Vos:** mergeás la rama en la integración y **verificás en el navegador**, de a UNA tarea por vez, con un solo dev desde la integración:
   - la prueba de la tarea en rojo sin el arreglo y en verde con él, con su control positivo;
   - los criterios medidos de su archivo, **a 1440, 1024, 768 y 390** (las fotos que pide cada tarea, guardadas en `C:\nocturno\2026-10-23\fotos\<id>\`);
   - **humo del home:** entrar con la rueda y con una ráfaga al Portfolio, ir a Demos y volver, a 1440 y a 390.
   - **"Visto andar en el navegador":** nada se da por bueno porque compila.
3. **Si la verificación falla:** devolvésela al subagente (o arreglala vos) con el fallo concreto. Dos intentos como máximo. Si no converge, revertí ese merge en la integración (con un commit `revert`, nunca con `reset`), anotalo y seguí.
4. **El dev y Chrome:** cerrá el Chrome de cada prueba al terminar. Si el dev pasa de 3,5 GB o lleva más de 6 verificaciones, reinicialo (cuidá la fuga de WebGL). Si un proceso muere por memoria, reintentá una vez partido a la mitad; si vuelve a caer, anotalo y seguí.
5. **Después de cada tarea integrada y verificada:** actualizá `ESTADO.md` y hacé `git push -u origin nocturno/2026-10-23` (push normal, nunca forzado). Así, si la corrida se corta, nada se pierde.

## 5. El gasto y los cortes
- La corrida tiene un tope de gasto. **Cuando falte poco** (si ves que el gasto se acerca al tope, o al llegar a ~80 % de las tareas lanzadas), **priorizá integrar y verificar lo que ya está escrito** antes de lanzar tareas nuevas.
- **El estado, siempre consistente:** la integración compila, cada merge está verificado o revertido, el turno nunca queda tomado, y `ESTADO.md` dice la verdad.

## 6. `ESTADO.md` (para retomar)
Un archivo corto, siempre al día, con:
- **la tabla de tareas:** id · estado (no empezada / escribiendo en `<worktree>` / en su rama sin integrar / integrada y verificada / revertida) · commits · lo que falta;
- **lo que está en curso** en este momento (qué subagente, en qué worktree);
- **cómo retomar:** "leé `00-ORQUESTADOR.md` y este archivo; seguí desde acá"; los worktrees vivos y qué hacer con cada uno;
- **las notas:** lo que se negó, lo que se rompió y lo que hay que avisarle a Valentino o a Franco.

## 7. El reporte final
Al terminar (o al quedarte sin presupuesto o sin tareas), hacé la 90 si llegás, y escribí `docs/cola/2026-10-23/REPORTE.md` en la integración, commiteado y pusheado. Lleva:
- **arriba de todo, el resumen en 10 líneas:** qué quedó integrado y verificado, qué no, y lo primero que tiene que mirar Valentino;
- **por tarea:** el estado, los commits y lo medido;
- **qué tiene que mirar Valentino**, por tarea: URL, ancho, acción y qué debería ver, más **las banderas para elegir** (`?titulo-servicio=`, `?fuente-servicio=`, `?grietas=centro|borde`, `?resenas=gatillo|scroll`, `?diagonal=`) y las que cambiaron de valor por defecto;
- **los avisos para Franco** (la prop `overrides` del chat, la newsletter sin nombre si pasó, cualquier cosa que toque el sitio vivo);
- **lo que no corrió** y por qué;
- **los comandos:** cómo mergear `nocturno/2026-10-23` → `rediseno/home` a mano y cómo borrar los worktrees.

## 8. Lo que NO es tuyo
No toques nada que no esté en la cola. Si ves algo roto fuera de la cola, anotalo en el reporte y seguí. La página base (`/v3/pagina-base`) y sus banderas (`?titulo=`, `?composicion=`, `?legibilidad=`) **no se tocan en esta corrida**: se tratan aparte.
