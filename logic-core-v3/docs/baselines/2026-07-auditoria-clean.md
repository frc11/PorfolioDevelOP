# Auditoría CLEAN — calidad de código intra-archivo (Julio 2026)

**Fecha:** 2026-07-28
**Rama / worktree:** `chore/auditoria-clean` @ `49fec9b` (= `origin/main`, "fix(chatbot): techo de tiempo en el cierre del stream")
**Alcance:** `logic-core-v3/src` — 1.308 archivos `.ts`/`.tsx`, 213.412 LOC
**Modo:** read-only. Cero escrituras fuera de `docs/`. Todos los probes de medición viven en `/c/tmp/`.
**Método:** 8 lentes en paralelo (3 hardcodeo · 3 repetición · 2 sobreingeniería) → 1 escéptico adversarial por categoría que refuta contra el archivo real → 2 agentes de reglas que **miden** violaciones con probes de ESLint → 1 crítico de completitud. 14 agentes, 727 llamadas a herramientas.

**Qué NO cubre este documento (a propósito):**
- Estructura de módulos (barrels muertos, ciclos, duplicate exports) → lo cubrió la auditoría **ARQ**.
- Clones exactos → los saca `jscpd` en la auditoría CLEAN-mecánica **post-P1**. Acá solo hay clones *semánticos*.
- Mapa exhaustivo archivo:línea. El repo está **PRE-P1** (la limpieza de dead code no se hizo): un mapa fresco se saca después. Lo que entrega este documento es **criterio durable**.

---

## Cómo leer esto

Cada hallazgo se clasifica por **valor-de-ejecutar**, no por fealdad:

| Clasificación | Significa |
|---|---|
| **ALTO** | Mueve una métrica o cierra un bug alcanzable. Se ejecuta. |
| **MEDIO** | Deuda real con escenario de falla concreto. Se ejecuta cuando toque esa zona. |
| **BAJO** | Se anota. Se arregla si ya estás en el archivo por otra razón. |
| **NO-EJECUTAR** | Diagnosticado a propósito y marcado para **no** tocarse. Su valor es el patrón, no la limpieza. |

**Riesgo** (lo que pasa si no se toca) y **valor-de-ejecutar** (lo que se gana tocándolo) son ejes distintos y a veces opuestos. El criterio de agencia de 2 personas manda: *una regla que nadie mantiene no sirve, y un refactor que no mueve una métrica y puede romper, no se hace.*

**Números del lote:** 65 hallazgos brutos → 39 pasaron por verificación adversarial → los escépticos **mataron 5** y corrigieron conteos en 6 más → **~55 hallazgos distintos** sobreviven tras desduplicar (varias lentes encontraron lo mismo por caminos distintos, lo cual es señal de que el hallazgo es real).

---

## Resumen ejecutivo — la tesis

La clase de defecto dominante de este repo **no es sintáctica**. Es siempre la misma forma:

> **Dos listas que tienen que coincidir, y ya divergieron.**

`check-env.js` vs los 159 `process.env.` reales. `.env.example` (24 vars) vs las 48 usadas. El agregado `check:invariants` (16 entradas a mano) vs los 56 archivos `*.invariant.ts` que existen. `netlify.toml`/`vercel.json` vs las 8 rutas de `src/app/api/cron/`. `Plan.quota` vs `BotConfig.monthlyQuota`. El slug del catálogo de módulos vs el slug del gate. Las rutas de escritura de `User.email` vs las de lectura.

**Ningún linter puede ver eso** — ESLint no cruza archivos. Por eso el entregable de Categoría 4 no es solo un set de reglas: son **reglas + invariantes + chequeos de drift**, y el orden importa.

Y hay un dato que reordena todo, encontrado al medir:

> `npx tsc --noEmit` pasa con **cero errores en 35 s**. No existe script npm que lo corra. No está en CI. Y `next.config.ts:11-16` tiene `typescript.ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true` (introducido 2026-06-28, commit `5e2a406`).
>
> **Hoy nada typechequea ni lintea este repo.** Varios hallazgos proponen "el tipo mismo es el candado (TS strict + `npm run build`)" — eso es ficción: ni el build corre en CI, ni el build chequea tipos.

Agregar un job de `typecheck` es la adición **más barata, más valiosa y de menor mantenimiento** de todo este entregable, y está **verde hoy**.

---

# Categoría 1 — HARDCODEO

## 1.0 · El criterio (esto es el entregable, no la lista)

El repo no tiene una regla escrita para decidir si un literal sale a config, y conviven dos disciplinas opuestas: el módulo `chatbot` nombra hasta el colchón de 3 segundos de un stream (`historyPolicy.ts:31`, `postToN8n.ts:19`, `rate-limit/presets.ts:8`), y `src/app` no nombra casi nada (`dashboard/layout.tsx:49` tiene `{ revalidate: 30 }` suelto). Sin criterio, cualquier limpieza degenera en "nombremos todo", que es peor que no hacer nada.

> ### REGLA DE DECISIÓN — config vs literal legítimo
>
> Un literal **es config y tiene que salir** si cumple **al menos una**:
>
> **(a) Acoplamiento de corrección** — existe otro literal en otro archivo que, si no se mueve a la par, deja el sistema en estado **incorrecto** (no meramente inconsistente).
> **(b) Lo decide el deploy**, no el código — dominios, remitentes, URLs, credenciales, claves de proveedor.
> **(c) Es un techo, ventana o límite** cuyo cambio mueve costo, latencia, o comportamiento de negocio observable.
>
> Si ninguna aplica —solo hay repetición estética o de convención, donde cambiar uno **no** deja mal a los otros— **no es config**: es un token o una convención, y se arregla con lint o no se arregla. Nunca con un refactor manual.
>
> **Ejemplo del repo que SÍ sale:** `process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'` (`createClientWithBot.ts:227` + 3 archivos más, 5 fallbacks distintos en total). Cumple (a) y (b): si la var falta en un deploy, el mail de bienvenida manda al cliente a la landing de marketing mientras el de reset lo manda a `localhost`. Dos comportamientos incorrectos, cero errores en logs.
>
> **Ejemplo del repo que NO sale:** `setTimeout(() => setCopiado(false), 2000)` (`setter/_components/copy-block.tsx:37` y 6 archivos más con el mismo `2000` para el mismo feedback de "copiado"). Repetido 7 veces y aun así **no** es config: cambiar uno a 1500 no deja a los otros 6 mal, solo distintos.
>
> **Corolario operativo:** la pregunta correcta no es *"¿este número se repite?"* sino ***"¿si cambio este y me olvido del otro, queda algo MAL?"***. Si la respuesta es "no, queda distinto", el hallazgo es de lint, no de refactor — y en una agencia de 2 personas eso significa que **se pospone**.

→ **Acción:** pegar este bloque en `CLAUDE.md`, sección *Stack conventions*. Y la regla de gobernanza: cada vez que se agrega una regla a `eslint.config.mjs`, se cita en el mensaje cuál de las tres condiciones (a/b/c) la justifica. Sin esa cita, la regla no entra.

---

## 1.1 · ALTO — ejecutar

### `Bearer undefined`: 3 rutas de cron autentican contra un literal fabricado por la interpolación
**Riesgo ALTO · confirmado · 3 ocurrencias**

```ts
// src/app/api/cron/detect-bot-issues/route.ts:8   (idéntico en send-weekly-reports:8, generate-insights:12)
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }
```

Si `CRON_SECRET` no está seteada, el valor esperado se materializa como el string `"Bearer undefined"` y **cualquiera que mande ese header exacto pasa el check**. Es el peor fallback hardcodeado posible: no está escrito en el código, lo fabrica la interpolación.

Alcance verificado de punta a punta: de las **8 rutas** de `src/app/api/cron/`, exactamente **3 usan la forma insegura** y **5 ya usan la forma que falla cerrada** (`alerts:5`, `cleanup-old-events:40`, `os-follow-up:154`, `regenerate-briefs:19`, `send-executive-reports:18`). O sea: **la forma correcta ya existe en el repo, escrita 5 veces**.

Explotación: `curl -H 'Authorization: Bearer undefined' https://<host>/api/cron/send-weekly-reports` → envío masivo de reportes a todos los clientes. Con `generate-insights` (POST) → quema tokens de Vertex sobre todos los bots activos.

El propio repo documentó el problema en `cleanup-old-events/route.ts:19` pero **subestimó el caso**: dice que da "falso NEGATIVO por accidente", y eso solo vale para el atacante que *no* manda header. El que manda el literal, entra.

**Precondición honesta:** el daño requiere que `CRON_SECRET` falte. Hoy nada lo impide — `check-env.js:63` la clasifica **OPTIONAL** (mientras `.env.example` la marca "REQUERIDA EN PROD": los dos manifiestos se contradicen), y `check-env` no corre en CI.

→ **Fix:** `src/lib/security/cron-auth.ts` con un `assertCronRequest(request)` con la forma de `cleanup-old-events`, llamado por las 8 rutas. `CRON_SECRET` a `CRITICAL_VARS`. De paso sale `getProvidedCronSecret`, que hoy está exportada desde un `route.ts` (Next 16 prohíbe exports no-handler ahí).
→ **Candado:** el invariante `cleanup-old-events-auth.invariant.ts` **ya cubre exactamente este caso** ("Bearer undefined literal → 401")… y **tampoco corre en CI** (ver 1.1.d). Re-apuntarlo al helper compartido y engancharlo al agregado.

---

### `NEXT_PUBLIC_APP_URL`: 22 lecturas crudas, 5 fallbacks incompatibles, y el accessor correcto encerrado
**Riesgo ALTO · confirmado · 22 ocurrencias en 20 archivos**

Cuatro grupos incompatibles conviviendo: 10 sitios caen a `http://localhost:3000`, 6 a `https://develop.com.ar` (que es la **landing**, no el portal), 4 a string vacío, y 2 interpolan sin fallback (producen literalmente `undefined/dashboard/...`).

```ts
// src/lib/alerts.ts:49 — la forma correcta YA existe, pero está privada y sin exportar
function getBaseUrl() { return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000' }

// src/lib/email/notify-message.ts:45 — sin fallback
const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`
```

`NEXT_PUBLIC_*` **se inlinea en build-time**: un deploy preview, un branch deploy o un entorno nuevo sin la var **no falla** — hornea el fallback. Cuatro fallas distintas del mismo dato faltante, y ninguna diagnosticable desde el síntoma porque cada una se ve como un bug separado:

1. mail de bienvenida → `https://develop.com.ar/login` (landing de marketing, no el portal);
2. mail de "tenés un mensaje nuevo" → `undefined/dashboard/messages`;
3. **link de baja de suscripción → `http://localhost:3000`** (`unsubscribe-token.ts:58` y `:118`, header `List-Unsubscribe` RFC-8058) — esto es compliance y deliverability, no UX: Gmail/Outlook penalizan un `List-Unsubscribe` que no resuelve;
4. link de referido vacío.

→ **Fix:** `src/config/urls.ts` con `appBaseUrl()`: lee, normaliza la barra final, y **tira error en producción si falta** en vez de inventar un fallback. ~30 min, mecánico, sin cambio de comportamiento en ningún entorno bien configurado.
→ **Ojo:** *no* fusionar con `NEXTAUTH_URL`. Son dos vars con dueños distintos; el fallback encadenado de `alerts.ts:49` es una conveniencia, no una equivalencia. Y el throw va **en el punto de uso**, no en module scope (ver el hazard de build en §4.2).

---

### El remitente de los emails: 4 formas distintas, un Gmail personal como fallback de producción
**Riesgo ALTO · confirmado · 4 remitentes distintos**

```ts
src/lib/email.ts:21               from: 'develOP Agency <hello@develop-agency.com>'
src/lib/email/notify-message.ts:51 from: 'develOP <hola@develop.com.ar>'  // ⚠️ Franco, ajustar al dominio real verificado en Resend
src/lib/email/brevo-service.ts:33  email: process.env.BREVO_FROM_EMAIL ?? 'valenolme2@gmail.com'
src/lib/integrations/brevo.ts:124  email: params.senderEmail ?? process.env.BREVO_FROM_EMAIL ?? 'alerts@develop-agency.com'
```

Cuatro remitentes, **dos dominios que no coinciden**, y un Gmail personal. El TODO de `notify-message.ts:51` sigue abierto en `main`.

Y el dato más incómodo, verificado: **`RESEND_FROM_EMAIL` está declarada en `.env.example:138` y en `check-env.js:42`, y tiene CERO lectores en `src/`.** El manifiesto declara una var que el código nunca lee, mientras los dos caminos de Resend usan literales.

Falla concreta: si `BREVO_FROM_EMAIL` falta, los mails de **reset de contraseña** (`auth.ts:99` → brevo-service) salen desde un Gmail personal → no autentica SPF/DKIM del dominio → spam → el usuario no puede recuperar la cuenta. Y el `catch` de `brevo-service.ts:41` devuelve `ok:false` con solo un `console.error`: falla silenciosa.

→ **Fix:** los dos sitios de Resend leen `RESEND_FROM_EMAIL` (la var **ya está en el contrato**, solo falta leerla); Brevo lee `BREVO_FROM_EMAIL` sin fallback. Si el proveedor está configurado y su FROM no, **la app se niega a mandar**. *Un mail no enviado es un bug visible; un mail enviado desde un Gmail personal es un bug invisible que además quema la reputación del dominio.*

---

### El WhatsApp de la agencia existe como 6 números distintos, y el campo del panel admin no lo lee nadie
**Riesgo ALTO · confirmado · 19 ocurrencias en 16 archivos** (14 tras P1)

Cada CTA del sitio público resuelve el teléfono por su cuenta, y cada autor puso el número que tenía a mano: `5493816223508` (CtaAutomation:136), `5493815000000` (Footer:8), `543812223344` (DiagnosticoSoftware:636 y :703), `543813165293` (contact/page:10, que alimenta también el `tel:`), más dos literales puros sin env (`ChatbotUpsellLanding:15`, `CalculadorIA:316`). Otros 3 sitios **no pusieron fallback** e interpolan `undefined` en la URL de `wa.me` (`PricingSection:345`, `CalculadoraAutomation:900`, `WebDevelopmentTimeline:941`).

Dos fallas independientes: **(1)** si la var falta en el build, cada landing manda a un número distinto y tres botones de conversión van a `wa.me/undefined`; ninguno de los 4 números puede ser el correcto simultáneamente. **(2)** Aunque la var esté seteada: existe `AgencySettings.contactWhatsapp` en la DB, con UI de edición en `/admin/settings` (`settings-console.tsx:234`) que **ningún componente público consume**. Franco cambia el WhatsApp en el panel y el sitio sigue mostrando el de la env var. **El panel miente.**

→ **Fix:** `getWhatsappHref(text?)` en `src/lib/agency-settings.ts` (ya es el registro de identidad: `agencyName`, `contactEmail`, `websiteUrl`, `contactWhatsapp`). Decidir explícitamente la precedencia DB > env > throw. Los 5 sitios que viven en archivos muertos se resuelven solos en P1 — no gastar ahí.

---

### Slug de módulo premium sin tipo: **un módulo de US$80/mes es inalcanzable desde el producto**
**Riesgo ALTO · confirmado de punta a punta · el defecto real son 2 call sites**

Ya rompió, no es hipotético.

| Punto | Valor |
|---|---|
| `src/lib/data/premium-modules.ts:38` (catálogo, "SOURCE OF TRUTH") | `slug: 'email-marketing-pro'` |
| `dashboard/modules/email-marketing/layout.tsx:20` (gate) | `isModuleActive(orgId, 'email-marketing')` |
| `components/dashboard/SidebarNav.tsx:78` (nav) | `{ slug: 'email-marketing', ... }` |

El seed escribe `PremiumModule.slug` desde el catálogo → `'email-marketing-pro'`. `isModuleActive` hace `findFirst` con `module: { slug: moduleSlug }` → **no existe fila con `'email-marketing'`** → `false` → `redirect('/dashboard')`, **siempre**. Una org que contrató el módulo (TIER_2_GROWTH, ACTIVE, `priceMonthlyUsd: 80`) no lo ve en el sidebar y no puede entrar por URL. **Sin error, sin log, sin test rojo.**

Causa raíz: el tipo del catálogo declara `slug: string` en vez de una unión derivada, así que un slug mal escrito no falla al compilar.

→ **Fix:** exportar `PREMIUM_MODULE_SLUGS = [...] as const` + `type PremiumModuleSlug` derivados del propio catálogo, y tipar `isModuleActive(orgId, slug: PremiumModuleSlug)`. Con eso el bug pasa a ser un error de tipos. Aparte: decidir si el slug correcto es `email-marketing-pro` (y corregir los 2 call sites) o renombrar el catálogo — **no dejarlo a medias**.
→ **Corrección del escéptico:** las "56 ocurrencias" están infladas (la mayoría son rutas de URL, no slugs) — el defecto son **2 call sites**. Y `check:invariant:modules` **no** atraparía este bug: arma su propio catálogo. El candado real es el tipo + que el typecheck corra.

---

### La cuota mensual tiene DOS fuentes de verdad: una enforcea, la otra es la que ve el admin
**Riesgo ALTO · confirmado · divergencia actual, no hipotética**

- **Enforcement** (`handleChatRequest.ts:597` y `:653`): corta con `plan.quota` — planes sembrados 500 / 3000 / 5000.
- **Toda la superficie admin** (`detectBotIssues.ts:68`, `preflightChecks.ts:151`, `OverviewTab.tsx:44-46`, `ChatbotTab.tsx:93-94`): muestra y alerta con `BotConfig.monthlyQuota` — default de schema **1000**, y `createBot`/`createClientWithBot`/onboarding **siempre escriben 1000**.

**Ningún plan vale 1000**, así que todo bot en producción diverge por construcción. Un cliente STARTER: el bot se corta a las 500, el panel dice "1.000 conv/mes", y la alerta `QUOTA_EXHAUSTED` (que espera 1000) **no dispara nunca**. Franco atiende un ticket "el bot dejó de responder" mirando un panel que dice que está al 50%.

→ **Fix:** sin migración y sin tocar el enforcement (que ya es correcto). Las 4 superficies de lectura piden el límite a `getPlanForOrg(orgId).quota` (ya existe, cacheado 60 s; `get-org-usage.ts` ya lo hace bien y es el precedente). `BotConfig.monthlyQuota` queda como override sin lectores; en P1 se decide si se dropea. **4 archivos, cero riesgo.**

---

### Drift del manifiesto de env — *narrativa refutada, mecanismo confirmado*
**Riesgo MEDIO · narrativa parcialmente refutada por el escéptico**

El escéptico mató dos evidencias (`CHATBOT_GOOGLE_API_KEY` se mantiene **deliberadamente** como warning legacy en `envValidator.ts:53-58`; `RESEND_FROM_EMAIL` está en `check-env.js:42`, no `:44`) y desinfló el riesgo de `OAUTH_STATE_SECRET` (el fallback a `AUTH_SECRET` es deliberado y documentado, lanza si faltan ambas, y el TTL del state es 10 min).

**Lo que sobrevive, que es lo que importa:** hay **dos manifiestos que nadie sincroniza** (`scripts/check-env.js` y `.env.example`), divergen entre sí y ambos divergen de `src/`. 48 vars usadas contra 24 documentadas. `CRON_SECRET` es OPTIONAL en uno y "REQUERIDA EN PROD" en el otro. Y **la única red que atraparía una var faltante es opcional y nunca se ejecuta**. Los cuatro hallazgos anteriores son consecuencias de este.

→ **Fix:** `check-env-drift` — chequea **nombres** (por eso corre en CI sin un solo secret), mientras `check-env` chequea **valores** (por eso queda local/pre-deploy). Esa distinción es la razón de fondo por la que `check-env` nunca pudo estar en CI. Detalle completo en §4.2.

---

### **Pieza keystone: 40 de 56 invariantes nunca corren**
**Riesgo MEDIO · valor de ejecutar ALTO · confirmado**

El repo tiene **56 archivos `*.invariant.ts`** y 35 scripts `check:invariant:*`. CI ejecuta un solo agregado, `check:invariants` (`package.json:18`), que **enumera 16 a mano**. Los otros **40 existen, pasan si los corrés, y no los corre nadie** — incluidos `check:invariant:lead-scoring` (12 asserts sobre el gate de planes), `check:invariant:modules`, `check:invariant:mask-secret`, y las **19 invariantes del chatbot**, que ni siquiera están bajo el prefijo `check:invariant:` (viven como `test:*`).

Escenario: alguien desacopla `leadScoring` de `insightEnabled` en `plan-allows.ts:33` y Starter empieza a ver una feature que se vende como Pro. El invariante que existe **exactamente para eso** está verde en el disco y jamás se ejecuta: el PR mergea limpio.

**Este es el hallazgo cuyo arreglo hace ejecutables a los demás.** Todo candado que proponga esta auditoría muere acá si no se lo engancha.

→ **Fix:** reemplazar la lista a mano por `scripts/run-invariants.ts` con **descubrimiento por glob**. Invertir el default: hoy hay que acordarse de *incluir*; debería haber que justificar *excluir*.
→ El escéptico corrió `mask-secret` y `dates-ar` sueltas: **ambas verdes**, o sea cablearlas no rompe CI. También detectó una invención del hallazgo original (`check:invariant:idor` no existe; el real es `check:invariant:security` y sí está cableado).

---

## 1.2 · MEDIO y BAJO — anotados

| Valor | Hallazgo | Nº | Nota |
|---|---|---|---|
| MEDIO | Tabla de planes (precio, cuota, dominios, features) escrita **completa en 3 lugares**, con comentarios que dicen "actualizar acá en paralelo" | 3 | Deuda declarada en prosa, sin candado ejecutable |
| MEDIO | `'gemini-2.5-flash'` repetido en 10 sitios pese a que `FALLBACK_MODEL_ID` ya existe; el catálogo de modelos del panel admin es copia a mano de otro archivo | 10 | |
| MEDIO | Allowlist de origen de confianza (`develop.com.ar`) duplicada en dos chequeos de seguridad distintos | 4 | **El escéptico encontró la divergencia real**: `isOriginWithinPlanCap` copia 2 de los **3** escapes de `validateOrigin` — se le escapa `QA_ALLOW_LOCALHOST` (`validate-origin.ts:49-51`). Solo pega en el harness prod-QA local |
| MEDIO | `ROUTE_MAX_DURATION_MS` es espejo manual de `export const maxDuration` y nada lo verifica | 2 | Candidato a invariante de 3 líneas |
| MEDIO | `priceLockedUsd` lo respeta el cálculo de MRR y lo ignora la página de facturación del cliente | 2 | |
| BAJO | Cadena numérica acoplada del chatbot (soft-cap 15 turnos / ventana 30 msg / hard-cap 40): la relación aritmética existe **solo en los comentarios** | 3 | |
| BAJO | Precio de entrada del servicio web en 4 componentes, y **la misma página se contradice**: "desde 800 USD" arriba, tier Base de $490 abajo | 4 | Bug de copy visible al cliente |
| BAJO | Slug `'develop'` como sentinel del tenant propio: 22 ocurrencias en 16 archivos, sobre **dos entidades distintas** (`Organization` y `BotConfig`) | 22 | |
| BAJO | Endpoint v4 de Google Business Profile inline 4 veces, contra el patrón `const API_BASE` que el resto del repo respeta | 4 | |
| BAJO | `standardEase` existe, tiene **1 solo consumidor**, y el mismo tuple se reescribe 62 veces bajo 8 nombres locales | 58 | **Y hay dos canónicos**: `design-tokens.ts:197` declara el mismo tuple como `easing.standard` |
| BAJO | Constantes del pipeline duplicadas entre archivos hermanos (`POSTPONE_DAYS`, `ATAJOS_SNOOZE`, `fechaEnDias`) | 6 | |
| BAJO | `prisma-enums.ts` cubre 4 enums y tiene **2 importadores**; los mismos valores se re-tipean como uniones inline con `as` | 35 | |
| NO-EJ | Dos catálogos paralelos de módulos premium con precios propios + tabla de traducción de slugs entre ellos | 2 | **Dead code** → se borra en P1 |

**Refutado:** *25 TTLs de caché duplicados*. La duplicación existe byte por byte, pero `chatbot/layout.tsx:9-11` declara explícitamente que **compartir la cache-key es el objetivo buscado** ("para que el badge del sidebar y el dot de la tab Leads usen la misma fuente sin doble query"). El riesgo montado sobre cómo `unstable_cache` deriva la clave no se verificó. → No es un hallazgo.

---

# Categoría 2 — REPETICIÓN SEMÁNTICA

> Clones exactos no: eso lo saca `jscpd` post-P1. Acá está la **misma lógica reimplementada distinto**. El oro de esta categoría son las **divergencias ya materializadas**: dos copias que hoy hacen cosas distintas significa que **una de las dos está mal**.

## 2.1 · ALTO — ejecutar

### El email de usuario se **escribe** sin normalizar y se **lee** normalizado
**Riesgo ALTO · confirmado sin recortes — el mejor hallazgo del lote**

Toda ruta de **lectura** de `User.email` aplica `.trim().toLowerCase()` antes del `findUnique`. Las rutas de **escritura** usan `z.string().email()` pelado y persisten el valor crudo. No existe un `emailSchema` compartido: cada action re-escribe la regla, y **una de las cuatro ya la escribió distinto que sus dos hermanas del mismo directorio** (`updateClient.ts:71` hace `.toLowerCase()` sin `.trim()`).

Franco crea un cliente tipeando `Franco@Empresa.com`:

1. **El usuario nunca puede loguearse.** `auth.ts:143` baja a minúsculas, el `findUnique` no matchea, y el error es el genérico de credenciales — indistinguible de una contraseña mal puesta.
2. **Recuperar contraseña tampoco lo salva.** `forgot-password` normaliza igual, no encuentra al usuario, y devuelve el mensaje anti-enumeración de éxito (`actions.ts:66-68`): la UI dice "te mandamos el mail" y no se manda nada. **Falla 100% silenciosa en las dos puntas.**
3. Como el `@unique` es case-sensitive, después se puede crear una **segunda fila** `franco@empresa.com` — dos `User` para el mismo humano, cada uno con su `organizationId`.

El escéptico intentó refutarlo por tres lados y falló los tres (la UI no normaliza: `Step1Company.tsx:169` y `CreateBotForm.tsx:239` mandan el valor crudo), y le **agregó una agravante**: el chequeo de duplicados (`createClientOnly.ts:62`, `createClientWithBot.ts:112`) también compara sin normalizar, así que el guard de aplicación tampoco frena la segunda fila.

→ **Fix:** `src/lib/validation/email.ts` con `emailSchema = z.string().trim().toLowerCase().max(254).email()`. Reemplazar las 4 escrituras y las lecturas.
→ **Migración de datos:** script one-shot que detecte `User.email != lower(trim(email))` **y las colisiones que eso destape**, antes de aplicar nada. Puede haber duplicados ya creados: se miran a mano, **no se auto-mergean**.
→ **Candado:** selector que matchea exactamente `z.string().email()` y **no** matchea la cadena normalizada. 13 violaciones medidas.

---

### 96 de 139 catch de Server Actions no dejan ningún rastro — y el que sí sale, sale al cliente
**Riesgo MEDIO · confirmado con conteo corregido (69%, no 71%)**

Dos hallazgos que son el mismo bug leído desde las dos puntas:

- **107→96 catch silenciosos** (69% de los 139 de la capa): atrapan, convierten a string, devuelven. El error se evapora. Un setter reporta "me tira error al guardar el brief" y en Netlify Logs **no hay una sola línea**.
- **63 catch devuelven el `.message` crudo de la excepción al cliente** — exactamente lo que la regla no-negociable del repo prohíbe.

> Está **exactamente al revés** de lo que hay que hacer: el error interno va al usuario y no va al log.

**Y el repo ya resolvió bien el problema, seis veces, sin promoverlo:**

```ts
// src/app/(protected)/setter/_actions/foco.actions.ts:23  — y cartera:23 byte a byte igual
function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof Error && error.message === 'Unauthorized') return fail('No autorizado')
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}
```

Las **6 copias** tienen la firma idéntica y el mismo comentario textual. El carril LeadOS llegó a la respuesta correcta y nunca subió a `src/lib/`. El resto del repo sigue haciendo lo contrario **porque el helper correcto no está donde se lo busca**.

→ **Fix:** subir `mapError` a `src/lib/action-utils.ts` **y que loguee antes de devolver**. Un solo cambio arregla los dos problemas: error crudo al servidor, mensaje seguro al cliente. No hay que tocar 96 catch a mano — 86 de los 96 caen en archivos que ya hay que tocar por los otros dos hallazgos.
→ **Candado:** `no-restricted-syntax` sobre `fail(error instanceof Error ? error.message : ...)` en `**/_actions`. **49 violaciones medidas**, cero en archivos muertos. El carril setter aparece con **una sola** — confirma que ese lane ya migró.

---

### El formateo de fechas esquiva `dates-ar.ts`: 57 sitios a mano, 3 usan el módulo
**Riesgo ALTO · 57 ocurrencias**

Existe un módulo canónico con invariante propio, pero solo se adoptó su **mitad de rangos** (`startOfWeekAR`, `monthRangeAR`). La mitad de **formateo** (`formatDateAR`, `formatTimeAR`, `formatRelativeAR`) tiene **3 importadores** contra ~57 sitios que llaman `toLocaleDateString`/`Intl.DateTimeFormat` a mano. Los que corren en server **omiten `timeZone`** y formatean en la TZ del proceso — **UTC en deploy**.

AR es UTC-3 fijo: **todo instante entre las 21:00 y las 23:59 hora AR cae en el día calendario siguiente.**

- `email/templates/weekly-report.ts:13` fecha como "05 jun" un evento del 4 de junio 21:30 AR — el cliente lee una fecha que no coincide con el portal, que sí usa el helper.
- `getActivityChartData.ts:25` y `:30` mete 3 horas de cada día en la barra equivocada, **en las dos puntas** (buckets vacíos construidos con `new Date()` local, eventos desde `createdAt` UTC) → claves que no matchean → barras en cero y eventos perdidos.
- `lead-timeline.helpers.ts:64` corre 3 horas los eventos de un timeline **cuya utilidad es el orden temporal**.

La divergencia dentro de la misma categoría lo prueba: `client-notifications/templates.ts:81` **sí** fija `timeZone`. Dos templates de email, uno correcto y otro no.

El repo ya tuvo 2 bugs de TZ (documentado en `tz-ar.ts:3`) y creó `dates-ar.ts` + un invariante para no repetirlos. **El invariante protege el módulo; nada impide que 57 sitios lo esquiven.**

→ **Fix:** **no migrar los 57**. Migrar solo los **server-only**, que son los que rompen de verdad y son pocos: `weekly-report.ts:13`, `getActivityChartData.ts:25+30`, `alerts.ts:287`, `lead-timeline.helpers.ts:64`. Los client-side formatean en la TZ del browser (AR para el usuario real): son **deuda, no bug**. Que migren por presión del linter cuando alguien los toque.
→ **Candado acotado a la capa server: 35 violaciones medidas** (repo-wide serían 158 → warn que nadie mira).

---

### El badge de "cola de revisión" miente hasta 30 s
**Riesgo MEDIO · 16 helpers de revalidación caseros**

`admin/layout.tsx:20-31` cachea el contador con `tags: ['admin-revision-resumen']`, `revalidate: 30`. El **único invalidador de ese tag** está en `lead.actions.ts:220` y se dispara al togglear `caliente` — que **no cambia el número de pendientes**. Los dos eventos que sí lo mueven (`transitionDossier → EN_REVISION` en `dossier.actions.ts:391`, y aprobar/rechazar en `revision.actions.ts:87`/`:115`) llaman helpers locales que solo hacen `revalidatePath`.

Cada archivo de actions define su propio `revalidarX(id)` con las rutas hardcodeadas adentro — 16 helpers, dos pares byte a byte iguales. Nadie tiene la vista global de qué caches toca una mutación.

→ **Fix puntual (2 líneas):** agregar `revalidateTag('admin-revision-resumen', {})` a `revalidarRevisionAdmin` y `revalidarRevision`.
→ **Fix del patrón:** invalidadores **por superficie de UI** en `src/lib/revalidate.ts`, no por archivo de actions.
→ **Candado: NO.** Medido: **88 archivos importan `next/cache`**. Prohibirlo es una migración, no un candado. Variante discutible: restringir solo `revalidateTag` (23 call sites) dejando `revalidatePath` libre (208). Aun así es refactor antes que regla → **marcado, no propuesto**.

---

## 2.2 · MEDIO y BAJO

| Valor | Hallazgo | Nº | Nota |
|---|---|---|---|
| MEDIO | 20 de 26 fetch salientes del servidor **sin timeout**; no existe cliente HTTP compartido | 20 | |
| MEDIO | Tres dialectos vivos de "soy super-admin" + contrato de error por string literal que 6 archivos leen a mano | 56 | Cruza con **P0-6** de la auditoría maestra — ahí está el ángulo de seguridad; acá solo el de repetición |
| MEDIO | `whatsappNumber`: el normalizador compartido existe pero la ruta de **edición** no lo usa; el schema de edición es 10× más permisivo que el de creación | 4 | Riesgo bajado: los 2 consumidores normalizan **al leer** |
| MEDIO | Ocho implementaciones divergentes de "hace X" — 6 vocabularios, **2 políticas de reloj** | 8 | |
| MEDIO | 5 formas de respuesta de error en 37 route handlers; **3 rutas mezclan dos formas en el mismo archivo** | 28 | |
| MEDIO | `emptyStringToUndefined` copiado verbatim en 11 archivos + su kit derivado re-derivado en cada uno | 11 | 13 violaciones medidas |
| MEDIO | `saveBotConfig` / `saveBotConfigByOrgSlug`: **43 campos de schema Zod duplicados campo por campo** | 2 | |
| BAJO | `slugify` implementado 5 veces; un archivo importa el compartido mientras su hermano de directorio se hace su copia | 5 | Las 2 que **divergen de verdad** viven en archivos muertos → P1 |
| BAJO | TZ AR en 5 constantes con 5 nombres distintos + 12 literales sueltos; el `TZ_AR` canónico tiene 2 importadores | 17 | 16 violaciones medidas |
| NO-EJ | 4 políticas de retry/backoff HTTP con parámetros distintos | 4 | **No consolidar**: dominios distintos, dead code parcial |
| NO-EJ | 33 id-schemas de una línea con mensajes divergentes es/en | 33 | **No consolidar** |
| NO-EJ | **NEGATIVO ÚTIL:** 522 `select` de Prisma pero solo **28 formas repetidas**, y son proyecciones triviales | 28 | Centralizarlas **no paga**. Este negativo vale tanto como un hallazgo |

**Refutados (3):**

- *Formateo de moneda en 4 formas.* Los planes valen **49/90/150 USD** (`plan-presentation.ts:149/165/181`): el separador de miles **no aparece hasta 4 cifras**. El escenario "un cliente argentino lee `$12,000` como doce pesos" requiere un plan de US$12.000 que no existe. Y el home nunca muestra el precio del plan.
- *Tres formas de `ActionResult` y "hooks compartidos" que solo entienden una.* Los dos hooks **no son infra del repo**: son del carril LeadOS y lo dicen en su primera línea (`use-step-action.ts:2`, `use-autosave.ts:2`), y sus 9 importadores viven todos bajo `src/app/(protected)/setter/`. Un componente de admin jamás iba a usarlos.
- *151 console en producción.* El censo era correcto (de hecho **sub-contado: 202, no 151**), pero la mitad accionable **contradice una decisión documentada**: `src/app/error.tsx:15-17` dice "B12.1 — Logger oficial en vez de console.error pelado. Este es el último fallback antes de que la app muera". Alguien lo decidió con nombre de sprint. → Sobrevive solo la parte de lint (`no-console` con allow-list, **7 violaciones**), no el refactor.

---

# Categoría 3 — SOBREINGENIERÍA

> **Todo lo de esta categoría está marcado NO-EJECUTAR o BAJO, a propósito.**
> Reescribir esto rara vez mueve una métrica y frecuentemente rompe. El valor de la categoría es **aprender el patrón** para poder fijarlo (→ Categoría 4), no ejecutar la limpieza. Se anota y se deja.

## 3.1 · La firma del código generado — capa UI

Cinco marcas que aparecen juntas y que, leídas de a una, parecen decisiones de ingeniería:

1. **Ritual sin consumidor.** La ceremonia de performance de React se aplica donde se ve bien, no donde se paga: **58 `useCallback` + 71 `useMemo` contra 0 `React.memo`** en toda la capa UI (el único `React.memo` de los 1.308 archivos está en `StreamingMarkdown.tsx:168`). Y varias memos quedan anuladas por un arrow inline dos líneas más abajo — 5 `openPanel` memoizados y consumidos inline (`EmojiPopover.tsx:56`/`:101`, `NotificationCenter.tsx:62`/`:140`, …).
2. **Superficie completa de entrada.** El primitivo nace con la matriz entera de tonos × tamaños × variantes en vez de con el caso que se pidió. `ui/Stat.tsx:21-44`: **28 combinaciones, 1 call-site**. `ui/LoadingState.tsx:6`: 5 variantes, **2 inalcanzables** sobre 94 call-sites.
3. **Dos generaciones sin retiro.** Cuando la API cambia, la nueva se suma al lado de la vieja y la reconciliación queda como ternario adentro del componente: `StatCard.tsx:52` (`accent ?? (color === 'alert' ? 'amber' : color)`; 28 call-sites usan `color`, 9 usan `accent`), `Badge.tsx:90-92`. Nada se deprecia, todo convive.
4. **Regenerar en vez de importar.** 10 mapas `Record<Enum,...>` idénticos entre archivos, **6 implementaciones de `useIsClient`** — y el JSDoc del canónico admite serlo: `use-is-client.ts:13` dice *"Copia 1:1 de `src/modules/chatbot/components/admin/useIsClient.ts`"*.
5. **Crecer en vez de partir.** `OurServices.tsx` = **9.898 líneas**, cuatro `Scene` hermanas (WebScene 2.498 · AIScene 2.063 · AutomationScene 1.328 · SoftwareScene 1.496) y cuatro `advance<X>Tab` idénticos módulo el nombre.

> **El hilo común: cada archivo es coherente consigo mismo y ninguno consulta al de al lado. La forma es correcta; el contexto no existe.**

**Y el diagnóstico ya está escrito y nadie lo lee:** `eslint.config.mjs` hereda `react-hooks/set-state-in-effect` en **error**, y `npx eslint` sobre la capa UI devuelve **52 errores en 49 archivos**. No hay job de lint en CI.

## 3.2 · La firma del código generado — capa server

Acá la firma **no es copy-paste tonto: es lo contrario.**

1. **Se nombra una variabilidad que el negocio no tiene** y se construye el punto de extensión antes del segundo caso. `llm/factory.ts:28-43`: interface + factory + cache + degrade para **3 providers de los cuales 1 es real**, más `resetProviderCache` (`:52`) con **0 usos**. `premium-features.ts:98,116`: 2 vistas derivadas, 0 consumidores.
2. **Se extrae un núcleo puro "para que el invariante lo pruebe sin DB" y producción no lo importa** — la regla queda escrita dos veces. `announcements/visibility.ts:6` dice "la query espeja exactamente este predicado" y tiene **0 consumidores de producción**.
3. **El genérico por reflejo**, satisfecho con casts: `audit-log.ts:63` `omitAuditNoise<T extends Record<string, unknown>>` con **14 de 14 call sites** en `as unknown as Record<string, unknown>`.
4. **El rasgo que lo hace difícil de auditar:** el docblock explica el porqué con nivel de bitácora — hay **9.153 líneas de comentario sobre 45.932 de código (20%)** y casi ninguna es ruido: son decisiones. Pero **cuando declara deuda, la declara en prosa**: `report-eligible-plan.ts:6-8` dice *"DEBE coincidir exactamente con el gate real de build.ts… si ese gate cambia alguna vez, actualizar también acá"*. `decide.ts:18-19`: *"Si cambian los valores del enum, actualizar esta línea en paralelo"*.

> **Ese mismo rigor es el que hace que una abstracción de más se lea como una decisión tomada.** Y por eso el escéptico degradó el único hallazgo ALTO de esta categoría a BAJO: el argumento del comentario te convence, pero el compilador ya cerraba 3 de los 4 espejos.

## 3.3 · Lo que se lleva de la categoría — tres convenciones para `AGENTS.md`

No hay refactor que ejecutar. Hay criterio de escritura para los sprints que vienen:

> **(a)** Una `interface` no se crea hasta que haya **dos implementaciones que corran**. Hasta entonces es una función.
> **(b)** Si un comentario dice "espeja" o "debe coincidir", **el invariante de esa regla importa las dos puntas y las afirma iguales**. Si no, el comentario no cuenta como candado.
> **(c)** Un export sin consumidor no se mergea — y eso lo verifica `knip`, no la revisión humana.

**Lo demás se anota y se deja:** 58 `useCallback`, 16 props/variantes sin call-site, 10 wrappers pass-through, 4 hooks duplicados, 248 exports "por si acaso" (dead code → P1). Reescribirlo cuesta ~40 archivos tocados y **no mueve una sola métrica**.

---

# Categoría 4 — REGLAS ANTI-RECURRENCIA

> **El entregable durable.** Todo lo de abajo está **medido**, no calibrado a ojo: probes de ESLint corridos con `npx eslint --no-config-lookup --config /c/tmp/<probe>.mjs`, que reemplaza la config del proyecto y por lo tanto mide **solo** la regla probada. Los snippets van verbatim en el **Anexo B**.

## 4.0 · Dos hazards que hay que conocer antes de tocar nada

**① El hazard de flat config — probado con fixture, no deducido.**

> En flat config, dos bloques que setean **la misma regla** no concatenan opciones: **gana el último que matchea**.

Consecuencia concreta: varios hallazgos dicen "agregá otro bloque `no-restricted-syntax`, el repo ya usa ese mecanismo". **Hecho así, el segundo bloque que se agregue apaga en silencio la prohibición de `new PrismaClient` del chatbot** (`eslint.config.mjs:78-85`), que es el guard de aislamiento multi-tenant **B0-S3**. Y el build sigue verde.

→ **Antes de cualquier regla nueva:** consolidar los selectores en constantes compartidas y repetir `PRISMA_SELECTOR` en el bloque del chatbot. Cero violaciones nuevas, previene una regresión de seguridad. **Es la regla #2 y es obligatoria antes que las otras doce.**

**② El hazard de build en Next 16.**

`NEXT_PUBLIC_*` se reemplaza **textualmente** en build y **solo con acceso de miembro literal**. Un helper genérico (`readEnv('NEXT_PUBLIC_X')`, `process.env[name]`, destructuring) **no se inlinea** y llega `undefined` al browser. Por eso `src/config/public.ts` es una lista escrita a mano y **no** un loop sobre el manifiesto.

Las server-only no se inlinean, pero el módulo **sí se evalúa en build** (collect page data): un `schema.parse(process.env)` en top-level **rompe el deploy, no el request**. Por eso los accessors van **perezosos**. El repo ya llegó solo a esa forma en `security/oauth-state.ts:26` — se generaliza, no se inventa.

## 4.1 · El set de reglas, por retorno medido

| # | Regla | Nivel | Violaciones **medidas** | Mant. |
|---|---|---|---|---|
| **1** | **Job `lint` en CI** + `globalIgnores` de la basura de raíz + react-hooks a `warn` | error | 102 err + 113 warn hoy → **23 err en src** tras bajar react-hooks y sacar la basura (18 más viven en archivos muertos) | CERO |
| **2** | **Consolidar `no-restricted-syntax`** en constantes compartidas (hazard ①) | error | 0 — previene apagar el guard B0-S3 | CERO |
| 3 | Gmail/Hotmail/Outlook personal como literal en `src/` | error | **1** (`brevo-service.ts:33`) | CERO |
| 4 | `new PrismaClient` fuera de `src/lib/prisma.ts` (generalizar la del chatbot) | error | **0** (55 si se extendiera a `scripts/`+`prisma/` → por eso el alcance corta en `src/`) | CERO |
| 5 | Bloque de tamaño/complejidad acotado a `src/app/api/**` | error | **0** con los umbrales elegidos — trinquete, no tarea | CERO |
| 6 | `new Resend` fuera de `src/lib/email/` | error | **1** (`email.ts:4`) | CERO |
| 7 | `process.env` interpolado en template literal, en `src/app/api/cron/**` | error | **4 en 3 archivos** — exactamente las 3 rutas del `Bearer undefined` | CERO |
| 8 | `no-console` con `allow: ['warn','error']` en `src/`, salvo los 2 sinks | error | **7** (sin allow-list serían 308) | CERO |
| 9 | `z.string().email()` sin normalizar | error | **13 en 13 archivos** | CERO |
| 10 | `fail(error instanceof Error ? error.message : ...)` en `**/_actions` | error | **49** (todas en `_actions`; el carril setter aporta 1) | CERO |
| 11 | Helpers ya compartidos re-declarados (`slugify`, `emptyStringToUndefined`, `useIsClient`, `mapError`) | error | **29** → 26 tras P1 | CERO |
| 12 | URL base y origen propio (`NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, literal `https://develop.com.ar`) | error **solo junto con la migración** | **41 en 32 archivos** → 39 tras P1 | BAJO |
| 13 | Identidad de agencia: WhatsApp por env crudo + TZ AR literal | error tras migrar | **35 en 30 archivos** → llega a **0 exacto** post-migración | BAJO |
| 14 | Formateo de fechas a mano en la **capa server** | warn | **35 en 18 archivos** (repo-wide: 158 → por eso se acota) | BAJO |
| 15 | `standardEase` reescrito a mano | warn | **58 en 25 archivos** → 49 tras P1 (`OurServices.tsx` sola aporta 26) | CERO |
| 16 | Bajo retorno pero valen su línea: `useMemo` trivial (8), rol a mano (34), `monthlyQuota` (19), id de modelo LLM (17) | warn | medidas una por una | BAJO |

## 4.2 · Config centralizada — 4 archivos, no 10

**Criterio de corte, en una línea:**

> Sale a `src/config` la var con **≥2 lectores en módulos distintos**, **o** cuya ausencia produce un valor **plausible-pero-incorrecto** en vez de un error (link a `localhost` en un mail de prod, el string `"Bearer undefined"`, un Gmail personal como remitente). Todo lo demás se queda donde está.

Aplicado a la medición real: **4 vars concentran 75 de los 159 usos** — `NODE_ENV` 22, `NEXT_PUBLIC_APP_URL` 22, `NEXT_PUBLIC_WHATSAPP_NUMBER` 19, `CRON_SECRET` 12. `NODE_ENV` **no se toca** (es del framework, se inlinea, y moverla rompe el tree-shaking dev/prod). Quedan **53 usos = el 100% del valor**. Las otras 44 vars suman 84 usos, casi todas 1-5 dentro de su propio archivo de integración (`brevo.ts`, `tiendanube.ts`, `n8n.ts`, `pagespeed.ts`): ahí **el punto único ya existe** y moverlas solo agrega un import.

| Archivo | Rol |
|---|---|
| `src/config/public.ts` | Lo único que viaja al bundle del browser. Lista escrita a mano (hazard ②) |
| `src/config/urls.ts` | `appBaseUrl()` — el cluster de mayor volumen y mayor daño |
| `src/config/server.ts` | Accessors **perezosos** con Zod. Nunca `parse` en top-level |
| `src/config/env-manifest.ts` | Gobernanza, no accessor. Alimenta `check-env-drift` |
| `src/lib/security/cron-auth.ts` | **A propósito fuera de `src/config`**: el secret de cron solo tiene sentido junto con su comparación |

**No se propone:** barrel `src/config/index.ts` (ARQ ya penalizó barrels), `features.ts`, ni `constants.ts` (`leads-constants.ts`, `impersonation-constants.ts` y `design-tokens.ts` ya existen y moverlos no mueve ninguna métrica).

**Orden de migración — no las 159 de una:**

| Paso | Qué | Alcance | Al cerrar |
|---|---|---|---|
| 0 | Crear `public.ts` + `urls.ts` + los selectores en **`warn`**. No se migra nada. 1 commit | — | — |
| 1 | `appBaseUrl` | 20 archivos, todos server, caminos de email/notificación | selector a `error` |
| 2 | WhatsApp | **12 componentes client vivos** (3 de los 15 están muertos: **no migrarlos**, se borran en P1) | selector a `error` |
| 3 | `cron-auth` | 8 rutas (5 ya tienen el patrón bueno duplicado, 3 el roto) | cierra con el invariante que ya existe, re-apuntado |
| 4 | Remitente de emails | cuando Franco defina qué dominio está verificado | — |
| — | **No se migra** | `NODE_ENV` ni las 44 vars de 1-5 usos | — |

> **Regla que congela el avance:** un selector `no-restricted-syntax` **por var migrada, en el mismo commit que la migración**. **Nunca** una regla genérica contra `process.env`: dispararía 159 veces y muere a fuerza de `eslint-disable`.

**Qué pasa con `scripts/check-env.js`:** ni se borra ni se deja. Se reescribe importando `ENV_MANIFEST` (pierde sus dos listas propias) y queda como comando **local/pre-deploy**, porque chequea **valores**. El que va a CI es `check-env-drift`, que chequea **nombres** y por eso corre **sin un solo secret**. Esa distinción es la razón de fondo por la que `check-env` nunca pudo estar en CI.

## 4.3 · El candado de CI

**Estado hoy:** `knip` (^6.16.1, con `knip.ts`) y `dependency-cruiser` (^17.4.3, con `.dependency-cruiser.cjs`) están **instalados sin script npm ni job**. `eslint-plugin-unused-imports` (^4.4.1) está instalado y **no referenciado** en `eslint.config.mjs`, mientras hay 48 warnings de `no-unused-vars` esperando. `e2e.yml` corre `invariants` + `leados-integration` + `test`. **No hay job de lint ni de tipos.**

| Pieza | Decisión | Por qué |
|---|---|---|
| `typecheck` (`tsc --noEmit`) | **BLOQUEA** | **0 errores hoy, 35 s.** Si se pone rojo, es un bug. La adición más barata y valiosa del entregable |
| `lint:ci` con bulk suppressions | **BLOQUEA** | Verde día 1 **por construcción**, siempre que se ignoren los 10 `.js` de la raíz |
| `check:env-drift` | **BLOQUEA** | Verde en el commit que lo introduce: el manifiesto se escribe con las 48 vars medidas |
| `knip --include unlisted` | **BLOQUEA** | Apenas se declaren las 4 deps faltantes |
| `knip` completo | **REPORTA** (`continue-on-error`) | Hasta P1 |
| `dependency-cruiser` | **NO ENTRA** | Una pieza menos que mantener |
| `next build` | **NO ENTRA** | No se midió (necesita `DATABASE_URL` en build). No se propone sin medir |

**Baseline sin inventar nada:** ESLint tiene **bulk suppressions nativas desde 9.24** y el repo está en **9.39.4**. No hace falta escribir un mecanismo de allowlist.

**Costo:** job `static` ≈ **4,5 min de runner**. En **wall clock el pipeline no cambia** (los 4 jobs corren en paralelo; el long pole sigue siendo Chromium + Playwright). Lo que cuesta son minutos facturados — y ahí **el ahorro más grande no está en el job nuevo**: hoy `on: [push, pull_request]` dispara los 3 jobs **dos veces** por cada push a una rama con PR abierto. El bloque `concurrency: cancel-in-progress` **paga varias veces el job nuevo**.

## 4.4 · Reglas que **NO** se proponen (con el número que lo justifica)

Esta sección vale tanto como la anterior.

| Regla | Medición | Veredicto |
|---|---|---|
| `no-magic-numbers` | **6.363 violaciones** con la config del brief (4.298 en components, 610 modules, 546 lib, 294 app; `OurServices.tsx` sola aporta 516). La zona más limpia es `src/app/api` con 25, y ahí el valor es nulo (status codes y tamaños de página) | **No.** Una regla con 6.363 hits no se prende: se silencia |
| `complexity` / `max-lines*` **globales** | Curva medida: complexity >10 = 369, >15 = 165, >20 = 76, >25 = 44, >40 = 9 (máx 56). `max-lines-per-function` >50 = 1.006, >150 = 246, >300 = 65 (máx 2.480). `max-lines` >300 = 155, >800 = 29 (máx 9.898) | **No hay umbral que dé ~0 sin volverse decorativo.** Solo acotadas a `src/app/api`, donde el conteo real es 0 |
| `sonarjs/no-duplicate-string` | No instalado → re-implementado como regla AST inline con la misma semántica. **448 grupos en 168 archivos**; acotado a la capa server da **25**, con señal real ("Lead no encontrado" ×11) | **No.** 25 hits no justifican instalar y mantener un plugin más en una agencia de 2 personas |
| `complexity` como proxy de *cognitive-complexity* | La ciclomática **no es** la cognitiva (una cuenta ramas, la otra penaliza anidamiento) | **Dicho explícito:** los números sirven como orden de magnitud, no como sustituto. **Ninguna regla se apoya en esa equivalencia** |
| `@typescript-eslint/no-unnecessary-type-parameters` | Exige linting **type-aware**. `npx eslint` ya tarda 47 s sobre 1.472 archivos; type-aware lo lleva a minutos | **No paga para 6 casos** |
| `no-restricted-imports` de `next/cache` | **88 archivos** lo importan | Es una migración, no un candado |
| Constantes duplicadas entre archivos, mapas `Record<Enum>` regenerados, espejos declarados en prosa | — | **ESLint no cruza archivos.** Eso se fija con `*.invariant.ts` (la infra que el repo ya opera) o no se fija |
| Generador de `.env.example` desde el manifiesto | — | Codegen que hay que mantener, contra un drift-check de 40 líneas que solo lee |
| `jscpd` u otro detector de copy-paste | — | Post-P1, y como reporte, no como candado |

## 4.5 · Honestidad de mantenimiento — quién la mira en 3 meses

**Cero mantenimiento, sobreviven solas:** `typecheck` (a los 3 meses o está verde o te avisó de un bug real) · `src/config/public.ts`, `urls.ts`, `cron-auth.ts` (son código con consumidores: se mantienen porque se usan) · el bloque ESLint de env (se toca solo cuando se migra un cluster; si nadie migra, no hay nada que mantener) · **no** prender depcruise y **no** cablear `unused-imports`: dos piezas menos.

**Bajo mantenimiento, con una condición:** `eslint-suppressions.json` (el riesgo real no es el conteo, son los conflictos de merge — con 2 personas y ramas cortas es tolerable) · `ENV_MANIFEST` + drift (si nadie lo mira sigue verde, **salvo que alguien agregue una var** — y ahí falla en el PR que la agregó, que es el único momento en que sirve) · `run-invariants` (el único mantenimiento es la lista `REQUIEREN_DB`, hoy con **1 entrada medida**).

**La pieza más frágil, marcada explícitamente:** el step de `npx knip` completo con `continue-on-error`. Un reporte que nadie mira es ruido. Se propone igual porque cuesta 3 segundos y es el único detector de dead code del repo, **pero de entrada: si a los 3 meses el conteo sigue igual y nadie lo abrió, se saca sin culpa** y queda `npm run check:dead` a demanda. El step de `--include unlisted` sigue solo y es el que valía la pena.

---

# Huecos — lo que esta auditoría NO miró

El crítico de completitud verificó cada hueco con un grep antes de listarlo.

| Grav. | Hueco | Evidencia medida |
|---|---|---|
| **ALTA** | **El gate de build está desactivado** | `next.config.ts:11-16`: `typescript.ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true` (desde 2026-06-28, `5e2a406`). No hay script `typecheck` en los 76 scripts. Ningún job corre `eslint` ni `tsc` |
| **ALTA** | **Nadie preguntó quién dispara los cron** | `netlify.toml` agenda 3 functions y `netlify/functions/` contiene **UNA** (`cleanup-old-events-cron.ts`) → **2 schedules apuntan a functions inexistentes**. `vercel.json` declara 3 crons en un repo que `README.md:13` documenta como Netlify → **Netlify no lee `vercel.json`**. `/api/cron/alerts` no tiene **ni una referencia** en todo el repo. De 8 rutas, **una sola** tiene disparador vivo verificable |
| **ALTA** | **Volumen** (tamaño de archivo y función) — dimensión entera no cubierta, y el propio repo la declara como límite | **29 archivos >800 LOC** (el techo escrito en las reglas) · **112 componentes >300 LOC** (señal de vibecode marcada como prohibida) · **133 funciones >200 líneas, 18 >500** (el estándar dice <50). Peor caso: `OurServices.tsx` = **9.898 LOC**, **vivo** (`page.tsx:14` lo carga con `dynamic`). Segundo, con riesgo de producción: `handleChatRequest` = **1.335 líneas** (`handleChatRequest.ts:351`), la ruta caliente del producto |
| **ALTA** | **El agujero del set de reglas**: todo lo propuesto es ESLint, pero la clase de defecto más cara **no es sintáctica** — es *drift de manifiesto* (ver la tesis) | Ninguna la puede ver un linter. Por eso el entregable incluye invariantes y drift-checks, no solo reglas |
| MEDIA | **`as unknown as` es el `any` encubierto** | La regla no-negociable se cumple al pie de la letra (`: any` = 2, `as any` = 4, `@ts-ignore` = 0) **pero el escape se mudó de nombre: 53 usos**. 35 en `src/modules/chatbot`. Patrón dominante: el **mismo triplete de campos `Json` de Prisma casteado a mano en 5 archivos**. Raíz: **23 campos `Json`** en `schema.prisma` sin tipo compartido |
| MEDIA | **`scripts/` y la raíz quedaron fuera de todas las lentes — y también de knip** | `knip.ts` limita `project` a `src/**`, `prisma/seed*` y `tests/**`: el reporte de dead code es **incompleto por construcción**. Medido ahí: **36 `new PrismaClient()`** en scripts+prisma (cada script abre su pool, sin pasar por `src/lib/isolation`) · **28 archivos basura trackeados en la raíz** (`script.js`, `script2/3`, `find_unused.js`, `ts_errors.txt`, `unused_report*.txt`, 10 `_lane-*.md`, `__dev_task.md`) · logs y JSON de corridas commiteados dentro de `scripts/` |
| MEDIA | **Accesibilidad** — regla ya escrita en el quality baseline ("aria-labels on all icon-only elements") | De **32 `<button>` icon-only**, **22 sin `aria-label`/`aria-labelledby`/`title`**. Incluye los diálogos de **acciones destructivas** (`confirm-dialog.tsx:85`, `type-to-confirm-dialog.tsx:105`) |
| MEDIA | **Rutas dev/test expuestas en producción** | `src/app/api/test-sentry/route.ts` son 4 líneas: `export async function GET() { throw new Error(...) }` — **cero auth, cero chequeo de `NODE_ENV`, GET público**. El contraste que prueba que el repo sabe hacerlo bien está a dos directorios: `api/dev/email-preview/executive-weekly/route.ts:107` **sí** cierra con un 404 en producción |

---

# Tabla final — qué ejecutar, qué no, qué es candado

## A. EJECUTAR (Opus), por orden de retorno

| # | Trabajo | Por qué primero | Costo |
|---|---|---|---|
| **1** | **`scripts/run-invariants.ts`** por descubrimiento + job `typecheck` + job `lint` en CI | **Sin esto todo lo demás es texto muerto.** 40 invariantes ya escritas empiezan a correr; `tsc` está verde hoy | 1 sprint chico |
| **2** | **Consolidar `no-restricted-syntax`** en constantes compartidas | Hazard ①: cualquier regla nueva agregada mal **apaga el guard B0-S3** | 20 min |
| **3** | **`src/lib/security/cron-auth.ts`** + `CRON_SECRET` a CRITICAL + invariante enganchado | Cierra el `Bearer undefined`. La forma correcta ya existe 5 veces en el repo | 1 sprint chico |
| **4** | **Paquete de trinquetes gratis**: gmail personal (1), `new PrismaClient` global (0), tamaño en `api/**` (0), `new Resend` (1), env-en-template en cron (4) | **6 líneas de código a tocar, 5 clases de error cerradas para siempre** | 1 h |
| **5** | **`emailSchema` normalizado** + script de detección de colisiones | Bug de login 100% silencioso, en las dos puntas | 1 sprint |
| **6** | **Slug tipado de módulos premium** + decidir `email-marketing-pro` vs `email-marketing` | Un módulo de US$80/mes es inalcanzable hoy | medio sprint |
| **7** | **Cuota: las 4 superficies admin leen `getPlanForOrg().quota`** | 4 archivos, cero riesgo, elimina alertas fantasma | 1 h |
| **8** | **`src/config/urls.ts` + `appBaseUrl()`**, migración paso 1 | Links de baja rotos = compliance, no UX | 1 sprint |
| **9** | **`mapError` a `src/lib/action-utils.ts`, que loguee** | Un cambio arregla los 96 catch mudos **y** los 63 leaks | 1 sprint |
| **10** | **`getWhatsappHref()`** + precedencia DB > env, migración paso 2 | El panel de admin miente | medio sprint |
| **11** | **Fechas: solo los ~5 sitios server-only** a `dates-ar.ts` | Los client-side son deuda, no bug | 2 h |
| **12** | **`revalidateTag` en los 2 invalidadores** de la cola de revisión | Fix de 2 líneas | 10 min |
| **13** | **`ENV_MANIFEST` + `check-env-drift`** en CI | Cierra la clase entera "dos listas que divergieron" | 1 sprint chico |

## B. NO EJECUTAR (diagnosticado a propósito)

- **Toda la Categoría 3.** 58 `useCallback`, 71 `useMemo`, 16 props sin call-site, 10 wrappers pass-through, 6 `useIsClient`, la capa de providers LLM, los genéricos con un solo tipo. ~40 archivos tocados, cero métricas movidas. → Se toca **solo si ya estás en ese archivo por otra razón**.
- **Los 4 refutados** (TTLs de caché, moneda USD, 3 formas de `ActionResult`, los 151 console): no son hallazgos.
- **Consolidar los 33 id-schemas**, las **4 políticas de retry**, y los **28 selects repetidos de Prisma** (de 522 — el negativo útil): no pagan.
- **Migrar los 57 sitios de fechas** ni los **159 `process.env`** de una: solo los clusters medidos.
- **`dependency-cruiser` como job de CI**, y **cablear `unused-imports`**: dos piezas menos que mantener.
- **Cualquier cosa que viva en los 69 archivos muertos**: se borra sola en P1.

## C. CANDADO (fija lo aprendido)

| Tipo | Piezas |
|---|---|
| **CI** | job `static` (typecheck **bloquea** · lint con bulk suppressions **bloquea** · env-drift **bloquea** · `knip --include unlisted` **bloquea** · knip completo **reporta**) + `concurrency: cancel-in-progress` |
| **ESLint** | 16 reglas medidas — 13 en `error` (5 de ellas con 0-1 violaciones hoy: trinquete puro), 3 en `warn` con contador que solo baja |
| **Invariantes** | `run-invariants` por glob + invariante de `cron-auth` + invariante de mapas de enum + `ROUTE_MAX_DURATION_MS` |
| **Convención** | La **regla de decisión config-vs-literal** en `CLAUDE.md` · las **3 reglas de escritura** en `AGENTS.md` (interface solo con 2 implementaciones · "espeja" exige invariante de dos puntas · export sin consumidor no mergea) · un selector **por var migrada, en el commit de la migración** |

---

# Anexo A — metodología y correcciones al insumo

**Truco de medición que vale reusar:** en vez de correr eslint N veces con N umbrales, se corre **una vez** con `complexity: max 1`, `max-lines: max 1`, etc. y se reconstruye la curva entera parseando el valor que cada mensaje reporta. **Una corrida de 7 s da todos los umbrales de las 5 reglas de tamaño.**

**Probes reutilizables** (en `/c/tmp/`): `probe-size.mjs`, `probe-sel.mjs` (24 selectores), `probe-c.mjs`, `probe-b.mjs`, `probe-console.mjs`, `probe-magic.mjs`, `probe-dup.mjs`, `probe-override.mjs` (el fixture del hazard ①), más los agregadores `curve.cjs`, `zones.cjs`, `deadoverlap.cjs`.

**Correcciones a los conteos originales, hechas por los escépticos:**

| Afirmación original | Real |
|---|---|
| 150 catch, 107 silenciosos (71%) | **139 catch, 96 silenciosos (69%)** |
| 151 console en producción | **202** (sub-contado, no inflado) |
| 39 de 55 invariantes fuera de CI | **40 de 56** (35 scripts `check:invariant:*`, no 36) |
| `check:invariant:idor` no está cableado | **No existe.** El real es `check:invariant:security` y **sí** está cableado |
| Slug premium: 56 ocurrencias | **2 call sites** son el defecto; el resto son rutas de URL |
| `RESEND_FROM_EMAIL` en `check-env.js:44` | **`:42`** |

**Corrección al insumo de dead code:** la lista de `/c/tmp/clean-knip-files.txt` (100 rutas, generada con `knip --include files`) tiene **31 falsos positivos** — toda la suite Playwright (`tests/setter`, `tests/leados`, `tests/integration`) y 4 archivos vivos del motor. **El número real de archivos muertos es 69.** Para P1: usar `npx knip` a secas, no `--include files`.

**Dos fixes de minutos que salieron de medir** (no son candados, son bugs latentes): **(1)** hay **4 deps no declaradas**, una de ellas importada por `HeroArtifact.tsx` (archivo congelado); **(2)** `getProvidedCronSecret` sigue exportada desde `api/cron/cleanup-old-events/route.ts:29`, que es un export no-handler en un `route.ts` de Next 16 — mudarla a `cron-auth.ts` lo resuelve de paso.

**Nota sobre el timing:** conviene prender el job de lint **después** de la limpieza P1: de los 80 errores que hoy tira el linter en `src/`, **18 viven en archivos muertos**. El baseline baja solo, sin tocar código vivo.

---

*Auditoría read-only. Cero cambios en `src/`. Los snippets de configuración van en el Anexo B, al final.*

---

# Anexo B — configuración verbatim

> Todo lo de abajo sale de los agentes que **midieron** sobre el repo real en `49fec9b`. Los conteos son medidos salvo donde dice lo contrario. Pegar en orden: la pieza 2 (consolidar `no-restricted-syntax`) es **prerequisito** de las demás reglas de ESLint.

## B.1 · Reglas de ESLint (medidas)

### 1. JOB `lint` en CI + globalIgnores de la basura de raíz (prerequisito de TODO lo demás)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (ya instalado, ya configurado) |
| **Alcance** | Todo el repo. Es config de eslint.config.mjs + un job en .github/workflows/e2e.yml |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO. `npx eslint` con la config REAL del repo, hoy: 102 errores + 113 warnings sobre 1.472 archivos, 47s de corrida. Desglose: src/** = 80 errores / 54 warnings; raíz junk .js = 10 errores + 1 parse error binario; scripts/ = 8 errores + 46 warnings; prisma/ = 3 errores. De los 80 errores de src, 57 son de la familia react-hooks (37 set-state-in-effect · 13 purity · 4 refs · 2 immutability · 1 preserve-manual-memoization). Bajando esos 5 a warn e ignorando la basura de raíz, quedan 23 errores en src: 9 no-explicit-any · 8 no-unescaped-entities · 3 no-assign-module-variable · 2 jsx-no-comment-textnodes · 1 no-html-link-for-pages. Y 18 de los 80 errores viven en archivos que knip ya declara muertos, o sea desaparecen solos en P1.

**Cómo se midió:** cd /c/Users/franc/Desktop/wt-auditoria-clean/logic-core-v3 && npx eslint -f json > /c/tmp/out-project.json  (config REAL del repo, sin --config) + agregación por regla/zona/severidad con /c/tmp/proj.cjs y /c/tmp/proj2.cjs; cruce con /c/tmp/clean-knip-files.txt en /c/tmp/deadoverlap.cjs; tiempo con `time npx eslint -f compact`

**Qué hallazgo fija:** Fija el hallazgo «El candado que fija esta lente YA está prendido a error y nadie lo corre: 52 errores de ESLint en la capa UI, sin job de lint en CI» — y lo corrige al alza: son 80, no 52. También fija el hallazgo del PATRÓN IA capa UI (react-hooks/set-state-in-effect = el efecto que espeja prop en estado, 37 casos, es el sub-patrón dominante) y, de rebote, la regla NO-NEGOCIABLE de CLAUDE.md «Never use any. Zero exceptions»: hay 9 `any` en src/ que el linter ya marca como error y nadie ve (src/lib/integrations/pagespeed.ts:77,129,132 · src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx:26,36,37 · src/app/api/cron/generate-insights/route.ts:58 · src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:601 · src/components/canvas/LiquidProject.tsx:8). Sin este job, NINGUNA de las 14 reglas de abajo se ejecuta jamás: son texto en un archivo.


```js
// eslint.config.mjs — ampliar el globalIgnores que ya existe (línea 9)
globalIgnores([
  ".next/**", "out/**", "build/**", "next-env.d.ts",
  // Scripts sueltos de raíz: 10 errores de no-require-imports + 1 archivo binario.
  // No son fuente del producto; hoy son el 11% de los errores del lint.
  "script*.js", "replace_analytics.js", "find_unused.js",
]),

// Y para que el job arranque en VERDE hoy (57 errores react-hooks -> warn):
{
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "react-hooks/set-state-in-effect": "warn",   // 37 hoy
    "react-hooks/purity": "warn",                 // 13 hoy
    "react-hooks/refs": "warn",                   // 4 hoy
    "react-hooks/immutability": "warn",           // 2 hoy
    "react-hooks/preserve-manual-memoization": "warn", // 1 hoy
  },
},

// package.json:  "lint": "eslint --max-warnings=200"
// .github/workflows/e2e.yml — job nuevo, gemelo del job `invariants`:
//   lint:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with: { node-version: '20' }
//       - run: npm ci
//       - run: npm run lint
```


### 2. CONSOLIDAR `no-restricted-syntax` en una constante compartida (hazard de flat config, verificado)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint |
| **Alcance** | Estructural: afecta cómo se escriben TODAS las reglas de abajo. No agrega violaciones. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** 0 violaciones nuevas. Pero PREVIENE una regresión de seguridad medida: hoy, si se agrega un segundo bloque `no-restricted-syntax` que matchee archivos del chatbot, el bloque existente de eslint.config.mjs:78 (la prohibición de `new PrismaClient`, guard de aislamiento B0-S3) se APAGA EN SILENCIO.

**Cómo se midió:** Probe de dos bloques flat config sobre el mismo fixture: /c/tmp/probe-override.mjs con bloque-1 = NewExpression[callee.name='PrismaClient'] y bloque-2 = Literal[value='develop'], ambos con files ['**/*.ts']; fixture /c/tmp/fx/f3.ts con las dos violaciones presentes. Salida: SOLO reportó `BLOQUE-2-develop` (línea 3). El bloque-1 no disparó. En flat config las opciones de una misma regla se REEMPLAZAN, no se concatenan: gana el último bloque que matchea.

**Qué hallazgo fija:** Es el prerequisito de implementación de las 12 reglas `no-restricted-syntax` que siguen. El repo ya tiene DOS bloques propios (motor con no-restricted-imports en :20, chatbot con no-restricted-imports + no-restricted-syntax en :58 y :78). Agregar reglas nuevas sin esta consolidación no es neutro: desarma el aislamiento del chatbot. Aplica igual a `no-restricted-imports` (los dos bloques existentes son disjuntos hoy — motor vs chatbot — pero cualquier bloque global futuro los pisa).


```js
// eslint.config.mjs — arriba del defineConfig
const SELECTORES_GLOBALES = [
  { selector: "Literal[value=/@(gmail|hotmail|outlook|yahoo)\\.com$/]",
    message: "No hay cuentas personales en el código." },
  { selector: "NewExpression[callee.name='PrismaClient']",
    message: "El acceso a datos va por src/lib/prisma.ts o src/lib/isolation/." },
  // ...resto de selectores globales de las reglas de abajo
]

// bloque global
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/prisma.ts", "src/lib/isolation/**"],
  rules: { "no-restricted-syntax": ["error", ...SELECTORES_GLOBALES] },
},

// y el bloque del chatbot que YA existe (eslint.config.mjs:78) tiene que
// RE-SPREADEAR los globales, si no los pierde:
{
  files: ["src/modules/chatbot/**/*.{ts,tsx}", "src/app/api/chatbot/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "error",
      ...SELECTORES_GLOBALES,
      { selector: "NewExpression[callee.name='PrismaClient']",
        message: "El chatbot no instancia PrismaClient... — B0-S3." },
    ],
  },
}
```


### 3. no-console (allow warn/error) en src/, salvo los dos sinks de logging

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint |
| **Alcance** | src/** excepto __tests__, *.invariant.ts, evals/ y prisma/ (esos imprimen a stdout por diseño). Allowlist: los 2 archivos que SON el logger. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 7. La config exacta de arriba deja 7 violaciones en 3 archivos: src/lib/email/notify-message.ts (4), src/modules/chatbot/server/tools/captureLead.ts (2), src/lib/email/admin-message-notification.ts (1). Curva completa: no-console SIN allow y sin ignores = 308 en 138 archivos (103 en invariantes/tests, 92 en src/lib, 51 en src/modules, 23 en modules/**/server, 11 en src/app, 11 en src/app/api, 7 en src/components). O sea: el 97% del ruido son console.warn/console.error (que son logging legítimo) y salidas de invariantes.

**Cómo se midió:** npx eslint --no-config-lookup --no-inline-config --config /c/tmp/probe-console2.mjs "src/**/*.ts" "src/**/*.tsx" -f json  (probe con allow:['warn','error'] + ignores de tests/evals/prisma) → 10 hits, de los cuales 3 son los propios sinks (src/lib/logger.ts:10 `console.log(message)` y src/modules/chatbot/server/logging/logger.ts x2, leídos y confirmados) → 7 reales. Contraste medido con /c/tmp/probe-console.mjs (sin allow, sin ignores) = 308.

**Qué hallazgo fija:** Fija el hallazgo «Tres superficies de logging conviviendo: la abstracción perdió 33 a 247», que concluía «ninguno posible: no-console daría 132 errores el día uno y se muere a fuerza de eslint-disable». Ese veredicto era correcto para `no-console` pelado; con `allow:['warn','error']` + los ignores de tests, el número real es 7 y la regla SÍ se sostiene. También cierra el ítem «No console.log or debug statements» del checklist de code-review de CLAUDE.md, que hoy no lo verifica nadie. Dato de color medido: hay 45 directivas `eslint-disable ... no-console` INÚTILES en scripts/ (ESLint las reporta como «Unused eslint-disable directive») — alguien ya escribió los disables para una regla que nunca se prendió.


```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: [
    "src/**/__tests__/**",
    "src/**/*.invariant.ts",
    "src/modules/chatbot/evals/**",
    "src/modules/chatbot/prisma/**",
    // los sinks: acá console ES la implementación
    "src/lib/logger.ts",
    "src/modules/chatbot/server/logging/logger.ts",
  ],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
}
```


### 4. Bloque de tamaño/complejidad acotado a src/app/api/** (la frontera HTTP)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint |
| **Alcance** | Solo src/app/api/**. Deliberadamente NO global: en src/components las mismas reglas dan entre 155 y 1.006 violaciones. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 0 (cero) con esos umbrales exactos. Los máximos REALES de src/app/api hoy: archivo más largo < 500 líneas; función más larga = 148 líneas (src/app/api/cron/os-follow-up/route.ts:153); complejidad máxima = 23 (src/app/api/reports/monthly/route.ts:21); profundidad máxima = 5 (src/app/api/cron/generate-insights/route.ts:63); params máximo = 3. Los umbrales están puestos justo arriba del techo actual: es un trinquete, no una tarea.

**Cómo se midió:** Una sola corrida con TODAS las reglas de tamaño en max:1 (/c/tmp/probe-size.mjs) y reconstrucción de la curva completa parseando el valor real que cada mensaje reporta (/c/tmp/curve.cjs y /c/tmp/zones.cjs). Curva GLOBAL medida, para contraste — complexity: >10=369, >15=165, >20=76, >25=44, >30=27, >40=9 (máx 56). max-lines-per-function: >50=1006, >100=438, >150=246, >300=65, >500=21 (máx 2.480). max-lines: >300=155, >500=71, >800=29, >1000=15 (máx 9.898 = OurServices.tsx). max-depth: >3=14, >4=4, >5=0. max-params: >3=28, >4=5, >6=1, >7=0. Por zona, src/app/api es la ÚNICA que da 0 en todo.

**Qué hallazgo fija:** No fija un hallazgo puntual: fija la clase entera «archivo que crece en vez de partirse» (hallazgo PATRÓN IA punto 5, OurServices.tsx 9.898 líneas) en la única zona donde hoy se puede prender sin romper nada. La frontera HTTP es además donde más duele una función de 300 líneas (auth + validación + query + respuesta mezclados). Extenderla a **/_actions daría 2 violaciones de complexity>20 y 1 de max-lines>500: viable pero ya no gratis. A src/components es imposible (49 archivos >500 líneas).


```js
{
  files: ["src/app/api/**/*.{ts,tsx}"],
  rules: {
    "max-lines": ["error", { max: 500, skipBlankLines: false, skipComments: false }],
    "max-lines-per-function": ["error", { max: 200, skipBlankLines: false, skipComments: false }],
    complexity: ["error", { max: 25 }],
    "max-depth": ["error", { max: 5 }],
    "max-params": ["error", { max: 4 }],
  },
}
```


### 5. Prohibir `process.env` interpolado dentro de template literal en src/app/api/cron/**

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/app/api/cron/** exclusivamente. Global daría 23. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 4 violaciones en 3 archivos, y son EXACTAMENTE las 3 rutas del hallazgo — src/app/api/cron/detect-bot-issues/route.ts:8, src/app/api/cron/generate-insights/route.ts:12 y :69, src/app/api/cron/send-weekly-reports/route.ts:8. Ampliando a src/app/api/** serían 5 (suma src/app/api/admin/users/[userId]/resend-credentials/route.ts:76). Repo-wide: 23 en 21 archivos.

**Cómo se midió:** Selector medido en /c/tmp/probe-sel.mjs (id R01), corrido sobre src/**/*.{ts,tsx}, y filtrado por path en /c/tmp/scoped.cjs. Precisión verificada con fixture /c/tmp/fx/f2.tsx: `process.env.CRON_SECRET` suelto (línea 1) NO dispara; `` `Bearer ${process.env.CRON_SECRET}` `` (línea 2) SÍ dispara. Cero falsos positivos.

**Qué hallazgo fija:** Fija el hallazgo #1 de la auditoría: «3 rutas /api/cron autentican contra el string literal \"Bearer undefined\" cuando CRON_SECRET falta». Es el fallback hardcodeado que nadie escribió — lo fabrica la interpolación. El selector ataca la FORMA (env dentro de template), no el nombre de la var, así que también atrapa la próxima ruta de cron que se escriba con el mismo molde. Complemento no-lint que ya recomendó la categoría 1: extender src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts al helper compartido y sumar `npm run check-env` al job invariants.


```js
{
  files: ["src/app/api/cron/**/*.ts"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "TemplateLiteral MemberExpression[object.object.name='process'][object.property.name='env']",
        message:
          "Nunca interpolar process.env en un template literal: si la var falta, el valor esperado se materializa como el literal 'Bearer undefined' y cualquiera que mande ese header pasa el check. Usar assertCronRequest() de src/lib/security/.",
      },
    ],
  },
}
```


### 6. Prohibir cuentas de correo personales como literal en src/

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** completo. Va en SELECTORES_GLOBALES. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 1 (una). src/lib/email/brevo-service.ts:33 — `email: process.env.BREVO_FROM_EMAIL ?? 'valenolme2@gmail.com'`. Es exactamente el hallazgo. Cero falsos positivos en las 1.308 fuentes.

**Cómo se midió:** Selector R06 en /c/tmp/probe-sel.mjs sobre src/**/*.{ts,tsx}. Cruce con la lista de knip: 0 de las ocurrencias vive en archivo muerto (o sea, el gmail personal está VIVO en el camino de envío).

**Qué hallazgo fija:** Fija el hallazgo «Un Gmail personal (valenolme2@gmail.com) es el remitente de producción por defecto de Brevo». Es un candado de una línea con una sola violación: se borra el fallback, se prende en error, y la clase de error queda cerrada para siempre. De todas las reglas de esta auditoría, es la de mejor relación valor/costo en términos absolutos.


```js
// dentro de SELECTORES_GLOBALES
{
  selector: "Literal[value=/@(gmail|hotmail|outlook|yahoo)\\.com$/]",
  message:
    "No hay cuentas personales en el código. El remitente y el contacto de la agencia salen de src/lib/agency-settings.ts / de env verificada en el proveedor.",
}
```


### 7. Generalizar la prohibición de `new PrismaClient` de src/modules/chatbot a todo src/

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** excepto src/lib/prisma.ts y src/lib/isolation/**. NO extender a scripts/ ni prisma/. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 0 (cero). En todo src/ hay UNA sola instanciación y es la legítima: src/lib/prisma.ts:6. Contraste medido: si se extendiera a scripts/ + prisma/ serían 55 violaciones en 54 archivos (prisma/seed.ts, prisma/seeds/sync-plans.ts, scripts/dev/seed-*.ts, scripts/regression/*, etc.) — por eso el alcance se corta en src/.

**Cómo se midió:** Selector R24 en /c/tmp/probe-sel.mjs sobre src/** = 1 hit (src/lib/prisma.ts). Segunda corrida ampliada (/c/tmp/probe-b.mjs, id B01) sobre src + scripts + prisma + tests = 55 hits, todos fuera de src salvo ese.

**Qué hallazgo fija:** El repo ya paga esta regla para src/modules/chatbot/** (eslint.config.mjs:78, guard de aislamiento B0-S3). Medido: extenderla a todo src/ cuesta CERO violaciones. Hoy nada impide que un archivo nuevo de src/app o src/lib se abra su propio pool contra la DB multi-tenant y saltee src/lib/isolation/ — el candado existe pero solo cubre un módulo. Es la generalización más barata disponible: el equipo ya sabe mantener exactamente esta regla.


```js
// dentro de SELECTORES_GLOBALES, con el ignores del bloque global:
// ignores: ["src/lib/prisma.ts", "src/lib/isolation/**"]
{
  selector: "NewExpression[callee.name='PrismaClient']",
  message:
    "No se instancia PrismaClient fuera de src/lib/prisma.ts. El acceso del chatbot y del motor va por src/lib/isolation/ (forOrg / unsafeGlobalQuery) — B0-S3.",
}
```


### 8. Prohibir `new Resend` fuera de src/lib/email/

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** excepto src/lib/email/** |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 1. src/lib/email.ts:4 — `const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null` (leído; ese mismo archivo hardcodea `from: 'develOP Agency <hello@develop-agency.com>'` en la línea 21). La otra instanciación, src/lib/email/notify-message.ts:18, ya está dentro del directorio permitido. Total repo-wide: 2.

**Cómo se midió:** Selector R22 en /c/tmp/probe-sel.mjs + filtrado por path en /c/tmp/scoped.cjs. Confirmado leyendo src/lib/email.ts:1-25.

**Qué hallazgo fija:** Fija el hallazgo «El remitente de los emails está hardcodeado en 4 formas distintas, con un Gmail personal como fallback de producción» — y lo fija por construcción: si solo hay un módulo que puede construir el cliente, solo hay un lugar donde se decide el `from`. Es la regla que la categoría 3 ya había propuesto («calcado de la regla que el repo ya tiene para new PrismaClient»); acá está medida: cuesta mover un archivo (src/lib/email.ts → src/lib/email/index.ts) o sumar ese path al ignores.


```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/email/**"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "NewExpression[callee.name='Resend']",
        message:
          "El cliente de Resend (y con él la decisión del remitente) vive en src/lib/email/. Un solo lugar decide el `from`.",
      },
    ],
  },
}
```


### 9. URL base y origen propio: prohibir NEXT_PUBLIC_APP_URL / NEXTAUTH_URL crudos y el literal https://develop.com.ar

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** excepto el módulo de config que se cree (src/lib/app-url.ts) + src/auth.ts + src/lib/agency-settings.ts + src/lib/security/first-party-origins.ts |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** MEDIDO: 41 en total (26 + 15), sobre 32 archivos. Desglose: NEXT_PUBLIC_APP_URL = 22 en 20 archivos; NEXTAUTH_URL = 4 en 4 archivos (src/app/forgot-password/actions.ts:87, src/lib/actions/invitations.ts:109, src/lib/actions/settings.ts:191, src/lib/alerts.ts:50 — este último es el accessor getBaseUrl() correcto pero privado); literal https://develop.com.ar = 15 en 12 archivos, de los cuales los 4 del hallazgo de seguridad son src/lib/security/validate-origin.ts:71 y :72 y src/modules/chatbot/server/chat/handleChatRequest.ts:259 y :260. Post-P1 (descontando archivos muertos según knip): 39. Nota de calibración: 41 > 25, así que en error SOLO entra junto con la migración; si se prende antes, va en warn.

**Cómo se midió:** Selectores R03 (NEXT_PUBLIC_APP_URL), R04 (NEXTAUTH_URL) y R07 (literal del dominio) en /c/tmp/probe-sel.mjs; listados completos con paths y líneas en /c/tmp/scoped.cjs. Cruce con knip en /c/tmp/deadoverlap.cjs: R03=0 muertos, R04=2 muertos, R07=0 muertos.

**Qué hallazgo fija:** Fija tres hallazgos de una: «NEXT_PUBLIC_APP_URL tiene 5 fallbacks distintos en 24 sitios: emails de producción pueden salir con links a localhost:3000», «La allowlist de origen de confianza (develop.com.ar) está hardcodeada y duplicada en dos chequeos de seguridad distintos» y su gemelo de la categoría 3. Van juntas en una regla porque comparten el archivo de destino y porque el literal del dominio es además el fallback de 6 de los usos de la env var — migrar uno sin el otro deja el problema a medias. Los 2 casos de src/app/layout.tsx (metadataBase / openGraph) son legítimos como dato pero deberían leer de agency-settings igual: si se prefiere, se suman al ignores y el número baja a 39.


```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: [
    "src/lib/app-url.ts",            // a crear: exporta appBaseUrl()
    "src/auth.ts",
    "src/lib/agency-settings.ts",    // ya tiene websiteUrl
    "src/lib/security/first-party-origins.ts", // a crear
  ],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXT_PUBLIC_APP_URL'], MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXTAUTH_URL']",
        message: "Usá appBaseUrl() de @/lib/app-url. Hay 5 fallbacks distintos hoy; uno manda links a localhost:3000 en mails de producción.",
      },
      {
        selector: "Literal[value=/^https:\\/\\/(www\\.)?develop\\.com\\.ar$/]",
        message: "El origen propio sale de isFirstPartyOrigin(). Está duplicado en el chequeo de seguridad y en el bypass del cap de dominios.",
      },
    ],
  },
}
```


### 10. Identidad y datos de la agencia: WhatsApp por env crudo y zona horaria AR literal

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** excepto src/lib/agency-settings.ts y src/lib/tz-ar.ts |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** MEDIDO: 35 (19 + 16), sobre 30 archivos. WhatsApp = 19 en 16 archivos (src/components/sections/home/Footer.tsx:8, src/components/automation/CtaAutomation.tsx:136, src/components/software/DiagnosticoSoftware.tsx:636 y :703, src/app/contact/page.tsx:49 y :55, ...); 5 de esas 19 viven en archivos que knip da por muertos → post-P1 quedan 14. TZ AR = 16 en 14 archivos fuera de tz-ar.ts (src/lib/agency-settings.ts:20 AGENCY_TIMEZONE, src/lib/integrations/cal-com-v2.ts:25 TIMEZONE_AGENDA, src/lib/leados/flow.ts:245/257/263, ...), 0 en archivos muertos. Los dos selectores llegan a CERO exacto después de migrar: no hay caso legítimo fuera del módulo de config.

**Cómo se midió:** Selectores R02 y R09 en /c/tmp/probe-sel.mjs; conteo scopeado en /c/tmp/scoped.cjs; overlap con muertos en /c/tmp/deadoverlap.cjs. Verificado leyendo src/lib/agency-settings.ts:1-25 (contactWhatsapp existe y está vacío; AGENCY_TIMEZONE es la 2ª constante del mismo string).

**Qué hallazgo fija:** Fija «El WhatsApp de la agencia existe como 6 números distintos hardcodeados, y el campo del panel admin que debería mandar no lo lee nadie» y «La zona horaria AR vive en 5 constantes con 5 nombres distintos y 12 literales sueltos». Van juntas porque el destino es el mismo módulo de config y porque agency-settings.ts es hoy simultáneamente la solución (contactWhatsapp) y parte del problema (AGENCY_TIMEZONE). El de TZ es, de todas las reglas de la auditoría, la más barata de sostener: después de migrar el conteo queda en cero exacto y no hay forma de generar un falso positivo.


```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/agency-settings.ts", "src/lib/tz-ar.ts"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXT_PUBLIC_WHATSAPP_NUMBER']",
        message:
          "El número de la agencia sale de agency-settings (AgencySettings.contactWhatsapp), no de env directo. Hoy hay 6 números distintos hardcodeados como fallback.",
      },
      {
        selector: "Literal[value='America/Argentina/Buenos_Aires']",
        message: "Importá TZ_AR de @/lib/tz-ar. Hay 4 constantes con nombres distintos para el mismo string.",
      },
    ],
  },
}
```


### 11. `z.string().email()` sin normalizar

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** completo. Va en SELECTORES_GLOBALES. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 13 en 13 archivos. Los 3 del hallazgo están: src/modules/chatbot/server/admin/createClientOnly.ts:26, src/modules/chatbot/server/admin/createClientWithBot.ts:34, src/app/(protected)/admin/chatbots/new/actions.ts:27. Los otros 10: lead.schemas.ts:25, project.schemas.ts:22, settings.schemas.ts:22, prospecto.schemas.ts:23, complete-onboarding.ts:11, saveBotConfig.ts:60, saveBotConfigByOrgSlug.ts:54, sendTestNotification.ts:13, updateClient.ts:23, captureLead.ts:187. Cero en archivos muertos.

**Cómo se midió:** Selector R12 en /c/tmp/probe-sel.mjs. PRECISIÓN VERIFICADA con fixture /c/tmp/fx/fixture.ts corrido contra el mismo probe — resultado exacto: `z.string().email()` dispara ✅, `z.string().trim().toLowerCase().email()` NO dispara ✅ (el callee.object es .toLowerCase()), `z.string().email().optional()` dispara ✅, `z.string().email('mal').nullable()` dispara ✅. LIMITACIÓN MEDIDA: `z.string().min(1).email()` NO dispara (callee.object.callee.property.name = 'min'). Hoy no existe esa forma en el repo (0 ocurrencias), pero la regla no la cubriría.

**Qué hallazgo fija:** Fija «El email de usuario se ESCRIBE sin normalizar y se LEE normalizado — 3 de 4 rutas de escritura ya divergen de las 5 de lectura», que es un bug de aislamiento/duplicados de usuario, no una fealdad. Es el selector de mejor precisión de toda la auditoría: matchea la forma ofensiva y no la corregida, y eso está probado con fixture, no argumentado.


```js
// dentro de SELECTORES_GLOBALES
{
  selector: "CallExpression[callee.property.name='email'][callee.object.callee.property.name='string']",
  message:
    "Usá emailSchema de @/lib/validation/zod-kit (z.string().trim().toLowerCase().email()). Las rutas de LECTURA de User.email normalizan y las de ESCRITURA no: ya divergieron.",
}
```


### 12. Helpers ya compartidos re-declarados localmente (slugify, emptyStringToUndefined, useIsClient/useMediaQuery, mapError)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** excepto los módulos canónicos (src/lib/slugify.ts, src/lib/validation/zod-kit.ts, src/lib/use-is-client.ts, src/lib/action-result.ts) |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 29 en total. slugify = 4 fuera del canónico (src/lib/actions/clients.ts:42, src/lib/actions/invitations.ts:12, src/lib/onboarding/core.ts:15, src/modules/chatbot/server/admin/createClientWithBot.ts:70) — de esas, 2 viven en archivos que knip da por muertos, o sea post-P1 quedan 2. emptyStringToUndefined/Null = 13 en 11 archivos (1 en archivo muerto). useIsClient/useMediaQuery = 6 fuera de src/lib (incluye src/modules/chatbot/components/admin/useIsClient.ts:12, el original del que el canónico se copió). mapError = 6, todas en la capa setter/leados. Total post-P1: 26.

**Cómo se midió:** Selectores R13, R14, R15 y R16 en /c/tmp/probe-sel.mjs; conteos scopeados en /c/tmp/scoped.cjs; overlap con knip en /c/tmp/deadoverlap.cjs.

**Qué hallazgo fija:** Fija cuatro hallazgos de la misma familia: «slugify implementado 5 veces», «emptyStringToUndefined copiado verbatim en 11 archivos», «Un concepto, seis implementaciones: el hook ya estoy en cliente» y «El repo ya resolvió bien el problema y copió la solución 6 veces sin promoverla» (mapError). La de mapError es la más valiosa y la más contraintuitiva: NO prohíbe una mala práctica, prohíbe re-declarar la BUENA — hoy mapError es la respuesta correcta al hallazgo de los 63 catch que devuelven error.message crudo, y la regla existe para que la séptima copia no se pueda escribir. Ninguno de los 4 selectores puede dar falso positivo: matchean el nombre exacto de un identificador que solo tiene un significado en este repo. Nota honesta: no atrapan sinónimos (useHidratado, la 3ª implementación del mismo hook, no dispara) — eso es correcto, la regla fija lo canónico sin pretender resolver la sinonimia.


```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: [
    "src/lib/slugify.ts",
    "src/lib/validation/zod-kit.ts",   // a crear
    "src/lib/use-is-client.ts",
    "src/lib/action-result.ts",        // a crear: mapError compartido
  ],
  rules: {
    "no-restricted-syntax": [
      "error",
      { selector: "FunctionDeclaration[id.name='slugify'], VariableDeclarator[id.name='slugify']",
        message: "Importá slugify de @/lib/slugify." },
      { selector: "VariableDeclarator[id.name='emptyStringToUndefined'], VariableDeclarator[id.name='emptyStringToNull']",
        message: "Importá el kit de normalización de @/lib/validation/zod-kit." },
      { selector: "FunctionDeclaration[id.name='useIsClient'], VariableDeclarator[id.name='useIsClient'], FunctionDeclaration[id.name='useMediaQuery'], VariableDeclarator[id.name='useMediaQuery']",
        message: "Importá useIsClient de @/lib/use-is-client." },
      { selector: "FunctionDeclaration[id.name='mapError'], VariableDeclarator[id.name='mapError']",
        message: "Importá mapError de @/lib/action-result. Nunca exponer mensajes internos al cliente." },
    ],
  },
}
```


### 13. `fail(error instanceof Error ? error.message : ...)` en la capa de Server Actions

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | Solo **/_actions/**. Medido: el 100% de las ocurrencias vive ahí. |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 49, todas en **/_actions. Cero en archivos muertos. Los peores: project.actions.ts (7), team/_actions/time-entry.actions.ts (5), team/_actions/task.actions.ts (6), lead.actions.ts (7), message.actions.ts (4). El carril setter aparece con UNA sola (novedades.actions.ts:25) — confirma que ese lane ya migró a mapError. Contraste medido: el selector amplio (cualquier `x instanceof Error ? x.message : y`, sin exigir que esté dentro de fail()) da 104 en 54 archivos, y 72 si se lo acota a la capa de actions+server — la diferencia son usos legítimos dentro de logging.

**Cómo se midió:** Selector estrecho C01 en /c/tmp/probe-c.mjs (exige el wrapper `fail(...)`) → 49, con desglose por zona: 49/49 en **/_actions, 0 en cualquier otra. Selector amplio R23 en /c/tmp/probe-sel.mjs → 104; scopeado a actions+lib/actions+modules/**/server con /c/tmp/scoped.cjs → 72. Se propone el estrecho por precisión.

**Qué hallazgo fija:** Fija «El catch de las Server Actions devuelve el .message crudo de la excepción al cliente: 63 lugares» (medido: 49 con la forma exacta fail(...)) y, por la misma vía, «107 de 150 catch de Server Actions no dejan ningún rastro» — si el único camino permitido es mapError, ahí se centraliza también el log. La categoría 3 proponía un invariante de grep para esto; el selector AST es más preciso (0 falsos positivos medidos, mientras que el grep de `instanceof Error ? ` atraparía los 55 usos legítimos dentro de logging) y no depende de que se arregle antes el agregado check:invariants.


```js
{
  files: ["src/**/_actions/**/*.ts"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "CallExpression[callee.name='fail'] > ConditionalExpression[test.operator='instanceof'][test.right.name='Error'][consequent.property.name='message']",
        message:
          "No devolver error.message al cliente: el fallback en inglés es rama muerta (Prisma/NextAuth/Vertex/Zod SIEMPRE son Error). Usá mapError() de @/lib/action-result.",
      },
    ],
  },
}
```


### 14. Formateo de fechas a mano en la capa SERVER (Intl.DateTimeFormat / toLocale*String)

| | |
|---|---|
| **Nivel** | `warn` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/lib/**, src/modules/**/server/**, src/app/api/** — NO src/components ni src/app de páginas (ahí son 109 y el bug de TZ no aplica igual) |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** MEDIDO: 35 en 18 archivos con ese alcance exacto. Los que más duelen (mails y reportes, siempre server): src/lib/email/templates/weekly-report.ts:12, src/lib/reports/MonthlyReport.tsx (9 ocurrencias), src/lib/reports/client-monthly/ClientMonthlyReportPdf.tsx (4), src/lib/alerts.ts:277 y :287, src/app/api/cron/os-follow-up/route.ts:25/62/75, src/modules/chatbot/server/notifications/sendLeadNotification.ts:74. Contraste medido: repo-wide son 158 (39 Intl.DateTimeFormat + 119 toLocale*), repartidas 65 en src/app de páginas, 44 en src/components, 28 en src/lib, 10 en src/modules, 7 en modules/**/server, 4 en src/app/api. Por eso el alcance se corta en la capa server: global es warn-que-nadie-mira.

**Cómo se midió:** Selectores R20 y R21 en /c/tmp/probe-sel.mjs (repo-wide, 39 + 119) y selector combinado C03 en /c/tmp/probe-c.mjs con agregación por zona; el conteo del alcance propuesto se calculó filtrando paths del JSON de salida (excluyendo dates-ar.ts y tz-ar.ts).

**Qué hallazgo fija:** Fija «El formateo de fechas evita dates-ar.ts: 57 sitios a mano, 3 usan el módulo, y los server-side no fijan timeZone». Se propone warn y no error porque 35 no es una migración de una tarde y porque hay casos donde el literal ya trae `timeZone:` correcto (src/lib/client-notifications/templates.ts:81 lo hace bien) — el selector no puede distinguirlos y sería un falso positivo en error. Como warn con un `--max-warnings` que solo baja, es un contador-que-solo-baja, que es el patrón que este repo ya sabe operar.


```js
{
  files: [
    "src/lib/**/*.{ts,tsx}",
    "src/modules/*/server/**/*.{ts,tsx}",
    "src/app/api/**/*.{ts,tsx}",
  ],
  ignores: ["src/lib/dates-ar.ts", "src/lib/tz-ar.ts", "src/**/*.invariant.ts"],
  rules: {
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat'], CallExpression[callee.property.name=/^toLocale(Date|Time)?String$/]",
        message:
          "En server formatear con formatDateAR/formatTimeAR de @/lib/dates-ar: sin timeZone explícito se formatea en la TZ del proceso (UTC en deploy), no en hora AR.",
      },
    ],
  },
}
```


### 15. Easing estándar reescrito a mano en vez de importar standardEase

| | |
|---|---|
| **Nivel** | `warn` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | src/** excepto src/lib/motion-variants.ts y src/lib/design-tokens.ts (los DOS que hoy lo declaran) |
| **Mantenimiento** | CERO |

**Violaciones actuales:** MEDIDO: 58 en 25 archivos (excluyendo motion-variants.ts Y design-tokens.ts). 59 si solo se excluye motion-variants — porque src/lib/design-tokens.ts:197 declara el MISMO tuple como `easing.standard`, o sea el repo tiene dos fuentes canónicas, no una (verificado leyendo ambos archivos). 9 de las 58 viven en archivos que knip da por muertos → post-P1 quedan 49. Concentración medida: src/components/sections/home/OurServices.tsx sola tiene 26 de las 58.

**Cómo se midió:** Selector R11 en /c/tmp/probe-sel.mjs; scoping y exclusiones en /c/tmp/scoped.cjs; overlap con knip en /c/tmp/deadoverlap.cjs. Lectura de src/lib/motion-variants.ts:3 (`export const standardEase = [0.25, 0.46, 0.45, 0.94] as const`) y src/lib/design-tokens.ts:196-197 (`easing: { standard: [0.25, 0.46, 0.45, 0.94] as const`) para confirmar la doble fuente.

**Qué hallazgo fija:** Fija «standardEase existe, tiene 1 solo consumidor, y el mismo tuple se reescribe 62 veces bajo 8 nombres locales» (medido: 58 con esta forma AST; las variantes en string de Tailwind quedan fuera del alcance de cualquier selector y eso se acepta). Va en warn a propósito y esa es la gracia: como warning frena las ocurrencias NUEVAS sin pedirle a nadie que limpie las 58 viejas, y cuesta cero mantener. Es el caso de libro de «regla de lint que no es un refactor». Nota que sale de la medición y no del hallazgo original: antes de prender la regla hay que decidir cuál de las dos fuentes es la canónica, porque hoy hay dos.


```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/motion-variants.ts", "src/lib/design-tokens.ts"],
  rules: {
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          "ArrayExpression[elements.0.value=0.25][elements.1.value=0.46][elements.2.value=0.45][elements.3.value=0.94]",
        message: "Importá standardEase de @/lib/motion-variants (CLAUDE.md, stack conventions).",
      },
    ],
  },
}
```


### 16. Reglas de bajo retorno que igual valen su línea: useMemo trivial, rol SUPER_ADMIN a mano, monthlyQuota, id de modelo LLM

| | |
|---|---|
| **Nivel** | `warn` |
| **Plugin** | built-in eslint (no-restricted-syntax) |
| **Alcance** | Mixto, ver comentarios en el snippet. Ninguna supera las 34 violaciones. |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** MEDIDO, una por una. (a) useMemo trivial = 8 en 7 archivos (lead-form.tsx:104, project-form.tsx:128, task-form.tsx:87, IntegracionesAutomation.tsx:450, CalculadorIA.tsx:73, RoiSoftware.tsx:283 y :293, BotConfigEditor.tsx:61); 1 en archivo muerto. (b) rol a mano = 34 en 30 archivos con el ignores puesto (36 sin él). (c) monthlyQuota = 19 en 11 archivos fuera de saveBotConfig*; 2 en archivos muertos. (d) modelo LLM = 17 en 11 archivos con el alcance exacto de arriba (51 sin los ignores: los 34 extra son providers, invariantes y evals, todos legítimos).

**Cómo se midió:** Selectores R17, R18, R19 y R08 en /c/tmp/probe-sel.mjs; scoping y allowlists aplicados en /c/tmp/scoped.cjs. Precisión de (a) verificada con fixture /c/tmp/fx/f2.tsx: dispara sobre `useMemo(() => (isEdit ? 'Editar' : 'Nuevo'), [isEdit])` y `useMemo(() => n * 60, [n])`, y NO dispara sobre `useMemo(() => [1,2,3].map(x => x*n), [n])` ni sobre `useMemo(() => ({a: n}), [n])` — o sea, no toca los useMemo reales.

**Qué hallazgo fija:** Cuatro hallazgos de valor MEDIO/BAJO que comparten una cosa: el selector es exacto y el costo es una línea, así que no propronerlas sería dejar valor gratis en la mesa. (a) fija «useMemo sobre primitivos y sobre constantes de módulo». (b) fija «Tres dialectos vivos de soy super-admin»: frena el preámbulo manual NUEVO sin obligar a migrar los 30 archivos existentes. (c) fija «La cuota mensual tiene DOS fuentes de verdad: Plan.quota enforcea, BotConfig.monthlyQuota es lo que ve el admin» — con 19 lecturas, el warning es el mapa de qué hay que migrar. (d) fija «gemini-2.5-flash repetido en 10 sitios pese a que FALLBACK_MODEL_ID ya existe» (medido: 17 con el alcance correcto). Todas en warn por volumen; ninguna llega a los 200 que serían descalificantes, pero ninguna justifica romper el build hoy.


```js
// (a) useMemo ritual — capa UI
{
  files: ["src/**/*.tsx"],
  rules: { "no-restricted-syntax": ["warn",
    { selector: "CallExpression[callee.name='useMemo'] > ArrowFunctionExpression > Literal, CallExpression[callee.name='useMemo'] > ArrowFunctionExpression > Identifier, CallExpression[callee.name='useMemo'] > ArrowFunctionExpression > BinaryExpression, CallExpression[callee.name='useMemo'] > ArrowFunctionExpression > ConditionalExpression[consequent.type='Literal'][alternate.type='Literal']",
      message: "useMemo sobre un valor que ya era estable: el hook cuesta más que el cálculo." }] },
},
// (b) preámbulo de rol escrito a mano
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/auth-guards.ts", "src/auth.ts", "src/proxy.ts", "src/**/*.invariant.ts"],
  rules: { "no-restricted-syntax": ["warn",
    { selector: "BinaryExpression[left.property.name='role'][right.value='SUPER_ADMIN']",
      message: "Usá requireSuperAdmin() de @/lib/auth-guards." }] },
},
// (c) la cuota que NO enforcea
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/modules/chatbot/server/admin/saveBotConfig*.ts", "src/lib/isolation/**"],
  rules: { "no-restricted-syntax": ["warn",
    { selector: "MemberExpression[property.name='monthlyQuota']",
      message: "El cap real es plan.quota. BotConfig.monthlyQuota solo se escribe/lee en saveBotConfig." }] },
},
// (d) id de modelo como literal
{
  files: ["src/modules/chatbot/**/*.{ts,tsx}", "src/lib/ai/**/*.ts"],
  ignores: [
    "src/modules/chatbot/server/llm/providers/*.ts",
    "src/modules/chatbot/server/llm/resolveEffectiveModel.ts",
    "src/**/*.invariant.ts", "src/**/__tests__/**", "src/modules/chatbot/evals/**",
  ],
  rules: { "no-restricted-syntax": ["warn",
    { selector: "Literal[value=/^(gemini|claude|gpt)-/]",
      message: "El id de modelo sale de FALLBACK_MODEL_ID / provider.listModels()." }] },
}
```


## B.2 · Config centralizada y candado de CI

### 1. src/config/public.ts — lo único que viaja al bundle del browser

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | ninguno (archivo nuevo del repo) |
| **Alcance** | 4 vars NEXT_PUBLIC_*; consumidores = 12 componentes client vivos (los 3 restantes están muertos) |
| **Mantenimiento** | CERO |

**Violaciones actuales:** 19 lecturas de NEXT_PUBLIC_WHATSAPP_NUMBER en 16 archivos (15 client + 1 seed); 3 de esos archivos están muertos (VaultIA.tsx, PortalDemo.tsx, ShowcaseSoftware.tsx) → 12 a migrar de verdad. NEXT_PUBLIC_SENTRY_DSN 3, NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL 1.

**Cómo se midió:** git grep -ho "process\.env\.[A-Z0-9_]*" -- src | sort | uniq -c | sort -rn  +  para cada archivo: head -3 "$f" | grep -c 'use client'  (15/16 son client)  +  cruce contra la corrida completa de knip

**Qué hallazgo fija:** Fija el hallazgo del WhatsApp (6 números hardcodeados + 8 sitios interpolando undefined). Es el ÚNICO cluster genuinamente client-side: verifiqué que ningún componente 'use client' del repo lee una var no-NEXT_PUBLIC, así que el corte público/servidor ya se respeta de hecho y este archivo solo lo hace explícito.


```js
// src/config/public.ts
// Config que VIAJA AL BUNDLE DEL BROWSER. Nada secreto acá.
//
// Regla técnica de Next 16, no negociable: el reemplazo de NEXT_PUBLIC_* es
// TEXTUAL sobre el AST y solo funciona con acceso de miembro LITERAL.
// `process.env[nombre]`, destructuring de process.env o un helper genérico
// tipo readEnv('NEXT_PUBLIC_X') NO se inlinean: llegan `undefined` al browser.
// Por eso esto es una lista escrita a mano y no un loop sobre el manifiesto.
//
// Tampoco valida con throw: un throw en top-level acá rompe la página entera
// en el cliente. La validación dura vive en check:env-drift (CI, nombres) y en
// scripts/check-env.ts (local, valores).

// DECISIÓN PENDIENTE DE FRANCO: hoy conviven 6 números distintos como fallback
// (5493816223508 / 5493815000000 / 543812223344 / ...). Elegir UNO acá.
const WHATSAPP_FALLBACK = '5493816223508'

export const publicConfig = Object.freeze({
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_FALLBACK,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  n8nContactWebhookUrl: process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL ?? '',
})

/** Único armador de links de WhatsApp del sitio público. */
export function whatsappLink(mensaje: string): string {
  return `https://wa.me/${publicConfig.whatsappNumber}?text=${encodeURIComponent(mensaje)}`
}
```


### 2. src/config/urls.ts — appBaseUrl(), el cluster de mayor volumen y mayor daño

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | ninguno (archivo nuevo del repo) |
| **Alcance** | NEXT_PUBLIC_APP_URL (22 usos, 20 archivos) + NEXTAUTH_URL (4) |
| **Mantenimiento** | CERO |

**Violaciones actuales:** 22 lecturas de NEXT_PUBLIC_APP_URL en 20 archivos + 4 de NEXTAUTH_URL. Ninguno de los 20 es client component.

**Cómo se midió:** git grep -ho "process\.env\.[A-Z0-9_]*" -- src | sort | uniq -c   →  22 NEXT_PUBLIC_APP_URL / 4 NEXTAUTH_URL. Scope client/server: for f in $(grep -rl NEXT_PUBLIC_APP_URL src); do head -3 $f | grep -c 'use client'; done → 0 en los 20.

**Qué hallazgo fija:** Es el cluster #1 por volumen y el único donde el fallback equivocado sale del sistema: unsubscribe-token.ts:58 arma el header RFC-8058 List-Unsubscribe y build.ts:187 el dashboardUrl del reporte semanal. Un mail de producción con link a localhost es un bug visible para el cliente, no una fealdad.


```js
// src/config/urls.ts
// Fuente única de la URL base del portal.
//
// Hoy: 22 lecturas con 5 fallbacks incompatibles — 'http://localhost:3000',
// 'https://develop.com.ar' (que es la LANDING, no el portal), '', sin fallback
// (interpola literalmente 'undefined/dashboard/...') y la cadena
// APP_URL ?? NEXTAUTH_URL ?? localhost. La forma correcta YA estaba escrita,
// privada y sin exportar, en src/lib/alerts.ts:49. Esto es esa función.
//
// NO lleva `server-only`: los 20 consumidores de hoy son server (verificado:
// 0 archivos con 'use client'), pero NEXT_PUBLIC_APP_URL viaja al bundle igual
// y un CTA de cliente puede necesitarla. En el browser, NEXTAUTH_URL es
// undefined y cae al fallback de dev — correcto, no es un bug.
import { publicConfig } from './public'

const DEV_FALLBACK = 'http://localhost:3000'

/** Sin trailing slash, siempre. */
export function appBaseUrl(): string {
  const raw = publicConfig.appUrl || process.env.NEXTAUTH_URL || DEV_FALLBACK
  return raw.replace(/\/+$/, '')
}

export function appUrl(path: string): string {
  return `${appBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}
```


### 3. src/config/server.ts — accessors PEREZOSOS con Zod (nunca parse en top-level)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | zod ^3.25.76 (ya instalado) + server-only (ver pieza de deps no declaradas) |
| **Alcance** | solo vars server con ≥2 lectores o cuya ausencia produce un valor plausible-pero-incorrecto |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** 6 direcciones de remitente distintas en 3 dominios (uno es un gmail personal, brevo-service.ts:33). RESEND_FROM_EMAIL está declarada en .env.example:138 y en check-env.js:42 y tiene CERO lectores en src/ — el manifiesto miente.

**Cómo se midió:** git grep -ho "process\.env\.[A-Z0-9_]*" -- src | sort -u  contra las listas de scripts/check-env.js  +  git grep -n RESEND_FROM_EMAIL -- src (0 resultados)

**Qué hallazgo fija:** El `server-only` + accessor perezoso es la respuesta concreta a la pregunta build-vs-runtime en Next 16: NEXT_PUBLIC_* se inlinea en build (por eso public.ts es literal y no valida), las server no (por eso acá se valida, pero al llamar y no al importar). No lo invento: es el patrón que oauth-state.ts:26 ya usa bien.


```js
// src/config/server.ts
import 'server-only'
import { z } from 'zod'

// Accessors PEREZOSOS: nunca `const CFG = schema.parse(process.env)` en
// top-level. Next 16 evalúa el módulo durante el build (collect page data) y
// una var que solo existe en runtime te rompe el DEPLOY, no el request.
// El repo ya llegó solo a esta forma en src/lib/security/oauth-state.ts:26
// (`function getSecret()` con el throw adentro). Esto la generaliza.

const noVacio = z.string().trim().min(1)

function requerida(nombre: string, valor: string | undefined): string {
  const r = noVacio.safeParse(valor)
  if (!r.success) throw new Error(`[config] ${nombre} no configurada`)
  return r.data
}

export const serverConfig = {
  // Requeridas: si faltan, TIRAN. Nunca devuelven un default plausible.
  authSecret: () => requerida('AUTH_SECRET', process.env.AUTH_SECRET),
  developAlertsEmail: () =>
    requerida('DEVELOP_ALERTS_EMAIL', process.env.DEVELOP_ALERTS_EMAIL),

  // Opcionales: devuelven null y el feature DEGRADA. Nunca throw.
  resendApiKey: () => process.env.RESEND_API_KEY?.trim() || null,
  brevoApiKey: () => process.env.BREVO_API_KEY?.trim() || null,

  // Identidad de la agencia: un solo lugar. Mata el gmail personal de
  // brevo-service.ts:33 y las 4 formas del remitente.
  // DECISIÓN PENDIENTE DE FRANCO: qué dominio está verificado en Resend/Brevo.
  fromEmail: () => process.env.BREVO_FROM_EMAIL?.trim() || 'hola@develop.com.ar',
  fromName: () => process.env.BREVO_FROM_NAME?.trim() || 'develOP',
} as const
```


### 4. src/config/env-manifest.ts + scripts/check-env-drift.ts — un manifiesto, y el chequeo que SÍ puede correr en CI

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | ninguno (tsx ya lo usan 40+ scripts npm) |
| **Alcance** | las 48 vars medidas en src/ |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** 48 vars en código vs 38 en check-env.js vs 24 en .env.example. Drift concreto medido: OAUTH_STATE_SECRET en ninguna de las dos listas; CRM_SECRET_KEY, EMAIL_UNSUBSCRIBE_SECRET, ONBOARDING_SECRET_KEY, MOTOR_D360_BASE_URL, NEXTAUTH_SECRET y QA_ALLOW_LOCALHOST están en .env.example y no en check-env.js; RESEND_FROM_EMAIL está en las dos listas y tiene 0 lectores.

**Cómo se midió:** git grep -ho "process\.env\.[A-Z0-9_]*" -- src | sed 's/process.env.//' | sort -u  (48)  vs  las listas de scripts/check-env.js:15-69  vs  grep -E '^#?\s*[A-Z0-9_]+=' .env.example

**Qué hallazgo fija:** QUÉ HACER CON scripts/check-env.js: no se borra y no se deja. Se REESCRIBE como scripts/check-env.ts importando ENV_MANIFEST — pierde sus dos listas propias y queda como comando LOCAL/pre-deploy porque chequea que los valores estén seteados. El que va a CI es este drift-check, que solo compara nombres. Sin esto, cualquier regla que proponga esta auditoría se puede eludir agregando una var nueva y nadie se entera.


```yaml
// ── src/config/env-manifest.ts ────────────────────────────────────────────
// El manifiesto ÚNICO. Hoy hay tres y ya divergieron (medido):
//   scripts/check-env.js  → 8 CRITICAL + 30 OPTIONAL
//   .env.example          → 24 vars
//   docs/env-vars.md      → 162 líneas
// OAUTH_STATE_SECRET (oauth-state.ts:28) no está en NINGUNO. CRON_SECRET es
// OPTIONAL en check-env.js:63 y 'REQUERIDA EN PROD' en .env.example:218.
export type EnvScope = 'public' | 'server' | 'framework'
export type EnvRequerida = 'siempre' | 'prod' | 'opcional'

export interface EnvVarSpec {
  name: string
  scope: EnvScope
  requerida: EnvRequerida
  nota: string
}

export const ENV_MANIFEST: readonly EnvVarSpec[] = [
  { name: 'DATABASE_URL', scope: 'server', requerida: 'siempre', nota: 'Neon; dev y prod son branches distintos' },
  { name: 'AUTH_SECRET', scope: 'server', requerida: 'siempre', nota: 'NextAuth v5' },
  { name: 'CRON_SECRET', scope: 'server', requerida: 'prod', nota: 'único lector: src/lib/security/cron-auth.ts' },
  { name: 'OAUTH_STATE_SECRET', scope: 'server', requerida: 'opcional', nota: 'HMAC del state OAuth; cae a AUTH_SECRET (oauth-state.ts:28)' },
  { name: 'NEXT_PUBLIC_APP_URL', scope: 'public', requerida: 'siempre', nota: 'único lector: src/config/urls.ts' },
  { name: 'NODE_ENV', scope: 'framework', requerida: 'opcional', nota: 'la setea Next; NO se centraliza (22 usos, todos legítimos)' },
  // ...las 48. Semilla exacta:
  //   git grep -ho "process\.env\.[A-Z0-9_]*" -- src | sed 's/process.env.//' | sort -u
]

// ── scripts/check-env-drift.ts ────────────────────────────────────────────
// `npx tsx scripts/check-env-drift.ts`
// Chequea NOMBRES, no valores. POR ESO puede correr en CI sin un solo secret.
// check-env.js chequea VALORES y por eso nunca pudo estar en CI: son dos
// chequeos distintos y el repo tenía solo uno.
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { ENV_MANIFEST } from '../src/config/env-manifest'

const enCodigo = new Set(
  execSync('git grep -ho "process\\.env\\.[A-Z0-9_]*" -- src', { encoding: 'utf8' })
    .split('\n').filter(Boolean).map((l) => l.replace('process.env.', '')),
)
const enManifiesto = new Map(ENV_MANIFEST.map((v) => [v.name, v]))
const enExample = new Set(
  readFileSync('.env.example', 'utf8').split('\n')
    .map((l) => l.replace(/^#\s*/, '').match(/^([A-Z0-9_]+)=/)?.[1])
    .filter(Boolean) as string[],
)

const problemas: string[] = []
for (const v of enCodigo) {
  if (!enManifiesto.has(v)) problemas.push(`${v}: se lee en src/ y no está en ENV_MANIFEST`)
}
for (const [name, spec] of enManifiesto) {
  if (!enCodigo.has(name)) problemas.push(`${name}: está en ENV_MANIFEST y no la lee nadie en src/`)
  if (spec.scope !== 'framework' && !enExample.has(name)) problemas.push(`${name}: falta en .env.example`)
}

if (problemas.length > 0) {
  console.error('DRIFT de env:\n' + problemas.map((p) => '  - ' + p).join('\n'))
  process.exit(1)
}
console.log(`OK — ${enManifiesto.size} vars: ENV_MANIFEST == src/ == .env.example`)
```


### 5. Bloque ESLint que congela el avance — una regla POR VAR MIGRADA, y sin apagar el candado del chatbot

| | |
|---|---|
| **Nivel** | `warn` |
| **Plugin** | eslint built-in (no-restricted-syntax) |
| **Alcance** | src/** con overrides; se agrega un selector por var en el MISMO commit que su migración |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** 53 si se prenden los 4 selectores hoy (22 APP_URL + 4 NEXTAUTH_URL + 19 WHATSAPP + 12 CRON_SECRET, menos las lecturas que quedan dentro de los archivos permitidos). Por eso arranca en 'warn' y cada selector pasa a 'error' en el commit que termina SU cluster.

**Cómo se midió:** Conteos por var con git grep -ho. Semántica del override probada empíricamente: fixture en C:\tmp\eslint-probe con dos bloques declarando no-restricted-syntax sobre **/*.ts → solo dispara el SEGUNDO (REGLA-B); con la versión compuesta en arrays disparan los dos.

**Qué hallazgo fija:** Es el candado que congela el avance de la migración. Deliberadamente NO propongo una regla genérica contra `process.env` (dispararía 159 veces y muere a fuerza de eslint-disable): una regla por var, agregada junto con su migración, hace que el conteo solo pueda bajar. El mecanismo es el que el repo ya opera dos veces — lo único nuevo es la composición, que es obligatoria para no romper el candado existente.


```js
// eslint.config.mjs — reemplazar el bloque del chatbot por esta composición.
//
// ⚠️ HALLAZGO CRÍTICO, probado con fixture: en flat config, un SEGUNDO objeto
// que declara `no-restricted-syntax` sobre archivos que se solapan REEMPLAZA
// la config del primero (no la mergea). Agregar la regla de env como bloque
// nuevo sobre src/** APAGA el candado `new PrismaClient()` del chatbot
// (eslint.config.mjs:78-85) para todo src/modules/chatbot/**.
// Por eso los selectores se componen en arrays, no en bloques apilados.

const ENV_SELECTORS = [
  {
    selector: "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXT_PUBLIC_APP_URL']",
    message: 'La URL base sale de appBaseUrl()/appUrl() de @/config/urls.',
  },
  {
    selector: "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXTAUTH_URL']",
    message: 'La URL base sale de appBaseUrl() de @/config/urls.',
  },
  {
    selector: "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXT_PUBLIC_WHATSAPP_NUMBER']",
    message: 'El WhatsApp de la agencia sale de publicConfig de @/config/public.',
  },
  {
    selector: "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='CRON_SECRET']",
    message: 'El secret de cron se compara en @/lib/security/cron-auth (falla cerrado).',
  },
]

const PRISMA_SELECTOR = {
  selector: "NewExpression[callee.name='PrismaClient']",
  message:
    'El chatbot no instancia PrismaClient. El acceso a datos va por src/lib/isolation/ — B0-S3.',
}

// ...dentro de defineConfig([...]):
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/config/**',
      'src/lib/security/cron-auth.ts',
      'src/auth.ts',
      'src/auth.config.ts',
      'src/modules/chatbot/**/*.{ts,tsx}',   // cubierto por el bloque de abajo
      'src/app/api/chatbot/**/*.{ts,tsx}',   // idem
    ],
    rules: { 'no-restricted-syntax': ['error', ...ENV_SELECTORS] },
  },
  {
    files: ['src/modules/chatbot/**/*.{ts,tsx}', 'src/app/api/chatbot/**/*.{ts,tsx}'],
    rules: {
      // no-restricted-imports del bloque original queda igual, sin tocar.
      'no-restricted-syntax': ['error', ...ENV_SELECTORS, PRISMA_SELECTOR],
    },
  },
```


### 6. src/lib/security/cron-auth.ts — el cluster CRON_SECRET (config con su chequeo, no config sola)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | ninguno (archivo nuevo del repo) |
| **Alcance** | las 8 rutas de src/app/api/cron/* |
| **Mantenimiento** | CERO |

**Violaciones actuales:** 8 rutas de cron, 9 lecturas de CRON_SECRET: 5 con el patrón correcto duplicado (alerts:5, cleanup-old-events:40, os-follow-up:154, regenerate-briefs:19, send-executive-reports:18) y 3 con la forma rota (detect-bot-issues:8, generate-insights:12, send-weekly-reports:8).

**Cómo se midió:** grep -rn CRON_SECRET src/app/api/cron/*/route.ts  +  ls src/app/api/cron/  +  lectura de cleanup-old-events/route.ts:10-46 (el comentario del propio archivo documenta el hazard y dice "no hay helper compartido")

**Qué hallazgo fija:** Muestra el criterio de corte de la Parte 1: CRON_SECRET NO va a src/config, va a un módulo de seguridad, porque el dato solo tiene sentido junto con la comparación. Config centralizada no es 'todo process.env vive en src/config': es 'cada dato tiene un dueño'. Además es el único cluster con riesgo ALTO real y el repo ya escribió la solución correcta cinco veces sin promoverla.


```js
// src/lib/security/cron-auth.ts
// Un solo lugar donde el secret de cron se lee y se compara.
//
// Extrae el patrón que YA es correcto en cleanup-old-events/route.ts:29-46
// (falla CERRADO si CRON_SECRET falta) y que está copiado tal cual en
// regenerate-briefs:19, send-executive-reports:18, os-follow-up:154 y
// alerts:5. Las 3 rutas restantes usan la forma rota: comparan contra el
// template literal `Bearer ${process.env.CRON_SECRET}`, que sin la var se
// materializa como el string 'Bearer undefined'.
//
// BONUS: hoy `getProvidedCronSecret` está EXPORTADA desde
// cleanup-old-events/route.ts:29 — Next 16 prohíbe exports que no sean
// handlers en un route.ts. Mudarla acá también destraba eso.

export function extraerSecretDelRequest(request: Request): string | null {
  const authorization = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }
  return cronHeader ?? null
}

/** null = autorizado. Response = rechazado. Nunca autentica sin secret. */
export function rechazarSiNoEsCron(request: Request): Response | null {
  const esperado = process.env.CRON_SECRET?.trim()
  const provisto = extraerSecretDelRequest(request)
  if (!esperado || provisto !== esperado) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// El invariante que YA existe
// (src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts)
// se re-apunta a este módulo y pasa a cubrir las 8 rutas de una.
```


### 7. Job `static` de CI — YAML pegable, en paralelo con los 3 jobs existentes

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | GitHub Actions (mismo estilo que e2e.yml: node 20, npm ci, prisma generate) |
| **Alcance** | .github/workflows/e2e.yml |
| **Mantenimiento** | CERO |

**Violaciones actuales:** El job no existe. Hoy .github/workflows/e2e.yml tiene 3 jobs (invariants, leados-integration, test) y ninguno invoca eslint, tsc, knip ni depcruise.

**Cómo se midió:** cat .github/workflows/e2e.yml (64 líneas, 3 jobs)  +  ls .github/workflows/ (un solo archivo)  +  tiempos locales cronometrados: tsc --noEmit 35 s / eslint 44 s / knip 2,8 s / depcruise 4 s

**Qué hallazgo fija:** BLOQUEA, y puedo defenderlo porque los 4 steps bloqueantes están verdes o son verdes-tras-un-fix-de-4-líneas. Costo: ~4,5 min de runner por push (npm ci ~90 s + prisma generate ~20 s + los cuatro checks). En wall clock cuesta 0 porque corre en paralelo. El `concurrency` que agrego arriba es lo que paga ese costo: hoy cada push con PR abierto dispara los 3 jobs dos veces.


```yaml
# .github/workflows/e2e.yml — agregar arriba de `jobs:`
# Hoy `on: [push, pull_request]` corre TODO dos veces por push con PR abierto.
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # Análisis estático: sin DB, sin server, sin un solo secret.
  # Corre en paralelo con los otros tres — el long pole sigue siendo `test`
  # (instala Chromium + corre Playwright), así que NO alarga el pipeline.
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate

      # 1 · Drift de env (~5 s). Compara NOMBRES: ENV_MANIFEST vs process.env.*
      #     en src/ vs .env.example. No lee valores → no necesita secrets.
      - run: npm run check:env-drift

      # 2 · Tipos (~60 s). HOY NADA typechequea el repo: next.config.ts:11 tiene
      #     typescript.ignoreBuildErrors: true y el build ni siquiera corre en CI.
      #     Medido local: 0 errores en 35 s. Verde día 1, bloqueante.
      - run: npm run typecheck

      # 3 · Lint con bulk suppressions (~70 s). eslint-suppressions.json congela
      #     las 101 violaciones preexistentes; falla solo con las NUEVAS.
      - run: npm run lint:ci

      # 4 · Dependencias importadas y NO declaradas (~10 s). BLOQUEANTE apenas se
      #     agreguen las 4 a package.json: hoy three-stdlib, framer-motion, jose
      #     y server-only resuelven solo por hoisting transitivo.
      - run: npx knip --include unlisted

      # 5 · Dead code — REPORTE, no bloqueo (69 archivos / 311 exports hoy).
      #     Se le saca el continue-on-error cuando P1 lo baje a 0.
      - run: npx knip
        continue-on-error: true

# NO incluyo `next build`: necesita DATABASE_URL en build, tarda minutos y con
# ignoreBuildErrors:true no aporta señal de tipos. No lo verifiqué — no lo propongo.
```


### 8. Bulk suppressions de ESLint — el baseline que no hay que inventar (nativo desde 9.24, el repo tiene 9.39.4)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | eslint ^9 (ya instalado, v9.39.4 verificada) |
| **Alcance** | todo el repo; más globalIgnores para los 10 .js sueltos de la raíz |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** 102 errores + 113 warnings en 117 archivos, en 44 s. 84 de los 102 errores están en archivos VIVOS (18 en muertos). Top: react-hooks/set-state-in-effect 37, no-require-imports 16, no-explicit-any 14, react-hooks/purity 13. Tras --suppress-all: 101 suprimidos, queda 1 (el parse error de script_analytics.js). 45 de los 113 warnings son 'Unused eslint-disable directive (no-console)' — basura de una regla que se sacó.

**Cómo se midió:** npx eslint --format json -o /c/tmp/clean-eslint.json (44 s) + agregación por regla y cruce con la lista de knip. Baseline probado de verdad: npx eslint --suppress-all --suppressions-location /c/tmp/clean-eslint-suppressions.json → 69 archivos / 101 violaciones; re-corrida con --suppressions-location → 1 error, 113 warnings. npx eslint --version → v9.39.4; --help confirma --suppress-all / --prune-suppressions.

**Qué hallazgo fija:** Las categorías 1-3 proponían arrancar reglas en 'warn' para no romper CI. No hace falta: ESLint tiene baseline nativo desde 9.24 y este repo tiene 9.39.4. Con suppressions el job va en ERROR desde el día 1 sin tocar una línea de src/, y --prune-suppressions hace que el número solo pueda bajar. Es literalmente el contador-que-solo-baja que la categoría de UI proponía escribir a mano.


```js
// ── package.json (scripts) ────────────────────────────────────────────────
"typecheck": "tsc --noEmit",
"lint": "eslint",
"lint:ci": "eslint --suppressions-location eslint-suppressions.json",
"lint:baseline": "eslint --suppress-all --suppressions-location eslint-suppressions.json",
"lint:baseline:prune": "eslint --prune-suppressions --suppressions-location eslint-suppressions.json",

// ── eslint.config.mjs — PRERREQUISITO DURO ────────────────────────────────
// Sin esto el job queda ROJO aunque el baseline suprima todo: los parse errors
// NO son suprimibles, y script_analytics.js da
// "Parsing error: File appears to be binary".
// Son 10 scripts one-off trackeados en la raíz (script.js, script2.js,
// script3.js, script_aiscene.js, script_analytics.js, script_leads.js,
// script_magnetic.js, script_maps.js, find_unused.js, replace_analytics.js).
// Ignorarlos es el parche; borrarlos es P1.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Scripts one-off de la raíz: no son código de la app.
    'script*.js',
    'find_unused.js',
    'replace_analytics.js',
  ]),

// ── Alta del baseline (una sola vez, se commitea) ─────────────────────────
//   npm run lint:baseline
// Genera eslint-suppressions.json con el conteo por archivo y por regla.
// Después, `npm run lint:ci` falla SOLO con violaciones nuevas.
// Cuando se arregla algo: `npm run lint:baseline:prune` baja el número.
```


### 9. knip: partirlo en dos — `--include unlisted` bloqueante, el resto reporte (y NO usar `--include files`)

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | knip ^6.16.1 (instalado, knip.ts en la raíz, sin script ni job) |
| **Alcance** | repo completo |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** Corrida completa (2,8 s): 69 archivos sin usar, 311 exports, 226 tipos exportados, 12 duplicate exports, 6 dependencies sin usar, 4 devDependencies sin usar, 9 unlisted (4 paquetes distintos). Con --include files: 100 archivos, de los cuales 31 son falsos positivos.

**Cómo se midió:** npx knip --no-progress (2,8 s, exit 1) → headers de conteo. npx knip --include files --no-progress → 100 rutas. comm -13 entre las dos listas → los 31 extra. node -e sobre package.json para las 4 deps ausentes.

**Qué hallazgo fija:** Partirlo es lo que lo hace sobrevivir. `--include unlisted` es el único sub-chequeo de knip que atrapa un bug que rompe producción, y llega a 0 con un fix de 4 líneas: ese va en ERROR. Los otros (69/311/226) no pueden bloquear hasta P1, y un step que solo reporta es exactamente la pieza que muere si nadie la mira — lo digo en la Parte 3 y asumo que se pueda sacar sin culpa.


```js
// ── package.json ──────────────────────────────────────────────────────────
"check:dead": "knip",
"check:unlisted": "knip --include unlisted",

// ── package.json (dependencies) — el fix de 4 líneas que hace bloqueante el step ──
// Verificado con node -e: se importan en src/ y NO están declaradas.
//   "framer-motion": "^12"   ← About.tsx:3, Portfolio.tsx:3, KineticText.tsx:3
//   "three-stdlib": "^2"     ← HeroArtifact.tsx:5 (ARCHIVO CONGELADO), Hero.tsx:7,
//                               BrandedLogoWhite.tsx:5, BrandedIntroCanvas.tsx:5
//   "jose": "^5"             ← src/lib/impersonation.ts:3
//   "server-only": "^0.0.1"  ← src/lib/leados/foco-cookie.ts:1
// Hoy resuelven por hoisting transitivo (motion / @react-three/drei /
// next-auth / next). Un npm ci con otro árbol y el build se cae.

// ── CORRECCIÓN AL MÉTODO DE MEDICIÓN DEL DEAD CODE ────────────────────────
// La lista de 99-100 archivos que circula viene de `knip --include files` y
// tiene 31 FALSOS POSITIVOS. La corrida completa da 69.
// Los 31 extra son TODA la suite Playwright (tests/setter/*, tests/leados/*,
// tests/integration/*) más 4 archivos vivos del motor (secret-box.ts,
// outbound/client.ts, domain/window.ts, services/sendMessage.ts): son entries
// que solo se resuelven vía el plugin de Playwright en la corrida completa.
// Para P1, usar `npx knip` a secas — nunca `--include files`.
```


### 10. dependency-cruiser: NO prenderlo como job de CI

| | |
|---|---|
| **Nivel** | `no-prender` |
| **Plugin** | dependency-cruiser ^17.4.3 (instalado, .dependency-cruiser.cjs en la raíz) |
| **Alcance** | — |
| **Mantenimiento** | CERO |

**Violaciones actuales:** 22 dependency violations (0 errors, 22 warnings), 1314 módulos, 3260 dependencias, 4 s, exit 0.

**Cómo se midió:** npx depcruise src --config .dependency-cruiser.cjs --output-type err → 'x 22 dependency violations (0 errors, 22 warnings)', EXIT=0. Lectura de .dependency-cruiser.cjs:3-11 (una única regla, severity 'warn').

**Qué hallazgo fija:** Criterio de agencia de 2 personas: una pieza de CI que no puede fallar no es un candado, es ruido con costo. Lo mismo para eslint-plugin-unused-imports — está instalado, NO referenciado en eslint.config.mjs, knip lo lista como devDependency sin usar (package.json:159), y @typescript-eslint/no-unused-vars ya reporta 60 warnings sin él: cablearlo no agrega señal, agrega una pieza. Ninguno de los dos entra.


```js
// package.json — queda como comando A DEMANDA, sin job de CI.
"check:deps": "depcruise src --config .dependency-cruiser.cjs",

// POR QUÉ NO VA A CI (medido, no opinado):
// .dependency-cruiser.cjs tiene UNA sola regla, `no-circular`, en severidad
// 'warn'. depcruise sale con exit 0 salvo violaciones de severidad 'error'.
// O sea: como está configurado, un job de dep-cruiser NO PUEDE FALLAR NUNCA.
// Es decoración: 4 s de CI por un check que siempre pasa.
//
// Para que sirviera habría que subir no-circular a 'error' → 22 violaciones
// hoy, casi todas el mismo patrón Client↔Tab en admin/chatbots/[botId]/.
// Eso es trabajo de refactor (P1), no un candado. Y la frontera de módulos ya
// la cubre el `no-restricted-imports` que eslint.config.mjs:16-87 declara dos
// veces. La estructura de módulos además ya la auditó ARQ — no la re-abro.
```


### 11. scripts/run-invariants.ts — descubrimiento por glob: sin esto, ningún candado de esta auditoría corre

| | |
|---|---|
| **Nivel** | `error` |
| **Plugin** | tsx (ya en uso por 40+ scripts npm) |
| **Alcance** | los 56 archivos *.invariant.ts de src/ |
| **Mantenimiento** | BAJO |

**Violaciones actuales:** 56 archivos *.invariant.ts, 55 scripts npm que corren uno, 16 dentro del agregado que ejecuta CI → 39 nunca corren. De esos 39: 38 pasan, 1 falla por necesitar DB. Archivos sin ningún script npm: 0.

**Cómo se midió:** git ls-files 'src/**/*.invariant.ts' | wc -l → 56. Parseo de package.json check:invariants → 16 entradas. Corrida real de los 39 de afuera, uno por uno (script /c/tmp/runinv.cjs): 1m45s, 38 OK / 1 fallo (check:invariant:client-monthly-report-pdf, error de Prisma). npm run check:invariants → 27,6 s los 16 actuales.

**Qué hallazgo fija:** Es el único hallazgo cuyo arreglo hace ejecutables a los demás: media docena de candados propuestos en las categorías 1-3 son invariantes, y hoy un invariante nuevo no corre salvo que alguien edite una línea de 800 caracteres en package.json. Costo en CI: los 55 tardan ~1,5-2,5 min (medido 2,7 s cada uno vía npm run; corriendo tsx directo baja a ~1,7 s). El job invariants pasa de ~2,5 min a ~4,5 min — sigue por debajo del job de Playwright, así que no mueve el wall clock.


```js
// scripts/run-invariants.ts   →   "check:invariants": "npx tsx scripts/run-invariants.ts"
//
// Reemplaza la enumeración a mano de package.json:18, que lista 16 de los 56
// invariantes que existen. Un *.invariant.ts nuevo entra a CI por EXISTIR, no
// por acordarse de editar package.json.
//
// MEDIDO antes de proponerlo: de los 39 que hoy quedan fuera del agregado,
// 38 pasan y 1 falla — y falla porque NO es puro: pega a Prisma
// ('Invalid prisma.botConfig.findFirst() invocation'). Ese va excluido acá y
// pertenece al job leados-integration, que sí tiene DB.
import { execFileSync, execSync } from 'node:child_process'

// git ls-files y no fs.globSync: CI corre Node 20 y globSync es Node 22+.
const REQUIEREN_DB = new Set([
  'src/lib/reports/client-monthly/get-client-monthly-report-data.invariant.ts',
])

const archivos = execSync('git ls-files "src/**/*.invariant.ts"', { encoding: 'utf8' })
  .split('\n').map((l) => l.trim()).filter(Boolean)
  .filter((f) => !REQUIEREN_DB.has(f))

const fallas: string[] = []
for (const archivo of archivos) {
  try {
    execFileSync('npx', ['tsx', archivo], { stdio: 'inherit', shell: true })
  } catch {
    fallas.push(archivo)
  }
}

if (fallas.length > 0) {
  console.error(`\n${fallas.length}/${archivos.length} invariantes FALLARON:`)
  fallas.forEach((f) => console.error('  - ' + f))
  process.exit(1)
}
console.log(`\nOK — ${archivos.length} invariantes`)
```

