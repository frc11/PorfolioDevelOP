/**
 * Sistema de diseño del sitio público — rediseño B1.
 *
 * Dirección: "instrumento de precisión, editorial". Base monocroma con
 * inversión de tema por sección, superficies planas y quietas (radio 0, borde
 * 1px, sin glassmorphism), relieve táctil SOLO en lo interactivo, un acento por
 * servicio en dosis mínimas.
 *
 * Estado: construido y expuesto en `/styleguide`. Todavía no lo consume ninguna
 * sección real del sitio — eso arranca en B2, después del Gate 1.
 */

export { SectionShell, type SectionTheme } from './SectionShell'
export { Eyebrow } from './Eyebrow'
export { ChapterLabel } from './ChapterLabel'
export { DisplayHeading } from './DisplayHeading'
export { Subhead } from './Subhead'
export { Lead } from './Lead'
export { CtaButton } from './CtaButton'
export { Surface } from './Surface'
export { DataStat } from './DataStat'
export { MonoLabel } from './MonoLabel'
export { RuleDivider } from './RuleDivider'
export {
  SERVICE_ACCENTS,
  accentTextClass,
  accentBgClass,
  accentBorderClass,
  type ServiceAccent,
} from './accent'
