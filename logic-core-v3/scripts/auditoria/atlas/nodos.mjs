// Auditoría de renovación 2026-10 — Atlas: mapeo de una ruta del repo a su nodo.
//
// Contrato de IDs (DEC-40, ENMIENDA-01 E7): áreas `h1`…`h6`; herramienta
// `<área>.<id>`; funcionalidad `<herramienta>.<slug>` (las emiten los lectores);
// `lib.<nombre>`, `modelo.<Modelo>`, `int.<servicio>`, `rama.<nombre>`, `doc.<ruta>`.
// Los IDs son estables: si una ruta cambia de carpeta, su nodo NO se renombra; se
// agrega una regla.
//
// Portable: solo JavaScript, sin imports de src/ ni dependencias. La ruta puede venir
// relativa a la raíz del repo («logic-core-v3/src/…») o a la app («src/…»).

export const AREAS = {
  h1: 'Acceso',
  h2: 'Portal del cliente',
  h3: 'Chatbot centralizado',
  h4: 'Panel de admin',
  h5: 'Setter y LeadOS',
  h6: 'Entradas públicas que alimentan lo interno',
}

// Herramientas de §6 del plan: id → [área, nombre].
export const HERRAMIENTAS = {
  'auth-login': ['h1', 'Login (contraseña, magic link, Google)'],
  'auth-recupero': ['h1', 'Olvidé / restablecer contraseña'],
  'auth-cambio': ['h1', 'Cambio obligatorio de contraseña'],
  'auth-invite': ['h1', 'Aceptar invitación'],
  'auth-impersonacion': ['h1', 'Ver como cliente (impersonación)'],
  'cli-bienvenida': ['h2', 'Bienvenida / onboarding inicial'],
  'cli-shell': ['h2', 'Shell del portal (sidebar, notificaciones, novedades)'],
  'cli-inicio': ['h2', 'Inicio'],
  'cli-proyecto': ['h2', 'Mi proyecto'],
  'cli-resultados': ['h2', 'Resultados'],
  'cli-servicios': ['h2', 'Mis servicios y módulos'],
  'cli-mensajes': ['h2', 'Mensajes'],
  'cli-soporte': ['h2', 'Soporte'],
  'cli-plan': ['h2', 'Mi plan'],
  'cli-referidos': ['h2', 'Recomendá y ganá'],
  'cli-cuenta': ['h2', 'Mi cuenta'],
  'cli-reportes-email': ['h2', 'Reportes por email'],
  'cli-resenas': ['h2', 'Motor de reseñas (módulo)'],
  'cli-email-mkt': ['h2', 'Email marketing (módulo)'],
  'cli-tienda': ['h2', 'Tienda online (módulo)'],
  'cli-agenda': ['h2', 'Agenda inteligente (módulo)'],
  'cli-chatbot': ['h3', 'Mi chatbot (cliente)'],
  'adm-chatbots': ['h3', 'Chatbots (admin)'],
  'adm-actividad': ['h3', 'Actividad global de chatbots'],
  'adm-health': ['h3', 'Health de chatbots'],
  'vis-widget-cliente': ['h3', 'Widget embebible en el sitio del cliente'],
  'vis-api-chatbot': ['h3', 'API pública del chatbot'],
  'vis-widget-develop': ['h3', 'Widget de develOP en el sitio público'],
  'vis-whatsapp': ['h3', 'Canal WhatsApp (motor)'],
  'adm-shell': ['h4', 'Shell del admin'],
  'adm-dashboard': ['h4', 'Dashboard del admin'],
  'adm-clientes': ['h4', 'Clientes'],
  'adm-proyectos': ['h4', 'Proyectos'],
  'adm-equipo': ['h4', 'Equipo'],
  'adm-leads': ['h4', 'Leads'],
  'adm-tickets': ['h4', 'Tickets'],
  'adm-mensajes': ['h4', 'Mensajes (admin)'],
  'adm-novedades': ['h4', 'Novedades'],
  'adm-referidos': ['h4', 'Referidos (admin)'],
  'adm-alertas': ['h4', 'Alertas'],
  'adm-config': ['h4', 'Configuración'],
  'adm-audit': ['h4', 'Audit log'],
  'set-dia': ['h5', 'Tu día (setter)'],
  'set-nuevo': ['h5', 'Cargar un prospecto'],
  'set-importar': ['h5', 'Importar prospectos'],
  'set-lead': ['h5', 'Ficha del lead'],
  'set-manual': ['h5', 'Manual del lead'],
  'adm-revision-demos': ['h5', 'Revisión de demos (LeadOS)'],
  'adm-fg2lab': ['h5', 'FG-2 Lab (experimento)'],
  'vis-contacto': ['h6', 'Formulario de contacto público'],
  'vis-optout': ['h6', 'Baja de emails de marketing'],
  'vis-sitio': ['h6', 'Chrome del sitio público (menú mobile, scroll y transición; alcance superficial)'],
}

export const herramienta = (id) => `${HERRAMIENTAS[id][0]}.${id}`

const ADMIN = {
  clients: 'adm-clientes', projects: 'adm-proyectos', team: 'adm-equipo', leads: 'adm-leads', tickets: 'adm-tickets',
  messages: 'adm-mensajes', announcements: 'adm-novedades', referrals: 'adm-referidos', alerts: 'adm-alertas',
  settings: 'adm-config', 'audit-log': 'adm-audit', chatbots: 'adm-chatbots', leados: 'adm-revision-demos', 'fg2-lab': 'adm-fg2lab',
}
const DASH = {
  project: 'cli-proyecto', resultados: 'cli-resultados', services: 'cli-servicios', messages: 'cli-mensajes',
  soporte: 'cli-soporte', plan: 'cli-plan', referidos: 'cli-referidos', cuenta: 'cli-cuenta', chatbot: 'cli-chatbot',
}
const MODULOS = { 'motor-resenas': 'cli-resenas', 'email-marketing': 'cli-email-mkt', 'tienda-conectada': 'cli-tienda', 'agenda-inteligente': 'cli-agenda' }
const LIB_ACTIONS = {
  clients: 'adm-clientes', projects: 'adm-proyectos', leads: 'adm-leads', 'leads-constants': 'adm-leads', settings: 'adm-config',
  services: 'adm-config', contact: 'vis-contacto', referrals: 'cli-referidos', upsell: 'cli-servicios', notifications: 'cli-shell',
  profile: 'cli-cuenta', invitations: 'auth-invite', impersonation: 'auth-impersonacion', 'gbp-connection': 'cli-resenas',
  announcements: 'cli-shell', messages: 'cli-mensajes',
}
const INTEGRACIONES = {
  'brevo': 'brevo', 'cal-com': 'cal-com', 'cal-com-v2': 'cal-com', 'gbp-connection': 'gbp', 'gbp-connection-logic': 'gbp', 'gbp-discovery': 'gbp',
  'google-business-profile': 'gbp', 'pagespeed': 'pagespeed', 'tiendanube': 'tiendanube',
}

const slug = (s) => s.toLowerCase().replace(/\.(tsx?|jsx?|mjs|cjs|json|md|toml|ya?ml|prisma|css)$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Devuelve el id de nodo más específico para una ruta del repo. */
export function nodoDeRuta(rutaEntrada) {
  let r = rutaEntrada.replace(/\\/g, '/')
  if (r.startsWith('.github/workflows/')) return 'lib.plataforma.ci'
  if (r.startsWith('logic-core-v3/')) r = r.slice('logic-core-v3/'.length)
  else if (!/^(src|prisma|scripts|tests|docs|public|netlify)\//.test(r) && !/^[^/]+\.[a-z]+$/.test(r)) return `lib.raiz-repo.${slug(r)}`
  let m

  // App Router
  if ((m = r.match(/^src\/app\/\(protected\)\/admin\/chatbot\/(activity|health)\//))) return herramienta(m[1] === 'activity' ? 'adm-actividad' : 'adm-health')
  if ((m = r.match(/^src\/app\/\(protected\)\/admin\/([^/]+)\//)) && ADMIN[m[1]]) return herramienta(ADMIN[m[1]])
  if (/^src\/app\/\(protected\)\/admin\/(_components\/|layout|loading|error)/.test(r)) return herramienta('adm-shell')
  if (/^src\/app\/\(protected\)\/admin\/page\.tsx$/.test(r)) return herramienta('adm-dashboard')
  if ((m = r.match(/^src\/app\/\(protected\)\/dashboard\/modules\/([^/]+)\//)) && MODULOS[m[1]]) return herramienta(MODULOS[m[1]])
  if ((m = r.match(/^src\/app\/\(protected\)\/dashboard\/([^/]+)\//)) && DASH[m[1]]) return herramienta(DASH[m[1]])
  if (/^src\/app\/\(protected\)\/dashboard\/(page\.tsx|_actions\/)/.test(r)) return herramienta('cli-inicio')
  if (/^src\/app\/\(protected\)\/dashboard\//.test(r)) return herramienta('cli-shell')
  if (/^src\/app\/\(protected\)\/setter\/nuevo\/importar\//.test(r)) return herramienta('set-importar')
  if (/^src\/app\/\(protected\)\/setter\/nuevo\//.test(r)) return herramienta('set-nuevo')
  if (/^src\/app\/\(protected\)\/setter\/leads\/[^/]+\/manual\//.test(r)) return herramienta('set-manual')
  if (/^src\/app\/\(protected\)\/setter\/leads\//.test(r)) return herramienta('set-lead')
  if (/^src\/app\/\(protected\)\/setter\//.test(r)) return herramienta('set-dia')
  if (/^src\/app\/login\//.test(r) || /^src\/app\/api\/auth\/\[\.\.\.nextauth\]\//.test(r) || /^src\/app\/api\/qa\/login\//.test(r)) return herramienta('auth-login')
  if (/^src\/app\/(forgot-password|reset-password)\//.test(r)) return herramienta('auth-recupero')
  if (/^src\/app\/cambiar-password\//.test(r)) return herramienta('auth-cambio')
  if (/^src\/app\/accept-invite\//.test(r)) return herramienta('auth-invite')
  if (/^src\/app\/bienvenida\//.test(r)) return herramienta('cli-bienvenida')
  if (/^src\/app\/embed\//.test(r)) return herramienta('vis-widget-cliente')
  if (/^src\/app\/contact\//.test(r)) return herramienta('vis-contacto')
  if (/^src\/app\/api\/chatbot\//.test(r)) return herramienta('vis-api-chatbot')
  if (/^src\/app\/api\/admin\/chatbot\//.test(r)) return herramienta('adm-chatbots')
  if (/^src\/app\/api\/dashboard\/chatbot\//.test(r)) return herramienta('cli-chatbot')
  if (/^src\/app\/api\/motor\//.test(r)) return herramienta('vis-whatsapp')
  if (/^src\/app\/api\/email\/optout\//.test(r)) return herramienta('vis-optout')
  if (/^src\/app\/api\/email\/unsubscribe-executive\//.test(r)) return herramienta('cli-reportes-email')
  if (/^src\/app\/api\/auth\/google-business\//.test(r)) return 'int.gbp'
  if (/^src\/app\/api\/auth\/tiendanube\//.test(r)) return 'int.tiendanube'
  if (/^src\/app\/api\/cron\/os-follow-up\//.test(r)) return 'lib.leados'
  if ((m = r.match(/^src\/app\/api\/cron\/([^/]+)\//))) return `int.cron.${m[1]}`
  if (/^src\/app\/api\/admin\/clients\//.test(r)) return herramienta('adm-clientes')
  if (/^src\/app\/api\/admin\/(alerts|reports)\//.test(r)) return herramienta('adm-config')
  if (/^src\/app\/api\/admin\/users\//.test(r)) return herramienta('adm-clientes')
  if (/^src\/app\/api\/(dashboard\/leads|reports)\//.test(r)) return herramienta(r.includes('/reports/') ? 'cli-resultados' : 'cli-inicio')
  if (/^src\/app\/api\/(test-sentry|dev)\//.test(r)) return 'int.sentry'
  if (/^src\/app\/api\/track\//.test(r)) return 'int.tracking'
  if (/^src\/app\/api\/version\//.test(r)) return 'lib.plataforma.version'
  if (/^src\/app\/(layout|error|global-error|not-found)\.tsx$|^src\/app\/globals\.css$/.test(r)) return 'lib.plataforma.app-raiz'
  if (/^src\/app\//.test(r)) return 'lib.sitio-publico'

  // Componentes
  if (/^src\/components\/ui\//.test(r)) return 'lib.ui'
  if ((m = r.match(/^src\/components\/dashboard\/modules\/([^/]+)\//)) && MODULOS[m[1]]) return herramienta(MODULOS[m[1]])
  if (/^src\/components\/dashboard\/home\//.test(r)) return herramienta('cli-inicio')
  if (/^src\/components\/dashboard\/results\//.test(r)) return herramienta('cli-resultados')
  if (/^src\/components\/dashboard\/plan\//.test(r)) return herramienta('cli-plan')
  if (/^src\/components\/dashboard\//.test(r)) return 'lib.componentes-dashboard'
  if (/^src\/components\/(admin|onboarding)\//.test(r)) return herramienta('adm-clientes')
  if (/^src\/components\/layout\/(ChatWidgetMount|useChromeRevealed)\./.test(r)) return herramienta('vis-widget-develop')
  if (/^src\/components\/sections\/home\/Footer\.tsx$/.test(r)) return herramienta('vis-contacto')
  if (/^src\/components\//.test(r)) return 'lib.sitio-publico'

  // Módulos
  if (/^src\/modules\/motor\//.test(r)) return herramienta('vis-whatsapp')
  if (/^src\/modules\/chatbot\/components\/admin\//.test(r)) return herramienta('adm-chatbots')
  if (/^src\/modules\/chatbot\/components\/(dashboard|dashboards)\//.test(r)) return herramienta('cli-chatbot')
  if (/^src\/modules\/chatbot\/components\//.test(r)) return herramienta('vis-widget-cliente')
  if ((m = r.match(/^src\/modules\/chatbot\/server\/admin\/(hardDeleteClient|archiveClient|updateClient|updateClientInternalNotes)\./))) return herramienta('adm-clientes')
  if (/^src\/modules\/chatbot\/server\/admin\/manageAlerts\./.test(r)) return herramienta('adm-alertas')
  if ((m = r.match(/^src\/modules\/chatbot\/server\/([^/]+)\//))) return `lib.chatbot.${m[1]}`
  if ((m = r.match(/^src\/modules\/chatbot\/(evals|prisma|hooks|lib|shared|templates)\//))) return `lib.chatbot.${m[1]}`
  if (/^src\/modules\/chatbot\//.test(r)) return 'lib.chatbot'

  // Lib
  if (/^src\/lib\/leados\//.test(r) || /^src\/lib\/(os-commercial|leados-ui|follow-up)\.ts$/.test(r)) return 'lib.leados'
  if ((m = r.match(/^src\/lib\/actions\/([^/.]+)\.ts$/)) && LIB_ACTIONS[m[1]]) return herramienta(LIB_ACTIONS[m[1]])
  if ((m = r.match(/^src\/lib\/integrations\/([^/.]+)/)) && INTEGRACIONES[m[1]]) return `int.${INTEGRACIONES[m[1]]}`
  if (/^src\/lib\/(email|email\/|emails?)/.test(r) || /^src\/emails\//.test(r)) return 'int.email'
  if (/^src\/lib\/searchconsole\.ts$/.test(r)) return 'int.search-console'
  if (/^src\/lib\/analytics\.ts$/.test(r)) return 'int.ga4'
  if (/^src\/lib\/sentry\//.test(r) || /^src\/instrumentation(-client)?\.ts$/.test(r)) return 'int.sentry'
  if (/^src\/lib\/notifications\/telegram\.ts$/.test(r)) return 'int.telegram'
  if (/^src\/lib\/n8n\.ts$/.test(r)) return 'int.n8n'
  if (/^src\/lib\/cron\//.test(r)) return 'int.cron'
  if (/^src\/lib\/ai\/(results-insights|review-reply-draft)\.ts$/.test(r)) return 'int.anthropic'
  if (/^src\/lib\/ai\//.test(r)) return herramienta('cli-inicio')
  if (/^src\/lib\/(dashboard|recommendations)\//.test(r)) return herramienta('cli-inicio')
  if (/^src\/lib\/reports\/client-monthly\//.test(r) || /^src\/lib\/reports\/MonthlyReport/.test(r)) return herramienta('cli-resultados')
  if (/^src\/lib\/reports\//.test(r)) return herramienta('cli-reportes-email')
  if (/^src\/lib\/(referrals)\//.test(r)) return herramienta('cli-referidos')
  if (/^src\/lib\/(tickets)\//.test(r)) return herramienta('cli-soporte')
  if (/^src\/lib\/(billing)\//.test(r)) return herramienta('cli-plan')
  if (/^src\/lib\/(modules|upsell)\//.test(r)) return herramienta('cli-servicios')
  if (/^src\/lib\/announcements\//.test(r)) return herramienta('cli-shell')
  if (/^src\/lib\/client-notifications\//.test(r)) return 'lib.chatbot.notifications'
  if (/^src\/lib\/onboarding\/core\.ts$/.test(r)) return herramienta('adm-clientes')
  if (/^src\/lib\/(impersonation|impersonation-constants)\.ts$/.test(r)) return herramienta('auth-impersonacion')
  if (/^src\/lib\/(auth\/|auth-guards\.ts|auth-cookies\.ts)/.test(r) || /^src\/(auth|auth\.config)\.ts$/.test(r) || /^src\/types\/next-auth/.test(r)) return 'lib.auth'
  if (/^src\/proxy\.ts$/.test(r)) return 'lib.proxy'
  if ((m = r.match(/^src\/lib\/([^/]+)\//))) return `lib.${slug(m[1])}`
  if ((m = r.match(/^src\/lib\/([^/]+)$/))) return `lib.${slug(m[1])}`
  if (/^src\/actions\//.test(r)) return 'lib.actions'
  if (/^src\/(hooks|types|context)\//.test(r)) return `lib.${slug(r.split('/')[1])}`

  // Fuera de src
  if (/^prisma\/schema\.prisma$/.test(r) || /^prisma\/migrations\//.test(r) || /^prisma\.config\.ts$/.test(r)) return 'lib.prisma'
  if (/^prisma\//.test(r)) return 'lib.prisma.seeds'
  if (/^public\/(widget\.js|test-widget\.html)$/.test(r)) return herramienta('vis-widget-cliente')
  if (/^public\//.test(r)) return 'lib.sitio-publico'
  if (/^netlify\//.test(r)) return 'int.cron'
  if (/^scripts\//.test(r)) return 'lib.scripts'
  if (/^tests\//.test(r)) return 'lib.tests'
  if (/^docs\//.test(r)) return `doc.${slug(r.slice('docs/'.length))}`
  if (/\.md$/.test(r)) return `doc.${slug(r)}`
  return `lib.plataforma.${slug(r)}`
}

export const nodoDeRama = (nombre) => `rama.${slug(nombre)}`
export const nodoDeModelo = (modelo) => `modelo.${modelo}`
