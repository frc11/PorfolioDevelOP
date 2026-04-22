develOP — CLAUDE.md
v2 — generado con context dump real del proyecto
Stack
Next.js 16 App Router · TypeScript estricto (cero any) · Tailwind CSS 4
Carpeta: PorfolioDevelOP/logic-core-v3/ · Deploy: Netlify
Reglas absolutas — nunca romper

src/components/3d/HeroArtifact.tsx es INTOCABLE. Nunca modificar.
Navegación: siempre triggerTransition(). Nunca router.push() directo.
TypeScript: cero any. Tipos explícitos siempre.
Íconos Lucide: strokeWidth={1.5} sin excepción.
Elementos decorativos: pointer-events: none.
Animaciones complejas: will-change: transform.
Backdrop filter: -webkit-backdrop-filter siempre junto a backdrop-filter.
Scope de sprint: nunca tocar archivos fuera del sprint. Si hay duda, preguntar.
Al terminar un sprint: avisar y esperar confirmación antes de continuar.

Estructura de rutas clave
src/
├── actions/                          # Server Actions UI (task-approvals, ticket-actions, onboarding)
├── lib/actions/                      # Server Actions Data/CRUD (projects, services, leads, notifications)
├── lib/prisma.ts                     # Cliente Prisma — instancia única con globalThis
├── context/
│   ├── PreloaderContext.tsx          # Fases: drawing → filling → text → done
│   └── TransitionContext.tsx         # Transiciones de ruta + scroll suave (Lenis)
├── components/
│   ├── 3d/HeroArtifact.tsx          # INTOCABLE
│   ├── dashboard/                    # SidebarNav, NotificationCenter, LeakMeter, DashboardLayoutClient
│   ├── sections/home/OurServices.tsx # Todas las simulaciones en un solo archivo
│   └── ui/                           # CustomCursor, NoiseOverlay, Preloader, primitivas
└── app/
    ├── (protected)/dashboard/        # Portal cliente (ORG_MEMBER)
    ├── (protected)/admin/            # Panel admin (SUPER_ADMIN)
    ├── (onboarding)/                 # Flujo de bienvenida
    ├── api/                          # Webhooks n8n, Auth
    └── [web-development|ai-implementations|process-automation|software-development]/
OurServices — arquitectura real
Archivo: src/components/sections/home/OurServices.tsx
Todos los sub-componentes viven en el mismo archivo.
SimProps interface:
tsinterface SimProps {
  isActive: boolean
  progress: number
  color: string
}
Tab activo: useState<number> (índice del array)
Loop: requestAnimationFrame dentro de useEffect
Pausa: IntersectionObserver cuando no está en viewport
Transiciones: AnimatePresence mode="wait"
ServicioColorSimsWeb Dev#06b6d4SimSEO, SimAnalytics, SimLeads, SimMapsIA#8b5cf6SimChat, SimLeadsIA, SimAgenda, SimMetricasAutomation#10b981SimFlujo, SimFollowUp, SimReporte, SimSyncSoftware#f59e0bSimCRM, SimDashboard, SimStock, SimEquipo
Portal cliente — estado real de secciones
Base: src/app/(protected)/dashboard/
SecciónLíneasEstadosoporte/73Thin — necesita estéticafacturacion/341Implementadaanalytics/374Implementadaseo/492Implementadaautomations/477Implementadaprofile/267Implementadanotificaciones/51Thin — necesita estética
Módulos Premium (rutas dedicadas, ~150–250 líneas c/u):
whatsapp/, crm/, ecommerce/, agenda/ y más — implementados con LockedView/UnlockedView.
Prisma
Cliente: src/lib/prisma.ts — instancia única con patrón globalThis (dev-safe)
Schema: ~615 líneas
Modelos clave: Organization (central), Project, Task (con ApprovalStatus), Ticket, OsLead (prospección interna de la agencia)
Glassmorphism — estándar de simulaciones
tsbackground: 'rgba(255,255,255,0.04)'
backdropFilter: 'blur(20px) saturate(180%)'
WebkitBackdropFilter: 'blur(20px) saturate(180%)'
border: '1px solid rgba(255,255,255,0.08)'
borderRadius: '12px'
Animaciones — valores exactos
ts// Ease premium
[0.25, 0.46, 0.45, 0.94]

// Spring UI / dock
{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }

// Spring íconos
{ type: 'spring', stiffness: 400, damping: 15 }

// Reveal estándar
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
Íconos en simulaciones
tssize={13}         // dentro de simulaciones
strokeWidth={1.5} // siempre
Copy
Español rioplatense (vos, dormís). Sin jerga técnica. Métricas en bold: $X USD, +X%.
Workflow de sprints

Un objetivo por sprint. Nunca mezclar responsabilidades.
/clear antes de cada nuevo grupo. No entre sprints del mismo grupo.
Especificar siempre el archivo exacto.
"Output only the changed code. No explanation." salvo que se pida explícitamente.