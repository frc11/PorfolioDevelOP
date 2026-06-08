export { NeuroAvatar } from './NeuroAvatar'
export { LegacyNeuroAvatar } from './LegacyNeuroAvatar'
export { LegacyNeuroAvatarAdapter } from './LegacyNeuroAvatarAdapter'
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
