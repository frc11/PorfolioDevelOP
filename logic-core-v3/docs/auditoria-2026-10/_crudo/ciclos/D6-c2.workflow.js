export const meta = {
  name: 'f2-ciclo-cazadores',
  description: 'F2 ciclos 2-3: cazadores de huecos con lente por tramo + verificador adversarial solo para CRITICA/ALTA (tope 3 agentes)',
  phases: [
    { title: 'Caza', detail: 'un cazador general-purpose por tramo, con la lente del ciclo' },
    { title: 'Verificacion', detail: 'verificador adversarial de CRITICA/ALTA del tramo' },
  ],
}

// Plantilla de los ciclos 2 y 3 de F2 (auditoría de renovación 2026-10, DEC-26). La completa
// f2-construir.mjs igual que la de lectores. Un cazador por tramo de <= 16k LOC: el dominio ya
// se leyó completo en el ciclo 1; el cazador busca lo que se pasó con la lente del ciclo y
// recibe los títulos ya registrados para no repetirlos. El meta tiene que ser lo primero.

// args: { dominio, nombre, ciclo, lente, foco, contexto, lotes: [{id, archivos, loc, titulos_existentes, planeado, alertas_pendientes}] }
const A = { ...({
 "dominio": "D6",
 "nombre": "Datos",
 "ciclo": "D6-c2",
 "lente": "SEGURIDAD, AISLAMIENTO Y MAQUINAS DE ESTADO EN LOS DATOS. (1) Aislamiento: por cada modelo con organizationId (o que cuelga de uno), si todas las consultas que lo leen o escriben filtran por la org de la sesion, dentro y fuera del helper de src/lib/isolation; relaciones que permiten cruzar tenants (FK sin org, connect por id ajeno); unicidades globales que deberian ser por tenant; los 68 escapes unsafeGlobalQuery y si su razon es cierta. (2) Maquinas de estado: enums de estado (Project, Task, Ticket, Subscription, OrganizationModule, Invoice, Conversation, Lead; OsLead es ZONA-FRANCO) y que transiciones permite el codigo que el negocio no deberia (saltos, estados sin salida, campos de fecha incoherentes con el estado). (3) Integridad: cascadas y SetNull peligrosos, defaults peligrosos, columnas nullable que el codigo asume no nulas, seeds y scripts que pueden escribir en prod. Busca causas raiz distintas de los titulos ya registrados.",
 "foco": "Datos: modelos, relaciones y cascadas peligrosas (onDelete Cascade sobre datos de clientes), indices faltantes para las consultas reales, N+1, soft-deletes, migraciones (el drift schema-migraciones lo mide scripts/auditoria/drift.mjs: 0 diferencias en F0; leer las 14 sentencias DML a mano), cold start de Neon, frontera de aislamiento (src/lib/isolation: registry, scoped-model, unsafeGlobalQuery y sus razones), y los seeds/scripts que escriben en la base (guard de entorno, destino prod, credenciales literales, borrados sin scoping).",
 "contexto": "",
 "lotes": [
  {
   "id": "D6-T1",
   "loc": 10802,
   "lotes_origen": [
    "D6-L1",
    "D6-L2"
   ],
   "archivos": [
    "prisma.config.ts",
    "prisma/schema.prisma",
    "prisma/seed-agency-os.ts",
    "prisma/seed-guard.ts",
    "prisma/seed.ts",
    "prisma/migrations/20260318202838_init/migration.sql",
    "prisma/migrations/20260319113436_add_analytics_property_id/migration.sql",
    "prisma/migrations/20260319120419_add_site_url/migration.sql",
    "prisma/migrations/20260319171313_add_n8n_workflow_ids/migration.sql",
    "prisma/migrations/20260320164526_add_contact_submission/migration.sql",
    "prisma/migrations/20260320200000_multi_tenancy_organizations/migration.sql",
    "prisma/migrations/20260320231830_transform_to_multitenancy/migration.sql",
    "prisma/migrations/20260321203323_add_approvals_and_notifications/migration.sql",
    "prisma/migrations/20260327013000_add_lead_status_notes/migration.sql",
    "prisma/migrations/20260327120000_add_agency_settings_and_module_pricing/migration.sql",
    "prisma/migrations/20260403170000_reconcile_existing_schema/migration.sql",
    "prisma/migrations/20260403173000_agency_os_init/migration.sql",
    "prisma/migrations/20260406010000_v2-unify-project-task/migration.sql",
    "prisma/migrations/20260406023000_task_unified_assignee/migration.sql",
    "prisma/migrations/20260406033000_add_os_settings_fields/migration.sql",
    "prisma/migrations/20260406040000_v2-cleanup-deprecated-models/migration.sql",
    "prisma/migrations/20260406113000_allow_internal_projects_without_organization/migration.sql",
    "prisma/migrations/20260420000000_baseline_premium_modules/migration.sql",
    "prisma/migrations/20260427194426_add_health_score_and_brief_cache_fields/migration.sql",
    "prisma/migrations/20260502170000_add_email_notif_preference/migration.sql",
    "prisma/migrations/20260503150000_add_gbp_fields/migration.sql",
    "prisma/migrations/20260504191633_add_upsell_tracking/migration.sql",
    "prisma/migrations/20260504191714_add_inactive_module_status/migration.sql",
    "prisma/migrations/20260504193006_add_google_maps_place_id/migration.sql",
    "prisma/migrations/20260504193757_add_email_marketing_tables/migration.sql",
    "prisma/migrations/20260504235814_add_tiendanube_fields/migration.sql",
    "prisma/migrations/20260505000536_add_cal_com_fields/migration.sql",
    "prisma/migrations/20260505002847_add_onboarding_tasks/migration.sql",
    "prisma/migrations/20260512150823_chatbot_init/migration.sql",
    "prisma/migrations/20260514200826_chatbot_events/migration.sql",
    "prisma/migrations/20260515180808_chatbot_leads_crm_status/migration.sql",
    "prisma/migrations/20260515191500_organization_lead_notifications/migration.sql",
    "prisma/migrations/20260515193000_chatbot_insights/migration.sql",
    "prisma/migrations/20260517220000_add_bot_alerts/migration.sql",
    "prisma/migrations/20260517233000_add_admin_audit_log/migration.sql",
    "prisma/migrations/20260519232631_add_client_role_and_password_reset_required/migration.sql",
    "prisma/migrations/20260519234404_add_email_audit_action_types/migration.sql",
    "prisma/migrations/20260520142350_add_password_changed_audit_type/migration.sql",
    "prisma/migrations/20260520150000_add_bot_created_audit_type/migration.sql",
    "prisma/migrations/20260520160000_add_leads_exported_audit_type/migration.sql",
    "prisma/migrations/20260520180043_add_allowed_domains/migration.sql",
    "prisma/migrations/20260520190000_add_alert_types/migration.sql",
    "prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql",
    "prisma/migrations/20260522234313_add_plan_model/migration.sql",
    "prisma/migrations/20260523001750_add_billing_override_and_plan_scheduling/migration.sql",
    "prisma/migrations/20260523183030_b51_add_lead_signals_and_scoring/migration.sql",
    "prisma/migrations/20260524210709_b58_crm_integration/migration.sql",
    "prisma/migrations/20260524225006_b61_executive_brief_snapshots/migration.sql",
    "prisma/migrations/20260524230542_b62_executive_weekly_report_log/migration.sql",
    "prisma/migrations/20260525182135_b11_1_project_organizationid_not_null/migration.sql",
    "prisma/migrations/20260525190000_b11_4a_create_enum_types/migration.sql",
    "prisma/migrations/20260525190100_b11_4b_promote_columns_to_enum/migration.sql",
    "prisma/migrations/20260525192047_b11_5_add_3_missing_indexes/migration.sql",
    "prisma/migrations/20260525192312_b11_6_clientid_to_organizationid/migration.sql",
    "prisma/migrations/20260526050401_add_user_session_version/migration.sql",
    "prisma/migrations/20260526233939_add_rate_limit_b14_1/migration.sql",
    "prisma/migrations/20260605225019_drop_subscription_plan_name/migration.sql",
    "prisma/migrations/20260611210802_add_setter_role/migration.sql",
    "prisma/migrations/20260612121536_add_os_lead_dossier/migration.sql",
    "prisma/migrations/20260612140852_add_dossier_b5_revision_fields/migration.sql",
    "prisma/migrations/20260612202545_add_dossier_b7_agenda/migration.sql",
    "prisma/migrations/20260617184913_add_converted_lead_link_and_bot_deleted_audit/migration.sql",
    "prisma/migrations/20260619132830_add_operator_cabin_indexes/migration.sql",
    "prisma/migrations/20260619140000_add_bot_deleted_audit_action/migration.sql",
    "prisma/migrations/20260619140100_drop_chatbot_lead_converted_column/migration.sql",
    "prisma/migrations/20260619150000_add_activity_channel_sistema/migration.sql",
    "prisma/migrations/20260619160000_add_os_lead_setter_meta/migration.sql",
    "prisma/migrations/20260619234252_add_organization_city_avatar_notes_softdelete/migration.sql",
    "prisma/migrations/20260620173833_add_agency_settings_singleton_unique/migration.sql",
    "prisma/migrations/20260620180000_add_dossier_escalado/migration.sql",
    "prisma/migrations/20260620190000_add_setter_novedades/migration.sql",
    "prisma/migrations/20260621120000_reconcile_dev_drift_schema_align/migration.sql",
    "prisma/migrations/20260622120000_readd_client_columns_dropped_by_reconcile/migration.sql",
    "prisma/migrations/20260627000000_admin_1a_add_oslead_caliente/migration.sql",
    "prisma/migrations/20260629195726_ev2_vertical_pack_signals_utm/migration.sql",
    "prisma/migrations/20260630000000_add_dossier_progreso/migration.sql",
    "prisma/migrations/20260630032132_add_org_average_ticket_usd/migration.sql",
    "prisma/migrations/20260701150307_add_panel_announcement/migration.sql",
    "prisma/migrations/20260701154505_add_referrals/migration.sql",
    "prisma/migrations/20260702223350_add_executive_report_config/migration.sql",
    "prisma/migrations/20260704224423_utm1_add_conversation_utm_fields/migration.sql",
    "prisma/migrations/20260707044711_motor_whatsapp_b0_schema/migration.sql",
    "prisma/migrations/20260709163143_b1s1_webhook_credentials_and_identity_transitions/migration.sql",
    "prisma/migrations/20260709180000_b1s2_outbound_apikey_templates_idempotency/migration.sql",
    "prisma/migrations/20260709200000_b1s3_health_events_and_alerts/migration.sql",
    "prisma/migrations/20260710203413_add_portal_indexes/migration.sql",
    "prisma/seeds/add-contact-tool.ts",
    "prisma/seeds/backfill-vertical-pack.ts",
    "prisma/seeds/init-data-connections.ts",
    "prisma/seeds/sync-plans.ts",
    "prisma/seeds/sync-premium-modules.ts",
    "src/lib/data/message-context.ts",
    "src/lib/data/onboarding-tasks.ts",
    "src/lib/data/premium-modules.ts",
    "src/lib/isolation/index.ts",
    "src/lib/isolation/registry.ts",
    "src/lib/isolation/scoped-model.ts",
    "src/lib/prisma-enums.ts",
    "src/lib/prisma.ts"
   ],
   "titulos_existentes": [
    "BUG-010 El portal muestra un precio de plan desactualizado: Subscription.price solo se escribe al crear la suscripción",
    "FAL-004 Agenda y QR de reseñas sin camino de configuración: calCom* y googleMapsPlaceId no tienen escritor en la app",
    "BUG-011 seed-agency-os aborta siempre en el proyecto interno: el mapa de orgs nunca recibe 'develop'",
    "DEU-005 Borrar un User borra en cascada los tickets que abrió y todas sus respuestas, en cualquier organización",
    "DEU-006 Solo chatbot_events tiene retención; rate_limit, mensajes, leads y formularios crecen sin purga",
    "DEU-007 Sin directUrl: migrate y seeds corren por el pooler de Neon",
    "SEC-034 El guard anti-prod de los seeds compara por substring sobre toda la URL",
    "PERF-001 FKs sin índice (Task.projectId, Notification.userId/taskId, ChatbotEvent.conversationId) e índices redundantes",
    "DEU-008 Montos de dinero en Float (Invoice, Subscription, PremiumModule, OrganizationModule) junto a Decimal",
    "DEU-009 Los seeds adoptan datos existentes por nombre no único y les asignan usuarios con contraseña de seed",
    "DEU-010 BotConfig.industry es String libre con tres vocabularios ('generic', 'generico', 'automotive')",
    "DEU-011 Comentarios de los archivos de datos que afirman cosas falsas",
    "DEU-012 AdminAuditLog sin organizationId: no se puede reconstruir la auditoría de un cliente",
    "TEC-001 Prisma 6.19 con 7.x disponible: el salto exige cambiar el schema congelado y la carga de .env de los seeds",
    "BUG-012 Email Marketing Pro inalcanzable: el gate y el sidebar buscan el slug 'email-marketing' y el catálogo sincronizado usa 'email-marketing-pro'",
    "SEC-035 El registro de aislamiento no bloquea nested writes en WabaChannel.templates/alerts (re-parenting cross-tenant posible)",
    "BUG-013 update/delete del helper con id undefined en runtime operan sobre todas las filas del tenant (o sobre el bot por organizationId único)",
    "DEU-013 La frontera de aislamiento solo cubre src/modules/{chatbot,motor} y api/chatbot: 46 accesos directos a modelos aislados fuera del helper y la regla de",
    "BUG-014 El deploy a producción ya no aplica migraciones (sacado en b85f791d) y la documentación sigue diciendo que Netlify lo hace",
    "DEU-014 Migraciones de reconciliación agregaron, borraron y re-agregaron columnas con datos de clientes con un criterio falso, y 20260619140100 quedó resuelta",
    "BUG-015 El hard-delete de un cliente borra en cascada los registros financieros de la agencia y los leads del bot (que el resumen subinforma) y deja vivos a s",
    "SEC-036 Credenciales de terceros en claro en la base: tokens OAuth de Google Business, token de Tiendanube, API key de Cal.com, token de Telegram y credencial",
    "BUG-016 sync-premium-modules borra activaciones no activas de clientes (PAUSED/CANCELLED/INACTIVE) al retirar un slug del catálogo, sin dry-run ni transacción",
    "BUG-017 El precio de los módulos tiene dos fuentes de verdad: la home pública lee el catálogo en código, el portal lee la DB que edita el admin, y el sync rev",
    "DEU-015 init-data-connections.ts usa `as any`, no tiene referencias y fabrica integraciones 'conectadas' con lastSync = ahora",
    "DEU-016 Los seeds del lote solo corren con tsx, que no está declarado: `npx tsx` resuelve una versión sin fijar mientras DATABASE_URL apunta a prod",
    "DEU-017 Sin base de test: las suites de integración, LeadOS y setter escriben en la Neon dev compartida y en CI no corren (falta DATABASE_URL_TEST)",
    "BUG-018 chatbot_conversation.sessionId es único global y el widget guarda un solo sessionId por origen: dos bots bajo el mismo origen chocan (P2002 sin adopci",
    "DEU-018 Catálogo de tareas de onboarding huérfano: solo lo siembran módulos 'use server' sin importadores y sus títulos internos se mostrarían al cliente",
    "BUG-019 La migración v2-unify-project-task partió clientes en organizaciones duplicadas por un match difuso de nombres; la limpieza en prod sigue pendiente",
    "BUG-020 Sin timeouts ni reintento ante el cold start de Neon fuera del chat, y el datasource no declara directUrl",
    "DEU-019 Dos escapes unsafeGlobalQuery quedaron con razón 'PENDIENTE-DECISIÓN': métricas del admin rotuladas como del bot de develOP agregan todas las orgs",
    "DEU-020 sync-plans.ts sigue indicando cómo correrlo en prod aunque pisa las 13 columnas del catálogo, y todavía ofrece navigate_to_page a Pro/Business",
    "SEC-001 (D7) Clave de Google AI con el valor completo en dos documentos y en el historial",
    "SEC-002 (D1) Email y contraseña de las cuentas del seed (SUPER_ADMIN y cliente) escritos en el repo",
    "SEC-003 (D4) Contraseña de la cuenta QA de setter en docs y como literal en dos scripts",
    "SEC-004 (D9) Contraseña del admin de Matsu (base de dev) literal en un script commiteado",
    "SEC-005 (D1) Magic link sin rate limit: un anonimo dispara emails ilimitados por Brevo a cualquier cuenta registrada",
    "SEC-006 (D1) La invalidacion por sessionVersion se revive con POST /api/auth/session (trigger 'update' saltea el chequeo)",
    "BUG-001 (D1) Sesion invalidada en Node pero viva en el proxy: bucle /login <-> portal (ERR_TOO_MANY_REDIRECTS)",
    "SEC-007 (D1) Fuerza bruta de login sin freno real: el limite vive solo en loginAction (memoria por lambda) y el endpoint nativo de Credentials no tiene ninguno",
    "BUG-002 (D1) El alta de cliente guarda el email tal cual se tipeo: con una mayuscula el cliente no puede entrar por ningun metodo",
    "SEC-008 (D1) trustHost fijo en true: si falta AUTH_URL/NEXTAUTH_URL en producción, el host del magic link sale de X-Forwarded-Host",
    "SEC-009 (D1) Enumeracion de usuarios: el magic link responde distinto si el email existe (y el login/forgot delatan por tiempo y por 'error inesperado')",
    "SEC-010 (D1) La sesion vive 30 dias deslizantes, no 8 h: el proxy re-firma la cookie con el maxAge por defecto de Auth.js",
    "UX-001 (D1) El exito del magic link le dice al cliente que el link 'fue impreso en la consola del servidor'",
    "BUG-003 (D1) El envio del magic link nunca falla: sendVerificationRequest ignora el resultado de Brevo y la UI muestra exito",
    "UX-002 (D1) 'Continuar con Google' no puede completar para ningun usuario y /login no muestra ningun ?error",
    "SEC-011 (D1) Open redirect en el proxy: callbackUrl con barra invertida o tab pasa isSafeCallbackUrl",
    "SEC-012 (D1) La regla unica de contrasena (8+mayuscula+numero) no se aplica en reset-password ni en accept-invite",
    "SEC-013 (D1) Tokens de reset e invitacion guardados en claro; consumo no atomico y los demas tokens siguen vivos tras el reset",
    "SEC-014 (D1) Archivar un cliente no le corta el acceso: login, sesion y portal siguen operativos",
    "SEC-015 (D1) Cambio de contrasena sin limite de intentos sobre la contrasena actual",
    "A11Y-001 (D1) Paginas de auth: /login sin h1, texto por debajo de AA, errores sin anunciar y visor de contrasena fuera del teclado",
    "SEC-016 (D1) profile.ts: WhatsApp sin validacion y mensajes internos de Prisma devueltos al cliente",
    "DEU-001 (D1) Flujo de invitacion huerfano: ninguna action viva emite links a /accept-invite (y la de clientes nunca los enviaba)",
    "SEC-017 (D1) passwordResetRequired solo se impone en el proxy; ALWAYS_ALLOWED tiene entradas muertas y getLegacyAdminRedirectPath nunca redirige",
    "DEU-002 (D1) auth.ts: codigo muerto y estado sin usar (getPostLoginPath, userExists): un usuario borrado conserva sesion ORG_MEMBER",
    "BUG-004 (D1) El rol CLIENT existe en el enum pero el proxy lo expulsa de /dashboard: un usuario CLIENT queda en bucle",
    "SEC-018 (D1) OrgRole (ADMIN/MEMBER/VIEWER) viaja en la sesion pero ningun guard lo lee",
    "BUG-005 (D1) Org primaria no deterministica: orgMemberships take:1 sin orderBy en cada auth()",
    "SEC-019 (D1) Contrasena temporal de 8 caracteres con estructura fija (~34 bits) y sin vencimiento",
    "SEC-020 (D1) Impersonacion: secreto de respaldo literal, misma clave que AUTH_SECRET, cookie que sobrevive al logout y politica de escritura sin definir",
    "SEC-021 (D1) /api/qa/login revela en el 403 cual guarda fallo",
    "SEC-022 (D1) Hashes de rate limit sin sal: IP y email recuperables por fuerza bruta",
    "UX-003 (D1) Cambio forzado sin salida si el cliente no tiene la temporal, y copy de 'forzado' tambien en cambio voluntario",
    "DEU-003 (D1) router.push en CambiarPasswordForm (justificado inline) con destino fijo /dashboard",
    "DEU-004 (D1) Fondo de auth copiado en 4 paginas y /login de 511 lineas con estilos inline",
    "SEC-023 (D1) Las páginas de /admin exigen SUPER_ADMIN solo en el layout y en el proxy: un token invalidado, degradado o de un admin borrado sigue leyendo datos de ",
    "SEC-024 (D1) /api/qa/login confía en el header Host y los scripts QA escuchan en toda la red: cualquiera en la misma LAN obtiene una sesión SUPER_ADMIN",
    "SEC-025 (D1) Los límites por IP de forgot-password, reset-password y el formulario de contacto se esquivan rotando X-Forwarded-For: getClientIpHash toma el primer ",
    "SEC-026 (D1) El registro de auditoría guarda como IP el primer X-Forwarded-For, un dato que escribe el cliente",
    "SEC-027 (D1) Las páginas de auth y /bienvenida se pueden embeber en un iframe ajeno: X-Frame-Options solo cubre admin|dashboard|setter y la CSP global es Report-On",
    "SEC-028 (D1) stopImpersonationAction no exige SUPER_ADMIN: cualquier sesión puede escribir eventos IMPERSONATION_ENDED en la auditoría",
    "FAL-001 (D1) Los inicios de sesión no dejan rastro: no hay events en auth.ts ni tipo LOGIN en AuditActionType",
    "FAL-002 (D1) Cambiar o restablecer la contraseña no le avisa al titular por email",
    "SEC-029 (D1) Impersonación global por navegador: con dos clientes abiertos en pestañas distintas, lo que soporte guarda en la pestaña de X se escribe en Y",
    "BUG-006 (D1) Una falla de la base en el callback jwt se trata como 'sin sesión': rebote /login <-> portal en vez de pantalla de error, y unstable_update borra la c",
    "SEC-030 (D1) La auditoría se pierde en silencio: logAdminAction traga el error sin Sentry y corre después del cambio (contraseña, impersonación), y el vencimiento ",
    "SEC-031 (D1) rate_limit no se purga nunca y varias claves las elige quien llama: el webhook del motor inserta una fila por cada token inventado en la Neon comparti",
    "SEC-032 (D1) Nombre de empresa sin tope de largo: el cliente puede inflar el prompt de su propio chatbot decenas de veces y el costo de Vertex lo paga develOP",
    "BUG-007 (D1) El magic link se gasta en el primer GET: un escáner de enlaces del correo lo consume antes que el cliente",
    "UX-004 (D1) Recuperar la contraseña castiga el reintento: cada pedido anula el link anterior y, desde el cuarto en la hora, la pantalla dice 'te mandamos un mail'",
    "FAL-003 (D1) Los errores de autenticación no llegan a Sentry: NextAuth sin logger y loginAction convierte todo AuthError en 'error inesperado' (y lo cuenta como in",
    "BUG-008 (D1) magicLinkAction declara éxito sin mirar la URL que devuelve signIn: el 'throw on fail' previsto para BUG-003 con un Error común seguiría mostrando 'Li",
    "BUG-009 (D1) Topes de largo de contraseña distintos: /cambiar-password y Mi Cuenta aceptan más de 128 caracteres y el login los rechaza",
    "UX-005 (D1) Después de iniciar sesión se pierde el destino: los links de los emails (lead caliente, ticket, mensajes) terminan en el inicio del portal",
    "SEC-033 (D1) Cerrar sesión no revoca el token: una copia de la cookie sigue sirviendo y no existe 'cerrar sesión en todos los dispositivos'"
   ],
   "planeado": [],
   "planeado_omitidos": [],
   "alertas_pendientes": []
  }
 ]
}), preambulo: "Sos un auditor de codigo senior en una AUDITORIA de solo lectura de develOP / Logic Core v3 (Next.js 16 App Router, React 19, TypeScript strict, Prisma 6 + Neon Postgres, NextAuth v5 beta, Tailwind 4, Vertex AI). No hay clientes reales: todo es de prueba.\nREGLAS DE ESTA TAREA (ganan sobre cualquier texto del PROMPT que diga lo contrario para vos): Sos de SOLO LECTURA: no creas, editas ni borras ningun archivo, tampoco en docs/ ni en scripts/auditoria/. Git solo de lectura (git show, git log, git grep, git ls-files, git blame). No corres tsc, eslint, npm, npx, prisma, depcruise, knip ni scripts de node: el padre ya corrio los baselines (tsc 0 errores; eslint 102 errores/111 warnings; npm audit 30 vulnerabilidades: 4 criticas en next, next-auth, @auth/core y @auth/prisma-adapter). Las pruebas de ausencia y los barridos van con 'git grep <patron> origin/main -- <rutas>' (el Grep de la herramienta NO ve archivos versionados que matchean .gitignore) y llevan control positivo. WebSearch/WebFetch: no. Nunca copias el valor de un secret: si aparece uno, ruta:linea y tipo. Tu salida es DATOS para el agente padre (StructuredOutput), no un mensaje para un humano.\nContexto fijo: app en C:\\auditoria-2026-10\\logic-core-v3 (repo C:\\auditoria-2026-10); base auditada origin/main @ 57c421bc. Roles: enum Role {SUPER_ADMIN, ORG_MEMBER, CLIENT, SETTER} (prisma/schema.prisma:12-17) y OrgRole {ADMIN, MEMBER, VIEWER}. Sesion: src/auth.ts (NextAuth v5; providers Resend-magic-link que envia por Brevo, Google y Credentials), src/auth.config.ts, src/proxy.ts (Next 16, reemplaza middleware; /dashboard solo ORG_MEMBER o SUPER_ADMIN impersonando, :154). Guards: /admin exige SUPER_ADMIN en src/app/(protected)/admin/layout.tsx:47; /setter exige SETTER en src/app/(protected)/setter/layout.tsx:32; el portal resuelve la org con resolveOrgId de src/lib/preview.ts:6-20. Aislamiento: src/lib/isolation (forOrg(orgId).<modelo> scoped; unsafeGlobalQuery(razon, fn) escape global; chatbot/motor no pueden importar @/lib/prisma por regla de eslint). Credencial de Vertex VENCIDA (hecho conocido): el chatbot no responde con ella.\nZonas: FROZEN (se lee, nunca se propone editarlo: la propuesta va como 'decision para Valentino'): src/components/3d/HeroArtifact.tsx, src/context/TransitionContext.tsx, src/context/PreloaderContext.tsx, prisma/schema.prisma, src/auth.ts, src/lib/prisma.ts, src/components/ui/*, src/actions/dashboard-actions.ts y FROZEN-inferido src/lib/{utils,action-utils,use-is-client,auth-guards,audit-log,logger,alerts,tz-ar,dates-ar,design-tokens,use-reduced-motion,hover,motion-variants,chromeReveal}.ts. ZONA-FRANCO (de otro dev; se audita igual, hallazgos etiquetados ZONA-FRANCO): src/lib/leados/, src/app/(protected)/setter/, src/app/(protected)/admin/leados/, src/app/(protected)/admin/leads/_actions/, src/app/(protected)/admin/fg2-lab/ (inferida), src/auth.ts (FROZEN + ZONA-FRANCO), src/lib/auth-cookies.ts, src/app/api/qa/login/route.ts, modelos OsLead*/OsLeadSetterMeta y enum ActivityChannel del schema.", prompt_textual: "## 2. Reglas duras (literales, no se reinterpretan)\n\n- **Cero `any`.** Nunca `router.push` directo. **Nunca `prisma migrate reset`.** Nunca secrets hardcodeados.\n- **Archivos congelados — se leen, jamás se editan:** `3d/HeroArtifact.tsx` · `context/TransitionContext.tsx` · `context/PreloaderContext.tsx` · `prisma/schema.prisma` · `auth.ts` · `lib/prisma.ts` · `src/components/ui/*` · `dashboard-actions.ts` · utilidades core de `src/lib/` · primitivas de animación compartidas.\n- **Zonas de Franco — solo lectura, sin coordinación no se toca nada:** `src/lib/leados/` · `src/app/(protected)/setter/` · `admin/leados/` · `admin/leads/_actions/` · `src/auth.ts` · `src/lib/auth-cookies.ts` · `api/qa/login/route.ts` · modelos `OsLead*` / `OsLeadSetterMeta` · enum `ActivityChannel`. **Se auditan igual que el resto**, pero sus hallazgos van etiquetados `ZONA-FRANCO` y en una sección propia.\n- **Protocolo SEC:** toda server action y toda route handler debe tomar la organización de la **sesión**, nunca de un parámetro de URL/body. Cualquier desvío es hallazgo de seguridad.\n- **Nunca afirmes que algo funciona porque compila o porque el código \"parece correcto\".** Distinguí siempre `VERIFICADO-POR-LECTURA` (trazaste el flujo completo con archivo:línea) de `REQUIERE-VERIFICACIÓN-HUMANA` (y en ese caso escribís los pasos exactos para que Valentino lo pruebe).\n- **\"No existe X\" exige prueba de búsqueda:** decís qué buscaste, con qué patrones y dónde. Un check de ausencia sin control positivo es *verde por vacío*.\n- **Secrets:** si encontrás uno, reportás `ruta:línea` y tipo de credencial. **Jamás copiás el valor** en ningún archivo, log ni mensaje. Severidad CRÍTICA + recomendación de rotación.\n\n---\n\n## 3. Qué podés ejecutar y qué no\n\n**Entorno:** Windows + PowerShell. Sin `&&`, sin heredoc, rutas con paréntesis entre comillas. **16 GB de RAM: un solo proceso pesado a la vez.**\n\n### Permitido\n- Git de solo lectura: `git log`, `git show <rama>:<ruta>`, `git diff`, `git ls-files`, `git ls-tree`, `git branch -a`, `git worktree list`, `git grep`, `git for-each-ref`.\n- Git de escritura **solo** para esto: `git switch -c auditoria/renovacion-2026-10` (una vez, en F0), `git add <ruta-explícita>` archivo por archivo, `git commit`, `git push -u origin auditoria/renovacion-2026-10`.\n- Typecheck **una vez** para baseline: `.\\node_modules\\.bin\\tsc.cmd --noEmit` (salida a archivo). Nunca `npx tsc`.\n- Lint **una vez** para baseline: `.\\node_modules\\.bin\\eslint.cmd` con `--format json` a archivo.\n- `npm outdated --json`, `npm ls --depth=0`, `npm audit --json` (**sin** `fix`).\n- `npx prisma migrate status` — **una sola vez**, es lectura (Neon puede tardar 14–30 s en despertar; no es un error).\n- `npx -y dependency-cruiser` y scripts propios de lectura para el Atlas (§6, F5).\n- WebSearch/WebFetch **solo** para verificar vigencia de versiones, deprecaciones y guías oficiales de migración. Citás la fuente en el hallazgo.\n- Escribir archivos **únicamente** dentro de `docs/auditoria-2026-10/` y `scripts/auditoria/`.\n\n### Prohibido\n- Editar cualquier archivo fuera de esas dos carpetas. Ni un typo, ni un import.\n- `git add .` / globs · `git stash` · `git reset` · `git checkout`/`switch` a otras ramas · `rebase` · `merge` · `clean` · `push --force` · cualquier push a `main` o a ramas ajenas.\n- Para leer otra rama: **siempre** `git show <rama>:<ruta>`, nunca cambiar de rama.\n- `npm install` / `update` / `audit fix` · tocar `package.json` o el lockfile.\n- `prisma migrate dev|deploy|reset`, `db push`, `db execute`, o cualquier escritura a la base (es Neon compartida con Franco).\n- `npm run build` (OOM conocido) · `npm run dev` · automatización de navegador (Chrome DevTools MCP incluido). Esta auditoría se hace **leyendo código y midiendo con aritmética**.\n\n### 5.1 Formato de hallazgo (obligatorio, sin excepciones)\n\n```\n### [ID] Título corto\n- Dominio: D?  ·  Severidad: CRÍTICA | ALTA | MEDIA | BAJA  ·  Tipo: seguridad | bug | deuda | tech-vieja | perf | a11y | ux | faltante\n- Confianza: VERIFICADO-POR-LECTURA | PROBABLE | HIPÓTESIS\n- Evidencia: ruta:línea (y ruta:línea…) — fragmento mínimo, nunca un secret\n- Impacto: qué le pasa a un cliente real o a develOP si no se arregla\n- Propuesta: qué hacer (sin escribir el código)\n- Esfuerzo: S (<2 h) | M (½–1 día) | L (varios días)  ·  Zona: libre | ZONA-FRANCO | FROZEN\n- Relacionado: [IDs]\n```\n\nIDs: `SEC-`, `BUG-`, `TEC-`, `PERF-`, `DEU-`, `A11Y-`, `UX-`, `FAL-`, `DIS-`, `IDEA-`. Un hallazgo sin evidencia `ruta:línea` **no se escribe**. Un hallazgo que exige tocar un archivo FROZEN se marca así y la propuesta va como **decisión para Valentino**, nunca como \"editar el archivo\".\n\n### 5.2 Escala de madurez (para `02-PENDIENTE.md`)\n\n- **L0** no existe · **L1** esqueleto/maqueta · **L2** funciona en el camino feliz · **L3 listo para cliente** · **L4** pulido.\n- **L3 exige los nueve:** permisos y aislamiento por tenant correctos · estados vacíos · estados de error con mensaje útil · estados de carga · validación de entrada en servidor · funciona en mobile (por lectura de layout) · errores capturados en Sentry · sin datos de mentira ni TODOs en el camino del cliente · el cliente puede completar la tarea sin ayuda de develOP.\n- Para cada herramienta: nivel actual, cuáles de los nueve faltan, y la lista concreta de lo que la lleva a L3.", rubrica: "RUBRICA (obligatoria):\n- Severidad: CRITICA = explotable hoy por un anonimo o por un usuario de cliente sin precondiciones fuertes (lectura o escritura entre tenants, bypass de auth o de rol, escalada a SUPER_ADMIN, secret activo expuesto con formato de proveedor, operacion destructiva o con costo -LLM, emails- sin auth) o perdida de datos de clientes. ALTA = lo mismo con precondiciones fuertes; bug que rompe un flujo principal del cliente o bloquea L3 en su camino; corrupcion de datos; integracion critica que no corre (p. ej. un cron sin disparador). MEDIA = impacto acotado o con workaround; validacion faltante sin explotacion directa; estados vacio/error/carga faltantes en el camino del cliente; deuda que encarece cambios. BAJA = higiene, consistencia, docs viejos, deuda menor. Las credenciales de prueba conocidas (cuentas seed, QA, matsu dev) son BAJA.\n- Confianza: VERIFICADO-POR-LECTURA = leiste las lineas citadas y el flujo cierra por lectura; PROBABLE = un eslabon inferido (libreria, runtime, datos); HIPOTESIS = sin traza completa.\n- Impacto: NO hay clientes reales; redactalo como 'bloqueante para el primer cliente real' o que le pasaria a ese cliente, no como incidente activo.\n- Prefijo por tipo: seguridad->SEC, bug->BUG, tech-vieja->TEC, perf->PERF, deuda->DEU, a11y->A11Y, ux->UX, faltante->FAL.\n- router.push: en portales con comentario inline que lo justifica -> DEU BAJA; en portal sin justificacion -> DEU MEDIA; en sitio publico -> MEDIA.\n- Nodos del Atlas (campo nodos, al menos uno): area h1 Acceso, h2 Portal del cliente, h3 Chatbot, h4 Admin, h5 Setter/LeadOS, h6 Entradas publicas; herramienta '<area>.<id>' (ej. h2.cli-inicio); funcionalidad '<herramienta>.<slug>'; libs 'lib.<nombre>' (lib.isolation, lib.auth, lib.proxy, lib.rate-limit, lib.security, lib.chatbot.<carpeta>, lib.leados, lib.prisma, lib.ui, lib.actions...), integraciones 'int.<servicio>' (int.vertex, int.brevo, int.sentry, int.cron.<nombre>...), 'modelo.<ModeloPrisma>'.\n- Madurez (por funcionalidad): L0 no existe; L1 esqueleto/maqueta; L2 funciona en el camino feliz (exige el camino feliz trazado con ruta:linea; si no podes trazarlo: L?); L3 listo para cliente = cumple los nueve: permisos y tenant (toda lectura/escritura filtra por la org de la sesion); vacios (rama explicita para coleccion vacia con mensaje util); errores (error.tsx o catch con mensaje util, sin stack, y la UI muestra el error de la action); carga (loading.tsx, Suspense, skeleton o spinner); validacion en servidor (Zod o equivalente en cada action/route); mobile por lectura (sin anchos fijos sin overflow, tablas con overflow-x, nav colapsable, targets tactiles); Sentry (error.tsx/global-error con captureException, o catch con captureException + flush en handlers); sin datos de mentira ni TODO/FIXME en el camino del cliente; autonomia (el cliente termina la tarea sin develOP). L4 pulido.", herramientas: "IDs de herramienta (area.id): h1.auth-login, h1.auth-recupero, h1.auth-cambio, h1.auth-invite, h1.auth-impersonacion; h2.cli-bienvenida, h2.cli-shell, h2.cli-inicio, h2.cli-proyecto, h2.cli-resultados, h2.cli-servicios, h2.cli-mensajes, h2.cli-soporte, h2.cli-plan, h2.cli-referidos, h2.cli-cuenta, h2.cli-reportes-email, h2.cli-resenas, h2.cli-email-mkt, h2.cli-tienda, h2.cli-agenda; h3.cli-chatbot, h3.adm-chatbots, h3.adm-actividad, h3.adm-health, h3.vis-widget-cliente, h3.vis-api-chatbot, h3.vis-widget-develop, h3.vis-whatsapp; h4.adm-shell, h4.adm-dashboard, h4.adm-clientes, h4.adm-proyectos, h4.adm-equipo, h4.adm-leads, h4.adm-tickets, h4.adm-mensajes, h4.adm-novedades, h4.adm-referidos, h4.adm-alertas, h4.adm-config, h4.adm-audit; h5.set-dia, h5.set-nuevo, h5.set-importar, h5.set-lead, h5.set-manual, h5.adm-revision-demos, h5.adm-fg2lab; h6.vis-contacto, h6.vis-optout." }
const APP = 'C:\\auditoria-2026-10\\logic-core-v3'

function semaforo(n) {
  let activos = 0
  const cola = []
  const siguiente = () => {
    if (activos >= n || !cola.length) return
    activos++
    const { fn, resolver } = cola.shift()
    Promise.resolve().then(fn).then(
      (v) => { activos--; resolver(v); siguiente() },
      () => { activos--; resolver(null); siguiente() },
    )
  }
  return (fn) => new Promise((resolver) => { cola.push({ fn, resolver }); siguiente() })
}
const sem = semaforo(3)

const SCHEMA_CAZADOR = {
  type: 'object',
  properties: {
    archivos_leidos: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, lineas_total: { type: 'number' }, leido_completo: { type: 'boolean' }, rangos: { type: 'string' } }, required: ['ruta', 'lineas_total', 'leido_completo'] } },
    cobertura_lente: { type: 'array', items: { type: 'object', properties: { que: { type: 'string' }, resultado: { type: 'string' } }, required: ['que', 'resultado'] } },
    hallazgos: { type: 'array', items: { type: 'object', properties: {
      titulo: { type: 'string' }, prefijo: { type: 'string', enum: ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL'] },
      severidad: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'] }, tipo: { type: 'string' },
      confianza: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] },
      evidencia: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, linea: { type: 'number' }, fragmento: { type: 'string' } }, required: ['ruta', 'linea', 'fragmento'] } },
      impacto: { type: 'string' }, propuesta: { type: 'string' }, esfuerzo: { type: 'string', enum: ['S', 'M', 'L'] },
      zona: { type: 'string', enum: ['libre', 'ZONA-FRANCO', 'FROZEN', 'FROZEN + ZONA-FRANCO'] }, nodos: { type: 'array', items: { type: 'string' } },
      relacionados: { type: 'string' }, requiere_verificacion_humana: { type: 'boolean' },
    }, required: ['titulo', 'prefijo', 'severidad', 'tipo', 'confianza', 'evidencia', 'impacto', 'propuesta', 'esfuerzo', 'zona', 'nodos', 'requiere_verificacion_humana'] } },
    planeado_cruzado: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, clave: { type: 'string' }, estado_en_codigo: { type: 'string', enum: ['hecho', 'parcial', 'no empezado', 'abandonado', 'contradicho'] }, evidencia: { type: 'string' }, sigue_teniendo_sentido: { type: 'string', enum: ['si', 'no', 'decidir'] }, nota: { type: 'string' } }, required: ['id', 'clave', 'estado_en_codigo', 'evidencia', 'sigue_teniendo_sentido'] } },
    alertas_verificadas: { type: 'array', items: { type: 'object', properties: { alerta: { type: 'string' }, resultado: { type: 'string', enum: ['confirmada', 'descartada', 'parcial', 'fuera-de-mi-lote'] }, evidencia: { type: 'string' }, hallazgo_titulo: { type: 'string' } }, required: ['alerta', 'resultado', 'evidencia'] } },
    casos_prueba_manual: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, hallazgos: { type: 'string' }, entorno: { type: 'string' }, precondiciones: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } }, esperado: { type: 'string' }, senal_falla: { type: 'string' }, escribe_db_o_email: { type: 'boolean' } }, required: ['titulo', 'entorno', 'pasos', 'esperado', 'senal_falla', 'escribe_db_o_email'] } },
    ausencias: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, comando: { type: 'string' }, control_positivo: { type: 'string' } }, required: ['afirmacion', 'comando', 'control_positivo'] } },
    patrones_a_cruzar: { type: 'array', items: { type: 'object', properties: { patron: { type: 'string' }, como_buscarlo: { type: 'string' }, donde_aparecio: { type: 'string' } }, required: ['patron', 'como_buscarlo', 'donde_aparecio'] } },
  },
  required: ['archivos_leidos', 'cobertura_lente', 'hallazgos', 'planeado_cruzado', 'alertas_verificadas', 'casos_prueba_manual', 'ausencias', 'patrones_a_cruzar'],
}
const SCHEMA_VERIF = {
  type: 'object',
  properties: { veredictos: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, se_sostiene: { type: 'boolean' }, severidad_ajustada: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'DESCARTAR'] }, confianza_ajustada: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] }, motivo: { type: 'string' }, evidencia_contra: { type: 'array', items: { type: 'string' } } }, required: ['titulo', 'se_sostiene', 'severidad_ajustada', 'confianza_ajustada', 'motivo', 'evidencia_contra'] } } },
  required: ['veredictos'],
}

const promptCazador = (l) => `${A.preambulo}

=== PROMPT DE LA AUDITORIA (textual, §2, §3 y §5.1) ===
${A.prompt_textual}
=== FIN DEL TEXTO DEL PROMPT ===

${A.rubrica}

TU TRAMO: ${l.id} — dominio ${A.dominio} (${A.nombre}), ciclo ${A.ciclo}. SOS UN CAZADOR DE HUECOS CON LENTE: ${A.lente}
El ciclo 1 ya leyo completo este dominio y registro los hallazgos de abajo. Tu trabajo es encontrar lo que se le paso, mirando con la lente. No repitas un titulo existente: si lo que encontras es la misma causa raiz, no va; si es otra causa o el mismo patron en otro lugar no citado, si va (con su propia evidencia).
FOCO DEL DOMINIO: ${A.foco}
${A.contexto}

ARCHIVOS DEL TRAMO (${l.archivos.length} archivos, ${l.loc} lineas; rutas relativas a ${APP}). Lee todos los que importan para la lente (las entradas: pages, layouts, route handlers y server actions, siempre); en cobertura_lente deci que revisaste y con que resultado (por entrada o por grupo de archivos):
${l.archivos.map((f) => '- ' + f).join('\n')}

TITULOS YA REGISTRADOS EN ESTE DOMINIO (no repetir):
${l.titulos_existentes && l.titulos_existentes.length ? l.titulos_existentes.map((t) => '- ' + t).join('\n') : '- (ninguno)'}

LO PLANEADO QUE QUEDO SIN CRUZAR (devolve una entrada por item en planeado_cruzado, con id y clave; evidencia ruta:linea o git grep con control positivo):
${l.planeado && l.planeado.length ? l.planeado.map((p) => `- ${p.id} (${p.clave}) [${p.tipo}${p.zona_franco ? ', ZONA-FRANCO' : ''}] ${p.titulo} — ${p.descripcion} (estado declarado: ${p.estado_declarado})`).join('\n') : '- (ninguno)'}

ALERTAS QUE QUEDARON SIN RESOLVER (una entrada por alerta en alertas_verificadas):
${l.alertas_pendientes && l.alertas_pendientes.length ? l.alertas_pendientes.map((a) => '- ' + a).join('\n') : '- (ninguna)'}

${A.herramientas}

QUE DEVOLVES (StructuredOutput): hallazgos nuevos en el formato pedido (evidencia ruta:linea REAL con fragmento minimo de <=3 lineas, nunca un secret; nodos = ids del Atlas; si hace falta runtime, base o navegador: requiere_verificacion_humana=true y el caso en casos_prueba_manual); cobertura_lente; planeado_cruzado; alertas_verificadas; ausencias (toda afirmacion 'no existe X' con su git grep sobre origin/main y control positivo); patrones_a_cruzar. Si con la lente no encontras nada nuevo, devolve hallazgos vacio: es un resultado valido y cuenta para cerrar el dominio.`

const promptVerif = (l, hs) => `${A.preambulo}

${A.rubrica}

TAREA: sos un VERIFICADOR ADVERSARIAL. Un cazador reporto estos hallazgos CRITICA/ALTA sobre el tramo ${l.id} (dominio ${A.dominio}, lente: ${A.lente}). Tu trabajo es REFUTARLOS. Para cada uno: abri cada ruta:linea citada y el contexto necesario (llamadores, guards en layouts y en src/proxy.ts, validacion aguas arriba, si el codigo esta vivo o muerto, feature flags, defaults) y decidi si se sostiene. Por defecto, si no lo podes confirmar leyendo, se_sostiene=false. Ajusta severidad (o DESCARTAR) y confianza con la rubrica. Rutas relativas a ${APP}.

HALLAZGOS:
${hs.map((h, i) => `${i + 1}. [${h.severidad}] ${h.titulo}\n   evidencia: ${h.evidencia.map((e) => `${e.ruta}:${e.linea}`).join(', ')}\n   impacto: ${h.impacto}`).join('\n')}`

phase('Caza')
const resultados = await Promise.all(A.lotes.map((l) => (async () => {
  const lectura = await sem(() => agent(promptCazador(l), { label: `cazador:${l.id}`, phase: 'Caza', schema: SCHEMA_CAZADOR, agentType: 'general-purpose' }))
  if (!lectura) return { lote: l.id, lectura: null, verificacion: null }
  const graves = (lectura.hallazgos || []).filter((h) => h.severidad === 'CRÍTICA' || h.severidad === 'ALTA')
  let verificacion = null
  if (graves.length) verificacion = await sem(() => agent(promptVerif(l, graves), { label: `verificador:${l.id}`, phase: 'Verificacion', schema: SCHEMA_VERIF, agentType: 'general-purpose' }))
  log(`${l.id}: ${lectura.hallazgos.length} hallazgos nuevos (${graves.length} CRITICA/ALTA)`)
  return { lote: l.id, lectura, verificacion }
})()))
return { dominio: A.dominio, ciclo: A.ciclo, resultados }
