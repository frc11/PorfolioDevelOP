/**
 * EmptyStateMuted — canon ÚNICO de empty state para LISTAS VACÍAS del portal
 * (cliente + admin): borde punteado + superficie muy tenue, ícono muted SIN glow,
 * título `font-medium text-zinc-300`, hint `text-zinc-500`.
 *
 * Es un re-export con nombre/ubicación neutros de `ResultEmptyState` (la implementación
 * vive ahí — una sola fuente de verdad). Universal (server + client): sin 'use client'
 * ni hooks → el ícono se pasa como COMPONENTE (`icon={Mail}`) sin cruzar el boundary RSC.
 *
 * Reemplaza el USO del `ui/EmptyState` glowy (FROZEN) en listas vacías; el primitivo
 * frozen NO se edita. El CTA se pasa como `children` (Link/form/a) → la acción queda
 * intacta. Para los botones usar `emptyMutedCtaCls` / `emptyMutedCtaSecondaryCls`.
 */
export {
  ResultEmptyState as EmptyStateMuted,
  resultEmptyCtaCls as emptyMutedCtaCls,
  resultEmptyCtaSecondaryCls as emptyMutedCtaSecondaryCls,
} from '@/components/dashboard/results/_shared/ResultEmptyState'
