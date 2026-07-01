import { Skeleton } from '@/components/ui'

/**
 * Skeleton de la pantalla del lead (3.7). Refleja el render REAL post-3.1: la
 * cabecera del lead, y dentro del wizard el rail (DossierStepper) + el cartel de
 * dirección (PasoActualBanner) como PROTAGONISTA —el «qué hacer ahora» en modo
 * dirección, igual que el foco es protagonista en la home (2.4)— y recién después
 * las cards de los pasos. El skeleton anterior dibujaba una sola barra indistinta
 * donde ahora van el rail Y el cartel: al cargar mostraba una silueta que no se
 * parecía al render (el cartel de dirección no aparecía). Acá la silueta coincide.
 */
export default function SetterLeadLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando el lead">
      {/* Cabecera del lead: volver + título + meta + links. */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Wizard: rail + cartel de dirección (protagonista) + pasos. */}
      <div className="space-y-5">
        {/* El rail de fases. */}
        <Skeleton className="h-8 rounded-lg" />
        {/* El cartel «tu paso ahora» — protagonista del modo dirección. */}
        <Skeleton className="h-[92px] rounded-2xl" />
        {/* La ficha / el paso activo, y un par de pasos atenuados. */}
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  )
}
