/**
 * Índice de Mensajes = panel derecho "sin selección". La lista vive en el layout
 * persistente (messages/layout.tsx). En desktop muestra este placeholder; en
 * mobile el shell lo oculta y deja solo la lista.
 */
export default function AgencyOsMessagesPage() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-6 text-center text-sm text-white/40">
      Seleccioná una conversación para ver el historial.
    </div>
  )
}
