export default function DashboardLoading() {
    return (
        <div className="flex flex-1 items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div
                    className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin"
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                    Cargando
                </span>
            </div>
        </div>
    )
}
