import { Skeleton } from '@/components/ui'

/**
 * Skeleton de la home del setter (2.4). Refleja el MODO DIRECCIÓN (2.1a), no el
 * tablero viejo: un PageHeader, el foco como protagonista (una sola tarjeta alta)
 * con su línea "Después: …", y la cartera secundaria colapsada. El skeleton
 * anterior dibujaba el marcador de 5 StatCards + grilla de 4 cards que 2.1a/2.3
 * borraron — al cargar mostraba una silueta que no se parecía a lo que aparecía
 * (flash incoherente). Acá la silueta coincide con el render real.
 */
export default function SetterLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando tu día">
      {/* PageHeader: eyebrow + título + descripción. */}
      <div className="space-y-2 pt-2 sm:pt-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* El foco: el protagonista — una sola tarjeta alta (un lead a la vez). */}
      <div className="space-y-3">
        <Skeleton className="h-[256px] rounded-2xl sm:h-[268px]" />
        {/* "Después: …" — el próximo de la cola. */}
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>

      {/* La cartera completa queda accesible pero secundaria (colapsada). */}
      <Skeleton className="h-[50px] rounded-2xl" />
    </div>
  )
}
