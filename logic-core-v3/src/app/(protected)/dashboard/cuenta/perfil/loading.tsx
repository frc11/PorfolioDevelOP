import { Skeleton } from '@/components/ui/Skeleton'

export default function PerfilLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header banner */}
      <Skeleton className="h-28 w-full rounded-3xl" />

      {/* Datos de empresa | Datos de contacto */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>

      {/* Seguridad | Preferencias */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-60 w-full rounded-3xl" />
        <Skeleton className="h-60 w-full rounded-3xl" />
      </div>

      {/* Plan + Zona de peligro */}
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>
  )
}
