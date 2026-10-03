/**
 * [NOCTURNO] B · EL PROYECTO DE EJEMPLO — el sitio de «Tu negocio» en curso, con sus tareas (la forma de
 * `SerializedTask` de `components/dashboard/ProjectTaskTabs.tsx`). Las fechas son relativas a cuando se mira; sin monto
 * (en la landing no hay precios). Lo que se mueve solo: el equipo termina una tarea y deja una entrega esperando la
 * aprobación del dueño.
 */
export type EstadoDeLaTarea = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Aprobacion = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | null

export interface TareaDeEjemplo {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly status: EstadoDeLaTarea
  /** En cuántos días vence (negativo: venció). */
  readonly venceEnDias: number | null
  readonly approvalStatus: Aprobacion
}

export const PROYECTO_DE_EJEMPLO = {
  nombre: 'Sitio web de Tu negocio',
  descripcion: 'El sitio nuevo con la tienda, el chatbot y tu panel, para que vendas también cuando el local está cerrado.',
  tipo: 'Sitio web + chatbot',
  /** Hace cuántas semanas arrancó y en cuántas se entrega. */
  inicioHaceSemanas: 5,
  entregaEnSemanas: 3,
} as const

export const TAREAS_DE_EJEMPLO: readonly TareaDeEjemplo[] = [
  { id: 't-diseno', title: 'Diseño de la portada', description: 'La portada con la foto del local y los productos destacados.', status: 'DONE', venceEnDias: -20, approvalStatus: 'APPROVED' },
  { id: 't-maquetacion', title: 'Maquetación', description: 'Todas las páginas armadas a partir del diseño aprobado.', status: 'DONE', venceEnDias: -9, approvalStatus: 'APPROVED' },
  { id: 't-cms', title: 'Integración CMS', description: 'Para que cambies textos y fotos desde tu panel.', status: 'IN_PROGRESS', venceEnDias: 2, approvalStatus: null },
  { id: 't-frontend', title: 'Desarrollo frontend', description: 'Las páginas funcionando en la computadora y en el celular.', status: 'IN_PROGRESS', venceEnDias: 6, approvalStatus: null },
  { id: 't-seo', title: 'Optimización SEO', description: 'Títulos, descripciones y velocidad para que te encuentren en Google.', status: 'TODO', venceEnDias: 12, approvalStatus: null },
  { id: 't-productos', title: 'Carga de productos', description: 'Los productos de la tienda con sus fotos y descripciones.', status: 'TODO', venceEnDias: 15, approvalStatus: null },
  { id: 't-capacitacion', title: 'Capacitación del panel', description: 'Una charla corta para que uses tu panel desde el primer día.', status: 'TODO', venceEnDias: 20, approvalStatus: null },
]

/** Lo que pasa solo, uno por paso: el equipo termina el CMS y entrega el frontend para que lo apruebes. */
export const AVANCES_DE_EJEMPLO: readonly { readonly id: string; readonly status: EstadoDeLaTarea; readonly approvalStatus: Aprobacion }[] = [
  { id: 't-cms', status: 'DONE', approvalStatus: null },
  { id: 't-frontend', status: 'DONE', approvalStatus: 'PENDING_APPROVAL' },
]

export const RITMO_DEL_PROYECTO = { pasoMs: 3000 } as const
