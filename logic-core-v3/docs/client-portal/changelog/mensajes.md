# Changelog — Mensajes (Portal Cliente)

> Sección `/dashboard/messages`. Conversación directa cliente ↔ equipo develOP.
> Estado: **cerrada y mergeada a main.**

---

## Qué se hizo

### Estética alineada al admin (D1)
- Panel de conversación con la misma estética del admin: header card
  ("develOP — Soporte" + ícono), banda "N mensajes en la conversación".
- Burbujas **izquierda/derecha por autor** (estilo WhatsApp): los mensajes del
  cliente van a la **derecha**, los de develOP a la **izquierda**.
  - Nota: esto **corrigió** una decisión previa ("todos a la izquierda como el
    admin"). Se cambió a L/R porque se entiende solo y es el patrón estándar de
    cualquier chat.
- Header de autor + fecha sobre cada burbuja.

### Altura fija real (página sin scroll, recuadro con scroll interno)
- La **página** de Mensajes NO scrollea. Todo entra en una pantalla.
- El **recuadro de mensajes** tiene altura fija y scrollea internamente cuando
  hay más mensajes de los que entran. Al abrir, arranca abajo (último mensaje).
- Mecanismo: `h-[calc(100dvh - Npx)]` sobre el contenedor de la página, cortando
  la dependencia de la cadena rota de `min-h-full`. La cadena interna
  (`section.flex-1.min-h-0.overflow-hidden` → `div.flex-1.min-h-0.overflow-y-auto`)
  propaga la altura. Header e input son `shrink-0`.
- El input puede expandirse hasta **3 renglones** (antes 4) sin aumentar la
  altura del componente que lo contiene.

### Word-break en palabras largas
- Palabras larguísimas sin espacios (`ssssss...`) ahora se cortan al borde de la
  burbuja en vez de desbordar. `break-words` (overflow-wrap: break-word) en el
  `<p>` del contenido. Aplicado en cliente Y en el admin de mensajes (cross-rol).

### Badge de presencia honesto
- Se eliminó el badge falso "EQUIPO EN LÍNEA" (no hay tracking de presencia real).
- Reemplazado por un pill estático "RESPONDEMOS EN < 4 HS" + "Lun–Vie 9–18hs".
  No se afirma presencia en tiempo real.

### Badge de no-leídos: desaparece al ABRIR
- El badge "N" de mensajes no leídos (en el sidebar) ahora desaparece al **abrir**
  la conversación, no al enviar un mensaje.
- Causa raíz: `unstable_cache` con tag `unread-messages:${orgId}` (TTL 30s) que no
  se invalidaba. Fix: server action `markClientMessagesRead` (en
  `_actions/mark-read.ts`) que hace el `updateMany` + `revalidateTag(...)` (Next 16:
  2 args), llamado desde `MarkReadOnMount` (useEffect + ref guard + router.refresh).
- Iteración: el primer intento dejaba el badge desaparecer una navegación tarde
  (entrar → salir → volver). Se corrigió revalidando lo que alimenta el badge del
  sidebar, no solo el tag de la query.

### Header de sección removido
- Se sacó el PageHeader ("Mensajes / Tu conversación directa..."). El header de la
  conversación pasó a estar arriba de todo. El espacio liberado lo ganó la lista
  de mensajes.

### Auto-scroll al enviar
- Al enviar, el chat scrollea al último mensaje (como WhatsApp). Esto se portó
  TAMBIÉN al chat de Mensajes del admin (cross-rol), que antes no lo hacía.

---

## Componente compartido (ver soporte.md)

El chat de Mensajes ahora usa el componente **`ClientChatThread`** + `ChatBubble`,
extraído de este mismo `MessageThread` (que era el más pulido). El molde se
comparte con el chat del Ticket del cliente — **datos separados, solo se comparte
la UI.** Detalle completo en `soporte.md`.

Invariantes conservados al extraer el componente: IME guard
(`!e.nativeEvent.isComposing`), auto-expand del textarea, emoji picker
(EmojiPopover + insertEmoji con posición de cursor), welcome message, quick-replies.

---

## Pendientes / a futuro

- **Botón "volver atrás"** en subpáginas (patrón global del admin) — diferido a la
  próxima ola, aplica a todas las secciones.

---

## Lecciones

- **L/R se entiende solo:** se cambió de "todos a la izquierda" a izquierda/derecha
  por autor. Cualquier chat funciona así.
- **El calc de viewport es la solución estructural** para el no-scroll, no recortar
  px a ciegas. El `N` exacto del `calc` puede necesitar un ajuste fino tras verlo en
  pantalla (es un cambio de un número, no un sprint).
- **El badge de no-leídos depende de revalidar lo que alimenta el sidebar**, no solo
  el tag de la query de mensajes. La revalidación de RSC en Next 16 es finicky.
