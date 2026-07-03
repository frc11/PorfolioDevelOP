import { Skeleton } from '@/components/ui'

/**
 * Skeleton del manual paso-por-pantalla: espeja el layout-tipo real (cabecera
 * + instrucción protagonista + las tres zonas + navegación), así la silueta
 * coincide con lo que carga — mismo criterio que el skeleton del wizard (3.7).
 */
export default function ManualDelLeadLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Cargando el manual del lead">
      {/* Cabecera: volver + manual · negocio. */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* La instrucción de la pantalla — protagonista. */}
      <Skeleton className="h-[120px] rounded-2xl" />

      {/* Las tres zonas del layout-tipo (contexto / munición / registro). */}
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />

      {/* Navegación (fases / completadas). */}
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  )
}
