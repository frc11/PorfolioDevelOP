import { Skeleton } from '@/components/ui/Skeleton'

export default function FacturacionLoading() {
  return (
    <div className="flex w-full flex-col gap-6 pb-20">
      {/* Plan card + invoice history */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl lg:col-span-2" />
      </div>

      {/* Billing info */}
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  )
}
