// Clase de <textarea> que matchea visualmente el <Input> compartido de @/components/ui
// (rounded-xl, surface bg-white/[0.02], border-white/10, focus cyan). No existe un
// componente Textarea en el design system, así que se centraliza la clase acá para que
// los textareas del wizard (y el ExpandableTextField) queden consistentes con el resto.
export const TEXTAREA_CLASS =
  'w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 transition-colors focus:border-cyan-400/30 focus:outline-none resize-y'
