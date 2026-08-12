// Los dos avatares 3D salen de acá SOLO por su wrapper diferido. Reexportar
// `NeuroAvatar` / `LegacyNeuroAvatar` / `LegacyNeuroAvatarAdapter` directo
// reinstala la arista estática a `three` + R3F: este barrel viaja entero en el
// árbol del widget de chat, y webpack entonces resuelve el `dynamic()` contra
// chunks que ya estaban cargados (`files: []` en react-loadable-manifest).
// Para usarlos eager, importarlos por ruta directa.
export { NeuroAvatarLazy, LegacyNeuroAvatarLazy } from './HeavyAvatarsLazy'
export { MonogramAvatar } from './MonogramAvatar'
export { PulseAvatar } from './PulseAvatar'
export { GeometricAvatar } from './GeometricAvatar'
export { AvatarRenderer } from './AvatarRenderer'
export { AvatarPicker } from './AvatarPicker'
export {
  AVATAR_STYLE_SCHEMA,
  CLIENT_AVATAR_STYLE_SCHEMA,
  AVATAR_ESCAPE_HATCHES,
  isRegisteredAvatarId,
} from './avatarStyleSchema'
export { mapStateToLegacyProps, hexToContextColor } from './legacyStateMapper'
export {
  AVATAR_REGISTRY,
  AVATAR_IDS,
  DEFAULT_AVATAR_ID,
  getAvatar,
  getAvatarOrDefault,
  getAvatarRenderSize,
} from './registry'
export type {
  AvatarCoreState,
  AvatarWeight,
  AvatarComponent,
  AvatarComponentProps,
  AvatarKindId,
  AvatarRegistryEntry,
  NeuroAvatarProps,
  NeuroAvatarState,
} from './types'
export type { AvatarRendererProps } from './AvatarRenderer'
export type { AvatarPickerProps } from './AvatarPicker'
export type { LegacyAvatarProps } from './legacyStateMapper'
