import { Skeleton } from '@/components/ui'

/**
 * Skeleton de la ruta del lead (5.6). La raíz ya no renderiza el wizard — es un
 * redirect al manual — así que la silueta espeja el layout-tipo del manual
 * (cabecera + instrucción protagonista + zonas), igual que `manual/loading.tsx`:
 * lo que el setter ve mientras la cadena raíz → manual → pantalla resuelve.
 */
export default function SetterLeadLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Abriendo el manual del lead">
      {/* Cabecera: volver + eyebrow + título + badges. */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* La instrucción protagonista + las zonas del layout-tipo. */}
      <Skeleton className="h-[120px] rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  )
}
