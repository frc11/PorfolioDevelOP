# develOP — Equipo: registro de cambios (cierre de etapa)

Cierre del módulo **Equipo** del panel admin (Logic Core v3). Capacidad operativa del equipo: tareas activas por miembro, tiempo invertido, y carga de horas. Comparte el CRUD de `OsTask`/`OsTimeEntry` con Proyectos vía `team/_actions/*` (son inseparables — ver §6). Repo: github.com/frc11/PorfolioDevelOP · app: `logic-core-v3/`. Fecha de cierre: 17 de junio de 2026\.

**Alcance.** Este registro cubre el trabajo de Equipo de la 2ª tanda de Operaciones: el fix del bug de horas (autorización), el rediseño jerárquico del display, y el ajuste de hover. El CRUD base de Task/TimeEntry y el kanban de Proyectos están en el registro de Proyectos.

---

## 1\. Bug de horas — registro contra el usuario equivocado (autorización)

**Bug detectado:** el admin (develop) pudo registrar horas que correspondían a otro usuario (Franco). Un usuario podía cargar horas en tareas que no eran suyas. Esto es un problema de autorización, no cosmético.

**Regla de negocio definida (la correcta, decidida por Valentino):** un usuario solo puede registrar horas en tareas asignadas **a él mismo**; nadie registra horas en nombre de otro.

| SHA | Qué resolvió |
| :---- | :---- |
| `08af3ae` | **(1ª ronda)** La time entry SIEMPRE se registra contra `session.user.id`; se valida server-side que la tarea pertenezca/esté asignada a ese usuario antes de crear la entry. Tarea de otro → rechazada con error claro (no se crea). Lectura estricta: las tareas **sin asignar** (`assignedToId = null`) también se rechazaban. |
| `a64d36b` | **(2ª ronda)** Refinamiento de la regla de borde. El selector de "Carga rápida de horas" muestra SOLO: tareas asignadas al usuario de la sesión \+ tareas **sin asignar**; nunca las de otro. Registrar horas en una tarea sin asignar la **autoasigna** al usuario de la sesión (`assignedToId = session.user.id`) en la misma operación \+ crea la entry — porque si la está trabajando, es suya. |

**Regla final clavada:** time entry siempre contra `session.user.id`; validación server-side de pertenencia; tarea sin asignar al cargar horas → autoasignación al usuario; el selector solo muestra propias \+ sin asignar.

**Aislamiento:** `listTasksByProject` es compartido con Proyectos → el filtro del selector se aplicó en la página de horas (usando el `userId` de sesión), **sin tocar la firma compartida**.

**Nota out-of-scope (sin tocar, bajo riesgo, decisión de Valentino de dejarlo):** `updateTimeEntry` deja a un admin **editar** las horas de una entry ya existente (no puede reasignar user/task). El bug arreglado era el de *crear*; el de *editar* quedó sin el mismo guard de pertenencia. Candidato si se quiere endurecer.

---

## 2\. Rediseño del display (jerarquía miembro → proyecto → tareas)

El display de tareas en Equipo se veía plano y desprolijo. Se rediseñó con la jerarquía que ya funciona bien en Proyectos (usada como referencia visual, aprobada por Valentino).

| SHA | Qué resolvió |
| :---- | :---- |
| `7f5cf97` | **(1ª ronda)** Primer pulido del display de carga por miembro. |
| `38edcaa` | **(2ª ronda)** Rediseño jerárquico completo: cada miembro → sus **proyectos colapsables** (colapsados por defecto, porque es mucha info) → al expandir, las **task cards** de ese miembro en ese proyecto con horas reales/estimadas (rojo si excede el estimado), cantidad de registros (time entries) y estado. Glassmorphism dark consistente con Proyectos. |

**Importante:** se enriqueció la query `assignedTasks` existente (agregó `estimatedHours` \+ `osTimeEntries{hours}`) en vez de crear una query nueva — decisión aprobada explícitamente. No se tocó ninguna otra superficie.

---

## 3\. Ajuste de hover (lote transversal)

- Hover aplicado a las stat cards de cada miembro (Tareas activas / Esta semana / Este mes), con el patrón único compartido.  
- **Ajuste de espaciado (no hover):** el header colapsable de cada proyecto dentro de un miembro estaba **pegado** a la primera tarea (sin separación). Se agregó margen para que respiren.  
- (Detalle del lote de hover y el fix de nitidez: registro Transversal Operaciones.)

---

## 4\. Verificado a ojo (humano, en :3000)

- **Horas:** el selector muestra solo tus tareas \+ las sin asignar (no las de otros); registrar en una sin asignar te la autoasigna; registrar en una de otro está rechazado (ni aparece, y el guard server-side se mantiene).  
- **Display:** miembro → proyectos colapsables → al expandir, tareas con horas/registros/estado; horas sobre estimado en rojo. Prolijo y consistente con Proyectos.  
- **Hover:** stat cards con el efecto; header de proyecto ya no pegado a la primera tarea.

---

## 5\. Deuda / pendiente

- **`updateTimeEntry` sin guard de pertenencia** (out-of-scope, bajo riesgo — ver §1).  
- Los componentes que comparte con Proyectos (`team/_actions/*`) siguen siendo zona de coordinación: cualquier cambio futuro a Task/TimeEntry impacta ambos módulos.

---

## 6\. Lecciones

- **Equipo y Proyectos son inseparables.** Comparten el CRUD de `OsTask`/`OsTimeEntry` (`team/_actions/*`, múltiples import sites). Por eso Equipo nunca fue un lane aislado: su trabajo va en main, secuencial, con cuidado de no romper el contrato que Proyectos consume.  
- **El bug de horas era de autorización, no cosmético.** Un fix así no se delega a autoaprobación de un agente — la regla de "quién puede registrar horas de quién" es una decisión de negocio. Se definió primero, se implementó después.  
- **Filtrar en la página, no en la firma compartida.** Para no romper Proyectos, el filtro del selector se hizo donde se consume (`userId` de sesión), no cambiando `listTasksByProject`.  
- **Enriquecer la query existente \> crear una nueva**, cuando los datos viven en la misma relación (`assignedTasks` ganó campos, no se duplicó).
