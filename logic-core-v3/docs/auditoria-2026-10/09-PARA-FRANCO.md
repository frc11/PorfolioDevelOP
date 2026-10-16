# 09 — Para Franco

> Hallazgos y estado de lo planeado en la zona de Franco (LeadOS: `src/lib/leados/`, `src/app/(protected)/setter/`, `admin/leados/`, `admin/leads/_actions/`, `admin/fg2-lab/`; además `src/auth.ts`, `src/lib/auth-cookies.ts`, `api/qa/login` y los modelos `OsLead*`/`ActivityChannel`). Esta corrida no toca nada de la zona: todo lo que sigue es para que lo tomes sin contexto. Plantilla por ítem: contexto en 2 líneas · evidencia · impacto · propuesta · cómo verificar · qué coordinación hace falta. También va acá el estado de cada bloque de `Bloques a Ejecutar/` (CHATBOT, DASHBOARD, OSLEAD) contra el código (DEC-35).

## Hallazgos

### SEC-006 · La invalidacion por sessionVersion se revive con POST /api/auth/session (trigger 'update' saltea el chequeo)
- Contexto: D1 · h1.auth-login.sesion-jwt, h1.auth-cambio.cambio-forzado, h1.auth-recupero.restablecer-password, lib.auth, modelo.User. ALTA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/auth.ts:215` — «if ( trigger !== 'signIn' && trigger !== 'update' &&»; `src/auth.ts:230` — «token.sessionVersion = accessState.sessionVersion»; `src/app/api/auth/[...nextauth]/route.ts:3` — «export const { GET, POST } = handlers»; librería @auth/core@0.41.2, lib/index.js línea 57 — «case "session": validateCSRF(action, csrfTokenVerified); return await actions.session(options, sessionStore, cookies, true, request.body?.data);»; librería @auth/core@0.41.2, lib/actions/session.js línea 30 — «...(isUpdate && { trigger: "update" }),»; `src/auth.ts:207`; `src/auth.ts:225`; `src/app/reset-password/actions.ts:75`; `src/app/cambiar-password/actions.ts:56`; `src/lib/actions/profile.ts:228`; `src/actions/auth-actions.ts:5`; `src/auth.ts:44`; `src/auth.ts:61`
- Impacto: Si alguien obtiene la cookie de sesion de un cliente (PC compartida, malware, cookie filtrada), que el cliente cambie o restablezca la contrasena NO lo echa: con la cookie vieja, GET /api/auth/csrf + POST /api/auth/session (double-submit, sin conocer la contrasena) dispara el callback jwt con trigger 'update', que saltea la comparacion y re-firma el token con la sessionVersion nueva. SEC-AUTH-03 queda cerrado solo contra reuso pasivo.
- Propuesta: Decision para Valentino (auth.ts FROZEN + ZONA-FRANCO): comparar sessionVersion tambien en trigger 'update' (antes de refrescar) y hacer que las actions que suben la version emitan el token nuevo por un camino que no dependa de saltear el chequeo (p. ej. pasar la version nueva en el payload de unstable_update y aceptarla solo si coincide con la DB, o re-loguear tras el cambio). Sumar la prueba multi-dispositivo de PLAN-006.
- Cómo verificar: VH-005 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-006 en 03-MEJORAS.md

### BUG-003 · El envio del magic link nunca falla: sendVerificationRequest ignora el resultado de Brevo y la UI muestra exito
- Contexto: D1 · h1.auth-login.magic-link, int.brevo, int.sentry, lib.auth. MEDIA, PROBABLE.
- Evidencia: `src/auth.ts:104` — «await sendTransactionalEmail({»; `src/lib/email/brevo-service.ts:20` — «if (!process.env.BREVO_API_KEY) { console.error('[Brevo] BREVO_API_KEY no configurada') return { ok: false, error: 'EMAIL_NOT_CONFIGURED' }»; `src/lib/email/brevo-service.ts:40` — «} catch (error) { console.error('[Brevo] Error sending email:', error)»; librería @getbrevo/brevo@5.0.4, dist/cjs/core/fetcher/requestWithRetries.js línea 15 — «const DEFAULT_MAX_RETRIES = 2;»
- Impacto: Sin BREVO_API_KEY, con Brevo caido o remitente no verificado, el cliente ve 'Link generado' y nunca recibe nada; no queda rastro en Sentry (solo console.error). El SDK espera hasta 60 s por intento con 2 reintentos, dejando el submit colgado hasta el timeout de la funcion (RESIL-05 parcial).
- Propuesta: Decision para Valentino (auth.ts FROZEN + ZONA-FRANCO): lanzar cuando result.ok es false para que Auth.js devuelva error (PLAN-017). En brevo-service.ts (libre) pasar timeoutInSeconds/maxRetries cortos y Sentry.captureException en el catch.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: una parte del arreglo cae fuera de la zona (ver Propuesta, «libre»): coordinar con Valentino quién la hace
- Ficha completa: BUG-003 en 03-MEJORAS.md

### BUG-006 · Una falla de la base en el callback jwt se trata como 'sin sesión': rebote /login <-> portal en vez de pantalla de error, y unstable_update borra la cookie
- Contexto: D1 · lib.auth, lib.proxy, h2.cli-shell, h4.adm-shell, h1.auth-cambio, lib.prisma, int.sentry. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/auth.ts:207` — «const shouldRefreshFromDb = Boolean(userId) && (trigger === 'update' || trigger === 'signIn' || !user)»; `src/auth.ts:209` — «if (userId && shouldRefreshFromDb) { const accessState = await getUserAccessState(userId)»; librería @auth/core@0.41.2, lib/actions/session.js línea 58 — «catch (e) { logger.error(new JWTSessionError(e));»; librería @auth/core@0.41.2, lib/actions/session.js línea 61 — «response.cookies?.push(...sessionStore.clean());»; librería next-auth@5.0.0-beta.31, lib/index.js línea 48 — «return getSession(_headers, _config).then((r) => r.json());»; librería next-auth@5.0.0-beta.31, lib/actions.js línea 83 — «for (const c of res?.cookies ?? []) cookieJar.set(c.name, c.value, c.options);»; `src/app/(protected)/dashboard/layout.tsx:90` — «if (!organizationId) { redirect(session?.user?.role === 'SUPER_ADMIN' ? '/admin/clients' : '/login')»; `src/app/(protected)/admin/layout.tsx:43` — «if (!session?.user) { redirect('/login')»; `src/proxy.ts:143` — «return NextResponse.redirect( new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)»; `src/app/(protected)/dashboard/_actions/business-profile.actions.ts:26` — «if (!organizationId) return { ok: false, error: 'Tu sesión expiró. Volvé a entrar.' }»; `src/app/cambiar-password/actions.ts:73` — «await unstable_update({ user: { passwordResetRequired: false } })»
- Impacto: Bloqueante para L3 del portal ante cualquier hipo de Neon (despertar en frío, timeout del pool). Cada auth() en Node consulta la base (getUserAccessState) y el callback no distingue 'base caída' de 'sesión inválida': Auth.js atrapa el error, lo imprime en consola y devuelve sesión nula. Los layouts de dashboard, admin y setter mandan a /login; el proxy, que no consulta la base, ve la cookie válida y devuelve al portal. Resultado: rebotes mientras dure la falla y ERR_TOO_MANY_REDIRECTS si persiste, en vez de error.tsx con 'Reintentar'. Las server actions responden 'Tu sesión expiró', 'Sesión inválida' o 'No autenticado' sin que la sesión haya vencido. Si la falla cae en el unstable_update posterior a cambiar la contraseña (cambiar-password y Mi Cuenta), Auth.js borra la cookie: el cliente queda deslogueado justo después de un cambio exitoso. Nada llega a Sentry: develOP no ve la caída ni su efecto.
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): envolver getUserAccessState del callback jwt en try/catch; ante error de infraestructura, capturar en Sentry y devolver el token marcado (p. ej. token.error = 'db_unavailable') en vez de dejar que Auth.js lo convierta en sesión nula. Exponer la marca en la sesión y que los layouts (zona libre) lancen un error real (error.tsx con reintento) en vez de redirect('/login'). Alternativa: conservar los claims del token durante la caída (sin chequeo de sessionVersion) con alerta. Configurar logger.error de NextAuth hacia Sentry (ver el FAL de este ciclo).
- Cómo verificar: VH-018 en 08-VERIFICACION-HUMANA.md
- Coordinación: una parte del arreglo cae fuera de la zona (ver Propuesta, «libre»): coordinar con Valentino quién la hace
- Ficha completa: BUG-006 en 03-MEJORAS.md

### BUG-007 · El magic link se gasta en el primer GET: un escáner de enlaces del correo lo consume antes que el cliente
- Contexto: D1 · h1.auth-login, h1.auth-login.magic-link, lib.auth, modelo.VerificationToken, int.brevo. MEDIA, PROBABLE.
- Evidencia: librería @auth/core@0.41.2, lib/actions/signin/send-token.js línea 52 — «url: '${baseUrl}/callback/${provider.id}?${new URLSearchParams({»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 141 — «const invite = await adapter.useVerificationToken({»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 153 — «if (invalidInvite) throw new Verification({ hasInvite, expired });»; `src/auth.ts:95` — «pages: { signIn: LOGIN_PATH },»; `src/auth.ts:113` — «<a href="${url}"»; `src/app/reset-password/actions.ts:80` — «prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() },»
- Impacto: El enlace del email apunta directo a GET /api/auth/callback/resend, que borra el token de un solo uso en el primer pedido (useVerificationToken), sin interacción. Los filtros de correo que abren los links para analizarlos (Microsoft 365 Safe Links/Defender, Mimecast, Proofpoint, algunos antivirus) lo consumen antes que la persona. Cuando el cliente hace clic, Auth.js lanza Verification y muestra su página de error en inglés (UX-002). Para un primer cliente con correo corporativo el magic link no funciona nunca y no hay explicación. El reset de contraseña no tiene el problema: /reset-password solo consume el token al enviar el formulario (POST). Eslabón inferido: el comportamiento del escáner del proveedor de correo.
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): que sendVerificationRequest mande un link a una página propia de confirmación (zona libre, p. ej. /login/confirmar) con un botón que recién ahí siga al callback, o reemplazar el link por un código de un solo uso. Configurar pages.error/verifyRequest con texto en español (ver UX-002).
- Cómo verificar: VH-021 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-007 en 03-MEJORAS.md

### BUG-038 · La agenda del setter usa «la única org con calComUsername»: con dos orgs configuradas se rompe, y si la única es un cliente reserva en su Cal.com con el nombre y el email del prospecto
- Contexto: D2 · h5.set-lead, h2.cli-agenda.panel-de-agenda, lib.leados, int.calcom, modelo.Organization, h5.set-manual, h5.set-manual.agenda-reunion, h2.cli-agenda, h5.set-manual.agenda, h5.set-lead.agenda-reunion. MEDIA, PROBABLE.
- Evidencia: `src/lib/leados/agenda.ts:58` — «const orgs = await prisma.organization.findMany({ where: { calComUsername: { not: null } },»; `src/lib/leados/agenda.ts:70` — «if (orgs.length > 1) { // devuelve 'Hay mas de una agenda conectada...'»; `src/app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:325` — «select: { calComApiKey: true, calComUsername: true, calComEmbedUrl: true }, // mismos campos»; `src/app/(protected)/setter/_actions/agenda.actions.ts:134` — «const config = await getCalConfigLeadOS()»; `src/lib/leados/agenda.ts:59` — «where: { calComUsername: { not: null } },»; `src/lib/leados/agenda.ts:86` — «const [org] = orgs»; `src/lib/integrations/cal-com-v2.ts:10` — «POST /v2/bookings → SIN auth»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/agenda-form.tsx:141` — «confirmacion.run(() => confirmarReunion(leadId, input), {»; `src/app/(protected)/setter/_actions/agenda.actions.ts:218` — «metadata: { leadId },»; `src/app/(protected)/setter/_actions/agenda.actions.ts:213` — «const booking = await createBooking({ username: config.username, eventTypeSlug: config.eventTypeSlug,»; `src/app/(protected)/setter/_actions/agenda.actions.ts:217` — «attendee: { name: nombre, email }, metadata: { leadId },»; `src/lib/leados/agenda.ts:64` — «console.warn( '[leados agenda] Cal.com sin configurar: ninguna Organization tiene calComUsername. ' +»
- Impacto: El dia que develOP configure Cal.com para su primer cliente del modulo Agenda, el setter deja de poder agendar reuniones hasta que alguien borre el username de una de las dos orgs.
- Propuesta: Coordinar con Franco: identificar la org de develOP por un flag/slug explicito o config propia de LeadOS en vez de 'la unica con calComUsername'.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-038 en 03-MEJORAS.md

### BUG-146 · Tras RE_SEGUIMIENTO el setter no puede volver a agendar: la agenda queda AGENDADA para siempre
- Contexto: D4 · h4.adm-leads.cierre-reunion, h5.set-manual.agenda-reunion, lib.leados, modelo.OsLeadDossier, h5.set-lead.agenda-reunion, h4.adm-leads.cierre-post-reunion. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/admin/leads/_actions/reunion.actions.ts:31` — «RE_SEGUIMIENTO: LeadStatus.RESPONDIO,»; `src/lib/leados/agenda.ts:378` — «where: { leadId, agendaJson: { path: ['estado'], equals: 'AGENDADA' } },»; `src/lib/leados/flow.ts:171` — «return agenda?.estado === 'AGENDADA' && Boolean(agenda.calBookingUid)»; `src/app/(protected)/setter/_actions/agenda.actions.ts:108` — «if (reunionAgendada(parseAgenda(dossier.agendaJson))) {»; `src/lib/leados/agenda.ts:373` — «const parsed = AgendaSchema.parse({ ...agenda, resultado: { tipo, fecha: new Date().toISOString(), nota },»; `src/lib/leados/agenda.ts:174` — «const PARTIDA_RECLAMABLE: Prisma.OsLeadDossierWhereInput[] = [ { agendaJson: { equals: Prisma.AnyNull } }, { agendaJson: { path: ['estado'], equals: 'OFRECIDOS' } },»
- Impacto: El resultado RE_SEGUIMIENTO devuelve el lead a RESPONDIO pero solo agrega 'resultado' al blob de agenda; gateAgenda sigue viendo una reunión agendada y rechaza ofrecer horarios y confirmar. El lead queda en un estado sin salida desde el panel (b8a H2 sigue abierto); la única vía es que Franco agende por fuera y mueva el estado a mano.
- Propuesta: Que el resultado RE_SEGUIMIENTO archive la agenda anterior (o que reunionAgendada ignore las agendas con resultado) y cubrirlo con un caso de prueba del ciclo agendar -> re-seguimiento -> re-agendar.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-146 en 03-MEJORAS.md

### BUG-147 · Un lead CERRADO (ganado) nunca se archiva en el panel del setter: vuelve a la cola de trabajo, a veces como foco, y el manual sigue pidiendo trabajo
- Contexto: D4 · h5.set-dia.cola-del-dia, h4.adm-leads.cierre-reunion, h4.adm-leads.crud-y-estado, lib.leados, modelo.OsLead, h5.set-dia, h5.set-dia.foco-y-cola, h5.set-dia.cartera-vistas-y-filtros, h4.adm-leads.cierre-post-reunion, h5.set-manual.derivacion-de-pantalla. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leads/_actions/reunion.actions.ts:29` — «GANADO: LeadStatus.CERRADO,»; `src/lib/leados/flow.ts:417` — «if (input.status === 'PERDIDO' || input.stage === 'DESCARTADA') return 'archivo'»; `src/lib/leados/revision.ts:27` — «export const ESTADOS_TERMINALES: LeadStatus[] = ['CERRADO', 'PERDIDO']»; `src/app/(protected)/setter/_actions/outreach.actions.ts:169` — «if (!leadActivo(lead.status)) {»; `src/lib/leados/flow.ts:73` — «'CERRADO',»; `src/lib/leados/flow.ts:740` — «if (lead.stage === 'EVALUADA' && lead.gateAbierto) return TRABAJO_TIER.CONSTRUIR»; `src/app/(protected)/setter/_actions/agenda.actions.ts:99` — «if (lead.status !== LeadStatus.RESPONDIO) {»; `src/lib/leados/ownership.ts:54` — «where: ownedListWhere(userId),»; `src/lib/leados/manual.ts:520` — «if (input.status === 'PERDIDO') { return { actual: 'archivo', habilitadas: [] }»; `src/lib/leados/paso-admitido.ts:47` — «return i.status === 'PERDIDO' || i.stage === 'DESCARTADA'»; `src/lib/leados/turno.ts:106` — «CERRADO: 'cierre',»
- Impacto: grupoPara y proximaAccionPara no contemplan CERRADO: un lead ganado vía reunión (o movido a CERRADO desde el kanban con updateLeadStatus, lead.actions.ts:102-108) sigue en 'seguimiento' o incluso en la cola 'trabajar' del setter, mientras registrarResultado lo rechaza como cerrado. El setter ve trabajo sobre un negocio ya vendido y los contadores de 'en vuelo' quedan inflados.
- Propuesta: Tratar CERRADO como terminal también en la partición (archivo o grupo 'ganados') usando la misma fuente ESTADOS_TERMINALES; agregar el caso al invariante de partición.
- Cómo verificar: VH-142 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-147 en 03-MEJORAS.md

### BUG-148 · La métrica descarte/avance atribuye cada evaluación al dueño actual del lead, no al setter que evaluó
- Contexto: D4 · h5.adm-revision-demos.metrica-descarte, lib.leados, modelo.OsLeadDossier. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leados/page.tsx:53` — «where: { lead: { assignedToId: { not: null } } },»; `src/app/(protected)/admin/leados/page.tsx:128` — «setterId: assignedTo.id,»; `src/app/(protected)/admin/leados/setter/[setterId]/page.tsx:42` — «where: { lead: { assignedToId: setterId } },»; `src/lib/leados/contracts.ts:93` — «export const EvaluacionSchema = z.object({ score, veredicto, razonamiento, ... fecha })»
- Impacto: El blob de evaluación no guarda quién evaluó. Después de una reasignación, los descartes del setter A cuentan para B; la alarma 'Nunca descarta — revisar criterio' puede encenderse o apagarse sobre la persona equivocada, y los leads desasignados desaparecen de la métrica. Es el criterio con el que Franco juzga a los setters.
- Propuesta: Estampar el userId del evaluador en la evaluación al transicionar a EVALUADA y agrupar por ese campo; las evaluaciones viejas, como 'sin autor'.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-148 en 03-MEJORAS.md

### BUG-149 · La compensación de confirmarReunion silencia el fallo de cancelación y afirma que el booking se canceló
- Contexto: D4 · h5.set-manual.agenda-reunion, int.calcom, int.sentry. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_actions/agenda.actions.ts:253` — «await cancelBooking(bookingUid, 'LeadOS no pudo registrar la reunión — reintentar').catch(() => undefined,)»; `src/app/(protected)/setter/_actions/agenda.actions.ts:258` — «console.error('[b7 confirmarReunion] registro local falló, booking compensado:', error)»; `src/app/(protected)/setter/_actions/agenda.actions.ts:259` — «return fail('No se pudo registrar la reunión — el booking se canceló solo, reintentá')»
- Impacto: Si falla el registro local y también falla cancelBooking, el prospecto ya recibió la confirmación de Cal.com, LeadOS dice que se canceló y el setter reintenta: doble reunión en el calendario de Franco. El evento solo queda en console.error, sin Sentry.
- Propuesta: Distinguir en el mensaje si la cancelación se confirmó; si no, avisar a Franco (Telegram/novedad) con el uid y capturar en Sentry. b8a H1 queda resuelto en lo demás.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-149 en 03-MEJORAS.md

### BUG-152 · Fechas del setter calculadas con el día UTC: de 21 a 24 h (hora argentina) las pausas quedan un día más largas, Postergar bloquea elegir mañana y la oferta de horarios no incluye los de mañana
- Contexto: D4 · h5.set-dia.foco-ahora, h5.set-dia.palancas-de-card, modelo.OsLeadSetterMeta, h5.set-manual.postergar-y-retomar, h5.set-lead.agenda-reunion, lib.leados, int.calcom. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_components/foco-surface.tsx:70` — «fecha.setDate(fecha.getDate() + dias) return fecha.toISOString().slice(0, 10)»; `src/app/(protected)/setter/_components/lead-card-actions.tsx:36` — «fecha.setDate(fecha.getDate() + dias) return fecha.toISOString().slice(0, 10)»; `src/app/(protected)/setter/_components/foco-surface.tsx:144` — «setMinDate(fechaEnDias(1))»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/seguimiento-form.tsx:94` — «const [minReactivacion] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),»; `src/lib/leados/agenda.ts:110` — «export function rangoOferta(desde: Date = new Date()): { start: string; end: string } { const start = new Date(desde.getTime() + 24 * 60 * 60 * 1000)»; `src/lib/leados/agenda.ts:113` — «return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }»
- Impacto: Argentina es UTC−3: entre las 21:00 y las 23:59 toISOString ya está en el día siguiente, así que «3 días / 1 semana / 2 semanas» mandan hoy+4/+8/+15 y el mínimo del selector de fecha salta a pasado mañana (no se puede pausar «hasta mañana»). El cálculo del cliente está verificado por lectura; cómo guarda pausarLead la fecha está fuera del lote (cartera.actions.ts:78). El helper y el panel de pausa están duplicados en los dos archivos (foco-surface.tsx:61-72 y :283-318; lead-card-actions.tsx:34-44 y :180-217).
- Propuesta: Un único helper de «fecha calendario en hora AR» compartido por FocoSurface y LeadCardActions (si va en dates-ar.ts/tz-ar.ts, que son FROZEN-inferido, es decisión para Valentino), y extraer el panel de pausa a un componente.
- Cómo verificar: VH-144 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-152 en 03-MEJORAS.md

### BUG-153 · La ficha por bloques puede avanzar sola cuando el setter cambia de pestaña o de ventana
- Contexto: D4 · h5.set-manual.ficha-por-bloques. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_components/bloques-secuenciales.tsx:138` — «const destino = evento.relatedTarget // El foco sigue adentro del bloque (tabular entre sus campos) → no es salir. if (destino instanceof Node && evento.currentTarget.contains(destino)) return»; `src/app/(protected)/setter/_components/bloques-secuenciales.tsx:145` — «onSalirDelBloque(id)»
- Impacto: Cuando la ventana pierde el foco el navegador emite focusout con relatedTarget null; el componente lo trata como salida del bloque (no hay puntero apretado en esta ventana) y el padre puede plegarlo y abrir el siguiente. El uso típico de la ficha por fuentes es ir a Instagram o Google a mirar: el setter vuelve y el bloque donde escribía ya no está montado (no pierde datos, pierde el lugar). Depende de la regla de completitud del padre (ficha-form.tsx:412, fuera del lote).
- Propuesta: Ignorar la salida cuando document.hasFocus() es false, o diferirla al próximo focusin fuera del bloque; sumar el caso a la spec 21.
- Cómo verificar: VH-145 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-153 en 03-MEJORAS.md

### BUG-155 · Textos de más de 5000 caracteres rompen el trabajo del setter: en la ficha tiran la pantalla y se pierde lo pegado, y el pegado del Gem y el motivo de descarte se cortan o invalidan la evaluación (las entradas no tienen tope y el contrato corta en 5000)
- Contexto: D4 · h5.set-manual.ficha-y-veredicto, lib.leados, modelo.OsLeadDossier, h5.set-manual.brief, h5.set-lead.ficha-y-veredicto. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx:148` — «return FichaSchema.parse(aObjeto(sinEnlaces))»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx:200` — «const faltantesEnVivo = useMemo(() => fichaFaltantes(aPayload(form)), [form])»; `src/lib/leados/contracts.ts:22` — «const TEXTO_LIBRE_MAX = 5000»; `src/lib/leados/contracts.ts:60` — «resenas: textoLibre,»; `src/lib/leados/guidance-content.ts:351` — «hint: 'Copiá textuales las reseñas con queja que se repite»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx:296` — «<TextArea value={form[campo]} ... rows={FILAS_TEXTAREA[campo]} /> (sin maxLength)»; `src/app/(protected)/setter/leads/[leadId]/_components/brief-form.tsx:174` — «<TextArea value={form.pegadoGem}»; `src/app/(protected)/setter/_actions/dossier.schemas.ts:89` — «pegadoGem: z.string().trim(),»; `src/lib/leados/dossier.ts:444` — «const parsed = BriefSchema.parse(brief)»; `src/lib/leados/contracts.ts:119` — «pegadoGem: textoLibre, // B3: respuesta cruda del Gem de diseño»; `src/app/(protected)/setter/_actions/dossier.actions.ts:215` — «return mapError(error, 'No se pudo guardar el brief')»; `src/app/(protected)/setter/_actions/dossier.schemas.ts:29` — «razonamiento: z.string().trim().min(1, 'Escribí por qué le pusiste ese score'), motivoDescarte: z .string()»; `src/lib/leados/dossier.ts:185` — «data.evaluacionJson = { ...evaluacion.data, motivoDescarte: motivo,»; `src/lib/leados/contracts.ts:97` — «motivoDescarte: textoLibre,»; `src/lib/leados/flow.ts:112` — «export function parseEvaluacion(json: unknown): Evaluacion | null { const parsed = EvaluacionSchema.safeParse(json)»; `src/lib/leados/contracts.ts:4` — «Regla: todo write a 'fichaJson' / 'evaluacionJson' / 'briefJson' / 'selfCheckJson' / 'rechazos' se parsea con estos schemas ANTES de tocar»
- Impacto: Bloqueante para el primer setter real que pegue un bloque largo de reseñas, que es lo que la guía le pide: cuando un campo pasa los 5000 caracteres, FichaSchema.safeParse falla, el fallback solo vacía los enlaces y llama a .parse, que lanza ZodError durante el render (useMemo). La pantalla cae al error boundary, y se pierde lo pegado más lo tipeado desde el último autoguardado. Si vuelve a pegar, se repite, y nunca le dicen cuál es el límite.
- Propuesta: Que aPayload nunca lance: safeParse también en el fallback, y que el campo largo quede marcado con su error. Mostrar el tope en cada textarea (maxLength o contador) leyendo el mismo TEXTO_LIBRE_MAX del contrato. Coordinarlo con Franco.
- Cómo verificar: VH-146 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-155 en 03-MEJORAS.md

### BUG-156 · Plegar el bloque «Tu decisión» descarta el veredicto cargado sin aviso
- Contexto: D4 · h5.set-manual.ficha-y-veredicto, h5.set-manual. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/_components/bloques-secuenciales.tsx:215` — «{estaAbierto && (»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx:388` — «if (cierre) { bloques.push({ id: 'cierre',»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx:416` — «onAbrir={(id) => setAbierto(id as BloqueId)}»; `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx:85` — «const [score, setScore] = useState<number | null>(null) const [veredicto, setVeredicto] = useState<string>('') const [razonamiento, setRazonamiento] = useState('')»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m1-ficha.tsx:35` — «el paso — en ese orden, porque el segundo se decide mirando el primero.»
- Impacto: Un setter carga score, veredicto y razonamiento y abre un bloque de la ficha para releer lo que anotó, que es lo que la pantalla le pide. Al volver encuentra los tres campos vacíos. El estado vive dentro de EvaluacionForm, que se desmonta al cambiar de bloque. La guardia de salida se desmonta con él, así que no hay aviso. Es el «juicio entero» que P23 quiso proteger.
- Propuesta: Subir el estado del veredicto a FichaForm o a M1Registro, o mantener montado (oculto) el contenido del bloque de cierre. La otra opción es pedir confirmación antes de cambiar de bloque cuando hay trabajo sin registrar.
- Cómo verificar: VH-147 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-156 en 03-MEJORAS.md

### BUG-157 · Tildar varias fases de construcción seguidas guarda solo la última (carrera sobre progresoJson)
- Contexto: D4 · h5.set-manual.construccion, modelo.OsLeadDossier. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_components/fase-auto-reporte.tsx:69` — «const siguiente = marcar ? [...completadas.filter((id) => id !== faseId), faseId] : completadas.filter((id) => id !== faseId)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/fase-auto-reporte.tsx:74` — «const result = await guardarProgreso(leadId, { completadas: siguiente })»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m-construccion.tsx:309` — «completadas={completadas}»; `docs/bitacora-beta-3.md:8238` — «(B3) tildar tres fases de construcción seguidas (400 ms) guarda una y la pantalla muestra tres — reproducido dos veces contra la base»
- Impacto: Cada tilde arma el array completo a partir de la misma prop que mandó el server. Si no hay un refresh entre clics, el último guardado pisa a los anteriores: el setter ve sus marcas y en la base queda una sola, y Franco lee en el panel menos avance del real. Es MEDIA porque el tilde es auto-reporte y no gatea nada.
- Propuesta: Integrar o rehacer el arreglo de P25, con un único dueño del blob por pantalla y el guardado de cada fase serializado o resuelto en el server. Hoy ese arreglo vive fuera de main: d0b37c71 en p25/carrera-tildes y 130492e8 en p25/rafaga-tildes.
- Cómo verificar: VH-148 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-157 en 03-MEJORAS.md

### BUG-160 · Un toque registrado en m5 sobre un lead con reunión agendada le pisa el estado CALL_AGENDADA
- Contexto: D4 · h5.set-manual, h5.set-manual.registrar-resultado-toque, lib.leados, modelo.OsLead, h4.adm-leads. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx:71` — «const accesible = posicion.completadas.includes(paso) || posicion.habilitadas.includes(paso)»; `src/lib/leados/manual.ts:466` — «if (toquesHechos > 0 && stage !== null && STAGES_POST_BRIEF.includes(stage)) { done.add('m5')»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m5-seguimiento.tsx:284` — «<SeguimientoForm leadId={leadId} cadenciaAgotada={cadenciaAgotada} />»; `src/app/(protected)/setter/_actions/outreach.actions.ts:169` — «if (!leadActivo(lead.status)) { // solo rechaza CERRADO/PERDIDO (revision.ts:27)»; `src/lib/os-commercial.ts:85` — «if (input.result === ActivityResult.RESPONDIO) { await prisma.osLead.update({ ... status: LeadStatus.RESPONDIO,»; `src/lib/os-commercial.ts:188` — «status: LeadStatus.POSTERGADO, reactivateAt,»
- Impacto: Con la reunión ya reservada (status CALL_AGENDADA, m16 completada) m5 sigue figurando completada y navegable, y su formulario se monta sin mirar el status. Si el negocio escribe para confirmar y el setter registra «Respondió», el lead vuelve a RESPONDIO; si registra «Postergar», pasa a POSTERGADO; «No respondió» rearma la cadencia sobre una reunión ya agendada. El lead sale de «Agendadas» en el panel del setter y cambia de columna en el kanban de Franco sin aviso: estado comercial corrompido en el primer cliente real que se agende.
- Propuesta: Decisión para Franco: que registrarResultado rechace RESPONDIO/POSTERGADO/SIN_RESPUESTA cuando el status es CALL_AGENDADA (o que os-commercial nunca baje un status ya más avanzado), y que M5Registro muestre la charla en solo lectura cuando hay reunión agendada.
- Cómo verificar: VH-151 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-160 en 03-MEJORAS.md

### BUG-161 · El alta manual de un prospecto no deduplica contra el sistema: dos setters pueden trabajar el mismo negocio
- Contexto: D4 · h5.set-nuevo, h5.set-nuevo.alta-manual, h5.set-nuevo.aviso-duplicado, modelo.OsLead, lib.leados. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:69` — «// Aviso NO bloqueante: el setter ya tiene un lead con ese nombre. No frena el»; `src/app/(protected)/setter/nuevo/page.tsx:22` — «const existentes = await prisma.osLead.findMany({ where: ownedListWhere(userId),»; `src/app/(protected)/setter/_actions/prospecto.actions.ts:28` — «const lead = await prisma.osLead.create({ data: ownedLeadCreateData(parsed, userId),»; `src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts:95` — «duplicadas.push({ fila: u.fila, nombre: u.data.businessName, motivo: 'en-sistema' })»
- Impacto: La importación por CSV salta los negocios que ya están en la cartera de otro setter, pero el alta a mano los crea igual y sin aviso (el cotejo es solo contra la cartera propia, y OsLead no tiene unique en businessName). Dos setters pueden mandarle DMs al mismo negocio, construir dos demos y llegar a Franco con dos leads del mismo comercio: mala imagen frente al prospecto y trabajo duplicado.
- Propuesta: Aplicar en cargarProspecto el mismo cotejo 'en-sistema' (nombresEnSistema) que usa la importación, devolviendo un aviso que no revele de quién es el lead; decidir con Franco si bloquea o pide confirmación.
- Cómo verificar: VH-152 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-161 en 03-MEJORAS.md

### BUG-162 · Un POSTERGADO retomado queda POSTERGADO sin fecha y su cadencia nueva nunca vuelve a la cola de trabajo
- Contexto: D4 · h5.set-manual.postergar-y-retomar, h5.set-dia, lib.leados, modelo.OsLead. MEDIA, PROBABLE.
- Evidencia: `src/lib/os-commercial.ts:19` — «todo contacto real (...) limpia además el vencimiento del postergado (reactivateAt:null) (...) El status NO se toca acá»; `src/lib/os-commercial.ts:79` — «await prisma.osLead.update({ where: { id: input.leadId }, data: { nextFollowUpAt, reactivateAt: null },»; `src/lib/leados/flow.ts:420` — «if (input.status === 'POSTERGADO') { ... return input.postergadoVencido ? 'trabajar' : 'seguimiento'»; `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:167` — «lead.status === 'POSTERGADO' && lead.reactivateAt !== null &&»
- Impacto: Cuando vence la postergación y el setter registra «No respondió — mandé un toque», se agenda un próximo toque pero el lead sigue POSTERGADO con reactivateAt nulo: postergadoVencido da false y grupoPara lo deja en «seguimiento» antes de mirar el toque vencido. El próximo toque nunca aparece en «Para trabajar»; el negocio que pidió que lo contacten más adelante se enfría sin que nadie lo vea (solo lo listaría el cron, que en Netlify no corre).
- Propuesta: Decisión para Franco (PLAN-866): definir la transición POSTERGADO -> status de trabajo al registrar el retomar, o que grupoPara/derivarPantalla consideren followUpVencido cuando un POSTERGADO no tiene reactivateAt.
- Cómo verificar: VH-153 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-162 en 03-MEJORAS.md

### BUG-163 · El digest de Telegram del cron no tiene tope: con muchos pendientes supera el límite del mensaje y falla todos los días
- Contexto: D4 · int.cron.os-follow-up, int.telegram, h4.adm-leads.digest-follow-ups-telegram. MEDIA, PROBABLE.
- Evidencia: `src/app/api/cron/os-follow-up/route.ts:176` — «prisma.osLead.findMany({ where: { OR: [»; `src/app/api/cron/os-follow-up/route.ts:121` — «const lines = leads.map((lead) => {»; `src/app/api/cron/os-follow-up/route.ts:267` — «if (!sent) { // (...) No creamos el marker de idempotencia → la próxima corrida reintenta.»
- Impacto: La consulta no tiene take y el mensaje lleva una línea por lead. sendTelegram (telegram.ts:67) no parte ni recorta el texto (no se encontró manejo de largo), y Telegram rechaza mensajes de más de ~4096 caracteres. Con unos 60-70 leads pendientes el envío falla, el cron devuelve 500 sin crear el marcador y vuelve a fallar cada día, sin aviso porque el error solo va a console.error.
- Propuesta: Recortar el digest (top N + 'y X más' con link a /admin/leads) o partirlo en varios mensajes, y registrar el fallo en Sentry.
- Cómo verificar: VH-154 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-163 en 03-MEJORAS.md

### BUG-164 · Una APROBADA con link, demo sin mandar, gate cerrado y toque vencido entra a «Para trabajar» con una sugerencia de espera, y el manual y el grupo del home se contradicen
- Contexto: D4 · h5.set-dia, lib.leados, h5.set-dia.foco-y-cola, h5.set-manual.derivacion-de-pantalla, modelo.OsLeadDossier. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/lib/leados/flow.ts:438` — «if (input.finalUrl === null && !input.demoEnviada) return 'seguimiento'»; `src/lib/leados/flow.ts:441` — «if (input.followUpVencido) return 'trabajar'»; `src/lib/leados/flow.ts:539` — «if (!input.demoEnviada) { return esperaDe(»; `src/lib/leados/flow.ts:745` — «if (lead.followUpVencido || lead.postergadoVencido) return TRABAJO_TIER.ESPERA_TU_ACCION»; `src/lib/leados/manual.ts:670` — «return input.followUpVencido ? { actual: 'm5', habilitadas: ['m5', 'm15'] } : { actual: 'espera', habilitadas: ['espera', 'm5', 'm15'] }»; `src/lib/leados/flow.ts:440` — «if (input.finalUrl === null && !input.demoEnviada) return 'seguimiento'»; `src/lib/leados/flow.ts:443` — «if (input.followUpVencido) return 'trabajar'»; `src/lib/leados/paso-admitido.ts:97` — «return i.followUpVencido || cadenciaInfo(i.followUpCount).agotada ? SI»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/pantalla-manual.tsx:132` — «const esPasoActivo = esActual && posicion.habilitadas.length > 0»
- Impacto: El grupo y la accionabilidad salen de dos escaleras independientes (grupoPara y proximaAccionPara, ambas en clasificarLead :641). Si el lead tiene finalUrl, la demo no se mandó, el gate está cerrado (por ejemplo Franco desmarcó caliente o movió el status desde el kanban) y hay un toque vencido, cae en 'trabajar' (y puede ser el foco) con una card no accionable que dice «esperá». P23 solo cubrió el caso sin link (:438).
- Propuesta: Que grupoPara derive 'trabajar' solo cuando proximaAccionPara es accionable (una fuente única), o agregar la rama faltante; cubrirlo en flow.invariant.
- Cómo verificar: VH-155 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-164 en 03-MEJORAS.md

### BUG-168 · Mis números y la carga del admin cuentan como activos los leads descartados
- Contexto: D4 · h5.set-dia.mis-numeros, h4.adm-leads.carga-por-setter, lib.leados, modelo.OsLead, modelo.OsLeadDossier. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/lib/leados/mis-numeros.ts:94` — «const activos = leads.reduce((n, lead) => (leadActivo(lead.status) ? n + 1 : n), 0)»; `src/lib/leados/revision.ts:27` — «export const ESTADOS_TERMINALES: LeadStatus[] = ['CERRADO', 'PERDIDO']»; `src/lib/leados/setter-carga.ts:66` — «assignedToId: { in: setterIds }, status: { notIn: ESTADOS_TERMINALES },»; `src/app/(protected)/setter/_actions/dossier.actions.ts:152` — «await transitionDossier(leadId.data, { to: 'DESCARTADA', motivoDescarte,»; `src/lib/leados/flow.ts:417` — «if (input.status === 'PERDIDO' || input.stage === 'DESCARTADA') return 'archivo'»; `src/lib/leados/mis-numeros.invariant.ts:56` — «{ status: 'PROSPECTO', dossier: { evaluacionJson: ev('DESCARTAR', RECIENTE) } },»
- Impacto: El descarte solo mueve el stage del dossier (dossier.actions.ts:150-157; ninguna escritura de OsLead.status en ese camino), así que un lead descartado sigue en PROSPECTO. «Mis números» lo cuenta como activo mientras el home lo manda al archivo, y Franco asigna leads mirando una carga viva inflada con descartes. Para el primer setter real: números propios que no cierran con su cartera, y asignaciones sesgadas.
- Propuesta: Definir 'lead vivo' en un único predicado que mire status y stage (PERDIDO/CERRADO o dossier DESCARTADA), igual al corte de grupoPara, y usarlo en mis-numeros y en setter-carga (excluir dossier.stage DESCARTADA del groupBy o contar en memoria). Corregir el fixture del invariante mis-numeros, que hoy fija el comportamiento.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-168 en 03-MEJORAS.md

### BUG-177 · Re-correr el backfill de caliente pisa las marcas manuales de Franco (sin guard ni dry-run)
- Contexto: D9 · h4.adm-leads, h5.adm-revision-demos, modelo.OsLead. MEDIA, PROBABLE.
- Evidencia: `scripts/admin-1a-backfill-caliente.ts:20` — «* Idempotente: setea 'caliente' al valor calculado para TODOS los leads (true a»; `scripts/admin-1a-backfill-caliente.ts:72` — «if (lead.caliente !== objetivo) { await prisma.osLead.update({»; `scripts/admin-1a-backfill-caliente.ts:42` — «if (!process.env.DATABASE_URL) {»; `src/app/(protected)/admin/leads/_actions/lead.actions.ts:165` — «data: { assignedToId: parsed.setterId, caliente: parsed.caliente },»
- Impacto: admin-1b ya convirtió caliente en una marca manual del admin, pero el script sigue en el repo presentado como idempotente. Quien lo corra (sin --confirm, sin chequeo de host, cargando .env.local) devuelve en silencio cada marca manual a la regla de score, en la base a la que apunte. El efecto es que se pierden decisiones comerciales sin dejar rastro.
- Propuesta: Coordinar con Franco: borrar el script (el one-shot ya se aplicó) o hacerlo abortar si existe algún lead cuyo caliente difiere de la regla, con --confirm y dry-run.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-177 en 03-MEJORAS.md

### DEU-074 · deleteLead borra en cascada el trabajo del setter sin auditoría ni aviso
- Contexto: D4 · h4.adm-leads.crud-y-estado, modelo.OsLead, modelo.OsLeadDossier. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leads/_actions/lead.actions.ts:237` — «await prisma.osLead.delete({ where: { id: parsedLeadId },»; `prisma/schema.prisma:919` — «lead OsLead @relation(fields: [leadId], references: [id], onDelete: Cascade)»
- Impacto: Un borrado desde el kanban elimina dossier, brief, self-check, historial de rechazos, actividades, demos y meta del setter (relaciones Cascade en schema.prisma:919, :965, :983, :1017) sin AuditLog y sin la novedad 'te sacaron un lead' que sí emite la reasignación (lead.actions.ts:199-203). Ninguna acción admin de este lote escribe auditoría.
- Propuesta: Registrar auditoría y emitir LEAD_REASIGNADO_SALIENTE al dueño antes de borrar; evaluar soft-delete (archivar) para leads con dossier. El schema es FROZEN: el cambio de modelo es decisión para Valentino.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-074 en 03-MEJORAS.md

### DEU-077 · main no tiene P25–P43: el trabajo posterior de LeadOS vive en origin/p25/rafaga-tildes
- Contexto: D4 · h5.set-manual, h5.set-manual.construccion, h5.set-manual.brief. MEDIA, PROBABLE.
- Evidencia: `docs/bitacora-beta-3.md:10975` — «- **No se pusheó a 'main'.** Ni una vez. El push es de Franco.»; `docs/bitacora-beta-3.md:10976` — «- **No se rehizo el arreglo de la carrera de tildes.** Su diagnóstico sigue en pie»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/fase-auto-reporte.tsx:69` — «const siguiente = marcar»
- Impacto: Se auditó origin/main @57c421bc (Franco, 2026-09-06). origin/p25/rafaga-tildes (Franco, 2026-09-18) suma 5 commits sin integrar (P25 'la ráfaga', P26, P27 'aislamiento probado', P28 y el WIP P36-P43) que tocan 51 archivos del setter y de lib/leados (+4544/−320). Entre ellos están brief-form, fase-auto-reporte y m-construccion de este lote. Algunos hallazgos de esta auditoría pueden estar resueltos o reescritos en esa rama, y los que la auditoría de OSLEAD reportó sobre ella (H-01) no aparecen en main.
- Propuesta: Para 09-PARA-FRANCO: decidir si p25/rafaga-tildes se integra o se descarta antes de arreglar nada en main, y volver a correr este lote sobre el resultado.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-077 en 03-MEJORAS.md

### DEU-080 · manual/[paso]/page.tsx: 453 líneas y una escalera de diez ternarios anidados para despachar pantallas
- Contexto: D4 · h5.set-manual, h5.set-manual.aterrizaje-y-guardia. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx:213` — «const slots = pantalla.id === 'm1' ? {»; `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx:385` — «: pantalla.id === 'm5'»; `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx:438` — «: {}»
- Impacto: Cada pantalla nueva o cambio de props obliga a editar un ternario de 225 líneas con indentación de 26 espacios; el fallback {} renderiza una pantalla vacía en silencio si una id nueva no se cablea. CLAUDE.md prohíbe componentes de más de 300 líneas sin separación (anti-vibecode).
- Propuesta: Un registro Record<PantallaId, (manual) => Slots> en un módulo aparte, con exhaustividad de tipos (sin fallback {}), como sprint propio de Franco (PLAN-881).
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-080 en 03-MEJORAS.md

### FAL-003 · Los errores de autenticación no llegan a Sentry: NextAuth sin logger y loginAction convierte todo AuthError en 'error inesperado' (y lo cuenta como intento fallido)
- Contexto: D1 · h1.auth-login, h1.auth-login.password, h1.auth-login.magic-link, lib.auth, int.sentry. MEDIA, PROBABLE.
- Evidencia: `src/auth.ts:76` — «const nextAuthResult = NextAuth({ adapter: PrismaAdapter(prisma) as Adapter, trustHost: true,»; librería @auth/core@0.41.2, lib/utils/logger.js línea 7 — «error(error) { const name = error instanceof AuthError ? error.type : error.name; console.error('${red}[auth][error]${reset} ${name}: ${error.message}');»; librería @auth/core@0.41.2, lib/actions/callback/index.js línea 388 — «const error = new CallbackRouteError(e, { provider: provider.id });»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»; `src/app/login/actions.ts:122` — «return 'Ocurrió un error inesperado. Intentá de nuevo.'»; `src/app/login/actions.ts:153` — «if (error instanceof AuthError) { return 'No se pudo generar el Magic Link. Intentá de nuevo.'»; `src/instrumentation.ts:49` — «export const onRequestError = Sentry.captureRequestError»
- Impacto: Auth.js atrapa sus errores internos (base caída en authorize o en los callbacks, que llegan como CallbackRouteError o AccessDenied; AdapterError al crear el token del magic link; JWTSessionError; errores de OAuth) y solo los imprime con console.error. La config no define logger ni events y no hay captureConsoleIntegration. Lo que sí llega a las actions se devuelve como texto, y onRequestError solo ve errores que se lanzan. Para el primer cliente real: si el login se rompe por la plataforma, cada intento dice 'Ocurrió un error inesperado' o 'No se pudo generar el Magic Link' y develOP se entera cuando el cliente llama. Además loginAction cuenta esas fallas del servidor como intentos fallidos: con 5 seguidas el cliente queda bloqueado 5 minutos ('Demasiados intentos fallidos') aunque nunca se equivocó.
- Propuesta: Zona libre en login/actions.ts: capturar en Sentry los AuthError que no sean CredentialsSignin (ni el AccessDenied esperado del magic link) y no llamar a recordFailedAttempt para ellos. Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO): logger.error de NextAuth que envíe a Sentry (el scrub de PII ya corre en beforeSend).
- Cómo verificar: VH-023 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-003 en 02-PENDIENTE.md

### FAL-031 · Los fallos de LeadOS no llegan a Sentry: las server actions tragan las excepciones y los avisos, el escalamiento y el cron os-follow-up solo hacen console.error
- Contexto: D4 · h5.set-lead, h5.set-manual, h5.adm-revision-demos, int.sentry, lib.leados, int.cron.os-follow-up, h5.set-dia.novedades-dirigidas, h5.set-lead.escalamiento-construccion, int.telegram, modelo.OsSetterNotice. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_actions/dossier.actions.ts:71` — «function mapError(error: unknown, fallback: string) { ... return fail(fallback) }»; `src/app/(protected)/setter/_actions/outreach.actions.ts:52` — «function mapError(error: unknown, fallback: string): ActionResult<never> {»; `src/app/(protected)/admin/leados/_actions/revision.actions.ts:52` — «console.error('[revision] aviso al setter no fatal:', error)»; `src/app/api/cron/os-follow-up/route.ts:297` — «console.error('[cron os-follow-up] execution error:', error)»; `src/app/api/cron/os-follow-up/route.ts:270` — «return NextResponse.json( { ok: false, error: 'Telegram send failed' },»; `src/lib/leados/novedades.ts:131` — «console.error('[novedades] fallo no fatal al emitir novedad:', error)»; `src/lib/leados/novedades.ts:303` — «console.error('[novedades] fallo no fatal al leer avisos:', error) return { filas: [], ocultos: 0, revision, totalSinLeer: 0 }»; `src/lib/leados/notify.ts:69` — «console.error('[leados notify] fallo no fatal:', error)»; `src/lib/leados/notify.ts:175` — «console.error('[leados notify] fallo no fatal:', error)»; `src/lib/leados/progreso.ts:122` — «console.error('[progreso] fallo no fatal al contar contactos:', error)»
- Impacto: Ninguna de las ~40 acciones del lote llama a captureException (git grep: 0); la mayoría ni siquiera loguea. Un fallo de Neon o de Cal.com en el flujo del setter queda como un toast genérico, invisible para Franco y para Sentry. Bloquea el criterio Sentry de L3 en todo LeadOS.
- Propuesta: En cada mapError, antes del fallback, capturar con Sentry (tag section: leados, acción y leadId) los errores no esperados; mantener el copy al usuario.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-031 en 02-PENDIENTE.md

### FAL-032 · La revisión de Franco no muestra los materiales de la ficha
- Contexto: D4 · h5.adm-revision-demos.cola-y-veredicto, modelo.OsLeadDossier. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:236` — «const FICHA_BLOQUES: Array<{ key: keyof Ficha; label: string }> = [»; `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:256` — «return typeof valor === 'string' && valor.trim() !== '' ? valor : null»; `src/lib/leados/contracts.ts:73` — «materiales: z.object({ resenasUrl, imagenesUrl, otraRedUrl, queVende, comoSePresenta })»
- Impacto: El setter carga en la ficha los links de reseñas e imágenes reales, qué vende y cómo se presenta (P5-A), pero el panel de revisión solo lista los seis bloques viejos y descarta todo lo que no es string: Franco aprueba o rechaza la demo sin ver el material que debía usar (PLAN-667 sigue abierto).
- Propuesta: Agregar un bloque 'Material del negocio' que renderice materiales (links como enlaces externos) en FichaPanel.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-032 en 02-PENDIENTE.md

### FAL-033 · Cuatro de las cinco herramientas externas del recorrido del setter siguen sin link (TODO) y el rail ofrece el «Chat de evaluación» que el recorrido ya no usa
- Contexto: D4 · h5.set-manual.herramientas-externas, lib.leados, h5.set-lead, h5.set-manual.opener, h5.set-manual.brief, h5.set-manual.construccion, h5.set-dia, h5.set-manual.ficha-y-veredicto, h5.set-manual, h5.set-manual.guia-y-herramientas, h5.set-lead.brief-y-construccion. MEDIA, PROBABLE.
- Evidencia: `src/lib/leados/herramientas.ts:63` — «url: null, // TODO: URL — chat de evaluación en Sonnet (pedir a Franco)»; `src/lib/leados/herramientas.ts:123` — «'evaluador',»; `src/app/(protected)/setter/_components/tools-rail.tsx:41` — «<span className="shrink-0 text-[10px] uppercase tracking-wide text-amber-300/50"> pendiente»; `src/app/(protected)/setter/_components/tools-rail.tsx:26` — «{HERRAMIENTAS_ORDEN.map((id) => {»; `src/app/(protected)/setter/_actions/dossier.schemas.ts:14` — «El veredicto del setter (D15-bis: antes era la transcripción de un chat de evaluación externo)»; `src/lib/leados/herramientas.ts:78` — «url: null, // TODO: URL — Gem privado de diseño/brief (pedir a Franco)»; `src/lib/leados/herramientas.ts:90` — «url: null, // TODO: URL — acceso a Claude Design que usa el equipo (pedir a Franco)»; `src/lib/leados/herramientas.ts:117` — «url: null, // TODO: URL — Gem privado de outreach (pedir a Franco)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m4-opener.tsx:63` — «<ToolGuide id="gemOutreach" />»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m6-brief.tsx:60` — «return <ToolGuide id="gemDiseno" />»; `src/lib/leados/herramientas.ts:55` — «nombre: 'Chat de evaluación (Sonnet)',»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m1-ficha.tsx:85` — «Lo que se fue con la fusión es el 'ToolGuide' del chat de evaluación: sin»; `src/lib/leados/herramientas.ts:62` — «dondeSeUsa: 'Evaluación', url: null, // TODO: URL — chat de evaluación en Sonnet (pedir a Franco)»; `src/lib/leados/manual.ts:307` — «ficha: { titulo: 'Ficha', pantallas: ['m1'] }, // ninguna etapa se llama 'Evaluación' (:307-315)»; `src/lib/leados/guidance-content.ts:474` — «SETTER. Hasta acá el veredicto salía de un chat de evaluación externo y el setter transcribía la respuesta; el chat quedó afuera»; `src/lib/leados/herramientas.ts:53` — «evaluador: { id: 'evaluador', nombre: 'Chat de evaluación (Sonnet)',»; `src/lib/leados/manual.ts:160` — «// no tiene link cargado, así que los tres campos —obligatorios, porque // sostienen el gate— no se podían llenar sin inventarlos. Ahora el juicio es // del setter»
- Impacto: Bloqueante de autonomía para el primer setter real: Gem de diseño (herramientas.ts:78), Claude Design (:90) y Gem de outreach (:117) también tienen url null con TODO. El rail, que es el panel persistente, las muestra como «pendiente» sin decir qué hacer (la salida SalidaLinkPendiente de tool-guide.tsx:61-67 existe pero el rail no la usa) y anuncia una herramienta del paso Evaluación que tras la fusión no tiene pantalla: ningún ToolGuide ni HerramientaLauncher con id evaluador en src (solo el test tests/setter/16-municiones-salida.spec.ts:132).
- Propuesta: Franco carga las URLs (mejor en configuración editable que en código) y decide sacar 'evaluador' de HERRAMIENTAS_ORDEN, ajustando tests/setter/16-municiones-salida.spec.ts:132. Mientras falten, el rail debería mostrar la misma salida que ToolGuide.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-033 en 02-PENDIENTE.md

### PERF-015 · El home del setter carga toda la cartera con el dossier completo en cada render
- Contexto: D4 · h5.set-dia, lib.leados, modelo.OsLead, modelo.OsLeadDossier. MEDIA, PROBABLE.
- Evidencia: `src/lib/leados/ownership.ts:53` — «return prisma.osLead.findMany({ where: ownedListWhere(userId), include: {»; `src/lib/leados/ownership.ts:56` — «dossier: true,»; `src/lib/leados/prospecto-import.ts:24` — «export const MAX_FILAS_IMPORT = 500»; `src/app/(protected)/setter/page.tsx:30` — «const leads = await listOwnedLeads(userId)»
- Impacto: La cartera crece de a 500 leads por tanda de import, sin tope total, y cada visita al home trae todos los OsLeadDossier con sus blobs JSON (ficha, brief, evaluación, agenda, progreso, rechazos), aunque las tarjetas usan pocos campos. Con algunos miles de leads, el TTFB del home y la memoria de la función suben en forma lineal.
- Propuesta: Antes de tocar, medir. Después: un select acotado del dossier a los campos que leen buildHomeLeads, mis-numeros, progreso y novedades, y evaluar paginar o cargar aparte el grupo Archivo.
- Cómo verificar: VH-157 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: PERF-015 en 03-MEJORAS.md

### SEC-024 · /api/qa/login confía en el header Host y los scripts QA escuchan en toda la red: cualquiera en la misma LAN obtiene una sesión SUPER_ADMIN
- Contexto: D1 · h1.auth-login, h1.auth-login.qa-login, lib.auth. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/api/qa/login/route.ts:54` — «const host = request.headers.get('host') ?? ''»; `src/app/api/qa/login/route.ts:61` — «if (!isLocalhost) { return { allowed: false, reason: 'host_not_localhost' }»; `package.json:8` — «"dev:qa": "cross-env QA_ALLOW_LOCALHOST=1 next dev --webpack -p 3002",»; `package.json:11` — «"start:qa": "npm run build && cross-env QA_ALLOW_LOCALHOST=1 next start -p 3001",»; librería next@16.2.9, dist/cli/next-start.js línea 72 — «const hostname = options.hostname;»; librería next@16.2.9, dist/server/lib/start-server.js línea 267 — «server.listen(port, hostname);»; `src/app/api/qa/login/route.ts:20`; `src/app/api/qa/login/route.ts:49`; `src/app/api/qa/login/route.ts:65`; `src/app/api/qa/login/route.ts:84`; `src/app/api/qa/login/route.ts:151`
- Impacto: La 'triple guarda' (route.ts:14-23) queda reducida a la variable QA_ALLOW_LOCALHOST, que los cuatro scripts QA encienden: el Host lo escribe el cliente y la guarda de hosting no aplica en una PC. dev:qa, start:qa, start:setter y start:galeria no pasan -H, así que Next llama server.listen(port, undefined), escucha en todas las interfaces e imprime la URL 'Network'. Un tercero en la misma red (cowork, bar, oficina) hace POST http://<IP>:3002/api/qa/login con 'Host: localhost' y {persona:'super-admin'}. Recibe un JWT de SUPER_ADMIN firmado con el AUTH_SECRET local y válido 8 h, que usa contra ese servidor: panel admin completo y escritura sobre la base del .env local, que según el PROMPT §3 es la Neon compartida. Además, ese servidor expuesto corre en Windows con next 16.2.9, que tiene un advisory crítico de RCE para servidores Windows (la versión la evalúa D8).
- Propuesta: Coordinar con Franco (ZONA-FRANCO):
1. Agregar -H 127.0.0.1 a dev:qa, start:qa, start:setter y start:galeria, y evaluar lo mismo para dev.
2. En la route, no usar Host como guarda: exigir además un secreto por corrida (header con un QA_LOGIN_TOKEN aleatorio que solo conoce el runner de visual-qa).
3. Responder 404 genérico sin reason (SEC-021).
- Cómo verificar: VH-014 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-024 en 03-MEJORAS.md

### SEC-100 · El panel SUPER_ADMIN embebe la URL del borrador del setter en un iframe sin sandbox
- Contexto: D4 · h5.adm-revision-demos.cola-y-veredicto, h5.set-lead.brief-construccion-revision, lib.security. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leados/[leadId]/page.tsx:237` — «<iframe src={dossier.draftUrl} title={'Demo de ${dossier.lead.businessName}'} ...»; `src/app/(protected)/setter/_actions/dossier.schemas.ts:118` — «.refine((url) => url.startsWith('https://'), 'La URL tiene que empezar con https://')»; `next.config.ts:72` — «key: 'Content-Security-Policy-Report-Only',»
- Impacto: Un usuario SETTER (rol de menor privilegio) controla una página que se carga, sin atributo sandbox y con la CSP solo en modo report, dentro de la vista de revisión del SUPER_ADMIN: puede mostrar un falso 'sesión vencida, volvé a entrar', abrir popups o disparar descargas desde el contexto de confianza del admin.
- Propuesta: Agregar sandbox (allow-scripts, allow-same-origin solo si hace falta para la demo) y referrerpolicy al iframe, o restringir draftUrl a dominios esperados (*.netlify.app).
- Cómo verificar: VH-143 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-100 en 03-MEJORAS.md

### SEC-101 · Acciones de LeadOS devuelven mensajes internos de error (Prisma/Zod) al setter y al admin
- Contexto: D4 · h5.set-dia.novedades, h5.set-nuevo.alta-prospecto, h5.set-importar.importar-csv, h4.adm-leads, lib.actions, h5.set-nuevo.alta-manual. MEDIA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/_actions/novedades.actions.ts:25` — «error instanceof Error ? error.message : 'No se pudieron marcar las novedades',»; `src/app/(protected)/setter/_actions/prospecto.actions.ts:41` — «return fail(toErrorMessage(error, 'No se pudo cargar el prospecto'))»; `src/lib/action-utils.ts:31` — «if (error instanceof Error) { return error.message»; `src/app/(protected)/admin/leads/_actions/lead.actions.ts:68` — «return fail(error instanceof Error ? error.message : 'Failed to create lead')»; `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:90` — «setServerError(result.error) toast.error(result.error)»
- Impacto: Un error de base en el alta/importación (prospecto-bulk.actions.ts:120 igual) o al marcar novedades le muestra al setter el texto crudo de Prisma (tablas, constraints) o 'Unauthorized'; en las 16 acciones admin de admin/leads/_actions pasa lo mismo. Viola la regla del repo y confunde a un usuario no técnico.
- Propuesta: Usar el mapError con fallback que ya usan dossier/outreach/cartera (que solo traduce errores conocidos) en novedades, prospecto y prospecto-bulk, y en las acciones admin; toErrorMessage es FROZEN (action-utils): decisión para Valentino si se acota a ZodError.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-101 en 03-MEJORAS.md

### UX-055 · La importación CSV solo entiende coma y UTF-8: una lista exportada de Excel en español no entra o llega con acentos rotos
- Contexto: D4 · h5.set-importar, h5.set-importar.importar-csv, lib.leados. MEDIA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/nuevo/importar/importar-prospectos-form.tsx:76` — «reader.readAsText(file)»; `src/lib/leados/prospecto-import.ts:131` — «if (ch === ',') {»
- Impacto: Excel con configuración regional es-AR guarda «CSV (delimitado por comas)» con punto y coma y en Windows-1252. El parser solo corta por coma y el FileReader lee como UTF-8: la lista «que te pasó Franco» se rechaza por encabezados o entra con nombres de negocio con caracteres rotos (Caf�), que después viajan a los DMs y a la demo.
- Propuesta: Detectar el separador (coma o punto y coma) por el encabezado y la codificación (o pedir 'CSV UTF-8' en la plantilla y en el texto de ayuda); mostrar en la vista previa el primer nombre leído para que el setter detecte acentos rotos.
- Cómo verificar: VH-156 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: UX-055 en 03-MEJORAS.md

### A11Y-026 · Los modales de aprobar/rechazar no son diálogos accesibles y sus errores no se anuncian
- Contexto: D4 · h5.adm-revision-demos.cola-y-veredicto. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leados/[leadId]/_components/decision-bar.tsx:65` — «<div className="fixed inset-0 z-[130] flex items-center justify-center ...">»; `src/app/(protected)/admin/leados/[leadId]/_components/decision-bar.tsx:236` — «<div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 ...">{serverError}»
- Impacto: El overlay no tiene role=dialog, aria-modal, cierre con Escape ni foco inicial/atrapado; los errores de campo (:231, :277) y del servidor no tienen role=alert ni aria-describedby. Con lector de pantalla o teclado la decisión de revisión es difícil.
- Propuesta: Usar un componente de diálogo con foco atrapado (o agregar role/aria-modal/Escape) y role=alert en los bloques de error.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-026 en 03-MEJORAS.md

### A11Y-027 · Atajos globales de una sola letra (t, p, s, ?) sin forma de apagarlos (WCAG 2.1.4)
- Contexto: D4 · h5.set-dia.foco-ahora. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/_components/use-keyboard-shortcuts.ts:53` — «window.addEventListener('keydown', onKeyDown)»; `src/app/(protected)/setter/_components/foco-surface.tsx:151` — «t: () => trabajarRef.current?.click(), s: () => saltarRef.current?.click(), p: toggleSnooze,»
- Impacto: Con el foco fuera de un campo (por ejemplo en un botón), una tecla suelta navega al lead (t) o re-ancla el foco al próximo (s). Quien usa dictado por voz o un teclado alternativo dispara acciones sin querer, y no hay ajuste para desactivar ni remapear los atajos, que es el requisito de nivel A.
- Propuesta: Preferencia para apagar los atajos, o activarlos solo con el foco dentro de la tarjeta del foco; mantener «?» como ayuda.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-027 en 03-MEJORAS.md

### A11Y-028 · El drawer mobile del setter cerrado sigue en el orden de tabulación y no se cierra con Escape
- Contexto: D4 · h5.set-dia.rail-navegacion. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_components/setter-shell.tsx:53` — «className={'fixed left-0 top-0 h-screen w-[240px] transition-transform lg:translate-x-0 ${ mobileOpen ? 'translate-x-0' : '-translate-x-full'»; `src/app/(protected)/setter/_components/setter-shell.tsx:36` — «aria-label="Abrir menú"»
- Impacto: Por debajo de 1024 px el rail cerrado queda fuera de pantalla pero focusable: Tab recorre «Cargar prospecto», «Tu día» y los links de herramientas invisibles. Abierto, no se cierra con Escape ni recibe el foco, y el disparador no expone aria-expanded. El mismo patrón está en AdminLayoutClient.tsx:63 y DashboardLayoutClient.tsx:81.
- Propuesta: inert (o aria-hidden más sacar del tab order) en el aside cerrado bajo lg; Escape y foco al abrir; aria-expanded y aria-controls en el botón de menú.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-028 en 03-MEJORAS.md

### A11Y-029 · Las palancas de la card tienen un nombre accesible que no contiene su rótulo visible (WCAG 2.5.3)
- Contexto: D4 · h5.set-dia.palancas-de-card. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_components/lead-card-actions.tsx:152` — «label={estaPausado ? 'Cambiar la pausa' : 'Pausar en tu cartera'} texto="Pausar"»; `src/app/(protected)/setter/_components/lead-card-actions.tsx:283` — «aria-label={label} title={label}»
- Impacto: Quien maneja el navegador por voz dice «Pausar» o «Fijado» y no activa el botón cuando el nombre accesible es «Cambiar la pausa» o «Quitar de fijados» (:144-145). El comentario de :272-275 lo declara intencional.
- Propuesta: Que el aria-label empiece con el texto visible («Pausar: cambiar la pausa») o pasar el estado a aria-pressed/aria-describedby.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-029 en 03-MEJORAS.md

### A11Y-030 · Los obligatorios del chequeo final solo se tildan desde el interruptor; la fila no responde al toque
- Contexto: D4 · h5.set-manual.chequeo-final. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_components/chequeo-form.tsx:109` — «<Toggle checked={ok} onChange={onChange} label={check.nombre} />»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/chequeo-form.tsx:254` — «<label key={soft.id} className="flex cursor-pointer items-center justify-between gap-3 py-1"»
- Impacto: En el celular, los diez puntos obligatorios (que sostienen el gate) solo se tildan acertándole a un control chico al costado. Los delatores, que no son obligatorios, sí aceptan el toque en toda la fila.
- Propuesta: Que toda la fila sea área de toque (label o botón), como en los delatores.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-030 en 03-MEJORAS.md

### A11Y-031 · El score de la evaluación usa role=radio sin navegación con flechas
- Contexto: D4 · h5.set-manual.ficha-y-veredicto. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx:192` — «<div role="radiogroup" aria-label="Score de la evaluación" className="flex gap-2">»; `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx:197` — «role="radio" aria-checked={score === valor}»
- Impacto: El lector de pantalla anuncia un grupo de radios, pero las flechas no mueven la selección y cada botón es una parada de Tab. El patrón ARIA queda a medias.
- Propuesta: Agregar tabindex itinerante con flechas, o usar inputs radio nativos con estilo.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-031 en 03-MEJORAS.md

### A11Y-032 · El error del servidor en el alta de prospectos no se anuncia a lectores de pantalla
- Contexto: D4 · h5.set-nuevo.alta-manual. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:191` — «{serverError && <p className="text-xs text-red-400">{serverError}</p>}»
- Impacto: El mensaje aparece al pie del formulario sin role=alert ni aria-live: quien usa lector de pantalla no se entera de que el alta falló (patrón D1-c1). seguimiento-form.tsx:196 sí lo hace bien.
- Propuesta: role="alert" en el párrafo (mismo patrón que seguimiento-form.tsx:196).
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: A11Y-032 en 03-MEJORAS.md

### BUG-005 · Org primaria no deterministica: orgMemberships take:1 sin orderBy en cada auth()
- Contexto: D1 · lib.auth, modelo.OrgMember. BAJA, PROBABLE.
- Evidencia: `src/auth.ts:37` — «take: 1,»; `src/app/login/actions.ts:94` — «take: 1,»; `prisma/schema.prisma:530` — «@@unique([userId, organizationId])»
- Impacto: Latente: el schema permite varias membresias por usuario; si un usuario pertenece a dos orgs, cada auth() (que refresca de la DB) puede resolver una org distinta y el usuario ve/escribe en la que Postgres devuelva primero.
- Propuesta: Decision para Valentino (auth.ts FROZEN): orderBy explicito (joinedAt) o selector de org activa; mismo cambio en login/actions.ts:88-95 y qa/login/route.ts:118-127.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-005 en 03-MEJORAS.md

### BUG-150 · updateLeadStatus del kanban mueve el status por fuera de la puerta comercial
- Contexto: D4 · h4.adm-leads.crud-y-estado, int.cron.os-follow-up, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leads/_actions/lead.actions.ts:102` — «const lead = await prisma.osLead.update({ where: { id: parsed.leadId }, data: { status: parsed.status,»; `src/app/(protected)/setter/_actions/agenda.actions.ts:238` — «// La puerta comercial EXISTENTE: mueve a CALL_AGENDADA y frena follow-ups.»; `src/app/api/cron/os-follow-up/route.ts:184` — «notIn: [LeadStatus.CERRADO, LeadStatus.PERDIDO],»
- Impacto: Un drag a CALL_AGENDADA/RESPONDIO no limpia nextFollowUpAt ni deja actividad, y no crea agenda: el lead aparece agendado sin reunión, el gate del setter (agenda.actions.ts:96-98) lo trata como agendado y el cron (si corriera) seguiría avisando toques vencidos.
- Propuesta: Hacer pasar los cambios manuales por os-commercial (o limpiar nextFollowUpAt y registrar una actividad SISTEMA) y restringir los estados que el kanban puede setear a mano.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-150 en 03-MEJORAS.md

### BUG-151 · El rango personalizado de inbound se calcula en UTC, no en hora argentina
- Contexto: D4 · h4.adm-leads.inbound-a-oslead, modelo.ContactSubmission. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/admin/leads/_actions/inbound.actions.ts:29` — «const from = range.from ? startOfDay(new Date(range.from)) : subMonths(now, 1)»
- Impacto: new Date('YYYY-MM-DD') es medianoche UTC: el filtro 'desde/hasta' incluye la noche anterior y corta las últimas 3 horas del último día en AR. Contactos inbound del cierre del día quedan fuera del rango elegido.
- Propuesta: Usar parseCalendarDayAR (dates-ar) como ya hacen outreach.schemas.ts:59-62 y cartera.schemas.ts:49-53.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-151 en 03-MEJORAS.md

### BUG-154 · «Copiar bloque» confirma «Copiado» aunque el copiado falle
- Contexto: D4 · h5.set-manual.ayudas-de-paso. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_components/copy-block.tsx:47` — «document.execCommand('copy') document.body.removeChild(area) }»; `src/app/(protected)/setter/_components/copy-block.tsx:50` — «setCopiado(true)»
- Impacto: Si la Clipboard API no está (http por IP, como dev:qa) y execCommand devuelve false, el botón igual dice «Copiado» y el setter pega en el Gem lo que tenía antes en el portapapeles, que puede ser el bloque de otro negocio. execCommand además está deprecado.
- Propuesta: Mirar el booleano de execCommand y, si falla, mostrar un error con el texto seleccionable para copiar a mano.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-154 en 03-MEJORAS.md

### BUG-158 · La búsqueda de horarios no exige confirmar al decisor («Buscar de nuevo» ni la action)
- Contexto: D4 · h5.set-manual.agenda, int.calcom. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_components/agenda-form.tsx:213` — «disabled={!decisorOk}»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/agenda-form.tsx:237` — «<Button variant="secondary" size="sm" (sin disabled)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/agenda-form.tsx:113` — «busqueda.run(() => ofrecerHorarios(leadId), {»; `src/app/(protected)/setter/_actions/agenda.schemas.ts:10` — «/** El setter confirma que habla con el dueño/decisor ANTES de ofrecer. */»
- Impacto: Cuando el lead ya tiene horarios ofrecidos, el setter puede volver a buscar y a guardar la oferta sin confirmar que habla con quien decide. El server no puede validarlo porque la action no recibe ese dato. Como la confirmación final sí lo exige, el daño es de proceso.
- Propuesta: Deshabilitar «Buscar de nuevo» con el mismo !decisorOk y mostrar el motivo. Si el gate importa, pasarlo a ofrecerHorarios y validarlo en el server.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-158 en 03-MEJORAS.md

### BUG-159 · El historial del lead y la fecha de asignación se formatean sin huso horario
- Contexto: D4 · h5.set-manual.historial-del-lead, h5.set-manual.recorrido-y-barra. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/_components/lead-timeline.helpers.ts:72` — «return new Intl.DateTimeFormat('es-AR', { day: '2-digit', (sin timeZone)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/manual-nav.tsx:81` — «? new Intl.DateTimeFormat('es-AR', {»; `src/lib/leados/flow.ts:260` — «return new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires',»
- Impacto: LeadTimeline y ManualHeader son Server Components. Si el server corre en UTC (Netlify), cada contacto del historial aparece con 3 h de corrimiento y una asignación hecha de noche figura al día siguiente. El resto del manual usa el huso de Buenos Aires.
- Propuesta: Pasar timeZone 'America/Argentina/Buenos_Aires' en los dos formateadores, o usar el helper congelado tz-ar/dates-ar.
- Cómo verificar: VH-150 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-159 en 03-MEJORAS.md

### BUG-165 · La maquinaria comercial de LeadOS escribe en pasos sueltos sin transacción (registro de toques, ficha y evaluación, cierre post-reunión con el blob de agenda reescrito entero)
- Contexto: D4 · lib.leados, modelo.OsLead, modelo.OsLeadActivity, h5.set-manual.registrar-resultado-toque, h5.set-lead.ficha-y-evaluacion, h4.adm-leads.cierre-reunion, h4.adm-leads.asignacion-setter, h4.adm-leads.actividad-y-demos, h4.adm-leads.cierre-post-reunion, modelo.OsLeadDossier. BAJA, PROBABLE.
- Evidencia: `src/lib/os-commercial.ts:57` — «const activity = await prisma.osLeadActivity.create({»; `src/lib/os-commercial.ts:79` — «await prisma.osLead.update({ where: { id: input.leadId }, data: { nextFollowUpAt, reactivateAt: null },»; `src/lib/os-commercial.ts:150` — «const nextFollowUpAt = calculateNextFollowUp(0) ?? calculateNextFollowUp(1)»; `src/app/(protected)/setter/_actions/dossier.actions.ts:152` — «await transitionDossier(leadId.data, { to: 'DESCARTADA', motivoDescarte, })»; `src/app/(protected)/admin/leads/_actions/reunion.actions.ts:81` — «await prisma.osLead.update({ where: { id: parsed.leadId }, data: { status, reactivateAt: null } })»; `src/app/(protected)/admin/leads/_actions/lead.actions.ts:180` — «await registrarReasignacion({»; `src/lib/leados/agenda.ts:352` — «const parsed = AgendaSchema.parse({ ...agenda, realizadaAt: new Date().toISOString() }) const updated = await prisma.osLeadDossier.updateMany({ where: { leadId, agendaJson: { path: ['estado'], equals: 'AGENDADA' } },»; `src/lib/leados/agenda.ts:371` — «if (!agenda || agenda.resultado) return false»
- Impacto: Actividad, conteo y update del lead (más postergarLead en outreach.actions.ts:197) son escrituras separadas. Si falla una del medio (Neon serverless), queda un toque registrado sin la cadencia actualizada o un POSTERGADO sin status, y el reintento del setter duplica la actividad y adelanta la cadencia. crearDemoComercial tiene el mismo patrón, y su primera llamada calculateNextFollowUp(0) siempre da null (código muerto).
- Propuesta: Envolver registrarContactoComercial, la postergación y crearDemoComercial en prisma.$transaction; reemplazar la expresión de :150 por la constante que expresa la intención (+2 días).
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-165 en 03-MEJORAS.md

### BUG-166 · respondioDesde cae a lead.updatedAt, el mismo dato que su comentario descarta por falso
- Contexto: D4 · h5.set-manual.cabecera-e-historial, lib.leados. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:208` — «// NO 'lead.updatedAt' (cualquier mutación del dossier lo pisa y falsea la // espera).»; `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:286` — «? (ultimaRespuesta?.createdAt ?? lead.updatedAt).toISOString()»
- Impacto: Si el status RESPONDIO llegó sin una actividad RESPONDIO (Franco lo mueve desde el kanban admin), el UrgenciaBanner de Construcción mide el turnaround desde la última edición del lead y no desde la respuesta: muestra urgencia falsa o la esconde.
- Propuesta: Sin actividad de respuesta, no mostrar el banner (null) o usar una marca explícita de 'respondió el' escrita por el cambio de status.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-166 en 03-MEJORAS.md

### BUG-167 · El bloqueo de links del opener rechaza mensajes sin link ('...me encantó', 'cuenta.Me')
- Contexto: D4 · h5.set-lead.opener-sin-link, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/lib/leados/flow.ts:218` — «const LINK_PATTERN = /(https?:\/\/|www\.|wa\.me\/|bit\.ly\/|linktr\.ee\/|\S+\.(com|com\.ar|ar|net|org|io|app|dev|shop|online|site|me)\b)/i»; `src/app/(protected)/setter/_actions/outreach.schemas.ts:41` — «(texto) => !contieneLink(texto),»
- Impacto: El patrón '\S+\.me\b' (sin distinguir mayúsculas) matchea puntos suspensivos o un punto sin espacio seguidos de 'me', algo muy común en DMs: 'Hola!...me encantó tu local' o 'Vi tu cuenta.Me gustó'. Se probó con grep -P sobre esas frases. El server rechaza el opener con 'El link NO va en el opener' y el setter no encuentra ningún link. La salida es agregar un espacio.
- Propuesta: Exigir forma de dominio: sin puntos consecutivos antes del TLD y TLD seguido de fin, espacio o barra. Sumar los casos negativos ('...me', 'palabra.Me') al invariante o spec del opener.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-167 en 03-MEJORAS.md

### BUG-169 · El parser CSV abre comillas en medio de un campo y se traga el resto del archivo
- Contexto: D4 · h5.set-importar.csv, lib.leados. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/lib/leados/prospecto-import.ts:126` — «if (ch === '"') { inQuotes = true i++»; `src/lib/leados/prospecto-import.ts:110` — «if (inQuotes) {»; `src/app/(protected)/setter/_actions/prospecto.schemas.ts:45` — «.max(200, 'Demasiado largo para un nombre de negocio'),»
- Impacto: Cualquier comilla dentro de un campo sin comillas (p. ej. «Pizzería 5"» o una nota con una comilla suelta) activa el modo comillas. Las comas y los saltos de línea siguientes quedan en un solo campo hasta la próxima comilla. Sin otra comilla, el resto del archivo se vuelve una sola fila, que el schema rechaza por largo: el reporte muestra 1 inválida y las demás filas desaparecen sin aviso.
- Propuesta: Entrar al modo comillas solo al inicio de un campo (RFC 4180) y devolver un error de estructura si el archivo termina con comillas abiertas. Sumar el caso al invariante prospecto-import.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-169 en 03-MEJORAS.md

### BUG-170 · Los avisos del setter no se purgan: los de leads borrados quedan plegados para siempre
- Contexto: D4 · h5.set-dia.novedades-dirigidas, modelo.OsSetterNotice, lib.leados. BAJA, PROBABLE.
- Evidencia: `prisma/schema.prisma:950` — «lead OsLead? @relation(fields: [leadId], references: [id], onDelete: SetNull)»; `src/lib/leados/novedades.ts:328` — «const result = await prisma.osSetterNotice.updateMany({ where: { ...ownSetterNoticeWhere(userId), read: false }, data: { read: true },»; `src/lib/leados/novedades-agrupar.ts:75` — «/** P23 — ver 'AvisoView.vigente'. Una fila plegada es siempre vigente: los * avisos que se pliegan no dan órdenes ('leadId: null'). */»; `src/lib/leados/novedades-vigencia.ts:93` — «if (!estado) return { vigente: false, enSuLugar: YA_NO_ES_TUYO }»
- Impacto: Al borrar un lead, sus avisos quedan con leadId null. Se pliegan por tipo («Te asignaron un lead» ×N) con «Este negocio ya no está en tu cartera» y suman al badge hasta que el setter marca todo como visto. La tabla no tiene purga: osSetterNotice.delete* solo aparece en scripts de QA (la bitácora midió 77 huérfanos sobre 80). El comentario de que una fila plegada siempre está vigente no vale para estos avisos.
- Propuesta: Borrar o marcar como leídos los avisos del lead al borrarlo (cascade en lugar de SetNull para los kinds con orden), o una purga periódica de los leídos y los huérfanos. Corregir el comentario.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: BUG-170 en 03-MEJORAS.md

### DEU-002 · auth.ts: codigo muerto y estado sin usar (getPostLoginPath, userExists): un usuario borrado conserva sesion ORG_MEMBER
- Contexto: D1 · lib.auth, h1.auth-login.sesion-jwt. BAJA, PROBABLE.
- Evidencia: `src/auth.ts:65` — «function getPostLoginPath(state: {»; `src/auth.ts:61` — «userExists: Boolean(dbUser),»; `src/auth.ts:44` — «const role = dbUser?.role ?? ('ORG_MEMBER' as Role)»
- Impacto: getPostLoginPath (y ADMIN_PATH/DASHBOARD_PATH/ONBOARDING_PATH :15-17) no tienen callers (PLAN-018). userExists se calcula y nunca se lee: un usuario borrado conserva una sesion con rol ORG_MEMBER por defecto y sin org (sessionVersion undefined no invalida, :219) hasta que expire; hoy sin datos expuestos, pero cualquier handler que solo pida 'sesion' lo deja pasar y el portal entra en el bucle de redirecciones.
- Propuesta: Decision para Valentino (FROZEN + ZONA-FRANCO): devolver null en jwt cuando !userExists y borrar getPostLoginPath con sus constantes.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-002 en 03-MEJORAS.md

### DEU-060 · Fecha de reactivación de POSTERGADO calculada en el cliente y duplicada; la trampa de z.coerce.date sigue armada
- Contexto: D3 · h4.adm-leads.ficha-y-estado, h4.adm-leads.pipeline-kanban, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leads/_components/change-status-select.tsx:40` — «reactivateAt: next === 'POSTERGADO' ? new Date(Date.now() + POSTPONE_DAYS * 24 * 60 * 60 * 1000)»; `src/app/(protected)/admin/leads/_components/lead-pipeline.tsx:125` — «reactivateAt: status === 'POSTERGADO' ? new Date(Date.now() + POSTPONE_DAYS * 24 * 60 * 60 * 1000)»; `src/app/(protected)/admin/leads/_actions/lead.schemas.ts:40` — «z.coerce.date().optional()»
- Impacto: La regla de negocio (7 días) vive en dos componentes (POSTPONE_DAYS en change-status-select.tsx:14 y lead-pipeline.tsx:32) y depende del reloj del navegador. Si se conecta un date-picker, 'YYYY-MM-DD' se interpreta como medianoche UTC (21:00 del día anterior en Argentina).
- Propuesta: Que updateLeadStatus derive el default de reactivateAt en servidor con el helper de fechas AR y que el schema normalice fechas de calendario. Requiere coordinar con Franco (lead.actions/lead.schemas).
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-060 en 03-MEJORAS.md

### DEU-075 · listLeads y getLeadById son server actions públicas sin importadores
- Contexto: D4 · h4.adm-leads. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/admin/leads/_actions/lead.actions.ts:249` — «export async function listLeads(): Promise<»; `src/app/(protected)/admin/leads/_actions/lead.actions.ts:275` — «export async function getLeadById(»
- Impacto: Código muerto expuesto como endpoint de server action (guardado por requireSuperAdmin) que devuelve error.message crudo; confunde a quien busque la fuente de verdad del listado.
- Propuesta: Borrarlas.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-075 en 03-MEJORAS.md

### DEU-076 · La bitácora declara pendiente el ascenso a main que ya ocurrió (EL TRONCO está en origin/main)
- Contexto: D4 · h5. BAJA, PROBABLE.
- Evidencia: `docs/bitacora-beta-3.md:10975` — «- **No se pusheó a 'main'.** Ni una vez. El push es de Franco.»
- Impacto: El doc de cierre y PLAN-1042 dejan el push a main como pendiente, pero origin/main = 57c421bc «docs(tronco): EL TRONCO» (autor y committer Franco, 2026-09-06 03:13 -0300). Es un fast-forward de 50 commits sobre 17727117 y el reflog local lo recibió por fetch el 2026-09-06 20:14 -0300. Git no registra quién hizo el push. Quien lea la bitácora cree que main sigue atrás.
- Propuesta: Anotar en 09-PARA-FRANCO quién y cuándo pusheó main y si corrió ci.yml (on: [push, pull_request]); actualizar «Lo que queda para el humano».
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-076 en 03-MEJORAS.md

### DEU-078 · Restos del wizard en los registros compartidos: rama editable muerta, etiquetas duplicadas, comentarios viejos
- Contexto: D4 · h5.set-manual.ficha-y-veredicto, h5.set-manual.construccion. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_components/m1-ficha.tsx:212` — «<FichaStep leadId={leadId} lead={lead} ficha={ficha} editable={false} />»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx:53` — «return ( <Card padding="lg" className="space-y-5"> (rama editable sin consumidores)»; `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx:42` — «export const VEREDICTO_LABELS: Record<Evaluacion['veredicto'], string> = {»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m1-ficha.tsx:137` — «veredictoLabels: { DESCARTAR: 'Descartar',»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m-construccion.tsx:180` — «* NOTA de redacción, y no es cosmética: 'expectToast' de la suite busca el texto»
- Impacto: FichaStep con editable=true (incluido su bloque copiable para el Evaluador, que ya no tiene pantalla) no se ejecuta en ningún lado. Las etiquetas del veredicto están duplicadas, y el comentario de m-construccion describe un expectToast que ya se acotó a [data-sonner-toast] (tests/helpers/setter-ui.ts:103). Todo esto encarece cada cambio en la zona.
- Propuesta: Reducir FichaStep a la vista congelada, unificar las etiquetas del veredicto y actualizar o borrar el comentario de expectToast junto con la redacción en subjuntivo (PLAN-927).
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-078 en 03-MEJORAS.md

### DEU-079 · Date.now() en el render de m5 (error de lint react-hooks/purity)
- Contexto: D4 · h5.set-manual.seguimiento. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_components/m5-seguimiento.tsx:63` — «new Date(proximoToque as string).getTime() <= Date.now() &&»
- Impacto: Es uno de los 102 errores del baseline de eslint (react-hooks/purity, línea 63). Si el CI pasa a exigir lint, falla. En un Server Component el valor es correcto en cada request.
- Propuesta: Resolver toqueVencido en _data.ts, como ya se hace con postergadoVencido.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-079 en 03-MEJORAS.md

### DEU-081 · LeadOS reimplementa el día argentino (cron os-follow-up y contador de DMs de outreach) en vez de usar dayRangeAR, y el cron copia la verificación del secreto y el predicado del postergado vencido
- Contexto: D4 · int.cron.os-follow-up, lib.leados, h5.set-lead.contador-dms-hoy. BAJA, PROBABLE.
- Evidencia: `src/app/api/cron/os-follow-up/route.ts:56` — «startOfDay: new Date('${year}-${month}-${day}T00:00:00.000-03:00'),»; `src/app/api/cron/os-follow-up/route.ts:142` — «function getProvidedCronSecret(request: Request): string | null {»; `src/app/api/cron/os-follow-up/route.ts:112` — «function isReactivationLead(lead: PendingLead, endOfDay: Date): boolean {»; `src/lib/leados/outreach.ts:21` — «function limitesDelDiaArgentino(ahora: Date): { desde: Date; hasta: Date } {»; `src/lib/leados/outreach.ts:30` — «desde: new Date('${fecha}T00:00:00.000-03:00'), hasta: new Date('${fecha}T23:59:59.999-03:00'),»; `src/lib/dates-ar.ts:75` — «export function dayRangeAR(now: Date = new Date()): UTCRange {»
- Impacto: Hay helpers canónicos (dates-ar.ts:65/:70 startOfDayAR/endOfDayAR, cron-secret.ts:40 isAuthorizedCronRequest) y el predicado de postergado vencido también vive en _data.ts:167-170 y en home.ts. El cron usa endOfDay y el panel usa ahora. Cualquier cambio de criterio (o de huso) obliga a tocar cuatro copias que divergen en silencio.
- Propuesta: Usar dates-ar.ts e isAuthorizedCronRequest en el cron y extraer un predicado único postergadoVencido(lead, ahora) en src/lib/leados.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-081 en 03-MEJORAS.md

### DEU-082 · La navegación del portal del setter no está clasificada en CLAUDE.md: conviven triggerTransition («decisión cerrada»), router.push con y sin justificación y <Link>
- Contexto: D4 · h5.set-nuevo, h5.set-dia, lib.ui, h5.set-dia.foco-ahora, h5.set-dia.cola-de-hoy, h5.set-dia.novedades, h5.set-dia.rail-navegacion, h5, h5.set-manual, h5.set-manual.recorrido-y-barra. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/(protected)/setter/_components/setter-nav.tsx:45` — «// Navegación SOLO por triggerTransition (decisión cerrada · CLAUDE.md). El»; `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:95` — «// Portal (no es el sitio público): navegación imperativa post-submit al // wizard del lead recién creado. No hay alternativa declarativa — el id sale router.push('/setter/leads/${result.data.id}')»; `src/app/(protected)/setter/nuevo/page.tsx:44` — «<Link href="/setter/nuevo/importar"»; `src/app/(protected)/setter/_components/setter-nav.tsx:49` — «triggerTransition(href)»; `src/components/layout/publicRoute.ts:16` — «export const PORTAL_PREFIXES = ['/admin', '/dashboard', '/embed', '/setter'] as const»; `src/app/(protected)/setter/_components/foco-surface.tsx:90` — «router.push('/setter/leads/${foco.id}')»; `src/app/(protected)/setter/_components/trabajar-lead-button.tsx:31` — «router.push('/setter/leads/${leadId}')»; `src/app/(protected)/setter/_components/novedades-abrir-foco.tsx:47` — «router.push('/setter/leads/${leadId}')»; `src/app/(protected)/setter/_components/setter-nav.tsx:97` — «onClick={() => handleNavigate(item.href)}»; `src/context/TransitionContext.tsx:116` — «setTimeout(() => { startTransition(() => { router.push(target);»; `src/app/layout.tsx:114` — «<Shutter />»; `src/app/(protected)/setter/_components/setter-nav.tsx:43` — «const { triggerTransition } = useTransitionContext()»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/salida-manual.tsx:46` — «router.push('/setter')»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/salida-manual.tsx:32` — «imperativa ('router.push') corre SÓLO cuando el setter confirma que quiere»; `raíz:CLAUDE.md:15` — «- **Portales** (admin '/admin/*' y cliente '/dashboard/*'): usar '<Link>'»
- Impacto: CLAUDE.md dice que triggerTransition no aplica en portales y no clasifica /setter. La barra del setter usa el shutter del sitio público mientras los formularios usan router.push con justificación y las páginas usan <Link>. El comentario de :95-97 nombra un wizard que ya no existe, y la action podría hacer redirect() (la alternativa que CLAUDE.md prefiere). Quien agregue la próxima pantalla no sabe qué regla seguir.
- Propuesta: Decisión para Valentino y Franco: declarar /setter como portal en CLAUDE.md (<Link> + redirect() en actions) y retirar triggerTransition de setter-nav, o documentar la excepción. En el alta, mover la navegación a redirect() dentro de cargarProspecto.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-082 en 03-MEJORAS.md

### DEU-083 · Las páginas del setter usan un guard que lanza Error('Unauthorized'): un rol o una sesión inválidos terminan en error.tsx y en Sentry
- Contexto: D4 · h5.set-manual, h5.set-nuevo, h5.set-importar, lib.auth. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:145` — «const userId = await requireSetter()»; `src/app/(protected)/setter/nuevo/page.tsx:18` — «const userId = await requireSetter()»; `src/lib/auth-guards.ts:16` — «if (session?.user?.role !== 'SETTER' || !session.user.id) { throw new Error('Unauthorized')»
- Impacto: Cuando el guard falla (por ejemplo en un render parcial con la sesión invalidada), el setter ve «No se pudo abrir el manual de este lead» (manual/error.tsx:40) en vez de volver a /login, y cada caso suma un evento a Sentry (:30). Mismo patrón D1-c3 en importar/page.tsx:16.
- Propuesta: Que las páginas hagan redirect('/login') cuando el guard no autoriza (envolverlo o un requireSetterPage que redirija); auth-guards.ts es FROZEN-inferido, así que el cambio va en los callers o como decisión para Valentino.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-083 en 03-MEJORAS.md

### DEU-084 · El comentario del schema dice que nadie lee OsLead.caliente, pero el manual y los gates lo leen
- Contexto: D4 · modelo.OsLead, lib.leados. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `prisma/schema.prisma:876` — «// admin-1a: "caliente" persistido que Franco marca a ojo (D4). Hoy NADIE lo // setea ni lo lee — el comportamiento sigue siendo el del score»; `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:217` — «caliente: lead.caliente,»
- Impacto: El comentario contradice el código (gateBriefAbierto y derivarPantalla leen el campo desde admin-1b) y confunde a quien toque el gate o una migración del modelo.
- Propuesta: Decisión para Valentino (schema.prisma es FROZEN): actualizar el comentario en la próxima migración coordinada con Franco.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-084 en 03-MEJORAS.md

### DEU-085 · Guía y exports sin consumidores, uno de ellos con una regla de gate que ya no existe
- Contexto: D4 · h5.set-manual.guia-y-herramientas, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/lib/leados/guidance-content.ts:526` — «'El score marca el camino: ', { enfasis: '1–2 descarta, 3 avanza, 4–5 sugiere avanzar con prioridad' }, ' (y deja construir la demo sin esperar respuesta). La mayoría son 3 —fríos— y eso está bien: es el caso normal.',»; `src/lib/leados/guidance-content.ts:643` — «export const GUIA_CONSTRUCCION = {»; `src/lib/leados/guidance-content.ts:887` — «const GUIA_TRASPASO = {»; `src/lib/leados/guidance-content.ts:958` — «aprobada: [»; `src/lib/leados/flow.ts:653` — «export function agruparParaHome(inputs: HomeLeadInput[]): Record<HomeGroupKey, HomeLead[]> {»; `src/lib/leados/contracts.ts:118` — «referenciasFicha: textoLibre,»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m5-seguimiento.tsx:214` — «<TeachPanel id="objeciones" collapsible={false} />»
- Impacto: TeachPanel solo se invoca con 'objeciones' y 'selfCheck'. GUIA_CONSTRUCCION, GUIA_TRASPASO, GUIA_REVISION.aprobada, GUIA_EVALUACION.porque/ejemplos, SelfCheckRazon y agruparParaHome no tienen lectores. El 'porque' de la evaluación enseña que un score 4–5 abre la construcción sin respuesta, lo que contradice gateBriefAbierto (flow.ts:81-83, que mira solo el campo caliente): si se conecta un TeachPanel 'evaluacion', enseña una regla falsa. referenciasFicha no tiene lector y se borra en cada re-guardado del brief (brief-form.tsx:38).
- Propuesta: Borrar el contenido y los exports muertos, o corregir el 'porque' de la evaluación si se piensa usar. Sacar referenciasFicha del contrato.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-085 en 03-MEJORAS.md

### DEU-086 · Blobs del dossier y el gate del self-check acoplados a texto visible o a enums: un renombre los invalida
- Contexto: D4 · h5.set-lead.chequeo-final-y-revision, h5.set-lead.brief-y-construccion, lib.leados, modelo.OsLeadDossier, h5.set-lead.brief-construccion-revision, h5.adm-revision-demos.cola-y-veredicto. BAJA, PROBABLE.
- Evidencia: `src/lib/leados/flow.ts:188` — «itemsDuros: HARD_CHECKS.map((check) => ({ nombre: check.nombre, ok: duros[check.id] === true,»; `src/lib/leados/flow.ts:207` — «selfCheck.itemsDuros.some((item) => item.nombre === check.nombre && item.ok),»; `src/lib/leados/contracts.ts:126` — «z.object({ nombre: z.string().trim().min(1), ok: z.boolean(),»; `src/lib/leados/flow.ts:133` — «export function parseProgreso(json: unknown): Progreso { const parsed = ProgresoSchema.safeParse(json) return parsed.success ? parsed.data : { completadas: [] }»; `src/lib/leados/contracts.ts:127` — «nombre: z.string().trim().min(1),»; `src/app/(protected)/setter/_actions/dossier.actions.ts:392` — «if (!selfCheckAprobado(selfCheck)) {»
- Impacto: El self-check se une a la lista por el texto visible: corregir una coma desaprueba todos los chequeos guardados. Un id de fase muerto vacía el checklist entero de cada setter, sin log. Hoy un invariante lo frena (self-check-gate.invariant.ts:134-178), pero la causa sigue y pasar a id es destructivo.
- Propuesta: Guardar el id junto al nombre con lectura tolerante (por id y, si falta, por nombre) y parsear el progreso ítem por ítem. Decisión de Franco.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-086 en 03-MEJORAS.md

### DEU-087 · paso.ts: casi toda la derivación quedó sin consumidor y conserva la trampa de APROBADA
- Contexto: D4 · h5.set-manual, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/lib/leados/manual.ts:552` — «const paso = derivarPasoDelLead(stage, gateAbierto, openerPendiente)»; `src/lib/leados/manual.ts:574` — «if (paso.anchor === 'opener') {»; `src/lib/leados/paso.ts:247` — «* 'indice' → DossierStepper · 'foco' → PasoActualBanner (y el tono del marco del * step activo) · 'anchor' → StepAnchor.»; `src/lib/leados/paso.ts:169` — «// ⚠️ Esta rama NO mira 'finalUrl', así que con el link todavía sin cargar // diría «Enviá el link de la demo» sobre un link que no existe»
- Impacto: El único consumidor (manual.ts:552) lee solo anchor==='opener' y foco.tono en EVALUADA (:574-578). `indice`, el anchor de los otros stages y siete de las ocho ramas de describirFoco (copy, íconos de lucide) no se renderizan en ninguna parte: DossierStepper, PasoActualBanner y StepAnchor ya no existen (git grep). Son cerca de 200 líneas que los invariantes de copy siguen barriendo, con la trampa de APROBADA sin finalUrl y el «Seguimiento» como pantalla listos para volver si alguien reusa el descriptor.
- Propuesta: Reducir paso.ts a la decisión de EVALUADA que usa posicionDe (o inlinearla) y borrar indice, anchor y las ramas de foco de los otros stages. Eso cierra PLAN-712 y PLAN-715 por eliminación.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-087 en 03-MEJORAS.md

### DEU-088 · El oráculo del barrido vive en src/lib y su ficha de prueba tiene la forma vieja oculta por un doble cast
- Contexto: D4 · h5.set-manual.derivacion-de-pantalla, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/lib/leados/paso-admitido.ts:200` — «const FICHA = { negocio: 'Bar Modelo', instagram: '@barmodelo',»; `src/lib/leados/paso-admitido.ts:214` — «} as unknown as DerivacionManualInput['ficha']»; `src/lib/leados/contracts.ts:52` — «export const FichaSchema = z.object({»
- Impacto: FichaSchema hoy es identidad, presenciaDigital, resenas, contenidoReal, materiales y otros; la ficha del barrido usa campos que ya no existen y el doble cast lo esconde. Solo lo importan dos invariantes (paso-admitido y aprobada-sin-link). El día que la derivación lea la ficha, el barrido de 373.248 estados va a correr con datos fuera de contrato sin que el compilador avise. Además, el oráculo comparte el punto ciego de APROBADA con toque vencido.
- Propuesta: Mover el generador y las fixtures junto a los invariantes y construir la ficha con FichaSchema.parse, sin casts.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-088 en 03-MEJORAS.md

### DEU-089 · Higiene de UI — D4: 97 detalles cosméticos (contraste 41, otro 26, copy 24, inline 4, tilde 2)
- Contexto: D4 · h5.set-dia, h5.adm-revision-demos, h4.adm-leads, h5.adm-fg2lab, h5.set-manual, h5.set-lead, lib.leados, h5.set-nuevo, h5.set-importar. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/layout.tsx:53` — «[contraste] Rótulo 'develOP' en text-zinc-600 sobre fondo oscuro (menos de 4,5:1)»; `src/app/(protected)/admin/leados/page.tsx:322` — «[contraste] Texto funcional sobre evaluaciones sin fecha en text-zinc-600»; `src/app/(protected)/admin/leados/page.tsx:323` — «[copy] Jerga de sprint '(pre-B5)' en la UI»; `src/app/(protected)/admin/leados/[leadId]/page.tsx:244` — «[contraste] Ayuda 'Si el embed no carga…' en text-zinc-600»; `src/app/(protected)/admin/leados/[leadId]/page.tsx:251` — «[copy] 'draft URL' y 'embeber' como jerga en el vacío del preview»; `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:65` — «[copy] 'no debería pasar en EN_REVISION' expone el enum interno»; `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:78` — «[copy] Veredicto mostrado como enum crudo (DESCARTAR/AVANZAR/CALIENTE)»; `src/app/(protected)/admin/leados/[leadId]/_components/dossier-panels.tsx:168` — «[copy] Jerga de sprint '(B4)' en el vacío del self-check»; `src/app/(protected)/admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx:72` — «[copy] Veredicto como enum crudo»; `src/app/(protected)/admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx:82` — «[contraste] 'sin fecha (pre-B5)' en text-zinc-600 y con jerga de sprint»; `src/app/(protected)/admin/leados/[leadId]/_components/decision-bar.tsx:65` — «[otro] z-[130] y bg-[#05070a] literales en vez del token zIndex de design-tokens.ts:227»; `src/app/(protected)/admin/leados/[leadId]/_components/ficha-accordion.tsx:133` — «[inline] transition/willChange en style inline (dinámico, justificable)»; `src/app/(protected)/admin/leados/[leadId]/_components/ficha-accordion.tsx:146` — «[inline] gridTemplateRows/opacity/transition en style inline»; `src/app/(protected)/admin/leados/[leadId]/page.tsx:36` — «[otro] STAGE_PILL duplicado con pipeline-board.tsx:25-33»; `src/app/(protected)/setter/loading.tsx:15` — «[otro] El skeleton dibuja eyebrow y descripción que la página ya no renderiza desde P21 (page.tsx:104-109)»; `src/app/(protected)/admin/leads/_actions/lead.schemas.ts:44` — «[copy] Mensajes de validación en inglés ('Business name is required', 'Invalid lead id')»; `src/app/(protected)/admin/leads/_actions/demo.schemas.ts:26` — «[copy] 'A valid demo URL is required' en inglés»; `src/app/(protected)/admin/leads/_actions/lead.actions.ts:142` — «[copy] 'Lead not found' y fallbacks 'Failed to …' en inglés»; `src/app/(protected)/admin/fg2-lab/_components/medicion-panel.tsx:139` — «[contraste] Ayuda del cronómetro en text-zinc-600»; `src/app/(protected)/setter/_components/mis-numeros.tsx:83` — «[contraste] text-zinc-700 en la nota «sin fecha» da ≈1,9:1 sobre el fondo oscuro.»; `src/app/(protected)/setter/_components/mis-numeros.tsx:77` — «[contraste] text-zinc-600 en «Últimos 30 días» da ≈2,6:1.»; `src/app/(protected)/setter/_components/mis-numeros.tsx:31` — «[contraste] El rótulo «Mis números» en text-zinc-600 a 11 px da ≈2,6:1.»; `src/app/(protected)/setter/_components/tools-rail.tsx:33` — «[contraste] El nombre de la herramienta pendiente en text-zinc-600 da ≈2,6:1.»; `src/app/(protected)/setter/_components/tools-rail.tsx:37` — «[contraste] dondeSeUsa en text-zinc-700 a 10 px da ≈1,9:1.»; `src/app/(protected)/setter/_components/tools-rail.tsx:41` — «[contraste] «pendiente» en text-amber-300/50 a 10 px no llega a AA.»; `src/app/(protected)/setter/_components/tools-rail.tsx:59` — «[contraste] dondeSeUsa de las herramientas con link en text-zinc-600 a 10 px.»; `src/app/(protected)/setter/_components/novedades-panel.tsx:95` — «[contraste] El cuerpo caducado en text-zinc-600 y tachado da ≈2,6:1 y se lee mal.»; `src/app/(protected)/setter/_components/novedades-panel.tsx:113` — «[contraste] El «hace …» del aviso en text-zinc-600 a 11 px.»; `src/app/(protected)/setter/_components/novedades-panel.tsx:179` — «[contraste] El encabezado «Tus demos esperando a Franco» en text-zinc-600.»; `src/app/(protected)/setter/_components/novedades-panel.tsx:196` — «[contraste] La instrucción «Las ves en tu cartera → filtro…» en text-zinc-600.»; `src/app/(protected)/setter/_components/cola-del-dia.tsx:123` — «[contraste] El pie «Quedan N más para trabajar» en text-zinc-600.»; `src/app/(protected)/setter/_components/cola-del-dia.tsx:76` — «[contraste] Rubro y zona de la fila en text-zinc-600 a 11 px.»; `src/app/(protected)/setter/_components/home-sections.tsx:97` — «[contraste] La meta de la card (rubro · zona · antigüedad) en text-zinc-600.»; `src/app/(protected)/setter/_components/home-en-espera.tsx:102` — «[contraste] «Tu cartera completa sigue disponible.» en text-zinc-600.»; `src/app/(protected)/setter/_components/cartera-view.tsx:122` — «[contraste] La ayuda del vacío por filtro en text-zinc-600.»; `src/app/(protected)/setter/_components/progreso-semana.tsx:58` — «[contraste] «últimos N días» en text-zinc-600 a 11 px.»; `src/app/(protected)/setter/_components/lead-card-actions.tsx:223` — «[contraste] El contador de caracteres de la nota en text-zinc-600 a 10 px.»; `src/app/(protected)/setter/_components/canal-seguridad.tsx:46` — «[contraste] La lista de disciplina en text-zinc-500 a 11 px da ≈4,1:1, por debajo de 4,5:1.»; `src/app/(protected)/setter/_components/bloques-secuenciales.tsx:149` — «[otro] aria-label en un div genérico sin role: los lectores de pantalla lo ignoran (usar role="group" o una región).»; `src/app/(protected)/setter/_components/novedades-abrir-foco.tsx:61` — «[otro] Varios botones «Abrir» con el mismo nombre accesible y sin el negocio; TrabajarLeadButton sí lo incluye (trabajar-lead-button.tsx:40).»; `src/app/(protected)/setter/_components/home-sections.tsx:27` — «[copy] diasDesde cuenta bloques de 24 h, no días calendario: un lead de ayer a las 23 h aparece como «hoy» a la mañana.»; `src/app/(protected)/setter/_components/setter-nav.tsx:89` — «[otro] «Tu día» queda marcado como activo también en /setter/nuevo por el startsWith.»; `src/app/(protected)/setter/_components/shortcuts-help.tsx:32` — «[otro] La pastilla de atajos queda fija abajo a la derecha también en touch, donde no sirve y tapa contenido.»; `src/app/(protected)/setter/_components/cartera-toolbar.tsx:75` — «[otro] Los dos selects (min-w 9,5rem + 10rem) no hacen wrap: desbordan ≈41 px a 320 px y 1 px a 360 px.»; `src/app/(protected)/setter/_components/tools-rail.tsx:52` — «[otro] Los links externos con target=_blank no avisan al lector de pantalla que abren una pestaña nueva.»; `src/app/(protected)/setter/_components/setter-shell.tsx:29` — «[inline] El z-index va por style inline con tokens (:29, :34, :45, :52, :60) en lugar de clases.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/escalamiento-construccion.tsx:39` — «[copy] Interpola '(hace ${esperaEscalado})', pero formatEspera ya devuelve 'hace X': se lee «hace hace 3 h».»; `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx:306` — «[contraste] Nota funcional de score 3 en text-zinc-600 sobre fondo oscuro.»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-form.tsx:460` — «[contraste] La promesa de guardado de la ficha está en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/chequeo-form.tsx:310` — «[contraste] La promesa de guardado del chequeo está en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/_components/lead-timeline.tsx:76` — «[contraste] Estado vacío del historial en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/_components/lead-timeline.tsx:152` — «[contraste] Aclaración «Evento del sistema» en text-zinc-600 italic.»; `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx:46` — «[contraste] Texto de ficha congelada vacía en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m16-agenda.tsx:61` — «[contraste] «Sin teléfono cargado» en text-zinc-600 (igual en m5-seguimiento.tsx:77).»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m14-chequeo.tsx:39` — «[contraste] Rótulo «Tu borrador» en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/franja-recorrido.tsx:56` — «[contraste] Los pasos futuros de la franja usan text-zinc-600 para su nombre y número.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/pantalla-manual.tsx:67` — «[contraste] Rótulos de zona «Contexto del lead» y «Munición» en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/manual-nav.tsx:207` — «[contraste] La explicación de la navegación libre está en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/escalamiento-construccion.tsx:61` — «[contraste] «¿Algo no sale como la guía dice?» en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/historial-lead.tsx:20` — «[contraste] El conteo de movimientos está en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m5-seguimiento.tsx:228` — «[contraste] «Abrí el Gem para pegarlo:» en text-zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m-construccion.tsx:291` — «[copy] Jerga visible «auto-reporte» (también en manual-nav.tsx:208).»; `src/app/(protected)/setter/leads/[leadId]/_components/brief-form.tsx:260` — «[copy] Rótulo «CTA:» en inglés técnico (también en chequeo-form.tsx:99).»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m16-agenda.tsx:138` — «[copy] Muestra el uid interno de Cal.com como «Código de la reserva», y además en zinc-600.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m14-chequeo.tsx:118` — «[copy] Plural con paréntesis «delator(es)».»; `src/app/(protected)/setter/leads/[leadId]/_components/badge-provisorio.tsx:7` — «[copy] Badge permanente «Guía preliminar — en validación» en el camino del setter.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/barra-accion.tsx:168` — «[inline] style={{ zIndex: zIndex.sticky }} en línea (token de design-tokens).»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m15-envio.tsx:90` — «[otro] Condicional redundante 'demoEnviadaAt ?' dentro de la rama donde ya es truthy.»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m-construccion.tsx:180` — «[otro] El comentario describe un expectToast de página entera que ya no existe y fuerza la redacción en subjuntivo (PLAN-927).»; `src/app/api/cron/os-follow-up/route.ts:125` — «[copy] La línea 'Se reactiva hoy' del digest empieza con un espacio donde quedó un emoji borrado»; `src/app/api/cron/os-follow-up/route.ts:134` — «[copy] El encabezado del digest ' <b>Follow-ups pendientes' arranca con un espacio de un emoji borrado»; `src/app/api/cron/os-follow-up/route.ts:100` — «[tilde] 'Respondio' sin tilde en statusLabel»; `src/app/api/cron/os-follow-up/route.ts:130` — «[tilde] 'Ultimo contacto' sin tilde en el digest»; `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:201` — «[contraste] Texto funcional de 11px en text-zinc-600 sobre fondo oscuro (~2,6:1, menor a 4,5:1)»; `src/app/(protected)/setter/nuevo/importar/importar-prospectos-form.tsx:239` — «[contraste] 'fila N' de los duplicados en text-zinc-600 (~2,6:1)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/seguimiento-form.tsx:169` — «[contraste] Detalle de cada opción en text-[11px] text-zinc-500 (~4,1:1, por debajo de AA para texto chico); lo mismo en :142»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/seguimiento-form.tsx:143` — «[copy] 'si no respondió, se enfría solo' promete un comportamiento automático que no existe (el lead queda en seguimiento hasta que Franco lo cierre)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/seguimiento-form.tsx:67` — «[copy] El toast de 'Respondió' dice 'se abrió el brief. A construir la demo' también cuando la demo ya se mandó (m5 post-envío)»; `src/app/(protected)/setter/leads/[leadId]/manual/loading.tsx:10` — «[otro] aria-label en un div sin role: los lectores no lo anuncian; usar role="status"»; `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:95` — «[copy] El comentario que justifica router.push nombra 'el wizard del lead', que ya no existe (es el manual)»; `src/lib/leados/guidance-content.ts:1186` — «[copy] El ejemplo del chequeo final dice 'Los 6 obligatorios en verde' y hoy son 10 hard-checks (flow-content.ts:171-261)»; `src/lib/leados/escalamiento.ts:87` — «[otro] El comentario habla de 'los 6 hard-checks' y hoy son 10»; `src/lib/leados/agenda.ts:296` — «[otro] El comentario dice que el claim exigió agendaJson NULL; desde 6.1 también acepta OFRECIDOS»; `src/lib/leados/flow.ts:650` — «[otro] El comentario de agruparParaHome dice 'calientes (score >= 4)'; el caliente hoy es el campo de Franco»; `src/lib/leados/flow.ts:412` — «[otro] El doc de grupoPara dice 'APROBADA → en seguimiento (el envío llega en bloques posteriores)'; el código (:430-443) ya manda a trabajar»; `src/lib/leados/guidance-content.ts:24` — «[otro] El encabezado dice 'hoy el registro solo tiene la ficha (m1)'; el registro tiene once pasos»; `src/lib/leados/herramientas.ts:8` — «[otro] Dice que SHELL_CONSTRUCCION y CANAL_INSTAGRAM están en flow.ts; viven en flow-content.ts»; `src/lib/leados/manual.ts:517` — «[otro] El comentario dice que DESCARTADA mantiene su case en m2 con el veredicto a la vista; hoy aterriza en 'archivo' (:564-572) y m2 no existe.»; `src/lib/leados/manual.ts:327` — «[otro] 'Ruta canónica... (ruta paralela al wizard)': el wizard ya no existe.»; `src/lib/leados/manual.ts:336` — «[otro] El comentario cita 'WizardData en la página del wizard' y el 'gate del wizard' (:342), que ya no existen.»; `src/lib/leados/prompts-disenio.ts:121` — «[otro] 'Estado de los seis hard-blocks' lista seis; HARD_CHECKS hoy tiene diez (flow-content.ts:171+).»; `src/lib/leados/prompts-disenio.ts:161` — «[otro] Cita las pantallas M7-M12 y <PromptsDisenio /> del wizard, ya borrados.»; `src/lib/leados/paso.ts:184` — «[copy] «seguí el contacto en «Seguimiento»» nombra una fase como si fuera una pantalla (rama sin render, PLAN-715).»; `src/lib/leados/paso.ts:4` — «[otro] La cabecera describe consumidores (stepper, banner, anchor) que ya no existen.»; `src/lib/leados/turno.ts:204` — «[copy] «Cuando toque un toque vuelve a tu cola»: repetición de 'toque' que se lee rara en el detalle del turno negocio.»; `src/lib/leados/novedades-agrupar.ts:75` — «[otro] 'Una fila plegada es siempre vigente' no vale para avisos huérfanos de leads borrados (vigenciaDeAviso con estado null da false).»; `src/lib/leados/notify.ts:6` — «[otro] El contrato dice fire-and-forget, pero los callers hacen await (dossier.actions.ts:165, agenda.actions.ts:263).»
- Impacto: Bloqueante para el primer cliente real solo en lo visual: textos sin tildes o con jerga, íconos con trazo distinto, contraste bajo y estilos inline que no siguen los tokens. Ninguno cambia datos ni permisos.
- Propuesta: Una pasada de higiene por dominio, de a un archivo, con la lista de abajo como checklist.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: DEU-089 en 03-MEJORAS.md

### FAL-001 · Los inicios de sesión no dejan rastro: no hay events en auth.ts ni tipo LOGIN en AuditActionType
- Contexto: D1 · h1.auth-login, lib.auth, h4.adm-audit, modelo.AdminAuditLog. BAJA, PROBABLE.
- Evidencia: `src/auth.ts:173` — «callbacks: {»; `prisma/schema.prisma:190` — «enum AuditActionType {»; `prisma/schema.prisma:211` — «PASSWORD_CHANGED»; `src/app/login/actions.ts:113` — «if (error instanceof AuthError) { recordFailedAttempt(ip)»
- Impacto: Una toma de la cuenta SUPER_ADMIN (fuerza bruta de SEC-007, magic link a un buzón comprometido) o de un cliente no deja registro de cuándo ni desde dónde se entró. Los fallos solo suman a un Map en memoria y los éxitos no se guardan en ningún lado. develOP no puede detectar ni reconstruir un acceso indebido. Además, el 'registro de accesos' que se le muestra al cliente en la Bóveda es inventado (PLAN-032).
- Propuesta: Decisión para Valentino (auth.ts es FROZEN + ZONA-FRANCO; el schema es FROZEN, migración sin reset). Opción: events.signIn/signOut en auth.ts que escriban en AdminAuditLog con tipos nuevos (LOGIN_SUCCEEDED/LOGIN_FAILED) o en una tabla propia. Como mínimo para SUPER_ADMIN y con la IP confiable.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: FAL-001 en 02-PENDIENTE.md

### PERF-014 · Abrir un lead carga el manual completo dos veces y re-chequea la propiedad del lead en cada lectura
- Contexto: D4 · h5.set-lead, h5.set-manual.aterrizaje-y-guardia, lib.leados. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/page.tsx:18` — «const manual = await cargarManualDelLead(leadId)»; `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx:64` — «const manual = await cargarManualDelLead(leadId)»; `src/app/(protected)/setter/leads/[leadId]/manual/_data.ts:147` — «const lead = await getOwnedLead(leadId, userId) if (!lead) return null»
- Impacto: Todo link a un lead pasa por /setter/leads/[id] -> /manual (carga completa solo para elegir la pantalla) -> /manual/[paso] (segunda carga completa). Cada helper del Promise.all vuelve a llamar getOwnedLead (p. ej. outreach.ts:44), así que se hacen unas 20 consultas a Neon por apertura, más dos redirects.
- Propuesta: Que el índice calcule solo la posición con una lectura mínima o que los links apunten directo a la pantalla; pasar el lead ya verificado a los helpers en vez de re-chequear.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: PERF-014 en 03-MEJORAS.md

### SEC-021 · /api/qa/login revela en el 403 cual guarda fallo
- Contexto: D1 · h1.auth-login, lib.auth. BAJA, VERIFICADO-POR-LECTURA.
- Evidencia: `src/app/api/qa/login/route.ts:87` — «return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })»; `src/app/api/qa/login/route.ts:50` — «if (process.env.QA_ALLOW_LOCALHOST !== '1') { return { allowed: false, reason: 'qa_flag_off' }»
- Impacto: Un sondeo anonimo en produccion sabe si QA_ALLOW_LOCALHOST esta activa; la guarda 3 (:65-70) depende de que NETLIFY/VERCEL_ENV existan en runtime. Bajo: las tres guardas siguen cerrando (Host localhost no es alcanzable por la CDN).
- Propuesta: Coordinar con Franco: 404 generico sin reason fuera de localhost.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-021 en 03-MEJORAS.md

### SEC-102 · La importación lee todos los OsLead del sistema y expone si un negocio ya existe
- Contexto: D4 · h5.set-importar.importar-csv, modelo.OsLead. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts:144` — «const todos = await prisma.osLead.findMany({ select: { businessName: true } })»; `src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts:95` — «duplicadas.push({ fila: u.fila, nombre: u.data.businessName, motivo: 'en-sistema' })»
- Impacto: Cada tanda trae la tabla completa a memoria (crece sin tope) y un setter puede sondear nombres para saber si otro setter ya tiene ese negocio. Es la excepción documentada (PLAN-763); con un equipo chico es aceptable.
- Propuesta: Si crece: consulta por lote de nombres normalizados (in) con índice, en vez de traer todo.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-102 en 03-MEJORAS.md

### SEC-103 · Schemas de LeadOS con texto libre sin tope de longitud (ficha, alta manual e importación de prospectos)
- Contexto: D4 · h5.set-lead, h5.set-nuevo, h4.adm-leads, h5.set-nuevo.alta-manual, h5.set-importar.importar-csv. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/_actions/dossier.schemas.ts:29` — «razonamiento: z.string().trim().min(1, 'Escribí por qué le pusiste ese score'),»; `src/app/(protected)/setter/_actions/dossier.schemas.ts:82` — «titulo: z.string().trim().min(1, ...), concepto, secciones, notasMarca, cta, pegadoGem sin .max»; `src/app/(protected)/setter/_actions/prospecto.schemas.ts:20` — «const optionalString = z.preprocess(emptyToUndefined, z.string().optional())»; `src/app/(protected)/admin/leads/_actions/lead.schemas.ts:44` — «businessName: z.string().trim().min(1, 'Business name is required'),»; `src/app/(protected)/setter/nuevo/nuevo-prospecto-form.tsx:79` — «const parsed = NuevoProspectoSchema.safeParse(form)»; `src/app/(protected)/setter/nuevo/importar/importar-prospectos-form.tsx:43` — «if (!NuevoProspectoSchema.safeParse(f.data).success) invalidas++»
- Impacto: Razonamiento, brief, campos del alta y notas de actividad/demo (activity.schemas.ts:15, demo.schemas.ts:17) aceptan cualquier largo hasta el límite del body: blobs JSON enormes en el dossier y en las pantallas de Franco. Usuarios internos, riesgo bajo.
- Propuesta: Agregar .max razonables (como ya tienen nota 240, opener 1000, rechazo 2000).
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-103 en 03-MEJORAS.md

### SEC-104 · El candado diario del cron es una Notification de un usuario, sin atomicidad y con fallback a cualquier usuario
- Contexto: D4 · int.cron.os-follow-up, modelo.Notification. BAJA, PROBABLE.
- Evidencia: `src/app/api/cron/os-follow-up/route.ts:248` — «(await prisma.user.findFirst({ select: { id: true,»; `src/app/api/cron/os-follow-up/route.ts:276` — «await prisma.notification.create({ data: { userId: markerUser.id,»
- Impacto: Sin SUPER_ADMIN, el marcador '[os-follow-up] fecha' se guarda como notificación del usuario más viejo, que puede ser un CLIENT y verla en su historial con link a /admin/leads. Además, leer el marcador, enviar y escribirlo no es atómico: dos ejecuciones simultáneas (reintento del scheduler) mandan el digest dos veces.
- Propuesta: Guardar la idempotencia en una tabla o clave propia de cron (p. ej. upsert único por día) y no en Notification; nunca caer a un usuario cualquiera.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: SEC-104 en 03-MEJORAS.md

### UX-053 · La guardia de salida interna solo cubre el veredicto: el opener y las notas de traspaso se pierden al navegar dentro del manual
- Contexto: D4 · h5.set-manual.opener, h5.set-manual.agenda, h5.set-manual.recorrido-y-barra. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/_components/opener-form.tsx:44` — «useUnsavedGuard(hayCambiosSinGuardar)»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/agenda-form.tsx:105` — «useUnsavedGuard(hayCambiosSinGuardar)»; `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx:102` — «useUnsavedGuard(hayCambiosSinGuardar, { avisaEnSalidaInterna: true })»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/franja-recorrido.tsx:184` — «<Link href={rutaManual(leadId, paso.destino)}»
- Impacto: m4 y m16 no tienen autoguardado. Un clic en «Volver a tu día» o en un chip de la franja descarta sin preguntar el opener o las notas de traspaso (hasta 2000 caracteres). Ni los chips de la franja ni «Ir a tu paso actual» consultan la guardia, tampoco para el veredicto.
- Propuesta: Declarar avisaEnSalidaInterna también en el opener y en la agenda. Que los enlaces internos del manual (franja, EnlacePantalla y la salida de avance) consulten useHayTrabajoSinRegistrar, igual que SalidaDelManual.
- Cómo verificar: VH-149 en 08-VERIFICACION-HUMANA.md
- Coordinación: ninguna fuera de la zona
- Ficha completa: UX-053 en 03-MEJORAS.md

### UX-054 · Con la demo aprobada pero sin link, m15 manda a «registrá un toque» aunque el turno es de Franco
- Contexto: D4 · h5.set-manual.envio-demo. BAJA, PROBABLE.
- Evidencia: `src/app/(protected)/setter/leads/[leadId]/manual/_components/m15-envio.tsx:114` — «stage === 'APROBADA' ? finalUrl ? GUIA_ENVIO.espera.aprobadaSinEnganche»; `src/app/(protected)/setter/leads/[leadId]/manual/_components/m15-envio.tsx:127` — «<Link href={rutaManual(leadId, 'm5')}»; `src/lib/leados/flow.ts:434` — «Franco. El toque vencido tampoco lo rescata — la sugerencia de esta rama // nunca ofrece el toque»
- Impacto: La cartera muestra el lead esperando a Franco y no ofrece el toque. m15 dice lo mismo en el texto, pero su único botón empuja al setter a escribirle al negocio. El salto es un Link crudo, no pasa por EnlacePantalla, así que no avisa si m5 está disponible.
- Propuesta: En aprobadaSinLink no ofrecer el toque, o pasar por EnlacePantalla con el accesible que calcula el server.
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: UX-054 en 03-MEJORAS.md

### UX-056 · En el re-loop el paso actual queda en «Construir» hasta mandar a revisión
- Contexto: D4 · h5.set-manual.derivacion-de-pantalla, lib.leados, modelo.OsLeadDossier. BAJA, PROBABLE.
- Evidencia: `src/lib/leados/manual.ts:622` — «const reloop = enConstruccion && input.hayRechazo»; `src/lib/leados/manual.ts:625` — «: enConstruccion && !reloop ? input.draftUrl»; `src/lib/leados/manual.ts:618` — «// LÍMITE CONOCIDO, y es de datos: el producto no registra QUÉ correcciones // se aplicaron»
- Impacto: Después de reabrir, rehacer y republicar el borrador, el manual sigue marcando mc1 «Construí la demo» como «Tu paso ahora». El setter tiene que encontrar solo el chequeo final (alcanzable, pero no señalado), justo en el tramo donde Franco espera la corrección.
- Propuesta: Decisión de Franco: derivar el fin del retrabajo de un dato existente (borrador registrado después de la fecha del último rechazo) o persistir una marca de «correcciones aplicadas».
- Cómo verificar: leer las líneas citadas en origin/main
- Coordinación: ninguna fuera de la zona
- Ficha completa: UX-056 en 03-MEJORAS.md

## Bloques a ejecutar: estado contra el código

> 86 ítems (no empezado 50 · parcial 15 · hecho 19 · abandonado 2). Los extrajeron los agentes de F6b (run `wf_7cfe2151-e7b`, `_crudo/f6b-extraccion/`) desde `Franco/Bloques a Ejecutar/` de Drive (insumo local, no se commitea) y desde las bitácoras y sprints del repo, y cada uno trae su evidencia en `origin/main` @ `57c421bc` (o la búsqueda que prueba que falta). El padre muestreó 5 contra la base y se sostuvieron (`handleChatRequest.ts:952`, `agenda.ts:70`, `brief-form.tsx:85`, `historyPolicy.ts:31-61`, `herramientas.ts:63-117`). Lo marcado «dudoso» por el extractor no se verificó.

### Pendientes de las bitácoras y sprints del repo — 16 ítems (no empezado 7 · parcial 4 · hecho 3 · abandonado 2)

| Bloque | Ítem | Estado | Evidencia | Fuente |
|---|---|---|---|---|
| B0.6 leak | Force-push de la historia purgada (enviroment.env) | no empezado | bitacora-roadmap.md:45-48; el archivo sigue en git log --all (39535583/c351b793, alcanzable desde main) | `docs/bitacora-roadmap.md` |
| INFRA.1 | Setear NEXT_PUBLIC_SENTRY_DSN en Netlify | no empezado | infra-1:69; bitacora-roadmap.md:17135 («Sentry sigue INACTIVO en prod») | `docs/sprints/infra-1-observabilidad.md` |
| P3-A.2 | Cerrar el precio del Motor de Reseñas ([FALTA:precio]) | no empezado | p3-a-2:153; LockedView.tsx:151 | `docs/sprints/p3-a-2-venta.md` |
| AUD-2 | Cargar las 4 URLs de herramientas.ts (Gems y Claude Design) | no empezado | bitacora-beta-3.md:1209; src/lib/leados/herramientas.ts:63, 78, 90, 117 con url:null | `docs/bitacora-beta-3.md` |
| FG-2.0 | Correr el experimento 5 vs 5 del formulario de brief | no empezado | bitacora-beta.md:1556-1562; docs/experimentos/fg2-brief-experimento.md:185-187 en blanco; /admin/fg2-lab sigue en src | `docs/bitacora-beta.md` |
| BLOQUE PRIVACIDAD | Decisión de producto: Telegram con PII de visitantes | no empezado | bitacora-roadmap.md:16897 (pendiente, sin registro posterior en los docs revisados) | `docs/bitacora-roadmap.md` |
| Carril seguridad | RT-2, RE-13, RE-16, RE-7, RT-13, CO-7+PD-1, A.4 | no empezado | roadmap-pendientes.md:175; dudoso: no se verificó contra el código en esta extracción | `docs/roadmap-pendientes.md` |
| B14.3 backups | Cargar los secrets BACKUP_GPG_PASSPHRASE y DIRECT_DATABASE_URL_PROD/DEV y validar el primer run | parcial | bitacora-roadmap.md:9527-9532; el workflow existe (.github/workflows/db-backup.yml:39-42); la ejecución no es verificable | `docs/bitacora-roadmap.md` |
| B14.4 salida a prod | Checklist de deploy en 7 fases + tag v1.0.0-rc.1 | parcial | bitacora-roadmap.md:9675-9705; no hay tags v* locales y package.json:3 = 0.1.0 | `docs/bitacora-roadmap.md` |
| Rediseño home | GATE 1: permutación de acentos y familia del display | parcial | bitacora-rediseno.md:509-537; los acentos A quedaron en el código y CLAUDE.md; el display quedó sin efecto con la home clásica | `docs/bitacora-rediseno.md` |
| Beta Matsu | Onboarding real de Matsu y firma de v1.0.0 | parcial | STATUS.md:174-178; bitacora-roadmap.md:9707-9718, 2423; no se puede confirmar uso real en prod | `STATUS.md` |
| Bloque 2 foco | Decidir si el pin puede ser foco | hecho | bitacora-beta-2.md:556 → bitacora-beta-3.md:1024 (Sprint 6.1) | `docs/bitacora-beta-2.md` |
| Franja admin D4 | Gate de demo preventiva por el campo caliente | hecho | bitacora-beta-2.md:561; dossier.ts usa gateBriefAbierto | `docs/bitacora-beta-2.md` |
| EL TRONCO | Push de main a la punta reconciliada | hecho | bitacora-beta-3.md:10975; ea94dbf8 y 57c421bc son ancestros de origin/main | `docs/bitacora-beta-3.md` |
| Rediseño home | Cerrar los 27 placeholders del gate de merge y las fotos de los socios | abandonado | bitacora-rediseno.md:3323-3360; HOME-CLASICO (3604) restauró la home clásica | `docs/bitacora-rediseno.md` |
| B0-bis / B0.5 | Verificación en el teléfono + Lighthouse mobile del preview antes del merge | abandonado | sprint-b0-bis-cierre.md:57-60; la home restaurada dejó sin objeto la medición | `docs/sprints/sprint-b0-bis-cierre.md` |

### CHATBOT — 33 ítems (no empezado 17 · parcial 6 · hecho 10)

Fuente: `DERIVACION-chat-panel.md`, `HANDOFF-cierre-sesion-evolucion.md`, `ROADMAP-MEJORA-post-auditoria.md`.

| Ítem | Estado | Evidencia |
|---|---|---|
| (a) Widget «Salud del bot» en el dashboard del dueño (render de MH.4) | no empezado | git grep -i 'salud del bot\|botHealth\|visitas atendidas' en src: vacío. El health existe solo en el admin: src/app/(protected)/admin/chatbot/health/page.tsx:12 checkChatbotHealth('develop'). |
| (b) Copy de contadores «conversaciones atendidas» después de MH.2 | no empezado | git grep -i 'conversaciones atendidas': vacío. MH.2 ya descarta las conversaciones degradadas (handleChatRequest.ts:261-300), así que el cambio de semántica existe y el copy no se ajustó. |
| E1: superficie «el bot no supo responder» + aprobación de propuestas de KB | no empezado | git grep -i 'kbGap\|KbProposal\|unanswered\|knowledgeGap' en src y schema.prisma: vacío. |
| Auditoría III: getActivityChartData trae todos los eventos de 7 días sin take | no empezado | modules/chatbot/server/admin/getActivityChartData.ts:12-19: findMany sin take y global (unsafeGlobalQuery con PENDIENTE-DECISIÓN en :6-11). |
| Auditoría III: getLatencyHistory hace take:2000 sin orderBy | no empezado | modules/chatbot/server/admin/getLatencyHistory.ts:76-83: findMany con take: 2000 y sin orderBy. |
| Render genérico de señales para un vertical no-autos | no empezado | git grep '\.signals' en app/(protected)/dashboard y components/dashboard: vacío (el dato existe: schema.prisma:1477 signals Json?). |
| E0: identidad persistente + cierre/timeout de conversación | no empezado | git grep 'endedAt\|visitorId' en src/modules/chatbot: vacío. |
| Decisión abierta #1: política de retención de datos del visitante | no empezado | Solo se purga chatbot_events a 30 días (api/cron/cleanup-old-events/route.ts:14); privacidad-afirmaciones-cliente.md:68-72 confirma que no existe retención de conversaciones ni leads. |
| E3 catálogo/inventario y E4 vertical salud | no empezado | git grep -i 'catalog\|inventory\|inventario' en src/modules/chatbot: vacío; verticals/packs/ no tiene pack de salud. |
| MH.1: orderBy en buildWeeklyReport (3 sets) y en getLatencyHistory | no empezado | modules/chatbot/server/reports/buildWeeklyReport.ts:74-102 (take 100/500 sin orderBy); getLatencyHistory.ts:76-83. |
| MH.3: messageCount real + generateInsightsForBot liviano (take:50, count) | no empezado | chat/persistTurn.ts:447 messageCount { increment: 2 }; insights/generateInsights.ts:29-42 (take 200 con todos los mensajes) y :59 slice(0, 50) en memoria. |
| MH.4: servicio «Salud del bot» por org y período | no empezado | git grep -i 'botHealth\|attendedRate\|uptime' en src/modules/chatbot: vacío. |
| EST.0 (A5.1): extraer un shell de chat común on-site/embed | no empezado | Siguen dos shells separados: modules/chatbot/components/chat/ChatWindow.tsx:12 y components/embed/ChatbotEmbed.tsx:14; git grep 'ChatShell': vacío. |
| A1.2: unique compuesto (botConfigId, sessionId) | no empezado | prisma/schema.prisma:1375 sessionId String @unique (global). |
| A1.8: decay sobre actividad real (lastStatusChangeAt ?? capturedAt) | no empezado | Los callers pasan lastActivityAt: new Date(lead.capturedAt) (dashboard/chatbot/leads/page.tsx:87; api/dashboard/chatbot/leads/export/route.ts:126; lib/reports/executive-weekly/top-hot-leads.ts:108). |
| A4.3: /health info-disclosure (carril de seguridad) | no empezado | app/api/chatbot/[slug]/health/route.ts:7-20 es público y sin auth; modules/chatbot/server/health/checkHealth.ts:35,56,81,93 devuelve error.message y el detalle de env. |
| A4.6: invalidación de cache multi-instancia (diferido) | no empezado | Diferido por diseño; TTL de 60 s documentado en chatbot-sprints.md:79. No se buscó implementación. |
| R1 reporte de ROI: input del dueño (tasa de cierre + ticket) y render | parcial | Hay ticket promedio (dashboard/_actions/business-profile.actions.ts:17) y estimateMoney (src/lib/dashboard/home-metrics-logic.ts:93). git grep 'calculatePotentialValue' y la tasa de cierre del dueño: vacíos. |
| El panel escribe firstContactedAt / lastStatusChangeAt como insumo del decay del score | parcial | Se escriben en modules/chatbot/server/admin/updateLeadStatus.ts:45-46, pero el decay sigue sobre capturedAt (dashboard/chatbot/leads/page.tsx:87; api/dashboard/leads/recent/route.ts:42). |
| BLOQUE EV: packs verticales en código y backfill de verticalPack | parcial | Packs en src/modules/chatbot/server/verticals/packs/{base,agencia,usados}.ts; schema.prisma:1329 verticalPack @default('base'). El smoke de usados falló por bot inexistente/inactivo (ev4-transcripts/usados-*.md, HTTP 404; ev5-transcripts/README.md). |
| Q1: batería de evals (~36 escenarios, asserts + juez) | parcial | src/modules/chatbot/evals/{capture,client,cleanup}.ts y __tests__/q1-2.invariant.ts existen; el juez perceptual nunca corrió (consolidacion-planoA-runtime.md:27). |
| A5.2: descomponer handleChatRequest | parcial | persistTurn.ts fue extraído, pero handleChatRequest.ts sigue con 1.412 líneas en 57c421bc. |
| A5.5/A5.6: constantes de event-types + LEAD_INTENTS unificado | parcial | LEAD_INTENTS unificado con HANDOFF_INTENTS (tools/captureLead.ts:32-36). Las constantes de event-types no se verificaron (dudoso). |
| UTM: captura (EV.2/UTM.1) y render «¿De dónde vienen mis leads?» | hecho | prisma/schema.prisma:1384 utmSource; conversation/resolver.ts:106; requestSchema.ts:64; src/components/dashboard/home/LeadOrigins.tsx:1,32. |
| Integrar T0/MH/RB al índice de ejecución | hecho | Fusionado en docs/consolidacion-planoA-runtime.md:5,45-93 (backlog runtime consolidado, 2026-07-07). |
| MS-E6.3: hash de IP real (la docstring «GDPR-friendly» era falsa) | hecho | modules/chatbot/server/config/envValidator.ts:61-65 (salt obligatorio en prod; hashIp aborta sin él); git grep -i 'GDPR' en src: vacío. |
| T0.1: gate a /smoke (CRON_SECRET o SUPER_ADMIN + rate limit) | hecho | Se resolvió eliminando el endpoint: commit 02a2f812 «deprecar el endpoint smoke publico»; git ls-tree 57c421bc src/app/api/chatbot no tiene smoke. |
| T0.2: cron que llama a cleanupOldEvents | hecho | src/app/api/cron/cleanup-old-events/route.ts:14-23; netlify.toml [functions."cleanup-old-events-cron"] a las 06:00; netlify/functions/cleanup-old-events-cron.ts. |
| T0.3: tipar el any del cron + CRON_SECRET que falle cerrado | hecho | src/lib/cron/cron-secret.ts:40-44 (usado por cleanup, detect-bot-issues, generate-insights, send-weekly-reports); chequeo inline en os-follow-up/route.ts:154, regenerate-briefs/route.ts:19, send-executive-reports/route.ts:18, alerts/route.ts:5. |
| MH.2: no contar conversaciones degradadas + compensar el cupo si el stream muere | hecho | handleChatRequest.ts:261-300 (descarta la conversación nueva degradada); compensación en handleChatRequest.ts:462-527 y __tests__/onf1-reconcile.invariant.ts:41-46. |
| RB.1: P2002 como éxito en getOrCreateConversation y en capture_lead | hecho | modules/chatbot/server/conversation/resolver.ts:116-132; tools/captureLead.ts:560-587 (alreadyCaptured: true). |
| RB.2: techo de historial del lado del server (truncar en vez de 400) | hecho | modules/chatbot/shared/historyPolicy.ts:31 (HISTORY_WINDOW_MESSAGES=30), :61 (HARD_CAP_MESSAGES=40); hooks/useChatbot.ts:17; chat/requestSchema.ts:44. |
| RB.3: onFinish transaccional + fallback ante respuesta vacía | hecho | chat/persistTurn.ts:412 scope.$transaction; chat/__tests__/empty-fallback-pipeline.invariant.ts. |

### DASHBOARD — 18 ítems (no empezado 7 · parcial 5 · hecho 6)

Fuente: `HANDOFF-chatbot-arranque.md`, `ROADMAP-CHATBOT-bloques-C.md`.

| Ítem | Estado | Evidencia |
|---|---|---|
| C1.1: nonce estable por conversación (HMAC) para un prefijo cacheable | no empezado | chat/handleChatRequest.ts:883 visitorTag = vmsg_ + randomUUID() en cada request. |
| C1.4: medir el efecto de caché (tokensIn / cachedContentTokenCount) | no empezado | git grep -i 'cachedContentTokenCount\|cachedTokens' en src/modules/chatbot/server: vacío. |
| C2.1: detección de consultas sin responder | no empezado | git grep -i 'unanswered\|kbGap' en src/modules/chatbot: vacío. |
| C2.2: catálogo visual en el chat | no empezado | git grep -i 'catalog\|show_vehicles\|inventory' en src/modules/chatbot: vacío. |
| C2.3: memoria del visitante | no empezado | git grep 'visitorId\|returningVisitor' en src/modules/chatbot: vacío; depende de C3.2, que no está hecho. |
| C3.2: sessionId compuesto + key del widget por slug | no empezado | prisma/schema.prisma:1375 sessionId String @unique. |
| C3.3: knobs que no mienten (temperature/maxOutputTokens, monthlyQuota rotulado legacy) | no empezado | chat/handleChatRequest.ts:952 temperature: 0.7 fijo; admin/chatbots/[botId]/tabs/ConfigTab.tsx:35-37 sigue editando temperature y monthlyQuota sin rótulo legacy. |
| Arrancar el roadmap de runtime por C0 y dejar C3.2 cerrado antes de C2.3 | parcial | C0.1–C0.3 hechos (ver abajo); C3.2 no empezado (schema.prisma:1375); C2.3 no empezado. |
| C1.2: ventana de historial + caps de schema al percentil real (≤30 ítems) | parcial | Ventana de 30 (historyPolicy.ts:31), pero MAX_MESSAGES_SHAPE=50 y MAX_MESSAGE_CHARS=4000 (historyPolicy.ts:39,50). |
| C3.4: menos round-trips a la DB (rate-limit doble, reusar el bot, paralelizar writes) | parcial | Un solo checkRateLimit en handleChatRequest.ts:184 y validateOrigin en route.ts (comentario en :304); los writes de onFinish van en $transaction por decisión (consolidacion-planoA-runtime.md:76). El resto no se verificó (dudoso). |
| C3.6: deuda del handler (persistTurn, renombrar checkQuota→readQuotaUsage) | parcial | chat/persistTurn.ts existe; quota/checker.ts:32 sigue llamándose checkQuota. |
| Carril de seguridad: P-4 /smoke público + /health que expone internos | parcial | /smoke eliminado (commit 02a2f812); /health sigue público y expone detalle (health/route.ts:7-20; health/checkHealth.ts:93). |
| C0.1: navigate_to_page fuera de los bots de clientes | hecho | modules/chatbot/server/tools/getTools.ts:62-82 (TOOLS_RESTRICTED_TO_AGENCY_BOT = ['navigate_to_page']). |
| C0.2: que la conversación no muera muda (ventana deslizante + slice + degradación) | hecho | shared/historyPolicy.ts:31,61; hooks/useChatbot.ts:17,88; chat/degradedResponse.ts:22 ('conversation_limit'). |
| C0.3: modelo efectivo unificado para costo y ejecución, con fallback y WARN | hecho | llm/resolveEffectiveModel.ts:7-21 (fallback gemini-2.5-flash); chat/persistTurn.ts:369-377 (calculateCost con effectiveModel). |
| C1.3: cap duro de ~40 turnos con CTA a WhatsApp | hecho | shared/historyPolicy.ts:61 HARD_CAP_MESSAGES = 40; handleChatRequest.ts:46; degradedResponse.ts:22. |
| C3.1: corte de provider a mitad del stream (onError, no contar el turno, liberar cupo) | hecho | chat/handleChatRequest.ts:1046 onError; compensación de cupo en :462-527. |
| C3.5: conversaciones huérfanas | hecho | chat/handleChatRequest.ts:261-300 (borrado scoped de la conversación nueva degradada). |

### OSLEAD — 19 ítems (no empezado 19)

Fuente: `Documento sin título.md`.

| Ítem | Estado | Evidencia |
|---|---|---|
| P43 «Refinar» (mc2): 5 prompts de refinamiento en prompts-refinamiento.ts + un tilde único | no empezado | En 57c421bc no existen mc2-refinar.tsx ni prompts-refinamiento.ts (git ls-tree). tildeUnico solo aparece en el checkpoint WIP 506e0059 de origin/p25/rafaga-tildes, que no es ancestro de la base. |
| M14: 15 checks (5 de oficio visual), selector tripartito, «primera mirada», gate con los 10 base | no empezado | git log --all -S'ESTADO_ITEM_CHEQUEO' y -S'primeraMirada': vacíos. En la base, lib/leados/flow.ts:204 selfCheckAprobado exige todos los HARD_CHECKS (flow-content.ts:171). |
| Calibración del self-check: checkId en el rechazo + métrica de checks falsamente verdes | no empezado | git log --all -S'calcularCalibracionSelfCheck': vacío. checkId solo aparece en lib/leados/guidance-content.ts:164-168. |
| M1 calidad de ficha: 4 campos nuevos, umbrales alcanzaParaDecidir/Diseñar y corte de 10 min (registrarCorteFicha) | no empezado | git log --all -S'registrarCorteFicha': vacío. alcanzaParaDisenar solo aparece en docs/auditorias (commit 8e6c3c3d). |
| G2: ángulo wow en m4/m15/m5 (obtenerAnguloWow, AnguloWowCard) | no empezado | git log --all -S'obtenerAnguloWow': vacío; AnguloWowCard solo en docs de esta auditoría. |
| F1: Modal compartido con role=dialog y aria-modal | no empezado | git grep 'aria-modal\|role=' en src/components/ui/Modal.tsx (57c421bc): vacío. |
| F2: franja de conteos de la cartera (irAGrupo) | no empezado | git log --all -S'irAGrupo': vacío. |
| F3: carga on-demand del iframe del borrador (draft-preview) | no empezado | git log --all -S'draft-preview': solo en docs de esta auditoría. |
| F4: invariantes reforzados (REQUISITOS_CONGELADOS) + docs/barrera-rutas-ast.md | no empezado | git log --all -S'REQUISITOS_CONGELADOS': vacío; docs/barrera-rutas-ast.md no existe en 57c421bc. |
| H-01: doble formulario en m6 (pegadoGem obligatorio) | no empezado | (setter)/_actions/dossier.schemas.ts:93 sigue exigiendo pegadoGem cuando el Gem tiene link. Las 4 vueltas no existen en la base. |
| H-02: el trabajo del brief en m6 se pierde con F5 (autosave apagado) | no empezado | setter/leads/[leadId]/_components/brief-form.tsx:85 autosaveEnabled = false; :115 enabled: autosaveEnabled && briefValido. |
| H-03: el botón fijo «Registrar evaluación» no abre el bloque con errores | no empezado | _components/evaluacion-form.tsx:142-171 (intentarEnviar sin acceso al acordeón); ficha-form.tsx:189 estado local abierto/setAbierto. No se ejecutó (probable). |
| H-04: falso verde del gate de self-check con los criterios de diseño | no empezado | No aplica a la base: lib/leados/flow.ts:204 exige todos los HARD_CHECKS; el falso verde era del árbol WIP. Los criterios de diseño no existen en 57c421bc. |
| H-05: cinco tildes por prompt en mc2 | no empezado | mc2 no existe en 57c421bc (ver P43). |
| H-06: m13 en RECHAZADA debe permitir cambiar el link del borrador | no empezado | manual/_components/m13-borrador.tsx:118-122 («Borrador congelado por el rechazo»). |
| H-07: control G3 «¿Exportaste después del último refinamiento?» | no empezado | (setter)/_actions/dossier.schemas.ts:129 solo pide confirmoCarga; git grep -i 'exportaste después': vacío. |
| H-08: gate de decisor en el servidor para buscar horarios | no empezado | (setter)/_actions/agenda.schemas.ts:9-13: decisorConfirmado solo en ConfirmarReunionSchema, no en la búsqueda de horarios. |
| H-09: Cal.com de LeadOS se rompe con más de una org con calComUsername | no empezado | src/lib/leados/agenda.ts:70-81 (si orgs.length > 1 aborta con «Hay más de una agenda conectada…»). |
| S7: eliminar el rótulo «CONTEXTO DEL LEAD» | no empezado | manual/_components/pantalla-manual.tsx:205 <Zona etiqueta="Contexto del lead">. |

## Tarjetas del backlog en tu zona

> 46 tarjetas de `07-BACKLOG.md` tocan tu zona. Son **decisión tuya**: la auditoría no propone tocar nada de la zona sin coordinación. Detalle completo en `07-BACKLOG.md`.

| Tarjeta | Bloque | Tamaño | Hallazgos | Coordinación |
|---|---|---|---|---|
| [B-04] Subir next, next-auth y @auth/core a las versiones con fix | Ahora | S | SEC-105 | libre (coordinar con Franco: cambia el runtime de auth que usa el setter) |
| [B-09] Sesión que no se revive: sessionVersion en 'update', maxAge alineado y falla de base sin rebote | Ahora | L | SEC-006, BUG-001, SEC-010, BUG-006 | también requiere decisión FROZEN (Valentino) |
| [B-10] Guardia SUPER_ADMIN al lado del dato en /admin (páginas, actions y rutas) | Ahora | L | SEC-023, SEC-065, SEC-060, SEC-084 | libre (admin/leados y fg2-lab coordinados con Franco) |
| [B-14] Crons con disparador real en Netlify (y que solo los invoque el scheduler) | Ahora | M | BUG-047, FAL-016, FAL-026, SEC-099, UX-049 | libre (el disparador de os-follow-up, coordinado con Franco) |
| [B-27] Magic link y errores de auth en auth.ts: envío que falla, link que no gasta un escáner, Google y Sentry | Próximo | L | BUG-003, BUG-007, UX-002, FAL-003, FAL-001 | también requiere decisión FROZEN (Valentino) |
| [B-29] Reenviar credenciales solo a cuentas de cliente, con destinatario fijo y aviso a la cuenta | Próximo | S | SEC-087 | libre (afecta cuentas SETTER: avisar a Franco) |
| [B-31] LeadOS: decidir e integrar (o descartar) p25/rafaga-tildes antes de tocar LeadOS en main | Próximo | L | DEU-077 | ZONA-FRANCO |
| [B-32] LeadOS: la agenda reserva en la org de develOP por un identificador explícito | Próximo | S | BUG-038 | ZONA-FRANCO |
| [B-45] Ciclo de vida del cliente: archivar corta acceso y crons, borrar no se lleva lo de la agencia | Próximo | L | SEC-014, BUG-015, BUG-138, BUG-142, DEU-005 | también requiere decisión FROZEN (Valentino) |
| [B-79] Ficha y manual del setter sin pérdida de trabajo | Próximo | M | BUG-153, BUG-155, BUG-156, BUG-157 | ZONA-FRANCO |
| [B-80] LeadOS: un solo predicado de estado vivo y terminal para la cola del setter | Próximo | L | BUG-146, BUG-147, BUG-160, BUG-162, BUG-164, BUG-168 | ZONA-FRANCO |
| [B-81] LeadOS: errores mapeados al usuario y reportados a Sentry | Próximo | M | SEC-101, FAL-031, BUG-149, BUG-163 | ZONA-FRANCO |
| [B-82] Revisión de demos: métrica por evaluador, materiales visibles e iframe con sandbox | Próximo | M | BUG-148, FAL-032, SEC-100 | ZONA-FRANCO |
| [B-83] Fechas del setter en día calendario argentino | Próximo | S | BUG-152 | también requiere decisión FROZEN (Valentino) |
| [B-84] Alta manual de prospectos con aviso de duplicado en el sistema | Próximo | S | BUG-161 | ZONA-FRANCO |
| [B-85] Importación de prospectos: CSV de Excel en español | Próximo | S | UX-055 | ZONA-FRANCO |
| [B-86] LeadOS: herramientas externas del recorrido con link y sin el «Chat de evaluación» | Próximo | S | FAL-033 | ZONA-FRANCO |
| [B-87] Convertir un lead en proyecto desde la ficha del lead | Próximo | S | FAL-024 | ZONA-FRANCO (la conversión lee y marca OsLead: decide Franco) |
| [B-90] Docs: decidir los 37 «a decidir» de 14-DOCS-CONSOLIDADOS | Después | S |  | libre (los ítems 8–12, 33, 35 y 36 los decide Franco) |
| [B-92] Secretos y PII fuera del árbol: docs, scripts que imprimen credenciales y backups versionados | Después | S | SEC-001, SEC-003, SEC-071, SEC-107, POD-161, POD-162, POD-287, POD-288 | libre (b1/b2 son QA del setter: aviso a Franco) |
| [B-93] /api/qa/login atado a localhost, a un secreto por corrida y sin delatar la guarda | Después | S | SEC-024, SEC-021 | ZONA-FRANCO |
| [B-103] auth.ts protegido: callbacks a módulo puro con invariante, org primaria determinística y usuario borrado sin sesión | Después | M | DEU-002, BUG-005, SEC-008, POD-283 | también requiere decisión FROZEN (Valentino) |
| [B-104] auth-guards protegido: error tipado y variante de página que redirige | Después | S | BUG-136, DEU-083 | también requiere decisión FROZEN (Valentino) |
| [B-105] Migración aditiva agrupada del schema: índices, Decimal, enums y columnas pendientes | Después | L | PERF-001, DEU-008, DEU-010, DEU-084, POD-203, POD-204 | también requiere decisión FROZEN (Valentino) |
| [B-106] Retención de datos: purga de rate_limit y tokens, y política para mensajes y formularios | Después | M | SEC-031, DEU-006 | libre (plazos acordados con Franco: la Neon es compartida) |
| [B-129] Leads del admin: un módulo de presentación, conteos coherentes y card operable por teclado | Después | S | DEU-061, BUG-122, BUG-123, UX-045, A11Y-023, POD-351, POD-352, POD-353 | libre (admin/leads/_actions es ZONA-FRANCO y no se toca) |
| [B-134] LeadOS: escrituras comerciales atómicas, por la puerta comercial y con candado propio | Después | M | BUG-165, BUG-150, DEU-060, SEC-104, BUG-170 | ZONA-FRANCO |
| [B-135] LeadOS: borrado de lead auditado y backfill de caliente con guard | Después | S | DEU-074, BUG-177 | ZONA-FRANCO |
| [B-136] LeadOS: fechas en hora argentina y un solo predicado de vencido | Después | S | BUG-151, BUG-159, DEU-081, DEU-079 | ZONA-FRANCO |
| [B-137] LeadOS: entradas validadas (topes, CSV, link del opener y decisor) | Después | M | SEC-103, BUG-169, BUG-167, BUG-158, SEC-102 | ZONA-FRANCO |
| [B-138] LeadOS: estado derivado del manual fiel y blobs del dossier atados a ids | Después | M | BUG-166, UX-056, UX-054, DEU-086 | ZONA-FRANCO |
| [B-139] Manual del setter: nada de lo tipeado se pierde (hooks de acción y autosave, guardia de salida en opener y traspaso) | Después | S | BUG-181, BUG-182, UX-053 | ZONA-FRANCO (los hooks de src/lib son libres; los consumidores son del setter) |
| [B-140] Setter: lecturas acotadas en el home y el manual, y despacho del manual por registro | Después | M | PERF-015, PERF-014, DEU-080 | ZONA-FRANCO |
| [B-141] Setter: accesibilidad de la cabina, del drawer y del manual | Después | M | A11Y-026, A11Y-027, A11Y-028, A11Y-029, A11Y-030, A11Y-031, A11Y-032, BUG-154 | ZONA-FRANCO |
| [B-142] Setter: lienzo propio del portal y navegación clasificada | Después | M | DIS-003, DEU-082 | ZONA-FRANCO (useThemeObserver.tsx y publicRoute.ts son libres) |
| [B-143] Higiene de UI del setter (D4: 97 detalles) | Después | S | DEU-089 | ZONA-FRANCO |
| [B-159] Una sola fuente de acentos y de z-index: design-tokens reemplazado | Después | M | DEU-100, DEU-101, DEU-110, DEU-111, DIS-008, UX-031, POD-383, POD-068 | también requiere decisión FROZEN (Valentino) |
| [B-165] Poda de scripts sueltos y salidas generadas commiteadas (103 ALTA + 10 MEDIA) | Después | S | POD-085, POD-086, POD-087, POD-088, POD-089, POD-090, POD-091, POD-092 y 109 más | libre (qa-corridas y los QA b4–b7 son del setter: aviso a Franco) |
| [B-169] LeadOS: poda del wizard, del laboratorio FG-2 y de exports sin consumidor | Después | M | DEU-075, DEU-078, DEU-085, DEU-087, DEU-088, POD-052, POD-053, POD-054 y 13 más | ZONA-FRANCO |
| [B-170] Ramas: borrar las 43 mergeadas y archivar con tag las 14 con trabajo propio | Después | S | POD-205, POD-206, POD-207, POD-208, POD-209, POD-210, POD-211, POD-212 y 49 más | libre (leados/* y las fix/* del setter: confirmar con Franco) |
| [B-171] Docs consolidados: publicar los 10 vivos y borrar 128 docs | Después | M | POD-083, DEU-056, DEU-076 | libre (LEADOS.md y los docs de LeadOS los aprueba Franco) |
| [B-172] Aplicar el CLAUDE.md propuesto: raíz de 172 líneas y tres anidados (setter, chatbot, prisma) | Después | M | DEU-025, DEU-062, DEU-098 | libre (setter/CLAUDE.md: ZONA-FRANCO) |
| [B-173] De prosa a mecanismo: eslint.gate en CI, hooks PreToolUse, CODEOWNERS e invariantes de convención | Después | L | DEU-099, DEU-071 | libre (CODEOWNERS de la zona de Franco: Franco) |
| [B-177] Capa de roles del portal y puente de paleta, con foco visible de dos tonos | Después | L | DIS-001, DIS-005 | también requiere decisión FROZEN (Valentino) |
| [B-178] Shells de los tres portales con roles y Toaster condicionado | Después | M | DIS-002, DIS-009 | libre (setter: ZONA-FRANCO) |
| [B-185] Migrar el setter al tema | Después | L |  | ZONA-FRANCO |
