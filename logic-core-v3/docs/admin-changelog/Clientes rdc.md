# develOP — Clientes: registro de cambios (cierre de etapa)

Cierre del sector **Clientes** del panel admin (Logic Core v3): la sección `/admin/clients` \+ `/admin/tickets` \+ `/admin/messages`, trabajada en 3 sub-lanes paralelas, más la tanda de fixes posterior (avatar, city, notas, soft/hard-delete) sobre `main`. Repo: github.com/frc11/PorfolioDevelOP · app: `logic-core-v3/`. Fecha de cierre: 20 de junio de 2026\.

**Nota sobre hashes.** Los commits de la tanda de fixes están con su hash real. Los de las sub-lanes y el merge interno se listan por descripción (la auditoría de cierre los tiene); completar con `git log` si se necesita el hash exacto.

---

## 1\. Estructura del sector

Tres sub-lanes en worktrees aislados, todas desde `lane/clientes @ 3ba49df`, scopes de ruta disjuntos:

- **clients** (`lane/clientes-clients`) → `admin/clients/` \+ archivos de módulo con autorización.  
- **tickets** (`lane/clientes-tickets`) → `admin/tickets/`.  
- **messages** (`lane/clientes-messages`) → `admin/messages/`.

Merge interno limpio a `lane/clientes` (sin conflicto, scopes disjuntos), después `lane/clientes` → main. El merge a main auto-mergeó `AuditLogClient.tsx` sin conflicto (config-audit y clients tocaron secciones distintas del archivo).

---

## 2\. Lo realizado en las sub-lanes

**clients** (la de mayor footprint; editó archivos de módulo fuera de su ruta con autorización):

- Lista (search/filter/sort/pin/bulk), detail shell \+ nav de tabs, plan & billing, content tabs.  
- Tocó módulos cerrados (con autorización): `ChatbotManager` (sacó 3 botones redundantes \+ hover \+ limpió un `any`), `chatbots/new` (preselección por `?organizationId=`), el onboarding completo (`OnboardingWizard`, steps, `createClientOnly` \[nuevo\], `createClientWithBot`, `updateClient` \[nuevo\]), `AuditLogClient` (render de `metadata.reason`), `welcome-client.ts` (variante `withBot`).  
- Borró `BotPreview.tsx` de onboarding (verificado: sin referencias vivas tras el merge; los `BotPreview*` restantes son de otro módulo).  
- Helper nuevo `field-normalize.ts` (normalización website/whatsapp client+server).

**tickets** y **messages**: scopes propios, sin tocar módulos de otros. Solo consumieron `EmojiPickerPanel` (sin editarlo).

---

## 3\. Tanda de fixes (sobre main, post-merge)

Usó los campos de la migración aditiva a `Organization` (commit `988d1ae`: `city`, `avatarEmoji`, `avatarImageUrl`, `avatarInitials`, `internalNotes`, `deletedAt`).

| SHA | Tarea | Qué resolvió |
| :---- | :---- | :---- |
| `f5ccebc` | city | Persistir `city` (el form la capturaba pero la action no la guardaba) en alta \+ edición \+ display. |
| `ef97856` / `2c26930` | internalNotes | Notas internas reales (reemplazan el placeholder "Próximamente"). Editables en el editor **y** inline en el OverviewTab (action dedicada `updateClientInternalNotes` que toca solo ese campo, sin reescribir el User admin). |
| `5e33733` | toErrorMessage | Helper compartido que mapea `ZodError` a mensaje limpio; aplicado a `updateSettings` (que leakeaba el ZodError crudo — era un leak, no solo cosmético). |
| `3f1ad22` | soft-delete | Archivar cliente vía `deletedAt`. La lista filtra `deletedAt IS NULL` por defecto \+ toggle "Archivados" con Desarchivar. Semántica: archivar marca SOLO el Organization, no toca nada de lo que cuelga (reversible). |
| `e8c7ae0` | avatar | Avatar del cliente: `avatarEmoji` \+ uploader de imagen (base64 en DB, comprimida client-side \~200×200, sin infra externa) \+ `avatarInitials` editables a mano (máx 2, NO derivadas del nombre). En creador, editor, lista y detalle, con fallback imagen \> emoji \> iniciales \> neutro. Componentes `ClientAvatar`/`ClientAvatarField` en el módulo chatbot (compartidos wizard \+ app). |
| `59a22df` | hard-delete | Hard-delete de cliente (convive con Archivar en la barra de selección, solo con 1 seleccionado). `TypeToConfirmDialog` nuevo (exige tipear "ELIMINAR"). Opción C de cascade: preserva los `OsLead` del pipeline de ventas (sobreviven solos — `OsLead` no es org-owned, el FK está del lado de `Project`), borra lo propio del cliente. UNA entrada de audit `CLIENT_DELETED` con metadata rico expandible (qué se borró \+ qué se preservó). |

---

## 4\. Decisiones del humano tomadas en esta etapa

- **Eliminar cliente:** se implementaron AMBAS — soft-delete (Archivar, reversible, default) y hard-delete (Eliminar, irreversible, con confirmación por texto).  
- **Hard-delete cascade \= opción C:** preserva los leads de ventas (`OsLead` en el pipeline), borra lo propio (bot, proyectos, tickets, mensajes, assets, subscription). El mecanismo es automático por el schema (`OsLead` no es org-owned), sin paso de desvinculación.  
- **Avatar:** emoji \+ imagen (base64 client-side, sin Vercel) \+ iniciales editables a mano, máx 2, no derivadas del nombre.  
- **internalNotes:** editable inline en el OverviewTab \+ en el editor.

---

## 5\. Hallazgos clave de la etapa

- **`OsLead` NO es org-owned** (sin `organizationId`). El vínculo cliente↔lead es indirecto (vía `Project.osLeadId`) y `ChatbotLead.convertedToOsLeadId` es un string suelto, no un FK — decisión de diseño deliberada (el badge "Ya convertido" debe sobrevivir al borrado del OsLead, sin acoplar el módulo chatbot con una relación dura). Por eso el hard-delete preserva los leads automáticamente. (Guardado en memoria de CC: `oslead-not-org-owned`.)  
- **`AdminAuditLog` no cuelga del Organization** (`targetId`/`targetType` son strings planos, sin FK) → la entrada `CLIENT_DELETED` sobrevive a la cascada del borrado. Verificado por código.  
- **Drift preexistente de la setter-lane de Franco:** `OsLeadSetterMeta` \+ 2 índices \+ (luego) el enum `ActivityChannel`, vivos en la DB Neon pero NO en schema/migrations. Documentado, NO tocado. Cuando la lane de Franco mergee, su migración debe registrar esos objetos como ya-aplicados (`migrate resolve --applied`), no recrearlos — un `migrate dev` normal dispararía drift→reset. (Memoria de CC: `neon-phantom-drift-franco-setter`.)

---

## 6\. Deuda / pendiente

- **`AgencySettings @@unique`:** resuelto en esta etapa (campo `singleton Boolean @default(true) @unique`, commit `d14fcff`). Ya no es pendiente.  
- **Idea agendada (no implementada, en el Drive de features):** botón "Cerrar lead → convertir en cliente" con vínculo de ID duro (a diferencia del hard-delete). Es feature nueva — requiere relevamiento del flujo actual de conversión \+ decisión de schema (rompería la regla de no-acople) \+ state machine de "cerrado". Va con su propio relevamiento.  
- **Código muerto:** borrado en la limpieza final (el `deleteClientAction` hard-delete legacy \+ el cluster `client-*` \+ exports muertos de `client.actions.ts`, conservando el re-export de impersonation).

---

## 7\. Lecciones

- **La parada obligatoria salvó un borrado irreversible.** El hard-delete se diseñó sobre una premisa falsa (que había que "desvincular el OsLead seteando un FK a null"); CC paró al descubrir que `OsLead` no es org-owned y que el FK no existe. Construir un borrado irreversible sobre una premisa equivocada del modelo es exactamente lo que la parada previene.  
- **`migrate deploy`, no `migrate dev`, en una DB con drift.** El drift de Franco haría que `migrate dev` dispare reset. El camino seguro: escribir el `migration.sql` a mano y aplicarlo con `deploy` (que no introspecta).  
- **Confirmación destructiva por texto** (`TypeToConfirmDialog`, tipear "ELIMINAR") para acciones irreversibles, \+ audit que sobrevive al borrado (no cuelga del objeto borrado).  
- **Auto-merge limpio cuando los lados tocan secciones distintas del archivo** (`AuditLogClient`: config-audit en la maquinaria de filtros, clients en el render del reason → git los combinó sin conflicto). Verificar que ambas contribuciones quedaron, no asumirlo.
