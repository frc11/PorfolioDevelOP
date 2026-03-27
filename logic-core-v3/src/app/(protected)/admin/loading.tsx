export default function AdminLoading() {
  return (
    <div className="grid gap-4">
      <div className="admin-surface h-28 animate-pulse rounded-[28px]" />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="admin-surface h-40 animate-pulse rounded-[28px] xl:col-span-2" />
        <div className="admin-surface h-40 animate-pulse rounded-[28px]" />
      </div>
      <div className="admin-surface h-80 animate-pulse rounded-[28px]" />
    </div>
  )
}
