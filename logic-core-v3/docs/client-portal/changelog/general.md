# Changelog — General (Portal Cliente)

> Cambios que no pertenecen a una sola sección: **Notificaciones** (chrome),
> **cambios cross-rol en el admin**, y notas de proceso/metodología de la ola.
> Estado: **todo cerrado y mergeado a main.**

---

## NOTIFICACIONES (chrome del portal)

### El panel no se veía (fix)
- En todas las páginas, el panel de la campanita no se veía al desplegarse.
- Causa: el `position:fixed` del panel quedaba atrapado por un containing block
  creado por `backdrop-filter` en un ancestro del layout (la trampa de siempre).
- Fix: portalear el `NotificationCenter` a `document.body` para escapar el
  containing block (mismo patrón que los popovers/modales que ya funcionaban).
- Regla del proyecto reafirmada: el `backdrop-blur` va en un elemento hermano, NO
  en `<main>`, para no atrapar descendientes fixed.

### Modal de historial completo
- El "Ver todas las notificaciones" abre un modal (portaleado a body) con el
  historial COMPLETO, scroll interno, cada notif con estado (leída/no leída), tipo,
  fecha y link de acción.
- Archivos: `NotificationCenter.tsx`, `NotificationHistoryModal.tsx`,
  `notification-shared.tsx`, `lib/actions/notifications.ts`.

### Seed de notificaciones de prueba (Matsu)
- `scripts/seed-matsu-notifications.ts`: ~24 notifs, 11 no leídas (para ver el
  badge "9+"), timestamps de ~1.5h a ~42 días (ejercita timeAgo).
- Idempotente, guard que aborta si no es DB dev / si no existe Matsu, marcador
  `[seed:matsu-notif]`, `--clean` revierte. Drift de Franco intacto.
- **Lo corre Valentino**: `npx tsx scripts/seed-matsu-notifications.ts`.

---

## CAMBIOS CROSS-ROL EN EL ADMIN

> Cambios en `/admin/*` hechos para mantener paridad o portar comportamiento del
> cliente. El admin es REFERENCIA — se tocó solo lo necesario, sin cambiar lógica.

### Admin Tickets
- **Badges** de prioridad (pulse en URGENT) + categoría en la lista y el detalle
  (paridad con el cliente).
- **Input unificado**: el composer del chat del ticket admin se alineó al del
  cliente (emoji + textarea + enviar en una fila), zona de chat ampliada hacia
  abajo.
- **Enter envía** (Shift+Enter = salto de línea), con IME guard
  (`!e.nativeEvent.isComposing`). Antes Enter no enviaba.
- **Auto-scroll al enviar**: el chat baja al último mensaje tras enviar (paridad
  con el cliente).
- **Toggle de estado** centrado verticalmente en el header (estaba desalineado).

### Admin Messages
- **Word-break** en las burbujas (`message-bubble.tsx`): palabras largas se cortan
  en vez de desbordar.
- **Auto-scroll al enviar** (`message-thread.tsx` + `MessagesScrollAnchor.tsx` con
  prop `scrollTrigger`, backward-compatible).

---

## PROCESO Y METODOLOGÍA (notas de la ola)

### Estructura de lanes
- Dos olas de lanes en worktrees aislados:
  - **Ola 1**: chatbot (config) · soporte · mensajes → mergeada (orden 7→6→3).
  - **Ola 2 (post-merge)**: chatbot-views · chat-compartido · notif → mergeada
    (orden notif→chat→views).
- Worktrees flat siblings (C:\lane-X), uno por lane. Cada uno con su chat de control
  en claude.ai.

### Aislamiento por archivos
- Antes de paralelizar y antes de mergear: `git diff main --name-only` de cada
  worktree para confirmar cero cruces. Es lo que evitó conflictos.
- Cruce real detectado y resuelto en Ola 1: Lane 6 y Lane 7 tocaron ambos
  `MessageThread.tsx` (badge de presencia duplicado) → revert en Lane 6, el cambio
  quedó en Lane 7.

### Merges
- Los hace Valentino a mano, comando por comando. `git merge --no-edit` para que
  Vim no se trabe. `tsc` por separado entre cada merge (NO encadenado con
  `Remove-Item .next` por `;`, que corta la cadena si `.next` no existe y el tsc no
  llega a correr).
- Tras mergear, si tsc tira errores en `.next/` → caché stale → borrar `.next` y
  recorrer.

---

## LECCIONES DURAS (de esta ola)

- **CC ensució main 3 veces** dejando cambios en el working tree de main "para ver
  por HMR". Cada super-prompt ahora lleva: "NO modificar nada en C:\PorfolioDevelOP,
  trabajás SOLO en tu worktree, verificás desde el worktree". Si pasa: `git restore`
  el archivo (el trabajo real está commiteado en la lane).
- **Lío de Vim en el merge**: el editor se abrió esperando el mensaje de merge,
  encontró un `.swp` huérfano, y dejó `MERGE_HEAD` colgado. Solución: `--no-edit`
  siempre, y limpiar `.git/.MERGE_MSG.swp` si aparece.
- **Fast-forward no muestra commit de merge** en el log → no asumir que "falta un
  merge" sin verificar con `git log -- <archivo>` o `git branch --merged main`.
- **El `;` de PowerShell sigue aunque un comando falle** → no encadenar el tsc con
  un Remove-Item que puede fallar; correrlo por separado.
- **Worktrees no comparten `node_modules` ni `.env.local`** (gitignorados). Cada
  worktree nuevo: copiar `.env.local` + `vertex-credentials.json` + `npm install`.
  Si no: "next no se reconoce" / creds fallan.
- **Los merges no se delegan a CC.** Son integración sobre main, los hace un humano
  viendo cada paso. Un agente autónomo ante un conflicto o un Vim colgado improvisa
  sobre main. CC es para construir dentro de un lane aislado, no para integrar.
- **Los seeds los corre Valentino**, no CC (igual que las migraciones): read-first,
  devuelven PLAN, idempotentes, con guard.

---

## PENDIENTE GLOBAL (próxima ola)

- **Botón "volver atrás"** en subpáginas de cada sección (patrón del admin) — aplica
  a todas las secciones con subpáginas. Diferido a un chat/lane propio.
- **Secciones aún sin trabajar**: Inicio, Mi proyecto, Resultados, Mis servicios,
  Mi plan, Mi cuenta.

---

## ESTADO DE LAS 9 SECCIONES (snapshot)

| Sección          | Estado                  |
|------------------|-------------------------|
| Mensajes         | ✅ cerrada y mergeada    |
| Chatbot          | ✅ cerrada y mergeada    |
| Soporte          | ✅ cerrada y mergeada    |
| (Chat compartido)| ✅ transversal, mergeado |
| (Notificaciones) | ✅ chrome, mergeado      |
| Inicio           | ⬜ sin trabajar          |
| Mi proyecto      | ⬜ sin trabajar          |
| Resultados       | ⬜ sin trabajar          |
| Mis servicios    | ⬜ sin trabajar          |
| Mi plan          | ⬜ sin trabajar          |
| Mi cuenta        | ⬜ sin trabajar          |
