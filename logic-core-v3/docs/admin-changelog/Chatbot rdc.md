# develOP — Dashboard (sección Chatbot): registro de cambios (cierre de etapa)

Cierre del frente **dashboard / panel admin del chatbot** (Logic Core v3). Documenta lo realizado, lo revertido, la deuda y las lecciones, para retomar con contexto. **Repo:** github.com/frc11/PorfolioDevelOP · **app:** logic-core-v3/ · **módulo:** src/modules/chatbot/ (componentes admin en components/admin/, server en server/admin/). **Fecha de cierre:** 12 de junio de 2026\.

**Nota sobre hashes:** este registro lista los commits por su **mensaje**. Para completar los hashes, correr `git log --oneline` desde el cierre del frente del widget hasta HEAD y mapear contra la lista de §6.

---

## 1\. Panel de configuración del bot (admin) — bugs y UX

Página: `/admin/chatbots/[botId]` (tab Configuración) → `BotConfigEditor.tsx`, con 5 tabs (Identidad, Apariencia, Estilo, Comportamiento, Avanzado). El editor vive dentro del `<main>` del admin (`AdminLayoutClient.tsx`), que tiene `overflow-y-auto` \+ `backdrop-blur-md` — **trampa conocida**: el `backdrop-filter` convierte a `<main>` en el containing block de todo `position:fixed` descendiente, así que los `fixed` se anclan a `<main>` (no al viewport) y scrollean con el contenido. Solución house: portal a `document.body` con `useIsClient` \+ `createPortal`.

### Casing de enums DB↔form (bloqueante del guardado)

- **Bug:** guardar la config tiraba `invalid_enum_value` de Zod en `intensityLevel` (recibía `MEDIUM`) y `llmProvider` (recibía `GOOGLE`). La DB guarda enums UPPERCASE; el form/Zod esperaba lowercase.  
- **Causa raíz:** el write-path estaba bien (Zod `z.enum([...lower]).transform(toUpperCase)`), pero el read-path nunca bajaba a lowercase, y el tipo del estado/parámetro salía del **output** post-`transform` (`z.infer`, UPPERCASE) en vez del **input**. Compilaba, explotaba en runtime. Disparador: cambiar cualquier campo y guardar → los enums no tocados viajaban UPPERCASE de la DB.  
- **Fix:** `BotConfigInput` redefinido con override acotado (`Omit<z.infer<...>, 'intensityLevel'|'llmProvider'> & { ...lowercase }`) en `saveBotConfig.ts` y `saveBotConfigByOrgSlug.ts`; lowercase en el read-path (`ConfigTab.tsx`) con cast preciso al union. Write-path intacto. No se tocó `schema.prisma` (frozen; los enums quedan UPPERCASE).

### Barra "Tenés cambios sin guardar"

- Estaba `fixed bottom-6 left-1/2` → atrapada por el `<main>` (scrolleaba con el contenido en vez de quedar fija). Se movió **inline al header** del editor, junto al título — sin `fixed`, así esquiva el trap.

### Modal "Confirmar cambios" \+ ActivationModal

- El overlay `fixed inset-0` quedaba atrapado por `<main>`: no cubría todo al scrollear y el diálogo se descentraba. Se **portalearon a `document.body`** (`createPortal` \+ `useIsClient` gate, `AnimatePresence` adentro del portal, `z-[200]`). Mismo tratamiento a `ActivationModal`.

### Toggle "Bot activo" redundante → unificado en el header

- Había dos controles para `isActive`: el toggle en Identidad y el botón "Pausar bot" del header. El toggle tenía dos cosas que el header no: **confirmación** (regla del repo: acciones destructivas) y **preflight checks** (`ActivationModal`, verifica config completa antes de ir live).  
- **Fix:** eliminado el toggle de Identidad; `isActive` sacado del schema Zod / diff / initial state (guardar config ya no toca el estado del bot). El header quedó como único control: **activar** dispara la `ActivationModal` con preflight; **pausar** pide confirmación; ambos con toast. La preview lee `isActive` del initial prop.

### Layout "Nuevo chatbot" angosto

- La página de creación dejaba el form en una columna angosta con una franja vacía enorme a la derecha. Se ensanchó a un ancho coherente con el resto del admin.

### "Test endpoint" → modal útil (antes 405\)

- El botón era un `<Link href="/api/chatbot/[slug]/chat" target="_blank">` → navegación **GET** del browser a un endpoint **POST-only** → `HTTP 405`.  
- **Fix:** convertido en **modal** (`TestEndpointModal` en `BotDetailClient.tsx`, reusa el patrón de portal del `showPauseConfirm`) con URL, método, headers y un **curl copiable** con el body real del route handler (`messages[]`, `sessionId`, opcionales). Auth por `Origin` contra `allowedDomains` (no token): el curl usa el dominio real del bot si hay `allowedDomains`, y el header `Origin` matchea la URL para que sea copiar-pegar-ejecutar.

### "Test email" → no estaba roto, estaba apagado \+ hardening

- **Diagnóstico:** la infra existe (Resend ^6.9.4, helper `sendLeadNotificationEmail`, action `sendTestNotification.ts` ya implementada). El botón estaba `disabled` porque la org no tenía cargado el "Email de notificaciones" (tab Avanzado, persiste en `Organization`). Un botón disabled se traga el click sin explicar → "no hace nada".  
- **Hardening aplicado (espeja `testCrmConnection.ts`):** rate-limit `testNotificationPerAdmin` (3/min por admin), `dashboardUrl` de hardcodeada a `NEXT_PUBLIC_APP_URL`, datos reales de la org/bot en el mail de prueba (usa el `orgSlug` que recibía y nunca usaba), tooltip explicativo en el disabled (wrapper `<span>`, indica ir a "tab Avanzado → Email de notificaciones"), error de Zod genérico (antes exponía `parsed.error.message` crudo), audit log (`EMAIL_SENT`). Mensaje "RESEND\_API\_KEY no configurada" visible solo al SUPER\_ADMIN.

### Preview sticky (panel "Lo que ve el visitante")

- Estado final: **sticky, centrada verticalmente, tamaño natural** (`lg:sticky lg:top-6 lg:h-[calc(100dvh-10.625rem)] lg:flex lg:items-center lg:justify-center` en el `<aside>`). Causa original del "queda pegada arriba": `self-start` colapsaba la columna al alto del contenido. Ver §4 (revertidos) por el detalle de las iteraciones que se descartaron.

---

## 2\. Componente `Select` compartido (UI)

`src/components/ui/Select.tsx` — primitiva usada en \~26 archivos del admin/dashboard (42 usos).

### Chevron custom \+ migración

- Los `<select>` usaban el chevron nativo pegado al borde. Se hizo `appearance-none` \+ `ChevronDown` (lucide, `strokeWidth={1.5}`) posicionado con `pr-10` (último en el `cn()` → gana por twMerge last-wins). Se migraron 21 selects inline en 15 archivos al componente; se borró un `Select.tsx` muerto duplicado en `config/`. Special cases fuera: `ticket-chat.tsx` (spinner condicional donde iría el chevron), `TicketStatusSelector.tsx`.

### `color-scheme: dark` para el popup nativo

- La lista desplegada nativa salía con fondo blanco del OS \+ texto gris ilegible. `[color-scheme:dark]` hace que Chrome/Edge rendericen el popup en oscuro.

### Listbox custom con estética develOP

- El popup nativo (cuadrado, highlight azul OS) no se puede estilar. Se reemplazó por un **listbox custom**: trigger `<button>`, panel propio (glass, rounded, animado), manteniendo un **`<select>` nativo oculto y sincronizado** (vía `dispatchEvent('change')`) para preservar la firma `event.target.value` y FormData → **cero cambios en los 42 call sites, cero `any`**.  
- Verificado contra react-dom 19.2.3: los `<select>` no pasan por el value-tracker, así que el dispatch dispara el `onChange` sintético correctamente.  
- Portal a `document.body` (por el trap del `backdrop-filter`), flip-up cerca del borde, close-on-scroll con filtro `panelRef.contains` \+ `overscroll-contain`, teclado completo (flechas con clamp, Home/End, Enter/Space, Esc reenfoca trigger, Tab cierra), `aria-activedescendant`, type-ahead. Nuevo hook local `src/lib/use-is-client.ts`.  
- Ejecutado con **checkpoint humano tras el paso 3** (select oculto \+ trigger, sin panel) para validar cerrado-idéntico \+ submit FormData antes de construir el listbox.

---

## 3\. Emoji picker tipo WhatsApp

Campo "Emoji del avatar" (cuando `avatarStyle === 'emoji'`): era un `<Input>` de texto, imposible de usar con teclado de PC.

- **Dependencia nueva aprobada:** `emoji-picker-react@4.19.1` (pin exacto, `--save-exact`), 74.6KB gzip, **lazy-load admin-only** vía `dynamic(ssr:false)` — un solo archivo (`EmojiPickerPanel.tsx`) importa la lib para no arrastrar los enums runtime al chunk principal. **0KB en el widget público y en el First Load del admin.**  
- `emojiStyle="native"` (sin CDN, WYSIWYG), `theme=DARK`, search/categorías/skin-tones built-in, theming por CSS vars `--epr-*` inline.  
- **Guard `max(8)`** (UTF-16 units, espeja `z.string().max(8)` del server): emojis ZWJ complejos (familia \= 11 units) tiran toast en vez de guardar basura; nunca trunca.  
- Panel portaleado a body (patrón Select), `EmojiPickerField.tsx` como trigger. Issues conocidos de la lib mitigados: \#475 (grid vacío en prod → pin exacto \+ verificación obligatoria en `build && start`), \#325 (search solo inglés → placeholder "Buscar (en inglés)").

---

## 4\. Colores del widget (paridad config ↔ widget real)

Patrón recurrente del frente: campos de estilo que se guardaban y viajaban al cliente vía `PublicBotConfig`, pero el **widget real nunca los consumía** (la preview del admin sí). En varios casos el componente "real" era markup inline con color hardcodeado, mientras existía un componente exportado pero **muerto** (sin montar).

- **`chatSurfaceTint`:** campo fantasma; el fondo del panel estaba hardcodeado en `ChatWindow.tsx`. Cableado al widget con la fórmula de la preview (tint \+ alpha por `intensityLevel`), fallback al gradient actual con tint null.  
- **`accentColor`:** burbuja del user, typing dots, borde assistant y glow estaban en cyan hardcodeado. Cableados a `accentColor` con paridad a la preview; fallback cyan si null.  
- **`accentSecondary`:** caso (b) — nadie lo consumía. Se aplicó a **chips** (`fondo + borde + texto`) y al **glow** del panel. `QuickReplyChips.tsx` estaba **muerto** (los chips reales eran markup inline en `ChatWindow.tsx`); el fix aterrizó primero ahí por error y hubo que redirigir. Calibración con knobs nombrados (`CHIP_BG_ALPHA`, `CHIP_BORDER_ALPHA`, `GLOW_OPACITY`, `GLOW_RADIUS`). Dato técnico: el glow (box-shadow outset) **no se clippea** por `overflow:hidden` ni se tapa por el tint — el "no se veía" era perceptivo (0.06 era demasiado tenue), se subió a 0.14/90px. Paridad: se agregó glow a la preview (opción a) para WYSIWYG.

**Pendiente fichado:** botón enviar, `Sparkles` del empty-state y `thinkPulse` siguen en cyan hardcodeado ignorando el accent. Mismo patrón — candidato a un sprint consolidado que cablee todo el widget al accent de una.

---

## 5\. Avatar del bot (React Three Fiber)

### Orbe Neural — sin cuadrado, glow sin post-processing, tamaño calibrado

- **Bug:** el avatar mostraba un cuadrado oscuro recortado detrás de las partículas (header, launcher, card del picker) y se veía chico.  
- **Causa:** el cuadrado lo introducía el `EffectComposer`/bloom pass (inflaba el alfa del canvas), no el background ni el CSS. Un primer intento (`TransparentBloomEffect`, emitir alfa 0 desde el fragment) no alcanzó.  
- **Plan B aplicado:** sacar el `EffectComposer`/bloom; canvas 100% transparente real; **glow "fingido"** sin post-processing (additive blending / sprite). Recalibrado `fillScale`/`coreScale`/`PARTICLE_SCALE` para que ningún estado (idle/pensando/hablando) corte partículas contra el borde. Se mantuvo el `dispose()` en unmount agregado en el intento previo (era un **leak de render targets** real). Archivos: `NeuroAvatar.tsx`, `ParticleSphere.tsx`, `types.ts`, `registry.ts`.

---

## 6\. Modo offline del widget (degradado)

- Con el bot pausado/desactivado, el widget mostraba el card "Te seguimos por WhatsApp" (correcto) pero **además** el saludo inicial, los quick replies y el teaser — e incluso un click en un chip escribía en el input.  
- **Fix:** gate por `degraded` — `messages.length === 0 && !degraded` para el empty state, `!degraded` en quick replies (`ChatWindow.tsx`), `!chatbot.degradedInfo` en `ProactiveTooltip` (`LogicCompanion.tsx`). Offline → solo el card de WhatsApp.

---

## 7\. Auditoría y coherencia de datos (Industria / Tono)

Auditoría read-only para definir si los campos eran "humo": ambos resultaron **PARCIAL**.

- **Tono:** el cableado es real (`formatTone` → system prompt de Gemini), pero el Select ofrecía 7 tonos y solo 3 estaban mapeados (`informal_rioplatense`, `formal`, `neutral`); los otros 4 caían en silencio al fallback. **Fix:** Select recortado a los 3 reales. (Roadmap: extender `formatTone` con los 4 faltantes — pendiente, decisión de producto.)  
- **Industria:** real solo **al crear** el bot (seedea KB \+ quick replies) y en los insights del dashboard; el pipeline de chat no la lee, y editarla post-creación no re-seedea nada. Hallazgo grave: el Select de edición usaba un vocabulario (18 valores: `medical`, `gym`, `real_estate`...) **incompatible** con el canónico de templates (10 valores: `medico_odontologico`, `gimnasio`, `inmobiliaria`...), con dos "genéricos" (`generic` vs `generico`) conviviendo. `industry` es `String` (no enum) → no toca frozen.  
  - **Fix:** Select de edición derivado de `INDUSTRIES_LABELS` (vocabulario canónico único); hint honesto ("Se usó para preparar el bot al crearlo. Cambiarla no regenera la KB."); `seed.ts` `agency`→`generico`; update puntual de datos (no `migrate reset`): `sanmiguel` `automotive`→`concesionaria`, `develop` `agency`→`generico` (2 huérfanos en DB, los otros 2 bots ya canónicos).  
  - **Roadmap:** agregar "agencia" al vocabulario canónico \+ su KB template; decidir si Industria editable re-seedea (con confirmación) o se vuelve read-only.

---

## 8\. Roadmap P0 (ejecutado por Franco, integrado en este frente)

Tres sprints corridos en autónomo, integrados y commiteados como parte del cierre.

- **P0.2 — Análisis mensual:** tab nueva dentro de `/dashboard/resultados/analisis` (no ruta de primer nivel) que renderiza insumos existentes (ChatbotInsight \+ agregados mensuales \+ categorías de leads), gateada Pro+. No genera datos nuevos, no toca crons ni LLM. Org-scoped (anti-fuga multi-tenant verificada en tests). Empty states honestos. Seed QA se ejecutó y se limpió post-verificación (`createMany skipDuplicates`, sin pisar datos reales).  
- **P0.3 — Lead scoring gateado por plan:** chips/cards/teaser de scoring \+ columna en CSV, gateado por `planAllows('leadScoring')`.  
- **P0.4 — Coherencia comercial:** precio Starter 50→49, eliminación de `mini-crm` de premium-modules.  
- **Split de commits:** los tres \+ los fixes de admin/home convivían sin commitear en el working tree (12 archivos). Se particionó en commits atómicos por sprint (`git add` explícito por archivo \+ `git add -p` para la bitácora). Scripts efímeros `_pNN-*` excluidos del repo (`.gitignore` con `scripts/_p[0-9][0-9]-*`; los 2 con tests reales conservados ignorados, los 6 de seed/probe/cleanup borrados).

---

## 9\. Infra / home que se cruzó

- **`EarlyScrollLock.tsx`:** el scroll-lock del intro era un `<script dangerouslySetInnerHTML>` inline en `layout.tsx` → warning "Encountered a script tag…". Migrado a un componente con `useServerInsertedHTML` (inyecta el script parser-blocking antes de `</head>`, fuera del árbol React, misma semántica de lock). `next/script beforeInteractive` descartado (inline no ejecuta antes del primer paint en App Router).  
- **`useHydratedReducedMotion`:** hydration mismatch en `WhyDevelOP.tsx` (`AgencyComparisonVisual`, server `0` vs client `76`) por usar `useReducedMotion()` de Framer Motion. Reemplazado por un hook local con `useSyncExternalStore` (server y primer render del client devuelven `false` determinista; post-hidratación refleja el `matchMedia` real).  
- **Episodio reduced-motion (Windows):** el intro del home dejó de verse / el Hero quedó sin puntos. **No era código** — la máquina tenía `prefers-reduced-motion: reduce` activo (toggle del OS / panel clásico `SystemPropertiesPerformance`), y el sitio responde por diseño (intro corto \+ sin DotMatrix). Confirmado con `matchMedia(...).matches`. **Lección:** verificar el entorno antes de buscar el bug en el código; los dos fixes de arriba se habían "desaplicado" por un `git discard` accidental en VS Code, no por regresión.

---

## 10\. Cambios deshechos

- **Preview agrandada / estirada al form:** se intentó (a) ensanchar la columna (380→460), (b) agrandar el widget (CANVAS\_HEIGHT/WIDGET\_MIN\_HEIGHT), (c) igualar la altura de la preview al form con el grid stretch. Todas se descartaron — la (a)/(b) dejaban el widget chico nadando o cortado; la (c) dejaba un vacío enorme con el widget al fondo. **Estado final: sticky centrada, tamaño natural** (revert commiteado). **Lección:** fue el ítem que más turnos consumió, por calibrar a ojo sin referencia fija. Para mejoras visuales de gusto, definir la referencia (mockup/ejemplo) ANTES de promptarget.

---

## 11\. Deuda / pendiente

### Del lote (sin resolver)

- **\#8 — Upload de imagen del avatar:** hoy el campo "Imagen custom" pide una **URL** (imagen ya hosteada); no hay subida de archivos. Upload real \= decisión de infra/storage (Vercel Blob / S3 / costo) → roadmap. Corto plazo: mejorar el copy del campo de URL.

### Hardening (fichado, no ejecutado)

- CSP Report-Only → **enforcement**.  
- 3 endpoints públicos **sin rate-limit**.  
- Guard server-side "**el primer mensaje debe ser user**" (defense-in-depth; hoy falla seguro pero no está server-enforced).  
- **Freeze del AvatarPicker** al montar varios canvas 3D simultáneos — optimizar (se cruza con el trabajo del avatar de este frente).

### Limpieza

- `QuickReplyChips.tsx` queda **muerto** duplicando styling → montarlo o borrarlo.  
- Cyan hardcodeado restante en el widget (botón enviar, Sparkles del empty-state, thinkPulse) — cablear al accent.  
- Default `"generic"` del `schema.prisma` (code muerto; cambiarlo exige migración).  
- `DIRECT_URL` sin setear; reconciliar branch main/prod; gobernanza Vertex/GCP (Franco).

### Feature mayor (no implementada)

- **Sistema de leads consolidado:** dedup por dispositivo (`deviceId` anónimo en localStorage con `captureLead`), temperatura \= la más alta alcanzada \+ recurrencia, el "nueva conversación" no borra el lead del backend. **Requiere diagnóstico previo del modelo Lead** (schema frozen): cómo se identifica al visitante hoy, si ya existe temperatura, cómo persiste `captureLead`.

---

## 12\. Lecciones

- **Commit por feature.** El "discard fantasma" en VS Code borró dos fixes sin commitear y solo se detectó porque rompió algo visible. Con el árbol commiteado habría sido un `git diff` de tres archivos. De acá en adelante: cada fix verificado \= commit en el momento.  
- **`grep` de montaje antes de editar un componente del chatbot.** Más de un fix de color aterrizó en código muerto (`QuickReplyChips.tsx` exportado pero sin montar; los chips reales eran markup inline). Verificar que el componente esté montado antes de tocarlo.  
- **Paridad config ↔ widget.** Todo campo de estilo debe cablearse en la **preview Y el widget real** — la preview interpreta campos que el widget ignora. Es la fuente recurrente de "lo configuro y no se aplica".  
- **`z.infer` (output post-transform) como tipo de input** es la raíz de bugs invisibles al compilador: compila, explota en runtime. Para form-state/params usar el input type (override con `Omit` o `z.input`).  
- **Checkpoints humanos en sprints largos.** El listbox custom paró tras el paso 3 para validar el contrato del select oculto antes de construir 280 líneas encima.  
- **No calibrar visual a ojo sin referencia.** Ver §10. Dejar knobs nombrados juntos y comentados para calibrar en un toque.  
- **Verificar el entorno antes que el código.** El "preloader roto" era el toggle de reduced-motion de Windows, no una regresión.  
- **Scripts efímeros fuera del repo.** Seeds/probes/cleanup con IDs de DB y lógica destructiva van a `.gitignore` o se borran, nunca al historial.

---

## Pendiente operativo

- Decidir el próximo frente: **hardening** (cerrar deuda de seguridad) vs **leads consolidado** (feature de valor comercial, arranca con el diagnóstico del modelo Lead) vs lo arrastrado de home (Route B del preloader, Paint sprint).  
- Al abrir el siguiente frente: `/clear` en Claude Code (no `/compact`) y chat nuevo de planificación (este hilo fue largo y enfocado en dashboard/chatbot — el handoff vive en git \+ CLAUDE.md \+ esta bitácora).
